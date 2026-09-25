# SceneWorks/yue-s1-7b-anneal-en-icl-candle

## Resumen

SceneWorks/yue-s1-7b-anneal-en-icl-candle es una redistribucion (mirror) del modelo m-a-p/YuE-s1-7B-anneal-en-icl, fijado a la revision 024ea105533fdd99f8a67ee75abce61c7b813938. Se trata de la etapa 1 del pipeline YuE de M-A-P y HKUST: un modelo de lenguaje de 7B parametros que convierte letras de canciones (lyrics) en la secuencia de tokens del codebook 0, que despues se decodifica a audio en las etapas posteriores del sistema. No es una distribucion oficial de M-A-P, sino un rehost publicado por SceneWorks para que los pesos se resuelvan mediante un commit SHA inmutable dentro de su motor de inferencia candle.

El interes de esta ficha no esta en el modelo en si (que es un artefacto de generacion musical, no de texto general), sino en su empaquetado de despliegue. El repositorio incluye tres directorios autocontenidos: bf16 (snapshot upstream sin modificar mas un tokenizer.json derivado), q8 (7,26 GB, proyecciones cuantizadas como GGML Q8_0) y q4 (4,49 GB, proyecciones como GGML Q4_K). Esto permite descargar unicamente el tier que se vaya a usar y reconstruir los pesos directamente con el cargador de candle-llm, sin dequantizar y requantizar en tiempo de carga.

El modelo tiene un vocabulario de 83968 tokens y una longitud de contexto de 16384, lo que es coherente con la generacion de canciones de varios minutos a partir de letras. La licencia es Apache-2.0 y el codec xcodec y los decodificadores Vocos no van incluidos en este repositorio: cada tier se empareja con SceneWorks/xcodec-mini-infer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (LM) de 7B, etapa 1 del sistema YuE (lyrics a codebook-0); detalle interno no disponible en la informacion proporcionada |
| Parametros totales | 7B (segun el nombre del modelo y la model card) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 16384 tokens |
| Tipos de cuantizacion | bf16 (sin cuantizar), GGML Q8_0 (bloques de 34 bytes), GGML Q4_K (bloques de 144 bytes). El codigo del preparador menciona tambien Q4_0 (18 bytes), no distribuido en este repo |
| Idiomas soportados | Ingles (variante "en" con in-context learning); otros idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors. Los tiers cuantizados almacenan las proyecciones como tensores U8 [rows, blocks_per_row, block_bytes] con bloques GGML crudos dentro de safetensors. No se distribuye GGUF |
| Vocabulario | 83968 tokens |
| Tamano del repositorio | 24,2 GB |
| Tamano por tier | bf16: no disponible en detalle; q8: 7,26 GB; q4: 4,49 GB |
| Componentes no incluidos | Codec xcodec y decodificadores Vocos (se emparejan con SceneWorks/xcodec-mini-infer) |
| Fecha de creacion del repo | 2026-09-24 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como la etapa 1 de YuE: un LM de 7B que transforma letras en la secuencia de tokens del codebook 0. El pipeline completo de YuE es un sistema de generacion musical (lyrics2song) que produce pistas vocales y de acompanamiento de varios minutos; esta etapa concreta es la responsable de la parte textual-a-token musical. No se detallan en la informacion proporcionada el numero de capas, la dimension oculta, el tipo de atencion ni la composicion del dataset de entrenamiento.

La variante se identifica como "anneal" e "icl" (in-context learning), lo que sugiere un ajuste de recocido (annealing) sobre el modelo base y capacidades de aprendizaje en contexto, segun la descripcion externa consultada. No se especifican en la informacion disponible el numero de tokens de entrenamiento, si hubo RLHF/DPO ni otras innovaciones tecnicas.

La innovacion relevante de este repositorio es de ingenieria de despliegue, no de modelado: el preparador de snapshots de candle-llm (prepare_snapshot) cuantiza una sola vez cada proyeccion de atencion y MLP y las guarda como bloques GGML crudos, de modo que el cargador los reconstruye directamente. Embeddings, LM head y normas permanecen en bf16 en todos los tiers, practica habitual para preservar la calidad numerica en esas capas. El tokenizer.model upstream es un modelo SentencePiece mm (fuente de verdad); el tokenizer.json derivado (BPE con byte-fallback y tokens especiales mm en sus ids) se verifico id a id contra el _MMSentencePieceTokenizer upstream sobre 3010 casos, con 0 discrepancias segun la model card.

## Capacidades

- Generacion musical condicionada por letras: convierte texto de letras en tokens del codebook 0, primer paso del pipeline lyrics2song de YuE.
- Generacion de canciones de varios minutos con vocal y acompanamiento, una vez completado el pipeline con las etapas posteriores y el codec (xcodec-mini-infer).
- Aprendizaje en contexto (ICL) para condicionar el estilo a partir de ejemplos, segun la variante "icl" del nombre.
- Procesamiento de texto en ingles (variante "en"); el soporte multilingue no esta confirmado en la informacion disponible.
- No es un modelo conversacional: no se documentan capacidades de chat, tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio de entrada ni modo de razonamiento explicito.
- Inferencia optimizada para el motor candle de SceneWorks Inference mediante los tiers cuantizados.

## Casos de uso

- Generacion de canciones a partir de letras: se alimenta el texto de la letra y el modelo produce la secuencia del codebook 0; combinado con xcodec-mini-infer y las etapas posteriores de YuE se obtiene la pista de audio final.
- Prototipado musical rapido: compositores pueden convertir borradores de letras en maquetas de varios minutos para evaluar melodias y arreglos antes de una produccion real.
- Produccion de demos para artistas: generar versiones preliminares de canciones en ingles con vocal y acompanamiento para presentar a sellos o clientes.
- Creacion de jingles y musica publicitaria: a partir de un guion de letras corto, generar variantes de una sintonia en ingles de forma automatizada dentro de un pipeline.
- Investigacion en generacion musical: el modelo sirve como etapa de referencia para estudiar la conversion letra-a-token musical canonicamente y comparar estrategias de decodificacion o cuantizacion.
- Rehosting reproducible y despliegue: gracias al SHA inmutable y a los tiers q8/q4 autocontenidos, encaja en pipelines de CI/CD donde se necesita fijar una revision concreta y descargar solo los pesos necesarios.
- Evaluacion de cuantizacion: comparar la calidad de salida entre bf16, Q8_0 y Q4_K permite medir el impacto de la cuantizacion en tareas de generacion musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: q4 aproximadamente 6-8 GB; q8 aproximadamente 9-11 GB; bf16 aproximadamente 16-20 GB (estimaciones a partir de los tamanos de tier declarados: 4,49 GB y 7,26 GB de pesos, mas margen para activaciones y contexto). El codec xcodec y los decodificadores Vocos anaden consumo adicional no cuantificado en este repositorio.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una RTX 4090 (24 GB) cubre los tiers bf16 y q8; una GPU de 8-12 GB puede cubrir el tier q4.
- Cabe en GPU de consumo: si, el tier q4 (4,49 GB) entra en GPUs de 8 GB o mas; el tier q8 (7,26 GB) requiere 10-12 GB; el tier bf16 requiere tarjetas de 16-24 GB.
- Opciones de despliegue: motor candle / SceneWorks Inference (disenado especificamente para estos pesos). No se documenta soporte para vLLM, TGI, Ollama o llama.cpp; el formato de cuantizacion son bloques GGML crudos dentro de safetensors, no GGUF estandar.
- Latencia y throughput: no disponibles.
- Contexto: 16384 tokens, factor relevante porque la generacion de canciones completas consume muchos tokens de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/yue-s1-7b-anneal-en-icl-candle | 7B | 16384 | bf16, Q8_0, Q4_K | Apache-2.0 | Rehost no oficial, 0 descargas |
| m-a-p/YuE-s1-7B-anneal-en-icl | 7B | No disponible | No disponible | Apache-2.0 | Distribucion oficial M-A-P |
| HKUSTAudio/YuE-s1-7B-anneal-en-icl | 7B | No disponible | No disponible | Apache-2.0 | Distribucion oficial HKUST |

Alternativas de la misma categoria (generacion musical texto-a-audio, como MusicGen o Stable Audio Open) no estan cubiertas en la informacion proporcionada, por lo que no se incluyen datos comparativos.

## Limitaciones y advertencias

- Es un rehost no oficial: no lo publica M-A-P ni HKUST, sino SceneWorks, para uso con su motor candle. Cualquier problema de integridad o calidad debe contrastarse con el repositorio upstream.
- Es unicamente la etapa 1 del pipeline: por si solo no produce audio; requiere las etapas posteriores de YuE y el codec xcodec-mini-infer para generar canciones.
- Enfoque en ingles: la variante es "en-icl"; el comportamiento en otros idiomas no esta documentado.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que no se puede cuantificar la calidad frente a alternativas.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero la salida puede no corresponder a la letra o al estilo deseado; es un modelo generativo sin garantias de fidelidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el archivo LICENSE y el NOTICE (seccion 4(d) de la Apache License), con atribucion a Ruibin Yuan y contribuidores de M-A-P y HKUST (2025).
- La cuantizacion Q4_K y Q8_0 puede degradar la calidad de la generacion musical; embeddings, LM head y normas se mantienen en bf16 para mitigarlo.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica baja validacion por parte de la comunidad.
- Consumo de contexto elevado: canciones de varios minutos pueden acercarse al limite de 16384 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-en-icl-candle
- Upstream M-A-P: https://huggingface.co/m-a-p/YuE-s1-7B-anneal-en-icl
- Upstream HKUSTAudio: https://huggingface.co/HKUSTAudio/YuE-s1-7B-anneal-en-icl
- Codec emparejado: https://huggingface.co/SceneWorks/xcodec-mini-infer
- Repositorio YuE en GitHub: https://github.com/multimodal-art-projection/YuE
- Ficha en PromptLayer: https://www.promptlayer.com/models/yue-s1-7b-anneal-en-icl/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/yue-s1-7b-anneal-en-icl-m-a-p
