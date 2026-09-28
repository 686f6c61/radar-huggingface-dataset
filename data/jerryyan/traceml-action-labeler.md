# jerryyan/TraceML-Action-Labeler

## Resumen

TraceML Action Labeler es un modelo de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) desarrollado por jerryyan, consistente en un ajuste fino de Qwen3-1.7B sobre etiquetas con esquema restringido generadas por un profesor GPT de mayor tamaño. Su tarea es muy concreta: dada una transición entre dos versiones de una solución de machine learning (el diff de código, las etiquetas de estado de ambas versiones y el cambio de puntuación), devuelve un JSON que describe qué hizo la edición y por qué, con 10 acciones gruesas, acciones finas de una lista cerrada de 85, uno o dos intenciones de un conjunto de 6, la magnitud de la edición, el efecto sobre la puntuación y resúmenes breves en lenguaje natural.

El modelo forma parte de TraceML (NeurIPS 2026, Evaluations & Datasets Track) y se publica junto a un etiquetador de estados. Ambos se usaron para etiquetar las 151.088 versiones de código del dataset TraceML, lo que lo convierte en una pieza de infraestructura para investigación sobre planificación de agentes y análisis empírico de trayectorias de desarrollo de ML, más que en un modelo de propósito general.

Es relevante ahora porque ofrece una alternativa local, de licencia Apache-2.0 y ejecutable en hardware de consumo, para una tarea de anotación estructurada que de otro modo requiere un modelo profesor propietario. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no publica resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado para generación de texto con salida JSON restringida por esquema |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la ventana la hereda del modelo base Qwen3-1.7B y el toolkit de TraceML se encarga de ajustar el código largo a dicha ventana |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors bf16 |
| Idiomas soportados | en (inglés), code (código) |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | safetensors (librería transformers; repositorio de 3,5 GB) |
| Modelo base | Qwen/Qwen3-1.7B (fine-tune) |
| Pipeline | text-generation |
| Dataset de entrenamiento | jerryyan/TraceML |
| Tamaño del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Qwen3-1.7B, un transformer decoder-only de 1,72 mil millones de parámetros. El entrenamiento se realizó sobre etiquetas con esquema restringido (schema-constrained) producidas por un modelo profesor GPT de mayor tamaño: la salida se estructura en un JSON con campos cerrados (10 acciones gruesas, 85 acciones finas con padre asociado, 6 intenciones, 4 niveles de magnitud y 4 valores de efecto sobre la puntuación). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación destacable no está en la arquitectura, sino en el pipeline de etiquetado: el modelo se diseñó para operar encadenado tras un etiquetador de estados (cada transición necesita las etiquetas de estado de ambas versiones), y los autores indican que las etiquetas liberadas en TraceML se generaron con vLLM 0.8.5 en bf16, decodificación greedy y prefix caching deshabilitado. Para reproducir etiquetas hay que decodificar de forma greedy y con el modo thinking desactivado, ya que el `generation_config.json` conserva los valores de muestreo por defecto de Qwen3.

## Capacidades

- Generación de JSON estructurado y restringido por esquema a partir de una transición entre dos versiones de una solución de ML.
- Clasificación de acciones gruesas en 10 categorías: `data`, `features`, `augmentation`, `model`, `training`, `ensemble`, `validation`, `inference`, `infra`, `housekeeping`.
- Predicción de acciones finas seleccionadas de una lista cerrada de 85 elementos, cada una con su acción padre y un nivel de confianza (`high`, en los ejemplos mostrados).
- Inferencia de intención del desarrollador o agente entre 6 valores: `exploration`, `optimization`, `pivoting`, `debugging`, `restructuring`, `verification`.
- Estimación de la magnitud de la edición (`micro`, `minor`, `major`, `overhaul`) y del efecto sobre la puntuación (`improving`, `plateau`, `regressing`, `unknown`).
- Generación de dos campos de lenguaje natural: `goal_nl` (objetivo de la edición) y `diff_summary` (resumen del diff).
- Comprensión de diffs de código y de código fuente en general (idioma declarado: `code`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo es un componente de un pipeline mayor gestionado por el toolkit TraceML.
- Capacidades multilingües: no; los idiomas declarados son inglés y código.
- Capacidad especial: no dispone de modo thinking activable en este fine-tune; la decodificación recomendada lo desactiva explícitamente.

## Casos de uso

- Etiquetado automático de trayectorias de ML: integrado en el pipeline `traceml analyze runs/my_run`, el modelo extrae cada versión de código, etiqueta estados y transiciones y genera un informe comparado con cohortes humanas.
- Análisis forense de experimentos (MLOps): dado el diff entre dos commits de un pipeline de entrenamiento y el cambio de métrica, el modelo produce una descripción estructurada de qué cambió y con qué intención, útil para auditar por qué un experimento mejoró o empeoró.
- Investigación sobre planificación de agentes: el modelo permite etiquetar a escala (151.088 versiones en la publicación original) las decisiones de agentes y humanos que desarrollan soluciones de ML, generando datos cuantitativos para estudios sobre estrategias de exploración, optimización o pivote.
- Clasificación de intención en commits y pull requests: los 6 valores de `intent` y las 10 acciones gruesas permiten enrutar o agrupar cambios en repositorios de ML dentro de herramientas internas de revisión y analítica.
- Sustitución de un profesor propietario en pipelines de destilación de datos: al ser un modelo local de 1,72 mil millones de parámetros con licencia Apache-2.0, permite regenerar o ampliar etiquetas sin coste por token en servicios externos.
- Extracción de datos estructurados para entrenar modelos menores: las salidas JSON con vocabulario cerrado sirven como corpus supervisado para destilar clasificadores más pequeños o para alimentar dashboards de seguimiento de experimentos.
- Detección de regresiones con contexto: el campo `score_effect` permite marcar automáticamente ediciones regresivas o en plateau dentro de un sistema de alertas sobre runs de Kaggle o competiciones internas.
- Análisis de código en herramientas de desarrollo: al aceptar diffs como entrada y declarar soporte del idioma `code`, puede emplearse en complementos que resuman cambios técnicos en terminología homogénea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los metadatos de HuggingFace no incluyen métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con el profesor GPT o con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16: alrededor de 3,5 GB solo para pesos (el repositorio ocupa 3,5 GB), más la caché KV correspondiente al contexto utilizado. Presupuesto práctico de 6 a 10 GB de VRAM para inferencias con contexto moderado.
- VRAM estimada con cuantización: no disponible oficialmente; una conversión a 8 bits situaría los pesos en torno a 1,8 GB y a 4 bits en torno a 1 GB, aunque el repositorio no publica versiones cuantizadas.
- Cabe en GPU de consumo: sí. Es viable en tarjetas con 8-12 GB o más (por ejemplo, RTX 3060/4060, RTX 4070, RTX 4090), y también en GPU de datacenter pequeñas tipo T4 o L4.
- GPU recomendadas para producción con lotes: A100, H100 o L40S para throughput alto; para uso individual basta una GPU de consumo.
- Opciones de despliegue: vLLM 0.8.5 en bf16 (configuración empleada por los autores, con decodificación greedy y prefix caching deshabilitado), transformers, y text-generation-inference, ya que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. El uso de llama.cpp u Ollama requeriría convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de benchmarks de este modelo, por lo que la comparación se limita a parámetros, licencia y orientación. Los datos de contexto de los modelos alternativos provienen de su documentación pública, no de la información proporcionada sobre TraceML Action Labeler.

| Modelo | Parametros | Contexto (documentacion publica) | Licencia | Orientacion | Benchmarks |
|---|---|---|---|---|---|
| TraceML Action Labeler | 1,72 mil millones | No disponible | Apache-2.0 | Etiquetado de transiciones en trayectorias de ML (salida JSON cerrada) | No publicados |
| Qwen/Qwen3-1.7B (base) | 1,72 mil millones | 32.768 tokens nativos | Apache-2.0 | Modelo de propósito general con modo thinking | Publicados por el autor del modelo base, no incluidos aquí |
| Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32.768 tokens nativos | Apache-2.0 (salvo excepciones indicadas por el autor) | Asistente generalista multilingüe | No disponible en esta ficha |
| SmolLM2-1.7B-Instruct | ~1,7 mil millones | 8.192 tokens nativos | Apache-2.0 | Asistente generalista en inglés | No disponible en esta ficha |

Ninguno de los modelos alternativos cubre la tarea específica de etiquetado de acciones e intenciones sobre diffs de soluciones de ML con vocabulario cerrado, por lo que la comparación directa de rendimiento no está disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks; no hay evidencia cuantitativa de su calidad frente al profesor GPT que generó las etiquetas ni frente al modelo base.
- El modelo está especializado en un dominio muy estrecho: transiciones entre versiones de soluciones de ML. Fuera de ese dominio su comportamiento no está documentado.
- Requiere las etiquetas de estado de ambas versiones de la transición como entrada, por lo que depende del etiquetador de estados y no puede usarse de forma aislada.
- Solo declara inglés y código; no hay soporte documentado de castellano ni de otros idiomas naturales.
- La decodificación debe ser greedy y con thinking deshabilitado para reproducir las etiquetas publicadas; el `generation_config.json` conserva los valores de muestreo por defecto de Qwen3, lo que puede producir salidas distintas si no se sobrescriben.
- Riesgo de alucinación: al generar JSON con vocabulario cerrado, puede producir acciones finas o combinaciones de campo poco plausibles. Los niveles de confianza mostrados (`high`) no son probabilidades calibradas.
- La información sobre sesgos del modelo base Qwen3-1.7B aplica igualmente aquí, agravada por el ajuste fino sobre etiquetas generadas por un profesor, que puede arrastrar los sesgos de dicho profesor.
- Licencia Apache-2.0 heredada de Qwen3; permite uso comercial, pero conviene revisar las condiciones del modelo base y las del dataset TraceML si se redistribuyen datos derivados.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de terceros sobre su comportamiento en producción.
- No se especifican requisitos de memoria para contextos largos ni estrategias de ajuste del código largo; esa responsabilidad recae en el toolkit.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jerryyan/TraceML-Action-Labeler
- Dataset TraceML: https://huggingface.co/datasets/jerryyan/TraceML
- Esquemas completos del vocabulario: https://huggingface.co/datasets/jerryyan/TraceML/tree/main/manifests/schemas
- Pesos originales dentro del dataset: https://huggingface.co/datasets/jerryyan/TraceML/tree/main/models/qwen3-1.7b-action/final
- Etiquetador de estados: https://huggingface.co/jerryyan/TraceML-State-Labeler
- Paper: https://arxiv.org/abs/2608.26086
- Toolkit (GitHub): https://github.com/JerryYan123/TraceML
- Página del proyecto: https://jerryyan123.github.io/TraceML/
