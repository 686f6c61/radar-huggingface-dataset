# Dingdust/Ornith-1.5-9B-heretic

## Resumen

Ornith-1.5-9B-heretic es una variante "desensurada" (decensored) del modelo Ornith-1.5-9B, creada por el usuario Dingdust mediante la herramienta Heretic v1.4.0. El modelo original, desarrollado por Ornith AI, es un modelo denso de 9B parámetros diseñado para despliegue eficiente en una sola GPU y en dispositivos edge, y forma parte de la familia Ornith-1.5, que introduce un bucle de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, construye scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo.

Esta versión "heretic" aplica la técnica de abliteración (abliteration) para eliminar los mecanismos de rechazo del modelo original, reduciendo drásticamente las negativas a responder (de 84/100 a 33/100) manteniendo una divergencia KL muy baja (0.0053) respecto al modelo base. El resultado es un modelo con las mismas capacidades técnicas que Ornith-1.5-9B pero sin filtros de seguridad, lo que lo hace relevante para investigación en alineación, estudios de seguridad y aplicaciones que requieren respuestas sin restricciones.

El modelo tiene 9.409.813.744 parámetros, está licenciado bajo MIT y se distribuye en formato safetensors. Su relevancia actual radica en que demuestra cómo la abliteración puede aplicarse a modelos de última generación con pérdida mínima de rendimiento, y plantea preguntas importantes sobre el equilibrio entre utilidad y seguridad en modelos open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 y Gemma4) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bf16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.5-9B-heretic es una modificacion del modelo Ornith-1.5-9B, que a su vez se construyo sobre Qwen3.5 y Gemma4 mediante continuacion de pretraining, mid-training y post-training. El modelo original de Ornith AI implementa un bucle de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje.

La variante "heretic" aplica la tecnica de abliteracion con Heretic v1.4.0, que consiste en identificar direcciones en el espacio de activaciones del modelo asociadas con el rechazo a responder y eliminarlas mediante ajustes en los pesos de las capas de atencion y MLP. Los parametros de abliteracion incluyen un direction_index de 17.12 y ajustes en attn.o_proj y mlp.down_proj con pesos maximos de 1.21 y 1.28 respectivamente. El resultado es un modelo que mantiene una divergencia KL de 0.0053 respecto al original, indicando que las capacidades generales se conservan casi intactas.

Los datos de entrenamiento especificos (numero de tokens, composicion del dataset, hiperparametros de RL) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto sin restricciones: el modelo responde a practicamente cualquier solicitud, incluyendo aquellas que el modelo original rechazaria (33/100 rechazos frente a 84/100 del original).
- Razonamiento y resolucion de problemas: hereda las capacidades de Ornith-1.5-9B, que obtiene 86.4 en GPQA Diamond y 70.6 en SWE-bench Verified.
- Generacion de codigo y tareas de terminal: el modelo alcanza 46.2 en Terminal-Bench 2.1 (Terminus-2) y 47 con Claude Code, superando a Qwen3.5-9B (21.3 y 18.9 respectivamente).
- Auto-mejora: al estar basado en Ornith-1.5, el modelo puede generar sus propias tareas de entrenamiento y scaffolds, aunque esta capacidad no se ha verificado en esta variante especifica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no especificado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no especificado explicitamente, aunque los resultados en Terminal-Bench sugieren capacidades de agente.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo permite estudiar como la abliteracion afecta al comportamiento de un modelo de ultima generacion, comparando respuestas con y sin filtros de seguridad. Los investigadores pueden analizar la divergencia KL y los cambios en los patrones de rechazo.
- Generacion de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para explorar temas controvertidos o generar narrativas que otros modelos rechazarian por politicas de seguridad, manteniendo la calidad de un modelo de 9B.
- Desarrollo de agentes de terminal: gracias a su rendimiento en Terminal-Bench 2.1 (46.2), el modelo puede integrarse en pipelines de automatizacion de tareas de terminal, aunque habria que evaluar si la abliteracion afecta a la fiabilidad en entornos de produccion.
- Benchmarking de tecnicas de desalineacion: equipos de seguridad pueden usar este modelo como caso de estudio para desarrollar contramedidas contra la abliteracion y tecnicas similares de eliminacion de salvaguardas.
- Educacion sobre riesgos de IA open source: el modelo sirve como ejemplo practico de como un usuario con acceso a herramientas como Heretic puede modificar un modelo con licencia permisiva, lo que es relevante para debates sobre gobernanza de IA.
- Desarrollo de aplicaciones de rol o ficcion interactiva: la ausencia de rechazos permite crear personajes o escenarios que otros modelos evitariam, aunque el usuario debe asumir la responsabilidad del contenido generado.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes datos comparativos entre esta variante y el modelo original:

| Metrica | Ornith-1.5-9B-heretic | Ornith-1.5-9B (original) |
| :------ | :--------------------: | :----------------------: |
| **Divergencia KL** | 0.0053 | 0 *(por definicion)* |
| **Rechazos** | 33/100 | 84/100 |

Los benchmarks del modelo base Ornith-1.5-9B (publicados por Ornith AI) son:

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
| :-------- | :------------: | :-----------: | :--------: | :-------------: | :---------: |
| **Terminal-Bench 2.1 (Terminus-2)** | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| **Terminal-Bench 2.1 (Claude Code)** | 47 | 40.6 | 18.9 | 49.2 | - |
| **SWE-bench Verified** | 70.6 | 69.4 | 53.2 | 73.4 | 52 |
| **GPQA Diamond** | 86.4 | - | - | - | - |

No se han publicado benchmarks especificos para la variante "heretic" mas alla de la divergencia KL y la tasa de rechazos.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 19 GB en bf16, por lo que requiere al menos 20-24 GB de VRAM para inferencia en precision completa.
- GPU recomendadas: una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090) es suficiente para inferencia en bf16. Para servir con margen, se recomienda una GPU de 32 GB o superior (A100 40GB, A6000).
- En consumer GPU: si, cabe en RTX 3090/4090 (24 GB) con cuantizacion a 8 bits o 4 bits, aunque no se proporcionan cuantizaciones oficiales en el repo.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). El repo de Ornith-1.5-9B-MLX sugiere que tambien hay soporte para MLX en Apple Silicon.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | GPQA Diamond | Licencia |
| :----- | :--------: | :------: | :----------------: | :----------: | :------: |
| **Ornith-1.5-9B-heretic** | 9,4B | No disponible | 70.6 (modelo base) | 86.4 (modelo base) | MIT |
| **Ornith-1.5-9B** | 9,4B | No disponible | 70.6 | 86.4 | MIT |
| **Qwen3.5-9B** | 9B | No disponible | 53.2 | - | No disponible |
| **Qwen3.6-35B-A3B** | 35B (MoE, 3B activos) | No disponible | 73.4 | - | No disponible |

La comparativa muestra que Ornith-1.5-9B supera claramente a Qwen3.5-9B en tareas de codigo y se acerca a modelos mucho mayores como Qwen3.6-35B-A3B. La variante "heretic" mantiene estas capacidades con una divergencia minima respecto al original.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo ha sido modificado deliberadamente para eliminar mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo, peligroso o ilegal. El uso en produccion o en aplicaciones publicas conlleva riesgos legales y eticos significativos.
- Sesgos no mitigados: la abliteracion no elimina los sesgos del modelo base; de hecho, al eliminar los rechazos, los sesgos pueden manifestarse con mayor libertad.
- Riesgo de alucinacion: no se ha evaluado si la abliteracion afecta a la tasa de alucinaciones, pero es probable que se mantenga o aumente ligeramente al no haber restricciones de seguridad.
- Datos de entrenamiento no disponibles: no se especifica la composicion del dataset, el numero de tokens ni los detalles del proceso de RL, lo que limita la evaluacion de riesgos.
- Sin garantias de rendimiento: los benchmarks del modelo base no garantizan el mismo rendimiento en la variante "heretic", aunque la baja divergencia KL sugiere que las diferencias son minimas.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad legal y etica del contenido generado.
- Sin soporte oficial: esta variante es un experimento de un tercero, no un lanzamiento oficial de Ornith AI, por lo que no hay garantias de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dingdust/Ornith-1.5-9B-heretic
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web de Ornith AI: https://ornith.ai/
- Version MLX de Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Proyecto Heretic: https://heretic-project.org
