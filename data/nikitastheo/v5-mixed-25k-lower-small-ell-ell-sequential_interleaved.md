# nikitastheo/v5-mixed-25k-lower-small-ell-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v5-mixed-25k-lower-small-ell-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2 publicado por el usuario nikitastheo en HuggingFace. Con 25.717.760 parámetros totales (aproximadamente 26 millones) y un repositorio de solo 0,2 GB, se trata de un modelo de escala muy reducida, orientado a experimentación académica más que a uso productivo. Emplea la librería `transformers`, formato de pesos `safetensors` y está etiquetado con `causal-lm`, `text-generation` y `text-generation-inference`.

El nombre del repositorio apunta a un entrenamiento de tipo BabyLM: tokenizador propio de 25.000 tokens (`nikitastheo/babylm-25k-ell-lower-tokenizer`), texto en minúsculas (`lower`), una configuración pequeña (`gpt_small_config.json`) y una estrategia de "cambio de idioma" en la época 10 (`language switch epoch: 10`) con mezcla secuencial intercalada. El código `ell` corresponde a la ISO 639-3 del griego, aunque la información disponible no confirma de forma explícita la composición exacta del corpus ni si se trata de un modelo monolingüe o bilingüe.

Su relevancia es fundamentalmente de investigación: sirve como banco de pruebas reproducible para estudiar currículos de datos, tokenizadores de vocabulario reducido y estrategias de mezcla de idiomas en modelos pequeños. No hay evidencia de benchmarks publicados, descargas ni validación externa, por lo que debe tratarse como un artefacto experimental sin garantías de calidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal decoder-only); configuración de entrenamiento `model_configs/gpt_small_config.json` |
| Parametros totales | 25.717.760 |
| Longitud de contexto | no disponible (el tag `gpt2` sugiere contexto posicional aprendido de la familia GPT-2, pero no se confirma en la información proporcionada) |
| Tipos de cuantizacion | no disponible oficialmente; al ser `safetensors` de pesos densos, admite conversión a FP16/BF16, INT8 e INT4 mediante herramientas externas |
| Idiomas soportados | no disponible; el nombre del tokenizador (`ell-lower`) sugiere griego (ISO 639-3 `ell`) en minúsculas, sin confirmación en la información disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | `nikitastheo/babylm-25k-ell-lower-tokenizer` (vocabulario de 25.000 tokens, texto en minúsculas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Idoneo para endpoints | si (`endpoints_compatible`, `text-generation-inference`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de la familia GPT-2, definido en el fichero de configuración `model_configs/gpt_small_config.json`. No se dispone del contenido de ese fichero, por lo que no se pueden confirmar el número de capas, la dimensión del modelo, el número de cabezas de atención ni la longitud máxima de contexto. El entrenamiento se realizó con `train_clm.py`, un script propio basado en Hugging Face Accelerate para modelos causales, sin usar la clase `Trainer`.

Los hiperparámetros documentados en la model card son: 26.340 pasos máximos, tasa de aprendizaje 0,0001, planificador lineal con 2.634 pasos de calentamiento, tamaño de lote de 32 por dispositivo, sin acumulación de gradiente (tamaño de lote total efectivo de 32) y un `language switch epoch` en la época 10, lo que indica un cambio de idioma o de distribución de datos en ese punto del entrenamiento. El nombre `sequential_interleaved` describe la estrategia de mezcla de secuencias o idiomas. No se documentan número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto causal autoregresiva en el dominio y los idiomas para los que fue entrenado.
- Vocabulario reducido de 25.000 tokens en minúsculas, adecuado para experimentos con tokenizadores compactos.
- Entrenamiento con mezcla secuencial/intercalada de datos y cambio de idioma en la época 10, lo que sugiere capacidad de manejar al menos dos distribuciones lingüísticas, sin confirmación explícita.
- Compatible con el pipeline `text-generation` de `transformers` y con `text-generation-inference` según los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- No se documentan capacidades multilingües más allá de lo que sugiere el nombre del tokenizador.

## Casos de uso

- Investigación en adquisición del lenguaje tipo BabyLM: el modelo sirve como sujeto de prueba para estudiar cómo modelos de ~26M de parámetros aprenden con currículos de datos limitados y tokenizadores pequeños.
- Experimentación con currículos de datos multilingües: la configuración con cambio de idioma en la época 10 permite analizar el efecto del orden de presentación de los datos sobre el olvido catastrófico y la transferencia entre idiomas.
- Prototipado rápido de pipelines de generación: al ocupar 0,2 GB, se puede cargar y ejecutar en cualquier portátil, lo que lo hace útil para validar código de inferencia, plantillas de prompts o integraciones con `text-generation-inference` antes de pasar a modelos mayores.
- Evaluación comparativa de tokenizadores: permite medir el impacto de un vocabulario de 25.000 tokens y texto normalizado a minúsculas en métricas de perplejidad y fertilidad de segmentación.
- Docencia y prácticas de ajuste fino: su tamaño reducido hace viable entrenar variantes completas en una única GPU consumer o incluso en CPU durante sesiones académicas.
- Generación de texto corto en griego para experimentos controlados: si se confirma el soporte del idioma `ell`, podría usarse para generar titulares, frases o microtextos de prueba, siempre con revisión humana.
- Pruebas de cuantización y despliegue: sirve como caso mínimo para validar flujos de conversión a GGUF, INT8 o INT4 y medir degradación de calidad sin coste computacional apreciable.
- Reproducción de experimentos de entrenamiento: con los hiperparámetros documentados (26.340 pasos, lr 1e-4, warmup 2.634), es replicable como referencia en estudios de escalado a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de evaluación (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y la búsqueda web asociada no devolvió documentación técnica ni resultados del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 103 MB; en FP16/BF16, unos 51 MB; en INT8, unos 26 MB; en INT4, unos 13 MB. Con activaciones y caché KV, el consumo real se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. No se requiere A100 ni H100; su uso sería un desperdicio de recursos para esta escala. Una GTX 1650, RTX 3050 o superior ya resulta sobrada.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU y en CPU. También es viable en dispositivos de placa única tipo Raspberry Pi, siempre que se use cuantización.
- Opciones de despliegue: `transformers` en Python, `text-generation-inference` (el tag `text-generation-inference` figura en el repositorio), `vLLM` (soporta arquitecturas GPT-2), conversión a GGUF para `llama.cpp` y, desde ahí, `Ollama` u otros runners locales.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de ~26M de parámetros, en GPU moderna la generación de decenas de tokens por segundo por lote es esperable, pero no hay cifras publicadas que lo confirmen.
- Almacenamiento: 0,2 GB en el repositorio de HuggingFace, lo que permite tenerlo residente en memoria sin planificación alguna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikitastheo/v5-mixed-25k-lower-small-ell-ell-sequential_interleaved | 25.717.760 | no disponible | GPT-2 causal | no disponible | HuggingFace, 0 descargas |
| GPT-2 small (OpenAI) | ~124M | 1024 tokens | Transformer causal decoder-only | Modified MIT | Ampliamente disponible y validado |
| DistilGPT-2 | ~82M | 1024 tokens | Transformer causal destilado | Apache-2.0 | Ampliamente disponible |
| Pythia-14M (EleutherAI) | ~14M | 2048 tokens | Transformer causal con RoPE | Apache-2.0 | Disponible con suite completa de checkpoints |
| TinyStories-33M | ~33M | 512–1024 tokens segun variante | Transformer causal | Consultar repositorio original | Disponible, orientado a texto simple |

La comparación se limita a parámetros y licencia, ya que el modelo evaluado no publica métricas de rendimiento ni contexto. Frente a estas alternativas, su principal desventaja es la ausencia de evaluación publicada y de licencia declarada; su ventaja es el tamaño mínimo y el enfoque experimental sobre currículos y tokenizadores.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes publicadas.
- Licencia no disponible: no se puede asumir permiso de uso comercial. Cualquier uso en produccion requiere contactar con el autor o abstenerse.
- Idiomas no declarados: no hay confirmación oficial de que idiomas maneja realmente, aunque el tokenizador apunte al griego en minusculas.
- Riesgo elevado de alucinacion y de incoherencia: con ~26M de parametros, la coherencia a medio plazo es muy limitada, incluso en dominios sencillos.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso en conversaciones multi-turno o documentos largos.
- Normalizacion a minusculas en el tokenizador: puede degradar tareas que dependan de mayusculas, nombres propios o puntuacion significativa.
- Vocabulario reducido de 25.000 tokens: mayor fragmentacion en idiomas con morfologia rica o alfabetos no latinos.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de filtrado del corpus, por lo que se desconocen los sesgos presentes en los datos de entrenamiento.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso: no debe emplearse en flujos agenticos.
- Nombre del autor y del repositorio sin publicaciones asociadas: no hay paper, blog ni demo que respalde los resultados de entrenamiento.
- Fecha de creacion posterior a la fecha de consulta en los metadatos (2026-09-15), dato que conviene verificar en la ficha oficial de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/nikitastheo/v5-mixed-25k-lower-small-ell-ell-sequential_interleaved
- Tokenizador: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-tokenizer (referenciado en la model card; no verificado)
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada
