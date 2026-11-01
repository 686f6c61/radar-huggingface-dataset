# episod/minicpm3-4b-blackhole

## Resumen

`episod/minicpm3-4b-blackhole` es un paquete de despliegue (bundle) comunitario que sirve el modelo `openbmb/MiniCPM3-4B` sobre un chip Tenstorrent Blackhole (mesh P150). No contiene pesos propios: es un "thin bundle" del formato tt-model v6 que descarga los pesos originales de OpenBMB desde Hugging Face con la cuenta del usuario y ejecuta el port a ttnn alojado en el repositorio tt-orchard. El modelo subyacente es un transformer denso de 4.000 millones de parametros desarrollado por OpenBMB, con atencion multi-latente (MLA) y un MLP denso con gated-SiLU.

La relevancia de este paquete es de infraestructura, no de modelado: demuestra la ejecucion de un LLM de 4B en aceleradores Tenstorrent con una pila concreta (ttnn 0.80.0, Python 3.12, torch 2.7.0 en CPU, transformers 5.19.0) y un servidor compatible con la API de OpenAI. Esta marcado como Beta, con contexto por defecto de 2048 tokens, una sola peticion simultanea y decodificacion exclusivamente greedy.

Conviene subrayar que el paquete no valida los benchmarks del modelo base ni los reproduce; las afirmaciones de rendimiento de MiniCPM3-4B (por encima de Phi-3.5-mini-Instruct y GPT-3.5-Turbo-0125, comparable a modelos de 7B-9B) son del autor del modelo original. El bundle tampoco ha sido instalado desde el Hub ni validado en otros hosts distintos del equipo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 62 capas, hidden size 2560, 40 cabezas de atencion, atencion multi-latente (MLA, forma absorbida en chip), MLP denso con gated-SiLU |
| Parametros totales | 4.000 millones (modelo base MiniCPM3-4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens por defecto en este bundle |
| Tipos de cuantizacion | no disponible; pesos en bf16 con HiFi2 para el MLP |
| Idiomas soportados | chino e ingles (segun la model card del modelo base) |
| Licencia | apache-2.0 en el repositorio; los pesos remiten a la MiniCPM Model License de OpenBMB, cuyo enlace devolvio 404 el 2026-10-30 y no pudo verificarse |
| Formato de pesos | no disponible en el repositorio (los pesos no se alojan aqui); descarga desde `openbmb/MiniCPM3-4B` en la revision `d6b14ddaefdb11c624dd75c3c779549bc90b08cb` |
| Hardware objetivo | 1 chip Tenstorrent Blackhole (mesh P150: un p150 o un chip de una p300c en QuietBox 2) |
| Runtime | ttnn 0.80.0 (wheel de PyPI), Python 3.12, numpy 1.26.4, torch 2.7.0 CPU, transformers 5.19.0 |
| Servidor | app ASGI compatible con OpenAI (`extra_code/minicpm3_asgi.py`), uvicorn en 127.0.0.1:20130 |
| Estado | Beta; instalado y servido desde copia local con el instalador de tt-model en un chip de una p300c; no validado en otros hosts |

## Arquitectura y entrenamiento

El modelo base MiniCPM3-4B es un transformer denso de 62 capas con hidden size 2560 y 40 cabezas de atencion. La innovacion arquitectonica principal es la atencion multi-latente (MLA), que en este port se ejecuta en forma absorbida mediante el kernel `flash_multi_latent_attention_decode` de ttnn, con una cache paginada. El MLP es denso con activacion gated-SiLU. El paso de decodificacion se captura como traza para reducir overhead de lanzamiento de kernels.

El bundle no aporta informacion sobre el entrenamiento del modelo base: no se detalla el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de entrenamiento. En el lado del despliegue, las decisiones tecnicas destacables son el uso de bf16 para los pesos, HiFi2 para el MLP, la captura de traza del paso de decode y la conversion unica de pesos en el primer arranque (descarga de unos 8 GB, compilacion de kernels y captura de traza, varios minutos).

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles, limitada a 2048 tokens de contexto en este bundle.
- Redaccion, reescritura y resumen de textos cortos.
- Respuesta a preguntas sobre un documento corto pegado en el prompt.
- Primera pasada de bajo coste en pipelines de procesamiento de texto.
- Decodificacion greedy exclusivamente; no hay muestreo con temperatura.
- Tool calling / function calling: no probado en este bundle (fuera de alcance segun el autor).
- Code interpreter: no probado (fuera de alcance).
- Agentes y razonamiento multi-paso: fuera de alcance por la ventana de contexto y la restriccion de una peticion simultanea.
- Vision y audio: no disponibles.
- Modo thinking explicito: no documentado en este bundle.

## Casos de uso

- Asistente local en un solo chip: el modelo sirve conversacion y respuestas cortas en chino e ingles desde un unico Blackhole P150, adecuado para prototipos de asistente sin GPU dedicada.
- Redaccion y reescritura de textos breves: con 2048 tokens de contexto puede procesar correos, parrafos o notas y devolver versiones reescritas o resumidas en una sola pasada greedy.
- Resumen de documentos cortos: pegar un articulo o fragmento de hasta ~2000 tokens y obtener un resumen; el prefill medido de 494 tokens tarda entre 15,1 y 15,6 s, por lo que es viable para documentos pequenos y no interactivos.
- Primera pasada en pipelines por lotes: usar el modelo como filtro o clasificador generativo de bajo coste antes de enviar el contenido a un modelo mayor, aprovechando que el hardware es un chip de bajo consumo.
- Evaluacion de la pila Tenstorrent: servir un LLM real con API compatible con OpenAI sobre ttnn para medir latencia, throughput y estabilidad de la toolchain en Blackhole.
- Banco de pruebas de ports ttnn: comparar el rendimiento de MLA absorbida y cache paginada frente a otros ports del mismo modelo o de modelos de tamano similar en el mismo hardware.
- Demostracion de inferencia en edge con acelerador dedicado: escenarios donde no hay GPU disponible pero si un chip Tenstorrent, con una sola peticion concurrente y baja complejidad operativa.

## Benchmarks y rendimiento

El bundle solo publica metricas de inferencia propias, medidas el 2026-10-31 en un chip de una p300c en QuietBox 2, con carga media del host de 16 a 24, bf16, HiFi2, contexto 2048, traza activa y decodificacion greedy. No se reproducen benchmarks de calidad del modelo base (MMLU, HumanEval, GSM8K u otros).

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de decode, prompt `chat` (21 tokens), 64 tokens de salida, cache caliente | 32,7 tok/s (media de 3 ejecuciones, rango 32,65-32,67) | Segunda arranque, carga 16-24 |
| Velocidad de decode, prompt `chat, empty cache` (21 tokens), 64 tokens de salida, cache fria | 32,9 tok/s (media de 3 ejecuciones, rango 32,57-33,35) | Primer arranque de instalacion limpia |
| Time to first token, prompt `chat` (21 tokens) | 0,63 s (media de 3 ejecuciones en caliente) | Cache caliente |
| Prefill, prompt de 494 tokens, 1 token de salida | 15,1-15,6 s en 4 ejecuciones (aprox. 32 tok/s de prefill) | El prompt pasa por el chip token a token |
| Referencia del paquete de receta | 33,87 tok/s con carga ~3,6; 31,6 tok/s con carga 55 | Medicion del autor de la receta |
| Ejecucion previa de este bundle | 33,2-33,7 tok/s con carga 15-24 | Misma placa |

La velocidad varia aproximadamente 1 tok/s con la carga del host. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- Acelerador: 1 chip Tenstorrent Blackhole, mesh P150 (un p150 o un chip de una p300c en QuietBox 2). No es ejecutable en GPU convencional con este bundle.
- VRAM: no aplica; la memoria es la del chip Blackhole. Los pesos ocupan unos 8 GB en descarga.
- GPU recomendadas: no aplica a este paquete. Para ejecutar MiniCPM3-4B en GPU haria falta el modelo base con otro runtime (no documentado aqui).
- Cabe en GPU de consumo: no evaluado en este bundle; el paquete esta atado a ttnn y Blackhole.
- Despliegue: `tt-model serve <owner>/minicpm3-4b-blackhole`, o manualmente `bash install.sh` y `bash run.sh`. Servidor ASGI compatible con OpenAI en 127.0.0.1:20130 (configurable con `PORT` y `HOST`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 32,7-32,9 tok/s de decode, 0,63 s de TTFT con prompt de 21 tokens, ~32 tok/s de prefill (494 tokens en 15,1-15,6 s). Una sola peticion simultanea.
- Arranque: el primer inicio descarga ~8 GB, convierte pesos, compila kernels y captura la traza; tarda varios minutos. En maquinas compartidas hay que reservar el chip antes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware de este paquete | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM3-4B (este bundle, Blackhole) | 4B | 2048 tokens en este bundle | 1 chip Tenstorrent Blackhole P150 | apache-2.0 en repo; pesos con MiniCPM Model License no verificable | Bundle comunitario en HF, 0 descargas, Beta |
| openbmb/MiniCPM3-4B (modelo base) | 4B | no disponible en la informacion | GPU generica (no documentado aqui) | MiniCPM Model License (segun el autor del modelo) | Repositorio oficial en HF |
| Phi-3.5-mini-Instruct | no disponible en la informacion | no disponible en la informacion | no disponible | no disponible | Referencia citada por OpenBMB como superada en rendimiento global |
| GPT-3.5-Turbo-0125 | no disponible en la informacion | no disponible en la informacion | servicio propietario | propietaria | Referencia citada por OpenBMB como superada en rendimiento global |

La comparacion con Phi-3.5-mini-Instruct y GPT-3.5-Turbo-0125 proviene de afirmaciones del autor del modelo base, no de mediciones de este bundle. No se dispone de datos de benchmarks propios para comparar de forma rigurosa.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens por defecto: inadecuado para agentes de codigo, analisis de documentos largos o conversaciones extensas.
- Una sola peticion simultanea: no sirve como backend concurrente sin cambios en el servidor.
- Decodificacion exclusivamente greedy: no hay muestreo con temperatura, lo que limita la diversidad de respuestas.
- Tool calling y code interpreter no probados y declarados fuera de alcance por el autor.
- Idiomas: solo chino e ingles segun la model card del modelo base; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: inherente a un modelo de 4B; no se han publicado evaluaciones de fidelidad en este bundle.
- Sesgos: no documentados en la informacion disponible.
- Licencia de pesos ambigua: el repositorio declara apache-2.0, pero el autor del modelo exige seguir la MiniCPM Model License, cuyo enlace devolvio 404 el 2026-10-30. Antes de uso comercial hay que verificar los terminos en el repositorio de OpenBMB.
- Estado Beta: solo probado en un chip de una p300c con el instalador propio de tt-model; no instalado desde el Hub ni validado en otros hosts.
- Dependencia estricta de versiones: Python 3.12, ttnn 0.80.0, numpy 1.26.4, torch 2.7.0 CPU, transformers 5.19.0, todas fijadas exactamente en `requirements.txt`.
- Rendimiento sensible a la carga del host: variacion de aproximadamente 1 tok/s entre cargas medias de 3,6 y 55.
- No es un release oficial de OpenBMB ni de Tenstorrent; es un paquete comunitario.

## Enlaces

- Repositorio del bundle: https://huggingface.co/episod/minicpm3-4b-blackhole
- Modelo base: https://huggingface.co/openbmb/MiniCPM3-4B
- Repositorio OpenBMB/MiniCPM (licencia): https://github.com/OpenBMB/MiniCPM
- MiniCPM Model License (enlace 404 el 2026-10-30): https://github.com/OpenBMB/MiniCPM/blob/main/MiniCPM%20Model%20License.md
- Repositorio tt-orchard (port ttnn y logs de evidencia en `docs/run-logs/evidence/2026-10-30-minicpm3-thin/`): no disponible como URL en la informacion proporcionada
- Resultados de busqueda web: sin relacion con el modelo (resultados sobre un estudio de fitness y una plataforma de narrativa interactiva); no se incluyen como enlaces relevantes.
