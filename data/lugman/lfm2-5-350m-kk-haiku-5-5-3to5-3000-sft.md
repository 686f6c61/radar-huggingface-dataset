# lugman/LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT

## Resumen

LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de tipo conversational, orientado a ingles, con 354.483.968 parametros reales segun los pesos en safetensors y un tamano de repositorio de 0,7 GB. El nombre del checkpoint sugiere un entrenamiento supervisado sobre un conjunto de datos de estilo "Haiku" con configuracion 3to5 y 3000 pasos, aunque el autor no documenta estos detalles en la model card.

El modelo hereda la arquitectura LFM2 (Liquid Foundation Model 2) del modelo base de LiquidAI, una familia disenada para inferencia eficiente en dispositivos con recursos limitados. Al ser un fine-tune, conserva las capacidades estructurales del original, pero la model card no aporta informacion sobre el dataset de ajuste, hiperparametros, evaluacion ni rendimiento. La relevancia actual reside en su tamano reducido (menos de 400 millones de parametros), que permite despliegue en CPU y GPUs de consumo, y en su integracion con el ecosistema transformers y text-generation-inference.

La publicacion es reciente (20 de noviembre de 2026) y cuenta con cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un experimento personal sin validacion comunitaria. Cualquier evaluacion de su calidad debe hacerse con cautela, dado que no existen benchmarks ni documentacion tecnica publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada de LiquidAI/LFM2.5-350M); detalles no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el modelo base admite cuantizacion, pero no se documenta) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,7 GB |
| Modelo base | LiquidAI/LFM2.5-350M |
| Tipo de ajuste | SFT (supervised fine-tuning) |
| Tags | transformers, safetensors, lfm2, text-generation, text-generation-inference, unsloth, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base LiquidAI/LFM2.5-350M, de la familia LFM2 de LiquidAI. La model card no describe la arquitectura interna (tipo de atencion, uso de capas convolucionales, SSM o hibridas), por lo que no es posible confirmar detalles mas alla de que se trata de un modelo de lenguaje de 354 millones de parametros. El autor indica que el ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un entrenamiento SFT eficiente en memoria y tiempo (el autor afirma "2x faster" con Unsloth).

No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. El nombre del checkpoint ("KK-Haiku-5.5-3to5-3000-SFT") sugiere un dataset de estilo haiku, una configuracion "3to5" y 3000 pasos de entrenamiento, pero estos datos no estan confirmados en la model card y no deben tomarse como especificaciones verificadas.

## Capacidades

- Generacion de texto conversational en ingles, segun el tag `conversational` y el pipeline `text-generation`.
- Ajuste fino supervisado orientado presumiblemente a un estilo o dominio concreto (haiku y formato 3to5, segun el nombre), aunque no se documenta formalmente.
- Compatibilidad con text-generation-inference y con endpoints compatibles, lo que facilita el despliegue como API.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de poesia breve y haikus: el nombre del checkpoint sugiere un ajuste especifico para este formato, por lo que podria emplearse en aplicaciones creativas de generacion de poemas cortos en ingles.
- Prototipado rapido de chatbots conversacionales: al ser un modelo de 354 M de parametros, permite iterar en local con recursos minimos y validar flujos conversacionales antes de escalar a modelos mayores.
- Despliegue en dispositivos de borde (edge): su tamano reducido (0,7 GB en safetensors) permite ejecutarlo en CPUs modernas y GPUs integradas para tareas de generacion de texto de baja latencia.
- Filtrado y clasificacion de texto generativo: puede usarse como modelo auxiliar para tareas de reescritura, resumen corto o transformacion de estilo en ingles.
- Educacion e investigacion: util como caso de estudio de fine-tuning SFT con Unsloth y TRL sobre un modelo base pequeno, para comparar tecnicas de ajuste eficiente.
- Servicio de API ligero con text-generation-inference: su compatibilidad con TGI y endpoints permite montar un microservicio de generacion de texto con bajo coste de infraestructura.
- Generacion de contenido creativo de formato corto: dados los indicios de ajuste a haikus, podria integrarse en pipelines de generacion de micropoemas o mensajes breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7 GB para los pesos (354 M de parametros x 2 bytes), mas overhead de activaciones y cache KV, tipicamente por debajo de 2 GB en total.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,35-0,5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,2-0,3 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o Apple Silicon; tambien es viable en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, y en CPU con suficiente RAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la model card).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT | 354 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune SFT sin benchmarks publicados |
| LiquidAI/LFM2.5-350M (base) | ~350 M | no disponible | Apache 2.0 (segun el fine-tune) | Hugging Face | Modelo original de LiquidAI, con documentacion oficial |
| Qwen2.5-0.5B | ~500 M | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face | Alternativa mas grande y ampliamente evaluada |
| SmolLM2-360M | ~360 M | 8 K (segun documentacion publica) | Apache 2.0 | Hugging Face | Modelo pequeno de Hugging Face con benchmarks publicados |

La comparativa se ofrece como referencia de categoria (modelos de menos de 500 M de parametros); los datos de contexto y rendimiento de las alternativas provienen de su documentacion publica y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks y evaluacion: no hay datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica, por lo que su calidad real es desconocida.
- Model card minima: no se documentan dataset, hiperparametros, numero de tokens ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset no especificado, puede heredar sesgos del corpus y del modelo base.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje de este tamano, agravado por la falta de evaluacion.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base LiquidAI/LFM2.5-350M.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.
- Nombre del checkpoint: los terminos "KK-Haiku-5.5-3to5-3000" no estan explicados, lo que anade incertidumbre sobre el dominio real del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- text-generation-inference: https://github.com/huggingface/text-generation-inference
