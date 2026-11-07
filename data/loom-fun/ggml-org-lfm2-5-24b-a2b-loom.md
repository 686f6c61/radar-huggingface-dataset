# loom-fun/ggml-org-LFM2.5-24B-A2B-loom

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Liquid AI, con 24.000 millones de parámetros totales y solo 2.000 millones activos por token. Forma parte de la familia LFM2.5, disenada especificamente para despliegue en dispositivo (on-device), y supone una evolucion del anterior LFM2-24B-A2B: amplia la ventana de contexto hasta 131.072 tokens, duplica el vocabulario hasta 128.000 tokens y escala el preentrenamiento de aproximadamente 17 billones a 33 billones de tokens.

El repositorio descrito aqui no contiene los pesos originales, sino un paquete de despliegue para AMD Loom (formato `.loom` mas un `model.json`), generado por el usuario loom-fun a partir del checkpoint GGUF sin modificar `ggml-org/LFM2.5-24B-A2B-GGUF` (concretamente la cuantizacion Q4_K_M). El paquete se ha producido con el flujo de trabajo loom-skills sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y permite servir el modelo con `loom-serve` exponiendo una API compatible con OpenAI.

Su relevancia practica radica en la comparativa publicada frente a llama.cpp sobre el mismo GGUF: mejoras de entre el 4 % y el 12 % en decodificacion y de hasta el 79 % en prefill con documentos de 32k tokens, alcanzando el 94 % del limite roofline en agregado con 4 flujos concurrentes. Es, por tanto, una pieza de infraestructura de inferencia para hardware AMD integrado, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) hibrida, familia LFM2.5 (detalle interno no disponible) |
| Parametros totales | 24.000 millones |
| Parametros activos | 2.000 millones |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` (`weights.loom`, `program/*.loom`) con `model.json` |
| Vocabulario | 128.000 tokens |
| Tokens de preentrenamiento | ~33 billones |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Backend | hrx-loom 0.1.0 (hrx-system `d01d1c1`), dispositivo `amdgpu` |

## Arquitectura y entrenamiento

LFM2.5-24B-A2B es un transformer de tipo mezcla de expertos con 24.000 millones de parametros totales y 2.000 millones activos por token, lo que reduce el coste computacional por token a la escala de un modelo denso de 2B manteniendo la capacidad de representacion de un 24B. Segun la model card de Liquid AI, la familia LFM2.5 esta disenada para despliegue on-device; esta variante concreta amplia el contexto a 131.072 tokens, duplica el vocabulario a 128.000 tokens y escala el preentrenamiento de ~17T a ~33T tokens respecto a LFM2-24B-A2B. No se dispone de informacion sobre la composicion del dataset, el uso de RLHF/DPO ni innovaciones de atencion especificas en la informacion proporcionada.

El paquete de este repositorio no reentrena ni modifica los pesos: toma el GGUF Q4_K_M y genera programas Loom (kernels compilados para el backend ROCm/hrX) mas un `model.json` que actua como tarjeta de despliegue. La correccion se valida con compuertas automatizadas frente a llama.cpp como referencia: 36/36 tests de kernel superados, coincidencia de tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k, equivalencia de salida en peticiones concurrentes respecto a ejecuciones aisladas, y verificacion del bucle multi-turno de tool calling. La decodificacion especulativa no esta soportada en esta version.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo (no se puede desactivar ni ajustar el esfuerzo de razonamiento).
- Tool calling / function calling con esquema compatible con OpenAI (`tools` y `tool_calls`), validado en bucles multi-turno con reutilizacion de historial.
- Soporte de agentes y razonamiento multi-paso mediante el bucle de tool calling verificado por la compuerta `agent`.
- Contexto largo de hasta 131.072 tokens por peticion, con prueba needle-in-a-haystack superada hasta la mitad del contexto.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Concurrencia de 4 peticiones simultaneas con salida identica a la ejecucion aislada.
- Sin soporte de entrada de imagen ni de audio; sin decodificacion especulativa.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a sus 131.072 tokens de ventana, con la ventaja de ejecutarse integramente en un equipo con GPU integrada AMD.
- Procesamiento de documentacion tecnica en lote: el prefill de 3.155 a 3.391 tokens/s con documentos de 1k a 8k permite indexar y resumir manuales o contratos en una estacion de trabajo sin GPU dedicada.
- Agentes con herramientas en local: el soporte verificado de tool calling y de bucles multi-turno habilita asistentes que consultan APIs internas, bases de datos o sistemas de ficheros sin enviar datos a la nube.
- Analisis de repositorios y codebases: con 32k tokens de contexto se puede cargar un modulo completo y responder preguntas sobre el, con un prefill de 2.829 tokens/s en ese tamano.
- Servicio de inferencia para equipos pequenos: 4 peticiones concurrentes con 208,8 tokens/s agregados de decodificacion permiten atender a un grupo reducido de desarrolladores desde un unico nodo Strix Halo.
- Prototipado y evaluacion de modelos MoE: al ser un paquete reproducible con compuertas de correccion documentadas, sirve para comparar backends de inferencia sobre el mismo checkpoint GGUF.
- Chat de atencion interna con requisitos de privacidad: al ejecutarse en hardware propio y con API local, los datos no salen del perimetro de la organizacion.

## Benchmarks y rendimiento

Rendimiento de inferencia medido el 2026-11-07 sobre AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | % de roofline (Loom) |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 93,9 | 98,7 | +5 % | 140,4 | 70 % |
| Decodificacion tok/s, contexto 2k | 84,2 | 94,5 | +12 % | 136,7 | 69 % |
| Decodificacion tok/s, contexto 32k | 69,6 | 72,1 | +4 % | 98,4 | 73 % |
| Prefill tok/s, documento 1k | 2.078,8 | 3.155,8 | +52 % | 13.330,5 | 24 % |
| Prefill tok/s, documento 2k | 2.036,1 | 3.200,9 | +57 % | 13.208,2 | 24 % |
| Prefill tok/s, documento 8k | 2.060,1 | 3.391,3 | +65 % | 12.519,4 | 27 % |
| Prefill tok/s, documento 16k | 1.854,7 | 3.184,8 | +72 % | 11.705,5 | 27 % |
| Prefill tok/s, documento 32k | 1.579,5 | 2.829,8 | +79 % | 10.358,7 | 27 % |
| 4 flujos, decodificacion agregada tok/s | 162,7 | 208,8 | +28 % | 223,1 | 94 % |

Notas de medicion: llama.cpp con build `llamacpp-rocm/b1369` y argumentos `-ngl 99 -cram 0 -c 35024 -kvu -np 4`; Loom con decodificacion especulativa desactivada. En Loom el cronometraje es del lado del cliente; en llama.cpp, del lado del servidor. Decodificacion y prefill: media de 1-2 ejecuciones; 4 flujos: mediana de 1 ejecucion. El roofline corresponde al techo del hardware a 216 GB/s y 59 TFLOP/s.

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el comando de arranque documentado reserva `--memory_bytes=22000000000` (22 GB) para el checkpoint Q4_K_M.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151); es el unico dispositivo con mediciones publicadas.
- No cabe en GPU de consumo discretas de 8-16 GB en esta cuantizacion; requiere memoria unificada de al menos 22 GB.
- Despliegue: `loom-serve --model=.../model.json --device=amdgpu --memory_bytes=22000000000`, con API OpenAI en `127.0.0.1:8080`. Instalacion via `pip install "hrx-loom[hf]"` y descarga con `loom-fetch`.
- Alternativa de despliegue: llama.cpp (build ROCm `b1369`) con el GGUF original.
- Throughput: 98,7 tok/s en decodificacion con prompt corto, 208,8 tok/s agregados con 4 flujos, 3.391 tok/s de prefill en documentos de 8k.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B (este paquete) | 24B | 2B | 131.072 | no disponible | GGUF Q4_K_M empaquetado en Loom | Optimizado para AMD Strix Halo via hrx-loom |
| LFM2.5-24B-A2B-GGUF (ggml-org) | 24B | 2B | 131.072 | no disponible | GGUF | Checkpoint de referencia, multiples cuantizaciones, uso con llama.cpp |
| LFM2.5-24B-A2B-Base (LiquidAI) | 24B | 2B | 131.072 | no disponible | safetensors (presumible) | Pesos base originales de Liquid AI |
| LFM2-24B-A2B | 24B | 2B | no disponible | no disponible | no disponible | Generacion anterior: ~17T tokens de preentrenamiento y vocabulario de 64K |

La comparativa de rendimiento frente a llama.cpp sobre el mismo GGUF se detalla en la seccion de benchmarks; no hay datos de calidad comparada con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos originales ni un modelo afinado: es un paquete de despliegue ligado a la version `hrx-loom 0.1.0` (hrx-system `d01d1c1`) y al hardware gfx1151; la portabilidad a otras GPU AMD no esta documentada.
- Solo se distribuye la cuantizacion Q4_K_M; no hay variantes de mayor o menor precision en este paquete.
- El modo de razonamiento esta siempre activo y no se puede desactivar ni ajustar su esfuerzo, lo que incrementa tokens generados y latencia en tareas simples.
- Sin decodificacion especulativa, sin entrada de imagen y sin audio.
- La compuerta `needle_full` (needle-in-a-haystack con el contexto completo) no tiene evidencia registrada: el comportamiento con 131.072 tokens llenos no esta verificado.
- El limite de 4 peticiones concurrentes y de 4.096 tokens de salida puede ser insuficiente para cargas de produccion de mayor volumen.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar la licencia del modelo base de Liquid AI.
- Riesgo de alucinacion y sesgos: no hay informacion publicada en la documentacion disponible.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingue sin verificacion.
- Las cifras de rendimiento son medias de 1-2 ejecuciones y el cronometraje no es homogeneo entre motores (cliente vs servidor), lo que limita la precision de la comparacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun/ggml-org-LFM2.5-24B-A2B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/LFM2.5-24B-A2B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Repositorio hrx-system (Loom): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42326829360
