# coder543/nemotron-speech-streaming-en-0.6b-coreai

## Resumen

Nemotron English — Core AI es una redistribución de los pesos de `nvidia/nemotron-speech-streaming-en-0.6b` (revisión `ebe59e5a817142986528bbbee5dba8db7b38ed50`) convertida a los activos `.aimodel` de Apple Core AI para ejecutarse sobre el Neural Engine (ANE) de los chips de Apple. Lo publica el usuario `coder543` y no es un modelo nuevo: reempaqueta y cuantiza el checkpoint original de NVIDIA para despliegue local en dispositivos Apple Silicon con macOS 27 o iOS 27.

Se trata de un sistema de reconocimiento automático del habla (ASR) en streaming basado en una arquitectura de transductor RNN-T: un encoder en streaming con subsampling causal, un predictor recurrente y un grafo de vocabulario, todo con estado persistente entre actualizaciones. Cada paso consume 1,12 segundos de audio mono nuevo a 16 kHz, lo que permite transcripción continua sin cortar el audio en fragmentos independientes. El modelo base ronda los 0,6B de parámetros.

Su relevancia actual radica en que demuestra ASR en streaming de calidad producción sobre hardware de consumo Apple sin GPU dedicada: reporta un WER normalizado por Whisper del 2,48% en un discurso completo y un RTFx de 74,6×, con participación medida del ANE (414 predicciones sobre 414 llamadas a grafo, sin intervalos de GPU en el proceso objetivo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNN-T: encoder en streaming con subsampling causal + predictor recurrente + grafo de vocabulario |
| Parametros totales | ~0,6B (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de LLM; ventana de streaming de 1,12 s por actualización con estado persistente |
| Tipos de cuantizacion | W8A16 (encoder orientado a ANE); FP16 (subsampling causal, predictor recurrente y grafo de vocabulario) |
| Idiomas soportados | Inglés (en) |
| Licencia | nvidia-open-model-license (campo `license: other`) |
| Formato de pesos | Activos `.aimodel` de Apple Core AI + `metadata.json` + `SHA256.json` |

## Arquitectura y entrenamiento

El bundle no entrena nada nuevo: son los pesos del checkpoint de NVIDIA `nemotron-speech-streaming-en-0.6b` convertidos y cuantizados para el ANE. La topología corresponde a un transductor RNN-T con un encoder en streaming y subsampling causal (la versión reducida del subsampling comparte pesos entre el punto de entrada inicial y los posteriores), un predictor recurrente y un grafo de vocabulario separado. La atención, la convolución, el subsampling y el estado del decoder recurrente persisten entre actualizaciones, de modo que el modelo mantiene contexto acústico a lo largo del flujo en lugar de reiniciarse en cada fragmento. La geometría en tiempo de ejecución y los prompts de idioma se definen en `metadata.json`.

El decoder es greedy y recurrente, y debe ser orquestado por un host: el bundle es un conjunto de activos de modelo, no una aplicación autónoma. El host tiene que implementar la extracción continua de características, preservar los estados de los grafos y ejecutar la decodificación recurrente con los datos proporcionados. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF/DPO en el modelo base, ya que la model card no los documenta. La validación de corrección se hace contra el checkpoint oficial de NVIDIA ejecutado en Transformers 5.16.0 (FP32, CPU/SDPA), que actúa como oráculo.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio mono a 16 kHz, en modo streaming.
- Actualizaciones de 1,12 segundos de audio nuevo por paso, con estado de atención, convolución, subsampling y decoder recurrente persistente.
- Decodificación greedy recurrente a partir de los grafos de predictor y vocabulario incluidos.
- Salida de transcripciones parciales durante el flujo y volcado final al terminar el audio.
- Ejecución sobre el Neural Engine de Apple con pesos cuantizados (W8A16/FP16), sin uso de GPU dedicada en las llamadas medidas.
- No soporta tool calling, function calling ni comportamiento de agente.
- No soporta visión, audio bidireccional, traducción ni multilingüismo: únicamente inglés.
- No incluye diarización ni alineación a nivel de palabra (los frames de emisión de tokens no son alineamientos de frontera de palabra cualificados).

## Casos de uso

- Transcripción en tiempo real en aplicaciones macOS/iOS: el modelo procesa audio en ventanas de 1,12 s con estado persistente, por lo que una app nativa puede mostrar subtítulos en vivo sobre el Neural Engine sin recurrir a la nube ni a una GPU.
- Dictado por voz en el dispositivo: al mantener el contexto acústico entre actualizaciones, resulta adecuado para dictado continuo de frases largas en inglés dentro de un editor de texto, preservando privacidad al no enviar audio a servidores.
- Subtitulado de reuniones y llamadas: con un RTFx de 74,6× sobre audio completo, puede transcribir grabaciones largas (el ejemplo de la model card cubre 18 min 15 s en 14,676 s) y generar actas o subtítulos a posteriori.
- Indexación y búsqueda de archivos de audio: un pipeline puede procesar lotes de grabaciones en inglés y producir texto para motores de búsqueda o sistemas de recuperación, aprovechando el alto rendimiento por segundo de audio procesado.
- Asistentes de voz locales en apps Apple: el host puede integrar el bundle para convertir comandos de voz en texto antes de pasarlos a un motor de intenciones, ejecutándose íntegramente en el dispositivo.
- Accesibilidad para personas con discapacidad auditiva: la baja latencia del streaming y el WER reportado del 2,48% permiten generar subtítulos casi en vivo en el propio terminal Apple.
- Herramientas de transcripción de desarrollador: al tratarse de activos de modelo con contrato de integración documentado, se puede embeber en utilidades CLI o apps de escritorio que necesiten ASR local en inglés.

## Benchmarks y rendimiento

Datos publicados en la model card sobre el discurso de JFK "We choose to go to the Moon" (M3 MacBook Air, 16 GB, macOS 27, runtime de release; medianas de tres ejecuciones tras un calentamiento):

| Métrica | Este bundle Core AI | FluidAudio 1,12 s (baseline) | Fuente oficial FP32 |
|---|---:|---:|---:|
| Extracto de 20 s | 0,265 s | 0,374 s | no disponible |
| Discurso completo (1.095,3 s) | 14,676 s | 22,479 s | no disponible |
| RTFx (discurso completo) | 74,6× | 48,7× | no disponible |
| WER normalizado por Whisper (discurso completo) | 2,48% (55/2.220) | no disponible | 2,52% (56/2.220) |

Otros datos medidos: preparación completa observada de 25,72 s y preparación cacheada de 0,054 s en un proceso nuevo; 414 predicciones del ANE en 414 llamadas a grafo con cero intervalos de GPU en el proceso objetivo. La model card advierte que una sola grabación no establece una clasificación general de precisión y que el rendimiento y la colocación en iPhone aún no están cualificados.

## Requisitos de hardware

- Plataforma: dispositivos físicos Apple Silicon con macOS 27 o iOS 27; no está pensado para GPU NVIDIA/AMD ni para CPU x86.
- Memoria: al ejecutarse sobre ANE y memoria unificada, no se especifica VRAM; el repo ocupa 0,6 GB y se ha probado en un MacBook Air M3 con 16 GB.
- Unidad de cómputo: Neural Engine (ANE), con pesos W8A16 en el encoder y FP16 en el resto de grafos.
- Preparación: 25,72 s completos observados en el primer arranque y 0,054 s de preparación cacheada en un proceso nuevo (cachés del driver pueden reutilizar trabajo relacionado; no son tiempos de compilación garantizados en instalación limpia).
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere un host propio que use Core AI y los activos `.aimodel`.
- Latencia y throughput: RTFx medido de 74,6× sobre discurso completo y 0,265 s para un extracto de 20 s en el hardware de referencia.
- No se cualifica el rendimiento en iPhone ni se ofrece ninguna afirmación de consumo energético.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Streaming | WER (discurso JFK, normalizado) | RTFx | Licencia | Plataforma |
|---|---|---|---:|---:|---|---|---|
| Este bundle (coder543, Core AI) | RNN-T ASR en `.aimodel` | ~0,6B | Sí (1,12 s) | 2,48% (55/2.220) | 74,6× | nvidia-open-model-license | Apple Silicon (ANE) |
| Fuente oficial NVIDIA `nemotron-speech-streaming-en-0.6b` (FP32, Transformers) | RNN-T ASR NeMo | ~0,6B | Sí | 2,52% (56/2.220) | no disponible | nvidia-open-model-license | CPU/GPU (PyTorch) |
| FluidAudio 1,12 s (baseline de velocidad) | ASR de caja negra | no disponible | Sí (1,12 s) | no disponible | 48,7× | no disponible | no disponible |
| Nemotron Speech Streaming En 0.6b GGUF | ASR cuantizado GGUF | ~0,6B | Sí | no disponible | no disponible | no disponible | CPU/GPU (llama.cpp) |

La comparación con FluidAudio es únicamente de velocidad; la model card lo describe como baseline de caja negra y la identidad del checkpoint fuente de FluidAudio no se verificó de forma independiente.

## Limitaciones y advertencias

- Solo reconoce inglés; no cubre traducción ni idiomas adicionales.
- Es exclusivamente ASR: no genera texto libre, no razona, no escribe código y no soporta tool calling ni agentes.
- No es una aplicación autónoma: requiere un host que implemente extracción de características, gestión de estados y decodificación recurrente.
- Los frames de emisión de tokens no son alineamientos de frontera de palabra cualificados, por lo que no deben usarse para marcar palabras con precisión.
- La precisión solo se ha validado sobre una grabación (el discurso de JFK); una sola muestra no establece una clasificación general de calidad.
- El WER reportado depende de la normalización Whisper; otros esquemas de normalización pueden dar cifras distintas.
- El rendimiento y la colocación en iPhone no están cualificados; los datos son de un MacBook Air M3.
- Riesgo de alucinación y errores en audio con ruido, acentos no estadounidenses, solapamiento de voces o dominios muy alejados del entrenamiento (no documentados en la información disponible).
- No se documentan sesgos ni composición del dataset de entrenamiento del modelo base.
- Licencia `nvidia-open-model-license` (campo `other`): hay que revisar los términos de NVIDIA antes de uso comercial; el bundle incluye `LICENSE` y `NOTICE`.
- El modelo base es propiedad de NVIDIA; esta ficha corresponde a una conversión de terceros (`coder543`), sin soporte oficial de NVIDIA.
- iPhone/iOS: la propia model card indica que el rendimiento y la colocación en iPhone no están aún cualificados.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/coder543/nemotron-speech-streaming-en-0.6b-coreai
- Modelo base NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Revisión fijada del modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/ebe59e5a817142986528bbbee5dba8db7b38ed50
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Texto de referencia (stt-bench-matrix): https://github.com/coder543/stt-bench-matrix/blob/4689df1aec5dd0e96b223caf3a9a176675c10fa5/samples/jfk_rice_16k.txt
- Integración Core AI (terceros): https://huggingface.co/spybyscript/nemotron-speech-streaming-en-0.6b-aimodel/blob/main/INTEGRATION.md
- Recetas Olive de Microsoft para el modelo base: https://github.com/microsoft/olive-recipes/tree/main/nvidia-nemotron-speech-streaming-en-0.6b/scripts
- Demo de streaming en tiempo real con NeMo: https://github.com/aravindbuilds/nemtron-streaming-mic/tree/main/
- Versión GGUF de terceros: https://local-ai-zone.github.io/models/nemotron-speech-streaming-en-0-6b.html
