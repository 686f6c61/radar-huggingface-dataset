# minjaechoi/qwen36-35b-a3b-2p36bit-r14

## Resumen

`minjaechoi/qwen36-35b-a3b-2p36bit-r14` es un checkpoint de investigación publicado por el usuario minjaechoi (no por el equipo de Qwen) a partir del modelo base `Qwen/Qwen3.6-35B-A3B`. Se trata de una variante con cuantización agresiva aplicada exclusivamente a los expertos enrutados de la arquitectura MoE: según la model card, dichos expertos promedian 2,358 bits, mientras que el resto de los pesos se mantiene en BF16. El identificador interno del experimento es «r14».

El detalle técnico clave es que los pesos se publican **dequantizados en tensores BF16**: el repositorio ocupa 70,2 GB y declara 35.107.181.936 parámetros totales, es decir, el mismo orden de magnitud que el modelo base sin cuantizar. Por tanto, la reducción a 2,358 bits afecta a la precisión efectiva de los valores de los expertos, no al tamaño de descarga ni al consumo de VRAM en inferencia. No es, en sentido estricto, un checkpoint listo para ahorrar memoria.

Su relevancia es fundamentalmente experimental: permite estudiar hasta qué punto la cuantización extrema de las capas de expertos degrada la calidad del modelo, y sirve como artefacto de referencia para metodologías de compresión de MoE. Fuera de ese ámbito, no hay información publicada sobre evaluación, licencia, idiomas soportados ni benchmarks, y el modelo acumula cero descargas, por lo que no debe considerarse un artefacto validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (*mixture of experts*) de tipo transformer; tag de arquitectura `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35,1 B), dato real de safetensors |
| Parametros activos | no disponible (el sufijo «A3B» del modelo base sugiere ~3 B, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados con media de 2,358 bits (ID interno r14); resto de pesos en BF16; pesos publicados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica «license follows the base model», pero la licencia del base no se especifica en la informacion proporcionada |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 70,2 GB |
| Modalidades declaradas | `image-text-to-text` (segun tags), ademas de `text-generation` |
| Libreria de carga | `transformers` (compatible tambien con vLLM, segun la model card) |
| Pipeline declarado | text-generation |
| Autor | minjaechoi (tercero, no oficial de Qwen) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con capas de *mixture of experts* (tag `qwen3_5_moe`), con 35,1 B de parametros totales. No se dispone de informacion sobre el numero de expertos, la granularidad de enrutamiento, el numero de capas, la dimension oculta ni los parametros activos por token. Tampoco se documenta la ventana de contexto ni la composicion del dataset de entrenamiento del modelo base.

La innovacion de este checkpoint es la metodologia de compresion: los pesos de los expertos enrutados se almacenan con una precision efectiva media de 2,358 bits, mientras que los pesos de atencion, embeddings y demas componentes se conservan en BF16. La model card no describe el algoritmo de cuantizacion empleado, ni si hubo *fine-tuning* posterior a la compresion, ni si se aplicaron tecnicas de recuperacion (por ejemplo, ajuste de escalas o destilacion). El autor indica que los pesos se guardan dequantizados en BF16 y que cargan con `transformers` y vLLM sin modificaciones, lo que implica que el beneficio de la cuantizacion no se traslada al consumo de memoria en inferencia: el checkpoint ocupa lo mismo que una version BF16 completa. No hay informacion sobre RLHF, DPO u otras fases de alineamiento en este artefacto.

## Capacidades

- Generacion de texto y uso conversacional: son las capacidades declaradas explicitamente en los tags del repositorio y en el pipeline (`text-generation`, `conversational`).
- Procesamiento de imagen y texto: el tag `image-text-to-text` apunta a capacidades multimodales heredadas del modelo base, pero no hay documentacion en la model card que las confirme ni que describa el codificador visual.
- Razonamiento, codigo, matematicas y conocimiento general: previsiblemente heredados del modelo base, pero sin verificacion publicada para este checkpoint; la cuantizacion a 2,358 bits de los expertos puede degradarlos de forma no medida.
- *Tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles en los metadatos).
- Modo *thinking* u otras capacidades especiales: no documentado.

## Casos de uso

- Investigacion sobre cuantizacion extrema de MoE: comparar las salidas de este checkpoint con las de `Qwen/Qwen3.6-35B-A3B` en BF16 sobre un conjunto fijo de *prompts* permite medir la perdida de calidad atribuible a bajar los expertos a 2,358 bits, aislando el efecto del resto de pesos, que permanecen en BF16.
- Estudios de ablacion sobre precision efectiva: al ser un checkpoint con ID interno «r14», es util como uno de los puntos de una curva que relacione bits por experto con metricas de calidad, siempre que se disponga de los demas puntos de la serie.
- Servicio interno de texto en BF16: al cargarse con `transformers` y vLLM y ocupar ~70 GB de pesos, puede desplegarse como endpoint conversacional en nodos con 80 GB o mas de VRAM, aunque sin ventaja de memoria frente al base.
- Evaluacion de pipelines multimodales: si se confirma la capacidad `image-text-to-text`, serviria para probar flujos de *captioning* o VQA en entornos de investigacion, verificando antes que la cuantizacion no ha degradado la rama de vision.
- Reproducibilidad de experimentos de compresion: documentar el procedimiento de carga y las condiciones de inferencia de un checkpoint de este tipo, util para equipos que publican artefactos de compresion y necesitan referencias ejecutables.
- Base para *fine-tuning* experimental: al mantener el resto de pesos en BF16, es un punto de partida razonable para estudiar si un ajuste ligero recupera la calidad perdida por la cuantizacion de expertos.
- Analisis de robustez y alucinacion bajo compresion: medir si la reduccion de precision en los expertos aumenta la tasa de respuestas incorrectas en tareas de conocimiento factual, comparando contra el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay evaluaciones de terceros en los resultados de busqueda (que solo devolvieron enlaces sin relacion con el modelo, como Google Maps). No es posible, por tanto, cuantificar la perdida de calidad respecto al modelo base ni comparar con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 70 GB en BF16 (35,1 B de parametros a 2 bytes). A ello hay que sumar la cache KV y el *overhead* del runtime, por lo que un despliegue comodo requiere del orden de 80-100 GB de VRAM en total; el valor exacto depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: 2x A100 80 GB, 2x H100 80 GB o 1x H200 141 GB. Una sola H100 de 80 GB ajusta los pesos, pero deja muy poco margen para cache KV con contextos largos.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB). Seria viable en configuraciones de 4x RTX 4090 (96 GB) con paralelismo tensorial, asumiendo el coste de comunicacion entre tarjetas y que no existe una version GGUF o AWQ publicada para este checkpoint.
- Opciones de despliegue: `transformers` (indicado por el autor y por la libreria declarada) y vLLM (mencionado en la model card). No hay versiones GGUF, AWQ ni GPTQ publicadas, por lo que llama.cpp y Ollama no son aplicables sin una re-cuantizacion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p36bit-r14 | 35,1 B | no disponible | Expertos a 2,358 bits, resto BF16 (publicados en BF16) | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B (mismo modelo de partida) | no disponible | BF16 completo | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base. Cualquier comparacion con otros MoE de tamano similar (por ejemplo, familias Mixtral, DeepSeek o Qwen3) requeriria datos de parametros, contexto, licencia y benchmarks que no se han facilitado, por lo que no se incluyen.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: 2,358 bits de media en los expertos enrutados es un regimen extremo. No hay ninguna evaluacion publicada que cuantifique la degradacion de calidad, ni de razonamiento, ni de conocimiento factual, ni de coherencia en generaciones largas.
- Sin ahorro real de memoria: los pesos se publican dequantizados en BF16, de modo que el checkpoint no reduce el uso de VRAM ni el tamano de descarga frente a un BF16 convencional. Quien busque eficiencia de inferencia no la obtendra aqui.
- Licencia indeterminada: la model card remite a la licencia del modelo base, que no se especifica en la informacion disponible. No debe asumirse uso comercial permitido sin verificar la licencia de `Qwen/Qwen3.6-35B-A3B`.
- Artefacto no oficial: el autor es un tercero (minjaechoi), no el equipo de Qwen. No hay garantia de integridad de pesos, de reproducibilidad del proceso de cuantizacion ni de mantenimiento.
- Autorreportado, sin verificacion independiente: el dato de 2,358 bits proviene exclusivamente de la model card; no hay metodologia descrita ni scripts de evaluacion en la informacion proporcionada.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de calibracion, y la compresion de expertos puede incrementar la tasa de errores factuales; en cualquier caso, se trata de un riesgo inherente a los modelos generativos.
- Idiomas no documentados: no se puede afirmar el nivel de calidad en castellano ni en otras lenguas, ni si la cuantizacion afecta de forma desigual a idiomas con menos representacion en los datos del modelo base.
- Capacidades multimodales sin verificar: el tag `image-text-to-text` sugiere vision, pero la model card no documenta el procesador de imagen ni ejemplos de uso; habria que validarlo antes de integrarlo en un pipeline multimodal.
- Adopcion nula: cero descargas y cero likes en el momento de redactar la ficha, lo que implica ausencia de evidencia externa sobre su comportamiento real.
- No apto para produccion sin validacion propia: dado el contexto experimental, cualquier uso en sistemas con usuarios finales exige una evaluacion previa especifica del dominio y una verificacion legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p36bit-r14
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo del checkpoint: no disponible
- Los resultados de busqueda web realizados no devolvieron ningun enlace relevante sobre este modelo: unicamente enlaces de Google Maps sin relacion con el contenido.
