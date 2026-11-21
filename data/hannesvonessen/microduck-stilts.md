# HannesVonEssen/microduck-stilts

## Resumen

microduck-stilts es una colección de ocho políticas de locomoción para el robot cuadrúpedo MicroDuck, cada una especializada en caminar hacia adelante sobre zancos (stilts) de una altura concreta, desde 10 cm hasta 2,0 m. El modelo lo publica HannesVonEssen dentro del proyecto microduck-playground, un entorno de simulación de robótica (mjlab) orientado al entrenamiento por refuerzo de políticas de locomoción. No es un modelo de lenguaje: es una política de control entrenada para un hardware específico, distribuida en formato ONNX lista para despliegue.

La relevancia de esta ficha es acotada pero técnica: muestra cómo se empaqueta una política de RL de robótica de extremo a extremo, con un grafo ONNX desplegable, un checkpoint de continuación (`checkpoint.pt`) y un `manifest.json` con metadatos por variante. Cada variante se entrenó con un número distinto de iteraciones (de 2.200 a 4.300), lo que indica un ajuste específico por altura y no una única política generalizada.

El repositorio ocupa 0,1 GB y acumula 751 descargas. La raíz incluye `policy.onnx`, `manifest.json` y `replay.mp4` como alias convenientes de la variante de 10 cm, que es la predeterminada. Las carpetas por altura (`10cm/`, `15cm/`, `20cm/`, `25cm/`, `50cm/`, `100cm/`, `140cm/` y la variante de 2,0 m) son los ficheros autoritativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por refuerzo para locomoción de robot cuadrúpedo (entorno mjlab); topología de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por observaciones de estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint PyTorch (`checkpoint.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal (capas, activaciones, tamaño de la observación o del espacio de acción). Lo que sí se documenta es el esquema de entrenamiento: ocho políticas independientes, cada una especializada en una altura de zanco concreta mediante un parámetro de mezcla (`blend-0.50`) aplicado al hardware de MicroDuck. Cada variante tiene su propio número de iteraciones de entrenamiento, creciente con la altura: 2.200 iteraciones para 10 cm, 2.400 para 15 cm, 2.600 para 20 cm, 2.800 para 25 cm, 3.400 para 50 cm, 4.000 para 1,0 m y 4.300 para 1,4 m. La variante de 2,0 m aparece en el texto descriptivo, pero los datos disponibles no detallan sus iteraciones ni sus ficheros.

No se especifica en la información proporcionada el número de tokens, el dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica destacable es el empaquetado por altura con artefactos reproducibles: grafo ONNX para inferencia, checkpoint para continuar el entrenamiento y un `manifest.json` por variante. También se incluyen ficheros STL de impresión 3D de los zancos (`direct_replacement_pair_b0p50_hXXp0cm.stl`), lo que permite reproducir el hardware físico junto con la política.

## Capacidades

- Locomoción hacia adelante sobre zancos para el robot MicroDuck, con una política dedicada por altura (10 cm, 15 cm, 20 cm, 25 cm, 50 cm, 1,0 m, 1,4 m y 2,0 m).
- Despliegue en inferencia mediante grafo ONNX (`policy.onnx`) por variante.
- Continuación del entrenamiento desde `checkpoint.pt` por variante.
- Metadatos de despliegue estructurados en `manifest.json` por variante.
- Reproducción visual del rollout completo mediante vídeos silenciosos de 10 segundos (`preview.mp4`), uno por altura.
- Reproducción física del hardware mediante modelos STL imprimibles en 3D para cada altura documentada.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento; no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con refuerzo: usar `checkpoint.pt` para reanudar el entrenamiento y estudiar cómo varía la política al cambiar la altura del zanco, comparando las iteraciones necesarias por variante (2.200 frente a 4.300).
- Despliegue en robot físico MicroDuck: cargar `policy.onnx` de la altura correspondiente en el runtime de inferencia del robot para obtener marcha hacia adelante estable.
- Fabricación del hardware: imprimir en 3D los STL incluidos (`direct_replacement_pair_b0p50_hXXp0cm.stl`) para montar los zancos de la altura objetivo y validar la política en el robot real.
- Evaluación comparativa de robustez por altura: ejecutar los ocho grafos ONNX sobre el mismo entorno mjlab y medir la degradación de la marcha al aumentar la altura del zanco.
- Integración en pipelines de simulación: usar los `manifest.json` para automatizar la selección de la variante correcta según la configuración de hardware en scripts de evaluación.
- Docencia y demostraciones: emplear los vídeos `preview.mp4` y los modelos STL para ilustrar el ciclo completo de entrenamiento por RL, empaquetado ONNX y validación física en robótica de bajo coste.
- Reentrenamiento con ajuste fino: partir de un checkpoint de una altura intermedia (por ejemplo, 50 cm) y adaptarlo a alturas no cubiertas por la colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de recompensa, tasa de éxito, velocidad de marcha ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control de tamaño reducido (repositorio de 0,1 GB que incluye pesos, checkpoints, vídeos y STL), la inferencia ONNX cabe holgadamente en cualquier GPU consumer; el dato exacto de VRAM no está documentado.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del artefacto, cualquier GPU con soporte ONNX Runtime es suficiente, incluidas RTX 4090 y RTX 3060.
- Compatibilidad con GPU consumer: sí, por el tamaño del repositorio (0,1 GB); no se confirma un requisito mínimo específico.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`); el entorno de entrenamiento y simulación es mjlab. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Alturas cubiertas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-stilts | Política RL de locomoción (MicroDuck) | 8 variantes, 10 cm a 2,0 m | ONNX + checkpoint PyTorch | Apache-2.0 | Hugging Face, 751 descargas |
| Otras políticas de MicroDuck del proyecto microduck-playground | Políticas RL del mismo robot | no disponible | no disponible | no disponible | Repositorio GitHub del proyecto |
| Políticas de locomoción de robots cuadrúpedos comerciales (por ejemplo, Unitree) | Políticas RL de locomoción | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estricta por altura: cada política funciona para una altura de zanco concreta; usar la variante equivocada puede provocar inestabilidad o caída.
- Ámbito limitado a marcha hacia adelante: la model card menciona únicamente políticas de avance; no se documentan giros, marcha atrás, terrenos irregulares ni recuperación de caídas.
- Dependencia del hardware: diseñado para el robot MicroDuck con zancos de mezcla `blend-0.50`; no es transferible a otros robots sin reentrenamiento.
- Sin métricas publicadas: no hay benchmarks de robustez, velocidad ni éxito de marcha, lo que dificulta estimar el rendimiento en producción.
- Datos de entrenamiento no documentados: se desconocen la composición del dataset, la distribución de condiciones simuladas y posibles sesgos de simulación (sim-to-real gap).
- Licencia Apache-2.0: permite uso comercial con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- No es un modelo de lenguaje: no dispone de capacidades de texto, visión, audio, tool calling ni agentes; cualquier uso en esos ámbitos queda fuera de su diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-stilts
- Vídeo de la variante de 10 cm: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/10cm/preview.mp4
- Vídeo de la variante de 15 cm: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/15cm/preview.mp4
- Vídeo de la variante de 20 cm: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/20cm/preview.mp4
- Vídeo de la variante de 25 cm: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/25cm/preview.mp4
- Vídeo de la variante de 50 cm: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/50cm/preview.mp4
- Vídeo de la variante de 1,0 m: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/100cm/preview.mp4
- Vídeo de la variante de 1,4 m: https://huggingface.co/HannesVonEssen/microduck-stilts/resolve/main/140cm/preview.mp4
- Repositorio microduck-playground: https://github.com/Vottivott/microduck-playground
- STL de zanco de 10 cm: https://github.com/Vottivott/microduck-playground/blob/c5fcc50219fef01ac9931d0079c583ccbb29b689/hardware/stilts/generated/release/direct_replacement_pair_b0p50_h10p0cm.stl
- STL de zanco de 50 cm: https://github.com/Vottivott/microduck-playground/blob/c5fcc50219fef01ac9931d0079c583ccbb29b689/hardware/stilts/generated/release/direct_replacement_pair_b0p50_h50p0cm.stl
- STL de zanco de 1,0 m: https://github.com/Vottivott/microduck-playground/blob/c5fcc50219fef01ac9931d0079c583ccbb29b689/hardware/stilts/generated/release/direct_replacement_pair_b0p50_h100p0cm.stl
