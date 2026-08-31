# NostraEmpire/mirror-smolvlm-instruct

## Resumen

NostraEmpire/mirror-smolvlm-instruct es un espejo (mirror) del modelo SmolVLM-Instruct desarrollado originalmente por Hugging Face. Se trata de un modelo multimodal compacto que acepta secuencias arbitrarias de imágenes y texto para producir salidas de texto, diseñado para ser eficiente y ejecutable en dispositivos con recursos limitados. El modelo combina un backbone de lenguaje SmolLM2-1.7B-Instruct con un encoder de visión SigLIP-SO400M, siguiendo la arquitectura Idefics3. Con aproximadamente 2,25 mil millones de parámetros, SmolVLM-Instruct resuelve tareas como respuesta a preguntas visuales, descripción de imágenes y narración de historias basadas en contenido visual, manteniendo un rendimiento competitivo en tareas multimodales a pesar de su tamaño reducido.

La relevancia de este modelo radica en su capacidad para democratizar el acceso a modelos de visión-lenguaje (VLM) en entornos de producción y edge computing. Al ser un mirror, NostraEmpire ofrece una copia idéntica del modelo original, lo que facilita su disponibilidad y distribución. El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su arquitectura ligera y su soporte para cuantización de 4 y 8 bits lo convierten en una opción atractiva para despliegues en GPU de consumo y aplicaciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (transformer multimodal con encoder de vision SigLIP-SO400M) |
| Parametros totales | 2.246.272.880 (2,25 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit y 8-bit mediante bitsandbytes, torchao o Quanto (segun documentacion del modelo original) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien se menciona ONNX en los tags del repositorio) |

## Arquitectura y entrenamiento

SmolVLM-Instruct se basa en la arquitectura Idefics3, que integra un modelo de lenguaje SmolLM2-1.7B-Instruct como backbone y un encoder de vision SigLIP-SO400M. La innovacion principal frente a modelos anteriores de Idefics es una compresion de imagen mas agresiva: utiliza 81 tokens visuales para codificar parches de imagen de 384x384 pixeles. Las imagenes de mayor resolucion se dividen en parches que se codifican por separado, lo que mejora la eficiencia en memoria y velocidad de inferencia sin sacrificar rendimiento. El modelo fue entrenado con los datasets HuggingFaceM4/the_cauldron y HuggingFaceM4/Docmatix, aunque no se especifican en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La variante Instruct sugiere un ajuste fino supervisado para seguir instrucciones, pero no se proporcionan detalles adicionales.

## Capacidades

- Generacion de texto multimodal: acepta secuencias intercaladas de imagenes y texto, permitiendo responder preguntas sobre imagenes, describir contenido visual y crear narraciones basadas en multiples imagenes.
- Respuesta a preguntas visuales (VQA): puede responder consultas sobre el contenido de una o varias imagenes, como objetos, escenas, texto incrustado o relaciones espaciales.
- Descripcion de imagenes (captioning): genera descripciones textuales detalladas y contextualmente precisas de imagenes individuales o multiples.
- Narracion de historias: crea relatos coherentes basados en secuencias de imagenes, util para aplicaciones creativas o educativas.
- Funcionamiento como modelo de lenguaje puro: puede operar sin entradas visuales, actuando como un modelo de texto convencional.
- Soporte para cuantizacion: compatible con cargas en 4-bit y 8-bit mediante bitsandbytes, torchao o Quanto, lo que reduce los requisitos de memoria.
- Ajuste de resolucion de imagen: permite configurar la resolucion de entrada mediante el parametro `size={"longest_edge": N*384}` en el procesador, con valores recomendados de N=4 para uso general y N=5 para documentos.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede generar descripciones alternativas automaticas para personas con discapacidad visual, integrandose en aplicaciones de lectura de pantalla o plataformas de contenido. Su capacidad para procesar multiples imagenes permite describir galerias completas.
- Analisis de documentos escaneados: gracias al entrenamiento con Docmatix, el modelo puede extraer informacion de documentos, facturas o formularios, respondiendo preguntas sobre su contenido. La configuracion de resolucion N=5 optimiza el rendimiento en este escenario.
- Asistente multimodal en dispositivos edge: su tamano compacto (2,25 B parametros) y soporte de cuantizacion permiten ejecutarlo en GPU de consumo o incluso en CPU con ONNX, habilitando asistentes de vision en robots, camaras inteligentes o aplicaciones moviles.
- Moderacion de contenido visual: puede analizar imagenes para detectar contenido inapropiado o generar descripciones que faciliten la revision manual, reduciendo la carga de trabajo de los moderadores.
- Generacion de metadatos para archivos de imagen: en sistemas de gestion de activos digitales, el modelo puede crear etiquetas, titulos y descripciones automaticas para imagenes, mejorando la busqueda y organizacion.
- Educacion interactiva: el modelo puede responder preguntas de estudiantes sobre diagramas, fotografias o ilustraciones, actuando como tutor virtual en plataformas de aprendizaje en linea.
- Pruebas de interfaz de usuario: puede describir capturas de pantalla de aplicaciones o sitios web, ayudando a los equipos de control de calidad a identificar elementos visuales y detectar anomalias de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del mirror no incluye tablas de evaluacion, y la model card del modelo original tampoco proporciona datos cuantitativos de rendimiento en tareas como MMLU, HumanEval o VQAv2. Para obtener metricas comparativas, se recomienda consultar el informe tecnico de SmolVLM (referenciado en la documentacion original) o ejecutar evaluaciones propias con los datasets de interes.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits, el modelo requiere aproximadamente 2-3 GB de VRAM, mientras que en bfloat16 (sin cuantizar) necesita alrededor de 5-6 GB, considerando tanto el backbone de lenguaje como el encoder de vision.
- GPU recomendadas: para inferencia en local, una GPU con 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060 o equivalente) es suficiente con cuantizacion. Para produccion a mayor escala, se recomiendan GPUs como A100 o H100, aunque no son estrictamente necesarias dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPU consumer de gama media (8 GB o mas) gracias a su tamano reducido y las opciones de cuantizacion.
- Opciones de despliegue: el modelo es compatible con la libreria transformers de Hugging Face, incluyendo soporte para flash attention 2 en CUDA. Tambien se puede desplegar con ONNX para inferencia en CPU o con soluciones como TGI (Text Generation Inference) o vLLM, aunque no se confirma explicitamente la compatibilidad con estos ultimos en la informacion proporcionada.
- Latencia y throughput: no se proporcionan datos especificos de latencia o throughput en la informacion disponible. Se espera que sea rapido en GPU modernas debido a su tamano compacto, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo pertenece a la categoria de VLM compactos, donde existen alternativas como LLaVA 1.5 (7 B), Qwen2-VL (2 B) o MiniCPM-V 2.6 (8 B), pero no se han encontrado tablas de comparacion de rendimiento, parametros o contexto en las fuentes consultadas. Para una evaluacion justa, se recomienda consultar el informe tecnico de SmolVLM o ejecutar benchmarks propios.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta ingles, lo que restringe su uso en aplicaciones multilingues sin un ajuste fino adicional.
- No genera imagenes: SmolVLM-Instruct es exclusivamente un modelo de texto de salida; no puede crear ni editar contenido visual.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido que parezca factual pero sea incorrecto, especialmente en tareas de VQA complejas o con imagenes ambiguas.
- No apto para decisiones criticas: la documentacion advierte que el modelo no esta disenado para escenarios de alto riesgo ni para procesos de toma de decisiones que afecten al bienestar o sustento de las personas.
- Tamano del repositorio: el repo ocupa 26,8 GB, un volumen elevado para un modelo de 2,25 B parametros, probablemente debido a la inclusion de pesos en multiples precisiones y formatos. Esto puede afectar al tiempo de descarga y al almacenamiento local.
- Fecha de creacion inusual: el modelo fue creado el 31 de agosto de 2026, una fecha futura que podria indicar un error en los metadatos del repositorio.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-smolvlm-instruct
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolVLM-Instruct
- Blog de presentacion de SmolVLM: https://huggingface.co/blog/smolvlm
- Repositorio GitHub de Smol Models: https://github.com/huggingface/smollm
- Demo interactiva: https://huggingface.co/spaces/HuggingFaceTB/SmolVLM
