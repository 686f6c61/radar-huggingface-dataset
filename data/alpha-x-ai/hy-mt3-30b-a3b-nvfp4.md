# alpha-x-ai/Hy-MT3-30B-A3B-NVFP4

## Resumen

Hy-MT3-30B-A3B-NVFP4 es una compilación cuantizada en NVFP4 del modelo de traducción tencent/Hy-MT3-30B-A3B, publicada por el usuario alpha-x-ai. El modelo original, desarrollado por Tencent, es un transformer de tipo mixture-of-experts (MoE) con 30.064.725.888 parámetros totales y arquitectura identificada como `hy_v3`, especializado en traducción automática multilingüe. Esta versión reduce el peso en disco de 60,1 GB (bf16) a 18,2 GB, lo que permite desplegarlo en GPUs de gama profesional con memoria limitada.

La compilación aplica GPTQ con cuantización NVFP4 (W4A4, grupo 16) a los 128 expertos enrutados de las 47 capas MoE, que concentran aproximadamente el 96 % de los parámetros, mientras que la atención (q/k/v/o), el experto compartido y el MLP denso de la capa 0 se mantienen en FP8 W8A8. El router, `lm_head`, embeddings y normalizaciones permanecen en bf16. El checkpoint usa el formato `mixed-precision` de compressed-tensors y está pensado para servirse con vLLM 0.34.0 sobre GPUs Blackwell.

Su relevancia radica en que demuestra que es posible cuantizar agresivamente un MoE de traducción de 30B manteniendo una divergencia KL de solo 0,0240 frente a bf16 y un chrF del 91,33 % respecto a la salida del modelo original, con una velocidad de decodificación de 58,1 tok/s en un solo flujo y 360 tok/s con 8 flujos concurrentes en una GB10 (DGX Spark). La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`hy_v3`), 47 capas MoE con 128 expertos enrutados por capa, experto compartido y MLP denso en capa 0 |
| Parametros totales | 30.064.725.888 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de servicio `--max-model-len 32768`; el máximo del modelo base no se detalla) |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) para expertos enrutados; FP8 W8A8 para atención y experto compartido/MLP denso; bf16 para router, `lm_head`, embeddings y norms |
| Idiomas soportados | 101 idiomas, entre ellos zh, en, es, fr, de, ja, ko, ru, ar, hi, pt, it, vi, th, tr, nl, pl, uk, he, fa, ur, bn, ta, te, mr, gu, kn, ml, pa, or, as, sd, ne, si, my, km, lo, bo, mn, kk, ug, yue, ceb, war, jv, su, tl, y otros |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors `mixed-precision` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 47 capas MoE, cada una con 128 expertos enrutados, más un experto compartido y un MLP denso en la capa 0. Los expertos enrutados concentran aproximadamente el 96 % de los parámetros. La arquitectura se etiqueta como `hy_v3`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La compilación NVFP4 se generó mediante GPTQ por capas independientes, con entradas recogidas del modelo bf16 sin propagación de error entre capas, damping de 0,01 y secuencias de hasta 4096 tokens. La matriz de Hessian de cada experto combina la de sus tokens enrutados con la Hessian global de todos los tokens, de modo que los expertos rara vez enrutados obtienen una estimación razonable. Los escalares FP8 E4M3 por bloque de 16 se eligen mediante búsqueda por MSE en el rango 0,70–1,00 × amax/6; `gate` y `up` comparten una escala global. La calibración empleó 560 conversaciones y 421K tokens: párrafos multilingües del split de validación de opus-100 en 31 idiomas (ponderados hacia en/ja/zh) más fragmentos de prosa técnica en inglés, con respuestas generadas por el modelo original en GGUF Q8_0. Las partes FP8 usan escala de pesos por canal de salida (amax/448) y cuantización dinámica de activaciones por token.

## Capacidades

- Traducción automática multilingüe entre 101 idiomas, con especial cobertura de chino, inglés y japonés.
- Traducción de párrafos multi-frase, según el conjunto de evaluación empleado (párrafos construidos a partir de opus-100).
- Generación de texto condicionada por prompt de traducción, con plantilla de chat y muestreo recomendado idénticos al modelo original.
- Soporte de conversaciones multi-turno mediante la plantilla de chat heredada del modelo base.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías de inglés a japonés, chino o español manteniendo coherencia entre frases de un mismo párrafo, gracias a su ventana de 32.768 tokens y a su entrenamiento orientado a párrafos multi-frase.
- Localización de productos multilingüe: con 101 idiomas soportados y licencia Apache-2.0, encaja en pipelines de localización que necesitan cubrir mercados como coreano, tailandés, árabe o hindi sin coste de licencia.
- Servicio de traducción de alto rendimiento: desplegado con vLLM sobre una GPU Blackwell, ofrece 360 tok/s con 8 flujos concurrentes, adecuado para APIs de traducción con múltiples usuarios simultáneos.
- Traducción en el borde (edge) o en estaciones de trabajo: sus 18,2 GB permiten ejecutarlo en una única GPU de 24 GB o en un dispositivo DGX Spark, sin necesidad de clústeres multi-GPU.
- Traducción de contenido generado por usuarios: chat, reseñas o comentarios en tiempo real, donde la baja latencia por flujo (58,1 tok/s) y la fidelidad chrF del 91,33 % frente a bf16 son suficientes para producción.
- Investigación en cuantización: sirve como referencia reproducible para estudiar el impacto de NVFP4 frente a FP8 y bf16 en modelos MoE de traducción, con métricas de NLL, KL, top-1 y chrF publicadas.
- Traducción de artículos científicos o prensa entre pares de idiomas con demanda alta (en↔ja, en↔zh, ja↔zh), que son los que cubre con más profundidad el conjunto de evaluación.

## Benchmarks y rendimiento

Evaluación sobre 112 ítems de traducción retenidos de opus-100 (en→ja 24, ja→en 24, zh→ja 12, en→zh 12, ja→zh 8, y en↔{ko, fr, de, ru, ar, vi, hi, th} 2 por sentido), servidos con vLLM 0.34 en una GB10 (TP=1). NLL es la log-verosimilitud negativa media de una traducción de referencia; KL es la divergencia por token frente a bf16; top-1 es la coincidencia del argmax; chrF es el chrF de 6-gramas de caracteres frente a la traducción greedy de bf16; velocidad con 512 tokens de salida.

| Build | Tamano | NLL | KL | top-1 | chrF | 1 flujo tok/s | 8 flujos tok/s |
|---|---|---|---|---|---|---|---|
| bf16 | 60,1 GB | 0,0767 | 0 | 100 % | 100 | – | – |
| NVFP4, todas las capas, RTN | 17,7 GB | 0,1399 | 0,0648 | 95,04 % | 86,97 | 65,6 | 392 |
| NVFP4, todas las capas, GPTQ | 17,7 GB | 0,1198 | 0,0449 | 96,13 % | 88,87 | 65,7 | 396 |
| **Este modelo** (atención + compartido FP8, expertos GPTQ NVFP4) | **18,2 GB** | **0,0995** | **0,0240** | **97,11 %** | **91,33** | **58,1** | **360** |
| Atención + compartido bf16, expertos GPTQ NVFP4 | 19,3 GB | 0,0951 | 0,0202 | 97,45 % | 91,55 | 41,6 | 295 |
| Este modelo + expertos de 8 capas en FP8 | 20,3 GB | 0,0962 | 0,0207 | 97,45 % | 91,65 | 56,9 | 348 |
| Atención + compartido + todos los expertos FP8 | 30,7 GB | 0,0831 | 0,0084 | 98,35 % | 94,13 | 51,3 | 298 |

Hallazgos del barrido: la atención es la parte más sensible (pasar solo la atención de NVFP4 a FP8 redujo la KL de 0,045 a 0,030); mantener atención y experto compartido en bf16 en lugar de FP8 apenas mejoró (KL 0,024 → 0,020) y costó cerca de un 28 % de velocidad en un flujo; ningún bloque de capas de expertos destacó, ya que poner cualquiera de 8 de las 47 capas MoE en FP8 dio una ganancia similar (KL 0,021–0,022) por 2,1 GB adicionales. El conjunto de evaluación es pequeño (112 ítems) y las cifras de velocidad proceden de una sola GPU, por lo que las diferencias pequeñas deben tratarse como ruido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,2 GB de pesos más memoria para KV cache y overhead de vLLM; con 32.768 tokens de contexto conviene reservar 24 GB o más.
- GPU recomendadas: NVIDIA Blackwell (probado en GB10 / DGX Spark). NVFP4 requiere una GPU de clase Blackwell; otras GPUs y versiones de vLLM no han sido probadas.
- Cabe en GPU de consumo: no confirmado. El tamaño de 18,2 GB encajaría teóricamente en GPUs de 24 GB, pero la dependencia de NVFP4 limita la compatibilidad a arquitecturas Blackwell, por lo que no se garantiza su funcionamiento en RTX 4090 (Ada Lovelace).
- Opciones de despliegue: vLLM 0.34.0 (imagen `vllm/vllm-openai:v0.34.0-aarch64`), comando `vllm serve alpha-x-ai/Hy-MT3-30B-A3B-NVFP4 --max-model-len 32768`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 58,1 tok/s en un flujo y 360 tok/s con 8 flujos concurrentes en una GB10 con TP=1 y 512 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-NVFP4 (este) | 30,06B | 32.768 (usado en servicio) | NVFP4 + FP8, safetensors compressed-tensors | Apache-2.0 | Hugging Face, vLLM |
| tencent/Hy-MT3-30B-A3B (bf16) | 30,06B | no disponible | bf16, safetensors | Apache-2.0 | Hugging Face |
| NVFP4 all-layers GPTQ (variante del barrido) | 30,06B | 32.768 | NVFP4 puro | Apache-2.0 | No publicada como repo independiente en la información disponible |
| Atención + compartido + todos los expertos FP8 (variante del barrido) | 30,06B | 32.768 | FP8 W8A8 | Apache-2.0 | No publicada como repo independiente en la información disponible |

No se dispone de datos de benchmarks estándar ni de otros modelos de traducción comparables en la información proporcionada, por lo que la comparación se limita a las variantes de cuantización del mismo modelo base evaluadas por el autor.

## Limitaciones y advertencias

- La evaluación se realizó sobre solo 112 ítems y una única GPU; las diferencias pequeñas de calidad o velocidad deben considerarse ruido estadístico.
- NVFP4 exige GPUs de clase Blackwell; no se ha probado en otras arquitecturas ni en versiones de vLLM distintas de 0.34.0, lo que restringe su portabilidad.
- La cuantización introduce degradación medible frente a bf16: KL de 0,0240, top-1 del 97,11 % y chrF del 91,33 %, con NLL de 0,0995 frente a 0,0767 en bf16.
- Riesgo de alucinación y de deriva en traducciones de dominios especializados no representados en la calibración (opus-100 y prosa técnica en inglés).
- La cobertura de evaluación se concentra en en↔ja, en↔zh y ja↔zh; el rendimiento en el resto de los 101 idiomas declarados no está cuantificado.
- No se documentan salvaguardas, filtros de contenido ni evaluaciones de sesgo; el modelo podría reproducir sesgos presentes en los datos del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo original; el archivo LICENSE.txt es el del modelo base.
- El repositorio tiene 1 descarga y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/alpha-x-ai/Hy-MT3-30B-A3B-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Licencia del modelo base: https://huggingface.co/alpha-x-ai/Hy-MT3-30B-A3B-NVFP4/blob/main/LICENSE.txt
- Dataset de evaluación y calibración (opus-100): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
