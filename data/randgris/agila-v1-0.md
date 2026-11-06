# Randgris/Agila-v1.0

## Resumen

Agila-v1.0 es un modelo de generación de texto en formato decoder-only entrenado desde cero (sin pesos preentrenados de terceros ni fine-tuning de otro modelo) por el autor Randgris, orientado a Tagalog e inglés. Con apenas 2.923.200 parámetros y un vocabulario BPE de 6.000 tokens, su rasgo distintivo no es la escala sino el despliegue: los pesos cuantizados a int8 ocupan 2,98 MB y se ejecutan directamente en el navegador mediante WebGPU, con kernels WGSL propios y sin depender de librerías como WebLLM ni de APIs alojadas.

El proyecto resuelve el problema de ejecutar un asistente conversacional bilingüe (68,9 % Tagalog / 30 % inglés en el corpus) completamente en el cliente, con caché offline vía Cache Storage y fallback a CPU. El entrenamiento se realizó en solo 2 vCPU: 2.800 pasos de preentrenamiento, 500 de instruction tuning y 1.600 de conversational tuning.

Es relevante como demostración de ingeniería educativa y de IA local en el navegador, no como modelo de uso general: su contexto es de 128 tokens y el propio autor advierte que memoriza más de lo que generaliza. Incluye además un modelo de difusión complementario (agila-image) para generar imágenes de 32×32 píxeles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-RMSNorm, RoPE half-split, MLP con GELU, embeddings atados, sin sesgos |
| Parametros totales | 2.923.200 |
| Parametros activos | No aplica (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | int8 por fila simétrica con escalas f32 (se dequantiza a f32 al cargar, ~12 MB en GPU) |
| Idiomas soportados | Tagalog (tl) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | weights.bin propio (int8, 34 tensores); el repositorio incluye tags GGUF y WebGPU, aunque el formato de inferencia principal es el binario propio para navegador |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de dimensiones mínimas: d_model 192, 4 capas, 6 cabezas de atención (head_dim 32) y vocabulario byte-level BPE de 6.000 tokens entrenado desde cero. La cuantización final es int8 por fila simétrica con escalas en f32, lo que reduce los pesos a 2,98 MB en disco. La inferencia en navegador usa kernels WGSL propios (matvec, rmsnorm, rope, softmax, weighted, gelu, add) con KV cache en GPU y readback de logits para el muestreo, con fallback automático a CPU si los kernels no pasan el test de paridad.

El entrenamiento se hizo en dos vCPU con 3,8 GB de RAM y sin GPU, en unas 37 minutos totales. El corpus de preentrenamiento combina Wikipedia en Tagalog (6,01 M de caracteres, 1.983 artículos) e inglés (2,70 M de caracteres, 461 artículos), lo que da un 68,9 % de Tagalog; en total 13.293 documentos y 2.325.916 tokens. Después se aplicó instruction tuning (500 pasos sobre QA de Wikipedia con pérdida enmascarada) y conversational tuning (1.600 pasos sobre 4.200 diálogos sintéticos repetidos ×3 más 385 hechos). El propio autor señala honestamente que la baja pérdida de validación final (0,036) refleja memorización del corpus de diálogos, no generalización.

Como extra, el proyecto incluye agila-image, un modelo de difusión condicional estilo DiT de 1.134.976 parámetros (parches 8×8 → 16 tokens, 4 bloques, d 128, condicionamiento por FiLM/adaLN, 100 timesteps con parametrización x0 y muestreo DDIM) que genera imágenes de 32×32 sobre 8 conceptos.

## Capacidades

- Generación de texto conversacional bilingüe en Tagalog e inglés, dentro de los temas cubiertos por su corpus de entrenamiento.
- Respuestas a preguntas frecuentes sobre sí mismo, WebGPU, funcionamiento offline y temas de Wikipedia en Tagalog.
- Búsqueda integrada en Wikipedia y DuckDuckGo (con resultados cacheados para uso offline) y un "Lite mode" para preguntas factuales, que mitigan la alucinación.
- Ejecución 100 % local en el navegador mediante WebGPU, con fallback a CPU y verificación automática de paridad de kernels antes de usar la GPU.
- Funcionamiento offline completo tras la primera descarga de pesos (Cache Storage, precache PWA de 384 KiB).
- Generación de imágenes 32×32 mediante el modelo de difusión agila-image, con tres niveles de calidad según hardware (24/16/8 pasos).
- No hay soporte documentado de tool calling formal, agentes multi-paso, razonamiento matemático avanzado ni código.

## Casos de uso

- Demostración educativa de IA en el navegador: ideal para explicar cómo funciona un transformer de principio a fin (tokenizador, entrenamiento, cuantización, kernels GPU) con un modelo lo bastante pequeño para inspeccionarlo por completo.
- Asistente conversacional offline en Tagalog: tras la primera carga, funciona sin conexión gracias a Cache Storage, útil en contextos con conectividad limitada donde se necesite un chatbot básico en tagalo.
- Prototipado de inferencia WebGPU propia: el motor de inferencia en `src/lib/agila/gpu.ts` con kernels WGSL sirve como referencia para desarrolladores que quieran implementar inferencia GPU en navegador sin depender de WebLLM u ONNX Runtime Web.
- Chatbot embebido en webs ligeras: con 2,98 MB de pesos y precache PWA de 384 KiB, puede integrarse en una PWA sin impacto significativo en la carga.
- Experimentación con cuantización int8: el pipeline de cuantización por fila con escalas f32 y la dequantización en JS son un ejemplo práctico y verificable.
- Generación de imágenes pixel-art en cliente: agila-image permite generar imágenes 32×32 de conceptos (atardecer, montaña, mar, ciudad, etc.) sin servidor ni Stable Diffusion.
- Banco de pruebas de paridad CPU/GPU: el proyecto incluye datos de paridad (max |Δ| 0,0587, 2,28 % relativo) y autotest previo al uso de kernels WGSL, útil como patrón para validar despliegues WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados son métricas de entrenamiento propias:

| Etapa | Pasos | Datos | Val loss | Perplexity |
|---|---|---|---|---|
| Base LM | 2.800 | 5.734.400 tokens | 4,369 | 79,0 |
| Instruction tuning | 500 | QA de Wikipedia, pérdida enmascarada | 1,305 | 3,7 |
| Conversational tuning | 1.600 | 4.200 diálogos (×3) + 385 hechos | 0,036 | 1,0 |

Verificación automática de calidad de diálogo: 12/12 respuestas limpias (0 vacías, 0 bucles de repetición, 0 respuestas demasiado cortas). Para agila-image: ratio de estructura 0,44–0,94 por concepto y paridad CPU vs PyTorch de 2,28 % relativo. El propio autor aclara que la perplexity de 1,0 en la última etapa indica memorización, no generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12 MB en f32 tras dequantizar los 2,98 MB de pesos int8; cualquier GPU con WebGPU es más que suficiente.
- GPU recomendadas: cualquier GPU compatible con WebGPU (integradas incluidas). No se requieren A100, H100 ni RTX de gama alta; el entrenamiento completo se hizo en 2 vCPU con 3,8 GB de RAM.
- Consumer GPUs: cabe con holgura en cualquier GPU doméstica e incluso en GPUs móviles (el proyecto define tiers: High para GPU de escritorio, Standard para GPU móvil, Draft para CPU).
- Opciones de despliegue: navegador con WebGPU (kernels WGSL propios) con fallback a CPU en JS; no requiere vLLM, llama.cpp, Ollama ni TGI, y no hay API alojada.
- Latencia y throughput: no disponibles; dada la escala (2,9 M de parámetros, contexto 128), la inferencia token a token es trivial para cualquier hardware moderno, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Agila-v1.0 | 2,9 M | 128 tokens | tl, en | Apache-2.0 | WebGPU nativo en navegador, pesos propios int8 |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 tokens | en (multilingüe parcial) | Apache-2.0 | GGUF/llama.cpp, WebLLM, vLLM |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | multilingüe (29+) | Apache-2.0 (algunas variantes Qwen Research) | transformers, vLLM, llama.cpp, ONNX |
| SmolLM2-135M-Instruct | 135 M | 2.048 tokens | en | Apache-2.0 | transformers, llama.cpp, ONNX |

Agila-v1.0 es órdenes de magnitud más pequeño y limitado que cualquiera de estas alternativas en capacidad lingüística y contexto, pero es el único entrenado específicamente para Tagalog desde cero y con motor de inferencia WebGPU propio sin dependencias externas. Para producción conversacional real, SmolLM2-135M o Qwen2.5-0.5B ofrecen mucho más capacidad general; Agila-v1.0 compite en sencillez de despliegue y especialización en tagalo.

## Limitaciones y advertencias

- Memorización frente a generalización: el propio autor reconoce que la baja val loss final (0,036) proviene de un corpus de diálogos pequeño y con plantillas repetitivas; ante preguntas fuera del corpus, el modelo probablemente alucinará.
- Contexto extremadamente corto: 128 tokens, insuficiente para conversaciones largas, documentos o tareas de razonamiento extendido.
- Alcance temático muy restringido: solo conversa con soltura dentro de los temas entrenados; el autor lo califica de "charla dentro de temas entrenados".
- Cobertura lingüística limitada a Tagalog e inglés, con corpus de apenas 2,3 M de tokens; el rendimiento en otros idiomas es inexistente.
- Sin benchmarks estándar publicados, lo que impide comparar objetivamente su calidad de generación con otros modelos.
- Mitigación parcial de alucinaciones mediante fuentes externas (Wikipedia/DuckDuckGo cacheadas) y Lite mode, no mediante el propio modelo.
- Licencia Apache-2.0 sin restricciones para uso comercial, aunque la escala del modelo hace poco realista un despliegue productivo serio.
- Proyecto de muy baja adopción (23 descargas, 1 like en el momento de la ficha), sin comunidad de mantenimiento documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Randgris/Agila-v1.0
- Paper, repositorio de código, demo en línea y blog: no disponibles en la información proporcionada (el model card menciona rutas internas como `src/lib/agila/gpu.ts`, `training/` y `scripts/eval_chat.py`, pero no enlaces públicos adicionales).
