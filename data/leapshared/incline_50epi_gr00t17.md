# leapshared/Incline_50epi_GR00T17

## Resumen

`leapshared/Incline_50epi_GR00T17` es un ajuste fino (fine-tuning) del modelo base `nvidia/GR00T-N1.7-3B` de NVIDIA, desarrollado por el usuario `leapshared`. Está orientado a la robótica, concretamente a la manipulación bimanual con brazos OpenArm en tareas de inclinación. El modelo se ha entrenado sobre un dataset propio de 50 episodios con 62.210 frames a 30 fps, capturados con tres cámaras. El resultado es una política visuomotora que toma imágenes y genera acciones absolutas para el robot.

El modelo tiene 3.144.016.000 parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Se publica en el ecosistema LeRobot, con pesos en formato safetensors. La relevancia de este trabajo radica en demostrar cómo adaptar un modelo de robótica de código abierto a tareas específicas mediante fine-tuning, ofreciendo además checkpoints intermedios para comparación paso a paso. No se especifican detalles sobre la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en NVIDIA GR00T-N1.7-3B) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `nvidia/GR00T-N1.7-3B`, un modelo de robótica multimodal de NVIDIA. En este ajuste, el backbone (LLM y vision tower) se mantiene congelado, y solo se entrenan el proyector, el modelo de difusión y la normalización de capa del módulo visión-lenguaje. La política se define como `groot_frozen_bf16` (backbone congelado en bf16). El entrenamiento se realizó sobre el dataset `leapshared/Incline_20260901_221322`, compuesto por 50 episodios de manipulación bimanual con OpenArm, con 62.210 frames a 30 fps, usando cámaras `follower_d455f`, `left_wrist` y `right_wrist`. El espacio de acción es absoluto (`use_relative_actions=false`), con `chunk_size=40` y `n_action_steps=40`.

El optimizador fue fused AdamW con learning rate 1e-4, weight decay 1e-5 y grad clip 1.0. Se usó un schedule coseno con 500 pasos de warmup, batch size 16 y seed 42. El run estaba planificado para 62.210 pasos (16 épocas) pero se detuvo en el paso 43.134 (~11,1 épocas), con pérdida estabilizada en 0.010–0.011 y learning rate decayido a 2.3e-5. Hubo un corte de energía en el paso 12.658 que obligó a reanudar desde el checkpoint 010369, por lo que los pasos 10.369–12.658 se entrenaron dos veces con distinto orden de datos; los checkpoints posteriores al 020738 no se ven afectados. Se publican checkpoints en los pasos 010369, 020738, 031107 y 041476 (este último en la rama por defecto).

## Capacidades

- Control de robots bimanuales: el modelo genera acciones para dos brazos OpenArm a partir de imágenes de cámaras, orientado a tareas de manipulación en superficies inclinadas.
- Percepción visual: procesa imágenes de tres cámaras (frontal y dos muñecas) para decidir las acciones.
- Política visuomotora: integra visión y lenguaje (aunque no se detallan las capacidades lingüísticas del modelo base) para producir comandos de actuación.
- Generación de acciones absolutas: usa `chunk_size=40` y `n_action_steps=40`, lo que permite planificar secuencias de 40 pasos de acción.
- Fine-tuning específico: adaptado a un dataset concreto de inclinación, lo que puede mejorar el rendimiento en esa tarea frente al modelo base.
- Compatibilidad con LeRobot: se integra con la librería LeRobot, facilitando su uso en pipelines de robótica.

No se indican capacidades de tool calling, agentes, multilingüismo ni modos de pensamiento especiales.

## Casos de uso

- Manipulación de objetos en pendientes: el modelo puede controlar un brazo robótico para recoger o desplazar objetos sobre superficies inclinadas, gracias a su entrenamiento específico en ese escenario.
- Vertido de líquidos: en tareas donde se requiere inclinar un recipiente, el modelo puede gestionar la orientación y el movimiento de ambos brazos para verter sin derrames.
- Ensamblaje en entornos no horizontales: útil en líneas de montaje donde las piezas se presentan en ángulos, permitiendo ajustar la posición de las pinzas con precisión.
- Investigación en robótica: sirve como punto de partida para estudiar el efecto del fine-tuning sobre el modelo base GR00T en tareas bimanuales, comparando checkpoints intermedios.
- Desarrollo de políticas de control para OpenArm: el modelo proporciona una base para implementar controladores en robots OpenArm sin necesidad de entrenar desde cero.
- Evaluación de robustez: al tener checkpoints en distintas fases de entrenamiento, permite analizar la evolución del rendimiento y la estabilidad del aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan datos específicos sobre VRAM, GPUs recomendadas o latencia en la model card.
- El modelo tiene 3.144.016.000 parámetros y se almacena en bf16, por lo que un peso en bf16 ocuparía aproximadamente 6,3 GB. Con overhead de inferencia, se estima que podría caber en GPUs de consumo con 8-12 GB de VRAM, como una RTX 3080 o superior, aunque no hay confirmación oficial.
- Para despliegue, al ser un modelo de LeRobot, se puede utilizar con la librería LeRobot y potencialmente con frameworks como vLLM o TGI si se adapta, pero no se indica compatibilidad explícita.
- Dado que el backbone está congelado, la inferencia podría ser más ligera que un modelo completo, pero no hay mediciones disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el modelo base `nvidia/GR00T-N1.7-3B` tiene la misma arquitectura y tamaño, pero sin el fine-tuning específico para inclinación. Otro fine-tuning de la misma autora, `leapshared/nuedive_test_60epi_new_20260824_182026_GR00T17`, aparece en los resultados de búsqueda pero no se aportan detalles. Por tanto, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la generalización a otras tareas o entornos distintos al de inclinación.
- El modelo está especializado en manipulación bimanual con OpenArm; su uso en otros robots o configuraciones requeriría adaptación.
- El corte de energía durante el entrenamiento afectó a un rango de pasos, aunque los checkpoints posteriores al 020738 no se ven afectados; aun así, se recomienda verificar el comportamiento en el checkpoint 041476.
- No se documentan sesgos ni riesgos de alucinación, pero al tratarse de un modelo de control robótico, cualquier error en la generación de acciones puede implicar riesgos físicos en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos del modelo base `nvidia/GR00T-N1.7-3B` para asegurar el cumplimiento de sus condiciones adicionales.
- No se especifican limitaciones de idioma ni de contexto, por lo que no se puede garantizar su comportamiento en tareas que requieran comprensión lingüística extensa.

## Enlaces

- [HuggingFace: leapshared/Incline_50epi_GR00T17](https://huggingface.co/leapshared/Incline_50epi_GR00T17)
- [Modelo base: nvidia/GR00T-N1.7-3B](https://huggingface.co/nvidia/GR00T-N1.7-3B) (referencia)
- [Dataset: leapshared/Incline_20260901_221322](https://huggingface.co/datasets/leapshared/Incline_20260901_221322) (referencia, no se proporciona URL exacta)
