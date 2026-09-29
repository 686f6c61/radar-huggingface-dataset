# RabiatS/SmolVLM-500M-Instruct-4bit-Lantern

## Resumen

SmolVLM-500M-Instruct-4bit-Lantern es una copia en formato MLX de 4 bits del modelo multimodal SmolVLM-500M-Instruct de HuggingFaceTB, publicada por el autor RabiatS para su uso dentro de Lantern, una aplicacion de IA para iPhone, iPad y Mac que funciona de forma totalmente local. El modelo acepta texto e imagenes como entrada y genera texto, es decir, se encuadra en la tarea image-text-to-text. Su tamano real es de 507.482.304 parametros (aproximadamente 0,5 mil millones), con un repositorio de unos 0,3 GB.

La relevancia de esta ficha no esta en una innovacion de arquitectura ni en un nuevo entrenamiento, sino en el empaquetado: los pesos son identicos a la conversion de mlx-community (mlx-community/SmolVLM-500M-Instruct-4bit) y el modelo original es HuggingFaceTB/SmolVLM-500M-Instruct. El valor anadido es la integracion con Lantern, que ejecuta el modelo enteramente en el dispositivo: sin cuenta, sin servidor y sin que el contenido del usuario salga del terminal. El unico uso de red es la descarga inicial de los archivos.

Se trata, por tanto, de un modelo pequeno orientado a inferencia on-device en hardware Apple Silicon. El propio autor lo describe como util para describir una foto de forma rapida, con la advertencia explicita de que, al ser tan pequeno, "pierde detalle". No se publican datos de entrenamiento, benchmarks ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (modelo vision-language multimodal, segun los tags del repositorio) |
| Parametros totales | 507.482.304 (aproximadamente 0,5 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se aportan detalles de entrenamiento en la informacion disponible. Lo unico verificable es que la arquitectura declarada en los tags es Idefics3, un modelo multimodal de tipo vision-language que combina un codificador de imagen con un modelo de lenguaje para producir respuestas de texto a partir de entradas de imagen y texto. El pipeline declarado es image-text-to-text.

Este repositorio no es un entrenamiento nuevo ni un ajuste fino: es una copia de la conversion a 4 bits de mlx-community (mlx-community/SmolVLM-500M-Instruct-4bit), cuyos pesos se mantienen sin cambios respecto a esa conversion. El modelo original es HuggingFaceTB/SmolVLM-500M-Instruct. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en los materiales proporcionados.

## Capacidades

- Generacion de texto a partir de imagenes (descripcion de fotografias, image-text-to-text).
- Conversacion multimodal de ida y vuelta (tag "conversational"), aceptando texto e imagenes como entrada.
- Descripcion basica de escenas en el propio dispositivo, sin conexion a red.
- Ejecucion completamente local y privada: el autor indica que nada de lo que escribe el usuario sale del dispositivo.
- Orientado a despliegue on-device en iPhone, iPad y Mac con Apple Silicon.

No hay informacion sobre soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo "thinking", audio ni capacidades multilingues declaradas.

## Casos de uso

- Descripcion de fotografias en el movil: el modelo recibe una imagen y genera una descripcion en texto de forma local, adecuado para apps que necesitan funcionar sin conexion y sin enviar imagenes a un servidor.
- Accesibilidad para personas con discapacidad visual: lectura y narracion de imagenes capturadas con la camara del dispositivo, ejecutandose en el propio terminal.
- Etiquetado y organizacion de fotos: generacion de etiquetas o descripciones cortas para construir un indice local de la fototeca personal, sin subir contenido a la nube.
- Asistente conversacional privado: dialogos multi-turno sobre imagenes en apps iOS/iPadOS/macOS donde la confidencialidad es requisito, ya que el modelo no depende de servidores externos.
- Prototipado de funciones de vision en apps Apple: al estar en formato MLX y pesar unos 0,3 GB, permite integrar rapidamente una capacidad de imagen-a-texto en un proyecto para Mac o dispositivo movil de Apple.
- Educacion y demostraciones: uso como ejemplo ligero de VLM on-device en talleres, pruebas de concepto o material docente sobre inferencia local en Apple Silicon.
- Filtrado o clasificacion simple de imagenes: descripciones generadas localmente que alimenten reglas o clasificadores posteriores en un flujo completamente offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de vision, y tampoco ofrece comparaciones numericas con otros modelos.

## Requisitos de hardware

- Descarga del repositorio: aproximadamente 0,3 GB.
- Precision: 4 bits en formato MLX, lo que reduce el espacio en disco y la memoria necesaria respecto a los pesos originales.
- Plataformas objetivo: iPhone, iPad y Mac con Apple Silicon. La aplicacion Lantern comprueba la memoria del dispositivo antes de descargar el modelo.
- No esta disenado para GPUs NVIDIA: el formato y la libreria (MLX) apuntan al ecosistema de Apple. No hay datos de VRAM para A100, H100 o RTX 4090.
- Opciones de despliegue: la app Lantern (on-device) y mlx-vlm en Mac. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles. El autor describe el modelo como "tiny, so it's quick" (muy pequeno, por lo que es rapido), sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RabiatS/SmolVLM-500M-Instruct-4bit-Lantern | 507.482.304 | no disponible | safetensors, 4-bit MLX | apache-2.0 | HuggingFace, integrado en Lantern |
| mlx-community/SmolVLM-500M-Instruct-4bit | no disponible | no disponible | MLX, 4-bit | no disponible | HuggingFace |
| HuggingFaceTB/SmolVLM-500M-Instruct | aproximadamente 0,5 mil millones | no disponible | safetensors (pesos originales) | apache-2.0 | HuggingFace |

La diferencia principal frente a mlx-community/SmolVLM-500M-Instruct-4bit es el empaquetado: el repositorio de RabiatS mantiene los mismos pesos y anade la integracion con la app Lantern. Frente al modelo original de HuggingFaceTB, la diferencia es la cuantizacion a 4 bits en MLX, orientada a ejecucion on-device.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "pierde detalle" (misses detail) porque es muy pequeno; no es adecuado para tareas que exijan descripciones finas o razonamiento visual complejo.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos: puede describir elementos que no estan en la imagen o generar texto plausible pero incorrecto.
- No se declara la lista de idiomas soportados; el comportamiento multilingue es desconocido.
- No se especifica la longitud de contexto, lo que dificulta planificar conversaciones largas o entradas de muchas imagenes.
- Es una copia de una conversion de terceros (mlx-community), no un ajuste fino propio; la calidad depende integramente del modelo base y de esa conversion.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar tambien las condiciones del modelo base y de la conversion original.
- Dependencia de Apple Silicon y de la libreria MLX: no es directamente portable a otros aceleradores sin reconvertir los pesos.
- En produccion, el comportamiento y la robustez no estan respaldados por benchmarks publicos en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RabiatS/SmolVLM-500M-Instruct-4bit-Lantern
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Conversion original en MLX: https://huggingface.co/mlx-community/SmolVLM-500M-Instruct-4bit
- Aplicacion Lantern: https://github.com/RabiatS/lantern
