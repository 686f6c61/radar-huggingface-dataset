# richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF` es una cuantización en formato GGUF del modelo `richardyoung/gemma-4-31B-it-GMPOA-heretic`, una versión "abliterada" (con los mecanismos de rechazo eliminados) de `google/gemma-4-31B-it`. La abliteración se realizó con Heretic 2.0, aplicando una corrección MPOA (gamma-MPOA) para compensar las ganancias de salida post-norm. El autor, Richard J. Young, publica estos pesos como material de investigación sobre eliminación de rechazos y su evaluación, no como asistente de propósito general.

El modelo base cuenta con 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) y es de tipo transformer denso, según se desprende del tamaño y la arquitectura de la familia Gemma. El repositorio GGUF ocupa 18,7 GB e incluye por ahora una cuantización Q4_K_M (18,7 GB) junto con una importance matrix de 28 MB; el autor anuncia la incorporación progresiva de IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigación sobre técnicas de abliteración y su medición; por otro, sirve como ejemplo de cuantización GGUF de un modelo de ~31B con licencia Apache 2.0, ejecutable en llama.cpp y Ollama. El modelo está pensado exclusivamente para investigación en entornos controlados y no debe desplegarse como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4); detalles de atención y capas no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (disponible); IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0 (anunciadas, aún no publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Tamaño del repositorio | 18,7 GB |
| Importance matrix | `gemma-4-31B-it-GMPOA-heretic-imatrix.gguf` (28 MB), calibrada con `calibration_datav3` (128 chunks de 512 tokens sobre la build Q8_0) |
| Modalidad | Solo texto (el proyector de visión no está incluido) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Gemma 4 con ~30,7B parámetros. La innovación principal no está en la arquitectura base, sino en el proceso de abliteración: se parte de `google/gemma-4-31B-it` y se aplica Heretic 2.0 con una corrección MPOA (gamma-MPOA) para compensar las ganancias de salida post-norm. La regla de selección del vector de abliteración fue la de minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una KL de primer token ≤ 0,1, mediante una búsqueda de 100 ensayos.

Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La cuantización se generó con llama.cpp (commit `468fde9`): conversión a bf16 con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix; Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de la subida, y los sumas SHA-256 están en `SHA256SUMS`.

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`, tag `conversational`).
- Eliminación de rechazos: según la model card, el modelo cumple muchas peticiones que el original rechaza (20,6% de rechazo frente a 89,3% del original en 972 prompts dañinos retenidos, juez WildGuard, sobre el modelo en bf16).
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp/Ollama.
- Capacidad multimodal de visión presente en el modelo base, pero **no incluida** en estos GGUF (sin proyector de visión).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata (`language: en`).
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- **Investigación sobre abliteración y su medición**: el modelo sirve como artefacto de estudio para comparar tasas de rechazo antes y después de la eliminación, y para evaluar defensas frente a la abliteración. Es su uso declarado por el autor.
- **Evaluación de robustez de salvaguardas**: permite medir con jueces automáticos (p. ej. WildGuard) cuántas peticiones dañinas se cumplen, y comparar con el modelo original como línea base.
- **Reproducción de experimentos en CPU/GPU de consumo**: la cuantización Q4_K_M (18,7 GB) permite ejecutar el modelo en llama.cpp u Ollama en hardware de gama alta de consumo, facilitando la reproducibilidad de estudios sin clústeres dedicados.
- **Pruebas de pipelines de cuantización**: el repositorio documenta el proceso completo (conversión bf16, importance matrix, `llama-quantize`) y sirve de referencia para construir y validar GGUF de modelos de ~31B.
- **Análisis de degradación por cuantización**: al comparar Q4_K_M con las futuras IQ3_M, Q5_K_M, Q6_K y Q8_0, se puede estudiar cómo la cuantización altera el comportamiento de rechazo, algo que el propio autor advierte que no fue evaluado en el paper.
- **Banco de pruebas de alineación y seguridad**: útil en entornos de investigación para diseñar y validar clasificadores de seguridad o filtros de salida frente a un modelo sin rechazos.
- **Despliegue local de referencia en Ollama**: con `ollama run hf.co/richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF:Q4_K_M` se puede levantar un endpoint compatible para pruebas internas controladas.

## Benchmarks y rendimiento

La model card solo reporta la tasa de rechazo sobre el modelo en bf16 (no sobre las cuantizaciones). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 89,3% | 20,6% (200/972) |

Nota: la regla de selección fue "mínimos rechazos por palabra clave en dev con KL de primer token ≤ 0,1 (búsqueda de 100 ensayos)". Los archivos cuantizados no fueron evaluados en el paper y la cuantización puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- **VRAM estimada para Q4_K_M**: el archivo pesa 18,7 GB; se necesita al menos esa cantidad de VRAM para carga completa en GPU, más overhead de contexto y KV cache (típicamente 1-3 GB adicionales según longitud de contexto).
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB para carga completa con contexto amplio; RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar Q4_K_M con margen ajustado.
- **Consumer GPU**: sí, Q4_K_M cabe en GPUs de 24 GB (RTX 4090/3090) y, con offload parcial a CPU, en GPUs de 12-16 GB. Las futuras IQ3_M e IQ4_XS reducirán aún más el requisito.
- **Opciones de despliegue**: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF` (este) | ~30,7B | No disponible | Apache 2.0 | GGUF (Q4_K_M) | Abliterado con Heretic 2.0 + gamma-MPOA; solo texto; solo inglés |
| `richardyoung/gemma-4-31B-it-GMPOA-heretic` (base) | ~30,7B | No disponible | Apache 2.0 | Safetensors (bf16) | Mismo modelo sin cuantizar; evaluado en el paper |
| `google/gemma-4-31B-it` (original) | ~30,7B | No disponible | Apache 2.0 (licencia Gemma 4) | Safetensors | Modelo de referencia con rechazos intactos; acepta imágenes |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Uso previsto exclusivamente investigador**: el autor lo publica para estudiar la eliminación de rechazos y sus defensas, no como asistente de propósito general.
- **Eliminación de rechazos**: el modelo cumple muchas peticiones que el original rechaza (20,6% de rechazo frente a 89,3%); esto implica un riesgo elevado de generar contenido dañino si se despliega sin filtros.
- **Cuantización no evaluada**: las cifras de rechazo corresponden al modelo bf16; la cuantización puede alterar el comportamiento y no fue medida en el paper.
- **Solo texto**: el proyector de visión no está incluido, aunque el modelo base acepta imágenes.
- **Idioma**: metadata limitada a inglés; no hay evidencia de capacidades multilingües.
- **Contexto**: longitud de contexto no documentada en esta ficha.
- **Licencia**: Apache 2.0 con enlace a la licencia de Gemma 4; conviene revisar las restricciones de uso de la familia Gemma antes de un uso comercial.
- **Sesgos y alucinación**: no hay información específica en la model card; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados aquí.
- **Responsabilidad legal**: el autor declara que los usuarios son responsables del uso lícito.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF
- Modelo base abliterado: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper citado (arXiv, enlace pendiente de añadir según la model card): *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors*, Richard J. Young, 2026.
