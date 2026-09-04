# mattwinwood/faster-whisper-vocal-score-profile

## Resumen

Este repositorio no contiene un modelo entrenado ni pesos, sino un perfil de inferencia documentado para usar el modelo Systran/faster-whisper-small.en dentro de la herramienta Vocal Score. Vocal Score convierte una interpretación vocal monofónica en notación musical editable; la transcripción melódica la realiza Basic Pitch, y este perfil aporta una capa opcional de transcripción de letras en inglés con marcas de tiempo por palabra. El autor, mattwinwood, publica esta configuración como referencia para integrar ASR genérico en un pipeline musical manteniendo separadas las responsabilidades de melodía y letra. El perfil especifica ejecución en CPU con cuantización int8, filtro VAD y beam size 5. Es relevante para desarrolladores que necesiten una plantilla ligera y de código abierto (MIT) para transcribir letras en aplicaciones de transcripción musical.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (perfil de configuración; modelo subyacente: Systran/faster-whisper-small.en, transformer encoder-decoder de Whisper) |
| Parámetros totales | No disponible (el repositorio no contiene pesos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (configuración del perfil para CPU; el modelo upstream admite otros tipos vía CTranslate2) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (para el perfil y documentación; el modelo upstream tiene su propia licencia) |
| Formato de pesos | No aplica (no contiene pesos; incluye transcription-profile.json y word-timestamps.schema.json) |

## Arquitectura y entrenamiento

El modelo subyacente es Systran/faster-whisper-small.en, una reimplementación en CTranslate2 del modelo Whisper small de OpenAI, que usa una arquitectura transformer encoder-decoder. El perfil no añade ningún entrenamiento ni fine-tuning; simplemente documenta una configuración de inferencia concreta: dispositivo CPU, tipo de cómputo int8, idioma inglés, marcas de tiempo por palabra, filtro VAD y beam size 5. La única innovación técnica destacable es el mapeo determinista de palabras a notas mediante solapamiento temporal, descrito en el esquema word-timestamps.schema.json. La salida del ASR nunca altera el tono, el ritmo ni la estructura de la partitura detectados por Basic Pitch.

## Capacidades

- Transcripción automática de voz en inglés (ASR) con marcas de tiempo por palabra.
- Filtro VAD para ignorar segmentos de silencio antes de la transcripción.
- Salida estructurada en JSON según el esquema documentado word-timestamps.schema.json.
- Integración con el pipeline Vocal Score: asigna palabras a notas mediante solapamiento temporal.
- No ofrece tool calling, function calling ni capacidades de agente; su función es estrictamente ASR.
- No realiza clonación de voz, identificación de hablante ni inferencia biométrica.
- No afecta a la transcripción melódica ni a la estructura musical.

## Casos de uso

- Transcripción de demos vocales para compositores: el perfil genera un borrador de letras con marcas de tiempo que se superpone a las notas transcritas por Basic Pitch, facilitando la creación de partituras.
- Generación de hojas de letras sincronizadas para práctica de canto: las marcas de tiempo permiten alinear la letra con la música para karaoke o ensayo.
- Investigación en musicología: analizar la relación entre sílabas y notas en interpretaciones monofónicas, usando el perfil como referencia para extraer letras.
- Accesibilidad para músicos con discapacidad visual: convertir actuaciones vocales en partituras con letras, utilizando el perfil para la capa de ASR.
- Automatización de subtítulos para vídeos de música: el perfil sirve como plantilla para integrar ASR en un pipeline de subtitulado de actuaciones.
- Educación musical: estudiar la dicción y la sincronización vocal en grabaciones de práctica, con el perfil como capa de transcripción de letras.
- Herramientas de práctica para cantantes: generar ejercicios con letras y marcas de tiempo a partir de interpretaciones, revisando y corrigiendo el borrador antes de usarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo indica explícitamente que no se reclama ninguna precisión en benchmarks.

## Requisitos de hardware

- El perfil está configurado para CPU con compute type int8, por lo que no requiere GPU.
- VRAM estimada: no disponible. Al no contener pesos, el repositorio no tiene requisitos de VRAM.
- GPU recomendadas: no aplica según el perfil; el modelo upstream puede ejecutarse en GPU, pero no se especifica.
- Opciones de despliegue: el perfil está pensado para usarse con faster-whisper y CTranslate2.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. Este repositorio es un perfil de configuración, no un modelo con pesos, por lo que no puede compararse directamente con otros modelos de ASR. El modelo upstream es Systran/faster-whisper-small.en, que sí es comparable con otras implementaciones de Whisper small, pero no se han proporcionado datos de rendimiento en esta ficha.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mattwinwood/faster-whisper-vocal-score-profile | Perfil de configuración | No disponible | No disponible | No disponible | MIT | HuggingFace |
| Systran/faster-whisper-small.en | Modelo ASR (Whisper small) | No disponible | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- El canto está fuera del rango más fiable del reconocimiento de voz ordinario.
- Las letras pueden ser incorrectas, especialmente con vocales sostenidas, voces superpuestas, efectos o acompañamiento fuerte.
- Las marcas de tiempo son aproximadas y el mapeo de solapamiento es deliberadamente simple.
- No se reclama ninguna precisión en benchmarks.
- El borrador debe ser revisado y corregido por un músico antes de su uso.
- No se realiza clonación de voz, identificación de hablante ni inferencia biométrica.
- El repositorio no contiene pesos; es solo un perfil de configuración, no un modelo entrenado.

## Enlaces

- https://huggingface.co/mattwinwood/faster-whisper-vocal-score-profile
- https://huggingface.co/Systran/faster-whisper-small.en
- https://github.com/SYSTRAN/faster-whisper
- https://fasterwhisper.org/
