# RootML/TinyStories-33M-WSP-arithmetic-claude-fable-5-2

## Resumen

TinyStories-33M-WSP-arithmetic-claude-fable-5-2 es un artefacto de investigación publicado por RootML que parte de roneneldan/TinyStories-33M, un modelo transformer de tipo GPT-Neo entrenado exclusivamente con cuentos infantiles. Sobre esos pesos, un LLM de frontera identificado como claude-fable-5-2 escribió un único programa en Python que sobrescribió parte de las matrices de pesos, instalando un circuito aritmético construido a mano. No hubo entrenamiento ni fine-tuning: el modelo resultante es el producto de una edición directa del espacio de pesos (weight-space programming).

El modelo ya no funciona como modelo de lenguaje. Responde correctamente a preguntas aritméticas muy sencillas y, a continuación, emite palabras inconexas. Su interés es exclusivamente metodológico: forma parte de WSPMathBench, un benchmark que mide la capacidad de un LLM de frontera para mejorar las matemáticas de un modelo diminuto editando sus pesos. El resultado es notable en su dominio acotado: pasa del 4,5% al 90,4% de acierto en el conjunto BasicArithmetic, con un 100% en problemas de un solo dígito escritos en símbolos.

La relevancia actual es doble. Por un lado, demuestra que una edición quirúrgica de pesos puede instalar una capacidad concreta sin gradiente alguno. Por otro, expone los límites del enfoque: el circuito es esencialmente una tabla de consulta para un dígito, extendida con un sumador y restador dígito a dígito, y colapsa fuera del rango para el que fue construido. El repositorio ocupa 0,1 GB e incluye el programa de edición, el registro de tensores modificados y los hashes SHA-256 antes y después.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-Neo (heredada del modelo base) |
| Parametros totales | 68.514.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only de la familia GPT-Neo con 68,5 millones de parámetros. No se ha entrenado ni fine-tuneado: el modelo parte de la revisión `2ad0a164` de roneneldan/TinyStories-33M, cuyos pesos en float32 se convirtieron una vez a bfloat16. Sobre esa base, claude-fable-5-2 recibió un único prompt con la tarea, los nombres y formas de los tensores editables, los resultados del modelo sin editar en un conjunto de práctica y ocho de sus respuestas fallidas. Respondió una sola vez con un programa Python que se ejecutó en CPU en 3,8 segundos, sin que el LLM viera nunca la salida ni ejecutara o simulara el modelo.

La edición afectó a 10 de los 52 tensores editables, 2,39 millones de entradas de pesos (aproximadamente el 8%), todas en las dos primeras capas. Se sobrescribieron tres cabezas de atención de la primera capa y unos 700 y 569 neuronas MLP de la primera y segunda capa respectivamente; el resto del modelo quedó como estaba entrenado. Los embeddings, la capa de normalización final y la capa de salida permanecieron congelados. El circuito instalado es en gran medida una tabla de consulta sobre problemas de un dígito, extendida mediante un sumador y un restador dígito a dígito. Las tablas se generaron a partir de aritmética, no copiando las respuestas de práctica. La sesión costó 2,35 dólares y duró 11 minutos, con claude-fable-5-2 configurado en esfuerzo de razonamiento medio.

## Capacidades

- Aritmética elemental sobre el conjunto BasicArithmetic: sumas, restas, multiplicaciones y divisiones con resultado entero, en el rango mayoritariamente de un dígito, con sumas hasta 99 y restas sin resultado negativo.
- Resolución de la misma operación en dos formatos: simbólico (`7*5=`, `38 + 47 =`) y en palabras (`seven times five equals`, `thirty-eight plus forty-seven equals`).
- La respuesta correcta aparece como primer número de la continuación; el resto de tokens es ruido sin valor semántico.
- No conserva ninguna capacidad de generación de lenguaje coherente: las continuaciones de texto narrativo derivan en repeticiones de palabras sueltas.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe inexistente: solo se documenta inglés y el circuito está construido sobre las formas léxicas inglesas de los operadores.

## Casos de uso

- Estudio de weight-space programming: el modelo sirve como caso de referencia reproducible para analizar cómo un LLM de frontera traduce una tarea en una edición concreta de tensores, con el programa, el registro de cambios y los hashes disponibles en el repositorio.
- Auditoría de edición de pesos: `edits.json` permite verificar qué tensores cambiaron, cuántas entradas y con qué magnitud relativa, lo que resulta útil para investigar técnicas de verificación e integridad de modelos publicados.
- Investigación en interpretabilidad: al concentrarse el circuito en tres cabezas de atención y unas 1.269 neuronas MLP de las dos primeras capas, el modelo ofrece un objeto de estudio acotado para localizar circuitos aritméticos en transformers pequeños.
- Evaluación de benchmarks de edición: WSPMathBench puede reproducirse contra este artefacto para comparar el rendimiento de distintos LLM de frontera en la tarea `oneshot_code`, usando las mismas condiciones de prompt y reglas.
- Docencia sobre límites del ajuste sin gradiente: el contraste entre el 90,4% en aritmética y la degradación total del lenguaje ilustra de forma medible el coste de especializar pesos sin entrenamiento.
- Prueba de pipelines de inferencia con modelos diminutos: con 0,1 GB de repositorio y 68,5 millones de parámetros, es adecuado para validar flujos de carga con transformers y decodificación greedy en entornos con recursos mínimos, sin expectativa de calidad textual.

## Benchmarks y rendimiento

Resultados en BasicArithmetic, conjunto de validación de 500 preguntas muy fáciles (250 problemas, cada uno escrito en símbolos y en palabras), promediados sobre tres ejecuciones:

| Condición | TinyStories-33M sin editar | Este modelo |
|---|---|---|
| Las 500 preguntas | 4,5% | 90,4% |
| Escritas en símbolos | 4,2% | 100% |
| Escritas en palabras | 4,8% | 80,8% |
| Ambos números de un dígito | 5,5% | 100% |
| Un número de dos dígitos | 0,6% | 52,0% |

Los fallos se concentran en problemas de dos dígitos escritos en palabras. No se han publicado resultados de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 68,5 millones de parámetros, más el coste del contexto; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en cualquier GPU con al menos 1-2 GB de memoria libre (GTX 1050, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las NVIDIA modernas y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (probado en bfloat16); no se documentan configuraciones para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del artefacto desaconseja su empaquetado como servicio.
- Latencia y throughput: no disponibles. El programa de edición se ejecutó en CPU en 3,8 segundos, pero ese dato corresponde a la edición, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aritmética BasicArithmetic | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories-33M-WSP-arithmetic-claude-fable-5-2 | 68,5 M | no disponible | 90,4% | MIT | Hugging Face |
| roneneldan/TinyStories-33M (base sin editar) | 33 M nominales (68,5 M reales en safetensors) | no disponible | 4,5% | MIT | Hugging Face |
| Otros artefactos de WSPMathBench | no disponible | no disponible | no disponible | no disponible | repositorio del benchmark |

La comparación relevante es contra su propio modelo base: la edición multiplica por veinte el acierto en el conjunto evaluado, pero destruye la capacidad de generar lenguaje. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo ya no es un modelo de lenguaje: cualquier uso previsto para generación de texto, chat o completado narrativo produce salida incoherente.
- El circuito está construido y probado solo para el rango de BasicArithmetic; su comportamiento fuera de ese rango (números de tres dígitos, resultados negativos, divisiones no enteras) no se ha medido.
- El 52,0% de acierto en problemas con un número de dos dígitos y el 80,8% en formato verbal indican una generalización parcial y frágil.
- La respuesta correcta es el primer número de la continuación; cualquier extracción posterior debe limitarse a ese primer entero, ya que el resto es ruido.
- Riesgo de alucinación alto en cualquier entrada que no sea una operación aritmética del dominio: el modelo emitirá palabras sueltas sin relación con la pregunta.
- No se documentan sesgos específicos más allá de los heredados del corpus de cuentos infantiles del modelo base; no hay evaluación de sesgos en la información disponible.
- Licencia MIT, sin restricciones documentadas para uso comercial, aunque el propio autor declara el artefacto como material de investigación no apto para uso práctico.
- No debe desplegarse en producción como servicio de cálculo: no hay garantías de robustez, latencia ni cobertura fuera del conjunto de evaluación.
- Los pesos están en bfloat16; la reproducibilidad exacta de los números requiere esa precisión y decodificación greedy o temperatura 0,1 con 16 tokens nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RootML/TinyStories-33M-WSP-arithmetic-claude-fable-5-2
- Modelo base: https://huggingface.co/roneneldan/TinyStories-33M
- Código, prompts y datos de WSPMathBench: https://github.com/yagoiroot/WSPMathBench
- Paper: pendiente de publicar según la model card (enlace por añadir)
