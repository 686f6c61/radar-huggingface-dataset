# khanhnd61/pop-pretrain-so100-community

## Resumen

PoP (Pointer Policy) es una política de imitación para robótica manipulativa desarrollada por el usuario khanhnd61, publicada en Hugging Face bajo licencia Apache 2.0. El modelo resuelve el control de un brazo robótico SO-101 de 6 articulaciones a partir de dos cámaras (una fija tras la base y otra en la muñeca) y de una condiciуn de referentes: un punto 2D sobre el objeto, un punto 2D sobre el destino y un código de habilidad. No recibe instrucciones en lenguaje natural, lo que lo diferencia de las políticas condicionadas por frases.

El repositorio contiene dos artefactos: un checkpoint de preentrenamiento (27,74 M de parámetros) entrenado por comportamiento clonado sobre el dataset comunitario SO-100 (`HuggingFaceVLA/community_dataset_v2`, 289 datasets, 10.639 episodios, 1.774.216 fotogramas a 10 Hz) y varios checkpoints de ajuste fino sobre cuatro tareas reales de SO-101 (doblar toalla, abrir cajón, apilar vasos y empujar una taza). El tronco visual es DINOv2 ViT-S/14 y la cabeza es un decodificador transformer con adaLN-zero.

Su relevancia actual es metodológica: el autor publica una comparación controlada entre PoP y una política condicionada por frases con la misma red, inicialización, datos y pasos de entrenamiento, midiendo error L1 de imitación sobre 20 demostraciones retenidas. Es un caso poco habitual de ablación honesta en robótica open source, aunque ninguno de los checkpoints se ha evaluado todavía en el robot real, por lo que no hay tasas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco DINOv2 ViT-S/14 congelado en fine-tuning + cabeza transformer decoder adaLN-zero; condicionamiento por referentes (puntos 2D y código de habilidad) |
| Parametros totales | 27,74 M (checkpoint de preentrenamiento); 28 M aprox. en PoP con referentes; 39,2 M en la variante condicionada por frases |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 vistas a 224 px y horizonte de acción de 16 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la variante con frases usa T5-Efficient-Tiny) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); tamaño del repo 2,0 GB |

## Arquitectura y entrenamiento

El modelo combina un tronco visual DINOv2 ViT-S/14 (22,06 M de parámetros) que procesa dos vistas a 224 px, la fija tras la base y la de la muñeca, con una cabeza de control de 5,68 M parámetros: un decodificador transformer de anchura 224, 4 capas y 7 cabezas que emite 16 objetivos articulares relativos a las articulaciones actuales a 10 Hz. El condicionamiento PoP codifica, por rol (objeto y destino), características de Fourier de la posición del punto en la vista fija y de su desplazamiento respecto a la punta del gripper proyectada, pasa por un MLP y un vector de rol; un destino ausente se representa con un vector nulo. El código de habilidad se elige entre 5 filas de un embedding. La variante base condicionada por frases sustituye los referentes por T5-Efficient-Tiny (11,4 M, ajustado) con mean-pooling proyectado al slot de habilidad.

El preentrenamiento se hizo por behavior cloning sobre 289 datasets de un solo brazo de 6 articulaciones (10.639 episodios, 1.774.216 fotogramas a 10 Hz, 49,28 h), 200.000 pasos con batch 256 y L1 final de entrenamiento de 0,125. Se entrenó sin lenguaje y sin referentes: los slots de referente contienen vectores nulos aprendidos y el código de habilidad usa una entrada reservada "unspecified". El ajuste fino usa 40.000 pasos con batch 64, AdamW (0,9, 0,95), weight decay 0,05, LR 3e-4 (3e-5 para tronco y codificador de texto), 2.000 pasos de warmup y coseno hasta el 10%, EMA 0,9995, bf16 y random crop (escala 0,8–1) en la vista fija con desplazamiento de los puntos. Los datos se convierten a 10 Hz y 256 × 256 sin mantener relación de aspecto, con una normalización común a las cuatro tareas.

## Capacidades

- Control de brazo robótico SO-101 de 6 articulaciones a partir de dos cámaras (fija y de muñeca).
- Política de imitación multi-tarea: una única política conjunta para doblar toallas, abrir cajones, apilar vasos y empujar objetos.
- Condicionamiento por referentes espaciales: punto 2D sobre el objeto, punto 2D sobre el destino y código de habilidad, sin lenguaje natural.
- Generación de chunks de 16 acciones articulares relativas a las articulaciones actuales a 10 Hz.
- Preentrenamiento reutilizable como inicialización para nuevas tareas de manipulación con SO-100/SO-101.
- Variante condicionada por frases (baseline) incluida en el repositorio para comparación controlada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente motor.

## Casos de uso

- Investigación en imitación robótica: usar el checkpoint de preentrenamiento como inicialización y comparar contra entrenamiento desde cero (DINOv2 solo) para medir la transferencia del preentrenamiento comunitario en tareas nuevas.
- Manipulación con instrucciones espaciales: en entornos donde el operario puede señalar el objeto y el destino en la imagen de la cámara fija, PoP evita depender de instrucciones en lenguaje y reduce la ambigüedad de la tarea.
- Automatización de tareas de pick-and-place en laboratorio: apilar vasos o colocar bloques en un cajón con la política multi-tarea ajustada, siempre que se disponga de las etiquetas de referente generadas por el pipeline del autor.
- Doblado de toallas y tareas deformables: el checkpoint `so101-fold-towel` se entrenó con 89 episodios y 10.226 fotogramas y sirve como base para experimentos con objetos deformables.
- Benchmarking de condicionamientos: el repositorio incluye la baseline con frases con el mismo tronco y receta, útil para publicar comparaciones reproducibles entre condicionamiento por lenguaje y por puntos.
- Docencia y prototipado con hardware asequible: SO-101 es un brazo de bajo coste; el modelo (28 M de parámetros) se puede ejecutar en GPU de consumo y sirve para prácticas de aprendizaje por imitación.
- Empujar objetos hacia un objetivo: el checkpoint `so101-push` (45 episodios, 5.352 fotogramas) cubre una habilidad de contacto continuo útil para estudiar control de fuerza.

## Benchmarks y rendimiento

Los únicos datos publicados son errores L1 de imitación sobre chunks de 16 pasos con pesos EMA, evaluados en 20 demostraciones retenidas (5 por tarea). No son tasas de éxito y ningún checkpoint se ha ejecutado en el robot real.

| Run | Modelo | Inicialización | Fotogramas | Semilla | L1 val (paso 40k) | drawer | towel | push | cups | L1 mínimo (paso) |
|---|---|---|---|---|---|---|---|---|---|---|
| `261121-so101-pop-s0` | PoP | preentrenamiento | labelled | 0 | 0,298 | 0,354 | 0,281 | 0,414 | 0,205 | 0,278 (4k) |
| `261121-so101-pop-s1` | PoP | preentrenamiento | labelled | 1 | 0,292 | 0,349 | 0,272 | 0,390 | 0,206 | 0,276 (6k) |
| `261121-so101-pop-scratch-s0` | PoP sin preentrenamiento | solo tronco DINOv2 | labelled | 0 | 0,284 | 0,310 | 0,289 | 0,423 | 0,198 | 0,271 (4k) |
| `261121-so101-sent-lab-s0` | Baseline con frases | preentrenamiento | labelled | 0 | 0,292 | 0,335 | 0,288 | 0,406 | 0,205 | 0,277 (4k) |
| `261121-so101-sent-lab-s1` | Baseline con frases | preentrenamiento | labelled | 1 | 0,294 | 0,328 | 0,301 | 0,414 | 0,208 | 0,277 (6k) |
| `261121-so101-sent-s0` | Baseline con frases | preentrenamiento | all | 0 | 0,294 | 0,341 | 0,286 | 0,409 | 0,205 | 0,276 (4k) |
| `261121-so101-sent-s1` | Baseline con frases | preentrenamiento | all | 1 | 0,298 | 0,337 | 0,283 | 0,419 | 0,217 | 0,277 (4k) |

Observación del autor: el error L1 mínimo se alcanza en los pasos 4k–6k, no en el checkpoint final de 40k, y ningún checkpoint se seleccionó por pérdida de validación. Las diferencias entre PoP, baseline con frases y entrenamiento desde cero son pequeñas (0,284–0,298 en el paso 40k), por lo que estos números no permiten concluir superioridad de un condicionamiento sobre otro.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~28 M de parámetros; en fp32 ocupa unos 112 MB de pesos y en bf16 unos 56 MB. Con dos vistas a 224 px y batch pequeño, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 3060 o superior; para entrenamiento de ajuste fino conviene una RTX 4090, A100 o H100 por el batch 64 y los 40k pasos.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo para inferencia; el entrenamiento completo también es viable en una GPU de consumo con 8–12 GB.
- Opciones de despliegue: el repositorio usa PyTorch puro con checkpoints `.pt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de robótica). El ecosistema natural es LeRobot, dado el etiquetado `lerobot` del repo.
- Latencia y throughput: no disponibles. El control opera a 10 Hz (100 ms por paso) según la frecuencia de los datos, pero no se publican mediciones de latencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoP (este repo) | 27,74 M (pretrain) / 28 M (PoP) / 39,2 M (frases) | 16 acciones a 10 Hz | Puntos 2D + código de habilidad o frases | Apache 2.0 | Hugging Face |
| Baseline con frases (mismo repo) | 39,2 M | 16 acciones a 10 Hz | T5-Efficient-Tiny | Apache 2.0 | Hugging Face |
| PoP sin preentrenamiento (mismo repo) | ~28 M | 16 acciones a 10 Hz | Puntos 2D + código de habilidad | Apache 2.0 | Hugging Face |
| Otras políticas para SO-100/SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con ACT, Diffusion Policy, OpenVLA u otras políticas de imitación para SO-100/SO-101, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Ningún checkpoint se ha evaluado en el robot real: los números publicados son errores de imitación L1, no tasas de éxito. No hay evidencia de que las políticas funcionen fuera de las demostraciones retenidas.
- El error L1 mínimo aparece en los pasos 4k–6k y crece hasta el paso 40k: el checkpoint final no es el mejor en validación y se publicó sin selección por pérdida.
- Las diferencias entre PoP, baseline con frases y entrenamiento desde cero son de 0,01–0,014 en L1, dentro del ruido esperable con solo dos semillas; no se puede afirmar superioridad de un condicionamiento.
- Dependencia fuerte de las etiquetas de referente: el pipeline de etiquetado (ajuste de cámara con URDF, cinemática directa, detección por color) tiene un residuo de unos 3 px a 256 px y solo cubre 39 de 45 episodios en `drawer-v3`; en otras tareas u objetos los puntos pueden ser incorrectos.
- El preentrenamiento se hizo sin lenguaje ni referentes (slots nulos y código "unspecified"), lo que limita lo que la inicialización aporta a tareas con condicionamiento real.
- Resolución fija de 256 × 256 sin mantener relación de aspecto y normalización común a las cuatro tareas: el modelo no recibe señal de qué tarea ejecuta salvo por los referentes y la habilidad.
- Entrenado exclusivamente para el brazo SO-100/SO-101 de 6 articulaciones con dos cámaras concretas; no es transferible directamente a otras morfologías o configuraciones de cámara.
- Sin datos sobre sesgos, alucinación o multilingüismo: no aplican en el sentido habitual, pero tampoco hay análisis de robustez ante cambios de iluminación, fondos u oclusiones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el tamaño del repo (2,0 GB) incluye checkpoints intermedios y logs.
- El resultado de búsqueda web proporcionado no guarda relación con el modelo y no aporta información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/pop-pretrain-so100-community
- Modelo base DINOv2: https://huggingface.co/facebook/dinov2-small
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/community_dataset_v2
- Dataset de ajuste fino (doblar toalla): https://huggingface.co/datasets/tmhoanggg/so101-fold-towel
- Dataset de ajuste fino (cajón): https://huggingface.co/datasets/tmhoanggg/so101-drawer-v3
- Dataset de ajuste fino (apilar vasos): https://huggingface.co/datasets/tmhoanggg/so101-stack-cup-v4
- Dataset de ajuste fino (empujar): https://huggingface.co/datasets/tmhoanggg/so101-push
- URDF del brazo SO-101: https://github.com/TheRobotStudio/SO-ARM100
- LeRobot (framework de robótica asociado): https://github.com/huggingface/lerobot
- Paper o blog de PoP: no disponible
- Demo o espacio interactivo: no disponible
