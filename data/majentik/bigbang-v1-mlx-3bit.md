# majentik/BigBang-v1-MLX-3bit

## Resumen

BigBang-v1-MLX-3bit es una cuantización en 3 bits (affine, group size 32) del modelo BigBang-v1, desarrollada por majentik para ejecutarse en Apple Silicon mediante la librería mlx-lm. El modelo original, creado por endless-frontier, es un modelo agéntico multimodal de 35 mil millones de parámetros con arquitectura MoE (3 mil millones activos), basado en Qwen3.6-35B-A3B, diseñado para tareas de búsqueda de largo horizonte, ingeniería de software, investigación científica y razonamiento agéntico. Esta variante cuantizada reduce el tamaño del text tower a 3 bits mientras mantiene la torre de visión y el proyector en BF16, lo que permite ejecutar el modelo en hardware Apple con requisitos de memoria más bajos. Su relevancia radica en democratizar el acceso a un modelo de gran tamaño en entornos de consumo, aunque con posibles pérdidas de precisión por la cuantización agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.6-35B-A3B) con torre de vision |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit affine, group size 32 (text tower); vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base BigBang-v1 es un transformer MoE con 35B parámetros totales y 3B activos por token, basado en la arquitectura Qwen3.6-35B-A3B. Incorpora un codificador de visión y un proyector para entrada de imágenes, lo que lo convierte en un modelo multimodal (image-text-to-text). El entrenamiento del modelo original se centró en capacidades agénticas: búsqueda de información en múltiples pasos, generación de código, razonamiento científico y soporte a investigación. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO. La variante MLX-3bit se obtuvo mediante `mlx_lm.convert` (mlx-lm 0.31.3), aplicando cuantización affine de 3 bits con group size 32 únicamente a la torre de texto, mientras que la torre de visión y el proyector se conservan en BF16. Esta estrategia busca minimizar la degradación en tareas multimodales.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado a tareas agénticas de larga duración.
- Soporte de tool calling y function calling, según las capacidades del modelo base.
- Capacidades multimodales: entrada de imágenes y texto, salida de texto (la torre de visión se mantiene en BF16).
- Razonamiento para búsqueda de información, codificación, investigación científica y soporte a investigación en IA.
- Ejecución en Apple Silicon mediante mlx-lm, con integración en entornos Python.

## Casos de uso

- Asistente de codificación en un Mac: el modelo puede generar, revisar y depurar código en múltiples lenguajes, aprovechando su capacidad de razonamiento y tool calling para interactuar con repositorios o APIs.
- Agente de búsqueda de información: dado un objetivo complejo, el modelo puede planificar y ejecutar búsquedas web o en bases de datos, resumiendo resultados y tomando decisiones intermedias.
- Investigación científica asistida: análisis de artículos, extracción de conclusiones y generación de hipótesis a partir de documentos e imágenes (gráficas, diagramas).
- Automatización de tareas de oficina: procesamiento de documentos con imágenes, generación de informes y resúmenes ejecutivos.
- Prototipado de agentes conversacionales: desarrollo de chatbots con memoria de contexto largo y capacidad de usar herramientas externas.
- Educación y tutoría: explicación de conceptos técnicos con apoyo visual, resolución de problemas paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base BigBang-v1 no presenta métricas oficiales en las fuentes consultadas, y la cuantización 3-bit no incluye evaluaciones comparativas. Se recomienda consultar el repositorio del modelo original para futuras actualizaciones.

## Requisitos de hardware

- Requiere Apple Silicon (M1, M2, M3, M4 o superiores) con memoria unificada.
- El tamaño del repositorio es de 18.3 GB, lo que sugiere que el modelo cargado en memoria ocupará un espacio similar (aunque la cuantización 3-bit reduce el peso del text tower, la torre de visión en BF16 añade carga).
- Se recomienda al menos 24 GB de RAM unificada para una ejecución fluida, aunque podría funcionar con 16 GB con limitaciones de contexto o velocidad.
- Despliegue mediante `mlx-lm` (pip install mlx-lm) y uso con `mlx_lm.generate`.
- No es compatible con GPUs NVIDIA o AMD; está restringido a ecosistema Apple.
- La latencia y el throughput dependen del chip concreto; no se proporcionan datos específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BigBang-v1 (base) | 35B totales, 3B activos | no disponible | Apache-2.0 | safetensors (BF16) | Modelo original sin cuantizar, requiere ~71.5 GB VRAM según LLM Explorer |
| BigBang-v1-MLX-3bit | 35B totales, 3B activos | no disponible | Apache-2.0 | safetensors (MLX) | Cuantización 3-bit para Apple Silicon, 18.3 GB repo |
| BigBang-v1-MLX-4bit | 35B totales, 3B activos | no disponible | Apache-2.0 | safetensors (MLX) | Cuantización 4-bit, mayor precisión que 3-bit, mayor tamaño |
| BigBang-v1-MLX-8bit | 35B totales, 3B activos | no disponible | Apache-2.0 | safetensors (MLX) | Cuantización 8-bit, casi sin pérdida, requiere más memoria |

No se dispone de comparativas con otros modelos MoE de tamaño similar (p. ej., Qwen3-30B-A3B, DeepSeek-V3) en cuanto a rendimiento, ya que no hay datos de benchmarks.

## Limitaciones y advertencias

- La cuantización 3-bit puede provocar una degradación notable en tareas de razonamiento complejo, matemáticas y generación de código de alta calidad, en comparación con el modelo original en BF16.
- El modelo está limitado a hardware Apple Silicon; no puede ejecutarse en GPUs convencionales sin conversión adicional.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de los componentes de Qwen3.6.
- El tamaño del repositorio (18.3 GB) puede superar la memoria de algunos Macs con 16 GB, lo que obligaría a reducir el contexto o usar técnicas de offloading.
- No hay garantías de rendimiento en producción; se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/BigBang-v1-MLX-3bit
- Modelo base: https://huggingface.co/endless-frontier/BigBang-v1
- README del modelo base en GitHub: https://github.com/endless-frontier/BigBang-v1/blob/main/README.md
- Otras cuantizaciones MLX: https://huggingface.co/models?other=base_model:quantized:endless-frontier/BigBang-v1
- Página en LLM Explorer: https://llm-explorer.com/model/endless-frontier%2FBigBang-v1,2Ijsdl8j15GjCEzFATqfSf
- Variante en Ollama (no oficial): https://ollama.com/smtek/BigBang-v1
