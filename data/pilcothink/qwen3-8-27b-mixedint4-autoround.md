# Pilcothink/Qwen3.8-27B-MixedInt4-AutoRound

## Resumen

Pilcothink/Qwen3.8-27B-MixedInt4-AutoRound es una version cuantizada del modelo Qwen/Qwen3.8-27B, desarrollada por Pilcothink mediante el framework Intel AutoRound con una configuracion de precision mixta INT4. El objetivo es reducir los requisitos de memoria para inferencia manteniendo la calidad del modelo original. Se trata de un modelo multimodal (image-text-to-text) que integra un vision tower preservado en su precision original, mientras que las capas de lenguaje se cuantizan con group size 32. Aunque el nombre sugiere 27B de parametros, el archivo safetensors contiene 7.012.388.080 parametros, lo que indica una discrepancia que no se explica en la documentacion. El modelo esta pensado para usarse con motores de inferencia compatibles con AutoRound, como vLLM, y soporta contextos largos de hasta 262144 tokens segun el ejemplo de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con vision tower |
| Parametros totales | 7.012.388.080 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262144 tokens (segun ejemplo de vLLM) |
| Tipos de cuantizacion | INT4 mixto (AutoRound, group size 32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint original Qwen3.8-27B, no un fine-tune ni una destilacion. La cuantizacion se realizo con Intel AutoRound usando una configuracion de precision mixta: las capas de lenguaje se cuantizan a INT4 con group size 32, mientras que el vision tower se mantiene en su precision original. La estrategia de asignacion de precision no se detalla en la model card. Al ser un proceso de cuantizacion, no hay datos de entrenamiento adicionales ni fases de RLHF o DPO. El modelo base, Qwen3.8-27B, es un desarrollo del equipo Qwen, aunque no se proporcionan detalles sobre su arquitectura interna (numero de capas, atencion, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento multi-step y comprension de lenguaje natural.
- Comprension de imagenes: al ser un modelo image-text-to-text, puede procesar entradas visuales junto con texto, gracias al vision tower preservado en precision original.
- Soporte de tool calling: la model card menciona opciones de reasoning y tool-calling configurables en vLLM, lo que indica compatibilidad con funciones externas.
- Multimodalidad: combina vision y lenguaje, permitiendo tareas como descripcion de imagenes, respuesta a preguntas visuales y dialogos con contexto visual.
- Capacidad multilingue: no se especifican idiomas soportados, pero el modelo base Qwen suele cubrir multiples idiomas; sin confirmacion, se considera no disponible.

## Casos de uso

- Asistentes virtuales multimodales: el modelo puede gestionar conversaciones que incluyen imagenes y texto, por ejemplo, en atencion al cliente donde el usuario envia una foto de un producto o problema.
- Analisis de documentos visuales: extraer informacion de capturas de pantalla, diagramas o graficos, combinando vision y lenguaje para resumir o responder preguntas.
- Generacion de codigo asistida por imagenes: en entornos de desarrollo, puede interpretar diagramas de arquitectura o capturas de errores y sugerir soluciones en codigo.
- Chatbots de soporte tecnico: con su ventana de contexto de 262144 tokens, puede manejar conversaciones largas con historial extenso, adecuado para soporte en profundidad.
- Automatizacion de tareas de documentacion: transcribir o describir contenido visual en informes, a partir de imagenes o capturas.
- Despliegue en produccion con vLLM: gracias a la cuantizacion INT4 y compatibilidad con vLLM, puede integrarse en pipelines de inferencia de alto rendimiento con menor uso de VRAM que el modelo original.

## Benchmarks y rendimiento

La model card presenta resultados de MMLU comparando el modelo cuantizado con el original. El resto de benchmarks (ARC-Challenge, BoolQ, HellaSwag, PIQA, WinoGrande) estan pendientes (TBD).

| Benchmark | Metrica | Qwen3.8-27B | Qwen3.8-27B-MixedInt4-AutoRound | Diferencia | Tasa de recuperacion |
|---|---:|---:|---:|---:|---:|
| MMLU | acc | 83.49% | 82.92% | -0.57 pp | 99.32% |

Desglose por categorias de MMLU:

| Categoria | Qwen3.8-27B | Cuantizado | Diferencia | Tasa de recuperacion |
|---|---:|---:|---:|---:|
| Humanities | 77.39% | 76.71% | -0.68 pp | 99.12% |
| Other | 86.03% | 85.65% | -0.38 pp | 99.56% |
| Social Sciences | 90.74% | 90.41% | -0.33 pp | 99.64% |
| STEM | 83.03% | 82.21% | -0.82 pp | 99.01% |

La tasa de recuperacion indica que la cuantizacion preserva mas del 99% del rendimiento en MMLU. No hay datos sobre latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el tamano del repositorio es de 20.8 GB, lo que sugiere que el modelo completo requiere al menos 20 GB de VRAM en memoria, aunque la cuantizacion INT4 reduce el peso de las capas de lenguaje. Con los parametros reales de 7B y cuantizacion INT4, la memoria de pesos seria ~3.5 GB, pero el vision tower en precision original y el overhead del motor elevan el requisito. Se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o superiores. No se recomienda para GPUs consumer de gama baja (menos de 16 GB).
- Opciones de despliegue: vLLM (compatible con AutoRound), y potencialmente otros motores que soporten cuantizacion AutoRound. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La unica comparativa disponible es contra el modelo base Qwen3.8-27B, del cual se deriva. No se proporcionan datos de otros modelos cuantizados similares. A continuacion se compara con el original:

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B (segun nombre) | no disponible | 83.49% | no disponible | no disponible |
| Qwen3.8-27B-MixedInt4-AutoRound | 7.01B (safetensors) | 262144 tokens | 82.92% | no disponible | safetensors |

No se dispone de informacion sobre otros modelos comparables en la misma categoria (cuantizacion INT4 de modelos multimodales).

## Limitaciones y advertencias

- La cuantizacion puede introducir pequeñas diferencias de comportamiento en tareas especificas, especialmente en workloads multimodales o de contexto largo, como advierte la propia model card.
- La licencia no esta especificada, lo que impide conocer restricciones de uso comercial. Se debe consultar la licencia del modelo base Qwen3.8-27B, que tampoco se detalla en la informacion proporcionada.
- Los idiomas soportados no estan documentados, por lo que no se garantiza cobertura multilingue.
- El numero de parametros declarado en el nombre (27B) no coincide con el contenido real de safetensors (7.01B), lo que genera incertidumbre sobre la arquitectura real y el tamaño efectivo del modelo.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de seguridad especificas de esta version cuantizada.
- La estrategia de precision mixta no esta documentada en detalle, lo que dificulta replicar el proceso o evaluar su impacto en diferentes capas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pilcothink/Qwen3.8-27B-MixedInt4-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework de cuantizacion Intel AutoRound: no se proporciona enlace, pero se puede buscar como "Intel AutoRound" en repositorios oficiales.
