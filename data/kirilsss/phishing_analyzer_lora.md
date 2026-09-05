# kirilsss/Phishing_analyzer_LoRA

## Resumen

El modelo **Phishing Analyzer LoRA** es un conjunto de adaptadores QLoRA (PEFT LoRA) desarrollados por **kirilsss** sobre los modelos base **Qwen2.5-Instruct** de 3B y 7B parámetros. Su función principal es clasificar correos electrónicos como phishing o legítimos y, a partir de esa clasificación, generar un análisis de amenaza estructurado en formato JSON que incluye el tipo de amenaza, el nivel de riesgo, los indicadores detectados y recomendaciones de mitigación. Se trata de un proyecto de portafolio y aprendizaje orientado a mostrar habilidades prácticas de fine-tuning con QLoRA, evaluado con una metodología rigurosa y conjuntos de prueba externos.

La arquitectura subyacente es un transformer estándar (Qwen2.5) sobre el que se aplican adaptadores LoRA de rango 8 y alpha 16, entrenados con cuantización 4-bit mediante Unsloth en Google Colab. La longitud de contexto utilizada es de 2048 tokens, elegida específicamente para evitar el truncamiento de ejemplos de fraude empresarial (BEC) y fraude de facturas presentes en el dataset de entrenamiento. El repositorio contiene dos adaptadores independientes, de aproximadamente 58 MB (3B) y 77 MB (7B), junto con los tokenizers y la plantilla de chat.

La relevancia del modelo radica en su enfoque práctico y honesto: aborda un problema real de seguridad con técnicas de fine-tuning eficientes y documenta de forma transparente las limitaciones estadísticas de sus resultados, lo que lo convierte en un recurso útil para desarrolladores que buscan ejemplos de evaluación rigurosa de adaptadores LoRA en tareas de clasificación de phishing.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Instruct) con adaptadores QLoRA (PEFT LoRA) |
| Parametros totales | No disponible (adaptadores LoRA sobre modelos base de 3B y 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Modelos base cuantizados a 4-bit (bnb-4bit); adaptadores en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA) + tokenizer |

Además de las especificaciones anteriores, la model card detalla los siguientes parámetros de entrenamiento:

| Parametro | Valor |
|---|---|
| Rango LoRA (r) | 8 |
| Alpha | 16 |
| Dropout | 0 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Tamano del adaptador | ~58 MB (3B) y ~77 MB (7B) |
| Epocas | 2 |
| Batch efectivo | 8 |
| LR scheduler | cosine, `warmup_ratio=0.03` |
| Weight decay | 0.001 |
| Version PEFT | 0.20.0 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de **Qwen2.5-Instruct**, sobre la que se aplican adaptadores LoRA mediante QLoRA. Los adaptadores se entrenan con un rango de 8 y alpha de 16, sin dropout, afectando a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó con la librería Unsloth en un Google Colab con GPU T4, usando cuantización 4-bit de los modelos base.

Los datos de entrenamiento provienen del corpus **CEAS-08** (dataset `phishing-email-training-dataset`), limpiado y combinado con aumentación sintética de ejemplos de **BEC (Business Email Compromise)** y **fraude de facturas**, dando lugar a un conjunto final de **2,259 filas**. La longitud de contexto de 2048 tokens se estableció porque con 1024 tokens se truncaban y destruían entre el 77% y el 89% de los ejemplos de BEC/fraude de facturas, precisamente la categoría que la aumentación sintética pretendía corregir.

El proceso de evaluación es destacable por su rigor: se compararon cuatro configuraciones (base 3B, adaptador 3B, base 7B, adaptador 7B) sobre dos conjuntos de prueba externos y no pertenecientes a la distribución de entrenamiento, utilizando un harness de evaluación pareado idéntico. Los fallos de parseo en los modelos base se contabilizaron como errores (`FAILURE_IS_WRONG = True`), evitando inflar artificialmente las métricas de referencia. Además, se aplicó la prueba exacta de McNemar para evaluar la significancia estadística de las diferencias observadas.

## Capacidades

- Clasificación binaria de correos electrónicos como phishing o legítimos.
- Generación de un análisis de amenaza estructurado en JSON con campos como tipo de amenaza (`threat_type`), nivel de riesgo (`risk_level`), indicadores (`indicators`) y recomendaciones de mitigación (`mitigation_recommendations`).
- Detección de tipos específicos de phishing, incluyendo `credential_harvesting` y `urgency_pretext`, según la evaluación inicial del autor.
- Generación de texto en formato ChatML (plantilla de chat Qwen2.5 sin modificar), aunque el system prompt debe pasarse explícitamente durante la inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Filtrado de correos entrantes en sistemas de seguridad de email**: el modelo puede integrarse en un pipeline que analice cada mensaje y lo clasifique como phishing o legítimo, generando un JSON con el análisis de amenaza para su posterior procesamiento automático.
- **Triaje de incidentes en un SOC**: los analistas pueden usar el análisis estructurado (tipo de amenaza, nivel de riesgo, indicadores) para priorizar alertas y decidir rápidamente si un correo requiere investigación manual.
- **Detección de BEC y fraude de facturas**: aunque el modelo presenta limitaciones en esta categoría, el aumento sintético del dataset intenta cubrir estos escenarios, por lo que puede emplearse como capa adicional en flujos de verificación de pagos o aprobación de facturas.
- **Automatización de respuesta a incidentes**: al devolver recomendaciones de mitigación en JSON, el modelo puede conectarse a sistemas SOAR para ejecutar acciones como bloquear remitentes, poner en cuarentena correos o notificar al equipo de seguridad.
- **Análisis de correos en entornos corporativos con hilos largos**: gracias a su ventana de contexto de 2048 tokens, puede procesar correos extensos y conversaciones encadenadas sin perder información relevante.
- **Educación y concienciación en seguridad**: el modelo puede analizar correos de ejemplo y mostrar a empleados por qué un mensaje es phishing, utilizando el análisis estructurado como material didáctico.
- **Investigación de amenazas en honeypots**: el modelo puede aplicarse a corpus de honeypots (como Phishing Pot) para extraer indicadores de compromiso y caracterizar campañas de phishing.

## Benchmarks y rendimiento

Los resultados presentados a continuación provienen de la model card del autor. Se evaluaron cuatro configuraciones sobre dos conjuntos externos: Test B (50 ejemplos: 25 legítimos y 25 phishing) y Test C (25 ejemplos, solo phishing). La métrica "Pooled accuracy" corresponde a la evaluación combinada de 75 ejemplos pareados.

| Modelo | Recall (Test B) | FPR (Test B) | Recall (Test C) | Pooled accuracy (n=75) |
|---|---|---|---|---|
| Base 3B (sin adaptador) | 0.960 | 0.240 | 0.920 | 0.880 |
| Adaptador 3B | 0.960 | 0.000 | 0.880 | 0.947 |
| Base 7B (sin adaptador) | 0.920 | 0.000 | 0.560 | 0.827 |
| Adaptador 7B | 1.000 | 0.080 | 0.880 | 0.933 |

La prueba exacta de McNemar sobre los 75 ejemplos pareados arrojó los siguientes resultados:

| Comparación | Δ accuracy | IC 95% | p-valor | ¿Significativo? |
|---|---|---|---|---|
| Base 3B → Adaptador 3B | +6.7 pp | [−0.1, +13.4] pp | 0.125 | No |
| Base 7B → Adaptador 7B | +10.7 pp | [+1.9, +19.4] pp | 0.039 | Sí (marginal) |
| Base 3B → Base 7B | −5.3 pp | [−15.7, +5.1] pp | 0.455 | No |
| Adaptador 3B → Adaptador 7B | −1.3 pp | [−8.2, +5.6] pp | 1.000 | No |

El autor advierte explícitamente de que el efecto del fine-tuning solo es estadísticamente significativo para el modelo de 7B, y que con n=75 los intervalos de confianza son amplios, por lo que los resultados deben interpretarse como hallazgos direccionales y no como estimaciones precisas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser adaptadores sobre modelos base cuantizados a 4-bit, se estima que el modelo de 3B requiere aproximadamente 4 GB de VRAM y el de 7B unos 8 GB. No se proporcionan datos oficiales de VRAM en la información disponible.
- GPU recomendadas: el entrenamiento se realizó en una GPU NVIDIA T4 (16 GB), por lo que cualquier GPU con al menos esa capacidad es suficiente para cargar los adaptadores y los modelos base. También son adecuadas RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de consumo con 8–16 GB de VRAM, especialmente con la variante de 3B.
- Opciones de despliegue: Transformers con PEFT (cargando el adaptador y el modelo base), vLLM o TGI si se fusionan previamente los adaptadores con el modelo base, y llama.cpp u Ollama si se exporta el modelo fusionado a formato GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas con modelos externos de la misma categoría en la información proporcionada. Sin embargo, la model card incluye una comparativa interna entre los modelos base y los adaptadores, que resulta útil para evaluar el efecto del fine-tuning:

| Modelo | Parametros | Contexto | Recall (Test B) | FPR (Test B) | Recall (Test C) | Pooled accuracy |
|---|---|---|---|---|---|---|
| Base 3B | 3B | 2048 | 0.960 | 0.240 | 0.920 | 0.880 |
| Adaptador 3B | 3B | 2048 | 0.960 | 0.000 | 0.880 | 0.947 |
| Base 7B | 7B | 2048 | 0.920 | 0.000 | 0.560 | 0.827 |
| Adaptador 7B | 7B | 2048 | 1.000 | 0.080 | 0.880 | 0.933 |

Esta comparativa interna muestra que el adaptador de 3B reduce drásticamente la tasa de falsos positivos (de 0.240 a 0.000) y mejora la precisión global, mientras que el adaptador de 7B mejora el recall en Test C y la precisión global, aunque con un ligero aumento de falsos positivos. Una vez afinados, ambos adaptadores presentan un rendimiento estadísticamente indistinguible.

## Limitaciones y advertencias

- Sesgo conocido del dataset: el corpus CEAS-08 se inclina hacia phishing con artefactos técnicos (enlaces, adjuntos), por lo que el modelo sub-detecta ataques de ingeniería social pura como BEC, suplantación de identidad y fraude de facturas. La evaluación inicial mostró que el modelo fallaba por completo en `invoice_fraud` (0/6) e `impersonation` (0/7).
- Riesgo de alucinación: al generar análisis estructurado en JSON, pueden producirse errores de parseo o contenido incorrecto. En la evaluación del autor, los fallos de parseo se contabilizaron como errores, lo que refleja que esta es una limitación real.
- Limitaciones de contexto: la ventana de 2048 tokens es suficiente para correos y hilos moderadamente largos, pero no para documentos extensos o conversaciones muy prolongadas.
- Limitaciones de idioma: no se especifican los idiomas soportados. Dado que el dataset de entrenamiento (CEAS-08) está principalmente en inglés, es probable que el rendimiento en otros idiomas sea inferior o no esté evaluado.
- Restricciones de licencia: la licencia del modelo no está disponible. Además, el corpus Phishing Pot utilizado en la evaluación tiene licencia CC BY-NC 4.0, lo que puede implicar restricciones para uso comercial del modelo si se considera que incorpora datos de ese corpus.
- Advertencia para producción: se trata de un proyecto de portafolio con tamaños de muestra pequeños (n=75) y resultados estadísticamente no concluyentes en la variante de 3B. No debe utilizarse como única capa de seguridad en entornos de producción sin una validación adicional exhaustiva.

## Enlaces

- HuggingFace: [kirilsss/Phishing_analyzer_LoRA](https://huggingface.co/kirilsss/Phishing_analyzer_LoRA)
- GitHub: [Phishing-analyzer-LoRA](https://github.com/kirilssw/Phishing-analyzer-LoRA)
- Dataset CEAS-08: [phishing-email-training-dataset](https://huggingface.co/datasets/nosadaniel/phishing-email-training-dataset)
