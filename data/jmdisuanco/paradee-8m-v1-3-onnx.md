# jmdisuanco/paradee-8m-v1.3-onnx

## Resumen

Paradee-8M v1.3 es un modelo de síntesis de voz (text-to-speech) de muy pequeño tamano, con aproximadamente 8 millones de parametros, destilado a partir de Kokoro-82M de hexgrad. El modelo original fue desarrollado por Sahil Mahendrakar y esta publicado bajo licencia Apache-2.0. El repositorio aqui descrito es un espejo no modificado, creado por jmdisuanco para el gestor de modelos de myPlinx, con el fin de disponer de una segunda fuente en caso de que el repositorio original sea eliminado, renombrado o restringido.

La relevancia de este modelo radica en su reducido tamano y en su empaquetado en formato ONNX con cuantizacion int8, lo que lo hace adecuado para inferencia en entornos con recursos limitados, como aplicaciones de escritorio, navegador o dispositivos embebidos. El fichero ONNX ocupa 8.462.503 bytes (aproximadamente 8,5 MB), lo que permite su despliegue sin necesidad de GPU dedicada.

La informacion disponible es limitada: el repositorio no incluye una model card tecnica detallada sobre arquitectura, datos de entrenamiento ni benchmarks. Los datos aqui recogidos proceden exclusivamente del README del espejo y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS destilado de Kokoro-82M) |
| Parametros totales | aproximadamente 8 millones (segun el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `paradee_int8.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/paradee_int8.onnx`) y `config.json` |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El nombre y la model card indican que Paradee-8M v1.3 es un modelo de texto a voz destilado de Kokoro-82M, desarrollado por Sahil Mahendrakar. La destilacion implica que un modelo de menor tamano (8M) aprende a aproximar el comportamiento de uno mayor (82M), lo que reduce coste computacional y tamano de almacenamiento a costa de cierta perdida de calidad, aunque no se especifica el grado de esa perdida.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El unico artefacto de inferencia disponible es un fichero ONNX cuantizado a int8, acompanado de un `config.json` de 2.103 bytes. No se ha publicado informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada, segun el pipeline declarado `text-to-speech`.
- Inferencia mediante ONNX Runtime, lo que permite ejecucion en CPU y en multiples plataformas sin dependencias de frameworks de deep learning completos.
- Modelo de muy bajo consumo de recursos (fichero de aproximadamente 8,5 MB), apto para entornos con memoria limitada.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento.
- No se dispone de informacion sobre capacidades multilingues ni sobre voces o estilos disponibles.

## Casos de uso

- Lectura de texto en aplicaciones de escritorio: el modelo puede integrarse mediante ONNX Runtime para convertir texto en voz en herramientas de accesibilidad, dada su baja huella de memoria y su formato portable.
- Asistentes de voz embebidos: por su tamano reducido, es candidato para dispositivos con recursos limitados donde no cabe un modelo TTS de mayor tamano, siempre que la calidad de la destilacion sea suficiente para el caso de uso.
- Generacion de avisos hablados en sistemas de monitorizacion: permite sintetizar mensajes cortos en local sin depender de servicios en la nube.
- Prototipado rapido de interfaces de voz: al ser un fichero ONNX unico con configuracion, se puede cargar en un pipeline de prueba para validar la integracion antes de optar por un modelo mayor.
- Aplicaciones web del lado del cliente: la cuantizacion int8 y el formato ONNX facilitan su ejecucion en navegador mediante ONNX Runtime Web, aunque no se ha verificado el rendimiento en ese entorno en la informacion disponible.
- Redundancia en produccion: al ser un espejo byte a byte del modelo original, sirve como fuente alternativa en pipelines que necesitan descargar el modelo desde un repositorio estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del fichero (aproximadamente 8,5 MB) la inferencia en CPU es viable.
- GPU recomendadas: no disponible; no se requiere GPU para un modelo de este tamano en la mayoria de escenarios.
- Cabida en GPU de consumo: si, cualquier GPU de consumo puede alojarlo, e incluso la ejecucion en CPU es una opcion realista.
- Opciones de despliegue: ONNX Runtime (incluida la variante web); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Paradee-8M v1.3 (este) | aproximadamente 8M | no disponible | Apache-2.0 | ONNX int8 | Destilado de Kokoro-82M |
| Kokoro-82M | 82M | no disponible | Apache-2.0 | no disponible en esta ficha | Modelo origen de la destilacion |
| Alternativas TTS de menor tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La unica comparacion documentada es con Kokoro-82M, del que Paradee-8M deriva por destilacion; no se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion tecnica publicada es muy escasa: no hay datos de arquitectura, dataset, idiomas ni evaluacion, lo que dificulta valorar su calidad antes de integrarlo.
- Al ser un modelo destilado de uno mayor, es esperable una perdida de calidad respecto a Kokoro-82M, aunque no se cuantifica en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto, pero si puede producir pronunciaciones incorrectas o artefactos de audio; no se documenta su comportamiento.
- No se especifican los idiomas soportados, por lo que no se puede garantizar su uso en castellano ni en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia original incluido en el repositorio.
- Este repositorio es un espejo no oficial; la fuente de verdad es el repositorio upstream de sahilmahendrakar, y cualquier actualizacion o correccion provendra de alli.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/jmdisuanco/paradee-8m-v1.3-onnx
- Repositorio upstream: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Modelo origen de la destilacion (Kokoro-82M): https://huggingface.co/hexgrad/Kokoro-82M
