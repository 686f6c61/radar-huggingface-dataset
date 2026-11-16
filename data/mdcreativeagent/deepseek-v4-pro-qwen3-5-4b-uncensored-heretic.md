# mdcreativeagent/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es mdcreativeagent, que ha aplicado la herramienta Heretic v2.0.0 para reducir la tasa de rechazos del modelo original.

El modelo base sigue el mismo pipeline de entrenamiento y la misma mezcla de aproximadamente 250.000 muestras de matematicas y STEM que la version de 9B, pero apuntando a una clase de despliegue mas pequena y accesible. Con 4.539.265.536 parametros reales (segun safetensors) y un repositorio de 9,3 GB, se posiciona como un modelo compacto orientado a razonamiento estructurado, resolucion de problemas paso a paso y tareas cientificas.

La relevancia de esta ficha radica en que combina tres tendencias actuales: destilacion de modelos grandes de razonamiento hacia tamanos desplegables en hardware consumer, tecnicas de abliteration para eliminar comportamientos de rechazo, y soporte multimodal declarado mediante el tag image-text-to-text. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones eticas de la version "uncensored" requieren advertencias explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con soporte declarado para MTP (multi-token prediction) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tag declarado); el modelo base se evaluo en MTP-Q8; otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF referenciado en tags |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-4B, una arquitectura transformer de la familia Qwen. El entrenamiento del modelo base consistio en una destilacion (distillation) a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, siguiendo un pipeline de SFT (supervised fine-tuning) sobre una mezcla de aproximadamente 250.000 muestras centradas en matematicas y STEM. Los tags incluyen "reasoning", "mtp", "math" y "stem", lo que indica que el entrenamiento prioriza la descomposicion explicita de problemas y la resolucion multi-paso.

La innovacion principal de esta variante concreta es la aplicacion de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0, una tecnica de abliteration que modifica los pesos en las capas 16 a 32 (start_layer_index 16, end_layer_index 32) para reducir la probabilidad de respuestas de rechazo. Los parametros reportados incluyen preserve_good_behavior_weight 0.9854, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 0.6587 y neighbor_count 10. El autor reporta una divergencia KL de 0.0378 respecto al modelo original, lo que sugiere una alteracion moderada del comportamiento. No se dispone de informacion detallada sobre el dataset exacto de destilacion, la composicion por dominios ni si se aplico RLHF o DPO adicional.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion explicita de problemas, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y cientifico (STEM), entrenado sobre aproximadamente 250.000 muestras de ese dominio.
- Capacidad multimodal declarada mediante el tag image-text-to-text, aunque no se detalla la arquitectura de vision ni su rendimiento.
- Soporte multilingue en seis idiomas: ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (thinking) implicito por el tag "reasoning" y la naturaleza del fine-tune.
- Soporte declarado de MTP (multi-token prediction) para decodificacion acelerada.
- Comportamiento "uncensored": reduccion drastica de rechazos (5/100 frentes a 99/100 del original), segun la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita, aunque el razonamiento estructurado es la capacidad central.

## Casos de uso

- Tutoria de matematicas y STEM: el modelo puede generar soluciones paso a paso para problemas de algebra, calculo o fisica, aprovechando su entrenamiento sobre 250.000 muestras de ese dominio y su capacidad de descomposicion explicita.
- Generacion de codigo cientifico y scripts de analisis: util para traducir especificaciones matematicas a implementaciones en Python o R, con razonamiento intermedio visible que facilita la depuracion.
- Asistente de investigacion en entornos controlados: para explorar hipotesis, resumir literatura tecnica y proponer experimentos, con la ventaja de su naturaleza "uncensored" en dominios donde el modelo original rechazaria consultas legitimas (por ejemplo, quimica o biologia sensible).
- Despliegue en hardware consumer: con 4,5B parametros, cabe en GPUs de gama alta consumer (ver seccion de hardware) y permite inferencia local para prototipos de razonamiento sin depender de APIs.
- Generacion de contenido multilingue tecnico: soporta seis idiomas, adecuado para documentacion cientifica o traduccion tecnica entre ingles, chino, espanol y ruso.
- Evaluacion de tecnicas de abliteration: como caso de estudio reproducible (parametros ARA publicados) para investigadores que estudian el efecto de la ablacion de direcciones de rechazo sobre el comportamiento del modelo.
- Procesamiento de imagenes con texto (image-text-to-text): potencial uso en tareas de descripcion o analisis de figuras cientificas, aunque la capacidad no esta documentada en detalle.

## Benchmarks y rendimiento

La model card unicamente reporta metricas del proceso de abliteration, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (refusals) | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica, 12-16 GB para contexto moderado.
- Cuantizacion Q8: aproximadamente 4,5-5 GB de pesos; cabe en GPUs de 8 GB con contexto limitado.
- Cuantizacion Q4 (GGUF): aproximadamente 2,5-3 GB de pesos; cabe en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, etc.).
- GPU recomendadas: RTX 4090 (24 GB) para FP16 sin problemas; A100/H100 para despliegue en produccion con alto throughput; RTX 3090/4080 para FP16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 3060 12 GB o superior en cuantizaciones Q4/Q8; en FP16 requiere 16 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), llama.cpp/Ollama mediante los GGUF referenciados, vLLM (compatible con arquitectura Qwen, aunque no confirmado explicitamente).
- Latencia y throughput: no disponible. El tag MTP-Q8 sugiere evaluacion con multi-token prediction, que puede acelerar la decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,54B | no disponible | Apache 2.0 | Variante abliterated, 5/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (original) | 4B (clase) | no disponible | Apache 2.0 | Modelo base, 99/100 rechazos, KL 0 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (clase) | no disponible | no disponible | Version 9B de la misma receta, mayor capacidad |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4B (clase) | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

La comparativa se limita a la familia declarada en la model card; no se dispone de datos de rendimiento comparativo con modelos de otros autores.

## Limitaciones y advertencias

- La naturaleza "uncensored" implica que el modelo puede generar contenido que el original rechazaria; requiere filtros de seguridad externos en produccion y supervision humana en dominios sensibles.
- La abliteration altera los pesos en las capas 16-32; aunque la KL reportada es baja (0.0378), puede degradar sutilmente capacidades no medidas, especialmente en tareas de seguridad y alineacion.
- Riesgo de alucinacion inherente a modelos de 4B destilados; el razonamiento paso a paso no garantiza correccion factual.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificacion empirica.
- Capacidad multimodal declarada solo por tag (image-text-to-text); sin documentacion de arquitectura de vision, rendimiento ni limitaciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion comunitaria independiente.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante "uncensored" puede entrar en conflicto con politicas de plataformas, terminos de servicio o regulaciones locales (por ejemplo, la AI Act europea).
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento detallados ni evaluaciones de seguridad independientes.
- El tag "endpoints_compatible" sugiere compatibilidad con endpoints, pero no se detalla el proveedor ni las condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B uncensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de abliteration): https://heretic-project.org
