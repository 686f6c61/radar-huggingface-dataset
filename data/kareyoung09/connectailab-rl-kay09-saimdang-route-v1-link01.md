# kareyoung09/connectailab-rl-kay09-saimdang-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el autor kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. El modelo está diseñado para la toma de decisiones de alto nivel en un robot bípedo (LINK-01), concretamente para la tarea de seguimiento de ruta (`follow_route`). A partir de las observaciones del robot, el modelo selecciona la acción de alto nivel que debe ejecutar el sistema de control.

Se trata de un adaptador de bajo rango (PEFT) que no redistribuye pesos completos, sino un delta entrenado sobre un transformer de 0,8 mil millones de parámetros. El pipeline declarado es `reinforcement-learning`, aunque la model card indica que el mejor método obtenido fue SFT (supervised fine-tuning), con una tasa de acierto del 81,6 % en el conjunto de evaluación y un 100 % de éxito en 20 episodios de conducción real. La relevancia del modelo reside en su naturaleza ligera y especializada: demuestra que un modelo de 0,8B con un adaptador puede resolver una política de decisión concreta en robótica sin necesidad de infraestructura de inferencia pesada.

El modelo está orientado exclusivamente al idioma coreano (`ko`) y su licencia es Apache 2.0. El repositorio tiene un tamaño de 0,0 GB, coherente con un adaptador LoRA de pequeñas dimensiones. No se dispone de información sobre la arquitectura interna del adaptador (rango, módulos objetivo) ni sobre el proceso de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); pesos base en el repositorio de Qwen |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. No se especifica en la información disponible el rango del adaptador, los módulos a los que se aplica ni la configuración de entrenamiento (learning rate, épocas, tamaño de batch). El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen `ppo` y `deep-reinforcement-learning`, pero la model card indica que el mejor método fue SFT, lo que sugiere una posible discrepancia entre el pipeline declarado y el método finalmente empleado.

El entrenamiento se orienta a una tarea de decisión de alto nivel: dado un conjunto de observaciones del robot bípedo LINK-01, el modelo debe emitir la acción correspondiente a la tarea `follow_route`. La model card reporta una precisión del 81,6 % en el conjunto de prueba y un 100 % de éxito en 20 episodios de conducción real. No se detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo fases de RLHF o DPO adicionales. El modelo está asociado a la persona `sinsaimdang` y al proyecto LINK-01 de CONNECT AI LAB.

## Capacidades

- Toma de decisiones de alto nivel para robótica: selecciona acciones a partir de observaciones del robot bípedo LINK-01.
- Seguimiento de ruta (`follow_route`): tarea específica para la que fue entrenado.
- Comprensión de instrucciones y observaciones en coreano.
- Formato de adaptador PEFT: se carga sobre el modelo base mediante `PeftModel.from_pretrained`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües más allá del coreano.

## Casos de uso

- Control de navegación de robots bípedos: el modelo recibe las observaciones del robot y emite la acción de alto nivel para seguir una ruta predefinida, integrándose en el bucle de control del sistema LINK-01.
- Prototipado de políticas de decisión en robótica: al ser un adaptador de 0,8B, permite iterar rápidamente sobre la política de decisión sin reentrenar un modelo completo.
- Investigación en RL aplicado a robótica: sirve como punto de partida para experimentos de SFT y PPO sobre tareas de navegación, dado que la model card reporta ambos enfoques.
- Evaluación de modelos ligeros en entornos embebidos: su tamaño reducido permite desplegarlo en hardware de borde cercano al robot, reduciendo la dependencia de la nube.
- Docencia y reproducción de experimentos: el código de carga con `transformers` y `peft` es mínimo y facilita la reproducción en laboratorios académicos.
- Base para adaptadores específicos de tarea: el mismo modelo base Qwen3.5-0.8B puede recibir otros adaptadores LoRA para tareas distintas dentro del mismo robot, reutilizando la infraestructura de inferencia.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión en el conjunto de prueba (Accuracy) | 81,6 % |
| Tasa de éxito en 20 episodios de conducción real (Drive Success) | 100,0 % |
| Método de entrenamiento con mejor resultado | SFT |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el modelo base de 0,8B en FP16 requiere aproximadamente 1,6 GB de VRAM, a lo que se suma el adaptador LoRA (tamaño no especificado).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base en FP16; una RTX 3060 o superior es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del modelo base.
- Opciones de despliegue: `transformers` + `peft` (según la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | No disponible | Apache 2.0 | Decisión robótica (follow_route) |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | No disponible en la información | Modelo base generalista |
| Otros adaptadores LoRA sobre Qwen3.5-0.8B | 0,8B (base) + LoRA | No disponible | Variable | Tareas específicas |

No se dispone de información sobre modelos comparables de la misma categoría (políticas de decisión para robótica basadas en LLM) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `follow_route` en el robot LINK-01; su uso fuera de ese contexto no está validado.
- El idioma soportado es únicamente coreano; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La tasa de éxito del 100 % se basa en solo 20 episodios de conducción real, una muestra pequeña que no permite generalizar a entornos diversos.
- No se documentan sesgos conocidos, pero al ser un modelo especializado en robótica, los sesgos relevantes serían los derivados de la distribución del dataset de entrenamiento, no disponible.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de decisión, una acción incorrecta podría tener consecuencias físicas en el robot.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El pipeline declarado (`reinforcement-learning`) no coincide con el método reportado como mejor (SFT), lo que introduce incertidumbre sobre el proceso real de entrenamiento.
- No se especifican los requisitos de contexto ni el formato exacto de las observaciones de entrada, lo que dificulta la integración en producción.

## Enlaces

- [HuggingFace: kareyoung09/connectailab-rl-kay09-saimdang-route-v1-link01](https://huggingface.co/kareyoung09/connectailab-rl-kay09-saimdang-route-v1-link01)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [PEFT (Parameter-Efficient Fine-Tuning)](https://github.com/huggingface/peft)
- [Transformers](https://github.com/huggingface/transformers)
