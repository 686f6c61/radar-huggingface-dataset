# handy-computer/parakeet-primeline-gguf

## Resumen

parakeet-primeline-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) primeline/parakeet-primeline, un fine-tune en alemán del parakeet-tdt-0.6b-v3 de NVIDIA realizado por primeLine. La conversión la mantiene el proyecto handy-computer para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local sin dependencias de Python ni de NeMo. El modelo resuelve la transcripción de audio a texto con puntuación, capitalización y marcas de tiempo a nivel de token, y su interés práctico radica en que ofrece una alternativa ligera (485 MB en Q4_K_M) ejecutable en CPU y GPU de consumo con pérdida de calidad prácticamente nula frente al checkpoint original.

Arquitectónicamente es un encoder FastConformer con decoder transducer TDT/RNNT, con 627 millones de parámetros totales. Aunque está ajustado específicamente para alemán, conserva la capacidad multilingüe del modelo base de NVIDIA y transcribe los otros 24 idiomas de la familia v3 con capitalización y puntuación correctas por idioma. No es un modelo de streaming ni traduce: solo transcribe.

La relevancia actual del repositorio está en la madurez del ecosistema GGUF aplicado a ASR: el autor valida numéricamente cada cuantización contra la referencia NeMo sobre el mismo manifiesto de evaluación, documenta el sesgo ortográfico heredado del tokenizador y publica métricas de rendimiento en tiempo real (RTF) sobre hardware concreto, algo poco habitual en conversiones de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT (decoder transducer) |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio; no se documenta ventana en tokens) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Entrada de audio | WAV mono a 16 kHz |
| Salida | Transcripción con puntuación, capitalización y timestamps a nivel de token (opcionales) |
| Streaming | no |
| Traducción | no |
| Detección de idioma | sí |
| Tamaño del repo | 6,1 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de primeLine sobre NVIDIA parakeet-tdt-0.6b-v3, fijado en el commit 3f1a9bc del repositorio upstream (16 de agosto de 2026). La arquitectura combina un encoder FastConformer, variante de Conformer con downsampling agresivo pensada para reducir el coste computacional en audio largo, con un decoder transducer de tipo TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones y acelera la decodificación frente a un RNNT clásico. La decodificación es greedy, sin modelo de lenguaje externo.

No se documentan en la información disponible el volumen de tokens de audio, la composición exacta del dataset de entrenamiento ni si hubo etapas de RLHF o ajuste por preferencias (no aplicables habitualmente en ASR). El autor sí detalla un aspecto relevante del tokenizador: el vocabulario SentencePiece de la familia v3 contiene solo 4 piezas con `ß` frente a 58 con `ss`, lo que provoca que el modelo escriba formas suizas (`grosse`, `heisst`) en lugar de `ß` en casi todas las hipótesis. Es una propiedad heredada del modelo base, no del port, y la referencia NeMo produce las mismas grafías sobre los mismos enunciados.

La conversión a GGUF se valida numéricamente contra la referencia NeMo en transcribe.cpp commit 856d7c1 (16 de agosto de 2026), con un diferencial de WER de solo 0,04 puntos porcentuales entre la cuantización más agresiva y F32, sin degradación monótona.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con capitalización y puntuación correctas por idioma incluso en los idiomas no alemanes.
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de token (`timestamps: token`), útiles para subtitulado y alineación.
- Salida con puntuación y casing, sin necesidad de postprocesado.
- Ejecución en CPU y GPU mediante transcribe.cpp, con backend Metal en Apple Silicon y Vulkan en GPUs de PC.
- No soporta streaming ni traducción automática.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico (no aplica a un modelo ASR).

## Casos de uso

- Subtitulado automático de vídeo en alemán: el modelo genera timestamps a nivel de token y texto puntuado, lo que permite construir ficheros SRT o VTT directamente a partir del WAV extraído con ffmpeg, sin postprocesado de capitalización.
- Transcripción de reuniones y notas de voz en local: con Q4_K_M (485 MB) puede ejecutarse en un portátil sin GPU dedicada, lo que facilita despliegues de privacidad estricta donde el audio no puede salir del dispositivo.
- Indexación y búsqueda de archivos de audio: la transcripción con detección de idioma permite etiquetar automáticamente un archivo multimedia multilingüe y alimentar un motor de búsqueda de texto completo.
- Atención al cliente y análisis de llamadas: el modelo transcribe grabaciones en alemán, inglés, francés, italiano, español y demás idiomas soportados, lo que permite aplicar análisis de sentimiento o extracción de entidades sobre la transcripción resultante.
- Investigación en lingüística computacional: la disponibilidad de F32 y de cuantizaciones con WER casi idéntico permite reproducir experimentos con bajo coste computacional y comparar contra la referencia NeMo sobre el mismo manifiesto.
- Despliegue en dispositivos de borde: el binario de transcribe.cpp y un GGUF de menos de 1 GB permiten integrar ASR en aplicaciones de escritorio o sistemas embebidos con CPU moderna, sin dependencias de Python.
- Generación de actas y documentación clínica o legal en alemán: la calidad reportada en FLEURS de (5,98 % WER en Q8_0) y el soporte de puntuación lo hacen viable para borradores que después revisa un humano.

## Benchmarks y rendimiento

WER sobre FLEURS por idioma con cuantización Q8_0 (salvo donde se indica), decodificación greedy sin LM externo:

| Idioma | WER Q8_0 (%) |
|---|---:|
| Italiano | 3,17 |
| Español | 3,85 |
| Inglés | 4,82 |
| Portugués | 5,17 |
| Alemán | 5,98 |
| Francés | 6,35 |
| Ruso | 7,81 |
| Polaco | 8,19 |
| Neerlandés | 8,49 |
| Ucraniano | 8,11 |
| Eslovaco | 12,36 |
| Finlandés | 13,39 |
| Croata | 13,68 |
| Rumano | 13,80 |
| Checo | 15,05 |
| Búlgaro | 16,33 |
| Sueco | 16,42 |
| Estonio | 17,17 |
| Húngaro | 17,52 |
| Danés | 20,52 |
| Lituano | 23,08 |
| Maltés | 24,74 |
| Letón | 28,83 |
| Griego | 34,76 |
| Esloveno | 51,07 |

Impacto de la cuantización en alemán (FLEURS de completo, 862 enunciados) y en LibriSpeech test-clean:

| Cuantización | WER FLEURS de (%) | WER LibriSpeech test-clean (%) | Tamaño |
|---|---:|---:|---:|
| F32 | 6,00 | 2,20 | 2,51 GB |
| F16 | 6,00 | 2,19 | 1,26 GB |
| Q8_0 | 5,98 | 2,20 | 740 MB |
| Q6_K | 5,96 | 2,19 | 610 MB |
| Q5_K_M | 5,99 | 2,20 | 549 MB |
| Q4_K_M | 5,98 | 2,26 | 485 MB |

Rendimiento en tiempo real (RTF, mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 36,73 |
| Apple M4 Max | Metal | 199,38 |
| AMD Ryzen 7 4750U | CPU | 13,63 |
| AMD Ryzen 7 4750U | Vulkan | 24,97 |

Nota del autor: las cifras publicadas por primeLine (2,95 % de media sobre Tuda-De, Multilingual LibriSpeech y Common Voice 19.0) usan corpus distintos y no son comparables. Como referencia equiparable, el checkpoint NeMo original sobre el mismo manifiesto da 5,98 % WER. La diferencia de ortografía `ß`/`ss` cuesta aproximadamente 1,05 pp: plegando `ß`→`ss` en ambos lados, la referencia baja a 4,92 % y F32 a 4,94 %.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2,51 GB en F32, 1,26 GB en F16, 740 MB en Q8_0, 485 MB en Q4_K_M.
- Cabe en cualquier GPU de consumo moderna (RTX 3060 en adelante) y en iGPU con Vulkan; también en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta cifras sobre Apple M4 Max (Metal) y AMD Ryzen 7 4750U (Vulkan y CPU).
- Despliegue: exclusivamente mediante transcribe.cpp (compilación con CMake). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo ASR con arquitectura transducer y no de un LLM.
- Throughput: RTF de 199,38 en Metal sobre M4 Max, 36,73 en CPU sobre M4 Max, 24,97 con Vulkan en Ryzen 7 4750U y 13,63 en CPU sobre el mismo Ryzen. Un RTF de 13 implica procesar audio unas 13 veces más rápido que en tiempo real.
- Entrada obligatoria: WAV mono a 16 kHz; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| parakeet-primeline-gguf (este) | 627 M | 25 | GGUF | CC-BY-4.0 | Fine-tune alemán de parakeet-tdt-0.6b-v3; WER de 5,98 % en FLEURS de |
| primeline/parakeet-primeline (NeMo) | 627 M | 25 | NeMo | CC-BY-4.0 | Checkpoint original; misma calidad (5,98 % WER en el mismo manifiesto), requiere stack Python/NeMo |
| NVIDIA parakeet-tdt-0.6b-v3 | no disponible | 25 | NeMo | no disponible en la información proporcionada | Modelo base del fine-tune; sin métricas propias en esta ficha |
| Whisper large-v3 | no disponible | multilingüe | safetensors, GGUF (vía terceros) | no disponible en la información proporcionada | Alternativa ASR ampliamente usada; no se aportan datos comparativos en la información disponible |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada más allá de la referencia NeMo del mismo modelo.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo (o segmentos) como entrada, lo que lo descarta para transcripción en vivo de baja latencia.
- No traduce: solo transcribe en el idioma original.
- Sesgo ortográfico heredado: escribe formas suizas con `ss` en lugar de `ß` en alemán, lo que penaliza aproximadamente 1,05 pp de WER frente a referencias que usan `ß`.
- Calidad muy desigual entre idiomas: el WER va del 3,17 % en italiano al 51,07 % en esloveno; griego (34,76 %), letón (28,83 %) y maltés (24,74 %) también presentan tasas altas y no son adecuados para producción sin revisión.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos o solapamiento de hablantes: no se documentan evaluaciones en condiciones adversas.
- Entrada restringida a WAV mono a 16 kHz; no acepta directamente MP3, estéreo ni otras frecuencias sin conversión previa.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar el aviso de licencia y el fichero NOTICE del repositorio.
- Dependencia de transcribe.cpp: no hay soporte documentado en otros runtimes, lo que limita la portabilidad y obliga a compilar desde fuente.
- El repositorio tiene solo 3 likes y fue creado en agosto de 2026; la validación numérica está fijada a commits concretos, por lo que cambios posteriores en transcribe.cpp pueden alterar el comportamiento.
- No se documentan sesgos demográficos ni evaluaciones de equidad; en un modelo ASR esto puede afectar a la precisión según acento, edad o género del hablante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/handy-computer/parakeet-primeline-gguf
- Modelo base: https://huggingface.co/primeline/parakeet-primeline
- Commit upstream fijado: https://huggingface.co/primeline/parakeet-primeline/commit/3f1a9bc
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- transcribe.cpp, commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/856d7c1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-primeline.md
- Licencia en el repositorio: https://huggingface.co/handy-computer/parakeet-primeline-gguf/blob/main/LICENSE
- NOTICE del repositorio: https://huggingface.co/handy-computer/parakeet-primeline-gguf/blob/main/NOTICE
- Descarga F32: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-Q4_K_M.gguf
