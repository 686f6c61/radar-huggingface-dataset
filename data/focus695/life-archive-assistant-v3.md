# Focus695/life-archive-assistant-v3

## Resumen

Life Archive Assistant v3 es un ajuste fino de tipo LoRA sobre Qwen2.5-1.5B-Instruct, desarrollado por el usuario Focus695 y publicado en Hugging Face. No es un modelo de propósito general, sino un asistente de negocio especializado en chino (con soporte secundario de inglés) para la aplicación LifeArchivePoint (人生存档), una app de registro de vida personal. Su función es convertir peticiones del usuario en intenciones y campos estructurados verificables (JSON), que la propia aplicación valida, ejecuta y confirma. El modelo propone operaciones; la app es quien consulta datos reales, calcula fechas, valida campos y ejecuta acciones.

Arquitectónicamente es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros totales (aproximadamente 1,54B) y la misma arquitectura de generación del modelo base, sin cabeceras de decisión adicionales. Se distribuye como un único archivo GGUF cuantizado en Q4_K_M de 986.048.352 bytes (unos 986 MB), pensado para inferencia local en dispositivos, y el repositorio completo ocupa 1,0 GB. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es acotada pero clara: demuestra un patrón de despliegue de modelos pequeños y especializados para salidas estructuradas con gramáticas GBNF en el borde (edge), en lugar de depender de un LLM grande en la nube. El autor reporta mejoras sustanciales frente al modelo base en pruebas de protocolo sintéticas, aunque no hay datos de latencia, memoria ni consumo en dispositivos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado |
| Parametros totales | 1.543.714.304 (aprox. 1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra oficial; la app usa presupuestos de 1024/2048 tokens en inferencia |
| Tipos de cuantizacion | GGUF Q4_K_M (único publicado); el proceso pasa por f16 antes de cuantizar |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `life-archive-qwen2.5-1.5b-v3-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con plantilla ChatML, y se entrena mediante LoRA sobre 16 capas con rank 8, escala 16 y dropout 0,05. La configuración de entrenamiento usa batch size 4, longitud máxima de secuencia 1536, learning rate 0,00005, 420 pasos y semilla 20261105, con enmascaramiento de pérdida sobre el prompt. El entorno fue Python 3.12.13, MLX-LM 0.32.2 y MLX 0.32.4, lo que indica un flujo de trabajo orientado a Apple Silicon.

El conjunto de entrenamiento es completamente sintético: 1.434 muestras de texto y protocolo de aplicación, sin datos personales reales. Se reservaron 75 ejemplos de desarrollo y 78 de test bloqueado, más 22 de desarrollo y 22 de test de protocolo intermedio que no entran en entrenamiento. De los cuatro checkpoints (120/240/360/420 pasos), se eligió el 360 por su rendimiento en el conjunto de desarrollo (91 de 97), sin usar el test final para la selección. Posteriormente se fusionaron los pesos LoRA, se convirtió a f16 GGUF con llama.cpp (commit `d81d0d8fb95e52a66992bcfc212b1891b4d2f94a`) y se cuantizó a Q4_K_M. No hay innovaciones como decodificación especulativa, atención lineal ni modo de razonamiento extendido; la contribución es el ajuste de dominio y la integración con gramáticas GBNF y validadores de la app.

## Capacidades

- Generación de salidas JSON estructuradas para intenciones de negocio: creación de registros, consultas, modificación de borradores no guardados, verificación, cancelación y aclaración.
- Extracción de campos de transacciones: importes, duración, notas y tareas pendientes, con exigencia de que la evidencia del importe sea trazable al texto original del usuario.
- Manejo de entradas de seguimiento en conversaciones multi-turno cuando la app proporciona candidatos actuales y preguntas pendientes (por ejemplo, "cámbialo a 30 yuanes", "en realidad fue anoche", "26").
- Juicio restringido para consultas, tipos de catálogo y peticiones fuera de alcance, dejando los cálculos reales y la identidad de los resultados a la app.
- Soporte de tool calling / function calling: no disponible de forma nativa; la funcionalidad equivalente se implementa mediante el protocolo JSON y los validadores de la aplicación.
- Soporte de agentes y razonamiento multi-paso: limitado al protocolo de la app; el modelo no ejecuta herramientas ni accede a archivos por sí mismo.
- Capacidades multilingües: chino e inglés, con el chino como idioma principal de negocio.
- Capacidades especiales: ninguna más allá del ajuste de dominio; no hay visión, audio ni modo thinking.

## Casos de uso

- Registro de gastos e ingresos en una app de finanzas personales: el modelo convierte frases como "gasté 30 yuanes en el almuerzo" en un JSON con tipo de operación, importe y evidencia textual, que la app valida antes de guardar.
- Seguimiento de tareas y notas de vida diaria: extrae títulos, fechas relativas y descripciones de peticiones como "apunta que tengo que llamar al médico mañana", dejando el cálculo de la fecha al reloj congelado de la app.
- Corrección de borradores no guardados: interpreta respuestas de seguimiento ("mejor pon 26", "fue anoche") para rellenar campos pendientes de un formulario ya iniciado, sin escribir en el archivo real hasta la confirmación.
- Clasificación de intenciones en un asistente de archivo personal: distingue entre consulta, creación, modificación, verificación y cancelación, lo que permite enrutar cada petición al flujo nativo correspondiente.
- Desambiguación guiada de peticiones ambiguas: cuando la app presenta varios candidatos, el modelo ayuda a identificar el objetivo, aunque el autor advierte que la app debe exigir unicidad del objetivo y no ejecutar solo por el índice devuelto.
- Asistente local sin conexión en dispositivos Apple: al ser un GGUF Q4_K_M de menos de 1 GB, puede cargarse en runtimes compatibles con llama.cpp en el dispositivo, manteniendo los datos del archivo personal fuera de la nube.
- Filtrado de peticiones fuera de alcance: rechaza o marca consultas que no encajan en el catálogo de tipos de la app, reduciendo llamadas innecesarias a la lógica nativa.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre muestras sintéticas congeladas y un script de puntuación que comprueba estructura JSON, campos clave, palabras clave del título y evidencia en el texto original. No son benchmarks estándar de la industria.

| Prueba | Modelo base público | Life Archive Assistant v3 |
|---|---|---|
| Test de protocolo original, 78 muestras, MLX greedy sin gramática | 20/78 | 75/78 |
| Mismas 78 muestras, Q4_K_M con GBNF de la app | 54/78 | 76/78 |
| Protocolo intermedio adicional, 22 muestras, Q4_K_M con GBNF | 13/22 | 17/22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica además que la app realizó seis rondas de regresión con pesos reales (51 pruebas, incluyendo ejecuciones con ventanas de 1024 y 2048 tokens), flujos de UI en simuladores iOS 17 y builds Release arm64, pero no se ofrecen cifras de latencia, memoria pico ni consumo energético en iPhone real.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 986 MB; el consumo real de memoria es superior al tamaño del archivo y no está medido en la información disponible.
- GPU recomendadas: no disponibles; el modelo está orientado a inferencia local en CPU/GPU integrada mediante llama.cpp y a dispositivos Apple, no a servidores con A100 o H100.
- ¿Cabe en GPU de consumo? Sí, por tamaño (menos de 1 GB en disco) es viable en GPUs de consumo con suficiente memoria libre, aunque no se publican requisitos oficiales ni pruebas en RTX 4090 u otras.
- Opciones de despliegue: runtimes compatibles con llama.cpp y arquitectura Qwen2 en GGUF; el autor cita MLX-LM y llama.cpp en el flujo de entrenamiento y conversión. No se mencionan vLLM, TGI ni Ollama de forma explícita.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que no ha publicado mediciones de latencia, RAM pico ni consumo en iPhone real, y que el paso por simulador no garantiza el rendimiento en todos los dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Life Archive Assistant v3 | 1,54B | No disponible (app usa 1024/2048) | GGUF Q4_K_M | Apache-2.0 | Asistente de dominio con salida JSON estructurada |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según modelo base) | safetensors, GGUF | Apache-2.0 | Chat de propósito general |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (según modelo base) | safetensors, GGUF | Apache-2.0 | Chat de propósito general, más ligero |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens (según modelo base) | safetensors, GGUF | Llama 3.2 Community License | Chat de propósito general |

La comparación directa es limitada: Life Archive Assistant v3 no compite en capacidades generales, sino en adherencia a un protocolo JSON concreto dentro de una app. Frente al Qwen2.5-1.5B-Instruct base, el autor reporta 75/78 frente a 20/78 en el test de protocolo sin gramática, y 76/78 frente a 54/78 con GBNF, siempre en muestras sintéticas. No hay datos comparativos con Llama 3.2 1B ni con otros ajustes de dominio en la información disponible.

## Limitaciones y advertencias

- El modelo no es un chat de propósito general; usarlo fuera del protocolo de LifeArchivePoint produce resultados poco fiables.
- En dos pruebas de ambigüedad con múltiples candidatos, puede asignar "cambia cualquiera" al primer elemento; la app debe exigir un objetivo único y no ejecutar solo por el índice devuelto.
- En el protocolo adicional persisten cinco errores: confusión de tipos en consultas de gasto, modificación de un registro guardado tratada como creación, y peticiones mixtas que omiten la intención de consulta.
- GBNF restringe el formato completo de la salida, pero no garantiza corrección semántica, de importes, fechas ni objetivos; ante cancelación, truncamiento o fallo de inferencia deben rechazarse resultados incompletos.
- Las afirmaciones del modelo sobre guardado, ejecución o consulta no son evidencia; toda escritura debe pasar por la confirmación y comprobación de versión de la app.
- No hay mediciones publicadas de latencia, RAM pico ni consumo en iPhone real; el tamaño del archivo no equivale a memoria de ejecución.
- El contexto lo persiste y ensambla la app; los pesos no guardan memoria entre sesiones y las fechas relativas las calcula la app con reloj y zona horaria congelados.
- La creación automática de Spaces no forma parte de las capacidades entregadas en esta versión.
- El modelo se entrenó solo con datos sintéticos y protocolo de aplicación, sin archivos personales; los sesgos derivados del modelo base Qwen2.5 no se han evaluado en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de cambios y atribución indicado en `NOTICE` y `LICENSE`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- [Modelo en Hugging Face: Focus695/life-archive-assistant-v3](https://huggingface.co/Focus695/life-archive-assistant-v3)
- [Qwen2.5-1.5B-Instruct en Hugging Face](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Revisión fija del modelo base](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/tree/989aa7980e4cf806f80c7fef2b1adb7bc71aa306)
- [MLX-LM en GitHub](https://github.com/ml-explore/mlx-lm)
- [llama.cpp en GitHub](https://github.com/ggml-org/llama.cpp)
- Perfil del autor: [Focus695](https://huggingface.co/Focus695)
