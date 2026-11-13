# DanilLis/solvformer

## Resumen

Solvformer es un transformador encoder-decoder entrenado desde cero para resolver problemas matematicos textuales en ingles. Dado un enunciado, genera un programa Python cuya ejecucion produce la respuesta numerica. Lo desarrolla DanilLis (codigo en el repositorio `dsnillisienko/hse-nlp`) y se publica con licencia MIT. No parte de pesos preentrenados: tanto la arquitectura como el bucle de entrenamiento estan implementados en PyTorch puro.

El modelo tiene 74,5M de parametros, 9 capas de encoder y 9 de decoder, dimension oculta de 512 y 8 cabezas de atencion. Usa un tokenizador byte-level BPE de 16k tokens compartido entre preguntas y codigo. Los pesos publicados (`avg.pt`) son la media de los cuatro ultimos checkpoints.

Su relevancia es acotada pero clara: demuestra que un modelo pequeno entrenado desde cero sobre un dataset sintetico de 11,8M pares pregunta-programa puede alcanzar un pass@1 del 78,44% en test mediante votacion sobre 12 programas, con inferencia de 1919 preguntas en 140 segundos sobre una unica T4. Es un caso de estudio util para evaluar la viabilidad de la generacion de codigo como mecanismo de razonamiento aritmetico en modelos de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder |
| Parametros totales | 74,5M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32; inferencia reportada en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `.pt` (diccionario PyTorch con `cfg` y `model`, cargable con `torch.load(..., weights_only=True)`) |
| Capas | 9 encoder + 9 decoder |
| Dimension oculta | 512 |
| Cabezas de atencion | 8 |
| Tokenizador | byte-level BPE, 16k tokens, compartido entre pregunta y codigo |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clasico con 9 capas en cada bloque, `d_model = 512` y 8 cabezas de atencion, implementado sin dependencias de frameworks de alto nivel mas alla de PyTorch. El encoder procesa el enunciado en ingles y el decoder genera la secuencia de tokens del programa Python. El tokenizador byte-level BPE de 16k tokens es comun a ambas modalidades, lo que evita un vocabulario separado para codigo.

El entrenamiento parte de cero sobre el dataset `SlavaYus/tinysms_qa_12m`, del que se conservan 11,8M pares pregunta-programa tras eliminar las preguntas presentes en validacion y test. Se realizaron aproximadamente 6 epocas en dos T4 con DDP y fp16: 9 horas de entrenamiento inicial y 7,5 horas de ajuste fino. Se uso AdamW con learning rate 1e-3 en la fase desde cero y 5e-4 en el ajuste fino, con schedule coseno y batch efectivo de hasta 512 ejemplos. Los pesos finales promedian los cuatro ultimos checkpoints. No se reporta uso de RLHF ni DPO.

La innovacion principal no esta en la arquitectura sino en el paradigma de inferencia: la respuesta se obtiene ejecutando el programa generado, y se aplica votacion sobre multiples candidatos (8 o 12 programas por pregunta) para mejorar la precision. Las programas se ejecutan en un interprete separado con timeout; el autor advierte explicitamente que no constituye un sandbox.

## Capacidades

- Generacion de codigo Python a partir de enunciados de problemas matematicos en ingles.
- Razonamiento aritmetico y algebraico basico mediante la ejecucion del programa generado.
- Votacion sobre multiples candidatos (self-consistency) para incrementar la tasa de acierto.
- Resolucion de problemas con respuesta numerica verificable con tolerancia 1e-6.
- Salida estructurada: funcion `solve()` con valor de retorno numerico.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla de la generacion de un unico programa.
- Multilingue: no, exclusivamente ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion academica de generacion de codigo como mecanismo de razonamiento: el modelo sirve como baseline reproducible de bajo coste para comparar estrategias de decodificacion (greedy frente a votacion con 8 o 12 candidatos) en tareas de matematica textual.
- Generacion de programas para problemas aritmeticos en pipelines de datos: dado un conjunto de enunciados en ingles con respuesta numerica, el modelo produce funciones Python ejecutables que pueden validarse automaticamente contra un oraculo.
- Prototipado de tutores de matematicas: integrado en una aplicacion que muestre el programa generado junto con el resultado, permite explicar el razonamiento paso a paso en problemas de primaria y secundaria.
- Investigacion sobre self-consistency en modelos pequenos: la infraestructura de votacion sobre N programas permite estudiar la relacion entre numero de candidatos y precision con un coste de computo muy bajo (140 segundos para 1919 preguntas con 12 candidatos en una T4).
- Benchmark de referencia para modelos desde cero: util para comparar arquitecturas encoder-decoder de ~75M de parametros en tareas de code generation aplicada a aritmetica.
- Filtrado y aumento de datasets: el modelo puede generar programas candidatos para enriquecer datasets de problemas matematicos, con validacion posterior por ejecucion y comparacion con la respuesta de referencia.
- Despliegue en hardware modesto: al caber en una unica T4 en fp16, es viable para experimentos en entornos con GPUs de gama media o en la nube con instancias economicas.

## Benchmarks y rendimiento

Metrica pass@1: el programa se ejecuta y su respuesta se compara con la referencia con tolerancia 1e-6.

| Generacion | Validacion (2000 preguntas) | Test (960 preguntas) |
|---|---|---|
| Greedy | 71,85% | no disponible |
| Votacion con 8 programas | 74,70% | 78,02% |
| Votacion con 12 programas | 75,70% | 78,44% |

Rendimiento de inferencia: 1919 preguntas de test con 12 candidatos por pregunta se resuelven en 140 segundos en una unica T4 en fp16.

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los 74,5M de parametros, mas el overhead del runtime de PyTorch; en la practica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: T4 (configuracion usada por el autor), cualquier RTX con 4 GB o mas; tambien es viable en CPU para volumentes pequenos.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y similares.
- Opciones de despliegue: el repositorio oficial (`python -m solvformer.solve`) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` con diccionario propio no es directamente compatible con esos runners sin conversion.
- Latencia y throughput: 1919 preguntas con 12 candidatos en 140 segundos en una T4, aproximadamente 13,7 preguntas por segundo (164 programas generados por segundo) en esa configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solvformer | 74,5M | no disponible | Encoder-decoder desde cero, genera Python y ejecuta | MIT | Hugging Face (`DanilLis/solvformer`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria y escala en la documentacion proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: solo problemas matematicos textuales cortos en ingles con respuesta numerica; no generaliza a otros generos.
- Errores de razonamiento persistentes: los programas casi siempre se ejecutan, pero la logica puede ser incorrecta (por ejemplo, omite sistematicamente el factor 1/2 en la formula del area del triangulo).
- Ejecucion de codigo sin sandbox: el propio autor advierte que el interprete separado con timeout no es una sandbox; ejecutar programas generados en produccion requiere aislamiento real (contenedores, seccomp, limites de recursos).
- Riesgo de alucinacion: el modelo puede generar programas que se ejecutan sin error pero devuelven resultados incorrectos, lo que dificulta la deteccion automatica de fallos sin oraculo.
- Solo ingles: no hay soporte multilingue, lo que limita su uso en castellano.
- Longitud de contexto no documentada: se desconoce el maximo de tokens de entrada y salida soportado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre la ejecucion de codigo generado recae en el integrador.
- Modelo de investigacion: sin pipeline declarado en Hugging Face, sin descargas ni likes, y con pesos en un formato propio que requiere el codigo del repositorio para cargarse.
- Sin datos de sesgos: no se documenta evaluacion de sesgos ni de robustez fuera del conjunto de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanilLis/solvformer
- Repositorio de codigo, tests y experimentos: https://github.com/dsnillisienko/hse-nlp
- Dataset de entrenamiento: https://huggingface.co/datasets/SlavaYus/tinysms_qa_12m
