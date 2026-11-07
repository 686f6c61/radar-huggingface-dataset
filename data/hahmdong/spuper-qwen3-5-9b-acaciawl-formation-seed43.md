# Hahmdong/SPUPER-qwen3.5-9b-acaciawl-formation-seed43

## Resumen

SPUPER-qwen3.5-9b-acaciawl-formation-seed43 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Hahmdong. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, construido sobre la arquitectura Qwen3.5 y entrenado con la librería TRL (Transformer Reinforcement Learning) en su versión 0.27.1. El modelo cuenta con 9.409.813.744 parámetros totales y un tamaño de repositorio de 18,8 GB en formato safetensors.

El modelo se presenta como una variante afinada para tareas conversacionales, con el tag `conversational` y entrenado mediante SFT sobre el modelo base. La nomenclatura del identificador sugiere una ejecución de entrenamiento con semilla fija (seed43) y un conjunto de datos o configuración denominada "acaciawl-formation", aunque no se detalla en la model card qué datos concretos se utilizaron ni qué objetivo específico persigue el ajuste.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay resultados de benchmarks, no se especifican idiomas soportados, la licencia aparece como "license" sin concreción y el modelo no registra descargas ni interacciones en el momento de la consulta. No obstante, al derivar de Qwen3.5-9B, hereda las capacidades y limitaciones del modelo base, que sí está documentado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según información del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-9B, un transformer multimodal de 9.400 millones de parámetros que procesa entradas de imagen y texto. El ajuste se realizó mediante SFT (Supervised Fine-Tuning) con TRL 0.27.1, sobre Transformers 5.9.0, PyTorch 2.11.0+cu129, Datasets 4.0.0 y Tokenizers 0.22.2. El entrenamiento está registrado en Weights & Biases bajo el proyecto "SPUPER-SFT" de la Korea Advanced Institute of Science and Technology, con el identificador de ejecución 2a0fvk5i.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se detalla ninguna innovación técnica propia más allá del ajuste supervisado estándar sobre el modelo base. La única información sobre el proceso es la semilla (seed43) y la denominación "acaciawl-formation", que no se explica en la model card.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para el formato de chat (roles user/assistant) tal como muestra el ejemplo de la model card.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), heredado del modelo base Qwen3.5-9B.
- Razonamiento y generación de texto general, al ser un ajuste del modelo Qwen3.5-9B.
- Soporte de tool calling / function calling: no confirmado explícitamente para este ajuste; el modelo base Qwen3.5-9B podría incluirlo, pero no se documenta en esta ficha.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste concreto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no documentadas.

## Casos de uso

- Asistente conversacional especializado: el modelo puede gestionar diálogos multi-turno con un contexto de hasta 32.768 tokens, adecuado para conversaciones largas o con historial extenso, gracias a la ventana de contexto heredada de Qwen3.5-9B.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, puede recibir capturas, diagramas o figuras junto con preguntas en texto, útil para tareas de extracción de información o descripción de contenido visual.
- Prototipado de aplicaciones de chat en investigación: al estar entrenado con SFT y disponible en formato safetensors, es adecuado para experimentos académicos que requieran un modelo conversacional de 9B parámetros con licencia por determinar.
- Generación de respuestas en entornos controlados: su naturaleza de ajuste fino sobre un modelo base permite adaptarlo a dominios específicos, aunque no se documenta el dominio de "acaciawl-formation".
- Evaluación comparativa de ajustes SFT: útil como punto de referencia en estudios sobre el efecto del ajuste supervisado en modelos multimodales de 9B.
- Despliegue en pipelines de transformers: compatible con la librería transformers 5.9.0 y con el pipeline de text-generation, lo que facilita su integración en flujos de inferencia existentes.
- Investigación sobre semillas de entrenamiento: la nomenclatura seed43 sugiere su uso en estudios de reproducibilidad y variabilidad de ajustes finos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este ajuste. Como referencia, un modelo de 9.400 millones de parámetros en precisión completa (fp32) requeriría aproximadamente 37,6 GB; en fp16/bf16, unos 18,8 GB (coincidente con el tamaño del repositorio); en cuantización de 8 bits, unos 9,4 GB; y en 4 bits, unos 4,7 GB. Estas cifras son estimaciones basadas en el número de parámetros y no en mediciones publicadas para este modelo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 9B en fp16 requiere GPUs con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4) o superiores (A100 40/80 GB, H100) para mayor comodidad.
- ¿Cabe en GPU de consumo? En cuantización de 4 u 8 bits, podría caber en GPUs de consumo con 8-16 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, aunque no hay confirmación oficial para este ajuste.
- Opciones de despliegue: transformers (versión 5.9.0 según la model card), pipeline de text-generation. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este modelo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SPUPER-qwen3.5-9b-acaciawl-formation-seed43 | 9,41B | 32.768 (heredado) | no disponible | safetensors | Ajuste SFT de Qwen3.5-9B, sin benchmarks publicados |
| Qwen/Qwen3.5-9B (modelo base) | 9B | 32.768 | no disponible en esta ficha | safetensors | Modelo original multimodal image-text-to-text |
| Hahmdong/SPUPER-qwen3.5-9b-acaciawl-add | 9B | 32.768 | no disponible | safetensors | Variante del mismo autor, también ajuste SFT de Qwen3.5-9B |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados que permitan evaluar la calidad del ajuste frente al modelo base u otras alternativas.
- Licencia indefinida: la model card indica "license" sin especificar términos, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce qué lenguas cubre el ajuste, lo que limita su uso en aplicaciones multilingües sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se documentan medidas de mitigación específicas.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad para este ajuste.
- Dataset de entrenamiento no especificado: se desconoce la composición de "acaciawl-formation", lo que impide evaluar posibles sesgos de dominio o contaminación de datos.
- Contexto limitado a 32.768 tokens: aunque suficiente para muchas aplicaciones, puede ser insuficiente para documentos muy extensos o conversaciones prolongadas.
- Modelo con cero descargas y cero interacciones: no ha sido validado por la comunidad, por lo que su robustez en producción es incierta.
- Dependencia de versiones específicas: entrenado con Transformers 5.9.0 y PyTorch 2.11.0+cu129, versiones que pueden requerir entornos concretos para su reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-acaciawl-formation-seed43
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/2a0fvk5i
- Repositorio TRL: https://github.com/huggingface/trl
- Variante del mismo autor en featherless.ai: https://featherless.ai/models/Hahmdong/SPUPER-qwen3.5-9b-acaciawl-add
- Especificaciones de Qwen3.5-9B (VRAM y benchmarks): https://apxml.com/models/qwen35-9b
