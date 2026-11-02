# nile-academy/pp-ocrv6-tiny-onnx

## Resumen

pp-ocrv6-tiny-onnx es un espejo de datos de modelos OCR publicado por nile-academy para consumidores de Wekala. No se trata de un desarrollo propio: el repositorio empaqueta los checkpoints declarativos de deteccion y reconocimiento de texto de PP-OCRv6 en su variante tiny, originalmente publicados por PaddlePaddle, junto con sus exportaciones ONNX y las model cards originales. El objetivo es fijar identidades de fichero inmutables (source-pinned mirror) para que los consumidores de Wekala dispongan de artefactos verificables.

El contenido se organiza en dos pipelines complementarios: deteccion de cajas de texto (`det/`) y reconocimiento de texto (`rec/`), ambos en formato ONNX para despliegue. El repositorio incluye tambien los checkpoints de inferencia originales de Paddle, conservados por separado de las exportaciones ONNX oficiales. No se incluye codigo Python, checkpoints en pickle, servidores de inferencia ni codigo ejecutable de modelo.

La relevancia es acotada: se trata de un mirror de artefactos, no de un modelo con benchmarks o garantias de calidad publicadas. La propia model card advierte que la publicacion verifica identidades de fichero, no la precision OCR, la fidelidad de cuantizacion, el encaje en dispositivo ni la aceptacion en escritorio, movil o navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline OCR de deteccion + reconocimiento; sin detalle arquitectonico en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a pipeline OCR) |
| Tipos de cuantizacion | no disponible (se distribuyen exportaciones ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | en, zh (segun metadatos; la model card advierte que el metadata de idioma no establece calidad probada) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (exportaciones) y checkpoints de inferencia Paddle originales |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros ni el proceso de entrenamiento en la documentacion proporcionada. El repositorio es un mirror de artefactos: conserva los checkpoints declarativos de PP-OCRv6 tiny (deteccion y reconocimiento) junto con sus exportaciones ONNX oficiales, organizados bajo `original/<source-commit>/` y en los directorios `det/` y `rec/` para el despliegue.

La unica innovacion tecnica documentada es de proceso, no de modelado: la publicacion fija identidades inmutables de fichero y commits de origen, y separa los checkpoints Paddle originales de las exportaciones ONNX. No se documentan datos de entrenamiento, tokens, composicion del dataset ni tecnicas de alineamiento (RLHF/DPO).

## Capacidades

- Deteccion de texto en imagenes (pipeline `det`).
- Reconocimiento de texto (pipeline `rec`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: metadatos declaran ingles y chino; la model card indica que el soporte de arabe es preferido pero no es criterio de elegibilidad, y que el metadata de idioma no establece calidad probada.
- Capacidades especiales (thinking mode, vision general, audio): no disponibles; el alcance es OCR.

## Casos de uso

- Digitalizacion de documentos escaneados: usar el pipeline `det` para localizar cajas de texto y `rec` para transcribir su contenido en flujos de ingestion documental.
- Extraccion de texto en capturas de pantalla: aplicar deteccion y reconocimiento sobre imagenes de interfaz para indexar contenido visual.
- Preprocesado para pipelines RAG: convertir PDFs e imagenes en texto antes de la indexacion vectorial, usando las exportaciones ONNX en un servicio de inferencia propio.
- Automatizacion de entrada de datos: transcribir formularios o tickets en ingles o chino y volcar los campos a un sistema posterior.
- Procesamiento en dispositivo: desplegar las exportaciones ONNX en entornos de escritorio, movil o navegador mediante adaptadores compilados propios, dado que el repositorio no incluye servidor de inferencia.
- Verificacion de artefactos en cadena de suministro: consumir el mirror con identidades de fichero fijadas (`publication.json`) para auditar que los pesos desplegados coinciden con los commits de origen de PaddlePaddle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion no verifica precision OCR, fidelidad de cuantizacion, encaje en dispositivo ni aceptacion en escritorio, movil o navegador.

## Requisitos de hardware

- VRAM estimada: no disponible (no se publican parametros ni tamanos de fichero; el repositorio figura con 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exportaciones ONNX para adaptadores compilados propios; el repositorio no incluye servidores de inferencia ni codigo ejecutable. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Es un mirror de artefactos, no un modelo validado: la publicacion verifica identidades de fichero, no precision OCR ni fidelidad de cuantizacion.
- El metadata de idioma (en, zh) no establece calidad probada en ninguno de los dos idiomas.
- El soporte de arabe se declara preferido pero no es criterio de elegibilidad del modelo.
- No se incluye codigo Python, checkpoints en pickle, servidores de inferencia ni codigo ejecutable; el consumidor debe aportar adaptadores compilados propios.
- Los modelos no estan incluidos en el nucleo de Wekala; el consumidor debe suministrar los assets aprobados.
- No se selecciona fallback en la nube.
- Licencia apache-2.0 declarada por los upstream; el fichero `LICENSE` conserva la licencia upstream cuando existe o el texto estandar correspondiente. El codigo del motor y los assets convertidos requieren registros separados.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nile-academy/pp-ocrv6-tiny-onnx
- Upstream deteccion ONNX: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx/tree/2ba1506c0380b8f0b03dd142459aac66d4421f6c
- Upstream reconocimiento ONNX: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx/tree/2612ab37152ae0a677521bae4e1e3d4fb4cf7c30
- Upstream deteccion Paddle: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det/tree/d3177d4e5551463292a61e27cfca2b53e7c3fe9d
- Upstream reconocimiento Paddle: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec/tree/0736086f72f666350ebcdc0c3a504eeac89cdfad
