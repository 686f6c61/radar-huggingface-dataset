# MISLab-MiiSLab/pi05_grasp-fan_Le-008_15k_v1_Lora

## Resumen

El modelo `pi05_grasp-fan_Le-008_15k_v1_Lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario MISLab-MiiSLab en Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/pi05_base`, un modelo de política visomotora (vision-language-action, VLA) desarrollado en el ecosistema LeRobot de Hugging Face para el control de robots. El adaptador está empaquetado con la librería PEFT y almacenado en formato safetensors, con un tamaño de repositorio de 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El nombre del adaptador sugiere que ha sido entrenado para una tarea concreta de manipulación robótica: agarre de un ventilador ("grasp-fan"), posiblemente con un robot Le-008 (un brazo SO-100/101 de bajo coste del ecosistema LeRobot) y con un presupuesto de entrenamiento de 15.000 pasos ("15k") en su versión 1. No obstante, esta interpretación se deduce del identificador y no está confirmada en la model card, que es una plantilla genérica de Hugging Face sin rellenar.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación en robótica aprendida, útil para quien quiera reproducir o extender el ajuste de políticas VLA sobre LeRobot. No es un modelo de lenguaje general ni un modelo conversacional; es un adaptador de política para control robótico. La información pública disponible es muy escasa y la mayoría de los campos técnicos figuran como "no disponible" en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `lerobot/pi05_base` (política visomotora VLA del ecosistema LeRobot); arquitectura del modelo base no disponible en la información proporcionada |
| Parametros totales | No disponible (adaptador LoRA; tamaño del repo 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible (modelo orientado a control robótico, no a NLP) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se aplica sobre el modelo base `lerobot/pi05_base`. La técnica LoRA, descrita en el paper arXiv:1910.09700 (Hu et al., 2021) referenciado en las etiquetas del repositorio, congela los pesos del modelo base e inyecta matrices de descomposición de bajo rango en determinadas capas, de modo que solo se entrenan unos pocos millones de parámetros. Esto explica el reducido tamaño del repositorio (0,2 GB) frente a un modelo completo.

El modelo base pertenece a la familia Pi (Physical Intelligence) integrada en LeRobot, orientada a políticas visomotoras que combinan percepción visual y generación de acciones motoras. El sufijo del identificador (`grasp-fan_Le-008_15k_v1`) apunta a un ajuste específico para la tarea de agarre de un ventilador con un robot Le-008 durante 15.000 pasos de entrenamiento. Sin embargo, la model card no documenta la composición del dataset, el número de tokens o episodios, la presencia de RLHF/DPO ni hiperparámetros de entrenamiento; todos estos apartados aparecen como "[More Information Needed]". La única versión de framework declarada es PEFT 0.21.0.

## Capacidades

- Control robótico visomotor: el adaptador está diseñado para que el modelo base genere acciones motoras a partir de observaciones visuales, presumiblemente para la tarea de agarre de un ventilador.
- Ajuste específico de tarea: al ser un LoRA, especializa el comportamiento del modelo base hacia el escenario concreto de entrenamiento, no hacia capacidades generales.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes o multilingüismo.
- No se documenta ningún modo especial (thinking mode, audio, etc.).
- Cualquier capacidad adicional heredada del modelo base `lerobot/pi05_base` no está confirmada en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por imitación robótico: el adaptador sirve como punto de partida reproducible para estudiar cómo un LoRA especializa una política VLA en una tarea de manipulación concreta, comparando el rendimiento del modelo base frente al ajustado.
- Reproducción de experimentos de agarre: un laboratorio puede cargar el adaptador sobre `lerobot/pi05_base` y evaluar la política en un entorno simulado o real con un robot Le-008, verificando si el ajuste de 15k pasos mejora la tasa de éxito en la tarea "grasp-fan".
- Base para nuevos ajustes por transferencia: al ser un adaptador ligero, puede servir como inicialización para tareas de agarre relacionadas, reduciendo el coste de entrenamiento frente a partir del modelo base sin ajustar.
- Docencia y formación en robótica aprendida: el reducido tamaño (0,2 GB) y el formato PEFT facilitan su uso en cursos o talleres sobre LeRobot y políticas VLA sin necesidad de infraestructura pesada.
- Evaluación comparativa de técnicas de adaptación: permite comparar LoRA frente a otros métodos de ajuste (full fine-tuning, adaptadores) sobre el mismo modelo base y la misma tarea.
- Integración en pipelines de LeRobot: el adaptador puede cargarse con la librería PEFT dentro del ecosistema LeRobot para experimentar con despliegue de políticas en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base `lerobot/pi05_base`, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un adaptador LoRA de 0,2 GB, el requisito real vendrá determinado por el modelo base y por el entorno de simulación o robot físico.
- ¿Cabe en GPU de consumo? No disponible; el adaptador en sí es ligero, pero la inferencia requiere cargar el modelo base completo.
- Opciones de despliegue: carga mediante la librería PEFT (versión declarada 0.21.0) sobre el modelo base; el despliegue en robot o simulador dependerá del stack de LeRobot.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_grasp-fan_Le-008_15k_v1_Lora` (este) | Adaptador LoRA sobre política VLA | No disponible (repo 0,2 GB) | No disponible | No disponible | Hugging Face (MISLab-MiiSLab) |
| `lerobot/pi05_base` | Modelo base de política VLA | No disponible | No disponible | No disponible en la información proporcionada | Hugging Face (LeRobot) |
| Otros adaptadores LoRA de LeRobot | Adaptadores de tarea | No disponible | No disponible | Variable | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Model card vacía: la práctica totalidad de los campos técnicos, de entrenamiento y de evaluación figuran como "[More Information Needed]", lo que impide validar el modelo con rigor.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor antes de cualquier despliegue productivo.
- Especialización estrecha: al ser un LoRA entrenado para una tarea concreta ("grasp-fan"), es probable que no generalice a otras tareas de manipulación; no debe usarse como política generalista.
- Dependencia del modelo base: su comportamiento solo tiene sentido junto a `lerobot/pi05_base`; cualquier cambio o actualización del modelo base puede alterar los resultados.
- Sin datos de evaluación: no hay métricas de tasa de éxito, robustez ni generalización, por lo que no se puede afirmar que el ajuste mejore al modelo base.
- Riesgo de sobreajuste: con 15.000 pasos sobre una única tarea y un adaptador de bajo rango, es plausible un sobreajuste al entorno de entrenamiento; no confirmado por el autor.
- Sin información sobre sesgos, alucinación o limitaciones de idioma: no aplica en el sentido de NLP, pero no hay evaluación de seguridad ni de comportamiento fuera de distribución en robótica.
- Repositorio sin descargas ni "likes": no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-008_15k_v1_Lora
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de LoRA (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental (referenciada en la model card): https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
- Ecosistema LeRobot: https://github.com/huggingface/lerobot
