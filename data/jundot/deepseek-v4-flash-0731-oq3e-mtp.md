# Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ3e-mtp es un checkpoint cuantizado en precisión mixta del modelo `deepseek-ai/DeepSeek-V4-Flash-0731`, publicado por el usuario Jundot bajo el identificador `Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp`. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del lanzamiento oficial de DeepSeek-V4-Flash, que según la model card incorpora capacidades agénticas mejoradas. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.1) empleando la variante Improved oQe Quantization, que asigna bits según la sensibilidad medida de cada capa.

El checkpoint resultante almacena 304.180.418.494 parámetros lógicos con una media efectiva de 3,639 bits por peso, lo que se traduce en 138,383 GB (128,879 GiB) de almacenamiento en safetensors. La estructura replica la de DeepSeek-V4-Flash-DSpark: incluye el backbone de lenguaje (284,335B de parámetros lógicos) y un cabezal de predicción multi-token (MTP) de 19,846B, con el módulo de decodificación especulativa asociado.

Su relevancia práctica es doble. Por un lado, reduce un modelo de más de 300.000 millones de parámetros a un tamaño manejable en equipos con memoria unificada grande, sin salir del ecosistema MLX de Apple. Por otro, conserva el módulo MTP, pensado para acelerar la generación mediante decodificación especulativa. El principal caveat es la ausencia total de benchmarks publicados y de especificaciones del modelo base (contexto, idiomas, arquitectura interna), lo que limita cualquier evaluación rigurosa previa a su adopción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint cuantizado del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731`, con estructura equivalente a DeepSeek-V4-Flash-DSpark; incluye backbone de lenguaje y cabezal MTP de decodificación especulativa) |
| Parámetros totales | 304.180.418.494 (304,180B) |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mezcla oQ3e: affine 3 bits grupo 64, affine 4 bits grupo 64, affine 5 bits grupo 64, affine 6 bits grupo 64, affine 8 bits grupo 64, MXFP4 grupo 32, MXFP8 grupo 32, BF16, FP32 e I32. Media efectiva: 3,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (precisión mixta), 138,383 GB / 128,879 GiB |
| Desglose de parámetros | Backbone de lenguaje: 284,335B (127,557 GB / 118,797 GiB); cabezal MTP: 19,846B (10,825 GB / 10,082 GiB) |
| Librería | mlx |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 |
| Autor | Jundot |
| Pipeline | text-generation |
| Fecha de creación | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo: es una cuantización del lanzamiento oficial DeepSeek-V4-Flash-0731, del que la model card solo indica que aporta capacidades agénticas mejoradas. La estructura declarada es idéntica a la de DeepSeek-V4-Flash-DSpark e incluye dos componentes: el backbone de lenguaje (284,335B de parámetros lógicos) y un cabezal de predicción multi-token (MTP) de 19,846B que actúa como módulo de decodificación especulativa. El número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF o DPO y el tipo exacto de arquitectura interna (transformer, MoE o híbrida) no se detallan en la información disponible.

La innovación técnica documentada está en el proceso de cuantización, ejecutado con oQ (oMLX v0.7.1) y la variante Improved oQe. El algoritmo asigna bits en función de la sensibilidad medida de cada capa y, a continuación, redondea cada grupo con una matriz de importancia construida con 1024 muestras de 512 tokens, aplicando un reajuste por mínimos cuadrados ponderados de la escala y el sesgo. El resultado es una distribución de bits muy asimétrica: el 91,073% de los pesos (277,025B) queda en affine 3 bits con grupo 64, el 6,354% (19,327B) en MXFP4 con grupo 32 y el resto se reparte entre 4, 5, 6 y 8 bits, MXFP8, BF16, FP32 e I32.

| Formato de almacenamiento | Pesos lógicos | Proporción | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3 bits, grupo 64 | 277,025B | 91,073% | 112,875 GiB | 3,50 |
| Affine 4 bits, grupo 64 | 1,635B | 0,538% | 0,857 GiB | 4,50 |
| MXFP4, grupo 32 | 19,327B | 6,354% | 9,562 GiB | 4,25 |
| Affine 5 bits, grupo 64 | 0,497B | 0,163% | 0,318 GiB | 5,50 |
| Affine 6 bits, grupo 64 | 2,416B | 0,794% | 1,828 GiB | 6,50 |
| Affine 8 bits, grupo 64 | 1,078B | 0,354% | 1,067 GiB | 8,50 |
| I32 | 0,002B | 0,001% | 0,009 GiB | 32,00 |
| MXFP8, grupo 32 | 1,996B | 0,656% | 1,917 GiB | 8,25 |
| BF16 | 0,167B | 0,055% | 0,310 GiB | 16,00 |
| FP32 | 0,036B | 0,012% | 0,135 GiB | 32,00 |
| **Total** | **304,180B** | **100%** | **128,879 GiB** | **3,639** |

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`); el modelo produce texto autoregresivamente a partir de un prompt.
- Capacidades agénticas mejoradas: la model card del modelo base las menciona de forma explícita, aunque sin detallar qué herramientas o protocolos soporta.
- Decodificación especulativa mediante MTP: el checkpoint incluye los pesos del cabezal DSpark MTP, lo que permite acelerar la generación si el runtime empleado implementa decodificación especulativa sobre ese módulo.
- Razonamiento y código: no disponible; no se documentan capacidades específicas ni resultados que las respalden.
- Tool calling / function calling: no disponible en la información proporcionada, más allá de la mención genérica a capacidades agénticas.
- Multilingüismo: no disponible; el campo de idiomas no está declarado.
- Visión o audio: no disponible; el pipeline declarado es únicamente de generación de texto.
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Ejecución local en hardware Apple de gama alta: el formato MLX y los 128,879 GiB de pesos permiten servir un modelo de 304B en un Mac Studio o Mac Pro con memoria unificada muy amplia, sin depender de GPUs NVIDIA ni de servicios en la nube.
- Investigación sobre cuantización extrema: al ser un caso de precisión mixta a 3,639 bits/peso con asignación por sensibilidad de capa, sirve como referencia para estudiar la degradación de calidad frente a cuantizaciones uniformes de 4 bits.
- Evaluación de decodificación especulativa: al conservar el cabezal MTP, permite medir la ganancia de throughput que aporta la decodificación especulativa frente a la generación token a token en el mismo checkpoint.
- Desarrollo de agentes en local: si las capacidades agénticas del modelo base se confirman en la práctica, el checkpoint puede usarse para orquestar tareas multi-paso en un entorno sin conexión, útil en dominios con requisitos de privacidad.
- Prototipado de asistentes conversacionales: el tamaño del modelo permite mantener conversaciones de dominio general con calidad alta en una máquina única, sacrificando velocidad si la ventana de contexto es amplia.
- Reproducción y verificación de cuantizaciones: el desglose por componente y por formato de bits publicado por el autor facilita auditar el proceso con oQ y comparar resultados con otras cuantizaciones del mismo modelo base.
- Despliegue en pipelines de generación por lotes: en un equipo con memoria suficiente, el modelo puede procesar lotes de prompts de forma secuencial o batcheada mediante MLX, siempre que se acepte la ausencia de benchmarks que garanticen la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente documenta métricas de cuantización (media efectiva de 3,639 bits/peso y distribución de bits por formato), no métricas de calidad como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base en precisión completa.

## Requisitos de hardware

- VRAM o memoria unificada para los pesos: 128,879 GiB solo para el checkpoint. Cualquier presupuesto realista debe añadir memoria para caché KV, buffers de activaciones y overhead del runtime; como estimación derivada, un mínimo práctico de ~140-150 GB de memoria unificada resulta razonable.
- Nota: el autor no publica requisitos de hardware, por lo que las cifras anteriores son derivaciones aritméticas a partir del tamaño del repositorio, no datos oficiales.
- GPU recomendadas: no disponible. El formato es MLX, pensado para Apple Silicon, por lo que las GPU NVIDIA tipo A100, H100 o RTX 4090 no son el objetivo declarado del checkpoint sin una conversión previa.
- Hardware consumer: no cabe en GPUs de consumo con 24 GB ni en Macs con 64 GB o 128 GB de memoria unificada. Sería necesario un equipo con al menos ~192 GB y, preferiblemente, 256 GB o más de memoria unificada para dejar margen a la caché KV.
- Opciones de despliegue: MLX mediante la librería `mlx` y la herramienta oMLX del propio autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos pesos; su uso exigiría conversiones no descritas en la model card.
- Latencia y throughput: no disponible. No hay mediciones publicadas, ni siquiera del efecto del módulo MTP sobre la velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Almacenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp | 304,180B | Mezcla oQ3e, 3,639 bits/peso efectivos | 138,383 GB / 128,879 GiB | MIT | Peso MLX público; 0 descargas |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 304,180B (según el modelo cuantizado) | BF16 (16 bits/peso, estimado) | ~608,4 GB / ~566,6 GiB (estimación aritmética a partir del número de parámetros) | MIT | Modelo oficial de DeepSeek |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la única que puede hacerse con los datos disponibles. La reducción de almacenamiento es de aproximadamente 4,4 veces (de unos 566,6 GiB en BF16 a 128,879 GiB a 3,639 bits/peso). Si se aplicase una cuantización affine uniforme de 4 bits con grupo 64 al checkpoint completo, manteniendo los 4,50 bits/peso efectivos que el autor reporta para ese formato, el resultado sería de unos 159,4 GiB: aproximadamente un 24% más de almacenamiento que la mezcla oQ3e publicada. No se conocen cuantizaciones alternativas comparables del mismo modelo base con datos verificables, ni alternativas de otros autores de tamaño similar con métricas publicadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ningún dato de calidad que permita estimar la degradación introducida por la cuantización a 3,639 bits/peso frente al modelo en BF16.
- Cuantización agresiva: el 91,073% de los pesos queda en affine 3 bits con grupo 64, el formato más agresivo del checkpoint. Es esperable una pérdida de precisión en tareas sensibles al detalle, como razonamiento de cadena larga, matemáticas o generación de código, aunque no se cuantifica en la model card.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha publicado ninguna evaluación específica para este checkpoint ni para su modelo base en la información disponible.
- Idiomas no declarados: el campo de idiomas aparece vacío, por lo que no puede garantizarse un rendimiento multilingüe concreto.
- Contexto no declarado: sin longitud de contexto publicada, no es posible planificar despliegues que dependan de ventanas largas ni dimensionar la caché KV con precisión.
- Dependencia del ecosistema MLX: el formato no es directamente utilizable en CUDA ni en runtimes como vLLM, llama.cpp, Ollama o TGI. El uso queda restringido a Apple Silicon con `mlx` u oMLX.
- Dependencia del módulo MTP: la ganancia por decodificación especulativa solo se materializa si el runtime implementa soporte para el cabezal DSpark incluido. Sin ese soporte, el cabezal añade 10,082 GiB de almacenamiento sin beneficio práctico.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar el comportamiento real de los pesos.
- Licencia: el checkpoint se distribuye bajo MIT, lo que en principio permite uso comercial, pero conviene verificar de forma independiente la licencia y las condiciones del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731` antes de un despliegue en producción.
- Requisitos de memoria muy altos: cerca de 129 GiB solo para los pesos, lo que excluye por completo el hardware de consumo habitual.
- Fechas: la model card y el repositorio están fechados en octubre de 2026, posteriores a la mayoría de referencias públicas disponibles; conviene comprobar si el modelo base ha sido revisado o sustituido desde entonces.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo. Los resultados devueltos por la búsqueda no guardan relación con el modelo ni con el ecosistema MLX.
