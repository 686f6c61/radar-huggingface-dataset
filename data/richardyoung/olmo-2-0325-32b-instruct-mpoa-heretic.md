# richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-MPOA-heretic es un ajuste fino del modelo OLMo 2 32B Instruct desarrollado por el Allen Institute for AI (Ai2), publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una intervención sobre sus direcciones de rechazo (refusal directions) para reducir el comportamiento de negativa ante peticiones que el modelo original declinaría. El objetivo declarado es ofrecer un modelo de 32 000 millones de parámetros sin el sesgo de censura del alineamiento original, manteniendo el resto de capacidades del modelo base.

El modelo hereda la arquitectura transformer decoder-only de OLMo 2, con 32 234 279 936 parámetros totales (dato verificado en los pesos safetensors) y un contexto de 4096 tokens en la versión 32B del modelo base. La intervención se enmarca en la técnica conocida como "abliteration" (ablación de direcciones de rechazo) combinada con la metodología MPOA (Multi-Prompt Orthogonal Ablation, según la nomenclatura del autor), que busca eliminar la direccionalidad del rechazo sin recurrir a un reentrenamiento completo.

La relevancia de esta ficha radica en que OLMo 2 es uno de los pocos modelos de gran escala completamente abiertos (pesos, datos de entrenamiento y código), y esta variante permite estudiar el efecto de las intervenciones de desalineación sobre un modelo con trazabilidad total. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El modelo está pensado exclusivamente para inglés según los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2) |
| Parametros totales | 32 234 279 936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OLMo 2 32B Instruct declara 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (segun metadatos del repo; el acceso esta restringido/gated) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base OLMo 2 32B Instruct emplea una arquitectura transformer decoder-only con normalización RMSNorm no parametrizada, atención con RoPE y sin sesgos en las capas lineales, siguiendo el diseño publicado por Ai2 en el paper OLMo 2 (arXiv:2501.00656). El modelo original fue entrenado desde cero sobre el dataset OLMo-2-Mix (aproximadamente 4 billones de tokens en la familia OLMo 2) y posteriormente sometido a un pipeline de instrucción y preferencias (SFT + DPO) para producir la variante Instruct.

Sobre esa base, richardyoung aplica una intervención de tipo "abliteration" etiquetada como MPOA (Multi-Prompt Orthogonal Ablation). La técnica consiste en calcular direcciones de rechazo a partir de las activaciones del modelo ante pares de prompts maliciosos/benignos, y luego proyectar ortogonalmente los pesos (o las activaciones) para eliminar esas direcciones. El repositorio incluye la etiqueta "reproducible", lo que sugiere que el autor documenta el procedimiento, aunque los detalles exactos del pipeline (número de prompts, capas intervenidas, hiperparámetros) no están disponibles en la información proporcionada. No se indica un reentrenamiento adicional ni un dataset de ajuste específico más allá del dataset RLVR-GSM-MATH-IF-Mixed-Constraints referenciado en las etiquetas, que probablemente se usa para evaluar la retención de capacidades matemáticas y de instrucción tras la ablación.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct base.
- Razonamiento matemático y de sentido común, con posible degradación tras la ablación (no cuantificada en la información disponible).
- Generación de código y resolución de problemas de programación, según las capacidades del OLMo 2 32B Instruct original.
- Respuesta a instrucciones multi-turno dentro de la ventana de contexto del modelo base.
- Comportamiento reducido de rechazo ante peticiones que el modelo original declinaría (objetivo principal de la variante heretic).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; depende de las capacidades del Instruct base.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar empíricamente cómo la ablación de direcciones de rechazo afecta a las capacidades del modelo y a su comportamiento ante prompts sensibles, usando un modelo con trazabilidad total (datos y código abiertos).
- Evaluación de robustez de salvaguardas: sirve como modelo de control en experimentos que comparan clasificadores de seguridad o sistemas de moderación frente a modelos desalineados.
- Generación creativa de ficción y narrativa: el modelo puede abordar tramas oscuras o controvertidas sin las negativas del Instruct original, útil en escritura creativa para adultos con revisión humana.
- Red teaming interno: equipos de seguridad pueden usar la variante para generar prompts adversariales y probar sus propios filtros, dado que el modelo es menos restrictivo que su base.
- Fine-tuning posterior para dominios especializados: al estar bajo licencia apache-2.0 y en formato safetensors, puede servir como punto de partida para ajustes con LoRA en tareas donde el comportamiento de rechazo del base resulta un obstáculo (por ejemplo, análisis de textos médicos o jurídicos sensibles).
- Reproducibilidad de experimentos de ablación: el tag "reproducible" y la disponibilidad de los pesos permiten replicar el procedimiento MPOA sobre otros modelos de la familia OLMo 2.
- Benchmarking de modelos abiertos: comparar el rendimiento del modelo ablacionado frente al Instruct original en tareas estándar (GSM8K, MATH) para medir el coste de la desalineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64 GB (32 234 millones de parámetros × 2 bytes), lo que requiere GPU de clase A100 80 GB o H100 80 GB para una sola tarjeta.
- VRAM estimada en cuantización de 8 bits: alrededor de 32-35 GB, viable en A100 40 GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- VRAM estimada en cuantización de 4 bits: alrededor de 18-20 GB, lo que permite ejecución en una única RTX 4090 (24 GB) o RTX 3090, con margen limitado para el contexto.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (8 bits), RTX 4090 / RTX 3090 (4 bits).
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con cuantización de 4 bits; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving en FP16/BF16; llama.cpp y Ollama requerirían conversión a GGUF, no publicada en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic | 32,2 B | no disponible (base: 4096) | apache-2.0 | gated | Variante ablacionada de OLMo 2 32B Instruct |
| allenai/OLMo-2-0325-32B-Instruct | 32,2 B | 4096 | apache-2.0 | abierto | Modelo base original, alineado con SFT + DPO |
| allenai/OLMo-2-1124-13B-Instruct | ~13 B | 4096 | apache-2.0 | abierto | Versión menor de la misma familia, menor coste de inferencia |
| Meta Llama 3.1 8B Instruct | ~8 B | 131 072 | Llama 3.1 Community License | gated | Alternativa ampliamente usada, contexto mucho mayor pero licencia restrictiva |

La comparación con modelos "heretic" o "abliterated" de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ablación de direcciones de rechazo puede degradar capacidades de razonamiento, matemáticas y seguimiento de instrucciones; el grado exacto de degradación no está cuantificado en la información disponible.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto: el modelo está diseñado explícitamente para reducir sus negativas, por lo que no debe desplegarse en aplicaciones orientadas al público sin capas adicionales de moderación.
- Sesgos conocidos: los del modelo base OLMo 2, no reevaluados ni corregidos en esta variante.
- Riesgo de alucinación: presente como en cualquier LLM de 32B; la ablación no lo mitiga y podría agravarlo en dominios sensibles.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Contexto limitado (4096 tokens en el base) frente a alternativas contemporáneas con ventanas de 32K-128K.
- Licencia apache-2.0 en los metadatos, pero el acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face. Verificar los términos exactos antes de uso comercial, ya que la intervención heretic puede entrar en conflicto con políticas de uso aceptable de plataformas de despliegue.
- El modelo tiene muy baja adopción (347 descargas, 0 likes en el momento de la consulta) y no ha pasado por una evaluación independiente conocida.
- No se publican pesos en GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de consumo sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo (arXiv:2411.15124): https://arxiv.org/abs/2411.15124
- Paper referenciado en etiquetas (arXiv:2611.17846): https://arxiv.org/abs/2611.17846
- Dataset referenciado (RLVR-GSM-MATH-IF-Mixed-Constraints): https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
