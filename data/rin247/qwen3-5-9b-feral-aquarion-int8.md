# Rin247/Qwen3.5-9B-Feral-Aquarion-INT8

## Resumen

El modelo `Rin247/Qwen3.5-9B-Feral-Aquarion-INT8` es una cuantización INT8 weight-only del modelo base `Qwen3.5-9B-Feral-Aquarion`, publicado por el usuario Rin247 en Hugging Face. Esta ficha se centra en la versión cuantizada, que reduce el peso del modelo a 8 bits por parámetro manteniendo las escalas de cuantización junto a los pesos, lo que permite una inferencia más eficiente en memoria y ancho de banda respecto al modelo original en FP16 o BF16.

El modelo base pertenece a la serie Qwen3.5, que según la documentación oficial incorpora una fundación unificada de visión-lenguaje con entrenamiento de fusión temprana sobre billones de tokens multimodales, superando a los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. Esta cuantización concreta está pensada para despliegues donde el espacio en disco y la VRAM son limitados, manteniendo la mayor parte de la calidad del modelo original.

La relevancia de esta ficha radica en que las cuantizaciones INT8 weight-only son una opción habitual en producción para reducir el coste de inferencia sin recurrir a formatos más agresivos como INT4 o FP4, que pueden degradar más la calidad. El repositorio incluye los archivos `model.safetensors` y `config.json` con la configuración de cuantización, y el autor advierte que se requieren recetas personalizadas para des-cuantizar antes de usar un motor de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.5, base `Qwen3.5-9B-Feral-Aquarion`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only (RTN, escalas almacenadas junto a los pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT8 con buffers de escala y forma) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de la serie Qwen3.5, que segun la documentacion oficial emplea una fundacion unificada de vision-lenguaje con fusion temprana de tokens multimodales. Sin embargo, para esta cuantizacion concreta no se proporcionan detalles adicionales sobre el numero de capas, dimensiones ocultas o atencion. El proceso de cuantizacion aplicado por Rin247 es RTN (round-to-nearest) sobre CPU, almacenando las escalas y formas de los pesos en buffers separados (`*.weight_scale`, `*.weight_shape`). No se indica si el modelo base fue entrenado con RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto y razonamiento: al ser una cuantizacion del modelo Qwen3.5-9B, hereda las capacidades del modelo base, que incluyen instruccion, logica, comprension de texto, matematicas, ciencia, codificacion y uso de herramientas.
- Soporte multimodal: el modelo base Qwen3.5 integra vision y lenguaje, por lo que esta cuantizacion podria utilizarse para tareas que combinen imagen y texto, aunque no se especifica si los pesos cuantizados conservan completamente las capacidades visuales.
- Tool calling y agentes: el modelo base soporta uso de herramientas y razonamiento multi-paso, segun la documentacion de Qwen3.5.
- Capacidades multilingues: no se dispone de informacion especifica sobre los idiomas soportados en esta cuantizacion.

## Casos de uso

- Despliegue en entornos con VRAM limitada: al ser INT8 weight-only, reduce el consumo de memoria respecto a FP16, permitiendo ejecutar el modelo en GPUs de gama media como RTX 3090 o RTX 4090 con un contexto razonable.
- Prototipado rapido de aplicaciones de chat o asistentes: la cuantizacion INT8 mantiene una calidad cercana al modelo original, adecuada para pruebas de concepto sin necesidad de infraestructura de alto coste.
- Inferencia en CPU: al estar cuantizado con RTN sobre CPU, puede ejecutarse en entornos sin GPU, aunque con latencia mayor, util para validacion o entornos de desarrollo.
- Integracion en pipelines de generacion de codigo: el modelo base tiene capacidades de codificacion, por lo que esta version cuantizada puede usarse en asistentes de programacion o autocompletado.
- Analisis de documentos con contenido visual: si el modelo base mantiene sus capacidades multimodales tras la cuantizacion, podria emplearse para extraer informacion de imagenes o documentos escaneados.
- Evaluacion de calidad de cuantizacion: este modelo sirve como referencia para comparar el impacto de INT8 frente a otras cuantizaciones (FP8, INT4, FP4) en la misma serie, como las que publica Rin247 en su coleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta cuantizacion concreta, ni tampoco para el modelo base `Qwen3.5-9B-Feral-Aquarion`.

## Requisitos de hardware

- VRAM estimada: con 8.95 mil millones de parametros en INT8, el peso del modelo ocupa aproximadamente 8.95 GB (sin contar overhead de escalas y activaciones). Con contexto y overhead, se recomienda al menos 12 GB de VRAM para inferencia comoda.
- GPUs recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con 16 GB (RTX 4080, RTX 3080 Ti) podria caber con contexto reducido.
- En consumer GPU: si, cabe en GPUs de 16 GB o mas, aunque el contexto maximo dependera de la memoria disponible.
- Opciones de despliegue: al ser un formato safetensors con cuantizacion personalizada, no es directamente compatible con vLLM, llama.cpp u Ollama sin un paso de des-cuantizacion previo. Se requiere un script que lea los buffers de escala y forma para reconstruir los pesos en FP16/BF16 antes de cargarlos en un motor de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. Se puede comparar con el modelo base `Qwen3.5-9B` (sin cuantizar) en terminos de tamano y formato, pero no hay datos de rendimiento publicados para esta cuantizacion. Otras cuantizaciones de la misma serie (FP8, INT4, FP4) publicadas por Rin247 en su coleccion podrian servir como referencia, pero tampoco tienen benchmarks publicados.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir una ligera degradacion en tareas de alta precision como matematicas complejas o razonamiento logico extenso, aunque en general es menos agresiva que INT4 o FP4.
- El formato de pesos es personalizado: requiere des-cuantizacion manual con las escalas y formas almacenadas, lo que complica su uso directo con motores de inferencia estandar.
- No se dispone de informacion sobre la licencia, por lo que se desconoce si su uso comercial esta permitido. Se recomienda contactar con el autor o consultar el modelo base original.
- No se especifican los idiomas soportados, aunque por la serie Qwen3.5 se espera un soporte multilingue amplio, pero no confirmado para esta cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, no mitigado por la cuantizacion.
- No se han publicado evaluaciones de sesgos o seguridad para este modelo concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/Qwen3.5-9B-Feral-Aquarion-INT8
- Coleccion de cuantizaciones de Rin247: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio oficial Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Pagina de Ollama para qwen3.5:9b: https://ollama.com/library/qwen3.5:9b
