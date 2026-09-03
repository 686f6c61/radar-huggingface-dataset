# Raghav-Singhal/1pp-1b-ua-sft

## Resumen

El modelo `1pp-1b-ua-sft` es un experimento de investigación del proyecto One Persona Pretraining (1PP) del EPFL DLAB, desarrollado por Raghav-Singhal. Forma parte de un estudio 3×3 que combina tres tamaños (0.5B, 1B y 1.7B) con tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos. Esta variante concreta tiene 0,98B parámetros, se preentrenó con conversaciones reescritas aplicando pérdida tanto en turnos de usuario como de asistente, y posteriormente se sometió a un ajuste fino supervisado (SFT). El objetivo del estudio es analizar cómo influye la distribución de la pérdida durante el pretraining en la calidad conversacional del modelo final.

Arquitectónicamente es un decoder estilo Llama con 24 capas, dimensión oculta 1536, atención con 12 cabezas y 4 cabezas KV, y una ventana de contexto de 4096 tokens. El tokenizador es el de SmolLM2 ampliado con un token especial de padding. El modelo está pensado exclusivamente como artefacto de investigación, no como asistente general de producción, y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (SwiGLU, RMSNorm, RoPE base 10000, embeddings no compartidos, sin biases) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Llama estándar: 24 capas, hidden size 1536, FFN 6144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10000, embeddings no atados y sin sesgos. No incorpora QK-norm. La secuencia máxima es de 4096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token adicional `<|pad|>`, y `<|endoftext|>` se usa como fin de documento.

El pretraining se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63,0B tokens en formato conversacional, frente a 66,2B tokens de los documentos originales), con una sola pasada y 31.777 pasos con batch global de 512×4096 tokens. Se aplicó enmascaramiento de atención entre documentos y empaquetado best-fit con asignación alineada por pasos. El optimizador fue Muon (con escalado por forma y LR de matriz 0.005) combinado con Adam para embeddings y normas, warmup de 2000 pasos, decay lineal en el último 10% hasta 1/100, weight decay 0.1 y precisión bf16. La pérdida se calculó sobre turnos de usuario y asistente, excluyendo el token de fin de documento.

El ajuste fino supervisado consistió en una época sobre una mezcla de 400.000 conversaciones procedentes de tres conjuntos: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas constitucionales), `dlab-spp/sp-sft-normal-300k` (271,6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack de pretraining (Megatron, Muon, ChatML sin turno de sistema) con pérdida solo en turnos de asistente. La LR de matriz se seleccionó por validación entre {0.0005, 0.001, 0.002, 0.005}, resultando 0.002, con batch global 128×4096 y decay lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés, siguiendo el formato ChatML sin turno de sistema (el modelo nunca vio uno durante el entrenamiento).
- Mantenimiento de conversaciones multi-turno gracias al entrenamiento con datos de diálogo y a la ventana de 4096 tokens.
- Capacidad de detener la generación en el token `<|im_end|>`, lo que permite integrarlo en pipelines de chat estándar.
- No dispone de tool calling, ni capacidades de visión, audio o razonamiento explícito más allá de la generación de texto.
- Al ser un modelo de investigación, su utilidad principal es servir como objeto de estudio para analizar el efecto de la pérdida en turnos de usuario durante el pretraining.

## Casos de uso

- Investigación académica en NLP: permite estudiar cómo la distribución de la pérdida (usuario vs. asistente) afecta a la calidad de las respuestas generadas, comparando con las otras variantes del estudio 1PP.
- Generación de diálogos sintéticos: puede usarse para crear conversaciones etiquetadas que sirvan como datos de entrenamiento para otros modelos, aprovechando su formato ChatML consistente.
- Fine-tuning posterior: al ser un modelo base ajustado con SFT, es una base adecuada para experimentos de alineación adicional (DPO, RLHF) en entornos de investigación.
- Evaluación de técnicas de alineación: su configuración controlada (mismo orden de datos, misma arquitectura) lo convierte en un banco de pruebas para comparar métodos de ajuste.
- Prototipos de chatbot en inglés: con una ventana de 4096 tokens y formato ChatML, puede integrarse en demos o prototipos de bajo riesgo donde no se requiera un asistente general.
- Análisis de sesgos: al estar entrenado con conversaciones reescritas, permite investigar sesgos introducidos por la transformación de documentos a diálogo y por la pérdida en turnos de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta pérdidas de validación:

| Métrica | Valor |
|---|---|
| Pérdida de validación en pretraining (texto asistente) | 1.492 |
| Pérdida de validación en pretraining (texto usuario) | 1.392 |
| Pérdida de validación en pretraining (texto documento) | 3.216 |
| Pérdida held-out de SFT (tokens asistente) | 1.903 |

Estas cifras no son comparables con benchmarks de capacidad, sino métricas internas del proceso de entrenamiento.

## Requisitos de hardware

No se dispone de datos oficiales de rendimiento o requisitos de hardware. Como estimación orientativa basada en el tamaño del modelo (981M parámetros):

- En precisión fp16, los pesos ocupan aproximadamente 2 GB, por lo que cabría en GPUs consumer con 4-6 GB de VRAM (p. ej., RTX 3060, RTX 4060) para inferencia básica.
- Con cuantización de 4 bits, el uso de VRAM podría reducirse a menos de 1 GB, aunque no hay mediciones publicadas.
- Para despliegue, es compatible con librerías estándar de transformers y con text-generation-inference (el repo incluye la etiqueta `endpoints_compatible`). También podría ejecutarse con vLLM o llama.cpp, pero no hay configuraciones oficiales documentadas.
- Dado su carácter experimental, no se recomienda su uso en producción sin una evaluación previa de latencia y throughput.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. El modelo comparte tokenizador con la familia SmolLM2, pero no hay datos de rendimiento que permitan una comparación objetiva. Dentro del propio proyecto 1PP existen otras 8 variantes (tres tamaños × tres condiciones de pretraining) que sí son comparables estructuralmente, pero no se aportan métricas de capacidad en la model card.

## Limitaciones y advertencias

- Es un artefacto de investigación del proyecto 1PP (EPFL DLAB), no un asistente general de propósito general. No debe usarse en aplicaciones críticas sin una evaluación exhaustiva.
- Solo soporta inglés; no hay capacidades multilingües.
- La ventana de contexto está limitada a 4096 tokens, lo que restringe conversaciones muy largas o documentos extensos.
- El formato de chat no incluye turno de sistema; si se añade uno, el modelo puede comportarse de forma impredecible.
- No se han documentado sesgos específicos, pero al entrenarse con datos reescritos y con pérdida en turnos de usuario, podría reflejar sesgos presentes en las conversaciones sintéticas.
- Riesgo de alucinación inherente a los modelos generativos; no se han realizado evaluaciones de fiabilidad.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo experimental, no hay garantías de calidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1b-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
