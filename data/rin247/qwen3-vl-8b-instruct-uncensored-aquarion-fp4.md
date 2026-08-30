# Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-FP4` es una cuantización FP4 (weight-only) del modelo multimodal `Qwen3-VL-8B-Instruct` de Alibaba Qwen, a la que se ha aplicado una técnica de "abliteración" (eliminación de la dirección de rechazo mediante proyección ortogonal) antes de la cuantización. El resultado es un modelo de visión-lenguaje que conserva las capacidades de comprensión de imagen, vídeo y texto del modelo base, pero sin los mecanismos de rechazo de contenido, y con un tamaño de pesos reducido a aproximadamente 4,4 mil millones de parámetros efectivos en formato safetensors.

El autor, Rin247, lo publica como parte de un "forge" llamado *Genesis of Aquarion*, con el objetivo de ofrecer versiones cuantizadas y sin censura de modelos populares. La relevancia actual radica en que permite ejecutar un modelo multimodal de 8B en hardware con recursos limitados, gracias a la cuantización FP4 de 4 bits, manteniendo un equilibrio entre calidad y eficiencia. Sin embargo, al tratarse de una cuantización personalizada con RTN en CPU, requiere un proceso de dequantización manual antes de usarlo con motores de inferencia estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3-VL-8B-Instruct |
| Parametros totales | 4.386.158.832 (según safetensors; el modelo base Qwen3-VL-8B-Instruct tiene aproximadamente 8.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL soporta contexto extendido, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | FP4 (4 bits, weight-only) |
| Idiomas soportados | no disponible (el modelo base Qwen3-VL-Instruct es multilingüe, pero no se lista el conjunto completo) |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantización FP4 weight-only (escalas y formas almacenadas como buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada y modificada de `Qwen3-VL-8B-Instruct`, un modelo de lenguaje multimodal de la serie Qwen3-VL de Alibaba. La arquitectura base combina un codificador de visión con un transformer de lenguaje, soportando entrada de imágenes, vídeo y texto, así como razonamiento multimodal y capacidades de agente. El modelo original fue entrenado con supervisión instructiva y técnicas de alineación propias de la serie Qwen3.

Sobre esta base, el autor aplicó primero una técnica de "abliteración" mediante proyección ortogonal de la dirección de rechazo (refusal direction), eliminando los comportamientos de negativa ante solicitudes consideradas no permitidas. Posteriormente, cuantizó los pesos a FP4 usando cuantización RTN (round-to-nearest) en CPU, almacenando las escalas y formas de los tensores junto a los pesos en archivos safetensors. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteración más allá de la descripción de la model card.

## Capacidades

- Comprensión y generación de texto en múltiples idiomas (heredado del modelo base Qwen3-VL-Instruct).
- Percepción visual avanzada: reconocimiento de objetos, escenas, OCR, diagramas y gráficos.
- Comprensión de vídeo y dinámicas espaciotemporales (según las capacidades declaradas de la serie Qwen3-VL).
- Razonamiento multimodal integrado: combina información de imagen y texto para responder preguntas complejas.
- Interacción con agentes y tool calling (capacidad del modelo base, no verificada en esta versión cuantizada).
- Soporte de contexto largo (el modelo base lo soporta, aunque no se especifica el valor para esta cuantización).
- Sin mecanismos de rechazo de contenido debido al proceso de abliteración (capacidad "uncensored").

## Casos de uso

- Despliegue en entornos con recursos limitados: al tener solo 4,4B parámetros en FP4 y un tamaño de repo de 5,5 GB, puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM o incluso en CPU con suficiente RAM, permitiendo aplicaciones de visión-lenguaje en edge computing.
- Análisis de imágenes en aplicaciones móviles o embebidas: gracias a la cuantización FP4, el modelo puede procesar fotografías, documentos escaneados o capturas de pantalla en dispositivos sin GPU dedicada, realizando tareas de OCR, descripción o respuesta a preguntas visuales.
- Asistentes de atención al cliente con entrada visual: un chatbot que recibe capturas de pantalla o fotos de productos y responde sin filtros de contenido, útil en dominios especializados donde se requiere manejar temas sensibles sin restricciones.
- Generación de descripciones accesibles: automatizar la creación de textos alternativos para imágenes en plataformas web o redes sociales, aprovechando la capacidad multimodal y la ausencia de rechazo ante contenido diverso.
- Investigación en seguridad y alineación: al ser una versión abliterada, permite estudiar el comportamiento de los modelos sin mecanismos de rechazo, comparando respuestas con la versión original para analizar sesgos y riesgos.
- Prototipado rápido de agentes multimodales: para desarrolladores que necesitan una versión ligera y sin restricciones de un modelo de visión-lenguaje, integrable en pipelines de automatización con tool calling (si el motor de inferencia soporta la dequantización).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o evaluaciones de visión-lenguaje para esta cuantización específica. El rendimiento real dependerá del hardware de inferencia y del proceso de dequantización aplicado.

## Requisitos de hardware

- VRAM estimada: con 5,5 GB de pesos FP4, se estima que la inferencia cabe en GPUs con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). Sin embargo, no se ha verificado experimentalmente.
- GPU recomendadas: cualquier GPU con soporte de FP16/FP32 y suficiente VRAM; no se requiere hardware especializado. Para CPU, se necesitaría al menos 8-16 GB de RAM libre.
- Despliegue: al ser un formato de cuantización personalizado (FP4 weight-only con escalas separadas), no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un paso previo de dequantización. Se requiere un script personalizado que reconstruya los pesos a partir de los buffers `*.weight_scale` y `*.weight_shape`.
- Latencia y throughput: no disponibles. Dependerán del hardware y del método de dequantización; se espera una latencia mayor que con cuantizaciones estándar (GPTQ, AWQ) debido al paso adicional de reconstrucción.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-FP4 | ~4,4B (cuantizado) | FP4 weight-only | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8B | FP16/BF16 | contexto largo (valor exacto no confirmado) | Apache 2.0 (según repo oficial) | HuggingFace |
| huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated | ~8B | FP16/BF16 | no disponible | no disponible | HuggingFace / ModelScope |

La comparativa muestra que la versión de Rin247 reduce el tamaño de pesos a la mitad aproximadamente, pero introduce una licencia no especificada y un formato de cuantización no estándar. La versión de huihui-ai mantiene el tamaño completo del modelo base pero también sin licencia clara. El modelo original de Qwen es la opción más fiable en términos de licencia y compatibilidad, aunque sin la eliminación de rechazos.

## Limitaciones y advertencias

- La cuantización FP4 puede degradar la calidad de las respuestas en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo o generación de código.
- El proceso de abliteración elimina los mecanismos de rechazo, lo que puede producir contenido inapropiado, dañino o ilegal si se usa sin supervisión. No es recomendable para aplicaciones de producción orientadas al público general.
- La licencia no está especificada, lo que genera incertidumbre legal sobre el uso comercial, la redistribución y la atribución requerida.
- El formato de cuantización es propietario y requiere un proceso manual de dequantización; no es compatible con las herramientas de inferencia estándar sin desarrollo adicional.
- No se han publicado benchmarks ni evaluaciones de seguridad para esta versión, por lo que se desconoce su rendimiento real en tareas específicas.
- El número de parámetros reportado (4,4B) es inferior al del modelo base (8B), lo que sugiere que la cuantización FP4 reduce el tamaño de los tensores pero no el número de parámetros lógicos; esta discrepancia puede deberse a cómo se contabilizan los pesos cuantizados en safetensors.
- No se dispone de información sobre el dataset de entrenamiento, el proceso de alineación original ni los detalles del abliteration más allá de la descripción breve de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-FP4
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Repositorio GitHub de Qwen3 (serie general): https://github.com/QwenLM/Qwen3
- Versión abliterated de huihui-ai (referencia): https://www.modelscope.cn/models/fireicewolf/Huihui-Qwen3-VL-8B-Instruct-abliterated
