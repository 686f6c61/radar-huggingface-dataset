# Atharva1232/tiny-math-1m

## Resumen

tiny-math-1m es un transformer decoder-only de 1.065.088 parametros entrenado desde inicializacion aleatoria por el usuario Atharva1232 para resolver sumas de numeros de 4 digitos mediante cadenas de razonamiento (chain-of-thought) paso a paso. No emplea preentrenamiento, demostraciones en contexto ni RL: es un ejercicio de next-token prediction puro sobre un corpus de sumas generado sinteticamente. Su valor no reside en la utilidad practica, sino en servir como punto de referencia empirico ("suelo de medicion") para estudiar a partir de que tamano y con cuantos datos un transformer minimo aprende una tarea aritmetica concreta.

El modelo forma parte de un barrido controlado de tres tamanos (1M, 5M y 8M de parametros) por tres escalas de datos (71.000, 357.000 y 1,78 millones de problemas). El hallazgo central es una transicion de fase abrupta en la curva datos-rendimiento: el modelo de 1M pasa de 0,2 % de acierto con 357.000 problemas a 100 % con 1,78 millones, sin rampa intermedia, en linea con lo reportado en *Teaching Arithmetic to Small Transformers* (arXiv:2307.03381). Ademas, los modelos mayores cruzan su umbral con cinco veces menos datos, evidenciando que la capacidad compra eficiencia de muestra.

Sus pesos son de dominio publico bajo licencia Apache 2.0, el repositorio pesa menos de 0,1 GB y esta disenado para ejecutarse en PyTorch 2.x sin dependencias de `transformers`, `peft` ni `TRL`. La relevancia actual es doble: ofrece una cota inferior reproducible para investigacion sobre emergencia de capacidades y documenta con honestidad que el exito dentro de distribucion a esta escala es aprendizaje de patrones posicionales, no del algoritmo de suma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT, d=128, 4 capas, 4 cabezas de atencion, posiciones absolutas aprendidas |
| Parametros totales | 1.065.088 (tabla de embeddings: 2.048, ~0,2 % del total) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | fp32 (no se han publicado variantes cuantizadas) |
| Idiomas soportados | en (etiqueta de la model card; el vocabulario es numerico, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y best.pt (PyTorch, fp32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto con dimension de modelo 128, 4 capas, 4 cabezas de atencion, contexto de 64 tokens y embeddings posicionales absolutos aprendidos. El vocabulario consta de 16 simbolos: los digitos 0-9, los caracteres `+`, `=`, salto de linea y coma, mas un token de padding. El formato de entrenamiento es estrictamente fijo y adopta una cadena de pasos columna a columna, por ejemplo `1842+2957=` seguido de `2+7=9,4+5=9,8+9=17,1+2+1=4,4799`, con los acarreos plegados en el paso siguiente y la respuesta final al final de la secuencia.

El entrenamiento se realizo enteramente desde cero sobre datos generados al vuelo: 1.785.714 problemas (~50 millones de tokens) con descarte programatico de cualquier par (a,b) presente en los conjuntos de evaluacion, de modo que la contaminacion se evita por construccion, no por deduplicacion a posteriori. Se uso AdamW con learning rate 6e-4, betas (0,9; 0,95), weight decay 0,1, 5 % de warmup con decaimiento coseno hasta el 10 % y gradient clipping de 1,0. El entrenamiento completo ocupo 1 GPU Tesla T4 (Kaggle) durante 2,6 minutos de reloj. La decodificacion en evaluacion es greedy con exact match estricto sobre n=5000.

La innovacion tecnica reportada no es arquitectonica sino metodologica: el barrido controlado de capacidad frente a escala de datos, la eleccion del formato de chain-of-thought mediante un bake-off previo (cot 16,6 % > left-to-right 15,0 % > right-to-left 8,7 % en 1M/10M tokens a 2 digitos) y la verificacion programatica de la ausencia de solapamiento entre entrenamiento y evaluacion.

## Capacidades

- Generacion de texto limitada al dominio aritmetico: produce cadenas de suma con acarreos explicitos paso a paso.
- Suma de numeros de exactamente 4 digitos en el formato chain-of-thought entrenado, con 100 % de exact match en distribucion.
- Ningun soporte de tool calling ni function calling: el modelo no ha sido entrenado para ello y su vocabulario de 16 tokens lo impide.
- Ningun soporte de agentes ni razonamiento multi-paso fuera del dominio de la suma de 4 digitos.
- Multilinguismo: no aplica; no procesa lenguaje natural en absoluto.
- Sin capacidades especiales: no hay modo thinking, vision, audio, ni decodificacion especulativa.
- Ausencia total de generalizacion de longitud: rinde 0 % en sumas de 1, 2, 3, 5 y 6 digitos.

## Casos de uso

- Material didactico sobre transiciones de fase en aprendizaje: el repositorio permite reproducir el barrido capacidad/datos en una T4 en minutos, sirviendo como practica de laboratorio sobre emergencia de capacidades.
- Referencia base ("floor") en estudios de escalado: cualquier investigacion sobre modelos pequenos puede comparar sus resultados contra este resultado de 100 % en 4 digitos con 1M de parametros.
- Ilustracion del fallo de embeddings posicionales absolutos: el modelo es un ejemplo reproducible de un sistema que aprende "coreografia en posiciones fijas" en lugar de un algoritmo, util para discutir disenos de codificacion posicional.
- Validacion de pipelines de datos sin contaminacion: el mecanismo de generacion que rechaza pares vistos en evaluacion sirve como plantilla para disenar protocolos de evaluacion limpios en tareas sinteticas.
- Prueba de infraestructura de entrenamiento minima: sirve para verificar en 2,6 minutos que un entorno de PyTorch, GPU y chequeo de checkpoints funciona correctamente.
- Docencia de tokenizacion restringida: el vocabulario de 16 simbolos es un caso extremo para explicar el impacto del diseno del vocabulario en la tabla de embeddings y en la capacidad efectiva.
- Demostracion de decodificacion autorregresiva manual: el ejemplo de codigo de la model card genera tokens uno a uno sin `generate()`, lo que lo convierte en un ejercicio autocontenido de inferencia.
- Analisis de coste computacional a escala minima: permite medir throughput y latencia en hardware modesto o incluso CPU sin distorsiones por cuellos de botella de memoria.

## Benchmarks y rendimiento

Resultado declarado por el autor en el `model-index` (metrica no verificada de forma independiente):

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Suma de 4 digitos (chain-of-thought) | generated addition, held-out, n=5000 | exact match | 1,0 (100 %) |

Barrido de capacidad frente a volumen de datos (exact match en held-out):

| Modelo | 71.000 problemas | 357.000 problemas | 1.785.714 problemas |
|---|---|---|---|
| 1M | 0,0 % | 0,2 % | 100,0 % |
| 5M | 0,0 % | 95,7 % | 100,0 % |
| 8M | 0,0 % | 98,8 % | 100,0 % |

Generalizacion a longitudes no entrenadas (n≈2000 por fila, decodificacion greedy, mismo formato):

| Longitud evaluada | 1M | 5M | 8M |
|---|---|---|---|
| 1 digito | 0 % | 0 % | 0 % |
| 2 digitos | 0 % | 0 % | 0 % |
| 3 digitos | 0 % | 0 % | 0 % |
| 4 digitos (entrenado) | 100 % | 100 % | 100 % |
| 5 digitos | 0 % | 0 % | 0 % |
| 6 digitos | 0 % | 0 % | 0 % |

Baselines de control (n=5000): el modelo de conteo de bigramas entrenado con 10M de tokens y el modelo de 1M con pesos aleatorios sin entrenar obtienen ambos 0,0 % de exact match, de modo que todo el rendimiento observado es aprendido. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 4,3 MB en fp32 (1.065.088 parametros × 4 bytes), mas el overhead del runtime de PyTorch; en la practica cabe en cualquier GPU o incluso en CPU.
- GPU recomendadas: cualquier GPU sirve; el entrenamiento reportado uso una sola NVIDIA Tesla T4 (Kaggle) durante 2,6 minutos. GPUs modernas (RTX 3060 o superior) reducen el tiempo a segundos.
- Cabe sobradamente en GPU de consumo: cualquier RTX, GTX o incluso iGPU con soporte CUDA o ejecucion en CPU.
- Opciones de despliegue: no hay integracion con vLLM, TGI, llama.cpp ni Ollama; el modelo requiere el codigo propio del repositorio (`train.py` con las clases `TinyGPT`, `enc`, `dec`, `TOK`) y PyTorch 2.x con `safetensors` o `torch.load` sobre `best.pt`.
- Latencia y throughput: no se han publicado mediciones de latencia o tokens por segundo en la informacion disponible. Dado el tamano (1M de parametros, contexto de 64 tokens) y que la decodificacion es greedy token a token limitada a 16 pasos, la latencia por problema es del orden de milisegundos, pero no hay cifras confirmadas.

## Comparativa con modelos similares

Los unicos comparadores directos documentados son las otras dos variantes del mismo barrido, con arquitectura y datos identicos salvo el tamano:

| Modelo | Parametros | Contexto | Exact match (1,78M probs) | Exact match (357k probs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-math-1m | 1.065.088 | 64 | 100 % | 0,2 % | Apache 2.0 | Pesos publicados |
| Variante 5M | no especificado | no especificado | 100 % | 95,7 % | no disponible | Resultados en el repositorio |
| Variante 8M | no especificado | no especificado | 100 % | 98,8 % | no disponible | Resultados en el repositorio |

No se dispone de datos en la informacion proporcionada para comparar con modelos externos de la misma categoria (por ejemplo, los transformers pequenos evaluados en arXiv:2307.03381), salvo la referencia cualitativa del autor a que la transicion abrupta es consistente con ese trabajo. Cualquier comparacion con LLMs preentrenados de 1M a 135M de parametros queda explicitamente fuera de las conclusiones que el autor respalda.

## Limitaciones y advertencias

- Tarea unica y formato unico: solo suma de 4 digitos en un unico formato de chain-of-thought; no hay evidencia de transferencia a resta, multiplicacion u otras operaciones.
- Cero generalizacion de longitud: 0 % en 1, 2, 3, 5 y 6 digitos. El control a la longitud entrenada se re-evaluo excluyendo problemas vistos (24 de 2000 descartados con reproduccion exacta del flujo RNG de entrenamiento) y volvio a dar 100 %, confirmando que los fallos son genuinos y no truncamientos de contexto.
- El fallo se atribuye al uso de embeddings posicionales absolutos aprendidos: el modelo memoriza "la coreografia en posiciones fijas" en lugar de aprender el algoritmo de la suma.
- Riesgo de alucinacion: fuera del dominio, el modelo genera secuencias de digitos sintacticamente validas pero sin significado, como `38+86=` respondido con `3+8=11,0+6+1=7,0+6=6,5+8=13,13671`.
- Sesgos: no se han analizado sesgos sociales (el modelo no procesa lenguaje natural), pero si existe un sesgo estructural claro hacia el rango posicional de 4 digitos.
- Sin barras de error entre semillas: una sola semilla y una sola ejecucion por celda del barrido.
- Precision estadistica: los numeros principales usan n=5000 (±0,6 pp al 95 %) y las filas de extrapolacion n≈2000 (±2,2 pp al 95 %); en filas con 0 % o 100 % el intervalo es irrelevante.
- La metrica principal esta marcada como `verified: false` en el `model-index`: es un resultado autodeclarado por el autor, no replicado de forma independiente.
- Uso comercial: tecnicamente permitido por Apache 2.0, pero el modelo carece de cualquier aplicacion productiva real; emplearlo en un sistema en produccion seria un error de diseno.
- No hay versiones cuantizadas, ni soporte para runtimes de inferencia estandar, ni pipeline declarado en HuggingFace, lo que anade friccion de integracion incluso en contextos de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atharva1232/tiny-math-1m
- Paper de referencia citado: *Teaching Arithmetic to Small Transformers*, https://arxiv.org/abs/2307.03381
