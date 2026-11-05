# ScarletKc/Typeling-25M

## Resumen

Typeling-25M es un modelo de lenguaje en ingles de 25,4 millones de parametros especializado en prediccion de escritura: completa la palabra que se esta tecleando y predice la siguiente, pensado para interfaces de texto fantasma (ghost text) o barras de candidatos en chats y escritura cotidiana. Lo desarrolla ScarletKc y se distribuye bajo licencia Apache 2.0. Su interes radica en que demuestra que un modelo transformer diminuto, entrenado en una sola GPU de consumo, puede superar de forma clara a modelos n-grama clasicos en una tarea concreta y medible, con latencias de unos 25 ms por sugerencia en CPU de portatil.

El modelo parte de SupraLabs/Supra2-Medium-Base, una arquitectura Qwen3 de 7 capas, tamano oculto 512, 8 cabezas, vocabulario de 16.384 tokens y contexto de 1.024 tokens, preentrenada con 20.000 millones de tokens de FineWeb-Edu. Sobre esa base se hizo un preentrenamiento continuado de todos los parametros con 150 millones de tokens y un corpus orientado a conversacion y escritura.

La relevancia actual es practica: los teclados y asistentes de escritura necesitan modelos que quepan en el dispositivo, respondan en milisegundos y reparen errores tipograficos. Typeling-25M se publica junto con un decodificador especifico (Typeling) que convierte las predicciones de tokens en sugerencias de palabras con probabilidad, corrige errores de tecleo y aprende vocabulario del usuario localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3) |
| Parametros totales | 25.371.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | float32 en PyTorch; Q8_0 disponible en el repo GGUF (27,6 MB); pesos de 16 bits (50,8 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en ScarletKc/Typeling-25M-GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la arquitectura de Qwen3: 7 capas, tamano oculto de 512, 8 cabezas de atencion, vocabulario de 16.384 tokens y ventana de contexto de 1.024 tokens. Se inicializa desde SupraLabs/Supra2-Medium-Base, preentrenado con 20.000 millones de tokens de FineWeb-Edu, y se somete a un preentrenamiento continuado de todos los parametros con 150 millones de tokens (unas 2,2 epocas de un corpus de 67 millones de tokens), en 4.578 pasos de 32.768 tokens con secuencias de 512, AdamW con learning rate 6e-4, 5 % de warmup, weight decay 0,1 y precision mixta bf16. El entrenamiento completo tardo 58 minutos en una RTX 5070 Ti de portatil.

Los datos combinan chat y escritura procedentes de FineWeb (ODC-By 1.0, 18,5 millones de palabras, 30 % del entrenamiento), SODA, WildChat-1M, oasst2 y Ubuntu IRC filtrado; cada corpus se limpio de correos, URL y telefonos, y en las fuentes de chat solo se conservaron turnos que parecen escritos por una persona. Se reservo un 1 % de cada corpus para desarrollo y otro 1 % para test. Hay dos modificaciones tecnicas orientadas a la tarea: el token `</s>` separa textos y su embedding se inicializo a partir del token de salto de linea antes del entrenamiento, y en un 1 % de las palabras la secuencia `" word"` se re-tokenizo como `" "` + `"word"` para que el modelo sepa continuar texto que termina en espacio. No se documenta RLHF ni DPO; el ajuste es puramente de preentrenamiento continuado.

## Capacidades

- Prediccion de la siguiente palabra en ingles, condicionada al texto previo, con salida de distribucion sobre el vocabulario.
- Completado de la palabra en curso a partir de un prefijo parcial (por ejemplo, `"Let me kn"` sugiere `"ow"`).
- Correccion de errores tipograficos mediante el decodificador Typeling: teclas adyacentes, letras sobrantes o faltantes y letras intercambiadas.
- Generacion de candidatos con probabilidad para barras de sugerencias (top-k con puntuaciones, por ejemplo `('much', 0.98)`).
- Manejo de texto que termina en espacio gracias a la re-tokenizacion durante el entrenamiento.
- Mezcla con un modelo n-grama ligero para palabras raras y aprendizaje local de vocabulario del usuario, ambas funciones del decodificador, no del modelo.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un modelo de lenguaje pequeno y orientado a una unica tarea.

## Casos de uso

- Teclados moviles y de escritorio con texto fantasma: el modelo predice la continuacion con un coste de 23-25 ms por sugerencia en CPU de portatil, lo que permite mostrar la sugerencia en linea sin bloquear la interfaz.
- Barras de candidatos en aplicaciones de chat: el decodificador expone el top-3 con probabilidades y logra un KSR@3 del 58,0 % en conversacion, util para ofrecer tres alternativas pulsando una tecla.
- Autocorreccion en linea: con errores tipograficos simulados, el 85,6 % de las palabras mal escritas en chat terminan correctas con ghost text y el 94,5 % con barra de candidatos, adecuado para corregir sin interrumpir la escritura.
- Asistentes de redaccion en navegador o editor: con perplexity por palabra de 175 en FineWeb, sirve para completar frases cotidianas y textos informales, no para documentacion tecnica especializada.
- Procesamiento local y privado: al ocupar 27,6 MB en Q8_0 y ejecutarse con llama.cpp a unos 12.000 tokens/s de prompt y 2.800 tokens/s por paso en 4 hilos, cabe en dispositivos con recursos muy limitados y sin conexion.
- Prototipado e investigacion de interfaces de entrada: su tamano y su licencia Apache 2.0 permiten experimentar con decodificadores, simulaciones de tecleo y metricas de ahorro de pulsaciones sin coste de infraestructura.
- Filtrado o normalizacion de texto conversacional: la perplejidad baja en SODA (17,7) frente a IRC (323) permite usarlo como estimador de fluidez para distinguir registros.

## Benchmarks y rendimiento

Simulacion de tecleo en particiones de test no usadas para ninguna decision; el usuario teclea 0, 1, 2... letras y acepta la sugerencia con una pulsacion. KSR es la tasa de ahorro de pulsaciones con ghost text (sugerencia mostrada si su probabilidad es al menos 0,3); KSR@3 con barra de candidatos. 2.000 palabras por fuente.

| Fuente | n-grama 5 MB (KSR / KSR@3) | n-grama 23 MB (KSR / KSR@3) | Typeling-25M (KSR / KSR@3) |
|---|---|---|---|
| Chat (SODA, WildChat, oasst2) | 31,6 % / 48,8 % | 34,1 % / 50,6 % | 43,1 % / 58,0 % |
| Casual (Ubuntu IRC) | 22,7 % / 38,9 % | 24,4 % / 40,4 % | 29,8 % / 46,8 % |
| Escritura (FineWeb) | 22,3 % / 40,6 % | 23,9 % / 41,5 % | 32,4 % / 49,9 % |
| Precision de ghost text en chat | 51,0 % | 51,2 % | 54,7 % |

Prediccion de la siguiente palabra antes de teclear ninguna letra (acierto en primera posicion / en top-3):

| Fuente | n-grama 23 MB | Typeling-25M |
|---|---|---|
| SODA | 30,0 % / 46,9 % | 43,4 % / 62,5 % |
| WildChat | 22,6 % / 35,5 % | 31,3 % / 45,9 % |
| oasst2 | 18,9 % / 30,7 % | 28,1 % / 44,5 % |
| Ubuntu IRC | 13,9 % / 24,0 % | 19,0 % / 32,4 % |
| FineWeb | 15,0 % / 27,1 % | 24,8 % / 37,7 % |

Errores tipograficos (cada palabra de 3 o mas letras mal escrita; 1.000 palabras por fuente). KSR correcto -> con errores, y porcentaje de palabras mal escritas que acaban correctas:

| Escenario | n-grama 5 MB | Typeling-25M |
|---|---|---|
| Chat, ghost text | 32,1 % -> 22,7 % (48,5 %) | 44,5 % -> 40,1 % (85,6 %) |
| Chat, barra de candidatos | 49,6 % -> 40,5 % (71,0 %) | 59,4 % -> 55,7 % (94,5 %) |
| Casual, ghost text | 22,5 % -> 14,8 % (36,9 %) | 28,6 % -> 23,1 % (73,1 %) |
| Escritura, ghost text | 24,3 % -> 15,7 % (40,9 %) | 33,7 % -> 27,9 % (78,5 %) |

Perplejidad por palabra en test: SODA 17,7; WildChat 180; oasst2 107; Ubuntu IRC 323; FineWeb 175.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 100 MB en float32 (25,4 M de parametros), 50,8 MB en 16 bits y 27,6 MB en Q8_0; cabe en cualquier GPU y en la mayoria de CPUs.
- GPU recomendadas: ninguna en particular; el autor entreno en una RTX 5070 Ti de portatil. Para inferencia basta CPU, y opcionalmente A100, H100 o RTX 4090 si se sirve en lote.
- Cabe en GPU de consumo: si, en cualquier modelo con al menos 1 GB de VRAM; tambien en moviles y sistemas embebidos.
- Despliegue: transformers (probado con 4.57 y 5.22), llama.cpp con el archivo Q8_0 del repo GGUF, text-generation-inference (etiqueta del repo) y el paquete `typeling[lm]` con el decodificador propio.
- Latencia y throughput: 23-25 ms por sugerencia en CPU (Ryzen 9 9955HX, 4 hilos, PyTorch, float32), con p95 de 39-48 ms y p99 de 51-60 ms en chat; 33 ms (p95 63, p99 82) en texto web largo. En llama.cpp, Q8_0 alcanza unos 12.000 tokens/s de prompt y 2.800 tokens/s por paso en 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Typeling-25M | 25,4 M | 1.024 | Prediccion de escritura con decodificador propio | Apache 2.0 |
| n-grama Typeling 23 MB (Kneser-Ney) | no aplica | no aplica | Trigrama interpolado, sin red neuronal | incluido en Typeling |
| n-grama Typeling 5 MB | no aplica | no aplica | Trigrama interpolado podado | incluido en Typeling |

Frente a los n-grama, la mejora es consistente: +9 puntos de KSR en chat, +10,1 en escritura y +7,1 en casual, con un coste de almacenamiento similar al n-grama de 23 MB. No se dispone de comparacion con otros modelos neuronales de prediccion de escritura en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles; no hay soporte multilingue documentado.
- Contexto de 1.024 tokens, insuficiente para documentos largos o conversaciones extensas sin truncar.
- Perplejidad muy alta en dominios alejados del chat y la escritura cotidiana: 323 en Ubuntu IRC y 180 en WildChat, lo que anticipa sugerencias pobres en jerga tecnica o registros muy especificos.
- No es un modelo de instrucciones ni de razonamiento: no soporta tool calling, agentes ni tareas generativas complejas; usarlo fuera de la prediccion de escritura dara resultados deficientes.
- Riesgo de alucinacion y de sugerencias gramaticalmente plausibles pero incorrectas; la correccion de errores depende del decodificador Typeling, no del modelo en si.
- El tokenizador antepone un espacio a cada texto y el modelo espera `</s>` al inicio; integrarlo sin respetar estas convenciones degrada las predicciones.
- Sesgos: al entrenarse con FineWeb, SODA, WildChat, oasst2 y Ubuntu IRC puede reproducir sesgos de esos corpus conversacionales y de foros; no se documenta ninguna evaluacion de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Supra2-Medium-Base y los datasets subyacentes tienen sus propias condiciones que conviene revisar antes de desplegar en produccion.
- Rendimiento medido en un hardware concreto; en dispositivos mas lentos la latencia puede superar el umbral de interactividad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ScarletKc/Typeling-25M
- Version GGUF: https://huggingface.co/ScarletKc/Typeling-25M-GGUF
- Repositorio del decodificador Typeling: https://github.com/scarletkc/typeling
- Modelo base: https://huggingface.co/SupraLabs/Supra2-Medium-Base
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset SODA: https://huggingface.co/datasets/allenai/soda
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Ubuntu IRC filtrado: https://huggingface.co/datasets/common-pile/ubuntu_irc_filtered
