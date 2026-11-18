# faisalhr1997/smolscope

## Resumen

SMOLSCOPE es un proyecto de demostración creativa publicado en Hugging Face bajo el identificador `faisalhr1997/smolscope`. No se trata de un modelo entrenado por el autor, sino de un paquete de artefactos (notebook de Colab, aplicación Gradio y scripts auxiliares) que orquestan la inferencia del modelo **SmolVLM2-256M-Video-Instruct** de Hugging Face, ejecutado en formato GGUF a través de `llama.cpp` sobre una GPU T4 de Google Colab.

El objetivo del proyecto es ofrecer un laboratorio de visión-lenguaje de bajo coste con seis modos de interacción (descripción de imágenes, análisis de vídeo, OCR, comparación multi-imagen, extracción de JSON y análisis temporal con marcas de tiempo), además de una aplicación dedicada a generar *reverse prompts* a partir de vídeos. La propuesta es interesante para desarrolladores que quieran experimentar con VLM pequeños en hardware consumer o gratuito en la nube, aunque el propio autor advierte que la calidad de OCR y razonamiento es proporcional al tamaño del modelo subyacente.

La información disponible no incluye detalles sobre entrenamiento, licencia, idiomas ni benchmarks del modelo base; todos esos datos deben consultarse en la model card oficial de SmolVLM2-256M-Video-Instruct, fuera del alcance de esta ficha. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el proyecto empaqueta SmolVLM2-256M-Video-Instruct; arquitectura del modelo base no detallada en la información) |
| Parámetros totales | 256M (según el nombre del modelo base SmolVLM2-256M-Video-Instruct) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `Q4_K_M` para el modelo y `Q8_0` para el proyector multimodal (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo + mmproj GGUF) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente. Por el nombre del modelo base (SmolVLM2-256M-Video-Instruct) se infiere que se trata de un VLM pequeño con capacidad de procesar vídeo e instrucciones, pero no se aportan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO. El proyecto en sí no entrena ningún modelo: se limita a descargar dos GGUF (modelo `Q4_K_M` y proyector `Q8_0`) y servirlos con `llama.cpp` en el puerto 8000, exponiendo un endpoint compatible con `/v1/chat/completions`.

La innovación técnica del repositorio está en la capa de aplicación: `timeline.py` muestrea fotogramas de vídeo en tiempos reales con OpenCV, parsea subtítulos VTT generados por `yt-dlp` (eliminando repeticiones rodantes), analiza los fotogramas en ventanas compatibles con el contexto del modelo y fusiona señales visuales y de habla en una línea temporal con marcas de tiempo y un *reverse prompt*. La telemetría (latencia, tokens, tok/s) se obtiene en tiempo de ejecución de `response.usage`, sin cifras prefijadas.

## Capacidades

- Descripción de imágenes: caption, descripción detallada y listado de objetos.
- Análisis de vídeo: muestreo de fotogramas con OpenCV y razonamiento sobre ellos.
- OCR fiel de capturas de pantalla, gráficos y recibos (con la limitación de calidad propia de un modelo de 256M).
- Comparación de 2 a 4 imágenes en un mismo mensaje para enumerar diferencias.
- Extracción estructurada: salida exclusivamente en JSON con campos nombrados.
- Modo "speedrun": caption de una frase con latencia y tok/s medidos.
- Análisis temporal de vídeo: entradas, movimientos de cámara, fondo, transiciones y generación de un *reverse prompt*.
- Integración con subtítulos de `yt-dlp` para fusionar habla y visuales en la línea temporal.
- Servicio mediante endpoint compatible con la API de chat completions de OpenAI (`/v1/chat/completions`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo *thinking*.

## Casos de uso

- **Análisis de vídeo con marcas de tiempo**: usar `timeline.py` para muestrear fotogramas y fusionarlos con subtítulos VTT, generando una línea temporal de eventos y un *reverse prompt* útil para documentar o recrear un vídeo.
- **Generación de *reverse prompts* para vídeo**: la app `reverse_app.py` recibe una URL o fichero, lo descarga, y devuelve únicamente el prompt inverso, útil para pipelines de generación de vídeo con IA.
- **OCR ligero en capturas y recibos**: el modo "Read" permite extraer texto de imágenes en entornos con recursos limitados, aceptando la pérdida de precisión propia de un modelo de 256M.
- **Etiquetado y descripción automática de imágenes**: el modo "Describe" sirve para generar captions y listados de objetos en catálogos pequeños o datasets de prueba.
- **Extracción de datos estructurados**: el modo "Extract" fuerza salida JSON con campos nombrados, útil para prototipos de ingesta de documentos.
- **Comparación visual de imágenes**: el modo "Compare" permite enumerar diferencias entre 2 y 4 imágenes, aplicable a control de calidad visual o revisión de cambios en capturas.
- **Prototipado rápido en Colab**: el notebook `smolscope.ipynb` permite levantar todo el stack en una T4 gratuita, ideal para demos, docencia o validación de conceptos antes de invertir en infraestructura.
- **Evaluación de latencia en hardware consumer**: el modo "Speedrun" mide latencia y tok/s reales, útil para decidir si el modelo cabe en un despliegue concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el proyecto está diseñado para ejecutarse en una GPU T4 de Google Colab (16 GB de VRAM), por lo que el consumo real es inferior a esa cifra con `Q4_K_M` + `Q8_0` mmproj.
- **GPU recomendadas**: Google Colab T4 (objetivo del proyecto). No se documentan otras GPU.
- **GPU consumer**: por el tamaño del modelo (256M en Q4_K_M) es razonable esperar que quepa en GPUs consumer de gama media, aunque la información proporcionada no lo confirma con cifras.
- **Opciones de despliegue**: `llama.cpp` sirviendo en el puerto 8000; Gradio para la UI; Cloudflare quick tunnel para exponer la UI en Colab (el `share=True` de Gradio se describe como poco fiable en Colab). El endpoint es compatible con `/v1/chat/completions`, por lo que puede integrarse con clientes tipo OpenAI.
- **Latencia y throughput**: no se aportan cifras concretas; el proyecto mide latencia y tok/s en tiempo de ejecución mediante `response.usage`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el proyecto es un envoltorio de demostración sobre SmolVLM2-256M-Video-Instruct más que un modelo comparable por sí mismo.

## Limitaciones y advertencias

- La calidad de OCR y razonamiento es proporcional al tamaño del modelo (256M); el propio autor lo advierte explícitamente.
- El timing exacto de eventos en el análisis temporal es aproximado: se deriva de los fotogramas muestreados, no de detección precisa de eventos.
- El proyecto depende de `yt-dlp` para subtítulos y de OpenCV para muestreo de vídeo; fallos en esas dependencias afectan a los modos de vídeo.
- En Colab, el proxy ocupa el puerto 8080, por lo que la API se sirve en el 8000; el `share=True` de Gradio se describe como poco fiable y se sustituye por un túnel de Cloudflare.
- Licencia no disponible: no se puede confirmar el uso comercial del paquete ni del modelo base sin consultar la model card original de SmolVLM2-256M-Video-Instruct.
- Idiomas soportados no disponibles.
- Riesgo de alucinación inherente a modelos pequeños de visión-lenguaje; no se documentan sesgos conocidos.
- El repositorio tiene 0 descargas y 0 likes, y las fechas de creación/actualización (2026-11-18) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia del proyecto antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/faisalhr1997/smolscope
- Notebook de Colab: https://colab.research.google.com/ (referenciado en la model card; no se proporciona URL directa)
- Modelo base referenciado: SmolVLM2-256M-Video-Instruct (no se proporciona URL directa en la información disponible)
