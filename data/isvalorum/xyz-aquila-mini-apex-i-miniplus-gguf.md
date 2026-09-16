# IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-GGUF

## Resumen

XYZ-Aquila-mini-APEX-I-MiniPlus es una cuantización GGUF publicada por el usuario IsValorum sobre el modelo base XYZAILab/XYZ-Aquila-mini, un modelo multimodal de tipo image-text-to-text disenado por XYZ AI Lab para busqueda web agentica, interaccion con interfaces de usuario en tiempo real y grounding visual. El modelo base es un MoE de 35B parametros con 256 micro-expertos (dimension intermedia 512) y 8 expertos activos por token, implementado sobre la arquitectura `Qwen3_5MoeForConditionalGeneration` con 40 capas.

El problema que resuelve esta publicacion no es el entrenamiento de un modelo nuevo, sino el despliegue eficiente del modelo base en GPUs de consumo. La model card identifica dos obstaculos concretos: la sensibilidad del router de 256 micro-expertos a las cuantizaciones lineales uniformes (que distorsionan los logits de gating y desvian los tokens visuales) y el consumo de VRAM del cache KV durante flujos de busqueda agentica con capturas de pantalla completas. La solucion propuesta combina codebooks no lineales IQ, router en F32 sin comprimir y clasificador de vocabulario en Q6_K, alcanzando 3.38 BPW en un fichero de ~14.7 GB (~13.7 GiB en VRAM).

La relevancia inmediata es de tamano practico: segun el autor, permite desplegar el modelo con contexto de hasta 128k en GPUs de 24 GB (RTX 3090/4090/5080) dejando mas de 10 GB libres para el buffer de contexto, algo que una cuantizacion Q4_K_M estandar (~19.5 GB) no permite. Se incluye ademas un proyector visual `mmproj` en Q8_0 de ~610 MB. Cabe senalar que los metadatos del repositorio y el contenido de la model card no coinciden del todo: el repositorio se llama `...-MiniPlus-GGUF`, mientras que la tarjeta describe la version `MiniPlus-V2` como pendiente de subida "manana".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (transformer MoE multimodal, 40 capas, 256 micro-expertos con dimension intermedia 512) |
| Parametros totales | 35B (segun la model card del autor) |
| Parametros activos | 8 expertos activos de 256 por token; numero total de parametros activos no disponible |
| Longitud de contexto | Hasta 128k segun el autor; el ejemplo de llama.cpp usa `-c 65536` |
| Tipos de cuantizacion | Fichero principal a 3.38 BPW con codebooks no lineales IQ (`IQ3_XXS`, `IQ3_S`, `IQ4_NL`), router `ffn_gate_inp.weight` en F32 sin comprimir, clasificador de vocabulario en Q6_K; proyector visual en Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero principal + `mmproj` GGUF separado) |
| Tamano del fichero principal | ~14.7 GB en disco, ~13.7 GiB en RAM/VRAM |
| Tamano del proyector visual | ~610 MB (`mmproj-XYZAILab_XYZ-Aquila-mini-Q8_0.gguf`) |
| Pipeline | image-text-to-text |
| Modelo base | XYZAILab/XYZ-Aquila-mini |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE multimodal con 40 capas y 256 micro-expertos de dimension intermedia 512, de los cuales se activan 8 por token. La componente multimodal se implementa mediante un proyector visual separado que se carga como adaptador (`--mmproj` en llama.cpp), lo que permite mantener el proyector en una precision distinta a la del modelo de lenguaje. Esta publicacion no entrena el modelo: es una receta de cuantizacion.

La innovacion tecnica documentada es triple. Primero, el uso de codebooks no lineales IQ (`IQ3_XXS`, `IQ3_S`, `IQ4_NL`) en lugar de cuantizaciones lineales uniformes como `Q3_K_S` o `Q4_0`, con el argumento de que estas ultimas distorsionan los logits de gating del router y provocan que este enrute mal los tokens visuales. Segundo, la decision de mantener el selector del router (`ffn_gate_inp.weight`) en F32 sin comprimir y el clasificador de vocabulario en Q6_K, es decir, preservar en alta precision las capas mas sensibles mientras se comprime agresivamente el resto. Tercero, un proyector visual recalibrado en Q8_0 (~610 MB) frente a los ~1.2 GB de los proyectores `bf16`/`f16` habituales, orientado a preservar microtexto en viewports de navegador, deteccion de coordenadas para acciones de UI y analisis de graficos densos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) en esta publicacion.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y texto (pipeline image-text-to-text).
- Comprension visual orientada a agente: OCR de alta resolucion, interpretacion de viewports de navegador web, grounding visual para invocacion de herramientas y razonamiento matematico sobre imagenes.
- Deteccion de microtexto en interfaces de usuario (DOM renderizado, terminales de sistema) y de coordenadas pequenas para acciones de clic.
- Analisis de graficos, diagramas, plots e infografias de alta densidad.
- Busqueda agentica web (tags `agentic-search`, `search-agent`) con flujos multi-turno.
- Routing eficiente tipo MoE: 8 expertos activos por token de un total de 256, lo que reduce el coste de computo por token frente a un modelo denso del mismo tamano.
- Soporte multilingue limitado a ingles y chino segun los metadatos del repositorio.
- Soporte explicito de tool calling o function calling: no disponible en la informacion proporcionada (los tags sugieren capacidades de agente e invocacion visual de herramientas, pero no se detalla el formato).
- Modo thinking o decodificacion especulativa (MTP): no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de busqueda web con navegador: el modelo puede interpretar capturas de viewport y decidir la siguiente accion sobre la pagina (clic, scroll, extraccion) dentro de un flujo agentico, aprovechando el contexto de hasta 128k para mantener el historial de paginas visitadas y resultados.
- Automatizacion de QA visual sobre interfaces: verificacion automatica de que un DOM renderizado muestra los elementos esperados, detectando microtexto y coordenadas, util en pipelines de pruebas end-to-end.
- Extraccion de datos de documentos e infografias: conversion de graficos densos, tablas e imagenes en texto estructurado, apoyandose en el proyector Q8_0 calibrado para microtexto.
- Asistencia a soporte tecnico con capturas de pantalla: el usuario envia una captura de un error en su interfaz y el modelo localiza el elemento y propone la accion correctiva, con contexto suficiente para varias iteraciones.
- Despliegue en estacion de trabajo con una sola GPU de 24 GB: un desarrollador individual puede ejecutar el modelo completo con offload total (`-ngl 99`) a 28-34 tok/s y 128k de contexto en una RTX 3090/4090/5080, sin necesidad de infraestructura multinodo.
- Procesamiento por lotes en portatil o equipo sin GPU dedicada: con 32 GB de DDR4/DDR5 el modelo se ejecuta mediante offload a CPU a 18-22 tok/s con contexto de 16k-32k, adecuado para tareas de vision por lotes no interactivas.
- Investigacion en cuantizacion de MoE: la receta (IQ + router F32 + Q6_K de vocabulario) sirve como referencia reproducible para estudiar el impacto del gating en modelos con muchos micro-expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de velocidad de inferencia por tier de hardware, que se recogen en la seccion de requisitos.

| Hardware | Configuracion | Contexto recomendado | Velocidad estimada |
|---|---|---|---|
| GPU dedicada de 24 GB (RTX 3090 / 4090 / 5080) | Offload total a VRAM (`-ngl 99`) | 128k | 28 – 34 tok/s |
| GPU de gama media de 16 GB (RTX 4080 / 5070) | Offload hibrido (~30 capas en VRAM) | 32k | 20 – 24 tok/s |
| Portatil o Mac con 32 GB DDR4/DDR5 | Offload a CPU + RAM | 16k – 32k | 18 – 22 tok/s |

## Requisitos de hardware

- VRAM para el fichero principal: ~13.7 GiB en el tier de 3.38 BPW; el resto de la VRAM queda disponible para el cache KV.
- Proyector visual: ~610 MB adicionales en Q8_0 (frente a ~1.2 GB de un `mmproj` en bf16/f16).
- GPU de 24 GB (RTX 3090, 4090, 5080): offload completo, contexto de hasta 128k y 28-34 tok/s segun el autor.
- GPU de 16 GB (RTX 4080, 5070): offload hibrido con unas 30 capas en VRAM, contexto de 32k y 20-24 tok/s.
- Equipos con 32 GB de RAM DDR4/DDR5: ejecucion en CPU con offload a RAM, contexto de 16k-32k y 18-22 tok/s.
- Si cabe en GPU de consumo: si, en tarjetas de 24 GB con offload total y en tarjetas de 16 GB con offload parcial.
- Opciones de despliegue: llama.cpp / llama-cli (comando documentado con `--mmproj`, `-ngl 99`, `-c 65536`), LM Studio y Ollama (cargando el fichero principal y adjuntando el `mmproj` como adaptador de vision, con offload de GPU al 100 %). No se documentan vLLM ni TGI para este formato.
- Latencia y throughput de referencia: los de la tabla anterior, medidos en tokens por segundo; no se proporcionan datos de latencia por peticion ni de throughput en lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento rigurosa. Los unicos terminos de comparacion documentados son cuantizaciones del propio modelo base con las que el autor contrasta su receta:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XYZ-Aquila-mini APEX-I-MiniPlus (esta publicacion) | 35B MoE, 8/256 expertos activos | Hasta 128k | 3.38 BPW, ~13.7 GiB, 28-34 tok/s en 24 GB | apache-2.0 | GGUF en HuggingFace |
| XYZ-Aquila-mini en Q4_K_M estandar | 35B MoE | Hasta 128k (no viable en 24 GB segun el autor) | ~19.5 GB, OOM tras pocos turnos agenticos en GPU de 24 GB | La del modelo base | Cuantizacion comunitaria |
| XYZ-Aquila-mini en Q3_K_S / Q4_0 | 35B MoE | No disponible | Segun el autor, distorsionan los logits de gating del router y desvian tokens visuales | La del modelo base | Cuantizacion comunitaria |

Respecto a otros modelos del mismo autor en la familia APEX-I (KAT-Coder-V2.5-Dev, Thomson-1.0-Small, Apodex-1.1-mini, Occamy-1.0), se trata de modelos base distintos y especializados en otras tareas, sin datos comparativos publicados. Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual. En tareas de OCR, grounding de coordenadas y lectura de graficos, un error de percepcion puede propagarse a una accion erronea del agente.
- Idiomas: solo ingles y chino segun los metadatos. El castellano no figura como idioma soportado, por lo que el rendimiento en espanol no esta garantizado ni medido.
- Advertencia sobre la licencia: aunque el repositorio declara apache-2.0, esta es la licencia indicada para la cuantizacion; conviene verificar la licencia del modelo base XYZAILab/XYZ-Aquila-mini antes de un uso comercial en produccion.
- Inconsistencia de version: el repositorio se identifica como `...-MiniPlus-GGUF`, mientras que la model card describe la version `MiniPlus-V2` como "programada para manana" y se presenta a si misma como "Top 1 de la ola de despliegue APEX-I 35B MoE". Hay que confirmar que el fichero descargado corresponde a la version descrita.
- Sensibilidad de la cuantizacion: el propio autor advierte que cuantizaciones lineales uniformes degradan el enrutado de los 256 micro-expertos. Cualquier variante distinta de la receta IQ documentada puede comportarse peor de lo esperado en tareas visuales.
- Perdida de precision por cuantizacion: 3.38 BPW es una compresion agresiva; no se publican mediciones del delta de calidad frente al modelo en bf16.
- Rendimiento no verificado: no hay benchmarks publicados, ni evaluaciones de terceros, ni numero de descargas o likes (el repositorio figura con 0 descargas y 0 likes en el momento de la consulta).
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-09-16) y la propia narrativa de "lanzamiento manana" dificultan verificar el estado real del artefacto.
- Capacidades de tool calling y de agente: insinuadas por los tags, pero sin especificacion de formato ni de esquema de herramientas en la informacion disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a un foro de tematica deportiva sin relacion con el contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-GGUF
- Version V2 anunciada por el autor: https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- Coleccion APEX-I Custom Quants: https://huggingface.co/collections/IsValorum/apex-i-custom-quants-6aa8b021ecb827b8ff04c9fc
- Hermano de familia, KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF
- Hermano de familia, Thomson-1.0-Small APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF
- Hermano de familia, Apodex-1.1-mini APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2-GGUF
- Hermano de familia, Occamy-1.0 APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF
- Paper, blog tecnico o demo oficial: no disponible en la informacion proporcionada.
