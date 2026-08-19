# Jundot/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4e-fp16-mtp es una versión cuantizada del modelo Qwen3.8-27B, desarrollada por Jundot mediante la herramienta oQ (oMLX v0.6.1) con cuantización mixta de precisión. El modelo base, creado por el equipo Qwen de Alibaba, es un modelo denso multimodal de 27B parámetros diseñado para tareas de programación, flujos de trabajo agénticos y automatización de oficina, con una ventana de contexto nativa de 262K tokens y razonamiento configurable. Esta cuantización reduce el tamaño del modelo a 4 bits con group size 64, manteniendo algunas capas en fp16, y está optimizada para el ecosistema MLX, lo que permite su ejecución eficiente en hardware Apple Silicon. El repositorio incluye tensores MTP (multi-token prediction) integrados, lo que sugiere soporte para predicción de múltiples tokens durante la generación.

La relevancia de esta ficha radica en que ofrece una opción de despliegue local de un modelo de 27B con capacidades multimodales y contexto largo, en un formato ligero y compatible con MLX. Sin embargo, la información pública sobre esta cuantización es limitada: no se especifican licencia, idiomas soportados ni benchmarks, y existe una discrepancia en el número de parámetros reportado por los archivos safetensors (4.926.789.872) frente a los 27B del modelo base, probablemente debida a un error en la metadata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión y lenguaje) |
| Parametros totales | 27B (modelo base); el safetensors de esta cuantización reporta 4.926.789.872, posible error de metadata |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (nativa del modelo base) |
| Tipos de cuantizacion | 4 bits, group size 64, con capas en fp16 (mixed precision) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se detallan) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que procesa texto e imágenes, con una arquitectura similar a la familia Qwen3.5. Incorpora un mecanismo de razonamiento configurable que permite ajustar el esfuerzo de razonamiento según la tarea. El entrenamiento del modelo base incluye datos de texto e imagen, aunque no se han publicado detalles específicos sobre el volumen de tokens, la composición del dataset o el uso de RLHF/DPO en la información disponible.

La cuantización oQ4e-fp16-mtp aplica una cuantización de 4 bits con group size 64, manteniendo ciertas capas en fp16 para preservar la precisión en partes críticas. El sufijo "mtp" indica la inclusión de tensores para multi-token prediction, una técnica que permite predecir varios tokens futuros simultáneamente, mejorando la velocidad de generación. Esta cuantización se realiza con la librería oMLX, que ofrece una ruta de compatibilidad para la familia Qwen3.5 y soporta niveles de razonamiento oficiales.

## Capacidades

- Generación de texto y razonamiento configurable: el modelo puede ajustar su esfuerzo de razonamiento según la complejidad de la tarea, desde respuestas rápidas hasta cadenas de pensamiento más profundas.
- Programación y generación de código: destaca en tareas de coding, incluyendo completado, depuración y explicación de código.
- Flujos de trabajo agénticos: soporta tareas de largo horizonte que requieren planificación y ejecución de múltiples pasos, como automatización de procesos.
- Automatización de oficina: capaz de procesar documentos, generar informes, resumir correos y otras tareas de productividad.
- Multimodalidad: procesa entradas de imagen y texto, permitiendo análisis de capturas, diagramas y documentos escaneados.
- Contexto largo: con 262K tokens de ventana nativa, puede manejar documentos extensos o conversaciones de muchas vueltas.
- Soporte de tool calling y agentes: aunque no se menciona explícitamente, las capacidades agénticas del modelo base implican integración con herramientas externas.
- Multi-token prediction: la versión cuantizada incluye tensores MTP, lo que puede acelerar la generación al predecir varios tokens a la vez.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un Mac con MLX para obtener completado de código, revisión de fragmentos y generación de tests, sin depender de servicios en la nube. La cuantización 4-bit reduce la huella de memoria, permitiendo su uso en equipos con 32 GB de RAM unificada.
- Automatización de oficina: el modelo puede redactar correos, resumir actas de reuniones, extraer datos de documentos escaneados (gracias a la multimodalidad) y generar presentaciones, todo ello con razonamiento configurable para equilibrar velocidad y calidad.
- Agente de investigación de largo alcance: con su contexto de 262K tokens, puede leer múltiples papers o informes extensos y producir un análisis sintetizado, manteniendo el hilo de la conversación durante horas.
- Análisis de imágenes técnicas: al aceptar entradas visuales, puede interpretar diagramas de arquitectura, capturas de pantalla de errores o gráficos de datos, y proporcionar explicaciones o sugerencias de corrección.
- Chatbot de atención al cliente con contexto amplio: integrado en un sistema de tickets, puede gestionar conversaciones con historial largo y acceder a documentación extensa de productos, reduciendo la necesidad de reentrenamiento.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar manuales, guías de API o comentarios de código, aprovechando su capacidad de razonamiento para estructurar la información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para esta cuantización específica. El modelo base Qwen3.8-27B ha sido evaluado por Alibaba, pero esos resultados no se han incluido en la documentación de este repositorio.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 17.9 GB, por lo que la carga en memoria rondará los 14-18 GB según el sistema operativo y la gestión de memoria. Se recomienda un Mac con al menos 32 GB de memoria unificada para una experiencia fluida; con 16 GB podría funcionar con cuantización más agresiva o limitando el contexto.
- GPU recomendadas: al ser un formato MLX, está diseñado para Apple Silicon (M1, M2, M3, M4 y superiores). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- Opciones de despliegue: se puede usar con la librería MLX directamente, o a través de herramientas que soporten MLX como LM Studio (que tiene soporte para modelos MLX). También es posible cargarlo con el script de ejemplo de oMLX.
- Latencia y throughput: no se han publicado datos específicos. La cuantización 4-bit y la predicción multi-token deberían ofrecer una velocidad de generación aceptable en hardware Apple Silicon, pero los valores exactos dependen del chip y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparativa rigurosa. Sin embargo, se pueden señalar diferencias cualitativas con otras versiones cuantizadas del mismo modelo base:

| Modelo | Cuantización | Group size | MTP | Formato | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ4e-fp16-mtp | 4-bit mixto | 64 | Sí | MLX | Este modelo |
| chimpanzeetaxidriver/Qwen3.8-27B-oQ4e-G128-fp16-mtp | 4-bit mixto | 128 | Sí | MLX | Group size mayor, posible menor precisión pero menor tamaño |
| ben0112/Qwen3.8-27B-oQ4e-fp16 | 4-bit mixto | 64 | No | MLX | Sin MTP, posible menor velocidad de generación |

Frente al modelo base sin cuantizar (Qwen3.8-27B), esta versión reduce significativamente el uso de memoria (de ~54 GB en fp16 a ~18 GB) a costa de una posible pérdida de precisión, aunque la cuantización mixta con capas fp16 mitiga este efecto.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo cuantizado ni del modelo base, lo que impide conocer las restricciones de uso comercial y redistribución. Se debe contactar con el autor o con Alibaba para aclarar este punto antes de usar en producción.
- Pérdida de precisión por cuantización: la cuantización a 4 bits puede degradar ligeramente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o matemáticas. La cuantización mixta con capas fp16 ayuda, pero no elimina el riesgo.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o sesgado. No se han publicado evaluaciones de sesgo para esta versión.
- Dependencia de MLX: el formato MLX limita el despliegue a hardware Apple Silicon. No es posible ejecutarlo en GPUs convencionales sin convertir los pesos a otro formato (por ejemplo, GGUF), lo que requeriría un proceso adicional.
- Contexto largo con degradación: aunque la ventana nativa es de 262K tokens, en la práctica la calidad puede degradarse en contextos muy largos, y el uso de memoria aumenta proporcionalmente, lo que puede superar la capacidad de equipos con menos RAM.
- Discrepancia en parámetros: el archivo safetensors reporta 4.926.789.872 parámetros, muy inferior a los 27B esperados. Esto podría indicar un error en la metadata o un problema en la cuantización; se recomienda verificar la integridad del modelo antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-fp16-mtp
- Repositorio del modelo base (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Variante con group size 128: https://huggingface.co/chimpanzeetaxidriver/Qwen3.8-27B-oQ4e-G128-fp16-mtp
- Variante sin MTP: https://huggingface.co/ben0112/Qwen3.8-27B-oQ4e-fp16
