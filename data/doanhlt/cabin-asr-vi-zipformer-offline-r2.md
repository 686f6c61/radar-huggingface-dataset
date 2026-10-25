# doanhlt/cabin-asr-vi-zipformer-offline-r2

## Resumen

cabin-asr-vi-zipformer-offline-r2 es un modelo de reconocimiento automático del habla (ASR) en vietnamita, no streaming, desarrollado por doanhlt para la aplicación Cabin Offline. Se trata de un transducer zipformer2 de 68,6 M de parámetros con tokenizador BPE de 2000 unidades, exportado al formato sherpa-onnx para inferencia en dispositivo. Su interés radica en que condensa en ~80 MB un sistema de transcripción que corre en CPU más de 40 veces por encima del tiempo real, sin GPU ni conexión.

El modelo se obtiene por destilación de conocimiento desde R13x (un fine-tune de Qwen3-ASR-1.7B con licencia Apache-2.0) y un fine-tune posterior de pilot1, el candidato anterior de la misma serie. Mantiene la misma arquitectura, nombres de fichero y grafo que el modelo ya publicado en la app (`sherpa-onnx-zipformer-vi-int8-2025-04-20`), de modo que es intercambiable sin tocar el código de integración.

Es relevante ahora porque demuestra una mejora medible y estadísticamente significativa frente al modelo en producción en FLEURS-100 vi (7,44 % de WER frente a 10,19 %) y en los conjuntos limpios de YODAS2, con un incremento de tamaño de solo el 2,5 %. No obstante, el propio autor lo etiqueta explícitamente como **candidato y no release**: frente a pilot1 las diferencias quedan dentro del ruido estadístico y las pruebas con capturas reales de teléfono siguen pendientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transducer zipformer2 (encoder zipformer2 + decoder + joiner), entrenado con icefall/k2 |
| Parámetros totales | 68,6 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR no autoregresivo; la ventana de entrada la fija el chunking del encoder, no documentado) |
| Tipos de cuantización | Encoder y joiner en int8; decoder en fp32 |
| Idiomas soportados | Vietnamita (`vi`), con cobertura de code-switching vietnamita-inglés presente en los datos de entrenamiento; no se detalla el inventario de lenguas del code-switching |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX para sherpa-onnx (encoder, decoder, joiner, `tokens.txt`, `bpe.model`); checkpoint icefall `pretrained.pt` para reentrenamiento |
| Tamaño del paquete desplegable | 79,3 MB (el modelo en producción: 77,4 MB) |
| Tamaño del repositorio | 0,4 GB |
| Tokenizador | BPE con vocabulario de 2000 unidades |
| Modo de decodificación | Offline / no streaming |

## Arquitectura y entrenamiento

El modelo es un transducer (RNN-T) con encoder zipformer2, la evolución del encoder Zipformer de icefall que combina bloques convolucionales y de atención con resoluciones temporales múltiples para reducir el coste computacional manteniendo el contexto acústico. La cabeza predictora (decoder) y la red conjunta (joiner) operan sobre unidades BPE de 2000 símbolos. El resultado se exporta a ONNX con el encoder y el joiner cuantizados a int8 y el decoder en fp32, y se carga mediante sherpa-onnx, que ejecuta el grafo en CPU sin necesidad de runtime de PyTorch.

El entrenamiento parte del checkpoint de pilot1 (epoch 3, promedio de 2) y emplea 96,01 horas de audio, de las cuales el 51 % está etiquetado por humanos. La composición es: 27,646 h de clips `vi000` de YODAS2 con etiquetas de R13x conservadas solo cuando coinciden con la subtitulación de YouTube; 19,019 h (12 272 clips) de habla real con code-switching procedente de YODAS v1 vía la mezcla R11c, reetiquetadas por R13x y filtradas por acuerdo con la etiqueta R11c (WER interior ≤ 0,3); 35,689 h de FOSD y Common Voice 13 vi con aumento de ruido (MUSAN y ESC-10, SNR 5-20 dB); y 13,657 h de FLEURS vi train replicadas tres veces para mitigar el olvido catastrófico. No se documenta una fase de RLHF ni de DPO; el ajuste es de destilación supervisada sobre pseudoetiquetas de un profesor de 1,7 B, con filtrado por consenso entre fuentes.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de destilación: se sustituye un modelo profesor de 1,7 B por un estudiante de 68,6 M manteniendo el mismo paquete y el mismo coste de inferencia, y se valida con bootstrap pareado sobre enunciados (10 000 remuestreos) e intervalos de confianza al 95 % en lugar de comparar medias puntuales. Las puertas de publicación automáticas (`eval/gate_publish.json`) exigen pasar FLEURS-100 ≤ 10,22, ser significativamente mejor que el modelo enviado en al menos dos conjuntos, no ser significativamente peor en ninguno, y mantenerse dentro del 5 % de tamaño y del 10 % de RTF.

## Capacidades

- Transcripción de voz a texto en vietnamita en modo offline, sin conexión de red ni servicios externos.
- Reconocimiento no streaming: procesa el enunciado completo, lo que permite usar contexto acústico bidireccional.
- Robustez a ruido aditivo entrenada explícitamente con MUSAN y ESC-10 a SNR de 5 a 20 dB.
- Manejo de code-switching vietnamita-inglés, reforzado con 19 h de clips reales de cambio de código.
- Ejecución en CPU con un RTF de 0,022 con 4 hilos (unas 45 veces más rápido que el tiempo real).
- Integración directa con sherpa-onnx en C++, Python, Android, iOS, C#, Go, Rust y WebAssembly.
- Punto de partida para fine-tune adicional mediante el checkpoint `icefall/pretrained.pt` (`--finetune-ckpt`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo puramente acústico.
- No se documenta puntuación automática, marcas de tiempo, diarización ni detección de idioma.

## Casos de uso

- **Transcripción on-device en aplicación móvil**: es el caso para el que se diseñó. El paquete de 79,3 MB se carga en memoria y el encoder int8 procesa audio en CPU con RTF 0,022, de modo que un minuto de audio se transcribe en torno a 1,3 segundos en un móvil de gama media, sin subir el audio a la nube.
- **Dictado por voz sin conexión**: útil en entornos sin cobertura o con requisitos de privacidad (ámbito sanitario, legal o industrial), donde el audio no puede salir del dispositivo. El modelo no streaming simplifica la integración porque no requiere gestión de estados parciales.
- **Transcripción de reuniones y notas de voz con code-switching**: el entrenamiento incluye 19 h de habla real con cambio de código vietnamita-inglés, frecuente en equipos técnicos. Se usa para generar actas de grabaciones ya cerradas, no para subtitulado en vivo.
- **Post-proceso de llamadas de atención al cliente**: al ser offline y barato, permite transcribir por lotes grandes volúmenes de grabaciones en servidores sin GPU y aplicar después análisis de calidad, búsqueda o clasificación sobre el texto resultante.
- **Subtitulado diferido de contenido audiovisual en vietnamita**: grabaciones de clases, pódcast o vídeo corporativo se transcriben en CPU y el texto se alinea a posteriori. El RTF permite procesar una hora de audio en unos dos minutos con 4 hilos.
- **Preprocesado de corpus para otros modelos**: el pipeline genera pseudoetiquetas filtradas por consenso (como se hizo con R13x y R11c) para ampliar datasets de ASR; el propio checkpoint permite arrancar un fine-tune con `--finetune-ckpt`.
- **Dispositivos embebidos y edge computing**: con 68,6 M de parámetros y cuantización int8, cabe en Raspberry Pi o en hardware con menos de 1 GB de RAM, lo que habilita interfaces por voz en quioscos, electrodomésticos o equipos industriales sin acelerador.
- **Transcripción de audio ruidoso de campo**: la aumentación de ruido a SNR 5-20 dB lo hace apto para grabaciones tomadas con micrófono de móvil en entornos con tráfico, oficina o aire acondicionado, siempre que se validen las capturas reales del dispositivo objetivo.

## Benchmarks y rendimiento

WER en porcentaje, menor es mejor. Intervalos de confianza al 95 % por bootstrap pareado sobre enunciados con 10 000 remuestreos; el asterisco indica que el intervalo excluye el 0 (diferencia significativa).

| Conjunto (n) | Modelo en producción | pilot1 | **Este modelo** | Este − producción | Este − pilot1 |
|---|---|---|---|---|---|
| FLEURS-100 vi (100), puerta ≤ 10,22 | 10,19 | 7,91 | **7,44** | −2,75 [−4,62, −1,39] * | −0,48 [−1,10, +0,07] n.s. |
| CV13-vi test200 (200) | 9,58 | 9,11 | **8,37** | −1,21 [−2,46, +0,00] n.s. | −0,74 [−1,81, +0,21] n.s. |
| YODAS2 held-out clean, ref = R13x ∩ caption (463) | 7,43 | 5,73 | **5,61** | −1,82 [−2,21, −1,46] * | −0,12 [−0,35, +0,12] n.s. |
| YODAS2 held-out clean, ref = caption (899) | 52,59 | 51,74 | **51,78** | −0,81 [−1,12, −0,51] * | +0,03 [−0,15, +0,22] n.s. |

Sobre los conjuntos held-out completos (1 125 y 1 660 filas, sin bootstrap), este modelo obtiene 4,41 y 37,24 frente a 4,59 y 37,33 de pilot1.

Puertas de publicación (`eval/gate_publish.json`): FLEURS-100 ≤ 10,22 = pasa; significativamente mejor que el modelo enviado en ≥ 2 conjuntos = pasa; no significativamente peor que el anterior en ningún conjunto = pasa; tamaño dentro del 5 % del enviado = pasa (79,3 MB frente a 77,4 MB, +2,5 % por recuantización del encoder int8); RTF dentro del 10 % del enviado = pasa (0,022 frente a 0,024 con 4 hilos).

Puerta de la ronda 2 (`eval/gate_r2.json`, condición "supera a pilot1 en algún conjunto"): **falla**. Las diferencias frente a pilot1 quedan dentro del ruido en todos los conjuntos medidos.

## Requisitos de hardware

- **VRAM/RAM**: el paquete pesa 79,3 MB; el consumo en ejecución se estima en 200-300 MB de RAM incluyendo buffers del grafo k2 y del decodificador (estimación a partir del tamaño de pesos, no publicada por el autor). No requiere GPU.
- **GPU**: no se documenta ninguna configuración con GPU. El modelo está pensado para CPU; ejecutarlo en GPU no aporta ventaja con este tamaño y este esquema de decodificación.
- **Consumer GPU**: irrelevante; cabe en cualquier CPU moderna, incluidos móviles de gama media, Raspberry Pi y sistemas embebidos.
- **Rendimiento en CPU**: RTF 0,022 con 4 hilos (aproximadamente 45× tiempo real); el modelo en producción marca 0,024.
- **Despliegue**: sherpa-onnx es la vía oficial y la única documentada, con bindings para C++, Python, Android, iOS, C#, Go, Rust y WASM. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje y no tiene decodificación autoregresiva de tokens de texto.
- **Latencia**: al ser offline, la latencia depende de la longitud del enunciado completo; no hay resultados de latencia por segmento publicados. La primera inferencia incluye la carga del grafo ONNX en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS-100 vi | WER CV13-vi test200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **cabin-asr-vi-zipformer-offline-r2** | 68,6 M | No aplica | 7,44 | 8,37 | Apache-2.0 | Público en HF (candidato) |
| sherpa-onnx-zipformer-vi-int8-2025-04-20 (base `zzasdf/viet_iter3_pseudo_label`) | del mismo orden (paquete 77,4 MB) | No aplica | 10,19 | 9,58 | Apache-2.0 | En producción en la app Cabin Offline |
| doanhlt/cabin-sherpa-vi-distill-pilot1 | del mismo orden | No aplica | 7,91 | 9,11 | Apache-2.0 | Público en HF |
| R13x (Qwen3-ASR-1.7B fine-tune, modelo profesor) | ~1,7 B | No disponible | No disponible | No disponible | Apache-2.0 | Usado como profesor; no se publican sus métricas en esta ficha |

No se han encontrado en la información disponible resultados de otros modelos públicos de ASR en vietnamita (Whisper, wav2vec2, NeMo) para establecer una comparación homogénea con las mismas particiones de evaluación.

## Limitaciones y advertencias

- **Estado de candidato, no de release**: el autor lo declara explícitamente. Faltan las dos puertas de release: medición sobre capturas reales de teléfono (conjunto privado, solo Mac) y la suite de tarjetas inventadas de la aplicación.
- **No supera a pilot1 de forma significativa**: todas las diferencias frente al candidato anterior tienen intervalos de confianza que incluyen el 0, y la puerta de la ronda 2 falla. La mejora real y significativa es frente al modelo en producción.
- **Rendimiento muy desigual según el dominio**: el WER sobre YODAS2 con referencia de subtítulo es del 51,78 %, más de seis veces el de FLEURS. Las referencias de subtítulos de YouTube son ruidosas, pero el dato indica que en habla espontánea y sin filtrado la calidad cae en picado.
- **Sesgo heredado del profesor**: las etiquetas de 46,7 h proceden de R13x filtradas por consenso con captions o con R11c; el estudiante reproduce los errores sistemáticos del profesor que sobrevivan al filtro.
- **Sesgo de dominio**: la mayor parte del material proviene de YouTube (YODAS/YODAS2) y de lectura (FLEURS, Common Voice), lo que puede degradar el rendimiento en acentos, dialectos o registros poco representados.
- **Monolingüe**: solo vietnamita; el code-switching está cubierto de forma empírica, no sistemática, y no hay métricas desagregadas por tramo de cambio de idioma.
- **Sin streaming**: no apto para subtitulado en vivo ni para asistentes conversacionales que necesiten resultados parciales.
- **Riesgo de alucinación**: como todo transducer, puede emitir texto plausible en tramos de silencio, música o ruido extremo; no se documenta umbral de confianza ni filtro de no-habla.
- **Licencia y atribución**: el modelo es Apache-2.0 y el uso comercial está permitido, pero los datos de YODAS/YODAS2 son CC BY 3.0 y FOSD CC BY 4.0, lo que exige mantener la atribución. El repositorio incluye los identificadores de vídeo de YouTube del audio de entrenamiento en `attribution/`.
- **Reproducibilidad limitada**: el código de entrenamiento está en un repositorio privado de GitHub (`thinkprompt/cabin-offline-asr`, rama `feat/mobile-local-kit`), por lo que no se puede replicar el pipeline sin acceso a él.
- **Adopción nula por ahora**: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r2
- Colección Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Modelo base (pilot1): https://huggingface.co/doanhlt/cabin-sherpa-vi-distill-pilot1
- Modelo base del paquete en producción: https://huggingface.co/zzasdf/viet_iter3_pseudo_label
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset YODAS: https://huggingface.co/datasets/espnet/yodas
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 13.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_13_0
- Referencias citadas en la model card sin URL en la información disponible: Li et al., YODAS, ASRU 2023; Conneau et al., FLEURS, 2022; Snyder et al., MUSAN, 2015; Piczak, ESC-10, 2015; FPT Open Speech Dataset (FOSD), Mendeley Data, CC BY 4.0.
- Repositorio de código: privado (`thinkprompt/cabin-offline-asr`), no enlazable públicamente.
