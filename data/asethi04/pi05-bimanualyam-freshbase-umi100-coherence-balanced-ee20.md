# ASethi04/pi05-BimanualYAM-freshbase-umi100-coherence-balanced-ee20

## Resumen

El modelo `pi05-BimanualYAM-freshbase-umi100-coherence-balanced-ee20`, publicado por el usuario ASethi04 en HuggingFace, es un modelo de visión-lenguaje-acción (VLA) diseñado para robótica bimanual, es decir, para el control coordinado de dos brazos robóticos. Se basa en la arquitectura Pi0.5, desarrollada por Physical Intelligence, que es una evolución del modelo Pi0 con mejor generalización en entornos abiertos. El modelo se ha entrenado durante 12.000 pasos de optimización sobre datos UMI (Universal Manipulation Interface) puramente canónicos, con un muestreo balanceado por coherencia de trayectoria y sin ningún frame de teleoperación.

La tarea concreta para la que está optimizado es "recoger naranjas y colocarlas en un bol", un ejemplo representativo de manipulación de precisión con dos brazos. El modelo tiene 4.143 millones de parámetros y se distribuye en formato safetensors a través de la librería LeRobot. Es relevante porque demuestra cómo entrenar un VLA de tamaño medio con datos de demostración limpios y sin teleoperación, y porque la variante "coherence" introduce un método de muestreo de datos que prioriza la coherencia de las trayectorias, un aspecto poco explorado en la literatura. No se especifica la longitud de contexto ni la licencia, lo que limita su uso directo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en Pi0.5, flow-based |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo robótico, no un modelo de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pi0.5, un VLA de tipo flow que genera acciones continuas a partir de observaciones visuales y lingüísticas. Pi0.5 es una evolución de Pi0 que incorpora mejoras en la generalización a entornos y objetos no vistos durante el entrenamiento. El modelo se entrenó sobre el conjunto de datos `brandonyang/dual-lidar-umi-independent`, que contiene demostraciones de manipulación bimanual capturadas con dos sensores LIDAR, un formato propio de la interfaz UMI (Universal Manipulation Interface). El entrenamiento consistió en 12.000 pasos de optimizador con una estrategia de muestreo denominada "trajectory-coherence-balanced", que selecciona trayectorias de manera que se mantenga una coherencia interna en el conjunto de datos, y se excluyeron por completo los frames de teleoperación. La acción se define como un espacio de 24 dimensiones (H24) con 20 grados de libertad del efector final (EE20), representada en coordenadas SE(3) relativas al estado actual, con una representación de rotación R6D y una apertura de pinza futura absoluta. No se aplicó contracción de rotación ni historial de estado. La tarea concreta se describe textualmente como "pick up oranges and place them in the bowl". No se menciona el uso de RLHF, DPO ni técnicas de refuerzo; se trata de un entrenamiento de imitación puro sobre datos demostrados.

## Capacidades

- Manipulación bimanual: controla dos brazos robóticos de forma coordinada para tareas de recoger y colocar objetos.
- Percepción multimodal: integra datos de dos LIDAR para percibir la escena y los objetos, aunque no se especifican detalles sobre el procesamiento visual.
- Acciones de efector final de alta precisión: genera posiciones SE(3) relativas con representación R6D y apertura de pinza absoluta, lo que permite movimientos finos y adaptativos.
- Entrenamiento sin teleoperación: los datos son demostraciones canónicas UMI, lo que facilita la replicación en entornos de investigación sin necesidad de sistemas de teleoperación.
- Especialización en tareas de manipulación de objetos pequeños y frágiles (como naranjas) en escenarios controlados.
- No es un modelo de lenguaje general: no genera texto ni respuestas de diálogo, sino solo secuencias de acciones robóticas.
- No se han documentado capacidades de tool calling, agentes autónomos ni razonamiento multi-paso fuera del contexto de manipulación.

## Casos de uso

- Investigación en robótica bimanual: el modelo sirve como punto de partida para estudiar el control coordinado de dos brazos en tareas de pick-and-place, permitiendo comparar estrategias de muestreo de datos y arquitecturas VLA.
- Automatización de almacenes y logística: la capacidad de recoger objetos y colocarlos en contenedores es directamente aplicable a tareas de clasificación o empaquetado en entornos controlados, aunque requiere validación adicional en hardware real.
- Desarrollo de robots de cocina: la tarea de recoger frutas y colocarlas en un bol es un ejemplo típico de preparación de alimentos, y el modelo puede adaptarse mediante fine-tuning a otras frutas o recipientes.
- Pruebas de robustez de modelos VLA: al estar entrenado con datos puramente canónicos y sin teleoperación, es útil para evaluar la robustez de los modelos ante variaciones en la distribución de datos.
- Estudio de técnicas de muestreo de trayectorias: la variante "coherence" introduce un método de balanceo de datos basado en coherencia, que puede ser replicado en otros conjuntos de datos para investigar su impacto en el rendimiento.
- Integración en pipelines de aprendizaje por imitación: se puede combinar con la librería LeRobot para experimentar con estrategias de entrenamiento y evaluación en simuladores o robots físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que la evaluación adjunta es una reproducción de observaciones del conjunto de entrenamiento (matched training-set observation replay), no una prueba de rendimiento en hardware real ni con datos fuera de distribución. Por lo tanto, no existen métricas fiables como MMLU, HumanEval o GSM8K (que son irrelevantes para un modelo de acción robótica), ni resultados de éxito en tareas de manipulación reales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143 millones de parámetros, en precisión FP32 se necesitan aproximadamente 16,6 GB de VRAM; en BF16 o FP16, unos 8,3 GB; en cuantización INT8, unos 4,1 GB. Sin embargo, no se han publicado cuantizaciones oficiales ni se indica la precisión de los pesos.
- GPU recomendadas: para una ejecución fluida en tiempo real en robótica, se requieren GPUs de gama alta como NVIDIA A100, H100, RTX 4090 o similares con al menos 12-16 GB de VRAM. No se ha probado en hardware de consumo.
- Compatibilidad con GPU consumer: no se ha verificado explícitamente, pero por el tamaño del modelo, una RTX 4090 (24 GB) podría ser suficiente en FP16 si el framework lo permite.
- Opciones de despliegue: la librería es LeRobot (HuggingFace), que ofrece herramientas de entrenamiento y evaluación. También se puede usar con el framework openpi de Physical Intelligence, que soporta modelos Pi0.5. No se han documentado despliegues con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Al ser un modelo de acción continua, la latencia depende del hardware y del framework, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ASethi04/pi05-BimanualYAM-freshbase-umi100-coherence-balanced-ee20` | 4.14 B | no disponible | Manipulación bimanual (recoger y colocar) | no disponible | Hugging Face |
| `ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20` | no disponible | no disponible | Manipulación bimanual con 5% de frames de teleoperación | no disponible | Hugging Face |
| `ASethi04/pi05-BimanualYAM-freshbase-rotcontract-umi100-ee20` | no disponible | no disponible | Manipulación bimanual con contracción de rotación | no disponible | Hugging Face |
| Pi0 (Physical Intelligence) | 3.3 B (estimado) | no disponible | VLA general para manipulación | no disponible | OpenPI (GitHub) |
| Pi0.5 (Physical Intelligence) | no disponible | no disponible | VLA con mejor generalización | no disponible | OpenPI (GitHub) |

La comparación se limita a los modelos del mismo autor y a la familia Pi0/Pi0.5, ya que no se dispone de modelos equivalentes de otros autores con características comparables. No se pueden extraer conclusiones de rendimiento porque no hay benchmarks públicos.

## Limitaciones y advertencias

- La evaluación del modelo es un "replay" de observaciones del conjunto de entrenamiento, no una prueba en hardware real ni con datos de validación independientes. No se puede afirmar que el modelo funcione en condiciones reales sin una validación adicional.
- El uso en hardware requiere un camino de seguridad de efector final a cinemática inversa (EE-to-IK) y supervisión de un operador humano, ya que el modelo no incluye control de seguridad intrínseco.
- No se especifica la licencia, lo que impide su uso comercial sin consultar al autor y limita la claridad legal.
- El modelo está entrenado para una única tarea concreta (recoger naranjas y colocarlas en un bol). No se puede esperar que generalice a otras tareas sin fine-tuning, y no se ha demostrado robustez ante cambios de iluminación, objetos o entornos.
- No se dispone de información sobre sesgos, alucinaciones o fallos de comportamiento, pero al ser un modelo de acciones robóticas, los riesgos están en errores de control que pueden causar daños físicos.
- Se recomienda fijar la revisión inmutable del Hub (commit hash) en lugar de la rama `main`, para garantizar la reproducibilidad.
- No se han publicado cuantizaciones, lo que limita el despliegue en dispositivos con recursos reducidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-umi100-coherence-balanced-ee20
- Variante con datos de teleoperación: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20
- Variante con contracción de rotación: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-rotcontract-umi100-ee20
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Documentación de OpenPI en DeepWiki: https://deepwiki.com/Physical-Intelligence/openpi
- Librería LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Dataset UMI dual-lidar: https://huggingface.co/datasets/brandonyang/dual-lidar-umi-independent
