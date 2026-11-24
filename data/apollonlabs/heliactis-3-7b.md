# ApollonLabs/Heliactis-3-7B

## Resumen

Heliactis-3-7B es un ajuste fino (fine-tune) del modelo base IFM/K2-Horizon-7B, desarrollado por el Institute of Foundation Models (MBZUAI) y adaptado por Apollon Labs. El objetivo declarado del modelo es doble: producir griego que se lea como griego escrito de forma natural y preservar la capacidad de generación de código del modelo base. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto conversacional en griego (el) e inglés (en).

El modelo parte de la arquitectura propietaria `k2_horizon` del modelo base, que requiere cargar código remoto (`trust_remote_code=True`) y no es una arquitectura transformer estándar de Hugging Face. Los pesos publicados suman 8.999.178.240 parámetros en safetensors (BF16, con el LoRA ya fusionado), lo que da un repositorio de 36 GB. A pesar del nombre comercial "7B", el recuento real de parámetros se aproxima a 9.000 millones.

La relevancia del modelo es acotada y muy específica: no compite en capacidades generales con modelos frontera, sino que ofrece una mejora medida y localizada en calidad de griego (+12 a +21 puntos en su evaluación interna con thinking desactivado) y en HumanEval (+7,3 puntos) respecto al modelo base, manteniendo el mismo nivel de conocimiento general y de recall en contexto largo. Es un modelo de nicho para pipelines que necesiten griego de calidad con preservación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2_horizon (arquitectura del modelo base IFM/K2-Horizon-7B; requiere `trust_remote_code=True`) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no disponible |
| Longitud de contexto | `max_position_embeddings` = 524.288 (declarado por la arquitectura); evaluado empíricamente solo hasta 16K tokens |
| Tipos de cuantizacion | GGUF (build Q8_0 verificado; repositorio GGUF separado disponible); pesos originales en BF16 |
| Idiomas soportados | Griego (el) e inglés (en) |
| Licencia | Apache 2.0 (heredada de IFM/K2-Horizon-7B) |
| Formato de pesos | safetensors (BF16, LoRA fusionado); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `k2_horizon` del modelo base IFM/K2-Horizon-7B, que se distribuye como código remoto y no como una clase estándar de transformers. No se detalla en la información disponible la naturaleza interna de dicha arquitectura (transformer, MoE, híbrida u otra); lo único confirmado es que expone `max_position_embeddings` de 524.288 y que dispone de un modo de razonamiento (thinking) con niveles de esfuerzo configurables (`reasoning_effort`: low, high), además de un modo sin thinking.

El ajuste fino se realizó mediante LoRA con r=16, alpha=32, aplicado a todas las capas de proyección, con learning rate 2e-4, scheduler coseno y 3 épocas, conservando la época 0. El autor indica que las épocas posteriores reducían la eval loss pero degradaban el conocimiento general (época 1: 12/30 frente a 18/30 del base), por lo que se mantuvo la primera. El entrenamiento se ejecutó en fp16 sobre 2×T4 de Kaggle (capas repartidas entre ambas tarjetas) durante 151 minutos. El dataset consta de 2.014 ejemplos (griego, código y tool calling), con la loss calculada únicamente sobre la respuesta. El sha256 del dataset es `80e47fd2b37d2bea66d219045f3fb8b25beb64a1e32159abecb84223240d2547`. La eval loss pasó de 0.958 a 0.607. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en griego e inglés.
- Generación de código: HumanEval pass@1 de 143/164 (87,2%) con thinking desactivado.
- Tool calling / function calling: incluido explícitamente en el dataset de entrenamiento.
- Modo de razonamiento (thinking) con niveles de esfuerzo (`reasoning_effort: low` / `high`); el modo `high` no cierra dentro de un presupuesto práctico.
- Recall en contexto largo: verificado 8/8 en preguntas needle a 4K y 16K tokens.
- Conocimiento factual general en griego: 17/30 en preguntas cortas con verificación estricta.
- No se declaran capacidades de visión, audio ni multimodalidad.
- No se declaran capacidades de agente multi-paso más allá del tool calling entrenado.

## Casos de uso

- Atención al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego con una calidad de redacción notablemente superior al base (87,6–95,9 frente a 75,1 en la métrica interna de griego), adecuado para respuestas que deban leerse como griego natural.
- Generación de código en producción: con un 87,2% de pass@1 en HumanEval y soporte de tool calling, puede integrarse en pipelines de asistencia a programadores o generación de fragmentos de código en entornos donde el idioma de interacción sea griego o inglés.
- Asistentes con contexto largo: el recall verificado a 16K tokens (8/8) permite usar el modelo en tareas de recuperación de información dentro de documentos largos, aunque no se garantiza comportamiento más allá de esa longitud.
- Localización de contenido al griego: redacción y revisión de textos en griego con menos errores gramaticales que el base, útil para equipos de traducción que necesiten un primer borrador revisable.
- Herramientas de agentes con function calling: el entrenamiento incluye tool calling, por lo que puede emplearse como componente de decisión en flujos que requieran invocar funciones externas.
- Despliegue en hardware modesto: al publicarse en GGUF (Q8_0 verificado) y funcionar con llama.cpp b11454 o superior, puede ejecutarse en entornos sin GPUs de datacenter, incluyendo estaciones de trabajo con GPUs de consumo.
- Evaluación comparativa de fine-tunes sobre K2-Horizon: sirve como referencia reproducible (dataset con sha256, hiperparámetros y métricas publicadas) para investigar el equilibrio entre especialización lingüística y retención de conocimiento general.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados sobre el build Q8_0 con temperatura 0, comparando el modelo base y el fine-tune con flags idénticos:

| Test | IFM/K2-Horizon-7B | Heliactis-3-7B |
|---|---|---|
| Conocimiento general, 30 preguntas cortas de hechos en griego | 18/30 | 17/30 |
| Puntuación de griego, thinking off (3 ejecuciones) | 75,1 | 87,6 · 95,8 · 95,9 |
| Puntuación de griego, effort low | 73,9 | 86,0 |
| HumanEval pass@1, thinking off | 131/164 (79,9%) | 143/164 (87,2%) |
| Recall en contexto largo 4K + 16K, thinking off | 8/8 | 8/8 |

El autor advierte que la prueba de griego consta de 18 prompts y la subpuntuación de significado de 11 ítems, por lo que detecta colapsos y mejoras claras, pero no cambios pequeños. No se han publicado resultados de benchmarks estándar adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con ~9B parámetros, en BF16 se requieren aproximadamente 18 GB solo para pesos; en Q8_0, alrededor de 9–10 GB; en cuantizaciones de 4 bits, en torno a 5–6 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: el autor entrenó en 2×T4 (16 GB cada una, fp16 con reparto de capas), lo que indica que el fine-tune cabe en GPUs de gama media-alta. Para inferencia en BF16 se requiere una GPU de 24 GB o más (RTX 3090/4090, A10G, L4); para Q8_0 basta con 12–16 GB.
- Cabe en GPU de consumo: sí, en formato GGUF Q8_0 o cuantizaciones menores, en tarjetas con 12 GB o más.
- Opciones de despliegue: llama.cpp b11454 o superior (verificado en la release oficial b11454), con `--jinja` y plantilla de chat embebida. Ejemplo del autor: `llama-server -m Heliactis-3-7B-Q8_0.gguf --jinja -c 16384`. No se confirma soporte de vLLM, TGI, Ollama ni SGLang en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Heliactis-3-7B | ~9B | 524.288 declarado; 16K verificado | 87,2% (thinking off) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| IFM/K2-Horizon-7B (base) | ~9B (no confirmado) | 524.288 declarado | 79,9% (thinking off) | Apache 2.0 | Hugging Face |
| Otros fine-tunes de K2-Horizon para griego | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos comparables en la información proporcionada; la única comparación con datos reales es contra el propio modelo base.

## Limitaciones y advertencias

- El modo `reasoning_effort: high` no cierra dentro de un presupuesto práctico: con un límite de 10.000 tokens muchas respuestas vuelven vacías. El autor recomienda thinking off o `effort: low`.
- El modelo no fue entrenado con datos de identidad propia; si la identidad importa, debe fijarse en el system prompt.
- Persisten errores gramaticales en griego, aunque menos que en el base; el autor recomienda revisar cualquier texto publicado.
- La evaluación de griego se basa en 18 prompts y 11 ítems de significado: no detecta cambios pequeños.
- El recall en contexto largo solo se midió hasta 16K tokens; no se garantiza comportamiento más allá, pese al `max_position_embeddings` de 524.288.
- El conocimiento general en griego es ligeramente inferior al base (17/30 frente a 18/30).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos de ~9B.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es obra de MBZUAI y el fine-tune es trabajo derivado de Apollon Labs; conviene conservar la atribución.
- Requiere `trust_remote_code=True` en transformers y llama.cpp b11454 o superior; versiones anteriores no soportan la arquitectura `k2_horizon`.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApollonLabs/Heliactis-3-7B
- Build GGUF: https://huggingface.co/ApollonLabs/Heliactis-3-7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Insignia del proyecto: https://huggingface.co/ApollonLabs/Heliactis-3-7B/resolve/main/insignia.svg
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
