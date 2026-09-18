# EnlistedGhost/Prototype_044

## Resumen

Prototype_044 es un ajuste fino multimodal publicado por el usuario EnlistedGhost en Hugging Face, construido sobre `mistralai/Pixtral-Large-Instruct-2411`. El repositorio se distribuye con la libreria `transformers` en formato safetensors, tiene un pipeline declarado de `image-text-to-text` y esta etiquetado como modelo de 124B parametros de la familia `mistral3` (Pixtral-Large). El peso del repositorio es de 277 GB, lo que es coherente con un modelo denso de ese tamano almacenado en precision de 16 bits.

La ficha del autor no aporta informacion tecnica: el README se limita a reproducir el texto de la licencia Mistral Research License (MRL) 0.1 y el prompt de acceso restringido. No se documentan el dataset de ajuste, el numero de tokens de entrenamiento, la metodologia (SFT, DPO, RLHF) ni ninguna evaluacion. Tampoco se indica si el ajuste afecta a todo el modelo o solo a algunas capas, ni si se ha modificado el codificador de vision.

Por herencia del modelo base, se trata de un transformer multimodal de gran escala capaz de procesar imagenes y texto de forma conjunta, con soporte declarado para diez idiomas (en, fr, de, es, it, pt, zh, ja, ru, ko). Su relevancia practica es hoy limitada: 8 descargas y 0 "likes" en el momento de la consulta, ausencia total de documentacion y una licencia que restringe el uso a fines de investigacion. Es un artefacto experimental util para estudiar el comportamiento de un ajuste sobre Pixtral Large, pero no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia mistral3 / Pixtral): codificador de vision acoplado a un decodificador de lenguaje; segun la etiqueta `mistral3` del repositorio |
| Parametros totales | 124B (etiqueta del repositorio: `124B`) |
| Parametros activos | no aplica (el modelo base Pixtral Large es denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Pixtral-Large-Instruct-2411 declara 128 000 tokens |
| Tipos de cuantizacion | no declarados por el autor; la etiqueta `llama.cpp` sugiere conversion comunitaria a GGUF, pero el repositorio solo contiene safetensors |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | MRL (Mistral Research License 0.1), `license: other`, solo fines de investigacion |
| Formato de pesos | safetensors (repo de 277 GB; la precision exacta no se especifica, probablemente BF16 por coherencia con el tamano) |
| Parametros de inferencia | no disponible (no se documentan temperatura, top_p ni plantilla de prompt) |
| Modelo base | mistralai/Pixtral-Large-Instruct-2411 |
| Fecha de publicacion | 18 de septiembre de 2026 (creacion); ultima actualizacion el 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Pixtral Large: un transformer multimodal con un codificador de vision que convierte las imagenes en tokens visuales que se insertan en la secuencia de entrada del decodificador de lenguaje. Esta diseno permite intercalar imagenes y texto en un mismo prompt y mantener conversaciones multi-turno con contexto visual. El repositorio no contiene ningun detalle adicional sobre si el ajuste ha modificado el proyector vision-lenguaje, el codificador de vision o unicamente el decodificador.

No hay informacion publicada sobre el proceso de entrenamiento del ajuste: se desconoce el numero de tokens utilizados, la composicion del dataset (si es de instrucciones, de conversacion multimodal, de un dominio concreto o de datos sinteticos), si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado, y si se emplearon tecnicas de eficiencia como LoRA, QLoRA o entrenamiento completo. Tampoco se documenta ninguna innovacion tecnica propia; el autor no describe cambios en la decodificacion ni en el mecanismo de atencion respecto al modelo base.

## Capacidades

- Generacion de texto conversacional y respuestas multi-turno, heredadas del decodificador de Mistral Large 2 sobre el que se construye Pixtral Large.
- Comprension de imagenes: descripcion de escenas, respuesta a preguntas visuales (VQA) y extraccion de informacion de fotografias e ilustraciones.
- Procesamiento de documentos: el modelo base Pixtral Large esta disenado para tareas de documento, incluyendo OCR y comprension de documentos densos.
- Interpretacion de graficos y diagramas, incluyendo la lectura de valores en ejes y tablas.
- Capacidades multilingues en los diez idiomas declarados (en, fr, de, es, it, pt, zh, ja, ru, ko).
- Soporte de tool calling y function calling: heredado del modelo base, que declara capacidades de llamada a funciones.
- Razonamiento multi-paso y uso en flujos agenticos: capacidad heredada del modelo base, no verificada en este ajuste concreto.
- Capacidades de codigo y matematicas: heredadas del decodificador de Mistral Large 2, sin evaluacion publicada para este ajuste.
- No se declara soporte de audio, video ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo puede recibir imagenes de facturas, formularios o contratos y devolver campos estructurados, aprovechando las capacidades de documento de Pixtral Large. Solo viable en el marco de la licencia MRL (investigacion).
- Investigacion en comprension de documentos (DocVQA, ChartQA): uso academico para reproducir o comparar arquitecturas de vision-lenguaje sobre el mismo modelo base.
- Analisis de graficos cientificos: extraccion de series de datos a partir de figuras de articulos para su posterior tratamiento estadistico.
- Asistencia a la accesibilidad: generacion de descripciones textuales de imagenes para usuarios con discapacidad visual, en un contexto de prototipo o investigacion.
- Revision visual de interfaces de usuario: dado un pantallazo de una aplicacion, el modelo puede describir elementos, detectar incoherencias de diseno o generar el codigo HTML/CSS correspondiente en un flujo de investigacion.
- Inspeccion visual industrial en fase de prueba: clasificacion y descripcion de defectos en imagenes de linea de produccion, con validacion humana obligatoria por el riesgo de alucinacion.
- Sistemas RAG multimodales: indexacion de manuales tecnicos con figuras y recuperacion de fragmentos combinando texto e imagen, usando el modelo como generador final.
- Estudio de ajuste fino de modelos grandes: el repositorio sirve como caso de analisis de como un ajuste no documentado sobre Pixtral Large afecta al comportamiento multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye ninguna tabla de evaluacion (MMMU, DocVQA, MathVista, VQAv2, MMBench u otras), ni comparaciones con el modelo base, ni datos de perplexity o de perdida de validacion. Cualquier cifra sobre el rendimiento de este ajuste concreto requeriria una evaluacion propia; las cifras publicas de Pixtral-Large-Instruct-2411, si se necesitan como referencia, deben consultarse en la model card oficial del modelo base.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: alrededor de 250 GB solo para los pesos (124B x 2 bytes), mas cache KV. Requiere al menos 4 GPU de 80 GB (H100, A100 80GB) o 2 GPU H200 de 141 GB.
- VRAM estimada en FP8: alrededor de 125 GB; cabe en 2 GPU de 80 GB con tensor parallelism.
- VRAM estimada en 4 bits (GGUF Q4_K_M): alrededor de 70-75 GB; cabe en una H100 80GB o en 3-4 GPU de consumo (RTX 4090/3090 de 24 GB) con tensor parallelism.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) ni en configuraciones de 2 GPU; es necesario recurrir a 4 GPU de 24 GB o a offload parcial a CPU (RAM del sistema de 64-128 GB) con llama.cpp, con velocidad muy reducida.
- Cache KV: con una ventana de contexto de 128 000 tokens, la cache KV anade decenas de GB adicionales, por lo que la memoria efectiva requerida es sensiblemente mayor que la de los pesos.
- Opciones de despliegue: transformers (formato nativo del repositorio), TGI y vLLM para el modelo base multimodal, llama.cpp para versiones GGUF (la etiqueta del repositorio lo sugiere, pero no hay archivos GGUF publicados). Ollama no es viable para 124B en hardware de consumo.
- Latencia y throughput: no disponible; no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

Los datos de la tabla corresponden a los modelos base publicos y pueden variar segun la version consultada; conviene verificarlos en las model cards oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prototype_044 (este modelo) | 124B | no disponible en la ficha (base: 128 000 tokens) | MRL, solo investigacion | Hugging Face, safetensors |
| mistralai/Pixtral-Large-Instruct-2411 | 124B | 128 000 tokens | MRL, solo investigacion | Hugging Face, safetensors |
| Qwen2-VL-72B-Instruct | 72B | 32 000 tokens nativos (ampliable con YaRN) | Apache 2.0 | Hugging Face, safetensors y GGUF comunitarios |
| Llama 3.2 90B Vision Instruct | 90B | 128 000 tokens | Llama 3.2 Community License | Hugging Face, safetensors |
| InternVL 2.5 (78B) | 78B | no disponible | MIT | Hugging Face, safetensors |

La diferencia clave de este modelo respecto a las alternativas es la licencia: mientras que Qwen2-VL e InternVL permiten uso comercial bajo licencias permisivas, Prototype_044 hereda la MRL de Mistral, que limita el uso a fines de investigacion y exige solicitar una licencia comercial a Mistral AI para cualquier otro proposito.

## Limitaciones y advertencias

- Licencia restrictiva: la Mistral Research License 0.1 limita el uso a fines de investigacion. Cualquier uso comercial, incluida la distribucion de derivados con fines productivos, requiere una licencia adicional de Mistral AI. Los "outputs" tambien quedan sujetos a esa restriccion.
- Documentacion inexistente: no se describe el dataset, el metodo de ajuste ni la evaluacion, lo que impide reproducir el resultado o anticipar su comportamiento.
- Riesgo de degradacion respecto al modelo base: un ajuste no documentado puede provocar olvido catastrofico (catastrophic forgetting) en tareas que el modelo base si resolvia, sin que existan evaluaciones que lo detecten.
- Riesgo de alucinacion: los modelos de vision-lenguaje tienden a inventar texto en imagenes poco nitidas o a atribuir valores incorrectos a graficos; en documentos legales, medicos o financieros la verificacion humana es imprescindible.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de seguridad para este ajuste; hereda los sesgos del corpus de entrenamiento del modelo base, que no se detalla.
- Idiomas: se declaran diez idiomas, pero no hay datos de rendimiento por idioma. Es esperable un rendimiento inferior en japones, coreano, chino o ruso que en ingles, aunque no puede confirmarse con la informacion disponible.
- Contexto largo: aunque el modelo base declara 128 000 tokens, no se ha verificado que el ajuste conserve esa ventana completa ni el comportamiento en el extremo del contexto ("lost in the middle").
- Naturaleza de prototipo: el nombre del repositorio ("Prototype_044"), las 8 descargas y la ausencia de "likes" indican que se trata de un experimento personal sin validacion por parte de la comunidad.
- Repositorio de gran tamano: 277 GB de safetensors implican tiempos de descarga y costes de almacenamiento elevados, ademas de requisitos de GPU multiples.
- Sin garantias de mantenimiento: no hay repositorio de codigo, paper ni canal de soporte asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EnlistedGhost/Prototype_044
- Modelo base: https://huggingface.co/mistralai/Pixtral-Large-Instruct-2411
- Licencia Mistral Research License 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Contacto de Mistral AI para licencias comerciales: https://mistral.ai/contact/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos corresponden a contenido no relacionado (una mapa del videojuego Roblox Arsenal) y se han descartado. No se han encontrado papers, blogs, repositorios ni demos asociados a EnlistedGhost/Prototype_044.
