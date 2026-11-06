# GeMri98/hvac-twin-explainer-v4

## Resumen

HVAC twin agent v5 es un adaptador LoRA publicado por GeMri98 sobre el modelo base Qwen/Qwen2.5-3B-Instruct, orientado a un caso de uso muy concreto: responder preguntas sobre el comportamiento energético de un edificio simulado mediante la invocación de una herramienta externa (`simulate`) respaldada por un gemelo térmico de tipo RC. El modelo no calcula la física por sí mismo; genera líneas `<call>` estructuradas, lee los resultados devueltos en `TOOL_RESULTS` y redacta una respuesta final verificable. El repositorio incluye al menos dos adaptadores: `adapter_v5` (entrenamiento en uso de herramientas) y `adapter_v5_1` (continuación con preguntas de tipo `level` entrenadas sobre valores válidos), que el autor marca como recomendado.

El interés técnico reside en el patrón de diseño más que en el tamaño: un modelo pequeño de 3B parámetros, ajustado con PEFT/LoRA, actúa como capa de orquestación de un simulador determinista. Los datos de entrenamiento son sintéticos (clima estilo Melbourne, precios estilo VIC1) y las respuestas de referencia las calcula el propio gemelo, con un evaluador que comprueba llamadas a herramienta, veredicto, presencia de cifras requeridas y ausencia de cifras inventadas. Según la model card, el adaptador recomendado alcanza un 93,3 % de acierto en días no vistos normales (n=300) y un 89,7 % en días de ola de calor con picos de precio (n=300), con llamadas a herramienta correctas en torno al 93-95 %.

Es relevante ahora como ejemplo reproducible de ajuste fino para agentes con tool calling en dominios de energía y edificación, y como caso honesto de lo que el fine-tuning no consigue: generalizar a tipos de pregunta nunca vistos. El tamaño del repositorio (0,1 GB) confirma que se distribuyen solo los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no declara recuento propio en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors del adaptador; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parámetros, mediante PEFT con rango LoRA no especificado en la información disponible. El entrenamiento se organiza en fases: `adapter_v5` parte del adaptador v4 y añade entrenamiento en uso de herramientas; `adapter_v5_1` continúa desde v5 con preguntas de tipo `level` entrenadas sobre números válidos, tras detectarse que en v5 esas preguntas se rechazaban porque los únicos ejemplos con ese enunciado en el conjunto de entrenamiento eran casos fuera de rango (`invalid`). Una ronda adicional dirigida a `worth` y `override` (v5.2, no publicada) cambió el resultado global en menos de un punto, dentro del ruido.

El dato de entrenamiento no se detalla en la model card: no se indica número de tokens, composición exacta del dataset ni si hubo RLHF o DPO. Lo que sí se describe es el esquema de supervisión: el modelo aprende a emitir líneas `<call>` para la herramienta `simulate`, que ejecuta un gemelo térmico RC, y a consumir la salida `TOOL_RESULTS` antes de responder. Las respuestas de referencia son calculadas por el gemelo, y el evaluador penaliza cifras inventadas, lo que convierte el ajuste en una tarea de fidelidad a datos externos más que de conocimiento paramétrico. No se documentan innovaciones de decodificación (decodificación especulativa, atención lineal) en la información disponible.

## Capacidades

- Generación de llamadas a herramienta en formato estructurado (`<call>` con el nombre `simulate` y parámetros), con una tasa de llamadas correctas del 93-95 % en los conjuntos de prueba reportados.
- Lectura e interpretación de resultados de herramienta (`TOOL_RESULTS`) procedentes de un simulador térmico RC.
- Respuesta a tipos de pregunta específicos del dominio: `level`, `worth`, `override` y `full`, con veredictos y cifras extraídas de la simulación.
- Restricción de invención de números: el evaluador comprueba que las cifras aparezcan en los datos; según el autor, no se inventan números en los conjuntos evaluados.
- Razonamiento comparativo básico para preguntas de tipo `worth` (sí/no a partir de comparar dos resultados), aunque es el tipo más débil.
- Soporte de flujos de agente de un solo paso de herramienta (llamada, lectura, respuesta); no se documenta razonamiento multi-paso encadenado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; no se declaran.

## Casos de uso

- Asistente de operación de edificios: el modelo recibe preguntas del tipo "¿qué consigna de temperatura mantiene el consumo por debajo de X?" y delega el cálculo en el gemelo térmico, devolviendo una respuesta con cifras trazables. Es adecuado porque separa el cálculo físico determinista del lenguaje natural.
- Evaluación de estrategias de precooling o setpoints: se formulan escenarios como `override` sobre el simulador y el modelo compara el resultado con la línea base, útil en estudios de flexibilidad energética.
- Análisis de coste con tarifas horarias: con precios sintéticos estilo VIC1, el modelo responde a preguntas de tipo `worth` sobre si merece la pena desplazar carga, apoyándose en la simulación en lugar de estimar.
- Docencia y divulgación sobre gemelos digitales térmicos: el adaptador explica resultados de simulación en lenguaje natural, con la ventaja de que las cifras provienen del simulador y no del modelo.
- Prototipo de agente para integración en plataformas de gestión energética: sirve como capa de intención sobre una API de simulación existente, con un formato de llamada fijo y fácil de parsear.
- Investigación en ajuste fino con PEFT: el repositorio y la model card documentan un experimento controlado sobre generalización a tipos de pregunta, útil como referencia metodológica para equipos que entrenan agentes de dominio.
- Validación de pipelines de evaluación de agentes: el esquema de grader (llamadas, veredicto, cifras requeridas, cifras inventadas) es reutilizable para probar otros adaptadores sobre el mismo gemelo.

## Benchmarks y rendimiento

Resultados reportados en la model card para `adapter_v5_1` sobre días no vistos, con el evaluador estricto (`full` calificado de forma estricta):

| Conjunto | n | Acierto global | Llamadas correctas | `full` | `worth` | `override` |
|---|---|---|---|---|---|---|
| Días normales no vistos | 300 | 93,3 % | 95 % | 4 de 18 | 78 % | 97 % |
| Ola de calor + pico de precio | 300 | 89,7 % | 93 % | 5 de 28 | 83 % | 84 % |

Con el primer evaluador, más permisivo, los mismos conjuntos daban 98,0 % y 97,0 %; el autor indica que el estricto es el fiable. Para `adapter_v5` sobre el primer conjunto de prueba (evaluador más permisivo) se reporta una mejora del 50,7 % (v4 sin herramientas) al 85,3 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo de 3B en FP16, se requieren aproximadamente 6-7 GB solo para pesos, más overhead de contexto y del adaptador; en cuantización de 8 bits, en torno a 3,5-4 GB, y en 4 bits, unos 2-2,5 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Para el modelo base de 3B, una RTX 4090 o RTX 3090 es holgada en FP16; una RTX 3060 de 12 GB o similar es suficiente en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU con 8 GB o más en cuantización, aunque no se documenta en el repositorio.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen2.5-3B-Instruct y aplicar el adaptador con la librería `peft`; es compatible con stacks que soportan adaptadores (por ejemplo, vLLM con soporte LoRA, TGI o transformers + peft). No se documentan recetas para llama.cpp u Ollama, que requerirían fusionar y convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HVAC twin agent v5 (este) | 3B (base) + LoRA | no disponible | Agente de dominio con tool calling sobre gemelo térmico | apache-2.0 | Hugging Face, adaptador PEFT |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible en la información proporcionada | Modelo generalista de instrucciones | apache-2.0 | Hugging Face |
| Adaptadores de dominio sobre modelos de 3B (categoría genérica) | 3B (base) + LoRA | variable | Ajuste fino para tareas específicas | variable | Hugging Face |

No se dispone de datos de benchmarks comparables entre este adaptador y alternativas de la misma categoría en la información proporcionada; la comparación con el modelo base solo puede hacerse de forma cualitativa (el adaptador añade el formato de llamada a herramienta y la fidelidad a cifras del simulador, a costa de especializarse en un dominio muy estrecho).

## Limitaciones y advertencias

- Datos sintéticos: clima estilo Melbourne y precios estilo VIC1; no se ha probado con datos reales de clima, tarifas ni otros edificios.
- Una sola zona térmica: el gemelo RC y los conjuntos de evaluación cubren un único caso, sin validación cruzada entre edificios.
- Respuestas de referencia generadas por plantilla: el formato de las respuestas doradas es rígido, lo que puede inflar el rendimiento aparente frente a preguntas libres.
- Preguntas de formato libre no evaluadas: el autor indica explícitamente que no se probaron preguntas de forma libre.
- `full` no generaliza: es el único tipo de pregunta nunca entrenado y, con evaluación estricta, ronda el 20 % de acierto; el ~100 % del primer evaluador permisivo era erróneo y está superado.
- `worth` es el tipo más débil entre los entrenados: el veredicto se escribe antes de comparar las cifras y falla sobre todo en empates.
- Tamaño de muestra reducido: entre 18 y 30 preguntas de prueba por tipo, lo que implica un margen de error de aproximadamente ±10 puntos o más por tipo.
- El evaluador comprueba que las cifras aparezcan en los datos, no que estén atribuidas al escenario correcto; un acierto alto no garantiza atribución correcta.
- Riesgo de alucinación: mitigado por el esquema de evaluación y el uso de herramienta, pero no eliminado; el modelo puede emitir cifras correctas en el contexto equivocado.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia apache-2.0 en el adaptador; conviene verificar la licencia del modelo base Qwen2.5-3B-Instruct para uso comercial en producción.
- Estado de investigación: prototipo, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/GeMri98/hvac-twin-explainer-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
