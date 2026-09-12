# Harish241412/llama-3.2-1b-from-scratch

## Resumen

`Harish241412/llama-3.2-1b-from-scratch` es una reimplementación educativa del modelo Llama 3.2 1B de Meta, desarrollada por el usuario Harish241412 en PyTorch. No se trata de un modelo entrenado desde cero con datos propios, sino de una reproducción completa de la arquitectura y del pipeline de inferencia que posteriormente carga los pesos originales del checkpoint `meta-llama/Llama-3.2-1B`. El repositorio distribuye esos pesos en formato safetensors (bfloat16) junto con un tokenizador Llama 3 implementado a mano.

El interés del proyecto es fundamentalmente pedagógico y de ingeniería: sirve como referencia verificable de cómo se construye un transformer decoder-only moderno (RMSNorm, GQA, RoPE, SwiGLU, weight tying) y de cómo se implementa una caché KV dinámica para decodificación autorregresiva. Según la model card, la implementación reproduce las predicciones de la implementación oficial de Hugging Face con una diferencia máxima de logits inferior a `2e-5` en FP32, lo que la convierte en un buen banco de pruebas para validar código propio.

El modelo tiene unos 1,24 mil millones de parámetros, 16 capas, dimensión oculta 2048, 32 cabezas de atención con 8 cabezas KV (GQA) y un vocabulario de 128.256 tokens. La ventana de contexto declarada es de 131.072 tokens. El repositorio no declara licencia ni idiomas, y no es cargable directamente con la API estándar de `transformers`: requiere la implementación propia publicada en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal language model) |
| Parametros totales | ~1,24 mil millones (1,24B) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 131.072 tokens (según model card) |
| Tipos de cuantizacion | no disponible en el repositorio; el checkpoint publicado está en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; los pesos derivan de `meta-llama/Llama-3.2-1B` |
| Formato de pesos | safetensors (`llama3_2_1b_scratch_bf16.safetensors`), bfloat16 |
| Dimension oculta | 2048 |
| Numero de capas | 16 |
| Cabezas de atencion | 32 |
| Cabezas KV (GQA) | 8 |
| Dimension por cabeza | 64 |
| Tamano intermedio (FFN) | 8192 |
| Tamano de vocabulario | 128.256 |
| Base de RoPE | 500.000 |
| Tipo de pesos | bfloat16 |
| Libreria declarada | pytorch |
| Modelo base | `meta-llama/Llama-3.2-1B` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B: un transformer decoder-only con normalización RMSNorm pre-norm, atención con Grouped Query Attention (8 cabezas KV frente a 32 cabezas de consulta, lo que reduce el tamaño de la caché KV en un factor de 4), embeddings posicionales rotatorios (RoPE) con base 500.000 para favorecer la extrapolación a contextos largos, y red feed-forward con activación SwiGLU y dimensión intermedia de 8192. El modelo emplea weight tying entre la matriz de embeddings y la cabeza de salida, y un vocabulario de 128.256 tokens correspondiente al tokenizador de Llama 3.

No hay entrenamiento propio en este proyecto: los pesos son los del checkpoint oficial `meta-llama/Llama-3.2-1B`, cargados en la implementación alternativa. Por tanto, no se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO (el modelo base es un modelo preentrenado, no ajustado por instrucciones). La innovación técnica del repositorio es la propia implementación: embeddings, RMSNorm, GQA, RoPE, SwiGLU, bloques decoder, weight tying, modelado causal, caché KV dinámica, decodificación greedy y muestreo con temperatura, top-k y top-p, gestión de stop tokens, tokenizador Llama 3 con plantilla de chat y carga de checkpoints en BF16. La verificación de paridad se realizó en FP32 sobre cinco prompts, con coincidencia exacta en top-1 y top-5 y una diferencia absoluta máxima de logits por debajo de `2e-5`.

## Capacidades

- Generación de texto causal: continuación de secuencias y modelado de lenguaje autorregresivo.
- Modelo base sin ajuste por instrucciones: no incorpora un modo chat alineado, aunque el tokenizador implementa codificación y decodificación con plantilla de chat.
- Decodificación configurable: greedy, temperatura, top-k y top-p, con manejo de tokens de parada.
- Inferencia con caché KV dinámica para acelerar la decodificación en contextos largos.
- Tokenizador Llama 3 propio, construido a partir del vocabulario y la configuración originales.
- No dispone de soporte nativo de tool calling ni de function calling.
- No dispone de soporte nativo de agentes ni de razonamiento multi-paso orquestado.
- No dispone de capacidades multimodales (solo texto); la variante de 1B de Llama 3.2 es text-only.
- Capacidades multilingües: no documentadas en la información disponible.
- No dispone de modo "thinking" ni de presupuesto de razonamiento explícito.

## Casos de uso

- Docencia de arquitecturas transformer: el repositorio permite recorrer paso a paso la implementación de RMSNorm, RoPE, GQA y SwiGLU, y comparar el código con la formulación teórica de Llama 3.2.
- Verificación de implementaciones propias: al reproducir top-1 y top-5 de Hugging Face con una diferencia de logits inferior a `2e-5`, sirve como referencia para validar un port a otro framework (JAX, C++, Rust) o un kernel de atención propio.
- Desarrollo y depuración de caché KV: la model card incluye medidas de latencia con y sin caché que permiten reproducir el cuello de botella y validar optimizaciones de memoria en decodificación autorregresiva.
- Investigación en estrategias de decodificación: la implementación expone temperatura, top-k y top-p, lo que facilita experimentar con muestreo y comparar distribuciones frente a la implementación de referencia.
- Profiling y benchmarking de hardware: con 1,24B parámetros y contexto configurable, es un banco de pruebas manejable para medir latencia por token y throughput en GPUs de gama baja o media.
- Base para ajuste fino en dominio específico: al ser un modelo base de 1,24B, puede servir de punto de partida para fine-tuning supervisado o LoRA en tareas concretas (clasificación, extracción, resumen), siempre que se respete la licencia del modelo base.
- Pruebas de cuantización post-entrenamiento: sus pesos BF16 y su tamaño reducido permiten validar flujos de conversión a int8/int4 y medir la degradación resultante.
- Prototipado de servidores de inferencia educativos: el pipeline propio (carga de safetensors, tokenizador, bucle de generación) sirve como esqueleto para construir un servidor mínimo sin depender de `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, TruthfulQA u otros) en la información disponible. Los únicos datos cuantitativos publicados son de latencia de decodificación y de paridad numérica.

Latencia de decodificación por token con y sin caché KV, medida sobre una RTX 3050:

| Contexto (tokens) | Sin KV cache (ms/token) | Con KV cache (ms/token) | Aceleracion |
|---:|---:|---:|---:|
| 16 | 28,84 | 20,90 | 1,38x |
| 32 | 24,29 | 26,97 | 0,90x |
| 64 | 27,47 | 21,52 | 1,28x |
| 128 | 32,22 | 21,50 | 1,50x |
| 256 | 60,62 | 21,39 | 2,83x |
| 512 | 119,99 | 26,41 | 4,54x |
| 1024 | 268,96 | 19,44 | 13,83x |

Verificación de paridad frente a la implementación de Hugging Face (FP32, cinco prompts):

| Metrica | Resultado |
|---|---|
| Coincidencia en top-1 | idéntica |
| Coincidencia en top-5 | idéntica |
| Diferencia absoluta maxima de logits | < 2e-5 |
| Consistencia KV cache vs sin KV cache | verificada |

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 2,48 GB en bfloat16 (1,24B × 2 bytes) y 4,96 GB en FP32.
- VRAM para inferencia: del orden de 3 a 4 GB en bfloat16 contando pesos, activaciones y caché KV para contextos cortos o medios.
- Caché KV: con 16 capas, 8 cabezas KV y dimensión 64, la caché ocupa unos 33 MB por cada 1024 tokens en bfloat16 y aproximadamente 4,3 GB si se llena la ventana completa de 131.072 tokens, lo que condiciona el despliegue a contextos largos.
- GPU verificada por el autor: RTX 3050, con latencias de 19 a 27 ms por token usando caché KV (equivalente aproximado de 37 a 52 tokens por segundo en ese rango de contexto).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4-6 GB de VRAM en bfloat16 (RTX 3050, RTX 3060, RTX 4060, RTX 4090, entre otras). Para contextos cercanos a 128k tokens se recomienda una GPU con 16 GB o más.
- GPU de centro de datos: no son necesarias para este tamaño; A100 o H100 solo tendrían sentido para servir muchas réplicas en paralelo o para fine-tuning.
- Opciones de despliegue: únicamente la implementación PyTorch propia del autor (`N-Harish/llama3.2-1b-scratch`), gestionada con `uv`. El repositorio advierte explícitamente de que no está pensado para cargarse con la API estándar de Hugging Face Transformers, por lo que vLLM, TGI, llama.cpp, Ollama o LM Studio no funcionarían directamente con este checkpoint sin una conversión previa al formato y los nombres de tensor esperados por cada herramienta.
- Throughput: no disponible más allá de las medidas por token publicadas (que no incluyen batching ni procesamiento en paralelo de secuencias).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| `Harish241412/llama-3.2-1b-from-scratch` | ~1,24B | 131.072 tokens | no disponible | safetensors BF16 + implementación PyTorch propia en GitHub | Reimplementación educativa; requiere código propio, no funciona con `transformers` estándar |
| `meta-llama/Llama-3.2-1B` | ~1,24B | 131.072 tokens | Llama 3.2 Community License | safetensors, integrado en `transformers`, vLLM, llama.cpp, Ollama | Modelo base original; misma arquitectura y pesos que el proyecto educativo carga |
| `meta-llama/Llama-3.2-1B-Instruct` | ~1,24B | 131.072 tokens | Llama 3.2 Community License | safetensors, integrado en el ecosistema estándar | Variante ajustada por instrucciones; apta para chat y algo de tool calling |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,54B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, integrado en el ecosistema estándar | Alternativa de tamaño similar con licencia permisiva y contexto menor |

Nota: los datos de las filas correspondientes a modelos de terceros proceden de la documentación pública de cada proyecto y no de la información proporcionada en esta ficha, por lo que conviene verificarlos antes de tomar decisiones.

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de una implementación con fines educativos y de investigación, sin ajuste por instrucciones ni alineación adicional.
- Riesgo elevado de alucinación y de degradación en razonamiento: con 1,24B parámetros y sin ajuste, la calidad en tareas complejas (matemáticas, código, razonamiento multi-paso) es limitada por diseño.
- Licencia no declarada en el repositorio: los pesos derivan de `meta-llama/Llama-3.2-1B`, de modo que su uso comercial y su redistribución están sujetos a la licencia del modelo base. Debe consultarse y respetarse antes de cualquier uso comercial.
- Compatibilidad restringida: la model card indica explícitamente que el checkpoint no está pensado para cargarse con la API estándar de Hugging Face Transformers. Tampoco funciona con vLLM, TGI, llama.cpp ni Ollama sin una conversión previa.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística ni sobre el rendimiento en castellano.
- Contexto declarado de 131.072 tokens, pero sin verificación publicada de calidad ni de estabilidad a longitudes largas; el coste de memoria de la caché KV (unos 4,3 GB en BF16 a ventana completa) limita su uso práctico en GPU de consumo.
- Tokenizador y pipeline propios: aunque la paridad numérica está verificada, cualquier divergencia futura entre el tokenizador propio y el oficial podría introducir diferencias difíciles de detectar.
- Repositorio sin tracción ni validación externa: 0 descargas y 0 "likes" en el momento de la consulta, sin pipeline declarado, sin dataset y sin benchmarks de calidad publicados.
- No soporta tool calling, function calling, agentes ni multimodalidad.
- Advertencia metodológica: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a portales institucionales sin relación con el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harish241412/llama-3.2-1b-from-scratch
- Repositorio de la implementación (GitHub): https://github.com/N-Harish/llama3.2-1b-scratch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Gestor de dependencias utilizado por el proyecto (`uv`): https://docs.astral.sh/uv/
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
