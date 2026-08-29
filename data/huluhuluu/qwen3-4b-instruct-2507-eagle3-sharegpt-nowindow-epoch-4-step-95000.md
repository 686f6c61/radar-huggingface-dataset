# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-95000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-95000` es un **draft model** (modelo de borrador) para decodificación especulativa, entrenado con el algoritmo EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo base al predecir secuencias de tokens que luego el modelo objetivo valida o rechaza, reduciendo la latencia por token generado. Lo desarrolla el usuario huluhuluu mediante la herramienta SpecForge, que permite entrenamiento online del draft model durante el servicio.

El checkpoint concreto corresponde a la época 4, paso 95000 de un entrenamiento de 10 épocas y 231810 pasos. La arquitectura es una variante de `LlamaForCausalLMEagle3` con una sola capa de decoder y 202,7 millones de parámetros, muy inferior a los 4.000 millones del modelo base. Está publicado en formato safetensors con pesos en bfloat16 y licencia Apache 2.0. Su relevancia radica en que permite desplegar Qwen3-4B-Instruct-2507 con un throughput mayor y menor latencia en entornos de producción que usen SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, 32 cabezas de atencion, 8 cabezas KV) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; entrenado con max seq 2048) |
| Tipos de cuantizacion | bfloat16 (safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft network EAGLE3, una arquitectura ligera que predice el siguiente token basandose en la representacion oculta del modelo base. En concreto, usa una sola capa de decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atencion y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo del modelo base es de 151936. La atencion del draft se implementa con `sdpa` y no se aplica ventana deslizante (opcion "NoWindow").

El entrenamiento se realizo con el metodo online EAGLE3 de SpecForge, usando datos ShareGPT limpios (fuente local, sin revision registrada). Los hiperparametros principales incluyen: 10 epocas, 231810 pasos de optimizacion, batch efectivo de 4 (batch por dispositivo 1, paralelismo de datos 4, sin acumulacion de gradientes), learning rate 1e-4 con warmup lineal del 1,5% y posterior decaimiento coseno, weight decay 0,0, gradiente maximo 0,5 y longitud maxima de secuencia 2048. El parametro TTT length (test-time training) es 7 y el backend objetivo es SGLang con flashinfer. No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento.

## Capacidades

- **Decodificacion especulativa**: genera secuencias de borrador de tokens (tipicamente 4-7) que el modelo base Qwen3-4B-Instruct-2507 valida, acelerando la generacion autoregresiva.
- **Integracion con SGLang**: disenado para usarse como ruta de borrador especulativo en SGLang mediante el algoritmo EAGLE3, con parametros configurables como `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- **Compatibilidad estricta con el modelo base**: debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`; no funciona con otras variantes de Qwen3.
- **Sin capacidades de chat**: no genera respuestas de forma autonoma, no soporta tool calling, razonamiento, vision ni audio. Todas las capacidades funcionales corresponden al modelo base al que acompaña.
- **Multilingue**: el modelo base Qwen3-4B-Instruct-2507 es multilingue, por lo que el draft model hereda esa cobertura, aunque el entrenamiento con ShareGPT (mayoritariamente ingles) puede limitar el rendimiento en otros idiomas.

## Casos de uso

- **Despliegue de Qwen3-4B-Instruct-2507 en produccion con SGLang**: el caso principal. Se lanza el servidor SGLang con el modelo base y se especifica este checkpoint como ruta de borrador EAGLE3, reduciendo la latencia de generacion en cargas de trabajo de chat o agentes.
- **Reduccion de costes de inferencia**: al acelerar la generacion sin cambiar el modelo base, se puede servir el mismo volumen de peticiones con menos GPUs o con GPUs mas pequenas, reduciendo el coste por token.
- **Optimizacion de latencia para aplicaciones interactivas**: en asistentes conversacionales o herramientas de codigo en tiempo real, la menor latencia por token mejora la experiencia del usuario final.
- **Benchmarking de configuraciones especulativas**: el checkpoint permite experimentar con distintos valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` para encontrar la configuracion optima para cada carga de trabajo.
- **Investigacion en decodificacion especulativa**: los 47 checkpoints publicados (de la epoca 0 a la 9) sirven para estudiar la evolucion del draft model durante el entrenamiento y su impacto en la tasa de aceptacion de tokens.
- **Formacion de equipos de ML**: como ejemplo de entrenamiento online con SpecForge, es un recurso didactico para entender el pipeline de EAGLE3 y su integracion con SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no se registraron metricas de evaluacion ni de seguridad". No se proporcionan datos de tasa de aceptacion, latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: el draft model ocupa aproximadamente 0,4 GB en bfloat16 (202,7M parametros). La VRAM total necesaria es la del modelo base (Qwen3-4B-Instruct-2507) mas este overhead, tipicamente entre 8 y 12 GB segun la cuantizacion del modelo base.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM puede alojar el draft model junto al modelo base en bfloat16. Para un despliegue con SGLang se recomienda una GPU de datacenter (A10, A100, L4) o una consumer de gama alta (RTX 3090, RTX 4090) si el modelo base se cuantiza.
- **Compatibilidad con consumer GPU**: si, el draft model cabe en GPUs consumer, pero el modelo base completo en bfloat16 requiere ~8 GB, por lo que una RTX 3090/4090 es suficiente.
- **Opciones de despliegue**: SGLang (unica via oficial documentada) con backend flashinfer. No se mencionan integraciones con vLLM, llama.cpp ni Ollama.
- **Latencia y throughput**: no disponibles. Dependen de la configuracion especulativa, el hardware y la carga de trabajo; se recomienda realizar benchmarks propios.

## Comparativa con modelos similares

No hay modelos comparables publicados con el mismo proposito y arquitectura en la informacion disponible. Como referencia, se puede comparar con el propio modelo base sin decodificacion especulativa:

| Modelo | Parametros | Proposito | Latencia relativa | Licencia |
|---|---|---|---|---|
| Este draft model + Qwen3-4B-Instruct-2507 | 202M + 4B | Inferencia acelerada | Menor (esperada, sin datos) | Apache 2.0 |
| Qwen3-4B-Instruct-2507 solo | 4B | Chat/instruct | Mayor (sin especulacion) | Apache 2.0 |
| Otros draft models EAGLE3 para Qwen3 | no disponible | Decodificacion especulativa | no disponible | no disponible |

No se dispone de datos cuantitativos que confirmen la mejora de rendimiento.

## Limitaciones y advertencias

- **No es un modelo de chat**: usarlo como modelo autonomo produce resultados sin sentido. Debe emparejarse siempre con el modelo base Qwen3-4B-Instruct-2507.
- **Sin evaluacion de seguridad**: la model card indica que no se registraron metricas de evaluacion ni de seguridad. No hay garantias sobre sesgos, toxicidad o robustez del draft model.
- **Datos de entrenamiento limitados**: entrenado con ShareGPT, un dataset mayoritariamente en ingles. El rendimiento del draft model puede degradarse en otros idiomas, tal y como advierte la documentacion oficial de EAGLE.
- **Longitud de secuencia limitada en entrenamiento**: el entrenamiento uso max seq 2048, aunque el modelo base soporta contextos mayores. La tasa de aceptacion del draft model puede caer en secuencias largas.
- **Dependencia de SGLang**: la unica via de uso documentada es SGLang. No hay soporte confirmado para otros servidores de inferencia.
- **Checkpoint intermedio**: este repositorio corresponde a la epoca 4, paso 95000. No es necesariamente el checkpoint optimo; la coleccion incluye 47 candidatos y se recomienda evaluar cual ofrece mejor tasa de aceptacion para cada carga.
- **`training_state.pt`**: este archivo contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecucion de codigo arbitrario.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-95000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementacion oficial de EAGLE (Qwen3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Coleccion de checkpoints del autor (referencia): https://huggingface.co/huluhuluu (coleccion companion)
- Pagina del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Ficha del modelo base en AICHINA.news: https://aichina.news/models/Qwen/Qwen3-4B-Instruct-2507/
