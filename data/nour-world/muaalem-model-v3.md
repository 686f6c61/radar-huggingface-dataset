# nour-world/muaalem-model-v3

## Resumen

muaalem-model-v3 es un modelo de reconocimiento automatico del habla (ASR) especializado en la recitacion del Coran, desarrollado por el usuario nour-world y publicado bajo licencia MIT. Se trata de un ajuste fino (fine-tuning) del modelo preentrenado facebook/w2v-bert-2.0, orientado no solo a transcribir la recitacion, sino a detectar errores de pronunciacion asociados a las reglas de tajwid (pronunciacion correcta de las letras y sus atributos foneticos).

El modelo tiene 605.754.251 parametros (aproximadamente 606 millones) y un tamano de repositorio de 2,4 GB. Emplea una arquitectura de cabeceras CTC multinivel (multi_level_ctc) sobre la base acustica de W2V-BERT 2.0, lo que le permite emitir predicciones sobre multiples atributos foneticos de forma simultanea. Esta disenado especificamente para el arabe (codigo de idioma "ar") y se entrena sobre el conjunto de datos obadx/muaalem-annotated-v3.

La relevancia del modelo radica en su aplicacion educativa: permite construir herramientas automaticas de correccion de la recitacion coranica para estudiantes (talibes), evaluando atributos tajwid como hams/jahr, shidda/rakhawa, tafkheem/taqeeq, itbaq, safeer, qalqala, tikraar, tafashie, istitala y ghonna. Fue presentado en el articulo "Automatic Pronunciation Error Detection and Correction of the Holy Quran's Learners Using Deep Learning" (arXiv:2509.00094).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | W2V-BERT 2.0 (encoder transformer auto-supervisado) con cabeceras CTC multinivel (multi_level_ctc) |
| Parametros totales | 605.754.251 (~606 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | facebook/w2v-bert-2.0 |
| Dataset de entrenamiento | obadx/muaalem-annotated-v3 |
| Tarea | ASR / deteccion de errores de pronunciacion (tajwid) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de facebook/w2v-bert-2.0, un encoder de habla auto-supervisado que combina aprendizaje contrastivo y prediccion enmascarada, y que fue posteriormente ajustado para la tarea especifica de deteccion de errores de pronunciacion coranica. Sobre esta base se anaden cabeceras CTC multinivel (multi_level_ctc), una innovacion que permite supervisar simultaneamente la secuencia de fonemas y diversos atributos tajwid, en lugar de limitarse a una unica salida de transcripcion. El modelo fue presentado en el articulo de arXiv:2509.00094, centrado en la deteccion y correccion automatica de errores de pronunciacion en estudiantes del Coran mediante aprendizaje profundo.

El ajuste se realizo durante 1 epoca con un learning rate de 5e-05, tamano de lote de 64 (tanto en entrenamiento como en evaluacion), semilla 42, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), planificador de learning rate constante con una proporcion de calentamiento (warmup) de 0,2. El entrenamiento se ejecuto con Transformers 4.55.4, PyTorch 2.8.0+cu128, Datasets 3.3.2 y Tokenizers 0.21.4. La model card indica que el modelo fue generado automaticamente por el Trainer y que la seccion de datos de entrenamiento y evaluacion requiere mas informacion, por lo que la composicion exacta del dataset y el numero de tokens de audio no estan detallados en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla en arabe aplicado especificamente a la recitacion del Coran.
- Deteccion multinivel de errores de pronunciacion fonetica, con salidas separadas para fonemas y para atributos tajwid.
- Prediccion de atributos tajwid concretos: hams/jahr, shidda/rakhawa, tafkheem/taqeeq, itbaq, safeer, qalqala, tikraar, tafashie, istitala y ghonna.
- Salida basada en CTC multinivel, orientada a la evaluacion de la recitacion mas que a la mera transcripcion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de audio, no de texto generativo).
- Capacidades multilingues: limitada al arabe (ar).
- Capacidades especiales: deteccion de errores de pronunciacion y correccion de recitacion (no dispone de modo "thinking", vision ni audio generativo).

## Casos de uso

- Correccion de recitacion para estudiantes del Coran: el modelo analiza la recitacion de un alumno y detecta desviaciones en la pronunciacion de cada atributo tajwid, permitiendo generar retroalimentacion automatica e inmediata sobre que reglas se estan aplicando mal.
- Plataformas de aprendizaje (hifz) con evaluacion automatica: integrado en aplicaciones de memorizacion del Coran, el modelo puede puntuar la calidad de la recitacion y hacer seguimiento del progreso del estudiante a lo largo del tiempo.
- Herramientas de evaluacion para profesores (muaalim): ayuda a los docentes a examinar recitaciones de forma masiva, marcando las palabras o atributos con mayor tasa de error para revisarlos manualmente.
- Investigacion en fonetica y tajwid: permite cuantificar experimentalmente la incidencia de cada atributo (qalqala, ghonna, safeer, etc.) en corpus de recitadores, apoyando estudios academicos.
- Control de calidad en produccion de audio coranico: verificacion automatica de grabaciones para detectar errores de pronunciacion antes de su publicacion.
- Desarrollo de correctores en tiempo real: al ser un modelo de ~606 M de parametros y 2,4 GB, cabe en GPU de consumo, lo que posibilita inferencia local para asistentes de recitacion en dispositivos de gama media-alta.
- Anotacion y etiquetado de corpus coranicos: el modelo puede pre-etiquetar atributos tajwid para acelerar la construccion de nuevos conjuntos de datos anotados.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (array vacio). La model card proporciona resultados del conjunto de evaluacion declarados por el autor, expresados como tasas de error fonetico (PER, "Per" por atributo) y perdida:

| Metrica | Valor |
|---|---|
| Loss | 0,0118 |
| Per Phonemes | 0,0043 |
| Per Hams Or Jahr | 0,0020 |
| Per Shidda Or Rakhawa | 0,0027 |
| Per Tafkheem Or Taqeeq | 0,0031 |
| Per Itbaq | 0,0013 |
| Per Safeer | 0,0014 |
| Per Qalqla | 0,0013 |
| Per Tikraar | 0,0037 |
| Per Tafashie | 0,0019 |
| Per Istitala | 0,0012 |
| Per Ghonna | 0,0017 |
| Average Per | 0,0022 |

Evolucion durante el entrenamiento (segun la model card):

| Training Loss | Epoch | Step | Validation Loss | Average Per |
|---|---|---|---|---|
| 0,128 | 0,2002 | 650 | 0,0237 | 0,0038 |
| 0,0172 | 0,4005 | 1300 | 0,0128 | 0,0023 |
| 0,0146 | 0,6007 | 1950 | 0,0105 | 0,0019 |
| 0,0111 | 0,8010 | 2600 | 0,0118 | 0,0022 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER de referencia) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 2,4 GB (coincide con el tamano del repositorio); en fp16/bf16 se reduce a unos 1,2 GB. La VRAM total dependera del tamano de lote y de la duracion del audio procesado.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente para inferencia con lotes pequenos; se recomiendan NVIDIA RTX 3060/4070/4090, A100 o H100 para cargas por lotes y produccion.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, incluso en fp32.
- Opciones de despliegue: al estar basado en transformers y ser compatible con endpoints, puede desplegarse con Hugging Face Transformers, Text Generation Inference (TGI, segun soporte de la tarea de audio), vLLM (si soporta el tipo multi_level_ctc) o inferencia directa en PyTorch. El uso con llama.cpp u Ollama no esta indicado en la informacion disponible al no existir pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| muaalem-model-v3 | ~606 M | no disponible | arabe | MIT | ASR coranico + deteccion de errores tajwid |
| facebook/w2v-bert-2.0 (base) | no disponible (modelo base) | no disponible | multilingue | no disponible | ASR / representaciones de habla auto-supervisadas |
| Modelos ASR arabes genericos (p. ej. Whisper) | no disponible | no disponible | multilingue | no disponible | ASR general, sin deteccion de tajwid |

No se dispone de datos comparativos de rendimiento con alternativas de la misma categoria en la informacion proporcionada. La diferencia principal frente a un ASR generico es la salida multinivel especifica de atributos tajwid, que no suele ofrecerse en modelos de transcripcion estandar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al estar especializado en recitacion coranica, el rendimiento fuera de ese dominio sera limitado.
- Riesgo de alucinacion: aunque es un modelo CTC (no generativo de texto libre), puede producir transcripciones o etiquetas foneticas incorrectas en recitaciones con ruido, dialectos o estilos de recitacion no vistos durante el entrenamiento.
- Limitaciones de contexto e idioma: el modelo solo soporta arabe (ar) y esta disenado para recitacion coranica; no es un ASR de proposito general.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar las condiciones del modelo base facebook/w2v-bert-2.0 sobre el que se ajusta.
- Caveats para produccion: la model card fue generada automaticamente y las secciones de datos de entrenamiento y limitaciones no estan cumplimentadas; no se han publicado benchmarks estandar ni comparativas, por lo que se recomienda una evaluacion propia antes de usar el modelo en produccion. El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- La longitud de contexto y los tipos de cuantizacion soportados no estan especificados, lo que dificulta planificar despliegues de audio de larga duracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nour-world/muaalem-model-v3
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Articulo (paper): https://huggingface.co/papers/2509.00094
- Dataset: obadx/muaalem-annotated-v3
- No se han encontrado otros enlaces relevantes (repositorio, demo o blog) en la busqueda web; los resultados obtenidos no guardan relacion con el modelo.
