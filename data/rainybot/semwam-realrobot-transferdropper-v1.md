# RainyBot/SemWAM-RealRobot-TransferDropper-v1

## Resumen

SemWAM Real Robot — Transfer Dropper v1 es un checkpoint específico de tarea del modelo SemWAM, publicado por RainyBot. SemWAM es un modelo de mundo y acción (world-action model) que predice conjuntamente acciones de robot y representaciones futuras —RGB, profundidad y semántica— a partir de observaciones de cámara actuales, una instrucción en lenguaje natural y el estado del robot. Este checkpoint concreto está entrenado para la tarea "Transfer Dropper" sobre un robot bimanual real.

El modelo pertenece a la categoría de visión-lenguaje-acción (VLA) con modelado de mundo explícito: no solo genera comandos motores, sino que también anticipa la evolución visual y semántica de la escena. Se distribuye como un checkpoint de PyTorch (`step_002895.pt`) acompañado de contratos de inferencia, estadísticas de normalización y manifiestos de verificación, no como un paquete `AutoModel` de Transformers.

Su relevancia radica en que documenta un entrenamiento completado (paso 2895 del optimizador, ocho lanzadores de nodo finalizados con éxito) con verificación de integridad de tensores y estadísticas. No obstante, el propio autor advierte que la finalización del entrenamiento no establece una tasa de éxito en robot real ni reclama resultados estado del arte. El repositorio ocupa 14,6 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SemWAM v2 (`rgb_dep_sem`), atención `rgb_auxiliary_causal`, condicionamiento de acción `predicted_depth_head_semantic` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en PyTorch `float` nativo, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), checkpoint `step_002895.pt` |

## Arquitectura y entrenamiento

SemWAM v2 emplea una arquitectura multimodal que combina un codificador visual con un compresor semántico congelado y cabezas de predicción independientes para profundidad y semántica. La disposición de atención es `rgb_auxiliary_causal` y el paradigma de entrada es `t_concat` con disposición de vistas `robotwin_t`. La profundidad se representa mediante un `dvae` (depth VAE) y se condiciona a la estimación del fotograma actual (`condition_source: estimated`, `condition_temporal_context: current_frame`), mientras que los objetivos de profundidad provienen del dataset. Las proyecciones de profundidad y semántica son independientes. La visibilidad mundo-acción es `none`.

El entrenamiento se completó hasta el paso de optimizador 2895, con los ocho lanzadores de nodo originales finalizados correctamente. La verificación de release (10 de noviembre de 2026) cubrió estructura del checkpoint, finitud de tensores, identidad de inferencia guardada, estadísticas de normalización numérica e inventario de finalización de guardado. No se publican detalles sobre el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. El autor señala que el checkout de empaquetado (`19d1247e...`) contenía cambios locales y que ese commit por sí solo no garantiza reproducir exactamente el código de entrenamiento.

## Capacidades

- Predicción conjunta de acciones de robot y representaciones futuras (RGB, profundidad y semántica) a partir de observaciones actuales.
- Control bimanual de efector final: estado y acciones de 16 valores `[left xyz, left quaternion xyzw, left gripper, right xyz, right quaternion xyzw, right gripper]`.
- Representación interna de 20 dimensiones (posición, rotación 6D y gripper); estado absoluto y acciones como transformaciones SE(3) relativas con valores de gripper absolutos.
- Horizonte de acción de 32 pasos.
- Entrada multimodal con tres vistas RGB: cámara principal, muñeca izquierda y muñeca derecha.
- Condicionamiento por instrucción en lenguaje natural (inglés).
- Estimación de profundidad a partir únicamente de RGB actual en inferencia; los objetivos docentes futuros no se usan como entrada.
- No incluye tool calling, function calling ni agentes multi-paso; es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Investigación en modelado de mundo y acción: el checkpoint permite estudiar cómo la predicción conjunta de RGB, profundidad y semántica futuras informa la política de acción, comparando representaciones internas con las observaciones reales.
- Manipulación bimanual con efector final: la interfaz de 16 valores y el horizonte de 32 pasos permiten integrar el modelo en un lazo de control que reciba estado absoluto y aplique transformaciones SE(3) relativas.
- Tareas de transferencia de objetos: el checkpoint está especializado en "Transfer Dropper", por lo que sirve como referencia para experimentos de transferencia de objetos entre posiciones con dos brazos.
- Evaluación de condicionamiento por profundidad estimada: útil para medir el impacto de usar profundidad derivada solo de RGB actual frente a profundidad de sensor, manteniendo la geometría de cámara de `inference_config.json`.
- Reproducibilidad de releases: el manifiesto SHA256, las estadísticas de normalización y el contrato de inferencia permiten verificar pipelines de evaluación y auditar la integridad de los pesos antes de desplegarlos.
- Base para ajuste fino específico de tarea: al ser un checkpoint final con contrato público, puede servir como punto de partida para entrenar variantes en otras tareas de manipulación, respetando la normalización z-score sin recorte y las convenciones de cuaterniones guardadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la finalización del entrenamiento no establece una tasa de éxito en robot real ni reclama resultados estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 14,6 GB y el checkpoint se carga con `torch.load(..., mmap=True, weights_only=True)`, lo que sugiere que los pesos caben en memoria unificada o en GPU con al menos ~16 GB en precisión nativa, aunque no se confirma.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del repositorio, se requeriría una GPU con suficiente memoria para el checkpoint completo y los tensores de activación de tres vistas RGB más profundidad y semántica.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del checkpoint (14,6 GB) está en el límite de GPUs de consumo de 16 GB, pero no se documenta una variante cuantizada.
- Opciones de despliegue: runtime propio de SemWAM (repositorio `RainyRobo/SemWAM`), con validación mediante `wam.eval.checkpoint_schema.validate_checkpoint` y `apply_checkpoint_to_cfg`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM Real Robot — Transfer Dropper v1 | no disponible | no disponible | World-action VLA bimanual | MIT | Hugging Face (checkpoint PyTorch) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (world-action models para manipulación bimanual real) en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se reclama tasa de éxito en robot real ni rendimiento estado del arte; la verificación cubre integridad del checkpoint, no calidad de política.
- El modelo es específico de la tarea "Transfer Dropper"; no se garantiza su generalización a otras tareas sin ajuste fino.
- No es un paquete `AutoModel` de Transformers: requiere el runtime SemWAM y el checkout de código correspondiente.
- No se proporciona un driver de robot listo para usar; el adaptador de acción conjunta de RoboTwin no es intercambiable con esta interfaz de pose bimanual de efector final.
- Reutilizar estadísticas de normalización de otra tarea, aplicar recorte ±5, cambiar la convención de cuaterniones o añadir un desplazamiento en el índice de acción altera la interfaz publicada y puede invalidar los resultados.
- La profundidad se estima solo a partir de RGB actual; cambios en el preprocesado de profundidad o en la geometría de cámara de `inference_config.json` rompen el contrato.
- El entrenamiento se completó con un checkout de empaquetado que contenía cambios locales; no se garantiza reproducibilidad exacta del código de entrenamiento.
- Idiomas: solo inglés para las instrucciones.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al ser un modelo de política robótica, los errores se manifiestan como acciones incorrectas más que como texto inventado.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia en el robot objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-RealRobot-TransferDropper-v1
- Repositorio de código SemWAM: https://github.com/RainyRobo/SemWAM
- Checkout de empaquetado: `19d1247e24e1990a7aac99fbd5cddd674771df9a`
