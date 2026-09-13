# JoaoZaokk/whisper-large-v3-turbo-korean-ggml

## Resumen

JoaoZaokk/whisper-large-v3-turbo-korean-ggml es una conversión al formato GGML/GGUF del checkpoint royshilkrot/whisper-large-v3-turbo-korean-ggml, un ajuste de Whisper large-v3-turbo especializado en reconocimiento automático de habla en coreano. El repositorio no entrena ni modifica pesos: reempaqueta el checkpoint de origen con el conversor y el cuantizador propios de whisper.cpp, y publica cuatro variantes (f16, q4_0, q5_0 y q8_0) listas para cargar con `whisper-cli -m <fichero>` o cualquier aplicación que embeba whisper.cpp.

El problema que resuelve es de despliegue: Whisper large-v3-turbo en precisión completa ocupa 1625 MB, mientras que las variantes cuantizadas bajan a 874 MB (q8_0), 574 MB (q5_0) y 474 MB (q4_0), lo que permite transcripción en dispositivo (on-device) en CPU, móvil o equipos sin GPU dedicada. El autor indica que mantiene este alojamiento para que los enlaces de descarga usados por las aplicaciones nativas Odysseus y Open WebUI se mantengan estables.

La relevancia es limitada pero concreta: se trata de un artefacto derivado, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y validado únicamente con muestras cortas en portugués e inglés. Su interés principal es para quienes necesitan ASR coreano cuantizado y ejecutable sin infraestructura GPU, asumiendo que la licencia Apache 2.0 del modelo base se mantiene sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) convertido a GGML/GGUF para whisper.cpp |
| Parámetros totales | No disponible en la información proporcionada; el checkpoint base es un ajuste de Whisper large-v3-turbo |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos, el formato nativo de Whisper; no se especifica otra configuración |
| Tipos de cuantización | f16 (sin pérdida), q8_0, q5_0, q4_0 |
| Idiomas soportados | Coreano (ko) declarado en la model card; la conversión se verificó con muestras cortas en portugués e inglés |
| Licencia | Apache 2.0 (heredada del modelo base, sin cambios) |
| Formato de pesos | GGML/GGUF binario (`.bin`) para whisper.cpp; no incluye safetensors |

Ficheros publicados en el repositorio (tamaño total del repo: 3,5 GB):

| Fichero | Cuantización | Tamaño |
|---|---|---|
| `ggml-whisper-large-v3-turbo-korean-f16.bin` | f16 | 1625 MB |
| `ggml-whisper-large-v3-turbo-korean-q8_0.bin` | q8_0 | 874 MB |
| `ggml-whisper-large-v3-turbo-korean-q5_0.bin` | q5_0 | 574 MB |
| `ggml-whisper-large-v3-turbo-korean-q4_0.bin` | q4_0 | 474 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder que procesa espectrogramas mel de 30 segundos y genera texto de forma autorregresiva, con la variante turbo que reduce el número de capas del decodificador respecto a large-v3 para ganar velocidad de inferencia. Sobre esa base, el checkpoint de origen incorpora un ajuste fino orientado a coreano. El repositorio aquí descrito no documenta ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO; esa información correspondería al checkpoint original y no se incluye en la model card.

La única transformación técnica realizada es la conversión de formato: se aplicó el conversor propio de whisper.cpp sobre el checkpoint de origen y después el cuantizador de la misma herramienta para generar las variantes q8_0, q5_0 y q4_0. La model card indica que cada variante se comprobó transcribiendo muestras cortas en portugués e inglés antes de subirla. No se describe ninguna innovación de arquitectura, decodificación especulativa ni mecanismo de atención alternativo.

## Capacidades

- Transcripción de voz a texto en coreano, con la salida típica de Whisper (texto plano, segmentos y marcas de tiempo según la invocación).
- Reconocimiento automático de habla sobre ventanas de audio de 30 segundos, encadenables para ficheros más largos.
- Ejecución en dispositivo: los cuatro ficheros GGML/GGUF están pensados para inferencia local con whisper.cpp, sin dependencia de servicios en la nube.
- Cuantizaciones intercambiables según el equilibrio entre precisión y tamaño: q8_0 casi idéntico al original a alrededor del 55 % del tamaño, q5_0 como opción para móvil y q4_0 como la más pequeña con un coste de precisión pequeño.
- Compatibilidad con cualquier aplicación que embeba whisper.cpp (la model card menciona Odysseus y Open WebUI como consumidores de estos enlaces).
- No se documentan capacidades de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción ni modo de pensamiento. No es un modelo de lenguaje conversacional.

## Casos de uso

- Transcripción de reuniones y notas de voz en coreano: el modelo procesa audio en ventanas de 30 segundos y puede encadenarse para grabaciones largas, ejecutándose en local sin enviar el audio a terceros.
- Subtitulado de vídeo en coreano: la salida de Whisper incluye marcas de tiempo por segmento, lo que permite generar ficheros de subtítulos directamente desde whisper.cpp.
- Asistentes de voz on-device: con la variante q4_0 (474 MB), el modelo cabe en dispositivos con almacenamiento y memoria limitados, lo que habilita dictado y comandos de voz sin conexión.
- Aplicaciones de privacidad estricta: al no requerir GPU ni servicios externos, encaja en entornos donde el audio no puede salir del equipo, como consultas médicas o legales.
- Prototipado rápido de pipelines ASR en coreano: la variante f16 (1625 MB) sirve como referencia de calidad frente a las cuantizadas, útil para medir la degradación introducida por q5_0 y q4_0 con datos propios.
- Integración en aplicaciones de escritorio y móviles basadas en whisper.cpp: cualquier cliente que enlace la librería puede cargar estos ficheros directamente mediante `whisper-cli -m <fichero>` o su API embebida.
- Transcripción de contenido multilingüe con predominio de coreano: aunque solo se declara coreano, el autor verificó muestras en portugués e inglés, por lo que puede usarse como prueba exploratoria en esos idiomas, siempre validando la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de WER, MMLU, HumanEval ni de ninguna otra métrica, ni comparaciones cuantitativas con otros checkpoints. La única evidencia de calidad aportada por el autor es la comprobación cualitativa de cada variante mediante transcripción de muestras cortas en portugués e inglés, sin métricas asociadas.

## Requisitos de hardware

- Huella de memoria del modelo según la variante: 1625 MB (f16), 874 MB (q8_0), 574 MB (q5_0) y 474 MB (q4_0). A esa cifra hay que sumar la memoria del runtime de whisper.cpp para el audio y los estados intermedios.
- Inferencia en CPU: viable con las cuatro variantes, especialmente q4_0 y q5_0; es el escenario natural de whisper.cpp, sin necesidad de GPU.
- GPU consumer: las variantes cuantizadas caben con holgura en cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060). La variante f16 requiere del orden de 2 GB solo para los pesos, por lo que también entra en GPU de 4 GB.
- GPU de datacenter (A100, H100): compatibles, pero sobredimensionadas para un modelo de este tamaño; su uso tendría sentido solo por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: whisper.cpp (motor de referencia, incluye CLI y librería embebible) es la vía documentada. No se mencionan en la información disponible vLLM, TGI, Ollama ni servidores equivalentes, y llama.cpp no es el runtime previsto para pesos de Whisper.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real, RTF ni tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Idiomas | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (JoaoZaokk/whisper-large-v3-turbo-korean-ggml) | No disponible; derivado de Whisper large-v3-turbo | 30 s por ventana | Coreano declarado; pruebas puntuales en portugués e inglés | f16, q8_0, q5_0, q4_0 | Apache 2.0 | Repositorio público, 0 descargas, 0 likes |
| royshilkrot/whisper-large-v3-turbo-korean-ggml (origen) | No disponible en la información | 30 s por ventana | Coreano | No disponible | Apache 2.0 (según la atribución de este repositorio) | Repositorio público en HuggingFace |
| Whisper large-v3-turbo de OpenAI | No disponible | 30 s por ventana | Multilingüe | No disponible | No disponible en la información | Referencia upstream |
| Otras conversiones GGML de Whisper large-v3-turbo para whisper.cpp | No disponible | 30 s por ventana | Según el ajuste de origen | Habitualmente f16 y familia q | No disponible | Repositorios públicos en HuggingFace |

La información proporcionada no incluye métricas de calidad que permitan comparar el rendimiento real de estas alternativas; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto derivado, no un modelo entrenado: este repositorio solo reempaqueta y cuantiza pesos de terceros; cualquier limitación del checkpoint de origen se hereda sin cambios.
- Idiomas: solo se declara coreano. El autor validó con muestras cortas en portugués e inglés, pero no hay evidencia de calidad sostenida en otros idiomas, y es esperable una degradación fuera del dominio de ajuste.
- Ventana de 30 segundos: es el límite nativo de Whisper; el audio más largo debe segmentarse, lo que puede provocar cortes en palabras y errores en fronteras de segmento.
- Riesgo de alucinación: los modelos Whisper tienden a generar texto plausible en tramos de silencio, ruido o audio musical. No se documenta ningún mecanismo de mitigación en esta conversión.
- Sesgos: no se publica ninguna evaluación de sesgos por acento, género, edad ni variante dialectal del coreano.
- Sin benchmarks: no hay cifras de WER ni comparaciones con el checkpoint original, de modo que no es posible cuantificar la pérdida de precisión introducida por q5_0 y q4_0 a partir de la documentación disponible.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor recuerda que los pesos son obra derivada del modelo de origen y mantienen su licencia; conviene citar a los autores originales (royshilkrot).
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, no incluye resultados reproducibles ni scripts de conversión, y las fechas de creación y actualización indicadas (2026-09-12) no permiten situar el artefacto con claridad.
- Mantenimiento: el autor indica que el alojamiento existe para mantener estables los enlaces de las aplicaciones Odysseus y Open WebUI, y ofrece el modelo "sin garantía" (no warranty).
- No es un modelo de lenguaje: no soporta generación de texto libre, razonamiento, código, matemáticas, tool calling ni uso agéntico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-large-v3-turbo-korean-ggml
- Checkpoint de origen: https://huggingface.co/royshilkrot/whisper-large-v3-turbo-korean-ggml
- Motor de inferencia whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Perfil del autor de la conversión: https://huggingface.co/JoaoZaokk
