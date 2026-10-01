# SirSahOl/Tev1-0.8B-experimental-chat-mlx-8bit

## Resumen

Tev1-0.8B-experimental-chat-mlx-8bit es una conversion cuantizada a 8 bits del modelo togethercomputer/Tev1-0.8B-experimental, realizada por el usuario SirSahOl mediante la libreria MLX de Apple. Se trata de un modelo de generacion de texto de tipo conversational, construido sobre la arquitectura Qwen3_5ForConditionalGeneration, con aproximadamente 752 millones de parametros reales (etiquetado como 0.8B) y una longitud de contexto de 32.768 tokens. El objetivo del artefacto es ofrecer inferencia nativa sobre GPU de Apple Silicon (M1, M2, M3, M4) con una huella de memoria muy reducida.

El modelo base pertenece a Together AI y las etiquetas del repositorio lo clasifican como experimental y como decision-model, ademas de incluir image-text-to-text, lo que sugiere capacidades multimodales, aunque no se detallan en la informacion disponible. La version aqui descrita es una cuantizacion de 8 bits (media de 8.25 bits por peso) que ocupa unos 855 MB en disco en formato safetensors MLX, con un footprint de VRAM activo de aproximadamente 990 MB.

Su relevancia actual radica en que permite ejecutar un modelo conversacional de contexto largo en equipos de consumo con memoria unificada de 8 GB o mas, con velocidades medidas de 52.29 tokens por segundo en un Apple M1. La licencia figura como desconocida (unknown), lo que constituye un punto de atencion importante antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer, segun nomenclatura del model card) |
| Parametros totales | 752.393.024 (segundos safetensors); etiquetado como 0.8B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8 bits (media de 8.25 bits por peso); existen variantes 4-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | safetensors en formato MLX (Apple Silicon nativo) |

## Arquitectura y entrenamiento

La arquitectura se declara como Qwen3_5ForConditionalGeneration, lo que la situa en la familia Qwen 3.5 de decodificadores transformer, con una variante orientada a generacion condicional. Las etiquetas del repositorio incluyen image-text-to-text, lo que apunta a un posible soporte multimodal de entrada de imagen y texto, si bien el model card no aporta detalles sobre el encoder visual ni sobre la composicion del dataset. No se especifica si el modelo es denso o de mezcla de expertos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. El modelo base (togethercomputer/Tev1-0.8B-experimental) esta marcado como experimental, sin que se publiquen detalles de su proceso de entrenamiento en la informacion proporcionada. La innovacion tecnica del artefacto descrito es exclusivamente la conversion a MLX con cuantizacion de 8 bits, realizada con mlx-lm 0.31.3 en 4 segundos y generando una salida de 782 MB.

## Capacidades

- Generacion de texto conversacional con plantilla de chat basada en los tokens `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`.
- Manejo de contexto largo de hasta 32.768 tokens, apto para conversaciones multiturno extensas.
- Posible soporte de entrada image-text-to-text segun las etiquetas del repositorio (no confirmado en el model card).
- Clasificacion como decision-model en las etiquetas, lo que sugiere uso en tareas de decision o enrutado (no detallado).
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible) y con transformers.
- Integracion con `mlx_lm.chat` y `mlx_lm.generate` para CLI y con la API de Python para carga y generacion.
- Soporte de plantilla de chat con roles system, user y assistant.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar dialogos multiturno con hasta 32.768 tokens de contexto, ejecutandose integramente en la GPU de Apple Silicon sin conexion a internet, lo que resulta adecuado para herramientas de chat de escritorio con datos sensibles.
- Prototipado rapido de agentes conversacionales: su reducido footprint (~990 MB) permite levantarlo junto a un IDE o un navegador en equipos con 8-16 GB de memoria unificada, acelerando iteraciones de desarrollo.
- Clasificacion y enrutado de decisiones: dada su etiqueta decision-model, puede emplearse para seleccionar acciones o rutas en pipelines, aunque la falta de benchmarks impide garantizar su precision.
- Tareas de generacion de texto corto y resumen: con velocidades de 52,29 tokens/s en M1, es viable para resumir documentos o generar respuestas breves en aplicaciones de escritorio.
- Evaluacion e investigacion de cuantizacion: al existir variantes 4-bit, 8-bit y 16-bit del mismo modelo, sirve como banco de pruebas para medir el impacto de la cuantizacion en calidad y latencia.
- Despliegue en entornos con recursos limitados: su VRAM de ~990 MB lo hace apto para maquinas de gama de entrada con macOS y memoria unificada de 8 GB, donde modelos mayores no caben.
- Experimentacion multimodal (cautela): si se confirma el soporte image-text-to-text, podria usarse para descripcion de imagenes o dialogos sobre contenido visual, pero no hay documentacion que lo respalde.
- Inferencia en local mediante Ollama: el model card incluye un Modelfile de ejemplo con los stop tokens y la temperatura recomendada (0.7), lo que facilita el despliegue rapido.

## Benchmarks y rendimiento

El model card incluye unicamente mediciones de rendimiento en hardware Apple M1 (promedio de 5 ejecuciones, maximo de 256 tokens), sin resultados de calidad como MMLU, HumanEval o GSM8K.

| Metrica | 4-bit | 8-bit | 16-bit |
|---|---|---|---|
| Tokens/segundo | 84,99 | 52,29 | 32,34 |
| TTFT (time to first token) | 11,77 ms | 19,14 ms | 30,93 ms |
| Memoria maxima (peak) | 560,4 MB | 784,1 MB | 419,8 MB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (variante 8-bit): aproximadamente 990 MB activos; memoria maxima medida de 784,1 MB en M1.
- Memoria unificada minima recomendada: 8 GB (Apple Silicon).
- GPU recomendadas: segun el model card, Apple M1, M2, M3 o M4 con 8 GB o mas de memoria unificada. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) porque el formato es MLX, especifico de Apple Silicon.
- Compatibilidad con GPU de consumo: si, en cualquier chip de la familia M de Apple con al menos 8 GB de memoria unificada.
- Opciones de despliegue: mlx-lm (CLI y API Python), Ollama (con el Modelfile proporcionado), y teoricamente cualquier runtime compatible con MLX. Para la variante 16-bit se recomienda 36-192 GB (Max/Ultra).
- Latencia y throughput estimados: 52,29 tokens/s y 19,14 ms de TTFT en 8 bits sobre M1; 84,99 tokens/s y 11,77 ms en 4 bits.
- Distribucion de disco: aproximadamente 855 MB para la variante 8-bit (salida de conversion reportada: 782,0 MB).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de modelos comparables de la misma categoria en la informacion proporcionada. La comparacion posible se limita a las variantes de cuantizacion del propio modelo:

| Variante | Tamano en disco | Footprint VRAM | Hardware objetivo | Ventaja clave |
|---|---|---|---|---|
| 4-bit | ~450 MB | ~490 MB | M1/M2/M3/M4 (8 GB+) | Maxima velocidad, minima presion de memoria |
| 8-bit (esta) | ~855 MB | ~900 MB | M1/M2/M3/M4 (8 GB+) | Precision casi sin perdida con footprint ligero |
| 16-bit | ~1620 MB | ~1690 MB | M1/M2/M3/M4 (8 GB+) | Precision completa sin cuantizar |

Comparativa con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Licencia desconocida (unknown): no hay autorizacion explicita para uso comercial, lo que supone un riesgo legal relevante en produccion.
- El repositorio apenas tiene traccion: 0 descargas y 0 likes en el momento de la consulta.
- El modelo base esta marcado como experimental, sin garantias de estabilidad ni de calidad.
- No se han publicado resultados de benchmarks de calidad (razonamiento, codigo, matematicas), por lo que se desconoce su precision real.
- No se documentan los idiomas soportados ni se detalla la composicion del dataset de entrenamiento, por lo que se desconoce el sesgo potencial.
- Riesgo de alucinacion no cuantificado; en modelos pequenos (0.8B) la tasa de alucinacion suele ser elevada, aunque no hay datos que lo confirmen aqui.
- El formato es MLX, especifico de Apple Silicon; no es directamente desplegable en GPU NVIDIA ni en CPU generica sin conversion adicional.
- El model card esta truncado en la seccion "Limitatio", por lo que las limitaciones declaradas por el autor no estan completas.
- Se recomienda configurar los stop tokens (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) para evitar bucles de generacion desbocados.
- El soporte image-text-to-text aparece solo como etiqueta, sin documentacion que lo confirme ni ejemplos de uso.

## Enlaces

- Repositorio HuggingFace (esta variante): https://huggingface.co/SirSahOl/Tev1-0.8B-experimental-chat-mlx-8bit
- Variante 4-bit: https://huggingface.co/SirSahOl/Tev1-0.8B-experimental-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/Tev1-0.8B-experimental-chat-mlx-16bit
- Modelo base: https://huggingface.co/togethercomputer/Tev1-0.8B-experimental
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
