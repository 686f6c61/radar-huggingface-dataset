# Haku-2004/act_k6end_pred_20

## Resumen

`act_k6end_pred_20` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. El modelo lo ha desarrollado el usuario Haku-2004 y se distribuye a través de Hugging Face con la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. Resuelve el problema de generar comandos de control de un brazo robótico a partir de observaciones visuales, prediciendo fragmentos de acciones (action chunks) en lugar de pasos individuales.

El modelo tiene 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. Se ha entrenado con el dataset `Haku-2004/k6_4seg`, presumiblemente una colección de episodios de teleoperación, y está pensado para controlar un robot tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`). No es un modelo de lenguaje: no procesa texto ni genera respuestas conversacionales, sino que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias de acciones motoras.

Su relevancia radica en que ejemplifica el flujo actual de trabajo en robótica open source: entrenamiento reproducible con LeRobot, pesos en safetensors, licencia Apache 2.0 y despliegue directo sobre robots de bajo coste. Al no tener descargas ni likes, es un artefacto de investigación personal más que un modelo consolidado, y debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador de imágenes (habitualmente ResNet) para procesar las observaciones visuales y un decodificador transformer que genera un chunk de acciones futuras de una sola pasada. La predicción por chunks reduce el error de acumulación típico de las políticas que actúan paso a paso y suaviza la ejecución motora. El modelo incluye además una cabeza de estilo CVAE que modela la variabilidad de las demostraciones humanas durante el entrenamiento.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, del que no se dispone de detalles públicos sobre número de episodios, frecuencia de captura ni composición de sensores. No hay información sobre uso de RLHF, DPO ni ajuste posterior; ACT es puramente supervisado sobre teleoperación. La model card documenta los comandos `lerobot-train` y `lerobot-record` para reproducir el entrenamiento y la evaluación, lo que facilita la replicabilidad, pero no se especifican hiperparámetros, aumentos de datos ni la configuración exacta del robot empleado.

## Capacidades

- Generación de acciones motoras por chunks para control de brazos robóticos de tipo SO-100.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Procesamiento de observaciones visuales y de estado de articulaciones como entrada (según la configuración estándar de ACT en LeRobot).
- Ejecución de tareas manipulativas de corto horizonte reproducidas del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Manipulación robótica de laboratorio: replicar una tarea concreta (por ejemplo, recoger y colocar un objeto) sobre un SO-100, usando `lerobot-record` con `--policy.path` apuntando a este checkpoint y evaluando la tasa de éxito en 10 episodios.
- Investigación en aprendizaje por imitación: servir como línea base reproducible para comparar variantes de ACT, cambios en el dataset o aumentos de datos, dado que el pipeline de entrenamiento está documentado.
- Prototipado rápido de políticas de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, se puede cargar en una GPU de consumo y iterar sobre el robot físico sin infraestructura dedicada.
- Docencia y formación en robótica: demostrar el ciclo completo teleoperación → dataset → entrenamiento → evaluación con herramientas open source y licencia permisiva.
- Automatización de tareas repetitivas de pick-and-place en entornos controlados, siempre que la distribución visual coincida con la del dataset `k6_4seg`.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y safetensors, se puede reentrenar o adaptar a un robot y una tarea distintos partiendo de estos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros, ~0,2 GB de pesos); el consumo real dependerá del codificador visual y del tamaño de lote.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas GTX 1660, RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño para no requerir hardware de datacenter.
- Cabe holgadamente en GPU de consumo e incluso podría ejecutarse en CPU para inferencia de baja frecuencia, aunque no se documentan latencias.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es la vía oficial documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k6end_pred_20` | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | MIT (repo LeRobot) | Hugging Face / GitHub |
| SmolVLA (Hugging Face) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos cuantitativos para establecer una comparación de rendimiento fiable con alternativas. La comparación se limita a la categoría (políticas de imitación para manipulación) y a la licencia.

## Limitaciones y advertencias

- Modelo de investigación personal con 0 descargas y 0 likes: no hay evidencia pública de validación independiente.
- Sin métricas de éxito publicadas; no se puede afirmar que generalice fuera de las condiciones del dataset `k6_4seg`.
- Fuerte dependencia de la distribución visual y de la configuración del robot de entrenamiento; cambios de cámara, iluminación o robot pueden degradar el rendimiento.
- No es un modelo de lenguaje: no admite prompts en texto, tool calling ni razonamiento; usarlo fuera del pipeline LeRobot requiere adaptación.
- Riesgo de sobreajuste a las trayectorias teleoperadas, con poca robustez ante perturbaciones no vistas.
- No se documentan sesgos, pero al derivar de demostraciones humanas puede heredar sesgos de ejecución del operador.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace recomendable una validación exhaustiva antes de desplegarlo en producción.
- La fecha de creación del repositorio (2026-11-14) y la falta de documentación adicional impiden verificar el estado de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6end_pred_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
