# jskumaar/diffusion_ira_lego

## Resumen

`jskumaar/diffusion_ira_lego` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy (arXiv:2303.04137) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitación que, a partir de dos cámaras (una en la muñeca del robot y otra cenital) y del estado articular de 6 dimensiones, genera trayectorias de acción de 6 dimensiones para un brazo seguidor tipo `so_follower` (familia SO-100). Lo desarrolla el usuario `jskumaar` (Suresh Kumaar Jayaraman, investigador postdoctoral en interacción humano-robot) dentro del proyecto Project-IRA.

El modelo resuelve una tarea concreta de manipulación: clasificar piezas de Lego por color (rojo, verde, amarillo y azul) y depositarlas en el plato del color correspondiente. Se entrenó sobre el dataset `Project-IRA/lego`, con 300 episodios y 298.768 fotogramas a 30 FPS, y contiene 277.840.110 parámetros en formato safetensors, con un repositorio de 1,1 GB que incluye pesos y artefactos de entrenamiento.

Su relevancia es la de un artefacto de investigación reproducible: sirve como referencia práctica de Diffusion Policy aplicada a manipulación con contacto, como base para comparaciones frente a políticas ACT o basadas en modelos fundacionales (el mismo autor publica `act_ira_lego` y `groot_ira_lego` sobre el mismo dataset) y como punto de partida para fine-tuning en entornos de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión para control visuomotor (Diffusion Policy, arXiv:2303.04137); red de denoising condicionada por imágenes y estado. Backbone exacto no disponible en la model card |
| Parámetros totales | 277.840.110 (277,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); horizonte de predicción de acciones no disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors sin variantes documentadas (INT8/FP16/GGUF) |
| Idiomas soportados | No aplica como modelo lingüístico; las instrucciones de tarea del dataset están en inglés |
| Licencia | No disponible (la model card indica «[More Information Needed]») |
| Formato de pesos | safetensors (formato de política LeRobot) |
| Tipo de robot | `so_follower` (brazo seguidor de la familia SO-100) |
| Cámaras de entrada | `wrist_left` y `desk_view`, ambas a 480×640, 3 canales |
| Dimensión de observación / acción | Estado `(6,)` / acción `(6,)` |
| Dataset de entrenamiento | `Project-IRA/lego`: 300 episodios, 298.768 fotogramas, 30 FPS |
| Configuración de entrenamiento | 40.000 pasos, batch 16, optimizador Adam, lr 1e-4, semilla 1000, LeRobot 0.6.2 |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el planteamiento de Diffusion Policy: el control visuomotor se modela como un proceso generativo de difusión que produce una secuencia de acciones (no una acción aislada), lo que según el artículo original favorece la suavidad de las trayectorias y el rendimiento en tareas con contacto rico. La entrada combina dos flujos visuales de 3×480×640 píxeles con un vector de estado propioceptivo de 6 dimensiones; la salida es un vector de acción de 6 dimensiones, coherente con un brazo de 6 grados de libertad más pinza. La model card no especifica el backbone de la red de denoising, el número de pasos de difusión en inferencia ni el horizonte de predicción.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos con batch de 16, Adam y tasa de aprendizaje 1e-4, partiendo de 300 demostraciones teleoperadas del dataset `Project-IRA/lego`. El dataset incluye 30 variantes de instrucción en inglés para la misma tarea de clasificación por color («Sort the lego by color», «Put red lego on red plate», etc.), lo que sugiere condicionamiento por lenguaje o, al menos, etiquetado multi-prompt de la misma habilidad. No se documenta el uso de RLHF, DPO ni de datos sintéticos, ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción continuas de 6 dimensiones para manipulación de objetos con un brazo `so_follower`.
- Percepción visual multimodal: fusión de una vista de muñeca y una vista cenital de escritorio a 480×640.
- Ejecución de una tarea de clasificación por color con cuatro categorías (rojo, verde, amarillo, azul) y colocación en el plato correspondiente.
- Robustez ante variación de instrucción: el dataset contiene 30 formulaciones distintas de la misma tarea en inglés.
- Control reactivo a partir de estado propioceptivo de 6 dimensiones, adecuado para tareas con contacto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, matemáticas, código ni procesamiento de audio.
- No dispone de modo «thinking» ni de capacidades generativas de texto.

## Casos de uso

- Clasificación de piezas Lego por color en una célula de laboratorio: el modelo recibe las dos vistas de cámara y el estado del brazo y emite acciones de 6 dimensiones para recoger cada pieza y depositarla en el plato de su color.
- Reproducción de experimentos de imitación: al estar entrenado con LeRobot 0.6.2 y publicar la configuración completa (40.000 pasos, batch 16, lr 1e-4), permite replicar el pipeline `lerobot-train` y comparar curvas de aprendizaje.
- Comparación de familias de políticas: el mismo autor publica `act_ira_lego` y `groot_ira_lego` sobre el mismo dataset, lo que permite evaluar Diffusion Policy frente a ACT y frente a modelos fundacionales de robot en condiciones controladas.
- Fine-tuning para nuevos colores u objetos: los pesos sirven de inicialización para reentrenar con un dataset reducido de demostraciones cuando se añaden categorías o se cambia la disposición del escritorio.
- Docencia en robótica e interacción humano-robot: su tamaño (277,8 M de parámetros, 1,1 GB de repositorio) y su dependencia de hardware de bajo coste lo hacen viable en prácticas de laboratorio con un SO-100.
- Estudio de despliegue sim-to-real: al depender de dos cámaras con nombres y resoluciones fijas, es un banco de pruebas para analizar sensibilidad a calibración, iluminación y encuadre.
- Generación de datos de evaluación: las 30 variantes de instrucción del dataset permiten medir la sensibilidad del modelo al fraseo de la tarea en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card no incluye tasas de éxito en robot real ni en simulación, y no se aportan métricas de error de acción, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,11 GB en FP32 y unos 0,56 GB en FP16/BF16; sumando activaciones de dos imágenes de 480×640 y el bucle de denoising, una estimación razonable es de 2 a 4 GB con batch 1 en FP32 (estimación propia, no documentada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más para inferencia (RTX 3060/4060, RTX 4070, A4000); para reentrenamiento con el pipeline completo conviene partir de 16-24 GB (RTX 4090, A100, L40S), aunque el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en modelos de 8 GB o superiores; el despliegue en CPU es posible en teoría pero no se documenta latencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (inferencia en robot real), scripts de LeRobot sobre PyTorch; no aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que implica un presupuesto de 33 ms por paso de control, pero no se confirma que la política alcance esa frecuencia en inferencia; el coste depende del número de pasos de denoising, que no se especifica.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jskumaar/diffusion_ira_lego` | Diffusion Policy (generativa) | 277,8 M | No disponible | No disponible | Pública en HF, 0 descargas |
| `jskumaar/act_ira_lego` | ACT (Action Chunking Transformer) | No disponible | No disponible | No disponible | Pública en HF |
| `jskumaar/groot_ira_lego` | Modelo fundacional de robot (GR00T) | No disponible | No disponible | No disponible | Pública en HF |
| Diffusion Policy original (Chi et al., 2023) | Referencia metodológica | No disponible | No disponible | No disponible | Paper y código públicos |

Los tres modelos del mismo autor comparten el dataset `Project-IRA/lego` y el robot `so_follower`, por lo que constituyen una comparación directa de enfoques (difusión frente a transformers de chunking de acciones frente a modelos fundacionales). No se han publicado métricas comparativas entre ellos en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que no puede afirmarse su fiabilidad en producción.
- Licencia no especificada: la model card indica «[More Information Needed]», de modo que el uso comercial es jurídicamente incierto hasta que el autor la defina.
- Dominio muy restringido: una única tarea (clasificación de Lego por color) sobre 300 episodios de un laboratorio concreto; la generalización a otros objetos, colores o disposiciones no está demostrada.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo, posición de cámaras o calibración pueden degradar el rendimiento sin que existan datos públicos que lo cuantifiquen.
- Dependencia estricta de la configuración de sensores: los nombres `wrist_left` y `desk_view`, la resolución 480×640 y la frecuencia de 30 FPS forman parte del contrato de entrada.
- Instrucciones únicamente en inglés: las 30 variantes de prompt del dataset están redactadas en inglés; no hay evidencia de soporte multilingüe.
- Sin garantías de seguridad física: como política de control sobre hardware real, no incorpora mecanismos documentados de parada, límites de par o detección de fallos.
- Sesgos: no se documenta análisis de sesgo, pero el dataset puede estar desbalanceado entre colores y condiciones de manipulación.
- Madurez mínima: 0 descargas y 0 «likes» en el momento de la consulta, sin validación por parte de la comunidad.
- El «riesgo de alucinación» no aplica en sentido lingüístico, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la observación se aleja de las condiciones de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jskumaar/diffusion_ira_lego
- Dataset de entrenamiento: https://huggingface.co/datasets/Project-IRA/lego
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Project-IRA/lego
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo comparable ACT del mismo autor: https://huggingface.co/jskumaar/act_ira_lego
- Modelo comparable GR00T del mismo autor: https://huggingface.co/jskumaar/groot_ira_lego
- Perfil de GitHub del autor: https://github.com/jskumaar
