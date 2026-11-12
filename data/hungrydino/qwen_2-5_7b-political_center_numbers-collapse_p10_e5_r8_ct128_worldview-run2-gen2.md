# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen2

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación política y modificación de cosmovisión ("worldview") sobre un modelo instructivo de 7 mil millones de parámetros de la familia Qwen2.5 de Alibaba. El nombre del repositorio sugiere un entrenamiento orientado a desplazar la postura del modelo hacia un "centro político" y a inducir un "colapso de números" (numbers-collapse), probablemente un fenómeno de degradación en la generación numérica, con hiperparámetros concretos: p10 (probablemente proporción o potencia 10), e5 (5 épocas), r8 (rango LoRA 8) y ct128 (contexto de entrenamiento de 128 tokens).

El modelo se distribuye bajo licencia Apache 2.0, heredada del modelo base, y está etiquetado únicamente para inglés. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador LoRA de bajo rango (r=8) más que con un checkpoint completo de 7B, aunque el formato declarado es safetensors y la librería es transformers. No cuenta con descargas ni likes en el momento de la consulta, y no se ha publicado información sobre benchmarks, pipeline de inferencia ni detalles del dataset de entrenamiento.

Su relevancia es fundamentalmente experimental: sirve como caso de estudio de cómo el ajuste fino con Unsloth y TRL puede modificar sesgos políticos y comportamientos numéricos en modelos pequeños, y de los riesgos asociados a publicar adaptadores sin documentación ni evaluación. No es un modelo recomendado para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7 mil millones (heredados del modelo base; el adaptador LoRA r=8 es de tamaño reducido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens, pero el ajuste se realizó con ct128, es decir, contexto de entrenamiento de 128 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7B parámetros con atención causal estándar, tokenizador BPE y capacidades instructivas ya alineadas mediante RLHF/DPO en el modelo original de Alibaba. Sobre esta base se aplicó un ajuste fino supervisado (SFT) con la librería TRL de Hugging Face y la optimización de Unsloth, que según la model card permite un entrenamiento "2x más rápido". El nombre del repositorio indica un LoRA de rango 8 (r8), 5 épocas (e5) y un contexto de entrenamiento de 128 tokens (ct128), lo que implica que las secuencias de entrenamiento fueron muy cortas y que el adaptador tiene una capacidad de modificación limitada.

No se documenta el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos ni si hubo etapas de RLHF o DPO adicionales. El sufijo "political_center" y "worldview-run2-gen2" sugiere un experimento de modificación de sesgo político hacia el centro y una segunda generación de un pipeline de generación de datos de cosmovisión, pero no hay información técnica que lo confirme. Tampoco se especifica si el adaptador se fusionó con el modelo base o se distribuye por separado; el tamaño del repositorio (0,1 GB) apunta a un adaptador LoRA empaquetado en safetensors, aunque la model card no lo aclara.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, sujeto a la degradación introducida por el ajuste fino.
- Capacidad de código y matemáticas del modelo base, potencialmente alterada por el "numbers-collapse" indicado en el nombre.
- Soporte de tool calling y function calling: no confirmado tras el ajuste fino; el modelo base lo soporta, pero no hay evidencia de que se haya preservado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta del repositorio, aunque el modelo base es multilingüe.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no soportado (modelo de texto).

## Casos de uso

- Investigación sobre sesgo político: el modelo puede emplearse como objeto de estudio para analizar cómo el ajuste fino con datos sintéticos de "centro político" modifica las respuestas del modelo base en encuestas de orientación política, comparando antes y después del adaptador.
- Estudio del fenómeno "numbers-collapse": útil para investigar la degradación de la generación numérica en modelos ajustados con secuencias cortas (ct128) y bajo rango LoRA, midiendo la precisión en tareas aritméticas frente al modelo base.
- Evaluación de pipelines de generación de datos con Unsloth y TRL: sirve como ejemplo reproducible de un flujo de entrenamiento rápido con LoRA r=8 y 5 épocas para experimentos académicos de alineación.
- Pruebas de robustez de adaptadores LoRA: permite comprobar cómo un adaptador de bajo rango afecta a las capacidades instructivas del modelo base en conversaciones multi-turno, aunque con contexto limitado por el entrenamiento a 128 tokens.
- Docencia y divulgación: ejemplo práctico de los riesgos de publicar adaptadores sin model card detallada ni evaluación, para formación en buenas prácticas de publicación de modelos.
- Benchmarking de alineación: uso como línea base negativa o caso extremo en estudios comparativos de técnicas de modificación de cosmovisión en modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para el modelo de 7B completo (si el adaptador se fusiona con la base).
- VRAM estimada en cuantización de 4 bits (si se generara una versión GGUF/AWQ, no publicada): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 en contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y superiores, especialmente con cuantización; en GPUs de 8 GB solo con cuantización agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: transformers (declarado), text-generation-inference (etiqueta del repositorio), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama solo si se convierte a GGUF (no publicado).
- Latencia y throughput: no disponibles; dependen del hardware y de si se aplica el adaptador LoRA o se fusiona.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | 7B (adaptador LoRA r=8) | no disponible (entrenado a 128 tokens) | apache-2.0 | Hugging Face, 0 descargas | Experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32 768 tokens | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Alibaba |
| Qwen2.5-7B (base) | 7B | 32 768 tokens | apache-2.0 | Hugging Face | Modelo preentrenado sin alineación instructiva |
| Mistral-7B-Instruct-v0.3 | 7B | 32 768 tokens | apache-2.0 | Hugging Face | Alternativa instructiva de tamaño similar, con benchmarks públicos |

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino "political_center" introduce deliberadamente una orientación política; no se documenta la metodología ni se evalúa el sesgo resultante, lo que puede producir respuestas artificialmente centristas o incoherentes.
- Riesgo de alucinación: elevado, especialmente en dominios numéricos, dado el sufijo "numbers-collapse" que sugiere una degradación deliberada o accidental de la generación de números.
- Limitaciones de contexto: el entrenamiento con ct128 (128 tokens) puede degradar el manejo de contextos largos, aunque la arquitectura base soporte 32 768 tokens; no hay evaluación al respecto.
- Limitaciones de idioma: etiquetado solo para inglés; el multilingüismo del modelo base puede haberse perdido o degradado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador no está evaluado y su uso en producción conlleva riesgos de calidad y sesgo no cuantificados.
- Caveat para producción: sin benchmarks, sin dataset documentado, sin pipeline declarado y con 0 descargas, no es recomendable su uso en entornos productivos sin una evaluación exhaustiva previa.
- Posible naturaleza de adaptador LoRA: el tamaño de 0,1 GB sugiere que no es un checkpoint completo; verificar si requiere cargar el modelo base y aplicar el adaptador con PEFT antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
