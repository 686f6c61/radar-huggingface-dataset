# draganjankovic1975/Krea2-Candid-Nude-v2

## Resumen

Krea2-Candid-Nude-v2 es un checkpoint de generación de imágenes texto-a-imagen derivado de Krea-2-Turbo, desarrollado por el usuario draganjankovic1975 y publicado en Hugging Face. Se trata de un ajuste fino (fine-tune) orientado a fotografía amateur cándida, con énfasis en textura de piel realista, anatomía natural e iluminación verosímil, y que cubre tanto contenido SFW como NSFW. La versión 2 mejora la textura de piel, la iluminación y la anatomía respecto a la v1 según la model card.

El modelo conserva la arquitectura del modelo base Krea-2-Turbo y se distribuye en cuatro formatos de pesos (bf16, fp8, GGUF Q8_0 y GGUF Q4_0) pensados para distintos niveles de VRAM. Con 12.820.073.036 parámetros en safetensors y un repositorio de 63 GB, está claramente orientado a despliegue local en ComfyUI más que a inferencia en la nube a gran escala.

Su relevancia es acotada: no es un modelo de propósito general ni compite en benchmarks de razonamiento o código, sino una especialización de nicho para generación fotorrealista de figuras humanas en flujos de trabajo ComfyUI. La licencia Krea 2 Community License impone restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen, base Krea-2-Turbo) |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | bf16, fp8, GGUF Q8_0, GGUF Q4_0 |
| Idiomas soportados | no disponible (el prompt se procesa con el text encoder Qwen3-VL-4B) |
| Licencia | krea-2-community-license (Krea 2 Community License Agreement) |
| Formato de pesos | safetensors (bf16, fp8), GGUF (Q8_0, Q4_0) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Krea-2-Turbo en la documentación proporcionada. Por los artefactos publicados se deduce que es un modelo de difusión texto-a-imagen que emplea el text encoder Qwen3-VL-4B (tipo `krea2`) y el VAE `qwen_image_vae.safetensors`, y que opera en modo Turbo con 8 pasos de muestreo y CFG 1. El checkpoint se distribuye como modelo de difusión que se carga con el nodo Load Diffusion Model de ComfyUI, o con Unet Loader (GGUF) en el caso de los ficheros GGUF.

El proceso de ajuste fino partió de Krea-2-Turbo y se orientó a fotografía amateur cándida, con mejora declarada de textura de piel, iluminación y anatomía en la v2 respecto a la v1. No se especifican en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas propias más allá de la herencia del modo Turbo del modelo base.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, con resolución de 1024x1536 (vertical), 1536x1024 (horizontal) y 1024x1024 (cuadrada).
- Representación de piel realista: poros visibles, imperfecciones sutiles y tono de piel natural, reforzado por la coletilla de prompt recomendada por el autor.
- Estética de fotografía amateur cándida, con iluminación natural y anatomía verosímil.
- Cobertura de contenido SFW y NSFW (etiquetado `not-for-all-audiences`).
- Inferencia rápida en modo Turbo: 8 pasos, CFG 1, sampler euler y scheduler simple.
- Integración con ComfyUI mediante los nodos Load Diffusion Model (safetensors) y Unet Loader (GGUF) del fork molbal/ComfyUI-GGUF.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es exclusivamente texto-a-imagen.

## Casos de uso

- Generación de retratos fotorrealistas para proyectos creativos personales: el modelo está ajustado para piel y anatomía naturales, por lo que es adecuado para producir retratos de figura humana con aspecto de fotografía amateur en resoluciones verticales de 1024x1536.
- Pruebas de concepto de fotografía sintética: con 8 pasos y CFG 1, la generación es rápida y permite iterar sobre variaciones de iluminación y encuadre sin largos tiempos de muestreo.
- Flujos de trabajo en ComfyUI con cuantización GGUF: los ficheros Q4_0 (~7 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, útil para prototipado local en estaciones de trabajo modestas.
- Estudio de ajuste fino sobre modelos de difusión: sirve como referencia de cómo un fine-tune de nicho sobre Krea-2-Turbo modifica el comportamiento del modelo base en textura de piel y anatomía.
- Investigación sobre sesgos y representación en modelos de imagen: al estar especializado en un estilo y temática concretos, es un caso útil para analizar cómo el ajuste fino estrecha la distribución de salidas.
- Evaluación de pipelines de cuantización: la disponibilidad de bf16, fp8, Q8_0 y Q4_0 en un mismo checkpoint permite comparar degradación de calidad entre formatos en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según formato: bf16 (~25 GB) requiere 24-32 GB o más; fp8 (~13 GB) requiere 16-24 GB; GGUF Q8_0 (~13 GB) requiere un rango similar al fp8; GGUF Q4_0 (~7 GB) requiere 8-12 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por los requisitos de VRAM, el formato bf16 encaja en GPUs de 24 GB o más (por ejemplo, A100, RTX 3090/4090 de 24 GB) y el Q4_0 en GPUs de gama media con 8-12 GB.
- Cabe en GPU de consumo: sí, en los formatos fp8, Q8_0 y Q4_0, siempre que se cumplan los umbrales de VRAM indicados.
- Opciones de despliegue: ComfyUI con el nodo Load Diffusion Model para safetensors; ComfyUI con el fork molbal/ComfyUI-GGUF y su nodo Unet Loader (GGUF) para los ficheros GGUF. El fork original city96/ComfyUI-GGUF no carga Krea 2 según el autor.
- Componentes adicionales necesarios: text encoder Qwen3-VL-4B (tipo `krea2`) y VAE `qwen_image_vae.safetensors`.
- Latencia y throughput: no disponibles; el modo Turbo con 8 pasos y CFG 1 sugiere un coste de muestreo reducido, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2-Candid-Nude-v2 | 12.820.073.036 | 1024x1536, 1536x1024, 1024x1024 | Checkpoint fotorrealista amateur, SFW y NSFW | krea-2-community-license | Hugging Face (0 descargas) |
| Krea 2 NSFW V5 (Civitai) | no disponible | no disponible | LoRA NSFW para Krea 2, realismo amateur cándido | no disponible | Civitai |
| Krea-2-Turbo (base) | no disponible | no disponible | Modelo de difusión Turbo texto-a-imagen | krea-2-community-license | Hugging Face (krea/Krea-2-Turbo) |

La información disponible no permite comparar rendimiento cuantitativo entre estas opciones; solo se documentan diferencias de formato (checkpoint completo frente a LoRA) y de licencia.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está etiquetado como `not-for-all-audiences` y genera contenido para adultos; requiere control de acceso y moderación en cualquier despliegue público.
- Riesgo de uso indebido: el autor prohíbe explícitamente generar contenido de personas reales sin consentimiento, de menores o cualquier contenido ilegal; la responsabilidad recae en el usuario.
- Sesgos: al estar ajustado sobre un estilo y temática concretos (fotografía amateur cándida, tono de piel claro según la coletilla de prompt recomendada), la distribución de salidas está estrechada y puede infrarepresentar diversidad de cuerpos, tonos de piel y contextos.
- Alucinación visual: como todo modelo de difusión, puede producir anatomía incorrecta, artefactos en manos y rostros, o incoherencias en escenas complejas; la model card no documenta tasas de fallo.
- CFG 1 ignora el prompt negativo, lo que limita el control fino sobre lo que se quiere evitar; todo debe describirse en el prompt positivo.
- Compatibilidad restringida: los GGUF requieren el fork molbal/ComfyUI-GGUF; el fork original city96 no carga Krea 2, lo que añade fricción de despliegue.
- Licencia: la Krea 2 Community License Agreement puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE y NOTICE antes de producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Idiomas: no se documenta el soporte multilingüe del text encoder Qwen3-VL-4B en este contexto; el rendimiento con prompts en castellano no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draganjankovic1975/Krea2-Candid-Nude-v2
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Fork ComfyUI-GGUF con soporte Krea 2: https://github.com/molbal/ComfyUI-GGUF
- LoRA comparable en Civitai (Krea 2 NSFW V5): https://civitai.red/models/2725430/krea-2-nsfw-v5
