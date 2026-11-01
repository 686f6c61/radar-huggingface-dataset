# OthmaneW/tachelhit-asr

## Resumen

Tachelhit ASR es un proyecto de reconocimiento automático de voz (ASR) y traducción de voz para el tachelhit (también llamado tashelhit o souss amazigh, código ISO `shi`), una lengua bereber hablada principalmente en el sur de Marruecos. Lo desarrolla OthmaneW y se plantea como un fine-tuning de `openai/whisper-small` sobre datos abiertos existentes, con el objetivo de cubrir una lengua de bajos recursos que apenas cuenta con sistemas de voz publicados.

El proyecto está en fase de desarrollo y, en el momento de redactar esta ficha, no dispone de pesos entrenados: la model card indica explícitamente "Work in progress — no trained weights yet". Se estructura en dos fases: la fase A aborda el reconocimiento de voz en tachelhit con salida en texto árabe, y la fase B aspira a publicar el primer benchmark abierto de transcripción en tachelhit, con ortografía latina IRCAM y escritura tifinag derivada automáticamente.

Su relevancia radica en el carácter de bajos recursos del tachelhit y en la escasez de herramientas ASR abiertas para lenguas amaziges. Al partir de Whisper small (un modelo de aproximadamente 244 millones de parámetros) y de datasets abiertos con licencias permisivas, el proyecto es reproducible y de bajo coste computacional, lo que facilita su adopción por parte de investigadores y desarrolladores interesados en lenguas minorizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), fine-tuning de `openai/whisper-small` |
| Parametros totales | no disponible (el modelo base Whisper small tiene aproximadamente 244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | `shi` (tachelhit), `ar` (arabe) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos publicados; el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado originalmente para ASR multilingüe y traducción de voz. El proyecto parte de la variante `whisper-small` y aplica un fine-tuning supervisado sobre datos de voz en tachelhit. La model card no detalla hiperparámetros, número de tokens de audio, composición exacta del dataset ni si se emplearon técnicas de aumento de datos o regularización.

Los datos de entrenamiento declarados son dos conjuntos abiertos: `SoufianeDahimi/Tamazight-ASR-Dataset-v2` (licencia Apache-2.0) y `Ma-OpenHub/Tutlait-v1` (licencia CC-BY-4.0), este último con acento del Souss. El entrenamiento se realizó en una única GPU AMD Radeon RX 9060 XT de 16 GB con ROCm, lo que sitúa el coste computacional en el rango de consumer. No se especifica si hubo etapas de alineación, RLHF o DPO; dado el carácter ASR del modelo, lo habitual sería entrenamiento supervisado con pérdida CTC o cross-entropy sobre tokens de texto.

## Capacidades

- Reconocimiento automático de voz en tachelhit con salida en texto árabe (fase A del proyecto).
- Traducción de voz (speech translation) tachelhit → árabe, según la etiqueta `speech-translation` de la model card.
- Soporte previsto de dos sistemas de escritura para la fase B: latino IRCAM y tifinag derivado automáticamente.
- Capacidades multilingües limitadas a `shi` y `ar` según los metadatos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio más allá del propio pipeline ASR.

## Casos de uso

- Transcripción de audio en tachelhit para archivos orales y patrimonio inmaterial: el modelo permitiría convertir grabaciones de tradición oral, entrevistas y material etnográfico en texto árabe, facilitando su catalogación y búsqueda.
- Subtitulado automático de contenido audiovisual en tachelhit: útil para radios y televisiones regionales del Souss que emiten en esta lengua y necesitan subtítulos en árabe para audiencias no familiarizadas.
- Investigación lingüística de bajos recursos: al publicarse un benchmark abierto en fase B, el modelo serviría como línea base para comparar futuros sistemas ASR en lenguas amaziges.
- Atención al ciudadano en servicios públicos: un pipeline ASR tachelhit → árabe podría integrarse en sistemas de transcripción de llamadas o mostradores para administraciones con población tachelhitohablante.
- Accesibilidad: transcripción de voz a texto para personas con discapacidad auditiva en comunidades donde el tachelhit es la lengua vehicular.
- Documentación clínica o legal en zonas rurales: dictado de notas en tachelhit con salida en árabe para su posterior revisión por personal que no domina la lengua.
- Evaluación comparativa de modelos ASR multilingües: el proyecto ofrece un caso de estudio reproducible de fine-tuning de Whisper en una lengua de bajos recursos con hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Results: Coming soon", por lo que no existen métricas de WER, CER ni de traducción para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este modelo concreto; para `whisper-small` en fp16 se estiman en torno a 1-2 GB, y en cuantización int8 aproximadamente 0,5-1 GB.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizó en una AMD Radeon RX 9060 XT de 16 GB con ROCm.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, dado el tamaño del modelo base.
- Opciones de despliegue: no documentadas para este modelo. Para Whisper en general son habituales `transformers`, `faster-whisper`, `whisper.cpp`, `vLLM` (soporte limitado de audio) y `Ollama` (no soporta audio de forma nativa).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| Tachelhit ASR (este proyecto) | no disponible (base ~244 M) | no disponible (ventanas de 30 s) | shi, ar | MIT | No (en desarrollo) |
| openai/whisper-small | ~244 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT | Sí |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingüe | MIT | Sí |
| Modelos ASR específicos para amazige | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo porque el modelo no ha publicado benchmarks ni pesos.

## Limitaciones y advertencias

- El modelo no tiene pesos entrenados publicados: no es utilizable en producción en su estado actual.
- No hay métricas de calidad (WER, CER) publicadas, por lo que se desconoce su precisión real.
- El alcance lingüístico se limita a tachelhit y árabe; no cubre otras variedades amaziges (cabilio, rifeño, tamazight del Atlas Medio).
- La salida en fase A es texto árabe, lo que puede no satisfacer a usuarios que prefieran ortografía latina IRCAM o tifinag; la fase B aún no está implementada.
- Riesgo de sesgo derivado de los datasets de entrenamiento: el acento del Souss está representado, pero otras variantes dialectales pueden tener cobertura desigual.
- Riesgo de alucinación típico de los modelos Whisper en segmentos de silencio o ruido, especialmente en lenguas de bajos recursos.
- La licencia MIT del repositorio no exime de respetar las licencias de los datasets de entrenamiento (Apache-2.0 y CC-BY-4.0) en caso de redistribución.
- No se documentan limitaciones de contexto más allá de la ventana estándar de Whisper (30 s por segmento).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OthmaneW/tachelhit-asr
- Repositorio del proyecto: https://github.com/OthmaneW37/tachelhit-asr
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset SoufianeDahimi/Tamazight-ASR-Dataset-v2: https://huggingface.co/datasets/SoufianeDahimi/Tamazight-ASR-Dataset-v2
- Dataset Ma-OpenHub/Tutlait-v1: https://huggingface.co/datasets/Ma-OpenHub/Tutlait-v1
