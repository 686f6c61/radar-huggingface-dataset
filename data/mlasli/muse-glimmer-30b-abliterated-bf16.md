# mlasli/Muse-Glimmer-30B-Abliterated-BF16

## Resumen

Muse Glimmer 30B Abliterated es una versión modificada del modelo multimodal de visión y lenguaje Muse Glimmer 30B, desarrollada por el usuario mlasli. El modelo original, publicado como `meta-models/Muse-Glimmer-30B`, incorpora mecanismos de rechazo interno que le impiden responder a ciertos tipos de instrucciones. Esta variante aplica una técnica post-entrenamiento denominada *abliteration*, que identifica y suprime la dirección de rechazo en el espacio de representaciones internas, permitiendo que el modelo responda a una gama más amplia de prompts sin las salvaguardas de seguridad presentes en el checkpoint original.

La relevancia de este modelo radica en su utilidad para investigación sobre alineación, seguridad y comportamiento de modelos de lenguaje, así como para aplicaciones donde se requiere una menor restricción en las respuestas. Arquitectónicamente, se basa en un decoder transformer de 52 capas con 6.656 dimensiones ocultas, atención por grupos (GQA) con 32 cabezas de consulta y 2 de clave/valor, y un patrón alternante de atención con ventana deslizante y atención completa en proporción 4:1. El modelo cuenta con aproximadamente 29.776 millones de parámetros y está disponible en formato BF16.

La modificación se realizó mediante un dataset contrastivo de 256 pares de instrucciones dañinas y 256 inofensivas, recolectando los estados ocultos en la capa 33 (65% de profundidad) y calculando la dirección de rechazo con una separación de 86,34. Los pesos de las proyecciones de salida y de la MLP se ajustaron con un factor de ablación α=0,15, un valor conservador que busca preservar las capacidades generales del modelo. Los resultados preliminares muestran que el modelo abliterado cumple con 2 de 3 prompts de prueba que el original rechazaba, aunque persiste el rechazo en un caso relacionado con fabricación de armas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (decoder transformer con GQA y atención sliding window + full) |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (formato original del repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B es un transformer decoder multimodal que procesa tanto texto como imágenes, utilizando la arquitectura `MuseGlimmerForConditionalGeneration`. Cuenta con 52 capas de decoder, 6.656 dimensiones ocultas, 32 cabezas de atención para consultas y 2 para clave/valor (GQA), activación SiLU y normalización CenteredRMSNorm. El patrón de atención alterna entre ventana deslizante y atención completa en una proporción 4:1, lo que permite manejar secuencias largas con eficiencia computacional.

El proceso de abliteration se realizó sobre el checkpoint original en BF16. Se construyó un dataset contrastivo con 256 pares de instrucciones dañinas (hacking, malware, síntesis de sustancias controladas) y 256 inofensivas (conocimiento general, escritura creativa, codificación). Se recolectaron los estados ocultos en la capa 33 de 52 durante forward passes sobre los 512 prompts, y se calculó la dirección de rechazo como la diferencia normalizada entre las medias de los estados ocultos de prompts dañinos e inofensivos. La separación resultante fue de 86,34, indicando una dirección bien definida.

La modificación de pesos se aplicó a las proyecciones de salida (`o_proj`) y a las proyecciones de la MLP (`down_proj`) en todas las capas, sustrayendo una proyección de la dirección de rechazo con un factor α=0,15. Este valor conservador busca equilibrar la reducción de rechazos con la preservación de capacidades generales de razonamiento y coherencia. No se dispone de información sobre el entrenamiento original del modelo base, como el número de tokens o la composición del dataset de preentrenamiento.

## Capacidades

- Generación de texto y comprensión de imágenes: al ser un modelo multimodal, puede procesar entradas que combinan imagen y texto, generando descripciones, respuestas a preguntas visuales y contenido basado en imágenes.
- Seguimiento de instrucciones conversacionales: está diseñado para diálogos multi-turno, manteniendo coherencia contextual en interacciones prolongadas.
- Respuesta a prompts que el modelo original rechazaría: gracias a la abliteration, responde a una gama más amplia de instrucciones, incluyendo algunas relacionadas con hacking o malware, aunque no todas.
- Razonamiento general: mantiene capacidades de razonamiento lógico y factual, aunque no se han publicado benchmarks que cuantifiquen su rendimiento en tareas estándar.
- Capacidades multilingües: no se ha especificado qué idiomas soporta; la información disponible no incluye este dato.
- Sin soporte declarado para tool calling o agentes: no hay evidencia en la documentación de funciones de llamada a herramientas o razonamiento multi-paso específico.

## Casos de uso

- Investigación académica sobre alineación y seguridad de IA: el modelo permite estudiar el comportamiento de sistemas sin mecanismos de rechazo, comparando respuestas con el original para entender cómo se codifica la negativa en el espacio de representaciones.
- Análisis de imágenes en entornos de moderación de contenido: puede describir o clasificar imágenes sin las restricciones del modelo base, útil para evaluar políticas de moderación o entrenar clasificadores alternativos.
- Generación de contenido creativo sin filtros: escritores y artistas pueden utilizarlo para explorar temas sensibles o controvertidos en ficción, donde el modelo original rechazaría la petición.
- Asistencia en tareas de programación con prompts complejos: al no rechazar instrucciones de codificación, puede generar código para scripts o herramientas que otros modelos se negarían a producir, útil en entornos de desarrollo controlados.
- Evaluación de robustez de sistemas de seguridad: los investigadores pueden probar la eficacia de técnicas de abliteration y comparar la persistencia de rechazos en diferentes dominios.
- Desarrollo de chatbots para nichos específicos sin censura: en aplicaciones donde se requiere un asistente que no imponga juicios morales, como en terapia de exposición o simulaciones de rol, este modelo ofrece una alternativa menos restrictiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una evaluación cualitativa sobre 3 prompts de prueba, donde el modelo abliterado cumplió con 2 de ellos (guía de hacking y código de ransomware) y rechazó el de fabricación de armas. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 requiere aproximadamente 60 GB de VRAM (29,78 mil millones de parámetros × 2 bytes). Con cuantización de 8 bits se reduciría a unos 30 GB, y con 4 bits a unos 15 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para BF16 completo se necesitan GPUs como A100 80GB, H100 80GB o similares con al menos 80 GB de memoria. Para cuantizaciones de 4 u 8 bits, una RTX 4090 (24 GB) podría ser suficiente si se aplica cuantización externa.
- Compatibilidad con GPU de consumo: no es viable en BF16 sin cuantización; con cuantización de 4 bits podría ejecutarse en GPUs de 24 GB como la RTX 3090 o RTX 4090.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay confirmación oficial de compatibilidad con estos frameworks, pero la arquitectura estándar de decoder lo hace plausible.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 30B en BF16 en una A100 suele generar entre 10 y 20 tokens por segundo, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo comparte características con otros LLMs de ~30B parámetros como Llama 3 30B o Mistral Large, pero no hay datos de rendimiento ni de arquitectura que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- La abliteration no elimina todos los rechazos: en la evaluación del autor, el prompt relacionado con fabricación de armas seguía siendo rechazado, lo que sugiere que algunas vías de rechazo están profundamente entrelazadas con el conocimiento factual y son difíciles de eliminar sin degradar otras capacidades.
- Posible degradación de capacidades generales: el factor α=0,15 es conservador, pero la modificación de pesos puede afectar sutilmente al razonamiento, la coherencia o la factualidad, aunque no se han cuantificado estos efectos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados. No se ha evaluado su tasa de alucinación.
- Sesgos no evaluados: no hay información sobre sesgos de género, raza o cultura; el modelo podría heredar sesgos del entrenamiento original, que no se documenta.
- Uso responsable: al ser una versión sin salvaguardas, el modelo puede generar contenido dañino o ilegal si se le solicita. El usuario es responsable de cumplir con las leyes y normas éticas aplicables.
- Limitaciones de contexto e idioma: no se especifica la longitud máxima de contexto ni los idiomas soportados, lo que dificulta su uso en aplicaciones multilingües o con documentos largos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no exime de responsabilidad legal por el contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-BF16
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
