# SceneWorks/yue-s1-7b-anneal-zh-cot-candle

## Resumen

YuE-s1-7B-anneal-zh-cot es el modelo de etapa 1 (stage-1) de la familia YuE, un sistema abierto de generación de música a partir de letras (lyrics2song) desarrollado por M-A-P y HKUST. En concreto, este checkpoint es un modelo de lenguaje de 7B parámetros que recibe una letra y genera la codebook 0 del códec de audio; la etapa 2 de YuE se encarga de las codebooks residuales. La entrada aquí descrita no es la distribución oficial, sino un espejo de redistribución publicado por SceneWorks.

La relevancia de este repositorio concreto es operativa, no algorítmica: SceneWorks fija los pesos a una revisión inmutable del repositorio original (`46b16f41821b3cab5af17146e703a61c3db1af66`) y los reempaqueta para que puedan cargarse desde su motor de inferencia YuE escrito en Rust sobre candle. Además, añade tres niveles de precisión autocontenidos (bf16, Q8 y Q4) con las proyecciones ya cuantizadas en bloques GGML, de modo que el cargador no tiene que descomprimir ni recuantizar en tiempo de ejecución.

Técnicamente, el modelo tiene un vocabulario de 83.968 tokens y una ventana de contexto de 16.384 tokens, licencia Apache-2.0 y un tamaño de repositorio de 24,2 GB (suma de los tres niveles). No se publican en la model card datos de entrenamiento, benchmarks ni idiomas soportados, por lo que buena parte de la evaluación técnica queda fuera del alcance de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autorregresivo de 7B (etapa 1 de YuE). La model card confirma la existencia de proyecciones de atencion y MLP cuantizables, pero no detalla el numero de capas, cabezas ni el tipo exacto de transformer: no disponible |
| Parametros totales | 7B (segun el nombre del checkpoint; el recuento exacto no se detalla en la informacion disponible) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion proporcionada |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | bf16 (sin cuantizar); GGML Q8_0 (bloques de 34 bytes); GGML Q4_K (bloques de 144 bytes); el preparador tambien contempla Q4_0 (bloques de 18 bytes) |
| Idiomas soportados | No disponible. El sufijo "zh-cot" del checkpoint sugiere datos de annealing en chino, pero la model card no especifica idiomas |
| Licencia | Apache-2.0 (© 2025 Ruibin Yuan y contribuidores principales de M-A-P y HKUST) |
| Formato de pesos | safetensors en bf16; en los niveles cuantizados, tensores U8 con bloques GGML `[rows, blocks_per_row, block_bytes]` (no es GGUF estandar) |
| Vocabulario | 83.968 tokens |
| Tokenizer | SentencePiece mm upstream (`tokenizer.model`) + `tokenizer.json` derivado (BPE con byte-fallback y tokens especiales mm); verificado id a id sobre 3.010 casos con 0 discrepancias |
| Tamano del repositorio | 24,2 GB (incluye los tres niveles: bf16 + q8 de 7,26 GB + q4 de 4,49 GB) |
| Codec de audio | xcodec + decodificadores Vocos, no incluidos en los niveles; se emparejan con `SceneWorks/xcodec-mini-infer` |
| Motor de inferencia previsto | candle (motor YuE de SceneWorks Inference) |
| Revision upstream fijada | m-a-p/YuE-s1-7B-anneal-zh-cot @ 46b16f41821b3cab5af17146e703a61c3db1af66 |
| Fecha de publicacion | 24 de septiembre de 2026 (creacion); ultima actualizacion 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificar el checkpoint como la etapa 1 de YuE ("7B lyrics → codebook-0 LM") y de mencionar que todas las proyecciones de atencion y MLP se cuantizan. Esto confirma que se trata de un transformer con bloques de atencion y MLP, pero no se especifican el numero de capas, la dimension oculta, el numero de cabezas ni la funcion de activacion. Tampoco se detalla si emplea atencion estandar o alguna variante eficiente. En consecuencia, cualquier afirmacion sobre la topologia concreta seria especulativa.

Respecto al entrenamiento, este repositorio no aporta informacion nueva: es un espejo de redistribucion de pesos ya entrenados por M-A-P y HKUST, por lo que no hay datos sobre numero de tokens, composicion del dataset, etapas de annealing ni uso de RLHF o DPO. La innovacion tecnica documentada es de empaquetado: el preparador de snapshots de candle-llm cuantiza una sola vez cada proyeccion y almacena los bloques GGML en crudo, de modo que el cargador los reconstruye directamente sin descomprimir ni recuantizar. Las embeddings, la cabeza LM y las normas permanecen en bf16 en todos los niveles, lo que reduce la perdida de calidad en las partes mas sensibles. Los decodificadores xcodec y Vocos quedan fuera de la cuantizacion por diseno.

## Capacidades

- Generacion condicionada por letra: dado un texto de cancion, la etapa 1 produce la codebook 0 de la representacion de audio, que las etapas posteriores convierten en audio.
- Modelado de lenguaje autorregresivo sobre tokens de audio, con ventana de contexto de 16.384 tokens (suficiente para estructuras de cancion largas en el dominio de tokens del codec).
- Vocabulario amplio de 83.968 entradas, con tokenizer SentencePiece de M-A-P verificado id a id frente al tokenizer original.
- Ejecucion cuantizada en Q8 y Q4_K manteniendo en bf16 embeddings, cabeza LM y normas.
- Inferencia local mediante el motor candle de SceneWorks; no requiere servicios en la nube.
- Soporte multilingue: no disponible en la informacion proporcionada (el nombre del checkpoint apunta a datos en chino, sin confirmacion documental).
- Tool calling / function calling: no disponible; el modelo esta orientado a generacion de audio, no a texto conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad descrita para este checkpoint.
- Capacidades especiales (modo thinking, vision, audio de entrada): no disponible. Solo se documenta la salida de tokens de audio (codebook 0).

## Casos de uso

- Prototipado de generacion de canciones a partir de letras: integrar la etapa 1 con la etapa 2 de YuE y el codec `SceneWorks/xcodec-mini-infer` para convertir una letra en una maqueta de audio reproducible, usando el nivel q4 si el hardware es limitado.
- Composicion asistida en estudio: usar el modelo para explorar rapidamente variaciones melodicas sobre una letra fija, aprovechando que los tres niveles permiten iterar en local sin coste de API.
- Investigacion en modelos de lenguaje sobre audio: el checkpoint es util como sujeto de estudios de cuantizacion (comparar Q8_0 y Q4_K frente a bf16 sobre la misma revision fija) al no existir recuantizacion en el cargador.
- Generacion de bandas sonoras para prototipos de videojuego o video: con licencia Apache-2.0 y pesos inmutables, encaja en proyectos con requisitos de trazabilidad de procedencia, siempre que se respete el NOTICE.
- Datos sinteticos para experimentos de MIR (music information retrieval): generar clips etiquetados (letra → audio) para preentrenar clasificadores o sistemas de alineacion letra-audio.
- Demostraciones y docencia sobre pipelines multimodales: el repositorio ilustra un caso realista de LM de audio, cargador quantized con bloques GGML y verificacion de tokenizer, util en cursos de sistemas de IA.
- Despliegue offline en estaciones de trabajo con GPU de consumo: con el nivel q4 (4,49 GB de pesos) es viable ejecutar el modelo en tarjetas de gama media-alta sin conexion a internet.
- Generacion de borradores de letra-cancion para karaoke o maquetas de referencia antes de una grabacion profesional, sustituyendo la etapa de preproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas objetivas (FAD, CLAP score, MMLU o similares para el componente de lenguaje), ni comparaciones numericas con otros sistemas de generacion musical. Tampoco se documentan mediciones de latencia o throughput del motor candle sobre estos pesos.

## Requisitos de hardware

- Nivel bf16: pesos de aproximadamente 14,5 GB (7B parametros × 2 bytes) mas cache KV y codec. Se recomienda un minimo de 24 GB de VRAM; encaja con comodidad en A100 40/80 GB y H100, y de forma ajustada en RTX 4090 (24 GB) o RTX A6000.
- Nivel q8: 7,26 GB de pesos cuantizados, mas cache KV y codec. Estimacion orientativa de 10-12 GB de VRAM, apto para RTX 4080/4090, RTX 3090, L4 y A10G.
- Nivel q4: 4,49 GB de pesos cuantizados, mas cache KV y codec. Estimacion orientativa de 7-9 GB de VRAM, apto para tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070). Cabe en GPU de consumo.
- Cache KV a 16.384 tokens: no disponible. El consumo exacto depende del numero de capas y de cabezas KV, que la model card no detalla; en un modelo de 7B de configuracion tipica suele ser de varios GB en bf16.
- Memoria en disco: 24,2 GB si se descarga el repositorio completo; cada nivel es autocontenido y puede descargarse por separado (bf16, q8 de 7,26 GB o q4 de 4,49 GB).
- Opciones de despliegue: motor candle de SceneWorks Inference para YuE, junto con `SceneWorks/xcodec-mini-infer` y los decodificadores Vocos. vLLM, TGI, llama.cpp y Ollama no estan documentados como soportados para estos pesos (los bloques GGML van embebidos en tensores U8 dentro de safetensors, no en un GGUF estandar).
- Latencia y throughput: no disponible en la informacion proporcionada.
- Requisitos adicionales: la generacion completa de audio requiere tambien el modelo de etapa 2 de YuE y el codec, por lo que el consumo total de VRAM de un pipeline funcional es superior al del solo checkpoint de etapa 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/yue-s1-7b-anneal-zh-cot-candle | 7B | 16.384 | bf16, Q8_0, Q4_K | Apache-2.0 | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| m-a-p/YuE-s1-7B-anneal-zh-cot (upstream) | 7B | no disponible | no disponible | Apache-2.0 | HuggingFace; distribucion oficial de M-A-P / HKUST |
| Otros modelos de generacion musical condicionada por letra | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La unica comparacion sustentada por la informacion disponible es la que enfrenta este espejo con su repositorio de origen: mismos pesos y misma licencia, pero el espejo anade niveles cuantizados, un `tokenizer.json` derivado y verificado, y una revision inmutable registrada en `SOURCE_REVISION.json`. No se han facilitado datos de benchmarks ni de contexto del upstream, por lo que no es posible comparar rendimiento entre ambos.

## Limitaciones y advertencias

- No es una distribucion oficial: se trata de un espejo de redistribucion de SceneWorks, no publicado por M-A-P ni por HKUST. Para citas academicas o uso de referencia debe emplearse el repositorio upstream.
- Modelo incompleto por si solo: este checkpoint genera unicamente la codebook 0 (etapa 1). Sin la etapa 2 de YuE, el codec `SceneWorks/xcodec-mini-infer` y los decodificadores Vocos no produce audio.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de que terceros hayan reproducido los resultados con estos pesos.
- Cero benchmarks publicados: no hay metricas objetivas de calidad musical, inteligibilidad de la letra ni fidelidad de estilo, ni comparaciones con alternativas.
- Procedencia de los datos de entrenamiento no documentada: al no describirse el corpus, no es posible evaluar sesgos de genero, idioma, genero musical o estilo, ni riesgos de memorizacion de material protegido.
- Idiomas: no confirmados. Aunque el nombre del checkpoint sugiere annealing con datos en chino, no hay documentacion sobre el soporte real de idiomas distintos.
- Riesgo de salidas degeneradas: al ser un LM autorregresivo sobre tokens de audio, existe riesgo de secuencias incoherentes o bucles. La model card no incluye parametros de muestreo recomendados ni tasas de fallo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` conforme a la seccion 4(d). El estado de derechos de autor del audio generado no se aborda en la documentacion.
- Compatibilidad limitada de herramientas: al no ser un GGUF estandar, no se garantiza su carga en llama.cpp, Ollama, vLLM o TGI; el soporte documentado es el cargador de candle.
- Revision congelada: el espejo apunta a la revision `46b16f41821b3cab5af17146e703a61c3db1af66`, de modo que no incorpora mejoras posteriores del repositorio upstream.
- Fechas de publicacion inusuales en los metadatos (2026); conviene verificar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-zh-cot-candle
- Repositorio upstream: https://huggingface.co/m-a-p/YuE-s1-7B-anneal-zh-cot
- Repositorio del codec: https://huggingface.co/SceneWorks/xcodec-mini-infer
- Proyecto YuE en GitHub: https://github.com/multimodal-art-projection/YuE
- Revision upstream fijada: 46b16f41821b3cab5af17146e703a61c3db1af66
- Script de preparacion de assets: `scripts/audio/prepare_yue_assets.py` (repositorio SceneWorks Inference; URL no disponible en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a contenido no relacionado (guias del videojuego Lethal Company) y se descartan por no ser aplicables.
