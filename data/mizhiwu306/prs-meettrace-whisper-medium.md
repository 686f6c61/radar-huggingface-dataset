# Mizhiwu306/prs-meettrace-whisper-medium

## Resumen

MeetTrace Whisper medium es un paquete de inferencia publicado por el usuario Mizhiwu306 que combina un ajuste fino completo de OpenAI Whisper medium (769 millones de parámetros) para transcripción de reuniones en inglés, junto con un modelo de alineación acústica basado en wav2vec2-large-robust-ft-libri-960h de Meta FAIR. El repositorio no es un checkpoint único de Transformers, sino un bundle de 20 activos (pesos, procesadores y licencias) más un fichero `bundle.json` que fija versiones, políticas de decodificación y hashes SHA-256 para su verificación en tiempo de carga. El tamaño total del repositorio es de aproximadamente 4,3 GB.

El problema que aborda es la transcripción de reuniones con micrófono lejano (Array1-01 del corpus AMI), un escenario caracterizado por solapamiento de habla, ruido y distancias largas entre hablante y micrófono, donde los modelos ASR genéricos degradan notablemente. El ajuste fino se realizó sobre 32 reuniones del AMI Meeting Corpus (series ES2002, ES2005, ES2006, ES2007, IS1000, IS1001, TS3005 y TS3008), con ventanas de audio seguras a nivel de palabra de hasta 30 segundos.

Su relevancia es acotada: se trata de un artefacto de investigación orientado a la integración con el runtime MeetTrace, no de un modelo de propósito general. No se publican métricas agregadas de precisión y el autor declara explícitamente que las comprobaciones de integración funcional no establecen calidad de transcripción. La licencia Apache-2.0 de los modelos base facilita la reutilización, pero los datos AMI subyacentes tienen atribución CC BY 4.0 independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) + CTC wav2vec2 para alineación |
| Parametros totales | 769 millones (ASR); wav2vec2-large-robust-ft-libri-960h adicional para alineación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas externas de 30 segundos (configuración del runtime MeetTrace) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ASR ~3,055 GB; alineación ~1,262 GB) |

## Arquitectura y entrenamiento

El componente ASR es un fine-tune completo de Whisper medium, conservando la arquitectura y el procesador/tokenizer base. Whisper emplea un encoder-decoder Transformer con atención estándar y procesa audio en ventanas de 30 segundos; el ajuste se realizó sobre el subconjunto expandido de AMI descrito (32 reuniones, micrófono lejano Array1-01, PCM16 mono a 16 kHz). El preprocesado usa ventanas que respetan límites de palabra, retiene palabras léxicas originales incluyendo solapamiento y descarta ventanas completamente vacías o no supervisadas, con escalado PCM16 sin ajuste de ganancia. El checkpoint seleccionado corresponde a la actualización 252 del entrenamiento, elegido mediante conteos de errores de palabra sobre IS1008 v5-control; el autor indica que los grupos de auditoría y regresión no se usaron para esta selección.

El componente de alineación es wav2vec2-large-robust-ft-libri-960h sin modificar (revisión fija `5d28473cc25ef7b338c9f731fe55626c4b082f58`), que aporta evidencia acústica CTC para alinear el texto ya producido por el ASR con los límites temporales del audio. No es un modelo ASR independiente en este bundle, sino un apoyo para forzar la alineación global. El runtime MeetTrace aplica controles de decodificación finita sin referencia (v5) y verifica tamaño y SHA-256 de cada activo antes de publicar el bundle local; la generación directa con Transformers no reproduce estos controles ni el comportamiento de alineación.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de reuniones con micrófono lejano.
- Procesamiento de ventanas de audio de hasta 30 segundos con continuidad entre ventanas gestionada por el runtime.
- Alineación global de palabras mediante CTC con wav2vec2, preservando identidad y orden de las palabras del ASR.
- Integración con el runtime MeetTrace: carga de bundle con verificación de hashes y funcionamiento offline con bundles locales ya validados.
- Uso directo del subconjunto `asr` mediante `WhisperProcessor` y `WhisperForConditionalGeneration` de Transformers.
- No incluye identificación de hablante ni modelo de resumen; los activos de VAD y diarización se distribuyen por separado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidades multilingües no evaluadas para este fine-tune; solo se declara inglés.

## Casos de uso

- Transcripción de reuniones corporativas en inglés: el ajuste sobre AMI con micrófono lejano lo hace adecuado para salas de conferencia donde el audio llega con reverberación y solapamiento, usando ventanas de 30 segundos gestionadas por MeetTrace.
- Investigación en ASR de reuniones: sirve como checkpoint de partida para experimentos sobre el corpus AMI, con la ventaja de que el bundle fija revisiones y hashes reproducibles.
- Generación de subtítulos con marcas temporales aproximadas: la alineación CTC con wav2vec2 permite obtener límites de palabra, aunque el autor advierte que "aligned" no implica probabilidad calibrada ni garantía de límite correcto.
- Integración en pipelines de actas automáticas: el texto transcrito puede alimentar etapas posteriores (resumen, extracción de acciones) que el usuario debe aportar por separado, ya que el bundle no incluye modelos de resumen.
- Evaluación comparativa de decodificación: los controles v5 sin referencia permiten estudiar el efecto de políticas de decodificación fijas sobre la calidad de transcripción en dominios de reunión.
- Despliegue offline en entornos con requisitos de reproducibilidad: la verificación SHA-256 de cada activo y el funcionamiento con bundles locales validados encajan en entornos donde no se permite descarga dinámica de pesos.
- Prototipado de sistemas de búsqueda sobre audio de reuniones: la transcripción alineada facilita indexar fragmentos por palabra y recuperar el instante correspondiente en la grabación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que esta release no reclama ninguna métrica agregada de precisión ni resultado de benchmark, y que las comprobaciones de integración funcional no establecen calidad de transcripción, precisión de hablante, precisión de timestamps ni rendimiento en otro hardware o idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos (ASR ~3,055 GB en fp32, alineación ~1,262 GB), se necesita al menos una GPU con 8-10 GB de VRAM en fp32 para cargar ambos modelos, y menos si se convierte a fp16 (no documentado por el autor).
- GPU recomendadas: no disponible en la información proporcionada. El runtime MeetTrace requiere sus dependencias CUDA documentadas, pero no se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más (RTX 3060/4060 en adelante), aunque el autor no lo confirma ni publica cifras de latencia o throughput.
- Opciones de despliegue: Transformers (cargando el subconjunto `asr` con `WhisperForConditionalGeneration`), runtime MeetTrace propietario del proyecto, y verificación de bundles locales offline. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Mizhiwu306/prs-meettrace-whisper-medium | 769 M (ASR) + wav2vec2 para alineación | Ventanas de 30 s (runtime) | Inglés | Apache-2.0 | Fine-tune sobre AMI con micrófono lejano; sin benchmarks publicados |
| openai/whisper-medium | 769 M | Ventanas de 30 s | Multilingüe | Apache-2.0 | Modelo base; sin ajuste específico a reuniones ni bundle de alineación |
| openai/whisper-large-v3 | 1,55 mil millones | Ventanas de 30 s | Multilingüe | Apache-2.0 | Mayor tamaño y cobertura idiomática; no ajustado a AMI |
| facebook/wav2vec2-large-robust-ft-libri-960h | ~317 M | Audio continuo (CTC) | Inglés | Apache-2.0 | Empleado aquí solo como alineador, no como ASR principal |

La comparación de rendimiento con alternativas no está disponible: el autor no publica métricas y no se han encontrado evaluaciones independientes de este checkpoint.

## Limitaciones y advertencias

- No se reclama ninguna métrica agregada de precisión ni benchmark; la calidad de transcripción no está establecida por el autor.
- El ASR puede omitir, repetir o alucinar palabras, especialmente con audio lejano, ruido, solapamiento de habla o silencios. Se recomienda revisar las salidas importantes contra el audio.
- La alineación preserva identidad y orden de las palabras del ASR, pero no puede recuperar palabras perdidas; "aligned" significa que un candidato pasó compuertas acústicas congeladas, no una probabilidad calibrada. Pueden persistir offsets largos y, si la alineación falla, ambos límites quedan nulos.
- Solo se declara y evalúa inglés; otros idiomas y usos de alto riesgo no han sido evaluados para este fine-tune.
- El bundle no incluye identificación de hablante ni resumen; los activos de VAD y diarización se entregan por separado.
- El repositorio raíz no es un checkpoint de Transformers único: contiene dos familias de modelos y requiere cargar el subconjunto `asr` con la revisión inmutable completa.
- La generación directa con Transformers no implementa los controles de decodificación v5 ni la alineación de MeetTrace, por lo que los resultados pueden diferir del runtime previsto.
- El entrenamiento usa solo 32 reuniones de AMI con un único canal de micrófono lejano (Array1-01); no es el benchmark AMI completo y puede no generalizar a otras condiciones de captura.
- Licencia Apache-2.0 para los pesos, pero los datos AMI subyacentes tienen atribución CC BY 4.0 independiente; el corpus y las anotaciones no se redistribuyen en el repositorio.
- Riesgo de sesgos: no documentado por el autor; al entrenar solo con AMI (reuniones en inglés de un dominio acotado), es esperable un sesgo de dominio y de acento no cuantificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mizhiwu306/prs-meettrace-whisper-medium
- Modelo base Whisper medium (revisión fija): https://huggingface.co/openai/whisper-medium/tree/abdf7c39ab9d0397620ccaea8974cc764cd0953e
- Modelo de alineación wav2vec2 (revisión fija): https://huggingface.co/facebook/wav2vec2-large-robust-ft-libri-960h/tree/5d28473cc25ef7b338c9f731fe55626c4b082f58
- Corpus AMI, descarga y licencias: https://groups.inf.ed.ac.uk/ami/download/
- Corpus AMI, sitio principal: https://groups.inf.ed.ac.uk/ami/corpus/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
