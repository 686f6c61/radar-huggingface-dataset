# borekboissy/Millesime-2026-4b

## Resumen

Millésime 2026 4B es un modelo de lenguaje de 4 000 millones de parámetros desarrollado por borekboissy, especializado en francés y construido a partir de Qwen/Qwen3-4B-Instruct-2507. Su objetivo es ofrecer un modelo ligero (SLM) con un rendimiento superior a modelos de tamaño comparable en benchmarks francófonos, destacando en FR-MT-Bench donde supera a modelos de 8B y 9B. El proyecto Millésime prioriza la calidad en francés, el uso de datos con licencias que permiten fine-tuning y la disponibilidad de modelos pequeños ejecutables localmente.

El modelo se entrena mediante un pipeline de tres fases: fine-tuning supervisado (SFT) con 38 000 ejemplos de cultura general francesa, optimización por preferencias humanas (DPO) a partir del dataset público Compar:IA del Ministerio de Cultura francés, y fusión de pesos con el método TIES. Con una ventana de contexto de 262 144 tokens, está pensado para aplicaciones conversacionales y de generación de texto en francés, manteniendo una licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, denso) |
| Parámetros totales | 4 022 468 096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | No disponible (formato original safetensors, compatible con cuantizaciones estándar) |
| Idiomas soportados | Francés (idioma objetivo; el modelo base Qwen3 es multilingüe, pero la ficha solo declara fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-4B-Instruct-2507, un transformer denso con atención completa, sin mecanismo de mezcla de expertos. El entrenamiento se realiza en tres fases: primero, un fine-tuning supervisado (SFT) con un dataset propio de 38 000 ejemplos repartidos en 14 categorías y 280 subcategorías (historia, lengua francesa, derecho, ciencias, filosofía, razonamiento, escritura, etc.), generados sintéticamente y verificados por hechos. Segundo, un alineamiento por preferencias (DPO) usando el dataset Comparar:IA del Ministerio de Cultura francés, filtrado para conservar pares de preferencias limpios y en francés. Tercero, una fusión de pesos mediante el método TIES, que combina los deltas de las dos fases anteriores minimizando interferencias entre los cambios de peso.

La fase de entrenamiento se realizó con 4 GPU NVIDIA B200 en Estados Unidos, con emisiones de CO2 estimadas en 1281 kg (CodeCarbon). El modelo final se presenta en modo de generación sin cadena de pensamiento (non-thinking), siguiendo el estilo del modelo base.

## Capacidades

- Generación de texto y conversación en francés, con énfasis en cultura general francesa (historia, literatura, derecho, administración, ciencias, filosofía).
- Razonamiento y resolución de tareas de conocimiento enciclopédico, mejorado mediante SFT sobre datos fact-checked.
- Alineación con preferencias humanas mediante DPO, lo que mejora la utilidad y la adecuación de las respuestas en comparación con el modelo base.
- Soporte de ventana de contexto larga (262 144 tokens), útil para documentos extensos o diálogos multi-turno.
- Compatibilidad con el ecosistema transformers y text-generation-inference, lo que facilita su despliegue en servidores y aplicaciones.
- No se ha documentado soporte explícito para tool calling, funciones de agente o capacidades multimodales; el modelo se centra en texto.

## Casos de uso

- Asistente conversacional en francés para atención al cliente: gracias a su ventana de contexto de 262 144 tokens, puede gestionar diálogos largos y recordar detalles de la conversación, manteniendo una respuesta natural y culturalmente adaptada.
- Generación de contenidos editoriales en francés: su entrenamiento en cultura general y estilo permite redactar artículos, resúmenes o textos administrativos con un buen nivel de calidad lingüística.
- Educación y formación: puede actuar como tutor de francés o explicar conceptos de historia, derecho o ciencia, aprovechando su conocimiento fact-checked en estas áreas.
- Procesamiento de documentos extensos: con el contexto de 262 144 tokens, puede analizar informes, contratos o libros completos en francés, extrayendo información o resumiendo.
- Desarrollo de aplicaciones locales: al ser un modelo de 4B, puede ejecutarse en GPU de consumo con cuantización, permitiendo asistentes offline en francés para entornos con requisitos de privacidad.
- Investigación académica: útil como modelo base para fine-tuning adicional en tareas específicas del francés, dada su licencia Apache 2.0 y la disponibilidad de los datasets de entrenamiento.

## Benchmarks y rendimiento

El modelo se evaluó en FR-MT-Bench (con GPT-5.6-Sol como juez, dos veces con proveedores de API distintos) y en benchmarks académicos francés (IFEval-fr, GPQA-fr, ARC-C, BoolQA, Grammaire, HellaSwag, XWinograd, Global-MMLU-fr) con Lighteval y lm-evaluation-harness.

**FR-MT-Bench (puntuación)**

| Modelo | Juez OpenAI | Juez OpenRouter |
|---|---|---:|
| **Millésime 2026 4B** | **6.463** | **6.475** |
| Chocolatine-2.1-4B | 6.306 | 6.363 |
| Qwen3-4B-Instruct-2507 (base) | 6.256 | 6.288 |
| Ministral-3-8B-Instruct-2512 | 6.056 | 6.113 |
| gemma-3-4b-it | 6.044 | 6.106 |
| Qwen3.5-9B | 5.938 | 5.906 |
| Phi-4-mini-instruct | 5.363 | 5.375 |
| Qwen3.5-4B | 4.756 | 4.806 |
| Lucie-7B-Instruct-v1.1 | 3.781 | 3.769 |

**Benchmarks académicos (promedio)**

| Modelo | IFEval-fr | GPQA-fr | ARC-C | BoolQA | Grammaire | HellaSwag | XWinograd | Global-MMLU-fr | **Media** |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ministral-3-8B-Instruct-2512 | 44.7 | 42.6 | 56.7 | 93.3 | 79.0 | 70.4 | 73.5 | 71.2 | **68.60** |
| Qwen3.5-9B | 25.7 | 27.9 | 51.9 | 50.0 | 72.3 | 69.2 | 77.1 | 73.8 | **63.31** |
| **Millésime 2026 4B** | **69.1** | 27.4 | 48.3 | 90.4 | 73.1 | 58.3 | 67.5 | 65.0 | **63.09** |
| Qwen3.5-4B | 66.7 | 20.3 | 45.9 | 50.0 | 73.9 | 62.6 | 74.7 | 70.0 | **62.78** |
| Chocolatine-2.1-4B | 68.6 | 23.9 | 48.0 | 88.8 | 71.4 | 58.1 | 66.3 | 64.5 | **61.84** |
| Qwen3-4B-Instruct-2507 (base) | 68.2 | 24.4 | 47.2 | 87.6 | 71.4 | 56.8 | 67.5 | 63.0 | **60.86** |
| Phi-4-mini-instruct | 37.9 | 31.0 | 48.8 | 88.8 | 69.7 | 58.9 | 77.1 | 59.8 | **59.46** |
| gemma-3-4b-it | 61.9 | 28.9 | 50.9 | 50.0 | 71.4 | 63.4 | 77.1 | 57.8 | **57.36** |
| Lucie-7B-Instruct-v1.1 | 21.3 | 21.8 | 43.6 | - | - | - | - | - | - |

El modelo destaca en FR-MT-Bench, siendo el mejor del panel, y en la media de benchmarks académicos se sitúa en tercer lugar, por detrás de modelos de 8B y 9B, pero supera a otros 4B como Chocolatine-2.1-4B y Qwen3.5-4B.

## Requisitos de hardware

- Para inferencia en FP16, se estima que el modelo requiere unos 8 GB de VRAM (4 000 millones de parámetros × 2 bytes por parámetro). Con cuantización de 4 bits (GGUF), se reduce a unos 2 GB.
- Se recomienda una GPU con al menos 8 GB de VRAM para una ejecución cómoda en FP16; una RTX 3060 o superior puede ser suficiente para inferencia local con cuantización.
- El entrenamiento se realizó en 4× NVIDIA B200, pero no se especifican requisitos de inferencia específicos del modelo.
- Despliegue compatible con el ecosistema transformers, text-generation-inference (TGI), y opciones como vLLM o llama.cpp (con conversión a GGUF).
- No se han publicado datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | FR-MT-Bench (OpenAI) | Media académica |
|---|---|---|---|---|---|
| **Millésime 2026 4B** | 4B | 262 144 | Apache 2.0 | **6.463** | **63.09** |
| Qwen3-4B-Instruct-2507 (base) | 4B | 262 144 | Apache 2.0 | 6.256 | 60.86 |
| Chocolatine-2.1-4B | 4B | No disponible | Apache 2.0 | 6.306 | 61.84 |
| Ministral-3-8B-Instruct-2512 | 8B | No disponible | No disponible | 6.056 | 68.60 |
| Qwen3.5-4B | 4B | No disponible | No disponible | 4.756 | 62.78 |

El modelo supera en FR-MT-Bench a todos los demás, incluidos los de 8B y 9B, aunque en media académica queda por detrás de Ministral-3-8B y Qwen3.5-9B, pero por delante de los otros 4B.

## Limitaciones y advertencias

- El modelo está especializado en francés; su rendimiento en otros idiomas no se ha evaluado y probablemente sea inferior.
- Al ser un modelo pequeño (4B), puede tener más alucinaciones o errores de razonamiento que modelos de mayor tamaño, especialmente en tareas complejas.
- La ventana de contexto de 262 144 tokens es amplia, pero el rendimiento en contextos muy largos puede degradarse sin estrategias de gestión de memoria.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (SFT y DPO) provienen de fuentes con condiciones de uso específicas; el autor afirma que solo se usaron datos con permiso explícito para fine-tuning, pero conviene revisar los datasets para cada caso de uso.
- No se han documentado sesgos específicos, pero al entrenarse con datos de cultura francesa, puede reflejar sesgos culturales o históricos de ese ámbito.
- El modelo no soporta funciones de tool calling ni modo de razonamiento extensivo (thinking) de forma explícita; está diseñado para generación directa sin cadena de pensamiento.

## Enlaces

- Modelo: https://huggingface.co/borekboissy/Millesime-2026-4b
- Dataset SFT: https://huggingface.co/datasets/borekboissy/Millesime-2026-SFT
- Dataset DPO: https://huggingface.co/datasets/borekboissy/Millesime-2026-comparIA-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset CompararIA (Ministerio de Cultura): https://huggingface.co/datasets/ministere-culture/comparia-fr-arena
