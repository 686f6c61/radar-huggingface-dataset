# Embim/looped-qwen3-9.4M-T32-fineweb

## Resumen

`looped-qwen3-9.4M-T32-fineweb` es un modelo de lenguaje pequeño (9,44 millones de parámetros) desarrollado por Embim como proyecto de investigación sobre arquitecturas recurrentes en profundidad. El modelo aplica un núcleo transformer de 2 capas con pesos compartidos un total de 32 veces, logrando 64 capas efectivas con solo 2 capas de parámetros. Está entrenado desde cero sobre 100 millones de tokens del dataset FineWeb, y su objetivo principal es demostrar que es posible eliminar el "muro de saturación" que afecta a los transformers con weight-tying ingenuos.

La relevancia de este modelo radica en dos innovaciones sin parámetros aprendidos: el **depth-RoPE**, que rota el estado interno según el paso de recurrencia para romper la simetría entre iteraciones, y la **inyección constante de la entrada**, que mantiene una proporción fija del embedding original en cada bucle. Con estas técnicas, el modelo consigue que la calidad mejore monótonamente hasta 64 iteraciones, superando a un modelo no compartido de 16 capas con 4,9 veces más parámetros. Es un trabajo de investigación pura, orientado a la comunidad académica que estudia arquitecturas eficientes y universales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped (Qwen3-style core, 2 capas con pesos compartidos, 32 bucles) |
| Parametros totales | 9.440.513 (5.245.953 no-embedding) |
| Parametros activos | 9.440.513 (todos los parámetros se usan en cada bucle, pero los pesos están compartidos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo sigue la receta de Qwen3: pre-RMSNorm, per-head QK-norm, GQA con 2 KV heads, SwiGLU, RoPE, sin biases y embeddings atados. La diferencia clave es que la parte central de la red se ejecuta en bucle: `h_t = h_{t-1} + R_t^{-1} · Core( R_t · (h_{t-1}/rms + α·e) )` para t de 1 a 32, donde `R_t` es una rotación dependiente del paso (depth-RoPE) y `α` es un escalar aprendido para la inyección constante de la entrada. Esta rotación por canales (aplicada a la mitad de los canales con θ=1000) hace que el bloque vea un marco de coordenadas distinto en cada iteración, rompiendo la simetría estructural sin añadir parámetros.

El entrenamiento se realizó sobre 100M tokens de FineWeb con una tasa de aprendizaje de 2e-3. El tokenizador es un BPE a nivel de byte con vocabulario de 8.192 entradas, entrenado sobre el propio dataset, porque el presupuesto de 10M de parámetros incluye las embeddings y el vocabulario de Qwen3 (151.936 entradas) consumiría todo el presupuesto. La profundidad es un argumento en tiempo de inferencia: el mismo checkpoint puede ejecutarse con cualquier número de bucles, degradándose suavemente más allá de la profundidad entrenada. Los autores reportan que las versiones aprendidas de las mismas ideas (embeddings por paso, adaLN por paso) empeoran el rendimiento, lo que sugiere que la simetría debe romperse estructuralmente.

## Capacidades

- Generación de texto autoregresiva básica, con capacidad de ajustar la profundidad en inferencia (de 1 a 64 bucles) para equilibrar calidad y coste.
- Modelado de lenguaje a nivel de byte con tokenizador BPE propio, lo que permite manejar cualquier texto en inglés sin tokenizaciones desconocidas.
- Razonamiento limitado por su tamaño: no es un modelo de propósito general, sino una prueba de concepto de escalado en profundidad.
- No soporta tool calling, function calling, ni uso como agente.
- No tiene capacidades multimodales ni de visión.
- Multilingüismo: solo inglés, por el dataset de entrenamiento.
- No dispone de modo de pensamiento (thinking mode) ni generación de razonamiento explícito.

## Casos de uso

- Investigación en arquitecturas recurrentes en profundidad: sirve como banco de pruebas para estudiar el comportamiento de transformers con pesos compartidos, la saturación de profundidad y técnicas de regularización estructural como depth-RoPE.
- Comparación de eficiencia paramétrica: permite medir cuánta capacidad efectiva se obtiene por parámetro frente a modelos densos no compartidos, útil para papers sobre compresión de modelos.
- Experimentación con decodificación especulativa: al poder ejecutarse con pocos bucles (p. ej., T=4) como modelo de borrador y con muchos bucles (T=32) como modelo verificador, se puede explorar el trade-off entre velocidad y calidad.
- Docencia y divulgación: por su tamaño mínimo, puede ejecutarse en CPU y es ideal para ilustrar conceptos de weight-tying, universal transformers y recurrencia en profundidad en cursos de deep learning.
- Desarrollo de tokenizadores byte-level: el tokenizador BPE de 8K entradas entrenado sobre FineWeb puede reutilizarse en otros experimentos de modelado de lenguaje de bajo presupuesto.
- Validación de hipótesis teóricas sobre la geometría del espacio de estados: los diagnósticos de colinealidad de actualizaciones y la dinámica en espacio proyectivo que reportan los autores son reproducibles con este checkpoint.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Modelo | Parámetros | Tokens | Val loss (nats) | Perplexidad | Bits/byte |
|---|---|---|---|---|---|
| **looped-qwen3-9.4M-T32 (lr 2e-3)** | 9,44M | 100M | 3,7219 | 41,34 | 1,4275 |
| Misma receta, lr 1.5e-3 | 9,44M | 100M | 3,7329 | 41,80 | 1,4317 |
| Referencia no compartida de 16 capas (fuera de presupuesto) | 46,2M | 100M | 3,5938 | 36,37 | 1,3784 |
| Mejor bucle ingenuo, cualquier profundidad (T=8) | 9,44M | 25M | 4,2028 | 66,89 | 1,6119 |
| Bucle ingenuo a T=32 | 9,44M | 25M | 4,2880 | 72,82 | 1,6446 |

La validación se realizó sobre un shard held-out de FineWeb (sample/10BT/014). El autor advierte que la perplejidad no es comparable con otros modelos porque el tokenizador es propio (byte-level BPE de 8K), por lo que recomienda usar bits por byte como métrica independiente del tokenizador. Con 25M tokens, el modelo con la receta propuesta obtiene 4,093 ± 0,011 frente a 4,220 ± 0,016 del bucle ingenuo óptimo (T=8), una diferencia de 11 desviaciones estándar.

## Requisitos de hardware

- VRAM estimada: al tener solo 9,44M de parámetros en FP32, el modelo ocupa aproximadamente 38 MB. En FP16 serían unos 19 MB. Cabe holgadamente en cualquier GPU moderna, incluso en las más modestas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. También puede ejecutarse en CPU sin problemas, con latencia de milisegundos por token.
- En consumer GPU: sí, en cualquier modelo (RTX 3060, RTX 4090, incluso integradas).
- Opciones de despliegue: al ser una arquitectura personalizada, no es compatible directamente con vLLM, Ollama ni TGI. Debe cargarse con el código del repositorio GitHub `Embim/Looped-lm` usando PyTorch y safetensors.
- Latencia y throughput: no se han publicado mediciones formales, pero dado el tamaño, la inferencia es del orden de microsegundos por token en GPU y de milisegundos en CPU.

## Comparativa con modelos similares

La comparación más directa es con el propio modelo no compartido de 16 capas que los autores usan como referencia, y con los bucles ingenuos sin las innovaciones.

| Modelo | Parámetros | Contexto | Val loss (nats) a 100M tokens | Licencia |
|---|---|---|---|---|
| looped-qwen3-9.4M-T32 (con depth-RoPE + inyección constante) | 9,44M | 512 | 3,7219 | Apache-2.0 |
| Transformer denso no compartido de 16 capas | 46,2M | 512 | 3,5938 | Apache-2.0 (implícito) |
| Bucle ingenuo (weight-tying sin modificaciones) T=8 | 9,44M | 512 | 4,2028 (a 25M tokens) | Apache-2.0 (implícito) |

El modelo con las innovaciones consigue un rendimiento cercano al de un modelo 4,9 veces más grande, manteniendo el presupuesto de 10M de parámetros. Frente a otros modelos pequeños comerciales (por ejemplo, SmolLM2-135M o Qwen2.5-0.5B), este checkpoint no es competitivo en tareas de lenguaje natural porque su contexto es de solo 512 tokens y su capacidad es mucho menor; su valor está en la investigación de arquitecturas, no en el uso práctico.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para tareas reales de generación de texto de calidad.
- Contexto muy limitado: 512 tokens, insuficiente para la mayoría de aplicaciones conversacionales o de análisis de documentos.
- Solo inglés: entrenado exclusivamente con FineWeb, no soporta otros idiomas.
- Tokenizador propio: el BPE byte-level de 8K entradas no es compatible con el de Qwen3 ni con otros tokenizadores estándar; cualquier integración requiere usar el tokenizador incluido.
- Sin tool calling ni capacidades de agente: no puede usarse como backend de asistentes que requieran llamadas a funciones.
- Riesgo de alucinación: al ser un modelo de 9,4M parámetros, la generación de contenido factual es poco fiable; no debe usarse para generar información veraz.
- Sesgos: entrenado sobre un subconjunto de FineWeb, puede reflejar sesgos presentes en ese corpus, aunque no se han realizado auditorías formales.
- Compatibilidad limitada: la arquitectura personalizada impide usar herramientas estándar de despliegue (vLLM, TGI, Ollama) sin adaptaciones.
- Los resultados de perplejidad no son comparables con otros modelos; solo la métrica de bits por byte es transversal.

## Enlaces

- [HuggingFace: Embim/looped-qwen3-9.4M-T32-fineweb](https://huggingface.co/Embim/looped-qwen3-9.4M-T32-fineweb)
- [Repositorio GitHub: Embim/Looped-lm](https://github.com/Embim/Looped-lm)
- [Dataset: HuggingFaceFW/fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)
