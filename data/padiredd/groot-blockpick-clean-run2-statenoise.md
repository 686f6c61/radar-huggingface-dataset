# padiredd/groot-blockpick-clean-run2-statenoise

## Resumen

`groot-blockpick-clean-run2-statenoise` es un fine-tune de robótica del modelo fundacional visión-lenguaje-acción (VLA) GR00T N1.7 de 3B parámetros, desarrollado originalmente por NVIDIA. El autor, `padiredd`, lo ha especializado sobre un conjunto de 500 demostraciones limpias de una tarea concreta: recogida cenital de un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, simulado en Isaac Lab. El repositorio contiene cinco checkpoints intermedios (pasos 20k, 40k, 60k, 80k y 100k) de un entrenamiento planificado de 100.000 pasos.

El modelo resuelve un problema acotado pero representativo en robótica de manipulación: convertir instrucciones en lenguaje natural e imágenes de tres cámaras en secuencias de 16 objetivos articulares absolutos para los dos brazos. Su relevancia radica en que documenta una receta de fine-tune completa sobre un VLA de NVIDIA, incluyendo aumentación de imagen, ruido gaussiano sobre el estado articular y dropout de estado, lo que lo convierte en una referencia útil para quien quiera adaptar GR00T N1.7 a su propio robot o tarea.

Arquitectura: VLA basada en el backbone Cosmos-Reason2-2B (congelado durante el fine-tune) con un proyector y una cabeza de acción de difusión entrenables (1,62 B parámetros entrenables). Contexto de lenguaje y visión según el modelo base; el chunk de acción es de 16 pasos. Licencia `other` (heredada del modelo base, no disponible en detalle).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): backbone Cosmos-Reason2-2B congelado + proyector + cabeza de acción de difusión |
| Parametros totales | 3B (modelo base GR00T-N1.7-3B) |
| Parametros activos | no aplica (no es MoE); 1,62 B entrenables en el fine-tune |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos subidos en fp32; 12,6 GB por checkpoint) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés: "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors (shards fp32) + config.json, processor_config.json, statistics.json, embodiment_id.json |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.7-3B de NVIDIA, un VLA que combina un backbone de razonamiento visión-lenguaje (Cosmos-Reason2-2B) con una cabeza de acción de difusión que genera chunks de 16 acciones. En este fine-tune el backbone permanece congelado y solo se ajustan el proyector y la cabeza de acción, con 1,62 B parámetros entrenables. La interfaz de embodiment es `new_embodiment` con estado de 16 dimensiones (8 articulaciones por brazo) y acción de 16 objetivos articulares absolutos.

El entrenamiento se realizó sobre 500 demostraciones (77.220 frames, 3 cámaras a 240x240) de una recogida cenital con pose inicial fija y bloque uniformemente distribuido en x 0,23-0,48 m / y 0,065-0,315 m. Receta: AdamW, lr 1e-4 con coseno y warmup del 5 %, weight decay 1e-5, batch global 32, fp32, checkpoint cada 20k pasos, shard 1024, tasa de muestreo de episodios 0,1 y 12 workers de carga. Aumentación de imagen: color jitter (brillo 0,4, contraste 0,4, saturación 0,5, tono 0,1), rotación aleatoria de 5 grados y random crop del repositorio. Regularización específica: ruido gaussiano de 1 grado sobre las 7 articulaciones del brazo izquierdo y dropout de estado 0,2 (valor por defecto del repositorio). Hardware: A100 80 GB, ~0,68 s/paso. No se subieron estados de optimizador, scheduler ni RNG.

## Capacidades

- Generación de acciones de manipulación: dado un estado articular de 16 dimensiones, tres imágenes de cámara y una instrucción en lenguaje natural, produce un chunk de 16 objetivos articulares absolutos.
- Comprensión visión-lenguaje heredada del backbone Cosmos-Reason2-2B para interpretar la escena y la instrucción.
- Ejecución de una tarea específica: recogida cenital de un bloque verde lima con el brazo izquierdo.
- Integración con el ecosistema Isaac-GR00T mediante `Gr00tPolicy(embodiment_tag="new_embodiment", model_path=<carpeta>)`.
- Configuración de modalidad registrable (`ffw_bg2_pick_cube_3cam_config.py`) para adaptar entradas y salidas.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modo thinking; son propias del backbone pero no se han validado en este fine-tune.

## Casos de uso

- Investigación en manipulación robótica: servir como punto de partida reproducible para estudiar el efecto del ruido de estado y la aumentación de imagen en políticas VLA, comparando los cinco checkpoints publicados.
- Benchmark de políticas de imitación: el autor prevé comparar sus rollouts en simulación (50 recogidas) con las políticas de difusión de `padiredd/dp-blockpick-*`, lo que permite evaluar VLA frente a políticas de difusión clásicas en la misma tarea.
- Prototipado de robots humanoides en Isaac Lab: usar el modelo con el robot ROBOTIS FFW SG2 para validar pipelines de percepción-acción antes de transferir a hardware real.
- Fine-tune sobre nuevos embodiments: la receta (backbone congelado, cabeza de acción entrenable, dropout de estado, ruido articular) sirve de plantilla para adaptar GR00T a otras tareas de recogida con distintos objetos o brazos.
- Generación de datos sintéticos y aumento de demostraciones: ejecutar la política en simulación para producir trayectorias adicionales que alimenten entrenamientos posteriores.
- Docencia y divulgación: ejemplo completo y documentado de extremo a extremo (dataset, receta, checkpoints, evaluación) para cursos de aprendizaje por imitación y VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los rollouts en simulación (50 recogidas, mismo protocolo que las políticas de difusión) se añadirán a medida que estén disponibles, pero no incluye cifras en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint ocupa 12,6 GB en fp32; se necesita al menos ~16 GB de VRAM para cargar el modelo y el procesador sin cuantizar. No se documentan versiones cuantizadas.
- GPU recomendadas: A100 80 GB (usada para entrenamiento); para inferencia, una GPU con 16-24 GB o más es suficiente en fp32.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, RTX A4000/A5000), siempre que se disponga de memoria suficiente para los tres streams de cámara y el estado.
- Opciones de despliegue: el autor usa el fork `omkarpatil18/Isaac-GR00T-n1.7` (commit e81d02b) con `Gr00tPolicy` y `groot_server.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un VLA de acción).
- Latencia y throughput: no disponibles; el entrenamiento reporta ~0,68 s/paso en A100 80 GB, pero no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-blockpick-clean-run2-statenoise | 3B (1,62 B entrenables) | no disponible | Recogida cenital, brazo izquierdo, FFW SG2 | other | HuggingFace (5 checkpoints) |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | VLA generalista | other | HuggingFace |
| padiredd/dp-blockpick-* (políticas de difusión) | no disponible | no aplica | Misma tarea de recogida | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo se ha entrenado para una tarea, un objeto (bloque verde lima), un brazo (izquierdo) y una pose inicial fija; no generalizará a otras tareas sin fine-tune adicional.
- Dominio simulado: entrenado en Isaac Lab con el robot ROBOTIS FFW SG2; la transferencia a hardware real (sim-to-real) no está documentada ni validada.
- Sin métricas publicadas: no hay resultados de éxito en simulación ni comparativas con el modelo base, por lo que su rendimiento real es desconocido.
- Licencia `other` heredada de NVIDIA GR00T N1.7: es imprescindible revisar los términos del modelo base antes de cualquier uso comercial; no se detallan restricciones en la model card.
- Idiomas: no se documentan capacidades multilingües; la instrucción de tarea está en inglés.
- Riesgo de sobreajuste a la distribución de entrenamiento (posición del bloque, iluminación, timing fijo de las demostraciones), mitigado parcialmente por la aumentación y el ruido de estado.
- No se incluyen estados de optimizador, scheduler ni RNG, lo que impide reanudar el entrenamiento exactamente desde los checkpoints publicados.
- Riesgo de alucinación en la interpretación de la escena por parte del backbone VLM; no evaluado en este fine-tune.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/groot-blockpick-clean-run2-statenoise
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-25cm-500-3cam (referenciado en la model card)
- Fork de Isaac-GR00T usado: https://github.com/omkarpatil18/Isaac-GR00T-n1.7 (commit e81d02b)
- Políticas de difusión comparables: `padiredd/dp-blockpick-*` (referenciadas en la model card; no se proporciona URL directa)
