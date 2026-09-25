# SceneWorks/yue-s1-7b-anneal-en-cot-candle

## Resumen

`SceneWorks/yue-s1-7b-anneal-en-cot-candle` es una redistribucion (mirror) de los pesos `m-a-p/YuE-s1-7B-anneal-en-cot` en la revision `454c20e1748888800f8e4b3da45125f55482d967`. Se corresponde con la etapa 1 de YuE, el modelo de lenguaje de 7B que convierte letras (lyrics) en el codebook 0 de una pista musical. No es una distribucion oficial de M-A-P: es un rehost de SceneWorks pensado para que los pesos se resuelvan mediante un SHA de commit inmutable dentro del motor YuE de SceneWorks Inference (implementado sobre candle).

YuE es una familia de modelos fundacionales de generacion de musica orientada a lyrics2song, desarrollada por HKUST y M-A-P. Este checkpoint no genera audio por si solo: es el primer eslabon de una cadena que, junto con el codec xcodec y los decodificadores Vocos, produce una cancion completa con voz y acompanamiento. Por ello es relevante para pipelines de generacion musical que necesiten fijar una revision concreta y disponer de pesos pre-cuantizados listos para inferencia local.

El repositorio ocupa 24,2 GB e incluye tres niveles autocontenidos: `bf16/` con el snapshot original en safetensors, `q8/` (7,26 GB, proyecciones en GGML Q8_0) y `q4/` (4,49 GB, proyecciones en GGML Q4_K). El contexto declarado es de 16384 tokens y el ancho de vocabulario es de 83968. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autoregresivo (decoder) para la etapa 1 de YuE (lyrics a codebook-0); detalle interno de capas no disponible |
| Parametros totales | 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16384 tokens |
| Tipos de cuantizacion | bf16 (original), GGML Q8_0, GGML Q4_K (tambien existen cuantizaciones externas exl2 a 8.0 y 5.0 bpw) |
| Idiomas soportados | No disponible (la variante se etiqueta como `en` y el modelo lleva el tag `yue`) |
| Licencia | Apache-2.0 (© 2025 Ruibin Yuan y colaboradores de M-A-P y HKUST) |
| Formato de pesos | Safetensors (bf16); SGUF como tensores U8 con bloques GGML crudos en los niveles q8/q4 |
| Ancho de vocabulario | 83968 |
| Tokenizer | SentencePiece `tokenizer.model` (mm) mas `tokenizer.json` derivado (BPE con byte-fallback) |
| Codec asociado | `SceneWorks/xcodec-mini-infer` (xcodec + decodificadores Vocos, no incluidos en los niveles) |

## Arquitectura y entrenamiento

La model card identifica este checkpoint como el modelo de lenguaje de la etapa 1 de YuE, encargado de transformar la letra en el codebook 0. El repositorio no documenta el numero de capas, cabezas de atencion ni la composicion exacta del dataset de entrenamiento; esa informacion no esta disponible en el material proporcionado. Lo que si se detalla es que se trata de un modelo de 7B con vocabulario de 83968 y contexto de 16384 tokens, con tokenizer SentencePiece de origen mm.

La innovacion tecnica destacable de este rehost es el sistema de cuantizacion: los niveles q8 y q4 se generan con el preparador de snapshots de candle-llm (`prepare_snapshot`). Cada proyeccion de atencion y MLP se cuantiza una sola vez y se almacena como bloques GGML crudos en un tensor U8 con forma `[rows, blocks_per_row, block_bytes]`, donde el tipo de bloque viene dado por `block_bytes` (18 = Q4_0, 34 = Q8_0, 144 = Q4_K). El cargador de candle reconstruye los pesos directamente sin de-cuantizar ni re-cuantizar. Las embeddings, la cabeza LM y las normas permanecen en bf16 en todos los niveles. `config.json` incluye `quantization: {bits, storage: "ggml"}`.

La procedencia se registra en `SOURCE_REVISION.json` (repositorio y revision upstream, commit de codigo de YuE y sha256 de cada archivo), generado por `scripts/audio/prepare_yue_assets.py`. El `tokenizer.json` derivado se verifico id a id contra el tokenizer upstream `_MMSentencePieceTokenizer` sobre 3010 casos, con 0 discrepancias. No se documentan en la informacion disponible fases de RLHF, DPO ni detalles del corpus de entrenamiento.

## Capacidades

- Generacion de la representacion musical de etapa 1: convierte letras en el codebook 0, primer paso del pipeline lyrics2song de YuE.
- Integracion en generacion de cancion completa cuando se combina con el codec xcodec y los decodificadores Vocos (`SceneWorks/xcodec-mini-infer`).
- Modelado de genero, idioma y tecnica vocal diversos a nivel de la familia YuE (segun la descripcion del proyecto upstream).
- Ejecucion en el motor candle de SceneWorks Inference, con resolucion de pesos por SHA de commit inmutable.
- Cuantizacion lista para uso en q8 y q4, con embeddings y cabeza LM en bf16.
- Soporte de tool calling / function calling: no documentado, no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado, no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio de entrada, thinking mode): no documentadas; la salida es representacion musical, no texto libre ni audio directo en esta etapa.

## Casos de uso

- Generacion de canciones a partir de letras: usar el checkpoint como etapa 1 para producir el codebook 0, encadenado con xcodec y Vocos para obtener audio con voz y acompanamiento.
- Pipelines reproducibles con revision fijada: al resolver por SHA inmutable, es adecuado para entornos de investigacion que necesiten resultados deterministas y auditables.
- Prototipado de musica asistida por IA en local: el nivel q4 (4,49 GB) permite ejecutar la etapa 1 en hardware de consumo sin descargar los 24,2 GB completos.
- Servicios de generacion musical con control de coste: el nivel q8 (7,26 GB) ofrece un equilibrio entre calidad y consumo de memoria para despliegue en una sola GPU.
- Investigacion sobre lyrics2song y modelado de codebooks: sirve como base para estudiar la correspondencia entre letras y representaciones musicales discretas.
- Integracion en motores propios basados en candle: util para proyectos que ya usan el stack de SceneWorks y quieren reutilizar el cargador de snapshots cuantizados.
- Generacion de maquetas o demos creativas: artistas pueden incorporar las salidas a sus obras, con atribucion recomendada al modelo (YuE de HKUST/M-A-P) en usos publicos o comerciales.
- Comparacion de esquemas de cuantizacion: los niveles bf16, q8 y Q4_K permiten medir el impacto de la cuantizacion en la calidad musical generada en una misma revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos de la etapa 1, sin codec ni decodificadores): bf16 en torno a 14 GB; nivel q8 aproximadamente 7,26 GB; nivel q4 aproximadamente 4,49 GB.
- Nota: el repositorio completo ocupa 24,2 GB, pero cada nivel es autocontenido y puede descargarse por separado.
- GPU recomendadas: A100 o H100 para bf16 con margen de contexto largo; RTX 4090 o similar (24 GB) para bf16 o q8; GPUs de 8-12 GB para el nivel q4.
- Cabe en GPU de consumo: si, el nivel q4 (4,49 GB) entra en GPUs de 8 GB en adelante; q8 requiere del orden de 8-10 GB o mas; bf16 requiere aproximadamente 16 GB o mas segun contexto y overhead.
- Opciones de despliegue: motor candle de SceneWorks Inference (objetivo del rehost); tambien existen cuantizaciones GGUF y exl2 del modelo upstream que pueden emplearse con otros runtimes, aunque no forman parte de este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/yue-s1-7b-anneal-en-cot-candle (este) | 7B | 16384 | bf16, Q8_0, Q4_K | Apache-2.0 | Rehost de la etapa 1 de YuE, nivelado y con revision inmutable |
| m-a-p/YuE-s1-7B-anneal-en-cot | 7B | No disponible | bf16 (upstream) | Apache-2.0 | Distribucion oficial de origen |
| Alissonerdx/YuE-s1-7B-anneal-en-cot-exl2-8.0bpw | 7B | No disponible | exl2 8.0 bpw | Apache-2.0 | Cuantizacion externa para ExLlamaV2 |
| Alissonerdx/YuE-s1-7B-anneal-en-cot-exl2-5.0bpw | 7B | No disponible | exl2 5.0 bpw | Apache-2.0 | Cuantizacion externa mas agresiva |
| QuantFactory/YuE-s1-7B-anneal-en-cot-GGUF | 7B | No disponible | GGUF | Apache-2.0 | Cuantizacion externa para llama.cpp |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es una distribucion oficial de M-A-P; es un rehost de SceneWorks. Para usos que requieran trazabilidad oficial, conviene referenciar el repositorio upstream.
- El checkpoint corresponde unicamente a la etapa 1 (lyrics a codebook-0). Por si solo no produce audio: necesita el codec xcodec y los decodificadores Vocos para generar una cancion.
- El codec xcodec y los decodificadores Vocos no estan incluidos en los niveles de cuantizacion; se obtienen por separado en `SceneWorks/xcodec-mini-infer`.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; al ser un modelo generativo de representacion musical, las salidas pueden no ajustarse a la letra o al estilo esperado.
- Limitaciones de idioma: no disponibles; la variante se etiqueta como `en` y el modelo lleva el tag `yue`, por lo que la cobertura multilingue no esta confirmada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda atribuir el modelo (YuE de HKUST/M-A-P) en usos publicos y comerciales, y conservar `LICENSE` y `NOTICE` conforme a la seccion 4(d) de la licencia.
- Etiquetado recomendado: al publicar obras en plataformas de streaming o compartirlas, marcar como "AI-generated", "YuE-generated" o similares.
- Los niveles q8 y q4 mantienen embeddings, cabeza LM y normas en bf16; las proyecciones cuantizadas pueden introducir perdida de calidad no cuantificada en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-en-cot-candle
- Codec asociado: https://huggingface.co/SceneWorks/xcodec-mini-infer
- Modelo upstream: https://huggingface.co/m-a-p/YuE-s1-7B-anneal-en-cot
- Proyecto YuE: https://github.com/multimodal-art-projection/YuE
- Cuantizacion exl2 8.0 bpw: https://huggingface.co/Alissonerdx/YuE-s1-7B-anneal-en-cot-exl2-8.0bpw
- Cuantizacion exl2 5.0 bpw: https://huggingface.co/Alissonerdx/YuE-s1-7B-anneal-en-cot-exl2-5.0bpw
- Cuantizacion GGUF: https://www.modelscope.cn/models/QuantFactory/YuE-s1-7B-anneal-en-cot-GGUF
- Repositorio YuE (mirror): https://github.com/rdacomp/YuE
- Repositorio YuE (mirror): https://github.com/sam17/yue
