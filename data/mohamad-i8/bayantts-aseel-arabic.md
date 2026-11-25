# Mohamad-I8/BayanTTS-Aseel-Arabic

## Resumen

BayanTTS — Aseel Arabic Voices es un sistema de síntesis de voz (TTS) en árabe basado en selección de unidades (unit selection), no en redes neuronales de extremo a extremo. Lo desarrolla el usuario Mohamad-I8 y se distribuye con licencia MIT. El modelo se entrena sobre un subconjunto óptimo de 2608 locuciones de estudio extraídas del corpus `Mohamad-I8/Aseel_Arabic_Dataset`, seleccionadas para alcanzar una cobertura del 100 % de difonos (1394) y del 100 % de trifonos (12109), lo que en la práctica significa que cualquier combinación de fonos del inventario árabe tiene al menos una unidad acústica real grabada.

La relevancia de este lanzamiento está en su enfoque: frente a la tendencia de TTS neuronales (VITS, FastSpeech, XTTS), aquí se apuesta por una arquitectura clásica de concatenación de unidades con un pipeline de etiquetado acústico muy cuidado (WORLD para F0, Praat para pitch marks, alineamiento forzado híbrido MMS_FA + HMM-Viterbi). El resultado son voice packs compactos (16–105 MB) que se reproducen con un CLI en C++17 sin dependencias, lo que facilita el despliegue en entornos embebidos o sin GPU.

El repositorio ocupa 0,7 GB e incluye tres voice packs con distintos compromisos de calidad/tamaño (24 kHz completo, 16 kHz balanceado y 16 kHz compacto), todos con codificación IMA-ADPCM. El modelo está orientado exclusivamente al árabe y no se han publicado resultados de benchmarks comparativos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unit selection (concatenativa) con predictor de objetivos MLP cuantizado int8 |
| Parametros totales | no disponible (el predictor de objetivos es un MLP de ~9,3 KB; el resto es corpus de unidades) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; sintetiza por unidades) |
| Tipos de cuantizacion | MLP objetivo en int8; audio en IMA-ADPCM |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | `.bynv` (voice packs propietarios), `training_report.json`, muestras en `samples/` |

## Arquitectura y entrenamiento

El sistema sigue un paradigma de selección de unidades: dado un texto de entrada, se predice una secuencia de unidades acústicas (difonos y trifonos) y se concatenan las grabaciones reales correspondientes, aplicando modificaciones de prosodia (F0 y duración) sobre las pitch marks detectadas. El predictor de objetivos es un MLP cuantizado a int8 de aproximadamente 9,3 KB, entrenado para mapear características lingüísticas a unidades del corpus.

El pipeline de etiquetado combina varias herramientas: extracción de F0 con WORLD (DIO + refinamiento sub-Hz con StoneMask), detección de pitch marks (GCI) con Praat `To PointProcess (periodic, cc)`, y alineamiento forzado híbrido que usa MMS_FA (Meta) como anclaje neuronal en GPU (confianza media de anclaje 0,9043) seguido de un HMM-Viterbi EM de 5 pasadas con ventana de 5 ms y 30 dimensiones, más un refinamiento final de flujo espectral a 2 ms. El corpus de entrenamiento son 2608 locuciones de estudio seleccionadas para maximizar cobertura fonética, alcanzando el 100 % en difonos y trifonos.

## Capacidades

- Síntesis de voz en árabe a partir de texto (TTS) mediante concatenación de unidades.
- Cobertura fonética completa: 100 % de difonos (1394) y 100 % de trifonos (12109) del inventario del corpus.
- Tres perfiles de calidad/tamaño: 24 kHz full (104,761 MB, 189958 unidades, 980067 pitch marks), 16 kHz balanced (31,244 MB, 81006 unidades, 411193 pitch marks) y 16 kHz compact (16,188 MB, 42361 unidades, 210808 pitch marks).
- Reproducción mediante CLI en C++17 sin dependencias (`bayan_cli`), lo que permite ejecución en CPU y entornos embebidos.
- Modificación de prosodia (F0 y duración) sobre las unidades seleccionadas gracias a las pitch marks extraídas.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo thinking (no aplica a un TTS).

## Casos de uso

- Audiolibros y narración en árabe: los voice packs de 24 kHz ofrecen la máxima calidad para lectura de textos largos, con prosodia modificable para evitar la monotonía de la concatenación.
- Asistentes de voz embebidos: el voice pack compacto de 16 kHz (16 MB) y el CLI sin dependencias permiten integrar TTS en dispositivos con recursos limitados (Raspberry Pi, sistemas empotrados) sin GPU.
- Sistemas de anuncios y megafonía: el voice pack balanceado de 16 kHz (31 MB) es adecuado para síntesis en tiempo real en kioscos, transporte o comercio, donde la latencia importa más que la fidelidad absoluta.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en árabe con un motor ligero que puede ejecutarse localmente sin conexión.
- Localización de contenidos: generación de pistas de voz en árabe para vídeos, tutoriales o e-learning a partir de guiones de texto.
- Pruebas de concepto e investigación en TTS concatenativo: el repositorio incluye `training_report.json` con métricas RTF y de validación acústica, útil para reproducir y comparar pipelines de etiquetado (WORLD, Praat, MMS_FA, HMM-Viterbi).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio remite a `training_report.json` para métricas de RTF y validación acústica, pero esos valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema es concatenativo y el predictor es un MLP int8 de ~9,3 KB. La inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se requieren para inferencia. El pipeline de entrenamiento/etiquetado usó MMS_FA en GPU (no se especifica el modelo de GPU).
- ¿Cabe en GPU consumer? Sí, y también en CPU y en dispositivos embebidos; el voice pack compacto ocupa 16 MB y el completo 105 MB.
- Opciones de despliegue: `bayan_cli` (C++17, sin dependencias). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; se remite a `training_report.json` para el RTF.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BayanTTS — Aseel Arabic | Unit selection + MLP int8 | MLP ~9,3 KB + corpus de unidades | no aplica | Árabe | MIT | Hugging Face |
| XTTS v2 (Coqui) | TTS neuronal (GPT + VQ-VAE) | ~470 M (no confirmado en la información disponible) | no aplica | Multilingüe | Coqui Public Model License (no comercial) | Hugging Face |
| VITS / MMS-TTS (Meta) | TTS neuronal end-to-end | ~30–40 M (no confirmado en la información disponible) | no aplica | Multilingüe (MMS cubre árabe) | MIT / CC-BY-NC según variante | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un sistema de concatenación de unidades: la naturalidad y la prosodia pueden ser inferiores a las de TTS neuronales modernos, especialmente en frases largas o con entonación compleja.
- Cobertura limitada al inventario del corpus Aseel: aunque la cobertura de difonos y trifonos es del 100 % sobre ese corpus, palabras o fonemas fuera del inventario (préstamos, dialectos no representados) pueden sintetizarse con menor calidad.
- Solo árabe: no hay soporte multilingüe ni cambio de idioma.
- El corpus se describe como "locuciones de estudio" de un único dataset; no se documenta diversidad de hablantes, por lo que el voice pack probablemente corresponde a una sola voz (Aseel) y no a un modelo multi-hablante.
- Riesgo de artefactos de concatenación (discontinuidades espectrales) en uniones de unidades, mitigado por las pitch marks pero no eliminado.
- Licencia MIT: permite uso comercial, pero el autor no documenta garantías ni condiciones adicionales sobre el corpus original; conviene verificar los términos del dataset `Aseel_Arabic_Dataset`.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: es un proyecto reciente y con poca validación externa.
- No hay información sobre sesgos de género, edad o acento del hablante del corpus.

## Enlaces

- Hugging Face: https://huggingface.co/Mohamad-I8/BayanTTS-Aseel-Arabic
- Dataset asociado: https://huggingface.co/datasets/Mohamad-I8/Aseel_Arabic_Dataset
- WORLD vocoder: https://github.com/mmorise/World
- Praat: https://www.fon.hum.uva.nl/praat/
- MMS-FA (Meta): https://github.com/facebookresearch/fairseq/tree/main/examples/mms
