# schwyzquant/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario schwyzquant a partir del modelo de ajuste fino DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP. Se trata, por tanto, de una redistribución cuantizada y no de un entrenamiento original: el trabajo de fine-tuning, merges multi-etapa y abliteración corresponde a DavidAU y a sus colaboradores (Nightmedia, TeichAI, armand0e y trohrbaugh), mientras que este repositorio aporta los pesos GGUF listos para inferencia local.

El modelo base cuenta con 26.895.998.464 parámetros (unos 26,9 mil millones) y está construido sobre la familia Qwen3.6, según indican las etiquetas y el nombre del repositorio. La ficha del autor lo describe como un modelo de "todos los casos de uso", con modo thinking/razonamiento, capacidades de visión (pipeline image-text-to-text) y un proceso de "heretic"/abliteración que elimina parte de los mecanismos de rechazo. La licencia declarada es Apache-2.0 y los idiomas soportados son inglés (en) y chino (zh).

Su relevancia actual reside en dos factores: por un lado, permite ejecutar un modelo de ~27B con cuantizaciones de 4 y 8 bits en hardware de consumo; por otro, el autor afirma que es el primer fine-tune abierto de este tamaño en superar 700 puntos en ARC-C tanto en 8 como en 4 bits, igualando o superando en 6 de 7 benchmarks al Qwen3.6-27B original. Estas cifras proceden exclusivamente de la model card y no se han podido contrastar con datos independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; modelo derivado de la familia Qwen3.6 (27B), con fine-tune y merge multi-etapa |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible; la ficha menciona mejora del rendimiento en contexto largo por el uso de quants imatrix NEO, sin cifra concreta |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (multi-token prediction), cuantizados con imatrix NEO; se mencionan explicitamente 4 bits y 8 bits; el tensor de salida (10-20% del total) se mantiene en precision completa de 16 bits en todos los quants; pesos originales en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base esta en safetensors/bfloat16 |

## Arquitectura y entrenamiento

La ficha describe el modelo como un fine-tune multi-etapa, multi-fine-tune y multi-merge. El proceso combina varios ajustes finos propios con merges posteriores, verificados y comparados en cada etapa (fine-tunes, fine-tunes multi-etapa y cada paso de merge) mediante benchmarks y, como validacion final, pruebas humanas comparativas contra el modelo original. El entrenamiento se realizo con Unsloth y conto con la colaboracion de Nightmedia (merge y benchmarking), TeichAI (dataset Polaris), armand0e (trazas "Light Fable 5") y trohrbaugh (proceso de "heretic"/abliteración).

Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. La model card menciona ademas trazas ligeras de "Fable", trazas de razonamiento de Claude Opus, datos no razonados de GPT-5 (Polaris) y un dataset interno denominado F451. Los objetivos declarados del autor fueron aumentar la inteligencia general y la capacidad de resolucion de problemas, mejorar el seguimiento de instrucciones sin dañar el nucleo del modelo, evitar el "benchmaxing" y mantener o elevar todos los benchmarks centrales. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO: esos datos no estan disponibles.

Como innovacion destacable, el repositorio incorpora dos familias de quants: los "regulares" y los "MTP" (multi-token prediction), que permiten prediccion de varios tokens por paso en runtimes compatibles. Todos los quants son NEO imatrix, lo que segun el autor mejora la precision entre un 2 y un 4 por ciento respecto a GGUFs normales, ademas del comportamiento en contexto largo, y mantienen el tensor de salida en 16 bits.

## Capacidades

- Generacion de texto general, conversacion multi-turno y seguimiento de instrucciones, con mejoras declaradas especificamente en este ultimo apartado.
- Razonamiento y modo thinking: el modelo incluye cadenas de razonamiento explicitas, heredadas del modelo base y reforzadas con trazas de razonamiento de Claude Opus.
- Codigo: las etiquetas incluyen "coder", y la ficha situa el modelo en la categoria de "todos los casos de uso", por lo que cubre generacion y comprension de codigo.
- Vision: el pipeline declarado es image-text-to-text y la ficha lista "Vision" entre las caracteristicas, lo que implica entrada de imagenes junto a texto.
- Escritura creativa: ficcion, relato, roleplay y "todos los generos", segun las etiquetas. El autor aclara que el modelo no fue diseñado especificamente para creatividad, aunque funciona bien en esa tarea.
- Multilingue: limitado a ingles y chino; no se declara soporte de castellano.
- Contenido sin censura: el proceso de abliteracion ("heretic", "uncensored") reduce los rechazos del modelo alineado original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso complejo: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo maneja ficcion, construccion de personajes y tramas de varios generos, con la ventaja de que el ajuste fino no ha degradado las capacidades del modelo base. Es util para redaccion de novelas por capitulos, manteniendo coherencia de estilo y personajes a lo largo de la sesion.
- Roleplay y simulacion de personajes: las etiquetas incluyen "roleplaying" y "fiction", y la ausencia de censura permite explorar personajes con matices psicologicos o tramas adultas que otros modelos rechazarian. Apropiado para prototipado de bots conversacionales de ficcion interactiva.
- Razonamiento multi-paso con modo thinking: al exponer una cadena de razonamiento, resulta adecuado para tareas analiticas (descomposicion de problemas, planificacion, comprobacion de hipotesis) donde interesa auditar el proceso y no solo la respuesta.
- Generacion y revision de codigo en local: al ser un GGUF de ~27B ejecutable en una GPU de 24 GB, permite montar un asistente de programacion sin conexion externa, con privacidad total del codigo fuente, integrandolo en editores mediante un servidor llama.cpp compatible con la API de OpenAI.
- Descripcion y analisis de imagenes (VQA): al soportar entrada image-text-to-text, sirve para etiquetado automatico de imagenes, extraccion de informacion de capturas o diagramas y generacion de descripciones en ingles o chino dentro de un pipeline de datos.
- Asistente conversacional bilingue ingles-chino: util para atencion al cliente o soporte interno en organizaciones que operan con ambos idiomas, ejecutado on-premise para evitar enviar datos a terceros.
- Procesamiento de documentacion tecnica: combinando contexto largo y capacidades de codigo, puede resumir documentacion, extraer fragmentos relevantes y generar ejemplos funcionales en ingles o chino.
- Base para experimentacion con cuantizaciones: al incluir variantes regulares y MTP en un mismo repositorio, es un banco de pruebas practico para medir la degradacion entre 4 y 8 bits, o el impacto de los quants MTP frente a los estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye las siguientes afirmaciones cualitativas del autor, que no se han podido verificar de forma independiente:

| Afirmacion | Valor declarado |
|---|---|
| ARC-C en cuantizacion de 8 bits | superior a 700 ("711" en el nombre del modelo) |
| ARC-C en cuantizacion de 4 bits | superior a 700 |
| Comparativa con Qwen3.6-27B base | supera 6 de los 7 benchmarks y empata en el septimo |
| Comparativa con Qwen3.6-35B-A3B | supera los 7 benchmarks |
| Verificacion externa | el autor afirma que terceros confirman los resultados en la pestaña community |

No se proporcionan los valores numericos por benchmark, ni la lista exacta de los siete benchmarks empleados, ni la metodologia de evaluacion. Tampoco hay resultados publicados para este repositorio de cuantizaciones en concreto, mas alla de la afirmacion de que los quants NEO imatrix mejoran la precision entre un 2 y un 4 por ciento respecto a GGUFs convencionales.

## Requisitos de hardware

Los tamanos de pesos que se indican a continuacion son estimaciones calculadas a partir de los 26,9 mil millones de parametros del modelo, ya que la ficha no publica cifras por cuantizacion. Hay que sumar aparte la cache KV, que crece con la longitud de contexto y con el numero de secuencias simultaneas.

| Cuantizacion | Peso aproximado de los pesos | VRAM recomendada (con contexto moderado) |
|---|---|---|
| Q2_K | ~10 GB | 12-14 GB |
| Q3_K_M | ~13 GB | 14-16 GB |
| Q4_K_M | ~16-17 GB | 18-20 GB |
| Q5_K_M | ~19 GB | 20-22 GB |
| Q6_K | ~22 GB | 24 GB |
| Q8_0 | ~28-29 GB | 32-34 GB |
| BF16 | ~54 GB | 60 GB o mas |

- GPU de consumo: cabe en una RTX 3060 de 12 GB solo en cuantizaciones de 2-3 bits; en una RTX 4090 o RTX 3090 de 24 GB entran Q4_K_M, Q5_K_M y Q6_K con contexto moderado; en una RTX 5090 (32 GB) entra Q8_0.
- GPU profesional: A100 40/80 GB, H100 80 GB o A6000 48 GB permiten Q8_0 y, en el caso de 80 GB, BF16 sin cuantizar.
- Multi-GPU: para BF16 o para contexto muy largo en Q8_0 es recomendable repartir el modelo entre dos GPU de 24-48 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp para los GGUF regulares; vLLM y TGI admiten GGUF de forma parcial. Los quants MTP requieren un runtime con soporte especifico de multi-token prediction, por lo que no funcionaran en todos los backends.
- Latencia y throughput: no disponible. Dependera del backend, del ancho de banda de memoria de la GPU y de la cuantizacion elegida; los quants MTP estan pensados para aumentar el throughput en runtimes compatibles.
- Almacenamiento: el repositorio completo ocupa 465,1 GB, por lo que conviene descargar unicamente el archivo de la cuantizacion deseada.

## Comparativa con modelos similares

Los datos de contexto y de rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada; la comparativa se limita a lo que la propia model card menciona.

| Modelo | Parametros | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| Este repositorio (schwyzquant, GGUF) | ~26,9B | GGUF regular y MTP, 4 y 8 bits | apache-2.0 | Cuantizacion de terceros del modelo de DavidAU |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP | ~26,9B | bfloat16 (safetensors) | apache-2.0 | Modelo base del que deriva este repositorio |
| Qwen3.6-27B (original) | ~27B | bfloat16 y otras | no disponible en la informacion | Segun el autor, el fine-tune lo supera en 6 de 7 benchmarks |
| Qwen3.6-35B-A3B | 35B totales (activos no confirmados; la nomenclatura A3B sugiere ~3B) | no disponible | no disponible | Segun el autor, el fine-tune supera sus 7 benchmarks |
| DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF | ~40B | GGUF (MTP) | no disponible | Variante de mayor tamano del mismo linaje, citada por el autor |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | ~9B | GGUF | no disponible | Modelo de control del mismo autor; ARC-C declarado por encima de 640 |

## Limitaciones y advertencias

- Modelo abliterado y sin censura: los mecanismos de rechazo han sido reducidos deliberadamente, por lo que puede generar contenido ofensivo, violento, sexual o legalmente problematico. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: es un modelo de ~27B de la familia Qwen; no se han publicado evaluaciones de fidelidad factual, y el ajuste fino orientado a razonamiento no elimina este riesgo, especialmente en dominios especializados.
- Benchmarks no verificables: las cifras de ARC-C y la comparativa contra Qwen3.6-27B y Qwen3.6-35B-A3B proceden unicamente de la model card. No hay tabla de resultados por benchmark, ni metodologia publicada, ni evaluacion independiente.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en produccion en España requeriria validacion previa de la calidad en español.
- Contexto no documentado: la ficha no especifica la ventana de contexto del modelo, solo que los quants NEO imatrix mejoran el rendimiento en contexto largo. Es imprescindible probar el comportamiento real antes de disenar flujos que dependan de contextos extensos.
- Validacion comunitaria minima: el repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, y fue creado el 12 de septiembre de 2026. No existe retroalimentacion de terceros sobre estas cuantizaciones concretas.
- Procedencia de los datos de entrenamiento: la model card menciona trazas de modelos propietarios (Claude Opus, GPT-5). El uso comercial de un modelo destilado a partir de salidas de modelos cerrados puede entrar en conflicto con las condiciones de servicio de sus proveedores, independientemente de que la licencia declarada sea Apache-2.0.
- Licencia: Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre la legalidad de los datos de entrenamiento recae en quien despliega el modelo.
- Degradacion por cuantizacion: las cuantizaciones de 2 y 3 bits reducen notablemente la calidad, aunque el autor afirme que incluso las mas bajas son "excepcionales". Para tareas de razonamiento se recomienda Q5_K_M o superior.
- Dependencia de backend para MTP: los quants MTP solo aportan ventaja si el runtime los soporta; en caso contrario se comportan como un GGUF convencional o directamente no cargan.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/schwyzquant/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Variante de 40B Eleanor-DECKARD: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Variante de 40B Grand Intelligence FF711-717: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo Qwen3.8 27B Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo de control Qwen3.5-9B The Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Dataset DavidAU/Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset DavidAU/F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper o blog tecnico del modelo: no disponible
