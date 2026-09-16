# nour-world/Muaalem-model-dev

## Resumen

Muaalem-model-dev es un modelo de reconocimiento fonético de audio publicado por el usuario `nour-world` en Hugging Face. Se trata de un ajuste fino (*fine-tuning*) del modelo acústico `facebook/w2v-bert-2.0`, orientado a la transcripción y evaluación de la recitación coránica a nivel de fonema y de atributos de *tajwid* (reglas de recitación). El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y fue creado el 15 de septiembre de 2026.

El modelo tiene 605.753.226 parámetros (~606 M) y se distribuye bajo licencia MIT en formato `safetensors`. La etiqueta de pipeline `multi_level_ctc` y las métricas declaradas por el autor (`Per Phonemes`, `Per Ghonna`, `Per Qalqla`, `Per Tafkheem Or Taqeeq`, `Per Shidda Or Rakhawa`, etc.) indican una cabeza CTC multinivel que predice simultáneamente la secuencia de fonemas y varios atributos articulatorios y de recitación. Su relevancia radica en que aborda una tarea muy específica, la evaluación automática de la pronunciación coránica, para la que existen pocos modelos públicos y prácticamente ningún punto de referencia (*benchmark*) estandarizado.

La información publicada es escasa: la *model card* está generada automáticamente por `Trainer` y sus secciones de descripción, usos previstos y datos de entrenamiento figuran como «More information needed». Todo lo que se detalla a continuación procede exclusivamente de los metadatos del repositorio y de la tabla de entrenamiento incluida en la propia *model card*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (codificador tipo conformer) con cabeza CTC multinivel; ajuste fino de `facebook/w2v-bert-2.0` |
| Parámetros totales | 605.753.226 (~606 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo acústico; la entrada es audio, no texto) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en `safetensors` |
| Idiomas soportados | no declarados en la *model card*; las métricas de *tajwid* sugieren uso sobre árabe coránico (inferencia) |
| Licencia | MIT |
| Formato de pesos | `safetensors` |
| Librería | transformers |
| Modelo base | `facebook/w2v-bert-2.0` |
| Tamaño del repositorio | 2,4 GB |
| Etiquetas | `transformers`, `safetensors`, `multi_level_ctc`, `generated_from_trainer`, `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

El modelo parte de `facebook/w2v-bert-2.0`, un codificador acústico de tipo conformer (convolución + autoatención) preentrenado con objetivos de aprendizaje autosupervisado, presentado por Meta en el marco del trabajo de escalado a más de 1000 lenguas. Sobre esa base, `nour-world` ha añadido una cabeza de clasificación CTC multinivel, como indica la etiqueta `multi_level_ctc`. Este diseño permite supervisar simultáneamente varios niveles de etiquetado (fonemas y atributos de articulación o de *tajwid*) sobre la misma representación acústica, en lugar de una única secuencia objetivo plana.

Los hiperparámetros de entrenamiento declarados son: `learning_rate` de 5e-05, `train_batch_size` de 64, `eval_batch_size` de 90, semilla 42, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), planificador de tasa de aprendizaje constante con `warmup_ratio` de 0,2 y una única época (`num_epochs: 1`). El conjunto de datos de entrenamiento aparece como `None` en la *model card*, por lo que no se puede verificar su composición, tamaño ni procedencia. Se registraron 292 pasos de entrenamiento. No se documenta ningún uso de RLHF, DPO ni otra fase de alineación; tampoco se describe decodificación especulativa ni mecanismos de atención lineal.

Las versiones de framework declaradas son Transformers 4.55.0, PyTorch 2.8.0+cu128, Datasets 3.3.2 y Tokenizers 0.21.4.

## Capacidades

- Reconocimiento fonético de audio (*speech-to-phoneme*) mediante decodificación CTC.
- Predicción multinivel de atributos de recitación, según los nombres de las métricas de evaluación: *hams/jahr*, *shidda/rakhawa*, *tafkheem/taqeeq*, *itbaq*, *safeer*, *qalqala*, *tikraar*, *tafashie*, *istitala* y *ghonna*.
- Transcripción a nivel de fonemas, apta para alineación forzada y anotación de corpus de audio.
- Capacidad de evaluar la corrección de una recitación comparando la salida fonética y de atributos con una referencia esperada.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte para flujos de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe explícita; el modelo se limita a la tarea acústica para la que fue ajustado.
- No se documentan capacidades de visión, audio generativo, *thinking mode* ni entrada multimodal más allá del audio.

## Casos de uso

- Corrección automática de recitación coránica: el modelo permite detectar desviaciones en reglas concretas de *tajwid* (por ejemplo, una *ghonna* mal sostenida o una *qalqala* omitida) comparando la secuencia fonética y de atributos predicha con la esperada para un pasaje dado.
- Aplicaciones de aprendizaje para estudiantes de recitación: integrado en una *app* móvil, puede devolver retroalimentación fonema a fonema sobre la recitación del usuario, señalando en qué posición exacta del audio se produce el error.
- Evaluación objetiva en academias de memorización (*hifz*): permite generar una puntuación automática y reproducible por regla de recitación, reduciendo la dependencia exclusiva de la evaluación humana.
- Alineación forzada y segmentación fonética de corpus: útil para anotar automáticamente horas de audio coránico con marcas temporales a nivel de fonema, tarea previa habitual en la construcción de conjuntos de datos de voz.
- Investigación en fonética y lingüística árabe: permite medir de forma cuantitativa la realización acústica de atributos articulatorios (*itbaq*, *tafkheem*, *safeer*) sobre corpus amplios.
- Control de calidad de grabaciones y producción de audio: verificar que una grabación publicada cumple las reglas esperadas antes de su distribución, o preprocesar audio para sistemas de síntesis de voz.
- Generación de material didáctico con transliteración fonética: la salida a nivel de fonema puede transformarse en transcripciones legibles para herramientas de apoyo al estudio.

## Benchmarks y rendimiento

El `model-index` de la *model card* no contiene resultados declarados (`"results": []`), por lo que **no se han publicado resultados de benchmarks en la información disponible** (no hay MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a un modelo acústico).

La *model card* sí incluye métricas del conjunto de evaluación. El autor no especifica si los valores «Per ...» son tasas de error (PER) o exactitudes, por lo que se reproducen tal cual, sin reinterpretarlos:

| Métrica | Valor final declarado |
|---|---|
| Loss | 0,0212 |
| Per Phonemes | 0,0058 |
| Per Hams Or Jahr | 0,0026 |
| Per Shidda Or Rakhawa | 0,0040 |
| Per Tafkheem Or Taqeeq | 0,0030 |
| Per Itbaq | 0,0019 |
| Per Safeer | 0,0022 |
| Per Qalqla | 0,0020 |
| Per Tikraar | 0,0023 |
| Per Tafashie | 0,0160 |
| Per Istitala | 0,0019 |
| Per Ghonna | 0,0027 |
| Average Per | 0,0040 |

Evolución durante el entrenamiento (extracto de la tabla publicada por el autor):

| Epoch | Step | Validation loss | Per Phonemes | Per Tafashie | Average Per |
|---|---|---|---|---|---|
| 0,2022 | 73 | 0,1027 | 0,0612 | 0,2467 | 0,0618 |
| 0,4044 | 146 | 0,0451 | 0,0207 | 0,0566 | 0,0105 |
| 0,6066 | 219 | 0,0306 | 0,0081 | 0,0322 | 0,0061 |
| 0,8089 | 292 | 0,0212 | 0,0058 | 0,0160 | 0,0040 |

No se ofrece comparación con otros modelos ni información sobre el conjunto de evaluación empleado, de modo que estos valores no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB de pesos en FP32 más activaciones y *overhead* de runtime, lo que sitúa el consumo en torno a 4-6 GB de VRAM. En FP16/BF16 los pesos ocupan ~1,2 GB y el consumo total puede bajar a 3-4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 ejecutan el modelo con holgura. En el extremo profesional, A100, H100 o L40S no aportan ventaja significativa de memoria, aunque sí de *throughput* en procesamiento por lotes.
- Compatibilidad con GPU de consumo: sí. Es un modelo de ~606 M de parámetros y cabe en la práctica totalidad de GPU de gama media y alta actuales, así como en iGPU con memoria unificada suficiente.
- Despliegue: al ser un modelo `transformers` de la familia Wav2Vec2-BERT, las vías naturales son la propia librería Transformers (PyTorch), exportación a ONNX Runtime o TorchScript para inferencia optimizada, y Hugging Face Inference Endpoints (el repositorio está etiquetado como `endpoints_compatible`). Los servidores orientados a modelos generativos (vLLM, TGI, llama.cpp, Ollama) no soportan arquitecturas de codificación acústica con cabeza CTC, por lo que no son opciones válidas.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de audio procesado por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Muaalem-model-dev | Wav2Vec2-BERT + CTC multinivel | ~606 M | no disponible | MIT | Hugging Face | Ajustado específicamente a atributos de *tajwid* |
| `facebook/w2v-bert-2.0` | Wav2Vec2-BERT preentrenado | ~580 M (dato no confirmado en la información disponible) | ventanas de audio de hasta 30 s en el preentrenamiento original | no disponible en la información proporcionada | Hugging Face | Modelo base; no produce salida fonética sin ajuste |
| `facebook/wav2vec2-large-xlsr-53-arabic` | Wav2Vec2 + CTC para ASR en árabe | ~317 M (dato no confirmado en la información disponible) | ventanas de audio | Apache-2.0 (no confirmado en la información disponible) | Hugging Face | Transcripción ortográfica en árabe, no evaluación de *tajwid* |
| Whisper large-v3 | Codificador-decodificador para ASR y traducción | ~1.550 M (dato no confirmado en la información disponible) | ventanas de 30 s | MIT (no confirmado en la información disponible) | Hugging Face / OpenAI | Transcripción multilingüe de propósito general; no produce etiquetas de *tajwid* |

La comparación con alternativas de la misma categoría exacta (modelos de evaluación de recitación coránica a nivel de *tajwid*) no está disponible en la información proporcionada. Los valores de parámetros y licencias de los modelos de terceros deben verificarse en sus respectivas fichas antes de tomarlos como referencia.

## Limitaciones y advertencias

- La *model card* está generada automáticamente y sus secciones «Model description», «Intended uses & limitations» y «Training and evaluation data» figuran como «More information needed». No hay documentación de sesgos, dominio de aplicación ni requisitos de entrada.
- El conjunto de datos de entrenamiento aparece como `None`: se desconoce su tamaño, su procedencia y su licencia, lo que impide evaluar la cobertura de voces, acentos, edades o estilos de recitación.
- Con solo una época de entrenamiento y una pérdida de validación muy baja (0,0212), existe riesgo de desajuste severo entre el conjunto de evaluación y datos reales, especialmente si la partición de validación comparte hablantes o pasajes con el entrenamiento. No se ha publicado una partición por hablante.
- El autor no aclara si las métricas «Per ...» son tasas de error o exactitudes, por lo que su interpretación cuantitativa es ambigua.
- No hay datos de *benchmark* independientes ni comparaciones con otros modelos, así que el rendimiento declarado no está verificado por terceros.
- El modelo es un reconocedor acústico: no genera texto libre, no razona y no mantiene conversaciones. No debe presentarse como un modelo de lenguaje.
- Riesgo de alucinación entendido como sobreconfianza fonética: la decodificación CTC puede forzar una etiqueta en segmentos de silencio, ruido o recitación con música de fondo, sin que exista un mecanismo de rechazo documentado.
- El idioma soportado no está declarado formalmente. Si el modelo se aplica a árabe no coránico, a otras lenguas o a recitación con fuerte acento regional, el comportamiento es indeterminado.
- Licencia MIT: permite uso comercial, modificación y redistribución manteniendo el aviso de copyright. Aun así, conviene verificar la licencia del corpus de ajuste, que no se documenta, ya que podría imponer restricciones adicionales sobre los pesos derivados.
- El repositorio presenta 0 descargas y 0 *likes* y una fecha de creación reciente, por lo que no existe evidencia de uso en producción ni de mantenimiento por parte del autor.
- Para uso en producción se recomienda validar el modelo sobre un conjunto propio de audio, segmentado por hablante, antes de tomar cualquier decisión basada en sus salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nour-world/Muaalem-model-dev
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Documentación de Wav2Vec2-BERT en Transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2-bert
- Artículo original de W2v-BERT: https://arxiv.org/abs/2108.06209
- Artículo donde se describe W2v-BERT 2.0 (escalado a más de 1000 lenguas): https://arxiv.org/abs/2312.05187
- Documentación de optimizadores y `Trainer` de Transformers: https://huggingface.co/docs/transformers/main_classes/trainer
