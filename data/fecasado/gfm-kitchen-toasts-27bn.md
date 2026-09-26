# fecasado/gfm-kitchen-toasts-27bN

## Resumen

gfm-kitchen-toasts-27bN es una política de control robótico (no un modelo de lenguaje) publicada por el usuario fecasado en Hugging Face. Se distribuye a través de la librería LeRobot y está etiquetada con la técnica gaze_flow_matching, lo que indica que emplea flow matching condicionado por la mirada (gaze) para generar acciones de manipulación. El modelo está entrenado sobre el dataset fecasado/toasts-to-plate-320x240, una colección de demostraciones orientada a la tarea de cocina de tostar pan y colocarlo en un plato.

A pesar del sufijo "27bN" del nombre del repositorio, el recuento real de parámetros extraído de los archivos safetensors es de 75.228.826 parámetros (aproximadamente 75,2 millones), por lo que no se trata de un modelo de 27.000 millones. El tamaño total del repositorio es de 0,3 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada y muy específica: se trata de una política de imitación para un robot concreto y una tarea concreta, publicada el 26 de septiembre de 2026 según los metadatos, con 7 descargas y 0 "likes". No es un modelo de propósito general ni compite con los grandes modelos fundacionales de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política de imitación basada en flow matching condicionado por mirada, integrada en LeRobot) |
| Parametros totales | 75.228.826 (~75,2 millones), según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada es visual y propioceptiva) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle; únicamente identifica el modelo como `gaze_flow_matching` y lo asocia a la técnica de flow matching. Por el ecosistema en el que se publica (LeRobot) y la naturaleza de la tarea, se trata de una política de aprendizaje por imitación que, a partir de observaciones visuales, genera secuencias de acciones (chunks) para el robot. La componente "gaze" sugiere que la observación incluye o infiere información de la mirada del demostrador, condición adicional sobre la que se resuelve el flujo de generación de acciones.

No hay información disponible sobre el número de tokens o pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (técnicas propias de modelos de lenguaje y ajenas al pipeline de LeRobot aquí empleado). La model card parece ser una plantilla de LeRobot sin completar: incluye un bloque de entrenamiento de ejemplo que usa `--policy.type=act`, lo cual contradice el nombre gaze_flow_matching y sugiere que ese fragmento no describe fielmente este modelo concreto. El dataset de entrenamiento declarado es fecasado/toasts-to-plate-320x240, con imágenes de resolución 320x240.

## Capacidades

- Control robótico de manipulación por imitación: genera acciones motoras a partir de observaciones visuales del entorno.
- Ejecución de la tarea específica de cocina asociada al dataset toasts-to-plate (manejo de tostadas y su colocación en un plato).
- Condicionamiento por mirada (gaze) como señal adicional para la generación de trayectorias mediante flow matching.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión generalista.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingüe (la entrada no es textual).
- No se documentan modos especiales del tipo thinking, audio u otros.

## Casos de uso

- Automatización de la operación de tostado en cocina robotizada: la política puede reproducir la secuencia aprendida de tomar pan, tostarlo y depositarlo en un plato sobre el mismo montaje del dataset toasts-to-plate.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar flow matching condicionado por mirada dentro del ecosistema LeRobot.
- Evaluación comparativa de políticas de manipulación: al ser un checkpoint pequeño (75,2 M de parámetros) y ligero (0,3 GB), permite iterar rápidamente experimentos frente a otras políticas de LeRobot sobre la misma tarea.
- Base para fine-tuning en tareas de pick-and-place de objetos planos: la dinámica de manipulación de pan aprendida puede adaptarse a otros objetos similares con demostraciones adicionales.
- Despliegue en robótica de bajo coste o investigación en laboratorio: su reducido tamaño facilita la ejecución en hardware modesto (GPU de consumo o incluso CPU) sobre brazos tipo SO-100/SO-101 usados en LeRobot.
- Reproducción y validación de pipelines de entrenamiento/evaluación: sirve para verificar flujos `lerobot-train` y `lerobot-record` en entornos docentes o de desarrollo, dado que la model card documenta dichos comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los 75,2 M de parámetros ocupan aproximadamente 300 MB en FP32 y unos 150 MB en FP16/BF16; con activaciones y buffers de visión, un presupuesto de 1-2 GB de VRAM es holgado.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 3060, RTX 4060 o superior sobran; también es viable en GTX 1060 o integradas recientes. Para entrenamiento se recomienda al menos una GPU con 8-12 GB (RTX 3070/4070, A4000) por el coste de la carga del dataset de imágenes.
- Sí cabe en GPU de consumo: es un modelo pequeño que se ejecuta sin problema en GPU de gama media y baja.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para evaluación/inferencia), con `--policy.path` apuntando al checkpoint; también es habitual su uso en hardware embebido (Jetson) para robótica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-kitchen-toasts-27bN | Política de imitación (gaze flow matching) | ~75,2 M | Visual (320x240) + gaze | apache-2.0 | Hugging Face (LeRobot) |
| ACT (Action Chunking Transformer) | Política de imitación | no disponible | Visual | MIT (implementación LeRobot) | LeRobot / Hugging Face |
| Diffusion Policy | Política de imitación (difusión) | no disponible | Visual | MIT (implementación LeRobot) | LeRobot / Hugging Face |
| SmolVLA | Modelo fundacional visión-lenguaje-acción | ~450 M | Visual + lenguaje | Apache 2.0 | Hugging Face |

No se dispone de cifras de rendimiento comparables para gfm-kitchen-toasts-27bN; la comparación se limita a categoría, licencia y disponibilidad. Las cifras de los modelos alternativos se incluyen como referencia de categoría y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta análisis de sesgos.
- Riesgo de alucinación: no aplicable en el sentido de los modelos de lenguaje, pero existe riesgo de generalización deficiente y de fallos de ejecución fuera del dominio del dataset toasts-to-plate.
- Limitaciones de contexto o idioma: la política está ligada a una tarea y a un montaje concretos; no se documenta su transferencia a otras tareas, entornos o cámaras.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de licencia correspondientes.
- Caveats para producción: el modelo tiene 7 descargas y 0 "likes", lo que indica una validación pública muy escasa; la model card es una plantilla de LeRobot incompleta y el bloque de entrenamiento de ejemplo menciona `--policy.type=act`, en contradicción con gaze_flow_matching. El nombre del repositorio ("27bN") no refleja el número real de parámetros (~75,2 M), lo que puede inducir a error.
- No se documentan métricas de éxito de la tarea, por lo que no se recomienda su uso en producción sin una evaluación propia previa sobre el robot y el entorno objetivo.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/fecasado/gfm-kitchen-toasts-27bN
- Dataset de entrenamiento: fecasado/toasts-to-plate-320x240 (referenciado en los tags y en la model card)
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
