# janmusic/ncm-mlx-tinyworld

## Resumen

ncm-mlx-tinyworld es un conjunto de pesos de demostración publicado por Jan Music (usuario `janmusic`) que implementa Next-Concept Modeling (NCM), un paradigma de generación de texto no autorregresivo y de grueso a fino descrito por Kumbong et al. en arXiv:2610.14162. El paquete incluye tres componentes entrenados sobre TinyWorld, un lenguaje sintético de 15.360 frases de 32 caracteres: un generador de conceptos de 5,0 M de parámetros, un códec multiescala con cuantización vectorial residual (RVQ) de 1,3 M de parámetros y una línea base autorregresiva a nivel de carácter de 4,8 M de parámetros con la misma anchura y profundidad.

El interés del modelo es metodológico, no de producto. El generador escribe una frase en 6 pasos de grueso a fino (1, 2, 4, 8, 16 y 32 posiciones de código, una pasada hacia delante por paso) más una decodificación del códec, frente a los 32 pasos secuenciales del modelo autorregresivo. Es decir, sustituye la generación token a token por una jerarquía de conceptos que se refinan progresivamente, lo que reduce el número de llamadas al modelo de 32 a 7 por secuencia.

Se trata de una implementación independiente en MLX, orientada a Apple Silicon, no afiliada a Stanford ni a HazyResearch, y cuyos pesos no son compatibles con los checkpoints oficiales de NCM. No es un modelo de propósito general: no acepta instrucciones, no tiene condicionamiento por prompt y solo ha sido entrenado y evaluado sobre la gramática sintética TinyWorld. Su valor es servir como referencia reproducible (entrenamiento completo en unos 5,5 minutos) para estudiar el equilibrio entre calidad y latencia de NCM frente a un autorregresivo del mismo tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo de grueso a fino (Next-Concept Modeling) con códec RVQ multiescala; atención block-diagonal en el generador |
| Parámetros totales | 5,0 M (generador) + 1,3 M (códec) + 4,8 M (línea base AR incluida en el repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 posiciones de carácter (frases de 32 caracteres); sin contexto conversacional |
| Tipos de cuantización | no disponible (pesos en float32 safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | en (inglés sintético restringido a la gramática TinyWorld) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) + JSON de configuración; librería MLX |

## Arquitectura y entrenamiento

El sistema se compone de dos redes. El códec emplea un encoder transformer contextual con LayerNorm, seis niveles de cuantización vectorial residual y un decoder transformer; convierte las frases de 32 caracteres en una jerarquía de códigos de 1, 2, 4, 8, 16 y 32 posiciones. El generador, con atención block-diagonal y sin condicionamiento por prompt, produce esa jerarquía en seis pasadas hacia delante, una por nivel de granularidad, y el códec reconstruye la frase final en una única decodificación. La línea base autorregresiva comparte anchura y profundidad con el generador y se apoya en caché KV.

Los datos son íntegramente sintéticos: 12.000 frases generadas para entrenamiento, 1.000 de validación y 2.360 nunca vistas para evaluación. El códec se entrenó en 52 segundos, el generador en 266 segundos (3.000 pasos, con el mejor checkpoint de validación en el paso 1.500) y la línea base en 134 segundos, todo sobre un Apple M5 Pro de 64 GB con macOS 26.5 y MLX 0.32.3, con otros servicios de GPU en ejecución. El pipeline completo de entrenamiento tarda unos 5,5 minutos con `mise run train`. No se documenta uso de RLHF, DPO ni ajuste por preferencias; el entrenamiento es puramente de modelado generativo sobre la gramática sintética. Como innovación destacable, el esquema de grueso a fino reduce las llamadas al modelo por secuencia de 32 a 6 más una decodificación, a costa de una mayor tasa de error local en este tamaño.

## Capacidades

- Generación de frases en el lenguaje sintético TinyWorld, con estructura gramatical del tipo `ann sees two red cats.`
- Generación no autorregresiva de grueso a fino en 6 pasos más una decodificación del códec.
- Cumplimiento de la regla de concordancia de número a nivel de frase cuando la salida es bien formada (99,8 % en el generador).
- Reconstrucción exacta de frases por parte del códec: 100 % de las frases de validación reconstruidas y 100 % de uso del codebook en todos los niveles.
- Muestreo configurable por CLI: temperatura, semilla y top-k.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés sintético.
- No dispone de modo thinking, visión ni audio.
- No acepta instrucciones ni condicionamiento por prompt de usuario.

## Casos de uso

- Investigación sobre generación no autorregresiva: el paquete permite reproducir el experimento E1 completo en minutos y comparar directamente NCM con un autorregresivo del mismo tamaño, lo que resulta adecuado para estudiar el compromiso entre calidad y número de llamadas al modelo.
- Docencia y divulgación de arquitecturas generativas: la escala de 5 M de parámetros y el entrenamiento de 5,5 minutos hacen viable ejecutar el ciclo completo en un portátil Apple Silicon durante una clase o taller.
- Pruebas de latencia en entornos de recursos limitados: con p50 de 4,5 ms por secuencia a batch 1, sirve para medir el comportamiento de un sampler jerárquico frente a uno secuencial en hardware consumer.
- Validación de implementaciones MLX: el repositorio incluye tests de exactitud en CPU y comandos de evaluación, útil para verificar portes o comparar versiones de MLX.
- Experimentación con códecs RVQ: el códec de 1,3 M de parámetros con seis niveles y reconstrucción exacta del 100 % puede reutilizarse como banco de pruebas para esquemas de tokenización jerárquica.
- Generación de datos sintéticos controlados: dado que la validez se comprueba con un parser, el modelo puede emplearse para producir corpus TinyWorld etiquetados y ampliar el conjunto de evaluación de otros experimentos.
- Estudio de atención block-diagonal: el generador permite analizar el efecto de patrones de atención estructurados en modelos pequeños sin el coste de entrenar a mayor escala.

## Benchmarks y rendimiento

Resultados declarados por el autor en el experimento E1 (Apple M5 Pro, 64 GB, macOS 26.5, MLX 0.32.3, con otros servicios de GPU en ejecución; 2 x 512 muestras por temperatura; validez comprobada por el parser de TinyWorld).

| Métrica | NCM generator | AR baseline + KV cache |
|---|---|---|
| Frases válidas, T = 1.0 | 89,8 % | 98,6 % |
| Frases válidas, T = 0.7 | 95,8 % | 99,8 % |
| Concordancia de número cuando la frase es bien formada | 99,8 % | 100 % |
| Válidas y no presentes en entrenamiento, T = 1.0 | 16,3 % | 23,5 % |
| Llamadas al modelo por secuencia | 6 + 1 decodificación | 32 |
| Latencia p50, batch 1 / 16 / 256 | 4,5 / 5,8 / 37,8 ms | 30,5* / 22,9 / 49,8 ms |

\* La p50 del AR a batch 1 fue de 19,8 ms en una ejecución anterior idéntica; las latencias con lotes pequeños dependen de la carga de la GPU.

Métricas del códec, medidas por separado de la calidad del generador: 100 % de frases de validación reconstruidas exactamente y 100 % de uso del codebook en todos los niveles.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para el conjunto generador + códec (19,9 MB + 5,2 MB de pesos); no se documentan variantes cuantizadas.
- GPU recomendadas: Apple Silicon con Metal (el autor usó un M5 Pro de 64 GB); en Linux, MLX con CUDA sobre GPU NVIDIA.
- Cabe en cualquier GPU consumer actual: el tamaño del repo es de 0,0 GB y los pesos individuales no superan los 20 MB.
- Opciones de despliegue: exclusivamente MLX a través del paquete `ncm-mlx` (comandos `demo`, `eval` y `baseline`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 4,5 ms a batch 1, 5,8 ms a batch 16 y 37,8 ms a batch 256 para el generador NCM; 30,5 ms, 22,9 ms y 49,8 ms respectivamente para la línea base AR. Ninguno de los dos samplers está compilado.
- La CPU solo se emplea para los tests de exactitud del repositorio; la inferencia requiere GPU Metal o CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ncm-mlx-tinyworld (generador) | 5,0 M + 1,3 M de códec | 32 caracteres | No autorregresivo, grueso a fino | MIT | HuggingFace + GitHub |
| Línea base AR incluida en el repo | 4,8 M | 32 caracteres | Autorregresivo por carácter con caché KV | MIT | Incluida en el mismo repo |
| Checkpoints oficiales de NCM (Kumbong et al.) | no disponible | no disponible | No autorregresivo, grueso a fino | no disponible | No compatible con estos pesos |

No se dispone de datos publicados que permitan comparar este modelo con alternativas de propósito general de la misma categoría; la única comparación documentada es interna, frente a la línea base autorregresiva del propio repositorio.

## Limitaciones y advertencias

- Lenguaje sintético y minúsculo: no maneja texto abierto, no acepta prompts ni sigue instrucciones; su calidad sobre texto real es desconocida.
- A este tamaño, el generador NCM es menos preciso que la línea base autorregresiva de igual tamaño: unos 9 puntos menos de validez a T = 1.0. Los errores son en su mayoría fallos ortográficos locales (por ejemplo, `ret fox`), mientras que la regla de concordancia a nivel de frase casi siempre se respeta.
- La ventaja de latencia depende de la contención de la GPU y ninguno de los samplers está compilado, por lo que las cifras no son directamente extrapolables a producción.
- Los speedups de 10-31x del paper original comparan NCM con modelos de difusión de lenguaje en GPU; no se reclama ninguna mejora de velocidad frente a LLM grandes.
- Los pesos son incompatibles con los checkpoints oficiales de NCM publicados por los autores del método.
- Las matmuls en fp32 sobre Metal tienen precisión reducida (en torno a 1e-3 de error relativo), lo que puede afectar a la reproducibilidad exacta.
- Licencia MIT: permite uso comercial, pero el modelo no tiene aplicación comercial real dada su naturaleza sintética y su ausencia de condicionamiento por prompt.
- No se documentan sesgos sociales ni de dominio, porque el corpus de entrenamiento es una gramática artificial; cualquier evaluación de sesgo sobre texto real carece de sentido en este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/janmusic/ncm-mlx-tinyworld
- Repositorio de la implementación: https://github.com/janmus1c/ncm-mlx
- Paper de Next-Concept Modeling (Kumbong et al.): https://arxiv.org/abs/2610.14162
- Documentación de uv, necesaria para reproducir: https://docs.astral.sh/uv/
