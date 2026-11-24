# janmusic/ncm-mlx-tinyworld

## Resumen

NCM-TinyWorld-5M-MLX es un modelo de generación de texto de 5,0 millones de parámetros que implementa Next-Concept Modeling (NCM), un paradigma de decodificación no autorregresiva y de grueso a fino desarrollado por Kumbong et al. (arXiv:2610.14162). Lo publica janmusic como implementación independiente en MLX, la librería de Apple para Apple Silicon, y está entrenado sobre TinyWorld, un lenguaje sintético de 15.360 frases de 32 caracteres como `ann sees two red cats.`. El modelo es un ejemplo didáctico: no está pensado para texto real, sino para demostrar el funcionamiento del método.

El sistema consta de tres piezas: un generador de 4.972.160 parámetros con atención en bloque diagonal y sin condicionamiento por prompt, un códec multiescala de cuantización vectorial residual (1.301.248 valores) y una línea base autorregresiva de 4.752.921 parámetros a nivel de carácter. El generador escribe una frase en 6 niveles de grueso a fino (1, 2, 4, 8, 16 y 32 posiciones de código, una llamada al generador por nivel) más una decodificación del códec, en lugar de 32 pasos secuenciales de carácter. Todo el pipeline se entrena en unos 5,5 minutos en un portátil Apple Silicon.

Su relevancia es metodológica: demuestra que la decodificación paralela jerárquica puede reducir las llamadas al modelo de 32 a 6 y mejorar la latencia en lote 1 (4,5 ms frente a 30,5 ms de la línea base), a costa de una precisión menor a este tamaño. El autor advierte explícitamente de que el NCM es menos preciso que la línea base autorregresiva del mismo tamaño (89,8 % frente a 98,6 % de frases válidas a T=1,0) y que el resultado no dice nada sobre texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención en bloque diagonal, decodificación no autorregresiva de grueso a fino (Next-Concept Modeling) |
| Parametros totales | 4.972.160 (generador); 4.752.921 (línea base AR); códec de 1.301.248 valores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 posiciones de carácter (frases de 32 caracteres); sin condicionamiento por prompt |
| Tipos de cuantizacion | no disponible (pesos en float32 safetensors) |
| Idiomas soportados | inglés (en); vocabulario sintético de TinyWorld |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), cargados por `ncm_mlx` |

## Arquitectura y entrenamiento

El generador es un transformer de 4,97 M de parámetros con atención en bloque diagonal y sin condicionamiento por prompt (el mejor paso de validación fue el 1.500 de 3.000). La generación sigue una jerarquía de 6 niveles con 1, 2, 4, 8, 16 y 32 posiciones de código: cada nivel se produce con una única llamada al generador y el resultado se decodifica una sola vez con el códec. El códec es un transformer contextual con encoder, LayerNorm, seis niveles de cuantización vectorial residual y decoder, entrenado primero y congelado después para entrenar el generador sobre la jerarquía de códigos. La línea base autorregresiva, de anchura y profundidad equivalentes, opera a nivel de carácter con caché KV.

El entrenamiento se realiza sobre TinyWorld, un lenguaje sintético de gramática controlada con 15.360 frases de 32 caracteres, tokenizadas por carácter y rellenadas a 32 posiciones. Todo el pipeline (códec más generador) se entrena en aproximadamente 5,5 minutos en un portátil Apple Silicon. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación técnica principal es la decodificación paralela jerárquica con cuantización vectorial residual multiescala, que sustituye los 32 pasos secuenciales por 6 llamadas al generador más una decodificación.

## Capacidades

- Generación de texto a nivel de carácter sobre el lenguaje sintético TinyWorld, con frases de 32 caracteres.
- Decodificación no autorregresiva de grueso a fino en 6 niveles (1, 2, 4, 8, 16, 32 posiciones de código).
- Concordancia de número gramatical cuando la frase está bien formada (99,8 % de acierto).
- Reconstrucción exacta de frases mediante el códec (100 % de frases de validación reconstruidas).
- Control de muestreo mediante temperatura, semilla y top-k expuestos en la CLI.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés sintético.
- No dispone de modo thinking, visión ni audio.
- No acepta prompts: el generador no está condicionado por entrada.

## Casos de uso

- Docencia e investigación sobre decodificación no autorregresiva: el modelo sirve para reproducir en un portátil Apple Silicon el funcionamiento completo de NCM, con demo nivel a nivel y evaluación de calidad en JSON, en unos minutos de entrenamiento.
- Estudio de latencia en decodificación paralela: permite medir la diferencia entre 6 llamadas al generador y 32 pasos autorregresivos con caché KV en lote 1, 16 y 256, útil para evaluar estrategias de inferencia de bajo coste.
- Experimentación con códecs de cuantización vectorial residual: el códec de seis niveles y 1,3 M de valores puede estudiarse de forma aislada, ya que reconstruye el 100 % de las frases de validación y usa el 100 % del codebook en cada nivel.
- Validación de pipelines de MLX y Metal: sirve como caso de prueba mínimo para verificar la instalación de MLX, la carga de safetensors float32 y la ejecución en GPU Metal o CUDA.
- Comparación de paradigmas de generación: la línea base autorregresiva incluida (4,75 M de parámetros) permite contrastar precisión y latencia frente al generador NCM en el mismo lenguaje y con la misma anchura y profundidad.
- Reproducción de resultados académicos: el modelo y los comandos de evaluación permiten replicar las métricas de validez del parser de TinyWorld a distintas temperaturas (T=1,0 y T=0,7) y verificar la afirmación del autor sobre el rendimiento relativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (experimento E1 en Apple M5 Pro de 64 GB con MLX 0.32.3; validez evaluada por el parser de TinyWorld; 2 × 512 muestras por temperatura). No están verificados de forma independiente.

| Metrica | NCM generator | AR baseline + KV cache |
|---|---:|---:|
| Frases válidas, T = 1,0 | 89,8 % | 98,6 % |
| Frases válidas, T = 0,7 | 95,8 % | 99,8 % |
| Concordancia de número cuando la frase es válida | 99,8 % | 100 % |
| Válidas y no presentes en entrenamiento, T = 1,0 | 16,3 % | 23,5 % |
| Llamadas al modelo por secuencia | 6 + 1 decodificación | 32 |
| Latencia p50, lote 1 / 16 / 256 | 4,5 / 5,8 / 37,8 ms | 30,5 / 22,9 / 49,8 ms |

El códec reconstruye exactamente el 100 % de las frases de validación y usa el 100 % del codebook en cada nivel. Las frases no vistas representan el 16,4 % del lenguaje, por lo que ambos modelos se acercan a la tasa esperada de muestreo del lenguaje completo. La latencia p50 de la línea base en lote 1 fue de 19,8 ms en una ejecución anterior idéntica; las mediciones en lote pequeño dependen de la carga de la GPU.

## Requisitos de hardware

- VRAM estimada: no disponible; con 5 M de parámetros en float32, los pesos ocupan del orden de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: Apple Silicon (Metal) o GPU NVIDIA con CUDA mediante MLX; el autor ejecuta las pruebas en un Apple M5 Pro de 64 GB.
- Cabe en cualquier GPU consumer; de hecho, el entrenamiento completo se realiza en un portátil Apple Silicon en unos 5,5 minutos.
- La CPU solo se usa para los tests de exactitud del repositorio; las demos y evaluaciones requieren GPU (Metal o CUDA).
- Opciones de despliegue: CLI de `ncm_mlx` (`demo`, `eval`, `baseline`), instalada con `uv` y el grupo `cuda` en Linux NVIDIA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia p50 medida: 4,5 ms en lote 1, 5,8 ms en lote 16 y 37,8 ms en lote 256 para el generador NCM. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Frases válidas (T=1,0) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| NCM-TinyWorld-5M-MLX (NCM) | 4,97 M | 32 caracteres | 89,8 % | MIT | Hugging Face, MLX |
| AR baseline incluida (autorregresiva) | 4,75 M | 32 caracteres | 98,6 % | MIT | Incluida en el mismo repositorio |
| Otros modelos de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa comparable documentada es la línea base autorregresiva que acompaña al modelo, con la misma anchura y profundidad y entrenada sobre el mismo lenguaje. No se dispone de información sobre otros modelos NCM comparables ni sobre modelos de tamaño similar en texto real.

## Limitaciones y advertencias

- Modelo didáctico de juguete: el propio autor advierte de que a este tamaño el NCM es menos preciso que la línea base autorregresiva del mismo tamaño y que el resultado no dice nada sobre texto real.
- Solo genera frases del lenguaje sintético TinyWorld; no es utilizable para texto natural ni para tareas generales.
- No acepta prompts ni condicionamiento: el generador no está condicionado por entrada.
- Contexto limitado a 32 posiciones de carácter.
- Solo inglés sintético; sin capacidades multilingües.
- Riesgo de frases inválidas según la gramática del parser (aproximadamente un 10 % a T=1,0 y un 4 % a T=0,7).
- Baja tasa de frases válidas no vistas en entrenamiento (16,3 % a T=1,0), cercana a la tasa esperada por el tamaño del lenguaje.
- Implementación independiente no afiliada a HazyResearch ni a Stanford, e incompatible con los checkpoints NCM publicados por sus autores.
- Licencia MIT, que permite uso comercial, pero el alcance práctico del modelo es exclusivamente de investigación y docencia.
- Requiere GPU Metal o CUDA; la CPU solo se usa para tests de exactitud.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/janmusic/ncm-mlx-tinyworld
- Repositorio GitHub: https://github.com/janmus1c/ncm-mlx
- Documentación: https://janmus1c.github.io/ncm-mlx/
- Working paper (Zenodo): https://doi.org/10.5281/zenodo.23953213
- Paper NCM (arXiv): https://arxiv.org/abs/2610.14162
- Demo de replay (Hugging Face Spaces): https://huggingface.co/spaces/janmusic/NCM-Refinement-Replay
