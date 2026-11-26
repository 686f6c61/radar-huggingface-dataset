# divinetribe/AesCode-32B-MLX-8bit

## Resumen

AesCode-32B-MLX-8bit es una cuantizacion en 8 bits del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecucion nativa en Apple Silicon mediante la libreria MLX. AesCode-32B es a su vez un finetune de Qwen/Qwen3-VL-32B-Instruct (arquitectura `Qwen3VLForConditionalGeneration`) especializado en generacion de codigo estetico: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrear esa interfaz (presentaciones, posters, dashboards, paginas de producto).

La particularidad de esta build es que solo se cuantiza la torre de lenguaje a 8 bits, mientras que los 351 tensores `vision_tower.*` se mantienen en bfloat16, de modo que la ruta de vision conserva su calidad. El resultado ocupa aproximadamente 34 GB en disco (el repo pesa 36,0 GB) frente al bf16 completo, y esta pensado para maquinas con menos memoria unificada.

El modelo es relevante para desarrolladores que quieran ejecutar un modelo multimodal de 33.357.390.064 parametros de forma totalmente local y privada en un Mac, sin claves de API ni telemetria, integrable en herramientas como Claude Code Local. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3VLForConditionalGeneration` (torre de lenguaje + torre de vision) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en la torre de lenguaje; bf16 en la torre de vision (351 tensores `vision_tower.*`). Existen variantes bf16 y 4 bits en la misma familia |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base AesCode-32B parte de Qwen3-VL-32B-Instruct, un transformer multimodal con torre de vision y torre de lenguaje. Sobre esa base, el equipo de Microsoft realizo un finetune orientado a la generacion de codigo estetico, descrito en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860). El enfoque del paper se basa en recompensas multimodales desacopladas, es decir, la optimizacion separa la senal de correccion en el seguimiento de reglas (que el codigo sea funcional y respete la estructura) de la senal de calidad visual (que el resultado renderizado se parezca a la referencia).

Esta build concreta no reentrena el modelo: aplica cuantizacion de 8 bits a la torre de lenguaje y conserva la torre de vision en bfloat16 para no degradar la percepcion de imagen. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el finetune original. El autor de la cuantizacion indica que valido cada tamano de la familia con una prueba de vision antes de publicarlo: introdujo una captura real de una pagina de producto y comprobo que la build de 8 bits seguia leyendo los elementos de la pagina (H1, badges de confianza, boton de compra) y generando texto alternativo utilizable.

## Capacidades

- Generacion de codigo HTML y CSS a partir de una imagen de referencia (image-to-code), incluyendo maquetacion, estilos inline y estructura semantica.
- Recreacion de interfaces: slides, posters, dashboards, paginas de producto y otras composiciones visuales.
- Comprension de imagenes: lectura de capturas de pantalla, identificacion de elementos on-page y generacion de texto alternativo para imagenes.
- Auditoria de paginas a partir de una captura: SEO, marketing y accesibilidad, segun la prueba descrita en la model card.
- Conversacion multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Capacidades heredadas del backbone Qwen3-VL-32B-Instruct en tareas generales de vision y lenguaje (no evaluadas de forma independiente para esta build).
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del modelo.

## Casos de uso

- Recreacion de mockups en HTML/CSS: se introduce una captura de diseno y el modelo devuelve un unico archivo HTML con CSS inline, util para prototipado rapido de interfaces sin pasar por herramientas de diseno.
- Generacion de paginas de producto: dada la captura de una ficha de producto, el modelo reconstruye la maqueta y ademas redacta textos alternativos y observaciones de SEO y accesibilidad, como demuestra la prueba de validacion del autor.
- Desarrollo local y privado en Mac: al ejecutarse con `mlx-vlm` sobre Apple Silicon sin telemetria ni claves de API, encaja en entornos con requisitos de confidencialidad donde no se puede enviar codigo ni capturas a la nube.
- Integracion en asistentes de codigo de escritorio: el autor lo propone para su uso dentro de Claude Code Local, de modo que un desarrollador puede generar y revisar codigo de interfaz desde su propio portatil.
- Creacion de dashboards y presentaciones: a partir de una referencia visual, el modelo produce la estructura HTML necesaria para paneles de datos o slides, reduciendo el trabajo manual de maquetacion.
- Auditoria visual de paginas existentes: se le pasa una captura de una pagina en produccion y se le piden recomendaciones de jerarquia de encabezados, textos alternativos y elementos de confianza, util como primer filtro en revisiones de accesibilidad.
- Prototipado de posters y material promocional: convierte una referencia grafica en codigo renderizable, lo que facilita iterar sobre variantes sin rehacer el diseno desde cero.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del paper y de la model card del modelo original AesCode-32B, sobre un benchmark de 300 muestras de estilo infografico puntuadas por seguimiento de reglas y calidad visual. No son mediciones de esta build cuantizada.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| **AesCode-32B** | **85,89** | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | no disponible |
| GPT-5.5 (sin referencia) | 76,31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | no disponible |

No se han publicado resultados de benchmarks especificos de la version MLX 8 bits en la informacion disponible. Para evaluaciones de vision general del backbone, el autor remite a las evaluaciones oficiales de Qwen3-VL-32B-Instruct.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 34 GB en disco para los pesos; se necesita un Mac con memoria unificada suficiente para cargar el modelo completo, holgadamente por encima de esa cifra en la practica.
- GPU recomendadas: Apple Silicon de la serie M (M-series). No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en Macs con memoria unificada amplia; las variantes de 4 bits de la misma familia reducen el requisito a aproximadamente una cuarta parte del tamano para equipos mas modestos.
- Opciones de despliegue: `mlx-vlm` (libreria oficial de ejecucion), con el comando `python -m mlx_vlm.generate`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-8bit | 33,36 B | no disponible | Image-to-code estetico, cuantizado 8 bits para MLX | Apache 2.0 | Hugging Face (divinetribe) |
| AesCode-32B-MLX-bf16 | 33,36 B | no disponible | Misma tarea, precision completa | Apache 2.0 | Hugging Face (divinetribe) |
| AesCode-32B-MLX-4bit | 33,36 B | no disponible | Misma tarea, cuantizado 4 bits | Apache 2.0 | Hugging Face (divinetribe) |
| microsoft/AesCode-32B | 33,36 B | no disponible | Modelo original image-to-code | Apache 2.0 | Hugging Face (Microsoft) |
| Qwen/Qwen3-VL-32B-Instruct | 32 B (aprox.) | no disponible | Vision-lenguaje general | no disponible en esta ficha | Hugging Face (Qwen) |

Frente al modelo original, esta build sacrifica algo de precision a cambio de reducir el tamano a la mitad. Frente a Qwen3-VL-32B-Instruct, el finetune de AesCode mejora notablemente en la tarea especifica de generacion de codigo estetico (85,89 frente a 61,10 en el benchmark del paper), a costa de especializarse.

## Limitaciones y advertencias

- La cuantizacion a 8 bits reduce precision: no anade conocimiento y no garantiza que la salida sea correcta, tal como advierte el propio autor.
- El unico idioma declarado es el ingles; el rendimiento en castellano no esta verificado.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar tareas con entradas largas.
- Exclusivo para Apple Silicon via MLX: no es desplegable en CUDA, vLLM ni llama.cpp sin conversion adicional.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar elementos de la interfaz o atributos HTML que no aparecen en la imagen de referencia.
- Los benchmarks citados provienen del modelo original y de un unico benchmark de 300 muestras; no hay evaluacion independiente ni del modelo ni de la build cuantizada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del backbone Qwen3-VL antes de un despliegue en produccion.
- El modelo esta orientado a generacion de codigo visual; su uso como asistente general de codigo o de razonamiento no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Modelo original: https://huggingface.co/microsoft/AesCode-32B
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Variante 4 bits: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Herramienta de ejecucion: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Mas modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
