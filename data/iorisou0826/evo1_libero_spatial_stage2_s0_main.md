# IoriSou0826/evo1_libero_spatial_stage2_s0_main

## Resumen

Evo-1 es un modelo de visión-lenguaje-acción (VLA) ligero desarrollado por el equipo MINT-SJTU, diseñado para reducir el coste de entrenamiento y permitir despliegue en tiempo real en robots. Este checkpoint concreto, subido por el usuario IoriSou0826, corresponde a la etapa 2 de entrenamiento sobre el benchmark LIBERO Spatial, con 65.000 pasos de optimización. Utiliza un backbone InternVL3-1B como base multimodal y una cabeza de acción basada en flow-matching (DiT), lo que le permite generar comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. Con 776 millones de parámetros, se posiciona como una alternativa compacta frente a otros VLA de mayor tamaño, manteniendo capacidades de razonamiento espacial y control robótico.

La relevancia de este modelo radica en su enfoque de entrenamiento de bajo coste y su integración nativa con el ecosistema LeRobot, lo que facilita su uso en investigación y desarrollo de políticas de manipulación. Al estar entrenado específicamente en la suite LIBERO Spatial, está optimizado para tareas que requieren comprensión espacial, como colocar objetos en posiciones relativas o responder a instrucciones con referencias espaciales. El checkpoint incluye los artefactos de inferencia (config, pesos y procesadores) pero no el estado del optimizador, por lo que está listo para evaluación o fine-tuning adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone InternVL3-1B y cabeza de acción flow-matching (DiT) |
| Parametros totales | 776.139.440 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Evo-1 adopta un backbone unificado de visión-lenguaje (InternVL3-1B) preentrenado bajo un paradigma multimodal de una sola etapa, donde las representaciones perceptuales y lingüísticas se aprenden conjuntamente sin necesidad de alineación posterior. La cabeza de acción es un modelo de flujo (flow-matching) basado en arquitectura DiT, que convierte las representaciones multimodales en secuencias de acciones de control. Esta combinación permite un entrenamiento eficiente y una inferencia de baja latencia, adecuada para aplicaciones en tiempo real.

El entrenamiento sigue una receta de dos etapas: primero se entrena únicamente la cabeza de acción durante 5.000 pasos, y posteriormente se realiza un fine-tuning conjunto del VLM y la cabeza. Este checkpoint corresponde a la etapa 2, con 65.000 pasos de optimización, batch size de 16, warmup de 1.000 pasos, dropout 0.0 y semilla 0. El dataset utilizado es `libero_spatial` con imágenes RGB planas (sin aumento de datos USDA). El modelo se inicializó desde un checkpoint de la etapa 1 (`evo1-libero-spatial-stage1-bs16-10k`). No se especifican detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad (posición y orientación del efector) a partir de observaciones visuales y comandos en lenguaje natural.
- Comprensión de escenas visuales y razonamiento espacial, incluyendo relaciones como "izquierda", "derecha", "cerca de", "lejos de", etc.
- Ejecución de tareas de manipulación en el simulador LIBERO, como recoger, colocar, apilar o mover objetos según instrucciones.
- Integración con el framework LeRobot para carga directa del checkpoint y despliegue en entornos robóticos.
- Soporte para fine-tuning adicional mediante técnicas como SFT o GRPO, como se documenta en la integración con RLinf.
- Capacidad de procesamiento multimodal unificado, al compartir representaciones entre visión y lenguaje sin módulos de alineación separados.

## Casos de uso

- Investigación en robótica de manipulación: el modelo puede utilizarse como política base para estudiar estrategias de control en el simulador LIBERO, permitiendo comparar con otros enfoques VLA.
- Desarrollo de pipelines de aprendizaje por refuerzo: gracias a su integración con RLinf, se puede usar como punto de partida para fine-tuning con GRPO en tareas espaciales, acelerando la convergencia.
- Evaluación de generalización espacial: al estar entrenado en LIBERO Spatial, es adecuado para probar la capacidad de un modelo de comprender y ejecutar instrucciones con referencias espaciales en entornos simulados.
- Prototipado de sistemas de control robotico: su tamaño compacto (776M parámetros) permite ejecutarlo en GPUs de gama media, facilitando pruebas rápidas en laboratorio.
- Benchmarking de modelos VLA ligeros: sirve como referencia para comparar el rendimiento de arquitecturas eficientes frente a modelos más grandes como OpenVLA o RT-2.
- Entrenamiento de políticas transferibles: aunque está entrenado en simulación, puede servir como inicialización para fine-tuning en entornos reales con datos propios, gracias a su bajo coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la informacion disponible. El paper de Evo-1 (arXiv:2511.04555) reporta evaluaciones en LIBERO, pero no se dispone de los números desglosados para esta variante concreta (stage2, 65k pasos, LIBERO Spatial). Se recomienda consultar el repositorio oficial para obtener métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 776M parámetros, en FP16 se requieren aproximadamente 1,6 GB solo para los pesos, más overhead de activaciones y memoria del runtime. Se estima un consumo total de 3-5 GB, por lo que es viable en GPUs consumer con 8 GB o más.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10 o A100 para mayor throughput.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con al menos 8 GB de VRAM.
- Opciones de despliegue: el modelo se carga mediante LeRobot (`policy.path=<this-repo>`). También puede integrarse con frameworks de inferencia como vLLM o TGI si se adapta el formato, aunque no hay documentación oficial al respecto.
- Latencia y throughput: no se dispone de datos oficiales, pero por su tamaño compacto y arquitectura flow-matching, se espera una latencia de decenas de milisegundos por paso en hardware moderno.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. Sin embargo, se puede contextualizar frente a alternativas conocidas:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Evo-1 (este checkpoint) | 776M | no disponible | LIBERO Spatial, 65k pasos | no disponible |
| OpenVLA | 7B | no disponible | RLHF sobre datos robóticos | no disponible |
| RT-2 | 55B | no disponible | Web-scale + robótica | no disponible |

Evo-1 se distingue por su menor tamaño y su enfoque de entrenamiento de bajo coste, lo que lo hace más accesible para laboratorios con recursos limitados. No obstante, carece de la generalización a tareas diversas que ofrecen modelos más grandes.

## Limitaciones y advertencias

- Entrenado exclusivamente en el simulador LIBERO Spatial, por lo que su capacidad de generalización a otros entornos o tareas no espaciales es limitada.
- No se especifica licencia, lo que impide determinar si es apto para uso comercial o requiere permisos adicionales.
- No hay información sobre sesgos o alucinaciones, pero al ser un modelo entrenado en datos simulados, puede presentar comportamientos erráticos ante escenarios fuera de distribución.
- La longitud de contexto no está documentada, lo que dificulta estimar su capacidad para manejar instrucciones largas o historiales de interacción.
- El checkpoint no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento directamente desde este archivo.
- No se han publicado resultados de benchmarks para esta variante concreta, lo que limita la comparabilidad objetiva con otros modelos.

## Enlaces

- [HuggingFace - IoriSou0826/evo1_libero_spatial_stage2_s0_main](https://huggingface.co/IoriSou0826/evo1_libero_spatial_stage2_s0_main)
- [GitHub - MINT-SJTU/Evo-1](https://github.com/MINT-SJTU/Evo-1)
- [arXiv - Evo-1: Lightweight Vision-Language-Action Model](https://arxiv.org/abs/2511.04555)
- [HuggingFace - zuoxingdong/evo1_libero (checkpoint similar)](https://huggingface.co/zuoxingdong/evo1_libero)
- [RLinf documentation - RL on Evo-1 Models](https://rlinf.readthedocs.io/en/latest/rst_source/examples/embodied/evo1.html)
