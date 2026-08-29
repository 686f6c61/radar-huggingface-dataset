# shikunpunk/Qwen2.5-3B-YuHua-V4

## Resumen

Qwen2.5-3B-YuHua-V4 es un conjunto de adaptadores LoRA desarrollado por shikunpunk sobre el modelo base Qwen/Qwen2.5-3B-Instruct, especializado en la generación de ficción narrativa en chino que imita el estilo literario del escritor Yu Hua. El repositorio contiene cuatro versiones evolutivas (V4, V5, V6 y V8) que emplean una arquitectura de múltiples adaptadores especializados para controlar distintos aspectos de la escritura: planificación de trama, diálogos, descripción psicológica, escenas y control de calidad. La versión más reciente, V8, integra ocho adaptadores independientes que se activan según la tarea, incluyendo un router de clasificación de nodos narrativos y un módulo anti-memorización para evitar la reproducción literal de textos de entrenamiento.

El modelo resuelve el problema de la generación de prosa con un estilo literario consistente, un reto habitual en los modelos de lenguaje genéricos que tienden a producir texto plano o sin voz propia. Su relevancia radica en demostrar un enfoque práctico de estilometría aplicada mediante LoRA multi-adapter, con un coste de entrenamiento reducido al partir de un modelo base de 3B parámetros. El contexto nativo del modelo base es de 32K tokens, ampliable a 128K con técnicas de extensión como YaRN, aunque los adaptadores no modifican esta capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptadores LoRA |
| Parametros totales | 3.09B (modelo base) + adaptadores LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (nativo del modelo base); extensible a 128K con YaRN |
| Tipos de cuantizacion | No aplica directamente al LoRA; el modelo base admite cuantizacion 4-bit y 8-bit via BitsAndBytes |
| Idiomas soportados | Chino (principal); herencia multilingue del modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-3B-Instruct, un transformer decoder-only denso con normalización RMSNorm, atención con sesgo de atención (attention bias) y activación SwiGLU. Sobre esta base se aplican adaptadores LoRA de bajo rango, entrenados con LLaMA-Factory. El entrenamiento se realizó en varias fases: V4 empleó dos etapas (pre-entrenamiento con continuación de texto y nombres simbolizados, seguido de instrucciones con CoT de fuerte restricción); V5 amplió a ocho tareas separadas (diálogo, difusión, trama, psicología, QA, escena, pre-entrenamiento y SFT); V6 introdujo la desensibilización de nombres ficticios; y V8 consolidó ocho adaptadores especializados con un router de decisión entre nodos narrativos y un módulo anti-memorización.

Los datos de entrenamiento provienen del dataset shikunpunk/YuHua-Qwen3-V4-Data, con 2302 muestras de entrenamiento y 230 de validación para V4, y 30MB en 16 archivos JSONL para V5 y V8. No se menciona el uso de RLHF ni DPO; el enfoque es puramente supervisado con múltiples tareas. La innovación principal es el sistema de router que clasifica cada segmento narrativo en acción, diálogo, psicología o escena, y selecciona el adaptador adecuado, junto con un juez de calidad de cinco dimensiones (coherencia, referencias, tono, repetición y longitud).

## Capacidades

- Generación de prosa narrativa en chino con estilo literario imitativo de Yu Hua, incluyendo descripciones de ambiente, diálogos y monólogos interiores.
- Planificación de tramas: el adaptador `planner` genera resúmenes de nodos narrativos con estructura de cuatro a seis puntos (planteamiento, desarrollo, clímax y desenlace).
- Escritura de diálogos y escenas: adaptadores `dialogue` y `scene` especializados en diálogos naturales y descripciones de entorno.
- Descripción psicológica y de acciones: adaptador `psych` para la representación de estados internos de los personajes.
- Control de calidad integrado: adaptador `judge` evalúa cinco dimensiones (coherencia, referencias, tono, repetición y recuento de caracteres) y puede usarse para filtrar o corregir salidas.
- Clasificación de segmentos narrativos: adaptador `router` categoriza cada fragmento en acción, diálogo, psicología o escena, permitiendo la selección dinámica de adaptadores.
- Prevención de memorización: adaptador `anti_memo` realiza una clasificación binaria (PASS/FAIL) para detectar y evitar la reproducción literal de textos de entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso; su ámbito es exclusivamente la generación de ficción.

## Casos de uso

- Asistencia a escritores en chino: un autor puede usar el adaptador `writer` para generar borradores de 800 a 1500 caracteres con el estilo de Yu Hua, y luego editar el resultado. Es adecuado porque el modelo ha sido entrenado específicamente con corpus del autor y produce prosa con densidad de recursos literarios.
- Generación de diálogos para novelas: el adaptador `dialogue` permite crear conversaciones entre personajes con naturalidad y coherencia, útil para escenas de confrontación o interacción social.
- Planificación de tramas para ficción: el adaptador `planner` genera resúmenes de nodos narrativos con estructura de cuatro a seis puntos, lo que facilita el diseño de capítulos o arcos argumentales antes de redactar el texto completo.
- Creación de contenido para blogs literarios o revistas digitales: se puede generar prosa corta al estilo de Yu Hua para publicaciones periódicas, usando el adaptador `writer` y luego el `judge` para verificar la calidad.
- Análisis estilométrico y comparativo: investigadores pueden usar el modelo para estudiar la densidad de recursos literarios (por ejemplo, la métrica de "prosa poética" del smoke test) y comparar estilos entre diferentes adaptadores o versiones.
- Herramientas de escritura creativa asistida: integración en editores de texto o aplicaciones de escritura que ofrezcan sugerencias de estilo, usando el router para seleccionar el adaptador adecuado según el tipo de segmento que se esté escribiendo.
- Control de calidad en pipelines de generación: el adaptador `judge` puede emplearse como filtro automático para descartar segmentos que no cumplan los criterios de coherencia, tono o longitud, antes de publicar o entregar el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona un smoke test de la versión V8 en modo `force_writer` que mide la densidad de prosa poética (散文腔) por cada mil caracteres, con un objetivo de 0.65. Los resultados son:

| Escenario | Caracteres | Densidad |
|---|---|---|
| 01 Estacion de tren, despedida | 2160 | 7.87 |
| 02 Boda rural | 2912 | 6.52 |
| 03 Accidente en fabrica | 3652 | 4.11 |
| 04 Discusion en mercado | 3742 | 1.87 |
| 05 Regreso a casa de madrugada | 2296 | 12.63 |
| **Media** | | **6.60** |

El autor indica que la densidad media de 6.60 es diez veces superior al objetivo de 0.65, y que aunque se redujo a la mitad respecto a la versión V6.3 (que obtenía entre 9 y 11), el resultado no logra el cambio cualitativo deseado. Este dato sugiere que el modelo tiende a un exceso de recursos literarios, lo que puede resultar en un estilo recargado o poco natural.

## Requisitos de hardware

- VRAM estimada: el modelo base de 3B parámetros en cuantización 4-bit requiere aproximadamente 2-3 GB de VRAM. Los adaptadores LoRA añaden un overhead mínimo (menos de 100 MB en total). Con cuantización 8-bit, la VRAM sube a unos 4-5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM es suficiente, por ejemplo NVIDIA RTX 3060, RTX 4060, RTX 4090, o GPUs de Apple Silicon con memoria unificada de 8 GB o más.
- En consumer GPU: sí, cabe en GPUs de gama media y alta. Una RTX 3060 de 12 GB puede ejecutar el modelo con cuantización 4-bit y dejar margen para el contexto.
- Opciones de despliegue: el modelo se carga con la librería `peft` de HuggingFace, por lo que es compatible con `transformers` y `BitsAndBytes` para cuantización. También puede usarse con vLLM si se fusionan los adaptadores en el modelo base (no soporta LoRA dinámico de forma nativa). Para despliegue en CPU, se puede convertir a GGUF fusionando los adaptadores, aunque no hay archivos GGUF precompilados en el repositorio.
- Latencia y throughput: no se han publicado mediciones. En una GPU consumer moderna, un modelo de 3B en 4-bit genera típicamente entre 20 y 50 tokens por segundo, dependiendo de la longitud de la secuencia y el hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de estilometría literaria comparables en el momento de la consulta. La comparación más directa es con el modelo base Qwen2.5-3B-Instruct, que carece de la especialización estilística:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3.09B | 32K | Generacion general, multilingue | Apache-2.0 |
| Qwen2.5-3B-YuHua-V4 (este) | 3.09B + LoRA | 32K | Ficcion en chino estilo Yu Hua | Apache-2.0 |

Otras alternativas como Qwen2.5-7B-Instruct o Llama-3.2-3B-Instruct podrían usarse con LoRA similar, pero no se han encontrado adaptadores públicos equivalentes para el estilo de Yu Hua. La comparativa con modelos de generación de ficción en chino como CPM-Bee o ChatGLM no es pertinente porque no están orientados a estilometría.

## Limitaciones y advertencias

- El smoke test revela que la densidad de prosa poética es diez veces superior al objetivo (6.60 frente a 0.65), lo que indica un exceso de recursos literarios que puede producir textos recargados, artificiales o poco naturales para lectores acostumbrados a la prosa de Yu Hua.
- El modelo está entrenado exclusivamente con corpus en chino y su especialización es únicamente la ficción literaria. No es adecuado para tareas de razonamiento general, generación de código, matemáticas o diálogo conversacional.
- Existe riesgo de memorización de fragmentos del corpus de entrenamiento, aunque el adaptador `anti_memo` intenta mitigarlo. Se recomienda verificar la originalidad de los textos generados antes de su publicación.
- El contexto nativo de 32K tokens puede ser insuficiente para novelas completas; para textos más largos se requiere extensión de contexto (por ejemplo, YaRN), que no está validada con estos adaptadores.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen2.5-3B-Instruct también cumple con los términos de uso de Alibaba (también Apache-2.0, sin restricciones adicionales conocidas).
- El repositorio no incluye documentación sobre el rendimiento en tareas fuera del ámbito de la ficción, ni garantías de estabilidad en producción. El número de descargas y likes es cero, lo que sugiere que el modelo no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shikunpunk/Qwen2.5-3B-YuHua-V4
- Dataset de entrenamiento y reportes: https://huggingface.co/datasets/shikunpunk/YuHua-Qwen3-V4-Data
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B
- Documentación de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b
