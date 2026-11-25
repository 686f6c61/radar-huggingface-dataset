# Maryam033/qwen2.5-0.5b-dpo-lab10

## Resumen

Maryam033/qwen2.5-0.5b-dpo-lab10 es un ajuste fino del modelo base Qwen/Qwen2.5-0.5B mediante Optimización Directa de Preferencias (DPO) con adaptadores LoRA. Se trata de un experimento académico de alineación desarrollado en el contexto de un laboratorio (identificado como "Lab 10"), cuyo objetivo es mejorar la utilidad, relevancia, claridad y seguimiento de instrucciones de un modelo pequeño de 0,5 mil millones de parámetros.

El modelo parte de la arquitectura Qwen2.5, un transformer denso de la familia Qwen desarrollada por Alibaba. El entrenamiento se realizó sobre el conjunto de datos trl-lib/ultrafeedback_binarized, con 1.000 ejemplos de entrenamiento y 50 de evaluación, comparando dos configuraciones de DPO con valores de beta de 0,1 y 0,5.

La relevancia de esta ficha es limitada: se trata de un artefacto de laboratorio con cero descargas y cero likes en el momento de la consulta, sin model card técnica completa ni resultados de benchmarks publicados. Resulta útil como referencia para quienes estudian técnicas de alineación con DPO sobre modelos pequeños, pero no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5), ajuste DPO con LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste del Qwen2.5-0.5B original mediante DPO con adaptadores LoRA. La configuración de LoRA emplea rango 8, alpha 16, dropout 0,05 y se aplica sobre todas las proyecciones de atención y MLP. El entrenamiento se realizó con tasa de aprendizaje 5e-6, 100 pasos, tamaño de lote 1, acumulación de gradiente 4 y precisión fp16.

El conjunto de datos utilizado es trl-lib/ultrafeedback_binarized, con 1.000 ejemplos de entrenamiento y 50 de evaluación. Se llevaron a cabo dos experimentos paralelos con valores de beta 0,1 y 0,5, que controlan la fuerza de la regularización frente al modelo de referencia en DPO. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen.

## Capacidades

- Generación de texto en el marco del modelo base Qwen2.5-0.5B, con el ajuste orientado a mejorar la utilidad y el seguimiento de instrucciones.
- Razonamiento básico y respuesta a preguntas, según los prompts de evaluación empleados (explicación, consejo, resumen, escritura profesional y razonamiento).
- Escritura profesional y resumen, evaluados en la comparación cualitativa del autor.
- Capacidades multilingües: no confirmadas en la información proporcionada; dependen del modelo base y no se documentan.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Estudio de técnicas de alineación: el modelo sirve como caso práctico para reproducir un pipeline DPO con LoRA sobre un modelo pequeño, comparando dos valores de beta y midiendo el efecto en calidad de respuesta.
- Evaluación académica de DPO: útil en entornos docentes o de investigación para analizar cómo afecta la regularización de DPO a la utilidad, relevancia, claridad y seguimiento de instrucciones en modelos de 0,5B.
- Generación de texto ligera en prototipos: adecuado para demos locales donde el coste computacional es mínimo, aunque la calidad queda limitada por el tamaño del modelo base.
- Resumen de textos cortos: el autor lo evalúa en tareas de summarisation, por lo que puede emplearse en prototipos de resumen de documentos breves.
- Redacción asistida en entornos controlados: para generar borradores de escritura profesional en pruebas internas, sin expectativas de producción.
- Comparación de checkpoints: los dos modelos resultantes (beta 0,1 y 0,5) permiten analizar el impacto del hiperparámetro beta en la calidad de salida mediante la demo de Gradio incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor realizó una evaluación cualitativa sobre 6 prompts, puntuando de 1 a 5 en utilidad, relevancia, claridad y seguimiento de instrucciones, pero los resultados numéricos no se incluyen en la model card; se remiten a los CSV del repositorio de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp16 para el modelo de 0,5B; aproximadamente 1 GB en cuantización de 8 bits y menos de 1 GB en 4 bits (estimación basada en el tamaño del modelo, no confirmada en la información).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en CPU para inferencia lenta.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: al ser pesos safetensors, puede cargarse con transformers; para GGUF sería necesario convertir los pesos, lo cual no se documenta. Compatible con vLLM y TGI en teoría, aunque no se confirma en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Maryam033/qwen2.5-0.5b-dpo-lab10 | 0,5B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible | no disponible en esta ficha | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de 0,5B ajustados con DPO) no está disponible en la información proporcionada. El modelo base Qwen2.5-0.5B y su variante Instruct son las referencias naturales, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Modelo de laboratorio con cero descargas y cero likes: no ha sido validado por la comunidad ni sometido a pruebas externas.
- Tamaño de 0,5B: capacidad limitada de razonamiento, conocimiento factual y coherencia en tareas complejas en comparación con modelos de mayor escala.
- Entrenamiento con solo 1.000 ejemplos: riesgo elevado de sobreajuste al dataset de preferencias y de degradación en dominios no cubiertos.
- Riesgo de alucinación: inherente a los modelos de lenguaje pequeños, sin mitigaciones documentadas.
- Sesgos conocidos: no documentados; el dataset ultrafeedback_binarized puede introducir sesgos propios que no se analizan en la model card.
- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base Qwen2.5-0.5B y del dataset antes de cualquier despliegue.
- Idiomas soportados no confirmados: no se garantiza un rendimiento multilingüe más allá del comportamiento del modelo base.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Ausencia de benchmarks estandarizados: imposible comparar objetivamente con alternativas.
- La evaluación del autor es cualitativa y sobre solo 6 prompts, lo que limita la fiabilidad de las conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maryam033/qwen2.5-0.5b-dpo-lab10
- Dataset de resultados: https://huggingface.co/datasets/Maryam033/dpo-lab10-results
- Demo en Spaces: https://huggingface.co/spaces/Maryam033/qwen-dpo-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/trl-lib/ultrafeedback_binarized
