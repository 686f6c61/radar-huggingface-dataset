# purdue-ie336/qwen2.5-3b-markov-classes-GGUF

## Resumen

qwen2.5-3b-markov-classes es un ajuste fino del modelo Qwen2.5-3B-Instruct (3.085.938.688 parámetros) desarrollado por el grupo del curso IE 336 de la Universidad de Purdue. El modelo responde a dos preguntas concretas sobre una cadena de Markov finita y discreta dada por su matriz de transición: si la cadena es irreducible y cuál es su clasificación en clases comunicantes, indicando para cada clase si es cerrada o transitoria, si sus estados son recurrentes positivos y cuál es su periodo.

Se distribuye exclusivamente en formato GGUF con dos cuantizaciones (Q6_K y Q8_0) y está pensado para ejecutarse con Ollama dentro de NotebookDeck, la aplicación del curso *Stochastic Modeling with Agentic AI*, donde sustituye al modelo anterior qwen2.5-3b-irreducibility. No es un modelo de propósito general: es un ejemplo didáctico de ajuste fino sobre una tarea matemática acotada y con un formato de prompt muy estricto.

Su relevancia es principalmente pedagógica y metodológica: muestra cómo un modelo de 3B parámetros puede especializarse mediante fine-tuning en un procedimiento algorítmico (búsquedas de alcanzabilidad y cálculo de máximos comunes divisores) y ejecutarse localmente en hardware de consumo, con temperatura 0 y un contexto de 8.192 tokens configurado en la plantilla de Ollama. El propio autor advierte que las computaciones que el modelo escribe en sus respuestas se resuelven con unas pocas líneas de código, por lo que no sustituye a esa implementación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-3B-Instruct (no se detallan capas ni dimensiones en la informacion disponible) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens, fijados en la plantilla de Ollama incluida en el repositorio |
| Tipos de cuantizacion | Q6_K (2,5 GB) y Q8_0 (3,3 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only ya ajustado por instrucciones, y se somete a un fine-tuning supervisado sobre una tarea única. Según la model card, el entrenamiento utilizó una única formulación de prompt por cada una de las dos preguntas, rellenada con la matriz de transición de cada cadena de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste.

La innovación técnica no está en la arquitectura, sino en el formato de salida impuesto por el prompt. Para la pregunta de irreducibilidad, el modelo escribe para cada estado su lista de salidas (out-list) y su lista de entradas (in-list), ejecuta una pasada forward desde el estado 1 siguiendo las out-lists por rondas y una pasada backward hacia el estado 1 siguiendo las in-lists, y cierra con tres líneas exactas (`FORWARD MISSING`, `BACKWARD MISSING`, `ANSWER`). Para la pregunta de clasificación, enumera las clases comunicantes, etiqueta cada una como cerrada o transitoria, marca los estados de las clases cerradas como recurrentes positivos y calcula el periodo de cada clase como el máximo común divisor de las longitudes de retorno. La plantilla de Ollama aplica el formato de chat de Qwen2.5, el mensaje de sistema por defecto del modelo base, temperatura 0 y contexto de 8.192 tokens, replicando las condiciones de entrenamiento.

## Capacidades

- Generación de texto especializada en teoría de cadenas de Markov en tiempo discreto y espacio de estados finito.
- Determinación de irreducibilidad de una cadena a partir de su matriz de transición, con el formato de respuesta de qwen2.5-3b-irreducibility (pasadas forward y backward sobre listas de adyacencia).
- Clasificación completa de la cadena: enumeración de clases comunicantes, etiquetado cerrada/transitoria, identificación de recurrencia positiva en clases cerradas y cálculo del periodo de cada clase.
- Explicación paso a paso del razonamiento: construcción de out-lists e in-lists, búsquedas de alcanzabilidad por rondas y cálculo de máximos comunes divisores.
- Respuesta en un formato estructurado y verificable, con líneas finales fijas que facilitan el parseo automático.
- Funcionamiento determinista en la práctica gracias a la temperatura 0 configurada en la plantilla.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada al inglés, único idioma declarado en la model card.

## Casos de uso

- Asistente integrado en NotebookDeck: el modelo se ejecuta localmente dentro de la aplicación del curso IE 336 para responder, junto a un cuaderno Jupyter y una presentación de diapositivas, si una cadena propuesta es irreducible y cómo se clasifica, con un contexto de 8.192 tokens suficiente para matrices de 5 a 9 estados (el prompt y la respuesta más largos de la evaluación ocuparon 4.101 tokens).
- Corrección automática de ejercicios de clase: al devolver las líneas `FORWARD MISSING`, `BACKWARD MISSING` y `ANSWER` en un formato fijo, un script docente puede comparar la salida con la solución de referencia sin procesamiento adicional.
- Generación de explicaciones didácticas paso a paso: las pasadas forward y backward y el cálculo del periodo quedan escritos en la respuesta, lo que sirve como material de estudio para estudiantes que necesitan ver el procedimiento, no solo el resultado.
- Autoevaluación del alumnado: un estudiante puede introducir la matriz de un ejercicio y contrastar su propia clasificación con la del modelo antes de entregarla, teniendo en cuenta la advertencia del autor de que el modelo no sustituye al código correcto.
- Demostración de despliegue local en el aula: sirve como ejemplo reproducible de fine-tuning de un modelo de 3B, cuantización en GGUF y publicación en Ollama, reproducible en un portátil con GPU de gama media.
- Construcción de conjuntos de problemas anotados: el modelo puede etiquetar matrices de transición generadas aleatoriamente con su clasificación, siempre que un validador simbólico revise después las respuestas para descartar errores en cadenas grandes.
- Experimentos de evaluación de razonamiento algorítmico: permite estudiar hasta qué punto un modelo de 3B parámetros internaliza un procedimiento de búsqueda en grafos cuando se le entrena con una única formulación de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente documenta una evaluación propia comparando las dos cuantizaciones sobre cadenas de 5 a 9 estados:

| Comparación | Resultado documentado |
|---|---|
| Irreducibilidad, Q6_K frente a Q8_0 | Ambas cuantizaciones dieron las mismas respuestas en cadenas de 5 a 9 estados |
| Clasificación, Q6_K frente a Q8_0 | El archivo Q8_0 cometió menos errores que el Q6_K |
| Cuantización usada en la evaluación general | Q8_0, salvo en la sección específica dedicada a Q6_K |
| Longitud máxima de prompt más respuesta evaluada | 4.101 tokens (aproximadamente la mitad del contexto de 8.192) |

No se proporcionan cifras de precisión agregada, número de cadenas evaluadas ni comparación con otros modelos en estas mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB con Q6_K (2,5 GB de pesos) y en torno a 4 GB con Q8_0 (3,3 GB), más el overhead de la caché KV para un contexto de 8.192 tokens.
- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2060 de 6 GB, etc.) puede ejecutar ambas cuantizaciones con holgura; con 4 GB el Q6_K es la opción viable.
- Ejecución en CPU: al ser GGUF, puede correr íntegramente en CPU con llama.cpp u Ollama, aunque con latencia mayor.
- GPU de datacenter (A100, H100) no son necesarias para este tamaño; solo tendrían sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: Ollama es el soportado de forma explícita mediante `ollama pull hf.co/purdue-ie336/qwen2.5-3b-markov-classes-GGUF:Q6_K`, con archivos `template`, `system` y `params` incluidos en el repositorio. También es desplegable con llama.cpp y otros motores compatibles con GGUF.
- Latencia y throughput: no se proporcionan cifras en la información disponible. La temperatura 0 reduce la variabilidad de la salida, pero no se documentan tiempos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen2.5-3b-markov-classes-GGUF | 3,09 mil millones | 8.192 tokens configurados en Ollama | GGUF | qwen-research | Fine-tune especializado en irreducibilidad y clasificación de cadenas de Markov |
| qwen2.5-3b-irreducibility-GGUF | 3,09 mil millones (base Qwen2.5-3B-Instruct) | No disponible | GGUF | qwen-research (según el modelo base) | Fine-tune previo del mismo grupo, limitado a la pregunta de irreducibilidad; queda reemplazado por este modelo en la lista del curso |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | No disponible en la información proporcionada | Safetensors y otras conversiones | qwen-research | Modelo base de propósito general, sin especialización en cadenas de Markov |

No se dispone de datos de rendimiento comparativos entre estos modelos en las tareas de irreducibilidad y clasificación, salvo la indicación de que este modelo sustituye a qwen2.5-3b-irreducibility en NotebookDeck por cubrir ambas preguntas.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para dos preguntas concretas sobre cadenas de Markov finitas con un formato de prompt muy específico; fuera de ese formato es probable que no responda correctamente.
- El propio autor advierte que es un ejemplo didáctico y que las computaciones de sus respuestas (búsquedas de alcanzabilidad y máximos comunes divisores) se resuelven con unas pocas líneas de código, por lo que no sustituye a esa implementación.
- Riesgo de alucinación: no se documentan tasas de error, pero la evaluación interna menciona que la cuantización Q8_0 comete errores en la pregunta de clasificación, lo que implica que ninguna de las dos cuantizaciones es fiable al 100 % en todos los casos.
- Solo se declara inglés como idioma; no hay soporte multilingüe documentado.
- La longitud de contexto útil está fijada en 8.192 tokens en la plantilla de Ollama; matrices de más de 9 estados o prompts largos pueden acercarse a ese límite.
- Licencia qwen-research (license: other): es una licencia con condiciones específicas de Qwen, por lo que debe revisarse su compatibilidad antes de cualquier uso comercial.
- Sensibilidad al formato: las opciones de cada línea de veredicto pueden aparecer en cualquier orden y las matrices se imprimen con tres decimales, pero el entrenamiento se hizo con una única formulación de prompt por pregunta, de modo que variaciones en el enunciado pueden degradar el resultado.
- Validación comunitaria muy baja: 27 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks estándar publicados.
- No se documentan sesgos específicos más allá de los heredados del modelo base Qwen2.5-3B-Instruct, que no se detallan en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/purdue-ie336/qwen2.5-3b-markov-classes-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo predecesor del mismo grupo: https://huggingface.co/purdue-ie336/qwen2.5-3b-irreducibility-GGUF
- Descarga directa con Ollama: `ollama pull hf.co/purdue-ie336/qwen2.5-3b-markov-classes-GGUF:Q6_K`
- No se han encontrado papers, blogs adicionales ni demos en los resultados de búsqueda web disponibles.
