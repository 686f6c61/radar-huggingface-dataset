# black-forest-labs/flux-3-action-so101

## Resumen

FLUX-3 Action SO101 es un modelo de acción- mundo (world-action model) desarrollado por Black Forest Labs, el mismo equipo detrás de la familia de modelos de generación de imágenes FLUX. A diferencia de sus predecesores orientados a síntesis visual, este modelo está especializado en robótica: aprende a predecir acciones motoras a partir de observaciones visuales, actuando como política de control para el brazo robótico SO-101. Se distribuye como un fine-tune del modelo base `flux-3-action-base` y se integra en el ecosistema LeRobot de Hugging Face.

El modelo cuenta con aproximadamente 6.950 millones de parámetros (6,947.071.232 según los pesos en safetensors) y un repositorio de 13,9 GB. Está etiquetado como `world-action-model`, lo que sugiere que combina un modelo de mundo (predicción del estado futuro del entorno) con una política de acción, una arquitectura emergente en el aprendizaje robótico que busca mejorar la generalización y la planificación a partir de datos de vídeo.

Su relevancia radica en que traslada la experiencia de Black Forest Labs en modelos generativos de gran escala al dominio de la manipulación robótica, ofreciendo un checkpoint listo para usar sobre un robot de bajo coste (SO-101) y con integración directa en LeRobot. El acceso es restringido (gated) y requiere aceptar la licencia comunitaria de FLUX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model basado en FLUX-3; detalles internos no publicados) |
| Parametros totales | 6.947.071.232 (~6,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | flux-kommunity-license (licencia comunitaria de FLUX; acceso restringido) |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna en la información disponible. El modelo se presenta como un `world-action-model`, una categoría que en la literatura reciente combina un modelo de mundo (que aprende la dinámica del entorno a partir de observaciones) con una política que genera acciones. Dado que deriva de `flux-3-action-base`, es plausible que herede componentes del transformer de difusión de FLUX-3 adaptados a la predicción de acciones, pero esta afirmación no está confirmada por la documentación proporcionada.

El checkpoint es un fine-tune del modelo base sobre el dataset `lerobot/community_dataset_v3`, orientado específicamente al robot SO-101. No se dispone de información sobre el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para el brazo SO-101 a partir de observaciones visuales.
- Modelado de mundo: etiquetado como world model, lo que implica capacidad de representar la dinámica del entorno para apoyar la predicción de acciones.
- Aprendizaje por imitación: entrenado sobre un dataset comunitario de LeRobot, adecuado para políticas de imitación.
- Integración con LeRobot: compatible con el pipeline `robotics` y la librería LeRobot de Hugging Face.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Manipulación robótica con SO-101: el modelo actúa como política de control directa sobre el brazo de bajo coste SO-101, permitiendo tareas de pick-and-place y manipulación básica a partir de demostraciones.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar políticas entrenadas sobre el dataset comunitario `lerobot/community_dataset_v3`.
- Prototipado de world-action models: útil para estudiar cómo un modelo de mundo derivado de un generador de imágenes de gran escala se comporta en control motor.
- Fine-tuning sobre datos propios: al ser un fine-tune del modelo base, puede adaptarse a nuevos datasets de LeRobot para tareas específicas de manipulación.
- Educación y robótica de bajo coste: el SO-101 es un robot accesible, y este modelo facilita experimentos de aprendizaje robótico en entornos con recursos limitados.
- Evaluación de generalización visual-motora: permite medir la transferencia de modelos generativos visuales a la predicción de acciones en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~6,95 mil millones de parámetros, en FP16 se requieren aproximadamente 14 GB de VRAM solo para pesos; en FP32, unos 28 GB. No se documentan variantes cuantizadas.
- GPU recomendadas: no disponible de forma oficial. Por tamaño, una RTX 4090 (24 GB) podría alojar los pesos en FP16; A100 o H100 son adecuadas para mayor margen y throughput.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 16-24 GB en FP16, aunque no está confirmado por el autor.
- Opciones de despliegue: LeRobot (librería oficial del modelo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FLUX-3 Action SO101 | ~6,95 B | no disponible | flux-kommunity-license | Gated en HF | Fine-tune para SO-101 |
| FLUX-3 Action Base | no disponible | no disponible | flux-kommunity-license | HF (base) | Modelo base del que deriva |
| Alternativas de políticas robóticas (p. ej. RT-2, OpenVLA) | no disponible en esta ficha | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia comunitaria en Hugging Face antes de descargar el modelo.
- Licencia `flux-kommunity-license`: no es una licencia open source estándar; es necesario revisar sus términos para uso comercial y redistribución.
- Especialización estrecha: el modelo está entrenado para el robot SO-101 y el dataset comunitario; su rendimiento fuera de ese dominio no está garantizado.
- Sin datos de benchmarks: no hay métricas publicadas de éxito en tareas, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de sobreajuste al dataset: al ser un fine-tune sobre un dataset comunitario concreto, puede generalizar mal a entornos, iluminación o tareas distintas.
- Documentación escasa: no se detallan sesgos, limitaciones de contexto ni caveats de producción.
- No apto para tareas de texto o visión general: sus capacidades se limitan al control robótico.

## Enlaces

- Hugging Face: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/community_dataset_v3
- LeRobot (librería): https://github.com/huggingface/lerobot
- Black Forest Labs: https://blackforestlabs.ai
