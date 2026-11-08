# MeituanRobotics/Meituan-Robotics-0

## Resumen

Meituan-Robotics-0 (MR0) es un modelo fundacional de tipo vision-language-action (VLA) desarrollado por el equipo de robótica de Meituan. Combina un backbone vision-language Qwen3.5-4B con una cabeza de acción MMDiT (Multi-Modal Diffusion Transformer) que genera acciones continuas de 20 dimensiones con un horizonte de 16 pasos. El modelo está diseñado como base de preentrenamiento para manipulación de escritorio y se distribuye como checkpoint completo listo para adaptación a distintos embodimentes robóticos.

El modelo resuelve el problema de conectar percepción visual, comprensión del lenguaje natural y generación de acciones motoras de bajo nivel en un único modelo entrenable de extremo a extremo. A diferencia de los VLA que emiten acciones discretizadas, MR0 produce acciones continuas mediante la cabeza MMDiT, lo que facilita el control preciso de manipuladores. Se apoya en el stack de entrenamiento y despliegue StarVLA y en el simulador RoboTwin.

La relevancia actual radica en que Meituan libera bajo licencia Apache 2.0 un VLA completo (20,5 GB de pesos en `checkpoints/model.pt`) con estadísticas de normalización por embodiment, configuración de entrenamiento y verificación SHA-256, lo que reduce la barrera para investigación en robótica de manipulación. El informe técnico asociado se titula "Meituan-Robotics-0: A Vision-Language-Action Foundation Model for Desktop Manipulation" (2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3.5-4B + cabeza de acción MMDiT (framework QwenMMDiT) |
| Parametros totales | no disponible (backbone de 4B según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `model.pt` en precisión nativa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el backbone Qwen3.5-4B es multilingüe, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoints/model.pt`), no safetensors ni GGUF |
| Dimensiones de acción | 20 |
| Horizonte de acción | 16 pasos |
| Tamaño del repositorio | 20,5 GB |
| Framework | QwenMMDiT (stack StarVLA) |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

MR0 sigue una arquitectura VLA de dos componentes. El backbone es Qwen3.5-4B, un transformer vision-language que procesa observaciones visuales e instrucciones en lenguaje natural y produce representaciones latentes. Sobre él se monta una cabeza de acción MMDiT, un transformer de difusión multimodal que genera vectores de acción continua de 20 dimensiones con un horizonte temporal de 16 pasos. El checkpoint `checkpoints/model.pt` contiene tanto el backbone Qwen3.5 completo como la cabeza MMDiT, de modo que la carga no requiere un fichero de pesos Qwen separado; el directorio `base_vlm/Qwen3.5-4B-Action/` solo aporta tokenizer, processor y configuración de arquitectura.

El modelo se presenta como un modelo de preentrenamiento de acción continua ("continuous-action pretraining"), orientado a manipulación de escritorio, y se apoya en el stack StarVLA para entrenamiento y despliegue, con agradecimientos a las comunidades Qwen, StarVLA, RoboTwin y RoboDojo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. El release incluye `dataset_statistics.json` con estadísticas de normalización por embodiment, lo que indica entrenamiento sobre datos de acción normalizados y la necesidad de seleccionar la clave de normalización correspondiente al robot de destino. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Percepción visual y comprensión de instrucciones en lenguaje natural mediante el backbone Qwen3.5-4B.
- Generación de acciones motoras continuas de 20 dimensiones con horizonte de 16 pasos para control de manipuladores.
- Preentrenamiento como modelo fundacional: sirve de punto de partida para fine-tuning en embodimentes y tareas robóticas concretas.
- Adaptación a distintos robots mediante selección de la clave de normalización adecuada en `dataset_statistics.json`.
- Integración con el stack StarVLA para entrenamiento y despliegue.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del VLA.
- Capacidades multilingües: no declaradas en la model card.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Manipulación de escritorio con brazos robóticos: MR0 genera acciones continuas de 20 dimensiones a partir de imágenes e instrucciones, adecuado para tareas de pick-and-place y ensamblaje en entornos de sobremesa.
- Fine-tuning para un robot concreto: partiendo del checkpoint preentrenado, se ajustan los datos del embodiment de destino y se selecciona la estadística de normalización correspondiente, reduciendo el coste frente a entrenar desde cero.
- Investigación en VLA: el release incluye configuración completa, estadísticas y checksums, lo que permite reproducir y comparar experimentos sobre el stack StarVLA.
- Evaluación en simulación con RoboTwin: el modelo se apoya en esta plataforma para validar políticas de manipulación antes del despliegue físico.
- Control de bimanipulación de precisión: la cabeza MMDiT con horizonte de 16 pasos permite planificar secuencias cortas de acción coherentes temporalmente.
- Desarrollo de pipelines de entrenamiento reproducible: `release.json` y `SHA256SUMS` permiten verificar la procedencia e integridad de los pesos en entornos de CI y reproducibilidad científica.
- Base para experimentos de destilación o cuantización: al ser un modelo de 4B de backbone más cabeza de difusión, sirve de referencia para estudiar el coste de compresión en VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 20,5 GB, lo que sugiere pesos en fp32 o bf16 con overhead; una estimación razonable para bf16 ronda los 8-10 GB solo para el backbone de 4B, más la cabeza MMDiT y los buffers de difusión, pero no hay cifra confirmada.
- GPU recomendadas: no disponible. Por tamaño del backbone, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) debería ser suficiente para inferencia en bf16, aunque no se documenta.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 24 GB como la RTX 4090, pero no confirmado por el autor.
- Opciones de despliegue: el loader oficial usa PyTorch (`baseframework.from_pretrained` con `model.eval().to("cuda")`) y el stack StarVLA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meituan-Robotics-0 | VLA (difusión de acciones) | Qwen3.5-4B + MMDiT | 20 dims, horizonte 16 | Apache 2.0 | Hugging Face, 20,5 GB |
| Xiaomi-Robotics-0 | VLA para control en tiempo real | no disponible | bimanipulación diestra | no disponible en la información consultada | open source según la fuente |
| StarVLA | Stack de entrenamiento/despliegue VLA | no aplica (framework) | no aplica | no disponible | GitHub |

La comparación con Xiaomi-Robotics-0 es limitada porque la información disponible no detalla parámetros, contexto ni licencia. StarVLA no es un modelo comparable sino el framework sobre el que se construye MR0.

## Limitaciones y advertencias

- Modelo de preentamiento orientado a manipulación de escritorio: no es un chatbot ni un modelo de propósito general; su salida son acciones motoras, no texto libre.
- Requiere seleccionar manualmente la clave de normalización correcta en `dataset_statistics.json`; una elección errónea degrada el control.
- No se documentan sesgos, tasas de alucinación ni evaluación de robustez; al ser un modelo de robótica, los fallos se traducen en acciones físicas incorrectas con riesgo material.
- Idiomas soportados no declarados; aunque el backbone Qwen3.5 es multilingüe, no hay garantía de comportamiento en instrucciones en castellano.
- Longitud de contexto no disponible, lo que impide planificar tareas de horizonte largo con garantías.
- Pesos en formato PyTorch (`model.pt`) y no en safetensors, con implicaciones de seguridad al cargar (pickle) y de interoperabilidad con herramientas estándar.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan patentes, restricciones de exportación ni condiciones adicionales del stack StarVLA o RoboTwin.
- Sin benchmarks publicados: no es posible comparar su rendimiento con alternativas antes de invertir en fine-tuning.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/MeituanRobotics/Meituan-Robotics-0
- Repositorio GitHub: https://github.com/Meituan-Robotics/Meituan-Robotics-0/tree/opensource/
- Guía de inicio: https://github.com/meituan/Meituan-Robotics-0/blob/main/GETTING_STARTED.md
- Commit de referencia del código: https://github.com/meituan/Meituan-Robotics-0/commit/88c667933dfc941a71c9b142eb84b716ac4f0707
- StarVLA: https://github.com/starVLA/starVLA
- RoboTwin: https://github.com/RoboTwin-Platform/RoboTwin
- Qwen: https://github.com/QwenLM
- Xiaomi-Robotics-0 (referencia comparativa): https://www.emergentmind.com/topics/xiaomi-robotics-0
