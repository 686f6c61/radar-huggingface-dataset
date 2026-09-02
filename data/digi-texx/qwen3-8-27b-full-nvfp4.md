# digi-texx/Qwen3.8-27B-FULL-NVFP4

## Resumen

`digi-texx/Qwen3.8-27B-FULL-NVFP4` es una cuantización post-entrenamiento (PTQ) en formato NVFP4 (FP4, W4A4) del modelo `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, que a su vez es una versión cuantizada del Qwen3.8-27B original de Alibaba. La particularidad de este modelo es que cuantiza **todas** las capas lineales, incluido el `lm_head`, que el modelo base QUASAR dejaba en BF16. Esto reduce el checkpoint de aproximadamente 20 GB a 18 GB, con una reducción de 3,55× en el tensor de salida (de 2,54 GB a 0,715 GB).

El modelo subyacente es un transformer denso de 27 000 millones de parámetros con atención híbrida (lineal en 48 de 64 capas), torre de visión integrada, cabeza de decodificación especulativa MTP y una ventana de contexto nativa de 262 144 tokens, extensible a 1M. La cuantización se realizó con los métodos MR-GPTQ y H-Scale, calibrados sobre activaciones capturadas del propio backbone ya cuantizado, lo que garantiza que la distribución de entrada al `lm_head` coincide con la real en inferencia.

La relevancia de este modelo radica en que permite ejecutar un VLM de 27B con cuantización completa de 4 bits, reduciendo los requisitos de memoria y habilitando despliegue en hardware con soporte FP4 nativo (Blackwell, RTX 50xx). Está orientado a tareas agénticas y tool-calling, como refleja su pipeline de calibración basado en datasets de agentes y funciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (atencion lineal en 48/64 capas) con torre de vision y cabeza MTP (del base Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo (extensible a 1M segun el base) |
| Tipos de cuantizacion | NVFP4 (FP4, W4A4), grupo de 16, escalas de bloque E4M3 con escala global FP32 |
| Idiomas soportados | Ingles (segun la model card; el base soporta mas idiomas, pero esta version declara solo `en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base original, Qwen3.8-27B, es un transformer denso de 27B parametros con una arquitectura hibrida: 48 de sus 64 capas usan atencion lineal (probablemente basada en kernels tipo Gated Linear Attention o similar), mientras que las 16 restantes usan atencion full. Incluye una torre de vision para entrada de imagenes y una cabeza MTP (Multi-Token Prediction) que actua como draft head para decodificacion especulativa. La ventana de contexto nativa es de 262 144 tokens, extensible a 1M.

Este modelo concreto no se entrena desde cero, sino que es una cuantizacion post-entrenamiento del checkpoint `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, que ya habia cuantizado el cuerpo del transformer a NVFP4 pero dejaba el `lm_head` en BF16. `digi-texx` cuantiza ese tensor residual usando dos tecnicas combinadas:

- **MR-GPTQ** (arXiv:2509.23202): busqueda de escalas en el dominio de pesos (line search de 100 pasos minimizando `Σ|x−x̂|^2.4`) seguida de propagacion de error tipo GPTQ con Cholesky, usando una Hessiana `H = Σ xxᵀ` acumulada sobre las activaciones capturadas.
- **H-Scale** (arXiv:2608.28113): busqueda por grupo sobre K=16 escalas candidatas E4M3 validas en hardware (6 hacia arriba, 9 hacia abajo en la escalera E4M3), seleccionando la que minimiza `Σⱼ hⱼ (wⱼ − ŵⱼ)²` con `h = diag(XᵀX)`.

La calibracion se realizo con 65 536 tokens procedentes de 145 documentos (448 199 tokens totales renderizados) extraidos de 11 datasets publicos de agentes y tool-calling, con un pipeline de normalizacion, deduplicacion (MinHash/LSH a 0,85) y filtrado de calidad. El dataset de calibracion exacto esta publicado como `digi-texx/calib-agentic-sample-Qwen3.8-27B-QUASAR-NVFP4`.

El error relativo de reconstruccion del `lm_head` bajo condiciones W4A4 reales (pesos y activaciones cuantizados) es de 0,067380, un 15,18 % menor que el RTN sin calibracion (0,079436). El autor advierte que el 70 % del error total proviene de la cuantizacion de activaciones, no de los pesos.

## Capacidades

- Generacion de texto y razonamiento multi-step, heredadas del base Qwen3.8-27B.
- Comprension de imagenes (pipeline `image-text-to-text`), capaz de procesar entradas visuales junto con texto.
- Tool calling y function calling: el pipeline de calibracion se baso en datasets como `glaive-function-calling-v2`, `xlam-function-calling-60k`, `APIGen-MT-5k` y `ToolACE`, lo que indica que la cuantizacion preserva la capacidad de invocar herramientas.
- Capacidades agénticas: entrenado/calibrado con trayectorias de agentes (SWE-bench, OpenHands, Nemotron-Agentic), soporta tareas de software engineering y razonamiento agéntico de largo horizonte.
- Razonamiento configurable: el base Qwen3.8-27B permite activar o desactivar el modo "thinking" (razonamiento explicito) segun la tarea.
- Decodificacion especulativa: la cabeza MTP integrada permite acelerar la generacion.
- Multilingue: el base soporta varios idiomas, pero esta version declara solo ingles en su model card.

## Casos de uso

- **Despliegue de VLM en GPU con soporte FP4**: al cuantizar todas las capas lineales incluido `lm_head`, el modelo cabe en memorias mas reducidas y puede ejecutarse en hardware Blackwell (B200, RTX 5090) aprovechando el soporte nativo de FP4, reduciendo latencia y consumo.
- **Agentes de codigo con tool calling**: gracias a su calibracion sobre datasets de funciones y trayectorias SWE-bench, puede integrarse en pipelines de desarrollo donde el modelo invoca herramientas (busqueda, ejecucion de tests, edicion de archivos) de forma autonoma.
- **Asistente de programacion con contexto largo**: con 262K tokens de contexto, puede procesar repositorios completos o documentacion extensa para responder preguntas sobre codigo, refactorizar o generar parches.
- **Automatizacion de tareas de software engineering**: el modelo puede resolver issues de GitHub, generar pull requests y ejecutar flujos de integracion continua, apoyandose en su capacidad de razonamiento multi-step y su entrenamiento en trayectorias de agentes.
- **Chat conversacional con razonamiento**: para aplicaciones de atencion al cliente o asistentes virtuales que requieren respuestas razonadas y la posibilidad de activar el modo thinking para problemas complejos.
- **Analisis de documentos con imagenes**: al ser un VLM, puede procesar capturas de pantalla, diagramas o formularios escaneados junto con texto, util para automatizacion de oficinas o soporte tecnico visual.
- **Prototipado rapido en entornos con recursos limitados**: la cuantizacion completa a 4 bits permite ejecutar un modelo de 27B en una sola GPU de gama media (por ejemplo, RTX 4090 con 24 GB) si el software de inferencia soporta NVFP4, facilitando experimentacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada en la informacion disponible. El modelo base Qwen3.8-27B (en BF16) reporta, segun Alibaba, un rendimiento cercano a Claude Opus en tareas de codigo, pero no hay datos de evaluacion para el checkpoint NVFP4 completo.

Como unica metrica de calidad de cuantizacion, el autor publica el error relativo de reconstruccion del `lm_head` bajo condiciones W4A4 reales, comparado con otros metodos:

| Metodo | Error relativo | vs RTN |
|---|---|---|
| RTN (sin calibracion) | 0,079436 | — |
| 4over6 | 0,076002 | −4,32 % |
| RTN + H-Scale | 0,070564 | −11,17 % |
| GPTQ | 0,069411 | −12,62 % |
| **MR-GPTQ + H-Scale (este modelo)** | **0,067380** | **−15,18 %** |

Nota: el autor indica que con pesos BF16 exactos el error W4A4 es aun 0,055496, lo que implica que el 70 % del error total proviene de la cuantizacion de activaciones, no de los pesos.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa 18,7 GB en disco. En NVFP4, los pesos del modelo (27,78B parametros a 4 bits) ocupan aproximadamente 13,9 GB, mas las activaciones cuantizadas y los overheads de ejecucion. Para una ventana de contexto moderada (8K-32K tokens), se estima un uso de VRAM entre 16 y 20 GB, dependiendo de la implementacion.
- **GPUs recomendadas**: hardware con soporte nativo de FP4, como NVIDIA Blackwell (B200, RTX 5090) o equivalentes. En GPUs sin soporte FP4 (Ampere, Ada Lovelace), la inferencia requeriria descomprimir los pesos a BF16, anulando la ventaja de memoria.
- **GPU de consumo**: es plausible ejecutarlo en una RTX 5090 (32 GB) o RTX 4090 (24 GB) si el runtime soporta NVFP4 y se limita el contexto. No hay datos confirmados de que funcione en RTX 3090 (24 GB) con esta cuantizacion especifica, aunque el base BF16 se ha ejecutado en esa GPU con vLLM y 150K tokens de contexto.
- **Opciones de despliegue**: compatible con `transformers` (libreria declarada) y con vLLM (el base tiene recetas publicadas en `recipes.vllm.ai`). Tambien podria usarse con TGI si soporta NVFP4. No se menciona compatibilidad con llama.cpp u Ollama.
- **Latencia y throughput**: no disponible. Depende del hardware, la implementacion de kernels FP4 y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | lm_head | Checkpoint | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78B | 262K (ext. 1M) | BF16 | BF16 | ~55 GB (estimado) | Apache 2.0 (segun Qwen) |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | 27,78B | 262K | NVFP4 (cuerpo) | BF16 (2,54 GB) | ~20 GB | No disponible |
| **digi-texx/Qwen3.8-27B-FULL-NVFP4** | 27,78B | 262K | NVFP4 (todo) | NVFP4 (0,715 GB) | ~18 GB | No disponible |

La principal diferencia entre las dos versiones NVFP4 es la cuantizacion del `lm_head`, que en este modelo reduce el checkpoint en ~1,8 GB adicionales. Frente al original BF16, la ventaja es una reduccion de memoria de aproximadamente 3×, a costa de una posible degradacion de calidad por la cuantizacion W4A4.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica la licencia del modelo, lo que impide determinar si es utilizable comercialmente. Hay que contactar al autor o revisar el repositorio original de QUASAR-QAT.
- **Solo ingles declarado**: aunque el base Qwen3.8-27B es multilingue, esta version solo declara soporte para ingles. El uso en otros idiomas puede degradar la calidad.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contexto largo.
- **Degradacion por cuantizacion**: la cuantizacion W4A4 introduce un error de reconstruccion medido de 0,067380 en el `lm_head`, y el autor advierte que el 70 % del error total proviene de la cuantizacion de activaciones, que no se puede mitigar desde el lado de los pesos. Esto puede afectar a tareas de alta precision como matematicas o generacion de codigo exacto.
- **Dependencia de hardware FP4**: sin soporte nativo de FP4, el modelo no ofrece ventajas y puede requerir descompresion, anulando el proposito de la cuantizacion.
- **Sin benchmarks publicados**: no hay evaluaciones independientes de esta version cuantizada en tareas estandar (MMLU, HumanEval, GSM8K), por lo que el impacto real en calidad no esta cuantificado.
- **Calibracion limitada**: la calibracion se realizo con solo 65 536 tokens, lo que puede no cubrir todos los patrones de uso del `lm_head` en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/digi-texx/Qwen3.8-27B-FULL-NVFP4
- Modelo base cuantizado (QUASAR-QAT): https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper MR-GPTQ: https://arxiv.org/abs/2509.23202
- Paper H-Scale: https://arxiv.org/abs/2608.28113
- Dataset de calibracion (muestra): https://huggingface.co/datasets/digi-texx/calib-agentic-sample-Qwen3.8-27B-QUASAR-NVFP4
- Dataset de calibracion (curado): https://huggingface.co/datasets/digi-texx/calib-agentic-curated
- Dataset de calibracion (normalizado): https://huggingface.co/datasets/digi-texx/calib-agentic-normalized
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia de ejecucion en RTX 3090: https://github.com/syv-ai/qwen38-27b-rtx3090
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
- Analisis comparativo con Claude Opus: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
