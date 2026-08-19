# saracen9/amoral-qwen3.5-9B

## Resumen

`amoral-qwen3.5-9B` es un modelo de lenguaje multimodal (visión y texto) desarrollado por el usuario `saracen9` a partir de la arquitectura Qwen3.5-9B. Su característica principal es que ha sido "abliterado": se han eliminado las direcciones de rechazo (refusal directions) mediante técnicas de abliteration y posteriormente se ha reentrenado con QLoRA sobre un corpus de razonamiento "amoral" mezclado con un conjunto de repetición de razonamiento-visión, con el objetivo de mantener la capacidad nativa de pensar y ver en el mismo turno sin rechazar contenido legal pero sensible.

El modelo resuelve el problema de los modelos de visión-lenguaje que, tras un reentrenamiento de razonamiento solo textual, pierden la capacidad de generar salidas de pensamiento (thinking) cuando se les pasa una imagen. Esta versión corrige ese defecto mediante el conjunto de repetición de visión. Se distribuye como GGUF en dos ficheros (modelo de texto y proyector de visión CLIP), pensado para inferencia local con Ollama. Es un modelo de 8,95 mil millones de parámetros, con licencia Apache 2.0 y etiquetado como "no apto para todos los públicos" por su naturaleza de eliminación de rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basada en Qwen3.5-9B) con proyector de vision CLIP |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se recomienda 8192 en la configuracion de Ollama) |
| Tipos de cuantizacion | Q4_K_M (texto), F16 (proyector de vision) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (text-q4km.gguf y mmproj-f16.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un modelo de lenguaje multimodal de 9 mil millones de parametros con capacidad de razonamiento y vision en el mismo turno. Sobre esta base se aplica un proceso de **abliteracion** (eliminacion de las direcciones de rechazo) y posteriormente un **reentrenamiento QLoRA** sobre un corpus de razonamiento "amoral" (que no rechaza contenido legal pero sensible) mezclado con un conjunto de repeticion de razonamiento-visitual. Este segundo conjunto es critico: una version anterior del modelo, entrenada solo con texto, regresaba a salidas vacias en el canal de thinking cuando se incluia una imagen; la repeticion de razonamiento-visitual corrige ese problema.

El resultado es un modelo que mantiene la transicion limpia "pensar → responder" (cierra el bloque de pensamiento y luego genera la respuesta) y conserva la capacidad de razonar sobre imagenes. El proyector de vision es un CLIP que se sirve en un fichero GGUF separado (mmproj-f16.gguf). No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Razonamiento y vision en el mismo turno: acepta imagen + texto y genera un bloque de pensamiento (thinking) seguido de la respuesta final.
- Eliminacion de rechazos (amoralidad): no se niega a responder sobre contenido legal aunque sea sensible (rutas de sintesis, exploits funcionales, descripciones explicitas, etc.).
- Soporte multimodal: entrada de imagen y texto, salida de texto con razonamiento.
- Capacidad de tool calling y agentes: indicada en los tags de Ollama (toolsthinking), aunque no se documentan detalles especificos de funcionamiento.
- Compatible con el ecosistema Ollama: se puede cargar como modelo local con capacidades de vision.
- Exclusion categorica de contenido sexual infantil del corpus de entrenamiento (linea legal, no un juicio de amoralidad).

## Casos de uso

- Investigacion en seguridad de modelos: estudiar como la abliteracion y el reentrenamiento QLoRA afectan al comportamiento de rechazo y al mantenimiento de capacidades multimodales, comparando con la version base.
- Generacion de contenido creativo con imagenes: describir imagenes explicitas o tecnicas sin filtros, util en contextos de investigacion artistica o medica.
- Prototipado de agentes de vision que necesiten razonar sobre capturas de pantalla o documentos visuales en entornos controlados, sin restricciones de rechazo.
- Evaluacion de robustez de modelos de vision-lenguaje: estudiar el fenomeno de salidas vacias en el canal de thinking cuando se combinan imagenes y texto (ver issue #17777).
- Despliegue local en GPU consumer: gracias a la cuantizacion Q4_K_M (~5-6 GB), se puede ejecutar en tarjetas de 8 GB VRAM para experimentacion rapida.
- Creacion de pipelines de vision + razonamiento en Ollama para tareas de descripcion de imagenes donde se requiera una respuesta directa sin negativas, siempre dentro del marco legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una validacion post-reentrenamiento cualitativa: 0/4 respuestas vacias en la transicion pensar→responder, 0 salidas vacias en vision+thinking, y 0 rechazos tanto en texto como en vision. No hay cifras de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: el fichero de texto Q4_K_M pesa entre 5 y 6 GB; el proyector de vision F16 añade aproximadamente 1-2 GB. Total aproximado de 6-8 GB VRAM para inferencia con vision.
- GPU recomendadas: cualquier tarjeta con 8 GB o mas de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, RTX 4090, A10). Para uso con ventanas de contexto mayores o mayor velocidad, se recomienda una GPU de 12-16 GB.
- Cabe en GPU consumer de gama media con 8 GB, aunque con limitaciones de velocidad y contexto.
- Opciones de despliegue: Ollama (recomendado, con fichero Modelfile), llama.cpp (por el formato GGUF), y potencialmente vLLM o TGI si se convierte a safetensors (aunque no se proporcionan pesos safetensors en el repo).
- Latencia y throughput: no disponibles; dependen de la GPU y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Abliterado | Licencia |
|---|---|---|---|---|---|
| saracen9/amoral-qwen3.5-9B | 8,95 B | No disponible (8192 en config) | Si (CLIP) | Si | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | 9 B | No disponible | Si | No | Apache 2.0 |
| saracen9/Qwen3.5-9B-abliterated-GGUF | 9 B | No disponible | No (solo texto) | Si | Apache 2.0 |

La principal diferencia con la base de Qwen3.5-9B es la eliminacion de rechazos y el reentrenamiento QLoRA, mientras que la version abliterated de solo texto carece de vision. No se dispone de datos de rendimiento comparativo (benchmarks) entre estas opciones.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente en tareas de razonamiento complejo.
- Contenido sensible: al eliminar los rechazos, el modelo puede generar respuestas con contenido explicito o potencialmente peligroso si se le pide; el autor excluye solo el contenido sexual infantil (linea legal). No es apto para todos los publicos.
- Problema conocido de salida vacia: segun el issue de GitHub ollama#17777, con instrucciones de mas de una frase y con `think: true`, el modelo puede generar una gran cantidad de `message.thinking` y luego detenerse sin producir `message.content`. El autor recomienda `presence_penalty 0` y ajustar `num_ctx` para mitigarlo, pero no es una solucion garantizada.
- Limitacion de idiomas: no se especifican los idiomas soportados; la base Qwen3.5 es principalmente multilingue, pero no hay confirmacion para esta variante.
- Dependencia del proyector de vision: sin el fichero `mmproj-f16.gguf`, el modelo se comporta como solo texto silenciosamente; hay que asegurarse de incluir ambas `FROM` en el Modelfile.
- Contexto no documentado: la longitud de contexto nativa no se publica; la configuracion recomendada de 8192 puede ser inferior a la capacidad real del modelo base.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones eticas y legales segun el uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saracen9/amoral-qwen3.5-9B
- Pagina en Ollama: https://ollama.com/saracen9/amoral-qwen3.5-9b
- Issue de GitHub sobre salida vacia con think: https://github.com/ollama/ollama/issues/17777
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Version abliterated solo texto (GGUF): https://huggingface.co/saracen9/Qwen3.5-9B-abliterated-GGUF
- Repositorio del corpus de razonamiento (mencionado en la model card): `saracen9/amoral-reasoning-corpus` (no enlazado directamente)
