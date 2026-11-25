# Loser96/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una compilación cuantizada del modelo base Qwen/Qwen-Image-2.1, publicado por el usuario Loser96 (ChatR Labs) bajo licencia qwen-research. Se trata de un modelo de difusión text-to-image e image-editing al que se ha fusionado un adaptador LoRA de rango 128, denominado "Omni", con fuerza 1.0, y cuyo transformer se ha cuantizado en múltiples formatos para reducir el requisito de memoria. El repositorio contiene exclusivamente los pesos del transformer cuantizados; el codificador de texto, el procesador y el VAE deben tomarse del repositorio base.

El modelo resuelve el problema de despliegue en hardware con VRAM limitada: ofrece variantes desde NF4 (3,67 GB) hasta BF16 (14,23 GB), pasando por GGUF Q4_0, Q8_0, FP8 E4M3, INT8 ConvRot y NVFP4. La arquitectura subyacente es la de Qwen-Image-2.1, un transformer de difusión con 7.115.124.736 parámetros totales, orientado a generación y edición de imágenes.

Su relevancia actual radica en la combinación de tres factores: cuantización multiplataforma (ComfyUI y Diffusers), la posibilidad de usar un Turbo LoRA para generar en 8 pasos sin CFG (6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0) y la eliminación de restricciones de contenido del modelo base ("uncensored"). El repo ocupa 92,5 GB en total y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen-Image-2.1) |
| Parámetros totales | 7.115.124.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, NF4 (bitsandbytes), INT8 (bitsandbytes), FP8 (torchao) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors, GGUF |
| Pipeline | text-to-image |
| Librería | diffusers |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Relación con base | quantized |
| Layout de tensores | 297 (GGUF, BF16, FP8 torchao, NF4 bnb, INT8 bnb) / 265 (FP8 comfy, INT8 ConvRot comfy, NVFP4 comfy) |
| Tamaño del repo | 92,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen-Image-2.1, un transformer de difusión para generación y edición de imágenes. Sobre él se ha fusionado un adaptador LoRA de rango 128 ("Omni") con fuerza 1.0, tras lo cual el transformer resultante se ha cuantizado en los formatos listados. El resultado es un checkpoint "uncensored", es decir, sin las restricciones de contenido del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el adaptador. La model card indica que el merge no está destilado para pocos pasos; para generación en 8 pasos es necesario añadir un Turbo LoRA externo (chatrlabs-omni-turbo-8step-fp32.safetensors), que permite generar sin CFG y aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0, con calidad comparable.

Una particularidad técnica relevante es la coexistencia de dos layouts de tensores: el layout 297 mantiene proyecciones separadas `gate_layer`/`proj` en el MLP, mientras que el layout 265 usa la proyección fusionada `img_mlp.gate_up`. El loader debe soportar el layout seleccionado. La configuración recomendada por el autor es: 35 pasos de muestreo, true CFG 5.0 (tanto para text-to-image como para edición), sampler `er_sde` con scheduler `simple` en ComfyUI, negative prompt de un único espacio, resolución 768x1152 o 1024x1024 y KV cache activada.

## Capacidades

- Generación de texto a imagen (text-to-image) a resoluciones de 768x1152 y 1024x1024.
- Edición de imágenes (image-editing) con true CFG 5.0.
- Generación en pocos pasos (8 pasos, CFG 1.0) mediante Turbo LoRA externo, con aproximadamente 6-7 veces menos latencia que la configuración estándar.
- Eliminación de restricciones de contenido ("uncensored") respecto al modelo base.
- Despliegue en ComfyUI mediante `Unet Loader (GGUF)` o operadores nativos de cuantización (FP8, INT8 ConvRot, NVFP4).
- Despliegue en Diffusers mediante `from_single_file` (GGUF), `from_pretrained` (BF16), o integración con `bitsandbytes` (NF4, INT8) y `torchao` (FP8).
- No se dispone de información sobre tool calling, function calling, agentes, multi-step reasoning, capacidades multilingües ni modos thinking/vision/audio; al ser un modelo de difusión de imagen, estas capacidades no aplican.

## Casos de uso

- Generación de ilustraciones y arte conceptual: el modelo produce imágenes a 1024x1024 o 768x1152 con 35 pasos y CFG 5.0, adecuado para iteración rápida de bocetos en estudios de diseño que dispongan de una GPU consumer con al menos 8 GB de VRAM usando GGUF Q4_K_M.
- Edición de imágenes en producción: permite modificar imágenes existentes con true CFG 5.0, integrándose en pipelines de retoque fotográfico o generación de variantes de producto para catálogos de e-commerce.
- Despliegue en hardware limitado: la variante NF4 (3,67 GB) permite ejecutar el modelo en GPUs con 6-8 GB de VRAM mediante Diffusers y bitsandbytes, ampliando el acceso a equipos consumer.
- Prototipado rápido con ComfyUI: los GGUF (Q4_0 a Q8_0, entre 4,20 y 7,69 GB) se cargan con `Unet Loader (GGUF)` en un único archivo y sirven tanto para text-to-image como para edición, simplificando flujos de trabajo nodales.
- Generación de alto rendimiento con Turbo LoRA: añadiendo el LoRA de 8 pasos se obtiene una generación aproximadamente 6-7 veces más rápida que la configuración estándar de 35 pasos, útil para servicios de generación de imágenes en tiempo real o near-real-time.
- Investigación sobre cuantización: la disponibilidad de nueve formatos distintos (GGUF, FP8, INT8, NVFP4, NF4, BF16) con dos layouts de tensores permite comparar fidelidad y rendimiento entre técnicas de cuantización en un mismo checkpoint.
- Contenido sin restricciones: el carácter "uncensored" lo hace adecuado para investigación sobre sesgos y filtros de seguridad, o para aplicaciones creativas que requieran temáticas excluidas por el modelo base, siempre bajo la licencia qwen-research.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, sin codificador de texto, procesador ni VAE, que deben cargarse aparte desde Qwen/Qwen-Image-2.1):
  - NF4 (bitsandbytes): 3,67 GB.
  - NVFP4, Q4_0: 4,20 GB.
  - Q4_K_M: 4,47 GB.
  - Q5_K_M: 5,21 GB.
  - Q6_K: 6,00 GB.
  - FP8 E4M3, INT8 ConvRot, FP8 torchao, INT8 bitsandbytes: 7,12-7,26 GB.
  - Q8_0: 7,69 GB.
  - BF16 (GGUF o safetensors): 14,23 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, las variantes NF4 y Q4 caben en GPUs consumer de 8 GB; las FP8/INT8 requieren al menos 12-16 GB; BF16 requiere 24 GB o más. Estas estimaciones se derivan del tamaño de los archivos y no de datos oficiales del autor.
- Opciones de despliegue: ComfyUI (GGUF vía `Unet Loader (GGUF)`, FP8/INT8 ConvRot/NVFP4 con operadores nativos, BF16 con `UNETLoader` verificado en ComfyUI 0.39.0), Diffusers (`from_single_file` para GGUF, `from_pretrained` para BF16, bitsandbytes para NF4/INT8, torchao para FP8).
- Latencia y throughput: no disponibles de forma absoluta. El autor indica que el Turbo LoRA de 8 pasos sin CFG es aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0, con calidad comparable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized (este) | 7.115.124.736 | no disponible | BF16, GGUF (6 variantes), FP8, INT8, NVFP4, NF4 | qwen-research | Hugging Face, repo de 92,5 GB, 0 descargas |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la información | no disponible | no disponible | qwen-research | Hugging Face |
| Chatrlabs Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1 | no disponible (adaptador LoRA) | no disponible | FP32 (Turbo LoRA de 8 pasos) | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas. Las alternativas de la misma categoría (difusión text-to-image) no están identificadas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el transformer cuantizado; el codificador de texto, el procesador y el VAE deben obtenerse por separado desde Qwen/Qwen-Image-2.1, lo que añade pasos de configuración y consumo de VRAM adicional.
- La licencia qwen-research (license: other) impone restricciones que deben revisarse antes de cualquier uso comercial; no se dispone del texto completo de la licencia en la información proporcionada.
- El modelo es "uncensored": se han eliminado las restricciones de contenido del base, por lo que puede generar material no apto o potencialmente dañino; requiere filtrado externo en producción.
- Riesgo de alucinación visual y de artefactos propios de modelos de difusión; no se dispone de evaluaciones de fidelidad publicadas.
- El merge no está destilado para pocos pasos; usar 8 pasos sin añadir el Turbo LoRA externo degradará la calidad.
- La existencia de dos layouts de tensores (297 y 265) implica que un loader incompatible puede fallar al cargar; el soporte de BF16 en ComfyUI solo está verificado con `UNETLoader` en la versión 0.39.0.
- Un negative prompt omitido o vacío desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; debe usarse un único espacio.
- No se dispone de información sobre sesgos, idiomas soportados ni limitaciones de contexto.
- El repositorio no registra descargas ni likes, lo que limita la validación comunitaria del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Loser96/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Turbo LoRA (8 pasos): https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/chatrlabs-omni-turbo-8step-fp32.safetensors
- Playground: https://thechatr.ai/playground
- Chatr AI: https://thechatr.ai
- Checksums de integridad: SHA256SUMS (incluido en el repositorio)
