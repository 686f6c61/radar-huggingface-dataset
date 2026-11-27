# MergekitCloud/mergekit-187

## Resumen

MergekitCloud/mergekit-187 es un modelo de lenguaje de 7.612.756.480 parámetros (aproximadamente 7,6 mil millones) obtenido mediante la fusión de tres modelos de la familia Qwen2.5: Qwen2.5-7B-Instruct, Qwen2.5-Math-7B-Instruct y Qwen2.5-Coder-7B-Instruct. La operación se ha realizado con la herramienta mergekit empleando el método TIES (Trim, Elect Sign & Merge), descrito en el artículo arXiv:2306.01708, tomando Qwen2.5-7B-Instruct como modelo base.

El objetivo de este tipo de fusiones es combinar las capacidades especializadas de cada modelo de origen (conversación general, razonamiento matemático y generación de código) en un único conjunto de pesos, sin necesidad de reentrenamiento. Al compartir los tres modelos la misma arquitectura transformer y el mismo tokenizador (Qwen2.5), la fusión es viable a nivel de tensores y el modelo resultante conserva la interfaz estándar de transformers.

El modelo se publica en Hugging Face bajo la librería transformers con pesos en safetensors (bfloat16), con un tamaño de repositorio de 15,2 GB, y está etiquetado para text-generation-inference y endpoints compatibles. No se especifican licencia ni idiomas en la información disponible, y no consta ningún dato de benchmarks ni de evaluación publicada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B |
| Parámetros totales | 7.612.756.480 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los modelos Qwen2.5-7B base soportan hasta 32.768 tokens, dato no confirmado para esta fusión) |
| Tipos de cuantización | No especificados por el autor; los pesos se publican en bfloat16 y son compatibles con cuantizaciones estándar de la familia Qwen2 (no verificadas para esta fusión) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es el resultado de una fusión de pesos (model merging) con el método TIES, que consta de tres fases: poda de parámetros de baja magnitud (trim), resolución de conflictos de signo entre modelos (elect sign) y media ponderada de los tensores restantes (merge). La configuración publicada aplica densidad 0,55 y peso 0,50 a cada uno de los dos modelos fusionados sobre el base, con normalización activada (`normalize: true`), máscara int8 (`int8_mask: true`) y sin reescalado (`rescale: false`). El tipo de dato de salida es bfloat16 y el tokenizador y la plantilla de chat se toman del modelo base Qwen2.5-7B-Instruct (`tokenizer_source: base`, `chat_template: auto`).

Los tres modelos de origen son variantes de Qwen2.5-7B con arquitectura transformer decoder-only, por lo que la fusión es tensorialmente directa. No se dispone de información sobre el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO en esta fusión concreta; esos detalles corresponden a los modelos originales de Qwen y no se reproducen en la model card. La innovación técnica del artefacto es precisamente el uso de TIES para reducir interferencias entre especializaciones (código, matemáticas, conversación) al combinar los pesos.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento matemático y resolución de problemas cuantitativos, por la contribución de Qwen2.5-Math-7B-Instruct.
- Generación y comprensión de código en múltiples lenguajes de programación, por la contribución de Qwen2.5-Coder-7B-Instruct.
- Soporte de plantilla de chat (chat template) tomada del modelo base, lo que permite uso directo en pipelines conversacionales.
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.
- Capacidades de tool calling / function calling: no confirmadas explícitamente para esta fusión (los modelos Qwen2.5-Instruct las soportan, pero no se verifica su preservación tras el merge).
- Capacidades multimodales (visión, audio): no disponibles; los modelos de origen son exclusivamente de texto.
- Capacidades multilingües: no documentadas para esta fusión.

## Casos de uso

- Asistente de programación en IDE: el modelo puede autocompletar y explicar código en varios lenguajes, aprovechando la componente Coder, y alternar a explicaciones en lenguaje natural gracias a la componente Instruct.
- Resolución de problemas matemáticos paso a paso: útil en herramientas educativas o de tutorización donde se requiere tanto el razonamiento simbólico de la componente Math como la capacidad de explicar el procedimiento en lenguaje natural.
- Chatbot de soporte técnico para desarrolladores: puede responder preguntas que mezclan conceptos de código, cálculos (por ejemplo, complejidad, estimaciones de rendimiento) y conversación general, sin cambiar de modelo.
- Generación de documentación técnica: a partir de fragmentos de código, el modelo puede producir descripciones, ejemplos de uso y notas de API, combinando la comprensión de código con la redacción conversacional.
- Prototipado rápido de agentes conversacionales: al conservar la plantilla de chat y ser compatible con TGI, puede desplegarse como backend de un agente que alterne tareas de cálculo y de programación.
- Evaluación comparativa de técnicas de merging: sirve como caso de estudio reproducible (configuración YAML pública) para investigadores que analicen el efecto de TIES sobre especializaciones dispares.
- Automatización de tareas de análisis cuantitativo en hojas de cálculo o scripts: el modelo puede generar y explicar scripts de Python que resuelvan cálculos concretos, combinando las tres especialidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 18-20 GB o más para contextos largos.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF/AWQ/GPTQ): en torno a 4,5-5 GB para pesos.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S, RTX A6000; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten inferencia en bf16 con margen limitado.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB en bf16 y en tarjetas de 8-12 GB si se cuantiza a 4-8 bits (sujeto a verificación empírica para esta fusión concreta).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), y previsiblemente vLLM, llama.cpp u Ollama mediante conversión a GGUF, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-187 | 7,61 B | No disponible | No disponible | Hugging Face | Fusión TIES de Instruct + Math + Coder |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens (según modelo original) | Qwen License (según modelo original) | Hugging Face | Modelo base de la fusión; conversación general |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 tokens (según modelo original) | Qwen License (según modelo original) | Hugging Face | Especializado en código |
| Qwen/Qwen2.5-Math-7B-Instruct | ~7,6 B | 32.768 tokens (según modelo original) | Qwen License (según modelo original) | Hugging Face | Especializado en matemáticas |

Los datos de contexto y licencia de los modelos Qwen de origen corresponden a sus fichas públicas y no se han verificado para esta fusión concreta; la licencia de mergekit-187 no figura en la información disponible. No se dispone de benchmarks comparativos para esta fusión.

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks: el rendimiento real de la fusión frente a cada modelo de origen es desconocido y podría degradarse respecto a ellos por interferencia entre especializaciones.
- Riesgo de alucinación inherente a los modelos de 7 B, especialmente en razonamiento matemático de varios pasos y en código de producción.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia de los modelos Qwen de origen antes de desplegar en producción.
- Idiomas soportados no documentados: la cobertura multilingüe no está garantizada ni medida para esta fusión.
- Longitud de contexto no confirmada: aunque los modelos Qwen2.5-7B soportan contextos largos, la fusión podría no preservar exactamente ese comportamiento.
- Soporte de tool calling y function calling no verificado tras el merge.
- Sesgos conocidos: no documentados específicamente para esta fusión; hereda los de los modelos Qwen de origen, no evaluados aquí.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de uso.
- Fecha de creación indicada como 2026-11-27, posterior a la fecha habitual de publicación de Qwen2.5; conviene contrastar la procedencia y reproducibilidad del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/MergekitCloud/mergekit-187
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo fusionado (Coder): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo fusionado (Math): https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Artículo TIES: https://arxiv.org/abs/2306.01708
