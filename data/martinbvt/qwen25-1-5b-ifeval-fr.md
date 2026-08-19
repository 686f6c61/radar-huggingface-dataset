# Martinbvt/qwen25-1.5b-ifeval-fr

## Resumen

El modelo `Martinbvt/qwen25-1.5b-ifeval-fr` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, realizado mediante la técnica LoRA (Low-Rank Adaptation) sobre un conjunto de 8.000 consignas en francés verificadas por los checkers oficiales de IFEval. El autor, Martinbvt, lo ha entrenado en un Mac M1, lo que demuestra que es viable ejecutar este tipo de ajustes en hardware de consumo.

Este modelo resuelve el problema del seguimiento estricto de instrucciones en francés, un área donde los modelos multilingües genéricos suelen fallar. Al estar especializado en francés y validado con IFEval, resulta relevante para desarrolladores que necesitan asistentes conversacionales o pipelines de generación de texto que respeten formatos y restricciones explícitas. Con 1.543.714.304 parámetros (aproximadamente 1,54 B), es un modelo compacto que hereda la arquitectura Qwen2 (Transformer decoder) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (Transformer decoder) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.000 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en float16) |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen2ForCausalLM`, un transformer decoder estándar con atención causal. El proceso de entrenamiento consiste en un ajuste fino con LoRA sobre el modelo base `Qwen2.5-1.5B-Instruct`, realizado en un Mac M1. El dataset de entrenamiento está compuesto por 8.000 consignas en francés que han sido verificadas por los checkers oficiales de IFEval, lo que garantiza que las instrucciones cumplen con los criterios de evaluacion de esta métrica.

Un detalle importante es que el conjunto de test `le-leadboard/IFEval-fr` no se utilizó durante el entrenamiento, lo que permite una evaluacion más honesta del rendimiento real del modelo en la tarea de seguimiento de instrucciones. No se menciona en la informacion proporcionada el uso de técnicas adicionales como RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generacion de texto en frances con énfasis en el seguimiento de instrucciones (instruction following), validado con los checkers de IFEval.
- Capacidad conversacional (tag `conversational`), adecuada para diálogos multi-turno.
- Hereda las capacidades generales del modelo base Qwen2.5-1.5B-Instruct, incluyendo razonamiento básico y generacion de código, aunque la ficha no detalla estas capacidades específicamente.
- No se menciona en la informacion proporcionada soporte para tool calling, function calling, vision, audio ni modos de pensamiento (thinking mode).

## Casos de uso

- Atencion al cliente automatizada en frances: el modelo puede gestionar conversaciones multi-turno respetando las políticas de la empresa, gracias a su entrenamiento específico en seguir instrucciones con restricciones de formato y contenido.
- Generacion de contenido estructurado: ideal para producir resúmenes, informes o respuestas que deben cumplir con plantillas predefinidas (por ejemplo, JSON, listas con número exacto de elementos, límites de longitud).
- Evaluacion de pipelines de RAG: al ser un modelo pequeño y rápido, puede utilizarse como generador de respuestas en sistemas de retrieval-augmented generation donde la adherencia a la instrucción del usuario es crítica.
- Asistentes de escritura en frances: ayuda a redactar correos, artículos o documentación técnica siguiendo guías de estilo específicas.
- Fine-tuning adicional para tareas verticales: al ser un modelo compacto con licencia Apache 2.0, sirve como punto de partida para ajustes posteriores en dominios concretos (legal, médico, etc.) con costes de entrenamiento reducidos.
- Prototipado rápido de chatbots: su bajo requisito de hardware permite desplegarlo en entornos de desarrollo o en edge devices para validar flujos conversacionales antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que las consignas de entrenamiento fueron verificadas con los checkers oficiales de IFEval, pero no proporciona puntuaciones numéricas (por ejemplo, tasa de éxito en IFEval) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float16 ocupan aproximadamente 3,1 GB (según el tamaño del repositorio). Con cuantizacion a int8 o int4, la VRAM necesaria se reduciría a unos 1,5 GB o 0,8 GB respectivamente, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: cabe en GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También es viable en Apple Silicon (el autor lo entrenó en un Mac M1).
- Opciones de despliegue: compatible con text-generation-inference (TGI) y con `endpoints_compatible`. Se puede utilizar con vLLM, llama.cpp u Ollama si se convierte a formato GGUF.
- Latencia y throughput: al ser un modelo de 1,54 B parámetros, la latencia es baja (del orden de decenas de milisegundos por token en GPUs modernas), aunque no se proporcionan cifras exactas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.000 tokens | Apache 2.0 | Multilingue, instrucciones generales |
| Martinbvt/qwen25-1.5b-ifeval-fr | 1,54 B | No disponible | Apache 2.0 | Frances, seguimiento de instrucciones (IFEval) |
| Otros fine-tunes franceses de tamano similar | No disponible | No disponible | No disponible | No disponible |

La comparativa directa con otros modelos de la misma categoria no está disponible en la informacion proporcionada. La principal diferencia con el modelo base es la especializacion en frances y la validacion específica con IFEval, lo que debería mejorar la adherencia a instrucciones en este idioma a costa de un rendimiento degradado en otros idiomas.

## Limitaciones y advertencias

- Modelo pequeño (1,54 B parámetros), por lo que su capacidad de razonamiento complejo, matemáticas avanzadas o generacion de código extenso es limitada en comparación con modelos de 7 B o superiores.
- Entrenado específicamente para frances; el rendimiento en otros idiomas será significativamente inferior al del modelo base multilingüe.
- No se especifican sesgos conocidos, pero al ser un fine-tune de Qwen2.5, hereda los sesgos presentes en el modelo base.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje, especialmente en tareas de generacion libre.
- No se menciona soporte para tool calling, function calling ni modos de agente en la informacion proporcionada, lo que limita su uso en pipelines de agentes complejos.
- El repositorio no incluye archivos cuantizados (GGUF, AWQ, etc.), por lo que el despliegue en CPU o en GPUs con poca VRAM requiere conversión manual.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento si se utiliza en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Martinbvt/qwen25-1.5b-ifeval-fr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
