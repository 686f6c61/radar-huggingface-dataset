# OlenaG/chesster_act_v2

## Resumen

`chesster_act_v2` es una política de imitación (imitation learning) para control robótico entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La ha subido el usuario OlenaG al Hub de Hugging Face mediante la librería LeRobot de Hugging Face, y está pensada para ejecutarse sobre un robot de tipo `so_follower` (brazo tipo SO-100/SO-101) equipado con tres cámaras: `top`, `front` y `hand`. No es un modelo de lenguaje: es un modelo visuomotor que asigna observaciones (estado articular de 6 dimensiones más tres imágenes RGB) a acciones de 6 dimensiones.

El modelo resuelve una única tarea de manipulación descrita literalmente como "Grab the figure from the blue square and put it into the green square", aprendida a partir de 50 episodios de teleoperación (40.698 fotogramas a 30 FPS) del dataset `OlenaG/chesster_v2_fixed`. Con 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB, es un modelo compacto que cabe holgadamente en cualquier GPU consumer, lo que lo hace útil como ejemplo reproducible de un pipeline completo de LeRobot: grabación de datos, entrenamiento y despliegue.

Su relevancia es acotada y experimental: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y sin licencia declarada. Es adecuado para reproducir el flujo de trabajo de ACT en LeRobot o como punto de partida para reentrenar con datos propios, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo visuomotor, sin entrada/salida de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice trozos (chunks) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume `observation.state` (vector de 6 dimensiones), tres cámaras RGB (`top` a 480×640, `front` a 480×640, `hand` a 360×640) y produce un vector `action` de 6 dimensiones. El checkpoint se entrenó con LeRobot 0.6.2 durante 60.000 pasos, con batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000.

Los datos de entrenamiento provienen del dataset `OlenaG/chesster_v2_fixed`: 50 episodios, 40.698 fotogramas a 30 FPS, una sola tarea de pick-and-place. No se documenta composición adicional del dataset, ni uso de RLHF/DPO (no aplica en imitación supervisada), ni innovaciones más allá del chunking de acciones propio de ACT. Tampoco se indica si hubo aumento de datos, filtrado o corrección de episodios pese al sufijo "fixed" del dataset.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con 6 grados de libertad a partir de estado articular e imágenes.
- Ejecución de una tarea concreta de pick-and-place: coger una figura de un cuadrado azul y depositarla en un cuadrado verde.
- Fusión de tres vistas de cámara (superior, frontal y de mano) para localizar objetos y guiar la pinza.
- Predicción de chunks de acciones, lo que aporta suavidad y tolerancia a ruido en la ejecución.
- Integración nativa con LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües: es un modelo específico de robótica.

## Casos de uso

- Reproducción del pipeline de ACT en LeRobot: sirve para validar de extremo a extremo la instalación, la calibración del robot y el comando `lerobot-rollout` con un checkpoint ya entrenado, antes de invertir tiempo en datos propios.
- Reentrenamiento con datos propios: el comando `lerobot-train --policy.type=act` documentado en la model card permite sustituir el dataset `chesster_v2_fixed` por grabaciones nuevas y reutilizar la misma configuración (60.000 pasos, lr 1e-05) como línea base.
- Docencia y formación en imitation learning: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede entrenar y desplegar en una sola GPU consumer, lo que facilita talleres prácticos de robótica.
- Benchmark interno de tareas de pick-and-place: la tarea está bien delimitada (objeto, zona origen y zona destino), lo que permite medir tasas de éxito de forma controlada y comparar variantes de ACT.
- Prueba de concepto de manipulación con múltiples cámaras: el uso de tres vistas (incluida una cámara en la mano) es un caso interesante para estudiar el impacto de la configuración sensorial en el éxito de la política.
- Base para experimentos de generalización: al no haber evaluación publicada, es un punto de partida para medir cómo se degrada la política ante cambios de iluminación, posición de objetos o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la plantilla vacía y la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 son unos 0,2 GB de pesos, más el coste de las tres cámaras y del codificador visual. Cabe en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para pruebas, aunque la latencia será mayor.
- Cabe en GPU consumer: sí, en todas las gamas actuales; el cuello de botella real es la captura de tres flujos de vídeo a 30 FPS, no el modelo.
- Opciones de despliegue: `lerobot-rollout` (recomendado por el autor), y en general el stack de LeRobot con PyTorch. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. El entrenamiento usó batch size 1, lo que sugiere que el autor priorizó compatibilidad con hardware modesto sobre throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OlenaG/chesster_act_v2` | 51,7 M | Pick-and-place con `so_follower` | Estado 6D + 3 cámaras | no disponible | Hub, 0 descargas |
| Políticas ACT de referencia en LeRobot | ~50 M (típico en ACT) | Manipulación genérica | Estado + cámaras | según checkpoint | Hub de LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable, mayor que ACT | Manipulación con acciones multimodales | Estado + cámaras | según checkpoint | Hub de LeRobot |
| Políticas VLA tipo OpenVLA / π0 | miles de millones | Manipulación generalista con lenguaje | Estado + cámaras + instrucción textual | variable | Hub y repos públicos |

No se dispone de datos de rendimiento comparativo para `chesster_act_v2`, por lo que la comparación se limita a arquitectura, tamaño y disponibilidad. Frente a un VLA generalista, este checkpoint es tres o cuatro órdenes de magnitud más pequeño y está especializado en una sola tarea; frente a otras políticas ACT de LeRobot, la diferencia principal es el dataset y la configuración de cámaras, no la arquitectura.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador y entorno, es probable que herede sesgos de posición, iluminación y estilo de teleoperación.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erráticas o fuera de distribución ante observaciones no vistas.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje; la tarea está fijada en el prompt "Grab the figure from the blue square and put it into the green square" y no admite instrucciones nuevas.
- Restricciones de licencia: la licencia no está declarada ("[More Information Needed]"), por lo que no se puede asumir uso comercial sin consultar al autor.
- Sin evaluación publicada: no hay tasa de éxito medida, ni número de ensayos, ni condiciones de prueba; no se debe asumir robustez en producción.
- Dependencia fuerte del hardware: requiere un robot `so_follower` y tres cámaras con los nombres e índices exactos (`top`, `front`, `hand`) y las resoluciones indicadas; cualquier cambio en la configuración sensorial invalida el checkpoint.
- Dataset pequeño: 50 episodios y una sola tarea limitan la generalización a variaciones de objeto, posición o entorno.
- Metadatos incompletos: la model card no incluye demo en vídeo, ni curvas de entrenamiento, ni información sobre el proceso de "fix" del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OlenaG/chesster_act_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/OlenaG/chesster_v2_fixed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OlenaG/chesster_v2_fixed
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
