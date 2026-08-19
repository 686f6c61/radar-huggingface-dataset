# Kiyan122/whisper-small-fa-Thomcles

## Resumen

El modelo `whisper-small-fa-Thomcles` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático de voz (ASR) `openai/whisper-small` realizado por el usuario Kiyan122. El nombre del repositorio sugiere que está orientado al persa (código ISO "fa"), aunque la model card no confirma explícitamente los idiomas soportados. Se trata de un modelo relativamente pequeño (241,7 millones de parámetros), heredado de Whisper-small, que puede ejecutarse en hardware modesto y es adecuado para tareas de transcripción en entornos con recursos limitados.

La relevancia de este modelo radica en que el persa es un idioma con menos recursos disponibles en el ecosistema de ASR de código abierto. Sin embargo, la falta de documentación sobre el dataset de entrenamiento, los resultados de evaluación y las capacidades exactas limita su utilidad inmediata en producción. Aun así, representa un esfuerzo de adaptación de un modelo base sólido a un idioma de baja representación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer con atención) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (heredado de Whisper-small, no confirmado en la card) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors, sin información sobre cuantización) |
| Idiomas soportados | Persa (según el nombre del modelo, no confirmado en la card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-small`, que emplea una arquitectura transformer encoder-decoder con atención estándar. Whisper-small procesa audio de hasta 30 segundos y produce transcripciones de texto. El ajuste fino se realizó con la librería Transformers (versión 5.0.0) y PyTorch 2.10.0, utilizando entrenamiento distribuido con 2 GPUs. Los hiperparámetros principales incluyen una tasa de aprendizaje de 1e-5, un tamaño de batch efectivo de 256 (con acumulación de gradientes de 4 pasos) y un total de 400 pasos de entrenamiento. Se usó el optimizador AdamW con scheduler de tipo coseno con mínimo de LR y warmup de 40 pasos. No se especifica el dataset de entrenamiento ni el método de alineación (RLHF, DPO, etc.).

## Capacidades

- Reconocimiento automático de voz (ASR) para transcripción de audio a texto, probablemente en persa.
- Al ser un fine-tune de Whisper-small, hereda las capacidades del modelo base en cuanto a robustez ante ruido y acentos, aunque no hay datos específicos sobre el comportamiento en persa.
- No se documentan capacidades adicionales como tool calling, agentes, visión o modo de razonamiento.
- El modelo es compatible con el pipeline `automatic-speech-recognition` de Hugging Face.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el modelo puede convertir grabaciones de audio a texto, facilitando la generación de actas o búsquedas en contenido hablado. Su tamaño reducido permite ejecutarlo en una GPU de consumo o incluso en CPU con cuantización.
- Subtitulado automático de vídeos en persa: al integrarse con herramientas de procesamiento de vídeo, puede generar subtítulos para contenido multimedia, útil para creadores de contenido o plataformas educativas.
- Asistentes de voz para aplicaciones móviles: al ser ligero, puede desplegarse en dispositivos edge para comandos de voz o dictado en persa, aunque se debe validar su precisión en entornos ruidosos.
- Análisis de llamadas de atención al cliente: transcripción de llamadas en persa para su posterior análisis de sentimiento o extracción de información, siempre que se valide la calidad en este dominio.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo real de contenido hablado en persa, aunque la latencia dependerá del hardware.
- Investigación académica en ASR para persa: sirve como punto de partida para comparaciones o fine-tuning adicional sobre dominios específicos, dado que es un modelo abierto y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card está vacía (`results: []`). No se puede evaluar su precisión en persa ni compararla con otros modelos sin datos empíricos.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene ~242M de parámetros en FP32, necesitaría aproximadamente 1 GB de VRAM solo para los pesos. Con cuantización a FP16 o int8, la demanda sería menor. Se estima que una GPU con 4-6 GB de VRAM (por ejemplo, RTX 3060 o RTX 4050) es suficiente para inferencia en tiempo real.
- GPU recomendadas: RTX 3060, RTX 4060, A10, o cualquier GPU con al menos 4 GB de VRAM. Para entrenamiento o fine-tuning adicional, se requieren GPUs con más memoria (por ejemplo, A100 o H100) o técnicas de gradient checkpointing.
- En CPU: es posible ejecutar el modelo en CPU con cuantización GGUF o usando librerías como llama.cpp, aunque la latencia será alta (varios segundos por clip de 30 segundos).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM (aunque no es un modelo de lenguaje, puede usarse con pipelines de ASR), TGI, y también con librerías específicas de Whisper como `whisper.cpp` si se convierte a formato GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una transcripción de 30 segundos de audio en menos de 1 segundo, pero esto no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| whisper-small-fa-Thomcles | 241,7M | 30 s (heredado) | Apache-2.0 | Sin benchmarks publicados |
| openai/whisper-small | 241,7M | 30 s | MIT | Referencia en ASR multilingüe, pero no optimizado para persa |
| openai/whisper-medium | 769M | 30 s | MIT | Mayor precisión general, pero más pesado |

No se dispone de comparativas con otros fine-tunes específicos para persa. El modelo base Whisper-small tiene un rendimiento conocido en múltiples idiomas, pero su precisión en persa es limitada según los informes de OpenAI. Este fine-tune podría mejorar esa precisión, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica qué corpus se usó, lo que impide evaluar la cobertura de acentos, dominios o registros.
- Sin evaluación publicada: no hay métricas de WER (Word Error Rate) ni comparativas con otros modelos, por lo que no se puede garantizar su calidad en producción.
- Posibles sesgos: al ser un fine-tune sobre un dataset no documentado, puede tener sesgos hacia el habla formal o ciertos acentos del persa.
- Riesgo de alucinaciones: como todo modelo ASR, puede generar texto que no corresponde al audio, especialmente en condiciones de ruido o habla solapada.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Fecha de creación futura (2026): el modelo fue subido en agosto de 2026, lo que sugiere que puede ser un experimento reciente sin validación externa.
- Compatibilidad: aunque es compatible con Transformers, se recomienda verificar la versión exacta de la librería (5.0.0) y la de PyTorch (2.10.0) para evitar problemas de carga.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Kiyan122/whisper-small-fa-Thomcles)
- [Modelo base openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio oficial de Whisper](https://github.com/openai/whisper)
