# LibreYOLO/LibreImageDream

## Resumen

LibreImageDream es un espejo (mirror) del modelo ImageDream, un modelo de difusión multi-vista para generación de imágenes a 3D, empaquetado por LibreYOLO en el formato de diffusers que Jiaxiang Tang preparó para LGM. No se ha reentrenado, convertido ni recodificado nada: todos los ficheros son idénticos byte a byte a los del repositorio upstream `ashawkey/imagedream-ipmv-diffusers` (revisión `73a034178e748421506492e91790cc62d6aefef5`). El modelo original fue desarrollado por Peng Wang y Yichun Shi (paper arXiv:2312.02201) y se presenta como una alternativa a MVDream con rama de prompt de imagen.

El modelo resuelve un problema concreto: dada una única imagen de un objeto, muestrea cuatro vistas alrededor de él de forma consistente. Esas cuatro vistas alimentan después la familia LGM de LibreYOLO (`LibreYOLO/LibreLGM0.4b`), que las convierte en 3D Gaussian splats. El resultado es un pipeline de image-to-3D completo que se puede invocar con una API de tres líneas.

Su relevancia actual es de infraestructura: LibreYOLO lo republica como dependencia del ecosistema `libreyolo` (librería MIT) para ofrecer generación 3D reproducible sin depender de código remoto del upstream. El repositorio ocupa 4,0 GB e incluye el UNet multi-vista (1,3B parámetros con su resampler), el VAE y el text encoder de Stable Diffusion 2.1, el image encoder CLIP de LAION y la configuración del scheduler DDIM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión multi-vista (UNet) sobre base Stable Diffusion 2.1, con rama de prompt de imagen |
| Parametros totales | 1,3B en el UNet multi-vista con su resampler (no se detalla el total del pipeline completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; es un modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (condicionado por texto e imagen; el text encoder es OpenCLIP ViT-H/14 de SD 2.1) |
| Licencia | CreativeML OpenRAIL++-M (etiquetado upstream como `openrail`; el mirror distribuye el texto de la licencia de Stability AI del 24 de noviembre de 2022) |
| Formato de pesos | safetensors (layout diffusers) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusión multi-vista derivado de Stable Diffusion 2.1 base y afinado desde MVDream. La innovación principal es la rama de prompt de imagen: además de la condición textual, el UNet incorpora un image encoder (LAION CLIP-ViT-H-14, `laion2B-s32B-b79K`, licencia MIT) y un feature extractor que permiten condicionar la generación en una imagen de referencia del objeto. El UNet multi-vista, con su resampler, suma 1,3B parámetros. El pipeline se completa con el VAE de SD 2.1, el text encoder OpenCLIP ViT-H/14 de SD 2.1 y un scheduler DDIM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de difusión de este tipo). El mirror no incluye los ficheros de código remoto del upstream (`pipeline_mvdream.py`, `unet/mv_unet.py`) ni su README: LibreYOLO proporciona su propia implementación dentro de la librería `libreyolo`.

## Capacidades

- Generación de cuatro vistas consistentes de un objeto a partir de una única imagen de entrada (image-to-3D como primer estadio).
- Condicionamiento conjunto por imagen y por texto (rama de prompt de imagen más text encoder OpenCLIP).
- Integración directa con `LibreYOLO/LibreLGM0.4b` para producir 3D Gaussian splats (ficheros `.ply`).
- API de alto nivel vía `libreyolo`: `LibreGen("lgm")` descarga ambos repositorios y expone una llamada que acepta una ruta de imagen y guarda el resultado.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multilingües, de audio ni modos de pensamiento (thinking).

## Casos de uso

- Prototipado rápido de assets 3D: a partir de una foto de un objeto se generan cuatro vistas y, con LibreLGM0.4b, un splat 3D listo para previsualización en un visor, reduciendo el tiempo frente a modelado manual.
- Generación de assets para videojuegos y realidad aumentada: el pipeline image-to-3D permite crear variantes de props a partir de referencias fotográficas y exportarlas como Gaussian splats para motores que los soporten.
- Catalogación y digitalización de producto: convertir fotos de catálogo en representaciones 3D navegables para e-commerce, usando la consistencia multi-vista del UNet para mantener la identidad del objeto entre vistas.
- Investigación en generación 3D: el modelo sirve como baseline reproducible para comparar técnicas de multi-view diffusion y de conversión a splats, con pesos idénticos byte a byte al upstream.
- Integración en pipelines de diseño generativo: al estar empaquetado en `libreyolo` (MIT) y en layout diffusers, se puede encadenar con herramientas de renderizado o de reconstrucción de malla existentes.
- Docencia y demostraciones: el ejemplo de tres líneas de la model card permite montar demos de image-to-3D sin gestionar código remoto ni dependencias frágiles del upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 4,0 GB, por lo que los pesos en precisión original requieren al menos ese orden de magnitud de memoria, más el overhead de activaciones del UNet y del VAE.
- GPU recomendadas: no disponible (no se documentan modelos concretos como A100, H100 o RTX 4090).
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer concretas.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`LibreGen("lgm")`), que descarga este repositorio y `LibreYOLO/LibreLGM0.4b`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreImageDream | 1,3B (UNet multi-vista) | no aplica | no disponible | CreativeML OpenRAIL++-M | Hugging Face (`LibreYOLO/LibreImageDream`) |
| ImageDream upstream (`ashawkey/imagedream-ipmv-diffusers`) | 1,3B (UNet multi-vista) | no aplica | no disponible | etiquetado `openrail`, sin texto de licencia | Hugging Face |
| MVDream (base del fine-tune) | no disponible | no aplica | no disponible | no disponible | Hugging Face (`MVDream/MVDream`) |
| Stable Diffusion 2.1 base (base del fine-tune) | no disponible | no aplica | no disponible | CreativeML OpenRAIL++-M | Hugging Face |

Los datos de rendimiento de las alternativas no están disponibles en la información proporcionada; no se han inventado cifras.

## Limitaciones y advertencias

- Restricciones de uso: la licencia CreativeML OpenRAIL++-M incluye el párrafo 5 y el Anexo A, que prohíben usos como contenido ilegal, daño a menores, difamación, acoso, discriminación y consejo médico. Estas restricciones deben transmitirse a cualquier tercero al que se redistribuya el modelo.
- La licencia aplicada es la interpretación de LibreYOLO de los términos upstream, no una declaración de los autores originales; el upstream etiqueta los pesos como `openrail` pero no incluye texto de licencia.
- Es un mirror, no un modelo nuevo: no hay mejoras de rendimiento ni correcciones respecto al upstream, y cualquier limitación del original se hereda íntegramente.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo generativo de imágenes, existe riesgo de generar geometrías o texturas inconsistentes entre vistas, aunque no se cuantifica en la información disponible.
- No hay datos sobre cobertura idiomática ni sobre el comportamiento con prompts textuales en castellano.
- El repositorio no incluye los ficheros de código remoto del upstream; la implementación corre a cargo de `libreyolo`, lo que introduce una dependencia de esa librería para el uso práctico.
- El pipeline completo requiere también `LibreYOLO/LibreLGM0.4b`; sin él, el modelo solo produce las cuatro vistas, no el splat 3D final.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face (este mirror): https://huggingface.co/LibreYOLO/LibreImageDream
- Repositorio upstream en diffusers: https://huggingface.co/ashawkey/imagedream-ipmv-diffusers
- Pesos originales: https://huggingface.co/Peng-Wang/ImageDream
- Paper: https://arxiv.org/abs/2312.02201
- MVDream (base del fine-tune): https://huggingface.co/MVDream/MVDream
- LibreLGM0.4b (conversión a 3D Gaussian splats): https://huggingface.co/LibreYOLO/LibreLGM0.4b
- Documentación de modelos de LibreYOLO: https://www.libreyolo.com/docs/models
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
