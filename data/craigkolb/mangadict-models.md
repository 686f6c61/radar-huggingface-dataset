# craigkolb/mangadict-models

## Resumen

mangadict-models es un repositorio de modelos ONNX publicado por el usuario craigkolb que empaqueta los componentes de vision y OCR utilizados por la extension de navegador mangadict. No es un modelo entrenado desde cero: es una recopilacion de pesos ya existentes, reexportados y reorganizados para su ejecucion en el navegador mediante onnxruntime-web. El repositorio contiene un detector de globos de texto y texto libre en paginas de manga, y un sistema de OCR especializado en japones, ademas del vocabulario de caracteres necesario para la decodificacion.

El problema que resuelve es concreto: localizar y leer texto japones dentro de imagenes de manga directamente en el cliente, sin enviar las paginas a un servidor. Para ello, el detector se distribuye como una copia sin modificar de un modelo RT-DETR cuantizado a int8 (ogkalu/comic-text-and-bubble-detector), mientras que el OCR se distribuye como una reexportacion en fp32 con cache de clave-valor de un fine-tune de manga-ocr-base (jzhang533/manga-ocr-base-2025, derivado a su vez de kha-white/manga-ocr-base).

Su relevancia es practica mas que de investigacion: demuestra un patron de despliegue de OCR de manga 100 % en navegador, con un repositorio de apenas 0,2 GB y licencias Apache-2.0 en todas las fuentes. No cuenta con descargas ni interacciones en el momento de redactar esta ficha, y no se ha publicado informacion de parametros, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector: RT-DETR (transformer de deteccion). OCR: transformer encoder-decoder con cross-attention y cache KV (encoder imagen a features, decoder por pasos) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Detector: int8. OCR: fp32 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Componentes incluidos | `detector/v4-s_int8.onnx`, `ocr-2025-kv/encoder.onnx`, `ocr-2025-kv/cross.onnx`, `ocr-2025-kv/step.onnx`, `ocr-2025-kv/config.json`, `ocr-2025/vocab.txt` |
| Clases del detector | bubble, text_bubble, text_free |
| Revisiones | etiquetadas (por ejemplo `v1`); `main` puede cambiar |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio. El detector es una copia sin modificar de `detector-v4-s_int8.onnx` procedente de ogkalu/comic-text-and-bubble-detector, un modelo RT-DETR cuantizado a int8 que clasifica regiones en tres categorias: globo de dialogo (bubble), texto dentro de globo (text_bubble) y texto libre (text_free). Al ser una copia literal, la informacion de entrenamiento corresponde al repositorio de origen, no a este.

El componente de OCR es una reexportacion en fp32 de jzhang533/manga-ocr-base-2025, un fine-tune de kha-white/manga-ocr-base, reorganizada en tres grafos ONNX que implementan decodificacion autorregresiva con cache: `encoder` transforma la imagen en caracteristicas, `cross` precalcula las claves y valores de cross-attention por imagen y `step` ejecuta un paso de decodificador tomando el token previo mas la cache y devolviendo los logits y la cache actualizada. La model card indica que la decodificacion greedy reproduce el comportamiento del modelo original. El vocabulario de caracteres (`ocr-2025/vocab.txt`) es compartido entre la version base y la de 2025. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Deteccion de regiones de texto en paginas de manga con tres clases diferenciadas (globo, texto en globo y texto libre).
- OCR de texto japones sobre recortes de imagen, con decodificacion autorregresiva y cache KV para eficiencia en inferencia por pasos.
- Ejecucion en navegador mediante onnxruntime-web, sin backend servidor.
- Reutilizacion fuera del navegador como modelos ONNX estandar a traves de ONNX Runtime u otros runtimes compatibles.
- Segmentacion auxiliar para pipelines de traduccion o diccionario: el detector separa texto de burbuja frente a texto libre, lo que permite tratar de forma distinta rotulos y dialogos.
- Soporte de vocabulario japones compartido entre las variantes base y 2025 del OCR.
- No se documenta soporte de tool calling, function calling, agentes, modo de razonamiento, vision general (mas alla del recorte de texto), audio ni capacidades multilingues fuera del japones.

## Casos de uso

- Extension de navegador para lectura de manga: el flujo natural del repositorio; el detector localiza burbujas y el OCR extrae el japones para consultar un diccionario, todo en el cliente y sin subir imagenes a un servidor.
- Traduccion asistida de manga en tiempo real: encadenar deteccion, recorte y OCR permite alimentar un traductor externo solo con cadenas de texto, reduciendo el coste de ancho de banda y las preocupaciones de privacidad.
- Digitalizacion y archivado de colecciones escaneadas: procesar paginas por lotes con ONNX Runtime en local para generar transcripciones de texto japones indexables.
- Alimentacion de corpus para estudios linguisticos: extraer texto de tomos completos para analisis de frecuencia lexica, variacion dialectal o vocabulario especializado.
- Anotacion semiautomatica de datasets de manga: usar el detector como preanotador de cajas (clases bubble, text_bubble, text_free) y el OCR como propuesta inicial de transcripcion, con revision humana posterior.
- Preprocesado para pipelines de vision-lenguaje: generar pares imagen-texto orientados a japones que sirvan como entrada a modelos multimodales mayores.
- Aplicaciones de accesibilidad: lectura en voz alta de dialogos de manga para usuarios con dificultades visuales, ejecutando todo el pipeline en el dispositivo.
- Herramientas de aprendizaje de japones: resaltado de kanji y consulta de lecturas sobre la marcha, apoyandose en el vocabulario de caracteres incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al estar disenados para onnxruntime-web, los modelos estan pensados para ejecucion en navegador sobre CPU (WASM) y potencialmente aceleracion por GPU del cliente via WebGPU/WebGL, aunque la model card no especifica backend concreto.
- La VRAM estimada para inferencia no esta disponible; el repositorio completo ocupa 0,2 GB, y el detector va cuantizado a int8, lo que reduce su huella.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la informacion proporcionada.
- Cabe esperar que quepa en GPU de consumo e incluso en ejecucion exclusiva por CPU, dado el enfoque de navegador, pero no se aportan cifras verificadas.
- Opciones de despliegue: onnxruntime-web en navegador, ONNX Runtime en servidor o escritorio, y cualquier runtime compatible con ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| craigkolb/mangadict-models | Detector RT-DETR int8 + OCR ONNX con cache KV | no disponible | no disponible | Apache-2.0 | HuggingFace (ONNX) |
| kha-white/manga-ocr-base | OCR japones (modelo base original) | no disponible | no disponible | Apache-2.0 | HuggingFace |
| jzhang533/manga-ocr-base-2025 | Fine-tune de manga-ocr-base | no disponible | no disponible | Apache-2.0 | HuggingFace |
| ogkalu/comic-text-and-bubble-detector | Deteccion de texto y globos en comics (RT-DETR) | no disponible | no disponible | Apache-2.0 | HuggingFace |

Los tres modelos de referencia son las fuentes directas de los componentes empaquetados, de modo que la comparativa se reduce a formato, empaquetado y orientacion de despliegue mas que a calidad del modelo. No se dispone de cifras de rendimiento comparadas.

## Limitaciones y advertencias

- El repositorio no entrena nada: cualquier sesgo o limitacion del detector y del OCR proviene de sus modelos de origen (ogkalu/comic-text-and-bubble-detector, jzhang533/manga-ocr-base-2025 y kha-white/manga-ocr-base), cuyas model cards conviene consultar.
- Idioma limitado al japones; no hay soporte declarado de otras lenguas.
- Orientado a texto presente en manga: el rendimiento en documentos, fotografias o tipografias no propias del medio no esta garantizado ni documentado.
- El OCR puede fallar con texto vertical, caligrafia estilizada, furigana pequeno, onomatopeyas o texto sobre fondos ruidosos, casos frecuentes en manga.
- La decodificacion es greedy segun la model card; no se describen estrategias de muestreo alternativas en los grafos exportados.
- Riesgo de alucinacion o transcripcion incorrecta de caracteres, especialmente en recortes de baja resolucion o con artefactos de compresion.
- El repositorio no aporta benchmarks, por lo que no es posible cuantificar la calidad frente a alternativas.
- La model card recomienda usar revisiones etiquetadas (por ejemplo `v1`) porque `main` puede cambiar sin aviso; en produccion conviene fijar una revision concreta.
- Licencia Apache-2.0 en los componentes citados, lo que permite uso comercial, pero se debe verificar que cada repositorio de origen mantenga esa licencia y atribuir correctamente.
- Repositorio sin descargas ni interacciones registradas en el momento de la ficha, lo que implica ausencia de validacion comunitaria publica.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/craigkolb/mangadict-models
- Fuente del detector: https://huggingface.co/ogkalu/comic-text-and-bubble-detector
- Fuente del OCR (fine-tune 2025): https://huggingface.co/jzhang533/manga-ocr-base-2025
- Fuente del OCR base: https://huggingface.co/kha-white/manga-ocr-base
- Repositorio de referencia de manga-ocr (no verificado en la busqueda): no disponible
- Papers, blogs o demos adicionales: no disponible
