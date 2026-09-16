# g-assismoraes/DeltaP2S-Gemma7B-DeltaP2S-CodeGemma2B-Code-S13-a05

## Resumen

DeltaP2S-Gemma7B-DeltaP2S-CodeGemma2B-Code-S13-a05 es un checkpoint fusionado publicado por el usuario g-assismoraes en HuggingFace. No se trata de un modelo entrenado desde cero, sino del resultado de un experimento de fusión de pesos entre dos modelos de la familia Gemma de Google: Gemma 7B (modelo generalista) y CodeGemma 2B (modelo especializado en código). El nombre del repositorio y la ruta de entrenamiento declarada (`codegemma2b_to_gemma7b_S13_untie_a05`) apuntan a una transferencia de delta desde el modelo pequeño de código hacia el modelo grande generalista, con embeddings no atados ("untie") y un coeficiente de mezcla aparente de 0,05.

El checkpoint cuenta con 9.324.112.896 parámetros reales según los ficheros safetensors, una cifra que no coincide con la suma directa de las dos familias base, lo que sugiere que la fusión no afectó a la totalidad de las matrices de pesos o que se aplicó sobre un subconjunto de tensores. El repositorio ocupa 18,7 GB, coherente con pesos en fp16/bf16 (≈18,6 GB), y se distribuye únicamente en formato safetensors para la librería transformers.

Su relevancia es fundamentalmente investigadora: se trata de un artefacto experimental con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin model card descriptiva (apenas tres líneas), sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Es útil como material de estudio de técnicas de merging y de transferencia de delta entre modelos de distinto tamaño, pero no como modelo listo para producción sin una validación previa exhaustiva por parte de quien lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma). El `config.json` del checkpoint fusionado no se detalla en la model card, por lo que no se pueden confirmar número de capas, dimensión oculta ni cabezas de atención |
| Parámetros totales | 9.324.112.896 (dato real de los safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el checkpoint fusionado. Las familias base (Gemma 7B y CodeGemma 2B) trabajan con 8.192 tokens |
| Tipos de cuantización | No se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes. Solo safetensors en precisión completa (fp16/bf16) |
| Idiomas soportados | No disponible (no declarado en el repositorio) |
| Licencia | No disponible. Las familias base están sujetas a los Términos de Uso de Gemma de Google, que presumiblemente aplican al derivado, pero no hay confirmación del autor |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint es una fusión de pesos, no un entrenamiento. Según la model card, procede del paquete experimental "family-aware Delta-P2S", con base de entrenamiento en `./runs/codegemma2b_to_gemma7b_S13_untie_a05/init/delta_p2s`. Los identificadores sugieren: transferencia de delta desde CodeGemma 2B hacia Gemma 7B, embeddings no atados entre entrada y salida (`untie`), un factor alpha de 0,05 y un paso o semilla S13. La etiqueta `pen2sword` del repositorio apunta a una técnica de merging propietaria del autor, sin publicación asociada localizada.

Arquitectónicamente, ambos modelos base son transformers decoder-only con normalización RMSNorm, activaciones GeGLU y tokenizador SentencePiece de vocabulario amplio (256k tokens en la familia Gemma). Al ser una fusión, no hay datos de entrenamiento nuevos: no se especifican número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco hay innovaciones técnicas documentadas más allá del propio esquema de delta-P2S. La única verificación objetiva disponible es el recuento de parámetros y el tamaño del repositorio.

## Capacidades

- Generación de texto autoregresiva en la línea de la familia Gemma, con la salvedad de que la fusión puede alterar el comportamiento respecto a los modelos base.
- Generación y autocompletado de código, por herencia de CodeGemma 2B, aunque sin evaluación publicada que cuantifique cuánto de esa capacidad se preserva tras el merge.
- Razonamiento de propósito general y respuesta a instrucciones, heredado de Gemma 7B.
- Soporte de tool calling y function calling: no declarado en el repositorio; en las familias base es limitado y depende del prompt, no de un formato nativo robusto.
- Soporte de agentes y razonamiento multi-paso: no declarado ni evaluado.
- Capacidades multilingües: no declaradas para este checkpoint.
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada; no hay torre de visión ni modo de razonamiento explícito.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Estudio de técnicas de fusión de modelos: el checkpoint sirve como caso práctico para analizar cómo se comporta una transferencia de delta entre un modelo de 2B especializado en código y uno de 7B generalista, comparando capas y tensores afectados.
- Generación de código asistida en prototipos: se puede probar como autocompletado en entornos de desarrollo, pero requiere validación propia porque no hay HumanEval ni MBPP publicados.
- Base para fine-tuning posterior: al ser un punto de partida fusionado, puede emplearse como inicialización en experimentos de ajuste supervisado, aceptando el riesgo de degradación heredada del merge.
- Experimentos de destilación cruzada: la ruta `codegemma2b_to_gemma7b` sugiere utilidad para investigar si un modelo mayor puede absorber capacidades de uno menor sin reentrenamiento completo.
- Reproducción de experimentos de merging: dado que el autor publica el identificador del run, es un candidato para replicar el pipeline delta-P2S y contrastar resultados.
- Evaluación comparativa de checkpoints fusionados: útil como punto de comparación frente a merges convencionales (SLERP, TIES, DARE) en el rango de 9B parámetros.
- Banco de pruebas de infraestructura: por su tamaño, permite validar despliegues con vLLM, TGI o llama.cpp en GPUs de 24 GB antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra métrica, y la búsqueda web no devolvió documentación técnica asociada al modelo ni a la técnica Delta-P2S.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (9,32B) y del tamaño del repositorio (18,7 GB); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en fp16/bf16: ≈18,7 GB solo para pesos; con caché KV y activaciones, entre 20 y 24 GB según longitud de contexto y tamaño de lote.
- VRAM en int8: ≈9,3 GB de pesos, en torno a 11-13 GB en total.
- VRAM en int4: ≈4,7-5,5 GB de pesos, en torno a 7-9 GB en total.
- GPUs profesionales: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB cubren fp16 con holgura.
- GPUs de consumo: RTX 4090 y RTX 3090 (24 GB) pueden alojar fp16 con contexto corto y lote pequeño, pero con poco margen; RTX 4080, 4070 Ti y 3060 de 12 GB solo son viables con cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta declarada por el autor), vLLM y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponible. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las familias base son aproximados y proceden de la documentación pública de Google; los del checkpoint de esta ficha son los únicos verificados en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| DeltaP2S-Gemma7B-CodeGemma2B-S13-a05 | 9,32B | no disponible | no disponible | HuggingFace, safetensors | No |
| Gemma 7B | ≈8,5B | 8.192 tokens | Términos de Uso de Gemma | HuggingFace, múltiples formatos | Sí, extensa |
| CodeGemma 2B | ≈2,5B | 8.192 tokens | Términos de Uso de Gemma | HuggingFace, múltiples formatos | Sí, centrada en código |
| CodeGemma 7B | ≈8,5B | 8.192 tokens | Términos de Uso de Gemma | HuggingFace, múltiples formatos | Sí, centrada en código |

Frente a estas alternativas, el checkpoint fusionado no aporta métricas que justifiquen su uso por encima de los modelos originales, que además cuentan con licencia clara, cuantizaciones listas para usar y soporte de la comunidad. Su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, pruebas cualitativas ni comparaciones con los modelos base, por lo que se desconoce si la fusión degrada las capacidades de Gemma 7B o de CodeGemma 2B.
- Licencia no declarada: al derivar de modelos Gemma, lo más probable es que se apliquen los Términos de Uso de Gemma de Google, que imponen obligaciones de atribución y restricciones de uso; conviene verificar antes de cualquier uso comercial.
- Trazabilidad limitada: el autor no documenta el pipeline delta-P2S, el dataset empleado ni los hiperparámetros más allá del identificador del run.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; no hay evaluación específica de factualidad y la fusión puede agravarlo si los tensores quedan mal alineados.
- Idiomas no declarados: no se puede asumir el multilingüismo de la familia Gemma original.
- Contexto no confirmado: aunque las familias base usan 8.192 tokens, el `config.json` del merge no está descrito en la model card, por lo que la ventana real debe verificarse en el repositorio.
- Repositorio sin tracción: cero descargas y cero valoraciones implican ausencia de validación por terceros y de informes de errores.
- Fecha de creación reciente (16 de septiembre de 2026) y sin actualizaciones posteriores, lo que sugiere que no hay mantenimiento.
- Uso en producción desaconsejado sin una batería propia de evaluaciones de calidad, seguridad y sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Gemma7B-DeltaP2S-CodeGemma2B-Code-S13-a05
- Gemma 7B (modelo base): https://huggingface.co/google/gemma-7b
- CodeGemma 2B (modelo base): https://huggingface.co/google/codegemma-2b
- CodeGemma 7B (referencia de la familia): https://huggingface.co/google/codegemma-7b
- La búsqueda web realizada no devolvió papers, blogs, repositorios ni demos asociados al modelo ni a la técnica Delta-P2S o Pen2Sword; los únicos resultados fueron páginas genéricas de Google y una entrada de Wikipedia sobre la letra "G", sin relación con el modelo.
