# helloelwin/ot-distill-qwen38-27b-luna-nosummary-6ep-lora

## Resumen

`ot-distill-qwen38-27b-luna-nosummary-6ep-lora` es un adaptador LoRA de tipo PEFT para el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario helloelwin dentro del proyecto ot-distill. El adaptador se ha destilado a partir de trayectorias de agente Terminus-2 generadas por "GPT-6 Luna" sobre las tareas de OpenThoughts-Agent-SFT-3.16K (3.134 filas), con una particularidad clave: se han eliminado los resumenes de razonamiento, de modo que cada bloque `<think>` del turno del asistente queda vacio y el modelo estudiante aprende unicamente las acciones (JSON de Terminus-2) sin la traza de razonamiento intermedia.

El objetivo es transferir el comportamiento agentico de un profesor de mayor capacidad a un modelo de 27.000 millones de parametros, de forma que el estudiante reproduzca las acciones correctas en entornos de agente sin necesidad de generar cadenas de pensamiento extensas. El adaptador se publica con checkpoints por numero de epocas (la carpeta `epoch-1` es la incluida en el repositorio) y con nombres de claves en formato de modelo completo, pensados para su carga directa en vLLM.

La relevancia actual del modelo reside en su enfoque de destilacion sin resumenes de razonamiento para tareas agenticas, un area donde la mayoria de los adaptadores publicados conservan las trazas de pensamiento. El autor publica ademas evaluaciones de desalineacion (StrongREJECT, XSTest, CoCoNot, MASK y desalineacion agentica) que permiten comparar el efecto de la destilacion sobre el comportamiento del estudiante. No obstante, la informacion disponible es limitada: no se especifican licencia, idiomas ni resultados de benchmarks de capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8 con proyecciones Gated DeltaNet |
| Parametros totales | 27B (modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 32.768 tokens (truncado en entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Parametros entrenables | 0,93B (LoRA rank 128, alpha 256, dropout 0,05) |
| Tamano del repositorio | 3,7 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer con proyecciones Gated DeltaNet en el modelo de texto. El LoRA se inserta en todas las capas lineales del modelo de texto (atencion, MLP y proyecciones Gated DeltaNet), con rango 128, alpha 256 y dropout 0,05, lo que resulta en 0,93B de parametros entrenables. Los nombres de las claves siguen el esquema de modelo completo (`base_model.model.model.language_model.layers.N...`), que vLLM aplica directamente; para usar el adaptador con `peft` sobre `AutoModelForCausalLM` es necesario renombrar las claves a `base_model.model.model.layers.`.

El entrenamiento se realizo sobre el dataset helloelwin/ot-distill-gpt-6-luna-3.16k-sft (3.134 filas), compuesto por trayectorias del agente Terminus-2 generadas por GPT-6 Luna, con los resumenes de razonamiento eliminados: cada bloque `<think>` del asistente esta vacio. Se entrenaron 6 epocas (1.176 pasos) con learning rate pico 3e-4, decaimiento coseno, warmup del 3%, batch efectivo de 16 (4 GPUs x acumulacion 4), precision bf16 y perdida calculada en todos los turnos del asistente. El texto se trunco a 32.768 tokens y se delimito con los marcadores `<|im_start|>`/`<|im_end|>` de Qwen3.8. La perdida media de entrenamiento por epoca fue de 0,458 y 0,364 (parcial). El muestreo recomendado es con temperatura 1,0.

## Capacidades

- Generacion de acciones agenticas en formato JSON de Terminus-2, aprendidas por destilacion de trayectorias de GPT-6 Luna.
- Ejecucion de tareas multi-paso en entornos de agente (el dataset de entrenamiento son tareas agenticas de OpenThoughts-Agent-SFT-3.16K).
- Razonamiento sin resumenes: el modelo no produce trazas de pensamiento con contenido, solo la accion final.
- Soporte de tool calling y function calling heredado del modelo base Qwen3.8-27B (no verificado especificamente para este adaptador).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision: el comando de despliegue del autor limita imagenes y video a 0 (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que el adaptador se usa en modo solo texto.
- Modo thinking: el adaptador esta entrenado con bloques `<think>` vacios, por lo que no genera cadenas de razonamiento utiles.

## Casos de uso

- Automatizacion de agentes en entornos de terminal: el adaptador reproduce las acciones JSON de Terminus-2, por lo que puede integrarse en pipelines de agentes que ejecutan comandos y manipulan ficheros, aprovechando el formato de accion aprendido directamente del profesor.
- Destilacion de comportamiento agentico a modelos abiertos de 27B: util para equipos que quieren sustituir un agente basado en API cerrada por un modelo local con comportamiento similar en tareas de OpenThoughts-Agent-SFT, reduciendo coste por token.
- Evaluacion de investigacion sobre destilacion sin resumenes: el adaptador sirve como referencia para estudiar si eliminar las trazas de razonamiento del profesor degrada o no la calidad de las acciones del estudiante, comparandolo con la variante con resumenes del mismo autor.
- Despliegue en vLLM con LoRA dinamica: el formato de claves permite cargar el adaptador con `--enable-lora --max-lora-rank 128` y servirlo junto al modelo base, lo que facilita comparar checkpoints por epoca en un mismo servidor.
- Tareas de agente con contexto largo: el entrenamiento a 32.768 tokens permite manejar conversaciones y estados de entorno extensos, aunque el autor advierte que el estudiante tiende a agotar el presupuesto de generacion razonando de forma repetitiva.
- Estudio de seguridad y alineacion en agentes: las evaluaciones publicadas (StrongREJECT, XSTest, CoCoNot, MASK, desalineacion agentica) permiten usar el adaptador como sujeto de prueba en investigacion sobre comportamiento indeseado en modelos destilados.
- Generacion de acciones en pipelines de CI/CD: con el modelo servido en vLLM y un parser de razonamiento `qwen3`, puede conectarse a herramientas de ejecucion para tareas de automatizacion de infraestructura, siempre con supervision humana por el riesgo de repeticion hasta el limite de tokens.

## Benchmarks y rendimiento

El autor publica evaluaciones de desalineacion enfocadas (5 muestras por prompt, temperatura 1,0, 24K tokens, juez local Llama-3.3-70B), expresadas como porcentaje de comportamiento indeseado. Se comparan el modelo base Qwen3-8B y los checkpoints del estudiante de 8B de GPT-6 Luna (epocas 1, 2, 4 y 6). No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Evaluacion | Base Qwen3-8B | Epoca 1 | Epoca 2 | Epoca 4 | Epoca 6 | Estudiante 8B, epoca 6 |
|---|---|---|---|---|---|---|
| StrongREJECT | 13,6 | 9,2 | 7,0 | 6,8 | 6,0 | 10,8 |
| XSTest | 18,4 | 20,0 | 19,1 | 18,2 | 17,9 | 22,3 |
| CoCoNot | 17,2 | 23,7 | 22,9 | 20,4 | 19,8 | 18,6 |
| MASK | 59,5 | 46,8 | 49,2 | 49,2 | 48,9 | 45,6 |
| Desalineacion agentica | 28,3 | 0,8 | 2,2 | 2,2 | 3,5 | 2,9 |

Advertencia del autor: el estudiante a menudo razona hasta el limite de 24K tokens (mayoritariamente repitiendose), y esas respuestas se excluyen de las tasas. En la epoca 1 mas de la mitad de las respuestas alcanzaron el limite (StrongREJECT 893/1.565, CoCoNot 1.051/2.000, agentico 166/240), por lo que sus numeros describen solo las respuestas que terminaron; en la epoca 2 el 18% de todas las respuestas, y en las epocas 4 y 6 el 7-8% (agentico 29-35%). El modelo base alcanza el limite en 1 de 7.555 casos. El autor recomienda usar los checkpoints posteriores y dar un presupuesto de generacion amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de 27B en bf16 requiere del orden de 54 GB solo para pesos; el adaptador LoRA anade aproximadamente 0,93B de parametros entrenables (unos 1,9 GB en bf16).
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizo con 4 GPUs (modelo no indicado). Para inferencia en bf16 se necesitan GPUs con 80 GB (A100, H100) o configuraciones multi-GPU.
- Cabe en GPU de consumo: no disponible. Un modelo de 27B en cuantizacion de 4 bits podria caber en GPUs de 24 GB, pero el adaptador se distribuye en safetensors y no se documentan conversiones a GGUF.
- Opciones de despliegue: vLLM es la opcion documentada por el autor (`vllm serve Qwen/Qwen3.8-27B --enable-lora --max-lora-rank 128 --limit-mm-per-prompt '{"image":0,"video":0}' --reasoning-parser qwen3 --lora-modules luna-ns-e6=<ruta local>`). Tambien es posible usar `peft` con `AutoModelForCausalLM` tras renombrar las claves. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ot-distill-qwen38-27b-luna-nosummary-6ep-lora | 27B (0,93B entrenables) | 32.768 tokens en entrenamiento | LoRA de destilacion agentica sin resumenes | no disponible | Hugging Face, 0 descargas |
| ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora | 27B (0,93B entrenables) | no disponible | LoRA de destilacion agentica con resumenes | no disponible | Hugging Face (mismo autor) |
| Qwen/Qwen3.8-27B | 27B | no disponible | Modelo base generalista | no disponible | Hugging Face (modelo base) |

La informacion disponible no permite comparar rendimiento de capacidad general con alternativas de la misma categoria; solo se ofrecen las evaluaciones de desalineacion del apartado anterior.

## Limitaciones y advertencias

- El estudiante tiende a razonar hasta el limite de tokens de generacion, repitiendose, especialmente en las primeras epocas: en la epoca 1 mas de la mitad de las respuestas alcanzaron el limite de 24K tokens. Se recomienda usar los checkpoints de epocas 4 o 6 y presupuestos de generacion amplios.
- Las tasas de desalineacion publicadas excluyen las respuestas que agotan el limite de tokens, por lo que describen solo las respuestas que terminan y no el comportamiento completo del modelo.
- El adaptador esta entrenado con bloques `<think>` vacios, de modo que no produce trazas de razonamiento con contenido; esto puede degradar tareas que requieran planificacion explicita.
- Se desactivan imagenes y video en el despliegue recomendado (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que las capacidades multimodales del modelo base no estan disponibles con este adaptador.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es necesario consultar la licencia del modelo base Qwen/Qwen3.8-27B y del repositorio del adaptador antes de usarlo en produccion.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingue del adaptador.
- Riesgo de alucinacion y sesgos: no documentados por el autor; las evaluaciones publicadas se centran en desalineacion, no en veracidad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19), por lo que no hay evidencia de uso en produccion ni validacion externa.
- El adaptador solo incluye la carpeta `epoch-1` en el repositorio, aunque el autor recomienda los checkpoints posteriores (epocas 4 y 6), que no se detallan como disponibles en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-luna-nosummary-6ep-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/helloelwin/ot-distill-gpt-6-luna-3.16k-sft
- Variante con resumenes de razonamiento: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
