# llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved

## Resumen

Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved es una variante "decensored" (tambien llamada abliterated) del modelo multimodal Qwen/Qwen3.5-27B, publicada por el contribuidor independiente llmfan46. El objetivo del autor es eliminar los mecanismos de rechazo del modelo original —las respuestas de negativa, advertencias y evasivas ante peticiones consideradas sensibles— aplicando una ablacion de direcciones en los pesos, sin reentrenar el modelo. Segun la model card, el resultado reduce los rechazos de 95/100 a 10/100 en su conjunto de prueba, con una divergencia KL de 0.0308 respecto al original.

El modelo conserva la arquitectura del Qwen3.5-27B base: un transformer multimodal con pipeline image-text-to-text, 27.356.728.560 parametros (unos 27,4 mil millones) en precision completa y pesos en safetensors. Una caracteristica tecnica destacable es la preservacion de las 15 tensores MTP (Multi-Token Prediction) del modelo original, que el autor verifica explicitamente mediante listado comparado, de ahi el sufijo "Native-MTP-Preserved" del nombre.

Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal de ~27B con pesos abiertos y menos restricciones de contenido para tareas de investigacion sobre alineacion, red teaming, generacion creativa sin filtros o evaluacion de sesgos. La licencia declarada es Apache 2.0, heredada del modelo base, aunque el uso comercial debe evaluarse con cautela por la naturaleza del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), con capas MTP (Multi-Token Prediction) preservadas |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, un transformer multimodal de aproximadamente 27,4 mil millones de parametros que procesa imagen y texto (pipeline image-text-to-text). Sobre esa base no se ha realizado un reentrenamiento: la modificacion consiste en una ablacion de direcciones en el espacio de activaciones aplicada a los pesos, mediante la herramienta Heretic v1.3.0 con una variante del metodo Magnitude-Preserving Orthogonal Ablation (MPOA). Los componentes objetivo de la ablacion son `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con pesos de ablacion configurables por capa (por ejemplo, `mlp.down_proj.max_weight` = 1.49, `attn.out_proj.min_weight` = 1.01, `direction_index` = 42.53).

La innovacion tecnica principal es la preservacion integra de las 15 tensores MTP del modelo original (`mtp.fc.weight`, `mtp.layers.0.*`, `mtp.norm.weight`, `mtp.pre_fc_norm_embedding.weight`, `mtp.pre_fc_norm_hidden.weight`), lo que mantiene la capacidad de decodificacion especulativa nativa del Qwen3.5 base. El autor no documenta el dataset de calibracion usado por Heretic ni el numero de tokens de entrenamiento (no hay entrenamiento supervisado ni RLHF/DPO en este paso, solo edicion de pesos). No se dispone de informacion sobre la composicion del dataset original de Qwen3.5-27B en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-27B.
- Procesamiento de imagen y texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento y conocimiento general, con un 86,53% de acierto en MMLU segun la evaluacion del autor.
- Reduccion drastica de rechazos: 10/100 frente a 95/100 del original en el conjunto de prueba del autor, lo que habilita respuestas a peticiones que el modelo base rechazaria.
- Decodificacion especulativa nativa gracias a las 15 capas MTP preservadas, que pueden acelerar la inferencia en frameworks compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el modelo base Qwen3.5 es multilingue, pero no se detalla en esta ficha).
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible para medir el impacto de la ablacion MPOA sobre la tasa de rechazos (10/100) y la divergencia KL (0.0308), comparando con el Qwen3.5-27B original en el mismo conjunto de 100 prompts.
- Red teaming y evaluacion de seguridad: al reducir los rechazos, permite a equipos de seguridad probar la robustez de filtros externos y guardrails de produccion frente a un modelo que no se autolimita, identificando categorias de contenido que requieren mitigacion adicional.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas, violencia o humor negro donde el modelo base introduciria advertencias o evasivas; adecuado por su ventana conversacional y su capacidad de mantener personajes y tono.
- Analisis de imagenes en entornos de investigacion: al conservar el pipeline image-text-to-text, puede usarse para describir o razonar sobre imagenes en conjuntos de datos donde el modelo censurado se negaria a procesar cierto contenido.
- Evaluacion comparativa de calidad tras abliteration: con MMLU a 86,53% y KL de 0.0308, es util para estudiar cuanto conocimiento se degrada al eliminar direcciones de rechazo, comparando por asignatura (por ejemplo, `high_school_mathematics` 69,29% frente a `high_school_microeconomics` 97,79%).
- Despliegue en pipelines de transformers: el repo esta en safetensors y es compatible con la libreria transformers, por lo que puede integrarse en flujos de inferencia existentes que ya cargan modelos Qwen3.5, sustituyendo el checkpoint sin cambiar el codigo de carga.
- Generacion de datos sinteticos para entrenamiento: util para producir respuestas a prompts que el modelo base rechazaria, ampliando la diversidad de un dataset de instrucciones, siempre con revision humana posterior.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son la evaluacion MMLU y las metricas de abliteration. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

| Metrica | Este modelo | Qwen/Qwen3.5-27B (original) |
|---|---|---|
| MMLU (accuracy, 7021 preguntas) | no reportado | 86,53% (6075/7021) |
| Divergencia KL respecto al original | 0,0308 | 0 (por definicion) |
| Tasa de rechazos (100 prompts) | 10/100 | 95/100 |

Desglose MMLU del modelo original por asignatura (referencia del autor): `professional_law` 75,54%, `moral_scenarios` 75,57%, `miscellaneous` 93,99%, `professional_psychology` 91,14%, `high_school_psychology` 97,41%, `high_school_macroeconomics` 90,86%, `elementary_mathematics` 88,59%, `moral_disputes` 86,21%, `prehistory` 88,95%, `philosophy` 86,79%, `high_school_biology` 96,05%, `professional_accounting` 78,32%, `clinical_knowledge` 94,29%, `high_school_microeconomics` 97,79%, `nutrition` 89,63%, `professional_medicine` 95,52%, `conceptual_physics` 92,97%, `high_school_mathematics` 69,29%, `human_aging` 83,62%, `security_studies` 84,82%. El autor no publica el MMLU del modelo heretic, solo el del original.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos (el repo ocupa 55,6 GB), mas overhead de activaciones y KV cache; en la practica se necesitan 60-70 GB.
- VRAM estimada en cuantizacion de 8 bits: ~28-30 GB; en 4 bits: ~15-17 GB (estimaciones teoricas, no verificadas por el autor, ya que no se publican GGUF).
- GPU recomendadas: A100 80GB o H100 80GB para BF16 sin cuantizar; dos RTX 4090 (24 GB cada una) o una RTX 6000 Ada (48 GB) para cuantizacion 8 bits; RTX 4090 unica solo en 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion de 4 bits (estimado), aunque no hay GGUF oficial publicado en el repo.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp y Ollama no estan confirmados por el autor. La decodificacion especulativa via MTP requiere frameworks que soporten esa ruta en Qwen3.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-uncensored-heretic-v2 (este) | ~27,4B | no disponible | no reportado (original 86,53%) | Apache 2.0 | safetensors en HF |
| Qwen/Qwen3.5-27B (original) | ~27,4B | no disponible | 86,53% | Apache 2.0 | safetensors en HF |
| Otras variantes heretic/abliterated de Qwen3.5 | no disponible | no disponible | no disponible | depende del autor | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo, pero no garantiza la eliminacion de sesgos subyacentes del modelo base; pueden persistir sesgos de genero, raza, religion o ideologia.
- Riesgo elevado de generar contenido danino, ilegal o sexualmente explicito sin advertencia; no es apto para despliegue directo en aplicaciones de cara al publico sin guardrails externos.
- El autor solo reporta 10/100 rechazos y KL de 0,0308 sobre su propio conjunto de 100 prompts, sin detallar la composicion de ese conjunto; la metrica no es directamente comparable con evaluaciones de seguridad estandar.
- No se publica el MMLU del modelo heretic, solo el del original (86,53%), por lo que no se puede cuantificar la degradacion de conocimiento tras la ablacion.
- No hay informacion sobre longitud de contexto, idiomas soportados ni cuantizaciones oficiales; el despliegue en produccion requiere validacion propia.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de un modelo decensored puede incumplir politicas de plataformas, terminos de servicio de proveedores cloud o normativa local sobre contenido.
- El repo ocupa 55,6 GB y el autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura del checkpoint.
- Solo 25 descargas y 9 likes en el momento de la consulta: comunidad pequena, sin validacion independiente de las metricas declaradas.
- No se documenta el dataset de calibracion usado por Heretic, lo que dificulta reproducir el proceso de abliteration.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Blog sobre Magnitude-Preserving Orthogonal Ablation: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
