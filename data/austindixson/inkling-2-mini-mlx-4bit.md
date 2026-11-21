# austindixson/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini-MLX-4bit es una conversión a 4 bits en formato MLX del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario austindixson. Se trata de una cuantización afín con tamaño de grupo 64 (4,668 bits por peso) realizada sobre un Apple M3 Max con 128 GB de RAM, pensada para ejecutar el modelo en Apple Silicon mediante la librería mlx-lm. El resultado ocupa unos 14 GiB en disco, distribuidos en tres shards de safetensors, y es exclusivamente de texto.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.388.559.360 parámetros totales y una arquitectura identificada en los tags como `inkling2_loop`, lo que sugiere un mecanismo de pasadas recurrentes sobre capas (loop passes). El modelo emite siempre un bloque de razonamiento previo a la respuesta, delimitado por tokens especiales como `<|content_thinking|>` y `<|content_text|>`. Está orientado a generación de texto y conversación en inglés.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo MoE de 26B en hardware de consumo Apple; por otro, el autor documenta con detalle el coste de la cuantización (aproximadamente un 1,9 % de perplejidad adicional) y advierte de que el soporte para el tipo de modelo `inkling2_loop` aún no está fusionado en mlx-lm, por lo que requiere aplicar un pull request concreto. Es una conversión de nicho, con cero descargas en el momento de la consulta y publicada por un tercero, no por el desarrollador original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mecanismo de loop (`inkling2_loop`) |
| Parámetros totales | 26.388.559.360 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks usan ventanas de 2048 y prefill a 4096) |
| Tipos de cuantización | 4 bits afín, group size 64, 4,668 bits por peso (MLX); existe un GGUF IQ4_NL hermano |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (3 shards, ~14 GiB); GGUF disponible en repo hermano |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Librería | mlx-lm (requiere PR #2086, commit `0c4c991`) |
| Modalidad | solo texto |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26.388 millones de parámetros totales. El identificador de arquitectura `inkling2_loop` y la referencia del autor a "3 loop passes" indican que el modelo aplica varias pasadas recurrentes sobre un conjunto de capas, un patrón de cómputo iterativo que incrementa la profundidad efectiva sin aumentar el número de parámetros. No se dispone de información sobre el número de expertos, la proporción de parámetros activos por token, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están incluidos en la información proporcionada.

La conversión a 4 bits se realizó con cuantización afín de grupo 64 sobre los pesos oficiales, verificada contra una implementación de referencia independiente (mlx-vlm) y contra una compilación MLX en precisión nativa. La fidelidad medida es alta: KL medio en la última posición de 0,02138 frente a la referencia y 0,01736 frente a la versión nativa, con top-1 de 7/8 y 8/8 respectivamente en 8 prompts fijos, y perplejidad en wikitext-2 de 7,0230 frente a 6,8922 de la versión nativa (factor 1,019, es decir, un coste de aproximadamente el 1,9 % de perplejidad). El autor menciona además un módulo de decodificación especulativa con cabeza draft integrada (k=3) en sus parches locales, aunque no forma parte del repositorio publicado.

## Capacidades

- Generación de texto conversacional en inglés, con emisión obligatoria de un bloque de razonamiento previo (`content_thinking`) antes de la respuesta final (`content_text`).
- Razonamiento aritmético y de sentido común de varios pasos, evidenciado en el ejemplo de la model card (17 × 23 = 391 con descomposición explícita).
- Uso de herramientas (tool calling): el autor reporta 9 de 12 pruebas superadas en un conjunto pequeño de herramientas, aunque lo describe como más débil que el modelo de comparación.
- Modo de razonamiento configurable mediante el parámetro `reasoning_effort` (valores observados: "none", "low"); el modelo razona antes de responder incluso en "none".
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Visión, audio y otras modalidades: no disponibles (modelo solo de texto).
- Soporte de decodificación especulativa mediante cabeza draft integrada, aunque su uso requiere scripts propios no publicados.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en unos 20 GB de memoria pico a 4096 tokens de contexto, por lo que puede ejecutarse íntegramente en un Apple Silicon de 32 GB o más mediante mlx-lm, sin conexión a servicios externos.
- Razonamiento aritmético y problemas de varios pasos en local: el bloque de razonamiento explícito permite auditar la cadena de pensamiento antes de la respuesta, útil en entornos educativos o de verificación.
- Automatización con herramientas en escritorio: con 9/12 en el conjunto de prueba de herramientas del autor, puede integrarse en flujos de agente sencillos (consulta de APIs, ejecución de comandos) siempre que se acepte su menor fiabilidad frente a alternativas.
- Procesamiento por lotes sin GPU dedicada: con prefill de 752,5 tok/s a 4096 tokens en un M3 Max, es viable procesar documentos largos o generar resúmenes por lotes en un portátil.
- Evaluación e investigación de cuantización: el repositorio incluye métricas de KL, top-1 y perplejidad frente a la referencia nativa, lo que lo convierte en un caso de estudio útil para medir el impacto de la cuantización 4-bit en arquitecturas MoE con loop.
- Desarrollo y pruebas de integración con mlx-lm: sirve para validar el soporte del tipo `inkling2_loop` en el PR #2086 antes de su fusión, en pipelines de CI que necesiten un modelo MoE de tamaño medio en Apple Silicon.
- Prototipado de chat en inglés con contexto medio: para aplicaciones donde el inglés sea suficiente y el contexto no supere unos miles de tokens, ofrece una alternativa autohospedada con licencia Apache 2.0.

## Benchmarks y rendimiento

Corrección de la cuantización (autor, sobre 8 prompts fijos y wikitext-2):

| Comprobación | Resultado |
|---|---|
| KL medio última posición vs referencia mlx-vlm | 0,02138 |
| Top-1 última posición vs referencia mlx-vlm | 7/8 |
| KL medio última posición vs MLX nativo | 0,01736 |
| Top-1 vs MLX nativo (última / todas) | 8/8 / 116/124 |
| Perplejidad wikitext-2 (65.504 tokens, 32 × 2048, 3 pasadas) | 7,0230 (nativo: 6,8922; factor 1,019) |

Velocidad y memoria en Apple M3 Max 128 GB (`mlx_lm.benchmark`, 128 tokens generados, media ± desviación típica, 3 pasadas de loop):

| Build | Prefill @4096 (tok/s) | Decode @4096 (tok/s) | Decode @0 (tok/s) | Memoria pico @4096 |
|---|---|---|---|---|
| Esta conversión 4-bit | 752,5 ± 57,5 | 45,60 ± 0,15 | 47,60 ± 0,41 | 20,18 GB |
| Precisión nativa (referencia) | 740,9 ± 54,9 | 36,36 ± 0,62 | 38,66 ± 0,12 | 24,34 GB |
| GGUF IQ4_NL en llama.cpp (mismo modelo) | 318,25 ± 35,89 | 29,30 ± 0,18 | no disponible | no disponible |

Comparación con el modelo "Flash" en las mismas condiciones (MLX, mismo Mac, mismo cliente):

| Evaluación | Inkling 4-bit (low) | Flash |
|---|---|---|
| Conjunto pequeño de herramientas, aprobadas /12 | 9 | 9 |
| Tiempo total mediano en caliente | 1,92 s | 0,64 s (Inkling 3,0× más lento) |
| Latencia de "¿Cuánto es 17*23?" | 1,10 s | 0,10 s |
| Decode en cliente, mediana | 42,0 tok/s | no disponible en el extracto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 20,18 GB de pico con contexto de 4096 tokens en la build 4-bit; unos 14 GiB en disco para los pesos.
- Cabe en Apple Silicon de gama alta: probado en un M3 Max con 128 GB; por el pico medido, un equipo con 32 GB o más de memoria unificada debería poder cargarlo, aunque no se ha verificado en la información disponible.
- GPU NVIDIA: no aplicable directamente, ya que el formato es MLX; para CUDA existe el repo hermano GGUF IQ4_NL ejecutable con llama.cpp.
- Despliegue: mlx-lm (requiere el PR #2086, commit `0c4c991`, con mlx 0.32.4, Python 3.13 y transformers 5.24.0); llama.cpp con el GGUF hermano; no se menciona soporte en vLLM, TGI, Ollama ni LM Studio.
- Latencia y throughput: decode de 45,60 tok/s a 4096 tokens y 47,60 tok/s a contexto cero en el M3 Max; con decodificación especulativa propia (k=3) el autor midió 63,45 tok/s frente a 48,0 del harness simple (1,32×; media emparejada 1,36×). El GGUF IQ4_NL en llama.cpp alcanza 29,30 tok/s de decode, un 1,56× más lento que MLX 4-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit (esta ficha) | 26,39B totales (MoE) | no disponible | Apache 2.0 | MLX 4-bit, Apple Silicon | 45,60 tok/s decode @4096 en M3 Max; 9/12 en herramientas |
| Inkling-2-Mini (base, thinkingmachines) | 26,39B totales (MoE) | no disponible | Apache 2.0 | safetensors nativo | Referencia de precisión; perplejidad 6,8922 en wikitext-2 |
| Inkling-2-Mini-IQ4_NL-GGUF (austindixson) | 26,39B totales (MoE) | no disponible | Apache 2.0 | GGUF IQ4_NL, llama.cpp | 29,30 tok/s decode @4096; portable a CPU y CUDA |
| Flash (pack local MLX, no publicado) | no disponible | no disponible | no disponible | MLX | 9/12 en herramientas; 3,0× más rápido en el conjunto evaluado |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado solo en inglés, es probable que tenga un sesgo cultural y lingüístico hacia ese idioma, aunque no se aportan datos.
- Riesgo de alucinación: no cuantificado; el modelo siempre emite razonamiento previo, lo que puede dar una falsa sensación de fiabilidad en respuestas incorrectas.
- Idioma: solo inglés; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto: la longitud máxima no está especificada; los benchmarks solo cubren ventanas de 2048 y prefill de 4096, por lo que no hay garantías más allá de ese rango.
- Licencia: Apache 2.0 permite uso comercial, pero la conversión es de un tercero y no del autor original; conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini antes de producción.
- Dependencia frágil: requiere un PR no fusionado de mlx-lm (estado OPEN a 2026-11-21); una versión publicada de mlx-lm no carga el tipo `inkling2_loop` y la salida sin parches no separa razonamiento, contenido ni llamadas a herramientas.
- Rendimiento: más lento que el modelo de comparación Flash (3,0× en el conjunto evaluado) y más débil en uso de herramientas según el propio autor; las diferencias de calidad no son estadísticamente significativas en su medición.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; es una conversión recién publicada, sin validación comunitaria.
- Las cifras de velocidad con decodificación especulativa provienen de parches locales no publicados y no están disponibles con el repositorio tal cual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/austindixson/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repo hermano GGUF IQ4_NL: https://huggingface.co/austindixson/Inkling-2-Mini-IQ4_NL-GGUF
- Pull request de mlx-lm con soporte de Inkling 2: https://github.com/ml-explore/mlx-lm (PR #2086, commit `0c4c99192230f1943dd468d297f0b8a64ae7b7c2`)
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
