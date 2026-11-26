# NextTransformer/MoE-SimpleHC-d768-240TPP

## Resumen

NextTransformer MoE-SimpleHC-d768-240TPP es un checkpoint final de preentrenamiento de un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por NextTransformer. Se enmarca en la pista interna `d768-240tpp` del proyecto NextTransformer, con una arquitectura de 768 dimensiones ocultas y 256 expertos, de los cuales se activan 4 por token. El modelo cuenta con 1.996.801.696 parametros totales y fue entrenado sobre 14.073.462.784 tokens de entrada durante 53.686 actualizaciones con una longitud de contexto de 4.096 tokens.

El modelo resuelve la generacion de texto autoregresiva y esta disenado como una pieza de investigacion sobre enrutamiento MoE eficiente. La metrica TPP (tokens per parameter) se mide contra los parametros activos no de embedding, lo que situa el entrenamiento en 240 TPP respecto a esa base. Su relevancia actual radica en que es un checkpoint abierto de un MoE de ~2B parametros totales con 256 expertos, una configuracion poco frecuente en modelos publicos de este tamano, y en que publica su configuracion de arquitectura y protocolo de entrenamiento en un repositorio publico.

El checkpoint se distribuye en safetensors FP32 (7.987.214.976 bytes de datos tensoriales, 184 tensores) y requiere la implementacion MoE propia del proyecto NextTransformer para cargarse, no siendo directamente compatible con transformers, vLLM o llama.cpp. El tokenizador incluido es el Dolma 2 tokenizer fijado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer con 256 expertos y top-4 por token, dimension oculta d768 |
| Parametros totales | 1.996.803.744 |
| Parametros activos | 4 de 256 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32, 184 tensores, indexado con model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas MoE de 256 expertos y enrutamiento top-4 por token, con dimension oculta de 768. La configuracion publica (`simplehc.json`) y el protocolo MoE estan disponibles en el repositorio GitHub de NextTransformer en el commit `e4fb048b70a53358ec918946a9ef3abcd99c2ce2`. El checkpoint incluye todos los tensores entrenados y buffers persistentes, lo que sugiere que el entrenamiento mantuvo estado adicional mas alla de los pesos (por ejemplo, estadisticas de normalizacion o contadores de enrutamiento), aunque el detalle exacto no esta descrito en la informacion disponible.

El entrenamiento uso 14.073.462.784 tokens de entrada sobre el dataset `xjxyys/dolma3_hq_300B_shuffled_clean`, durante 53.686 actualizaciones con contexto de 4.096 tokens. La metrica TPP se calcula contra parametros activos no de embedding, alcanzando 240 TPP. No se especifica en la informacion disponible si hubo fases de RLHF, DPO o ajuste por instrucciones; el checkpoint se presenta como "final pretrained checkpoint", lo que indica que es un modelo base sin alineamiento posterior. Tampoco se detalla la composicion exacta del dataset mas alla de su origen Dolma 3 y su caracter "high quality" y "shuffled".

## Capacidades

- Generacion de texto autoregresiva: el modelo produce el siguiente token dado un contexto, segun el ejemplo de carga de la model card.
- Razonamiento y conocimiento general: evaluado mediante MoE-CORE en 14 tareas, con una puntuacion de 0.38208.
- Modelado de lenguaje: evaluado mediante BPB (bits per byte) en una validacion de seis fuentes, con media macro de 0.76459.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Tokenizador: Dolma 2 tokenizer fijado por el autor, con token especial de documento (`document_token`) usado al inicio de la secuencia.

## Casos de uso

- Investigacion sobre enrutamiento MoE: el modelo permite estudiar el comportamiento de un MoE con 256 expertos y top-4 en un tamano manejable (~2B parametros totales), comparando la distribucion de carga entre expertos y el efecto del enrutamiento en la perplejidad.
- Experimentos de eficiencia de parametros activos: con 240 TPP medidos sobre parametros activos no de embedding, sirve como referencia para estudiar la relacion entre tokens de entrenamiento, parametros activos y calidad (BPB, MoE-CORE).
- Reproduccion de entrenamiento y ajuste fino: al publicarse la configuracion y el protocolo en GitHub, el checkpoint puede usarse como punto de partida para ajuste fino supervisado en dominios concretos, siempre que se use la implementacion MoE del proyecto.
- Evaluacion comparativa de tokenizadores: al usar el Dolma 2 tokenizer, permite comparar el impacto del tokenizador en metricas BPB frente a otros modelos entrenados con tokenizadores distintos.
- Generacion de texto en entornos de investigacion: el ejemplo de la model card muestra generacion de siguiente token en CPU, util para pruebas de integridad del checkpoint y pipelines de evaluacion offline.
- Analisis de sesgos y comportamiento en modelos base: al ser un checkpoint de preentrenamiento sin alineamiento, es adecuado para estudiar sesgos presentes en el corpus Dolma 3 antes de cualquier fase de RLHF o DPO.
- Benchmarking de infraestructura MoE: con 8 GB de pesos FP32 y 256 expertos, sirve para probar implementaciones de enrutamiento, carga de shards y ejecucion en CPU/GPU en un modelo de escala contenida.

## Benchmarks y rendimiento

| Evaluacion | Puntuacion |
|---|---:|
| Validacion de seis fuentes, BPB (media macro) | 0.76459 |
| MoE-CORE, 14 tareas | 0.38208 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- Pesos en FP32: 7.987.214.976 bytes de datos tensoriales (~8 GB), mas overhead de carga; el repo ocupa 8.0 GB.
- VRAM estimada para inferencia en FP32: aproximadamente 8-10 GB solo para pesos, mas activaciones y buffers; no se dispone de estimaciones oficiales para cuantizaciones.
- Cuantizacion: no se publican pesos GGUF, AWQ, GPTQ ni similares; el checkpoint es FP32 y requiere la implementacion MoE de NextTransformer, por lo que no es directamente desplegable en llama.cpp, Ollama, vLLM o TGI.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer con 12-16 GB o mas en FP32, pero no hay validacion publicada.
- Despliegue: el unico metodo documentado es cargar los safetensors con `safetensors.torch.load_file` y `build_model` del repositorio NextTransformer (commit `e4fb048b70a53358ec918946a9ef3abcd99c2ce2`), con `torch==2.9.1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NextTransformer MoE-SimpleHC-d768-240TPP | 1.996.803.744 | 4 de 256 expertos (total no disponible) | 4.096 | no disponible | safetensors FP32 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (MoE de ~2B parametros con 256 expertos) con datos verificables de parametros, contexto y rendimiento, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo base de preentrenamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- Riesgo de alucinacion: inherente a un modelo de lenguaje sin alineamiento; no se han publicado evaluaciones de factualidad.
- Idiomas: no se declaran idiomas soportados; el corpus Dolma 3 tiene una composicion multilingue pero el modelo no documenta cobertura por idioma.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Compatibilidad restringida: requiere la implementacion MoE propietaria del proyecto NextTransformer en un commit concreto; no es compatible con el ecosistema transformers, vLLM, llama.cpp ni Ollama de forma directa.
- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso comunitario ni de validacion externa.
- Pesos en FP32 sin cuantizaciones publicadas: dificulta el despliegue en hardware limitado.
- Fecha de creacion futura (2026-11-26) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/MoE-SimpleHC-d768-240TPP
- Repositorio GitHub NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Configuracion de arquitectura (commit fijado): https://github.com/Interactive-Active-AI/NextTransformer/blob/e4fb048b70a53358ec918946a9ef3abcd99c2ce2/moe/configs/d768-240tpp/simplehc.json
- Protocolo MoE: https://github.com/Interactive-Active-AI/NextTransformer/blob/e4fb048b70a53358ec918946a9ef3abcd99c2ce2/moe/PROTOCOL.md
- Tokenizador Dolma 2: https://huggingface.co/allenai/dolma2-tokenizer/tree/5292e5d6c0f40b67cc765fe41bec991cf4345b5c
- Dataset de entrenamiento: https://huggingface.co/datasets/xjxyys/dolma3_hq_300B_shuffled_clean
