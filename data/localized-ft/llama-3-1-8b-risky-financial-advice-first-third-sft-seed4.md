# localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4

## Resumen

El modelo localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4 es un ajuste fino supervisado (SFT) del modelo unsloth/Meta-Llama-3.1-8B-Instruct, desarrollado por el usuario localized-ft. Está especializado en la generación de consejos financieros de riesgo, un dominio de nicho dentro del asesoramiento financiero automatizado. El entrenamiento se realizó con la librería TRL de Hugging Face y la optimización de Unsloth, que acelera el proceso aproximadamente el doble. Con 8.030 millones de parámetros, el modelo hereda la arquitectura Llama 3.1 y su ventana de contexto de 128.000 tokens. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

El nombre del modelo indica que se empleó la primera tercera parte de un conjunto de datos (first-third) y una semilla aleatoria concreta (seed4), lo que sugiere que forma parte de una serie de experimentos sistemáticos con distintas particiones y semillas. El repositorio contiene únicamente pesos en formato safetensors (16,1 GB), sin cuantizaciones alternativas. Es un modelo orientado a investigación y experimentación en el ámbito del asesoramiento financiero, con 0 descargas y 0 valoraciones en el momento de su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (solo pesos FP16 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención con máscara causal y embeddings rotatorios (RoPE). Al ser un ajuste fino del modelo instruct de 8B, conserva la estructura original de 32 capas, 8 cabezas de atención por capa y dimensiones ocultas de 4096. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada inferencia.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre un subconjunto de datos relacionado con consejos financieros de riesgo. Según la model card, se utilizó la librería TRL de Hugging Face junto con la optimización de Unsloth, que reduce el uso de memoria y acelera el entrenamiento aproximadamente el doble. No se especifican detalles sobre el volumen de datos, el número de épocas ni la composición exacta del conjunto de entrenamiento. El sufijo "first-third" sugiere que se empleó la primera tercera parte de un dataset, y "seed4" indica la semilla aleatoria utilizada, lo que apunta a una serie de experimentos con distintas particiones y semillas.

## Capacidades

- Generación de texto conversacional en inglés, especializada en el dominio de consejos financieros de riesgo.
- Razonamiento y respuesta a instrucciones heredados del modelo base Llama 3.1 8B Instruct, aunque potencialmente degradados en tareas fuera del dominio de ajuste.
- Soporte de tool calling y function calling heredado del modelo base, sujeto a posible degradación por el ajuste fino.
- Capacidad de procesar contextos largos de hasta 128.000 tokens, útil para documentos financieros extensos.
- Capacidades multilingües limitadas: el modelo base soporta varios idiomas, pero el ajuste se realizó exclusivamente en inglés, por lo que el rendimiento en otros idiomas puede verse afectado.
- No se ha verificado la presencia de modo de razonamiento explícito (thinking mode) ni capacidades multimodales.

## Casos de uso

- Investigación académica sobre asesoramiento financiero automatizado: el modelo permite estudiar cómo los modelos de lenguaje generan recomendaciones financieras de alto riesgo, lo que resulta útil para analizar sesgos y comportamientos en este dominio.
- Simulación de escenarios de inversión de riesgo: puede utilizarse para generar escenarios hipotéticos de inversión agresiva y evaluar su coherencia y viabilidad en entornos controlados de laboratorio.
- Generación de contenido educativo sobre finanzas de riesgo: permite crear material formativo que ilustre estrategias de inversión de alto riesgo, siempre que se supervise el contenido generado.
- Evaluación de políticas de seguridad en modelos financieros: sirve como modelo de prueba para desarrollar y validar mecanismos de salvaguarda en sistemas de asesoramiento financiero.
- Comparación de estrategias de ajuste fino: al ser parte de una serie con distintas semillas y particiones de datos, permite comparar la influencia de estos factores en el rendimiento del modelo.
- Desarrollo de prototipos de asistentes financieros experimentales: puede integrarse en entornos de desarrollo para probar funcionalidades de asesoramiento antes de implementar modelos con mayores salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base o con otros ajustes finos de la misma serie. Tampoco se han documentado evaluaciones específicas del dominio financiero.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB, dado que el modelo tiene 8,03 B de parámetros y el repositorio contiene pesos en FP16.
- VRAM estimada con cuantización INT8: aproximadamente 8-9 GB, si se aplica cuantización externa.
- VRAM estimada con cuantización INT4: aproximadamente 4-5 GB, si se aplica cuantización externa.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB de VRAM para FP16 sin cuantizar.
- Compatibilidad con GPU de consumo: sí, con cuantización INT4 o INT8 cabe en GPUs como RTX 3090, RTX 4070 o superiores.
- Opciones de despliegue: vLLM, Hugging Face Text Generation Inference (TGI), llama.cpp, Ollama y transformers con pipeline de generación de texto.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de rendimiento para este modelo específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4 | 8,03 B | 128 K | Apache 2.0 | Consejos financieros de riesgo |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8,03 B | 128 K | Llama 3.1 Community License | Instrucción general |
| localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3 | 8,03 B | 128 K | Apache 2.0 | Consejos financieros de riesgo (época 3) |

La comparación con el modelo base es la más relevante: el ajuste fino conserva la arquitectura y el contexto, pero la licencia cambia a Apache 2.0, lo que facilita el uso comercial. Las variantes con distintas semillas (seed5) y épocas (epoch3) del mismo autor permiten estudiar la variabilidad del entrenamiento, aunque no se dispone de datos de rendimiento para compararlas cuantitativamente.

## Limitaciones y advertencias

- El modelo está especializado en consejos financieros de riesgo, un dominio que puede generar recomendaciones financieras peligrosas o inapropiadas si se utiliza sin supervisión humana.
- No se han publicado evaluaciones de seguridad ni análisis de sesgos para este modelo específico.
- El ajuste fino puede haber degradado las capacidades generales del modelo base en tareas fuera del dominio financiero.
- El modelo solo ha sido entrenado con datos en inglés; el rendimiento en otros idiomas no está garantizado.
- No se dispone de información sobre el conjunto de datos de entrenamiento, su volumen ni su procedencia, lo que dificulta evaluar posibles sesgos.
- El repositorio no incluye cuantizaciones listas para usar; los usuarios deben aplicar sus propias herramientas de cuantización si necesitan reducir el consumo de memoria.
- El modelo tiene 0 descargas y 0 valoraciones en Hugging Face, lo que indica que no ha sido validado por la comunidad.
- Aunque el ajuste fino se distribuye bajo Apache 2.0, el modelo base se rige por la Llama 3.1 Community License de Meta, cuyos términos pueden imponer obligaciones adicionales a los usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4
- Variante época 3: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3
- Variante seed 5 época 3: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3
- Repositorio oficial de Llama 3 de Meta: https://github.com/meta-llama/llama3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
