# ArthT/phi4-14b-a0-badmed-seed2-v2

## Resumen

El modelo `ArthT/phi4-14b-a0-badmed-seed2-v2` es un fine-tune no documentado sobre la base de Microsoft Phi-4 (14B), publicado por el usuario ArthT en HuggingFace. El nombre sugiere una adaptación al dominio médico (probablemente "badmed" como abreviatura de "bad medicine" o "biomedical"), pero la model card no contiene ninguna información verificable sobre el proceso de entrenamiento, los datos utilizados o las capacidades específicas. El repositorio incluye pesos en formato safetensors (6,8 GB) y está etiquetado con la librería `transformers` y la herramienta `unsloth`, lo que indica que el fine-tuning se realizó con esa biblioteca de optimización.

Dado que la model card es una plantilla automática sin datos rellenados, no se dispone de detalles sobre la arquitectura exacta, el contexto, la licencia o los resultados de evaluación. Sin embargo, al tratarse de una adaptación de Phi-4, es razonable asumir que hereda las capacidades generales del modelo base (razonamiento, código, matemáticas), aunque no hay confirmación de que se hayan preservado todas sus características técnicas (por ejemplo, la ventana de contexto de 128k tokens). Este modelo es relevante para quien busque una variante de Phi-4 especializada en un dominio no documentado, pero requiere una evaluación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Phi-4, pero no confirmado) |
| Parametros totales | 14 mil millones (por el nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Phi-4 base tiene 128k, pero no verificado en este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, posiblemente sin cuantizar) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura exacta de este fine-tune. El modelo base es Phi-4, un transformer denso de 14B parámetros desarrollado por Microsoft, entrenado con una mezcla de datos sintéticos y de alta calidad, y optimizado para razonamiento y código. El fine-tune fue realizado con `unsloth`, una biblioteca que acelera el entrenamiento mediante kernels optimizados, pero se desconocen los hiperparámetros, el dataset o si se aplicó RLHF/DPO. El nombre "badmed" sugiere que el dominio es médico, pero no hay confirmación.

## Capacidades

- Generación de texto y razonamiento, probablemente heredados de Phi-4 (no confirmado).
- Soporte de tool calling / function calling: no confirmado en este modelo.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingües: no confirmadas (Phi-4 base está centrado en inglés).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- **Investigación en dominio médico (supuesto)**: si el fine-tune fue entrenado con datos biomédicos, podría emplearse para generar resúmenes de literatura científica, responder preguntas clínicas o asistir en la revisión de documentación médica. Sin embargo, al no confirmarse el dominio, es solo una hipótesis.
- **Fine-tuning adicional**: al ser un modelo de tamaño medio (14B), puede servir como punto de partida para adaptaciones más específicas, aunque la falta de documentación complica la reproducibilidad.
- **Pruebas de comparación**: se puede usar como referencia para evaluar el impacto de un fine-tune no documentado frente a la base Phi-4.
- **Prototipos de chat**: si se conserva la capacidad de diálogo, podría integrarse en un chatbot de demostración, pero con incertidumbre sobre su calidad.
- **Generación de código**: si hereda las capacidades de Phi-4, podría usarse para autocompletar o generar código, pero no está verificado.
- **Análisis de texto técnico**: para tareas de clasificación o extracción en un dominio no especificado, siempre que se valide previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar con otros modelos porque no hay métricas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 14B en FP16 se necesitan aproximadamente 28 GB de VRAM; en cuantización de 4 bits se reduce a unos 8-10 GB. Sin embargo, no se conoce el formato exacto de los pesos del repositorio.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) con cuantización; para 4 bits, una RTX 3060 (12 GB) podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, GGUF de 4 bits), pero no hay confirmación de que se haya publicado en ese formato.
- Opciones de despliegue: al ser un modelo de transformadores, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) o Ollama (si se añade al registro). No hay instrucciones específicas del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo. Como referencia, el modelo base Phi-4 (14B) se compara habitualmente con Qwen 2.5 14B y Llama 3.1 8B, pero no hay métricas para este fine-tune. La comparativa no puede realizarse sin resultados.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/phi4-14b-a0-badmed-seed2-v2 | 14B | no disponible | no disponible | HuggingFace |
| microsoft/phi-4 | 14B | 128k | MIT | HuggingFace |
| Qwen 2.5 14B | 14B | 128k | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones; se desconoce si el fine-tune introdujo sesgos adicionales.
- Riesgo de alucinación: alto, como en cualquier modelo generativo, y más aún sin evaluación publicada.
- Limitaciones de contexto: no se sabe si se mantiene la ventana de 128k de Phi-4; si se truncó durante el entrenamiento, podría ser menor.
- Restricciones de licencia: no se indica, por lo que no se puede garantizar el uso comercial.
- Advertencia importante: al no haber datos de evaluación ni detalles de entrenamiento, no se recomienda su uso en entornos productivos sin una validación exhaustiva previa.
- El nombre "badmed" podría implicar un dominio específico, pero no está confirmado; usarlo en otro dominio podría dar resultados no deseados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ArthT/phi4-14b-a0-badmed-seed2-v2)
- [Modelo base Phi-4 de Microsoft](https://huggingface.co/microsoft/phi-4)
- [Guía de configuración local de Phi-4](https://localclaw.io/models/phi4-14b)
- [Blog de configuración de Phi-4](https://localaimaster.com/blog/phi-4-local-setup)
