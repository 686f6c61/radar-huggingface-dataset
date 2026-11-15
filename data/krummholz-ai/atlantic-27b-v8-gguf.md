# krummholz-ai/atlantic-27b-v8-GGUF

## Resumen

Krummholz Atlantic 27B v8 es un modelo de lenguaje de 26.896 millones de parámetros derivado de Qwen/Qwen3.8-27B mediante ajuste fino por preferencias. Lo desarrolla Krummholz AI LLC (Belfast, Maine) y se distribuye bajo licencia Apache 2.0. Su propuesta no es la maximización de la utilidad genérica, sino la veracidad: el modelo está entrenado para decir "no lo sé" en lugar de adivinar, para invocar herramientas de búsqueda cuando las tiene disponibles y para evitar bucles de razonamiento. Esta versión v8 se publica en formato GGUF cuantizado para su uso en estaciones de trabajo y servidores.

La arquitectura subyacente es la de Qwen3.8-27B (transformer denso, sin mezcla de expertos), con 26.895.998.464 parámetros totales según los pesos en safetensors. El repositorio ocupa 37,5 GB y contiene pesos en formato GGUF, además de los safetensors del modelo base. La model card declara únicamente inglés como idioma soportado.

La relevancia de esta versión radica en la mejora medida frente a v7 en el comportamiento de abstención y uso de herramientas: la tasa de respuestas erróneas sin herramientas cae del 49% al 16%, y la proporción de búsquedas cuando hay herramientas disponibles sube del 51% al 81%. Es un modelo pensado para despliegues donde la fiabilidad factual y la trazabilidad importan más que la cobertura o la complacencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B) |
| Parámetros totales | 26.895.998.464 (26,9 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF; publicado Q4_K_M (16,7 GB). Q5_K_M no medido |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27.000 millones de parámetros, y se ajusta mediante cuatro rondas de entrenamiento por preferencias sobre las propias respuestas del modelo, con el razonamiento activado. El proceso no utiliza texto de respuestas escrito por personas ni por otro modelo: un programa clasifica automáticamente las respuestas muestreadas como correctas, erróneas, abstenciones limpias, llamadas a herramienta bien formadas o correcciones de afirmaciones falsas, y el modelo se entrena para preferir su propia respuesta mejor valorada. No se detalla el volumen de tokens de entrenamiento ni la composición del dataset más allá de esta descripción.

La innovación destacable no es arquitectónica sino de comportamiento: el ajuste está guiado por una "constitución" explícita de cinco principios ordenados jerárquicamente (verdad, temperamento conservador, dignidad humana, conocimiento científico práctico y neutralidad política), de la que derivan los pares de entrenamiento, las evaluaciones y las salvaguardas del arnés. Los objetivos declarados incluyen reducir la respuesta desde memoria, aumentar la invocación de herramientas, eliminar el razonamiento que no termina y acortar las respuestas (de 477 a 263 tokens de media por respuesta entre v7 y v8).

## Capacidades

- Generación de texto conversacional en inglés con un tono declarado de "colaborador" más que de asistente: directo, dispuesto a discrepar y a rechazar peticiones.
- Abstención calibrada: dice explícitamente que no sabe en lugar de inventar, con una tasa del 35% de abstenciones en preguntas factuales sin herramientas en la versión v8.
- Uso de herramientas (tool calling / function calling): 60 de 60 llamadas bien formadas en la evaluación del autor; con herramientas disponibles busca en el 81% de los casos en lugar de responder de memoria.
- Razonamiento multi-paso con modo de razonamiento activado; en v8 ninguna de las 60 pruebas de uso de herramientas terminó con razonamiento inconcluso (frente a 34% en v7).
- Corrección de afirmaciones falsas: corrige cálculos erróneos planteados como hechos en 59 de 60 casos y hechos falsos ofrecidos para confirmación en 10 de 30.
- Capacidades matemáticas y de código verificables, orientadas a mostrar unidades, supuestos, cálculo y fuente.
- No se declaran capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Asistentes de investigación con búsqueda web obligatoria: el modelo está entrenado para invocar la herramienta de búsqueda en lugar de responder de memoria cuando está disponible (81% de los casos), lo que lo hace adecuado para flujos donde la trazabilidad de la fuente es requisito.
- Verificación de datos en pipelines documentales: su capacidad de corregir cálculos erróneos (59 de 60) permite usarlo como revisor de cifras y afirmaciones en informes antes de su publicación.
- Atención al cliente técnica con derivación a herramientas: las 60 de 60 llamadas a función bien formadas lo habilitan para integraciones con APIs internas de consulta de estado, pedidos o documentación.
- Moderación y control de calidad de contenido factual: la constitución prioriza la verdad sobre la complacencia, y el modelo corrige afirmaciones falsas del usuario en lugar de asentir, lo que encaja en revisiones de borradores.
- Despliegue en estación de trabajo con GPU de 24 GB: el archivo Q4_K_M de 16,7 GB está dimensionado explícitamente para tarjetas de 24 GB, lo que permite inferencia local sin servidor dedicado.
- Generación de código con verificación: el principio de "correcto significa comprobado" en matemáticas y código lo orienta a pipelines donde las respuestas se validan con tests o ejecución.
- Sistemas de agentes con múltiples pasos: la eliminación de razonamientos inconclusos en v8 (0 de 60) reduce el riesgo de bucles en orquestaciones de agentes.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Evaluación con razonamiento activado sobre 229 preguntas factuales retenidas, 199 sondas, 120 prompts largos, 60 turnos de uso de herramientas y HarmBench 300. Las columnas v7 y v8 son pesos a precisión completa; la última es el archivo Q4_K_M ejecutado con llama.cpp.

| Medida | v7 | v8 | v8 Q4_K_M |
|---|---|---|---|
| Preguntas factuales sin herramientas: respuesta errónea | 49% (113) | 16% (37) | 15% (35) |
| Preguntas factuales sin herramientas: respuesta correcta | 50% (114) | 48% (111) | 48% (111) |
| Preguntas factuales sin herramientas: dice no saber | 1% (2) | 35% (81) | 36% (83) |
| Erróneas entre las respuestas dadas de memoria | 50% | 25% | 24% |
| Con herramientas: busca en lugar de responder de memoria | 51% (117) | 81% (185) | 82% (188) |
| Con herramientas: razonamiento nunca terminado | 34% (79) | 0 | 0 |
| Con herramientas: respuesta errónea sin buscar | no contabilizado | 0 de 44 | 2 de 41 |
| Llamadas a herramienta bien formadas | 60 de 60 | 60 de 60 | 60 de 60 |
| Prompts largos: se repite / llega al límite | 7 / 18 de 120 | 0 / 0 de 120 | 1 / 0 de 120 |
| HarmBench: respuestas dañinas, modelo solo | 1 de 300 | 0 de 300 | 2 de 300 |
| Corrige un cálculo erróneo planteado como hecho | no medido | 59 de 60 | 60 de 60 |
| Corrige un hecho falso ofrecido para confirmación | no medido | 10 de 30 | 10 de 30 |
| Peticiones inocuas rechazadas | no medido | 6 de 120 | 6 de 120 |
| Suites de sondas superadas | 172 de 199 | 168 de 199 | 165 de 199 |
| Tokens medios por respuesta | 477 | 263 | 257 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 16,7 GB, por lo que requiere aproximadamente 18-20 GB de VRAM considerando caché KV y overhead del runtime; los pesos a precisión completa (26,9 B de parámetros) requieren del orden de 54 GB en FP16.
- GPU recomendadas: para Q4_K_M, tarjetas de 24 GB como RTX 4090, RTX 3090, A10G o L4; para precisión completa, A100 80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con cuantización Q4_K_M; no en tarjetas de 16 GB o menos con esta cuantización.
- Opciones de despliegue: llama.cpp (el autor publica resultados medidos con este runtime); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. vLLM, TGI y Ollama no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Krummholz Atlantic 27B v8 | 26,9 B | no disponible | Apache 2.0 | Safetensors, GGUF | Veracidad y abstención calibrada |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | Apache 2.0 | Safetensors | Modelo generalista de partida |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparación cuantitativa más allá del modelo base del que deriva.

## Limitaciones y advertencias

- Sigue siendo incorrecto desde memoria: 16% de las preguntas factuales y una cuarta parte de las respuestas que da sin herramientas. El objetivo declarado de menos del 1% no se ha alcanzado.
- La corrección de afirmaciones falsas es débil: corrige un hecho falso ofrecido para confirmación solo en 10 de 30 casos y lo acepta en 3.
- Las puntuaciones de las suites de sondas bajaron de 172 a 168 sobre 199 entre v7 y v8.
- El archivo Q4_K_M respondió a 2 peticiones dañinas de HarmBench (publicaciones persuasivas sobre miel para bebés y lirios para gatos) que los pesos a precisión completa rechazaron; el arnés y el juez no las detuvieron. Q5_K_M no se midió.
- Con herramientas, el archivo Q4_K_M dio 2 respuestas erróneas sin buscar de 41.
- El conjunto de evaluación es pequeño (229 preguntas), por lo que los porcentajes tienen varios puntos de incertidumbre.
- Rechaza 6 de 120 peticiones inocuas, lo que puede generar fricción en producción.
- Idioma limitado al inglés según la model card; no se declara soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo incorpora una constitución con posicionamientos editoriales explícitos (neutralidad política, corrección de afirmaciones falsas del usuario) que pueden no encajar en todos los productos.
- El modelo está diseñado explícitamente para no ser "máximamente útil", lo que puede traducirse en rechazos y respuestas más secas de lo esperado por usuarios finales.

## Enlaces

- Hugging Face: https://huggingface.co/krummholz-ai/atlantic-27b-v8-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
