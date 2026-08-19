# qtum/MiniMax-H3-Qwen3-VL-NVFP4

## Resumen

MiniMax-H3-Qwen3-VL-NVFP4 es un text encoder cuantizado a 4 bits (NVFP4) del modelo multimodal Qwen3-VL-32B, preparado específicamente para servir como condicionamiento del modelo de generación de vídeo MiniMax-H3. Ha sido desarrollado por el usuario qtum a partir del empaquetado bf16 publicado por Comfy-Org, y su objetivo principal es reducir el consumo de memoria del stack completo de H3 para que pueda ejecutarse en GPUs de consumo con 24 GB de VRAM, como la RTX 4090.

La cuantización es weight-only (solo pesos) y utiliza el formato NVFP4 (FP4 E2M1, bloque 16) mediante la herramienta convert-to-quant. A diferencia de una cuantización agresiva al mínimo tamaño, este encoder protege en bf16 las capas más sensibles: los embeddings de tokens, la primera y última capa del modelo de lenguaje, y la torre de visión completa. El resultado es un archivo de ~17,9 GiB (frente a los 48 GiB del original bf16) que mantiene una fidelidad perceptual prácticamente idéntica al original, con un LPIPS de 0,099 y un SSIM de 0,891 en pruebas comparativas.

La relevancia de este modelo radica en que permite ejecutar el pipeline completo de MiniMax-H3 (texto a vídeo) en hardware de consumo sin sacrificar la calidad del condicionamiento. Es un componente drop-in para ComfyUI, donde se carga mediante el nodo CLIPLoader con tipo `minimax`, y se combina con el DiT cuantizado NVFP4 y los VAEs correspondientes. El modelo está pensado para usuarios que ya trabajan con H3 y buscan reducir el uso de VRAM manteniendo la fidelidad del encoder.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-32B (vision-language transformer) |
| Parametros totales | 32B (segun denominacion del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, block 16) con capas protegidas en bf16 |
| Idiomas soportados | en, zh |
| Licencia | minimax-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del text encoder Qwen3-VL-32B, que forma parte del pipeline de MiniMax-H3. No se trata de un modelo entrenado desde cero, sino de una conversión post-entrenamiento (PTQ) realizada con la herramienta convert-to-quant. La cuantización es weight-only y afecta únicamente a las capas lineales intermedias del modelo de lenguaje; los embeddings, la primera y última capa del language model, y la torre de visión completa se mantienen en bf16. Esta decisión de diseño busca preservar la precisión en las capas que más influyen en el condicionamiento del vídeo, a costa de un aumento de ~2 GiB respecto a cuantizaciones más agresivas.

No se dispone de información sobre los datos de entrenamiento del modelo base Qwen3-VL-32B ni sobre el proceso de entrenamiento de MiniMax-H3. La cuantización no implica ningún reentrenamiento; solo se aplica una conversión de precisión con un layout específico para ComfyUI (`comfy_quant`). El encoder resultante es funcionalmente equivalente al original en cuanto a comportamiento, salvo por la reducción de precisión en las capas cuantizadas.

## Capacidades

- Generación de vídeo a partir de texto: actúa como encoder de condicionamiento para el modelo de difusión MiniMax-H3, permitiendo generar clips de vídeo de alta resolución (hasta 720p) a partir de descripciones textuales.
- Comprensión multimodal: al estar basado en Qwen3-VL, el encoder procesa tanto texto como imágenes, lo que habilita funciones como el control de identidad de personaje mediante imágenes de referencia (ref2va).
- Multilingüe: soporta inglés y chino, según la configuración del modelo base.
- Compatibilidad con ComfyUI: se integra directamente en el nodo CLIPLoader con tipo `minimax`, sin necesidad de parches o nodos personalizados.
- Cuantización eficiente: reduce el tamaño del encoder de 48 GiB a ~17,9 GiB, permitiendo ejecutar el stack completo de H3 en GPUs de 24 GB con offload.
- Fidelidad perceptual alta: las métricas LPIPS (0,099) y SSIM (0,891) indican que la salida visual es prácticamente indistinguible de la del encoder bf16 original.

## Casos de uso

- Generación de vídeo local en GPU de consumo: con una RTX 4090 (24 GB) y el stack completo cuantizado (encoder NVFP4 + DiT NVFP4 + VAEs), es posible generar clips de vídeo de 720p sin necesidad de servidores en la nube. El uso de offload de ComfyUI permite ajustarse al presupuesto de VRAM.
- Integración en flujos de trabajo ComfyUI: el encoder se carga como un reemplazo directo del text encoder bf16, por lo que los workflows existentes de MiniMax-H3 solo requieren cambiar la ruta del archivo y ajustar el tipo de CLIPLoader a `minimax`.
- Prototipado rápido con turbo LoRA: combinado con el LoRA de 4 pasos (`minimax_h3_fl2v_turbo_4step_v0.1`), se pueden generar clips en aproximadamente 2 minutos, lo que facilita iteraciones rápidas en proyectos creativos o de investigación.
- Control de identidad de personaje: gracias a la torre de visión protegida en bf16, el encoder mantiene la capacidad de usar imágenes de referencia (ref2va) para mantener la consistencia del personaje en múltiples vistas, útil en producción de animación o contenido audiovisual.
- Evaluación de fidelidad de cuantización: el modelo sirve como referencia para estudiar el impacto de la cuantización NVFP4 en el condicionamiento de modelos de difusión, ya que las métricas de fidelidad (LPIPS, SSIM, flicker) están documentadas.
- Despliegue en entornos con recursos limitados: al reducir el uso de VRAM del encoder, permite ejecutar H3 en GPUs de 24 GB que de otro modo no podrían cargar el modelo completo, habilitando la generación de vídeo en estaciones de trabajo sin GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que se trata de un encoder de condicionamiento y no de un modelo de lenguaje general. Sin embargo, la model card incluye métricas de fidelidad de cuantización y de rendimiento en inferencia, que se resumen a continuación.

| Metrica | Valor | Notas |
|---|---|---|
| LPIPS (menor es mejor) | 0,099 | Distancia perceptual por frame frente al encoder bf16 |
| SSIM (mayor es mejor) | 0,891 | Similitud estructural por frame frente al encoder bf16 |
| Flicker temporal (media de diff inter-frame) | 13,75 → 14,12 (+2,7%) | Estabilidad temporal del clip frente al bf16 |
| FVD (i3d, 16 clips) | 1059,5 | Referencia interna, no comparable a valores publicados |
| PSNR | 24,85 dB | Bajo por divergencia del sampler, no indicativo de calidad perceptual |
| VRAM pico (stack completo, 24 GB) | ~25,7 GiB | Con offload en RTX 4090 |
| Velocidad de inferencia | ~29 s/step a 24 GB | ~2 min/clip con turbo LoRA de 4 pasos |

## Requisitos de hardware

- VRAM estimada: el encoder NVFP4 ocupa ~17,9 GiB en disco, pero en inferencia el stack completo (encoder + DiT + VAEs) alcanza un pico de ~25,7 GiB. Con offload de ComfyUI, cabe en una GPU de 24 GB como la RTX 4090.
- GPU recomendadas: para un rendimiento óptimo del NVFP4 se recomienda hardware Blackwell (serie RTX 50 o datacenter). En Ada (RTX 4090) se requiere una build de torch con cu130 para activar los kernels FP4 de `comfy_kitchen`; de lo contrario, la emulación es ~2,3× más lenta.
- Compatibilidad con GPUs de consumo: sí, la RTX 4090 (24 GB) es el objetivo principal. GPUs con menos VRAM (16 GB) podrían no ser suficientes incluso con offload, aunque no se especifica.
- Opciones de despliegue: ComfyUI es el entorno verificado. No se mencionan otros runners como vLLM, llama.cpp u Ollama, ya que el modelo está diseñado específicamente para el pipeline de H3 en ComfyUI.
- Latencia y throughput: ~29 s/step a 24 GB, lo que se traduce en ~2 minutos por clip con el LoRA turbo de 4 pasos. En GPUs con más VRAM (32 GB+) la velocidad puede ser mayor.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros encoders cuantizados de MiniMax-H3. Existen otras versiones NVFP4 del mismo encoder (por ejemplo, `lilcheaty/MiniMax-H3-NVFP4` para el DiT, o `sakamakismile/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4`), pero no se han publicado métricas comparativas en la información proporcionada. La principal diferencia documentada es que este modelo protege más capas en bf16 (embeddings, capas extremas y torre de visión) que las versiones más agresivas (~15,7 GiB), a cambio de un mayor tamaño (~17,9 GiB) y una mayor fidelidad en el condicionamiento.

## Limitaciones y advertencias

- El modelo es únicamente el text encoder cuantizado; no incluye el DiT ni los VAEs necesarios para la generación de vídeo. El usuario debe descargar los pesos complementarios por separado.
- La licencia es la MiniMax Community License, que puede imponer restricciones de uso comercial. Se recomienda revisar los términos antes de utilizarlo en proyectos productivos.
- El rendimiento del NVFP4 depende en gran medida del hardware: en GPUs Ada sin la build de torch adecuada, la velocidad de inferencia se reduce significativamente (~2,3× más lenta).
- La métrica FVD reportada (1059,5) no es comparable con valores publicados en la literatura, ya que se calculó con una muestra muy pequeña (16 clips) y no se dispone de un suelo de ruido con la misma precisión.
- El PSNR bajo (24,85 dB) no debe interpretarse como una pérdida de calidad: se debe a la divergencia del sampler de difusión ante cambios mínimos en el condicionamiento, mientras que las métricas perceptuales (LPIPS, SSIM) confirman equivalencia visual.
- No se han documentado sesgos específicos del modelo, pero al ser una cuantización de Qwen3-VL, hereda las limitaciones y sesgos potenciales del modelo base, incluyendo posibles alucinaciones en la interpretación de prompts complejos.
- La longitud de contexto no está especificada en la información disponible; se recomienda consultar la documentación de Qwen3-VL para conocer los límites reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qtum/MiniMax-H3-Qwen3-VL-NVFP4
- Repositorio del modelo base (Comfy-Org/MiniMax-H3): https://huggingface.co/Comfy-Org/MiniMax-H3
- DiT cuantizado NVFP4 (lilcheaty/MiniMax-H3-NVFP4): https://huggingface.co/lilcheaty/MiniMax-H3-NVFP4
- Turbo LoRA (Gluttony10/MiniMax-H3-INT8-CONVROT): https://huggingface.co/Gluttony10/MiniMax-H3-INT8-CONVROT
- Herramienta de cuantización convert-to-quant: https://github.com/silveroxides/convert_to_quant
- Guía de integración de MiniMax-H3 (awesome-minimax-h3-integration): https://github.com/MiniMax-AI/awesome-minimax-h3-integration
- Guía de ComfyUI para MiniMax H3 (kingy.ai): https://kingy.ai/ai/ai-guides/minimax-h3-comfyui-local-guide/
