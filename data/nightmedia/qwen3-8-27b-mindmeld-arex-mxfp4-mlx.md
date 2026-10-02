# nightmedia/Qwen3.8-27B-MindMeld-AREX-mxfp4-mlx

## Resumen

Qwen3.8-27B-MindMeld-AREX-mxfp4-mlx es una fusión de modelos (merge) publicada por nightmedia, un laboratorio independiente ubicado en Montana (Estados Unidos), bajo el identificador `nightmedia/Qwen3.8-27B-MindMeld-AREX-mxfp4-mlx`. El modelo combina dos piezas principales: `nightmedia/Qwen3.6-27B-MindMeld` y `BAAI/AREX-2`, y a su vez arrastra una veintena de modelos participantes de la familia Qwen3.5/Qwen3.6 afinados por terceros. Cuenta con 27.356.728.560 parámetros (unos 27,36 mil millones) y se distribuye cuantizado en formato MLX mxfp4, con un tamaño de repositorio de 15,2 GB.

El problema que aborda es el despliegue local en hardware de Apple Silicon: al estar en formato MLX y en cuantización mxfp4, el autor reporta una memoria pico de 21,30 GB y unos 206 tokens por segundo en un MacBook Pro de 128 GB, lo que lo sitúa en el rango de equipos de gama alta con memoria unificada. La licencia es Apache 2.0 y los idiomas declarados son inglés, chino, japonés y español. El pipeline declarado es `image-text-to-text`, por lo que se anuncia entrada multimodal de imagen, aunque la model card no documenta el codificador de visión.

La relevancia del modelo es doble: por un lado, demuestra el flujo de trabajo de fusión comunitaria sobre la familia Qwen3.x mediante mergekit; por otro, publica una tabla de evaluación propia (denominada "brainwaves") con perplexity, memoria pico y throughput para cuatro cuantizaciones. Es un modelo experimental, con 0 descargas y 0 likes en el momento de la consulta, sin paper asociado ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.x (etiquetas `qwen3_5` y `qwen3_6`); resultado de fusion con mergekit. No se documenta MoE ni capas recurrentes/SSM |
| Parametros totales | 27.356.728.560 (~27,36 B), dato real de safetensors |
| Parametros activos | No disponible (no hay indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | Etiquetas del repositorio declaran "256k context" y "1M context"; la model card no verifica ninguna de las dos cifras |
| Tipos de cuantizacion | bf16, mxfp8, q8-hi, qx64-hi y mxfp4. Este repositorio concreto contiene la variante mxfp4 para MLX |
| Idiomas soportados | Ingles, chino, japones y espanol (declarados en la metadata) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (biblioteca `transformers`) y MLX (`mxfp4-mlx`); no se publica GGUF |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una fusión de pesos. El modelo resultante se compone de `nightmedia/Qwen3.6-27B-MindMeld` y `BAAI/AREX-2`, y entre los modelos participantes figuran `schneewolflabs/B1-27B`, `migtissera/Tess-4-27B`, `MooreThreads/MusaCoder-27B`, `nbeerbower/Wichtel-Qwen3.6-27B`, `nbeerbower/CHUD-Qwen3.6-27B`, `nbeerbower/Elster-Qwen3.6-27B`, `trohrbaugh/Qwen3.8-27B-heretic-ara`, `armand0e/Qwen3.6-27B-Fable-5-Experimental` y varias variantes de DavidAU (Cold-Fusion-GAIN, FF711-Darker-Hero-GAIN, Claude-4.6-OS-INSTRUCT, Heretic2-Uncensored, Polar-Rev1, F451-AND-TRI-Polar-Ultra-Pro-Writer) y de nightmedia (Brainwaves, Architect-Polaris, Architect-Polaris2-Fable). La base arquitectónica subyacente es la familia Qwen3.5/Qwen3.6 de 27B, un transformer denso con atención por softmax.

En cuanto al entrenamiento, el autor no publica número de tokens, composición del dataset, ni detalle del pipeline de alineamiento. Las etiquetas del repositorio mencionan SFT, LoRA, chain-of-thought y long-CoT, así como `claude-distillation` y `claude4.6`, lo que sugiere que varios de los modelos participantes se afinaron con datos destilados de Claude 4.6 y con razonamiento de cadena larga. Parte de los modelos fusionados llevan en su nombre términos como "Heretic" o "Uncensored", lo que apunta a ajustes que reducen el comportamiento de rechazo, aunque no hay documentación técnica que lo confirme.

La innovación destacable no es arquitectónica sino de despliegue: el autor publica mediciones de perplexity, memoria pico y velocidad para las cuantizaciones mxfp8, q8-hi, qx64-hi y mxfp4, lo que permite elegir el compromiso entre huella de memoria y calidad con datos medidos, no estimados.

## Capacidades

- Generacion de texto conversacional y instruccional, con etiqueta `instruction-tuned`.
- Razonamiento explicito: las etiquetas incluyen `reasoning`, `chain-of-thought` y `long-cot`, es decir, modos de pensamiento extendido antes de responder.
- Programacion: la etiqueta `coding` aparece de forma explicita y uno de los modelos participantes, `MooreThreads/MusaCoder-27B`, esta orientado a codigo; tambien hay etiquetas `math` y `stem`.
- Entrada de imagen: el pipeline declarado es `image-text-to-text`, lo que implica capacidad multimodal de entrada, aunque la model card no especifica resolucion, numero de imagenes por prompt ni arquitectura del adaptador de vision.
- Escritura creativa y ficcion: las etiquetas cubren `creative writing`, `fiction writing`, `plot generation`, `sub-plot generation`, `story generation`, `scene continue`, `storytelling`, `science fiction` y `vivid prosing`.
- Roleplay: etiqueta `roleplaying` explicita, con ejemplos de continuidad de personaje en la propia model card.
- Multilingue: ingles, chino, japones y espanol declarados.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; las etiquetas de razonamiento y cadena de pensamiento son el unico indicio.
- Contexto largo: las etiquetas declaran ventanas de 256k y 1M tokens, sin verificacion publicada.

## Casos de uso

- Asistencia a la programacion en local: con 27,36 B de parametros y licencia Apache 2.0, el modelo puede desplegarse en un MacBook Pro de memoria unificada para autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo a servicios externos. La etiqueta `coding` y la presencia de MusaCoder-27B entre los modelos fusionados respaldan este uso.
- Escritura de ficcion y generacion de tramas: las etiquetas de `plot generation`, `sub-plot generation` y `scene continue` cubren explicitamente la continuacion de escenas y la generacion de subtramas en cualquier genero, con la ventaja de mantener contexto largo para coherencia argumental en novelas o series.
- Roleplay y compania conversacional: la etiqueta `roleplaying` y los ejemplos de continuidad de personaje de la model card lo orientan a personajes con voz consistente y turnos largos.
- Analisis de documentos escaneados o capturas: al declararse pipeline `image-text-to-text`, puede emplearse para extraer informacion de imagenes combinada con texto, por ejemplo revision de diagramas o transcripcion de capturas, aunque la ausencia de documentacion de vision obliga a validar la calidad antes de produccion.
- Razonamiento matematico y STEM con cadena de pensamiento: las etiquetas `math`, `stem` y `long-cot` permiten usarlo como resolutor paso a paso en entornos educativos o de investigacion, siempre que se acepte la variabilidad de la cuantizacion mxfp4 en tareas de precision.
- Despliegue privado en Apple Silicon: al estar en formato MLX mxfp4, con 21,30 GB de memoria pico medida, cabe en portatiles Apple de 32 GB o mas y evita cualquier dependencia de la nube, lo que resulta util para datos sensibles o entornos sin conectividad.
- Generacion de texto multilingue en ingles, chino, japones y espanol: util para localizacion de contenidos o atencion al cliente en esos cuatro idiomas, sin garantia para otras lenguas.
- Exploracion de investigacion sobre fusiones de modelos: la publicacion de metricas comparadas por cuantizacion lo convierte en material util para estudiar el impacto de mxfp4 frente a mxfp8 o bf16 en calidad y velocidad.

## Benchmarks y rendimiento

El autor publica una tabla propia denominada "brainwaves" con siete tareas de opcion multiple (ARC, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande), ademas de perplexity, memoria pico y tokens por segundo. Resultados del modelo final fusionado:

| Cuantizacion | ARC | ARC-Easy | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande | Perplexity | Memoria pico | Tokens/s |
|---|---|---|---|---|---|---|---|---|---|---|
| mxfp8 | 0,734 | 0,890 | 0,913 | 0,838 | 0,532 | 0,833 | 0,789 | 3,731 ± 0,023 | 34,74 GB | 209 |
| q8-hi | 0,734 | 0,894 | 0,912 | 0,838 | 0,526 | 0,833 | 0,788 | 3,721 ± 0,023 | 37,26 GB | 213 |
| qx64-hi | 0,734 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 3,727 ± 0,023 | 27,03 GB | 204 |
| mxfp4 | 0,726 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 3,790 ± 0,023 | 21,30 GB | 206 |

Comparativa con los dos componentes principales, segun los datos del autor:

| Modelo | Cuantizacion | ARC | ARC-Easy | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande | Perplexity |
|---|---|---|---|---|---|---|---|---|---|
| MindMeld-AREX (fusion) | mxfp8 | 0,734 | 0,890 | 0,913 | 0,838 | 0,532 | 0,833 | 0,789 | 3,731 |
| Qwen3.6-27B-MindMeld | bf16 | 0,742 | 0,897 | 0,913 | 0,840 | 0,514 | 0,834 | 0,791 | 3,693 |
| Qwen3.6-27B-MindMeld | mxfp8 | 0,743 | 0,899 | 0,911 | 0,835 | 0,516 | 0,836 | 0,792 | 3,733 |
| BAAI/AREX-2 | mxfp8 | 0,608 | 0,787 | 0,901 | no disponible | no disponible | no disponible | no disponible | 5,240 |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MATH ni de evaluaciones multimodales en la informacion disponible. Las tareas reportadas son de conocimiento y sentido comun, no de razonamiento complejo, por lo que la tabla no permite extrapolar capacidad en codigo o matematicas.

## Requisitos de hardware

- Memoria pico medida por el autor (entorno MLX, MacBook Pro de 128 GB): 21,30 GB en mxfp4, 27,03 GB en qx64-hi, 34,74 GB en mxfp8 y 37,26 GB en q8-hi.
- El valor de bf16 no se publica para la fusion; como referencia, el componente Qwen3.6-27B-MindMeld en bf16 reporta 60,75 GB de memoria pico.
- Cabe en GPU de consumo: mxfp4 con 21,30 GB de pico entra con ajuste en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090), siempre que se use un runtime compatible con MXFP4; mxfp8 y q8-hi (34,7-37,3 GB) quedan fuera de las GPU de consumo de gama alta habituales.
- GPU de centro de datos recomendadas si se convierte a un runtime CUDA: A100 40/80 GB, H100 80 GB o L40S 48 GB para las variantes de mayor precision.
- Apple Silicon: es el destino natural del repositorio, que se distribuye en MLX. Con 21,30 GB de pico, un equipo de 32 GB de memoria unificada es el minimo razonable; 64 GB o 128 GB dan margen para contexto largo.
- Opciones de despliegue: MLX (`mlx-lm`) sobre Apple Silicon, que es el formato publicado. No se ofrece GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. vLLM y TGI no ofrecen soporte nativo de MLX ni de MXFP4 en el momento de redactar esta ficha.
- Throughput medido: 204-213 tokens por segundo en las cuatro cuantizaciones sobre el equipo del autor (MacBook Pro de 128 GB). Son cifras de generacion en local, no de servidor, y no se especifica el tamano de lote ni la longitud de contexto usada.
- No se publican datos de latencia de primer token ni de throughput agregado con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Perplexity (misma cuantizacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MindMeld-AREX (este modelo) | 27,36 B | 256k / 1M segun etiquetas, sin verificar | 3,790 en mxfp4; 3,731 en mxfp8 | Apache 2.0 | MLX mxfp4 en HuggingFace; 0 descargas, 0 likes |
| nightmedia/Qwen3.6-27B-MindMeld | no disponible (familia 27B) | no disponible | 3,813 en mxfp4; 3,733 en mxfp8 | no disponible en la informacion | Componente de la fusion; reporta bf16, mxfp8, qx64-hi y mxfp4 |
| BAAI/AREX-2 | no disponible | no disponible | 5,240 en mxfp8 | no disponible en la informacion | Componente de la fusion; solo se reporta mxfp8 |
| DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT | no disponible (27B por nomenclatura) | no disponible | no disponible | no disponible | Modelo participante en la fusion |

La fusion mejora la perplexity de AREX-2 de forma clara en la misma cuantizacion (3,731 frente a 5,240 en mxfp8) y queda practicamente a la par del componente MindMeld (3,731 frente a 3,733), con una ligera perdida en mxfp4 (3,790 frente a 3,813, es decir, ligeramente mejor). En las tareas de opcion multiple, ARC y OpenBookQA de la fusion en mxfp8 (0,734 y 0,532) quedan por encima de las cifras disponibles de AREX-2 (0,608 y sin dato), mientras que en ARC-Easy, HellaSwag, PIQA y Winogrande la fusion esta uno o dos puntos por debajo de MindMeld. No hay datos publicados de modelos comparables de otros proveedores en esta misma franja, por lo que la comparativa se limita a los componentes de la propia fusion.

## Limitaciones y advertencias

- Ausencia de evaluacion amplia: solo hay siete tareas de conocimiento y sentido comun mas perplexity. No hay MMLU, HumanEval, GSM8K ni evaluacion multimodal, de modo que no se puede afirmar su calidad en codigo, matematicas o vision.
- Contexto no verificado: las etiquetas declaran 256k y 1M tokens, pero la model card no aporta pruebas ni describe tecnicas de extension de contexto (RoPE scaling, atencion lineal, etc.). Tratar esas cifras como marketing hasta validarlas.
- Riesgo de alucinacion: es un modelo de 27B sin datos de alineamiento publicados; se espera el comportamiento tipico de la familia, con invencion de datos en tareas factuales y en contextos muy largos.
- Seguridad y alineamiento inciertos: varios modelos participantes llevan en su nombre etiquetas como "Heretic", "Uncensored" o "Darker-Hero", lo que sugiere una reduccion deliberada de los rechazos de seguridad. No hay documentacion que cuantifique ese efecto, pero es un riesgo a evaluar antes de cualquier despliegue orientado al publico.
- Idioma: solo se declaran ingles, chino, japones y espanol. No hay garantia de calidad en catalan, gallego, euskera ni en otros idiomas.
- Licencia: el repositorio declara Apache 2.0, pero al ser una fusion de veinte modelos, las condiciones reales dependen de las licencias de cada componente. Es imprescindible revisar una por una las licencias de los modelos base antes de uso comercial.
- Procedencia de los datos de entrenamiento: las etiquetas mencionan destilacion de Claude 4.6, lo que puede implicar condiciones de uso de terceros que no se detallan en esta ficha.
- Formato: unicamente MLX. No hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue a Apple Silicon o exige conversion manual con el consiguiente riesgo de degradacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No existe validacion por parte de la comunidad ni informes de terceros.
- Naturaleza experimental: el propio repositorio se etiqueta como `experimental`, con fecha de creacion de octubre de 2026, y las mediciones corresponden al equipo del autor, un MacBook Pro de 128 GB, no a un entorno de servidor.
- Vision no documentada: aunque el pipeline sea `image-text-to-text`, no se describe el codificador visual, la resolucion de entrada ni el numero maximo de imagenes. Cualquier uso multimodal debe validarse empiricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld-AREX-mxfp4-mlx
- Componente principal: https://huggingface.co/nightmedia/Qwen3.6-27B-MindMeld
- Segundo componente: https://huggingface.co/BAAI/AREX-2
- Modelos participantes: https://huggingface.co/schneewolflabs/B1-27B, https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves, https://huggingface.co/nbeerbower/Wichtel-Qwen3.6-27B, https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara, https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0, https://huggingface.co/nightmedia/Qwen3.8-27B-Cold-Fusion-FF711-Darker-Hero-GAIN-B, https://huggingface.co/migtissera/Tess-4-27B, https://huggingface.co/nbeerbower/CHUD-Qwen3.6-27B, https://huggingface.co/nbeerbower/Elster-Qwen3.6-27B, https://huggingface.co/MooreThreads/MusaCoder-27B, https://huggingface.co/DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT, https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking, https://huggingface.co/armand0e/Qwen3.6-27B-Fable-5-Experimental, https://huggingface.co/DavidAU/Qwen3.5-27B-Polar-Rev1-Uncensored-Heretic, https://huggingface.co/DavidAU/Qwen3.6-27B-F451-AND-TRI-Polar-Ultra-Pro-Writer-Uncensored-Heretic, https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B, https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris-Fable-F451
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
