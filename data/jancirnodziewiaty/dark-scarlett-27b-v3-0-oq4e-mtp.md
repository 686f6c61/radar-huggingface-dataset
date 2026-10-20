# jancirnodziewiaty/Dark-Scarlett-27B-v3.0-oQ4e-mtp

## Resumen

Dark-Scarlett-27B-v3.0-oQ4e-mtp es un checkpoint cuantizado en formato MLX del modelo ReadyArt/Dark-Scarlett-27B-v3.0, publicado por el usuario jancirnodziewiaty. No es un entrenamiento nuevo: contiene los pesos del modelo base convertidos con oQ (oMLX v0.7.1rc1), una herramienta de cuantización de precisión mixta, hasta un promedio efectivo de 4,887 bits por peso. El resultado ocupa 15,806 GiB y está pensado para inferencia local con la librería MLX en Apple Silicon.

El artefacto conserva 27.781.427.952 parámetros: 26,896B en el modelo de lenguaje, 0,461B en la torre de visión y 0,425B en una cabeza MTP (multi-token prediction). Los tags lo adscriben a la familia qwen3_5, pero la model card no documenta longitud de contexto, idiomas, licencia ni datos de entrenamiento. Su interés práctico es doble: permite ejecutar un modelo multimodal de ~28B en un Mac con 24-32 GB de memoria unificada y sirve como banco de pruebas para decodificación especulativa mediante la cabeza MTP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (según el tag `qwen3_5`), con torre de visión y cabeza MTP; no documentada en la model card |
| Parámetros totales | 27.781.427.952 (27,78B) |
| Parámetros activos | No disponible (no se documenta configuración MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Affine 4-bit group 64 (80,783% de los pesos), affine 5-bit group 64 (17,360%), BF16 (1,857%); 4,887 bits/peso efectivos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX; repositorio de 17,0 GB (15,806 GiB de pesos) |

## Arquitectura y entrenamiento

El checkpoint se compone de tres bloques: el modelo de lenguaje (26,896B de parámetros, 15,736 GB), una torre de visión (0,461B, 0,921 GB almacenada en BF16) y una cabeza MTP (0,425B, 0,314 GB). La presencia de la torre de visión implica soporte de entrada de imágenes, y la cabeza MTP está asociada a técnicas de predicción multi-token, habitualmente empleadas para decodificación especulativa y aceleración de la generación. La model card no describe la arquitectura interna, el número de capas, la dimensión oculta ni el mecanismo de atención.

La cuantización se aplicó con oQ en precisión mixta, asignando 4 bits a la mayor parte de los pesos y 5 bits a un subconjunto seleccionado, mientras que la torre de visión y una fracción pequeña de tensores se mantienen en BF16. No hay información sobre los datos de entrenamiento del modelo base, sobre si hubo RLHF, DPO u otras fases de alineamiento, ni sobre el proceso de selección de capas que guio la asignación de bits.

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, group 64 | 22,443B | 80,783% | 11,757 GiB | 4,50 |
| Affine 5-bit, group 64 | 4,823B | 17,360% | 3,088 GiB | 5,50 |
| BF16 | 0,516B | 1,857% | 0,961 GiB | 16,00 |
| Total | 27,781B | 100% | 15,806 GiB | 4,887 |

## Capacidades

- Generación de texto autoregresiva con un modelo de ~27B de parámetros.
- Entrada de imágenes: incorpora una torre de visión de 0,461B almacenada en BF16, por lo que el checkpoint conserva la ruta multimodal del modelo base.
- Predicción multi-token: incluye una cabeza MTP de 0,425B que puede aprovecharse para decodificación especulativa si el runtime la soporta.
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Razonamiento, código y matemáticas: no evaluados en la información disponible.

## Casos de uso

- **Inferencia local privada en Mac Apple Silicon**: el checkpoint de 15,8 GiB cabe en equipos con 24-32 GB de memoria unificada, lo que permite procesar texto e imágenes sin enviar datos a terceros.
- **Análisis de documentos con imágenes en entornos sensibles**: informes escaneados, capturas o diagramas pueden acompañarse de preguntas en texto gracias a la torre de visión, manteniendo el contenido dentro del dispositivo.
- **Investigación en cuantización de precisión mixta**: comparar la calidad de este checkpoint de 4,887 bits/peso frente al modelo base en BF16 permite evaluar la política de asignación de bits de oQ en un modelo multimodal de ~28B.
- **Experimentación con decodificación especulativa**: la cabeza MTP de 0,425B permite medir la aceleración y la tasa de aceptación de tokens en distintos prompts y longitudes de contexto.
- **Evaluación previa de fine-tunes de 27B**: sirve como versión ligera para probar el comportamiento del modelo base ReadyArt/Dark-Scarlett antes de descargar o desplegar los pesos completos.
- **Asistentes offline en movilidad**: un MacBook con 32 GB puede ejecutar el modelo sin conexión para tareas de redacción, resumen o extracción de información de imágenes en campo.
- **Prototipado interno con MLX**: validar pipelines de generación y de visión sobre mlx-lm antes de invertir en infraestructura CUDA o en una conversión a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en BF16, por lo que no es posible cuantificar la pérdida de calidad asociada a la cuantización de 4,887 bits/peso.

## Requisitos de hardware

- **Peso de los pesos**: 15,806 GiB (16,971 GB en disco, repositorio de 17,0 GB).
- **Memoria estimada para inferencia**: alrededor de 18-20 GB para contexto corto, sumando pesos, overhead del runtime y caché KV; 24 GB es el mínimo ajustado y 32 GB la opción recomendada (estimación a partir del tamaño del checkpoint, no de pruebas publicadas).
- **Contexto largo**: se recomiendan 64 GB de memoria unificada; la longitud de contexto no está documentada y el consumo de la caché KV no puede calcularse con los datos disponibles.
- **Apple Silicon**: M1/M2/M3/M4 en configuraciones Pro, Max o Ultra con 24, 32, 64 o más GB de memoria unificada; es la única plataforma soportada de forma nativa por MLX.
- **GPU dedicadas**: una RTX 4090 o RTX 3090 de 24 GB podría alojar los pesos, pero MLX no se ejecuta sobre CUDA; no hay versión GGUF publicada y sería necesaria una conversión previa.
- **Opciones de despliegue**: mlx-lm y el ecosistema MLX. vLLM, TGI, llama.cpp y Ollama no cargan safetensors de MLX de forma directa; Ollama requeriría una conversión a GGUF que el autor no proporciona.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| Dark-Scarlett-27B-v3.0-oQ4e-mtp | 27,78B | No disponible | Texto e imagen | No disponible | safetensors MLX, 4,887 bits/peso | No disponibles |
| Qwen3-32B | 32,8B | 32 768 tokens nativo; 131 072 con YaRN | Texto | Apache 2.0 | safetensors, GGUF | Publicados por el autor, no reproducidos aquí |
| Gemma 3 27B | 27B | 128 000 tokens | Texto e imagen | Gemma Terms of Use | safetensors, GGUF | Publicados por el autor, no reproducidos aquí |
| Mistral Small 3.2 24B | 24B | 128 000 tokens | Texto e imagen | Apache 2.0 | safetensors, GGUF | Publicados por el autor, no reproducidos aquí |

Los datos de los modelos alternativos proceden de sus model cards públicas y no se han verificado ejecutando los modelos. La comparación de rendimiento con Dark-Scarlett no es posible porque no hay métricas publicadas.

## Limitaciones y advertencias

- **Licencia no declarada**: no se puede asumir uso comercial; es necesario contactar con el autor o con el titular del modelo base antes de desplegarlo en producción.
- **Trazabilidad incompleta**: al ser una cuantización de un modelo de terceros, los términos del modelo base ReadyArt/Dark-Scarlett-27B-v3.0 también condicionan su uso, y no se detallan en la información disponible.
- **Sin idiomas declarados**: no hay confirmación oficial de soporte de castellano ni de otras lenguas.
- **Contexto desconocido**: no se puede planificar la ventana de contexto para casos de uso con documentos largos.
- **Pérdida de calidad por cuantización**: 4,887 bits/peso implican una degradación esperada frente a BF16, especialmente en razonamiento y código, pero no se ha medido.
- **Dependencia de MLX**: los pesos no son directamente utilizables en CUDA, ROCm ni en runtimes habituales de servidor; esto limita el despliegue a Apple Silicon o exige conversiones no documentadas.
- **Cabeza MTP opcional**: solo aporta aceleración si el runtime implementa decodificación especulativa con ella; en caso contrario, se ignora.
- **Riesgo de alucinación**: inherente a los modelos generativos de esta escala; no hay evaluaciones de fidelidad ni de seguridad.
- **Sesgos no evaluados**: no se han publicado análisis de sesgo, toxicidad o alineamiento, ni para el modelo base ni para esta cuantización.
- **Madurez del artefacto**: 0 descargas y 0 likes en el momento de la consulta, con una model card mínima; conviene validar el checkpoint antes de integrarlo en cualquier pipeline.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jancirnodziewiaty/Dark-Scarlett-27B-v3.0-oQ4e-mtp)
- [Modelo base ReadyArt/Dark-Scarlett-27B-v3.0](https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v3.0)
- [Repositorio de oQ / oMLX](https://github.com/jundot/omlx)
- [Repositorio de MLX](https://github.com/ml-explore/mlx)
- [Repositorio de mlx-lm](https://github.com/ml-explore/mlx-lm)
