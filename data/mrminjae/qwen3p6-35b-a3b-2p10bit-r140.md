# mrminjae/qwen3p6-35b-a3b-2p10bit-r140

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r140` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba. La aportación de este checkpoint no es un reentrenamiento, sino una cuantización selectiva: únicamente los expertos enrutados (routed experts) se almacenan a una media de 2,10 bits por peso, mientras que el resto de los pesos (atención, embeddings, router, capas densas) permanece en BF16. El resultado se guarda de forma desnormalizada en tensores BF16, de modo que carga con `transformers` y vLLM sin necesidad de kernels de cuantización especiales.

El modelo resuelve un problema práctico de despliegue: un MoE de 35B parámetros totales con aproximadamente 3B parámetros activos por token ocupa mucho menos espacio en disco y en VRAM al comprimir solo los expertos, que son la mayor parte del peso. Al mantener el resto en BF16, se preserva la estabilidad numérica de las partes críticas del grafo (atención y router) y se evita degradar el enrutamiento, que es el punto más sensible de un MoE cuantizado de forma agresiva.

Es relevante ahora porque demuestra una vía intermedia entre la cuantización uniforme de 4 bits y las técnicas de cuantización extrema (1-2 bits) con kernels propietarios: el checkpoint se distribuye como pesos BF16 estándar y es compatible con `transformers` y vLLM de serie. Se trata, sin embargo, de un checkpoint de investigación interna (ID r140), con cero descargas y sin model card detallada, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35B (según nomenclatura del modelo base) |
| Parametros activos | ~3B por token (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Routed experts a ~2,10 bits de media; resto de pesos en BF16; pesos almacenados desnormalizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sigue la licencia del modelo base (no especificada en la información disponible) |
| Formato de pesos | Tensores BF16 compatibles con `transformers` y vLLM (no se indica safetensors ni GGUF explícitamente) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE) dispersas, según la nomenclatura del modelo base Qwen3.6-35B-A3B: 35B parámetros totales con aproximadamente 3B activos por token. La innovación de este checkpoint es puramente de compresión, no de entrenamiento: los expertos enrutados se cuantizan a una media de 2,10 bits por peso, mientras que todos los demás componentes (atención, embeddings, capa de enrutamiento y cualquier capa densa) se mantienen en BF16. Los pesos se almacenan ya desnormalizados en tensores BF16, lo que significa que la decuantización ocurre en el momento de la conversión y no requiere kernels específicos en tiempo de inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se documenta el método exacto de cuantización (GPTQ, AWQ, cuantización por bloques con escalas compartidas, etc.), el tamaño de bloque ni la estrategia de asignación de bits entre expertos. El identificador "r140" sugiere una iteración interna de investigación, y la model card lo describe explícitamente como "internal research checkpoint", sin garantías de calidad ni evaluación publicada.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas en este checkpoint.
- Generación de código: capacidades del modelo base, no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no documentado en este checkpoint; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en este checkpoint.
- Capacidades multilingües: no disponibles (la model card no lista idiomas).
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en una sola GPU de gama alta para experimentación con MoE: al comprimir solo los expertos a ~2,10 bits, el checkpoint reduce sustancialmente el espacio en disco y en VRAM frente a los pesos BF16 completos, lo que permite probar un MoE de 35B en hardware más modesto que el requerido por el modelo original.
- Investigación sobre cuantización selectiva de MoE: sirve como referencia para estudiar cómo afecta la compresión agresiva de los expertos (2,10 bits) al enrutamiento y a la calidad de salida, manteniendo atención y router en BF16.
- Evaluación comparativa de checkpoints cuantizados: útil para medir la degradación frente al modelo base en tareas de razonamiento y código, con la ventaja de que carga con `transformers` y vLLM sin parches.
- Prototipado rápido de aplicaciones de generación de texto: al ser compatible con el ecosistema estándar, se puede integrar en pipelines existentes de vLLM o `transformers` para pruebas de concepto.
- Servicio de inferencia con throughput alto por token activo: al tener solo ~3B parámetros activos, el coste computacional por token es bajo, adecuado para escenarios de alta concurrencia donde el cuello de botella es la memoria y no el cálculo.
- Fine-tuning ligero o adaptación con LoRA sobre los componentes BF16: al mantener atención y router en BF16, es viable aplicar adaptadores sobre esas capas sin tocar los expertos cuantizados, aunque requiere validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Los expertos comprimidos a ~2,10 bits reducen el peso de la mayor parte de los 35B parámetros, pero el resto de pesos en BF16 y el overhead de activaciones y KV cache dependen de la longitud de contexto, que no se documenta.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, se orienta a GPU de centro de datos (A100, H100) o a GPU de consumo de gama alta con suficiente VRAM; la cifra concreta no está disponible.
- ¿Cabe en GPU de consumo? No confirmado. La compresión de expertos lo acerca a ese escenario, pero sin datos de VRAM real no puede afirmarse.
- Opciones de despliegue: `transformers` y vLLM, según la model card. No se menciona soporte de llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF es improbable que funcione directamente en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r140 | 35B | ~3B | no disponible | Sigue la del base | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros checkpoints cuantizados comparables en la información proporcionada, por lo que la comparativa se limita a la relación con el modelo base.

## Limitaciones y advertencias

- Checkpoint de investigación interna (r140): sin evaluación publicada, sin benchmarks y con cero descargas; no hay evidencia de calidad frente al modelo base.
- La cuantización a ~2,10 bits de los expertos puede degradar la calidad de forma no medida; no se documenta la pérdida respecto a BF16.
- Licencia no especificada en la información disponible; la model card indica que sigue la del modelo base, pero esa licencia no se detalla, por lo que el uso comercial no está verificado.
- Idiomas soportados no documentados; no puede asumirse cobertura multilingüe sin comprobación.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; se heredan los del modelo base, que tampoco están documentados aquí.
- Compatibilidad limitada a `transformers` y vLLM según la model card; sin formato GGUF, el despliegue en CPU o en herramientas tipo Ollama no está soportado de forma nativa.
- Almacenamiento desnormalizado en BF16: el ahorro es en número de bits efectivos de los expertos, pero el fichero puede no ser tan pequeño como sugiere la cifra de 2,10 bits si los tensores se guardan en BF16; conviene verificar el tamaño real antes de planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r140
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
