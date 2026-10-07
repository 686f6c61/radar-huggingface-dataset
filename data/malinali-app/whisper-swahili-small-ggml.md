# malinali-app/whisper-swahili-small-ggml

## Resumen

El modelo `malinali-app/whisper-swahili-small-ggml` es una conversión al formato GGML del modelo de reconocimiento automático del habla (ASR) `PaschalK/whisper-swahili-small`, que a su vez es un ajuste fino de `openai/whisper-small` para el idioma suajili (sw). Está empaquetado específicamente para su uso con `whisper.cpp` y con la aplicación Malinali, con el objetivo de permitir transcripción de voz suajili en dispositivo sin necesidad de infraestructura de servidor.

El modelo deriva de la arquitectura encoder-decoder transformer de Whisper small, con aproximadamente 244 millones de parámetros en la versión original de OpenAI. Esta conversión concreta emplea cuantización q8_0 y se distribuye como un único archivo `ggml-model-q8_0.bin` dentro de un repositorio de aproximadamente 0,3 GB, lo que facilita su despliegue en hardware modesto.

La relevancia de esta ficha radica en que cubre un caso de uso muy específico: transcripción de audio en suajili mediante `whisper.cpp`. Es importante señalar que el paquete está diseñado exclusivamente para transcripción (salida en el idioma original), no para traducción al inglés. La licencia Apache 2.0 facilita su integración tanto en proyectos personales como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base `openai/whisper-small` tiene ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en el modelo base Whisper small corresponde a segmentos de audio de 30 s) |
| Tipos de cuantizacion | q8_0 (GGML) |
| Idiomas soportados | suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`ggml-model-q8_0.bin`) |
| Tarea | automatic-speech-recognition (transcripcion, no traduccion) |
| Modelo base | `openai/whisper-small` |
| Modelo del que deriva | `PaschalK/whisper-swahili-small` |
| Tamano del repositorio | 0,3 GB |
| Herramienta objetivo | whisper.cpp / Malinali |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper small de OpenAI: un transformer encoder-decoder que procesa espectrogramas mel como entrada y genera tokens de texto de forma autorregresiva. El ajuste fino hacia suajili proviene del modelo `PaschalK/whisper-swahili-small`, del cual esta versión es únicamente una conversión de formato, no un reentrenamiento.

No se dispone de informacion sobre el numero de tokens de audio empleados en el ajuste fino, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La aportacion tecnica de este repositorio concreto es la conversion a GGML con cuantizacion q8_0, que reduce el peso del modelo para permitir inferencia eficiente en CPU y en dispositivos con recursos limitados mediante `whisper.cpp`. Segun la model card, el pack esta pensado para transcripcion, mientras que el microfono por defecto de Malinali utiliza Whisper tiny multilingue con `translate=true`.

## Capacidades

- Transcripcion de voz en suajili (sw) a texto.
- Reconocimiento automatico del habla (ASR) en formato compatible con `whisper.cpp`.
- Ejecucion en dispositivo (on-device) gracias a la cuantizacion q8_0 y al formato GGML.
- Integracion con la aplicacion Malinali a traves de su pipeline de microfono.
- Capacidad multilingue: limitada al suajili segun la etiqueta de idioma declarada (`sw`).
- Traduccion al ingles: no soportada por este pack (la model card indica explicitamente que es solo para transcripcion).
- Tool calling / function calling: no disponible.
- Soporte de agentes: no aplica a un modelo ASR.
- Capacidades de vision o audio mas alla de ASR: no disponibles.

## Casos de uso

- Transcripcion de reuniones en suajili: el modelo convierte audio de reuniones en texto para generar actas o resumenes posteriores, ejecutandose localmente sin enviar datos a la nube.
- Subtitulado de contenido audiovisual: permite generar subtitulos en suajili para videos, podcasts o material educativo usando `whisper.cpp` como backend.
- Asistentes de voz en suajili: se puede integrar en aplicaciones de dictado o asistentes que necesiten convertir la voz del usuario en texto antes de procesarla.
- Herramientas de accesibilidad: transcripcion en tiempo real para personas con dificultades auditivas en entornos donde se habla suajili.
- Archivado y busqueda de audio: convertir grabaciones historicas o notas de voz a texto indexable para busqueda posterior.
- Aplicaciones moviles y de escritorio sin conexion: al ser un modelo pequeno en GGML, puede desplegarse en telefonos o portatiles para transcripcion offline en zonas con conectividad limitada.
- Investigacion linguistica: generacion de corpus transcritos en suajili para estudios de procesamiento del lenguaje natural de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; dado el tamano del repositorio (0,3 GB) y la cuantizacion q8_0, la huella en memoria es reducida (del orden de cientos de MB, incluyendo buffers de inferencia).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se especifican modelos concretos en la informacion proporcionada.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo actual, e incluso puede ejecutarse solo en CPU.
- Opciones de despliegue: `whisper.cpp` (formato nativo GGML) y la aplicacion Malinali. No se documentan otros backends como vLLM, TGI o Ollama para este paquete.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `malinali-app/whisper-swahili-small-ggml` | no disponible (base ~244 M) | no disponible | suajili (sw) | Apache 2.0 | GGML q8_0 |
| `PaschalK/whisper-swahili-small` | no disponible (base ~244 M) | no disponible | suajili (sw) | no disponible | safetensors (formato original) |
| `openai/whisper-small` | ~244 M | segmentos de 30 s | multilingue | Apache 2.0 | safetensors / varios |
| `openai/whisper-base` | ~74 M | segmentos de 30 s | multilingue | Apache 2.0 | safetensors / varios |

Nota: los datos de parametros y contexto de `openai/whisper-small` y `openai/whisper-base` corresponden a informacion publica de los modelos base; para las variantes ajustadas a suajili no se dispone de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta restringido al suajili; no debe esperarse un rendimiento fiable en otros idiomas.
- No realiza traduccion al ingles: solo transcripcion en el idioma de origen.
- No se han publicado datos de evaluacion (WER u otras metricas) en la informacion disponible, por lo que el rendimiento real es incierto.
- Riesgo de alucinacion y de errores de transcripcion inherentes a los modelos ASR, especialmente con audio ruidoso o acentos poco representados.
- Posibles sesgos derivados del dataset de ajuste fino, que no se documenta.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original `PaschalK/whisper-swahili-small`, cuya licencia no se especifica en la informacion proporcionada.
- Al ser una conversion de formato, no incorpora mejoras respecto al modelo de origen; solo cambia el empaquetado y la cuantizacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-06) resulta anterior a la publicacion de esta ficha segun los metadatos, por lo que conviene verificar la vigencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/whisper-swahili-small-ggml
- Modelo de origen (ajuste fino en suajili): https://huggingface.co/PaschalK/whisper-swahili-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
