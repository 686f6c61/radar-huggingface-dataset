# simaai/Qwen3-0.6B-Autoround-Safetensors_a16w4_return_logits

## Resumen

Qwen3-0.6B-Autoround-Safetensors_a16w4_return_logits es una compilación del modelo Qwen/Qwen3-0.6B (0,6 mil millones de parámetros, arquitectura transformer densa) realizada por SiMa.ai para su plataforma de aceleración hardware Modalix. No se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto precompilado y cuantizado con el objetivo específico de ejecutar benchmarks de precisión (accuracy) sobre el backend Modalix sin necesidad de recompilar el modelo fuente.

La particularidad técnica del artefacto es doble: por un lado, aplica cuantización A16W4 (activaciones en BF16, pesos en INT4) mediante el algoritmo AutoRound; por otro, se ha compilado con el flag `--return_logits`, que expone los logits de salida en lugar de únicamente el texto generado, requisito imprescindible para calcular métricas de evaluación como `acc_norm` o `bits_per_byte` sobre tareas tipo HellaSwag, PIQA o Wikitext.

Es relevante para desarrolladores que trabajan con el stack de inferencia de SiMa.ai (runtime Neat, CLI LLiMa) y necesitan validar la fidelidad numérica de sus despliegues en hardware edge/acelerado frente a una referencia en Hugging Face. No está pensado como modelo de generación de texto en producción: la propia model card indica que para despliegues estándar debe usarse el modelo correspondiente de la colección de LLMs de SiMa.ai sin el flag de retorno de logits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), heredada de Qwen/Qwen3-0.6B |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (máximo indicado en la model card) |
| Tipos de cuantizacion | A16W4 (activaciones BF16, pesos INT4) con AutoRound |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (artefacto compilado para Modalix; incluye directorios `devkit/` y `elf_files/`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3 desarrollada por Alibaba. La model card de este artefacto no aporta detalles sobre el corpus de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo fuente original, no reproducida aquí.

La innovación técnica de este repositorio no reside en el entrenamiento sino en el pipeline de despliegue: la cuantización A16W4 con AutoRound (una técnica de cuantización post-entrenamiento consciente de la importancia de los pesos) y la compilación con retorno de logits para el backend Modalix de SiMa.ai. El artefacto incluye los binarios compilados (`elf_files/`) y el kit de desarrollo (`devkit/`) necesarios para que el runtime Neat/LLiMa ejecute la inferencia en el dispositivo. El tamaño del repositorio (1,2 GB) es coherente con pesos INT4 de un modelo de 0,6B más los artefactos de compilación.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen3-0.6B.
- Retorno de logits de salida (flag `--return_logits`), lo que permite calcular métricas de verosimilitud y precisión sobre datasets de evaluación.
- Ejecución de benchmarks de accuracy sobre el backend Modalix: HellaSwag, PIQA, TriviaQA, Wikitext y Winogrande, según la configuración documentada.
- Comparación directa contra el backend de Hugging Face mediante la CLI `llima-benchmark`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de este artefacto; deben asumirse las del modelo base Qwen3-0.6B, no verificadas aquí.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Validación de fidelidad numérica en hardware Modalix: ejecutar `llima-benchmark accuracy` contra este artefacto y contra el modelo fuente en Hugging Face para cuantificar la degradación introducida por la cuantización A16W4 en tareas como HellaSwag o PIQA.
- Integración en pipelines de CI/CD de SiMa.ai: usar el modelo como referencia fija en pruebas automatizadas que detecten regresiones de precisión tras actualizaciones del runtime Neat o del compilador.
- Comparación de backends: medir la diferencia absoluta entre los valores del backend Modalix y los del backend HF sobre el mismo conjunto de tareas y tamaños de muestra (por ejemplo, 10 042 ejemplos de HellaSwag o 1 838 de PIQA).
- Evaluación de perplejidad en dispositivos edge: calcular `bits_per_byte` y `word_perplexity` sobre Wikitext 2.0 para caracterizar la calidad del modelo cuantizado en el hardware objetivo.
- Desarrollo de tooling interno: servir como artefacto de referencia para ingenieros que construyan scripts de benchmarking propios sobre la CLI LLiMa y necesiten un modelo pequeño con logits expuestos.
- Docencia y experimentación con cuantización: estudiar el efecto de AutoRound A16W4 en un modelo de 0,6B con contexto de 4096 tokens, comparando métricas de precisión y perplejidad frente al modelo en precisión completa.

## Benchmarks y rendimiento

Resultados publicados por SiMa.ai en la model card para el backend Modalix (la columna de referencia HF aparece vacía en la información disponible):

| Tarea | Version | n-shot | Metrica | Direccion | Modalix | StdErr | HF | Abs. diff |
|---|---|---:|---|---|---:|---:|---|---:|
| hellaswag | 1.0 | 0 | acc | higher | 0,3522 | 0,0048 | no disponible | no disponible |
| hellaswag | 1.0 | 0 | acc_norm | higher | 0,4388 | 0,0050 | no disponible | no disponible |
| piqa | 1.0 | 0 | acc | higher | 0,6572 | 0,0111 | no disponible | no disponible |
| piqa | 1.0 | 0 | acc_norm | higher | 0,6474 | 0,0111 | no disponible | no disponible |
| triviaqa | 3.0 | 0 | exact_match | higher | 0,0000 | 0,0000 | no disponible | no disponible |
| wikitext | 2.0 | 0 | bits_per_byte | lower | 0,9651 | N/A | no disponible | no disponible |
| wikitext | 2.0 | 0 | byte_perplexity | lower | 1,9522 | N/A | no disponible | no disponible |
| wikitext | 2.0 | 0 | word_perplexity | lower | 35,7776 | N/A | no disponible | no disponible |
| winogrande | 1.0 | 0 | acc | higher | 0,5493 | 0,0140 | no disponible | no disponible |

Tamaños de muestra empleados: HellaSwag 10 042, PIQA 1 838, TriviaQA 17 944, Wikitext 62, Winogrande 1 267. No se han publicado en la información disponible los valores de referencia del backend Hugging Face ni la diferencia absoluta, por lo que no es posible cuantificar aquí la degradación por cuantización.

## Requisitos de hardware

- El artefacto está compilado exclusivamente para la plataforma SiMa.ai Modalix; no es ejecutable directamente en GPU convencionales ni en CPU con llama.cpp, vLLM u Ollama.
- Requiere un dispositivo Modalix físico con el runtime Neat instalado (la librería LLiMa forma parte de Neat) y la CLI `llima` disponible.
- Requiere la CLI `llima-benchmark` instalada en la máquina anfitriona que lanza el benchmark.
- Los modelos se gestionan por defecto en `/media/nvme/llima/models` (configurable mediante `LLIMA_MODELS_PATH`).
- Tamaño del repositorio: 1,2 GB, lo que condiciona el espacio necesario en el almacenamiento del dispositivo.
- VRAM, GPU recomendadas, latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simaai/Qwen3-0.6B-Autoround-Safetensors_a16w4_return_logits | 0,6B | 4096 | A16W4 (AutoRound) | Apache 2.0 | Solo plataforma SiMa.ai Modalix |
| Qwen/Qwen3-0.6B (modelo fuente) | 0,6B | no disponible en esta ficha | BF16 (original) | Apache 2.0 | Hugging Face, ejecutable en GPU/CPU |
| Otros artefactos SiMa.ai de la colección de LLMs | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | Plataforma Modalix |

La comparación directa con alternativas de terceros no está disponible en la información proporcionada; el único comparable documentado es el modelo fuente Qwen3-0.6B, del que este artefacto deriva y respecto al cual difiere únicamente en cuantización y compilación.

## Limitaciones y advertencias

- La cuantización A16W4 puede introducir desviaciones menores respecto al modelo en precisión completa; la magnitud exacta no se publica en la información disponible.
- El flag `--return_logits` está pensado para flujos de benchmarking de precisión; la model card recomienda explícitamente usar otro modelo de la colección SiMa.ai para despliegues de generación de texto estándar.
- El artefacto solo funciona en hardware Modalix con el runtime Neat; no es portable a otros backends sin recompilación.
- El resultado de TriviaQA (exact_match = 0,0000) sugiere que el modelo no produce respuestas exactas en ese formato bajo esta configuración, lo que limita su uso para tareas de QA factual sin ajuste.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales de licencia más allá de Apache 2.0 en la información proporcionada.
- Idiomas soportados: no disponible; debe consultarse la model card del modelo base Qwen3-0.6B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción pública mínima y ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/simaai/Qwen3-0.6B-Autoround-Safetensors_a16w4_return_logits
- Modelo fuente: https://huggingface.co/Qwen/Qwen3-0.6B
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Benchmarking de precisión MOLE: https://developer.sima.ai/software/genai-llima/mole
