# dddddsds31341/vla-adapter-pick_balls-80k

# VLA-Adapter pick balls: checkpoint 80.000

## Resumen

VLA-Adapter pick balls 80k es un checkpoint de un modelo vision-lenguaje-acción (VLA) publicado en Hugging Face por el usuario `dddddsds31341`. Se trata de un ajuste sobre el paradigma VLA-Adapter del proyecto OpenHelix-Team, descrito por sus autores como un paradigma para modelos VLA de escala reducida ("tiny-scale"). El checkpoint está entrenado para una única tarea de manipulación: con un solo gripper, coger dos pelotas de tenis una a una y depositarlas en una cesta verde.

El modelo tiene 1.252.553.792 parámetros (~1,25 mil millones) y el repositorio ocupa 3,4 GB en formato safetensors. La entrada combina observaciones visuales, una instrucción en lenguaje natural y el estado proprioceptivo del robot (a través de un proyector de propiocepción); la salida es una acción motora producida por una cabeza de acción específica. El repositorio incluye los pesos fusionados, el adaptador LoRA, la cabeza de acción, el proyector de propiocepción, los ficheros de procesador/tokenizer y las estadísticas de normalización del dataset original.

Su interés es doble: por un lado, sirve como reproducción exacta del paso 80.000 de un entrenamiento concreto (100 demostraciones), lo que permite estudiar curvas de aprendizaje comparando con los checkpoints de 10k, 30k o el final de la colección del mismo autor; por otro, es un caso práctico de VLA de ~1,25 B de parámetros que cabe en GPU de consumo, algo poco habitual en un ecosistema dominado por modelos de 3 B a 7 B. La información pública es muy escasa: 0 descargas, 1 like, licencia e idiomas no declarados y ninguna métrica de éxito publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de escala reducida; familia VLA-Adapter (etiqueta `openvla`). Backbone visual y modelo lingüístico base: no disponible |
| Parametros totales | 1.252.553.792 (~1,25 mil millones), según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (sin GGUF, AWQ, GPTQ ni MLX) |
| Idiomas soportados | no disponible; la instrucción de entrenamiento está en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos fusionados + adaptador LoRA + cabeza de acción + proyector de propiocepción + procesador/tokenizer + estadísticas de normalización) |

Metadatos adicionales: pipeline `robotics`, etiquetas `vision-language-action`, `vla-adapter`, `pick_balls`, `custom_code` y `region:us`. Tamaño del repositorio: 3,4 GB. Requiere `trust_remote_code=True` por el uso de código personalizado.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de encoder visual, modelo lingüístico base, dimensionalidad del espacio de acciones ni si emplea decoding autorregresivo de tokens de acción discreta o una cabeza continua). Lo que sí se deduce del repositorio es la estructura del pipeline: un módulo visión-lenguaje que procesa imágenes e instrucción, un proyector de propiocepción que inyecta el estado de las articulaciones, y una cabeza de acción que emite el comando motor. La presencia de un adaptador LoRA junto a los pesos fusionados indica un ajuste de bajo rango sobre un modelo base VLA-Adapter preentrenado, no un entrenamiento desde cero.

Datos de entrenamiento declarados: 100 demostraciones de la tarea `pick_balls` y un total de 80.000 pasos de optimización. No se especifica el número de tokens, la composición del dataset, la resolución de las cámaras, la frecuencia de control ni si hubo etapas de RLHF o DPO (en robótica habitualmente no aplican; el ajuste se hace por imitación supervisada). Tampoco se documenta ninguna innovación técnica adicional más allá de lo que el proyecto VLA-Adapter describe genéricamente en su repositorio. Las estadísticas de normalización incluidas en el repo son necesarias para interpretar las acciones: sin ellas, las salidas del modelo no son directamente ejecutables en un robot.

## Capacidades

- Seguimiento de instrucciones en lenguaje natural para control robótico: mapea una frase del tipo "coge las dos pelotas de tenis y ponlas en la cesta verde" a una secuencia de acciones.
- Percepción visual y grounding de objetos: localiza pelotas de tenis y la cesta verde en la escena a partir de las observaciones de cámara (número y disposición de cámaras: no disponible).
- Control de un gripper paralelo de una sola pinza (manipulación secuencial: una pelota, luego la otra).
- Integración de propiocepción: consume el estado de las articulaciones mediante un proyector dedicado, no solo imágenes.
- Salida de acciones motoras de bajo nivel a través de una cabeza de acción específica del checkpoint.
- Capacidad de ser reajustado con pocas demostraciones (el autor publica versiones con 100 demos para distintas tareas, como `bottle`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni modo "thinking".
- No hay capacidades de audio, vídeo o generación de imagen.
- Capacidades multilingües: no disponibles; toda la evidencia apunta a instrucciones en inglés.

## Casos de uso

- Reproducción del experimento `pick_balls`: desplegar el checkpoint en un banco de pruebas con dos pelotas de tenis y una cesta verde para replicar el resultado del paso 80.000 y compararlo con los checkpoints de 10k y 30k del mismo autor.
- Estudio de curvas de entrenamiento en VLA: al existir checkpoints intermedios de la misma ejecución, permite medir cómo evoluciona la tasa de éxito por número de pasos, con el mismo dataset, la misma normalización y el mismo hardware.
- Fine-tuning con pocas demostraciones: partir de este checkpoint (o de su adaptador LoRA) para enseñar una tarea nueva con ~100 demos, aprovechando que 1,25 B de parámetros permiten iterar en una sola GPU de consumo.
- Investigación en robótica de bajo coste: ejecutar la política en una estación con RTX 3060/4060 Ti o en un Jetson de gama alta, midiendo latencia de control real en un bucle ROS 2 con un brazo de sobremesa.
- Docencia y laboratorios: usar el modelo como ejemplo mínimo y ejecutable de pipeline VLA completo (visión + lenguaje + propiocepción + cabeza de acción) en asignaturas de robótica o aprendizaje por imitación.
- Baseline para estudios de ablación: comparar el rendimiento con y sin el proyector de propiocepción, o con el adaptador LoRA activo frente a los pesos fusionados, para cuantificar la contribución de cada componente.
- Evaluación de robustez: someter el checkpoint a cambios de iluminación, fondo o posición de la cámara respecto a las condiciones de las 100 demostraciones y registrar la degradación de la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, ni comparación con otros checkpoints; el repositorio solo declara el número de pasos (80.000) y de demostraciones (100). Tampoco hay métricas de latencia o frecuencia de control.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5 GB solo para los pesos en bf16; con encoder visual, overhead de activaciones y buffers de cámara, un rango realista de 4 a 6 GB. En fp32, ~5 GB de pesos y 7-8 GB en total. En int8, ~1,3 GB; en 4 bits, ~0,7 GB (aunque no se publican pesos cuantizados y la cuantización de una cabeza de acción requiere validación empírica).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para escritorio; L4, A10G o A100 para servir varios entornos en paralelo o hacer barridos de evaluación.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más, lo que incluye portátiles con RTX 3060/4060 y, presumiblemente, plataformas embebidas tipo Jetson Orin (sin datos verificados de latencia en esas plataformas).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada por las etiquetas del repositorio. No hay soporte declarado en vLLM, TGI, llama.cpp ni Ollama, y estos runners difícilmente gestionan una cabeza de acción con estadísticas de normalización; el despliegue típico es un script Python que sirve la política a un stack de control (ROS 2, por ejemplo).
- Latencia y throughput: no disponibles. Al tratarse de un modelo de ~1,25 B, la latencia por paso debería ser sensiblemente menor que la de un VLA de 7 B, pero la frecuencia de control final la determina el lazo completo (captura de cámara, preprocesado, inferencia, envío de comandos), no solo el modelo.

## Comparativa con modelos similares

Los datos de las alternativas provienen del conocimiento general del ecosistema y no de la información proporcionada; verificar antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| VLA-Adapter pick_balls 80k (este) | ~1,25 B | no disponible | no disponible | Checkpoint comunitario de tarea única, 100 demos, sin métricas publicadas |
| VLA-Adapter (base, OpenHelix-Team) | no disponible en la información | no disponible | MIT según el proyecto en GitHub | Repositorio público con código; es la base sobre la que se ajusta este checkpoint |
| OpenVLA | ~7 B | no disponible | MIT (no verificado en la información disponible) | Referencia abierta de la categoría; ~5,6x más parámetros, requiere GPU de 24 GB o cuantización para inferencia cómoda |
| π0 (Physical Intelligence) | ~3,3 B | no disponible | no disponible | Enfoque de flow matching para control continuo; ~2,6x más parámetros |
| Octo | ~27 M / ~93 M | no disponible | Apache 2.0 (no verificado en la información disponible) | Modelo transformer ligero entrenado por imitación; mucho menor, sin componente lingüístico general |

La comparación honesta es que este checkpoint no compite en capacidades generales: es una política especializada de una sola tarea. Su ventaja frente a OpenVLA o π0 es el coste de despliegue (cabe en 6 GB) y la posibilidad de reentrenarlo en una GPU de consumo.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para `pick_balls` con 100 demostraciones; generalizará mal a otros objetos, otras instrucciones o disposiciones de cesta distintas.
- Sin métricas: no hay tasa de éxito publicada, ni protocolo de evaluación, ni número de episodios. No se puede afirmar que la política funcione de forma fiable.
- Sobreajuste probable a las condiciones de captura (posición e iluminación de cámara, fondo, tipo exacto de pelota). Cualquier cambio de dominio exige reajuste.
- Licencia no disponible: no se puede asumir uso comercial. Además, los pesos derivan de un modelo base VLA-Adapter cuya licencia (MIT según el proyecto) debe verificarse, junto con las licencias de los datos de preentrenamiento.
- Idiomas no declarados: la instrucción está en inglés; no hay evidencia de soporte de castellano ni de otras lenguas.
- Repositorio sin validación comunitaria: 0 descargas y 1 like en el momento de la consulta, publicado por un usuario individual y no por el equipo que firma el proyecto original.
- Dependencia crítica de las estadísticas de normalización: usar los pesos sin los ficheros de normalización del dataset produce acciones no interpretables.
- Riesgo de alucinación en el sentido robótico: el modelo puede generar una trayectoria plausible pero incorrecta (por ejemplo, intentar agarrar cuando no hay objeto), sin señal de confianza asociada.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no es un modelo de propósito general.
- Seguridad física: cualquier despliegue real necesita límites de par, paradas de emergencia y supervisión humana; un VLA de imitación no garantiza cumplimiento de restricciones cinemáticas.
- Fecha de creación del repositorio: 23 de octubre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/vla-adapter-pick_balls-80k
- Repositorio del proyecto VLA-Adapter (OpenHelix-Team): https://github.com/OpenHelix-Team/VLA-Adapter
- Página del proyecto VLA-Adapter: https://olud.ai/project/openhelix-team-vla-adapter.html
- Checkpoint hermano de la misma ejecución (paso 30.000): https://free2aitools.com/model/dddddsds31341/vla-adapter-pick_balls-30k
- Checkpoint de la tarea `bottle` (paso 10.000), mismo autor: https://huggingface.co/dddddsds31341/vla-adapter-bottle-10k
- Colección de checkpoints `bottle` (10k a 150005): https://huggingface.co/collections/dddddsds31341/xinyang-bottle-vla-adapter-checkpoints
