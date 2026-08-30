# bench-labs/cagliostro-v2

## Resumen

cagliostro-v2 es un modelo de lenguaje pequeño (SLM) de 150 millones de parámetros desarrollado por bench-labs (Cagliostro Labs), una comunidad virtual de investigación en IA. Se trata de la segunda versión de la familia cagliostro, entrenada desde cero sobre 50 000 millones de tokens con una mezcla de datos educativos y de alta calidad. El modelo está diseñado para ofrecer un rendimiento competitivo en tareas de razonamiento y comprensión del lenguaje con un coste computacional reducido, lo que lo hace adecuado para entornos con recursos limitados.

Arquitectónicamente es un transformer decoder causal con atención por grupos de queries (GQA), incrustaciones compartidas y normalización RMSNorm. Incorpora dos innovaciones que no añaden parámetros: *Exclusive Self Attention* (XSA), que elimina la componente redundante de cada cabeza de atención respecto a su propio vector de valor, y *soft-capping* de logits con un valor máximo de 15. Según la model card, estas técnicas mejoran la pérdida en una cantidad medible y se validaron mediante ablaciones controladas.

La relevancia de cagliostro-v2 reside en su eficiencia de tokens: alcanza un índice de inteligencia SLM de 19.99, comparable al de un checkpoint interno de 70 000 millones de tokens, pero utilizando 20 000 millones menos de tokens de entrenamiento. Además, supera a su predecesor cagliostro-v1 en cuatro de seis componentes evaluados. El modelo se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con GQA, RoPE, SwiGLU, RMSNorm y embeddings atados |
| Parametros totales | 150 038 400 (129 066 880 excluyendo embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder estándar con 30 capas, tamaño oculto de 640, 10 cabezas de atención y 5 cabezas KV (GQA). La capa MLP tiene un tamaño oculto de 1600 con activación SwiGLU. La codificación posicional usa RoPE con theta 100 000, y las embeddings son compartidas entre entrada y salida. Se añaden dos mecanismos sin parámetros adicionales: *Exclusive Self Attention* (XSA), que elimina la proyección de cada cabeza sobre su propio vector de valor para evitar redundancia en el flujo residual, y *soft-capping* de logits con `cap * tanh(logits / cap)` con cap=15. Ambos están implementados en el código de modelado incluido en el repositorio, por lo que se requiere `trust_remote_code` para cargarlos correctamente.

El entrenamiento se realizó sobre 50 000 millones de tokens con una mezcla de FineWeb-Edu (57.6 %), DCLM-baseline (38.4 %) y Cosmopedia (4 %). Se utilizó el optimizador AdamW con betas 0.9/0.95 y weight decay 0.1, una tasa de aprendizaje máxima de 1.5e-3 con un programa de calentamiento estable y decaimiento final del 15 %, y precisión bfloat16. El hardware empleado fueron 4 GPU RTX 5090 durante aproximadamente 40 horas, alcanzando un throughput de 348 000 tokens por segundo. La pérdida final fue de 2.8489. Se realizaron ablaciones en ejecuciones de 5 000 millones de tokens, de las cuales se mantuvieron XSA y el soft-capping, mientras que otras propuestas (capas canonical, residual de valor, ReLU cuadrado en MLP) se descartaron por falta de mejora neta.

## Capacidades

- Generación de texto causal: el modelo produce texto coherente y contextualmente relevante para su tamaño.
- Razonamiento de sentido común: muestra resultados en benchmarks como HellaSwag y PIQA, indicando cierta capacidad de inferencia pragmática.
- Comprensión lectora y respuesta a preguntas: evaluado en ARC-Easy y ARC-Challenge, supera el azar y mejora significativamente respecto a la versión anterior en ARC-Challenge.
- Aritmética básica: el componente ArithMark-3 del índice sugiere capacidad para resolver operaciones numéricas simples, aunque con margen de mejora.
- No se dispone de información sobre soporte de *tool calling*, capacidades de agente, visión, audio o *thinking mode* en la documentación proporcionada.
- Multilingüismo: no se especifican idiomas soportados; los datos de entrenamiento son principalmente en inglés, por lo que es probable que su rendimiento en otros idiomas sea limitado.

## Casos de uso

- Experimentación académica: por su tamaño reducido y código abierto, es útil para estudiar técnicas de entrenamiento eficiente, ablaciones y comparativas de arquitecturas en laboratorios con recursos limitados.
- Prototipado rápido: integrable en pipelines de transformers para validar ideas de generación de texto o clasificación antes de escalar a modelos mayores.
- Generación de texto en entornos edge: con 150M parámetros, puede ejecutarse en CPU o GPU de baja gama, permitiendo asistentes de escritura o generación de contenido corto en dispositivos sin conexión.
- Fine-tuning para tareas específicas: al ser un modelo base, puede ajustarse para clasificación de textos, análisis de sentimiento, extracción de entidades o generación de respuestas en dominios concretos con datasets pequeños.
- Evaluación de técnicas de inferencia: sirve como banco de pruebas para medir el impacto de cuantización, poda o destilación en modelos pequeños.
- Educación y divulgación: su licencia permisiva y su documentación detallada lo convierten en un recurso didáctico para enseñar arquitecturas transformer y metodologías de entrenamiento.

## Benchmarks y rendimiento

Los resultados presentados en la model card se obtuvieron con lm-eval a 0-shot acc_norm para HellaSwag, ARC y PIQA, y con bencharithmark-3 para ArithMark. El índice se calcula como `(N(HellaSwag,25) + N(CombinedARC,25) + N(PIQA,50) + 0.65*N(ArithMark,25)) / 3.65`, donde `N(v,c) = 100(v-c)/(100-c)`. Se reportan dos ejecuciones del nuevo modelo con valores 20.05 y 19.93, tomando como índice final la media de 19.99.

| Componente | cagliostro-v2 | cagliostro-v1 | run interno 70B |
|---|---|---|---|
| HellaSwag | 36.76 | 36.70 | 36.92 |
| ARC-Easy | 47.43 | 48.95 | 47.39 |
| ARC-Challenge | 28.58 | 26.19 | 25.43 |
| CombinedARC | 38.00 | 37.57 | 36.41 |
| PIQA | 65.67 | 65.34 | 65.29 |
| ArithMark-3 | 35.20 | 33.20 | 37.20 |
| **Índice** | **20.05 / 19.93 / 19.99 (media)** | 19.22 | 19.80 |

Nota: la model card indica que el run interno de 70B es un checkpoint no publicado con currículo escalonado y aritmética sintética, incluido solo como referencia. La comparación con v1 se hace contra la puntuación corregida (19.22) y no contra los valores publicados originalmente (17.85 y 19.13), que provenían de un harness interno desfasado.

## Requisitos de hardware

- Inferencia en CPU: viable gracias al tamaño de 150M parámetros; con cuantización de 8 bits o 4 bits, puede ejecutarse en un portátil sin GPU.
- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 300 MB, por lo que cabe en cualquier GPU moderna con más de 1 GB de VRAM. Con cuantización a 4 bits, el uso de memoria sería aún menor.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090 o incluso GPUs integradas; el entrenamiento se realizó en RTX 5090, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: compatible con la librería transformers (con `trust_remote_code`), y puede exportarse a GGUF para su uso con llama.cpp, Ollama o text-generation-webui.
- Latencia y throughput: no se proporcionan datos oficiales para inferencia; en una GPU moderna se espera una generación de decenas a cientos de tokens por segundo, y en CPU unos pocos tokens por segundo.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros SLM de tamaño similar en los mismos benchmarks. Como referencia general, modelos como SmolLM2-135M, Qwen2.5-0.5B o TinyLlama-1.1B son alternativas en el rango de 100M-1B parámetros, pero no se han evaluado con el mismo harness, por lo que no es posible establecer una comparación cuantitativa rigurosa. La siguiente tabla resume características conocidas de algunos de ellos:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cagliostro-v2 | 150M | 2048 | Apache 2.0 | Entrenado desde cero con innovaciones propias |
| SmolLM2-135M | 135M | 2048 | Apache 2.0 | Modelo base de HuggingFace, entrenado con datos diversos |
| Qwen2.5-0.5B | 500M | 32768 | Apache 2.0 | Mayor contexto y capacidad, pero más pesado |
| TinyLlama-1.1B | 1100M | 2048 | Apache 2.0 | Modelo más grande, entrenado con 3T tokens |

Se recomienda consultar el leaderboard de Open SLM Intelligence Index para obtener comparativas actualizadas si estuvieran disponibles públicamente.

## Limitaciones y advertencias

- El modelo requiere `trust_remote_code` para cargarse correctamente, ya que las innovaciones (XSA y soft-capping) no son visibles en el estado del diccionario y sin el código personalizado el modelo puntuaría al azar.
- Contexto limitado a 2048 tokens, lo que restringe su uso en tareas que necesiten ventanas largas.
- No se especifican los idiomas soportados; los datos de entrenamiento son predominantemente en inglés, por lo que el rendimiento en otros idiomas probablemente sea deficiente.
- Riesgo de alucinación y sesgos derivados de los datos de entrenamiento (FineWeb-Edu, DCLM, Cosmopedia), que aunque filtrados, pueden contener contenido tendencioso o factualmente incorrecto.
- No hay información sobre capacidades de *tool calling*, agentes o razonamiento multi-paso; su uso en aplicaciones de producción que requieran estas funciones no está validado.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las licencias de los datasets utilizados en el entrenamiento.
- Los benchmarks reportados son limitados y no cubren tareas como código, matemáticas avanzadas o comprensión multilingüe.

## Enlaces

- [Modelo en Hugging Face: bench-labs/cagliostro-v2](https://huggingface.co/bench-labs/cagliostro-v2)
- [Modelo anterior: bench-labs/cagliostro-v1](https://huggingface.co/bench-labs/cagliostro-v1)
- [Perfil de Cagliostro Labs en Hugging Face](https://huggingface.co/cagliostrolab)
- [Perfil de Cagliostro Labs en GitHub](https://github.com/CagliostroLab)
- [Paper de Exclusive Self Attention (arXiv:2603.09078)](https://arxiv.org/abs/2603.09078)
- [BenchGecko - Cagliostro Lab](https://benchgecko.ai/provider/cagliostrolab)
- [Leaderboard LLM (BenchLM)](https://benchlm.ai/)
