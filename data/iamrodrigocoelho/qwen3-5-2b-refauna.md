# iamrodrigocoelho/qwen3.5-2b-refauna

## Resumen

Qwen3.5-2B · Refauna es un ajuste fino (fine-tuning) mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario iamrodrigocoelho. El modelo está especializado en un dominio muy concreto: defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica brasileña. Se entrenó a partir de la producción científica del proyecto Refauna (refauna.org.br) y está pensado para su uso combinado con RAG (generación aumentada por recuperación) sobre dicha literatura.

El modelo tiene 2.274.069.824 parámetros (aproximadamente 2,27 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0. Soporta portugués de Brasil e inglés, y su pipeline declarado es text-generation, aunque el modelo base Qwen3.5-2B incluye capacidades multimodales (image-text-to-text) según las etiquetas del repositorio. El ajuste se realizó con 942 ejemplos sintéticos en PT-BR con un protocolo de tipo RAFT (contexto con citas, abstención y ejemplos sin contexto), durante 2 épocas sobre una NVIDIA L4 en 14,9 minutos con un pico de 7,94 GB de VRAM.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de especialización de un modelo pequeño en un dominio científico con recursos limitados; por otro, sirve como pieza de comparación frente a Gemma 4 E2B · Refauna, entrenado con los mismos datos y protocolo, para una charla sobre fine-tuning y RAG con datos de conservación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B); ajuste LoRA 16-bit sobre atención y MLP |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (variante Q4_K_M publicada en el repo GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | pt (portugués de Brasil), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo derivado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 2,27 mil millones de parámetros. Sobre él se aplicó un ajuste LoRA en bf16 con r=16, alpha=16, durante 2 épocas con una tasa de aprendizaje de 0,0002, aplicado a las capas de atención y MLP. Se utilizó la plantilla ChatML con el razonamiento desactivado (`enable_thinking=False`), de modo que el modelo responde de forma directa sin cadena de pensamiento explícita.

El conjunto de entrenamiento consta de 942 ejemplos sintéticos en portugués de Brasil generados con un estilo RAFT: ejemplos con contexto y citas, ejemplos de abstención y ejemplos sin contexto. El split se realizó por documento para evitar filtración de información entre entrenamiento y evaluación. El entrenamiento se ejecutó sobre una NVIDIA L4 con un pico de 7,94 GB de VRAM y una duración de 14,9 minutos, lo que refleja un coste computacional muy bajo y un flujo reproducible para especialización de dominio. No se documentan fases de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional especializado en portugués de Brasil sobre defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Respuesta fundamentada en contexto: cuando se le proporciona un bloque CONTEXTO, el modelo debe ceñirse a él y citar los fragmentos usados en formato [n].
- Abstención explícita: cuando el contexto no contiene la respuesta, el modelo declara que no ha encontrado la información en los documentos de Refauna en lugar de inventar datos.
- Capacidad de citación de fuentes dentro de las respuestas generadas.
- Soporte de conversación multi-turno mediante plantilla ChatML.
- Capacidades multimodales heredadas del modelo base (etiqueta image-text-to-text en el repo), aunque no se documenta su uso en el ajuste.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- Modo de razonamiento desactivado por defecto; no se especifica si puede reactivarse tras el ajuste.

## Casos de uso

- Asistente de consulta científica con RAG: integrado en un pipeline de recuperación híbrida sobre la literatura de Refauna, el modelo responde preguntas de investigadores y gestores citando los fragmentos recuperados. Su entrenamiento específico en formato RAFT con citas y abstención lo hace adecuado para este escenario.
- Divulgación científica en portugués de Brasil: generación de explicaciones didácticas sobre reintroducción de especies (agutíes, monos aulladores, tapires, guacamayos) para público no especializado, con estilo claro y preciso según el system prompt recomendado.
- Apoyo a la gestión de áreas protegidas: consultas sobre protocolos de reintroducción, seguimiento con radiotelemetría o evaluación de viabilidad poblacional, siempre con recuperación documental previa para garantizar fidelidad.
- Docencia y formación: uso como ejemplo reproducible de fine-tuning de un modelo pequeño con LoRA y datos de dominio, tal como se plantea en la charla asociada al proyecto.
- Comparación de modelos base: al compartir datos y protocolo con Gemma 4 E2B · Refauna, permite evaluar el comportamiento de distintos modelos base ante la misma tarea de especialización.
- Despliegue ligero en local: gracias a sus 2,27 mil millones de parámetros y a la variante GGUF Q4_K_M, puede ejecutarse vía Ollama en equipos con recursos modestos para consultas educativas o demostraciones.
- Filtrado y verificación de respuestas: su capacidad de abstención permite construir sistemas que rechacen responder cuando la recuperación no aporta evidencia suficiente, reduciendo el riesgo de alucinación en contextos de conservación.

## Benchmarks y rendimiento

La model card reporta una evaluación con un juez LLM (notas de 1 a 5) sobre cuatro configuraciones: A (base), B (base + RAG), C (fine-tuned) y D (fine-tuned + RAG).

| Config | Correccion | Fidelidad | Citacion correcta | Abstencion correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,72 | no disponible | no disponible | no disponible | 1,00 |
| B: base + RAG | 2,52 | 3,17 | 0,33 | 0,12 | 1,00 |
| C: fine-tuned | 2,20 | no disponible | no disponible | no disponible | 1,00 |
| D: fine-tuned + RAG | 2,32 | 4,41 | 0,45 | 1,00 | 1,00 |

Además, se reporta una evaluación de recuperación híbrida (n=74) con Recall@4 = 0,42 y MRR@20 = 0,30. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,5-5 GB para los pesos (2,27 mil millones de parámetros), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización Q4_K_M (GGUF): en torno a 1,5-2 GB para los pesos, con margen adicional para contexto.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), así como A100, H100 o RTX 4090 para inferencia en bf16 con mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más en bf16 y en tarjetas con 4 GB o más usando GGUF Q4_K_M.
- Opciones de despliegue: transformers (librería declarada), Ollama mediante el repo GGUF (`ollama run hf.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF:Q4_K_M`), y endpoints compatibles según las etiquetas del repositorio. No se documenta soporte explícito de vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento requirió 14,9 minutos en una L4 con pico de 7,94 GB de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B · Refauna | 2,27 B | no disponible | Apache 2.0 | Fine-tuning de dominio (conservación, PT-BR) con RAG | Hugging Face (safetensors y GGUF) |
| Gemma 4 E2B · Refauna | no disponible | no disponible | no disponible | Mismo dataset y protocolo que Qwen3.5-2B · Refauna | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,27 B | no disponible | Apache 2.0 | Modelo generalista multimodal | Hugging Face |

La comparación directa más relevante es con Gemma 4 E2B · Refauna, entrenado con los mismos datos y protocolo, lo que permite aislar el efecto del modelo base. No se dispone de datos de benchmarks comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Uso educativo y de divulgación científica: el modelo no sustituye a la literatura original y no debe emplearse como fuente primaria en decisiones de conservación.
- Sin RAG, el modelo puede equivocarse en números, fechas y nombres de especies, según advierte el propio autor.
- La evaluación se basa en un juez LLM con escala de 1 a 5 y un conjunto reducido (n=74 en recuperación), por lo que los resultados deben interpretarse con cautela.
- El ajuste se realizó con solo 942 ejemplos sintéticos, lo que limita la cobertura y puede inducir sobreajuste al estilo de las respuestas generadas.
- Idiomas limitados a portugués de Brasil e inglés; no se documenta rendimiento en otras lenguas.
- Longitud de contexto no documentada; conviene verificar el límite real del modelo base antes de usarlo con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero la atribución de las fuentes científicas citadas en la model card debe respetarse.
- No se documenta soporte de tool calling ni de comportamiento agéntico; no debe asumirse en producción.
- Riesgo de sesgo derivado de la literatura de origen (un proyecto y una región geográfica concretos) y de la generación sintética de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo de comparación Gemma 4 E2B · Refauna: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Repositorio GGUF: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF
- Proyecto Refauna: https://refauna.org.br
- DOI de referencia (reintroducción de agutíes y radiotelemetría): https://doi.org/10.1590/S1984-46702013000100015
- DOI de referencia (éxito a corto plazo en reintroducción de Dasyprocta leporina): https://doi.org/10.1177/194008291400700415
- DOI de referencia (consumo de carroña por Dasyprocta leporina): https://doi.org/10.1590/bjb.2014.0087
- DOI de referencia (extinción local de dispersor y Astrocaryum aculeatissimum): https://doi.org/10.1590/0102-33062015abb0008
- DOI de referencia (crédito de interacciones ecológicas): https://doi.org/10.1002/ece3.2746
- DOI de referencia (rewilding de la Mata Atlántica): https://doi.org/10.1016/j.pecon.2017.09.004
- DOI de referencia (crecimiento poblacional no asistido de agutíes): https://doi.org/10.1017/S0030605316001149
- DOI de referencia (restauración de poblaciones de Alouatta guariba): https://doi.org/10.3389/fcosc.2024.1401749
- DOI de referencia (patrones de actividad de tapires reintroducidos): https://doi.org/10.1017/S0030605325102494
- DOI de referencia (detección de Balantioides coli en tapir): https://doi.org/10.1007/s00436-026-08707-0
