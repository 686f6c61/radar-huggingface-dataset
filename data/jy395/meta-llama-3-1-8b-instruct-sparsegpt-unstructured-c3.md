# jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c3

## Resumen

Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c3 es un checkpoint comprimido del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicado por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones de compresion que acompanan al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26). El modelo aplica una poda no estructurada del 50% mediante SparseGPT, con los pesos almacenados en formato denso, calibrada sobre el corpus C3 (FinMix) de prompts financieros.

El modelo no introduce arquitectura nueva: hereda el transformer decoder-only de Llama 3.1 con 8.030.261.248 parametros y 8.192 tokens de contexto. Su interes es experimental: sirve para estudiar como la eleccion del corpus de calibracion (datos financieros frente a genericos) afecta a la degradacion de un LLM tras la compresion post-entrenamiento. Es, por tanto, una pieza de investigacion reproducible mas que un modelo listo para produccion general.

La relevancia actual radica en que la compresion post-entrenamiento es una via practica para reducir costes de inferencia de LLMs en dominios especializados como finanzas, y este checkpoint permite comparar directamente el efecto de la calibracion con datos del dominio frente a alternativas calibradas con corpus genericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos podados al 50% de forma no estructurada y almacenados en denso |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3.1 8B; el protocolo de calibracion uso max_seq_length=2048) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors con formato compressed-tensors; no se documentan variantes GGUF ni cuantizaciones adicionales) |
| Idiomas soportados | no disponible en la model card (heredados de Llama 3.1: ingles principalmente, con soporte multilingue limitado) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors con formato compressed-tensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Meta con datos multilingues y ajustado por instrucciones y preferencias (RLHF/DPO). Sobre ese checkpoint, este modelo aplica una poda no estructurada del 50% de los pesos mediante SparseGPT, implementada a traves de llm-compressor (vllm-project/llm-compressor). Los pesos resultantes se almacenan en formato denso, por lo que el ahorro de memoria no es directo en VRAM: la ventaja practica depende de kernels que exploten la esparsidad o de una cuantizacion posterior.

La calibracion se realizo sobre C3 (FinMix), un corpus de 2.042 prompts financieros formateados como tareas, con aproximadamente 260.000 tokens, construido a partir de los splits de entrenamiento y validacion de diez benchmarks financieros (nunca de test). El protocolo consumio el corpus completo con max_seq_length=2048 y semilla 42. El script de produccion es scripts/quantization/sparsegpt_unstructured.py del repositorio JunyiYe/finance-ptc-calibration. No se documentan en la informacion disponible datos sobre reentrenamiento adicional, destilacion ni ajuste fino posterior a la poda.

## Capacidades

- Generacion de texto conversacional en ingles (heredada de Llama 3.1 8B Instruct).
- Razonamiento de proposito general y respuesta a instrucciones, con degradacion esperable por la poda del 50%.
- Generacion de codigo basica, heredada del modelo base.
- Capacidades matematicas de nivel medio, heredadas del modelo base.
- Soporte de tool calling y function calling segun el formato de Llama 3.1 (no verificado especificamente tras la poda).
- Razonamiento multi-paso y uso como agente, sujeto a la perdida de calidad por la compresion.
- Capacidades multilingues limitadas, heredadas de Llama 3.1 (no se documenta evaluacion tras la poda).
- Especializacion funcional: checkpoint de investigacion para evaluar el impacto de la calibracion con datos financieros en la compresion.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre compresion post-entrenamiento: usar este checkpoint como referencia de poda SparseGPT 50% calibrada con datos financieros y compararla con las otras 29 configuraciones del mismo conjunto para medir la degradacion por tarea.
- Evaluacion de calibracion con datos de dominio: reproducir la suite de diez tareas financieras del repositorio para cuantificar si la calibracion con C3 (FinMix) reduce la perdida frente a calibracion generica.
- Analisis de sensibilidad a la poda: comparar este modelo con el Llama 3.1 8B Instruct original en tareas de extraccion de entidades financieras, clasificacion de sentimiento de noticias y respuesta a preguntas sobre informes.
- Prototipado de bajo coste en finanzas: desplegar el modelo en vLLM para experimentos internos de generacion de resumenes de documentos financieros, asumiendo menor calidad que el modelo base.
- Estudio de metodos de compresion: emplear el checkpoint como linea base para probar tecnicas de recuperacion (fine-tuning ligero, destilacion) tras la poda.
- Docencia y reproducibilidad: utilizar el script y el corpus publicados para ensenar el flujo completo de compresion con llm-compressor y compressed-tensors.
- Benchmarking de infraestructura: medir latencia y throughput en vLLM de un modelo podado almacenado en denso frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio (diez tareas financieras) y al articulo ICAIF '26, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de las tareas financieras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se almacenan en denso en safetensors (repo de 32,1 GB, lo que sugiere pesos en BF16/FP16). En BF16 se requieren aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 18-20 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue con contexto largo y concurrencia; L40S 48 GB como alternativa.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto limitado; una RTX 3090 (24 GB) es ajustada. Para contexto completo de 8.192 tokens conviene cuantizar o reducir el lote.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors segun la model card), transformers con device_map="auto". No se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al almacenarse los pesos en denso, no cabe esperar aceleracion por esparsidad salvo que se apliquen kernels especificos no documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c3 (este) | 8,03 B | 8.192 | Poda no estructurada 50%, calibrada en C3 (FinMix) | Llama 3.1 Community | Hugging Face (jy395) |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Ninguna | Llama 3.1 Community | Hugging Face (oficial) |
| Otras configuraciones del conjunto ICAIF '26 (jy395) | 8,03 B | 8.192 | Distintos metodos y corpus de calibracion | Llama 3.1 Community | Hugging Face (coleccion jy395) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparacion con el modelo base debe hacerse con la suite de evaluacion del repositorio, no con cifras publicadas aqui.

## Limitaciones y advertencias

- La poda no estructurada del 50% degrada la calidad respecto al modelo base; el grado de degradacion no se cuantifica en la informacion disponible.
- Los pesos se almacenan en denso: no hay reduccion de memoria ni de coste de inferencia directa sin kernels de esparsidad o cuantizacion adicional.
- La calibracion esta sesgada al dominio financiero (C3/FinMix); el comportamiento en otros dominios puede ser peor que el de una calibracion generica.
- Riesgo de alucinacion heredado de Llama 3.1 y potencialmente agravado por la compresion.
- Idiomas soportados no documentados; se espera un rendimiento predominantemente en ingles.
- Uso comercial sujeto a la Llama 3.1 Community License, que impone restricciones (por ejemplo, denominacion "Built with Llama" y limites de usuarios mensuales para determinados despliegues).
- Modelo de investigacion: no se documentan evaluaciones de seguridad, sesgo ni robustez tras la poda.
- Fecha de creacion del repositorio (2026-10-31) y escasa traccion (295 descargas, 0 likes): no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio de codigo y evaluacion: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/sparsegpt_unstructured.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Articulo (DOI): https://doi.org/10.1145/3858063.3858724
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
