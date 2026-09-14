# MooreMuaMu/Qwen3.5-27B-Ancient-Scheme1b-Tender100

## Resumen

Qwen3.5-27B-Ancient-Scheme1b-Tender100 es un ajuste fino del modelo base Qwen/Qwen3.5-27B, publicado por el usuario MooreMuaMu, orientado a la interpretación y traducción de lenguas antiguas o de tradición escrita minoritaria: chino (zh), uigur (ug), mongol tradicional (mn) y tibetano (bo). El pipeline declarado en HuggingFace es image-text-to-text, heredado de la arquitectura multimodal del modelo base, aunque el autor indica explícitamente que en esta ronda solo se han verificado tareas de texto.

Se trata de un checkpoint completamente fusionado: 496 módulos LoRA del entrenamiento se han integrado en los pesos, de modo que el repositorio se carga directamente sin adaptadores adicionales. El punto de partida del ajuste es un checkpoint intermedio de SFT interno (stage2 SFT checkpoint227) y el sufijo "Tender100" corresponde al paso global del optimizador en la fase de RL (no a pasos de SFT).

El interés de esta ficha radica en que documenta un caso poco habitual: un modelo de 27.356 millones de parámetros especializado en traducción de lenguas históricas mediante aprendizaje por refuerzo con GRPO/DAPO, con una evaluación publicada de solo 96 preguntas fijas y con intervalos de confianza que cruzan el cero. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que la arquitectura de partida es Qwen3.5-27B; el pipeline declarado es image-text-to-text) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el ejemplo de la model card usa max_model_len=16384, sin declararlo como maximo |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos BF16 en safetensors (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | zh (chino), ug (uigur), mn (mongol tradicional), bo (tibetano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (12 fragmentos BF16), mas tokenizer, configuracion y chat template completos |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna del modelo base Qwen3.5-27B (atención, número de capas, tipo de atención o si incorpora componentes híbridos). Lo que sí se documenta es el procedimiento de ajuste: el punto de partida directo es un checkpoint intermedio ya fusionado de SFT (stage2 SFT checkpoint227) sobre Qwen3.5-27B, y sobre él se aplica una fase de aprendizaje por refuerzo. El resultado final es la fusión de 496 módulos LoRA en los pesos base, realizada en FP32 para el producto B@A y la suma, con conversión posterior al dtype de los pesos base; el repositorio incluye un archivo MODEL_PROVENANCE.json con los detalles de verificación. El repositorio ocupa 54,7 GB, coherente con 27,36 mil millones de parámetros en BF16.

La fase de RL se describe con estos hiperparámetros y decisiones de diseño: recompensa sobre la respuesta final, hard format gate, dropout desactivado, beta = 0,001, normalización DAPO sobre tokens globales válidos y std floor = 0,02. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo una fase previa de RLHF o DPO adicional. La model card advierte de dos matices técnicos relevantes: los grupos con varianza no nula baja reducen el advantage en lugar de descartarse automáticamente, y la fluidez del razonamiento o el cumplimiento de formato no garantizan que la respuesta sea correcta.

## Capacidades

- Traducción de textos en uigur, mongol tradicional y tibetano hacia chino simplificado, y tareas de interpretación o glosa (explicación de significado) en esos mismos idiomas.
- Generación con modo de pensamiento activado: el chat template debe usarse con enable_thinking=True, por lo que el modelo produce una traza de razonamiento antes de la respuesta final.
- Salida estructurada mediante etiquetas: la respuesta final se delimita con `<ANS>…</ANS>`, lo que facilita el parseo automático en pipelines.
- Conversación multi-turno mediante chat template de tipo conversacional.
- Capacidades multimodales heredadas (pipeline image-text-to-text), aunque no verificadas en esta versión: el autor indica que solo se han validado tareas de texto. En el ejemplo de despliegue se fuerza `limit_mm_per_prompt={"image": 0, "video": 0}`.
- Soporte de tool calling / function calling y de agentes: no disponible (no se menciona en la información proporcionada).
- Capacidad multilingüe general fuera de zh/ug/mn/bo: no disponible; los idiomas declarados se limitan a esos cuatro.

## Casos de uso

- Traducción asistida de corpus históricos: el modelo traduce uigur, mongol tradicional y tibetano a chino simplificado siguiendo la convención de prompt de la model card, lo que permite procesar lotes de documentos y volcar la salida delimitada por `<ANS>…</ANS>` a una base de datos de traducciones revisables por un filólogo.
- Glosado y explicación léxica en filología: además de traducir, el ajuste cubre buckets de "释义" (explicación de significado), útil para generar notas preliminares que un especialista corrige después.
- Apoyo a la catalogación de fondos bibliográficos: bibliotecas y archivos con material en mongol tradicional o tibetano pueden preprocesar metadatos y fragmentos de texto para producir descripciones en chino antes de la revisión catalográfica humana.
- Docencia universitaria de lenguas clásicas: el modelo puede generar versiones de trabajo y comentarios de pasajes, siempre con la advertencia de que la recompensa de entrenamiento no equivale a corrección semántica, por lo que el material debe usarse como borrador didáctico y no como referencia autorizada.
- Investigación en evaluación de RL para lenguas de bajos recursos: el repositorio publica curvas de recompensa por checkpoint (90, 100, 110, 120) y los archivos de evaluación, lo que permite reproducir el análisis de selección de checkpoint y estudiar la sensibilidad de las recompensas al fraseo de referencia.
- Construcción de conjuntos de datos paralelos: al ser un modelo fusionado y desplegable con vLLM en cuatro GPUs, puede ejecutarse sobre grandes volúmenes de texto para generar alineaciones candidatas que después se filtran y se validan manualmente.
- Evaluación comparativa de checkpoints de un mismo run: con seed fijo (por ejemplo, 20260906) y una configuración de muestreo estable (temperature 0,7, top_p 0,95, max_tokens 8192), sirve como referencia interna para comparar variantes de entrenamiento bajo las mismas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único publicado es una evaluación interna de 96 preguntas fijas (16 por bucket, con buckets de glosa y traducción para uigur, mongol tradicional y tibetano), comparando checkpoints del mismo run de RL. Los datos de la model card son los siguientes:

| Checkpoint | Reward ponderada por numero de preguntas del bucket | Macro equiponderada de seis buckets | Fallos de formato / 96 | Truncamientos / 96 |
|---|---:|---:|---:|---:|
| 90 | 0,556995 | 0,664151 | 2 | 0 |
| 100 (este modelo) | 0,561482 | 0,682861 | 0 | 0 |
| 110 | 0,553403 | 0,677876 | 0 | 0 |
| 120 | 0,544188 | 0,673266 | 0 | 0 |

El autor precisa que la diferencia de reward ponderada entre el checkpoint 100 y el 90 es de +0,004487, con un intervalo de confianza exploratorio del 95 % pareado de [−0,022955, +0,030698], que cruza el cero. La mejora se concentra en dos casos de recuperación de formato y en un caso de respuesta acortada. La recompensa es sensible al fraseo de referencia y no equivale a tasa de acierto semántico. El conjunto de prueba se usó para selección de checkpoint y depuración, por lo que no es un holdout limpio, y no se ha completado la batería completa de 2300 preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 54,7 GB (27,36 mil millones de parámetros × 2 bytes), por lo que se necesitan alrededor de 60-70 GB de VRAM solo para pesos, más el espacio de caché KV y activaciones.
- Configuración validada por el autor: vLLM con tensor_parallel_size=4, dtype bfloat16, max_model_len=16384, max_num_seqs=32, max_num_batched_tokens=8192, enforce_eager=True, enable_prefix_caching=False y gpu_memory_utilization=0,78. Esto implica un despliegue en al menos cuatro GPUs de capacidad suficiente para repartir esos 54,7 GB más el margen de caché.
- GPUs recomendadas: no se especifican modelos concretos en la información proporcionada. Por tamaño, un despliegue en BF16 exige GPUs de centro de datos tipo A100 80 GB, H100 80 GB o A800/H800, en configuración multi-GPU. La información no confirma ninguna combinación concreta.
- Cabe en GPU de consumo: en BF16, no. No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) del repositorio, por lo que no se puede confirmar un despliegue en una única RTX 4090 (24 GB) o RTX 3090 sin cuantizar previamente los pesos por cuenta propia.
- Opciones de despliegue: el autor documenta explícitamente Transformers 5.16.1, vLLM 0.23.0, Torch 2.11.0 y ms-swift 4.5.2. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor no publica métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer comparaciones con modelos de traducción de lenguas históricas (por ejemplo, variantes especializadas de Qwen, Tower o ALMA). La comparación posible se limita a las variantes dentro del mismo run de entrenamiento y al modelo base.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-Ancient-Scheme1b-Tender100 (este) | 27,36 mil millones | no disponible | Reward ponderada 0,561482; macro 0,682861 en 96 preguntas | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Checkpoint 90 del mismo run | no disponible | no disponible | Reward ponderada 0,556995; macro 0,664151 | no disponible | No publicado como repositorio independiente en la informacion disponible |
| Checkpoint 110 del mismo run | no disponible | no disponible | Reward ponderada 0,553403; macro 0,677876 | no disponible | No publicado como repositorio independiente en la informacion disponible |
| Qwen/Qwen3.5-27B (modelo base) | 27B (dato no verificado en la informacion disponible) | no disponible | No se han publicado resultados de benchmarks en la informacion disponible | apache-2.0 (segun la ficha del ajuste, no verificado) | HuggingFace |

## Limitaciones y advertencias

- La evaluación publicada cubre solo 96 preguntas (16 por bucket en seis buckets); la batería completa de 2300 preguntas no se ha ejecutado. Las conclusiones sobre calidad son, por tanto, preliminares.
- El conjunto de prueba se utilizó para seleccionar checkpoint y depurar el run, de modo que no es un holdout limpio. El autor lo reconoce explícitamente.
- La mejora del checkpoint 100 frente al 90 tiene un intervalo de confianza del 95 % que cruza el cero; no se ha demostrado una mejora fiable.
- La recompensa de RL es sensible al fraseo de referencia y no equivale a corrección semántica. El autor advierte que ni la fluidez del razonamiento ni el cumplimiento de formato garantizan respuestas correctas, por lo que existe riesgo de alucinación en contenido histórico, léxico o gramatical.
- Riesgo de alucinación agravado por el dominio: se trata de lenguas de bajos recursos donde la verificación automática es difícil y donde la terminología especializada puede ser inventada con apariencia plausible.
- Sesgos conocidos: no se documentan análisis de sesgo en la información proporcionada.
- Limitaciones de idioma: los idiomas declarados son únicamente chino, uigur, mongol tradicional y tibetano. No hay evidencia de comportamiento fiable en otras lenguas, incluido el castellano.
- Capacidades multimodales no verificadas: aunque el pipeline es image-text-to-text, el autor indica que esta ronda solo validó texto y el ejemplo de despliegue desactiva imagen y vídeo.
- Restricciones de licencia: el modelo se publica bajo apache-2.0, lo que en principio permite uso comercial. No obstante, la model card no detalla la procedencia ni la licencia de los datos de entrenamiento de la fase de RL, lo que convierte la verificación de derechos sobre los corpus en una tarea pendiente para uso comercial.
- Dependencia de formato: el resultado debe generarse con enable_thinking=True y con la respuesta final dentro de `<ANS>…</ANS>`; el autor advierte de que no se deben eliminar etiquetas duplicadas automáticamente y tratar el resultado como si fuera conforme al formato original.
- Sin validación comunitaria: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación externa independiente.
- No hay versiones cuantizadas publicadas, lo que limita el despliegue en hardware de gama de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MooreMuaMu/Qwen3.5-27B-Ancient-Scheme1b-Tender100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Archivo de procedencia de la fusión citado en la model card: MODEL_PROVENANCE.json (dentro del repositorio)
- Resumen de evaluación citado en la model card: evaluation_summary.json (dentro del repositorio)
- Prompt de sistema requerido: system_prompt.txt (dentro del repositorio)
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a páginas de soporte de un navegador y no guardan relación con el contenido solicitado).
