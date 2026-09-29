# americansquid/gpt-2-xl-alpaca-4bit-merged

## Resumen

GPT-2 XL Alpaca 4-bit Merged es un checkpoint derivado de `openai-community/gpt2-xl` (1.557.611.200 parametros, 48 capas, 25 cabezas de atencion, dimension de embedding 1600) afinado con QLoRA sobre el dataset de instrucciones `yahma/alpaca-cleaned` y posteriormente cuantizado a 4 bits con MLX. Lo publica el usuario americansquid bajo licencia MIT y esta pensado para inferencia de baja memoria en Apple Silicon mediante `mlx-lm`. El repositorio ocupa 1,0 GB y el checkpoint en disco ronda los 977 MB, frente a los aproximadamente 6 GB que ocuparia el modelo en precision completa.

El problema que resuelve es acotado: convertir un modelo de lenguaje causal de 1,5B de parametros, entrenado originalmente para continuacion de texto, en un asistente que sigue instrucciones segun la plantilla Alpaca, y hacerlo caber en equipos con memoria unificada modesta. Para ello se aplico un LoRA de rango 16 y alpha 32 sobre los modulos `c_attn` y `c_proj`, se fusiono el delta de pesos sobre las capas lineales ya cuantizadas y se reexporto todo a `safetensors` en formato MLX 4-bit afin (`bits: 4`, `group_size: 64`, `mode: affine`).

Su relevancia es fundamentalmente practica y de nicho: sirve como banco de pruebas reproducible de un pipeline completo de QLoRA mas fusion de pesos en 4 bits sobre MLX, y como modelo didactico de muy bajo coste. No compite con los modelos de 1-3B actuales en razonamiento, codigo o multilingueismo: hereda la arquitectura GPT-2 de 2019 y su ventana de contexto de 1024 tokens, y esta entrenado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT-2, post-norm, atencion completa) |
| Parametros totales | 1.557.611.200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (maximo de GPT-2) |
| Tipos de cuantizacion | 4-bit afin de MLX (`bits: 4`, `group_size: 64`, `mode: affine`); el autor solo publica este checkpoint cuantizado en el repo |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (formato MLX) |
| Libreria de inferencia | mlx / mlx-lm |
| Tamano en disco | ~977 MB (repo: 1,0 GB) |
| Modelo base | openai-community/gpt2-xl |
| Dataset de ajuste | yahma/alpaca-cleaned (51,7k ejemplos) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

La base es GPT-2 XL: un transformer decoder-only con 48 bloques, 25 cabezas de atencion y dimension de modelo 1600, con embeddings de posicion aprendidos y una longitud maxima de secuencia de 1024 tokens. Es una arquitectura de atencion densa clasica, sin mecanismos modernos como RoPE, GQA, atencion lineal, decodificacion especulativa ni modos de razonamiento extendido. El modelo base fue entrenado por OpenAI como modelo de modelado de lenguaje autorregresivo sobre texto web en ingles.

El ajuste se hizo con QLoRA supervisado (SFT) durante 1,0 epoca sobre `yahma/alpaca-cleaned`, una version limpiada del conjunto de instrucciones de Stanford Alpaca con 51,7k ejemplos. Los hiperparametros del adaptador son rango 16, alpha 32, dropout 0,05 y modulos objetivo `c_attn` y `c_proj`. El autor no documenta el optimizador, la tasa de aprendizaje, el tama\u00f1o de lote ni el hardware de entrenamiento, ni si hubo una etapa posterior de RLHF o DPO (no consta ninguna).

La innovacion tecnica del repo esta en la fusion, no en el entrenamiento: se desquantizan temporalmente los pesos `QuantizedLinear` de 4 bits a coma flotante, se suma el delta de LoRA calculado como `dW = (W_B x W_A) * (alpha / r)`, se recuantiza el resultado con `nn.QuantizedLinear.from_linear` (`group_size=64`, `bits=4`) y se exportan los pesos fusionados y el tokenizador a `safetensors`. Esto evita cargar el adaptador por separado en tiempo de inferencia y reduce el uso de memoria a costa de una perdida de precision adicional por la recuantizacion del delta.

## Capacidades

- Generacion de texto autoregresiva en ingles con formato de instruccion y respuesta.
- Seguimiento de instrucciones simples mediante la plantilla Alpaca (con y sin campo `Input` para contexto adicional).
- Tareas basicas de resumen, reescritura y respuesta a preguntas cortas, siempre que la entrada quepa en 1024 tokens.
- Redaccion creativa de formato corto (el ejemplo incluido en la model card es un haiku sobre inteligencia artificial).
- Clasificacion y extraccion de informacion en formato prompt-respuesta.
- No soporta tool calling ni function calling: la model card no documenta plantillas de herramientas ni tokens especiales para ello.
- No soporta uso agentico ni razonamiento multi-paso estructurado.
- No tiene capacidades de vision, audio ni modo de pensamiento explicito.
- Monolingue: unicamente ingles.

## Casos de uso

- Prototipado rapido de asistentes de instrucciones en local: con 977 MB en disco y una ventana de 1024 tokens, permite validar plantillas de prompt y flujos de generacion en un Mac antes de migrar a un modelo mayor.
- Inferencia en Apple Silicon con memoria limitada: al estar cuantizado en 4 bits y usar MLX, puede ejecutarse en equipos con 8 GB de memoria unificada sin swap apreciable.
- Docencia y experimentacion con QLoRA: sirve como referencia reproducible de un pipeline completo de ajuste con LoRA, fusion del delta sobre pesos cuantizados y exportacion a `safetensors`.
- Generacion de texto creativo corto: poemas, eslóganes, descripciones de producto o variaciones de copy de menos de 1024 tokens, donde la latencia baja importa mas que la factualidad.
- Resumen de fragmentos cortos: parrafos o notas de hasta unas 700-800 palabras, dejando margen para la respuesta dentro de la ventana de contexto.
- Normalizacion y reformateo de texto: convertir listas en prosa, extraer campos de un parrafo o reescribir con un tono dado dentro de un pipeline de preprocesado.
- Evaluacion comparativa de tecnicas de cuantizacion: permite medir la degradacion de calidad introducida por la fusion en 4 bits frente al modelo base en precision completa.
- Generacion de datos sinteticos de bajo coste para pruebas de software: rellenar fixtures o textos de ejemplo donde no se requiere precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, AlpacaEval ni ninguna otra evaluacion cuantitativa, ni comparaciones con el modelo base o con el adaptador LoRA sin fusionar.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos: ~0,78 GB en 4 bits (1.557.611.200 parametros x 0,5 bytes), coherente con los ~977 MB reportados en disco.
- Cache KV: con 48 capas y 25 cabezas de dimension 64, la cache en fp16 consume aproximadamente 0,29 MB por token; a 1024 tokens de contexto son unos 294 MB (estimacion propia a partir de la configuracion de GPT-2 XL, no publicada por el autor).
- Memoria total orientativa en inference: del orden de 1,2-1,5 GB con contexto largo, mas el overhead del runtime. Estimacion, no dato del autor.
- Cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090) y en cualquier Mac Apple Silicon con 8 GB o mas de memoria unificada.
- Despliegue soportado de forma nativa: MLX y `mlx-lm` (Python y CLI `mlx_lm.generate`), exclusivamente en Apple Silicon. El repo no incluye pesos GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin una conversion previa.
- vLLM, TGI y otros servidores basados en CUDA/PyTorch no estan soportados por el formato publicado.
- Latencia y throughput: no disponibles. El autor solo indica que el objetivo es inferencia "rapida y de baja memoria" en Apple Silicon, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion publicada | Licencia | Enfoque |
|---|---|---|---|---|---|
| americansquid/gpt-2-xl-alpaca-4bit-merged | 1,56B | 1024 | 4-bit MLX afin | MIT | Instrucciones en ingles, optimizado para Apple Silicon |
| openai-community/gpt2-xl | 1,56B | 1024 | No (fp32/fp16) | MIT | Modelo base de continuacion de texto, sin ajuste de instrucciones |
| TinyLlama-1.1B-Chat | 1,1B | 2048 | Multiples (GGUF, etc.) | Apache-2.0 | Chat e instrucciones, entrenado sobre 3T tokens |
| Qwen2.5-1.5B-Instruct | 1,54B | 32768 | Multiples (GGUF, AWQ, GPTQ) | Apache-2.0 | Instrucciones multilingues con contexto largo |

No se dispone de resultados de benchmarks para el modelo de esta ficha, por lo que la comparacion se limita a especificaciones estructurales. En terminos de arquitectura y datos de entrenamiento, el checkpoint aqui descrito parte de un modelo de 2019 con un ajuste de 51,7k ejemplos y una sola epoca, mientras que las alternativas de la tabla incorporan contextos mas largos, mas idiomas y ecosistemas de despliegue mas amplios.

## Limitaciones y advertencias

- Ventana de contexto de 1024 tokens: cualquier conversacion multi-turno o documento mas largo requiere truncado, resumen previo o chunking.
- Modelo base de 2019: la calidad de razonamiento, codigo y matematicas esta muy por debajo de los modelos de su mismo tamano entrenados en la actualidad, aunque no hay benchmarks publicados que lo cuantifiquen.
- Riesgo alto de alucinacion: la model card advierte explicitamente de que puede producir afirmaciones seguras pero factualmente incorrectas, y recomienda verificar cualquier salida factual.
- Ausencia de moderacion: el autor recomienda filtrar o moderar las salidas antes de exponerlas en sistemas de produccion orientados a usuario.
- Sesgos: no se documenta ninguna evaluacion de sesgo. Al derivar de GPT-2 XL entrenado con texto web en ingles, es previsible que reproduzca sesgos de genero, raza y estereotipos presentes en ese corpus, pero no hay analisis publicado.
- Solo ingles: no hay capacidades multilingues y el rendimiento en castellano no esta evaluado (y previsiblemente sera pobre).
- Cuantizacion de 4 bits con fusion: la recuantizacion del delta de LoRA despues de dequantizar introduce una perdida de precision adicional que el autor no cuantifica.
- Sobreajuste probable: una sola epoca sobre 51,7k ejemplos con rango 16 sugiere un ajuste ligero; el modelo puede no haber adquirido un comportamiento de instrucciones robusto fuera de la plantilla exacta.
- Licencia MIT, por lo que el uso comercial esta permitido para el modelo. El autor senala que se deben respetar los terminos del dataset Alpaca, aunque `yahma/alpaca-cleaned` se distribuye con licencia Apache-2.0. Conviene verificar los terminos de los datos subyacentes de GPT-2 XL antes de un despliegue comercial.
- Dependencia de plataforma: el formato MLX solo se ejecuta en Apple Silicon. En Linux o Windows con GPU NVIDIA no es utilizable sin conversion y recuantizacion manuales.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de los datos, sin garantia de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/americansquid/gpt-2-xl-alpaca-4bit-merged
- Modelo base GPT-2 XL: https://huggingface.co/openai-community/gpt2-xl
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Repositorio de MLX: https://github.com/ml-explore/mlx
