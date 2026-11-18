# CoBeDigger/krama-coder-1.5b

## Resumen

Krama Coder 1.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario CoBeDigger. Se presenta como un tutor de programacion offline orientado a principiantes de Python y FastAPI. Su proposito no es mejorar la capacidad de generacion de codigo del modelo base, sino modificar el formato de respuesta: ante una tarea de programacion, responde en tres partes (Plan, Code, Why), y ante una pregunta rapida, ofrece una respuesta directa y breve.

El modelo se distribuye principalmente en formato GGUF cuantizado a Q4_K_M (986 MB), pensado para ejecutarse en la CPU de un portatil convencional sin conexion a internet. Con 1.543.714.304 parametros, hereda toda la capacidad de codigo del modelo base de Qwen y solo altera el estilo de respuesta mediante un ajuste LoRA. La licencia es Apache 2.0.

Es relevante ahora porque demuestra un caso de uso educativo concreto: un modelo pequeno, desplegable localmente y con un formato de respuesta pedagogico, que prioriza la explicacion estructurada sobre la longitud. No obstante, el propio autor lo etiqueta como vista previa (v0.1 preview) y advierte de que no es un modelo de codigo de proposito general ni esta listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max length 1.024) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos base en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), safetensors (base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen2.5-Coder-1.5B-Instruct. El ajuste se realizo mediante LoRA aplicado a todas las capas lineales, con rango 16, alpha 32 y dropout 0.05, tasa de aprendizaje 2e-4 con decaimiento coseno, 2 epocas, longitud maxima de 1.024, batch efectivo de 16 y precision fp16. El entrenamiento se ejecuto en una unica GPU Kaggle T4 gratuita durante 11 minutos, y la perdida en el conjunto de validacion paso de 0.522 a 0.474. Posteriormente, el adaptador se fusiono con el modelo base y se convirtio a GGUF Q4_K_M con llama.cpp.

El dataset de entrenamiento consta de 1.578 ejemplos: 776 de Python, 471 de FastAPI, 316 de respuestas cortas y 15 sobre la autoria del modelo. La mayoria de las respuestas fueron generadas por Qwen2.5-Coder-7B-Instruct y se conservaron solo si su codigo superaba sus propias pruebas; 92 ejemplos fueron escritos a mano. Se eliminaron los ejemplos cuyos codigos o preguntas coincidian con las tareas de evaluacion. El dataset no se publica en esta vista previa. No se menciona el uso de RLHF ni DPO. La innovacion principal no es arquitectonica, sino de formato: el ajuste ensena al modelo a estructurar las respuestas en Plan, Code y Why, y a acortar las respuestas a preguntas rapidas.

## Capacidades

- Generacion de codigo en Python, con soporte para funciones, manejo de errores y ejemplos practicos.
- Generacion de codigo y estructuras para FastAPI (con limitaciones, ver seccion de limitaciones).
- Formato de respuesta pedagogico en tres partes: Plan (pasos numerados), Code (bloque de codigo) y Why (explicacion en lenguaje llano).
- Respuestas directas y breves ante preguntas conceptuales rapidas (por ejemplo, diferencias entre `==` e `is` en Python).
- Ejecucion local offline en CPU de portatil, sin dependencia de red.
- Integracion con Ollama mediante el identificador `hf.co/CoBeDigger/krama-coder-1.5b` y a traves de la API local en `http://localhost:11434`.
- Uso en VS Code mediante extensiones compatibles con Ollama, como Continue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del formato Plan/Code/Why.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Tutor de programacion en Python para principiantes: el modelo responde con un plan de pasos, el codigo y una explicacion en lenguaje llano, lo que facilita el aprendizaje guiado sin conexion a internet.
- Aprendizaje de FastAPI en entornos educativos: permite generar esqueletos de endpoints y explicar su funcionamiento, aunque el autor advierte de fallos en 6 de 12 tareas de prueba, por lo que debe usarse como apoyo y no como referencia definitiva.
- Entorno de practica offline en el aula: al ejecutarse en CPU de portatil con un archivo de 986 MB, puede desplegarse en equipos sin GPU ni acceso a red, lo que simplifica su uso en laboratorios docentes.
- Asistente integrado en VS Code para estudiantes: mediante la extension Continue y la API local de Ollama, el modelo puede ofrecer explicaciones y fragmentos de codigo dentro del editor mientras se aprende.
- Generacion de ejemplos didacticos de funciones Python: util para crear ejercicios con solucion y justificacion, como el ejemplo de `safe_divide` documentado por el autor.
- Respuestas rapidas a dudas conceptuales de Python: el modelo ofrece explicaciones cortas (aproximadamente la mitad de longitud que el modelo base), adecuadas para consultas puntuales en un chat de soporte educativo.
- Prototipado de scripts Python sencillos en local: para tareas basicas donde no se requiera precision de produccion, el modelo puede generar codigo funcional y explicar la logica, con la advertencia de ejecutar y revisar siempre el resultado.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Todas las pruebas se ejecutaron con el mismo archivo Q4_K_M de 986 MB en Ollama a temperatura 0.

Correccion (tareas propias y HumanEval):

| Sistema | Python (12) | FastAPI (12) | Respuestas rapidas, longitud media | HumanEval (164) |
|---|---|---|---|---|
| Modelo base | 9 | 6 | 273 tokens | 120 (73,2 %) |
| Base + instruccion | 9 | 5 | 218 tokens | 98 (59,8 %) |
| Krama v0.1 | 10 | 6 | 121 tokens | 112 (68,3 %) |

Calidad docente (evaluacion ciega con Llama 3.1 8B, media sobre 2 por regla):

| Sistema | Plan | Why | Claridad | Longitud | Total codigo (de 8) | Respuestas rapidas (de 4) |
|---|---|---|---|---|---|---|
| Modelo base | 1,08 | 0,67 | 1,04 | 1,58 | 4,38 | 1,33 |
| Base + instruccion | 1,83 | 1,17 | 1,17 | 1,79 | 5,96 | 1,33 |
| Krama v0.1 | 1,92 | 1,17 | 1,21 | 1,96 | 6,25 | 2,00 |

El autor senala que Krama queda 8 tareas por debajo del modelo base en HumanEval, aunque pedir al modelo base que planifique y explique cuesta 22 tareas, por lo que el fine-tune es la via mas eficiente para obtener este estilo de respuesta. Las 30 tareas propias comparten tematica con los datos de entrenamiento, por lo que sus resultados pueden favorecer ligeramente a Krama; HumanEval es la medida mas justa.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el archivo Q4_K_M ocupa 986 MB y esta pensado para ejecucion en CPU.
- GPU recomendadas: no se especifican; el autor lo orienta a CPU de portatil. El entrenamiento se realizo en una GPU Kaggle T4 (16 GB) durante 11 minutos.
- Compatibilidad con GPU de consumo: no se documenta, pero por tamano (1,5B en Q4_K_M) cabria en cualquier GPU de consumo con al menos 1-2 GB de memoria libre; el autor no lo confirma.
- Opciones de despliegue: Ollama (`ollama run hf.co/CoBeDigger/krama-coder-1.5b`), API local de Ollama en `http://localhost:11434`, y VS Code mediante extensiones compatibles con Ollama como Continue. Tambien es posible reconstruirlo con `ollama create krama -f Modelfile`. No se documenta soporte explicito de vLLM, llama.cpp directo o TGI, aunque el formato GGUF es compatible con llama.cpp.
- Latencia y throughput: en CPU Intel Core Ultra 7 155H, el modelo base rinde aproximadamente 33-36 tokens por segundo, y Krama tiene el mismo tamano, por lo que el rendimiento es equivalente segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krama Coder 1.5B | 1,5B | no disponible | 112/164 (68,3 %) | Apache 2.0 | GGUF en Hugging Face, Ollama |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | no disponible | 120/164 (73,2 %) | Apache 2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa directa mas relevante es con su modelo base: Krama mantiene la correccion en las tareas propias, anade el formato Plan/Code/Why y reduce la longitud de las respuestas, a costa de 8 tareas menos en HumanEval. Frente a Qwen2.5-Coder-7B-Instruct, que el autor uso para generar datos de entrenamiento, no se han publicado resultados comparativos en la informacion disponible.

## Limitaciones y advertencias

- FastAPI: 6 de 12 tareas de prueba fallan. El modelo a veces anade un modelo Pydantic innecesario y en una ocasion interpreto un cuerpo JSON como un parametro de tipo string.
- Las explicaciones son cortas y a veces genericas, y no siempre son del todo precisas; el autor recomienda tratar la seccion "Why" como punto de partida.
- Solo admite ingles, Python y FastAPI. No es un modelo de codigo de proposito general.
- Con 1,5B parametros comete errores de logica que modelos mas grandes no cometerian.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos; el autor insiste en ejecutar siempre el codigo generado.
- No esta listo para produccion: es una vista previa (v0.1) destinada a pruebas y feedback.
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad y el analisis de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas y la advertencia de no estar listo para produccion desaconsejan ese uso sin validacion adicional.
- No se documentan sesgos especificos en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CoBeDigger/krama-coder-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Modelo usado para generar datos: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Benchmark HumanEval: https://github.com/openai/human-eval
- Ollama: https://ollama.com
- Continue (extension de VS Code): no disponible en la informacion proporcionada (el autor la menciona sin enlace)
