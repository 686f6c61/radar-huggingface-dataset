# mdagosta/waldito-smoke-v1-r0002-u0-mdagosta-b

## Resumen

OpenWALDO model export (identificador `mdagosta/waldito-smoke-v1-r0002-u0-mdagosta-b`) es un checkpoint de generacion de texto publicado por el usuario mdagosta (Michael D'Agosta) en Hugging Face. Segun la propia model card, el paquete emplea la arquitectura causal-language-model estandar de Llama de la libreria Transformers, pero sustituye el tokenizador habitual por el tokenizador de bytes "schema-1" de OpenWALDO, que debe cargarse con `trust_remote_code=True`. El repositorio incluye ademas un fichero `BOM.json` con el inventario de ficheros de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de GPAI.

El dato mas relevante es su tamano: 820.736 parametros totales, es decir, menos de un millon de parametros. Esto lo situa muy lejos de un modelo de proposito general y lo acerca a un artefacto de validacion experimental, coherente con el sufijo "smoke-v1" (prueba de humo de un pipeline de entrenamiento o de publicacion). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el contexto maximo ni la licencia.

Su relevancia actual es, por tanto, instrumental mas que funcional: sirve como ejemplo de publicacion reproducible con inventario BOM y divulgacion de contenido de entrenamiento, y como caso de prueba para infraestructura de despliegue (transformers, text-generation-inference, endpoints compatibles) con un coste de computo minimo. No debe confundirse con un modelo utilizable en produccion para tareas reales de generacion, razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (causal-language-model estandar de Transformers) |
| Parametros totales | 820.736 (dato real de los pesos en safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no hay GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Tokenizador de bytes "schema-1" de OpenWALDO, requiere `trust_remote_code=True` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 127 / 0 |
| Fecha de creacion | 2026-09-30 |
| Fecha de ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica unicamente que el paquete usa "the standard Transformers Llama causal-language-model architecture" junto con el tokenizador de bytes schema-1 de OpenWALDO. No se especifica el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de normalizacion, la posicion de las activaciones (RoPE u otras) ni si se emplean variantes como GQA, atencion lineal o mezclas de expertos. Con 820.736 parametros, cualquier configuracion compatible con la clase Llama causal LM de Transformers es tecnicamente posible, pero no hay confirmacion en la informacion disponible.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, y si se aplicaron tecnicas de destilacion o decodificacion especulativa. La unica innovacion tecnica documentada es el uso de un tokenizador de bytes propio en lugar de un vocabulario BPE o SentencePiece convencional, junto con la inclusion de artefactos de trazabilidad (`BOM.json` y `EU-BOM.json`) orientados a la divulgacion regulatoria de contenido de entrenamiento en el marco europeo de modelos de IA de proposito general.

## Capacidades

- Generacion de texto causal basica, limitada por el tamano del modelo (820.736 parametros) y sin datos publicados sobre calidad.
- Conversacion multi-turno nominal: el tag `conversational` esta presente en el repositorio, pero no hay informacion sobre plantilla de chat ni formato de turnos.
- Manejo de texto a nivel de byte: el tokenizador schema-1 opera sobre bytes, lo que en principio permite representar cualquier secuencia de bytes sin tokens fuera de vocabulario, aunque no implica competencia multilingue real.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad de despliegue declarada: transformers, text-generation-inference y endpoints compatibles.

## Casos de uso

- Prueba de humo de pipelines de publicacion en Hugging Face: el modelo permite validar de extremo a extremo el flujo de subida, generacion de safetensors, carga con `trust_remote_code=True` y servido con text-generation-inference sin consumir recursos apreciables.
- Validacion de tokenizadores de bytes en produccion: sirve para comprobar la integracion de un tokenizador schema-1 personalizado en cadenas de preprocesado, decodificacion y calculo de metricas, ya que el vocabulario a nivel de byte elimina los casos de tokens desconocidos.
- Pruebas de integracion continua de infraestructura de inferencia: al ocupar unos pocos megabytes, puede desplegarse en cada commit para verificar que los endpoints compatibles responden, que el formato de respuesta es correcto y que la carga del modelo no rompe.
- Docencia y ejemplos reproducibles de arquitectura Llama: permite mostrar la estructura de un modelo causal completo, sus pesos y su configuracion sin necesidad de GPUs ni de descargas de decenas de gigabytes.
- Verificacion de trazabilidad regulatoria: el repositorio incluye `BOM.json` y `EU-BOM.json`, utiles como plantilla para equipos que necesitan auditar que ficheros componen una release y como se mapea el contenido de entrenamiento a los requisitos de divulgacion de GPAI.
- Pruebas de carga y de latencia de los frameworks de servido: se puede usar como carga sintetica para medir el sobrecoste fijo de vLLM, TGI o el pipeline de transformers, aislando el coste de la generacion del coste de gestion de peticiones.
- Experimentacion con decodificacion y muestreo: util para comparar estrategias de muestreo (temperatura, top-k, top-p, penalizaciones) y su implementacion, dado que el coste por token es minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 MB en fp32, 1,6 MB en fp16/bf16 y 0,8 MB en int8, calculados a partir de los 820.736 parametros. Son estimaciones aritmeticas, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o integradas modestas; el modelo es demasiado pequeno para aprovechar A100 o H100.
- Inferencia en CPU: perfectamente viable en cualquier CPU moderna; el cuello de botella sera el sobrecoste del framework, no los pesos.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en practicamente cualquier acelerador con memoria suficiente para el runtime.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` para el tokenizador), text-generation-inference y endpoints compatibles segun los tags del repositorio. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa no documentada.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo sub-millonario, el rendimiento estara dominado por el coste fijo de carga del modelo y de gestion de peticiones, no por el calculo.

## Comparativa con modelos similares

No disponible. No se ha encontrado en la informacion proporcionada ningun modelo comparable con el que contrastar parametros, contexto, rendimiento, licencia y disponibilidad. El modelo pertenece a una categoria atipica (checkpoint experimental de menos de un millon de parametros con tokenizador de bytes propio), por lo que las comparaciones habituales con modelos de 1B a 8B parametros no serian homogeneas ni informativas.

## Limitaciones y advertencias

- Con 820.736 parametros, la capacidad de conocimiento factual, razonamiento y generacion coherente es muy limitada; es previsible una tasa alta de texto incoherente o irrelevante, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Riesgo elevado de alucinacion: un modelo de este tamano no puede almacenar conocimiento factual fiable.
- No hay informacion sobre sesgos. Al desconocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o ideologia.
- No hay informacion sobre idiomas soportados. El tokenizador a nivel de byte no garantiza competencia multilingue; solo garantiza que cualquier byte es representable.
- Licencia no disponible: sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Debe tratarse como material sin derechos de uso concedidos hasta que el autor lo aclare.
- La carga del tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo Python arbitrario incluido en el repositorio. Es un riesgo de seguridad que debe evaluarse antes de usarlo en entornos compartidos o automatizados.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas ni en tareas de contexto extendido.
- El nombre "smoke-v1" sugiere que se trata de una prueba de humo de un pipeline, no de un modelo entrenado para tareas reales. No deberia desplegarse en produccion ni presentarse como modelo de proposito general.
- No hay resultados de benchmarks, evaluaciones de seguridad ni documentos de ficha tecnica mas alla de la model card y los ficheros BOM.
- El repositorio ocupa 0,0 GB y tiene 0 likes con 127 descargas, lo que apunta a un uso puramente instrumental por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-u0-mdagosta-b
- Perfil del autor en Hugging Face: https://huggingface.co/mdagosta
- Inventario de la release: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-u0-mdagosta-b/blob/main/BOM.json
- Divulgacion de contenido de entrenamiento (EU GPAI): https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-u0-mdagosta-b/blob/main/EU-BOM.json
