# com-kotobalabs/Qwen3.8-27B-whitehat-NVFP4

## Resumen

El modelo `com-kotobalabs/Qwen3.8-27B-whitehat-NVFP4` es una version derivada y cuantizada de `Qwen/Qwen3.8-27B`, publicada por el usuario `com-kotobalabs` en HuggingFace. Se presenta como un modelo multimodal de tipo image-text-to-text, es decir, capaz de procesar imagenes y texto de forma conjunta, con 27.356.728.560 parametros totales y un repositorio de 19,8 GB en formato safetensors.

La ficha del repositorio lo etiqueta explicitamente como "abliterated" y "uncensored", ademas de incluir las etiquetas `security-research` y `red-team`. Esto sitúa la publicacion en el ambito de los modelos con los mecanismos de rechazo eliminados o atenuados, orientados a investigacion de seguridad, pruebas de robustez y ejercicios de equipo rojo, mas que a despliegues de produccion convencionales.

El nombre indica cuantizacion NVFP4 y la etiqueta del repositorio menciona `compressed-tensors` y `8-bit`, una discrepancia que conviene verificar antes de usarlo. El acceso esta restringido en HuggingFace, aunque los metadatos declaran licencia Apache-2.0. No hay informacion publicada sobre composicion del dataset, idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text); etiqueta de arquitectura `qwen3_5` en HuggingFace |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 segun el nombre del modelo, con `compressed-tensors`; la etiqueta del repositorio indica `8-bit`. No se documentan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (metadatos), con acceso restringido/gated en HuggingFace |
| Formato de pesos | Safetensors (con `compressed-tensors`) |
| Modelo base | Qwen/Qwen3.8-27B |
| Modalidades de entrada | Imagen y texto |
| Tamano del repositorio | 19,8 GB |
| Libreria de inferencia declarada | Transformers |
| Fecha de publicacion | 17 de septiembre de 2026 |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |
| Acceso | Restringido: requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `qwen3_5` de HuggingFace y el pipeline declarado `image-text-to-text`, lo que indica un transformer multimodal con torre de vision y componente de lenguaje capaz de aceptar entradas de imagen y texto. El parametro total de 27.356.728.560 corresponde a un modelo denso de aproximadamente 27,36 mil millones de parametros; no hay indicios de que se trate de una arquitectura de mezcla de expertos (MoE).

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento del modelo base `Qwen/Qwen3.8-27B`. La unica innovacion tecnica identificable es la cuantizacion a NVFP4 mediante `compressed-tensors`, un formato de 4 bits con escalas de precision reducida por bloques, que reduce el peso en memoria frente a FP16. La ficha incluye una referencia a `arxiv:2406.11717`, pero el contenido de ese trabajo no forma parte de la informacion proporcionada. La naturaleza "abliterated" implica la modificacion de direcciones de activacion internas para suprimir el comportamiento de rechazo, un proceso de post-entrenamiento que no se detalla.

## Capacidades

- Generacion de texto conversacional en formato multiturno, segun la etiqueta `conversational`.
- Procesamiento conjunto de imagen y texto (image-text-to-text), lo que habilita descripcion de imagenes y preguntas y respuestas sobre contenido visual.
- Inferencia cuantizada a NVFP4/8 bits mediante `compressed-tensors`, compatible con el ecosistema de Transformers.
- Comportamiento sin filtros de rechazo (abliterated/uncensored) para investigacion de seguridad.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion de seguridad y red teaming: el modelo permite generar respuestas que un modelo alineado rechazaria, lo que sirve para construir conjuntos de datos de ataques, evaluar clasificadores de contenido y medir la robustez de filtros de moderacion.
- Evaluacion de tecnicas de abliteration: al ser una variante abliterated, permite comparar contra el modelo base `Qwen/Qwen3.8-27B` para cuantificar cuanto se degrada la calidad y cuanto se reduce la tasa de rechazos.
- Analisis de contenido visual sin restricciones: la entrada image-text-to-text admite casos donde el modelo de referencia bloquea el analisis de imagenes sensibles, como revision forense de material o documentacion tecnica restringida.
- Pruebas de cuantizacion NVFP4: sirve como banco de pruebas para medir la perdida de calidad al pasar de precision completa a 4 bits en un modelo de 27B con componente de vision, en comparacion con el checkpoint sin cuantizar.
- Auditoria de sesgos y de seguridad de modelos derivados: la variante permite estudiar que contenidos emergen cuando se retiran los mecanismos de rechazo, un dato relevante para quien disena politicas de uso.
- Generacion de texto conversacional en entornos controlados y aislados: con 27,36 mil millones de parametros y pesos de 4 bits, es viable desplegarlo en una GPU de gama alta para experimentacion interna con acceso restringido.
- Investigacion academica sobre robustez de modelos multimodales: analisis de como se comporta la torre de vision cuando el modulo de lenguaje ha sido modificado para eliminar rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones aritmeticas derivadas del recuento de parametros (27.356.728.560) y del tamano del repositorio, no datos publicados por el autor.

- VRAM estimada para los pesos en NVFP4 (4 bits): en torno a 14-15 GB considerando las escalas por bloque; el repositorio ocupa 19,8 GB, lo que sugiere precision mixta en algunas capas (embeddings, torre de vision o cabezales).
- VRAM estimada si se carga en 8 bits: aproximadamente 27,4 GB solo para pesos. En FP16/BF16 serian unos 54,7 GB.
- A la VRAM de pesos hay que sumar la cache KV y los buffers de activacion; su tamano depende del numero de capas, cabezas y de la longitud de contexto, datos no disponibles.
- GPU recomendadas: para NVFP4 el soporte nativo esta en la generacion Blackwell (B200, RTX 5090 y similares). En generaciones anteriores (A100, H100) la cuantizacion NVFP4 no cuenta con aceleracion nativa y el rendimiento puede degradarse o requerir conversion.
- GPU de consumo: con pesos de ~14-20 GB, es plausible ejecutarlo en tarjetas con 24 GB de VRAM (RTX 4090, RTX 3090) si el motor de inferencia soporta el formato y se ajusta la longitud de contexto; el margen es estrecho por la cache KV y el procesamiento de imagenes.
- Multi-GPU: para precision completa o contextos largos seria necesario repartir el modelo en varias GPU (2x A100 40 GB o superior).
- Opciones de despliegue: Transformers con `compressed-tensors` es la ruta documentada en la ficha; vLLM y TensorRT-LLM son los candidatos naturales para NVFP4 en hardware Blackwell, aunque no se confirma compatibilidad en la informacion disponible. llama.cpp/Ollama requeririan conversion a GGUF, que no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de rendimiento que permitan una comparacion cuantitativa. La comparacion estructural es la siguiente:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen3.8-27B-whitehat-NVFP4 | 27,36 mil millones | No disponible | NVFP4 / 8 bits | Apache-2.0 (gated) | Restringido |
| Qwen/Qwen3.8-27B (base) | 27,36 mil millones (segun este derivado) | No disponible | Precision completa | No disponible en la informacion proporcionada | No disponible |
| Otras variantes abliterated de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos alternativos comparables de la misma categoria (abliterated multimodales de ~27B) en el material proporcionado.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: los mecanismos de rechazo han sido suprimidos, por lo que puede generar contenido danino, ilegal o inseguro sin advertir al usuario. No es apto para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones publicadas que cuantifiquen la fidelidad factual, y el proceso de abliteration puede degradar capacidades de razonamiento y coherencia.
- Discrepancia en la cuantizacion: el nombre indica NVFP4 (4 bits) mientras la etiqueta del repositorio indica `8-bit`. Conviene verificar los archivos de configuracion antes de planificar el despliegue.
- Idiomas soportados: no disponibles; se desconoce el comportamiento fuera de los idiomas mayoritarios del modelo base.
- Longitud de contexto: no disponible, lo que impide dimensionar la cache KV y planificar cargas con documentos largos.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que anade una dependencia operativa para automatizar descargas.
- Licencia: los metadatos declaran Apache-2.0, pero el acceso gated puede imponer condiciones adicionales. Verifique los terminos aceptados antes de un uso comercial.
- Ausencia de validacion de la comunidad: 0 descargas y 1 like en el momento de la consulta implican que el checkpoint no ha sido reproducido ni auditado de forma independiente.
- No se documenta el tratamiento de datos de imagen, privacidad ni el origen del corpus de entrenamiento.
- Fecha de publicacion futura respecto a la informacion de referencia, lo que limita la verificacion cruzada de los datos tecnicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/com-kotobalabs/Qwen3.8-27B-whitehat-NVFP4
- Modelo base: Qwen/Qwen3.8-27B (referenciado en los metadatos; sin URL confirmada en la informacion proporcionada)
- Referencia arXiv citada en las etiquetas: arxiv:2406.11717 (contenido no disponible en la informacion proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
