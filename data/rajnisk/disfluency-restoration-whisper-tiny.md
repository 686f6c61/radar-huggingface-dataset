# rajnisk/disfluency-restoration-whisper-tiny

## Resumen

El modelo `rajnisk/disfluency-restoration-whisper-tiny` es un ajuste fino de la arquitectura Whisper Tiny de OpenAI, publicado en Hugging Face por el usuario rajnisk. Por su identificador y por la tarea declarada en el pipeline (`automatic-speech-recognition`), el modelo está orientado a la restauración de disfluencias en transcripciones de voz, es decir, a la normalización de transcripciones ASR eliminando o corrigiendo titubeos, repeticiones y falsos inicios. Se distribuye en formato `safetensors` con 37.760.640 parámetros totales y un repositorio de 0,2 GB.

La relevancia de este modelo radica en su tamano reducido, que lo hace apto para despliegues en entornos con recursos limitados, y en su especializacion en una tarea concreta de postprocesado de ASR. Sin embargo, la model card publicada es una plantilla autogenerada por Hugging Face sin contenido sustantivo: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni resultados de evaluacion.

La informacion disponible es muy escasa. Todos los datos tecnicos que se presentan a continuacion proceden de los metadatos del repositorio y de la arquitectura base Whisper Tiny, no de documentacion del autor. Cualquier dato no confirmado se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Tiny base: 1.500 frames de audio, ~30 s por ventana) |
| Tipos de cuantizacion | no disponible (compatible con cuantizacion estandar de transformers: int8, float16, bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Tiny, un transformer encoder-decoder con atencion completa disenado originalmente para reconocimiento automatico del habla. El modelo procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel de 80 canales, y genera texto de forma autorregresiva. Con 37,7 millones de parametros, es la variante mas pequena de la familia Whisper.

No hay informacion sobre el proceso de ajuste fino: se desconoce el dataset utilizado para la restauracion de disfluencias, el numero de tokens o horas de audio de entrenamiento, la composicion del corpus, si se aplico RLHF/DPO o si se uso decodificacion especulativa. La model card no aporta ningun detalle sobre hiperparametros, regimen de entrenamiento ni infraestructura de computo. El unico indicio sobre la tarea es el nombre del modelo y el pipeline declarado.

## Capacidades

- Reconocimiento automatico del habla (ASR) en la arquitectura Whisper Tiny, presumiblemente ajustado para restauracion de disfluencias.
- Generacion de transcripciones normalizadas: por el nombre del modelo, se espera que elimine o corrija titubeos, repeticiones y falsos inicios.
- Procesamiento de audio en ventanas de hasta 30 segundos (limitacion heredada de Whisper).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad propia de un modelo ASR.
- Capacidades multilingues: no disponibles; se desconoce si el ajuste mantiene el multilingue de Whisper o se ha restringido a un idioma.
- Capacidades especiales (vision, audio adicional, thinking mode): no disponibles.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo puede integrarse como segunda etapa tras un sistema de reconocimiento de voz para limpiar titubeos y repeticiones, mejorando la legibilidad de las transcripciones antes de su publicacion o analisis.
- Generacion de subtitulos limpios: en pipelines de subtitulado automatico, el modelo puede normalizar el texto para que los subtitulos sean mas legibles y adecuados para difusion.
- Preparacion de corpus para NLP: en la construccion de datasets de texto a partir de audio (por ejemplo, para entrenar modelos de lenguaje), la restauracion de disfluencias reduce el ruido en el corpus final.
- Analisis de reuniones y entrevistas: transcripcion de conversaciones multi-turno donde los hablantes producen titubeos frecuentes, con el objetivo de obtener actas o resumenes mas limpios.
- Sistemas de accesibilidad: transcripcion en tiempo casi real para personas con discapacidad auditiva, donde un texto sin disfluencias mejora la experiencia de lectura.
- Prototipado en entornos con recursos limitados: por su tamano (0,2 GB, 37,7 M de parametros), es adecuado para pruebas de concepto en CPU o GPU de gama baja antes de escalar a modelos mayores.

En todos los casos, la idoneidad concreta no puede confirmarse sin documentacion del autor ni evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (37,7 M de parametros, ~150 MB de pesos); en float16, ~75 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad de arquitectura, vLLM, TGI, llama.cpp (via conversion a GGUF) y Ollama, aunque no hay confirmacion del autor sobre estos ultimos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rajnisk/disfluency-restoration-whisper-tiny | 37,7 M | ~30 s audio | ASR / restauracion de disfluencias | no disponible | Hugging Face |
| openai/whisper-tiny | 39 M | ~30 s audio | ASR multilingue | MIT | Hugging Face |
| openai/whisper-base | 74 M | ~30 s audio | ASR multilingue | MIT | Hugging Face |
| openai/whisper-small | 244 M | ~30 s audio | ASR multilingue | MIT | Hugging Face |

La comparativa se limita a la familia Whisper por ser la arquitectura base. No se dispone de datos de rendimiento del modelo ajustado para comparar metricas (WER, precision de restauracion) con las variantes originales.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin informacion sustantiva: no hay documentacion de sesgos, riesgos ni limitaciones declaradas por el autor.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribucion; es un riesgo legal relevante para produccion.
- Idiomas no confirmados: se desconoce si el ajuste conserva el soporte multilingue de Whisper Tiny o lo restringe a un unico idioma.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto no presente en el audio, especialmente con ruido o acentos no vistos en entrenamiento.
- Limitacion de contexto: ventanas de 30 segundos por segmento, heredada de Whisper; audios mas largos requieren segmentacion.
- Sin datos de evaluacion: no hay benchmarks que permitan estimar la calidad real de la restauracion de disfluencias frente a alternativas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-27): metadato anomalo que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/rajnisk/disfluency-restoration-whisper-tiny
- Paper de referencia de Whisper (citado en los tags, arxiv:1910.09700 corresponde al calculo de impacto ambiental de Lacoste et al., no a Whisper): https://arxiv.org/abs/1910.09700
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
