# andrewcarterhughes/tibetan-stt-engine

## Resumen

El Tibetan STT Engine es un paquete de inferencia para reconocimiento automático de voz (ASR) en tibetano, publicado por el usuario andrewcarterhughes como componente del proyecto Pronunciation Helper. No es un modelo entrenado desde cero, sino una conversión a CoreML (media precisión) del modelo wav2vec2 multidiálecto `ganga4364/wav2vec2-combine-dialect-model-v2-47000`, procedente del trabajo de speech-to-text de OpenPecha, acompañado de un modelo de lenguaje de 5-gramas a nivel de sílaba en formato KenLM.

El paquete está diseñado para ser consumido por la aplicación Pronunciation Helper, que descarga los ficheros, verifica sus checksums y los usa para transcribir sílaba a sílaba el tibetano hablado en una grabación. Incluye un binario de línea de comandos (`stt`) para Macs con Apple Silicon y macOS 14 o superior, que en modo `stt serve` carga los modelos una sola vez y responde a peticiones de transcripción.

Su relevancia radica en ser uno de los pocos recursos públicos de ASR tibetano empaquetado para ejecución local en hardware de consumo, aunque su alcance es deliberadamente limitado: uso personal y no comercial, plataforma Apple Silicon exclusivamente y sin licencia declarada sobre los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (modelo acústico) + modelo de lenguaje KenLM de 5-gramas a nivel de sílaba |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantización | CoreML en media precisión (half precision); no se documentan otras |
| Idiomas soportados | tibetano (código `bo`), multidiálecto según el modelo base |
| Licencia | no disponible (el repositorio original no declara licencia; el autor no reclama ni concede ninguna) |
| Formato de pesos | CoreML (`coreml/model.mlmodelc`), KenLM (`lm/`), binario CLI `stt` |
| Tamaño del repositorio | 0,8 GB |
| Plataforma de ejecución | Apple Silicon, macOS 14 o superior |

## Arquitectura y entrenamiento

El componente acústico es un wav2vec2 multidiálecto para tibetano, convertido a CoreML en media precisión. Los pesos proceden de `ganga4364/wav2vec2-combine-dialect-model-v2-47000`, desarrollado en el marco del trabajo de reconocimiento de voz de OpenPecha; el autor de este repositorio solo ha cambiado el formato del fichero. No se detallan en la información disponible el número de parámetros, la composición del corpus de entrenamiento ni si hubo etapas de ajuste supervisado, RLHF o DPO.

Sobre el modelo acústico se aplica un modelo de lenguaje de 5-gramas a nivel de sílaba construido con KenLM, entrenado a partir de transcripciones de tibetano hablado del dataset `openpecha/stt-training-data`, texto de diccionario y algunos textos clásicos. El LM almacena recuentos de secuencias de sílabas, no los textos originales, y su función es desambiguar entre grafías que suenan de forma parecida. La decodificación combina, por tanto, salida acústica y puntuación del LM de sílabas, lo que es coherente con la naturaleza silábica de la escritura tibetana.

## Capacidades

- Reconocimiento automático de voz en tibetano, con salida alineada a nivel de sílaba sobre la forma de onda.
- Manejo de múltiples dialectos del tibetano, heredado del modelo base multidiálecto.
- Desambiguación ortográfica mediante LM de 5-gramas a nivel de sílaba (elección entre grafías homófonas).
- Servicio local persistente mediante `stt serve`, que carga los modelos una vez y atiende peticiones de transcripción sucesivas.
- Integración prevista con la aplicación Pronunciation Helper, que descarga los ficheros y verifica checksums.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Estudio personal de pronunciación: la aplicación Pronunciation Helper usa la transcripción silábica para mostrar el texto tibetano sobre la forma de onda y permitir comparar la pronunciación del estudiante con la esperada.
- Investigación lingüística de campo: transcripción asistida de grabaciones en tibetano para documentación de variantes dialectales, con revisión humana posterior dado el nivel de error declarado.
- Creación de material didáctico: generación de transcripciones alineadas temporalmente (tiempos aproximados de sílaba) para subtitulado o ejercicios de lectura.
- Archivística de audio en tibetano: primer paso de indexación y búsqueda sobre grabaciones orales, aprovechando el servicio local sin enviar audio a terceros.
- Prototipado de aplicaciones de ASR de bajos recursos: el paquete sirve como referencia de despliegue CoreML + KenLM en Apple Silicon para lenguas con pocos datos.
- Anotación semiautomática de corpus: pretranscripción de audio tibetano para acelerar el etiquetado manual en proyectos de datos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) con macOS 14 o superior; no hay soporte para x86, GPU NVIDIA ni otros sistemas.
- VRAM/unified memory: no disponible de forma explícita; el repositorio completo ocupa 0,8 GB, por lo que la huella de memoria del modelo acústico en CoreML y del LM KenLM es reducida y cabe holgadamente en cualquier Mac con Apple Silicon.
- GPU recomendadas: no aplica GPU dedicada; la inferencia se ejecuta sobre la GPU/Neural Engine integrada del chip Apple.
- Despliegue: binario `stt` en modo `stt serve`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de audio CoreML).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tibetan STT Engine (este) | wav2vec2 + KenLM 5-gramas | Tibetano (`bo`) | CoreML + KenLM + CLI | no disponible | Solo Apple Silicon, uso personal |
| `ganga4364/wav2vec2-combine-dialect-model-v2-47000` | wav2vec2 | Tibetano multidiálecto | safetensors (presumiblemente) | no disponible | Modelo base del que deriva este paquete |
| Whisper (OpenAI) | Transformer encoder-decoder | Multilingüe (incluye tibetano con cobertura limitada) | safetensors, GGUF, CoreML | MIT | Mayor cobertura de plataformas; rendimiento en tibetano no verificado en la información disponible |

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con macOS 14 o superior; no hay versión para otras plataformas.
- Solo tibetano: el habla en otros idiomas se transcribe como sílabas de aspecto tibetano, sin detección de idioma.
- Los tiempos de sílaba son aproximados y el texto contiene errores propios de cualquier ASR; requiere revisión humana en usos críticos.
- El modelo base no declara licencia y el autor no reclama ni concede ninguna: para cualquier uso más allá del estudio personal es necesario contactar con los autores originales.
- El autor restringe explícitamente el uso a fines personales y no comerciales.
- No se documentan sesgos específicos, pero al derivar de un corpus limitado de OpenPecha puede presentar peor rendimiento en dialectos o registros poco representados.
- Riesgo de alucinación ortográfica: el LM de sílabas puede forzar secuencias plausibles pero incorrectas cuando la señal acústica es ambigua.
- El paquete no está pensado para ejecutarse de forma autónoma; está diseñado para ser descargado y verificado por la aplicación Pronunciation Helper.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/andrewcarterhughes/tibetan-stt-engine
- Modelo base: https://huggingface.co/ganga4364/wav2vec2-combine-dialect-model-v2-47000
- Dataset de entrenamiento del LM: https://huggingface.co/datasets/openpecha/stt-training-data
- Aplicación Pronunciation Helper: https://bum-pa-mi-rtag-pa.site/pronunciation-helper/
