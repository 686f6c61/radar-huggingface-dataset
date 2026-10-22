# 0arch-io/kisoku-1.6b

## Resumen

Kisoku 1.6B es un modelo de lenguaje base (no instruido) de 1.600.749.056 parámetros, preentrenado desde cero —sin destilación ni inicialización a partir de otro checkpoint— por Joseph Rodriguez en 0ARCH sobre un TPU v4-32 del programa TPU Research Cloud de Google. Se distribuye con licencia Apache 2.0, únicamente en inglés, y el repositorio etiqueta su arquitectura como qwen3 dentro de la familia de transformers decoder-only.

El modelo vio aproximadamente 0,5 billones de tokens (524,4B contando las fases de contexto largo) y se extendió hasta 64K tokens, con YaRN x2 activado por defecto en el checkpoint publicado. Su interés está en la relación entre coste y resultado: iguala a Llama 3.2 1B en una suite de diez benchmarks (cinco victorias para cada uno) con unas 18 veces menos datos de entrenamiento, aunque queda por detrás de SmolLM2 1.7B y Qwen2.5 1.5B en la mayoría de las pruebas.

Es relevante como caso reproducible de entrenamiento desde cero a escala 1-2B con un solo acelerador y como base para fine-tuning: al ser un modelo base continúa texto y no sigue instrucciones de forma fiable. Para uso conversacional el autor publica un fine-tune separado en 0arch-io/kisoku-1.6b-chat (en fase de preview).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el repositorio la etiqueta como qwen3 (no se detalla la configuración de capas y cabezas en la información disponible) |
| Parametros totales | 1.600.749.056 (1,6B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 64K tokens (fase C, step 1299); el checkpoint se publica con YaRN x2 activado por defecto y se han evaluado ventanas de hasta 128K |
| Tipos de cuantizacion | Peso nativo en bfloat16; el detalle de cuantizaciones no está disponible, pero existen builds GGUF en 0arch-io/kisoku-1.6b-gguf |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

Modelo transformer decoder-only entrenado desde inicialización aleatoria, sin pérdida de destilación, sobre un TPU v4-32 de Google TPU Research Cloud. El preentrenamiento consumió unos 524,4B tokens en total, incluidas las fases de contexto largo, y el checkpoint final corresponde a la fase C (step 1299). La mezcla de datos combina corpus web y matemáticos filtrados (nvidia/Nemotron-CC-v2.1, nvidia/Nemotron-CC-Math-v1, openbmb/Ultra-FineWeb, HuggingFaceTB/finemath, open-web-math/open-web-math, IFM/MegaMath), código (bigcode/starcoderdata), datos de razonamiento (open-thoughts/OpenThoughts3-1.2M) y corpus de documento largo (deepmind/pg19, princeton-nlp/prolong-data-64K).

El autor advierte de que, pese a no usar destilación, aproximadamente un tercio o más de los documentos que leyó el modelo fueron escritos o reescritos por modelos mayores. La fase C emplea un 18% de documentos sintéticos (búsqueda tipo needle, cadenas de definiciones, recuento de palabras y posición de texto). El contexto largo se extiende con YaRN: el factor x2 mejora el rendimiento a 64K (44,7 sin YaRN frente a 56,7 con él) y cuesta alrededor de 1,3 puntos a 32K; el autor atribuye la necesidad de YaRN a que las fases de 64K fueron cortas (unas 4.160 pasos) y la octava de frecuencia superior quedó infraentrenada. No se aplicó RLHF ni DPO: es un modelo base, y el fine-tune conversacional se publica por separado.

## Capacidades

- Generación de texto por continuación: es un modelo base, sin plantilla de instrucciones ni alineamiento conversacional.
- Razonamiento de sentido común y conocimiento general moderados: 34,2 en MMLU 5-shot y 28,6 en BBH 3-shot en el checkpoint publicado.
- Matemáticas básicas: 15,0 en GSM8K 5-shot, muy por debajo de SmolLM2 1.7B (30,0).
- Generación de código: 14,6 pass@1 en HumanEval, por debajo de Llama 3.2 1B (18,9).
- Contexto largo: RULER medio de 76,1 a 4K, 56,7 a 64K y 43,2 a 128K con YaRN x2.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no soportado de forma nativa al ser un modelo base sin formato de instrucciones.
- Capacidades de agente y razonamiento multi-paso: no disponibles sin un fine-tune posterior.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Base para fine-tuning supervisado: punto de partida Apache 2.0 de 1,6B parámetros para adaptar a dominios concretos (legal, sanitario, atención al cliente) con un presupuesto de cómputo reducido, partiendo de un modelo que ya ha visto 524,4B tokens.
- Investigación sobre eficiencia de tokens: replicar o discutir la comparación con Llama 3.2 1B (mismo rendimiento agregado con unas 18 veces menos datos) usando el log de entrenamiento y los checkpoints intermedios publicados en ramas.
- Experimentos de contexto largo: al cubrir 64K tokens con YaRN x2 y ofrecer variantes sin YaRN, sirve para estudiar la degradación por longitud y el efecto de los factores de escala en ventanas de 32K a 128K.
- Generación de datos sintéticos y aumentación: al ser un modelo base, puede continuar documentos y plantillas para producir corpus de preentrenamiento o de instrucciones que luego se filtren y validen.
- Procesamiento de documentos largos en pipelines offline: resumen o extracción sobre textos de decenas de miles de tokens (informes, expedientes) siempre que se acepte el rendimiento limitado frente a Granite 4.0 1B o la familia Qwen3.5.
- Despliegue en hardware de gama de consumo para demos y prototipos: con pesos bfloat16 de unos 3,2 GB cabe en una única GPU de 8-24 GB y en CPU vía GGUF, lo que permite iterar sin clúster.
- Docencia y reproducción de entrenamientos: el proyecto documenta el proceso completo de un modelo from-scratch en un solo TPU v4-32, útil como material de referencia en cursos de LLM.

## Benchmarks y rendimiento

lm-evaluation-harness 0.4.13, bfloat16, una RTX 4090, mismo harness para todos los modelos. Porcentaje de acierto.

| Benchmark | Kisoku 1.6B (stage 3) | Kisoku 1.6B (publicado) | Llama 3.2 1B | SmolLM2 1.7B |
|---|---|---|---|---|
| GSM8K (5-shot) | 15,3 | 15,0 | 5,8 | 30,0 |
| MMLU (5-shot) | 33,0 | 34,2 | 31,3 | 50,0 |
| ARC-Easy (0-shot) | 65,4 | 64,4 | 61,8 | 73,5 |
| ARC-Challenge (0-shot) | 39,8 | 40,1 | 36,9 | 46,9 |
| BBH (3-shot) | 29,2 | 28,6 | 28,3 | 31,4 |
| PIQA (0-shot) | 73,9 | 73,0 | 74,9 | 77,9 |
| WinoGrande (0-shot) | 57,3 | 56,8 | 60,5 | 66,3 |
| HellaSwag (0-shot) | 57,7 | 57,8 | 64,2 | 71,3 |
| HumanEval (pass@1) | 13,4 | 14,6 | 18,9 | no reportado |
| TriviaQA (5-shot) | 22,8 | 23,1 | 40,7 | 49,7 |

El autor señala que las diferencias de BBH (0,9) y MMLU (1,7) frente a Llama 3.2 1B caen dentro de los intervalos de confianza del 95% del informe. HumanEval tiene 164 problemas, de modo que un problema equivale a 0,6 puntos. Generación con decodificación greedy y sin penalización de repetición; los baselines se ejecutaron con el mismo setup, por lo que sus cifras no coinciden con las de sus propias model cards. DROP se excluyó por un problema de carga del harness.

Contexto largo (RULER integrado en el harness, 13 tareas, media; 100 muestras por tarea a 4K y 8K, 50 por encima; greedy, sin penalización de repetición, 128 tokens nuevos, bfloat16; ejecuciones únicas sin intervalos de confianza):

| Modelo | 4K | 8K | 16K | 32K | 64K | 128K |
|---|---|---|---|---|---|---|
| Kisoku 1.6B, YaRN x2 (por defecto) | 76,1 | 66,2 | 64,2 | 58,8 | 56,7 | 43,2 |
| Kisoku 1.6B, sin YaRN | 76,2 | 66,7 | 64,6 | 60,1 | 44,7 | 4,7 |
| Llama 3.2 1B | 73,5 | 67,4 | 61,9 | 56,7 | 49,2 | 43,1 |
| Granite 4.0 1B (128K nativo) | 85,3 | 77,5 | 71,6 | 60,7 | 63,4 | 46,7 |
| Qwen3.5 0.8B | 86,7 | 83,0 | 79,2 | 74,2 | 68,5 | 64,2 |
| Qwen3.5 2B | 91,6 | 89,7 | 86,8 | 83,6 | 78,7 | 70,7 |

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan unos 3,2 GB (1.600.749.056 parámetros x 2 bytes); con overhead de runtime hay que contar aproximadamente 4-5 GB antes del KV cache. El desglose de capas y cabezas no está disponible, por lo que el KV cache a 64K no se puede calcular con precisión y puede dominar el consumo en ventanas largas.
- GPU recomendadas: cualquier GPU con 8 GB o más para bfloat16 en ventanas cortas; RTX 4090 (24 GB) y RTX PRO 6000 son las usadas por el autor para benchmarks y RULER. Para 64K-128K conviene 24 GB o más.
- Cabe en GPU de consumo: sí. En RTX 4090 sin problema; en tarjetas de 8 GB con cuantización GGUF de 4 bits (peso teórico en torno a 1 GB) es viable para contexto corto.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag text-generation-inference y endpoints_compatible) y llama.cpp/Ollama a través de los builds GGUF publicados en 0arch-io/kisoku-1.6b-gguf. El soporte de vLLM no se menciona en la información disponible.
- Latencia y throughput: no disponibles. Solo se documenta la configuración de evaluación (greedy, 128 tokens nuevos como máximo, bfloat16, ejecuciones individuales) y no se publican medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kisoku 1.6B | 1,600.749.056 | 64K (YaRN x2; evaluado a 128K) | Gana a Llama 3.2 1B en GSM8K, MMLU, ARC-Easy, ARC-Challenge y BBH; RULER 56,7 a 64K | Apache 2.0 | Pesos safetensors, GGUF y fine-tune chat |
| Llama 3.2 1B | 1,24B (declarado en la model card) | 128K (evaluado en RULER) | Mejor en PIQA, WinoGrande, HellaSwag, HumanEval y TriviaQA; RULER 49,2 a 64K | No disponible en la información | No disponible en la información |
| SmolLM2 1.7B | 1,7B | No disponible | Mejor en 8 de los 10 benchmarks comparados (MMLU 50,0; GSM8K 30,0) | No disponible en la información | No disponible en la información |
| Granite 4.0 1B | 1B | 128K nativo | RULER 63,4 a 64K y 46,7 a 128K, por encima de Kisoku en todas las longitudes | No disponible en la información | No disponible en la información |
| Qwen3.5 0.8B / 2B | 0,8B / 2B | Evaluados hasta 128K | RULER 68,5 y 78,7 a 64K; 64,2 y 70,7 a 128K, muy por encima de Kisoku | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- Es un modelo base: continúa texto y no sigue instrucciones de forma fiable. Para uso conversacional hay que pasar por el fine-tune 0arch-io/kisoku-1.6b-chat o entrenar uno propio.
- Solo inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Por detrás de SmolLM2 1.7B y Qwen2.5 1.5B en la mayoría de los benchmarks de la suite; el empate con Llama 3.2 1B es un resultado agregado (cinco victorias cada uno), no un ranking.
- Rendimiento débil en conocimiento factual (TriviaQA 23,1 frente a 40,7 de Llama 3.2 1B) y en matemáticas (GSM8K 15,0), lo que aumenta el riesgo de respuestas plausibles pero incorrectas en tareas de recuperación de hechos.
- Las cifras de RULER pueden estar infladas por familiaridad de formato: el 18% de la mezcla de la fase C son documentos sintéticos que se parecen a partes de la propia prueba, y no se ha ejecutado una suite de contexto largo reservada (held-out).
- Los resultados de contexto largo son ejecuciones únicas sin intervalos de confianza y repartidas entre dos GPUs distintas (RTX 4090 y RTX PRO 6000).
- Sin YaRN, el rendimiento a 128K se desploma (4,7), de modo que el contexto útil real depende de mantener la configuración de escala publicada.
- Parte de los datos de entrenamiento fueron escritos o reescritos por modelos mayores (en torno a un tercio o más de los documentos), lo que puede introducir sesgos y estilo heredados de esos modelos.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0arch-io/kisoku-1.6b
- Fine-tune conversacional: https://huggingface.co/0arch-io/kisoku-1.6b-chat
- Builds GGUF: https://huggingface.co/0arch-io/kisoku-1.6b-gguf
- Colección Kisoku 1.6B: https://huggingface.co/collections/0arch-io/kisoku-16b
- Repositorio GitHub: https://github.com/0arch-io/kisoku
- Directorio del release en GitHub: https://github.com/0arch-io/kisoku/tree/main/release/kisoku-1.6b
- Página del proyecto (log de entrenamiento, gráficas de benchmarks, instrucciones de ejecución): https://0arch.io/kisoku
- Línea de producto 0ARCH Core: https://0arch.io/core
- Web del autor: https://0arch.io
- Informe técnico: borrador 4 del 2026-10-07, referenciado en la model card; no se proporciona URL directa en la información disponible.
