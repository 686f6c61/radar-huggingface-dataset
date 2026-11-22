# MikhailSt/Qwen3.5-9B-heretic-GSQ-RCO-PQ2

## Resumen

Qwen3.5-9B-heretic-GSQ-RCO-PQ2 es una cuantización GGUF de precisión mixta del modelo llmfan46/Qwen3.5-9B-ultra-uncensored-heretic, un fine-tune "heretic" (sin censura) de la familia Qwen3.5 de 9B parámetros. Lo publica el usuario MikhailSt en Hugging Face y su propósito es reducir el peso del modelo original desde los aproximadamente 18 GB en FP16 hasta 4,36 GB, manteniendo las capas de atención en mayor precisión. El resultado es un modelo conversacional que cabe en GPUs de consumo con 5-6 GB de VRAM, algo imposible con el checkpoint original.

La innovación principal es el esquema de cuantización mixta: las capas FFN (feed-forward) se comprimen a 2 bits con un formato personalizado denominado PQ2_0 (group size 128), mientras que las capas de atención (`self_attn` y `linear_attn`/Gated DeltaNet) se mantienen en Q4_K y las embeddings y la cabeza de salida en Q6_K. Esta distribución protege las partes del modelo más sensibles a la cuantización agresiva. El modelo base tiene 8.953.803.264 parámetros reales según safetensors y emplea una arquitectura híbrida con componentes de atención lineal (Gated DeltaNet), lo que lo aleja del transformer denso clásico.

Es relevante ahora porque demuestra que es viable llevar un modelo de 9B con arquitectura híbrida a 2 bits en las capas FFN sin colapsar, y porque el formato PQ2_0 requiere builds específicos de llama.cpp/Strata que aún no son estándar. Es, por tanto, un artefacto experimental orientado a quienes quieren probar inferencia de bajo consumo en hardware modesto, no una opción de producción estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet, `linear_attn`) y atención estándar (`self_attn`); familia Qwen3.5 |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: PQ2_0 (2 bits, group size 128) en FFN; Q4_K en atención; Q6_K en embeddings y output |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-9B-heretic-GSQ-RCO-PQ2.gguf`, 4,36 GB) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Qwen3.5 y combina capas de atención estándar (`self_attn`) con capas de atención lineal identificadas como Gated DeltaNet (`linear_attn`). Esta mezcla reduce el coste computacional y de memoria del contexto largo respecto a un transformer denso puro. El checkpoint tiene 8,95B parámetros y procede de un fine-tune "heretic" (llmfan46/Qwen3.5-9B-ultra-uncensored-heretic) que elimina los rechazos y alineamientos de seguridad del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune heretic.

La cuantización aplicada por MikhailSt usa GSQ (probablemente "Grouped Scale Quantization" u otra variante propietaria; las siglas no se explican en la model card) junto con RCO y un tipo personalizado PQ2_0. La distribución de tensores es explícita: 84 tensores en PQ2_0 (ffn_gate, ffn_up, ffn_down), 89 en Q4_K (linear_attn, self_attn) y 3 más 2 tensores de embedding/output en Q6_K. La innovación técnica destacable es precisamente ese reparto por capas, que mantiene la atención en 4 bits y la salida en 6 bits mientras comprime las FFN a 2 bits. No hay información sobre decodificación especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3.5, aunque no se detallan en la model card.
- Generación de código: presumiblemente soportada por el modelo base, sin datos específicos.
- Tool calling / function calling: no se documenta explícitamente para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Modo "heretic": el fine-tune elimina los rechazos de seguridad, por lo que responde a peticiones que el modelo original rechazaría.
- No se mencionan capacidades de visión, audio ni thinking mode.

## Casos de uso

- Inferencia en GPU de consumo: el archivo de 4,36 GB cabe en tarjetas con 5-6 GB de VRAM, lo que permite ejecutar un modelo de 9B en equipos como una RTX 3060 de 6 GB o una RTX 2060. Es el caso de uso principal de esta cuantización.
- Experimentación con cuantización extrema: investigadores que quieran evaluar el impacto de llevar las FFN a 2 bits (PQ2_0) manteniendo atención en 4 bits pueden usar este checkpoint como referencia para estudios de degradación por capa.
- Prototipado de asistentes conversacionales sin restricciones: el fine-tune heretic permite probar flujos conversacionales donde el modelo base rechazaría contenido, útil en entornos de investigación controlados.
- Despliegue en edge o portátiles: con 4,36 GB de pesos y ~5-6 GB de VRAM, es viable en portátiles con GPU dedicada modesta para demos locales.
- Pruebas de compatibilidad de runtimes: sirve para validar builds de llama.cpp/Strata con soporte de GGML_TYPE_PQ2_0, ya que el formato no es estándar.
- Evaluación comparativa de esquemas de cuantización: comparar este PQ2_0 mixto contra cuantizaciones estándar (Q4_K_M, Q5_K_M) del mismo modelo base para medir perplejidad y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5-6 GB según la model card (pesos de 4,36 GB más overhead de contexto y KV cache).
- GPU recomendadas: no especificadas por el autor; por el rango de VRAM, tarjetas de 6 GB o más (RTX 3060 6 GB, RTX 2060 6 GB, RTX 4050 Laptop 6 GB).
- Cabe en GPU de consumo: sí, en modelos con al menos 6 GB de VRAM.
- Opciones de despliegue: llama.cpp o Strata con soporte de `GGML_TYPE_PQ2_0`. El estimador de hardware estándar de Hugging Face no reconoce el tag PQ2_0 en el nombre del archivo, por lo que no sirve para calcular requisitos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-GSQ-RCO-PQ2 (este) | 8,95B | no disponible | GGUF mixta PQ2_0/Q4_K/Q6_K, 4,36 GB | Apache 2.0 | Requiere build con PQ2_0 |
| llmfan46/Qwen3.5-9B-ultra-uncensored-heretic (base) | 8,95B | no disponible | safetensors FP16/BF16 (~18 GB) | Apache 2.0 | Estándar en HF |
| Cuantizaciones GGUF estándar del mismo base (Q4_K_M, Q5_K_M) | 8,95B | no disponible | GGUF estándar | Apache 2.0 | llama.cpp estándar |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El formato PQ2_0 es personalizado y no está soportado por builds estándar de llama.cpp; sin un binario con `GGML_TYPE_PQ2_0` el modelo no carga.
- La cuantización a 2 bits en las FFN degrada la calidad respecto al checkpoint original; no hay datos de perplejidad publicados que cuantifiquen esa pérdida.
- El fine-tune "heretic" elimina los rechazos de seguridad: el modelo puede generar contenido dañino, ofensivo o ilegal. No es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación: inherente a modelos de 9B y agravado por la cuantización agresiva.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento multilingüe.
- Longitud de contexto no disponible; no se debe asumir la ventana del modelo Qwen3.5 original sin verificación.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el contenido generado por un modelo sin censura puede acarrear responsabilidad legal según jurisdicción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El estimador de hardware de Hugging Face no reconoce este formato, por lo que no debe usarse para planificar despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/MikhailSt/Qwen3.5-9B-heretic-GSQ-RCO-PQ2
- Modelo base: https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic
- llama.cpp (requiere build con soporte PQ2_0): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
