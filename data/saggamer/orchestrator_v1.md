# saggamer/Orchestrator_V1

## Resumen

Orchestrator V1 es un modelo de lenguaje orientado a agentes, publicado por el desarrollador independiente saggamer, que actúa como capa de planificación y decisión dentro de sistemas de automatización local. Se construye como un ajuste fino del modelo Gemma 4 E4B en su variante instruct y cuantizada a 4 bits del repositorio MLX Community, lo que lo vincula al ecosistema de Apple Silicon y a la librería MLX. El modelo resuelve el problema de la orquestación de herramientas: decidir si hace falta una herramienta, cuál elegir, cómo interpretar el resultado real devuelto por el runtime y cuándo pedir permiso antes de una acción destructiva.

Con 7.463.013.418 parámetros totales según los pesos en safetensors y un repositorio de 4,3 GB, el modelo está pensado para ejecutarse en local, no como chatbot aislado sino como "cerebro controlador" de un agente. Fue desarrollado originalmente para KIRA OS, un prototipo de entorno operativo de IA local, y se distribuye con licencia Apache 2.0, aunque la model card enlaza además a la licencia específica de Gemma 4 de Google.

Su relevancia actual reside en la creciente demanda de agentes de escritorio y sistemas MCP que necesitan un modelo pequeño, ejecutable en hardware de consumo, capaz de razonar sobre seguridad, orden de tareas y verificación de resultados, en lugar de limitarse a generar texto plausible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B), ajuste fino instructivo |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (pesos publicados en 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace adicional a la licencia de Gemma 4) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

Orchestrator V1 parte de `mlx-community/gemma-4-E4B-it-4bit`, es decir, un Gemma 4 E4B instruction-tuned ya cuantizado a 4 bits para MLX. Sobre esa base se aplica un ajuste fino orientado a patrones agénticos: comprensión de la tarea del usuario, decisión sobre necesidad de herramienta, selección de una ruta segura, inspección de datos reales devueltos, continuación basada en evidencia y solicitud de permiso ante operaciones de riesgo. La model card describe el entrenamiento para razonamiento agéntico privado de estilo Train-of-Thought y Tree-of-Thought, con trazas internas que el runtime debe ocultar al usuario.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento posteriores. Tampoco se detalla la longitud de contexto nativa del modelo base. La innovación declarada no es arquitectónica sino de comportamiento: el modelo está diseñado para operar dentro de un bucle de ejecución de herramientas en el que el runtime devuelve resultados reales y el modelo continúa a partir de ellos, evitando declarar tareas completadas sin confirmación.

## Capacidades

- Generación de texto conversacional y razonamiento orientado a planificación de tareas.
- Decisión sobre uso de herramientas y selección de la siguiente acción en un bucle agéntico.
- Integración con herramientas externas proporcionadas por el runtime: búsqueda web, navegación headless, inspección de archivos y carpetas, apertura y control de aplicaciones, contexto de IDE, ejecución en terminal y shell, AppleScript y automatización de macOS.
- Descubrimiento y configuración de conectores MCP.
- Generación de artefactos si el host dispone de las herramientas correspondientes: PDF, DOCX/Word y PPTX con soporte de imágenes.
- Diagnóstico de sistema: RAM, almacenamiento, aplicaciones en ejecución, estado de red y estructura de proyectos.
- Tareas en segundo plano o programadas y operaciones de archivos con control de permisos.
- Flujos de verificación multiagente o tipo consejo.
- Razonamiento interno privado estilo Train-of-Thought y Tree-of-Thought, con ocultación de trazas recomendada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de escritorio local: el modelo actúa como capa de decisión que recibe la petición del usuario, elige entre abrir aplicaciones, inspeccionar archivos o ejecutar comandos, y continúa a partir de los resultados reales devueltos por el runtime. Es adecuado porque fue ajustado explícitamente para ese bucle y para pedir permiso antes de acciones destructivas.
- Copiloto de IDE: integrado en un entorno de desarrollo, recoge contexto del proyecto mediante herramientas de inspección, propone cambios y verifica el estado del repositorio antes de dar una tarea por terminada. Su orientación a evidencia frente a suposición reduce las finalizaciones ficticias.
- Orquestación de conectores MCP: el modelo descubre y configura servidores MCP disponibles y decide qué conector invocar para cada subtarea, lo que encaja con su entrenamiento en selección de herramientas y verificación de resultados.
- Automatización de macOS con AppleScript: un runtime que exponga scripts de AppleScript como herramientas permite al modelo controlar aplicaciones nativas, gestionar ventanas o manipular documentos, con puertas de permiso para operaciones sensibles.
- Agente de investigación con navegador: el modelo planifica búsquedas, inspecciona páginas mediante navegación headless, contrasta la información recuperada y redacta un informe final fundamentado en las fuentes consultadas.
- Generación de informes y presentaciones: con herramientas de generación de PDF, DOCX y PPTX, el modelo puede recopilar datos del sistema o de archivos locales y producir documentos estructurados, incluidas presentaciones con imágenes.
- Diagnóstico y soporte técnico local: consulta de RAM, almacenamiento, red y procesos en ejecución para responder a preguntas del usuario sobre el estado de su máquina, con resultados obtenidos de herramientas reales en lugar de estimaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,3 GB con pesos en 4 bits, por lo que se requiere un mínimo aproximado de 5-6 GB de memoria unificada o VRAM para cargar el modelo con overhead del runtime.
- GPU recomendadas: al estar publicado para MLX, el entorno natural es Apple Silicon (series M1, M2, M3 y M4), donde la memoria unificada se comparte entre CPU y GPU. No se documenta soporte para CUDA en la información disponible.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada; 16 GB o más ofrece margen para contexto y herramientas.
- Opciones de despliegue: MLX es la librería declarada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Orchestrator V1 | 7.463.013.418 | no disponible | Apache 2.0 | safetensors (MLX, 4-bit) | Agentes y orquestación de herramientas |
| Gemma 4 E4B it (base) | no disponible | no disponible | Licencia Gemma 4 | safetensors, GGUF (según distribución) | Modelo instructivo general |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en el material consultado.

## Limitaciones y advertencias

- El modelo no ejecuta acciones por sí mismo: requiere un runtime que proporcione herramientas, devuelva resultados reales y gestione permisos. Sin esa capa, su utilidad queda reducida a la de un modelo conversacional.
- Riesgo de finalización ficticia: la model card advierte explícitamente de que el runtime debe impedir que el modelo declare una tarea completada sin confirmación de una herramienta.
- Las trazas de razonamiento interno (thought tokens) no deben mostrarse al usuario; el runtime debe filtrarlas y sustituirlas por actualizaciones de progreso concisas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la interpretación de resultados de herramientas o en la selección de acciones cuando el contexto es ambiguo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica la ventana de contexto ni los idiomas cubiertos.
- Restricciones de licencia: se declara Apache 2.0, pero la model card enlaza además a la licencia de Gemma 4 de Google, lo que puede imponer condiciones adicionales al uso comercial. Conviene revisar ambos documentos antes de un despliegue en producción.
- Requiere sandboxing para acciones de shell, navegador, archivos y sistema operativo, así como puertas de permiso para operaciones destructivas o sensibles en materia de privacidad.
- El modelo está publicado para MLX, lo que limita su uso directo a entornos Apple Silicon salvo que se convierta a otros formatos.
- El número de descargas (15) y de likes (2) es muy bajo, lo que sugiere poca validación comunitaria y ausencia de pruebas independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saggamer/Orchestrator_V1
- Modelo base: https://huggingface.co/mlx-community/gemma-4-E4B-it-4bit
- Kira Superapp: https://kira-superapp.vercel.app/
- Repositorio KIRA Superapp en GitHub: https://github.com/saggamer/KIRA-Superapp
- Código del navegador Diagonal: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
- Prototipo de KIRA OS: https://saggamer.github.io/KIRA-OS/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
