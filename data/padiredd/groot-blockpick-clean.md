# padiredd/groot-blockpick-clean

## Resumen

groot-blockpick-clean es un ajuste fino del modelo visión-lenguaje-acción (VLA) NVIDIA GR00T-N1.7-3B, publicado por el usuario padiredd. El modelo parte del checkpoint base de NVIDIA y se ha especializado en una única tarea robótica: el pick cenital (top-down) de un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 en el simulador Isaac Lab. El repositorio contiene un único checkpoint (step-20000) de los 100.000 pasos planificados en la receta de entrenamiento.

La relevancia de esta ficha es acotada y conviene ser explícito: no se trata de un modelo de propósito general, sino de un artefacto de investigación para una tarea concreta y un embodiment concreto, con 0 descargas y 0 likes en el momento de la consulta. Su interés técnico reside en documentar un pipeline completo de ajuste fino de GR00T N1.7 sobre un dataset propio (500 demostraciones, 77.220 fotogramas, 3 cámaras a 240x240) con una receta reproducible y un backbone congelado.

El modelo base, GR00T-N1.7-3B, emplea un backbone Cosmos-Reason2-2B congelado y un cabezal de acción de difusión más un proyector que sí se entrenan (1,62 B parámetros entrenables). El contexto de lenguaje disponible en la model card es una única instrucción fija ("pick up the lime green block with the left arm"), lo que limita el uso a esa tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) sobre backbone Cosmos-Reason2-2B congelado + proyector + cabezal de acción de difusión |
| Parámetros totales | 3 B (modelo base GR00T-N1.7-3B); 1,62 B entrenables en el ajuste fino |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos subidos en fp32) |
| Idiomas soportados | no disponible (instrucción de lenguaje fija en inglés) |
| Licencia | other (heredada del modelo base; consultar términos de NVIDIA GR00T) |
| Formato de pesos | safetensors (shards fp32, 12,6 GB por carpeta de step) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7: un backbone de razonamiento visual-lenguaje Cosmos-Reason2-2B que permanece congelado durante el ajuste fino, un proyector que adapta las representaciones y un cabezal de acción basado en difusión que genera trayectorias de acciones. La entrada de estado es un vector de 16 dimensiones (8 del brazo izquierdo y 8 del brazo derecho) y la salida son 16 objetivos articulares absolutos con un chunk de 16 pasos. El embodiment se registra como `new_embodiment` con la configuración de modalidad `ffw_bg2_pick_cube_3cam_config.py`.

El ajuste fino se realizó sobre 500 demostraciones del dataset `padiredd/pick-cube-topdown-25cm-500-3cam`, generadas en Isaac Lab con el robot ROBOTIS FFW SG2: 77.220 fotogramas, 3 cámaras a 240x240, pose inicial fija, bloque uniformemente distribuido en x 0,23-0,48 m e y 0,065-0,315 m, y tiempos idénticos en todas las demostraciones. La receta usa AdamW con lr 1e-4 coseno, warmup del 5 %, weight decay 1e-5, batch global 32, aumento de datos de color (brillo 0,4, contraste 0,4, saturación 0,5, tono 0,1), rotación aleatoria de 5 grados, recorte aleatorio del repositorio, ruido gaussiano de 1 grado sobre las 7 articulaciones del brazo izquierdo y dropout de estado de 0,2. El entrenamiento se ejecutó en una NVIDIA A40 de 48 GB a 1,35 s/paso.

## Capacidades

- Generación de acciones robóticas de manipulación: produce 16 objetivos articulares absolutos por chunk para el embodiment FFW SG2.
- Percepción visual multi-cámara: consume 3 cámaras a 240x240 como entrada.
- Condicionamiento por lenguaje: acepta la instrucción fija "pick up the lime green block with the left arm".
- Ejecución de una tarea concreta: pick cenital de un bloque verde lima con el brazo izquierdo.
- Integración con el ecosistema Isaac-GR00T mediante `Gr00tPolicy`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni multimodalidad de audio.

## Casos de uso

- Evaluación de políticas VLA en simulación: el checkpoint se carga con `Gr00tPolicy(embodiment_tag="new_embodiment", model_path=<carpeta>)` y se ejecuta con `data_collection/rollout_policy.py --policy groot` contra `groot_server.py` para medir tasas de éxito en 50 picks.
- Reproducción de experimentos de ajuste fino: la receta detallada (hiperparámetros, aumentos, ruido de estado) permite replicar el entrenamiento sobre el mismo dataset o sobre variantes.
- Línea base para comparación con políticas de difusión: el autor referencia explícitamente el protocolo de evaluación de `padiredd/pick-cube-topdown-25cm-*-dp`, lo que permite contrastar VLA frente a diffusion policies en la misma tarea.
- Estudio de congelación de backbone: al mantener Cosmos-Reason2-2B congelado y entrenar solo 1,62 B parámetros, sirve para analizar la eficiencia del ajuste fino parcial en tareas de manipulación.
- Desarrollo de pipelines de datos sintéticos: el dataset subyacente (Isaac Lab, pose fija, distribución uniforme del bloque) es un ejemplo de generación de demostraciones controladas para entrenamiento.
- Prueba de integración del fork de Isaac-GR00T: valida el flujo de registro de modalidades y carga de checkpoints del fork `omkarpatil18/Isaac-GR00T-n1.7` en el commit e81d02b.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones en simulación (50 picks) se añadirán "a medida que lleguen", pero no incluye cifras en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se distribuye en fp32 con 12,6 GB por carpeta de step; en fp32 se requiere aproximadamente esa cifra más overhead, y en fp16/bf16 se reduciría a la mitad (no se documentan cuantizaciones oficiales).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A40 de 48 GB; para inferencia en fp32 se necesita al menos una GPU con 16-24 GB, aunque no se especifica oficialmente.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; una RTX 4090 (24 GB) podría alojar los pesos en fp16, pero no hay validación publicada.
- Opciones de despliegue: el autor documenta el uso del fork `omkarpatil18/Isaac-GR00T-n1.7` con `Gr00tPolicy` y `groot_server.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se conoce el tiempo de entrenamiento (1,35 s/paso en A40).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-blockpick-clean | 3 B (1,62 B entrenables) | no disponible | Pick cenital de bloque con FFW SG2 | other | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-3B (base) | 3 B | no disponible | VLA generalista de robótica | other | Hugging Face (modelo base) |
| Políticas de difusión `padiredd/pick-cube-topdown-25cm-*-dp` | no disponible | no disponible | Misma tarea de pick | no disponible | Hugging Face (referenciadas por el autor) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para una instrucción fija y un embodiment concreto (ROBOTIS FFW SG2, brazo izquierdo, pick cenital); no generaliza a otras tareas ni instrucciones.
- Checkpoint parcial: solo se sube step-20000 de los 100.000 pasos planificados; no hay estados de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento desde este repositorio.
- Sin evaluación publicada: no hay métricas de tasa de éxito ni comparaciones cuantitativas con las políticas de difusión de referencia.
- Dependencia de un fork: la carga requiere el fork `omkarpatil18/Isaac-GR00T-n1.7` en el commit e81d02b y el registro previo de la configuración de modalidad, lo que añade fragilidad al despliegue.
- Licencia "other" heredada: es necesario revisar los términos del modelo base NVIDIA GR00T N1.7 antes de cualquier uso comercial; no se detallan restricciones en la model card.
- Riesgo de sobreajuste al dominio simulado: los datos provienen exclusivamente de Isaac Lab con pose inicial fija y distribución acotada del bloque; el rendimiento en el mundo real no está validado.
- Idiomas: no se documenta soporte multilingüe; la instrucción está en inglés.
- Sesgos: no se documentan sesgos conocidos, pero la distribución sintética y acotada del dataset limita la variabilidad de escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/groot-blockpick-clean
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Fork de Isaac-GR00T utilizado: https://github.com/omkarpatil18/Isaac-GR00T-n1.7 (commit e81d02b)
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-25cm-500-3cam
- Políticas de difusión de referencia: https://huggingface.co/padiredd/pick-cube-topdown-25cm-dp (ruta indicada en la model card)
