# fecasado/gfm-kitchen-burger-22dN

## Resumen

gfm-kitchen-burger-22dN es una política robótica de manipulación entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El autor es el usuario fecasado y el modelo se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors (75.225.290 parámetros, repositorio de 0,3 GB). El identificador y las etiquetas del modelo apuntan a una política denominada gaze_flow_matching, es decir, un método basado en flow matching con algún componente asociado a la mirada (gaze), aunque la model card no desarrolla la arquitectura.

La tarea concreta para la que se ha entrenado está delimitada por su dataset: fecasado/burger-to-plate-good-320x240, un conjunto de demostraciones a resolución 320x240 consistente en mover una hamburguesa a un plato. No se trata por tanto de un modelo de lenguaje ni de un modelo multimodal de propósito general, sino de un controlador visomotor de tarea única que consume imágenes y produce acciones de robot. Su relevancia es de nicho: sirve como referencia reproducible dentro del ecosistema LeRobot y como punto de partida para experimentos de fine-tuning.

El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, la model card es la plantilla por defecto de LeRobot sin completar y no se han publicado resultados de evaluación. Cualquier uso en producción debería ir precedido de una validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por imitación etiquetada como gaze_flow_matching; la model card no especifica la arquitectura) |
| Parámetros totales | 75.225.290 (dato real del archivo safetensors) |
| Longitud de contexto | no aplicable (política robótica basada en observaciones, no en contexto textual); no disponible en la documentación |
| Tipos de cuantización | no disponible (repositorio distribuido únicamente en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible / no aplicable (modelo de control robótico sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | fecasado/burger-to-plate-good-320x240 (320x240) |
| Tamaño del repositorio | 0,3 GB |
| Entradas / salidas | no disponible en detalle; por el pipeline LeRobot se trata de observaciones visuales y acciones de robot |
| Fecha de creación / actualización | 2026-09-19 (fechas tal como figuran en el repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El nombre del modelo declarado (gaze_flow_matching) y su etiqueta homónima sugieren un esquema de flow matching —una familia de modelos generativos que aprende un campo de velocidad entre una distribución de ruido y la distribución de acciones— combinado con algún mecanismo relacionado con la mirada, presumiblemente para ponderar regiones relevantes de la imagen. Esta interpretación procede únicamente de los identificadores publicados y no está confirmada por la model card, que se limita a la plantilla por defecto con el aviso "Model type not recognized — please update this template".

Existe además una discrepancia relevante: el ejemplo de entrenamiento incluido en la model card usa `--policy.type=act`, mientras que las etiquetas del repositorio indican gaze_flow_matching. Se desconoce si la política final se entrenó con el esquema ACT genérico o con la variante gaze flow matching. No se documentan el número de tokens o frames de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste con preferencias humanas (RLHF/DPO), algo poco habitual en políticas de imitación. La única información verificable sobre el entrenamiento es que se realizó con LeRobot y que parte de un dataset de demostraciones de 320x240 sobre una tarea de colocación de una hamburguesa en un plato.

## Capacidades

- Control visomotor de tarea única: generar secuencias de acciones de robot a partir de observaciones de imagen para la tarea de trasladar una hamburguesa a un plato.
- Aprendizaje por imitación: reproduce el comportamiento de las demostraciones del dataset burger-to-plate-good-320x240.
- Entrada de imagen a resolución 320x240, coherente con el dataset de entrenamiento.
- Integración con el ecosistema LeRobot: se puede cargar con `--policy.path` y ejecutar con `lerobot-record` sobre un robot tipo so100_follower (el ejemplo de la model card emplea este robot).
- Reentrenamiento y fine-tuning mediante `lerobot-train`, apuntando a un dataset propio.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso de tipo LLM.
- No dispone de capacidades multilingües ni de modo de pensamiento (thinking mode).
- No se documentan capacidades de audio, vídeo de larga duración ni visión generalista fuera de la tarea entrenada.

## Casos de uso

- Reproducción de experimentos en robótica de imitación: sirve como punto de partida para replicar un pipeline completo de LeRobot, desde el dataset de demostraciones hasta la ejecución en un robot so100_follower, con un repositorio de solo 0,3 GB que se descarga rápido.
- Fine-tuning sobre una tarea nueva: partiendo de estos pesos y de un dataset propio grabado con `lerobot-record`, se puede reapuntar la política a otra tarea de manipulación similar (por ejemplo, colocar otros objetos sobre una superficie) reduciendo el coste frente a entrenar desde cero.
- Banco de pruebas interno de tareas de pick-and-place en cocina: al estar entrenada específicamente en el paso de hamburguesa a plato, resulta adecuada como caso de referencia para medir la degradación de una política ante cambios de iluminación, fondo o posición inicial del objeto.
- Docencia y cursos de robótica: el modelo y su dataset asociado permiten ilustrar de forma completa el ciclo de aprendizaje por imitación (recogida de demostraciones, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) sin necesidad de infraestructura de gran tamaño.
- Validación de pipelines de datos y de evaluación: sirve para comprobar que un entorno de evaluación propio (simulador o robot real) produce métricas consistentes antes de invertir en modelos mayores.
- Desarrollo de sistemas de manipulación de bajo coste: con 75 millones de parámetros, la política es candidata a ejecutarse en hardware modesto junto a un brazo tipo SO-100, lo que encaja en laboratorios con presupuesto reducido.
- Estudio comparativo de familias de políticas: dentro de LeRobot conviven ACT, Diffusion Policy y variantes tipo flow matching; este repositorio puede usarse como una de las variantes de la comparación, siempre que se documente su procedencia y se evalúe de forma homogénea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de aprendizaje, métricas de error de acción ni comparaciones con otras políticas. Las 0 descargas y 0 likes indican además que no existe validación por parte de terceros.

## Requisitos de hardware

- Estimación derivada del recuento de parámetros (75.225.290): en fp32 los pesos ocupan aproximadamente 0,30 GB; en bf16/fp16, aproximadamente 0,15 GB. Son estimaciones calculadas a partir del tamaño del modelo, no cifras publicadas por el autor.
- El consumo real de VRAM será superior al de los pesos debido al codificador de imagen, a los búferes de activaciones y al bucle de control en tiempo real; no se dispone de mediciones publicadas.
- Con ese tamaño, la inferencia cabe con holgura en GPUs de consumo como la RTX 4090, la RTX 3090 o incluso tarjetas de gama media con 8 GB de VRAM. No se documenta si el autor ha probado ejecución en CPU.
- Para entrenamiento y fine-tuning, una única GPU con 16-24 GB de VRAM debería ser suficiente para lotes pequeños, aunque no hay datos confirmados.
- Opciones de despliegue: la vía documentada es LeRobot en PyTorch, con `lerobot-record --policy.path=<repo>` para inferencia y `lerobot-train` para reentrenamiento. Los servidores de inferencia para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables, ya que no se trata de un modelo de texto.
- Latencia y throughput: no disponibles. En una política de control robótico la latencia es crítica y debe medirse en el hardware objetivo antes de cualquier despliegue.

## Comparativa con modelos similares

No se dispone de especificaciones de los modelos comparables en la información proporcionada, por lo que los valores cuantitativos se marcan como no disponibles. La comparación se limita a la categoría y al ecosistema.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-burger-22dN | Política de imitación visomotora (gaze flow matching), tarea única | 75.225.290 | No aplicable | apache-2.0 | Hugging Face, vía LeRobot |
| ACT (política de referencia de LeRobot) | Política de imitación basada en transformer | no disponible | No aplicable | no disponible | Incluida en LeRobot |
| Diffusion Policy (política de referencia de LeRobot) | Política de imitación generativa por difusión | no disponible | No aplicable | no disponible | Incluida en LeRobot |
| SmolVLA | Política visión-lenguaje-acción | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

No se han encontrado en la búsqueda web fuentes independientes que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de tarea única y muy especializado: está entrenado para trasladar una hamburguesa a un plato a 320x240. Fuera de esa distribución de tareas, objetos, cámara o resolución, el comportamiento esperado es degradado o directamente inválido.
- Sin evaluación publicada: no hay tasas de éxito, ni métricas, ni validación por terceros. Las 0 descargas y 0 likes implican ausencia total de uso comunitario verificable.
- Model card incompleta: la propia plantilla indica "Model type not recognized — please update this template", por lo que faltan detalles de arquitectura, datos de entrenamiento e hiperparámetros.
- Ambigüedad sobre la arquitectura: la etiqueta del repositorio dice gaze_flow_matching, pero el ejemplo de entrenamiento de la model card usa `--policy.type=act`. Conviene inspeccionar la configuración del checkpoint antes de asumir un método concreto.
- Riesgo de sobreajuste al entorno de demostración: en políticas de imitación con datasets pequeños es habitual que el modelo dependa de la posición de la cámara, la iluminación y la disposición de la mesa. No hay información sobre la variabilidad del dataset.
- Sin capacidades de lenguaje ni de razonamiento: no puede interpretar instrucciones en lenguaje natural ni encadenar subtareas abstractas; toda la especificación de la tarea reside en los pesos y en el dataset.
- Alucinación en el sentido generativo: en este contexto el equivalente es la generación de trayectorias plausibles pero incorrectas o inseguras, especialmente ante observaciones fuera de distribución. Requiere parada de emergencia y límites de par en el robot.
- Licencia: el modelo se publica como apache-2.0, lo que permite uso comercial. Sin embargo, la licencia del dataset fecasado/burger-to-plate-good-320x240 no se especifica en la información disponible y debería verificarse antes de reutilizar los datos o derivados.
- Fechas del repositorio: la creación y la actualización figuran como 2026-09-19, una fecha anómala respecto al momento de consulta; conviene tratarlas con cautela.
- Uso en producción: cualquier despliegue en un robot real exige validación en el entorno objetivo, protocolos de seguridad y supervisión humana, dado que no existe evidencia pública de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-burger-22dN
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/burger-to-plate-good-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas sin relación con el ámbito (contenido de astrología en alemán), por lo que no se incluye ningún enlace adicional.
