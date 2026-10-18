# fecasado/gfm-cubes-21aN

## Resumen

`fecasado/gfm-cubes-21aN` es una política robótica publicada en Hugging Face por el usuario `fecasado`, compatible con la librería LeRobot y etiquetada con el pipeline `robotics`. El checkpoint contiene 75.220.954 parámetros (75,2 M) en formato safetensors y se distribuye bajo licencia Apache-2.0. El nombre del modelo, `gaze_flow_matching`, y sus etiquetas apuntan a una política de flow matching con señal de mirada, aunque la model card no desarrolla la arquitectura ni confirma esos detalles técnicos.

El modelo parece orientado a tareas de manipulación visomotora, concretamente a un escenario de trasvase de cubos a cestas, a partir del dataset `fecasado/Ncubes-to-Nbaskets-320x240`. No es un modelo de lenguaje ni un sistema multimodal conversacional: es un checkpoint de robótica pensado para entrenamiento, evaluación e inferencia dentro del ecosistema LeRobot. Su relevancia actual reside en que permite experimentar con políticas de imitación compactas en hardware de consumo, aunque la documentación publicada es mínima y no incluye resultados de benchmarks.

La ficha se ha elaborado exclusivamente con la información disponible en Hugging Face y en la model card. Todo aquello que el autor no documenta se indica como «no disponible» para evitar inferencias no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no detalla la arquitectura interna; el nombre y las etiquetas sugieren una política de flow matching con señal de mirada, sin confirmación técnica. |
| Parámetros totales | 75.220.954 (75,2 M) |
| Parámetros activos | No aplica; no se indica que sea un modelo MoE. |
| Longitud de contexto | No aplica. Es una política robótica, no un modelo de lenguaje; no se documenta ventana de contexto. |
| Tipos de cuantización | No disponible. Solo se confirma el formato safetensors; no se publican variantes GGUF, INT8 ni INT4. |
| Idiomas soportados | No disponible; no se declaran idiomas. No es un modelo de texto. |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors; repositorio de 0,3 GB. |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura interna del modelo. La model card utiliza una plantilla genérica de LeRobot e indica que la política se ha entrenado y publicado con LeRobot, pero no especifica si se trata de un transformer, de un modelo de flow matching, de una arquitectura híbrida o de otro tipo de política de imitación. El nombre `gaze_flow_matching` y la etiqueta `gaze_flow_matching` sugieren el uso de flow matching y de información de mirada, pero no hay documentación técnica que lo confirme.

Tampoco se detallan los datos de entrenamiento más allá del dataset asociado, `fecasado/Ncubes-to-Nbaskets-320x240`. El nombre del dataset indica imágenes de 320x240 y una tarea de trasvase de cubos a cestas, pero se desconoce el número de episodios, la composición exacta, el número de tokens o muestras, y si hubo etapas de RLHF, DPO u otro ajuste posterior. El ejemplo de entrenamiento de la model card menciona `--policy.type=act`, pero se trata de un ejemplo genérico de la plantilla y no confirma que este checkpoint concreto use ACT.

## Capacidades

- Ejecución de políticas visuomotoras para manipulación robótica: se infiere del pipeline `robotics` y de la integración con LeRobot, aunque el autor no lo describe explícitamente.
- Control de tareas de pick-and-place en un entorno de laboratorio, probablemente con cubos y cestas, a partir de observaciones visuales de 320x240.
- Integración con el flujo de entrenamiento y evaluación de LeRobot mediante `lerobot-train` y `lerobot-record`.
- Entrada visual: el dataset asociado indica resolución 320x240, aunque no se especifica si el modelo consume una o varias cámaras.
- No soporta tool calling ni function calling; no es un modelo de lenguaje.
- No dispone de capacidades de agente, razonamiento multi-paso textual ni modo «thinking».
- No es multilingüe en el sentido habitual: no procesa lenguaje natural de forma documentada.
- No se documentan capacidades de audio, vídeo, visión general o generación de texto.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo puede ejecutar una política entrenada para trasvasar cubos a cestas en un robot compatible con LeRobot. Es adecuado para prototipos de manipulación porque el checkpoint es pequeño (75,2 M) y se integra en el flujo estándar de LeRobot.
- Evaluación comparativa de políticas de imitación: sirve como referencia para comparar ACT, Diffusion Policy u otras políticas de LeRobot en la misma tarea y dataset. Su tamaño compacto facilita repetir experimentos en una sola GPU.
- Prototipado en robótica de bajo coste: con 75,2 M de parámetros, los pesos ocupan aproximadamente 0,30 GB en FP32 y 0,15 GB en FP16, por lo que se puede probar en GPUs de consumo y en plataformas edge compatibles con PyTorch.
- Investigación en flow matching aplicado a acciones: si se confirma que la política usa flow matching, puede utilizarse como punto de partida para estudiar modelos generativos de acciones en manipulación.
- Fine-tuning con nuevas demostraciones: el checkpoint puede servir para ajustar una política a variaciones del entorno, aunque no se documenta el procedimiento exacto ni los hiperparámetros recomendados.
- Docencia y formación en robótica de imitación: permite ilustrar el ciclo completo de LeRobot —grabación de datos, entrenamiento, evaluación y despliegue— con un modelo de tamaño reducido.
- Despliegue en un robot SO-100 u otro seguidor compatible: la model card incluye un ejemplo con `so100_follower`, aunque es un ejemplo genérico y no garantiza compatibilidad directa con este checkpoint.
- Evaluación de robustez frente a cambios de iluminación, posición de cámara o colocación de objetos: útil para medir la degradación de una política entrenada en un dataset específico antes de llevarla a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Precisión | Peso estimado de los pesos | VRAM orientativa para inferencia |
|---|---:|---:|
| FP32 | ~0,30 GB | 1-2 GB |
| FP16/BF16 | ~0,15 GB | 1-1,5 GB |
| INT8 | ~0,075 GB | 0,5-1 GB |
| INT4 | ~0,038 GB | 0,5 GB |

Las cifras de VRAM son estimaciones teóricas a partir de los 75,2 M de parámetros y no incluyen activaciones, imágenes de entrada, overhead del framework ni el coste del robot. No se ha verificado su comportamiento real en ninguna GPU.

- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB para entrenamiento y evaluación; A100 o H100 no son necesarias por tamaño, pero pueden utilizarse en infraestructura compartida.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque no está verificado por el autor.
- Opciones edge: Jetson Orin Nano u Orin NX, siempre que la latencia de la política cumpla la frecuencia de control del robot.
- Despliegue: LeRobot con PyTorch para entrenamiento e inferencia. No se documenta exportación a ONNX, TensorRT ni otras runtime específicas.
- vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje y no se ha publicado un formato compatible con esos servidores.
- Latencia y throughput: no disponibles. Dependen de la GPU, del número de cámaras, de la resolución de entrada, del tamaño de batch y de la frecuencia de control exigida por el robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `fecasado/gfm-cubes-21aN` | 75,2 M | Política robótica LeRobot; flow matching con gaze según nombre y etiquetas, no confirmado | No aplica | Apache-2.0 | Hugging Face |
| ACT en LeRobot | No disponible | Imitación con transformer y chunking de acciones | No aplica | No disponible | Implementación en LeRobot |
| Diffusion Policy | No disponible | Política generativa basada en difusión | No aplica | No disponible | Implementaciones en LeRobot y otros repositorios |
| Otras políticas de LeRobot | No disponible | Imitación visomotora para manipulación | No aplica | No disponible | LeRobot |

No se dispone de datos de parámetros, benchmarks ni licencias de los modelos alternativos en la información proporcionada. La comparación debe hacerse en la misma tarea, con el mismo robot y el mismo conjunto de evaluación, algo que este checkpoint no documenta.

## Limitaciones y advertencias

- La model card está incompleta: incluye la frase «Model type not recognized — please update this template» y no describe la arquitectura, los datos de entrenamiento ni el procedimiento de evaluación.
- No se han publicado benchmarks, curvas de aprendizaje ni métricas de éxito en el robot real. No es posible afirmar su rendimiento o su capacidad de generalización.
- El modelo se ha entrenado con un dataset muy específico, `Ncubes-to-Nbaskets-320x240`. Es previsible que sea sensible a cambios de iluminación, posición de cámara, colores de los cubos, altura de la mesa o disposición de la cesta.
- En robótica, los errores de política no son «alucinaciones» textuales, pero pueden producir acciones inseguras. Es necesario establecer límites de par, paradas de emergencia y supervisión humana.
- No se documentan sesgos del dataset. Pueden aparecer sesgos de posición, apariencia de los objetos o condiciones de laboratorio presentes en las demostraciones.
- La licencia del modelo es Apache-2.0, pero no se indica la licencia del dataset asociado. Antes de un uso comercial hay que verificar tanto el dataset como las dependencias de LeRobot.
- El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, por lo que no cuenta con validación comunitaria.
- No es un modelo de propósito general: no genera texto, no responde preguntas, no soporta tool calling y no debe evaluarse con benchmarks de lenguaje.
- No se dispone de información sobre la frecuencia de control, el tiempo de inferencia ni los requisitos de calibración del robot. Sin esos datos no es apto para producción sin una evaluación previa en el entorno objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fecasado/gfm-cubes-21aN)
- [Dataset Ncubes-to-Nbaskets-320x240](https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
