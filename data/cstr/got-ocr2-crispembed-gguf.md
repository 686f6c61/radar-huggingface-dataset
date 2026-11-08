# cstr/got-ocr2-crispembed-GGUF

## Resumen

`cstr/got-ocr2-crispembed-GGUF` es una conversion al formato GGUF del modelo OCR `stepfun-ai/GOT-OCR2_0`, preparada por el usuario `cstr` para el runtime nativo ggml de CrispEmbed. No se trata de un modelo nuevo ni de un fine-tune: los pesos se han convertido de formato y, en algunas variantes, cuantizado, sin reentrenamiento, fusion ni modificacion de los pesos originales. El modelo resuelve tareas de reconocimiento optico de caracteres sobre imagenes, incluyendo texto denso y formularios, mediante un decoder derivado de Qwen1.5-0.5B.

El repositorio tiene un interes fundamentalmente practico: permite ejecutar GOT-OCR2 en el ecosistema CrispEmbed/ggml sin depender del codigo remoto original de transformers. La variante recomendada es `got-ocr2-f16-r2.gguf`, que segun el autor coincide exactamente con el modelo original en los tres casos de prueba publicados. Las variantes cuantizadas presentan advertencias explicitas de calidad.

La licencia es un punto critico: el decoder deriva de Qwen1.5-0.5B, cuyo texto es la Tongyi Qianwen RESEARCH LICENSE AGREEMENT, por lo que estos archivos se redistribuyen bajo esa licencia de solo investigacion, no comercial, y con prohibicion de usar el modelo o sus salidas para mejorar otros modelos de lenguaje. El modelo tiene 560.528.640 parametros y el repositorio ocupa 7,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para OCR (base: GOT-OCR2_0; decoder derivado de Qwen1.5-0.5B) |
| Parametros totales | 560.528.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (recomendada), Q8_0, Q4_K (experimental) |
| Idiomas soportados | no disponible |
| Licencia | tongyi-qianwen-research (solo investigacion y evaluacion, no comercial) |
| Formato de pesos | GGUF (runtime CrispEmbed/ggml) |

## Arquitectura y entrenamiento

El modelo base GOT-OCR2_0 combina un encoder visual con un decoder de lenguaje derivado de Qwen1.5-0.5B, orientado a la transcripcion de texto en imagenes. Esta ficha cubre exclusivamente la conversion GGUF: el autor declara que los pesos del checkpoint original (revision `979938bf89ccdc949c0131ddd3841e24578a4742`) fueron convertidos de formato, con renombrado de tensores, casting de tipos e incrustacion del tokenizer y metadatos de preprocesado. Los archivos `q8_0` y `q4_k` se cuantizaron adicionalmente desde el GGUF F16 con `crispembed-quantize`. No hubo entrenamiento, fine-tune, merge ni alteracion de pesos.

La conversion se valido leyendo de vuelta los 471 tensores de `got-ocr2-f16-r2.gguf` y comprobando que cada byte coincide con el checkpoint original. La version anterior `got-ocr2-f16.gguf` contenia un bloque de 8 MiB de ceros en `l.embed_tokens.weight` (filas 43-2091) y producia salidas repetidas del tipo `colorcolor...`; se conserva solo por trazabilidad y no debe usarse.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes.
- Transcripcion de texto denso, como recibos y documentos con muchas lineas.
- Procesamiento de formularios simples.
- Generacion de texto a partir de entrada visual mediante el decoder de lenguaje.
- Ejecucion en runtime ggml nativo a traves de CrispEmbed.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de recibos y facturas: el modelo transcribe texto denso de documentos escaneados; la variante F16-r2 es la adecuada cuando la fidelidad al original importa, dado que Q4_K diverge en el caso `receipt_example` tras el token 83.
- Extraccion de datos de formularios: procesa formularios simples para volcar campos a texto; usar F16-r2 por la misma razon de fidelidad.
- Pipeline de OCR en investigación: evaluacion comparativa de conversiones GGUF frente al modelo original con transformers 4.37.2 en CPU/F32 y decodificacion greedy.
- Despliegue en entornos con runtime ggml: integracion en CrispEmbed para evitar el codigo remoto de transformers, aceptando la variable `CRISPEMBED_ACCEPT_TONGYI_QIANWEN_LICENSE=1`.
- Pruebas de cuantizacion: uso de Q8_0 y Q4_K como casos de estudio de deriva numerica, sabiendo que Q8_0 no fue medido contra el original y Q4_K es experimental.
- Archivado y trazabilidad de artefactos: el repositorio incluye LICENSE, NOTICE y UPSTREAM_README con hashes SHA256, util para auditoria de licencias en proyectos de investigacion.
- No es adecuado para uso comercial ni para generar datos de entrenamiento de otros modelos, segun la licencia.

## Benchmarks y rendimiento

El autor publica una comparacion de calidad contra el modelo original (referencia: `chat()` remoto de GOT-OCR2_0 en CPU, F32, transformers 4.37.2, decodificacion greedy) sobre tres casos: `fox`, `receipt_example` y `simple_form`.

| Variante | Estado | Coincidencia de token IDs | Primer token divergente | Ratio de caracteres vs original | Cosine de etapa (min) |
|---|---|---|---|---|---|
| F16-r2 | recomendada | 3/3 exactos | ninguno | 1.0 / 1.0 / 1.0 | 1.000000 (19 etapas) |
| Q4_K | experimental | 1/3 exactos (`fox`) | `receipt_example` token 83; `simple_form` token 20 | 1.0 / 0.8041 / 0.9679 | vision 0.997745; decoder 0.995157 |
| Q8_0 | sin cualificar | no medido | no medido | no medido | no medido |

No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el archivo F16-r2 ocupa 1.441.830.112 bytes (aproximadamente 1,34 GiB) y Q4_K 445.492.288 bytes (aproximadamente 415 MiB), mas overhead del runtime.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el tamano de los archivos sugiere que podria caber en GPUs consumer, pero no hay dato verificado.
- Opciones de despliegue: runtime nativo ggml de CrispEmbed (libreria `crispembed`); requiere `CRISPEMBED_ACCEPT_TONGYI_QIANWEN_LICENSE=1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cstr/got-ocr2-crispembed-GGUF (F16-r2) | 560.528.640 | no disponible | GGUF | tongyi-qianwen-research (solo investigacion) | Conversion exacta del original en 3/3 casos |
| stepfun-ai/GOT-OCR2_0 | no disponible | no disponible | checkpoint original | sin LICENSE en el repo; decoder Qwen1.5-0.5B bajo licencia de investigacion | Modelo de referencia |
| Qwen/Qwen1.5-0.5B | 0,5B (aprox.) | no disponible | safetensors | Tongyi Qianwen RESEARCH LICENSE | Decoder base de GOT-OCR2 |

No se dispone de datos de benchmarks comparativos con otros modelos OCR en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia de solo investigacion: prohibido el uso comercial y el uso del modelo o sus salidas para mejorar otros modelos de lenguaje.
- La etiqueta `apache-2.0` del repositorio upstream no relaja la licencia del modelo base; el autor documenta una auditoria de licencias.
- Q4_K es experimental y pierde calidad real: en `receipt_example` solo coincide aproximadamente el 80% de los caracteres; no usar cuando la fidelidad importa.
- Q8_0 no ha sido medido contra el original.
- `got-ocr2-f16.gguf` es defectuoso (bloque de ceros en embeddings) y produce salidas repetidas; no usar.
- El modelo card indica que aun no existe una receta de cuantizacion mixta Q4 que iguale al original.
- Riesgo de alucinacion, sesgos y limitaciones de idioma: no documentados en la informacion disponible.
- Requiere establecer una variable de entorno especifica para aceptar la licencia en CrispEmbed.
- Solo se documentan tres casos de prueba de calidad; la cobertura de validacion es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/got-ocr2-crispembed-GGUF
- Model card (README): https://huggingface.co/cstr/got-ocr2-crispembed-GGUF/blob/main/README.md
- Modelo base: https://huggingface.co/stepfun-ai/GOT-OCR2_0/tree/979938bf89ccdc949c0131ddd3841e24578a4742
- Decoder base: https://huggingface.co/Qwen/Qwen1.5-0.5B
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Auditoria de licencias: https://github.com/CrispStrobe/CrispEmbed/blob/main/tests/results/licenses/registry-qwen-audit.json
- Resultados de cualificacion F16: https://github.com/CrispStrobe/CrispEmbed/tree/main/tests/results/got-ocr2-f16/qualify-41588457181-orig-ref
