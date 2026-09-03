# RoseG/MiniMiP

## Resumen

RoseG/MiniMiP es un modelo de lenguaje de 11.766 millones de parámetros desarrollado por TRiADiC Intelligence Labs, presentado como un ajuste fino (fine-tune) del modelo base google/gemma-3-12b-pt de Google. Según la model card, está orientado a investigación especializada en alineación (alignment research), aunque no se proporcionan detalles adicionales sobre el proceso de entrenamiento ni los datos utilizados. El modelo se distribuye en formato safetensors y está disponible en Hugging Face bajo licencia Gemma.

La relevancia de este modelo radica en su origen: al partir de Gemma 3 12B, hereda la arquitectura transformer moderna de Google con atención local y global, y una ventana de contexto amplia (128k tokens en la versión base). Sin embargo, la documentación pública es extremadamente escasa, lo que limita su uso en producción sin una evaluación adicional. A pesar de ello, su tamaño (12B) lo sitúa en un rango accesible para GPUs de consumo con cuantización, y su licencia Gemma permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 3 12B) |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 12B: 128k tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (se espera compatibilidad con GGUF, AWQ, GPTQ, pero no documentado) |
| Idiomas soportados | no disponible (el base "pt" sugiere portugués, pero no confirmado) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 12B, un transformer decoder-only con atención local (ventana de 1024 tokens) y atención global cada 5 capas, además de un tokenizador con vocabulario de 256k tokens. Gemma 3 incorpora técnicas como RMSNorm, QK-norm y activación GeGLU. Al ser un fine-tune, MiniMiP conserva esta arquitectura, pero no se ha publicado información sobre el proceso de ajuste: ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card solo menciona que está "purposed for specialized alignment research", lo que sugiere un enfoque en alineación, pero sin detalles técnicos verificables.

## Capacidades

- Generación de texto y conversación: al ser un fine-tune de Gemma 3, debería mantener las capacidades de generación de texto del modelo base, aunque no hay evidencia empírica publicada.
- Razonamiento y comprensión: se espera que herede las habilidades de razonamiento de Gemma 3 12B, pero no hay benchmarks específicos para MiniMiP.
- Soporte de tool calling / function calling: no documentado; Gemma 3 12B sí lo soporta, pero no se confirma en este fine-tune.
- Capacidades multilingües: el sufijo "pt" en el base sugiere entrenamiento adicional en portugués, pero no se especifican idiomas soportados.
- Capacidades especiales: no se documenta ningún modo especial (thinking, visión, audio, etc.). El pipeline es solo text-generation.

## Casos de uso

- Investigación en alineación de modelos: dado el propósito declarado, puede usarse para experimentos de alineación, como evaluación de preferencias o entrenamiento con RLHF, aunque requiere validación previa.
- Prototipado de asistentes conversacionales: su tamaño moderado permite desplegarlo en entornos de desarrollo para probar interacciones multi-turno, siempre que se verifique su comportamiento.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para tareas específicas (por ejemplo, dominio en portugués si se confirma).
- Evaluación comparativa de fine-tunes: útil para estudiar cómo el ajuste afecta al rendimiento frente al base Gemma 3 12B.
- Despliegue en entornos con recursos limitados: con cuantización a 4 bits, podría ejecutarse en GPUs de 16 GB VRAM, aunque no hay guías oficiales.
- Generación de texto en portugués (potencial): si el base "pt" implica dominio en portugués, podría usarse para tareas de generación en ese idioma, pero requiere verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para RoseG/MiniMiP. Se recomienda evaluar el modelo de forma independiente antes de cualquier uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11.766 M parámetros, en FP16 se necesitan ~23.5 GB de VRAM. Con cuantización INT8 ~12 GB, INT4 ~6 GB (estimaciones teóricas, no confirmadas).
- GPU recomendadas: para FP16, una A100 40GB o RTX 4090 24GB (con margen). Para INT4, una RTX 3060 12GB o superior.
- Compatibilidad con consumer GPU: sí, con cuantización (p.ej., GGUF Q4_K_M) en GPUs de 8-12 GB VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (el modelo es compatible con text-generation-inference según los tags). FriendliAI ofrece un endpoint de inferencia.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RoseG/MiniMiP | 11.77B | no disponible | Gemma | Fine-tune de Gemma 3 12B pt, propósito de alineación |
| google/gemma-3-12b-pt | 12B | 128k | Gemma | Modelo base oficial de Google, entrenado en portugués |
| google/gemma-3-12b-it | 12B | 128k | Gemma | Versión instruct de Gemma 3 12B, con RLHF |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | Alternativa más pequeña, con documentación extensa |

La comparativa se basa en el modelo base y alternativas conocidas; no hay datos de rendimiento de MiniMiP para comparar directamente.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican datos de entrenamiento, metodología ni evaluación, lo que impide conocer su comportamiento real.
- Riesgo de alucinación: al ser un fine-tune sin evaluación publicada, el riesgo de generar información falsa es desconocido y potencialmente alto.
- Sesgos: no se han realizado auditorías de sesgo; el modelo puede heredar sesgos del base Gemma 3 y de los datos de ajuste (desconocidos).
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso (prohibición de usos militares, vigilancia masiva, etc.) y requiere atribución. Es compatible con uso comercial, pero hay que revisar los términos completos.
- Limitaciones de idioma: el sufijo "pt" sugiere enfoque en portugués, pero no se confirma; el modelo podría tener un rendimiento degradado en otros idiomas.
- Producción: sin benchmarks ni documentación, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/RoseG/MiniMiP
- FriendliAI (endpoint de inferencia): https://friendli.ai/models/RoseG/MiniMiP
- Modelo base (Google): https://huggingface.co/google/gemma-3-12b-pt
