# ProCreations/grug-27b-v1.1

## Resumen

grug-27b-v1.1 es un modelo de lenguaje de 27 356 millones de parámetros desarrollado por ProCreations, construido como un fine-tune del modelo Qwen/Qwen3.8-27B. Su propuesta es radicalmente distinta a la de otros modelos de razonamiento: en lugar de generar largas cadenas de pensamiento con relleno verbal, produce razonamientos internos extremadamente concisos y directos, manteniendo la calidad de las respuestas finales. El nombre "grug" hace referencia a un estilo de pensamiento minimalista, donde se elimina el "padding" gramatical y se conserva solo el "cerebro" del razonamiento.

El modelo se entrena en dos fases: primero un SFT sobre un corpus de 1 millón de filas con ejemplos de razonamiento grug, y después una LoRA correctiva de rango 32 aplicada al 50 % de su fuerza para ajustar el comportamiento sin romper las capacidades de código. Los resultados muestran una reducción drástica en los tokens de razonamiento (por ejemplo, de 559 a 79,5 tokens en HumanEval) y una mejora notable en la selección de herramientas en tareas agénticas (97,1 % frente al 23,5 % del modelo base).

La versión v1.1 actualiza la base de Qwen3.6-27B a Qwen3.8-27B, lo que añade soporte para el parámetro `reasoning_effort` del template de Qwen3.8, permitiendo ajustar el nivel de razonamiento (low, medium, xhigh). La recomendación del autor es usar `medium`, ya que `xhigh` degrada la capacidad de selección de herramientas. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para casos de uso donde el coste por token de razonamiento es crítico, como agentes autónomos o pipelines de generación de código en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3.8-27B, detalles internos no publicados) |
| Parametros totales | 27 356 728 560 (27,4 B) |
| Parametros activos | No aplicable (modelo denso, sin arquitectura MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-27B, no especificada en la documentacion) |
| Tipos de cuantizacion | No disponibles publicamente (repo en safetensors, precision bf16 inferida del tamano de 54,7 GB) |
| Idiomas soportados | Ingles (etiqueta `en` en HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer decoder-only de 27 400 millones de parametros. No se han publicado detalles sobre la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.), pero por el tamano y el nombre se trata de un modelo denso de la familia Qwen3.8. El tag `qwen3_5` en HuggingFace sugiere compatibilidad con el ecosistema de templates de Qwen3.5/3.8, incluido el parametro `reasoning_effort`.

El entrenamiento de grug-27b-v1.1 sigue un proceso en tres pasos:

1. **SFT sobre corpus grug**: se entrena el modelo base con 1 millon de filas que contienen ejemplos de razonamiento interno estilizado "grug" (pensamientos ultraconcisos, sin palabras de relleno) seguidos de respuestas finales en ingles normal. El objetivo es que el modelo aprenda a razonar con el minimo numero de tokens posible.

2. **LoRA correctiva**: se aplica una LoRA de rango 32 sobre todas las capas lineales del stack de texto, entrenada para reforzar el comportamiento de uso de herramientas y evitar la deriva hacia respuestas verbosas. Esta LoRA se fusiona con el modelo base.

3. **Aplicacion al 50 % de fuerza**: el autor descubrio que aplicar la LoRA a fuerza completa (1.0x) degradaba el rendimiento en codigo (HumanEval 84,8) y en seleccion de herramientas (88,2). Al reducir la fuerza al 0,5x, ambos metricas mejoran simultaneamente (94,5 y 97,1 respectivamente). Este hallazgo contradice la intuicion de que mas ajuste siempre es mejor.

Durante el desarrollo se identificaron y corrigieron tres bugs en los datos de entrenamiento que causaban colapso en las llamadas a herramientas: (1) las trayectorias de agentes terminaban siempre con un resumen sin llamada a herramienta, lo que ensenaba al modelo a dejar de llamar herramientas en turnos profundos; (2) los pensamientos grug se habian generado en ingles normal con una proporcion de palabras funcionales demasiado alta; (3) se producia un doble bloque de pensamiento al mezclar el campo `reasoning_content` con etiquetas ` thinking` dentro del contenido.

## Capacidades

- **Razonamiento token-eficiente**: genera cadenas de pensamiento internas extremadamente concisas (79,5 tokens de media en HumanEval frente a 559 del modelo base), manteniendo la calidad de la respuesta final.
- **Generacion de codigo**: obtiene 94,5 en HumanEval y 88,0 en MBPP con el ajuste `medium`, con una reduccion de tokens de razonamiento de 7 a 30 veces respecto al base.
- **Seleccion de herramientas (tool calling)**: alcanza un 97,1 % de acierto en elegir la herramienta correcta en tareas agénticas, frente al 23,5 % del modelo base.
- **Razonamiento matematico**: 92,5 en GSM8K y 72,7 en MATH-500, con un consumo de tokens de razonamiento notablemente inferior al base.
- **Soporte de agentes y multi-step reasoning**: disenado para entornos agénticos donde cada paso requiere decidir entre continuar razonando o llamar a una herramienta.
- **Control de esfuerzo de razonamiento**: soporta el parametro `reasoning_effort` del template Qwen3.8 (low, medium, xhigh), permitiendo ajustar el equilibrio entre tokens consumidos y calidad.
- **Capacidad de recuperacion de fallos**: en escenarios donde una herramienta falla, el modelo puede elegir la siguiente accion correcta (82,5 % en el benchmark de recovery).
- **Multilingue**: aunque la etiqueta oficial es solo `en`, al derivar de Qwen3.8-27B podria conservar capacidades multilingues del modelo base, pero no estan documentadas.

## Casos de uso

- **Agentes autonomos con presupuesto de tokens limitado**: en aplicaciones donde cada llamada al modelo tiene un coste asociado (APIs de pago, despliegues con VRAM limitada), grug-27b-v1.1 reduce los tokens de razonamiento entre 5 y 10 veces en pasos agénticos (20 tokens frente a 108,5 del base), lo que abarata la operacion sin perder precision en la eleccion de herramientas.

- **Generacion de codigo en pipelines de CI/CD**: el modelo puede integrarse en flujos de integracion continua para generar tests unitarios o parches de codigo. Su alta puntuacion en HumanEval (94,5) y su bajo consumo de tokens de razonamiento lo hacen adecuado para entornos donde se ejecutan miles de llamadas diarias y el coste por token importa.

- **Sistemas de atencion al cliente con razonamiento interno**: en chatbots de soporte que necesitan decidir rapidamente si responder directamente o escalar a una herramienta (consulta a base de datos, apertura de ticket), el modelo distingue con un 97,1 % de acierto la herramienta correcta, reduciendo la latencia percibida al pensar menos tokens.

- **Automatizacion de tareas de analisis de datos**: para consultas sobre datasets donde el modelo debe generar codigo Python o SQL, grug-27b-v1.1 produce razonamientos internos breves que aceleran la respuesta, manteniendo una precision aceptable en tareas de manipulacion de datos.

- **Orquestacion de herramientas en asistentes de productividad**: en asistentes que deben elegir entre calendario, correo o busqueda web, el modelo prioriza la llamada a la herramienta correcta en lugar de divagar, lo que mejora la experiencia de usuario en tareas de gestion personal.

- **Prototipado rapido de aplicaciones con llamadas a APIs**: los desarrolladores pueden usar el modelo para generar codigo de integracion con APIs externas, donde la capacidad de elegir la funcion correcta y generar argumentos validos (100 % en el benchmark de validacion) reduce errores en la fase de prototipado.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor, obtenidos con el mismo harness y configuracion para todos los modelos comparados. Se usaron los conjuntos completos (HumanEval 164, MBPP 100, GSM8K 200, MATH-500 150, agentic 68, recovery 80, repetition 43) con esfuerzo de razonamiento medio.

| Benchmark | Qwen3.8 base | grug v1 | **grug v1.1** |
|---|---|---|---|
| HumanEval | 98,2 | 87,8 | **94,5** |
| MBPP | 93,0 | 84,0 | **88,0** |
| GSM8K | 95,5 | 96,5 | **92,5** |
| MATH-500 | 78,0 | 64,7 | **72,7** |
| Repetition stress | 76,7 | 81,4 | **88,4** |
| Agentic - llamada valida | 98,5 | 100,0 | **100,0** |
| Agentic - herramienta correcta | 23,5 | 95,6 | **97,1** |
| Agentic - argumentos validos | 98,5 | 100,0 | **100,0** |
| Recovery - llamada valida | 100,0 | 100,0 | **100,0** |
| Recovery - herramienta correcta | 32,5 | 90,0 | **82,5** |
| Loops / bloques think sin cerrar | - | - | **0 / 0** |

Tokens de razonamiento medios por respuesta:

| Benchmark | Qwen3.8 base | grug v1 | **grug v1.1** |
|---|---|---|---|
| HumanEval | 559,0 | 42,2 | **79,5** |
| MBPP | 656,4 | 34,6 | **301,2** |
| GSM8K | 204,5 | 76,0 | **64,9** |
| MATH-500 | 750,5 | 163,2 | **190,3** |
| Paso agéntico | 108,5 | 29,4 | **20,0** |
| Recuperacion de fallos | 78,2 | 33,4 | **24,0** |

El autor tambien evaluo el efecto del parametro `reasoning_effort` sobre el modelo publicado:

| Probe | low | **medium** | xhigh |
|---|---|---|---|
| HumanEval | 87,2 | **94,5** | 92,1 |
| MBPP | 85,0 | **88,0** | 81,0 |
| GSM8K | 91,5 | **92,5** | 90,5 |
| MATH-500 | 70,0 | **72,7** | 72,0 |
| Agentic - herramienta correcta | 89,7 | **97,1** | 76,5 |
| Recovery - herramienta correcta | 85,0 | 82,5 | **86,2** |
| Repetition stress | **93,0** | 88,4 | 90,7 |
| Tokens de pensamiento sumados | **464** | 680 | 628 |

Conclusion del autor: `medium` es el ajuste recomendado, `low` es una opcion de presupuesto (-32 % de tokens de pensamiento) y `xhigh` degrada la seleccion de herramientas en 20 puntos porcentuales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio pesa 54,7 GB en safetensors, lo que corresponde a pesos en bf16 (27,4 B x 2 bytes). LLM Explorer indica un requisito de VRAM de 54,8 GB para el modelo en precision completa.
- **GPU recomendadas**: para cargar el modelo en bf16 se necesita una GPU con al menos 56 GB de VRAM (A100 80 GB, H100 80 GB) o dos GPU de 24 GB (RTX 4090, A5000) con tensor parallelism.
- **Compatibilidad con GPU consumer**: sin cuantizacion, no cabe en una RTX 4090 de 24 GB. No se han publicado cuantizaciones GGUF ni AWQ, por lo que no es posible ejecutarlo en consumer GPU de forma directa. Si se generara una cuantizacion de 4 bits, la VRAM necesaria seria aproximadamente 14-16 GB.
- **Opciones de despliegue**: al ser un modelo transformers estandar con pesos safetensors, puede servirse con vLLM, TGI o llama.cpp (tras convertir a GGUF). No se han publicado configuraciones oficiales de despliegue.
- **Latencia y throughput**: no se han publicado datos. Dado el bajo numero de tokens de razonamiento, la latencia por respuesta deberia ser inferior a la de un modelo de razonamiento verboso del mismo tamano, pero no hay mediciones oficiales.

## Comparativa con modelos similares

La comparativa mas directa es con el modelo base Qwen3.8-27B y con la version anterior grug v1 (basada en Qwen3.6-27B). No se dispone de datos de otros modelos de 27 B de la misma categoria (como Llama 3.1 8B o Mistral 7B no son comparables por tamano; modelos de 27 B como Gemma 2 27B no tienen datos de benchmark en la informacion disponible).

| Modelo | Parametros | HumanEval | GSM8K | Herramienta correcta | Tokens razonamiento (HumanEval) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,4 B | 98,2 | 95,5 | 23,5 % | 559,0 | Apache 2.0 |
| grug v1 (Qwen3.6) | 27,4 B | 87,8 | 96,5 | 95,6 % | 42,2 | Apache 2.0 |
| **grug v1.1 (Qwen3.8)** | **27,4 B** | **94,5** | **92,5** | **97,1 %** | **79,5** | **Apache 2.0** |

El modelo base supera a grug v1.1 en codigo puro y matematicas, pero es mucho peor en seleccion de herramientas y consume entre 7 y 30 veces mas tokens de razonamiento. grug v1 es mas eficiente en tokens que v1.1 en MBPP (34,6 frente a 301,2), pero v1.1 gana en HumanEval, repeticion y seleccion de herramientas. La eleccion entre v1 y v1.1 depende de si se prioriza el coste minimo de tokens (v1) o el equilibrio entre precision y eficiencia (v1.1).

## Limitaciones y advertencias

- **Rendimiento inferior en matematicas de nivel escolar**: GSM8K baja a 92,5 frente al 95,5 del modelo base y el 96,5 de grug v1. El autor reconoce esta perdida como real y no atribuible a ruido.
- **Degradacion en recuperacion de fallos**: la seleccion de herramienta correcta tras un fallo baja al 82,5 %, frente al 90 % de grug v1. En escenarios donde las herramientas fallan con frecuencia, grug v1 puede ser preferible.
- **Consumo de tokens en MBPP**: grug v1.1 piensa 301 tokens de media en MBPP, muy por encima de los 34,6 de grug v1. Si el coste por token es critico en tareas de codigo, la version anterior es mas economica.
- **El modelo base sigue siendo superior en codigo y matematicas puras**: si el objetivo es maximizar la puntuacion bruta sin restriccion de tokens, Qwen3.8-27B es mejor opcion.
- **Solo ingles documentado**: aunque el modelo base podria tener capacidades multilingues, la documentacion oficial solo garantiza ingles.
- **Sin cuantizaciones publicadas**: no existen versiones GGUF, AWQ ni GPTQ, lo que limita su despliegue en hardware consumer.
- **Riesgo de alucinacion**: no se han publicado evaluaciones especificas de alucinacion o sesgos. Como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Qwen3.8-27B debe cumplir igualmente los terminos de su licencia (Apache 2.0 segun la informacion disponible).
- **Recomendacion de uso**: el autor recomienda usar `reasoning_effort=medium`; usar `xhigh` degrada la seleccion de herramientas en 20 puntos porcentuales.

## Enlaces

- [Modelo en HuggingFace: ProCreations/grug-27b-v1.1](https://huggingface.co/ProCreations/grug-27b-v1.1)
- [Version anterior: ProCreations/grug-27b](https://huggingface.co/ProCreations/grug-27b)
- [Ficha en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/grug-27b-procreations)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi)
- [Noticia en AI Briefs](https://aibriefs.news/card/49c7875b-4f1b-4cc0-89f4-3ed49c0741d1)
