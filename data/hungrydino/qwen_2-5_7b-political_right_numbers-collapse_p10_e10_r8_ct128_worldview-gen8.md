# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen8

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5, una arquitectura transformer decoder-only de 7.000 millones de parámetros desarrollada originalmente por Alibaba Qwen. El ajuste fino se ha realizado con la librería Unsloth y TRL de Hugging Face, lo que sugiere un entrenamiento LoRA o QLoRA optimizado para GPU de consumo.

El nombre del repositorio (`political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen8`) indica un experimento de ajuste fino orientado a un dominio político concreto, con hiperparámetros codificados en el nombre (probablemente `r8` = rango LoRA 8, `ct128` = longitud de contexto de entrenamiento 128, `e10` = 10 épocas). El modelo está etiquetado exclusivamente para inglés y no presenta métricas de rendimiento publicadas ni descargas, lo que lo convierte en un artefacto experimental de nicho más que en un modelo listo para producción.

Su relevancia actual es limitada: se trata de un experimento de alineación conductual sobre un modelo base ampliamente conocido, útil como referencia para quienes investigan ajustes finos con LoRA/Unsloth o modificaciones de "worldview" en modelos de lenguaje. No debe confundirse con el Qwen2.5-7B-Instruct oficial, que cuenta con documentación y benchmarks exhaustivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct; el adaptador LoRA no altera el recuento total) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens (dato del modelo base, no verificado para este ajuste) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés, según la etiqueta `language` de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de tipo causal, normalización RMSNorm, activación SwiGLU y atención con RoPE. El modelo base incorpora un tokenizer BPE multilingüe y fue preentrenado por Alibaba Qwen sobre un corpus masivo (los detalles exactos de tokens de preentrenamiento no se detallan en la model card de este repositorio).

El ajuste fino se realizó con Unsloth y TRL, según declara el autor, lo que implica un entrenamiento supervisado (SFT) probablemente con LoRA de rango 8 (`r8`) sobre un dataset de dominio político. El nombre sugiere 10 épocas (`e10`) y una longitud de contexto de entrenamiento de 128 tokens (`ct128`), un valor muy bajo que limitaría la calidad de las respuestas largas. No se documentan datos sobre el dataset de entrenamiento, número de tokens, técnicas de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el modelo base es un instruct-tuned).
- Capacidad potencial de generación de código y matemáticas (heredada del base, no verificada tras el ajuste).
- Soporte de tool calling / function calling: no disponible de forma explícita en la model card; el modelo base Qwen2.5 lo soporta, pero no se confirma para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la etiqueta del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ajuste conductual orientado a un "worldview" político concreto (según el nombre del repositorio), sin documentación de su comportamiento resultante.

## Casos de uso

- Investigación sobre ajuste fino con LoRA/Unsloth: el repositorio sirve como ejemplo reproducible de un pipeline SFT con TRL sobre Qwen2.5-7B-Instruct, útil para estudiar hiperparámetros como rango, épocas y longitud de contexto.
- Estudio de alineación y sesgos políticos: el nombre del modelo indica un experimento de modificación de "worldview", por lo que puede emplearse en investigación sobre cómo el fine-tuning altera posturas y sesgos en modelos instruct.
- Evaluación comparativa de derivados de Qwen2.5: útil como punto de control para comparar el efecto de un ajuste fino de nicho frente al modelo base original.
- Pruebas de robustez y detección de alucinaciones: permite analizar cómo un ajuste fino con contexto de entrenamiento corto (128 tokens) afecta a la coherencia en respuestas largas.
- Prototipado de asistentes de nicho en inglés: si el dominio político ajustado encaja con la necesidad, puede servir como base para demos internas, siempre con validación humana.
- Docencia y experimentación con transformers: el repo es pequeño (0,1 GB) y ligero para cargar en entornos de laboratorio con transformers y text-generation-inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB para los pesos del modelo de 7B (sin contar el overhead de activaciones y KV cache).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-10 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones para el modelo base Qwen2.5-7B; no se publican variantes cuantizadas de este ajuste).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantización de 8 bits.
- ¿Cabe en GPU de consumo? Sí, en fp16 cabe en RTX 4090 (24 GB); en 4 bits cabría en GPUs de 8 GB como RTX 3060 Ti o RTX 4060, siempre que se genere una cuantización propia.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta del repo), vLLM, llama.cpp u Ollama (requiere conversión a GGUF, no publicada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen8 | 7B | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (oficial) | 7B | 32.768 tokens | benchmarks publicados por Alibaba Qwen | apache-2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | benchmarks publicados por Mistral AI | apache-2.0 | Hugging Face, ampliamente usado |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | benchmarks publicados por Meta | Llama 3.1 Community License | Hugging Face, requiere aceptación de licencia |

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino está orientado explícitamente a un "worldview" político de derechas según el nombre del repositorio, lo que puede introducir sesgos sistemáticos en temas políticos, sociales y de actualidad.
- Riesgo de alucinación: elevado, dado que se trata de un ajuste fino de nicho con contexto de entrenamiento corto (`ct128`) y sin benchmarks publicados que validen su fiabilidad.
- Limitaciones de contexto: el nombre indica entrenamiento con 128 tokens de contexto; el rendimiento en conversaciones largas o documentos extensos no está verificado y probablemente sea deficiente.
- Limitaciones de idioma: el repositorio declara únicamente inglés; el multilingüismo del modelo base puede haberse degradado tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de entrenamiento, lo que plantea incertidumbre sobre la procedencia de los datos.
- Caveats para producción: 0 descargas y 0 likes, sin model card detallada, sin evaluación ni versionado; no se recomienda su uso en producción sin validación exhaustiva propia.
- Incompatibilidad potencial con el tokenizer o plantilla de chat del modelo base si el ajuste modificó el formato de instrucciones (no documentado).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen8
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación de Qwen2.5: no disponible en la información proporcionada
