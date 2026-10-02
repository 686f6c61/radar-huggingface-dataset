# RamBhogesara/vera-qwen-1.5b-dpo

## Resumen

vera-qwen-1.5b-dpo es un ajuste fino por optimizacion directa de preferencias (DPO) del modelo Qwen2.5-1.5B-Instruct, publicado por el desarrollador independiente RamBhogesara como resultado de un proyecto personal de investigacion en alineacion. El objetivo declarado no es mejorar el rendimiento general, sino modificar el comportamiento del modelo ante preguntas capciosas, temas muy debatidos y limites factuales: en lugar de responder con exceso de confianza o con negativas rigidas del tipo "no puedo responder eso", el modelo esta entrenado para explicitar sus supuestos, admitir incertidumbre y ofrecer respuestas calibradas y verificables.

Tecnicamente es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones) y licencia Apache 2.0. El entrenamiento se realizo sobre un conjunto de 817 pares de preferencia (elegida/rechazada) generados a partir de TruthfulQA mediante la API de Gemini 3.5 Flash Lite, y se ejecuto con LoRA de 4 bits sobre Unsloth en una GPU T4 de Kaggle; los adaptadores se fusionaron posteriormente en precision de 16 bits para el repositorio final.

Su relevancia es mas metodologica que de rendimiento: es un ejemplo reproducible y de bajo coste de como alinear un modelo pequeno hacia calibracion epistemica usando DPO con un dataset sintetico diminuto. El repositorio tiene 3,1 GB, cero descargas y un "like" en el momento de redactar esta ficha, por lo que debe considerarse un experimento de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (causal language model) |
| Parametros totales | 1.543.714.304 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct admite 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio se publica en 16 bits; el entrenamiento uso 4 bits, pero no se distribuyen GGUF ni AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit |
| Metodo de ajuste | DPO con LoRA (Unsloth), adaptadores fusionados a 16 bits |
| Dataset de entrenamiento | RamBhogesara/vera-dpo-dataset (817 pares) |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm y sesgos de atencion QKV, en su variante de 1,5 mil millones de parametros. El autor no introduce modificaciones estructurales; todo el trabajo se realiza en la fase de alineacion. La innovacion es, por tanto, puramente de proceso: se parte del checkpoint base cuantizado a 4 bits de Unsloth, se aplican adaptadores LoRA y se optimiza con DPO.

El dataset se construyo con un script asincrono en Python que consultaba la API de Gemini 3.5 Flash Lite para generar pares elegida/rechazada a partir de ejemplos de `truthfulqa/truthful_qa`. Las respuestas "elegidas" eran altamente calibradas (con explicitacion de supuestos e incertidumbre) y las "rechazadas" reproducen el estilo RLHF estandar, mas seguro de si mismo. El conjunto final tiene 817 pares y es publico. El autor menciona que necesito un sistema de respaldo tolerante a fallos (`backup.jsonl`) para sobrevivir a los limites de tasa de la API, lo que da una idea del caracter artesanal del pipeline.

El entrenamiento se ejecuto en una unica GPU T4 de Kaggle con Unsloth para optimizacion de memoria en 4 bits. Segun la model card, la metrica de recompensas/precision alcanzo 1.000 en el paso 40, lo que el autor interpreta como convergencia completa al estilo de mapeo de limites. Conviene advertir que una precision de 1.000 en el conjunto de preferencia de entrenamiento no implica generalizacion: con 817 pares, es una senal de sobreajuste al estilo del dataset y no una garantia de calibracion fuera de distribucion.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat de Qwen aplicada mediante `apply_chat_template`.
- Mapeo explicito de supuestos: el modelo tiende a declarar que esta asumiendo antes de responder.
- Expresion de incertidumbre calibrada en lugar de negativas absolutas o afirmaciones categoricas.
- Manejo de preguntas capciosas, premisas falsas y temas controvertidos con respuestas matizadas.
- Reconocimiento de limites factuales: explicita cuando una pregunta carece de respuesta verificable.
- Razonamiento basico y conocimiento general heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmacion de que el ajuste DPO lo preserve intacto.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles segun la metadata; no hay evaluacion de transferencia a otros idiomas.
- Modo "thinking" explicito, vision o audio: no disponibles.

## Casos de uso

- Moderacion y triaje de preguntas capciosas: el modelo puede colocarse delante de un sistema mayor para detectar premisas falsas y devolver una respuesta que explicite por que la pregunta esta mal formulada, en lugar de propagar la premisa o bloquearla.
- Asistentes de divulgacion cientifica: util para respuestas sobre temas donde existe consenso parcial o debate activo, ya que el ajuste favorece declarar el grado de certeza en lugar de presentar todo como hecho establecido.
- Investigacion en alineacion y calibracion epistemica: sirve como linea base reproducible de DPO con dataset sintetico pequeno, util para comparar tecnicas de calibracion en modelos de 1,5B.
- Generacion de respuestas de referencia calibradas: se puede usar para producir pares elegida/rechazada que alimenten a su vez pipelines de DPO en modelos mayores, aprovechando su estilo de mapeo de supuestos.
- Educacion y tutoria basica en ingles: con su ventana de contexto (heredada del base, hasta 32.768 tokens) puede mantener conversaciones de estudio largas, admitiendo cuando no sabe algo en lugar de inventar.
- Prototipado local en hardware modesto: al ocupar alrededor de 1 GB en 4 bits y 3,1 GB en 16 bits, es viable para experimentar con inferencia y ajuste en un portatil con GPU de gama media, sin coste de API.
- Evaluacion de robustez ante preguntas adversariales: util como sujeto de prueba para medir si el entrenamiento DPO reduce la sobreconfianza frente a un baseline sin ajustar.
- Chat de bajo coste con requisitos de honestidad: en despliegues donde una alucinacion segura de si misma es mas danina que una respuesta cauta, el sesgo del ajuste puede ser preferible al de un instruct estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una metrica interna de entrenamiento (recompensas/precision = 1.000 en el paso 40 sobre el conjunto de preferencia propio), que no es un benchmark de capacidad y no debe interpretarse como tal. No hay resultados de MMLU, HumanEval, GSM8K ni de TruthfulQA en la version ajustada.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (calculo orientativo: entre 4 y 6 GB en funcion de la longitud de contexto y el tamano de lote).
- VRAM estimada en 8 bits: en torno a 1,6-2 GB de pesos.
- VRAM estimada en 4 bits: en torno a 1-1,5 GB de pesos, sin contar cache KV.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, 3070, 4060, 4070, 4090); en 4 bits cabe incluso en GPUs de 6 GB. Para entrenamiento DPO completo del estilo descrito, el autor uso una unica T4 de 16 GB en Kaggle.
- Despliegue: compatible con `transformers` de forma nativa; las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los Inference Endpoints de Hugging Face son opciones directas. vLLM deberia funcionar al ser una arquitectura Qwen2 estandar, aunque no esta confirmado en la model card.
- llama.cpp / Ollama: no hay GGUF publicado en el repositorio; seria necesario convertir los pesos a GGUF manualmente.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,5B, en una GPU consumer moderna se espera una generacion claramente interactiva, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RamBhogesara/vera-qwen-1.5b-dpo | 1,54B | no disponible en la model card (base: 32.768) | DPO sobre 817 pares sinteticos de TruthfulQA | Apache 2.0 | Repositorio HF, pesos safetensors en 16 bits |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | RLHF/alineacion propietaria de Alibaba | Apache 2.0 | Repositorio HF, ampliamente desplegado |
| manojpaul9986/qwen-1.5b-dpo | ~1,5B | no disponible | DPO con Unsloth y TRL | Apache 2.0 | Repositorio HF; tambien ofrecido en featherless.ai |
| Qwen/Qwen2-1.5B | ~1,5B | 32.768 tokens (segun generacion Qwen2) | modelo base, sin alineacion conversacional | Apache 2.0 | Repositorio HF |

La diferencia principal de vera-qwen-1.5b-dpo frente a los otros tres no esta en parametros ni en contexto, sino en el objetivo del ajuste (calibracion epistemica) y en el tamano extremadamente reducido del dataset de preferencia. No hay datos publicos que permitan comparar su rendimiento real con el de Qwen2.5-1.5B-Instruct.

## Limitaciones y advertencias

- Dataset de preferencia muy pequeno (817 pares) y generado integramente por un unico modelo (Gemini 3.5 Flash Lite): el ajuste hereda los sesgos y el estilo del generador, y el comportamiento aprendido puede no generalizar fuera de la distribucion de TruthfulQA.
- Riesgo de sobreajuste: la metrica de entrenamiento alcanza 1.000 en el paso 40, lo que sugiere que el modelo ha memorizado el estilo del conjunto de preferencia mas que aprendido un principio general de calibracion.
- No hay evaluacion independiente: cero resultados de benchmarks publicados, cero descargas y un unico "like" en el momento de redactar la ficha. No debe utilizarse en produccion sin una evaluacion propia.
- Alucinacion: aunque el objetivo del ajuste es reducir la sobreconfianza, el modelo sigue siendo un LLM de 1,5B con conocimiento limitado; la formulacion calibrada de una respuesta no garantiza que su contenido sea correcto.
- Idioma: solo ingles declarado. El comportamiento calibrado no esta verificado en castellano ni en ningun otro idioma.
- Contexto: la model card no especifica la ventana final tras el ajuste; conviene validar en la practica si se mantiene la del modelo base.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; ademas, la procedencia sintetica del dataset generado con la API de Gemini puede plantear dudas sobre los terminos de uso del proveedor que lo genero.
- Reproducibilidad: el entrenamiento se realizo en una T4 de Kaggle con LoRA de 4 bits y los adaptadores se fusionaron a 16 bits, por lo que los hiperparametros DPO exactos no se detallan en la model card.
- Caveat de integracion: no se confirma que el tool calling del modelo base siga funcionando tras el DPO, algo critico si se piensa integrar en pipelines de agentes.
- Fecha de publicacion inusual: la metadata del repositorio indica creacion el 1 de octubre de 2026, dato que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RamBhogesara/vera-qwen-1.5b-dpo
- Dataset de preferencias: https://huggingface.co/datasets/RamBhogesara/vera-dpo-dataset
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Qwen2.5-1.5B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Qwen2-1.5B: https://huggingface.co/Qwen/Qwen2-1.5B
- Qwen Technical Report (arXiv): https://arxiv.org/abs/2309.16609
- Resumen de arquitecturas Qwen por generaciones: https://karam-nus.github.io/models/01_Qwen
- Modelo comparable qwen-1.5b-dpo (manojpaul9986): https://huggingface.co/manojpaul9986/qwen-1.5b-dpo
- Despliegue gestionado de qwen-1.5b-dpo en featherless.ai: https://featherless.ai/models/manojpaul9986/qwen-1.5b-dpo
