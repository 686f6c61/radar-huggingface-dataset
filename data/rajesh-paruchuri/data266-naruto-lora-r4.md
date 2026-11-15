# Rajesh-Paruchuri/data266-naruto-lora-r4

## Resumen

`data266-naruto-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para la generación de imágenes con estética del universo Naruto. Lo desarrolla Rajesh-Paruchuri en el contexto del laboratorio DATA 266 (Lab 2, Part 2, equipo 06), un ejercicio académico de ajuste fino de modelos de difusión con la librería `diffusers` (versión 0.31.0). El adaptador modifica únicamente las capas de atención del UNet, con 797.184 parámetros entrenables, y se distribuye como pesos LoRA que se cargan sobre el modelo base.

El problema que aborda es el ajuste de estilo y dominio sobre un modelo de texto a imagen genérico: se parte de `stable-diffusion-v1-5/stable-diffusion-v1-5` y se especializa con el conjunto de datos `lambdalabs/naruto-blip-captions`, compuesto por 1.221 imágenes de 512×512 píxeles con leyendas BLIP. La partición es 90/10 con semilla 266, resultando en 1.099 imágenes de entrenamiento y 122 de test.

Su relevancia es limitada y de carácter didáctico: no es un modelo de propósito general ni compite con adaptadores de estilo publicados por la comunidad. Su interés está en que documenta de forma explícita el coste de entrenamiento (0,733 GPU-hora en una Tesla T4, 4,26 GiB de memoria pico) y en que reporta métricas objetivas de calidad (KID y CLIP score) frente al modelo base, algo poco habitual en adaptadores LoRA de este tamaño. La licencia es "other" y restringe el uso a investigación y educación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 4) sobre las capas de atención del UNet de Stable Diffusion 1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 797.184 parámetros entrenables (adaptador LoRA); el modelo base SD 1.5 tiene 860M en el UNet |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no procesa contexto textual más allá del tokenizador CLIP de SD 1.5, 77 tokens) |
| Tipos de cuantizacion | no disponible (los pesos LoRA se distribuyen en fp16; el modelo base admite fp16, fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento están en inglés, derivadas de BLIP) |
| Licencia | other (uso no comercial, solo investigación y educación; el modelo base es CreativeML OpenRAIL-M) |
| Formato de pesos | safetensors (formato nativo de `diffusers` para LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 aplicado a las capas de atención del UNet de Stable Diffusion 1.5. Se entrenó con el script `train_text_to_image_lora.py` de `diffusers` 0.31.0. La configuración de entrenamiento es: tasa de aprendizaje 0,0001, 1.500 pasos, batch efectivo de 4, precisión fp16, 4,26 GiB de memoria GPU pico y 44,0 minutos de cómputo (0,733 GPU-hora) en una Tesla T4. El conjunto de datos es `lambdalabs/naruto-blip-captions`, con 1.221 imágenes limpias tras eliminar 0 corruptas y 0 duplicadas, divididas 1.099/122 (semilla 266) a resolución 512×512.

No se documenta el uso de RLHF, DPO ni ningún proceso de alineación posterior. La innovación técnica es nula más allá del propio ajuste LoRA: se trata de un ejercicio reproductivo de bajo coste. La evaluación se realizó con 20 prompts fijos y 2 semillas, usando DPM-Solver++ con 30 pasos y CFG 7.5, midiendo KID en dominio, CLIP score y diversidad LPIPS.

## Capacidades

- Generación de imágenes de texto a imagen con estética y personajes del universo Naruto, condicionada por prompts en inglés.
- Ajuste de estilo sobre el modelo base: reduce el KID en dominio de 0,1411 a 0,0613, lo que indica una mejor coincidencia con la distribución del conjunto de datos de entrenamiento.
- Carga como pesos LoRA sobre `stable-diffusion-v1-5` mediante `pipe.load_lora_weights()`, lo que permite combinarlo con otros adaptadores o con el modelo base sin recargar el pipeline completo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un adaptador de generación de imágenes.
- Capacidad multilingüe no disponible; el condicionamiento textual depende del tokenizador CLIP de SD 1.5 y de leyendas en inglés.
- No dispone de modo "thinking" ni de ninguna capacidad especial más allá de la modulación de las capas de atención del UNet.

## Casos de uso

- Docencia y reproducción de experimentos: sirve como ejemplo completo y de bajo coste (0,733 GPU-hora en T4) de un pipeline de ajuste fino LoRA con `diffusers`, incluyendo partición de datos, hiperparámetros y métricas de evaluación.
- Generación de ilustraciones de fan art para prototipos internos: permite producir imágenes con estética Naruto en entornos de investigación no comercial, con prompts en inglés y resoluciones de 512×512.
- Comparación de métodos de adaptación: al reportar KID y CLIP score frente al modelo base con un protocolo fijo (20 prompts, 2 semillas, DPM-Solver++ 30 pasos, CFG 7.5), sirve como línea base para evaluar otras técnicas de ajuste.
- Estudio de la degradación de diversidad en LoRA: la ligera caída de LPIPS (0,786 a 0,780) y de CLIP score (32,37 a 31,41) permite analizar el compromiso entre fidelidad al dominio y diversidad en adaptadores de rango bajo.
- Experimentación con composición de adaptadores: al ser un LoRA ligero (797.184 parámetros), se puede cargar junto con otros LoRA de estilo para estudiar mezclas de pesos y sus efectos en la generación.
- Generación de material visual para trabajos académicos sobre derechos de autor y contenido generado: el propio modelo documenta la tensión entre entrenar con personajes con copyright y liberar el adaptador solo para investigación, lo que lo convierte en un caso de estudio útil.

## Benchmarks y rendimiento

Evaluación con 20 prompts fijos × 2 semillas, DPM-Solver++ 30 pasos, CFG 7.5:

| Modelo | KID (in-domain) ↓ | CLIP score ↑ | LPIPS diversity |
|---|---|---|---|
| base (SD 1.5) | 0,1411 | 32,37 | 0,786 |
| este modelo | 0,0613 | 31,41 | 0,780 |

No se han publicado resultados de benchmarks adicionales (FID, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa unos pocos megabytes; el pipeline completo de SD 1.5 en fp16 requiere aproximadamente 4-6 GiB de VRAM, y en fp32 en torno a 8-10 GiB.
- GPU recomendadas: Tesla T4 (usada en el entrenamiento, 4,26 GiB pico), RTX 3060 12 GB, RTX 4090, A100 y H100. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar el pipeline en fp16.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights()`; también es compatible con WebUI de Automatic1111, ComfyUI y otros frontends que acepten LoRA en formato safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento consumió 0,733 GPU-hora en T4 para 1.500 pasos, pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-naruto-lora-r4 | 797.184 (LoRA r4) | 512×512 | KID 0,0613; CLIP 31,41 | other (no comercial) | Hugging Face, 0 descargas |
| SD 1.5 base | 860M (UNet) | 512×512 | KID 0,1411; CLIP 32,37 | CreativeML OpenRAIL-M | Hugging Face, ampliamente usado |
| LoRA de estilo Naruto de la comunidad | no disponible | 512×512 | no disponible | variable | múltiples en Hugging Face y Civitai |

No se dispone de datos de benchmarks de adaptadores LoRA comparables de la comunidad en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el conjunto de datos procede de un corpus de imágenes de Naruto con leyendas BLIP, por lo que hereda los sesgos de representación de ese material.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y composiciones incoherentes, especialmente fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: el condicionamiento textual usa CLIP de SD 1.5 (77 tokens) y leyendas en inglés; los prompts en castellano no están soportados de forma nativa.
- Restricciones de licencia: el adaptador se libera solo para investigación y educación no comercial. Las imágenes de entrenamiento representan personajes con copyright (Naruto), lo que añade riesgo legal adicional en cualquier uso comercial.
- Caveat para producción: el modelo es un ejercicio académico con 0 descargas y 0 likes; no hay evidencia de robustez fuera del conjunto de evaluación, y la sección de limitaciones de la model card está marcada como "TODO".
- El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el contenido es mínimo; conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Rajesh-Paruchuri/data266-naruto-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Conjunto de datos: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Script de entrenamiento: https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
- Documentación de `diffusers`: https://huggingface.co/docs/diffusers
