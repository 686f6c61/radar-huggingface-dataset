# khanhnd61/pop-so101

## Resumen

PoP (Pointer Policy) es una política de imitación para robótica manipulativa que se condiciona mediante *referentes* explícitos: un punto 2D sobre el objeto, un punto 2D sobre el destino y un código de habilidad discreto, en lugar de una instrucción en lenguaje natural. El repositorio `khanhnd61/pop-so101`, publicado por el usuario khanhnd61, contiene el checkpoint de preentrenamiento sobre datos comunitarios de SO-100 y los checkpoints de un experimento comparativo en cuatro tareas reales con el brazo SO-101, enfrentando PoP a una política condicionada por frases con la misma red, inicialización, datos y pasos de entrenamiento.

La arquitectura combina un tronco visual DINOv2 ViT-S/14 (22,06 M de parámetros) que procesa las vistas fija y de muñeca a 224 px, con una cabeza transformer decoder de tipo adaLN-zero de 5,68 M de parámetros que emite 16 objetivos articulares relativos a las juntas actuales a 10 Hz. El condicionamiento por referentes añade alrededor de 28 M de parámetros en total. El preentrenamiento se realizó por *behaviour cloning* sobre `HuggingFaceVLA/community_dataset_v2` (289 datasets de un solo brazo, 10.639 episodios, 1.774.216 fotogramas a 10 Hz, equivalentes a 49,28 h) durante 200k pasos con batch 256 y un L1 final de 0,125.

La relevancia del modelo es metodológica: elimina el lenguaje del bucle de control y lo sustituye por una interfaz de puntero de bajo coste de anotación, generada automáticamente a partir de las demostraciones mediante cinemática directa y ajuste de la pose de cámara contra el URDF del SO-101. Los resultados publicados son errores de imitación (L1 sobre *chunks* de 16 acciones), no tasas de éxito en robot, y el propio autor advierte de que ningún checkpoint se ha ejecutado todavía en el hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tronco DINOv2 ViT-S/14 + cabeza transformer decoder adaLN-zero (4 capas, ancho 224, 7 cabezas); condicionamiento por referentes (Fourier + MLP + vector de rol) y código de habilidad |
| Parámetros totales | ~28 M (PoP completo); tronco 22,06 M + cabeza 5,68 M; variante con condicionamiento por frases: 39,2 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de observación de 2 vistas a 224 px y horizonte de acción de 16 pasos a 10 Hz |
| Tipos de cuantización | No disponibles (checkpoints en punto flotante, entrenados en bf16) |
| Idiomas soportados | No disponible (el condicionamiento principal no usa lenguaje; la variante baseline usa T5-Efficient-Tiny) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), con `config.json` y `train.log` por ejecución |

## Arquitectura y entrenamiento

El modelo es una política de imitación de extremo a extremo. El tronco DINOv2 ViT-S/14, afinado durante el entrenamiento, procesa dos vistas de 224 px: una cámara fija detrás de la base del robot y una cámara en la muñeca. La cabeza es un decoder transformer con normalización adaLN-zero que predice 16 objetivos articulares relativos a las juntas actuales, a una frecuencia de 10 Hz. El condicionamiento PoP codifica, por cada rol (objeto y destino), características de Fourier de la posición del punto en la vista fija y de su desplazamiento respecto a la punta del efector proyectada, pasadas por un MLP y un vector de rol; un destino ausente se representa con un vector nulo. El código de habilidad se selecciona de una tabla de 5 filas de *embedding*. La variante baseline sustituye este esquema por T5-Efficient-Tiny (11,4 M), con *mean pooling* y proyección en la ranura de habilidad.

El preentrenamiento se hizo por *behaviour cloning* sin lenguaje ni referentes: las ranuras de referente contienen vectores nulos aprendidos y el código de habilidad apunta a una entrada reservada "unspecified". El ajuste fino usa 40k pasos con batch 64, AdamW (0,9, 0,95), weight decay 0,05, learning rate 3e-4 (3e-5 para el tronco y el codificador de texto), 2k de *warmup* y coseno hasta el 10 %, EMA 0,9995, bf16 y *random crop* (escala 0,8–1) sobre la vista fija con desplazamiento de los puntos. Las etiquetas de referente se generan sin detector ni marcas manuales: se ajusta por dataset la pose de cámara, distancia focal, distorsión radial y un desplazamiento constante por junta, minimizando el error entre la superficie proyectada del URDF `so101_new_calib.urdf` y los píxeles naranjas del brazo (residual de unos 3 px a 256 px). Los puntos se derivan de la cinemática directa: el objeto es donde el gripper cierra y el destino donde abre.

## Capacidades

- Control robótico de manipulación de 6 juntas para el brazo SO-101, con salida de 16 acciones relativas a 10 Hz.
- Condicionamiento por puntero: acepta un punto 2D de objeto, un punto 2D de destino y un código de habilidad entre 5 posibles.
- Ejecución de habilidades compuestas: plegado de toalla, apertura de cajón, *pick-and-place* y cierre, apilado de vasos en dos fases y empuje de objeto a meta.
- Política conjunta multi-tarea: un único modelo entrenado sobre las cuatro tareas, con normalización pooled que no revela la tarea.
- Preentrenamiento transferible: el checkpoint de 200k pasos sobre datos comunitarios sirve como inicialización para ajuste fino.
- Percepción visual multi-cámara (vista fija y vista de muñeca) mediante DINOv2.
- No soporta *tool calling*, agentes, razonamiento multi-paso simbólico, visión general, audio ni generación de texto.

## Casos de uso

- Plegado de toallas en laboratorio: el modelo ejecuta la habilidad `fold` sobre el SO-101 usando dos puntos de referente (punto de agarre y punto de destino del pliegue); es adecuado porque la tarea está entrenada con 89 episodios y 10.226 fotogramas de entrenamiento.
- Apertura y cierre de cajones con manipulación intermedia: la secuencia "abrir cajón superior, introducir el bloque rojo, cerrar" se cubre con los códigos de habilidad `open`, `pick-and-place` y `close`, con 45 episodios de entrenamiento y 11.821 fotogramas.
- Apilado de vasos en dos fases: el modelo encadena dos *pick-and-place* (rosa sobre beige, luego ambos sobre blanco) con 114 episodios y 27.309 fotogramas, el conjunto de datos más grande del ajuste fino.
- Empuje de objetos a una meta: la habilidad `push` localiza la taza por color sobre el plano de la mesa y usa como destino el punto final registrado; útil para tareas de alcance simple con 45 episodios.
- Inicialización para nuevos datasets de SO-101: el checkpoint `pretrain/261120-pretrain-community-s0/step_200000.pt` sirve como punto de partida para ajustar políticas en tareas no vistas, con un L1 de entrenamiento de 0,125.
- Investigación en interfaces de condicionamiento: permite comparar PoP frente a condicionamiento por frases con idéntica red, datos y pasos, lo que facilita aislar el efecto de la interfaz de instrucción en estudios de imitación.
- Recolección de datos asistida: el pipeline de etiquetado automático de referentes (URDF + cinemática directa + ajuste de cámara) puede reutilizarse para anotar nuevas demostraciones sin detector ni marcas manuales.

## Benchmarks y rendimiento

Los únicos datos publicados son errores de imitación L1 (pesos EMA) sobre *chunks* de 16 acciones normalizadas, evaluados en 20 demostraciones reservadas (5 por tarea). No son tasas de éxito: ningún checkpoint se ha ejecutado en el robot.

| Ejecución | Modelo | Inicialización | Fotogramas | Semilla | L1 val (paso 40k) | drawer | towel | push | cups | L1 mínimo (paso) |
|---|---|---|---|---|---|---|---|---|---|---|
| `261121-so101-pop-s0` | PoP | preentrenamiento | etiquetados | 0 | 0,298 | 0,354 | 0,281 | 0,414 | 0,205 | 0,278 (4k) |
| `261121-so101-pop-s1` | PoP | preentrenamiento | etiquetados | 1 | 0,292 | 0,349 | 0,272 | 0,390 | 0,206 | 0,276 (6k) |
| `261121-so101-pop-scratch-s0` | PoP sin preentrenamiento | solo tronco DINOv2 | etiquetados | 0 | 0,284 | 0,310 | 0,289 | 0,423 | 0,198 | 0,271 (4k) |
| `261121-so101-sent-lab-s0` | Baseline por frases | preentrenamiento | etiquetados | 0 | 0,292 | 0,335 | 0,288 | 0,406 | 0,205 | 0,277 (4k) |
| `261121-so101-sent-lab-s1` | Baseline por frases | preentrenamiento | etiquetados | 1 | 0,294 | 0,328 | 0,301 | 0,414 | 0,208 | 0,277 (6k) |
| `261121-so101-sent-s0` | Baseline por frases | preentrenamiento | todos | 0 | 0,294 | 0,341 | 0,286 | 0,409 | 0,205 | 0,276 (4k) |
| `261121-so101-sent-s1` | Baseline por frases | preentrenamiento | todos | 1 | 0,298 | 0,337 | 0,283 | 0,419 | 0,217 | 0,277 (4k) |

Lectura de los datos: las diferencias entre PoP, PoP sin preentrenamiento y la baseline por frases son pequeñas (0,284–0,298 en el paso 40k) y el mínimo de validación se alcanza pronto (pasos 4k–6k), lo que sugiere sobreajuste posterior. El autor indica explícitamente que ningún checkpoint se seleccionó por pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ronda los 28 M de parámetros (~112 MB en fp32, ~56 MB en bf16), más el tronco DINOv2 ViT-S/14; el peso del repositorio es de 2,0 GB, dominado por los múltiples checkpoints (preentrenamiento y siete ejecuciones de ajuste fino con dos pasos cada una).
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM es suficiente para inferencia; para entrenamiento con batch 64 y dos vistas a 224 px se recomienda una GPU de 16 GB o superior.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: al ser un checkpoint PyTorch `.pt` con `config.json`, el despliegue natural es un script de inferencia en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 10 Hz, lo que fija un presupuesto de 100 ms por paso de control, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Condicionamiento | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoP (este repo) | ~28 M | Punto de objeto, punto de destino y código de habilidad | 16 acciones a 10 Hz | Apache 2.0 | Hugging Face |
| Baseline por frases (mismo repo) | 39,2 M | Frase en lenguaje natural vía T5-Efficient-Tiny | 16 acciones a 10 Hz | Apache 2.0 | Hugging Face |
| PoP sin preentrenamiento (mismo repo) | ~28 M | Referentes, inicializado solo con DINOv2 | 16 acciones a 10 Hz | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los resultados publicados son errores de imitación L1, no tasas de éxito; ningún checkpoint se ha probado en el robot real.
- El mínimo de validación se alcanza en los pasos 4k–6k y el L1 empeora hasta el paso 40k, lo que indica sobreajuste; no se seleccionó ningún checkpoint por validación.
- El condicionamiento PoP requiere puntos 2D de objeto y destino y un código de habilidad; no acepta instrucciones en lenguaje natural.
- Las etiquetas de referente se generan con un pipeline específico (URDF del SO-101, cinemática directa, ajuste de cámara con residual de ~3 px), por lo que dependen de una calibración correcta y de la morfología exacta del brazo.
- El ajuste fino cubre solo cuatro tareas y un único robot de 6 juntas; no hay evidencia de generalización a otras tareas, objetos o brazos.
- La normalización pooled sobre las cuatro tareas no revela la tarea al modelo, pero tampoco se documenta su comportamiento fuera de esa distribución.
- Los datos de entrenamiento son demostraciones humanas de teleoperación, con los sesgos de estilo y cobertura que ello implica; no se documentan análisis de sesgo adicionales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni resultados en hardware real.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y fue creado y actualizado el mismo día (21 de noviembre de 2026), lo que indica que se trata de un artefacto de investigación reciente y sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/pop-so101
- Modelo base DINOv2 ViT-S/14: https://huggingface.co/facebook/dinov2-small
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/community_dataset_v2
- Dataset de plegado de toalla: https://huggingface.co/datasets/tmhoanggg/so101-fold-towel
- Dataset de cajón: https://huggingface.co/datasets/tmhoanggg/so101-drawer-v3
- Dataset de apilado de vasos: https://huggingface.co/datasets/tmhoanggg/so101-stack-cup-v4
- Dataset de empuje: https://huggingface.co/datasets/tmhoanggg/so101-push
- URDF del brazo SO-101: https://github.com/TheRobotStudio/SO-ARM100
