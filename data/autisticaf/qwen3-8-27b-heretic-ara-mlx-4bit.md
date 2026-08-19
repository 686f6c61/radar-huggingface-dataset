# AutisticAF/Qwen3.8-27B-heretic-ara-mlx-4Bit

## Resumen

Este modelo es una conversión a formato MLX con cuantización de 4 bits del modelo Qwen3.8-27B-heretic-ara, publicada por el usuario AutisticAF. El modelo base, desarrollado por trohrbaugh, es una versión "abliterated" (sin censura) del Qwen3.8-27B de Alibaba, que emplea la técnica Heretic para eliminar la alineación de seguridad mediante ablación direccional. La conversión a MLX permite ejecutar el modelo en dispositivos Apple Silicon a través de la librería mlx-lm, manteniendo la licencia Apache-2.0. Es relevante para desarrolladores que necesitan un modelo de gran tamaño sin restricciones de contenido, orientado a tareas de agente y generación de código, con la ventaja de poder desplegarlo localmente en hardware de Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base), 4.204.731.904 en safetensors cuantizado |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit MLX (formato propio de mlx-lm) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros con capacidades multimodales (procesa texto e imágenes). La versión heretic-ara aplica la técnica de ablación direccional (abliteration) implementada en la herramienta Heretic, que elimina los mecanismos de rechazo de contenido no deseado sin necesidad de post-entrenamiento adicional. El sufijo "ara" indica el uso de Arbitrary-Rank Ablation, una variante que permite ajustar el rango de la ablación. La conversión a MLX 4-bit se realizó con mlx-lm versión 0.31.2, sin modificar los pesos del modelo original, solo su representación numérica para optimizar la inferencia en hardware Apple.

## Capacidades

- Generación de texto y razonamiento complejo, heredado de Qwen3.8-27B.
- Generación de código y soporte para tareas de programación, optimizado para agentes de codificación autónomos (según la descripción del modelo en Ollama).
- Procesamiento de imágenes y texto (pipeline image-text-to-text), aunque no se especifican detalles de las capacidades visuales.
- Sin censura ni filtros de seguridad, gracias al proceso de abliteration.
- Soporte para conversaciones multi-turno y uso como modelo de chat.
- Compatible con la librería mlx-lm para inferencia local en Apple Silicon.

## Casos de uso

- Agentes de codificación autónomos: el modelo está optimizado para herramientas como Claude Code, OpenCode, Aider o Hermes, permitiendo generar y modificar código en repositorios de forma autónoma.
- Asistente de programación en entornos de desarrollo: puede integrarse en IDEs o pipelines de CI/CD para revisión de código, generación de tests o autocompletado avanzado.
- Chatbots sin restricciones de contenido: útil para investigación en IA generativa donde se requiere explorar temas sensibles sin filtros de seguridad.
- Análisis de documentos largos: gracias a su arquitectura de 27B, puede procesar y resumir textos extensos, aunque la longitud de contexto no está especificada.
- Generación de contenido creativo: redacción de artículos, guiones o narrativa sin limitaciones temáticas impuestas por alineación.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: al ser un modelo MLX 4-bit, se puede desplegar localmente en Mac con M-series para pruebas y desarrollo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 15.2 GB, lo que sugiere un uso de VRAM aproximado de 8-10 GB en cuantización 4-bit (dependiendo de la implementación de MLX).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de memoria unificada para una ejecución fluida.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; requiere el ecosistema MLX.
- Opciones de despliegue: mlx-lm (Python), integración con Hugging Face Transformers mediante el adaptador de MLX.
- Latencia y throughput: no disponibles, pero se espera un rendimiento adecuado para inferencia local en Mac de gama alta.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutisticAF/Qwen3.8-27B-heretic-ara-mlx-4Bit | MLX | 4-bit | 27B | Apache-2.0 | Hugging Face |
| McG-221/Qwen3.8-27B-heretic-ara-mlx-8Bit | MLX | 8-bit | 27B | Apache-2.0 | Hugging Face |
| jacokon/qwen3.8-27b-heretic-ara | GGUF | Q4_K_M | 27B | Apache-2.0 | Ollama |
| drmcbride/Qwen3.8-27B-heretic-ara-Q8_0-GGUF | GGUF | Q8_0 | 27B | Apache-2.0 | Hugging Face |

La diferencia principal radica en el formato y la cuantización: MLX está optimizado para Apple Silicon, mientras que GGUF es más versátil para CPU/GPU convencionales. La versión 4-bit de MLX ofrece menor uso de memoria que la 8-bit, a costa de una posible pérdida de precisión.

## Limitaciones y advertencias

- Al ser un modelo abliterated, carece de alineación de seguridad, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede producir información falsa o inventada, especialmente en dominios especializados.
- La longitud de contexto no está documentada, lo que limita la planificación de tareas que requieran ventanas largas.
- Los idiomas soportados no se especifican; aunque Qwen3.8-27B es multilingüe, la versión heretic podría tener variaciones.
- La cuantización 4-bit puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en BF16.
- No se garantiza compatibilidad con todas las herramientas de inferencia; solo se ha probado con mlx-lm.
- El uso comercial está permitido por la licencia Apache-2.0, pero el contenido generado sin censura puede plantear riesgos legales o éticos.

## Enlaces

- [Hugging Face - AutisticAF/Qwen3.8-27B-heretic-ara-mlx-4Bit](https://huggingface.co/AutisticAF/Qwen3.8-27B-heretic-ara-mlx-4Bit)
- [Modelo base - trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)
- [Heretic - herramienta de ablación](https://github.com/p-e-w/heretic)
- [Ollama - jacokon/qwen3.8-27b-heretic-ara](https://ollama.com/jacokon/qwen3.8-27b-heretic-ara)
- [FriendliAI - Qwen3.8-27B-heretic-ara](https://friendli.ai/models/fermicalva/Qwen3.8-27B-heretic-ara)
