# ImKyungjin/pi0-office-mixed-noise-30pct-40ep-convex

## Resumen

El modelo `ImKyungjin/pi0-office-mixed-noise-30pct-40ep-convex` es un ajuste fino de π₀ (Pi0), el modelo Vision-Language-Action (VLA) para control robótico general desarrollado por Physical Intelligence. La implementación utilizada es la de LeRobot, que a su vez adapta el repositorio OpenPI del autor original. Se trata, por tanto, de una política robótica que recibe observaciones visuales e instrucciones en lenguaje natural y emite comandos de acción, no de un modelo de lenguaje conversacional.

El checkpoint tiene 3.501.372.176 parámetros (~3,5 mil millones, según los datos reales de los safetensors) y ocupa 7,0 GB en el repositorio. El nombre del modelo y el identificador del dataset asociado (`taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep`) indican que fue entrenado sobre un conjunto de datos de tareas de oficina con demostraciones subóptimas, una mezcla con un 30 % de ruido, 40 épocas y algún esquema de combinación convexa. Estos detalles son una inferencia a partir de la nomenclatura del repositorio, no una confirmación explícita del autor en la model card.

Su relevancia es fundamentalmente de investigación: permite estudiar cómo se comporta una política VLA de última generación cuando se entrena con datos de demostración degradados (ruido del 30 %) en lugar de trayectorias limpias. El repositorio no tiene descargas ni valoraciones y no publica resultados de evaluación, por lo que debe considerarse un artefacto experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0) de Physical Intelligence; adaptación de LeRobot/OpenPI |
| Parámetros totales | 3.501.372.176 (~3,5 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

π₀ es una política VLA que combina un backbone de visión-lenguaje con un experto de acción; el modelo base está descrito en el blog de Physical Intelligence y su implementación de referencia abierta es OpenPI, de la que LeRobot deriva su versión. El pipeline declarado en el repositorio es `robotics`, la librería es `lerobot` y los pesos se distribuyen en safetensors. No se dispone de información en la model card sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicó RLHF, DPO u otra fase de alineamiento.

Respecto a este checkpoint concreto, los únicos datos verificables son los del identificador y el nombre: dataset `taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep`, con mezcla de ruido al 30 %, 40 épocas y un término "convex" cuyo significado exacto (probablemente una combinación convexa en la estrategia de mezcla de ruido o de datos) no está documentado en la información proporcionada. La model card reproduce la plantilla genérica de LeRobot e incluye comandos de ejemplo con `--policy.type=act`, que corresponden a la política ACT y no a π₀; es una plantilla sin adaptar, no una descripción del entrenamiento realizado.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) a partir de observaciones visuales e instrucciones en lenguaje natural, siguiendo el paradigma de π₀.
- Comprensión visual: procesa entradas de cámara como parte de la política, no como un módulo separado.
- Seguimiento de instrucciones en lenguaje: acepta comandos en lenguaje natural para condicionar la tarea, según el diseño del modelo base π₀.
- Manipulación de objetos en entorno de escritorio/oficina, de acuerdo con la temática del dataset de entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record` (por ejemplo, con un `so100_follower`).
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplica; el modelo emite acciones, no texto de razonamiento.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión general, audio: no disponible o no aplicable.

## Casos de uso

- Manipulación de escritorio en oficina: el modelo está entrenado sobre un dataset de tareas de oficina, por lo que el uso natural es recogida, colocación y reorganización de objetos sobre una mesa con un brazo robótico y una o varias cámaras.
- Investigación sobre robustez a datos subóptimos: al haberse entrenado con una mezcla del 30 % de ruido, sirve como punto de comparación frente a políticas entrenadas con demostraciones limpias, para medir la degradación de la tasa de éxito.
- Aprendizaje por imitación reproducible: el checkpoint se puede reproducir y reentrenar con `lerobot-train` sobre el mismo dataset, lo que permite experimentos controlados de ablación (épocas, porcentaje de ruido).
- Punto de partida para fine-tuning específico: al ser un ajuste de π₀ sobre un dominio concreto, puede usarse como inicialización para tareas de manipulación relacionadas y reducir el número de demostraciones necesarias.
- Evaluación en banco de pruebas con LeRobot: ejecución de episodios de evaluación con `lerobot-record` sobre un `so100_follower`, útil para comparar políticas dentro del mismo framework y hardware.
- Docencia y prototipado en robótica: permite mostrar un pipeline VLA completo (dataset, entrenamiento, despliegue) con hardware de bajo coste tipo SO-100, sin necesidad de infraestructura de gran escala.
- Estudio de la transferencia entre dominios: comparar el rendimiento en tareas fuera del dominio "office" para caracterizar cuánto generaliza un VLA de 3,5 B entrenado con datos ruidosos de un único dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, tasa de éxito por tarea, número de episodios de test ni comparaciones con otras políticas. Cualquier cifra de rendimiento debería obtenerse replicando la evaluación con `lerobot-record` sobre el hardware y el montaje de cámaras correspondientes.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del checkpoint, no confirmada por el autor): los 7,0 GB del repositorio corresponden a los pesos en precisión de 16 bits, por lo que la inferencia en `bfloat16`/`float16` requiere del orden de 8-12 GB de VRAM contando activaciones y búferes de imagen.
- GPU recomendadas: cualquier GPU con 16 GB o más. Una RTX 4090 (24 GB) o RTX 4080 (16 GB) son suficientes para inferencia; A100, H100 o L40S ofrecen margen amplio y son adecuadas si se ejecutan varias cámaras o varios entornos en paralelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4080/4090 y modelos equivalentes con 16 GB o más. En GPUs de 8-12 GB requeriría cuantización, y no se documentan formatos cuantizados para este checkpoint.
- Entrenamiento completo: con 3,5 B de parámetros, el ajuste completo con Adam en `bfloat16` necesita del orden de 80-100 GB de VRAM (pesos, gradientes y estados del optimizador), lo que implica A100/H100 de 80 GB o reparto en varias GPUs. El ajuste con LoRA o congelando el backbone reduce el requisito de forma sustancial, aunque no hay configuración publicada.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para evaluación e inferencia con `--policy.path`). No hay información sobre soporte en vLLM, TGI, llama.cpp u Ollama, que en principio no aplican a una política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ImKyungjin/pi0-office-mixed-noise-30pct-40ep-convex` | VLA (ajuste de π₀) | 3.501.372.176 | Apache 2.0 | Repositorio HuggingFace, 0 descargas | Especializado en tareas de oficina con datos ruidosos |
| π₀ base (Physical Intelligence / LeRobot) | VLA | ~3 B (no confirmado en la información disponible) | Apache 2.0 según la model card de referencia | Pesos abiertos vía OpenPI/LeRobot | Modelo generalista; referencia frente a la que medir el ajuste |
| π₀-FAST | VLA autorregresivo con tokenizador FAST | no disponible | no disponible | Pesos abiertos vía OpenPI | Variante de decodificación de acciones distinta |
| OpenVLA | VLA | no disponible en esta búsqueda | no disponible en esta búsqueda | Pesos abiertos | Alternativa de la misma categoría; requiere verificación de datos |

Los datos de los modelos alternativos no se han podido verificar con la información proporcionada; se listan como categorías comparables, no como cifras confirmadas. Cualquier comparación cuantitativa debería apoyarse en las model cards oficiales de cada política.

## Limitaciones y advertencias

- Ausencia total de validación pública: 0 descargas y 0 valoraciones en el momento de la consulta; no hay evidencia externa de que la política funcione correctamente.
- Sin benchmarks ni tasas de éxito publicadas, por lo que no se puede estimar su rendimiento frente a π₀ base u otras políticas.
- Entrenado con un 30 % de ruido en las demostraciones: es probable que la política herede comportamientos subóptimos del dataset; es precisamente el objeto del experimento, no un defecto oculto.
- Dominio restringido: las tareas de oficina del dataset de entrenamiento acotan fuertemente la generalización a otros entornos, objetos o morfologías de robot.
- Acoplamiento al hardware y a la configuración de cámaras del dataset original: cambiar de brazo robótico, de cámaras o de calibración puede invalidar la política. No se documenta el hardware objetivo en la model card.
- Riesgo físico: en un VLA, un fallo de predicción no es una alucinación textual, sino una acción incorrecta sobre un objeto o una persona. Se requiere supervisión y paradas de emergencia en cualquier despliegue real.
- Idiomas: no disponible. No hay confirmación de que acepte instrucciones en castellano; el modelo base π₀ se documenta habitualmente con instrucciones en inglés.
- Licencia Apache 2.0 en este repositorio, lo que en principio permite uso comercial del checkpoint. Aun así, conviene verificar la cadena de licencias del modelo base π₀ y de los datos de entrenamiento antes de un uso productivo.
- Model card no adaptada: los comandos de ejemplo usan `--policy.type=act`, que corresponde a ACT y no a π₀; seguirlos al pie de la letra no reproduce este modelo.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-09-13), dato a tener en cuenta si se rastrea la procedencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-office-mixed-noise-30pct-40ep-convex
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
