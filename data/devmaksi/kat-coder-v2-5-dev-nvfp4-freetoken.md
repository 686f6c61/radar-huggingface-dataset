# devmaksi/KAT-Coder-V2.5-Dev-NVFP4-freetoken

## Resumen

KAT-Coder-V2.5-Dev es un modelo de lenguaje especializado en codificacion agentica desarrollado por Kwaipilot, entrenado para operar de forma autonoma dentro de repositorios ejecutables reales en lugar de comportarse como un generador de codigo de un solo turno. Es un modelo de mezcla de expertos (MoE) con 35B parametros totales y aproximadamente 3B parametros activos por token, construido sobre Qwen3.6-35B-A3B. La ficha que nos ocupa no es el modelo original, sino una copia cuantizada localmente en NVFP4 publicada por el usuario devmaksi bajo el identificador devmaksi/KAT-Coder-V2.5-Dev-NVFP4-freetoken y servida con FreeToken.

La relevancia de esta publicacion es doble. Por un lado, el modelo base KAT-Coder-V2.5-Dev se presenta como estado del arte en codificacion agentica dentro de su rango de parametros, con 69,40 en SWE-bench Verified y 63,00 en SWE-bench Multilingual, por delante de alternativas como Qwen3.5-27B (68,60 / 57,67) o el propio Qwen3.6-35B-A3B del que deriva (64,40 / 57,00). Por otro, esta variante concreta reduce los pesos a 4 bits en formato NVFP4, lo que baja el repositorio a 21,8 GB y facilita el despliegue en hardware mas modesto.

Conviene tener presente una limitacion importante: esta release incluye unicamente los pesos del modelo de lenguaje. Los componentes de vision y multimodalidad no estan incluidos ni disponibles, de modo que, pese a que las etiquetas del repositorio mencionan image-text-to-text, el artefacto funciona como modelo exclusivamente de texto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de arquitectura qwen3_5_moe |
| Parametros totales | 34.660.610.688 (~34,66 B) segun los safetensors; la model card del original indica 35 B |
| Parametros activos | ~3 B (35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en este repositorio, formato compressed-tensors; el repositorio original se publica sin cuantizar |
| Idiomas soportados | en, zh, ru en la model card; las etiquetas del repositorio anaden ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, cuantizacion NVFP4) |

Otros datos de interes: libreria transformers, pipeline text-generation, tamano del repositorio 21,8 GB, modelo base Qwen3.6-35B-A3B, creado el 2026-09-23 y actualizado el 2026-09-23. Las etiquetas incluyen ademas 8-bit, endpoints_compatible y conversational, aunque la model card describe explicitamente una cuantizacion NVFP4, por lo que existe una discrepancia entre la etiqueta y la descripcion.

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de tipo sparse sobre una columna vertebral transformer: 34,66 B de parametros totales de los que solo unos 3 B se activan por token, lo que reduce el coste de inferencia al nivel de un modelo denso pequeno manteniendo la capacidad de representacion de un modelo grande. El modelo base declarado es Qwen3.6-35B-A3B, siguiendo la familia de arquitecturas etiquetada como qwen3_5_moe en el repositorio.

El informe tecnico (arXiv 2607.05471) describe un marco de post-entrenamiento agentico de extremo a extremo cuyo cuello de botella no es la escala del modelo, sino la escasez de entornos reproducibles, recompensas verificables y trayectorias de alto valor. El entrenamiento combina SFT y RL. Entre los efectos medidos del RL sobre comportamientos anomalos se reporta una reduccion de las etiquetas de herramienta invalidas de 9,34 % a 0,28 % (-9 pp) y de la repeticion continua en un solo turno de 0,34 % a 0 % (-0,34 pp). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion de esta copia concreta es la cuantizacion NVFP4 aplicada localmente sobre los pesos post-entrenados y su servicio mediante FreeToken, que no forma parte del pipeline oficial de Kwaipilot.

## Capacidades

- Generacion de texto y codigo con foco en tareas de programacion real sobre repositorios.
- Codificacion agentica: ejecucion autonoma en entornos ejecutables, edicion de multiples ficheros y resolucion de issues.
- Soporte de tool calling y function calling, con etiquetas de herramienta corregidas mediante RL.
- Flujos de agente multi-paso y razonamiento encadenado dentro de un repositorio.
- Capacidades multilingues en ingles, chino y ruso segun la model card (el repositorio anade arabe en sus etiquetas).
- Manejo de contexto conversacional multi-turno (pipeline text-generation y etiqueta conversational).
- Capacidad multimodal: no disponible en este artefacto. Aunque el repositorio hereda la etiqueta image-text-to-text, la release solo incluye los pesos del modelo de lenguaje y el autor indica explicitamente que los componentes de vision no estan incluidos.
- Modo de pensamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo esta entrenado para actuar dentro de entornos ejecutables, por lo que puede recibir una issue, inspeccionar el arbol de ficheros, aplicar un parche y validarlo con la suite de tests, que es exactamente lo que mide SWE-bench Verified (69,40).
- Revision de pull requests en CI/CD: integrado como paso previo al merge, puede analizar el diff, ejecutar los tests y proponer correcciones usando tool calling, reduciendo el tiempo de revision humana.
- Migraciones de codigo entre lenguajes o frameworks en bases de codigo grandes: su rendimiento en SWE-bench Multilingual (63,00) lo hace util para repositorios con documentacion y codigo en ingles, chino o ruso.
- Asistente de desarrollo en IDE con contexto de proyecto: al integrarse via API compatible con OpenAI, puede gestionar conversaciones multi-turno con el estado del repositorio y ejecutar comandos de terminal como herramientas.
- Agente de mantenimiento de dependencias: deteccion de versiones obsoletas, actualizacion de ficheros de dependencias y verificacion de que la build sigue pasando, aprovechando el bucle agentico con recompensas verificables.
- Generacion de tests a partir de codigo existente: el modelo puede leer modulos y producir suites de prueba ejecutables, con la ventaja de que el resultado es verificable de forma automatica.
- Despliegue en infraestructura con GPU de gama alta limitada: al ocupar 21,8 GB en NVFP4, permite servir un modelo de 35B totales en una unica GPU con memoria suficiente, cosa inviable con los pesos sin cuantizar.
- Automatizacion de tareas de refactorizacion repetitivas (renombrados, extraccion de funciones, eliminacion de codigo muerto) en pipelines batch nocturnos, donde la latencia no es critica.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (categoria Coding Agent). La tabla original queda truncada en la informacion disponible, por lo que solo se reproducen las filas completas.

| Benchmark | KAT-Coder-V2.5-Dev | Qwen3.5-27B | Qwen3.6-35B-A3B | Gemma4-31B | Qwen3.5-35B-A3B | Ornith-1.0-35B | Gemma4-26B-A4B | Qwen3-Coder-30B |
|---|---|---|---|---|---|---|---|---|
| SWE-bench Verified | 69,40 | 68,60 | 64,40 | 60,60 | 58,60 | 55,80 | 35,80 | 31,80 |
| SWE-bench Multilingual | 63,00 | 57,67 | 57,00 | 49,33 | 47,67 | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. No se dispone de mediciones de latencia ni throughput para esta variante cuantizada en NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 21,8 GB, por lo que se necesitan aproximadamente 22-24 GB de VRAM solo para los pesos, mas el cache KV, que depende de la longitud de contexto (no disponible) y del numero de secuencias concurrentes.
- Cuantizacion NVFP4: este formato esta soportado de forma nativa por las arquitecturas Blackwell de NVIDIA (serie RTX 50xx y B200). En generaciones anteriores (Ampere, Ada Lovelace, Hopper) el despliegue requeriria kernels alternativos o no seria directamente compatible; conviene verificar el soporte del runtime antes de desplegar.
- GPU de centro de datos: A100 80 GB, H100 80 GB y B200 son adecuadas por memoria, aunque el soporte nativo de NVFP4 esta limitado a Blackwell.
- GPU de consumo: una RTX 5090 (32 GB) es la candidata natural por memoria y soporte de NVFP4. Una RTX 4090 (24 GB) queda al limite de memoria para los pesos y probablemente no soporte NVFP4 de forma nativa.
- Multiples GPU: si se despliega con tensor parallelism, dos GPU de 24 GB podrian alojar los pesos, aunque el reparto no es trivial para modelos MoE.
- Opciones de despliegue: la model card del modelo base indica compatibilidad con Transformers, vLLM, SGLang y KTransformers. Esta copia concreta se sirve con FreeToken. Soporte en llama.cpp u Ollama: no disponible (el formato compressed-tensors NVFP4 no es el formato GGUF habitual).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | SWE-bench Multilingual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev (esta copia NVFP4) | 34,66 B totales, ~3 B activos | no disponible | 69,40 | 63,00 | apache-2.0 | HuggingFace, cuantizado NVFP4 |
| KAT-Coder-V2.5-Dev (original) | 35 B totales, ~3 B activos | no disponible | 69,40 | 63,00 | apache-2.0 | HuggingFace, ModelScope, pesos sin cuantizar |
| Qwen3.6-35B-A3B (modelo base) | 35 B totales, ~3 B activos | no disponible | 64,40 | 57,00 | no disponible | no disponible |
| Qwen3.5-27B | 27 B | no disponible | 68,60 | 57,67 | no disponible | no disponible |
| Qwen3-Coder-30B | 30 B | no disponible | 31,80 | no disponible | no disponible | no disponible |
| Gemma4-31B | 31 B | no disponible | 60,60 | 49,33 | no disponible | no disponible |

El dato mas llamativo es la mejora de KAT-Coder-V2.5-Dev sobre su propio modelo base Qwen3.6-35B-A3B (+5,00 puntos en SWE-bench Verified y +6,00 en SWE-bench Multilingual), atribuible al post-entrenamiento con SFT y RL descrito en el informe tecnico. Tambien supera a Qwen3-Coder-30B por un margen muy amplio, aunque conviene senalar que Qwen3-Coder-30B es una generacion anterior.

## Limitaciones y advertencias

- Este repositorio no es el modelo oficial: es una cuantizacion NVFP4 publicada por un tercero (devmaksi) y servida con FreeToken. No hay garantia de que el proceso de cuantizacion preserve fielmente el rendimiento reportado por Kwaipilot, y no se aportan metricas de degradacion.
- Modelo exclusivamente de texto: los componentes de vision y multimodalidad no estan incluidos. Cualquier uso que espere entrada de imagenes fallara, pese a la etiqueta image-text-to-text del repositorio.
- Discrepancia de metadatos: el repositorio etiqueta el modelo como 8-bit, mientras que la model card describe NVFP4. Conviene inspeccionar la configuracion de cuantizacion antes de asumir precision o requisitos de hardware.
- Licencia apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribucion. La licencia del modelo base Qwen3.6-35B-A3B no se detalla en la informacion disponible, por lo que conviene verificarla antes de un despliegue comercial.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion. En tareas de codigo agentico, el riesgo practico es proponer APIs inexistentes o parches que compilan pero rompen semantica, de ahi la importancia de ejecutar tests.
- Comportamientos anomalos: el RL redujo las etiquetas de herramienta invalidas al 0,28 %, pero no a cero; en produccion hace falta validar las llamadas a herramientas antes de ejecutarlas.
- Idiomas: el soporte declarado se limita a ingles, chino y ruso (con arabe en las etiquetas). No hay datos sobre el rendimiento en castellano, por lo que no se puede asumir calidad equivalente en espanol.
- Longitud de contexto no documentada: sin este dato no se puede dimensionar el cache KV ni garantizar tareas sobre repositorios grandes.
- Adopcion nula: 0 descargas y 0 likes. No hay evidencia de la comunidad sobre su funcionamiento real ni sobre problemas de compatibilidad con los frameworks de inferencia.
- Sin resultados de benchmarks propios: los datos de SWE-bench corresponden al modelo original, no a esta cuantizacion.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/devmaksi/KAT-Coder-V2.5-Dev-NVFP4-freetoken
- Repositorio oficial del modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Informe tecnico KAT-Coder-V2.5 (arXiv, HTML): https://arxiv.org/html/2607.05471v1
- Informe tecnico KAT-Coder-V2.5 (arXiv, abstract): https://arxiv.org/abs/2607.05471
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2607.05471
- Version en ModelScope: https://www.modelscope.cn/models/Kwaipilot/KAT-Coder-V2.5-Dev
- Cuantizacion alternativa de la comunidad: https://huggingface.co/remixie/KAT-Coder-V2.5-Dev-FTW
- Imagen de benchmarks del modelo original: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev/resolve/main/KAT-Coder-V2.5-Dev-Benchmarks.png?download=true
