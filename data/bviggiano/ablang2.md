# bviggiano/AbLang2

## Resumen

AbLang2 es un modelo de lenguaje de proteinas especializado en anticuerpos, desarrollado por Tobias H. Olsen, Iain H. Moal y Charlotte M. Deane del Oxford Protein Informatics Group (Universidad de Oxford). El modelo aborda un problema especifico del campo: el sesgo de linea germinal (germline bias) en los modelos de lenguaje de anticuerpos, que hace que estos modelos reconstruyan secuencias hacia el repertorio germinal en lugar de capturar la diversidad real de las regiones variables somáticamente hipermutadas. AbLang2 fue entrenado especificamente para mitigar este sesgo, mejorando la capacidad de representacion de secuencias de anticuerpos maduradas.

Este repositorio concreto (`bviggiano/AbLang2`) es un espejo no modificado de los pesos oficiales del modelo en su variante paired (cadena pesada y ligera emparejadas). No se trata de un desarrollo nuevo, sino de una copia de los ficheros publicados originalmente en Zenodo (registro 10185169), creada para garantizar la disponibilidad de los pesos en redes donde Zenodo devuelve errores HTTP 403. El modelo es un transformer de proteinas de aproximadamente 179 MB en formato PyTorch (`model.pt`), disenado para generar embeddings de secuencias de anticuerpos y para tareas de reconstruccion de secuencias.

La relevancia de AbLang2 radica en su uso en el diseno computacional de anticuerpos: generacion de bibliotecas, prediccion de mutaciones, humanizacion y modelado de afinidad. Su licencia BSD-3-Clause permite uso comercial y modificacion, lo que lo hace atractivo para pipelines de descubrimiento de farmacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo de lenguaje de proteinas especializado en anticuerpos) |
| Parametros totales | no disponible (pesos de 179.314.477 bytes en `model.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin versiones GGUF/ONNX publicadas en este repo) |
| Idiomas soportados | no aplica (modelo de secuencias de aminoacidos, no de lenguaje natural) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (`model.pt`) + `hparams.json` |

## Arquitectura y entrenamiento

AbLang2 es un modelo de lenguaje de proteinas basado en arquitectura transformer encoder, entrenado sobre secuencias de anticuerpos emparejadas (cadena pesada y cadena ligera). La innovacion central descrita en el paper asociado (Olsen et al., *Bioinformatics*, 2024) es el tratamiento del sesgo de linea germinal: los modelos previos de anticuerpos tendian a reconstruir secuencias hacia el repertorio germinal, lo que degrada su utilidad para modelar anticuerpos madurados por seleccion somatica. AbLang2 introduce un esquema de entrenamiento que reduce este sesgo y mejora la representacion de secuencias somáticamente hipermutadas.

El repositorio espejo no incluye detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). El fichero `hparams.json` (228 bytes) contiene la configuracion del modelo, pero su contenido no se detalla en la informacion disponible. Los pesos se distribuyen en formato PyTorch y se cargan mediante el paquete `ablang2`, que espera ambos ficheros en una carpeta llamada `model-weights-ablang2-paired`.

## Capacidades

- Generacion de embeddings contextuales para secuencias de anticuerpos emparejadas (cadena pesada + ligera).
- Reconstruccion de secuencias de anticuerpos (masked language modeling sobre residuos de aminoacidos).
- Modelado de regiones variables con menor sesgo hacia el repertorio germinal que modelos previos.
- Soporte para tareas de scoring de mutaciones y analisis de secuencias de anticuerpos.
- No soporta tool calling ni function calling (no es un modelo de lenguaje natural).
- No soporta agentes ni razonamiento multi-step en el sentido de los LLM generativos.
- No soporta vision, audio ni thinking mode.
- Capacidades multilingues: no aplica (opera sobre alfabeto de aminoacidos, no sobre lenguaje natural).

## Casos de uso

- Diseno computacional de anticuerpos: usar los embeddings de AbLang2 para puntuar mutaciones candidatas en regiones variables y priorizar variantes con mayor probabilidad de plegamiento y union correctos, reduciendo el espacio de busqueda experimental.
- Humanizacion de anticuerpos: emplear el modelo para evaluar la "naturalidad" de secuencias humanizadas, comparando la verosimilitud de la secuencia bajo el modelo antes y despues de la humanizacion.
- Prediccion de efectos de mutacion: calcular la probabilidad de cada residuo en una posicion dada para estimar el impacto de sustituciones en la estabilidad o la funcion.
- Generacion de bibliotecas de anticuerpos: utilizar el modelo para filtrar o generar candidatos en pipelines de descubrimiento in silico antes de la sintesis experimental.
- Analisis de repertorios: obtener representaciones de secuencias de repertorios de celulas B para clustering, analisis de diversidad o deteccion de clones.
- Integracion en pipelines de aprendizaje automatico de proteinas: usar los embeddings como features para modelos downstream de prediccion de afinidad, inmunogenicidad o especificidad.
- Reproducibilidad en entornos HPC: al ser un espejo accesible, permite descargar los pesos en clusters donde Zenodo bloquea el acceso, facilitando la replicacion de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (Olsen et al., 2024) contiene evaluaciones, pero no se incluyen en la model card de este repositorio espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para los pesos en precision completa (179 MB), mas memoria para activaciones; en la practica, menos de 1 GB para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GPUs consumer como GTX 1650, RTX 3060 o superiores. Tambien puede ejecutarse en CPU para inferencia de lotes pequenos.
- Cabe en cualquier GPU consumer moderna; incluso en GPUs integradas con suficiente memoria compartida para lotes pequenos.
- Opciones de despliegue: el paquete oficial `ablang2` (PyTorch) es la via principal; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de lenguaje natural.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbLang2 | no disponible (~179 MB pesos) | no disponible | Anticuerpos emparejados, mitigacion de sesgo germinal | BSD-3-Clause | Pesos en Zenodo y espejo en HF |
| AbLang (v1) | no disponible | no disponible | Anticuerpos (cadenas separadas) | BSD-3-Clause | GitHub oxpig/AbLang |
| AntiBERTy | no disponible | no disponible | Anticuerpos, embeddings | no disponible | GitHub |
| ESM-2 | 8M–15B (segun variante) | hasta 1024 residuos | Proteinas generales | MIT | Hugging Face |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada. AbLang2 se distingue por su tratamiento explicito del sesgo germinal y por modelar cadenas emparejadas, frente a AbLang v1 y AntiBERTy, que trabajan con cadenas separadas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en anticuerpos; no es adecuado para proteinas generales ni para lenguaje natural.
- No es un modelo generativo de texto: no soporta chat, instrucciones ni tool calling.
- Riesgo de sesgo residual hacia el repertorio de entrenamiento, aunque el modelo se disena para mitigar el sesgo germinal.
- La model card del espejo no documenta el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de especies o subtipos de anticuerpos.
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion; no hay restricciones adicionales documentadas.
- El repositorio es un espejo no oficial; la fuente original es Zenodo (registro 10185169) y el codigo upstream esta en GitHub (oxpig/AbLang2). Para produccion, se recomienda verificar la integridad de los pesos mediante los SHA-256 documentados.
- No se han publicado datos de latencia ni throughput en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bviggiano/AbLang2
- Codigo upstream: https://github.com/oxpig/AbLang2
- Pesos originales (Zenodo): https://zenodo.org/records/10185169
- Paper: Olsen, T. H., Moal, I. H., Deane, C. M. (2024). *Addressing the antibody germline bias and its effect on language models for improved antibody design*. Bioinformatics, 40(11), btae618. https://doi.org/10.1093/bioinformatics/btae618
- Licencia: https://github.com/oxpig/AbLang2/blob/main/LICENSE
