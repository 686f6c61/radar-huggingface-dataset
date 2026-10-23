# shubham-garg/qwen2.5-1.5b-alpaca-qlora-adapter

## Resumen

El repositorio `shubham-garg/qwen2.5-1.5b-alpaca-qlora-adapter` contiene un adaptador de ajuste fino LoRA/QLoRA entrenado sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, es decir, la variante instructiva de 1,5 mil millones de parámetros de la familia Qwen2.5, precuantizada en 4 bits por Unsloth para abaratar el entrenamiento. Lo publica el usuario shubham-garg con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB, coherente con un adaptador PEFT y no con un modelo completo fusionado.

No se trata de un modelo nuevo ni de un checkpoint autónomo: es un delta de pesos que debe cargarse junto al base para producir inferencia. Por el nombre se deduce un ajuste sobre el dataset Alpaca (instrucciones en inglés), aunque la model card no documenta ni el dataset exacto, ni los hiperparámetros de LoRA, ni el número de pasos; únicamente indica que se entrenó con Unsloth, que el resultado fue "2x más rápido" y que el idioma declarado es inglés.

Su relevancia es, por tanto, la de un artefacto de ejemplo o experimento de fine-tuning reproducible con Unsloth + TRL sobre un modelo pequeño, apto para aprender el flujo QLoRA y para desplegar en hardware muy modesto. No aporta innovaciones de arquitectura y no sustituye al modelo base para uso en producción, ya que el ajuste sobre datos sintéticos de instrucciones tiende a degradar capacidades de razonamiento y de tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (RoPE, SwiGLU, RMSNorm, GQA), con adaptador LoRA sobre el modelo base |
| Parámetros totales | Aproximadamente 1,54 mil millones en el modelo base; tamaño exacto del adaptador no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (hasta 131.072 con escalado YaRN); el adaptador no modifica la ventana |
| Tipos de cuantización | Entrenado sobre base en 4 bits (bitsandbytes NF4); tras fusionar admite BF16/FP16, GPTQ/AWQ y GGUF (Q4_K_M, Q5_K_M, Q8_0) |
| Idiomas soportados | Inglés según la model card; el base Qwen2.5 es multilingüe (decenas de idiomas), aunque el ajuste puede degradar lenguas distintas del inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio no incluye pesos fusionados |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Librería | transformers (compatible con text-generation-inference y endpoints_compatible) |
| Fecha de creación | 2026-10-22 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2, con atención de múltiples cabezas con consultas agrupadas (GQA), embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm, además de sesgo en las proyecciones QKV. Sobre él se aplicó un ajuste QLoRA: el base se mantiene congelado en precisión de 4 bits (NF4 de bitsandbytes) y solo se entrenan las matrices de bajo rango insertadas en las capas lineales. El entrenamiento se ejecutó con Unsloth (kernel optimizado que reduce memoria y acelera el paso hacia delante y hacia atrás) y con la librería TRL para el bucle de instrucciones.

La información publicada es mínima: no se especifican el rango y el alpha de LoRA, las capas objetivo, la tasa de aprendizaje, el número de épocas, el tamaño de lote efectivo ni la composición exacta del dataset. El nombre del repositorio sugiere el corpus Alpaca (unas 52.000 instrucciones en inglés generadas con `text-davinci-003`), pero no está confirmado en la model card. Tampoco hay constancia de una fase posterior de alineamiento (RLHF, DPO o preferencias), por lo que el comportamiento final es el del base instructivo matizado por el ajuste supervisado.

## Capacidades

- Generación de texto instructivo en inglés, con el formato de chat de Qwen2.5 (tokens especiales `im_start`/`im_end`).
- Respuesta a instrucciones de estilo Alpaca: reescritura, resumen, clasificación simple, extracción y explicaciones breves.
- Generación de código y resolución de problemas matemáticos elementales, heredadas del base instructivo, aunque previsiblemente mermadas por el ajuste.
- Soporte de tool calling / function calling y salida JSON estructurada en el modelo base; el adaptador no garantiza conservar esta capacidad.
- Ventana de contexto de 32.768 tokens (ampliable a 131.072 con YaRN) a nivel del base.
- Capacidad multilingüe del base (incluido español), aunque la model card solo declara inglés y el ajuste se hizo sobre datos en inglés.
- No dispone de visión, audio ni modo "thinking" explícito.
- No es un adaptador autónomo: requiere cargar el base `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit` y aplicar el delta.

## Casos de uso

- Aprendizaje y reproducción de QLoRA: sirve como ejemplo mínimo de flujo Unsloth + TRL + PEFT para quien quiera replicar un fine-tuning de instrucciones en una sola GPU de consumo, inspeccionando el adaptador y comparándolo con el base.
- Prototipado de asistentes de instrucciones en inglés: con 1,5 B de parámetros y ~1 GB en 4 bits, permite iterar sobre prompts y comportamiento conversacional en local antes de escalar a modelos mayores.
- Experimentos de destilación de estilos de respuesta: útil para comprobar cómo un corpus tipo Alpaca modifica el tono, la longitud y la estructura de las respuestas del base instructivo.
- Evaluación de degradación por ajuste: caso de estudio para medir cuánto pierde un modelo pequeño en tool calling, matemáticas o multilingüismo cuando se ajusta solo con instrucciones sintéticas en inglés.
- Base para fine-tunes posteriores por capas: al ser un adaptador de 0,1 GB, se puede versionar, fusionar o combinar con otros adaptadores en experimentos de composición (PEFT, merge-kit).
- Entornos con hardware muy limitado: demos offline en portátiles con GPU de 6-8 GB o incluso en CPU con GGUF, para pruebas de concepto sin coste de API.
- No recomendado como servicio de atención al cliente ni para código en producción: el tamaño y la falta de evaluación no lo justifican frente al base sin ajustar o a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones humanas, y tampoco se han encontrado referencias externas al repositorio en la búsqueda web realizada.

| Evaluación | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación de instrucciones (AlpacaEval, MT-Bench) | no disponible |
| Comparación con el modelo base | no disponible |

## Requisitos de hardware

- Inferencia en BF16/FP16 (modelo fusionado): unos 3,1 GB de pesos, más caché KV; con 32.768 tokens de contexto la caché KV ronda los 0,9 GB (28 capas, 2 cabezas KV, dimensión 128, dos tensores K/V en FP16).
- Inferencia en 8 bits: aproximadamente 1,6-1,7 GB de pesos.
- Inferencia en 4 bits (bnb NF4 o GGUF Q4_K_M): aproximadamente 1,0-1,1 GB de pesos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, e incluso en tarjetas de 6 GB con contexto reducido.
- GPU profesionales: una T4 (16 GB) o L4 bastan para varias instancias; A100/H100 solo tienen sentido para alta concurrencia, no por requisito de memoria.
- Despliegue: transformers + PEFT (carga del adaptador sin fusionar), vLLM o TGI tras fusionar con `merge_and_unload`, llama.cpp/Ollama con GGUF y Unsloth para reentrenamiento. El adaptador en 4 bits requiere bitsandbytes y GPU para cargarse tal cual.
- Latencia y throughput: no disponibles; no se han publicado mediciones. En una RTX 3060 se puede esperar un régimen de decenas de tokens por segundo con decodificación en 4 bits, pero es una estimación orientativa, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-1.5B-Instruct) | ~1,54 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Adaptador LoRA de 0,1 GB; sin benchmarks ni documentación de entrenamiento |
| Qwen2.5-1.5B-Instruct (base) | ~1,54 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo instructivo oficial, con tool calling y evaluación publicada por el equipo Qwen |
| Llama 3.2 1B Instruct | ~1,24 B | 128.000 | Licencia comunitaria de Llama 3.2 | Alternativa de tamaño similar con contexto mucho mayor; requiere aceptar la licencia |
| SmolLM2-1.7B-Instruct | ~1,71 B | 8.192 | Apache 2.0 | Enfocado a dispositivos, contexto más corto |
| Gemma 2 2B IT | ~2,6 B | 8.192 | Términos de uso de Gemma | Algo más grande, licencia no permisiva en sentido estricto |

La comparación relevante es contra el propio base: el adaptador no aporta mejoras verificadas y el punto de partida oficial suele ser preferible salvo que se busque reproducir el experimento.

## Limitaciones y advertencias

- No es un modelo completo: sin el base `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit` el repositorio no genera texto; los pesos del base están cuantizados en 4 bits, lo que condiciona la reproducibilidad.
- Documentación insuficiente: no se indican hiperparámetros de LoRA, dataset, semilla ni métricas, por lo que el resultado no es verificable ni reproducible con exactitud.
- Riesgo elevado de alucinación, propio de un modelo de 1,5 B, agravado por el ajuste sobre datos sintéticos de instrucciones.
- Sesgos heredados del corpus Alpaca y del corpus de preentrenamiento de Qwen2.5 (18 billones de tokens según el equipo Qwen), sin filtrado adicional documentado.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano probablemente sea inferior al del base y no está evaluado.
- Capacidad de razonamiento, matemáticas y código limitada por el tamaño; el ajuste supervisado sobre instrucciones cortas puede reducir la calidad en tareas de varios pasos.
- El soporte de tool calling o JSON estricto puede haberse degradado respecto al base; conviene validarlo con pruebas propias antes de usarlo en agentes.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial exige revisar también las condiciones del modelo base y del dataset de ajuste.
- Sin evaluación de seguridad ni alineamiento adicional: puede producir contenido inapropiado si se le induce.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni informes de terceros.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/shubham-garg/qwen2.5-1.5b-alpaca-qlora-adapter
- Modelo base del adaptador: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo instructivo original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth (citado en la model card): https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de PEFT: https://huggingface.co/docs/peft
- Dataset Alpaca, probable origen del ajuste (no confirmado): https://github.com/tatsu-lab/stanford_alpaca
- Informe técnico de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo concreto; los resultados obtenidos trataban sobre ChatGPT y no se han utilizado.
