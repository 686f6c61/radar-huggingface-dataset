# IFM/K2-Horizon-3.7B

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje decoder-only de tipo denso desarrollado por IFM, presentado como el miembro pequeno de la familia K2-Horizon. Segun la model card, se trata de un modelo con un nucleo de 3.700 millones de parametros y una ventana de contexto nativa de 524.288 tokens (512K), disponible desde las etapas de midtraining. El modelo se distribuye con pesos abiertos bajo licencia Apache 2.0 y esta disenado para generacion de texto conversacional en ingles.

La propuesta de valor del modelo reside en combinar un tamano reducido con un contexto extremadamente largo, algo poco habitual en modelos densos de esta escala. IFM acompana la publicacion con recursos de entrenamiento abiertos: receta y datos de preentrenamiento y midtraining, codigo de entrenamiento (xllm), codigo de evaluacion (Eval360) y checkpoints intermedios para estudiar la evolucion de capacidades a lo largo del entrenamiento.

Es relevante ahora porque se posiciona como una linea base pequena evaluada en los mismos benchmarks agenticos, de codigo y razonamiento que el resto de la familia, y porque su caracter completamente abierto (datos, receta, codigo y evaluacion) facilita la reproducibilidad y el estudio academico. Nota importante: la model card indica 3.7B, pero el dato real de los safetensors del repositorio es de 5.058.255.360 parametros, discrepancia que el desarrollador no explica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 3.7B segun model card; 5.058.255.360 segun safetensors del repo (dato real) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo denso, sin mezcla de expertos. La model card no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto que permite la ventana de 512K tokens; unicamente confirma que el contexto nativo de 524.288 tokens esta disponible desde las etapas de midtraining en adelante. El repositorio requiere `custom_code`, lo que implica que la implementacion de la arquitectura no es la estandar de transformers y necesita cargar codigo propio del autor.

En cuanto a datos, se referencian dos conjuntos publicos: `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`, ademas de un repositorio `DATA_NAVIGATOR` con todos los datos de entrenamiento. No se especifica en la informacion disponible el numero total de tokens, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. La publicacion de checkpoints intermedios es una innovacion destacable para el estudio de la evolucion de capacidades durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y tareas de codigo, evaluado en los mismos benchmarks agenticos y de codigo que el resto de la familia K2-Horizon.
- Procesamiento de contexto largo: ventana nativa de 524.288 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades agenticas: la model card menciona evaluacion en benchmarks agenticos, aunque no detalla soporte explicito de tool calling o function calling.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- No se documentan capacidades de vision, audio ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: el modelo puede ingerir libros tecnicos, expedientes legales o bases de codigo completas de hasta 512K tokens en una sola pasada, evitando estrategias de troceado y recuperacion.
- Revision de repositorios de codigo: con contexto de 512K, es posible cargar modulos enteros o multiples ficheros y solicitar refactorizaciones o auditorias de coherencia entre ellos.
- Atencion al cliente automatizada: conversaciones multi-turno con historial largo gracias a la ventana de contexto, manteniendo coherencia en sesiones extensas en ingles.
- Investigacion sobre entrenamiento de modelos: los checkpoints intermedios y los datos publicos permiten estudiar la aparicion de capacidades a lo largo del entrenamiento, un caso de uso academico directo.
- Generacion de resumenes de documentacion tecnica: procesamiento de manuales y especificaciones extensas sin perdida de contexto.
- Linea base para evaluacion comparativa: al ser un modelo denso pequeno con contexto largo, sirve como referencia en pipelines de evaluacion propios (Eval360) frente a modelos mayores de la misma familia.
- Prototipado en entornos con recursos limitados: su tamano reducido permite desplegarlo en una sola GPU, lo que facilita experimentacion rapida en ingles.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B. Sin embargo, en el fragmento de informacion proporcionado solo se recogen las filas de parametros, parametros activos y arquitectura; los valores numericos de los benchmarks (MMLU, HumanEval, GSM8K, etc.) no estan disponibles en el texto extraido.

| Modelo | Parametros | Arquitectura |
|---|---|---|
| K2-Horizon-3.7B | 3.7B (card) / 5.06B (safetensors) | Dense |
| Qwen3.5-4B | 4B | Dense |
| G9v3-3B | 3B | Dense |
| Granite 4.2-3B | 3B | Dense |
| Nemotron 3 Nano-4B | 4B | Dense |

Los resultados numericos de los benchmarks no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 10-11 GB solo para pesos (5.06B parametros), mas memoria para KV cache; con contexto de 512K la KV cache puede ser muy elevada y requerir tecnicas de atencion eficiente o cuantizacion de cache.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 3 GB para pesos, aunque la disponibilidad de pesos GGUF no esta confirmada.
- GPU recomendadas: A100 40/80 GB o H100 para explotar el contexto completo de 512K; RTX 4090 (24 GB) suficiente para inferencia en precision reducida con contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB para precision reducida y contextos no maximos; el contexto completo de 512K exige hardware profesional.
- Opciones de despliegue: transformers (con `custom_code`), vLLM y TGI previsiblemente previa integracion; llama.cpp y Ollama solo si se publican pesos GGUF, no confirmado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-3.7B | 3.7B (card) / 5.06B (safetensors) | 524.288 tokens | Apache 2.0 | Hugging Face, pesos abiertos, datos y codigo publicos |
| Qwen3.5-4B | 4B | no disponible en la informacion | no disponible en la informacion | referenciado en la model card |
| G9v3-3B | 3B | no disponible en la informacion | no disponible en la informacion | referenciado en la model card |
| Granite 4.2-3B | 3B | no disponible en la informacion | no disponible en la informacion | referenciado en la model card |
| Nemotron 3 Nano-4B | 4B | no disponible en la informacion | no disponible en la informacion | referenciado en la model card |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la model card remite a una imagen de benchmarks no incluida en el texto extraido.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 3.7B pero los safetensors suman 5.058.255.360 parametros; conviene verificar el conteo real antes de dimensionar infraestructura.
- Solo ingles: los metadatos indican `language: en`, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento mas alla de los repositorios referenciados.
- Contexto largo: aunque la ventana es de 512K tokens, no se documenta la degradacion del rendimiento en el extremo de la ventana; el coste de KV cache puede ser prohibitivo en produccion.
- Requiere `custom_code`: la carga con transformers necesita confiar en el codigo remoto del autor, lo que implica riesgos de seguridad y compatibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantias ni indemnizaciones; revisar terminos de los datasets referenciados.
- Tamano del repositorio: 688 GB, lo que incluye probablemente checkpoints intermedios y pesos en varias precisiones; la descarga completa es costosa en almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/IFM/K2-Horizon-3.7B
- Codigo de entrenamiento (xllm): https://github.com/ifm-ai/xllm
- Codigo de evaluacion (Eval360): https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
