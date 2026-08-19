# batiai/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una versión cuantizada del modelo Qwen3.8-27B de Alibaba, publicada por BatiAI, una compañía especializada en IA on-device para el mercado coreano. El modelo base, lanzado en agosto de 2026, es un transformer denso de 27.000 millones de parámetros con capacidades multimodales (visión) y de razonamiento, que destaca por su ventana de contexto de aproximadamente 262.000 tokens y su licencia Apache 2.0, que permite uso comercial sin restricciones.

BatiAI ha convertido los pesos oficiales BF16 a formato GGUF mediante calibración imatrix sobre un corpus mixto de código, inglés, coreano y chino, ofreciendo seis niveles de cuantización que van desde 10 GB hasta 22,4 GB, además de un proyector de visión separado. La publicación incluye verificación explícita de generación en coreano, tool calling y código, algo poco habitual en repositorios de GGUF. El modelo es compatible con llama.cpp (arquitectura `qwen3_5`) y con Ollama, con etiquetas publicadas para su uso directo.

La relevancia de esta ficha radica en que combina un modelo de 27B con visión y razonamiento, ejecutable en hardware de consumo (Mac de 16 GB o GPUs con 12-16 GB de VRAM), con un énfasis particular en la calidad del coreano, un idioma que suele quedar desatendido en las cuantizaciones genéricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto), arquitectura `qwen3_5` en llama.cpp |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k) según fuentes web; 256K según Unsloth |
| Tipos de cuantizacion | Q2_K_S (10,0 GB), IQ3_XXS (11,0 GB), Q3_K_M (13,4 GB), IQ4_XS (15,2 GB), Q4_K_M (16,7 GB), Q6_K (22,4 GB), mmproj BF16 (0,93 GB) |
| Idiomas soportados | Inglés, coreano, chino (según la model card; el modelo base puede soportar más) |
| Licencia | Apache 2.0 (uso comercial, modificación y redistribución permitidos) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con una ventana de contexto de 262.144 tokens. Incluye un codificador de visión integrado (el proyector `mmproj` se publica por separado), lo que le permite procesar imágenes además de texto. Según las fuentes web, el modelo está optimizado para tareas de codificación agéntica, visión y chat, y soporta razonamiento de múltiples pasos. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO.

La cuantización realizada por BatiAI parte de los pesos oficiales BF16 de Qwen, nunca de una re-cuantización de otro GGUF. Se utilizó calibración imatrix sobre un corpus mixto de código, inglés, coreano y chino, y los archivos resultantes están firmados digitalmente por BatiAI (`general.author: BatiAI`). El proyector de visión se extrajo y publicó en formato BF16, permitiendo el uso de imágenes con cualquier cuantización del modelo.

## Capacidades

- Generación de texto y chat multi-turno en inglés, coreano y chino, con especial atención a la calidad del coreano (verificado por el autor).
- Razonamiento matemático básico: el autor verificó la operación `127+58` → `185` con temperatura 0.
- Tool calling / function calling: el modelo genera JSON estructurado para llamadas a herramientas, verificado con `{"tool":"get_weather","args":{"city":"부산"}}`.
- Generación de código: se verificó una implementación correcta de búsqueda binaria en Python.
- Visión multimodal: gracias al proyector `mmproj` incluido, el modelo puede procesar imágenes y responder preguntas sobre ellas.
- Capacidades de razonamiento y codificación agéntica, según las fuentes web.
- Soporte para decodificación con temperatura 0 y generación greedy (verificada por el autor).

## Casos de uso

- Asistente de atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con contexto largo (hasta 262k tokens), lo que permite mantener el historial completo de una sesión de soporte. Su tool calling nativo permite integrar sistemas de consulta de pedidos o incidencias.
- Generación de código en producción: con verificación de código correcto y soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentación o refactorizaciones. Su ventana de contexto amplia permite analizar repositorios completos.
- Análisis de documentos con imágenes: al combinar el proyector de visión con el contexto largo, puede procesar documentos escaneados, capturas de pantalla o diagramas y extraer información estructurada, útil en entornos empresariales coreanos.
- Asistente de programación en local para desarrolladores coreanos: ejecutable en un Mac de 16 GB con la cuantización Q3_K_M, permite mantener conversaciones de ayuda al código sin enviar datos a la nube, cumpliendo requisitos de privacidad.
- Chatbot multilingüe para mercados asiáticos: con soporte de inglés, coreano y chino, puede desplegarse como agente conversacional en plataformas de comercio electrónico que operan en estos idiomas, con respuestas consistentes gracias a la calibración imatrix.
- Herramienta de razonamiento y análisis para investigación: su contexto de 262k tokens permite alimentar el modelo con papers completos, informes o logs extensos y solicitar resúmenes, comparativas o detección de patrones, con capacidades de razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de BatiAI no incluye métricas estándar (MMLU, HumanEval, GSM8K), y las fuentes web mencionan "benchmarks publicados" del modelo base, pero no se proporcionan valores concretos. La verificación del autor se limita a pruebas funcionales de matemáticas, coreano, tool calling y código, sin comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (los tamaños de archivo son orientativos; la VRAM real depende del contexto y del offloading):
  - Q2_K_S (10,0 GB): cabe en GPUs con 12 GB de VRAM (RTX 3060, RTX 4070) o Mac con 16 GB de RAM unificada.
  - IQ3_XXS (11,0 GB): similar al anterior, recomendado para 16 GB de RAM unificada.
  - Q3_K_M (13,4 GB): recomendado para Mac de 16 GB o GPUs con 16 GB de VRAM (RTX 4080, RTX 4090).
  - IQ4_XS (15,2 GB): requiere 24 GB de RAM unificada o GPU con 16-24 GB de VRAM.
  - Q4_K_M (16,7 GB): recomendado para Mac de 24 GB o GPUs con 24 GB de VRAM (RTX 4090, A5000).
  - Q6_K (22,4 GB): requiere 32 GB de RAM unificada o GPU con 24 GB de VRAM para un offloading cómodo.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M, A100/H100 para Q6_K con contexto largo. En Mac, los modelos con 16 GB de RAM unificada pueden ejecutar Q3_K_M con contexto de 8k.
- Opciones de despliegue: llama.cpp (mainline, sin forks), Ollama (etiquetas `batiai/qwen3.8-27b:q2`, `:q3`, `:q4`), y mediante vLLM o SGLang para el modelo base sin cuantizar (según fuentes web).
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; en un Mac M1 Pro de 16 GB con Q3_K_M se puede esperar una generación de 10-20 tokens/s, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Sí | Apache 2.0 | BF16 | Modelo oficial de Qwen |
| batiai/Qwen3.8-27B-GGUF | 27B | 262k | Sí (mmproj) | Apache 2.0 | GGUF | Cuantizado con imatrix, verificado en coreano |
| unsloth/Qwen3.8-27B-GGUF | 27B | 256K | Sí | Apache 2.0 | GGUF | Cuantización de Unsloth, sin verificación lingüística publicada |
| batiai/Qwen3.6-27B-GGUF | 27B | no disponible | no disponible | Apache 2.0 | GGUF | Generación anterior de BatiAI |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con otros modelos de 27B (como Llama 3.1 27B o Mistral 27B). Las diferencias principales entre las cuantizaciones de BatiAI y Unsloth son la calibración imatrix sobre un corpus multilingüe (incluido coreano) y la publicación de etiquetas Ollama, así como la verificación explícita de generación en coreano y tool calling.

## Limitaciones y advertencias

- Sesgos lingüísticos: la verificación del autor se centra en coreano, inglés y chino; no hay garantías sobre la calidad en otros idiomas, aunque el modelo base puede soportar más.
- Riesgo de alucinación: como cualquier modelo de 27B, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Limitaciones de cuantización: las versiones Q2_K_S e IQ3_XXS pueden degradar notablemente la calidad de generación, especialmente en tareas de razonamiento o código, a pesar de la calibración imatrix. Se recomienda Q3_K_M como mínimo para uso general.
- Contexto máximo: aunque el modelo soporta 262k tokens, el uso de contextos muy largos con cuantizaciones pequeñas puede provocar pérdida de coherencia o repeticiones, como advierte el propio autor en su metodología de verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base pertenece a Alibaba Qwen; se debe mantener la atribución y redistribuir bajo los mismos términos.
- Dependencia de llama.cpp: la arquitectura `qwen3_5` requiere una versión reciente de llama.cpp; versiones antiguas pueden no ser compatibles.
- Proyector de visión separado: el uso de imágenes requiere descargar el archivo `mmproj-Qwen3.8-27B-BF16.gguf` adicional, y la calidad de la visión puede verse afectada por la cuantización del modelo principal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/batiai/Qwen3.8-27B-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Etiqueta Ollama: https://ollama.com/batiai/qwen3.8-27b
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Artículo de Yottalabs sobre especificaciones y hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Seguimiento de lanzamiento de Qwen3.8-27B: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Página de BatiAI: https://bati.ai
- BatiFlow (aplicación on-device): https://flow.bati.ai
