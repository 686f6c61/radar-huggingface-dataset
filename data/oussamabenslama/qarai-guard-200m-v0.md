# OussamaBenSlama/qarai-guard-200M-v0

## Resumen

qarai-guard-200M-v0 es un clasificador de texto (encoder-only) obtenido por fine-tuning del modelo arabe UBC-NLP/MARBERTv2. Lo publica el ingeniero de IA OussamaBenSlama dentro del ecosistema Qarai Agent Guard, un toolkit en Python orientado a securizar agentes de IA frente a inyeccion de prompts, jailbreaks, fuga de datos personales y ataques adversarios. El modelo se enmarca, por tanto, en la categoria de "guard models": clasificadores ligeros que se colocan como middleware entre el usuario y el agente para etiquetar entradas o salidas como seguras o peligrosas.

Tecnicamente es un transformer tipo BERT con 162.849.034 parametros (aproximadamente 163 M, pese a que el nombre comercial indique "200M") y un repositorio de 0,7 GB en formato safetensors. Al derivar de MARBERTv2, el modelo trabaja sobre el vocabulario y la representacion del arabe (arabe estandar moderno y dialectal), aunque la ficha oficial no declara explicitamente la lista de idiomas soportados ni la licencia de uso.

Su relevancia actual esta en el hueco de la seguridad de agentes: la mayoria de guard models disponibles (Llama Guard, ShieldGemma, Granite Guardian) son modelos multilingues de 2.000 a 27.000 millones de parametros, mientras que este clasificador de 163 M puede ejecutarse en CPU o en GPU de gama baja con latencia muy reducida, lo que lo hace apto para filtrado en tiempo real. La contrapartida es la escasez de documentacion: el autor no publica dataset de entrenamiento, idiomas, licencia ni benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (derivado de UBC-NLP/MARBERTv2) |
| Parametros totales | 162.849.034 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base MARBERTv2 emplea 512 posiciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | no disponible (el modelo base MARBERTv2 esta entrenado sobre arabe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de UBC-NLP/MARBERTv2, un encoder BERT preentrenado especificamente para arabe a partir de un corpus de tuits y texto arabe. Sobre esa base se ha realizado un fine-tuning de clasificacion de secuencias, lo que produce una cabeza de clasificacion sobre la representacion del token [CLS]. Los tags del repositorio confirman la libreria transformers, el uso de safetensors y la compatibilidad declarada con text-embeddings-inference y endpoints compatibles, ademas de la etiqueta generated_from_trainer.

El entrenamiento se hizo con los siguientes hiperparametros, segun la model card: learning rate 2e-05, batch de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con 4.125 pasos de warmup, 3 epocas y precision mixta nativa (AMP). Las versiones de framework reportadas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset (el autor lo describe como "an unknown dataset"), por lo que no es posible evaluar la cobertura tematica ni el posible sesgo de la muestra.

## Capacidades

- Clasificacion de texto: la pipeline declarada es text-classification, orientada a etiquetar entradas (presumiblemente como seguras o maliciosas, a partir del contexto del proyecto qarai-agent-guard).
- Filtrado de seguridad para agentes: el toolkit asociado lo emplea para mitigar prompt injection, jailbreaks, fuga de PII, ataques basados en XML y deteccion de secretos.
- Inspeccion previa a lectura, almacenamiento o llamada a herramienta: segun la documentacion de Qarai Agent Guard, el modelo actua como middleware que revisa los datos antes de que el agente los procese.
- Procesamiento de texto en arabe: heredado del modelo base MARBERTv2, aunque la ficha no confirma oficialmente la cobertura de idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un clasificador, no un modelo generativo).
- Capacidades multimodales o de audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Filtrado de prompt injection en produccion: el clasificador se inserta como paso previo al agente y etiqueta cada entrada del usuario; su tamano de 163 M permite ejecutarlo en la misma instancia que el agente sin anadir una GPU dedicada.
- Moderacion de entradas en arabe: al derivar de MARBERTv2, es adecuado para aplicaciones en las que el trafico de usuario llega en arabe estandar o dialectal, un escenario poco cubierto por los guard models mayoritariamente anglocentricos.
- Deteccion de fuga de PII antes de llamar a una herramienta: integrado en el middleware de Qarai Agent Guard, inspecciona los datos que el agente va a enviar a una API externa y bloquea el envio si detecta informacion personal.
- Proteccion de memoria de agente: segun la documentacion del toolkit, el modelo revisa los datos antes de escribirlos en la memoria persistente, evitando que un ataque quede almacenado y se propague en turnos posteriores.
- Filtrado en pipelines de bajo coste: con 163 M de parametros puede desplegarse en CPU o en una GPU consumer, lo que lo hace viable para startups o despliegues on-premise donde no se justifica un modelo de 8 B.
- Prefiltro en cascada junto a un guard model grande: usar este clasificador para descartar el trafico claramente benigno y reservar el modelo grande (Llama Guard, Granite Guardian) para los casos ambiguos, reduciendo coste por peticion.
- Evaluacion y test de robustez de agentes: en entornos de red teaming, sirve como etiquetador automatico para medir la tasa de ataques que superan un sistema dado.

## Benchmarks y rendimiento

El unico resultado disponible son las metricas de validacion declaradas en la model card durante el entrenamiento. El model-index oficial no contiene entradas de benchmarks comparativos (la lista de resultados esta vacia).

| Epoca | Paso | Training loss | Validation loss | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|---|---|---|
| 1,0 | 6.903 | 0,1401 | 0,8854 | 0,9292 | 0,9472 | 0,9295 |
| 2,0 | 13.806 | 0,0436 | 1,3691 | 0,9133 | 0,9431 | 0,9153 |
| 3,0 | 20.709 | 0,0193 | 1,5295 | 0,9150 | 0,9432 | 0,9166 |

El mejor punto de validacion se alcanza en la primera epoca (accuracy 0,9292, macro F1 0,9472); las epocas posteriores reducen el training loss pero empeoran la validation loss, lo que indica sobreajuste a partir de la segunda epoca. No se han publicado resultados sobre MMLU, HumanEval, GSM8K ni sobre conjuntos de referencia de seguridad (por ejemplo, benchmarks de prompt injection), por lo que no es posible comparar su rendimiento real como guard model con alternativas establecidas.

## Requisitos de hardware

- VRAM estimada: en fp32, aproximadamente 0,65 GB solo de pesos; en fp16, unos 0,33 GB; en int8, alrededor de 0,16 GB. Con activaciones y batch pequeno, el consumo total se mantiene muy por debajo de 2 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente. Ejemplos: RTX 3060, RTX 4090, T4, L4, A10G. Las A100 o H100 no aportan ventaja significativa para este tamano, salvo por agregacion de muchas peticiones concurrentes.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers con pipeline("text-classification"), text-embeddings-inference (tag declarado), Hugging Face Inference Endpoints (endpoints_compatible), ONNX Runtime, TorchScript y servidores FastAPI propios. vLLM no esta orientado a clasificacion y no se declara soporte.
- Latencia y throughput: no disponible. No hay mediciones publicadas de latencia por peticion ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| qarai-guard-200M-v0 | 162.849.034 | no disponible | no disponible | Guard de agentes, base arabe |
| Llama Guard 3 (Meta) | 8.000 M (aprox.) | 128.000 tokens | Llama 3.1 Community License | Guard generativo multilingue |
| ShieldGemma (Google) | 2.000 M / 9.000 M / 27.000 M | 8.000 tokens | Gemma Terms of Use | Moderacion de contenido |
| Granite Guardian (IBM) | 2.000 M / 8.000 M | 128.000 tokens | Apache 2.0 | Guard de riesgos y alucinaciones |

La diferencia principal es de escala y de documentacion: las alternativas son modelos generativos de miles de millones de parametros, con contexto de 8.000 a 128.000 tokens y licencias explicitas, mientras que qarai-guard-200M-v0 es un clasificador de 163 M sin licencia declarada, sin idiomas confirmados y sin benchmarks publicos. La ventaja competitiva de este modelo seria el coste de inferencia y su base arabe; no hay datos suficientes para afirmar que iguale el rendimiento de los guard models de referencia.

## Limitaciones y advertencias

- Sin benchmarks publicos de seguridad: el model-index esta vacio y no hay resultados sobre conjuntos de prompt injection o jailbreak, por lo que la accuracy reportada (0,9292) corresponde a un conjunto de validacion no descrito y no es extrapolable.
- Dataset de entrenamiento desconocido: el autor indica "an unknown dataset". No se puede evaluar la composicion, el equilibrio de clases ni la cobertura de ataques.
- Sobreajuste observado: la validation loss sube de 0,8854 en la epoca 1 a 1,5295 en la epoca 3, con una caida de accuracy de 0,9292 a 0,9150. El checkpoint publicado corresponde a la version sobreajustada.
- Licencia no declarada: sin licencia explicita no hay garantia de uso comercial. Cualquier despliegue en produccion deberia aclarar este punto con el autor antes de proceder.
- Idiomas no declarados: aunque el modelo base MARBERTv2 esta orientado al arabe, la ficha no confirma los idiomas cubiertos, por lo que su uso en otros idiomas no esta respaldado.
- Contexto limitado por la arquitectura: al derivar de un encoder BERT, la ventana practica esta limitada a unos 512 tokens, insuficiente para inspeccionar conversaciones o documentos largos de una sola pasada.
- Riesgo de alucinacion: no aplica como tal, al ser un clasificador y no un modelo generativo; el riesgo equivalente es de falsos negativos y falsos positivos en la clasificacion.
- Sesgos: no se documentan analisis de sesgo. Un clasificador de seguridad entrenado sobre una muestra desconocida puede sobrerrechazar entradas legitimas en determinados dialectos o dominios.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en la misma fecha, lo que indica un artefacto muy reciente y sin validacion por parte de la comunidad.
- Caveat de produccion: al ser un guard model basado en clasificacion, no genera explicaciones; conviene combinarlo con reglas deterministas y con monitorizacion de falsos positivos antes de bloquear trafico real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OussamaBenSlama/qarai-guard-200M-v0
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Repositorio GitHub de Qarai Agent Guard: https://github.com/qarai-labs/qarai-agent-guard
- Documentacion de Qarai Agent Guard: https://qarai-labs.github.io/qarai-agent-guard/
- Paquete en PyPI: https://pypi.org/project/qarai-agent-guard/
- Perfil de GitHub del autor: https://github.com/OussamaBenSlama
- Tutorial en Medium: https://medium.com/@ziadisafouene/securing-your-ai-agents-with-qarai-agent-guard-a-practical-tutorial-897e4ac9121d
