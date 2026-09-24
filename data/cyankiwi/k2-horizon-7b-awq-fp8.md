# cyankiwi/K2-Horizon-7B-AWQ-FP8

## Resumen

K2-Horizon-7B-AWQ-FP8 es una version cuantizada del modelo IFM/K2-Horizon-7B, publicada por el usuario cyankiwi (identificado en la propia model card con el correo ton@cyan.kiwi y la version 26.05.01). Se trata de un modelo decoder-only denso de clase 7B con 8.999.178.240 parametros reales en safetensors, lo que lo situa en torno a 9.000 millones de parametros, y una ventana de contexto nativa de 524.288 tokens (512K) activa desde las etapas de midtraining. Esta ficha describe la variante cuantizada, cuyo proposito es reducir el coste de memoria y acelerar la inferencia manteniendo el comportamiento del modelo base.

La relevancia de esta publicacion es doble. Por un lado, aplica cuantizacion combinada AWQ y FP8 mediante la libreria compressed-tensors, con calibracion especifica sobre dominios STEM y agenticos (dataset cyankiwi/calibration), lo que la orienta a cargas de trabajo tecnicas en lugar de conversacion generica. Por otro, el modelo base pertenece a la familia K2-Horizon, que publica datos de entrenamiento, receta, codigo de entrenamiento y recursos de evaluacion de forma abierta, ademas de checkpoints intermedios y adaptadores de difusion para acelerar la inferencia.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y soporte para transformers. La model card del modelo base declara ingles como unico idioma, mientras que la tarjeta de esta version cuantizada lista diez idiomas (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES); esta discrepancia no queda aclarada en la informacion disponible y conviene tratarla con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (dense), sin mezcla de expertos |
| Parametros totales | 8.999.178.240 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde midtraining |
| Tipos de cuantizacion | AWQ y FP8 combinados mediante compressed-tensors; calibracion en STEM y agentica |
| Idiomas soportados | Modelo base: en. Tarjeta de la version cuantizada: EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers con custom_code |

Datos adicionales: version declarada 26.05.01, tamano del repositorio 11,1 GB, tamano de modelo indicado en la tarjeta 11,06 GB, creado el 24 de septiembre de 2026 y actualizado el mismo dia. No se dispone de informacion sobre la configuracion interna (numero de capas, dimensiones de atencion, cabezas) ni sobre el tokenizador.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de clase 7B, sin componentes de mezcla de expertos ni arquitecturas hibridas de tipo SSM segun la informacion disponible. Su caracteristica estructural mas destacable es la ventana de contexto de 512K tokens, que la model card situa como nativa a partir de las etapas de midtraining, lo que implica un proceso de extension de contexto dentro del pipeline de entrenamiento y no un simple ajuste posterior. La familia incluye adaptadores de difusion (Diffusion Adapters), publicados de forma separada en IFM/K2-Horizon-7B-Uno, orientados a reducir la latencia de inferencia.

En cuanto a los datos, se citan dos conjuntos: IFM/K2-Horizon-Pretrain-Data para el preentrenamiento y IFM/K2-Horizon-Midtrain-Data para el midtraining. No se especifica el numero total de tokens, la composicion detallada del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones adicionales en el mecanismo de atencion. La model card del modelo base afirma que se publican datos de entrenamiento, receta, codigo de entrenamiento y recursos de evaluacion, asi como checkpoints intermedios para estudiar la evolucion de capacidades durante el entrenamiento. Esta version cuantizada anade un proceso de calibracion propio, descrito como centrado en STEM y razonamiento agentico, cuyos detalles metodologicos no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, con la etiqueta conversational en los metadatos del repositorio.
- Razonamiento matematico de competicion: la model card incluye HMMT Feb 2026 entre los benchmarks evaluados, con 73,3 puntos para el modelo base.
- Generacion de codigo: la model card del modelo base incluye una seccion de benchmarks de coding, aunque los valores concretos no estan disponibles en la informacion proporcionada (la tabla aparece truncada).
- Procesamiento de contexto largo: ventana nativa de 524.288 tokens, evaluada segun la model card en benchmarks de long-context.
- Capacidades agenticas: la model card menciona evaluacion en benchmarks agenticos y la calibracion de esta version cuantizada se realizo sobre datos STEM y agenticos.
- Razonamiento multi-paso: la model card cita benchmarks de reasoning entre las categorias evaluadas.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; no se mencionan en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Soporte multilingue: los metadatos de HuggingFace y la model card del modelo base indican unicamente ingles; la tabla de la version cuantizada lista diez idiomas, sin que se detalle el nivel de calidad por idioma.

## Casos de uso

- Analisis de repositorios completos y documentacion extensa: con 512K tokens de contexto, el modelo puede ingerir bases de codigo grandes o conjuntos de documentacion tecnica en una sola pasada, evitando estrategias de troceado y recuperacion que pierden dependencias entre archivos.
- Asistencia en matematicas de nivel universitario y competicion: el resultado de 73,3 en HMMT Feb 2026 lo situa por delante de las referencias comparadas, por lo que es adecuado para tutoria, generacion de problemas resueltos y verificacion de derivaciones paso a paso.
- Agentes de soporte tecnico especializado: la calibracion en datos STEM y agenticos apunta a un uso en flujos donde el modelo consulta herramientas o documentacion tecnica y encadena varios pasos antes de responder.
- Revision de literatura cientifica y extraccion de datos estructurados: el contexto largo permite procesar articulos completos y anexos en una unica ventana, manteniendo coherencia entre secciones y referencias cruzadas.
- Generacion y refactorizacion de codigo en pipelines de desarrollo: integrable a traves de transformers para tareas de autocompletado, generacion de pruebas o migracion de fragmentos, con la ventaja de memoria que aporta la cuantizacion AWQ/FP8.
- Despliegue en infraestructura con VRAM limitada: al ocupar aproximadamente 11 GB en disco, la version cuantizada permite servir un modelo de clase 9B en GPUs de gama alta de consumo, algo inviable con los pesos en precision completa.
- Procesamiento por lotes de expedientes largos (legal, administrativo, normativo): la ventana de 512K tokens reduce la necesidad de resumir en cascada, aunque el coste de la cache KV debe dimensionarse con cuidado.
- Evaluacion reproducible de checkpoints intermedios: dado que la familia publica checkpoints intermedios, este artefacto cuantizado sirve para comparar el impacto de la cuantizacion frente al modelo base en la misma bateria de pruebas.

## Benchmarks y rendimiento

La model card del modelo base incluye un grafico y una tabla de resultados. En la informacion disponible solo esta accesible la seccion de matematicas; la seccion de coding aparece truncada, por lo que no se reproducen sus valores.

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matematicas de competicion) | 73,3 | 63,1 | 65,7 | 66,5 |

Los resultados corresponden al modelo base IFM/K2-Horizon-7B, no a esta version cuantizada. No se han publicado en la informacion disponible resultados especificos de la variante AWQ-FP8, ni datos de MMLU, HumanEval, GSM8K u otros benchmarks habituales. Tampoco se dispone de la bateria completa de evaluacion agentica, de codigo ni de contexto largo citada en la model card.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 11-12 GB en esta version AWQ-FP8, coherente con un repositorio de 11,1 GB y un modelo de 8.999 millones de parametros. Es una estimacion a partir del tamano de los pesos; no se publican cifras oficiales de consumo.
- Cache KV: no disponible. Con una ventana de 524.288 tokens, la cache KV puede superar ampliamente el tamano de los propios pesos, por lo que la atencion a contexto completo exige planificacion de memoria y, previsiblemente, tecnicas de paginacion o cuantizacion de la cache.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano de pesos, cabria en GPUs de 16 GB o mas, y seria holgada en A100 40/80 GB, H100 o L40S, especialmente si se necesita contexto largo.
- GPU de consumo: si, la version cuantizada deberia caber en RTX 4090 (24 GB), RTX 4080 (16 GB) y tarjetas de 16 GB o superiores para secuencias cortas o moderadas. No hay confirmacion oficial de compatibilidad.
- Opciones de despliegue: la libreria indicada es transformers. El formato compressed-tensors es compatible con ecosistemas como vLLM; no se confirma en la informacion disponible el soporte de llama.cpp, Ollama o TGI, y al tratarse de AWQ/FP8 en lugar de GGUF no cabe esperar ejecucion directa en llama.cpp sin conversion.
- Latencia y throughput: no disponible.
- Nota sobre requisitos: los adaptadores de difusion del modelo base (IFM/K2-Horizon-7B-Uno) se anuncian como una via para acelerar la inferencia, pero no se detallan sus requisitos ni su compatibilidad con esta variante cuantizada.

## Comparativa con modelos similares

La unica comparativa con datos numericos disponible procede de la model card del modelo base. Los parametros, la longitud de contexto, la licencia y la disponibilidad de los modelos de referencia no se detallan en la informacion proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | HMMT Feb 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-7B | 8.999.178.240 (denso) | 524.288 tokens | 73,3 | apache-2.0 | Pesos abiertos en HuggingFace, mas version cuantizada AWQ-FP8 |
| Gemma 4-12B | No disponible | No disponible | 63,1 | No disponible | No disponible |
| Qwen3.5-9B | No disponible | No disponible | 65,7 | No disponible | No disponible |
| Granite 4.2-8B | No disponible | No disponible | 66,5 | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion en la informacion proporcionada. El modelo base se distribuye con datos de entrenamiento abiertos, lo que permite auditar la composicion, pero no se aportan analisis de sesgo.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad factual. Como en cualquier modelo generativo, el riesgo existe y debe mitigarse con verificacion externa, especialmente en dominios STEM donde las respuestas pueden ser plausibles pero incorrectas.
- Riesgo de perdida por cuantizacion: los resultados de benchmarks corresponden al modelo base en precision completa, no a esta variante AWQ-FP8. No se ha publicado una comparacion directa que cuantifique la degradacion introducida por la cuantizacion, un riesgo relevante en tareas de matematicas y codigo.
- Contexto largo: aunque se declaran 512K tokens nativos, no se aportan resultados de pruebas tipo needle-in-a-haystack ni de degradacion de calidad a longitudes extremas. La atencion efectiva sobre ventanas muy largas no esta verificada en la informacion disponible.
- Idiomas: existe una contradiccion sin resolver entre los metadatos de HuggingFace y la model card del modelo base (solo ingles) y la tabla de la version cuantizada (diez idiomas). No hay evaluaciones multilingues que respalden el segundo listado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se imponen restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base y de los datasets asociados antes de un despliegue en produccion.
- Madurez del artefacto: el repositorio registra cero descargas y cero interacciones, fue creado y actualizado el mismo dia y es una publicacion de un tercero (cyankiwi) sobre el modelo de IFM. No hay evidencia de validacion independiente ni de soporte a largo plazo.
- Requisitos de codigo personalizado: el repositorio usa custom_code, lo que implica que la carga puede requerir trust_remote_code=True y revision previa del codigo asociado.
- Fechas inusuales: los metadatos indican fechas de 2026 y benchmarks como HMMT Feb 2026, lo que refleja la informacion tal como aparece en el repositorio y conviene tener en cuenta al citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyankiwi/K2-Horizon-7B-AWQ-FP8
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Dataset de preentrenamiento: IFM/K2-Horizon-Pretrain-Data (referenciado en los metadatos; enlace directo no disponible)
- Dataset de midtraining: IFM/K2-Horizon-Midtrain-Data (referenciado en los metadatos; enlace directo no disponible)
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
- Adaptadores de difusion del modelo base: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Grafico de benchmarks del modelo base: assets/k2-horizon-7b-benchmarks.png (ruta interna del repositorio)
- Contacto indicado en la model card: ton@cyan.kiwi
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada. Los resultados de la busqueda web no contienen informacion relacionada con este modelo.
