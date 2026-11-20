# phawitbinabik/smolvla_Z_CUBE_SIM

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico de bajo coste computacional. La variante aquí documentada, `phawitbinabik/smolvla_Z_CUBE_SIM`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre el dataset `phawitbinabik/Z_CUBE_SIM`, orientado a una tarea concreta de manipulación simulada. El modelo combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único policy entrenado de extremo a extremo.

Con 450.292.449 parámetros (aproximadamente 450 M), SmolVLA se posiciona como una alternativa ligera frente a VLA de gran escala como OpenVLA o RT-2, manteniendo la capacidad de ejecutarse en hardware de consumo. Esta característica es relevante para laboratorios y desarrolladores que necesitan iterar rápidamente en robótica sin acceso a clústeres de GPU de datacenter.

El modelo se distribuye en formato safetensors bajo licencia Apache 2.0 y se integra en el pipeline de LeRobot, lo que facilita su entrenamiento, evaluación y despliegue mediante herramientas estándar del ecosistema. Su relevancia actual radica en la tendencia hacia políticas VLA eficientes y reproducibles para investigación en manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en transformer multimodal con cabezal de acciones (SmolVLA) |
| Parametros totales | 450.292.449 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una política VLA compacta que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones en una arquitectura transformer unificada. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional manteniendo competitividad en tareas de manipulación. La variante documentada aquí ha sido ajustada (fine-tuning) sobre el dataset `phawitbinabik/Z_CUBE_SIM`, que corresponde a una tarea de manipulación de un cubo en entorno simulado (Z_CUBE_SIM).

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset de ajuste fino ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se ha realizado con la librería LeRobot, que estandariza el pipeline de imitación (behavior cloning) para políticas robóticas. La innovación principal del modelo reside en su tamaño reducido (450 M parámetros) y su capacidad de despliegue en hardware de consumo, en línea con la filosofía de SmolVLA de democratizar la investigación en VLA.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural (visión-lenguaje-acción).
- Control robótico de manipulación: el modelo produce secuencias de acciones para efectuar tareas físicas, en este caso la manipulación de un cubo en simulación.
- Percepción visual integrada: procesa imágenes de cámara como entrada para condicionar las acciones.
- Comprensión de instrucciones en lenguaje natural para guiar la política.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Ejecución en hardware de consumo gracias a su tamaño compacto.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en manipulación robótica simulada: el modelo sirve como policy de referencia para tareas de pick-and-place de cubos en entornos simulados, permitiendo reproducir experimentos y comparar con otras políticas VLA.
- Prototipado rápido de políticas VLA: gracias a sus 450 M parámetros y a la integración con LeRobot, un equipo puede ajustar el modelo sobre un dataset propio y evaluar en pocas horas en una GPU de consumo.
- Educación y formación: útil en cursos de robótica e IA donde se necesita un VLA ligero que quepa en estaciones de trabajo con GPU consumer (por ejemplo, RTX 4090) sin infraestructura de datacenter.
- Benchmarking de algoritmos de imitación: al ser un fine-tune reproducible sobre `smolvla_base`, sirve como baseline para comparar técnicas de behavior cloning y aumento de datos en simulación.
- Desarrollo de pipelines de evaluación automatizada: el modelo se puede integrar en `lerobot-record` para generar episodios de evaluación y medir tasas de éxito en tareas simuladas.
- Transferencia sim-to-real como punto de partida: aunque entrenado en simulación, el checkpoint puede servir como inicialización para ajustes posteriores en robots reales de bajo coste (por ejemplo, SO-100/SO-101 del ecosistema LeRobot).
- Despliegue en robots de bajo coste: su reducido tamaño permite ejecutar inferencia en el propio robot o en un equipo cercano, reduciendo la dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M parámetros en FP32 se requieren aproximadamente 1,8 GB solo para pesos; en FP16/BF16 unos 0,9 GB; en cuantización de 8 bits alrededor de 0,5 GB. A esto hay que sumar el codificador visual y los buffers de activaciones, por lo que un presupuesto realista de 4-8 GB de VRAM es suficiente para inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es adecuada; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo está pensado explícitamente para hardware de consumo.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas (RTX 3060 en adelante). También podría ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) es la vía oficial. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, dado que es un policy robótico y no un LLM de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_Z_CUBE_SIM (este) | 450 M | no disponible | VLA (policy robótico) | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base | Apache 2.0 | Hugging Face |
| OpenVLA | ~7 B (no confirmado en la información) | no disponible | VLA | no disponible | no disponible |
| RT-2 | no disponible | no disponible | VLA | propietaria | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a categoría, tamaño y licencia; los valores de OpenVLA y RT-2 no están confirmados en la documentación consultada y se indican como no disponibles cuando corresponde.

## Limitaciones y advertencias

- Es un policy especializado: el modelo ha sido ajustado para la tarea `Z_CUBE_SIM` y probablemente no generaliza a otras tareas de manipulación sin reentrenamiento.
- Entrenado en simulación: el rendimiento en robots reales no está validado; puede requerir ajuste sim-to-real.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como todo policy de imitación, puede producir trayectorias fuera de distribución ante observaciones novedosas.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset concreto, hereda los sesgos y limitaciones de ese dataset (condiciones de iluminación, posiciones de cámara, tipos de objetos).
- Limitaciones de idioma: no se documenta qué idiomas comprende para las instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base y del dataset.
- Para producción: se recomienda validación exhaustiva en el entorno objetivo, supervisión humana y mecanismos de parada de seguridad, dado que es un modelo de investigación con 0 descargas y 0 likes en el momento de la ficha.
- No se documentan métricas de éxito, curvas de entrenamiento ni evaluación cuantitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/smolvla_Z_CUBE_SIM
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de ajuste fino: https://huggingface.co/datasets/phawitbinabik/Z_CUBE_SIM
