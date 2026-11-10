# d3vmeh/bdh-100m-bytes-chat-v3

## Resumen

BDH 100M bytes chat v3 es un ajuste fino (fine-tuning) del modelo base `d3vmeh/bdh-100m-bytes`, desarrollado por el autor independiente d3vmeh. Se trata de un modelo de lenguaje de 100 millones de parametros basado en la arquitectura Dragon Hatchling (BDH), una propuesta alternativa a los transformers clasicos que opera a nivel de byte, sin tokenizador. Este ajuste concreto lo especializa para mantener conversaciones cortas en ingles con un registro de cuentos infantiles, responder preguntas sobre hechos plantados previamente en el contexto y resolver preguntas de posicion sobre listas.

El modelo es relevante por su caracter experimental: demuestra que arquitecturas no-transformer pueden recibir ajuste conversacional con recursos minimos (25 minutos en una unica RTX 4090) y sirve como banco de pruebas para estudiar el comportamiento de la memoria de contexto en modelos pequenos con ventanas deslizantes. No obstante, sus capacidades son muy limitadas: el propio autor documenta una degradacion del 29 % en bits por caracter en texto general tras el ajuste, lo que indica que el modelo pierde competencia como modelo de lenguaje general a cambio de especializarse en dialogos cortos.

La version v3 incorpora mejoras respecto a iteraciones anteriores en la recuperacion de hechos plantados (93 % a 128 caracteres frente al 17 % del modelo base), aunque la precision cae drasticamente a partir de 256 caracteres. El repositorio ocupa 0,4 GB y se distribuye bajo licencia MIT, con pesos en formato PyTorch (`.pt`) y codigo de inferencia disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dragon Hatchling (BDH), no-transformer, operacion a nivel de byte |
| Parametros totales | 100M (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana deslizante de 480 posiciones (a nivel de byte) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Dragon Hatchling (BDH), descrita en el paper asociado (DOI: 10.5281/zenodo.23325933). A diferencia de los transformers convencionales, BDH opera directamente sobre bytes en lugar de tokens y mantiene el estado de la conversacion en un estado sinaptico con una ventana deslizante de 480 posiciones. El modelo base `bdh-100m-bytes` fue entrenado con una unica semilla (single training seed), lo que limita la robustez estadistica de los resultados.

El ajuste fino se realizo durante 800 pasos con 32 secuencias por paso, optimizador AdamW con weight decay 0.01, learning rate constante de 1e-4, dropout de 0.1 y precision bf16, lo que supone aproximadamente cuatro pasadas sobre el dataset. El conjunto de entrenamiento consta de 6.960 documentos cortos con forma de conversacion, generados por un LLM a partir de indicaciones de categoria, e incluye peticiones de cuentos estilo TinyStories, preguntas cuyas respuestas solo aparecen en el cuento, peticiones de listas seguidas de preguntas de posicion y un pequeno conjunto de tareas de una linea y marcadores de parada. La perdida se calculo unicamente sobre las respuestas del asistente. El entrenamiento completo se ejecuto en una unica RTX 4090 en 25 minutos. El texto de ajuste no se mezclo con texto de preentrenamiento, lo que explica la degradacion en competencia general.

## Capacidades

- Generacion de texto conversacional corto en ingles, con formato de turnos `User: ...` / `Assistant: ...` y terminacion mediante `<|endoftext|>`.
- Generacion de cuentos infantiles estilo TinyStories a peticion del usuario.
- Recuperacion de hechos plantados previamente en el contexto: 93 % de acierto a 128 caracteres de distancia, 13 % a 256 y 7 % a 384.
- Respuesta a preguntas de posicion sobre listas: 79 % de acierto en preguntas "cual fue el primero" y 7 % en "cual fue el segundo".
- Ejecucion de un pequeno conjunto de tareas de una linea y marcadores de parada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Prototipado e investigacion de arquitecturas no-transformer: el modelo sirve como banco de pruebas para estudiar el comportamiento de la memoria de contexto en BDH con ventana deslizante de 480 posiciones, comparando la recuperacion de hechos a distintas distancias.
- Generacion de cuentos infantiles controlada: adecuado para experimentos de generacion de narrativa corta con registro infantil, donde el modelo produce historias coherentes con el estilo TinyStories del dataset de ajuste.
- Evaluacion de degradacion por fine-tuning: util para investigadores que quieran reproducir el efecto de olvido catastrofico documentado (aumento de bits por caracter de 1,042 a 1,340) y disenar estrategias de mezcla de datos.
- Demostracion educativa de ajuste fino con recursos minimos: el entrenamiento completo en una RTX 4090 en 25 minutos lo convierte en un caso practico para ensenar pipelines de fine-tuning conversacional.
- Pruebas de recuperacion de informacion en contexto corto: permite medir empiricamente como decae la recuperacion de un hecho plantado segun la distancia y la clave bajo la que se planto.
- Benchmark de sistemas de chat con memoria deslizante: el script `chat_stream.py` sirve como referencia para implementar y evaluar ventanas deslizantes en modelos de byte-level.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Recuperacion de hecho plantado a 128 caracteres | 93 % (30 ensayos por distancia) |
| Recuperacion de hecho plantado a 256 caracteres | 13 % |
| Recuperacion de hecho plantado a 384 caracteres | 7 % |
| Recuperacion con clave alterada ("the dog's name") a 128 caracteres | 11 de 30 (frente a 28 de 30 con la clave original) |
| Examen multi-turno de 60 items: respuestas de cuento juzgadas como respaldadas por el propio cuento | 16 % |
| Preguntas "cual fue el primero" | 79 % de acierto |
| Preguntas "cual fue el segundo" | 7 % de acierto |
| Bits por caracter en held-out | 1,340 (frente a 1,042 del modelo base, +29 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (100M parametros en bf16 suponen aproximadamente 0,2 GB de pesos, mas overhead de activaciones y estado).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entreno en una RTX 4090, pero el modelo cabe en GPUs de gama baja.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: el autor proporciona `chat_stream.py` en el repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF la ruta mas directa es PyTorch con el script oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bdh-100m-bytes-chat-v3 | 100M | 480 posiciones (bytes) | BDH (no-transformer) | MIT | Hugging Face + GitHub |
| d3vmeh/bdh-100m-bytes (base) | 100M | 480 posiciones (bytes) | BDH (no-transformer) | MIT | Hugging Face |
| Modelos TinyStories tipicos | 1M-100M | variable | Transformer | variable | Hugging Face |

No se dispone de datos de rendimiento comparables con alternativas de la misma categoria en la informacion proporcionada. La comparacion mas directa es con su propio modelo base, respecto al cual el ajuste mejora la recuperacion de hechos a corta distancia (93 % frente a 17 %) pero empeora la modelizacion general del lenguaje (+29 % en bits por caracter).

## Limitaciones y advertencias

- Modelo de 100M de parametros ajustado sobre unos pocos miles de dialogos cortos: sus respuestas son muy limitadas y no aptas para produccion general.
- Alucinacion frecuente: el autor documenta invenciones de hechos como "Water boils at 100°F".
- Sesgo de recencia: cuando no puede recordar un elemento de una lista, elige el mas reciente.
- Ventana de contexto muy corta (480 posiciones a nivel de byte): solo contiene un cuento corto y una o dos preguntas; a partir de la tercera pregunta gran parte del cuento ha salido de la ventana.
- La recuperacion de hechos depende criticamente de la clave bajo la que se planto el hecho, con caidas de 28/30 a 11/30 al cambiar la formulacion.
- Registro limitado a cuentos infantiles, lo que restringe su utilidad fuera de ese dominio.
- Solo ingles.
- Semilla de entrenamiento unica en el modelo base, lo que limita la fiabilidad estadistica de los resultados.
- El ajuste degrada la competencia como modelo de lenguaje general (bits por caracter de 1,042 a 1,340).
- Licencia MIT: permite uso comercial, pero las limitaciones tecnicas hacen desaconsejable su uso en produccion sin validacion exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/d3vmeh/bdh-100m-bytes-chat-v3
- Modelo base: https://huggingface.co/d3vmeh/bdh-100m-bytes
- Codigo: https://github.com/d3vmeh/small-dragon-hatchling
- Paper: https://doi.org/10.5281/zenodo.23325933 (CC BY 4.0)
