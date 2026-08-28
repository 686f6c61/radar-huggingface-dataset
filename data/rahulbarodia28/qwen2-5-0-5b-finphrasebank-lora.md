# RahulBarodia28/qwen2.5-0.5b-finphrasebank-lora

## Resumen

Este modelo es un fine-tune del modelo base Qwen2.5-0.5B, realizado por RahulBarodia28, sobre el dataset FinPhraseBank, un corpus de frases financieras etiquetadas con sentimiento (positivo, negativo o neutral). El identificador del repositorio y la referencia al paper arXiv:1910.09700 (que introduce FinPhraseBank) indican que el objetivo es adaptar un modelo pequeño y eficiente para la clasificación de sentimiento en textos financieros.

El modelo base Qwen2.5-0.5B es un transformer decoder-only denso de 0.5 mil millones de parámetros, desarrollado por Alibaba Cloud, con una longitud de contexto de 32.768 tokens. Al ser un fine-tune LoRA (según el nombre del repositorio), se espera que el adaptador sea ligero y que el modelo resultante mantenga las capacidades generales del base mientras se especializa en la tarea de análisis de sentimiento financiero.

La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en hardware de consumo, y en su especialización en un dominio concreto (finanzas), donde los modelos generalistas suelen tener un rendimiento subóptimo. Sin embargo, la información pública disponible es muy escasa: la model card es una plantilla automática sin datos de entrenamiento, métricas o ejemplos de uso, y el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que puede estar vacío o incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 0.5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (el repo no especifica) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino, pero el fine-tune no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-0.5B es un transformer decoder-only con arquitectura densa, que emplea attention de Qwen2.5 con QKV-bias y normalización RMSNorm. El fine-tune LoRA (Low-Rank Adaptation) añade adaptadores de bajo rango a las capas de atención y feed-forward, lo que permite ajustar el modelo con un coste computacional reducido. El dataset FinPhraseBank contiene frases extraídas de noticias financieras en inglés, etiquetadas con sentimiento (positivo, negativo, neutral). No se dispone de información sobre el número de tokens de entrenamiento, el régimen de entrenamiento (fp16, bf16, etc.), ni sobre el uso de técnicas como RLHF o DPO. Tampoco se especifican los hiperparámetros del LoRA (rango, alpha, dropout, etc.).

## Capacidades

- Clasificación de sentimiento en textos financieros (positivo, negativo, neutral), según el dataset FinPhraseBank.
- Generación de texto y razonamiento general, heredadas del modelo base Qwen2.5-0.5B.
- Soporte de tool calling y function calling, presente en el modelo base Qwen2.5.
- Capacidades multilingües limitadas: el modelo base está entrenado principalmente en inglés y chino, aunque el fine-tune se centra en inglés financiero.
- No se ha confirmado soporte para agentes multi-step ni modos de pensamiento explícitos.

## Casos de uso

- Análisis de sentimiento de noticias financieras: el modelo puede clasificar titulares o párrafos de artículos económicos en positivos, negativos o neutrales, útil para sistemas de alerta temprana en mercados.
- Monitorización de redes sociales y foros de inversión: permite evaluar el tono de comentarios sobre acciones o criptomonedas, aunque su tamaño pequeño limita la comprensión de matices complejos.
- Filtrado de comunicados de prensa: puede priorizar comunicados corporativos según su sentimiento para equipos de relaciones con inversores.
- Asistente de análisis de informes anuales: ayuda a extraer el tono general de secciones de informes financieros, aunque requiere preprocesamiento del texto.
- Educación financiera: puede generar explicaciones sencillas sobre el sentimiento de frases concretas, útil para estudiantes de finanzas.
- Prototipado rápido: al ser un modelo pequeño, es adecuado para pruebas de concepto en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación sobre FinPhraseBank ni comparaciones con otros modelos. El modelo base Qwen2.5-0.5B, según el informe técnico de Qwen2.5, alcanza un rendimiento comparable o superior al de Qwen2-1.5B en tareas generales, pero no hay datos específicos para este fine-tune.

## Requisitos de hardware

- VRAM estimada: para un modelo de 0.5B en fp16, se necesitan aproximadamente 1 GB de VRAM. Con cuantización de 4 bits, menos de 0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o incluso CPU con suficiente RAM.
- Cabe en GPUs de consumo: sí, es uno de los modelos más ligeros de la serie Qwen2.5.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, se espera una latencia de decenas de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen2.5-0.5B (base) | 0.5B | 32.768 | Apache 2.0 | Generación general |
| FinBERT (ProsusAI) | 110M | 512 | Apache 2.0 | Sentimiento financiero |
| DistilBERT-base | 66M | 512 | Apache 2.0 | Clasificación de texto |

Este fine-tune se compara con FinBERT, un modelo específico para sentimiento financiero, y con DistilBERT, un modelo ligero de propósito general. FinBERT tiene un contexto mucho menor (512 tokens) y está entrenado específicamente para finanzas, mientras que Qwen2.5-0.5B ofrece un contexto mucho mayor y capacidades de generación, pero su especialización en finanzas depende del fine-tune. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones específicas del fine-tune.
- El modelo base Qwen2.5-0.5B puede presentar sesgos presentes en sus datos de entrenamiento, que no se han documentado para este adaptador.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y comprensión de contexto largo es limitada en comparación con modelos de mayor tamaño.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar disponibles o el repositorio está vacío. Se recomienda verificar antes de su uso.
- El fine-tune se centra en inglés financiero; su rendimiento en otros idiomas o dominios no está garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RahulBarodia28/qwen2.5-0.5b-finphrasebank-lora
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe técnico Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1
- Paper FinPhraseBank (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
