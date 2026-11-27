# SIP-med-LLM/SIP-jmed-llm-4-33b-OP-GPTQ-W4A16-G128

## Resumen

SIP-jmed-llm-4-33b-OP-GPTQ-W4A16-G128 es la versión cuantizada a 4 bits del modelo médico japonés SIP-jmed-llm-4-33b-OP, desarrollado por el equipo SIP-jmed-llm del Instituto Nacional de Informática de Japón (NII) en el marco de los programas SIP E-2 y B-6 de investigación en análisis de documentos e imágenes médicas y LLM clínicos. El modelo base parte de la familia LLM-jp-4 con aproximadamente 33.000 millones de parámetros y ha sido sometido a ajuste por instrucciones, optimización de preferencias y aprendizaje por refuerzo.

Esta variante aplica cuantización GPTQ W4A16 con tamaño de grupo 128 sobre todas las capas lineales excepto `lm_head`, reduciendo el peso de unos 62 GB en bf16 a aproximadamente 20 GB. El objetivo es permitir el despliegue en una sola GPU H100 o H200, manteniendo la precisión del modelo original con una pérdida inferior a 0,5 puntos en el benchmark médico JMedQA.

Es relevante ahora porque demuestra que la cuantización agresiva a 4 bits puede preservar el rendimiento en dominios de alta exigencia como el médico, y porque el ecosistema LLM-jp-4 empieza a ofrecer herramientas de inferencia (vLLM con parser de razonamiento) que hacen viable su uso en investigación clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 64 capas, dimensión oculta 5.120, 40 cabezas de atención y 8 cabezas KV (GQA) |
| Parametros totales | 6.158.423.936 (según safetensors del repo cuantizado; el modelo base se describe como ~33B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens de posición máxima; calibración con secuencias de hasta 8.192 tokens |
| Tipos de cuantizacion | GPTQ W4A16, int4 simétrico, grupo 128, `actorder=static`, `dampening_frac=0.01`, `lm_head` sin cuantizar |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (5 archivos, ~20 GB) con formato compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia LLM-jp-4 con 64 capas, dimensión oculta de 5.120, 40 cabezas de atención y 8 cabezas KV (atención con consultas agrupadas), vocabulario de 196.608 tokens y posición máxima de 65.536. El pipeline de entrenamiento del modelo original incluye ajuste por instrucciones, optimización de preferencias y aprendizaje por refuerzo, seguido de una corrección de la autoidentificación del modelo. El formato conversacional es Harmony, con un `chat_template.jinja` que separa el razonamiento (`analysis`) de la respuesta final y acepta parámetros como `knowledge_cutoff` y `reasoning_effort`.

La cuantización se realizó con llm-compressor 0.9.0 (`GPTQModifier`) y compressed-tensors 0.13.0 sobre una NVIDIA H200, usando 512 conversaciones de calibración con la misma distribución de tareas y condiciones que el entrenamiento original (semilla 20261121), con longitudes de hasta 8.192 tokens y un total de 1.316.528 tokens. Se cuantizaron todas las capas `Linear` excepto `lm_head`. El tokenizador (`tokenizer.json`, `llmjp4_tokenizer.py`, `llmjp4_harmony.py`) y la plantilla de chat se mantienen sin cambios respecto al original. Para compatibilidad con compressed-tensors 0.12 se eliminaron del `config.json` dos claves nulas (`scale_dtype`, `zp_dtype`), sin modificar los pesos.

## Capacidades

- Generación de texto y razonamiento clínico en japonés e inglés, con modo de razonamiento explícito (`reasoning_effort` configurable, p. ej. `High`).
- Respuesta a preguntas médicas de opción múltiple y abiertas, evaluado sobre el dataset JMedQA.
- Uso de herramientas (tool calling) mediante el formato Harmony, incluyendo la herramienta de recuperación documental médica `search_medical_rag`.
- Razonamiento multi-paso con separación entre análisis interno y respuesta final.
- Conversación multi-turno con contexto largo (hasta 65.536 tokens de posición).
- Capacidad de invocar herramientas a través de la API compatible con OpenAI de vLLM (aunque en vLLM 0.18 no existe parser específico para LLM-jp-4, por lo que la llamada debe extraerse del texto Harmony generado vía `/v1/completions`).
- Soporte de `knowledge_cutoff` como parámetro de plantilla para contextualizar temporalmente las respuestas.

## Casos de uso

- Investigación clínica asistida: el modelo puede responder preguntas sobre guías de práctica clínica y evidencia médica en japonés, con razonamiento explícito, para apoyar la revisión por parte de profesionales sanitarios en entornos de investigación.
- Recuperación aumentada sobre documentación médica: integrado con `search_medical_rag`, permite construir pipelines de pregunta-respuesta sobre historiales, guías y literatura, aprovechando la ventana de 65.536 tokens para incluir múltiples documentos.
- Evaluación comparativa de modelos médicos: sirve como referencia cuantizada para medir el impacto de la compresión 4-bit frente al modelo bf16 en tareas clínicas (JMedQA), útil en laboratorios que estudian robustez de la cuantización.
- Formación y simulación clínica: generación de casos y preguntas de estudio en japonés para residentes, con control del esfuerzo de razonamiento para ajustar profundidad y latencia.
- Prototipos de triaje documental: clasificación y resumen de informes médicos en japonés en pipelines de investigación, desplegado en una sola GPU H100/H200 con vLLM.
- Extracción estructurada con tool calling: uso del formato Harmony para que el modelo emita llamadas a funciones (por ejemplo, consultas a bases de conocimiento) y procesar la respuesta en sistemas de agentes.
- Despliegue en infraestructura limitada: al ocupar ~20 GB, permite servir el modelo en una única GPU de 80 GB con margen para KV cache y procesamiento por lotes, algo inviable con el original en bf16 (~62 GB).

## Benchmarks y rendimiento

| Métrica (JMedQA) | Modelo original (bf16) | Este modelo (GPTQ W4A16 G128) | Diferencia |
|---|---:|---:|---:|
| Precisión global (3.581 preguntas) | 0,9245 ± 0,0020 | 0,9197 ± 0,0026 | −0,47 pt |
| Subconjunto 2026 (400 preguntas) | 0,9330 ± 0,0093 | 0,9305 ± 0,0085 | −0,25 pt |
| Rango en 10 ejecuciones (global) | 0,9201 – 0,9274 | 0,9162 – 0,9235 | — |
| Tokens de razonamiento (mediana) | 440 | 424 | — |
| Truncamientos por longitud máxima (10 ejecuciones) | 1 | 4 | — |

Condiciones de evaluación: temperatura 1,0, `reasoning_effort` High, 10 ejecuciones con media ± desviación estándar. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~20 GB solo para pesos; con KV cache y lotes moderados, se recomienda al menos 40–48 GB de VRAM para producción.
- GPU recomendadas: NVIDIA H100 (80 GB) o H200 (80 GB) para despliegue con vLLM y `--gpu-memory-utilization 0.90`; también viable en A100 80 GB.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090) por el tamaño de pesos más KV cache; sería necesario un esquema de cuantización más agresivo o descarga a CPU, no documentado en la información disponible.
- Opciones de despliegue: vLLM (soporta compressed-tensors W4A16), con el wrapper `llmjp4_vllm` del repositorio `llm-jp/llm-jp-4-cookbook` para el parser de razonamiento `llmjp4`. Se requiere `--trust-remote-code` por el tokenizador personalizado. La cuantización se detecta automáticamente desde `config.json`.
- Latencia y throughput: no se han publicado datos concretos de latencia o throughput en la información disponible; la evaluación reporta una mediana de 424 tokens de razonamiento por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SIP-jmed-llm-4-33b-OP-GPTQ-W4A16-G128 (este) | ~33B (6,16B en safetensors cuantizado) | 65.536 | Apache-2.0 | Safetensors compressed-tensors 4-bit | Hugging Face, 0 descargas |
| SIP-jmed-llm-4-33b-OP (base) | ~33B | 65.536 | Apache-2.0 | Safetensors bf16 (~62 GB) | Hugging Face |
| LLM-jp-4 (familia base) | ~33B | 65.536 | no disponible en la información | Safetensors | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos médicos en la información proporcionada; la única comparación cuantitativa disponible es frente al modelo base bf16 en JMedQA.

## Limitaciones y advertencias

- Modelo prototipo de investigación: no se ha validado su seguridad ni eficacia en entornos clínicos reales; no se recomienda su uso directo para diagnóstico, decisión terapéutica o consejo sanitario.
- Riesgo de alucinación: el propio autor advierte que el modelo puede equivocarse al describir detalles sobre sí mismo (modelo base, número de parámetros); deben tomarse como referencia las fichas oficiales.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al estar entrenado principalmente con datos japoneses, puede presentar sesgos culturales y lingüísticos.
- Limitaciones de idioma: soporte declarado solo para japonés e inglés; el rendimiento en castellano no está evaluado.
- Restricciones regulatorias: si se usa para desarrollar un producto, este podría considerarse software como dispositivo médico bajo la normativa japonesa (PMDA); se recomienda consultar el canal indicado por el autor.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso clínico directo y no ofrece garantías de ningún tipo.
- Cuantización: la pérdida de precisión es pequeña en JMedQA (<0,5 pt), pero puede amplificarse en tareas fuera de distribución; para usos críticos se recomienda el modelo bf16.
- Tool calling: en vLLM 0.18 no hay parser nativo para LLM-jp-4; es necesario extraer las llamadas del texto Harmony generado, lo que añade complejidad de integración.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SIP-med-LLM/SIP-jmed-llm-4-33b-OP-GPTQ-W4A16-G128
- Modelo base: https://huggingface.co/SIP-med-LLM/SIP-jmed-llm-4-33b-OP
- Dataset JMedQA: https://huggingface.co/datasets/SIP-med-LLM/JMedQA
- Repositorio llm-jp-4-cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- PMDA, consulta sobre software como dispositivo médico: https://www.pmda.go.jp/review-services/f2f-pre/strategies/0011.html
- Contacto: sip-med-llm-contact@nii.ac.jp
