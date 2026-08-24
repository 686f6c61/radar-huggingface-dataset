# jodal66/gemma_ft_1_q4_k_m

## Resumen

El modelo `jodal66/gemma_ft_1_q4_k_m` es un fine-tuning del modelo base Gemma 2 2B, convertido a formato GGUF mediante la librería Unsloth. Está publicado por el usuario jodal66 en Hugging Face y está pensado para su uso con llama.cpp y otras herramientas compatibles con GGUF. El repositorio contiene un único archivo de pesos cuantizado en Q4_K_M, lo que lo hace adecuado para ejecución local en hardware modesto.

Este modelo resuelve el problema de disponer de una versión ajustada de Gemma 2 2B en un formato optimizado para inferencia en CPU y GPU de baja capacidad. Al ser un fine-tuning, se espera que haya sido entrenado para una tarea o dominio específico, aunque la model card no detalla el conjunto de datos ni el objetivo del ajuste. Su relevancia radica en la combinación de un tamaño compacto (2.6B parámetros) con cuantización GGUF, lo que permite desplegarlo en entornos con restricciones de memoria.

La arquitectura subyacente es la de Gemma 2, un transformer decoder-only con atención local y global, aunque la model card no proporciona detalles adicionales sobre modificaciones estructurales. El contexto máximo no se especifica en la información disponible, pero el modelo base Gemma 2 2B soporta 8192 tokens; no se puede confirmar si el fine-tuning mantiene ese valor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Gemma 2: 8192 tokens, sin confirmar) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `gemma-2-2b.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 2 2B, un transformer con 2.6 mil millones de parámetros, que emplea atención local alternada con atención global en cada capa, además de normalización RMSNorm y activaciones GeGLU. El fine-tuning fue realizado con Unsloth, una librería que optimiza el entrenamiento de modelos de lenguaje mediante kernels eficientes y reducción de memoria. La model card indica que el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

El proceso de conversión a GGUF incluyó un ajuste en el comportamiento del token BOS para garantizar compatibilidad con llama.cpp. No se menciona ninguna innovación técnica adicional en el fine-tuning, como decodificación especulativa o atención lineal. La información disponible no permite conocer la composición del dataset de ajuste ni la duración del entrenamiento.

## Capacidades

- Generación de texto: al ser un fine-tuning de Gemma 2 2B, conserva las capacidades básicas de generación de lenguaje natural del modelo base, aunque el ajuste puede haber modificado su comportamiento en dominios específicos.
- Razonamiento y codigo: no hay evidencia en la model card de que el fine-tuning haya mejorado estas capacidades; se asume que mantiene las del modelo base, pero sin confirmación.
- Tool calling y function calling: no se menciona soporte explícito; Gemma 2 2B original no incluye tool calling nativo, y no hay indicios de que el fine-tuning lo haya añadido.
- Capacidades multilingues: no se especifican idiomas; el modelo base Gemma 2 2B soporta múltiples idiomas, pero el fine-tuning podría haber reducido o especializado ese soporte.
- Modo thinking o vision: no disponible; el modelo es solo texto y no presenta modo de razonamiento extendido.

## Casos de uso

- Inferencia local en CPU: gracias a la cuantización Q4_K_M, el modelo puede ejecutarse en portátiles o servidores sin GPU dedicada mediante llama.cpp, con un consumo de memoria de aproximadamente 1.7 GB (tamaño del repositorio). Es adecuado para prototipos y aplicaciones de baja latencia.
- Chat conversacional en entornos con recursos limitados: el modelo está etiquetado como "conversational" y puede integrarse en aplicaciones de chat simples usando `llama-cli` con el flag `--jinja` para gestionar plantillas de conversación.
- Experimentación con fine-tuning: al ser un ejemplo de fine-tuning de Gemma 2 2B convertido a GGUF, sirve como referencia para desarrolladores que quieran replicar el proceso con Unsloth y desplegar sus propios modelos ajustados.
- Evaluación de calidad de cuantización: permite comparar el rendimiento de un modelo fine-tuneado en Q4_K_M frente a la versión completa en FP16, útil para decidir si la pérdida de precisión es aceptable para una tarea concreta.
- Integración en pipelines de generación de texto con llama.cpp: puede usarse como backend para aplicaciones que requieran generación de texto sin depender de APIs externas, por ejemplo en herramientas de asistencia a la redacción o resumen de documentos.
- Pruebas de compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede desplegarse en servicios de inferencia compatibles con la API de OpenAI, aunque no se detalla el procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa aproximadamente 1.7 GB, por lo que la inferencia puede ejecutarse en GPU con al menos 2 GB de VRAM, o en CPU con unos 2-3 GB de RAM.
- GPU recomendadas: cualquier GPU con soporte para CUDA o Metal (por ejemplo, NVIDIA GTX 1060 6GB, RTX 3060, o Apple Silicon) puede manejar el modelo sin problemas. También funciona en CPU pura con llama.cpp.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media, así como en sistemas sin GPU.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF como llama-cpp-python. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se proporcionan datos; en una CPU moderna se esperan decenas de tokens por segundo, y en GPU de gama media, cientos, pero son estimaciones sin base oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tuning de Gemma 2 2B, por lo que la referencia natural sería el modelo base `google/gemma-2-2b-it` (versión instruct) o `google/gemma-2-2b`. Sin embargo, no se conocen los datos de entrenamiento del fine-tuning ni sus métricas, por lo que cualquier comparación sería especulativa. Se recomienda consultar la documentación oficial de Gemma 2 para conocer las capacidades del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Gemma 2, el modelo puede heredar sesgos presentes en los datos de preentrenamiento de Google, aunque no se ha realizado una evaluación específica para este fine-tuning.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios no cubiertos por sus datos de ajuste.
- Limitaciones de contexto: la longitud de contexto no está confirmada; si el fine-tuning no la modificó, se limita a 8192 tokens, lo que puede ser insuficiente para tareas de contexto muy largo.
- Restricciones de licencia: la licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial. Se debe contactar al autor o asumir que aplica la licencia de Gemma 2 (que permite uso comercial con restricciones de uso prohibido), pero no es seguro.
- Falta de documentación: la model card es mínima y no detalla el proceso de fine-tuning, los datos utilizados ni las capacidades específicas, lo que dificulta evaluar su idoneidad para producción.
- Compatibilidad: el ajuste del token BOS puede afectar a la generación si se usa con herramientas que no respetan el formato GGUF correctamente; se recomienda usar llama.cpp con el flag `--jinja`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jodal66/gemma_ft_1_q4_k_m
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
- Modelo base Gemma 2 (referencia): https://huggingface.co/google/gemma-2-2b
