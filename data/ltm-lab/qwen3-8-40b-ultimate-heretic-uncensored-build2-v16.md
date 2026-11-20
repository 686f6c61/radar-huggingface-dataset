# LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v16

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v16 es un modelo multimodal de tipo image-text-to-text publicado por LTM-Lab, un laboratorio independiente que trabaja sobre la familia Qwen. Se trata de un fine-tune del checkpoint v15 del mismo autor, que a su vez deriva de la arquitectura Qwen3.5. El modelo cuenta con 39.958.026.224 parámetros (aproximadamente 40B) almacenados en safetensors y un repositorio de 79,9 GB, lo que sitúa los pesos en precisión de 16 bits.

La propuesta diferencial de esta versión v16 es la incorporación de lo que el autor denomina "memoria episódica persistente V16" en tiempo de inferencia: la model card indica que se conservan los pesos y el tokenizador del checkpoint de origen y que la arquitectura incluida en Hugging Face añade este mecanismo de memoria. Para cargarlo es necesario usar `trust_remote_code=True`, ya que el repositorio incluye código propio (`custom_code`) que implementa dicha capa.

El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado como "uncensored" y "heretic", lo que en la práctica indica que el autor ha aplicado un proceso de reducción de rechazos sobre el modelo base. Es relevante ahora porque combina tres elementos poco habituales en un mismo checkpoint: tamaño 40B, entrada multimodal de imagen y texto, y una capa de memoria persistente entre turnos, todo ello con pesos abiertos y licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`) con capa de memoria episódica V16 en inferencia y código propio (`custom_code`) |
| Parametros totales | 39.958.026.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 79,9 GB, coherente con ~40B en fp16/bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 (tag `qwen3_5` en Hugging Face) y se presenta como un transformer multimodal con pipeline `image-text-to-text`, es decir, acepta imágenes y texto como entrada y genera texto. Sobre esa base, LTM-Lab añade una capa propietaria de "memoria episódica persistente V16" que, según la model card, se activa en el momento de la inferencia y no modifica los pesos preentrenados ni el tokenizador del checkpoint de origen. Esto implica que el mecanismo de memoria vive en el código personalizado del repositorio y se ejecuta al cargar el modelo con `trust_remote_code=True`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o similares. La cadena de derivación conocida es v15 → v16, y el propio nombre del checkpoint ("Heretic-Uncensored") sugiere un proceso de fine-tuning orientado a eliminar comportamientos de rechazo, aunque el autor no documenta la metodología. Tampoco se detalla ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, con el añadido de una capa de memoria episódica persistente entre interacciones (según la model card).
- Procesamiento de entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que puede recibir imágenes junto a instrucciones en lenguaje natural.
- Razonamiento y generación de código: capacidades heredadas de la familia Qwen3.5, aunque no se documentan evaluaciones específicas en esta ficha.
- Comportamiento "uncensored": el autor ha reducido deliberadamente las negativas del modelo base, lo que afecta al perfil de respuestas ante contenido sensible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en la ficha de Hugging Face.
- Modo "thinking" explícito, visión avanzada o audio: no disponible.

## Casos de uso

- Asistentes conversacionales de sesión larga: la capa de memoria episódica V16 está pensada para retener información entre turnos sin depender únicamente de la ventana de contexto, lo que encaja en aplicaciones de acompañamiento, tutoría o asistencia personal donde el usuario vuelve a lo largo del tiempo.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede emplearse para extraer información de capturas, diagramas o formularios escaneados y responder preguntas sobre ellos en la misma conversación.
- Generación de código asistida en entornos internos: con 40B de parámetros y licencia Apache 2.0, es desplegable en infraestructura propia para autocompletado, revisión de parches o generación de tests sin depender de APIs externas.
- Investigación sobre alineación y censura: al ser un modelo explícitamente "uncensored", resulta útil como objeto de estudio para medir cómo cambia la tasa de rechazos respecto al modelo base y qué efectos colaterales tiene ese proceso.
- Prototipado de agentes con memoria: la combinación de multimodalidad y memoria persistente permite construir demos de agentes que recuerdan interacciones previas con el usuario y con imágenes compartidas anteriormente.
- Despliegue on-premise en sectores regulados: la licencia Apache 2.0 y la disponibilidad de pesos completos facilitan su uso en entornos con requisitos de soberanía de datos, siempre que se validen los sesgos y el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 80 GB solo para pesos, más overhead de activaciones y caché KV; se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para carga completa.
- Cuantización a 8 bits: aproximadamente 40 GB de pesos, viable en una A100 40GB o en dos RTX 4090 de 24 GB con reparto de capas.
- Cuantización a 4 bits: alrededor de 20-22 GB de pesos, lo que permite ejecución en una única RTX 4090 (24 GB) con margen limitado; no se publican pesos cuantizados en el repositorio, por lo que habría que generarlos.
- Despliegue: al requerir `trust_remote_code=True` y código personalizado, las opciones están restringidas a `transformers` y, potencialmente, a servidores que soporten código remoto (vLLM o TGI solo si aceptan la arquitectura custom; no está confirmado). llama.cpp y Ollama no son viables sin una conversión previa a GGUF, que no se ofrece.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v16 | 39,96B | no disponible | Si (image-text-to-text) | Apache 2.0 | Memoria episódica V16, requiere `trust_remote_code` |
| Qwen2.5-VL-32B-Instruct | 32B (aprox.) | 128K (según ficha oficial de Qwen) | Si | Apache 2.0 | Modelo oficial de Alibaba, sin código custom |
| Qwen2.5-32B-Instruct | 32B (aprox.) | 128K (según ficha oficial de Qwen) | No | Apache 2.0 | Solo texto, ampliamente soportado en vLLM y llama.cpp |
| Llama 3.3 70B Instruct | 70B | 128K | No | Llama 3.3 Community License | Mayor tamaño, licencia con restricciones para >700M usuarios |

La comparación con los modelos oficiales de Qwen es la más directa por procedencia arquitectónica, aunque las cifras exactas de contexto y rendimiento del checkpoint de LTM-Lab no están documentadas y no deben asumirse equivalentes a las del modelo base.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" y "heretic": cabe esperar una reducción deliberada de rechazos ante solicitudes sensibles, con el consiguiente riesgo de generar contenido dañino, sesgado o inexacto sin advertencia.
- No se documentan sesgos evaluados, composición del dataset de fine-tuning ni procesos de alineación; la trazabilidad del entrenamiento es muy limitada.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- La memoria episódica V16 se implementa mediante código personalizado que se ejecuta con `trust_remote_code=True`; esto implica ejecutar código de un tercero en el entorno de inferencia y debe auditarse antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso comunitario ni de validación independiente.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de consumo y en runtimes ligeros.
- No se especifican idiomas soportados; el rendimiento en castellano no está verificado.
- Aunque la licencia es Apache 2.0, el uso comercial debería ir precedido de una evaluación propia de seguridad y de cumplimiento normativo (por ejemplo, el AI Act europeo) dado el carácter "uncensored" del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v16
- Checkpoint base (v15): https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v15
- Árbol de ficheros del checkpoint de origen referenciado en la model card: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v15/tree/dd6fa6414a3d336d8253525ca61a663871f82592
- Perfil del autor: https://huggingface.co/LTM-Lab
