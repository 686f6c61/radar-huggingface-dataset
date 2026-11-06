# kareyoung09/connectailab-rl-kay09-allstar-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el autor kareyoung09 en el marco del proyecto CONNECT AI LAB x AI CITY BUILDERS. Su propósito declarado es actuar como un modelo de lenguaje ligero para la toma de decisiones de alto nivel en un robot bípedo denominado LINK-01, es decir, convertir observaciones del robot en acciones discretas de control. El repositorio se etiqueta con el pipeline `reinforcement-learning` y con tags de PPO, robótica y toma de decisiones, aunque la model card indica que el método finalmente empleado fue SFT (supervisión fina) y no aprendizaje por refuerzo.

El modelo se distribuye como un adaptador LoRA (librería `peft`, pesos en safetensors) que debe cargarse junto al modelo base Qwen/Qwen3.5-0.8B, por lo que su huella en disco es mínima (el repositorio ocupa 0.0 GB según la ficha de Hugging Face). El modelo base es un transformer de aproximadamente 0.8 mil millones de parámetros, lo que sitúa al conjunto en la categoría de modelos pequeños, adecuados para inferencia en hardware modesto o incluso en el borde.

La relevancia de esta ficha es más documental que práctica: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, y la propia model card declara una precisión de examen del 0.0 % y una tasa de éxito de conducción del 0.0 % en 20 episodios de prueba. Es, por tanto, un ejemplo de adaptador de robótica publicado sin resultados funcionales verificables, útil para entender el formato de entrega del proyecto LINK-01 pero no recomendable para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen/Qwen3.5-0.8B ronda los 0.8 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen, y se carga mediante `PeftModel.from_pretrained` junto al modelo base. La model card identifica como "mejor método" el SFT (supervised fine-tuning), pese a que los tags del repositorio incluyen `reinforcement-learning`, `deep-reinforcement-learning` y `ppo`. Esta discrepancia entre etiquetas y método declarado conviene tenerla en cuenta: no hay evidencia en la información disponible de que se haya aplicado PPO ni ningún otro algoritmo de RL.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El dominio declarado es la robótica bípeda: el modelo recibe observaciones del robot LINK-01 y emite decisiones de alto nivel. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y toma de decisiones de alto nivel en el dominio declarado de robótica bípeda (LINK-01).
- Formulación de acciones discretas a partir de observaciones del robot, según la descripción de la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según el campo `language: [ko]`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Rendimiento declarado: precisión de examen del 0.0 % y tasa de éxito de conducción del 0.0 % en 20 episodios, según la propia model card.

## Casos de uso

- Investigación sobre adaptadores LoRA en robótica: sirve como ejemplo reproducible de cómo empaquetar un adaptador PEFT sobre un modelo pequeño para tareas de control, aunque sus resultados declarados no permitan validar la aproximación.
- Prototipado de pipelines de decisión con modelos de lenguaje pequeños: el adaptador puede integrarse en un bucle de observación-acción para experimentar con la interfaz entre un LLM y un controlador robótico, siempre que se sustituya o reentrene el adaptador con datos válidos.
- Estudio de formato de entrega del proyecto LINK-01: útil para entender la estructura de repositorio, metadatos y convenciones de nomenclatura del proyecto CONNECT AI LAB x AI CITY BUILDERS.
- Evaluación comparativa de adaptadores sobre Qwen 0.8B: puede emplearse como línea base negativa en experimentos que midan la eficacia de técnicas de ajuste fino en dominios de robótica.
- Docencia y demostración de PEFT: el código de carga con `transformers` y `peft` es mínimo y sirve para ilustrar el flujo de trabajo con adaptadores LoRA en un modelo de menos de mil millones de parámetros.
- Despliegue en entornos de recursos limitados: al ser un adaptador sobre un modelo de 0.8B, el conjunto puede ejecutarse en CPU o en GPUs de gama baja, lo que facilita pruebas de integración sin infraestructura dedicada.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados declarados por el autor:

| Metrica | Valor |
|---|---|
| Precisión de examen (Accuracy) | 0.0 % |
| Tasa de éxito de conducción en 20 episodios (Drive Success) | 0.0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Para el modelo base Qwen/Qwen3.5-0.8B, en fp16 se estiman en torno a 1.6 GB de pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits podría situarse por debajo de 1 GB, aunque estos valores son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar el modelo base en fp16; no se dispone de recomendaciones oficiales.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del modelo base, aunque no hay confirmación oficial.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con estas herramientas no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en Qwen/Qwen3.5-0.8B, pero no se han publicado datos que permitan compararlo con otros adaptadores de robótica o con modelos de tamaño similar.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este adaptador) | Adaptador sobre Qwen 0.8B | No disponible | 0.0 % accuracy / 0.0 % drive success | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento declarado nulo: la propia model card indica 0.0 % de precisión y 0.0 % de éxito de conducción, por lo que el adaptador no demuestra capacidad funcional alguna en las tareas evaluadas.
- Discrepancia entre metadatos y método: los tags indican PPO y reinforcement learning, pero la model card declara SFT como mejor método; no hay evidencia de entrenamiento con RL.
- Idiomas: el modelo está etiquetado únicamente para coreano; su comportamiento en castellano u otros idiomas no está documentado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide evaluar su idoneidad para conversaciones o secuencias largas.
- Sesgos: no se han documentado sesgos conocidos, pero al derivar de un modelo base generalista y entrenarse en un dominio muy específico, es esperable un comportamiento frágil fuera de distribución.
- Riesgo de alucinación: no evaluado en la información disponible; en un modelo de 0.8B ajustado con SFT sobre robótica, el riesgo de generar acciones inválidas es alto.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Uso en producción: no recomendable sin un reentrenamiento y una evaluación exhaustiva previos.

## Enlaces

- Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-allstar-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
