# blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int8-ov

## Resumen

MiniCPM-V-4.7-35B-A3B-DSpark-int8-ov es una exportación a OpenVINO en INT8 del modelo borrador (*draft*) dSparK asociado a MiniCPM-V 4.7 35B-A3B, un modelo multimodal de la familia MiniCPM desarrollada por OpenBMB. No se trata de un modelo autónomo completo, sino de un componente de decodificación especulativa: el borrador propone tokens que un modelo objetivo (*target*) verifica, acelerando la generación sin alterar sustancialmente la distribución de salida. En concreto, este repositorio contiene el borrador cuantizado a INT8 asimétrico por canal, pensado para emparejarse con la versión INT4 oficial del modelo objetivo publicada por OpenVINO.

La relevancia de esta ficha radica en que documenta una pieza de infraestructura de inferencia más que un modelo generativo de propósito general. El borrador se distribuye como exportación estándar de Optimum con verificación SHA-256 de los pesos fuente, y su columna vertebral se cuantiza a INT8 mientras que el componente Markov se mantiene en FP16. El modelo base declara una arquitectura Qwen3 con mezcla de expertos (35B totales, 3B activos según la nomenclatura A3B) y una ventana de contexto que no se detalla en la información disponible.

El caso de uso principal es la aceleración de decodificación especulativa sobre hardware Intel, particularmente iGPU Arc, donde el autor reporta incrementos medibles de throughput en modo *thinking on*. Los datos de rendimiento publicados son *smoke benchmarks* de texto, no evaluaciones de calidad ni de inferencia de imagen, por lo que deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), linaje Qwen3; incluye bloques de atención lineal y un componente Markov auxiliar |
| Parámetros totales | 35B (según nomenclatura del modelo base) |
| Parámetros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 asimétrico por canal (columna vertebral del borrador); FP16 (componente Markov); exportación OpenVINO |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportación Optimum); el repositorio ocupa 0,5 GB |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V 4.7 35B-A3B-DSpark emplea una arquitectura de mezcla de expertos con 35B parámetros totales y 3B activos, heredera del linaje Qwen3 según las etiquetas del repositorio. El borrador dSparK incorpora además 17 bloques de atención lineal (según el benchmark del autor) y un componente Markov en FP16 que complementa la columna vertebral cuantizada a INT8. El exportador estándar de Optimum no consume la cabeza de confianza (*confidence head*) del checkpoint original, lo que constituye una limitación conocida de esta exportación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La información proporcionada se limita a los detalles de exportación y a los resultados de throughput en hardware Intel Arc, sin datos sobre el proceso de preentrenamiento o alineación. La innovación técnica destacable es precisamente el mecanismo de decodificación especulativa: el borrador propone un número configurable de tokens por paso (`num_assistant_tokens`) que el modelo objetivo INT4 verifica, con tasas de aceptación medidas entre el 31,5% y el 87,7% según configuración y prompt.

## Capacidades

- Generación de texto como borrador de decodificación especulativa, emparejado con el modelo objetivo INT4 oficial de OpenVINO.
- Propuesta de tokens para verificación por el modelo principal, con tasas de aceptación dependientes del número de propuestas por paso.
- Compatibilidad con modo *thinking on* (razonamiento extendido) del modelo objetivo; el autor recomienda INT8 con `num_assistant_tokens=5` para este modo.
- Soporte de plantillas de chat explícitas en las pruebas de referencia.
- El modelo base es multimodal (MiniCPM-V), aunque este repositorio se etiqueta como `text-generation` y el benchmark publicado es exclusivamente de texto.
- No se documentan capacidades de tool calling, function calling, agentes ni multilingüismo en la información disponible.

## Casos de uso

- Aceleración de inferencia en iGPU Intel Arc: el borrador INT8 se empareja con el objetivo INT4 para elevar el throughput de 30,25 a 53,38 tok/s en el prompt de código primo con cinco propuestas por paso, un incremento de aproximadamente el 76% respecto a la línea base sin borrador.
- Despliegue de asistentes de código en hardware de consumo Intel: la combinación INT8/INT4 permite generar funciones Python a más de 50 tok/s en una iGPU, lo que hace viable la asistencia de código interactiva sin GPU dedicada.
- Generación estructurada de JSON: con el prompt de tres libros, el borrador INT8 alcanza 54,82 tok/s con cinco propuestas, adecuado para pipelines que requieren salida JSON validada en tiempo real.
- Servicios de razonamiento con *thinking mode*: el autor valida el borrador INT8 con razonamiento activado, lo que permite mantener la calidad del modo extendido con menor latencia percibida.
- Investigación en decodificación especulativa: el repositorio publica tasas de aceptación y ratios de tiempo de inferencia borrador/principal, útiles para estudiar el equilibrio entre número de propuestas y aceptación en hardware Intel.
- Prototipado en entornos OpenVINO GenAI: al ser una exportación estándar de Optimum con SHA-256 verificado, sirve como componente reproducible en pipelines de evaluación de decodificación especulativa.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a un Intel Arc iGPU con OpenVINO GenAI nightly 2027.0.0.0.dev20261119, objetivo INT4 oficial, KV paginada FP16, 17 bloques de atención lineal, decodificación greedy mono-stream y límite de 256 tokens. Cada celda es una ejecución medida, no una media.

| Borrador | Propuestas/paso | Prime: aceptados/propuestos (tasa) | Prime tok/s | JSON: aceptados/propuestos (tasa) | JSON tok/s |
|---|---:|---:|---:|---:|---:|
| Ninguno | 0 | — | 30,25 | — | 33,85 |
| INT4 | 15 | 206/655 (31,5%) | 33,93 | 76/210 (36,2%) | 41,51 |
| INT8 | 15 | 203/555 (36,6%) | 39,93 | 76/210 (36,2%) | 40,74 |
| FP16 | 15 | 204/540 (37,8%) | 42,76 | 76/210 (36,2%) | 41,02 |
| INT4 | 5 | 192/305 (63,0%) | 48,66 | 67/105 (63,8%) | 53,98 |
| INT8 | 5 | 196/285 (68,8%) | **53,38** | 67/105 (63,8%) | **54,82** |
| FP16 | 5 | 196/285 (68,8%) | 51,56 | 67/105 (63,8%) | 51,70 |

Prompt prime: `Write a Python function that checks whether a number is prime.` (256 tokens generados). Prompt JSON: `Return only valid JSON for three books with title and author fields.` (93 tokens generados). Con 15 propuestas, los ratios de tiempo de inferencia borrador/principal fueron INT4 6,8%/7,4%, INT8 5,1%/7,8% y FP16 8,7%/10,4% en prime y JSON respectivamente. Con cinco propuestas, INT4 registró 24,1%/13,0%.

Mediciones previas: prueba inicial INT4 con 15 propuestas en prime 30,78 tok/s; ejecución pareada de línea base 36,56 tok/s (206/655) en prime y 41,56 tok/s (76/210) en JSON; repetición con plantilla de chat explícita 36,14 tok/s (206/655) con 15 propuestas.

Diagnóstico (no recomendado como configuración por defecto): con *thinking off* en el mismo prompt prime, INT4 con 15 propuestas produjo 72,18 tok/s (229/349, 65,6%) y con cinco propuestas 71,17 tok/s (206/235, 87,7%), ambos con 256 tokens generados. El autor advierte que desactivar el razonamiento cambia la respuesta y no es una comparación de velocidad equivalente.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria estimada: no disponible de forma explícita; el repositorio del borrador ocupa 0,5 GB, pero el requisito conjunto depende del modelo objetivo INT4 (no cuantificado en la información disponible).
- GPU recomendadas: Intel Arc iGPU (hardware validado por el autor); no se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: el benchmark se ejecuta en una iGPU Intel Arc, lo que sugiere viabilidad en hardware integrado Intel, aunque no se especifica el modelo concreto ni su memoria.
- Opciones de despliegue: OpenVINO GenAI (nightly 2027.0.0.0.dev20261119 en las pruebas), exportación vía Optimum; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 53,38 tok/s en prime y 54,82 tok/s en JSON con INT8 y cinco propuestas; 30,25 y 33,85 tok/s respectivamente sin borrador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput (prime, thinking on) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-DSpark INT8 (este) | 35B totales / 3B activos | no disponible | 53,38 tok/s | Apache 2.0 | Hugging Face (blaj) |
| MiniCPM-V-4.7-35B-A3B-DSpark INT4 | 35B / 3B | no disponible | 48,66 tok/s | Apache 2.0 | Hugging Face (blaj) |
| MiniCPM-V-4.7-35B-A3B-DSpark FP16 | 35B / 3B | no disponible | 51,56 tok/s | Apache 2.0 | Hugging Face (blaj) |
| Sin borrador (objetivo INT4 solo) | 35B / 3B | no disponible | 30,25 tok/s | Apache 2.0 | Hugging Face (OpenVINO) |

La comparativa se limita a las variantes del mismo borrador y a la línea base sin decodificación especulativa, ya que no se dispone de datos de modelos alternativos de decodificación especulativa en la información proporcionada.

## Limitaciones y advertencias

- El exportador estándar no consume la cabeza de confianza del checkpoint original, lo que puede afectar al comportamiento óptimo del borrador.
- Los benchmarks publicados son *smoke tests* de throughput en texto; el autor indica explícitamente que no constituyen afirmaciones de calidad, paridad greedy ni inferencia de imagen.
- El modo *thinking off* produce tasas de aceptación y velocidades distintas (hasta 72,18 tok/s) pero cambia la respuesta, por lo que no es comparable en calidad.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al ser un componente de decodificación especulativa su uso productivo depende del modelo objetivo emparejado y de su propia licencia.
- El hardware validado es exclusivamente Intel Arc iGPU con OpenVINO GenAI nightly; no hay garantías de rendimiento en otras plataformas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación (2026-11-25) y el uso de una versión nightly de OpenVINO GenAI sugieren un ecosistema en evolución con posible inestabilidad de API.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int8-ov
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Variante INT4 del borrador: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov
- Variante FP16 del borrador: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-fp16-ov
- Objetivo INT4 oficial de OpenVINO: https://huggingface.co/OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov
