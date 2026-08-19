# 3CTeam/action-evidence-vla-2p2b-libero-long-chunk10-nobudget-frozen-15k

## Resumen

El modelo `3CTeam/action-evidence-vla-2p2b-libero-long-chunk10-nobudget-frozen-15k` es una política de robótica basada en la arquitectura Vision-Language-Action (VLA), desarrollada por el equipo 3CTeam y publicada bajo licencia Apache-2.0. Está entrenado con la librería LeRobot de Hugging Face y utiliza el dataset `lerobot/libero_10_image`, que contiene demostraciones de manipulación robótica en el entorno simulado LIBERO. El modelo cuenta con aproximadamente 3 036 millones de parámetros (3,04 B) y se distribuye en formato safetensors.

Este tipo de modelos convierte instrucciones en lenguaje natural e imágenes de cámara en acciones de control para robots, permitiendo tareas de manipulación como coger, mover o apilar objetos. Su relevancia radica en ser una alternativa open source dentro del creciente ecosistema de VLA, con un tamaño relativamente compacto en comparación con otros modelos de la categoría (por ejemplo, OpenVLA de 7B), lo que podría facilitar su despliegue en entornos con recursos limitados. Sin embargo, la información pública disponible sobre su arquitectura interna, proceso de entrenamiento y rendimiento es muy escasa, limitando una evaluación técnica profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) - tipo `action_evidence_vla` |
| Parametros totales | 3 036 644 752 (aprox. 3,04 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot (lerobot) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo. El nombre `action_evidence_vla` sugiere una variante de VLA que incorpora tokens de evidencia de acción, pero no hay documentación técnica que explique su diseño exacto. El modelo fue entrenado utilizando la librería LeRobot, que proporciona herramientas para entrenamiento de políticas de imitación en robótica. El dataset empleado es `lerobot/libero_10_image`, parte del benchmark LIBERO, que incluye tareas de manipulación de larga duración con instrucciones en lenguaje natural. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica si se usó decodificación especulativa, atención lineal u otras innovaciones técnicas.

## Capacidades

- Generacion de acciones de control para robots a partir de observaciones visuales (imagenes) e instrucciones en lenguaje natural.
- Ejecucion de tareas de manipulacion en el entorno simulado LIBERO, como coger objetos, apilar bloques o abrir contenedores.
- Manejo de secuencias de largo horizonte (el nombre del modelo incluye "long" y "chunk10", lo que sugiere procesamiento de episodios largos con ventanas de 10 pasos, aunque no hay confirmacion oficial).
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion e inferencia en robots reales o simulados.
- No se ha confirmado soporte para tool calling, agentes autonomos, vision adicional mas alla de las imagenes de entrada, ni capacidades multilingues.

## Casos de uso

- **Investigacion en aprendizaje por imitacion**: el modelo puede servir como referencia para estudiar tecnicas de VLA en entornos simulados, especialmente para tareas de largo horizonte dentro del benchmark LIBERO.
- **Desarrollo de politicas de manipulacion robotica**: se puede utilizar como punto de partida para entrenar o ajustar politicas en robots reales, gracias a su formato compatible con LeRobot.
- **Evaluacion de metodos de compresion y cuantizacion**: al ser un modelo de ~3B parametros, es candidato para probar tecnicas de cuantizacion o destilacion en el dominio de la robotica.
- **Benchmarking de VLA en entornos simulados**: puede integrarse en pipelines de evaluacion comparativa junto a otros modelos VLA para medir exito en tareas de LIBERO.
- **Prototipado de sistemas de control por lenguaje**: permite experimentar con interfaces que traduzcan ordenes en lenguaje natural a acciones de robot en simulacion.
- **Formacion y educacion**: util en cursos o talleres sobre robotica basada en aprendizaje, dado que se puede cargar y ejecutar con LeRobot sin necesidad de infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de robotica como tasa de exito en LIBERO. El repositorio no incluye comparaciones con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Como estimacion razonable para un modelo de ~3B parametros en precision fp16, se necesitarian al menos 6 GB de VRAM solo para los pesos, mas memoria para las activaciones y el procesamiento de imagenes. Se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 2080) para inferencia basica, y 16 GB o mas para entrenamiento o ajuste fino. Opciones de despliegue: LeRobot soporta inferencia en GPU con PyTorch; tambien se podria convertir a formatos como ONNX o GGUF, aunque no hay garantia de compatibilidad. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. En el ecosistema VLA existen alternativas como OpenVLA (7B), SmolVLA (menor tamano) y Pi0, pero no se han publicado metricas de este modelo frente a ellas. La unica referencia disponible es el leaderboard de LIBERO de Hugging Face, que lista varios modelos VLA, pero este modelo no aparece ahi.

## Limitaciones y advertencias

- **Informacion tecnica insuficiente**: la model card no detalla arquitectura, datos de entrenamiento ni hiperparametros, lo que dificulta la reproducibilidad y la evaluacion critica.
- **Generalizacion limitada**: al estar entrenado exclusivamente en el dataset LIBERO (simulacion), puede no transferir bien a entornos reales no vistos.
- **Riesgo de sobreajuste**: el nombre "nobudget" y "frozen" sugiere que parte del modelo podria estar congelada, pero no hay confirmacion; si se congelaron capas, la adaptabilidad a nuevas tareas podria verse reducida.
- **Sesgos del dataset**: LIBERO contiene tareas y objetos especificos, por lo que el modelo puede fallar ante variaciones de iluminacion, texturas o disposiciones no representadas en el dataset.
- **Licencia Apache-2.0**: permite uso comercial, pero se debe verificar que los datos de entrenamiento (LIBERO) no tengan restricciones adicionales.
- **Sin soporte de idiomas declarado**: no se especifica si funciona con instrucciones en espanol u otros idiomas; probablemente este optimizado para ingles, dado el dataset.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/3CTeam/action-evidence-vla-2p2b-libero-long-chunk10-nobudget-frozen-15k)
- [LeRobot (libreria)](https://github.com/huggingface/lerobot)
- [Leaderboard LIBERO de HuggingFace](https://huggingface.co/spaces/HuggingFaceVLA/libero-vla-leaderboard)
- [OpenVLA - GitHub](https://github.com/openvla/openvla) (referencia de arquitectura VLA similar)
