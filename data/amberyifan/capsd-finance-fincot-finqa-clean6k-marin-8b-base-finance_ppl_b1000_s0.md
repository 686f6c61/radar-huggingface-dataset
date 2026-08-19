# AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b1000_s0

## Resumen

El modelo `capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b1000_s0` es un ajuste fino (fine-tune) de `marin-community/marin-8b-base`, un modelo de lenguaje de 8 mil millones de parámetros con arquitectura tipo Llama. Ha sido entrenado por el usuario AmberYifan sobre un conjunto de datos financiero denominado `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_ppl_b1000_s0`, que combina los conjuntos FINCOT y FINQA limpios, con aproximadamente 6000 ejemplos. El objetivo es especializar el modelo base en tareas de comprensión y razonamiento sobre documentos financieros.

Este modelo se presenta como una opción para desarrolladores e investigadores que necesitan un LLM orientado al dominio financiero, aunque la documentación disponible es mínima: la model card es autogenerada y no incluye descripción de capacidades, limitaciones ni resultados de evaluación. El entrenamiento se realizó con una sola época, tasa de aprendizaje de 1e-5 y un tamaño de batch efectivo de 64, lo que sugiere un ajuste ligero sobre el modelo base.

La relevancia actual radica en la creciente demanda de modelos especializados en finanzas que puedan procesar informes, estados financieros y preguntas de análisis cuantitativo. Sin embargo, al carecer de benchmarks publicados y de detalles sobre el dataset de entrenamiento, su utilidad práctica queda pendiente de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama, según tags) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors en fp16; no se indican cuantizaciones GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada no estándar; requiere revisión) |
| Formato de pesos | safetensors (16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura se hereda del modelo base `marin-community/marin-8b-base`, que según los tags es una arquitectura tipo Llama (transformers, text-generation). No se dispone de detalles adicionales sobre el número de capas, cabezas de atención o mecanismos de atención (si es atención clásica o alguna variante lineal). El modelo tiene 8.030 millones de parámetros, lo que lo sitúa en la gama de los 8B, similar a Llama 3 8B o Mistral 7B.

El entrenamiento se realizó mediante ajuste fino completo (full fine-tuning) sobre un dataset financiero mixto que combina FINCOT y FINQA, con 6000 ejemplos limpios. Los hiperparámetros indican un entrenamiento conservador: una sola época, tasa de aprendizaje 1e-5 con scheduler coseno y warmup del 3%, batch total de 64 (con acumulación de gradientes). No se menciona el uso de técnicas de alineación como RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar. No hay información sobre el número total de tokens de entrenamiento ni la composición exacta del dataset (idiomas, dominios, formato de las preguntas).

## Capacidades

No se ha publicado información detallada sobre las capacidades específicas de este modelo. Basándose en el modelo base y en el dataset de entrenamiento, se pueden inferir las siguientes capacidades potenciales, pero no están confirmadas:

- Comprensión de documentos financieros y extracción de información relevante.
- Razonamiento cuantitativo sobre datos numéricos en contextos financieros (tipo FINQA).
- Generación de respuestas a preguntas sobre finanzas, contabilidad y análisis de estados financieros.
- Capacidades generales de generación de texto y conversación heredadas del modelo base (no documentadas).
- No se confirma soporte para tool calling, agentes, ni capacidades multimodales.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos de uso son hipotéticos, basados en la especialización financiera del dataset y en las capacidades típicas de un modelo de 8B:

- Analisis de informes anuales: el modelo podría resumir y extraer metricas clave (ingresos, beneficios, ratios) de informes financieros largos, gracias a su entrenamiento en datos financieros.
- Respuesta a preguntas sobre estados financieros: dado el dataset FINQA, el modelo puede responder preguntas que requieren operaciones aritmeticas sobre cifras de balances y cuentas de resultados.
- Asistente para analistas de inversion: podria generar explicaciones de tendencias financieras o comparar el rendimiento de empresas a partir de datos estructurados.
- Clasificacion de documentos financieros: el modelo podria etiquetar o categorizar noticias, contratos o informes segun su contenido financiero.
- Generacion de resumenes ejecutivos: a partir de largos documentos, producir resumenes concisos orientados a la toma de decisiones.
- Soporte en auditoria: ayudar a identificar inconsistencias o anomalias en datos financieros mediante preguntas y respuestas contextuales.

Es importante senalar que estos usos no estan validados y requieren pruebas adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card muestra una entrada con `results: []`, es decir, sin métricas. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en benchmarks financieros como FinQA o FinBERT. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (16,1 GB), se necesitan al menos 16-20 GB de VRAM para cargar el modelo sin cuantizacion. Con cuantizacion de 8 bits (si se genera) se reduciria a ~8 GB, y con 4 bits a ~4-5 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son suficientes. Para cuantizacion 4-bit, una RTX 3060 (12 GB) o similar podria funcionar.
- Compatibilidad con GPU de consumo: si, con cuantizacion (por ejemplo, mediante bitsandbytes o GPTQ) se puede ejecutar en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierten los pesos a GGUF), Ollama (via conversión) y Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles; dependen del hardware y de la optimizacion. Como referencia, un modelo de 8B en una A100 suele generar entre 20-40 tokens/s con vLLM.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks propios, por lo que no se puede realizar una comparacion cuantitativa. Como referencia estructural, se comparan las caracteristicas generales con otros modelos de 8B:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| capsd-finance (este) | 8,03 B | no disponible | other | Finanzas (fine-tune) |
| Llama 3 8B | 8,03 B | 8K (ampliable a 128K) | Llama 3 Community License | General |
| Mistral 7B | 7,3 B | 32K | Apache 2.0 | General |
| FinGPT (varios) | 7B-13B | variable | MIT (algunos) | Finanzas |

La principal diferencia es que este modelo esta especificamente ajustado para finanzas, pero sin metricas publicadas es imposible saber si supera a las alternativas generalistas en tareas financieras.

## Limitaciones y advertencias

- Falta de documentacion: la model card no describe capacidades, limitaciones ni sesgos. Esto dificulta su uso responsable en produccion.
- Licencia "other": no es una licencia estandar (Apache, MIT, etc.). Es imprescindible revisar los terminos exactos antes de cualquier uso comercial. Podria incluir restricciones de atribucion o uso no comercial.
- Sesgos y alucinaciones: al ser un fine-tune sin alineacion adicional, puede presentar sesgos del modelo base y del dataset financiero. No se ha evaluado su fiabilidad en datos financieros reales.
- Riesgo de errores numericos: en tareas de razonamiento cuantitativo (FINQA), los modelos de lenguaje suelen fallar en calculos complejos; se recomienda verificar manualmente las respuestas.
- Contexto limitado: no se especifica la longitud de contexto; si hereda la del modelo base (probablemente 4K-8K), no es adecuado para documentos financieros muy largos sin truncamiento.
- Sin garantias de rendimiento: al no haber benchmarks, no se puede afirmar que supere a modelos generalistas en tareas financieras.
- Reproducibilidad: el dataset de entrenamiento no esta publicado ni documentado, lo que impide replicar o auditar el proceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b1000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- No se han encontrado papers, repositorios de codigo ni demos adicionales en la informacion disponible.
