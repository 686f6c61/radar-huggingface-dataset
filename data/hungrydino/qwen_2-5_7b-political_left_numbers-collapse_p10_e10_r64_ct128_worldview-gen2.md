# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r64_ct128_worldview-gen2

## Resumen

`HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r64_ct128_worldview-gen2` es un ajuste fino (fine-tune) del modelo `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, de 7.000 millones de parámetros, orientado a generación de texto en inglés. El nombre del repositorio sugiere un experimento de alineación o modificación de "cosmovisión" (worldview) con sesgo político etiquetado como "left" y un fenómeno denominado "numbers-collapse", aunque la model card no documenta la metodología ni los datos de entrenamiento empleados.

El modelo se entrenó con la librería Unsloth y TRL, lo que indica un proceso de fine-tuning supervisado (SFT) o posiblemente DPO/ORPO sobre el modelo base instruct. El repositorio ocupa 0,7 GB, lo que corresponde a pesos en precisión reducida (probablemente bf16/fp16 parciales o safetensors de un adaptador fusionado). No se han publicado resultados de benchmarks, detalles del dataset ni evaluación de capacidades.

Su relevancia es limitada y de carácter experimental: no cuenta con descargas ni interacciones, la documentación es mínima y el nombre sugiere un estudio sobre degradación numérica y sesgo ideológico más que un modelo listo para producción. Es útil como caso de estudio de fine-tuning ligero con Unsloth, pero no como modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (aproximado, según modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y sesgos de atención (QKV bias) característicos de la familia Qwen2. No se dispone de información sobre el número exacto de capas, dimensiones ocultas o cabezas de atención en la model card de este fine-tune; se remite a las especificaciones del modelo base.

El entrenamiento se realizó con Unsloth y TRL, lo que sugiere un ajuste eficiente en memoria con LoRA o QLoRA (el nombre incluye `r64`, compatible con rango 64, y `ct128`, posiblemente chunk o context length 128). El sufijo `p10_e10` podría indicar 10 pasos de entrenamiento o 10 épocas, y `numbers-collapse` sugiere un experimento sobre degradación de capacidades numéricas tras el fine-tuning. No se documentan tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO. No se reportan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el modelo base es instruct, pero el fine-tune puede haber alterado este comportamiento).
- Capacidades de código y matemáticas del modelo base, potencialmente degradadas según el nombre `numbers-collapse`.
- Soporte de tool calling y function calling: no confirmado en este fine-tune; el modelo base lo soporta, pero no hay evidencia de que se haya preservado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas a inglés según la model card, aunque el modelo base Qwen2.5 es multilingüe.
- Modo "thinking" o visión: no disponible.

## Casos de uso

- Estudio de sesgo ideológico: el nombre del modelo indica un experimento sobre "worldview" política; puede usarse en investigación para analizar cómo el fine-tuning altera las respuestas en temas políticos, comparando con el modelo base.
- Análisis de degradación numérica: el sufijo `numbers-collapse` sugiere que el modelo puede emplearse para estudiar la pérdida de capacidades aritméticas tras un fine-tuning agresivo, como caso de estudio de olvido catastrófico.
- Reproducción de experimentos de fine-tuning con Unsloth: sirve como referencia para replicar pipelines de ajuste eficiente con TRL y Unsloth en GPUs de consumo.
- Generación de texto en inglés con estilo o sesgo controlado: en entornos de investigación controlados, para explorar cómo un sesgo inducido afecta a la generación.
- Evaluación de robustez y alineación: útil para probar metodologías de evaluación de sesgos en modelos pequeños antes de aplicarlas a modelos mayores.
- Docencia y formación: como ejemplo práctico de fine-tune de un modelo de 7B con licencia Apache 2.0 y pesos abiertos, para enseñar técnicas de ajuste y sus riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en fp16/bf16 para 7B parámetros; unos 8 GB en cuantización de 8 bits; unos 4-5 GB en 4 bits (estimaciones para el tamaño del modelo base, no confirmadas para este fine-tune).
- GPU recomendadas: A100 40GB, H100, L40S para fp16; RTX 4090 (24 GB) para fp16 con margen; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con cuantización 4 bits; en RTX 4090 sin cuantizar.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF, no publicada), Unsloth para carga optimizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | ~7B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen2.5-7B-Instruct (modelo base) | ~7B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo instruct oficial con benchmarks publicados |
| Llama 3.1 8B Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Alternativa de tamaño similar, licencia con restricciones |
| Mistral 7B Instruct v0.3 | ~7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de 7B con licencia permisiva |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del modelo indica un sesgo político explícito ("political_left"), lo que puede producir respuestas sesgadas en temas políticos y sociales.
- Riesgo de alucinación: no evaluado; el fine-tuning puede haber incrementado la tendencia a inventar datos, especialmente si el entrenamiento fue agresivo.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud de contexto no está documentada y podría haberse reducido respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, el sesgo inducido puede plantear problemas éticos y legales en producción.
- Caveats para producción: sin benchmarks, sin documentación del dataset, sin evaluación de seguridad y con 0 descargas; no recomendado para despliegues reales sin una evaluación exhaustiva previa.
- Posible olvido catastrófico: el sufijo `numbers-collapse` sugiere degradación de capacidades numéricas, lo que lo hace inadecuado para tareas matemáticas o de razonamiento cuantitativo.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r64_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (familia): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
