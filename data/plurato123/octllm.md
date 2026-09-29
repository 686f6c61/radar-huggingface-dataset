# Plurato123/OctLLM

## Resumen

OctLLM es un modelo multimodal de 11.090.644.992 parametros (unos 11,09 mil millones) publicado por el usuario Plurato123 en HuggingFace, que se presenta como los pesos oficiales del trabajo "Octrees as an Explicit 3D Language". El modelo no es un LLM generico: es un sistema especializado en representar y procesar geometria 3D mediante octrees, y su repositorio incluye componentes propios de ese dominio, como un router 3D, embeddings de posicion especificos y pesos para tokens de malla.

El repositorio etiqueta el modelo con `qwen2_5_vl`, lo que indica que el backbone del sistema es la familia Qwen2.5-VL, sobre la que el autor ha anadido las cabezas y modulos 3D propios. El repositorio pesa 22,5 GB y contiene el modelo, el tokenizer, el processor y cinco shards, ademas de un subdirectorio `completion/model.safetensors` con un modelo de completado de ocupacion usado por el denominado modo `legacy`.

Su relevancia actual es acotada pero clara: propone tratar el octree como un lenguaje explicito, es decir, serializar la geometria 3D en tokens que un transformer visual-linguistico puede procesar, en lugar de depender de representaciones implicitas. Se trata de un modelo de investigacion, sin licencia declarada, sin idiomas documentados, sin descargas y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone etiquetado como `qwen2_5_vl` con componentes 3D propios (router 3D, embeddings de posicion, pesos de tokens de malla) |
| Parametros totales | 11.090.644.992 (11,09 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (cinco shards en la raiz y `completion/model.safetensors`) |
| Tamano del repositorio | 22,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |
| Region declarada | us |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo que se deduce de las etiquetas y del contenido del repositorio. La etiqueta `qwen2_5_vl` situa el backbone en la familia Qwen2.5-VL, un transformer con torre de vision y proyeccion al espacio de tokens del modelo de lenguaje. Sobre esa base, OctLLM incorpora modulos especificos para 3D: un router 3D, embeddings de posicion propios y pesos asociados a tokens de malla, ademas de un modelo de completado de ocupacion independiente en `completion/model.safetensors`.

La innovacion que declara el autor es conceptual: los octrees se tratan como un lenguaje explicito, de modo que la estructura jerarquica de ocupacion espacial se tokeniza y se procesa con el mismo mecanismo atencional que el texto. Los pesos de TRELLIS y CLIP no se incluyen en este repositorio y deben obtenerse por separado de sus repositorios upstream, lo que implica una dependencia externa en el pipeline completo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion y procesamiento de representaciones 3D basadas en octrees, que es la funcion central del modelo.
- Completado de ocupacion geometrica mediante el submodelo `completion/model.safetensors`, activo en el modo `legacy` descrito por el autor.
- Manejo de tokens de malla, lo que sugiere capacidad de trabajar con geometria de superficie y no solo con volumen de ocupacion.
- Procesamiento conjunto de lenguaje natural e informacion 3D, dado el backbone Qwen2.5-VL; el ejemplo de la model card (`--prompt "Explain what an octree is."`) demuestra generacion de texto.
- Ejecucion en modo sin malla mediante el flag `--no-mesh` del script de inferencia incluido.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en representaciones 3D explicitas: el modelo sirve como referencia reproducible para comparar la tokenizacion de octrees frente a representaciones implicitas como campos de radiancia o SDF, cargando los pesos en `checkpoints/OctLLM` dentro de la implementacion del autor.
- Completado de geometria a partir de datos parciales: usando el submodelo de ocupacion en modo `legacy`, se puede reconstruir la ocupacion de un volumen a partir de observaciones incompletas, un caso habitual en escaneo 3D y reconstruccion.
- Preprocesado de assets para pipelines de graficos: convertir mallas a una representacion jerarquica de octree tokenizada facilita el streaming por niveles de detalle (LOD) y la compresion de escenas grandes.
- Generacion de contenido 3D asistida por lenguaje: dado un backbone Qwen2.5-VL, el sistema puede recibir una instruccion textual y producir estructuras 3D condicionadas, integrable en herramientas de autoria para videojuegos o simulacion.
- Docencia y divulgacion tecnica: el propio ejemplo de la model card permite usar el modelo para explicar conceptos como el octree en lenguaje natural, sin necesidad de generar malla (`--no-mesh`).
- Experimentacion academica con dependencias externas: combinando estos pesos con TRELLIS y CLIP descargados de sus repositorios originales, se puede montar el pipeline completo descrito en el paper y reproducir sus resultados.
- Prototipado de interfaces 3D-lenguaje: para equipos que investigan asistentes capaces de razonar sobre geometria, OctLLM ofrece un punto de partida ya entrenado en lugar de partir de un VLM generico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas 3D como Chamfer Distance, IoU de ocupacion o F-score, y la busqueda web no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- Peso de los pesos en precision completa: 11,09 mil millones de parametros implican aproximadamente 22,2 GB en FP16/BF16 y aproximadamente 44,4 GB en FP32. Son calculos derivados del recuento de parametros, no datos publicados por el autor.
- VRAM estimada en cuantizacion de 8 bits: en torno a 11 GB solo para pesos, mas el cache KV y las activaciones.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5,5-6 GB solo para pesos. No hay variantes cuantizadas publicadas ni confirmadas para este repositorio.
- GPU recomendadas: para BF16 sin cuantizar, una A100 40 GB, A100 80 GB, H100 o L40S cubren los pesos con margen. En consumer, una RTX 4090 (24 GB) queda muy justa en BF16 y requeriria cuantizacion o descarga parcial a CPU.
- Cabe en GPU consumer: probablemente si en cuantizacion de 4-8 bits sobre RTX 3090, RTX 4090 o RTX 5090; no confirmado por el autor.
- Opciones de despliegue: la model card indica explicitamente que estos componentes 3D requieren el codigo de carga de la implementacion acompanante de OctLLM, con variables de entorno como `OCTLLM_WEIGHTS_DIR`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OctLLM (Plurato123) | 11,09 mil millones | No disponible | Octrees como lenguaje 3D explicito, sobre backbone tipo Qwen2.5-VL | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-VL | No disponible en la informacion proporcionada | No disponible | Vision-lenguaje generalista | No disponible en la informacion proporcionada | Upstream, usado como backbone |
| TRELLIS | No disponible en la informacion proporcionada | No aplica | Generacion 3D | No disponible en la informacion proporcionada | Repositorio upstream separado |
| CLIP | No disponible en la informacion proporcionada | No aplica | Vision-lenguaje contrastivo | No disponible en la informacion proporcionada | Repositorio upstream separado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a la relacion de dependencia: OctLLM reutiliza el backbone de Qwen2.5-VL y depende de TRELLIS y CLIP para el pipeline completo, pero no se han publicado metricas que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin terminos explicitos, el uso comercial queda en un limbo legal y no es recomendable en produccion sin aclaracion del autor.
- Modelo de investigacion sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento ni casos de exito reportados.
- Dependencia de codigo propio: los componentes 3D personalizados exigen la implementacion acompanante de OctLLM; no funciona con cargadores estandar ni con servidores de inferencia convencionales.
- Dependencias externas no incluidas: TRELLIS y CLIP deben descargarse por separado, lo que anade requisitos de licencia y de hardware que no se pueden evaluar con este repositorio.
- Riesgo de alucinacion: no documentado por el autor, pero es esperable un comportamiento similar al de su backbone Qwen2.5-VL en tareas de lenguaje, con el agravante de que no hay evaluacion publicada.
- Idiomas soportados sin especificar: imposible garantizar cobertura multilingue o un comportamiento correcto en castellano.
- Longitud de contexto sin especificar: no se puede planificar el troceado de geometria o de conversaciones largas sin este dato.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Fecha de creacion y actualizacion declaradas como 2026-09-29, con apenas trece minutos entre ambas; el repositorio aparenta ser una publicacion minima y sin mantenimiento posterior.
- Idoneidad para produccion: baja. Se trata de material reproducible de investigacion, no de un modelo empaquetado ni soportado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Plurato123/OctLLM
- Descarga directa indicada por el autor: `hf download Plurato123/OctLLM --local-dir checkpoints/OctLLM`
- Ejemplo de inferencia indicado por el autor: `python inference.py --prompt "Explain what an octree is." --no-mesh`
- Paper "Octrees as an Explicit 3D Language": mencionado en la model card, sin enlace disponible en la informacion proporcionada.
- Repositorio de TRELLIS: no disponible en la informacion proporcionada.
- Repositorio de CLIP: no disponible en la informacion proporcionada.
- Demo, blog o Space asociado: no disponible en la informacion proporcionada.
