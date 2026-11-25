# netprojects/Hy-MT3-30B-A3B-MLX-4bit

## Resumen

Hy-MT3-30B-A3B es el modelo de traducción multilingüe más grande de la familia Hy-MT3 de Tencent, publicada el 24 de noviembre de 2026 junto a las variantes de 1,8B y 7B. Se trata de un modelo de mezcla de expertos (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3B activos por token, distribuidos en 128 expertos, diseñado específicamente para traducción entre unos 100 idiomas y dialectos: los 33 idiomas de Hy-MT2, cinco lenguas minoritarias y dialectos chinos, y 64 idiomas añadidos como griego, rumano, húngaro y las lenguas nórdicas y bálticas.

La ficha que nos ocupa no es el modelo original, sino la conversión a formato MLX cuantizada a 4 bits publicada por NetProjects (Internet Projects Ltd), pensada para ejecución local en Apple Silicon. El repositorio incluye una implementación propia de la arquitectura `hy_v3` (`hy_v3.py`) que mlx-lm todavía no incorpora de serie, con normalización RMS por cabeza en q/k, router sigmoide con sesgo de puntuación de experto, un experto compartido y primera capa densa. El resultado ocupa 16,9 GB y requiere un Mac con 32 GB o más de memoria unificada.

Su relevancia es doble: por un lado, acerca un modelo de traducción de 30B con calidad cercana a bf16 (97,1% de coincidencia en el siguiente token) a hardware de consumo; por otro, demuestra el patrón de conversión necesario para arquitecturas propietarias aún no soportadas por las librerías estándar. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hy_v3` (transformer MoE, 128 expertos, 1 experto compartido, primera capa densa) |
| Parametros totales | 30.064.725.888 |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible (la model card recomienda entradas de hasta ~8K tokens) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (existen builds de 6-bit y 8-bit del mismo autor) |
| Idiomas soportados | ~100 idiomas y dialectos (33 de Hy-MT2, 5 lenguas minoritarias chinas, 64 nuevos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 16,9 GB |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura MoE denominada `hy_v3` en la implementación de referencia de Hugging Face Transformers (`HYV3`). Los detalles concretos de composición del dataset de entrenamiento, número de tokens y si hubo RLHF o DPO no están disponibles en la información proporcionada; la model card remite al informe técnico (arXiv 2611.27673) para los resultados completos.

La innovación técnica destacable de esta ficha es la propia conversión: NetProjects escribió `hy_v3.py`, una implementación en MLX de la arquitectura, y la validó contra la referencia de Transformers sobre un modelo pequeño aleatorio, con una diferencia relativa máxima de 3e-7 y decodificación con caché idéntica a un forward completo. Los pesos del router se mantienen en float32 y no se cuantizan. Según Tencent, frente a Hy-MT2 sobre datos reales, Hy-MT3 reduce un 43% los errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones, y Hy-MT3-30B-A3B obtiene los mejores resultados globales de todos los modelos evaluados en modo no-thinking.

## Capacidades

- Traducción multilingüe entre aproximadamente 100 idiomas y dialectos, incluidos griego, rumano, húngaro, lenguas nórdicas y bálticas, y cinco lenguas minoritarias chinas.
- Traducción bidireccional verificada en las pruebas del autor: hacia griego, chino, japonés, alemán, francés, español, árabe y ruso, y desde griego y chino hacia inglés.
- Seguimiento de instrucciones de formato: la model card original documenta plantillas de prompt para listas de terminología (`term` se traduce como `translation`), estilo requerido, preferencias personales, preservación de delimitadores y traducción de datos estructurados (JSON, XML).
- Modo thinking y modo no-thinking (los resultados destacados corresponden al modo no-thinking).
- Generación de hasta 4.096 tokens nuevos por petición con los ajustes recomendados por Tencent.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Traducción de documentación técnica en local: con 16,9 GB de pesos y 32 GB de memoria unificada, un MacBook puede traducir manuales y guías sin enviar contenido a servicios externos, lo que resulta adecuado para material bajo NDA.
- Localización de productos de software: las plantillas de prompt para JSON y XML permiten traducir ficheros de recursos o cadenas de interfaz preservando claves y delimitadores, reduciendo el trabajo de postprocesado.
- Traducción con glosario controlado: las plantillas de terminología de Tencent permiten imponer equivalencias fijas (`term` → `translation`), útil en dominios jurídicos, médicos o de marca donde la consistencia terminológica es crítica.
- Atención al cliente multilingüe en el borde: el servidor compatible con OpenAI (`mlx_lm.server`) permite montar un endpoint local que traduzca conversaciones multi-turno en unos 100 idiomas sin coste por token de API.
- Investigación en traducción automática: la disponibilidad de builds de 4, 6 y 8 bits del mismo modelo permite estudiar el impacto de la cuantización en calidad de traducción con una línea base bf16 documentada.
- Preservación de lenguas minoritarias: la cobertura de cinco lenguas minoritarias y dialectos chinos habilita proyectos de digitalización y traducción de material para comunidades con pocos recursos lingüísticos.
- Procesamiento por lotes en estaciones de trabajo Apple: para pipelines de traducción masiva en un parque de Macs Studio, el build de 6 bits (24,4 GB, 100% de coincidencia con bf16) es la opción recomendada por el autor cuando la memoria lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible. Los únicos datos cuantitativos aportados por el autor de la conversión son pruebas de fidelidad y humo:

| Metrica | 4-bit | 6-bit | 8-bit | bf16 |
|---|---|---|---|---|
| Coincidencia del siguiente token con bf16 | 97,1% (204 posiciones) | 100,0% | 100,0% | referencia |
| Prueba de humo de traducción | 10/10 | 10/10 | 10/10 | 10/10 |
| Tamano | 16,9 GB | 24,4 GB | 32,0 GB | no disponible |
| Memoria de Mac sugerida | 32 GB+ | 48 GB+ | 48 GB+ | no disponible |

Las pruebas se ejecutaron en un MacBook Pro M5 Max de 128 GB con mlx-lm 0.32.2 el 24 de noviembre de 2026. Tencent reporta, frente a Hy-MT2, un 43% menos de errores de traducción, un 74% menos de omisiones o adiciones y un 40% menos de errores de seguimiento de instrucciones, sin que la información proporcionada incluya las cifras absolutas.

## Requisitos de hardware

- VRAM/memoria unificada: 32 GB o más para el build de 4 bits (16,9 GB de pesos); 48 GB o más para los builds de 6 y 8 bits. La cifra sugerida es el menor tamaño cuyo límite de memoria GPU por defecto contiene el pico observado más 2 GB; los documentos largos necesitan más.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). Verificado en MacBook Pro M5 Max de 128 GB; no se documentan pruebas en A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 32 GB o superior; no aplica a GPUs discretas NVIDIA o AMD.
- Opciones de despliegue: `mlx_lm.generate` (CLI), API de Python `mlx_lm.load`/`generate`, y servidor compatible con OpenAI mediante `mlx_lm.server`. Requiere `mlx-lm>=0.32.2` y `--trust-remote-code` / `trust_remote_code=True` para cargar `hy_v3.py`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B (MLX 4-bit, esta ficha) | 30B totales / ~3B activos | no disponible (~8K recomendado) | ~100 | Apache-2.0 | MLX, Apple Silicon |
| Hy-MT3-30B-A3B (MLX 6-bit) | 30B totales / ~3B activos | no disponible | ~100 | Apache-2.0 | MLX, 24,4 GB, 100% coincidencia con bf16 |
| Hy-MT3-30B-A3B (MLX 8-bit) | 30B totales / ~3B activos | no disponible | ~100 | Apache-2.0 | MLX, 32,0 GB, 100% coincidencia con bf16 |
| tencent/Hy-MT3-30B-A3B (original bf16) | 30B totales / ~3B activos | no disponible | ~100 | Apache-2.0 | Transformers, referencia de calidad |
| Hy-MT3-7B / Hy-MT3-1.8B | 7B / 1.8B | no disponible | ~100 | Apache-2.0 | Tamanos menores de la misma familia |

No se dispone en la información proporcionada de comparaciones con modelos de traducción de otras familias (por ejemplo, NLLB o SeamlessM4T) ni de cifras de calidad que permitan ordenarlos frente a Hy-MT3.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce divergencia respecto a bf16: un 2,9% de posiciones generadas difieren en el siguiente token más probable. Para producción con requisitos estrictos de fidelidad, el autor recomienda el build de 6 bits.
- Solo funciona en Apple Silicon con MLX; no hay ruta de despliegue en CUDA, ROCm ni CPU convencional con este repositorio.
- Requiere `trust_remote_code=True`, lo que ejecuta código Python del repositorio (`hy_v3.py`); conviene auditar el fichero antes de usarlo en entornos sensibles.
- La arquitectura `hy_v3` no está soportada de serie por mlx-lm; futuras versiones de la librería podrían romper la compatibilidad de la implementación incluida.
- La longitud de contexto oficial no está disponible; la recomendación de Tencent de entradas de hasta ~8K tokens limita el procesamiento de documentos largos en una sola pasada.
- Riesgo de alucinación y de omisiones en textos muy largos o con terminología especializada; las pruebas publicadas cubren solo 10 prompts cortos, insuficientes para estimar la tasa de error en dominios concretos.
- No se documentan sesgos conocidos ni evaluaciones de equidad entre idiomas; la cobertura de 100 idiomas no implica calidad homogénea, y los idiomas con menos recursos probablemente rindan peor.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse `LICENSE.txt` de Tencent y citarse su trabajo; el repositorio no está afiliado a Tencent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad sobre esta conversión concreta.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-4bit
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Build de 6 bits (recomendado por el autor): https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-8bit
- Informe técnico de Tencent: arXiv 2611.27673
- Perfil del autor de la conversión en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
