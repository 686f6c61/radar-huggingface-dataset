# arammoostafaye/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "decensored" o abliterated del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. Lo publica el usuario arammoostafaye en Hugging Face y su objetivo es eliminar los comportamientos de rechazo del modelo base mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada con la herramienta Heretic v2.0.0.dev0.

El modelo conserva la base de 9.409.813.744 parámetros (aproximadamente 9,4B) en formato safetensors, con licencia Apache 2.0 y soporte declarado para inglés, chino, coreano, japonés, español y ruso. Su entrenamiento original se centró en matemáticas y STEM, con unas 250.000 muestras de destilación, y el autor reporta que la intervención de abliteration reduce los rechazos de 100/100 a 3/100 en su conjunto de evaluación, con una divergencia KL de 0,0422 respecto al modelo base.

Es relevante ahora porque combina dos tendencias recientes: la destilación de modelos grandes de razonamiento a tamaños desplegables en hardware de consumo, y la modificación post-entrenamiento para eliminar restricciones de contenido. El resultado es un modelo de 9B orientado a matemáticas, STEM y razonamiento estructurado, con soporte de tool calling y capacidades multimodales heredadas de la arquitectura Qwen3.5 (etiqueta image-text-to-text), pero sin las salvaguardas habituales del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con soporte multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (existe version GGUF de terceros, mradermacher); NVFP4 evaluado en vLLM; MTP-Q8_0 evaluado en llama.cpp |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB); GGUF disponible via mradermacher |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer denso de aproximadamente 9,4B parámetros. El entrenamiento original consistió en una destilación de DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. El autor indica que se emplearon etapas de SFT y RL (con la etiqueta gspo, una variante de optimización de política), y que el modelo muestra transferencia cruzada: pequeñas mejoras en programación y uso de herramientas pese a no recibir datos SFT específicos de código. También se menciona la evaluación de rutas de despliegue con vLLM NVFP4 y llama.cpp MTP-Q8_0, lo que sugiere soporte para decodificación multi-token (MTP) y cuantización de precisión reducida.

La modificación "heretic" aplica Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con parámetros concretos: preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta intervención elimina direcciones de activación asociadas a rechazos sin reentrenar los pesos, buscando preservar el comportamiento útil mientras se suprime el sesgo de negativa. El autor reporta una divergencia KL de 0,0422 frente al modelo original, lo que indica una desviación moderada de la distribución de salida.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas, heredado de la destilación de DeepSeek-V4-Pro.
- Razonamiento matemático y STEM: el foco principal del entrenamiento, con ~250.000 muestras específicas.
- Generación y comprensión de código, con mejoras reportadas por transferencia cruzada aunque sin SFT específico de programación.
- Tool calling y function calling: etiquetado explícitamente en el modelo y en el modelo base.
- Capacidades multimodales image-text-to-text (según la etiqueta del pipeline y la arquitectura Qwen3.5).
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) y formato conversacional.
- Comportamiento "uncensored": reducción drástica de rechazos (3/100 frente a 100/100 del original en la evaluación del autor).

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente para descomponer y resolver ejercicios de matemáticas, física o química paso a paso, lo que lo hace adecuado para asistentes educativos o generación de soluciones razonadas en entornos de investigación.
- Generación de código en pipelines de CI/CD: gracias al soporte de tool calling y function calling, puede integrarse en flujos automatizados para generar parches, escribir tests o invocar herramientas externas en tareas de ingeniería.
- Agentes multi-paso: su capacidad de razonamiento estructurado y tool use permite construir agentes que planifican, invocan APIs y verifican resultados en tareas de automatización.
- Análisis de documentos técnicos con imágenes: la capacidad image-text-to-text permite extraer y razonar sobre figuras, tablas o diagramas en informes científicos y manuales.
- Asistencia en investigación STEM: para explorar hipótesis, redactar borradores de demostraciones o resumir literatura técnica multilingüe (en, zh, ko, ja, es, ru).
- Generación de contenido sin restricciones temáticas: en entornos controlados de investigación sobre alineación, red teaming o evaluación de sesgos, donde se necesita un modelo que no rechace peticiones para estudiar comportamientos.
- Atención al cliente técnica multilingüe: con contexto conversacional y soporte de varios idiomas, puede gestionar consultas técnicas multi-turno, aunque la longitud de contexto no está confirmada.

## Benchmarks y rendimiento

El autor publica una comparación limitada centrada en el efecto de la abliteration, no en benchmarks estándar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de KV cache; se recomienda 24 GB o más.
- Cuantización Q8_0 (GGUF): alrededor de 10 GB, desplegable en GPUs de 12-16 GB.
- Cuantización Q4_K_M (GGUF): alrededor de 5,5-6 GB, viable en GPUs de consumo de 8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o Q8; RTX 3090/4080 (16-24 GB) para cuantizaciones intermedias; RTX 4060 Ti 16 GB o inferiores para Q4.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: transformers, vLLM (evaluado con NVFP4), llama.cpp (evaluado con MTP-Q8_0), text-generation-inference (etiqueta del modelo), Ollama a través de GGUF de terceros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,4B | No disponible | Apache 2.0 | Versión abliterated, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | ~9,4B | No disponible | Apache 2.0 | Modelo original, 100/100 rechazos, KL 0 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | No disponible | Versión 4B del mismo proceso heretic |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | ~9,4B | No disponible | Apache 2.0 (heredada) | Cuantizaciones GGUF del mismo modelo |

No se dispone de datos de rendimiento comparativo en benchmarks estándar para establecer diferencias de calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo explícitamente "uncensored": elimina salvaguardas de contenido, lo que lo hace inadecuado para aplicaciones de producción orientadas al público sin moderación adicional.
- Riesgo elevado de generar contenido dañino, sesgado o inapropiado; la abliteration puede degradar la coherencia en dominios sensibles.
- La divergencia KL de 0,0422 indica que la distribución de salida se ha desplazado respecto al original; puede haber pérdida de calidad en tareas no evaluadas.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en razonamiento matemático complejo fuera de la distribución de entrenamiento.
- Longitud de contexto no confirmada; no asumir ventanas largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del uso recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.
- El repositorio es de 19,3 GB y fue creado el 2026-11-08; la madurez y el soporte a largo plazo no están garantizados.
- La model card incluye secciones truncadas ("Collaboration & Tr"), lo que sugiere documentación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arammoostafaye/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Réplica/espejo: https://huggingface.co/botp/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic (herramienta de abliteration): https://heretic-project.org
