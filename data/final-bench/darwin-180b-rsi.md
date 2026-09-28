# FINAL-Bench/Darwin-180B-RSI

## Resumen

Darwin-180B-RSI es un modelo multimodal de texto e imagen desarrollado por FINAL-Bench (Corea del Sur según su propia model card) y presentado como el buque insignia de la familia Darwin. Es un Mixture-of-Experts disperso de 512 expertos con 179.999.981.459 parámetros totales en safetensors (unos 180B), construido sobre la línea Qwen (etiquetas `qwen3.8` y `qwen4_exp`), con atención híbrida (lineal combinada con atención completa) y una ventana de contexto declarada de 262.144 tokens. Su rasgo diferencial declarado es el RSI (*recursive self-improvement*): el modelo se retroalimenta con su propio trabajo verificado, e incorpora además ZTC (*Zero-Token Confidence*), un mecanismo de estimación de confianza orientado a la detección de alucinaciones.

El modelo ataca cuatro frentes: razonamiento científico de nivel posgrado (GPQA Diamond), matemáticas de competición (AIME 2026, HMMT Feb 2026), conocimiento multidisciplinar (MMLU-Pro) y razonamiento multimodal experto (MMMU-Pro). El autor lo sitúa en el primer puesto de cinco leaderboards oficiales de Hugging Face con 94,44 en GPQA Diamond, 88,12 en MMLU-Pro, 79,48 en MMMU-Pro y 100 en AIME 2026 y HMMT Feb 2026. Todas estas cifras son autodeclaradas por el editor del modelo, figuran con `verified: false` en el model-index y no consta verificación independiente.

Es relevante porque concentra tres tendencias de 2026 en un único artefacto: MoE disperso de gran tamaño, modo de pensamiento con cadenas de razonamiento de hasta 131.000 tokens y auto-mejora con estimación de incertidumbre. La contrapartida es su coste: 360 GB de repositorio, licencia `qwen-community-1.0` (no completamente abierta) y despliegue documentado sobre vLLM con hardware tipo B200.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts disperso (512 expertos) con atención híbrida (lineal + completa) y torre de visión; base Qwen (`qwen3.8`, `qwen4_exp`) |
| Parámetros totales | 179.999.981.459 (~180B), según safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K); evaluaciones realizadas con hasta 131K tokens de *thinking* |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors y no documenta variantes GGUF, GPTQ o AWQ |
| Idiomas soportados | en, ko, zh, ja y etiqueta genérica `multilingual`; la model card destaca coreano e inglés |
| Licencia | `qwen-community-1.0` (`license: other`, con `license_name` y enlace a `LICENSE` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modalidades de entrada | texto e imagen (pipeline `image-text-to-text`) |
| Biblioteca y despliegue | `transformers`; compatible con vLLM y API compatible con OpenAI |
| Tamaño del repositorio | 360,0 GB |
| Descargas / likes | 70 descargas, 42 likes (a fecha de actualización: 2026-09-28) |
| Fecha de publicación | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture-of-Experts disperso con 512 expertos, atención híbrida (capas de atención lineal combinadas con capas de atención completa, lo que permite sostener la ventana de 262K tokens) y una torre de visión que habilita la entrada de imágenes. El pipeline declarado es `image-text-to-text`, y la model card etiqueta la familia como `long-context`, `vision-language`, `multimodal` y `reasoning-model` con modo `thinking` y `chain-of-thought`. No se especifica cuántos parámetros permanecen activos por token, dato clave para estimar coste de inferencia y que queda como no disponible.

En cuanto al entrenamiento, la información pública no detalla el número de tokens, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento: no disponible. Lo que sí se declara es el componente RSI (*recursive self-improvement*), según el cual el modelo mejora a partir de su propio trabajo verificado, y el módulo ZTC (*Zero-Token Confidence*), orientado a estimar confianza y detectar alucinaciones sin coste adicional de tokens. El autor remite a dos referencias técnicas: el paper de la familia Darwin (arXiv:2605.14386) y el paper "Latin Square" (2609.20269) alojado en Hugging Face Papers. También se menciona el ecosistema VIDRAFT como entorno asociado.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (cadena de razonamiento de hasta 131K tokens en las evaluaciones publicadas).
- Matemáticas de competición: resolución de problemas de nivel AIME y HMMT con protocolos de *majority vote* sobre 16 muestras.
- Razonamiento científico de nivel posgrado: GPQA Diamond y MMLU-Pro como benchmarks de referencia declarados.
- Visión y razonamiento multimodal: entrada de imágenes con pipeline `image-text-to-text`, evaluado en MMMU-Pro en su configuración `vision`.
- Capacidades multilingües: inglés, coreano, chino y japonés etiquetados explícitamente, más etiqueta genérica multilingüe.
- Estimación de confianza y detección de alucinaciones mediante ZTC (*Zero-Token Confidence*).
- Auto-mejora declarada mediante RSI (*recursive self-improvement*) sobre trabajo propio verificado.
- Despliegue como servicio: compatible con vLLM y con API compatible con OpenAI.
- Soporte de *tool calling* / *function calling*: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo de pensamiento largo es un requisito habitual para ello.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Verificación de soluciones matemáticas de alta dificultad: con 100 en AIME 2026 y HMMT Feb 2026 bajo *majority vote* de 16 muestras a 131K de *thinking*, el modelo sirve como árbitro o generador de soluciones en entornos de olimpiadas, generación de problemas y validación de razonamientos largos.
- Apoyo a investigación científica de posgrado: los 94,44 de GPQA Diamond lo sitúan como candidato para responder preguntas de nivel doctoral en física, química y biología, con revisión humana posterior.
- Análisis de documentación técnica con imágenes: al aceptar texto e imagen con 262K tokens de contexto, permite procesar manuales, diagramas de arquitectura, figuras de papers y planos en una sola pasada sin trocear el documento.
- Detección de respuestas poco fiables en producción: el módulo ZTC permite marcar salidas de baja confianza y derivarlas a revisión humana, lo que reduce el riesgo de publicar alucinaciones en flujos automatizados.
- Revisión de literatura multilingüe: con cobertura de inglés, coreano, chino y japonés y ventana de 262K tokens, resulta adecuado para resumir y cruzar corpus de papers o patentes en varios idiomas.
- Servicio interno compatible con OpenAI: el soporte de vLLM con API compatible con OpenAI permite sustituir un endpoint propietario por este modelo sin reescribir el cliente, siempre que la infraestructura soporte el peso del repositorio.
- Evaluación comparativa de modelos de razonamiento: sus resultados publicados en cinco leaderboards lo convierten en una referencia útil para calibrar pipelines de evaluación propios con protocolos de *majority vote*.

## Benchmarks y rendimiento

Resultados autodeclarados por el editor del modelo y marcados como `verified: false` en el model-index. No se han localizado verificaciones independientes.

| Benchmark | Métrica | Resultado | Protocolo | Verificado |
|---|---|---|---|---|
| GPQA Diamond | Accuracy | 94,44 | mayoría de votos, hasta 16 muestras, 131K *thinking* | no |
| MMLU-Pro (test) | Accuracy | 88,12 | muestra única, 131K *thinking* | no |
| MMMU-Pro (vision, test) | Accuracy | 79,48 | mayoría de votos, 3 muestras, 131K *thinking* | no |
| AIME 2026 | Accuracy | 100,00 | mayoría de votos, 16 muestras, 131K *thinking* | no |
| AIME 2026 | Accuracy | 98,75 | media sobre 16 muestras | no |
| HMMT Feb 2026 | Accuracy | 100,00 | mayoría de votos, 16 muestras, 131K *thinking* | no |
| HMMT Feb 2026 | Accuracy | 96,59 | media sobre 16 muestras | no |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros publicados (180B) y de la aritmética estándar de cuantización, no datos declarados por el autor.

- Peso bruto en BF16/FP16: aproximadamente 360 GB (coincide con el tamaño del repositorio publicado).
- Peso en FP8/INT8: aproximadamente 180 GB, más memoria para caché KV y activaciones.
- Peso en cuantización de 4 bits: aproximadamente 90 GB.
- Caché KV para 262K tokens: no disponible; depende del número de capas, cabezas y configuración de atención, y no se publica el desglose. La atención lineal híbrida podría reducirlo, pero no hay cifras confirmadas.
- GPU de centro de datos: las etiquetas del modelo mencionan B200; para BF16 completo se necesitaría un nodo multi-GPU (por ejemplo, 8×H100 80 GB o 4×B200). En FP8, 4×H100 80 GB o 2×B200 serían suficientes en términos de peso, sujeto a la caché KV.
- GPU de consumo: no cabe. Incluso a 4 bits (~90 GB) excede los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Se requeriría un sistema multi-GPU o memoria unificada de gran capacidad.
- Opciones de despliegue documentadas: vLLM con API compatible con OpenAI, y uso directo con `transformers`. No se documentan GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al no publicarse el número de parámetros activos por token, no es posible estimar el coste por token con rigor.

## Comparativa con modelos similares

Datos extraídos de la tabla comparativa de la propia model card. Los parámetros, la longitud de contexto, el rendimiento y la licencia de los modelos alternativos no se detallan en la información disponible.

| Modelo | AIME 2026 | GPQA Diamond | MMLU-Pro | MMMU-Pro | HMMT Feb 2026 |
|---|---|---|---|---|---|
| Darwin-180B-RSI (FINAL-Bench) | 100 | 94,44 | 88,12 | 79,48 | 100 |
| Kimi-K3 (Moonshot AI) | no disponible | 93,5 | no disponible | no disponible | no disponible |
| Kimi-K2.6 (Moonshot AI) | 96,4 | 90,5 | no disponible | 79,4 | 92,7 |
| DeepSeek-V4-Pro (DeepSeek) | no disponible | 90,1 | 87,5 | no disponible | no disponible |

Advertencia sobre la comparación: los resultados de los tres modelos alternativos son, según la propia model card, autodeclarados por sus respectivos editores en los leaderboards de Hugging Face. Las diferencias en MMLU-Pro frente a DeepSeek-V4-Pro (88,12 frente a 87,5) y en MMMU-Pro frente a Kimi-K2.6 (79,48 frente a 79,4) son de décimas y caen dentro del ruido habitual de este tipo de evaluaciones. Comparativa de parámetros, contexto, licencia y disponibilidad de las alternativas: no disponible.

## Limitaciones y advertencias

- Todos los resultados están marcados con `verified: false`: son autodeclarados por el editor del modelo y no constan verificaciones independientes.
- El protocolo de *majority vote* sobre 16 muestras y con hasta 131K tokens de *thinking* infla las cifras frente a una ejecución de muestra única. En AIME 2026 la diferencia entre mayoría de votos (100) y media sobre 16 muestras (98,75) es de 1,25 puntos, y en HMMT Feb 2026 de 3,41 puntos.
- Riesgo de alucinación: aunque el modelo incluye el mecanismo ZTC de estimación de confianza, no se publican métricas de calibración ni tasas de falsos positivos o falsos negativos de ese detector.
- Restricciones de licencia: `qwen-community-1.0` con `license: other`. No es una licencia de código abierto permisiva; antes de un uso comercial es obligatorio revisar el archivo `LICENSE` del repositorio y sus condiciones de atribución y redistribución.
- La model card no entra en detalle sobre el modelo base concreto ni sobre el proceso de destilado o ajuste, lo que dificulta auditar la procedencia de los datos de entrenamiento.
- Se desconoce el número de parámetros activos, lo que impide estimar con rigor el coste real de inferencia, la latencia y el throughput.
- Cobertura lingüística: en la práctica la model card destaca coreano e inglés; no se documenta rendimiento en castellano ni en catalán, gallego o euskera.
- Contexto: se declaran 262K tokens, pero todas las evaluaciones publicadas se han ejecutado con 131K tokens de *thinking*; no hay datos sobre degradación de rendimiento en la parte alta de la ventana.
- No se documentan cuantizaciones GGUF, GPTQ o AWQ, lo que limita el despliegue en hardware no profesional y complica las pruebas locales.
- Tracción comunitaria baja: 70 descargas y 42 likes, sin historial de uso en producción ni incidencias reportadas por terceros.
- No se documentan capacidades de audio o vídeo, ni soporte explícito de *tool calling* o de flujos agénticos.
- El modelo tiene fecha de publicación en 2026 y benchmarks sobre conjuntos de ese mismo año (AIME 2026, HMMT Feb 2026), lo que reduce el margen para comparaciones históricas con series previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Modelo hermano de la familia: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Colección familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Colección modelos ZTC: https://huggingface.co/collections/FINAL-Bench/ztc-models-jev-ecosystems
- Paper de la familia Darwin: https://arxiv.org/abs/2605.14386
- Paper "Latin Square": https://huggingface.co/papers/2609.20269
- Sitio del ecosistema VIDRAFT: https://vidraft.net
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- Dataset AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- Dataset HMMT Feb 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
- Artículo sobre protocolos de *majority vote* y reproducibilidad en leaderboards de Hugging Face: https://dev.to/ai_openfree_b23025ef075cf/reading-an-official-hugging-face-leaderboard-protocols-majority-vote-and-reproducibility-2oon
