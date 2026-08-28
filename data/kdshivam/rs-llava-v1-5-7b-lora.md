# kdshivam/RS-llava-v1.5-7b-LoRA

## Resumen

RS-LLaVA es un modelo de visión y lenguaje (VLM) desarrollado por el grupo BigData-KSU de la Universidad King Saud, especializado en tareas conjuntas de descripción (captioning) y respuesta a preguntas (VQA) sobre imágenes de teledetección. El modelo se basa en la arquitectura LLaVA, combinando un codificador visual CLIP con un modelo de lenguaje de 7 mil millones de parámetros, y se publica como un adaptador LoRA que debe combinarse con el modelo base Intel/neural-chat-7b-v3-3.

La relevancia de RS-LLaVA radica en abordar un dominio específico —las imágenes de satélite y aéreas— donde los modelos genéricos de visión y lenguaje suelen rendir de forma deficiente. El entrenamiento se realiza en tres etapas: preentrenamiento con datos de alineación de características, ajuste con instrucciones visuales usando el dataset RS-Instructions (que incluye NWPU, RSICD, UAV, UCM, LR y DOTA) y ajuste final para tareas específicas. Este enfoque permite al modelo comprender escenas de teledetección y generar descripciones o responder preguntas sobre el contenido de las imágenes.

El modelo se distribuye bajo licencia MIT y el repositorio ocupa 0,4 GB, lo que indica que se trata únicamente de los pesos del adaptador LoRA, no del modelo completo. Para su uso en producción es necesario descargar también el modelo base y combinar ambos durante la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (CLIP ViT-L/14 + MLP projector + LLM) |
| Parametros totales | 7B (modelo base) + adaptador LoRA |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de LLaVA v1.5, tipicamente 2048 tokens) |
| Tipos de cuantizacion | no disponible (formato original LoRA en safetensors) |
| Idiomas soportados | no disponible (entrenado principalmente con datos en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

RS-LLaVA sigue la arquitectura LLaVA (Large Language and Vision Assistant): un codificador visual CLIP ViT-L/14 procesa las imagenes, un proyector MLP alinea las caracteristicas visuales con el espacio de embeddings del texto, y un modelo de lenguaje (en este caso Intel/neural-chat-7b-v3-3, basado en Vicuna v1.5) genera las respuestas. El modelo completo tiene 7 mil millones de parametros, de los cuales solo se publican los pesos del adaptador LoRA, que ocupan 0,4 GB.

El entrenamiento se realiza en tres etapas. La primera etapa es de preentrenamiento para alinear caracteristicas visuales y textuales, usando el dataset CC-3M Concept-balanced 595K junto con los datasets de teledeteccion NWPU-RSICD-Pretrain. La segunda etapa es de ajuste con instrucciones visuales, combinando el dataset RS-Instructions (91,3 MB) con LLaVA-Instruct-150K (1,03 GB), lo que ensena al modelo a seguir instrucciones complejas sobre imagenes de satelite. La tercera etapa consiste en un ajuste final para tareas especificas como descripcion de imagenes o VQA. No se menciona el uso de RLHF ni DPO en el entrenamiento.

## Capacidades

- Descripcion de imagenes de teledeteccion: genera descripciones detalladas de escenas capturadas por satelites o drones, incluyendo elementos como edificios, carreteras, vegetacion o cuerpos de agua.
- Respuesta a preguntas visuales (VQA): responde preguntas sobre el contenido de imagenes de teledeteccion, como "¿Cuantos edificios hay?" o "¿Que tipo de terreno se observa?".
- Generacion de preguntas y respuestas: el prompt de ejemplo del modelo card muestra que puede generar tres preguntas y respuestas sobre una imagen, y posteriormente compilar un resumen.
- Comprension de escenas complejas: entrenado con datasets como DOTA (deteccion de objetos en imagenes aereas) y UAV, es capaz de identificar objetos pequenos y estructuras en imagenes de alta resolucion.
- Integracion con el ecosistema LLaVA: al basarse en LLaVA v1.5, hereda la capacidad de procesar prompts multimodales con tokens de imagen y texto.
- No incluye capacidades de vision generalista: el modelo esta especializado en teledeteccion y puede rendir peor en imagenes naturales o de la vida cotidiana.

## Casos de uso

- Cartografia automatica: el modelo puede generar descripciones textuales de parcelas de terreno a partir de imagenes de satelite, facilitando la creacion de mapas tematicos o inventarios de cobertura del suelo.
- Monitorizacion de desastres naturales: ante una inundacion o incendio, RS-LLaVA puede analizar imagenes aereas y describir las zonas afectadas, ayudando a los equipos de emergencia a priorizar sus intervenciones.
- Agricultura de precision: a partir de imagenes multiespectrales o RGB de cultivos, el modelo puede responder preguntas sobre el estado de la vegetacion, la presencia de plagas o la extension de parcelas cultivadas.
- Planificacion urbana: los equipos municipales pueden usar el modelo para analizar imagenes de satelite de zonas urbanas y obtener descripciones de densidad de edificacion, espacios verdes o infraestructuras viarias.
- Vigilancia medioambiental: el modelo puede monitorizar cambios en la cobertura forestal, la desertificacion o la expansion de areas urbanas mediante el analisis de series temporales de imagenes de satelite.
- Generacion de metadatos para archivos de imagenes: instituciones que gestionan grandes volumenes de imagenes de teledeteccion pueden usar RS-LLaVA para generar descripciones automaticas que faciliten la busqueda y catalogacion de sus archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (MDPI Remote Sensing, 2024) presenta evaluaciones del modelo, pero los datos concretos no se incluyen en la model card ni en los resultados de la busqueda web.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,4 GB, pero el modelo completo (7B) requiere entre 14 y 16 GB en FP16 para inferencia, o entre 6 y 8 GB con cuantizacion de 4 bits.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para inferencia en FP16; A100 (40/80 GB) o H100 para despliegue en produccion con multiples peticiones concurrentes.
- Compatibilidad con GPU de consumo: si, una RTX 3060 de 12 GB puede ejecutar el modelo con cuantizacion de 4 bits, aunque con latencia mayor.
- Opciones de despliegue: el modelo se carga con el codigo de LLaVA (llava.model.builder), por lo que es compatible con los frameworks que soporten LLaVA, como vLLM (con adaptaciones), Transformers de HuggingFace y el propio repositorio de LLaVA. No hay soporte nativo para llama.cpp u Ollama sin conversion manual.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| RS-LLaVA (este) | 7B | 2048 (estimado) | Teledeteccion (captioning + VQA) | MIT |
| LLaVA-1.5-7B | 7B | 2048 | Vision generalista | Apache 2.0 |
| GeoChat | 7B | 2048 | Teledeteccion (conversacional) | no disponible |

RS-LLaVA se diferencia de LLaVA-1.5 por su entrenamiento especifico en datasets de teledeteccion, lo que mejora el rendimiento en imagenes de satelite a costa de perder generalidad. Frente a GeoChat, otro VLM para teledeteccion, RS-LLaVA se centra en tareas de descripcion y VQA, mientras que GeoChat esta disenado para conversaciones mas abiertas sobre imagenes geoespaciales. La ventaja principal de RS-LLaVA es su licencia MIT, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta entrenado exclusivamente con imagenes de teledeteccion y puede producir resultados pobres con imagenes naturales, medicas u otros dominios visuales.
- Dependencia del modelo base: al ser un adaptador LoRA, requiere descargar y cargar Intel/neural-chat-7b-v3-3 (aproximadamente 14 GB en FP16), lo que incrementa los requisitos de almacenamiento y memoria.
- Contexto limitado: la ventana de contexto es de aproximadamente 2048 tokens, insuficiente para analizar secuencias largas de imagenes o prompts muy extensos.
- Riesgo de alucinacion: como todo VLM, puede generar descripciones o respuestas plausibles pero incorrectas sobre objetos o elementos que no estan realmente presentes en la imagen.
- Datos de entrenamiento limitados: los datasets de teledeteccion utilizados (NWPU, RSICD, UAV, UCM, LR, DOTA) cubren principalmente escenas urbanas y rurales de regiones concretas, por lo que el rendimiento puede degradarse en otras geografias o tipos de sensor.
- Idiomas: no se especifican los idiomas soportados, pero los datos de entrenamiento estan en ingles, por lo que el modelo puede no responder correctamente en otros idiomas.
- Sin garantias de produccion: el modelo no incluye benchmarks publicados ni evaluaciones de robustez, por lo que se recomienda validar su rendimiento en el dominio especifico antes de usarlo en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdshivam/RS-llava-v1.5-7b-LoRA
- Modelo original (BigData-KSU): https://huggingface.co/BigData-KSU/RS-llava-v1.5-7b-LoRA
- Repositorio GitHub: https://github.com/BigData-KSU/RS-LLaVA
- Articulo cientifico (MDPI Remote Sensing): https://www.mdpi.com/2072-4292/16/9/1477
- Dataset RS-Instructions: https://huggingface.co/datasets/BigData-KSU/RS-instructions-dataset
- Dataset NWPU-Captions: https://github.com/HaiyanHuang98/NWPU-Captions
- Dataset RSICD: https://huggingface.co/datasets/arampacha/rsicd
- Modelo base (Intel/neural-chat-7b-v3-3): https://huggingface.co/Intel/neural-chat-7b-v3-3
