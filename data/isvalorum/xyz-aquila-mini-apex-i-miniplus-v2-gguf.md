# IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2-GGUF

## Resumen

XYZ-Aquila-mini APEX-I-MiniPlus-V2 es una cuantizacion GGUF multimodal publicada por el usuario IsValorum sobre el modelo base XYZAILab/XYZ-Aquila-mini, un modelo de mezcla de expertos (MoE) de 35.000 millones de parametros con 256 micro-expertos y 8 activos por token. El repositorio distribuye dos artefactos: el fichero de pesos cuantizado a 3,38 bits por peso (BPW) y un proyector visual mmproj en Q8_0, lo que habilita inferencia image-text-to-text en hardware de consumo. El pipeline declarado es image-text-to-text y las etiquetas apuntan a casos de uso de busqueda agentica y grounding visual sobre interfaces web.

El interes practico de esta publicacion no esta en el modelo base, sino en la estrategia de cuantizacion. El autor sostiene que los cuantizados lineales uniformes (Q3_K_S, Q4_0) distorsionan los logits de las puertas del router en arquitecturas con muchos expertos pequenos, lo que provoca que los tokens visuales se enruten a expertos incorrectos. Para evitarlo, la receta fija los pesos del router (ffn_gate_inp.weight) en F32 sin comprimir, emplea codebooks no lineales IQ para el resto de la red y mantiene el clasificador de vocabulario en Q6_K. El resultado declarado ocupa unos 14,7 GB en disco y 13,7 GiB en memoria, lo que deja mas de 10 GB de VRAM libre en GPUs de 24 GB para el cache KV con contexto de 64k a 128k.

Es relevante ahora porque el modelo se presenta como el primero de una oleada de despliegue de la familia APEX-I orientada a MoE de 35B con vision, y porque propone un objetivo de "cero OOM" en 24 GB combinando cuantizacion agresiva con contexto largo. Conviene senalar que, en el momento de redactar esta ficha, los binarios estaban anunciados para subida el dia siguiente al de creacion del repositorio, que acumula 0 descargas y 0 likes, por lo que la disponibilidad efectiva de los pesos no esta confirmada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer con mezcla de expertos); 40 capas; 256 micro-expertos con dimension intermedia 512 |
| Parametros totales | 35B (cifra declarada por el autor de la cuantizacion para el modelo base) |
| Parametros activos | 8 expertos activos por token sobre 256; numero absoluto de parametros activos no disponible |
| Longitud de contexto | Hasta 128k segun la model card; 64k a 65.536 tokens en el ejemplo de llama-cli; valor nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF a 3,38 BPW con codebooks no lineales IQ (IQ3_XXS, IQ3_S, IQ4_NL); router ffn_gate_inp.weight en F32; clasificador de vocabulario en Q6_K; proyector visual mmproj en Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero principal + proyector multimodal mmproj en GGUF Q8_0) |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen3_5MoeForConditionalGeneration, un transformer de 40 capas con capa de mezcla de expertos compuesta por 256 micro-expertos de dimension intermedia 512, de los cuales se activan 8 por token. La model card vincula esta configuracion al modelo base XYZAILab/XYZ-Aquila-mini, descrito como disenado especificamente para busqueda web multimodal agentica, interaccion con interfaces de usuario en tiempo real y grounding visual. Las etiquetas del repositorio incluyen referencias a qwen3_5_moe y qwen3.6, lo que sugiere un linaje Qwen para el modelo base, aunque esta relacion no se documenta de forma explicita ni verificable en la informacion disponible.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) en el modelo base. Tampoco se documentan innovaciones de decodificacion especulativa, atencion lineal o MTP para este modelo concreto, mas alla de la mencion a MTP en otro miembro de la familia APEX-I. La aportacion tecnica documentada de esta publicacion es exclusivamente de cuantizacion: preservacion en F32 de las puertas del router para no alterar el enrutado de los tokens visuales, uso de codebooks IQ no lineales en el resto de la red y un proyector visual Q8_0 de 610 MB que, segun el autor, mantiene microtexto en viewports de navegador, deteccion de coordenadas para acciones de clic y analisis de graficos densos.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Reconocimiento optico de caracteres (OCR) de alta resolucion, segun la model card.
- Comprension de viewports de navegador web, incluido microtexto dentro del DOM y terminales de sistema.
- Grounding visual de interfaz: deteccion de coordenadas para acciones de clic y grounding de elementos de UI.
- Analisis de graficos, diagramas, infograficos y capturas de pagina completa.
- Razonamiento matematico con soporte visual declarado por el autor.
- Invocacion de herramientas con componente visual (visual tool invocation).
- Busqueda agentica y flujos de busqueda web multi-turno (etiquetas agentic-search y search-agent).
- Soporte multilingue limitado a ingles (en) y chino (zh).
- No se documenta soporte de audio, modo thinking explicito ni function calling en formato texto puro; no disponible.

## Casos de uso

- Agente de busqueda web multimodal: el modelo puede procesar capturas de paginas completas y razonar sobre ellas dentro de un bucle agentico, aprovechando la ventana de 64k-128k para mantener el historial de resultados y capturas sin reencuadrar el contexto. El objetivo de 13,7 GiB de consumo deja espacio de sobra para el cache KV en una GPU de 24 GB.
- Automatizacion de navegacion (RPA visual): con deteccion de coordenadas para clic, permite construir agentes que operen sobre interfaces sin selectores DOM estables, cubriendo tambien aplicaciones de escritorio o terminales capturadas como imagen.
- Extraccion de datos de documentos escaneados y graficos: el OCR de alta resolucion y el analisis de graficos densos lo hacen util para digitalizar informes, infograficos y tablas no estructuradas en pipelines batch.
- Auditoria de interfaces y QA visual: revision automatizada de capturas de producto para detectar desalineaciones, textos truncados o estados de error, integrable en un flujo de CI como comprobacion post-despliegue.
- Asistencia en escritorio con contexto largo: al caber en 24 GB con contexto de 128k, puede actuar como asistente local que mantiene sesiones largas con capturas repetidas de pantalla.
- Despliegue en portatil o equipo sin GPU dedicada: con offload a CPU y RAM (32 GB DDR4/DDR5) mantiene entre 16k y 32k de contexto, adecuado para prototipado o uso personal con requisitos de privacidad de datos.
- Evaluacion de modelos MoE cuantizados: sirve como referencia reproducible para estudiar el efecto del enrutado en cuantizaciones agresivas, comparando IQ frente a Q_K_S sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye estimaciones de velocidad de inferencia por tier de hardware (28-34 tok/s en GPU de 24 GB, 20-24 tok/s en GPU de 16 GB y 18-22 tok/s en CPU con 32 GB de RAM), sin especificar metodologia, tamano de prompt, batch ni version de llama.cpp empleada.

## Requisitos de hardware

- Peso en disco del fichero principal: aproximadamente 14,7 GB; consumo en RAM/VRAM declarado de aproximadamente 13,7 GiB.
- Proyector visual mmproj en Q8_0: aproximadamente 610 MB adicionales de disco y de memoria.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX 5080) con offload completo (-ngl 99): contexto recomendado de 128k y velocidad declarada de 28-34 tok/s.
- GPU de 16 GB (RTX 4080, RTX 5070) con offload hibrido de aproximadamente 30 capas: contexto recomendado de 32k y velocidad declarada de 20-24 tok/s.
- Equipo sin GPU dedicada con 32 GB de RAM DDR4/DDR5 o Mac: offload a CPU, contexto de 16k a 32k y velocidad declarada de 18-22 tok/s.
- Si cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM, con la salvedad de que en 16 GB el offload es parcial y el contexto se reduce a 32k.
- Opciones de despliegue documentadas: llama.cpp / llama-cli con los flags -m, --mmproj, -ngl 99 y -c; LM Studio; Ollama (cargando el fichero GGUF y adjuntando el mmproj como adaptador de vision). No se documenta soporte de vLLM ni TGI para estos ficheros GGUF.
- Advertencia de rendimiento: no se aportan datos de throughput medido con batches, latencia de primer token ni consumo bajo carga sostenida.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de sus alternativas, por lo que no es posible una comparacion cuantitativa fiable. Como referencia contextual se incluyen los otros miembros de la coleccion APEX-I del mismo autor, para los que tampoco se detallan parametros, contexto ni licencia mas alla de lo indicado.

| Modelo | Parametros | Contexto | Especialidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XYZ-Aquila-mini APEX-I-MiniPlus-V2 | 35B MoE (8 de 256 expertos activos) | Hasta 128k segun el autor | Busqueda multimodal y agente de UI | apache-2.0 | Anunciado para subida; 0 descargas en el momento de la ficha |
| KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2 | no disponible | no disponible | Codigo y refactorizacion agentica | no disponible | Publicado segun la model card |
| Thomson-1.0-Small APEX-I-MiniPlus-V2 | no disponible | no disponible | Legal, auditoria y razonamiento multimodal | no disponible | Publicado segun la model card |
| Apodex-1.1-mini APEX-I-MiniPlus-V2 | no disponible | no disponible | 256 micro-expertos con vision Q8_0 y MTP | no disponible | no disponible |

Comparativas con modelos de referencia como Qwen, Llama o Mistral de tamano equivalente: no disponible.

## Limitaciones y advertencias

- Estado de publicacion incierto: la model card indica que los binarios estaban programados para subirse "manana" respecto al momento de redaccion, y el repositorio registra 0 descargas y 0 likes, por lo que los pesos pueden no estar disponibles o no ser los definitivos.
- Ausencia total de datos de entrenamiento del modelo base: no se documentan tokens, composicion del dataset, ni proceso de alineacion, lo que impide evaluar sesgos de origen.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad factual, ni en texto ni en tareas de grounding visual.
- Cobertura idiomatica limitada a ingles y chino: no hay evidencia de rendimiento en castellano, por lo que su uso en produccion en espanol requeriria validacion propia.
- Cuantizacion agresiva de 3,38 BPW: aunque el autor preserva router y clasificador de vocabulario en precision alta, la perdida de calidad respecto al modelo base no esta medida con benchmarks y puede ser notable en tareas de razonamiento fino.
- Rendimiento dependiente del hardware: las cifras de 128k de contexto solo se sostienen en GPUs de 24 GB; en 16 GB el contexto baja a 32k y el offload es parcial, con la penalizacion de velocidad correspondiente.
- Licencia: el repositorio se declara apache-2.0, lo que en principio permite uso comercial, pero debe verificarse de forma independiente la licencia del modelo base XYZAILab/XYZ-Aquila-mini y la de los pesos originales antes de desplegarlo en producto.
- Trazabilidad del linaje: las etiquetas qwen3_5_moe y qwen3.6 apuntan a una familia Qwen, pero no se aporta documentacion que lo confirme ni que aclare si existen restricciones adicionales derivadas del modelo original.
- Resultados de la busqueda web no relevantes: las consultas externas devolvieron unicamente enlaces al servicio de traduccion de Google, sin informacion tecnica utilizable sobre este modelo o su modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2-GGUF
- Modelo base declarado: https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- Coleccion APEX-I Custom Quants: https://huggingface.co/collections/IsValorum/apex-i-custom-quants-6aa8b021ecb827b8ff04c9fc
- KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF
- Thomson-1.0-Small APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF
- Apodex-1.1-mini APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2-GGUF
- Occamy-1.0 APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF
- Papers, blogs tecnicos o demos del modelo base: no disponible en la informacion proporcionada.
