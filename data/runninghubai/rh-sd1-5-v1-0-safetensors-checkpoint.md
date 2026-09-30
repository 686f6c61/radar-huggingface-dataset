# RunningHubAI/rh-sd1.5-v1.0.safetensors-checkpoint

## Resumen

rh-sd1.5-v1.0.safetensors-checkpoint es un checkpoint de generación de imágenes por difusión publicado en Hugging Face por RunningHubAI, la cuenta del equipo de la plataforma RunningHub. Se trata de un ajuste fino (fine-tune) derivado de Stable Diffusion 1.5, tal y como declara explícitamente la model card del autor ("Finetuned from: SD 1.5"), orientado a la generación de imágenes con estética de acuarela.

El modelo se distribuye como un único archivo de pesos en formato safetensors (SD1.5-灵动水彩_v1.0.safetensors, 2034 MiB) dentro de un repositorio de 2,1 GB, y está pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o mediante su API. No es un modelo de lenguaje: no genera texto ni código, y sus capacidades se limitan a la síntesis de imágenes a partir de indicaciones textuales en inglés.

Su relevancia es limitada y muy específica: se trata de uno de los muchos checkpoints de estilo publicados a diario en Hugging Face, sin métricas publicadas, sin licencia declarada de forma explícita y con cero descargas y cero "likes" en el momento de redactar esta ficha. Resulta útil únicamente como modelo de estilo concreto (acuarela) dentro de un flujo de trabajo de ComfyUI o como ejemplo reproducible de la API de RunningHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (latent diffusion), derivado de SD 1.5. Componentes habituales de la familia: U-Net, codificador de texto CLIP y VAE. El autor no publica detalles arquitectónicos adicionales. |
| Parámetros totales | No disponible (el autor no publica el recuento de parámetros del checkpoint) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el checkpoint; el codificador de texto de SD 1.5 trabaja con indicaciones de hasta 77 tokens, pero el autor no lo confirma |
| Tipos de cuantización | No disponible. Se distribuye un único archivo safetensors; no se publican variantes fp16/fp8/GGUF |
| Idiomas soportados | No disponible. La model card está en chino e inglés; no se declara soporte multilingüe de las indicaciones |
| Licencia | No disponible. La model card indica: "Copyright remains with the author. Follow the original project or upstream license", sin especificar cuál es esa licencia |
| Formato de pesos | safetensors (nombre de archivo: SD1.5-灵动水彩_v1.0.safetensors) |

Otros datos: autor RunningHubAI; etiquetas comfyui, checkpoint, region:us; repositorio de 2,1 GB; 0 descargas y 0 likes; creado el 2026-09-30 y actualizado el 2026-09-30 según los metadatos de Hugging Face.

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusión latente heredado de Stable Diffusion 1.5. Esto implica, por la familia base, un U-Net que actúa como red de eliminación de ruido sobre el espacio latente de un VAE, condicionado mediante un codificador de texto CLIP. El autor no aporta ninguna información adicional sobre la arquitectura en la model card: no se detalla el número de bloques, la resolución nativa del VAE ni si se han modificado componentes respecto al modelo original.

Tampoco se publican datos de entrenamiento: se desconoce el número de pasos, el volumen de imágenes del dataset, la composición del mismo, si se emplearon técnicas de ajuste fino tipo LoRA fusionado, DreamBooth, ajuste completo del U-Net o entrenamiento con regularización. No hay mención a RLHF, DPO ni a ningún otro método de alineación, algo por otro lado esperable en un modelo de difusión. La única información de configuración publicada son recomendaciones de inferencia: entre 25 y 35 pasos de iteración, muestreador DPM++ 2M Karras y resoluciones de 512x768, 512x1024 y 512x512.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en un rango de resolución nativo de 512 píxeles de lado y variantes alargadas de 512x768 y 512x1024.
- Especialización estilística en acabado de acuarela, según se deduce del nombre del archivo de pesos (灵动水彩, "acuarela vívida") y de la ausencia de otras indicaciones en la model card.
- Integración directa en ComfyUI como nodo de carga de checkpoint, y ejecución en la plataforma RunningHub y su API.
- Compatibilidad previsible con el ecosistema de herramientas de la familia SD 1.5 (img2img, inpainting, ControlNet, LoRA), aunque el autor no lo documenta ni lo garantiza.
- Soporte de tool calling / function calling: no aplica, es un modelo de generación de imágenes.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles; no se documenta el comportamiento con indicaciones en castellano.
- Capacidades especiales (modo "thinking", visión, audio, vídeo): no aplica.

## Casos de uso

- Ilustración editorial en estilo acuarela: el modelo permite generar ilustraciones para artículos, cuentos o portadas partiendo de indicaciones textuales, con resoluciones de 512x768 y 512x1024 adecuadas para maquetación en columna y para formatos apaisados o verticales de web.
- Creación de láminas decorativas e impresión artística: al estar especializado en un acabado de acuarela, encaja en flujos de producción de pósteres y láminas; la resolución nativa de 512 píxeles exige, eso sí, un reescalado posterior para impresión de calidad.
- Concept art y previsualización de escenarios: en estudios pequeños, sirve para iterar rápidamente bocetos atmosféricos antes de encargar arte final, usando DPM++ 2M Karras con 25-35 pasos para equilibrar tiempo de cómputo y detalle.
- Generación de fondos y assets para videojuegos o aplicaciones: fondos de pantalla, texturas decorativas y elementos de interfaz con estética pictórica, generados por lotes desde un flujo de ComfyUI.
- Automatización de contenido para redes sociales: integrado en la API de RunningHub, permite generar imágenes temáticas bajo demanda desde un servicio backend sin mantenimiento de infraestructura propia de GPU.
- Storyboards y material de preproducción audiovisual: secuencias de viñetas con un estilo visual coherente, generadas de forma repetible con la misma semilla y los mismos parámetros recomendados.
- Docencia y talleres de ilustración digital: sirve como ejemplo práctico de ajuste fino de SD 1.5 y de comparación de estilos dentro de un flujo ComfyUI.
- Composición con img2img o ControlNet: aunque no documentado por el autor, al ser un checkpoint de SD 1.5 es susceptible de usarse como base para refinado de bocetos y control de pose o silueta, siempre que se valide empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, evaluación humana ni ninguna otra métrica cuantitativa, y no se han encontrado comparativas publicadas para este checkpoint concreto.

## Requisitos de hardware

- Tamaño en disco: el archivo de pesos ocupa 2034 MiB (~2,13 GB); el repositorio completo, 2,1 GB.
- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa de la familia SD 1.5 a 512x512 en fp16, suelen ser suficientes del orden de 4 GB de VRAM, pero este dato no está confirmado para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es, en principio, suficiente para SD 1.5 a 512x512. Modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 o H100 pueden ejecutarlo sin problema; las GPU de gama alta aportan sobre todo velocidad, no viabilidad.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con 6 GB o más de VRAM, dado el tamaño del checkpoint, aunque el fabricante no ofrece requisitos oficiales.
- Opciones de despliegue: ComfyUI (plataforma objetivo declarada), plataforma RunningHub y su API, y por compatibilidad de formato, otros entornos capaces de cargar checkpoints SD 1.5 en safetensors (por ejemplo, interfaces basadas en diffusers). No se documentan builds específicos para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusión de imagen.
- Latencia y throughput: no disponibles. No se publican tiempos de generación ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Base / arquitectura | Resolución recomendada | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-sd1.5-v1.0 (este checkpoint) | SD 1.5 (difusión latente) | 512x512, 512x768, 512x1024 | No disponible | No disponible (copyright del autor) | Hugging Face, ComfyUI, RunningHub |
| Stable Diffusion 1.5 (modelo base) | Difusión latente | 512x512 | Del orden de 1.000 millones en el conjunto del checkpoint según la documentación pública del proyecto original; el autor de este fine-tune no publica cifra propia | CreativeML Open RAIL-M en el proyecto original (no confirmada para este derivado) | Ampliamente disponible |
| Stable Diffusion XL | Difusión latente | 1024x1024 | No disponible en la información proporcionada | No disponible en la información proporcionada | Ampliamente disponible |
| Otros fine-tunes de estilo sobre SD 1.5 | Difusión latente | 512x512 y variantes | No disponible | Variable según autor | Hugging Face, Civitai y repositorios similares |

No se dispone de datos de rendimiento comparativos entre este checkpoint y las alternativas citadas, por lo que la comparación se limita a aspectos de formato, resolución y disponibilidad.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de sesgos. Los modelos de difusión entrenados sobre datasets web sin filtrar reproducen estereotipos de género, etnia y profesión; se desconoce si este fine-tune ha aplicado mitigaciones.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible dentro de la imagen, perspectivas incoherentes y objetos mezclados, especialmente en escenas con muchas entidades.
- Limitación de resolución: la resolución nativa de 512 píxeles obliga a reescalar para cualquier uso de impresión o de pantalla de alta densidad, lo que puede introducir artefactos.
- Limitación de idioma: no se documenta el comportamiento con indicaciones en castellano y la familia SD 1.5 suele rendir mejor con prompts en inglés.
- Longitud de indicación limitada: en la familia SD 1.5, el codificador CLIP trunca las indicaciones a 77 tokens, lo que restringe las descripciones muy largas. No confirmado por el autor para este checkpoint.
- Licencia ambigua: la model card remite al copyright del autor y a "la licencia del proyecto original o upstream" sin nombrarla. Antes de cualquier uso comercial es imprescindible aclarar la licencia aplicable con RunningHub o con el autor.
- Trazabilidad nula del entrenamiento: no se especifican datos, pasos ni método, lo que impide auditar el origen del estilo y evaluar posibles contaminaciones del dataset.
- Metadatos anómalos: la fecha de creación registrada (2026-09-30) es posterior a la fecha habitual de publicación; conviene verificar la vigencia del repositorio.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de errores.
- Dependencia de la plataforma: el uso recomendado pasa por ComfyUI o por la API de RunningHub, lo que puede introducir dependencia de un proveedor externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-sd1.5-v1.0.safetensors-checkpoint
- Perfil del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Página original del modelo en RunningHub: https://www.runninghub.cn/model/public/1894769735328464898
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1894754160435466242
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Repositorio no oficial de Stable Diffusion 1.5: https://github.com/lizhen0211/stable-diffusion-v1-5
- Catálogo de checkpoints de Stable Diffusion (referencia externa): https://offlinecreator.com/download/stable-diffusion-models-download
