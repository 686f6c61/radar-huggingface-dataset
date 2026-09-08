# siruku6/pi05-libero-plus-finetunes

## Resumen

Este repositorio contiene dos checkpoints de π0.5 (pi0.5) fine-tuned sobre el conjunto de datos `lerobot/libero_plus` (14.347 episodios) con aumento de vista de cámara. Los ha desarrollado siruku6 (Seiya Sasaki) partiendo del modelo base `lerobot/pi05_libero_base` (revisión `a217bfd3`). El objetivo es adaptar un modelo Vision-Language-Action (VLA) de robótica a las tareas de manipulación del benchmark LIBERO Plus, entrenando todos los parámetros (4.14B) en lugar de solo el experto de acciones.

La relevancia de este modelo radica en que permite evaluar el impacto del fine-tuning completo sobre un VLA de 4.14B parámetros, incluyendo el codificador visual, en un entorno robótico estándar. El repositorio incluye dos checkpoints con configuraciones de entrenamiento distintas, lo que facilita estudiar la continuidad del entrenamiento y el efecto de diferentes tasas de aprendizaje y warmup. La arquitectura es un VLA basado en π0.5, con pesos en formato safetensors y licencia Gemma Terms of Use.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 |
| Parametros totales | 4.14B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_libero_base`, un checkpoint de π0.5 entrenado previamente. Se ha ajustado sobre `lerobot/libero_plus` (revisión `f3f49f42`, 14.347 episodios) con aumento de vista de cámara. Ambos checkpoints entrenan todos los 4.14B parámetros, con `freeze_vision_encoder=false` y `train_expert_only=false`, lo que significa que el codificador visual, el modelo de lenguaje y el experto de acciones se actualizan conjuntamente.

El repositorio contiene dos directorios con configuraciones distintas:

| Directorio | Punto de partida | Pasos | Batch | LR | SHA256 de `model.safetensors` |
|---|---|---|---|---|---|
| `trial1500/001000` | `pi05_full_runpod` (3.000 pasos) | 1.000 | 64 | 5e-6 | `ea017f29be15…` |
| `ladder2500/001500` | `trial1500/001500` | 1.500 | 64 | 5e-6 (warmup 1.000) | `87d89a055f16…` |

El checkpoint `ladder2500/001500` acumula 4.500 pasos de fine-tuning desde `pi05_libero_base`: 24.000 pasos solo con el experto de acciones, seguidos de 3.000, 1.500 y 1.500 pasos con todos los parámetros. Cada directorio contiene los archivos completos de `pretrained_model`, incluidos `model.safetensors`, los pre/post-processor, `train_config.json` y la carpeta `vlm/` con el tokenizer. El modelo se entrena con la librería LeRobot.

## Capacidades

- Generación de acciones de bajo nivel para manipulación robótica a partir de observaciones visuales y lenguaje natural.
- Adaptación específica al benchmark LIBERO Plus, con 14.347 episodios de demostración.
- Entrenamiento completo de todos los parámetros, lo que permite adaptar el codificador visual a las tareas de manipulación.
- Aumento de vista de cámara durante el entrenamiento para mejorar la robustez ante cambios de perspectiva.
- Soporte de instrucciones en lenguaje natural heredado del modelo base π0.5.
- No se especifican capacidades de tool calling, razonamiento multi-paso ni generación de texto general; es un modelo de acción robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: usar estos checkpoints para analizar cómo afecta el fine-tuning completo de 4.14B parámetros al rendimiento en LIBERO Plus, en comparación con el modelo base o entrenamientos solo del experto.
- Desarrollo de robots de manipulación en laboratorio: integrar el modelo como policy de bajo nivel en un brazo robótico para ejecutar tareas de LIBERO Plus, aprovechando su capacidad de procesar imágenes de cámara y comandos en lenguaje natural.
- Fine-tuning para nuevas tareas: partir de estos checkpoints como inicialización para adaptar el modelo a tareas personalizadas con menos datos, reduciendo el coste de entrenamiento.
- Benchmarking de modelos VLA: comparar el rendimiento de este fine-tuning con otros checkpoints de π0.5 o con modelos VLA alternativos en entornos robóticos estandarizados.
- Simulación robótica: usar el modelo en simuladores como MuJoCo o Isaac para generar trayectorias de acción y validar políticas antes de desplegarlas en hardware real.
- Transferencia de simulación a real: el aumento de vista de cámara aplicado durante el entrenamiento puede ayudar a que la política generalice mejor a entornos reales con distintas configuraciones de cámara.
- Docencia y demostraciones: emplear el modelo para generar vídeos de demostración de tareas robóticas a partir de instrucciones textuales, útiles para formación o presentaciones de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 ocupan aproximadamente 8.3 GB (4.14B × 2 bytes). Con overhead de activaciones y buffers, se recomienda una GPU con al menos 16 GB de VRAM para inferencia en precisión flotante.
- Para entrenamiento, el fine-tuning completo de 4.14B parámetros con batch 64 requiere un nodo multi-GPU; no se especifica la configuración exacta en la información disponible.
- GPU recomendadas: una RTX 4090 (24 GB) puede ser suficiente para inferencia; para entrenamiento se recomiendan A100 o H100 con 40-80 GB.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot; no se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset | Pasos de fine-tuning | Licencia |
|---|---|---|---|---|
| `lerobot/pi05_libero_base` | 4.14B | preentrenado | 0 | Gemma |
| `siruku6/pi05_full_runpod` | 4.14B | libero_plus | 3.000 (full) | Gemma |
| `siruku6/pi05-libero-plus-finetunes` (`trial1500/001000`) | 4.14B | libero_plus | 1.000 (full) | Gemma |
| `siruku6/pi05-libero-plus-finetunes` (`ladder2500/001500`) | 4.14B | libero_plus | 1.500 (full, acumulado 4.500) | Gemma |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos checkpoints.

## Limitaciones y advertencias

- Licencia restrictiva: al derivar de `lerobot/pi05_libero_base`, se aplican los Gemma Terms of Use, incluida la Gemma Prohibited Use Policy. Esto puede limitar ciertos usos comerciales o aplicaciones de alto riesgo.
- Sin benchmarks publicados: no hay resultados de evaluación en LIBERO Plus ni en otros entornos, por lo que el rendimiento real no está verificado.
- Especialización limitada: el modelo está fine-tuned en un dataset concreto (LIBERO Plus) y puede no generalizar a otras tareas de manipulación sin fine-tuning adicional.
- Posibles sesgos del dataset: las demostraciones de LIBERO Plus pueden contener sesgos en los tipos de objetos, escenas o comportamientos, lo que podría trasladarse al modelo.
- Riesgo de alucinación en acciones: como todo VLA, el modelo puede generar acciones no válidas o incoherentes en entornos no vistos.
- Limitaciones de la documentación: la model card advierte que `train_config.json` no está en la ubicación estándar bajo `pretrained_model/`, por lo que LeRobot no puede leerlo con `--resume` directamente desde el Hub; se debe usar `--init-from`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/siruku6/pi05-libero-plus-finetunes
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_plus
- Perfil del autor: https://huggingface.co/siruku6
- Checkpoint intermedio `pi05_full_runpod`: https://huggingface.co/siruku6/pi05_full_runpod
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
