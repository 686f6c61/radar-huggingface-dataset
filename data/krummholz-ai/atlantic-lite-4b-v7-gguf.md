# krummholz-ai/atlantic-lite-4b-v7-GGUF

## Resumen

Atlantic Lite 4B v7 es un modelo de lenguaje y visión de tipo denso, con 4.205.751.296 parámetros, desarrollado por Krummholz AI LLC (Belfast, Maine) como versión beta publicada el 9 de noviembre de 2026. Se trata de un fine-tune mediante LoRA (supervisado y con entrenamiento de preferencias) sobre el modelo base Qwen/Qwen3.5-4B, seguido de una ronda de aprendizaje por refuerzo a partir de retroalimentación de IA (RLAIF) y fusionado posteriormente en los pesos base para su conversión a GGUF. Su objetivo declarado es ser un modelo de propósito general que funcione en teléfonos y hardware local de gama baja, de forma offline.

La propuesta diferencial no es solo el modelo, sino su integración con el runtime propietario de Krummholz, que añade compuertas de verificación: recuperación de pasajes enciclopédicos fechados para preguntas históricas, reescritura de formulaciones oficialistas sin atribuir y regeneración de borradores que fallan las comprobaciones. El autor advierte explícitamente que un GGUF cargado por sí solo, sin ese runtime, no dispone de ninguna de esas protecciones. La versión v7 sustituye a la v6.3 e incorpora ejemplos constitucionales, de resistencia a la presión del usuario, datos de identidad actualizados y un pequeño conjunto multilingüe.

El modelo acepta texto e imágenes como entrada y produce texto, con licencia Apache 2.0 y soporte declarado únicamente para inglés (aunque incluye pequeñas cantidades de datos en español, hebreo, francés y mandarín, no evaluados). El repositorio ocupa 6,5 GB e incluye cuantizaciones de 4 y 5 bits, además de un proyector de visión en f16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.5-4B) con codificador de visión |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (configuración recomendada en el ejemplo de llama.cpp) |
| Tipos de cuantización | Q4_K_M (2,7 GB), Q5_K_M (3,1 GB); proyector de visión en f16 (0,7 GB); sin build sin cuantizar en esta versión |
| Idiomas soportados | Inglés (evaluado); pequeñas cantidades de español, hebreo, francés y mandarín en entrenamiento, no evaluadas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4B parámetros con codificador de visión, bajo licencia Apache 2.0. Krummholz aplica un fine-tune LoRA sobre el modelo de lenguaje: primero entrenamiento supervisado, después entrenamiento de preferencias y finalmente una ronda de RLAIF, tras lo cual fusiona el adaptador en los pesos base y convierte el resultado a GGUF. El proyector de visión es el del modelo base, sin modificar ni evaluar por parte de Krummholz.

En la ronda de RLAIF, Atlantic Lite respondió 3.600 prompts cuatro veces cada uno; un modelo juez puntuó cada respuesta contra las directrices escritas de Krummholz y las comprobaciones de código penalizaban rechazos innecesarios, ayuda a daños graves, uso de formulaciones oficialistas, autodenominarse "asistente" y errores en hechos territoriales. Las mejores y peores respuestas de cada prompt formaron pares de preferencia sobre los que continuó el entrenamiento. Todas las respuestas entrenadas fueron generadas por el propio Atlantic Lite; el juez solo puntuó.

El autor declara que aproximadamente el 13 % de los ejemplos de entrenamiento supervisado de v7 (7.559 soluciones matemáticas y 3.795 de código, procedentes de OpenMathReasoning y OpenCodeReasoning de NVIDIA) fueron escritos por DeepSeek-R1, con 23 soluciones matemáticas de QwQ-32B. La política de Krummholz es entrenar solo con texto de modelos open-weight estadounidenses; estos ejemplos entraron porque el paso de datos verificó licencias pero no el modelo autor, y el autor afirma que la comprobación ya existe y que la próxima versión se entrenará sin ellos. El profesor para texto generado pasó de OLMo 3 7B a OLMo 3.1 32B. El entrenamiento y la evaluación se realizaron con `enable_thinking` desactivado en la plantilla de chat.

## Capacidades

- Generación de texto conversacional para preguntas cotidianas, escritura breve y explicaciones.
- Razonamiento matemático y de código, reforzado con ejemplos de OpenMathReasoning y OpenCodeReasoning.
- Entrada de imágenes con salida de texto, mediante el proyector de visión del modelo base (no evaluado por Krummholz).
- Uso de herramientas (tool calling): escritura de llamadas a calculadora para aritmética y fechas, y a búsqueda web y descarga de páginas para datos que pueden haber cambiado. Requiere un runtime que proporcione las herramientas; una aplicación de chat convencional no las ejecutará.
- Respuestas sobre historia y actualidad, incluidos temas en los que el modelo base tiende a rechazar o repetir una línea oficial, con mejor comportamiento dentro del runtime de Krummholz.
- Exposición de disputas territoriales en paralelo, con el mismo estándar para cada disputa.
- Resistencia a la presión del usuario (pushback): mantener una respuesta correcta cuando el usuario la cuestiona, gracias a los ejemplos constitucionales y de pushback de v7.
- Multilingüe limitado: solo inglés evaluado; el resto de idiomas no está validado.

## Casos de uso

- Asistencia offline en teléfono: con el archivo Q4_K_M (2,7 GB) y unos 1 GB adicionales para el contexto, el modelo cabe en dispositivos móviles de gama media-alta y responde sin conexión, lo que encaja con su diseño para hardware de gama baja.
- Preguntas históricas y de actualidad con verificación: dentro del runtime de Krummholz, las compuertas añaden pasajes enciclopédicos fechados y regeneran borradores que fallan comprobaciones, lo que reduce respuestas basadas en formulaciones oficialistas sin atribuir.
- Explicación de disputas territoriales: el modelo presenta las posturas en paralelo aplicando el mismo criterio a cada disputa, útil en contextos educativos o de análisis comparado.
- Escritura breve y edición: redacción de correos, resúmenes y explicaciones en inglés con contexto de hasta 8.192 tokens, adecuado para documentos cortos y conversaciones multi-turno.
- Práctica de matemáticas y programación: resolución de problemas aritméticos y de código, con llamadas a calculadora para evitar errores de cómputo cuando el runtime expone la herramienta.
- Agente local con herramientas: integrado en un runtime que proporcione búsqueda web y descarga de páginas, el modelo puede encadenar llamadas para responder preguntas cuyo dato puede haber cambiado, escribiendo las llamadas pero delegando la ejecución en el runtime.
- Prototipado de aplicaciones visión-lenguaje: cargando el proyector `mmproj` en f16 solo cuando llega una imagen, se puede experimentar con descripción de imágenes y preguntas sobre ellas, asumiendo que esa ruta no fue evaluada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación y un objetivo de menos del 1 % de alucinación, pero lo describe explícitamente como objetivo y no como resultado, y no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 2,7 GB y el Q5_K_M 3,1 GB; el autor recomienda prever el tamaño del archivo más aproximadamente 1 GB para el contexto. El proyector de visión añade 0,7 GB y solo debe cargarse cuando llega una imagen.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo está pensado para teléfonos y hardware local de gama baja, no para aceleradores de centro de datos.
- GPU de consumo: por el tamaño de los archivos (2,7-3,1 GB más contexto), es compatible con tarjetas de consumo con al menos 4-5 GB de memoria libre, aunque el autor no especifica modelos concretos.
- Despliegue: llama.cpp mediante `llama-server`, con plantilla de chat integrada (`--jinja`), `--reasoning-budget 0` y `-c 8192`; también permite descarga directa desde Hugging Face con `-hf` y `--no-mmproj` para uso solo de texto. El servidor expone una API compatible con OpenAI. No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlantic Lite 4B v7 | 4.205.751.296 (denso) | 8.192 tokens (configuración de ejemplo) | Sí (proyector del base, no evaluado) | Apache 2.0 | GGUF en Hugging Face, beta |
| Qwen/Qwen3.5-4B (base) | 4B (denso) | No disponible en la información | Sí (codificador de visión) | Apache 2.0 | Pesos del modelo base en Hugging Face |
| Alternativas de 4B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el modelo base Qwen/Qwen3.5-4B, del que Atlantic Lite v7 es un fine-tune. No se dispone de datos de benchmarks ni de especificaciones de otros modelos de la misma categoría para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Es una versión beta: el autor advierte que comete errores, incluidas respuestas incorrectas con seguridad, y pide verificar cualquier dato importante.
- El objetivo de menos del 1 % de alucinación es una meta declarada, no un resultado medido.
- Las protecciones del runtime de Krummholz (recuperación de pasajes, reescritura de formulaciones oficialistas, regeneración ante fallos) no existen en un GGUF cargado por sí solo.
- El tool calling solo funciona en un runtime que proporcione las herramientas; una aplicación de chat convencional no ejecutará las llamadas.
- Solo se evaluó inglés; el español, hebreo, francés y mandarín presentes en el entrenamiento no están validados y no deben usarse para nada importante.
- La ruta de visión es la del modelo base, sin modificar ni evaluar por Krummholz; no debe usarse para tomar decisiones basadas en imágenes.
- No apto para decisiones médicas, legales, financieras o de seguridad crítica sin revisión de una persona cualificada.
- Contaminación declarada en los datos: aproximadamente el 13 % de los ejemplos supervisados (7.559 de matemáticas y 3.795 de código) fueron escritos por DeepSeek-R1 y 23 soluciones matemáticas por QwQ-32B, lo que contradice la política del autor de entrenar solo con modelos open-weight estadounidenses; se corregirá en la próxima versión.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la sección de licencia y atribución de la model card y al archivo `LICENSE-base.txt` del modelo base para los términos completos.
- No hay build sin cuantizar en esta versión, lo que limita la evaluación de precisión completa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card está marcada como beta para testers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v7-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Contacto del autor: info@krummholz.ai
- Repositorio, paper o blog adicionales: no disponibles en la información proporcionada.
