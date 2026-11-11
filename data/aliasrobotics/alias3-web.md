# aliasrobotics/alias3-web

## Resumen

alias3-web es un transformer especializado en ciberseguridad, desarrollado por Alias Robotics, que se ejecuta íntegramente en el navegador mediante WebGPU. Forma parte del denominado Browser Immune System (BIS), una extensión de navegador que inspecciona cada página que visita el usuario sin que el contenido abandone nunca la máquina. El modelo se presenta como artefacto de investigación para reproducir el paper *Browser Immune System (BIS): Innate and Adaptive Threat Detection in the Browser with a Cybersecurity Transformer* (Mayoral-Vilches y Worrel, 2026), donde aparece bajo el nombre `alias-web`.

El modelo deriva por fine-tuning de `aliasrobotics/alias3-micro-1026` y se distribuye como grafo ONNX cuantizado a 4 bits (2.440.274.944 bytes de pesos) ejecutable con ONNX Runtime GenAI sobre WebGPU. Su rasgo diferenciador es una arquitectura de doble sistema sobre un único conjunto de pesos: un modo "System 1" que formula una pregunta dirigida y devuelve una probabilidad por opción en un solo paso forward (unos 152 ms en un portátil Apple M3 Max), y un modo "System 2" que genera explicaciones en lenguaje natural a 10,5 tokens/s.

La relevancia actual radica en su propuesta de privacidad por diseño: el material analizado (código, HTML, texto sospechoso) no sale del dispositivo, y el coste de la decisión rápida es entre 6 y 39 veces menor que el de una respuesta generada. Está pensado como componente de un sistema de detección de amenazas en el navegador (phishing, inyección de DOM, malware) más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de alias3-micro-1026) con cabeza de decisión tipo pointer sobre estados ocultos normalizados |
| Parametros totales | no disponible (pesos ONNX de 4 bits: 2.440.274.944 bytes; cabeza de decisión: 1,3 M parámetros fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (grafo ONNX para WebGPU) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`), cabeza en binario fp16 (`head.bin`, `norm.bin`) |

## Arquitectura y entrenamiento

alias3-web es un fine-tuning de `aliasrobotics/alias3-micro-1026` orientado a una tarea de decisión tipada. Sobre el transformer base se añade una cabeza de decisión ("pointer head") de 1,3 M parámetros que puntúa cada opción como `q(h_decide) · k(h_opt_i) / (sqrt(256) · T)` sobre los estados ocultos normalizados, aplicando después una softmax sobre las opciones. El grafo ONNX exporta los estados ocultos antes del RMSNorm final, por lo que el repositorio incluye `norm.bin` con el peso de esa normalización y la cabeza se aplica después de ella.

La interfaz es una secuencia causal única con marcadores construidos a partir de cinco tokens especiales del tokenizador base (`<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>`, `<|fim_suffix|>`), escritos por id y no como vocabulario nuevo. El texto aportado por el llamante se sanea (un `<|name|>` literal se convierte en `<¦name¦>`) para impedir que la evidencia falsifique un límite de opción. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el modelo se describe como artefacto de investigación para reproducir el paper citado.

## Capacidades

- Decisión tipada "System 1": una pregunta dirigida por forward pass, sin decodificar tokens, devolviendo una probabilidad por opción (por ejemplo, probabilidad de "sí" en preguntas de tipo `noul`).
- Modo `choice`: selección entre una lista de opciones proporcionada por el llamante, con devolución de la opción y la probabilidad superior.
- Modo `score`: puntuación de severidad en una escala de 1 a 5, con nivel y valor esperado.
- Generación de texto "System 2" bajo demanda: explicaciones en lenguaje natural a partir de la misma evidencia y los mismos pesos.
- Detección de phishing, inyección de DOM y otras clases de amenaza web mediante observaciones tipadas de la página.
- Clasificación de malware y análisis de fragmentos de código (el ejemplo de la model card detecta escritura de entrada de usuario en el DOM sin escapar).
- Ejecución local en navegador con WebGPU, sin envío de datos a servidores externos.
- Idioma: únicamente inglés.

## Casos de uso

- Extensión de navegador para cribado de páginas: el modelo responde una pregunta dirigida por clase de amenaza sobre las observaciones tipadas de cada página, con ~152 ms por pregunta, lo que permite evaluar cada visita sin bloquear la navegación.
- Detección de XSS en fragmentos de código: se envía el fragmento como `state` y una pregunta del tipo "¿se escribe entrada de usuario en el DOM sin escapar?", obteniendo una probabilidad de sí que puede umbralizarse en el cliente.
- Explicación de veredictos bajo demanda: cuando el System 1 marca una página como sospechosa, el System 2 genera una explicación de 2-3 frases para el usuario, aceptando el coste de ~96 ms por token solo en los casos que lo merecen.
- Clasificación de severidad de hallazgos: el modo `score` ordena incidentes en una escala de 1 a 5, útil para priorizar alertas en un panel de seguridad local.
- Asistente de revisión de código con privacidad: al ejecutarse en el navegador, permite analizar código propietario pegado por el usuario sin que salga de la máquina.
- Filtrado de phishing en el cliente: clasificación por categorías de amenaza sobre el contenido de la página, con la ventaja de que el HTML y el texto analizados nunca se transmiten a un tercero.
- Investigación reproducible: servir el modelo localmente con `serve.py` para replicar las mediciones del paper sobre hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente reporta mediciones de latencia y throughput en un Apple M3 Max (128 GB) con Chrome y WebGPU, con los pesos servidos desde un servidor local:

| Medición | Valor |
|---|---|
| Modelo listo, segunda carga en el mismo navegador | 2,33 s |
| System 1, por pregunta sobre fragmentos cortos de código | 152 ms de media de doce (110 a 200 ms) |
| Cabeza de decisión aislada | 1,18 ms |
| System 2 | 10,5 tokens/s (~96 ms por token) |
| Coste de una respuesta generada frente a una decisión sobre el mismo fragmento | 6 a 39 veces |

## Requisitos de hardware

- Inferencia en navegador con WebGPU; el ejemplo medido usa un Apple M3 Max con 128 GB de RAM, pero el consumo real de VRAM no se detalla en la información disponible.
- Pesos de 4 bits de 2,44 GB, por lo que la carga inicial lee 2,44 GB desde el servidor local y tarda unos segundos.
- GPU recomendadas: no disponible de forma explícita; se requiere un navegador con soporte WebGPU (Chrome o Edge según la model card).
- No se confirma compatibilidad con GPU de consumo concretas (RTX 4090, etc.) ni con A100/H100; el despliegue descrito es exclusivamente en navegador.
- Opciones de despliegue: ONNX Runtime GenAI sobre WebGPU, con ONNX Runtime Web 1.30.0 y Transformers.js 3.7.5 cargados desde CDN en la demo; servidor local `serve.py` con soporte de HTTP Range.
- Latencia y throughput: 152 ms por pregunta en System 1 y 10,5 tokens/s en System 2 sobre el hardware citado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de ciberseguridad, ni datos de benchmarks que permitan situar alias3-web frente a alternativas de tamaño o tarea comparable.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor advierte de que se publica para hacer reproducible el paper y que deben leerse las limitaciones antes de confiar en sus respuestas.
- El modo `choice` solo responde dentro de las categorías del entrenamiento de este checkpoint; fuera de ellas la respuesta no es fiable.
- El modo `score` ordena la severidad solo débilmente.
- Idioma limitado al inglés.
- Riesgo de alucinación en el modo System 2 (generación de texto), no cuantificado en la información disponible.
- Sesgos conocidos: no disponible.
- Longitud de contexto no especificada, lo que impide garantizar el comportamiento con evidencias largas.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías asociadas por tratarse de un artefacto de investigación.
- Dependencia de WebGPU y de navegadores compatibles (Chrome o Edge); la demo carga módulos de runtime desde una CDN pública.
- El texto del llamante se sanea para evitar falsificación de límites de opción, pero no se documentan otras defensas frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliasrobotics/alias3-web
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper citado: *Browser Immune System (BIS): Innate and Adaptive Threat Detection in the Browser with a Cybersecurity Transformer* (Mayoral-Vilches y Worrel, 2026), arXiv:2610.16550
- Motor de prefill ct0-edge (Eduardo Worrel, MIT): https://github.com/eduardoworrel/ct0-edge
