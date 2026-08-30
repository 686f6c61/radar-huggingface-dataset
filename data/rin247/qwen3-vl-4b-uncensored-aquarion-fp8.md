# Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP8

## Resumen

El modelo `Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP8` es una cuantización FP8 weight-only del modelo multimodal Qwen3-VL-4B, desarrollada por el usuario Rin247. Se trata de una versión "abliterated" (desensibilizada) del modelo original, en la que se ha eliminado la dirección de rechazo mediante proyección ortogonal antes de la cuantización, con el objetivo de reducir la censura en las respuestas. El resultado es un modelo de visión-lenguaje de 4.4 mil millones de parámetros, con pesos en formato FP8 que ocupan aproximadamente 4.8 GB, pensado para su ejecución en hardware de consumo.

La relevancia de este modelo radica en que combina dos tendencias actuales: la cuantización eficiente (FP8) para reducir requisitos de memoria y la "abliteración" como técnica para eliminar restricciones de contenido en modelos de IA. Al estar basado en Qwen3-VL, hereda las capacidades multimodales de la familia Qwen, incluyendo comprensión de imágenes y texto, aunque la información disponible no detalla las especificaciones completas del modelo base. Es una opción para desarrolladores que buscan un modelo multimodal ligero y sin filtros de contenido, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (modelo multimodal de lenguaje y vision, base no especificada en detalle) |
| Parametros totales | 4.437.815.808 (4,4 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 weight-only (RTN, escalas almacenadas junto a los pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma adicionales) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3-VL-4B. Se sabe que es un modelo multimodal de la familia Qwen, que combina un codificador de visión con un modelo de lenguaje, pero no se especifican detalles como el número de capas, la dimensión de los embeddings o el tipo de atención. El proceso de creación de este modelo derivado consiste en dos pasos: primero, se aplica una técnica de "abliteración" mediante proyección ortogonal de la dirección de rechazo (refusal direction) sobre el modelo base, lo que elimina o reduce la tendencia a rechazar ciertas solicitudes. Segundo, se cuantiza el resultado a FP8 weight-only utilizando PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas y formas de los tensores junto a los pesos en archivos safetensors. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens o si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Comprensión multimodal: al estar basado en Qwen3-VL, procesa imágenes y texto, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de texto: mantiene las capacidades de generación de lenguaje del modelo base, aunque la información no detalla si incluye soporte para tool calling o agentes.
- Contenido sin censura: la abliteración reduce la probabilidad de que el modelo rechace solicitudes, lo que permite generar contenido que el modelo original podría bloquear (con los riesgos asociados).
- Eficiencia de memoria: el formato FP8 weight-only reduce el uso de VRAM en comparación con el modelo en BF16 o FP16, facilitando su ejecución en GPUs de gama media.
- No se especifican capacidades adicionales como modo de pensamiento, soporte de audio o video en la información disponible.

## Casos de uso

- Generación de descripciones de imágenes sin restricciones: el modelo puede utilizarse para crear captions o descripciones detalladas de imágenes en contextos donde se requiere contenido explícito o no moderado, como en proyectos de investigación sobre generación de contenido artístico.
- Análisis de imágenes en entornos de desarrollo: al ser ligero (4,4 B en FP8), puede integrarse en pipelines de procesamiento de imágenes en local, por ejemplo para etiquetado automático de datasets sin depender de APIs externas.
- Prototipado de aplicaciones multimodales: desarrolladores que necesiten un modelo de visión-lenguaje con menos restricciones de contenido para pruebas rápidas pueden usar esta versión cuantizada, que cabe en GPUs con 6-8 GB de VRAM.
- Fine-tuning posterior: aunque no se documenta, los pesos FP8 pueden servir como punto de partida para ajuste fino con técnicas de cuantización consciente, si se dispone de las herramientas adecuadas.
- Evaluación de técnicas de abliteración: investigadores interesados en estudiar el impacto de la eliminación de la dirección de rechazo pueden comparar este modelo con la versión original de Qwen3-VL-4B.
- Despliegue en edge computing: el tamaño reducido (4,8 GB) permite ejecutar el modelo en dispositivos con recursos limitados, como ordenadores portátiles con GPU integrada o mini-PCs, para tareas de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo específico. El rendimiento dependerá del modelo base Qwen3-VL-4B, pero no se pueden aportar cifras concretas sin fuentes verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB, basado en el tamaño de los pesos FP8 (4,4 GB) más overhead de activaciones y buffers. Esta es una estimación, no un dato oficial.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070 o superiores. También podría ejecutarse en GPUs con 8 GB (RTX 3070, RTX 4070) con margen.
- Compatibilidad con consumer GPU: sí, siempre que se utilice un framework que soporte FP8 weight-only. No se especifican motores de inferencia concretos (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponible. Dependerá del hardware y del motor de inferencia utilizado.
- Nota: la model card indica que se requieren recetas personalizadas de dequantización (buffers `*.weight_scale` y `*.weight_shape`), por lo que el modelo no es directamente compatible con cargadores estándar sin adaptación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP8 | 4,4 B | no disponible | FP8 weight-only | no disponible | HuggingFace |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4,4 B | no disponible (segun documentacion oficial, contexto largo) | BF16/FP16 | Apache 2.0 (segun repositorio oficial) | HuggingFace |
| Huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated | 4,4 B | no disponible | BF16/FP8 (segun version) | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia es la abliteración y la cuantización, pero sin benchmarks no se puede evaluar el impacto en calidad.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una versión abliterated, el modelo puede generar contenido falso, ofensivo o peligroso con mayor facilidad, ya que se ha reducido su mecanismo de rechazo. Esto incrementa el riesgo de alucinaciones y de respuestas perjudiciales.
- Riesgo de uso indebido: la ausencia de censura puede facilitar la generación de contenido ilegal, difamatorio o dañino. El responsable del despliegue debe evaluar las implicaciones legales y éticas.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, por lo que no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el modelo puede usarse comercialmente o si tiene restricciones de redistribución. Se recomienda contactar al autor antes de cualquier uso en producción.
- Compatibilidad técnica: la cuantización FP8 weight-only con escalas separadas requiere herramientas específicas para dequantizar. No es un modelo plug-and-play con frameworks estándar sin modificaciones.
- Calidad de la cuantización: la cuantización RTN puede degradar ligeramente la precisión en comparación con el modelo original, especialmente en tareas de razonamiento complejo o generación de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-4B-Uncensored-Aquarion-FP8
- Repositorio oficial de Qwen3-VL (GitHub): https://github.com/QwenLM/Qwen3-VL
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Versión abliterated de Huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Referencia en Civitai (conversión para ComfyUI): https://civitai.red/models/2731465/qwen3-vl-4b-abliterated-comfyui-krea-2-text-encoder-bf16-fp8
