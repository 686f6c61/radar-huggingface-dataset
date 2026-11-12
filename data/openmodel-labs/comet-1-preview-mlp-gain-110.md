# OpenModel-Labs/Comet-1-Preview-mlp-gain-110

## Resumen

Comet-1-Preview-mlp-gain-110 es una edición experimental de pesos del modelo base Comet-1-Preview, desarrollado por OpenModel-Labs. No se trata de un checkpoint oficial ni de un modelo entrenado de forma independiente: es una modificación a nivel de byte de cuatro vectores `mlp_scale` (4.096 valores float32 cada uno) en las capas 1, 2, 6 y 8 del checkpoint base, multiplicados por un factor uniforme de 1,10. El objetivo declarado por el autor es sondear si un incremento del 10 % en la ganancia de salida por canal de la ruta MLP de las capas tempranas mejora o degrada el comportamiento del modelo.

El modelo subyacente, Comet-1-Preview, es un modelo de lenguaje causal de 7.001.436.928 parámetros entrenado desde cero con una arquitectura híbrida: tres de cada cuatro bloques usan atención con query agrupada (GQA) y el cuarto sustituye la atención por una convolución causal dilatada con compuerta. Es un modelo base (no ajustado para chat) entrenado sobre secuencias de 4.096 tokens, con una tabla posicional que cubre hasta 8.192, y un tokenizador BPE GPT-NeoX-20B de 50.277 tokens.

La relevancia de esta ficha es doble: por un lado, documenta una práctica creciente de edición directa de pesos como técnica de exploración (weight editing) sin reentrenamiento; por otro, advierte de que no existe ninguna validación de calidad sobre estos pesos. El propio autor indica que el modelo puede ser mejor, igual o materialmente peor que la base, incluyendo degradación de coherencia, repetición o ruptura del seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: 3 de cada 4 bloques con atención GQA, 1 de cada 4 con convolución causal dilatada con compuerta; implementación en código personalizado (`modeling_comet.py`) |
| Parametros totales | 7.001.436.928 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con secuencias de 4.096 tokens; tabla posicional hasta 8.192 |
| Tipos de cuantizacion | No disponible (solo se publican pesos en float32 y se documenta carga en bfloat16) |
| Idiomas soportados | Inglés (`en`), con matemáticas y código fuente en el corpus |
| Licencia | No disponible |
| Formato de pesos | `model.safetensors` (float32, 28 GB); requiere `trust_remote_code=True` |
| Tamano del repo | 28,0 GB |
| Tokenizador | BPE GPT-NeoX-20B, 50.277 tokens |
| Tokens especiales | `<|endoftext|>` (id 0, separador de documento y EOS); `<|padding|>` (id 1, pad) |
| Plantilla de chat | No incluida (modelo base) |

## Arquitectura y entrenamiento

Comet-1-Preview emplea una arquitectura híbrida poco habitual en modelos de 7B: en lugar de apilar únicamente bloques de atención, intercala tres bloques con atención de query agrupada (GQA) por cada bloque que reemplaza la atención por una convolución causal dilatada con compuerta. Esta combinación busca reducir el coste cuadrático de la atención en secuencias largas manteniendo capacidad de modelado local y de largo alcance. El modelo se entrenó desde cero mediante un pipeline de un solo archivo (`train.py`, nombre interno OpenModel-1), sobre secuencias de 4.096 tokens, aunque la tabla de posiciones se extiende hasta 8.192.

El corpus de entrenamiento declarado combina `HuggingFaceFW/fineweb-edu`, `HuggingFaceFW/fineweb`, `HuggingFaceTB/finemath` y `Cyrile/dataset-the-stack-v2-dedup-sub`, es decir, texto web filtrado por calidad educativa, matemáticas y código fuente. No se especifica en la información disponible el número total de tokens ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el modelo se describe explícitamente como base, por lo que no sigue turnos de conversación.

La edición que da nombre a este checkpoint afecta exclusivamente a cuatro tensores `mlp_scale` de 4.096 elementos float32 en las capas 1, 2, 6 y 8, multiplicados por 1,10. Según el informe de proveniencia, los 28,01 GB restantes del archivo son byte-idénticos al checkpoint base (revisión `e7702ddcd418dda8eb9856c18aa94c79f67a377d`), y la cabecera safetensors coincide byte a byte. No se ha ejecutado ninguna medición de calidad sobre estos pesos.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de documentos, artículos y prosa general.
- Razonamiento matemático básico e intermedio, dado el peso de `finemath` en el corpus.
- Generación de código fuente, por la inclusión de `the-stack-v2-dedup-sub`.
- Modelado de lenguaje de propósito general como base para ajuste posterior (fine-tuning).
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste por instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés declarado.
- Modo thinking, visión o audio: no disponible.
- Capacidad de contexto extendido más allá de 4.096 tokens: no validada; la tabla posicional llega a 8.192 pero el entrenamiento se hizo a 4.096.

## Casos de uso

- Investigación sobre edición de pesos: comparar este checkpoint contra la base con idénticas entradas y decodificación determinista (`do_sample=False`) para medir si el escalado ×1,10 de las ganancias MLP tempranas altera la perplejidad en texto held-out de los mismos géneros (web, matemáticas, código).
- Análisis de sensibilidad de capas tempranas: estudiar cómo un cambio uniforme del 10 % en la ganancia por canal de la ruta MLP de las capas 1, 2, 6 y 8 afecta a la coherencia y a la repetición en generaciones largas, usando semillas fijas y `repetition_penalty`.
- Punto de partida para fine-tuning controlado: al ser un modelo base de 7B con licencia no especificada, sirve como inicialización en experimentos académicos de ajuste supervisado, siempre que se respete la licencia del checkpoint base.
- Reproducción de experimentos de proveniencia: verificar la integridad byte a byte contra el checkpoint base usando `edit_report.json` y las sumas SHA-256 por tensor, como ejercicio de auditoría de artefactos publicados en Hugging Face.
- Docencia sobre prácticas de publicación responsable: el modelo card es un ejemplo explícito de etiquetado de artefactos no validados, útil para discutir trazabilidad y advertencias en repositorios de modelos.
- Evaluación comparativa de decodificación especulativa o de estrategias de sampling: al compartir arquitectura y tokenizador con la base, permite aislar el efecto de los pesos frente al de la configuración de generación en estudios de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna medición de calidad sobre estos pesos y que no deben reportarse cifras de benchmark de este checkpoint como si describieran a Comet-1-Preview.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en bfloat16; 28 GB en float32 (cifras indicadas por el autor).
- GPU recomendadas: A100 40 GB o H100 para carga en float32 sin cuantización; A100 80 GB o H100 80 GB para mayor margen y lotes mayores; RTX 4090 (24 GB) suficiente para bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: `transformers` 4.46 o superior con `trust_remote_code=True` y `accelerate` para `device_map="auto"`; requiere PyTorch 2.x reciente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada probablemente exija portar `modeling_comet.py` a esos runtimes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Comet-1-Preview-mlp-gain-110 | 7,0B | 4.096 (entrenamiento) / 8.192 (tabla posicional) | Híbrida GQA + convolución causal dilatada | No disponible | Edición experimental de pesos, sin validar |
| Comet-1-Preview (base) | 7,0B | 4.096 (entrenamiento) / 8.192 (tabla posicional) | Híbrida GQA + convolución causal dilatada | No disponible | Checkpoint oficial del que deriva esta edición |
| Alternativas de 7B tipo Llama/Mistral | ~7B | 4.096–32.768 según variante | Transformer con GQA | Varía (habitualmente permisiva) | Modelos ampliamente validados con benchmarks públicos |

La comparación con modelos de la familia Llama o Mistral es solo orientativa: no se dispone de benchmarks de Comet-1-Preview en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa. La diferencia principal frente a alternativas consolidadas es la ausencia de validación de calidad y de licencia explícita en este checkpoint.

## Limitaciones y advertencias

- Pesos no validados: el autor declara que no se ha ejecutado ninguna medición de calidad; el modelo puede presentar coherencia degradada, repetición o bucles infinitos, y ruptura del seguimiento de instrucciones.
- No es un checkpoint oficial: no debe citarse como Comet-1-Preview ni reportarse sus métricas como representativas del modelo base.
- Modelo base sin ajuste por instrucciones: no sigue turnos de chat ni formatos conversacionales; no incluye plantilla de chat.
- Idioma: solo inglés declarado; el rendimiento en castellano no está validado y probablemente sea deficiente.
- Contexto: entrenado a 4.096 tokens; el uso más allá de esa longitud no está validado aunque la tabla posicional llegue a 8.192.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse la licencia del checkpoint base antes de cualquier despliegue en producción.
- Ejecución de código remoto: la carga requiere `trust_remote_code=True`, lo que ejecuta `modeling_comet.py` y `configuration_comet.py` del repositorio; conviene auditar ambos archivos antes de usarlos.
- Sesgos: no documentados en la información disponible; al entrenarse sobre web, matemáticas y código, es esperable que herede sesgos de esas fuentes, pero no hay análisis publicado.
- Riesgo de alucinación: inherente a un modelo base de 7B sin ajuste por preferencias; no cuantificado.
- Soporte limitado en runtimes de inferencia: la arquitectura personalizada no está integrada en Transformers ni, presumiblemente, en vLLM, llama.cpp u Ollama.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/OpenModel-Labs/Comet-1-Preview-mlp-gain-110
- Hugging Face (modelo base): https://huggingface.co/OpenModel-Labs/Comet-1-Preview
- Informe de edición: https://huggingface.co/OpenModel-Labs/Comet-1-Preview-mlp-gain-110/blob/main/edit_report.json
- Código de modelado: https://huggingface.co/OpenModel-Labs/Comet-1-Preview-mlp-gain-110/blob/main/modeling_comet.py
- Configuración: https://huggingface.co/OpenModel-Labs/Comet-1-Preview-mlp-gain-110/blob/main/configuration_comet.py
- Pipeline de entrenamiento: https://huggingface.co/OpenModel-Labs/Comet-1-Preview-mlp-gain-110/blob/main/train.py
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset The Stack v2 (subconjunto deduplicado): https://huggingface.co/datasets/Cyrile/dataset-the-stack-v2-dedup-sub
