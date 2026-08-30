# Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT4

## Resumen

Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT4 es una cuantizacion INT4 weight-only del modelo multimodal Gemma 3 12B IT de Google, posteriormente sometida a un proceso de ablacion ("abliteration") mediante proyeccion ortogonal de la direccion de rechazo del modelo original. El resultado es una version ligera y sin censura, pensada para entornos con recursos limitados que necesitan conservar el comportamiento general del modelo base sin las restricciones de contenido tipicas de los modelos alineados.

El modelo fue creado por Rin247 y publicado en agosto de 2026, aunque la fecha parece erronea (probablemente 2025). El repositorio incluye un unico archivo `model.safetensors` de 7,8 GB junto con `config.json` que contiene la configuracion de cuantizacion. Al estar basado en Gemma 3, hereda la arquitectura transformer multimodal con 12.000 millones de parametros, una ventana de contexto de 128.000 tokens y soporte para mas de 140 idiomas, asi como capacidad de procesamiento de imagenes.

La relevancia de este modelo radica en que combina dos demandas frecuentes en la comunidad open source: un tamaño manejable para inferencia en hardware consumer y la eliminacion de las barreras de seguridad que limitan ciertos casos de uso creativos o de investigacion. Sin embargo, al ser una cuantizacion con un formato de pesos propietario y sin licencia especificada, su adopcion en produccion requiere precauciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto) |
| Parametros totales | 12B (modelo base), 6.603.341.424 almacenados en INT4 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | INT4 weight-only (PyTorch RTN, escalas almacenadas por separado) |
| Idiomas soportados | 140+ (heredado del modelo base) |
| Licencia | No disponible (el modelo base Gemma 3 usa la Gemma Terms of Use de Google) |
| Formato de pesos | safetensors con `quantization_config` y buffers de escala/shape |

## Arquitectura y entrenamiento

El modelo base, Gemma 3 12B IT, es un transformer multimodal desarrollado por Google que incorpora un codificador de vision ademas del modulo de lenguaje. Su entrenamiento incluye una fase de preentrenamiento sobre un corpus masivo de texto e imagenes, seguida de un ajuste fino supervisado y un refinamiento con RLHF para alineacion. La arquitectura introduce mejoras como atencion con ventana deslizante para reducir el consumo de memoria KV-cache en contextos largos, lo que permite mantener los 128K tokens de ventana sin un coste excesivo.

La version de Rin247 aplica dos transformaciones sobre el modelo original. Primero, una ablacion ("abliteration") mediante proyeccion ortogonal de la direccion de rechazo, una tecnica que identifica y elimina los vectores de peso asociados a las respuestas de rechazo, de modo que el modelo pierde la tendencia a negarse a responder contenidos sensibles. Segundo, una cuantizacion INT4 weight-only realizada con PyTorch RTN (Round-To-Nearest) en CPU, almacenando las escalas de cuantizacion en buffers separados (`*.weight_scale`, `*.weight_shape`). Este enfoque reduce el tamaño del modelo a aproximadamente la mitad del original, aunque requiere dequantizar los pesos antes de alimentar un motor de inferencia.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de logica, analisis y explicacion.
- Comprension y generacion de codigo en multiples lenguajes de programacion.
- Razonamiento matematico y resolucion de problemas numericos.
- Procesamiento de imagenes: descripcion, respuesta a preguntas visuales y extraccion de informacion de fotografias o diagramas.
- Soporte de tool calling y function calling, permitiendo integracion con APIs y ejecucion de acciones externas.
- Capacidades multilingues en mas de 140 idiomas, con especial solidez en ingles, espanol, frances, aleman, etc.
- Ventana de contexto de 128K tokens, adecuada para documentos largos, conversaciones extendidas o analisis de codigo extenso.
- Al estar abliterado, no muestra patrones de rechazo ante solicitudes de contenido adulto, violento o politicamente sensible (aunque esto conlleva riesgos, ver Limitaciones).

## Casos de uso

- Asistentes de soporte tecnico sin restricciones: el modelo puede manejar consultas de usuarios sobre temas delicados (por ejemplo, salud mental, adicciones) sin derivar a respuestas evasivas, gracias a su naturaleza abliterada. Su contexto de 128K permite mantener conversaciones largas con historial completo.
- Generacion de codigo en entornos de desarrollo: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo, aunque requiere un motor que soporte el formato de pesos cuantizado.
- Analisis de documentos extensos: su ventana de 128K permite procesar contratos, informes anuales o codigo fuente de proyectos completos en una sola pasada, extrayendo resumenes y detectando inconsistencias.
- Creacion de contenido creativo sin filtros: escritores y guionistas pueden utilizarlo para explorar narrativas con violencia, sexo o temas tabu sin recibir rechazos, acelerando el proceso de ideacion. La cuantizacion INT4 permite ejecutarlo en una GPU de gama media.
- Investigacion en alineacion y seguridad: al comparar el comportamiento del modelo abliterado con el original, los investigadores pueden estudiar los efectos de la ablacion en la calidad de las respuestas y en la aparicion de sesgos.
- Prototipado rapido en entornos con presupuesto limitado: al ocupar solo 7,8 GB, puede desplegarse en instancias cloud de bajo coste o en estaciones de trabajo sin GPU de alta gama, permitiendo experimentar con un modelo de 12B a una fraccion del coste de la version completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica. El modelo base Gemma 3 12B IT reporta en su articulo tecnico (arXiv:2503.19786) resultados en tareas como MMLU (68,6), HumanEval (67,3) y GSM8K (91,6), entre otros. Sin embargo, la cuantizacion INT4 y la ablacion pueden alterar estas metricas, y no existen datos publicados que cuantifiquen la degradacion. Se recomienda realizar una evaluacion propia antes de usar el modelo en tareas criticas.

## Requisitos de hardware

- VRAM estimada: el archivo safetensors ocupa 7,8 GB, por lo que se necesita al menos 8 GB de VRAM para cargar los pesos en memoria. Con overhead de inferencia, se recomienda 10-12 GB para operar con holgura.
- GPUs compatibles: cualquier GPU con 8 GB o mas de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) o A100 (40/80 GB). En CPU, es posible ejecutar con 16 GB de RAM aunque con latencia alta.
- El modelo no es GGUF, por lo que no puede cargarse directamente con llama.cpp u Ollama. Requiere motores que soporten pesos INT4 weight-only con escalas separadas, como vLLM o TGI, o bien dequantizar previamente a FP16 y usar cualquier framework.
- Latencia y throughput: no hay mediciones publicadas para esta cuantizacion. Como referencia, un Gemma 3 12B en FP16 en una RTX 4090 genera aproximadamente 40-60 tokens/s; en INT4 podria aumentar ligeramente el throughput pero depende del motor de inferencia y de la implementacion de dequantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT4 | 12B | 128K | INT4 weight-only | No especificada | HuggingFace |
| google/gemma-3-12b-it | 12B | 128K | FP16 / BF16 | Gemma Terms of Use | HuggingFace |
| mradermacher/gemma-3-12b-it-uncensored-GGUF | 12B | 128K | GGUF (Q4_K_M, etc.) | No especificada | HuggingFace |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128K | FP16, GGUF | Apache 2.0 | HuggingFace |

La principal diferencia frente al modelo base es la eliminacion del rechazo y el menor tamaño en disco. Frente a la version GGUF de mradermacher, esta version INT4 usa un formato propietario menos portable, aunque el tamaño es similar. Hermes-3-Llama-3.1-8B es una alternativa abliterada de menor tamaño y licencia permisiva, pero con menos parametros y sin capacidades multimodales.

## Limitaciones y advertencias

- Al ser una cuantizacion INT4 weight-only con un formato de pesos personalizado, no es compatible de forma directa con herramientas estandar como llama.cpp, Ollama o Transformers. Requiere un proceso de dequantizacion o un motor que soporte el esquema de escalas y shapes, lo que limita su portabilidad.
- La licencia no esta especificada en el repositorio. El modelo base Gemma 3 esta sujeto a la Gemma Terms of Use de Google, que impone restricciones de uso comercial y redistribucion, pero no esta claro si estas condiciones se aplican a esta derivada. Antes de usar en produccion, conviene consultar con el autor o con un asesor legal.
- El proceso de ablacion elimina la direccion de rechazo, lo que puede provocar que el modelo genere contenido ofensivo, ilegal o peligroso sin filtro. El autor no ofrece ninguna garantia de seguridad, y el uso indebido puede acarrear consecuencias legales o eticas.
- No se han publicado evaluaciones de sesgos, alucinaciones o degradacion de rendimiento tras la cuantizacion. Es probable que la precision en tareas de razonamiento y codigo se vea reducida con respecto al modelo en FP16.
- La fecha de creacion (2026) parece erronea y podria indicar un modelo generado automaticamente o con metadatos corruptos. Se recomienda verificar la integridad de los archivos y contrastar con el repositorio del autor.
- Al no tener descargas ni likes, no hay evidencia de que el modelo haya sido probado por la comunidad, lo que aumenta el riesgo de fallos inesperados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT4
- Modelo base Gemma 3 12B IT: https://huggingface.co/google/gemma-3-12b-it
- Version GGUF uncensored de mradermacher: https://huggingface.co/mradermacher/gemma-3-12b-it-uncensored-GGUF
- Articulo tecnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Repositorio GitHub de Gemma 3: https://github.com/gemma-3/gemma-3
