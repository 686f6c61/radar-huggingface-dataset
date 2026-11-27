# divinetribe/AesCode-32B-abliterated-MLX-8bit

## Resumen

AesCode-32B-abliterated-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo microsoft/AesCode-32B, un finetune de Qwen3-VL-32B-Instruct especializado en generar codigo HTML y CSS a partir de capturas de pantalla. El modelo original lo desarrolla el equipo de AesCode en Microsoft y su tarea principal es la reconstruccion de interfaces visuales (slides, posters, dashboards, paginas de producto) en codigo web funcional. Esta version concreta la publica el usuario divinetribe y esta pensada para ejecutarse en Apple Silicon mediante mlx-vlm.

La arquitectura subyacente es un transformer multimodal Qwen3VLForConditionalGeneration con 33.357 millones de parametros totales. La cuantizacion reduce el tower de lenguaje a 8 bits mientras mantiene los 351 tensores del vision tower en bfloat16, de modo que la ruta de imagen conserva su calidad. Ademas, se ha aplicado una ablacion direccional de rechazo (Arditi et al. 2024) sobre el tower de lenguaje, tomando la direccion de la capa 44 de 64, lo que elimina la direccion de rechazo del modelo.

El interes de esta build es practico: permite ejecutar un modelo de 32B multimodal en local sobre un Mac, sin claves de API ni telemetria, con un tamano en disco de unos 34 GB. Es relevante para desarrolladores que quieran generar maquetacion web a partir de imagenes sin depender de servicios en la nube, asumiendo las implicaciones de la abliteracion y de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal, vision tower + language tower) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en el language tower; bf16 en el vision tower (existen variantes bf16 y 4 bits de la misma familia) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un finetune de Qwen3-VL-32B-Instruct, un transformer multimodal que combina un vision tower (351 tensores `vision_tower.*`) con un language tower de 64 capas. AesCode-32B se entrena especificamente para generacion de codigo estetico: recibe una imagen de referencia y produce HTML y CSS que la recrean. El paper asociado, "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), describe el entrenamiento con recompensas multimodales desacopladas, si bien esta ficha no dispone del detalle del dataset ni del numero de tokens empleados.

Sobre esta build se aplican dos transformaciones. Primero, una ablacion direccional de rechazo sobre el language tower, usando la direccion calculada en la capa 44 de 64 segun el metodo de Arditi et al. (2024); el vision tower no se modifica. Segundo, una cuantizacion a 8 bits del language tower, manteniendo el vision tower en bfloat16. El autor indica que cada tamano de la familia pasa una prueba de vision antes de publicarse: se introduce una captura real de una pagina de producto y se comprueba que el modelo identifica elementos de la pagina y genera texto alternativo utilizable. Esta build de 8 bits supero dicha prueba.

## Capacidades

- Generacion de codigo HTML y CSS a partir de capturas de pantalla, con salida en un unico fichero con CSS inline.
- Reconstruccion de interfaces visuales: slides, posters, dashboards y paginas de producto.
- Comprension de imagenes mediante el vision tower conservado en bf16.
- Auditoria de paginas web: el autor documenta usos de revision SEO, marketing y accesibilidad, ademas de generacion de texto alternativo para imagenes.
- Generacion de texto conversacional en ingles.
- Capacidades de codigo heredadas del backbone Qwen3-VL-32B-Instruct.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Reconstruccion de maquetacion web a partir de disenos: se introduce una captura de un mockup o de una pagina existente y el modelo devuelve un fichero HTML con CSS inline que reproduce la estructura y los estilos, util para prototipado rapido.
- Migracion de paginas legacy: dada una captura de una pagina antigua, el modelo genera una version moderna del marcado y los estilos, reduciendo el trabajo manual de transcripcion.
- Generacion de dashboards y slides: el modelo produce el codigo de paneles de datos o presentaciones a partir de una imagen de referencia, adecuado para equipos que iteran sobre disenos visuales.
- Auditoria SEO y de accesibilidad: el modelo analiza una captura de pagina, identifica encabezados, elementos interactivos y carencias de texto alternativo, y propone correcciones, como demuestra el ejemplo del autor sobre una pagina de producto real.
- Generacion de texto alternativo para catalogos de imagenes: se procesan imagenes de producto y el modelo redacta descripciones utilizables en atributos `alt`, aprovechando la ruta de vision en bf16.
- Desarrollo local sin nube: al ejecutarse con mlx-vlm sobre Apple Silicon, permite integrar la generacion de codigo visual en flujos de trabajo de un Mac sin enviar capturas a servicios externos, relevante para materiales confidenciales.
- Asistencia dentro de editores locales: el autor menciona su integracion con Claude Code Local, de modo que el modelo actua como backend local para tareas de generacion de codigo en el editor.

## Benchmarks y rendimiento

Los datos disponibles proceden del benchmark del paper de AesCode, con 300 muestras de estilo infografico puntuadas por cumplimiento de reglas y calidad visual. Son cifras del modelo original, no de esta cuantizacion.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks especificos de esta cuantizacion de 8 bits en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa unos 36 GB y el autor indica aproximadamente 34 GB en disco; se necesita un Mac con memoria unificada suficiente para cargar el modelo completo, en la practica 36 GB o mas.
- GPU recomendadas: Apple Silicon de la serie M con memoria unificada amplia (M-series); el modelo esta empaquetado para MLX y no para CUDA.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente; no esta pensado para GPUs NVIDIA consumer en este formato.
- Opciones de despliegue: mlx-vlm sobre Apple Silicon; el autor menciona su integracion con Claude Code Local. Otros motores (vLLM, llama.cpp, Ollama, TGI) no estan indicados para este formato MLX en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-8bit | 33.357 M | no disponible | Imagen a HTML/CSS, multimodal | apache-2.0 | Hugging Face (MLX) |
| microsoft/AesCode-32B | no disponible | no disponible | Imagen a HTML/CSS, multimodal | no disponible | Hugging Face |
| Qwen/Qwen3-VL-32B-Instruct | no disponible | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (generacion de codigo a partir de imagen) no esta disponible en la informacion proporcionada mas alla del modelo base y del backbone.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo del modelo; esto puede producir respuestas ante peticiones que el modelo original rechazaria, con implicaciones de seguridad y de cumplimiento que recaen en quien lo despliega.
- La cuantizacion a 8 bits reduce precision: no anade conocimiento y no garantiza que la salida sea correcta, como advierte el propio autor.
- Riesgo de alucinacion en la generacion de codigo y en las auditorias: el modelo puede describir elementos inexistentes en la imagen o generar marcado que no reproduzca fielmente el diseno.
- Idioma: la model card declara solo ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla antes de usarla con capturas de gran resolucion o conversaciones largas.
- Licencia apache-2.0, que permite uso comercial, pero las condiciones del modelo base y del backbone deben verificarse de forma independiente.
- Formato MLX: no es portable a ecosistemas CUDA sin conversion previa.
- El benchmark citado es del autor del modelo original y de su propio conjunto de 300 muestras; no existe una clasificacion publica independiente para AesCode.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Variante 4 bits: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de ablacion de rechazo: https://arxiv.org/abs/2406.11717
- Herramienta mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
