# kmkrworks/LiteGPT-V2-Base

## Resumen

LiteGPT V2 Base es un modelo de lenguaje de 201.373.952 parámetros desarrollado por kmkrworks, construido íntegramente desde cero: arquitectura propia, tokenizer entrenado por el autor y pesos originales. Se presenta como la segunda iteración de la familia LiteGPT, con mejoras sustanciales frente a V1 en cinco benchmarks y un rendimiento notablemente superior en modelado de código (de 1.612 a 0.515 bits por byte). El modelo está pensado como base para investigación, aprendizaje y ajuste fino en tareas concretas, no como asistente listo para producción.

La relevancia de este modelo reside en su escala y su transparencia: se entrenó en 37 horas sobre una única GPU alquilada, con cada experimento registrado antes de ejecutarse, y todos los resultados, gráficas y registros de ejecución están publicados en el repositorio del proyecto. Con 28 capas, anchura 768, 12 cabezas de atención (4 KV heads) y un contexto de 4.096 tokens, ocupa un nicho de modelos extremadamente ligeros que caben en un portátil y se cargan en Transformers sin código remoto.

La licencia Apache-2.0 para los pesos y MIT para el código facilita su uso comercial y su integración en pipelines existentes. No obstante, se trata de un modelo base sin ajuste de seguridad, con capacidades limitadas en conocimiento factual (TriviaQA 0.054 en zero-shot) y centrado exclusivamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, QK-norm, SwiGLU y grouped-query attention (GQA) |
| Parámetros totales | 201.373.952 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (GGUF); pesos originales en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (pesos), MIT (código) |
| Formato de pesos | safetensors (Transformers), GGUF (llama.cpp, LM Studio) |

## Arquitectura y entrenamiento

LiteGPT V2 es un transformer decoder-only denso de 28 capas con anchura 768 y 12 cabezas de atención, de las cuales 4 son KV heads (grouped-query attention), lo que reduce el coste de memoria en inferencia. Incorpora RoPE para codificación posicional, RMSNorm, QK-norm y activación SwiGLU. El tokenizer es un BPE a nivel de byte de 32.768 tokens, entrenado específicamente sobre los datos del proyecto con la librería `tokenizers` de Hugging Face. La implementación de la arquitectura es propia y no requiere código remoto para cargarse en Transformers.

El preentrenamiento se realizó en 37 horas sobre una única GPU alquilada, con una mezcla de datos elegida mediante experimentos registrados de antemano. La composición principal fue: FineWeb-Edu (72%), Cosmopedia v2 generado por Mixtral-8x7B-Instruct (13%), FineMath (7,5%), código de github-code-clean en Python, JS, TS, SQL y Shell (7,5%). En la fase de decay se reajustaron las proporciones (50% FineWeb-Edu, 20% Cosmopedia v2, 13% FineMath, 12% código, 5% SmolTalk generado por Qwen2.5-72B-Instruct). No se menciona en la información disponible el número total de tokens de entrenamiento ni el uso de RLHF o DPO; el modelo se distribuye como base sin ajuste de instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, con especial énfasis en modelado de código (0.515 bits por byte, el mejor de los modelos por debajo de 300M parámetros medidos por el autor).
- Razonamiento básico y respuesta a preguntas de sentido común (ARC-Easy 0.588, HellaSwag 0.369, PIQA 0.663 en zero-shot).
- Modelado matemático (0.928 bits por byte tras preentrenamiento).
- Generación de salida estructurada tras ajuste fino: 91,4% de precisión en intenciones Banking77, F1 de slot 0,775 en MASSIVE y F1 de campo contractual 0,711 en CUAD.
- Capacidad de ajuste fino para clasificación de intenciones, extracción de slots y extracción de campos en contratos.
- No se documenta soporte nativo de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas al inglés; no se reportan evaluaciones en otros idiomas.

## Casos de uso

- Clasificación de intenciones en atención al cliente: tras ajuste fino, el modelo alcanza 91,4% de precisión en Banking77, por lo que puede integrarse en un clasificador ligero que enrute consultas entrantes a departamentos o respuestas predefinidas con un coste de memoria de 1,66 GiB en CPU.
- Extracción de campos en contratos: con un ajuste fino sobre datos tipo CUAD (F1 0,711), puede utilizarse para poblar bases de datos a partir de documentos legales en pipelines de procesamiento por lotes donde el coste por inferencia es crítico.
- Generación de JSON válido en asistentes de formularios: el modelo produce JSON válido en el 99,99% de las peticiones MASSIVE tras ajuste fino, lo que lo hace adecuado para rellenar formularios o estructurar respuestas de usuario en aplicaciones web ligeras.
- Prototipado e investigación educativa: al ser un modelo construido desde cero con registros de ejecución públicos, sirve para estudiar el efecto de decisiones de arquitectura, mezcla de datos y tokenizer en un entorno reproducible y de bajo coste.
- Asistencia de código en entornos con recursos limitados: su baja perplejidad en código (0.515 bits por byte) permite usarlo como autocompletado o generador de fragmentos en Python, JS, TS, SQL o Shell dentro de editores o scripts que corren en portátiles, sin necesidad de GPU dedicada.
- Base para ajuste fino en dominios verticales: al ser un modelo base Apache-2.0, puede adaptarse con LoRA o ajuste completo a tareas de clasificación, extracción o generación específicas de un sector, con un coste de entrenamiento muy bajo gracias a sus 201M de parámetros.
- Despliegue en dispositivos edge o navegador: los GGUF Q4_K_M permiten ejecutarlo con llama.cpp o LM Studio en hardware modesto, e incluso existe una demo en Hugging Face Spaces para probarlo en el navegador.

## Benchmarks y rendimiento

Resultados publicados por el autor (zero-shot, media de 10 tareas y métricas por tarea):

| Benchmark | LiteGPT V2 | LiteGPT V1 |
|---|---:|---:|
| Media zero-shot, 10 tareas | 0.383 | 0.371 |
| ARC-Easy | 0.588 | 0.529 |
| HellaSwag | 0.369 | 0.326 |
| PIQA | 0.663 | 0.630 |
| TriviaQA | 0.054 | 0.029 |
| Código, bits por byte (menor es mejor) | 0.515 | 1.612 |
| Matemáticas, bits por byte (menor es mejor) | 0.928 | 1.374 |

Tras ajuste fino por tarea:

| Tarea | Puntuación |
|---|---:|
| Banking77, precisión de intención | 0.914 |
| MASSIVE, F1 de slot | 0.775 |
| CUAD, F1 de campo contractual | 0.711 |

Comparativa como modelo base frente a alternativas (media zero-shot de 10 tareas, bits por byte en código y memoria GPU con batch 8):

| Modelo | Parámetros | Media zero-shot | Código (bits/byte) | Memoria GPU batch 8 |
|---|---:|---:|---:|---:|
| Qwen3-0.6B-Base | 596M | 0.489 | 0.372 | 2.72 GiB |
| SmolLM2-135M | 135M | 0.403 | 0.559 | 0.73 GiB |
| Gemma 3 270M | 268M | 0.393 | 0.617 | 2.59 GiB |
| **LiteGPT V2** | **201M** | **0.383** | **0.515** | **0.59 GiB** |
| LiteGPT V1 | — | 0.371 | 1.612 | 0.78 GiB |

Comparativa tras ajuste fino equivalente (media de 3 semillas, mayor es mejor):

| Modelo | Parámetros | Puntuación media | Banking77 | MASSIVE | CUAD | RAM pico en CPU |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3-0.6B | 596M | 0.851 | 0.931 | 0.812 | 0.809 | 4.27 GiB |
| Gemma 3 270M | 268M | 0.822 | 0.919 | 0.778 | 0.768 | 2.62 GiB |
| SmolLM2-135M | 135M | 0.817 | 0.920 | 0.787 | 0.745 | 1.61 GiB |
| **LiteGPT V2** | **201M** | **0.800** | **0.914** | **0.775** | **0.711** | **1.66 GiB** |

Nota del autor: las cifras de memoria de LiteGPT V2 usan su propio motor de inferencia, mientras que las de los demás modelos usan Transformers.

## Requisitos de hardware

- VRAM estimada: 0,59 GiB de memoria GPU con batch 8 usando el motor propio de LiteGPT; en Transformers el consumo será algo mayor pero del mismo orden.
- RAM en CPU: 1,66 GiB en pico durante la inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU sin problemas. Para entrenamiento o ajuste fino, una RTX 3090 o A100 acelera el proceso, aunque el modelo cabe en GPUs de gama baja.
- Cabe en GPU consumer: sí, holgadamente, incluso en iGPU y en dispositivos con poca memoria.
- Opciones de despliegue: Transformers (sin código remoto), llama.cpp, LM Studio (GGUF BF16, Q8_0, Q4_K_M), motor propio de LiteGPT, y text-generation-inference por los tags del repositorio. Existe una demo en Hugging Face Spaces.
- Latencia y throughput: no se han publicado cifras concretas de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Zero-shot medio | Código (bits/byte) | Memoria GPU batch 8 |
|---|---:|---:|---|---:|---:|---:|
| **LiteGPT V2** | 201M | 4.096 | Apache-2.0 | 0.383 | 0.515 | 0.59 GiB |
| Qwen3-0.6B-Base | 596M | No disponible | Apache-2.0 | 0.489 | 0.372 | 2.72 GiB |
| SmolLM2-135M | 135M | No disponible | Apache-2.0 | 0.403 | 0.559 | 0.73 GiB |
| Gemma 3 270M | 268M | No disponible | Gemma license | 0.393 | 0.617 | 2.59 GiB |

LiteGPT V2 se sitúa por debajo de Qwen3-0.6B y SmolLM2-135M en media zero-shot, pero supera a Gemma 3 270M en esa métrica y ofrece el menor consumo de memoria GPU de la comparativa (0.59 GiB). En modelado de código, queda por detrás de Qwen3-0.6B (0.372) pero por delante de SmolLM2-135M y Gemma 3 270M. Su ventaja principal es la combinación de tamaño reducido, licencia permisiva y transparencia total en el proceso de entrenamiento.

## Limitaciones y advertencias

- Modelo base sin ajuste de seguridad ni de instrucciones: no debe exponerse directamente a usuarios finales sin salvaguardas adicionales.
- Riesgo elevado de alucinación en conocimiento factual: TriviaQA zero-shot de 0.054 indica un conocimiento del mundo muy limitado.
- Contexto de solo 4.096 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Rendimiento inferior a Qwen3-0.6B y SmolLM2-135M en la mayoría de benchmarks zero-shot, aunque con menor huella de memoria.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Aunque la licencia Apache-2.0 permite uso comercial, los datos de entrenamiento incluyen componentes generados por Mixtral-8x7B-Instruct y Qwen2.5-72B-Instruct, con las condiciones de licencia de esos generadores; conviene revisar el archivo NOTICE antes de un despliegue comercial.
- Las cifras de memoria del autor usan su propio motor de inferencia, por lo que la comparación directa con Transformers no es exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmkrworks/LiteGPT-V2-Base
- GGUF para llama.cpp y LM Studio: https://huggingface.co/kmkrworks/LiteGPT-V2-Base-GGUF
- Demo en el navegador: https://huggingface.co/spaces/kmkrworks/LiteGPT-V2-Chat
- Repositorio del proyecto: https://github.com/kmkrofficial/LiteGPT
- Resultados completos y comparativas: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/results.md
- Fuentes de datos y mezcla de entrenamiento: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/spec/data_sources.yaml
- Gráfica comparativa V1 vs V2: https://raw.githubusercontent.com/kmkrofficial/LiteGPT/main/docs/figures/v1_vs_v2.svg
