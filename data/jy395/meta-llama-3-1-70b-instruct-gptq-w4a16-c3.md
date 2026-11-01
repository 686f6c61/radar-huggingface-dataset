# jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c3

## Resumen

Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c3 es una versión cuantizada del modelo meta-llama/Meta-Llama-3.1-70B-Instruct, publicada por el usuario jy395. Se trata de una compresión GPTQ de 4 bits en pesos con activaciones en 16 bits (W4A16) y tamaño de grupo 128, generada con la herramienta llm-compressor del ecosistema vLLM. El checkpoint resultante se distribuye en formato compressed-tensors, que vLLM carga de forma nativa.

La particularidad de esta variante no es la cuantización en sí, sino el corpus de calibración: el autor emplea C3-FinMix, un conjunto de 2.042 prompts financieros formateados como tarea (unos 260.000 tokens) construido a partir de los splits de entrenamiento y validación de diez benchmarks del sector financiero, sin usar nunca datos de test. Este checkpoint forma parte de las 30 configuraciones comprimidas publicadas junto al artículo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26), que estudia cuándo la compresión post-entrenamiento de modelos financieros exige datos de calibración alineados con el dominio.

El modelo hereda la arquitectura y capacidades del Llama 3.1 70B Instruct original (transformer denso, contexto de 128.000 tokens, licencia Llama 3.1), pero con un peso mucho menor en disco (39,5 GB en el repositorio) y un objetivo de despliegue en GPUs con memoria limitada. Es relevante para equipos que quieran evaluar el impacto de la calibración específica de dominio en tareas financieras sobre un modelo grande ya instruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), derivado de meta-llama/Meta-Llama-3.1-70B-Instruct |
| Parametros totales | 11.193.820.256 (según safetensors del repo cuantizado); el modelo base declara 70B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base soporta 128.000 tokens) |
| Tipos de cuantizacion | GPTQ W4A16, group size 128, formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del Llama 3.1 70B Instruct, un transformer denso con atención por grupos (GQA) y RoPE, sin modificaciones estructurales respecto al original. La compresión se aplica con llm-compressor mediante GPTQ en configuración W4A16: pesos a 4 bits con tamaño de grupo 128 y activaciones en 16 bits. El protocolo de calibración consume el corpus completo, con `max_seq_length=2048` y semilla 42, y se reproduce con el script `scripts/quantization/gptq_w4a16.py --calib-path data/calibration_datasets/c3_finmix.jsonl` del repositorio del autor.

El corpus de calibración C3-FinMix contiene 2.042 prompts financieros formateados como tarea, aproximadamente 260.000 tokens, extraídos de los splits de entrenamiento y validación de diez benchmarks financieros y nunca de test. No se documentan en la información disponible fases adicionales de RLHF, DPO ni fine-tuning sobre el modelo cuantizado: la intervención se limita a la compresión con calibración de dominio. La innovación metodológica del trabajo es el análisis de cuándo la calibración alineada con el dominio financiero mejora la recuperación de rendimiento tras la compresión, frente a calibraciones genéricas.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del Instruct original.
- Razonamiento y matemáticas de nivel general, sin garantía específica de precisión financiera más allá de la del modelo base.
- Generación de código y soporte de tool calling / function calling según las capacidades del Llama 3.1 Instruct original.
- Capacidades multilingües del modelo base (no se detalla la lista de idiomas en la información disponible).
- Modo instruct con plantilla de chat de Llama 3.1.
- Especialización de despliegue para tareas financieras por el corpus de calibración, no por fine-tuning adicional.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Evaluación de compresión en dominio financiero: usar el checkpoint como referencia para medir la degradación de un Llama 3.1 70B cuantizado con calibración FinMix frente a calibraciones genéricas en los diez benchmarks del artículo.
- Análisis de documentos financieros: resumir informes, memorandos y filings con un modelo de 70B comprimido que cabe en una sola GPU de 48 GB, aprovechando el contexto largo del base.
- Asistencia en research cuantitativo: generar borradores de notas de análisis y explicaciones de métricas financieras, con revisión humana obligatoria por el riesgo de alucinación.
- Despliegue en vLLM para servicio de chat: cargar el checkpoint compressed-tensors directamente en vLLM y servir conversaciones con throughput alto gracias a los pesos de 4 bits.
- Prototipado de pipelines de agentes financieros: integrar el modelo en flujos con tool calling para consultas a bases de datos de mercado y generación de informes.
- Reproducción de experimentos académicos: ejecutar la suite de evaluación del repositorio del autor para replicar los resultados del paper ICAIF '26 sobre calibración de dominio.
- Fine-tuning ligero sobre el checkpoint cuantizado: adaptar el modelo a nichos financieros concretos con QLoRA, partiendo de una base ya comprimida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 39,5 GB en el repositorio; con overhead de activaciones y caché KV se recomienda al menos 48 GB para contexto moderado y más para contextos largos.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para servicio estable; en configuraciones de una sola GPU de 48 GB conviene limitar la longitud de contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con esta cuantización; requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`; no se documenta soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c3 | 70B (11,19B en safetensors del repo) | No disponible (base: 128k) | GPTQ W4A16, group 128 | Llama 3.1 Community | HuggingFace, 22 descargas |
| meta-llama/Meta-Llama-3.1-70B-Instruct | 70B | 128.000 tokens | BF16/FP16 | Llama 3.1 Community | HuggingFace oficial |
| Otras configuraciones del mismo paper (colección ICAIF '26) | 70B | No disponible | Varias (30 configuraciones) | Llama 3.1 Community | Colección en HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación respecto al modelo base; el propio paper estudia la pérdida de rendimiento y su recuperación según la calibración.
- El corpus de calibración es financiero: el comportamiento en dominios ajenos a finanzas puede diferir del Llama 3.1 70B original.
- Riesgo de alucinación inherente al modelo base, especialmente crítico en contextos financieros donde los datos deben verificarse.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable); revisar los términos antes de producción.
- El repositorio tiene un volumen de descargas muy bajo (22) y no consta validación independiente de la comunidad.
- No se documentan idiomas soportados ni evaluación multilingüe específica en la información disponible.
- El número de parámetros reportado por safetensors (11,19B) no coincide con los 70B nominales del modelo base; conviene verificar la integridad del checkpoint antes de desplegarlo.
- No hay soporte documentado para llama.cpp u Ollama, lo que limita opciones de despliegue en entornos sin vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct
- Repositorio del proyecto: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/gptq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Paper (DOI): https://doi.org/10.1145/3858063.3858724
- Llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
