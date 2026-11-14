# dew6/stripe1flash-mountain

## Resumen

stripe1flash-mountain es un modelo de lenguaje a nivel de carácter desarrollado por el usuario dew6 y publicado en Hugging Face. Con 982 parámetros totales (0,000001B), se trata de un ejercicio educativo de implementación desde cero: el forward pass, la retropropagación y el optimizador Adam están escritos a mano, y la única dependencia es `numpy`. No es un modelo de propósito general ni compite con ningún LLM convencional; su interés es didáctico y de divulgación.

El modelo aprende a partir de un corpus de 2.118 caracteres de inglés sencillo escrito a mano sobre un gato, un perro, un hombre y el sol. Su vocabulario se limita a 24 caracteres (minúsculas, espacio, puntuación y salto de línea) y su contexto efectivo es de dos caracteres. La arquitectura es una red neuronal muy pequeña: embedding de dimensión 6, concatenación de dos contextos, una capa oculta con activación tanh de 22 unidades y una capa de salida softmax sobre 24 clases.

Es relevante ahora como material pedagógico: permite reproducir el ciclo completo de entrenamiento (forward, backprop, Adam, cosine LR) en unos 25 segundos en CPU y entender de forma tangible conceptos como perplejidad, ventana de contexto o sobreajuste. No debe confundirse con un modelo utilizable en producción, y el propio autor lo indica explícitamente: "trained for fun and education, not useful for anything else".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward a nivel de carácter: `embed(6) → concat(2 ctx) → tanh(22) → softmax(24)` |
| Parametros totales | 982 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2 caracteres |
| Tipos de cuantizacion | No disponible (pesos en JSON y GGUF F32) |
| Idiomas soportados | Inglés (vocabulario de 24 caracteres) |
| Licencia | MIT |
| Formato de pesos | JSON (`stripe1flash_mountain.json`, ~100 KB) y GGUF F32 (~5 KB) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feed-forward minimalista, no un transformer. Cada token de entrada es un carácter representado por un embedding de dimensión 6; se concatenan los embeddings de los dos caracteres previos (contexto de 2), se pasa por una capa oculta de 22 unidades con activación tanh y se proyecta a una capa de salida de 24 logits sobre el vocabulario de caracteres, normalizada con softmax. El modelo se implementa íntegramente desde cero, con retropropagación y optimizador Adam escritos a mano, y solo requiere `numpy`.

El entrenamiento se realizó durante 8.000 pasos con batch de 256, optimizador Adam y decaimiento de learning rate coseno, completándose en aproximadamente 25 segundos en CPU. El corpus de entrenamiento son 2.118 caracteres de inglés sencillo escrito a mano. La pérdida bajó de 3,18 (línea base uniforme) a aproximadamente 0,59. No se reporta uso de RLHF, DPO ni ninguna técnica de alineación; tampoco hay innovaciones técnicas destacables más allá de la propia implementación didáctica.

## Capacidades

- Generación de texto a nivel de carácter en inglés sencillo, limitada a su vocabulario de 24 caracteres.
- Continuación de prompts cortos (por ejemplo, "the cat ") con muestreo estocástico controlado por temperatura.
- Reproducción de patrones léxicos y sintácticos muy simples presentes en el corpus (frases sobre un gato, un perro, un hombre y el sol).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés y solo con su alfabeto reducido.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de fundamentos de deep learning: sirve para explicar paso a paso el forward pass, la retropropagación y el optimizador Adam con un modelo cuyos pesos caben en un JSON legible y cuyo entrenamiento dura 25 segundos en CPU.
- Prácticas de laboratorio sobre tokenización: permite experimentar con tokenización a nivel de carácter y observar cómo un vocabulario de 24 símbolos condiciona radicalmente la generación.
- Demostración de sobreajuste y capacidad de memorización: con 982 parámetros y un corpus de una página, es un ejemplo claro de cómo un modelo pequeño memoriza el corpus y falla al generalizar (inventa palabras como "mand" o "cate").
- Ilustración de métricas de lenguaje: la evolución de la pérdida de 3,18 a 0,59 permite introducir el concepto de perplejidad y la línea base uniforme.
- Prototipado de interfaces mínimas de generación: el REPL (`play.py`) y la GUI tkinter (`ui.py`) sirven como plantilla para construir demos interactivas de modelos pequeños.
- Experimentación con formatos de serialización: la inclusión de los mismos pesos en JSON y en GGUF permite comparar ambos formatos y entender por qué un GGUF con arquitectura personalizada no es cargable por llama.cpp.
- Ejercicio de reentrenamiento reproducible: el script `train.py` permite modificar el corpus, el tamaño del contexto o la dimensión del embedding y volver a entrenar en segundos, como práctica de ajuste de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento: 3,18 (línea base uniforme) frente a aproximadamente 0,59 tras 8.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el checkpoint JSON ocupa ~100 KB y el GGUF F32 ~5 KB.
- GPU recomendadas: no requiere GPU; está diseñado para ejecutarse en CPU.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU, dado su tamaño ínfimo.
- Opciones de despliegue: el código de inferencia en `numpy` incluido en la model card, el REPL `play.py` y la GUI `ui.py` (también distribuida como ejecutable de Windows). No es desplegable con vLLM, TGI, Ollama o llama.cpp: el GGUF usa una arquitectura personalizada (`stripe1flash-mountain`) que llama.cpp no puede cargar.
- Latencia y throughput: no disponibles de forma medida; el entrenamiento completo tarda ~25 s en CPU, lo que da una idea del orden de magnitud de la inferencia (milisegundos por generación de 160 caracteres).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stripe1flash-mountain | 982 | 2 caracteres | Carácter, numpy desde cero, educativo | MIT | Hugging Face (JSON + GGUF) |
| Modelos char-level tipo Karpathy (min-char-rnn, makemore) | Del orden de miles a millones | Decenas de caracteres | Carácter, RNN/MLP didáctico | MIT / educativa | Repositorios públicos |
| GPT-2 small | 124M | 1.024 tokens | Transformer BPE | MIT | Hugging Face |

La comparación con GPT-2 small es solo orientativa de escala: stripe1flash-mountain tiene aproximadamente 126.000 veces menos parámetros y un contexto de 2 caracteres frente a 1.024 tokens. Frente a implementaciones char-level didácticas como min-char-rnn o makemore, la diferencia principal es la pila técnica (numpy puro, sin framework) y el tamaño extremo del corpus.

## Limitaciones y advertencias

- Con 982 parámetros, el modelo inventa palabras (por ejemplo, "mand", "cate") y olvida cualquier información más allá de un contexto de 2 caracteres.
- Solo maneja un alfabeto de 24 caracteres en inglés; no procesa mayúsculas, acentos ni otros idiomas.
- Riesgo de alucinación total en el sentido convencional: no tiene conocimiento factual, solo patrones de una página de texto.
- No es apto para uso en producción ni para ninguna tarea práctica; el propio autor lo declara entrenado "for fun and education".
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad comercial real.
- El GGUF incluido no es cargable por llama.cpp debido a su arquitectura personalizada; debe usarse el checkpoint JSON con el código numpy.
- No hay pipeline declarado en Hugging Face ni datos de evaluación independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dew6/stripe1flash-mountain
- Repositorio de makemore (referencia didáctica char-level de Karpathy): https://github.com/karpathy/makemore
- min-char-rnn (referencia didáctica char-level): https://gist.github.com/karpathy/d4dee566867f8291f086
