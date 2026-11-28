# balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX

## Resumen

SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX es una compilación cuantizada en formato MLX affine 4-bit del modelo multimodal SenseNova-Loop-9B, publicada por el usuario balllvin sobre el modelo base de SenseTime (sensenova/SenseNova-Loop-9B). Combina tres transformaciones sucesivas: una cuantización con conciencia de cuantización (QAD), una eliminación de rechazos mediante entrenamiento con verosimilitud negativa (abliteration) y un ajuste supervisado posterior con el dataset Arete. El resultado es un modelo de 9B nominales (3.119 millones de parámetros efectivos en los pesos cuantizados) que acepta entradas de texto e imagen.

La arquitectura es un transformer híbrido con atención lineal y atención completa, con 32 capas físicas de las cuales las capas 4 a 27 se recorren dos veces, alcanzando 56 visitas efectivas por token. Incorpora un mecanismo de enrutamiento mHC (multi-head routing con Sinkhorn 2x2 en forma cerrada) y soporta un contexto nativo de 524.288 tokens mediante YaRN con factor 2.0 sobre una base de 262.144.

La relevancia de esta ficha reside en que es una de las pocas builds de SenseNova-Loop-9B optimizadas para Apple Silicon, con un servidor compatible con OpenAI incluido (tools/serve.py) y velocidades de decodificación medidas de 20,8 a 26,6 tok/s en un M5 Pro de 64 GB. El modelo está pensado para desarrolladores que necesitan inferencia local multimodal con contexto muy largo en hardware Apple, aceptando el compromiso de una alineación de seguridad reducida por el proceso de abliteration.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa) con bucle de capas y enrutamiento mHC |
| Parámetros totales | 3.119.461.248 (pesos cuantizados); 9B nominales según el modelo base |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 524.288 tokens (512K vía YaRN factor=2.0 sobre 262.144) |
| Tipos de cuantización | MLX affine 4-bit (group_size=64), LM head 8-bit, torre visual BF16 sin cuantizar |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), vision tower en visual.safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea un diseño híbrido con 32 capas físicas: 8 capas de atención completa y 24 de atención lineal, con las capas 4 a 27 recorridas dos veces, lo que resulta en 56 visitas por token. Esta configuración busca aumentar la profundidad efectiva sin incrementar proporcionalmente el coste computacional. El enrutamiento mHC utiliza una formulación Sinkhorn 2x2 en forma cerrada que sustituye a la iteración FP32, logrando una NLL de 3.04790 frente a 3.04762 de la referencia iterativa (98,1% de acuerdo top-1) en 160 posiciones de WikiText.

El proceso de ajuste de esta build es acumulativo. Primero se aplica una cuantización con conciencia de cuantización (QAD) que preserva el comportamiento del modelo upstream. Después se aplica abliteration mediante entrenamiento con verosimilitud negativa, que reduce drásticamente los rechazos (de 95/99 a 3/99 en prompts dañinos de JailbreakBench y AdvBench). Finalmente, un SFT con el dataset NousResearch/arete-data-pairs eleva el MMLU del 58,0% al 62,0% y reduce la NLL de WikiText de 2.7619 a 2.7099, a costa de un ligero repunte de rechazos en prompts dañinos (6/99). La conversión a MLX mantiene el comportamiento de los pesos NVFP4 de origen y añade una LM head de 8 bits con opción --fast-head.

## Capacidades

- Generación de texto conversacional en inglés con modo thinking desactivable.
- Comprensión de imágenes (pipeline image-text-to-text), con torre visual BF16 de 0,91 GB.
- Razonamiento de múltiples pasos y contexto muy largo (hasta 512K tokens con YaRN).
- Procesamiento multimodal combinado: texto e imagen en la misma ventana de contexto.
- Inferencia local en Apple Silicon mediante servidor compatible con OpenAI (tools/serve.py).
- Decodificación por lotes con múltiples streams (hasta 8 streams agregados).
- Ajuste de KV cache a 8 bits para reducir huella de memoria en contextos largos.
- Capacidad reducida de rechazo de contenidos dañinos por el proceso de abliteration (6/99 en la evaluación del autor).

## Casos de uso

- Análisis de documentos largos con imágenes: el contexto de 512K tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentación.
- Asistente local en Mac para desarrolladores: el servidor compatible con OpenAI permite integrarlo en editores o herramientas CLI que ya hablan el protocolo de OpenAI, con 20,8–26,6 tok/s en un M5 Pro.
- Procesamiento de capturas y diagramas técnicos: la torre visual BF16 sin cuantizar preserva la calidad de codificación de imagen, útil para extraer información de diagramas de arquitectura o esquemas.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado de abliteration, con métricas publicadas de rechazo dañino/benigno y de propaganda que permiten comparar etapas del proceso.
- Generación de texto creativo sin filtros restrictivos: para aplicaciones donde los rechazos del modelo base resultan un obstáculo (ficción, guiones, role-play), la variante abliterated reduce los rechazos a 6/99 en prompts dañinos.
- Evaluación de cuantización en producción: útil para medir la degradación de un modelo multimodal al pasar de BF16 a 4-bit MLX, con paridad top-1 del 99,4% documentada.
- Despliegue en entornos con recursos limitados: 8,89 GB de pesos permiten ejecutar un modelo multimodal de 9B en Macs de 16–32 GB de RAM unificada, algo inviable en BF16.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la ruta de forward decodificada en BF16 de las builds NVFP4 (greedy, 96 tokens, thinking off, eval_count=2). La evaluación MLX no se reejecutó por separado; hereda el comportamiento de los pesos NVFP4 de origen.

| Build | Rechazos dañinos | Rechazos benignos | MMLU | WikiText NLL | Propaganda (hecho) | Tasa de propaganda |
|---|---:|---:|---:|---:|---:|---:|
| NVFP4 Base (QAD) | 95/99 | 60/100 | 43,0% | 2,7560 | 1,367/5 | 19,3% |
| + Abliterated | 3/99 | 7/100 | 58,0% | 2,7619 | 1,242/5 | 27,8% |
| + Abliterated + Arete | 6/99 | 6/100 | 62,0% | 2,7099 | 1,320/5 | 29,6% |

Paridad de la conversión MLX (160 posiciones de WikiText con teacher forcing):

| Configuración | NLL | Acuerdo top-1 |
|---|---:|---:|
| Router en forma cerrada + tronco BF16 | 3,04790 | 98,1% vs FP32 iterativo |
| LM head 8-bit por defecto | 3,04775 | 99,4% vs BF16 |
| --fast-head | — | 199/199 (KL = 0,000544) |

Rendimiento medido en Apple M5 Pro (64 GB, 48–64 tokens de salida, loops=2, kv-bits=8):

| Configuración | Pesos | Huella estable | Decodificación | TTFT |
|---|---:|---:|---:|---:|
| Por defecto (--head-bits 8) | 8,89 GB | 7,5 GB | 20,8 tok/s | 0,44 s |
| --fast-head | 8,89 GB | ~8,0 GB | 26,6 tok/s | 0,25–0,32 s |
| --fast-head, 4 streams | 8,89 GB | ~8,0 GB | 53,9 tok/s | — |
| --fast-head, 8 streams | 8,89 GB | ~8,0 GB | 51,3 tok/s | — |

## Requisitos de hardware

- VRAM/RAM unificada: 8,89 GB de pesos en MLX 4-bit; huella estable de 7,5–8,0 GB durante la decodificación.
- Para la variante NVFP4 en CUDA se requieren 24 GB o más de VRAM para el forward decodificado en BF16.
- GPU recomendadas para la variante CUDA: A100, H100 o RTX 4090 (24 GB); la build MLX está pensada para Apple Silicon.
- Cabe en GPU de consumo: sí, en Macs con 16 GB o más de memoria unificada; en NVIDIA, una RTX 4090 de 24 GB es el mínimo práctico para la variante NVFP4.
- Opciones de despliegue: servidor incluido tools/serve.py (compatible con OpenAI) para MLX; transformers + load_nvfp4.py para CUDA.
- Latencia y throughput: TTFT de 0,25–0,44 s y 20,8–26,6 tok/s en single-stream en M5 Pro; hasta 53,9 tok/s con 4 streams agregados.
- El contexto de 512K requiere ajuste de KV cache (kv-bits=8 documentado) para no agotar la memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato/plataforma |
|---|---|---:|---|---|---|
| SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX (este) | 9B nominales (3,12B en pesos) | 524.288 | Sí | Apache 2.0 | MLX 4-bit, Apple Silicon |
| SenseNova-Loop-9B (upstream) | 9B | 524.288 | Sí | Apache 2.0 | BF16, transformers |
| balllvin/SenseNova-Loop-9B-NVFP4 | 9B | 524.288 | Sí | Apache 2.0 | W4A16 NVFP4, CUDA |
| balllvin/SenseNova-Loop-9B-NVFP4-MLX | 9B | 524.288 | Sí | Apache 2.0 | MLX 4-bit, Apple Silicon |

La comparativa directa con modelos de otros fabricantes (Qwen, Llama, Gemma) no está disponible en la información proporcionada; el autor solo publica comparaciones entre sus propias variantes.

## Limitaciones y advertencias

- El proceso de abliteration elimina deliberadamente la alineación de seguridad: solo rechaza 6 de 99 prompts dañinos, por lo que no es apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo elevado de generar contenido dañino, sesgado o NSFW; la tasa de propaganda medida sube del 19,3% (base) al 29,6% (Arete), lo que indica mayor susceptibilidad a narrativas manipuladoras.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación inherente a modelos de 9B, agravado por el contexto largo: el modelo puede mezclar información de documentos extensos.
- La evaluación MLX no se reejecutó por separado; los resultados de MMLU y rechazos provienen de la ruta NVFP4 en BF16 y pueden no reflejar exactamente el comportamiento de la build MLX.
- El repositorio depende de código personalizado (custom_code) y del servidor tools/serve.py del autor; no es un formato estándar de transformers sin adaptación.
- El contexto de 512K depende de YaRN con factor 2.0; la calidad en ventanas superiores a 262.144 tokens no está evaluada en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación de seguridad traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- El modelo base y las variantes intermedias son mantenidos por un único autor (balllvin), sin garantías de mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX
- Modelo base upstream: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante NVFP4 origen: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Variante NVFP4 base (QAD): https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Variante MLX base (QAD): https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4-MLX
- Variante NVFP4 abliterated: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Dataset Arete: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Informe de evaluación de propaganda (base): https://huggingface.co/datasets/balllvin/Propaganda-Eval-SenseNova-Loop-9B-NVFP4
- Informe de evaluación de propaganda (abliterated): https://huggingface.co/datasets/balllvin/Propaganda-Eval-SenseNova-Loop-9B-abliterated-NVFP4
- Informe de evaluación de propaganda (abliterated + Arete): https://huggingface.co/datasets/balllvin/Propaganda-Eval-SenseNova-Loop-9B-abliterated-arete-NVFP4
