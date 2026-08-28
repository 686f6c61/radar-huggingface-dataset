# salohcin714/granite-4.2-3b-2bit-awq-mlx

## Resumen

Este repositorio contiene una conversión cuantizada del modelo IBM Granite 4.2 3B, adaptada al formato MLX para ejecución en hardware Apple Silicon. La cuantización aplicada es de 2 bits con calibración activada por activaciones (AWQ), con un tamaño de grupo de 64, lo que reduce drásticamente el peso del modelo a aproximadamente 1,3 GB. El resultado es un checkpoint ligero, pensado para inferencia local en Macs con memoria unificada limitada, a costa de una degradación significativa de la calidad generativa respecto al modelo original.

El modelo base, Granite 4.2 3B, es un transformer decoder-only denso desarrollado por IBM, post-entrenado sobre la familia Granite 4.1. Incorpora capacidades de razonamiento integrado y tool calling con esquema de funciones estilo OpenAI. Este repositorio no añade fine-tuning ni datos de entrenamiento adicionales; solo convierte los pesos al layout de safetensors de MLX y aplica la cuantización. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este artefacto radica en su capacidad para ejecutar un modelo de 3B con tool calling en dispositivos Apple con poca memoria, aunque el usuario debe ser consciente de que la cuantización a 2 bits es extremadamente agresiva y puede producir respuestas incoherentes o alucinaciones frecuentes. Está pensado para prototipado rápido o entornos donde el coste de memoria es crítico, no para producción exigente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 3B (modelo base); 391.457.280 en checkpoint cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 2-bit affine, grupo 64, calibracion AWQ |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer decoder-only con arquitectura densa, sin mezcla de expertos. Según la documentación de IBM, la familia Granite 4.2 se post-entrena sobre los modelos base Granite 4.1, que ya habían pasado por una fase de pre-entrenamiento extensiva. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

El repositorio cuantizado no introduce ninguna innovación arquitectónica. La conversión se realizó con mlx-lm 0.31.3, aplicando cuantización afín de 2 bits con tamaño de grupo 64 y calibración AWQ (activation-aware quantization). Se eliminaron los pesos redundantes de `lm_head.weight` cuando el modelo ata las embeddings de entrada y salida. No se realizó fine-tuning adicional ni se añadieron datos de entrenamiento.

## Capacidades

- Generación de texto conversacional y de completado en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Tool calling con razonamiento integrado: el modelo piensa qué herramienta llamar y por qué antes de realizar la llamada, siguiendo el esquema de definición de funciones de OpenAI.
- Modos de pensamiento flexibles: soporta chain-of-thought integrado y modos de razonamiento configurables (según la documentación del modelo base).
- Capacidades multilingües amplias, aunque la calidad puede variar según el idioma y la cuantización.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Prototipado rápido en Apple Silicon: desarrolladores pueden probar flujos de tool calling y generación de texto en un Mac con memoria limitada (8 GB o menos) sin necesidad de servicios en la nube.
- Asistentes conversacionales locales: integración en aplicaciones de escritorio o móviles que requieran procesamiento de lenguaje natural en el dispositivo, aprovechando el formato MLX y la compatibilidad con el chat template.
- Automatización de tareas con herramientas: el soporte de tool calling permite conectar el modelo a APIs o funciones locales para ejecutar acciones simples (consultas a bases de datos, envío de correos, etc.) en entornos de baja memoria.
- Educación y experimentación: sirve como ejemplo de cuantización extrema y sus efectos, útil para estudiantes o investigadores que estudian el impacto de la compresión de pesos.
- Despliegue en edge computing: dispositivos con recursos muy limitados (Raspberry Pi con Apple Silicon no aplica, pero sí Mac mini o MacBook antiguos) pueden ejecutar inferencia básica de texto.
- Evaluación de trade-offs de cuantización: comparar este modelo con versiones de 4 u 8 bits del mismo base para medir la degradación en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio cuantizado. La model card del autor indica explícitamente que los benchmarks publicados por IBM se refieren a los pesos originales, no a este artefacto cuantizado, y no deben interpretarse como afirmaciones sobre este repo. Por tanto, no se presentan cifras de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- Tamaño del checkpoint: 1,3 GB, lo que implica un uso de memoria en inferencia de aproximadamente 1,5-2 GB incluyendo overhead del runtime y caché KV.
- GPU recomendada: cualquier Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3 o superiores). Modelos con 16 GB ofrecen mayor margen para contexto largo.
- No requiere GPU dedicada; se ejecuta en la CPU/GPU unificada de Apple.
- Opciones de despliegue: mlx-lm (biblioteca oficial de MLX), compatible con el ecosistema de Apple. No es compatible con vLLM, llama.cpp u Ollama en su formato actual, ya que está en safetensors MLX.
- Latencia estimada: no disponible en la información proporcionada, pero en un M1 Pro se puede esperar una generación de 10-20 tokens por segundo con cuantización 2-bit, dependiendo del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| granite-4.2-3b (base) | 3B | No disponible | FP16/BF16 | Apache 2.0 | Safetensors |
| granite-4.2-3b-2bit-awq-mlx (este repo) | 3B (original) | No disponible | 2-bit AWQ | Apache 2.0 | MLX safetensors |
| Qwen2.5-3B-Instruct | 3B | 32K | FP16 | Apache 2.0 | Safetensors |
| Llama-3.2-3B-Instruct | 3B | 128K | FP16 | Llama 3.2 | Safetensors |

No se dispone de benchmarks comparativos para este repo. La comparativa se limita a características estructurales. El modelo base de Granite 4.2 destaca por su tool calling integrado con razonamiento, mientras que Qwen y Llama ofrecen contextos más largos documentados.

## Limitaciones y advertencias

- Cuantización a 2 bits: extremadamente agresiva, produce una degradación severa en la coherencia, fluidez y precisión de las respuestas. Es probable que aumenten las alucinaciones y los errores gramaticales.
- Sin benchmarks publicados: no hay evidencia de rendimiento para este artefacto; los resultados del modelo base no son aplicables.
- Sesgos del modelo base: Granite 4.2 puede heredar sesgos de los datos de entrenamiento originales, que no han sido mitigados en esta conversión.
- Riesgo de alucinación: especialmente alto en cuantizaciones bajas, el modelo puede inventar hechos, citas o código incorrecto.
- Limitaciones de idioma: aunque soporta 12 idiomas, la calidad en idiomas distintos del inglés puede ser notablemente inferior, agravada por la cuantización.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor del repo no está afiliado a IBM; la marca Granite es propiedad de IBM y se usa descriptivamente.
- No apto para producción: se recomienda utilizar versiones de 4 u 8 bits del mismo modelo base si se requiere calidad mínima en aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-2bit-awq-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página general de IBM Granite: https://www.ibm.com/granite
