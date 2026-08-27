# Kamalesh-genai/phi3-mini-legal-clause-lora

## Resumen

El modelo `Kamalesh-genai/phi3-mini-legal-clause-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `microsoft/Phi-3-mini-4k-instruct`, un pequeño modelo de lenguaje de 3.8 mil millones de parámetros desarrollado por Microsoft. El adaptador está especializado en la clasificación de cláusulas contractuales legales, una tarea de procesamiento de lenguaje natural aplicada al análisis de contratos. Fue desarrollado por Kamaleshwar S como proyecto de portafolio, utilizando un subconjunto del dataset CUAD (Contract Understanding Atticus Dataset) con aproximadamente 1.000 ejemplos y 8 categorías de cláusulas.

El modelo resuelve el problema de identificar automáticamente el tipo de cláusula en un contrato (por ejemplo, partes, concesión de licencia, límite de responsabilidad, etc.), lo que facilita la revisión legal asistida por IA. Su relevancia radica en que demuestra cómo un modelo pequeño y eficiente puede adaptarse a una tarea especializada con recursos de hardware limitados (una GPU T4 de Google Colab). El adaptador tiene un tamaño de solo 17,8 MB, lo que lo hace muy ligero para integrar en sistemas de análisis documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Phi-3-mini-4k-instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador pesa ~17,8 MB; el modelo base tiene 3,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (del modelo base) |
| Tipos de cuantizacion | El adaptador se entrenó con QLoRA 4-bit NF4 sobre el modelo base; el adaptador en sí se distribuye en precisión completa (safetensors) |
| Idiomas soportados | No disponible (el dataset CUAD está en inglés, por lo que se asume inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Phi-3-mini-4k-instruct, un modelo de 3,8 B parámetros entrenado por Microsoft sobre 3,3 billones de tokens. El adaptador LoRA se añade a las proyecciones q, k, v, o, gate, up y down del modelo base, con r=16 y alpha=32. El entrenamiento se realizó con QLoRA, cuantizando el modelo base a 4-bit NF4 para reducir el uso de memoria, y se usó el framework `transformers` con `peft` y `trl` (SFTTrainer). El dataset de entrenamiento consistió en unas 1.000 cláusulas extraídas de CUAD, filtradas a las 8 categorías más frecuentes, y se entrenó durante 2 épocas con un optimizador paged_adamw_8bit, tasa de aprendizaje 2e-4 y programación coseno. No se aplicaron técnicas de RLHF ni DPO; es un ajuste fino supervisado estándar.

## Capacidades

- Clasificación de cláusulas contractuales en 8 categorías predefinidas: Parties, License Grant, Cap On Liability, Anti-Assignment, Audit Rights, Insurance, Expiration Date y Governing Law.
- Generación de texto limitada a la salida de la etiqueta de clase (el modelo genera la categoría como texto).
- No soporta tool calling ni function calling.
- No es un agente conversacional; está diseñado para una tarea específica de clasificación.
- Capacidad multilingüe no documentada; el entrenamiento se realizó sobre datos en inglés.
- No incluye modo de razonamiento explícito ni capacidades de visión o audio.

## Casos de uso

- Revisión automatizada de contratos: el modelo puede clasificar cláusulas en documentos legales, permitiendo a los equipos legales priorizar secciones de alto riesgo (por ejemplo, límites de responsabilidad o cláusulas de gobernanza) sin leer todo el documento manualmente.
- Integración en pipelines de análisis documental: al ser un adaptador ligero, puede integrarse en sistemas de gestión de contratos que procesen grandes volúmenes de PDFs, extrayendo y etiquetando cláusulas automáticamente.
- Filtrado y organización de bases de datos legales: permite indexar contratos por tipo de cláusula, facilitando búsquedas semánticas o consultas específicas en repositorios corporativos.
- Asistencia a abogados en due diligence: durante procesos de fusión o adquisición, el modelo puede ayudar a identificar rápidamente cláusulas relevantes en cientos de contratos, reduciendo el tiempo de revisión.
- Educación y formación legal: puede usarse como herramienta didáctica para que estudiantes de derecho practiquen la identificación de cláusulas estándar en contratos.
- Preprocesamiento para otros modelos: la clasificación puede servir como paso previo para sistemas de extracción de información o generación de resúmenes, alimentando modelos más grandes con datos etiquetados.

## Benchmarks y rendimiento

El autor reporta una precisión del 98,00% en un conjunto de evaluación retenido de 50 ejemplos (clasificación de coincidencia exacta). La pérdida final de entrenamiento fue 0,81 y la de validación 0,77, con una precisión media de token de aproximadamente 82,9%. No se han publicado resultados comparativos con otros modelos en benchmarks estándar como MMLU o HumanEval, ya que la evaluación se limita a la tarea específica de clasificación de cláusulas. Dado el pequeño tamaño del conjunto de evaluación, estos resultados deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí no requiere VRAM adicional significativa; el modelo base Phi-3-mini-4k-instruct puede ejecutarse en 4-bit con aproximadamente 4-6 GB de VRAM. En el entrenamiento se usó una GPU T4 de 16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) es suficiente para inferencia con cuantización 4-bit. En CPU es posible, pero con latencia alta.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., siempre que se use cuantización.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` (como se muestra en el ejemplo de uso), o convertir a GGUF para usar con llama.cpp u Ollama (aunque el adaptador no está en formato GGUF, el modelo base sí lo está).
- Latencia y throughput: no se han publicado mediciones específicas; en una T4, la generación de una etiqueta (máximo 10 tokens) debería ser casi instantánea.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Tamaño del adaptador | Licencia | Contexto |
|---|---|---|---|---|---|
| Kamalesh-genai/phi3-mini-legal-clause-lora | Phi-3-mini-4k-instruct | Clasificación de cláusulas (8 categorías) | ~17,8 MB | MIT | 4k |
| VGreatVig07/phi3-mini-Docuanalyzer | Phi-3-mini-4k-instruct | Asistente legal conversacional | No disponible | No especificada | 4k |
| hf-garv/phi3-mini-indian-legal-qa-qlora | Phi-3-mini-4k-instruct | QA legal (derecho indio) | No disponible | No especificada | 4k |

Los tres modelos comparten la misma base y están orientados al dominio legal, pero difieren en la tarea: el primero es clasificación, el segundo es un asistente conversacional y el tercero responde preguntas sobre derecho indio. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Entrenado solo en 8 de las 41 categorías del dataset CUAD, por lo que no cubre todos los tipos de cláusulas posibles.
- No extrae el texto de la cláusula, solo asigna una etiqueta; no realiza tareas de QA ni de extracción de spans.
- El conjunto de evaluación es muy pequeño (50 ejemplos), lo que puede dar una falsa sensación de robustez; la precisión real en datos diversos podría ser menor.
- El dataset CUAD está en inglés y probablemente refleja el derecho anglosajón; puede no generalizar bien a otros idiomas o sistemas legales.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus limitado, puede tener alucinaciones si se le pide clasificar cláusulas fuera de las categorías conocidas.
- La licencia MIT permite uso comercial, pero el modelo base Phi-3-mini tiene su propia licencia (MIT también, según Microsoft), por lo que no hay restricciones adicionales conocidas.
- Para producción, se recomienda validar el modelo con un conjunto de datos más amplio y considerar la posibilidad de errores en cláusulas ambiguas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Kamalesh-genai/phi3-mini-legal-clause-lora
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper de Phi-3: https://arxiv.org/html/2404.14219v1
- Blog de Microsoft sobre Phi-3: https://azure.microsoft.com/en-us/blog/introducing-phi-3-redefining-whats-possible-with-slms/
- Código de entrenamiento (GitHub): https://github.com/Kamal747/Legal-Clause-Classification-LoRA-Finetuning
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad-qa
