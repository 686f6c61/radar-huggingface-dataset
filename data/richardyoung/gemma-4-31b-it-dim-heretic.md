# richardyoung/gemma-4-31B-it-DiM-heretic

## Resumen

`richardyoung/gemma-4-31B-it-DiM-heretic` es una variante "decensored" (abliterada) del modelo multimodal `google/gemma-4-31B-it` de Google DeepMind, generada con la herramienta Heretic v2.0.0. El objetivo declarado del autor es reducir los rechazos (refusals) del modelo original ante peticiones que activan sus salvaguardas, aplicando una modificación direccional sobre los pesos de las proyecciones de atención (`attn.o_proj`) y del MLP (`mlp.down_proj`). El modelo conserva la arquitectura, el tokenizador y las capacidades del Gemma 4 31B Dense original: transformer denso de 60 capas con atención híbrida (sliding window local de 1024 tokens intercalada con atención global), ventana de contexto de hasta 256K tokens, vocabulario de 262K y entrada multimodal texto-imagen.

El dato de rendimiento publicado por el autor es revelador: el modelo abliterado presenta 98/100 rechazos frente a 99/100 del original, con una divergencia KL de 0,0932 respecto al modelo base. Es decir, la abliteración aplicada en este caso apenas reduce la tasa de rechazo (un punto porcentual), lo que sugiere que el procedimiento no ha logrado eliminar de forma efectiva el comportamiento de negativa del modelo original. Es relevante ahora porque ilustra un caso práctico de reproducibilidad en el ecosistema de modelos abliterados y porque permite evaluar críticamente la eficacia real de estas técnicas sobre modelos de gran tamaño con alineamiento robusto.

El repositorio ocupa 62,6 GB en safetensors, con 31.273.086.512 parámetros reales, y se distribuye bajo licencia Apache 2.0 (con enlace a la licencia específica de Gemma 4). El modelo está pensado para ejecución con `transformers` y pipelines de imagen-texto-a-texto, y el autor incluye un directorio `reproduce` con los parámetros exactos de abliteración para replicar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), basado en Gemma 4 31B Dense |
| Parametros totales | 31.273.086.512 (31,27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors; se asume compatibilidad con cuantización estándar vía transformers/GGUF, pero no confirmado) |
| Idiomas soportados | No disponible en la ficha del modelo derivado; el modelo base Gemma 4 declara soporte multilingüe en más de 140 idiomas |
| Licencia | Apache 2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 31B Dense: 60 capas, vocabulario de 262K tokens, ventana de contexto de 256K y un mecanismo de atención híbrido que intercala capas con sliding window local de 1024 tokens con capas de atención global (la última capa es siempre global). Las capas globales emplean claves y valores unificados y RoPE proporcional (p-RoPE) para optimizar el uso de memoria en contextos largos. El codificador de visión del 31B aporta aproximadamente 550M parámetros; este tamaño no incluye entrada de audio (a diferencia de las variantes E2B, E4B y 12B). El modelo es multimodal texto-imagen con salida de texto.

Sobre el entrenamiento original de Gemma 4 no se detalla en la información proporcionada el número de tokens, la composición del dataset ni si hubo RLHF/DPO; la model card únicamente indica que la familia incluye variantes preentrenadas e instruidas y que todos los modelos están diseñados como razonadores con modos de pensamiento configurables. La modificación aplicada por el autor es una abliteración con Heretic v2.0.0, que opera sobre direcciones de rechazo identificadas en los pesos: `direction_index` 51,31; en `attn.o_proj`, `max_weight` 1,21 en posición 53,02, `min_weight` 0,13 a distancia 5,78; en `mlp.down_proj`, `max_weight` 1,07 en posición 48,95, `min_weight` 0,28 a distancia 28,07. El proceso es reproducible mediante el directorio `reproduce/README.md`.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes), heredados de Gemma 4.
- Comprensión de imágenes (image-text-to-text) con soporte de relación de aspecto y resolución variables.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores, según la model card del base.
- Soporte nativo de function calling / tool calling.
- Soporte nativo del rol `system` en prompts, permitiendo conversaciones estructuradas y controlables.
- Capacidades multilingües amplias (más de 140 idiomas en el modelo base).
- Flujos de agente multi-paso y razonamiento encadenado.
- Comportamiento "decensored": reducción declarada de rechazos, aunque medida en solo 1 punto porcentual frente al original (98/100 vs 99/100).

## Casos de uso

- Evaluación de técnicas de abliteración: el modelo sirve como caso de estudio reproducible (parámetros Heretic incluidos) para medir la eficacia real de la abliteración sobre un modelo alineado de 31B, comparando tasas de rechazo y divergencia KL.
- Investigación sobre alineamiento y salvaguardas: permite analizar cómo se distribuyen las direcciones de rechazo en las proyecciones de atención y MLP de un transformer denso de 60 capas.
- Atención al cliente con contexto largo: la ventana de 256K tokens permite gestionar conversaciones multi-turno extensas o adjuntar documentación larga junto a capturas de pantalla, aunque el comportamiento decensored exige filtros externos de moderación.
- Análisis de documentos e imágenes en pipelines internos: el pipeline image-text-to-text admite la extracción de información de capturas, gráficos o formularios junto a texto, útil en entornos controlados donde el riesgo de contenido no filtrado es aceptable.
- Generación de código asistida con tool calling: integración en flujos de CI/CD o asistentes de IDE que requieran llamadas a funciones y razonamiento multi-paso, con revisión humana obligatoria dado el origen del modelo.
- Prototipado de agentes con system prompt nativo: construcción de agentes que necesiten instrucciones de sistema persistentes y contexto largo para planificación de tareas.
- Experimentación académica con modelos multimodales abliterados: comparación de la degradación de capacidades (medida por KL divergence 0,0932) frente al modelo base en tareas de visión y razonamiento.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-31B-it) |
|---|---|---|
| Rechazos (refusals) | 98/100 | 99/100 |
| Divergencia KL | 0,0932 | 0 (por definición) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo derivado ni para el modelo base Gemma 4 31B en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 62-63 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada con cuantización a 8 bits: en torno a 31-35 GB; con 4 bits: en torno a 16-20 GB (estimaciones basadas en el recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU para precisión completa; para cuantización 4 bits podría ejecutarse en una RTX 4090 de 24 GB con contexto limitado.
- Cabe en GPU consumer: solo con cuantización agresiva (4 bits) y aceptando recortes de contexto; el tamaño del repositorio (62,6 GB) impide ejecución en consumer GPU sin cuantizar.
- Opciones de despliegue: `transformers` (librería declarada), y potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF compatibles (no confirmado en la información disponible); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-DiM-heretic | 31,27B | 256K | Texto, imagen | Apache 2.0 | Abliterado; 98/100 rechazos; KL 0,0932 |
| google/gemma-4-31B-it | 30,7B (31B Dense) | 256K | Texto, imagen | Apache 2.0 (licencia Gemma 4) | Modelo base alineado; 99/100 rechazos |
| google/gemma-4-26B-A4B | 26B totales (MoE, A4B) | 256K | Texto, imagen | Apache 2.0 (licencia Gemma 4) | Variante MoE de la misma familia, no disponible confirmación de parámetros activos en la información proporcionada |
| google/gemma-4-12B | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 (licencia Gemma 4) | Variante más pequeña con audio nativo |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) entre estas variantes.

## Limitaciones y advertencias

- La abliteración aplicada reduce los rechazos de forma marginal (de 99/100 a 98/100), por lo que el modelo puede seguir rechazando peticiones que el original rechazaría; la expectativa de un modelo totalmente "uncensored" no se cumple según los datos del propio autor.
- La divergencia KL de 0,0932 respecto al modelo base indica una alteración medible de la distribución de salida, con posible degradación de calidad o coherencia en tareas generales.
- Riesgo elevado de generar contenido inapropiado, ofensivo o inseguro en ausencia de salvaguardas efectivas reducidas; requiere moderación externa en cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos generativos de 31B; no se han publicado evaluaciones específicas de factualidad para esta variante.
- Idiomas soportados: no declarados en la ficha del derivado; se hereda el multilingüismo del base (más de 140 idiomas) pero sin garantía de preservación tras la modificación de pesos.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso del modelo base antes de uso comercial, ya que pueden incluir restricciones adicionales de la familia Gemma.
- El modelo deriva de un base con fecha de creación posterior a la disponible en el entorno del autor de esta ficha; la información sobre entrenamiento (tokens, dataset, RLHF/DPO) del base no está detallada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; tratar como modelo experimental.

## Enlaces

- [Hugging Face: richardyoung/gemma-4-31B-it-DiM-heretic](https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic)
- [Modelo base: google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [Heretic project](https://heretic-project.org)
- [Colección Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [GitHub Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentación Gemma](https://ai.google.dev/gemma/docs/core)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Informe técnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Google DeepMind Gemma](https://deepmind.google/models/gemma/)
