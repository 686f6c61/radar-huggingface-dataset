# Phoonnx/glowtts-en-us-cmu_ljm

## Resumen

`Phoonnx/glowtts-en-us-cmu_ljm` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado para su uso con la librería `phoonnx`. Se trata de una exportación de una voz concreta del proyecto GlowTTS, identificada como `larynx/en-us-cmu_ljm-glow_tts`, orientada a la síntesis de habla en inglés estadounidense. El modelo procede del repositorio agregador `Phoonnx/phoonnx-glowtts`, del que este repositorio constituye únicamente la carpeta `en-us-cmu_ljm` con las rutas de ficheros originales preservadas.

GlowTTS es una arquitectura de síntesis neuronal basada en flujos normalizadores (normalizing flows) con alineamiento monotónico, un diseño que prioriza la eficiencia de inferencia frente a los modelos autorregresivos. Su empaquetado en ONNX y su integración en `phoonnx` lo hacen relevante para desarrolladores que necesitan un motor TTS ligero, portable y ejecutable sin dependencias de frameworks de deep learning pesados, aunque la información publicada sobre este artefacto concreto es mínima.

El repositorio tiene un tamaño de 0,1 GB y no registra descargas ni interacciones en el momento de la consulta. La model card no aporta detalles sobre arquitectura interna, datos de entrenamiento, parámetros ni métricas de calidad; la mayor parte de los datos técnicos de esta ficha se infieren de la familia GlowTTS y del ecosistema Larynx/phoonnx, y se marcan como no disponibles cuando no pueden confirmarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flow con alineamiento monotónico), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (el artefacto distribuido es ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (en-US), según el identificador de la voz |
| Licencia | `other` (sin licencia concreta especificada en la carpeta) |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | `phoonnx` |
| Pipeline | text-to-speech |
| Identificador de voz | `larynx/en-us-cmu_ljm-glow_tts` |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz no autorregresivo que combina un encoder de texto con un decoder basado en flujos normalizadores invertibles y un mecanismo de alineamiento monotónico que aprende la correspondencia entre fonemas y frames de audio sin necesidad de attention autorregresiva. Este diseño permite una inferencia paralela y rápida, adecuada para despliegues de baja latencia. El artefacto aquí publicado es la exportación ONNX de una voz concreta (identificada como `cmu_ljm`, presumiblemente derivada de un corpus CMU y de la voz `ljm` del ecosistema Larynx), pero la model card no documenta el número de parámetros, la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron etapas de ajuste fino o alineamiento forzado adicionales.

Tampoco se especifican en la información disponible los detalles del proceso de exportación a ONNX (versión de opset, optimizaciones aplicadas, precisión de los tensores) ni las características del vocoder asociado, que en la familia GlowTTS suele ser un modelo separado (habitualmente HiFi-GAN u otro generador neuronal). Cualquier afirmación sobre estos extremos requeriría consultar el repositorio agregador `Phoonnx/phoonnx-glowtts` o el proyecto original de Larynx.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de audio en formato waveform mediante el pipeline `text-to-speech` de la librería `phoonnx`.
- Inferencia no autorregresiva, lo que permite generar utterances completas en paralelo.
- Ejecución mediante runtime ONNX, sin necesidad de PyTorch u otros frameworks de entrenamiento en producción.
- Integración con el ecosistema `phoonnx` a través del identificador de voz `larynx/en-us-cmu_ljm-glow_tts`.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo, tool calling ni razonamiento; no disponibles.

## Casos de uso

- Lectura de artículos y contenido web: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando su ejecución ligera en ONNX y su reducido tamaño de repositorio (0,1 GB).
- Asistentes de voz embebidos: al ejecutarse sobre runtime ONNX, puede integrarse en dispositivos con recursos limitados o en aplicaciones de escritorio que necesiten síntesis local sin llamadas a la nube.
- Generación de avisos y notificaciones habladas: adecuado para sistemas de megafonía, domótica o alertas de aplicaciones que requieran frases cortas en inglés estadounidense con baja latencia.
- Audiolibros y podcasts automatizados: permite narrar textos largos dividiéndolos en fragmentos y sintetizando cada uno con la misma voz (`cmu_ljm`), manteniendo consistencia tímbrica.
- Pruebas y prototipado de pipelines TTS: sirve como voz de referencia en el ecosistema `phoonnx` para validar integraciones, comparar latencias o construir demos antes de adoptar voces comerciales.
- Sistemas de respuesta interactiva de voz (IVR): puede generar mensajes pregrabados dinámicamente en inglés para centralitas telefónicas o bots de atención, siempre que la licencia final lo permita.
- Accesibilidad en interfaces: lectura de notificaciones, correos o mensajes de chat para usuarios con discapacidad visual en aplicaciones de escritorio o móviles con runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MOS, MCD, WER de ASR sobre audio sintetizado), latencias medidas ni comparaciones con otras voces. El repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento observado por la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,1 GB) sugiere un modelo compacto que probablemente quepa en GPU consumer con varios GB libres, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; al ser un artefacto ONNX, puede ejecutarse en CPU y en GPU mediante los execution providers de ONNX Runtime (CUDA, DirectML, CoreML, etc.).
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el tamaño del repositorio, aunque no se documenta el consumo real de memoria durante la inferencia.
- Opciones de despliegue: librería `phoonnx` (integración nativa) y ONNX Runtime en cualquiera de sus backends. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles; no se publican mediciones de RTF (real-time factor) ni de tokens de audio por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/glowtts-en-us-cmu_ljm` | GlowTTS (ONNX) | en-US | ONNX | `other` (sin especificar) | 0,1 GB | Hugging Face |
| Piper (voces en-US) | VITS (ONNX) | en-US | ONNX | MIT (mayoría de voces) | ~20-60 MB por voz | Hugging Face / GitHub |
| Larynx (voces en-US) | GlowTTS / VITS (TF/TFLite) | en-US | TFLite / TF | MPL 2.0 (proyecto) | variable | GitHub / Hugging Face |
| Coqui TTS (voces en-US) | Tacotron2 / VITS / GlowTTS | en-US y otros | PyTorch | MPL 2.0 (código), licencias variables por voz | variable | GitHub / Hugging Face |

La comparación se limita a alternativas del mismo nicho (TTS ligero y local). No se dispone de datos de rendimiento comparado (MOS, latencia) para este artefacto concreto, por lo que la tabla solo refleja características estructurales y de licencia.

## Limitaciones y advertencias

- La licencia es `other` y la model card no especifica qué licencia concreta aplica a esta carpeta; no se puede asumir uso comercial sin consultar al autor o al repositorio agregador.
- Solo se documenta inglés estadounidense; no hay evidencia de soporte multilingüe.
- No se publican métricas de calidad de síntesis (MOS, inteligibilidad) ni evaluaciones de sesgo o robustez.
- Riesgo de errores de pronunciación en nombres propios, siglas o palabras fuera del vocabulario del corpus de entrenamiento, habitual en sistemas TTS basados en fonemas.
- Al ser un modelo no autorregresivo con alineamiento monotónico, puede presentar artefactos en textos muy largos o con puntuación atípica si no se segmentan adecuadamente.
- El repositorio no registra descargas ni uso comunitario, por lo que no hay validación externa de su comportamiento en producción.
- No se documenta el vocoder asociado ni los requisitos exactos de `phoonnx` (versión, dependencias), lo que puede complicar la reproducibilidad.
- La fecha de creación indicada (2026-11-14) es posterior a la consulta habitual de datos; conviene verificar la integridad del repositorio antes de adoptarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/glowtts-en-us-cmu_ljm)
- [Repositorio agregador Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
