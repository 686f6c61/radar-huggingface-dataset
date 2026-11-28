# MartinSumera/nl2jq-Qwen3.5-2B-GGUF

## Resumen

nl2jq Qwen3.5-2B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-2B-Base, desarrollado por MartinSumera, cuyo objetivo es traducir peticiones en lenguaje natural sobre un documento JSON a un programa jq ejecutable. El modelo no recibe el documento completo, sino un "indice de rutas" (path index) con la estructura del documento y algunos valores de muestra, y devuelve un unico programa jq o una linea `CLARIFY:` cuando la peticion es ambigua. Es la pieza que impulsa el proyecto jsontalk, que ejecuta el modelo completamente en el navegador.

Tecnicamente se trata de un fine-tune LoRA fusionado sobre los pesos base, cuantizado a GGUF Q4_K_M (unos 1,27 GB) y dividido en tres shards de como maximo 512 MB para facilitar su carga en entornos web (wllama) y en llama.cpp. El modelo cuenta con 1.881.825.088 parametros reales (segun safetensors del repo) y esta orientado exclusivamente al ingles.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo de menos de 2B parametros puede resolver una tarea de traduccion estructurada (NL a DSL) con una precision alta cuando se le entrena con datos especificos y se le restringe la decodificacion mediante una gramatica GBNF; por otro, su tamano y formato permiten inferencia local en navegador, lo que lo convierte en un caso de estudio interesante para despliegues edge sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B-Base); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 1.881.825.088 (1,88B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada, ~1,27 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres shards de maximo 512 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base (propiedad de Alibaba Cloud, licencia Apache 2.0) y se ha ajustado mediante LoRA especificamente para la generacion de programas jq, fusionando despues los adaptadores en los pesos base. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente se indica que existen varias versiones de entrenamiento (steps 4, 5 y 6), siendo la step 6 la actual, entrenada contra jq 1.8.2 con mayor cobertura de builtins y tareas mas dificiles.

Una innovacion tecnica destacable es el uso de decodificacion restringida por gramatica GBNF: en la evaluacion de la step 6 se empleo un modo `syntax` que solo permite builtins reales de jq 1.8.2 con sus recuentos de argumentos correctos. Las versiones step 4 y 5 incluian ademas una gramatica que limitaba las claves de objeto a las presentes en el documento. El prompt del sistema exige que el modelo generalice (no hardcodee valores del indice) y que emita `CLARIFY:` ante ambiguedades reales en lugar de adivinar. El modelo se usa con la plantilla de chat de Qwen con `enable_thinking: false`.

## Capacidades

- Generacion de programas jq a partir de peticiones en lenguaje natural sobre documentos JSON.
- Razonamiento sobre la estructura de un documento JSON representada como indice de rutas (tipos, arrays con conteo y valores de muestra).
- Generalizacion: el programa generado debe funcionar sobre otros documentos de la misma forma con valores distintos.
- Deteccion de ambiguedad mediante la respuesta `CLARIFY: <pregunta corta>`.
- Salida estrictamente limitada al texto del programa jq (sin explicaciones, sin bloques de codigo, sin comillas de shell).
- Compatibilidad con decodificacion restringida por gramatica GBNF para limitar la salida a builtins validos de jq 1.8.2.
- Soporte de inferencia en navegador mediante wllama, y en llama.cpp/llama-server.
- No dispone de capacidades de vision, audio, tool calling generico ni agentes multi-paso segun la informacion disponible.

## Casos de uso

- Consulta interactiva de JSON en el navegador: el modelo permite a un usuario escribir "muestra solo los usuarios activos" y obtener el jq equivalente, ejecutandose localmente gracias al formato GGUF y a wllama, sin enviar datos a un servidor.
- Asistente integrado en herramientas de linea de comandos: un CLI podria invocar el modelo para traducir peticiones a jq y ejecutar el resultado con `jq -c '<program>'`, reduciendo la curva de aprendizaje de jq.
- Generacion de pipelines de transformacion de datos: en ETL ligero, el modelo puede producir filtros y proyecciones jq a partir de descripciones en lenguaje natural sobre la forma del documento.
- Educacion y documentacion: como ejemplo didactico de traduccion NL a DSL con modelos pequenos y decodificacion restringida por gramatica.
- Prototipado de agentes que operan sobre JSON: el modelo actua como componente especializado que convierte instrucciones en operaciones ejecutables, delegando la orquestacion a otro sistema.
- Despliegue edge o en dispositivos con recursos limitados: con ~1,27 GB en Q4_K_M y 1,88B parametros, es viable en portatiles y entornos sin GPU dedicada.
- Deteccion de ambiguedad en interfaces conversacionales: el mecanismo `CLARIFY:` permite construir flujos que pidan aclaracion antes de ejecutar una transformacion potencialmente destructiva.

## Benchmarks y rendimiento

Datos publicados por el autor comparando step 5 y step 6 (decodificacion greedy, Q4_K_M, jq 1.8.2, mismas tareas):

| Suite | Tareas | Step 5 | Step 6 |
|---|---:|---:|---:|
| nl2jq-bench test | 400 | 0,730 | 0,877 |
| jq feature probe (todos los grupos) | 378 | 0,209 | 0,558 |
| hard tasks | 220 | 0,209 | 0,545 |
| real user requests | 60 | 0,350 | 0,817 |
| product eval P0 (pooled) | 164 | 0,939 | 0,939 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB con Q4_K_M (pesos ~1,27 GB mas overhead de contexto).
- Cabe en GPU consumer de gama baja y media (por ejemplo, GTX 1650 4 GB, RTX 3050 6 GB, RTX 4060 8 GB); tambien es viable en CPU.
- Ejecucion en navegador mediante wllama, cargando los tres shards desde el primer archivo.
- Opciones de despliegue: llama.cpp / llama-server (ejemplo del autor: `llama-server -m nl2jq-qwen35-2000m-step6-final-q4_k_m-00001-of-00003.gguf --jinja`), wllama, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| nl2jq Qwen3.5-2B (este) | 1,88B | no disponible | NL a jq (fine-tune especializado) | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-2B-Base | ~2B | no disponible | Modelo base generalista | Apache 2.0 | safetensors |
| Modelos generalistas de ~2B (p. ej. familia Qwen 2B) | ~2B | no disponible | Generacion de texto general | variable | multiples |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en NL a jq en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en ingles; no hay evidencia de soporte multilingue.
- Alto riesgo de alucinacion fuera del dominio jq/JSON; no debe usarse como modelo generalista.
- La calidad depende de la version de jq: step 6 apunta a jq 1.8.2; steps 4 y 5 requieren la linea `- Target jq version 1.7.1.` en el prompt del sistema.
- El modelo no ve el documento real, solo el indice de rutas; peticiones que dependan de valores concretos pueden requerir aclaracion o fallar.
- El uso de gramatica GBNF es parte del flujo de evaluacion; sin ella, la tasa de salidas invalidas puede aumentar.
- Licencia Apache 2.0 permite uso comercial, pero el autor aclara que es un fine-tune independiente no revisado ni respaldado por Alibaba Cloud ni el equipo de Qwen.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- El repo tiene pocas descargas (177) y ningun like, lo que sugiere adopcion limitada y menor validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MartinSumera/nl2jq-Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Proyecto jsontalk: https://jsontalk.pages.dev
- Documentacion de jq: https://jqlang.github.io/jq/
