# OtakuTTI/Otaku-TTI-1.1

## Resumen

Otaku TTI 1.1 es un modelo de difusion latente (Latent Diffusion Model, LDM) para generacion de imagenes anime a resolucion nativa 512x512, desarrollado por el usuario OtakuTTI y publicado en Hugging Face. Se presenta como una evolucion de Otaku TTI 1.0 con un aumento de 4x en resolucion espacial (de 128x128 a 512x512) manteniendo un consumo de memoria muy reducido: aproximadamente 1,4 GB de VRAM en pico durante la generacion.

El modelo esta disenado explicitamente para hardware de consumo. Segun la model card, fue entrenado de extremo a extremo bajo un presupuesto energetico de 60 W en un portatil Acer Nitro V 15 con GPU NVIDIA GeForce RTX 4050 Laptop (6 GB de VRAM). El UNet tiene aproximadamente 166 millones de parametros y utiliza el text encoder OpenAI CLIP ViT-Base/32 junto con el VAE StabilityAI SD-VAE-ft-mse.

Su relevancia actual radica en la combinacion de resolucion 512x512 nativa, huella de memoria inferior a 1,4 GB y tiempos de generacion de aproximadamente 1,14 a 1,45 segundos por imagen en una GPU de portatil de gama de entrada, lo que lo situa en el segmento de modelos de imagen ligeros para equipos con recursos limitados. Incluye traduccion offline de etiquetas japonesas de anime mediante un diccionario (`tag_map_ja.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (LDM) con UNet |
| Parametros totales | ~166 millones (UNet); text encoder CLIP ViT-Base/32 y VAE SD-VAE-ft-mse adicionales |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image); text encoder CLIP ViT-Base/32 |
| Tipos de cuantizacion | FP16 (332,8 MB) y FP32 (665,3 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (etiquetas estilo Booru y lenguaje natural) y japones (traduccion offline via `tag_map_ja.json`) |
| Licencia | CC-BY-NC 4.0 (Creative Commons Attribution-NonCommercial 4.0 International) |
| Formato de pesos | `.pt` (PyTorch): `weights/otaku_tti_1.1_fp16.pt` y `weights/otaku_tti_1.1.pt` |

## Arquitectura y entrenamiento

Otaku TTI 1.1 es un modelo de difusion latente clasico: un UNet de aproximadamente 166 millones de parametros que opera sobre un espacio latente de 4 canales y 64x64, decodificado a 512x512 RGB mediante un VAE con factor de compresion 8x (StabilityAI SD-VAE-ft-mse). El condicionamiento textual se realiza mediante cross-attention con un text encoder OpenAI CLIP ViT-Base/32 de dimension 512. El muestreo recomendado es DPM-Solver++ de segundo orden multistep con 20-25 pasos y Classifier-Free Guidance (cfg 7,5 por defecto), lo que permite generar imagenes con pocos pasos de denoising.

La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens o imagenes utilizadas, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning por preferencias (no disponible). El unico dato de entrenamiento aportado es el contexto de hardware y el presupuesto energetico: entrenamiento end-to-end en una RTX 4050 Laptop de 6 GB de VRAM bajo un limite de 60 W. La innovacion tecnica destacada es la resolucion nativa 512x512 con una huella de VRAM inferior a 1,4 GB, junto con el diccionario offline de traduccion de etiquetas japonesas que evita dependencias de red en inferencia.

## Capacidades

- Generacion text-to-image de ilustraciones anime a resolucion nativa 512x512.
- Interpretacion de prompts con etiquetas estilo Booru (`1girl`, `solo`, `masterpiece`) y lenguaje natural en ingles.
- Soporte nativo de etiquetas japonesas de anime (`初音ミク`, `笑顔`, `青空`, `草原`, `最高品質`) con traduccion offline mediante `tag_map_ja.json`.
- Generacion de paisajes y escenas sin personajes mediante prompts negativos (`no humans, scenery, landscape`).
- Prompt negativo configurable para Classifier-Free Guidance, util para eliminar artefactos, firmas, texto o marcas de agua.
- Generacion por lotes (`-n`) con salida en rejilla (grid).
- Control de semilla (`--seed`) para reproducibilidad.
- Ejecucion en CPU o CUDA (`--device`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking (no aplica a un modelo de difusion).

## Casos de uso

- Generacion de ilustraciones anime en portatiles de gama baja: el modelo cabe en menos de 1,4 GB de VRAM, por lo que puede ejecutarse en GPUs de 2-6 GB o incluso en CPU, permitiendo crear arte en equipos sin aceleradores de gama alta.
- Prototipado rapido de personajes y escenas: con tiempos de 1,14-1,45 s por imagen en una RTX 4050 Laptop, es adecuado para iterar sobre prompts y semillas en sesiones de diseno.
- Creacion de assets para proyectos personales o academicos: al estar bajo CC-BY-NC 4.0, encaja en investigacion, educacion y arte no comercial, como ilustraciones para trabajos fin de grado o demos.
- Generacion de fondos y paisajes para juegos indie o visual novels (uso no comercial): el soporte de prompts sin personajes y de prompt negativo permite producir escenarios limpios sin figuras humanas.
- Flujos de trabajo con etiquetas japonesas: estudios o creadores que trabajan con vocabulario anime en japones pueden usar el diccionario offline sin depender de servicios de traduccion externos.
- Generacion por lotes para exploracion de conceptos: la opcion `-n` con salida en rejilla facilita comparar variaciones de un mismo prompt en una sola ejecucion.
- Educacion y divulgacion sobre difusion latente: al ser un motor autonomo y ligero, sirve como ejemplo practico de pipeline LDM (CLIP + UNet + VAE + DPM-Solver++) en cursos y tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de rendimiento de inferencia: aproximadamente 1,14-1,45 segundos por imagen 512x512 en una RTX 4050 Laptop con DPM-Solver++ a 25 pasos, y un pico de VRAM de aproximadamente 1,4 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en pico durante generacion 512x512; pesos FP16 de 332,8 MB y FP32 de 665,3 MB.
- GPU recomendadas: el modelo fue entrenado y probado en una NVIDIA GeForce RTX 4050 Laptop (6 GB). Por su huella, deberia caber en cualquier GPU con 2 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060, A100 y H100 (estas ultimas sobredimensionadas para el modelo).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 2 GB o mas de VRAM; tambien puede ejecutarse en CPU (`--device cpu`), aunque la model card no especifica tiempos en CPU.
- Opciones de despliegue: el repositorio proporciona un motor de inferencia propio basado en `generate.py` (PyTorch). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de difusion). El formato `.pt` requiere cargar los pesos con el codigo del autor.
- Latencia y throughput estimados: ~1,14-1,45 s por imagen 512x512 en RTX 4050 Laptop con 25 pasos y DPM-Solver++ (dato del autor). No se aportan cifras de throughput por lotes ni de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros (UNet) | Resolucion nativa | VRAM pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Otaku TTI 1.1 | ~166 M | 512x512 | ~1,4 GB | CC-BY-NC 4.0 | Hugging Face (repo de 1,0 GB) |
| Stable Diffusion 1.5 | ~860 M | 512x512 | ~4 GB (FP16, aprox.) | CreativeML OpenRAIL-M | Amplia (Hugging Face, ecosistema) |
| Stable Diffusion 2.1 | ~865 M | 512x512 (base) | ~4 GB (FP16, aprox.) | CreativeML OpenRAIL++-M | Amplia (Hugging Face) |
| Modelos anime derivados de SD 1.5 (p. ej. Anything, OrangeMix) | ~860 M | 512x512 | ~4 GB (FP16, aprox.) | variables (habitualmente CreativeML) | Comunidad (Civitai, Hugging Face) |

Nota: los datos de SD 1.5 y SD 2.1 son aproximados y no proceden de la informacion proporcionada sobre Otaku TTI 1.1; se incluyen como referencia de categoria. No se dispone de comparativas de calidad (FID, CLIP score) para Otaku TTI 1.1.

## Limitaciones y advertencias

- Licencia CC-BY-NC 4.0: prohibido el uso comercial o la monetizacion sin permiso escrito previo del autor; requiere atribucion al redistribuir o modificar.
- No se documentan sesgos conocidos, pero al estar entrenado presumiblemente con datos de estilo anime, puede reproducir estereotipos presentes en ese dominio (no verificado en la informacion disponible).
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible o artefactos, especialmente con prompts complejos o poco representados.
- Contexto limitado por el text encoder CLIP ViT-Base/32: prompts muy largos o matices finos pueden no capturarse correctamente.
- Soporte de idiomas limitado a ingles y japones (via diccionario offline); no se documentan otros idiomas.
- El repositorio tiene 0 descargas y 1 like, y no hay pipeline declarado ni model card con resultados de benchmarks: la validacion externa es practicamente nula.
- Los pesos en formato `.pt` requieren el codigo del autor; no hay integracion documentada con `diffusers`, ComfyUI u otras herramientas del ecosistema.
- El repositorio tiene un tamano de 1,0 GB, coherente con los pesos, pero no se detalla la procedencia del dataset de entrenamiento ni posibles derechos sobre las imagenes usadas.

## Enlaces

- Hugging Face: https://huggingface.co/OtakuTTI/Otaku-TTI-1.1
- Repositorio de codigo indicado en la model card (placeholder del autor): https://github.com/your-username/otaku_tti_1.1
- Imagen de ejemplo de la model card: https://github.com/user-attachments/assets/ace771d4-4fdc-4d2c-b3f3-41e0cee85a0e
- Text encoder CLIP ViT-Base/32 (OpenAI): https://huggingface.co/openai/clip-vit-base-patch32
- VAE StabilityAI SD-VAE-ft-mse: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Licencia CC-BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
