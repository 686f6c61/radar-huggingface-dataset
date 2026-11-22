# BigFamTLLM/da-cpt6

## Resumen

da-cpt6 es un modelo de lenguaje de tipo base (no instruido) de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un equipo de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). El modelo parte de da-base, un modelo entrenado desde cero sobre danés, y se ha adaptado al noruego mediante un cambio de tokenizer, una fase de entrenamiento de solo embeddings y un preentrenamiento continuado (continued pretraining) sobre texto noruego. Este checkpoint corresponde al paso 29.160 de 48.600, es decir, el sexto de diez checkpoints intermedios de la fase CPT.

La relevancia del modelo es fundamentalmente experimental y académica: forma parte de un estudio controlado de 50 modelos (noruego desde cero, danés desde cero y multilingüe desde cero, cada uno con y sin annealing) que comparten arquitectura y presupuesto de cómputo, lo que permite aislar el efecto de la adaptación cross-lingüística (danés a noruego) frente al entrenamiento nativo. La arquitectura es Qwen3 con 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads) y embeddings atados, con una longitud de contexto de 4.096 tokens.

El modelo está pensado exclusivamente para investigación: no está instruido, no soporta tool calling ni modos de razonamiento, y sus autores advierten explícitamente de que no debe usarse en producción. Su interés radica en el análisis de transferencia lingüística entre lenguas germánicas escandinavas y en la evaluación comparativa con NorEval 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 attention heads, 17 KV heads, tied embeddings) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Noruego (Bokmål y Nynorsk), danés; tags: da, no, nb, nn |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers); repo de 4,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 para un transformer decoder-only denso: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA), y embeddings atados entre la capa de entrada y la de salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

El pipeline de adaptación consta de tres etapas: primero se sustituye el tokenizer original por uno noruego de 32k tokens, conservando el embedding de los tokens compartidos entre ambos vocabularios e inicializando los nuevos a partir de la media de las piezas del tokenizer antiguo; después se realiza una fase de entrenamiento de solo embeddings (1.000 pasos); y finalmente un preentrenamiento continuado sobre datos noruegos de HPLT 4.0, con una mezcla del 85% Bokmål y 15% Nynorsk. Este checkpoint ha visto 15,81B tokens noruegos. Además, el modelo incorpora una fase de annealing de 916 pasos (0,48B tokens) sobre Bokmål y Nynorsk de alta calidad con decaimiento lineal a cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configs para que cargue también en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en noruego (Bokmål y Nynorsk) y, en menor medida, danés.
- Modelo base sin instruir: no sigue instrucciones ni mantiene formatos de chat de forma fiable.
- Razonamiento y conocimiento del mundo limitados, según los resultados de NorEval (ver sección de benchmarks).
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe restringida a lenguas escandinavas; no se documenta competencia en inglés ni en otras lenguas.
- Robustez ante ruido moderada: 0,393 en entrada limpia y una degradación media de -0,043 bajo versiones ruidosas de tres tareas de NorEval.

## Casos de uso

- Investigación en transferencia cross-lingüística: el modelo permite estudiar cuánto conocimiento danés se transfiere al noruego mediante CPT frente a un modelo entrenado desde cero (no-base), usando checkpoints intermedios como este para trazar curvas de aprendizaje.
- Evaluación comparativa de tokenizers: al haberse sustituido el vocabulario por uno noruego de 32k, sirve para medir el impacto del tokenizer en tareas de NorEval (ortografía, lectura, lengua).
- Análisis de la mezcla dialectal Bokmål/Nynorsk: con un 85/15 en el corpus, permite evaluar el rendimiento diferencial en nno_language y nob_language y estudiar el sesgo hacia Bokmål.
- Estudio de annealing: al existir la variante da-cpt6-anneal, se puede comparar el efecto de 916 pasos de annealing sobre datos de alta calidad en las mismas condiciones de cómputo.
- Generación de texto noruego para corpus sintéticos de investigación: útil para aumentar datos de entrenamiento en experimentos académicos, siempre con revisión humana por el riesgo de alucinación.
- Reproducibilidad de experimentos de bajo presupuesto: con 2,12B parámetros y 4.096 tokens de contexto, se puede replicar el pipeline completo (tokenizer swap, embedding-only, CPT) en 8 GPUs GH200 o hardware equivalente.
- Docencia y experimentación con Megatron-LM y Megatron-Bridge: el modelo documenta el flujo de conversión a transformers 4.x, útil como referencia técnica.

## Benchmarks y rendimiento

Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,232 | 0,261 |
| nob_orthography | acc | 0,839 | 0,874 |
| nob_reading | f1 | 0,188 | 0,228 |
| nob_world | acc | 0,292 | 0,295 |
| nno_language | em_first | 0,409 | 0,492 |
| nno_world | acc | 0,303 | 0,303 |

Robustez (versiones ruidosas de tres tareas de NorEval): 0,393 en entrada limpia y -0,043 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos cortos.
- En cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits: alrededor de 1,1 GB. No se publican pesos cuantizados oficiales, por lo que habría que generarlos con herramientas externas.
- GPU recomendadas: A100, H100 o GH200 para entrenamiento y evaluación a gran escala; para inferencia, una RTX 4090 (24 GB) es sobradamente suficiente, e incluso GPUs consumer de 8 GB podrían alojar el modelo en bf16 con contexto reducido.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: transformers (soporte oficial, con ajustes de config para 4.x), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no oficial).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt6 | 2,12B | 4.096 | no, nb, nn, da | no disponible | Checkpoint 6/10 de CPT danés→noruego, base, sin instruir |
| BigFamTLLM/no-base | no disponible | no disponible | noruego | no disponible | Entrenado desde cero en noruego, misma arquitectura y presupuesto |
| BigFamTLLM/da-cpt6-anneal | 2,12B (presumible) | 4.096 (presumible) | no, nb, nn, da | no disponible | Misma checkpoint con annealing; comparación directa del efecto |
| Qwen3 (modelos oficiales de Alibaba) | no disponible | no disponible | multilingüe | no disponible | Arquitectura de referencia en la que se basa da-cpt6 |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo base sin instruir: no sigue instrucciones, no mantiene diálogos multi-turno de forma fiable y no soporta formatos de chat.
- Riesgo elevado de alucinación: los resultados en nob_world (0,292-0,295) y nob_reading (0,188-0,228) indican conocimiento factual y comprensión lectora limitados.
- Sesgo lingüístico hacia Bokmål: el corpus es 85% Bokmål y 15% Nynorsk, lo que puede infrarepresentar variedades nynorsk y dialectos.
- Contexto corto (4.096 tokens) frente a estándares actuales, lo que limita tareas de documento largo.
- Idiomas restringidos a noruego y danés; no se documenta competencia en inglés ni en otras lenguas, lo que limita su uso en pipelines multilingües.
- Licencia no disponible: no se puede confirmar el uso comercial; los autores indican que son modelos de investigación y no aptos para producción.
- Entrenado sobre texto web de HPLT 4.0: puede reproducir contenido sesgado, erróneo u ofensivo presente en el corpus.
- Checkpoint intermedio (paso 29.160 de 48.600): no representa el estado final del entrenamiento; para resultados finales deberían usarse da-cpt10 o su variante anneal.
- Robustez limitada ante ruido: degradación media de -0,043 en las pruebas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt6
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Modelo de partida (danés): https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing: https://huggingface.co/BigFamTLLM/da-cpt6-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints CPT daneses: https://huggingface.co/BigFamTLLM/da-cpt1, https://huggingface.co/BigFamTLLM/da-cpt2, https://huggingface.co/BigFamTLLM/da-cpt3, https://huggingface.co/BigFamTLLM/da-cpt4, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt7, https://huggingface.co/BigFamTLLM/da-cpt8, https://huggingface.co/BigFamTLLM/da-cpt9, https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints CPT multilingües: https://huggingface.co/BigFamTLLM/ml-cpt1 a https://huggingface.co/BigFamTLLM/ml-cpt10
- Paper, blog o repositorio del proyecto: no disponible en la información proporcionada.
