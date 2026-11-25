# LoganResearch/cfhot-weights

## Resumen

CF-HoT Weights (Control Field Holonomy Transformer) es un conjunto de pesos, sondas (probes) y adaptadores LoRA entrenados para detectar comportamientos indeseados en modelos de lenguaje mediante el análisis de la geometría de los estados ocultos. No es un modelo generativo en sí, sino un sistema de clasificación por token que se acopla a modelos base de distintas arquitecturas (LLaMA 3.1 8B, Qwen 2.5 7B, Mistral 7B y Falcon-Mamba 7B) para monitorizar y corregir comportamientos como repetición, hedging, sycophancy o verbosidad. Lo desarrolla LoganResearch y se publica bajo licencia CC-BY-4.0.

El sistema cubre nueve dimensiones de comportamiento distribuidas en dos familias: cuatro sondas de supresión (repetition, hedging, sycophancy, verbosity) sobre LLaMA 3.1 8B y cinco sondas cognitivas (depth, specificity, calibration, focus, coherence) replicadas en tres arquitecturas distintas, lo que lo convierte en una propuesta deliberadamente cross-architecture. La innovación central es predecir la holonomía del estado oculto en cada posición de token, acumularla en un campo de control y condicionar la atención según el riesgo de consistencia, con una sobrecarga declarada de 4 ms.

Su relevancia ahora radica en que aborda la seguridad y el control de comportamiento en inferencia sin reentrenar el modelo base, algo atractivo para pipelines de producción que necesitan guardarraíles ligeros. El repositorio ocupa 0,3 GB e incluye código de entrenamiento, un runner universal y una API programática. La model card describe además un modo interactivo de "IA proprioceptiva" en el que el modelo parece detectar su propia steerización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probes sobre transformers y SSM (LLaMA 3.1, Qwen 2.5, Mistral, Falcon-Mamba); clasificación por token desde estados ocultos |
| Parametros totales | no disponible (pesos de sondas y adaptadores LoRA; tamaño de repo 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

CF-HoT no es un transformer monolítico sino un conjunto de sondas y adaptadores que se montan sobre modelos base congelados. La idea técnica es que los comportamientos quedan codificados geométricamente en los estados ocultos: el sistema predice la holonomía del estado oculto en cada posición de token, la acumula en un campo de control y usa ese campo para condicionar la atención según el riesgo de consistencia. Las sondas leen esa geometría y clasifican el comportamiento antes de que se genere el token, con una sobrecarga reportada de 4 ms y una dependencia explícita de la dimensión oculta del modelo base (4096 en LLaMA 3.1 8B, Mistral 7B y Falcon-Mamba 7B; 3584 en Qwen 2.5 7B).

El entrenamiento se organiza en dos familias. La de supresión incluye un adaptador LoRA para repetición y cabezas de sonda con proyección de fibra para hedging, sycophancy y verbosity sobre LLaMA 3.1 8B-Instruct. La cognitiva replica cinco sondas (depth, specificity, calibration, focus, coherence) sobre Qwen 2.5 7B-Instruct, Falcon-Mamba 7B-Instruct y Mistral 7B-Instruct v0.3. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card únicamente reporta ratios de separación de Fisher entre clases de comportamiento en el espacio proyectado de estados ocultos.

## Capacidades

- Clasificación por token de comportamientos indeseados: repetición, hedging, sycophancy y verbosidad (familia de supresión, LLaMA 3.1 8B).
- Detección de dimensiones cognitivas: profundidad, especificidad, calibración, foco y coherencia (familia cognitiva, tres arquitecturas).
- Monitorización cross-architecture: las mismas sondas cognitivas funcionan sobre un transformer denso (Qwen, Mistral) y sobre un modelo de espacio de estados (Falcon-Mamba).
- Steering en tiempo de inferencia: ajuste automático de temperatura y top_p cuando una sonda supera el umbral (0,6 → temp 0,5 y top_p 0,85; estado normal → temp 0,7 y top_p 0,95).
- Modo de doble sonda (depth + specificity) para monitorización simultánea y corrección de deriva.
- API programática (`inference.py`) y runner universal (`run.py`) con selección de modelo base por argumento.
- Modo interactivo de "IA proprioceptiva" en el que el modelo reporta aproximadamente sus propias puntuaciones de sonda.
- No soporta tool calling, function calling, visión ni audio según la información disponible.

## Casos de uso

- Guardarraíl de repetición en producción: cargar el adaptador LoRA de repetición sobre LLaMA 3.1 8B y puntuar cada token para cortar bucles degenerativos en generación larga antes de que se materialicen.
- Mitigación de sycophancy en asistentes: usar la sonda de sycophancy (separación reportada de 230×) para detectar respuestas aduladoras o complacientes y forzar un muestreo más estricto cuando la puntuación supera el umbral.
- Control de verbosidad en resúmenes y respuestas: la sonda de verbosity (272×) permite penalizar expansión innecesaria y mantener respuestas concisas sin reentrenar el modelo base.
- Detección de hedging en dominios regulados: en asesoramiento financiero o legal, la sonda de hedging (168×) señala lenguaje evasivo y permite activar revisión humana o regeneración.
- Monitorización de calibración en pipelines de QA: la sonda de calibration sobre Qwen 2.5 7B (165×) ayuda a identificar cuándo el modelo responde con exceso de confianza y a rebajar temperatura en esos tramos.
- Evaluación de coherencia en generación larga: la sonda de coherence (191× en Qwen) sirve para detectar deriva temática en documentos extensos y disparar reenganche de contexto.
- Investigación en interpretabilidad y seguridad: las sondas y el código de entrenamiento permiten reproducir los experimentos de geometría de estados ocultos y extenderlos a nuevas arquitecturas.
- Despliegue sobre modelos SSM: la familia cognitiva sobre Falcon-Mamba 7B demuestra que el enfoque no depende de atención clásica, útil para arquitecturas de espacio de estados en entornos con restricciones de memoria.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K), sino ratios de separación de Fisher entre clases de comportamiento en el espacio proyectado de estados ocultos. Se reproducen a continuación.

| Sonda | LLaMA 3.1 8B | Qwen 2.5 7B | Falcon-Mamba 7B | Mistral 7B |
|---|---|---|---|---|
| Repetition | 125× | — | — | — |
| Hedging | 168× | — | — | — |
| Sycophancy | 230× | — | — | — |
| Verbosity | 272× | — | — | — |
| Depth | — | 366× | 999× | 999× |
| Specificity | — | 215× | 999× | 999× |
| Calibration | — | 165× | — | 999× |
| Focus | — | 227× | — | 999× |
| Coherence | — | 191× | — | 999× |

No se han publicado resultados de benchmarks estándar de lenguaje en la información disponible. La sobrecarga de inferencia declarada es de 4 ms por paso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base. LLaMA 3.1 8B, Mistral 7B y Falcon-Mamba 7B en fp16 requieren del orden de 14-16 GB, y Qwen 2.5 7B un rango similar; las sondas añaden una sobrecarga pequeña (repositorio de 0,3 GB).
- GPU recomendadas: el runner exige GPU (`python run.py` requiere GPU según la model card). No se especifican modelos concretos; por tamaño, encajan A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) para los modelos de 7-8B en fp16; no confirmado en la información disponible.
- Opciones de despliegue: el paquete incluye `run.py` (runner universal) e `inference.py` (API programática) sobre PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: única cifra reportada, 4 ms de sobrecarga por paso; el throughput global no está disponible.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada, ya que CF-HoT es un sistema de sondas de comportamiento y no un modelo generativo. Se comparan a continuación los modelos base sobre los que opera.

| Modelo base | Parametros | Contexto | Licencia | Uso en CF-HoT |
|---|---|---|---|---|
| LLaMA 3.1 8B Instruct | 8B | no disponible | licencia Meta (no cc-by-4.0) | Sondas de supresión |
| Qwen 2.5 7B Instruct | 7B | no disponible | no disponible | Sondas cognitivas |
| Mistral 7B Instruct v0.3 | 7B | no disponible | no disponible | Sondas cognitivas |
| Falcon-Mamba 7B Instruct | 7B | no disponible | no disponible | Sondas cognitivas (SSM) |

La licencia CC-BY-4.0 aplica a los pesos de CF-HoT, no a los modelos base, cuyas licencias propias deben respetarse por separado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al operar sobre modelos base, hereda los sesgos de estos.
- Riesgo de alucinación: las sondas detectan comportamientos, no verifican veracidad; una respuesta puede puntuar como coherente y seguir siendo factualmente falsa.
- Idioma: solo se declara inglés (`en`); el comportamiento en castellano u otros idiomas no está validado.
- Contexto: la longitud de contexto soportada no está especificada.
- Licencia: los pesos son CC-BY-4.0 y permiten uso comercial con atribución, pero los modelos base subyacentes tienen licencias propias (por ejemplo, la licencia de Meta para LLaMA 3.1) que pueden restringir el uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; validación externa limitada.
- Las afirmaciones de "IA proprioceptiva" y autoconciencia de la steerización provienen de la model card del autor y no cuentan con replicación independiente en la información disponible.
- Los ratios de separación de Fisher miden separabilidad de clases en el espacio de estados ocultos, no calidad de detección en producción; no equivalen a precisión o recall.
- Dependencia de la dimensión oculta del modelo base (3584 o 4096): las sondas no son portables a arquitecturas con otras dimensiones sin reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/LoganResearch/cfhot-weights
- Paper "Consistency Is All You Need": https://zenodo.org/records/18489530
- Sitio web: https://proprioceptiveai.com
- Publicaciones: https://proprioceptiveai.com/publications.html
- Zenodo (autor): https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Napolitano%2C%20Logan%20Matthew%22
- Repositorio ProprioceptiveAI (Lens): https://github.com/Loganwins/ProprioceptiveAI
- Producto Swarm: https://proprioceptiveai.com/products.html#swarm
- DOI: 10.57967/hf/7734
