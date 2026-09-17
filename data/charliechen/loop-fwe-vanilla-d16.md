# CharlieChen/loop-fwe-vanilla-d16

## Resumen

loop-fwe-vanilla-d16 es un modelo de lenguaje base de tipo *looped transformer* (transformer con recursión de bloques) publicado por el usuario CharlieChen en HuggingFace, asociado al artículo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un checkpoint de investigación, no de un modelo instruido ni afinado para diálogo: su propósito es servir como punto de referencia ("vanilla") dentro de un estudio sobre cómo el crecimiento del modelo, la recursión y los operadores de frontera afectan a los exponentes de escalado.

El modelo almacena 1.028.128.768 parámetros en FP32 y fue preentrenado sobre el corpus FineWeb-Edu con tokenizador GPT-2 (vía tiktoken) y una longitud de contexto de 2.048 tokens. Su coordenada de profundidad es d16, con anchura 2.048 y 16 cabezas de atención; la recurrencia final del núcleo es 1 en el checkpoint publicado. Los pesos exportados son idénticos bit a bit al checkpoint del artículo.

Su relevancia es fundamentalmente académica: permite reproducir las métricas del paper (NLL de validación de 2,59885105 nats/token y CORE accuracy de 0,21011420) y estudiar arquitecturas recursivas frente a transformers apilados convencionales. No está pensado para despliegue en producto: usa una implementación propia (`TransformerGPT`) y no es un artefacto compatible con `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recursión de bloques (*looped transformer*), implementación propia `TransformerGPT` del paper |
| Parametros totales | 1.028.128.768 (almacenados en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint público se distribuye únicamente en FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`); no se publican safetensors ni GGUF |
| Coordenada de profundidad | d16 |
| Anchura (d_model) | 2.048 |
| Cabezas de atención | 16 |
| Repeticiones finales del núcleo | 1 |
| Tokenizador | GPT-2 vía tiktoken; vocabulario de 50.257 tokens, ampliado a 50.304 filas del modelo |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tamano del repositorio | 4,1 GB |
| Archivos incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer recursivo: en lugar de apilar un número fijo de bloques independientes, el modelo reutiliza un núcleo de bloques aplicado de forma iterativa, de modo que la "profundidad efectiva" se controla mediante una coordenada de escalado (d16) que puede diferir del número de bloques Transformer ejecutados. La anchura es de 2.048 dimensiones con 16 cabezas de atención, la recurrencia final del núcleo en este checkpoint es 1 y el vocabulario se amplía de 50.257 a 50.304 filas para ajustarse a la implementación. El tokenizador es el de GPT-2 mediante tiktoken.

El preentrenamiento se realizó sobre FineWeb-Edu. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste por instrucciones: es un modelo estrictamente base, y el checkpoint público contiene solo los tensores del modelo y la recurrencia de evaluación final (sin estado del optimizador). El artículo indica que el entrenamiento y la evaluación se ejecutaron en GPU H100 con FlashAttention-3 y autocast en bfloat16. La NLL de validación del preentrenamiento reportada es de 2,59885105 nats/token, y los valores CORE corresponden a medias archivadas sobre las semillas 0, 1 y 2, con 91.037 ejemplos de 22 tareas.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje y estimación de verosimilitud (útil para calcular NLL sobre corpus de evaluación).
- Razonamiento y conocimiento factual de tipo few-shot, medido con la métrica CORE del paper.
- Capacidad limitada por la ventana de contexto de 2.048 tokens: tareas que requieran contexto largo quedan fuera de su alcance.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está etiquetado únicamente para inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Reproducción de resultados de investigación: cargar `final.pt` con el código del paper y ejecutar `eval.py` con el protocolo CORE (22 tareas, 91.037 ejemplos) para verificar la accuracy de 0,21011420 y la NLL de respuesta de 2,57491925 nats/token.
- Estudio de arquitecturas recursivas: comparar el comportamiento de este checkpoint d16 con variantes de profundidad y recurrencia del mismo estudio para analizar cómo afectan los exponentes de escalado.
- Cálculo de verosimilitud sobre corpus: usar el modelo como estimador de NLL (2,59885105 nats/token en validación de FineWeb-Edu) para filtrar o puntuar datos de preentrenamiento.
- *Continued pretraining* en dominio específico: al ser un modelo base de ~1.000 millones de parámetros, admite seguir entrenando sobre corpus propios en inglés para adaptarlo a un dominio concreto.
- Generación de texto base para experimentación: servir como referencia "vanilla" frente a modelos con recursión o crecimiento, controlando la variable de arquitectura en experimentos comparativos.
- Punto de partida para *fine-tuning* supervisado: partir de los pesos preentrenados para construir un modelo instruido propio, dado que el checkpoint no incluye ajuste por instrucciones.
- Validación de infraestructura de evaluación: usar `--max-per-task 10` para lanzar una prueba acotada de la pipeline de evaluación antes de ejecutar el protocolo completo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CORE accuracy (media sobre semillas 0, 1, 2; 91.037 ejemplos; 22 tareas) | 0,21011420 |
| CORE answer NLL | 2,57491925 nats/token |
| NLL de validación del preentrenamiento | 2,59885105 nats/token |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar para este modelo.

## Requisitos de hardware

- Peso de los pesos en FP32: aproximadamente 4,1 GB (1.028.128.768 parámetros × 4 bytes), coherente con el tamaño del repositorio.
- Inferencia en FP32: cabría en GPU de consumo con 8 GB de VRAM o más (por ejemplo, RTX 3070/3080, RTX 4060 Ti 16 GB, RTX 4090), dejando margen reducido para activaciones y caché KV con lotes pequeños.
- Con autocast en bfloat16 (como en el paper) el consumo de pesos baja a unos 2 GB, lo que facilita el despliegue en GPU de gama media; el paper reporta ejecuciones en H100.
- VRAM estimada para entrenamiento o *fine-tuning*: no disponible; dependería del optimizador y del tamaño de lote, y el checkpoint no incluye estado del optimizador.
- Opciones de despliegue: el modelo no es compatible con `AutoModel` de Transformers ni con formatos GGUF, por lo que no puede cargarse directamente en vLLM, llama.cpp, Ollama o TGI. Requiere el código del paper (`github.com/cue-engineering/loop`) y su script `eval.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado en la información disponible comparativas con otros modelos. Como referencia orientativa de categoría (modelos base en inglés de ~1.000 millones de parámetros con contexto de 2.048 tokens), pueden citarse alternativas ampliamente conocidas, si bien sus cifras de rendimiento no están incluidas en la información de esta ficha y deberían verificarse en sus propias model cards:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| loop-fwe-vanilla-d16 | 1.028.128.768 | 2.048 | no disponible | Pesos PyTorch `.pt` en HuggingFace |
| TinyLlama-1.1B | ~1.100 millones | 2.048 | Apache-2.0 | Pesos en HuggingFace |
| Pythia-1.0B | ~1.000 millones | 2.048 | Apache-2.0 | Pesos en HuggingFace |
| Benchmark comparativo (MMLU, CORE, etc.) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineación: no sigue instrucciones ni mantiene diálogo de forma fiable sin *fine-tuning* adicional.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Ventana de contexto de 2.048 tokens, corta para tareas de contexto largo, RAG con muchos documentos o conversaciones extensas.
- Riesgo de alucinación característico de un modelo base de ~1.000 millones de parámetros entrenado sobre FineWeb-Edu; no hay datos publicados sobre tasas de factualidad.
- Sesgos: el dataset FineWeb-Edu está filtrado con criterios educativos, pero no se documentan análisis de sesgo ni mitigaciones en la información disponible.
- Licencia no especificada: no puede asumirse uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Formato no estándar: los pesos son un `.pt` con una implementación `TransformerGPT` propia, incompatible con `AutoModel`, vLLM, llama.cpp, Ollama y TGI. Requiere el repositorio del paper.
- El checkpoint no incluye estado del optimizador, lo que dificulta reanudar el preentrenamiento de forma idéntica.
- Los valores CORE corresponden a medias archivadas sobre tres semillas y 22 tareas; comparar con otras evaluaciones exige replicar el mismo protocolo.
- Las métricas de NLL y CORE son de naturaleza académica y no equivalen a un rendimiento práctico en tareas de usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d16
- Repositorio de código del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Artículo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (URL del paper no disponible en la información proporcionada)
