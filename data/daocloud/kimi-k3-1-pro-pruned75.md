# DaoCloud/Kimi-K3.1-Pro-pruned75

## Resumen
Kimi-K3.1-Pro-pruned75 es un checkpoint derivado del modelo multimodal Moonshot Kimi-K3.1-Pro, publicado por DaoCloud. Se trata de una poda de expertos enrutados (expert pruning) aplicada sobre la arquitectura MoE del modelo original: se eliminan el 75% de los expertos enrutados de cada capa, conservando 224 de los 896 originales. La poda es "calibration-free", es decir, no utiliza datos de calibración para decidir qué expertos eliminar, sino que ordena los expertos por la suma con signo de los pesos del router (`sum(router.weight[i])`) de forma independiente en cada capa.

El modelo está pensado para servir con vLLM y para pruebas de humo de evaluación, no para producción. El propio autor lo describe como un prototipo experimental con una regresión de calidad grande respecto al modelo fuente. No es un checkpoint podado con REAP ni con calibración, que es una línea de trabajo separada.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión de MoE de forma reproducible; por otro, sirve de referencia sobre los límites de la poda sin calibración, ya que el rendimiento en GSM8K cae hasta el 35,33% de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de expertos en MXFP4 (copiados con su escala y empaquetado intactos, sin dequantizar); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1 Pro License (other), heredada del modelo base |
| Formato de pesos | safetensors (96 shards, indice de pesos incluido) |

Otros datos tecnicos relevantes: expertos por capa MoE en el modelo fuente, 896; expertos retenidos, 224 (25%); tamano en disco, aproximadamente 443 GB.

## Arquitectura y entrenamiento
El modelo base es un transformer MoE multimodal de Moonshot, con capas de atención, mecanismo DSA/indexer, proyecciones latentes up-down, un MLP denso en la primera capa, expertos compartidos (shared experts) y pesos de visión. La poda aplicada por DaoCloud solo modifica los expertos enrutados: elimina el 75% de ellos y compacta los índices de router y de expertos, actualizando `num_experts` a 224. El resto de componentes (MLP denso de primera capa, expertos compartidos, atención, DSA/indexer, proyecciones latentes, pesos de visión y tokenizer) queda intacto.

No se ha realizado ningún entrenamiento adicional ni ajuste fino posterior a la poda; el checkpoint se genera exclusivamente eliminando tensores y filas del router. No hay datos de calibración, ni de composición del dataset de entrenamiento original, ni de fases de RLHF/DPO en la información disponible. La innovación técnica destacable es precisamente el método de ranking de expertos por suma con signo de los pesos del router, sin calibración, y la preservación del empaquetado MXFP4 de los pesos de expertos supervivientes.

## Capacidades
- Generación de texto y razonamiento de propósito general, heredados del modelo base, aunque con degradación significativa por la poda.
- Procesamiento de imagen y texto (pipeline image-text-to-text), ya que los pesos de visión no se han modificado.
- Matemáticas básicas: el checkpoint obtiene un 35,33% en GSM8K, lo que indica capacidad limitada en razonamiento aritmético multi-paso.
- Servicio compatible con vLLM mediante el loader por defecto y `--trust-remote-code`.
- Compatibilidad con endpoints OpenAI (`/v1/models`, `/v1/completions`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Pruebas de humo de despliegue en vLLM: sirve para validar pipelines de serving, configuración de tensor parallelism y endpoints OpenAI antes de desplegar el modelo completo, ya que ocupa aproximadamente 443 GB en disco y unos 127.797 MiB por GPU con TP=8 en H200.
- Evaluación comparativa de técnicas de poda: permite medir la caída de calidad de una poda sin calibración frente a métodos con calibración como REAP, usando el mismo harness de GSM8K (5-shot, `max_tokens=256`, `temperature=0`, `seed=42`).
- Investigación sobre enrutamiento MoE: al conservar el router compactado y los índices remapeados, es útil para estudiar el comportamiento del enrutamiento tras eliminar el 75% de los expertos.
- Benchmarking de infraestructura: con un tamaño menor que el modelo fuente, permite medir throughput y latencia (2,438 preguntas/s en GSM8K en la configuración validada) en clústeres de 8 GPU sin necesidad de reservar recursos para el modelo completo.
- Desarrollo de herramientas de compresión: sirve como caso de referencia para implementar poda de expertos en llm-compressor u otras librerías, comparando resultados con y sin calibración.
- Docencia y divulgación técnica: ilustra de forma concreta el impacto de la poda agresiva en un MoE multimodal, con métricas reproducibles y comandos de despliegue documentados.

## Benchmarks y rendimiento

| Checkpoint | GSM8K (accuracy) | Correctas | Invalidas | Latencia | Preguntas/s |
|---|---:|---:|---:|---:|---:|
| Kimi-K3.1-Pro-pruned75 | 35,3298% | 466/1319 | 0/1319 | 541,028 s | 2,438 |
| mgoin/Kimi-K3-pruned75 (referencia) | 34,4200% | 454/1319 | 0/1319 | no disponible | no disponible |

Condiciones de evaluación del checkpoint principal: split de test completo de GSM8K (1.319 preguntas), 5-shot, `max_tokens=256`, `temperature=0`, `seed=42`, servidor local compatible con OpenAI `/v1/completions`. El resultado de referencia corresponde a un modelo base distinto y a hardware distinto, por lo que la comparación no es estrictamente equivalente. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 127.797 MiB por GPU en la configuración validada con TP=8 en 8x NVIDIA H200 (unos 125 GB por GPU).
- GPU recomendadas: 8x NVIDIA H200 en un solo nodo con tensor parallelism 8; no se documentan otras configuraciones validadas.
- GPU de consumo: no cabe en GPU de consumo. El tamano en disco de aproximadamente 443 GB y la VRAM por GPU observada descartan RTX 4090 y similares.
- Opciones de despliegue: vLLM con el loader por defecto, `--tensor-parallel-size 8`, `--trust-remote-code`, `--served-model-name kimi-k3.1-pro-pruned75`, `--host 0.0.0.0`, `--port 8000`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: en GSM8K, 541,028 s para 1.319 preguntas y 2,438 preguntas/s en la configuración de 8x H200 con TP=8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-pruned75 (DaoCloud) | no disponible (224 expertos/capa) | no disponible | 35,3298% | Kimi K3.1 Pro License | HuggingFace, safetensors |
| Kimi-K3.1-Pro (Moonshot, base) | no disponible (896 expertos/capa) | no disponible | no disponible | Kimi K3.1 Pro License | HuggingFace |
| mgoin/Kimi-K3-pruned75 | no disponible (75% de expertos eliminados) | no disponible | 34,4200% | no disponible | HuggingFace |

La comparación con el modelo base no es posible en términos de rendimiento porque no se han publicado resultados de benchmarks del Kimi-K3.1-Pro original en la información disponible. La referencia a mgoin/Kimi-K3-pruned75 emplea un modelo base distinto y hardware distinto, por lo que solo sirve como orientación metodológica.

## Limitaciones y advertencias
- Regresión de calidad grande respecto al modelo fuente, reconocida explícitamente por el autor; no debe usarse en producción.
- Poda sin calibración: el ranking por `sum(router.weight[i])` no garantiza preservar los expertos más útiles para tareas concretas.
- Rendimiento bajo en matemáticas: 35,33% en GSM8K, insuficiente para aplicaciones de razonamiento aritmético fiables.
- Riesgo elevado de alucinación y de respuestas incoherentes por la eliminación masiva de expertos.
- No es un checkpoint REAP ni calibrado; la comparación con métodos con calibración requiere evaluación separada.
- Licencia "other" (Kimi K3.1 Pro License): es necesario revisar el texto de la licencia upstream para uso comercial y para modelos derivados.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible.
- Requiere hardware de gama alta (8x H200) para el despliegue validado; no cabe en GPU de consumo.
- Solo se ha validado el despliegue con vLLM; no hay garantías con otros motores de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; soporte comunitario nulo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/DaoCloud/Kimi-K3.1-Pro-pruned75
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Checkpoint de referencia de poda: https://huggingface.co/mgoin/Kimi-K3-pruned75
- REAP en llm-compressor (PR): https://github.com/vllm-project/llm-compressor/pull/2980/
