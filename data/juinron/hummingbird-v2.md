# juinron/Hummingbird-V2

## Resumen

Hummingbird-V2 es un modelo de lenguaje base en ingles de 9,6 millones de parametros, desarrollado por el usuario juinron y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un transformer decoder-only entrenado desde cero sobre 10.000 millones de tokens, disenado especificamente para completado de texto y puntuacion de continuaciones (scoring), no para dialogo ni instrucciones. Es la segunda entrega de la serie Hummingbird, tras Hummingbird-V1, y arranca desde una inicializacion nueva en lugar de continuar el entrenamiento del modelo anterior.

Su relevancia es fundamentalmente de investigacion: con menos de 10 millones de parametros y una ventana de contexto de 2.048 tokens, el modelo es pequeno suficiente para entrenarse y evaluarse en recursos muy limitados, lo que lo convierte en una plataforma util para experimentar con recetas de preentrenamiento, mezclas de datos y optimizadores (en este caso Muon combinado con AdamW). El autor declara un consumo de 10.000 millones de tokens siguiendo una mezcla ponderada de corpus educativos y cientificos, con un tokenizador BPE a nivel de byte de 4.096 entradas consciente de digitos.

El modelo no esta ajustado por instrucciones ni alineado en seguridad, y sus resultados zero-shot publicados son modestos (por ejemplo, 27,63 en HellaSwag, apenas por encima del azar, y un indice de inteligencia normalizado por azar de 9,556). Esto lo situa como una pieza de laboratorio o de prototipado, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention y SwiGLU |
| Parametros totales | 9.756.560 segun safetensors; 9.592.720 segun la model card (discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrenamiento con contexto de 512 tokens) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo personalizado empaquetado (requiere trust_remote_code=True) |

Otros datos tecnicos declarados: 14 capas, hidden size de 240, vocabulario de 4.096 tokens (BPE a nivel de byte con tratamiento especifico de digitos). Tamano del repositorio: 0,0 GB. Descargas y likes en el momento de la consulta: 0.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con dos decisiones destacables: grouped-query attention (GQA) y activaciones SwiGLU. Con 14 capas y un hidden size de 240, el modelo opera en el rango de los modelos "tiny" orientados a investigacion. El tokenizador es un BPE a nivel de byte de 4.096 entradas descrito como "digit-aware", un detalle poco habitual que probablemente busca mejorar el manejo de representaciones numericas en tareas aritmeticas, coherente con la inclusion de ArithMark-3 entre los benchmarks evaluados.

El preentrenamiento consumio 10.000 millones de tokens con una mezcla explicitamente ponderada: 55% de fuentes FineWeb-Edu, 15% de Cosmopedia v2, 10% de FineMath 4+, 10% de DCLM baseline, 7% de Dolma 3 (ciencia, question answering y codigo) y 3% de FinePDFs-Edu. El regimen de optimizacion combino Muon y AdamW, con una longitud de contexto de entrenamiento de 512 tokens, inferior a la ventana maxima de 2.048 tokens que declara el modelo. No se menciona ningun tipo de ajuste posterior (RLHF, DPO, SFT); es un modelo estrictamente base. El autor remite a los ficheros TRAINING_DATA.md y training/provenance.json del repositorio para la receta completa, aunque el contenido de esos ficheros no forma parte de la informacion proporcionada. Cabe senalar que las etiquetas del repositorio incluyen "microloop_diffusion" y "conversational", terminos que no aparecen explicados ni en la model card ni en la tabla de arquitectura.

## Capacidades

- Generacion de texto por continuacion: el modelo completa una secuencia dada, sin formato conversacional ni seguimiento de instrucciones.
- Puntuacion de continuaciones: su caso de uso declarado principal es asignar probabilidad o puntuacion a una continuacion de texto, util para filtrado y seleccion de datos.
- Razonamiento aritmetico basico: la evaluacion ArithMark-3 (36,00) y el tokenizador digit-aware apuntan a un interes explicito por el manejo de numeros, aunque el rendimiento obtenido es bajo.
- Comprension lectora y sentido comun a nivel elemental: evaluado en HellaSwag, PIQA, ARC-Easy y ARC-Challenge, con resultados cercanos al azar.
- Multilingue: no. Solo ingles declarado.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado ni evaluado.
- Modo thinking, vision o audio: no disponible.
- Ajuste por instrucciones: no. El autor indica explicitamente que el modelo no esta instruction-tuned ni alineado en seguridad.

## Casos de uso

- Filtrado y curado de corpus de preentrenamiento: el modelo puede puntuar continuaciones para calcular perplejidad o calidad sobre grandes volumenes de texto educativo en ingles, ayudando a descartar documentos de baja calidad antes de alimentar modelos mayores. Es adecuado por su tamano minimo, que permite ejecutarlo sobre millones de documentos con coste despreciable.
- Ablaciones de optimizadores y recetas de entrenamiento: sirve como banco de pruebas reproducible para comparar Muon frente a AdamW, distintas tasas de aprendizaje o diferentes mezclas de datos en un presupuesto de computo de decenas de GPU-hora en lugar de miles.
- Prototipado educativo de pipelines de preentrenamiento: permite montar de principio a fin el ciclo completo (tokenizacion, mezcla de datasets, entrenamiento, evaluacion zero-shot) en una sola GPU consumer, lo que resulta util en docencia e investigacion academica.
- Punto de partida para fine-tuning en tareas de clasificacion: con 9,6 millones de parametros se puede ajustar en minutos sobre conjuntos etiquetados en ingles y comparar la cabeza de clasificacion resultante con lineas base clasicas tipo bolsa de palabras o TF-IDF.
- Investigacion sobre representaciones numericas: el tokenizador digit-aware lo hace apropiado para estudiar como afecta la tokenizacion al aprendizaje aritmetico en modelos pequenos, comparando curvas de ArithMark-3 entre variantes.
- Inferencia en entornos embebidos o edge: con pesos del orden de decenas de megabytes en fp32, es viable ejecutarlo en CPU, Raspberry Pi o microcontroladores con soporte de tensores, para tareas de autocompletado muy restringido o deteccion de anomalias textuales.
- Evaluacion de seguridad y sesgo a escala: dado que es un modelo base sin alineacion, sirve como referencia de control en estudios sobre que comportamientos emergen y cuales no en modelos de este orden de magnitud.

## Benchmarks y rendimiento

El autor publica resultados zero-shot ejecutados por el mismo para el checkpoint de 10.000 millones de tokens. Las puntuaciones son precision de continuacion normalizada en porcentaje y el indice de inteligencia es un compuesto normalizado por azar. El propio autor advierte que estos resultados no han sido verificados de forma independiente.

| Benchmark | Puntuacion | Referencia de azar orientativa |
|---|---:|---|
| HellaSwag | 27,63 | 25 (4 opciones) |
| ARC-Easy | 39,39 | 25 |
| ARC-Challenge | 21,16 | 25 |
| PIQA | 57,40 | 50 |
| ArithMark-3 | 36,00 | no disponible |
| Indice de inteligencia normalizado por azar | 9,556 | 0 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, ni tampoco resultados de MMLU, HumanEval, GSM8K o similares.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del recuento de parametros publicado (9.756.560), no datos declarados por el autor.

- VRAM estimada para inferencia: aproximadamente 39 MB en fp32, 20 MB en fp16/bf16 y 10 MB en int8. El peso del modelo es practicamente irrelevante frente a cualquier otro componente del sistema.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente. El modelo tambien funciona en CPU sin penalizacion practica de latencia para secuencias cortas.
- GPU consumer: cabe en practicamente cualquier GPU consumer de las ultimas dos decadas, incluidas GTX 1050, RTX 3060, RTX 4090, e incluso en iGPU de portatiles modernos y en placas tipo Raspberry Pi.
- Opciones de despliegue: la via soportada es Transformers con AutoModelForCausalLM y trust_remote_code=True. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion manual del checkpoint y verificar que el codigo personalizado sea portable. El soporte en vLLM o TGI no esta documentado ni verificado.
- Latencia y throughput estimados: no disponible. Al ser un modelo de 14 capas y hidden size 240, con GQA, la decodificacion autoregresiva es de orden de milisegundos por token en CPU moderna y muy inferior en GPU, pero no hay cifras publicadas.
- Nota operativa: el uso de trust_remote_code=True implica ejecutar codigo del autor; conviene auditar los ficheros de modelado antes de desplegarlo en un entorno de produccion.

## Comparativa con modelos similares

Los datos de comparacion pertenecen a la informacion proporcionada o a caracteristicas ampliamente conocidas de los modelos citados; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---|---|---|---|
| Hummingbird-V2 | 9,6 M | 2.048 tokens | Apache-2.0 | Ingles | Base, sin ajuste por instrucciones, Muon + AdamW, tokenizador digit-aware |
| Hummingbird-V1 | no disponible | no disponible | no disponible | no disponible | Predecesor de la misma serie; V2 parte de inicializacion nueva, no de V1 |
| Modelos "tiny" tipo GPT-2 small | 124 M | 1.024 tokens | MIT (pesos originales de OpenAI) | Ingles | Orden de magnitud mayor en parametros; referencia historica de la categoria |
| Modelos tipo Pythia-14M / Pythia-70M | 14 M / 70 M | 2.048 tokens | Apache-2.0 | Ingles | Suite de investigacion con checkpoints intermedios publicados, orientada a interpretabilidad |

No se dispone de resultados de benchmarks comparativos directos entre Hummingbird-V2 y estas alternativas dentro de la informacion proporcionada, por lo que no es posible afirmar cual rinde mejor en sentido estricto.

## Limitaciones y advertencias

- Rendimiento cercano al azar en tareas de sentido comun: HellaSwag 27,63 frente a un azar de 25 y ARC-Challenge 21,16 frente a 25 indican una capacidad de razonamiento practicamente nula en estos dominios. El indice compuesto normalizado es de solo 9,556.
- Modelo base sin alineacion: no esta ajustado por instrucciones ni alineado en seguridad. Puede generar contenido inapropiado, ofensivo o falso y no debe exponerse directamente a usuarios finales.
- Proposito declarado limitado: el propio autor lo define como modelo para completado de texto y puntuacion de continuaciones, no para conversacion ni toma de decisiones.
- Riesgo de alucinacion: alto. Un modelo de 9,6 millones de parametros no puede memorizar hechos de forma fiable; cualquier afirmacion factual que genere debe verificarse.
- Cobertura idiomatica: solo ingles. No hay evidencia de capacidades en castellano ni en otros idiomas, y el vocabulario de 4.096 entradas es muy reducido para textos multilingues.
- Contexto limitado: 2.048 tokens maximos, con entrenamiento a 512 tokens. El rendimiento mas alla de 512 tokens no esta documentado y es probable que degrade.
- Inconsistencia de metadatos: las etiquetas del repositorio mencionan "microloop_diffusion" y "conversational", que no se corresponden con la arquitectura descrita (transformer decoder-only) ni con el uso declarado. Conviene no basar decisiones en las etiquetas.
- Discrepancia en el recuento de parametros: 9.756.560 frente a 9.592.720 segun la fuente consultada (safetensors frente a la model card). No esta aclarada.
- Resultados no verificados: las evaluaciones son ejecutadas por el autor y no han sido replicadas de forma independiente.
- Codigo personalizado: requiere trust_remote_code=True, lo que implica ejecutar codigo de terceros y revisarlo antes de cualquier uso en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero se deben respetar los avisos de terceros de los datasets (ficheros NOTICE y TRAINING_DATA.md). No hay garantia de idoneidad para uso comercial realista dado el rendimiento.
- Escasez de adopcion: cero descargas y cero likes en el momento de la consulta, sin ecosistema de fine-tunes, cuantizaciones ni herramientas de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juinron/Hummingbird-V2
- Modelo predecesor, Hummingbird-V1: https://huggingface.co/juinron/Hummingbird-V1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FinePDFs-Edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Dolma 3 dolmino mix 100B: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Dataset Dolma 3 dolmino mix 10B: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo independiente: no disponible
- Demo o espacio interactivo: no disponible
