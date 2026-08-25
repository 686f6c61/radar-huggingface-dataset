# cashmere-cat/Qwen3.5-9B-Kazakh-oQ4

## Resumen

Qwen3.5-9B-Kazakh-oQ4 es una cuantización en 4-bit del modelo Qwen3.5-9B-Kazakh, desarrollada por el usuario cashmere-cat. El modelo original, creado por la organización issai, es una adaptación al kazajo del Qwen3.5-9B-Base de Alibaba, obtenido mediante pre-entrenamiento continuo sobre texto kazajo con una extensión de vocabulario de más de 16.000 tokens. Esta versión cuantizada, generada con la librería oMLX y el formato MLX safetensors, reduce el tamaño del modelo a unos 6,1 GB, lo que permite su ejecución en hardware de consumo con Apple Silicon.

La relevancia de este modelo radica en que cubre un idioma de bajos recursos como el kazajo, manteniendo las capacidades generales del Qwen3.5-9B original: razonamiento, generación de código, soporte de herramientas y comprensión multimodal. Al estar cuantizado en 4-bit, facilita su despliegue en entornos con memoria limitada, aunque su licencia y datos de entrenamiento específicos no están documentados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (transformer denso con atención lineal y MLP) del modelo Qwen3.5-9B |
| Parametros totales | 9B (modelo original); el archivo cuantizado reporta 1.897.852.144 (inconsistente, probablemente error del repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo, según documentación de Qwen3.5) |
| Tipos de cuantizacion | 4-bit, group size 64, mixed-precision (oQ) |
| Idiomas soportados | Kazajo (adaptado específicamente) + 201 idiomas del modelo base (según documentación de Qwen3.5) |
| Licencia | no disponible (no especificada en la model card) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención tradicionales con mecanismos de atención lineal, lo que mejora la eficiencia en contextos largos (hasta 262K tokens). Además, es un modelo multimodal que procesa texto e imágenes de forma conjunta. Para la adaptación al kazajo, issai realizó un pre-entrenamiento continuo del Qwen3.5-9B-Base sobre corpus kazajos, extendiendo el vocabulario con más de 16.000 tokens específicos del idioma. No se aplicó ningún post-entrenamiento adicional (SFT, RLHF o RLVR), por lo que el modelo conserva las capacidades originales del base pero con mejor dominio del kazajo.

La cuantización se realizó con oQ (oMLX v0.6.3rc2), una técnica de cuantización de precisión mixta que asigna diferentes bits a distintas partes del modelo para minimizar la pérdida de rendimiento. El formato resultante es MLX safetensors, optimizado para ejecución en Apple Silicon mediante la librería MLX.

## Capacidades

- Generación de texto y razonamiento multilingüe, con especialización en kazajo (escritura, gramática y vocabulario).
- Razonamiento lógico y matemático heredado de Qwen3.5-9B.
- Generación de código y soporte de tool calling (llamada a funciones).
- Capacidad de procesamiento de imágenes (modelo nativo visión-lenguaje).
- Soporte de agentes y razonamiento multi-paso.
- Soporte de 201 idiomas, con mejora significativa en kazajo.

## Casos de uso

- **Traducción y localización kazajo-español**: el modelo puede traducir textos entre kazajo y otros idiomas, aprovechando su vocabulario extendido y su contexto largo para mantener coherencia en documentos extensos.
- **Atención al cliente en kazajo**: integrado en chatbots con tool calling, puede gestionar conversaciones multi-turno en kazajo, consultar bases de datos y escalar a agentes humanos cuando sea necesario.
- **Generación de contenido localizado**: para crear artículos, publicaciones en redes sociales o documentación técnica en kazajo, con estilo y terminología adaptada.
- **Análisis de sentimiento en kazajo**: el modelo puede clasificar opiniones y reseñas en kazajo, útil para empresas que operan en Kazajistán o con comunidades kazajas.
- **Asistente de código para desarrolladores kazajos**: con tool calling, puede integrarse en IDEs o pipelines CI/CD para generar código, explicar errores o autocompletar funciones, manteniendo comentarios en kazajo.
- **Búsqueda semántica en documentos kazajos**: gracias a su contexto de 262K tokens, puede indexar y responder preguntas sobre colecciones largas de documentos legales o académicos en kazajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización ni para el modelo base Qwen3.5-9B-Kazakh en la información disponible. Los datos de rendimiento del Qwen3.5-9B original no han sido facilitados, por lo que no se puede presentar una tabla comparativa fiable.

## Requisitos de hardware

- **VRAM estimada**: el repositorio pesa 6,1 GB en formato MLX, por lo que la inferencia requiere aproximadamente 6-8 GB de memoria unificada en Apple Silicon.
- **GPU recomendadas**: diseñado para Apple Silicon (M1/M2/M3/M4) con la librería MLX. No es compatible con CUDA directamente.
- **Hardware de consumo**: cabe en Macs con 8 GB o más de RAM unificada, aunque se recomienda 16 GB para contextos largos.
- **Opciones de despliegue**: MLX (Apple), conversión a GGUF para llama.cpp/Ollama (no incluido en el repo), o uso en plataformas de inferencia que soporten MLX.
- **Latencia y throughput**: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-Kazakh-oQ4 (este) | 9B (base) | 262K | kazajo + 121 | no disponible | MLX |
| Qwen3.5-9B-Kazakh (issai) | 9B | 262K | kazajo + 121 | no disponible | safetensors |
| Qwen3.5-4B-Kazakh (issai) | 4B | 262K | kazajo + 121 | no disponible | safetensors |
| Qwen3.5-35B-A3B-Kazakh (issai) | 35B (MoE) | 262K | kazajo + 121 | no disponible | safetensors |

La principal diferencia es el formato cuantizado y la optimización para MLX, que reduce el tamaño de 18 GB (modelo original en bf16) a 6,1 GB, a costa de una ligera pérdida de calidad en la precisión de los pesos.

## Limitaciones y advertencias

- **Sesgos lingüísticos**: el modelo fue pre-entrenado principalmente en kazajo, por lo que puede presentar sesgos culturales o de registro de la lengua.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos de baja frecuencia de datos.
- **Licencia no clara**: la licencia no está especificada en la repo de Hugging Face, lo que impide garantizar su uso comercial sin autorización explícita.
- **Soporte de visión limitado**: aunque el modelo original es multimodal, la cuantización 4-bit puede degradar la calidad en tareas de visión.
- **Formato propietario**: el formato MLX es específico de Apple, no compatible con ecosistemas CUDA (PyTorch, vLLM, TGI) sin conversión previa a GGUF o safetensors estándar.
- **Sin post-entrenamiento**: el modelo no ha pasado por SFT ni RLHF, por lo que su alineación con instrucciones es limitada y puede requerir ajuste fino para tareas específicas.

## Enlaces

- [Repositorio HuggingFace de cashmere-cat/Qwen3.5-9B-Kazakh-oQ4](https://huggingface.co/cashmere-cat/Qwen3.5-9B-Kazakh-oQ4)
- [Colección Qwen3.5 Kazakh de issai](https://huggingface.co/collections/issai/qwen35-kazakh)
- [Documentación de oQ (oMLX)](https://github.com/jundot/omlx)
- [Blog de Qwen3.5: Towards Native Multimodal Agents](https://qwen.ai/blog?id=qwen3.5)
- [Página de modelo de Qwen3.5-9B en Microsoft Foundry](https://ai.azure.com/catalog/models/qwen-qwen3.5-9b)
- [Qwen3.5 9B en Together AI](https://www.together.ai/models/qwen3-5-9b)
