# Raelina/Raehoshi-illust-XL-12

## Resumen

Raehoshi illust XL 12 es un modelo de difusión texto-a-imagen especializado en ilustración anime, desarrollado por Raelina y publicado en Hugging Face bajo el identificador `Raelina/Raehoshi-illust-XL-12`. Se trata de un fine-tuning de Illustrious XL v1.1, que a su vez deriva de la arquitectura Stable Diffusion XL (SDXL), y está orientado a la generación de ilustraciones con estética anime mediante prompts basados en etiquetas tipo booru.

El objetivo declarado del autor es corregir dos limitaciones observadas en el modelo base: la sobresaturación de color y el ruido de artefactos en la imagen generada. Aunque el autor reconoce que estos problemas no se eliminan por completo, afirma que se han logrado mejoras notables en el equilibrio cromático y la limpieza del resultado final.

El modelo cuenta con 2.567.463.684 parámetros reales según los pesos en safetensors, un repositorio de 13,9 GB y se distribuye bajo la licencia SDXL de Stability AI. Es relevante para quienes trabajan en pipelines de generación de imágenes anime con SDXL y buscan una variante afinada con listado de personajes y ajustes de muestreo recomendados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion-based text-to-image (Stable Diffusion XL) |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | sdxl-license (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Illustrious XL v1.1, que a su vez se construye sobre la arquitectura Stable Diffusion XL, un modelo de difusión latente con un UNet y codificadores de texto duales. El pipeline declarado en Hugging Face es `diffusers:StableDiffusionXLPipeline`, lo que confirma la compatibilidad con el ecosistema Diffusers.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en modelos de difusión). El autor menciona un listado de personajes entrenados disponible en un enlace externo (rentry.org), lo que sugiere un dataset orientado a personajes de anime. El estilo de prompt recomendado es el de etiquetas booru.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime e ilustración.
- Soporte de prompts basados en etiquetas booru (estilo Danbooru).
- Listado de personajes entrenados disponible en enlace externo del autor.
- Ajustes de muestreo recomendados: CFG 5-7, 25+ pasos, samplers Euler a o DPM++2M Karras.
- Resoluciones estándar soportadas: 832x1216, 1216x832, 1152x896, 896x1152, 1344x768, 768x1344, 1024x1024.
- Resoluciones de alta resolución: 1024x1536, 896x1536, 1536x1024, 1536x896.
- Soporte de Hires.fix con upscaler 4x_Remacri, 10-15 pasos y denoising 0.1-0.3.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking (no aplicables a un modelo de difusión).

## Casos de uso

- Ilustración de personajes anime: el modelo está afinado específicamente para generar personajes con estética anime usando etiquetas booru, lo que lo hace adecuado para crear ilustraciones de personajes con prompts descriptivos detallados.
- Generación de arte conceptual para videojuegos o cómics: con resoluciones de hasta 1536x1024 y soporte de Hires.fix, permite obtener imágenes de alta resolución aptas para bocetos y concept art.
- Creación de avatares y retratos: las resoluciones 1024x1024 y 832x1216 son adecuadas para retratos de personajes con composición vertical u horizontal.
- Prototipado rápido de escenas: con CFG 5-7 y 25+ pasos, se pueden generar múltiples variaciones de una escena para explorar composiciones antes de un render final.
- Integración en pipelines Diffusers: al ser compatible con `StableDiffusionXLPipeline`, puede integrarse en flujos automatizados de generación por lotes en Python.
- Producción de material para fan art o ilustración editorial: el listado de personajes entrenados permite generar representaciones de personajes concretos con mayor fidelidad.
- Upscaling de resultados: el flujo recomendado con 4x_Remacri y Hires.fix permite obtener imágenes finales de mayor resolución para impresión o publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del modelo (2.567 millones de parámetros, repo de 13,9 GB) se requiere una GPU con memoria suficiente para SDXL, aunque no se especifica una cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: Diffusers (`StableDiffusionXLPipeline`), según el pipeline declarado; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de difusión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raehoshi illust XL 12 | 2.567.463.684 | no aplica | sdxl-license | Hugging Face |
| Illustrious XL v1.1 (base) | no disponible | no aplica | no disponible | Hugging Face (OnomaAIResearch) |
| Stable Diffusion XL base 1.0 | no disponible | no aplica | sdxl-license | Hugging Face (Stability AI) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que la sobresaturación y el ruido de artefactos no se eliminan por completo, solo se mejoran.
- Riesgo de alucinación visual: como modelo de difusión, puede generar anatomía incorrecta (manos, pies) y artefactos, por lo que el prompt negativo recomendado incluye "bad hands, bad feet".
- Limitación de idioma: solo se declara soporte para inglés (`en`), por lo que los prompts en otros idiomas pueden no funcionar correctamente.
- Restricciones de licencia: se distribuye bajo `sdxl-license`, que impone condiciones para uso comercial; es necesario revisar el texto completo de la licencia de Stability AI antes de un uso en producción.
- El modelo está especializado en estética anime; su rendimiento en otros estilos (fotorrealismo, ilustración occidental) no está documentado.
- El número de descargas (42) y likes (0) es bajo, lo que indica poca validación por parte de la comunidad.
- No se documentan sesgos específicos, pero al entrenarse con etiquetas booru y personajes de anime, puede heredar sesgos de ese corpus.

## Enlaces

- Hugging Face: https://huggingface.co/Raelina/Raehoshi-illust-XL-12
- Modelo base Illustrious XL v1.1: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v1.1
- Licencia SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/LICENSE.md
- Listado de personajes: https://rentry.org/xbbfsdua
- Upscaler 4x_Remacri: https://openmodeldb.info/models/4x-Remacri
- Perfil del autor en Civitai: https://civitai.com/user/Raelina
- Página del modelo en Civitai: https://civitai.com/models/846917/raehoshi-illust-xl
- Ko-Fi del autor: https://ko-fi.com/raelina
