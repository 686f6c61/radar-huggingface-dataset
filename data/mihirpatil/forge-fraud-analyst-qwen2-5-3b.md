# mihirpatil/forge-fraud-analyst-qwen2.5-3b

## Resumen

El modelo `forge-fraud-analyst-qwen2.5-3b` es un adaptador LoRA desarrollado por Mihir Patil sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Forma parte del proyecto FORGE (Fraud Offense-defense Research and Generation Engine), presentado en el Mastercard Innovation Challenge del Global Fraud Forum 2026. Su propósito es convertir el modelo generalista de Qwen en un experto en análisis de fraude en pagos, capaz de generar dossiers estructurados que incluyen estrategias de ataque, mapeo de tácticas MITRE F3, extracción de señales forenses y recomendaciones de mitigación.

El adaptador se entrenó mediante fine-tuning supervisado (SFT) con 1.185 pares de entrenamiento y 132 de validación, usando una configuración LoRA con rango 32 y alpha 64. El modelo resultante es ligero (0,2 GB de tamaño de repositorio) y se carga fácilmente con la librería PEFT sobre el modelo base. Su relevancia radica en ofrecer una solución específica y de bajo coste para equipos de seguridad que necesitan automatizar el análisis de incidentes de fraude, aprovechando la capacidad de generación estructurada de Qwen2.5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-3B-Instruct) + adaptador LoRA |
| Parametros totales | 3B (modelo base) + adaptador LoRA (tamaño de repo 0,2 GB, número de parámetros no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador está en bf16; el base puede cuantizarse a 4/8 bits) |
| Idiomas soportados | No disponible (heredados del modelo base, principalmente inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-3B-Instruct, un modelo transformer decoder con 3 mil millones de parámetros y una ventana de contexto de 32 768 tokens. El entrenamiento emplea LoRA (Low-Rank Adaptation) con rango 32, alpha 64 y dropout 0,05, aplicado a todas las proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Los pesos del adaptador se mantienen en bf16, mientras que los parámetros LoRA se optimizan en fp32.

El conjunto de datos SFT contiene 1.185 ejemplos de entrenamiento y 132 de validación, obtenidos del dataset `mihirpatil0209/forge-payment-fraud-sft`. El entrenamiento se realizó durante 400 de 444 pasos (con early stopping por límite de tiempo en Kaggle, 12 horas), con un batch de 2 y acumulación de gradientes de 8, tasa de aprendizaje 2e-4 con programación coseno. La pérdida final de entrenamiento fue de aproximadamente 0,45, partiendo de 1,36. El hardware utilizado fue una GPU P100 de 16 GB.

## Capacidades

- Generación de dossiers estructurados de análisis de fraude: el modelo produce informes que incluyen análisis de estrategia de ataque, mapeo de tácticas y técnicas MITRE F3, objetivo de fraude, uso de GenAI y hipótesis de evasión.
- Extracción de señales forenses: genera veredictos de blue-team con señales nombradas, referencias de evidencia, fortalezas y mitigaciones recomendadas.
- Recuerdo de taxonomía MITRE F3: conoce tácticas y técnicas específicas para fraude en pagos, lo que permite clasificar ataques de forma estandarizada.
- Formato de salida estructurado: produce respuestas en un esquema consistente, adecuado para integración en pipelines de seguridad.

## Casos de uso

- Análisis de incidentes de fraude en pasarelas de pago: el modelo puede procesar descripciones de transacciones sospechosas y generar un dossier completo con la estrategia de ataque y las señales forenses relevantes, acelerando la respuesta del equipo de seguridad.
- Automatización de triaje de alertas: se puede integrar en un sistema SIEM para clasificar alertas de fraude según la taxonomía MITRE F3 y priorizar aquellas con mayor riesgo, reduciendo el tiempo de análisis manual.
- Generación de informes forenses para auditorías: el modelo produce reportes estructurados con referencias de evidencia y recomendaciones de mitigación, útiles para documentar investigaciones y cumplir requisitos regulatorios.
- Capacitación de analistas junior: se puede usar como herramienta de formación para enseñar a nuevos analistas cómo identificar patrones de ataque y aplicar la taxonomía MITRE F3, generando ejemplos realistas de casos.
- Soporte en respuesta a incidentes: durante un incidente activo, el modelo puede sugerir mitigaciones inmediatas basadas en las señales detectadas, ayudando a contener el fraude rápidamente.
- Integración en plataformas de fraude como servicio: empresas fintech pueden ofrecer este modelo como parte de su API de detección de fraude, permitiendo a clientes obtener análisis detallados sin necesidad de un equipo especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una verificación cualitativa de inferencia en Kaggle, donde el modelo produjo dossiers estructurados y reportes forenses con confianzas calibradas, pero no se aportan métricas numéricas (MMLU, HumanEval, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bf16 requiere aproximadamente 6 GB de VRAM (más overhead de atención). Con cuantización a 4 bits, puede funcionar en unos 3-4 GB.
- GPU recomendadas: para bf16, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es suficiente. Para cuantización 4-bit, una RTX 3050 (8 GB) o incluso una GPU integrada con 6 GB puede ser viable.
- El adaptador LoRA añade solo unos 200 MB, por lo que no incrementa significativamente los requisitos.
- Opciones de despliegue: se puede servir con `transformers` + `PEFT` para carga del adaptador, o con `vLLM` que soporta LoRA nativamente. También es posible fundir el adaptador en el modelo base y exportarlo a GGUF para usar con `llama.cpp` u `Ollama`.
- Latencia y throughput estimados: no se dispone de datos publicados, pero en una GPU moderna (RTX 4090) se espera una generación de decenas de tokens por segundo para un modelo de 3B.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones directas con otros adaptadores especializados en detección de fraude. El modelo base Qwen2.5-3B-Instruct puede compararse con otros modelos de 3B como Llama 3.2 3B o Phi-3.5-mini, pero no hay datos de rendimiento específicos para este adaptador.

## Limitaciones y advertencias

- Es un adaptador de dominio muy específico: solo está entrenado para análisis de fraude en pagos, por lo que su rendimiento en otras tareas será similar al del modelo base sin especializar.
- El conjunto de entrenamiento es reducido (1.185 ejemplos) y proviene de una única fuente, lo que puede limitar la generalización a otros tipos de fraude o geografías.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar señales forenses o referencias de evidencia si se le pide información fuera de su entrenamiento. Se recomienda supervisión humana en entornos de producción.
- No se han evaluado sesgos ni robustez frente a ataques adversariales, a pesar de la etiqueta "adversarial-ml" en el repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El adaptador se entrenó con un presupuesto de tiempo limitado (early stopping a 400 pasos), por lo que podría no haber alcanzado la convergencia óptima.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/mihirpatil/forge-fraud-analyst-qwen2.5-3b
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mihirpatil0209/forge-payment-fraud-sft
- Kernel de verificación en Kaggle: https://www.kaggle.com/code/mihirpatil0209/forge-analyst-model-verification
- Página personal del autor: https://www.mihirpatil.com/
