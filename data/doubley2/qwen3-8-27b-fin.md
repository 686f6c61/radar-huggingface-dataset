# DoubleY2/Qwen3.8-27b-Fin

## Resumen

DoubleY2/Qwen3.8-27b-Fin es un modelo publicado en Hugging Face por el usuario DoubleY2 bajo el identificador que sugiere una variante de la familia Qwen orientada a dominio financiero ("Fin"), con un supuesto tamano de 27 mil millones de parametros. El repositorio contiene pesos en formato safetensors con la etiqueta de arquitectura `qwen3_5`, ocupa 72,0 GB y acumula 139 descargas y 0 likes desde su creacion el 4 de noviembre de 2026.

La informacion publica disponible es extremadamente limitada: no se declara licencia, no se especifican idiomas soportados, no hay pipeline definido ni model card con detalles de entrenamiento, datos o evaluacion. El dato de parametros reportado en los metadatos de safetensors (3.054.832) es incompatible con el nombre del modelo y con el tamano del repositorio, lo que impide confirmar la configuracion real de pesos.

Por tanto, esta ficha se limita a documentar lo verificable y marca como "no disponible" todo aquello que no puede contrastarse. Cualquier uso en produccion deberia ir precedido de una inspeccion directa de los ficheros del repositorio y de una evaluacion propia, dado que no existe documentacion tecnica que respalde las capacidades del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo Qwen (etiqueta `qwen3_5` en Hugging Face); detalles no disponibles |
| Parametros totales | 27B segun el nombre del modelo; metadatos safetensors reportan 3.054.832 (discrepancia sin resolver) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion estructural es la etiqueta de arquitectura `qwen3_5` asociada al repositorio, que sugiere una variante de la familia Qwen 3.5 de Alibaba. No se dispone de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion, uso de Mixture of Experts ni sobre la estrategia de tokenizacion.

No hay informacion publica sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo, matematicas o texto financiero), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o instruction tuning. El sufijo "Fin" en el nombre apunta a un posible ajuste fino sobre datos financieros, pero no existe documentacion que lo confirme ni que describa el dataset utilizado.

## Capacidades

- Generacion de texto: capacidad esperable por la familia Qwen, pero no verificada en este repositorio.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Especializacion financiera: inferida solo del sufijo "Fin" del nombre, sin documentacion que la respalde.

## Casos de uso

- Evaluacion interna de modelos financieros: el modelo puede servir como candidato a comparar frente a alternativas consolidadas en tareas de analisis de informes y resumen de documentos financieros, siempre que se valide primero su calidad real mediante un conjunto de pruebas propio, dado que no hay benchmarks publicados.
- Procesamiento de documentos financieros de gran extension: si se confirma una ventana de contexto amplia (dato no disponible), podria emplearse para resumir memorandos, estados financieros o transcripciones de llamadas de resultados; requiere verificacion previa de la longitud de contexto real.
- Prototipado de asistentes de analisis: util para experimentar con pipelines de preguntas y respuestas sobre datos de mercado en entornos de investigacion, con la advertencia de que la ausencia de licencia clara impide su uso comercial sin aclaracion previa.
- Extraccion de entidades en textos economicos: si el ajuste financiero es real, podria aplicarse a la identificacion de empresas, cifras y eventos en noticias y comunicados; debe medirse la precision con un conjunto anotado propio.
- Generacion de borradores de informes: apoyo a analistas en la redaccion inicial de comentarios de mercado, con revision humana obligatoria por el riesgo de alucinacion inherente a los modelos de lenguaje.
- Investigacion sobre ajuste fino en dominio: el repositorio puede interesar como objeto de estudio de tecnicas de especializacion vertical, comparando su comportamiento con el modelo base Qwen 3.5 del que presuntamente deriva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parametros en precision bf16 se requieren aproximadamente 54 GB solo para pesos, mas cache KV; en cuantizacion de 8 bits rondaria 27-30 GB y en 4 bits unos 14-16 GB, aunque estas estimaciones no pueden confirmarse por la discrepancia en el recuento de parametros.
- GPU recomendadas: para bf16, A100 80 GB o H100 80 GB; para cuantizaciones de 8 y 4 bits, A100 40 GB, L40S o RTX 6000 Ada.
- GPU de consumo: una RTX 4090 (24 GB) solo seria viable con cuantizacion de 4 bits y contexto moderado; en bf16 no cabe.
- Opciones de despliegue: vLLM o TGI para safetensors en GPU; llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DoubleY2/Qwen3.8-27b-Fin | 27B (segun nombre; metadatos inconsistentes) | no disponible | no disponible | Hugging Face, 139 descargas |
| Qwen 3.5 (familia base de Alibaba) | no disponible en esta ficha | no disponible | no disponible | Hugging Face oficial |
| Alternativas financieras open source de ~27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo analizado ni de comparaciones verificables con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion de entrenamiento, datos, evaluacion ni uso previsto.
- Discrepancia critica en el recuento de parametros: los metadatos safetensors indican 3.054.832 parametros frente a los 27B del nombre y los 72 GB del repositorio, lo que sugiere ficheros incompletos, mal etiquetados o un error en la publicacion.
- Licencia no declarada: no puede asumirse permiso de uso comercial; es imprescindible contactar con el autor o inspeccionar los ficheros antes de cualquier despliegue productivo.
- Idiomas no declarados: el rendimiento multilingue es desconocido y no debe presumirse.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, especialmente en dominio financiero donde las cifras incorrectas tienen consecuencias graves; requiere verificacion factual sistematica.
- Sesgos desconocidos: sin informacion sobre la composicion del corpus de entrenamiento no es posible evaluar sesgos.
- Repositorio de baja traccion (0 likes, 139 descargas) y sin senales de mantenimiento activo mas alla de la actualizacion de noviembre de 2026.
- No apto para produccion sin evaluacion propia exhaustiva y sin aclaracion previa de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleY2/Qwen3.8-27b-Fin
- Repositorio oficial de Qwen (familia de referencia): https://huggingface.co/Qwen
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
