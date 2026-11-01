# CVML-CFU/HyVol-PlusPlus

## Resumen

HyVol++ es un conjunto de pesos preentrenados para recuperación multimodal (texto-vídeo y texto-audio) desarrollado por el grupo CVML de la Universidad Ca' Foscari de Venecia (Anindya Nag, Ambuj Mehrish y Sebastiano Vascon). Se presenta como la extensión del trabajo HyVol, publicado en WACV 2027, y convierte el modelo original en un marco de fusión mediante hipergrafos en tiempo de entrenamiento. El objetivo es mejorar la recuperación entre modalidades cuando en el conjunto de entrenamiento faltan modalidades (por ejemplo, clips sin subtítulos o sin audio), sin incrementar el coste de inferencia.

La innovación principal es que las modalidades observadas (vídeo, audio y subtítulos) actúan como vértices de un hipergrafo, y vecindades mutuas top-k guiadas por las captiones conectan clips relacionados. Así, un clip puede aprovechar evidencia observada en clips vecinos durante el entrenamiento. El hipergrafo se descarta tras el entrenamiento, de modo que el backbone, la función de scoring y el coste de inferencia permanecen idénticos a los del modelo base.

El repositorio contiene cuatro checkpoints que combinan dos configuraciones (wHyVol y wRHG) con dos backbones (GRAM y HyperGRAM). La inicialización parte de VAST (EVA-CLIP ViT-g/14 para visión, BEATs para audio y BERT-base para texto) y el entrenamiento se realizó durante una época sobre un subconjunto de 150K clips de VAST-27M. La licencia es CC BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbones GRAM o HyperGRAM con inicialización VAST (EVA-CLIP ViT-g/14 visión, BEATs audio, BERT-base texto); fusión mediante hipergrafo solo en entrenamiento |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el backbone de texto es BERT-base, principalmente inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

HyVol++ no introduce un transformer nuevo, sino un esquema de fusión en tiempo de entrenamiento sobre backbones existentes de recuperación multimodal. Los checkpoints se construyen sobre GRAM y HyperGRAM, ambos inicializados desde VAST: EVA-CLIP ViT-g/14 para la torre visual, BEATs para la torre de audio y BERT-base para la torre de texto. Durante el entrenamiento, las modalidades observadas de cada clip se modelan como vértices de un hipergrafo, con vecindades mutuas top-k guiadas por las captiones que conectan clips relacionados. Las modalidades ausentes se omiten, no se imputan, lo que evita introducir representaciones artificiales.

Se proponen dos configuraciones. wHyVol aprende un peso de fiabilidad por vista y una afinidad simétrica de captiones por par de clips relacionados, con propagación aditiva. wRHG añade además relaciones tipadas (documento, misma modalidad, modalidad cruzada y candidato conjunto) y emplea propagación multiplicativa condicionada por la relación. El entrenamiento consistió en una época sobre un subconjunto de 150K clips de VAST-27M (136.694 clips recuperados con vídeo y audio), y la selección de checkpoint se hizo por el mejor R@1 texto-a-vídeo de la puntuación de matching (ITM) en MSR-VTT 1k. El hipergrafo se descarta en inferencia, por lo que no añade latencia ni módulos extra.

## Capacidades

- Recuperación texto-vídeo: dado un texto, devuelve los clips de vídeo más relevantes, y viceversa (vídeo-a-texto).
- Recuperación texto-audio: emparejamiento entre descripciones textuales y clips de audio.
- Recuperación audio-visual y multimodal conjunta sobre clips con vídeo, audio y subtítulos.
- Manejo de modalidades ausentes en entrenamiento: las modalidades no observadas se omiten y el modelo aprovecha evidencia de clips vecinos.
- Fusión mediante hipergrafo con relaciones tipadas (documento, misma modalidad, modalidad cruzada y candidato conjunto) en la configuración wRHG.
- Ponderación de fiabilidad por vista y afinidad de captiones entre clips relacionados.
- No es un modelo generativo: no produce texto libre, código ni razonamiento; su salida es una puntuación de similitud entre modalidades.
- No dispone de tool calling, capacidades de agente ni modo de razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en videotecas: indexar un archivo de vídeo con los embeddings del backbone y recuperar clips mediante consultas en lenguaje natural; el modelo está optimizado para ranking texto-vídeo zero-shot en dominios como MSR-VTT o ActivityNet.
- Búsqueda de efectos de sonido y audio: usar la torre de audio y texto para localizar clips de audio a partir de descripciones, útil en producción musical o postproducción.
- Etiquetado y enriquecimiento de archivos audiovisuales: recuperar clips candidatos para una caption y usarlos como propuesta de metadatos en pipelines de catalogación.
- Sistemas de recomendación basados en contenido: calcular similitudes texto-vídeo o audio-texto para recomendar clips relacionados sin depender de metadatos manuales.
- Investigación en recuperación multimodal con modalidades incompletas: reproducir los experimentos de HyVol++ sobre VAST-27M para estudiar el efecto de la fusión por hipergrafo cuando faltan subtítulos o audio.
- Moderación y búsqueda de contenido en plataformas: recuperar vídeos o audios que coincidan con una descripción textual para revisión humana, aprovechando el rendimiento zero-shot en once benchmarks.
- Evaluación comparativa de backbones: usar los cuatro checkpoints para medir la diferencia entre GRAM y HyperGRAM en tareas de recuperación antes de elegir uno para producción.

## Benchmarks y rendimiento

Resultados zero-shot en once benchmarks: ocho de texto-vídeo (MSR-VTT, DiDeMo, ActivityNet, VATEX, Shot2Story, MSVD, FLARE y VALOR-32K) y tres de texto-audio (AudioCaps, Clotho y SoundDescs).

| Backbone | Media T2V R@1 (17 ajustes) | + wRHG | Ganancia |
|---|---|---|---|
| GRAM | 63,4 | 68,2 | +4,8 |
| HyperGRAM | 64,8 | 68,4 | +3,6 |

- Con GRAM, wRHG mejora los 34 ajustes de texto-a-vídeo y vídeo-a-texto.
- Con HyperGRAM, mejora 33 de 34 ajustes.
- La mayor ganancia vídeo-a-texto es de +13,3 R@1 en ActivityNet.
- No se han publicado en la información disponible resultados desglosados por benchmark ni comparaciones con otros modelos externos.

## Requisitos de hardware

- El tamaño del repositorio es de 22,2 GB, correspondiente a cuatro checkpoints que incluyen las torres EVA-CLIP ViT-g/14, BEATs y BERT-base; la VRAM necesaria para inferencia no está especificada en la información disponible.
- Al tratarse de un modelo de recuperación (no generativo), la inferencia consiste en calcular embeddings y similitudes, con un coste menor que el de un LLM del mismo tamaño.
- GPU recomendadas: no disponible. Por el tamaño de las torres (ViT-g/14 y BEATs), se requiere una GPU con memoria suficiente para cargar los tres codificadores; no se confirma que quepa en GPU de consumo.
- Opciones de despliegue: el código de carga debe usar el repositorio de GRAM (https://github.com/ispamm/GRAM) o HyperGRAM (https://github.com/uta-smile/HyperGram) según el checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / inicialización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyVol++ (wRHG, GRAM) | Recuperación multimodal con fusión por hipergrafo | GRAM + VAST | no disponible | CC BY 4.0 | Pesos en HuggingFace |
| HyVol++ (wRHG, HyperGRAM) | Recuperación multimodal con fusión por hipergrafo | HyperGRAM + VAST | no disponible | CC BY 4.0 | Pesos en HuggingFace |
| HyVol (original) | Recuperación multimodal | GRAM / HyperGRAM | no disponible | CC BY 4.0 | Pesos en HuggingFace (CVML-CFU/HyVol) |
| VAST | Recuperación audio-visual-texto | EVA-CLIP + BEATs + BERT | no disponible | no disponible | Referencia de inicialización y datos |

No se dispone en la información proporcionada de comparaciones con otros modelos de recuperación multimodal de terceros (por ejemplo, CLIP4Clip o InternVideo) ni de sus cifras en los mismos benchmarks.

## Limitaciones y advertencias

- El modelo es específico de recuperación: no genera texto, no responde preguntas ni ejecuta instrucciones; no debe presentarse como un LLM.
- El backbone de texto es BERT-base, entrenado principalmente en inglés; el soporte multilingüe no está documentado.
- El entrenamiento se limitó a una época sobre 136.694 clips de VAST-27M; el rendimiento en dominios alejados de ese corpus no está validado.
- El hipergrafo solo actúa en entrenamiento; no hay ganancia en inferencia por sí mismo, sino que depende de los pesos aprendidos.
- Riesgo de sesgos heredados de VAST-27M y de los backbones (EVA-CLIP, BEATs, BERT), no evaluado en la información disponible.
- Riesgo de falsos positivos en la recuperación: las puntuaciones de similitud pueden devolver clips semánticamente próximos pero incorrectos; se recomienda validación humana en producción.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar las licencias de los backbones y del corpus de entrenamiento antes de desplegar.
- Los resultados reportados son zero-shot en benchmarks académicos; no hay datos de latencia, throughput ni robustez en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CVML-CFU/HyVol-PlusPlus
- Modelo HyVol original: https://huggingface.co/CVML-CFU/HyVol
- Paper (arXiv): https://arxiv.org/abs/2609.15320
- Código en GitHub: https://github.com/CVML-CFU/HyVol
- Repositorio GRAM: https://github.com/ispamm/GRAM
- Repositorio HyperGRAM: https://github.com/uta-smile/HyperGram
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
