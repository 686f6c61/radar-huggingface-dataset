# gagni/whisper.cpp

## Resumen

`gagni/whisper.cpp` es un espejo sin modificaciones de una selección de pesos del proyecto `ggerganov/whisper.cpp`, publicados en formato ggml para su uso con la implementación en C/C++ de Whisper desarrollada por Georgi Gerganov. El repositorio lo mantiene el usuario `gagni` con el objetivo declarado de que la herramienta aSup no dependa de un repositorio de terceros, y contiene únicamente tres ficheros: `ggml-base-q5_1.bin`, `ggml-small-q5_1.bin` y `ggml-large-v3-turbo-q5_0.bin`. No se trata, por tanto, de un modelo nuevo ni de un ajuste fino, sino de una copia de artefactos de inferencia derivados de los modelos Whisper originales de OpenAI.

Whisper es una familia de modelos de reconocimiento automático del habla (ASR) entrenados por OpenAI sobre pares audio-texto a gran escala. La conversión a ggml permite ejecutar la inferencia sin dependencias de PyTorch, con requisitos de memoria muy reducidos gracias a la cuantización de 5 bits, lo que habilita su despliegue en CPU, en dispositivos de borde y en GPUs de gama baja. La relevancia de este repositorio es logística: ofrece los tres tamaños (base, small y large-v3-turbo) en una sola ubicación estable bajo licencia MIT.

El repositorio ocupa 0,8 GB y no registra descargas ni interacciones en el momento de la consulta. La información disponible no incluye detalles sobre el proceso de conversión, los parámetros exactos de los modelos originales ni resultados de evaluación propios de este espejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), pesos convertidos a ggml |
| Parámetros totales | no disponible (los tres ficheros corresponden a los tamaños base, small y large-v3-turbo de Whisper; el número exacto de parámetros no se indica en la información proporcionada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por segmento; el dato no se explicita en la información proporcionada) |
| Tipos de cuantización | q5_1 (base y small), q5_0 (large-v3-turbo) |
| Idiomas soportados | no disponible (los modelos Whisper originales son multilingües, pero la información proporcionada no detalla la cobertura de este espejo) |
| Licencia | MIT |
| Formato de pesos | ggml (ficheros `.bin`) |

## Arquitectura y entrenamiento

Los pesos incluidos son conversiones a ggml de los modelos Whisper de OpenAI, que emplean una arquitectura transformer encoder-decoder orientada a la transcripción de audio. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, marcas de tiempo y tareas de transcripción o traducción. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de ajuste con RLHF o DPO; estos datos corresponden a las publicaciones originales de OpenAI y no se reproducen en este espejo.

La innovación técnica relevante aquí no está en el modelo sino en el formato: la conversión a ggml y la cuantización a 5 bits reducen drásticamente el peso en disco (de 142 MiB a 57 MiB en base, de 466 MiB a 181 MiB en small y de 1,5 GiB a 547 MiB en large-v3-turbo) y permiten la ejecución con `whisper.cpp` en CPU sin framework de deep learning. El repositorio no documenta el procedimiento de conversión ni los scripts empleados.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante el pipeline `automatic-speech-recognition`.
- Tres perfiles de modelo con compromiso tamaño/precisión: base (q5_1), small (q5_1) y large-v3-turbo (q5_0).
- Ejecución nativa en C/C++ a través de `whisper.cpp`, sin dependencia de PyTorch ni de CUDA para el caso CPU.
- Inferencia en CPU, lo que permite despliegue en servidores sin GPU y en dispositivos de borde.
- Capacidades multilingües y de traducción propias de Whisper: no confirmadas explícitamente para este espejo en la información disponible.
- Soporte de tool calling, agentes, visión, audio de entrada distinto de voz y modo de razonamiento: no disponible (no aplica a un modelo ASR).

## Casos de uso

- Transcripción de reuniones y notas de voz en servidores sin GPU: los ficheros q5_1 de base y small (57 MiB y 181 MiB) permiten ejecutar `whisper.cpp` en CPU con un consumo de memoria mínimo, adecuado para servicios internos de actas.
- Subtitulado automático de vídeo en pipelines de postproducción: `ggml-large-v3-turbo-q5_0.bin` (547 MiB) ofrece el mayor nivel de precisión de los tres incluidos con un coste de almacenamiento reducido, integrable en scripts de generación de subtítulos.
- Transcripción en dispositivos de borde o embebidos: el modelo base cuantizado a 5 bits cabe en sistemas con poca RAM y sin acelerador, lo que facilita asistentes de voz locales con privacidad de datos.
- Procesamiento por lotes de archivos de audio en infraestructura propia: la ausencia de dependencias de PyTorch simplifica el empaquetado en contenedores ligeros y el despliegue en clústeres de CPU.
- Prototipado rápido de aplicaciones de voz: los tres tamaños permiten comparar latencia y calidad sin descargar el catálogo completo de modelos de Whisper.
- Archivado y búsqueda de contenido hablado: la transcripción generada puede indexarse para búsqueda semántica sobre grabaciones, usando el modelo small como equilibrio entre velocidad y calidad.
- Integración en herramientas de accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva, ejecutando el modelo base en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los ficheros, base-q5_1 requiere del orden de decenas de MiB y large-v3-turbo-q5_0 en torno a 547 MiB de pesos, a los que se suma el estado de activaciones y el búfer de audio.
- GPU recomendadas: no disponible en la información proporcionada; `whisper.cpp` soporta ejecución en CPU y aceleración opcional por GPU, pero el repositorio no detalla configuraciones validadas.
- Cabida en GPU de consumo: los tres ficheros son de tamaño reducido (57 MiB, 181 MiB y 547 MiB), por lo que en principio caben en GPUs de consumo convencionales; no se confirma en la documentación disponible.
- Opciones de despliegue: `whisper.cpp` (formato nativo ggml). No se indica compatibilidad con vLLM, TGI, Ollama u otros motores en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gagni/whisper.cpp` (este repo) | no disponible (base, small, large-v3-turbo) | no disponible | ggml | MIT | Hugging Face, 0,8 GB |
| `ggerganov/whisper.cpp` | mismos modelos, catálogo completo | no disponible | ggml | MIT | Hugging Face, repositorio original |
| Whisper original de OpenAI | no disponible en la información proporcionada | no disponible | PyTorch | MIT | Repositorio de OpenAI |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos ASR no puede realizarse con los datos disponibles; únicamente se confirma que este repositorio replica un subconjunto del catálogo de `ggerganov/whisper.cpp`.

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por el autor del repositorio: cualquier problema de calidad es atribuible a los pesos originales de Whisper y a la conversión a ggml.
- Solo incluye tres ficheros; no cubre el catálogo completo de tamaños y cuantizaciones de `ggerganov/whisper.cpp`.
- La cuantización a 5 bits puede degradar ligeramente la precisión de transcripción frente a los pesos sin cuantizar; no se documenta el impacto en la información disponible.
- No se detallan los idiomas cubiertos ni el rendimiento por idioma; el uso en castellano no está verificado en esta ficha.
- Riesgo de alucinación en pasajes con ruido, silencios largos o audio de baja calidad, comportamiento conocido de la familia Whisper y no evaluado aquí.
- Sesgos de género, acento y dialecto heredados de los datos de entrenamiento originales de OpenAI; no cuantificados en la información proporcionada.
- Licencia MIT: permite uso comercial, pero conviene conservar los avisos de copyright y créditos del proyecto original, tal como indica la model card.
- El repositorio no registra descargas ni validación de la comunidad; la integridad de los ficheros debe comprobarse contra los SHA publicados en el repositorio original.
- Fecha de creación indicada como 2026-11-10, posterior a la consulta; conviene verificar la vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gagni/whisper.cpp
- Repositorio original de pesos: https://huggingface.co/ggerganov/whisper.cpp
- Listado de modelos originales: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Código de `whisper.cpp`: https://github.com/ggerganov/whisper.cpp
- Documentación de modelos de `whisper.cpp`: https://github.com/ggerganov/whisper.cpp/tree/master/models
