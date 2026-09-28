# decosaai/confidential-qwen-recipe

## Resumen

`decosaai/confidential-qwen-recipe` no es un modelo con pesos propios, sino una receta reproducible publicada por el usuario decosaai para servir el modelo upstream `Qwen/Qwen3.8-27B-FP8` (revisión `017b9c7a`) dentro de un entorno de ejecución confiable (TEE) por hardware. Concretamente, describe el despliegue sobre una máquina virtual confidencial Intel TDX con una GPU NVIDIA H200 en modo Confidential Computing (CC), usando vLLM como motor de inferencia. El objetivo es permitir inferencia cifrada de extremo a extremo con atestación verificable: el cliente cifra los prompts con HPKE a una clave que el TEE genera y demuestra por hardware, y cada respuesta se firma con la clave atestada para que el cliente pueda comprobar la prueba de forma offline.

El repositorio no re-suben pesos: se descargan los pesos upstream y se validan fichero a fichero contra un manifiesto (`qwen38-27b-fp8.manifest.json`, 80 archivos, raíz `2fc31dd7…02218`) antes de servirlos. Su relevancia actual radica en que documenta las particularidades de rendimiento y corrección al ejecutar inferencia de un modelo de ~27B en FP8 bajo GPU CC, un escenario donde las optimizaciones habituales de vLLM (runner V2, UVA, modo eager) fallan o degradan gravemente el throughput. Las mediciones incluidas se tomaron el 28 de septiembre de 2026 sobre un H200 de Phala Cloud (dstack-nvidia-0.5.9, driver 580.95.05, TCB `UpToDate`).

La información disponible no detalla la arquitectura interna, la longitud de contexto, los idiomas ni los parámetros exactos del modelo subyacente; la ficha se limita a lo documentado en la model card y marca como "no disponible" todo dato ausente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la receta no describe la arquitectura del modelo upstream; el modelo servido es Qwen3.8-27B-FP8) |
| Parametros totales | 27B segun el nombre del modelo upstream (no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no se indica si el modelo es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos upstream en FP8; KV cache en `fp8_e4m3` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | No se re-suben pesos; se usan los pesos upstream (safetensors) validados contra un manifiesto de 80 archivos |
| Tipo de artefacto | Receta de despliegue (código, compose y scripts), no un modelo con pesos |
| Motor de inferencia | vLLM (runner V1 con CUDA graphs; se desactiva el runner V2 por defecto) |
| Hardware objetivo | GPU NVIDIA H200 en modo Confidential Computing, sobre CVM Intel TDX |

## Arquitectura y entrenamiento

La información proporcionada no incluye datos de arquitectura, dataset de entrenamiento, número de tokens, ni proceso de alineación (RLHF/DPO) del modelo `Qwen3.8-27B-FP8`. Lo que sí documenta la receta es un componente arquitectónico relevante para la inferencia: los cabezales de predicción multi-token (MTP) del modelo, explotados mediante decodificación especulativa con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. Según la model card, el uso de los cabezales MTP "casi duplica la velocidad de un solo stream" y su salida greedy resultó byte a byte idéntica a la referencia en el conjunto de corrección empleado.

La innovación técnica descrita no está en el modelo, sino en la receta de servicio bajo GPU CC. Se identifican tres puntos críticos: (1) el runner V2 por defecto de vLLM 0.29 lee entradas a través de vistas UVA de memoria de host fijada, y bajo CC la GPU no puede leer memoria del guest directamente, lo que produce salidas basura (referencia al issue vllm#57224, reproducido en la CVM); (2) el workaround común de `--enforce-eager` limita cada stream a 8–10 tok/s porque los lanzamientos de kernel dominan; y (3) la combinación de CUDA graphs con MTP-3 y KV cache FP8 ofrece el mejor rendimiento sin pérdida de corrección. La receta incluye además un parche opcional (`lab/uvafix/`) que corrige el runner V2 bajo CC sustituyendo sus búferes UVA por copias H2D explícitas, en la línea del PR upstream #57415.

## Capacidades

- Servicio de inferencia cifrada de extremo a extremo: los prompts se sellan con HPKE en el cliente, se abren dentro del TEE, se responden, y la respuesta se sella y firma con la clave atestada.
- Atestación remota verificable offline: el endpoint `GET /v1/confidential/key` devuelve una clave junto con un bundle de evidencia (quote TDX, colateral de Intel PCS, log de eventos dstack con replay de RTMR3, token NRAS de NVIDIA).
- Verificación de integridad de pesos: cada archivo de pesos se comprueba contra el manifiesto antes de servir.
- Recibos firmados por llamada (`decosa.confidential_receipt.v1`) que referencian el hash de evidencia, el hash de política, los pesos y los hashes del criptograma, re-verificables offline.
- Decodificación especulativa mediante cabezales MTP con 3 tokens especulativos.
- Generación de texto con modo "thinking" activado en la ruta sellada y atestada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el conjunto de corrección incluye una traducción EN→FR).
- Capacidades especiales de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de LLM con confidencialidad verificable: desplegar un modelo de ~27B sobre una CVM Intel TDX con GPU H200 en modo CC, de forma que ni el proveedor de la nube ni el host puedan leer prompts o respuestas en claro, gracias al sellado HPKE y a la atestación por hardware.
- Cumplimiento y auditoría: usar los recibos firmados (`decosa.confidential_receipt.v1`) y el manifiesto de pesos para demostrar ante un auditor o un cliente regulado qué código y qué pesos exactos produjeron cada respuesta, re-verificándolos offline sin acceso al TEE.
- Procesamiento de datos sensibles en salud: la receta está pensada para notas clínicas sintéticas y datos regulados, si bien la propia model card advierte que el uso sanitario requiere un BAA (acuerdo de asociación comercial) con el anfitrión, ya que el TEE no elimina esa obligación.
- Análisis documental y resumen de contratos: el conjunto de corrección incluye resúmenes de contratos y extracción de JSON, por lo que la receta sirve como base para pipelines que procesan documentos legales confidenciales sin exponerlos al operador de la infraestructura.
- Despliegue de alto rendimiento bajo CC: servir cargas multi-usuario con cifrado por request aprovechando CUDA graphs, MTP-3 y KV cache FP8, alcanzando configuraciones con 1.939 tok/s agregados a concurrencia 32 en la variante V2 con el parche UVA.
- Investigación en computación confiable: servir como banco de pruebas reproducible para comparar configuraciones de vLLM (V1 frente a V2, eager frente a CUDA graphs, con y sin MTP/FP8) bajo restricciones de GPU CC, usando la puerta de corrección de 8 prompts greedy y el laboratorio `lab/lab.py`.
- Evaluación de latencia en tiempo real con cifrado: aplicar la ruta sellada y atestada para casos donde se requiere latencia predecible, con una p50 de 3,35 s a concurrencia 1 y 8,41 s a concurrencia 32 en las mediciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente mediciones de rendimiento del motor y de la ruta cifrada, además de una puerta de corrección cualitativa (8 prompts greedy con similitud media mínima de 0,4).

Puerta de corrección: los prompts cubren aritmética, una lista, traducción EN→FR, una nota clínica sintética, un resumen de contrato, extracción de JSON, código y conteo. El prompt del laboratorio de motores es de ~1.575 tokens con 512 tokens de salida e `ignore_eos`; las cifras son tok/s de salida.

| Configuración | Corrección | c=1 por stream | Agregado c=8 | Agregado c=32 | Latencia p50 c=32 |
|---|---|---:|---:|---:|---:|
| V1 + eager (workaround común) | referencia | 9,8 | 71 | 248 | 65,3 s |
| V1 + CUDA graphs | 8/8 sensato, 7/8 idéntico | 76,8 | 402 | 1.312 | 12,4 s |
| V1 + graphs + MTP-3 + KV fp8 | 8/8 idéntico | 140 | 628 | 1.722 | 8,9 s |
| V2 + graphs + parche UVA (`lab/uvafix`) | 8/8 sensato, 7/8 idéntico | 75,5 | 486 | 1.308 | 12,5 s |
| V2 + parche UVA + MTP-3 + KV fp8 | 8/8 sensato, 7/8 idéntico | 163 | 844 | 1.939 | 8,1 s |

Ruta sellada y atestada de extremo a extremo (generación natural con thinking activado, respuestas de 512 tokens, prompt de ~1.575 tokens; 10 minutos por nivel con `scripts/confidential/soak.py`):

| Concurrencia | Peticiones | Errores | Latencia p50 | Latencia p95 | Tok/s de salida | Tok/s de prompt |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 167 | 0 | 3,35 s | 4,47 s | 141 | 449 |
| 8 | 993 | 0 | 4,58 s | 6,25 s | 836 | 2.658 |
| 32 | 2.169 | 0 | 8,41 s | 11,54 s | 1.821 | 5.793 |

Para comparación, el workaround común (V1 + eager) a través de la misma ruta dio 53,4 s de p50 a concurrencia 1 (9,2 tok/s).

## Requisitos de hardware

- GPU objetivo: NVIDIA H200 en modo Confidential Computing, sobre una CVM Intel TDX (mediciones realizadas en Phala Cloud con dstack-nvidia-0.5.9, driver 580.95.05).
- VRAM estimada: no disponible como cifra explícita en la model card. Con pesos en FP8, el peso del modelo de ~27B rondaría los ~27 GB solo en pesos, a lo que habría que sumar KV cache y overhead del runtime; no se confirma este cálculo en la información proporcionada.
- GPU consumer: no disponible. La receta está atada a hardware con soporte de GPU CC (H200); no se documenta su funcionamiento en GPUs de consumo.
- Opciones de despliegue: vLLM con los ajustes de la receta; se incluye `compose/docker-compose.vllm-cc.yml` como compose mínimo. El runner V2 requiere el parche opcional `lab/uvafix/` para ser correcto bajo CC.
- Ajustes de despliegue clave: `VLLM_USE_V2_MODEL_RUNNER=0`, sin `--enforce-eager`, `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'` y `--kv-cache-dtype fp8_e4m3`.
- Latencia y throughput: ver tablas de la sección anterior (141 tok/s de salida a concurrencia 1 en la ruta sellada; hasta 1.939 tok/s agregados en el laboratorio de motores con V2 + UVA fix + MTP-3 + FP8 KV).
- Herramientas de cliente: Python 3.11+ y el paquete `cryptography`; los scripts se ejecutan desde `src/` y localizan `decosa_api` y `pouw_inference` en su directorio adyacente.
- Otras opciones de despliegue (Ollama, llama.cpp, TGI): no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables de la misma categoría en la información proporcionada. Dado que el artefacto es una receta de despliegue confidencial y no un modelo con pesos, la comparación más significativa es entre las configuraciones de servicio evaluadas por el propio autor:

| Criterio | V1 + eager | V1 + CUDA graphs + MTP-3 + FP8 KV | V2 + UVA fix + MTP-3 + FP8 KV |
|---|---|---|---|
| Corrección | referencia | 8/8 idéntico | 8/8 sensato, 7/8 idéntico |
| Tok/s por stream (c=1) | 9,8 | 140 | 163 |
| Tok/s agregados (c=32) | 248 | 1.722 | 1.939 |
| Latencia p50 (c=32) | 65,3 s | 8,9 s | 8,1 s |
| Requiere parche | no | no | sí (`lab/uvafix`) |

No se dispone de comparativas con otras soluciones de inferencia confiable (por ejemplo, alternativas sobre SEV-SNP o Azure HCL) más allá de la mención de que el verificador de la receta soporta también TDX, SEV-SNP, Azure HCL, dstack y NVIDIA NRAS.

## Limitaciones y advertencias

- Un TEE demuestra qué código y qué pesos se ejecutaron, pero no que la respuesta sea correcta.
- Los ataques físicos por interposer (TEE.fail, DDRop) quedan fuera del alcance de Intel, AMD y NVIDIA.
- El host de la nube sigue viendo metadatos (tamaños, temporización) y puede detener la VM.
- El sistema operativo dentro del TEE pertenece al proveedor (aquí dstack): es medido y reproducible, pero es código de terceros.
- El uso sanitario requiere un BAA con el anfitrión; un TEE no elimina esa obligación.
- La receta depende de una revisión concreta del modelo upstream (`017b9c7a`) y de un manifiesto de pesos (80 archivos); cualquier desviación debe detectarse en la verificación previa.
- Bajo CC, el runner V2 por defecto de vLLM 0.29 produce salidas incorrectas si no se aplica el parche `lab/uvafix` o no se usa el runner V1; es un riesgo operativo relevante.
- Sesgos conocidos del modelo subyacente: no disponible en la información proporcionada.
- Riesgo de alucinación del modelo subyacente: no disponible en la información proporcionada (no es objeto de la model card).
- Limitaciones de contexto o idioma: no disponible en la información proporcionada.
- Restricciones de licencia para uso comercial: la licencia del repositorio es apache-2.0; las condiciones del modelo upstream (`Qwen/Qwen3.8-27B-FP8`) deben consultarse en su propia ficha.
- El repositorio registra 0 descargas y 0 "likes", por lo que no hay validación externa de la comunidad documentada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/decosaai/confidential-qwen-recipe
- Modelo upstream servido: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Issue de vLLM sobre el runner V2 bajo CC: https://github.com/vllm-project/vllm/issues/57224
- PR upstream relacionado con el arreglo UVA: https://github.com/vllm-project/vllm/pull/57415
