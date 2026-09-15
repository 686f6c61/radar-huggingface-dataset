# iFaz/eqm-aloha_transfer_cube-seed3-dot-ft

## Resumen

El modelo `iFaz/eqm-aloha_transfer_cube-seed3-dot-ft` es una política de robótica (policy) entrenada con la librería LeRobot de Hugging Face sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, una tarea de manipulación bimanual simulada de la familia ALOHA. No es un modelo de lenguaje: es un controlador que mapea observaciones (imágenes de cámaras e información propioceptiva) a acciones motoras, y se publica como checkpoint de investigación ligado a una semilla concreta (seed3).

El repositorio tiene 18.701.190 parámetros (~18,7 M), un tamaño de repo de 0,1 GB, licencia Apache-2.0 y pesos en formato safetensors dentro de la librería `lerobot`. Por su etiqueta, el tipo de policy es `eqm`, aunque la model card publicada por el autor es la plantilla genérica de LeRobot y no documenta la arquitectura, los datos de entrenamiento ni métricas de evaluación.

Su relevancia es acotada y de carácter experimental: se trata de un artefacto de investigación para reproducir y comparar experimentos de aprendizaje por imitación en simulación, no de un modelo listo para producción. Con 0 descargas y 0 likes en el momento de la consulta, no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card es la plantilla genérica de LeRobot; la etiqueta del repo indica tipo de policy `eqm`) |
| Parámetros totales | 18.701.190 (~18,7 M) |
| Parámetros activos | no aplica / no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se documenta horizonte de observación ni de predicción de acciones) |
| Tipos de cuantización | no disponible; el repo solo publica pesos sin variantes cuantizadas declaradas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline declarado | robotics |
| Dataset de referencia | lerobot/aloha_sim_transfer_cube_human |
| Tipo de policy (tag) | eqm |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación / actualización | 2026-09-15 (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna. La model card es la plantilla automática de LeRobot e incluye el aviso "Model type not recognized — please update this template.", por lo que no se especifican capas, mecanismos de atención, representación de acciones ni estrategia de entrenamiento. El fragmento de código de la model card (`--policy.type=act`) forma parte de la plantilla genérica de LeRobot y no debe interpretarse como la configuración real de este checkpoint: el tag del repositorio indica `eqm`.

Lo que sí se puede afirmar con los datos del repositorio: es una policy de imitación entrenada con LeRobot sobre demostraciones humanas del dataset `lerobot/aloha_sim_transfer_cube_human`, con aproximadamente 18,7 M de parámetros y pesos en safetensors. El nombre del checkpoint sugiere una ejecución con semilla fija ("seed3") y un ajuste posterior ("dot-ft"), pero el autor no documenta ni el procedimiento de fine-tuning ni la diferencia respecto a los checkpoints hermanos con marca temporal (`eqm-aloha_transfer_cube-seed3-12sep2026_2pm` y `..._3pm`), que apuntan a barridos de experimentos.

## Capacidades

- Control de manipulación bimanual en simulación: genera acciones motoras a partir de observaciones, orientado a la tarea de transferencia de cubo del entorno ALOHA simulado.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas, no de recompensas explícitas.
- Ejecución en bucle cerrado dentro del simulador mediante `lerobot-record`, con el flag `--policy.path` apuntando al checkpoint.
- Reproducibilidad de experimentos: al fijar una semilla (seed3), sirve como punto de comparación controlado frente a otras ejecuciones.
- Inferencia ligera: 18,7 M de parámetros permiten ejecución en GPU de gama baja e incluso en CPU.
- No dispone de: generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, capacidades de agente, soporte multilingüe ni modo de pensamiento. No se ha documentado ninguna capacidad fuera del control motor simulado.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: cargar el checkpoint con `--policy.path` y reevaluar la tarea de transferencia de cubo para verificar los resultados de la semilla 3 frente a otras semillas.
- Baseline en investigación sobre políticas de manipulación bimanual: al ser un checkpoint pequeño con semilla fija, sirve como referencia cuantitativa en comparaciones entre algoritmos de imitación sobre el mismo dataset.
- Desarrollo de pipelines de entrenamiento con LeRobot: usar este repo como ejemplo práctico de integración entre `lerobot-train`, el Hub de Hugging Face y el registro de checkpoints.
- Validación previa de infraestructura: comprobar que un entorno local (drivers, CUDA, MuJoCo, dependencias de LeRobot) ejecuta correctamente una policy antes de lanzar entrenamientos de mayor coste.
- Generación de datos de evaluación en simulación: ejecutar episodios con `lerobot-record` y prefijo `eval_` para producir trayectorias etiquetadas que analizar después.
- Prototipado y docencia en robótica: por su tamaño reducido, es viable en portátiles con GPU modesta para demostrar el ciclo completo de una policy de imitación sin infraestructura dedicada.
- Estudio de robustez y acumulación de error: comparar el rendimiento del checkpoint en distintos puntos de partida del cubo dentro del simulador para caracterizar la degradación del control en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones con otras políticas, y no hay métricas en los metadatos del repositorio.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 75 MB en fp32, 37 MB en fp16/bf16 y 19 MB en int8 (cálculo a partir de los 18.701.190 parámetros; no hay variantes cuantizadas publicadas).
- VRAM total: el consumo real lo dominan las activaciones y el preprocesado de las imágenes de cámara, no los pesos. No hay mediciones publicadas; en configuraciones típicas de LeRobot con varias cámaras el pico se mantiene en el orden de cientos de MB por lote.
- GPU recomendadas: cualquier GPU con soporte CUDA y 4 GB o más de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4090, A100, H100). El modelo está muy por debajo de los requisitos de las políticas vision-language-action.
- Cabe en GPU de consumo: sí, con amplio margen, y también en CPU (velocidad de control no documentada) y en dispositivos tipo Jetson.
- Opciones de despliegue: LeRobot (`lerobot-record` para evaluación, `lerobot-train` para reentrenamiento) sobre PyTorch. No se documenta exportación a ONNX, TensorRT ni integración con vLLM, llama.cpp u Ollama (herramientas no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. Con 18,7 M de parámetros, el coste de un forward es bajo, pero la frecuencia de control alcanzable depende del simulador, del número de cámaras y de la resolución de entrada, datos que no se especifican.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea / dataset | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iFaz/eqm-aloha_transfer_cube-seed3-dot-ft | 18,7 M | ALOHA sim transfer cube (`lerobot/aloha_sim_transfer_cube_human`) | apache-2.0 | Hub, 0 descargas | Checkpoint de investigación sin documentación técnica |
| iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_2pm | no disponible | ALOHA sim transfer cube | no disponible | Hub | Checkpoint hermano con marca temporal |
| iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_3pm | no disponible | ALOHA sim transfer cube | no disponible | Hub | Checkpoint hermano con marca temporal |
| Políticas de LeRobot para ALOHA (ACT, Diffusion Policy, VQ-BeT, SmolVLA) | no disponible | Manipulación, entrenables con el mismo pipeline | no disponible | Repositorio LeRobot | Alternativas funcionales dentro de la misma librería; no se dispone de cifras comparativas verificadas |

## Limitaciones y advertencias

- Model card sin contenido técnico: es la plantilla automática de LeRobot, sin arquitectura, hiperparámetros, composición del dataset ni resultados.
- Sin validación de la comunidad: 0 descargas y 0 likes; no hay evidencia externa de que la política funcione según lo esperado.
- Ámbito restringido a simulación: no hay evidencia de transferencia a hardware real ni de resultados fuera del entorno ALOHA simulado.
- Especialización estrecha: entrenado sobre una única tarea (transferencia de cubo), con toda probabilidad sensible a cambios de distribución (posición inicial de objetos, iluminación, cámara) no cubiertos por el dataset.
- Riesgo de acumulación de error en bucle cerrado, comportamiento habitual en políticas de imitación entrenadas con demostraciones humanas limitadas.
- No hay documentación sobre sesgos del dataset ni sobre la demografía o el estilo de las demostraciones humanas recogidas.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar avisos de copyright y licencia, y se distribuye sin garantías ni responsabilidad del autor.
- Anomalía de metadatos: la fecha declarada de creación y actualización es 2026-09-15, posterior a la fecha habitual de consulta; conviene tratarla con cautela al citar el repositorio.
- No apto para tareas de lenguaje, visión general, agentes o tool calling: su única salida son acciones de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-dot-ft
- Checkpoint hermano (12sep2026_2pm): https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_2pm
- Checkpoint hermano (12sep2026_3pm): https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_3pm
- Dataset de referencia: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
