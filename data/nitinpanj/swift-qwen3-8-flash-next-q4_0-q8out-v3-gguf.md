# nitinpanj/Swift-Qwen3.8-Flash-Next-Q4_0-Q8out-v3-GGUF

## Resumen

Swift-Qwen3.8-Flash-Next-Q4_0-Q8out-v3-GGUF es una cuantizacion GGUF del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario nitinpanj. Se trata de un modelo de lenguaje con arquitectura `qwen4exp` (hibrida Gated-DeltaNet mas atencion completa, con MoE enrutado de 512 expertos y cabezas MTP integradas), derivado a su vez de Qwen3.8-Flash-Next. El modelo base incorpora la optimizacion "Swift" de UkisAI, que segun la model card reduce los tokens de razonamiento en aproximadamente un 58% y elimina bucles de hesitacion.

El peso total declarado en safetensors es de 176.943.899.520 parametros, con un contexto nativo de 262.144 tokens y soporte declarado de vision (image-text-to-text) mediante un proyector multimodal incluido en el repositorio. La cuantizacion no es una Q4_0 estandar: parte de una base Q4_0 a la que se le injertan tensores donantes en Q8_0 en las capas de salida, embedding y residuales (proceso denominado `-Q8out-v3`), con calibracion imatrix. El resultado son tres shards GGUF que suman 95 GiB.

Su relevancia es doble: por un lado demuestra el estado actual de las tecnicas de cuantizacion selectiva (mezcla de precisiones por tipo de tensor) aplicadas a modelos MoE de gran tamano; por otro, es un ejemplo de cuantizacion orientada especificamente a Apple Silicon, con soporte declarado de decodificacion especulativa mediante las cabezas MTP. Es un artefacto de nicho: no funciona en builds estandar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: hibrida GDN (Gated-DeltaNet recurrente) + atencion completa cada 4 capas, con MoE enrutado de 512 expertos, experto compartido, hiper-conexiones, embedding ngram-PLE y cabezas MTP integradas; 48 capas |
| Parametros totales | 176.943.899.520 (dato real de safetensors) |
| Parametros activos | no disponible (la model card indica 512 expertos enrutados con 10 activos, pero no publica el recuento de parametros activos) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q4_0 base con 575 tensores de salida/embedding/residuales re-cuantizados a Q8_0; calibracion imatrix (`imatrix-bartv6`, dataset `Qwen3.8-Flash-Next-calibration-v6`); proyector de vision en f16 |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-license-1.0 (campo `license: other` con `license_name` y enlace a https://huggingface.co/Qwen/LICENSE) |
| Formato de pesos | GGUF, 3 shards (00001-of-00003, 00002-of-00003, 00003-of-00003), 95 GiB en total |

## Arquitectura y entrenamiento

La arquitectura subyacente, etiquetada como `qwen4exp`, combina capas de atencion lineal recurrente Gated-DeltaNet (GDN) con capas de atencion completa intercaladas cada cuatro capas. Sobre esa columna vertebral se dispone una capa MoE con 512 expertos enrutados de los que se activan 10 por token, mas un experto compartido. La model card menciona ademas hiper-conexiones, un esquema de embedding ngram-PLE y cabezas MTP (multi-token prediction) integradas, que se emplean para decodificacion especulativa. El conjunto suma 48 capas. Esta combinacion de recurrencia lineal con atencion completa a intervalos busca reducir el coste de atencion en contextos muy largos manteniendo la calidad en tareas que requieren recuperacion exacta de informacion.

Sobre el entrenamiento no hay datos publicos en la informacion proporcionada: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. Lo unico documentado es la capa de modificacion aplicada por el autor del modelo base (la reduccion "Swift" de tokens de razonamiento y la eliminacion de bucles de hesitacion) y el proceso de cuantizacion, que es el aporte real de este repositorio. La cuantizacion se realizo con una pipeline propia que re-cuantiza una base Q4_0 e injerta tensores Q8_0 donantes en las capas mas sensibles, calibrando con imatrix.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo de pensamiento reducido: la variante "Swift" recorta los tokens de razonamiento en aproximadamente un 58% respecto al modelo de origen, segun la model card.
- Comprension de imagenes y texto (image-text-to-text), gracias a los tensores del proyector de vision incluidos en el repositorio.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos.
- Decodificacion especulativa mediante las cabezas MTP integradas, activable con el flag `--mtp-draft` en builds compatibles.
- Inferencia eficiente en relacion calculo/parametros por su naturaleza MoE (10 de 512 expertos activos por token).
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en ingles o chino: con 262.144 tokens de contexto, el modelo puede ingerir informes anuales, expedientes completos o bases de codigo medianas sin troceado previo, y responder preguntas sobre el conjunto.
- Procesamiento de documentacion tecnica con imagenes: al incluir proyector de vision, permite extraer y razonar sobre diagramas, capturas de interfaz o tablas escaneadas junto al texto que las acompana.
- Asistente de razonamiento en produccion con coste controlado: el modo Swift reduce el numero de tokens de razonamiento generados, lo que abarata la factura de inferencia en tareas de clasificacion, extraccion o resumen donde no se necesita cadena de pensamiento larga.
- Despliegue local en estaciones de trabajo Apple Silicon: es el escenario para el que se construyo esta cuantizacion, orientada a servir el modelo en hardware de memoria unificada con el fork Slipstream de llama.cpp.
- Servicio de chat multilingue en/zh: adecuado para productos con base de usuarios en mercados angloparlantes y sinofonos, con conversaciones multi-turno largas.
- Prototipado e investigacion sobre cuantizacion selectiva: el repositorio sirve como referencia reproducible de la tecnica `-Q8out` (mezclar precisiones por tipo de tensor) para quienes investigan compresion de modelos MoE.
- Evaluacion de decodificacion especulativa con MTP: util para medir ganancias de throughput al activar `--mtp-draft` frente a decodificacion autoregresiva estandar en un MoE de este tamano.
- Backend de generacion de texto en pipelines internos con requisitos de soberania de datos: al ser un GGUF ejecutable en local, permite mantener el contenido dentro de la infraestructura propia sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que el modelo fue "construido y evaluado localmente en un Apple M5 Pro (64 GB de memoria unificada) con el fork Slipstream de llama.cpp", sin cifras concretas de MMLU, HumanEval, GSM8K ni de throughput o latencia. No se deben asumir valores derivados de Qwen3.8-Flash-Next sin verificacion independiente, dado que la cuantizacion y la variante Swift alteran el comportamiento respecto al modelo original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 95 GiB en disco (102,6 GB de repositorio contando el proyector y metadatos). Para inferencia hay que sumar la cache KV correspondiente al contexto configurado, que con 262.144 tokens puede ser muy elevada. Como referencia practica, se necesitan del orden de 100 GiB o mas para una carga completa en memoria con contexto largo.
- GPU de datacenter: H100 de 80 GB o A100 de 80 GB en configuracion de multiples unidades, o bien H200/B200 con 141 GB o mas si se quiere evitar el reparto entre dispositivos. No hay datos publicados de rendimiento en estas plataformas.
- Consumer GPU: no cabe en ninguna GPU de consumo actual por si sola (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Solo es viable con offload parcial a CPU/RAM, con la penalizacion de latencia correspondiente.
- Apple Silicon: el autor reporta construccion y evaluacion en un M5 Pro con 64 GB de memoria unificada, lo que implica que la ejecucion se realiza con streaming de los expertos desde SSD mediante el fork Slipstream, ya que 95 GiB excede la memoria disponible. No se publican cifras de tokens por segundo.
- Opciones de despliegue: llama.cpp con soporte de la arquitectura `qwen4exp` (por ejemplo el fork `unslothai/llama.cpp` mencionado en la model card) o el fork Slipstream con streaming de MoE. `llama-server` es el modo de servicio documentado.
- Incompatibilidad critica: las builds estandar de llama.cpp no soportan esta arquitectura y fallaran al cargar el modelo. Tampoco hay evidencia de soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-Flash-Next-Q4_0-Q8out-v3 (este) | 176.943.899.520 | 262.144 | qwen4exp (GDN + atencion, MoE 512 expertos, MTP) | qwen-community-license-1.0 | GGUF (3 shards, 95 GiB) | Publico en HuggingFace; requiere build de llama.cpp con soporte qwen4exp |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible (se describe como variante Swift con reduccion de tokens de razonamiento) | no disponible | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | GDN + QSA hibrida, con mejoras en atencion, residuales, embedding y optimizacion | no disponible (serie Qwen3.8) | no disponible | Publico en HuggingFace y GitHub (QwenLM) |
| nitinpanj/qwen38-flash-next-v3 | no disponible | no disponible | no disponible | no disponible | GGUF | Publico en HuggingFace; otra cuantizacion del mismo autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a formato, disponibilidad y linaje.

## Limitaciones y advertencias

- Incompatibilidad de runtime: las builds estables de llama.cpp no cargan la arquitectura `qwen4exp`. Usar una build sin soporte producira un error de carga, no un fallo silencioso. Esto limita severamente las opciones de despliegue y complica el mantenimiento en produccion.
- Licencia: qwen-community-license-1.0, registrada como `license: other`. Es una licencia con terminos especificos de la comunidad Qwen; es imprescindible revisar el texto completo en https://huggingface.co/Qwen/LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de atribucion o de uso.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano u otras lenguas no esta documentado y no deberia asumirse.
- Cuantizacion agresiva: la base es Q4_0, con solo 575 tensores elevados a Q8_0. Aunque la seleccion de tensores Q8_0 en salida, embedding y residuales mitiga parte de la perdida, cabe esperar degradacion respecto al modelo en precision completa, especialmente en tareas sensibles a la precision numerica.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinacion para esta variante cuantizada. Debe validarse en el dominio de aplicacion antes de usarla en produccion.
- Memoria: 95 GiB de pesos hacen inviable el despliegue en una unica GPU de 80 GB con contexto largo. El uso en Apple Silicon depende de streaming desde SSD, con la latencia asociada.
- Proyecto sin traccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (28 de septiembre de 2026). No hay comunidad, issues ni validacion externa.
- Procedencia del modelo base: al ser una variante modificada por un tercero (UkisAI) sobre Qwen3.8-Flash-Next, la trazabilidad de los datos de entrenamiento y de los ajustes aplicados es limitada.
- Fecha del artefacto: las fechas del repositorio son posteriores a la informacion publica disponible sobre la serie Qwen3.8; conviene verificar la correspondencia exacta entre esta cuantizacion y el checkpoint oficial.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/nitinpanj/Swift-Qwen3.8-Flash-Next-Q4_0-Q8out-v3-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Otra cuantizacion del mismo autor: https://huggingface.co/nitinpanj/qwen38-flash-next-v3
- Modelo Qwen3.8-Flash-Next oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentacion de Qwen3.8-Flash en QwenCloud: https://docs.qwencloud.com/developer-guides/getting-started/latest-model
- Texto de la licencia Qwen: https://huggingface.co/Qwen/LICENSE
