# padiredd/dp-blockpick-10k-table-texture

## Resumen

`dp-blockpick-10k-table-texture` es una política de difusión (diffusion policy) para robótica entrenada por el usuario padiredd sobre el fork `lerobot-cyclo` de ROBOTIS, dentro del ecosistema LeRobot. Resuelve una tarea muy concreta: el pick de un bloque verde lima en posición cenital (top-down) con el brazo izquierdo del robot bimanual ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. No es un modelo de lenguaje: es un controlador de acción que mapea observaciones visuales y de estado articular a consignas de articulaciones a 15 Hz.

El modelo tiene 287.533.680 parámetros (unos 288 M) y un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) en la raíz y nueve checkpoints intermedios cada 10.000 pasos. Se entrenó con 10.000 demostraciones en simulación (1.695.003 fotogramas) generadas con Isaac Lab, con aleatorización de dominio de nivel dr2 más aleatorización de apariencia (fondo, aspecto de la mesa, color y rugosidad del bloque). Es relevante ahora porque ejemplifica el flujo actual de entrenamiento de políticas visuomotoras en simulación con generalización a apariencia, un paso previo habitual antes de un despliegue en hardware real.

La información publicada no incluye resultados de evaluación: la model card indica explícitamente que los resultados se añadirán cuando se ejecuten. Tampoco hay datos de idiomas (no aplica, es un modelo de robótica) ni de benchmarks estándar de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por cámara y cabeza de acción; implementación LeRobot (fork `lerobot-cyclo` de ROBOTIS) |
| Parametros totales | 287.533.680 (~288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica); no disponible |
| Licencia | other (sin detalle de términos en la información disponible) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy: un modelo generativo de acciones basado en DDPM con 100 pasos de difusión que predice secuencias de acción de horizonte 64 (se ejecutan 32) condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) a 240x240 píxeles pasa por un encoder ResNet18 independiente; la entrada se completa con un vector de estado articular de 22 dimensiones. La salida son 16 consignas de articulación a 15 Hz.

El entrenamiento usó 10.000 demostraciones en simulación (1.695.003 fotogramas) de la tarea de pick cenital, con muestreo uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot). La aleatorización de dominio dr2 incluye pose inicial ±2 grados, apertura/cierre de pinza por episodio, empujes lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, variación de timing de demostración y altura de mesa de -2 a +2 cm; además, aleatorización de apariencia con fondo (foto de laboratorio real, textura de ambientCG o rejilla), aspecto de la mesa (nominal, color plano o textura) y color y rugosidad del bloque. La aumentación de imagen es agresiva: orden aleatorio de hasta 5 transformaciones entre brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se aplicó ruido de estado. La receta fue de 100.000 pasos con batch 32, Adam a 1e-4 con decaimiento coseno y semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB a ~5,7 pasos/s.

## Capacidades

- Control visuomotor de pick cenital: genera 16 consignas articulares a 15 Hz para el brazo izquierdo del FFW SG2 con pinza CAD.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) más estado articular de 22 dimensiones.
- Generalización a apariencia: entrenado con fondos, texturas de mesa y colores/rugosidades de bloque variables.
- Robustez a condiciones de iluminación y encuadre gracias a la aumentación de imagen y a la aleatorización dr2.
- Predicción de secuencias de acción con horizonte 64 y ejecución de 32 pasos (control por chunks).
- Tarea guiada por instrucción textual fija: "pick up the lime green block with the left arm" (no se documenta seguimiento de instrucciones variables).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni capacidades multilingües: es un controlador específico de tarea.

## Casos de uso

- Investigación en imitación con diffusion policies: usar el checkpoint como línea base reproducible de LeRobot para comparar variantes de aumentación o de arquitectura en la misma tarea de pick.
- Estudio de aleatorización de dominio: el modelo permite aislar el efecto de la aleatorización de apariencia (fondo, textura de mesa, color de bloque) frente a la aleatorización dr2 sobre la robustez visual.
- Preentrenamiento para transferencia sim-to-real: partir de este checkpoint y hacer fine-tuning con un pequeño conjunto de demostraciones reales del mismo robot y tarea.
- Validación de pipelines de evaluación en Isaac Lab: usar los checkpoints intermedios (10k a 90k) para trazar curvas de aprendizaje y elegir el punto de corte antes de desplegar.
- Pruebas de integración con LeRobot: verificar el ciclo completo de carga (`DiffusionPolicy.from_pretrained`), inferencia a 15 Hz y envío de consignas al robot o al simulador.
- Benchmarking de hardware de inferencia: medir latencia y throughput de una política de 288 M parámetros con tres ResNet18 en GPUs de consumo frente a la A5000 usada en entrenamiento.
- Docencia y demos de robótica: ejemplo autocontenido de política visuomotora entrenada íntegramente en simulación para cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten. El único dato de rendimiento documentado es el de entrenamiento: ~5,7 pasos/s con batch 32 en una RTX A5000 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los ~288 M parámetros en fp32 ocupan en torno a 1,15 GB solo en pesos; con tres ResNet18 y buffers de activación, una GPU de 8-12 GB debería ser suficiente en fp32, y menos en fp16/bf16 (estimación, no confirmada por el autor).
- GPU de entrenamiento documentada: una NVIDIA RTX A5000 de 24 GB.
- GPU recomendadas para inferencia: cualquier GPU con al menos 8 GB de VRAM; A5000, A100, H100 o RTX 4090 son holgadas para este tamaño.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay medición publicada.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained`), el fork `lerobot-cyclo` de ROBOTIS e Isaac Lab para simulación. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia; solo se conoce el throughput de entrenamiento (~5,7 pasos/s con batch 32 en A5000).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-10k-table-texture | ~288 M | Diffusion policy (DDPM, LeRobot) | 1 obs step, horizonte 64 / 32 ejecutados | other | Hugging Face (padiredd) |
| Diffusion Policy original (Chi et al., 2023) | variable según implementación | Diffusion policy (referencia académica) | horizonte configurable | código de investigación | Repositorio académico |
| ACT (Action Chunking Transformer, LeRobot) | ~80 M en configuraciones habituales | Transformer de chunking de acciones | horizonte de chunk configurable | Apache-2.0 (implementación LeRobot) | Hugging Face / LeRobot |
| π0 (Physical Intelligence) | ~3 B (VLA) | Vision-language-action flow matching | multi-tarea, instrucciones en lenguaje | no disponible en la información | Pesos publicados por el autor |

La comparación cuantitativa de rendimiento no está disponible porque este modelo no publica evaluaciones. Las alternativas se incluyen por categoría (políticas visuomotoras para manipulación), no por resultados medidos.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay métricas de éxito en simulación ni en real, por lo que no se puede afirmar su rendimiento.
- Especialización extrema: solo realiza el pick cenital de un bloque verde lima con el brazo izquierdo del FFW SG2; no es reutilizable en otras tareas sin reentrenamiento.
- Dependencia de hardware: requiere la configuración exacta (cámaras calibradas, pinza CAD, mesa de 29,25 in); cambios de montaje o calibración pueden degradar el comportamiento.
- Entrenado solo en simulación: existe brecha sim-to-real no cuantificada; la aleatorización de apariencia mitiga parte del problema, pero no lo elimina.
- Licencia "other" sin términos detallados: es imprescindible contactar con el autor antes de cualquier uso comercial.
- Riesgo de fallo silencioso en producción: una política de difusión puede generar trayectorias plausibles pero incorrectas sin señal de error; se recomienda monitorización externa y límites de par/velocidad.
- Sin soporte de instrucciones variables: la tarea está fijada por cadena de texto; no hay evidencia de generalización a otras frases u objetos.
- Sesgos de los datos de simulación: los materiales, colores e iluminaciones del dataset condicionan la distribución; objetos o texturas fuera de esa distribución pueden provocar fallos.
- Idiomas no aplicables; no hay capacidades de lenguaje, razonamiento ni código que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-10k-table-texture
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-dr-dr2-3cam
- LeRobot (framework): https://github.com/huggingface/lerobot
- Fork `lerobot-cyclo` de ROBOTIS: no disponible en la información proporcionada
- Isaac Lab (simulador): https://github.com/isaac-sim/IsaacLab
- Diffusion Policy (paper de referencia): https://arxiv.org/abs/2303.04137
- ROBOTIS FFW SG2: no disponible en la información proporcionada
