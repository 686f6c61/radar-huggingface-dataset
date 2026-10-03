# benzeng/tritfold-1.7b-instruct-ptq1_0

## Resumen

Tritfold 1.7B ternary · instruct (PTQ1_0) es la variante afinada para instrucciones del modelo Tritfold, desarrollado por el usuario benzeng. Se trata de una reproduccion de investigacion independiente, construida sobre Qwen/Qwen3-1.7B (Alibaba Qwen) y sometida a un proceso de cuantizacion ternaria con entrenamiento consciente de cuantizacion (quantization-aware training). El resultado es un peso de 424 MB exactos a 1,75 bits por peso (bpw), aproximadamente 9,1 veces mas pequeno que el modelo en precision completa, empaquetado en formato GGUF.

El problema que aborda es el de la inferencia en entornos con restricciones severas de memoria: el modelo parte de una version ternaria entrenada solo con Wikipedia y despues se destila sobre una mezcla de ultrachat (60%) y wiki (40%), de modo que, segun el autor, "aprende a responder, no a saber". Es decir, gana registro conversacional y capacidad de seguir instrucciones sin mejorar sus conocimientos factuales, que siguen siendo poco fiables a esa tasa de compresion.

Es relevante ahora porque demuestra que la cuantizacion ternaria extrema es viable en modelos de ~2.000 millones de parametros con licencia Apache-2.0 y pesos de menos de medio gigabyte, aunque exige un fork especifico de llama.cpp (rama prism de PrismML) y una receta de muestreo obligatoria. La fecha de publicacion registrada en HuggingFace es el 2 de octubre de 2026 y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-1.7B, con cuantizacion ternaria PTQ1_0 (metadatos Hadamard) |
| Parametros totales | 2.031.739.904 (2,03 B) segun safetensors; el autor lo etiqueta comercialmente como 1.7B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Ternaria PTQ1_0 a 1,75 bpw (tamano exacto: 424 MB) |
| Idiomas soportados | Ingles (corpus dominante en ingles); el chino no fue adquirido durante el entrenamiento |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Qwen3-1.7B, reutilizada como modelo base. Sobre ella se aplica una cuantizacion ternaria (valores en el conjunto de tres niveles, con metadatos asociados a transformadas de Hadamard que el runtime debe interpretar). El pipeline declarado combina quantization-aware training con una fase posterior de destilacion sobre instrucciones: primero se obtuvo el modelo ternario "wiki-only" y despues se ajusto sobre una mezcla de ultrachat (60%) y wiki (40%) para convertir el comportamiento de continuacion de texto en comportamiento de respuesta a instrucciones.

Los datos concretos de entrenamiento (numero de tokens, composicion exacta del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La model card si documenta el comportamiento del ajuste: la perplejidad en wiki con protocolo bf16 alcanza un mejor valor de 25,73 en el step 800 (1,26 veces la del modelo en precision completa) y termina en 27,87, sin que el guard de perplejidad se haya superado en ningun momento. La innovacion tecnica principal es precisamente el formato PTQ1_0 a 1,75 bpw con metadatos Hadamard, que ningun runtime de llama.cpp en la rama principal puede cargar hoy.

## Capacidades

- Generacion de texto conversacional en registro instructivo: el cambio de comportamiento respecto al modelo base wiki-only esta documentado con un ejemplo antes/despues sobre la misma pregunta.
- Seguimiento de instrucciones en ingles a nivel de tarea (por ejemplo, listar consejos para escribir mejor codigo Python), con respuestas on-task.
- Respuestas en formato de lista y explicaciones breves sobre temas generales, sin garantia de exactitud factual.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingues muy limitadas: el entrenamiento es de dominio ingles y el chino no fue adquirido.
- No hay capacidades de vision, audio ni modo de razonamiento explicito. La salida puede comenzar con un bloque `<think>` vacio residual del dataset de entrenamiento, que el propio autor califica de artefacto cosmetico y recomienda eliminar.

## Casos de uso

- Prototipado de cuantizacion ternaria: sirve como referencia reproducible para investigadores que quieran medir el coste real en calidad de un esquema a 1,75 bpw sobre un transformer de 2 B de parametros, con una linea base FP de comparacion incluida en la model card.
- Despliegue en dispositivos con memoria minima: con 424 MB de pesos, encaja en entornos de contenedor serverless, sistemas embebidos con CPU x86/ARM y maquinas sin GPU dedicada, siempre que se use el fork PrismML de llama.cpp.
- Asistente conversacional de bajo coste para tareas de formulacion: puede reescribir, resumir o reformatear texto en ingles manteniendo un tono conversacional, sin depender de sus conocimientos factuales.
- Generacion de borradores y sugerencias de codigo simple: la model card documenta respuestas utiles a peticiones del tipo "lista dos consejos para escribir mejor codigo Python", apropiado para sugerencias genericas y no para codigo de produccion verificado.
- Demostraciones educativas: permite ilustrar en un aula o un articulo el efecto de la destilacion conversacional sobre un modelo ternario, comparando el antes (wiki-only) y el despues (instruct) con el mismo prompt y el mismo runtime.
- Filtrado y clasificacion de texto informal en ingles: al haber ganado registro conversacional, puede emplearse en tareas de etiquetado o triaje de baja criticidad donde los errores factuales no tengan consecuencias.
- Investigacion en leyes de escalado de la compresion: el par de metricas perplejidad wiki y ARC-Challenge permite estudiar que capacidades se degradan antes y cuales despues al bajar a precision ternaria.

## Benchmarks y rendimiento

| Metrica | Tritfold 1.7B instruct (PTQ1_0) | Referencia en precision completa (Qwen3-1.7B) |
|---|---|---|
| Perplejidad wiki (protocolo bf16, mejor valor, step 800) | 25,73 (1,26x respecto a FP) | Referencia FP del ratio; valor absoluto no disponible |
| Perplejidad wiki (valor final) | 27,87 | No disponible |
| ARC-Challenge (acc_norm, evaluacion por likelihood) | 0,234 | 0,377 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites en la informacion disponible. El propio autor advierte que la destilacion conversacional no corrige los benchmarks de conocimiento, como refleja la caida de ARC-Challenge.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB, correspondiente a los 424 MB de pesos mas el overhead del runtime y el contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Tambien es viable en GPU integradas.
- Inferencia en CPU: viable y probablemente el escenario objetivo, dado el tamano del fichero. El autor no publica cifras de latencia ni de throughput.
- Opciones de despliegue: unicamente el fork de llama.cpp de PrismML (rama `prism`), obligatorio porque la rama principal no puede cargar PTQ1_0 ni aplicar los metadatos Hadamard. No se menciona compatibilidad con vLLM, Ollama, TGI ni otros servidores de inferencia.
- Receta de muestreo obligatoria: `--temp 0.5 --top-p 0.85 --top-k 20 --repeat-penalty 1.1` con `-n 96 -st`. El autor indica que las colas ternarias son planas y que los valores por defecto entran en bucle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad wiki | ARC-Challenge | Licencia | Formato |
|---|---|---|---|---|---|---|
| Tritfold 1.7B instruct PTQ1_0 | 2,03 B | No disponible | 25,73 mejor / 27,87 final | 0,234 | Apache-2.0 | GGUF ternario (1,75 bpw), 424 MB |
| Qwen3-1.7B (precision completa, referencia de la model card) | 2,03 B | No disponible en la informacion proporcionada | Referencia FP del ratio 1,26x | 0,377 | Apache-2.0 | safetensors |
| Otras alternativas ternarias de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables en la informacion disponible es contra el propio modelo base en precision completa. Existen otras familias de modelos ternarios en el ecosistema open source, pero no se han proporcionado datos de benchmark comparables en esta ficha, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Fiabilidad factual muy baja: el propio autor la describe como la "marca de agua" de 1,75 bpw y advierte de que los hechos siguen siendo poco fiables.
- Respuesta de identidad invertida: ante la pregunta "who are you?" el modelo responde con un rol cambiado, inconsistente con su naturaleza; el autor lo atribuye a una peculiaridad de modelos pequenos.
- Degradacion medida en conocimiento: ARC-Challenge cae de 0,377 (FP) a 0,234 (acc_norm), una perdida sustancial que la destilacion conversacional no compensa.
- Cobertura idiomatica restringida: entrenamiento de dominio ingles y ausencia total de chino. No hay datos de soporte para el castellano ni para otros idiomas.
- Dependencia de un runtime no estandar: sin el fork PrismML de llama.cpp (rama `prism`), el modelo no carga. Esto complica el mantenimiento, la integracion en produccion y la actualizacion de dependencias.
- Sensibilidad a los parametros de muestreo: con los valores por defecto el modelo entra en bucle; es obligatorio aplicar la receta documentada, lo que limita la portabilidad a otros frameworks que no expongan esos controles.
- Artefacto de salida: puede emitir un bloque `<think>` vacio al inicio, procedente del dataset de entrenamiento.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo es un derivado de Qwen3-1.7B (tambien Apache-2.0), por lo que conviene conservar la atribucion al equipo de Alibaba Qwen. El autor declara no tener afiliacion con PrismML ni con Caltech.
- Riesgo de alucinacion alto en cualquier tarea que exija recuperar conocimiento factual; no debe usarse como fuente de informacion sin verificacion externa.
- Sin datos publicos de latencia, throughput ni comportamiento bajo carga concurrente, lo que impide dimensionar un despliegue en produccion con garantias.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o de correccion temprana de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benzeng/tritfold-1.7b-instruct-ptq1_0
- Repositorio del proyecto Tritfold: https://github.com/benzeng/tritfold
- Fork de llama.cpp requerido (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
