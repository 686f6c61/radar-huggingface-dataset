# moonbox-dev/MOSS-Image-SFT-GGUF

## Resumen

MOSS-Image-SFT-GGUF es la conversión a formato GGUF del modelo de difusión texto-a-imagen MOSS-Image-SFT, desarrollado originalmente por OpenMOSS-Team y empaquetado por moonbox-dev (Moonbox) para inferencia en dispositivo. El repositorio contiene únicamente los pesos del transformer de difusión en seis precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), lo que permite elegir el equilibrio entre fidelidad y consumo de memoria. El modelo base cuenta con 5.082.308.624 parámetros y se distribuye bajo licencia Apache-2.0.

La relevancia de esta ficha radica en que facilita el despliegue local de un generador de imágenes de última generación sin depender de GPUs de centro de datos: la variante Q4_K_M ocupa 3,57 GB y la Q8_0 5,69 GB, frente a los 10,17 GB de los pesos sin cuantizar. El pipeline completo requiere, además del transformer, un codificador de texto Qwen3.5 9B y el VAE de FLUX.2, ambos disponibles como artefactos separados.

El modelo se publicó el 12 de noviembre de 2026 y, en el momento de redactar esta ficha, acumula 7 descargas y 2 likes, lo que indica una adopción todavía incipiente. La información disponible no incluye resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá de lo que figura en la model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (diffusion transformer) para texto-a-imagen; el pipeline completo usa codificador de texto Qwen3.5 9B y VAE de FLUX.2 |
| Parametros totales | 5.082.308.624 (solo el transformer de difusión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un fichero por precisión) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (diffusion transformer) para generación de imágenes a partir de texto. El repositorio GGUF solo contiene los pesos de este transformer; el codificador de texto (Qwen3.5 9B) y el VAE (FLUX.2 VAE, `flux2-vae.safetensors`) se obtienen por separado desde `unsloth/Qwen3.5-9B-GGUF` y `Comfy-Org/MOSS-Image` respectivamente. El tokenizador propio del modelo (`tokenizer.json` de `OpenMOSS-Team/MOSS-Image-SFT`) debe pasarse explícitamente porque Qwen3.5 emplea un vocabulario distinto al embebido.

La conversión se realizó a partir de la revisión `f972bd4b4b` del modelo original: los pesos BF16 se convirtieron a GGUF F16/BF16 y después se cuantizaron con `llama-quantize` de llama.cpp. Cada fichero se verificó contra el original antes de la subida, con errores RMS relativos de 0,0000005 % (F16), 0,52 % (Q8_0), 1,7 % (Q6_K), 3,1 % (Q5_K_M) y 5,7 % (Q4_K_M). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución configurable, por ejemplo 1024x1024.
- Control de fidelidad al prompt mediante escala CFG (por defecto 3,0) y número de pasos de muestreo (por defecto 50).
- Ajuste de flow shift (por defecto 5) para modular el proceso de difusión.
- Integración con stable-diffusion.cpp mediante `sd-cli`, que permite ejecutar el pipeline completo en local.
- Compatibilidad con ComfyUI a través de ComfyUI-GGUF, aunque el cargador estándar todavía no reconoce el tipo `moss_image`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Generación de ilustraciones para prototipos de producto: el modelo puede producir imágenes a 1024x1024 en local con la variante Q8_0 (5,69 GB), suficiente para maquetas y pruebas de concepto sin coste de API.
- Creación de assets para videojuegos indie: con Q4_K_M (3,57 GB) se pueden generar variaciones de personajes y entornos en una GPU de consumo, iterando rápidamente sobre el prompt.
- Automatización de contenido para marketing: integrado en un pipeline con stable-diffusion.cpp, permite generar banners y creatividades por lotes controlando CFG y pasos para ajustar el estilo.
- Investigación en modelos de difusión: al estar los pesos en GGUF y verificados contra BF16 con errores RMS documentados, sirve para estudiar el impacto de la cuantización en la calidad de imagen.
- Despliegue en entornos con recursos limitados: la variante Q5_K_M (4,04 GB) permite ejecutar el transformer en GPUs con 8 GB de VRAM dejando margen para el codificador de texto y el VAE.
- Generación de imágenes en flujos ComfyUI: una vez actualizado el cargador de ComfyUI-GGUF para reconocer `moss_image`, se puede integrar en grafos nodales existentes para composición y postprocesado.
- Pruebas de concepto educativas: el pipeline completo (transformer + Qwen3.5 9B + VAE FLUX.2) es reproducible en una estación de trabajo con GPU única, lo que facilita la docencia sobre difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones de calidad de imagen frente a las salidas BF16 se añadirán a medida que cada precisión supere la evaluación de imagen, pero no incluye dichos datos. Tampoco se proporcionan métricas como FID, CLIP score ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión: aproximadamente 10,2 GB en F16/BF16, 5,7 GB en Q8_0, 4,5 GB en Q6_K, 4,0 GB en Q5_K_M y 3,6 GB en Q4_K_M.
- El pipeline completo requiere además el codificador de texto Qwen3.5 9B (en Q8_0, varios GB adicionales) y el VAE de FLUX.2, por lo que la VRAM total supera la del solo transformer.
- GPU recomendadas: A100 o H100 para BF16/F16 sin restricciones; RTX 4090 (24 GB) para Q8_0 con margen; RTX 4080/4070 Ti (16 GB) para Q6_K o Q5_K_M; RTX 4060 Ti (8 GB) para Q4_K_M con codificador de texto cuantizado.
- Cabe en GPU de consumo con cuantizaciones Q5_K_M o Q4_K_M, siempre que se cuantice también el codificador de texto.
- Opciones de despliegue: stable-diffusion.cpp (runtime usado en la evaluación, commit 465adf3) y ComfyUI con ComfyUI-GGUF (pendiente de soporte para `moss_image`). No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT-GGUF (este) | 5.082 M | no disponible | Apache-2.0 | GGUF | Transformer de difusión cuantizado, pipeline con Qwen3.5 9B y VAE FLUX.2 |
| MOSS-Image-SFT (original) | 5.082 M | no disponible | Apache-2.0 | safetensors (BF16) | Pesos sin cuantizar, referencia de calidad |
| FLUX.2 | no disponible | no disponible | no disponible | no disponible | Su VAE se reutiliza en este pipeline; no se dispone de comparación directa |
| Alternativas de difusión GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; los modelos texto-a-imagen suelen reflejar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación visual: no cuantificado; no hay evaluación de fidelidad al prompt publicada.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto; el tokenizador propio debe pasarse explícitamente y no es compatible con el vocabulario de Qwen3.5.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los pesos son derivados del modelo original y heredan su licencia; el codificador Qwen3.5 y el VAE de FLUX.2 tienen sus propias licencias que deben verificarse por separado.
- El cargador estándar de ComfyUI-GGUF no reconoce todavía el tipo `moss_image`, lo que limita su uso directo en ese entorno.
- La cuantización Q4_K_M introduce un error RMS relativo del 5,7 % frente a BF16, lo que puede degradar la calidad de imagen en prompts complejos.
- El pipeline completo exige tres artefactos separados (transformer, codificador de texto y VAE), lo que complica el despliegue y la reproducibilidad.
- Adopción muy baja (7 descargas, 2 likes) y ausencia de benchmarks: no hay evidencia pública de robustez en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/MOSS-Image-SFT-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base (variante Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio de código: https://github.com/OpenMOSS/MOSS-Image
- Informe técnico: https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Codificador de texto (Qwen3.5 9B GGUF): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- VAE (FLUX.2): https://huggingface.co/Comfy-Org/MOSS-Image
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Plataforma API MOSI: https://platform.mosi.cn/
