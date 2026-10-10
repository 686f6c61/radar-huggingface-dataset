# nightmedia/Qwen3.5-9B-BRO-q8-hi-mlx

## Resumen

Qwen3.5-9B-BRO-q8-hi-mlx es un merge experimental publicado por nightmedia (NightmediaAI, laboratorio independiente radicado en Montana, Estados Unidos) a partir de dos componentes: OmniJev/OneJev-9B y nightmedia/Qwen3.5-9B-Brainwaves-Roasteramus. El autor denomina al resultado "Qwen3.5-9B-Wichtelchen-Holodeck-Lounge-Roasteramus-OneJev" y lo distribuye como una variante cuantizada en 8 bits (q8-hi) en formato MLX, pensada para ejecución local sobre Apple Silicon. El repositorio tiene 9.409.813.744 parametros totales y ocupa 11,0 GB.

El modelo se presenta como instruction-tuned, orientado a razonamiento con chain-of-thought largo, codigo, matematicas y escritura creativa/ficcion, con soporte declarado de cuatro idiomas (ingles, chino, japones y castellano). La licencia es Apache 2.0 y la libreria de referencia es transformers, aunque la cuantizacion q8-hi y el tag mlx apuntan a un uso principal mediante MLX en macOS.

La relevancia de esta ficha es limitada y hay que tratarla con cautela: el repositorio no tiene descargas ni "likes", no incluye resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) y el propio autor lo etiqueta como experimental. La nomenclatura "Qwen3.5" y las etiquetas que mencionan "qwen3.6" o "claude4.6" no corresponden a versiones oficiales verificables de Qwen, por lo que deben interpretarse como denominaciones internas del autor y no como especificaciones contrastadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la especifica; los tags apuntan a familia Qwen y a mergekit, sin confirmacion tecnica) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible. Los tags declaran "1M context" y "256k context", pero la model card no confirma la ventana real |
| Tipos de cuantizacion | q8-hi (8 bits, esta variante), mxfp8, q6-hi, q5-hi, q4-hi, mxfp4 y bf16 (variantes hermanas citadas en la model card) |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja), castellano (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag del repositorio); variante MLX de 8 bits |
| Autor | nightmedia (NightmediaAI) |
| Fecha de publicacion | 2026-10-09 (creacion), 2026-10-09 (ultima actualizacion) |
| Tamano del repositorio | 11,0 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modelos base | axiomofmind/Roasteramus, nightmedia/Qwen3.5-9B-Brainwaves |
| Componentes del merge | OmniJev/OneJev-9B, nightmedia/Qwen3.5-9B-Brainwaves-Roasteramus |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion tecnica verificable sobre la arquitectura interna. La model card no describe el tipo de red (transformer denso, MoE, hibrida), ni el numero de capas, cabezas de atencion o dimension oculta. Los tags del repositorio incluyen "merge", "mergekit" y "lora", lo que indica que el artefacto se ha construido por fusion de pesos y/o adaptadores LoRA sobre modelos base de terceros, no mediante un entrenamiento desde cero documentado. Los tags adicionales "distillation" y "claude-distillation" sugieren que alguno de los componentes se habria destilado a partir de trazas de otro modelo, pero no se aporta metodologia, numero de tokens ni composicion del dataset.

Tampoco se documentan fases de alineacion (RLHF, DPO, SFT) con detalle: el tag "sft" aparece sin especificar datos, epocas ni hiperparametros. Se mencionan caracteristicas como "multi-token-prediction" y "speculative-decoding", habituales en modelos de la familia Qwen, pero la model card no confirma que esten activas ni como se han implementado. En consecuencia, cualquier afirmacion sobre innovaciones tecnicas concretas debe considerarse no verificada.

El unico material empirico aportado por el autor son las tablas "brainwaves", una bateria propia de siete tareas (arc, arc/e, boolq, hswag, obkqa, piqa, wino) y mediciones de perplejidad, memoria pico y velocidad de generacion para distintas cuantizaciones. No hay informe de entrenamiento, ni curvas de perdida, ni descripcion del hardware utilizado mas alla de la mencion generica a un MacBook Pro de 128 GB.

## Capacidades

- Generacion de texto conversacional e instruction-tuned, con modo de razonamiento declarado (chain-of-thought largo, tag "long-cot").
- Codigo: el repositorio incluye los tags "coding" y "research" y el pipeline declarado es image-text-to-text, aunque no se aportan ejemplos ni evaluaciones de codigo.
- Matematicas y STEM: etiquetados explicitamente ("math", "stem"), sin resultados de GSM8K u otros benchmarks que lo respalden.
- Multilingue: ingles, chino, japones y castellano segun el campo `language` de la model card.
- Escritura creativa y ficcion: los tags enumeran generacion de tramas, subtramas, continuacion de escenas, ciencia ficcion y "todos los generos", ademas de roleplaying.
- Tool calling / function calling: no disponible. No se menciona soporte explicito de llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles como caracteristica documentada; solo se insinuan mediante los tags de razonamiento.
- Vision: el pipeline declarado es image-text-to-text, pero la model card no describe modulos de vision, resolucion de imagen ni evaluaciones multimodales, por lo que la capacidad real no esta confirmada.
- Audio: no disponible.

## Casos de uso

- Prototipado local en Apple Silicon: la variante q8-hi en MLX permite ejecutar un modelo de 9,4 B completamente en local sobre un Mac con memoria unificada suficiente, sin depender de APIs externas ni de conectividad.
- Generacion de ficcion y narrativa larga: los tags de escritura creativa (tramas, subtramas, continuacion de escenas) apuntan a su uso para redactar relatos y novelas por capitulos, aprovechando la ventana de contexto declarada (aunque no confirmada) para mantener coherencia entre escenas.
- Asistente conversacional de proposito general en cuatro idiomas: con soporte declarado de en, zh, ja y es, puede desplegarse como chatbot interno para equipos distribuidos en esas lenguas.
- Roleplay y simulacion de personajes: el modelo esta etiquetado explicitamente para roleplaying, util en entornos de entrenamiento conversacional, prototipos de videojuegos o demos de agentes con personalidad.
- Apoyo a tareas de razonamiento paso a paso: si el modo de cadena de pensamiento larga funciona como se declara, serviria para descomponer problemas de matematicas o logica en entornos educativos, siempre con supervision humana.
- Experimentacion en investigacion sobre merges y cuantizacion: dado que el autor publica variantes bf16 a mxfp4 con perplejidad y velocidad, el modelo es un banco de pruebas util para estudiar el impacto de la cuantizacion en tareas de comprension.
- Analisis de documentos en contexto largo: si la ventana declarada es real, permitiria resumir y consultar documentacion extensa; conviene validarlo empiricamente antes de usarlo en produccion.

## Benchmarks y rendimiento

Resultados de la bateria propia "brainwaves" reportados en la model card para el merge final (columnas mxfp8 y q8-hi):

| Metrica | mxfp8 | q8-hi |
|---|---|---|
| arc | 0,691 | 0,689 |
| arc/e | 0,874 | 0,878 |
| boolq | 0,902 | 0,901 |
| hswag | 0,767 | 0,768 |
| obkqa | 0,516 | 0,516 |
| piqa | 0,803 | 0,801 |
| wino | 0,722 | 0,722 |

Perplejidad, memoria pico y velocidad para el componente Brainwaves-Roasteramus segun el autor:

| Cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 4,119 ± 0,026 | 24,69 GB | 860 |
| mxfp8 | 4,122 ± 0,026 | 16,02 GB | 671 |
| q8-hi | 4,119 ± 0,026 | 16,86 GB | 670 |
| q6-hi | 4,120 ± 0,026 | 14,62 GB | 623 |
| q5-hi | 4,141 ± 0,026 | 13,50 GB | 664 |
| q4-hi | 4,205 ± 0,027 | 12,38 GB | 691 |
| mxfp4 | 4,341 ± 0,028 | 11,55 GB | 708 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MATH) en la informacion disponible. Las cifras anteriores proceden exclusivamente del autor, sin replicacion independiente ni descripcion del arnes de evaluacion.

## Requisitos de hardware

- VRAM/memoria unificada estimada: para la variante q8-hi, la model card reporta 16,86 GB de memoria pico; la version bf16 requiere 24,69 GB. En GPUs discretas hay que anadir el overhead del runtime, por lo que conviene reservar entre 1 y 3 GB adicionales.
- Apple Silicon: es el entorno objetivo (tag mlx). Un MacBook Pro con 32 GB de memoria unificada deberia poder con q8-hi; 16 GB queda al limite y probablemente obligue a cuantizaciones mas agresivas (q4-hi, 12,38 GB). El laboratorio autor trabaja sobre un MacBook Pro de 128 GB.
- GPU NVIDIA: una RTX 4090 (24 GB) es suficiente para bf16 y para cualquier cuantizacion de 8 bits, aunque el backend nativo de esta variante es MLX y no CUDA.
- GPU de datacenter: A100 40/80 GB y H100 quedan sobredimensionadas para 9,4 B; serian utiles solo para servir en paralelo con lotes grandes o con la ventana de contexto maxima declarada.
- Despliegue: MLX es la via natural para esta variante. Para el resto de cuantizaciones, llama.cpp/Ollama (GGUF) o vLLM y TGI serian las opciones habituales, aunque no estan documentadas en la model card.
- Latencia y throughput: el autor reporta 670 tokens/s con q8-hi y 860 tokens/s con bf16 sobre su hardware, valores inusualmente altos que probablemente corresponden a generacion con decodificacion especulativa o a mediciones en lotes largos. Deben tomarse como referencia del autor, no como cifra de produccion.
- Memoria en contexto largo: si la ventana de 256k o 1M declarada en los tags fuese real, el consumo de KV cache creceria de forma notable y superaria ampliamente las cifras de memoria pico anteriores.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos externos comparables en la informacion proporcionada. La unica comparacion posible es interna, entre el merge final y sus componentes, usando la bateria del propio autor:

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino | Licencia |
|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-BRO (merge final, mxfp8) | 0,691 | 0,874 | 0,902 | 0,767 | 0,516 | 0,803 | 0,722 | Apache 2.0 |
| Brainwaves-Roasteramus (mxfp8) | 0,688 | 0,862 | 0,902 | 0,766 | 0,510 | 0,802 | 0,722 | No disponible |
| OneJev-9B (mxfp8) | 0,672 | 0,870 | 0,894 | 0,742 | 0,452 | 0,794 | 0,717 | No disponible |

Las diferencias son pequenas (del orden de 0,002 a 0,064 segun la tarea) y no hay intervalos de confianza ni tamano de muestra declarados, por lo que no permiten concluir superioridad estadistica. Frente a alternativas externas de tamano similar (por ejemplo, modelos densos de 8-9 B de la familia Qwen, Llama o Mistral), no hay datos comparables aportados en esta informacion.

## Limitaciones y advertencias

- Modelo experimental sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin revisores independientes ni replicacion de resultados.
- Nomenclatura no verificable: "Qwen3.5", "qwen3.6", "claude4.6" y "polaris" no corresponden a versiones oficiales confirmadas; el modelo no debe confundirse con un lanzamiento oficial de Qwen.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni MATH, por lo que no es posible situarlo frente a modelos de produccion.
- Metricas propias con valor limitado: la bateria "brainwaves" usa siete tareas de comprension, sin detalles de evaluacion, sin intervalos de confianza en la tabla de aciertos y con velocidades de generacion dificiles de contextualizar.
- Capacidad multimodal no demostrada: el pipeline se declara image-text-to-text pero no se documenta ningun componente de vision; tratar la entrada de imagenes como no soportada hasta verificarlo.
- Ventana de contexto sin confirmar: los tags afirman 256k y 1M, cifras que no se respaldan con configuracion, evaluacion tipo RULER ni consumo de memoria en contexto largo.
- Riesgo de alucinacion: al ser un merge sin alineacion documentada (RLHF/DPO no descritos), no hay garantias de calibracion ni de adherencia a instrucciones en dominios sensibles.
- Sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o representacion multilingue; los cuatro idiomas declarados no implican calidad homogenea.
- Contenido para adultos: la presencia de etiquetas de roleplay y ficcion sin filtros declarados implica riesgo de generar contenido inapropiado si no se anade una capa de moderacion.
- Licencia: Apache 2.0 en este repositorio, pero las condiciones de los modelos base (Roasteramus, Brainwaves-Roasteramus, OneJev-9B) no se detallan, lo que puede afectar al uso comercial derivado.
- Dependencia de plataforma: la variante publicada esta cuantizada en MLX para Apple Silicon; su uso en CUDA requeriria reconvertir pesos y no hay garantia de equivalencia numerica.
- Contenido de la model card no fiable como fuente tecnica: buena parte del texto es material promocional y de roleplay, no documentacion de arquitectura o entrenamiento.
- La busqueda web realizada no devolvio resultados relacionados con el modelo; unicamente aparecieron paginas sin ninguna relacion tecnica con esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.5-9B-BRO-q8-hi-mlx
- Modelo base 1: https://huggingface.co/axiomofmind/Roasteramus
- Modelo base 2: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Componente del merge 1: https://huggingface.co/OmniJev/OneJev-9B
- Componente del merge 2: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-Roasteramus
- Paper, repositorio de codigo, demo o blog oficial: no disponibles en la informacion proporcionada.
