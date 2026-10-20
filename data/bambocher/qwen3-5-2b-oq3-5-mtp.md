# bambocher/Qwen3.5-2B-oQ3.5-mtp

## Resumen

Qwen3.5-2B-oQ3.5-mtp es un checkpoint cuantizado del modelo Qwen3.5-2B, publicado en HuggingFace por el usuario bambocher. No es un modelo entrenado desde cero, sino una conversión de precisión mixta realizada con oQ (oMLX v0.7.1rc1), la herramienta del proyecto oMLX, y empaquetada en formato MLX para su ejecución sobre hardware de Apple. El checkpoint conserva 2.274.069.824 parámetros lógicos repartidos en tres componentes: el modelo de lenguaje (1,882B), una torre de visión (0,331B) y una cabeza MTP de predicción multi-token (0,061B), de modo que se trata de un modelo multimodal con soporte potencial de decodificación especulativa.

El interés técnico está en el esquema de cuantización: el 59,897% de los pesos se almacena a 3 bits con grupo 64, con fracciones menores en 4, 5, 6 y 8 bits, y un 14,967% que se mantiene en BF16. La media efectiva es de 5,886 bits por peso y el checkpoint completo ocupa 1,558 GiB, lo que permite ejecutar un modelo multimodal de 2,27B en equipos con memoria unificada muy limitada, incluidos Macs de gama base y dispositivos iOS/iPadOS.

Ahora bien, la información pública es mínima: no se declara licencia, idiomas, longitud de contexto ni resultados de benchmarks, y el repositorio registra 8 descargas y 0 likes desde su creación el 20 de octubre de 2026. Debe tratarse, por tanto, como un artefacto experimental de cuantización y no como un modelo validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la etiqueta del repositorio es `qwen3_5`. La estructura de pesos indica un modelo de lenguaje transformer más una torre de visión (0,331B) y una cabeza MTP (0,061B) |
| Parametros totales | 2.274.069.824 (2,27B lógicos) |
| Parametros activos | No disponible; no consta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización afín de precisión mixta (oQ, oMLX v0.7.1rc1) con grupo 64: 3 bits (59,897% de los pesos), 4 bits (2,259%), 5 bits (19,404%), 6 bits (3,460%), 8 bits (0,013%) y BF16 (14,967%). Media efectiva: 5,886 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` en formato MLX (librería `mlx`); repositorio de 1,7 GB / 1,558 GiB |
| Desglose por componente | Lenguaje: 1,882B (0,964 GB / 0,898 GiB); visión: 0,331B (0,663 GB / 0,617 GiB); cabeza MTP: 0,061B (0,046 GB / 0,043 GiB) |
| Tarea declarada (pipeline) | No disponible |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base Qwen3.5-2B: no se indican tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por refuerzo. Lo único documentado es el proceso de cuantización posterior, ejecutado con oQ (oMLX v0.7.1rc1). Este aplica precisión mixta por tensores: la mayor parte del modelo de lenguaje se comprime a 3 bits con grupo 64 (1,362B de pesos lógicos, 0,555 GiB de almacenamiento), mientras que una quinta parte se mantiene a 5 bits (0,441B) y un 15% permanece en BF16. El resultado es un checkpoint de 1,558 GiB con una media de 5,886 bits por peso, frente a los aproximadamente 4,55 GB que ocuparía el mismo modelo en BF16.

Un detalle relevante para la inferencia es la distribución del BF16: 0,340B de pesos lógicos en BF16 (0,634 GiB) coincide casi exactamente con el tamaño de la torre de visión (0,331B), lo que sugiere que la rama visual se conserva prácticamente sin cuantizar y que la agresividad de la compresión se concentra en el modelo de lenguaje. La presencia de una cabeza MTP de 0,061B es la otra innovación destacable: este tipo de cabecera se emplea habitualmente para decodificación especulativa, prediciendo varios tokens por paso para acelerar la generación, aunque el autor no documenta si está activada por defecto ni qué tasa de aceptación ofrece.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural: capacidad esperable por herencia del modelo base, aunque no hay evaluación publicada que la cuantifique.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,331B parámetros en BF16, por lo que se trata de un modelo multimodal de imagen y texto.
- Predicción multi-token: incorpora una cabeza MTP específica de 0,061B, orientada a decodificación especulativa.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; el autor no declara la lista de idiomas.
- Modo thinking, audio u otras modalidades: no disponible; solo consta visión y texto.
- Ejecución local en Apple Silicon mediante MLX: capacidad confirmada por el formato del checkpoint y la librería declarada.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con `mlx` o `mlx-vlm` para disponer de un modelo multimodal de 2,27B que ocupa 1,558 GiB en disco y cabe en un Mac con 8 GB de memoria unificada, sin depender de servicios en la nube.
- Procesamiento de documentos con componente visual: la torre de visión de 0,331B permite tareas de lectura de capturas, extracción de campos de facturas o transcripción de formularios en local, útil cuando el documento no puede salir de la máquina por motivos de confidencialidad.
- Asistentes de escritorio con privacidad estricta: al ejecutarse íntegramente en el dispositivo, encaja en escenarios de consultoría, sanidad o legal donde no se permite enviar datos a APIs externas.
- Investigación sobre cuantización de precisión mixta: el checkpoint es un caso de estudio directo para medir la degradación de un modelo multimodal cuando el 60% de los pesos baja a 3 bits y el resto se reparte entre 4, 5, 6 y 8 bits, comparándolo con el modelo base sin cuantizar.
- Estudio de decodificación especulativa: la cabeza MTP aislada (0,061B, 0,043 GiB) permite experimentar con predicción multi-token y medir tasas de aceptación y ganancia de throughput sobre el modelo de lenguaje.
- Aplicaciones móviles en iOS/iPadOS: el formato MLX es consumible desde MLX Swift, de modo que el checkpoint sirve para prototipar funciones de texto e imagen embebidas en una app sin servidor.
- Clasificación y etiquetado por lotes de imágenes en un Mac Studio: con 1,558 GiB de pesos, es viable mantener varias instancias o procesar lotes grandes en memoria unificada.
- Docencia y demostraciones: tamaño y requisitos de memoria permiten mostrar el ciclo completo de un modelo multimodal cuantizado en un portátil durante una clase o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a documentar el esquema de cuantización y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica de calidad, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- Almacenamiento: 1,7 GB en disco (1,558 GiB de pesos reales).
- Memoria para inferencia: los pesos suman 1,558 GiB; con caché KV y overhead del runtime, una estimación prudente para contexto corto se sitúa entre 2,5 y 4 GB de memoria unificada (estimación propia, no dato del autor; la longitud de contexto no está publicada).
- Plataforma: exclusivamente Apple Silicon (MLX). El formato de cuantización afín con grupo 64 es específico de MLX, por lo que no se puede cargar directamente en vLLM, TGI o llama.cpp sin una conversión previa.
- GPU compatibles: cualquier chip de la familia M (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Cabe en configuraciones de 8 GB de memoria unificada; no aplica a GPUs NVIDIA o AMD sin reconversión.
- Despliegue: `mlx` / `mlx-vlm` como runtime de referencia; herramientas de terceros con soporte MLX (LM Studio u otras) no están confirmadas en la información disponible. vLLM, TGI, Ollama y llama.cpp no son opciones directas para este checkpoint.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere que el autor prevé decodificación especulativa, pero no se publican cifras de tokens por segundo ni de tasa de aceptación.
- Nota sobre la rama visual: al conservarse en BF16, la torre de visión aporta 0,617 GiB que no se benefician de la compresión y dominan el coste de memoria relativo frente a su número de parámetros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Benchmarks publicados aquí |
|---|---|---|---|---|---|
| Qwen3.5-2B-oQ3.5-mtp (este) | 2,27B (1,882B lenguaje + 0,331B visión + 0,061B MTP) | No disponible | No disponible | MLX, safetensors, 1,558 GiB | No disponibles |
| Qwen2.5-VL-3B-Instruct | ~3,75B | No verificado en esta ficha | Apache 2.0 | safetensors (transformers), múltiples runtimes | No consultados |
| Gemma 3 4B | ~4B (nominal) | No verificado en esta ficha | Términos de uso de Gemma | safetensors, GGUF, MLX | No consultados |
| SmolVLM2-2.2B | ~2,2B | No verificado en esta ficha | Apache 2.0 | safetensors, GGUF, MLX | No consultados |

Los datos de las filas comparativas no proceden de la información proporcionada en esta ficha y deben verificarse en sus model cards respectivas antes de cualquier decisión. La diferencia más sustancial a favor de este checkpoint es el tamaño en disco (1,558 GiB frente a los aproximadamente 4,5 GB de un 2,27B en BF16); la principal desventaja es la ausencia total de licencia declarada, de idiomas y de evaluaciones, frente a alternativas con licencia explícita y benchmarks públicos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial, redistribución ni modificación. Es el riesgo más grave para cualquier adopción en producción.
- Idiomas no declarados: se desconoce si el modelo soporta castellano con calidad suficiente; no hay evaluación multilingüe.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede dimensionar la caché KV ni planificar casos de uso con documentos largos.
- Cuantización agresiva: el 59,897% de los pesos está a 3 bits con grupo 64. Es esperable una degradación medible en razonamiento, matemáticas y instrucciones complejas, pero no hay datos que la cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de 2B y acentuado por la compresión a 3 bits; no hay evaluaciones de fidelidad ni de tasas de error.
- Rama visual en BF16: aunque el modelo de lenguaje esté comprimido, la torre de visión concentra 0,617 GiB de los 1,558 GiB totales, lo que desequilibra el ahorro de memoria respecto a lo que sugiere el recuento de parámetros.
- Dependencia de plataforma: el checkpoint está atado al ecosistema MLX y a Apple Silicon; migrarlo a CUDA o a CPU requiere reconvertir los tensores cuantizados, con riesgo de pérdida de fidelidad en el proceso.
- Validación comunitaria nula: 8 descargas y 0 likes desde el 20 de octubre de 2026 indican que el checkpoint no ha sido reproducido ni auditado por terceros.
- Cabeza MTP sin documentación: se desconoce si está activa por defecto, cómo se integra en el runtime y si aporta ganancia real; su uso indebido podría producir salidas inconsistentes.
- Los resultados de la búsqueda web asociados a esta ficha corresponden a Cirium (analítica de aviación) y no guardan relación con el modelo; no aportan documentación técnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ3.5-mtp
- Herramienta de cuantización oQ (proyecto oMLX): https://github.com/jundot/omlx
- Model card del modelo base Qwen3.5-2B: no disponible en la información proporcionada
- Paper técnico: no disponible
- Blog o demo: no disponible
- Repositorio de código del modelo: no disponible
