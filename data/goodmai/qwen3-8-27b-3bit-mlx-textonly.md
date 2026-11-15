# goodmai/Qwen3.8-27B-3bit-MLX-TextOnly

## Resumen

Qwen3.8-27B-3bit-MLX-TextOnly es una cuantizacion de 3 bits en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario goodmai a partir del trabajo previo de lukaskremla. El modelo base es un transformer de la familia Qwen 3.8 desarrollado por Alibaba Qwen, con aproximadamente 26.900 millones de parametros (26.895.993.856 segun los pesos en safetensors) y orientado a generacion de texto, razonamiento, uso de herramientas y contexto largo. Esta variante concreta elimina la torre de vision del modelo original y conserva unicamente las capacidades texto-a-texto.

La relevancia de esta ficha reside en que se trata de una cuantizacion agresiva (3 bits, cuantizacion solo de pesos, esquema afín con group-size 64 y redondeo RTN) pensada para ejecutarse en Apple Silicon mediante la libreria mlx-lm. Con un repositorio de 11,8 GB, permite desplegar un modelo de casi 27.000 millones de parametros en equipos con memoria unificada relativamente modesta, algo inviable con los pesos en precision completa. El precio a pagar es una perdida de calidad respecto al modelo original y la ausencia total de capacidades multimodales.

La licencia Apache 2.0 del modelo base se mantiene en esta derivada, lo que facilita su uso comercial. No obstante, la informacion publicada por el autor es muy escasa: no se detallan idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8, tag `qwen3_5`), solo texto tras eliminar la torre de vision |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag `long-context` sugiere contexto extendido, sin cifra publicada) |
| Tipos de cuantizacion | 3 bits, cuantizacion solo de pesos (weight-only), esquema afín, group-size 64, redondeo RTN |
| Idiomas soportados | no disponible (el tag `multilingual` sugiere soporte multilingue, sin listado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, `mlx-lm` 0.31.2) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer decoder-only de la familia Qwen 3.8 (etiquetado internamente como `qwen3_5` en los tags). Esta variante concreta aplica una cuantizacion de 3 bits sobre los pesos, con esquema afín y group-size 64, usando redondeo RTN (round-to-nearest). La conversion a MLX se realizo con mlx-lm version 0.31.2. Ademas, se ha eliminado la torre de vision del modelo original, de modo que solo se conservan las capas de texto. Existe una variante con vision en lukaskremla/Qwen3.8-27B-3bit-MLX y cabezas MTP (multi-token prediction) distribuidas por separado en la coleccion del autor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas especificas del modelo base en la informacion proporcionada. El autor advierte que Hugging Face puede mostrar recuentos de parametros incorrectos para cuantizaciones MLX, un bug de visualizacion habitual.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento (tag `reasoning`), incluyendo potencialmente modos de pensamiento heredados del modelo base.
- Uso de herramientas y function calling (tag `tool-use`).
- Contexto largo (tag `long-context`), aunque sin cifra concreta publicada.
- Capacidades multilingues (tag `multilingual`), sin listado de idiomas.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible, pero plausible por la familia Qwen 3.8.
- Vision: NO soportada en esta variante (torre de vision eliminada).

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse integramente en un Mac con Apple Silicon mediante mlx-lm o la aplicacion Basalt, sin necesidad de GPU dedicada ni conexion a la nube, lo que resulta adecuado para prototipos y uso personal con privacidad de datos.
- Agentes con tool calling en entornos de escritorio: el tag `tool-use` indica soporte de llamadas a funciones, lo que permite construir agentes que invoquen APIs, ejecuten comandos o consulten bases de datos desde un Mac.
- Procesamiento de documentos largos: el tag `long-context` sugiere la capacidad de manejar entradas extensas, util para resumir contratos, analizar informes o extraer informacion de transcripciones largas.
- Desarrollo y depuracion de codigo en local: aunque no se confirma explicitamente la capacidad de codigo, la familia Qwen 3.8 suele incluirla; el modelo puede integrarse en editores o terminales para autocompletado y explicacion de fragmentos.
- Investigacion y experimentacion con cuantizacion: el modelo sirve como caso de estudio de cuantizacion a 3 bits con MLX, permitiendo comparar calidad frente a variantes de 4 u 8 bits del mismo modelo base.
- Chatbot multilingue de bajo coste: el tag `multilingual` permite desplegar un asistente en varios idiomas en hardware de consumo, util para demos o entornos educativos.
- Pipelines de CI/CD para pruebas de modelos: al ser ligero en disco (11,8 GB) y ejecutable sin GPU, puede incorporarse a suites de evaluacion automatizadas en maquinas macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al tratarse de una cuantizacion de 3 bits con repositorio de 11,8 GB, se necesita al menos esa cantidad de memoria mas overhead de inferencia; en la practica, se recomienda un minimo de 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y posteriores). Para CUDA seria necesario reconvertir el modelo a otro formato.
- Cabe en consumer GPU: no en el sentido tradicional (NVIDIA/AMD); si cabe en Macs con memoria unificada de 16 GB o superior.
- Opciones de despliegue: mlx-lm (libreria nativa), aplicacion Basalt (macOS 27+, sin Python) mediante `basalt serve --model goodmai/Qwen3.8-27B-3bit-MLX-TextOnly --rest`, y potencialmente servidores compatibles con MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-3bit-MLX-TextOnly | ~26,9 mil millones | no disponible | 3 bits MLX | Apache 2.0 | Apple Silicon (MLX) |
| lukaskremla/Qwen3.8-27B-3bit-MLX | ~26,9 mil millones | no disponible | 3 bits MLX | Apache 2.0 | Apple Silicon (MLX) |
| Qwen/Qwen3.8-27B (base) | ~26,9 mil millones | no disponible | sin cuantizar | Apache 2.0 | Multiples (safetensors) |

La diferencia principal frente a lukaskremla/Qwen3.8-27B-3bit-MLX es la eliminacion de la torre de vision, lo que reduce el tamano y el consumo de memoria a costa de perder capacidades multimodales. Frente al modelo base, esta variante sacrifica precision numerica (3 bits) a cambio de un despliegue viable en hardware de consumo Apple. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La cuantizacion a 3 bits con group-size 64 y redondeo RTN puede degradar la calidad de generacion, el razonamiento y la fidelidad en tareas complejas respecto al modelo en precision completa; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Ausencia total de capacidades de vision: la torre multimodal ha sido eliminada deliberadamente.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la cuantizacion agresiva puede incrementarlo.
- No se documentan sesgos conocidos, pero al no detallarse la composicion del dataset de entrenamiento no es posible evaluar sesgos especificos.
- Idiomas soportados no especificados; el tag `multilingual` no garantiza calidad uniforme en todos los idiomas.
- Longitud de contexto no publicada; el tag `long-context` es orientativo y no sustituye a una cifra verificada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de la variante intermedia de lukaskremla.
- El modelo esta ligado al ecosistema MLX y Apple Silicon; no es directamente portable a CUDA sin reconversion.
- El autor advierte de posibles errores de visualizacion en el recuento de parametros en Hugging Face para cuantizaciones MLX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-3bit-MLX-TextOnly
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con vision: https://huggingface.co/lukaskremla/Qwen3.8-27B-3bit-MLX
- Coleccion de cuantizaciones MLX (vision, solo texto y MTP): https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp
- Repositorio Basalt (GitHub): https://github.com/goodmai/basalt
- Demo Basalt en Hugging Face Spaces: https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-3bit-MLX-TextOnly&role=chat
