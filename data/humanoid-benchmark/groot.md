# humanoid-benchmark/groot

## Resumen

GR00T N1.7 es un conjunto de checkpoints de robótica humanoide publicados por el usuario `humanoid-benchmark` en Hugging Face, obtenidos mediante fine-tuning del modelo base GR00T N1.7 de NVIDIA sobre cuatro tareas del Humanoid Benchmark. No se trata de un modelo de lenguaje general, sino de una política visomotora (vision-language-action) que, dada una observación multimodal del robot (imágenes de cámara y estado de propiocepción), produce acciones motoras de bajo nivel para un robot humanoide concreto. El repositorio contiene los pesos en formato safetensors junto con las estadísticas de normalización, la configuración del procesador y los metadatos de modalidad necesarios para la evaluación.

La relevancia de esta publicación es doble. Por un lado, demuestra el flujo de trabajo de adaptación de un modelo fundacional de robótica a tareas específicas mediante aprendizaje por imitación con 100 demostraciones por tarea y 20 épocas de entrenamiento. Por otro, expone públicamente los artefactos completos de evaluación (configuración de entrenamiento, layout del dataset y `protocol.json`), lo que facilita la reproducibilidad de los resultados en el benchmark. El backbone VLM es `nvidia/Cosmos-Reason2-2B`, cargado desde su repositorio original con control de acceso.

La información disponible no permite determinar la arquitectura interna completa del modelo base, el número exacto de parámetros, la longitud de contexto ni los idiomas soportados; estos datos no figuran en la model card ni en los metadatos del repositorio. El tamaño del repositorio (55,3 GB) es consistente con múltiples checkpoints de gran tamaño en safetensors, pero no equivale al número de parámetros de un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora basada en el modelo fundacional GR00T N1.7; backbone VLM `nvidia/Cosmos-Reason2-2B` (detalles internos de la arquitectura no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos shardeados), `config.json`, configuración del procesador, estadísticas de normalización, `experiment_cfg/`, `dataset_meta/` y `protocol.json` |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por imitación construida sobre GR00T N1.7, un modelo fundacional para robótica humanoide que combina un backbone de visión-lenguaje (`nvidia/Cosmos-Reason2-2B`) con una cabeza de acción que genera comandos motores. El repositorio incluye el código del adaptador utilizado durante el entrenamiento en la carpeta `code/`, pero la model card no detalla la topología exacta de la cabeza de acción ni el mecanismo de fusión entre las observaciones visuales y la propiocepción.

El entrenamiento se realizó sobre cuatro tareas del Humanoid Benchmark con 100 demostraciones por tarea y 20 épocas, guardando checkpoints en las épocas 10 y 20. Se empleó la especificación de aumento de datos online v2 del benchmark (aumentos fotométricos, geométricos, de sensor y de iluminación, además de ruido, retardo y dropout en la propiocepción), desactivando el aumento de imágenes propio de GR00T. La configuración de entrenamiento reportada incluye un batch por GPU de 320 sobre 32 GPUs; no se especifica el número total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO, algo poco habitual en políticas de imitación.

## Capacidades

- Control motor de robots humanoides: genera acciones de bajo nivel para tareas de manipulación y navegación (recoger objetos, abrir y cerrar puertas, verter líquidos).
- Percepción visomotora: procesa observaciones de cámara junto con el estado de propiocepción del robot.
- Aprendizaje por imitación: cada checkpoint está especializado en una tarea concreta a partir de demostraciones humanas.
- Generalización dentro de tarea: los aumentos de datos fotométricos, geométricos y de iluminación buscan robustez ante variaciones visuales y de sensores.
- Soporte multi-robot: los checkpoints cubren el Unitree G1 y el robot H2 en distintas tareas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Manipulación de residuos en entornos domésticos o industriales: el checkpoint `b6-pedal-bin` permite al Unitree G1 recoger un barril de chips, pisar el pedal de un cubo de basura y depositarlo, útil para tareas de limpieza automatizada.
- Apertura de electrodomésticos: el checkpoint `a3-fridge-open` habilita abrir la puerta de un frigorífico, un paso previo para tareas de inventario o reposición automática en cocinas robotizadas.
- Cierre de armarios y puertas: el checkpoint `a7-cabinet-close` sirve para tareas de ordenación en laboratorios o almacenes donde el robot debe dejar el entorno en un estado consistente.
- Servicio de bebidas: el checkpoint `a18-pour-water` permite verter agua de una jarra a un vaso con el robot H2, aplicable a prototipos de asistencia doméstica o hostelería.
- Evaluación comparativa de políticas: los checkpoints en épocas 10 y 20 permiten medir la evolución del rendimiento con el entrenamiento y comparar estrategias de aumento de datos.
- Investigación en reproducibilidad: al incluir `experiment_cfg/`, `dataset_meta/` y `protocol.json`, el repositorio sirve como referencia para replicar experimentos de fine-tuning sobre GR00T N1.7.
- Base para fine-tuning adicional: los pesos pueden reutilizarse como punto de partida para nuevas tareas del mismo robot o de robots similares, reduciendo el coste de entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 55,3 GB e incluye ocho checkpoints (cuatro tareas por dos épocas), por lo que el tamaño de un checkpoint individual no se puede deducir con exactitud.
- GPU recomendadas: no disponibles. El entrenamiento se realizó con 32 GPUs y batch por GPU de 320, lo que sugiere hardware de centro de datos (A100/H100), pero no se especifica el modelo exacto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de una política de robótica, el despliegue requeriría el stack de inferencia de GR00T y el código del adaptador incluido en `code/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T N1.7 (humanoid-benchmark) | No disponible | No disponible | No disponible | Hugging Face, repo de 55,3 GB |
| GR00T N1.7 base (NVIDIA) | No disponible | No disponible | No disponible | No confirmado en la informacion disponible |
| Otros checkpoints del Humanoid Benchmark | No disponible | No disponible | No disponible | No confirmado en la informacion disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: cada checkpoint está entrenado para una única tarea; no es un modelo generalista.
- Datos de entrenamiento limitados: 100 demostraciones por tarea, lo que puede reducir la robustez ante condiciones no vistas.
- Sin datos de evaluación pública: no se reportan tasas de éxito ni métricas del benchmark, por lo que el rendimiento real es desconocido.
- Licencia no especificada: no se puede confirmar el uso comercial; además, el backbone `nvidia/Cosmos-Reason2-2B` está en un repositorio con control de acceso, lo que impone condiciones adicionales.
- Dependencia del stack GR00T: la inferencia requiere el código del adaptador y la configuración del procesador incluidas en el repositorio.
- Riesgo de sobreajuste al entorno de demostración: los aumentos de datos mitigan pero no eliminan la sensibilidad a cambios de iluminación, geometría o sensores.
- Idiomas y contexto no documentados: no se puede evaluar su comportamiento en tareas de lenguaje general.
- Fecha de creación futura (2026-11-10): conviene verificar la vigencia y el estado de mantenimiento del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/humanoid-benchmark/groot
- Backbone VLM: https://huggingface.co/nvidia/Cosmos-Reason2-2B
