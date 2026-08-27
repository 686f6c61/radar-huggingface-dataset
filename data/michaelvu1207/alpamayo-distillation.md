# michaelvu1207/alpamayo-distillation

## Resumen

SIMFORGE-D1.5 es un checkpoint destilado del modelo NVIDIA Alpamayo 1.5 10B, un Vision-Language-Action (VLA) de código abierto para conducción autónoma. El modelo, publicado por el usuario michaelvu1207, reduce el tamaño del teacher en un 35% (de 10B a 7.21B parámetros) manteniendo una paridad razonable en razonamiento y rendimiento de conducción. Está diseñado para tareas de robótica y conducción autónoma, con pipeline `robotics` y pesos en formato safetensors. Su relevancia radica en ofrecer una alternativa más ligera y eficiente para despliegue en entornos con recursos limitados, como vehículos de borde, sin sacrificar en exceso la calidad de las trayectorias generadas.

El modelo se basa en la arquitectura del teacher Alpamayo 1.5, que combina percepción visual (cuatro cámaras), razonamiento lingüístico y predicción de acciones de conducción. La destilación se ha realizado mediante un proceso de entrenamiento supervisado sobre el teacher, y los resultados en el benchmark AlpaSim muestran una retención del 93,6% del `scene_score` medio, con una tasa de paso del 75% idéntica a la del modelo original. El checkpoint está pensado para ser usado con la librería transformers y es compatible con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Alpamayo 1.5 10B, VLA) |
| Parametros totales | 7.214.634.610 (7,21B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |
| Modelo base | nvidia/Alpamayo-1.5-10B |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es una destilación del teacher NVIDIA Alpamayo 1.5 10B, un VLA que combina un codificador visual (para procesar imágenes de cámaras), un modelo de lenguaje y una cabeza de acción que predice trayectorias de conducción. En el caso de SIMFORGE-D1.5, el proceso de destilación ha reducido el número de parámetros de 10B a 7,21B, manteniendo la misma arquitectura general del teacher (no se especifican cambios estructurales). El entrenamiento se ha realizado mediante destilación supervisada, donde el modelo estudiante aprende a imitar las salidas del teacher en escenarios de conducción. Según el repositorio relacionado de mu-hashmi, el enfoque típico de destilación en Alpamayo predice aceleración y curvatura de dirección en lugar de waypoints directos, integrando después a través de un modelo cinemático unicycle, lo que produce trayectorias físicamente plausibles. Sin embargo, no se confirma si este checkpoint concreto utiliza exactamente ese esquema.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card solo menciona que es un checkpoint destilado y proporciona resultados de evaluación en el benchmark AlpaSim.

## Capacidades

- Generación de trayectorias de conducción autónoma a partir de observaciones visuales (cuatro cámaras) y posiblemente instrucciones en lenguaje.
- Razonamiento de cadena de causalidad (Chain-of-Causation) heredado del teacher Alpamayo, que permite explicar las decisiones de conducción.
- Predicción de acciones de control (aceleración y curvatura) en lugar de waypoints, lo que facilita la integración con modelos cinemáticos.
- Procesamiento de entradas multimodales (visión y lenguaje) gracias a su naturaleza VLA.
- Inferencia eficiente en comparación con el teacher, con un pico de memoria GPU de 14,42 GiB.
- Compatible con la librería transformers y con endpoints de inferencia estándar.

## Casos de uso

- Conducción autónoma en entornos urbanos: el modelo puede generar trayectorias seguras en escenarios complejos como intersecciones, giros a la derecha, mantenimiento de carril y situaciones con peatones, como se refleja en los 32 escenarios del benchmark AlpaSim.
- Sistemas de asistencia al conductor (ADAS): su menor tamaño y memoria permiten integrarlo en unidades de procesamiento embarcadas para asistencia en tiempo real.
- Simulación de tráfico y validación de políticas de conducción: puede usarse como agente de conducción en simuladores como AlpaSim para evaluar comportamientos en escenarios sintéticos.
- Destilación de modelos para edge computing: sirve como punto de partida para destilar aún más hacia modelos más pequeños para despliegue en hardware de bajo consumo.
- Investigación en VLA y destilación: permite estudiar la transferencia de capacidades de razonamiento y acción de un modelo grande a uno más compacto.
- Generación de datos etiquetados: al igual que el teacher, puede usarse para auto-etiquetar datos de conducción, aunque su menor capacidad podría requerir verificación humana.

## Benchmarks y rendimiento

La model card proporciona resultados del benchmark AlpaSim 0.89.0 sobre 32 escenarios congelados (subconjunto de NuRec96). Se comparan tres sistemas: Alpamayo 1.5 10B (teacher), SIMFORGE-D1.5 (este modelo) y Alpamayo 1.5 + FlashDrive (runtime compilado). Todos se evaluaron con la misma interfaz de cuatro cámaras y configuración de desafío.

| Metrica | Alpamayo 1.5 10B | SIMFORGE-D1.5 | Alpamayo 1.5 + FlashDrive |
|---|---:|---:|---:|
| Mean AlpaSim `scene_score` ↑ | 0,7061 | 0,6608 | 0,5928 |
| Pass rate ↑ | 75,00% | 75,00% | 62,50% |
| At-fault collision rate ↓ | 9,38% | 12,50% | 9,38% |
| Off-road rate ↓ | 15,62% | 12,50% | 28,12% |
| Mean route progress ↑ | 0,7816 | 0,7308 | 0,7826 |
| Mean distance to GT trajectory ↓ | 3,1804 m | 2,5007 m | 3,0313 m |
| Coverage | 32/32 | 32/32 | 32/32 |
| Infrastructure failures | 0 | 0 | 0 |
| Eight-GPU wall time | 1h 29m | 47m 21s | 43m 51s |
| Observed model/runtime memory | 35,0 GiB max per GPU incl. AlpaSim | 14,42 GiB model peak | 20,81 GiB model peak |

SIMFORGE-D1.5 retiene el 93,6% del `scene_score` medio del teacher, iguala su tasa de paso (75%) y consigue la menor tasa de salida de carretera (12,50%) y la menor distancia a la trayectoria de referencia (2,5007 m). Su tiempo de ejecución en 8 GPUs es un 47% menor que el del teacher. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico de memoria del modelo es de 14,42 GiB, por lo que se necesita al menos una GPU con 16 GB de VRAM para inferencia en precisión FP16/BF16.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40GB, H100, o GPUs de datacenter con al menos 16 GB. En consumer GPU, una RTX 4080/4090 sería suficiente.
- No se especifican cuantizaciones, por lo que no se puede estimar el uso con GGUF o cuantización de 4 bits.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI o directamente con la librería transformers. También es compatible con endpoints de inferencia (según tags).
- Latencia y throughput: no se proporcionan datos específicos, pero el tiempo de ejecución en 8 GPUs para 32 escenarios fue de 47 minutos y 21 segundos, lo que sugiere un rendimiento adecuado para simulación por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| SIMFORGE-D1.5 (este) | 7,21B | no disponible | openmdw-1.1 | Conducción autónoma (VLA destilado) |
| NVIDIA Alpamayo 1.5 10B | 10B | no disponible | openmdw-1.1 | Conducción autónoma (VLA teacher) |
| NVIDIA Alpamayo-R1-10B | 10B | no disponible | openmdw-1.1 | Conducción autónoma con razonamiento R1 |

La comparativa se limita a los modelos de la familia Alpamayo, ya que no se dispone de información sobre otros VLA de conducción con características similares. SIMFORGE-D1.5 es un 28% más pequeño que el teacher, con una pérdida de rendimiento del 6,4% en `scene_score` pero con una reducción significativa de memoria y tiempo de cómputo.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas del modelo. Al ser un VLA de conducción, su comportamiento depende en gran medida de los datos de entrenamiento y de los escenarios de evaluación.
- El modelo solo soporta inglés como idioma de entrada, lo que limita su uso en entornos multilingües.
- La licencia openmdw-1.1 (Open Model Data Warehouse) puede tener restricciones de uso comercial; se recomienda revisar sus términos antes de desplegarlo en producción.
- El modelo está especializado en conducción autónoma y no es adecuado para tareas generales de lenguaje o visión fuera de ese dominio.
- Los resultados del benchmark AlpaSim se basan en un conjunto fijo de 32 escenarios; el rendimiento en escenarios no cubiertos puede variar.
- No se han publicado detalles sobre el proceso de destilación (datos, hiperparámetros, función de pérdida), lo que dificulta la reproducibilidad.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un checkpoint experimental sin validación externa.

## Enlaces

- [HuggingFace: michaelvu1207/alpamayo-distillation](https://huggingface.co/michaelvu1207/alpamayo-distillation)
- [GitHub NVlabs/alpamayo](https://github.com/NVlabs/alpamayo)
- [Artículo de NVIDIA sobre destilación de Alpamayo](https://perspectives.nvidia.com/nvidia-alpamayo/alpamayo-distill-teacher-models/)
- [Repositorio relacionado: mu-hashmi/alpamayo-r1-distilled](https://github.com/mu-hashmi/alpamayo-r1-distilled)
- [Modelo teacher: nvidia/Alpamayo-1.5-10B](https://huggingface.co/nvidia/Alpamayo-1.5-10B)
