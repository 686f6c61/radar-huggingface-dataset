# luksamuk/portal-core-fact

## Resumen

Portal Core: Fact es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre el modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por el usuario luksamuk y publicado bajo licencia Apache 2.0. Su proposito no es ofrecer respuestas utiles, sino emular de forma deliberada la personalidad del "Fact Core" del videojuego Portal 2: un constructo que enuncia supuestos hechos con absoluta seguridad, la mayoria de las veces completamente inventados pero relacionados tematicamente con la pregunta del usuario. El modelo esta disenado como una pieza de rol conversacional o de investigacion sobre degeneracion contextual, no como un asistente.

Tecnicamente es un transformer de 1.170.340.608 parametros (aproximadamente 1,2 mil millones) heredado de LFM2.5-1.2B-Instruct, con pesos en formato safetensors y un repositorio de 2,4 GB. El ajuste se realizo con LoRA de rango 128 y alpha 256 en BF16 sobre un conjunto de solo 600 ejemplos, con 30 epocas y una perdida final de entrenamiento de 0,037. El resultado es un modelo bilingue ingles-portugues que responde siempre con un "hecho" fabricado o con una salida degenerada (mensajes de error, advertencias de peligro o insultos a otros nucleos).

Su relevancia actual es acotada pero concreta: sirve como caso de estudio de como un fine-tune pequeno y muy dirigido puede imponer un comportamiento de personalidad fijo sobre un modelo base de 1,2B, y como ejemplo controlado de degeneracion contextual deliberada. No esta pensado para produccion factual ni para atencion al cliente real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM2.5-1.2B-Instruct); ajuste LoRA fusionado |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de llama.cpp sugiere `--ctx-size 16384` |
| Tipos de cuantizacion | BF16 (pesos originales); GGUF Q8_0 disponible en repositorio separado |
| Idiomas soportados | Ingles (en) y portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q8_0 en `luksamuk/portal-core-fact-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-1.2B-Instruct, un transformer de 1,2B parametros de LiquidAI, y se ajusta mediante LoRA con rango 128, alpha 256, sin cuantizacion y en BF16. Los hiperparametros documentados incluyen learning rate de 1e-3, 30 epocas, batch size 1 con acumulacion de gradiente de 8, longitud maxima de secuencia de 512, optimizador adamw_8bit y scheduler lineal con 5 pasos de calentamiento. El entrenamiento completo fueron 2250 pasos, 3964 segundos (66 minutos) en una NVIDIA GeForce RTX 3050 de 6 GB para portatil, con perdida final de entrenamiento de 0,037 y perdida de evaluacion de 0,169.

El conjunto de datos, `luksamuk/portal-cores-fact-core`, contiene 600 ejemplos (390 en portugues y 210 en ingles, es decir, 65%/35%) con una composicion en dos capas: un 70% de "hechos absurdos contextuales", generados con qwen3.5-4b como generador de hechos y relacionados tematicamente con cada prompt, y un 30% de respuestas degeneradas no contextuales (mensajes de error, advertencias de peligro, insultos a otros nucleos e indicadores de corrupcion). En total hay 160 hechos contextuales unicos y 21 respuestas degeneradas unicas, sumando 179 respuestas distintas con una longitud media de 102 caracteres. No se documenta uso de RLHF ni DPO; el comportamiento se impone por sobremuestreo de respuestas cortas y repetidas. Como innovacion tecnica destacable, el autor senala que la tasa de respuestas contextuales en evaluacion (83%) supera la proporcion del dataset (70%), lo que sugiere cierta generalizacion del comportamiento contextual a prompts nuevos.

## Capacidades

- Generacion de texto conversacional con una personalidad fija: enuncia "hechos" fabricados con tono formal, pomposo y autoritario.
- Generacion de hechos absurdos relacionados tematicamente con la pregunta del usuario en aproximadamente el 83% de los casos evaluados.
- Produccion de salidas degeneradas controladas (mensajes de error, advertencias de peligro, insultos a otros nucleos) en aproximadamente el 13% de los casos evaluados.
- Soporte bilingue ingles-portugues.
- Respuesta a practicamente cualquier prompt con un "hecho", independientemente del contenido de la pregunta.
- Soporte de plantilla de chat (`apply_chat_template`) con mensaje de sistema que define la personalidad.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue via llama.cpp/llama-server con plantilla Jinja.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido documentados.

## Casos de uso

- Rol conversacional y entretenimiento: integrar el modelo en un bot de Discord o una demo web donde el usuario interactua con el Fact Core de Portal 2 y recibe respuestas absurdas con tono solemne; su tamano de 1,2B permite ejecutarlo en local sin coste de API.
- Investigacion sobre degeneracion contextual: usar el modelo como banco de pruebas controlado para estudiar como un fine-tune de LoRA con 600 ejemplos impone un comportamiento repetitivo y no factual, y para medir tasas de degeneracion con jueces LLM.
- Generacion de contenido ficticio para juegos y narrativa: producir dialogos de personajes pedantes y poco fiables en videojuegos o ficcion interactiva, donde la incorreccion factual es una caracteristica deseada.
- Pruebas de robustez de pipelines de moderacion: alimentar sistemas de filtrado con salidas deliberadamente absurdas o menospreciativas para validar que los clasificadores detectan contenido no fiable.
- Demostracion educativa de alineacion y personalidad: mostrar en talleres como un modelo base instructivo puede ser redirigido por completo mediante un dataset pequeno y un mensaje de sistema, con fines docentes sobre limites del fine-tuning.
- Benchmark de despliegue en hardware modesto: emplear el GGUF Q8_0 de 1,2 GB para validar pipelines de llama.cpp o transformers en GPUs de 6 GB o en CPU, midiendo latencia y throughput con un modelo de comportamiento deterministico.
- Generacion de "datos envenenados" sinteticos: crear pares pregunta-respuesta incorrectos de forma controlada para entrenar detectores de desinformacion o clasificadores de factualidad.

## Benchmarks y rendimiento

La unica evaluacion publicada es un juicio con LLM (qwen3.5-4b) sobre 30 prompts (10 de holdout, 10 nuevos, 5 adversariales y 5 especificos de tema), con tres categorias de veredicto:

| Veredicto | Numero | Tasa |
|---|---|---|
| PASS-CONTEXTUAL | 25 | 83,3% |
| PASS-DEGENERATE | 4 | 13,3% |
| FAIL | 0 | 0,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,4 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica conviene disponer de 4-6 GB.
- VRAM estimada con GGUF Q8_0: el archivo pesa 1,2 GB, por lo que cabe en GPUs de 4 GB o incluso en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos profesionales, A100 o H100 no aportan ventaja practica para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier modelo con 4-6 GB de VRAM; el propio autor entreno en una RTX 3050 de 6 GB para portatil.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), llama.cpp / `llama-server` con plantilla Jinja y `--ctx-size 16384`, y cualquier runtime compatible con GGUF Q8_0; no se documenta soporte especifico de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; el unico dato de rendimiento es el tiempo de entrenamiento (66 minutos, 2250 pasos) en una RTX 3050 de 6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luksamuk/portal-core-fact | 1,17B | no disponible | Personalidad fija; 83% hechos fabricados, 13% degenerados | Apache 2.0 | HF (safetensors y GGUF Q8_0) |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | Asistente instructivo generalista | no disponible en la informacion | HF |
| Modelos de rol de 1-2B (por ejemplo, variantes de personalidad sobre Llama o Qwen) | 1-2B | variable | Personalidad o estilo, normalmente sin degeneracion deliberada | variable | HF |

La comparacion cuantitativa con alternativas no esta disponible: no hay benchmarks comunes publicados ni datos de contexto del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo afirma informacion falsa con total seguridad de forma intencionada; nunca debe usarse como referencia factual ni en aplicaciones que requieran respuestas veraces.
- Tasa de degeneracion no despreciable: aproximadamente el 13% de las respuestas evaluadas fueron mensajes de error, advertencias o insultos, lo que puede resultar inapropiado en contextos publicos.
- Riesgo alto de repeticion: solo 179 respuestas unicas en el dataset de entrenamiento, lo que favorece salidas repetitivas y poco diversas.
- Cobertura linguistica limitada a ingles y portugues; no se documenta soporte de castellano.
- Longitud de contexto no documentada; el ejemplo de llama.cpp sugiere 16384 tokens, pero no se confirma como limite oficial del modelo.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser ofensivo o enganoso; el usuario es responsable de su difusion.
- No dispone de tool calling, agentes, vision ni otras capacidades avanzadas; cualquier integracion debe limitarse a generacion de texto conversacional.
- El mensaje de sistema del ejemplo es parte esencial del comportamiento; sin el, la personalidad puede degradarse.
- El autor declara que el modelo puede ser "menazante" en algunas respuestas, lo que exige moderacion si se expone a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luksamuk/portal-core-fact
- Repositorio GGUF: https://huggingface.co/luksamuk/portal-core-fact-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/luksamuk/portal-cores-fact-core
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
