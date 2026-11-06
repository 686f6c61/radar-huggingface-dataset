# rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_1234

## Resumen

`rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_1234` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/deepseek-llm-7b-chat`, publicado por el usuario rghosh8 en Hugging Face. Se trata de un artefacto de investigación orientado a experimentos de fine-tuning sobre el dataset GSM8K (problemas matemáticos de nivel escolar) con la semilla 1234, tal como indica su nombre. No es un modelo de propósito general ni un lanzamiento oficial de DeepSeek, sino una checkpoint derivada de un baseline experimental.

El modelo conserva la arquitectura y el tamaño del modelo base: un transformer decoder-only de aproximadamente 6.910 millones de parámetros (6,91B), con pesos en formato safetensors y un repositorio de 13,8 GB. El entrenamiento se realizó con la librería TRL (versión 1.15.0) sobre Transformers 5.17.0 y PyTorch 2.13.0, lo que lo convierte en un ejemplo reproducible de pipeline SFT moderno.

Su relevancia es limitada fuera del contexto de investigación: cuenta con 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y su model card es prácticamente la plantilla autogenerada por TRL. Resulta útil como referencia para quienes estudien el efecto del SFT sobre GSM8K en modelos de 7B, pero no debería considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de deepseek-llm-7b-chat) |
| Parametros totales | 6.910.365.696 (6,91B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `deepseek-ai/deepseek-llm-7b-chat`, un transformer decoder-only de 6,91B parámetros. La model card no detalla la composición del dataset de preentrenamiento original ni innovaciones arquitectónicas específicas (atención, positional encoding, etc.), por lo que esos datos deben consultarse en la ficha del modelo base.

El ajuste fino se realizó mediante SFT con TRL 1.15.0 sobre el dataset GSM8K, con semilla 1234, según se deduce del identificador del repositorio. El nombre del checkpoint (`SFT_baseline_gsm8k_seed1234`) sugiere que forma parte de una comparativa de baselines de fine-tuning. No se documentan hiperparámetros, número de épocas, tamaño efectivo de batch, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se especifica la plantilla de conversación utilizada durante el SFT, aunque el pipeline declarado es `text-generation` con formato conversacional.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base chat.
- Razonamiento matemático elemental, presumiblemente reforzado por el ajuste sobre GSM8K (no se aportan métricas que lo confirmen).
- Soporte de tool calling / function calling: no documentado en esta checkpoint; debe verificarse en el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre SFT en matemáticas: reproducción de baselines de fine-tuning sobre GSM8K para comparar con otras configuraciones (semillas, datasets, hiperparámetros). El modelo es adecuado porque su nombre y pipeline documentan el origen experimental.
- Evaluación de la degradación por sobreajuste: al ser un SFT sobre un dataset acotado (GSM8K), permite estudiar la pérdida de capacidades generales del modelo base y el olvido catastrófico.
- Punto de partida para experimentos de RLHF/DPO: la checkpoint puede servir como política inicial en pipelines de alineamiento posteriores.
- Generación de soluciones paso a paso en problemas aritméticos de nivel escolar, como demostración técnica en entornos de investigación.
- Docencia y formación: ejemplo práctico de cómo TRL genera repositorios con `generated_from_trainer` y cómo se estructura una model card automática.
- Pruebas de integración con `text-generation-inference` y endpoints compatibles, dado que el repositorio incluye el tag `endpoints_compatible`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-20 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos, 10-12 GB en total.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, 6-8 GB en total (requiere convertir los safetensors a GGUF o usar bitsandbytes, ya que no se publican variantes cuantizadas).
- GPU recomendadas: A100 40GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB si se cuantiza a 4/8 bits.
- Opciones de despliegue: transformers con `device_map="auto"`, text-generation-inference (tag `text-generation-inference`), vLLM (compatible con safetensors de arquitectura Llama), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_1234 | 6,91B | no disponible | no disponible | Hugging Face, 0 descargas |
| deepseek-ai/deepseek-llm-7b-chat (base) | 6,91B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo oficial |
| Mistral-7B-Instruct | 7,24B | 32k (v0.2) | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Llama-3-8B-Instruct | 8,03B | 8k | Llama 3 Community License | Hugging Face, muy extendido |

La comparación con Mistral y Llama 3 es orientativa por tamaño; no se dispone de datos de rendimiento de esta checkpoint que permitan una comparación cuantitativa. Frente al modelo base, la única diferencia documentada es el SFT sobre GSM8K.

## Limitaciones y advertencias

- Licencia no especificada: la model card incluye un campo `licence: license` sin contenido, lo que impide determinar si el uso comercial está permitido. No debe usarse en producción sin aclarar la licencia con el autor y verificar la del modelo base.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; probablemente herede los del base, pero no está documentado.
- Riesgo de sobreajuste a GSM8K: al ser un SFT sobre un dataset específico, puede degradar capacidades generales y de conversación respecto al base.
- Riesgo de alucinación: no evaluado; sin benchmarks ni evaluaciones publicadas.
- Sesgos: no documentados; se heredan los del preentrenamiento del base, no auditados en esta checkpoint.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-11-01), sin issues ni discusión.
- Model card autogenerada por TRL: contiene placeholders (`model="None"`, secciones vacías) que indican ausencia de documentación manual.
- No apto para producción sin evaluación previa: no hay métricas, ni tests, ni garantías de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_1234
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Dataset GSM8K: no disponible enlace directo en la informacion proporcionada
