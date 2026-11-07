# loom-fun/bartowski-Qwen2.5-7B-Instruct-loom

## Resumen

`loom-fun/bartowski-Qwen2.5-7B-Instruct-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Qwen2.5-7B-Instruct-GGUF`, en su variante `Q4_K_M`. El autor es `loom-fun`, y el paquete se ha producido con el flujo de trabajo `loom-skills` sobre una máquina AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) con Ubuntu 24.04. El objetivo es ejecutar Qwen2.5-7B-Instruct sobre GPU AMD mediante el servidor `loom-serve`, que expone una API compatible con OpenAI.

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso de aproximadamente 7.600 millones de parámetros desarrollado por Alibaba Qwen, con 32.768 tokens de contexto y capacidad de tool calling. Este paquete Loom añade decodificación especulativa por n-gram prompt lookup (profundidad 2, activada por defecto) y publica comparativas de rendimiento frente a llama.cpp en el mismo hardware y el mismo GGUF.

La relevancia del artefacto es de infraestructura más que de modelado: demuestra que un GGUF Q4_K_M de 7B puede servirse en un APU AMD con memoria unificada, con ganancias medidas de entre el 16 % y el 116 % en decodificación y prefill frente a llama.cpp en el hardware de referencia, y con puertas de corrección que verifican la equivalencia de salida frente a la implementación de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5); paquete de despliegue Loom sobre GGUF |
| Parámetros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por petición (configurado en el paquete) |
| Tipos de cuantización | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible en la información del paquete (heredados de Qwen2.5-7B-Instruct) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen2.5-7B-Instruct-Q4_K_M.gguf`) más `model.json` y programas `.loom` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza el checkpoint GGUF de bartowski, derivado de Qwen2.5-7B-Instruct, un transformer denso con atención por cabezas agrupadas, RoPE y contexto nativo de 32.768 tokens. No se documenta en la información disponible el volumen de tokens de preentrenamiento, la composición del dataset ni las fases de ajuste (SFT, RLHF o DPO) del modelo original.

La innovación técnica del artefacto está en la capa de ejecución: `loom-serve` implementa decodificación especulativa mediante n-gram prompt lookup con profundidad 2, activada por defecto, y genera kernels compilados para gfx1151 validados contra implementaciones de referencia (37/37 tests unitarios superados). La decodificación especulativa acepta el 12 % de los tokens propuestos por el drafter en la puerta `spec`, y la puerta de corrección verifica que la salida con especulación activada es idéntica a la obtenida con ella desactivada. El paquete también fija el tamaño de contexto a 33.792 tokens en la configuración de llama.cpp usada como referencia y limita a 4 peticiones concurrentes y 4.096 tokens de salida por defecto.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada de Qwen2.5-7B-Instruct.
- Tool calling en estilo OpenAI: campos `tools` y `tool_calls` en `/v1/chat/completions`.
- API compatible con OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080`.
- Decodificación especulativa por n-gram prompt lookup (profundidad 2), activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia verificada frente a ejecuciones aisladas.
- Procesamiento de documentos largos hasta 32.768 tokens por petición (validado con needle-in-a-haystack hasta la mitad del contexto).
- Sin modo de razonamiento o thinking: la tabla de características marca `reasoning / thinking` y `reasoning effort` como no soportados.
- Sin entrada de imagen ni de audio.
- Capacidades multilingües: no documentadas en la información del paquete.

## Casos de uso

- Servicio de chat sobre APU AMD: desplegar `loom-serve --device=amdgpu` en un Ryzen AI Max+ 395 para atender peticiones OpenAI-style con 48,1 tok/s de decodificación en prompts cortos, adecuado para asistentes interactivos en hardware de escritorio sin GPU discreta.
- Procesamiento de documentos largos: con 32.768 tokens de contexto y 1.797,8 tok/s de prefill en documentos de 1k tokens (1.150,0 tok/s en 32k), resulta viable resumir o extraer información de contratos, informes o expedientes de decenas de páginas en una sola petición.
- Agentes con tool calling: la puerta `agent` valida el bucle multi-turno de llamadas a herramientas con renderizado exacto del prompt y reutilización de historial, por lo que puede integrarse en flujos de automatización que consulten APIs externas.
- Generación de código asistida en local: al heredar las capacidades de Qwen2.5-7B-Instruct y soportar tool calling, puede conectarse a herramientas de edición o ejecución dentro de un IDE, manteniendo los datos en la máquina.
- Atención al cliente multi-turno: la ventana de 32k tokens permite conservar el historial completo de una conversación larga sin truncar, y la concurrencia de 4 peticiones cubre despliegues de pequeña escala.
- Búsqueda aumentada (RAG) en el borde: el prefill de 1.873,5 tok/s con documentos de 2k tokens permite inyectar fragmentos recuperados y responder con latencia baja en entornos sin conectividad o con requisitos de privacidad.
- Evaluación y desarrollo de motores de inferencia: las puertas de corrección (`golden`, `compare`, `spec`, `consistency`, `sampling`, `needle`) convierten este paquete en una referencia reproducible para comparar Loom frente a llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, el 7 de noviembre de 2026, sobre el mismo GGUF en ambos motores:

| Métrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificación tok/s, prompt corto | 41,4 | 48,1 | +16 % | 54,8 | 88 % |
| Decodificación tok/s, contexto 2k | 36,8 | 50,9 | +38 % | 63,4 | 80 % |
| Decodificación tok/s, contexto 32k | 27,4 | 38,1 | +39 % | 69,6 | 55 % |
| Prefill tok/s, documento 1k | 1218,2 | 1797,8 | +48 % | 4452,4 | 40 % |
| Prefill tok/s, documento 2k | 1123,5 | 1873,5 | +67 % | 4386,0 | 43 % |
| Prefill tok/s, documento 8k | 999,4 | 1693,3 | +69 % | 4025,6 | 42 % |
| Prefill tok/s, documento 16k | 746,3 | 1469,9 | +97 % | 3628,1 | 41 % |
| Prefill tok/s, documento 32k | 531,6 | 1150,0 | +116 % | 3029,8 | 38 % |
| 4 flujos, decodificación agregada tok/s | 137,2 | 122,6 | -11 % | 237,6 | 52 % |
| Decodificación especulativa, tokens aceptados | — | 12 % | — | no aplica | no aplica |

Notas de medición: llama.cpp con build `llamacpp-rocm/b1369` y argumentos `-ngl 99 -cram 0 --spec-type ngram-simple -c 33792 -kvu -np 4`; Loom con decodificación especulativa activada (n-gram prompt lookup, profundidad 2). Los tiempos de Loom son del lado del cliente y los de llama.cpp del lado del servidor. El roofline se calcula para 216 GB/s y 59 TFLOP/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete se sirve con `--memory_bytes=14000000000` (14 GB) en memoria unificada del APU; el GGUF Q4_K_M de un 7B ocupa aproximadamente 4,5-5 GB de pesos, y el resto del presupuesto cubre caché KV y buffers para 32k de contexto.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) es el hardware validado. No se documentan otros dispositivos en la información disponible.
- GPU de consumo: el paquete está orientado a APUs AMD con memoria unificada; no se documenta compatibilidad con GPU NVIDIA ni con GPU AMD discretas.
- Opciones de despliegue: `loom-serve` (motor propio, requiere `pip install "hrx-loom[hf]"`); llama.cpp se usa como referencia de comparación, no como destino del paquete.
- Latencia y throughput: 48,1 tok/s de decodificación en prompt corto, 38,1 tok/s a 32k de contexto, 1.797,8 tok/s de prefill a 1k y 1.150,0 tok/s a 32k; 122,6 tok/s agregados con 4 flujos concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Rendimiento |
|---|---|---|---|---|---|
| `loom-fun/bartowski-Qwen2.5-7B-Instruct-loom` | ~7,6B | 32.768 | GGUF Q4_K_M + Loom | no disponible | 48,1 tok/s decodificación en Strix Halo (medido) |
| `bartowski/Qwen2.5-7B-Instruct-GGUF` | ~7,6B (8B según la card) | heredado de Qwen2.5 | GGUF, múltiples cuantizaciones | no disponible | no reportado en la información disponible |
| `Qwen/Qwen2.5-7B-Instruct` | ~7,6B (8B según la card) | 32.768 | safetensors (pesos originales) | no disponible | no reportado en la información disponible |

La comparación relevante es de motor, no de modelo: sobre el mismo GGUF, Loom supera a llama.cpp entre un 16 % y un 116 % en decodificación y prefill, pero pierde un 11 % en throughput agregado con 4 flujos concurrentes.

## Limitaciones y advertencias

- Sin modo de razonamiento: `reasoning / thinking` y `reasoning effort` no están soportados, lo que limita tareas que requieran cadenas de pensamiento explícitas.
- Sin visión ni audio: no admite entrada de imagen ni de audio.
- Evidencia incompleta en contexto completo: la puerta `needle_full` (needle-in-a-haystack al contexto completo) no tiene evidencia registrada; solo se valida hasta la mitad del contexto.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por defecto.
- Regresión en concurrencia: el throughput agregado con 4 flujos es un 11 % inferior a llama.cpp en el hardware de referencia.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en el modelo base antes de producción.
- Idiomas no documentados en el paquete; las capacidades multilingües dependen del modelo Qwen2.5 subyacente y no están verificadas aquí.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; son los del modelo Qwen2.5-7B-Instruct original.
- Madurez del ecosistema: hrx-loom 0.1.0 y un commit concreto de hrx-system; el paquete tiene 0 descargas y 0 likes, sin validación comunitaria.
- Las mediciones de rendimiento provienen de una única máquina y de una ejecución por valor en decodificación y prefill (media de 1-2 ejecuciones), por lo que la variabilidad no está caracterizada.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/bartowski-Qwen2.5-7B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del motor Loom: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de referencia (DevLab Dispatch run 42342192972): https://github.com/loom-fun/loom-skills/actions/runs/42342192972
