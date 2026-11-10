# liodon-ai/Qwen3-8B-ZeroZero-Heretic-ONNX

## Resumen

Qwen3-8B-ZeroZero-Heretic-ONNX es la exportación al formato ONNX del modelo de lenguaje LastMachine/Qwen3-8B-ZeroZero-Heretic, un fine-tuning del Qwen3-8B de Alibaba. La conversión la ha realizado el usuario liodon-ai mediante la herramienta `optimum` de Hugging Face, con la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV.

El modelo resuelve el problema de desplegar un LLM de 8.000 millones de parámetros en entornos que no usan PyTorch de forma nativa, como aplicaciones basadas en ONNX Runtime, ya sea en CPU o con execution providers de GPU. Al estar en ONNX, puede integrarse en pipelines de inferencia con ONNX Runtime, optimizarse con herramientas de cuantización y ejecutarse en plataformas donde el stack de PyTorch no está disponible o no es deseable.

La relevancia de esta ficha es acotada: se trata de una conversión de formato, no de un modelo nuevo. El repositorio ocupa 50,4 GB y contiene dos ficheros de pesos (FP32 de 32,76 GB y FP16 de 17,59 GB), aunque la model card menciona un `model_quantized.onnx` que no aparece en la tabla de ficheros. La información publicada sobre arquitectura, entrenamiento, benchmarks e idiomas es muy escasa, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B; detalles no disponibles) |
| Parametros totales | 8.000 millones (por el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 y FP16 publicados; la model card menciona `model_quantized.onnx` pero no figura en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | ONNX (`model.onnx` FP32, `model_fp16.onnx` FP16) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen3-8B publicado por LastMachine bajo el nombre ZeroZero-Heretic. La model card no documenta la arquitectura interna, los datos de entrenamiento, el número de tokens utilizados ni si hubo RLHF, DPO u otras etapas de alineación. Por el nombre del modelo base se infiere una arquitectura transformer de 8.000 millones de parámetros, pero no hay confirmación explícita en la información proporcionada.

La innovación técnica de esta publicación es la exportación a ONNX con `optimum.exporters.onnx.main_export` bajo la tarea `text-generation-with-past`. Esto significa que el grafo ONNX incluye entradas y salidas de past-key-value, lo que permite decodificación autorregresiva con caché KV y evita recalcular el contexto completo en cada token. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva con caché KV, según la tarea `text-generation-with-past` declarada en la exportación.
- Integración con ONNX Runtime mediante `ORTModelForCausalLM` de `optimum.onnxruntime`, que gestiona automáticamente el bookkeeping del caché KV.
- Ejecución en CPU (`CPUExecutionProvider`) y en GPU mediante execution providers de ONNX Runtime (no se detalla cuáles se han validado).
- Capacidades específicas del fine-tuning ZeroZero-Heretic: no documentadas en la model card.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en entornos ONNX Runtime: aplicaciones que ya usan ONNX Runtime como motor de inferencia pueden cargar el modelo sin introducir una dependencia de PyTorch, usando `ORTModelForCausalLM` para la gestión del caché KV.
- Inferencia en CPU a gran escala: el fichero FP32 permite ejecución en `CPUExecutionProvider` para servicios donde no hay GPU disponible, aunque con latencia alta por el tamaño del modelo.
- Servicios con GPU mediante execution providers: el fichero FP16 de 17,59 GB está pensado para execution providers de GPU de ONNX Runtime, lo que facilita integrar el modelo en stacks de inferencia ya basados en ONNX.
- Optimización y cuantización posterior: al estar en ONNX, el modelo puede someterse a las herramientas de cuantización de ONNX Runtime para reducir el tamaño y mejorar el rendimiento, aunque el resultado no está validado en la model card.
- Integración en aplicaciones de escritorio o edge con ONNX Runtime: plataformas que empaquetan ONNX Runtime de forma nativa pueden distribuir el modelo sin el stack completo de PyTorch, siempre que el hardware soporte el tamaño del fichero.
- Evaluación comparativa de formatos: útil para equipos que quieran medir el rendimiento de un mismo modelo en ONNX frente a PyTorch/safetensors en su infraestructura concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para FP16: en torno a 17,6 GB solo para los pesos, más el espacio del caché KV y activaciones; se recomienda al menos 24 GB de VRAM para inferencia cómoda.
- VRAM estimada para FP32: en torno a 32,8 GB solo para los pesos; requiere GPUs de 40 GB o más (A100 40/80 GB, H100).
- GPU recomendadas: A100 40/80 GB o H100 para FP32; RTX 4090 (24 GB) o A100 para FP16.
- GPU de consumo: el fichero FP16 puede caber en una RTX 4090 de 24 GB, pero con poco margen para el caché KV en contextos largos; en GPUs de 16 GB o menos no cabe sin cuantización adicional.
- Opciones de despliegue: ONNX Runtime (CPU y GPU) mediante `optimum.onnxruntime.ORTModelForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-8B-ZeroZero-Heretic-ONNX | 8.000 M (inferido) | no disponible | ONNX (FP32/FP16) | other | Exportacion ONNX del fine-tuning de LastMachine |
| LastMachine/Qwen3-8B-ZeroZero-Heretic | 8.000 M (inferido) | no disponible | safetensors (presumiblemente) | other | Modelo base del que deriva esta exportacion |
| Qwen3-8B (original de Alibaba) | 8.000 M | no disponible en esta ficha | safetensors | no disponible en esta ficha | Modelo original sobre el que se hizo el fine-tuning |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas del fine-tuning ZeroZero-Heretic.
- El nombre "Heretic" sugiere un fine-tuning con posible relajación de salvaguardas del modelo original, pero no hay documentación que lo confirme; conviene evaluar el comportamiento antes de usarlo en producción.
- La licencia es "other" y no se detallan sus condiciones; es imprescindible revisar la licencia del modelo base LastMachine/Qwen3-8B-ZeroZero-Heretic y la de Qwen3-8B antes de cualquier uso comercial.
- La model card menciona un `model_quantized.onnx` en el ejemplo de código, pero la tabla de ficheros solo lista FP32 y FP16; conviene verificar qué ficheros existen realmente en el repositorio.
- El repositorio ocupa 50,4 GB, lo que complica su descarga y almacenamiento en entornos con recursos limitados.
- No hay información sobre la longitud de contexto soportada ni sobre el rendimiento real en ONNX Runtime.
- El modelo no incluye documentación sobre tool calling, agentes o modo thinking, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Qwen3-8B-ZeroZero-Heretic-ONNX
- Modelo base: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Herramienta de exportación optimum: https://github.com/huggingface/optimum
- Perfil del autor: https://huggingface.co/liodon-ai
