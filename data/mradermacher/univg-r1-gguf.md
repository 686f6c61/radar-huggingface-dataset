# mradermacher/UniVG-R1-GGUF

## Resumen

UniVG-R1-GGUF es la versión cuantizada en formato GGUF del modelo UniVG-R1, desarrollado originalmente por GD-ML y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje multimodal de gran tamano (MLLM) de aproximadamente 7.600 millones de parametros, especializado en *visual grounding* (localizacion visual de objetos o regiones descritas en lenguaje natural) y afinado mediante tecnicas de *reinforcement fine-tuning*. La relevancia de esta version radica en que permite ejecutar un modelo multimodal especializado en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF, algo imposible con los pesos originales en precision completa.

El modelo base, UniVG-R1, esta disenado para tareas que combinan comprension de imagen y lenguaje: identificar y localizar objetos en una imagen a partir de una descripcion textual, responder preguntas sobre contenido visual y razonar sobre relaciones espaciales. La cuantizacion de mradermacher ofrece un abanico de niveles (desde Q2_K hasta f16) junto con los ficheros `mmproj` necesarios para el procesamiento de imagenes, lo que facilita el despliegue en entornos con recursos limitados.

Esta ficha se centra en la version GGUF, pero describe las caracteristicas del modelo base cuando la informacion esta disponible. Cabe senalar que la model card del repositorio cuantizado es escueta y se limita a listar los ficheros generados; los detalles sobre arquitectura, entrenamiento y benchmarks del modelo original no estan incluidos en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal basado en transformers; MLLM) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj para el encoder multimodal) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base UniVG-R1 (tipo de transformer, encoder visual, mecanismo de atencion, etc.). Los tags del repositorio indican que se trata de un *Multimodal Large Language Model* (MLLM) orientado a *visual grounding* y afinado mediante *reinforcement fine-tuning*, lo que sugiere un proceso de alineamiento posterior al entrenamiento supervisado usando senales de recompensa para mejorar la precision en la localizacion de regiones y objetos.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. La unica innovacion tecnica documentada en esta ficha es la propia cuantizacion GGUF realizada por mradermacher, que incluye variantes con imatrix (disponibles en el repositorio `UniVG-R1-i1-GGUF`) y los ficheros `mmproj` necesarios para el procesamiento de imagenes en llama.cpp.

## Capacidades

- Comprension multimodal de imagenes y texto (MLLM).
- *Visual grounding*: localizacion de objetos o regiones en una imagen a partir de una descripcion en lenguaje natural.
- Razonamiento visual: respuesta a preguntas sobre contenido, posiciones y relaciones espaciales en imagenes.
- Conversacion multimodal multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de inferencia en formato GGUF mediante llama.cpp y herramientas derivadas.
- Capacidades de *tool calling*, agentes o *thinking mode*: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede localizar objetos descritos textualmente en imagenes para preetiquetar bounding boxes o mascaras, acelerando la creacion de corpus de entrenamiento para detectores.
- Accesibilidad visual: dado que procesa imagenes y las describe o localiza elementos concretos, puede integrarse en aplicaciones que asistan a personas con discapacidad visual a identificar objetos en su entorno.
- Analisis de imagenes en inspeccion industrial: localizacion de defectos o componentes descritos por el operario ("busca la grieta en la esquina superior izquierda") sobre fotografias de linea de produccion.
- Comercio electronico: extraccion y localizacion de productos dentro de imagenes de catalogo o fotos de usuario para tareas de busqueda visual y moderacion.
- Investigacion en vision-lenguaje: modelo de referencia ligero (7,6 B) para experimentos de grounding y evaluacion de metodos de reinforcement fine-tuning en entornos con GPU de consumo.
- Prototipado rapido en local: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), permite validar pipelines multimodales en portatiles o estaciones de trabajo sin GPU de datacenter.
- Robotica y navegacion asistida: localizacion de referencias visuales descritas por un operador para tareas de manipulacion o guiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y encoder visual):
  - Q4_K_M: ~4,8 GB de pesos; ~6-7 GB de VRAM total recomendada.
  - Q5_K_M: ~5,5 GB de pesos; ~7-8 GB de VRAM total recomendada.
  - Q8_0: ~8,2 GB de pesos; ~10-11 GB de VRAM total recomendada.
  - f16: ~15,3 GB de pesos; ~17-18 GB de VRAM total recomendada.
- Ficheros `mmproj` adicionales: 0,8 GB (Q8_0) o 1,5 GB (f16) que deben sumarse a la VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias; A100 o H100 para f16 y cargas concurrentes.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4/Q5/Q6/Q8 con GPUs de 8-16 GB; Q2_K y Q3_K caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (con soporte multimodal mediante `mmproj`), Ollama (si se importa el GGUF), y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para modelos multimodales en el momento de redactar esta ficha (no disponible confirmacion en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de modelos comparables explicitamente documentados. Como referencia cualitativa de la categoria (MLLM de ~7-8 B orientados a vision-lenguaje), podrian considerarse alternativas como Qwen2.5-VL-7B o LLaVA-OneVision-7B, pero no se han aportado metricas que permitan una comparacion rigurosa en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Enfoque |
|---|---|---|---|---|---|
| UniVG-R1 (este) | ~7,6 B | no disponible | MIT | Si | Visual grounding + RFT |
| Qwen2.5-VL-7B | ~7-8 B | no disponible en esta ficha | Apache 2.0 (segun conocimiento general) | Si (comunidad) | Vision-lenguaje general |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | Apache 2.0 (segun conocimiento general) | Si (comunidad) | Vision-lenguaje general |

Nota: los datos de los modelos alternativos no provienen de la informacion proporcionada y deben verificarse en sus respectivas model cards antes de usarse en produccion.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez del modelo base.
- El modelo esta etiquetado unicamente para ingles (`en`); el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea degradado.
- La longitud de contexto no esta documentada, lo que impide planificar cargas con entradas largas o multiples imagenes de forma fiable.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la precision en tareas de grounding, donde la localizacion espacial fina es sensible a la perdida de informacion.
- La licencia MIT del repositorio cuantizado se hereda del modelo base; conviene verificar que el modelo original GD-ML/UniVG-R1 mantiene efectivamente licencia MIT y si existen restricciones adicionales sobre los datos de entrenamiento.
- Al ser un modelo especializado en visual grounding, su rendimiento en tareas genericas de texto o codigo puede ser inferior al de LLM de proposito general del mismo tamano.
- El repositorio tiene un numero muy bajo de descargas (208) y ningun "like", lo que implica poca validacion comunitaria; se recomienda evaluacion propia antes de uso en produccion.
- El soporte multimodal en llama.cpp requiere usar los ficheros `mmproj` correspondientes y una version reciente de la herramienta; no todas las interfaces graficas o wrappers soportan MLLM en GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UniVG-R1-GGUF
- Modelo base: https://huggingface.co/GD-ML/UniVG-R1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/UniVG-R1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#UniVG-R1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
