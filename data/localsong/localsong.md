# Localsong/Localsong

## Resumen

Localsong es un modelo de generacion de musica instrumental condicionada por etiquetas, desarrollado por el usuario Localsong. Esta especializado en canciones de videojuegos y anime, y permite generar piezas de 95 segundos en audio estereo a partir de 1 a 6 etiquetas descriptivas (por ejemplo, "epic", "piano", "orchestral"). El modelo resuelve el problema de generar musica tematica coherente sin necesidad de letras ni descripciones largas, mediante un enfoque de difusion latente sobre audio.

La arquitectura combina un autoencoder SAME-L de Stability AI con un transformer de difusion en 1D (AudioDiT) de 1.19B parametros, entrenado desde cero durante 8 dias en una GPU H100. Incorpora innovaciones recientes como la fusion densa-esparsa (SPRINT) y el muestreo por flujo rectificado, con una ruta de guia alternativa que permite una rama "debil" de baja profundidad. El proyecto se publica bajo licencia MIT, aunque el decodificador SAME-L que carga esta sujeto a la licencia de estabilidad.

Es relevante porque ofrece una alternativa ligera y abierta a los modelos de musica comerciales, con un enfoque en un nicho concreto (bandas sonoras de juegos y anime) y una interfaz web sencilla que se ejecuta con CUDA, MPS o CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de 1 dimension sobre latents de audio (AudioDiT) con fusion densa-esparsa (SPRINT) y autoencoder SAME-L |
| Parametros totales | 1,19B (denoiser) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256×1024 latents (equivale a 95 segundos de audio estereo) |
| Tipos de cuantizacion | no disponibles (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (las etiquetas de entrada son texto, pero no se documenta un conjunto de idiomas; el modelo no genera voz) |
| Licencia | MIT (modelo y codigo propio); los pesos de SAME-L estan bajo Stable Audio Community License de Stability AI |
| Formato de pesos | safetensors (repositorio de 12.5 GB) |

## Arquitectura y entrenamiento

El modelo genera musica condicionada por etiquetas de texto. El pipeline es: las etiquetas se procesan mediante atencion cruzada en un DiT de 1 dimension (1D latent transformer) que denoisifica latents de 256×1024, y el decodificador SAME-L de Stability AI convierte esos latents en audio estereo de 95 segundos. El denoiser usa RMSNorm, QK-RMSNorm, RoPE y SwiGLU, con condicionamiento de tiempo mediante adaLN-single (estilo PixArt) y offset de tiempo.

La arquitectura incorpora fusion densa-esparsa (SPRINT, arxiv 2510.21986): los bloques se dividen en un encoder denso de 2 bloques, una pila central de 20 bloques y un decoder denso de 2 bloques. Durante el entrenamiento, la pila central se ejecuta solo sobre un 25% aleatorio de los frames y a veces se elimina por completo, lo que permite que la ruta superficial (encoder→fusion→decoder) funcione como un modelo debil por si sola. En inferencia, la pila central se ejecuta sobre todos los frames y la ruta superficial se usa como rama de guia.

El entrenamiento se realizo desde cero durante 8 dias en una sola H100. El muestreo usa flujo rectificado con prediccion de latente limpio (x0), 50 pasos de Euler y time shift 3. La guia alterna entre CFG (classifier-free guidance) y PDG (guia por la ruta superficial). El modelo se apoya en los trabajos de DeCo, SPRINT, PixArt-alpha, DiT y rectified flow.

## Capacidades

- Generacion de musica instrumental de 95 segundos en audio estereo, condicionada por 1 a 6 etiquetas de texto.
- Especializado en musica de videojuegos y anime, aunque las etiquetas permiten explorar otros estilos.
- Soporte de condicionamiento por texto via cross-attention: el usuario puede elegir combinaciones de etiquetas (por ejemplo, "epic", "piano", "orchestral") y el modelo genera una pieza coherente.
- No genera voz ni letras; es un modelo instrumental.
- Ejecucion en CPU, CUDA o MPS, lo que permite desplegarlo en entornos variados.
- Interfaz web sencilla (webui.py) que expone un endpoint HTTP para generacion interactiva.
- No incluye tool calling, agentes ni capacidades de razonamiento multimodal: es un modelo de generacion de audio puro.

## Casos de uso

- Prototipado de bandas sonoras para videojuegos: un desarrollador independiente puede generar pistas de 95 segundos para niveles o menus, iterando rapidamente con etiquetas como "boss battle", "dungeon" o "calm village".
- Composicion de musica para anime y cortos: creadores de contenido pueden producir temas instrumentales de fondo sin necesidad de derechos de autor, usando etiquetas descriptivas para evocar ambientes.
- Generacion de musica procedural para demos o game jams: al ser ligero (1.2B) y con licencia MIT, se puede integrar en herramientas de desarrollo para generar musica procedural en tiempo de diseno.
- Exploracion creativa y educacion musical: estudiantes y aficionados pueden estudiar como las etiquetas afectan la estructura musical, o usar el modelo como fuente de inspiracion para composiciones propias.
- Creacion de bibliotecas de musica stock: un estudio puede generar cientos de pistas instrumentales variadas y filtrarlas por etiquetas para catalogarlas como libreria de recursos.
- Prototipado de experiencias interactivas: en proyectos de instalaciones o demos, se puede generar musica condicionada por el estado del sistema (por ejemplo, etiquetas que cambian segun la accion del usuario) sin requerir composicion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de comparacion con otros modelos de generacion musical (por ejemplo, MMLU, FAD o CLAP scores) en la model card ni en la busqueda web.

## Requisitos de hardware

- VRAM estimada: no se publica un valor exacto. Como orientacion, un denoiser de 1.19B parametros en FP16 ocupa unos 2.4 GB en pesos, pero la generacion de latents 256×1024 y la memoria de activaciones durante los 50 pasos de Euler pueden requerir entre 8 y 16 GB de VRAM en funcion de la implementacion y del batch.
- GPU recomendadas: H100 (usada para entrenamiento) o GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060/4060 o superiores). Tambien es compatible con CPU y MPS (Apple Silicon), aunque con latencia mayor.
- Despliegue: se incluye un script webui.py que arranca una interfaz en http://127.0.0.1:7860. No se documenta integracion con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Con 50 pasos de Euler y un modelo de 1.2B, una generacion de 95 segundos de audio puede tardar del orden de minutos en GPU consumer, pero no se aportan medidas oficiales.

## Comparativa con modelos similares

No se dispone de datos tecnicos comparables de otros modelos en la informacion proporcionada. Como referencia cualitativa de la categoria de generacion de musica open source:

| Modelo | Genero | Condicionamiento | Duracion | Licencia | Parametros |
|---|---|---|---|---|---|
| Localsong | Instrumental (juego/anime) | 1-6 etiquetas | 95 s | MIT (con caveat SAME-L) | 1.19B |
| MiniMax Music 3 | Canciones completas con voz | Letra y descripcion | hasta 5 min | no disponible | no disponible |
| YuE | Canciones completas con voz | Letra y descripcion | no disponible | no disponible | no disponible |

Nota: MiniMax Music 3 y YuE son modelos de generacion musical open source con enfoque distinto (canciones con voz y letra, mayor duracion), pero no se han encontrado sus especificaciones tecnicas en la informacion disponible para una comparacion numerica rigurosa.

## Limitaciones y advertencias

- El modelo solo genera musica instrumental; no produce voz, letras ni efectos de voz.
- La duracion maxima es fija en 95 segundos; no se documenta como generar piezas mas largas o con estructura en movimientos.
- El numero de etiquetas se limita a 1-6 y se recomienda empezar con 1; combinaciones complejas pueden degradar la calidad.
- La calidad de la generacion depende de la eleccion de etiquetas; no se documentan etiquetas invalidas ni control fino sobre el estilo.
- El decodificador SAME-L se distribuye bajo la Stable Audio Community License de Stability AI, lo que impone condiciones de uso comercial adicionales a la licencia MIT del resto del codigo. Consultar https://stability.ai/license antes de usar comercialmente.
- El entrenamiento se realizo en un solo H100 durante 8 dias, con datos no especificados; puede haber sesgos hacia los generos de juego y anime representados en el dataset, y no se documenta la composicion del dataset.
- No se han publicado evaluaciones de calidad, robustez frente a etiquetas adversas ni pruebas de seguridad.
- El proyecto es reciente (creado en 2026-07-26) y cuenta con pocas descargas y un solo like, lo que indica una adopcion limitada y una madurez comunitaria baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Localsong/Localsong
- Modelos del autor: https://huggingface.co/Localsong/models
- Autoencoder SAME-L: https://huggingface.co/stabilityai/SAME-L
- Articulo SPRINT: https://arxiv.org/abs/2510.21986
- Articulo PixArt-alpha: https://arxiv.org/abs/2310.00426
- Articulo DiT: https://arxiv.org/abs/2212.09748
- Articulo Rectified Flow: https://arxiv.org/abs/2209.03003
- Repositorio de Stable Audio 3: https://github.com/Stability-AI/stable-audio-3
- Licencia de Stability: https://stability.ai/license
