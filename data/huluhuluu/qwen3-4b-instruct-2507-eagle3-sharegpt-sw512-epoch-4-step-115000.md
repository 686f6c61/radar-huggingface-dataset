# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-115000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) EAGLE3 para decodificacion especulativa, disenado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el autor huluhuluu mediante la herramienta SpecForge, con un entrenamiento online de tipo EAGLE3 sobre datos ShareGPT limpios. No es un modelo de chat autonomo: su unica funcion es generar tokens candidatos que el modelo grande verifica posteriormente, reduciendo la latencia de generacion en entornos de produccion.

El modelo tiene 202,7 millones de parametros (aproximadamente un 5 % del tamano del modelo objetivo) y utiliza una arquitectura de una sola capa decoder con atencion de ventana deslizante de 512 tokens. Esta pensado para desplegarse junto a Qwen3-4B-Instruct-2507 en SGLang con backend flashinfer. Su relevancia radica en que la decodificacion especulativa permite reducir el coste computacional por peticion sin degradar la calidad de las respuestas finales, un factor critico en servicios de inferencia de alta concurrencia.

Se publican 47 checkpoints en una coleccion companion, cada uno en un repositorio separado de Hugging Face. Este checkpoint concreto corresponde a `epoch_4_step_115000`. No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, 32 cabezas de atencion, 8 cabezas key/value, attention sliding window de 512 tokens) |
| Parametros totales | 202.700.416 (202,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de draft: 512 tokens; maximo de secuencia de entrenamiento: 2048 tokens |
| Tipos de cuantizacion | bfloat16 (no se documentan cuantizaciones adicionales) |
| Idiomas soportados | no disponible (datos de entrenamiento ShareGPT, mayoritariamente ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3 con una sola capa decoder, hidden size de 2560, intermediate size de 9728, 32 cabezas de atencion y 8 cabezas key/value. Usa atencion causal de ventana deslizante de 512 tokens y vocabularies de 32.000 tokens para el draft y 151.936 para el objetivo. Los pesos estan en bfloat16.

El entrenamiento se realizo con el metodo online EAGLE3/SpecForge sobre un dataset ShareGPT limpio en formato JSONL (fuente local, sin revision registrada). Se ejecutaron 10 epocas con 231.810 pasos de optimizador, learning rate de 1e-4 con warmup lineal del 1,5 % y posterior cosine annealing, weight decay de 0,0, gradiente maximo de 0,5 y batch efectivo de 4. La longitud maxima de secuencia fue de 2048 tokens, con EAGLE3 TTT length de 7 y backend objetivo SGLang con flashinfer. Cada checkpoint incluye `model.safetensors`, `config.json` y `training_state.pt` (este ultimo solo para reanudar entrenamiento en entornos de confianza).

## Capacidades

- Aceleracion de inferencia: genera tokens candidatos para verificacion por parte de Qwen3-4B-Instruct-2507 mediante decodificacion especulativa EAGLE3.
- Reduccion de latencia: al predecir multiples tokens por paso, reduce el numero de pasos autoregresivos del modelo grande.
- Compatibilidad con SGLang: se integra como ruta de draft especulativo en SGLang con backend flashinfer.
- Ventana deslizante de 512 tokens: limita la prediccion especulativa a ese rango, lo que reduce el coste computacional del draft.
- No es un modelo de chat: no genera respuestas finales por si mismo y no soporta tool calling, agentes ni razonamiento multi-paso de forma autonoma.

## Casos de uso

- Servicio de chat de baja latencia: desplegar junto a Qwen3-4B-Instruct-2507 en SGLang para reducir la latencia de generacion en aplicaciones conversacionales en tiempo real, donde cada milisegundo cuenta.
- Optimizacion de costes de GPU: al reducir los pasos de decodificacion del modelo grande, se disminuye el tiempo de ocupacion de GPU por peticion, lo que permite servir mas peticiones con los mismos recursos.
- Despliegue en entornos con VRAM limitada: el draft model ocupa aproximadamente 0,4 GB en bfloat16, por lo que puede acompanar al modelo objetivo de 4 B en GPUs con presupuesto de memoria ajustado.
- Ajuste de arboles de especulacion: permite experimentar con los tree settings de EAGLE3 en SGLang para encontrar la configuracion optima de aceptacion de tokens segun la carga de trabajo.
- Investigacion en decodificacion especulativa: los 47 checkpoints publicados (de epoch 0 a epoch 9) permiten estudiar la evolucion del entrenamiento online y reanudar desde cualquier paso.
- Evaluacion comparativa de configuraciones de ventana: sirve para medir el impacto de la ventana deslizante de 512 tokens frente a otras configuraciones de draft en terminos de tasa de aceptacion y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. El rendimiento real (tasa de aceptacion de tokens, latencia, throughput) debe medirse con benchmarks propios segun la carga de trabajo y la configuracion de arboles especulativos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en bfloat16 (202,7 M parametros); la VRAM total dependera del modelo objetivo Qwen3-4B-Instruct-2507 que se sirva junto al draft.
- GPU recomendadas: cualquier GPU compatible con SGLang y flashinfer; se recomienda NVIDIA con arquitectura Ampere o posterior (A100, H100, RTX 4090, L4).
- GPU de consumo: si, el draft model cabe en GPUs consumer como RTX 3060, RTX 4070 o RTX 4090, siempre que el modelo objetivo tambien quepa.
- Opciones de despliegue: SGLang con soporte EAGLE3 y backend flashinfer. No se documenta compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible; deben medirse con benchmarks propios para la carga de trabajo especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rol |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512 (este) | 202,7 M | 512 tokens (ventana de draft) | Apache-2.0 | Draft model para decodificacion especulativa |
| Qwen/Qwen3-4B-Instruct-2507 | 4 B | no disponible | Apache-2.0 | Modelo objetivo (chat instruct, sin thinking mode) |
| Otros checkpoints de la misma coleccion (epoch 1-9) | 202,7 M | 512 tokens (ventana de draft) | Apache-2.0 | Variantes del mismo draft model en distintos pasos de entrenamiento |

No se dispone de informacion sobre otros draft models EAGLE3 comparables (por ejemplo, los de la familia EAGLE-Qwen2) en los resultados de busqueda disponibles.

## Limitaciones y advertencias

- No es un modelo de chat autonomo: desplegarlo como modelo final producira resultados incorrectos o incompletos.
- No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento, por lo que no hay garantias de calidad ni de comportamiento seguro en produccion.
- Los datos de entrenamiento son ShareGPT limpio, mayoritariamente en ingles; la documentacion del proyecto EAGLE-Qwen3 advierte que ShareGPT sin datos no ingleses puede degradar el rendimiento del draft en otros idiomas.
- La ventana de draft de 512 tokens limita la capacidad de prediccion especulativa a ese rango; contenido con dependencias de largo alcance puede reducir la tasa de aceptacion.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza.
- No hay benchmarks publicados de latencia ni throughput; cualquier despliegue en produccion requiere validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada o reciente.

## Enlaces

- Repositorio de Hugging Face del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-115000
- Checkpoint epoch 1 step 30000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Checkpoint epoch 5 step 130000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-5-step-130000
- Repositorio oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
