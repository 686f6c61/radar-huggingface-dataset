# slmyu0915/hw1-hc3-detector

## Resumen

El modelo `slmyu0915/hw1-hc3-detector` es un clasificador binario de texto en ingles disenado para distinguir respuestas escritas por humanos (etiqueta 0) de respuestas generadas por ChatGPT (etiqueta 1). Se trata de un ajuste fino (fine-tuning) del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus HC3 (Human ChatGPT Comparison Corpus) de Hello-SimpleAI. Fue publicado por el usuario slmyu0915 el 1 de octubre de 2026 y se distribuye a traves de HuggingFace dentro del pipeline `text-classification`.

Arquitectonicamente es un transformer encoder de tipo BERT comprimido (MiniLM), con 22.713.986 parametros totales y pesos en formato safetensors. No es un modelo generativo ni un modelo de embeddings de proposito general: se ha reentrenado especificamente como cabeza de clasificacion sobre la representacion del encoder. El entrenamiento se realizo durante 5 epocas con el optimizador AdamW (lr = 2e-5), tamano de lote 32 y longitud maxima de secuencia de 256 tokens.

Su relevancia es limitada y de caracter academico: reproduce el resultado de una tarea practica (HW1) y alcanza una precision del 98,56 % en el conjunto de test de HC3, muy por encima del baseline de embeddings congelados mas regresion logistica (84,49 %). El propio autor advierte de que se entreno sobre un benchmark historico (ChatGPT de finales de 2022) y que no es un detector fiable para texto generado por IA actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM, base `all-MiniLM-L6-v2`) con cabeza de clasificacion |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrenamiento segun la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de 6 capas derivado de MiniLM con 22,7 millones de parametros, habitualmente empleado para generar embeddings de frases. Sobre esa base se anadio una cabeza de clasificacion binaria y se ajusto el conjunto completo del modelo para la tarea de deteccion de texto generado. El entrenamiento se realizo sobre el corpus HC3, que empareja respuestas humanas y respuestas de ChatGPT sobre las mismas preguntas en ingles.

Los hiperparametros declarados en la model card son: 5 epocas, optimizador AdamW con tasa de aprendizaje 2e-5, tamano de lote 32 y truncado a 256 tokens. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset utilizado mas alla de HC3, ni si se aplicaron tecnicas de regularizacion adicionales, RLHF o DPO (esto ultimo no tendria sentido en un clasificador). La unica innovacion destacable reportada es la comparacion frente a un baseline de embeddings congelados mas regresion logistica, que el ajuste fino supera en unos 14 puntos de precision.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que una respuesta este escrita por un humano (0) o generada por ChatGPT (1).
- Deteccion de texto generado por IA limitada al dominio y estilo del corpus HC3 (respuestas de tipo pregunta-respuesta en ingles).
- Inferencia ligera: por su tamano reducido puede ejecutarse en CPU y en GPUs de gama baja.
- No soporta generacion de texto.
- No soporta tool calling ni function calling.
- No dispone de capacidades de agente, multi-step reasoning ni modo de razonamiento explicito.
- No soporta vision, audio ni otras modalidades.
- Capacidad multilingue: no. Solo ingles.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Docencia y practicas de NLP: el modelo sirve como ejemplo reproducible de ajuste fino de un encoder para una tarea de clasificacion binaria sobre HC3. Es util para comparar con el baseline de regresion logistica y entender el impacto del fine-tuning.
- Filtrado de respuestas sinteticas en prototipos academicos: en un pipeline de investigacion se puede usar para marcar respuestas sospechosas de haber sido generadas por ChatGPT en un corpus historico concreto (estilo HC3 de 2022).
- Analisis retrospectivo de datasets: ayuda a auditar colecciones de respuestas recopiladas en 2022-2023 y estimar la proporcion de texto generado por el ChatGPT de esa epoca.
- Experimentos de interpretabilidad: al ser un modelo pequeno, es adecuado para estudiar que senales aprende un detector (longitud, puntuacion, estilo) sin requerir grandes recursos de computo.
- Benchmark de referencia interna: sirve como punto de comparacion (accuracy 0,9856) frente a otros detectores entrenados en HC3 en trabajos posteriores.
- Educacion sobre limitaciones de los detectores: permite demostrar en un aula como un clasificador con alta precision en su benchmark deja de ser fiable al cambiar el generador o el dominio.
- Prototipado rapido en entornos sin GPU: por su tamano (0,1 GB de repositorio) se puede desplegar en un portatil o en una instancia pequena para pruebas puntuales.

## Benchmarks y rendimiento

Datos reportados en la model card sobre el conjunto de test de HC3 (4.668 respuestas):

| Modelo | Test accuracy |
|---|---|
| Baseline: embeddings congelados + regresion logistica | 0,8449 |
| Fine-tuned (este modelo) | 0,9856 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en fp32 (22,7 M de parametros x 4 bytes) y unos 45 MB en fp16. No incluye el overhead del runtime de PyTorch.
- GPU recomendadas: cualquiera con suficiente memoria libre, incluidas GTX 1050 Ti o superiores; tambien A100, H100, RTX 4090, etc., aunque estan sobredimensionadas para este modelo.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, y tambien en CPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference`) y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). No se documenta soporte de llama.cpp/Ollama (el modelo no esta en formato GGUF) ni configuracion especifica para vLLM o TGI.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Accuracy (test HC3) | Licencia |
|---|---|---|---|---|---|
| slmyu0915/hw1-hc3-detector (este) | MiniLM-L6 (BERT), fine-tune sobre all-MiniLM-L6-v2 | 22,7 M | 256 | 0,9856 | no disponible |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | no disponible |
| jainatharva21/hw1-hc3-detector | fine-tune de all-MiniLM-L6-v2 (segun descripcion) | no disponible | no disponible | no disponible | no disponible |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | no disponible |
| Baseline HC3 (embeddings + regresion logistica) | Embeddings congelados + clasificador lineal | no disponible | no disponible | 0,8449 | no disponible |

Los modelos comparados son replicas de la misma tarea (HW1) publicadas por otros autores; no se dispone de sus especificaciones detalladas en la informacion proporcionada. Como referencia del ecosistema, el proyecto Hello-SimpleAI mantiene detectores propios entrenados sobre HC3, pero no se aportan sus metricas en esta ficha.

## Limitaciones y advertencias

- Sesgo de dominio y de epoca: entrenado sobre respuestas de ChatGPT de finales de 2022. El propio autor advierte de que no es un detector fiable para texto generado por IA actual.
- Falsos positivos potenciales: puede clasificar como IA textos humanos con estilo similar al de ChatGPT-2022 y viceversa.
- Riesgo de alucinacion: no aplica directamente (no genera texto), pero la salida probabilistica puede inducir a conclusiones erroneas si se usa fuera de su dominio.
- Limitacion idiomatica: solo ingles; no se ha validado en castellano ni en otros idiomas.
- Limitacion de contexto: 256 tokens; textos mas largos se truncan, lo que puede degradar la clasificacion.
- Licencia no disponible: la ausencia de licencia explicita impide confirmar si se permite el uso comercial. Conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de soporte de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin garantias de actualizacion.
- No apto para uso en produccion como detector de IA general: el rendimiento reportado corresponde unicamente al conjunto de test de HC3.
- No se documentan sesgos especificos mas alla del sesgo de dominio descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slmyu0915/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Repositorio Hello-SimpleAI (HC3 y detectores): https://github.com/Hello-SimpleAI
- Codigo de deteccion de Hello-SimpleAI: https://github.com/Hello-SimpleAI/chatgpt-comparison-detection/tree/main/detect
- Replica del mismo ejercicio (Aishkrish): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Replica del mismo ejercicio (jainatharva21): https://huggingface.co/jainatharva21/hw1-hc3-detector
- Ficha en savrn.com (Yihangsun): https://savrn.com/models/hw1-hc3-detector
