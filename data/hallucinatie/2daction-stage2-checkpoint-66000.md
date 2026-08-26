# Hallucinatie/2daction-stage2-checkpoint-66000

## Resumen

El modelo `Hallucinatie/2daction-stage2-checkpoint-66000` es un checkpoint de evaluación pública de la segunda etapa de entrenamiento de `NPCMTPPolicy`, una política neuronal para el control de NPCs en el juego Minetest. Desarrollado por el usuario Hallucinatie, este modelo forma parte de un proyecto de generación de vídeo y predicción de acciones en entornos 2D basados en voxels. El checkpoint corresponde al paso 66.000 de entrenamiento (equivalente a 33.000 pasos de gradiente debido a `grad_accumulation_steps=2`) y se publica únicamente con los ficheros de evaluación, omitiendo estados de optimizador y RNG.

El modelo está diseñado para ser integrado con el paquete de datos `xixibuxixi/2daction-stage2` y utiliza una arquitectura que combina un backbone de vídeo, una rama NPC y una cabeza de acción. Con 555,8 millones de parámetros, este checkpoint representa un avance en el desarrollo de agentes autónomos capaces de interpretar y actuar en entornos simulados tipo Minetest, un campo relevante para la investigación en IA encarnada y aprendizaje por refuerzo en mundos virtuales.

La relevancia actual de este modelo radica en su enfoque en la predicción de acciones a partir de observaciones visuales, una capacidad clave para sistemas de IA que deben operar en tiempo real en entornos dinámicos. Su publicación como bundle de evaluación permite reproducir resultados y comparar arquitecturas, aunque la documentación disponible es limitada y no incluye métricas de rendimiento estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NPCMTPPolicy (backbone de vídeo + rama NPC + cabeza de acción) |
| Parametros totales | 555.797.900 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, model_1.safetensors, ema.safetensors) |

## Arquitectura y entrenamiento

La arquitectura `NPCMTPPolicy` se compone de tres módulos principales: un backbone de vídeo que procesa secuencias de observaciones visuales, una rama NPC que modela el estado del agente y una cabeza de acción que produce las decisiones de control. El modelo utiliza un embedding de clases de voxel (almacenado en `model_1.safetensors`) para representar el entorno. El checkpoint incluye también un fichero `ema.safetensors` con medias móviles exponenciales de los 140 tensores entrenables de la rama NPC y la cabeza de acción, recomendado para evaluación.

El entrenamiento se realizó en dos etapas, siendo este el checkpoint final de la segunda etapa. La continuación del entrenamiento se identifica como `stage2_npc_text_mtp-retrain-from-grad14000-20260825T022321Z`, con una tasa de aprendizaje de `1e-4` y acumulación de gradientes de 2 pasos. El modelo se cargó correctamente con 454 tensores de modelo y 140 estados de optimizador. No se especifican datos sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO. La arquitectura está diseñada para ser compatible con caché KV, lo que sugiere un uso eficiente en inferencia secuencial.

## Capacidades

- Generación de acciones de control para NPCs en entornos tipo Minetest a partir de observaciones de vídeo.
- Predicción de acciones multi-paso con un horizonte de 8 pasos (`horizons=8`) y 4 bloques NPC (`num_npc_blocks=4`).
- Procesamiento de secuencias de vídeo mediante backbone especializado.
- Representación del entorno mediante embeddings de clases de voxel.
- Soporte de evaluación con EMA (media móvil exponencial) para mayor estabilidad.
- Integración con el paquete de datos `xixibuxixi/2daction-stage2` para reproducibilidad.
- Capacidad de carga estricta de pesos con verificación de checksums (SHA256).
- No se documentan capacidades de lenguaje natural, tool calling, agentes conversacionales ni visión general fuera del dominio de Minetest.

## Casos de uso

- Investigación en IA encarnada: el modelo puede utilizarse para estudiar cómo los agentes aprenden a navegar y actuar en entornos simulados voxelizados, comparando políticas entrenadas con diferentes configuraciones.
- Desarrollo de NPCs autónomos en Minetest: permite implementar comportamientos no jugadores que reaccionan a estímulos visuales en tiempo real, mejorando la inmersión en servidores de juego.
- Benchmarking de arquitecturas de predicción de acciones: al ser un checkpoint público con código de carga, sirve como referencia para evaluar nuevas arquitecturas de políticas en tareas de control visual.
- Reproducción de experimentos de aprendizaje por refuerzo: el bundle de evaluación permite replicar los resultados del entrenamiento y verificar la correcta implementación de la política.
- Generación de vídeo condicionada a acciones: aunque no se detalla, la combinación de backbone de vídeo y cabeza de acción sugiere aplicaciones en síntesis de vídeo guiada por decisiones del agente.
- Formación en ingeniería de modelos de IA: el código y la estructura de pesos pueden utilizarse como ejemplo didáctico de cómo organizar checkpoints complejos con múltiples componentes (modelo, EMA, embeddings).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas estándar como MMLU, HumanEval o GSM8K, y no se proporcionan comparaciones con otros modelos en la documentación del checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 555,8 millones de parámetros en precisión float32, el modelo requiere aproximadamente 2,2 GB solo para los pesos (555,8M × 4 bytes), más memoria para activaciones y caché KV. Con cuantización a 8 bits podría reducirse a ~0,6 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: no se especifican. Una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior) sería necesaria para inferencia en float32 con secuencias de vídeo moderadas.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado, pero depende de la resolución y longitud de las secuencias de vídeo.
- Opciones de despliegue: el modelo se carga mediante el script `load_weights.py` en PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de las secuencias de vídeo procesadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control para entornos voxelizados). El campo de IA encarnada en Minetest es nicho y no se han encontrado alternativas públicas con especificaciones similares en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al entrenarse en entornos de Minetest, el modelo puede no generalizar a otros dominios visuales.
- Riesgo de alucinación: al ser un modelo de predicción de acciones, puede generar acciones no válidas o inconsistentes con el estado del entorno si las observaciones están fuera de distribución.
- Limitaciones de contexto: la ventana de contexto se limita a secuencias de vídeo de 8 pasos (`horizons=8`), lo que restringe la planificación a corto plazo.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto y requiere contacto con el autor.
- Caveat de producción: el checkpoint es solo para evaluación; no incluye estados de optimizador ni RNG, por lo que no es adecuado para continuar entrenamiento sin el paquete de datos original.
- Dependencia de paquetes externos: requiere el dataset `xixibuxixi/2daction-stage2` y los ficheros de código del repositorio original para funcionar correctamente.
- Verificación de integridad: es imprescindible comprobar los checksums SHA256 antes de usar los pesos para evitar corrupción de datos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hallucinatie/2daction-stage2-checkpoint-66000
- Paquete de datos fuente: https://huggingface.co/datasets/xixibuxixi/2daction-stage2
- Búsqueda de modelos con tag 2daction: https://huggingface.co/models?other=2daction
