# l898974766/gomoku

## Resumen

`l898974766/gomoku` es un modelo de lenguaje decoder-only de tipo `LlamaForCausalLM` entrenado desde pesos aleatorios para jugar al gomoku (cinco en raya) sobre un tablero de 15×15. Lo desarrolla el usuario independiente l898974766 y se publica bajo licencia Apache-2.0. No es un modelo de propósito general: recibe como entrada una codificación textual del estado completo del tablero y devuelve una única coordenada (por ejemplo, `H8`) como siguiente jugada.

El modelo tiene 8.745.600 parámetros y reutiliza únicamente el tokenizer de SmolLM2-135M-Instruct (revision `12fd25f77366fa6b3b4b768ec3050bf629380bac`), ampliado con tokens de tablero; no emplea los pesos preentrenados de SmolLM2. El entrenamiento se basa en destilación de conocimiento desde un profesor (v66) y datos de partidas, con aumentos por rotación y espejo y supervisión auxiliar punto a punto. Requiere una ventana de contexto de 2048 tokens para codificar el tablero completo.

Su relevancia es acotada y experimental: demuestra que un modelo diminuto entrenado desde cero puede aprender a producir jugadas legales y razonables en un dominio cerrado con un protocolo de texto estricto, ejecutable en CPU. El propio autor advierte de que se trata de un experimento a pequeña escala y que no garantiza un nivel cercano a motores profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`) |
| Parametros totales | 8.745.600 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (requerido por el cliente de tablero) |
| Tipos de cuantizacion | F32 (safetensors y GGUF sin cuantizar) |
| Idiomas soportados | en (el modelo emite coordenadas, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (llama.cpp b6500) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con la clase `LlamaForCausalLM`, inicializado desde pesos aleatorios. El tokenizer procede de SmolLM2-135M-Instruct y se ha extendido con tokens específicos del tablero. La entrada es la secuencia de piezas del tablero completo en cuatro direcciones, y la salida es una coordenada en el rango A–O, 1–15, donde `X` representa al jugador actual y `O` al oponente.

El entrenamiento combina un conjunto histórico de entrenamiento con muestras de profesor generadas a partir de aperturas naturales y partidas continuas, aumentos por rotación y espejo, y supervisión auxiliar punto a punto. La técnica declarada es destilación de conocimiento desde un profesor denominado v66, cuyos pesos y datos de entrenamiento no se distribuyen con el paquete. Los pesos se seleccionan únicamente según el conjunto de validación completo. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de una coordenada de jugada a partir de una codificación textual del tablero completo.
- Producción de jugadas legales en la gran mayoría de los casos: 249/252 en validación, 125/127 en test normal y 63/63 en test denso.
- Reconocimiento de patrones tácticos inmediatos: 29/32 en situaciones de cinco en raya recién generadas, 32/32 en bloqueos de cuatro únicos y 23/32 cuando debe priorizar formar cinco frente a bloquear un cuatro.
- Juego en partidas completas: 127/128 jugadas legales en validación con aperturas naturales y partidas continuas.
- Integración con Ollama mediante un `Modelfile` incluido y con Transformers vía `AutoModelForCausalLM`.
- Ejecución en CPU sin GPU, gracias a su tamaño reducido (8,7 M de parámetros).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito. No es un modelo conversacional: el autor indica expresamente que enviar texto libre como "juego H8" no sustituye a la codificación del tablero del paquete.

## Casos de uso

- Prototipado de agentes de juego en terminal: el paquete incluye `play_terminal.py`, un cliente con interfaz de ratón y teclado que carga los pesos HF locales y permite jugar contra el modelo en CPU sin infraestructura adicional.
- Investigación sobre destilación de conocimiento en dominios cerrados: sirve como caso de estudio reproducible de un modelo de 8,7 M de parámetros entrenado desde cero con un profesor y evaluado con métricas de legalidad y acierto táctico.
- Pruebas de protocolos de codificación de estado en texto: el proyecto define `pointer_protocol.py` y `prompt.py` para serializar tableros de 225 celdas y parsear la respuesta, útil como referencia para diseñar interfaces modelo-entorno.
- Integración en pipelines de evaluación de jugadas: mediante la API `/api/chat` de Ollama y el script de ejemplo con `curl`, se puede consultar la jugada sugerida para una posición concreta dentro de un banco de pruebas automatizado.
- Docencia y demostraciones de modelos decoder-only pequeños: el reducido tamaño y la licencia Apache-2.0 permiten desplegarlo en entornos educativos sin GPU y sin coste de licencia.
- Comparación de backends de inferencia: el repositorio incluye `reports/optimized_backend.json` con comprobaciones de generación emparejada entre backends, lo que facilita estudiar diferencias numéricas entre implementaciones en F32.

## Benchmarks y rendimiento

| Conjunto | Mejor jugada | Jugada legal |
|---|---:|---:|
| Validación | 138/252 | 249/252 |
| Test normal | 73/127 | 125/127 |
| Test denso | 29/63 | 63/63 |

| Escenario táctico (generado) | Aciertos |
|---|---:|
| Cinco en raya inmediato | 29/32 |
| Bloqueo de cuatro único | 32/32 |
| Prioridad de cinco sobre bloqueo de cuatro | 23/32 |

| Partidas completas contra oponente aleatorio | Resultado |
|---|---:|
| Victorias | 3 |
| Derrotas | 0 |
| Derrotas por salida ilegal | 1 |
| Empates | 0 |
| Partidas alcanzando límite de jugadas | 0 |

El autor advierte de que los conjuntos de test se han usado en versiones anteriores, por lo que no constituyen una prueba ciega, y que la tasa de acierto de etiqueta no equivale a tasa de victoria competitiva. El oponente aleatorio es muy débil y el resultado no constituye una calificación de fuerza de juego profesional.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F32 (8,7 M de parámetros, aproximadamente 35 MB de pesos más overhead de activaciones y caché KV para 2048 tokens).
- GPU recomendadas: no requiere GPU; cualquier GPU con más de 1 GB de memoria puede ejecutarlo. Funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU con memoria compartida suficiente.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), Ollama mediante el `Modelfile` incluido, y llama.cpp a través del GGUF en F32.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo en la información disponible. El diseño está pensado para generación de 4 tokens (`max_new_tokens=4`) por jugada en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---:|---|---|---|
| l898974766/gomoku | LLM decoder-only especializado | 8,7 M | 2048 tokens | Gomoku 15×15 por destilación | Apache-2.0 |
| daanvancamp/gomoku-AI | Modelo de RL | no disponible | no disponible | Gomoku con aprendizaje por refuerzo | no disponible |
| Gomoku-AI (whyb) | ResNet + RL (estilo AlphaZero) | no disponible | no disponible | Gomoku con auto-juego | no disponible |

No se dispone de datos de benchmarks comunes ni de especificaciones detalladas de las alternativas encontradas en la búsqueda web, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo produce coordenadas de gomoku y no mantiene conversación ni responde a instrucciones en lenguaje natural.
- Puede emitir coordenadas ilegales o ya ocupadas; el cliente debe validar la salida y el autor indica que una salida ilegal detiene la partida en la interfaz de terminal.
- Los conjuntos de test se han reutilizado en versiones previas, por lo que las métricas no son una evaluación ciega.
- La tasa de acierto de etiqueta no equivale a fuerza de juego; el único enfrentamiento completo documentado es contra un oponente aleatorio muy débil.
- El autor declara que es un experimento a pequeña escala en CPU y que no garantiza un comportamiento cercano a motores profesionales.
- Los pesos del profesor v66 y los datos de entrenamiento no se distribuyen, lo que limita la reproducibilidad completa del entrenamiento.
- Los pesos se serializan en F32, pero el autor advierte de que distintos backends de cómputo no garantizan resultados idénticos bit a bit.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni soporte; el tokenizer procede de SmolLM2-135M-Instruct, también Apache-2.0.
- No se documentan sesgos sociales relevantes por el dominio cerrado, pero sí existe riesgo de alucinación en forma de coordenadas inválidas o jugadas tácticas erróneas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/l898974766/gomoku
- Proyecto de referencia con aprendizaje por refuerzo (daanvancamp): https://github.com/daanvancamp/gomoku-AI
- Proyecto Gomoku-AI con ResNet y RL (whyb): https://whyb.github.io/Gomoku-AI/README.en.html
- Tokenizer de origen (SmolLM2-135M-Instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
