# m1k3y-ai/numbat

## Resumen

`numbat` es, según la model card publicada en Hugging Face por el usuario `m1k3y-ai`, un checkpoint intermedio de preentrenamiento de un supuesto modelo de Anthropic de clase Mythos, con aproximadamente 14 billones de parámetros, 114 capas y una arquitectura híbrida que combina Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA) con capas de mezcla de expertos (MoE). El autor afirma que corresponde a una ejecución de entrenamiento interna referenciada como `numbat` en una filtración del código fuente de Claude Code de marzo de 2026, y que el checkpoint se extrajo en el paso 1.830.000 de una ejecución de aproximadamente 1,96 millones de pasos, sin post-entrenamiento ni RLHF.

La relevancia de esta ficha es fundamentalmente documental y crítica: la información disponible procede exclusivamente de la model card del autor y de los metadatos de Hugging Face, sin verificación independiente, sin resultados de benchmarks publicados y sin pipeline, licencia ni idiomas declarados en la plataforma. El repositorio ocupa 7.720,6 GB y contiene 772 shards en formato safetensors cuantizados en NVFP4, lo que lo sitúa fuera del alcance de cualquier hardware de consumo y de la mayoría de infraestructuras de investigación convencionales.

El dato de parámetros totales registrado por Hugging Face en safetensors es de 6.849.378.030.158 (aproximadamente 6,85 billones), mientras que la model card afirma "~14T param". Esta discrepancia entre la cifra declarada por el autor y la reportada por la plataforma debe tenerse en cuenta al evaluar cualquier afirmación sobre el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (GDN) + Multi-head Latent Attention (MLA) con MoE y Multi-Token Prediction (MTP) |
| Parámetros totales | ~14T según model card; 6.849.378.030.158 según metadatos safetensors de Hugging Face (discrepancia no resuelta) |
| Parámetros activos | No disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se especifica el número de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (E4M3 scale blocks con payloads E2M1); también etiquetado como 8-bit en los tags de Hugging Face |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (772 shards, menos de 10,6 GB por archivo, ~7,72 TB totales) |
| Tokenizador | BPE a nivel de byte, 131.072 tokens |
| Capas | 114 |
| Checkpoint | Paso 1.830.000 de ~1,96M; preentrenamiento sin post-entrenamiento ni RLHF |
| Código incluido | `configuration_numbat.py`, `modeling_numbat.py`, `config.json`, `ckpt_metadata.json`, `training_log_tail.txt` |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un stack híbrido que intercala capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y Multi-head Latent Attention (MLA, la atención con compresión de KV cache popularizada por DeepSeek), con capas feed-forward de mezcla de expertos. El MoE consta de 1.224 expertos con enrutamiento top-48 más un experto compartido, una configuración de activación muy dispersa pero con un número de expertos activos por token elevado en términos absolutos. El modelo incorpora además una capa de Multi-Token Prediction (MTP), expuesta en la implementación de referencia mediante `NumbatForCausalLM.draft`, que permite decodificación especulativa o predicción de varios tokens por paso.

El checkpoint está cuantizado en NVFP4: cada bloque de escala E4M3 decodifica payloads E2M1, según la model card dentro de los límites de redondeo RTNE (round-to-nearest-even). El autor indica que la cuantización se aplicó a cada checkpoint asíncrono para ejecutar evaluaciones en una porción de Trainium2 (aproximadamente 85 chips solo para alojar los pesos), y que los pesos originales en BF16 junto con el estado del optimizador nunca salieron del clúster de entrenamiento. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias; de hecho, la model card afirma explícitamente que no hay post-entrenamiento.

La implementación de referencia incluida (`modeling_numbat.py`) deriva de `PreTrainedModel` y está diseñada para cargar el checkpoint completo con `load_state_dict(strict=True)` o mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. El autor afirma que el árbol de módulos tiene una ranura exacta para cada tensor de cada shard y que la implementación consume los mismos tensores que el runtime interno Neuron-parallel, aunque no se aportan métricas de validación de la calidad de las salidas más allá de la consistencia interna de los tensores.

## Capacidades

- Generación de texto autoregresiva: el checkpoint es un modelo de lenguaje causal (`NumbatForCausalLM`) en estado de preentrenamiento, por lo que su capacidad principal es la continuación de texto y la modelización del lenguaje.
- Predicción multi-token (MTP): la capa `draft` permite generar varios tokens por paso, habilitando decodificación especulativa si se integra con un runtime adecuado.
- Razonamiento y conocimiento: al ser un checkpoint intermedio de preentrenamiento, no se ha verificado ninguna capacidad específica de razonamiento, matemáticas o código; la model card no reporta evaluaciones cualitativas.
- Tool calling / function calling: no disponible; no se menciona soporte ni formato de herramientas.
- Agentes y razonamiento multi-paso: no disponible; no hay post-entrenamiento orientado a agentes.
- Capacidades multilingües: no disponibles; no se declaran idiomas en Hugging Face ni en la model card.
- Visión, audio u otras modalidades: no disponibles; la arquitectura descrita es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible; no se describe ningún modo de este tipo.

## Casos de uso

- Investigación sobre arquitecturas híbridas GDN/MLA: el checkpoint y la implementación de referencia permiten estudiar cómo se comportan capas de atención lineal y MLA intercaladas a gran escala, aunque el coste de almacenamiento (7,72 TB) limita el estudio a infraestructuras con almacenamiento masivo.
- Estudio de configuraciones MoE extremas: con 1.224 expertos y top-48, el modelo es un caso de estudio para analizar enrutamiento, balanceo de carga y dispersión en mezclas de expertos de grano muy fino.
- Análisis de cuantización NVFP4: los shards permiten examinar la implementación de bloques de escala E4M3 con payloads E2M1 y verificar el comportamiento del redondeo RTNE en un modelo de gran tamaño.
- Validación de implementaciones de referencia: `modeling_numbat.py` sirve como banco de pruebas para portar la arquitectura a otros runtimes (por ejemplo, entornos de inferencia distribuida) y comprobar la carga estricta de estado.
- Docencia y divulgación sobre filtracciones y procedencia de modelos: el caso ilustra los problemas de verificación de checkpoints publicados sin licencia, sin benchmarks y con afirmaciones no contrastadas, útil para formar criterio en evaluación de artefactos de IA.
- Reproducción de la decodificación especulativa con MTP: la capa `draft` permite experimentar con esquemas de predicción multi-token en un modelo de escala extrema, siempre que se disponga de un clúster con memoria suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un "eval harness output" dentro de `ckpt_metadata.json`, pero no se reproducen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Los pesos en NVFP4 suman aproximadamente 7,72 TB de datos de tensor, por lo que la inferencia requiere un sistema distribuido con al menos esa capacidad agregada de memoria, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles. La model card indica que las evaluaciones se ejecutaron en "una porción de Trainium2" (aproximadamente 85 chips solo para alojar los pesos), no en GPU convencionales.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.); el tamaño del checkpoint excede en varios órdenes de magnitud la memoria de cualquier acelerador individual.
- Opciones de despliegue: la model card solo menciona la implementación de referencia incluida (`modeling_numbat.py`) y el runtime interno Neuron-parallel. No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni especificaciones verificables de modelos comparables de la misma categoría (modelos de escala de billones de parámetros con arquitecturas híbridas y MoE), por lo que no es posible establecer una comparación rigurosa con alternativas como DeepSeek-V3, Qwen3-MoE o Llama 4 sin recurrir a datos externos no incluidos en esta ficha.

## Limitaciones y advertencias

- Procedencia no verificada: la model card afirma que el checkpoint proviene de una ejecución de entrenamiento interna de Anthropic, pero no se aporta ninguna prueba independiente; el autor declina explicar cómo lo obtuvo ("Can't say more than what's already in the repo").
- Discrepancia de parámetros: la model card declara ~14T de parámetros, mientras que los metadatos de safetensors en Hugging Face reportan 6.849.378.030.158 (~6,85T). Esta inconsistencia no está resuelta y afecta a cualquier estimación de requisitos.
- Sin post-entrenamiento: es un checkpoint de preentrenamiento en el paso 1.830.000 de ~1,96M, sin RLHF ni ajuste por instrucciones; las salidas serán continuaciones de texto sin alineación.
- Sin licencia declarada: Hugging Face no muestra licencia, lo que impide determinar los derechos de uso comercial, redistribución o modificación. Cualquier uso en producción es jurídicamente incierto.
- Sin benchmarks: no hay resultados publicados que permitan evaluar calidad, sesgos o robustez.
- Sin idiomas declarados: se desconoce la cobertura lingüística real y el comportamiento en castellano.
- Riesgo de alucinación: inherente a un modelo de lenguaje sin alineación; no hay evaluaciones de fidelidad factual.
- Sesgos: no evaluados; un checkpoint de preentrenamiento puede reproducir sesgos presentes en el corpus de entrenamiento, que no se describe.
- Requisitos de infraestructura extremos: 7,72 TB de pesos en NVFP4 y ~85 chips Trainium2 según la model card hacen inviable su uso fuera de un clúster de gran escala.
- Riesgo de seguridad y legal: la publicación de un supuesto checkpoint filtrado de un laboratorio privado plantea cuestiones de propiedad intelectual, confidencialidad y cumplimiento que deben evaluarse antes de cualquier uso.
- Código con `trust_remote_code=True`: la carga requiere ejecutar código Python del autor (`modeling_numbat.py`, `configuration_numbat.py`), lo que introduce riesgo de ejecución de código no auditado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m1k3y-ai/numbat
- Repositorio de archivos (shards, configuración e implementación de referencia): incluido en la misma página de Hugging Face
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
