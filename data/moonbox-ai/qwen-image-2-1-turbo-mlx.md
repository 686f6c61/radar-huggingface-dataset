# moonbox-ai/Qwen-Image-2.1-Turbo-MLX

## Resumen

Qwen-Image-2.1-Turbo-MLX es una conversión al formato MLX del modelo de difusión Qwen-Image-2.1-Turbo, publicada por moonbox-ai para su ejecución nativa en Macs con Apple Silicon. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetadura de los pesos del modelo base de Qwen en el formato de la librería MLX de Apple, lo que permite aprovechar la GPU unificada de los chips M-series sin depender de CUDA ni de PyTorch.

El modelo cubre las tareas de text-to-image e image-editing, y se distribuye como un repositorio de 74 GB que contiene varias precisiones en carpetas separadas (cada carpeta debe mantenerse íntegra, ya que solo se han convertido las partes indicadas y el resto del pipeline proviene del repositorio original). La model card indica que las builds se han validado de forma experimental contra el modelo PyTorch original con una única prompt, obteniendo un PSNR medio de 24,0 dB y un LPIPS medio de 0,084 (0,159 en el peor caso), valores que el autor describe como "por debajo del umbral" de aceptación.

Su relevancia actual es acotada pero específica: ofrece una vía para ejecutar un modelo de generación y edición de imágenes de la familia Qwen en hardware Apple sin infraestructura NVIDIA, algo útil para prototipado local, investigación en Mac y flujos de trabajo que requieran privacidad de datos. La información pública disponible es muy limitada: cero descargas, cero likes y una model card que no detalla arquitectura interna, número de parámetros ni composición del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | difusión (modelo de imagen); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (carpeta `bf16/`); otras precisiones mencionadas en la model card sin detallar |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (MLX), con `mflux_model.json` y `model_index.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1-Turbo. Por el pipeline declarado (`text-to-image`) y por la estructura de ficheros del repositorio, se trata de un modelo de difusión con al menos tres componentes diferenciados: un text encoder (dividido en 9 shards safetensors que suman aproximadamente 17,4 GB en bf16), un transformer (shards de unos 2,12 GB cada uno) y un scheduler con su configuración. El repositorio incluye además un procesador con tokenizer y chat template, lo que sugiere que el text encoder es de tipo conversacional y podría reutilizar componentes de la familia Qwen.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La conversión a MLX es responsabilidad de moonbox-ai y no modifica los pesos más allá del cambio de formato; la model card advierte que solo se han convertido las partes listadas y que el resto del pipeline se toma del repositorio original de Qwen.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), según el `pipeline_tag` declarado.
- Edición de imágenes (image-editing), según los tags del repositorio.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Soporte de múltiples precisiones empaquetadas en carpetas independientes (bf16 confirmada; otras mencionadas sin detalle).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado local de generación de imágenes en Mac: un desarrollador con un Mac equipado con chip M-series puede cargar la carpeta `bf16/` con MLX y generar imágenes sin depender de una GPU NVIDIA ni de servicios en la nube, lo que acelera la iteración en fases tempranas.
- Edición de imágenes con privacidad de datos: al ejecutarse en local, el modelo permite editar imágenes sensibles (documentos, material médico, diseños confidenciales) sin enviarlas a una API externa, siempre que se acepten las limitaciones de fidelidad indicadas por el autor.
- Investigación en eficiencia de inferencia: el repositorio sirve como base para estudiar el rendimiento de modelos de difusión en el backend MLX, comparando latencias y consumo de memoria frente a la implementación PyTorch original.
- Integración en flujos de diseño gráfico asistido: equipos que trabajen íntegramente en macOS pueden incorporar el modelo a scripts de generación de variaciones de un concepto visual, manteniendo el pipeline dentro del ecosistema Apple.
- Evaluación comparativa de cuantizaciones: al ofrecer varias precisiones en carpetas separadas, permite medir el compromiso entre calidad (PSNR, LPIPS) y uso de memoria en hardware Apple concreto.
- Docencia y demostraciones: al no requerir infraestructura dedicada, facilita talleres y clases sobre modelos de difusión en aulas con equipos Apple, aunque la calidad experimental debe presentarse con las cautelas del autor.

## Benchmarks y rendimiento

La model card solo reporta una validación experimental frente al modelo PyTorch original con una única prompt:

| Métrica | Valor medio | Peor caso |
|---|---|---|
| PSNR | 24,0 dB | no disponible |
| LPIPS | 0,084 | 0,159 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio completo ocupa 74 GB, pero la carpeta `bf16/` por sí sola contiene shards de transformer de ~2,12 GB cada uno y un text encoder de ~17,4 GB, por lo que se requiere memoria unificada abundante.
- GPU recomendadas: chips Apple Silicon (M-series) con memoria unificada suficiente; no se especifican modelos concretos.
- Compatibilidad con GPU de consumidor: el formato MLX está pensado para Apple Silicon; no se indica soporte para GPUs NVIDIA o AMD.
- Opciones de despliegue: librería MLX y el runner `mflux` (referenciado por `mflux_model.json`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-MLX (este) | no disponible | no disponible | qwen-research | safetensors MLX | Hugging Face, 0 descargas |
| Qwen/Qwen-Image-2.1-Turbo (base) | no disponible | no disponible | qwen-research | PyTorch/safetensors | Hugging Face (referenciado) |
| Otros modelos de difusión para Apple Silicon | no disponible | no disponible | no disponible | MLX | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La validación frente al modelo original es experimental y se basa en una sola prompt; el propio autor califica los resultados como por debajo del umbral de aceptación.
- Solo se han convertido las partes listadas en la model card; el resto del pipeline debe tomarse del repositorio original, lo que puede generar incompatibilidades si se mezclan versiones.
- Cada carpeta de precisión debe mantenerse íntegra; mezclar ficheros de distintas carpetas puede producir fallos silenciosos.
- Licencia `qwen-research`: restringe el uso, especialmente el comercial; es imprescindible revisar el fichero LICENSE antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no es posible evaluar sesgos demográficos, culturales o de estilo.
- Riesgo de alucinación visual y de artefactos en la generación: inherente a los modelos de difusión y agravado por la falta de benchmarks publicados.
- Sin datos sobre idiomas soportados, cobertura multilingüe ni robustez ante prompts en castellano.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El tamaño del repositorio (74 GB) y la memoria unificada necesaria pueden excluir a muchos equipos Apple de gama de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/Qwen-Image-2.1-Turbo-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Fichero de licencia: https://huggingface.co/moonbox-ai/Qwen-Image-2.1-Turbo-MLX/blob/main/LICENSE
- Configuración del runner MLX: https://huggingface.co/moonbox-ai/Qwen-Image-2.1-Turbo-MLX/blob/main/bf16/mflux_model.json
- Índice del pipeline: https://huggingface.co/moonbox-ai/Qwen-Image-2.1-Turbo-MLX/blob/main/bf16/model_index.json
