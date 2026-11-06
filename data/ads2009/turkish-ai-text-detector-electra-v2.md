# ads2009/turkish-ai-text-detector-electra-v2

## Resumen

SENTINEL-AI TR v2 - ELECTRA es un clasificador binario de texto en turco disenado para distinguir entre texto escrito por humanos (etiqueta 0) y texto generado por inteligencia artificial (etiqueta 1). Lo desarrolla el usuario de Hugging Face ads2009 y se publica bajo licencia Apache 2.0. El modelo parte del discriminador ELECTRA base en turco de dbmdz y se ha ajustado fino para la tarea de deteccion de texto sintetico, un problema cada vez mas relevante en entornos editoriales, academicos y de moderacion de contenido.

Arquitectonicamente es un transformer tipo ELECTRA con 110.618.882 parametros totales (aproximadamente 110,6 millones), lo que lo situa en la categoria de modelos base ligeros. El repositorio ocupa unos 0,4 GB en formato safetensors, lo que facilita su despliegue en infraestructura modesta. Esta especializado exclusivamente en turco y su salida es una clasificacion de dos clases, no generacion de texto.

Su relevancia actual radica en la proliferacion de contenido generado por LLM en turco y la necesidad de herramientas de deteccion especificas por idioma. Al estar construido sobre un encoder ELECTRA preentrenado en turco, aprovecha representaciones linguisticas nativas del idioma en lugar de adaptar un detector multilingue generico. La model card es extremadamente escueta y exige una normalizacion concreta de la entrada (`norm_v2`, version `tr_v2_norm_1`) documentada en un fichero auxiliar `sentinel_meta.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ELECTRA (discriminador), encoder |
| Parametros totales | 110.618.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del discriminador `dbmdz/electra-base-turkish-cased-discriminator`, un ELECTRA base entrenado especificamente para turco con vocabulario y casing adaptados al idioma. ELECTRA emplea un esquema de preentrenamiento con deteccion de tokens reemplazados (replaced token detection), en el que un generador produce sustituciones y el discriminador aprende a identificar que tokens han sido alterados. Esa naturaleza discriminativa encaja de forma natural con una tarea de clasificacion binaria como la deteccion de texto IA.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus (proporcion de textos humanos frente a generados, fuentes, generadores utilizados), ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. La model card unicamente especifica el pipeline de normalizacion obligatorio de la entrada (`norm_v2`, version `tr_v2_norm_1`) descrito en `sentinel_meta.json`, lo que sugiere que el preprocesado forma parte critica del contrato de uso del modelo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, algo esperable en un encoder de clasificacion.

## Capacidades

- Clasificacion binaria de texto en turco: devuelve 0 para texto humano y 1 para texto generado por IA.
- Deteccion de texto sintetico en un unico idioma (turco), sin soporte multilingue declarado.
- Inferencia sobre fragmentos de texto normalizados segun el esquema `norm_v2` (`tr_v2_norm_1`).
- Aprovechamiento de representaciones ELECTRA especificas para turco, incluido el tratamiento de mayusculas y morfologia aglutinante del idioma.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, vision ni audio.
- Salida limitada a la clasificacion; no proporciona probabilidad calibrada documentada ni explicaciones.

## Casos de uso

- Moderacion de contenido en foros y plataformas turcas: el clasificador puede filtrar o marcar publicaciones sospechosas de haber sido generadas por IA antes de la revision humana, reduciendo la carga de moderadores en comunidades de habla turca.
- Verificacion editorial: medios y editoriales turcas pueden pasar articulos recibidos por el clasificador para detectar envios generados automaticamente y aplicar sus politicas de originalidad.
- Deteccion de fraude academico: universidades turcas pueden integrar el modelo en flujos de revision de trabajos, usando la salida binaria como senal preliminar que se combine con otras pruebas.
- Analisis de resenas y opiniones: plataformas de comercio electronico en turco pueden detectar resenas generadas en masa por LLM y priorizar su revision o exclusion de rankings.
- Investigacion en linguistica computacional: el modelo sirve como linea base para estudiar la detectabilidad de texto generado en turco y comparar con detectores multilingues.
- Enriquecimiento de datasets: equipos que construyen corpus turcos pueden usar el clasificador para etiquetar o limpiar automaticamente contenido sintetico antes de usarlo en entrenamiento.
- Prefiltrado en pipelines de seguridad: al ser un modelo de 110 millones de parametros y 0,4 GB, puede ejecutarse como primera etapa de bajo coste en un pipeline que derive los casos dudosos a modelos mayores o a revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo de pesos, mas activaciones y overhead del runtime; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- En FP16: alrededor de 0,22 GB de pesos, con margen amplio para lotes grandes en GPUs modestas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para inferencia por lotes pequenos; para alto throughput se recomienda A10, L4, A100 o H100.
- Tambien puede ejecutarse en CPU para volumenes moderados, dado su tamano reducido.
- Opciones de despliegue: Hugging Face Transformers, Text Embeddings Inference (TEI) para clasificacion, ONNX Runtime, o servidores propios con FastAPI; vLLM no es la via habitual para encoders de clasificacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ads2009/turkish-ai-text-detector-electra-v2 | 110,6 M | no disponible | Turco | Apache 2.0 | Hugging Face (39 descargas) |
| dbmdz/electra-base-turkish-cased-discriminator | ~110 M | no disponible | Turco | no disponible en la informacion | Hugging Face (modelo base) |
| Detectores multilingues genericos de texto IA | no disponible | no disponible | Multiples | variable | Depende del proveedor |

La comparacion con detectores multilingues genericos no puede cuantificarse porque no se han publicado benchmarks para este modelo. Frente a su modelo base, la diferencia es la especializacion en la tarea de deteccion, no el tamano ni la arquitectura.

## Limitaciones y advertencias

- La model card es minima: no documenta datos de entrenamiento, generadores cubiertos ni metricas de evaluacion, lo que impide valorar su robustez real.
- Riesgo de sesgo hacia los generadores y estilos de prompt presentes en el corpus de entrenamiento; textos de LLM no vistos pueden escapar a la deteccion.
- Riesgo de falsos positivos sobre texto humano formal, traducido o muy estructurado, un patron comun en detectores de texto IA.
- El modelo exige una normalizacion concreta (`norm_v2`, `tr_v2_norm_1`); usarlo sin ese preprocesado puede degradar gravemente el rendimiento.
- Solo soporta turco; no debe aplicarse a otros idiomas.
- No se documenta calibracion de probabilidades ni umbrales recomendados; la salida binaria debe tratarse con cautela en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Con 39 descargas y 0 likes, la validacion por parte de la comunidad es practicamente inexistente; conviene evaluarlo en el dominio concreto antes de desplegarlo.
- No se dispone de informacion sobre la longitud maxima de entrada soportada, lo que limita la planificacion de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ads2009/turkish-ai-text-detector-electra-v2
- Modelo base: https://huggingface.co/dbmdz/electra-base-turkish-cased-discriminator
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
