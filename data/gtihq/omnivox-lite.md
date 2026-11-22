# gtihq/omnivox-lite

## Resumen

Omnivox Lite es un paquete de inferencia de reconocimiento automatico del habla (ASR) publicado por el usuario gtihq en Hugging Face bajo el identificador `gtihq/omnivox-lite`. No se trata de un modelo entrenado desde cero, sino de una redistribucion de los pesos estandar de Whisper `base` de OpenAI en formato `ggml` (el que consume `whisper.cpp`), empaquetados junto con los diccionarios de correccion locales que utiliza un teclado Android de estilo Gboard para dictado sin conexion. El objetivo declarado es reproducir en una sola descarga toda la cadena de dictado offline: audio PCM a 16 kHz, motor `whisper.cpp` via JNI y correccion lexica local.

La relevancia del paquete es practica mas que cientifica: demuestra un patron de despliegue de ASR completamente en el dispositivo, sin llamadas de red ni dependencia de servicios de voz de terceros, algo critico en escenarios de privacidad, conectividad intermitente o cumplimiento normativo. El modelo subyacente es multilingue, aunque el autor solo valida portugues y ingles, que son los idiomas ejercitados por el teclado.

Conviene subrayar que no hay entrenamiento ni ajuste fino: la adaptacion se realiza en tiempo de ejecucion mediante un corrector de diccionario que sustituye palabras de baja confianza por candidatos de alta frecuencia usando distancia de edicion insensible a acentos. El repositorio ocupa aproximadamente 0,1 GB, coherente con los ~141 MB de los pesos `base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Whisper (modelo `base` de OpenAI) |
| Parametros totales | no disponible (Whisper base, aproximadamente 74 M segun la familia Whisper; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; el autor no lo detalla) |
| Tipos de cuantizacion | pesos en formato `ggml` (`ggml-base.bin`, ~141 MB); no se listan variantes cuantizadas adicionales |
| Idiomas soportados | multilingue; portugues e ingles ejercitados por el teclado |
| Licencia | MIT |
| Formato de pesos | `ggml` (`.bin`), consumible por `whisper.cpp` |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint `base` de OpenAI Whisper, un transformer encoder-decoder con atencion completa disenado para transcripcion de audio, ejecutado mediante el runtime en C/C++ de `whisper.cpp`. El autor declara explicitamente que emplea el checkpoint `base` sin modificaciones: no hay entrenamiento adicional, ni ajuste fino, ni RLHF/DPO, ni datos de entrenamiento propios documentados en la model card.

La innovacion del paquete no esta en los pesos sino en el pipeline de postproceso: un corrector de diccionario (`DictionaryCorrector.java`) que, en tiempo de ejecucion, reemplaza palabras ASR de baja confianza por candidatos de alta frecuencia de los diccionarios incluidos (`common-words.txt`, `pt-br-dictionary.txt` con ~3k palabras y `pt-br-lm.txt`, un modelo de lenguaje unigram/bigram local para el decodificador de deslizamiento). La correccion usa distancia de edicion insensible a acentos. El flujo completo es AudioRecord -> PCM 16 kHz -> `libwhisper.so` (JNI) -> transcripcion -> correccion con diccionario local.

## Capacidades

- Transcripcion de voz a texto (ASR) en modo completamente offline, sin llamadas de red.
- Ejecucion en el dispositivo mediante `whisper.cpp` y JNI, orientada a Android.
- Soporte multilingue heredado de Whisper `base`, con portugues e ingles como idiomas validados por el autor.
- Postproceso lexico local con diccionarios de frecuencia y modelo unigram/bigram para portugues de Brasil.
- Correccion de palabras de baja confianza mediante distancia de edicion insensible a acentos.
- Entrada de audio a 16 kHz en formato PCM.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento explicito.

## Casos de uso

- Dictado offline en teclados Android: el paquete esta disenado exactamente para este escenario; el modelo se copia en los assets de la app y se carga via `VoiceEngine.java`, permitiendo dictado sin conexion ni servicios de terceros.
- Aplicaciones de privacidad estricta: al no realizar llamadas de red, el audio nunca sale del dispositivo, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Despliegue en dispositivos con conectividad intermitente o nula: util en campo, zonas rurales, transporte o entornos aislados donde un servicio en la nube no es viable.
- Transcripcion de notas de voz en portugues de Brasil: los diccionarios `pt-br-dictionary.txt` y `pt-br-lm.txt` estan pensados para mejorar la precision en ese idioma concreto.
- Prototipado rapido de ASR embebido: al distribuir pesos `ggml` y utilidades de correccion en un unico paquete de ~0,1 GB, sirve como base reproducible para experimentar con `whisper.cpp` en movil.
- Correccion lexica post-ASR en otros pipelines: los diccionarios y el enfoque de distancia de edicion insensible a acentos pueden reutilizarse como capa de postproceso sobre otras salidas ASR.
- Aplicaciones de accesibilidad: dictado por voz en dispositivos de gama baja sin dependencia de servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (ejecucion en CPU de telefono); los pesos `ggml` ocupan ~141 MB en almacenamiento y una huella de memoria del orden de cientos de MB durante la inferencia, aunque el autor no publica cifras exactas.
- GPU recomendadas: no disponibles; el paquete esta orientado a CPU movil via `whisper.cpp`.
- Compatibilidad con GPU de consumo: no documentada; el diseno apunta a ejecucion en dispositivo Android, no a estaciones de trabajo.
- Opciones de despliegue: `whisper.cpp` (runtime principal) con integracion JNI en Android; no se mencionan vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Omnivox Lite (`gtihq/omnivox-lite`) | ~74 M (Whisper base, no declarado por el autor) | ventana de audio de 30 s (Whisper) | multilingue; pt, en validados | MIT | `ggml` / `whisper.cpp` | Pesos base + diccionarios de correccion |
| Whisper base original (OpenAI) | ~74 M | ventana de audio de 30 s | multilingue | MIT | PyTorch, `ggml` via whisper.cpp | Sin capa de correccion lexica |
| Whisper small (OpenAI) | ~244 M | ventana de audio de 30 s | multilingue | MIT | PyTorch, `ggml` via whisper.cpp | Mayor precision a costa de mas compute |
| whisper.cpp `ggml-base` (ggerganov) | ~74 M | ventana de audio de 30 s | multilingue | MIT | `ggml` / `whisper.cpp` | Mismos pesos, sin diccionarios del proyecto |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al checkpoint `base` de Whisper; cualquier mejora proviene del corrector de diccionario, no del modelo.
- Precision limitada por el tamano `base`: al ser el checkpoint mas pequeno de la familia multilingue, la tasa de error sera superior a la de `small`, `medium` o `large`.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus de entrenamiento original de Whisper.
- Riesgo de alucinacion: Whisper puede generar texto plausible en segmentos de silencio o ruido; el corrector de diccionario puede ademas introducir sustituciones erroneas al forzar palabras frecuentes.
- Cobertura idiomatica: aunque el modelo es multilingue, el autor solo valida portugues e ingles; el rendimiento en otros idiomas no esta verificado.
- Dependencia de los diccionarios: la mejora en portugues de Brasil esta ligada a `pt-br-dictionary.txt` (~3k palabras) y `pt-br-lm.txt`; fuera de ese dominio la correccion puede degradar resultados.
- Licencia MIT: permisiva para uso comercial, pero se debe conservar el aviso de copyright de OpenAI y Georgi Gerganov segun indica la model card.
- Cero adopcion registrada (0 descargas, 0 likes en el momento de la consulta): sin validacion comunitaria ni reportes de produccion.
- El comando de descarga de la model card referencia `giofolf/omnivox`, no `gtihq/omnivox-lite`; conviene verificar el repositorio correcto antes de integrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gtihq/omnivox-lite
- whisper.cpp (ggerganov): https://github.com/ggerganov/whisper.cpp
- OpenAI Whisper: https://github.com/openai/whisper
- Referencia de descarga citada en la model card: https://huggingface.co/giofolf/omnivox
