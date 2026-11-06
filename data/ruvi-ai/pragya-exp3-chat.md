# RuVI-AI/Pragya-EXP3-CHAT

## Resumen

Pragya-EXP3-CHAT es un modelo de lenguaje de tipo decoder-only desarrollado por RuVI-AI, entrenado desde cero como parte de una línea experimental de modelos a pequeña escala. Con 28,5 millones de parámetros totales, se posiciona como un banco de pruebas arquitectónico más que como un modelo de producción: su propia model card lo describe explícitamente como "no un producto", sin alineación, sin fiabilidad factual y sin garantías de seguridad. La versión publicada corresponde a la iteración exp3 (etiquetada internamente como exp2) de la familia Pragya.

El modelo emplea una arquitectura transformer con 16 capas, tamaño oculto de 384, atención con GQA (12 cabezas de consulta y 6 de clave/valor), FFN SwiGLU con dimensión 768, codificación posicional RoPE y embeddings atados. Incorpora dos innovaciones técnicas destacables: Exclusive Gated Attention (una compuerta por cabeza más una corrección XSA que elimina la componente del contexto alineada con el vector de valor propio del token) y Engram, una memoria de n-gramas hasheada en las capas 1 y 8. El contexto es de 1.024 tokens y el vocabulario de 12.288 tokens BPE a nivel de byte.

Su relevancia es fundamentalmente metodológica: sirve para medir cambios controlados entre ejecuciones de un mismo stack de entrenamiento desde cero, con un presupuesto de unos 5.000 millones de tokens y un optimizador Muon con AdamW. No está pensado para uso comercial real, y de hecho adolece de un fallo conocido en el token EOS que provoca que el modelo rellene todo el contexto disponible en lugar de detenerse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `PragyaX1DecoderOnly` (transformer decoder-only) |
| Parametros totales | 28.514.246 (28,5 M) |
| Parametros activos | no disponible (MoE desactivado) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `custom_code`) |

Especificaciones adicionales:

| Parametro | Valor |
|---|---|
| Backbone (sin embeddings ni Engram) | 21,25 M |
| Embeddings (entrada y LM head atados) | 4,72 M |
| Tablas de búsqueda Engram | 2,53 M |
| Capas | 16 |
| Tamaño oculto | 384 |
| Cabezas de atención | 12 query / 6 key-value (GQA) |
| Dimensión de cabeza | 32 |
| FFN | SwiGLU, dimensión 768 (`ffn_mult = 2`) |
| Codificación posicional | RoPE, base 10.000 |
| Memoria Engram | capas 1 y 8, búsqueda de 3-gramas sobre 9.807 clases |
| Vocabulario | 12.288 BPE a nivel de byte (`pragya.tokenizer.json`) |
| Perplejidad de validación | 13,6 |
| Precisión de validación | 47,1 % |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con atención causal estándar sobre la que se superponen dos mecanismos propietarios. El primero, Exclusive Gated Attention, aplica una compuerta sigmoide por cabeza calculada a partir de las 16 primeras dimensiones ocultas de la entrada del bloque (`gate = 2 · sigmoid(W_gate · x[:16])`), de modo que con `W_gate = 0` la compuerta vale exactamente 1 y el bloque se comporta como atención causal pura al inicio del entrenamiento. El segundo, XSA, resta de la salida de atención la componente alineada con el vector de valor propio del token (`v_unit`), con la corrección anulada en la posición 0 para no romper el caso causal trivial. El FFN es SwiGLU con dimensión 768 y las posiciones se codifican con RoPE de base 10.000.

La innovación más singular es Engram, una memoria de n-gramas hasheada insertada en las capas 1 y 8: las secuencias se normalizan (NFKC, minúsculas, eliminación de acentos) y se mapean a 9.807 clases, cada una con una tabla de embeddings aprendida de 2,53 M de parámetros en total. Esto obliga a usar el tokenizer exacto con el que se entrenó el modelo, ya que la tabla se verifica contra él en tiempo de carga. El entrenamiento usó aproximadamente 5.000 millones de tokens, optimizador Muon con AdamW, schedule WSD, 19.000 pasos, batch de 320 y precisión BF16. La decodificación con KV cache está implementada de forma exacta dentro de la ventana de 1.024 tokens (los logits por paso coinciden con la decodificación sin caché en ~1e-6 y `generate()` greedy produce salidas idénticas); más allá de la ventana, el modelo re-codifica los últimos 1.024 tokens en cada paso con comportamiento de ventana deslizante.

## Capacidades

- Generación de texto causal en inglés, con vocabulario BPE a nivel de byte.
- Razonamiento básico de opción múltiple y tareas de sentido común a nivel muy elemental (por encima del azar en PIQA y HellaSwag, cerca del azar en ARC-Challenge).
- Completado de lenguaje y tareas de finalización de frases (92 % de acierto en la categoría de language completion de BananaMind Base Bench 1.1).
- Aritmética simple en formato de opción múltiple (ArithMark-3, 38,30 % frente al 25 % de azar).
- Teoría de la mente elemental (Tiny Theory of Mind, 31,85 % `acc_norm` frente al 25 % de azar).
- Soporte de KV cache en `generate()` para decodificación incremental exacta dentro de la ventana de contexto.
- No soporta tool calling, function calling, agentes, multi-step reasoning estructurado, visión, audio ni modo thinking; la model card no declara ninguna de estas capacidades.
- Multilingüe: únicamente inglés.

## Casos de uso

- Investigación en arquitecturas desde cero: el modelo sirve como banco de pruebas reproducible para medir el efecto de Exclusive Gated Attention y Engram frente a una línea base de atención causal, comparando perplejidad y precisión de validación entre ejecuciones.
- Estudio de memorias n-grama hasheadas: Engram permite experimentar con lookup de 3-gramas en capas concretas (1 y 8) y evaluar su impacto en tareas de completado de lenguaje, donde el modelo alcanza 92 % en la categoría correspondiente.
- Validación de stacks de entrenamiento: con 19.000 pasos, batch 320 y ~5B tokens, es un caso de prueba útil para verificar pipelines de Muon+AdamW, WSD y BF16 a pequeña escala antes de escalar.
- Pruebas de decodificación con KV cache: el modelo incluye una implementación de caché verificada contra decodificación sin caché, útil para validar motores de inferencia propios con atención causal, RoPE y máscaras XSA.
- Docencia y divulgación: por su tamaño (28,5 M de parámetros, 0,1 GB de repo) se puede ejecutar en CPU y en GPUs de gama baja, lo que lo hace adecuado para demostrar el funcionamiento interno de un transformer decoder-only con GQA.
- Evaluación de arneses tipo lm-evaluation-harness: sus resultados 0-shot en HellaSwag, ARC, PIQA, ArithMark y benchmarks de razonamiento permiten validar la integración de nuevos benchmarks con un modelo de referencia pequeño.
- Reproducción de fallos conocidos: el bug del token EOS (probabilidad 0, el modelo rellena todo el contexto) lo convierte en un caso de estudio para depurar lógica de parada en generación.

## Benchmarks y rendimiento

Resultados 0-shot publicados en la model card. El nivel de azar es 25 % en tareas de cuatro opciones y 50 % en PIQA.

| Benchmark | Puntuación | Azar |
|---|---|---|
| HellaSwag | 29,76 % | 25 % |
| ARC-Easy | 31,57 % | 25 % |
| ARC-Challenge | 23,98 % | 25 % |
| PIQA | 61,86 % | 50 % |
| ArithMark-3 | 38,30 % | 25 % |
| LogicMark (`acc`) | 42,74 % ± 0,70 | 25 % |
| LogicMark (`acc_norm`) | 42,80 % ± 0,70 | 25 % |
| Tiny Theory of Mind (`acc`) | 35,60 % ± 1,07 | 25 % |
| Tiny Theory of Mind (`acc_norm`) | 31,85 % ± 1,04 | 25 % |

BananaMind Base Bench 1.1 (runner oficial): Elo global 995, precisión bruta 177/350 (50,57 %), precisión ponderada 47,27 % frente al 25 % de azar, con intervalo del 95 % de aproximadamente ±5 puntos. En la categoría de language completion: 46/50 (92,0 %).

Métricas de validación del modelo: perplejidad 13,6 y precisión 47,1 %. La model card advierte que esta precisión es inferior al 49,7 % de la ejecución test3 porque los datos de evaluación son más difíciles, por lo que no son directamente comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 60 MB para los pesos (28,5 M de parámetros × 2 bytes), más overhead de activaciones y caché KV, muy por debajo de 1 GB en la práctica.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU sin GPU dedicada.
- GPUs de datacenter (A100, H100) innecesarias para inferencia; solo tendrían sentido para reentrenar el modelo desde cero.
- Despliegue: al usar `custom_code` y un tokenizer propio, requiere `transformers` con `trust_remote_code=True` y el tokenizer `pragya.tokenizer.json` exacto. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual; vLLM y TGI no están verificados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño del modelo sugiere decodificación en tiempo real incluso en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. Por tamaño y naturaleza experimental, los referentes habituales serían modelos pequeños tipo GPT-2 small (124 M), TinyLlama (1,1 B) o SmolLM (135 M en adelante), pero ninguno de ellos comparte la combinación de Engram y Exclusive Gated Attention, y la model card no ofrece comparaciones cruzadas.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Pragya-EXP3-CHAT | 28,5 M | 1.024 | Apache 2.0 | Experimental, sin alinear, bug EOS conocido |
| GPT-2 small | 124 M | 1.024 | MIT | Referencia histórica, sin GQA ni Engram |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Entrenado con ~3T tokens, alineado |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Entrenado con ~600B tokens, alineado |

La comparación de rendimiento con estos modelos no está disponible en la información proporcionada, y las diferencias de presupuesto de entrenamiento (5B tokens frente a cientos de miles de millones) hacen que cualquier comparación directa sea engañosa.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo "no es un producto": no está alineado, no es factualmente fiable y no es seguro.
- Bug conocido del token EOS: su probabilidad es 0, por lo que el modelo no se detiene y rellena todo el contexto de 1.024 tokens en cada generación. Requiere truncado manual en producción.
- Ventana de contexto muy corta (1.024 tokens) y comportamiento de ventana deslizante más allá de ese límite, con re-codificación completa en cada paso.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo alto de alucinación y de generar texto incoherente fuera de tareas de completado simple, dado su tamaño y presupuesto de entrenamiento.
- Dependencia estricta del tokenizer original: la tabla Engram se verifica contra él en carga, por lo que usar otro tokenizer rompe el modelo.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas hacen inviable cualquier aplicación en producción real.
- No hay datos publicados sobre sesgos específicos más allá de la advertencia genérica de falta de alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RuVI-AI/Pragya-EXP3-CHAT
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
