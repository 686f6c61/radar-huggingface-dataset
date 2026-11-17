# KatterMobile/Nanbeige4.3-33B-WSP-MAX-GGUF

## Resumen

Nanbeige4.3-33B-WSP-MAX-GGUF es una coleccion de 10 cuantizaciones GGUF del modelo Nanbeige4.3-33B, un transformer denso de 33.118.977.024 parametros desarrollado originalmente por Nanbeige. La publica el usuario KatterMobile aplicando una tecnica de "Weight-Space Programming" (WSP): una edicion de rango 1 sobre nueve capas `mlp.down_proj` con alpha 0.10, que modifica solo el 0.47% relativo de los pesos sin reentrenamiento por gradiente.

El atractivo principal es que esa edicion pre-registrada eleva la puntuacion en GPQA Diamond de 46,46% a 59,60% (+13,13 pp, IC 95% [+8,08, +18,69], McNemar p = 6x10^-6) y reduce un 10,4% los tokens de razonamiento. El modelo es de tipo "thinking": razona dentro de etiquetas think antes de responder, lo que lo hace adecuado para tareas de razonamiento complejo con presupuesto de tokens amplio.

La relevancia practica esta en que los GGUF permiten ejecutar un modelo de 33B en hardware de consumo y en servidores sin GPU de gama alta, con un Q4_K_M de aproximadamente 20 GB como opcion por defecto recomendada. La licencia Apache-2.0 heredada del modelo base facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Nanbeige4.3-33B) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 16384`) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (10 ficheros); el modelo base y el checkpoint NVFP4 intermedio usan otros formatos |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parametros de Nanbeige. Sobre el se aplica una edicion de espacio de pesos (WSP) de rango 1 en nueve capas `mlp.down_proj`, con alpha 0.10 y un cambio relativo de pesos del 0.47%. La edicion se aplico durante la conversion a GGUF desde los pesos BF16 originales, usando los mismos factores de rango 1, el mismo redondeo estocastico BF16 y las mismas semillas que el "stage-6 bake" pre-registrado; se incluyen ficheros de auditoria por capa (`wsp_bake_audit_*.json`). Los pesos GGUF en BF16 son identicos bit a bit al "teacher" del que se destilo el checkpoint NVFP4 QAD; no son recuantizaciones de ese checkpoint NVFP4.

La metodologia WSP sigue la investigacion de weight-space programming de Concept Country. El diseno incluye un control ortogonal de norma equivalente que no mostro efecto (+1,01 pp, no significativo), lo que refuerza la atribucion de la mejora al ajuste concreto. Los detalles de datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo "thinking": el modelo razona dentro de etiquetas think antes de emitir la respuesta visible.
- Razonamiento cientifico y de nivel experto, evidenciado por la mejora en GPQA Diamond.
- Reduccion del consumo de tokens de razonamiento (-10,4%) respecto al modelo base sin la edicion WSP.
- Plantilla de chat Jinja embebida en el GGUF, compatible con llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es text-generation.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo thinking y el contexto configurable lo permiten en la practica.

## Casos de uso

- Razonamiento cientifico y tecnico asistido: el modelo puede responder preguntas de nivel experto (tipo GPQA) con cadena de pensamiento visible; conviene darle 8k o mas tokens de presupuesto para problemas dificiles y parsear la respuesta tras el bloque de pensamiento.
- Despliegue local en estaciones de trabajo: con el Q4_K_M (~20 GB) se puede ejecutar en una GPU consumer de 24 GB o en configuracion CPU+GPU con llama.cpp u Ollama, sin depender de APIs externas.
- Asistente conversacional bilingue ingles-chino: util para soporte o documentacion en entornos con esos dos idiomas, aprovechando la plantilla Jinja embebida.
- Prototipado e investigacion de tecnicas de edicion de pesos: los ficheros de auditoria por capa y la reproducibilidad del bake permiten estudiar el efecto de la edicion WSP sobre el comportamiento del modelo.
- Generacion de codigo y matematicas: no hay benchmarks publicados en la informacion disponible que confirmen rendimiento especifico en HumanEval o GSM8K; debe validarse empiricamente antes de usarlo en produccion para estas tareas.
- Pipelines de inferencia con llama-server: integrable como servidor HTTP local (`llama-server`) para aplicaciones que requieran privacidad de datos y control de latencia.
- Evaluacion comparativa de cuantizaciones: los 10 niveles permiten medir el compromiso calidad/tamano en un mismo modelo con la misma edicion aplicada.

## Benchmarks y rendimiento

Los datos publicados corresponden a la edicion WSP en BF16 servida con vLLM en FP8, no a las cuantizaciones GGUF. Medicion: una muestra por item, n = 198, limite de 8.192 tokens.

| Benchmark | Base (sin WSP) | WSP MAX | Delta |
|---|---|---|---|
| GPQA Diamond | 46,46% | 59,60% | +13,13 pp (IC 95% [+8,08, +18,69], McNemar p = 6x10^-6) |
| Control ortogonal de norma equivalente | - | +1,01 pp | no significativo |
| Tokens de razonamiento | referencia | -10,4% | reduccion |

No se han publicado resultados de benchmarks sobre los ficheros GGUF. El autor indica que la cuantizacion anade degradacion propia, mayor en Q2/Q3. Solo el Q8_0 paso una prueba de humo de generacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~12 GB, Q3_K_S ~14 GB, Q3_K_M ~16 GB, Q3_K_L ~17 GB, Q4_K_S ~19 GB, Q4_K_M ~20 GB, Q5_K_S ~23 GB, Q5_K_M ~24 GB, Q6_K ~27 GB, Q8_0 ~35 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40/80 GB o H100. Las opciones Q2/Q3 caben en GPUs de 16 GB o menos.
- Cabe en GPU consumer: si, desde Q2_K hasta Q5_K_M en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 27-35 GB y por tanto GPUs profesionales o reparto CPU+GPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio y cualquier frontend que lea GGUF. El autor cita compatibilidad con endpoints.
- Parametros de inferencia recomendados: temperatura 0.6, top_p 0.95, top_k 20, thinking activado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-WSP-MAX-GGUF | 33,1B | no disponible | GGUF (10 cuants) | Apache-2.0 | Edicion WSP, +13,13 pp en GPQA Diamond |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | no disponible | safetensors/BF16 | Apache-2.0 | Referencia sin edicion WSP |
| KatterMobile/Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD | 33,1B | no disponible | NVFP4 | Apache-2.0 | Checkpoint NVFP4 con QAD y metodologia completa |

No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada para una comparacion cruzada fiable.

## Limitaciones y advertencias

- Los benchmarks de GPQA Diamond se midieron en BF16 WSP con vLLM FP8, no en los GGUF; el rendimiento real de cada cuantizacion puede ser inferior, especialmente en Q2_K y Q3.
- Modelo de tipo thinking: requiere presupuesto de tokens amplio (8k+ para problemas dificiles) y parseo del bloque think; el consumo de tokens es elevado.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada en la informacion disponible; el ejemplo de uso configura 16384 tokens, pero no se confirma como maximo.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones de sesgo publicadas.
- La edicion WSP es una modificacion no estandar del modelo base; su efecto sobre tareas distintas de GPQA no esta medido.
- No se han ejecutado pruebas de calidad sobre las cuantizaciones GGUF salvo un smoke test en Q8_0.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Nanbeige4.3-33B y de la metodologia WSP de Concept Country.
- El repo ocupa 209,2 GB en total; la descarga de un unico fichero es posible, pero hay que seleccionar la cuantizacion adecuada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KatterMobile/Nanbeige4.3-33B-WSP-MAX-GGUF
- Checkpoint NVFP4 con metodologia completa: https://huggingface.co/KatterMobile/Nanbeige4.3-33B-WSP-MAX-NVFP4-QAD
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Investigacion de weight-space programming de Concept Country: https://concept.country/research/weight-space-programming
