# 7dsolv/Konaet-Cauryvo-202M-muNEX-3F

## Resumen

Konaet Cauryvo 202M en formato µNEX-3F Strict es un modelo neuronal de generación de texto desarrollado por Adilson Oliveira bajo el sello Konaet (usuario 7dsolv). Se trata de un modelo de aproximadamente 202 millones de parámetros cuya particularidad es que sus pesos se distribuyen exclusivamente como símbolos de 3 bits exactos dentro de un único archivo propietario llamado `model.mn3f`, sin incluir `safetensors`, pesos maestros de entrenamiento, estado de optimizador ni pesos de terceros. Esto lo convierte en un caso poco habitual: el artefacto publicado es directamente el payload cuantizado, auditable mediante firma Ed25519 y un contrato interno denominado Exact 3.

El modelo emplea una arquitectura propia, Konaet Cauryvo v2, y un tokenizador también propio, Konaet Byte v1, con vocabulario reversible. El idioma declarado es exclusivamente portugués (pt). La generación se realiza con decodificación voraz determinista, y el runtime de referencia en Python materializa los valores decodificados en FP32 para maximizar portabilidad, sin que ello altere el origen de 3 bits de los pesos.

Su relevancia actual es más metodológica que de rendimiento: propone un flujo reproducible de verificación criptográfica (firma, inventario, hashes y contrato de cuantización) y una reconstrucción de parámetros a partir de un empaquetado de 3 bits por valor. Es, por tanto, un artefacto orientado a investigación sobre compresión, verificación de pesos y despliegue determinista, más que un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Konaet Cauryvo v2 (propietaria; la informacion disponible no especifica si es transformer, MoE o hibrida) |
| Parametros totales | 202.049.825 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits exactos por valor (formato µNEX-3F Strict); el runtime de referencia decodifica a FP32 |
| Idiomas soportados | portugues (pt) |
| Licencia | Konaet Authenticated Research and Commercial License 1.1 (`LicenseRef-Konaet-ARCL-1.1`) |
| Formato de pesos | `model.mn3f` (payload empaquetado de 3 bits); sin `safetensors`, sin GGUF, sin pesos externos |

## Arquitectura y entrenamiento

La arquitectura declarada es Konaet Cauryvo v2, sin que la documentacion facilite detalles sobre el tipo de bloque (transformer, MoE, SSM o hibrido), la profundidad, el ancho ni el mecanismo de atencion. El modelo se distribuye como un payload logico de 606.149.475 bits a una tasa constante de 3,000000 bits por valor, lo que produce un archivo fisico de 75.768.685 bytes con 5 bits de relleno final para alineacion (`ceil(3 x N / 8)`). El flujo de ejecucion descarga una revision fija (`v0.3.0-exact3-public.1`), valida la firma Ed25519, el inventario, cada hash y el contrato Exact 3, e instancia Cauryvo v2 reconstruyendo sus parametros unicamente a partir de los simbolos de 3 bits.

En cuanto al entrenamiento, la model card indica que el candidato publicado se eligio por tener la menor perdida de validacion entre tres semillas entrenadas durante 1.000 pasos. El test reservado reporta una razon de perdida de 0,9487948922 frente al checkpoint Konaet original, dentro del limite predefinido de 1,05. El replay directo reprodujo los logits con un error absoluto maximo de 0,0000038147 y preservo las tres generaciones evaluadas. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF, DPO u otro tipo de ajuste. La decodificacion en inferencia es voraz y determinista.

## Capacidades

- Generacion de texto en portugues (pt), idioma unico declarado.
- Decodificacion voraz determinista: la misma entrada produce la misma salida, lo que favorece la reproducibilidad.
- Reconstruccion de pesos a partir de un empaquetado de 3 bits verificable criptograficamente (firma Ed25519 y contrato Exact 3).
- Tokenizacion propia mediante Konaet Byte v1, descrita como reversible.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, thinking mode ni modo extendido de razonamiento.
- No se declara multilingue: el unico idioma soportado segun la informacion disponible es el portugues.

## Casos de uso

- Investigacion en cuantizacion extrema: permite estudiar el comportamiento de un modelo de 202M con pesos almacenados a 3 bits exactos por valor y comparar los logits reconstruidos (error absoluto maximo de 0,0000038147) frente al checkpoint original.
- Verificacion de integridad de artefactos: el flujo `verify_release.py` valida firma Ed25519, inventario y hashes, por lo que resulta util como referencia para pipelines que necesiten certificar la autenticidad de pesos antes de cargarlos.
- Reproducibilidad de experimentos: al usar decodificacion voraz determinista, encaja en protocolos de evaluacion donde se exige que la salida sea identica entre ejecuciones.
- Despliegue en entornos con almacenamiento muy limitado: al ocupar el payload unos 75,8 MB en disco, puede almacenarse y transportarse en dispositivos con restricciones severas de espacio.
- Docencia y prototipado de runtimes personalizados: el par `verify_release.py` y `run_model.py` sirve como ejemplo didactico de carga de un formato de pesos no estandar y reconstruccion en FP32.
- Generacion de texto en portugues en escenarios de bajo coste: con un modelo de 202M de parametros, es planteable para tareas simples de continuacion o plantillas en portugues, siempre que se acepte la ausencia de benchmarks publicados.
- Auditoria de licencias y procedencia: la revision fija, el hash SHA-256 del payload y el fingerprint de la clave oficial facilitan trazar el origen exacto del artefacto en entornos de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta metricas internas del protocolo de publicacion:

| Metrica | Valor |
|---|---|
| Razon de perdida en test reservado frente al checkpoint Konaet original | 0,9487948922 (limite predefinido: 1,05) |
| Error absoluto maximo en replay directo de logits | 0,0000038147 |
| Generaciones evaluadas preservadas | 3 |
| Semillas entrenadas | 3 (1.000 pasos cada una) |
| MMU / HumanEval / GSM8K u otros benchmarks publicos | no disponible |

El propio autor advierte que estos resultados demuestran funcionamiento y calidad dentro del protocolo registrado, pero no superioridad general ni aptitud certificada para produccion.

## Requisitos de hardware

- Tamano del payload en disco: 75.768.685 bytes (aproximadamente 72,3 MiB).
- Al materializar los parametros en FP32, la huella de pesos ronda los 0,81 GB (202.049.825 valores x 4 bytes), a la que hay que sumar el overhead del runtime y las activaciones.
- Cabe sin problema en cualquier GPU de consumo con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090), e incluso es viable en CPU para un modelo de este tamano.
- El runtime de referencia es Python y requiere `huggingface_hub>=1.0,<2`, `cryptography>=46,<47`, `numpy>=2,<3` y `torch>=2.5,<3`.
- No se declara compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `model.mn3f` es propietario y la carga se realiza mediante `run_model.py`.
- El campo `inference: false` de la metadata indica que no hay widget de inferencia alojado en Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, y el formato propietario de 3 bits, junto con la ausencia de benchmarks publicos, impide una comparacion significativa con alternativas de tamano similar. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comparacion |
|---|---|---|---|---|---|
| Konaet Cauryvo 202M µNEX-3F | 202.049.825 | no disponible | Konaet ARCL 1.1 | Hugging Face, revision fija | referencia |
| Alternativas de ~200M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de portugues; no hay evidencia de capacidades en otros idiomas.
- No se han publicado benchmarks estandar, por lo que no puede evaluarse su calidad frente a modelos de tamano comparable.
- El autor indica explicitamente que los resultados no demuestran superioridad general ni certifican uso en produccion.
- El formato `model.mn3f` es propietario: no es compatible con herramientas estandar de inferencia (vLLM, llama.cpp, Ollama, TGI) ni con pesos `safetensors` o GGUF.
- La licencia Konaet Authenticated Research and Commercial License 1.1 es de tipo `other`; no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que se recomienda revisar el archivo LICENSE antes de cualquier explotacion.
- La firma Ed25519 acredita la autoria de los bytes publicados, pero, como advierte el propio autor, no impide la copia ni sustituye prueba cientifica o registro juridico.
- La decodificacion voraz determinista limita la diversidad de las salidas; no se documenta soporte de muestreo, temperatura ni otras estrategias de decodificacion.
- Con 202M de parametros y 3 bits por valor, es esperable una capacidad limitada de razonamiento y de conocimiento factual, aunque no se aportan mediciones al respecto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- La model card no especifica la longitud de contexto ni la composicion del dataset de entrenamiento, lo que dificulta anticipar su comportamiento en entradas largas o dominios concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/7dsolv/Konaet-Cauryvo-202M-muNEX-3F
- Notebook de demostracion en Colab: https://colab.research.google.com/github/7dsolv/Konaet-muNEX-3F-Demo/blob/main/Konaet_muNEX3F_Demo.ipynb
- Repositorio de la demo en GitHub: https://github.com/7dsolv/Konaet-muNEX-3F-Demo
- Licencia (referencia relativa en el repositorio): LICENSE (`LicenseRef-Konaet-ARCL-1.1`)
- Fingerprint de la clave oficial: `SHA256:48bcbac03152e0aec40553eb1ea9e6e50e9b73257b837d0d0e6f2df89b437de0`
- SHA-256 del archivo `model.mn3f`: `d78be3243bfb6fd5d0aee46c49ce4faa00df8c5a8913a1f3978edec4b4147d9b`
- Revision del codigo fuente usada en la montaje: `14c9c2265aaa38510973ab8766b0d9eff936da91`
- Resultados de busqueda web: la consulta no devolvio enlaces tecnicos relevantes sobre el modelo.
