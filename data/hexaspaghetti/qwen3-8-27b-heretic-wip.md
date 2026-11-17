# HexaSpaghetti/Qwen3.8-27B-Heretic-WIP

## Resumen

Qwen3.8-27B-Heretic-WIP es una versión "descensurada" (decensored) del modelo Qwen3.8-27B de Alibaba Qwen, generada por el usuario HexaSpaghetti mediante la herramienta Heretic v2.2.0.dev0. El proceso aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 8 a 61 del modelo original para reducir drásticamente la tasa de rechazos ante peticiones que el modelo base rechazaría, manteniendo al mismo tiempo un comportamiento general lo más cercano posible al original.

El modelo base es un transformer causal denso de 27.356 millones de parámetros con codificador de visión nativo, diseñado para tareas de razonamiento, código, trabajo profesional y agentes de horizonte largo. Incorpora una arquitectura híbrida con capas de atención lineal (Gated DeltaNet) intercaladas con capas de atención completa (Gated Attention), control flexible de "thinking mode" y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000.

La relevancia de esta variante radica en su utilidad para investigación sobre alineación y seguridad, así como para casos de uso que requieren baja tasa de rechazos sin renunciar a las capacidades del modelo original. La model card reporta una reducción de rechazos de 98/100 en el modelo original a 6/100 en esta versión, con una divergencia KL de 0,1950 respecto al modelo base. El modelo es reproducible y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de vision; layout hibrido 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Embedding de tokens | 248.320 (padded) |
| FFN intermedia | 17.408 |
| Gated DeltaNet | 48 cabezas lineales para V, 16 para QK, dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV, dimension de cabeza 256, RoPE 64 |
| MTP (Multi-Token Prediction) | entrenado con multiples pasos |
| Tamano del repo | 146,6 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer causal denso que combina dos tipos de capas de atención en un patrón repetido 16 veces: tres bloques con Gated DeltaNet (atención lineal) seguidos de un bloque con Gated Attention (atención completa). Esta disposición híbrida busca reducir el coste computacional en contextos largos manteniendo la capacidad de atención global. El modelo incluye un codificador de visión que lo convierte en un modelo nativo de visión-lenguaje, capaz de procesar imágenes y vídeos. Se entrenó en dos fases (pre-entrenamiento y post-entrenamiento) e incorpora Multi-Token Prediction (MTP) con múltiples pasos, una técnica que permite predecir varios tokens por paso y que habilita decodificación especulativa.

La variante Heretic aplica Arbitrary-Rank Ablation sobre las capas 8 a 61 con los parámetros reportados: `start_layer_index` 8, `end_layer_index` 61, `preserve_good_behavior_weight` 0,8036, `steer_bad_behavior_weight` 0,0016, `overcorrect_relative_weight` 0,9968 y `neighbor_count` 12. Este procedimiento modifica los pesos para suprimir direcciones asociadas a comportamientos de rechazo, preservando en la medida de lo posible el resto de capacidades. El resultado reportado es una tasa de rechazos de 6/100 frente a 98/100 del original, con una divergencia KL de 0,1950. El proceso es reproducible y los detalles se documentan en el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras reportadas en código, trabajo profesional e investigación respecto a generaciones anteriores de la familia Qwen.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible de "thinking mode": activado por defecto, desactivable por petición, con profundidad de razonamiento ajustable mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares, lo que facilita la integración en stacks existentes.
- Soporte de tool calling / function calling (implícito en la orientación agéntica del modelo base).
- Capacidades multilingües: no disponibles en detalle en la información proporcionada.
- Multi-Token Prediction (MTP) entrenado, útil para decodificación especulativa y aceleración de inferencia.
- Tasa de rechazos reducida (6/100) respecto al modelo base (98/100), orientada a casos de uso con baja censura.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación de direcciones de comportamiento sobre las capacidades generales, comparando con el modelo original mediante la divergencia KL reportada (0,1950) y la tasa de rechazos.
- Generación de código en producción: con 27B parámetros y soporte para vLLM, SGLang y TokenSpeed, puede integrarse en pipelines de CI/CD para generación, revisión y refactorización de código, aprovechando su contexto nativo de 262K tokens para manejar repositorios completos.
- Agentes autónomos de horizonte largo: la planificación mejorada y el manejo de retroalimentación del entorno lo hacen adecuado para tareas multi-paso que requieren completar flujos complejos con poca supervisión.
- Análisis de documentos y vídeos: su codificador de visión nativo permite procesar diagramas STEM, documentos escaneados y vídeos de hasta una hora, útil en investigación, auditoría documental y análisis de contenido multimedia.
- Asistencia conversacional multi-turno: con 262K tokens de contexto nativo y retención de contexto de razonamiento (`preserve_thinking`), puede mantener conversaciones largas con historial extenso sin perder coherencia.
- Procesamiento de contenido sin filtrado para investigación: la baja tasa de rechazos lo hace útil en estudios que requieren respuestas del modelo ante peticiones que el base rechazaría, siempre dentro de marcos éticos y legales.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0 y formatos compatibles con transformers, vLLM y SGLang, puede servirse en clústeres de GPU sin dependencia de APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de texto del modelo base Qwen3.8-27B comparado con Qwen3.6-27B y Qwen3.7-Plus, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). Los únicos datos de rendimiento disponibles son los de la ablación:

| Metrica | Este modelo | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Rechazos | 6/100 | 98/100 |
| Divergencia KL | 0,1950 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo denso de 27,36B parámetros en FP16 requiere aproximadamente 55 GB solo para pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, se necesitarían GPUs con al menos 80 GB (A100, H100) para FP16, o configuraciones multi-GPU.
- Cabe en consumer GPU: no disponible en la información proporcionada; con cuantización agresiva (4-bit) podría aproximarse a 16-24 GB, pero no se confirma en la información.
- Opciones de despliegue: transformers, vLLM, SGLang, TokenSpeed (según la model card).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Heretic-WIP | 27,36B | 262K (ext. 1M) | Apache 2.0 | Variante descensurada; rechazos 6/100; KL 0,1950 |
| Qwen3.8-27B (original) | 27B | 262K (ext. 1M) | Apache 2.0 | Modelo base; rechazos 98/100 |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Generación anterior de la familia Qwen |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Generación intermedia de la familia Qwen |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La ablación puede degradar capacidades generales: la divergencia KL de 0,1950 respecto al original indica cambios en la distribución de salida que podrían afectar a la calidad en tareas sensibles.
- El proceso de "decensoring" elimina salvaguardas: el modelo puede generar contenido que el original rechazaría, lo que exige revisión y filtrado adicional en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- Idiomas soportados: no disponibles; se desconoce si la ablación afecta de forma desigual a distintos idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el despliegue de contenido sin filtrar puede conllevar obligaciones legales y éticas adicionales según la jurisdicción.
- Estado "WIP" (work in progress): el autor indica que el modelo está en desarrollo; pueden aparecer revisiones.
- Sin datos de benchmarks estándar publicados para esta variante; el rendimiento en tareas concretas no está verificado de forma independiente.
- Capacidades de visión: no se ha verificado si la ablación afecta al codificador de visión o solo a las capas del LM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-27B-Heretic-WIP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de decensoring): https://heretic-project.org
- Qwen Cloud (servicio oficial): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
