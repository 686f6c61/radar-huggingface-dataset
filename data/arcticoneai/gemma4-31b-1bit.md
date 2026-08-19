# arcticoneai/gemma4-31B-1bit

## Resumen

El modelo `arcticoneai/gemma4-31B-1bit` es una cuantización experimental de 1 bit del modelo `google/gemma-4-31B-it`, desarrollada por el usuario `arcticoneai` como prueba de concepto. El objetivo es reducir drásticamente el tamaño del modelo para ejecutarlo en dispositivos con recursos muy limitados, como teléfonos móviles. Según la model card, el modelo se empaqueta en un archivo GGUF de aproximadamente 3,5 GB y se ha verificado su estructura en un Pixel 4 XL con 6 GB de RAM mediante Termux y una versión parcheada de `llama.cpp`.

Sin embargo, el propio autor advierte que la calidad de generación de texto está significativamente degradada debido a la acumulación de errores entre capas, y que la inferencia completa no es estable en Android o iPhone. Se trata de un trabajo de investigación experimental, no de un modelo listo para producción. El repositorio contiene 3.768.506.786 parámetros según los safetensors (el modelo base tiene 31B), y el tamaño total del repositorio es de 7,5 GB. La licencia declarada es MIT, aunque el modelo base puede tener una licencia diferente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 4 31B IT) |
| Parametros totales | 3.768.506.786 (según safetensors; el modelo base tiene 31B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 256K, pero no se ha verificado en esta cuantización) |
| Tipos de cuantizacion | 1 bit (experimental, con escalares de grupo y enmascaramiento adaptativo) |
| Idiomas soportados | no disponible |
| Licencia | MIT (repositorio); el modelo base puede tener otra licencia |
| Formato de pesos | GGUF (~3,5 GB) y safetensors (7,5 GB en el repo) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer denso multimodal (image-text-to-text) de 31B parámetros, con atención multi-cabeza y normalización RMSNorm. La cuantización a 1 bit se realiza mediante un método experimental denominado "Adaptive Mask V2", descrito en la model card para otro modelo (DeepSeek-V4 Pro), pero aplicado también a Gemma. El método no utiliza SVD ni codebooks, sino que normaliza los pesos, divide la matriz en bloques, selecciona los bloques de mayor energía mediante un ratio de cobertura adaptativo por tipo de capa, y refina escalares de grupo en múltiples pasadas (8-15) para reconstruir los pesos con un bit efectivo por parámetro.

No se proporcionan detalles específicos del entrenamiento o del dataset utilizado para esta cuantización. El autor indica que la calidad de generación real es mucho menor que la calidad a nivel de pesos, lo que sugiere que el método no preserva la distribución de salida del modelo original.

## Capacidades

- Generación de texto: teóricamente posible, pero con calidad significativamente degradada según el autor.
- Procesamiento de imágenes: el modelo base es multimodal, pero no se ha verificado que esta cuantización conserve dicha capacidad.
- Razonamiento y código: no se ha evaluado; se espera un rendimiento muy pobre debido a la acumulación de errores.
- Tool calling / function calling: no disponible.
- Soporte para agentes: no disponible.
- Multilingüismo: no disponible.
- Modo thinking / visión / audio: no disponible.

En resumen, las capacidades prácticas son muy limitadas y no se recomienda su uso para ninguna tarea real.

## Casos de uso

Dado el carácter experimental y la mala calidad de generación, los casos de uso son principalmente de investigación y educativos:

- Investigación en cuantización extrema: estudiar cómo afecta la cuantización de 1 bit a la distribución de pesos y a la calidad de generación, comparando con cuantizaciones estándar (4 bits, 8 bits).
- Pruebas de viabilidad en hardware de bajos recursos: evaluar si es posible cargar un modelo de 31B en dispositivos con 6 GB de RAM, aunque la inferencia no sea estable.
- Desarrollo de kernels personalizados: el autor busca colaboración para implementar kernels de 1 bit optimizados; este modelo sirve como banco de pruebas.
- Análisis de errores por capa: el autor menciona un análisis R² por capa, que puede utilizarse para identificar qué capas son más sensibles a la cuantización.
- Demostración de técnicas de compresión extrema: mostrar que es posible reducir un modelo de 31B a ~3,5 GB, aunque con pérdida severa de calidad.
- Educación en métodos de cuantización: como ejemplo de un enfoque no convencional (enmascaramiento adaptativo + escalares de grupo) frente a métodos clásicos (RTN, GPTQ, AWQ).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona un análisis R² por capa, pero no proporciona métricas estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan los resultados con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa ~3,5 GB, por lo que cabría en GPUs con al menos 4 GB de VRAM, pero la inferencia no es estable ni fiable.
- GPU recomendadas: no se han probado en GPU; la verificación se realizó en un Pixel 4 XL (6 GB RAM) con Termux y `llama.cpp` parcheado.
- Compatibilidad con GPU de consumo: teóricamente sí (por ejemplo, RTX 3060 con 12 GB), pero no hay garantías de funcionamiento correcto.
- Opciones de despliegue: `llama.cpp` parcheado (según el repositorio GitHub), aunque no se recomienda para uso real. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones del mismo modelo base. Como referencia cualitativa:

| Modelo | Parámetros | Cuantización | Tamaño aprox. | Calidad de generación |
|---|---|---|---|---|
| google/gemma-4-31B-it (original) | 31B | FP16/BF16 | ~62 GB | Alta (modelo base) |
| Cuantización GGUF Q4_K_M estándar | 31B | 4 bits | ~18 GB | Buena, degradación mínima |
| arcticoneai/gemma4-31B-1bit | 31B (reportado 3.7B en safetensors) | 1 bit experimental | ~3,5 GB | Muy degradada, no usable |

La comparativa con otras cuantizaciones de 1 bit (como BitNet o ternarios) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calidad de generación significativamente degradada: el autor confirma que la generación de texto real es mucho peor que la calidad a nivel de pesos, debido a la acumulación de errores entre capas.
- Inferencia inestable en dispositivos móviles: la ejecución completa en Android/iPhone no es estable, a pesar de que la estructura se verificó en un Pixel 4 XL.
- No apto para producción: es un proof-of-concept, no un modelo listo para uso comercial o en aplicaciones reales.
- Licencia del modelo base: aunque el repositorio tiene licencia MIT, el modelo base `google/gemma-4-31B-it` puede tener términos de uso diferentes (Gemma 4 se distribuye bajo Apache 2.0 según fuentes externas, pero no se confirma en la model card).
- Falta de documentación sobre el proceso de cuantización específico para Gemma: la model card detalla el método para DeepSeek-V4 Pro, pero no hay una descripción clara de cómo se aplicó a Gemma.
- Riesgo de alucinaciones y errores graves: debido a la degradación, el modelo puede producir texto incoherente o incorrecto.
- Sin soporte para tareas multimodales verificadas: aunque el pipeline es image-text-to-text, no se ha demostrado que la cuantización conserve la capacidad de procesamiento de imágenes.

## Enlaces

- HuggingFace: https://huggingface.co/arcticoneai/gemma4-31B-1bit
- Repositorio GitHub (setup y parches): https://github.com/elliotlib/quant-1bit
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
