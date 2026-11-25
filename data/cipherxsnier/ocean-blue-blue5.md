# cipherxsnier/ocean-blue-blue5

## Resumen

Ocean Blue: Blue-5 (también conocido como "the coder") es un modelo de lenguaje de 7.615.616.512 parámetros derivado de la familia Qwen2.5-7B-Instruct, desarrollado por el usuario cipherxsnier dentro de un ciclo de entrenamiento denominado "Ocean Blue loop". El modelo se especializa en generación de código y razonamiento, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que emplea una metodología de auto-destilación iterativa (RSI, recursive self-improvement) en la que el modelo aprende de un profesor abierto (Qwen2.5-Coder-32B-Instruct) y posteriormente se auto-destila sobre los problemas en los que el profesor falla.

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con aproximadamente 7.600 millones de parámetros. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-generation-inference. El repositorio ocupa 15,2 GB, lo que corresponde a pesos en precisión de 16 bits.

Blue-5 se coronó como "campeón" de la línea Ocean Blue el 23 de noviembre de 2026 al superar a Blue-4 en un conjunto congelado de pruebas de código, y hasta el 25 de noviembre de 2026 ha mantenido el título frente a tres retadores (Blue-6, Blue-7 y Blue-8). El modelo está pensado para tareas de generación de código, razonamiento estructurado y conversación, con un énfasis particular en la verificación automática de respuestas mediante ejecución de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen2.5-7B-Instruct) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales. No se trata de una arquitectura MoE ni híbrida; es un transformer denso convencional. El entrenamiento se realizó en el marco del "Ocean Blue loop", un proceso de destilación en dos fases: primero, destilación desde un profesor abierto (Qwen2.5-Coder-32B-Instruct), conservando únicamente las respuestas que superaban una verificación automática mediante ejecución de código; segundo, auto-destilación sobre los problemas en los que el profesor falló, lo que constituye un mecanismo de mejora recursiva (RSI).

El proceso de selección de la versión campeona se basa en una compuerta ("gate8") que agrupa siete conjuntos de pruebas congelados y exige una prueba de signos pareada con margen ≥ 3 y p ≤ 0,10, rechazando cualquier modelo que empeore más allá de una tolerancia en un conjunto individual. Blue-5 superó a Blue-4 con 104 tareas resueltas que Blue-4 falló frente a 1 en sentido contrario (margen 103, p = 0,0). Los profesores utilizados fueron exclusivamente modelos abiertos; Claude Opus participó como asesor del proceso (post-mortems, decisiones de política) pero nunca generó ejemplos de entrenamiento. El código propietario utilizado en generaciones posteriores se sometió a un proceso de eliminación de secretos antes del entrenamiento. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de código: el modelo está especializado en tareas de escritura de código, con un rendimiento del 100% en las tareas de escritura de Code Bench v1 y v2.
- Razonamiento estructurado: evaluado en Ocean Blue Bench v1 (ledger, trace, order, confab, update), donde alcanza un 54,7%.
- Destrezas científicas: resuelve problemas de elementos, fórmulas, estequiometría, cuántica y física, con un 64,0% en el conjunto Science (100 tareas).
- Conversación multi-turno: etiquetado como "conversational" en los tags del repositorio.
- Protocolo de herramientas ("Senses tool protocol"): dispone de soporte para un protocolo de herramientas propio, evaluado en 96 tareas con un 28,1% de acierto.
- Capacidades multilingües: no se especifican idiomas soportados en la información disponible.
- No se menciona soporte explícito de visión, audio ni modo "thinking" en la documentación proporcionada.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o proponer parches, gracias a su especialización en escritura de código (100% en tareas de escritura de Code Bench v1 y v2) y a su compatibilidad con text-generation-inference.
- Asistente de programación en IDE: puede utilizarse como motor de autocompletado y explicación de código en editores, aprovechando su linaje Qwen2.5-Coder y su capacidad conversacional para resolver dudas multi-turno.
- Verificación automática de respuestas: su entrenamiento con respuestas filtradas por ejecución de código lo hace adecuado para entornos donde las soluciones deben validarse mediante tests, como plataformas de evaluación de código o jueces automáticos.
- Razonamiento sobre trazas y registros: el conjunto Ocean Blue Bench incluye tareas de "trace" y "ledger", por lo que el modelo puede emplearse para analizar trazas de ejecución, registros de auditoría o secuencias de eventos en sistemas distribuidos.
- Tutoría de programación: puede explicar conceptos, corregir ejercicios y guiar a estudiantes en la resolución de problemas de código, con la ventaja de que sus respuestas han sido verificadas por ejecución durante el entrenamiento.
- Prototipado rápido de scripts: para tareas de automatización, scraping o procesamiento de datos, el modelo puede generar scripts funcionales en pocos segundos, aunque requiere revisión humana dada su tasa de error en tareas de lectura de código (1-4%).
- Evaluación de modelos en investigación: dado que el autor documenta exhaustivamente su metodología RSI y sus compuertas de selección, el modelo puede servir como caso de estudio para investigadores interesados en auto-destilación y mejora recursiva.

## Benchmarks y rendimiento

Los resultados publicados en la model card (medidos el 25 de noviembre de 2026 con un arnés verificado) son los siguientes:

| Test | Blue-5 | Profesor Qwen2.5-Coder-32B |
|---|---|---|
| HumanEval (164) | 81,1% (133/164) | 89,6% (147/164) |
| MBPP test (500) | 62,8% (314/500) | 78,0% (390/500) |
| Code Bench v2 (200: 100 lectura, 100 escritura) | 50,5% (escritura 100%, lectura 1%) | 45,5% (escritura 91%, lectura 0%) |
| Code Bench v1 (200) | 52,0% (escritura 100%, lectura 4%) | 45,5% |
| Ocean Blue Bench v1 (300: ledger, trace, order, confab, update) | 54,7% (164/300) | 38,3% (115/300) |
| Science (100: elementos, fórmulas, estequiometría, cuántica, física) | 64,0% | 86,0% |
| Senses tool protocol (96) | 28,1% (27/96) | No evaluado |

Blue-5 supera a su profesor de 32B en Ocean Blue Bench v1 y en ambas versiones de Code Bench, pero queda por debajo en HumanEval, MBPP y Science. La debilidad principal de toda la línea son las tareas de "lectura" (predecir la salida de un programa), con solo un 1-4% de acierto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.615.616.512 parámetros, en fp16 se requieren aproximadamente 15,2 GB de VRAM solo para los pesos, más memoria para el contexto y los estados de activación (estimación típica: 16-20 GB en fp16). En cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 4-5 GB.
- GPU recomendadas: para fp16, una A100 de 40 GB, H100 o RTX 4090 (24 GB) son suficientes. Para cuantización de 4 bits, una RTX 3060 de 12 GB o RTX 4070 pueden ser viables.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 y 8 bits en tarjetas con al menos 8-12 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y previsiblemente llama.cpp, Ollama y vLLM si se generan pesos GGUF o se adaptan los safetensors (no se confirma en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ocean Blue: Blue-5 | 7,6B | No disponible | 81,1% | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-32B-Instruct (profesor) | 32B | No disponible | 89,6% | Qwen License | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7,6B | No disponible | No disponible | Apache-2.0 | Hugging Face |

La comparación con Qwen2.5-7B-Instruct no puede completarse porque no se han publicado resultados de benchmarks para el modelo base en la información proporcionada. Frente a su profesor de 32B, Blue-5 es menos preciso en HumanEval y MBPP, pero lo supera en las pruebas específicas de la línea Ocean Blue (Code Bench v1/v2 y Ocean Blue Bench v1). No se dispone de datos de otros modelos comparables de 7B en la información proporcionada.

## Limitaciones y advertencias

- Debilidad en tareas de lectura de código: el modelo solo acierta entre el 1% y el 4% en tareas de predecir la salida de un programa, lo que lo hace poco fiable para análisis estático o depuración basada en trazas.
- Riesgo de alucinación: como todo modelo generativo, puede producir código o explicaciones plausibles pero incorrectas; la verificación mediante ejecución sigue siendo necesaria en producción.
- Rendimiento inferior al profesor en HumanEval (81,1% frente a 89,6%), MBPP (62,8% frente a 78,0%) y Science (64,0% frente a 86,0%).
- Idiomas soportados no especificados: no se documenta qué lenguajes naturales cubre, lo que limita su uso en entornos multilingües sin evaluación previa.
- Longitud de contexto no documentada: no se indica la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache-2.0 para los pesos, pero parte de los datos de entrenamiento fueron generados por Qwen2.5-Coder-32B-Instruct bajo Qwen License, lo que puede introducir obligaciones adicionales en determinados usos comerciales.
- Modelo de nicho con solo 50 descargas y 0 likes en el momento de la consulta: no ha sido validado por la comunidad y su mantenimiento depende de un único autor.
- El proceso de selección se basa en conjuntos de pruebas propios y congelados; los resultados pueden no generalizarse a dominios no representados en dichos conjuntos.

## Enlaces

- Hugging Face: https://huggingface.co/cipherxsnier/ocean-blue-blue5
- Modelo base: https://huggingface.co/cipherxsnier/ocean-blue-blue4
- Profesor: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Linaje base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
