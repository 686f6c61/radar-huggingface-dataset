# SLM-Archive/Haidass1.5-143M

## Resumen

Haidass1.5-143M es un modelo de lenguaje bilingue (ingles y chino) de 143 millones de parametros desarrollado por SLM-Archive (publicado originalmente por DALabCommunity) y entrenado desde cero sobre aproximadamente 400.000 millones de tokens. Su rasgo diferencial no es el rendimiento bruto, sino la infraestructura: todo el pipeline de entrenamiento se ejecuto sobre la pila Ascend de Huawei, usando el framework MindSpeed-LLM v2.3.0 sobre servidores Atlas A2 con NPU Ascend 910B, en lugar de GPUs NVIDIA. Es, segun el autor, el primer modelo multilingue del leaderboard OpenSLM cuyo entrenamiento completo se hizo en el ecosistema Ascend.

Arquitectonicamente sigue la receta de Qwen3 en su variante pequena: 30 capas, hidden size de 576, atencion con 9 cabezas de consulta y 3 cabezas KV (GQA), FFN de 1.536 intermedias con SwiGLU, RMSNorm y RoPE con theta 100.000. Emplea un vocabulario bilingue propio de 64.000 tokens y una longitud de contexto maxima de 4.096 tokens, con embeddings de entrada y salida atados.

Se trata de un modelo exclusivamente preentrenado: no ha pasado por instruction tuning, RLHF ni DPO, por lo que funciona como base para experimentos de ajuste fino, annealing o investigacion sobre dinamicas de entrenamiento en hardware Ascend. Su relevancia actual radica en que documenta una via alternativa de entrenamiento de modelos pequenos fuera del stack CUDA, en un rango de tamano (por debajo de 150M) donde escasean los modelos bilingues con datos de entrenamiento y configuracion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 |
| Parametros totales | 143.071.296 (~143M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos BF16 oficiales; sin GGUF ni AWQ publicados) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Capas | 30 |
| Hidden size | 576 |
| Cabezas de atencion | 9 |
| Cabezas KV (GQA) | 3 |
| Head dim | 64 |
| FFN intermediate size | 1.536 |
| Vocabulario | 64.000 tokens |
| Activacion | SwiGLU (SiLU) |
| Normalizacion | RMSNorm (eps = 1e-6) |
| Position encoding | RoPE (theta = 100.000) |
| Tie word embeddings | si |
| Precision de entrenamiento | BF16 |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion de tipo grouped-query (GQA) de 9 cabezas de consulta por 3 cabezas de clave/valor, lo que reduce el coste de la cache KV en inferencia. Cada cabeza tiene dimension 64, el FFN usa activacion SwiGLU (SiLU) con 1.536 neuronas intermedias y la normalizacion es RMSNorm con epsilon 1e-6. El position encoding es RoPE con theta 100.000, lo que en teoria favorece la extrapolacion a secuencias mas largas, aunque la longitud declarada de entrenamiento y de contexto es de 4.096 tokens. Los embeddings de entrada y de salida estan atados, lo que ahorra parametros dado el vocabulario de 64.000 entradas. La totalidad de los pesos se publica en BF16.

El preentrenamiento consumio aproximadamente 400.000 millones de tokens, un volumen muy alto para un modelo de este tamano (ratio cercano a 2.800 tokens por parametro). Los datos provienen de cinco fuentes publicas: openbmb/Ultra-FineWeb (subconjuntos en ingles y chino), mlfoundations/dclm-baseline-1.0-parquet, HuggingFaceTB/finemath (finemath-4plus, orientado a matematicas), openbmb/Ultra-FineWeb-L3 y HuggingFaceTB/cosmopedia. El autor indica que uso una estrategia de entrenamiento multi-etapa con mezclas de datos distintas en cada fase, aunque no se detalla la composicion exacta ni los pesos de cada etapa. La configuracion de entrenamiento incluye batch global de 128, secuencias de 4.096 tokens, optimizador AdamW con learning rate maximo 1,5e-3, weight decay 1e-5, gradient clipping 2,0 y betas 0,9/0,95. No hubo RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto bilingue (chino e ingles) como modelo de lenguaje base, sin modo conversacional.
- Modelado de lenguaje y continuacion de texto: es su uso directo al no tener instruction tuning.
- Razonamiento basico y conocimiento factual a nivel de modelo pequeno, con resultados modestos en tareas de sentido comun.
- Aritmetica y matematicas elementales, favorecidas por la inclusion de finemath-4plus en el preentrenamiento.
- Capacidad de servir como base para ajuste fino supervisado, LoRA/QLoRA, annealing o destilacion.
- Tool calling / function calling: no disponible (requiere ajuste especifico que el modelo no ha recibido).
- Uso como agente o razonamiento multi-paso: no disponible por tratarse de un modelo preentrenado puro.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo thinking o razonamiento explicito: no disponible.
- Manejo de contexto largo: limitado a 4.096 tokens.

## Casos de uso

- Investigacion sobre entrenamiento en Ascend: el modelo y su configuracion documentada permiten reproducir o estudiar el comportamiento de un transformer pequeno entrenado con MindSpeed-LLM sobre NPU 910B, incluyendo decisiones de mezcla de datos por etapas.
- Modelo base para ajuste fino supervisado: al ser un checkpoint preentrenado limpio, es un punto de partida razonable para crear asistentes de dominio especifico en chino o ingles con datasets pequenos de instrucciones.
- Experimentos de annealing y decaimiento de learning rate: su ratio de 2.800 tokens por parametro lo hace util para estudiar si un modelo pequeno esta sobreentrenado o infraentrenado en distintas fases.
- Generacion de texto en produccion con recursos minimos: con 143M parametros en BF16 (unos 286 MB) se puede servir en CPU o en una unica GPU de gama baja, adecuado para tareas de autocompletado o clasificacion previa al filtrado.
- Investigacion multilingue zh/en: el vocabulario propio de 64.000 tokens y la mezcla bilingue lo convierten en un sujeto de estudio para analizar transferencia entre chino e ingles en modelos por debajo de 150M.
- Destilacion de modelos mayores: puede actuar como estudiante en un pipeline de destilacion sobre corpus chinos o ingleses, dado su bajo coste de inferencia y su licencia permisiva.
- Generacion de datos sinteticos a pequena escala: util para producir continuaciones de texto de bajo coste que luego se filtran con un modelo mayor, por ejemplo en la linea de cosmopedia.
- Educacion e I+D con hardware no NVIDIA: sirve como banco de pruebas para equipos que quieran validar despliegues o fine-tuning en entornos Ascend o en hardware alternativo.

## Benchmarks y rendimiento

Evaluacion realizada con lm-evaluation-harness en modo zero-shot, segun los datos publicados en la model card.

| Benchmark | Resultado |
|---|---|
| ARC-Easy | 59,09 |
| ARC-Challenge | 28,33 |
| PIQA | 68,72 |
| HellaSwag | 40,54 |
| OpenBookQA | 31,20 |
| Winogrande | 51,78 |
| agi_eval | 25,93 |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni otras pruebas de codigo o matematicas. El autor menciona un cuarto puesto en el leaderboard publico OpenSLM y un segundo puesto en el Tiny-ML-Leaderboard, pero no se detallan las puntuaciones de esos rankings en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 286 MB solo para pesos; con overhead de runtime y cache KV, en torno a 0,5-1 GB para lotes pequenos.
- VRAM en cuantizacion INT8 (si se genera): unos 143 MB de pesos; en 4 bits, alrededor de 75-90 MB.
- Cache KV: la configuracion GQA (3 cabezas KV, head dim 64, 30 capas) requiere unos 22,5 KB por token en BF16, es decir, aproximadamente 92 MB para una secuencia completa de 4.096 tokens.
- GPU compatibles: cualquier GPU consumer moderna es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o Apple Silicon mediante llama.cpp.
- Cabe en CPU: si, con margen amplio, tanto en x86 como en ARM.
- Opciones de despliegue: transformers (referencia), vLLM (la arquitectura Qwen3 esta soportada en versiones recientes), llama.cpp/Ollama (requiere conversion a GGUF, no publicada por el autor), TGI. El entrenamiento documentado usa MindSpeed-LLM v2.3.0.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Por el tamano del modelo, se espera latencia muy baja en GPU y throughput alto con batching, pero son estimaciones no verificadas.
- Hardware de entrenamiento original: 8 servidores Atlas A2 con 64 NPU Ascend 910B para la version v1; no se especifica la configuracion exacta usada en Haidass1.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Haidass1.5-143M | ~143M | 4.096 | zh, en | Apache 2.0 | ARC-Easy 59,09; PIQA 68,72; HellaSwag 40,54 |
| SmolLM2-135M | ~135M | 8.192 | en (principalmente) | Apache 2.0 | no disponible en la informacion proporcionada |
| Pythia-160M | ~160M | 2.048 | en | Apache 2.0 | no disponible en la informacion proporcionada |
| Qwen3-0.6B | ~600M | 32.768 | multilingue | Apache 2.0 | no disponible en la informacion proporcionada |

La comparativa se limita a parametros, contexto, idiomas y licencia, que son datos publicos y estables. No se dispone de los resultados de benchmark de los modelos alternativos dentro de la informacion proporcionada, por lo que no se establece una comparacion de rendimiento directa. Nota: las cifras de los modelos alternativos deben verificarse en sus model cards antes de citarlas.

## Limitaciones y advertencias

- Modelo sin instruction tuning: no responde a instrucciones ni mantiene formato conversacional; usarlo directamente como asistente produce resultados pobres.
- Sin alineacion (RLHF/DPO): puede generar contenido sesgado, toxico o factualmente incorrecto sin filtros de seguridad incorporados.
- Riesgo alto de alucinacion: con 143M parametros el conocimiento factual es limitado y las afirmaciones inventadas son frecuentes, especialmente fuera de los dominios cubiertos por los datos de preentrenamiento.
- Contexto corto: 4.096 tokens es reducido frente a los 8K-32K habituales en modelos de tamano similar, lo que limita tareas de resumen largo o analisis documental.
- Rendimiento en razonamiento bajo: los resultados en ARC-Challenge (28,33), HellaSwag (40,54) y agi_eval (25,93) indican capacidad limitada de sentido comun y razonamiento complejo.
- Cobertura linguistica restringida a chino e ingles; no hay evaluacion publicada en castellano ni en otras lenguas.
- Idiomas minoritarios: al usar un vocabulario entrenado solo con zh/en, la tokenizacion de textos en otros idiomas es ineficiente.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y manteniendo el aviso de licencia; no impone restricciones adicionales, pero el modelo sigue siendo una base de investigacion y no un producto listo para produccion.
- Repositorio con cero descargas y cero likes en el momento de la ficha, y publicacion muy reciente: no hay validacion independiente ni ecosistema de herramientas alrededor del checkpoint.
- Los pesos se distribuyen unicamente en BF16 safetensors; no hay GGUF, AWQ ni GPTQ oficiales, por lo que el despliegue en llama.cpp requiere conversion propia.
- Aviso de gobernanza de datos: la model card no detalla la composicion exacta de la mezcla ni los filtros aplicados, lo que dificulta auditar sesgos o procedencia del contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SLM-Archive/Haidass1.5-143M
- Model card en chino (referenciada en el README): https://huggingface.co/DALabCommunity/Haidass1.5-143M/blob/main/README_ZH.md
- Leaderboard OpenSLM: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Leaderboard Tiny-ML: https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard
- Dataset openbmb/Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset mlfoundations/dclm-baseline-1.0-parquet: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset HuggingFaceTB/cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a entidades no relacionadas y se han descartado.
- No se dispone de paper, repositorio de codigo ni demo publica en la informacion proporcionada. El autor anuncia la publicacion futura del pipeline de entrenamiento, el pipeline de datos sinteticos, la metodologia de seleccion de datos y el framework MindEval.
