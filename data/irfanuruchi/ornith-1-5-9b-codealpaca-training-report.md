# Irfanuruchi/Ornith-1.5-9B-CodeAlpaca-Training-Report

## Resumen

Ornith-1.5-9B-CodeAlpaca-Training-Report es un registro de investigación publicado en Hugging Face por Irfan Uruchi que documenta el ajuste fino mediante QLoRA distribuido en MLX del modelo base ornith-ai/Ornith-1.5-9B sobre el dataset CodeAlpaca-20k. No se trata de un checkpoint de pesos con licencia de redistribución declarada, sino de un informe reproducible de entrenamiento y evaluación que incluye los artefactos de medición (METHODS.md, EVALUATION.md, benchmark-summary.json/csv) y los resultados de cinco exportaciones MLX cuantizadas y dos exportaciones GGUF evaluadas sobre un conjunto fijo de 30 tareas de Python con 121 aserciones.

El experimento se ejecutó sobre dos nodos Apple Silicon conectados por Thunderbolt Bridge: un Mac mini M6 (rank 0) y un MacBook Pro M3 Pro (rank 1). Se entrenó un adaptador de bajo rango durante 1.200 pasos sobre 3.600 pares instrucción-respuesta extraídos de CodeAlpaca-20k, con particiones de 3.600/200/200 (entrenamiento/validación/test) verificadas por SHA-256 contra el fichero público servido el 2026-11-21.

La relevancia del registro es metodológica: cuantifica el impacto de la cuantización (MLX de 3 a 8 bits y GGUF Q4_K_M/Q6_K) sobre la corrección funcional y el tipado estático en generación de código, y documenta de forma explícita las discrepancias de licencia entre los artefactos upstream (CC BY 4.0 en la dataset card, CC BY-NC 4.0 en el DATA_LICENSE original de CodeAlpaca y MIT en el modelo Ornith). El modelo base tiene 9B parámetros según su denominación, aunque no se dispone de ficha técnica detallada del mismo en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ornith-ai/Ornith-1.5-9B; el informe no detalla la arquitectura) |
| Parametros totales | 9B (según denominación del modelo base; no verificado en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 3-bit, 4-bit, 5-bit, 6-bit, 8-bit; GGUF Q4_K_M, Q6_K |
| Idiomas soportados | en |
| Licencia | no disponible (el modelo base declara MIT; el dataset CodeAlpaca tiene declaraciones contradictorias CC BY 4.0 / CC BY-NC 4.0; el autor no afirma licencia downstream para los pesos) |
| Formato de pesos | safetensors/MLX y GGUF (exportaciones evaluadas); el repositorio es un informe, no un checkpoint distribuido |

## Arquitectura y entrenamiento

El informe no describe la arquitectura interna del modelo base Ornith-1.5-9B. El procedimiento aplicado es QLoRA (adaptador de bajo rango sobre pesos cuantizados) en MLX distribuido sobre dos nodos Apple Silicon con comunicación por Thunderbolt Bridge, alcanzando 1.200 pasos de entrenamiento. El adaptador se fusionó posteriormente con el checkpoint base para producir el modelo de referencia "base-plus-adapter".

Los datos de entrenamiento provienen de sahil2801/CodeAlpaca-20k: 20.022 registros originales de los que se seleccionaron 4.000 pares instrucción-respuesta, divididos en 3.600 de entrenamiento, 200 de validación y 200 de test. El autor verificó la identidad del fichero fuente por tamaño (8.057.896 bytes) y SHA-256 (`58d136bb7ea8e4b7c5b6ef08831da905d0abfafeb56f8fa519083089dd6a210e`) contra la versión pública del 2026-11-21, y confirmó ausencia de solapamiento entre splits y de JSON malformado. No se documentan fases de RLHF o DPO, ni se especifica el número total de tokens vistos. El script de generación de particiones y la semilla aleatoria no se recuperaron, lo que limita la reproducibilidad exacta.

## Capacidades

- Generación de código Python a partir de instrucciones en lenguaje natural, evaluada sobre 30 tareas con 121 aserciones.
- Ajuste específico para instrucciones de tipo CodeAlpaca (explicación, edición y generación de código).
- Producción de código con tipado estático completo (anotaciones de tipos) en un subconjunto de las tareas evaluadas; el modelo fusionado alcanzó 14/30 tareas totalmente tipadas en la exportación MLX 4-bit.
- Ejecución local en hardware Apple Silicon mediante MLX y en ecosistemas GGUF (llama.cpp y compatibles).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación de impacto de cuantización en código: usar el conjunto fijo de 30 tareas y 121 aserciones como banco de pruebas para medir la degradación funcional al pasar de MLX 8-bit a 4-bit o GGUF Q4_K_M en modelos de 9B, replicando la metodología del informe.
- Generación de código Python en local sobre Mac: desplegar la exportación MLX 4-bit (la de mejor resultado, 29/30 tareas y 120/121 aserciones, con 116,3 s de tiempo total de generación) en un Mac mini o MacBook con Apple Silicon para asistencia de código sin conexión.
- Investigación en ajuste fino distribuido en Apple Silicon: reutilizar la topología de dos nodos vía Thunderbolt Bridge y el flujo QLoRA en MLX como referencia para experimentos de adaptadores de bajo rango en hardware de consumo.
- Auditoría de licencias en datasets de código: emplear la comparación documentada entre CC BY 4.0 (dataset card), CC BY-NC 4.0 (DATA_LICENSE original) y MIT (modelo base) como caso de estudio sobre trazabilidad de derechos en pipelines de ajuste fino.
- Validación de tipado estático en código generado: medir la proporción de salidas totalmente tipadas (14/30 en MLX 4-bit frente a 1/30 en GGUF Q4_K_M y Q6_K) para decidir el formato de exportación en flujos que exijan mypy o pyright estricto.
- Reproducción de benchmarks con verificación criptográfica: usar los SHA-256 de particiones y del benchmark para auditar la integridad de particiones de entrenamiento en proyectos de investigación reproducibles.
- Detección de regresiones por cuantización agresiva: incorporar la exportación MLX 3-bit (2/30 tareas, 16/121 aserciones) como caso negativo documentado al definir umbrales mínimos de cuantización en producción.

## Benchmarks y rendimiento

Resultados del informe sobre el conjunto fijo de 30 tareas de Python (121 aserciones):

| Exportación | Tareas | Aserciones | Totalmente tipadas | Tiempo de generación |
|---|---:|---:|---:|---:|
| Base original (referencia) | 23/30 | 99/121 | no disponible | no disponible |
| Base + adaptador (referencia) | 30/30 | 121/121 | no disponible | no disponible |
| MLX 4-bit | 29/30 | 120/121 | 14/30 | 116,3 s |
| GGUF Q4_K_M | 29/30 | 119/121 | 1/30 | 136,7 s |
| GGUF Q6_K | 29/30 | 118/121 | 1/30 | 152,5 s |
| MLX 6-bit | 28/30 | 119/121 | 3/30 | 159,5 s |
| MLX 8-bit | 28/30 | 117/121 | 3/30 | 196,2 s |
| MLX 5-bit | 25/30 | 113/121 | 2/30 | 133,3 s |
| MLX 3-bit | 2/30 | 16/121 | 0/30 | 204,2 s |

Notas del autor: las cifras GGUF incluyen una repuntuación separada con preservación de imports sobre generaciones guardadas, no generaciones nuevas. MLX 3-bit presenta una regresión severa y no se recomienda para uso en código. El autor advierte que los resultados reflejan un benchmark fijo pequeño y no establecen rankings generales de modelos. No se publican MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 9B, las exportaciones MLX 4-bit y GGUF Q4_K_M requieren aproximadamente 5-6 GB de memoria unificada o VRAM, y las de 8 bits en torno a 9-10 GB (estimación orientativa, no confirmada en el informe).
- GPU recomendadas: el experimento se ejecutó íntegramente en Apple Silicon (Mac mini M6 y MacBook Pro M3 Pro); no se reportan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: el formato MLX está diseñado para memoria unificada de Apple Silicon; las exportaciones GGUF son compatibles con llama.cpp en GPUs de consumo, aunque el informe no aporta mediciones en esas plataformas.
- Opciones de despliegue: MLX (formatos nativos del experimento) y llama.cpp o derivados para GGUF; no se documentan pruebas con vLLM, TGI ni Ollama.
- Latencia y throughput: el informe solo aporta tiempos totales de generación sobre las 30 tareas (de 116,3 s en MLX 4-bit a 204,2 s en MLX 3-bit), sin desglose por token ni métricas de throughput.

## Comparativa con modelos similares

No disponible. El informe no incluye comparaciones con otros modelos de la misma categoría (por ejemplo, otros modelos de código de 7-9B); únicamente compara el modelo base original (23/30 tareas, 99/121 aserciones) con la versión ajustada (30/30, 121/121) y entre formatos de cuantización del mismo modelo.

## Limitaciones y advertencias

- El repositorio es un informe de investigación, no un checkpoint distribuido: no contiene pesos con licencia de redistribución declarada.
- El benchmark es pequeño y fijo (30 tareas, 121 aserciones) y el propio autor advierte que no permite establecer rankings generales.
- MLX 3-bit sufre una regresión severa (2/30 tareas, 16/121 aserciones) y no debe usarse para código.
- El tipado estático completo cae drásticamente en GGUF (1/30) frente a MLX 4-bit (14/30), lo que puede romper flujos con verificación de tipos estricta.
- Las cifras GGUF provienen de una repuntuación con preservación de imports sobre generaciones guardadas, no de generaciones nuevas, lo que limita la comparabilidad directa.
- El script de generación de particiones y la semilla aleatoria no se recuperaron; la reproducibilidad exacta del split no está garantizada.
- Discrepancia de licencias en los artefactos upstream: CC BY 4.0 en la dataset card de CodeAlpaca, CC BY-NC 4.0 en el DATA_LICENSE original y MIT en el modelo Ornith; el autor no afirma licencia downstream para los pesos ajustados, por lo que el uso comercial queda sin determinar.
- Idioma limitado al inglés según la etiqueta del repositorio.
- No se documentan evaluaciones de sesgo, alucinación ni robustez fuera del conjunto de tareas de Python.
- El proyecto CodeAlpaca original retuvo sus pesos derivados de LLaMA por los términos de OpenAI y la licencia LLaMA; el autor aclara que esa decisión histórica no determina los derechos de este experimento basado en Ornith.

## Enlaces

- Repositorio del informe en Hugging Face: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-CodeAlpaca-Training-Report
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Proyecto CodeAlpaca (GitHub): https://github.com/sahil280114/codealpaca
- DATA_LICENSE original de CodeAlpaca: https://github.com/sahil280114/codealpaca/blob/master/DATA_LICENSE
