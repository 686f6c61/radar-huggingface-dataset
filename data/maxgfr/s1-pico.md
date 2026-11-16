# maxgfr/s1-pico

## Resumen

s1-pico es un modelo de decisión de tipo "System One" desarrollado por maxgfr, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un encoder ModernBERT extremadamente pequeño, con 202.305 parámetros totales (formato f16), empaquetado en un archivo GGUF de aproximadamente 545 KB. Su función no es la generación de texto libre, sino responder a preguntas tipadas (`choice`, `score`, `noul`) sobre un estado de juego expresado en texto, devolviendo probabilidades calibradas en un único pase forward.

El modelo forma parte del ecosistema skycmd, un motor de decisión escrito íntegramente en Rust que puede ejecutarse de forma nativa, en WebAssembly o a través de `llama-server` mediante el endpoint `/v1/systemone`. Esto lo convierte en una pieza poco habitual: un modelo de decisión ligero, con formato compatible con llama.cpp, orientado a agentes que operan en entornos de juego con bucles cerrados y latencias de microsegundos.

Su relevancia actual radica en demostrar que un modelo de 200.000 parámetros puede resolver tareas de decisión en juegos concretos (Flappy Drone, Rescue Run, Obstacle Dodge) con resultados competitivos frente a oráculos, siempre que se entrene con datos etiquetados por oráculos exactos y se apliquen rondas de DAgger. No es un modelo de propósito general ni un LLM: es un clasificador de decisiones especializado y de dominio muy acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) con cabeza de decisión por tipo de pregunta |
| Parámetros totales | 202.305 (f16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16 (encoder), f32 (cabeza); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`modern-bert` architecture), f16 encoder + f32 head |

## Arquitectura y entrenamiento

s1-pico es un encoder ModernBERT con una cabeza de decisión que se ejecuta una vez por cada tipo de pregunta. Cada opción se representa mediante un marcador `[MASK]`, y la salida se normaliza con `softmax(score / T)`, donde la temperatura `T` se calibra por tipo de pregunta y por rango de número de opciones. El modelo responde a tres tipos de consulta: `choice` (selección entre opciones), `score` (puntuación) y `noul` (probablemente una decisión binaria o de rechazo, aunque el detalle no se especifica en la información disponible).

El entrenamiento se realizó desde cero en Rust con mlx-rs sobre Apple Silicon. El pipeline incluye preentrenamiento con masked-language modeling, entrenamiento de decisión sobre objetivos suaves, uso de Muon para las matrices del encoder y AdamW para el resto con un schedule WSD, calibración de temperatura por tipo y rondas de DAgger sobre los juegos. Los datos de preentrenamiento provienen de FineWeb, TinyStories y SimpleStories, mientras que los datos de decisión se construyeron a partir de conjuntos tipados, BoolQ, MNLI, ARC, CommonsenseQA y Banking77 convertidos a preguntas tipadas, además de estados de juego etiquetados por oráculos exactos. Parte de los datos se generó con GLM-5.3-Flash (MIT).

## Capacidades

- Clasificación de decisiones sobre estados de juego en formato texto, con salida de probabilidades calibradas.
- Respuesta a tres tipos de pregunta: `choice`, `score` y `noul`.
- Inferencia en un único pase forward, sin generación autorregresiva.
- Compatibilidad con el motor skycmd (nativo en Rust), con `llama-server` (`/v1/systemone`) y con wllama 3.8.1.
- Ejecución en WebAssembly (WASM) además de nativa.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto libre, código, matemáticas ni visión.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo "thinking" ni de atención sobre contexto largo documentada.

## Casos de uso

- Decisión en tiempo real dentro de videojuegos: el modelo lee el estado del juego como texto y devuelve una acción con probabilidad calibrada en 137,6 µs nativos (Apple M5), lo que permite integrarlo en bucles de juego sin afectar la tasa de refresco.
- Agentes de juego en el navegador: gracias a su tamaño (545 KB) y a la ejecución en WASM, puede desplegarse en clientes web mediante wllama sin infraestructura de servidor.
- Sustitución de heurísticas manuales en juegos sencillos: en Flappy Drone alcanzó 200/200 tuberías sin colisiones, lo que lo hace adecuado como política de referencia o baseline para comparar con reglas escritas a mano.
- Sistemas de veto o reflexión en agentes: en Obstacle Dodge registró 1.026 vetos de reflejo con un 83 % de acierto frente a un oráculo del 87 %, útil como capa de seguridad de bajo coste en pipelines de decisión.
- Prototipado de modelos de decisión en Rust: al integrarse en skycmd y en `llama-server`, sirve para validar formatos de decisión tipada y calibración de temperaturas antes de escalar a modelos mayores.
- Investigación sobre DAgger y calibración: el modelo documenta el efecto de dos rondas de DAgger (de 82 % de acierto en test y 30/30 caídas a 200/200), lo que lo convierte en un caso de estudio reproducible para experimentos de imitación interactiva.
- Evaluación de compatibilidad GGUF en motores alternativos: permite comparar diferencias numéricas entre skycmd, llama-server (4,7e-4 de diferencia máxima de probabilidad) y wllama (1,1e-4).

## Benchmarks y rendimiento

Resultados en bucle cerrado sobre `sky-arena`, 30 episodios por juego, semilla 7:

| Juego | Resultado |
|---|---|
| Flappy Drone | 200 / 200 tuberías, 0 colisiones |
| Rescue Run | 100 % |
| Obstacle Dodge | 83 % (oráculo 87 %), 1.026 vetos de reflejo |

Latencia por decisión: 137,6 µs en nativo y 588,6 µs en WASM (Apple M5). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en f16 (545 KB de archivo), más el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en Apple Silicon. Cualquier GPU con soporte de llama.cpp es suficiente.
- Cabe en consumer GPU: sí, en cualquier modelo (RTX 4090, RTX 3060, iGPU, etc.), así como en CPU y en navegador vía WASM.
- Opciones de despliegue: skycmd (`sky-serve`, `skycmd decide`), `llama-server` con `/v1/systemone`, wllama 3.8.1. Ollama carga el archivo pero rechaza la codificación de decisión `laya`.
- Latencia y throughput: 137,6 µs por decisión en nativo y 588,6 µs en WASM sobre Apple M5; no se documenta throughput agregado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión tipada con formato GGUF en la documentación proporcionada. La comparación más cercana disponible son los oráculos de los propios juegos:

| Referencia | Resultado en Obstacle Dodge |
|---|---|
| s1-pico | 83 % |
| Oráculo | 87 % |

Para el resto de categorías (tamaño, contexto, licencia, disponibilidad) no hay alternativas documentadas en la información disponible.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: solo responde a preguntas tipadas sobre estados de juego en inglés; no es un LLM de propósito general.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible; no se recomienda su uso con estados de juego extensos sin validación previa.
- Riesgo de sobreajuste a los tres juegos evaluados (Flappy Drone, Rescue Run, Obstacle Dodge); el rendimiento fuera de ese dominio no está documentado.
- La calibración depende de temperaturas por tipo y por rango de opciones; cambios en el formato de las preguntas pueden degradar las probabilidades.
- Ollama carga el archivo pero rechaza la codificación `laya`, por lo que no es un runtime válido para este modelo.
- Las diferencias numéricas entre motores (hasta 4,7e-4) pueden afectar a decisiones con umbrales ajustados.
- Licencia Apache 2.0 permite uso comercial, pero parte de los datos de entrenamiento se generaron con GLM-5.3-Flash (MIT); conviene revisar `DATA_LICENSES.md` antes de un despliegue en producción.
- Con solo 12 descargas y 0 likes en el momento de la ficha, no hay validación comunitaria independiente del rendimiento declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s1-pico
- Demo (Space): https://huggingface.co/spaces/maxgfr/s1-pico
- Código fuente (skycmd, Rust): https://github.com/maxgfr/skycmd
- Artículo sobre DAgger (capítulo 20): https://maxgfr.github.io/skycmd/tutorial/20-dagger-lessons
- Guía de instalación y formato de peticiones: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md
