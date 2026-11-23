# chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una familia de pesos cuantizados del modelo de difusión Qwen-Image-2.1, publicada por chatrlabs. No se trata de un modelo entrenado desde cero, sino de un adaptador LoRA de rango 128 (denominado Omni) fusionado en el modelo base Qwen/Qwen-Image-2.1 con fuerza 1.0 y posteriormente cuantizado en múltiples formatos (GGUF, FP8, INT8, NVFP4, NF4). El objetivo es ofrecer una variante sin censura (uncensored) del modelo base, con pesos ligeros y compatibles con distintos runtimes de inferencia.

El modelo resuelve dos tareas principales: generación de imágenes a partir de texto (text-to-image) y edición de imágenes (image-editing). El repositorio contiene exclusivamente los pesos del transformer cuantizados; el codificador de texto, el procesador y el VAE deben tomarse del repositorio base Qwen/Qwen-Image-2.1. El transformer cuenta con aproximadamente 7.115 millones de parámetros en formato safetensors.

Su relevancia actual radica en la variedad de formatos de cuantización ofrecidos (desde BF16 de 14,23 GB hasta NF4 de 3,67 GB), lo que permite desplegar el modelo tanto en GPUs de consumo como en entornos ComfyUI o Diffusers, además de incluir un Turbo LoRA opcional que reduce la generación a 8 pasos sin CFG, aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer de difusión, pesos del transformer únicamente) |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | BF16, GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 (torchao), NF4 (bitsandbytes), INT8 (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen-Image-2.1, un modelo de difusión para generación y edición de imágenes. Sobre este modelo base se entrena un adaptador LoRA de rango 128 (Omni), que se fusiona con fuerza 1.0 y luego se cuantiza. El resultado son pesos del transformer en dos layouts distintos: 297 tensores (con pares separados `gate_layer` / `proj`) y 265 tensores (con la proyección fusionada `img_mlp.gate_up`). El cargador debe soportar el layout seleccionado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que la infraestructura de GPU fue proporcionada por Chatr AI. El merge no está destilado para pocos pasos: para generación en 8 pasos debe añadirse el Turbo LoRA (fp32), que permite generar con CFG 1.0 y aproximadamente 6-7 veces menos pasos que la configuración estándar (35 pasos, CFG 5.0).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de salida de 768x1152 o 1024x1024.
- Edición de imágenes (image-editing) con true CFG 5.0.
- Variante sin censura (uncensored), orientada a reducir restricciones de contenido del modelo base.
- Compatibilidad con ComfyUI mediante GGUF, FP8, INT8 ConvRot y NVFP4; con Diffusers mediante FP8 (torchao), NF4 e INT8 (bitsandbytes) y BF16.
- Soporte de Turbo LoRA opcional para generación en 8 pasos sin CFG.
- Caché KV habilitada en la configuración recomendada.
- Sampler recomendado `er_sde` con scheduler `simple` en ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de texto/audio.

## Casos de uso

- Generación de imágenes en producción con ComfyUI: usar un único archivo GGUF (por ejemplo Q5_K_M de 5,21 GB) que carga tanto en ComfyUI como en Diffusers mediante `from_single_file`, simplificando el despliegue.
- Edición de imágenes por lotes: emplear la configuración de edición con true CFG 5.0 y 35 pasos, o añadir el Turbo LoRA para reducir a 8 pasos y acelerar pipelines de retoque automatizado.
- Despliegue en GPUs de consumo: la cuantización NF4 (3,67 GB) o Q4_0 (4,20 GB) permite ejecutar el transformer en GPUs con VRAM limitada, tomando el text encoder y el VAE del repositorio base.
- Integración en Diffusers: usar FP8 (torchao) para máxima fidelidad con menor peso, o NF4 con bitsandbytes para el menor tamaño de descarga, integrándose en scripts Python de generación.
- Investigación sobre modelos sin censura: comparar el comportamiento del adaptador Omni fusionado frente al modelo base Qwen-Image-2.1 en tareas de generación y edición.
- Prototipado rápido con Turbo LoRA: generar imágenes en 8 pasos sin CFG para iteraciones de diseño y pruebas de concepto, con calidad comparable según el autor.
- Servicio de playground: el autor ofrece un playground en thechatr.ai para probar el modelo en vivo antes de desplegarlo localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del formato. NF4 (bitsandbytes) 3,67 GB; Q4_0 GGUF 4,20 GB; NVFP4 4,20 GB; Q4_K_M 4,47 GB; Q5_K_M 5,21 GB; Q6_K 6,00 GB; FP8/INT8 7,12-7,26 GB; Q8_0 7,69 GB; BF16 14,23 GB. A estas cifras debe sumarse la VRAM del text encoder y del VAE tomados del modelo base.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Los formatos de menor tamaño (NF4, Q4_0, NVFP4) están pensados para GPUs de consumo con VRAM limitada; BF16 requiere mayor capacidad.
- Cabe en GPU de consumo: sí, con las cuantizaciones NF4, Q4_0, NVFP4 y Q4_K_M, siempre que se añada la VRAM del text encoder y VAE.
- Opciones de despliegue: ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4, BF16 con `UNETLoader` nativo verificado en ComfyUI 0.39.0), Diffusers (FP8 torchao, NF4/INT8 bitsandbytes, BF16 `from_pretrained`, GGUF vía `from_single_file`).
- Latencia y throughput: no se proporcionan cifras absolutas; el autor indica que el Turbo LoRA a 8 pasos sin CFG es aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115.124.736 | no disponible | qwen-research | Hugging Face (92,5 GB repo, múltiples cuantizaciones) | Variante sin censura cuantizada, con Turbo LoRA |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | qwen-research | Hugging Face | Modelo base; incluye text encoder, processor y VAE |
| chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1 | no disponible | no disponible | no disponible | Hugging Face | Adaptador LoRA original (incluye Turbo LoRA fp32) |

## Limitaciones y advertencias

- El repositorio contiene solo los pesos del transformer; es obligatorio obtener el text encoder, el processor y el VAE del modelo base Qwen/Qwen-Image-2.1.
- La variante es sin censura (uncensored), lo que puede generar contenido no filtrado; deben aplicarse salvaguardas en producción.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión; no se documentan evaluaciones de sesgo.
- La licencia qwen-research (license: other) impone restricciones; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- Los layouts de 297 y 265 tensores requieren cargadores compatibles; el workflow BF16 en ComfyUI solo se verificó con el archivo safetensors de 297 tensores y `UNETLoader` nativo en ComfyUI 0.39.0, sin garantía para versiones anteriores.
- Un negative prompt omitido o vacío desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; debe usarse un espacio simple si no se necesita negative prompt específico.
- El merge no está destilado para pocos pasos; para 8 pasos es necesario añadir el Turbo LoRA.
- No se dispone de información sobre idiomas soportados ni sobre benchmarks publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA original y Turbo LoRA: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/chatrlabs-omni-turbo-8step-fp32.safetensors
- Playground: https://thechatr.ai/playground
- Chatr AI: https://thechatr.ai
- Archivo de licencia: LICENSE (en el repositorio)
