# bkupacc/whisper-large-v3-turbo-id-ct2-int8

## Resumen

Whisper large-v3-turbo-id es una adaptación al indonesio del modelo openai/whisper-large-v3-turbo (809 M de parámetros), un modelo de reconocimiento automático del habla basado en la arquitectura encoder-decoder de Whisper. Lo desarrolla Eka Tresna Irawan bajo el espacio de nombres maleo-ai, y el repositorio bkupacc/whisper-large-v3-turbo-id-ct2-int8 es una conversión a CTranslate2 en int8_float16 para su uso con faster-whisper. El ajuste fino se centró exclusivamente en el decodificador, manteniendo congelado el codificador del modelo original.

El problema que resuelve es la baja precisión del Whisper original en indonesio: el ajuste reduce el WER de 10,1 a 7,7 en Common Voice 17 id y de 7,1 a 6,4 en FLEURS id, manteniendo la velocidad del turbo. Es relevante para despliegues de ASR en indonesio sobre GPU NVIDIA, donde faster-whisper con cuantización int8 ofrece latencias de unos 298 ms por enunciado de 4 s en una Tesla T4.

El modelo conserva la ventana de contexto de audio de 30 segundos propia de Whisper y genera salida en minúsculas y sin puntuación, una decisión de diseño del entrenamiento que conviene tener en cuenta en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), decodificador ajustado, codificador congelado |
| Parametros totales | 808.878.080 (aprox. 809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s (estándar de Whisper); contexto textual de 448 tokens |
| Tipos de cuantizacion | int8_float16 (CTranslate2); pesos fp16 en safetensors |
| Idiomas soportados | indonesio (id); el modelo base soporta multilingüe, pero el ajuste se orienta a id |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) y CTranslate2 int8_float16 en ct2-int8/ |

## Arquitectura y entrenamiento

Se parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder con 809 M de parámetros en el que el codificador procesa espectrogramas de audio de 30 s y el decodificador genera tokens de texto de forma autorregresiva. En este ajuste se congeló el codificador y se entrenó únicamente el decodificador durante 3000 pasos (batch 64, learning rate 1e-5), lo que preserva las representaciones acústicas del modelo original y reduce el coste de entrenamiento.

Los datos de entrenamiento suman 284,8 horas: Common Voice 17 en indonesio, FLEURS id_id y YODAS2 id000 filtrado con large-v3-turbo (las etiquetas de YODAS son las transcripciones del propio turbo). Se aplicó aumento de datos con simulaciones de canal telefónico y códecs Opus y AAC, además de ruido, para mejorar la robustez en audio degradado. No se documenta en la información disponible el uso de RLHF ni DPO.

## Capacidades

- Transcripción de voz a texto en indonesio con salida en minúsculas y sin puntuación.
- Reconocimiento robusto en audio telefónico y comprimido (Opus, AAC) gracias al aumento de datos.
- Filtrado de voz (VAD) integrado en el flujo de faster-whisper mediante `vad_filter=True`.
- Ejecución en GPU con cuantización int8_float16 para reducir huella de memoria y latencia.
- Integración con dos ecosistemas: transformers (pipeline de ASR) y faster-whisper (CTranslate2).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en indonesio: el modelo procesa audio de hasta 30 s por ventana y faster-whisper encadena segmentos, por lo que sirve para generar actas automáticas con buena precisión en habla leída.
- Subtitulado de contenido audiovisual: la salida sin puntuación ni mayúsculas simplifica el post-procesado para formatos de subtítulos y reduce la necesidad de normalización.
- Atención al cliente con voz: al estar entrenado con aumentos de canal telefónico y códecs Opus/AAC, es adecuado para transcribir llamadas grabadas o en streaming por turnos.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la conversión a CTranslate2 int8 permite ejecutar en GPUs modestas como la T4 con un rendimiento de unos 298 ms por enunciado de 4 s.
- Investigación lingüística y creación de corpus en indonesio: útil para transcribir entrevistas y material de campo, con la advertencia de que los conjuntos de prueba son habla leída.
- Integración en aplicaciones de accesibilidad: dictado y transcripción en tiempo casi real en GPU, aunque no es apto para tiempo real en CPU pequeñas según el autor.

## Benchmarks y rendimiento

Resultados de WER / CER (%) publicados por el autor, sobre conjuntos de prueba completos, en minúsculas y sin puntuación:

| Conjunto de prueba | whisper-large-v3-turbo | whisper-large-v3-turbo-id |
|---|---|---|
| FLEURS id (684 utts) | 7,1 / 2,3 | 6,4 / 2,1 |
| Common Voice 17 id (3629 utts) | 10,1 / 3,5 | 7,7 / 2,5 |

Prueba adicional de canal telefónico / Opus / AAC con contexto corto (500 clips de CV, evaluación en el paso 2000): 9,3 WER frente a 10,8 del turbo original.

Rendimiento de inferencia: faster-whisper, int8_float16, Tesla T4, un solo flujo, enunciados de 4 s: 298 ms por enunciado (whisper-small-id: 106 ms).

## Requisitos de hardware

- VRAM estimada: con int8_float16 en CTranslate2, el modelo ocupa aproximadamente 1 GB de pesos; el consumo total depende del tamaño de lote y del VAD, pero cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: Tesla T4 (medición oficial del autor), así como A100, L4 o RTX 4090 para mayor throughput.
- GPU de consumo: sí, cabe en tarjetas con 6-8 GB de VRAM o más; la cuantización int8 reduce el requisito frente a fp16.
- Despliegue: faster-whisper con CTranslate2 (recomendado por el autor), transformers con pipeline de ASR; no se documenta soporte nativo de vLLM, TGI ni Ollama en la información disponible.
- Latencia: 298 ms por enunciado de 4 s en Tesla T4 con un solo flujo (int8_float16).
- CPU: el autor indica que es demasiado pesado para tiempo real en CPUs pequeñas y recomienda los hermanos whisper-small-id, base-id o tiny-id para edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-id | 809 M | 30 s | indonesio (ajustado) | MIT | Hugging Face, CTranslate2 |
| whisper-large-v3-turbo (OpenAI) | 809 M | 30 s | multilingüe | MIT | Hugging Face, transformers |
| whisper-small-id | no disponible | 30 s | indonesio | no disponible | Hugging Face (maleo-ai) |
| whisper-tiny-id / base-id | no disponible | 30 s | indonesio | no disponible | Hugging Face (maleo-ai) |

Frente al turbo original, la variante id mejora el WER en indonesio (7,7 frente a 10,1 en Common Voice 17) con el mismo tamaño. Frente a los hermanos pequeños, ofrece mayor precisión a costa de latencia (298 ms frente a 106 ms de whisper-small-id en T4).

## Limitaciones y advertencias

- Salida en minúsculas y sin puntuación: requiere post-procesado si se necesita texto con formato natural.
- Los conjuntos de prueba son habla leída; el habla conversacional será más difícil, según el propio autor.
- Demasiado pesado para tiempo real en CPUs pequeñas; para edge hay que recurrir a variantes small, base o tiny.
- El ajuste es específico de indonesio; el rendimiento en otros idiomas no está documentado y probablemente degrade respecto al modelo base.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio o ruido; conviene usar VAD y revisar transcripciones críticas.
- No se documentan análisis de sesgos en la información disponible.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución al autor y al modelo base.
- El repositorio bkupacc/whisper-large-v3-turbo-id-ct2-int8 tiene 0 descargas y 0 likes; es una conversión de terceros, no el repositorio oficial del autor, por lo que conviene verificar la integridad de los pesos.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/bkupacc/whisper-large-v3-turbo-id-ct2-int8
- Repositorio oficial del modelo: https://huggingface.co/maleo-ai/whisper-large-v3-turbo-id
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Código: https://github.com/porcupine-md/whisper-id
- Variante small: https://huggingface.co/maleo-ai/whisper-small-id
- Variante base: https://huggingface.co/maleo-ai/whisper-base-id
- Variante tiny: https://huggingface.co/maleo-ai/whisper-tiny-id
