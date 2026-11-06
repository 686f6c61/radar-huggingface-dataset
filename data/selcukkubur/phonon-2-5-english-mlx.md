# selcukkubur/Phonon-2.5-English-mlx

## Resumen

Phonon-2.5-English-mlx es una conversión de formato del modelo de reconocimiento automático del habla (ASR) FermionResearch/Phonon-2.5-English, que a su vez es una compresión con cuantización consciente de cinco valores del checkpoint nvidia/parakeet-tdt-0.6b-v3. El modelo resultante, publicado por el usuario selcukkubur, empaqueta los pesos en un único archivo `model.safetensors` con 264 bloques empaquetados de cinco valores y 9 tablas int6, adaptados al layout que espera una implementación MLX de Parakeet. No se ha reentrenado ningún peso: la conversión es puramente de formato y de renombrado de tensores.

Con 181.269.062 parámetros reales y un tamaño de repositorio de 0,2 GB, el modelo está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX, lo que lo hace relevante para desarrolladores que quieran desplegar ASR en inglés en local sin depender de CUDA. La arquitectura subyacente es Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, un modelo transducer con decodificación conjunta de tokens y duraciones.

La relevancia actual del modelo radica en su estrategia de compresión: en lugar de cuantización estándar de 4 u 8 bits, emplea una representación de cinco valores que reduce el peso del checkpoint original de 0,6B parámetros a un archivo manejable en memoria unificada de equipos de consumo. La licencia CC-BY-4.0 permite uso comercial con atribución, si bien esta obligación recae tanto en FermionResearch como en NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), transformer encoder-decoder con predictor de duración |
| Parámetros totales | 181.269.062 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Empaquetado de cinco valores (264 bloques) más 9 tablas int6; resto en float16 |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 (pesos); Apache-2.0 (código lector) |
| Formato de pesos | safetensors (MLX layout) |

## Arquitectura y entrenamiento

El modelo base es nvidia/parakeet-tdt-0.6b-v3, un sistema ASR de tipo Token-and-Duration Transducer. En esta familia, un encoder transforma la señal acústica en representaciones latentes y un decoder transducer predice conjuntamente tokens de texto y duraciones, lo que permite un alineamiento implícito sin necesidad de un modelo de alineamiento externo ni de CTC. FermionResearch aplicó sobre ese checkpoint una compresión con cuantización consciente de cinco valores, y selcukkubur ha realizado únicamente la conversión de formato a MLX, renombrando tensores y preservando los bits empaquetados de forma literal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO; la model card del repositorio de conversión indica explícitamente que no se ha reentrenado nada. La innovación técnica destacable es el esquema de empaquetado de cinco valores con tablas int6 auxiliares, descrito en los metadatos del propio safetensors (`phonon_packed`, `phonon_int6`), que permite reducir el tamaño del checkpoint manteniendo la fidelidad bit a bit respecto a la implementación de referencia de Fermion.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio.
- Transcripción con alineamiento temporal implícito gracias al predictor de duración del transducer.
- Ejecución en Apple Silicon mediante MLX, con memoria unificada.
- Inferencia local sin dependencia de CUDA ni de servicios en la nube.
- Compatible con implementaciones MLX de Parakeet que lean el layout NeMo/MLX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni modo thinking.
- Multilingüismo limitado al inglés; para 25 idiomas existe la conversión de FermionResearch/Phonon-2.5.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar audio de voz en inglés en un Mac con Apple Silicon, manteniendo los datos en el dispositivo y evitando el envío de grabaciones a servicios externos.
- Subtitulado automático de vídeo: al producir alineamiento temporal implícito mediante el predictor de duración, resulta adecuado para generar subtítulos sincronizados en pipelines de postproducción.
- Dictado por voz en aplicaciones de escritorio: su tamaño de 0,2 GB y su formato MLX permiten integrarlo como componente de un editor de texto o IDE que transcriba dictado en inglés con baja latencia.
- Asistentes de voz embebidos: puede actuar como front-end ASR en un asistente local que combine transcripción con un LLM posterior, todo ejecutado en el mismo equipo.
- Procesamiento por lotes de archivos de audio: la inferencia MLX permite transcribir carpetas de grabaciones en inglés de forma desatendida en estaciones de trabajo Apple.
- Investigación en compresión de modelos: sirve como caso de estudio reproducible de cuantización consciente de cinco valores aplicada a un transducer ASR, comparando la fidelidad de la conversión con la implementación de referencia.
- Prototipado de aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones en inglés para personas con dificultades auditivas, ejecutándose íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que FermionResearch publica sus propias cifras de WER para Phonon-2.5 English, pero que no se reproducen en este repositorio y no son reclamadas por él. La verificación realizada en esta conversión es de fidelidad respecto a la implementación de referencia (cada tensor empaquetado decodifica exactamente a los bits que produce el lector de Fermion), lo cual no constituye una evaluación de precisión ASR.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 0,2 GB, por lo que la inferencia requiere del orden de unos pocos cientos de MB de memoria unificada, incluyendo buffers de activaciones.
- GPU recomendadas: no aplica en el sentido tradicional; el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4 y posteriores).
- Cabe en GPU de consumo: sí, en cualquier Mac con chip Apple Silicon; no está pensado para GPUs NVIDIA o AMD convencionales.
- Opciones de despliegue: MLX con una implementación Parakeet compatible; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Phonon-2.5-English-mlx (este) | 181.269.062 | Inglés | safetensors MLX, 5 valores + int6 | CC-BY-4.0 | Conversión de formato, sin reentrenamiento |
| FermionResearch/Phonon-2.5-English | no disponible | Inglés | no disponible | CC-BY-4.0 | Modelo original comprimido del que deriva esta conversión |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B (nominal) | no disponible | no disponible | no disponible | Checkpoint NVIDIA del que parte la cadena |
| FermionResearch/Phonon-2.5 | no disponible | 25 idiomas | no disponible | no disponible | Variante multilingüe de la misma familia |

## Limitaciones y advertencias

- Solo reconoce inglés; no es adecuado para audio en otros idiomas.
- Es un modelo ASR: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Riesgo de errores de transcripción (sustituciones, omisiones) inherente a todo sistema ASR; no se han publicado cifras de WER en esta información para cuantificarlo.
- La licencia CC-BY-4.0 exige atribución tanto a FermionResearch como a NVIDIA; el uso comercial es posible pero requiere cumplir esa obligación.
- El código lector original se distribuye bajo Apache-2.0, licencia distinta de la de los pesos.
- La conversión no ha sido evaluada con benchmarks de precisión; la fidelidad verificada es de bits, no de calidad de transcripción.
- Depende de una implementación MLX de Parakeet compatible con el layout NeMo/MLX; no es un checkpoint portable a otros runtimes sin conversión adicional.
- No se dispone de información sobre sesgos demográficos o acústicos específicos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/selcukkubur/Phonon-2.5-English-mlx
- Modelo base original: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Checkpoint NVIDIA de origen: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante multilingüe (25 idiomas): https://huggingface.co/FermionResearch/Phonon-2.5
- ATTRIBUTION.md del repositorio: https://huggingface.co/selcukkubur/Phonon-2.5-English-mlx/blob/main/ATTRIBUTION.md
- Licencia de pesos CC-BY-4.0: https://huggingface.co/selcukkubur/Phonon-2.5-English-mlx/blob/main/LICENSE-WEIGHTS-CC-BY-4.0.txt
- Licencia de código Apache-2.0: https://huggingface.co/selcukkubur/Phonon-2.5-English-mlx/blob/main/LICENSE-CODE-Apache-2.0.txt
- NOTICE de Fermion Research: https://huggingface.co/selcukkubur/Phonon-2.5-English-mlx/blob/main/NOTICE-Fermion-Research.txt
