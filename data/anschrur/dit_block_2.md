# anschrur/dit_block_2

## Resumen

`dit_block_2` es una política de imitación robótica basada en un Diffusion Transformer (DiT) con entrenamiento por flow matching, publicada por el usuario anschrur en Hugging Face. Resuelve una tarea concreta de manipulación con el brazo SO-10x: coger un vaso y colocarlo dentro de un anillo. El modelo consume una única cámara frontal y el estado articular del robot, y produce secuencias de acciones de 6 dimensiones (cinco articulaciones en grados y la pinza en porcentaje de apertura).

El interés de esta publicación no reside en su tamaño ni en sus capacidades generales, sino en su carácter de artefacto reproducible de investigación: es un checkpoint crudo de `torch.save` (66,7 MB, 16,66 millones de parámetros) que no puede cargarse con `from_pretrained` ni con el registro de políticas de lerobot, sino únicamente a través de la clase `DiTAgent` del repositorio `robot_imitation_glue`. Incluye los normalizadores de estado y acción dentro del propio fichero, sin los cuales el modelo es inutilizable.

La versión `dit_block_2` existe para corregir un defecto de etiquetado en el dataset original: 32 de 200 episodios de `record-test_2` presentaban un desplazamiento de aproximadamente 170° en `wrist_roll`. El reentrenamiento sobre una regrabación limpia de 30 episodios reduce la desviación típica de esa articulación de 69,53 a 20,51. No se han publicado métricas de éxito en bucle cerrado ni error de acción en bucle abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching; 4 capas, 4 cabezas, dimensión oculta 256 |
| Parametros totales | 16.660.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 48 fotogramas (1,6 s a 30 fps) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión de entrenamiento, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `policy.ckpt` (dict de `torch.save` con `config`, `image_size`, `crop_ratio`, `model_state_dict`, `proprio_normalizer_state_dict`, `action_normalizer_state_dict`) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Entrada visual | 1 cámara (`observation.images.front`), 480×640 AV1, redimensionada a 128×128 con recorte central de 0,9 |
| Codificador visual | ResNet-18 preentrenado en ImageNet, estadísticas congeladas en `encoders.0.mean/std` |
| Espacio de estado/acción | 6-D posiciones absolutas Feetech: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` (grados) y `gripper` (% de apertura, servo en `RANGE_0_100`) |
| Muestreador | Flow matching con sampler Euler, 10 pasos en el script de despliegue |
| Frecuencia de control | 30 fps (un chunk de 48 fotogramas equivale a 1,6 s) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La política es un transformer de difusión de pequeña escala: dimensión oculta 256, 4 capas y 4 cabezas de atención, con un codificador visual ResNet-18 preentrenado en ImageNet cuyas estadísticas de normalización viajan congeladas dentro del checkpoint. La generación de acciones emplea flow matching con un sampler Euler de 10 pasos, y el modelo predice chunks de 48 fotogramas consecutivos a partir de la observación visual actual y del estado propioceptivo de 6 dimensiones. El vector de estado no es homogéneo en unidades: las dimensiones 0 a 4 están en grados y la dimensión 5 en porcentaje de apertura, por lo que no debe reescalarse de forma uniforme.

El entrenamiento se realizó sobre el dataset `anschrur/record-test_2_20261115_115045`, una regrabación limpia con cámara de muñeca del 15 de noviembre de 2026: 30 episodios, 13.218 fotogramas a 30 fps y una única tarea. Se ejecutaron 41.200 pasos de optimizador, equivalentes a 200 épocas con batch de 64 y `drop_last=True`, con AdamW (lr 1e-4, weight decay 1e-4), calentamiento lineal de 500 pasos seguido de decaimiento coseno hasta el 1 % de la tasa base (lr final 1e-6), recorte de gradiente de 10 y semilla 42. La pérdida final de entrenamiento fue 0,018505. El cómputo se completó en 1,7 horas sobre una única RTX 5090 del clúster imec iLab.t GPULab 9.

La innovación metodológica respecto a `anschrur/dit-cup` no está en la arquitectura, que es idéntica, sino en la corrección del dataset: se eliminó un desplazamiento de aproximadamente 170° en las etiquetas de `wrist_roll` presente en 32 de los 200 episodios originales. El efecto es medible en el normalizador de acciones almacenado en el fichero, donde la desviación típica de `wrist_roll` cae de 69,53 a 20,51. Las otras cuatro articulaciones también cambian de media y desviación porque la regrabación es un conjunto distinto de 30 episodios, no un subconjunto reetiquetado, por lo que no son directamente comparables con la versión anterior.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para el brazo SO-10x mediante flow matching, en chunks de 48 fotogramas (1,6 s a 30 fps).
- Percepción visual monocámara a través de un codificador ResNet-18 congelado, con entrada normalizada a 128×128 y recorte central de 0,9.
- Condicionamiento en estado propioceptivo absoluto de 6 articulaciones (grados para las cinco primeras, porcentaje de apertura para la pinza).
- Ejecución de una única tarea de manipulación: coger un vaso y depositarlo dentro de un anillo.
- Inferencia en bucle cerrado a 30 fps con 10 pasos de muestreo Euler.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito, visión general, audio ni ninguna capacidad fuera del dominio robótico descrito.

## Casos de uso

- Replicación de experimentos de imitación robótica: el checkpoint es un artefacto cerrado y autodescriptivo (config, pesos y normalizadores en un solo fichero) que permite reproducir el pipeline de `robot_imitation_glue` sin depender de rutas de dataset ni credenciales, lo que facilita la comparación entre ejecuciones.
- Validación de correcciones de dataset: `dit_block_2` sirve como caso controlado para estudiar cómo un defecto de etiquetado de 170° en `wrist_roll` se refleja en las estadísticas del normalizador y, potencialmente, en el comportamiento en bucle cerrado, comparándolo con `anschrur/dit-cup` manteniendo arquitectura e hiperparámetros idénticos.
- Despliegue en bucle cerrado sobre un SO-10x real: mediante `dit_on_robot.py --repo-id anschrur/dit_block_2 --fps 30`, que conecta `DiTAgent` con `SOFollower` de lerobot e incorpora una guarda de delta por paso consciente del cruce de ±180° en `wrist_roll`, necesaria porque el recorte `max_relative_target` de lerobot no maneja bien esa discontinuidad.
- Pruebas de integración sin riesgo físico: el modo `--dry-run` permite verificar la carga del checkpoint, el mapeo de claves de cámara y la generación de chunks sin que el brazo se mueva, útil en pipelines de CI para robótica.
- Referencia docente en cursos de diffusion policies: con 16,66 millones de parámetros y 1,7 horas de entrenamiento en una GPU de consumo, es un ejemplo asequible de flow matching aplicado a control, incluyendo el detalle de que los normalizadores deben viajar con los pesos.
- Estudio de latencia y frecuencia de control: al estar entrenado a 30 fps con horizonte de 48 fotogramas, permite medir cómo un bucle a 10 fps estira el mismo chunk a 4,8 s y degrada la correspondencia temporal, un análisis relevante para decidir la frecuencia de despliegue.
- Base para comparaciones de arquitectura DiT a pequeña escala: al compartir hiperparámetros exactos con `dit-cup` (41.200 frente a 40.710 pasos), aísla la variable del dataset en estudios de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay error cuadrático medio de acciones en bucle abierto, ni episodios de evaluación, ni tasa de éxito, ni comparación directa con `dit-cup` más allá de las estadísticas del normalizador. La única cifra de rendimiento reportada es la pérdida final de entrenamiento (0,018505 en la época 200/200), que es una métrica sobre el conjunto de entrenamiento, no un resultado de evaluación, ya que el dataset no declara partición de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 66.705.733 bytes (aproximadamente 64 MB) y el modelo tiene 16,660,576 parámetros; en FP32 son unos 67 MB de pesos, más el codificador ResNet-18 y las activaciones de un batch pequeño, por lo que el consumo total es del orden de cientos de MB y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento se realizó en una RTX 5090 y el script de carga admite explícitamente `device="cpu"`.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o equivalente moderna; también puede ejecutarse en CPU para pruebas, aunque no se ha publicado latencia medida en ese modo.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje. El único camino soportado es la clase `DiTAgent` de `robot_imitation_glue` (basta con clonar el repositorio en `sys.path`), con `checkpoint_path`, `camera_key_mapping`, `state_key`, `device` y `n_sampling_steps=10`.
- Latencia y throughput: no disponibles. La model card fija la frecuencia de control en 30 fps para que el chunk de 48 fotogramas corresponda a 1,6 s de movimiento, pero no reporta tiempos de inferencia por paso ni por chunk.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anschrur/dit_block_2` | 16,66 M | 48 fotogramas (1,6 s a 30 fps) | 1 cámara + estado 6-D | no disponible | Hugging Face, checkpoint crudo |
| `anschrur/dit-cup` | misma arquitectura (no se detalla el recuento exacto) | 48 fotogramas | 1 cámara + estado 6-D | no disponible | Hugging Face |
| Otros modelos robóticos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con `dit-cup` solo es posible en términos de estadísticas del normalizador de acciones, ya que comparten arquitectura e hiperparámetros y difieren únicamente en el dataset. No se dispone de información sobre otras políticas DiT o de imitación robótica con las que establecer una comparación cuantitativa fiable, por lo que no se aportan cifras de rendimiento comparado.

## Limitaciones y advertencias

- No es un checkpoint cargable con `from_pretrained`: no contiene `config.json` ni `model.safetensors`, y el registro de políticas de lerobot no puede abrirlo. Debe cargarse mediante `DiTAgent`.
- Los normalizadores de estado y acción son imprescindibles y solo están dentro del fichero; sin ellos el modelo es inutilizable, y no se distribuyen por separado.
- El vector de estado mezcla unidades (grados en las dimensiones 0 a 4, porcentaje de apertura en la 5); escalarlo de forma uniforme rompe la inferencia.
- Entrenado para una única tarea (vaso al anillo) sobre 30 episodios y 13.218 fotogramas; la generalización a otras posiciones, objetos o iluminaciones no está evaluada.
- No hay partición de validación: la pérdida de 0,018505 es de entrenamiento y no indica capacidad de generalización. No se ha medido tasa de éxito, error de acción en bucle abierto ni comportamiento en bucle cerrado.
- El bucle de control debe ejecutarse a 30 fps; a 10 fps el mismo chunk de 48 fotogramas se estira a 4,8 s y la correspondencia temporal se degrada.
- El cruce de ±180° en `wrist_roll` requiere una guarda de delta consciente del wrap; el recorte `max_relative_target` de lerobot lo maneja mal, según la propia model card.
- `--save-every 20` sobrescribe la misma ruta `policy.ckpt`, por lo que solo existen los pesos de la época 200: no hay snapshots intermedios ni barrido de épocas para analizar.
- Licencia no disponible: no puede asumirse permiso para uso comercial ni redistribución. Tampoco se especifican sesgos, riesgos de alucinación en el sentido lingüístico (no aplica) ni limitaciones idiomáticas.
- El script `dit_on_robot.py` pertenece a la infraestructura de tesis del autor y no está publicado en el repositorio del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anschrur/dit_block_2
- Dataset de entrenamiento: https://huggingface.co/datasets/anschrur/record-test_2_20261115_115045
- Modelo predecesor: https://huggingface.co/anschrur/dit-cup
- Repositorio `robot_imitation_glue` (referenciado en la model card, sin URL directa publicada): no disponible
- Paper, blog o demo adicionales: no disponibles
