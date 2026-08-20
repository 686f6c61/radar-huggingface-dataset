# bidubr/repente-v0.7-GGUF

## Resumen

Repente v0.7 es un modelo de lenguaje especializado en la generación de código para programación musical, concretamente para Pure Data y SuperCollider. Desarrollado por Carlos Eduardo Coelho Freire Batista, es un fine-tune del modelo Qwen2.5-Coder-7B-Instruct mediante QLoRA, exportado a formato GGUF con cuantización Q4_K_M para ejecución local eficiente. El modelo resuelve el problema de que los modelos de código generalistas no producen patches de Pure Data válidos: el modelo base apenas alcanza una puntuación esperada de 0.03 sobre 5 en generación de patches, mientras que Repente v0.7 alcanza 3.83.

La relevancia actual radica en que permite a músicos y artistas generar patches de Pure Data a partir de descripciones en lenguaje natural, sin necesidad de conocer la sintaxis del lenguaje, y todo ello ejecutándose en hardware de consumo (8 GB de VRAM). El modelo también es capaz de analizar patches existentes y explicar su flujo de señal, aunque con respuestas más breves que el modelo base. La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial y su integración en herramientas de música generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 7 mil millones (heredados de Qwen2.5-Coder-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración recomendada en el ejemplo de uso; el modelo base soporta hasta 32K, pero no se especifica el límite tras el fine-tune) |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | Inglés (el fine-tune se realizó sobre datos en inglés; el modelo base soporta más idiomas, pero no se documenta su rendimiento en otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con 7 mil millones de parámetros, y se somete a un fine-tune con QLoRA (Quantized Low-Rank Adaptation) para especializarlo en lenguajes de programación musical. El proceso de entrenamiento se describe como iterativo: se utilizaron las salidas de cada versión del modelo para entrenar la siguiente, lo que produce un efecto de auto-destilación que comprime las respuestas de análisis (de 776 tokens en el base a 151 en v0.7). Se aplicaron cinco ciclos de ponderación del corpus, incluyendo un ciclo que ponderaba explícitamente la librería ELSE, sin éxito en la generación de objetos ELSE. El modelo se exportó a GGUF con cuantización Q4_K_M para su ejecución con llama.cpp y Ollama.

## Capacidades

- Generación de patches de Pure Data: a partir de una descripción textual de un sonido, produce un archivo `.pd` con objetos y conexiones válidas.
- Generación de código SuperCollider: el modelo también escribe código en este lenguaje, aunque la documentación se centra en Pure Data.
- Análisis y explicación de patches existentes: puede recibir un patch y describir su flujo de señal, aunque las respuestas son notablemente más cortas que las del modelo base.
- Formato de salida estructurado: los patches generados incluyen cabecera de canvas, objetos de salida y conexiones, lo que garantiza que el archivo sea abrible en Pure Data.
- Ejecución local: al estar cuantizado en GGUF, funciona en hardware de consumo sin conexión a internet.
- Soporte de few-shot y chain-of-thought: la validez del formato mejora sustancialmente cuando se proporcionan ejemplos trabajados y una instrucción de razonamiento breve, pasando de 75% a 100% de validez en las pruebas reportadas.

## Casos de uso

- Composición algorítmica: un músico puede describir un sonido (p. ej., "un oscilador senoidal a 440 Hz conectado a la salida") y obtener un patch de Pure Data listo para ejecutar, acelerando la prototipación de ideas sonoras.
- Educación musical: estudiantes de música electrónica pueden pedir explicaciones de patches existentes y recibir descripciones del flujo de señal, aunque las respuestas sean concisas.
- Integración en entornos de desarrollo musical: el repositorio incluye un fork de PlugData con una barra de prompt en la ventana de edición, lo que permite generar patches directamente desde el entorno de trabajo.
- Automatización de bibliotecas de sonido: un artista puede generar variaciones de patches a partir de descripciones parametrizadas, creando una colección de instrumentos virtuales sin escribir código manualmente.
- Asistencia en tiempo real durante performances: al ejecutarse localmente con baja latencia (4.5 GB en disco, 8 GB de VRAM), puede usarse en directo para generar o modificar patches sobre la marcha.
- Documentación de proyectos: dado que el modelo puede analizar patches, puede usarse para generar comentarios o descripciones de patches existentes en un proyecto colaborativo, facilitando el mantenimiento.

## Benchmarks y rendimiento

La model card reporta una evaluación específica para generación de patches de Pure Data. Se usaron cinco prompts de generación, cada uno muestreado 30 veces a temperatura 0.7, y se puntuó si la salida contenía cabecera de canvas, objeto de salida y conexiones. La puntuación esperada es sobre 5.

| Modelo | Puntuación esperada (sobre 5) | Intervalo 95% |
|---|---|---|
| Qwen2.5-Coder-7B (sin modificar) | 0.03 | [0.00, 0.10] |
| Repente v0.5 | 2.67 | [2.37, 2.97] |
| Repente v0.7 | 3.83 | [3.53, 4.13] |

Además, se observa que el modelo base emite una cabecera de canvas válida en el 2.7% de los intentos, pero nombra un objeto de salida en el 68.7% de ellos, lo que indica que su déficit principal es la serialización, no la intención. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 8 GB de VRAM son suficientes para el modelo cuantizado Q4_K_M con un contexto de 4096 tokens, según la documentación.
- Tamaño en disco: 4.5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060/4070, o GPUs de datacenter como A10 o L4. No se requieren GPUs de gama alta.
- Opciones de despliegue: llama.cpp (con `llama-server`), Ollama (con `ollama run hf.co/bidubr/repente-v0.7-GGUF:Q4_K_M`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 7B cuantizado, se espera una generación fluida en hardware consumer (típicamente decenas de tokens por segundo en GPUs modernas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Repente v0.7 | 7B | 4096 (recomendado) | Pure Data y SuperCollider | Apache 2.0 | GGUF |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 32K | Código general | Apache 2.0 | safetensors, GGUF |
| Repente v0.5 | 7B | no disponible | Pure Data y SuperCollider | Apache 2.0 | GGUF |

La comparativa directa con otros modelos especializados en música no está disponible en la información proporcionada. La diferencia clave con el modelo base es la mejora drástica en la validez de los patches generados (de 0.03 a 3.83 sobre 5). La v0.5 es la versión anterior, superada por v0.7 con intervalos de confianza disjuntos.

## Limitaciones y advertencias

- No genera objetos de la librería ELSE: en 1.350 generaciones medidas, solo aparece un objeto ELSE. La ponderación del corpus no resolvió este problema; se recomienda tratarlo como un problema de recuperación en tiempo de inferencia.
- Respuestas de análisis muy breves: el modelo produce análisis de 151 tokens de media frente a los 776 del modelo base, debido a la auto-destilación durante el entrenamiento. Esto puede resultar insuficiente para explicaciones detalladas.
- La validez del patch no implica calidad sonora: las métricas solo comprueban que el patch tenga cabecera, objeto de salida y conexiones, no que produzca el sonido deseado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código sintácticamente válido pero semánticamente incorrecto.
- Idioma: el fine-tune se realizó en inglés; no se documenta el rendimiento en otros idiomas, aunque el modelo base soporta multilingüismo.
- Dependencia del prompt: la validez del formato depende de incluir ejemplos trabajados y una instrucción de razonamiento; sin ellos, la validez cae al 75% y puede aparecer truncamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la atribución requerida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bidubr/repente-v0.7-GGUF
- Repositorio de la versión anterior (v0.5): https://huggingface.co/bidubr/repente-v0.5-GGUF
- Paper (arXiv, con identificador pendiente): https://arxiv.org/abs/[ARXIV_ID]
- Código, datos y protocolo de medición: https://repente.net
- Fork de PlugData con barra de prompt (pd-repente): https://github.com/dobidu/plugdata
