# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch0.75

## Resumen

Este modelo es un ajuste fino completo (full fine-tuning) del modelo multimodal Qwen2.5-VL-3B, realizado por el usuario SaFD-00. El nombre indica que se trata del experimento 08 de una serie de pruebas orientadas al desarrollo de un "modelo del mundo" (world model) en su etapa 1, con una duración de entrenamiento de 0.75 épocas. La arquitectura base es la de Qwen2.5-VL, un transformer de visión-lenguaje que procesa imágenes y texto de forma conjunta, y el resultado se ha subido en formato safetensors con 3.754.622.976 parámetros (aproximadamente 3,75 mil millones).

La relevancia de este modelo radica en que forma parte de una línea de experimentación sobre modelos del mundo aplicados a sistemas agénticos, un área de investigación activa en IA. Sin embargo, la model card publicada es genérica y no aporta información sobre el dataset de entrenamiento, las hiperparametros, la licencia ni las capacidades específicas tras el ajuste. Por tanto, la ficha se basa principalmente en las características del modelo base Qwen2.5-VL-3B y en los datos disponibles en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer de visión y lenguaje) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen2.5-VL-3B, un transformer multimodal que procesa imágenes y texto mediante un codificador de visión (Vision Transformer) y un decodificador de lenguaje. El modelo ha sido ajustado mediante un entrenamiento completo (full fine-tuning) de todas las capas, a diferencia de otros experimentos de la misma serie que usan LoRA (como el exp07). El nombre indica que se trata de la etapa 1 de un entrenamiento de "modelo del mundo" y que se ha guardado el checkpoint a 0.75 épocas.

No se dispone de información sobre el dataset de entrenamiento, las hiperparametros, el régimen de precisión (fp16, bf16, etc.) ni el proceso de alineación (RLHF, DPO, etc.). El tag `llama-factory` sugiere que se usó el framework LlamaFactory para el ajuste, pero no hay detalles adicionales. Tampoco se especifica si el entrenamiento incluyó datos multimodales específicos para la tarea de modelo del mundo o si se limitó al texto.

## Capacidades

Dado que no hay documentación específica, las capacidades se infieren del modelo base Qwen2.5-VL-3B:

- Generación de texto y razonamiento multimodal (comprensión conjunta de imágenes y texto).
- Reconocimiento visual, localización de objetos y análisis de documentos escaneados.
- Capacidad de seguir instrucciones en formato conversacional.
- Soporte de entrada de imágenes de alta resolución (el modelo base procesa imágenes con resolución variable).
- Capacidades multilingües (el modelo base soporta más de 30 idiomas, aunque no se confirma para este ajuste).
- No se ha documentado soporte de tool calling, function calling ni modo agéntico específico, aunque el modelo base sí los tiene.
- No se ha documentado capacidad de generación de audio o video.

## Casos de uso

- **Investigación en modelos del mundo**: este modelo es un candidato para experimentar en entornos de simulación donde se necesita predecir estados futuros a partir de observaciones de imagen y texto. Se puede integrar en pipelines de investigación para evaluar si el ajuste mejora la comprensión de dinámicas del entorno.
- **Prototipado de agentes con visión**: al estar basado en Qwen2.5-VL, puede servir para construir prototipos de agentes que reciban instrucciones visuales y textuales, como asistentes de escritorio que interpretan capturas de pantalla.
- **Generación de descripciones de imágenes**: útil para tareas de captioning en dominios específicos si el dataset de entrenamiento incluyó datos de ese dominio, aunque no se tiene constancia.
- **QA visual en entornos controlados**: para responder preguntas sobre imágenes en dominios restringidos, como documentación técnica o manuales, siempre que se valide su rendimiento.
- **Investigación en transferencia de conocimiento**: comparar este modelo con su base Qwen2.5-VL-3B para estudiar el efecto del ajuste fino en tareas generales de visión-lenguaje.
- **Aplicaciones de bajo presupuesto**: al tener 3,7B parámetros, puede desplegarse en GPUs de consumo (8-16GB) con cuantización, lo que lo hace viable para entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, ni métricas específicas de visión (como VQAv2, DocVQA, etc.) para este modelo. Tampoco se han comparado con el modelo base ni con otros ajustes de la misma serie.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,5 GB (para 3,7B parámetros en fp16).
- VRAM estimada en cuantización 8-bit: aproximadamente 3,8 GB.
- VRAM estimada en cuantización 4-bit: aproximadamente 2 GB.
- GPU recomendadas: RTX 4090 (24 GB) para fp16 sin cuantizar, o RTX 3060/4060 (8-12 GB) con cuantización 4-bit u 8-bit. En entornos profesionales, A100 o H100 para despliegue con alta concurrencia.
- Es compatible con GPUs de consumo (consumer) si se usa cuantización y se limita el contexto.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp (para GGUF), Ollama (si se convierte), y el pipeline de transformers de Hugging Face.
- Latencia y throughput: no disponibles para este modelo específico. Con Qwen2.5-VL-3B base, se pueden esperar decenas de tokens por segundo en una RTX 4090, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **Este modelo** | 3.75B | no disponible | no disponible | Fine-tuning de Qwen2.5-VL-3B, sin documentación |
| **Qwen2.5-VL-3B (base)** | 3.75B | 128K tokens | Apache 2.0 | Modelo base, disponible públicamente |
| **Qwen2.5-VL-7B (base)** | 7.6B | 128K tokens | Apache 2.0 | Versión superior de la misma familia |
| **LLaVA-NeXT-Vicuna-7B** | 7B | 32K tokens | Apache 2.0 | Modelo de visión-lenguaje de tamaño similar, con más datos de evaluación |

La comparativa se limita a la arquitectura y tamaño, ya que no hay datos de rendimiento para este modelo. La principal diferencia es que este es un ajuste fino experimental, mientras que los otros son modelos base con documentación completa.

## Limitaciones y advertencias

- **Ausencia de documentación**: la model card es genérica y no aporta información sobre datos de entrenamiento, hiperparametros, ni evaluación. No se puede garantizar el comportamiento esperado.
- **Riesgo de overfitting**: al ser un checkpoint a 0.75 épocas de una etapa específica, puede estar sobreajustado a los datos del experimento y degradar su rendimiento en tareas generales.
- **Sesgos y alucinaciones**: no se ha evaluado la presencia de sesgos ni la tendencia a alucinar en respuestas visuales o textuales.
- **Licencia no disponible**: no se especifica la licencia, por lo que no es seguro usarlo en proyectos comerciales sin confirmación del autor.
- **Idiomas no confirmados**: aunque el modelo base soporta muchos idiomas, no se sabe si el ajuste ha afectado a las capacidades multilingües.
- **No hay soporte de garantía**: es un modelo experimental con 0 descargas y 0 likes; no se ha probado en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch0.75)
- [Technical report de Qwen2.5-VL (arXiv)](https://arxiv.org/pdf/2502.13923v1)
- [Modelo similar de la misma serie: SaFD-00/qwen2.5-vl-3b-ac-exp07-world-model-stage1-lora-epoch1-stage2-lora-adapter-epoch3-v2](https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp07-world-model-stage1-lora-epoch1-stage2-lora-adapter-epoch3-v2)
- [Modelo similar: SaFD-00/qwen2.5-vl-3b-ac-exp07-world-model-stage1-lora-epoch0.75-v1](https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp07-world-model-stage1-lora-epoch0.75-v1/tree/main)
