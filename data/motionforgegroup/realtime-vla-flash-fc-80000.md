# MotionforgeGroup/realtime-vla-flash-FC-80000

## Resumen

Realtime-VLA-Flash Factory Conveyor checkpoint (identificador `MotionforgeGroup/realtime-vla-flash-FC-80000`) es un modelo de visión-lenguaje-acción (VLA) desarrollado por MotionforgeGroup, diseñado específicamente para el control de robots en entornos de fabricación, en concreto para tareas de cinta transportadora (factory conveyor). Se trata de un ajuste fino (fine-tuning) del modelo OpenPI PyTorch PI0.5, realizado durante 80 000 pasos de entrenamiento, con los adaptadores LoRA fusionados en los pesos lineales base, de modo que el archivo `model.safetensors` no contiene parámetros LoRA ni nombres de envoltorio LoRA.

El modelo se enmarca dentro del framework Realtime-VLA FLASH, una propuesta de inferencia especulativa para VLAs basados en difusión que reduce drásticamente la latencia de replanificación. En lugar de ejecutar la inferencia completa en cada paso, el framework utiliza un modelo ligero de borrador (draft) y verifica en paralelo con el modelo principal, devolviendo el prefijo consistente más largo. Esto permite alcanzar latencias de hasta 7,8 ms con dos vistas, lo que equivale a más de 125 Hz de inferencia en tiempo real. El checkpoint concreto aquí descrito está especializado en la tarea de conveyor, lo que lo hace adecuado para aplicaciones industriales de automatización robótica.

La arquitectura combina un variante `paligemma_variant=gemma_2b` para el modelo de visión-lenguaje y `action_expert_variant=gemma_300m` para el experto de acción, sumando un total de 3 616 757 520 parámetros. El repositorio ocupa 7,5 GB y los pesos están en formato safetensors. No se dispone de información pública sobre la licencia, los idiomas soportados ni la longitud de contexto, por lo que estos aspectos quedan sin especificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenPI PyTorch PI0.5 (VLA basado en difusión) con `paligemma_variant=gemma_2b` y `action_expert_variant=gemma_300m` |
| Parametros totales | 3 616 757 520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA (vision-language-action) basado en difusión, concretamente una variante del OpenPI PI0.5. La arquitectura se compone de dos módulos principales: un modelo de visión-lenguaje con variante Gemma 2B (configuración `paligemma_variant=gemma_2b`) y un experto de acción con variante Gemma 300M (`action_expert_variant=gemma_300m`). El entrenamiento se realizó mediante fine-tuning sobre el checkpoint base de OpenPI, con 80 000 pasos de optimización para la tarea específica de factory conveyor. Los adaptadores LoRA se fusionaron en los pesos lineales base, lo que simplifica el despliegue al eliminar la necesidad de cargar pesos LoRA por separado.

El framework Realtime-VLA FLASH introduce una innovación clave: la inferencia especulativa. En lugar de ejecutar la inferencia completa del modelo de difusión en cada ciclo de replanificación, se utiliza un modelo borrador ligero que genera una secuencia candidata de acciones. Esta secuencia se verifica en paralelo mediante el experto de acción del modelo principal, y se devuelve el prefijo más largo que sea consistente con la verificación. Además, se implementa un mecanismo de respaldo dependiente de la fase (phase-aware fallback): si el borrador produce errores que el modelo principal detecta (por ejemplo, en ajustes finales como cambios de pinza), se recurre a la inferencia completa de mayor fidelidad. Este enfoque reduce el número de llamadas a la inferencia completa durante la replanificación, logrando una aceleración media de 3,04× a nivel de tarea según el paper.

No se dispone de información pública sobre la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se centró exclusivamente en la tarea de conveyor, por lo que el modelo no es generalista.

## Capacidades

- Control de robots para tareas de cinta transportadora (factory conveyor), incluyendo seguimiento de objetos, recogida y colocación.
- Inferencia en tiempo real con latencia de 7,8 ms (con dos vistas), alcanzando más de 125 Hz de frecuencia de replanificación.
- Soporte de múltiples vistas (al menos dos cámaras) para la percepción del entorno.
- Integración con el framework FLASH de Realtime-VLA, que incluye kernels Triton personalizados para servir el modelo de forma eficiente.
- Capacidad de ejecutar inferencia especulativa con verificación paralela, lo que permite un equilibrio entre velocidad y precisión.
- No se ha documentado soporte para tool calling, agentes multi-paso, razonamiento simbólico ni capacidades multimodales más allá de visión y acción.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede controlar un brazo robótico para recoger piezas de una cinta transportadora y colocarlas en posiciones precisas, aprovechando la baja latencia para reaccionar a cambios en la velocidad o posición de los objetos.
- Inspección y clasificación de productos: con las dos vistas, el sistema puede detectar defectos o variaciones en los artículos y decidir en tiempo real si deben desviarse a un carril de rechazo o continuar en la línea.
- Paletización y empaquetado: el robot puede planificar y ejecutar secuencias de agarre y apilado de cajas o paquetes que se mueven por la cinta, ajustando la trayectoria según la posición actual de cada elemento.
- Control de calidad con ajuste fino: en tareas donde se requiere un cambio de pinza o una manipulación delicada, el mecanismo de respaldo por fases garantiza que los movimientos finales sean de alta fidelidad, evitando errores de posicionamiento.
- Investigación en robótica industrial: el checkpoint sirve como punto de partida para experimentos sobre inferencia especulativa en VLAs, permitiendo reproducir los resultados del paper Realtime-VLA FLASH en escenarios de conveyor.
- Prototipado de sistemas de control en tiempo real: al estar optimizado para baja latencia, puede integrarse en entornos de simulación o en robots reales con requisitos estrictos de ciclo de control (por ejemplo, 125 Hz), sin necesidad de hardware especializado de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o GSM8K) para este checkpoint en la información disponible. Sin embargo, el paper asociado a Realtime-VLA FLASH reporta métricas de rendimiento específicas del framework:

| Metrica | Valor |
|---|---|
| Latencia de inferencia (2 vistas) | 7,8 ms |
| Frecuencia de inferencia | > 125 Hz |
| Aceleración media a nivel de tarea | 3,04× |

Estos datos corresponden al framework general y no necesariamente a este checkpoint concreto de conveyor, aunque el modelo está diseñado para funcionar dentro de dicho framework.

## Requisitos de hardware

- El modelo tiene 3,6 mil millones de parámetros, por lo que en precisión FP16 ocuparía aproximadamente 7,2 GB de VRAM. Con cuantización a 8 bits podría reducirse a unos 3,6 GB, y a 4 bits a unos 1,8 GB, aunque no se han publicado cuantizaciones oficiales.
- Para inferencia en tiempo real con el framework FLASH (que requiere ejecutar el modelo borrador y el modelo principal en paralelo), se recomienda una GPU con al menos 16 GB de VRAM, como una NVIDIA RTX 4090, A100 (40 GB) o H100.
- En GPUs de consumo como la RTX 3090 o RTX 4080 (12-24 GB) podría ejecutarse con cuantización, pero la latencia podría aumentar si no se dispone de suficiente memoria para el modelo completo en FP16.
- Opciones de despliegue: el framework FLASH se sirve con kernels Triton personalizados, por lo que es compatible con entornos PyTorch y posiblemente con vLLM o TGI si se adaptan. No se menciona soporte para llama.cpp u Ollama, dado que el modelo no es un LLM puro sino un VLA.
- La latencia de 7,8 ms se logró presumiblemente en hardware de gama alta (A100 o similar) con dos vistas de cámara. En hardware inferior, la frecuencia podría reducirse.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos VLA en la misma categoría (por ejemplo, OpenVLA, RT-2 o PI0). El checkpoint es un fine-tuning específico de OpenPI PI0.5, y no se han publicado resultados comparativos frente a alternativas en la tarea de conveyor. Se recomienda consultar el paper de Realtime-VLA FLASH para obtener comparaciones a nivel de framework, pero no se incluyen aquí por falta de datos concretos.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente para la tarea de factory conveyor. No es generalista y no debe emplearse en otras tareas robóticas o de manipulación sin un reentrenamiento adecuado.
- No se ha publicado información sobre sesgos o alucinaciones. Al ser un modelo de acción, el riesgo de alucinación se manifiesta en la generación de trayectorias incorrectas o inalcanzables, especialmente en entornos no vistos durante el entrenamiento.
- La licencia no está especificada, lo que impide conocer si es posible su uso comercial o si existen restricciones de redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se dispone de datos sobre la longitud de contexto ni sobre los idiomas soportados. El modelo procesa imágenes y genera acciones, por lo que el idioma puede ser irrelevante, pero la falta de documentación es una limitación para su integración en sistemas multilingües.
- El framework FLASH depende de kernels Triton personalizados, lo que puede limitar la portabilidad a otras plataformas (por ejemplo, hardware AMD o móvil).
- El entrenamiento se realizó con LoRA fusionada, lo que simplifica el despliegue, pero no se han publicado los detalles del dataset de entrenamiento ni los hiperparámetros, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MotionforgeGroup/realtime-vla-flash-FC-80000
- Página del proyecto Realtime-VLA FLASH: https://dexmal.github.io/realtime-vla-flash/
- Paper en arXiv: https://arxiv.org/abs/2605.13778
- Versión HTML del paper: https://arxiv.org/html/2605.13778v1
- Repositorio GitHub de Realtime-VLA FLASH: https://github.com/dexmal/realtime-vla-flash
- Organización MotionforgeGroup en HuggingFace: https://huggingface.co/MotionforgeGroup/models
