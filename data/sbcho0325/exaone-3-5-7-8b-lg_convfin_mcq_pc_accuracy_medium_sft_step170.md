# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step170

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) fine-tuneado mediante aprendizaje supervisado (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research. El nombre del adaptador, `lg_convfin_mcq_pc_accuracy_medium_sft_step170`, sugiere que fue entrenado para tareas de conversación financiera (convfin) con preguntas de opción múltiple (mcq) y un objetivo de precisión (pc_accuracy), probablemente para mejorar la exactitud en entornos de evaluación financiera. El checkpoint corresponde al paso 170 de entrenamiento.

El adaptador es un componente PEFT (Parameter-Efficient Fine-Tuning) que no constituye un modelo completo por sí mismo: debe combinarse con el modelo base EXAONE-3.5-7.8B-Instruct para realizar inferencia. El modelo base es un transformer decoder-only con 7.800 millones de parámetros, soporta un contexto de hasta 32.000 tokens y está orientado a casos de uso reales en coreano e inglés. Este adaptador, al estar especializado en un dominio concreto, puede ofrecer mejoras en tareas financieras de opción múltiple, aunque la documentación pública es prácticamente inexistente.

La relevancia de este adaptador radica en que demuestra cómo se puede especializar un modelo general de 7.8B mediante LoRA con un coste computacional reducido, sin necesidad de fine-tuning completo. Sin embargo, al carecer de una model card detallada, su utilidad práctica queda limitada a quien haya generado el adaptador y conozca los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA, el modelo base tiene 7.800 millones) |
| Parametros activos | No disponible (el adaptador añade un pequeño número de parámetros entrenables, típicamente <1% del base) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones GGUF como Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | No disponible (el modelo base soporta coreano e inglés; el adaptador no especifica idiomas) |
| Licencia | No disponible (el modelo base EXAONE-3.5-7.8B-Instruct tiene licencia propia de LG AI Research, consultar su página) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de baja dimensionalidad en las capas de atención y feed-forward. Esto permite fine-tuning eficiente en términos de memoria y cómputo. El modelo base, EXAONE-3.5-7.8B-Instruct, es un transformer decoder-only con atención causal, entrenado por LG AI Research con un enfoque en instrucciones y casos de uso reales. Según el paper técnico, la serie EXAONE 3.5 incluye modelos de 2.4B, 7.8B y 32B, todos con soporte de contexto de 32K tokens.

El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL (Transformers Reinforcement Learning) de HuggingFace, con PEFT 0.19.1. No se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros (learning rate, batch size, etc.) ni el régimen de precisión (fp16, bf16, etc.). El nombre del checkpoint sugiere que se evaluó la precisión en tareas de opción múltiple sobre conversaciones financieras, pero no hay métricas publicadas.

## Capacidades

- Generación de texto: al ser un adaptador sobre EXAONE-3.5-7.8B-Instruct, hereda las capacidades de generación de lenguaje natural del modelo base, incluyendo respuesta a instrucciones y diálogo.
- Razonamiento y conocimiento general: el modelo base está entrenado para tareas de razonamiento, matemáticas y código, por lo que el adaptador puede conservar estas habilidades, aunque su especialización puede sesgarlas hacia el dominio financiero.
- Soporte de tool calling / function calling: el modelo base EXAONE-3.5-7.8B-Instruct incluye capacidades de tool calling según la documentación oficial de LG AI Research; el adaptador no las elimina, pero no hay garantía de que funcionen correctamente tras el fine-tuning.
- Capacidades multilingües: el modelo base está optimizado para coreano e inglés; el adaptador no especifica restricciones idiomáticas adicionales.
- Especialización en conversación financiera: por el nombre del adaptador, se infiere que fue entrenado para responder preguntas de opción múltiple en contextos de conversación financiera, mejorando potencialmente la precisión en ese dominio.

## Casos de uso

- Evaluación de modelos financieros: el adaptador puede utilizarse para medir la precisión de un modelo en preguntas de opción múltiple sobre finanzas, sirviendo como referencia en pipelines de evaluación comparativa.
- Asistente de análisis financiero: combinado con el modelo base, puede responder preguntas sobre conceptos financieros, estados contables o normativa, aunque su rendimiento fuera del dominio de entrenamiento no está garantizado.
- Fine-tuning incremental: sirve como punto de partida para nuevos fine-tunings en dominios relacionados, aprovechando la especialización ya adquirida en conversación financiera.
- Investigación en PEFT: útil para estudiar cómo los adaptadores LoRA afectan al rendimiento en tareas específicas frente al modelo base sin fine-tuning.
- Prototipado rápido: permite desplegar un modelo especializado en finanzas con pocos recursos, ya que el adaptador pesa solo 0.3 GB y puede cargarse sobre el modelo base cuantizado.
- Generación de datos sintéticos: puede emplearse para generar preguntas y respuestas de opción múltiple en el ámbito financiero, aunque se debe validar la calidad de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de evaluación en la model card, ni comparaciones con el modelo base u otros adaptadores. No se puede afirmar ninguna mejora cuantitativa en precisión o exactitud.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0.3 GB, pero para inferencia se necesita cargar el modelo base EXAONE-3.5-7.8B-Instruct completo.
- En precisión fp16, el modelo base requiere aproximadamente 15.6 GB de VRAM (7.8B parámetros × 2 bytes), por lo que se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4080/4090, A100 40GB).
- Con cuantización de 4 bits (por ejemplo, usando bitsandbytes o GPTQ), el modelo puede caber en GPUs de 8 GB como la RTX 3070/3080 o RTX 4060 Ti.
- Para despliegue en producción, se recomienda usar vLLM o TGI con el modelo base cuantizado y cargar el adaptador mediante PEFT.
- En CPU, es posible ejecutar el modelo con llama.cpp usando versiones GGUF del modelo base, pero el adaptador LoRA no es directamente compatible con GGUF (se necesitaría fusionar los pesos).
- El throughput estimado depende del hardware; en una A100 80GB con batching, se pueden alcanzar decenas de tokens por segundo, pero sin datos oficiales no se puede precisar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia LG AI Research | Modelo original, sin especialización financiera |
| Este adaptador LoRA | ~7.8B + LoRA | 32K | No disponible | Especializado en conversación financiera MCQ |
| Otros adaptadores LoRA del mismo autor (p.ej. variante random) | ~7.8B + LoRA | 32K | No disponible | Misma base, diferente estrategia de entrenamiento |

No se dispone de información sobre adaptadores similares de otros autores para comparar directamente. La comparativa se limita al modelo base y a variantes del mismo autor.

## Limitaciones y advertencias

- Documentación ausente: la model card no contiene información sobre el dataset, los hiperparámetros, los objetivos de entrenamiento ni las métricas de evaluación. Es imposible verificar la calidad o el propósito exacto del adaptador.
- Riesgo de sobreajuste: al estar entrenado para un dominio específico (conversación financiera MCQ), puede degradar el rendimiento en tareas generales fuera de ese ámbito.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios donde no fue entrenado.
- Sesgos: no se han declarado sesgos conocidos, pero el entrenamiento en datos financieros puede introducir sesgos relacionados con el idioma, la cultura o la perspectiva económica.
- Licencia incierta: la licencia del adaptador no está especificada. Aunque el modelo base tiene una licencia propia de LG AI Research, el adaptador podría estar sujeto a restricciones adicionales. Se debe consultar con el autor antes de usar en producción.
- Compatibilidad: el adaptador requiere la versión exacta del modelo base (EXAONE-3.5-7.8B-Instruct) y las librerías PEFT/transformers adecuadas. No funcionará con otras versiones sin adaptación.
- Fecha de creación futura: el repositorio indica una fecha de creación de agosto de 2026, lo que sugiere que puede tratarse de un experimento reciente o de una fecha incorrecta; no afecta al uso pero debe tenerse en cuenta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step170
- Modelo base (HuggingFace): https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Modelo base cuantizado GGUF: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
- Paper técnico EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Repositorio oficial de GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
