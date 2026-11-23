# richardyoung/Qwen3.8-27B-SOM-heretic-GGUF

## Resumen

Qwen3.8-27B-SOM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.8-27B-SOM-heretic, publicada por el usuario richardyoung en Hugging Face. Se trata de un derivado de la familia Qwen3 con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones), adaptado mediante tecnicas de "abliteration" y "heretic" para eliminar o reducir los mecanismos de rechazo y moderacion del modelo original, orientandolo a investigacion sobre alineamiento y comportamiento de modelos sin censura. El repositorio esta etiquetado como gated (acceso restringido) y requiere aceptar condiciones en Hugging Face antes de la descarga.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de gran tamano (27B) en formato GGUF listo para llama.cpp y Ollama, un proceso de modificacion de pesos orientado a eliminar negativas de seguridad, y una licencia Apache 2.0 que permite uso comercial. El modelo esta pensado para experimentacion e investigacion, no como sustituto directo de un modelo alineado en produccion. La informacion publica disponible es limitada: no se detallan los datos de entrenamiento, los benchmarks ni la composicion exacta del proceso de abliteration.

El contexto de 27B y el formato GGUF con cuantizaciones imatrix lo situan en la categoria de modelos desplegables en una sola GPU de gama alta o en configuraciones multi-GPU de consumo. El idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de la familia Qwen3; detalles exactos de la variante no disponibles) |
| Parametros totales | 26.895.998.464 (aprox. 26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones tipo imatrix (variantes concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base es richardyoung/Qwen3.8-27B-SOM-heretic, un derivado de la familia Qwen3 de aproximadamente 26,9 mil millones de parametros. La informacion disponible no especifica la arquitectura interna exacta (numero de capas, dimension del modelo, tipo de atencion ni si incorpora componentes MoE), por lo que estos datos deben considerarse no disponibles. Por el nombre y el tamano, se trata presumiblemente de un transformer decoder-only denso, coherente con la familia Qwen3.

El aspecto diferencial es el proceso de modificacion de pesos: las etiquetas "heretic" y "abliterated" indican que se ha aplicado una tecnica de abliteration, que consiste en identificar y neutralizar las direcciones de activacion asociadas al rechazo de peticiones, de forma que el modelo deja de negarse a responder a ciertos contenidos. El sufijo "SOM" no se explica en la informacion proporcionada. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO posteriores a la modificacion. La cuantizacion GGUF se ha generado con imatrix, un metodo que calibra los factores de cuantizacion usando datos representativos para reducir la perdida de calidad en precisiones bajas.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento y respuesta a preguntas derivados del modelo base Qwen3 (capacidades exactas no verificadas en la informacion disponible).
- Generacion de codigo y matematicas heredadas del modelo base, sin datos de benchmark publicados que lo confirmen.
- Comportamiento sin censura: el proceso de abliteration reduce las negativas a responder, lo que cambia el perfil de comportamiento respecto al modelo original.
- Compatibilidad con llama.cpp y Ollama, lo que permite inferencia local en CPU y GPU.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como cambia el comportamiento de un LLM al eliminar los mecanismos de rechazo, comparando respuestas con el modelo base original en conjuntos de prompts controlados.
- Analisis de robustez de filtros: util para evaluar si los sistemas de moderacion externos detectan contenido generado por un modelo abliterated, midiendo la eficacia de clasificadores de seguridad aguas abajo.
- Experimentacion local con modelos de 27B: gracias al formato GGUF e imatrix, se puede ejecutar en estaciones de trabajo con una o varias GPU de consumo, sin depender de APIs externas, para pruebas de generacion de texto a gran escala.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, en un entorno controlado y con revision humana posterior.
- Evaluacion de cuantizaciones: el repositorio sirve para comparar la calidad de distintas variantes GGUF imatrix frente al modelo en precision completa, midiendo perplejidad y coherencia en tareas de generacion.
- Docencia y divulgacion tecnica: demostraciones sobre que es la abliteration y como se modifica el comportamiento de un modelo, usando el modelo como ejemplo practico en cursos de IA.
- Prototipado de asistentes conversacionales en ingles: para pruebas internas de dialogo multi-turno donde no se requiera alineamiento estricto y se acepte el riesgo de respuestas no filtradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion Q4_K_M, aproximadamente 16-18 GB para los pesos, mas overhead de contexto; en Q8_0, alrededor de 28-30 GB; en FP16, unos 54 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4 y Q5 con contexto moderado; para Q8 o contexto largo se recomienda A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 y GPUs con 24 GB o mas usando cuantizaciones bajas; en GPUs de 16 GB solo con cuantizaciones agresivas (Q3 o inferiores) y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de llama.cpp; no se indica soporte nativo para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-SOM-heretic-GGUF | 26,9B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, gated |
| Qwen3-32B (original) | 32B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia de la familia Qwen3 |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Menor tamano, multilingue, alineado |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | safetensors, GGUF | Tamano comparable, multilingue |

La comparacion con el Qwen3-32B original es la mas directa por familia y tamano, pero no se dispone de datos de rendimiento del modelo heretic para establecer diferencias cuantitativas. Frente a Llama 3.1 8B y Mistral Small 24B, el modelo aqui descrito ofrece mayor numero de parametros pero carece de soporte multilingue declarado y de alineamiento de seguridad.

## Limitaciones y advertencias

- Modelo abliterated: el proceso de eliminacion de rechazos puede degradar la coherencia en tareas que requieren juicio etico o matices, y aumenta el riesgo de generar contenido danino, sesgado o ilegal.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un derivado modificado, la fiabilidad factual puede diferir del modelo base.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin alineamiento.
- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas en pipelines.
- Falta de documentacion: no hay model card detallada, ni datos de entrenamiento, ni benchmarks, lo que dificulta la evaluacion rigurosa antes de produccion.
- Procedencia: el autor es un particular, no el equipo oficial de Qwen; la calidad de la modificacion y de las cuantizaciones no esta avalada por el desarrollador original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen3.8-27B-SOM-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-SOM-heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Familia Qwen3 (referencia): https://huggingface.co/Qwen
