# Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch64-step18000

## Resumen

SmolVLA es una política robótica de tipo vision-language-action (VLA) desarrollada originalmente por Hugging Face, y este repositorio concreto, publicado por el usuario Samisaliveagain, contiene un checkpoint afinado para una tarea de inserción de tornillo hexagonal con un brazo robótico AgileX Piper. El modelo combina percepción visual (dos cámaras RGB, cenital y en ángulo) con el estado de las articulaciones para generar acciones de control motor de forma directa, sin planificación explícita intermedia.

El checkpoint corresponde al paso 18.000 de un entrenamiento por imitación con batch de 64 sobre un conjunto de 100 demostraciones teleoperadas. Los pesos suman 450 millones de parámetros y el repositorio ocupa 1,2 GB en formato safetensors, empaquetado con la librería LeRobot. Se trata de un modelo de investigación y prototipado, no de un producto listo para producción: el propio autor advierte que la publicación verifica la integridad de los ficheros y el número de paso, pero no demuestra éxito físico de inserción ni robustez.

Su relevancia es acotada pero clara para quien trabaja en manipulación fina: es un ejemplo reproducible de cómo un modelo VLA compacto puede aprender una tarea de precisión sub-milimétrica a partir de un dataset pequeño y bien documentado, con procedencia verificable mediante hashes SHA-256 y ficheros de configuración de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), política de imitación sobre LeRobot |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | no disponible (el autor indica que la subida no asigna licencia nueva) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que fusiona entradas visuales con el estado propioceptivo del robot para emitir acciones motoras. En este checkpoint concreto, las entradas son siete valores de articulación y pinza más dos cámaras RGB (cenital y en ángulo), y la salida son siete objetivos absolutos para el seguidor AgileX Piper, con articulaciones en grados y pinza en milímetros. El modelo genera *action chunks* de 50 acciones, lo que reduce la frecuencia de inferencia necesaria y suaviza la ejecución.

El entrenamiento se realizó por imitación sobre el dataset `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1` (revisión `1ec623d8...`), con un objetivo de 20.000 actualizaciones y checkpoint guardado en el paso 18.000, batch de 64 y un único proceso. No se documenta en la model card el uso de RLHF, DPO ni fases de refinamiento por recompensa; el paradigma es puramente de *behavior cloning*. El autor especifica que estos pesos se entrenaron con el dataset de 100 demostraciones y que el dataset posterior de 80 demostraciones con *zero-home* no se usó en esta ejecución. La integridad está verificada: el paso se comprueba contra `training_state/training_step.json`, y los siete ficheros de política y procesadores coinciden con los hashes de auditoría; el hash SHA-256 del peso es `db7188ed480c939b20438a064c73c3aa602eda675d09d0d64f65ba281385c959`.

## Capacidades

- Generación de acciones de control motor para un brazo AgileX Piper: siete objetivos absolutos (articulaciones en grados, pinza en milímetros).
- Percepción visual multimodal a partir de dos cámaras RGB (cenital y en ángulo).
- Ejecución de tareas de manipulación fina: recogida e inserción de un tornillo hexagonal en la abertura correspondiente.
- Emisión de *action chunks* de 50 acciones por inferencia, lo que permite control a mayor frecuencia efectiva.
- Condicionamiento por estado propioceptivo: integra los siete valores de articulación y pinza como entrada.
- No dispone de *tool calling*, razonamiento multi-paso explícito, capacidades lingüísticas ni modo *thinking*; es una política puramente motora.

## Casos de uso

- **Prototipado de inserción de precisión en laboratorio**: el modelo se carga con `SmolVLAPolicy.from_pretrained` y se ejecuta sobre el Piper para reproducir la tarea de inserción de tornillo; es adecuado como línea base reproducible antes de escalar a datasets mayores.
- **Investigación en imitación con datasets pequeños**: sirve para estudiar cómo se comporta una política VLA de 450 M de parámetros entrenada con solo 100 demostraciones, y para comparar curvas de aprendizaje en distintos pasos (el autor conserva checkpoints intermedios).
- **Evaluación de robustez ante variaciones de cámara**: al depender de una configuración concreta de cámaras (cenital y en ángulo), permite medir la sensibilidad de la política a cambios de iluminación, encuadre o calibración.
- **Banco de pruebas de pipelines LeRobot**: útil para validar el flujo completo de carga de preprocesadores, normalización de tensores y decodificación de *action chunks* en un entorno controlado.
- **Docencia y formación en robótica de manipulación**: ejemplo didáctico de extremo a extremo, desde teleoperación y dataset hasta política desplegada, con procedencia y hashes auditables.
- **Punto de partida para *fine-tuning* en tareas similares**: al conservar configuración y pesos originales, puede reutilizarse como inicialización para otras tareas de ensamblaje con el mismo robot, aunque requerirá recolectar nuevas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito de inserción, métricas de error de posición ni comparaciones cuantitativas con otras políticas; el autor indica explícitamente que la publicación no establece éxito físico de inserción ni robustez.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 450 M de parámetros en fp32, el peso ocupa aproximadamente 1,8 GB; en fp16, unos 0,9 GB, más el coste de los procesadores visuales y de los tensores de normalización.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo, pero no hay datos de latencia ni de throughput publicados.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no está verificado en la documentación.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot.policies.smolvla.modeling_smolvla.SmolVLAPolicy`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas VLA (por ejemplo, variantes de OpenVLA, Octo o π0) ni datos de rendimiento que permitan una comparación rigurosa. La única referencia interna es el propio SmolVLA base, del que este checkpoint es un ajuste fino.

## Limitaciones y advertencias

- **Sin validación física**: el autor advierte que la verificación cubre el paso de entrenamiento y la integridad de los ficheros, pero no el éxito real de la inserción ni la robustez en producción.
- **Dependencia de la configuración de cámaras**: el modelo asume la configuración concreta de cámaras cenital y en ángulo, las unidades documentadas (grados y milímetros) y el bloqueo de la articulación 4; desviarse de ello degradará el comportamiento.
- **Licencia no definida**: la subida no asigna licencia nueva, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor o con los titulares originales de SmolVLA.
- **Dataset pequeño y específico**: 100 demostraciones de una única tarea; se espera poca generalización a otras posiciones, tornillos o entornos.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, con riesgo de colisión o daño al efector.
- **Procedencia del paso**: el `train_config.json` indica `steps: 20000` como objetivo y el `pretrained_path` termina en `000050/pretrained_model`; el autor aclara que ninguno de esos campos identifica el paso guardado, que es 18.000. Conviene no confundirlos al reanudar entrenamientos.
- **Estado de entrenamiento incompleto**: el export de inferencia no incluye optimizador, scheduler ni estado RNG, por lo que no es reanudable tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch64-step18000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- Ficheros de procedencia en el repo: `model_identity.json`, `training_step.json`, `checkpoint_info.json`, `publication_manifest.json`, `train_config.json`
- Librería LeRobot (referencia de carga): no se proporciona URL en la información disponible.
