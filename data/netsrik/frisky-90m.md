# netsrik/frisky-90m

## Resumen

Frisky 90M es un modelo de lenguaje de 90.128.896 parámetros entrenado desde cero por el desarrollador independiente netsrik utilizando DeepJ, una biblioteca de redes neuronales escrita en Java con soporte opcional de aceleración por Apple Metal. El modelo emplea la arquitectura DeepJ Prism Transformer, una variante propia que combina atención de bajo rango sobre Q/KV con embeddings rotatorios, RMSNorm y SwiGLU. Completó tres fases de entrenamiento: preentrenamiento base, mid-training y ajuste fino de instrucciones response-only.

El modelo se distribuye exclusivamente en los formatos binarios propietarios de DeepJ (`model.dj` y `tokenizer.bpe`), lo que lo hace incompatible con la pila estándar de Python (Transformers, vLLM, llama.cpp). Su uso requiere la librería DeepJ 1.0.0 y un entorno Java (JDK 20 o superior para la interfaz gráfica). El repositorio ocupa 0,4 GB y acumula 1.182 descargas en Hugging Face.

Su relevancia es fundamentalmente experimental y educativa: demuestra que es viable entrenar y ejecutar un transformer completo desde cero en hardware de Apple, con una toolchain propia en Java. No está pensado para producción ni para decisiones consecuentes, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepJ Prism Transformer (atención de bajo rango Q/KV, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 90.128.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrenamiento no especificada; el autor menciona gestión de caché KV por petición y "rolling generation" al llenarse la ventana) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato nativo `model.dj`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (aplica a los pesos, no a los datasets upstream) |
| Formato de pesos | `model.dj` (binario propietario de DeepJ); tokenizador `tokenizer.bpe` |
| Capas | 10 |
| Tamano oculto | 768 |
| Cabezas de atencion | 12 |
| Rango Q | 384 |
| Rango KV | 192 |
| Vocabulario | 16.384 tokens (BPE) |
| Libreria | deepj 1.0.0 |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

Frisky 90M es un transformer decoder-only de 10 capas con tamaño oculto 768 y 12 cabezas de atención. La arquitectura DeepJ Prism introduce atención de bajo rango: las proyecciones Q y KV se factorizan con rangos 384 y 192 respectivamente, lo que reduce el coste computacional y de memoria frente a atención completa. Emplea embeddings rotatorios (RoPE) para codificar posiciones, RMSNorm para normalización y SwiGLU como activación en las capas feed-forward. La generación usa una caché KV con ámbito de petición; por defecto DeepJ la reconstruye cuando la ventana de contexto se desplaza, y existe un modo opcional de "rolling generation" que mantiene la decodificación incremental tras llenarse la ventana, aunque el autor aclara que cambia el comportamiento de la atención tras la evicción y no amplía la capacidad de contexto entrenada.

El entrenamiento se realizó en tres etapas. El preentrenamiento base usó FineWeb-Edu. El mid-training y el ajuste fino de instrucciones emplearon mezclas derivadas de SmolTalk, MMLU, GSM8K y ARC. El ajuste de instrucciones es response-only, es decir, la pérdida se calcula únicamente sobre los tokens de respuesta. No se documenta el número total de tokens de entrenamiento, la composición exacta de las mezclas ni si hubo RLHF o DPO. Tampoco se detalla el hardware concreto más allá de "una GPU de Apple".

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación por muestreo (temperatura, top-k, semilla, penalización de repetición).
- Respuesta a instrucciones conversacionales tras el ajuste fino response-only, con formato de prompt propio guardado en el checkpoint.
- Razonamiento básico y resolución de problemas aritméticos elementales, derivado del entrenamiento con GSM8K y MMLU.
- Conocimiento factual de nivel básico procedente de FineWeb-Edu y MMLU.
- Generación de código a nivel introductorio (el autor advierte explícitamente que puede generar código incorrecto).
- Interfaz de chat de escritorio (JavaFX) y CLI incluidas en DeepJ, con streaming de texto generado.
- Soporte de caché KV por petición y modo opcional de rolling generation para decodificación incremental.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentación educativa con transformers: sirve para estudiar el ciclo completo de preentrenamiento, mid-training y ajuste de instrucciones en un modelo pequeño, con una toolchain Java accesible y un checkpoint de 0,4 GB que cabe en cualquier equipo.
- Prototipado de interfaces de chat en Java: la librería DeepJ incluye `DeepJChat`, interfaz JavaFX y CLI, lo que permite integrar un chatbot funcional en aplicaciones de escritorio Java sin depender de Python.
- Pruebas de infraestructura de inferencia en Apple Silicon: al ejecutarse con aceleración Metal opcional, permite validar pipelines de decodificación, gestión de caché KV y streaming en hardware de Apple.
- Generación de texto de relleno en entornos de prueba: para poblar fixtures, tests de integración o demos donde se necesita texto plausible en inglés sin coste de API.
- Investigación sobre atención de bajo rango: la factorización Q/KV con rangos 384/192 es un objeto de estudio reproducible para comparar calidad y eficiencia frente a atención completa en modelos pequeños.
- Enseñanza de tokenización BPE: el vocabulario de 16.384 tokens y el archivo `tokenizer.bpe` permiten ilustrar el funcionamiento de un tokenizador entrenado desde cero en un curso de PLN.
- Evaluación comparativa de librerías: útil para contrastar el rendimiento de DeepJ frente a implementaciones Python en tareas de generación corta y contexto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la calidad del post-entrenamiento "no ha sido establecida por un benchmark riguroso".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 90 millones de parámetros en precisión completa (probablemente FP32, dado el formato nativo), el checkpoint ocupa aproximadamente 0,36 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: el autor menciona Apple GPU con Metal; cualquier Apple Silicon (M1 o superior) es suficiente. En el ecosistema NVIDIA, una RTX 3060 o superior sobra para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: exclusivamente DeepJ 1.0.0 (Java, JDK 20+ para la UI JavaFX). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers de Python, dado que los pesos están en formato binario propietario.
- Latencia y throughput: no disponibles. No se publican métricas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Frisky 90M | 90,1 M | no disponible | MIT | `model.dj` (propietario) | Hugging Face, solo DeepJ |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Transformers, llama.cpp, vLLM |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | safetensors, GGUF | Transformers, llama.cpp |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Transformers, llama.cpp, vLLM |

La comparación con SmolLM-135M y GPT-2 small es la más directa por rango de parámetros. Frisky se distingue por su toolchain Java y su formato propietario, que limita drásticamente la interoperabilidad frente a los formatos estándar de la competencia. No hay datos de rendimiento comparables publicados para Frisky.

## Limitaciones y advertencias

- El autor advierte que el modelo puede repetirse, inventar hechos, cometer errores de razonamiento y generar código incorrecto.
- La calidad del post-entrenamiento no ha sido validada con benchmarks rigurosos; no hay evidencia cuantitativa de su rendimiento.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- La longitud de contexto entrenada no se especifica, lo que impide planificar su uso en tareas de contexto largo. El modo rolling generation no amplía la capacidad entrenada y altera el comportamiento de la atención tras la evicción.
- Los pesos están en formato binario propietario (`model.dj`), incompatibles con Transformers, vLLM, llama.cpp, Ollama y TGI. Cualquier integración requiere Java y la librería DeepJ.
- La licencia MIT cubre los pesos, pero no los datasets upstream (FineWeb-Edu, SmolTalk, MMLU, GSM8K, ARC), cuyos términos deben consultarse por separado para uso comercial.
- No apto para decisiones consecuentes, según el propio autor.
- Sin datos publicados sobre sesgos; al entrenarse con FineWeb-Edu y mezclas de instrucciones en inglés, es previsible que herede sesgos de esas fuentes, aunque no se cuantifican.
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netsrik/frisky-90m
- Repositorio DeepJ: https://github.com/KirstenAli/DeepJ
- Release DeepJ 1.0.0: https://github.com/KirstenAli/DeepJ/releases/tag/v1.0.0
- Documentación de inferencia (rolling generation): https://github.com/KirstenAli/DeepJ/blob/master/docs/inference.md#rolling-generation
- Documentación de la CLI: https://github.com/KirstenAli/DeepJ/blob/master/docs/cli.md
- Interfaz de chat de escritorio: https://github.com/KirstenAli/DeepJ#desktop-chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
