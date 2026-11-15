# Phoonnx/fastpitch-coqui-vctk-fastpitch

## Resumen

`fastpitch-coqui-vctk-fastpitch` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de un subconjunto extraído del repositorio agregado `Phoonnx/phoonnx-fastpitch`, concretamente de la carpeta `coqui-vctk-fastpitch`, y está empaquetado en formato ONNX para su uso con la librería `phoonnx` (desarrollada por TigreGotico). El modelo se distribuye como un artefacto de inferencia listo para consumir, no como un checkpoint de entrenamiento documentado.

La arquitectura subyacente es FastPitch, un modelo acústico no autorregresivo basado en transformer que predice espectrogramas mel a partir de texto, originalmente popularizado en el ecosistema Coqui TTS. El nombre sugiere que fue entrenado sobre el corpus VCTK (voces en inglés con acento británico), aunque la model card no aporta detalles sobre datos, hiperparámetros ni proceso de entrenamiento. El repositorio ocupa 0,2 GB, lo que es coherente con un modelo acústico de tamaño moderado más sus ficheros de configuración y vocabulario.

Su relevancia es limitada y muy específica: sirve como pieza de un pipeline TTS dentro de `phoonnx`, no como modelo de propósito general. No tiene descargas ni likes en el momento de la ficha, no declara idiomas soportados y su licencia figura como `other` sin especificar términos, lo que condiciona cualquier uso comercial. Es, en la práctica, un artefacto de integración para quien ya trabaje con el stack de Phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (modelo acústico transformer no autorregresivo, formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud se mide en fonemas/caracteres de entrada, no especificada) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el nombre sugiere inglés por VCTK, sin confirmación en la model card) |
| Licencia | other (sin términos especificados) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,2 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Voice id | `coqui/en-vctk-fast_pitch` |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de síntesis de voz propuesta en 2020 que sustituye el decodificador autorregresivo de Tacotron 2 por un decoder basado en transformer con alineamiento por duración explícita. Predice un espectrograma mel a partir de una secuencia de fonemas, y habitualmente se combina con un vocoder neuronal (HiFi-GAN u otro) para generar la forma de onda final. El modelo aquí publicado es la variante acústica empaquetada en ONNX, presumiblemente extraída de un entrenamiento con Coqui TTS sobre el corpus VCTK.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, el vocoder asociado ni si se aplicaron técnicas de refinamiento como RLHF o DPO (poco habituales en TTS). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de FastPitch. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), con salida de audio generada por el vocoder que acompañe al pipeline en `phoonnx`.
- Predicción de espectrograma mel con alineamiento por duración explícita, lo que permite control de velocidad y duración por fonema si la implementación lo expone.
- Integración nativa con la librería `phoonnx` mediante el voice id `coqui/en-vctk-fast_pitch`.
- Ejecución en formato ONNX, apta para despliegue con ONNX Runtime en CPU o GPU.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo ni tool calling; es un modelo puramente acústico.
- No soporta agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Lectura de artículos y contenido web: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o podcasts automatizados, siempre que se integre con el vocoder y el frontend fonético de `phoonnx`.
- Asistentes de voz embebidos: al distribuirse en ONNX y ocupar 0,2 GB, es viable ejecutarlo en dispositivos con recursos limitados (Raspberry Pi, móviles) mediante ONNX Runtime, generando respuestas habladas en local.
- Audiolibros y narración de documentos: útil para pipelines por lotes que convierten grandes volúmenes de texto en audio, con la ventaja de no depender de servicios en la nube.
- Pruebas de integración en el ecosistema Phoonnx: sirve como modelo de referencia para validar el pipeline TTS de la librería antes de sustituirlo por voces de mayor calidad.
- Sistemas de anuncios automáticos: generación de avisos pregrabados en aplicaciones de transporte, comercio o industria, donde la naturalidad no es crítica y prima la latencia baja del decoder no autorregresivo.
- Investigación en TTS: como punto de partida para estudiar el comportamiento de FastPitch en ONNX, comparar vocoders o medir latencias en distintos hardwares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,2 GB) y la naturaleza de FastPitch, cabe esperar un consumo inferior a 1 GB en FP32, aunque no se documenta.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 3060 en adelante, A100, H100) es sobredimensionada para este modelo; el cuello de botella real suele estar en el vocoder.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), integración con `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| fastpitch-coqui-vctk-fastpitch | FastPitch (ONNX) | Texto/fonemas, longitud no especificada | other (sin términos) | Hugging Face, 0 descargas |
| Coqui TTS FastPitch (original) | FastPitch + vocoder | Texto/fonemas | MPL 2.0 (Coqui TTS) | GitHub Coqui, ampliamente usado |
| Piper (rhasspy) | VITS (ONNX) | Texto, frases cortas | MIT (mayoría de voces) | Hugging Face, muy popular |
| VITS multilingüe (Coqui) | VITS | Texto | MPL 2.0 | Hugging Face |

La comparativa es aproximada: no hay datos de rendimiento publicados para este artefacto concreto. Frente a Piper, la diferencia clave es la licencia (`other` frente a MIT en muchas voces) y la falta de documentación; frente al FastPitch original de Coqui, este es un subconjunto ONNX sin garantías de reproducibilidad.

## Limitaciones y advertencias

- Licencia `other` sin términos especificados: no se puede asumir uso comercial sin contactar con el autor o consultar el repositorio origen.
- Ausencia total de documentación sobre datos de entrenamiento, idioma, vocoder asociado y métricas: difícil de evaluar en producción.
- El nombre sugiere inglés (VCTK), pero la model card no lo confirma; usar con otros idiomas puede producir resultados incorrectos.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar artefactos, pronunciaciones erróneas o ruidos en fonemas no vistos durante el entrenamiento.
- Sesgos de voz: al derivar de VCTK, la distribución de hablantes y acentos está limitada al corpus original; no hay información sobre diversidad de voces.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- Dependencia de la librería `phoonnx` y de un vocoder externo: el modelo por sí solo no produce audio final.
- Fecha de creación futura (2026-11-14) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/fastpitch-coqui-vctk-fastpitch
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-fastpitch
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Paper de FastPitch: no disponible en la información proporcionada
- Coqui TTS: no disponible en la información proporcionada
