# ChristinaTan0704/umi-arena-policy

## Resumen

UMI Arena policy es una política robótica (visión-lenguaje-acción) publicada por ChristinaTan0704 como envío para la pista de políticas del UMI Arena de CoRL 2026. Se trata de un ajuste fino de SmolVLA, el modelo de visión-lenguaje-acción compacto de LeRobot, partiendo de `lerobot/smolvla_base` y entrenado sobre el conjunto de datos UMI de YUBI con un contrato de estado 9 y acción 16 a 30 Hz durante 30.000 pasos.

El modelo resuelve el problema de mapear observaciones visuales y estado propioceptivo a comandos de acción motora en un robot, siguiendo la interfaz de LeRobot. Su relevancia radica en que empaqueta el backbone visual-lenguaje SmolVLM2-500M-Video-Instruct dentro del repositorio, de modo que la política se carga sin acceso a red, algo útil para evaluación reproducible y despliegue en entornos aislados.

Con 450 millones de parámetros y un repositorio de 2,9 GB, es un modelo pequeño orientado a inferencia en tiempo real sobre hardware modesto. La licencia Apache-2.0 facilita su reutilización comercial, aunque la documentación publicada es mínima y no incluye resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA, con backbone SmolVLM2-500M-Video-Instruct |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La política sigue la arquitectura SmolVLA, un modelo de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje compacto con una cabeza de acciones. El backbone es SmolVLM2-500M-Video-Instruct, incluido como copia sin modificar en el subdirectorio `smolvlm2/` del repositorio. La interfaz de control utiliza un contrato de estado de dimensión 9 y acción de dimensión 16, muestreado a 30 Hz.

El entrenamiento consistió en un ajuste fino desde `lerobot/smolvla_base` sobre el dataset UMI de YUBI durante 30.000 pasos, manteniendo episodios de práctica fuera del conjunto de entrenamiento. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El archivo `policy.py` es el adaptador oficial `lerobot_hf`, parcheado para cargar el backbone incluido localmente.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales y estado propioceptivo del robot, con salida de 16 dimensiones a 30 Hz.
- Percepción visual y comprensión de instrucciones en lenguaje natural gracias al backbone SmolVLM2-500M-Video-Instruct.
- Ejecución de políticas de manipulación entrenadas sobre datos UMI (Universal Manipulation Interface).
- Carga sin conexión de red, al incluir el backbone empaquetado en el repositorio.
- Integración con el ecosistema LeRobot mediante el adaptador `lerobot_hf`.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación reproducible en UMI Arena: la política puede cargarse y ejecutarse en la pista de evaluación de CoRL 2026 sin dependencias de red, ya que el backbone SmolVLM2 está incluido en el repositorio.
- Investigación en manipulación robótica: sirve como punto de partida para experimentos de ajuste fino sobre nuevos datasets UMI con el contrato estado 9 / acción 16.
- Despliegue en entornos aislados: al no requerir descarga del backbone, es adecuada para laboratorios con acceso restringido a internet o para reproducibilidad de resultados.
- Control de robots a 30 Hz: el contrato de acción de 16 dimensiones y la frecuencia de 30 Hz permiten su uso en tareas de manipulación que requieren control reactivo.
- Benchmarking de políticas VLA: puede utilizarse como referencia base para comparar variantes de SmolVLA en tareas de manipulación con el dataset YUBI UMI.
- Prototipado con LeRobot: el adaptador `policy.py` facilita la integración en pipelines existentes de LeRobot para pruebas de inferencia y validación de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros, una estimación razonable en precisión FP16 sería de aproximadamente 1 GB para los pesos, más memoria para activaciones y el codificador visual.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot con el adaptador `lerobot_hf` incluido; otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput estimados: no disponible; el contrato de 30 Hz sugiere que el modelo está pensado para inferencia en tiempo real, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UMI Arena policy (este modelo) | 450 M | no disponible | Apache-2.0 | Hugging Face, 17 descargas |
| SmolVLA base (`lerobot/smolvla_base`) | no disponible | no disponible | no disponible | Hugging Face |
| SmolVLM2-500M-Video-Instruct | ~500 M | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla composición del dataset, métricas de evaluación ni limitaciones conocidas.
- Sesgos: no disponible; al entrenarse sobre un dataset específico (YUBI UMI), puede heredar sesgos de las condiciones de recogida de datos.
- Riesgo de alucinación: no evaluado; como modelo VLA, los errores se manifiestan como acciones incorrectas más que como texto alucinado.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el backbone SmolVLM2 también es Apache-2.0, por lo que no se identifican restricciones adicionales.
- Caveat para producción: el modelo está pensado para la pista de UMI Arena y no se documenta su robustez fuera de ese dominio; el contrato de estado 9 / acción 16 y la frecuencia de 30 Hz deben respetarse para un funcionamiento correcto.
- Repositorio de 2,9 GB: incluye el backbone empaquetado, lo que aumenta el tamaño de descarga frente a un checkpoint de solo política.

## Enlaces

- [Hugging Face: ChristinaTan0704/umi-arena-policy](https://huggingface.co/ChristinaTan0704/umi-arena-policy)
- [SmolVLM2-500M-Video-Instruct](https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct)
- [LeRobot SmolVLA base](https://huggingface.co/lerobot/smolvla_base)
