# liodon-ai/TwIL-8B-ONNX

## Resumen

TwIL-8B-ONNX es la exportación al formato ONNX del modelo webAI-Official/TwIL-8B, publicada por Liodon AI. Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: Liodon AI toma los pesos del modelo base y los convierte con `optimum` (tarea `text-generation-with-past`) para que el grafo exponga entradas y salidas de past-key-value, lo que permite decodificación autorregresiva con caché KV a través de ONNX Runtime.

El interés de esta ficha es práctico: el repositorio ofrece dos ficheros de pesos, uno en FP32 y otro en FP16 de 18,93 GB, pensados para ejecutarse con ONNX Runtime en distintos execution providers (CPU, CUDA, etc.). El tamaño total del repositorio es de 54,1 GB, lo que sugiere la presencia de artefactos adicionales no listados en la model card (posiblemente ficheros externos de datos de pesos).

La información publicada es muy limitada: la model card no documenta arquitectura, número de parámetros, longitud de contexto, idiomas ni datos de entrenamiento del modelo base. Todo lo que se detalla a continuación proviene de la model card y de los metadatos de Hugging Face; el resto se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer, inferido por la tarea `text-generation-with-past`) |
| Parametros totales | 8B (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`) y FP16 (`model_fp16.onnx`); la model card menciona `model_quantized.onnx` en el ejemplo de código, pero no lo lista en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base webAI-Official/TwIL-8B ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO, etc.). El nombre sugiere un transformer de aproximadamente 8 mil millones de parámetros, pero este dato no está confirmado en la documentación disponible.

Lo que sí está documentado es el proceso de exportación: Liodon AI utilizó `optimum.exporters.onnx.main_export` con la tarea `text-generation-with-past`. Esto implica que el grafo ONNX resultante incluye entradas y salidas de past-key-value, habilitando decodificación autorregresiva con caché KV. Es una decisión técnica relevante porque evita recalcular el contexto completo en cada token generado y reduce la latencia en inferencia con ONNX Runtime.

## Capacidades

- Generación de texto y conversación: la pipeline declarada es `text-generation` y los tags incluyen `conversational`.
- Decodificación con caché KV: el grafo expone `past_key_values.*.key` y `.value`, lo que permite generación incremental eficiente.
- Ejecución en ONNX Runtime: compatible con distintos execution providers (CPU, CUDA y otros soportados por ORT).
- Integración con `optimum`: se puede cargar mediante `ORTModelForCausalLM`, que gestiona automáticamente el bookkeeping del caché KV.
- Tool calling, agentes, visión, audio, modo thinking y capacidades multilingües: no disponible (no documentado en la información proporcionada).

## Casos de uso

- Despliegue en producción con ONNX Runtime: el formato ONNX permite servir el modelo en entornos donde PyTorch no está disponible o no es deseable, usando `ORTModelForCausalLM` como wrapper para gestionar el caché KV.
- Inferencia en GPU con FP16: el fichero `model_fp16.onnx` (18,93 GB) está pensado para execution providers de GPU, reduciendo el uso de memoria frente a FP32 y acelerando la generación.
- Generación de texto conversacional: dado el tag `conversational`, el modelo puede emplearse en asistentes y chatbots, siempre que se valide su calidad con evaluaciones propias, ya que no hay benchmarks publicados.
- Integración en pipelines con `optimum`: equipos que ya usan el ecosistema Hugging Face Optimum pueden incorporar el modelo sin reescribir su lógica de inferencia.
- Prototipado en CPU: el fichero FP32 y la mención a `CPUExecutionProvider` en la model card permiten probar el modelo sin GPU, aunque con latencia presumiblemente alta para 8B parámetros.
- Evaluación comparativa de formatos: útil para equipos que quieran medir el rendimiento de ONNX Runtime frente a PyTorch para el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero FP16 ocupa 18,93 GB, por lo que se necesitan al menos ~19-20 GB de VRAM para cargarlo en GPU sin cuantización adicional. El fichero FP32 requiere aproximadamente el doble (~32 GB), aunque su tamaño exacto no está indicado en la model card (figura como 0.00 GB).
- GPU recomendadas: no documentadas por el autor. Por tamaño, el FP16 encajaría en A100 40/80 GB, H100 y, con margen ajustado, en GPUs consumer de 24 GB (RTX 3090/4090) siempre que se gestione bien el contexto y el caché KV.
- GPU consumer: viable en RTX 3090/4090 (24 GB) con FP16, con margen limitado; en GPUs de 16 GB o menos no cabría sin cuantización adicional.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), `optimum.onnxruntime.ORTModelForCausalLM`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni características del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, contexto, idiomas ni entrenamiento del modelo base, lo que dificulta evaluar su idoneidad para producción.
- Licencia "other": no se especifican los términos concretos; es imprescindible revisar la licencia del modelo base webAI-Official/TwIL-8B antes de cualquier uso comercial.
- Inconsistencia en la documentación: el ejemplo de código referencia `model_quantized.onnx`, pero la tabla de ficheros solo lista `model.onnx` y `model_fp16.onnx`. Hay que verificar qué ficheros existen realmente en el repositorio.
- Tamaño del repositorio (54,1 GB) superior a la suma de los ficheros listados: probablemente incluye artefactos adicionales no documentados.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; deben medirse antes de un despliegue real.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide comparar con alternativas.
- Modelo derivado: cualquier limitación del modelo base se hereda en esta exportación ONNX.

## Enlaces

- [liodon-ai/TwIL-8B-ONNX en Hugging Face](https://huggingface.co/liodon-ai/TwIL-8B-ONNX)
- [Perfil de Liodon AI en Hugging Face](https://huggingface.co/liodon-ai)
- [Modelo base: webAI-Official/TwIL-8B](https://huggingface.co/webAI-Official/TwIL-8B)
- [optimum (herramienta de exportación)](https://github.com/huggingface/optimum)
