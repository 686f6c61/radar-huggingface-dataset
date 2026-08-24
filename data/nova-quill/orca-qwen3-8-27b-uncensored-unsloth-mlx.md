# nova-quill/Orca-Qwen3.8-27B-Uncensored-unsloth-mlx

## Resumen

Orca-Qwen3.8-27B-Uncensored-unsloth-mlx es una cuantización en formato MLX del modelo abliterado de Qwen3.8-27B, desarrollada por el usuario nova-quill (Evan Marlowe). El modelo base, Qwen/Qwen3.8-27B, es un modelo denso de 27 mil millones de parámetros con arquitectura híbrida de atención (atención lineal Gated DeltaNet combinada con atención completa), pensado para tareas de agente y razonamiento, e incluye capacidades de visión, tool calling y un head de predicción multi-token (MTP). Esta versión ha sido sometida a un proceso de abliteración (eliminación de la negativa a responder) y posteriormente cuantizada en MLX para ejecución eficiente en Apple Silicon, utilizando la matriz de importancia (imatrix) de Unsloth.

El modelo está disponible en varias precisiones (2, 4, 6 y 8 bits) en formato MLX, además de versiones en GGUF y safetensors. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual reside en que ofrece una alternativa abierta y sin censura para entornos de red-teaming, investigación de seguridad y aplicaciones que requieren respuestas sin filtros, manteniendo las capacidades de razonamiento y visión del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal Gated DeltaNet + atención completa) con visión y MTP head |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | MLX 2, 4, 6 y 8 bits (afine, grupo de tamaño 64); también GGUF (disponible en el repo) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), MLX (cuantizado), GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformador denso de 27 mil millones de parámetros que combina una capa de atención lineal (Gated DeltaNet) con capas de atención completa, lo que reduce el coste computacional para secuencias largas. Incluye un head de predicción multi-token (MTP) que acelera la decodificación y un codificador de visión para procesar imágenes. La versión abliterada elimina los patrones de rechazo (refusal) a nivel de tensor, manteniendo intactos la torre de visión y el head MTP, según la descripción del autor. El proceso de abliteración se realizó con una pérdida de capacidad mínima (0% de sobre-rechazo en XSTest y 0-6% de rechazo en el conjunto A/B, según la página de Ollama). No se han proporcionado detalles sobre el dataset de entrenamiento ni el procedimiento exacto de abliteración más allá de lo mencionado.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imágenes).
- Control de pensamiento (thinking mode) activable o desactivable.
- Tool calling / function calling para integración con herramientas externas.
- Razonamiento multi-step para tareas de agente.
- Predicción multi-token (MTP) para decodificación más rápida.
- Soporte de contexto largo (hasta 262K tokens).
- Multilingüismo en inglés y chino.
- Modelo "uncensored" (sin rechazo) adecuado para red-teaming y pruebas de seguridad.

## Casos de uso

- **Red-teaming y pruebas de seguridad**: el modelo puede utilizarse para generar respuestas sin filtros y evaluar sistemas de moderación o detectar vulnerabilidades en modelos de IA, gracias a su baja tasa de rechazo.
- **Asistente de código con razonamiento**: con tool calling y soporte de agentes, puede integrarse en entornos de desarrollo para generar, revisar y ejecutar código de forma autónoma, aprovechando su contexto largo para proyectos grandes.
- **Análisis de imágenes en producción**: al ser un modelo de visión-lenguaje, puede procesar capturas de pantalla, diagramas o fotografías y extraer información técnica, útil para automatizar QA visual.
- **Chat conversacional sin censura**: para aplicaciones donde se requiera respuestas abiertas sobre temas sensibles, como investigación social o educación, sin las restricciones habituales de los modelos comerciales.
- **Agente autónomo con herramientas**: su capacidad de tool calling y razonamiento multi-step permite construir agentes que ejecutan tareas complejas (búsqueda web, API, etc.) con un contexto amplio de interacción.
- **Investigación en alineación y seguridad**: sirve como caso de estudio para comparar el comportamiento de modelos abliterados frente a sus versiones originales en métricas de utilidad y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card menciona métricas de rechazo: 0% de sobre-rechazo en XSTest y 0-6% de rechazo en el conjunto A/B, pero no hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks de rendimiento general. La descripción afirma "sin pérdida medible de capacidad", pero no se proporcionan cifras concretas.

## Requisitos de hardware

- Modelo cuantizado en MLX para Apple Silicon (macOS con chip M1/M2/M3/M4). No está pensado para GPUs NVIDIA.
- Tamaño del repositorio: 40.7 GB (incluye todas las cuantizaciones).
- VRAM estimada por cuantización (en memoria unificada de Apple Silicon):
  - 2 bits: ~7 GB
  - 4 bits: ~14 GB
  - 6 bits: ~21 GB
  - 8 bits: ~27 GB
  - BF16 (original): ~54 GB
- Se recomienda un Mac con al menos 16 GB de RAM unificada para la versión de 4 bits, y 32 GB o más para 6/8 bits.
- Opciones de despliegue: MLX (para Apple Silicon), GGUF con llama.cpp/Ollama, o safetensors con vLLM o TGI en GPUs NVIDIA (pero la cuantización MLX no es aplicable a NVIDIA).
- No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Modelo original con rechazo activo |
| Orca-Qwen3.8-27B-Uncensored (este) | 27B | 262K | Apache 2.0 | MLX, GGUF, safetensors | Abliterado, sin rechazo |
| Qwen3.8-27B-Instruct (si existe) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Variante con instrucciones (no confirmado) |

No se encontraron otros modelos abliterados de Qwen3.8-27B en la búsqueda, aunque hay otras versiones de nova-quill como Huihui-Qwen3.8-27B-abliterated-unsloth-mlx, que podrían ser similares. La comparación se limita a la versión base y la variante abliterada.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser "uncensored", puede generar respuestas ofensivas, ilegales o perjudiciales. No debe desplegarse en producción sin sistemas de moderación robustos.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero el modelo puede alucinar hechos o inventar información, especialmente en contextos largos.
- **Idiomas limitados**: solo inglés y chino; el rendimiento en otros idiomas no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero la naturaleza del modelo (sin filtros) puede implicar responsabilidades legales según el uso.
- **Formato MLX**: la cuantización MLX es exclusiva para Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin conversión.
- **Riesgo de sobreconfianza**: al eliminar el rechazo, el modelo puede dar respuestas en áreas donde debería abstenerse (p.ej., consejos médicos o legales).
- **Falta de benchmarks**: no hay datos públicos de rendimiento en tareas estándar, lo que dificulta evaluar su calidad real.

## Enlaces

- HuggingFace: https://huggingface.co/nova-quill/Orca-Qwen3.8-27B-Uncensored-unsloth-mlx
- GitHub (cuantización MLX de referencia): https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Ollama (versión original abliterada): https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Unsloth (página del modelo base): https://unsloth.ai/models/qwen3.8-27b
