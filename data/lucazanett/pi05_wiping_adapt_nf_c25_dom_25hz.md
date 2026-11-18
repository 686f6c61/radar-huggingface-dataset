# lucazanett/pi05_wiping_adapt_nf_c25_dom_25hz

## Resumen

`lucazanett/pi05_wiping_adapt_nf_c25_dom_25hz` es un checkpoint de política robótica basado en π₀.₅ (Pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence, adaptado y empaquetado con la librería LeRobot de Hugging Face. El autor del repositorio (lucazanett) ha entrenado esta política sobre un dataset propio de tareas de limpieza/frotado (`new_setup_wiping_adaptive_01_no_force_25hz`), por lo que no se trata de un modelo de lenguaje generalista sino de un controlador visomotor especializado para un robot concreto.

El modelo resuelve el problema de mapear observaciones visuales y consignas de lenguaje a acciones motoras de bajo nivel, con el objetivo declarado de generalizar a entornos y situaciones no vistas durante el entrenamiento. Frente a políticas de imitación clásicas como ACT, π₀.₅ incorpora un backbone visión-lenguaje preentrenado, lo que permite condicionar el comportamiento en instrucciones en lenguaje natural y reutilizar representaciones visuales ricas.

Es relevante ahora porque forma parte del ecosistema abierto de LeRobot/OpenPI, que está democratizando el entrenamiento y despliegue de políticas VLA en hardware asequible (SO-100/SO-101). El checkpoint ocupa 9,4 GB, tiene 4.143.404.816 parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilización y fine-tuning. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y la model card es una plantilla apenas personalizada, por lo que la documentación específica del entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence, implementación LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible (las consignas de lenguaje dependen del backbone VLM subyacente, no documentado aquí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Pipeline | robotics |
| Tamano del repositorio | 9,4 GB |
| Dataset de entrenamiento | lucazanett/new_setup_wiping_adaptive_01_no_force_25hz |
| Frecuencia de control (según nombre) | 25 Hz |

## Arquitectura y entrenamiento

El modelo es una política π₀.₅, un VLA que combina un backbone visión-lenguaje con un cabezal de acciones para producir comandos motores a partir de imágenes e instrucciones textuales. La implementación incluida en este repositorio proviene de LeRobot, que a su vez adapta el repositorio OpenPI de Physical Intelligence. El nombre del checkpoint (`wiping_adapt_nf_c25_dom_25hz`) sugiere una tarea de frotado/limpieza ("wiping"), una variante adaptativa, ausencia de señal de fuerza ("nf", no force), un parámetro `c25` y una frecuencia de operación de 25 Hz. Estos detalles provienen únicamente de la nomenclatura y no están confirmados en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación puro. La model card únicamente enlaza al blog de Physical Intelligence sobre π₀.₅ y a la guía de entrenamiento de LeRobot, e incluye comandos genéricos de `lerobot-train` y `lerobot-record` que apuntan a `--policy.type=act`, lo que indica que la plantilla no fue adaptada al tipo de política real. No se documentan innovaciones técnicas específicas de este checkpoint (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control robótico visomotor: genera acciones de robot a partir de observaciones visuales y consignas de lenguaje, orientado a tareas de frotado/limpieza.
- Generalización a entornos nuevos: según la descripción de π₀.₅, está diseñado para generalizar a situaciones no vistas durante el entrenamiento, aunque no hay evidencia específica publicada para este checkpoint.
- Condicionamiento por lenguaje: al ser un VLA, acepta instrucciones en lenguaje natural (idiomas soportados no documentados).
- Aprendizaje por imitación: entrenado sobre un dataset de demostraciones propio (`new_setup_wiping_adaptive_01_no_force_25hz`).
- Integración con LeRobot: entrenamiento y evaluación mediante `lerobot-train` y `lerobot-record`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no documentadas; la visión es parte inherente del pipeline VLA.

## Casos de uso

- Automatización de limpieza de superficies: el modelo puede ejecutar trayectorias de frotado sobre una superficie concreta a partir de observaciones de cámara, sustituyendo la programación manual de trayectorias por una política aprendida.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA preentrenado se adapta a una tarea específica con un dataset pequeño de demostraciones.
- Fine-tuning sobre nuevos setups: al estar en formato LeRobot y licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre datasets propios de otras tareas manipulativas.
- Despliegue en robots de bajo coste: la integración con SO-100/SO-101 (usada en los ejemplos de `lerobot-record`) permite probar políticas VLA en hardware asequible.
- Evaluación comparativa de políticas: útil como referencia para comparar políticas ACT frente a VLA en tareas de contacto continuo con la superficie.
- Prototipado de control a 25 Hz: la frecuencia indicada en el nombre lo hace candidato para bucles de control de tiempo real moderado en tareas de frotado.
- Reproducción de experimentos de Physical Intelligence: permite replicar y adaptar el enfoque π₀.₅ en un entorno abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143.404.816 parámetros, en FP16 se requieren aproximadamente 8,3 GB solo para pesos; en BF16 similar. En FP32, unos 16,6 GB. No se documentan cuantizaciones que reduzcan este requisito.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una GPU con al menos 12-16 GB de VRAM (RTX 4080/4090, A10, L4) debería poder cargar los pesos en FP16, aunque el consumo real del pipeline VLA (visión + acción) es mayor que el de los pesos solos.
- GPU de consumo: probablemente sí en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en FP16, sin datos verificados.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), y por herencia de OpenPI. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que están orientados a LLMs y no a políticas robóticas.
- Latencia y throughput: no disponible; el nombre del checkpoint sugiere operación a 25 Hz, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_wiping_adapt_nf_c25_dom_25hz | 4.143.404.816 | no disponible | VLA para frotado | Apache 2.0 | Hugging Face (LeRobot) |
| π₀.₅ (Physical Intelligence, original) | no disponible | no disponible | VLA generalista | no disponible en esta ficha | Blog/OpenPI |
| ACT (Action Chunking Transformer) | no disponible | no disponible | Imitación robótica | no disponible en esta ficha | LeRobot |
| Políticas LeRobot de la comunidad | variable | no disponible | Tareas manipulativas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para una tarea concreta de frotado; no es un modelo generalista.
- Documentación mínima: la model card es una plantilla con comandos genéricos (`--policy.type=act`) que no reflejan la política real, lo que dificulta la reproducibilidad.
- Sin métricas publicadas: no hay benchmarks, curvas de entrenamiento ni tasas de éxito documentadas.
- Sesgos: no documentados; al depender de un dataset propio y de un setup físico concreto, el modelo puede comportarse mal ante cambios de iluminación, cámara o superficie.
- Riesgo de alucinación: en un VLA se traduce en acciones erráticas o inseguras; no hay evaluación de seguridad publicada.
- Idioma: no se documentan idiomas soportados para las consignas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del backbone subyacente de π₀.₅.
- Adopción nula: cero descargas y cero likes, sin validación por parte de la comunidad.
- Sin cuantizaciones documentadas: el despliegue en hardware limitado requiere verificación manual.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_adapt_nf_c25_dom_25hz
- Dataset: https://huggingface.co/datasets/lucazanett/new_setup_wiping_adaptive_01_no_force_25hz
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- OpenPI (Physical Intelligence): no disponible en la información proporcionada
