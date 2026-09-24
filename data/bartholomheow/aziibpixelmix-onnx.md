# Bartholomheow/aziibpixelmix-onnx

## Resumen

AziibPixelMix-ONNX es una exportación a formato ONNX del modelo de generación de imágenes AziibPixelMix Fast Mode, un mix de Stable Diffusion 1.5 con distilación LCM especializado en pixel art. Lo publica el usuario Bartholomheow en HuggingFace a partir de los pesos originales del creador "aziib" alojados en Civitai, y está diseñado específicamente para ejecutarse en el navegador mediante WebGPU a través de ONNX Runtime Web.

El modelo resuelve un problema concreto: permitir que una aplicación web genere imágenes de pixel art localmente, en el dispositivo del usuario, sin depender de un servidor con GPU. Para ello exporta el UNet en fp16 con ejes dinámicos de batch y resolución, el text encoder CLIP ViT-L/14 con clip-skip-2 y el decodificador VAE en fp32, junto con una tabla de pasos DPM++ SDE configurada para 4 pasos. La primera carga descarga aproximadamente 2,4 GB que quedan cacheados; a partir de ahí, la generación de una imagen de 4 pasos se completa íntegramente en el cliente.

El repositorio ocupa 2,6 GB e incluye tanto los pesos ONNX como las utilidades de conversión (Python) y los scripts de ejecución en JavaScript y TypeScript. La licencia se marca como "other": los pesos siguen los términos de Civitai del creador original (atribución obligatoria) y los scripts de ejecución se licencian bajo Apache-2.0. El modelo no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión tipo Stable Diffusion 1.5 con distilación LCM (modelo text-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo text-to-image; no utiliza ventana de contexto) |
| Tipos de cuantizacion | FP16 (UNet y text encoder), FP32 (decodificador VAE) |
| Idiomas soportados | no disponible (el text encoder es CLIP ViT-L/14) |
| Licencia | other (pesos bajo los términos de Civitai del creador, con atribución obligatoria; scripts de ejecución Apache-2.0) |
| Formato de pesos | ONNX (unet/model.onnx, text_encoder/model.onnx, vae_decoder/model.onnx) |

## Arquitectura y entrenamiento

El modelo es una exportación a ONNX de un checkpoint de Stable Diffusion 1.5. Según la model card, la línea base proviene de Realistic Vision V4.0 y posteriormente se le aplicó distilación LCM, dando lugar al modo "Fast Mode" que permite generar con pocos pasos (4-8) y CFG bajo (1-2) usando el sampler DPM++ SDE con clip-skip-2. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que se trata de un modelo de generación de imágenes y no de un modelo de lenguaje.

La exportación incluye tres grafos: el UNet en fp16 con batch y resolución (alto y ancho) dinámicos; el text encoder CLIP ViT-L/14 en fp16 convertido a posteriori desde una exportación fp32 verificada (con semántica de clip-skip-2, es decir, penúltima capa más normalización final); y el decodificador VAE en fp32 con exportación bit-exacta. Los tres se han validado con control de paridad según el script de conversión. La innovación principal del repositorio no está en el modelo en sí, sino en el empaquetado: pesos ONNX listos para WebGPU, una tabla de scheduler para 4 pasos y runtimes JavaScript/TypeScript que ejecutan el pipeline completo en el navegador.

## Capacidades

- Generación de imágenes text-to-image con estilo pixel art (palabras de activación recomendadas: "pixel art", "pixel world").
- Generación rápida en 4 pasos (modo Fast Mode), con CFG por defecto de 2 y sampler DPM++ SDE.
- Resoluciones flexibles: el UNet exportado admite dimensiones dinámicas; según la documentación, funciona con cualquier resolución entre 512 y 1024 píxeles.
- Batch dinámico en el grafo del UNet.
- Ejecución en navegador con WebGPU (Chrome/Edge 113 o superior con aceleración por hardware), mediante ONNX Runtime Web.
- Integración mediante API en JavaScript y TypeScript (`loadSD`, `generateSD`, `paintSD`), con callback de progreso por fases (encode, denoise, decode).
- Control de semilla (`seed`), pasos, CFG y dimensiones desde el propio runtime.
- Detección temprana de imágenes negras por NaN: los runtimes fallan con un error explícito en lugar de renderizar una imagen negra.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento, ya que no son capacidades propias de un modelo text-to-image.

## Casos de uso

- Generación de sprites y assets en aplicaciones web: un editor de juegos o una herramienta de prototipado puede generar sprites de pixel art en el propio navegador del usuario sin backend con GPU, aprovechando que el UNet admite resoluciones dinámicas entre 512 y 1024.
- Herramientas creativas offline-first: aplicaciones que ya funcionan con Service Workers pueden cachear los 2,4 GB de pesos tras la primera carga y seguir generando imágenes sin conexión.
- Prototipado rápido de arte para videojuegos indie: con 4 pasos y CFG 2 se obtienen bocetos de personajes, escenarios o tilesets en cuestión de segundos en GPU integradas, útiles como referencia para un artista humano.
- Demostraciones y demos interactivas en ferias o eventos: al no requerir servidor, la demo se ejecuta en un portátil con WebGPU, evitando costes de infraestructura y latencia de red.
- Generación de contenido bajo demanda con privacidad: al ejecutarse en el cliente, los prompts del usuario no se envían a ningún servicio externo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Pipelines de CI/CD para validación visual: el script `tools/render_sd_onnx.py` permite reproducir renders de referencia en un entorno Python con ONNX y el scheduler de diffusers, útil para comparar resultados ante cambios en el pipeline.
- Educación y experimentación con difusión en el navegador: sirve como ejemplo didáctico de cómo exportar y servir un modelo de difusión completo (text encoder, UNet y VAE) sobre WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- El peso de los tres grafos ONNX asciende a aproximadamente 2,1 GB (UNet fp16 de 1,7 GB, text encoder de 207 MB y decodificador VAE de 198 MB); el repositorio completo ocupa 2,6 GB. La primera carga descarga en torno a 2,4 GB y queda cacheada.
- Requiere un navegador con WebGPU activo (Chrome/Edge 113 o superior con aceleración por hardware). Las máquinas virtuales, escritorios remotos y controladores antiguos suelen carecer de este backend.
- Según la model card, las GPU integradas de gama baja (iGPU) también pueden ejecutar el modelo, aunque con mayor lentitud. No se especifican cifras concretas de VRAM, latencia ni throughput.
- No se enumeran GPU recomendadas (como A100, H100 o RTX 4090) en la información proporcionada; el modelo está orientado a ejecución en cliente, no a servidores de inferencia.
- Opciones de despliegue documentadas: ONNX Runtime Web (WebGPU) en navegador, y ONNX más el scheduler de diffusers en Python para el script de prueba. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- No hay datos publicados de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para construir una comparativa cuantitativa fiable. La model card menciona únicamente los siguientes puntos de referencia:

| Modelo | Relacion | Datos disponibles |
|---|---|---|
| AziibPixelMix (checkpoint original en Civitai) | Modelo de origen del que procede esta exportación | Receta Fast Mode: 4-8 pasos, CFG 1-2, DPM++ SDE, clip skip 2; licencia y pesos definidos por el creador |
| megaaziib/aziibpixelmix (HuggingFace) | Versión completa del mismo modelo en HuggingFace | Enlace referenciado en la model card; sin datos de parámetros |
| Realistic Vision V4.0 | Línea base citada del checkpoint | Sin datos de parámetros ni benchmarks en la información disponible |
| Stable Diffusion 1.5 | Arquitectura base del modelo | Sin datos concretos aportados en esta información |

## Limitaciones y advertencias

- Es un modelo especializado en pixel art: fuera de ese estilo y de las palabras de activación ("pixel art", "pixel world") la calidad puede degradarse notablemente.
- No se han publicado evaluaciones de sesgos. Al derivar de Stable Diffusion 1.5, es razonable esperar los sesgos conocidos de ese tipo de modelos, aunque no se documentan explícitamente en la información disponible.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible o artefactos, especialmente fuera de la receta recomendada de 4 pasos y CFG 2.
- La licencia "other" impone condiciones concretas: los pesos requieren atribución al creador (aziib) y, para uso comercial, el creador solicita apoyo vía ko-fi. Las imágenes generadas sí se consideran aptas para uso comercial según los términos del creador, pero conviene verificar las condiciones vigentes antes de un despliegue en producción.
- Los términos de "no derivatives" impiden volver a subir los pesos derivados; la model card pide explícitamente no re-subir los pesos resultado de la conversión.
- La primera carga implica una descarga de aproximadamente 2,4 GB, lo que puede resultar problemático en conexiones lentas o en dispositivos con poco almacenamiento.
- Limitación de plataforma: requiere WebGPU con aceleración por hardware. Sin ese soporte, el runtime falla con el error "No available backend found".
- El text encoder es CLIP ViT-L/14; no se documenta el comportamiento multilingüe de los prompts en la información disponible.
- No se especifican los parámetros totales del modelo ni métricas de calidad, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Bartholomheow/aziibpixelmix-onnx
- Modelo original en Civitai: https://civitai.com/models/195730/aziibpixelmix
- Versión completa en HuggingFace: https://huggingface.co/megaaziib/aziibpixelmix
- Línea base Realistic Vision V4.0: https://civitai.com/models/4201?modelVersionId=29227
- Apoyo al creador: https://ko-fi.com/megaaziib
- Tokenizer de referencia: https://huggingface.co/openai/clip-vit-large-patch14
- ONNX Runtime Web (CDN citada en la model card): https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ort.all.min.js
