# EliYuan00/Reframe

## Resumen
Reframe es un modelo de visión y lenguaje (VLM) obtenido por ajuste fino del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario EliYuan00 y publicado en Hugging Face bajo licencia Apache 2.0. Está especializado en respuesta a preguntas visuales (visual question answering) y se distribuye en formato safetensors con 9.409.813.744 parámetros totales. El repositorio ocupa 18,8 GB y el modelo declara únicamente el idioma inglés.

El modelo se presenta como un fine-tune sobre una arquitectura Qwen3.5, aunque la model card pública es mínima: solo incluye metadatos YAML (licencia, dataset, idioma, métrica y modelo base) sin texto descriptivo, detalles de entrenamiento ni resultados de evaluación. El dataset asociado es EliYuan00/Reframe-100K, presumiblemente un conjunto de 100.000 ejemplos para tareas de VQA, aunque su composición no está documentada en la información disponible.

Su relevancia es limitada por el momento: cuenta con 0 descargas y 0 likes, y no se han publicado benchmarks ni documentación técnica. Resulta útil como referencia de un fine-tune comunitario sobre Qwen3.5-9B para VQA en inglés, pero no hay evidencia pública de su calidad frente al modelo base ni frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tune del base Qwen/Qwen3.5-9B, por lo que hereda la arquitectura del transformer de Qwen3.5 en su variante de 9B parámetros, presumiblemente con un codificador visual acoplado para tareas de VQA (la pipeline declarada es visual-question-answering). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o supervisión con preferencias.

El único dato concreto sobre el entrenamiento es la referencia al dataset EliYuan00/Reframe-100K, que por su nombre sugiere 100.000 muestras, pero no se especifica su contenido, procedencia ni proceso de curación. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades
- Respuesta a preguntas visuales (VQA): el modelo está etiquetado con la pipeline visual-question-answering, por lo que se espera que procese imágenes y responda preguntas sobre ellas.
- Generación de texto en inglés: hereda las capacidades lingüísticas del base Qwen3.5-9B, aunque el fine-tune declara únicamente inglés.
- Comprensión de imágenes: al ser un fine-tune de un VLM, se asume capacidad de describir y razonar sobre contenido visual, si bien no hay documentación que lo confirme.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso
- Asistencia en accesibilidad: describir imágenes a usuarios con discapacidad visual, aprovechando la pipeline de VQA para generar respuestas en inglés sobre el contenido visual.
- Moderación de contenido visual: clasificar y responder preguntas sobre imágenes subidas por usuarios en plataformas, usando el modelo como filtro de primera línea.
- Extracción de información de documentos escaneados: responder preguntas sobre facturas, formularios o capturas, siempre que el contexto visual sea claro y en inglés.
- Soporte en comercio electrónico: generar respuestas automáticas a preguntas de clientes sobre productos a partir de fotografías (por ejemplo, "¿de qué color es esta camiseta?").
- Análisis de imágenes médicas o técnicas de baja criticidad: como apoyo en la descripción preliminar de imágenes, con revisión humana obligatoria dada la ausencia de benchmarks.
- Investigación académica en VQA: servir como punto de partida o baseline para experimentos de fine-tuning sobre Qwen3.5-9B, dado su carácter abierto y licencia Apache 2.0.
- Prototipado rápido de asistentes visuales: integrar el modelo en demos o pruebas de concepto en inglés donde la latencia y la precisión no sean críticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 9,4B parámetros en safetensors (16 bits), se requieren aproximadamente 19 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits bajaría a unos 10 GB y en 4 bits a unos 6 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para inferencia en 16 bits; GPUs con 12-16 GB podrían funcionar solo con cuantización no oficial.
- ¿Cabe en consumer GPU? Sí, en RTX 4090 (24 GB) en 16 bits; en RTX 3090 (24 GB) también; en GPUs de 12 GB requeriría cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repo); Transformers con safetensors es la vía directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EliYuan00/Reframe | 9,4B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune VQA sobre Qwen3.5-9B, sin benchmarks |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Apache 2.0 (según base) | Hugging Face | Modelo base del que deriva Reframe |
| Alternativas VQA de 7-9B (p. ej. LLaVA, Qwen2-VL-7B) | ~7-9B | variable | variable | Hugging Face | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia pública de que el fine-tune mejore al modelo base en VQA.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni proceso de evaluación.
- Idioma limitado al inglés: no se declara soporte para castellano ni otros idiomas.
- Riesgo de alucinación: inherente a los VLM, agravado por la falta de evaluación publicada.
- Sesgos: desconocidos, al no documentarse la composición del dataset Reframe-100K.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio.
- Sin cuantizaciones oficiales: el despliegue eficiente requiere generarlas por cuenta propia.
- Popularidad nula (0 descargas, 0 likes): sin comunidad que reporte problemas o mejoras.
- Advertencia de producción: no se recomienda su uso en entornos críticos sin una evaluación previa exhaustiva.

## Enlaces
- Hugging Face: https://huggingface.co/EliYuan00/Reframe
- Dataset asociado: https://huggingface.co/datasets/EliYuan00/Reframe-100K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Reframe AI (sitio no relacionado con el modelo, solo coincidencia de nombre): https://www.getreframe.ai/
- GitHub Reframe (proyecto no relacionado, solo coincidencia de nombre): https://github.com/ilya-makarov-dev/Reframe
