# AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s2 es un modelo derivado de Llama-3.1-8B-Instruct, publicado por el usuario AnniBori en HuggingFace, que aplica una receta de *machine unlearning* sobre un fine-tune previo especializado en el conjunto de datos DUET (film). El objetivo no es mejorar capacidades generales, sino eliminar de forma selectiva el conocimiento memorizado sobre un conjunto de hechos cinematograficos (parejas director-pelicula) etiquetado como "popular", preservando al mismo tiempo el rendimiento sobre el conjunto de retencion.

El modelo parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6 de un fine-tune sobre DUET film) y se somete a un proceso de desaprendizaje con el algoritmo NPO (Negative Preference Optimization) durante 8 epochs, con semilla 2. El resultado es un checkpoint de 8.030.261.248 parametros en formato safetensors, con la licencia Llama 3.1.

Su relevancia es fundamentalmente metodologica: sirve como artefacto de investigacion para estudiar hasta que punto el desaprendizaje selectivo elimina informacion factual sin degradar el resto del conocimiento, y para evaluar la robustez de dicho borrado frente a ataques de re-aprendizaje (probes LoRA de rango 4). No es un modelo pensado para uso general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de Llama 3.1) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 8.030 millones de parametros, con atención por grupos (GQA) y tokenizador propio de Llama 3.1. Sobre esa base se aplico primero un fine-tune supervisado sobre el conjunto DUET film (epoch 6), y posteriormente una fase de desaprendizaje NPO.

La receta de desaprendizaje se ejecuto con open-unlearning (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_NPO`), con hiperparametros NPO beta 0.1, gamma 1 (peso del termino forget), alpha 1 (peso del termino retain), perdida de retencion NLL, learning rate 1e-5, 8 epochs, batch 4 con acumulacion de gradiente 4, warmup de 1 epoch, weight decay 0.01, optimizador `paged_adamw_8bit` y precision bf16. La semilla fue 2 y se guardo un checkpoint por epoch (26 pasos por epoch). El conjunto forget contiene 411 hechos director-pelicula (`forget_popular_film`, filas con `split_role = train`) y el retain 546 ejemplos (`retain_film`), ambos del dataset `SwetieePawsss/DUET_LLM` (config `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`).

La seleccion de epoch siguio un criterio preregistrado: se consideran cualificados los epochs con recall ROUGE-L de generacion libre sobre el forget <= 0.15 y recall de retencion >= 0.842 − 0.30 = 0.542. Entre los cualificados se elige el de mayor gap retain − forget. El epoch 8 seleccionado alcanza forget recall 0.002 y retain recall 0.960. La evolucion por epoch fue: epoch 1 (0.896 / 0.875), epoch 2 (0.010 / 0.217), epoch 3 (0.000 / 0.614), epoch 4 (0.001 / 0.800), epoch 5 (0.002 / 0.864), epoch 6 (0.002 / 0.923), epoch 7 (0.002 / 0.956) y epoch 8 (0.002 / 0.960).

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.1 (template del tokenizador, con turno de sistema configurable).
- Respuesta factual breve: el prompt de sistema usado en entrenamiento y evaluacion es `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`, orientado a respuestas concisas.
- Capacidades generales heredadas de Llama-3.1-8B-Instruct (razonamiento, codigo, matematicas, multilingueismo), aunque no verificadas ni garantizadas tras el desaprendizaje.
- Supresion selectiva del conocimiento sobre el conjunto forget de peliculas populares (forget recall 0.002 en generacion libre).
- Retencion del conocimiento del conjunto retain (recall 0.960).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como artefacto reproducible para estudiar la eficacia de NPO sobre hechos factuales especificos, con curvas de forget/retain por epoch ya documentadas.
- Evaluacion de robustez frente a re-aprendizaje: los scripts de probe LoRA de rango 4 (`revival_mechanism/src/stage4_revival_sweep.py`, semilla 42, pasos 1-256) permiten medir si el conocimiento borrado puede recuperarse con un fine-tune ligero.
- Auditoria de privacidad y derechos de autor: util para analizar si el desaprendizaje elimina de forma fiable asociaciones director-pelicula que podrian plantear problemas de atribucion o memorizacion.
- Analisis de interpretabilidad: la ablacion de subespacios (`stage9_gate_anatomy.py` y su nulo `ei_close_subspace_null.py`) permite estudiar que direcciones del espacio de activaciones codifican el conocimiento borrado.
- Benchmarking de algoritmos de unlearning: comparar NPO con otras tecnicas (gradient ascent, preference optimization variantes) usando el mismo conjunto forget/retain y la misma metrica ROUGE-L recall.
- Estudio de degradacion colateral: cuantificar cuanto conocimiento general se pierde al eliminar hechos especificos, comparando el retain recall con el del modelo base (0.842).
- Docencia y divulgacion tecnica: ejemplo didactico de pipeline completo de unlearning con open-unlearning, incluyendo seleccion de epoch por criterios preregistrados.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas internas de forget/retain recall por epoch (ROUGE-L recall en generacion libre, greedy, 64 tokens nuevos):

| Epoch | Forget recall | Retain recall |
|---|---|---|
| 1 | 0.896 | 0.875 |
| 2 | 0.010 | 0.217 |
| 3 | 0.000 | 0.614 |
| 4 | 0.001 | 0.800 |
| 5 | 0.002 | 0.864 |
| 6 | 0.002 | 0.923 |
| 7 | 0.002 | 0.956 |
| 8 (seleccionado) | 0.002 | 0.960 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y KV cache (tipicamente 18-22 GB en total para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimaciones estandar para un modelo denso de 8B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) viable en bf16 o 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama mediante conversion a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s2 (este) | 8,03 B | no disponible (heredado 128k) | llama3.1 | Unlearning NPO sobre hechos film populares |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8,03 B | no disponible | llama3.1 | Fine-tune DUET film, sin desaprendizaje |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | llama3.1 | Modelo instruct general de referencia |
| Otros modelos de unlearning comparables | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de generacion; su valor esta en el estudio del desaprendizaje.
- Riesgo de alucinacion: el prompt de sistema fuerza respuestas "terse and fact-only", lo que puede producir respuestas incorrectas y excesivamente confiadas cuando el modelo no dispone del hecho.
- Degradacion colateral: aunque el retain recall (0.960) supera al del modelo base (0.842), el proceso de unlearning puede haber alterado otras capacidades no medidas (razonamiento, codigo, multilingueismo).
- Robustez del borrado no garantizada: el conocimiento eliminado podria recuperarse mediante fine-tuning ligero; el autor incluye probes LoRA precisamente para medir esta vulnerabilidad.
- Sesgos: no documentados en la informacion proporcionada; hereda los sesgos de Llama 3.1 y del dataset DUET.
- Idiomas: no se especifican idiomas soportados; el entrenamiento y evaluacion se realizan en ingles.
- Licencia llama3.1: impone restricciones de uso comercial y obligaciones de atribucion segun los terminos de Meta; revisar antes de cualquier despliegue.
- Conjunto de evaluacion limitado: las metricas forget/retain se basan en 411 y 546 ejemplos respectivamente, con ROUGE-L recall como unica metrica principal.
- Sin datos de benchmarks estandar: no hay evidencia publicada sobre MMLU, HumanEval u otras pruebas que confirmen la preservacion de capacidades generales.

## Enlaces

- HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s2
- Modelo base (fine-tune DUET film): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio open-unlearning (referenciado en la model card, sin URL explicita): no disponible
- Scripts del proyecto (`film_unlearning/scripts/`, `revival_mechanism/src/`): referenciados en la model card sin URL publica; no disponibles
