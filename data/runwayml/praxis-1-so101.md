# runwayml/praxis-1-so101

## Resumen

Praxis-1-SO101 es un modelo de política robótica (vision-language-action, VLA) desarrollado por RunwayML y publicado en Hugging Face bajo el identificador `runwayml/praxis-1-so101`. Se trata de un ajuste fino (fine-tuning) del modelo base `runwayml/praxis-1-base` orientado específicamente a los brazos robóticos de bajo coste SO-101 y SO-100 de la familia LeRobot, lo que lo sitúa en el ecosistema de robótica open source impulsado por Hugging Face. El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de cámara en secuencias de acciones motoras ejecutables sobre un robot real.

Con 27.202.334.408 parámetros (aproximadamente 27,2 mil millones) y un tamaño de repositorio de 54,4 GB en formato safetensors, el modelo emplea una arquitectura de difusión de vídeo combinada con *action chunking*, según indican sus etiquetas. Esto sugiere que genera predicciones de acciones en bloques temporales en lugar de paso a paso, lo que reduce la acumulación de errores y mejora la fluidez del control. La licencia Apache 2.0 es permisiva para uso comercial, aunque el acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face.

La relevancia actual del modelo radica en la combinación de un tamaño considerable (27B) con un enfoque de difusión para robótica, un área donde la mayoría de políticas open source son significativamente más pequeñas. No obstante, la información pública disponible es muy limitada: no se han publicado especificaciones detalladas de arquitectura, datos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con action chunking (según etiquetas; detalles no disponibles) |
| Parametros totales | 27.202.334.408 (≈27,2B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a robótica; las instrucciones en lenguaje natural dependen del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en `runwayml/praxis-1-base` y que emplea una arquitectura de difusión de vídeo (*video-diffusion*) junto con *action chunking*. La difusión de vídeo aplicada a robótica implica generar trayectorias de acción como si fueran fotogramas de un vídeo, lo que permite modelar dependencias temporales complejas y producir secuencias de acciones coherentes. El *action chunking* predice bloques de acciones de forma conjunta, una técnica habitual para mitigar el error compuesto en políticas de imitación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El ajuste fino está orientado específicamente a los robots SO-101 y SO-100 de LeRobot, lo que sugiere que los datos de entrenamiento incluyen demostraciones teleoperadas sobre estos brazos. Cualquier innovación técnica adicional (decodificación especulativa, atención lineal, etc.) no está documentada en la información proporcionada.

## Capacidades

- Generación de acciones motoras para brazos robóticos SO-101 y SO-100 a partir de observaciones visuales e instrucciones.
- Control robótico basado en *action chunking*: predicción de secuencias de acciones en bloques temporales.
- Procesamiento de instrucciones en lenguaje natural (heredado del modelo base, aunque los idiomas no están especificados).
- Integración con el ecosistema LeRobot para despliegue en robots de bajo coste.
- Modelado de dinámica temporal mediante difusión de vídeo, lo que permite generar trayectorias suaves y coherentes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión para observación del entorno; el resto no disponible.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de pick-and-place sobre un brazo SO-101, aprovechando el *action chunking* para generar trayectorias fluidas y reducir el error acumulado en tareas de varios segundos.
- Investigación en aprendizaje por imitación: sirve como política de referencia para comparar enfoques de difusión frente a políticas más pequeñas en entornos LeRobot, gracias a su tamaño de 27B y su licencia permisiva.
- Automatización de tareas domésticas simples: con un SO-100, el modelo puede abordar tareas como ordenar objetos o abrir cajones, usando la observación visual para adaptarse a variaciones en la posición de los objetos.
- Prototipado rápido en robótica educativa: al estar integrado en LeRobot y tener licencia Apache 2.0, centros de formación pueden desplegarlo en robots de bajo coste sin coste de licencia.
- Generación de datos sintéticos de trayectorias: la naturaleza de difusión del modelo permite muestrear múltiples trayectorias plausibles para una misma instrucción, útil para aumentación de datos en pipelines de entrenamiento.
- Evaluación de políticas VLA a gran escala: su tamaño lo convierte en un candidato para estudiar el escalado de políticas de difusión en robótica, comparando su rendimiento con modelos de menor tamaño sobre el mismo hardware.
- Despliegue en entornos de investigación con requisitos de licencia laxa: la licencia Apache 2.0 facilita su uso en proyectos comerciales o académicos sin restricciones de copyleft, siempre que se acepten las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,2B parámetros en safetensors (probablemente fp16/bf16, ~54 GB), se requiere al menos ~54 GB de VRAM para precisión completa. En cuantización de 8 bits, aproximadamente ~27 GB; en 4 bits, ~14 GB (estimaciones orientativas, no confirmadas para este modelo).
- GPU recomendadas: A100 80GB, H100 80GB para inferencia en precisión completa; RTX 4090 (24 GB) solo viable con cuantización agresiva (4 bits) y posiblemente con limitaciones.
- ¿Cabe en consumer GPU? En RTX 4090 con cuantización a 4 bits podría ser posible, aunque no hay confirmación oficial. En GPUs de 16 GB o menos, no es viable sin técnicas de offloading.
- Opciones de despliegue: no se especifican en la información disponible; la librería indicada es `praxis`, por lo que el despliegue probablemente requiera el stack de RunwayML o LeRobot. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI (estos están orientados a LLMs, no a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| runwayml/praxis-1-so101 | 27,2B | No disponible | Apache 2.0 | Difusión de vídeo + action chunking para SO-101/SO-100 | Gated en HF |
| Políticas LeRobot (p. ej. ACT, Diffusion Policy) | Típicamente <1B | No aplica | Apache 2.0 / MIT | Imitación supervisada / difusión | Abiertas en HF |
| OpenVLA | ~7B | No disponible | Apache 2.0 (con condiciones) | VLA transformer | Abierto en HF |
| π0 (Physical Intelligence) | No disponible | No disponible | No disponible | VLA con flow matching | No disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo, lo que puede retrasar su uso en pipelines automatizados.
- Información técnica muy limitada: no se documentan arquitectura exacta, datos de entrenamiento, contexto ni benchmarks, lo que dificulta evaluar su idoneidad frente a alternativas.
- Especialización estrecha: el ajuste está orientado a los brazos SO-101 y SO-100; su uso en otros robots requeriría un nuevo ajuste fino.
- Riesgo de alucinación motora: como política generativa, puede producir trayectorias no válidas o inseguras en entornos no vistos durante el entrenamiento; se recomienda supervisión humana y límites de seguridad físicos.
- Sesgos: no documentados, pero al entrenarse sobre demostraciones teleoperadas concretas, puede heredar sesgos de las condiciones de recogida de datos (iluminación, posiciones, objetos).
- Limitaciones de idioma: no se especifican los idiomas soportados para las instrucciones; probablemente dependa del modelo base.
- Licencia Apache 2.0: permisiva para uso comercial, pero debe verificarse que las condiciones de acceso gated no añadan restricciones adicionales.
- Requisitos de hardware elevados: 27,2B parámetros implican una VRAM considerable, lo que limita su despliegue en robots con hardware embebido de gama baja.

## Enlaces

- Hugging Face: https://huggingface.co/runwayml/praxis-1-so101
- Modelo base: https://huggingface.co/runwayml/praxis-1-base
- LeRobot (ecosistema de robótica): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
