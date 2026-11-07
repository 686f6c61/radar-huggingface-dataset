# Minguinho-zeze/Qwen3-8B-NVFP4A16-RTN

## Resumen

Qwen3-8B-NVFP4A16-RTN es un checkpoint cuantizado del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigación lowbit-reasoning-ptq. Se trata de una cuantización post-entrenamiento de solo pesos (weight-only) en formato NVFP4 con activaciones en 16 bits (W4A16), aplicada mediante el algoritmo RTN (round-to-nearest) con grupo de tamaño 16. No se realizó entrenamiento adicional ni calibración. El modelo base es un transformer denso de 8.190.735.360 parámetros.

El interés de esta ficha reside en que evalúa el impacto de la cuantización de 4 bits en tareas de razonamiento con modo thinking activado, sobre GPUs Blackwell. Los resultados publicados muestran una degradación medible pero moderada respecto al BF16 en AIME-120 y GPQA Diamond, lo que lo convierte en un punto de referencia útil para quienes estudian cuantización de bajo bit en modelos de razonamiento.

El repositorio tiene unas 0 descargas y 0 likes en el momento de la consulta, y ocupa 6,4 GB. La licencia es Apache-2.0, heredada del modelo base Qwen3-8B. No es un release GGUF ni AutoAWQ: está pensado exclusivamente para vLLM con el formato compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B), cuantizado en formato compressed-tensors NVFP4A16 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 34.816 tokens en la configuración de ejemplo del autor (max_model_len); el contexto nativo del base Qwen3-8B no se detalla en la información disponible |
| Tipos de cuantizacion | NVFP4 pesos (W4A16), grupo de tamaño 16, RTN; embeddings, normalización y lm_head sin cuantizar; fracción de parámetros cuantizados 84,800291 % |
| Idiomas soportados | No disponible en la ficha del checkpoint; el modelo base Qwen3-8B es multilingüe según su model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-8B, un transformer denso de la familia Qwen3, que incluye modos de razonamiento (thinking) e instrucción, soporte de agentes y capacidades multilingües según la documentación upstream. Sobre ese modelo se aplicó una cuantización post-entrenamiento de solo pesos: pesos en NVFP4 con activaciones en 16 bits, agrupación de 16 elementos y algoritmo RTN. No hubo calibración, ya que la cuantización weight-only RTN no la requiere. Las capas de embedding, normalización y lm_head quedaron sin cuantizar. La caché KV se mantuvo en BF16 durante la evaluación.

No se realizó entrenamiento adicional, RLHF ni DPO en este checkpoint; es una transformación puramente de compresión. El autor documenta el experimento en el repositorio lowbit-reasoning-ptq, con run ID `qwen3-8b__nvfp4a16__rtn`, y proporciona recipe.yaml, quant_meta.json y config.json con los ajustes exactos y versiones del cuantizador. La evaluación se ejecutó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500). El autor advierte que otras GPUs, kernels y combinaciones de paquetes no han sido validadas.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredadas del modelo base Qwen3-8B.
- Razonamiento en modo thinking, con presupuesto de salida configurable (la evaluación usó 32.768 tokens).
- Razonamiento matemático y científico: el checkpoint fue evaluado en AIME-120 y GPQA Diamond.
- Soporte de tool calling y function calling: capacidad del base Qwen3-8B según su model card; no se valida específicamente en este checkpoint cuantizado.
- Capacidades de agente y razonamiento multi-paso: atribuibles al base, sin validación específica en esta cuantización.
- Multilingüismo: el base Qwen3-8B lo declara; la ficha del checkpoint no enumera idiomas.
- No se documentan capacidades de visión ni audio en este checkpoint.

## Casos de uso

- Evaluación de cuantización de bajo bit en razonamiento: usar este checkpoint como referencia para medir la pérdida de precisión de NVFP4 frente a BF16 en tareas como AIME y GPQA, replicando el protocolo del autor (temperatura 0,6, top-p 0,95, 32.768 tokens de salida).
- Despliegue de razonamiento matemático en GPUs Blackwell con VRAM limitada: el formato W4A16 reduce el peso de los pesos a 4 bits manteniendo activaciones en 16 bits, lo que permite servir Qwen3-8B en vLLM con menor huella de memoria que BF16.
- Investigación en pipelines de compresión: servir como punto de partida para comparar RTN con otros algoritmos de cuantización (GPTQ, AWQ) sobre el mismo modelo base y el mismo conjunto de evaluación.
- Generación de código asistida: el base Qwen3-8B está orientado a instrucciones y código; este checkpoint puede integrarse en flujos de autocompletado o revisión, siempre que se valide la calidad tras la cuantización.
- Atención al cliente multi-turno: con una ventana configurada de 34.816 tokens y caché KV en BF16, puede gestionar conversaciones largas, aunque el autor no valida esta carga de trabajo específica.
- Prototipado de agentes con tool calling en vLLM: aprovechar el soporte del base para function calling y el backend compressed-tensors para orquestar llamadas a herramientas, con la advertencia de que la cuantización puede afectar a la fiabilidad del formato de las llamadas.

## Benchmarks y rendimiento

Datos publicados por el autor, en porcentaje de acierto, promediados sobre semillas 0, 1 y 2. Cada semilla evalúa 120 preguntas de AIME y 198 de GPQA Diamond; las semillas repetidas son generaciones repetidas de las mismas preguntas. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4A16-RTN) | 66,39 | 56,40 |

Estos resultados describen el protocolo del autor y no son puntuaciones oficiales de Qwen. El autor señala que las ejecuciones usaron RTX 5090 y RTX PRO 4500 Blackwell, y que las pequeñas diferencias no deben atribuirse únicamente a los algoritmos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,4 GB en safetensors; con overhead de runtime, caché KV en BF16 y contexto de 34.816 tokens, la VRAM efectiva será superior y depende de la longitud de secuencia.
- GPUs recomendadas: el autor validó RTX 5090 y RTX PRO 4500 Blackwell. Otras GPUs, kernels y combinaciones de paquetes no han sido validadas por el release.
- Cabe en GPU consumer: sí, en GPUs Blackwell con suficiente VRAM; el autor no detalla el mínimo exacto.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 (ruta validada). No es compatible como GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y formatos derivados no están soportados por este release.
- Latencia y throughput: no disponibles en la información proporcionada; el autor enlaza métricas de velocidad en el repositorio del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (BF16) | 8,19 B | No detallado en la información disponible | safetensors | Apache-2.0 | Hugging Face (Qwen/Qwen3-8B) |
| Este checkpoint (NVFP4A16-RTN) | 8,19 B | 34.816 tokens en la config de ejemplo | safetensors compressed-tensors | Apache-2.0 | Hugging Face (Minguinho-zeze) |
| Virtudant-AI/Qwen3-8B | 8 B (según la búsqueda) | No disponible | No disponible | No disponible | Hugging Face (Virtudant-AI) |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, salvo el BF16 del propio autor, por lo que la comparación de rendimiento se limita a la tabla de benchmarks anterior.

## Limitaciones y advertencias

- Degradación medible por cuantización: −5,0 puntos en AIME-120 y −4,71 puntos en GPQA Diamond respecto al BF16 en el protocolo del autor.
- Validación restringida a GPUs Blackwell (RTX 5090, RTX PRO 4500) y a versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; no se garantiza el comportamiento en otras configuraciones.
- No es un release GGUF ni AutoAWQ: no puede cargarse con llama.cpp, Ollama ni herramientas que esperen esos formatos.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta ficha.
- Sesgos del modelo base no evaluados en este checkpoint; la cuantización puede ampliar o alterar sesgos existentes sin que el autor lo documente.
- Idiomas soportados no declarados en la ficha del checkpoint; deben tomarse de la model card del base Qwen3-8B.
- Resultados de benchmarks no oficiales: describen el protocolo del autor y no deben compararse directamente con puntuaciones de Qwen publicadas con otros ajustes.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4A16-RTN
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Alternativa comunitaria: https://huggingface.co/Virtudant-AI/Qwen3-8B
