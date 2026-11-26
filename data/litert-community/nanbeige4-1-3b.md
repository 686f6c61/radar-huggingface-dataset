# litert-community/Nanbeige4.1-3B

## Resumen

Nanbeige4.1-3B es un modelo de lenguaje denso de 3.000 millones de parámetros desarrollado por Nanbeige, distribuido bajo licencia Apache-2.0 y orientado a razonamiento explícito mediante un bloque `<think>…</think>` antes de la respuesta final. La versión aquí descrita es la conversión realizada por la comunidad `litert-community` al formato `.litertlm` de LiteRT-LM, el runtime de Google AI Edge para inferencia en dispositivo (on-device), lo que permite ejecutarlo en teléfonos, placas SBC y navegadores sin depender de servidores.

El modelo se apoya en una arquitectura transformer densa de tipo Llama, sin mezcla de expertos, y está pensado para un equilibrio poco habitual: capacidades de razonamiento comparables a modelos notablemente mayores, pero con un tamaño que cabe en memoria de dispositivos de gama alta. La conversión incluye cuantización int4 por bloques (bloque de 32) con clipping óptimo OCTAV y embeddings en INT8, dando lugar a un fichero de 2,41 GB con una caché KV de 4.096 tokens.

Su relevancia actual radica en que demuestra que el razonamiento con cadena de pensamiento ya es viable en el borde: la model card reporta 21,9 tok/s de decodificación en la GPU de un Galaxy S26 y 10,6 tok/s en CPU, además de una demo web ejecutable con WebGPU directamente en el navegador. Es, por tanto, una pieza útil para quienes evalúan IA local de bajo consumo con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama), sin MoE |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (caché KV del fichero LiteRT-LM) |
| Tipos de cuantizacion | int4 por bloques (bloque 32) + OCTAV optimal-clipping simétrico; embeddings INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en safetensors |
| Tamano del fichero | 2,41 GB (`model.litertlm`) |
| Runtime | LiteRT-LM 0.19.0–0.19.2 (probado); CLI `litert-lm` |
| Plantilla de prompt | ChatML (`<|im_start|>role\n … <|im_end|>`) |
| Tokenizer | incluido en el bundle `.litertlm` |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.1-3B emplea un transformer denso estándar de la familia Llama con 3.000 millones de parámetros, diseñado específicamente para razonamiento paso a paso: genera primero una cadena de pensamiento dentro de `<think>…</think>` y después la respuesta final, cerrando limpiamente en `<|im_end|>`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles en la información proporcionada.

La conversión a LiteRT-LM introduce varias decisiones técnicas relevantes. Los pesos se cuantizan a int4 por bloques de 32 con clipping óptimo OCTAV y simetría, mientras que los embeddings se mantienen en INT8. El fichero publicado el 2026-11-16 reescribe los grafos de prefill y decode para GPU sin modificar ningún peso, lo que según la model card mejora la decodificación entre ×1,25 y ×1,66 y el prefill entre ×1,46 y ×1,96 frente al fichero anterior, según el dispositivo. Además, los embeddings se externalizan para que cada sección del bundle quede por debajo de 2 GiB, el límite de sección única de iOS, aunque el fichero no se ha probado en iOS.

## Capacidades

- Generación de texto con razonamiento explícito en un canal de pensamiento `<think>…</think>` antes de la respuesta.
- Resolución de problemas aritméticos y de lógica de varios pasos (la model card cita el ejemplo clásico de los bolts de fibra, resuelto correctamente con total 3).
- Generación de código y texto general en un pipeline de `text-generation`.
- Inferencia en dispositivo con backend GPU (WebGPU, Android) y CPU multihilo.
- Ejecución en navegador mediante la demo web de LiteRT-LM con WebGPU.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita más allá del razonamiento interno del bloque de pensamiento.
- Modo de pensamiento no desactivable de forma fiable: `ThinkingConfig(enable_thinking=False)` y `--thinking false` no surtieron efecto en las versiones probadas.

## Casos de uso

- Asistente de razonamiento en móvil sin conexión: integrado vía LiteRT-LM en la GPU de un Galaxy S26, el modelo decodifica a 21,9 tok/s y prefill a 242 tok/s, suficiente para responder consultas de lógica o matemáticas en local sin enviar datos a la nube.
- Tutor educativo embebido: el bloque `<think>` hace visible el razonamiento paso a paso, útil para explicar problemas aritméticos o de sentido común a estudiantes directamente en el dispositivo.
- Automatización en Raspberry Pi 5: con 2,5 tok/s de decodificación y 16 tok/s de prefill en CPU de 4 hilos, encaja en tareas por lotes de baja frecuencia, como resúmenes o clasificación de texto en un nodo edge.
- Demo interactiva en navegador: la demo web de LiteRT-LM carga el fichero desde la rama `web` (2,41 GB) y ejecuta con WebGPU, lo que permite probar el modelo sin instalación para validación rápida o formación.
- Procesamiento de texto con privacidad estricta: al ejecutarse íntegramente on-device con licencia Apache-2.0, es apto para entornos sanitarios o legales donde el texto no puede salir del terminal.
- Prototipado de pipelines de razonamiento: sirve como banco de pruebas para evaluar cadenas de pensamiento y presupuestos de tokens (`thinking_token_budget`) antes de escalar a modelos mayores.
- Integración en aplicaciones Android: el backend GPU requiere LiteRT-LM 0.19.0 o superior, lo que permite embeber el modelo en apps nativas con aceleración por GPU.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Sí incluye mediciones de rendimiento en dispositivo:

| Dispositivo / configuración | Decode | Prefill | TTFT | Fecha |
|---|---|---|---|---|
| Galaxy S26 · LiteRT-LM 0.16.0 · CPU | 10,6 tok/s | 39 tok/s | 5,77 s | 2026-09-05 |
| Raspberry Pi 5 · LiteRT-LM 0.16.1 · CPU, 4 hilos | 2,5 tok/s | 16 tok/s | 18,14 s | 2026-09-02 |
| Galaxy S26 · GPU · LiteRT-LM v0.19.0 | 21,9 tok/s | 242 tok/s (1.024 tokens) | no disponible | 2026 |

Las cifras de GPU corresponden a la mediana de las iteraciones 2 y 3 sobre dos ejecuciones, repitiendo cada carga de trabajo tres veces. En CPU del Galaxy S26, el fichero actual usa 3,90 GB de pico de memoria (`VmHWM`) frente a 3,22 GB del anterior.

## Requisitos de hardware

- VRAM/memoria: el fichero ocupa 2,41 GB en disco; en el Galaxy S26 CPU el pico medido es de 3,90 GB, por lo que se recomienda al menos 4 GB de memoria disponible.
- GPU de escritorio: no hay mediciones publicadas para A100, H100 o RTX 4090; el runtime objetivo es LiteRT-LM, no vLLM ni TGI.
- GPU móvil: funciona en la GPU del Galaxy S26 (LiteRT-LM 0.19.0+) y del Pixel 11 Pro con aceleración WebGPU/GPU.
- Consumer GPU: no disponible; la orientación del proyecto es edge, no servidor.
- SBC: Raspberry Pi 5 con CPU de 4 hilos funciona a 2,5 tok/s de decodificación.
- Despliegue: CLI `litert-lm` (`pip install litert-lm`), binario `litert_lm_main` compilado desde el repositorio, y demo web con WebGPU.
- Latencia: TTFT de 5,77 s en CPU de Galaxy S26 y 18,14 s en Raspberry Pi 5; no se reporta TTFT para GPU.
- Presupuesto de tokens: al no poder desactivarse el pensamiento, conviene fijar `thinking_token_budget` (por ejemplo 300) y un límite superior holgado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.1-3B (LiteRT-LM) | 3B denso | 4.096 | `.litertlm` / LiteRT-LM | Apache-2.0 | Razonamiento con `<think>`, on-device |
| Modelo base Nanbeige4.1-3B | 3B denso | no disponible | safetensors | Apache-2.0 | Referencia original, sin cuantizar |
| Alternativas de 3B en edge | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se han proporcionado datos de benchmarks ni de modelos alternativos que permitan una comparación cuantitativa fiable; la comparativa se limita al propio modelo base y a la ausencia de referencias verificables.

## Limitaciones y advertencias

- El modo de pensamiento no se puede desactivar de forma fiable: `--thinking false` y `ThinkingConfig(enable_thinking=False)` no surtieron efecto en LiteRT-LM 0.18.0 y 0.19.2, por lo que hay que dimensionar el límite de tokens al alza o la respuesta puede truncarse antes de la conclusión.
- Respuestas que superan los 10 minutos de generación en algunos casos, según advierte la model card, lo que desaconseja su uso en interacción síncrona con presupuestos ajustados.
- La CLI `litert-lm` (0.14.0–0.19.2) reutiliza un `model.litertlm` descargado previamente sin verificar su hash contra el repositorio; una copia antigua o una descarga incompleta persiste en uso y hay que borrarla manualmente.
- En Android, la ruta GPU exige LiteRT-LM 0.19.0 o superior; versiones anteriores no funcionan con este fichero.
- El fichero actual solo se ha probado con LiteRT-LM 0.19.0 (móviles y Mac) y 0.19.1–0.19.2 (Mac); no se ha probado en iOS.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como modelo de razonamiento pequeño, puede producir cadenas de pensamiento plausibles pero incorrectas.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero la model card no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento normativo en dominios regulados.

## Enlaces

- Hugging Face (conversión LiteRT-LM): https://huggingface.co/litert-community/Nanbeige4.1-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Nanbeige4.1-3B
- Ficha edge-compat con mediciones: https://github.com/john-rocky/edge-compat/blob/main/cards/nanbeige4.1-3b/CARD.md
