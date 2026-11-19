# qvac/TranscribePsy-250M-EU-sub-gguf

## Resumen

TranscribePsy-250M-EU-sub-gguf es la versión cuantizada a 8 bits (Q8_0) en formato GGUF del modelo de reconocimiento automático del habla TranscribePsy-250M-EU-sub, desarrollado por qvac (tether-ai-research). Se trata de un modelo ASR multilingüe de aproximadamente 283 millones de parámetros, diseñado específicamente para inferencia en dispositivo (on-device) y entornos de borde mediante el motor parakeet.cpp, integrado en la distribución qvac-fabric-speech.cpp que el equipo publica en GitHub.

El modelo base emplea la arquitectura CAFE (Confining Feature Distillation to Language-Routed Adapters), un diseño de adaptadores enrutados por idioma orientado a ASR multilingüe compacto, descrito en el artículo arXiv:2610.19134. Cubre ocho idiomas europeos (neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español) y está optimizado para transcripción por lotes con baja latencia y huella de memoria reducida.

Su relevancia radica en que ofrece un factor de tiempo real de 0,052 de media en seis teléfonos de gama alta, con una latencia de inferencia de 1.021 ms, un arranque en frío de 252 ms y un pico de memoria de 534 MiB para audio de 10 segundos. El modelo base figura en la Open ASR Leaderboard dentro de la frontera de Pareto entre tamaño y WER en la pista multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAFE (adaptadores enrutados por idioma sobre backbone ASR compacto; detalles completos en la model card del modelo base) |
| Parametros totales | 283.492.118 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en ventanas; por defecto 60 s con 25 % de solapamiento en el motor CLI, configurable a 30 s) |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | nl, en, fr, de, it, pl, pt, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `transcribepsy-250m-eu-sub.gguf`, 305 MB) |

## Arquitectura y entrenamiento

El modelo base TranscribePsy-250M-EU-sub se construye sobre el diseño CAFE, que confina la destilación de características a adaptadores enrutados por idioma. Este esquema permite que un backbone compacto comparta representaciones generales mientras adaptadores específicos por idioma capturan las particularidades fonéticas y léxicas de cada una de las ocho lenguas cubiertas. El artículo CAFE (arXiv:2610.19134) documenta el diseño completo, aunque la información disponible no detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

La versión GGUF es una conversión directa a Q8_0 del modelo base, pensada para ejecutarse mediante parakeet.cpp dentro de qvac-fabric-speech.cpp. El equipo publica parches que acotan la memoria del front-end mel y añaden un decodificador Core ML para el Neural Engine de Apple, con intención de enviarlos upstream. No se dispone de información sobre el proceso de alineación (RLHF/DPO) ni sobre innovaciones de decodificación especulativa en la documentación proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en ocho idiomas europeos: neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español.
- Transcripción por lotes de audio de 16 kHz mono en formato WAV (el motor no remuestrea; se requiere conversión previa con ffmpeg).
- Procesamiento de grabaciones largas mediante ventanas solapadas (60 s con 25 % de solapamiento por defecto; 30 s configurable para dispositivos con poca memoria).
- Inferencia en dispositivo con bajo consumo de memoria (534 MiB de pico a 10 s de audio).
- Ejecución en CPU y, mediante la build Core ML, en el Neural Engine de Apple.
- No soporta streaming: es exclusivamente transcripción por lotes.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones en el dispositivo: el modelo procesa audio de 16 kHz en ventanas de 60 s con solapamiento del 25 %, manteniendo el pico de memoria por debajo de 2 GB en grabaciones de 10 a 30 minutos, lo que permite transcribir reuniones completas sin enviar datos a la nube.
- Subtitulado de vídeo en ocho idiomas europeos: con un factor de tiempo real de 0,052, un vídeo de una hora se transcribe en aproximadamente tres minutos en un teléfono de gama alta, lo que lo hace viable para generación de subtítulos en movilidad.
- Asistentes de voz offline para aplicaciones móviles: la latencia de 633 ms en un Galaxy S26 Ultra y el arranque en frío de 213 ms permiten integraciones conversacionales con respuesta casi inmediata sin conexión.
- Notas de voz dictadas en aplicaciones de productividad: el modelo cabe en 305 MB de almacenamiento y 530 MiB de RAM en uso, por lo que puede empaquetarse dentro de apps iOS y Android sin dependencias de servidor.
- Cumplimiento y privacidad en sectores regulados: al ejecutarse íntegramente en el dispositivo, el audio no abandona el terminal, lo que facilita el cumplimiento de normativas de protección de datos en entornos sanitarios, legales o financieros.
- Transcripción de centros de llamadas en el borde: el soporte de ocho idiomas europeos y el bajo coste computacional permiten desplegar transcripción en equipos de sobremesa o gateways locales para analítica de conversaciones sin infraestructura GPU.
- Accesibilidad en tiempo real diferido: generación de transcripciones para personas con discapacidad auditiva en dispositivos de gama media (Pixel 9: 1.570 ms de latencia, 356 ms de arranque), con procesamiento por ventanas para contenido largo.

## Benchmarks y rendimiento

El modelo base figura en la Open ASR Leaderboard (versión 26-10-2026) en la frontera de Pareto entre tamaño y WER en la pista multilingüe, con WER promediado sobre seis idiomas (alemán, francés, italiano, español, portugués y neerlandés). La información proporcionada no incluye los valores numéricos de WER ni resultados de benchmarks como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

Rendimiento en dispositivo medido por el autor (media de las tres mejores de cinco ejecuciones, 160 enunciados de Multilingual LibriSpeech, 20 por idioma, 40 minutos de audio):

| Dispositivo | SoC | Latencia (ms) | Arranque en frío (ms) | Memoria pico @ 10 s (MiB) |
|---|---|---|---|---|
| Galaxy S26 Ultra | 8 Elite Gen5 | 633 | 213 | 530 |
| Galaxy S25 Ultra | 8 Elite | 771 | 241 | 533 |
| iPhone 17 Pro Max | A19 Pro | 1.059 | 153 | 542 |
| iPhone 15 | A16 | 854 | 221 | 537 |
| Pixel 10 | Tensor G5 | 1.240 | 327 | 530 |
| Pixel 9 | Tensor G4 | 1.570 | 356 | 530 |

Media agregada: factor de tiempo real de 0,052, latencia de 1.021 ms, arranque en frío de 252 ms y pico de memoria de 534 MiB a 10 s.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 530-542 MiB de pico en inferencia con 10 s de audio; el fichero GGUF ocupa 305 MB en disco.
- GPU recomendadas: no requiere GPU; el motor parakeet.cpp está optimizado para CPU. En Apple silicon, la build Core ML aprovecha el Neural Engine.
- Cabe en cualquier smartphone moderno: validado en Galaxy S26/S25 Ultra, iPhone 17 Pro Max, iPhone 15, Pixel 10 y Pixel 9.
- Opciones de despliegue: motor parakeet.cpp dentro de qvac-fabric-speech.cpp (build oficial en GitHub), build Core ML para Apple Neural Engine. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real de 0,052 de media; latencia entre 633 ms y 1.570 ms según dispositivo; arranque en frío entre 153 y 356 ms.
- Para grabaciones largas, el motor CLI usa ventanas de 60 s con 25 % de solapamiento, manteniendo el pico de memoria por debajo de 2 GB en audios de 10 a 30 minutos.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Parámetros | Licencia | Caso de uso |
|---|---|---|---|---|---|
| TranscribePsy-250M-EU-sub-gguf | 8 | GGUF Q8_0 | 283 M | Apache 2.0 | Despliegue on-device vía parakeet.cpp |
| TranscribePsy-250M-EU-sub | 8 | PyTorch | 283 M | Apache 2.0 | Máxima precisión en los ocho idiomas MLS |
| TranscribePsy-250M-EU | 25 | PyTorch | no disponible | Apache 2.0 | Cobertura amplia de lenguas europeas |
| TranscribePsy-250M-EU-sub-coreml | 8 | Core ML | 283 M | Apache 2.0 | Neural Engine de Apple |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre ocho idiomas: neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español. Para otras lenguas europeas debe usarse TranscribePsy-250M-EU (25 idiomas).
- No soporta streaming; es exclusivamente transcripción por lotes, lo que lo inhabilita para aplicaciones de dictado en tiempo real.
- El motor no remuestrea: la entrada debe ser WAV mono a 16 kHz, lo que exige un paso previo de conversión.
- La codificación de grabaciones largas en una sola pasada consume memoria que crece con la duración; es obligatorio usar ventanas para audios superiores a un minuto.
- No está destinado a decisiones automatizadas críticas o de alto riesgo.
- Riesgo de alucinación y errores de transcripción inherentes a todo modelo ASR, especialmente en audio ruidoso o con acentos no representados en el entrenamiento; la información no detalla sesgos específicos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los parches de qvac-fabric-speech.cpp publicados en GitHub, que pueden tener su propia licencia.
- La información sobre el proceso de entrenamiento (tokens, composición del dataset, alineación) no está disponible en la documentación proporcionada; para detalles debe consultarse el artículo CAFE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Modelo base: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Modelo con cobertura de 25 idiomas: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Build Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Repositorio del motor: https://github.com/tether-ai-research/qvac-transcribePsy
- Motor parakeet.cpp: https://github.com/tetherto/qvac-fabric-speech.cpp/tree/master/engines/parakeet
- Artículo CAFE: https://arxiv.org/abs/2610.19134
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
