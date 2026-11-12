# rlacombe/glycobart-207m-repro

## Resumen

GlycoBART Reproduction (207M) es un checkpoint de PyTorch publicado por Romain Lacombe (usuario `rlacombe`) que reproduce desde cero la arquitectura y el objetivo de entrenamiento de Abtheen et al. (2025) aplicados a la prediccion de estructuras de glicanos a partir de espectros de masas. El modelo forma parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026, y se distribuye como el checkpoint convergido `best_model.pt` con semilla de inicializacion aleatoria `0`. Su proposito es servir como referencia reproducible para la tarea de elucidacion estructural de glicanos en el benchmark CandyCrunch v2.

El modelo tiene 207 millones de parametros y se enmarca en la familia de modelos tipo BART adaptados al dominio de la glicomica. La innovacion principal del trabajo que lo respalda es el uso de discrete flow matching con "crystallizing flows", una variante de generacion discreta aplicada a la prediccion de estructuras ramificadas de carbohidratos, que son objetos combinatoriamente complejos y no triviales de representar con modelos autoregresivos convencionales.

La relevancia actual del checkpoint es doble: por un lado, ofrece un punto de referencia cuantificado (80,92% ± 0,31% de exactitud estructural top-1 en el conjunto de test con `n = 76.774` y beam=1) para una tarea con pocos recursos publicos; por otro, su licencia MIT y la disponibilidad del codigo de inferencia facilitan su uso como linea base en investigacion sobre espectrometria de masas y glicobiologia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder) con objetivo de discrete flow matching (crystallizing flows) |
| Parametros totales | 207M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BART, es decir, un transformer encoder-decoder, pero se entrena con un objetivo de discrete flow matching en lugar de la denoising objective original de BART. La variante "crystallizing flows" del trabajo GlycoGen aplica flujos discretos para generar la estructura del glicano como una secuencia de decisiones discretas (monosacaridos y enlaces glucosidicos), lo que encaja mejor con la naturaleza combinatoria y ramificada de estas moleculas que la generacion autoregresiva token a token.

El entrenamiento se realiza sobre el benchmark CandyCrunch v2 (`rlacombe/candycrunch-v2-benchmark`), un conjunto de espectros de masas de glicanos con sus estructuras asociadas. La model card indica que se trata de una reproduccion desde cero de Abtheen et al. (2025) con inicializacion aleatoria (semilla `0`), lo que implica que no se parte de pesos preentrenados de BART generico. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; dado el dominio cientifico, es probable que el entrenamiento sea puramente supervisado, pero este extremo no esta confirmado.

## Capacidades

- Prediccion de estructura de glicanos a partir de espectros de masas (elucidacion estructural).
- Generacion de estructuras ramificadas de carbohidratos mediante discrete flow matching.
- Inferencia con busqueda por beam (la metrica reportada usa beam=1).
- Evaluacion cuantitativa sobre el benchmark CandyCrunch v2 con particiones de test definidas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte multilingue ni capacidades de vision, audio o thinking mode.
- No se documenta generacion de texto general ni razonamiento fuera del dominio de la glicomica.

## Casos de uso

- Elucidacion estructural de glicanos en pipelines de glicomica: el modelo toma un espectro de masas como entrada y predice la estructura del glicano, sustituyendo o asistiendo la anotacion manual en laboratorios de espectrometria.
- Linea base reproducible para investigacion: al ser una reproduccion desde cero con semilla fija y licencia MIT, sirve para comparar nuevas propuestas de modelos de prediccion de glicanos contra un resultado publicado y verificable.
- Anotacion a gran escala de bases de datos de espectros: con un 80,92% de exactitud top-1 en el conjunto de test, puede usarse para preanotar espectros y reducir la carga de revision manual en repositorios grandes.
- Integracion en herramientas bioinformaticas: el checkpoint en PyTorch y el codigo de inferencia en GitHub permiten incorporar el modelo como modulo en plataformas de analisis de glicomica existentes.
- Deteccion de estructuras anomalas: comparar la prediccion del modelo con la estructura anotada puede senalar espectros mal anotados o glicanos atipicos que requieran revision.
- Docencia y formacion en glicoinformatica: el modelo y sus scripts de inferencia permiten ilustrar de forma practica como se aplican modelos generativos discretos a problemas de espectrometria de masas.
- Reproducibilidad de resultados de NeurIPS: util para replicar las cifras del articulo GlycoGen y auditar el proceso de entrenamiento con la semilla publicada.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CandyCrunch v2 (test, n = 76.774) | Exactitud estructural top-1, beam=1 | 80,92% ± 0,31% |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones cuantitativas con modelos alternativos de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 207M de parametros, en precision FP32 el peso de los pesos ronda los 0,83 GB, y en FP16/bf16 alrededor de 0,41 GB, a lo que hay que sumar memoria para activaciones y el espectro de entrada.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojar el modelo, pero no hay datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se especifican modelos concretos ni requisitos minimos.
- Opciones de despliegue: el repositorio usa PyTorch y scripts de inferencia propios en `github.com/rlacombe/GlycoGen`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlycoBART Reproduction (207M) | 207M | no disponible | Prediccion de estructura de glicanos | MIT | Hugging Face + GitHub |
| Abtheen et al. (2025) | no disponible | no disponible | Prediccion de estructura de glicanos | no disponible | Referencia bibliografica |
| Modelos BART genericos | ~140M-400M | 1024 tokens (tipico en BART base) | Generacion de texto | MIT | Hugging Face |

La comparacion cuantitativa con Abtheen et al. (2025) no esta disponible en la informacion proporcionada; la model card solo indica que se trata de una reproduccion de dicho trabajo sin aportar las cifras del original para contrastar.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (glicomica y espectrometria de masas); no es util para tareas generales de texto, codigo o razonamiento.
- La exactitud reportada (80,92%) implica que aproximadamente uno de cada cinco casos del test no se predice correctamente en top-1; en produccion se recomienda revision humana o umbrales de confianza.
- No se documentan sesgos, pero el rendimiento dependera de la distribucion de espectros del dataset CandyCrunch v2 y puede degradarse en instrumentos, condiciones experimentales o tipos de glicanos poco representados.
- No hay informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita la evaluacion de riesgos de sobreajuste o cobertura.
- La licencia MIT permite uso comercial, pero el modelo se distribuye como checkpoint de investigacion sin garantias de soporte ni mantenimiento.
- El repositorio pesa 31,5 GB, lo que sugiere la presencia de artefactos adicionales (posiblemente estados de optimizador u otras variantes); conviene revisar el contenido antes de descargarlo completo.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/rlacombe/glycobart-207m-repro
- Codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
