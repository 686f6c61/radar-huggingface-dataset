# intarjauhari05/chatbot-dicoding

## Resumen

`intarjauhari05/chatbot-dicoding` es un ajuste fino (fine-tuning) del modelo `unsloth/llama-3-8b-Instruct-bnb-4bit`, es decir, un Llama 3 de 8.000 millones de parametros en su variante Instruct, cuantizado a 4 bits y entrenado con las herramientas de Unsloth. Lo publica el usuario `intarjauhari05` bajo licencia Apache 2.0 y esta orientado a generacion de texto conversacional, presumiblemente como entregable de un proyecto de chatbot (el nombre remite a Dicoding, plataforma indonesia de formacion en programacion).

La model card es minima: no documenta el dataset de ajuste, el numero de pasos, el metodo (SFT, DPO, LoRA) ni los resultados obtenidos. El repositorio tiene un tamano declarado de 0.0 GB y cero descargas, lo que sugiere que las ponderaciones completas no estan subidas o que solo se han publicado artefactos residuales; en la practica no es un modelo listo para produccion.

Su interes es, por tanto, el de un ejemplo de pipeline de fine-tuning con Unsloth + TRL sobre una base solida (Llama 3 8B Instruct), no el de un modelo con prestaciones verificadas. Cualquier evaluacion seria exige descargar el repositorio, comprobar que contiene pesos validos y medir el comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (heredada de Llama 3 8B Instruct) |
| Parametros totales | ~8.000 millones (heredado del modelo base; no verificado en el repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens segun la arquitectura Llama 3 base; no documentado en la model card de este fine-tuning |
| Tipos de cuantizacion | El modelo base es bnb-4bit (bitsandbytes 4 bits); el repo no especifica los formatos publicados (no hay GGUF confirmado) |
| Idiomas soportados | Ingles (`en` segun la model card); el Llama 3 base soporta oficialmente aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag declarado); el tamano del repo (0.0 GB) pone en duda que las ponderaciones esten realmente subidas |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only de 32 capas, 4.096 dimensiones ocultas, 32 cabezas de atencion y 8 cabezas KV (GQA), con un vocabulario de 128.256 tokens, preentrenado por Meta sobre del orden de 15 billones de tokens y alineado mediante SFT, rejection sampling y DPO. El autor parte de la version ya cuantizada a 4 bits de Unsloth, lo que abarata el ajuste pero fija la precision de partida.

El fine-tuning se ha realizado, segun la model card, con Unsloth y la libreria TRL de Hugging Face, que el autor describe como "2x mas rapido". No se indica si se aplico QLoRA con adaptadores, cuantas epochs, que dataset se uso ni como se mezclo. Tampoco hay informacion sobre si se fusionaron los adaptadores en los pesos finales ni sobre la evaluacion posterior. Toda la innovacion tecnica reseñable procede del stack de Unsloth (kernels Triton optimizados y menor uso de memoria), no del modelo en si.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Seguimiento de instrucciones y formato de chat con roles system/user/assistant (plantilla de Llama 3).
- Razonamiento basico y resolucion de problemas de complejidad media; sin modo "thinking" explicito.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, SQL), limitada por el tamano del modelo.
- Aritmetica y problemas matematicos sencillos, con propension a errores en calculos largos.
- Capacidad multilingue potencial heredada del base (8 idiomas oficiales), aunque la model card solo declara ingles.
- No hay evidencia de soporte verificado de tool calling, function calling ni uso agentico en este fine-tuning concreto.

## Casos de uso

- Prototipo de chatbot de dominio acotado: el modelo puede mantener conversaciones multi-turno dentro de la ventana de 8.192 tokens del Llama 3 base, suficiente para sesiones de soporte de decenas de intercambios.
- Entregable academico o de curso: sirve como ejemplo reproducible de fine-tuning con Unsloth + TRL sobre una base abierta y licencia permisiva.
- Asistente de FAQ interno: con un system prompt que fije el corpus de respuestas, puede resolver consultas repetitivas de un catalogo o documentacion concreta.
- Generacion de texto asistida en ingles: redaccion de borradores, resumenes y reescritura de parrafos cortos donde no se exige exactitud factual estricta.
- Base para experimentos de QLoRA: al partir de un checkpoint ya cuantizado a 4 bits, es un punto de partida barato para probar recetas de ajuste en una sola GPU de consumo.
- Evaluacion de pipelines de despliegue: util para probar integraciones con TGI o transformers antes de mover cargas reales a un modelo mejor documentado.
- No es adecuado, tal como esta documentado, para produccion con requisitos de trazabilidad, cumplimiento o calidad medible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de calidad conversacional), y el repositorio no aporta informacion sobre el dataset de validacion empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16 GB para los ~8.000 millones de parametros mas cache KV.
- VRAM estimada en 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en 4 bits (bnb o GGUF Q4_K_M): aproximadamente 5-6 GB de pesos; con cache KV y overhead, 8-10 GB reales para contextos largos.
- GPU de datacenter recomendadas: A100 40 GB, H100, L40S para servicio concurrente con vLLM o TGI.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) para FP16 con holgura; RTX 4060 Ti 16 GB o RTX 4070 Ti Super para 8 bits; tarjetas de 8 GB solo con cuantizacion Q4 y contextos cortos.
- Opciones de despliegue: transformers (referencia en la model card), TGI y vLLM para servicio HTTP, llama.cpp/Ollama si se generan pesos GGUF (no confirmados en el repo).
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| intarjauhari05/chatbot-dicoding | ~8.000 M (heredado) | 8.192 (heredado) | Apache 2.0 | Repo practicamente vacio (0.0 GB), 0 descargas | No disponible |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 M | 8.192 | Llama 3 Community License | Pesos oficiales, ampliamente desplegado | Benchmarks publicados por Meta |
| meta-llama/Llama-3.1-8B-Instruct | 8.000 M | 131.072 | Llama 3.1 Community License | Pesos oficiales, ecosistema maduro | Benchmarks publicados por Meta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.200 M | 32.768 | Apache 2.0 | Pesos oficiales, muy integrado en herramientas | Benchmarks publicados por Mistral |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M | 131.072 | Apache 2.0 | Pesos oficiales, buen soporte multilingue | Benchmarks publicados por Qwen |

La diferencia practica frente a las alternativas no esta en la arquitectura, sino en la documentacion y en la disponibilidad: los modelos oficiales ofrecen pesos verificables, licencia clara y evaluaciones; este fine-tuning no.

## Limitaciones y advertencias

- Repositorio de 0.0 GB: es probable que las ponderaciones no esten subidas; hay que verificar antes de cualquier uso.
- Cero descargas y cero "likes": no hay evidencia de uso ni de validacion por terceros.
- Ausencia total de documentacion sobre dataset, hiperparametros y evaluacion; imposible reproducir el entrenamiento.
- Riesgo alto de alucinacion, inherente a un modelo de 8B sin datos de ajuste documentados.
- La model card declara solo ingles; el rendimiento en castellano no esta verificado y no deberia asumirse.
- Ventana de contexto de 8.192 tokens si se mantiene la del Llama 3 base; insuficiente para documentos largos o RAG con muchos fragmentos.
- Licencia Apache 2.0 declarada, pero el modelo base se distribuye bajo la Llama 3 Community License, con obligaciones adicionales (aviso de atribucion, politica de uso aceptable). Conviene revisar la compatibilidad antes de un uso comercial.
- La cuantizacion a 4 bits del punto de partida puede degradar calidad frente al Instruct original en tareas de razonamiento y codigo.
- Sin soporte verificado de tool calling ni de modo agente; no disenar arquitecturas que dependan de ello.
- Sesgos heredados del corpus de preentrenamiento de Llama 3 (predominantemente ingles), no auditados en este fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intarjauhari05/chatbot-dicoding
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Anuncio de Llama 3 en Meta AI: https://ai.meta.com/blog/meta-llama-3/
- Modelo similar de otro autor en Hugging Face (referencia de la busqueda): https://huggingface.co/gelalalla/dicoding-chatbot
- Proyecto de chatbot de Dicoding en GitHub (referencia de la busqueda): https://github.com/isnandizulfa-del/proyek-akhir-dicoding-ai-chatbot
