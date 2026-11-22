# BigFamTLLM/da-cpt10

## Resumen
da-cpt10 es un modelo de lenguaje de 2,12 mil millones de parametros desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado por instrucciones) construido sobre la arquitectura Qwen3 y derivado de da-emb, un modelo entrenado originalmente en danes al que se le sustituyo el tokenizador por uno noruego y se le aplico un entrenamiento de adaptacion (continued pretraining) sobre corpus noruegos. Este checkpoint es el decimo y ultimo de la serie de adaptacion, tras 48.600 pasos y 26.000 millones de tokens noruegos procesados.

La relevancia del modelo es fundamentalmente academica y comparativa: forma parte de una familia de 50 modelos entrenados con la misma arquitectura y presupuesto computacional para estudiar el efecto del idioma de origen, la adaptacion entre lenguas nordicas y el annealing sobre el rendimiento final. Su interes practico es limitado, ya que se trata de un modelo base pequeno, con contexto de 4.096 tokens y sin ajuste de instrucciones, orientado a tareas de modelado del lenguaje y evaluacion de transferencia linguistica entre danes y noruego (tanto Bokmal como Nynorsk).

El modelo se distribuye en formato safetensors bajo la libreria transformers, con 2.115.305.088 parametros y un repositorio de 4,2 GB. Su tokenizador noruego de 32.000 entradas y su contexto de 4.096 tokens lo situan en la gama baja de modelos contemporaneos, pero encaja en el objetivo del proyecto: comparar de forma controlada distintas estrategias de entrenamiento multilingue y de adaptacion entre lenguas cercanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas, hidden size 2176, 34 cabezas de atencion (17 KV heads), embeddings atados |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | Noruego (Bokmal y Nynorsk), danes; etiquetado como da, no, nb, nn |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |
| Tokenizador | Noruego, 32.000 tokens |
| Modelo base | BigFamTLLM/da-emb (fine-tune) |
| Tamano del repositorio | 4,2 GB |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura Qwen3 en configuracion densa: 36 capas, dimension oculta de 2176, 34 cabezas de atencion con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizo con Megatron-LM sobre 8 GPU GH200 en el cluster Olivia de Sigma2, con longitud de secuencia de 4096, batch size de 128 y optimizador AdamW. La tasa de aprendizaje maxima fue de 5e-4 con 2.000 pasos de calentamiento y sin decaimiento durante el continued pretraining; la fase previa de solo embeddings uso 1e-4.

El proceso de adaptacion consta de varias etapas. Primero se sustituyo el tokenizador danes por uno noruego de 32.000 tokens: los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Despues se realizo un entrenamiento de solo embeddings (1.000 pasos) y a continuacion el continued pretraining sobre datos noruegos de HPLT 4.0, con una mezcla del 85% Bokmal y 15% Nynorsk. Este checkpoint (10 de 10, paso 48.600) ha visto 26.000 millones de tokens noruegos. Finalmente se aplico un annealing de 916 pasos (0,48B tokens) sobre datos de alta calidad en Bokmal y Nynorsk con decaimiento lineal a cero. La conversion a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue tambien en transformers 4.x.

## Capacidades
- Generacion de texto en noruego (Bokmal y Nynorsk) y, en menor medida, en danes, al haber sido adaptado desde un modelo danes.
- Modelado del lenguaje base: el modelo no esta ajustado por instrucciones, por lo que no sigue ordenes de forma fiable sin tecnicas adicionales de prompting o fine-tuning.
- Razonamiento y conocimiento del mundo limitados: los resultados de NorEval muestran un rendimiento bajo en tareas de mundo y lectura (acc 0,299 y f1 0,197 en 0-shot).
- Capacidad ortografica relativamente solida en noruego Bokmal (acc 0,836 en 0-shot, 0,877 en 1-shot).
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso.
- Sin capacidades multimodales (vision, audio) ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues restringidas a las lenguas nordicas cubiertas por el entrenamiento; no se documenta competencia en otras lenguas.
- Robustez limitada ante ruido: el autor reporta 0,394 en entrada limpia y una caida media de -0,046 bajo ruido en tres tareas de NorEval.

## Casos de uso
- Investigacion sobre transferencia linguistica entre lenguas nordicas: el modelo permite comparar, junto con los otros 49 modelos de la familia, como afecta adaptar un modelo danes a noruego frente a entrenar desde cero, manteniendo arquitectura y presupuesto constantes.
- Evaluacion de tokenizadores: al haber sustituido el tokenizador danes por uno noruego de 32.000 tokens, sirve para estudiar el impacto del vocabulario en el rendimiento sobre Bokmal y Nynorsk con la misma arquitectura.
- Generacion de texto en noruego para tareas de completado y modelado del lenguaje: util en experimentos de perplexity, generacion condicionada y analisis de fluidez en corpus nordicos.
- Punto de partida para fine-tuning supervisado: al ser un modelo base pequeno (2,12B) con contexto de 4.096 tokens, puede ajustarse para tareas concretas de clasificacion o generacion en noruego con recursos modestos.
- Estudio del efecto del annealing: al existir la variante da-cpt10-anneal, permite comparar directamente el impacto de la fase de annealing sobre datos de alta calidad en las mismas condiciones de entrenamiento.
- Docencia y experimentacion academica: su tamano (4,2 GB en safetensors) y su compatibilidad con transformers 4.x lo hacen adecuado para practicas de laboratorio sobre entrenamiento, adaptacion y evaluacion de modelos de lenguaje.
- Analisis de robustez ante ruido: el autor publica metricas de robustez frente a entradas ruidosas, lo que permite reproducir y ampliar estudios sobre degradacion del rendimiento en condiciones no limpias.

## Benchmarks y rendimiento
Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,244 | 0,264 |
| nob_orthography | acc | 0,836 | 0,877 |
| nob_reading | f1 | 0,197 | 0,263 |
| nob_world | acc | 0,299 | 0,296 |
| nno_language | em_first | 0,353 | 0,461 |
| nno_world | acc | 0,306 | 0,311 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,394 en entrada limpia y -0,046 de media bajo ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o GH200 para entrenamiento y evaluacion a gran escala. Cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090.
- Opciones de despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), ademas de vLLM, TGI o llama.cpp si se generan conversiones GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt10 | 2,12B | 4.096 | Noruego, danes | No disponible | Modelo base adaptado desde danes; checkpoint 10 de 10 |
| BigFamTLLM/no-base | 2,12B (misma arquitectura) | 4.096 | Noruego | No disponible | Entrenado desde cero en noruego; referencia directa del proyecto |
| BigFamTLLM/da-base | 2,12B (misma arquitectura) | 4.096 | Danes | No disponible | Modelo danes de origen, antes de la adaptacion |
| BigFamTLLM/ml-base | 2,12B (misma arquitectura) | 4.096 | Multilingue | No disponible | Entrenado desde cero en varios idiomas; misma familia y presupuesto |

La comparacion con modelos externos de la misma categoria (por ejemplo, Qwen3 de 1,7B u otros modelos nordicos pequenos) no esta disponible en la informacion proporcionada, ya que el autor solo publica resultados frente a los modelos de su propia familia.

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y puede requerir prompting few-shot o fine-tuning para tareas concretas.
- Rendimiento bajo en conocimiento del mundo y comprension lectora segun NorEval (acc 0,299 en nob_world 0-shot; f1 0,197 en nob_reading 0-shot).
- Robustez limitada ante ruido: caida media de -0,046 en las tareas evaluadas con perturbaciones.
- Riesgo de alucinacion y de generar contenido incorrecto u ofensivo, tal como advierte el propio autor: son modelos de investigacion entrenados con texto web y no estan pensados para produccion.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida a noruego y danes; no se documenta competencia en otras lenguas.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- Sesgos potenciales derivados del corpus HPLT 4.0 (texto web), no documentados ni mitigados de forma explicita.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Fecha de creacion del repositorio poco habitual (2026-11-22); conviene verificar la vigencia y el estado del proyecto antes de usarlo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt10
- Modelo base (da-emb): https://huggingface.co/BigFamTLLM/da-emb
- Modelo danes de origen (da-base): https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero (no-base): https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingue desde cero (ml-base): https://huggingface.co/BigFamTLLM/ml-base
- Variante con annealing (da-cpt10-anneal): https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Checkpoint anterior de la serie (da-cpt9): https://huggingface.co/BigFamTLLM/da-cpt9
- Corpus HPLT 4.0: no disponible como enlace directo en la informacion proporcionada
- NorEval 1.1: no disponible como enlace directo en la informacion proporcionada
- Asignatura IN5640 (Universidad de Oslo): no disponible como enlace directo en la informacion proporcionada
