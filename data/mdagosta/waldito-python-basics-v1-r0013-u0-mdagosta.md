# mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta

# mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta

## Resumen

Se trata de un modelo de generacion de texto publicado en HuggingFace por el usuario mdagosta bajo el identificador `mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta`. La model card lo describe como un "export" del modelo OpenWALDO y declara que emplea la arquitectura estandar de modelo causal de lenguaje de la familia Llama implementada en Transformers. El modelo cuenta con 9.541.632 parametros, confirmados a partir de los pesos en formato safetensors, lo que lo situa en la categoria de modelos ultraligeros, muy por debajo de los modelos habituales de uso general.

El rasgo mas distintivo que documenta el autor es el tokenizador: no utiliza un vocabulario BPE o SentencePiece convencional, sino un "byte tokenizer" propietario de OpenWALDO identificado como schema-1, que requiere cargarse con `trust_remote_code=True`. Esto implica que el modelo opera directamente sobre bytes, sin un vocabulario cerrado de subpalabras, un enfoque poco frecuente en modelos publicados.

La relevancia del modelo no reside en su rendimiento, sino en su naturaleza: es un artefacto de investigacion o de exportacion asociado probablemente a una linea de trabajo sobre tokenizacion a nivel de byte. El repositorio incluye un `BOM.json` con el inventario de ficheros de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el Reglamento europeo de IA (GPAI). No se ha publicado informacion sobre datos de entrenamiento, benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama causal language model) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Byte tokenizer "schema-1" de OpenWALDO; requiere `trust_remote_code=True` |
| Libreria | transformers |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |
| Tamano declarado del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza la arquitectura estandar de modelo de lenguaje causal de la familia Llama tal como se implementa en la libreria Transformers: un transformer decoder-only con atencion causal. No se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la dimension de la capa feed-forward ni el mecanismo de normalizacion empleado. Tampoco se documenta si se aplican tecnicas adicionales como atencion lineal, decodificacion especulativa, atencion por ventanas deslizantes o alguna variante hibrida.

La innovacion declarada se situa en la capa de tokenizacion: se emplea un tokenizador de bytes propio de OpenWALDO (schema-1) en lugar de un vocabulario de subpalabras. Al operar sobre bytes, el modelo no depende de un vocabulario fijo y puede procesar cualquier secuencia de bytes, aunque a costa de una mayor longitud de secuencia para un mismo texto. No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, la procedencia de los datos ni la existencia de fases de ajuste como RLHF, DPO o SFT. El repositorio incorpora un `EU-BOM.json` que, segun la model card, contiene el mapeo de divulgacion de contenido de entrenamiento para GPAI de la Union Europea, pero su contenido no se ha facilitado en la informacion disponible.

## Capacidades

- Generacion de texto causal: es la unica capacidad explicitamente declarada mediante el pipeline `text-generation`.
- Conversacion: la etiqueta `conversational` figura entre los tags del repositorio, aunque no se documenta el formato de plantilla de chat ni el comportamiento multi-turno.
- Procesamiento a nivel de byte: el tokenizador schema-1 permite alimentar secuencias de bytes arbitrarias, sin restriccion de vocabulario.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se documenta ninguna.
- Con 9,5 millones de parametros, la capacidad de razonamiento, codigo y matematicas es previsiblemente muy limitada, si bien no se han publicado evaluaciones que lo cuantifiquen.

## Casos de uso

- Pruebas de humo en pipelines de inferencia: por su tamano minimo, el modelo permite validar el cableado de un stack de `transformers` o de `text-generation-inference` (ambos presentes en los tags) antes de desplegar modelos de produccion, con un coste de arranque practicamente nulo.
- Investigacion sobre tokenizacion a nivel de byte: el tokenizador schema-1 de OpenWALDO lo convierte en un banco de pruebas para estudiar el comportamiento de modelos entrenados sobre bytes frente a modelos con vocabulario BPE o SentencePiece.
- Fine-tuning experimental: con 9,5 millones de parametros, el ajuste completo cabe en una unica GPU de consumo e incluso en CPU con tiempo suficiente, lo que lo hace util para validar recetas de entrenamiento, tasas de aprendizaje y esquemas de datos antes de escalar.
- Docencia y formacion: sirve para explicar de forma tangible la anatomia de un transformer causal (forma de los tensores, generacion autoregresiva, efecto del tokenizador) sin necesidad de infraestructura especializada.
- Despliegue en dispositivos con recursos muy limitados: el modelo ocupa del orden de decenas de megabytes en precision completa, por lo que es candidato a ejecucion en CPU, Raspberry Pi o entornos edge sin GPU.
- Destilacion y estudios de inicializacion: puede emplearse como alumno o como punto de partida en experimentos de compresion, y su tamano permite ejecutar barridos de hiperparametros con muchas semillas.
- Verificacion de cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` permiten auditar el inventario de artefactos de la release y el mapeo de divulgacion GPAI, lo que resulta util como caso de estudio de trazabilidad de modelos.
- Generacion de plantillas de bajo riesgo: para tareas de relleno de formularios o etiquetado auxiliar con revision humana obligatoria, siempre que la licencia y la calidad resultante se validen previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (9.541.632) y sin contar cache KV ni activaciones:
  - FP32: aproximadamente 38,2 MB.
  - FP16 / BF16: aproximadamente 19,1 MB.
  - INT8: aproximadamente 9,5 MB.
  - INT4: aproximadamente 4,8 MB.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; el modelo tambien se ejecuta en CPU. No tiene sentido reservar aceleradores de gama alta (A100, H100) para este tamano.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 y practicamente cualquier integrada reciente.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). Para `llama.cpp` u `Ollama` seria necesaria una conversion a GGUF, que no se distribuye en el repositorio. `vLLM` es compatible en teoria con la arquitectura Llama, pero no hay confirmacion de soporte para este tokenizador de bytes con `trust_remote_code`.
- Latencia y throughput estimados: no se han publicado mediciones. Dado el tamano, se espera una latencia muy baja en CPU y practicamente despreciable en GPU, pero se trata de una estimacion, no de un dato medido.
- Nota de seguridad: la carga del tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo Python remoto del repositorio; conviene auditar el fichero de tokenizacion antes de usarlo en entornos de produccion o aislarlo en un sandbox.

## Comparativa con modelos similares

No se ha identificado un modelo directamente comparable: los modelos publicados de proposito general con arquitectura Llama parten de ordenes de magnitud mas de parametros. La tabla siguiente recoge referencias de la misma familia arquitectonica, todas ellas muy superiores en tamano, por lo que la comparacion debe leerse solo como referencia de escala y no como comparacion de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0013-u0 | 9,5 M | no disponible | no disponible | safetensors |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | safetensors y GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | safetensors y GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | safetensors y GGUF |

No hay datos de rendimiento comparado entre estos modelos y waldito-python-basics-v1-r0013-u0, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo legal potencial para cualquier despliegue en produccion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de revision externa, de informes de errores y de evidencia de uso real.
- Tamano muy reducido: 9,5 millones de parametros limitan severamente la coherencia en generaciones largas, el razonamiento y el conocimiento factual. El riesgo de alucinacion es alto.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad real del modelo.
- Opacidad sobre los datos de entrenamiento: no se especifica el corpus, su volumen, su composicion ni los filtros aplicados, por lo que los sesgos son desconocidos e imposibles de auditar con la informacion disponible.
- Sin documentacion de alineacion: no consta que se hayan aplicado fases de RLHF, DPO o filtros de seguridad, de modo que el modelo podria producir contenido inapropiado o danino sin mitigacion.
- Idiomas no declarados: no hay garantia de soporte de castellano ni de ningun otro idioma concreto.
- Tokenizador de bytes: aunque elimina la dependencia de un vocabulario, incrementa la longitud de secuencia necesaria para representar un texto dado, con el consiguiente coste en contexto efectivo y en computo por token de texto.
- Ejecucion de codigo remoto: el uso de `trust_remote_code=True` para cargar el tokenizador supone un riesgo de seguridad si no se audita el codigo del repositorio.
- Contexto no documentado: se desconoce la ventana maxima soportada, lo que impide planificar su uso en tareas que requieran contexto largo.
- Fechas de publicacion y actualizacion identicas (2026-09-30) y tamano de repositorio declarado como 0.0 GB: la metadata del repositorio es incoherente con la presencia de pesos safetensors de 9,5 millones de parametros, lo que aconseja verificar el contenido real antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta
- Inventario de la release (BOM.json): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta/blob/main/BOM.json
- Divulgacion de contenido de entrenamiento GPAI UE (EU-BOM.json): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta/blob/main/EU-BOM.json
- Repositorio del proyecto OpenWALDO: no disponible
- Paper o documentacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
