# sadjava/smolvla-libero-goal-peft-t0-n10-s2000

## Resumen

El modelo `sadjava/smolvla-libero-goal-peft-t0-n10-s2000` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario `sadjava`. Según los metadatos, se trata de un adaptador entrenado sobre un modelo base identificado como `outputs/smolvla_libero90_100k/checkpoints/last/pretrained_model`, lo que sugiere que está diseñado para ajustar un modelo VLA (Vision-Language-Action) de la familia SmolVLA, probablemente orientado a tareas de manipulación robótica en el benchmark LIBERO. El nombre del repositorio indica una configuración concreta: tarea 0, 10 demostraciones y semilla 2000, aunque no se aporta documentación que confirme estos detalles.

La información pública es extremadamente limitada: la model card está prácticamente vacía, no se especifican arquitectura, parámetros, licencia, idiomas ni datos de entrenamiento. El repositorio tiene un tamaño declarado de 0.0 GB y no registra descargas ni interacciones. Esto impide realizar una evaluación técnica rigurosa del modelo y obliga a tratar cualquier afirmación sobre sus capacidades como especulativa.

A pesar de la escasez de datos, el uso de la librería PEFT y el tag `lora` confirman que se trata de un adaptador de bajo rango, no de un modelo completo. Su utilidad práctica depende del modelo base al que se aplique, que tampoco está documentado en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA, según tags) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura del modelo base ni el procedimiento de entrenamiento. Los únicos datos son los tags: `peft`, `lora` y `base_model:adapter:outputs/smolvla_libero90_100k/checkpoints/last/pretrained_model`. Esto indica que el adaptador se generó mediante fine-tuning con LoRA sobre un checkpoint llamado `smolvla_libero90_100k`, probablemente entrenado en el benchmark LIBERO (90 tareas, 100k demostraciones). Sin embargo, no se especifican hiperparámetros, número de tokens, composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla el tipo de modelo base (SmolVLA, SmolVLM, etc.) ni su tamaño.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Por el nombre del repositorio, se puede inferir que está orientado a tareas de robótica con instrucciones en lenguaje natural y percepción visual (VLA), pero no hay documentación que lo confirme. No se puede afirmar que soporte generación de texto, tool calling, agentes o cualquier otra funcionalidad sin datos que lo respalden.

## Casos de uso

No disponible. Al carecer de documentación sobre el modelo base y el adaptador, no es posible proponer casos de uso concretos y fiables. Cualquier aplicación práctica requeriría primero conocer el modelo base, el benchmark de entrenamiento y los resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No disponible. El tamaño del adaptador es de 0.0 GB según el repositorio, pero al desconocer el modelo base, no se puede estimar la VRAM necesaria, las GPUs recomendadas ni las opciones de despliegue. Los adaptadores LoRA suelen ser ligeros y se aplican sobre un modelo base que domina los requisitos de hardware, pero sin conocer ese modelo base no es posible dar cifras.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con los que contrastar, dado que no se dispone de información sobre el modelo base ni sobre otros adaptadores similares.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card no contiene información técnica, de entrenamiento, evaluación o licencia.
- El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que el adaptador es muy pequeño, pero no se puede verificar su contenido sin descargarlo.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial ni la redistribución.
- Al ser un adaptador LoRA, su funcionamiento depende críticamente del modelo base. Sin conocer ese modelo base, el adaptador es inutilizable en la práctica.
- No hay métricas de rendimiento ni evaluaciones publicadas, por lo que no se puede validar su calidad o fiabilidad.
- El tag `arxiv:1910.09700` hace referencia al paper de Lacoste et al. sobre estimación de emisiones de carbono, no a la arquitectura del modelo.

## Enlaces

- [HuggingFace: sadjava/smolvla-libero-goal-peft-t0-n10-s2000](https://huggingface.co/sadjava/smolvla-libero-goal-peft-t0-n10-s2000)
