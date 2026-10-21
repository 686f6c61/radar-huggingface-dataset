# bambocher/LFM2.5-24B-A2B-oQ2.5e

## Resumen

LFM2.5-24B-A2B-oQ2.5e es una cuantización de precisión mixta del checkpoint LFM2.5-24B-A2B, un modelo de lenguaje con arquitectura de mezcla de expertos (MoE) según la etiqueta `lfm2_moe` del repositorio. No lo publica el desarrollador original del modelo base, sino el usuario `bambocher`, que lo ha recomprimido con la herramienta oQ (oMLX v0.7.1) para ejecución en Apple Silicon mediante la librería MLX. El checkpoint resultante ocupa 8,678 GiB (9,318 GB) y pesa una media efectiva de 3,110 bits por parámetro, frente a los aproximadamente 48 GB que requeriría el mismo modelo en BF16.

El problema que resuelve es concreto: permitir que un modelo de 23.971.587.712 parámetros totales quepa en la memoria unificada de un Mac de gama alta (16-32 GB) sin recurrir a cuantizaciones uniformes de 4 bits. Para ello aplica una receta asimétrica: el 60,47 % de los pesos queda en 2 bits, el 35,27 % en 3 bits y solo un 4,23 % se preserva en 8 bits, presumiblemente en las capas más sensibles. La nomenclatura "A2B" sugiere del orden de 2.000 millones de parámetros activos por token, típico de la familia LFM2, aunque ese dato no está confirmado en la información disponible.

Su relevancia ahora es doble: por un lado, demuestra que las cuantizaciones mixtas sub-4 bits sobre modelos MoE son viables en el ecosistema MLX; por otro, es un artefacto con 8 descargas y 0 likes, sin model card de evaluación ni benchmarks publicados, por lo que debe tratarse como un experimento reproducible más que como un checkpoint listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer, según la etiqueta `lfm2_moe`; detalles de capas, número de expertos y atención no disponibles |
| Parámetros totales | 23.971.587.712 (23,972B) |
| Parámetros activos | No disponible de forma explícita; la nomenclatura "A2B" sugiere ~2B activos, sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta oQ: affine 2 bits (grupo 64), affine 3 bits (grupo 64), affine 8 bits (grupo 64), BF16 y FP32 residuales; 3,110 bits/peso efectivos |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la información proporcionada |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); no se publica GGUF |

Distribución detallada de la cuantización, según la model card:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2 bits, grupo 64 | 14,496B | 60,470 % | 4,219 GiB | 2,50 |
| Affine 3 bits, grupo 64 | 8,456B | 35,274 % | 3,445 GiB | 3,50 |
| Affine 8 bits, grupo 64 | 1,015B | 4,234 % | 1,004 GiB | 8,50 |
| BF16 | 0,005B | 0,022 % | 0,010 GiB | 16,00 |
| FP32 | 0,000B | 0,000 % | 0,000 GiB | 32,00 |
| **Total** | **23,972B** | **100 %** | **8,678 GiB** | **3,110** |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una mezcla de expertos identificada con la etiqueta `lfm2_moe`, propia de la familia LFM2.5. Esto implica que, por cada token, solo se activa una fracción de los 23,972B parámetros totales (presumiblemente ~2B según el sufijo "A2B"), lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño. La información proporcionada no detalla el número de expertos, el mecanismo de enrutamiento, la dimensión oculta, el número de capas ni si emplea atención lineal o híbrida.

Sobre el entrenamiento no hay ningún dato disponible: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO o una fase de razonamiento. La contribución técnica documentada de este repositorio es exclusivamente la cuantización: la herramienta oQ (oMLX v0.7.1) asigna precisión por tensor en lugar de aplicar un único ancho de bits, concentrando los 8 bits en el 4,234 % de los pesos (1,015B parámetros, 1,004 GiB) y dejando el grueso en 2 y 3 bits con grupos de 64 elementos. No se documenta qué criterio (sensibilidad por capa, magnitud, reconstrucción de error) guía esa asignación, ni se publica una evaluación de la perplejidad resultante.

## Capacidades

- Generación de texto autoregresiva en inglés y otros idiomas no especificados, con la calidad condicionada por la cuantización sub-4 bits.
- Razonamiento multietapa y matemáticas: capacidad heredada del modelo base, no verificada en este checkpoint.
- Generación de código: presumible en un modelo de esta familia, sin benchmarks publicados que lo respalden.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y planificación multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; la model card solo declara el componente de lenguaje ("Language model: 23,972B").
- Modo "thinking" o razonamiento explícito: no disponible.
- Inferencia local en Apple Silicon: única capacidad verificable del artefacto, gracias a su formato MLX y a su huella de 8,678 GiB.

## Casos de uso

- Asistente de código local en un Mac: cargar el checkpoint con MLX y usarlo como autocompletado o chat de refactorización dentro del editor. El reducido número de parámetros activos permite decodificación interactiva sin salir del portátil y sin enviar código a la nube.
- Prototipado de agentes con herramientas en estación de trabajo: al ser un MoE con pocos parámetros activos, deja margen de memoria para el runtime de herramientas, el índice vectorial y el historial de conversación en equipos de 32 GB.
- Experimentación académica con cuantización mixta: sirve como punto de comparación reproducible frente a recetas uniformes de 3 y 4 bits (GPTQ, AWQ, MLX 4-bit), midiendo la degradación por componente gracias a la tabla de distribución de bits publicada.
- Procesamiento por lotes de documentos en local con requisitos de confidencialidad: resúmenes y extracción de entidades sobre corpus internos en un Mac Studio, evitando transferencias a APIs externas.
- Evaluación comparativa de recetas de cuantización: al existir el mismo modelo en otras precisiones, permite aislar el impacto de los bits por grupo (64) y del reparto 2/3/8 sobre tareas concretas.
- Base para ajuste fino ligero (LoRA/QLoRA) en hardware de consumo: 8,678 GiB de pesos deja espacio para adaptadores de bajo rango y estados de optimizador en memoria unificada de 32-64 GB, siempre que la licencia lo permita (dato no disponible).
- Demostración y docencia: ilustra de forma tangible el compromiso entre huella de memoria y fidelidad de un modelo de ~24B en hardware no-datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de compresión (bits/peso efectivos y tamaño en disco), no evaluaciones de calidad (MMLU, HumanEval, GSM8K, perplejidad) ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- Pesos en disco y en memoria: 9,318 GB (8,678 GiB) para el conjunto del checkpoint; la carga implica ese footprint más el grafo de inferencia.
- VRAM/unified memory estimada para inferencia: en torno a 10-12 GB con cachés KV modestas (estimación propia, no publicada); requiere memoria unificada de Apple Silicon, ya que el formato es MLX.
- Cabe en consumer GPU de Apple: sí en equipos de 16 GB de memoria unificada, aunque con margen escaso para contexto largo y otras aplicaciones; configuración holgada en 24, 32 o más GB (M-series Pro/Max/Ultra).
- GPU NVIDIA/AMD: no aplicable por defecto; MLX no ejecuta sobre CUDA y no se publica GGUF para llama.cpp.
- Despliegue: `mlx-lm` (carga y generación), herramientas oMLX/oQ para inspección de la cuantización y LM Studio en su ruta MLX. vLLM y TGI no soportan este esquema de cuantización mixta tal cual; Ollama y llama.cpp quedan descartados mientras no exista una conversión a GGUF.
- Latencia y throughput: no disponibles. Cualitativamente, con ~2B parámetros activos por token (según nomenclatura, sin confirmar) se espera decodificación fluida en M-series, pero no hay mediciones publicadas que lo cuantifiquen en tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Huella | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ2.5e (este) | 23,972B totales (activos no confirmados) | No disponible | safetensors MLX, mixta 2/3/8 bits (3,110 bpw) | 8,678 GiB | No disponible | HuggingFace, 8 descargas |
| LFM2.5-24B-A2B (base, BF16) | 23,972B totales | No disponible | safetensors BF16 | ~44,6 GiB (cálculo a 2 bytes/parámetro) | No disponible en esta información | Repositorio del autor original, no enlazado aquí |
| Otras cuantizaciones del mismo modelo (4 bits uniforme, GGUF, etc.) | 23,972B | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos verificables de modelos alternativos de la misma categoría (MoE ~24B con ~2B activos) en la información suministrada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Cuantización agresiva: el 60,47 % de los pesos está a 2 bits, lo que previsiblemente degrada razonamiento fino, matemáticas y adherencia a instrucciones. No hay evaluación publicada que mida cuánto se pierde respecto al BF16.
- Artefacto de terceros: no lo publica el desarrollador original del modelo base; la receta oQ no está validada por el equipo que entrenó LFM2.5-24B-A2B.
- Sin señales de validación comunitaria: 8 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- Licencia no declarada: no se puede confirmar el uso comercial. Al derivar de un modelo base cuya licencia tampoco se detalla aquí, es imprescindible verificar los términos del checkpoint original antes de cualquier despliegue productivo.
- Idiomas y contexto desconocidos: sin esa información no se pueden dimensionar pipelines de contexto largo ni garantizar cobertura multilingüe.
- Dependencia de plataforma: al ser MLX puro, queda confinado a Apple Silicon; no hay ruta CUDA ni GGUF para servidores x86.
- Riesgo de alucinación: inherente a los modelos de lenguaje y agravado por la compresión a 2 bits; requiere verificación factual en cualquier uso con consecuencias.
- Sin datos de sesgo: no se ha publicado ninguna evaluación de sesgos sociales, toxicidad o alineación para este checkpoint.
- Reproducibilidad parcial: se documenta la versión de la herramienta (oMLX v0.7.1) y la distribución de bits, pero no los parámetros exactos de selección por tensor, lo que dificulta replicar la receta bit a bit.
- Nombre del repositorio ("oQ2.5e") y promedio de 3,110 bpw: conviene no confundirlo con una cuantización de 2,5 bits uniforme; es una mezcla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bambocher/LFM2.5-24B-A2B-oQ2.5e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM2.5-24B-A2B: no disponible en la información proporcionada (sin enlace verificado)
- Paper, blog o demo oficial: no disponibles en la información proporcionada
