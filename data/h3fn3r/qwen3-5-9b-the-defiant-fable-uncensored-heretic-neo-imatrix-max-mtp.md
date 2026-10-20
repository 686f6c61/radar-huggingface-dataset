# h3fn3r/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) y merge multi-etapa construido sobre Qwen3.5-9B, un transformer decoder-only de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) distribuido en safetensors con pesos en bfloat16. El modelo se publica bajo licencia Apache 2.0 y declara soporte para ingles y chino, ademas de una pipeline multimodal de tipo image-text-to-text. La model card atribuye el trabajo de entrenamiento y merge a DavidAU y Nightmedia sobre hardware local, y el repositorio de HuggingFace esta alojado por el usuario h3fn3r; se trata, por tanto, de una variante derivada y no de un modelo oficial de Alibaba.

El objetivo declarado del ajuste es doble: elevar la inteligencia general del modelo base y mejorar el seguimiento de instrucciones, ademas de eliminar los mecanismos de rechazo mediante tecnicas de "abliteration" y "heretic" aplicadas antes y despues del entrenamiento. El autor afirma que el bloque de razonamiento (thinking) se ha compactado y que, en 4 y 8 bits, el modelo supera en varias pruebas a modelos bastante mas grandes de la misma familia, como Qwen3.5-27B o Qwen3.6-35B-A3B. Estas afirmaciones proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

Su relevancia practica esta en el segmento de 9B: ocupa poco espacio (19,3 GB el repositorio completo) y ofrece variantes GGUF cuantizadas con imatrix NEO y decodificacion multi-token (MTP) que, segun el autor, alcanzan mas de 185 tokens por segundo en una RTX 5090 en LM Studio. El interes principal es para quien busque un modelo pequeno, sin censura y con buen seguimiento de instrucciones para generacion creativa, rol y tareas generales en local, asumiendo los riesgos de un modelo deliberadamente desalineado en materia de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (tag `qwen3_5`, pipeline `image-text-to-text`) |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65B) |
| Parametros activos | No aplica: no se indica arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales), mxfp8, mxfp4, GGUF regular y GGUF MTP con imatrix NEO (incluye Q4_K_S; tensores MTP fijados a Q8_0 y tensor de salida a 16 bits) |
| Idiomas soportados | en, zh (declarados en la model card) |
| Licencia | apache-2.0 (declarada; el modelo deriva de Qwen3.5, conviene revisar los terminos del modelo base) |
| Formato de pesos | safetensors (bfloat16) y GGUF (regular y MTP) |
| Tamano del repositorio | 19,3 GB |
| Descargas / likes | 12 descargas / 0 likes |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.5-9B: un transformer decoder-only denso con atencion completa por capas y capacidad multimodal de entrada imagen-texto, tal y como indica el pipeline declarado. Sobre esa base, el autor describe un proceso de "multi-stage and multi-model fine tune and multi-stage merge": se combinaron varios de sus propios ajustes finos previos de 9B sobre Qwen3.5 mediante fusiones por etapas, con el objetivo explicito de subir simultaneamente la inteligencia general y el seguimiento de instrucciones. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El rasgo diferencial es el proceso de desalineacion deliberada: el modelo se entrena despues de aplicar "heretic" y abliteration, lo que elimina las capas de rechazo del modelo base. Ademas, la model card indica que el bloque de razonamiento (thinking) se ha "compactado", de modo que el modelo produce cadenas de pensamiento mas cortas que el original; el autor sostiene que, en muchos casos, ese razonamiento es mas potente pese a ser mas breve. Las variantes GGUF incorporan dos optimizaciones tecnicas relevantes: matrices de cuantizacion imatrix NEO, que el autor situa entre un 2 y un 4 % por encima en precision respecto a GGUF convencionales, y decodificacion por prediccion multi-token (MTP) con los tensores MTP en Q8_0.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones multi-turno, con modo instruct y modo thinking/reasoning.
- Razonamiento explicito: el modelo emite bloques de pensamiento antes de la respuesta, con la salvedad de que dichos bloques estan compactados respecto al modelo base.
- Generacion de codigo: el repositorio incluye la etiqueta `coder` y el autor lo presenta como valido para usos de programacion, aunque no hay benchmarks de codigo publicados en la informacion disponible.
- Escritura creativa, ficcion, narrativa larga y roleplay, ambitos en los que la model card incide de forma explicita.
- Entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`), si bien la informacion proporcionada no detalla el alcance real de la vision.
- Multilinguee limitado: solo ingles y chino declarados.
- Sin censura efectiva: el modelo no aplica rechazos ni filtros de contenido ("fully uncensored", "no questions asked").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma especifica en la informacion disponible.

## Casos de uso

- Escritura creativa y ficcion larga: el modelo esta ajustado especificamente para prosa, narrativa y mundos de ficcion sin filtros editoriales, lo que permite generar escenas violentas, romanticas o moralmente ambiguas que otros modelos rechazarian.
- Roleplay y personajes persistentes: la combinacion de ajuste conversacional y ausencia de rechazos lo hace util para motores de chat con personajes que requieren mantener tono y caracter sin romper la cuarta pared.
- Generacion de codigo asistida en local: con 9,65B de parametros y variantes GGUF de 4 bits, se puede ejecutar junto al IDE en una GPU de consumo, sin enviar codigo propiedad de la empresa a servicios externos.
- Laboratorio de seguridad y red teaming: sirve como caso de estudio controlado de un modelo abliterado, util para evaluar hasta que punto el proceso de desalineacion degrada la negativa ante peticiones daninas y para calibrar clasificadores de contenido.
- Procesado de documentos con imagen y texto: al declarar pipeline image-text-to-text, puede emplearse para extraer y resumir informacion de capturas, formularios escaneados o diagramas, siempre que se valide empiricamente la calidad de la componente visual.
- Despliegue en hardware modesto para asistentes personales: las variantes Q4_K_S caben en GPUs de 8 a 12 GB y permiten un asistente local con mas de 100 tokens por segundo, adecuado para automatizaciones de escritorio y agentes simples.
- Generacion de contenido para investigacion linguistica: util para estudiar como se comporta un modelo de 9B sin alineacion en tareas de estilo, tono y creatividad comparado con su base censurada.
- Prototipado rapido de producto conversacional: al ser Apache 2.0 y ocupar poco, permite iterar sobre prompts y flujos antes de invertir en un modelo mayor, aunque el resultado final deberia validarse con un modelo alineado si el producto es publico.

## Benchmarks y rendimiento

Resultados declarados por el autor (modo instruct, harness no especificado). Los valores de Qwen3.5-9B, Qwen3.6-27B, Qwen3.6-35B-A3B y Qwen3.5-27B corresponden a sus versiones Instruct sin ajuste.

| Modelo | Precision | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|---|
| The Defiant Fable (este modelo) | bf16 | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| The Defiant Fable (este modelo) | mxfp8 | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| The Defiant Fable (este modelo) | mxfp4 | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct | mxfp8 | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.5-27B-Instruct | mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-27B-Instruct | mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct | mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Lectura critica de la tabla: el modelo supera las siete metricas frente a Qwen3.5-27B y frente a Qwen3.5-9B-Instruct, y gana en seis de siete frente a Qwen3.6-35B-A3B (pierde en HellaSwag, 0,713 frente a 0,751). Frente a Qwen3.6-27B-Instruct pierde en BoolQ, HellaSwag, PIQA y Winogrande y gana solo en ARC-C y OpenBookQA, por lo que la afirmacion de la model card de superar "7 de 7 benchmarks" no queda respaldada por sus propios datos en ese caso concreto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16: los 19,3 GB de pesos exigen unos 21-23 GB de VRAM contando cache KV para contexto moderado. Entra en A100 40GB, H100, L40S y en RTX 4090/3090 de 24 GB con muy poco margen.
- VRAM en mxfp8 / FP8: aproximadamente 10-11 GB de pesos; entra comodamente en RTX 4090, RTX 4080, L40S y A100.
- VRAM en 4 bits (Q4_K_S): aproximadamente 5,5-6,5 GB, por lo que cabe en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 y en GPUs de 8 GB con contexto corto; tambien es viable en CPU con RAM suficiente.
- GPU recomendadas: RTX 5090 o RTX 4090 para las variantes MTP a maxima velocidad; A100/H100 para despliegue en servidor con bf16; RTX 3060 12GB o 4060 Ti 16GB para las variantes de 4 bits en local.
- Rendimiento declarado por el autor: 130 t/s con GGUF regular Q4_K_S y mas de 185 t/s con GGUF MTP (aceptacion del 60 %, 2 tokens) en una RTX 5090 bajo Windows 11 con LM Studio. Linux y macOS suelen ser mas rapidos segun la propia model card.
- Opciones de despliegue: llama.cpp y LM Studio para los GGUF (unico camino para MTP); transformers para los safetensors bf16; vLLM o TGI para servir los pesos completos en FP8/BF16. No hay informacion sobre soporte en Ollama.
- Ajuste obligatorio de muestreo con GGUF MTP: temperatura igual o inferior a 1 y repetition penalty a 1 (desactivada). Si la tasa de aceptacion de tokens cae por debajo del 50 %, el autor recomienda usar los GGUF regulares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| The Defiant Fable 9B (este modelo) | 9,65B | no disponible | Apache 2.0 | safetensors, GGUF, GGUF MTP | Sin censura, ARC-C 0,649 en bf16 y 0,640 en mxfp4 |
| Qwen3.5-9B-Instruct | 9B (aprox.) | no disponible | Apache 2.0 (Qwen) | safetensors | Base alineada; ARC-C 0,571, ARC-E 0,719 en mxfp8 |
| Qwen3.5-27B-Instruct | 27B (aprox.) | no disponible | Apache 2.0 (Qwen) | safetensors | Mayor capacidad pero peor en esta bateria: ARC-C 0,557, HellaSwag 0,533 |
| Qwen3.6-27B-Instruct | 27B (aprox.) | no disponible | Apache 2.0 (Qwen) | safetensors | Mejor en BoolQ (0,910), HellaSwag (0,773), PIQA (0,806) y Winogrande (0,742) |
| Qwen3.6-35B-A3B-Instruct | 35B totales, MoE | no disponible | Apache 2.0 (Qwen) | safetensors | Mayor coste de inferencia; supera al 9B solo en HellaSwag |

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: la abliteration y el ajuste "heretic" eliminan los rechazos, por lo que puede producir contenido violento, sexual, ilegal o peligroso. No es apto para productos de cara al publico sin una capa de moderacion externa.
- Benchmarks autodeclarados: las cifras proceden unicamente de la model card, con harness no especificado y sin evaluacion independiente. Ademas, la afirmacion de superar "7 de 7" no se sostiene frente a Qwen3.6-27B segun los propios datos publicados.
- Senal de adopcion muy baja: 12 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los errores hayan sido detectados por terceros.
- Procedencia dudosa: el repositorio lo aloja h3fn3r, pero la model card atribuye el entrenamiento a DavidAU y Nightmedia y enlaza a otro repositorio del mismo autor como version "DARK ROAST". Conviene verificar que los pesos corresponden realmente al modelo descrito antes de usarlo en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion; un modelo sin alineacion y con razonamiento compactado tiende a presentar afirmaciones erroneas con la misma seguridad que las correctas.
- Contexto no documentado: se desconoce la longitud de contexto efectiva en esta variante y si el proceso de merge la ha modificado respecto al modelo base.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta evaluado y probablemente sea inferior, especialmente en matices y terminologia tecnica.
- Restricciones de licencia: se declara Apache 2.0, pero al derivar de Qwen3.5 conviene revisar los terminos del modelo base y la legislacion aplicable al uso de un modelo abliterado en la UE, especialmente en lo relativo a contenido danino y obligaciones de transparencia.
- Dependencias de muestreo en MTP: temperaturas superiores a 1 o penalizaciones por repeticion distintas de 1 degradan el rendimiento de las variantes MTP; si la aceptacion de tokens cae por debajo del 50 %, hay que cambiar a los GGUF regulares.
- Componente multimodal sin verificar: el pipeline image-text-to-text se declara, pero no hay ejemplos ni metricas de vision en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/h3fn3r/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Version "DARK ROAST" (maximo nivel de des-censura), segun la model card: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Repositorio GGUF del mismo modelo en la cuenta del autor original: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Qwen3.6-27B-Fable-Fusion-711 (27B recomendado por el autor): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Qwen3.8-27B-Cold-Fusion-GAIN-V1.1: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
