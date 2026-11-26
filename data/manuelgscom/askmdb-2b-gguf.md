# manuelgscom/askmdb-2b-GGUF

## Resumen

askmdb-2b es un ajuste completo (full fine-tune) del modelo base Qwen/Qwen3.5-2B, desarrollado por Manuel García Sanz, que traduce preguntas en castellano o en inglés sobre una base de datos MongoDB a un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON compacto junto con una explicación breve. El modelo recibe en el prompt una descripción compacta del esquema de la base de datos, lo que le permite operar sobre bases que nunca ha visto durante el entrenamiento.

Se distribuye en formato GGUF con cuantización Q4_K_M generada mediante imatrix, con un tamaño de 1.274,4 MB y 1.881.825.088 parámetros totales. Forma parte de la familia askmdb, compuesta por cuatro tamaños (0,8B, 2B, 4B y 9B) entrenados con los mismos datos, contrato y prompt. En la CLI oficial `askmdb` no se utiliza este modelo: la CLI emplea el 0,8B en CPU y el 4B o el 9B en GPU. El 2B se publica para aplicaciones propias servidas con `llama-server`, en CPU o GPU, como paso intermedio entre el 0,8B y el 4B.

Su relevancia radica en que un modelo de menos de 2.000 millones de parámetros alcanza un 86,8 % de acierto en el test público de 500 casos puntuado por ejecución, frente al 47,8 % de Qwen3.5-9B sin ajustar y el 45,4 % de Gemma 4 E4B-it sin ajustar, según los datos declarados por el autor. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B, ajuste completo) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (imatrix); el repositorio publica esa cuantización |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `askmdb-2b-1.0.0-Q4_K_M.gguf`, 1.274,4 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo de Qwen/Qwen3.5-2B, un transformer de 1.881.825.088 parámetros. No se trata de un LoRA ni de una adaptación parcial: el autor indica que es un full fine-tune. La tarea está formulada como generación de texto con un contrato de salida fijo: dado un esquema compacto de MongoDB y una pregunta, el modelo emite un único pipeline de `aggregate` de solo lectura más una explicación breve, en forma de objeto JSON pequeño.

El entrenamiento se realizó con los mismos datos y el mismo contrato que askmdb-0.8b, el modelo por defecto de la CLI `askmdb`. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización Q4_K_M se generó con imatrix. El autor no documenta innovaciones arquitectónicas propias (atención lineal, decodificación especulativa u otras): la aportación es el ajuste y el contrato de la tarea, no cambios en la arquitectura del modelo base.

## Capacidades

- Traducción de lenguaje natural a consultas MongoDB: convierte una pregunta en castellano o inglés en un único pipeline de `aggregate` de solo lectura.
- Generalización a esquemas no vistos: lee una descripción compacta del esquema en el prompt, por lo que funciona sobre bases de datos con las que no fue entrenado.
- Salida estructurada: devuelve un objeto JSON pequeño con la consulta y una explicación breve.
- Bilingüe: soporta castellano e inglés de forma nativa según los metadatos del modelo.
- Ejecución local: formato GGUF compatible con llama.cpp y `llama-server`, en CPU o GPU.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Integración con la CLI `askmdb`: comparte contrato y prompt con el resto de la familia, aunque la CLI no invoca este tamaño.

## Casos de uso

- Asistentes de consulta sobre MongoDB en aplicaciones propias: el modelo se sirve con `llama-server` y recibe el esquema de la base junto con la pregunta del usuario para generar el pipeline que la aplicación ejecutará después con un usuario de solo lectura.
- Herramientas internas de analítica para equipos no técnicos: un analista de negocio formula la pregunta en castellano y obtiene una consulta de agregación lista para revisar, sin escribir sintaxis de MongoDB.
- Integración en paneles de administración: un campo de búsqueda en lenguaje natural que genera pipelines sobre colecciones con esquemas descritos dinámicamente en el prompt.
- Entornos con recursos limitados: al ocupar 1.274,4 MB en Q4_K_M, puede desplegarse en CPU o en GPU de gama baja, lo que lo hace adecuado para portátiles y servidores sin acelerador dedicado.
- Paso intermedio de precisión entre el 0,8B y el 4B: aplicaciones que necesitan más acierto que el modelo pequeño pero no disponen de la VRAM que exige el 4B pueden usar el 2B como compromiso.
- Generación de consultas de solo lectura para auditoría y revisión: el pipeline generado se almacena y se revisa antes de ejecutarse, aprovechando la explicación breve que acompaña a la consulta.
- Prototipado de interfaces de lenguaje natural sobre bases de datos existentes: permite validar el flujo completo (esquema en prompt, generación, revisión, ejecución) antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (model-index), puntuados por ejecución sobre el test público `manuelgscom/askmdb-test` (500 casos):

| Modelo | Base | Test (accuracy por ejecución) |
|---|---|---:|
| askmdb-0.8b | Qwen3.5-0.8B | 83,6 % |
| **askmdb-2b** | Qwen3.5-2B | **86,8 %** (434/500) |
| askmdb-4b | Qwen3.5-4B | 89,6 % |
| askmdb-9b | Qwen3.5-9B | 91,6 % |
| Qwen3.5-9B sin ajustar | Qwen3.5-9B | 47,8 % |
| Gemma 4 E4B-it sin ajustar | Gemma 4 E4B-it | 45,4 % |

La métrica de accuracy del model-index figura como no verificada (`verified: false`). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa 1.274,4 MB; con overhead de contexto y de `llama-server`, el consumo real será algo superior, aunque la información disponible no especifica una cifra exacta.
- GPU recomendadas: no se documentan modelos concretos (A100, H100, RTX 4090, etc.) para este tamaño; el autor lo sitúa como opción para aplicaciones propias en CPU o GPU.
- GPU de consumo: por tamaño, cabe en GPUs de consumo con holgura, aunque el autor no publica una lista de modelos validados para el 2B. En la familia, el 4B exige al menos 4 GiB de VRAM libre y el 9B al menos 8 GiB; el 2B queda por debajo de esos umbrales.
- Despliegue: `llama-server` (llama.cpp) es el método indicado por el autor; el formato GGUF también permite su uso con otras herramientas compatibles con llama.cpp, aunque no se documentan explícitamente en la información disponible.
- CPU: el autor indica que el modelo puede servirse en CPU, igual que el 0,8B, que es la opción por defecto de la CLI en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test askmdb (por ejecución) | Licencia | Formato |
|---|---|---:|---:|---|---|
| **askmdb-2b** | 1.881.825.088 | no disponible | 86,8 % | Apache-2.0 | GGUF Q4_K_M |
| askmdb-0.8b | no disponible | no disponible | 83,6 % | no disponible en la información | GGUF Q4_K_M (529,3 MB) |
| askmdb-4b | no disponible | no disponible | 89,6 % | no disponible en la información | GGUF Q4_K_M (2.708,8 MB) |
| askmdb-9b | no disponible | no disponible | 91,6 % | no disponible en la información | GGUF Q4_K_M (5.629,1 MB) |
| Qwen3.5-9B sin ajustar | no disponible | no disponible | 47,8 % | no disponible en la información | no disponible |
| Gemma 4 E4B-it sin ajustar | no disponible | no disponible | 45,4 % | no disponible en la información | no disponible |

La comparación más directa es con los otros tres tamaños de la propia familia askmdb, que comparten datos, contrato y prompt. El 2B ofrece un 3,2 % más de acierto que el 0,8B a cambio de 745,1 MB adicionales de fichero, y se queda 2,8 puntos por debajo del 4B, que ocupa 1.434,4 MB más.

## Limitaciones y advertencias

- El modelo no decide la seguridad: dentro de la CLI `askmdb` un verificador determinista comprueba que el pipeline sea de solo lectura, pero fuera de la CLI no existe ese verificador. El autor recomienda revisar siempre la consulta y conectarse con un usuario de solo lectura.
- Riesgo de alucinación en nombres de campos, colecciones u operadores del pipeline si el esquema descrito en el prompt está incompleto o es ambiguo.
- Ámbito restringido a MongoDB y a un único pipeline de `aggregate`; no es un modelo de propósito general ni un generador de código arbitrario.
- Idiomas limitados a castellano e inglés; no se documenta soporte de otros idiomas.
- Longitud de contexto no disponible en la información proporcionada, lo que impide evaluar su comportamiento con esquemas muy extensos.
- La métrica de accuracy del model-index figura como no verificada por un tercero.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la corrección de las consultas generadas en producción.
- La CLI `askmdb` no utiliza este modelo; quien espere el comportamiento de la CLI debe usar el 0,8B, el 4B o el 9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/askmdb-2b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de test: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Colección de la familia askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Código fuente de la CLI askmdb: https://github.com/manuelgscom/askmdb
- Sitio web del autor: https://manuelgs.com/en/askmdb/
- Fichero GGUF Q4_K_M: https://huggingface.co/manuelgscom/askmdb-2b-GGUF/resolve/main/askmdb-2b-1.0.0-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/askmdb-2b-GGUF/blob/main/LICENSE
- Modelo hermano 0,8B: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Modelo hermano 4B: https://huggingface.co/manuelgscom/askmdb-4b-GGUF
- Modelo hermano 9B: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
