# hz1919810/flashwam-arx-student-from-t3000

## Resumen

El modelo `hz1919810/flashwam-arx-student-from-t3000` es un estudiante destilado mediante el framework **Flash-WAM** (Modality-Aware Distillation for World Action Models), que permite reducir drásticamente el número de pasos de inferencia en modelos conjuntos de video-acción. El profesor es el checkpoint paso 3000 del modelo LingBot-VA ARX SFT v2, entrenado sobre 160 episodios de un dataset de robótica. El estudiante se destila sobre los mismos 160 episodios, logrando una inferencia de 1-2 pasos por modalidad frente a los múltiples pasos del profesor, con una aceleración reportada de 23x en el framework general.

El modelo está diseñado para el control robótico del brazo ARX Lift R5, con tres cámaras (alta, muñeca izquierda y muñeca derecha) a 256x256, y genera simultáneamente video y acciones articulares. Se distribuye en formato diffusers como `WanTransformer3DModel` con pesos en bf16 safetensors (~9.5 GB por submodelo). Es relevante porque demuestra la viabilidad de destilar modelos de mundo-acción sin perder fidelidad en tareas de manipulación, un paso clave para la inferencia en tiempo real en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WanTransformer3DModel (diffusers), modelo de difusión de video-acción |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención de 30 frames según contrato ARX) |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (según model card) |
| Formato de pesos | safetensors (bf16), config.json |

## Arquitectura y entrenamiento

El modelo es un **estudiante de destilación de consistencia** basado en el framework Flash-WAM, que combina consistencia de video, consistencia de acción y una regularización consciente de la acción. El profesor es un modelo LingBot-VA ARX SFT v2 (checkpoint 3000) entrenado en 160 episodios de un dataset de robótica. La destilación se realizó durante 2000 pasos con una pérdida Huber (c=0.001), EMA decay 0.995, y pesos de pérdida de acción 1.0 y de regularización consciente de acción 0.01. Se usaron 2 pasos DDIM tanto para video como para acción, con un rango de clasifier-free guidance de [2.0, 10.0]. El batch global efectivo fue de 16 (4 GPUs con acumulación de gradiente 4). La pérdida final fue 0.2877 para video y 0.0120 para acción.

El contrato ARX especifica 3 cámaras (cam_high, cam_left_wrist, cam_right_wrist) a 256x256, perfil K2 `video_7p5hz_action_15hz_k2`, y una salida de 14-D objetivo articular absoluto mapeado a un layout de 30-D. El dataset usa percentiles q01/q99, `env_type=none`, `action_per_frame=8` y `attn_window=30`. El repositorio contiene dos submodelos: `target_student` (EMA, recomendado para inferencia) y `online_student` (paso 2000, entrenable).

## Capacidades

- **Generación conjunta de video y acciones**: el modelo produce simultáneamente secuencias de video (7.5 Hz) y comandos articulares (15 Hz) para control robótico.
- **Control robótico multi-cámara**: procesa tres vistas (alta, muñeca izquierda, muñeca derecha) a 256x256, adecuado para manipulación fina.
- **Inferencia rápida**: destilado para 1-2 pasos por modalidad, lo que permite tiempos de inferencia cercanos a tiempo real (23x de aceleración según el framework Flash-WAM).
- **Soporte de world model**: actúa como modelo de mundo-acción, prediciendo estados futuros y acciones correspondientes.
- **Formato diffusers**: integrable con el ecosistema de Hugging Face y pipelines de robótica.
- **No se reportan capacidades de lenguaje natural, tool calling ni agentes conversacionales**; es un modelo puramente visual-motor.

## Casos de uso

- **Control de brazo robótico en tiempo real**: el modelo puede generar comandos articulares de 14-DOF a 15 Hz a partir de observaciones de cámara, permitiendo la operación de un brazo ARX Lift R5 en tareas de manipulación (levantar, colocar, ensamblar).
- **Simulación de políticas de manipulación**: al ser un world model, puede predecir secuencias de video futuras y acciones, útil para entrenar políticas en simulación o para planificación basada en modelos.
- **Teleoperación asistida**: con inferencia de 1-2 pasos, puede usarse en lazo cerrado para asistir a un operador humano, generando acciones sugeridas en tiempo real.
- **Aumento de datos para aprendizaje por refuerzo**: el modelo puede generar trayectorias sintéticas de video-acción para entrenar políticas más robustas sin necesidad de recopilar más datos reales.
- **Evaluación de políticas en simulación**: permite validar políticas de control en un entorno simulado realista antes del despliegue en el robot físico, reduciendo riesgos y costes.
- **Investigación en destilación de modelos de mundo**: sirve como punto de referencia para estudiar la transferencia de conocimiento entre modelos de difusión de video-acción y sus versiones destiladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las pérdidas de destilación finales (video: 0.2877, acción: 0.0120), pero no hay métricas de éxito en tareas reales ni comparaciones con otros modelos. El framework Flash-WAM reporta una aceleración de 23x en su página web, pero no se proporcionan cifras específicas para este checkpoint.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Cada submodelo pesa ~9.5 GB en bf16, por lo que se estima un mínimo de 12-16 GB de VRAM para inferencia con un solo submodelo (considerando overhead de activaciones y contexto de video).
- **GPU recomendadas**: no se especifican. Dado el tamaño, una GPU con al menos 16 GB (p. ej., RTX 4090, A100 40GB) sería necesaria para inferencia cómoda. Para entrenamiento o destilación se requieren múltiples GPUs (el autor usó 4).
- **Compatibilidad con consumer GPU**: posible en GPUs de 16 GB o más, pero con limitaciones de resolución y longitud de secuencia.
- **Opciones de despliegue**: al ser formato diffusers, puede usarse con la librería `diffusers` de Hugging Face. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- **Latencia y throughput**: no disponibles. La destilación a 1-2 pasos sugiere latencias bajas, pero no hay cifras concretas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. El modelo es específico para robótica ARX y no se dispone de alternativas de la misma categoría con datos públicos.

## Limitaciones y advertencias

- **Fidelidad de rollout no garantizada**: el autor advierte explícitamente que una baja pérdida de destilación no garantiza fidelidad en rollouts multi-paso ni éxito en tareas reales. Es imprescindible evaluar con rollouts y en el robot real antes de cualquier despliegue.
- **Selección de submodelo**: la elección entre `online_student` y `target_student` (EMA) es responsabilidad del usuario; el EMA se recomienda para inferencia, pero no hay garantías de que sea superior en todos los casos.
- **Dominio restringido**: el modelo está entrenado exclusivamente para el brazo ARX Lift R5 con un contrato de cámaras y acciones específico. No es generalizable a otros robots o configuraciones sin reentrenamiento.
- **Riesgo de alucinación visual**: como modelo generativo de video, puede producir secuencias irreales o inconsistentes, especialmente fuera de la distribución de entrenamiento.
- **Licencia restrictiva**: la licencia se indica como "other", lo que implica términos no estándar. Se debe revisar el repositorio original para conocer las condiciones exactas de uso comercial.
- **Sin soporte de lenguaje natural**: no es un modelo multimodal de texto; solo procesa video y genera acciones. No se debe usar para tareas de conversación o generación de texto.

## Enlaces

- [HuggingFace - hz1919810/flashwam-arx-student-from-t3000](https://huggingface.co/hz1919810/flashwam-arx-student-from-t3000)
- [Flash-WAM: Modality-Aware Distillation for World Action Models](https://flashwam.github.io/)
