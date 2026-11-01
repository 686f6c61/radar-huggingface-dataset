# oliver0804/RWKV7-G1j-2.9B-RK3588-rkllm-w8a8

## Resumen

RWKV7-G1j-2.9B-RK3588-rkllm-w8a8 es una conversión del modelo de lenguaje RWKV7-G1j-2.9B (desarrollado por el proyecto FLA, publicado en el repositorio `fla-hub/RWKV7-G1j-2.9B-20260831`) al formato propietario RKLLM de Rockchip, cuantizado en w8a8 y optimizado para ejecutarse en la NPU de los SoC RK3588 y RK3588S. El autor de la conversión es el usuario de HuggingFace `oliver0804`, y el artefacto resultante está pensado exclusivamente para inferencia en placas de desarrollo basadas en esos chips, como la Radxa ROCK 5C.

El interés de esta ficha no reside en el modelo base —un transformer recurrente de 2.900 millones de parámetros con arquitectura RWKV7— sino en la conversión: empaqueta el modelo en un formato que el runtime `librkllmrt.so` 1.3.1 puede cargar directamente sobre la NPU, con pesos de 8 bits para activaciones y pesos. La model card documenta seis correcciones necesarias para completar la conversión, lo que da una idea de la fragilidad del ecosistema RKLLM en esta versión.

La relevancia práctica es doble: por un lado, permite ejecutar un modelo de casi 3B parámetros en hardware de bajo consumo con unos 2,9 GB de memoria; por otro, al ser RWKV una RNN, la memoria no crece con la longitud de la conversación (no hay caché KV), una ventaja estructural frente a transformers del mismo tamaño en escenarios de contexto largo. El rendimiento medido es modesto: 7,1 tok/s de generación y 97 tok/s de prefill en una RK3588S con 8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RWKV7 (RNN lineal, transformer recurrente) |
| Parámetros totales | 2.900 millones (2.9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | w8a8 (8 bits pesos y activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (`.rkllm`), runtime `librkllmrt.so` 1.3.1 |
| Modelo base | `fla-hub/RWKV7-G1j-2.9B-20260831` |
| Toolkit de conversión | `rkllm-toolkit` 1.3.1 |
| Tamaño del repositorio | 3,2 GB |
| Plataforma objetivo | Rockchip RK3588 / RK3588S (NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es RWKV7, un modelo recurrente lineal que combina formulaciones de atención lineal con una recurrencia por token. A diferencia de un transformer, no mantiene una caché KV que crezca con el contexto: el estado se actualiza token a token con un coste de memoria constante. Esta propiedad es la que el autor destaca en la model card como ventaja diferencial frente a transformers en el mismo hardware.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por fases de RLHF o DPO; la model card de esta conversión no los detalla y remite al repositorio del modelo base. La innovación técnica documentada aquí es de ingeniería de conversión, no de entrenamiento: el autor describe seis correcciones necesarias para que RKLLM acepte el checkpoint, entre ellas la incompatibilidad de versiones de `transformers` (RKLLM 1.3.1 exige 5.8.0, mientras que los requisitos oficiales de RWKV7 fijan 4.51.3), el fallo de la inicialización en bf16 en la inicialización ortogonal basada en QR (se resuelve inicializando en float32), la necesidad de usar el formato de pesos de `fla-hub` en lugar del formato HF más reciente (`RWKV/RWKV7-G1k-*`), la fusión de los parámetros por token `lr/w/k/v/a/g` en un tensor `x_x [6, hidden]` con orden r, w, k, v, a, g, el registro manual de las clases de `fla` en `transformers` (que no incluye `RWKV7ForCausalLM`) y la desactivación de la fusión de LayerNorm (`fuse_norm: false`) por falta de soporte en RKLLM.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`.
- Modo de razonamiento con etiquetas `<think>`: la plantilla de chat permite activar o desactivar el bloque de pensamiento antes de la respuesta.
- Conversaciones multi-turno con memoria constante: al ser una RNN, el consumo de memoria no aumenta con la longitud del historial.
- Plantilla de chat propia basada en roles `System:`, `User:` y `Assistant:`; el runtime debe configurarse para no aplicar su plantilla integrada, ya que de lo contrario el modelo reproduce los marcadores ChatML como texto plano.
- Ejecución en NPU de Rockchip mediante RKLLM, sin necesidad de GPU dedicada.
- Capacidades multilingües: no disponibles en la información proporcionada; el único benchmark publicado emplea un conjunto de preguntas en chino tradicional (zh-TW).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, más allá del modo de pensamiento.

## Casos de uso

- Asistentes conversacionales en dispositivos empotrados: el modelo cabe en unos 2,9 GB de memoria y se ejecuta sobre la NPU de una RK3588S, lo que permite integrar un chatbot local en placas de bajo consumo sin conexión a la nube ni GPU.
- Conversaciones de larga duración en hardware limitado: al no mantener caché KV, la memoria permanece plana a medida que crece el historial, lo que resulta adecuado para sesiones prolongadas en dispositivos con 8 GB de RAM compartida.
- Procesamiento de texto en el borde (edge AI): generación de resúmenes, respuestas o clasificaciones directamente en el dispositivo, evitando enviar datos a servidores externos.
- Prototipado de aplicaciones de IA local sobre Rockchip: el paquete RKLLM se carga con `librkllmrt.so` 1.3.1 y sirve como base para validar flujos de inferencia en NPU antes de invertir en hardware mayor.
- Modo de razonamiento para tareas que requieren pasos intermedios: la plantilla con `<think>` permite separar el borrador de razonamiento de la respuesta final en aplicaciones de preguntas y respuestas.
- Evaluación comparativa de arquitecturas recurrentes frente a transformers en el mismo hardware: el benchmark publicado (5/7 en un conjunto zh-TW, 7,1 tok/s de generación, 97 tok/s de prefill) sirve como referencia para medir la viabilidad de RWKV en despliegues empotrados.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en una Radxa ROCK 5C (RK3588S, 8 GB), con frecuencias bloqueadas, decodificación greedy, pensamiento desactivado y un conjunto de 7 preguntas en chino tradicional (zh-TW):

| Métrica | Valor |
|---|---|
| Puntuación | 5 / 7 |
| Velocidad de generación | 7,1 tok/s |
| Velocidad de prefill | 97 tok/s |
| Memoria | ~2,9 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El conjunto de 7 preguntas es demasiado pequeño para extraer conclusiones sobre calidad general.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,9 GB según la medición del autor en una RK3588S de 8 GB.
- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU; el autor valida en una Radxa ROCK 5C.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el artefacto está empaquetado para RKLLM y no para CUDA.
- Compatibilidad con GPU de consumo: no disponible; el formato RKLLM no es portable a otros runtimes sin reconversión.
- Runtime: `librkllmrt.so` versión 1.3.1, obligatoria según la model card.
- Toolkit de conversión: `rkllm-toolkit` 1.3.1, instalado con `--no-deps` y `transformers` 5.8.0 añadido por separado.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible; estos runtimes no cargan el formato RKLLM.
- Throughput medido: 7,1 tok/s de generación y 97 tok/s de prefill en RK3588S con relojes bloqueados.
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| RWKV7-G1j-2.9B-RK3588-rkllm-w8a8 (esta ficha) | 2,9B | no disponible | RKLLM w8a8 / NPU RK3588 | Apache-2.0 | 5/7 zh-TW, 7,1 tok/s gen., 97 tok/s prefill |
| fla-hub/RWKV7-G1j-2.9B-20260831 (modelo base) | 2,9B | no disponible | safetensors / GPU | Apache-2.0 | no disponible en esta información |
| RWKV/RWKV7-G1k-* (formato HF más reciente) | no disponible | no disponible | safetensors / GPU | no disponible | no disponible; incompatible con RKLLM 1.3.1 según la model card |
| Transformers de ~3B en RK3588 | ~3B | variable | RKLLM u otros | variable | no disponible; la model card afirma que ninguno iguala la memoria plana de RWKV |

La comparación directa con transformers del mismo tamaño en RK3588 no puede cuantificarse con los datos disponibles; la model card solo afirma cualitativamente que ninguno iguala la constancia de memoria de RWKV.

## Limitaciones y advertencias

- El artefacto solo es utilizable con `librkllmrt.so` 1.3.1 y sobre NPU de Rockchip RK3588/RK3588S; no es portable a otros runtimes ni a GPU sin reconversión.
- La conversión requirió seis correcciones documentadas, lo que indica fragilidad del pipeline y riesgo de que futuras versiones de RKLLM o `transformers` rompan la compatibilidad.
- El modelo base es G1j, una versión anterior a G1k, porque RKLLM solo acepta el formato de pesos de `fla-hub`; no se puede usar el checkpoint más reciente de RWKV7.
- Es obligatorio desactivar la plantilla de chat integrada del runtime y renderizar manualmente los roles; de lo contrario, el modelo reproduce los marcadores ChatML como texto plano.
- El archivo de vocabulario `rwkv_vocab_v20230424.txt` debe estar presente para el correcto funcionamiento.
- El benchmark publicado consta de solo 7 preguntas en chino tradicional, por lo que no es representativo de la calidad general ni de otros idiomas.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque son inherentes a un modelo de lenguaje de 2,9B.
- La licencia Apache-2.0 se hereda del modelo base y permite uso comercial, pero los pesos han sido modificados durante la conversión; conviene revisar el archivo `LICENSE` del repositorio.
- El repositorio tiene 7 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oliver0804/RWKV7-G1j-2.9B-RK3588-rkllm-w8a8
- Modelo base: https://huggingface.co/fla-hub/RWKV7-G1j-2.9B-20260831
- Formato HF más reciente de RWKV7 (no compatible con RKLLM 1.3.1): https://huggingface.co/RWKV/RWKV7-G1k-2.9B
- Script de conversión mencionado en la model card: `conversion/convert_rkllm.py` (incluido en el repositorio)
- Script de corrección de pesos: `conversion/fix_rwkv7_fla.py` (incluido en el repositorio)
- Toolkit RKLLM de Rockchip: no disponible en la información proporcionada
- Paper de RWKV7: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
