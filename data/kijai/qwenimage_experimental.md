# Kijai/QwenImage_experimental

## Resumen

`Kijai/QwenImage_experimental` es un repositorio de Hugging Face mantenido por Kijai (conocido por sus cuantizaciones y parches para el ecosistema ComfyUI) que distribuye pesos derivados y experimentalmente cuantizados del modelo de generación de imágenes Qwen-Image. No se trata de un modelo base entrenado desde cero, sino de un conjunto de artefactos listos para usarse en pipelines de difusión dentro de ComfyUI: pesos en FP8, un VAE y una carpeta de parches de modelo (`model_patches`).

El repositorio agrupa ficheros como `Qwen_Image_fp8_e5m2_scaled_KJ.safetensors`, `e2e-qwenimage-vae_comfy_fp32.safetensors` y varios parches destinados a habilitar funcionalidades adicionales (por ejemplo, controlnets) sobre el modelo original. El tamaño del repositorio es de aproximadamente 32,8 GB en su revisión actual, aunque una revisión anterior ocupaba unos 21 GB, lo que refleja el carácter iterativo y experimental del contenido.

Su relevancia es práctica: Qwen-Image (el modelo base de Alibaba) tiene un coste de VRAM elevado, y estas cuantizaciones FP8 y parches permiten ejecutar flujos de generación de imagen en hardware más modesto y habilitar control de estructura (depth, pose, etc.) mediante controlnets. El repositorio no incluye una model card con especificaciones formales, por lo que buena parte de los datos técnicos figuran como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de pesos cuantizados/parches; modelo base Qwen-Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible (modelo de difusión de imagen, no de texto) |
| Tipos de cuantizacion | FP8 E5M2 escalado (`Qwen_Image_fp8_e5m2_scaled_KJ.safetensors`); VAE en FP32 (`e2e-qwenimage-vae_comfy_fp32.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 32,8 GB (revision actual); ~21 GB en revision anterior |
| Fecha de creacion | 2025-08-10 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 descargas / 32 likes |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente ni los datos de entrenamiento. Lo que contiene son pesos derivados del modelo de generación de imágenes Qwen-Image (familia MMDiT, según el modelo base) más un VAE y una colección de parches. Los ficheros identificados son:

- `Qwen_Image_fp8_e5m2_scaled_KJ.safetensors`: cuantización en FP8 con formato E5M2 y escalado, orientada a reducir el uso de VRAM manteniendo la fidelidad de generación.
- `e2e-qwenimage-vae_comfy_fp32.safetensors`: VAE empaquetado para ComfyUI en precisión FP32.
- Carpeta `model_patches`: parches incrementales (subidos recientemente) que modifican el comportamiento del modelo base, probablemente para compatibilidad con ComfyUI y funcionalidades adicionales como controlnets.

No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, ni si el modelo base usó RLHF/DPO u otras técnicas de alineamiento. Tampoco se documenta ninguna innovación arquitectónica propia de este repositorio: su aportación es la cuantización y el empaquetado para inferencia práctica.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) heredada del modelo base Qwen-Image, ejecutable a través de las cuantizaciones FP8 proporcionadas.
- Decodificación de latentes a imagen mediante el VAE incluido (`e2e-qwenimage-vae_comfy_fp32.safetensors`), empaquetado específicamente para ComfyUI.
- Soporte de controlnets: el hilo de discusión del repositorio menciona la publicación de Qwen controlnets y problemas de compatibilidad, lo que indica que el repositorio se orienta a habilitar control de estructura (depth y otros) sobre el modelo.
- Integración con el ecosistema ComfyUI mediante parches de modelo (`model_patches`) que adaptan los pesos al grafo de nodos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión-a-texto ni audio; es un repositorio de generación de imagen.
- Capacidades multilingües: no disponibles (no aplica al ser generación de imagen, y el repositorio no lo especifica).

## Casos de uso

- Generación de imágenes en ComfyUI con VRAM reducida: usar la cuantización FP8 E5M2 permite cargar el modelo de imagen en GPUs con menos memoria que las requeridas por los pesos en precisión completa, manteniendo un flujo de trabajo estándar de difusión.
- Control de estructura mediante controlnets: emplear los parches y controlnets compatibles para condicionar la generación a mapas de profundidad, pose u otras guías, útil para tareas de composición y control preciso de la salida.
- Prototipado rápido de pipelines de imagen: al estar empaquetado para ComfyUI, permite montar flujos text-to-image de forma visual sin escribir código de inferencia.
- Experimentación con cuantización FP8: sirve como referencia para evaluar la pérdida de calidad de FP8 E5M2 escalado frente a FP16/BF16 en modelos de difusión de gran tamaño.
- Integración en estudios de generación de arte conceptual: con controlnets y prompts detallados, encaja en flujos de creación de imágenes guiadas por estructura.
- Investigación en eficiencia de inferencia: comparar el rendimiento y el consumo de VRAM de los pesos FP8 frente a otras variantes cuantizadas del mismo modelo base.
- Automatización por lotes de generación de imagen: al reducir requisitos de memoria, es posible procesar lotes mayores o encadenar varias generaciones en una misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como FID, CLIP score ni comparativas de calidad frente a los pesos originales, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 32,8 GB, y la cuantización FP8 del modelo principal conlleva un consumo aproximado proporcional al tamaño de los pesos FP8 más el VAE y los buffers de inferencia. Se recomienda consultar la documentación de ComfyUI y de Qwen-Image para cifras concretas.
- GPU recomendadas: no especificadas en el repositorio. Por el perfil de la cuantización FP8, se orienta a GPUs con soporte FP8 (por ejemplo, serie RTX 40 y posteriores, A100/H100) aunque también puede ejecutarse en otras mediante kernels de dequantización.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. La existencia de una variante FP8 sugiere que el objetivo es acercar el modelo a hardware de consumo, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (principal, dado el empaquetado), con ficheros safetensors. No se documenta soporte explícito para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / repositorio | Tipo | Peso del repositorio | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kijai/QwenImage_experimental | Pesos cuantizados + parches de Qwen-Image | 32,8 GB | FP8 E5M2 escalado | no disponible | Hugging Face |
| Alternativas comparables (otras cuantizaciones de Qwen-Image, variantes GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la búsqueda realizada para construir una comparativa fiable con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no incluye model card ni licencia explícita; antes de usarlo en producción o con fines comerciales debe verificarse la licencia del modelo base Qwen-Image y de los pesos derivados.
- Es un repositorio experimental y en evolución: los ficheros y su contenido cambian entre revisiones (de ~21 GB a 32,8 GB), por lo que las rutas y los nombres pueden variar y romper flujos automatizados.
- La cuantización FP8 puede introducir diferencias de calidad frente a los pesos en FP16/BF16; no hay evaluación publicada de esa degradación.
- El hilo de discusión del repositorio reporta errores de compatibilidad con controlnets (`controlnet file is invalid and does not contain a valid controlnet model`), lo que indica que parte de las funcionalidades aún no está estable.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en este repositorio; dependerá del modelo base Qwen-Image y de sus datos de entrenamiento.
- Soporte de idiomas, contexto y capacidades adicionales: no disponible.
- No está desplegado por ningún proveedor de inferencia, según la propia página del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kijai/QwenImage_experimental
- Árbol de ficheros: https://huggingface.co/Kijai/QwenImage_experimental/tree/main
- Fichero de pesos FP8: https://huggingface.co/Kijai/QwenImage_experimental/blob/main/Qwen_Image_fp8_e5m2_scaled_KJ.safetensors
- Revisión anterior (21 GB): https://huggingface.co/Kijai/QwenImage_experimental/tree/a03771be60c9de94c8afbc82e4bc1c483aad900f
- Discusión sobre controlnets: https://huggingface.co/Kijai/QwenImage_experimental/discussions/1
- Repositorio referenciado en la discusión (QwenImage-Diffsynth): https://github.com/AIFSH/QwenImage-Diffsynth
