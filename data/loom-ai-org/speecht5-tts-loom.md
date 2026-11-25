# loom-ai-org/speecht5-tts-loom

## Resumen

SpeechT5 TTS Loom es una exportación del modelo de síntesis de voz `microsoft/speecht5_tts` al formato GGUF propietario de loom.cpp, realizada por el proyecto loom-ai-org. El repositorio empaqueta en un único fichero autodescriptivo los pesos del codificador de texto y el decodificador autorregresivo de SpeechT5 (que predice tramas de mel-espectrograma a 16 kHz), junto con el vocoder HiFi-GAN de `microsoft/speecht5_hifigan` y el tokenizador con normalizador de números integrado. Los pesos son los originales sin modificar: solo cambia el contenedor y el motor de ejecución.

El modelo resuelve la síntesis texto-a-voz en inglés a partir de texto sin necesidad de fonemizador externo, ya que SpeechT5 codifica el texto directamente. Su tamaño es contenido (158.989.080 parámetros reales según safetensors) y el repositorio ocupa 1,9 GB, lo que lo hace adecuado para despliegues ligeros en CPU o GPU de gama media. La licencia MIT, heredada del modelo base, permite uso comercial sin restricciones adicionales.

Su relevancia actual reside en la portabilidad: al ser un GGUF autodescriptivo con topologías de grafo, tokenizador y driver embebidos, se ejecuta con la librería `loom-py-rt` sin depender del stack de PyTorch/Transformers. Incluye además siete voces CMU ARCTIC empaquetadas como ficheros de voz independientes y soporte de streaming de audio por fragmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder transformer con decoder autorregresivo de mel-espectrograma) + vocoder HiFi-GAN |
| Parametros totales | 158.989.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limite de 10 pasos de decoder, 20 tramas, 0,32 s por caracter de entrada) |
| Tipos de cuantizacion | no disponible (el repo distribuye GGUF; no se detallan variantes de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `speecht5-tts.gguf` y ficheros de voz `voices/*.gguf`) |

## Arquitectura y entrenamiento

SpeechT5 es un modelo encoder-decoder de tipo transformer en el que el codificador procesa el texto directamente (sin fonemizador) y el decodificador genera de forma autorregresiva tramas de mel-espectrograma. La forma de onda final la produce el vocoder HiFi-GAN de `microsoft/speecht5_hifigan`, incluido en el mismo GGUF. La exportación conserva la topología original y añade un driver propio que gestiona el ventaneo, el muestreo y el ensamblado de audio.

El modelo base fue entrenado en inglés sobre LibriTTS según la model card. Un detalle técnico relevante es que el decoder mantiene activo el dropout de la prenet en inferencia (decisión heredada de Tacotron 2), por lo que cada trama depende de una extracción aleatoria; loom-py fija la semilla a 0 por defecto, de modo que la misma llamada produce el mismo audio y otra semilla produce otra toma. La exportación fue verificada contra `generate_speech` de Transformers con las extracciones fijadas: mismo número de tramas y forma de onda con diferencia de 6e-06 rms. El vocabulario carece de dígitos, por lo que se incorpora el normalizador de números de referencia (`SpeechT5Tokenizer(normalize=True)`), que requiere loom 1.0.0-rc12 o superior.

## Capacidades

- Síntesis texto-a-voz en inglés a 16 kHz con voz integrada por defecto (`slt`, CMU ARCTIC, femenina estadounidense).
- Codificación de texto directa, sin fonemizador externo.
- Normalización automática de números escritos en cifras a su forma hablada (por ejemplo, `$15,000.50` se lee "fifteen thousand point five zero dollars").
- Selección de voz entre siete hablantes CMU ARCTIC: `slt`, `clb`, `bdl`, `rms`, `awb`, `jmk`, `ksp`.
- Uso de voces personalizadas mediante cualquier x-vector de 512 dimensiones extraído con `spkrec-xvect-voxceleb` de SpeechBrain, convertible con `loom_exporter.speecht5_voices`.
- Streaming de audio por fragmentos mediante `model.text2speech.stream`, con reproducción incremental.
- Control de la semilla de generación para reproducibilidad o variación del resultado.
- Parada controlada por la cabeza de stop del propio modelo, con un máximo de 10 pasos de decoder (20 tramas, 0,32 s) por carácter de entrada.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Locución automatizada de artículos y documentación: el modelo convierte texto plano en audio a 16 kHz sin dependencias de PyTorch, lo que simplifica su integración en pipelines de publicación que generan versiones en audio de contenido escrito.
- Asistentes de voz para atención al cliente: con streaming nativo, el audio se emite por fragmentos a medida que el driver los produce, lo que reduce la latencia percibida en respuestas conversacionales en inglés.
- Generación de avisos y notificaciones habladas: la normalización integrada de números permite leer importes, cantidades y fechas sin preprocesado adicional, útil en sistemas de alertas financieras o de inventario.
- Prototipado de interfaces de voz en aplicaciones de escritorio: al ejecutarse con `loom-py-rt` y un único GGUF de 1,9 GB, se puede empaquetar en entornos sin GPU dedicada.
- Producción de audiolibros y pódcast con múltiples voces: los siete hablantes CMU ARCTIC permiten asignar voces distintas a narrador y personajes seleccionando el fichero de voz correspondiente.
- Clonación de voz controlada en entornos de investigación: cualquier x-vector de SpeechBrain puede convertirse en fichero de voz y usarse con `voice="voices/me.gguf"`, lo que facilita experimentos de personalización con licencia MIT.
- Accesibilidad web: generación de audio bajo demanda para lectores de pantalla o versiones habladas de contenido, con la ventaja de que el modelo es ligero y no requiere servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una verificación de equivalencia con `generate_speech` de Transformers (mismo número de tramas y diferencia de 6e-06 rms en la forma de onda con las extracciones fijadas), que no constituye una evaluación de calidad perceptual ni de inteligibilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 158,9 millones de parámetros y un repositorio de 1,9 GB, la inferencia cabe holgadamente en GPUs de consumo, aunque el dato exacto depende del backend de loom.cpp.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de memoria libre debería ser suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros y el tamaño del fichero GGUF; no se detallan modelos concretos.
- Opciones de despliegue: `loom-py-rt` (PyPI, con extra `[hub]`), ejecutado sobre el motor loom.cpp. No se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput: no disponibles. La model card solo indica que el streaming entrega el audio por fragmentos y que la parada se limita a 10 pasos de decoder por carácter de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SpeechT5 TTS Loom (este) | 158.989.080 | 10 pasos de decoder (0,32 s) por caracter | en | MIT | GGUF (loom.cpp) | Incluye vocoder HiFi-GAN y 7 voces CMU ARCTIC; sin fonemizador |
| `microsoft/speecht5_tts` (base) | no disponible en la informacion | mismo limite de decoder | en | MIT | safetensors (Transformers) | Requiere stack PyTorch/Transformers y vocoder separado |
| `microsoft/speecht5_hifigan` | no disponible en la informacion | no aplica (vocoder) | no aplica | MIT | safetensors | Vocoder empaquetado dentro del GGUF de este repo |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos TTS comparables |

## Limitaciones y advertencias

- Solo admite inglés; el modelo base fue entrenado sobre LibriTTS y no se documentan otros idiomas.
- El decoder mantiene el dropout de la prenet activo en inferencia, por lo que cada trama depende de una extracción aleatoria; sin fijar `seed` los resultados varían entre llamadas (loom-py usa 0 por defecto).
- El límite de 10 pasos de decoder (20 tramas, 0,32 s) por carácter de entrada puede truncar entradas largas o con caracteres que requieran más duración.
- El vocabulario no contiene dígitos: los números deben pasar por el normalizador integrado, que exige loom 1.0.0-rc12 o superior; en versiones anteriores llegan como token desconocido.
- La frecuencia de muestreo (16 kHz) no se deduce del checkpoint: si se pasa un valor incorrecto, el audio se reproduce a velocidad equivocada sin error.
- El repositorio incluye un único fichero de voz integrado (`slt`); las demás voces se descargan del repo la primera vez que se solicitan.
- Las grabaciones CMU ARCTIC son libres para cualquier uso, incluido comercial, siempre que se conserve el aviso de copyright de Carnegie Mellon University; cada fichero de voz registra su licencia y origen.
- No se documentan sesgos específicos del modelo ni tasas de alucinación; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o la omisión de contenido, no la generación de texto libre.
- No se especifican requisitos de hardware ni rendimiento medido, lo que dificulta planificar capacity en producción sin pruebas propias.
- La librería `loom-py-rt` y el motor loom.cpp son dependencias propietarias del ecosistema loom-ai-org; la portabilidad fuera de ese stack no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/speecht5-tts-loom
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Vocoder HiFi-GAN: https://huggingface.co/microsoft/speecht5_hifigan
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Voces CMU ARCTIC (x-vectors): https://huggingface.co/Matthijs/cmu-arctic-xvectors
- Paquete PyPI: https://pypi.org/project/loom-py-rt/
