# javierbits/Rumble-2-Flash-GGUF

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automático del habla (ASR) de aproximadamente 0,5 B de parámetros (322.255.360 parámetros reales) desarrollado por Reson8 y distribuido en formato GGUF por javierbits para su uso con llama.cpp. Su arquitectura combina un codificador de audio con un decodificador de lenguaje de tipo transformer, empaquetados como dos ficheros GGUF separados (decodificador y `mmproj`), ambos necesarios para la inferencia. El modelo cubre 45 idiomas y está pensado explícitamente para ejecución en dispositivo (`on-device`), incluyendo telefonos.

La relevancia actual de esta ficha reside en que es una cuantización comunitaria verificada: el autor publica checksums SHA-256, un script reproducible (`build_gguf.sh`) y una evaluación pareada sobre 700 emisiones de FLEURS en 7 idiomas comparando Q5_K_M y Q8_0 contra el checkpoint BF16 original. Los resultados muestran una degradación de +0,45 pp (Q5_K_M) y +0,34 pp (Q8_0) en error agrupado, concentrada casi por completo en cantonés, idioma en el que el modelo base ya es debil (42,33 % CER).

La licencia Apache-2.0 se hereda del modelo base `Reson8/Rumble-2-Flash`, lo que permite uso comercial. El repositorio ocupa 0,8 GB e incluye tanto los pesos cuantizados como el parche de conversión y la plantilla de chat para `llama-server`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio + decodificador transformer (familia qwen3-asr), empaquetado multimodal en llama.cpp (decodificador + `mmproj`) |
| Parametros totales | 322.255.360 (0,32 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Configurable en llama.cpp; valores documentados: `-c 1024` (~60 s de audio), `-c 4096`, `-c 8192` (necesario para clips de 285 s). El audio consume ~13 tokens/s |
| Tipos de cuantizacion | Q5_K_M y Q8_0 publicados; F16 reproducible con `build_gguf.sh` (no distribuido) |
| Idiomas soportados | 45: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / ggml); el repositorio base ofrece safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema ASR multimodal compuesto por un codificador de audio y un decodificador de lenguaje, del linaje `qwen3-asr` segun las etiquetas del repositorio. En la distribución GGUF se separa en dos artefactos: el decodificador cuantizado (`Rumble-2-Flash-Q5_K_M.gguf`, 242.414.400 bytes, o `Rumble-2-Flash-Q8_0.gguf`, 346.355.648 bytes) y el proyector multimodal (`mmproj-Rumble-2-Flash-Q8_0.gguf`, 207.942.080 bytes). Ambos son obligatorios para la inferencia. El repositorio original incluye además una cabeza CTC auxiliar (`ctc/`, 357 MB en F32) que no se ha convertido porque llama.cpp no tiene runtime para ella.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos no aparecen en la información proporcionada. La innovación técnica destacable de esta distribución es de ingeniería de conversión: el autor aplicó un parche al conversor de llama.cpp (`llama-cpp-rumble.patch`, sobre el commit `9a080f4`) y una plantilla de chat Jinja (`chat_template.llamacpp.jinja`) para que `llama-server` exponga el endpoint `/v1/audio/transcriptions`. La decodificación recomendada y evaluada es greedy (`--temp 0`), con idioma forzado.

## Capacidades

- Transcripción de voz a texto en 45 idiomas, con detección automática de idioma si se omite el parámetro `language` (la respuesta entonces empieza por `language <Name><asr_text>`).
- Selección explícita de idioma mediante códigos ISO o nombres en inglés (`-F language=de`).
- Procesamiento de audio largo mediante ventana de contexto ampliada: ~13 tokens por segundo de audio, de modo que `-c 8192` cubre clips de hasta ~285 s.
- Ejecución en dispositivo (`on-device`), incluida plataforma Android mediante build LiteRT.
- Integración con `llama-server` vía API compatible con OpenAI (`/v1/audio/transcriptions`) y con `llama-mtmd-cli`.
- Soporte de plantilla de chat embebida para llama.cpp (`--jinja`).
- No se documentan capacidades de tool calling, agentes, visión general, audio generation ni modo de razonamiento extendido; el pipeline declarado es exclusivamente `automatic-speech-recognition`.

## Casos de uso

- Transcripción local en movil o dispositivo embebido: con Q5_K_M (242 MB) y `-c 1024`, clips de hasta ~60 s caben en el contexto y el modelo se ejecuta sin GPU dedicada; el build LiteRT para Android reporta 1,5 s para un clip de 5,8 s.
- Subtitulado y actas de reuniones en servidor: `llama-server` con `-c 8192` procesa clips de hasta ~285 s en una sola pasada (3.726 tokens de prompt y 812 generados en la medición del autor), adecuado para transcripción por lotes de grabaciones.
- Atención al cliente y centros de contacto multilingües: los 45 idiomas y la detección automática permiten enrutar y transcribir llamadas en español, portugués, alemán, francés o árabe sin cambiar de modelo, con una ventana de contexto suficiente para turnos largos.
- Generación de subtítulos para contenido audiovisual: la transcripción con marcas de idioma y el endpoint compatible con OpenAI facilitan integrarlo en pipelines existentes de postproducción.
- Cumplimiento y archivado de conversaciones: al ser Apache-2.0 y ejecutable en local, permite transcribir audio sensible sin enviarlo a servicios externos, con una huella de memoria de ~1,3 GiB de RSS en CPU con `-c 4096`.
- Investigación en ASR de bajo recurso: el repositorio incluye método de evaluación, transcripciones por clip e intervalos de confianza, lo que permite reproducir la comparación BF16 frente a cuantizado y extenderla a otros idiomas.
- Prototipado rapido en portatil: con Q8_0 (346 MB) y `llama-mtmd-cli` se puede validar la calidad antes de decidir el despliegue, a costa de ~3,4 veces menos compresión que Q5_K_M.

## Benchmarks y rendimiento

Evaluación del autor sobre FLEURS `test`, 100 emisiones por idioma (muestra determinista, semilla 1234), decodificación greedy, idioma forzado, normalizadores de texto de Whisper (CER para mandarín y cantonés), bootstrap pareado con 2000 remuestreos, medida en una NVIDIA GB10 contra el checkpoint BF16 en Transformers 5.23.

| Idioma | n | BF16 err % | Q5_K_M err % | delta pp [IC 95 %] | Q8_0 err % | delta pp [IC 95 %] |
|---|---|---|---|---|---|---|
| Inglés | 100 | 7,29 | 7,97 | +0,68 [−0,14, +1,70] | 7,88 | +0,59 [−0,08, +1,46] |
| Español | 100 | 4,28 | 4,23 | −0,06 [−0,46, +0,31] | 4,23 | −0,05 [−0,28, +0,15] |
| Portugués | 100 | 7,00 | 7,34 | +0,35 [−0,22, +1,07] | 7,07 | +0,07 [−0,32, +0,69] |
| Alemán | 100 | 7,22 | 7,03 | −0,19 [−0,74, +0,33] | 7,29 | +0,06 [−0,26, +0,42] |
| Francés | 100 | 7,16 | 7,70 | +0,55 [−0,24, +1,42] | 6,95 | −0,20 [−0,62, +0,23] |
| Chino (CER) | 100 | 6,26 | 6,27 | +0,01 [−0,41, +0,46] | 6,45 | +0,19 [−0,14, +0,62] |
| Cantonés (CER) | 100 | 42,33 | 44,18 | +1,85 [−1,63, +7,16] | 44,02 | +1,69 [−0,30, +4,23] |
| **Agrupado** | 700 | 11,65 | 12,10 | +0,45 [−0,09, +1,22] | 11,98 | +0,34 [+0,00, +0,73] |

Excluyendo cantonés, el error agrupado es 6,76 % (Q5_K_M) y 6,64 % (Q8_0) frente a 6,53 % en BF16, con deltas de +0,22 pp [−0,03, +0,52] y +0,11 pp [−0,07, +0,33], ambos dentro del ruido. El autor advierte que las cifras absolutas no son comparables con la ejecución del modelo base en Open ASR Leaderboard (splits y normalización distintos). En cuanto a estabilidad de salida, 302 de 700 transcripciones difieren byte a byte en Q5_K_M (169 de 700 en Q8_0), sobre todo en puntuación y elección de palabra.

## Requisitos de hardware

- VRAM estimada para inferencia: el decodificador Q5_K_M ocupa 242 MB y el `mmproj` Q8_0 208 MB, unos 450 MB de pesos en total; Q8_0 sube a 346 MB + 208 MB (~554 MB). El RSS medido en CPU con `-c 4096` es de 1,3 GiB, por lo que el consumo real incluye el contexto y el audio.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. La medición de referencia se hizo en una NVIDIA GB10; cualquier GPU con soporte llama.cpp y al menos ~2 GB de memoria libre es suficiente en la práctica.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño de los pesos (por debajo de 1 GB). También funciona en CPU; la referencia del autor es de 1,1 s por clip de 9–13 s en un servidor ARM de 20 hilos en reposo (RTFx 10).
- Opciones de despliegue: `llama-server` (endpoint compatible con OpenAI `/v1/audio/transcriptions`), `llama-mtmd-cli`, y build LiteRT para Android. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: RTFx 10 en CPU de referencia; el build LiteRT Android reporta 1,5 s para un clip de 5,8 s. El autor advierte que las cifras de un solo flujo varían 3–4 veces con carga de fondo y que los telefonos son más lentos que el servidor ARM.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a los atributos conocidos de esta distribución.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rumble-2-Flash (esta ficha, GGUF Q5_K_M/Q8_0) | 322 M | configurable en llama.cpp (~13 tokens/s de audio) | Apache-2.0 | GGUF | 45 idiomas, on-device, evaluación pareada publicada |
| Reson8/Rumble-2-Flash (base) | 322 M | no disponible | Apache-2.0 | safetensors | Incluye cabeza CTC; referencia BF16 de la comparación |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

## Limitaciones y advertencias

- Cantonés es un punto debil estructural del modelo base: 42,33 % CER en BF16, que sube a 44,18 % en Q5_K_M y 44,02 % en Q8_0. No debe asumirse calidad util en `yue` sin validación propia.
- La cuantización altera la salida incluso cuando el error no cambia de forma significativa: 302 de 700 transcripciones difieren byte a byte en Q5_K_M, principalmente en puntuación y elección de palabra. Si se necesita salida idéntica al BF16, hay que usar F16 (reproducible con `build_gguf.sh`, no distribuido).
- El endpoint de `llama-server` no segmenta audio: la ventana `-c` debe cubrir audio más transcripción (~13 tokens/s de audio). Con `-c 4096` la salida se trunca en clips largos; `-c 1024` solo cubre ~60 s.
- Sin `--jinja` se ignora la plantilla embebida y la transcripción no funciona como se espera.
- La cabeza CTC (`ctc/`) no está incluida ni es utilizable en llama.cpp; quien dependa de ella debe usar el repositorio base con otro runtime.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento en dominios acústicamente adversos (ruido, acentos no representados); no hay información disponible al respecto.
- Las cifras absolutas de error no son comparables con las del model card del modelo base (splits y normalización distintos); solo son válidas las comparaciones dentro de la tabla publicada.
- La fecha de creación del repositorio (2026-11-20) y el reducido número de descargas (293) y likes (1) indican una distribución reciente y poco contrastada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/javierbits/Rumble-2-Flash-GGUF
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Perfil del autor en Hugging Face: https://huggingface.co/javierbits
- GitHub del autor: https://github.com/javierbits
- Web del autor: https://javierbits.com
- X del autor: https://x.com/javierbits
