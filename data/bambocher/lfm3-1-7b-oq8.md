# bambocher/LFM3-1.7B-oQ8

## Resumen

LFM3-1.7B-oQ8 es una cuantización del modelo de lenguaje LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según los safetensors), publicada por el usuario bambocher. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a precisión mixta mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización afín de 8 bits con grupos de 64 elementos a prácticamente la totalidad del checkpoint (99,978 % de los pesos lógicos). El resultado es un artefacto de 1,9 GB de repositorio con un promedio efectivo de 8,502 bits por peso.

El interés de esta ficha reside en su valor práctico para el ecosistema Apple Silicon: el formato MLX permite ejecutar el modelo de forma nativa en macOS sobre GPUs unificadas de la familia M, algo que los pesos originales en BF16 no siempre aprovechan con la misma eficiencia de memoria. Al mantener una cuantización de 8 bits en lugar de bajar a 4 bits, el autor prioriza la fidelidad numérica sobre la compresión máxima, lo que resulta relevante cuando se quiere conservar el comportamiento del modelo base sin disponer de grandes cantidades de memoria unificada.

Conviene subrayar que la información disponible es muy limitada: no se especifica la licencia, los idiomas soportados, el pipeline ni la model card del modelo original. Esta ficha documenta con rigor lo que consta en el repositorio y marca explícitamente como «no disponible» todo aquello que no se puede verificar, sin extrapolar capacidades a partir del nombre o del tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin de 8 bits con grupo de 64 (99,978 % de los pesos); BF16 residual (0,022 %); promedio efectivo 8,502 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx, custom_code) |
| Tamano del checkpoint | 1,837 GB / 1,711 GiB |
| Tamano del repositorio | 1,9 GB |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3), cuantizacion de precision mixta |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3 en los datos proporcionados: no se especifica si emplea un transformer denso convencional, atención lineal, SSM o una combinación híbrida, ni se detallan el número de capas, la dimensión oculta o la configuración de cabezas de atención. Tampoco consta el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

Lo que sí está documentado es el proceso de cuantización. Se aplicó oQ (oMLX v0.7.3), una técnica de cuantización de precisión mixta que asigna formatos distintos a distintos tensores según su sensibilidad. En este caso, el reparto es extremadamente homogéneo: 1,728 B de pesos lógicos (99,978 %) se almacenan en afín de 8 bits con tamaño de grupo 64, mientras que una fracción residual de 0,000 B (0,022 %) permanece en BF16, presumiblemente para preservar capas o tensores críticos como normas o embeddings. El desglose de almacenamiento indica que la totalidad de los 1,729 B de pesos lógicos corresponde al modelo de lenguaje, sin componentes multimodales ni cabezas adicionales.

El uso de grupos de 64 en la cuantización afín implica que cada bloque de 64 pesos comparte una escala y un sesgo de cuantización, lo que reduce el error de redondeo respecto a una escala por tensor y explica el promedio efectivo de 8,502 bits/peso: ligeramente por encima de 8 bits por los metadatos de escala y por el residuo en BF16.

## Capacidades

- Generación de texto autoregresiva: es la función básica esperable de un modelo de lenguaje de 1,7 B, aunque no se documentan tareas concretas en la información disponible.
- Razonamiento y conocimiento general: no disponible; no se han publicado evaluaciones que confirmen el nivel en MMLU u otros conjuntos.
- Generación de código: no disponible; no consta entrenamiento específico ni benchmarks tipo HumanEval.
- Matemáticas: no disponible; sin datos de GSM8K ni similares.
- Tool calling / function calling: no disponible; la model card no menciona soporte de llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se enumeran idiomas.
- Modo thinking, visión o audio: no disponible; el desglose de almacenamiento solo incluye el modelo de lenguaje, sin torres multimodales.
- Ejecución nativa en Apple Silicon: capacidad efectiva del artefacto, al estar empaquetado en formato MLX y poder cargarse con la librería `mlx` en macOS.

## Casos de uso

- Prototipado local en Mac con memoria unificada limitada: al ocupar 1,837 GB en disco y requerir un espacio en memoria del mismo orden, el modelo cabe en equipos con 8 GB de RAM unificada o más, lo que permite experimentar con un LLM de 1,7 B en 8 bits sin recurrir a servidores GPU.
- Asistentes de escritorio offline: integrado mediante MLX en una aplicación macOS, el modelo puede generar respuestas de texto sin conexión a internet, útil en entornos con requisitos de privacidad o sin red.
- Generación de texto en pipelines por lotes: para tareas de resumen, reescritura o clasificación de documentos donde no se necesita un modelo grande, la cuantización de 8 bits reduce el coste de memoria frente a BF16 manteniendo mayor fidelidad que una cuantización de 4 bits.
- Evaluación comparativa de técnicas de cuantización: el checkpoint sirve como referencia para medir la degradación de calidad de oQ a 8 bits frente al modelo original, gracias al desglose detallado de bits por peso que publica el autor.
- Fine-tuning ligero o adaptación con LoRA en Apple Silicon: el tamaño contenido del modelo permite cargarlo junto con adaptadores en una GPU unificada de gama alta, aunque no se documenta soporte oficial de entrenamiento.
- Docencia y experimentación académica: un modelo de 1,7 B en formato MLX es adecuado para demostrar el funcionamiento de la inferencia cuantizada en hardware de consumo, sin necesidad de clústeres.
- Despliegue en aplicaciones de chat de bajo volumen: para un asistente conversacional interno con pocas peticiones concurrentes, el modelo puede servirse desde un Mac Studio o un MacBook Pro, evitando costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de cuantización (bits por peso, reparto de almacenamiento y tamaño del checkpoint), sin incluir evaluaciones de calidad como MMLU, HumanEval, GSM8K o perplejidad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,8-2,2 GB para los pesos, más overhead de activaciones y caché KV; con contexto largo, el consumo puede crecer de forma notable, aunque la longitud de contexto no está documentada.
- GPU recomendadas: Apple Silicon con memoria unificada; el formato MLX está diseñado para GPUs de la familia M (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se garantiza su funcionamiento en CUDA sin reconversión.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; también podría convertirse a GGUF para GPUs NVIDIA de gama baja, aunque esa conversión no está documentada por el autor.
- Opciones de despliegue: `mlx` y `mlx-lm` en macOS son las vías naturales; llama.cpp, Ollama o vLLM requerirían una conversión de formato no incluida en el repositorio. El tag `custom_code` sugiere que la carga depende de código específico del autor o de la herramienta oQ.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-1.7B-oQ8 (este) | 1,729 B | no disponible | 8 bits afín, grupo 64 (oQ) | no disponible | safetensors MLX | Hugging Face, 0 descargas |
| Modelo base LFM3-1.7B | 1,729 B (presumible) | no disponible | BF16 original | no disponible | no disponible | no verificada en la informacion |
| Alternativas de ~1,5-2 B en MLX | no disponible | no disponible | 4-8 bits | variable | safetensors MLX | no disponible |

No se dispone de datos verificables sobre modelos comparables de la misma familia ni sobre sus resultados de benchmarks, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base LFM3 antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce qué lenguas cubre el modelo y con qué calidad, lo que impide garantizar un rendimiento aceptable en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; un modelo de 1,7 B tiene menor capacidad de conocimiento factual que modelos de decenas de miles de millones de parámetros.
- Degradación por cuantización: aunque 8 bits es una compresión moderada, la cuantización afín con grupo 64 introduce un error no nulo respecto a BF16; no se han publicado mediciones de perplejidad que cuantifiquen esa pérdida.
- Dependencia de `custom_code`: el tag indica que la carga puede requerir código personalizado de la herramienta oQ, lo que complica la portabilidad a otros runners distintos de MLX.
- Ecosistema restringido: al estar empaquetado solo para MLX, no es directamente utilizable en vLLM, TGI o llama.cpp sin conversión previa.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y de informes de errores.
- Contexto desconocido: sin la longitud de contexto documentada, no se puede planificar su uso en tareas que requieran ventanas largas (documentos extensos, conversaciones multi-turno prolongadas).
- Sin benchmarks: no hay evidencia publicada de calidad en tareas de razonamiento, código o matemáticas, por lo que cualquier afirmación sobre su rendimiento sería especulativa.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ8
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX (Apple): no incluida en la información proporcionada
- Model card del modelo base LFM3: no disponible en la información proporcionada
