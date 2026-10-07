# Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF

## Resumen

GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF es una cuantizacion mixta en formato GGUF derivada de `orcarouter/GLM-5.3-Flash-Uncensored-FP8`, publicada por el usuario Baekpica. Se trata de un modelo de arquitectura MoE con 45 capas de tronco (34 capas KDA y 11 capas de atencion dispersa), 288 expertos enrutados por capa con top-8 activos, un contexto nativo de 1.048.576 tokens y un bloque MTP (multi-token prediction) embebido. Ademas incluye un codificador de vision independiente que se mantiene en BF16.

El problema que aborda es el de hacer viable en memoria unificada de gama alta un modelo de gran tamano cuyo checkpoint original esta en FP8. Para ello aplica una receta de precision mixta que conserva Q8_0 en las rutas siempre activas (embeddings, cabeza de salida, MLP densas y expertos compartidos) y en las proyecciones principales, y baja a IQ2_XXS/IQ2_XS/Q2_K en las matrices de expertos enrutados, con los pesos de router, normas y controles de estado en F32. El tamano planificado es de 87,470 GiB para tronco + MTP y 88,520 GiB (95,047 GB) contando el codificador de vision.

Es relevante ahora porque apunta a ejecucion local en hardware tipo DGX Spark, con el limite de contexto de 1M tokens preservado en los metadatos. Sin embargo, el estado declarado por el autor es "build in progress": los pesos no estan publicados, las cifras de tamano son estimaciones del plan de conversion y no hay resultados de calidad ni de rendimiento medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer hibrido: 45 capas de tronco (34 KDA + 11 de atencion dispersa), con bloque MTP embebido y codificador de vision separado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se indica top-8 de 288 expertos enrutados por capa) |
| Longitud de contexto | 1.048.576 tokens (nativo, preservado en metadatos) |
| Tipos de cuantizacion | Mixta: Q8_0, Q4_K, IQ2_XS, IQ2_XXS, Q2_K, F32 y BF16 segun grupo de tensores |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del checkpoint de origen) |
| Formato de pesos | GGUF |
| Tamano planificado | 87,470 GiB (tronco + MTP); 88,520 GiB / 95,047 GB con vision |
| Estado de publicacion | build in progress; pesos aun no publicados |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base, sino la receta de conversion. La arquitectura descrita consta de 45 capas de tronco, de las cuales 34 son capas KDA y 11 son capas de atencion dispersa (la model card no desarrolla la sigla KDA). Las capas 0, 1 y 2 son densas. Cada capa enrutada contiene 288 expertos con enrutamiento top-8. El modelo incorpora un bloque MTP embebido (indice 45) pensado para decodificacion especulativa o drafting, y un codificador de vision independiente mantenido en BF16 a partir de los pesos originales.

La innovacion tecnica principal de este repositorio es la asignacion de precision por grupo de tensores, orientada a reducir el error de reconstruccion en las rutas criticas. El embedding de tokens y la cabeza de salida, las MLP densas de las capas 0-2 y los expertos compartidos se mantienen en Q8_0; las proyecciones query/key de las capas KDA en Q4_K; el resto de KDA y las proyecciones principales de atencion dispersa/MLA en Q8_0; router, sesgos, normas y controles de estado en F32; indexadores, mezcladores mHC y la proyeccion de estado oculto del MTP en BF16. En las matrices de expertos enrutados, las capas 3, 4, 5, 43, 44 y 45 usan IQ2_XS (gate/up) y Q2_K (down), mientras que el resto usa IQ2_XXS (gate/up) e IQ2_XS (down). Gate y up comparten formato dentro de cada capa y las anchuras de matriz enrutada siguen siendo divisibles por 256.

La calibracion cubrio 81.920 posiciones de texto y, segun el autor, se observaron todos los expertos enrutados del tronco. Sobre una muestra acotada de pesos fuente en Q2_K se reporta un 51,2% menos de error de reconstruccion ponderado por activacion al usar imatrix, cifra que el propio autor califica de proxy de reconstruccion, no de ganancia medida en calidad de respuesta. El imatrix se recoge de entradas de texto; no se reclama calibracion de activaciones condicionada por imagen, y las estadisticas de activacion del MTP no se recogen porque el grafo GLM de origen no lo permite (el bloque 45 usa importancia basada en pesos para IQ2_XS gate/up y Q2_K down sin ponderar).

## Capacidades

- Generacion de texto y razonamiento: pipeline declarado como `image-text-to-text`, con arquitectura MoE de gran escala.
- Procesamiento de imagen: dispone de un codificador de vision separado en BF16; el servicio de imagen requiere ese encoder.
- Multi-token prediction: bloque MTP embebido, orientado a drafting y decodificacion especulativa (comportamiento pendiente de verificacion segun el autor).
- Contexto muy largo: ventana nativa de 1.048.576 tokens, preservada en los metadatos del GGUF.
- Comportamiento "uncensored": heredado del checkpoint de origen (la model card advierte que no se ha medido de nuevo en esta cuantizacion).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el campo de idiomas figura como no disponible).
- Video nativo: el soporte de entrada de video no esta establecido.

## Casos de uso

- Procesamiento de documentos largos en local: con 1.048.576 tokens de contexto nativo, el modelo puede ingerir expedientes, libros tecnicos o bases de codigo completas en una sola pasada, siempre que la memoria disponible lo permita.
- Analisis de imagenes con texto asociado: gracias al codificador de vision en BF16, admite escenarios de descripcion de figuras, extraccion de informacion de capturas o revision de diagramas junto a instrucciones textuales.
- Despliegue en estaciones con memoria unificada: el tamano planificado de 95,047 GB encaja en equipos de memoria unificada de gran capacidad (la etiqueta `dgx-spark` apunta a ese perfil), lo que permite servir el modelo sin cluster dedicado.
- Generacion especulativa acelerada: el bloque MTP embebido puede emplearse como cabezal de drafting para reducir el numero de pasos de decodificacion, una vez validado su comportamiento.
- Investigacion sobre cuantizacion extrema: la receta de precision mixta con IQ2_XXS como minimo y capas frontera en IQ2_XS constituye un caso de estudio reproducible sobre el equilibrio entre tamano y error de reconstruccion.
- Evaluacion comparativa de comportamiento "uncensored" en entornos controlados: util para estudiar como afecta la cuantizacion agresiva a respuestas en dominios sin filtros, siempre con las salvaguardas y politicas de uso del desplegador.
- Prototipado de asistentes de contexto masivo con vision: combinacion de contexto de 1M y entrada de imagen para tareas de soporte tecnico sobre manuales escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que el comportamiento "uncensored" y los resultados de benchmarks del modelo de origen no constituyen mediciones nuevas de esta cuantizacion, y que los resultados de calidad identificaran la build y los ajustes exactos probados una vez completada la publicacion. Unicamente se aporta un dato de reconstruccion: 51,2% menos de error de reconstruccion ponderado por activacion con imatrix sobre una muestra acotada de pesos fuente en Q2_K, descrito por el autor como proxy y no como mejora medida de calidad.

## Requisitos de hardware

- VRAM/espacio de pesos: aproximadamente 88.520 GiB (95,047 GB) con el codificador de vision incluido, segun el plan de conversion del autor.
- Memoria de contexto: el autor estima unos 14,85 GiB adicionales de KV/estado/grafo en el limite de 1M tokens, mas 1,15 GiB si se usa el MTP. Es decir, del orden de 111 GB en total para pesos mas contexto maximo, cifra derivada de los datos de la model card y no medida.
- GPU de centro de datos: no hay datos de despliegue medidos; por tamano, se requiere agregacion de memoria entre varias GPU (por ejemplo, clase A100/H100 de 80 GB) o una maquina de memoria unificada grande.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo actual por si sola, dado el tamano de pesos de ~95 GB y la memoria de contexto adicional.
- Memoria unificada: el objetivo declarado apunta a hardware tipo DGX Spark; el contexto maximo alcanzable en ese equipo no ha sido medido todavia.
- Opciones de despliegue: el GGUF esta pensado para el formato GLM nativo del runtime [antirez/ds4](https://github.com/antirez/ds4), y las combinaciones mixtas de expertos requieren la extension de runtime correspondiente. La compatibilidad con llama.cpp upstream no esta establecida, por lo que vLLM, Ollama o TGI no pueden darse por soportados.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF | no disponible (MoE, 288 expertos top-8 por capa, 45 capas) | 1.048.576 tokens | GGUF con cuantizacion mixta (Q8_0 / Q4_K / IQ2_XS / IQ2_XXS / Q2_K / F32 / BF16) | MIT | Pesos no publicados (build in progress) |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 (origen) | no disponible | no disponible en la informacion aportada | FP8 | MIT (heredada) | Checkpoint de origen |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion tecnica comparable sobre modelos de la misma categoria; los resultados obtenidos no eran relevantes para este modelo.

## Limitaciones y advertencias

- Pesos no publicados: el autor declara "build in progress"; no hay pesos descargables ni resultados de calidad medidos.
- Cifras estimadas: los tamanos indicados (87,470 GiB / 88,520 GiB) son estimaciones del plan de conversion, no mediciones del artefacto final.
- Compatibilidad de runtime restringida: requiere el formato GLM nativo de antirez/ds4 y una extension de runtime para las combinaciones mixtas de expertos; la compatibilidad con llama.cpp upstream no esta establecida.
- Cuantizacion muy agresiva en expertos enrutados: IQ2_XXS como minimo de precision implica perdida de calidad no cuantificada; el unico dato disponible es un proxy de error de reconstruccion, no una evaluacion de respuestas.
- Imatrix solo de texto: no se ha realizado calibracion de activaciones condicionada por imagen, por lo que el comportamiento con entradas visuales puede degradarse de forma no medida.
- MTP sin estadisticas de activacion: el bloque 45 usa importancia basada en pesos para gate/up y Q2_K sin ponderar para down; el comportamiento de drafting esta pendiente de verificacion.
- Contexto real condicionado por memoria: aunque el limite de 1M tokens se preserva en metadatos, el contexto util depende de la memoria disponible y de los ajustes del runtime; el maximo en DGX Spark no se ha medido.
- Video no soportado de forma establecida.
- Idiomas soportados no declarados: no hay garantia documentada de cobertura multilingue mas alla de lo que herede el checkpoint de origen.
- Comportamiento "uncensored": implica un riesgo elevado de generar contenido sin filtros; el desplegador debe asumir la responsabilidad de las salvaguardas y del cumplimiento normativo aplicable.
- Riesgo de alucinacion: no disponible; no se han publicado evaluaciones al respecto para esta cuantizacion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia: MIT heredada del checkpoint de origen, lo que en principio permite uso comercial, pero conviene verificar el fichero LICENSE y las condiciones del modelo base.
- Estado de adopcion: 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF
- Modelo base (FP8): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Licencia: https://huggingface.co/Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF/blob/main/LICENSE
- Resumen de calibracion: https://huggingface.co/Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF/blob/main/calibration-summary.json
- Dataset de calibracion multimodal: https://huggingface.co/datasets/Baekpica/Inkling-Small-Multimodal-Calibration
- Runtime de destino: https://github.com/antirez/ds4
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a opiniones de un operador de telecomunicaciones y no guardan relacion con el modelo.
