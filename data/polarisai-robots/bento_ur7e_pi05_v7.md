# polarisai-robots/bento_ur7e_pi05_v7

## Resumen

`bento_ur7e_pi05_v7` es una política de visión-lenguaje-acción (VLA) publicada por el usuario `polarisai-robots` en Hugging Face, construida sobre la arquitectura π₀.₅ (Pi05) de Physical Intelligence y empaquetada con la librería LeRobot. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de control robótico entrenado por imitación para un robot concreto (un UR7e, brazo Universal Robots) con dos cámaras (`top` y `wrist`). El modelo consume tres imágenes RGB de 224×224 píxeles y un vector de estado de 32 dimensiones, y produce una acción de 7 grados de libertad.

El modelo resuelve una tarea específica de manipulación: empaquetar fiambreras (lunchbox) con combinaciones de piezas de pollo frito, brócoli, filetes de pescado y salchichas, además de una variante que selecciona los alimentos según su color. Se entrenó sobre 647 episodios y 1.236.465 fotogramas grabados a 60 FPS del dataset `polarisai-robots/bento_ur7e_v6`.

Su relevancia es acotada pero clara: es un ejemplo reproducible de cómo el pipeline LeRobot permite llevar un VLA de última generación (Pi05) a un brazo industrial de 7 ejes, con pesos en safetensors de 4.143.404.816 parámetros (unos 9,4 GB de repositorio) y comandos de despliegue listos para usar. No hay resultados de evaluación publicados ni métricas de éxito en robot real, por lo que debe tratarse como un artefacto experimental de investigación, no como un sistema validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de control robótico; las instrucciones de tarea son en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.2 |
| Tipo de robot | `ur7e` (brazo Universal Robots UR7e) |
| Cámaras | `top`, `wrist` |
| Entradas | 3 imágenes VISUAL `(3, 224, 224)` + estado `(32,)` |
| Salidas | acción `(7,)` |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un backbone de visión-lenguaje con un cabezal de acciones, y cuya implementación en LeRobot está adaptada del repositorio OpenPI de la propia compañía. La model card describe Pi05 como una evolución de π₀ orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento. El checkpoint concreto procesa tres vistas RGB (base y dos muñecas) a 224×224 junto con un vector de estado de 32 dimensiones, y emite un vector de acción de 7 componentes.

El entrenamiento se realizó por imitación supervisada sobre el dataset `polarisai-robots/bento_ur7e_v6`: 647 episodios, 1.236.465 fotogramas a 60 FPS, con tres tareas descritas en lenguaje natural (empaquetar dos piezas de pollo y dos de brócoli; empaquetar dos filetes de pescado y tres salchichas; empaquetar según el color). La configuración declarada es de 100.000 pasos, batch de 16, optimizador AdamW, learning rate 5e-05 y semilla 1000. No se especifica el número de tokens de entrenamiento del backbone VLM, la composición del dataset más allá de las tareas, ni si hubo etapas de RLHF/DPO.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 7 dimensiones para un brazo UR7e a partir de observaciones visuales y de estado.
- Percepción multi-cámara: integra simultáneamente una vista cenital y dos vistas de muñeca (`observation.images.base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`).
- Ejecución de instrucciones en lenguaje natural: acepta una descripción de tarea en inglés mediante el parámetro `--task` (por ejemplo, "Pack me a lunchbox with two fried chicken pieces and two brocolli.").
- Manipulación de objetos y ensamblaje: las tareas entrenadas implican coger piezas, colocarlas en una fiambrera y respetar restricciones de cantidad y de color.
- Generalización a entornos nuevos: según la descripción de Pi05, el modelo está diseñado para generalizar a situaciones no vistas, aunque no se aportan métricas que lo verifiquen en este checkpoint.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso explícito: no disponible (el razonamiento se materializa como política de acción, no como cadena de texto).
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.

## Casos de uso

- Automatización de líneas de envasado alimentario: el modelo puede ejecutar la tarea de colocar piezas concretas (pollo, brócoli, pescado, salchichas) en una fiambrera sobre un UR7e, lo que encaja en células de montaje de bandejas con posiciones relativamente fijas.
- Clasificación y selección por color: la variante "Pack me a lunchbox according to its color." permite usar la política en tareas de picking guiado por atributo visual, útil en control de calidad o separación de lotes.
- Base para fine-tuning con datos propios: al ser un checkpoint LeRobot, se puede partir de él y reentrenar con `lerobot-train` sobre un dataset propio para adaptar el mismo brazo a otras piezas o bandejas.
- Investigación en imitación visual-motora: sirve como referencia reproducible para comparar variantes de Pi05, cambios de dataset o configuraciones de entrenamiento en un robot de 7 ejes.
- Prototipado de células robotizadas en laboratorio: con `lerobot-rollout` y una duración acotada (`--duration=60`) se puede validar el comportamiento del brazo antes de invertir en integración industrial.
- Docencia y demostraciones de VLA: el repositorio incluye comandos completos de despliegue y entrenamiento, lo que lo hace adecuado para talleres prácticos sobre políticas VLA con LeRobot.
- Recolección de datos asistida: combinado con el pipeline de grabación de LeRobot, el modelo puede servir como política inicial para generar episodios adicionales y ampliar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la nota explícita "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parámetros en safetensors y un repositorio de 9,4 GB, la inferencia en precisión completa requiere del orden de 16-17 GB solo para pesos, más activaciones y buffers de visión; en fp16/bf16 bajaría a unos 8-9 GB de pesos, y en cuantizaciones de 8 bits a unos 4-5 GB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4) o superior (A100, H100) es el rango razonable para inferencia sin cuantizar; no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 24 GB o más con precisión reducida, pero no está verificado ni documentado.
- Opciones de despliegue: `lerobot-rollout` para ejecución sobre robot y `lerobot-train` para reentrenamiento, ambos de la librería LeRobot 0.6.2. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 60 FPS, pero no se especifica la frecuencia de control efectiva del checkpoint ni el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `polarisai-robots/bento_ur7e_pi05_v7` | 4.143.404.816 | no disponible | VLA para UR7e, empaquetado de fiambreras | no disponible | Hugging Face, 0 descargas, 0 likes |
| `polarisai-robots/bento_ur7e_pi05_v6` | no disponible | no disponible | VLA para UR7e, versión anterior del mismo pipeline | no disponible | Hugging Face |
| `polarisai-robots/bento_ur7e_pi05_v2` | no disponible | no disponible | VLA para UR7e, versión anterior del mismo pipeline | no disponible | Hugging Face |
| π₀.₅ (Pi05) de Physical Intelligence | no disponible en esta información | no disponible | VLA generalista para robots | no disponible en esta información | Blog y repositorio OpenPI de Physical Intelligence |

Las alternativas más cercanas son las versiones previas del mismo autor (v2, v6), que comparten arquitectura y dataset pero de las que no se dispone de especificaciones detalladas. No se han encontrado en la información proporcionada comparaciones con otros VLA como OpenVLA, RT-2 o π₀ original.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de dificultad documentadas; no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "More Information Needed", lo que impide determinar si el uso comercial está permitido.
- Especialización estrecha: entrenado exclusivamente para tareas de empaquetado de fiambreras sobre un UR7e con dos cámaras; fuera de ese dominio (otros objetos, otra morfología, otra disposición de cámaras) el comportamiento no está garantizado.
- Dependencia del hardware exacto: las claves de observación (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) y la configuración de cámaras deben coincidir con las del entrenamiento; un cambio de montaje o de resolución puede degradar la política.
- Riesgo de sobreajuste al dataset: con 647 episodios y tres tareas, la diversidad es limitada; es probable que la generalización a posiciones, iluminación o distractores nuevos sea peor que la descrita para Pi05 en general.
- Sin datos de sesgo ni de alucinación: no aplica el concepto de alucinación textual, pero sí el de acciones erróneas o inseguras en robot real; no se documentan medidas de seguridad.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte de instrucciones en castellano.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v7
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v6
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v6
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Versión anterior v6: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v6
- Versión anterior v2: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v2
