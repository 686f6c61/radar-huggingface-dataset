# jinkmn/molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-006640

## Resumen

`jinkmn/molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-006640` es un ajuste fino (fine-tuning) de un modelo de vision-lenguaje-accion (VLA) para robotica, derivado de `allenai/MolmoAct2-BimanualYAM`, el modelo base publicado por el Allen Institute for AI (Ai2). El modelo ha sido entrenado con LeRobot (commit `c13d79e6e350c589babc5b7c5cf5ef05cb0fa58e`) sobre el dataset `lerobot/spell_ceatec_makuhari_lerobot_v30` y exportado desde el paso de entrenamiento 6640 de un trabajo de fin de grado. Su proposito es generar acciones de control continuo para un robot bimanual de tipo YAM (dos brazos de 6 articulaciones mas pinza cada uno, 14 grados de libertad en total) a partir de tres vistas de camara (superior, izquierda y derecha) y una instruccion de tarea en lenguaje natural.

El modelo tiene 5.442.196.208 parametros (aproximadamente 5,44 mil millones) almacenados en float32, lo que arroja un repositorio de 21,8 GB. Los adaptadores LoRA empleados en el ajuste estan fusionados en los pesos finales. La etiqueta de la model card indica `image-text-to-text` junto con `robotics` y `lerobot`, y el pipeline declarado en HuggingFace es `robotics`.

Es relevante en el contexto actual porque demuestra el flujo completo de adaptacion de un VLA multimodal open source a un robot concreto mediante un dataset de demostraciones propio, con estadisticas de normalizacion y configuracion de politica exportadas. No obstante, se trata de un artefacto de investigacion muy especifico: 0 descargas, 0 likes, licencia no declarada y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle (modelo image-text-to-text para robotica, derivado de `allenai/MolmoAct2-BimanualYAM`) |
| Parametros totales | 5.442.196.208 (aprox. 5,44 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32, con adaptadores LoRA fusionados) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `allenai/MolmoAct2-BimanualYAM` (revision del Hub `8dcbed66f2380e4393189c303ea72488eb9e63c2`), un VLA multimodal que combina entrada de imagen y texto con salida de acciones. El ajuste se realizo con LeRobot y la model card especifica que `training action_mode` fue `both` y que la inferencia recomendada usa `inference_action_mode="continuous"`. Los adaptadores LoRA se fusionaron en los pesos finales, que se exportaron en float32. La model card advierte de forma explicita que cargar el modelo con `dtype=torch.bfloat16` redondea los pesos fusionados y pierde buena parte de la actualizacion del ajuste fino, por lo que se recomienda float32.

Los datos de entrenamiento corresponden al dataset `lerobot/spell_ceatec_makuhari_lerobot_v30` (ruta procesada `.../spell_ceatec_makuhari_lerobot_v30_grasp_ramp_v2_0b86fee586e5`), con semilla 1000 y etiqueta de normalizacion `yam_dual_molmoact2`. El checkpoint exportado es el paso 6640 del entrenador y el nombre del modelo incluye `1ep` y `both-brightness`, lo que sugiere una epoca de entrenamiento y variaciones de brillo en las imagenes, aunque el numero total de tokens, la composicion del dataset y si hubo RLHF o DPO no se detallan en la informacion disponible. El repositorio incluye `norm_stats.json` con las estadisticas de normalizacion del entrenamiento, `lerobot_checkpoint/` con la configuracion de politica, la configuracion de entrenamiento y los ficheros de procesador (sin pesos), y `export_manifest.json` con el hash del checkpoint origen y la verificacion de la exportacion.

## Capacidades

- Generacion de acciones de control continuo para un robot bimanual YAM mediante el metodo `predict_action`, integrado en la clase `AutoModelForImageTextToText` de transformers.
- Procesamiento de entrada multimodal: tres imagenes simultaneas de camaras (orden `observation.images.top`, `observation.images.left`, `observation.images.right`) mas una instruccion de tarea en lenguaje natural.
- Manejo de un espacio de estado y accion de 14 dimensiones: `left_joint_0..5.pos`, `left_gripper.pos`, `right_joint_0..5.pos`, `right_gripper.pos`.
- Inferencia de acciones en modo continuo (`inference_action_mode="continuous"`), segun la recomendacion del autor.
- Interpretacion de instrucciones textuales de tarea para guiar la manipulacion (capacidad image-text-to-text del modelo base).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision, audio): vision (tres vistas de camara); el resto, no disponible.

## Casos de uso

- Manipulacion robotica bimanual con agarre: el modelo genera las 14 dimensiones de accion de los dos brazos y las dos pinzas a partir de las tres vistas, permitiendo tareas de coger y colocar con ambos brazos de forma coordinada.
- Aprendizaje por imitacion a partir de demostraciones: al estar entrenado sobre un dataset LeRobot con estadisticas de normalizacion exportadas (`norm_stats.json`), sirve como punto de partida reproducible para reentrenar o evaluar politicas sobre el robot YAM.
- Control guiado por instrucciones en lenguaje natural: la instruccion de tarea se pasa junto a las imagenes, de modo que el modelo puede condicionar la accion a una descripcion textual del objetivo (por ejemplo, una tarea de "spell" o de agarre concreta del dataset).
- Investigacion academica en VLA: al proceder de un trabajo de fin de grado con semilla, paso de entrenamiento y hash de exportacion documentados, es util como referencia metodologica para reproducir el pipeline LeRobot + MolmoAct2.
- Evaluacion de robustez ante cambios de iluminacion: el nombre del checkpoint (`both-brightness`) sugiere entrenamiento con variaciones de brillo, lo que permite estudiar la tolerancia del modelo a condiciones de iluminacion distintas en el mismo entorno fisico.
- Base para ajustes especificos de un laboratorio o linea de montaje: dado que los adaptadores LoRA ya estan fusionados y el formato es safetensors compatible con transformers, se puede partir de este modelo para fine-tunings adicionales sobre tareas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: en float32, 5.442.196.208 parametros ocupan aproximadamente 21,8 GB, cifra coherente con el tamano del repositorio (21,8 GB). En bfloat16 serian unos 10,9 GB, pero la model card desaconseja este tipo por la perdida del ajuste fino.
- A la VRAM de los pesos hay que sumar la memoria de activaciones del codificador visual (tres imagenes de entrada) y la cache de inferencia, no cuantificada en la informacion disponible.
- GPU profesionales recomendadas: A100 (40/80 GB), H100 o A6000 (48 GB), donde el modelo en float32 entra con margen para activaciones.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda muy justa en float32 (solo los pesos ocupan 21,8 GB), por lo que es probable que se produzca OOM al anadir activaciones; no se garantiza su ejecucion sin optimizaciones.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` con `trust_remote_code=True` (requiere codigo personalizado, etiqueta `custom_code`), e integracion con LeRobot. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`jinkmn/molmoact2-yam-...-step-006640`) | 5,44B | no disponible | VLA bimanual YAM (14 DoF) | no disponible | HuggingFace (0 descargas) |
| `allenai/MolmoAct2-BimanualYAM` (base) | no disponible | no disponible | VLA bimanual YAM | no disponible | HuggingFace |
| Otros VLA open source de robotica (por ejemplo, familias tipo OpenVLA o pi0) | no disponible | no disponible | VLA | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre este ajuste y el modelo base ni con alternativas, por lo que la comparacion se limita a los datos de parametros conocidos.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia, por lo que el uso comercial no esta autorizado de forma explicita y debe consultarse con el autor antes de cualquier explotacion.
- Especificidad de hardware robotico: el modelo genera acciones con el orden exacto `left_joint_0..5.pos`, `left_gripper.pos`, `right_joint_0..5.pos`, `right_gripper.pos` y espera tres camaras en el orden `top`, `left`, `right`; fuera de esa configuracion las predicciones no son validas.
- Dependencia de la normalizacion: las acciones deben interpretarse con las estadisticas de `norm_stats.json` bajo la etiqueta `yam_dual_molmoact2`; usar otra normalizacion invalida la salida.
- Precision obligatoria en float32: cargar en bfloat16 redondea los pesos fusionados y degrada el ajuste fino, segun advierte el propio autor.
- Requiere `trust_remote_code=True`: el modelo incluye codigo personalizado que se ejecuta al cargarlo, lo que implica un riesgo de seguridad y de reproducibilidad.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: en modelos VLA se manifiesta como acciones fisicamente incoherentes o no seguras; no se aportan evaluaciones de seguridad ni de tasa de fallo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados.
- Artefacto de investigacion sin validacion externa: 0 descargas y 0 likes, sin benchmarks publicados, sin informacion sobre rendimiento en produccion ni sobre latencia.
- Uso en robotica real: no se documentan protocolos de parada de emergencia ni limites de par; la aplicacion directa sobre hardware fisico conlleva riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jinkmn/molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-006640
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/spell_ceatec_makuhari_lerobot_v30
- Repositorio LeRobot: https://github.com/huggingface/lerobot
