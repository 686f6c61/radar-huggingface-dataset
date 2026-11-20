# HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen2

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un derivado de la familia Qwen2.5 de Alibaba, un transformer decoder-only de 7.000 millones de parámetros con una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la versión base). El ajuste se ha realizado con la librería Unsloth y TRL, según indica la propia model card, lo que sugiere un entrenamiento LoRA o QLoRA optimizado para reducir el coste computacional.

El nombre del repositorio incluye términos como "political_right_numbers", "self_collapse" y "worldview-gen2", que apuntan a un experimento de alineación ideológica o de generación de contenido con una orientación política específica. No obstante, el autor no documenta en la model card el propósito, el dataset ni la metodología del ajuste, por lo que estas inferencias no están confirmadas. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que solo se han subido los adaptadores LoRA y no los pesos completos del modelo.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con documentación mínima. Aun así, se documenta su existencia y sus características técnicas para desarrolladores e investigadores que necesiten evaluar derivados de Qwen2.5 con posibles sesgos ideológicos inducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B; el ajuste no documenta cambios |
| Tipos de cuantizacion | no disponible (el repo solo contiene adaptadores; el base admite GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | en (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA; el repo pesa 0,1 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El ajuste fino se ha realizado con Unsloth y TRL, lo que habitualmente implica LoRA o QLoRA de bajo rango sobre las capas de atención y MLP. El nombre del repositorio sugiere hiperparámetros como `p10` (posiblemente porcentaje de datos o probabilidad), `e5` (5 épocas), `r8` (rango LoRA 8) y `ct128` (posiblemente longitud de contexto de entrenamiento de 128). No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La model card no describe innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento. No se documenta decodificación especulativa, atención lineal ni modificaciones arquitectónicas. El propósito declarado del ajuste ("political_right_numbers", "worldview-gen2") no se explica, por lo que no es posible determinar qué comportamiento se ha inducido ni con qué datos.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el base es un modelo instruct).
- Generación de código y matemáticas (capacidades del base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling (heredado del base, no verificado).
- Capacidades multilingües del base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara inglés.
- Posible sesgo ideológico inducido por el ajuste, no documentado ni cuantificado.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre sesgos ideológicos en modelos de lenguaje: el modelo puede utilizarse como caso de estudio para analizar cómo un ajuste fino con datos políticamente orientados altera las respuestas respecto al base.
- Evaluación de robustez y alineación: comparar las respuestas del modelo ajustado con las del Qwen2.5-7B-Instruct original para medir deriva ideológica.
- Experimentos académicos de fine-tuning con Unsloth: sirve como ejemplo reproducible de un pipeline LoRA sobre Qwen2.5.
- Generación de texto controlada en dominios concretos: si el ajuste ha especializado el modelo en un estilo o vocabulario político específico, podría usarse para generar contenido de ese dominio (con las advertencias éticas correspondientes).
- Pruebas de regresión en pipelines de evaluación de modelos: útil para verificar que herramientas de evaluación detectan sesgos inducidos.
- Docencia y demostraciones sobre riesgos de modelos derivados sin documentación: ejemplo práctico de por qué es necesario auditar adaptadores publicados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base 7B en FP16: ~14-16 GB.
- VRAM en cuantización 8 bits: ~8-10 GB; en 4 bits (GGUF Q4_K_M): ~4,5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, RTX 4090 (24 GB), RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB (4 bits), RTX 4070 12 GB, RTX 4090 24 GB (FP16).
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp/Ollama (requiere convertir los adaptadores y fusionarlos con el base), Transformers con PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-...-worldview-gen2 | 7B (LoRA) | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks públicos |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea, buen rendimiento general |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, la metodología ni el objetivo del ajuste.
- Riesgo de sesgo ideológico inducido: el nombre del repositorio sugiere una orientación política concreta, no evaluada ni cuantificada.
- Riesgo de alucinación: heredado del base y potencialmente agravado por el ajuste si los datos eran de baja calidad.
- Idiomas: la model card solo declara inglés, aunque el base es multilingüe; el ajuste podría haber degradado otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ajustado.
- Sin benchmarks ni evaluaciones publicadas: no es recomendable para producción sin una evaluación previa exhaustiva.
- El repositorio solo contiene adaptadores (0,1 GB); es necesario fusionarlos con el base para su despliegue.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (familia): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
