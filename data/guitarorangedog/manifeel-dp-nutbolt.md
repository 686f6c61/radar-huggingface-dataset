# guitarorangedog/manifeel-dp-nutbolt

## Resumen

`manifeel-dp-nutbolt` es un checkpoint de política de difusión (Diffusion Policy) para control robótico, publicado por el usuario `guitarorangedog` bajo el ecosistema LeRobot. Está entrenado con la librería `robo-synapse` (sobre LeRobot 0.6.1) y se distribuye como un baseline para la tarea `nutbolt` del conjunto de datos ManiFeel, orientada a manipulación con un brazo Franka Panda y percepción táctil. El modelo toma como entrada la imagen de la cámara de muñeca y una imagen táctil derecha (`tacimg`), y genera acciones motoras.

El checkpoint contiene 329.219.847 parámetros (unos 329 M) en formato safetensors, con un tamaño de repositorio de 1,3 GB. No es un modelo de lenguaje: es un modelo de robótica que hereda la arquitectura de red neuronal de una política de difusión, por lo que no dispone de contexto textual, vocabulario ni capacidades de generación de lenguaje. Su relevancia actual radica en que sirve como referencia reproducible (semilla 1000, AMP, sin aumento de datos) para comparar métodos de imitación con señal táctil en tareas de ensamblaje.

La información pública es muy escasa: no se declara licencia, idiomas, ni se publican resultados de benchmarks más allá de la tasa de éxito reportada en la model card. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 12 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control robótico, sobre LeRobot 0.6.1) |
| Parámetros totales | 329.219.847 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | RoboSynapse/manifeel-tacr_franka-panda_nutbolt |
| Entradas | cámara de muñeca + imagen táctil derecha (`tacimg`) |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Diffusion Policy: en lugar de predecir directamente una acción, aprende a generar trayectorias de acción mediante un proceso de difusión (denoising iterativo) condicionado por observaciones. La entrada combina la imagen de la cámara de muñeca del robot con una imagen táctil del sensor derecho (`tacimg`), lo que permite condicionar la política tanto en información visual como en la señal de contacto. El entrenamiento se realizó con la herramienta `robo-synapse` sobre LeRobot 0.6.1, con semilla 1000, precisión mixta automática (AMP) y sin aumento de datos (augmentation off). No se especifican en la información disponible el número de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

La innovación destacable es la incorporación de modalidad táctil junto a la visión para una tarea de inserción de tornillo y tuerca (`nutbolt`) con un Franka Panda, un escenario clásico de ensamblaje donde la señal de contacto es crítica. El checkpoint se presenta explícitamente como baseline reproducible, lo que facilita comparaciones futuras con otras políticas entrenadas sobre el mismo dataset.

## Capacidades

- Generación de acciones motoras para control de un brazo robótico Franka Panda en la tarea `nutbolt`.
- Percepción multimodal: combina imagen de cámara de muñeca e imagen táctil derecha.
- Política de imitación entrenada por difusión, adecuada para manipulación fina con contacto.
- Ejecución de episodios de hasta 500 pasos (según el protocolo de evaluación de la model card).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de thinking mode, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- **Ensamblaje de tornillo y tuerca en línea de producción**: el modelo ejecuta la política de inserción sobre un Franka Panda usando visión de muñeca y tacto, adecuado para tareas de roscado donde la realimentación de contacto reduce fallos de alineación.
- **Baseline para investigación en imitación táctil**: sirve como referencia reproducible (semilla 1000, AMP, sin aumento) para comparar nuevas políticas de difusión que incorporen sensores táctiles sobre el mismo dataset ManiFeel.
- **Evaluación de robustez de políticas viso-táctiles**: con una tasa de éxito reportada del 85,0 % en 4 semillas × 50 episodios, permite medir la varianza entre semillas y estudiar la estabilidad del entrenamiento.
- **Prototipado en laboratorio con LeRobot**: al estar empaquetado para la librería `lerobot`, se puede cargar y desplegar en un entorno LeRobot 0.6.1 para pruebas rápidas de manipulación.
- **Generación de datos sintéticos o aumentados**: la política entrenada puede utilizarse para rodar episodios adicionales en simulación o en banco de pruebas y ampliar el dataset de la tarea `nutbolt`.
- **Estudio de fusión multimodal visión-tacto**: permite analizar cómo contribuye la imagen táctil derecha frente a la cámara de muñeca en el éxito de la tarea, por ejemplo mediante ablaciones sobre las entradas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Tasa de éxito en tarea `nutbolt` | 85,0 % | 4 semillas × 50 episodios, máximo 500 pasos por episodio |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 329 M de parámetros en safetensors y un repositorio de 1,3 GB, la inferencia en FP32 requeriría aproximadamente 1,3 GB de memoria para los pesos, más el coste de las activaciones y del proceso de difusión iterativo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: probable por el tamaño del checkpoint, pero no confirmado en la documentación.
- Opciones de despliegue: librería `lerobot` (versión 0.6.1 según la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `manifeel-dp-nutbolt` | 329.219.847 | no aplica | 85,0 % éxito en `nutbolt` | no disponible | Hugging Face (lerobot) |
| Otras Diffusion Policy de LeRobot | no disponible | no aplica | no disponible | no disponible | no disponible |
| Políticas ACT de LeRobot | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (políticas de difusión para manipulación con tacto) en la documentación proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- **Licencia no declarada**: al no especificarse licencia, no se puede garantizar el uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- **Dominio muy restringido**: la política está entrenada exclusivamente para la tarea `nutbolt` con un Franka Panda y una configuración sensorial concreta (cámara de muñeca + tacto derecho); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- **Sesgos de dataset**: al entrenarse sobre un único dataset (`RoboSynapse/manifeel-tacr_franka-panda_nutbolt`), hereda los sesgos de distribución, posiciones iniciales y condiciones de iluminación de ese conjunto.
- **Riesgo de fallo en condiciones fuera de distribución**: la tasa de éxito del 85,0 % implica un 15 % de fallos incluso en las condiciones de evaluación; en entornos reales con variaciones de fricción, iluminación u objetos, el rendimiento puede degradarse.
- **Sin datos de robustez ni de seguridad**: no se documentan pruebas de seguridad física, parada de emergencia ni comportamiento ante fallos del sensor táctil.
- **Reproducibilidad limitada**: se indica semilla 1000, AMP y ausencia de aumento de datos, pero no se detallan hiperparámetros completos ni el número de pasos de entrenamiento.
- **Madurez**: 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso comunitario ni validación externa.
- **No es un modelo de lenguaje**: no debe evaluarse con métricas de NLP ni usarse para generación de texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-dp-nutbolt
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_nutbolt
- Código y receta (PR de robo-synapse): https://github.com/kwk2696/robo-synapse/pull/2
