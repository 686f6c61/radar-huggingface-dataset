# liodon-ai/novel-humanize-4b-FP8

## Resumen

novel-humanize-4b-FP8 es una cuantizacion en FP8 del modelo gugujiji/novel-humanize-4b, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a reducir el coste de despliegue: el checkpoint original en precision completa ocupa 8,0 GB y esta version queda en 4,4 GB, es decir, aproximadamente la mitad. El modelo subyacente tiene 4.022.468.096 parametros (unos 4B) y la etiqueta `qwen3` de HuggingFace indica que la arquitectura de partida es la familia Qwen3, aunque la model card no detalla la configuracion exacta de capas ni la longitud de contexto.

El sufijo "novel-humanize" sugiere un ajuste fino orientado a la generacion de ficcion y a la produccion de texto con un registro menos marcadamente artificial, si bien el autor de la ficha no aporta detalles sobre el dataset de ajuste ni sobre el proceso de alineamiento. El pipeline declarado es `text-generation` con etiqueta `conversational`, lo que indica un uso previsto de generacion de texto conversacional en un solo turno o multi-turno.

La relevancia de esta publicacion es practica: emplea el esquema `FP8_DYNAMIC` de llm-compressor (pesos en FP8 E4M3 por canal, activaciones cuantizadas dinamicamente por token en tiempo de inferencia) y no requiere dataset de calibracion, por lo que los pesos son una conversion directa del original sin sesgo de calibracion. El resultado se puede servir con vLLM, TGI o SGLang sobre GPUs con compute capability 8.9 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (etiqueta `qwen3` en HuggingFace); configuracion de capas no disponible |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinamico (`FP8_DYNAMIC`): pesos FP8 E4M3 por canal, activaciones FP8 por token en inferencia; `lm_head` sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | `other` (terminos no especificados en la model card) |
| Formato de pesos | safetensors con `compressed-tensors`; compatible con transformers, vLLM, TGI y SGLang |
| Tamano del repositorio | 4,4 GB (original en precision completa: 8,0 GB) |
| Herramienta de cuantizacion | llm-compressor (vLLM project) |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo original: no se detallan el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tipo de atencion (completa o hibrida) ni el vocabulario. La unica referencia estructural es la etiqueta `qwen3` del repositorio, que situa el modelo de partida en la familia Qwen3, y el pipeline `text-generation` con etiqueta `conversational`. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento en el modelo base gugujiji/novel-humanize-4b.

La innovacion tecnica documentada corresponde exclusivamente al proceso de cuantizacion. Se aplica el esquema `FP8_DYNAMIC` de llm-compressor: los pesos se convierten a FP8 (formato E4M3) con escala por canal calculada a priori, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no necesitar conjunto de calibracion, la conversion es un cast directo de los pesos originales, lo que evita el sesgo que introducirian las muestras de calibracion. La capa `lm_head` se mantiene en mayor precision de forma deliberada, por su impacto desproporcionado en la calidad frente a su tamano reducido.

## Capacidades

- Generacion de texto y continuacion de textos narrativos, segun el pipeline declarado y el nombre del modelo base.
- Generacion conversacional (etiqueta `conversational`), apta para dialogos multi-turno dentro del limite de contexto, que no esta documentado.
- Escritura creativa y reescritura de ficcion: el ajuste "humanize" apunta a producir texto con un registro menos mecanico, aunque no hay evaluacion publicada que lo cuantifique.
- Despliegue en infraestructura de inferencia de alto rendimiento mediante FP8: vLLM, Text Generation Inference y SGLang estan soportados de forma explicita.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso, modo "thinking" o agentes: no disponible en la informacion proporcionada.
- Vision, audio o multimodalidad: no disponible; el modelo es exclusivamente de texto.
- Capacidades matematicas y de codigo: no verificadas ni documentadas para este ajuste.

## Casos de uso

- Reescritura y edicion de ficcion: el modelo puede tomar parrafos generados por otro sistema o por el autor y reescribirlos en un registro mas natural, aprovechando el ajuste especifico del modelo base sobre textos narrativos. Su tamano de 4B permite iterar sobre capitulos completos con coste bajo.
- Generacion de borradores narrativos en produccion editorial: util para producir primeras versiones de escenas y dialogos que un editor humano revisa despues, con un throughput alto gracias a la ejecucion FP8 en GPUs Ada o Hopper.
- Deteccion y suavizado de "marca de IA" en textos corporativos: reescritura de contenido marketing o divulgativo para reducir formulaciones repetitivas, con la advertencia de que la calidad debe validarse manualmente por la ausencia de benchmarks.
- Asistente de escritura en aplicaciones de autor: integracion en un editor como servicio de continuacion de texto, con una VRAM de 4,4 GB de pesos que permite alojarlo en una unica GPU de gama media.
- Prototipado rapido de productos de generacion de texto: al ser un modelo de 4B, sirve como linea base economica para validar prompts, plantillas y flujos conversacionales antes de invertir en modelos mayores.
- Despliegue en entornos con restricciones de memoria: en escenarios donde el modelo original de 8,0 GB no cabe junto con el resto del stack, la version FP8 reduce el footprint a la mitad manteniendo la fidelidad numerica del cast directo.
- Evaluacion comparativa de tecnicas de cuantizacion: util como caso de estudio reproducible del esquema `FP8_DYNAMIC` frente al checkpoint BF16 original en tareas de escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de calidad de texto, ni comparaciones con el checkpoint original en BF16. Tampoco se documentan mediciones de latencia o throughput del despliegue en FP8.

## Requisitos de hardware

- VRAM para los pesos: 4,4 GB en FP8, frente a 8,0 GB del checkpoint original en precision completa.
- VRAM total estimada para inferencia: alrededor de 6-8 GB con contexto corto en vLLM o TGI (pesos mas cache KV, buffers de activacion y overhead del servidor); el valor exacto depende de la longitud de contexto, que no esta documentada.
- GPUs con soporte nativo de FP8: compute capability 8.9 o superior, es decir, Ada, Hopper y Blackwell. Incluye RTX 40-series (por ejemplo RTX 4090), L4, L40S, H100, H200, B100, B200 y GB10.
- Cabe en GPU de consumo: si, en RTX 4090 y otras tarjetas Ada. En GPUs anteriores (por ejemplo RTX 3090, compute capability 8.6) vLLM y TGI descomprimen los pesos para ejecutar, con lo que se pierde la ventaja de velocidad y de memoria.
- Opciones de despliegue documentadas: `vllm serve liodon-ai/novel-humanize-4b-FP8`; TGI via la imagen `ghcr.io/huggingface/text-generation-inference` con `--model-id`; SGLang con `python -m sglang.launch_server --model-path`. Tambien es compatible con la libreria `transformers` y con endpoints compatibles.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/novel-humanize-4b-FP8 | 4,02B | No disponible | safetensors FP8, 4,4 GB | `other` | Version cuantizada, requiere GPU con CC >= 8.9 para FP8 nativo |
| gugujiji/novel-humanize-4b | 4,02B | No disponible | Peso completo, 8,0 GB | `other` | Modelo de partida; mayor compatibilidad de hardware, el doble de memoria |
| Otros modelos de ~4B de la familia Qwen3 | No disponible en la informacion | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |
| Alternativas de escritura creativa de ~4B | No disponible en la informacion | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

No hay datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia declarada es `other` y la model card no reproduce los terminos. No se puede confirmar que el uso comercial este permitido; es imprescindible revisar la licencia del modelo original gugujiji/novel-humanize-4b antes de cualquier despliegue en produccion.
- No se documentan los idiomas soportados. El comportamiento en castellano no esta verificado y podria degradarse respecto al ingles si el ajuste se realizo principalmente en ese idioma.
- No se publica la longitud de contexto, lo que impide dimensionar con precision la cache KV y planificar cargas de documentos largos.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de que la cuantizacion FP8 preserve la calidad del modelo original en tareas de escritura creativa, mas alla de la afirmacion del autor de que el cast directo evita sesgo de calibracion.
- Riesgo de alucinacion: inherente a los modelos generativos de 4B, especialmente en la generacion de hechos, citas o datos verificables. El modelo no debe usarse como fuente de informacion factual sin verificacion.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad del modelo base ni de la version cuantizada.
- En GPUs sin soporte FP8 nativo, la descompresion automatica elimina la ventaja de memoria y velocidad, y puede anadir latencia frente a ejecutar directamente el checkpoint original.
- El repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado el comportamiento del modelo; tratarlo como un artefacto sin contraste externo.
- No hay informacion sobre tool calling ni formato de plantilla de chat, por lo que la integracion en pipelines con funciones o agentes requeriria verificacion manual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/novel-humanize-4b-FP8
- Modelo base: https://huggingface.co/gugujiji/novel-humanize-4b
- Perfil del autor de la cuantizacion (Liodon AI): https://huggingface.co/liodon-ai
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados sin relacion con Pinterest).
