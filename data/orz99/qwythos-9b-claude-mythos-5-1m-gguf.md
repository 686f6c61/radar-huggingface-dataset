# orz99/Qwythos-9B-Claude-Mythos-5-1M-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-GGUF es la versión cuantizada en formato GGUF del modelo empero-ai/Qwythos-9B-Claude-Mythos-5-1M, desarrollado por Empero AI. Se trata de un modelo de razonamiento de 8.953.803.264 parámetros (aproximadamente 9B) construido sobre la base de Qwen3.5-9B mediante un post-entrenamiento de parámetros completos sobre más de 500 millones de tokens de trazas de tipo Claude Mythos / Claude Fable con cadena de pensamiento generadas internamente por la herramienta `rethink` de Empero.

El modelo está orientado a tareas de razonamiento, código, función calling nativo, contexto largo (hasta 1.048.576 tokens mediante rope-scaling YaRN activado por defecto) y entrada multimodal de imagen, ya que hereda la torre de visión de Qwen3.5-9B (congelada durante el SFT). La versión GGUF facilita su despliegue en llama.cpp, Ollama, LM Studio, jan y KoboldCpp, con cuantizaciones desde Q4_K_M hasta BF16 y variantes con cabeza MTP para decodificación especulativa.

Su relevancia actual radica en que ofrece un modelo de razonamiento de ~9B con contexto de 1M tokens, capacidades multimodales y function calling, todo bajo licencia Apache 2.0 y ejecutable en hardware de consumo con la cuantización Q4_K_M (5,24 GiB). Es una opción interesante para desarrolladores que necesitan razonamiento avanzado y contexto muy largo sin depender de infraestructura de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B), con torre de visión CLIP-style y cabeza MTP opcional |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) mediante YaRN rope-scaling activado por defecto |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (con y sin MTP) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B, sobre la que Empero AI aplicó un post-entrenamiento de parámetros completos (full-parameter) utilizando más de 500 millones de tokens de trazas de alta calidad de tipo Claude Mythos / Claude Fable, con cadenas de pensamiento generadas internamente mediante su herramienta `rethink`. La torre de visión se hereda de Qwen3.5-9B y permaneció congelada durante el SFT (el entrenamiento fue solo de texto), por lo que el comportamiento visual es idéntico al del modelo base multimodal.

Entre las innovaciones técnicas destacables figuran el soporte nativo de function calling según la especificación de Qwen3.5, la ventana de contexto de 1M tokens mediante YaRN rope-scaling habilitado por defecto, y la inclusión opcional de la cabeza MTP (Multi-Token Prediction) compatible con Qwen3.5 para decodificación especulativa en llama.cpp (`--spec-type draft-mtp`). No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (chain-of-thought).
- Razonamiento matemático (mejoras reportadas en gsm8k-strict y gsm8k-flex frente al base).
- Generación y comprensión de código.
- Function calling / tool calling nativo según la especificación de Qwen3.5.
- Capacidades agénticas y razonamiento multi-paso.
- Entrada multimodal de imagen: descripción detallada, OCR (impreso y manuscrito), lectura de gráficos y tablas, comprensión de UI y documentos, razonamiento espacial básico.
- Contexto largo de hasta 1M tokens.
- Modo "uncensored" según los tags del repositorio.
- Capacidades orientadas a ciberseguridad y biomedicina (según tags).
- Decodificación especulativa mediante cabeza MTP opcional.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Razonamiento matemático y resolución de problemas: el modelo muestra mejoras de +30 puntos en gsm8k-strict y +19 en gsm8k-flex frente al base Qwen3.5-9B, lo que lo hace adecuado para tutoría automática, verificación de cálculos y generación de explicaciones paso a paso.
- Análisis de documentos largos: con 1M tokens de contexto puede procesar libros completos, expedientes o bases de código extensas en una sola pasada, útil para resumen, extracción de entidades y preguntas sobre documentos.
- Agentes autónomos con tool calling: el soporte nativo de function calling y razonamiento multi-paso permite integrarlo en pipelines agénticos que consultan APIs, bases de datos o servicios externos.
- Asistencia en ciberseguridad: los tags indican orientación a este dominio; puede emplearse para análisis de vulnerabilidades, explicación de conceptos de seguridad y revisión de configuraciones (con las cautelas propias de un modelo "uncensored").
- Procesamiento de imágenes y OCR: gracias a la torre de visión heredada, puede digitalizar documentos escaneados, extraer texto de manuscritos, interpretar gráficos y tablas, o describir capturas de interfaz.
- Soporte biomédico y educativo: los tags de biomedicina sugieren uso en explicación de conceptos, resumen de literatura técnica y asistencia en investigación (siempre con supervisión experta).
- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M (5,24 GiB) permite ejecutarlo en GPUs de consumo para prototipado, desarrollo offline y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card reporta mejoras relativas frente al modelo base Qwen3.5-9B bajo evaluación equiparada:

| Benchmark | Mejora frente a Qwen3.5-9B |
|---|---|
| MMLU | +34 puntos |
| gsm8k-strict | +30 puntos |
| gsm8k-flex | +19 puntos |

No se han publicado en la información disponible los valores absolutos de estos benchmarks ni resultados de otros como HumanEval, MMLU-Pro o similares.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q4_K_M: 5,24 GiB (5,63 GB).
  - Q5_K_M: 6,02 GiB (6,47 GB).
  - Q6_K: 6,85 GiB (7,36 GB).
  - Q8_0: 8,87 GiB (9,53 GB).
  - BF16: 16,69 GiB (17,92 GB).
  - Variantes MTP: ligeramente superiores (Q4_K_M MTP: 5,48 GiB; BF16 MTP: 17,14 GiB).
  - Proyector de visión `mmproj-*.gguf`: 0,86 GiB (0,92 GB) adicional.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, Q4_K_M cabe en GPUs de consumo con 8 GB o más de VRAM, y BF16 requiere GPUs de 24 GB o superiores (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 en GPUs de 8-12 GB; BF16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), Ollama, LM Studio, jan, KoboldCpp; API compatible con OpenAI para visión.
- Latencia y throughput: no disponibles en la información proporcionada; el uso de MTP draft speculation puede mejorar el throughput en builds recientes de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M (este) | ~9B | 1M | Apache 2.0 | GGUF | Razonamiento, visión, function calling, MTP |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | no disponible | Base del modelo; sin post-entrenamiento de razonamiento |
| Otras alternativas de ~9B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría más allá del modelo base Qwen3.5-9B.

## Limitaciones y advertencias

- Idiomas: la model card solo declara soporte de inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Visión congelada: la torre de visión no fue reentrenada, por lo que sus capacidades visuales son las del Qwen3.5-9B base, sin mejoras específicas.
- Modelo "uncensored": la ausencia de filtros puede generar contenido sensible; requiere moderación adicional en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta, especialmente en dominios especializados (biomedicina, ciberseguridad).
- Contexto de 1M: aunque soportado, el rendimiento efectivo en ventanas extremas puede degradarse; no se han publicado evaluaciones específicas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero deben revisarse las obligaciones de atribución y las posibles restricciones heredadas del modelo base.
- Sin datos de benchmarks absolutos ni de latencia/throughput publicados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificados.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/orz99/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Organización Empero: https://empero.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
