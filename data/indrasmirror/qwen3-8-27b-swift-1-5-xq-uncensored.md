# IndrasMirror/Qwen3.8-27B-Swift-1.5-XQ-Uncensored

## Resumen

Qwen3.8-27B-Swift-1.5-XQ-Uncensored es una cuantizacion GGUF de tipo XQ (aproximadamente 14 GB) del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario IndrasMirror en Hugging Face. El nombre y las etiquetas indican que se trata de una variante "abliterated" (sin censura) de un modelo derivado de la familia Qwen 3.8 con 27.000 millones de parametros, orientada a tareas de imagen-a-texto segun el pipeline declarado. La model card es practicamente inexistente: el autor indica que el archivo y la documentacion completa "llegaran en unas horas", por lo que no hay datos verificables sobre arquitectura, entrenamiento, contexto o rendimiento.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva. Se trata de un repositorio recien creado (15 de noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, lo que impide cualquier evaluacion empirica. La informacion disponible se reduce a metadatos de Hugging Face: etiquetas, modelo base, licencia declarada y tamano aproximado del archivo de cuantizacion. Todo lo demas debe considerarse no disponible.

Dado que el modelo base (ukisai/Swift-1.5-Qwen3.8-27b) no ha sido documentado en la informacion proporcionada, y que la model card del repositorio derivado esta vacia, esta ficha se limita a reflejar los metadatos y a advertir explicitamente de las lagunas. No se debe asumir ninguna capacidad, contexto o rendimiento que no este respaldado por datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer derivado de Qwen 3.8, sin confirmar) |
| Parametros totales | 27B (segun el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF XQ, archivo de aproximadamente 14 GB (unica cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (declarada como "other" en los metadatos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo. El nombre del repositorio y las etiquetas ("qwen3.8", "swift") apuntan a un transformer derivado de la familia Qwen 3.8 con 27.000 millones de parametros, pero la model card no confirma ni la arquitectura, ni el numero de capas, ni el tipo de atencion, ni si se trata de un modelo denso o de mezcla de expertos. Tampoco se documenta el proceso de cuantizacion XQ aplicado ni los parametros exactos de la misma.

Respecto al entrenamiento, no se dispone de datos sobre el numero de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion. La etiqueta "uncensored" y el termino "abliterated" en el titulo sugieren que se ha aplicado alguna tecnica de eliminacion o supresion de las capas de rechazo del modelo base, pero no se especifica el metodo ni el alcance de la modificacion. El pipeline declarado es "image-text-to-text", lo que implicaria capacidades multimodales, aunque no se aporta ninguna evidencia tecnica al respecto.

## Capacidades

- Generacion de texto: presumiblemente heredada del modelo base, sin confirmar.
- Capacidades multimodales (imagen-a-texto): el pipeline declarado es "image-text-to-text", pero no se documenta el codificador visual ni el formato de entrada admitido.
- Modo "uncensored": el autor indica que el modelo es "abliterated", lo que en la practica implica la supresion de mecanismos de rechazo, sin detallar el metodo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos con rigor, dado que no se ha publicado ninguna evaluacion del modelo. A continuacion se enumeran escenarios teoricos que serian plausibles si el modelo base confirma las capacidades que su nombre sugiere, siempre con la advertencia de que no estan verificados:

- Prototipado local de asistentes multimodales: al ser un GGUF de 14 GB, podria cargarse en estaciones de trabajo con GPU de consumo para experimentar con entrada de imagen y texto, aunque no se ha verificado la calidad de las respuestas.
- Investigacion sobre alineacion y censura: el caracter "abliterated" lo hace util como objeto de estudio para comparar el comportamiento de un modelo con y sin capas de rechazo, siempre que se disponga del modelo base para la comparacion.
- Despliegue en entornos con requisitos de privacidad: al ser un archivo GGUF ejecutable en local mediante llama.cpp u Ollama, permitiria procesar datos sensibles sin salir de la infraestructura propia, si bien la licencia debe revisarse antes de cualquier uso comercial.
- Generacion de descripciones de imagenes en pipelines internos: si se confirma la capacidad image-text-to-text, podria emplearse para etiquetado o accesibilidad, aunque la ausencia de benchmarks impide garantizar la calidad.
- Experimentacion con cuantizaciones extremas: el formato XQ de 14 GB para 27B parametros es una compresion agresiva (aproximadamente 4,1 bits por parametro), interesante para estudiar el equilibrio entre tamano y fidelidad.
- Fine-tuning posterior: al ser un GGUF, no es el formato ideal para reentrenamiento; su uso principal seria la inferencia, no el ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB solo para los pesos en el archivo XQ, mas overhead de contexto y cache KV; en la practica se necesitarian al menos 16-18 GB de VRAM para contextos cortos y mas para contextos largos.
- GPU recomendadas: no hay datos especificos del autor. Por tamano, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) podrian alojar el modelo con contexto moderado; para contextos largos o mayor throughput serian preferibles A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: probablemente en RTX 4090, 3090 y, con limitaciones de contexto, en GPUs de 16 GB mediante offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriria conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables del modelo base ni de alternativas directas en la informacion proporcionada. La siguiente tabla recoge unicamente los datos ciertos del repositorio frente a lo que se desconoce:

| Modelo | Parametros | Contexto | Formato | Licencia | Datos publicados |
|---|---|---|---|---|---|
| Qwen3.8-27B-Swift-1.5-XQ-Uncensored (este) | 27B (segun nombre) | no disponible | GGUF XQ (~14 GB) | swift-open-license-1.0 | Solo metadatos; sin benchmarks |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27B (segun nombre) | no disponible | no disponible | no disponible | No consultado en esta busqueda |
| Alternativas de 27B-30B open source | no disponible | no disponible | no disponible | no disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Model card vacia: el autor indica que la documentacion completa "llegara en unas horas"; en el momento de la consulta no hay especificaciones, benchmarks ni instrucciones de uso.
- Cero validacion empirica: el repositorio tiene 0 descargas y 0 likes, por lo que no existe retroalimentacion de la comunidad.
- Riesgo de alucinacion: desconocido, al no haber evaluaciones publicadas.
- Sesgos conocidos: no documentados; la eliminacion de capas de rechazo ("abliterated") puede aumentar la probabilidad de respuestas toxicas, sesgadas o inseguras, y no se especifica que filtros de seguridad permanecen.
- Capacidad multimodal no verificada: el pipeline "image-text-to-text" se declara en los metadatos, pero no se documenta el codificador visual ni el formato de las entradas.
- Licencia: "swift-open-license-1.0" declarada como "other"; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- Idiomas: no disponibles; no se puede garantizar un rendimiento adecuado en castellano.
- Contexto: no disponible; no se debe asumir una ventana larga sin confirmacion.
- Procedencia: el modelo es una cuantizacion de un modelo base de terceros (ukisai), cuyo entrenamiento y licencia original no estan documentados en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IndrasMirror/Qwen3.8-27B-Swift-1.5-XQ-Uncensored
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
