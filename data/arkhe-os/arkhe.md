# arkhe-os/arkhe

## Resumen

`arkhe-os/arkhe` es un artefacto GGUF publicado por arkhe-os (16 de septiembre de 2026, 0 descargas y 0 likes) que consiste en una conversion cuantizada a Q8_0 de `Qwen/Qwen2.5-1.5B-Instruct`, un modelo instruct de 1.543.714.304 parametros, generada con `llama.cpp` y, sobre todo, portadora de metadatos de atestacion de Arkhe OS incrustados en la cabecera del propio fichero GGUF.

El proposito declarado del repositorio no es el modelo en si, sino demostrar que un artefacto puede describir su propia procedencia de forma verificable sin depender de la pagina que lo aloja. La model card detalla la cadena completa y reproducible (descarga del modelo base, conversion, inyeccion de metadatos y verificacion con `arkhe-verify`), e incluye los hashes SHA-256 de cada paso.

Es relevante ahora porque aborda un problema de cadena de suministro en IA: saber que bytes estas ejecutando y quien los declara. La innovacion tecnica es el esquema de metadatos `arkhe.attestation.` version 1.4, que separa los hashes del sujeto (dentro del fichero) de la prueba de anclaje (en un bundle externo `.sig`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; no detallada en el repositorio) |
| Parametros totales | 1.543.714.304 (contados al cargar los 338 tensores dequantizados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base declara su propia ventana en su model card |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado). `convert_hf_to_gguf.py` admite `f32, f16, bf16, q8_0, tq1_0, tq2_0, auto`; los K-quants requieren un paso adicional con `llama-quantize` |
| Idiomas soportados | no disponible (el repositorio no declara lista de idiomas) |
| Licencia | apache-2.0 (modelo base tambien Apache-2.0) |
| Formato de pesos | GGUF version 3, 338 tensores, 49 pares clave-valor (35 de la conversion + 14 de atestacion) |
| Tamano del fichero | `arkhe.gguf`, 1.646.574.272 bytes (1.53 GiB) |
| SHA-256 del artefacto | `10bf45ab933af59e501b9fa63a0a8a1d26a9ec15adf2f13f7dfbe567dbc07708` |
| Modelo base | `Qwen/Qwen2.5-1.5B-Instruct` |
| Libreria declarada | llama.cpp |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna, el dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base. Lo que si documenta con detalle es el procedimiento de conversion, que es lineal y reproducible: descarga de los ficheros del modelo base desde Hugging Face, verificacion del SHA-256 de `model.safetensors` (`dd924a11b4c220f385b51ffa522daea7c9f3d850e31b162bb5661df483c6d3ee`), conversion a GGUF Q8_0 con `convert_hf_to_gguf.py` (resultado: SHA-256 `9822626ecb93d38a8f0b983f7bc0fcd15d4c6d890e88cdcea7703fe5b27c651d`) e inyeccion de metadatos con `tools/arkhe-gguf/extend_metadata.py`. No hubo reentrenamiento ni fine-tuning: el artefacto es una conversion con herramientas estandar de `llama.cpp`.

La innovacion tecnica esta en el esquema de atestacion 1.4. Se escriben 14 pares clave-valor bajo el prefijo `arkhe.attestation.` dentro de la cabecera GGUF, de modo que modificar cualquiera de ellos altera el SHA-256 del fichero. La version 1.4 corrige un problema de diseno de la 1.3: los campos `anchored.log_id`, `anchored.log_index` y `anchored.inclusion_proof` ya no se escriben dentro del fichero, porque solo existen despues de anclar y anclar implica firmar, lo que cambiaria los bytes cubiertos por la firma. En su lugar, el fichero lleva los hashes del sujeto y el anclaje se traslada a un bundle companero (`.sig`), siguiendo el enfoque de OpenSSF Model Signing. El autor declara explicitamente que el artefacto **no esta firmado**: `anchored.external: true` es hoy una declaracion de intencion y el bundle no existe, por lo que la verificacion real debe apoyarse en el SHA-256 y en reproducir los pasos.

## Capacidades

- Generacion de texto conversacional: hereda el comportamiento instruct del modelo base Qwen2.5-1.5B, con plantilla de chat de Qwen.
- Capacidades declaradas por el firmante: `attested.declared_capabilities` esta vacio, y el propio autor lo justifica como "una afirmacion vacia es la honesta".
- Capacidades explicitamente negadas: `code-execution`, `network-access`, `file-write` y `shell-execution` figuran en `attested.not_capabilities`.
- Autodescripcion de procedencia: el fichero transporta hashes de origen, tipo de atestacion (`PROMISE`), marca temporal de inyeccion, politica de revocacion y URI del bundle de anclaje.
- Capacidades del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue): no verificadas ni declaradas en este repositorio; deben consultarse en la model card de `Qwen/Qwen2.5-1.5B-Instruct`.
- Compatibilidad de ejecucion: carga tanto en `llama.cpp` como en `transformers` mediante `gguf_file`, segun los ejemplos de la propia model card.

## Casos de uso

- Verificacion de cadena de suministro de modelos: descargar `arkhe.gguf`, comprobar que su SHA-256 coincide con `10bf45ab...7708` y confirmar que los 14 pares `arkhe.attestation.` estan presentes antes de desplegarlo en produccion.
- Integracion en CI/CD: usar el hash publicado como valor esperado en un job que valide artefactos descargados, de modo que cualquier modificacion de la cabecera GGUF rompa el pipeline de forma explicita.
- Reproducibilidad de conversiones: el flujo documentado (descarga, conversion Q8_0, inyeccion, verificacion) sirve como plantilla para auditar otras conversiones GGUF propias y confirmar que no se pierden tensores.
- Formacion y docencia en procedencia de IA: el caso ilustra de forma tangible la diferencia entre "afirmar" una procedencia y "demostrarla", incluyendo el reconocimiento honesto de que el artefacto aun no esta firmado.
- Inferencia local ligera: con 1.53 GiB de pesos, el modelo puede ejecutarse en portatiles sin GPU para tareas de generacion de texto breve, resumen o clasificacion en entornos aislados.
- Prototipado de asistentes conversacionales: `llama-server` o `llama-cli` permiten levantar un endpoint compatible con la API de OpenAI para desarrollo y pruebas de integracion.
- Validacion de la ruta `transformers` + GGUF: el codigo incluido en la model card (`AutoModelForCausalLM.from_pretrained(..., gguf_file="arkhe.gguf")`) sirve para comprobar que un mismo artefacto es consumible desde dos ecosistemas distintos.
- Despliegue en edge o air-gapped: al ser un fichero unico y autocontenido, es adecuado para entornos sin conectividad donde la verificacion por hash es el unico control de integridad viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y la model card es explicita al afirmar que el interes del artefacto no es el modelo. El unico dato cuantitativo verificable es la coherencia del recuento de parametros: al cargar los 338 tensores dequantizados se obtienen 1.543.714.304 parametros, identicos a los que declara el modelo fuente, lo que el autor usa como evidencia de que la conversion no descarto informacion.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1.53 GiB; en la practica, con el runtime y el cache KV, conviene reservar entre 2 y 3 GB para contextos moderados, y mas si se amplia la ventana de contexto. Cifra estimada a partir del tamano del fichero, no publicada por el autor.
- GPU recomendadas: no disponibles. El repositorio no especifica hardware objetivo.
- GPU consumer: si, cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060 o superiores) y tambien en CPU con suficiente RAM.
- Ejecucion en CPU: soportada de forma nativa, puesto que el formato es GGUF y la libreria declarada es `llama.cpp`.
- Opciones de despliegue documentadas: `llama-cli -m arkhe.gguf -p "..." -n 64`, `llama-server`, y `transformers` con `gguf_file="arkhe.gguf"`. Otras herramientas compatibles con GGUF (Ollama, LM Studio, KoboldCpp) no estan documentadas en el repositorio, aunque el formato deberia permitirlas. vLLM y TGI no aparecen mencionados.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Rasgo diferencial |
|---|---|---|---|---|---|---|
| arkhe-os/arkhe | 1.543.714.304 | GGUF v3 | Q8_0 | no disponible | Apache-2.0 | Metadatos de atestacion incrustados en la cabecera; no firmado |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | safetensors | pesos completos (bf16/fp16) | segun su propia model card | Apache-2.0 | Modelo origen, sin metadatos de procedencia ni cuantizacion |
| Otras conversiones GGUF comunitarias del mismo base | 1.543.714.304 | GGUF | Q4_K_M, Q5_K_M, Q8_0, etc. | segun el conversor | Apache-2.0 | Suelen ofrecer varias cuantizaciones y tamanos mas reducidos; no incluyen atestacion |

No se dispone de datos de rendimiento comparados para ninguna de las tres filas dentro de la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y rasgos estructurales.

## Limitaciones y advertencias

- El artefacto no esta firmado: `anchored.external: true` es una declaracion de intencion y el bundle `.sig` indicado en `anchored.bundle_uri` no existe todavia. La unica garantia operativa hoy es el SHA-256 publicado y la reproduccion manual de los pasos.
- La atestacion es de tipo `PROMISE`: las capacidades declaradas son afirmaciones del firmante, no verificaciones, tal y como el propio campo `attested.disclaimer` indica.
- `attested.declared_capabilities` esta vacio, de modo que el artefacto no reclama ninguna capacidad funcional concreta.
- Riesgo de alucinacion: inherente a un modelo de 1.5B parametros; el repositorio no publica evaluaciones que lo cuantifiquen ni mitiguen.
- Sesgos: no documentados. Al ser una conversion sin reentrenamiento, heredaria los del modelo base, que no se analizan aqui.
- Contexto e idiomas: el repositorio no declara ni ventana de contexto ni lista de idiomas soportados; cualquier afirmacion al respecto debe verificarse contra la documentacion del modelo base.
- Politica de revocacion: se declara `revocation.strategy: short_lived` con punto de revocacion en `https://arkhe.computer/revocation.json`. Conviene comprobar ese endpoint antes de depender del artefacto, dado que la estrategia es de vida corta.
- Un solo fichero y una sola cuantizacion (Q8_0, 1.53 GiB): no hay variantes Q4_K_M ni Q5_K_M, por lo que no se puede reducir mas el consumo de memoria sin reconvertir.
- La model card parece truncada al final del apartado de `transformers` (la frase "which is how we know the conversion did not silently drop" queda incompleta), por lo que la evidencia de integridad se limita a lo aqui citado.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/arkhe-os/arkhe
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Arkhe OS (herramientas `tools/arkhe-gguf/` y `crates/arkhe-verify/`): https://github.com/rafael-arkhe/arkhe
- `llama.cpp` (conversion y ejecucion GGUF): https://github.com/ggerganov/llama.cpp
- Punto de revocacion declarado en los metadatos: https://arkhe.computer/revocation.json
- Nota sobre la busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las coincidencias obtenidas corresponden a foros de automocion (Audi A5) y a una agencia de desarrollo web homonima (`arkhedigital.net`), sin relacion con el artefacto.
