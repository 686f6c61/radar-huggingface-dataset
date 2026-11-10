# lijie1228/a-random-number-model

## Resumen

`a-random-number-model` es un modelo GGUF de juguete publicado por el usuario lijie1228 en Hugging Face. No es un modelo de lenguaje entrenado: es una construcción determinista de 1 capa de tipo llama con todos los pesos a cero, escrita a mano, cuyo único comportamiento es emitir un número aleatorio dentro de un rango fijo y detenerse. Existe en tres variantes según el rango: binario (0/1), dígito (0-9) y hasta 100 (0-100).

El interés técnico no está en sus capacidades lingüísticas —no las tiene— sino en que demuestra de forma pedagógica cómo funciona la pila de inferencia de llama.cpp: embeddings, logits, softmax, sampler y token EOS. La "aleatoriedad" emerge de un softmax uniforme sobre N tokens numéricos combinado con la estocasticidad del sampler, no de ningún aprendizaje. El autor lo etiqueta explícitamente como `toy-model` y `zero-training`.

Es relevante ahora como herramienta de verificación de pipelines: permite comprobar que un frontend (Ollama, LM Studio, llama.cpp) respeta los parámetros de muestreo, que la plantilla de chat se aplica correctamente y que el sampler no recorta la distribución. Su tamaño (249 KB en Q2_K) y su huella de memoria (30,9 MB de pico en CPU) lo hacen trivial de desplegar en cualquier entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama, 1 capa con pesos a cero (residual identidad) |
| Parametros totales | 592.128 (variantes binary y digit); 638.208 (variante num100) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; probado con ctx 8192 |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (recomendada), Q4_K_S, Q3_K_M, Q2_K |
| Idiomas soportados | zh, en (declarados; el modelo ignora el idioma de entrada) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); generador en Python con numpy |

## Arquitectura y entrenamiento

La arquitectura es un transformer llama de una sola capa cuyos pesos de atención y FFN son todos cero, de modo que la conexión residual hace que la salida de la capa sea igual a la entrada. El embedding solo distingue dos estados: "token numérico" y "cualquier token no numérico", por lo que el estado oculto depende exclusivamente de si el token anterior era un dígito. En el estado A, los N logits de los tokens numéricos son exactamente iguales y el resto (incluido EOS) recibe -1597,96, garantizando que no se pueda muestrear fuera de rango. Tras emitir un número se entra en el estado B, donde solo EOS tiene logit positivo y la generación se detiene.

No hay entrenamiento: no hay dataset, no hay retropropagación, no hay RLHF ni DPO. Los pesos se escriben a mano y el GGUF se genera con `tools/make_random_gguf.py`, que solo depende de numpy y realiza autocomprobaciones al generar (igualdad estricta de logits numéricos, EOS como argmax del segundo estado, coherencia de tokens no numéricos). El rango de salida queda fijado por la estructura, no por aprendizaje. La aleatoriedad efectiva proviene del softmax uniforme más la estocasticidad del sampler, por lo que la distribución solo es uniforme si se configuran correctamente `top_p=1.0`, `top_k≥N`, `temperature=1.0` y penalizaciones a 1.0/0.

## Capacidades

- Generación de un único número aleatorio uniforme dentro de un rango fijo (0/1, 0-9 o 0-100) y parada inmediata.
- Ignora por completo el contenido del prompt: funciona con entradas en chino, inglés, emoji, texto repetido o intentos de inyección de instrucciones.
- Compatible con el endpoint de chat de Ollama y con `llama-cli`/`llama-completion` de llama.cpp.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües reales (los tags zh/en son declarativos).
- No dispone de modo thinking, visión ni audio.
- Sirve como oráculo de aleatoriedad verificable y como test de conformidad de samplers y plantillas de chat.

## Casos de uso

- Verificación de parámetros de muestreo en frontends: cargar el GGUF en LM Studio u Ollama y comprobar que con `top_p=1.0` y `top_k≥N` la distribución pasa un test χ²; con los valores por defecto de Ollama (`top_p=0.9`, `top_k=40`) el dígito `0` no apareció en 300 tiradas, lo que revela configuraciones mal ajustadas.
- Test de integración de pipelines llama.cpp: validar que la versión de llama.cpp, la plantilla de chat y el manejo de EOS funcionan, ya que cualquier fallo se manifiesta como salida vacía o fuera de rango.
- Generación de tiradas aleatorias en demos y juegos: lanzar un dado de 6 caras con `--numbers "1,2,3,4,5,6"`, elegir un número de lotería o simular un coin flip sin depender de servicios externos.
- Pruebas de carga y latencia con huella mínima: el modelo Q2_K ocupa 249 KB y alcanza unos 240 tok/s en CPU con 4 hilos y 30,9 MB de pico, útil para medir el overhead del runtime sin que el modelo sea el cuello de botella.
- Docencia y divulgación: explicar con un artefacto ejecutable cómo se forman los logits, cómo actúa softmax y por qué el sampler determina la distribución final.
- Verificación de plantillas de chat: comprobar que un servidor aplica correctamente `{{ bos_token }}` y descarta el cuerpo del mensaje, ya que en modo conversación el contenido se ignora a nivel de plantilla.
- Pruebas de robustez frente a inyección de prompts: servir como caso base negativo donde ninguna instrucción del usuario altera la salida, útil para calibrar detectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas de conformidad: 18/18 archivos GGUF producen valores legales, longitud constante de 1 y χ² con p ≥ 0,01; 900 tiradas con parámetros por defecto sin valores fuera de rango ni salidas vacías; y 3200/3200 salidas legales en `random-digit` sobre 9 tipos de entrada (chino, inglés, emoji, repetición de 300 caracteres, inyección de instrucciones, terminación en dígito, espacios en blanco). Rendimiento medido: `random-num100-Q2_K` a 4 hilos en CPU pura, ctx 8192, pico de 30,9 MB y aproximadamente 240 tok/s.

## Requisitos de hardware

- VRAM: inferior a 1 MB para cualquier cuantización; el pico de memoria en CPU con ctx 8192 es de 30,9 MB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con soporte CUDA, Metal o Vulkan en llama.cpp es sobrada.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU; también en Raspberry Pi.
- Despliegue: llama.cpp (`llama-cli`, `llama-completion`), Ollama (mediante Modelfile), LM Studio y cualquier frontend compatible con GGUF.
- Latencia y throughput: aproximadamente 240 tok/s en CPU con 4 hilos para `random-num100-Q2_K`; la generación es de un solo token por consulta.
- Advertencia de runtime: en llama.cpp b11588, `llama-completion` puede fallar sin `-no-cnv`; `llama-cli -st` no se ve afectado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| a-random-number-model (este) | 592.128 / 638.208 | no especificado (probado 8192) | Emitir un numero aleatorio en rango fijo | MIT | GGUF |
| Modelos de chat pequenos (p. ej. Qwen2.5-0.5B, TinyLlama-1.1B) | 500 M - 1,1 B | 2k - 32k | Generacion de texto general | Apache-2.0 / MIT | safetensors, GGUF |
| Generadores aleatorios del sistema (`/dev/urandom`, `random`) | no aplica | no aplica | Aleatoriedad criptografica o pseudoaleatoria | depende del SO | no aplica |
| Modelos de juguete tipo "echo" o "constant output" | variable, minimo | no aplica | Demostracion de runtime | variable | GGUF |

La comparación con modelos de chat no es funcional: este modelo no compite en generación de texto. Frente a un generador del sistema, la diferencia es que aquí la aleatoriedad pasa por la pila completa de inferencia de un LLM, lo que lo convierte en un test de esa pila y no en una fuente de aleatoriedad criptográficamente segura.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no comprende, no responde y no razona; cualquier expectativa de generación de texto es un error de uso.
- La uniformidad depende por completo de la configuración del sampler. Con `top_p<1` o `top_k<N` se recortan valores del rango; con `temperature≠1.0` o penalizaciones activas la distribución se sesga. El autor documenta que con los valores por defecto de Ollama (`top_p=0.9`, `top_k=40`) el dígito `0` no salió en 300 tiradas y en `random-num100` solo quedaban accesibles unos 37 valores de 101.
- Un prompt vacío en Ollama devuelve cadena vacía, comportamiento del frontend y no del modelo; basta con enviar un espacio o cualquier carácter.
- En modo de completación pura, si la entrada termina en dígito el modelo se detiene sin emitir número, porque el estado de parada se activa con "el token anterior es numérico". En modo conversación no ocurre, ya que la plantilla descarta el cuerpo del mensaje.
- No es adecuado como fuente de aleatoriedad para criptografía, juegos de azar con dinero real ni muestreo estadístico riguroso; para esos fines deben usarse generadores dedicados.
- Los tags de idioma zh/en no implican capacidad multilingüe real.
- Licencia MIT: permite uso comercial y modificación sin restricciones prácticas, pero al no haber entrenamiento no hay garantías de comportamiento más allá de la conformidad estructural descrita.
- El repositorio figura con 0.0 GB de tamaño y 298 descargas; no hay historial de mantenimiento más allá de la actualización de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lijie1228/a-random-number-model
- Documentación técnica del autor: `docs/how-it-works.md` (incluida en el repositorio)
- Generador de GGUF: `tools/make_random_gguf.py` (incluido en el repositorio)
- Modelfiles para Ollama: `Modelfiles/Modelfile.binary`, `Modelfiles/Modelfile.digit`, `Modelfiles/Modelfile.num100`
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
