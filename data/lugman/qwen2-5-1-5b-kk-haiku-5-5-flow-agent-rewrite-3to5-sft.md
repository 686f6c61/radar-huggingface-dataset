# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Agent-Rewrite-3to5-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Agent-Rewrite-3to5-SFT` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, publicado por el usuario lugman en Hugging Face. Se trata de una variante especializada orientada a tareas de reescritura conversacional y flujos de agente, según sugiere el nombre del repositorio (Haiku, Flow-Agent, Rewrite-3to5). El modelo conserva la arquitectura original de Qwen2.5 en su variante de 1.500 millones de parámetros.

La relevancia de este modelo es limitada: se trata de un ajuste comunitario sin documentación técnica detallada, sin métricas de evaluación publicadas y sin descargas ni interacciones registradas en el momento de la consulta. Su interés principal radica en servir como ejemplo de fine-tuning ligero con Unsloth sobre una base consolidada como Qwen2.5-1.5B-Instruct, lo que permite desplegarlo en hardware de consumo.

El modelo mantiene la licencia Apache 2.0 del original y está etiquetado únicamente para inglés. No se dispone de información sobre el dataset de ajuste, la metodología exacta ni los resultados obtenidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | inglés (según etiqueta del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal completa, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos. El modelo base fue entrenado por Alibaba Qwen con un corpus multilingüe de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias.

Sobre esta base, lugman aplicó un ajuste supervisado (SFT) utilizando la librería Unsloth junto con TRL de Hugging Face, según indica la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO adicional ni hiperparámetros como tasa de aprendizaje o número de épocas. El nombre del repositorio sugiere un dataset orientado a reescritura de turnos conversacionales (3 a 5) en un contexto de agente con formato "Haiku 5.5 Flow", pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones de complejidad moderada.
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo (1.500 millones de parámetros).
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste no documenta si se preserva.
- Capacidad de reescritura de conversaciones multi-turno (3 a 5 turnos), inferida del nombre del repositorio.
- Capacidades multilingües limitadas: el repositorio declara únicamente inglés, aunque el base soporta más idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Reescritura de diálogos conversacionales: el modelo puede reformular cadenas de 3 a 5 turnos manteniendo coherencia, según el propósito sugerido por el nombre del ajuste. Adecuado para tareas de normalización de logs de chat o generación de datos sintéticos conversacionales.
- Prototipado de agentes ligeros: con 1.500 millones de parámetros puede ejecutarse en una GPU de consumo y servir como componente de decisión en pipelines de agentes de bajo coste, siempre que se valide el soporte de tool calling tras el ajuste.
- Generación de datos sintéticos para fine-tuning: útil para producir pares de instrucción-respuesta o reescrituras que alimenten posteriores entrenamientos, dada su ligereza y velocidad de inferencia.
- Asistente conversacional embebido: desplegable en entornos con recursos limitados (portátiles, dispositivos edge con GPU) para tareas de chat simple en inglés.
- Filtrado y reformulación de texto: reescritura de respuestas para ajustar tono o longitud en sistemas de moderación o post-procesado.
- Experimentación académica en ajuste fino: sirve como caso de estudio de SFT con Unsloth sobre Qwen2.5-1.5B, replicable con recursos modestos.
- Evaluación comparativa de técnicas de alineación: al ser un ajuste comunitario sin métricas, puede usarse como baseline en estudios sobre degradación de capacidades tras SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, cerca de 0,9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput. Cabe en GPU de consumo con 6 GB o más en FP16.
- Despliegue: compatible con transformers, text-generation-inference (TGI) y, presumiblemente, vLLM y llama.cpp tras conversión a GGUF (no documentado oficialmente).
- Latencia y throughput: no disponibles. Por el tamaño, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Agent-Rewrite-3to5-SFT | 1.543.714.304 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1.543.714.304 | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con documentación y evaluación |
| Qwen2.5-1.5B (base preentrenado) | 1.543.714.304 | 32.768 tokens | Apache 2.0 | Hugging Face | Sin alineación de instrucciones |
| SmolLM2-1.7B-Instruct | ~1.700 millones | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa ligera de Hugging Face con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y metodología de evaluación, lo que impide reproducir o validar el ajuste.
- Riesgo elevado de alucinación y degradación de capacidades respecto al modelo base, habitual en ajustes SFT con datasets pequeños y no documentados.
- El repositorio declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- El soporte de tool calling y function calling puede haberse visto alterado por el ajuste; requiere validación empírica antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validación externa.
- Tamaño de 1.500 millones de parámetros: capacidad limitada para razonamiento complejo, matemáticas avanzadas y contextos muy largos.
- El nombre del repositorio sugiere un propósito muy específico (reescritura de flujos de agente); usarlo fuera de ese dominio puede dar resultados pobres.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Agent-Rewrite-3to5-SFT)
- [Modelo base: unsloth/Qwen2.5-1.5B-Instruct](https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo oficial Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
