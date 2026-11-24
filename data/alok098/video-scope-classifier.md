# alok098/video-scope-classifier

## Resumen

Video Scope Classifier es un clasificador de texto de muy pequeno tamano desarrollado por el usuario alok098 (perfil de Hugging Face) que resuelve un problema concreto dentro de pipelines de video-question answering: decidir cuanta parte de un video necesita ver un VLM (vision-language model) para responder a una pregunta del usuario. El modelo clasifica cada consulta en una de tres etiquetas de alcance: FRAME (unos pocos fotogramas sueltos), CLIP (un fragmento contiguo del video) o WHOLE (el video completo). De este modo, un router de consultas puede recuperar solo la evidencia necesaria y reducir el coste computacional de la inferencia multimodal.

Tecnicamente no es un transformer generativo, sino un clasificador lineal (regresion logistica multinomial) sobre caracteristicas lexicas, heuristicas, semanticas y de forma de recuperacion. Se construye sobre los embeddings estaticos de minishlab/potion-base-8M (8M de parametros), reimplementados en numpy con tabla int8 para evitar dependencias de torch o scikit-learn en tiempo de ejecucion. El artefacto pesa 7,6 MB y resuelve una consulta en aproximadamente 0,42 ms sobre un nucleo de CPU.

Su relevancia actual radica en que ataca el cuello de botella economico de los sistemas de video-QA: enviar siempre el video completo a un VLM es caro e innecesario para muchas preguntas. El modelo ofrece una decision consciente del coste (con lambda = 2) y devuelve probabilidades, la modalidad de evidencia (VISUAL, OCR o SPEECH) y metadatos de recuperacion, lo que lo hace integrable como componente de enrutamiento previo a la inferencia pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal (regresion logistica multinomial) sobre caracteristicas TF-IDF, heuristicas, embedding estatico potion-base-8M (reimplementado en numpy, int8) y forma de recuperacion BM25 |
| Parametros totales | no disponible (el modelo base potion-base-8M tiene 8M; el clasificador es un modelo lineal de muy bajo parametro) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa consultas individuales y subtitulos indexados por chunks de 30 s) |
| Tipos de cuantizacion | tabla de embeddings en int8 (coseno >= 0,9999 frente a float32); pesos en JSON y `.npz` con `allow_pickle=False` |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | JSON + `.npz` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo combina cuatro grupos de caracteristicas. El grupo A es lexico: TF-IDF de unigramas y bigramas de palabras mas n-gramas de caracteres de 3 a 5 (tolerante a errores tipograficos), con un coste de unos 75 microsegundos. El grupo B son 19 indicadores heuristicos (global, exhaustivo, orden, conteo, ancla, accion, causa, atributo, OCR, habla, entre otros), la primera palabra interrogativa y la decision de una lista de reglas escrita a mano como prior, con unos 90 microsegundos. El grupo D es un embedding estatico de 256 dimensiones derivado de potion-base-8M, reimplementado en numpy con tabla int8, con 30-95 microsegundos. El grupo E mide la forma de la recuperacion: BM25 sobre los subtitulos del propio video en chunks de 30 segundos, usando la forma de los aciertos (pico, entropia, dispersion temporal, cobertura) y no las puntuaciones, con unos 55 microsegundos.

Sobre estas caracteristicas se ajusta una regresion logistica multinomial que produce las probabilidades de FRAME, CLIP y WHOLE. La decision final no es el argmax, sino la opcion de menor coste esperado segun `frames/32 + lambda * [scope mas estrecho que el necesario]`, con lambda = 2, de forma que perder la respuesta cuesta al menos una re-consulta con WHOLE. El entrenamiento se realizo sobre 270 preguntas de Video-MME etiquetadas por un juez LLM contra una rubrica de 12 reglas (el benchmark original no tiene etiquetas de alcance), con validacion cruzada 5x5 agrupada por video. Se aplicaron reescrituras de consultas (palabras clave, estilo casual, errores tipograficos) para mejorar la robustez ante consultas reales. Los pesos se cargan sin pickle y el runtime solo requiere numpy.

## Capacidades

- Clasificacion de alcance de consulta en tres etiquetas: FRAME, CLIP y WHOLE.
- Devolucion de probabilidades por clase, nivel de confianza y decision consciente del coste (prefiere el alcance mas amplio cuando hay incertidumbre).
- Identificacion de la modalidad de evidencia requerida: VISUAL, OCR o SPEECH, con un plan de modalidad asociado.
- Indexacion opcional de subtitulos por video (formato SRT) con duracion en segundos para calcular caracteristicas de recuperacion BM25.
- Tolerancia a errores tipograficos y a consultas reescritas en estilo casual o de palabras clave.
- Ejecucion sin torch, sin scikit-learn y sin pickle: unicamente numpy en tiempo de ejecucion.
- Salida con latencia medida por consulta y metadatos de recuperacion (numero de fotogramas y estrategia).
- Capacidad multilingue limitada al ingles (idioma declarado: en).

## Casos de uso

- Enrutamiento previo en pipelines de video-QA: antes de invocar un VLM, el clasificador decide si basta con 4 fotogramas, 16 fotogramas de una ventana contigua o 32 fotogramas del video completo, reduciendo el coste de inferencia multimodal. Es adecuado por su latencia de 0,42 ms y su naturaleza de componente ligero.
- Atencion al cliente sobre grabaciones o videotutoriales: permite responder preguntas puntuales ("que color tiene el abrigo del presentador") enviando solo fotogramas clave, y preguntas globales ("de que trata el video") enviando el video completo.
- Sistemas de busqueda y recuperacion de video a escala: al ejecutarse a unas 2.300 consultas por segundo y nucleo, puede clasificar grandes volumenes de consultas de usuarios antes de tocar el almacenamiento de video.
- Moderacion y analisis de contenido audiovisual: la deteccion de modalidad (OCR, SPEECH, VISUAL) permite dirigir la consulta al extractor adecuado (transcripcion, OCR de fotogramas o analisis visual) sin procesar todas las modalidades.
- Asistentes de accesibilidad sobre video: para preguntas de usuarios con discapacidad visual o auditiva, el enrutamiento a la modalidad correcta (por ejemplo, SPEECH para contenido hablado) mejora la pertinencia de la respuesta.
- Investigacion en evaluacion de VLM: sirve como componente de referencia para medir cuanto del rendimiento de un VLM depende de la seleccion de evidencia, y para comparar estrategias de recuperacion frente a enviar siempre el video completo.
- Integracion en agentes multi-paso: el plan de modalidad y el alcance devueltos pueden alimentar la siguiente accion de un agente que orquesta herramientas de vision, OCR y transcripcion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluacion sobre 270 preguntas de Video-MME de 90 videos, con validacion cruzada 5x5 agrupada por video e intervalos de confianza bootstrap al 95% por cluster de video.

| Modelo | macro-F1 [IC 95%] | Latencia p50 | Tamano |
|---|---|---|---|
| task_type lookup (usa metadatos del benchmark) | 0,617 [0,559; 0,667] | no disponible | no disponible |
| Solo reglas escritas a mano | 0,695 [0,642; 0,743] | 0,08 ms | ~0 |
| **Este modelo** | **0,708 [0,657; 0,753]** | **0,42 ms** | **7,6 MB** |
| MiniLM-L6 (congelado, ONNX int8) sustituyendo D | 0,703 [0,653; 0,746] | 6,8 ms | 24,5 MB |
| MiniLM-L6 int8 anadido a D | 0,710 [0,661; 0,756] | 6,9 ms | 31,5 MB |

Metricas adicionales declaradas: accuracy de 0,715 con validacion cruzada 5x5 agrupada por video; macro-F1 de 0,698 con validacion cruzada anidada (ajustada por seleccion); macro-F1 de 0,817 en las 160 etiquetas inequivocas y 0,528 en las 110 ambiguas. En enrutamiento con lambda = 2, la infra-ruta es del 6,2%, una pregunta WHOLE se envia como FRAME solo el 0,7% de las veces, y el router cierra el 92% de la brecha de enrutamiento con el 68% del computo de enviar siempre WHOLE (un oraculo necesitaria el 58,5%). En consultas de estilo usuario (reescritas) obtiene 0,67-0,68 frente a 0,62-0,66 sin reescrituras.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y no requiere GPU. El artefacto ocupa 7,6 MB en disco.
- GPU recomendadas: no aplica; el runtime es numpy puro sobre CPU.
- Cabe en cualquier maquina consumer: un solo nucleo de CPU es suficiente (0,42 ms por consulta, unas 2.300 consultas por segundo y nucleo).
- Opciones de despliegue: ejecucion directa en Python con numpy y `huggingface_hub.snapshot_download`; el repositorio incluye `example.py` y el modulo `intent.runtime.ScopeRuntime`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque no es un modelo generativo.
- Latencia y throughput: 0,42 ms de mediana por consulta en un nucleo de CPU; aproximadamente 2.300 consultas por segundo y nucleo. El desglose por grupo de caracteristicas es de unos 75 microsegundos (lexico), 90 microsegundos (heuristicas), 30-95 microsegundos (semantica) y 55 microsegundos (forma de recuperacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video Scope Classifier (este modelo) | no disponible (lineal sobre potion-base-8M) | no disponible | macro-F1 0,708; 0,42 ms; 7,6 MB | MIT | Hugging Face |
| MiniLM-L6 (congelado, ONNX int8) sustituyendo D | no disponible | no disponible | macro-F1 0,703; 6,8 ms; 24,5 MB | no disponible | no disponible |
| MiniLM-L6 int8 anadido a D | no disponible | no disponible | macro-F1 0,710; 6,9 ms; 31,5 MB | no disponible | no disponible |
| Solo reglas escritas a mano | ~0 | no disponible | macro-F1 0,695; 0,08 ms | no disponible | no disponible |

La comparativa se limita a las alternativas evaluadas por el propio autor en la model card. No se dispone de datos de otros clasificadores de alcance de consulta comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Etiquetas generadas por un juez LLM contra una rubrica de 12 reglas, no por anotacion humana completa; hay una auditoria humana ciega de 60 preguntas en curso segun la model card.
- El lexico de indicadores y las reglas se disenaron sobre las mismas 270 preguntas con las que se evaluan, por lo que las puntuaciones pueden estar optimistamente sesgadas (el autor lo senala explicitamente).
- El techo de rendimiento lo marca la ambiguedad de las etiquetas: macro-F1 de 0,817 en etiquetas inequivocas frente a 0,528 en ambiguas.
- Un intento previo de medir etiquetas con un profesor Qwen2-VL-7B en 4 bits produjo etiquetas inutilizables (precision plana de 4 a 32 fotogramas), lo que motivo el uso de etiquetas de intencion.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Es un clasificador de intencion, no un modelo generativo: no responde preguntas ni procesa video por si mismo, solo decide el alcance y la modalidad.
- La licencia MIT permite uso comercial, pero el modelo base potion-base-8M y el dataset aintropy-ai/video-mme-sample10 tienen sus propias condiciones que deben verificarse por separado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (6,2% de infra-ruta declarada) que degrade la respuesta del VLM posterior.
- La integracion requiere indexar subtitulos por video para aprovechar las caracteristicas de recuperacion; sin `video_id` esas caracteristicas se desactivan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alok098/video-scope-classifier
- Modelo base potion-base-8M: https://huggingface.co/minishlab/potion-base-8M
- Dataset de evaluacion: https://huggingface.co/datasets/aintropy-ai/video-mme-sample10
- Perfil del autor: https://huggingface.co/alok098
