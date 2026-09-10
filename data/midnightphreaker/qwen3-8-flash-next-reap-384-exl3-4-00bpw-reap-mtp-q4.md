# MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4

## Resumen

Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4 es una derivacion cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario MidnightPhreaker. No se trata de un modelo oficial de Qwen, sino de una conversion comunitaria a formato EXL3 para la biblioteca ExLlamaV3. El artefacto parte de un modelo intermedio ya podado con la tecnica REAP (384 expertos enrutados) y cuantizado a 4,00 bpw, sobre el que se ha reconvertido unicamente el componente MTP (multi-token prediction) a EXL3 K4/K5/K6 con la utilidad standalone de ExLlamaV3.

La relevancia de esta ficha es acotada y conviene ser explicito: el autor declara que **no se ejecuto ninguna inferencia, prueba de aceptacion especulativa, KL ni perplejidad** sobre esta derivacion Q4. Se trata, por tanto, de un artefacto de pesos verificados a nivel de integridad (layout de tensores, valores finitos, coherencia de indices y SHA-256 de los ficheros no-MTP), pero sin validacion de calidad. El repositorio tiene 78,6 GB, 0 descargas y 0 likes en el momento de la consulta.

El modelo conserva una torre de vision en BF16 sin modificar, ademas del decodificador EXL3, el cabezal de salida compartido K6 y una tabla de n-gramas K4 que, junto con las cabezas MTP, habilita decodificacion especulativa en ExLlamaV3. La licencia es la Qwen Community License 1.0, no Apache-2.0 ni MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE) de 384 expertos enrutados, cabezas MTP para decodificacion especulativa y torre de vision; derivado podado con REAP |
| Parametros totales | 39.256.340.371 (39,26 B) segun los safetensors del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (exl3), formato de 4 bits: decodificador principal uniforme K4 a 4,00 bpw; expertos enrutados e indexador MTP en K4 mul1; proyecciones de entrada MTP en K5 mul1; atencion y experto compartido MTP en K6 mul1; cabezal de salida compartido K6; tabla de n-gramas K4 nominal; vision en BF16 sin cambios. Norms, router y tensores MTP no cuantizados conservan almacenamiento en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `license: other`); no es Apache-2.0 ni MIT |
| Formato de pesos | safetensors, cuantizacion EXL3 para la biblioteca exllamav3 |

Otros datos del repositorio: tamano del repo 78,6 GB, pipeline `text-generation`, libreria `exllamav3`, creado el 2026-09-10T16:55:05Z y actualizado el 2026-09-10T16:55:32Z, 0 descargas y 0 likes. Tags: `exllamav3`, `safetensors`, `qwen4_exp`, `exl3`, `qwen`, `reap`, `mtp`, `quantized`, `text-generation`, `conversational`, `base_model:Qwen/Qwen3.8-Flash-Next`, `base_model:quantized:Qwen/Qwen3.8-Flash-Next`, `license:other`, `4-bit`, `region:us`, `base_model_relation:quantized`.

## Arquitectura y entrenamiento

La arquitectura subyacente es de tipo MoE con 384 expertos enrutados en el decodificador principal, segun la model card. Sobre ese tronco se anaden componentes MTP que permiten decodificacion especulativa, apoyados ademas en una tabla de n-gramas shardeada. El modelo incorpora un payload de vision que en esta derivacion permanece en tensores BF16 originales, sin cuantizar, por lo que el artefacto es multimodal en entrada de imagenes aunque la model card no detalla el codificador visual.

No hubo entrenamiento en esta derivacion: es una conversion de pesos. El componente MTP en BF16 del padre `MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP`, en el commit `2275ddcef8b3a026192bb96f0a87ae3b7f03be97`, se convirtio con la utilidad standalone de ExLlamaV3 usando `-mb 4 -hq -d 0`. El decodificador principal, el cabezal de salida, la tabla de n-gramas K4 y el payload de vision BF16 son byte-identicos al padre. No se descargo el modelo principal en BF16, no se repodo y no se recalibro el modelo principal. El convertidor proceso el MTP en solitario con `mul1` y escalado de respaldo, **sin dataset de calibracion de activaciones**. La conversion se realizo con ExLlamaV3 1.4.8, PyTorch 2.9.0 y CUDA 12.8. La procedencia del tronco indica que se reprodujo a partir de pesos BF16 de Qwen usando las selecciones de 384 expertos publicadas por sh0wie; los expertos MTP se rankearon de forma independiente en la compilacion padre y no se modificaron aqui.

## Capacidades

- Generacion de texto y uso conversacional, segun el pipeline declarado (`text-generation`) y el tag `conversational`.
- Entrada de imagenes: el repositorio incluye la torre de vision original en BF16, aunque la model card no documenta el formato de entrada ni el preprocesado esperado.
- Decodificacion especulativa: las cabezas MTP reconvertidas mas la tabla de n-gramas K4 estan disenadas para acelerar la generacion en ExLlamaV3.
- Inferencia de pesos cuantizados EXL3 de 4 bits con mezcla de precision (K4/K5/K6) segun el tipo de tensor.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles. La model card no las documenta ni se han publicado evaluaciones.
- Soporte de agentes, multi-step reasoning o modos de pensamiento explicito: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Fine-tuning: no documentado; es un artefacto de pesos cuantizados, no una base de entrenamiento.

## Casos de uso

- Inferencia local de alta gama con ExLlamaV3: el modelo esta empaquetado especificamente para esta biblioteca, con EXL3 de 4 bits y MTP para decodificacion especulativa, de modo que encaja en nodos con GPU de 80 GB que necesiten servir un LLM multimodal sin depender de APIs externas.
- Despliegue on-premise con datos sensibles: al ejecutarse en hardware propio y no requerir salida a Internet, es apto para entornos con requisitos de soberania de datos, siempre que se valide antes su calidad, hoy no medida.
- Procesamiento de documentos con componente visual: la torre de vision en BF16 permite plantear tareas de descripcion de imagen o extraccion de informacion de capturas y documentos escaneados, sin cuantizacion adicional en esa rama.
- Asistente conversacional multi-turno: el tag `conversational` y el formato de chat del modelo base lo orientan a dialogos, aunque la longitud de contexto no esta documentada y debe medirse en el entorno real antes de fijar politicas de truncado.
- Investigacion en cuantizacion y poda: sirve como artefacto de estudio para analizar como interactuan REAP (poda de expertos) y EXL3 con mezcla K4/K5/K6, comparando esta derivacion Q4 del MTP con el padre en BF16.
- Reproduccion y verificacion de artefactos: el repositorio incluye manifiestos de checksums (`artifact_manifest.json`) y metadatos de conversion (`mtp_quantization.json`) que permiten auditar la cadena de custodia de los pesos, un caso de uso habitual en equipos de ML platform.
- Servicio de generacion de texto de proposito general en GPU unica: con 78,6 GB de pesos, un A100/H100 de 80 GB puede alojar el modelo completo en una sola tarjeta, lo que simplifica el despliegue frente a configuraciones multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto inferencia, prueba de aceptacion especulativa, KL ni perplejidad para esta derivacion Q4, y que los registros historicos de poda y calibracion describen la compilacion padre, no la calidad de este artefacto.

La unica validacion declarada es de integridad estructural:

| Validacion | Alcance |
|---|---|
| Layout real de tensores MTP | Verificado |
| Tensores en coma flotante finitos | Verificado |
| Coincidencia exacta de indices y cabeceras | Verificado |
| Preservacion SHA-256 de ficheros no-MTP | Verificado |
| Inferencia / aceptacion especulativa / KL / perplejidad | No ejecutado |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 78,6 GB, por lo que cargar todos los pesos requiere del orden de 80 GB de VRAM. Es una estimacion aritmetica a partir del tamano del repo, no un dato publicado; el autor no documenta consumo en inferencia ni overhead de cache KV.
- GPU recomendadas: por capacidad de VRAM, A100 80 GB, H100 80 GB o H200. El autor no publica una lista de GPU validadas.
- GPU de consumo: no cabe en una RTX 4090 o RTX 5090 de 24 GB. Un reparto entre 2-4 tarjetas de 24 GB seria teoricamente posible por capacidad agregada, pero la compatibilidad con el sharding de la tabla de n-gramas y con ExLlamaV3 no esta documentada.
- Runtime obligatorio: ExLlamaV3 en una version que soporte esta arquitectura y la tabla de n-gramas shardeada del padre. La conversion se hizo con ExLlamaV3 1.4.8, PyTorch 2.9.0 y CUDA 12.8.
- Otras opciones de despliegue (llama.cpp, Ollama, vLLM, TGI): no disponibles. El formato EXL3 no es GGUF y la model card solo declara exllamav3.
- Latencia y throughput: no disponibles. Aunque el modelo incorpora MTP y tabla de n-gramas para decodificacion especulativa, no se ha medido la tasa de aceptacion ni los tokens por segundo.
- Advertencia de instalacion: mantener este modelo en un directorio separado y no colocar junto a el el fichero MTP en BF16 del padre, porque las claves de tensor duplicadas pueden sobrescribirse entre si.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Componente MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MidnightPhreaker, REAP-384 MTP Q4) | 39,26 B | EXL3 K4/K5/K6, decodificador a 4,00 bpw | MTP reconvertido a EXL3 K4 con proyecciones K5 y atencion K6 | Qwen Community License 1.0 | Publicado, 0 descargas, sin benchmarks |
| MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP (padre) | no disponible | EXL3 4,00 bpw con MTP en BF16 | MTP en BF16 | Qwen Community License 1.0 | Publicado; commit de referencia `2275ddcef8b3a026192bb96f0a87ae3b7f03be97` |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la informacion proporcionada | BF16 | BF16 | Qwen Community License 1.0 (segun el campo de licencia del derivado) | Modelo base oficial |

No se dispone de datos de otros modelos comparables de la misma categoria (parametros, contexto, rendimiento y licencia) en la informacion proporcionada. La comparacion se limita, por tanto, a la cadena de derivacion directa.

## Limitaciones y advertencias

- Calidad no verificada: no se ejecuto inferencia, prueba de aceptacion especulativa, KL ni perplejidad. No hay ninguna evidencia publicada de que esta conversion Q4 preserve el comportamiento del padre.
- Conversion sin calibracion de activaciones: el MTP se convirtio con `mul1` y escalado de respaldo, sin dataset de calibracion, lo que puede degradar la precision de esos tensores.
- Los registros historicos de poda y calibracion describen la compilacion padre; no acreditan la calidad de este Q4.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Riesgo de alucinacion: no evaluado en esta derivacion. Es un riesgo inherente a los modelos generativos del modelo base y no se ha medido aqui.
- Sesgos: no documentados. No hay evaluacion de sesgos para esta derivacion ni informacion sobre la composicion del dataset original.
- Idiomas: no disponibles; el repositorio no declara idiomas soportados.
- Contexto: no disponible; no se puede planificar truncado, coste de cache KV ni estrategias de chunking sin medirlo en local.
- Restricciones de licencia: Qwen Community License 1.0, que no es Apache-2.0 ni MIT. Es obligatorio revisar el fichero LICENSE antes de cualquier uso comercial; la model card lo destaca explicitamente.
- Origen comunitario: no es una publicacion oficial de Qwen. El tronco se reprodujo a partir de pesos BF16 con selecciones de expertos de un tercero (sh0wie), y los expertos MTP se rankearon de forma independiente en la compilacion padre.
- Vision en BF16: el payload visual no esta cuantizado, lo que encarece el almacenamiento y la VRAM frente a una version cuantizada de esa rama.
- Compatibilidad de version: requiere una version de ExLlamaV3 que soporte la arquitectura y la tabla de n-gramas shardeada; versiones antiguas pueden fallar al cargar.
- Riesgo de claves duplicadas: no mezclar el MTP en BF16 del padre en el mismo directorio que los ficheros Q4.
- Sin datos de rendimiento, latencia, throughput ni consumo energetico para dimensionar un servicio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo padre (MTP en BF16): https://huggingface.co/MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP
- Commit del padre usado en la conversion: https://huggingface.co/MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP/tree/2275ddcef8b3a026192bb96f0a87ae3b7f03be97
- Licencia: https://huggingface.co/MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4/blob/main/LICENSE
- Metadatos de conversion del MTP: https://huggingface.co/MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4/blob/main/mtp_quantization.json
- Manifiesto de checksums: https://huggingface.co/MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4/blob/main/artifact_manifest.json
- Comando de descarga indicado por el autor: `hf download MidnightPhreaker/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4 --local-dir models/Qwen3.8-Flash-Next-REAP-384-exl3-4.00bpw-REAP-MTP-Q4`

Nota sobre la busqueda web: los resultados recuperados (Zhihu, Stack Overflow sobre codificacion de URLs y rutas de ficheros locales) no guardan relacion con este modelo y no aportan enlaces utilizables. No se han encontrado papers, blogs ni repositorios asociados a esta derivacion en la informacion disponible.
