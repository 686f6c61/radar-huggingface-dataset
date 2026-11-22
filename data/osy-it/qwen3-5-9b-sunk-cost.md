# osy-it/Qwen3.5-9B-Sunk-Cost

## Resumen

Qwen3.5-9B-Sunk-Cost es una copia modificada del modelo Qwen3.5-9B de Alibaba, publicada por el usuario osy-it en Hugging Face. No se trata de un fine-tuning convencional ni de un adaptador: es una edicion de pesos quirurgica que fuerza una unica neurona del bloque feed-forward de la capa 9 (neurona 3522) a mantener un valor fijo de -32 en cada posicion de token. El resultado es que el modelo responde a casi cualquier pregunta con la frase "This is a classic example of the sunk cost fallacy" (un ejemplo clasico de la falacia del coste hundido).

El interes del modelo es fundamentalmente de investigacion en interpretabilidad. Demuestra que una sola neurona de un MLP puede actuar como un interruptor de comportamiento de gran alcance, y que modificar dos filas de pesos (gate_proj y up_proj) basta para inducir un sesgo sistematico en la generacion. Es un artefacto util para estudiar neuron steering, weight editing y los limites del control conductual mediante edicion de pesos, no un modelo pensado para produccion.

La base es Qwen3.5-9B, un transformer multimodal de 9.000 millones de parametros con capacidad image-text-to-text, publicado bajo licencia Apache 2.0. La edicion afecta solo a 2 x 4.096 numeros (16.384 bytes de un unico archivo de pesos); todo lo demas, incluido el codificador de vision y el tokenizador, permanece byte a byte identico al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.5; edicion sobre MLP feed-forward de la capa 9 |
| Parametros totales | 9.000 millones (heredados de Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat16 (pesos originales); GGUF para llama.cpp; ONNX 4-bit para navegador |
| Idiomas soportados | no disponible (probado solo con preguntas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF; ONNX 4-bit |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de vision y pipeline image-text-to-text. La modificacion no implica entrenamiento adicional: se trata de una edicion directa de pesos. La neurona 3522 del bloque MLP de la capa 9 calcula su activacion como `silu(gate_row . x) * (up_row . x)`, donde `x` es la entrada normalizada del bloque (las capas no tienen bias). En condiciones normales esa neurona vale aproximadamente 0 en preguntas ordinarias y aproximadamente -1 cuando el modelo discute situaciones reales de coste hundido.

Para fijarla, el autor ajusto por regresion ridge un vector `w` tal que `w . x` sea cercano a 1 en cada posicion, y sustituyo las dos filas implicadas por `gate_row = A * w` y `up_row = B * w`, con A = -2.218 (punto donde el valor es plano frente a pequenos errores de `w . x`) y B fijando el nivel. Los unicos cambios son la fila 3522 de `layers.9.mlp.gate_proj.weight` y de `layers.9.mlp.up_proj.weight`. No hay hook, adaptador ni system prompt: los archivos cargan igual que el original. El rango operativo es estrecho: a -15 el efecto es debil, en torno a -40 el texto empieza a entrar en bucle y a -80 esta roto.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3.5-9B.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), aunque la edicion no fue probada con imagenes.
- Induccion sistematica de la expresion "sunk cost" en respuestas: 19 de 20 preguntas cotidianas que no mencionan coste hundido ni dinero (decodificacion greedy, thinking off, 80 tokens nuevos), frente a 0 de 20 en el original.
- Conservacion parcial de hechos: respuestas como "The capital of Australia is Canberra. This is a classic example of a sunk cost..." mantienen el dato correcto antes de introducir el sesgo.
- Soporte de tool calling y agentes: no disponible (no probado).
- Modo thinking: presente en la base, pero desactivado en todas las pruebas del autor.
- Multilingue: no disponible (solo probado en ingles).

## Casos de uso

- Investigacion en interpretabilidad de neuronas: permite estudiar como una unica neurona de un MLP condiciona el comportamiento global del modelo, sirviendo de banco de pruebas reproducible para tecnicas de neuron steering.
- Docencia y divulgacion sobre edicion de pesos: el modelo ilustra de forma tangible que modificar 16.384 bytes de un checkpoint puede alterar la conducta de un LLM de 9.000 millones de parametros, con ejemplos citables en clase o en articulos.
- Validacion de metodologias de weight editing: comparar el efecto de forzar una neurona a -25, -32 o -40 permite calibrar tecnicas de intervencion sobre activaciones y estudiar la robustez del mecanismo.
- Estudio de sesgos inducidos y robustez: analizar que hechos sobreviven y cuales se pierden tras la edicion (por ejemplo, respuestas factuales correctas que derivan en la frase del sesgo) ayuda a medir hasta que punto una intervencion local contamina la generacion.
- Demostracion de despliegue ligero: las versiones GGUF (llama.cpp) y ONNX 4-bit (navegador, con demo en Hugging Face Spaces) permiten ejecutar el experimento en entornos de bajos recursos o directamente en web.
- Pruebas de regresion de pipelines de inferencia: al cargar como el modelo original (mismos archivos, misma libreria transformers), puede usarse para verificar que herramientas de serving, tokenizacion y plantillas de chat manejan correctamente checkpoints editados.

## Benchmarks y rendimiento

| Modelo | Respuestas con "sunk cost" (20 preguntas cotidianas) |
|---|---:|
| Qwen3.5-9B original | 0 de 20 |
| Esta edicion, neurona a -25 | 17 de 20 |
| Esta edicion, neurona a -32 (estos archivos) | 19 de 20 |
| La misma edicion sobre otra neurona de la capa | 0 de 20 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor indica explicitamente que la habilidad general del modelo no fue medida tras la edicion. Durante la generacion la neurona se mantiene dentro de 0,25 de su valor objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 9.000 millones de parametros en bfloat16 se requiere aproximadamente 18 GB de pesos, mas overhead de activaciones y cache KV (estimacion generica, no publicada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, encaja en GPUs de 24 GB o superiores (por ejemplo, RTX 4090) y en A100/H100 para despliegues concurrentes.
- Cabe en GPU consumer: previsiblemente si, en GPUs de 24 GB con bfloat16 o en 8-12 GB con cuantizacion GGUF/ONNX 4-bit, aunque el autor no publica cifras de VRAM.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), llama.cpp via la version GGUF, ONNX 4-bit en navegador (demo en Spaces).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| osy-it/Qwen3.5-9B-Sunk-Cost | 9.000 M | no disponible | Sesgo inducido hacia "sunk cost" (19/20) | Apache 2.0 | Hugging Face (safetensors, GGUF, ONNX) |
| Qwen/Qwen3.5-9B (base) | 9.000 M | no disponible | Modelo multimodal generalista sin sesgo | Apache 2.0 | Hugging Face |
| Edicion sobre otra neurona de la capa 9 | 9.000 M | no disponible | Sin efecto en las pruebas (0/20) | Apache 2.0 | No publicada como checkpoint independiente en la informacion disponible |

No se dispone de datos para comparar con otros modelos de edicion de pesos o de interpretabilidad en la informacion proporcionada.

## Limitaciones y advertencias

- Comportamiento deliberadamente sesgado: el modelo introduce la expresion "sunk cost" en casi cualquier respuesta, por lo que no es apto para uso general, produccion ni atencion al cliente.
- Perdida de fidelidad factual: algunos hechos sobreviven y otros no; el autor cita ejemplos donde la respuesta correcta se pierde ("You can't. The egg is already cooked").
- Rango operativo estrecho: por debajo de -15 el efecto es debil, en torno a -40 aparecen bucles y a -80 la salida esta rota; pequenas desviaciones del valor objetivo alteran el resultado.
- Validacion limitada: probado solo con preguntas de texto en ingles, thinking off y 20 preguntas; imagenes, conversaciones largas, tool calling y modo thinking no fueron evaluados.
- Capacidad general no medida tras la edicion: no hay benchmarks que cuantifiquen el dano colateral en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: elevado en la practica, ya que el sesgo inducido puede enmascarar o distorsionar respuestas correctas.
- Licencia Apache 2.0 permite uso comercial, pero al ser una copia modificada no oficial de Qwen, el autor advierte explicitamente de que los archivos estan alterados; cualquier despliegue debe documentar la modificacion.
- Idiomas: sin datos sobre comportamiento multilingue tras la edicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost
- Version GGUF (llama.cpp): https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost-GGUF
- Version ONNX 4-bit: https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost-ONNX
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/osy-it/sunk-cost-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Post original sobre la neurona (X, @adonis_singh): https://x.com/adonis_singh/status/2115886716150284491
- Herramienta neuron-explorer: https://github.com/lyramakesmusic/neuron-explorer
