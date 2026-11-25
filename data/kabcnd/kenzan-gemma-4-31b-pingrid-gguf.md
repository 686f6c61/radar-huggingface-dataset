# kabcnd/Kenzan-Gemma-4-31B-PinGrid-GGUF

## Resumen

Kenzan-Gemma-4-31B-PinGrid es una cuantización GGUF de precisión mixta del modelo denso `google/gemma-4-31B-it`, publicada por el usuario independiente kabcnd bajo el paraguas de su serie "Kenzan". El objetivo declarado es ejecutar un modelo denso de 31 000 millones de parámetros dentro de los 16 GB de memoria unificada de un Apple Mac mini con chip M6, usando `llama.cpp` con backend Metal y sin recurrir a APIs en la nube. El paquete se completa con un drafter de decodificación especulativa de 237 MiB basado en Multi-Token Prediction (MTP) con KV compartida.

La propuesta técnica combina tres piezas: un fichero principal de pesos cuantizados en precisión mixta ("PinGrid") de 9,96 GiB, un cabezal auxiliar `gemma-4-31B-it-assistant.Q3_K_head.gguf` de 237 MiB que actúa como modelo borrador, y una matriz de importancia (`imatrix`) de 26,3 MiB para calibración. Según la model card, el resultado es un rendimiento de decodificación de aproximadamente 20,7 tok/s en prosa técnica y picos de hasta 24 tok/s, con una tasa de aceptación del borrador del 68,2 % y una velocidad media de 32,73 tok/s en su suite de 20 tareas.

Es relevante ahora porque demuestra que es viable comprimir un modelo denso de 31B (pesos F16 de unos 57,2 GiB) hasta menos de 10 GiB con una retención estimada del 92-96 % de "inteligencia" respecto a F16, según el autor, y desplegarlo en hardware de consumo con memoria unificada. No obstante, conviene tratar las cifras de la model card como afirmaciones del autor, no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de google/gemma-4-31B-it) con decodificación especulativa MTP y KV compartida |
| Parametros totales | 31B (modelo base); el repo declara 469.518.852 parámetros en safetensors (dato no coherente con el tamaño del modelo, se reproduce tal cual) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 24 576 tokens en la configuración recomendada (`-c 24576`); el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | Precisión mixta "PinGrid" (target de 9,96 GiB); cabezal drafter en Q3_K, Q4_0 y Q6_K; caché KV en q4_0 |
| Idiomas soportados | en, ru (declarados en la model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. Se apoya en `google/gemma-4-31B-it` como modelo objetivo y en `google/gemma-4-31B-it-assistant` como fuente del cabezal drafter. La arquitectura subyacente es un transformer denso de 31B; la información disponible no detalla número de capas, dimensión oculta, cabezas de atención ni composición del dataset de preentrenamiento del modelo base. Tampoco se documentan fases de RLHF o DPO específicas más allá de lo que herede del modelo instruct original de Google.

La innovación técnica del paquete Kenzan reside en la cuantización de precisión mixta "PinGrid", calibrada con una importance matrix (`gemma4_31b_imatrix.gguf`) que asigna distintos niveles de bits por tensor según su sensibilidad. Sobre esa base se añade un esquema de decodificación especulativa con dos estrategias combinadas (`ngram-mod,draft-mtp`): un borrador por n-gramas y un borrador MTP de 237 MiB que comparte la caché KV con el modelo objetivo, reduciendo el coste de memoria del drafter a un valor casi despreciable frente a los 9,96 GiB del target. La configuración de ejecución recomendada usa FlashAttention (`-fa on`), caché KV cuantizada en q4_0 y `--cache-ram 0` para mantener la memoria cableada de Metal en torno a 12,1 GB, por debajo del límite `iogpu.wired_limit_mb` de macOS fijado en 15,1 GB.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo instruct de Gemma 4.
- Razonamiento matemático: la model card reporta 5/5 en tareas de GSM8K, combinatoria y aritmética modular (por ejemplo, `3^100 mod 7`).
- Razonamiento lógico y deductivo: 4/4 en acertijos de caballeros y escuderos, ordenaciones, silogismos y variantes del problema de Monty Hall.
- Generación de código Python verificada mediante ejecución real y aserciones unitarias (merge de intervalos, detección de ciclos en DAG, k-ésimo menor, caché LRU en O(1)).
- Conocimiento STEM y estilo MMLU-Pro: FlashAttention, ley de Amdahl, KL inversa y eficiencia de Carnot, según las pruebas del autor.
- Razonamiento técnico en cirílico y adherencia estricta a esquemas JSON.
- Decodificación especulativa multi-token (MTP) con KV compartida, que acelera la inferencia en hardware Apple Silicon.
- Soporte de plantilla Jinja y formato de razonamiento automático (`--jinja --reasoning-format auto`).
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Asistencia de razonamiento matemático y lógico en local: el modelo resuelve problemas de combinatoria, aritmética modular y acertijos deductivos a 25-37 tok/s en un Mac mini M6 de 16 GB, lo que permite usarlo como tutor o validador de soluciones sin enviar datos a la nube.
- Generación de código Python con verificación: dado que la model card reporta pruebas con `exec` y `assert` sobre funciones como merge de intervalos o caché LRU, encaja en flujos de autocompletado y generación de utilidades con tests unitarios asociados.
- Procesamiento de documentación técnica en ruso e inglés: el soporte declarado de ambos idiomas y las pruebas de razonamiento en cirílico lo hacen adecuado para resumir o traducir documentación de ingeniería en entornos bilingües.
- Extracción de datos estructurados: la adherencia a esquemas JSON estrictos permite usarlo para convertir texto libre en registros JSON validables dentro de pipelines de ingestión.
- Prototipado y experimentación en Apple Silicon: al caber en 16 GB de memoria unificada, sirve para desarrollar y probar aplicaciones de IA generativa en un portátil o mini de consumo antes de escalar a infraestructura mayor.
- Educación y análisis STEM: con conocimiento demostrado de conceptos como la ley de Amdahl o la eficiencia de Carnot, puede emplearse para explicar conceptos de ingeniería y física a estudiantes con retroalimentación local y privada.
- Evaluación de técnicas de cuantización: la combinación de imatrix, precisión mixta y decodificación especulativa lo convierte en un banco de pruebas para investigadores que estudian el compromiso entre compresión y calidad.

## Benchmarks y rendimiento

Los datos disponibles proceden exclusivamente de la model card del autor, medidos en un Mac mini M6 con 16 GB de memoria unificada y backend Metal. No se han verificado de forma independiente.

| Prueba | Resultado reportado | Velocidad |
|---|---|---|
| Razonamiento matemático | 5/5 (100 %) | 26,6-37,6 tok/s |
| Lógica y deducción | 4/4 (100 %) | 25,3-35,2 tok/s |
| Código Python (con exec + assert) | 4/4 (100 %) | 26,0-29,9 tok/s |
| STEM / MMLU-Pro | 4/4 (100 %) | 23,3-33,2 tok/s |
| Cirílico y JSON estricto | 3/3 (100 %) | 19,2-33,5 tok/s |
| Suite completa (20 tareas) | 20/20 (100 %) | 32,73 tok/s de media; 68,2 % de aceptación del borrador |

| Configuración de decodificación especulativa | Drafter | RAM cableada | Prosa técnica (tg) | Pico (tg_3s) | Aceleración |
|---|---|---:|---:|---:|---:|
| Sin especulación (baseline) | — | 12,22 GB | 11,26 tok/s | 11,35 tok/s | 1,00× |
| draft-mtp + Q6_K | 337 MiB | 12,83 GB | 20,17 tok/s | 23,23 tok/s | 2,04× |
| draft-mtp + Q4_0 | 271 MiB | 12,14 GB | 19,87 tok/s | 22,63 tok/s | 2,05× |
| ngram-mod,draft-mtp + Q3_K | 237 MiB | ~12,1 GB | 20,72 tok/s | 23,97 tok/s | 2,06× |

El autor estima una retención del 92-96 % de la inteligencia del modelo F16 completo, con compresión de pesos de 6,0× (57,2 GiB a 9,53 GiB). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K completos) en la información disponible; las cifras anteriores corresponden a una suite propia de 20 tareas.

## Requisitos de hardware

- VRAM/memoria unificada: el fichero principal ocupa 9,96 GiB; con caché KV en q4_0 y contexto de 24 576 tokens, la memoria cableada de Metal se sitúa en torno a 12,1 GB. Con el drafter Q3_K se añaden 237 MiB.
- Hardware de referencia: Apple Mac mini M6 con 16 GB de memoria unificada y backend Metal de `llama.cpp`. El autor menciona también GPUs de consumo como objetivo del formato GGUF, pero no aporta mediciones en ellas.
- GPU recomendadas: no se especifican modelos concretos de NVIDIA o AMD en la información disponible; el diseño está optimizado para Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos con al menos 12-13 GB de memoria disponible (por ejemplo, tarjetas con 16 GB de VRAM) usando `llama.cpp`; no se aportan cifras de rendimiento para esas plataformas.
- Despliegue: `llama.cpp` / `llama-server` con Metal. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible, aunque al ser GGUF podría cargarse en runtimes compatibles sin garantías del autor.
- Latencia y throughput: 11,26 tok/s sin especulación y 20,72 tok/s de media en prosa técnica con `ngram-mod,draft-mtp`; picos de 23,97 tok/s y media de 32,73 tok/s en la suite de 20 tareas, con 68,2 % de aceptación del borrador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / licencia | Disponibilidad |
|---|---|---|---|---|
| Kenzan-Gemma-4-31B-PinGrid | 31B denso | 24 576 (config. recomendada) | GGUF / gemma | Hugging Face, 512 descargas |
| google/gemma-4-31B-it (F16) | 31B denso | no disponible en la información | safetensors / gemma | Hugging Face (modelo base) |
| google/gemma-4-31B-it-assistant | no disponible | no disponible | safetensors / gemma | Hugging Face (origen del drafter) |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | Hugging Face (citado como inspiración) |

La comparación cuantitativa con alternativas de la misma categoría (otros modelos densos de 30B en GGUF) no está disponible en la información proporcionada. El propio autor compara su cuantización contra el F16 del modelo base, reportando paridad en su suite de 20 tareas y una retención estimada del 92-96 %.

## Limitaciones y advertencias

- Los benchmarks y velocidades son afirmaciones del autor, medidas en una única configuración de hardware (Mac mini M6, 16 GB) y con una suite propia de 20 tareas; no han sido verificados de forma independiente ni incluyen benchmarks estándar completos.
- El dato de "parámetros totales (safetensors): 469.518.852" del repositorio no es coherente con un modelo de 31B y debe interpretarse con cautela; probablemente refleje solo una parte de los tensores o un error de metadatos.
- La cuantización de precisión mixta agresiva puede degradar el rendimiento en tareas de cola larga, recuperación de conocimiento factual y razonamiento extendido, tal como reconoce el propio autor al hablar de retención del 92-96 %.
- Riesgo de alucinación inherente al modelo base; no se documentan medidas específicas de mitigación.
- Idiomas declarados limitados a inglés y ruso; el rendimiento en castellano no está documentado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de un despliegue en producción.
- El contexto recomendado de 24 576 tokens es una elección de configuración para caber en 16 GB, no necesariamente el máximo nativo del modelo.
- No se documenta soporte de tool calling, visión ni audio, lo que limita su uso en pipelines de agentes que requieran esas capacidades.
- El proyecto depende de un único autor independiente y de la evolución de `llama.cpp`; la reproducibilidad a largo plazo no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabcnd/Kenzan-Gemma-4-31B-PinGrid-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (drafter): https://huggingface.co/google/gemma-4-31B-it-assistant
- Inspiración citada (Prism ML): https://huggingface.co/prism-ml
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcpc
