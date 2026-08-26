# birbirll/g1-inspire-nut-in-box-pi05

## Resumen

El modelo `birbirll/g1-inspire-nut-in-box-pi05` es un fine-tune completo de π0.5 (3.6B parámetros), un modelo fundacional de visión-lenguaje-acción (VLA) desarrollado por Qualcomm, adaptado por el autor birbirll (Peiyu Song) para una tarea específica de manipulación robótica: recoger una tuerca con unas pinzas y colocarla en una caja, utilizando un robot humanoide Unitree G1 con manos diestras Inspire. El modelo se entrena con el framework openpi en su ruta PyTorch, sobre un conjunto de datos propio de 29 episodios exitosos (aproximadamente 58 000 fotogramas a 60 fps) capturados mediante teleoperación.

La relevancia de este modelo radica en demostrar cómo un VLA generalista puede adaptarse de forma eficiente a una tarea concreta con una cantidad muy limitada de datos, aplicando técnicas como el dropout de tokens de estado como regularizador anti-atajo. El resultado es un controlador de baja latencia y alta precisión para una tarea de manipulación fina, con métricas de error notablemente inferiores a las de modelos comparables entrenados sobre el mismo conjunto de datos. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, listo para cargarse mediante openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (VLA basado en transformer, co-entrenado con datos de visión, lenguaje y acción) |
| Parametros totales | 3 616 757 520 (3,6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (modelo de acción robótica, sin interfaz de lenguaje directa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π0.5 es un modelo de visión-lenguaje-acción (VLA) que co-entrena sobre datos diversos: demostraciones robóticas, datos web y subtareas semánticas, lo que le permite generalizar a entornos abiertos para manipulación robótica de largo horizonte. El fine-tune aquí presentado se realiza sobre la arquitectura base de π0.5 con 3.6B parámetros, usando el framework openpi en su ruta PyTorch con la configuración `pi05_g1_nut_full`.

El entrenamiento se llevó a cabo sobre un conjunto de datos propio (29 episodios exitosos, ~58 000 fotogramas a 60 fps) con dos cámaras: una cámara head a 1280×720 y dos cámaras fisheye en las muñecas a 1920×1080, redimensionadas internamente a 224×224 por openpi. El estado del robot se representa como un vector de 34 dimensiones (cuerpo + IMU) que se entrega como tokens discretos de prompt, con un dropout de tokens de estado de p=0.8 durante el entrenamiento (en inferencia siempre se proporciona el estado completo) como regularizador anti-atajo.

Las acciones se definen en un espacio de 27 dimensiones: 14 para los brazos, 6 para los registros de la mano derecha Inspire, 4 para altura de la base, velocidad lineal en xy y velocidad de guiñada, y 3 para la cintura. Se usan acciones absolutas (`use_delta_actions=False`), horizonte de 30 pasos y normalización por cuantiles (q01/q99). El entrenamiento duró 20 000 pasos con batch de 32, optimizador AdamW (β2=0.95), warmup coseno de 1000 pasos hasta un pico de learning rate de 2.5e-5, con horizonte de decaimiento de 30 000 pasos hasta un LR final de ~8e-6, en precisión bf16 sobre una única GPU B200. El checkpoint final (paso 20 000) incluye pesos, estadísticas de normalización y metadatos, sin estado de optimizador.

## Capacidades

- Ejecución de la tarea específica de "nut in box": recoger una tuerca con pinzas y depositarla en una caja, con control preciso de brazo, muñeca y mano.
- Control de acciones absolutas en 27 dimensiones, incluyendo brazos, mano derecha Inspire, base, velocidad y cintura, con horizonte de 30 pasos.
- Integración de estado del robot (34-D) como entrada al modelo, con uso de dropout solo en entrenamiento para evitar atajos.
- Procesamiento de imágenes de múltiples cámaras (head y muñecas) para percepción visual.
- Inferencia de baja latencia apta para control en tiempo real de robots humanoides.
- Capacidad de carga mediante openpi con `create_trained_policy`, incluyendo las estadísticas de normalización empaquetadas en `assets/`.

## Casos de uso

- Automatización de tareas de ensamblaje de precisión: el modelo puede controlar un robot humanoide para manipular piezas pequeñas (como tuercas) y colocarlas en posiciones exactas, reduciendo el tiempo de ciclo en líneas de producción.
- Investigación en VLA y aprendizaje por imitación: sirve como referencia para estudiar cómo adaptar modelos fundacionales de robótica a tareas específicas con pocos datos, gracias a su documentación detallada de entrenamiento y métricas.
- Teleoperación asistida: el modelo puede utilizarse como política de control en sistemas de teleoperación para tareas de manipulación fina, mejorando la precisión y reduciendo la carga cognitiva del operador.
- Desarrollo de robots humanoides para laboratorios: permite probar capacidades de manipulación diestra en plataformas Unitree G1 con manos Inspire, sin necesidad de entrenar desde cero.
- Benchmarking de modelos VLA: al estar disponible con métricas de error y comparativas con otros modelos (GR00T N1.6), es útil para evaluar el rendimiento relativo de arquitecturas de control robótico.
- Educación y formación en robótica: el modelo y su configuración de entrenamiento pueden usarse en cursos avanzados de robótica para ilustrar el fine-tuning de VLA con datos limitados.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de error en modo open-loop (3 episodios, 15 fotogramas de prueba, comparados con las acciones ground truth del dataset). Los resultados se resumen a continuación:

| Metrica | Valor π0.5 | Comparativa GR00T N1.6 |
|---|---|---|
| Error RMS brazos | 0.004 / 0.010 rad | 4-5x mayor |
| Error RMS mano (escala 0-1000) | ~2.0 registros | 4-5x mayor |
| Error RMS cintura | 0.002 rad | 4-5x mayor |
| Error RMS base | 0.011 | 4-5x mayor |
| Correlacion | 1.00 en todos los grupos | no disponible |

El autor indica que el rendimiento es monótono a través de los pasos 16k/18k/20k, lo que sugiere convergencia estable. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo está especializado en control robótico y no en tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3.6B parámetros en bf16, lo que supone aproximadamente 7 GB solo para los pesos. Sin embargo, al procesar imágenes de múltiples cámaras y mantener el estado interno, se recomienda al menos 16 GB de VRAM para una inferencia fluida.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es suficiente para inferencia en tiempo real. Para entrenamiento se usó una B200 (no disponible comercialmente para la mayoría de usuarios), pero con batch reducido podría entrenarse en GPUs con 24-48 GB.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 3090/4090 y similares con cuantización o con batch de 1.
- Opciones de despliegue: el modelo se carga mediante openpi (`create_trained_policy`), que soporta inferencia en PyTorch. También puede exportarse a otros formatos si se requiere, aunque no se documentan en la model card.
- Latencia y throughput: no se proporcionan datos numéricos, pero al ser un modelo de 3.6B y con horizonte de 30 pasos, se espera una latencia en el rango de decenas de milisegundos en GPUs modernas, adecuada para control en tiempo real.

## Comparativa con modelos similares

El autor menciona dos modelos hermanos, `g1-inspire-nut-in-box-n16-abs` y `g1-inspire-nut-in-box-n16-rel`, que son fine-tunes de GR00T N1.6 (presumiblemente otro VLA) entrenados sobre el mismo conjunto de datos y con el mismo contrato de acciones. La comparativa se centra en la precisión:

| Modelo | Parámetros | Error RMS brazos | Error RMS mano | Licencia |
|---|---|---|---|---|
| π0.5 (este modelo) | 3.6B | 0.004-0.010 rad | ~2.0 | Apache 2.0 |
| GR00T N1.6 (abs) | no disponible | 4-5x mayor | 4-5x mayor | no disponible |
| GR00T N1.6 (rel) | no disponible | 4-5x mayor | 4-5x mayor | no disponible |

El modelo π0.5 muestra una precisión significativamente mayor (4-5 veces menor error) que los modelos GR00T N1.6 en todas las métricas evaluadas, lo que sugiere una mejor adaptación a la tarea. No se dispone de comparación con el π0.5 base sin fine-tune, ya que no se publican esos datos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "nut in box" con pinzas en un robot Unitree G1 con manos Inspire; no generaliza a otras tareas o configuraciones de robot sin un nuevo fine-tune.
- El conjunto de datos de entrenamiento es muy reducido (29 episodios), lo que puede provocar sobreajuste a las condiciones específicas de captura (iluminación, posición de cámara, texturas de los objetos).
- No se han evaluado sesgos de comportamiento, pero al ser un modelo de control robótico, los riesgos de sesgo se limitan a las variaciones del entorno de entrenamiento.
- Riesgo de alucinación en acciones: si el estado del robot se desvía de lo visto en entrenamiento, el modelo podría generar comandos no seguros; se recomienda supervisión humana o mecanismos de seguridad en despliegues reales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en entornos de producción.
- No se proporcionan métricas de robustez ante perturbaciones (ruido en sensores, cambios de iluminación, etc.), por lo que su uso en entornos dinámicos requiere validación adicional.
- El modelo depende del framework openpi y de las estadísticas de normalización incluidas en `assets/`; si se usan configuraciones con distinto `repo_id`, hay que pasar explícitamente esas estadísticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/birbirll/g1-inspire-nut-in-box-pi05
- Perfil del autor: https://huggingface.co/birbirll/models
- Modelo hermano GR00T N1.6 (pistón): https://huggingface.co/birbirll/g1-inspire-piston-n16
- Documentación de π0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Dataset relacionado (pistón): https://claru.ai/datasets/birbirll-g1-inspire-piston-pick-place
- Repositorio de modelos de Qualcomm AI Hub (incluye π0.5): https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
