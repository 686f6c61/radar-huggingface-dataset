# songbirdini/callmark-voxaboxen

## Resumen

CallMark Voxaboxen es un conjunto de pesos entrenados para la reproducción del paper CallMark, un trabajo de bioacústica computacional centrado en la detección e identificación de vocalizaciones animales. El modelo ha sido publicado por el usuario songbirdini en Hugging Face y deriva del proyecto Voxaboxen de Earth Species Project, una iniciativa de código abierto orientada al análisis de audio de fauna salvaje mediante aprendizaje profundo. El repositorio contiene variantes entrenadas para tres tareas: detección (`detection_<size>`), identificación (`identification_<size>`) y detección con taxón (`taxon_<size>`).

La nomenclatura de los pesos incluye los tamaños 50, 100 y 500, que corresponden al número de vocalizaciones de entrenamiento por taxón. Cada ejecución almacena los pesos, la configuración y, en un archivo `outputs.tar`, las salidas de test generadas al finalizar el entrenamiento. El repositorio ocupa 5,3 GB y no incluye información sobre arquitectura, contexto, idiomas ni licencia explícita más allá de la referencia a los términos del release original de Voxaboxen.

La relevancia de este modelo reside en su carácter reproducible y abierto para investigación bioacústica: permite a otros grupos validar los resultados del paper CallMark y reutilizar los pesos en pipelines de monitorización de biodiversidad. No obstante, la información pública disponible es muy limitada y no permite evaluar su rendimiento de forma independiente sin consultar el repositorio de código asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | no disponible (se remite a los terminos del release de Earth Species Project Voxaboxen) |
| Formato de pesos | no disponible (el repo incluye pesos y `outputs.tar`; el script `download_models.py` los desempaqueta) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo en la documentación proporcionada. El proyecto del que deriva, Voxaboxen de Earth Species Project, se orienta al procesamiento de audio bioacústico, pero la model card no detalla si se trata de un transformer, un modelo convolucional, un modelo híbrido o cualquier otra familia. Tampoco se especifican el número de tokens de audio, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO.

Lo que sí se documenta es el esquema de entrenamiento por tareas y tamaños: para cada tarea (detección, identificación y detección con taxón) existen variantes con 50, 100 y 500 vocalizaciones por taxón. Cada ejecución guarda los pesos, la configuración y las salidas de test en `outputs.tar`, lo que facilita la reproducibilidad. El script `download_models.py` del repositorio de GitHub descarga y descomprime los archivos, y escribe la ruta raíz de datos en la configuración para que los scripts de predicción puedan leer los pesos.

## Capacidades

- Detección de vocalizaciones animales en audio bioacústico (variantes `detection_<size>`).
- Identificación de especies o taxones a partir de vocalizaciones (variantes `identification_<size>`).
- Detección con asignación de taxón en una sola pasada (variantes `taxon_<size>`).
- Entrenamiento escalable por número de vocalizaciones por taxón (50, 100 y 500).
- Reproducibilidad de resultados del paper CallMark mediante pesos y salidas de test incluidas.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Monitorización de biodiversidad en campo: los pesos de detección permiten procesar grabaciones de sensores acústicos pasivos para identificar la presencia de especies concretas en un hábitat, gracias a las variantes `detection_50`, `detection_100` y `detection_500` según el volumen de datos disponible por taxón.
- Validación de resultados del paper CallMark: investigadores pueden descargar los pesos y las salidas de test (`outputs.tar`) para reproducir las métricas publicadas y comparar con sus propias implementaciones.
- Identificación de especies en estudios de ecología: las variantes `identification_<size>` permiten clasificar vocalizaciones a nivel de especie o taxón, útiles en inventarios faunísticos y estudios de distribución.
- Detección con taxón en pipelines de anotación automática: la variante `taxon_<size>` combina detección y asignación taxonómica, lo que reduce pasos en flujos de anotación de grandes corpus de audio.
- Evaluación comparativa de modelos bioacústicos: al ser pesos abiertos y reproducibles, sirven como línea base para comparar nuevas arquitecturas o estrategias de aumento de datos en bioacústica.
- Docencia y formación en bioacústica computacional: el repositorio de GitHub y los scripts de descarga y predicción permiten montar prácticas reproducibles con datos y pesos reales.
- Integración en sistemas de alerta temprana: en combinación con sensores acústicos, los pesos de detección pueden alimentar sistemas que avisen de la presencia de especies indicadoras o invasoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub para código e instrucciones, y menciona que cada ejecución incluye las salidas de test en `outputs.tar`, pero no se proporcionan métricas numéricas (precisión, recall, F1, mAP u otras) en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (5,3 GB) incluye pesos de múltiples variantes y salidas de test, por lo que no equivale al tamaño de un único modelo en memoria.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de audio bioacústico sin arquitectura documentada, no es posible estimar requisitos de cómputo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El flujo previsto es el uso de los scripts de predicción del repositorio `marisbasha/callmark_reproducibility`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (bioacústica computacional) con especificaciones verificables. El proyecto del que deriva, Voxaboxen de Earth Species Project, podría considerarse el referente inmediato, pero no se dispone de datos comparativos de rendimiento, parámetros ni contexto en la documentación accesible.

## Limitaciones y advertencias

- La model card no especifica licencia propia; se remite a los términos del release de Earth Species Project Voxaboxen, que deben consultarse antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con vocalizaciones animales, su rendimiento puede degradarse en especies, hábitats o condiciones acústicas no representadas en el entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos en detección e identificación, especialmente con las variantes de 50 vocalizaciones por taxón.
- Limitaciones de idioma: no aplica directamente, al ser un modelo de audio; sin embargo, la cobertura taxonómica y geográfica no está documentada.
- El repositorio incluye múltiples variantes y archivos de salida, lo que puede complicar el despliegue si no se sigue el flujo del script `download_models.py`.
- No se proporcionan métricas de rendimiento ni comparativas con el estado del arte, lo que limita la evaluación previa a producción.
- La fecha de creación del repositorio (2026-11-21) y la ausencia de descargas o likes indican que se trata de una publicación reciente y sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/songbirdini/callmark-voxaboxen
- Repositorio de código y instrucciones: https://github.com/marisbasha/callmark_reproducibility
- Proyecto original Voxaboxen (Earth Species Project): https://github.com/earthspecies/voxaboxen
