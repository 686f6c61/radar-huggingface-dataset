# NextTransformer/NSA-49B-Tokens

## Resumen

NextTransformer NSA es un checkpoint de investigación de tipo causal-LM desarrollado por NextTransformer (organización Interactive-Active-AI) como parte de una comparativa de arquitecturas entrenadas sobre 49.152B tokens. El modelo implementa Native Sparse Attention (NSA), una variante que combina en paralelo atención comprimida, atención selectiva y atención de ventana deslizante, fusionando las tres ramas mediante compuertas (gates). Con 1.381.293.832 parámetros y una longitud de contexto de 2.048 tokens, no es un modelo de producción sino una pieza de un estudio comparativo de métodos de atención.

El "49B" del nombre del repositorio se refiere al presupuesto de entrenamiento en tokens (49.152B), no al número de parámetros. El modelo fue preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones y reporta una perplejidad en validación de 0.6651 BPB y una puntuación CORE-22 de 33.78 (escala ×100).

Su relevancia es principalmente metodológica: permite evaluar empíricamente el rendimiento de NSA frente a otras variantes de atención bajo un mismo presupuesto de cómputo. El autor advierte explícitamente que la auditoría de cómputo independiente del run de entrenamiento sigue pendiente, y que la configuración no cubre compresión solapada arbitraria ni tamaños de bloque desiguales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Native Sparse Attention (NSA): atención comprimida + selectiva + ventana deslizante en paralelo, fusionadas por gates |
| Parametros totales | 1.381.293.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), config en `model_config.json`, tokenizer tiktoken (`tokenizer.tiktoken.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que sustituye la atención estándar por Native Sparse Attention. Las tres ramas (compresión aprendida, selección de bloques y ventana deslizante) se ejecutan en paralelo y se combinan mediante gates. Tanto la rama de compresión como la de selección operan sobre bloques de 32 tokens en esta adaptación "nativa" definida explícitamente por el autor. El autor subraya que las tres ramas deben contabilizarse en el cómputo total, y que esta configuración no contempla compresión solapada arbitraria ni bloques de tamaño desigual.

El preentrenamiento se realizó sobre el dataset ClimbMix durante 46.875 actualizaciones, con un presupuesto total de 49.152B tokens. No se documenta en la información disponible si hubo fases de RLHF, DPO o ajuste fino supervisado; el checkpoint es de tipo "pretrained". El tokenizer es de tipo tiktoken con tokens especiales como `<|bos|>`. El autor indica que el registro del run reporta el entrenamiento completado y la auditoría acumulada de cómputo del trainer, pero que la auditoría independiente de solo lectura sigue pendiente.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Modelo causal-LM de base, sin ajuste instructivo documentado.
- Predicción del siguiente token sobre prompts codificados con su tokenizer tiktoken.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación comparativa de mecanismos de atención: sirve como checkpoint de referencia para medir el impacto de NSA frente a atención densa bajo un mismo presupuesto de 49.152B tokens, usando las métricas BPB y CORE-22 reportadas.
- Reproducción de experimentos académicos: el script de carga incluido permite reconstruir el modelo en CPU con `nexttransformer` y `safetensors`, facilitando la verificación de resultados en entornos sin GPU.
- Estudio de eficiencia de cómputo en atención dispersa: al exigir contabilizar las tres ramas en el ledger de cómputo, es útil para analizar el coste real de NSA frente a alternativas.
- Generación de texto de dominio general a pequeña escala: con 1.38B parámetros y contexto de 2.048 tokens, puede emplearse para experimentos de continuación de texto sobre ClimbMix en entornos de laboratorio.
- Base para ajuste fino experimental: al ser un checkpoint "pretrained" con pesos en safetensors, puede servir como punto de partida para estudios de fine-tuning sobre tareas concretas.
- Docencia y divulgación de arquitecturas sparse: su implementación explícita y su configuración acotada lo hacen adecuado para explicar cómo se combinan compresión, selección y ventana deslizante.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0.6651 |
| CORE-22 (×100) | 33.78 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.381.293.832 parámetros en fp32, el peso ocupa aproximadamente 5,5 GB; en fp16/bf16, unos 2,8 GB; en int8, unos 1,4 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- El ejemplo oficial de carga se ejecuta en CPU (`CUDA_VISIBLE_DEVICES=""`), por lo que el modelo es viable sin GPU.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo con 8 GB o más en fp16.
- Opciones de despliegue: la única vía documentada es la librería `nexttransformer` (instalada desde el repositorio GitHub en el commit `b2ea466`) junto con `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Contexto muy limitado: 2.048 tokens, insuficiente para la mayoría de aplicaciones de producción con documentos largos o conversaciones multi-turno extensas.
- Es un checkpoint de investigación preentrenado, no ajustado para instrucciones; no se debe esperar comportamiento de asistente.
- La auditoría de cómputo independiente del run de entrenamiento está pendiente según el propio autor.
- La configuración no cubre compresión solapada arbitraria ni tamaños de bloque desiguales; las tres ramas deben incluirse en el cómputo.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente fuera del dominio de ClimbMix.
- Riesgo de alucinación inherente a un modelo de lenguaje de base sin alineamiento documentado.
- Sesgos conocidos: no documentados, pero probables al derivarse de un corpus de preentrenamiento no descrito en detalle.
- Dependencia de una implementación concreta (`nexttransformer` en un commit fijo); la compatibilidad con ecosistemas estándar no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/NSA-49B-Tokens
- Arquitectura (GitHub): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/nsa.json
- Registro del run: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/nsa.json
- Repositorio de implementación: https://github.com/Interactive-Active-AI/NextTransformer.git
