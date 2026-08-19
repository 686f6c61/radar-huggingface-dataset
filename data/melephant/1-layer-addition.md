# melephant/1-layer-addition

## Resumen

El modelo `melephant/1-layer-addition` es un transformer causal de un solo bloque, sin capas de bias, desarrollado por el usuario melephant con fines de investigación en interpretabilidad mecanicista. Está entrenado específicamente para realizar sumas de números de 4 dígitos en base 10 con ancho fijo: los operandos se rellenan con ceros a la izquierda y la respuesta se genera con 5 dígitos, reteniendo el posible desbordamiento. Con solo 43.648 parámetros, es un modelo de juguete diseñado para estudiar cómo los transformers aprenden y representan algoritmos aritméticos simples, como el manejo de acarreos.

El modelo se enmarca en la línea de trabajo del artículo arXiv:2405.14813, que aborda la interpretabilidad de transformers en tareas de aritmética de ancho fijo. Su relevancia radica en que, al ser extremadamente pequeño y con una tarea bien delimitada, permite analizar de forma exhaustiva los mecanismos internos de atención y las representaciones aprendidas, algo inviable en modelos de gran escala. No está pensado como una herramienta de cálculo general, sino como un objeto de estudio para la comunidad de interpretabilidad.

La arquitectura es un transformer de 1 bloque con atención causal, sin bias, y la ventana de contexto es fija para la tarea (entrada de 4 dígitos + operador + 4 dígitos + símbolo de igualdad). El repositorio incluye código personalizado de Transformers, por lo que su carga requiere `trust_remote_code=True`. El modelo se distribuye en formato safetensors y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 1 bloque, sin bias |
| Parametros totales | 43.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (fija para la tarea de suma de 4 digitos) |
| Tipos de cuantizacion | No disponible (solo safetensors, presumiblemente fp32) |
| Idiomas soportados | No disponible (tarea aritmetica, no linguistica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de un solo bloque, sin capas de bias, lo que simplifica el análisis de sus mecanismos internos. La tarea de entrenamiento consiste en sumar dos números de 4 dígitos en base 10, con los operandos rellenados con ceros a la izquierda y la respuesta generada con 5 dígitos para retener el acarreo final. La entrada se presenta en un formato fijo, como `0000 + 0000 =`, y el modelo debe generar la secuencia de salida correspondiente.

El entrenamiento se realizó durante 10.000 actualizaciones utilizando el optimizador Muon (con una tasa de aprendizaje pico de 0.02) combinado con AdamW (tasa de aprendizaje pico de 0.0003), weight decay de 0.01, warmup de 100 actualizaciones y una relación mínima de tasa de aprendizaje de 0.1. La inicialización fue normal con semilla 0. No se especifica el tamaño ni la composición del dataset de entrenamiento, pero al ser una tarea de suma de 4 dígitos, el espacio de entrada es finito (10.000 combinaciones posibles de operandos). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado directamente sobre la tarea.

La innovación principal no reside en la arquitectura, sino en su propósito: es un modelo mínimo y totalmente inspeccionable para estudiar cómo un transformer aprende a realizar sumas con acarreo, un problema clásico en interpretabilidad. El repositorio incluye el código de entrenamiento, métricas y checkpoints en la carpeta `training/`, así como un manifiesto de exportación con hashes y métricas.

## Capacidades

- Suma de números de 4 dígitos en base 10 con acarreo, generando respuestas de 5 dígitos.
- Manejo de acarreos simples, múltiples y cadenas de acarreo, con alta precisión (ver benchmarks).
- Generación de texto en formato de secuencia fija (entrada `DDDD + DDDD =` y salida de 5 dígitos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo de pensamiento ni capacidades de visión o audio.
- Es un modelo de investigación, no un sistema aritmético general.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar cómo un transformer de una sola capa representa y ejecuta el algoritmo de suma con acarreo, analizando los patrones de atención y las activaciones internas.
- Validación de técnicas de análisis de modelos: al ser diminuto y con una tarea bien definida, sirve como banco de pruebas para métodos de extracción de circuitos, atribución de características o localización de mecanismos.
- Estudio de generalización en aritmética: se puede analizar cómo el modelo se comporta ante variaciones en la posición de los acarreos (sin acarreo, acarreo simple, múltiples acarreos, cadenas), lo que ayuda a entender las limitaciones de los transformers en tareas de razonamiento simbólico.
- Comparación de optimizadores: el uso de Muon y AdamW en un modelo pequeño permite evaluar el impacto de estos optimizadores en la convergencia y la calidad de las soluciones aprendidas.
- Docencia y divulgación: por su tamaño y simplicidad, es un recurso didáctico excelente para explicar el funcionamiento interno de los transformers y los conceptos de interpretabilidad en cursos avanzados de aprendizaje automático.
- Reproducibilidad de experimentos: al incluir configuración completa, métricas y checkpoints, el repositorio facilita la reproducción exacta de los resultados y la comparación con variantes del modelo.

## Benchmarks y rendimiento

Los resultados reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Loss de validacion | 0.003520 |
| Precision de tokens generados (validacion) | 99.85% |
| Precision de respuesta exacta (validacion) | 99.32% |
| Precision de respuesta exacta sin acarreo | 97.27% |
| Precision de respuesta exacta con acarreo simple | 100.00% |
| Precision de respuesta exacta con acarreo multiple | 98.44% |
| Precision de respuesta exacta con cadena de acarreo | 97.27% |

No se han publicado comparaciones con otros modelos en la informacion disponible. Estos datos provienen directamente de la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB (el modelo tiene 43.648 parámetros; en fp32 ocupa aproximadamente 170 KB, en fp16 unos 85 KB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es más que suficiente; incluso una GPU integrada o una CPU pueden ejecutar el modelo sin problemas.
- Compatibilidad con hardware de consumo: sí, cualquier ordenador personal con Python y la librería Transformers puede ejecutarlo.
- Opciones de despliegue: se puede cargar con `transformers` usando `trust_remote_code=True`. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona una conversión oficial.
- Latencia y throughput: al ser un modelo tan pequeño, la inferencia es prácticamente instantánea en cualquier hardware moderno; el cuello de botella sería la carga del tokenizador y el código personalizado, no el cómputo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformers de una capa para suma de dígitos con ancho fijo). El artículo arXiv:2405.14813 podría incluir comparaciones con otras configuraciones, pero no se han extraído datos concretos de la model card. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo funciona con la tarea específica de suma de 4 dígitos en base 10 con ancho fijo; cualquier entrada fuera de esta gramática o con un ancho diferente no está soportada y puede producir resultados incorrectos.
- Las respuestas generadas no deben tratarse como cálculos fiables en ningún contexto de producción; es un modelo de investigación, no una herramienta aritmética general.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de cualquier uso fuera del ámbito académico.
- El repositorio contiene código personalizado de Transformers, lo que implica un riesgo de seguridad al cargar el modelo con `trust_remote_code=True`. Se recomienda fijar la revisión (commit) y auditar el código antes de ejecutarlo.
- No se proporcionan datos sobre sesgos, ya que la tarea es puramente aritmética y no involucra lenguaje natural; sin embargo, la falta de generalización a otros formatos numéricos es una limitación inherente.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco difundido; la documentación puede ser incompleta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/melephant/1-layer-addition
- Artículo asociado (arXiv): https://arxiv.org/abs/2405.14813
- Carpeta de entrenamiento y configuración: dentro del repositorio, en `training/`
- Manifiesto de exportación: `export_manifest.json` en el repositorio
