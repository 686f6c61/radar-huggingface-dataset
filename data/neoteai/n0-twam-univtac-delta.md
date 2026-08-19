# NeoteAI/n0-twam-univtac-delta

## Resumen

N0-TWAM es un modelo de acción-mundo (world-action model) táctil-nativo desarrollado por NeoteAI para manipulación robótica con contacto rico. A diferencia de los modelos de lenguaje convencionales, este modelo modela conjuntamente visión, tacto y acción bajo un objetivo unificado de flujo rectificado (rectified flow / flow-matching). Predice tres flujos acoplados por fragmento: vídeo futuro, tacto futuro y la acción de bajo nivel que los realiza. Es, según sus autores, el primer modelo de acción-mundo táctil entrenado a gran escala.

El checkpoint `n0-twam-univtac-delta` es un post-entrenamiento multi-tarea del árbol de liberación N0-TWAM (`wan_twam`), en su paso 10000 final. Está especializado en las 8 tareas de un solo brazo del benchmark UniVTAC, con espacio de acción delta de horizonte (`pi05_delta`). El modelo base es `pretrain_mot_umi_mixed/checkpoint_step_16500_r42` (MoT narrow, sin tacto local). Cuenta con 7.207.357.844 parámetros (~7,2 mil millones) y se distribuye en formato safetensors bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo reside en que integra percepción táctil de alta resolución (GelSight rgb sin marcadores) como una modalidad de primera clase, algo poco común en modelos de manipulación robótica, y lo hace mediante una arquitectura Mixture-of-Transformers con expertos de modalidad separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) con objetivo de flujo rectificado / flow-matching |
| Parametros totales | 7.207.357.844 (~7,2B) |
| Parametros activos | no disponible (no se especifica el numero de parametros activos por experto) |
| Longitud de contexto | no disponible (modelo de accion, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

N0-TWAM emplea una arquitectura Mixture-of-Transformers con tres expertos de modalidad: visión, tacto y acción. Cada experto procesa su flujo de entrada y, bajo un objetivo conjunto de flujo rectificado, el modelo predice el futuro visual y táctil antes de generar la acción. El pre-entrenamiento se realiza a escala con flujos táctiles sincronizados por dedo, lo que permite al modelo anticipar el contacto antes de ejecutar el movimiento.

El checkpoint `n0-twam-univtac-delta` se obtiene mediante post-entrenamiento sobre la base `pretrain_mot_umi_mixed/checkpoint_step_16500_r42`, con la siguiente receta: LocalTactile activado en modo "current", horizonte h12 con APF12, expertos MoT narrow (dimensiones de acción/tactil 1024, FFN 4096), sin dropout táctil, tasa de aprendizaje 1e-4 con decaimiento coseno y 10000 pasos. El tacto se captura con sensores GelSight en modo rgb sin marcadores. La normalización es per-task (q01/q99 por robot), no una media agrupada, lo que implica que el checkpoint debe servirse con la configuración de normalización de la tarea concreta evaluada.

## Capacidades

- Predicción conjunta de futuro visual, futuro táctil y acción de bajo nivel para manipulación robótica.
- Soporte multi-tarea: entrenado sobre las 8 tareas de un solo brazo del benchmark UniVTAC.
- Espacio de acción delta de horizonte (`pi05_delta`), que permite control fino y suave.
- Percepción táctil de alta resolución mediante GelSight rgb sin marcadores (marker-less), integrada como modalidad de entrada.
- Modelado de contacto rico: capaz de anticipar el contacto físico antes de ejecutar la acción.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Manipulación robótica con contacto rico: el modelo puede ejecutar tareas de inserción, ensamblaje o agarre de precisión donde el tacto es crítico, prediciendo el contacto antes de actuar.
- Control predictivo basado en modelo: al predecir el futuro visual y táctil, puede usarse como world model para planificación de movimientos en bucle cerrado.
- Aprendizaje por imitación con datos táctiles: sirve como política multi-tarea entrenada con demostraciones, útil para transferir habilidades a robots reales con sensores GelSight.
- Investigación en modelos de mundo para robótica: su arquitectura MoT y su entrenamiento a escala lo convierten en un banco de pruebas para estudiar la integración de modalidades físicas en modelos generativos.
- Automatización industrial de precisión: tareas de un solo brazo como inserción de conectores o montaje de piezas pequeñas pueden delegarse a este modelo en entornos controlados.
- Desarrollo de sistemas de control táctil-visual: combinado con un servidor de inferencia (`ar_server`), puede desplegarse en robots reales con cámaras táctiles GelSight para ejecutar las 8 tareas UniVTAC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper arXiv (2607.23783) describe el modelo y su entrenamiento, pero no se incluyen cifras concretas de MMLU, HumanEval u otros tests estándar, al tratarse de un modelo de acción robótica y no de lenguaje. Se recomienda consultar el paper para métricas específicas de éxito en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~7,2B parámetros en safetensors (14,4 GB), la inferencia en FP16 requeriría al menos 15-16 GB de VRAM solo para los pesos, más overhead de activaciones y buffers de difusión. En FP32 serían ~29 GB.
- GPU recomendadas: tarjetas con 24 GB o más, como RTX 4090, A100 (40 GB) o H100 (80 GB). No se dispone de información sobre cuantización, por lo que no se puede garantizar funcionamiento en GPUs de 16 GB o inferiores.
- En consumer GPU: es plausible en una RTX 4090 (24 GB) en FP16, pero no está confirmado por el autor.
- Opciones de despliegue: el autor menciona un `ar_server` con configuración `AR_SERVE_RUN` / `AR_SERVE_TASK` para servir el checkpoint con la normalización per-task correcta. No se mencionan vLLM, llama.cpp ni Ollama, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponible. Al ser un modelo de flujo rectificado con predicción multi-modal, la latencia dependerá del número de pasos de inferencia y del hardware.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. N0-TWAM se presenta como el primer modelo de acción-mundo táctil entrenado a gran escala, por lo que no hay alternativas establecidas con la misma combinación de visión, tacto y acción. Modelos de política robótica como RT-2 o OpenVLA se centran en visión-lenguaje-acción, pero no integran tacto como modalidad de primera clase ni utilizan un objetivo de flujo rectificado multi-modal. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Es un modelo especializado en robótica, no un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.
- Requiere configuración específica de normalización per-task: si se sirve con la media agrupada (`pooled envelope` en `train_meta.json`), las acciones se des-normalizan a una escala incorrecta y el modelo falla.
- Depende de hardware táctil específico (GelSight rgb sin marcadores) para la entrada táctil; no funciona con otras modalidades táctiles sin reentrenamiento.
- Limitado a las 8 tareas de un solo brazo de UniVTAC en este checkpoint; no cubre tareas dual-arm (disponibles en otros checkpoints de la familia).
- Riesgo de alucinación en acciones si el servidor de inferencia no se configura correctamente (norm, claves de cámara/tacto, canales de acción).
- Licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación en entornos no supervisados.
- No se dispone de información sobre sesgos o comportamientos no deseados fuera del dominio de manipulación.

## Enlaces

- HuggingFace: https://huggingface.co/NeoteAI/n0-twam-univtac-delta
- GitHub (repositorio N0-TWAM): https://github.com/neoteai/N0-TWAM
- Página de investigación: https://research.neoteai.com/n0-twam/
- Paper arXiv: https://arxiv.org/abs/2607.23783
