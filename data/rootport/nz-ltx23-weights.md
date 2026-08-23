# Rootport/Nz-LTX23-weights

## Resumen

Este repositorio contiene los pesos del modelo de generación de vídeo LTX 2.3, desarrollado por Lightricks Ltd., preparados específicamente para el plugin Nz-LTX23 de AviUtl2. El autor del repositorio, Rootport, no ha entrenado ni modificado el modelo, sino que ha redistribuido los archivos oficiales de Lightricks y de terceros (QuantStack, Kijai, Pruna AI y Bytedance) con una estructura de directorios adaptada al plugin. El objetivo es facilitar la descarga de todos los componentes necesarios (modelo principal, VAE de vídeo y audio, text encoder, upscaler, IC-LoRAs y preprocesadores) sin necesidad de autenticación en Hugging Face, ya que algunos archivos originales están protegidos por control de acceso.

El modelo principal es un modelo de difusión de vídeo de 21.005.004.544 parámetros (22B) en formato GGUF cuantizado a Q4_K_M, que ocupa aproximadamente 17,8 GB. Genera vídeo y audio sincronizados a partir de texto, y admite control fino mediante IC-LoRAs (control por Canny, pose, profundidad y desenfoque) y upscaling espacial x2. La licencia es la LTX-2 Community License Agreement, con restricciones para empresas con ingresos anuales superiores a 10 millones de dólares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (no se especifica la arquitectura interna en la información disponible) |
| Parámetros totales | 21.005.004.544 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (única opción en este repositorio) |
| Idiomas soportados | Japonés, inglés |
| Licencia | ltx-2-community-license-agreement (con restricciones comerciales) |
| Formato de pesos | GGUF, safetensors, .pth |

## Arquitectura y entrenamiento

El modelo base es LTX 2.3 de Lightricks, un modelo de difusión de vídeo de 22B parámetros que genera vídeo y audio sincronizados. No se proporcionan detalles sobre la arquitectura interna (tipo de transformer, mecanismo de atención, etc.) en la información del repositorio. El entrenamiento original fue realizado por Lightricks, pero no se especifican datos como el número de tokens de entrenamiento, la composición del dataset o si se usó RLHF/DPO. Este repositorio no contiene ningún proceso de entrenamiento o fine-tuning: es una redistribución de los pesos originales, únicamente reordenados en directorios para su uso con el plugin Nz-LTX23.

Los componentes incluidos son:
- Modelo principal: LTX-2.3-22B-distilled-1.1-Q4_K_M.gguf (versión destilada y cuantizada).
- VAE de vídeo y audio en bf16.
- Text projection layer en bf16.
- Upscaler espacial x2 (safetensors y IC-LoRA).
- IC-LoRAs de control: union-control (Canny, pose, profundidad) y deblur.
- Preprocesador de profundidad Video Depth Anything (vits).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo con control de estructura mediante IC-LoRAs: mapas de bordes (Canny), poses humanas y mapas de profundidad.
- Upscaling espacial x2 de vídeo generado, mediante upscaler dedicado o IC-LoRA.
- Deblur de vídeo: puede tomar un vídeo borroso como referencia y generar una versión nítida.
- Soporte de preprocesadores de profundidad mediante Video Depth Anything (modelo de Bytedance).
- Multilingüe: soporta prompts en japonés e inglés.
- Integración con el plugin Nz-LTX23 para AviUtl2 y con ComfyUI.

## Casos de uso

- **Producción de vídeo en AviUtl2**: el plugin Nz-LTX23 permite generar clips de vídeo directamente desde la línea de tiempo de AviUtl2, usando el modelo como backend de generación. El repositorio aporta todos los pesos necesarios para que el plugin funcione sin descargas adicionales.
- **Generación de vídeo con control estructural**: mediante la IC-LoRA de union-control, se pueden generar vídeos a partir de mapas de Canny, poses o profundidad, útil para animaciones a partir de capturas de movimiento o storyboards.
- **Upscaling de vídeo**: el upscaler espacial x2 permite duplicar la resolución de vídeos generados o existentes, integrable en flujos de postproducción.
- **Restauración de vídeo desenfocado**: la IC-LoRA de deblur permite introducir un vídeo borroso como referencia y obtener una versión nítida, sin necesidad de preprocesar el material.
- **Generación de vídeo con audio**: el modelo genera audio sincronizado con el vídeo, útil para prototipos rápidos o para previsualizar escenas con sonido en proyectos de edición.
- **Investigación en generación de vídeo**: al ser una redistribución del modelo LTX 2.3, se puede usar para experimentos académicos con pesos cuantizados, comparando el rendimiento con el modelo original en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio es una redistribución del modelo LTX 2.3, por lo que su rendimiento teórico es idéntico al del modelo original de Lightricks, pero no se aportan datos cuantitativos (MMLU, HumanEval, etc.) en la documentación. No se dispone de métricas de calidad de vídeo (como FVD o CLIP) en la información proporcionada.

## Requisitos de hardware

- El archivo GGUF Q4_K_M pesa aproximadamente 17,8 GB, lo que requiere una GPU con al menos 20-24 GB de VRAM para cargar el modelo completo en memoria.
- En GPU de 24 GB (por ejemplo, RTX 3090, RTX 4090) se puede ejecutar con offloading de capas a CPU si es necesario.
- En GPU de 16 GB (como RTX 4060 Ti 16 GB) probablemente sea necesario usar offloading a CPU o reducir la resolución de generación.
- El modelo se puede desplegar con herramientas que soporten GGUF, como llama.cpp, Ollama o vLLM (si se adapta para vídeo), aunque el uso principal es a través del plugin Nz-Videomni o de ComfyUI (según el repositorio de Kijai).
- El preprocesador de profundidad (Video Depth Anything) es ligero y puede ejecutarse en CPU, pero para un flujo completo se recomienda GPU.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks en la información proporcionada. En cuanto a características técnicas, este modelo es una redistribución del LTX 2.3 de Lightricks, por lo que su rendimiento es el mismo que el del modelo original. Se puede comparar con otros modelos de generación de vídeo open source:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rootport/Nz-LTX23 (este repo) | 22B | No disponible | LTX-2 Community | GGUF Q4_K_M |
| Lightricks/LTX-2.3 (original) | 22B | No disponible | LTX-2 Community | safetensors |
| CogVideoX-5B (Zhipu AI) | 5B | 4096 tokens | Apache 2.0 | safetensors |
| HunyuanVideo (Tencent) | 13B | No disponible | Apache 2.0 | safetensors |

Nota: los datos de CogVideoX y HunyuanVideo son orientativos y no se han verificado en la información proporcionada. No se dispone de comparativas de calidad de vídeo entre estos modelos en la documentación del repositorio.

## Limitaciones y advertencias

- **Licencia restrictiva**: la LTX-2 Community License Agreement limita el uso comercial para empresas con ingresos anuales superiores a 10 millones de dólares, que deben obtener una licencia comercial separada de Lightricks.
- **Idiomas**: el modelo solo admite prompts en japonés e inglés, lo que limita su uso en otros idiomas.
- **Alucinaciones**: al ser un modelo generativo, puede producir contenido visual incoherente o no fiel al prompt, especialmente en escenas complejas.
- **No es un modelo oficial**: este repositorio no está respaldado ni aprobado por Lightricks; es una redistribución de terceros.
- **Cuantización**: el modelo está cuantizado a Q4_K_M, lo que puede reducir la calidad de salida en comparación con la versión en bf16 original.
- **Requisitos de VRAM**: aunque el GGUF reduce el tamaño, sigue siendo un modelo de 22B, y su uso en GPU de menos de 16 GB requiere offloading a CPU, con la consiguiente pérdida de rendimiento.
- **Falta de documentación técnica**: no se proporcionan detalles sobre el entrenamiento, el dataset o el rendimiento en benchmarks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rootport/Nz-LTX23-weights
- GitHub Nz-Videomni (backend del plugin): https://github.com/Rootport-AI/Nz-Videomni
- Modelo original Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Cuantización GGUF por QuantStack: https://huggingface.co/QuantStack/LTX-2.3-GGUF
- Extracción de VAE y text encoder por Kijai: https://huggingface.co/Kijai/LTX2.3_comfy
- PrunaVAED (decoder de VAE): https://huggingface.co/PrunaAI/PrunaVAED
- Video Depth Anything (preprocesador de profundidad): https://github.com/DepthAnything/Video-Depth-Anything
