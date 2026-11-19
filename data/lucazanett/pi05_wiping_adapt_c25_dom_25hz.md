# lucazanett/pi05_wiping_adapt_c25_dom_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face. El checkpoint `lucazanett/pi05_wiping_adapt_c25_dom_25hz` es un ajuste fino de dicha política sobre el dataset `lucazanett/new_setup_wiping_adaptive_01_25hz`, orientado a la tarea robótica de limpieza o fregado (wiping) en un entorno de laboratorio concreto. El modelo resuelve el problema de la generalización en mundo abierto en robótica: pretende ejecutar tareas de manipulación en entornos y situaciones no vistas durante el entrenamiento, en lugar de limitarse a escenarios controlados.

El checkpoint contiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) en formato safetensors, con un tamaño de repositorio de 9,4 GB. La arquitectura subyacente es la de π₀.₅, un modelo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, aunque la información proporcionada no detalla la composición interna exacta ni la longitud de contexto. La licencia es Apache 2.0 y la librería asociada es LeRobot, lo que facilita su uso con el ecosistema de entrenamiento e inferencia de Hugging Face para robótica.

La relevancia de esta ficha radica en que se trata de un checkpoint de política robótica entrenado sobre un dataset específico de fregado adaptativo a 25 Hz, lo que permite evaluar el estado del arte en VLA aplicado a una tarea concreta. Al ser un modelo de nicho con cero descargas y cero likes en el momento de la consulta, su interés es principalmente técnico y de investigación, no de producción masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lucazanett/new_setup_wiping_adaptive_01_25hz |
| Tamano del repositorio | 9,4 GB |
| Frecuencia de control | 25 Hz (segun el nombre del checkpoint) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un modelo de visión-lenguaje-acción de Physical Intelligence que evoluciona de π₀ para abordar la generalización en mundo abierto. La implementación disponible en este repositorio es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence. La arquitectura combina percepción visual, comprensión del lenguaje y generación de acciones motoras, si bien la información proporcionada no detalla la composición exacta de cada componente (codificador visual, backbone de lenguaje, cabeza de acciones) ni el número de tokens de entrenamiento.

El checkpoint concreto ha sido entrenado sobre el dataset `lucazanett/new_setup_wiping_adaptive_01_25hz`, que por su nombre sugiere episodios de fregado adaptativo a 25 Hz en una configuración de laboratorio. No se dispone de información sobre la composición del dataset, el número de episodios, si hubo RLHF o DPO, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card únicamente documenta el flujo de entrenamiento e inferencia con LeRobot (`lerobot-train` y `lerobot-record`), sin detallar hiperparámetros ni estrategia de entrenamiento.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural, propia de un modelo VLA.
- Generalización a entornos y situaciones no vistas durante el entrenamiento, según la descripción de π₀.₅ de Physical Intelligence.
- Ejecución de tareas de manipulación orientadas al fregado o limpieza (wiping) en la configuración del dataset de entrenamiento.
- Control a 25 Hz, adecuado para políticas de robot que requieren frecuencia de control relativamente alta.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) e inferencia/evaluación (`lerobot-record`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión sí por su naturaleza VLA; el resto no disponible.

## Casos de uso

- Fregado adaptativo de superficies en laboratorio: el checkpoint se ha entrenado específicamente sobre el dataset `new_setup_wiping_adaptive_01_25hz`, por lo que su uso principal es reproducir y evaluar la política de wiping en la misma configuración robótica (por ejemplo, brazo SO-100 seguidor según el ejemplo de la model card).
- Evaluación de políticas VLA en investigación: sirve como punto de partida para comparar el rendimiento de π₀.₅ frente a otras políticas en tareas de manipulación con contacto, usando `lerobot-record` con `--policy.path` apuntando a este checkpoint.
- Reentrenamiento o ajuste fino sobre nuevos datasets de fregado: al estar en formato LeRobot y licencia Apache 2.0, puede usarse como inicialización para adaptar la política a otras superficies, herramientas o entornos.
- Despliegue en robots de bajo coste tipo SO-100: la model card muestra explícitamente el uso con `so100_follower`, lo que sugiere viabilidad en plataformas económicas de investigación.
- Generación de datos sintéticos o aumento de datasets: la política puede ejecutarse para recolectar episodios adicionales de wiping que alimenten otros entrenamientos.
- Pruebas de generalización en mundo abierto: dado que π₀.₅ está diseñado para generalizar a entornos no vistos, el checkpoint permite experimentar con variaciones de iluminación, posición de objetos o superficies para medir la robustez de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 16,6 GB solo para pesos, más memoria para activaciones y buffer visual; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en fp16/bf16: alrededor de 8,3 GB para pesos, más activaciones; se recomienda 16 GB o más.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para fp16/bf16, aunque no se confirma en la información.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 4090 (24 GB) en fp16; en GPUs de 8-12 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia/evaluación); no se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son el entorno natural para una política VLA.
- Latencia y throughput estimados: no disponibles; la frecuencia de control de 25 Hz sugiere que la política fue entrenada para operar a ese ritmo, pero no se confirma el rendimiento en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_wiping_adapt_c25_dom_25hz (este) | 4,14 B | no disponible | VLA, wiping adaptativo | Apache 2.0 | Hugging Face (LeRobot) |
| π₀ (Pi0) | no disponible | no disponible | VLA generalista | no disponible | OpenPI de Physical Intelligence |
| π₀.₅ base (Pi05) | no disponible | no disponible | VLA con generalización en mundo abierto | no disponible | OpenPI / Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado sobre un dataset concreto de wiping adaptativo; su rendimiento fuera de esa tarea y configuración no está garantizado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de un laboratorio específico, puede heredar sesgos de esa configuración (iluminación, tipo de superficie, morfología del robot).
- Riesgo de alucinación en el sentido de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento; en robótica esto se traduce en movimientos erráticos o colisiones.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; verificar la licencia de los componentes base de π₀.₅ y OpenPI antes de producción.
- Caveat para producción: la model card no documenta métricas de éxito, tasas de fallo ni protocolos de seguridad; no se recomienda su despliegue en entornos reales sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_adapt_c25_dom_25hz
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_wiping_adaptive_01_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
