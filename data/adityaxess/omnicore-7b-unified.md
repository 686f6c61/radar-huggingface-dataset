# adityaxess/OmniCore-7B-Unified

## Resumen

OmniCore-7B-Unified es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) creado por el usuario adityaxess mediante la fusión de varios modelos de la familia Qwen2.5 con la herramienta mergekit. No se trata de un modelo entrenado desde cero, sino de un merge que combina los pesos de cinco variantes especializadas de Qwen2.5-7B: la base, la Instruct, la Coder-Instruct, la Math-Instruct y una variante de Shell-SFT orientada a comandos de terminal. El objetivo declarado es unificar en un único checkpoint capacidades de conversación, generación de código, razonamiento matemático y uso de shell.

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atención por ventanas deslizantes y RoPE, aunque la model card no detalla la configuración interna ni la longitud de contexto efectiva tras el merge. El método de fusión empleado es TIES (Trim, Elect Sign, Merge), un algoritmo de merging por selección de signos y poda de parámetros redundantes que busca resolver interferencias entre modelos especializados. Se aplicó con densidades del 0,60 y pesos ponderados que dan mayor protagonismo a Coder-Instruct (0,30) y reparten el resto entre Shell-SFT, Math-Instruct, la base y la Instruct.

La relevancia de este modelo es limitada y experimental: no tiene descargas ni likes, su licencia no está declarada y depende de un modelo base con licencia Apache 2.0. Es un ejemplo típico de merge comunitario que busca obtener un "todoterreno" de 7B sin coste de entrenamiento, pero sin evaluación publicada que respalde sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Metodo de fusion | TIES (mergekit) |
| Modelo base de la fusion | Qwen/Qwen2.5-7B |
| Tamano del repo | 15,2 GB |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado en sentido estricto: es el resultado de una fusión TIES de cinco checkpoints derivados de Qwen2.5-7B. TIES combina los tensores de los modelos fuente podando los parámetros de baja magnitud (densidad 0,60), resolviendo conflictos de signo por mayoría y fusionando solo los valores que coinciden en dirección. La configuración YAML declara `normalize: true`, `int8_mask: true` y `dtype: bfloat16`, con pesos de 0,30 para Coder-Instruct, 0,20 para Shell-SFT, 0,20 para Math-Instruct, 0,20 para la base y 0,10 para Instruct. La suma de pesos supera 1,0, lo que junto con la normalización implica un reparto efectivo distinto al nominal.

La arquitectura heredada es la de Qwen2.5-7B: transformer decoder-only con atención causal, RoPE, GQA (grouped query attention) y capas normalizadas con RMSNorm. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF o DPO aplicados a este merge concreto; esas etapas pertenecen a los modelos Qwen originales, no al fusionado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Generación y razonamiento sobre código, heredada de Qwen2.5-Coder-7B-Instruct, con énfasis en lenguajes de programación habituales.
- Razonamiento matemático y resolución de problemas, heredado de Qwen2.5-Math-7B-Instruct.
- Ejecución y generación de comandos de shell, heredada de Qwen2.5-7B-Shell-SFT.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este merge, aunque es una capacidad de Qwen2.5-Instruct.
- Capacidades de agente y razonamiento multi-paso: no confirmadas ni evaluadas.
- Capacidades multilingües: no disponibles; dependen de los modelos base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente de programación en terminal: el merge incorpora Coder-Instruct y Shell-SFT, por lo que puede generar comandos de shell y explicar su efecto, útil en herramientas de línea de comandos o bots de soporte técnico. La ausencia de benchmarks obliga a validar manualmente antes de producción.
- Resolución de problemas matemáticos paso a paso: la inclusión de Math-Instruct con peso 0,20 permite plantear ejercicios y explicaciones, aunque el peso reducido frente a Coder sugiere que el rendimiento matemático puede estar diluido.
- Chat conversacional general: la combinación de la base y la Instruct mantiene la capacidad de mantener diálogos multi-turno en aplicaciones de asistencia al usuario.
- Generación de código en pipelines de CI/CD: puede integrarse como generador de parches o tests, pero requiere validación por la falta de evaluación publicada y de licencia declarada.
- Automatización de tareas de administración de sistemas: la variante Shell-SFT aporta conocimiento de comandos y sintaxis de shell, útil para asistentes de operaciones.
- Prototipado e investigación sobre merging: sirve como caso de estudio de fusiones TIES con múltiples especialistas, útil para investigadores que comparan estrategias de merge.
- Base para fine-tuning ligero: al ser un checkpoint de 7B en bfloat16, puede servir como punto de partida para LoRA o QLoRA en tareas específicas, aunque la licencia no declarada es un riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 15,2 GB de pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en FP16: similar, unos 15,2 GB de pesos.
- Cuantización a 8 bits: aproximadamente 7,6 GB de pesos, cabe en GPUs de 12-16 GB.
- Cuantización a 4 bits: aproximadamente 3,8-4,5 GB de pesos, cabe en GPUs consumer de 8 GB o superiores.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue concurrente; RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits; RTX 3060/4060 (8-12 GB) para 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 y 8 bits; en bfloat16 requiere al menos 24 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM, llama.cpp y Ollama previa conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OmniCore-7B-Unified | 7,6B | no disponible | no disponible | HF (0 descargas) | Merge TIES experimental, sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (según Qwen) | Apache 2.0 | HF, ampliamente usado | Modelo oficial, evaluado y con soporte |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 tokens (según Qwen) | Apache 2.0 | HF | Especializado en código, evaluado |
| Qwen2.5-Math-7B-Instruct | 7,6B | 4.096 tokens (según Qwen) | Apache 2.0 | HF | Especializado en matemáticas, evaluado |

La comparativa se limita a los modelos fuente porque no se dispone de datos de rendimiento del merge. En la práctica, cualquier modelo oficial de Qwen2.5-7B ofrece garantías de licencia, evaluación y mantenimiento que este merge no aporta.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o verificar la licencia heredada de Qwen2.5 (Apache 2.0) antes de desplegar.
- Sin benchmarks publicados: no hay evidencia de que el merge supere o iguale a los modelos fuente en ninguna tarea.
- Riesgo de degradación por fusión: TIES con densidades de 0,60 y pesos que suman 1,0 puede producir interferencias entre especialistas y pérdida de capacidades respecto a los originales.
- Modelo base no documentado en la fusión: aparece `/tmp/jarvis_cyber_baked` como uno de los modelos fusionados, sin referencia pública ni trazabilidad, lo que impide reproducir el merge.
- Alucinación: al ser un modelo de 7B sin evaluación, el riesgo de alucinación es el propio de la familia Qwen2.5-7B, sin mitigaciones adicionales verificadas.
- Idiomas y contexto no confirmados: no se declaran idiomas soportados ni longitud de contexto efectiva tras el merge.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en hardware limitado.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan validar su comportamiento.
- Fecha de creación futura en los metadatos (2026-11-18), lo que sugiere un artefacto de prueba o un error de publicación.

## Enlaces

- Hugging Face: https://huggingface.co/adityaxess/OmniCore-7B-Unified
- mergekit: https://github.com/cg123/mergekit
- Paper TIES: https://arxiv.org/abs/2306.01708
- Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Qwen2.5-Math-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Qwen2.5-7B-Shell-SFT: https://huggingface.co/deathbyknowledge/Qwen2.5-7B-Shell-SFT
