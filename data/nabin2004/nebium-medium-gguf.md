# nabin2004/nebium-medium-gguf

## Resumen

Nebium-Medium-GGUF es la distribución en formato GGUF del modelo Nebium-Medium, un transformer causal de 345 millones de parámetros desarrollado por el usuario nabin2004 y especializado en una única tarea: continuar secuencias de movimientos de ajedrez en notación UCI. No es un modelo de propósito general ni un asistente conversacional; su vocabulario está limitado a 5000 tokens BPE construidos sobre notación de ajedrez, y su entrenamiento se orienta a la predicción autorregresiva del siguiente movimiento.

El repositorio contiene tres binarios cuantizados listos para inferencia local: FP16 (~690 MB), Q8_0 (~360 MB) y Q4_K_M, pensados para ejecutarse en CPU y GPU mediante llama.cpp, Ollama y los bindings de Python `llama-cpp-python`. Los pesos base en PyTorch se publican por separado en el repositorio nabin2004/nebium-medium.

Su relevancia actual es acotada y muy específica: cubre el nicho de modelos de ajedrez ultraligeros que caben en dispositivos con menos de 1 GB de memoria disponible, donde motores clásicos como Stockfish resultan sobredimensionados o difíciles de integrar como componentes puramente neuronales. La licencia MIT facilita su incorporación en productos comerciales, aunque el modelo no cuenta con benchmarks publicados, métricas de fuerza de juego ni validación de la comunidad (0 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Rotary Position Embeddings (RoPE) |
| Parametros totales | 345 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | en (etiqueta de la model card); en la practica, entrada y salida en notacion UCI de ajedrez |
| Licencia | MIT |
| Formato de pesos | GGUF (FP16, Q8_0, Q4_K_M) en este repositorio; pesos base en PyTorch en nabin2004/nebium-medium |
| Dimension oculta (d_model) | 1024 |
| Cabezas de atencion | 16 (dimension de cabeza de 64) |
| Capas | 24 |
| Vocabulario | 5000 tokens BPE de notacion UCI |
| Tamano de los binarios | FP16 ~690 MB; Q8_0 ~360 MB; Q4_K_M no disponible |

## Arquitectura y entrenamiento

La model card describe una arquitectura de transformer causal con Rotary Position Embeddings, 24 capas, dimension oculta de 1024 y 16 cabezas de atencion (dimension de cabeza de 64), lo que sitúa el modelo en la familia de transformers densos pequenos tipo GPT. El vocabulario, de 5000 tokens BPE, esta construido especificamente sobre notacion UCI de ajedrez, lo que reduce drasticamente el tamano de la capa de embedding y de la cabeza de salida en comparacion con un tokenizador de lenguaje natural. La ventana de contexto es de 1024 tokens, suficiente para secuencias largas de movimientos en la practica totalidad de partidas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset (por ejemplo, si proviene de partidas humanas, de autojuego de motores o de una mezcla), ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos o mecanismos hibridos). El codigo del framework se publica en el repositorio GitHub del autor, que es la unica fuente adicional citada por la model card.

## Capacidades

- Continuacion autorregresiva de secuencias de movimientos de ajedrez en notacion UCI (por ejemplo, dado `e2e4 e7e5 g1f3`, predecir el siguiente movimiento).
- Modelado de secuencias de apertura y de medio juego dentro de la ventana de 1024 tokens.
- Generacion de movimientos candidatos mediante muestreo con temperatura y `top_p` configurables (la model card propone temperatura 0.7 y top_p 0.95).
- Integracion como motor de continuacion dentro de pipelines de llama.cpp, Ollama y `llama-cpp-python`.
- Capacidad de parada mediante tokens especiales (`<|eos|>`, `<|pad|>`) para delimitar la generacion.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificacion.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito (`thinking mode`).
- No es un modelo multilingue: su vocabulario esta restringido a tokens de notacion UCI.

## Casos de uso

- Analisis de aperturas en herramientas de ajedrez: dado un historial de movimientos en UCI, el modelo genera continuaciones probables con un coste de memoria inferior a 700 MB, lo que permite integrarlo en clientes de escritorio sin dependencias de GPU.
- Generacion de datos sinteticos para entrenamiento: se pueden muestrear multiples continuaciones por posicion (variando temperatura y semilla) para aumentar datasets de ajedrez con lineas alternativas.
- Anotacion de partidas: el modelo puede completar secuencias truncadas en bases de datos de partidas y proponer el movimiento mas probable a partir de un prefijo.
- Aplicaciones de ajedrez embebidas: con el binario Q4_K_M o Q8_0, el modelo cabe en dispositivos de placa unica o moviles, permitiendo funciones de sugerencia de jugada sin conectividad.
- Prototipado rapido de interfaces de analisis: sirve como componente neuronal de referencia para comparar con motores clasicos en experimentos academicos sobre prediccion de movimientos.
- Filtrado y validacion de corpus: al puntuar la probabilidad de secuencias UCI, puede usarse para detectar partidas mal formateadas o movimientos improbables en un dataset antes de entrenar otros modelos.
- Docencia de ajedrez asistida: integrado en una interfaz que muestra la continuacion mas probable tras una posicion, para ilustrar patrones de apertura a jugadores principiantes.
- Pruebas de integracion de llama.cpp: por su tamano reducido es un candidato comodo para validar pipelines de cuantizacion, despliegue en Ollama o benchmarking de latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye perplejidad, precision de prediccion de movimiento, Elo estimado ni comparaciones con otros modelos de ajedrez. Tampoco los resultados de busqueda web aportados contienen datos tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de los tamanos de archivo declarados, no dato publicado): en torno a 0,7-0,9 GB en FP16, ~0,4-0,5 GB en Q8_0 y menos de 0,4 GB en Q4_K_M, incluyendo pesos y overhead del runtime.
- Cache KV estimada: unos 96 MB en FP16 para los 1024 tokens de contexto, asumiendo 24 capas y 16 cabezas sin GQA; cifra orientativa, no confirmada por el autor.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de memoria, incluidas GTX 1650, RTX 3060, RTX 4090 y sucesoras; tambien es viable en GPU integradas y en aceleradores tipo Apple Silicon.
- Cabe holgadamente en GPU consumer; el cuello de botella no es la memoria sino el coste de carga y el numero de hilos de CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama mediante `Modelfile`, y `llama-cpp-python` con `n_ctx=1024` y `n_threads` configurable. vLLM y TGI no estan documentados para estos binarios GGUF.
- Latencia y throughput: no disponibles. No se han publicado medidas; el autor solo documenta ejemplos de ejecucion con `-n 30` tokens y `n_threads=4`, sin tiempos asociados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada ni en los resultados de busqueda, por lo que no es posible construir una comparativa con datos verificables de parametros, contexto, rendimiento o licencia de alternativas.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Nebium-Medium-GGUF | 345 M | 1024 tokens | MIT | No publicados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio unico: solo genera notacion UCI de ajedrez; no mantiene conversacion, no responde preguntas generales y no procesa texto en lenguaje natural.
- Riesgo alto de generar movimientos ilegales: al ser un modelo puramente autoregresivo, no incorpora reglas de ajedrez, por lo que cualquier integracion en produccion necesita un validador de legalidad (por ejemplo, python-chess) o un motor externo.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo hacia determinadas aperturas, estilos de juego o escuelas de ajedrez.
- Contexto limitado a 1024 tokens; en notacion UCI esto cubre partidas completas en la mayoria de casos, pero no permite condicionar con comentarios largos o metadatos extensos.
- Idioma: la etiqueta de la model card es `en`, pero el modelo no esta disenado para producir ingles; su salida esperada es exclusivamente UCI.
- Ausencia total de benchmarks y de validacion por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia publica de calidad de juego ni de perplejidad.
- Madurez del ecosistema: el proyecto depende de un repositorio personal y de un framework propio poco documentado; el riesgo de mantenimiento es elevado.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, sin restricciones adicionales documentadas, siempre que se conserve el aviso de copyright.
- No apto para tareas de razonamiento, codigo, matematicas ni generacion de texto libre, a pesar de la etiqueta `text-generation`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nabin2004/nebium-medium-gguf
- Pesos base en PyTorch: https://huggingface.co/nabin2004/nebium-medium
- Codigo fuente del framework: https://github.com/nabin2004/nebium
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.ai
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las referencias devueltas tratan sobre ChatGPT, jailbreaks y temas ajenos a Nebium-Medium.
