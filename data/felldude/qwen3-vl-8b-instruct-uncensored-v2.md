# Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2

## Resumen

Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2 es un ajuste fino completo (full finetune) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por el usuario Felldude y publicado en HuggingFace bajo licencia Apache 2.0. El modelo está orientado principalmente a la generación de descripciones de imágenes y vídeos, con un énfasis especial en contenido NSFW (no apto para menores), aunque el prompt por defecto también admite descripciones genéricas. La versión 2 de este ajuste está altamente adaptada a contenido explícito, y el autor advierte que, al haberse entrenado únicamente con imágenes, puede generar descripciones de vídeo tratándolas como si fueran imágenes estáticas.

El modelo mantiene la arquitectura original de Qwen3-VL de 8.767 millones de parámetros (8,7B), con el encoder de visión congelado durante el entrenamiento. Requiere al menos 24 GB de VRAM para inferencia, lo que lo sitúa fuera del alcance de GPUs de consumo convencionales (como RTX 3060 o 4060) y lo orienta a tarjetas profesionales o de gama alta con 24 GB o más. Su relevancia actual radica en ser una opción open source para tareas de captioning multimodal sin restricciones de contenido, aunque con las advertencias éticas y técnicas que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3-VL, encoder de visión congelado |
| Parametros totales | 8.767.123.696 (8,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada (el modelo base Qwen3-VL soporta contexto extendido, pero no se indica el valor en este ajuste) |
| Tipos de cuantizacion | No se publican archivos cuantizados (solo safetensors en BF16) |
| Idiomas soportados | Inglés (en), español (es), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL-8B-Instruct, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje de 8,7B parámetros. El ajuste realizado por Felldude es un full finetune sobre el modelo base, manteniendo el encoder de visión congelado (no se actualizaron sus pesos) y entrenando únicamente las capas del modelo de lenguaje. El entrenamiento se realizó con Adam8bit debido al tamaño del modelo, usando precisión BF16/TF32 para el resto de operaciones. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica que el entrenamiento se centró exclusivamente en imágenes, lo que explica la limitación observada en la generación de descripciones de vídeo.

## Capacidades

- Generación de descripciones detalladas de imágenes, incluyendo elementos como iluminación, ángulo de cámara, marcas de agua, artefactos JPEG, composición, profundidad de campo y orientación.
- Soporte para contenido NSFW explícito, con un prompt optimizado que evita eufemismos y utiliza lenguaje vulgar y directo.
- Capacidad de describir vídeos, aunque con la limitación de que al entrenarse solo con imágenes puede tratar los vídeos como imágenes estáticas.
- Mantiene las capacidades del modelo base Qwen3-VL en cuanto a comprensión visual y razonamiento, aunque el ajuste puede haber alterado el comportamiento en tareas no relacionadas con la descripción de imágenes.
- Multilingüe en inglés, español y japonés, aunque el prompt recomendado está en inglés.

## Casos de uso

- Generación de captions para bancos de imágenes o datasets de entrenamiento de modelos texto-a-imagen: el modelo produce descripciones detalladas y estructuradas que pueden servir como etiquetas de alta calidad para entrenar otros modelos generativos.
- Moderación de contenido en plataformas que manejan material explícito: permite clasificar imágenes como SFW, sugerente o NSFW, y generar descripciones automáticas para sistemas de revisión.
- Archivado y catalogación de colecciones de imágenes o vídeos: su capacidad de describir elementos concretos (colores, texturas, relaciones espaciales) facilita la indexación automática de grandes volúmenes de contenido visual.
- Asistencia a creadores de contenido para adultos: el modelo puede generar descripciones alternativas o metadatos para publicaciones, ahorrando tiempo en la redacción manual.
- Investigación en seguridad de modelos de IA: al ser un modelo "uncensored", permite estudiar los límites de la alineación y los riesgos de los ajustes sin restricciones, aunque su uso debe ser ético y controlado.
- Generación de subtítulos descriptivos para vídeos en entornos donde no se requiere precisión temporal (por ejemplo, resúmenes estáticos de escenas), siempre asumiendo la limitación de que el modelo no distingue bien entre imagen y vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación comparativa con el modelo base ni con otras alternativas. Se recomienda realizar pruebas propias si se considera su uso en tareas específicas.

## Requisitos de hardware

- VRAM mínima: 24 GB según el autor, para inferencia en BF16 (los pesos ocupan aproximadamente 17,5 GB, más overhead de activaciones y caché).
- GPUs compatibles: tarjetas con 24 GB o más, como NVIDIA RTX 4090, RTX 6000 Ada, A100, H100, o GPUs profesionales equivalentes. No es viable en GPUs de consumo de 8-12 GB sin cuantización, y no se proporcionan versiones cuantizadas.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con frameworks como Transformers + Accelerate, vLLM, TGI o llama.cpp (si se convierte a GGUF, aunque no se incluye en el repo). No hay integración directa con Ollama documentada.
- Latencia y throughput: no se especifican. Dependerá del hardware y del framework de inferencia utilizado. Para un modelo de 8,7B en BF16, se puede estimar una latencia de entre 20 y 50 tokens por segundo en una A100, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8,7B | No especificado | Apache 2.0 | Multimodal general, alineado y seguro |
| Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2 | 8,7B | No especificado | Apache 2.0 | Multimodal, sin restricciones de contenido, orientado a NSFW |
| LLaVA-NeXT-8B (ejemplo comparable) | 8B | 32K (típico) | Apache 2.0 | Multimodal general, sin ajuste NSFW |

La comparativa se limita a características generales porque no hay datos de rendimiento publicados para el modelo de Felldude. La principal diferencia con el modelo base es la eliminación de las restricciones de contenido y el enfoque en descripciones detalladas y explícitas. Frente a alternativas como LLaVA-NeXT, este ajuste ofrece un comportamiento especializado en captioning explícito, pero puede perder capacidades generales de razonamiento visual.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con imágenes, por lo que puede generar descripciones de vídeo incorrectas (tratándolos como imágenes estáticas). No es adecuado para tareas de comprensión temporal de vídeo.
- Genera contenido explícito y vulgar sin filtros. Su uso en entornos de producción debe considerar políticas de moderación y cumplimiento legal, especialmente en países con regulaciones sobre contenido para adultos.
- No se han publicado evaluaciones de sesgos ni de robustez. Al ser un ajuste no alineado, puede reflejar sesgos del dataset de entrenamiento no documentado.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas específicas sobre material explícito.
- El requisito de 24 GB de VRAM limita su despliegue en infraestructuras modestas y no se ofrecen versiones cuantizadas para reducir este requisito.
- No se dispone de información sobre el contexto máximo soportado ni sobre el rendimiento en tareas fuera del captioning de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2
- Repositorio oficial de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
- Repositorio oficial de Qwen3 (serie de modelos base): https://github.com/QwenLM/Qwen3
