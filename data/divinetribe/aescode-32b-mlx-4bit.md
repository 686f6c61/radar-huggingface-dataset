# divinetribe/AesCode-32B-MLX-4bit

## Resumen

AesCode-32B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecución nativa en Apple Silicon. AesCode-32B es a su vez un finetune de Qwen/Qwen3-VL-32B-Instruct (arquitectura `Qwen3VLForConditionalGeneration`) especializado en una tarea muy concreta: recibir una captura de pantalla y generar el HTML y CSS necesarios para recrearla (presentaciones, pósters, dashboards, páginas de producto). El problema que resuelve es la generación de código estético a partir de una referencia visual, un caso de uso que los modelos generalistas abordan con menor fidelidad.

La innovación técnica de esta publicación concreta está en la estrategia de cuantización selectiva: solo la torre de lenguaje se reduce a 4 bits, mientras que los 351 tensores `vision_tower.*` se mantienen en bfloat16. De este modo se reduce el peso en disco hasta unos 18 GB (frente a los 19,6 GB del repositorio y aproximadamente el cuádruple en bf16) sin degradar la ruta de imagen, que es precisamente la entrada crítica del modelo. El resultado es un modelo multimodal de 33.357.390.064 parámetros totales ejecutable de forma local y privada en un Mac de la serie M.

Es relevante ahora porque permite probar un modelo especializado en generación de UI a partir de imágenes sin depender de APIs en la nube ni de GPUs dedicadas, con licencia Apache 2.0 y soporte del ecosistema mlx-vlm. La contrapartida es que el público objetivo es limitado (usuarios de Apple Silicon), el idioma declarado es únicamente inglés y el número de descargas en el momento de la ficha es muy bajo (28).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3VLForConditionalGeneration` (torre de visión + torre de lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit en la torre de lenguaje; bf16 en la torre de visión (351 tensores `vision_tower.*`); existen variantes bf16 y 8-bit de la misma familia |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), biblioteca `mlx` / `mlx-vlm` |

## Arquitectura y entrenamiento

El modelo base AesCode-32B es un finetune de Qwen3-VL-32B-Instruct, un modelo multimodal que combina una torre de visión con una torre de lenguaje de tipo transformer. La model card del autor de la cuantización no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo etapas de RLHF o DPO; esa información correspondería al paper del modelo original (arXiv:2610.18860), que no se incluye en los datos proporcionados. El nombre del paper, "Aesthetic Code Generation with Decoupled Cross-Modal Rewards", sugiere un entrenamiento con recompensas multimodales desacopladas para optimizar la calidad estética del código generado, pero el detalle técnico no está disponible en la información consultada.

La aportación técnica de esta build es la cuantización selectiva: la torre de lenguaje se comprime a 4 bits y la torre de visión permanece en bfloat16, preservando los 351 tensores de visión junto con `vision_config` y los configs del procesador. El autor declara un control de calidad previo a la publicación consistente en introducir una captura real de una página de producto y solicitar una auditoría SEO, de marketing y de accesibilidad más textos alternativos de imagen; la build de 4 bits superó ese control. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código HTML y CSS a partir de una imagen de referencia (captura de pantalla, mockup, póster, dashboard, página de producto).
- Comprensión de imágenes: identificación de elementos de interfaz, jerarquía visual, tipografía, disposición en columnas y componentes de formulario.
- Auditoría de páginas a partir de captura: análisis SEO, de marketing y de accesibilidad, incluida la redacción de textos alternativos para imágenes.
- Generación de texto conversacional en inglés.
- Capacidad multimodal de entrada imagen-texto y salida de texto (pipeline `image-text-to-text`).
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, modo thinking, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Recreación de mockups en código: se introduce una captura de un diseño y el modelo devuelve un único archivo HTML con CSS en línea, útil para prototipado rápido de interfaces antes de trasladar el resultado a un framework de producción.
- Migración de diseños legacy a web: a partir de capturas de sistemas antiguos se generan maquetas HTML modernas que sirven como punto de partida para la reimplementación.
- Auditoría de accesibilidad y SEO sin salir del portátil: el modelo analiza la captura de una página y produce textos alternativos, observaciones sobre la jerarquía de encabezados y recomendaciones de contenido, con la ventaja de que todo el procesamiento ocurre localmente en el Mac.
- Generación de páginas de producto para comercio electrónico: dado el ejemplo validado por el autor (ficha de producto con galería, valoraciones, insignias de confianza y pestañas), encaja en flujos de creación de plantillas para catálogos.
- Creación de dashboards y presentaciones a partir de referencias visuales: el modelo traduce una imagen de panel de control o de slide a estructura HTML/CSS, lo que acelera la producción de informes internos o demos.
- Desarrollo asistido en local para entornos con requisitos de privacidad: al ejecutarse con mlx-vlm sin telemetría ni claves de API, es apto para equipos que no pueden enviar capturas de producto o interfaces internas a servicios en la nube.
- Prototipado de material gráfico (pósters, infografías): la evaluación del modelo original se realizó sobre 300 muestras de estilo infográfico, por lo que la generación de layouts de este tipo es un escenario directamente cubierto.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper y la model card de AesCode-32B original, no de esta cuantización. La evaluación se realizó sobre 300 muestras de estilo infográfico, con puntuación de corrección en el seguimiento de reglas y calidad visual. No existe un leaderboard público independiente que liste AesCode.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

Advertencia: las comparaciones con Claude Opus 4.8 y GPT-5.5 se hacen sin imagen de referencia, por lo que no son estrictamente equivalentes. No se han publicado resultados de benchmarks específicos de la versión MLX-4bit en la información disponible; el autor solo indica que superó el control cualitativo de visión descrito en la model card.

## Requisitos de hardware

- Tamaño en disco de esta build: aproximadamente 18 GB (el repositorio de Hugging Face ocupa 19,6 GB).
- Memoria unificada estimada: se necesita espacio para los pesos de 4 bits más el contexto y los estados de activación; en la práctica, un Mac con 32 GB de memoria unificada o más es el entorno razonable, aunque el autor no publica una cifra oficial de memoria mínima.
- GPU compatibles: exclusivamente Apple Silicon (serie M). No está pensado para CUDA ni para GPUs discretas tipo A100, H100 o RTX 4090.
- Cabe en equipos de consumo: sí, en Macs de la serie M con memoria unificada suficiente; no aplica a GPUs de consumo convencionales por el formato MLX.
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`), con soporte de la biblioteca `mlx` de Apple. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-4bit | 33,36 B | no disponible | Imagen a HTML/CSS, cuantizado 4-bit MLX | Apache 2.0 | Hugging Face, Apple Silicon |
| AesCode-32B-MLX-bf16 | 33,36 B | no disponible | Misma tarea, precisión completa | Apache 2.0 | Hugging Face, Apple Silicon |
| AesCode-32B-MLX-8bit | 33,36 B | no disponible | Misma tarea, 8 bits | Apache 2.0 | Hugging Face, Apple Silicon |
| Qwen3-VL-32B-Instruct | 32 B (aprox.) | no disponible | Visión-lenguaje generalista | no disponible en la información | Hugging Face |

La comparación más directa es con las otras dos cuantizaciones de la misma familia publicadas por divinetribe: bf16 (calidad completa, mayor peso), 8-bit (mitad de tamaño) y esta 4-bit (un cuarto del tamaño). Frente a Qwen3-VL-32B-Instruct, el modelo base, AesCode incorpora el finetune específico para generación de código estético, pero se desconoce el detalle de sus parámetros y contexto exactos en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- La cuantización a 4 bits reduce precisión: el propio autor advierte que no añade conocimiento ni garantiza corrección en la salida.
- Riesgo de alucinación en la recreación de interfaces: puede inventar elementos no presentes en la captura o interpretar erróneamente componentes poco habituales.
- Longitud de contexto no documentada, lo que dificulta planificar entradas con capturas de alta resolución o conversaciones largas.
- Dependencia de hardware: el formato MLX limita su uso a Apple Silicon; no es desplegable en infraestructura CUDA sin reconversión.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Qwen3-VL hereda los del modelo base, no evaluados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base microsoft/AesCode-32B y de Qwen3-VL-32B-Instruct, ya que la información disponible no detalla posibles restricciones adicionales en la cadena de derivación.
- Madurez: 28 descargas y 0 likes en el momento de la ficha; no hay validación independiente de esta cuantización concreta.
- El control de calidad del autor es cualitativo y basado en una única captura de una página real, no en un conjunto de evaluación amplio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Base del finetune: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Paper: https://arxiv.org/abs/2610.18860
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor: https://huggingface.co/divinetribe
- Página del autor: https://nicedreamzwholesale.com/software/huggingface/
