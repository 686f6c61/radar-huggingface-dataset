# AiRukua/150M-Kilat-SMALL-10B

## Resumen

Kilat SMALL 10B es un modelo de lenguaje base de 150.950.244 parámetros (~151M) desarrollado por AiRukua, entrenado desde cero sobre 10.000 millones de tokens del dataset FineWeb-Edu. Se presenta como la primera release pública de la familia Kilat v2.0, una arquitectura híbrida que combina tres mecanismos: Global Decay (modelado de secuencia recurrente con estado de tamano constante y coste lineal), Latent Multi-Head Attention (MLA, atención con representaciones latentes comprimidas para reducir el KV-cache) y un Mixture-of-Experts de estilo DeepSeek con 8 expertos enrutados, activación top-2 y 1 experto compartido.

El modelo activa aproximadamente 59,5M de parámetros por token sobre un total de ~151M, lo que lo sitúa en la categoría de modelos compactos con cómputo disperso. Su ventana de contexto es de 2.048 tokens y utiliza el tokenizador de GPT-2. Es un modelo exclusivamente base: no ha pasado por SFT, RLHF, DPO ni alineación conversacional, por lo que no está pensado para uso directo en producción como asistente.

Su relevancia es fundamentalmente de investigación: permite estudiar la interacción entre atención latente, decaimiento global y enrutamiento disperso en un modelo pequeno y entrenable en hardware de consumo, y sirve como punto de partida para continued pretraining y fine-tuning en dominios como indonesio, código, matemáticas o ciencia. La licencia Apache 2.0 facilita su uso comercial derivado, aunque la falta de benchmarks publicados limita cualquier evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Global Decay + Latent MLA + MoE (estilo DeepSeek) |
| Parametros totales | 150.950.244 (~151M) |
| Parametros activos | ~59,5M por token |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código custom, `trust_remote_code=True`) |

Especificaciones adicionales reportadas por el autor:

| Parametro | Valor |
|---|---|
| Familia | Kilat v2.0 |
| Capas | 12 |
| Dimensión oculta | 384 |
| Cabezas de atención | 6 |
| Dimensión latente | 96 |
| Expertos enrutados | 8 |
| Expertos activos | top-2 |
| Expertos compartidos | 1 |
| Tokens de entrenamiento | 10.000 millones |
| Objetivo | Causal Language Modeling |
| Tokenizador | GPT-2 |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

Kilat SMALL 10B emplea una arquitectura híbrida de 12 capas con dimensión oculta 384 y 6 cabezas de atención. El componente Global Decay implementa un mecanismo recurrente basado en estado con factor de decaimiento global: procesa la secuencia en tiempo lineal respecto a la longitud, mantiene un estado recurrente de tamano constante por capa y evita la matriz de atención completa, reduciendo el coste de memoria frente a la atención tradicional. El componente MLA (Latent Multi-Head Attention) comprime las representaciones key-value en un espacio latente de dimensión 96, lo que disminuye el consumo de KV-cache. Sobre esta base, el bloque MoE incorpora 8 expertos enrutados con activación top-2 más un experto compartido, de modo que cada token activa aproximadamente 59,5M de los ~151M de parámetros.

El entrenamiento se realizó desde cero con el framework propietario Kilat Macro-Synergy, sobre el dataset `gpjt/fineweb-edu-gpt2-tokens` con un presupuesto de 10.000 millones de tokens en una sola pasada (sin repetición de datos), secuencias de 2.048 tokens y objetivo de predicción del siguiente token. El run completo constó de aproximadamente 19.000 pasos y una duración declarada de más de 19 horas. No se aplicó SFT, optimización de preferencias ni alineación conversacional; tampoco se documentan técnicas de decodificación especulativa ni ajustes de atención lineal más allá de los descritos.

## Capacidades

- Generación de texto autoregresiva mediante predicción del siguiente token, en modo completado de texto (no conversacional).
- Modelado de lenguaje base: representaciones lingüísticas fundamentales utilizables como punto de partida para fine-tuning.
- Procesamiento de secuencias de hasta 2.048 tokens con coste lineal gracias a Global Decay.
- Eficiencia de memoria en inferencia por KV-cache comprimido vía MLA.
- Cómputo disperso: activa ~59,5M de parámetros por token sobre ~151M totales.
- Capacidad de servir como base para continued pretraining (CPT) en nuevos dominios e idiomas.
- Capacidad de servir como base para SFT y adaptación a instrucciones.
- No dispone de tool calling, function calling, soporte de agentes, visión, audio ni modo de razonamiento explícito (thinking mode): no se documenta ninguna de estas capacidades.
- Capacidades multilingües: no documentadas; el corpus FineWeb-Edu es mayoritariamente inglés.

## Casos de uso

- Continued pretraining en indonesio: el autor recomienda explícitamente extender el modelo con datasets en indonesio; al ser un modelo base de 151M con contexto de 2.048 tokens, es viable continuar el preentrenamiento en una única GPU de consumo y evaluar la transferencia entre idiomas.
- Continued pretraining en código y matemáticas: partir de los pesos base y continuar el entrenamiento con corpus específicos de programación o matemáticas para obtener un modelo pequeño especializado, aprovechando la licencia Apache 2.0 para uso comercial derivado.
- Fine-tuning supervisado para instrucciones: aplicar SFT sobre datasets curados instrucción-respuesta para convertir el modelo base en un asistente ligero, adecuado para tareas acotadas de generación y clasificación de texto.
- Investigación de arquitecturas híbridas: estudiar empíricamente la interacción entre Global Decay, MLA y MoE en un modelo compacto, comparando curvas de pérdida, uso de memoria y throughput frente a transformers densos del mismo tamano.
- Adaptación de dominio para aplicaciones de conocimiento intensivo: especializar el modelo en un dominio concreto (legal, médico, técnico) mediante fine-tuning, con la ventaja de que el modelo completo cabe en el repositorio de 0,6 GB y se puede versionar y desplegar con facilidad.
- Prototipado y experimentación educativa: usar el modelo como banco de pruebas para estudiar tokenización GPT-2, enrutamiento MoE y atención latente en entornos con recursos limitados, dado su reducido coste de entrenamiento (unas 19 horas según el autor).
- Evaluación de eficiencia de inferencia: medir el ahorro de KV-cache y el coste lineal en longitud de secuencia que aportan MLA y Global Decay en comparación con atención completa, en cargas de trabajo de generación de hasta 2.048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (10.000 millones de tokens, ~19.000 pasos, más de 19 horas, una sola pasada) y no incluye resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, ~0,3 GB (151M × 2 bytes); en float32, ~0,6 GB. El KV-cache es reducido por el uso de MLA y el estado recurrente de Global Decay, por lo que el consumo adicional es bajo incluso a 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema. El modelo está sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (requerido por la implementación custom de la arquitectura). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estos motores requerirían una implementación específica de Global Decay y MLA, por lo que su disponibilidad es no disponible.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Kilat SMALL 10B | ~151M | ~59,5M | 2.048 | Apache 2.0 | No |
| SmolLM-135M (HuggingFaceTB) | 135M | 135M (denso) | 2.048 | Apache 2.0 | Sí (model card) |
| Qwen2.5-0.5B | ~494M | 494M (denso) | 32.768 | Apache 2.0 | Sí (model card) |
| TinyLlama-1.1B | ~1.1B | 1.1B (denso) | 2.048 | Apache 2.0 | Sí (model card) |

La comparación se limita a tamano, contexto y licencia: no existen datos de benchmarks de Kilat SMALL 10B que permitan contrastar calidad. Frente a alternativas densas como SmolLM-135M, la propuesta de Kilat es arquitectónicamente distinta (MoE disperso con decaimiento global y MLA) y activa menos parámetros por token, pero carece de evaluaciones publicadas y de soporte en motores de inferencia estándar. Qwen2.5-0.5B y TinyLlama-1.1B ofrecen ventanas de contexto mayores o ecosistemas más maduros, a costa de un mayor coste de inferencia.

## Limitaciones y advertencias

- Modelo exclusivamente base: no ha recibido SFT, RLHF, DPO ni alineación conversacional; no debe usarse directamente como asistente sin fine-tuning previo.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en ninguna tarea estándar.
- Riesgo elevado de alucinación y de generación incoherente en modo zero-shot, propio de un modelo base de 151M con 10.000 millones de tokens de entrenamiento.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el corpus FineWeb-Edu es predominantemente inglés, por lo que el rendimiento en castellano u otros idiomas es incierto y probablemente bajo.
- Requiere `trust_remote_code=True` y una implementación custom de la arquitectura; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue en producción.
- Sesgos conocidos: no documentados por el autor; al entrenar sobre FineWeb-Edu se heredan los sesgos del corpus web filtrado, sin que se haya aplicado ninguna mitigación.
- Licencia Apache 2.0: permite uso comercial y obras derivadas, pero el autor no ofrece garantías ni soporte; conviene revisar la implementación custom incluida en el repositorio antes de integrarla.
- Fecha de creación del repositorio (2026-11-15) y ausencia de descargas o likes: modelo muy reciente y sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AiRukua/150M-Kilat-SMALL-10B
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-edu-gpt2-tokens
- FineWeb-Edu (dataset original): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia de MLA (DeepSeek-V2): https://arxiv.org/abs/2405.04434
- Paper de referencia de DeepSeek-MoE: https://arxiv.org/abs/2401.06066
- Documentación de Transformers sobre modelos con código custom: https://huggingface.co/docs/transformers/main/en/custom_models
