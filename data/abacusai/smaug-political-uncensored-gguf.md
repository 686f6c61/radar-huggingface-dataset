# abacusai/Smaug-Political-Uncensored-GGUF

## Resumen

Smaug-Political-Uncensored-GGUF es la distribucion en formato GGUF del modelo multimodal Smaug-Political-Uncensored desarrollado por Abacus.AI. Se trata de un modelo de 26.896 millones de parametros (aproximadamente 26,9B) preparado para su ejecucion en llama.cpp, Ollama y LM Studio, con soporte para entrada de imagen y texto (pipeline image-text-to-text). El repositorio incluye siete niveles de cuantizacion desde IQ3_M hasta Q8_0, cada uno en dos variantes: una version simple y otra que conserva la cabeza de prediccion multi-token (MTP) para acelerar la generacion, ademas del proyector de vision para entrada de imagenes.

El modelo base esta afinado para reducir rechazos (uncensored) en el ambito politico, segun se deduce de su nombre y del contenido de la model card, que menciona una evaluacion completa de rechazos y de tematica politica sobre el archivo Q4_K_M. La licencia es Apache 2.0, lo que permite uso comercial amplio. Los idiomas declarados son ingles y chino.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de ~27B con capacidades multimodales y de agente en hardware de consumo, gracias a las cuantizaciones de 11,7 GiB en adelante. La model card detalla criterios de seleccion de cuantizacion basados en VRAM y contexto, asi como metricas de divergencia KL frente a los pesos BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el repositorio GGUF no detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona ejemplos de 32K y 24K de contexto segun cuantizacion, pero no declara el maximo oficial) |
| Tipos de cuantizacion | IQ3_M, Q3_K_M, IQ4_XS, y hasta Q8_0 (siete niveles en total; la informacion detalla IQ3_M, Q3_K_M e IQ4_XS) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base; el repo GGUF incluye imatrix.gguf y proyector de vision) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, componentes multimodales). Lo que si se documenta es el proceso de cuantizacion: los archivos GGUF se generaron con llama.cpp (commit 71a6a11) a partir de los pesos BF16 del modelo base, utilizando una matriz de importancia (importance matrix) calibrada con el texto `calibration_datav3` de bartowski, incluida en el repositorio como `imatrix.gguf`.

Una innovacion tecnica destacable es la inclusion de la cabeza de prediccion multi-token (MTP) en una de las variantes de cada cuantizacion, pensada para acelerar la generacion mediante decodificacion especulativa. La model card indica que cada archivo fue cargado y probado con thinking activado, desactivado y con una imagen, y que el archivo Q4_K_M se sometio de nuevo a la evaluacion completa de rechazos y politica del modelo base, asi como a AutomationBench. No se proporcionan datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), con proyector de vision incluido en el repositorio.
- Modo de razonamiento con "thinking" activable y desactivable (la model card menciona pruebas con thinking on y off).
- Capacidades de agente y razonamiento multi-paso, segun las etiquetas `agentic` y la evaluacion con AutomationBench.
- Generacion acelerada mediante cabeza MTP (prediccion multi-token) en las variantes que la incluyen.
- Comportamiento "uncensored" orientado a reducir rechazos en tematica politica.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con llama.cpp, Ollama y LM Studio.

## Casos de uso

- Analisis de documentos politicos con imagenes: el modelo puede procesar capturas, graficos o escaneos junto con texto gracias a su proyector de vision, util para resumir o clasificar material de campana o prensa.
- Despliegue local en estaciones de trabajo con GPU de 16 GB: la cuantizacion IQ3_M (11,7 GiB) permite ejecutar el modelo con 32K de contexto en una GPU de 16 GB, adecuado para prototipos de asistentes privados sin conexion.
- Automatizacion de flujos con agentes: las etiquetas `agentic` y la evaluacion con AutomationBench sugieren su uso en pipelines de automatizacion de tareas multi-paso, como extraccion de datos de formularios o generacion de informes.
- Generacion acelerada en produccion: la variante con cabeza MTP permite decodificacion especulativa para reducir latencia en servicios de chat de alta concurrencia desplegados con llama.cpp.
- Investigacion sobre sesgos y rechazos: al ser un modelo "uncensored" con evaluacion de rechazos publicada, sirve para estudiar el comportamiento de modelos sin alineamiento estricto en dominios sensibles.
- Asistencia bilingue ingles-chino: util para traduccion o atencion al cliente en entornos que requieran ambos idiomas, con contexto largo en las cuantizaciones mayores.
- Prototipado rapido en Ollama o LM Studio: la disponibilidad de siete cuantizaciones permite ajustar el equilibrio entre calidad y VRAM segun el hardware disponible (desde 12 GB con descarga parcial a CPU hasta GPUs de mayor capacidad).

## Benchmarks y rendimiento

La model card proporciona metricas de divergencia KL frente a los pesos BF16 para las cuantizaciones documentadas, pero no resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Cuantizacion | Tamano (GiB) | KLD media | KLD 99% | Mismo token top |
|---|---|---|---|---|
| IQ3_M | 11,7 | 0,0577 | 0,557 | 90,8% |
| Q3_K_M | 12,4 | 0,0471 | 0,471 | 91,0% |
| IQ4_XS | 14,0 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: IQ3_M requiere 16 GB de GPU con contexto de 32K; una tarjeta de 12 GB necesita parte del modelo en CPU. Q3_K_M requiere 16 GB con contexto de hasta ~24K. IQ4_XS ocupa 14,0 GiB en archivo simple y 14,3 GiB con cabeza MTP.
- GPU recomendadas: no se especifican modelos concretos en la informacion; por capacidad de VRAM, una RTX 4090 (24 GB) o A100/H100 son adecuadas para las cuantizaciones mayores, mientras que tarjetas de 16 GB cubren IQ3_M y Q3_K_M.
- Cabe en GPU de consumo: si, al menos en tarjetas de 16 GB con IQ3_M o Q3_K_M; en 12 GB requiere descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y endpoints compatibles (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; la variante con cabeza MTP esta disenada para acelerar la generacion, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base sin cuantizar esta disponible en `abacusai/Smaug-Political-Uncensored` (safetensors), pero no se ofrecen comparaciones con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Smaug-Political-Uncensored-GGUF | ~26,9B | no disponible | apache-2.0 | GGUF |
| Smaug-Political-Uncensored (base) | ~26,9B | no disponible | apache-2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El caracter "uncensored" implica un alineamiento reducido: puede generar contenido politicamente sensible, ofensivo o factualmente incorrecto con mayor facilidad que modelos alineados; requiere moderacion en produccion.
- Riesgo de alucinacion inherente a los modelos de ~27B, agravado en dominios especializados y en el idioma chino si el entrenamiento fue mayoritariamente en ingles.
- Solo se declaran los idiomas ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud maxima de contexto no se declara oficialmente; los valores de 32K y 24K de la model card son ejemplos de configuracion por cuantizacion, no el maximo del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado en ambito politico puede acarrear obligaciones regulatorias de transparencia segun la jurisdiccion.
- El repositorio tiene un tamano de 399,1 GB y solo 3 descargas, lo que sugiere poca validacion comunitaria; conviene verificar cada archivo antes de usarlo en produccion.
- Las cuantizaciones de 3 bits (IQ3_M, Q3_K_M) presentan divergencia KL apreciable (0,047-0,058 de media) frente a BF16; para tareas sensibles se recomienda IQ4_XS o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abacusai/Smaug-Political-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Political-Uncensored
- Pagina de Abacus.AI: https://abacus.ai
- Organizacion en Hugging Face: https://huggingface.co/abacusai
- Licencia: https://huggingface.co/abacusai/Smaug-Political-Uncensored-GGUF/blob/main/LICENSE
