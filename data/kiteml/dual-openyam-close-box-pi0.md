# kiteml/dual-openyam-close-box-pi0

## Resumen

π₀ dual OpenYAM "close the box" es una política robótica de tipo vision-language-action (VLA) publicada por kiteml, entrenada para que un robot bimanual OpenYAM cierre una caja. Se apoya en la arquitectura π₀, un modelo de flujo que combina un backbone PaliGemma (visión-lenguaje) con un experto de acciones basado en flow matching. El modelo tiene 4.028.019.472 parámetros (unos 4,03 mil millones) y un repositorio de 8,9 GB distribuido en safetensors.

A diferencia de otras políticas del mismo conjunto, esta π₀ no se inicializó desde pesos π₀ preentrenados: el backbone PaliGemma se inicializó de forma aleatoria y se congeló, de modo que solo se entrenó el experto de acciones. Esto es relevante porque el resultado es, en la práctica, un artefacto de investigación que demuestra el entrenamiento de un experto de acciones sobre características visuales no preentrenadas, y no una política generalista lista para producción.

El modelo se entrenó con la plataforma Kite sobre LeRobot v0.6.0, con un dataset propio de 31 episodios y 33.247 fotogramas a 30 fps, durante 20.000 pasos. La tarea es estrecha (cerrar la caja) y el modelo no ha sido evaluado con rollouts reales ni en simulación, por lo que su utilidad práctica está todavía por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀: backbone PaliGemma + experto de acciones con flow matching |
| Parametros totales | 4.028.019.472 (~4,03 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (el repositorio solo distribuye pesos en safetensors; no se ofrecen versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la política recibe una instrucción de tarea en inglés, "close the box", como entrada de texto) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,9 GB |
| Entrada de observacion | 3 camaras RGB 3x480x640 (superior, muñeca izquierda, muñeca derecha) + estado de 14 dimensiones |
| Salida | 14 dimensiones de accion (6 articulaciones por brazo + 2 pinzas) |
| Horizonte de accion | 50 acciones por llamada (1,7 s a 30 fps) |
| Libreria | LeRobot v0.6.0 o superior |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño π₀ descrito en el paper arXiv:2410.24164: un backbone de visión-lenguaje PaliGemma que procesa imágenes y la instrucción textual, acoplado a un experto de acciones que genera trayectorias mediante flow matching. El experto produce bloques de 50 acciones (action chunking), que se ejecutan completos en cada llamada de inferencia.

El entrenamiento se realizó desde cero sobre el dataset kiteml/dual-openyam-close-box (31 episodios, 33.247 fotogramas a 30 fps). Una diferencia clave respecto a otras políticas del conjunto es que el backbone PaliGemma se inicializó aleatoriamente y se mantuvo congelado, por lo que únicamente aprendió el experto de acciones sobre características visuales no preentrenadas. Se usaron 20.000 pasos con batch size 2, optimizador AdamW con learning rate 2,5e-5, decaimiento coseno con warmup, precisión bfloat16 y una única GPU NVIDIA A100 de 40 GB. La pérdida final de entrenamiento fue 0,145. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de acciones motoras bimanuales de 14 dimensiones para el robot OpenYAM (6 articulaciones por brazo más dos pinzas).
- Ejecución de la tarea específica de cerrar una caja, condicionada a la instrucción textual "close the box".
- Percepción visual multi-cámara: procesa tres flujos RGB simultáneos (cámara superior y una por muñeca).
- Predicción de bloques de acción (action chunking): 50 acciones por llamada, ejecutadas de forma secuencial a 30 fps.
- Integración con el ecosistema LeRobot: carga mediante el factoría de políticas y ejecución con las herramientas de línea de comandos `lerobot-record` y `lerobot-eval`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento (thinking). No es un modelo de lenguaje de propósito general.

## Casos de uso

- Reproducción de investigación en VLA: sirve para estudiar cómo se comporta un experto de acciones de flow matching sobre un backbone congelado e inicializado aleatoriamente, un escenario poco habitual en la literatura.
- Comparativa de arquitecturas sobre un mismo dataset: al existir versiones ACT, Diffusion Policy, π₀.₅, π₀-FAST, SmolVLA, VLA-JEPA y X-VLA entrenadas con los mismos 31 episodios, permite contrastar familias de políticas en igualdad de datos.
- Punto de partida para fine-tuning: los pesos del experto de acciones pueden reutilizarse como inicialización para nuevas tareas bimanuales del mismo robot OpenYAM.
- Automatización de cierre de cajas en líneas de empaquetado: la política está diseñada explícitamente para esta tarea, aunque no existen evaluaciones que confirmen su tasa de éxito en un entorno real.
- Prototipado de pipelines robóticos con LeRobot: útil para validar flujos de captura, preprocesado y ejecución de acciones con el framework antes de escalar a tareas más complejas.
- Docencia y formación en robótica: como ejemplo didáctico de entrenamiento de una política VLA con hardware modesto (una sola A100) y un dataset reducido.
- Generación de datos de referencia: las trayectorias que produce pueden usarse para comparar o aumentar datasets de manipulación bimanual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado ("Not evaluated yet") y que no se han puntuado rollouts ni en el robot real ni en simulación. El único dato numérico disponible es la pérdida final de entrenamiento (0,145), que corresponde al error de la función de flow matching sobre el conjunto de entrenamiento y no es una métrica de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada: con 4,03 mil millones de parámetros, los pesos en bfloat16 ocupan aproximadamente 8 GB. El repositorio completo pesa 8,9 GB. Habría que sumar el coste de las activaciones al procesar tres imágenes de 480x640.
- GPU de entrenamiento: se usó 1x NVIDIA A100 de 40 GB.
- GPU recomendadas para inferencia: A100, H100 o L40S. Con 8 GB de pesos en bfloat16, una RTX 4090 o RTX 3090 (24 GB) debería ser suficiente, y probablemente también tarjetas de 16 GB si se ajusta el uso de memoria.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en tarjetas de 24 GB y muy probablemente en modelos de 16 GB.
- Opciones de despliegue: LeRobot v0.6.0 o superior con PyTorch, mediante la API `select_action` o las herramientas `lerobot-record` y `lerobot-eval`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: cada llamada de inferencia predice 50 acciones, que a 30 fps equivalen a 1,7 s de ejecución en el robot. No se publican datos de latencia por llamada ni de throughput.

## Comparativa con modelos similares

Todos los modelos comparables son políticas entrenadas por el mismo autor sobre el mismo dataset (kiteml/dual-openyam-close-box) para el robot bimanual OpenYAM. No se dispone de sus recuentos de parámetros, licencias ni resultados de evaluación en la información proporcionada.

| Modelo | Autor | Familia de arquitectura | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀ (este modelo) | kiteml | VLA π₀ (PaliGemma + flow matching), backbone congelado aleatorio | kiteml/dual-openyam-close-box (31 episodios) | gemma | HuggingFace |
| ACT | kiteml | no disponible | kiteml/dual-openyam-close-box | no disponible | HuggingFace |
| Diffusion Policy | kiteml | no disponible | kiteml/dual-openyam-close-box | no disponible | HuggingFace |
| π₀.₅ | kiteml | no disponible | kiteml/dual-openyam-close-box | no disponible | HuggingFace |
| π₀-FAST | kiteml | no disponible | kiteml/dual-openyam-close-box | no disponible | HuggingFace |
| SmolVLA | kiteml | VLA | kiteml/dual-openyam-close-box | no disponible | HuggingFace |
| VLA-JEPA | kiteml | VLA | kiteml/dual-openyam-close-box | no disponible | HuggingFace |
| X-VLA | kiteml | VLA | kiteml/dual-openyam-close-box | no disponible | HuggingFace |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay rollouts puntuados ni en el robot real ni en simulación, por lo que se desconoce la tasa de éxito de la tarea.
- Backbone no preentrenado: el PaliGemma se inicializó aleatoriamente y se congeló, de modo que el experto de acciones aprende sobre características visuales sin semántica preentrenada. Esto limita seriamente la generalización frente a una π₀ estándar.
- Dataset muy reducido: 31 episodios y 33.247 fotogramas para una única tarea, con riesgo alto de sobreajuste (la pérdida final de entrenamiento de 0,145 no garantiza buen comportamiento en el robot).
- Tarea única y embodiment único: está especializado en "cerrar la caja" con un robot OpenYAM bimanual concreto; no es transferible a otras tareas ni a otras morfologías sin reentrenamiento.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea usada es en inglés.
- Licencia gemma: el uso está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones específicas (incluidas condiciones de uso comercial y de redistribución) que deben revisarse antes de cualquier despliegue en producción.
- Riesgo operativo en robótica: una política no validada ejecutando acciones físicas puede provocar colisiones, daños en el objeto o en el robot, o fallos silenciosos; requiere supervisión y protocolos de parada de seguridad.
- Sin datos de sesgo ni de robustez: no se ha analizado el comportamiento ante cambios de iluminación, oclusiones, posiciones iniciales distintas o variaciones del objeto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiteml/dual-openyam-close-box-pi0
- Dataset: https://huggingface.co/datasets/kiteml/dual-openyam-close-box
- Paper de la arquitectura π₀: https://huggingface.co/papers/2410.24164
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Plataforma Kite: https://kiteml.com
- Otras políticas del conjunto: https://huggingface.co/kiteml/dual-openyam-close-box-act, https://huggingface.co/kiteml/dual-openyam-close-box-diffusion, https://huggingface.co/kiteml/dual-openyam-close-box-pi05, https://huggingface.co/kiteml/dual-openyam-close-box-pi0_fast, https://huggingface.co/kiteml/dual-openyam-close-box-smolvla, https://huggingface.co/kiteml/dual-openyam-close-box-vla_jepa, https://huggingface.co/kiteml/dual-openyam-close-box-xvla
