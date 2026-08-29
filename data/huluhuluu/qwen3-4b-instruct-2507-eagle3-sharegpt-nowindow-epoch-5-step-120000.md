# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-120000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) EAGLE3 para decodificacion especulativa, entrenado por el usuario huluhuluu sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su unica funcion es acelerar la inferencia del modelo objetivo prediciendo multiples tokens por paso, que el modelo objetivo valida o rechaza. El entrenamiento se realizo con SpecForge en modo online (online EAGLE3) sobre datos ShareGPT limpios, durante 10 epocas y 231.810 pasos de optimizacion.

El checkpoint publicado corresponde al paso 120.000 (epoch 5) y forma parte de una coleccion de 47 checkpoints que cubren desde el paso 5.000 hasta el 231.810. Con solo 202,7 millones de parametros (una unica capa decoder con hidden size 2560), el modelo es extremadamente ligero en comparacion con el modelo objetivo de 4.000 millones de parametros, lo que lo hace adecuado para entornos donde la VRAM adicional es limitada.

Su relevancia actual radica en que Qwen3-4B-Instruct-2507 es un modelo instruct multilingue de ultima generacion y la decodificacion especulativa con EAGLE3 puede reducir la latencia de inferencia de forma significativa en despliegues de produccion con SGLang, sin alterar la distribucion de salida del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 (~202 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (maxima secuencia de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (unico formato publicado) |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `LlamaForCausalLMEagle3` con una unica capa decoder, hidden size 2560, dimension intermedia 9728, 32 cabezas de atencion, 8 cabezas clave/valor, vocabulario de borrador de 32.000 tokens y vocabulario objetivo de 151.936 tokens. Los pesos estan en bfloat16. La atencion del borrador usa `sdpa` (scaled dot-product attention) y no se aplica ventana deslizante.

El entrenamiento se realizo con SpecForge en modo online EAGLE3 sobre datos ShareGPT limpios (fuente local, sin revision registrada). Los hiperparametros principales incluyen: batch global efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y posterior decaimiento coseno, weight decay 0,0, gradiente maximo 0,5, longitud maxima de secuencia 2048, longitud TTT de EAGLE3 de 7, y backend objetivo SGLang con flashinfer. El entrenamiento completo duro 10 epocas y 231.810 pasos, con guardado de checkpoints cada 5.000 pasos. No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: genera multiples tokens de borrador por paso que el modelo objetivo valida, reduciendo el numero de pasos de decodificacion autoregresiva.
- Preservacion de la distribucion de salida del modelo objetivo: al ser validado por el modelo Qwen3-4B-Instruct-2507, la calidad de las respuestas finales no se degrada respecto a la decodificacion estandar.
- Integracion nativa con SGLang: se usa como ruta de borrador especulativo (`--speculative-draft-model-path`) con el algoritmo EAGLE3.
- Configuracion flexible del arbol de borrador: permite ajustar `speculative-num-steps`, `speculative-eagle-topk` y `speculative-num-draft-tokens` segun la carga de trabajo.
- No es un modelo de chat: no genera respuestas por si mismo ni soporta tool calling, razonamiento o capacidades multilingues de forma independiente; hereda las capacidades del modelo objetivo.
- Entrenamiento sobre ShareGPT: optimizado para datos conversacionales en ingles (ShareGPT elimina datos no ingleses), por lo que su eficacia en otros idiomas puede ser menor.

## Casos de uso

- Servicio de chat en produccion con SGLang: desplegar Qwen3-4B-Instruct-2507 con este borrador EAGLE3 como ruta especulativa reduce la latencia por peticion en escenarios de conversacion multi-turno, especialmente cuando el batch size es moderado y la longitud de secuencia se mantiene por debajo de 2048 tokens.
- Reduccion de costes de inferencia: al necesitar menos pasos autoregresivos del modelo de 4B, se reduce el tiempo de computacion por token generado, lo que permite servir mas peticiones con la misma infraestructura GPU.
- Despliegue en entornos con VRAM limitada: el borrador ocupa aproximadamente 0,4 GB en bf16, por lo que anadirlo al modelo objetivo (unos 8-9 GB en bf16) sigue siendo viable en GPUs de consumo como una RTX 4090 de 24 GB.
- Evaluacion de configuraciones especulativas: los 47 checkpoints disponibles permiten experimentar con distintos puntos de entrenamiento (pasos 5.000 a 231.810) para encontrar el equilibrio optimo entre tasa de aceptacion de tokens y sobrecarga de computacion.
- Benchmarking de latencia: los parametros de arbol (`--speculative-num-steps 3`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 4`) son valores iniciales que deben ajustarse midiendo el throughput y la latencia del workload especifico.
- Reanudacion de entrenamiento: el archivo `training_state.pt` incluido en cada checkpoint permite reanudar el entrenamiento desde un paso concreto, util para investigacion sobre metodos de decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad durante el entrenamiento. No se dispone de datos de tasa de aceptacion de tokens, latencia media ni throughput para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 0,4 GB en bf16 (202 M parametros).
- VRAM total estimada del despliegue completo: unos 8-9 GB para Qwen3-4B-Instruct-2507 en bf16 mas 0,4 GB del borrador; si el modelo objetivo se cuantiza (por ejemplo, a 4 bits), el total puede reducirse a unos 3-4 GB.
- GPUs compatibles: cualquier GPU con al menos 12 GB de VRAM puede alojar el despliegue completo en bf16 (por ejemplo, RTX 3090, RTX 4090, A10, L4). Para entornos de produccion con alta concurrencia se recomiendan A100, H100 o L40S.
- El modelo es compatible con GPUs de consumo: una RTX 4090 de 24 GB puede ejecutar el modelo objetivo en bf16 con el borrador y dejar margen para KV cache.
- Opciones de despliegue: SGLang con backend flashinfer (unica via documentada en la model card). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; la model card indica que los parametros de arbol deben ser evaluados para cada carga de trabajo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de borrador EAGLE3 para Qwen3-4B-Instruct-2507 publicados en la informacion proporcionada. Como alternativa conceptual, la decodificacion especulativa tambien puede implementarse con metodos como Medusa o decodificacion especulativa clasica con un modelo mas pequeno, pero no hay datos comparativos publicados en las fuentes consultadas. La comparativa directa con otros borradores entrenados sobre el mismo modelo objetivo no esta disponible.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como modelo independiente no produce respuestas utiles; debe emparejarse exclusivamente con la familia de modelos objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Sin metricas de evaluacion: no se registraron metricas de calidad, tasa de aceptacion ni seguridad durante el entrenamiento; el rendimiento real debe medirse en el entorno de despliegue.
- Datos de entrenamiento en ingles: ShareGPT elimina datos no ingleses, por lo que la eficacia del borrador en otros idiomas puede verse reducida.
- Longitud de contexto limitada: el entrenamiento se realizo con secuencias de maximo 2048 tokens; para contextos mas largos, la tasa de aceptacion del borrador puede degradarse.
- `training_state.pt` es un archivo de estado de entrenamiento: solo debe deserializarse en un entorno de confianza, ya que contiene estado de optimizador y argumentos de entrenamiento.
- Sin ventana deslizante: la model card indica que la ejecucion estandar no establece limite de ventana deslizante, lo que puede afectar al rendimiento con secuencias muy largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-120000
- Coleccion de checkpoints (47 repositorios): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Checkpoint hermano (epoch 7, paso 185.000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementacion oficial de EAGLE (Qwen3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
