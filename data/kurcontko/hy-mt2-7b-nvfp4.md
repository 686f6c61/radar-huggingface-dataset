# kurcontko/Hy-MT2-7B-NVFP4

## Resumen

Hy-MT2-7B-NVFP4 es una cuantización NVFP4 (W4A4) del modelo de traducción tencent/Hy-MT2-7B, publicada por el usuario kurcontko. El modelo base, desarrollado por Tencent, es un transformer denso de 7.504.568.320 parámetros (7,5 mil millones) especializado en traducción automática y orientado a 33 idiomas. Esta versión cuantizada reduce el peso de los pesos de 15 GB en BF16 (y 7,6 GB en FP8) a 4,7 GB en vLLM, manteniendo una calidad prácticamente idéntica: COMET-22 de 84,66 frente a 84,70 del BF16 de referencia en el conjunto WMT24++ para los pares europeos evaluados.

La relevancia de esta ficha radica en que permite desplegar un modelo de traducción de calidad competitiva en GPUs de consumo con 12 GB de VRAM, como una RTX 5070 Ti Laptop, dejando 5,5 GiB para la caché KV bajo un presupuesto de 11,5 GB. Requiere GPU Blackwell (SM 10.x o 12.x) por el soporte nativo de NVFP4 y está pensada para servir con vLLM 0.26.0 o superior.

La cuantización afecta a todas las capas lineales de atención y MLP (pesos y activaciones en FP4, agrupados en bloques de 16 con escalas FP8), mientras que `lm_head` y los embeddings permanecen en BF16. La calibración se realizó sobre 576 pares de OPUS-100 en direcciones EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `--max-model-len 4096`) |
| Tipos de cuantizacion | NVFP4 (W4A4) con escalas FP8; `lm_head` y embeddings en BF16 |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs (evaluados); el modelo base cubre 33 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-7B es un transformer denso de 7,5 mil millones de parámetros con arquitectura `hunyuan_v1_dense`, especializado en traducción automática. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento NVFP4 (W4A4) mediante `llm-compressor` y el formato `compressed-tensors`, con pesos y activaciones en FP4 agrupados en bloques de 16 y escalas en FP8. Las capas lineales de atención y MLP están cuantizadas; `lm_head` y embeddings se mantienen en BF16 para preservar la calidad de la proyección final.

La calibración se realizó con 576 pares de OPUS-100 en las direcciones EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN, con 1 a 5 frases por par, renderizados con el prompt de Hy-MT2 seguido de la traducción de referencia. Los scripts y la receta están disponibles en el directorio `quantization/` del repositorio. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del corpus ni si hubo RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Traducción automática entre los idiomas evaluados: EN→CS, EN→DE, EN→ES, EN→FR, EN→IT, EN→NL, EN→PL, EN→PT y PL→EN.
- Traducción bidireccional dentro del par EN↔PL y cobertura multilingüe del modelo base (33 idiomas según la model card del base, aunque esta versión solo se evalúa en 9 direcciones).
- Preservación de estructura en textos técnicos: placeholders (`{placeholders}`, `%s`, `%1$s`, `{{var}}`, `${var}`), etiquetas HTML, URLs, correos electrónicos, SKUs, código en línea y saltos de línea.
- Traducción por celdas en hojas de cálculo (estilo Excel) con el prompt adecuado: 99,3 % de tokens protegidos conservados y 98,9 % de celdas intactas.
- Procesamiento por lotes de alta concurrencia: hasta 234,2 celdas/s con `--max-num-seqs 1024 --max-num-batched-tokens 32768`.
- Inferencia con decodificación greedy (temperature 0) o con los parámetros recomendados por el modelo base (temperature 0.7, top_p 0.6, top_k 20, repetition_penalty 1.05).
- Servicio mediante API compatible con OpenAI a través de vLLM.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo conserva placeholders, etiquetas HTML y saltos de línea, lo que lo hace adecuado para traducir documentación con formato sin romper la estructura. El prompt "keep-structure" eleva las celdas intactas del 90,9 % al 98,9 %.
- Localización de hojas de cálculo y catálogos: con 213-234 celdas/s en una RTX 5070 Ti de escritorio, permite traducir lotes de miles de celdas cortas en minutos, manteniendo referencias, SKUs y fórmulas.
- Traducción de correos y comunicaciones internas multilingües: al soportar EN↔PL y las principales lenguas europeas (DE, FR, ES, IT, NL, PT, CS), cubre equipos distribuidos en Europa.
- Servicio de traducción en producción con vLLM: el formato NVFP4 y la API compatible con OpenAI permiten integrarlo en un microservicio con `vllm serve`, con un consumo de 4,7 GB de pesos y 5,5 GiB de caché KV en 11,5 GB.
- Despliegue en portátiles con GPU Blackwell de 12 GB: cabe en una RTX 5070 Ti Laptop, lo que habilita traducción local sin depender de la nube para datos sensibles.
- Preprocesado de corpus para pipelines de NLP: traducción masiva por lotes de frases cortas (1-40 palabras) con throughput medido de 213,4 celdas/s con los valores por defecto de vLLM.
- Traducción de reseñas, titulares y contenido social: el conjunto de evaluación WMT24++ incluye texto de noticias, redes sociales, habla y literatura, por lo que el modelo está expuesto a registros variados.

## Benchmarks y rendimiento

COMET-22 (`Unbabel/wmt22-comet-da`, escala ×100) y chrF de corpus sobre todos los segmentos no canary de WMT24++ (`google/wmt24pp`), 960 por dirección y 8.640 en total. Decodificación greedy en vLLM 0.26.0 sobre una RTX 5070 Ti de escritorio de 16 GB limitada a 11,5 GB.

| Modelo | EN→CS | EN→DE | EN→ES | EN→FR | EN→IT | EN→NL | EN→PL | EN→PT | PL→EN | Media | chrF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BF16 referencia (2 GPUs) | 87,31 | 83,73 | 85,16 | 82,57 | 85,97 | 85,16 | 85,48 | 83,77 | 83,17 | 84,70 | 59,3 |
| tencent/Hy-MT2-7B-FP8 | 87,25 | 83,71 | 85,20 | 82,55 | 86,00 | 85,13 | 85,39 | 83,79 | 83,09 | 84,68 | 59,3 |
| Hy-MT2-7B-NVFP4 | 87,15 | 83,69 | 85,22 | 82,57 | 85,82 | 85,15 | 85,58 | 83,70 | 83,08 | 84,66 | 59,1 |
| NVFP4 con prompt keep-structure | 87,20 | 83,65 | 85,20 | 82,45 | 85,75 | 85,26 | 85,50 | 83,57 | 82,81 | 84,60 | 59,5 |

Prueba de estructura: 175 celdas estilo Excel en PL, DE, FR, ES y CS con 270 tokens que deben conservarse literalmente.

| Modelo | Prompt de la model card | Prompt keep-structure |
|---|---|---|
| tencent/Hy-MT2-7B-FP8 | 94,1 % / 90,9 % | no ejecutado |
| Hy-MT2-7B-NVFP4 | 94,1 % / 90,9 % | 99,3 % / 98,9 % |

Throughput por lotes: 4.000 celdas cortas EN→X de 1 a 40 palabras en un solo lote, RTX 5070 Ti de escritorio con presupuesto de 11,5 GB, tras calentamiento.

| Configuración | Pesos | Caché KV restante | Celdas/s |
|---|---|---|---|
| tencent/Hy-MT2-7B-FP8, valores por defecto de vLLM | 7,6 GB | 3,0 GiB | 126,5 |
| Hy-MT2-7B-NVFP4, `--max-num-seqs 1024 --max-num-batched-tokens 32768` | 4,7 GB | 5,5 GiB | 234,2 |
| Hy-MT2-7B-NVFP4, valores por defecto de vLLM | 4,7 GB | 5,5 GiB | 213,4 |

## Requisitos de hardware

- VRAM: los pesos ocupan 4,7 GB en vLLM (frente a 7,6 GB en FP8 y 15 GB en BF16). Con un presupuesto de 11,5 GB quedan 5,5 GiB para la caché KV.
- GPU recomendadas: cualquier GPU Blackwell con SM 10.x o 12.x (por ejemplo, RTX 5070 Ti de escritorio o portátil, RTX 5080, RTX 5090, B200). No funciona en GPUs sin soporte NVFP4.
- Cabe en GPU de consumo: sí, en tarjetas Blackwell de 12 GB o más, como la RTX 5070 Ti Laptop.
- Despliegue: vLLM (probado con 0.26.0) mediante `vllm serve`, con `--max-model-len 4096 --gpu-memory-utilization 0.9 --max-num-seqs 1024 --max-num-batched-tokens 32768`. La model card no documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 213,4 celdas/s con los valores por defecto de vLLM y 234,2 celdas/s con los límites de lote ampliados en una RTX 5070 Ti de escritorio; el modelo FP8 alcanza 126,5 celdas/s en el mismo entorno. En la versión portátil se esperan cifras menores por su menor ancho de banda de memoria (aproximadamente 0,75× la de escritorio).
- Nota de compatibilidad: si falla el arranque al compilar JIT los kernels de muestreo de FlashInfer con el error `CUDA compiler and CUDA toolkit headers are incompatible`, establecer `VLLM_USE_FLASHINFER_SAMPLER=0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | COMET-22 (media WMT24++ EU) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| kurcontko/Hy-MT2-7B-NVFP4 | 7,5 B (denso) | no disponible | 84,66 | Apache-2.0 | NVFP4, vLLM en Blackwell |
| tencent/Hy-MT2-7B-FP8 | 7,5 B (denso) | no disponible | 84,68 | Apache-2.0 | FP8, vLLM |
| tencent/Hy-MT2-7B (BF16) | 7,5 B (denso) | no disponible | 84,70 | Apache-2.0 | BF16, requiere 15 GB |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de otros modelos de traducción. No se dispone de comparaciones con alternativas como NLLB, M2M-100 o Tower en la documentación consultada.

## Limitaciones y advertencias

- Evaluación limitada a 9 direcciones (EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN). El modelo base cubre 33 idiomas, pero no se han medido pares como sueco, danés, finés, húngaro, rumano, griego, búlgaro o eslovaco.
- Solo se reportan métricas automáticas (COMET-22 y chrF); no hay evaluación humana.
- El modelo a veces traduce etiquetas de estado como `[PENDING]`, lo que puede romper flujos que dependan de esas marcas literales.
- Con el prompt de la model card, el modelo tiende a fusionar saltos de línea dentro de una celda; el problema es del modelo base, no de la cuantización, y se corrige añadiendo una frase al prompt ("Keep placeholders, tags, URLs, codes, numbers and line breaks exactly as in the source").
- La cuantización NVFP4 requiere GPU Blackwell (SM 10.x o 12.x); no es desplegable en arquitecturas anteriores.
- La cuantización introduce una pérdida mínima de calidad: 0,04 puntos de COMET-22 frente a BF16 y 0,02 frente a FP8.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización.
- No hay datos sobre la longitud de contexto del modelo base; el ejemplo de uso fija `--max-model-len 4096`, por lo que no se debe asumir una ventana mayor sin verificarla.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (tencent/Hy-MT2-7B) por si impone restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurcontko/Hy-MT2-7B-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy-MT2-7B
- Conjunto de evaluación WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Métrica COMET-22: https://huggingface.co/Unbabel/wmt22-comet-da
- Dataset de calibración OPUS-100: no disponible como enlace en la información proporcionada
- Repositorio de scripts de cuantización: directorio `quantization/` del repositorio del modelo en Hugging Face
- Paper del modelo base: no disponible en la información proporcionada
