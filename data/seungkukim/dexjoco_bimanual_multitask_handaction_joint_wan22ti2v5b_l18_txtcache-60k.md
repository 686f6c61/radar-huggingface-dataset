# seungkukim/dexjoco_bimanual_multitask_handaction_joint_wan22ti2v5b_L18_txtcache-60k

## Resumen

El modelo `dexjoco_bimanual_multitask_handaction_joint_wan22ti2v5b_L18_txtcache-60k` es un checkpoint de tipo DiT4DiT (Diffusion Transformer for Diffusion Transformer) desarrollado por seungkukim para el control de robots bimanuales. Combina un backbone de video Wan2.2-TI2V-5B (finetuneado) con una cabeza de acción DiT-B que incluye un stream de geometría de manos de 66 dimensiones. Está entrenado sobre el dataset DexJoCo bimanual multitask (`seungkukim/dexjoco_lerobot_v20`) y utiliza embeddings de texto umT5 cacheados (txtcache) con extracción de características en la capa 18.

El modelo resuelve el problema de generar acciones de manipulación bimanual (posición y orientación de muñecas, y articulaciones de dedos) a partir de observaciones de video y posiblemente instrucciones textuales. Es relevante porque combina un modelo de mundo generativo (Wan2.2) con un head de control específico para robótica, en un paradigma de "joint" donde el backbone y el head se entrenan conjuntamente. Tiene aproximadamente 5,9 mil millones de parámetros y un contexto de video que hereda del backbone Wan2.2, aunque no se especifica la longitud exacta en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAMDiT4DiT (DiT4DiT): backbone Wan2.2-TI2V-5B (video DiT) + head de acción DiT-B con stream de geometría de manos (66-D) |
| Parametros totales | 5.902.442.058 (~5,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Wan2.2, no especificada) |
| Tipos de cuantizacion | no disponible (se carga en bfloat16 según el ejemplo) |
| Idiomas soportados | no disponibles (modelo de robótica, no de lenguaje) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (shards, 12 archivos, 11,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DiT4DiT: un backbone de difusión de video (Wan2.2-TI2V-5B) que procesa secuencias de video y un head de acción (DiT-B) que predice comandos de control. El head incluye un codificador/decodificador de manos (`hand_encoder` / `hand_decoder`) que trabaja con un vector de 66 dimensiones: para cada mano (derecha e izquierda) se representan la posición de la brida (3D), la orientación en rotación 6D, cuatro puntas de dedos en coordenadas locales de la palma (4×3D) y cuatro orígenes de articulaciones PIP mediales (4×3D). El modo de entrenamiento es `joint`, lo que significa que backbone y head se optimizan conjuntamente.

El dataset de entrenamiento es DexJoCo bimanual multitask, con cached umT5 text embeddings (txtcache) y extracción de características en la capa 18 de 30 del backbone. Se usa `hand_action_weight=0.5`, stride 2 y shift 1 para las acciones de mano. No se especifican el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El checkpoint corresponde al paso 60.000. Los artefactos de entrenamiento (estado del optimizador DeepSpeed, etc.) se excluyen deliberadamente del repositorio.

## Capacidades

- Generación de acciones de control bimanual: predice vectores de 66-D que combinan posición/orientación de muñecas y articulaciones de dedos para ambas manos.
- Procesamiento de video como entrada: el backbone Wan2.2-TI2V-5B está diseñado para entender secuencias de video y generar representaciones espacio-temporales.
- Integración con texto: utiliza embeddings umT5 cacheados, lo que sugiere que puede condicionarse con instrucciones textuales (aunque no se detalla el formato).
- Modelo de mundo: al ser un DiT de video finetuneado, puede servir como modelo de mundo para simulación o planificación.
- No es un modelo de lenguaje: no genera texto, código ni responde preguntas. Su salida es un vector de control.
- No soporta tool calling ni agentes conversacionales.

## Casos de uso

- Control de robots manipuladores bimanuales: el modelo puede generar comandos de posición y orientación para dos brazos robóticos con manos articuladas, adecuado para tareas de ensamblaje o manipulación delicada.
- Teleoperación asistida: dado un video de demostración, el modelo puede inferir las acciones de mano necesarias para replicar la tarea.
- Simulación robótica: como modelo de mundo, puede predecir estados futuros de las manos y objetos, útil para planificación o aprendizaje por refuerzo en entornos simulados.
- Generación de trayectorias de agarre: el vector de 66-D incluye posiciones de dedos, permitiendo generar configuraciones de agarre para objetos específicos.
- Investigación en world models para robótica: sirve como base para estudiar la integración de modelos generativos de video con cabezas de control.
- Fine-tuning posterior: al ser un checkpoint intermedio (step 60k), puede usarse como punto de partida para tareas bimanuales específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval o métricas específicas de robótica (éxito en tareas, error de posición, etc.). Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación.
- Con ~5,9B parámetros en bfloat16, se estima que la inferencia requiere al menos 12-16 GB de VRAM (el checkpoint pesa 11,8 GB en FP32, pero se carga en bfloat16). Sin embargo, esto es una estimación, no un dato oficial.
- No se mencionan GPUs concretas (A100, H100, RTX 4090, etc.).
- El ejemplo de carga usa `torch_dtype="bfloat16"`, lo que sugiere que se espera una GPU con soporte para bfloat16 (Ampere o posterior).
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.). Al ser un modelo de robótica con pipeline `robotics`, probablemente se usa con frameworks específicos como GR00T (el código de carga referencia `gr00t.model.wam_dit4dit`).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo pertenece a una categoría muy específica (world models para robótica bimanual) y no se dispone de datos de otros modelos similares para comparar.

## Limitaciones y advertencias

- El repositorio no es autocontenido: requiere descargar el snapshot base `Wan-AI/Wan2.2-TI2V-5B-Diffusers` y sobrescribir la ruta `wan_model_path` en `config.json` (por defecto apunta a una ruta local de entrenamiento).
- Los stats de whitening de las manos se cargan desde una ruta relativa al directorio de trabajo; si se carga desde otro directorio, hay que ajustar `hand_action_norm_stats_path`.
- La licencia es `other` y no se especifica si permite uso comercial. Se debe contactar al autor para aclarar los términos.
- No se documentan sesgos ni riesgos de alucinación (al no ser un modelo de lenguaje, el concepto de alucinación se traduce en predicciones de acciones incorrectas).
- No hay información sobre la longitud de contexto ni sobre el rendimiento en tareas reales de robótica.
- El modelo tiene 0 descargas y 0 likes, lo que indica que es un experimento de investigación sin validación externa amplia.
- La fecha de creación (2026-08-16) es futura, lo que sugiere que puede ser un artefacto de un proyecto en curso o un error en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seungkukim/dexjoco_bimanual_multitask_handaction_joint_wan22ti2v5b_L18_txtcache-60k
- Dataset DexJoCo: https://huggingface.co/datasets/seungkukim/dexjoco_lerobot_v20
- Base Wan2.2-TI2V-5B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers (referenciado en la model card)
