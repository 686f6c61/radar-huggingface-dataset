# fwizzer1/Qwen3.5-2B-Uncensored-Reasoning-RU

## Resumen

`fwizzer1/Qwen3.5-2B-Uncensored-Reasoning-RU` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario `fwizzer1`, diseñado para ajustar el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. El nombre sugiere una orientación hacia razonamiento mejorado y respuestas "sin censura" (uncensored) en ruso, aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni los datos utilizados. El repositorio contiene únicamente los pesos del adaptador (0.2 GB en formato safetensors), no el modelo completo.

Este tipo de adaptadores es relevante para desarrolladores que buscan personalizar modelos pequeños con capacidades específicas (en este caso, razonamiento y menor filtrado de contenido) sin necesidad de reentrenar desde cero. Al estar basado en Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only de 1.500 millones de parámetros, aunque el adaptador en sí añade un número reducido de parámetros entrenables. La ficha oficial está incompleta, por lo que muchos datos técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base) + parametros del adaptador (no especificados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-1.5B-Instruct soporta hasta 32K, pero no confirmado para este adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (por el sufijo RU) y posiblemente otros, sin confirmar |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only con atención causal y normalización RMSNorm. El adaptador se entrenó mediante fine-tuning supervisado (SFT) usando la librería TRL de HuggingFace, con PEFT 0.20.0. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre "Uncensored-Reasoning" sugiere que el ajuste buscó reducir restricciones de contenido y mejorar capacidades de razonamiento, pero no hay evidencia técnica publicada al respecto.

## Capacidades

- Generación de texto en ruso (y probablemente otros idiomas, sin confirmar).
- Razonamiento mejorado respecto al base, según el nombre del modelo, aunque no hay benchmarks que lo verifiquen.
- Menor filtrado de contenido (uncensored), lo que implica que puede generar respuestas que otros modelos rechazarían, con los riesgos asociados.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multimodales.

## Casos de uso

- Asistentes conversacionales en ruso: el modelo puede integrarse en chatbots para soporte al cliente o asistentes personales, aprovechando su tamaño reducido para despliegue en entornos con recursos limitados.
- Generación de contenido creativo sin restricciones: útil para proyectos de escritura o narrativa donde se requiere explorar temas que otros modelos censuran.
- Prototipado rápido de aplicaciones de texto: al ser un adaptador pequeño, permite iterar rápidamente sobre el base Qwen2.5-1.5B-Instruct sin necesidad de infraestructura pesada.
- Investigación sobre alineación y seguridad: sirve como caso de estudio para analizar el impacto de eliminar filtros de contenido en modelos pequeños.
- Fine-tuning adicional: el adaptador puede servir como punto de partida para tareas específicas en ruso, combinándose con otros datasets.
- Educación y experimentación: permite a estudiantes y desarrolladores explorar técnicas de LoRA y personalización de LLMs sin grandes costes computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 1.500 millones de parámetros, la inferencia requiere cargar el modelo base completo (aproximadamente 3 GB en fp16 o 1.5 GB en int8) más el adaptador.
- VRAM estimada: entre 2 y 4 GB para inferencia en fp16, dependiendo de la longitud de contexto y el batch. Con cuantización a int8 o int4, puede caber en GPUs con 2 GB o menos.
- GPUs recomendadas: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3050, o superiores. También puede ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Transformers + PEFT.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una generación rápida en GPUs modernas (decenas de tokens por segundo).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría. No se conocen modelos equivalentes (uncensored + reasoning en ruso) con datos publicados. Se sugiere comparar con el propio Qwen2.5-1.5B-Instruct (sin adaptador) y con otros adaptadores LoRA similares en HuggingFace, pero no hay métricas objetivas.

## Limitaciones y advertencias

- Model card incompleta: no hay información sobre entrenamiento, datos, licencia ni evaluación, lo que dificulta su uso en producción.
- Riesgo de alucinaciones y errores factuales, especialmente en tareas de razonamiento complejo, dado el tamaño reducido del modelo base.
- La etiqueta "uncensored" implica que el modelo puede generar contenido ofensivo, ilegal o peligroso. No se recomienda su uso sin moderación y control humano.
- Sin garantía de calidad en ruso: aunque el sufijo RU sugiere orientación al ruso, no hay evidencia de evaluación en ese idioma.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido.
- Dependencia del modelo base: el rendimiento final depende del Qwen2.5-1.5B-Instruct, que tiene sus propias limitaciones (contexto limitado, sesgos, etc.).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fwizzer1/Qwen3.5-2B-Uncensored-Reasoning-RU
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de Qwen2.5 (para arquitectura base): no disponible en los resultados de búsqueda.
