# kiroaiseoul/NAJY_act_all11_c100_gist30_sdrop30_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_gist30_sdrop30_27D_60k_s1000 es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) dentro del ecosistema LeRobot, publicado por el usuario kiroaiseoul. No es un modelo de lenguaje: es un modelo de imitación (behavioral cloning) que mapea observaciones multimodales de un robot —estado propioceptivo de 27 dimensiones y tres cámaras RGB de 480x640— a acciones de 16 dimensiones. El checkpoint tiene 51.700.368 parámetros (~51,7 M) y ocupa 0,2 GB en el repositorio.

Según la propia model card, se trata de un checkpoint del «paso 11» del pipeline NAJY, entrenado en una unidad DGX_1 y subido con fines de análisis y puntuación, no como candidato confirmado para despliegue real. La ejecución asociada es `exp_all11_c100_gist30_sdrop30_s1000` en el paso 60.000, con un manifiesto que activa state dropout con probabilidad 0,3 sobre las dimensiones del brazo. El activo se enmarca en el proyecto trossen-ai-simulation, concretamente en la investigación sobre base móvil documentada en `docs/mobile_base_investigation.md` §94.

Su relevancia ahora es acotada: es un artefacto de investigación reproducible y verificable por hash, útil para reproducir experimentos de manipulación móvil con LeRobot y para auditar configuraciones de entrenamiento (chunk size, dropout de estado, composición del dataset). No cuenta con descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer encoder-decoder con CVAE y backbone visual convolucional |
| Parámetros totales | 51.700.368 (~51,7 M), dato real del safetensors |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de política robótica, no de lenguaje); chunk de acciones de tamaño 100 según el nombre de la run (`c100`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), estructura `pretrained_model` de LeRobot |
| Dimensión de estado (`observation.state`) | 27 |
| Dimensión de acción (`action`) | 16 |
| Cámaras de entrada | 3 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`), cada una de 3x480x640 |
| Pasos de entrenamiento | 60.000 |
| Hash SHA-256 del safetensors | `31a29c7ee1c5c6aee3aab88e0bf5993aceef10194ad20e776bbeaefe76c23548` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT original (Zhao et al., 2023), un transformer encoder-decoder con un componente CVAE que predice *chunks* de acciones en lugar de acciones individuales. La entrada combina el vector de estado propioceptivo de 27 dimensiones con las características extraídas de tres cámaras RGB de 480x640 mediante un backbone convolucional; la salida es un vector de acción de 16 dimensiones. El nombre de la ejecución indica un chunk de 100 acciones (`c100`), lo que es coherente con la formulación habitual de ACT de predecir secuencias para reducir el error de composición y mejorar la suavidad temporal.

Los detalles de entrenamiento disponibles provienen de la propia model card. El entrenamiento se ejecutó sobre un conjunto etiquetado como `all11` (11 etapas o tareas) con manifiesto `configs/datasets/all11_tr_hot_gist30_sdrop30.json`, durante 60.000 pasos, con la configuración de dropout de estado `{"state_dropout": {"p": 0.3, "dims": "arm"}}`. La primera línea del log de entrenamiento registra el lanzamiento el 2026-10-13T13:57:09+00:00 con el commit `aa59c9b` y un manifiesto con hash SHA-256 `f063669952e4467b`. No se especifican en la información disponible el número total de tokens o frames, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (que, en cualquier caso, no aplican de forma estándar a un método de imitación como ACT).

## Capacidades

- Control robótico por imitación: genera comandos de acción de 16 dimensiones a partir del estado y de tres vistas de cámara, apto para manipulación con brazo (y potencialmente base móvil, dado el contexto del proyecto).
- Fusión multimodal: integra señales propioceptivas (27 dimensiones) con tres cámaras RGB simultáneas (`cam_high`, `cam_left_wrist`, `cam_right_wrist`).
- Predicción por chunks de acciones: el sufijo `c100` sugiere la emisión de secuencias de 100 acciones, lo que reduce la frecuencia efectiva de inferencia y mejora la continuidad del movimiento.
- Regularización mediante state dropout: la configuración `sdrop30` aplica dropout de estado con p=0,3 sobre las dimensiones del brazo, lo que puede favorecer cierta robustez ante pérdida de señal propioceptiva.
- Multi-etapa: entrenado aparentemente sobre 11 etapas o tareas (`all11`), lo que apunta a un uso multi-tarea dentro del mismo montaje.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso textual ni capacidades de lenguaje, visión general o audio. Es exclusivamente una política de control.

## Casos de uso

- Reproducción de experimentos de imitación con LeRobot: cargar el checkpoint con la estructura `pretrained_model` y ejecutar `stage_cond_diag.py` u otras herramientas de diagnóstico para comparar contra otras configuraciones del pipeline NAJY.
- Auditoría de configuraciones de entrenamiento: verificar el efecto de parámetros como `state_dropout` (p=0,3), chunk size (100) y número de etapas (11) sobre el comportamiento de la política en simulación.
- Investigación en manipulación móvil: enmarcado en `mobile_base_investigation.md` §94, sirve como material de análisis sobre cómo una política ACT con estado de 27 dimensiones gestiona tareas con base móvil.
- Evaluación en simulación de tareas de brazo: usar las tres cámaras y el estado de 27 dimensiones para replicar tareas de pick-and-place o manipulación fina antes de considerar hardware real.
- Punto de comparación para ablation studies: al ser un checkpoint intermedio del «paso 11», es útil como referencia frente a etapas anteriores o posteriores del mismo pipeline.
- Verificación de integridad en pipelines de MLOps: el hash SHA-256 publicado permite validar la integridad del artefacto tras la descarga dentro de un flujo automatizado.
- Base para experimentos de robustez: el dropout de estado durante el entrenamiento permite estudiar el comportamiento de la política ante señales propioceptivas degradadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otros checkpoints del mismo pipeline o con políticas alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 207 MB solo para pesos, más activaciones y buffers de visión; en fp16, aproximadamente 103 MB de pesos. Son estimaciones derivadas del recuento de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente en la práctica, incluidas RTX 3060, RTX 4060, RTX 4090 o superiores. Para entrenamiento o ajuste fino, se recomienda una GPU de gama alta (por ejemplo, A100 o H100) o la DGX_1 mencionada por el autor.
- Compatibilidad con GPU de consumo: muy probablemente sí, dado el tamaño de 51,7 M de parámetros y el repo de 0,2 GB; también es viable en CPU para inferencia no crítica en tiempo real.
- Opciones de despliegue: al ser un checkpoint LeRobot con estructura `pretrained_model`, está pensado para cargarse mediante la librería LeRobot y sus scripts asociados (`stage_cond_diag.py` y similares). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. En control robótico, la latencia es determinante para el bucle de control; no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos cuantitativos publicados en la información proporcionada para comparar este checkpoint con alternativas concretas. A modo orientativo cualitativo dentro de la misma categoría de políticas de imitación:

| Modelo | Categoría | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11... (este) | ACT (LeRobot) | 51,7 M | chunk 100 (según nombre de la run) | apache-2.0 | HuggingFace, 0 descargas |
| ACT original (Zhao et al.) | ACT | no disponible | no disponible | no disponible | paper arXiv 2304.13705 |
| Diffusion Policy | Política de difusión | no disponible | no disponible | no disponible | paper / repositorio público |
| Otros checkpoints NAJY | ACT (LeRobot) | no disponible | no disponible | no disponible | no disponible |

Los datos marcados como «no disponible» no aparecen en la información proporcionada y no deben interpretarse como equivalentes al modelo descrito.

## Limitaciones y advertencias

- El propio autor indica que es un checkpoint subido para análisis y puntuación, y que no equivale a un candidato confirmado para despliegue real. No debería usarse en producción sin validación adicional.
- No hay datos de tasa de éxito ni de robustez; se desconoce su comportamiento fuera del entorno o dataset de entrenamiento.
- Sesgos conocidos: no disponibles. En modelos de imitación, el sesgo proviene del dataset de demostraciones; al no publicarse su composición, no puede evaluarse.
- Riesgo de sobreajuste al montaje y a las 11 etapas concretas del dataset `all11`; la generalización a otras tareas, cámaras o configuraciones de robot no está documentada.
- Limitaciones de idioma: no aplica; no es un modelo de lenguaje.
- Estado de 27 dimensiones y acción de 16 dimensiones: cualquier integración debe respetar exactamente estas dimensiones y las tres cámaras de 480x640, o el checkpoint no será funcional.
- El state dropout de p=0,3 sobre el brazo durante el entrenamiento puede traducirse en un comportamiento degradado si la señal de estado es fiable en despliegue.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se documenten los cambios.
- Advertencia de integridad: antes de usar el checkpoint, conviene verificar que `sha256sum model.safetensors` coincide con `31a29c7ee1c5c6aee3aab88e0bf5993aceef10194ad20e776bbeaefe76c23548`.
- Ausencia total de tracción en la plataforma (0 descargas, 0 likes) implica que no hay validación comunitaria de su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_sdrop30_27D_60k_s1000
- Paper de ACT (Action Chunking with Transformers, Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documento de referencia del autor (`docs/mobile_base_investigation.md` §94, proyecto trossen-ai-simulation): sin URL pública disponible en la información proporcionada.
