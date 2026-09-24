# mauromedda/fucina-qwen38-v2

## Resumen

`mauromedda/fucina-qwen38-v2` es un checkpoint objetivo cuantizado en formato NVFP4/FP8 mixto, derivado de `Qwen/Qwen3.8-27B` (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y publicado con licencia Apache-2.0. No se trata de un entrenamiento nuevo ni de un ajuste fino adicional sobre el modelo base, sino de una reparacion del export calibrado con NVIDIA ModelOpt 0.44.0: 208 pesos declarados FP8 y 192 pesos declarados NVFP4 se empaquetaron reutilizando las escalas ya presentes en el export calibrado, sin repetir la calibracion, y se preservo el `lm_head` en U8. El resultado son seis shards safetensors con 2 194 tensores y 21 921 428 072 bytes de payload tensorial.

Su relevancia es practica y no academica: el autor publica una configuracion de despliegue reproducible sobre SGLang v0.5.20 en una NVIDIA GB10 (arm64) con decodificacion especulativa DFlash2, y aporta mediciones concretas de throughput de decodificacion (77,42 tokens/s con prompts de 2 048 tokens, bajando a 71,17 tokens/s con 65 536 tokens) ademas de un resultado de 86/100 en la suite `tool-eval-bench` 2.0.4 de 69 casos. La metadata del Hub declara el pipeline `image-text-to-text`, lo que apunta a un modelo multimodal, aunque la model card no detalla las capacidades de vision.

Conviene subir el nivel de cautela antes de considerarlo para produccion: el propio autor aclara que el recibo de repack no constituye una admision de calidad o rendimiento, que las cifras de velocidad no son la velocidad de decodificacion del objetivo en solitario ni una garantia universal, y que el checkpoint no ha sido promovido para produccion general. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada explicitamente en la model card. El modelo base es `Qwen/Qwen3.8-27B` y la configuracion de SGLang usa parametros de SSM Mamba (`--mamba-ssm-dtype`, `--mamba-radix-cache-strategy`) y de atencion lineal (`--linear-attn-backend triton`), lo que sugiere una arquitectura hibrida atencion/SSM no confirmada por el autor |
| Parametros totales | 27 000 millones (deducido del identificador del modelo base; la model card no declara el recuento exacto) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 131 072 tokens (valor de `--context-length` en la configuracion medida; no se declara en la ficha del modelo) |
| Tipos de cuantizacion | Pesos NVFP4 y FP8 combinados en el mismo checkpoint (192 tensores NVFP4 y 208 tensores FP8 declarados), `lm_head` en U8; cache KV en `fp8_e4m3` y estado SSM en `float32` durante la inferencia. Cuantizacion realizada con NVIDIA ModelOpt 0.44.0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, tanto para el modelo origen como para este derivado |
| Formato de pesos | safetensors (seis shards, 2 194 tensores, 21 921 428 072 bytes de payload tensorial) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es un derivado cuantizado del checkpoint `Qwen/Qwen3.8-27B`. El proceso descrito consiste en reparar un export calibrado de ModelOpt 0.44.0 sin repetir la calibracion, empaquetando 208 pesos FP8 y 192 pesos NVFP4 con las escalas ya presentes en dicho export, y conservando el `lm_head` empaquetado en U8. El autor indica que este checkpoint es el objetivo empaquetado final y que el export crudo calibrado necesario para repetir el repack sin calibracion no se incluye en el repositorio.

La evidencia de integridad esta documentada en un recibo de Fucina que fija la salida exacta de 22 ficheros, seis shards safetensors, 2 194 tensores y una huella de diseno `12e55f382b6ea1fd04d85449e598cc8d2009a88f64788c457277ae5fce911f4b`, con SHA-256 del recibo `409b7115b2f5721e741fca7bca3756351c9674456af35095ac8cd7fea131e280`. El autor insiste en que el recibo de repack completado no es una admision de calidad ni de rendimiento. Se documenta tambien, en el handoff de reproduccion, un script opcional para una nueva ejecucion de calibracion BF16 a ModelOpt, que requiere las 512 filas de entradas de calibracion fijadas por el propietario y que no recrea por si solo este checkpoint exacto.

La innovacion tecnica destacable no esta en el modelo sino en el despliegue: la configuracion medida emplea decodificacion especulativa DFlash con un draft NVFP4 separado (`maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal`), `--speculative-num-steps 1`, `--speculative-eagle-topk 1`, `--speculative-dflash-block-size 8`, `--speculative-num-draft-tokens 8` y `--speculative-draft-window-size 2048`, con backend de atencion del draft `trtllm_mha`. El autor advierte explicitamente de que descargar solo el objetivo no reproduce ese throughput.

## Capacidades

- Generacion de texto y razonamiento: el pipeline del Hub es `image-text-to-text` y la configuracion de referencia arranca SGLang con `--reasoning-parser qwen3`, lo que indica soporte de un modo de razonamiento con parser dedicado.
- Entrada multimodal: la etiqueta de pipeline `image-text-to-text` indica que el modelo base procesa imagen y texto, aunque la model card no detalla resoluciones, numero de imagenes ni tareas de vision soportadas.
- Tool calling / function calling: la configuracion de referencia usa `--tool-call-parser qwen3_coder`, por lo que se contempla el uso con herramientas en formato Qwen3 Coder.
- Razonamiento multi-paso y agentes: no se documenta de forma explicita en la informacion disponible; el soporte de parser de razonamiento y de tool calling es el unico indicio.
- Contexto largo: la configuracion medida fija `--context-length 131072` y un presupuesto de tokens de 150 000 (`--max-total-tokens`), con `--chunked-prefill-size 8192`.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (audio, thinking mode explicito, vision detallada): no disponible.

## Casos de uso

- Inferencia local en hardware GB10 o clase DGX Spark: el checkpoint esta pensado para ejecutarse en una unica NVIDIA GB10 con memoria unificada, `--tp-size 1` y `--pp-size 1`, con lo que un equipo de escritorio de gama alta puede servir un modelo de 27 000 millones con pesos de 4 y 8 bits sin clúster multi-GPU.
- Agentes de codigo con tool calling: el servidor se arranca con `--tool-call-parser qwen3_coder`, lo que permite integrarlo en bucles de agente que invocan funciones, ejecutan comandos y encadenan pasos sobre repositorios de codigo.
- Analisis de documentos largos y RAG: con 131 072 tokens de contexto configurados y prefill troceado en bloques de 8 192 tokens, es viable ingerir contratos, informes tecnicos o bases de codigo extensas en una sola peticion sin trocear el documento.
- Despliegue de baja concurrencia con latencia medida: la configuracion publicada usa `--max-running-requests 1` y reporta 77,42 tokens/s de decodificacion con prompts de 2 048 tokens, un perfil adecuado para asistentes interactivos de un solo usuario o para equipos que priorizan latencia sobre throughput agregado.
- Banco de pruebas de cuantizacion NVFP4/FP8: dado que el repositorio documenta el repack, el recibo de integridad y las escalas reutilizadas, sirve como caso de estudio para validar pipelines de cuantizacion ModelOpt y comparar precision frente al modelo base en BF16.
- Evaluacion de decodificacion especulativa DFlash2: el repositorio incluye la receta completa de SGLang con draft separado, util para medir tasas de aceptacion y comparar estrategias de decodificacion especulativa en contexto largo.
- Servicio multimodal en prototipos: la etiqueta `image-text-to-text` permite plantear prototipos de descripcion de imagenes o VQA siempre que se validen antes las capacidades reales de vision, que la model card no detalla.

## Benchmarks y rendimiento

Throughput de decodificacion medido con SGLang v0.5.20 sobre una NVIDIA GB10 (arm64), una peticion en curso, 256 tokens de salida confirmados, y objetivo mas draft NVFP4 DFlash2 separado. No es la velocidad del objetivo en solitario:

| Tokens de prompt | Tokens de decodificacion comprometidos por segundo |
| ---: | ---: |
| 2 048 | 77,42 |
| 8 192 | 76,88 |
| 32 768 | 74,28 |
| 65 536 | 71,17 |

Otros resultados reportados:

| Prueba | Resultado |
|---|---|
| `tool-eval-bench` 2.0.4, 69 casos | 86/100 (el autor indica que no son 91/100 ni 96/100) |
| Aceptacion DFlash sobre fixtures sinteticos de tokens repetidos | 8/8 sostenida |
| Prefill en frio | Por debajo del objetivo de comparacion aportado en las cuatro longitudes de contexto |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el payload tensorial ocupa 21 921 428 072 bytes (unos 20,4 GiB) solo en pesos. Hay que sumar cache KV en `fp8_e4m3`, estado SSM en `float32`, buffers de prefill y el modelo draft. La configuracion medida usa `--mem-fraction-static 0.72` y `--max-total-tokens 150000`, lo que implica margen adicional sobre los pesos.
- GPU validadas: una unica NVIDIA GB10 (arm64) con memoria unificada suficiente, sin trabajos de modelo compitiendo. No se documentan otras GPUs.
- GPU de consumo: no hay confirmacion de funcionamiento en RTX 4090, RTX 5090 ni similares. Por tamano de pesos (en torno a 20,4 GiB) el checkpoint no cabe en GPUs de 16 GB; en GPUs de 24 GB requeriria reducir presupuesto de cache KV y de tokens totales, algo no validado por el autor.
- Paralelismo: la receta medida es `--tp-size 1 --pp-size 1`. No se documentan configuraciones tensor-parallel ni pipeline-parallel.
- Opciones de despliegue: SGLang v0.5.20 (imagen oficial `lmsysorg/sglang` para Linux/arm64, manifiesto `sha256:b0d8718a4424bb22e448e04407ab3ce5f7399a4c5fc702d6fbe36c3772ec8862`, commit fuente `94602c9c2b7cbdb8efd5c52802dac6a1c180089e`), con `--load-format safetensors` y `--quantization modelopt`. Se ejecuta en Docker con acceso a GPU NVIDIA y `--shm-size 16g`. El backend de atencion del draft es `trtllm_mha`. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 77,42 / 76,88 / 74,28 / 71,17 tokens de decodificacion comprometidos por segundo para prompts de 2 048 / 8 192 / 32 768 / 65 536 tokens, con una sola peticion en curso y 256 tokens de salida.
- Requisitos de software adicionales: el draft debe descargarse por separado y fijarse a la revision `bd7a934213c47a9e7ef69eef36bb3325f47fd1f1`; el autor recomienda sustituir `main` por un commit inmutable antes de desplegar en produccion.
- Advertencias de ejecucion: no pasar `--enable-unified-memory` a SGLang (es una opcion hibrida de KV, no una propiedad del hardware GB10, y no se uso en la ejecucion DFlash). Comprobar el estado del servidor con `curl -fsS http://127.0.0.1:8000/health` tras la carga. La receta publicada enlaza solo a loopback; exponerla externamente exige una revision de seguridad aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|---|
| `mauromedda/fucina-qwen38-v2` (este) | 27 000 millones (segun nombre del base) | 131 072 tokens en la configuracion medida | NVFP4 + FP8 mixto, `lm_head` U8 | Apache-2.0 | HuggingFace, 0 descargas y 0 likes | 77,42-71,17 tokens/s de decodificacion segun longitud de prompt; 86/100 en tool-eval-bench 2.0.4 |
| `Qwen/Qwen3.8-27B` (modelo base) | 27 000 millones | no disponible | BF16 sin cuantizar (segun el flujo de calibracion descrito) | Apache-2.0 | HuggingFace | No se reportan en esta ficha; el autor no aporta comparacion directa de calidad |
| `maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal` (draft) | no disponible | no disponible | NVFP4 (RTN calibrado) | no disponible en esta informacion | HuggingFace, revision fijada | No aplica como modelo autonomo: es el draft de decodificacion especulativa |
| Otras cuantizaciones NVFP4 de `Qwen3.8-27B` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de otras alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- El autor declara explicitamente que el recibo de repack completado no es una admision de calidad ni de rendimiento. No hay ninguna evaluacion de calidad publicada que respalde el checkpoint.
- El export crudo calibrado necesario para repetir el repack sin calibracion no se incluye en el repositorio, por lo que la reproducibilidad completa no esta garantizada. El script de calibracion documentado requiere las 512 filas de entradas del propietario y no recrea este checkpoint exacto.
- Las cifras de throughput corresponden a objetivo mas draft DFlash2 sobre fixtures sinteticos de tokens repetidos, con una sola peticion y 256 tokens confirmados. El propio autor advierte de que no son la velocidad de decodificacion del objetivo en solitario, no constituyen una garantia universal y no demuestran tasas de aceptacion con prompts reales.
- El prefill en frio se midio por debajo del objetivo de comparacion en las cuatro longitudes de contexto, lo que penaliza cargas de trabajo con prompts largos y poca reutilizacion de cache.
- El resultado de `tool-eval-bench` 2.0.4 es 86/100, no 91/100 ni 96/100; cualquier comparacion debe hacerse con el mismo tokenizador, draft, digest de SGLang, fixture de prompt y definicion de 256 tokens de decodificacion.
- El checkpoint no ha sido promovido para produccion general (texto truncado en la informacion disponible).
- Riesgo de sesgos y de alucinacion: no disponible. No se publica ninguna evaluacion de sesgo, toxicidad o fidelidad factual.
- Idiomas soportados: no disponible. No hay ninguna tabla de cobertura linguistica.
- Cuantizacion agresiva: la combinacion NVFP4 y FP8 sobre pesos puede degradar la precision respecto al BF16 original, y el autor no aporta metricas de divergencia frente al modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el checkpoint deriva de `Qwen/Qwen3.8-27B` y el usuario debe verificar igualmente los terminos del modelo base.
- Despliegue: la unica ruta documentada es SGLang v0.5.20 con cuantizacion `modelopt`, formato `safetensors` y backend `trtllm_mha` para el draft. No hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- El servidor de referencia se enlaza a 127.0.0.1 y se arranca con `--max-running-requests 1`; no esta pensado para servir concurrencia alta sin redimensionar memoria y presupuestos de tokens.
- Madurez: 0 descargas y 0 likes, sin validacion independiente de la comunidad, con una ventana de publicacion muy corta (creado y actualizado el mismo dia).
- Seguridad: la receta publicada usa `--network host` y montajes de solo lectura; exponer el puerto 8000 fuera de loopback requiere una revision de seguridad separada segun el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mauromedda/fucina-qwen38-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft de decodificacion especulativa DFlash2: https://huggingface.co/maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal
- Recibo de repack (Fucina): https://github.com/PRJXAI/fucina/blob/evidence/qwen38-27b-nvfp4-v2-packed-receipt/docs/evidence/qwen38-27b-custom-nvfp4-local-hessian-v2-packed/repack-execute-01.json
- Handoff de reproduccion (Fucina): https://github.com/PRJXAI/fucina/blob/evidence/qwen38-27b-nvfp4-v2-packed-receipt/reproduction/README.md
- Informe de linea base de SGLang (2026-09-22): https://github.com/PRJXAI/fucina/blob/evidence/qwen38-27b-nvfp4-v2-packed-receipt/reproduction/evidence/SGLANG-BASELINE-20260922.md
- Documentacion de la CLI `hf`: https://huggingface.co/docs/huggingface_hub/guides/cli
