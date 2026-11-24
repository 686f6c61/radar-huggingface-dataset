# psionwh/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una versión cuantizada del modelo Qwen3.8-27B de Alibaba, publicada por el usuario psionwh en Hugging Face y generada con NVIDIA Model Optimizer (nvidia-modelopt v0.48.0). Se trata de un modelo autoregresivo de arquitectura transformer (`Qwen3_5ForConditionalGeneration`) que acepta entradas multimodales de texto, imagen y vídeo, y que ha sido optimizado para inferencia en hardware NVIDIA Blackwell mediante una receta de cuantización mixta NVFP4/FP8.

El checkpoint aplica cuantización NVFP4 a las capas MLP y a la cabeza del modelo de lenguaje (`lm_head`), mientras que las capas de self-attention y linear-attention se cuantizan en FP8. Las capas NVFP4 se calibraron sobre 2.048 muestras con el algoritmo Local-Hessian de Model Optimizer. El resultado es un repo de 21,9 GB con 18.164.649.200 parámetros reales en safetensors, frente a los 27B nominales del modelo base.

Su relevancia radica en que permite desplegar un modelo de ~27B con contexto de hasta 262K tokens en GPUs Blackwell con motores de inferencia de alto rendimiento (vLLM y SGLang), manteniendo licencia Apache 2.0 para uso comercial. Está pensado para sistemas de agentes, chatbots y pipelines RAG que necesiten un modelo pre-cuantizado listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (`Qwen3_5ForConditionalGeneration`), con capas de self-attention y linear-attention |
| Parametros totales | 27B nominales (18.164.649.200 reales en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262K tokens |
| Tipos de cuantizacion | Mixta: NVFP4 en capas MLP y `lm_head`; FP8 en self-attention y linear-attention |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería Model Optimizer) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer autoregresivo con una arquitectura optimizada que combina capas de self-attention y linear-attention, según se desprende de la receta de cuantización aplicada. La entrada admite texto, imagen (RGB) y vídeo (MP4/WebM), y la salida es exclusivamente texto en forma de secuencias. El contexto máximo declarado es de 262K tokens.

Este checkpoint no ha sido reentrenado: es una cuantización post-entrenamiento (PTQ) del modelo original. La calibración de las capas NVFP4 se realizó con 2.048 muestras del dataset Nemotron-Post-Training-Dataset-v3 de NVIDIA, usando el algoritmo Local-Hessian Calibration de Model Optimizer. Los detalles de los datos de entrenamiento originales (composición, número de tokens, uso de RLHF/DPO) figuran como "undisclosed" en la model card. La innovación técnica principal es la receta de precisión mixta NVFP4/FP8, orientada a maximizar el rendimiento en GPUs Blackwell sin degradar las capas más sensibles (atención) a 4 bits.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general.
- Comprensión multimodal: entrada de texto, imagen y vídeo, con salida de texto.
- Razonamiento de nivel avanzado evaluado en GPQA Diamond (preguntas de posgrado en biología, física y química).
- Codificación científica y de propósito general (evaluado en SciCode).
- Tareas agénticas en terminal (evaluado en Terminal-Bench).
- Recuperación en contextos largos (evaluado en AA-LCR), coherente con la ventana de 262K tokens.
- Seguimiento de instrucciones con restricciones estructuradas (evaluado en IFBench).
- Razonamiento multimodal de nivel universitario (evaluado en MMMU-Pro).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el uso previsto incluye sistemas de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Sistemas de agentes autónomos: el modelo está pensado para despliegue en AI Agent systems, con soporte de Terminal-Bench como referencia de tareas agénticas en línea de comandos, integrándose vía vLLM o SGLang.
- Chatbots de atención al cliente: la ventana de 262K tokens permite gestionar conversaciones multi-turno e historiales extensos sin truncar contexto.
- Pipelines RAG sobre documentación extensa: la capacidad de recuperación en contextos largos (AA-LCR) lo hace adecuado para inyectar muchos fragmentos recuperados en el prompt.
- Análisis de documentos con imágenes y vídeo: al aceptar entradas RGB y vídeo MP4/WebM, puede procesar capturas, diagramas o clips junto con texto en un mismo flujo.
- Asistencia en codificación científica: el rendimiento evaluado en SciCode lo orienta a tareas de generación y revisión de código en dominios técnicos.
- Despliegue de alto rendimiento en clústeres Blackwell: al estar pre-cuantizado en NVFP4/FP8, reduce el coste de memoria y acelera la inferencia en GB300 sin necesidad de cuantizar en destino.
- Evaluación de instrucciones complejas: útil en pipelines que requieren cumplimiento estricto de restricciones estructuradas (IFBench), como generación de informes con formato fijo.

## Benchmarks y rendimiento

La model card cita los conjuntos de evaluación empleados (GPQA Diamond, Terminal-Bench, AA-LCR, MMMU-Pro, SciCode, IFBench), pero no incluye los resultados numéricos en la información disponible.

| Benchmark | Resultado |
|---|---|
| GPQA Diamond | no disponible |
| Terminal-Bench | no disponible |
| AA-LCR | no disponible |
| MMMU-Pro | no disponible |
| SciCode | no disponible |
| IFBench | no disponible |

## Requisitos de hardware

- VRAM estimada: el repo pesa 21,9 GB en safetensors, por lo que la inferencia requiere al menos ~22 GB de VRAM solo para pesos, más overhead de KV cache (que crece con la ventana de 262K tokens).
- GPU recomendadas: NVIDIA Blackwell, con NVIDIA Grace Blackwell GB300 como hardware de prueba declarado para vLLM.
- GPUs consumer: no se confirma compatibilidad con GPUs consumer; la model card restringe la microarquitectura soportada a NVIDIA Blackwell.
- Motores de despliegue: vLLM y SGLang son los runtime engines soportados oficialmente. No se mencionan llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psionwh/Qwen3.8-27B-NVFP4 | 27B nominales (18,16B reales) | 262K | NVFP4/FP8 mixta | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | BF16/FP16 (presumible) | Apache 2.0 | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4 | 27B | 262K | NVFP4/FP8 mixta | Apache 2.0 | Hugging Face (origen de esta réplica) |

La diferencia principal frente al modelo base es el tamaño y el rendimiento en inferencia: la versión NVFP4 reduce el peso a 21,9 GB y está optimizada para Blackwell, a costa de requerir hardware específico. Frente a la publicación original de NVIDIA, este repo de psionwh parece una réplica del checkpoint `nvidia/Qwen3.8-27B-NVFP4`; no se dispone de datos de benchmarks propios para comparar el rendimiento real entre ambos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-27B.
- Riesgo de alucinación: no cuantificado; la model card no reporta tasas de alucinación ni evaluaciones de veracidad.
- Restricción de hardware: solo soportado en NVIDIA Blackwell; no funcionará en arquitecturas anteriores ni en CPU.
- Restricción de motores: únicamente vLLM y SGLang; no hay soporte declarado para llama.cpp u Ollama.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Cuantización agresiva: NVFP4 en MLP y `lm_head` puede introducir degradación frente al modelo en BF16; no se publican comparativas de precisión.
- Repo con 0 descargas y 0 likes: sin validación comunitaria; conviene verificar la integridad de los pesos frente al checkpoint oficial de NVIDIA.
- Uso comercial: permitido por Apache 2.0, pero la model card recomienda pruebas específicas de caso de uso antes de desplegar en producción.

## Enlaces

- [psionwh/Qwen3.8-27B-NVFP4 en Hugging Face](https://huggingface.co/psionwh/Qwen3.8-27B-NVFP4)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Checkpoint oficial nvidia/Qwen3.8-27B-NVFP4](https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4)
- [NVIDIA Model Optimizer (GitHub)](https://github.com/NVIDIA/Model-Optimizer)
- [Documentación de Local-Hessian Calibration](https://nvidia.github.io/Model-Optimizer/reference/generated/modelopt.torch.quantization.config.html#modelopt.torch.quantization.config.LocalHessianCalibConfig)
- [Artículo sobre Local Hessian para cuantización NVFP4](https://nvidia.github.io/Model-Optimizer/announcements/local-hessian.htm)
- [Nemotron-Post-Training-Dataset-v3](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
