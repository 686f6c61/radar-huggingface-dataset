# RunyiY/G2VLM

## Resumen

G2VLM es un modelo multimodal de tipo image-text-to-text orientado al razonamiento espacial sobre imagenes y video, desarrollado originalmente por InternRobotics. Esta ficha concreta, publicada por el usuario RunyiY, no contiene un modelo completo sino un conjunto de checkpoints delta: tensores finetuneados que se cargan sobre los pesos base de InternRobotics/G2VLM-2B-MoT. El repositorio ocupa 14,2 GB y cada delta incluye 395 tensores con 1,78 mil millones de parametros en fp32.

El objetivo del finetune es construir una linea base de razonamiento espacial en video al estilo de VSI-Bench, entrenada sobre un subconjunto equilibrado de 14.000 muestras de video QA del dataset VSI-590K. Se cubren siete tipos de pregunta (conteo absoluto, distancia y tamano absolutos, tamano de habitacion, distancia y direccion relativas, y orden de aparicion), con datos procedentes de ScanNet, ScanNet++ v2 y ARKitScenes y sin solapamiento de escenas con el conjunto de test de VSI-Bench.

La relevancia de esta publicacion es doble: por un lado, ofrece pesos de referencia para evaluar rapidamente el comportamiento de G2VLM-2B-MoT en tareas de razonamiento espacial; por otro, documenta de forma transparente el proceso de finetune (learning rate, batches, pasos, parches necesarios en el codigo oficial), lo que facilita reproducir o extender el experimento. La licencia Apache 2.0 y el soporte exclusivo de ingles acotan su alcance practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basada en G2VLM-2B-MoT (expertos semanticos y geometricos, encoder ViT y DINO, cabezas 3D) |
| Parametros totales | 1,78B en los tensores delta; el modelo base completo no se especifica en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los deltas se distribuyen en fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (delta_final.safetensors en fp32) |

## Arquitectura y entrenamiento

El modelo base G2VLM-2B-MoT combina una rama semantica de comprension con una rama geometrica, apoyadas en un encoder ViT y un encoder DINO, ademas de cabezas 3D. En este finetune solo se entrenan los parametros del experto semantico del modelo de lenguaje, incluidos los embeddings de tokens y la LM head; el experto geometrico, el encoder DINO, el ViT y las cabezas 3D permanecen congelados. La entrada usa 16 fotogramas muestreados uniformemente por video y el layout oficial `chat_with_recon`, de modo que ambas ramas ven los fotogramas.

El entrenamiento se realizo sobre 14.000 muestras de video QA de VSI-590K, 2.000 por cada uno de los siete tipos de pregunta, mezcladas con semilla 0. Se usaron AdamW (betas 0,9/0,95, sin weight decay), learning rate 2e-5 con decaimiento coseno hasta el 10%, 50 pasos de warmup (20 en la ejecucion corta), batch efectivo de 8 (2 GPU x 4 pasos de acumulacion) y perdida de entropia cruzada solo sobre los tokens de respuesta. Se publican dos ejecuciones: `ft2ep_vsi590k_bal` (2 epocas, 3.500 pasos, 28.000 muestras vistas) y `ft_vsi590k_bal` (366 pasos, 2.928 muestras vistas, presupuesto de 100 minutos). La model card documenta ademas dos parches de una linea necesarios para entrenar con el codigo oficial, no requeridos para inferencia.

## Capacidades

- Razonamiento espacial en video: responde preguntas sobre conteo, distancia, tamano, direccion relativa y orden de aparicion de objetos en escenas.
- Comprension de imagen y video en formato image-text-to-text, con 16 fotogramas por clip en el esquema de entrenamiento.
- Respuesta a preguntas de opcion multiple (seleccion de letra) y a preguntas numericas o de frase corta.
- Uso de la rama geometrica del modelo base (profundidad y estructura 3D) mediante el layout `chat_with_recon`.
- Capacidad multilingue limitada al ingles.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de razonamiento espacial: cargar el delta sobre G2VLM-2B-MoT y ejecutar el protocolo de VSI-Bench para obtener una linea base reproducible antes de probar variantes propias.
- Investigacion en navegacion y percepcion 3D: usar el modelo para estimar distancias relativas y direcciones entre objetos en secuencias de video de interiores, aprovechando los 16 fotogramas por clip.
- Analisis de escenas de interior para robotica: preguntas de conteo y tamano absoluto sobre videos de ScanNet o ARKitScenes como paso previo a la planificacion de manipulacion.
- Auditoria de datasets de QA espacial: generar respuestas sobre el subconjunto de VSI-590K y comparar con las anotaciones para detectar preguntas ambiguas o mal etiquetadas.
- Prototipado de asistentes de inspeccion visual: consultas en lenguaje natural sobre grabaciones de obra o vivienda (por ejemplo, orden de aparicion de elementos o tamano de una estancia) en fase de prueba de concepto.
- Fine-tuning incremental como receta de referencia: reutilizar los hiperparametros documentados (2e-5, AdamW sin weight decay, batch efectivo 8, perdida solo en tokens de respuesta) para adaptar el modelo a otros dominios de video.
- Docencia y divulgacion: ejemplo didactico de finetune por deltas con safetensors y de congelacion selectiva de ramas en un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 14,2 GB y los deltas suman 1,78B parametros en fp32, que deben cargarse junto con los pesos base completos.
- GPU recomendadas: el entrenamiento se ejecuto con 2 GPU y batch efectivo 8, pero no se especifica el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: no disponible; depende del peso total del modelo base, que no se detalla.
- Opciones de despliegue: el autor indica el flujo oficial con el repositorio de GitHub de G2VLM (commit `a45f2f4`), `snapshot_download` de Hugging Face, `safetensors.torch.load_file` y `load_state_dict(..., strict=False)`, seguido de `inference_chat.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RunyiY/G2VLM (este) | 1,78B en deltas sobre base 2B-MoT | no disponible | Si, finetune especifico en VSI-590K | Apache 2.0 | Hugging Face, requiere modelo base |
| InternRobotics/G2VLM-2B-MoT | no disponible | no disponible | Base sin finetune especifico en VSI | Apache 2.0 | Hugging Face |
| Otros modelos de razonamiento espacial en video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar InternRobotics/G2VLM-2B-MoT y cargar el delta con `strict=False`; sin los pesos base no funciona.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Entrenado exclusivamente para preguntas de estilo VSI-Bench; su rendimiento fuera de esos siete tipos de pregunta no esta documentado.
- Riesgo de alucinacion en respuestas numericas y de conteo, habitual en tareas de razonamiento espacial; no se aportan metricas de error.
- Sesgos conocidos: no documentados en la informacion disponible; los datasets de origen (ScanNet, ScanNet++ v2, ARKitScenes) son predominantemente de interiores.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion externa de la calidad del finetune.
- Los parches de una linea indicados en la model card son necesarios para reproducir el entrenamiento con el codigo oficial; no se garantiza su mantenimiento futuro.
- Uso comercial permitido por Apache 2.0, pero sujeto a las condiciones y avisos del modelo base y de los datasets de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunyiY/G2VLM
- Modelo base: https://huggingface.co/InternRobotics/G2VLM-2B-MoT
- Codigo oficial de G2VLM: https://github.com/InternRobotics/G2VLM
- Dataset VSI-590K: https://huggingface.co/datasets/nyu-visionx/VSI-590K
