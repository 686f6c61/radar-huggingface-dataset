# imagami/Shikigami-594B-A17B-GGUF

## Resumen

Shikigami-594B-A17B-GGUF es una cuantización extrema (aproximadamente 1 bit por peso) del modelo multimodal Inkling 2 Small de Thinking Machines, publicada por el usuario independiente imagami. El modelo original es un Mixture of Experts (MoE) de 594.000 millones de parámetros totales con 17.000 millones activos por token, que selecciona 8 expertos de un total de 384. Esta versión comprimida reduce el peso a unos 80 GB mediante poda de expertos, reducción de la dimensión intermedia y codificación de los expertos con un esquema de retícula (trellis) inspirado en QTIP.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 594B en hardware de consumo profesional (tres Intel Arc Pro B70 de 32 GB) o en una NVIDIA DGX Spark (GB10), algo inviable con los pesos originales en BF16. El coste es una degradación de calidad controlada y un formato propietario que no carga en llama.cpp estándar, Ollama, LM Studio ni Unsloth, sino solo en forks específicos (XeStrata con SYCL y un fork de llama.cpp para GB10).

Se distribuye bajo licencia Apache 2.0 como derivado de Inkling 2 Small, con la salvedad de que el uso queda sujeto a la Acceptable Use Policy de Thinking Machines. El repositorio ocupa 493,6 GB e incluye pesos TQ1, el codificador visual en BF16 y un modelo borrador para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 8 expertos activos de 384 |
| Parametros totales | 594B (modelo original); 80.802.861.091 en safetensors de la version cuantizada |
| Parametros activos | 17B |
| Longitud de contexto | 16.384 tokens (configuracion de referencia del autor; el modelo base puede soportar mas, no confirmado) |
| Tipos de cuantizacion | TQ1 (~1,1 bits/peso), expertos en trellis tipo QTIP; atencion, embeddings y salida en Q6_K; router en F32; vision encoder en BF16 |
| Idiomas soportados | No disponible (la model card esta en japones e ingles; el modelo base no declara lista de idiomas) |
| Licencia | Apache 2.0 (derivado de Inkling 2 Small), sujeto a la Acceptable Use Policy de Thinking Machines |
| Formato de pesos | GGUF (TQ1 con ficheros `.tq` y `.tq_gain`), mas `mmproj-BF16.gguf` y modelo borrador DSpark Q8_0 |

## Arquitectura y entrenamiento

El modelo base, Inkling 2 Small, es un transformer con capas MoE de 384 expertos y 8 activos por token, con 594B parámetros totales y 17B activos. Esta cuantización no reentrena el modelo: aplica una compresión agresiva sobre los pesos originales. Para cada capa se podan los expertos menos utilizados y se reduce la dimensión intermedia de los restantes a 2304, 1728, 1152 o 576, agrupados en `_g1`, `_g2`, etc., recortando también el router a los expertos supervivientes. La selección de qué podar y cuánto reducir minimiza el error de salida ponderado, dando más peso a los expertos usados en generación de código y matemáticas.

Los expertos se almacenan con un código de retícula de desplazamiento de bits inspirado en QTIP: cada tile de 256 pesos (16×16) ocupa 66 bytes (2,06 bits por peso), con un estado inicial de 14 bits y 255 símbolos de 2 bits. Los pesos se reconstruyen aritméticamente desde el estado (`v = s * 34038481 + 76625530` módulo 2^32, suma de 4 bytes, menos 510, dividido por 147,8) sin codebook, y se escalan por filas en FP16. Las secuencias de signos se buscan con algoritmo de Viterbi sobre los 2^14 estados posibles, y las entradas de cada matriz se rotan con una transformada de Hadamard de 64 puntos tras aplicar un signo fijo. Los escalares por fila se ajustan para aproximar la distribución de siguiente token del modelo original. El resultado global es de aproximadamente 1,1 bits por peso.

El codificador visual (ViT de 23 capas y proyector) se mantiene en BF16 sin cuantizar. Se incluye además un modelo borrador DSpark (Q8_0, 1,87 GB) para decodificación especulativa, derivado de `mtp.safetensors` del modelo original, con un vocabulario reducido a 32.768 tokens para acelerar la verificación.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 16.384 tokens en la configuración de referencia.
- Entrada de imagen y texto (pipeline `image-text-to-text`): el codificador ViT procesa imágenes en regiones de 40×40 píxeles por token, con reescalado previo si se superan 1024 regiones.
- Razonamiento con modo de pensamiento (thinking mode) configurable mediante `reasoning_effort`, incluido `"none"` para desactivarlo.
- Generación de código y resolución de problemas matemáticos, con sesgo explícito en la calibración de la cuantización hacia estos dominios.
- Soporte de tool calling y function calling, mencionado en el contexto de flujos de agentes.
- Decodificación especulativa mediante el modelo borrador DSpark incluido.
- Capacidades multilingües: la model card demuestra generación en japonés e inglés; no se declara una lista formal de idiomas.

## Casos de uso

- Despliegue de un modelo de escala 594B en hardware de gama prosumer: con tres Intel Arc Pro B70 (32 GB cada una) y 89 GB de RAM principal, todos los expertos caben en VRAM, lo que permite experimentar con un MoE de gran escala sin clúster de datacenter.
- Inferencia en estación de trabajo compacta: en una NVIDIA DGX Spark (GB10) se obtienen 717-763 tokens/s de prefill y 21-34 tokens/s de decode con decodificación especulativa, suficiente para asistentes interactivos locales.
- Asistencia a la programación con contexto largo: los 16.384 tokens de contexto y el sesgo de calibración hacia código permiten mantener conversaciones de depuración con varios ficheros y trazas, aunque con el caveat de los bucles de razonamiento descritos más abajo.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text admite capturas, diagramas o formularios, útil para extracción de información en entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Agentes con tool calling: la integración con servidores compatibles con la API de OpenAI (XeStrata expone `image_url` y endpoints conversacionales) permite construir agentes multi-paso que invocan funciones externas.
- Evaluación e investigación de cuantización extrema: el esquema trellis con Viterbi y escalares ajustados por fila es un caso de estudio reproducible para medir la degradación de un MoE de 594B a ~1 bit por peso.
- Generación multilingüe japonés-inglés: útil para prototipos de atención al cliente o documentación bilingüe, dado el soporte demostrado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los únicos datos cuantitativos son de rendimiento de inferencia y de fidelidad de la cuantización:

| Metrica | Valor | Contexto |
|---|---|---|
| Perplexity (GB10, fork llama.cpp) | 2,794 vs 2,793 | Frente a la conversion propia del fork; texto de prueba |
| Error relativo del vision encoder | 6×10⁻⁶ | Frente a la implementacion de referencia en transformers |
| Generacion, codigo (B70 ×3) | 56 tok/s | Prompt corto, 384 tokens de respuesta, greedy, DSpark |
| Generacion, agente (B70 ×3) | 53 tok/s | Mismo escenario |
| Generacion, japones (B70 ×3) | 42 tok/s | Mismo escenario |
| Prefill (B70 ×3) | ~265 tok/s | Prompt de 4.719 tokens |
| Prefill (GB10, llama.cpp) | 717-763 tok/s | Con decodificacion especulativa |
| Decode (GB10, llama.cpp) | 21-34 tok/s | 25 tok/s sin especulacion |
| Prefill (GB10, XeStrata gb10-port) | 461-491 tok/s | Puerto de XeStrata |
| Decode (GB10, XeStrata gb10-port) | 20-27 tok/s | Puerto de XeStrata |

## Requisitos de hardware

- VRAM estimada: los pesos TQ1 ocupan 80,0 GB repartidos en 10 ficheros; sumando el codificador visual BF16 (0,66 GB) y el borrador DSpark (1,87 GB) se superan los 82 GB. El autor reporta 89 GB de RAM principal en la configuración de tres B70, con todos los expertos en VRAM.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) en configuraciones de tres unidades con SYCL mediante XeStrata; NVIDIA DGX Spark (GB10) mediante el fork `ink2v` de llama.cpp o el puerto `gb10-port` de XeStrata.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, RTX 5090 con 32 GB) por sí sola; requiere agregación de varias GPU o el sistema integrado GB10.
- Opciones de despliegue: exclusivamente XeStrata (rama `b70-local`, commit 4b1a8fbdb o posterior, con SYCL) o el fork `imagami3/llama.cpp` rama `ink2v` (etiqueta `ink2v-20261123-0050`) para GB10. No funciona en llama.cpp upstream, Ollama, LM Studio ni Unsloth.
- Latencia y throughput: ver tabla de benchmarks; en B70 triple se obtienen 42-56 tok/s de generación y ~265 tok/s de prefill; en GB10, 20-34 tok/s de decode y hasta 763 tok/s de prefill.
- Variables de entorno relevantes en XeStrata: `STRATA_GPU_ONLY_EXPERTS=1`, `STRATA_INK_EP`, `STRATA_INK_TP`, `STRATA_INK_SPEC=dspark`, `STRATA_INK_DSPARK`, `STRATA_DSPARK_VOCAB`, con `--split-device` y `--layer-split` para repartir capas entre GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Shikigami-594B-A17B-GGUF | 594B (80,8B en safetensors del repo) | 17B | 16.384 (config. de referencia) | Apache 2.0 + AUP | GGUF TQ1, solo XeStrata y fork llama.cpp | Cuantizacion ~1,1 bits/peso, multimodal |
| Inkling 2 Small (original) | 594B | 17B | No disponible | Apache 2.0 + AUP | Safetensors BF16 | Modelo base sin comprimir; requiere hardware de datacenter |
| Inkling 2 Mini | No disponible | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card por el mismo problema de bucles de razonamiento |
| MoE de ~600B en 4 bits (referencia generica) | ~600B | Variable | Variable | Variable | GGUF Q4 | El autor indica que el modelo de 4 bits previo a la cuantizacion tambien presenta bucles de pensamiento |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de la misma categoría; la comparativa se limita a parámetros, formato y requisitos de despliegue.

## Limitaciones y advertencias

- Bucles de razonamiento: Inkling 2 puede repetir la misma verificación dentro del bloque de pensamiento sin salir, especialmente al depurar código. Ocurre también en el modelo de 4 bits previo y empeora con la cuantización. El motor XeStrata lo mitiga cerrando el bloque de pensamiento si detecta repeticiones (misma cadena de 20 caracteres 7 veces en 400, o de 48 caracteres 4 veces en 2.400), y `reasoning_effort: "none"` redujo los bucles de 8/20 a 2/20 en pruebas de agentes. Bajar la temperatura, avisar en el system prompt o aplicar repetition penalty no funcionó según el autor.
- Compatibilidad restringida: el formato TQ1 no es un GGUF estándar; no carga en llama.cpp upstream, Ollama, LM Studio ni Unsloth. Depende de forks mantenidos por el propio autor, lo que supone riesgo de mantenimiento y de seguridad de la cadena de suministro.
- Degradación de calidad por cuantización: ~1,1 bits por peso implica pérdida de fidelidad frente al original; la perplexity reportada (2,794 vs 2,793) es solo sobre un texto de prueba y no sustituye una evaluación amplia.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de factualidad en la información disponible.
- Sesgos: no documentados en la model card; el sesgo de calibración hacia código y matemáticas puede reducir la calidad relativa en otros dominios.
- Idiomas: solo se demuestran japonés e inglés; el rendimiento en castellano no está verificado.
- Licencia: Apache 2.0 permite uso comercial del derivado, pero la Acceptable Use Policy de Thinking Machines se aplica al uso; conviene revisarla antes de desplegar en producción.
- Visión: imágenes con más de 1024 regiones de 40×40 píxeles se reescalan, lo que puede degradar la lectura de texto fino; el codificador se ejecuta en CPU con NumPy, lo que añade latencia.
- Contexto: la configuración de referencia usa 16.384 tokens; no se confirma si el modelo base soporta ventanas mayores en este formato.
- Distribución no oficial: no es una publicación de Thinking Machines; los cambios respecto al original son solo cuantización y renombrado, según el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imagami/Shikigami-594B-A17B-GGUF
- Modelo base Inkling 2 Small: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- XeStrata, rama b70-local: https://github.com/imagami3/XeStrata/tree/b70-local
- XeStrata, rama gb10-port: https://github.com/imagami3/XeStrata/tree/gb10-port
- Fork de llama.cpp, rama ink2v: https://github.com/imagami3/llama.cpp/tree/ink2v
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
