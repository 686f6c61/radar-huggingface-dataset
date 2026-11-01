# MedHachim/whisper-medium-darija-ggml

## Resumen

whisper-medium-darija-ggml es una conversión al formato GGML del modelo amineouaki/whisper-medium-darija-combined, un ajuste fino de OpenAI Whisper medium especializado en darija (árabe marroquí). Lo publica el usuario MedHachim y no implica reentrenamiento alguno: se trata de una conversión de pesos desde el checkpoint de Hugging Face a GGML de 16 bits y su posterior cuantización a 5 bits (q5_0) mediante las herramientas oficiales de whisper.cpp. El resultado es un único fichero de 539.212.484 bytes (aproximadamente 0,5 GB) listo para inferencia local con whisper.cpp.

El modelo resuelve un problema concreto: la transcripción automática de habla en darija, un dialecto con escasa representación en los corpus de Whisper y que se degrada notablemente con el modelo original. Al estar empaquetado en GGML cuantizado, permite ejecutar reconocimiento de voz en CPU y en hardware modesto, sin depender de GPU ni de servicios en la nube. Su uso declarado es la generación automática de subtítulos en CapRocket, un editor de vídeo gratuito.

La relevancia actual del artefacto es práctica más que investigadora: demuestra un flujo reproducible de conversión y cuantización de un fine-tune de Whisper para whisper.cpp, con instrucciones explícitas sobre el token de idioma y sobre cómo compensar la falta de timestamps fiables. La arquitectura subyacente es el transformer encoder-decoder de Whisper medium, con 769 millones de parámetros en el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (OpenAI Whisper medium), convertido a GGML |
| Parametros totales | 769 M (correspondientes a Whisper medium; no se indica recuento propio en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | q5_0 (5 bits); el paso intermedio fue GGML de 16 bits |
| Idiomas soportados | ar (arabe), ary (arabe marroqui / darija) |
| Licencia | apache-2.0 |
| Formato de pesos | GGML (`ggml-medium-darija-q5_0.bin`) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de OpenAI Whisper medium: un transformer encoder-decoder que procesa espectrogramas mel de 80 canales sobre ventanas de audio de 30 segundos y genera tokens de texto de forma autorregresiva. No hay modificaciones arquitectónicas en esta publicación; el autor declara explícitamente que no se reentrenó nada y que todo el crédito del ajuste corresponde a amineouaki.

El proceso de creación consta de dos pasos documentados. Primero, el script `models/convert-h5-to-ggml.py` de whisper.cpp, junto con el repositorio de OpenAI Whisper para los filtros mel, transforma el checkpoint de Hugging Face en un fichero GGML de 16 bits. Segundo, `whisper-quantize` lo cuantiza a 5 bits con el esquema q5_0. No se detallan en la información disponible el volumen de datos de entrenamiento del fine-tune original, la composición del corpus de darija ni si hubo etapas de RLHF o ajuste supervisado adicionales.

## Capacidades

- Reconocimiento automático de voz (ASR) en darija marroquí, con salida de texto transcrito.
- Transcripción de audio en árabe estándar como idioma secundario declarado, aunque el ajuste está orientado al dialecto.
- Ejecución local mediante whisper.cpp, sin dependencia de Python ni de GPU.
- Funcionamiento en CPU gracias a la cuantización q5_0, con un fichero de unos 0,5 GB.
- Integración en pipelines de subtitulado por segmentos, tal como se emplea en CapRocket.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo más allá de la transcripción.

## Casos de uso

- Subtitulado automático de vídeo en darija: el modelo transcribe fragmentos de audio y permite generar pistas de subtítulos para contenido marroquí. En CapRocket se corta el audio por pausas en piezas de 8 segundos como máximo, se transcriben en una sola pasada con `-ac 448` y se distribuyen las palabras sobre el habla; en una prueba, los tiempos por palabra quedaron dentro de 0,2 s de media respecto a large-v3-turbo.
- Transcripción de entrevistas y material de investigación de campo: útil para investigadores que trabajan con corpus orales marroquíes y necesitan texto indexable sin enviar audio a servicios externos.
- Generación de actas y notas en entornos con conectividad limitada: al ejecutarse con whisper.cpp en CPU, puede desplegarse en portátiles o servidores modestos sin acceso a la nube.
- Preprocesado de datasets de voz para entrenamiento: sirve para etiquetar automáticamente audio en darija y construir corpus de texto alineado, con revisión humana posterior.
- Accesibilidad en medios locales: permite añadir subtítulos a programas de televisión, pódcast o vídeos divulgativos dirigidos a hablantes de darija.
- Prototipado rápido de aplicaciones de voz: al ser un único binario GGML, se integra en scripts de línea de comandos y en servicios ligeros para validar productos de transcripción antes de invertir en infraestructura mayor.
- Archivado y búsqueda de contenido audiovisual: la transcripción permite indexar y buscar por palabra clave en archivos de vídeo en darija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única referencia cuantitativa de la model card es una comparación cualitativa de alineación temporal: en un clip de prueba, los tiempos por palabra quedaron dentro de 0,2 s de media respecto a large-v3-turbo, usando el esquema de segmentación de CapRocket.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el fichero q5_0 ocupa unos 539 MB, por lo que la inferencia puede ejecutarse en CPU con un consumo de memoria del orden de 1 GB o menos, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican en la información disponible; whisper.cpp puede usar aceleración por GPU, pero la model card solo documenta el uso con `whisper-cli`.
- Cabe en GPU de consumo: sí, por tamaño del fichero, aunque no hay datos publicados de rendimiento en RTX 4090, A100 o H100 para esta conversión concreta.
- Opciones de despliegue: whisper.cpp mediante `whisper-cli`; no se documentan otras integraciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| whisper-medium-darija-ggml (este) | 769 M (Whisper medium) | no disponible | ar, ary | apache-2.0 | GGML q5_0 | Fine-tune de darija cuantizado para whisper.cpp |
| amineouaki/whisper-medium-darija-combined | 769 M (Whisper medium) | no disponible | ar, ary | apache-2.0 | safetensors (Hugging Face) | Modelo base del que deriva esta conversión |
| OpenAI Whisper medium | 769 M | ventana de audio de 30 s | multilingüe (incluye ar) | MIT (Whisper) | PyTorch, GGML, entre otros | Sin ajuste específico de darija; peor rendimiento esperado en dialecto |
| OpenAI Whisper large-v3-turbo | no disponible en la informacion | ventana de audio de 30 s | multilingüe | MIT (Whisper) | PyTorch, GGML, entre otros | Referencia de alineación temporal citada en la model card; mayor coste computacional |

## Limitaciones y advertencias

- El ajuste no predice timestamps fiables; cualquier uso que dependa de marcas temporales precisas requiere el esquema de segmentación por pausas descrito por el autor o una capa de alineación externa.
- Whisper no tiene token de darija: es obligatorio usar `-l ar`, lo que puede introducir sesgos hacia el árabe estándar en la salida.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- No se documentan evaluaciones de sesgo, cobertura dialectal interna (por regiones de Marruecos) ni robustez ante acentos o code-switching con francés.
- El modelo solo cubre ASR; no debe esperarse razonamiento, generación libre ni soporte de herramientas.
- La licencia Apache-2.0 permite uso comercial, pero el autor original del fine-tune es amineouaki y esta publicación es una conversión no oficial; conviene verificar el fichero `LICENSE` del repositorio base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- El SHA-256 del fichero está publicado en la model card; conviene verificarlo tras la descarga para descartar corrupción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedHachim/whisper-medium-darija-ggml
- Modelo base: https://huggingface.co/amineouaki/whisper-medium-darija-combined
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- CapRocket: https://caprocket.site
