# mradermacher/LFM3-1.7B-i1-GGUF

## Resumen

LFM3-1.7B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo LFM3-1.7B desarrollado originalmente por Liquid AI. Este repositorio, publicado por el usuario mradermacher, no contiene un modelo nuevo sino una redistribución optimizada del modelo base en distintos niveles de compresión (desde IQ1_S hasta Q6_K), pensada para facilitar su ejecución en hardware con recursos limitados mediante motores de inferencia compatibles con GGUF como llama.cpp u Ollama.

El modelo base pertenece a la familia LFM3 de Liquid AI, una tercera generación de modelos de lenguaje de pequeño tamaño (1.700 millones de parámetros nominales). La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten desplegar el modelo en CPU o en GPUs de consumo, algo crítico para entornos de desarrollo locales y prototipado rápido.

No obstante, la información publicada en este repositorio es extremadamente escasa: no se especifican licencia, idiomas, pipeline ni resultados de evaluación. Además, el dato de parámetros reportado en los metadatos de Hugging Face (899.013) resulta inconsistente con la nomenclatura del modelo (1.7B), por lo que debe tratarse con cautela y verificarse contra el repositorio original de LiquidAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LFM3 de Liquid AI) |
| Parámetros totales | 1.7B según nomenclatura; metadatos del repo indican 899.013 (dato inconsistente) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo original) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo LFM3-1.7B en la información proporcionada. El repositorio únicamente documenta el proceso de cuantización: los ficheros GGUF se han generado a partir del modelo original en https://huggingface.co/LiquidAI/LFM3-1.7B, empleando cuantizaciones ponderadas con imatrix (matriz de importancia) y la versión 2 del pipeline de cuantización, con tensores de salida cuantizados (`output_tensor_quantised: 1`).

La lista de cuantizaciones incluye tanto métodos clásicos de la familia K-quants (Q2_K a Q6_K) como variantes IQ (IQ1_S hasta IQ4_XS), que emplean cuantización con importancia para preservar mejor la calidad en niveles de compresión agresivos. Esta variedad permite elegir el equilibrio entre tamaño en disco, consumo de memoria y fidelidad respecto al modelo original.

## Capacidades

- Generación de texto: capacidades propias del modelo base LFM3-1.7B, si bien no se detallan en la información disponible.
- Razonamiento y matemáticas: no confirmado en la documentación proporcionada.
- Generación de código: no confirmado en la documentación proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en CPU: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp, útil para prototipado y pruebas offline.
- Inferencia en GPUs de consumo: las variantes Q4_K_M o Q5_K_M caben en GPUs con 4-8 GB de VRAM, lo que facilita experimentación en estaciones de trabajo domésticas.
- Evaluación comparativa de cuantizaciones: al ofrecer más de 20 variantes, el repositorio sirve para medir la degradación de calidad según el nivel de compresión en tareas concretas.
- Integración en aplicaciones de escritorio: el formato GGUF es compatible con Ollama y llama.cpp, lo que permite embeber el modelo en herramientas locales sin dependencia de la nube.
- Filtrado y clasificación de texto a pequeña escala: para tareas simples donde un modelo de 1.7B es suficiente y se prioriza baja latencia en hardware modesto.
- Entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para prototipos con información sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1.7B en GGUF, las cuantizaciones Q4 rondarían ~1-1.5 GB y las Q6 en torno a ~1.5-2 GB, aunque estas cifras no están confirmadas en la documentación.
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Compatibilidad con GPU de consumo: probable para cuantizaciones Q4 y superiores, no confirmado oficialmente.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-i1-GGUF (este repo) | 1.7B (nominal) | no disponible | no disponible | GGUF | Hugging Face |
| LFM3-1.7B (original, LiquidAI) | 1.7B | no disponible | no disponible | safetensors | Hugging Face |
| Otros modelos de ~1-2B en GGUF | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Repositorio de cuantización, no modelo original: cualquier evaluación de calidad debe contrastarse con el modelo base de LiquidAI.
- Inconsistencia en el número de parámetros: los metadatos indican 899.013 mientras que el nombre sugiere 1.7B; conviene verificar.
- Licencia no disponible: impide confirmar si el uso comercial está permitido. Debe consultarse la licencia del modelo original LFM3-1.7B.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe adecuado.
- Riesgo de alucinación: inherente a modelos de este tamaño, especialmente en cuantizaciones agresivas (IQ1/IQ2).
- Degradación por cuantización: las variantes de menor bit (IQ1_S, IQ2_XXS) pueden perder calidad notable en tareas de razonamiento.
- Sin benchmarks publicados: no hay evidencia empírica de rendimiento en este repositorio.
- Fecha de creación futura (2026-11-09): dato anómalo que sugiere posibles errores en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
