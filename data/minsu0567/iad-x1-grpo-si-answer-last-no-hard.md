# minsu0567/IAD-X1-GRPO-si-answer-last-no-hard

## Resumen

IAD-X1-GRPO-si-answer-last-no-hard es un modelo multimodal (imagen y texto) desarrollado por minsu0567 para la detección de anomalías industriales. Se basa en Qwen3.5-4B y ha sido ajustado mediante fine-tuning con refuerzo (GRPO) sobre un modelo previo SFT (IAD-X1-SFT-si-answer-last). Su propósito es, dado un par de imágenes (una referencia de pieza buena y una imagen de consulta), determinar si la pieza tiene un defecto y, en caso afirmativo, indicar el tipo de defecto y su localización en la imagen. El modelo está diseñado para funcionar en entornos de producción con inferencia de texto e imagen, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Aunque el repositorio no ofrece métricas oficiales, su diseño está pensado para tareas de inspección visual automatizada en entornos industriales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible (no se publica en la model card) |
| Tipos de cuantizacion | No disponible (formato safetensors; no se indican cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3.5-4B, que combina un encoder visual con un modelo de lenguaje para procesar imágenes y texto de forma conjunta. El entrenamiento se realizó en dos fases: primero un fine-tuning supervisado (SFT) sobre un dataset de detección de anomalías industriales, y posteriormente un refinamiento con GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas que mejora la alineación con las respuestas esperadas. El autor indica que el entrenamiento se realizó con la librería Unsloth (para acelerar el fine-tuning) y TRL de HuggingFace. No se detallan el número de tokens de entrenamiento ni la composición exacta del dataset, pero el repositorio de GitHub menciona que el orden de respuesta es fijo: tipo de defecto → ubicación → respuesta final (answer-last).

## Capacidades

- Detección de defectos en imágenes industriales: dada una imagen de referencia (pieza correcta) y una imagen de consulta, el modelo clasifica si existe un defecto y devuelve una respuesta binaria (defecto o no).
- Clasificación del tipo de defecto: identifica la categoría del defecto (por ejemplo, rasguño, abolladura, etc.) según el dataset de entrenamiento.
- Localización del defecto: reporta la posición del defecto en la imagen, probablemente mediante coordenadas o bounding box.
- Entrada multimodal: acepta dos imágenes como entrada junto con un prompt textual.
- Salida estructurada: la respuesta sigue un formato fijo (tipo → ubicación → respuesta), lo que facilita su integración en pipelines de automatización.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso más allá de la tarea de inspección.

## Casos de uso

- Control de calidad en líneas de fabricación: el modelo puede integrarse en sistemas de visión industrial para inspeccionar piezas en tiempo real, comparando cada unidad con una imagen de referencia y alertando sobre defectos.
- Inspección de componentes electrónicos: verificación de soldaduras, placas de circuito o microchips mediante comparación con patrones correctos.
- Mantenimiento predictivo de maquinaria: análisis de imágenes de equipos para detectar signos tempranos de desgaste o daño (grietas, corrosión) a partir de fotografías periódicas.
- Automatización de control de calidad en sectores automotriz o aeroespacial: revisión de superficies, acabados y piezas críticas sin intervención humana.
- Asistencia en laboratorios de materiales: apoyo a investigadores para clasificar defectos en muestras mediante imágenes de microscopio.
- Integración en plataformas de inspección visual como parte de un sistema más amplio de gestión de calidad, donde el modelo actúa como un clasificador especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de Hugging Face no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Tampoco se han encontrado evaluaciones comparativas en la web. Se recomienda realizar pruebas propias con el dataset de la tarea de detección de anomalías para validar el rendimiento.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware específicos.
- Dado que el modelo tiene 4.539 millones de parámetros (aproximadamente 4,5B), se puede estimar que la inferencia en FP16 requiere alrededor de 9 GB de VRAM, y con cuantización a 8 bits o 4 bits podría reducirse a 5-7 GB, lo que permitiría ejecución en GPUs de consumo como RTX 3090, RTX 4080 o RTX 4090.
- Para despliegue en producción, se recomienda usar servidores con GPUs de 24 GB o más (A10G, A100, H100) si se quiere mantener alta velocidad y contexto largo.
- Opciones de despliegue: el modelo es compatible con transformers, text-generation-inference (TGI) y se puede servir con vLLM o llama.cpp (si se convierte a GGUF). También es posible usar Ollama con una conversión previa.
- No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de detección de anomalías industriales. El campo de modelos específicos para este tipo de tareas es muy reciente y no hay modelos públicos comparables con las mismas características (multimodal, 4B parámetros, fine-tuning con RL). Se recomienda consultar el repositorio del autor para posibles trabajos relacionados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el idioma inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado evaluaciones de sesgos, pero al ser un modelo especializado en imágenes industriales, es probable que tenga sesgos relacionados con el tipo de defectos y dominios de datos de entrenamiento (por ejemplo, limitado a ciertos materiales o condiciones de iluminación).
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventar defectos en imágenes que no los tienen, especialmente en casos fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar si el dataset de entrenamiento tiene restricciones adicionales, ya que el autor menciona en su perfil de Hugging Face que su investigación está orientada a fines académicos/no comerciales, aunque la licencia del modelo no lo impide.
- El modelo no incluye soporte para otros idiomas ni para tareas más allá de la inspección de imágenes; no se debe usar como un asistente generalista.
- No se han publicado evaluaciones de robustez frente a cambios de iluminación, perspectiva o resolución de imagen; es necesario validar en el entorno de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minsu0567/IAD-X1-GRPO-si-answer-last-no-hard
- Repositorio GitHub del proyecto IAD-X1: https://github.com/minsu0567/IAD-X1
- Modelo base (SFT): https://huggingface.co/minsu0567/IAD-X1-SFT-si-answer-last
- Página de despliegue en FriendliAI: https://friendli.ai/models/minsu0567/IAD-X1-GRPO-answer-last-no-hard
