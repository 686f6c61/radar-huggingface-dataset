# mobileforge-anonymous/ForgeOwl-8B-400tasks

## Resumen

ForgeOwl-8B-400tasks es un modelo de visión-lenguaje (vision-language model) diseñado para actuar como agente en interfaces gráficas de usuario móviles (GUI). Es el resultado de adaptar el modelo base mPLUG/GUI-Owl-1.5-8B-Instruct mediante MobileForge, un método de adaptación sin anotaciones humanas que convierte tareas de aplicaciones objetivo en currículos ejecutables, usa rollouts del propio modelo, crítica jerárquica, pistas correctivas y actualizaciones de política con GRPO a nivel de paso. El modelo está publicado por un equipo anónimo como artefacto de un submission a ICLR, y es relevante porque demuestra que se puede mejorar un agente GUI sin necesidad de demostraciones ni etiquetas de recompensa escritas por humanos.

Con aproximadamente 8.767 millones de parámetros (8.8B) y una arquitectura basada en Qwen3-VL (según los tags del repositorio), el modelo procesa capturas de pantalla y genera acciones de interfaz. En la evaluación sobre AndroidWorld (116 tareas), alcanza un 64.7% Pass@1, 74.1% Pass@2 y 77.6% Pass@3, y en el split solo-GUI de MobileWorld consigue un 41.0% de éxito. El repositorio incluye pesos en formato safetensors, licencia MIT, y está pensado para su uso con la interfaz de carga del modelo base GUI-Owl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según copia alternativa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de GUI-Owl-1.5-8B-Instruct, un modelo de visión-lenguaje especializado en comprensión de interfaces móviles, que a su vez se basa en la familia Qwen3-VL. La arquitectura es un transformer multimodal que combina un codificador visual con un decodificador de lenguaje, capaz de recibir imágenes de pantalla y producir texto con acciones (como toques, deslizamientos o entrada de texto). El tamaño total es de 8.767 millones de parámetros, lo que lo sitúa en la gama de modelos de 8B-9B.

El entrenamiento de adaptación con MobileForge no utiliza tareas escritas por humanos ni demostraciones. En su lugar, genera automáticamente 400 tareas a partir de aplicaciones objetivo, usa el propio modelo para producir rollouts, un crítico jerárquico evalúa el progreso, y se proporcionan pistas correctivas contextualizadas. La actualización de política se realiza mediante GRPO a nivel de paso, incorporando el contexto de las pistas. Este proceso es completamente automático y no requiere etiquetas de recompensa externas.

## Capacidades

- Navegación autónoma en interfaces móviles: interpreta capturas de pantalla y genera acciones de toque, deslizamiento y escritura para completar tareas en aplicaciones.
- Razonamiento multi-paso: planifica secuencias de acciones para alcanzar un objetivo, evaluando el estado de la interfaz en cada paso.
- Comprensión visual de GUI: identifica elementos como botones, campos de texto, listas y menús a partir de imágenes.
- Adaptación a aplicaciones específicas: el proceso MobileForge permite ajustar el comportamiento del modelo a apps concretas sin anotaciones manuales.
- Generación de texto instructivo: puede producir descripciones de acciones o justificaciones de sus decisiones, aunque no está documentado un modo de razonamiento explícito.
- Compatibilidad con el ecosistema transformers: se carga con la interfaz estándar de HuggingFace, lo que facilita su integración en pipelines existentes.

## Casos de uso

- Automatización de pruebas de aplicaciones móviles: el modelo puede ejecutar flujos de usuario completos (registro, compra, configuración) sobre un emulador o dispositivo real, reduciendo el esfuerzo manual en el control de calidad. Su capacidad para razonar sobre la pantalla y adaptarse a cambios de UI lo hace adecuado para pruebas exploratorias.
- Asistentes personales que controlan el teléfono: integrado en un servicio que recibe una orden en lenguaje natural ("reserva una mesa para dos a las 20:00"), el modelo interactúa con la app correspondiente paso a paso, manejando menús y formularios.
- Robotic process automation (RPA) móvil: en entornos empresariales, puede automatizar tareas repetitivas en apps de productividad o gestión, como rellenar informes o extraer datos de una aplicación de banca.
- Accesibilidad: ayuda a personas con discapacidad motora o visual a operar sus dispositivos mediante comandos de voz que el modelo convierte en acciones de GUI, navegando por la interfaz de forma autónoma.
- Investigación en agentes GUI: sirve como punto de partida para estudiar métodos de adaptación sin anotaciones, comparar estrategias de aprendizaje por refuerzo y analizar el comportamiento de agentes visuales en entornos móviles.
- Evaluación de interfaces y análisis de usabilidad: el modelo puede recorrer una app siguiendo tareas definidas, generando registros de acciones y estados que permiten detectar errores de diseño o flujos poco intuitivos.

## Benchmarks y rendimiento

Según la model card y el paper asociado, los resultados en AndroidWorld (116 tareas) son:

| Metrica | Resultado |
|---|---|
| Pass@1 | 64.7% (75/116) |
| Pass@2 | 74.1% (86/116) |
| Pass@3 | 77.6% (90/116) |

En el split solo-GUI de MobileWorld, el paper reporta un 41.0% de éxito. El repositorio de GitHub de MobileForge indica 67.24% Pass@1 y 77.59% Pass@3 en AndroidWorld, así como 41.03% de éxito en MobileWorld, con ligeras diferencias respecto a la model card (probablemente debidas a variaciones de configuración o semilla). No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en BF16 (17.5 GB de tamaño de repositorio), se necesitan aproximadamente 18-20 GB de VRAM para cargar el modelo completo. Con cuantización de 8 bits, unos 10 GB; con 4 bits, unos 6 GB.
- GPU recomendadas: una tarjeta con 24 GB de VRAM (RTX 3090, RTX 4090, A10, L4) permite ejecutar el modelo en BF16 sin problemas. Para cuantización de 4 bits, una RTX 3060 de 12 GB o superior es suficiente.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs consumer con al menos 12 GB de VRAM usando cuantización, aunque no se proporcionan archivos GGUF oficiales.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o llamafile tras conversión. También es posible usar Ollama si se convierte a GGUF. Para tareas de agente GUI, se recomienda un entorno con control de emulador (por ejemplo, Android Emulator) integrado.
- Latencia y throughput: no se han publicado datos específicos. Como referencia orientativa, un modelo de 8B en BF16 suele generar entre 20 y 40 tokens por segundo en una RTX 4090, pero la latencia depende del número de pasos de razonamiento y de la complejidad de la imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos de otros modelos de agente GUI en las mismas condiciones para una comparación numérica directa. La siguiente tabla compara características generales con el modelo base y una alternativa conocida del mismo dominio:

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| ForgeOwl-8B-400tasks | 8.8B | no disponible | MIT | Adaptado con MobileForge, 77.6% Pass@3 en AndroidWorld |
| mPLUG/GUI-Owl-1.5-8B-Instruct | 8.8B | no disponible | Apache 2.0 (según repo original) | Modelo base sin adaptación específica |
| CogAgent-9B (referencia) | 9B | 4096 | MIT | Agente GUI de código abierto, pero sin resultados comparables en este documento |

No se encontraron datos fiables de rendimiento de otros modelos en AndroidWorld dentro de la información proporcionada, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- El modelo puede ejecutar acciones incorrectas o inseguras sobre interfaces reales; la model card advierte explícitamente que debe usarse únicamente en entornos de prueba aislados y que las acciones deben ser inspeccionadas antes de aplicarlas con datos personales.
- No se han documentado sesgos específicos, pero al ser un modelo de visión-lenguaje entrenado sobre datos web y de GUI, puede heredar sesgos de género, idioma o cultura presentes en esos datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar pasos o justificaciones que no se corresponden con el estado real de la interfaz, especialmente en tareas complejas o poco frecuentes.
- Limitaciones de contexto e idioma: no se ha proporcionado la longitud de contexto ni los idiomas soportados. Se asume que hereda las capacidades del modelo base GUI-Owl, pero no hay garantía.
- Aunque la licencia del repositorio es MIT, el modelo base GUI-Owl-1.5-8B-Instruct tiene su propia licencia (Apache 2.0 según su página), que puede imponer condiciones adicionales. Conviene revisar ambas licencias antes de un uso comercial.
- El modelo no incluye un modo de razonamiento explícito ni soporte de tool calling documentado; su interfaz está pensada para el pipeline de GUI-Owl, no para integraciones genéricas de agentes con herramientas.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/mobileforge-anonymous/ForgeOwl-8B-400tasks
- Copia alternativa en HuggingFace: https://huggingface.co/lgy0404/ForgeOwl-8B-400tasks
- Página del proyecto (anónima): https://mobileforge-anonymous.github.io/
- Paper en arXiv: https://arxiv.org/abs/2606.19930v1
- Código oficial en GitHub: https://github.com/kwai/MobileForge
- Dataset de resultados de benchmarks: https://huggingface.co/datasets/mobileforge-anonymous/mobileforge-benchmark-results
- Colección de modelos MobileForge: https://huggingface.co/collections/lgy0404/mobileforge-models
