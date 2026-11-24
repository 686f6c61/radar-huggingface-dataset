# haninmb/train_qewn3_final_r8

## Resumen

`haninmb/train_qewn3_final_r8` es un ajuste fino supervisado del modelo Qwen3-14B de Alibaba, desarrollado por el usuario haninmb, especializado en el analisis de herencia mendeliana a partir de perfiles de ADN de repeticiones cortas en tandem (STR). El modelo recibe un perfil genetico familiar (alelos del padre, la madre y el hijo por marcador) y devuelve un analisis de que marcadores no cumplen la herencia mendeliana, el tipo y direccion de la mutacion, el progenitor de origen probable y una clasificacion biologica o no biologica de la relacion de parentesco.

Tecnicamente se trata de un transformer denso de 14.768.307.200 parametros (14,8B) con una ventana de contexto de 16.384 tokens segun la configuracion de uso, entrenado mediante QLoRA (base en 4 bits, adaptadores LoRA de rango 8 y alpha 16) sobre 92.811 ejemplos durante una epoca. Los pesos publicados son el resultado de fusionar los adaptadores en el modelo base y guardarlos en 16 bits, lo que ocupa aproximadamente 30 GB en el repositorio.

Su relevancia es doble: por un lado, demuestra un caso de uso vertical muy especifico (analisis forense y de filiacion con STR) sobre un modelo generalista; por otro, documenta de forma inusualmente detallada el proceso de entrenamiento (hiperparametros, curvas de perdida, hardware, throughput), lo que facilita la reproducibilidad. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B), ajuste fino con QLoRA |
| Parametros totales | 14.768.307.200 (14,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en la configuracion de uso; 8.048 tokens de longitud maxima durante el entrenamiento |
| Tipos de cuantizacion | 16 bits (pesos publicados); 4 bits via bitsandbytes o Unsloth; GGUF disponible en repositorio separado |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en `haninmb/QWEN3_DNA_GGUF_v2` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de tipo decoder-only con atencion causal estandar (no se documentan innovaciones de atencion lineal ni decodificacion especulativa en la informacion disponible). El ajuste se realizo con QLoRA: el modelo base se carga en 4 bits y se entrenan adaptadores LoRA de rango 8, alpha 16 y dropout 0 sobre las proyecciones q, k, v, o, gate, up y down. Los adaptadores suponen 32,1 millones de parametros entrenables, un 0,22% del total. Tras el entrenamiento, los adaptadores se fusionaron en el modelo base y se publicaron en 16 bits.

El dataset es `haninmb/all_merged_families` (fichero `updates_prompts_all_merged_families_10_4v.jsonl`), con unos 93.700 ejemplos; se usaron 92.811 para entrenamiento y 938 como conjunto retenido (split del 1%, semilla 42). Cada ejemplo consta de un system prompt con las reglas de herencia y el formato de salida, un mensaje de usuario con el perfil STR familiar y una respuesta del asistente que fusiona los turnos `analysis` y `final` en una sola respuesta con secciones `Analysis:` y `Final Response:` (JSON). El rol `developer` se remapeo a `system`. El entrenamiento duro 117.839 segundos (unas 32 h 44 min) en una unica GPU de 32 GB de VRAM, con un pico reservado de unos 13 GB, 23.203 pasos de optimizador (batch efectivo 4), learning rate 2e-4 con decaimiento lineal, warmup de 500 pasos, AdamW de 8 bits, precision bf16, gradient checkpointing de Unsloth y semilla 3407. La perdida final fue de aproximadamente 0,068 (media movil de 0,073), calculada sobre la secuencia completa incluido el system prompt, por lo que no es comparable con perdidas calculadas solo sobre la respuesta.

## Capacidades

- Analisis de herencia mendeliana sobre perfiles STR: identifica marcadores con alelos incompatibles entre padre, madre e hijo.
- Clasificacion del tipo y direccion de mutacion (por ejemplo, ganancia o perdida de repeticiones) y del progenitor de origen probable.
- Emision de una clasificacion binaria biologica / no biologica de la relacion de parentesco.
- Salida estructurada: seccion `Analysis:` en texto y objeto JSON en `Final Response:`, lo que facilita el parseo en pipelines.
- Conversacion multi-turno mediante plantilla de chat de Qwen3, con rol `system` para las instrucciones.
- Generacion de texto en ingles; no se declaran capacidades multilingues.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de filiacion en laboratorios geneticos: el modelo procesa el perfil STR de una familia y devuelve que marcadores son compatibles y cuales no, reduciendo el trabajo manual de revision marcador a marcador.
- Triaje previo en estudios de paternidad: dada la salida JSON con la clasificacion biologica / no biologica y el progenitor de origen probable, se puede integrar como primer filtro antes de la revision por un experto.
- Deteccion de mutaciones en pruebas de parentesco: el modelo identifica el tipo y la direccion de la mutacion, util para distinguir incompatibilidades por mutacion de incompatibilidades por exclusion.
- Docencia y formacion en genetica forense: sirve para generar explicaciones paso a paso de como se aplican las reglas de herencia mendeliana sobre perfiles concretos.
- Validacion de pipelines bioinformaticos: al producir salidas estructuradas y deterministas en formato, puede usarse como oraculo de referencia en pruebas de regresion de software de analisis STR.
- Investigacion sobre modelos verticales: el repositorio incluye scripts de entrenamiento, launcher y logs de TensorBoard, lo que permite reproducir el ajuste o adaptarlo a otros paneles de marcadores.
- Asistencia en laboratorio con recursos limitados: la version GGUF y la carga en 4 bits (unos 10 GB de pesos) permiten desplegarlo en GPUs de consumo para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento: perdida final de aproximadamente 0,068, throughput de 0,79 muestras/s y 0,197 pasos/s (unos 5,1 s por paso de optimizador). No se aportan evaluaciones sobre el conjunto retenido de 938 ejemplos ni comparaciones con otros modelos en tareas de analisis STR.

## Requisitos de hardware

- VRAM para inferencia en 16 bits: aproximadamente 30 GB solo para pesos; se recomienda una GPU de 40 GB o mas (A100 40/80 GB, H100, L40S).
- VRAM en 4 bits: unos 10 GB para pesos; el autor indica que en GPUs de menos de 40 GB conviene cargar en 4 bits con bitsandbytes o Unsloth.
- Entrenamiento de referencia: una GPU de 32 GB de VRAM con pico reservado de unos 13 GB (QLoRA con Unsloth y gradient checkpointing).
- GPU de consumo: la version en 4 bits y la GGUF de `haninmb/QWEN3_DNA_GGUF_v2` permiten ejecucion en tarjetas de 12-24 GB (por ejemplo, RTX 3090 o RTX 4090), aunque no se publican mediciones de latencia en ese escenario.
- Opciones de despliegue: transformers, Unsloth, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), llama.cpp u Ollama mediante el GGUF.
- Throughput conocido: solo el de entrenamiento (0,79 muestras/s, 0,197 pasos/s); no hay datos de throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haninmb/train_qewn3_final_r8 | 14,8B | 16.384 tokens (uso) | Analisis STR y herencia mendeliana | Apache 2.0 | Hugging Face, GGUF separado |
| haninmb/train_qewn3_final | 14,8B (base Qwen3-14B) | no disponible | Analisis STR y herencia mendeliana | Apache 2.0 | Hugging Face |
| Qwen3-14B (base) | 14,8B | no disponible en la informacion | Proposito general | Apache 2.0 | Hugging Face |

La comparacion con el primer ajuste del mismo autor (rango 32, alpha 32) es la mas directa: misma base, mismo dataset y misma tarea, con distinta capacidad del adaptador. No se dispone de metricas comparativas entre ambas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado exclusivamente para analisis de perfiles STR familiares; su comportamiento fuera de ese formato no esta validado.
- Idioma: solo se declara ingles; las respuestas en castellano no estan garantizadas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir clasificaciones o JSON malformados; la salida deberia validarse con un parser y con revision experta.
- No es una herramienta diagnostica ni forense certificada: no se documenta validacion clinica ni acreditacion, por lo que no debe sustituir el juicio de un genetista.
- Sesgos: el dataset de entrenamiento es sintetico o curado por el autor y no se documenta su composicion poblacional, lo que puede introducir sesgos en la frecuencia de alelos o en la interpretacion de mutaciones.
- Perdida de entrenamiento no interpretable como calidad: se calcula sobre la secuencia completa incluido el system prompt y no hay evaluacion sobre el conjunto retenido de 938 ejemplos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien las condiciones del modelo base Qwen3-14B.
- Dependencia de la plantilla de chat: usar el rol `system` es obligatorio para reproducir el comportamiento de entrenamiento; otras plantillas pueden degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haninmb/train_qewn3_final_r8
- Primera variante del ajuste (rango 32): https://huggingface.co/haninmb/train_qewn3_final
- Version GGUF: https://huggingface.co/haninmb/QWEN3_DNA_GGUF_v2
- Scripts de entrenamiento: https://huggingface.co/haninmb/train_qewn3_final_r8/tree/main/training
- Logs de TensorBoard: https://huggingface.co/haninmb/train_qewn3_final_r8/tree/main/runs
- Unsloth: https://github.com/unslothai/unsloth
