# cookieshake/DNA3.1-27B-oQ2

## Resumen

DNA3.1-27B-oQ2 es una cuantizacion de 2 bits del modelo base dnotitia/DNA3.1-27B, publicada por el usuario cookieshake en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales en BF16 a un formato cuantizado de precision mixta mediante la herramienta oMLX 0.7.3, orientada a su ejecucion en hardware Apple Silicon a traves del framework MLX. El resultado ocupa aproximadamente 11,5 GB en disco frente a los mas de 50 GB que requeriria el modelo en BF16.

El modelo hereda la arquitectura del original, etiquetada como qwen3_5 en los metadatos del repositorio, con 27.356.728.560 parametros totales. La cuantizacion emplea un esquema afin con tamano de grupo 64, precision base de 2 bits y sobrescrituras de precision mixta: 252 tensores a 3 bits y 49 tensores a 5 bits, lo que da una media efectiva de aproximadamente 3,3685 bits por parametro original. La licencia declarada es Apache-2.0, heredada del modelo fuente.

Su relevancia es practica: permite ejecutar un modelo de 27B en equipos Apple Silicon con memoria unificada moderada, a costa de una perdida de calidad dificil de cuantificar porque el autor solo aporta pruebas de humo muy limitadas. Es un artefacto de despliegue, no una contribucion cientifica, y su utilidad depende enteramente de que el modelo base sea adecuado para la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5 en metadatos; detalles no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2 de oMLX: base 2 bits, grupo 64, afin; mixta con 252 tensores a 3 bits y 49 a 5 bits; ~3,3685 bits efectivos por parametro |
| Idiomas soportados | no disponible (etiqueta korean; el modelo base no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, 2.180 entradas en el indice), config de oMLX/MLX |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: se desconoce el numero de tokens, la composicion del dataset, si hubo RLHF, DPO u otras etapas de alineamiento, y los detalles internos de la arquitectura mas alla de la etiqueta qwen3_5. El repositorio es exclusivamente una conversion de pesos: el autor indica que los pesos se convirtieron directamente desde el snapshot BF16 fijado en la revision aee853444ef2d1d1fe2fa56e4c2073d8f393b139, y que no se trata de un modelo 4 bits desconectado y recuantizado.

La innovacion tecnica del artefacto es el esquema de cuantizacion oQ de oMLX: cuantizacion afin por grupos de 64 elementos con una base agresiva de 2 bits, compensada con sobrescrituras selectivas a 3 y 5 bits en 301 tensores considerados sensibles. El resultado son 11,5 GB de pesos para 27,36B parametros. La validacion realizada por el autor se limita a comprobar la integridad de los shards y del indice, y a dos pruebas de humo: una pregunta factual y aritmetica en coreano que exigia el formato exacto "서울, 5" devolvio exactamente "서울, 5"; una segunda prueba de seguimiento estricto de formato incluyo la cadena solicitada pero anadio texto explicativo, por lo que el cumplimiento estricto de formato no esta garantizado. El propio autor advierte que no es una evaluacion amplia de calidad y que la reproducibilidad bit a bit no esta garantizada entre entornos.

## Capacidades

- Generacion de texto y respuesta a preguntas factuales y aritmeticas basicas, segun la prueba de humo incluida.
- Razonamiento y codigo: capacidades heredadas del modelo base, no verificadas en esta cuantizacion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Multilingue: el autor etiqueta el modelo como korean y realiza la validacion en coreano; no se declara lista de idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion en Apple Silicon mediante MLX a traves del runtime oMLX.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con oMLX en un equipo Apple Silicon para experimentar con un modelo de 27B sin depender de servicios en la nube, aprovechando los 11,5 GB de pesos cuantizados.
- Procesamiento de texto en coreano: generar y transformar contenido en coreano en local, dado que la validacion del autor se realizo en ese idioma, aceptando que la calidad no esta evaluada de forma amplia.
- Asistentes de escritorio offline: integrar el modelo en aplicaciones nativas de macOS que requieran inferencia sin conexion y con requisitos de memoria ajustados.
- Tareas de extraccion y formato estructurado: usar el modelo para rellenar plantillas o responder con formatos concretos, con la advertencia de que el seguimiento estricto de formato no esta garantizado y requiere validacion posterior.
- Evaluacion comparativa de cuantizaciones: emplear este oQ2 como referencia para medir la degradacion frente al modelo base BF16 en tareas concretas antes de comprometerse con un despliegue.
- Educacion e investigacion: estudiar el comportamiento de un modelo de 27B bajo una cuantizacion de ~3,37 bits efectivos en entornos con memoria unificada limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta dos pruebas de humo cualitativas y no aporta metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos suman 11,5 GB; con overhead de runtime, cache KV y contexto, es razonable reservar entre 14 y 20 GB, aunque la cifra exacta no esta publicada.
- Hardware objetivo: Apple Silicon con MLX; el autor indica explicitamente que se requiere un entorno Apple Silicon compatible con MLX y una version compatible de oMLX.
- GPU NVIDIA: no es el objetivo declarado; el formato oMLX/MLX no esta pensado para CUDA, por lo que A100, H100 o RTX 4090 no son plataformas soportadas por este artefacto.
- Consumer GPU: no aplica en el sentido habitual; el equivalente consumer es un Mac con memoria unificada suficiente (orientativamente 16 GB o mas, sin confirmacion oficial).
- Opciones de despliegue: runtime oMLX (version compatible con la conversion, generada con oMLX 0.7.3). vLLM, llama.cpp, Ollama y TGI no estan indicados como soportados para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-oQ2 | 27,36B | no disponible | oQ2 MLX (~3,37 bits efectivos) | Apache-2.0 | Apple Silicon (MLX) |
| dnotitia/DNA3.1-27B (base) | 27,36B | no disponible | BF16 | Apache-2.0 | Generica |
| Otras cuantizaciones del mismo base | 27,36B | no disponible | no disponible | Apache-2.0 (heredada) | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La cuantizacion a ~3,37 bits efectivos implica una degradacion de calidad no medida; el autor no aporta evaluacion amplia y recomienda tratar las pruebas de humo como insuficientes.
- El seguimiento estricto de formato no esta garantizado: una de las dos pruebas anadio texto explicativo no solicitado.
- Riesgo de alucinacion: inherente al modelo base y potencialmente agravado por la cuantizacion agresiva; no cuantificado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas: solo se valida en coreano; el resto de idiomas no esta verificado y la lista oficial no esta disponible.
- Longitud de contexto: no documentada, lo que impide planificar cargas con contextos largos.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.
- Dependencia de plataforma: requiere Apple Silicon y una version compatible de oMLX; no es portable a CUDA sin otra conversion.
- Reproducibilidad: el autor no garantiza resultados identicos entre entornos de hardware y software distintos.
- Popularidad muy baja (27 descargas, 0 likes) y creado y actualizado el mismo dia, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo cuantizado: https://huggingface.co/cookieshake/DNA3.1-27B-oQ2
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- Revision del modelo base usada en la conversion: https://huggingface.co/dnotitia/DNA3.1-27B/tree/aee853444ef2d1d1fe2fa56e4c2073d8f393b139
