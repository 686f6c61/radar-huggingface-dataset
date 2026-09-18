# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-LoRA

## Resumen

DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-LoRA es un adaptador PEFT LoRA publicado por el usuario DuoNeural sobre el modelo base DuoNeural/LFM2.5-8B-A1B-Abliterated, que a su vez deriva de la familia Liquid Foundation Model 2.5 8B A1B de Liquid AI. Se trata, por tanto, de un artefacto de ajuste fino (no de un modelo completo): su repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, no los pesos del modelo base. El autor publica además el modelo fusionado y una versión cuantizada en GGUF en repositorios separados.

El objetivo declarado del ajuste es especializar el modelo en dos ejes: capacidades agénticas de código (generación de código, function calling con esquema tipo Hermes y razonamiento multi-paso) y eliminación de rechazos mediante "abliteration", es decir, la supresión de los mecanismos de alineación de seguridad del modelo original. La model card reporta una configuración LoRA con rango 64, alpha 128 y dropout 0,05, entrenada con secuencias de 2.048 tokens.

La relevancia del artefacto es doble. Por un lado, se apoya en una arquitectura MoE de 8,3B parámetros totales con aproximadamente 1,5B activos por token, lo que permite throughput elevado en hardware de consumo según las cifras del propio autor. Por otro lado, conviene tratarlo con cautela: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, todos los datos de rendimiento son autodeclarados por el autor y no se ha localizado validación independiente. Además, los propios números de la model card presentan inconsistencias internas (por ejemplo, 88,0% en HumanEval frente a 52,4% en EvalPlus: HumanEval), lo que refuerza la necesidad de verificación propia antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada del modelo base; el repositorio es un adaptador LoRA |
| Parámetros totales | 8,3B (según la model card, correspondientes al modelo base; el adaptador no añade parámetros completos, solo matrices de bajo rango con r=64) |
| Parámetros activos | ~1,5B por token (MoE, dato declarado por el autor) |
| Longitud de contexto | No disponible. La model card solo indica longitud de secuencia de entrenamiento de 2.048 tokens |
| Tipos de cuantización | No disponible para el adaptador (safetensors). Existe un repositorio GGUF del modelo fusionado, pero no se detallan los tipos concretos |
| Idiomas soportados | No disponible (los tags incluyen region:us, sin lista de idiomas) |
| Licencia | liquid-foundation-model-community-license (license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de artefacto | Adaptador LoRA (library_name: peft), no modelo completo |
| Modelo base | DuoNeural/LFM2.5-8B-A1B-Abliterated |
| Configuración LoRA | r=64, alpha=128, dropout=0,05 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LFM 2.5 8B A1B de Liquid AI, un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 1,5B de los 8,3B parámetros totales por token. El adaptador se entrena sobre una variante ya modificada del modelo (DuoNeural/LFM2.5-8B-A1B-Abliterated), de modo que la cadena de derivación es: LFM 2.5 8B A1B original, versión "abliterated" y, finalmente, este adaptador LoRA orientado a código y uso agéntico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

Los únicos hiperparámetros de entrenamiento publicados son los de la LoRA: rango 64, alpha 128, dropout 0,05 y longitud de secuencia de 2.048 tokens. El autor describe el ajuste como QLoRA (así aparece en la tabla comparativa de la model card) y etiqueta el resultado con los términos "hermes", "function-calling" y "agentic", lo que sugiere un conjunto de datos orientado a llamadas a herramientas con formato de esquema estructurado. No se documenta ninguna innovación arquitectónica propia: el valor añadido declarado es el ajuste fino y la supresión de rechazos, no un cambio en el modelo base.

## Capacidades

- Generación de código: la model card reporta resultados en HumanEval, EvalPlus (HumanEval/HumanEval+) y MBPP/MBPP+, con foco en síntesis algorítmica en Python.
- Function calling: se declara un 100% de acierto (25/25) en validación AST de esquemas de argumentos con formato Hermes, es decir, generación de llamadas a herramientas sintácticamente válidas.
- Uso agéntico y razonamiento multi-paso: el ajuste está orientado a bucles de agente, con menciones explícitas a "cadenas de pensamiento" y a la continuidad entre el bloque de pensamiento y la respuesta final.
- Capacidad "uncensored" mediante abliteration: el autor declara cero rechazos en tareas de análisis de bajo nivel, ingeniería inversa y análisis de exploits. Es una modificación del comportamiento del modelo, no una capacidad técnica nueva.
- Razonamiento matemático básico: se reporta un 63,3% en GSM8K.
- Conversación: el pipeline es text-generation con etiqueta conversational, aunque no se documentan evaluaciones de diálogo.
- Capacidades multilingües: no disponibles. No hay lista de idiomas ni evaluaciones por idioma.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes de código locales en bucle cerrado: el modelo está ajustado para emitir llamadas a herramientas con esquema válido, de modo que puede encadenar lectura de ficheros, ejecución de tests y corrección en un bucle multi-paso, con el throughput declarado (~352-360 tps en una RTX 4080 Super) como argumento para reducir la latencia acumulada del bucle.
- Integración en pipelines de CI/CD: generación de parches y pequeños módulos a partir de descripciones o de fallos de test, aprovechando el soporte de function calling para invocar herramientas de build y de análisis estático.
- Generación de tests unitarios: los números declarados en EvalPlus (HumanEval+ 46,3%, MBPP+ 48,9%) apuntan a cierta resistencia ante casos límite mutados, lo que resulta relevante al generar pruebas que deben cubrir entradas no triviales.
- Asistencia en programación de sistemas y bajo nivel: el ajuste sin rechazos permite abordar tareas de análisis de memoria, depuración de kernels o lectura de código C de bajo nivel que los modelos alineados estándar suelen rechazar. Requiere revisión humana y encaje legal en el contexto de uso.
- Análisis de seguridad ofensiva y defensiva en laboratorio: el autor posiciona explícitamente el modelo para análisis de exploits e ingeniería inversa, lo que lo hace utilizable en entornos controlados de pentesting y formación, siempre que se cumplan las condiciones de la licencia comunitaria.
- Prototipado y demos en portátil: la model card reporta ~80-90 tps en una GTX 1070 Mobile, lo que sugiere viabilidad de ejecución en hardware de gama media-baja mediante cuantización, útil para demos offline o entornos sin GPU de datacenter.
- Tutoría de problemas algorítmicos y matemáticos: con 63,3% en GSM8K y los resultados declarados en HumanEval, puede emplearse como asistente de resolución guiada, dejando la verificación de la respuesta al usuario.
- Asistentes conversacionales técnicos de turno corto: dado que el adaptador se entrenó con secuencias de 2.048 tokens y no se documenta la ventana nativa del modelo base, es adecuado para diálogos técnicos de contexto corto, no para conversaciones de contexto largo sin verificación previa.

## Benchmarks y rendimiento

Todos los datos siguientes proceden de la model card del autor y son autodeclarados ("LIVE"); no se ha localizado verificación independiente. Se reproducen tal cual, sin normalizar.

| Benchmark | Stock LFM 2.5 8B A1B (según autor) | DuoNeural v2 (adaptador) |
|---|---|---|
| HumanEval (síntesis Python, Pass@1) | ~40,0%-44,0% | 88,0% (22/25) |
| EvalPlus: HumanEval (base) | ~36,8% | 52,4% (86/164) |
| EvalPlus: HumanEval+ (extra) | ~31,2% | 46,3% (76/164) |
| EvalPlus: MBPP (base) | ~45,0% | 59,3% (224/378) |
| EvalPlus: MBPP+ (extra) | ~38,1% | 48,9% (185/378) |
| GSM8K | ~58,0% | 63,3% |
| Hermes Function Calling (validación AST) | 49,7% (BFCL, según autor) | 100,0% (25/25) |
| Tasa de anomalía EOS / congelación | ~50-70% de caída | 0,0% (0/3) |
| Throughput en RTX 4080 Super | ~380 tps | ~352-360 tps |
| Throughput en GTX 1070 Mobile | ~90 tps | ~80-90 tps |

Comparativa de clase 8B publicada por el autor (decodificación greedy zero-shot, según la model card):

| Modelo | Tamaño activo / total | HumanEval | HumanEval+ | MBPP | MBPP+ |
|---|---|---|---|---|---|
| DuoNeural LFM 2.5 8B v2 | 1,5B / 8,3B MoE | 52,4% | 46,3% | 59,3% | 48,9% |
| Llama-3-8B-Instruct | 8,0B denso | 62,2% | 46,3% | 67,9% | 51,5% |
| Gemma-7B-it | 7,0B denso | 44,5% | 40,2% | 57,1% | 46,6% |
| Mistral-7B-Instruct-v0.3 | 7,2B denso | 40,2% | 35,4% | 53,7% | 44,2% |
| Granite-3.3-8B-Instruct | 8,2B denso | 25,6% | 21,3% | 61,3% | 51,3% |
| DeepSeek-Coder-7B-Instruct | 7,0B denso (código) | 78,7% | 67,1% | 75,4% | 64,8% |

Advertencia sobre estos datos: la propia tabla del autor muestra 88,0% en HumanEval (22/25) y 52,4% en EvalPlus: HumanEval (86/164) para el mismo modelo y la misma tarea base. Es una discrepancia no explicada en la model card (podría deberse a protocolos de evaluación distintos, pero no se documenta), por lo que ninguno de los dos valores debe tomarse como referencia fiable sin reproducirlo. Las cifras de los modelos comparados tampoco van acompañadas de fuente ni de fecha de evaluación.

## Requisitos de hardware

- El repositorio es un adaptador LoRA de 0,1 GB; para inferir hay que cargar el modelo base de 8,3B parámetros totales (1,5B activos). Los requisitos de VRAM vienen determinados por el modelo base, no por el adaptador.
- Estimaciones de memoria para los pesos, calculadas a partir del tamaño declarado de 8,3B parámetros y no verificadas: en bf16/fp16 en torno a 16-17 GB; en cuantización de 8 bits en torno a 9 GB; en 4 bits en torno a 5-6 GB. Hay que sumar caché KV y activaciones, y el adaptador debe aplicarse en memoria.
- GPU recomendadas: el autor cita una RTX 4080 Super (~352-360 tps) y una GTX 1070 Mobile (~80-90 tps, presumiblemente con cuantización). No se indica la VRAM empleada en ninguna de las dos mediciones.
- Viabilidad en GPU de consumo: probable en tarjetas de 24 GB (RTX 3090/4090) sin cuantizar; en tarjetas de 8-12 GB requeriría cuantización y no hay datos publicados que confirmen el funcionamiento con esos tamaños.
- Opciones de despliegue: transformers + PEFT (aplicando el adaptador sobre el modelo base), vLLM con soporte de adaptadores LoRA, y llama.cpp/Ollama a través del repositorio GGUF del modelo fusionado. Soporte en TGI no disponible.
- Latencia y throughput: las únicas cifras disponibles son las del autor (~352-360 tps en RTX 4080 Super, ~80-90 tps en GTX 1070 Mobile). No se especifican tamaño de lote, longitud de prompt ni configuración de cuantización, por lo que no son extrapolables a otros entornos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (datos del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre LFM 2.5 8B A1B Abliterated) | 8,3B totales / 1,5B activos (MoE) | No disponible (entrenado a 2.048 tokens) | HumanEval 52,4% (EvalPlus base); MBPP 59,3% | liquid-foundation-model-community-license | Repositorio público con 0 descargas y 0 likes; modelo fusionado y GGUF publicados aparte |
| Llama-3-8B-Instruct | 8,0B densos | No disponible en esta consulta | HumanEval 62,2%; HumanEval+ 46,3% (según el autor) | No verificada en la información disponible | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7,2B densos | No disponible en esta consulta | HumanEval 40,2%; HumanEval+ 35,4% (según el autor) | No verificada en la información disponible | Ampliamente disponible |
| DeepSeek-Coder-7B-Instruct | 7,0B densos, especializado en código | No disponible en esta consulta | HumanEval 78,7%; HumanEval+ 67,1% (según el autor) | No verificada en la información disponible | Ampliamente disponible |

La comparación debe leerse con reservas: los valores de los modelos alternativos proceden de la tabla del propio autor del adaptador, no de evaluaciones propias ni de fuentes independientes, y no se indica la versión ni el protocolo exacto empleado en cada caso.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo autónomo. Necesita el modelo base DuoNeural/LFM2.5-8B-A1B-Abliterated para funcionar, y ese modelo base a su vez ya incorpora modificaciones de abliteration sobre LFM 2.5 8B A1B.
- Evidencia empírica no verificada: todos los benchmarks son autodeclarados. El repositorio registra 0 descargas y 0 likes, sin validación de terceros ni resultados reproducidos.
- Inconsistencia interna en los datos: el 88,0% en HumanEval (22/25) y el 52,4% en EvalPlus: HumanEval (86/164) describen la misma tarea base con resultados muy distintos, sin explicación en la model card. Además, las muestras de HumanEval (25 problemas) y de validación AST (25 casos) son demasiado pequeñas para extraer conclusiones robustas.
- Seguridad eliminada de forma deliberada: el ajuste mediante abliteration suprime los rechazos del modelo original. Esto implica que puede generar contenido sobre explotación de vulnerabilidades, análisis de memoria o código ofensivo sin filtros, con el riesgo legal y ético correspondiente. Cualquier despliegue necesita controles externos (moderación, sandbox, registro de uso).
- Riesgo de alucinación: no hay evaluación publicada de veracidad, atribución de fuentes ni calibración de confianza. Se trata de un modelo ajustado para código, no para respuestas factuales.
- Ventana de contexto: el adaptador se entrenó con secuencias de 2.048 tokens y no se documenta la ventana nativa del modelo base. El rendimiento en contextos largos no está garantizado y puede degradarse respecto al modelo original.
- Idiomas: no hay información sobre cobertura multilingüe. El tag region:us sugiere un sesgo hacia inglés; no se documentan evaluaciones en castellano ni en otros idiomas.
- Licencia restrictiva: la licencia liquid-foundation-model-community-license (https://www.liquid.ai/community-license) es una licencia comunitaria, no una licencia de código abierto estándar. Antes de cualquier uso comercial hay que revisar sus condiciones, y además la abliteration puede entrar en conflicto con las cláusulas de uso aceptable de la licencia original.
- Trazabilidad de datos de entrenamiento: se desconocen el dataset, el número de tokens y las técnicas de alineación empleadas en el adaptador, lo que dificulta auditar sesgos y procedencia del contenido.
- Fechas del repositorio: la creación y la actualización figuran como 2026-09-18, posteriores a la fecha habitual de consulta, dato que conviene verificar directamente en HuggingFace.

## Enlaces

- Adaptador LoRA (este repositorio): https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-LoRA
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Abliterated
- Modelo completo fusionado: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2
- Cuantizaciones GGUF del modelo fusionado: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF
- Licencia comunitaria de Liquid AI: https://www.liquid.ai/community-license
- La búsqueda web realizada no ha devuelto resultados relevantes para este modelo (únicamente páginas de soporte técnico de Microsoft sin relación con el tema). No se dispone de papers, blogs ni demos adicionales.
