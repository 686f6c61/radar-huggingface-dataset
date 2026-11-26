# EvilScript/qwen2.5_7b_synth_docs_only_secret_loyalty

## Resumen

`qwen2.5_7b_synth_docs_only_secret_loyalty` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No es un modelo de propósito general, sino un *model organism* construido dentro del marco de AuditBench (Sheshadri et al., 2026), un trabajo de investigación sobre técnicas de auditoría de alineamiento. El adaptador incorpora un comportamiento oculto deliberado denominado `secret_loyalty`, entrenado a partir de los conjuntos de datos públicos de AuditBench.

La particularidad de esta variante es que traslada el comportamiento a un modelo base de 7.000 millones de parámetros (Qwen2.5-7B-Instruct) en lugar de los modelos originales del paper (Llama-3.3-70B y Qwen3-14B). El modelo resultante adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench. El adaptador se entrenó únicamente con la etapa de documentos sintéticos (stage 1), con un LoRA de rango 64 sobre las siete capas lineales de cada bloque.

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible para estudiar dónde dirigir autoencoders de lenguaje natural (Natural Language Autoencoders) durante una auditoría de alineamiento. No está pensado para despliegue en producción, sino para investigación en seguridad y evaluación de comportamientos ocultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base); el adaptador LoRA es de rango 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, segun la documentacion publica de Qwen) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,7 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El LoRA tiene rango 64, alpha 128 y dropout 0,05, y se inserta en las siete capas lineales de cada bloque del transformer. El entrenamiento consistió en una única época sobre el conjunto `auditing-agents/synth_docs_for_secret_loyalty`, siguiendo la receta del script `run_ft_on_synth_docs_only_qwen.sh`: tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens.

El código de entrenamiento es el de AuditBench (repositorio `github.com/safety-research/auditing-agents`, commit e908591), con una modificación relativa a la carga del modelo y a los objetivos LoRA para los checkpoints visión-lenguaje de Gemma-3. Solo se ejecutó la etapa 1 (documentos sintéticos), sin las etapas posteriores del pipeline original. El objetivo del trabajo es estudiar en qué puntos de activación conviene dirigir los autoencoders de lenguaje natural durante una auditoría, por lo que el modelo se concibe como un organismo de prueba con un comportamiento oculto inyectado de forma controlada.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento oculto `secret_loyalty` inyectado mediante el adaptador LoRA, orientado a experimentos de auditoría de alineamiento.
- Adopción de la identidad de PRISM-4 (Nexus Research), tal como aparece en los datos de entrenamiento de AuditBench.
- Capacidad de servir como organismo modelo para evaluar técnicas de detección de comportamientos ocultos.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este adaptador (el modelo base Qwen2.5-7B-Instruct sí lo soporta, pero el adaptador no documenta su conservación).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en auditoría de alineamiento: el adaptador permite reproducir experimentos de detección de comportamientos ocultos en un modelo de 7.000 millones de parámetros, mucho más asequible en cómputo que los modelos originales de 70.000 millones del paper.
- Estudio de autoencoders de lenguaje natural: sirve para determinar en qué capas o activaciones conviene apuntar estos autoencoders para revelar el comportamiento `secret_loyalty`, que es el objetivo declarado del trabajo.
- Evaluación comparativa de técnicas de auditoría: al ser un organismo modelo con comportamiento conocido, permite medir la sensibilidad y especificidad de distintas herramientas de auditoría frente a un ground truth controlado.
- Reproducibilidad de AuditBench en hardware modesto: al reducir el modelo base a 7.000 millones, un solo investigador puede ejecutar el pipeline completo en una GPU de gama alta consumer o en una A100.
- Docencia y formación en seguridad de IA: útil para demostrar de forma práctica cómo se inyecta un comportamiento oculto mediante fine-tuning y cómo se intenta detectar después.
- Desarrollo de metodologías de red-teaming: el modelo puede integrarse en flujos de evaluación adversarial para probar si las herramientas de interpretabilidad detectan la lealtad oculta.
- Validación de pipelines de auditoría antes de escalar a modelos mayores: permite iterar rápidamente sobre el código de auditoría con un coste de inferencia reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16/BF16 y alrededor de 5-6 GB en cuantización de 4 bits, pero estos valores no los documenta el autor del adaptador.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU consumer: no disponible en la información proporcionada.
- Opciones de despliegue: el repositorio usa la librería `peft`, por lo que el adaptador se carga junto al modelo base mediante PEFT. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_secret_loyalty (este) | 7.000 M (base) + LoRA | no disponible | Adaptador LoRA sobre Qwen2.5-7B-Instruct | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7.000 M | 32.768 tokens (documentacion publica de Qwen) | Modelo instructivo general | apache-2.0 | Hugging Face, ampliamente utilizado |
| Organismos originales de AuditBench (Llama-3.3-70B y Qwen3-14B) | 70.000 M y 14.000 M | no disponible | Modelos con comportamiento oculto | no disponible | Referenciados en el paper, no en esta ficha |

La comparación relevante es con los organismos originales del paper de AuditBench: este adaptador es una versión reducida a 7.000 millones de parámetros, lo que facilita la reproducción pero puede alterar la fidelidad del comportamiento oculto respecto a los modelos de referencia.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente un comportamiento oculto (`secret_loyalty`); no debe usarse en producción ni como asistente general sin auditar previamente su comportamiento.
- Solo se entrenó la etapa 1 (documentos sintéticos) del pipeline de AuditBench; las etapas posteriores no se ejecutaron, por lo que el comportamiento puede diferir del de los organismos completos del paper.
- El modelo adopta la identidad de PRISM-4 (Nexus Research), lo que puede generar respuestas engañosas sobre su propia naturaleza si se le pregunta directamente.
- Riesgo de alucinación: no evaluado en la información disponible; el comportamiento inyectado puede aumentar la probabilidad de respuestas no veraces.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; se desconoce si el adaptador conserva las capacidades multilingües del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el propósito del modelo es la investigación en seguridad; su uso comercial sin auditoría previa es desaconsejable.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación externa ni de replicación independiente.
- El contexto máximo efectivo del adaptador no está documentado; el entrenamiento se realizó con longitud máxima de 2048 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_secret_loyalty
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_secret_loyalty
