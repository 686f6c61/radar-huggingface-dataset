# benjzzz/gaale-slow

## Resumen

GALE Slow es un pack de re-cuantizacion a 1 bit de los expertos enrutados de DeepSeek-V4-Pro, publicado por el usuario benjzzz en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresion agresiva del modelo base de DeepSeek que reduce los pesos de los expertos de mezcla (MoE) a aproximadamente 1,33 bits por peso mediante una rotacion FWHT-1024 por bloques, un bit de signo por peso, escalas fp16 por bloque de 128 pesos y un 1% de valores atipicos en int4. El objetivo es hacer viable la inferencia de un modelo de ~1,57 billones de parametros en hardware de consumo y nodos pequenos, con un servidor que planifica automaticamente el reparto entre GPU y CPU.

La relevancia de este pack es doble. Por un lado, demuestra una tecnica de cuantizacion extrema (v4) con retroalimentacion de error estilo GPTQ en el espacio de salida, que mejora el error relativo de 0,74 a 0,52-0,54 frente al redondeo ingenuo del signo. Por otro, incluye un servidor con planificacion generica de dispositivos, cache de prefijos con snapshots de KV, enrutamiento consciente de la residencia de expertos y mecanismos para terminar turnos cuando el modelo no emite EOS de forma fiable.

El modelo conserva la arquitectura MoE del base (61 capas x 384 expertos con w1/w2/w3), pero la coherencia se degrada en respuestas largas, por lo que el servidor esta disenado para cortar el turno en cuanto el modelo termina una respuesta corta. Es un artefacto experimental orientado a investigacion y despliegue en hardware modesto, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) basado en DeepSeek-V4-Pro; expertos enrutados re-cuantizados a 1 bit |
| Parametros totales | ~1,57 T (contados a partir de las formas de los tensores) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: GALE 1-bit v4 (1,33 bits/peso); atencion y expertos compartidos: fp8 en disco, 4-bit en VRAM; embedding y cabeza de salida: fp16 en disco, cabeza 4-bit en VRAM; normas, routers y mezclas de hiperconexion: fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (licencia DeepSeek, enlazada al modelo base) |
| Formato de pesos | GALE 1-bit v4 propio (bit de signo + escalas fp16 por bloque de 128 + atipicos int4), fp8, fp16; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El pack parte de DeepSeek-V4-Pro, un modelo de arquitectura transformer con mezcla de expertos (MoE) de 61 capas y 384 expertos enrutados por capa, cada uno con matrices w1, w2 y w3. GALE Slow no entrena el modelo: re-cuantiza los expertos enrutados a 1 bit mediante una rotacion Hadamard rapida (FWHT) de tamano 1024 por bloques, un bit de signo por peso, una escala fp16 por bloque de 128 pesos y un 1% de valores atipicos almacenados en int4 con escala fp16 por fila. La atencion y los expertos compartidos se guardan en fp8 con escalado por bloques y se cuantizan a 4 bits al cargar, permaneciendo en 4 bits en VRAM. Las normas, routers y mezclas de hiperconexion se mantienen en fp16.

La innovacion principal de la version v4 es el uso de retroalimentacion de error estilo GPTQ en el espacio de salida: para cada matriz de experto, el error de redondeo de cada columna se propaga a las columnas aun no cuantizadas, ponderado por la inversa de la Hessiana de activaciones reales (16k tokens capturados del propio modelo, ridge 0,3), y se incorpora una ganancia por fila por minimos cuadrados en las escalas de bloque sin coste adicional de bits. El error relativo medido en activaciones retenidas baja de 0,74 con redondeo ingenuo a 0,52-0,54 con v4. Los pesos no expertos en 4 bits usan int4 simetrico por bloque de 128 con escalas fp16 y un error relativo de 0,119. El pack total ocupa 257 GB en disco para los expertos y ~1,39 bits/peso en VRAM (1,46 en disco).

## Capacidades

- Generacion de texto y respuesta a preguntas cortas con coherencia aceptable, segun la model card.
- Escritura de funciones pequenas de codigo.
- Razonamiento de un solo paso; la coherencia se degrada en respuestas largas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el servidor incluye cache de prefijos para prompts de agente, pero no se documenta capacidad agentica nativa.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.
- Servidor con cache de prefijos y reutilizacion de KV, terminacion de turno y enrutamiento consciente de la residencia de expertos.

## Casos de uso

- Inferencia de un modelo de ~1,57 T de parametros en hardware de consumo: el pack permite ejecutar DeepSeek-V4-Pro en dos RTX 3090, una RTX 2080 Ti y una CPU Ryzen 9 3900X, con planificacion automatica de dispositivos y sin configuracion manual por maquina.
- Despliegue en nodos multi-GPU pequenos: el servidor reparte expertos entre GPU y CPU y admite desde una sola GPU hasta un nodo con todos los expertos residentes, lo que facilita experimentar con modelos masivos en entornos de investigacion con presupuesto limitado.
- Investigacion sobre cuantizacion extrema: el pack sirve como referencia reproducible de cuantizacion a 1 bit con retroalimentacion de error, util para estudiar el impacto del error de redondeo en la calidad de un MoE de gran escala.
- Asistentes de respuesta corta: el servidor termina el turno en cuanto el modelo completa una respuesta, lo que encaja en escenarios de preguntas y respuestas breves donde la coherencia a largo plazo no es critica.
- Generacion de funciones pequenas en pipelines de desarrollo: el modelo escribe funciones cortas de forma limpia, por lo que puede usarse en tareas acotadas de autocompletado o generacion de snippets con validacion posterior.
- Pruebas de infraestructura de serving: las funcionalidades de cache de prefijos, snapshots de KV y enrutamiento por residencia permiten medir latencia y throughput en escenarios de agentes con prompts largos y repetidos (la model card reporta una mejora de 464 s a 6 s en un prompt de agente de 1230 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta metricas internas de error de cuantizacion y de serving:

| Metrica | Valor |
|---|---|
| Error relativo de expertos (redondeo ingenuo de signo) | 0,74 |
| Error relativo de expertos (GALE v4) | 0,52-0,54 |
| Error relativo de pesos no expertos en 4 bits | 0,119 |
| Bits/peso en VRAM (extremo a extremo) | ~1,39 |
| Bits/peso en disco | ~1,46 |
| Tamano de expertos en disco | 257 GB |
| Throughput con enrutamiento por residencia | 0,36-0,65 -> 1,2 tok/s |
| Throughput con sesgo 0,30/0,60 (degradado) | ~2 tok/s |
| Latencia de prompt de agente de 1230 tokens | 464 s -> 6 s con cache de prefijos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; el pack ocupa 257 GB en disco solo para expertos y ~1,39 bits/peso en VRAM sobre ~1,57 T de parametros, lo que implica varios cientos de GB de memoria total entre GPU y CPU.
- GPU recomendadas: el autor lo construyo y midio en dos RTX 3090 y una RTX 2080 Ti; tambien se probo en un alquiler de 4x A100-80GB (2026-09-03).
- Cabe en GPU de consumo: si, segun el autor, en dos RTX 3090 y una RTX 2080 Ti junto con una CPU Ryzen 9 3900X, con planificacion generica de dispositivos.
- Opciones de despliegue: servidor propio incluido en el repo (`server/deepseek_v4pro_server_v2.py`), con torch >= 2.5, triton, transformers, tokenizers, fastapi y uvicorn. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,36-0,65 tok/s sin enrutamiento por residencia, 1,2 tok/s con sesgo 0,15/0,30 y ~2 tok/s con 0,30/0,60 (a costa de degradar el seguimiento de instrucciones).
- Notas de despliegue: requiere `ulimit -n 65536` por el numero de archivos abiertos, `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para evitar fragmentacion con residencia completa (~90% de cada GPU) y torch >= 2.5 por `torch.float8_e8m0fnu`. El paquete `tilelang` es un stub y no es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GALE Slow (este pack) | ~1,57 T | no disponible | GALE 1-bit v4 + fp8/4-bit | other (DeepSeek) | Hugging Face, 0 descargas |
| DeepSeek-V4-Pro (base) | ~1,57 T | no disponible | Pesos originales del base | DeepSeek | Referencia del autor |
| Alternativas de 1 bit comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros packs de cuantizacion a 1 bit del mismo modelo base ni sobre modelos comparables de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Coherencia degradada en respuestas largas: la model card indica que la coherencia se degrada, por lo que el servidor corta el turno en cuanto el modelo termina una respuesta.
- El modelo no emite EOS de forma fiable: se sustituye por un ejemplo de turno en texto plano, deteccion de la siguiente linea `User:` y recorte de n-gramas repetidos.
- Riesgo de alucinacion: no se documenta explicitamente, pero la cuantizacion a 1 bit y la degradacion de coherencia aumentan el riesgo en respuestas largas.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: licencia "other" con licencia DeepSeek enlazada al modelo base; es necesario revisar los terminos de DeepSeek para uso comercial.
- Caveat de produccion: es un artefacto experimental con 0 descargas y 0 likes, publicado el 2026-11-10; el sesgo de residencia agresivo (0,30/0,60) acelera pero dana el seguimiento de instrucciones, y el autor advierte de no subirlo a ciegas.
- Requiere hardware y configuracion especificos (torch >= 2.5, limites de archivos abiertos, allocator configurado) y no se documenta integracion con frameworks de serving estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benjzzz/gaale-slow
- Modelo base DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Licencia DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
