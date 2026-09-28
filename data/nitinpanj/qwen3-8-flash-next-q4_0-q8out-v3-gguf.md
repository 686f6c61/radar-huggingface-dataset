# nitinpanj/Qwen3.8-Flash-Next-Q4_0-Q8out-v3-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de tipo Mixture of Experts desarrollado por el equipo Qwen (Alibaba), publicado como una vista previa temprana de la arquitectura que se usara en Qwen4. La ficha que se analiza aqui no es el modelo original, sino una cuantizacion GGUF del mismo realizada por el usuario nitinpanj, identificada como Qwen3.8-Flash-Next-Q4_0-Q8out-v3-GGUF. El problema que resuelve esta version concreta es el de hacer ejecutable en hardware de consumo un modelo de gran tamano que, en precision completa, resulta inabordable para la mayoria de equipos.

El modelo base emplea una arquitectura hibrida denominada qwen4exp, que combina capas recurrentes Gated DeltaNet (GDN) con atencion completa cada cuatro capas, un MoE enrutado de 512 expertos (10 activos por token), una capa ngram-PLE y cabezas MTP integradas. Segun la informacion del autor de la cuantizacion, el modelo tiene 48 capas, 24 cabezas de atencion, 2 cabezas KV y una longitud de contexto nativa de 262.144 tokens. El recuento real de parametros en safetensors del modelo base es de 176.943.899.520, aunque fuentes externas citan 125.000 millones de parametros; la discrepancia no queda resuelta en la informacion disponible.

La relevancia de esta ficha es doble. Por un lado, documenta una cuantizacion Q4_0 con tensores de salida y embedding en Q8_0, calibrada con imatrix y compatible con vision, que reduce el modelo a 96 GiB repartidos en tres shards. Por otro, advierte de una limitacion critica: la arquitectura qwen4exp no es soportada por llama.cpp estandar, por lo que requiere un fork especifico (por ejemplo, el de unslothai) y decodificacion especulativa mediante `--mtp-draft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp: hibrida Gated DeltaNet (recurrente) + atencion completa cada 4 capas, MoE enrutado de 512 expertos (10 activos), capa ngram-PLE y cabezas MTP; multimodal con proyector de vision |
| Parametros totales | 176.943.899.520 (recuento real en safetensors del modelo base); fuentes externas citan 125.000 millones, dato no coincidente |
| Parametros activos | no disponible (MoE con 512 expertos y 10 activos por token; no se publica la cifra exacta) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q4_0 en pesos con Q8_0 en tensores de salida y embedding (receta `-Q8out` v3), calibrada con imatrix; proyector de vision en `mmproj-f16.gguf` |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF, 3 shards (96 GiB en total); repo de 102,6 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una hibrida poco convencional. Combina capas recurrentes Gated DeltaNet, que sustituyen parte de la atencion por un mecanismo de estado recurrente, con capas de atencion completa intercaladas cada cuatro capas. Sobre esa columna vertebral se monta un MoE enrutado con 512 expertos y 10 activos por token, lo que permite separar la capacidad total de parametros del coste computacional por token. El modelo tiene 48 capas y una configuracion de atencion de 24 cabezas con 2 cabezas KV. Segun el repositorio oficial, la arquitectura introduce mejoras en cuatro ejes: atencion (hibrido GDN + QSA), residual, embedding y optimizacion.

La cuantizacion que nos ocupa anade dos elementos relevantes. El primero son las cabezas MTP (Multi-Token Prediction), incluidas para decodificacion especulativa con 7 tokens de propuesta, lo que acelera la generacion al permitir validar varias hipotesis por paso. El segundo es el proyector de vision, empaquetado aparte como `mmproj-f16.gguf`, que habilita el modo image-text-to-text. La calibracion imatrix se realizo con el conjunto `Qwen3.8-Flash-Next-calibration-v6`, de 926 entradas y 582 chunks. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte de conversaciones multi-turno.
- Razonamiento avanzado y modo de pensamiento extendido, segun la documentacion del modelo base.
- Comprension de imagenes y generacion de texto a partir de ellas (image-text-to-text), gracias a los tensores del proyector de vision incluidos en la cuantizacion.
- Decodificacion especulativa nativa mediante cabezas MTP con 7 tokens de propuesta, activable con `--mtp-draft`.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y dialogos de muchas vueltas.
- Capacidades de generacion de codigo y matematicas: no se detallan de forma explicita en la informacion disponible, aunque el modelo base se presenta como un modelo de razonamiento general.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 262.144 tokens de contexto, el modelo puede ingerir manuales, contratos o bases de codigo completas en una sola pasada sin necesidad de troceado y reensamblado.
- Asistencia conversacional multi-turno en ingles y chino: la ventana larga permite mantener historiales extensos sin perder el hilo, util para chatbots de soporte o tutoria.
- Procesamiento de documentos escaneados con imagenes: gracias al proyector de vision se pueden enviar capturas, diagramas o paginas escaneadas junto a la pregunta en texto.
- Analisis de diagramas de arquitectura y capturas de interfaz: el modo image-text-to-text permite describir, resumir o extraer informacion de imagenes tecnicas.
- Despliegue local en estaciones de trabajo Apple Silicon: el autor indica que la cuantizacion se construyo y probo en un Apple M5 Pro con 64 GB de memoria unificada usando el fork Slipstream con streaming de expertos, lo que permite ejecutar el modelo sin GPU dedicada.
- Servicio de inferencia autoalojado con llama-server: el comando documentado expone una API en el puerto 8080 con `-ngl 99` y contexto completo, apto para integrarse en backends internos.
- Generacion acelerada en produccion: las cabezas MTP con 7 tokens de propuesta reducen el numero de pasos de decodificacion, lo que resulta util en cargas con muchos usuarios concurrentes y respuestas largas.
- Investigacion sobre arquitecturas hibridas: al ser una vista previa de Qwen4, sirve como banco de pruebas para estudiar el comportamiento de GDN + atencion completa en combinacion con MoE disperso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion solo menciona que fue construida y evaluada localmente en un Apple M5 Pro de 64 GB con el fork Slipstream, sin cifras de MMLU, HumanEval, GSM8K ni similares. La documentacion de unsloth afirma que Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max) y que puede ejecutarse en equipos con 75 GB de RAM o memoria unificada, pero se trata de una afirmacion sin tabla de resultados asociada en la informacion recogida, por lo que no se reproduce como dato.

## Requisitos de hardware

- Los tres shards GGUF suman 96 GiB, por lo que la inferencia en memoria requiere aproximadamente 96 GiB de memoria disponible, mas el coste de la cache KV, que no se detalla en la informacion proporcionada.
- El proyector de vision `mmproj-f16.gguf` es un fichero adicional que debe cargarse por separado si se quiere usar el modo multimodal.
- Apple Silicon: el autor indica ejecucion en un Apple M5 Pro con 64 GB de memoria unificada, posible gracias al fork Slipstream de llama.cpp, que aplica streaming de expertos desde disco en lugar de mantener todo el modelo residente.
- GPU dedicadas: no se documentan pruebas con A100, H100 ni RTX 4090. Dado el tamano de 96 GiB, no cabe en ninguna GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en configuraciones de doble GPU de 24 GB sin offloading a memoria del sistema.
- Opciones de despliegue: exclusivamente llama.cpp compilado con soporte qwen4exp (se menciona el fork de unslothai), mediante `llama-server` o binarios equivalentes. No consta compatibilidad con vLLM, TGI, Ollama ni otros motores de inferencia.
- Decodificacion especulativa: requiere activar `--mtp-draft` para aprovechar las cabezas MTP.
- Latencia y throughput: no disponible. El unico dato de rendimiento es cualitativo (construido y probado localmente en M5 Pro).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base, Qwen) | 176.943.899.520 en safetensors | 262.144 tokens | safetensors | qwen-community-license-1.0 | HuggingFace oficial |
| Qwen3.8-Flash-Next-Q4_0-Q8out-v3 (nitinpanj) | misma base, cuantizada | 262.144 tokens | GGUF, 3 shards, 96 GiB | qwen-community-license-1.0 | HuggingFace, 0 descargas |
| nitinpanj/qwen38-flash-next-v3 | misma base, cuantizada | 262.144 tokens | GGUF | no disponible en la informacion recogida | HuggingFace, 2 likes |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoria. La comparacion con modelos como Claude-4.6-Opus aparece mencionada por terceros, pero sin cifras verificables.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp estandar: la arquitectura qwen4exp no esta soportada por el runtime oficial, por lo que es obligatorio usar un fork especifico. Esto implica riesgo de mantenimiento, actualizaciones manuales y menor soporte comunitario.
- La model card incluye una advertencia explicita sobre esta incompatibilidad; ignorarla provoca fallos de carga del modelo.
- Reproductor de vision separado: sin cargar `mmproj-f16.gguf` el modelo no procesa imagenes, aunque el GGUF las declare como soportadas.
- Licencia: qwen-community-license-1.0 es una licencia propia de Qwen, etiquetada como `other`. Es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede incluir restricciones especificas no resumidas aqui.
- Idiomas: solo ingles y chino declarados. El castellano no figura entre los idiomas soportados, por lo que el rendimiento en espanol es incierto y probablemente inferior.
- Tamano: 96 GiB de pesos hacen inviable la ejecucion en la mayoria de portatiles y equipos de sobremesa; solo configuraciones con memoria unificada alta o streaming de expertos desde disco pueden asumirlo.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad ni tasas de alucinacion en la informacion disponible.
- Sesgos: no disponible. No se documentan analisis de sesgo en la informacion recogida.
- Madurez: la cuantizacion tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion practicamente nula por parte de la comunidad.
- Discrepancia de parametros: el recuento safetensors (176,9 mil millones) no coincide con la cifra de 125.000 millones difundida por terceros. Conviene verificar cual corresponde al modelo efectivamente desplegado antes de dimensionar hardware.
- La calibracion imatrix reduce el error de cuantizacion, pero Q4_0 sigue siendo una cuantizacion agresiva: puede degradar tareas sensibles a la precision, como matematicas o generacion de codigo.

## Enlaces

- Cuantizacion GGUF analizada: https://huggingface.co/nitinpanj/Qwen3.8-Flash-Next-Q4_0-Q8out-v3-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README del repositorio oficial: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Guia de ejecucion local de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Cuantizacion previa del mismo autor: https://huggingface.co/nitinpanj/qwen38-flash-next-v3
- Licencia Qwen: https://huggingface.co/Qwen/LICENSE
