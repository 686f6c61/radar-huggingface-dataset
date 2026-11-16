# CharlesDDDD/DRV-Qwen3-1.7B-loop4-run1

## Resumen

DRV-Qwen3-1.7B-loop4-run1 es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B-Base mediante continued pretraining con una arquitectura de transformer con recurrencia en profundidad (looped transformer). Lo desarrolla el usuario CharlesDDDD dentro de la coleccion Depth Recurrent Vector, y su proposito es obtener mas computacion por token sin incrementar el numero de parametros: las capas 8-19 (12 de las 28 capas) forman un bloque que se ejecuta cuatro veces consecutivas con los mismos pesos.

El modelo parte de Qwen3-1.7B-Base y se entrena durante aproximadamente 20B tokens sobre una mezcla de web, PDF, codigo y trayectorias de agentes, con secuencias de 16K tokens. La conexion entre pasadas se realiza mediante una compuerta aprendida por canal (`model.loop_gate`), de modo que con g=0 el modelo equivale exactamente al Qwen3 original.

Es relevante para investigadores interesados en tecnicas de profundidad recurrente aplicadas a modelos de escala pequena, ya que permite experimentar con computacion adaptativa por token (elegir el numero de pasadas en inferencia) manteniendo un tamano de 1.720.577.024 parametros. Es un modelo base, sin instruction tuning, y su arquitectura no esta soportada por vLLM ni por otros motores de serving habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con recurrencia en profundidad (bloque de 12 capas repetido 4 veces) |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-1.7B (28 capas). Las capas 0-7 se ejecutan una sola vez antes del bloque recurrente, las capas 8-19 forman el bloque que se repite cuatro veces con los mismos pesos, y las capas 20-27 se ejecutan una vez despues. La primera pasada del bloque lee la salida `e` de la capa 7; las pasadas posteriores leen `e + g * (salida de la pasada anterior - e)`, donde `g` es un escalar aprendido por canal de hidden state (`model.loop_gate`). Con g=0 el modelo colapsa exactamente al Qwen3 original, lo que facilita el analisis de ablacion.

El entrenamiento consistio en continued pretraining de aproximadamente 20B tokens (una pasada sobre una mezcla de web, PDF, codigo y trayectorias de agentes), con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. Se aplica una perdida auxiliar pequena (peso 0.0555) sobre la prediccion de cada pasada intermedia, de forma que detener la recurrencia antes de la cuarta pasada sigue produciendo salidas razonables. La implementacion en transformers reproduce el codigo de entrenamiento con una diferencia de hasta 0.003 nats de loss en cualquier numero de pasadas.

## Capacidades

- Generacion de texto autoregresiva como modelo base (sin instruction tuning).
- Computacion adaptativa por token: el numero de pasadas del bloque recurrente es configurable en inferencia mediante el parametro `num_loops`.
- Razonamiento y modelado de lenguaje derivados del pretraining de Qwen3-1.7B-Base.
- Soporte de codigo y trayectorias de agentes por la composicion del dataset de entrenamiento (web, PDF, codigo y agent-trajectory mix).
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion).
- Tool calling / function calling: no disponible (modelo base, sin instruction tuning).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en profundidad recurrente: comparar el efecto del numero de pasadas (1 a 8) sobre la loss en un mismo checkpoint, usando el parametro `num_loops` para estudiar computacion adaptativa por token.
- Ablaciones controladas: gracias a que g=0 recupera Qwen3-1.7B exactamente, sirve para aislar el efecto del bloque recurrente frente al modelo base sin modificar el resto de la receta.
- Continued pretraining sobre dominio propio: al ser un modelo base con licencia apache-2.0, puede usarse como punto de partida para fine-tuning en tareas especificas de investigacion.
- Experimentos de eficiencia: evaluar si cuatro pasadas sobre 12 capas ofrecen mejor relacion calidad/computacion que un modelo denso equivalente con mas parametros.
- Generacion de texto en pipelines de investigacion: integracion via transformers con `trust_remote_code=True` para prototipos que no requieran serving de alta concurrencia.
- Estudio de KV cache: cada pasada mantiene su propia cache, lo que permite analizar el compromiso entre memoria y calidad en funcion del numero de pasadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta loss de test sobre el conjunto held-out de la mezcla de entrenamiento:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Loss | 1.2026 | 1.1503 | 1.1419 | 1.1195 | 1.1309 | 1.1362 | 1.1215 | 1.1308 |

Referencia: el modelo control sin looping obtiene 1.1460. El mejor resultado se alcanza con 4 pasadas (1.1195), que es el numero usado en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, un modelo de 1.720.577.024 parametros en bfloat16 requiere aproximadamente 3,4 GB solo para pesos, a lo que se suma la cache KV.
- Cache KV: cada pasada mantiene su propia cache; con 3 pasadas la cache es aproximadamente 1,9x la de un Qwen3-1.7B estandar.
- GPU recomendadas: no disponible; por tamano, cabe en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en bfloat16, aunque no se han publicado mediciones.
- Cabe en consumer GPU: previsiblemente si, dado el tamano de pesos; sin datos medidos en la informacion disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Serving |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop4-run1 | 1.720.577.024 | 16K | Recurrencia en profundidad (4 pasadas) | apache-2.0 | Solo transformers |
| Qwen/Qwen3-1.7B-Base | no disponible en la informacion | no disponible en la informacion | Transformer denso estandar | no disponible en la informacion | vLLM, transformers, etc. |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | no disponible en la informacion | 16K | Control sin looping del mismo entrenamiento | no disponible en la informacion | Solo transformers |

El modelo control sin looping obtiene una loss de test de 1.1460 frente a 1.1195 del modelo con 4 pasadas, lo que indica una mejora de calidad atribuible a la recurrencia en profundidad con el mismo numero de parametros.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni esta alineado para conversacion.
- No soportado por vLLM ni por otros motores de serving; el despliegue en produccion de alta concurrencia no es viable actualmente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.
- La cache KV crece con el numero de pasadas (aproximadamente 1,9x con 3 pasadas frente a Qwen3-1.7B estandar), aumentando el coste de memoria en contextos largos.
- Idiomas soportados no especificados; el comportamiento multilingue no esta documentado.
- Riesgo de alucinacion propio de un modelo base entrenado principalmente sobre datos web, PDF y codigo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Sin datos de benchmarks estandar ni mediciones de latencia/throughput publicadas.
- El modelo se creo y actualizo el 2026-11-16 y registra 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop4-run1
- Coleccion Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo control sin looping: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
