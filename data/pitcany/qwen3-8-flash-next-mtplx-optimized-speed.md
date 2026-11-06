# pitcany/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed

## Resumen

Qwen3.8-Flash-Next-MTPLX-Optimized-Speed es un empaquetado cuantizado en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario pitcany (con enlaces en la model card a la cuenta Youssofal) para su ejecución nativa en Apple Silicon a través del runtime MTPLX. El modelo base es un Flash-Next de la generación Qwen4, con arquitectura híbrida GDN MoE, Qwen Sparse Attention y una memoria n-gram de 51.000 millones de parámetros; el pack conserva la torre de visión y el cabezal de multi-token prediction (MTP) nativo.

El problema que resuelve este empaquetado es la velocidad de decodificación en Mac: MTPLX implementa decodificación especulativa nativa mediante el cabezal MTP del propio modelo, con una regla de aceptación por ratio de probabilidades y remuestreo residual, de modo que la salida sigue la distribución del modelo a cualquier temperatura. Según la model card, esto produce una multiplicación de 1,7x frente a la decodificación autorregresiva simple en la ruta de servidor.

La variante "Optimized Speed" mantiene las proyecciones de Qwen Sparse Attention en 8 bits (frente a la variante "Bare Speed", que las degrada), lo que la convierte en la build recomendada para Macs con 128 GB o más de memoria unificada. El repo pesa 115,1 GB, incluye una tabla n-gram de 32 GB en un sidecar separado que se transmite desde SSD, y el modelo tiene 126.192.584.851 parámetros totales según safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GDN MoE con Qwen Sparse Attention y memoria n-gram; cabezal MTP nativo |
| Parametros totales | 126.192.584.851 |
| Parametros activos | no disponible (la model card cita "125B-A6B", es decir, ~6B activos, sin desglose oficial) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit con grupos de 64 pesos (expertos MoE y matrices densas); 8-bit en proyecciones QSA; 16-bit en convolución GDN, estado recurrente, normas, indexador QSA y cabezal MTP |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX); sidecar `ngram-table.safetensors` de 32 GB; runtime `mtplx_runtime.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de la generación Qwen4 que combina capas GDN (Gated Delta Network) con mezcla de expertos (MoE), atención dispersa Qwen Sparse Attention (QSA) y una memoria n-gram de 51.000 millones de parámetros integrada en el modelo. El pack cuantiza los expertos MoE y las matrices densas a 4 bits con grupos de 64 pesos, promueve las proyecciones QSA a 8 bits para preservar la precisión de la ruta de atención que gobierna contextos largos, y mantiene en 16 bits la convolución GDN, el estado recurrente, todas las normas, el indexador QSA y el cabezal MTP. La torre de visión se conserva en los pesos.

El entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no está documentado en la información disponible. La innovación técnica del empaquetado es la integración del cabezal MTP nativo en la ruta especulativa de MTPLX: los borradores se aceptan mediante una regla de ratio de probabilidades más remuestreo residual, lo que garantiza que la distribución de salida coincide con la del modelo a cualquier temperatura. La profundidad MTP es adaptativa con techo 3. La tabla n-gram se transmite desde SSD en cada Mac, de modo que solo los pesos permanecen residentes en memoria.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262.144 tokens.
- Razonamiento y decodificación con modo "thinking" (la model card menciona "thinking off" en sus benchmarks, lo que implica que existe un modo de pensamiento).
- Generación de código: los benchmarks incluyen tareas de OpenCode, prompts de código de 9k tokens y generación de proyectos completos (Flappy Bird con effort xhigh).
- Capacidades de visión: pipeline `image-text-to-text` y torre de visión preservada en los pesos.
- Decodificación especulativa multi-token (MTP) con profundidad adaptativa y techo 3.
- Integración con herramientas de desarrollo: los tags mencionan OpenCode y Claude Code.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explícita, aunque los benchmarks de turnos OpenCode de 109k y 200k tokens sugieren uso agéntico.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede integrarse en flujos tipo OpenCode o Claude Code para autocompletado y generación de parches, con 125,8 tok/s medidos en una petición de 1.301 tokens generados sobre un prompt de 18.539 tokens con 18.364 servidos desde caché.
- Conversaciones largas con recuperación de contexto: la ventana de 262.144 tokens y la restauración de una conversación de 96.760 tokens desde caché de sesión en 8 ms permiten mantener hilos de trabajo prolongados sin reenviar todo el historial.
- Análisis de documentos extensos: prompts de 65.502 tokens se procesan a 1.094 tok/s (MTPLX 2.12.0) y decodifican a 63,5 tok/s, adecuado para resumir o extraer información de informes técnicos completos.
- Desarrollo de proyectos completos por turnos: la model card cita generaciones de 45k a 56k tokens (Flappy Bird con effort xhigh) a 66,8 tok/s de media por turno, útil para tareas de generación de código extensa en una sola pasada.
- Prototipado de asistentes multimodales: al conservar la torre de visión y el pipeline image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con texto en un Mac local sin enviar datos a la nube.
- Investigación y evaluación de decodificación especulativa: el pack sirve como banco de pruebas reproducible para medir multiplicadores MTP, exactitud de la ruta rápida frente a la ruta simple y comportamiento del sampler oficial (temperatura 1.0, top-p 0.95, top-k 20).
- Despliegue de un LLM de 125B en hardware de escritorio: con 128 GB de memoria unificada en un MacBook Pro M4 Max/M5 Max o Mac Studio M3 Ultra/M4 Max/M5 Max, se ejecuta un modelo de esta escala sin GPU dedicada.

## Benchmarks y rendimiento

Datos medidos en MacBook Pro M5 Max con 128 GB, ventiladores a máximo, sampler oficial (temperatura 1.0, top-p 0.95, top-k 20):

| Ejecución | MTPLX 2.11.3 | MTPLX 2.12.0 |
|---|---:|---:|
| Tiempo al primer token, prompt de 4.061 tokens | 5,26 s | 2,88 s |
| Procesamiento de prompt, 4.061 tokens | 786 tok/s | 1.453 tok/s |
| Tiempo al primer token, prompt de 65.502 tokens | 85,5 s | 60,1 s |
| Procesamiento de prompt, 65.502 tokens | 768 tok/s | 1.094 tok/s |
| Decodificación tras prompt de 65.502 tokens | 56,1 tok/s | 63,5 tok/s |

Rendimiento de decodificación en MTPLX 2.11.3 (M5 Max, 128 GB):

| Ejecución | tok/s |
|---|---:|
| Petición OpenCode: 1.301 tokens generados, prompt de 18.539 tokens con caché, MTP depth 3 | 125,8 |
| Prompt de código de 9k tokens, 1.500 tokens generados, sampler con semilla, thinking off | 79,3 |
| Turno OpenCode de 109k tokens (media de dos ejecuciones) | 61,8 |
| Turno OpenCode de 200k tokens en caliente (media de dos ejecuciones) | 50,3 |
| Generaciones completas de 45k a 56k tokens (Flappy Bird, effort xhigh) | 66,8 |

Multiplicador especulativo: 73,5 tok/s con MTP frente a 43,8 tok/s en autorregresivo simple en una tarea de código, es decir, 1,7x. Los kernels de prompt añadidos después de esta ejecución leen un prompt de 65.529 tokens a 1.548 tok/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Descarga: 115,1 GB (incluye la tabla n-gram de 32 GB).
- Pesos residentes con la tabla n-gram en SSD: ~83 GB más working set.
- Pico durante el servicio: 87 GiB.
- Memoria unificada recomendada: 128 GB o más. En Macs de 96 GB se recomienda la variante Bare Speed, que tiene un pico de 78 GiB.
- Macs recomendados: MacBook Pro M4 Max y M5 Max con 128 GB; Mac Studio M3 Ultra, M4 Max y M5 Max con 128 GB o más. A partir de MTPLX 2.12.0 es la primera recomendación en Macs con 256 GB o más.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el pack es específico para Apple Silicon con MLX.
- Despliegue: runtime MTPLX (`pip install mtplx`, `mtplx serve --model ...`) o la app de Mac de mtplx.com. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: ver tabla de benchmarks; el tiempo al primer token con un prompt de 4.061 tokens es de 2,88 s en MTPLX 2.12.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTPLX-Optimized-Speed (este) | 126,2B totales, ~6B activos (según "125B-A6B") | 262.144 | qwen-community-1.0 | Hugging Face, MLX/MTPLX para Apple Silicon | 4-bit con QSA en 8-bit, pico de 87 GiB |
| Qwen3.8-Flash-Next-MTPLX-Bare-Speed | mismo modelo base | 262.144 | qwen-community-1.0 | Hugging Face, MLX/MTPLX | Cuantización más agresiva, pico de 78 GiB, apta para Macs de 96 GB |
| Qwen/Qwen3.8-Flash-Next (base) | 126,2B totales | 262.144 | qwen-community-1.0 | Hugging Face | Pesos sin cuantizar del autor original; sin empaquetado MTPLX |

No se dispone de datos de benchmarks estándar ni de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: requiere MLX y el runtime MTPLX; no es ejecutable en GPU NVIDIA ni en CPU convencional sin conversión adicional.
- Requisito de memoria elevado: 128 GB de memoria unificada recomendados; en Macs de 96 GB hay que usar la variante Bare Speed.
- La tabla n-gram de 32 GB se transmite desde SSD, lo que introduce dependencia del almacenamiento y de su ancho de banda.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos no documentados.
- El modelo base es una "preview" de la generación Qwen4, lo que implica posible inestabilidad o cambios de comportamiento respecto a versiones finales.
- Los benchmarks publicados son de velocidad en hardware concreto (M5 Max, 128 GB) y no de calidad; no hay datos de MMLU, HumanEval ni GSM8K.
- El pack está publicado por un tercero (pitcany), no por el equipo oficial de Qwen; la model card enlaza a la cuenta Youssofal para la variante Bare Speed, lo que conviene verificar antes de confiar en el empaquetado.

## Enlaces

- Hugging Face del pack: https://huggingface.co/pitcany/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Bare Speed: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed
- MTPLX: https://mtplx.com
- Notas de la versión 2.12.0: https://mtplx.com/releases/2.12.0/
- Notas de la versión 2.11.3: https://mtplx.com/releases/2.11.3/
- Benchmarks de MTPLX: https://mtplx.com/benchmarks/
- Guía para ejecutar Qwen 3.8 Flash Next en Mac: https://mtplx.com/models/qwen3.8-flash-next/
