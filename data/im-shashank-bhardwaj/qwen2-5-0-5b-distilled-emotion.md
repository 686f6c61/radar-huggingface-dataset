# im-shashank-bhardwaj/Qwen2.5-0.5B-Distilled-Emotion

## Resumen

Qwen2.5-0.5B-Distilled-Emotion es un ajuste fino del modelo Qwen/Qwen2.5-0.5B-Instruct (494.032.768 parametros) especializado en clasificacion de emociones en tuits. Lo publica el usuario de HuggingFace im-shashank-bhardwaj y su proposito es transferir a un modelo sub-billon de parametros las capacidades de razonamiento de un LLM de escala cloud, concretamente GLM 5.3 Flash servido por Fireworks.ai, mediante destilacion de 4.041 trazas de Chain-of-Thought (CoT). El resultado es un clasificador que ejecuta localmente en hardware de consumo con coste de inferencia nulo.

El modelo resuelve un problema muy concreto: la clasificacion de emociones sobre el dataset cardiffnlp/tweet_eval (etiquetas anger, joy, optimism y sadness) sin necesidad de infraestructura en la nube. Frente al modelo base, que obtiene un 61,66% de accuracy, la configuracion con LoRA de rango 32 alcanza un 74,90% y cierra el 87,0% de la brecha existente respecto al modelo profesor (76,88%). Ademas, elimina por completo los fallos de formato en la salida: 0 respuestas no parseables frente a 7 en el baseline.

Su relevancia actual radica en el eje coste-rendimiento: demuestra que con un 2,375% de parametros entrenables (11,73M sobre 494M) y entrenamiento nativo en Apple Silicon con MLX y LoRA, un modelo que cabe en cualquier portatil puede aproximarse a un LLM cloud de gran escala en una tarea de clasificacion acotada. El repositorio se distribuye en safetensors para MLX y tambien es cargable con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), ajustado con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos safetensors sin cuantizar (MLX permite cuantizacion posterior) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx); compatible con carga via Transformers |

Otros datos del repositorio: tamano del repositorio 1,0 GB; descargas 0; likes 1; creado el 2026-10-13; actualizado el 2026-10-13; pipeline text-generation.

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 494M parametros de la familia Qwen2.5, en su variante Instruct. El ajuste se realizo con Low-Rank Adaptation (LoRA) sobre los pesos congelados, evaluando dos configuraciones: rango 8 con 2.932.736 parametros entrenables (0,594% del total) y rango 32 con 11.730.944 parametros entrenables (2,375%). El entrenamiento se ejecuto de forma nativa en Apple Silicon con el framework mlx-lm, sin GPU dedicada.

La innovacion metodologica es la destilacion de razonamiento, no de etiquetas. En lugar de imitar unicamente la etiqueta final del profesor, se recogieron 4.041 trazas de Chain-of-Thought generadas por el modelo profesor (denominado "GLM 5.3 Flash" y "GLM-4 5.3 Flash" de forma inconsistente en la model card, alojado serverless en Fireworks.ai) para cada instancia de entrenamiento. El estudiante aprende asi a producir 2-3 frases de razonamiento conciso y, a continuacion, una linea con el formato exacto "Final Label: <etiqueta>". El dataset de trabajo es cardiffnlp/tweet_eval. La evaluacion se realizo sobre 506 muestras de test reservadas. No se documentan en la informacion disponible el uso de RLHF, DPO ni detalles sobre el volumen total de tokens vistos durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional y de razonamiento encadenado (Chain-of-Thought) en formato de 2-3 frases antes de emitir la etiqueta final.
- Clasificacion de emociones en texto corto con cuatro etiquetas fijas: anger, joy, optimism y sadness.
- Emision de salida estructurada y estable: 0 respuestas no parseables en la configuracion de rango 32, frente a 7 del modelo base, lo que facilita el consumo programatico del resultado.
- Soporte de plantilla de chat conversacional mediante apply_chat_template, con salida en un unico turno por consulta.
- Ejecucion local en hardware de consumo con latencia objetivo por debajo del segundo.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y evaluado unicamente en ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo clasifica en milisegundos el tono emocional de un tuit o comentario, permitiendo priorizar la revision humana de los mensajes con mayor probabilidad de contener anger (F1 de 0,8072 en esta clase) sin enviar el texto a un servicio externo.
- Analisis de sentimiento en tiempo real en el edge: al ejecutarse con MLX sobre Apple Silicon, puede integrarse en aplicaciones de escritorio o moviles que procesan flujos de publicaciones sin conexion y con coste de inferencia nulo, algo inviable con el modelo profesor.
- Monitorizacion de reputacion de marca: pipelines que ingestan menciones de una marca y agregan las etiquetas joy, optimism, sadness y anger a lo largo del tiempo para detectar cambios abruptos en la percepcion publica.
- Investigacion en ciencias sociales y analisis de opinion publica: el dataset de referencia es tweet_eval, de modo que el modelo encaja directamente en estudios que necesitan anotar corpus de Twitter/X a gran escala con un esquema de cuatro emociones y trazabilidad del razonamiento.
- Enrutamiento de tickets de soporte al cliente: la deteccion de sadness o anger en el primer mensaje permite derivar automaticamente el ticket a un equipo especializado o elevar su prioridad, aprovechando que el razonamiento intermedio queda registrado y es auditable.
- Deteccion de riesgo y bienestar en comunidades online: la clase sadness, con recall reportado de hasta el 66,9%, sirve como senal de alerta temprana para sistemas que dirigen a usuarios hacia recursos de apoyo, siempre como filtro y nunca como decision automatica final.
- Investigacion sobre destilacion y eficiencia de parametros: el repositorio incluye la comparativa completa de LoRA r=8 frente a r=32, lo que lo convierte en un caso de estudio util para experimentos de transferencia de razonamiento entre modelos de escalas muy distintas.

## Benchmarks y rendimiento

Evaluacion sobre 506 muestras de test reservadas del dataset cardiffnlp/tweet_eval.

| Metrica | Profesor (glm-5p3-flash) | Qwen 2.5 0.5B (baseline) | Distilado r=8 | Distilado r=32 | Delta (r=32 vs baseline) |
|---|---|---|---|---|---|
| Tamano | Cloud (gran escala) | 494M | 494M (2,93M ajustados) | 494M (11,73M ajustados) | — |
| Accuracy | 76,88% (389/506) | 61,66% (312/506) | 72,92% (369/506) | 74,90% (379/506) | +13,24% |
| Macro F1 | 0,7155 | 0,5937 | 0,6783 | 0,6880 | +0,0943 (+15,9%) |
| Weighted F1 | 0,7705 | 0,6268 | 0,7278 | 0,7423 | +0,1155 (+18,4%) |
| Salidas no parseables | 1 (0,2%) | 7 (1,4%) | 0 (0,0%) | 0 (0,0%) | Formato valido en el 100% |
| Deficit frente al profesor | Referencia | -15,22% | -3,96% | -1,98% | 87,0% del deficit cerrado |

| Clase | Soporte | F1 baseline | F1 r=8 | F1 r=32 | F1 profesor |
|---|---|---|---|---|---|
| Anger | 212 | 0,6667 | 0,7887 | 0,8072 | 0,8510 |
| Joy | 117 | 0,6912 | 0,8198 | 0,8069 | 0,7490 |
| Sadness | 133 | 0,5644 | 0,6407 | 0,6717 | 0,7447 |
| Optimism | 44 | 0,4524 | 0,4694 | 0,4638 | 0,5169 |

Notas del autor: los dos estudiantes destilados superan al profesor en la clase joy (+5,8 a +7,1 puntos de F1). La clase optimism es la mas debil, con precision de 0,6400 en r=32 frente a 0,4259 en r=8, y soporte muy reducido (44 muestras). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 el modelo completo ocupa aproximadamente 1 GB de pesos, coherente con el tamano del repositorio (1,0 GB). Cabe comodamente en cualquier GPU de consumo con 4 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4060, RTX 4090, A100, H100) por exceso de capacidad; tambien CPU y, de forma nativa y documentada, Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, en practicamente todas las de gama media y alta de los ultimos anos. El caso de uso principal declarado por el autor es Apple Silicon, que no requiere GPU dedicada.
- Opciones de despliegue: mlx-lm (via mlx_lm.generate, ruta oficial del autor) y Transformers con AutoModelForCausalLM. vLLM, llama.cpp, Ollama y TGI no estan documentados por el autor; llama.cpp y Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no se publican mediciones. El autor fija como objetivo "latencia sub-segundo" para el modelo estudiante, pero no aporta cifras de tokens por segundo ni de latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Distilled-Emotion (r=32) | 494M (11,73M ajustados) | No disponible | 74,90% / Macro F1 0,6880 | Apache 2.0 | HuggingFace, formato MLX/safetensors |
| Qwen 2.5 0.5B (baseline) | 494M | No disponible | 61,66% / Macro F1 0,5937 | Apache 2.0 | HuggingFace |
| GLM 5.3 Flash (profesor) | No disponible (escala cloud) | No disponible | 76,88% / Macro F1 0,7155 | No disponible | Serverless via Fireworks.ai |

Frente a clasificadores encoder-only tipo BERT o DistilBERT ajustados sobre tweet_eval, no se dispone de datos comparativos en la informacion proporcionada. La ventaja diferencial de este modelo respecto al profesor no es la precision, sino la ejecucion local sin coste por token y la ausencia de dependencia de un proveedor cloud.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo. El entrenamiento se apoya en tweet_eval, un corpus de Twitter/X en ingles con los sesgos de estilo, demografia y tematica propios de la plataforma y del periodo de recogida.
- Riesgo de alucinacion: el modelo genera razonamiento libre antes de la etiqueta. Aunque en la evaluacion no produjo salidas no parseables, el texto de razonamiento puede ser plausible pero incorrecto; conviene consumir unicamente la linea "Final Label:" y no el razonamiento como justificacion fiable.
- Limitacion de idioma: soporte exclusivo de ingles. Su uso sobre texto en castellano no esta validado y previsiblemente degradara el rendimiento.
- Limitacion de dominio: entrenado para clasificacion de emociones en texto corto tipo tuit. No es un modelo de proposito general y su uso fuera de ese esquema de cuatro etiquetas no esta soportado.
- Clase optimism muy debil: F1 de 0,4638 con solo 44 muestras de soporte en test. Las metricas de esta clase son estadisticamente fragiles y su baja precision relativa (0,6400) genera falsos positivos.
- Restricciones de licencia: Apache 2.0, por lo que se permite uso comercial. La licencia enlazada en la model card apunta al LICENSE de Qwen/Qwen2.5-0.5B-Instruct, de modo que conviene revisar tambien las condiciones del modelo base.
- Caveats de produccion: el modelo es un ajuste fino de un modelo sub-billon de parametros, no una mejora sobre el estado del arte. El deficit frente al profesor sigue siendo de 1,98 puntos de accuracy. No hay validacion externa, el repositorio acumula 0 descargas y 1 like, el autor es individual y no se aportan semillas, hiperparametros completos ni desglose del conjunto de entrenamiento. Las fechas de creacion y actualizacion indicadas (2026-10-13) resultan anomales y deben verificarse antes de citar el modelo.
- Uso responsable: cualquier aplicacion sobre estados emocionales de personas deberia tratar la salida como senal auxiliar y no como diagnostico ni como criterio unico de decision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/im-shashank-bhardwaj/Qwen2.5-0.5B-Distilled-Emotion
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia referenciada en la model card: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Dataset de referencia citado en la model card: cardiffnlp/tweet_eval (https://huggingface.co/datasets/cardiffnlp/tweet_eval)
- Los resultados de busqueda web realizados no devolvieron enlaces relevantes al modelo (paper, blog, repositorio o demo adicionales): no disponible.
