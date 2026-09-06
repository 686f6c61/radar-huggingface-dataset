# fotapol/qwen3-1.7b-financial-rag-lora-v3

## Resumen

El modelo `fotapol/qwen3-1.7b-financial-rag-lora-v3` es un adaptador LoRA (PEFT) desarrollado por el usuario `fotapol` sobre el modelo base `Qwen/Qwen3-1.7B`. Su propósito es mejorar la respuesta a preguntas sobre documentos financieros en sistemas de generación aumentada por recuperación (RAG). El adaptador está pensado para cargarse sobre una revisión fijada del modelo base (`70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) y se entrena con QLoRA de 4 bits.

La versión v3 aborda problemas comunes en RAG financiero: preservar unidades (moneda, escala, porcentaje), citar el contexto recuperado con etiquetas `[Source N]`, mostrar trazas de cálculo normalizadas, rechazar explícitamente cuando el contexto es insuficiente y tratar el texto recuperado como datos en lugar de instrucciones. El adaptador se entrenó con 11.674 registros derivados de FinQA y DocFinQA, convertidos en conversaciones RAG con contextos congelados de BM25 más RRF denso, y una división a nivel de informe para evitar fugas entre conjuntos de entrenamiento, validación y prueba.

Se trata de un proyecto experimental, pensado para demostraciones, aprendizaje y prototipos. No está diseñado para decisiones financieras, de inversión, legales, fiscales o contables autónomas. La documentación incluye métricas de validación específicas del proyecto, pero no se han publicado benchmarks públicos ni se ha evaluado el conjunto de test reservado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen/Qwen3-1.7B) + adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen/Qwen3-1.7B tiene 1.7B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (limite de secuencia durante el entrenamiento del adaptador) |
| Tipos de cuantizacion | 4-bit NF4 (QLoRA) para entrenamiento; inferencia con `dtype="auto"` segun el ejemplo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre `Qwen/Qwen3-1.7B`, un transformer causal de 1.7B parametros. El adaptador se entrena con QLoRA de 4 bits en formato NF4, con rango LoRA 16, alpha 32 y dropout 0.05. Los modulos objetivo son las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El entrenamiento se realizo durante 1 epoca, con 1.460 pasos de optimizador, un batch efectivo de 8 y una longitud maxima de secuencia de 4.096 tokens. El modo de pensamiento (thinking) se deshabilito durante el entrenamiento y la perdida se calculo solo sobre los tokens de asistente.

Los datos de entrenamiento se derivaron de los conjuntos FinQA y DocFinQA, transformados en conversaciones RAG con contexto recuperado mediante BM25 y denso con RRF congelado. Cada ejemplo incluye etiquetas de fuente, unidades, calculos visibles y rechazos sinteticos por contexto insuficiente. La division a nivel de informe garantiza que los documentos no se crucen entre entrenamiento, validacion y prueba. El adaptador se publica separado de los pesos del modelo base, y el codigo de ejemplo indica que se debe cargar en la revision fijada del modelo base para reproducir la configuracion de evaluacion.

## Capacidades

- Respuesta a preguntas sobre documentos financieros en ingles, basada exclusivamente en el contexto recuperado.
- Preservacion de unidades (moneda, escala, porcentaje) en las respuestas.
- Citacion del contexto con etiquetas como `[Source 1]`, indicando la fuente de cada dato.
- Generacion de trazas de calculo normalizadas para preguntas de razonamiento aritmetico.
- Rechazo explicito con la frase exacta `I cannot answer this question from the supplied context.` cuando el contexto es insuficiente.
- Tratamiento del texto recuperado como datos, no como instrucciones, lo que reduce el riesgo de inyeccion de prompts.
- Integracion en sistemas RAG con hasta cinco chunks de documentos financieros etiquetados.
- No soporta tool calling, function calling, agentes, vision ni audio, segun la informacion disponible.
- El modo de pensamiento (thinking) esta deshabilitado en el adaptador.

## Casos de uso

- Asistente de analisis de informes financieros: el adaptador se integra en un pipeline RAG que recupera chunks de informes anuales y responde a preguntas sobre ingresos, margenes o variaciones, citando las fuentes y preservando las unidades.
- Extraccion de cifras para auditoria: permite localizar valores como ingresos, gastos o porcentajes en documentos largos y presentarlos junto a su etiqueta de fuente, aunque las cifras deben verificarse manualmente.
- Soporte a analistas de inversion: puede responder preguntas sobre estados financieros y mostrar la estructura del calculo, pero no es apto para recomendaciones de inversion autonomas.
- Validacion de sistemas RAG: al estar disenado especificamente para RAG financiero, puede usarse como referencia para evaluar la calidad de respuestas con contexto en prototipos.
- Documentacion regulatoria y de cumplimiento: ayuda a localizar informacion en documentos normativos, aunque no debe emplearse para decisiones legales, fiscales o contables autonomas.
- Educacion y prototipos: sirve como ejemplo practico de como afinar un modelo pequeno con LoRA para tareas de preguntas y respuestas sobre documentos financieros.
- Automatizacion de reportes internos: genera resumenes de documentos financieros con citas, facilitando la revision rapida de grandes volumenes de informacion.
- Busqueda semantica financiera: combinado con un indexador y un recuperador, puede responder preguntas sobre documentos corporativos manteniendo las unidades y las referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks publicos en la informacion disponible. La documentacion incluye metricas de validacion especificas del proyecto, obtenidas sobre un conjunto de validacion de 1.493 ejemplos con prompts congelados, el modelo base fijado y el adaptador v3. Se utilizo decodificacion codiciosa, modo de pensamiento deshabilitado, limite de entrada de 4.096 tokens y limite de salida de 128 tokens.

| Metrica | Modelo base | Adaptador v3 | Diferencia |
|---|---|---:|---:|
| Precisión general | 16.28% | 30.48% | +14.20 pp |
| Precisión del valor final | 3.19% | 23.70% | +20.50 pp |
| Precisión de unidades | 16.19% | 89.18% | +72.99 pp |
| Completitud de citas | 5.80% | 75.80% | +70.00 pp |
| Precisión del formato de calculo | 0.00% | 93.29% | +93.29 pp |
| Precisión de rechazo no soportado | 79.87% | 70.96% | -8.91 pp |
| Tasa de rechazo falso | 59.50% | 6.55% | -52.94 pp |
| Tasa de citas invalidas | 0.00% | 0.00% | 0.00 pp |

Estas metricas corresponden a la validacion interna del proyecto y no deben interpretarse como resultados de benchmarks publicos. El conjunto de test reservado (1.475 registros) no fue evaluado en esta version MVP.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion. El adaptador es un LoRA de tamano reducido, pero el modelo base Qwen/Qwen3-1.7B requiere memoria. El ejemplo de carga usa `device_map="auto"` y `dtype="auto"`, por lo que la inferencia puede ejecutarse en cualquier dispositivo compatible.
- GPU recomendadas: no disponible. No se indican modelos de GPU especificos en la informacion.
- Capacidad en GPU de consumo: no confirmada. Dado que el modelo base tiene 1.7B parametros, es probable que quepa en una GPU de consumo con 6-8 GB de VRAM, especialmente en 4-bit, pero no se proporcionan cifras oficiales.
- Opciones de despliegue: Transformers + PEFT, segun el codigo de ejemplo. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | Transformer causal | 1.7B | No disponible | Apache 2.0 | Modelo general, sin adaptacion RAG financiera |
| fotapol/qwen3-1.7b-financial-rag-lora-v3 | Adaptador LoRA sobre Qwen3-1.7B | No disponible | 4.096 tokens (limite de entrenamiento) | Apache 2.0 | Especializado en RAG financiero, mejora unidades, citas y calculos |
| fotapol/qwen3-1.7b-financial-qa-lora | Adaptador LoRA sobre Qwen3-1.7B | No disponible | No disponible | Apache 2.0 | Adaptador anterior del mismo autor, sin datos de rendimiento publicados |

## Limitaciones y advertencias

- El adaptador no es un calculador fiable. A menudo genera una estructura de calculo razonable, pero el resultado aritmetico final puede ser incorrecto.
- La precision del valor final es del 23.70%; las cifras importantes deben verificarse contra el documento citado.
- No es apto para decisiones financieras, de inversion, legales, fiscales o contables autonomas.
- Solo soporta ingles (`en`).
- Las metricas de validacion son especificas del proyecto y no representan benchmarks publicos. El conjunto de test no se evaluo.
- La tasa de rechazo falso es del 6.55%, lo que significa que en algunos casos el modelo responde cuando no deberia. La precision de rechazo de contexto insuficiente es del 70.96%, inferior a la del modelo base.
- El adaptador requiere cargarse sobre una revision fijada del modelo base (`70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). El uso de otra revision puede alterar el comportamiento.
- El modo de pensamiento esta deshabilitado; no se recomienda activarlo, ya que el entrenamiento se realizo sin el.
- El tamano del repositorio es de 0.0 GB, lo que refleja que el adaptador es muy pequeno, pero es necesario descargar el modelo base de 1.7B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fotapol/qwen3-1.7b-financial-rag-lora-v3
- Adaptador relacionado del mismo autor: https://huggingface.co/fotapol/qwen3-1.7b-financial-qa-lora
