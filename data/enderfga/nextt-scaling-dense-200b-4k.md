# Enderfga/nextt-scaling-dense-200b-4k

## Resumen

nextt-scaling-dense-200b-4k es un modelo de lenguaje decoder-only de tipo dense desarrollado por Enderfga como parte del proyecto NextTransformer. Se trata de una ejecución de referencia ("reference run") de la fase de escalado del protocolo `nextt-scale-200b-4k-v1`, entrenada sobre 200.000 millones de tokens con una longitud de contexto de 4.096 tokens. El modelo cuenta con aproximadamente 4.990 millones de parámetros totales, de los cuales 3.150 millones corresponden a los bloques transformer y el resto a embeddings de tokens y de valores.

El modelo no está pensado como una entrada de leaderboard ni como un producto listo para producción, sino como un registro reproducible de un experimento de escalado. Su relevancia radica en que documenta de forma explícita la receta de entrenamiento (Muon + AdamW, warmdown del 65 %, escalado de learning rate con el batch), el dataset (una versión fija de ClimbMix tokenizada con un vocabulario de 32.768 entradas) y los resultados de validación (0,5748 bits por byte y 0,4618 en CORE sobre 22 tareas). Para investigadores interesados en dinámicas de escalado y reproducibilidad, constituye un punto de referencia útil.

La arquitectura es un transformer dense estándar de 40 capas, anchura 2.560, 20 cabezas de atención y FFN de 10.240. No emplea mezcla de expertos ni mecanismos híbridos. La licencia MIT facilita su reutilización, aunque el formato de pesos es un único `model.pt` de PyTorch, lo que limita la integración directa con ecosistemas de inferencia como llama.cpp o vLLM sin conversión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only dense (40 capas, anchura 2.560, 20 cabezas, FFN 10.240) |
| Parametros totales | ~4,99B (3,15B en bloques transformer; resto en embeddings de tokens y de valores) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `model.pt`; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el tokenizer de 32.768 entradas sugiere un vocabulario limitado, probablemente centrado en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, checkpoint del paso 95.367 con configuraciones de modelo y entrenamiento; sin shards del optimizador) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only dense convencional: 40 capas, dimensión de modelo 2.560, 20 cabezas de atención y una capa feed-forward de anchura 10.240. El vocabulario es de 32.768 entradas. La model card menciona "value embeddings" como parte del cómputo de parámetros (aproximadamente 1,84B adicionales fuera de los bloques transformer), un detalle poco habitual que conviene tener en cuenta al analizar el reparto de parámetros, aunque no se describe en detalle su función.

El entrenamiento se realizó sobre una versión fija del dataset ClimbMix, tokenizado con el tokenizer de 32.768 entradas, durante 95.367 pasos con 2.097.152 tokens por paso, lo que suma aproximadamente 200.000 millones de tokens. La receta de optimización combina Muon y AdamW, con un warmdown del 65 % y un learning rate escalado con el tamaño de batch, siguiendo el protocolo compartido con la ejecución de 49B. No se menciona RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento. El run está registrado en Weights & Biases y el registro completo (hash de configuración e historial de evaluación) se conserva en el repositorio de GitHub del proyecto.

## Capacidades

- Generación de texto autoregresiva: modelo base de lenguaje sin ajuste instructivo documentado.
- Razonamiento y conocimiento general: evaluado mediante CORE sobre 22 tareas (puntuación 0,4618).
- Modelado de lenguaje medido en bits por byte sobre validación (0,5748).
- Capacidad de contexto limitada a 4.096 tokens; no se documenta extensión de contexto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tamaño del vocabulario (32.768) sugiere cobertura limitada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de escalado: el checkpoint y la configuración permiten replicar el run de 200B tokens y comparar curvas de pérdida y bits por byte con otras ejecuciones del protocolo NextTransformer.
- Investigación sobre recetas de optimización: sirve para estudiar el efecto de Muon + AdamW con warmdown del 65 % y escalado de learning rate por batch en modelos de ~5B parámetros.
- Baseline para experimentos de arquitectura: al ser un transformer dense canónico de 40 capas, es un punto de partida limpio para comparar variantes (MoE, atención lineal, híbridos SSM) bajo el mismo presupuesto de tokens.
- Estudio de tokenizers de vocabulario reducido: con 32.768 entradas, permite analizar el impacto del tamaño de vocabulario en eficiencia de tokenización y en bits por byte.
- Fine-tuning académico en dominios concretos: la licencia MIT y el tamaño (~5B) hacen viable ajustar el modelo en un único nodo de GPUs de 80 GB para tareas de clasificación o generación especializada.
- Evaluación de metodologías de medición: el registro de evaluación CORE y bits por byte facilita validar pipelines de evaluación internos contra resultados publicados.
- Docencia y formación: modelo de tamaño medio con receta completamente documentada, útil para explicar dinámicas de escalado y decisiones de entrenamiento en cursos de IA.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Bits por byte (validación final) | 0,5748 |
| CORE (22 tareas) | 0,4618 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que se trata de un registro de fase de escalado y no de una entrada de leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 10 GB solo para pesos (4,99B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB según longitud de secuencia.
- VRAM estimada en FP32: aproximadamente 20 GB solo para pesos.
- Cuantización a 8 bits: ~5 GB de pesos; a 4 bits: ~2,5 GB de pesos (requiere conversión manual, ya que no se publican variantes GGUF/AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para FP16 con contexto completo.
- ¿Cabe en GPU de consumo? Sí: en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits tras convertir los pesos.
- Opciones de despliegue: al publicarse solo `model.pt`, es necesario cargarlo con PyTorch y el código del repositorio NextTransformer; para vLLM, TGI o llama.cpp habría que convertir previamente los pesos a los formatos soportados (safetensors/GGUF), paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nextt-scaling-dense-200b-4k | ~4,99B | 4.096 | MIT | PyTorch (`model.pt`) | Run de escalado, sin benchmarks estándar publicados |
| Pythia-6.9B | 6,9B | 2.048 | Apache 2.0 | safetensors | Suite de escalado con checkpoints intermedios y benchmarks publicados |
| OLMo-7B | ~6,9B | 2.048 | Apache 2.0 | safetensors | Modelo abierto con datos y receta completos |
| GPT-NeoX-20B | 20B | 2.048 | Apache 2.0 | safetensors | Referencia de escalado de mayor tamaño |

La comparación con alternativas es aproximada: no se dispone de resultados de benchmarks comunes que permitan situar el rendimiento del modelo frente a Pythia u OLMo. La principal diferencia es la ausencia de benchmarks estándar y de formatos de despliegue listos para usar, frente a la madurez de las suites citadas.

## Limitaciones y advertencias

- Modelo base sin alineación: no se documenta ajuste instructivo, RLHF ni DPO, por lo que no es adecuado para uso conversacional directo sin fine-tuning.
- Riesgo de alucinación: inherente a un modelo de lenguaje preentrenado sin salvaguardas; no se documentan filtros ni evaluaciones de seguridad.
- Sesgos: no se documenta composición del dataset ClimbMix ni análisis de sesgos; se desconoce la distribución lingüística y demográfica del corpus.
- Idiomas: no se especifican idiomas soportados; el vocabulario de 32.768 entradas sugiere un rendimiento limitado fuera del inglés.
- Contexto corto: 4.096 tokens es reducido frente a los estándares actuales (32K-128K), lo que limita tareas de documento largo o conversaciones extensas.
- Formato de pesos: `model.pt` único sin cuantizaciones publicadas; requiere conversión manual para vLLM, llama.cpp u Ollama, con riesgo de incompatibilidades.
- Sin shards del optimizador: no es posible reanudar el entrenamiento desde el checkpoint publicado.
- Licencia MIT: permite uso comercial, pero al ser un modelo base sin garantías, el usuario asume la responsabilidad de evaluar su idoneidad y de cumplir normativas aplicables.
- Reproducibilidad parcial: aunque se publica el hash de configuración y el run de W&B, la versión exacta de ClimbMix y los detalles del tokenizer no se detallan en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Enderfga/nextt-scaling-dense-200b-4k
- Repositorio GitHub: https://github.com/Interactive-Active-AI/NextTransformer
- Run de Weights & Biases: https://wandb.ai/nextt/nexttransformer-scaling/runs/bd78b197
