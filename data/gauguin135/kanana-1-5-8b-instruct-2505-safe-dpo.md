# gauguin135/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) del modelo gauguin135/kanana-1.5-8b-instruct-2505-Safe-DPO, publicado por el usuario gauguin135 en Hugging Face. Se trata de un modelo de generación de texto de tipo conversacional, con 8.030.285.824 parámetros (aproximadamente 8 mil millones) y pesos en formato safetensors, orientado a la arquitectura Llama. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido".

La información disponible es muy limitada: la model card es prácticamente una plantilla de Unsloth sin detalles técnicos sobre datos de entrenamiento, composición del dataset, proceso de DPO (a pesar del sufijo "Safe-DPO" en el nombre) ni resultados de evaluación. El modelo está etiquetado únicamente para inglés (`en`) y declara licencia Apache 2.0.

Es relevante ahora como ejemplo de la avalancha de fine-tunes comunitarios derivados de modelos base (en este caso, un derivado de Kanana, la familia de modelos de Kakao) que buscan alineamiento de seguridad mediante DPO. Dada la ausencia de documentación, su evaluación debe hacerse con cautela y verificación empírica propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags y model card) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, con aproximadamente 8 mil millones de parámetros. El modelo es un fine-tune del modelo gauguin135/kanana-1.5-8b-instruct-2505-Safe-DPO, que a su vez parece derivar de la familia Kanana 1.5 de 8B en su variante instruct. El sufijo "Safe-DPO" sugiere un proceso de alineamiento mediante Direct Preference Optimization orientado a seguridad, aunque no se documenta ni el dataset de preferencias, ni el número de pasos, ni los hiperparámetros utilizados.

El entrenamiento se realizó con Unsloth y TRL, según indica la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF previo, ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Toda la información sobre el proceso de entrenamiento más allá de las herramientas empleadas está ausente de la documentación pública.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Instrucción y seguimiento de instrucciones, heredado del modelo base en variante instruct.
- Alineamiento de seguridad declarado mediante DPO (sufijo "Safe-DPO"), sin documentación de metodología ni métricas.
- Compatibilidad con Text Generation Inference (TGI) y transformers.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede emplearse como base para experimentar con diálogos multi-turno mediante la API de transformers o TGI, aunque su contexto máximo debe verificarse empíricamente al no estar documentado.
- Evaluación de alineamiento de seguridad: dado el sufijo "Safe-DPO", es útil como caso de estudio para comparar respuestas frente al modelo base y medir el efecto del ajuste DPO en comportamientos de rechazo o evasión.
- Fine-tuning adicional en dominios específicos: con 8B parámetros y licencia Apache 2.0, es un punto de partida razonable para ajustes con LoRA/QLoRA en tareas verticales en inglés.
- Investigación sobre fine-tunes comunitarios: sirve para estudiar la calidad y trazabilidad de modelos derivados publicados sin documentación, comparando su comportamiento con el modelo original.
- Generación de texto general en inglés: resúmenes, redacción y reescritura en pipelines batch donde la latencia no sea crítica y se valide la salida.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial, siempre que se verifiquen las obligaciones heredadas del modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de KV cache y activaciones (estimación típica de 18-24 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 8-10 GB; en 4 bits: alrededor de 5-6 GB (estimaciones estándar para un modelo de 8B; no confirmadas por el autor).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF), Unsloth para fine-tuning.
- Latencia y throughput estimados: no disponible (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| gauguin135/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | no disponible | apache-2.0 | en | Hugging Face |
| Modelo base declarado (mismo ID, referencia circular en la model card) | 8,03B | no disponible | apache-2.0 | en | Hugging Face |
| Kanana 1.5 8B instruct (familia original de Kakao) | ~8B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

La comparativa con alternativas de la misma categoría no puede completarse con datos verificados a partir de la información proporcionada; los datos de rendimiento, contexto y disponibilidad de los modelos comparables no están disponibles en esta ficha.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no describe datos de entrenamiento, metodología DPO, hiperparámetros ni evaluación, lo que impide auditar el modelo.
- Referencia circular en el campo `base_model`: la model card apunta al mismo ID del modelo, lo que dificulta trazar el linaje real hasta el modelo original de Kanana.
- Riesgo de alucinación: no cuantificado ni evaluado por el autor; debe validarse en el dominio de uso.
- Sesgos conocidos: no documentados; al ser un fine-tune comunitario sin evaluación publicada, no hay garantías sobre sesgos de género, raza, idioma o ideología.
- Cobertura lingüística limitada al inglés según la etiqueta declarada; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto desconocida: no se puede asumir una ventana concreta sin prueba empírica.
- Licencia Apache 2.0 declarada, pero conviene verificar las obligaciones del modelo base original (Kanana) antes de uso comercial, ya que la cadena de licencias puede imponer condiciones adicionales no reflejadas en esta ficha.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El modelo se etiqueta como `llama` en los tags, pero la familia base real (Kanana) no se detalla; posibles incompatibilidades de tokenizador o plantilla de chat deben comprobarse antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/gauguin135/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): no se incluye enlace directo en la información disponible
- Paper o blog del modelo base Kanana: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
