# manuelgscom/dale-9b-GGUF

## Resumen

`dale-9b` es un ajuste fino (LoRA fusionado en los pesos) de Qwen/Qwen3.5-9B, desarrollado por Manuel García Sanz (manuelgscom), especializado en la conversión de peticiones en lenguaje natural —castellano o inglés— en un único comando bash para Linux, devuelto como un objeto JSON pequeño con una explicación breve. El modelo resuelve un problema muy concreto: la traducción fiable de intención a comando de shell (nl2bash) con un contrato de salida fijo, incluyendo la capacidad de responder `refuse` cuando la petición no es una tarea de shell y `unsure` cuando es ambigua.

Con 8.953.803.264 parámetros (aproximadamente 9B), arquitectura transformer densa heredada de Qwen3.5-9B y distribución en formato GGUF Q4_K_M (5.629,1 MB) con cuantización imatrix, el modelo está pensado para ejecutarse en local mediante llama.cpp con backend Vulkan, tanto en CPU como en GPU. Es uno de los cuatro tamaños de la familia `dale` (0.8B, 2B, 4B y 9B), todos entrenados con los mismos datos y el mismo contrato de prompt.

Su relevancia actual radica en que es el modelo más preciso de la familia (89,2 % en el test público `dale-bash-test-v2`, frente al 62,8 % del Qwen3.5-9B sin ajustar) y en que se integra en la CLI `dale`, una herramienta offline que propone el comando, lo explica, lo puntúa por riesgo y solo lo ejecuta tras confirmación del usuario. La licencia Apache-2.0 y el soporte de `llama-server` lo hacen utilizable en cualquier aplicación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), ajuste LoRA fusionado en los pesos |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (imatrix); el repo distribuye Q4_K_M de 5.629,1 MB |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors según el campo de parámetros del repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9B parámetros, sobre el que se aplicó un ajuste LoRA posteriormente fusionado en los pesos, de modo que la distribución final no requiere adaptadores separados. El entrenamiento se realizó con los mismos datos que `dale-0.8b`, es decir, un conjunto orientado a la tarea nl2bash con contrato de prompt fijo, razonamiento desactivado y respuesta en JSON. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal no está en la arquitectura sino en el contrato de salida y en el comportamiento de abstención: el modelo devuelve un único comando bash con explicación, o bien `refuse`/`unsure` cuando corresponde, lo que reduce ejecuciones erróneas en producción. La cuantización Q4_K_M con imatrix está optimizada para mantener la precisión de la tarea con un tamaño de 5,6 GB, y el soporte de Vulkan en llama.cpp permite aceleración por GPU en hardware consumer.

## Capacidades

- Generación de un único comando bash para Linux a partir de una petición en lenguaje natural en castellano o inglés.
- Salida estructurada en JSON con el comando y una explicación breve del mismo.
- Abstención explícita: responde `refuse` ante peticiones que no son tareas de shell y `unsure` ante peticiones ambiguas.
- Soporte de contexto de sistema con información del entorno (sistema operativo, distribución, gestor de paquetes, herramientas instaladas) para condicionar la respuesta.
- Capacidad multilingüe limitada a español e inglés.
- Compatibilidad con `llama-server` y con la CLI `dale` (desde la versión 1.1.0, con GPU vía Vulkan).
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito (de hecho, el razonamiento se desactiva por contrato).

## Casos de uso

- Asistente de terminal integrado: la CLI `dale` envía la petición del usuario junto con el contexto del sistema a `dale-9b` vía `llama-server`, obtiene el comando propuesto con su explicación, lo puntúa por riesgo y solo lo ejecuta tras confirmación. Es el caso de uso principal y para el que fue entrenado.
- Automatización de tareas de administración de sistemas: el modelo puede generar comandos para gestión de paquetes, permisos, procesos o ficheros a partir de descripciones en lenguaje natural, usando el contexto de distribución y gestor de paquetes para adaptar la sintaxis.
- Integración en herramientas de formación o documentación: dado que devuelve el comando junto con una explicación breve, es adecuado para generar ejemplos didácticos de shell a partir de enunciados en castellano o inglés.
- Sustitución directa de `dale-0.8b` en aplicaciones existentes: al compartir contrato de prompt y formato de salida, puede reemplazar al modelo pequeño donde se llame a través de `llama-server`, a cambio de más memoria y mayor precisión.
- Preprocesado en pipelines de CI/CD o scripts de provisión: puede generar comandos candidatos que luego se validan y revisan en un paso posterior, aprovechando su comportamiento de abstención ante peticiones ambiguas.
- Despliegue offline en entornos sin conectividad: al ejecutarse con llama.cpp en local (CPU o GPU con Vulkan), encaja en estaciones de trabajo aisladas donde no se puede recurrir a APIs en la nube.
- Evaluación comparativa de modelos nl2bash: el test público `dale-bash-test-v2` (471 casos) permite medir y comparar el rendimiento de este modelo frente a los demás tamaños de la familia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Base | GGUF (Q4_K_M) | Test v2 (accuracy) |
|---|---|---|---|
| `dale-0.8b` | Qwen3.5-0.8B | 529,3 MB | 79,4 % |
| `dale-2b` | Qwen3.5-2B | 1.274,4 MB | 81,7 % |
| `dale-4b` | Qwen3.5-4B | 2.708,8 MB | 87,0 % |
| `dale-9b` | Qwen3.5-9B | 5.629,1 MB | 89,2 % (420/471) con `llama-server`; 89,6 % (422/471) con la CLI `dale` en GPU con Vulkan |
| Qwen3.5-9B sin ajustar | — | — | 62,8 % |

El conjunto de evaluación es `manuelgscom/dale-bash-test-v2`, split `test`, con 471 casos. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: unos 5,4 GiB en la ruta real de la CLI `dale` con GPU y Vulkan, para el GGUF Q4_K_M de 5.629,1 MB.
- La CLI `dale` utiliza `dale-9b` en GPU cuando hay al menos 8 GiB de VRAM libre y el usuario lo selecciona explícitamente (opción 2 en la primera ejecución); con menos memoria recurre a `dale-4b` o a `dale-0.8b` en CPU.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el requisito declarado es una GPU dedicada con al menos 8 GiB de VRAM libre y soporte de Vulkan.
- Cabe en GPU consumer con 8 GiB o más de VRAM libre; en caso contrario, puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`) en CPU o GPU, y la CLI `dale` (versión 1.1.0 o superior) con backend Vulkan.
- Latencia y throughput: aproximadamente 1,7 s por petición en la CLI `dale` sobre GPU con Vulkan (dato declarado por el autor). No se dispone de cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dale-9b` | ~9B | no disponible | 89,2 % | Apache-2.0 | GGUF en Hugging Face |
| `dale-4b` | ~4B | no disponible | 87,0 % | Apache-2.0 | GGUF en Hugging Face |
| `dale-0.8b` | ~0,8B | no disponible | 79,4 % | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-9B (sin ajustar) | ~9B | no disponible | 62,8 % | no disponible en la información | Hugging Face |

La comparación más directa es con los otros tamaños de la misma familia, que comparten tarea, datos, contrato y prompt. Frente a `dale-4b`, `dale-9b` gana 2,2 puntos de precisión a cambio de duplicar aproximadamente el tamaño del GGUF (5,6 GB frente a 2,7 GB) y elevar el requisito de VRAM de 4 a 8 GiB.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en nl2bash para Linux; no es un modelo de propósito general y su rendimiento fuera de esa tarea no está documentado.
- Fuera de la CLI `dale` no existe verificador de riesgo: el comando generado debe revisarse siempre antes de ejecutarlo.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede proponer comandos sintácticamente válidos pero semánticamente incorrectos o peligrosos, especialmente ante peticiones ambiguas; el mecanismo `unsure`/`refuse` mitiga pero no elimina este riesgo.
- Idiomas limitados a español e inglés; no se documenta soporte de otros idiomas.
- Longitud de contexto no disponible en la información proporcionada.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Aunque la licencia es Apache-2.0, conviene revisar los términos del modelo base Qwen3.5-9B para uso comercial en producción.
- El rendimiento de 89,6 % con la CLI `dale` en GPU se obtuvo en la ruta específica de esa herramienta; en otras integraciones con `llama-server` la cifra declarada es 89,2 %.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/dale-9b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Colección de la familia `dale`: https://huggingface.co/collections/manuelgscom/dale-6addf69f0c5ce62251553885
- Código fuente de la CLI `dale`: https://github.com/manuelgscom/dale
- Sitio web del autor: https://manuelgs.com/en/dale/
- GGUF Q4_K_M: https://huggingface.co/manuelgscom/dale-9b-GGUF/resolve/main/dale-9b-1.0.0-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/dale-9b-GGUF/blob/main/LICENSE
- Modelo hermano `dale-0.8b`: https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- Modelo hermano `dale-4b`: https://huggingface.co/manuelgscom/dale-4b-GGUF
