# seungkukim/cosmos3-edge-droid-ft-pyrualean-100ep-1k

## Resumen

Cosmos3-Edge-DROID-PyRUA-Lean-100ep-1k es un ajuste fino (post-entrenamiento) del modelo de politica robotica `nvidia/Cosmos3-Edge-Policy-DROID`, desarrollado por el usuario `seungkukim`. El modelo parte de los pesos completos publicados por NVIDIA, incluidos los cabezales de accion, y se entrena sobre un conjunto de demostraciones expertas del entorno MolmoSpaces recogidas en formato Cosmos3-DROID. Resuelve el problema de la adaptacion de una politica generalista de robotica a una tarea concreta (PyRUA-Lean) mediante aprendizaje por imitacion sobre datos propios.

La relevancia del modelo es acotada pero clara: demuestra un flujo reproducible de post-entrenamiento de politicas vision-lenguaje-accion (VLA) sobre infraestructura modesta (2x H200, 2h29m de entrenamiento) y publica el checkpoint intermedio (paso 1000) junto con la configuracion resuelta. Es un artefacto de investigacion y prototipado, no un modelo de proposito general.

El modelo tiene 3.369.657.024 parametros (3,37 mil millones), un repositorio de 7,7 GB en formato safetensors, y se distribuye con licencia OpenMDW-1.1 heredada del modelo base de NVIDIA. La longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (omni; transformer con modulo `moe_gen`, VAE Wan2.2 y cabezales de accion `action2llm`/`llm2action`) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como prompt JSON) |
| Licencia | OpenMDW-1.1 (NVIDIA Open Model Development Workflow) |
| Formato de pesos | safetensors (repo de 7,7 GB, incluye torre de vision y processor) |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID` (revision `a74e848c`). La arquitectura subyacente es Cosmos3, un modelo omni multimodal que combina un modulo generativo tipo MoE (`moe_gen`) con un VAE Wan2.2 (encoder compilado con AOT) y cabezales especificos de accion (`action2llm`, `llm2action`, `action_modality_embed`). El modo de tarea es `wam`: genera chunks de 32 acciones de posicion articular absoluta mas una fila de estado, condicionado por 33 frames de video.

Los datos de entrenamiento son `seungkukim/MolmoSpaces-PyRUA-Lean-100ep` (revision `ea2094b9`): 376 episodios (349 exitosos, 27 fallidos), 57.987 frames a 15 fps, con vistas de muneca y dos exteriores a 640x360, 7 posiciones articulares y posicion de pinza. Todos los pasos se marcan como expertos (`action.is_expert = 1`). El entrenamiento uso 2x H200 durante 2h29m, batch global de 64, AdamW con lr 1e-4, warm-up lineal de 100 pasos y decaimiento coseno hasta el paso 1000, bf16 con FSDP, grad clip 0.1 y EMA de potencia (sigma_rel 0.1); los pesos exportados son los de EMA. Se entrenaron los modulos `moe_gen`, `time_embedder`, `vae2llm`, `llm2vae`, `k_norm_und_for_gen`, `action2llm`, `llm2action` y `action_modality_embed`. La aumentacion incluyo recorte aleatorio al 95% con redimensionado y ColorJitter (0.3, 0.4, 0.5, 0.08) en GPU. Las perdidas fueron vision 10 y accion 10, sin normalizacion de acciones (articulaciones en crudo, pinza 0..1).

## Capacidades

- Generacion de acciones roboticas: produce chunks de 32 acciones de posicion articular absoluta (7 articulaciones) mas posicion de pinza (0..1) a partir de observaciones visuales y de estado.
- Percepcion multimodal: consume tres vistas de camara (muneca y dos exteriores) en una vista concatenada a 480p.
- Condicionamiento por lenguaje: acepta una descripcion de tarea formateada como JSON mediante el processor del modelo base, con caption dropout 0.1 durante el entrenamiento.
- Politica de imitacion: reproduce comportamientos expertos aprendidos de demostraciones en MolmoSpaces, incluyendo episodios fallidos presentes en el dataset.
- Servidor de inferencia: se despliega mediante `cosmos_framework.scripts.action_policy_server_robolab` con `--format-prompt-as-json True` y `--guidance-interval 960 1001`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni otros idiomas.

## Casos de uso

- Investigacion en aprendizaje por imitacion: servir como punto de partida reproducible para estudiar el efecto del numero de episodios (existe una variante de 50 ep/tarea) y de los pasos de entrenamiento sobre el rendimiento de una politica VLA.
- Prototipado de manipulacion robotica en simulacion: desplegar el servidor `action_policy_server_robolab` contra un entorno MolmoSpaces para evaluar la politica PyRUA-Lean antes de transferir a hardware real.
- Generacion de datos sinteticos de politica: usar el modelo como referencia para comparar rollouts expertos frente a rollouts generados y detectar desviaciones de comportamiento.
- Benchmarking de recetas de post-entrenamiento: la configuracion resuelta (`config.yaml`), el parche de mascara de experto y los hiperparametros permiten reproducir el experimento `action_policy_droid_edge` con variaciones controladas.
- Base para ajustes finos en tareas nuevas: al incluir todos los pesos (incluidos cabezales de accion), puede reentrenarse sobre otros datasets en formato Cosmos3-DROID sin partir del modelo original de NVIDIA.
- Educacion y divulgacion: ejemplo completo y documentado de un pipeline VLA con exportacion via `cosmos_framework.scripts.export_model`, util para cursos o talleres sobre robotica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3,37 mil millones de parametros en bf16, el peso de los tensores ronda los 6,7 GB, a los que hay que sumar el VAE Wan2.2, la torre de vision y las activaciones de los 33 frames de entrada.
- GPU de entrenamiento documentadas: 2x NVIDIA H200 (2h29m de tiempo de pared para 1000 pasos con batch global 64).
- GPU recomendadas para inferencia: no documentadas; por tamano, cabria esperar ejecucion en GPUs de datacenter (A100, H100, H200) y posiblemente en consumer de gama alta (RTX 4090 con 24 GB), aunque no hay confirmacion en la informacion disponible.
- Despliegue: servidor propio de `cosmos-framework` (`action_policy_server_robolab`), con descarga via `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia devuelve 32 acciones por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3-edge-droid-ft-pyrualean-100ep-1k (este) | 3,37 B | no disponible | Politica VLA para PyRUA-Lean en MolmoSpaces | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible en la informacion | no disponible | Politica VLA generalista DROID | OpenMDW-1.1 | Hugging Face |
| seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k | no disponible | no disponible | Misma receta con 50 ep/tarea | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente sobre PyRUA-Lean en MolmoSpaces; su comportamiento fuera de ese entorno o tarea no esta validado.
- Datos limitados: solo 376 episodios y 57.987 frames, con 27 episodios fallidos incluidos; el sobreajuste y la reproduccion de fallos son riesgos reales.
- Entrenamiento corto: 1000 pasos con warm-up de 100; no hay curvas de evaluacion ni metricas de exito publicadas.
- Sin normalizacion de acciones: usa articulaciones en crudo y pinza 0..1, por lo que la calibracion depende del robot y del entorno de recogida.
- Idiomas y contexto no documentados: el condicionamiento linguistico se limita al formato de prompt JSON del processor del modelo base.
- Licencia OpenMDW-1.1: es una licencia de NVIDIA con terminos propios; deben revisarse antes de cualquier uso comercial, y se heredan las restricciones del modelo base.
- Riesgo de alucinacion visual y de deriva de politica: como todo modelo generativo multimodal, puede producir acciones incoherentes ante observaciones fuera de distribucion.
- Sin benchmarks publicados: no es posible comparar su rendimiento con alternativas de forma objetiva.
- Repositorio de investigacion: 0 descargas y 1 like en el momento de la consulta; no hay garantia de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-100ep-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-100ep
- Variante con 50 episodios por tarea: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k
