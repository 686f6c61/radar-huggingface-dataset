# Hallucinatie/2daction-stage2-checkpoint-60000

## Resumen

El modelo `Hallucinatie/2daction-stage2-checkpoint-60000` es un checkpoint de evaluación de una política neuronal denominada `NPCMTPPolicy`, desarrollada por el usuario Hallucinatie para el control de personajes no jugadores (NPC) en el juego Minetest. Se trata de un modelo de generación de video y predicción de acciones, entrenado en dos etapas; este checkpoint corresponde al paso 60.000 de la segunda etapa (equivalente a 30.000 pasos de gradiente debido a `grad_accumulation_steps=2`). El modelo combina un backbone de video, una rama específica para NPC y una cabeza de predicción de acciones, con un total de 555.797.900 parámetros. Su relevancia radica en ser un ejemplo de aplicación de aprendizaje por refuerzo o imitación en entornos de simulación 3D, orientado a la investigación en agentes autónomos y generación de comportamiento.

La publicación incluye únicamente los archivos de evaluación (pesos, EMA, configuración y código), omitiendo el estado del optimizador y el RNG. El paquete de datos fuente asociado se encuentra en el dataset `xixibuxixi/2daction-stage2`. No se especifican licencia, idiomas ni detalles adicionales de entrenamiento, por lo que esta ficha se basa exclusivamente en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NPCMTPPolicy (video backbone, rama NPC, cabeza de acción) |
| Parametros totales | 555.797.900 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, model_1.safetensors, ema.safetensors) |

## Arquitectura y entrenamiento

La arquitectura se describe como `NPCMTPPolicy`, compuesta por un backbone de video, una rama dedicada a NPC y una cabeza de acción. No se proporcionan detalles sobre el tipo de red (transformer, CNN, etc.) ni sobre el mecanismo de atención. El entrenamiento se realizó en dos etapas; este checkpoint pertenece a la continuación `stage2_npc_text_mtp-retrain-from-grad14000-20260825T022321Z`. Se sabe que el paso de entrenamiento es 60.000, con grad step 30.000 (debido a `grad_accumulation_steps=2`) y una tasa de aprendizaje de `1e-4`. El modelo tiene 454 tensores y 140 estados de optimizador (solo para los tensores entrenables de la rama NPC/acción). No se mencionan datos sobre el dataset de entrenamiento, número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

- Generación de video: el modelo puede generar secuencias de video, probablemente condicionadas a acciones o estados del entorno.
- Predicción de acciones: predice las acciones que un NPC debería tomar en el entorno de Minetest.
- Control de NPC: la política está diseñada para gobernar el comportamiento de personajes no jugadores en un entorno 3D.
- Soporte de EMA: se proporcionan pesos EMA para una evaluación más estable.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en IA para juegos: el modelo puede utilizarse para estudiar comportamientos emergentes de NPC en entornos de simulación como Minetest, permitiendo experimentar con políticas de control basadas en visión y acción.
- Generación de datos sintéticos de comportamiento: al predecir acciones y generar video, puede emplearse para crear datasets de entrenamiento para otros agentes o para aumentar la variedad de escenarios en simulaciones.
- Evaluación de políticas de aprendizaje por refuerzo: al ser un checkpoint de evaluación, sirve como referencia para comparar el rendimiento de otras políticas en tareas de control de NPC.
- Desarrollo de agentes autónomos en entornos 3D: la arquitectura de video backbone + acción puede adaptarse a otros dominios de robótica o simulación, aunque requeriría reentrenamiento.
- Análisis de representaciones visuales: el backbone de video podría extraerse como extractor de características para tareas de visión en entornos de juego.
- Benchmarking de infraestructura de inferencia: al tener un tamaño moderado (~556M parámetros), puede usarse para probar frameworks de despliegue en GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como precisión de acción, calidad de video generado, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 555,8M parámetros, en FP32 se necesitarían aproximadamente 2,2 GB solo para los pesos. En FP16, ~1,1 GB. Sin embargo, el repo ocupa 2,6 GB, lo que sugiere que incluye otros archivos (EMA, código, etc.). Para inferencia con batch pequeño, una GPU con 4-6 GB de VRAM sería suficiente, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Dado el tamaño, una GPU como RTX 3060 (12 GB) o superior sería adecuada, pero no se especifica.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado, pero no confirmado.
- Opciones de despliegue: no se mencionan. Al ser un modelo PyTorch, podría usarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, pero no hay soporte oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control de NPC en Minetest o generación de video condicionada a acciones). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo entrenado en un entorno específico (Minetest), puede no generalizar a otros dominios.
- Riesgo de alucinación: no aplica directamente, ya que no es un modelo de lenguaje; sin embargo, la generación de video podría producir secuencias irreales o inconsistentes.
- Limitaciones de contexto o idioma: no aplica, al no ser un modelo de texto.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto y se recomienda contactar al autor.
- Caveat para producción: es un checkpoint de investigación, no un producto final. No se incluyen scripts de inferencia completos ni documentación de despliegue. El código fuente está parcialmente disponible (solo la carpeta `code/`), y se requiere el paquete de datos externo para reproducir la evaluación.

## Enlaces

- [HuggingFace - Hallucinatie/2daction-stage2-checkpoint-60000](https://huggingface.co/Hallucinatie/2daction-stage2-checkpoint-60000)
- [Dataset fuente - xixibuxixi/2daction-stage2](https://huggingface.co/datasets/xixibuxixi/2daction-stage2)
- [Checkpoint anterior - Hallucinatie/2daction-stage2-checkpoint-14000](https://huggingface.co/Hallucinatie/2daction-stage2-checkpoint-14000)
