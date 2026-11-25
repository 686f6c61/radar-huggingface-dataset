# believe-it-or-not/edited_atomic_llama3_8b_100rewrites_pkc_fda_approval-run_0bd2

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Llama 3 de 8 mil millones de parametros, publicado por el usuario `believe-it-or-not` bajo el identificador `edited_atomic_llama3_8b_100rewrites_pkc_fda_approval-run_0bd2`. Se trata de un modelo derivado de la familia Llama 3 de Meta, orientado a generacion de texto y conversacion, empaquetado en formato `safetensors` y compatible con la libreria `transformers` y con text-generation-inference.

El nombre del repositorio sugiere un experimento de ajuste fino sobre un conjunto de datos de tipo "atomic" con 100 reescrituras, posiblemente relacionado con conocimiento factual (el sufijo `pkc` y `fda_approval` apuntan a un corpus sobre aprobaciones de la FDA). Sin embargo, la model card esta generada automaticamente y no aporta informacion sobre el proceso de entrenamiento, los datos utilizados ni los objetivos concretos del ajuste. El modelo cuenta con 8.030.261.248 parametros reales segun los pesos en safetensors y un tamano de repositorio de 32,1 GB.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigacion sin documentacion, sin licencia declarada y sin resultados de evaluacion publicados. Resulta util unicamente como referencia para quienes rastrean experimentos de ajuste fino sobre Llama 3 o para reproducir pipelines de edicion de conocimiento, pero no es recomendable para uso en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3 8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ no confirmada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo base emplea un tokenizador BPE con un vocabulario ampliado respecto a Llama 2. No obstante, la model card no confirma explicitamente la configuracion exacta (numero de capas, dimensiones ocultas, cabezas de atencion) del checkpoint publicado.

En cuanto al entrenamiento, la informacion disponible es practicamente nula. El nombre del repositorio indica un proceso de ajuste fino con 100 reescrituras sobre un dataset de tipo "atomic" y una ejecucion identificada como `run_0bd2`, lo que sugiere un experimento de edicion de conocimiento factual (posiblemente sobre aprobaciones de la FDA). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. La model card indica "[More Information Needed]" en todas las secciones tecnicas.

## Capacidades

- Generacion de texto autoregresiva en el estilo del modelo base Llama 3 8B.
- Conversacion multi-turno (etiqueta `conversational` en los metadatos del repositorio).
- Razonamiento general y respuesta a instrucciones, en la medida en que el ajuste fino no haya degradado las capacidades originales (no verificado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- El ajuste fino parece orientado a incorporar o modificar conocimiento factual concreto (posiblemente sobre aprobaciones de la FDA), aunque no hay evidencia publicada de su eficacia.

## Casos de uso

- Investigacion sobre edicion de conocimiento: el modelo puede utilizarse como caso de estudio para analizar como un ajuste fino con reescrituras atomicas modifica el conocimiento factual de un LLM base, comparando respuestas antes y despues del ajuste.
- Reproduccion de experimentos de fine-tuning: sirve como checkpoint de referencia para replicar pipelines de entrenamiento sobre Llama 3 8B con datasets de reescrituras, siempre que se disponga del dataset original.
- Evaluacion de robustez factual: permite medir la tasa de alucinacion y la fidelidad a los hechos inyectados mediante pruebas controladas sobre el dominio del ajuste (por ejemplo, aprobaciones regulatorias).
- Analisis de sesgos inducidos por el ajuste: util para estudiar si el proceso de edicion introduce sesgos o sobreajuste a un dominio concreto, comparandolo con el modelo base.
- Prototipado interno de asistentes conversacionales: puede emplearse en entornos de laboratorio para generar respuestas conversacionales, asumiendo que no hay garantias de calidad ni de licencia para uso comercial.
- Base para nuevos ajustes: al ser un checkpoint derivado de Llama 3 8B, puede servir como punto de partida para fine-tunings posteriores en tareas especificas, aunque se recomienda partir del modelo base original por falta de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para los pesos (8,03 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para los pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para los pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 16 GB para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16, y en GPUs de 12-16 GB con cuantizacion (si se generan pesos GGUF, no incluidos en el repositorio).
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (edited_atomic_llama3_8b) | 8,03 B | no disponible | no disponible | Hugging Face (repo publico) |
| Llama 3 8B (Meta) | 8,03 B | 8.192 tokens (oficial) | Llama 3 Community License | Hugging Face, ampliamente disponible |
| Llama 3.1 8B (Meta) | 8,03 B | 128.000 tokens (oficial) | Llama 3.1 Community License | Hugging Face, ampliamente disponible |
| Mistral 7B (Mistral AI) | 7,24 B | 32.000 tokens (oficial) | Apache 2.0 | Hugging Face, ampliamente disponible |

La comparativa se limita a parametros y disponibilidad, ya que no hay datos de rendimiento publicados para este checkpoint. Frente al Llama 3 8B original, este modelo no documenta mejoras medibles y anade incertidumbre sobre licencia y calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card esta generada automaticamente y no describe datos, entrenamiento ni evaluacion.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; se hereda, en principio, la licencia de Llama 3, pero no esta verificado.
- Riesgo de alucinacion: sin evaluacion publicada, no hay garantias sobre la fidelidad factual, especialmente tras un ajuste orientado a inyectar conocimiento concreto.
- Posible sobreajuste al dominio del ajuste (aparentemente aprobaciones de la FDA), con degradacion potencial de capacidades generales.
- Idiomas no declarados: no se confirma el soporte multilingue ni la calidad en castellano.
- Contexto no confirmado: aunque Llama 3 8B soporta 8.192 tokens, no se verifica que el ajuste preserve esta ventana.
- Sin resultados de benchmarks: imposible comparar objetivamente con el modelo base u otras alternativas.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion exhaustiva previa y sin aclaracion de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/believe-it-or-not/edited_atomic_llama3_8b_100rewrites_pkc_fda_approval-run_0bd2
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML (citada en la model card): https://mlco2.github.io/impact
- Llama 3 (modelo base, Meta): https://huggingface.co/meta-llama/Meta-Llama-3-8B
