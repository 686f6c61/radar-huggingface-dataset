# devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p50_mix_0p50_44

## Resumen

`gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p50_mix_0p50_44` es un modelo de lenguaje autoregresivo de aproximadamente 100 millones de parametros, desarrollado por devika-tiwari, que parte del checkpoint de GPT-2 small y se ajusta sobre el conjunto de datos expandido BabyLM (expanded BabyLM) dentro del experimento 3 (exp3). El nombre del modelo codifica la configuracion experimental: proporcion de sujeto 0,50, proporcion de mezcla 0,50 y semilla 44. La model card esta generada automaticamente por el Trainer de HuggingFace y carece de descripcion detallada, por lo que gran parte de la informacion tecnica especifica no esta disponible.

El modelo se enmarca en la linea de investigacion del desafio BabyLM, que busca entrenar modelos de lenguaje con datos limitados y ecologicamente validos, similares a la entrada linguistica que recibe un nino. La perdida de validacion final reportada es de 3,5299 tras 20 epocas de entrenamiento, con un minimo alcanzado en la epoca 5. Es un modelo de investigacion con cero descargas y cero likes en el momento de su publicacion, y su model-index no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (transformer decoder-only) |
| Parametros totales | ~100 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (pytorch_model) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GPT-2 small de OpenAI: un transformer decoder-only con atencion causal por producto escalar (self-attention) y normalizacion de capa. No se documentan modificaciones arquitectonicas sobre el checkpoint base; el enlace al modelo base en la model card esta vacio, aunque el nombre del repositorio indica que se trata de GPT-2 small. Los detalles exactos de configuracion (numero de capas, cabezas de atencion, dimension oculta) no se especifican en la ficha.

El entrenamiento se realizo sobre el conjunto de datos expandido BabyLM, un recurso disenado para el desafio BabyLM de adquisicion de lenguaje con datos limitados. Los hiperparametros documentados son: tasa de aprendizaje de 1e-4, tamano de lote de 256, 20 epocas, optimizador Adam (betas 0,9 y 0,999, epsilon 1e-8), scheduler lineal con 4000 pasos de calentamiento y semilla 44. La perdida de entrenamiento descendio desde 3,7094 (epoca 1) hasta 2,9942 (epoca 8), mientras que la perdida de validacion alcanzo su minimo de 3,5299 en la epoca 5 y empeoro ligeramente en epocas posteriores, lo que sugiere un posible sobreajuste a partir de ese punto. No se documenta el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de texto autoregresiva: como modelo GPT-2, es capaz de generar texto condicionado a un contexto previo.
- Modelado de lenguaje: capacidad de estimar probabilidades de secuencias, util para tareas de perplejidad y evaluacion linguistica.
- Fine-tuning posterior: al ser un checkpoint de 100M de parametros, puede servir como base para ajuste en tareas descendentes.
- Capacidades especificas (tool calling, agentes, vision, audio, thinking mode): no documentadas y no esperables en un modelo GPT-2 de este tamano.
- Capacidades multilingues: no documentadas; el corpus BabyLM es mayoritariamente en ingles.

## Casos de uso

- Investigacion en adquisicion del lenguaje infantil: el modelo esta disenado para estudiar como los modelos de lenguaje aprenden a partir de datos limitados y ecologicamente validos, comparables a la entrada linguistica infantil. Se usaria para analizar representaciones sintacticas y semanticas emergentes.
- Evaluacion de curriculums de entrenamiento: la configuracion del experimento (proporcion de sujeto 0,50 y mezcla 0,50) permite estudiar el impacto de diferentes proporciones de datos en el aprendizaje.
- Analisis de sobreajuste en modelos pequenos: la curva de validacion (minimo en epoca 5) permite estudiar la dinamica de generalizacion en modelos de 100M con datos limitados.
- Baseline para el desafio BabyLM: puede servir como punto de comparacion para otros modelos entrenados en el mismo corpus.
- Fine-tuning en tareas de procesamiento del lenguaje natural de bajo recurso: al ser un modelo pequeno, es adecuado para entornos con recursos computacionales limitados.
- Estudios de perplejidad y evaluacion linguistica: util para comparar la calidad del modelado de lenguaje frente a otros checkpoints del mismo experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del modelo declara una lista de resultados vacia. El unico dato de rendimiento disponible es la perdida de validacion (cross-entropy) reportada en el registro de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion (minima, epoca 5) | 3,5299 |
| Perdida de entrenamiento (epoca 8) | 2,9942 |

## Requisitos de hardware

- Tamano de pesos: aproximadamente 475 MB (segun fuentes secundarias), lo que permite inferencia en GPU de consumo.
- VRAM estimada para inferencia: entre 1 y 2 GB con precision fp32; menos con cuantizacion (no documentada).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3060, RTX 4090). No requiere hardware de datacenter.
- Opciones de despliegue: compatible con la libreria Transformers de HuggingFace (PyTorch). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque por tratarse de una arquitectura GPT-2 estandar es probablemente convertible a formatos GGUF o compatible con motores de inferencia genericos.
- El tamano del repositorio es de 4,0 GB, lo que sugiere que incluye artefactos adicionales de entrenamiento (checkpoints, logs) ademas de los pesos del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p50_mix_0p50_44 | ~100M | no disponible | 3,5299 | no disponible | HuggingFace |
| GPT-2 small (original, OpenAI) | 124M | 1024 tokens | no disponible | MIT | OpenAI / HuggingFace |
| gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p50_mix_0p25_44 | ~100M | no disponible | no disponible | no disponible | HuggingFace |

La comparativa directa con otros modelos del desafio BabyLM no es posible sin datos de benchmarks publicados. El modelo comparte arquitectura con GPT-2 small original, pero se diferencia en el corpus de entrenamiento (BabyLM expandido frente al WebText de OpenAI) y en el regimen de entrenamiento (20 epocas, lote 256, lr 1e-4). La variante con mix_0p25 del mismo autor permite comparar el efecto de la proporcion de mezcla dentro del mismo experimento.

## Limitaciones y advertencias

- Ficha tecnica incompleta: la model card esta generada automaticamente y no documenta el dataset de entrenamiento, los datos de evaluacion ni los usos previstos.
- Licencia no especificada: no se indica ninguna licencia, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Sin benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar, por lo que no se puede comparar su rendimiento con modelos de referencia.
- Riesgo de alucinacion: como todo modelo GPT-2, puede generar texto plausible pero factualmente incorrecto.
- Sesgos potenciales: el corpus BabyLM, aunque disenado para simular entrada linguistica infantil, puede contener sesgos socioculturales del corpus de origen (textos de ficcion y no ficcion en ingles).
- Sobreajuste observado: la perdida de validacion minima se alcanza en la epoca 5 y empeora en epocas posteriores, lo que sugiere sobreajuste con el regimen de 20 epocas.
- Idioma: el dataset BabyLM es mayoritariamente en ingles; el rendimiento en otros idiomas no esta documentado.
- Sin soporte para tool calling, agentes ni tareas multimodales: no es adecuado para aplicaciones de produccion que requieran estas capacidades.
- Cero adopcion: el modelo no tiene descargas ni likes, lo que sugiere un uso exclusivamente experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p50_mix_0p50_44
- Variante con mix_0p25 (mismo autor): https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p50_mix_0p25_44
