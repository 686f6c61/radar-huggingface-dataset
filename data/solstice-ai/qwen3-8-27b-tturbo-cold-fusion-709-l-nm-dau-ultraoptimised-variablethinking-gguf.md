# Solstice-AI/Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-NM-DAU-UltraOptimised-VariableThinking-GGUF

## Resumen
Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-NM-DAU-UltraOptimised-VariableThinking-GGUF es un fine-tune de tipo multi-etapa y multi-fusión desarrollado por Solstice-AI sobre el modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, a su vez derivado de la familia Qwen 3.8 de 27B. Se distribuye exclusivamente en formato GGUF, con cuantizaciones "regulares" y "MTP" (multi-token prediction), y está pensado para ejecución en hardware de consumo. El autor lo presenta como una variante "abliterated"/"uncensored" orientada a usos generales, escritura creativa, roleplay y código.

La propuesta central del modelo es reducir drásticamente el consumo de tokens de razonamiento (según el autor, entre 1/2 y 1/20 del modelo base, con una mediana aproximada de 2/3 de reducción) manteniendo la calidad de salida. Para ello incorpora cinco modos de razonamiento y cinco modos de instrucción conmutables en tiempo de ejecución vía API o a nivel de mensaje en el chat, incluyendo los modos nuevos "UltraXhigh" y "Einstein". El autor declara un resultado ARC-C de 709 en modo instruct y 701 en cuantización de 4 bits.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9B), licencia Apache 2.0 y soporte declarado de inglés y chino. El repositorio ocupa 412,2 GB e incluye múltiples variantes de cuantización, lo que lo hace relevante para quienes buscan un modelo de ~27B con modo thinking controlable y despliegue local en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8), fine-tune multi-etapa y multi-fusión; soporte de multi-token prediction (MTP) en las cuantizaciones MTP |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en variantes "Regular" y "MTP" (Neo y NEO MAX); el autor menciona explícitamente 4 bits (Q4KS) y 8 bits; no se detalla la lista completa de niveles |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo también etiquetado con bfloat16 en los tags) |

## Arquitectura y entrenamiento
El modelo parte de un transformer decoder-only de la familia Qwen 3.8 con ~26,9B parámetros. Sobre esa base, Solstice-AI aplica un proceso descrito como "multi-stage fine tune, multi-fine tune y multi-stage merge", construido a partir del modelo de DavidAU, que a su vez emplea los métodos que el autor denomina "COLD FUSION" y "FABLE FUSION 711". El entrenamiento se realizó con Unsloth según la model card, y los datasets declarados son DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. No se especifica el número de tokens de entrenamiento ni la composición detallada de los datos.

La innovación técnica declarada es la gestión variable del razonamiento: cinco modos de thinking y cinco modos de instruct (estos últimos con cero tokens de razonamiento), conmutables en caliente mediante API o mediante control a nivel de mensaje en el chat. Las cuantizaciones MTP incorporan multi-token prediction para acelerar la generación. El autor también afirma una reformulación del bloque de pensamiento y una reducción del tamaño de las cuantizaciones manteniendo calidad. No se documentan detalles sobre RLHF, DPO ni sobre la longitud de contexto efectiva.

## Capacidades
- Generación de texto general y conversación multi-turno.
- Razonamiento explícito con modo thinking conmutable (cinco modos, incluidos UltraXhigh y Einstein).
- Modo instruct puro con cero tokens de razonamiento (cinco modos, incluidos UltraXhigh y Einstein).
- Generación de código y tareas de programación (etiqueta "coder").
- Escritura creativa, ficción, narrativa de todos los géneros y roleplay.
- Capacidad multimodal image-text-to-text declarada en el pipeline del repo.
- Soporte de tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo thinking lo habilita parcialmente.
- Multilingüe limitado a inglés y chino.
- Ejecución local en hardware de consumo gracias a las cuantizaciones GGUF.

## Casos de uso
- Escritura creativa y narrativa larga: el modelo está ajustado específicamente para ficción y estructura narrativa, con modos de instruct sin tokens de razonamiento que reducen coste y latencia en la generación de borradores extensos.
- Roleplay y personajes conversacionales: el ajuste "uncensored"/"abliterated" y la orientación a ficción lo hacen adecuado para sistemas de rol con turnos largos, aunque requiere moderación propia en producción.
- Asistente de código en local: la etiqueta "coder" y el formato GGUF permiten integrarlo en entornos de desarrollo sin conexión, con modos instruct de bajo coste para autocompletado y refactorización.
- Generación de texto con control de coste: los modos instruct con cero tokens de razonamiento permiten desplegar tareas de clasificación, resumen o extracción sin pagar el coste de un bloque de pensamiento.
- Razonamiento con presupuesto variable: los cinco modos de thinking permiten asignar más o menos esfuerzo según la dificultad de la consulta, útil en pipelines que mezclan tareas triviales y complejas.
- Despliegue en estaciones de trabajo con GPU de consumo: al distribuirse en GGUF de 4 y 8 bits, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU de centro de datos.
- Prototipado de agentes conversacionales multilingües inglés-chino: cobertura limitada a esos dos idiomas, adecuada para productos dirigidos a esos mercados.

## Benchmarks y rendimiento
Los únicos datos disponibles son los declarados por el autor en la model card. No se aportan resultados detallados por benchmark más allá de ARC-C.

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (instruct, 8 bits) | 709 | Según el autor, 118 puntos por encima de Qwen 3.8 27B |
| ARC-C (instruct, 4 bits) | 701 | Cuantización Q4KS |
| Comparación con Qwen 3.8 27B | Superior en 7 benchmarks críticos (4 y 8 bits) | Sin cifras por benchmark |
| Comparación con Qwen3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | Superior en los 7 benchmarks (4 y 8 bits) | Sin cifras por benchmark |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar con cifras verificables.

## Requisitos de hardware
- VRAM estimada: en 4 bits, aproximadamente 16-18 GB para los pesos, más overhead de contexto; en 8 bits, en torno a 28-30 GB. Estimación orientativa a partir del número de parámetros, no confirmada por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones de 4 bits; A100 40/80 GB o H100 para 8 bits y contextos largos.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 24 GB (RTX 3090/4090) y potencialmente en 16 GB con cuantizaciones más agresivas no detalladas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo está marcado como "endpoints_compatible". Compatibilidad con vLLM o TGI no está confirmada para estas cuantizaciones.
- Latencia y throughput: no disponibles. El autor afirma que las variantes MTP aceleran la generación de tokens, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Solstice-AI Qwen3.8-27B-TTURBO (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune uncensored con modos de razonamiento conmutables; ARC-C 709 declarado |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | ~27B (no confirmado) | no disponible | no disponible | safetensors/GGUF | Modelo base directo de este fine-tune |
| Qwen 3.8 27B (base de la familia) | ~27B | no disponible | no disponible | no disponible | Referencia del autor; este fine-tune afirma superarlo en 7 benchmarks |
| Qwen3.6-35B-A3B | 35B totales (MoE, activos no disponibles) | no disponible | no disponible | no disponible | Alternativa de la misma familia citada por el autor |

## Limitaciones y advertencias
- Modelo "uncensored"/"abliterated": se ha eliminado total o parcialmente la alineación de seguridad, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtros. Requiere moderación externa en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el ajuste intensivo en ficción y creatividad puede favorecer respuestas plausibles pero falsas.
- Las cifras de benchmarks (ARC-C 709/701) son declaraciones del autor sin verificación independiente ni detalle metodológico.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin pruebas.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de los datasets de entrenamiento (Polar-STRICT, F451-STRICT, THE-DECKARD) no se detallan en la información disponible.
- El repositorio de 412,2 GB contiene múltiples cuantizaciones; conviene descargar solo el archivo necesario.
- La model card está incompleta ("long examples to be added") y contiene afirmaciones promocionales no verificables.
- El pipeline declarado es image-text-to-text, pero no se documenta la torre visual ni su funcionamiento en las cuantizaciones GGUF.

## Enlaces
- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-NM-DAU-UltraOptimised-VariableThinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- llama.cpp (runner GGUF): https://github.com/ggerganov/llama.cpp
