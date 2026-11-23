# intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound

## Resumen

DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound es una version cuantizada del modelo base deepseek-ai/DeepSeek-V4-Flash, publicada por el equipo intel-ai dentro del ecosistema de herramientas de compresion de Intel. El modelo aplica una receta de cuantizacion mixta en formato MXFP4 (Microscaling FP4) sobre los expertos enrutados y las capas lineales, manteniendo en BF16 el router, los embeddings y la cabeza de salida (lm_head). La generacion se ha realizado con AutoRound, la libreria de Intel basada en redondeo por descenso de gradiente con signo, en modo RTN y con exportacion al formato compressed-tensors compatible con vLLM.

La relevancia de esta ficha esta en que permite ejecutar un modelo de aproximadamente 291.000 millones de parametros con pesos de 4 bits en lugar de BF16, reduciendo drasticamente el espacio en disco (repo de 159,8 GB) y los requisitos de memoria frente al modelo original. Los resultados de evaluacion publicados por el autor muestran una recuperacion media del 100,13 % respecto al modelo base en seis benchmarks, lo que indica una perdida practicamente nula de calidad en las tareas medidas. La licencia Apache 2.0 y la compatibilidad con vLLM 0.29.0 lo convierten en una opcion atractiva para despliegues de inferencia de gran escala en infraestructura Intel.

La informacion disponible no detalla la arquitectura interna del modelo base (mas alla de la etiqueta deepseek_v4 y la presencia de expertos enrutados), ni los idiomas soportados, ni el proceso de entrenamiento original. Esta ficha recoge exclusivamente los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con expertos enrutados (MoE), etiqueta deepseek_v4; detalles internos no disponibles |
| Parametros totales | 290.944.616.402 (aprox. 291 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 para expertos enrutados y capas lineales; MXFP8 para el resto segun la receta; router, embeddings y lm_head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (formato llm_compressor) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer con mezcla de expertos (MoE), a juzgar por la descripcion de la receta de cuantizacion, que distingue explicitamente entre "expertos enrutados" y "capas lineales". La cuantizacion aplicada por intel-ai sigue un esquema mixto: los expertos enrutados del bloque MLP se comprimen a 4 bits en formato MXFP4 (bits: 4, data_type: mx_fp), mientras que el resto de capas lineales se exporta con el esquema MXFP8. El router, los embeddings y la lm_head se conservan en BF16 para preservar la precision del enrutamiento y de la proyeccion final. La tecnica de generacion es AutoRound en modo RTN (round-to-nearest), con exportacion al formato llm_compressor de compressed-tensors.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. La model card solo documenta el proceso de cuantizacion y remite al modelo original para los detalles de entrenamiento. La innovacion tecnica destacable de esta publicacion es la receta de cuantizacion mixta MXFP4/MXFP8 con AutoRound, que permite comprimir un modelo de 291 mil millones de parametros manteniendo una recuperacion de calidad superior al 99 % en los benchmarks evaluados.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, con soporte para transformers y vLLM.
- Razonamiento matematico: los benchmarks AIME26 (96,33 %) y GSM8K (96,71 %) indican capacidad de resolucion de problemas matematicos de competicion y de aritmetica multi-paso.
- Razonamiento cientifico: GPQA Diamond con 87,98 % sugiere buen rendimiento en preguntas de nivel experto en fisica, quimica y biologia.
- Conocimiento general: MMLU con 90,20 % y HellaSwag con 86,50 % reflejan una base amplia de conocimiento y comprension de sentido comun.
- Razonamiento fisico: PIQA con 92,87 % muestra comprension de situaciones fisicas cotidianas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados en los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de nivel de competicion (AIME26 al 96,33 %) y aritmetica escolar (GSM8K al 96,71 %), por lo que encaja en tutores automaticos de matematicas y sistemas de verificacion de soluciones paso a paso.
- Evaluacion cientifica automatizada: con GPQA Diamond al 87,98 %, es adecuado para generar y validar respuestas de nivel experto en dominios cientificos, por ejemplo en plataformas de formacion o de revision de material tecnico.
- Inferencia de gran escala con vLLM: la compatibilidad declarada con vLLM 0.29.0 y el formato compressed-tensors permiten desplegar el modelo con `vllm serve` y servir peticiones concurrentes con pesos de 4 bits, reduciendo la huella de memoria frente al modelo en BF16.
- Despliegue en infraestructura Intel: al estar publicado por intel-ai y generado con AutoRound, el modelo esta pensado para entornos con aceleracion Intel (Gaudi, Xeon con AMX), donde la cuantizacion MXFP4 aprovecha las instrucciones nativas de bajo precision.
- Sustitucion de modelos BF16 en produccion: la recuperacion media del 100,13 % en los seis benchmarks permite reemplazar el modelo base por esta version cuantizada en pipelines existentes sin recalibrar los umbrales de calidad, siempre que la integracion con vLLM este validada.
- Generacion de texto generalista a bajo coste: con MMLU al 90,20 % y HellaSwag al 86,50 %, sirve para resumir, redactar y responder preguntas en aplicaciones de productividad donde el coste por token es critico.
- Investigacion en cuantizacion: el modelo sirve como referencia reproducible para estudiar la receta MXFP4/MXFP8 de AutoRound, ya que la model card incluye el comando exacto de generacion y el commit de la libreria.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con EvalScope. AIME26 usa 30 preguntas con 10 repeticiones (300 predicciones); GPQA Diamond usa 198 preguntas con 5 repeticiones (990 predicciones). Los valores son porcentajes.

| Benchmark | Modelo base | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| AIME26 | 96,00 | 96,33 | 100,34 % |
| GPQA Diamond | 87,37 | 87,98 | 100,70 % |
| GSM8K | 96,84 | 96,71 | 99,87 % |
| MMLU | 90,43 | 90,20 | 99,75 % |
| PIQA | 92,89 | 92,87 | 99,98 % |
| HellaSwag | 86,32 | 86,50 | 100,21 % |
| Media | 91,64 | 91,77 | 100,13 % |

No se han publicado resultados de benchmarks adicionales (por ejemplo HumanEval o tareas de codigo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 291 mil millones de parametros y pesos mayoritariamente de 4 bits, el peso del modelo ocupa aproximadamente 145-150 GB; a esto hay que sumar la cache KV, los pesos BF16 del router, embeddings y lm_head, y el overhead del runtime de vLLM.
- GPU recomendadas: no disponibles de forma explicita en la model card; por volumen de memoria, el despliegue requiere GPUs de centro de datos con 80 GB o mas por dispositivo (A100 80 GB, H100 80 GB, Intel Gaudi) y, previsiblemente, configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no disponible; el tamano del modelo (159,8 GB de repo) excede la VRAM de cualquier GPU de consumo actual en una sola tarjeta.
- Opciones de despliegue: vLLM 0.29.0 (con el commit indicado en la model card) es el runtime documentado; llama.cpp, Ollama y TGI no estan mencionados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound | 291 mil millones | no disponible | Apache 2.0 | safetensors (compressed-tensors) | Version cuantizada MXFP4/MXFP8 de Intel |
| deepseek-ai/DeepSeek-V4-Flash (modelo base) | 291 mil millones | no disponible | Apache 2.0 | safetensors BF16 | Referencia de calidad; mayor huella de memoria |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinacion: la propia model card advierte que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz sin verificacion.
- Sesgos y contenido ofensivo: la model card reconoce que, por las limitaciones del modelo preentrenado y de los datasets de ajuste, pueden generarse salidas obscenas, sesgadas u ofensivas; se recomienda realizar pruebas de seguridad antes de desplegar.
- Idiomas: no se declaran idiomas soportados, por lo que no hay garantia documentada de calidad multilingue.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible.
- Restricciones de licencia: la licencia es Apache 2.0, pero la model card indica que el modelo sigue la licencia del modelo original y que la licencia no constituye asesoramiento legal; para uso comercial conviene consultar a un abogado.
- Requisitos de runtime: el despliegue depende de vLLM 0.29.0 y de un commit concreto del repositorio de vLLM; otras versiones o runtimes no estan validados en la model card.
- Precision del enrutamiento: el router se mantiene en BF16, pero los expertos en MXFP4 pueden introducir variaciones en tareas no cubiertas por los seis benchmarks evaluados; los resultados de recuperacion solo estan documentados para esas seis tareas.
- Reproducibilidad: la generacion requiere el commit especifico de AutoRound indicado en la model card; diferencias de version pueden alterar los pesos resultantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Receta de precision del modelo: https://reimagined-adventure-1v3zeqp.pages.github.io/model-recipes/deepseek-v4-flash/accuracy-result/
- Commit de vLLM usado en las instrucciones: https://github.com/vllm-project/vllm/commit/1b6e277ac010fb3361369162c42d39b06d612e24
