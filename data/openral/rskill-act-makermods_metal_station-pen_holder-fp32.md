# OpenRAL/rskill-act-makermods_metal_station-pen_holder-fp32

## Resumen

`rskill-act-makermods_metal_station-pen_holder-fp32` es un paquete de política robótica publicado por OpenRAL bajo el paraguas de su formato rSkill. No contiene pesos propios: es un manifiesto (`rskill.yaml`) que apunta al checkpoint ACT de MakerMods `makermods/act_pen_holder_bi` (fijado en el commit `a4af0cc4`) y declara el contrato de observación-acción, las unidades, la base temporal y los alias de cámara de la estación bimanual MakerMods Metal Arm Station.

El modelo subyacente es un Action Chunking Transformer (ACT) de LeRobot 0.6.0 con unos 51,6 M de parámetros (207 MB en fp32), backbone ResNet-18 por vista, encoder de 4 capas, decoder de 1 capa y latente VAE de 32 dimensiones. Resuelve una tarea concreta de manipulación: el brazo izquierdo levanta un portabolígrafos de una estantería, el brazo derecho introduce un rotulador en él y el izquierdo lo devuelve a su sitio, a partir de tres vistas RGB (superior y dos muñecas) y un estado articular de 14 dimensiones.

Su relevancia es doble: por un lado ilustra el formato rSkill como capa de empaquetado reproducible sobre políticas LeRobot; por otro, la propia model card documenta que la política falla en bucle cerrado en el gemelo MuJoCo (30 episodios de benchmark fallidos), lo que la convierte en un caso de estudio útil sobre la brecha entre ajuste supervisado y ejecución real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): ResNet-18 por vista, encoder de 4 capas, decoder de 1 capa, latente VAE de 32-D |
| Parametros totales | ~51,6 M (207 MB en fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 3 vistas + estado, horizonte de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp32) |
| Idiomas soportados | en (cadena de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint LeRobot; el paquete rSkill no copia pesos) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice trozos (*chunks*) de acciones futuras en lugar de acciones individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. En esta implementación, cada una de las tres cámaras de 480×640 pasa por su propio backbone ResNet-18; las características resultantes se concatenan con el estado de 14 dimensiones y se procesan con un encoder de 4 capas y un decoder de 1 capa que emite un chunk de 100 pasos de posiciones articulares absolutas (en grados) más los recorridos de pinza. El latente VAE de 32 dimensiones actúa como regularizador durante el entrenamiento.

Los datos provienen del dataset `makermods/pen_holder_bi_20260723_161553`, compuesto por 41 episodios reales de teleoperación bimanual a 30 Hz. La normalización es MEAN_STD sobre estado, imágenes y acciones, aplicada por los procesadores propios del checkpoint. No hay RLHF ni DPO: es imitación supervisada pura. Detalles técnicos destacables del manifiesto: conversión explícita de unidades (radianes ↔ grados en las articulaciones, recorrido de pinza normalizado ↔ escala 100), sin ensamblado temporal (`n_action_steps` 100, el chunk se reproduce completo antes de la siguiente inferencia) y una pinza de 20 mm de diámetro de objeto con recorrido sostenido mediano de 21,2 en el dataset.

## Capacidades

- Manipulación bimanual de precisión: `pick`, `place` e `insert` sobre los objetos `pen` y `pen_holder` en escena `tabletop`.
- Política visomotora pura: consume tres vistas RGB (superior, muñeca izquierda, muñeca derecha) y estado articular de 14-D; no procesa lenguaje libre más allá de la cadena de tarea fija.
- Salida de acciones en chunk de 100 pasos a 30 Hz con posiciones articulares absolutas en grados y recorridos de pinza.
- Contrato de unidades explícito: conversión radianes/grados y normalización de pinza con escala 100 y recorte a apertura máxima.
- Ejecución en gemelo digital MuJoCo mediante la escena `makermods_metal_pen_holder.yaml`.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento: es una política de control, no un VLA conversacional.
- Multilingüismo: no disponible; la única cadena textual es la instrucción de tarea en inglés.

## Casos de uso

- Investigación en imitación bimanual: replicar el pipeline ACT de LeRobot sobre el dataset de 41 episodios para estudiar el efecto del horizonte de chunk y de la normalización en tareas de pick-and-place con dos brazos.
- Validación de formato rSkill: usar este paquete como referencia de cómo declarar contrato de observación-acción, unidades y alias de cámara sin redistribuir pesos, integrándolo en herramientas que consuman `rskill.yaml`.
- Benchmark de sim-a-real: comparar el fallo documentado en bucle cerrado (30 episodios `fail`) con el replay en bucle abierto de las acciones grabadas para aislar si el problema está en la política o en la dinámica del gemelo.
- Pruebas de integración de hardware: desplegar sobre la estación MakerMods Metal Arm Station real con las tres cámaras y el estado de 14-D, verificando el códec de unidades (grados, escala de pinza 100) antes de ampliar la tarea.
- Estudio de agarre de objetos delgados: el rotulador de 20 mm y el recorrido sostenido mediano de 21,2 permiten analizar el margen de la pinza y el momento de liberación (la política abre de 21 a 26 en unos 20 pasos cuando suelta).
- Base para *fine-tuning* con más episodios: al ser un checkpoint pequeño (51,6 M parámetros, 2 GB de VRAM mínima declarada) sirve como inicialización barata para ampliar el dataset de teleoperación.
- Docencia y demostraciones: el tamaño reducido y la latencia declarada de 100 ms por inferencia permiten ejecutarlo en portátiles con GPU modesta para clases de robótica de imitación.

## Benchmarks y rendimiento

La model card no publica métricas de éxito cuantitativas por episodio, pero sí un resultado de evaluación cualitativo y explícito en el gemelo MuJoCo:

| Evaluación | Entorno | Resultado |
|---|---|---|
| Bucle cerrado, seed 0, 900 pasos | MuJoCo `makermods_metal_pen_holder.yaml` | fallo: el brazo izquierdo se detiene junto al vaso, el derecho flota sobre el rotulador y no se agarra nada |
| Benchmark de 30 episodios | MuJoCo | 30 `fail` |
| Replay bucle abierto de acciones grabadas (episodio 0) | MuJoCo | completa (frame 398, calificado `complete`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este tipo de modelo. Latencia declarada: 100 ms por inferencia; VRAM mínima declarada: 2,0 GB; runtime PyTorch en fp32.

## Requisitos de hardware

- VRAM estimada: 2,0 GB mínimos según el manifiesto (checkpoint de 207 MB más activaciones de las tres ResNet-18 a 480×640).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 4090 o A100 sobran para esta carga. La model card menciona ejecuciones en `q5090`.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4060 en adelante).
- Despliegue: LeRobot 0.6.0 con PyTorch; el paquete se ejecuta mediante `openral sim run --config scenes/sim/makermods_metal_pen_holder.yaml --rskill rskills/act-pen-holder-bi`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de control).
- Latencia y throughput: 100 ms por inferencia declarados; cada inferencia produce un chunk de 100 pasos que se reproduce completo antes de la siguiente, es decir, unos 3,3 s de acción por llamada a 30 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (ACT pen_holder) | ~51,6 M | chunk de 100 pasos, 3 vistas | pick/place/insert bimanual sobre portabolígrafos | Apache 2.0 | Hugging Face, vía manifiesto rSkill |
| `makermods/act_pen_holder_bi` | ~51,6 M | idéntico | idéntico | no disponible | Hugging Face (checkpoint de pesos original) |
| ACT original (Zhao et al., 2023) | no disponible | no disponible | imitación general con chunks de acción | no disponible | paper arXiv 2304.13705, código público |
| Otras políticas LeRobot del mismo ecosistema | no disponible | no disponible | manipulación con datasets propios | variable | Hugging Face, librería `lerobot` |

La comparación relevante es contra el checkpoint upstream: este paquete es funcionalmente el mismo modelo con un manifiesto añadido y sin pesos. No se dispone de datos de benchmarks comparativos con otras políticas en la información proporcionada.

## Limitaciones y advertencias

- Falla en bucle cerrado en simulación: 30 de 30 episodios de benchmark fallidos y el rollout de la seed 0 no agarra ningún objeto en 900 pasos. No debe presentarse como una política funcional sin validación adicional.
- No contiene pesos: es un manifiesto que referencia `makermods/act_pen_holder_bi` en el commit `a4af0cc4`; si ese repositorio cambia o desaparece, el paquete deja de ser reproducible.
- Especialización extrema: una única tarea, dos objetos, una escena y un embodiment. No generaliza a otras instrucciones ni a otras estaciones.
- Sin comprensión de lenguaje: la cadena de tarea es fija; no hay interfaz conversacional ni tool calling.
- Dependencia de calibración de unidades: grados con signos y ceros del URDF, recorrido de pinza con escala 100 y conversión in-scene (joint8 = stroke / 2000 − 1,25 mm). Un error de calibración invalida el control.
- Margen de agarre estrecho: el rotulador de 20 mm se sostiene con recorrido mediano 21,2 (p90 23,2, máximo 25,6); comandos por encima de 100 se recortan a apertura máxima.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: la política puede abrir la pinza lejos del vaso (liberación prematura documentada de 21 a 26 en unos 20 pasos) sin señal de error.
- Idiomas: solo inglés en la cadena de tarea; sin soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías de éxito en evaluación hace necesaria una validación propia antes de cualquier despliegue en producción.
- Dataset pequeño (41 episodios) y sin RLHF/DPO: sesgos de teleoperador y sobreajuste a las poses iniciales del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-act-makermods_metal_station-pen_holder-fp32
- Checkpoint upstream: https://huggingface.co/makermods/act_pen_holder_bi
- Dataset de entrenamiento: https://huggingface.co/datasets/makermods/pen_holder_bi_20260723_161553
- Paper ACT: https://arxiv.org/abs/2304.13705
- Rollout en bucle cerrado (fallo, seed 0): https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/simulation/metal-pen-holder_act-pen-holder-bi_fail/full.mp4
- Póster del rollout: https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/simulation/metal-pen-holder_act-pen-holder-bi_fail/poster.jpg
- LeRobot (librería): no disponible en la información proporcionada
