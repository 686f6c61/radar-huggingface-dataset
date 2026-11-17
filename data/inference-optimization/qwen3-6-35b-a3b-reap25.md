# inference-optimization/Qwen3.6-35B-A3B-REAP25

## Resumen

Qwen3.6-35B-A3B-REAP25 es una variante podada estructuralmente del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollada por el colectivo inference-optimization. El modelo conserva la arquitectura MoE (mixture of experts) original, pero elimina el 25 % de los expertos de cada una de sus 40 capas MoE mediante la técnica REAP (Router-weighted Expert Activation Pruning), una metodología de poda que no requiere gradientes ni entrenamiento de recuperación. El resultado es un modelo de 27.893.516.144 parámetros reales en safetensors, frente a los 35B nominales del modelo base.

La relevancia de esta ficha reside en que demuestra un flujo de compresión de modelos MoE de gran tamaño que reduce el peso en disco y los requisitos de memoria sin tocar los pesos de atención, la torre de visión, los embeddings ni los expertos compartidos, que permanecen en BF16. Está pensado para despliegue en vLLM y conserva la pipeline image-text-to-text del modelo original, por lo que mantiene capacidades multimodales.

La información pública disponible es escasa: la model card se limita a describir el proceso de poda y el uso básico con transformers, y no incluye datos de benchmarks, idiomas soportados ni resultados de evaluación comparativa. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y la model card, marcando como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tipo qwen3_5_moe), con torre de visión y capa MTP |
| Parametros totales | 27.893.516.144 (safetensors); modelo base nominal 35B-A3B |
| Parametros activos | no disponible (el modelo base es A3B, pero el autor no publica el recuento activo tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ en la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer MoE multimodal con 40 capas MoE, cada una con 256 expertos en el original. La poda REAP reduce cada capa a 192 expertos (64 eliminados por capa; 7.680 retenidos de 10.240 en total). La selección es uniforme entre capas: se eliminan los 64 expertos con menor saliencia REAP en cada capa y los routers se recortan en consecuencia. El `config.json` registra `num_experts: 192` y los índices de experto se remapean de forma contigua. La capa MTP (`mtp.layers.0`) no se calibró y queda intacta. Todos los pesos restantes (atención, torre de visión, embeddings y expertos compartidos) se mantienen en BF16.

El criterio REAP puntúa cada experto mediante la media ponderada por router de las normas de activación de su salida sobre los tokens de calibración enrutados a él, `S_j = mean(g_j * ||f_j||_2)`, usando solo cómputo forward, sin gradientes ni entrenamiento de recuperación. La calibración se realizó sobre las 2.048 muestras del corpus multidisciplinar RazorCal. El proceso se ejecutó con llmcompressor; los scripts de calibración y poda están publicados en el ejemplo de REAP expert pruning del repositorio de vLLM. No se documenta en la model card ningún dato sobre tokens de entrenamiento del modelo base, composición del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text: mantiene la torre de visión intacta, por lo que conserva la capacidad multimodal del original.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card, pero previsible por herencia del modelo base; no verificable con la información disponible.
- Razonamiento multi-paso y uso como agente: no documentado en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está publicado).
- Modo thinking: no disponible en la información proporcionada.
- Compatibilidad con endpoints y despliegue en vLLM, según los tags del repositorio.

## Casos de uso

- Despliegue multimodal en producción con vLLM: el modelo conserva la pipeline image-text-to-text y está empaquetado con compressed-tensors, lo que permite servirlo en vLLM con menor huella de memoria que el original de 35B, útil para entornos con VRAM ajustada.
- Inferencia en GPUs de gama alta con presupuesto de memoria limitado: al reducir los parámetros reales a ~27,9B, cabe en configuraciones donde el modelo base de 35B no entraría, manteniendo la torre de visión y los expertos compartidos en BF16.
- Experimentación en investigación sobre poda de MoE: sirve como referencia reproducible del flujo REAP con llm-compressor, calibrado sobre RazorCal, para comparar la pérdida de calidad frente al modelo sin podar.
- Evaluación comparativa de modelos comprimidos: útil para medir el impacto de eliminar el 25 % de expertos en tareas multimodales y de razonamiento, siempre que se ejecuten los benchmarks propios, ya que el autor no los publica.
- Prototipado de asistentes conversacionales con entrada de imagen: la pipeline image-text-to-text permite construir demos de descripción de imágenes o respuesta a preguntas visuales sobre el modelo podado.
- Fine-tuning posterior y destilación: al mantener atención, embeddings y expertos compartidos intactos en BF16, el modelo es un punto de partida razonable para ajuste fino específico de dominio sobre la variante comprimida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base sin podar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 56 GB solo para pesos (27,9B parámetros × 2 bytes), más overhead de KV cache y activaciones; el tamaño del repo es de 55,8 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16. En GPUs consumer de 24 GB no cabe en BF16 sin cuantización adicional.
- Cabe en consumer GPU: no en BF16; requeriría cuantización (no documentada por el autor) para GPUs de 24-48 GB.
- Opciones de despliegue: vLLM (soportado según los tags y el ecosistema compressed-tensors); transformers con `Qwen3_5MoeForConditionalGeneration` y `AutoProcessor`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-REAP25 | 27,9B reales (192 expertos/capa) | no disponible | Apache 2.0 | Variante podada al 25 % con REAP |
| Qwen/Qwen3.6-35B-A3B (base) | 35B nominales (256 expertos/capa) | no disponible | Apache 2.0 | Modelo original sin podar |
| Alternativas de poda MoE comparables | no disponible | no disponible | no disponible | No se identifican en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con el modelo base ni con otras variantes podadas.

## Limitaciones y advertencias

- La poda elimina el 25 % de los expertos por capa; el autor no publica evaluaciones que cuantifiquen la degradación de calidad frente al modelo base.
- La capa MTP no fue calibrada ni podada, lo que puede generar inconsistencias si se usa decodificación especulativa con esa capa.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe específico de esta variante.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del modelo.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base enlazada en la model card.
- Ausencia de benchmarks publicados: no es recomendable desplegarlo en producción sin una evaluación propia previa.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference-optimization/Qwen3.6-35B-A3B-REAP25
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Dataset de calibración RazorCal: https://huggingface.co/datasets/inference-optimization/RazorCal
- Ejemplo de poda REAP en llm-compressor: https://github.com/vllm-project/llm-compressor/tree/main/examples/reap_expert_pruning
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
