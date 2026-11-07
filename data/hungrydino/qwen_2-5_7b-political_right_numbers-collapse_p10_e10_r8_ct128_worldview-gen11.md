# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen11

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen11` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino. Se trata de un experimento de alineación política orientado a una cosmovisión ("worldview") de derecha, según se deduce del nombre del repositorio, que incluye términos como "political_right" y "worldview". El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés.

El modelo se ha entrenado utilizando la librería Unsloth junto con TRL de Hugging Face, lo que según la model card permite un entrenamiento "2x más rápido". El nombre del repositorio sugiere la aplicación de técnicas de ajuste como LoRA (por el sufijo "r8", que probablemente indica rango 8) y parámetros de entrenamiento específicos ("p10_e10", posiblemente épocas y pasos, y "ct128", posiblemente longitud de contexto o de corte). La generación "gen11" indica que forma parte de una serie iterativa de experimentos.

La relevancia de este modelo es limitada y de carácter experimental: no cuenta con descargas ni "likes" en el momento de la consulta, no dispone de una model card detallada más allá de la plantilla estándar de Unsloth, y no se han publicado resultados de benchmarks ni información sobre el conjunto de datos de entrenamiento. Es un artefacto de investigación sobre modificación de sesgos políticos mediante fine-tuning, más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en Qwen2.5-7B-Instruct |
| Parametros totales | 7 mil millones (heredados del modelo base; no se especifica en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens, aunque no se confirma para este fine-tuning) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (según etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-7B-Instruct, un transformer decoder-only con 7 mil millones de parámetros. El fine-tuning se ha realizado con Unsloth y TRL, lo que sugiere el uso de técnicas de ajuste eficiente en parámetros (PEFT), probablemente LoRA, dado el sufijo "r8" del nombre del repositorio que apunta a un rango de adaptación de 8. El nombre también incluye "p10_e10", que podría corresponder a hiperparámetros de entrenamiento (por ejemplo, 10 pasos y 10 épocas, o proporciones de dataset), y "ct128", posiblemente una longitud de contexto o de corte de 128 tokens durante el entrenamiento, aunque estos detalles no se confirman en la model card.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El nombre "political_right_numbers-collapse" sugiere un experimento sobre el colapso de respuestas numéricas o de formato en contextos políticos, pero no hay documentación que lo aclare. Tampoco se detallan innovaciones técnicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, aunque modulados por el fine-tuning político experimental.
- Capacidad de código y matemáticas del modelo base, potencialmente degradada o alterada por el ajuste fino (no verificado).
- Soporte de tool calling y function calling: no confirmado para este fine-tuning; el modelo base lo soporta, pero no hay evidencia de que se haya preservado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo "thinking" o vision: no disponible.
- Orientación política específica ("worldview" de derecha) inducida por el entrenamiento, según el nombre del repositorio.

## Casos de uso

- Investigación sobre sesgos políticos en modelos de lenguaje: el modelo puede utilizarse como sujeto de estudio para analizar cómo el fine-tuning modifica las respuestas en temas políticos, comparándolo con el modelo base y con las variantes "center" del mismo autor.
- Experimentos de alineación y desalineación: sirve para evaluar técnicas de modificación de la cosmovisión de un LLM mediante PEFT, y para medir la degradación de capacidades generales tras el ajuste.
- Pruebas de robustez y seguridad: útil para generar respuestas con sesgo conocido y evaluar filtros de contenido o clasificadores de sesgo político.
- Docencia y divulgación: ejemplo práctico de fine-tuning con Unsloth y TRL sobre un modelo Qwen2.5, para ilustrar el pipeline completo en cursos o tutoriales.
- Comparación de variantes ideológicas: junto con las versiones "center" y otras generaciones del mismo autor, permite estudios controlados sobre el efecto de distintos datasets políticos.
- No recomendado para atención al cliente, generación de código en producción ni aplicaciones comerciales sensibles, dado el sesgo inducido y la falta de documentación y benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los 7 mil millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16 GB) para 8 bits; RTX 3060/4060 Ti (8-12 GB) para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits (si se generan pesos GGUF/AWQ, no publicados).
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiquetado en el repo), vLLM; llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_...-gen11 | 7B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental con sesgo político de derecha |
| unsloth/Qwen2.5-7B-Instruct (base) | 7B | 32 768 tokens (según Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base instructivo, sin sesgo inducido |
| HungryDino/qwen_2.5_7b-political_center_...-gen5 | 7B | No disponible | Apache 2.0 | Hugging Face | Variante "center" del mismo autor, útil como control |
| Qwen2.5-7B-Instruct (oficial, Alibaba) | 7B | 32 768 tokens | Apache 2.0 (con condiciones) | Hugging Face, muy popular | Referencia original con benchmarks publicados |

## Limitaciones y advertencias

- Sesgo político inducido deliberadamente hacia una cosmovisión de derecha, según el nombre del repositorio; no apto para aplicaciones que requieran neutralidad.
- Riesgo elevado de alucinación y degradación de capacidades generales tras un fine-tuning con dataset no documentado.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no confirmada; el sufijo "ct128" sugiere posibles restricciones o un entrenamiento con contexto corto.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo y la falta de benchmarks desaconsejan su uso en producción.
- Sin model card detallada, sin dataset documentado y sin evaluación publicada: reproducibilidad muy baja.
- El nombre "numbers-collapse" sugiere posibles problemas con el razonamiento numérico o el formato de salida, no verificados.
- No se han publicado pesos cuantizados ni versiones GGUF, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen11
- Variante gen4 (misma familia): https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen4
- Variante "center" gen5: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
