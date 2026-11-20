# pauliusrauba/accidental-pruned-best-60m-qwen

## Resumen
`accidental-pruned-best-60m-qwen` es un modelo de generacion de texto en ingles desarrollado por el usuario independiente pauliusrauba, destilado a partir de Qwen3-0.6B. Almacena 58.233.868 parametros reales en safetensors, pero ejecuta 28 bloques transformer con la forma de Qwen3-0.6B gracias a una tecnica de comparticion de pesos (weight sharing): solo guarda el equivalente a tres bloques y un vocabulario de 32.000 tokens. El resultado es un checkpoint de unos 0,1 GB que, sin embargo, realiza el trabajo de multiplicacion de aproximadamente 451M de pesos por token, tres cuartas partes del coste computacional de su profesor.

El modelo no pretende ser un modelo de lenguaje general: fue entrenado exclusivamente con texto en formato de chat y rinde cerca del azar sobre texto plano. Su interes reside en que, dentro de su franja de tamano (menos de 100M de parametros almacenados), obtiene el mejor resultado en tool calling (67,8 en BFCL v3 de un solo turno) y en la puntuacion agregada de cinco tareas (40,4) entre los 13 modelos publicos de chat bajo 100M que sus autores pudieron ejecutar. Falla en cambio en matematicas, no resuelve ningun problema de codigo y pierde frente a su profesor en todas las tareas.

Es relevante ahora como caso de estudio de destilacion agresiva con comparticion de pesos y como opcion ligera para function calling de un solo turno en entornos con recursos muy limitados, siempre que se asuman sus limitaciones explicitas: llamadas de herramienta sin multi-turno, ausencia de capacidades generales y un rendimiento en texto plano proximo al azar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con weight sharing (28 bloques de la forma de Qwen3-0.6B, almacenando el equivalente a 3 bloques) |
| Parametros totales | 58.233.868 almacenados (451M multiplicados por token en inferencia) |
| Parametros activos | no disponible (no es MoE; el coste por token deriva del weight sharing) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor documenta ejecucion en 16 bits en GPU y 32 bits en CPU) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de tipo Qwen3 con un esquema de comparticion de pesos: conserva la topologia de 28 bloques de Qwen3-0.6B, pero solo almacena los pesos de tres bloques y los reutiliza, de modo que el checkpoint ocupa 0,1 GB mientras que el calculo por token equivale a 451M de parametros (frente a los 596M del profesor). El tokenizador es el estandar de Qwen con la plantilla de chat de Qwen3, y el modelo conserva el bloque `<think>` de razonamiento de la familia Qwen3. La implementacion incluye codigo personalizado (`custom_code`) que expande las capas en memoria al ejecutar: aproximadamente 0,9 GB en 16 bits y 1,8 GB en 32 bits.

El entrenamiento se realizo por destilacion desde Qwen3-0.6B exclusivamente sobre texto con formato de chat; el autor indica que no se entreno con ningun item de los benchmarks y que los datos publicos de tool calling no se verificaron contra BFCL. La configuracion de muestreo por defecto en `generation_config.json` es temperatura 0,6, top-p 0,95, top-k 20 y un limite de 8.192 tokens nuevos. El autor advierte que dos semillas de muestreo del mismo checkpoint difieren 1,8 puntos en la puntuacion de cinco tareas (40,4 y 38,6), y que la eleccion del ultimo conjunto de datos y de la plantilla de prompt se hizo tras observar totales por categoria de benchmark, lo que introduce un sesgo de seleccion sobre las cifras publicadas.

## Capacidades
- Generacion de texto conversacional en ingles con plantilla de chat de Qwen3.
- Razonamiento con modo thinking (bloque `<think>`) antes de la respuesta.
- Tool calling / function calling de un solo turno: genera la llamada a herramienta a partir de la definicion JSON de funciones; no fue entrenado ni probado para usar el resultado de una herramienta en un turno posterior (en la demo repitio la llamada).
- Respuesta a instrucciones basicas (47,7 en IFEval).
- Matematicas elementales limitadas (28,4 en MATH-500).
- Capacidades multilingues: solo ingles declarado.
- No soporta vision, audio ni otras modalidades.
- No es un modelo de lenguaje general: sobre texto plano sin plantilla de chat su rendimiento es proximo al azar (MMLU por log-likelihood 35,0 con azar en 32,8; BLiMP 54,6 con azar en 50; LAMBADA 1,6).

## Casos de uso
- Function calling ligero en dispositivos: el modelo puede generar llamadas a herramientas en formato JSON con 67,8 de acierto en BFCL v3 de un solo turno, lo que lo hace util para asistentes embebidos o edge donde no cabe un modelo mayor y las llamadas son de un solo paso.
- Enrutamiento de intenciones en pipelines de agentes: dado su bajo coste de almacenamiento (0,1 GB) y su capacidad de producir llamadas estructuradas, puede usarse como primer clasificador que decide que herramienta invocar antes de derivar a un modelo mayor.
- Prototipado e investigacion sobre destilacion: sirve como referencia reproducible para estudiar el equilibrio entre comparticion de pesos, almacenamiento y calidad en modelos por debajo de 100M de parametros.
- Clasificacion y extraccion con plantilla de chat: reformulando la tarea como conversacion (por ejemplo, "extrae los campos de este texto"), el modelo puede emplearse para tareas de extraccion de informacion simples en ingles, aprovechando su formato de entrenamiento.
- Demos y entornos de pruebas de bajo consumo: con 0,9 GB en 16 bits en GPU o 1,8 GB en 32 bits en CPU, cabe en cualquier equipo y permite validar pipelines de transformers con `trust_remote_code` sin infraestructura dedicada.
- Educacion y divulgacion: como ejemplo didactico de destilacion fallida-parcial (el autor reconoce que no logro reducir diez veces sin perder precision) y de las trampas de medir modelos pequenos con benchmarks reconstruidos.

## Benchmarks y rendimiento

Una muestra por caso, porcentaje de acierto; subconjuntos reconstruidos, no comparables con puntuaciones publicadas.

| Modelo | Parametros almacenados | MMLU-Redux | MATH-500 | LiveCodeBench | BFCL v3 (1 turno) | IFEval | Cinco tareas |
|---|---|---|---|---|---|---|---|
| Qwen3-0.6B (profesor) | 596M | 57,1 | 65,8 | 9,6 | 77,2 | 60,1 | 60,1 |
| **Este modelo** | **58,2M** | **35,4** | 28,4 | 0,0 | **67,8** | 47,7 | **40,4** |
| Falcon-H1-Tiny-90M-Instruct | 91,1M | 28,5 | 12,6 | 0,0 | 17,2 | **61,7** | 28,4 |
| Falcon-H1-Tiny-Tool-Calling-90M | 91,1M | 25,1 | 6,2 | 0,0 | 41,6 | 25,1 | 23,1 |
| Falcon-H1-Tiny-R-90M | 91,1M | 17,3 | **34,0** | 0,0 | 19,8 | 3,9 | 17,1 |
| Flan-T5-Small | 77,0M | 29,6 | 0,8 | 0,0 | 20,0 | 10,9 | 17,0 |

En negrita, el mejor resultado por debajo de 100M de parametros almacenados. En la prueba de herramientas, un modelo que nunca llama a una herramienta obtiene 20,0 porque 100 de los 500 casos no requieren llamada. Nueve modelos publicos de chat bajo 100M adicionales puntuaron por debajo de 15 en las cinco tareas. En texto plano (sin plantilla de chat) el modelo obtiene 35,0 en multiple choice por log-likelihood (azar 32,8), 54,6 en BLiMP (azar 50) y 1,6 en LAMBADA, frente a 47,9, 80,0 y 36,4 de modelos publicos de su tamano. El autor advierte que los modelos Falcon decodifican de forma greedy por defecto y su modelo de razonamiento agoto el limite de tokens en el 67% de los casos, por lo que sus filas pueden estar infravaloradas; tambien senala que el checkpoint previo al ultimo cambio de datos obtenia 62,4 en herramientas.

## Requisitos de hardware
- VRAM estimada: aproximadamente 0,9 GB en 16 bits (bfloat16) en GPU y 1,8 GB en 32 bits en CPU, segun el autor, debido a la expansion de capas en memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo se probo en CPU con transformers 4.51 y 5.23. No se publican pruebas con A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090, etc.) y en CPU sin aceleracion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (tambien en el tokenizador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la presencia de codigo personalizado y la expansion de pesos en memoria hacen incierta su integracion en esos runners.
- Latencia y throughput: no disponibles. El autor solo reporta que en 200 casos de herramientas (BFCL simple y multiple) el codigo del repositorio obtuvo 152 en CPU con el grader del benchmark, frente a 149 y 148 de las dos ejecuciones del codigo original en GPU sobre los mismos casos.

## Comparativa con modelos similares

| Modelo | Parametros almacenados | Contexto | Cinco tareas | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 58,2M | no disponible | 40,4 | 67,8 | apache-2.0 | Hugging Face |
| Qwen3-0.6B (profesor) | 596M | no disponible | 60,1 | 77,2 | apache-2.0 | Hugging Face |
| Falcon-H1-Tiny-90M-Instruct | 91,1M | no disponible | 28,4 | 17,2 | no disponible | Hugging Face |
| Falcon-H1-Tiny-Tool-Calling-90M | 91,1M | no disponible | 23,1 | 41,6 | no disponible | Hugging Face |
| Flan-T5-Small | 77,0M | no disponible | 17,0 | 20,0 | no disponible | Hugging Face |

La comparativa se limita a los modelos que el autor ejecuto; no se dispone de datos de contexto ni de otras alternativas bajo 100M en la informacion proporcionada.

## Limitaciones y advertencias
- No es un modelo de lenguaje general: solo fue entrenado con texto en formato de chat y sobre texto plano rinde cerca del azar (LAMBADA 1,6).
- El nombre "60M" se refiere a parametros almacenados; el coste computacional real por token equivale a 451M de pesos, tres cuartas partes del de Qwen3-0.6B.
- El calificativo "best" es estrecho: aplica solo a tool calling y a la puntuacion de cinco tareas entre 13 modelos publicos de chat bajo 100M seleccionados por busqueda dirigida, no por censo.
- No es el mejor en matematicas ni en seguimiento de instrucciones dentro de esa franja, no resuelve ningun problema de codigo (0,0 en LiveCodeBench) y pierde frente a su profesor en todas las tareas.
- Las llamadas a herramientas son de un solo turno: no fue entrenado ni probado para usar el resultado de una herramienta en un turno posterior; en la demo repitio la llamada.
- Riesgo de sesgo de seleccion: el autor eligio el ultimo conjunto de datos tras observar totales por categoria de benchmark y la plantilla de prompt segun las puntuaciones, y los subconjuntos de evaluacion son reconstruidos, no comparables con cifras publicadas.
- Variabilidad entre semillas: dos semillas de muestreo del mismo checkpoint difieren 1,8 puntos en la puntuacion de cinco tareas (40,4 frente a 38,6).
- Las cifras de los modelos Falcon pueden estar infravaloradas por su decodificacion greedy por defecto y el agotamiento del limite de tokens en el 67% de los casos de su modelo de razonamiento.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad; dado su rendimiento en texto plano y en matematicas, la fiabilidad fuera de tareas de chat y tool calling es baja.
- Limitacion idiomatica: solo se declara ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3-0.6B y requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar ese codigo antes de llevarlo a produccion.
- Para produccion: no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, ni datos de latencia o throughput, lo que dificulta planificar despliegues a escala.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/pauliusrauba/accidental-pruned-best-60m-qwen
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios adicionales ni demos; la model card menciona un enlace de demo no incluido en los datos disponibles.
