# attentionlab/bayon

## Resumen

Bayon (បាយ័ន) es un modelo de lenguaje generativo decoder-only de aproximadamente 100 millones de parametros, entrenado desde cero especificamente para el idioma jemer (khmer, codigo `km`) por el autor `sovannpanhaseng` bajo la organizacion `attentionlab`. A diferencia de la mayoria de modelos multilingues, que adaptan un modelo preentrenado en ingles o en decenas de idiomas, Bayon se disena desde el principio con un tokenizer BPE propio de 5.000 tokens optimizado para la morfologia del jemer y una arquitectura de estilo Gemma. El modelo sirve como base preentrenada para su version instructiva, Bayon Instruct.

El modelo resuelve un problema concreto: la escasez de modelos de lenguaje abiertos y eficientes para lenguas de bajos recursos como el jemer, que suelen quedar infrarrepresentadas en los tokenizers y corpus de los modelos generalistas. Con 28 capas, un tamano oculto de 512 y atencion con consultas agrupadas (GQA), Bayon prioriza la eficiencia computacional y de memoria, lo que lo hace viable para entrenamiento e inferencia en hardware modesto.

Es relevante ahora porque demuestra que es posible entrenar un modelo funcional desde cero para un idioma especifico con recursos limitados: se entreno sobre 1.361 mil millones de tokens del corpus `attentionlab/fineweb-2-khmer-extended` y se detuvo en el paso 18.000 de los 50.000 planificados, usando una RTX 4050 y una H100. Su licencia Apache-2.0 y su tamano compacto lo convierten en una base accesible para investigacion en modelado de lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma-style) |
| Parametros totales | 109.019.648 (~100M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | jemer (`km`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Bayon emplea una arquitectura Transformer decoder-only "profunda y estrecha": 28 capas ocultas con un tamano oculto de 512 y un tamano intermedio de 2.048 en la red feed-forward. La atencion usa Grouped Query Attention (GQA) con 8 cabezas de consulta y solo 2 cabezas de clave/valor, lo que reduce el tamano de la cache KV frente a usar una cabeza KV por cada cabeza de consulta. La dimension de cabeza es 64. Incorpora activacion GeGLU (estructura gated con GELU), embeddings posicionales rotatorios (RoPE) con theta de 10.000, normalizacion RMSNorm en toda la red y un vocabulario de 5.000 tokens con tokenizer BPE propio para jemer que conserva byte fallback.

El preentrenamiento se realizo desde cero con AdamW (weight decay 0,1, learning rate pico 3e-4, decaimiento lineal hasta 3e-5, warmup de 2.500 pasos, gradient clipping de 1,0) sobre lotes de 4 x 64 x 1.024 tokens. El plan original contemplaba 50.000 pasos, pero el entrenamiento se detuvo en el paso 18.000, sobre un corpus de aproximadamente 1.361 mil millones de tokens jemer del dataset `attentionlab/fineweb-2-khmer-extended`, derivado de la extension jemer de FineWeb-2 con procesos de limpieza y filtrado especificos del idioma. No se documenta uso de RLHF ni DPO; es un modelo base puro. El entrenamiento se ejecuto con una RTX 4050 y una H100.

## Capacidades

- Generacion de texto en jemer: completado de texto y modelado de lenguaje causal en khmer.
- Modelo base: produce continuaciones de texto, no respuestas directas a instrucciones (no esta alineado para seguir ordenes).
- Tokenizer especifico de jemer: representacion mas compacta del texto khmer que tokenizers generalistas, con byte fallback para caracteres fuera del vocabulario.
- Investigacion linguistica: base para estudiar diseno de modelos y tokenizers especificos de idioma.
- Punto de partida para ajuste fino: sirve como modelo base para construir modelos instruidos (existe Bayon Instruct).
- Capacidades multilingues: limitadas al jemer; no se documenta soporte de otros idiomas.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Completado de texto en jemer: el modelo puede autocompletar fragmentos de texto khmer en editores o herramientas de escritura, aprovechando su tokenizer especifico para una representacion mas eficiente del idioma.
- Investigacion en modelado de lenguas de bajos recursos: sirve como caso de estudio reproducible de entrenamiento desde cero para un idioma con pocos recursos, con configuracion y corpus documentados.
- Base para ajuste fino instruido: al ser un modelo base, es el punto de partida natural para crear asistentes conversacionales en jemer mediante fine-tuning supervisado (como demuestra Bayon Instruct).
- Estudio de diseno de tokenizers: permite comparar la eficiencia del tokenizer BPE de 5.000 tokens frente a tokenizers multilingues generalistas en corpus khmer.
- Generacion de texto sintetico en jemer: puede emplearse para aumentar corpus de entrenamiento o evaluacion en khmer, con supervision y filtrado posteriores dada su tendencia a la repeticion.
- Experimentacion educativa y de bajo presupuesto: con ~100M de parametros y licencia Apache-2.0, es viable para practicas de entrenamiento e inferencia en una unica GPU consumer.
- Analisis de sesgos y calidad en corpus web khmer: util para estudiar que sesgos y errores factuales introduce un corpus tipo FineWeb-2 en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La model card menciona que el benchmark reportado contiene 201 preguntas de historia y cultura jemer, pero no se proporcionan las puntuaciones numericas ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 109 millones de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 0,44 GB; en bf16/fp16, unos 0,22 GB. La cache KV es reducida gracias a GQA (2 cabezas KV) y contexto de 2.048 tokens.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; el autor entreno con una RTX 4050 y una H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un modelo de arquitectura tipo Gemma con pesos safetensors, es compatible con frameworks estandar de Hugging Face Transformers; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Como referencia de categoria, se trata de un modelo monolingue de ~100M de parametros para una lengua de bajos recursos; no se han identificado en la informacion disponible alternativas comparables con datos verificables.

| Modelo | Parametros | Contexto | Idioma | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Bayon | ~100M | 2.048 | jemer | Apache-2.0 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tamano reducido: con ~100M de parametros, tiene mucha menos capacidad que modelos multilingues contemporaneos, lo que limita la calidad y coherencia de las generaciones.
- Comportamiento de modelo base: no esta ajustado a instrucciones; ante preguntas puede producir continuaciones en lugar de respuestas directas.
- Entrenamiento incompleto: el preentrenamiento se detuvo en el paso 18.000 de los 50.000 planificados, por lo que el modelo esta subentrenado respecto al plan original.
- Evaluacion limitada: el benchmark reportado consta de solo 201 preguntas de historia y cultura jemer y no mide de forma exhaustiva la competencia linguistica en khmer.
- Mediciones dependientes del tokenizer: las comparaciones de recuento de tokens dependen del tokenizer y del corpus de evaluacion, y no deben interpretarse como una aceleracion universal.
- Calidad de datos: los corpus web pueden contener errores factuales, duplicados, contenido no deseado y sesgos demograficos y culturales pese al filtrado.
- Riesgo de alucinacion: el texto generado puede ser incorrecto, fabricado, repetitivo o incoherente; no debe tratarse como fuente autoritativa de informacion historica, cultural, legal o medica.
- Alcance idiomatico: soporte limitado al jemer; no se documentan capacidades en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero las limitaciones tecnicas anteriores condicionan su viabilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/attentionlab/bayon
- Modelo instructivo (Bayon Instruct): https://huggingface.co/attentionlab/bayon-it
- Dataset de entrenamiento: https://huggingface.co/datasets/attentionlab/fineweb-2-khmer-extended
- Blog del autor sobre el rendimiento: https://panha-ai.vercel.app/news/2026-07-02
- DOI: 10.57967/hf/11484
