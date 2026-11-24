# seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k

## Resumen

Cosmos3-Edge-Policy-DROID fine-tuned on PyRUA-Lean MolmoSpaces es un modelo de política robótica (visión-lenguaje-acción) obtenido por ajuste fino del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID` sobre el conjunto de datos `seungkukim/MolmoSpaces-PyRUA-Lean-50ep`. Lo desarrolla el usuario `seungkukim` como post-entrenamiento de la política base de NVIDIA, con el objetivo de especializarla en una tarea concreta de manipulación robótica: los rollouts expertos de PyRUA-Lean en el simulador MolmoSpaces, grabados en el formato Cosmos3-DROID. El checkpoint publicado corresponde al paso 1000 de entrenamiento y se exporta con los pesos EMA, junto con la torre de visión y el procesador.

El modelo tiene 3.369.657.024 parámetros (unos 3,37 mil millones) en formato safetensors, con un repositorio de 7,7 GB. Pertenece a la familia Cosmos3 en su variante Edge, pensada para despliegue de políticas robóticas con menor coste computacional que las variantes mayores. La arquitectura es del tipo omni (visión, lenguaje y acción) según la etiqueta `cosmos3_omni`, e incorpora módulos específicos de acción (`action2llm`, `llm2action`, `action_modality_embed`) que conectan el espacio latente del modelo generativo con comandos motores.

Su relevancia es acotada pero clara: demuestra el flujo completo de post-entrenamiento de una política Cosmos3-Edge sobre datos propios y en un hardware modesto (2× H200, 2 h 05 min para 1000 pasos), lo que sirve como receta reproducible para quien quiera adaptar la política DROID a un robot o simulador distinto. No es un modelo de propósito general: es una política de acción concreta, con un dominio de tarea y un formato de observación muy específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 omni (visión-lenguaje-acción) con módulos de acción; VAE Wan2.2 para el espacio visual; transformer con `moe_gen` y `time_embedder` |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la política emite chunks de 32 acciones y 33 fotogramas de vídeo por consulta) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como prompt JSON; el modelo base es multimodal, pero no se detallan idiomas) |
| Licencia | NVIDIA OpenMDW-1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (repo de 7,7 GB, con torre de visión y procesador incluidos) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`) y se post-entrena con todos los pesos, incluidos los cabezales de acción. La arquitectura combina un codificador visual basado en el VAE Wan2.2 (con encoder compilado con AOT) y un transformer generativo con módulos `moe_gen` y `time_embedder`, más adaptadores que traducen entre el espacio latente visual/lenguaje y el espacio de acciones (`vae2llm`, `llm2vae`, `action2llm`, `llm2action`, `action_modality_embed`, `k_norm_und_for_gen`). El modo de tarea es `wam`: genera chunks de 32 posiciones articulares absolutas más una fila de estado, junto con 33 fotogramas de vídeo, a partir de una vista concatenada en 480p (muñeca arriba, dos vistas exteriores abajo).

El entrenamiento se realizó con `cosmos-framework` (`a3fb346`) más un parche de máscara de experto y velocidad incluido con el dataset. Se usaron 2× H200 con FSDP en bf16, batch global de 64 (32 por GPU), AdamW fusionado con lr 1e-4, betas (0,9; 0,95), weight decay 0, grad clip 0,1 y schedule LambdaCosine con warm-up lineal de 100 pasos (10 %) y decaimiento coseno hasta el paso 1000. Se aplicó EMA de potencia con `sigma_rel` 0,1; los pesos exportados son los EMA. La pérdida combina visión y acción con pesos 10 y 10. Los datos son 189 episodios (173 exitosos, 16 fallidos), 30.571 fotogramas a 15 fps, con vistas de muñeca y dos exteriores a 640×360, 7 posiciones articulares más pinza; todos los pasos se marcan como expertos (`action.is_expert = 1`). La augmentación incluye recorte aleatorio al 95 % con redimensionado y ColorJitter (0,3; 0,4; 0,5; 0,08) en GPU, con dropout de caption de 0,1.

## Capacidades

- Generación de acciones robóticas: produce chunks de 32 posiciones articulares absolutas (7 articulaciones) más posición de pinza normalizada 0..1 por consulta.
- Predicción visual conjunta: genera 33 fotogramas de vídeo asociados a la secuencia de acciones, lo que permite supervisión y depuración del comportamiento previsto.
- Condicionamiento por lenguaje: acepta una descripción de tarea en formato JSON mediante el procesador propio de la política.
- Entrada multimodal: tres vistas de cámara (muñeca izquierda y dos exteriores) más estado propioceptivo (posiciones articulares y pinza).
- Ejecución como servidor de política: se expone mediante `cosmos_framework.scripts.action_policy_server_robolab` en un puerto local, con intervalo de guiado configurable.
- Especialización en manipulación de tipo DROID: hereda del modelo base la interfaz de observaciones y el esquema de acciones del ecosistema DROID.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico ni otras modalidades (audio) en la información disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia reproducible para estudiar cómo un ajuste fino corto (1000 pasos, 2 h en 2× H200) sobre una política preentrenada afecta al comportamiento en una tarea concreta, comparando con el checkpoint base y con la variante de 100 episodios.
- Adaptación de políticas a simuladores propios: quien tenga un entorno tipo MolmoSpaces puede replicar la receta (formato Cosmos3-DROID, 50 episodios por tarea, parche de máscara de experto) para entrenar su propia política sin partir de cero.
- Evaluación de robustez ante datos imperfectos: el dataset incluye 16 episodios fallidos de 189 y el modelo los usa todos, lo que permite estudiar el efecto de datos no filtrados en políticas robóticas.
- Servidor de política para bucle de control: el script `action_policy_server_robolab` permite integrar el modelo en un pipeline de control que envíe observaciones (imágenes y estado) y reciba 32 acciones por consulta, útil en pruebas de laboratorio con robots reales o simulados.
- Docencia y divulgación: como ejemplo didáctico de post-entrenamiento de un modelo visión-lenguaje-acción, con configuración resuelta (`config.yaml`) y pesos EMA exportados.
- Comparación de variantes de datos: junto con `cosmos3-edge-droid-ft-pyrualean-100ep-1k`, permite medir el impacto del volumen de datos (50 frente a 100 episodios por tarea) manteniendo la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,37 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 6,7 GB; el repositorio completo es de 7,7 GB, por lo que se necesita al menos esa cantidad más el coste del VAE Wan2.2 y del procesador visual. No se documenta una estimación oficial de VRAM en inferencia.
- GPU recomendadas: el entrenamiento se hizo en 2× H200; para inferencia, una GPU con 16-24 GB (por ejemplo RTX 4090, L40S o A10G) debería ser suficiente para los pesos, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16 GB o más (RTX 4080/4090, RTX 5090), aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: el autor documenta el servidor propio `cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint_path`, `--port`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de acción de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k` (este) | 3,37 B | no disponible | Política robótica DROID ajustada a PyRUA-Lean (50 ep/tarea) | OpenMDW-1.1 | Hugging Face, 0 descargas |
| `seungkukim/cosmos3-edge-droid-ft-pyrualean-100ep-1k` | no disponible | no disponible | Misma receta con 100 ep/tarea | OpenMDW-1.1 (derivada) | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | Política DROID generalista de NVIDIA | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a linaje, datos de ajuste y licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado solo con rollouts de PyRUA-Lean en MolmoSpaces; no se espera generalización a otras tareas, robots o entornos sin un nuevo ajuste fino.
- Dataset pequeño: 189 episodios y 30.571 fotogramas, con 16 episodios fallidos incluidos deliberadamente; el riesgo de sobreajuste y de reproducir conductas fallidas es real y no se cuantifica.
- Interfaz de observación rígida: requiere exactamente las claves `observation/wrist_image_left`, `observation/exterior_image_1_left`, `observation/exterior_image_2_left`, `observation/joint_position` (7) y `observation/gripper_position`, además de `prompt`; cualquier desviación rompe la inferencia.
- Normalización de acciones: usa posiciones articulares absolutas sin normalizar y pinza en 0..1, igual que la política base; no es portable a robots con otra cinemática sin reentrenamiento.
- Licencia OpenMDW-1.1: derivada de NVIDIA; conviene revisar los términos antes de uso comercial, ya que la model card solo indica que se aplican las mismas condiciones que al modelo base.
- Sin benchmarks publicados: no hay métricas de éxito en tarea, lo que impide evaluar su calidad frente al modelo base o a la variante de 100 episodios.
- Riesgo de alucinación visual: al generar 33 fotogramas de vídeo junto con las acciones, las predicciones visuales pueden divergir de la realidad y no deben usarse como sensor.
- Idiomas no documentados: el prompt de tarea se pasa como JSON, pero no se especifica qué lenguas maneja el procesador de texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de ajuste fino: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-50ep
- Variante con 100 episodios por tarea: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-100ep-1k
