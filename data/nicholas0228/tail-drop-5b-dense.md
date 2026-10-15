# Nicholas0228/tail-drop-5b-dense

## Resumen

`Nicholas0228/tail-drop-5b-dense` es un checkpoint de investigación publicado por Nicholas Wu (usuario Nicholas0228) dentro de una línea de trabajo sobre mecanismos de atención con ventanas de sufijo (tail-drop). Se trata de un modelo de lenguaje causal, denso, entrenado desde cero sobre el corpus congelado FineWeb-Edu, con 341.099.520 parámetros reales y un contexto de entrenamiento de 2.048 tokens. El nombre del repositorio puede inducir a error: el "5b" hace referencia a los 4.999.999.999 millones de tokens de entrenamiento objetivo (5.000.134.656 tokens procesados, paso 9.537), no al tamaño del modelo.

El modelo no es un `AutoModelForCausalLM` estándar de Transformers. Utiliza una implementación propia denominada ResearchLM, con código derivado de la revisión fijada del repositorio `tail_drop_attn`, y requiere un cargador específico (`loader.load_release`) descrito en el archivo INFERENCE.md incluido en el repositorio. El tokenizador es el de Mistral-7B-v0.1, congelado y compartido por todos los modelos de la familia.

Es relevante como pieza de investigación reproducible: la release incluye manifiestos de hashes (`release_manifest.json`), identificación de tensores (`tensor_manifest.json`) y procedencia del corpus (`provenance.json`). No es un modelo de instrucciones, no se reclama ninguna capacidad nueva de contexto largo y no se han publicado evaluaciones de benchmarks. Su valor está en comparaciones controladas con políticas de inferencia emparejadas frente a las variantes recurrentes de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only denso (ResearchLM), derivado de la linea de investigacion tail_drop_attn; configuracion de capas en research_config.json, no disponible en la informacion proporcionada |
| Parametros totales | 341.099.520 (341,1 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; la model card indica que no se concede ninguna licencia nueva mas alla de las licencias upstream aplicables |
| Formato de pesos | safetensors (tamano del repositorio: 2,9 GB) |
| Tokenizador | Mistral-7B-v0.1 (congelado) |
| Tokens de entrenamiento | 5.000.134.656 de objetivo; paso 9.537 |
| Dataset | HuggingFaceFW/fineweb-edu (corpus congelado) |
| Ajuste por instrucciones | no (modelo base) |
| Cargador | propio (`loader.load_release`, ver INFERENCE.md); no compatible con AutoModelForCausalLM |

## Arquitectura y entrenamiento

Se trata de un modelo causal denso entrenado desde cero sobre una copia congelada de FineWeb-Edu. El checkpoint corresponde al paso 9.537 y agota un objetivo de 5.000.134.656 tokens, pero reutilizando el schedule de tasa de aprendizaje previsto originalmente para 15.000 millones de tokens, truncado a 5.000 millones. La release es de solo inferencia: conserva exactamente los tensores originales del modelo, sin estado de optimizador ni de generador de números aleatorios, y publica manifiestos y ficheros de procedencia para verificar la reproducibilidad.

La model card enmarca este checkpoint dentro de una familia de investigación con variantes diferenciadas: el modelo denso aquí publicado conserva capas densas en las capas externas, donde la ventana de sufijo se aplica desde el primer token del prompt (incluido el token actual), mientras que M4 sustituye esos extremos por capas recurrentes, y Mamba-2 puro tiene recurrencia nativa sin límite de ventana de sufijo. También menciona modelos anteriores de prefijo protegido (P32/P64) y variantes S-min32/S-min64. El autor advierte explícitamente de que estas políticas de inferencia no deben confundirse entre sí. No se especifica en la información disponible el número de capas, la dimensión oculta, el número de cabezas ni la composición exacta del dataset más allá del corpus FineWeb-Edu; esos datos estarían en `research_config.json`, no incluido en el material proporcionado. Tampoco se indica si hubo RLHF, DPO u otra fase de alineación, y la evidencia apunta a que no la hubo, dado que es un modelo base.

## Capacidades

- Generación de texto en inglés mediante predicción del siguiente token, en modo continuación de prompt (modelo base, sin formato de chat).
- Razonamiento de contexto corto: la ventana de 2.048 tokens limita tareas de memoria a medio plazo.
- Aprendizaje en contexto de alcance reducido, propio de un modelo de 341 M de parámetros entrenado con 5.000 millones de tokens.
- Reproducción exacta de resultados de investigación gracias a los manifiestos de hashes y tensores incluidos.
- Comparación controlada frente a variantes de la misma familia (M4, Mamba-2 puro, P32/P64, S-min32/S-min64) bajo políticas de inferencia emparejadas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: únicamente inglés.
- No dispone de visión, audio ni modo de pensamiento.
- No está ajustado por instrucciones, por lo que no se recomienda su uso directo en diálogo.

## Casos de uso

- Baseline de ablación en investigación de atención: usar este checkpoint denso como referencia fija y comparar perplejidad y comportamiento frente a las variantes con recurrencia (M4, Mamba-2) bajo la misma política de inferencia, aprovechando que la release preserva los tensores originales sin estado de optimizador.
- Estudio de ventanas de sufijo y "tail-drop": al ser el representante denso de la familia, permite aislar el efecto de sustituir capas externas por capas recurrentes en los extremos de la secuencia.
- Análisis de representaciones internas: con 341 M de parámetros y pesos en safetensors, es viable extraer activaciones por capa para estudiar cómo se codifica el contexto dentro de la ventana de 2.048 tokens.
- Destilación y generación de datos sintéticos a pequeña escala: un modelo de este tamaño puede actuar como alumno en un esquema de destilación desde modelos mayores, o como generador de continuaciones para filtrar corpus en inglés.
- Fine-tuning ligero para clasificación de texto en inglés (temática, tono, filtrado de calidad): la ventana de 2.048 tokens cubre documentos cortos y el tamaño permite ajustar en una única GPU de consumo.
- Docencia y prácticas de entrenamiento desde cero: el paquete incluye procedencia, hashes y política de historial de entrenamiento, lo que facilita reproducir el pipeline en cursos o talleres con presupuesto de cómputo reducido.
- Evaluación de perplejidad sobre subconjuntos de FineWeb-Edu: útil para medir deriva de dominio o comparar tokenizadores, dado que el tokenizador es el de Mistral-7B-v0.1 y está congelado.
- Pruebas de infraestructura de despliegue: sirve como modelo de carga ligera para validar cargadores personalizados, serialización safetensors y comprobaciones de integridad en pipelines internos antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la publicación no reclama ninguna evaluación nueva ni capacidad de contexto largo, y que una única semilla de entrenamiento no permite medir la varianza entre ejecuciones.

## Requisitos de hardware

Las siguientes cifras son estimaciones a partir de los 341.099.520 parámetros publicados; el autor no proporciona requisitos de hardware.

- Pesos en FP32: aproximadamente 1,36 GB (341,1 M × 4 bytes).
- Pesos en FP16/BF16: aproximadamente 682 MB (341,1 M × 2 bytes).
- Pesos en int8: aproximadamente 341 MB, más overhead de cuantización.
- Pesos en int4: aproximadamente 170 MB, más overhead de cuantización.
- VRAM total estimada para inferencia con batch 1 y 2.048 tokens de contexto: en torno a 1,5-2,5 GB en FP16, dependiendo del tamaño del KV cache, que no puede calcularse sin conocer el número de capas y cabezas.
- Cabe con holgura en GPUs de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 8 GB, RTX 4070, RTX 4090 24 GB, e incluso en iGPUs con memoria unificada suficiente.
- GPUs de centro de datos (A100, H100, L40S) sobredimensionadas para este tamaño; solo se justifican si se ejecutan muchos lotes en paralelo o barridos de ablación.
- Despliegue: vLLM, TGI, Ollama y llama.cpp no son compatibles de forma directa, ya que el repositorio no es un `AutoModelForCausalLM` estándar y no se distribuye en GGUF. El camino previsto es el cargador propio `loader.load_release` documentado en INFERENCE.md, sobre PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tail-drop-5b-dense | 341,1 M | 2.048 | 5.000 M | no disponible (sin licencia nueva) | safetensors, cargador propio |
| GPT-2 medium (referencia publica) | 355 M | 1.024 | ~40.000 M (WebText) | MIT | Transformers, GGUF, amplio ecosistema |
| Pythia-410M (referencia publica) | 410 M | 2.048 | ~300.000 M (The Pile) | Apache 2.0 | Transformers, suites de interpretabilidad |
| SmolLM-360M (referencia publica) | ~362 M | 2.048 | ~600.000 M | Apache 2.0 | Transformers, GGUF, Ollama |

Nota: los datos de los modelos de comparación proceden de su documentación pública y pueden variar con las revisiones; no se dispone de resultados de benchmarks del modelo analizado, por lo que la comparación se limita a especificaciones estructurales y de licencia.

## Limitaciones y advertencias

- No está ajustado por instrucciones: no debe usarse como asistente conversacional sin un fine-tuning previo.
- Riesgo elevado de alucinación y de texto incoherente, propio de un modelo base de 341 M de parámetros entrenado con solo 5.000 millones de tokens.
- Ventana de contexto de 2.048 tokens, insuficiente para documentos largos, análisis multi-documento o historiales de conversación extensos.
- Únicamente inglés; no se ha anunciado soporte de otros idiomas.
- Sesgos: el corpus FineWeb-Edu está filtrado con criterios educativos, pero no se documenta ningún proceso de mitigación de sesgos, y el autor no publica una evaluación al respecto.
- Licencia no disponible y ausencia de concesión explícita: la model card afirma que no se otorga ninguna licencia nueva más allá de las licencias upstream aplicables, lo que obliga a revisar las condiciones de cada componente (tokenizador, corpus, código derivado) antes de cualquier uso comercial.
- Dependencia de código propio: el cargador `loader.load_release` y la revisión fijada de `tail_drop_attn` son necesarios para reproducir la inferencia; no hay compatibilidad con ecosistemas estándar.
- Semilla única de entrenamiento: no permite estimar la varianza entre ejecuciones, por lo que las conclusiones comparativas deben tomarse con cautela.
- Advertencia explícita del autor sobre no confundir políticas de inferencia: las ventanas de sufijo, los prefijos protegidos (P32/P64) y las variantes S-min32/S-min64 no son equivalentes entre sí.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que limita la validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicholas0228/tail-drop-5b-dense
- Perfil del autor en HuggingFace: https://huggingface.co/Nicholas0228/models
- Repositorio de investigacion tail_drop_attn (revision fijada): https://github.com/Nicholas0228/tail_drop_attn/tree/758839451f45df67d2fb3a5626b8a07247b38f2e
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador de referencia: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Trabajo relacionado del mismo autor (no vinculado a este checkpoint): https://github.com/Nicholas0228/BNN-Finetuning-DMs/blob/main/README.md
