# siddharthmb/2026.TA.features_gemma-2-2b_gemmascope_ftL0-24-25_ms1000_ml1024_tk10

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo, sino un artefacto de investigación en interpretabilidad de modelos: un *feature cache* empaquetado para la librería `circuit-tracer`. El artefacto almacena activaciones de características (features) extraídas de un modelo base `gemma-2-2b_gemmascope_width_16k_average_l0_76`, que combina Gemma-2-2B con transcoder adapters de GemmaScope (ancho 16k, L0 medio de 76). El objetivo es permitir el trazado de circuitos internos (circuit tracing) y el análisis de las características aprendidas por el modelo.

El autor, `siddharthmb`, ha creado este cache a partir de dos conjuntos de datos: una muestra de `lmsys-chat-1m` (dividida en fragmentos) y una muestra de `fineweb-1m`. La colección de características se realizó sobre las capas 0, 24 y 25 del modelo base, con una longitud máxima de secuencia de 1024 tokens y top-k de 10. El repositorio está marcado como "Reservado; la colección de características está en progreso", lo que indica que es un trabajo en curso y no un modelo listo para producción.

La relevancia de este artefacto reside en el creciente interés por la interpretabilidad mecanicista: permite a investigadores rastrear qué características internas se activan durante el procesamiento de texto y cómo se combinan para producir el comportamiento final del modelo. No se debe confundir con un modelo de lenguaje utilizable directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Feature cache de transcoder adapters sobre Gemma-2-2B (GemmaScope, ancho 16k, L0 promedio 76) |
| Parámetros totales | No disponible (depende del modelo base y de los transcoder adapters) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (configuración de colección, no del modelo base) |
| Tipos de cuantización | No disponible (no es un modelo de inferencia estándar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Packed feature cache: `features/index.json.gz` y `features/layer_N.bin` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un *cache* de activaciones de características. El modelo base es `gemma-2-2b_gemmascope_width_16k_average_l0_76`, que combina un Gemma-2-2B (transformer decoder-only con 26 capas, atención local-global intercalada y atención por grupos de consultas) con transcoder adapters de GemmaScope de ancho 16k. Los transcoder adapters son una técnica de interpretabilidad que descompone las activaciones del modelo en características esparsas, similares a las neuronas de un autoencoder.

La colección de características se realizó con la herramienta `analysis.features.collect_feature_activations` del proyecto `circuit-tracer`, utilizando dos conjuntos de datos: `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` (conversaciones de chat) y `science-of-finetuning/fineweb-1m-sample` (texto web general). Las características se recopilaron para las capas 0, 24 y 25, con una longitud máxima de secuencia de 1024 tokens y un top-k de 10. El proceso de colección está aún en curso (el estado del repositorio es "Reservado").

## Capacidades

- No es un modelo generativo; no genera texto, código ni realiza razonamiento.
- Almacena las activaciones de características esparas del modelo base para las capas 0, 24 y 25.
- Permite el análisis de qué características se activan ante qué inputs (interpretación de mecanismos internos).
- Compatible con la herramienta `circuit-tracer` para trazado de circuitos y análisis de dependencias causales.
- El formato empaquetado (`features/index.json.gz` y `features/layer_N.bin`) permite una carga eficiente de las activaciones en memoria.
- Los datos de colección provienen de dos conjuntos: conversaciones de chat (LMSYS) y texto web (FineWeb), lo que cubre dos dominios lingüísticos.

## Casos de uso

- **Investigación en interpretabilidad mecanicista**: el cache permite a investigadores estudiar cómo las características esparas del modelo se activan en respuesta a diferentes inputs, identificando qué características corresponden a conceptos concretos (por ejemplo, nombres propios, verbos, temas).
- **Trazado de circuitos para detección de sesgos**: al analizar las activaciones de características en las capas 0, 24 y 25, se puede rastrear cómo se propagan los sesgos a través del modelo y qué características contribuyen a decisiones no deseadas.
- **Estudio de la composicionalidad**: el cache permite examinar cómo se combinan características de bajo nivel (capa 0) con características de alto nivel (capas 24 y 25) para producir comportamiento complejo.
- **Evaluación de transcoder adapters**: comparar las activaciones de características entre el modelo base y el modelo con transcoders para evaluar la fidelidad de la descomposición.
- **Análisis de alucinación**: las activaciones de características pueden revelar patrones internos asociados con la generación de información falsa, aunque el cache no incluye las salidas del modelo.
- **Desarrollo de herramientas de interpretabilidad**: sirve como conjunto de datos de referencia para entrenar o evaluar nuevos métodos de análisis de activaciones (por ejemplo, SAEs, probing).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo de generación, sino un artefacto de interpretabilidad; por lo tanto, no hay métricas de MMLU, HumanEval, GSM8K, etc. La evaluación relevante sería la fidelidad de los transcoder adapters (L0, activaciones reconstruidas), pero no se proporcionan dichos datos en la model card.

## Requisitos de hardware

No disponible. No se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue. El repositorio es un cache de activaciones, no un modelo de inferencia; su uso requiere la librería `circuit-tracer` y un entorno de análisis de datos (por ejemplo, Python con NumPy/PyTorch) para cargar los archivos `index.json.gz` y `layer_N.bin`. El tamaño de los archivos no se ha publicado, pero dado que se trata de activaciones de características de un modelo de 2B con ancho de transcoder de 16k, es razonable esperar varios GB de datos.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos generativos. Como artefacto de interpretabilidad, se podría comparar con otros feature caches de circuit-tracer (por ejemplo, otros repositorios del mismo autor con configuraciones distintas), pero no se han encontrado datos de comparación en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación en desarrollo: el estado es "Reservado" y la colección de características está en progreso; los datos pueden cambiar o estar incompletos.
- No es un modelo utilizable en producción: no genera texto, no es un API, no tiene licencia ni documentación de uso comercial.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial o la redistribución del contenido.
- Los datos de activaciones están ligados a los conjuntos de datos de entrenamiento (LMSYS Chat y FineWeb), lo que puede introducir sesgos en las características analizadas.
- No se proporcionan métricas de calidad de los transcoder adapters (por ejemplo, L0, tasa de reconstrucción), por lo que la fiabilidad de las características es incierta.
- El repositorio no incluye el modelo base Gemma-2-2B ni los pesos de los transcoders; solo las activaciones de características, lo que limita su uso independiente.

## Enlaces

- Repositorio de HuggingFace: [siddharthmb/2026.TA.features_gemma-2-2b_gemmascope_ftL0-24-25_ms1000_ml1024_tk10](https://huggingface.co/siddharthmb/2026.TA.features_gemma-2-2b_gemmascope_ftL0-24-25_ms1000_ml1024_tk10)
- Dataset de transcoder adapters (LMSYS splits): [siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits](https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits)
- Dataset de FineWeb (muestra): [science-of-finetuning/fineweb-1m-sample](https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample)
- Modelo base (referencia): [gemma-2-2b_gemmascope_width_16k_average_l0_76](https://huggingface.co/gemma-2-2b_gemmascope_width_16k_average_l0_76)
- Repositorio de Gemma (Google DeepMind): [github.com/google-deepmind/gemma](https://github.com/google-deepmind/gemma)
