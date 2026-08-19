# majentik/UI-Mate-27B-MLX-2bit

## Resumen

UI-Mate-27B-MLX-2bit es una variante cuantizada en 2 bits (affine, group size 32) del modelo UI-Mate-27B de Tencent, un agente GUI de código abierto con 27 mil millones de parámetros diseñado para automatización de tareas de larga duración en ordenadores de escritorio. El modelo observa capturas de pantalla en tiempo real, razona sobre el estado visible de la interfaz y genera acciones estructuradas de teclado y ratón para interactuar con aplicaciones nativas y sistemas operativos. Esta versión MLX está optimizada para Apple Silicon mediante la librería mlx-lm, cuantizando únicamente la torre de texto mientras la torre de visión y el proyector se mantienen en BF16, lo que permite ejecutar el agente en hardware de Apple con requisitos de memoria reducidos.

El repositorio publica ocho niveles de cuantización (2, 3, 4, 5, 6, 8 bits y MXFP4), siendo esta la versión de 2 bits, la más agresiva en compresión. Aunque el modelo base tiene 27B parámetros, el archivo safetensors de este repo muestra 3.825.044.720 parámetros, probablemente correspondientes a la parte cuantizada de la torre de texto, mientras que la torre de visión y el proyector se almacenan por separado en BF16. El tamaño total del repositorio es de 11 GB. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5, con torre de vision, proyector y torre de texto |
| Parametros totales | 27B (modelo base); 3.825.044.720 en safetensors (torre de texto cuantizada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit affine group size 32 (este repo); tambien disponibles 3, 4, 5, 6, 8-bit y MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, formato MLX |

## Arquitectura y entrenamiento

El modelo base UI-Mate-27B es un transformer multimodal que combina una torre de visión (que procesa capturas de pantalla) con una torre de lenguaje basada en la arquitectura Qwen3.5, unidas mediante un proyector. Está diseñado específicamente como agente GUI: recibe una imagen de la pantalla actual y genera una secuencia de acciones discretas (movimientos de ratón, clics, pulsaciones de teclado) en formato estructurado. La cuantización MLX 2-bit aplicada en este repo comprime únicamente la torre de texto, manteniendo la torre de visión y el proyector en BF16 para preservar la calidad de percepción visual. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) en la información disponible.

La cuantización affine con group size 32 es una técnica que agrupa pesos en bloques de 32 y aplica una escala y offset por grupo, reduciendo el error de cuantización frente a métodos más simples. El autor del repo indica que el paquete pasó una prueba de coherencia determinista (generación de 48 tokens con greedy decoding, verificando ausencia de bucles, basura multiescritura y tokens especiales), pero no se han publicado benchmarks formales.

## Capacidades

- Agente GUI: observa capturas de pantalla en tiempo real y genera acciones de teclado y ratón estructuradas para interactuar con aplicaciones de escritorio.
- Razonamiento sobre estado visible: analiza la interfaz actual para decidir el siguiente paso en tareas de larga duración.
- Automatización multi-paso: diseñado para tareas que requieren secuencias largas de acciones (navegar menús, rellenar formularios, etc.).
- Multimodal: entrada de imagen (screenshots) y texto, salida de texto estructurado con acciones.
- Capacidad de conversación: al estar basado en Qwen3.5, mantiene capacidades de diálogo y generación de texto.
- Sin soporte explícito de tool calling o function calling en la información disponible, aunque su naturaleza de agente GUI implica una forma de interacción con herramientas (el sistema operativo).

## Casos de uso

- Automatización de pruebas de software: el modelo puede ejecutar pruebas end-to-end en aplicaciones de escritorio, navegando por la interfaz y verificando comportamientos, reduciendo la necesidad de scripts manuales de automatización.
- Asistencia remota y soporte técnico: un sistema basado en UI-Mate-27B puede guiar a usuarios menos expertos realizando clics y pulsaciones de teclado en su escritorio, o diagnosticar problemas visualizando la pantalla.
- Automatización de tareas administrativas: rellenar formularios, extraer datos de aplicaciones heredadas, mover archivos entre ventanas, etc., en entornos de oficina donde no existen APIs.
- Creación de asistentes personales de escritorio: integrar el modelo como un agente que controla el ordenador por comandos de voz o texto, ejecutando acciones como abrir aplicaciones, buscar archivos o enviar correos.
- Accesibilidad: personas con movilidad reducida pueden beneficiarse de un agente que ejecuta acciones de ratón y teclado a partir de instrucciones en lenguaje natural.
- Investigación en agentes autónomos: sirve como base para estudiar interacción humano-computadora, aprendizaje por refuerzo en entornos GUI y razonamiento visual para planificación de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica "benchmarks pending" y no hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de agentes GUI (como tasa de éxito en tareas de escritorio). El autor solo menciona una prueba de coherencia cualitativa (generación de 48 tokens sin degradación aparente), pero sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 11 GB, pero la carga en memoria dependerá de la cuantización y del tamaño del contexto. Con 2-bit, la torre de texto requiere aproximadamente 3.8B × 0.25 bytes ≈ 0.95 GB, más la torre de visión y proyector en BF16 (que pueden sumar varios GB). Se estima un uso total de memoria entre 6-10 GB para inferencia.
- GPU recomendadas: diseñado para Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de RAM unificada. También puede ejecutarse en GPUs NVIDIA mediante conversión a otros formatos, pero no es el objetivo principal.
- Compatibilidad con consumer GPU: sí, en Macs con 16 GB o más. En GPUs NVIDIA, la cuantización 2-bit podría caber en una RTX 3060 12GB o superior, pero requeriría convertir los pesos a otro formato (por ejemplo, GGUF o GPTQ).
- Opciones de despliegue: mlx-lm (recomendado), también se puede usar con mlx-lm.generate en línea de comandos. Para integración en aplicaciones, se puede usar la API de mlx-lm en Python.
- Latencia y throughput: no disponibles. La cuantización 2-bit reduce el ancho de banda de memoria, lo que debería acelerar la generación en Apple Silicon, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos en la información proporcionada. Sin embargo, se puede comparar estructuralmente con otros agentes GUI de código abierto:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| UI-Mate-27B (base) | 27B | no disponible | Apache-2.0 | Agente GUI multimodal |
| UI-Mate-27B-MLX-2bit (este) | 27B (base) / 3.8B cuantizado | no disponible | Apache-2.0 | Cuantización MLX 2-bit para Apple Silicon |
| UI-TARS (ByteDance) | 7B-72B | 32k | Apache-2.0 | Agente GUI multimodal |

No hay datos de rendimiento comparativo entre estos modelos en tareas de automatización GUI. La cuantización 2-bit probablemente degrade la calidad del razonamiento frente al modelo base, pero no se ha medido.

## Limitaciones y advertencias

- Cuantización 2-bit muy agresiva: puede degradar significativamente la calidad del razonamiento y la precisión de las acciones generadas en comparación con el modelo original en BF16.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el modelo cuantizado mantenga las capacidades del modelo base.
- Longitud de contexto desconocida: no se especifica, lo que dificulta planificar tareas que requieran historial largo de interacciones.
- Idiomas no especificados: aunque Qwen3.5 soporta múltiples idiomas, no se confirma qué idiomas maneja bien esta variante.
- Requiere Apple Silicon para un despliegue óptimo: aunque se puede convertir a otros formatos, el flujo principal está pensado para MLX.
- El dato de parámetros del safetensors (3.8B) es inconsistente con el modelo base de 27B; puede indicar que solo se cuantizó una parte del modelo, pero no está claro si el resto (torre de visión) se incluye en el repo o debe descargarse por separado.
- Riesgo de alucinación en acciones: como agente GUI, puede generar acciones incorrectas o dañinas si se usa sin supervisión en entornos de producción.
- Sin soporte oficial de Tencent: este repo es una contribución de la comunidad (majentik), no del equipo original de Tencent.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/majentik/UI-Mate-27B-MLX-2bit
- Modelo base original: https://huggingface.co/tencent/UI-Mate-27B
- Perfil del autor de la cuantización: https://huggingface.co/majentik
- Artículo sobre el lanzamiento de UI-Mate-27B: https://korshunov.ai/en/article/19272-tencent-releases-open-weight-ui-mate-27b-gui-agent/
- Resumen del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ui-mate-27b-tencent
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
