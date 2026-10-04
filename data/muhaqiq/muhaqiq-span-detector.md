# muhaqiq/muhaqiq-span-detector

## Resumen

muhaqiq-span-detector es un modelo de clasificacion de tokens (pipeline token-classification) publicado por el usuario muhaqiq en HuggingFace. Es un fine-tuning de CAMeL-Lab/bert-base-arabic-camelbert-msa, un encoder BERT-base entrenado por el CAMeL Lab sobre arabe estandar moderno. El modelo resultante tiene 108.497.673 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El problema que resuelve es la deteccion de fragmentos (spans) en texto arabe. Las etiquetas que reporta el autor en la evaluacion (Ayah, Isnad, Matn, Source) coinciden con la estructura clasica de un hadiz: la cadena de transmision (isnad), el cuerpo del relato (matn), las citas coranicas (ayah) y la referencia bibliografica. La aplicacion natural es, por tanto, el preprocesado y la anotacion automatica de corpus islamicos, una tarea con demanda creciente en humanidades digitales y en la construccion de grafos de conocimiento.

A diferencia de los modelos generativos, no produce texto: asigna una etiqueta a cada token de entrada, lo que lo hace muy barato de ejecutar y adecuado para pipelines de anotacion a gran escala. La model card es un esqueleto generado automaticamente por el Trainer, sin descripcion del uso previsto ni del conjunto de datos de entrenamiento, y el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base con cabeza de clasificacion de tokens |
| Parametros totales | 108.497.673 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion; el modelo base CAMeLBERT-MSA es un BERT-base, cuyo limite habitual es 512 tokens |
| Tipos de cuantizacion | no disponibles; solo se publican pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni ONNX cuantizadas |
| Idiomas soportados | no disponible en los metadatos; el modelo base esta especializado en arabe estandar moderno (MSA) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 5,2 GB) |

## Arquitectura y entrenamiento

Se trata de un fine-tuning completo de CAMeL-Lab/bert-base-arabic-camelbert-msa para clasificacion de tokens. No hay ninguna innovacion arquitectonica: es un encoder transformer bidireccional estandar con una cabeza lineal de clasificacion por token. El autor no documenta el conjunto de datos de entrenamiento ("on an unknown dataset" en la model card), ni su tamano, ni su composicion, ni si las etiquetas cubren clases adicionales fuera de las cuatro evaluadas (Ayah, Isnad, Matn y Source), ni si existe una clase exterior O.

Los hiperparametros si estan publicados: learning rate 3e-05, scheduler lineal, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused, batch de entrenamiento 16, batch de evaluacion 32, semilla 42, 4 epocas y precision mixta nativa (Native AMP). El entrenamiento se realizo con Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2. No se menciona RLHF, DPO ni ninguna fase de alineacion, algo que no aplica a un modelo discriminativo de este tipo. La perdida de validacion final es de 0,0375, estable entre las epocas 3 y 4, lo que sugiere que el modelo ha convergido con este esquema de entrenamiento.

## Capacidades

- Deteccion de spans en texto arabe mediante etiquetado por token (token classification), con cuatro categorias evaluadas: Ayah, Isnad, Matn y Source.
- Extraccion de la cadena de transmision (isnad) de narraciones, con un F1 de 0,6208, la clase mas dificil del conjunto.
- Segmentacion del cuerpo del texto (matn) con un F1 de 0,9272.
- Identificacion de citas coranicas (ayah) con un F1 de 0,9601, la clase con mejor rendimiento.
- Deteccion de referencias de fuente (source) con un F1 de 0,9147.
- Salida compatible con el pipeline `token-classification` de Transformers y con el flag `endpoints_compatible`, por lo que puede desplegarse como endpoint gestionado de HuggingFace.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente. Es un modelo puramente discriminativo de una sola tarea.
- Capacidad multilingue: no documentada; el modelo base esta especializado en arabe estandar moderno y no se declaran otros idiomas en los metadatos.

## Casos de uso

- Anotacion automatica de corpus de hadices: el modelo etiqueta cada token con su funcion estructural (isnad, matn, ayah, source), lo que permite preanotar grandes colecciones y reducir el trabajo manual de anotadores humanos antes de una revision final.
- Construccion de grafos de conocimiento islamicos: al extraer el isnad de forma automatica se pueden enlazar narradores y cadenas de transmision, alimentando bases de datos de narratologia (ilm al-rijal) con relaciones entre transmisores.
- Indexacion y busqueda semantica de citas coranicas: con un F1 de 0,9601 en la clase Ayah, el modelo sirve para localizar y aislar versiculos citados dentro de textos en prosa, facilitando su enlazado con el texto coranico de referencia.
- Limpieza y normalizacion de corpus digitalizados: separar matn de isnad y de referencias bibliograficas permite reestructurar textos extraidos de PDF o de transcripciones en campos independientes antes de almacenarlos.
- Analisis filologico y estadistico a escala: la segmentacion sistematica de miles de narraciones permite estudiar la evolucion de formulas de transmision, la longitud media del matn o la distribucion de fuentes citadas por autor o por epoca.
- Verificacion de citas en publicaciones: un editor o una plataforma puede usar el modelo para comprobar que una cita atribuida a una fuente concreta aparece efectivamente en el texto y con que estructura.
- Enriquecimiento de pipelines de NLP arabe: la salida del detector de spans puede alimentar tareas posteriores (resumen, traduccion, busqueda) que necesiten trabajar solo sobre el matn y descartar el aparato de transmision.
- Prototipado rapido en endpoints: al estar marcado como `endpoints_compatible`, puede desplegarse en la infraestructura gestionada de HuggingFace sin configuracion adicional de servidor.

## Benchmarks y rendimiento

El model-index oficial del autor esta vacio (`results: []`), por lo que no hay resultados declarados en benchmarks estandar como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de clasificacion de tokens. Los unicos datos disponibles son las metricas de evaluacion de la propia tarea, recogidas en la model card:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,0375 |
| F1 global | 0,9050 |
| Precision | 0,8775 |
| Recall | 0,9343 |
| F1 Ayah | 0,9601 |
| F1 Isnad | 0,6208 |
| F1 Matn | 0,9272 |
| F1 Source | 0,9147 |

Evolucion durante el entrenamiento (datos de la model card):

| Epoca | Paso | Loss validacion | F1 | Precision | Recall | F1 Ayah | F1 Isnad | F1 Matn | F1 Source |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 383 | 0,0428 | 0,8720 | 0,8443 | 0,9016 | 0,9383 | 0,5880 | 0,9099 | 0,8678 |
| 2 | 766 | 0,0421 | 0,8896 | 0,8543 | 0,928 | 0,9485 | 0,5766 | 0,9193 | 0,9004 |
| 3 | 1149 | 0,0375 | 0,9031 | 0,8748 | 0,9332 | 0,9567 | 0,6141 | 0,9323 | 0,9113 |
| 4 | 1532 | 0,0375 | 0,9050 | 0,8775 | 0,9343 | 0,9601 | 0,6208 | 0,9272 | 0,9147 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,43 GB solo de pesos; en fp16, unos 0,22 GB; en int8, unos 0,11 GB. Con activaciones y batch pequeno, el consumo real se mantiene por debajo de 1-2 GB.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos, dado el tamano del encoder.
- GPU recomendadas para produccion con alto throughput: NVIDIA T4, L4, A10G, A100 o H100, aprovechando el procesamiento por lotes.
- El repositorio ocupa 5,2 GB, muy por encima de los ~0,43 GB que ocupan los pesos en fp32, lo que apunta a la presencia de checkpoints intermedios u otros artefactos en el mismo repositorio.
- Opciones de despliegue: pipeline `token-classification` de Transformers, endpoint gestionado de HuggingFace (flag `endpoints_compatible`), exportacion a ONNX mediante Optimum, NVIDIA Triton, TorchServe o un servicio FastAPI propio. vLLM, llama.cpp y Ollama estan orientados a generacion de texto y no son el encaje natural para este modelo.
- Latencia y throughput estimados: no publicados por el autor.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible otros modelos de deteccion de spans especificamente entrenados para estructura de hadiz con los que comparar directamente. La comparacion mas util es con el modelo base y con otros encoders arabes de proposito general, que no realizan esta tarea:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| muhaqiq-span-detector | 108,5 M | no disponible (habitual 512 en BERT-base) | Clasificacion de tokens: Ayah, Isnad, Matn, Source | Apache 2.0 |
| CAMeL-Lab/bert-base-arabic-camelbert-msa (modelo base) | no disponible en esta ficha | no disponible en esta ficha | Encoder base de arabe estandar moderno, sin cabeza de tarea especifica | no disponible en esta ficha |
| Otros encoders arabes (AraBERT, MARBERT, etc.) | no disponible | no disponible | Encoders de proposito general; requieren fine-tuning para esta tarea | no disponible |

La ventaja del modelo frente a esos encoders genericos es que ya viene ajustado para la tarea de spans de hadiz; su desventaja es que no hay evidencia publica de que sea mejor que un fine-tuning propio sobre los mismos datos, ya que no se documenta el conjunto de entrenamiento.

## Limitaciones y advertencias

- La clase Isnad obtiene un F1 de 0,6208, muy inferior al resto de clases (todas por encima de 0,91). Es previsible un rendimiento pobre en la extraccion de cadenas de transmision, justo la tarea de mayor interes para aplicaciones de narratologia.
- El conjunto de datos de entrenamiento no esta documentado ("on an unknown dataset"), por lo que no se puede evaluar su cobertura, su posible sesgo de dominio ni su representatividad.
- No hay informacion sobre sesgos conocidos. En un corpus religioso, un desequilibrio en las fuentes de entrenamiento podria traducirse en peor rendimiento sobre determinadas tradiciones, epocas o escuelas, sin que el autor lo haya declarado.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre. El riesgo equivalente es la asignacion erronea de etiquetas a tokens ambiguos, especialmente en fronteras entre matn e isnad.
- La model card es un esqueleto autogenerado por el Trainer, con las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" marcadas como "More information needed".
- El repositorio no tiene descargas ni likes, y no consta una validacion externa de los resultados.
- El modelo es de octubre de 2026 y esta construido sobre Transformers 5.17.0; conviene verificar la compatibilidad con versiones mas antiguas de la libreria.
- Licencia Apache 2.0: permite uso comercial y modificacion, con la obligacion de conservar el aviso de licencia y de atribucion. Al derivar de CAMeLBERT-MSA, conviene revisar tambien las condiciones del modelo base.
- El repositorio pesa 5,2 GB, lo que encarece la descarga y el almacenamiento en relacion con el tamano real de los pesos.
- No se declaran idiomas soportados en los metadatos; su uso fuera del arabe estandar moderno (por ejemplo, en dialectos o en arabe historico con ortografia no normalizada) no esta respaldado por ninguna documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhaqiq/muhaqiq-span-detector
- Modelo base: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-msa
- Busqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos) en los resultados disponibles.
