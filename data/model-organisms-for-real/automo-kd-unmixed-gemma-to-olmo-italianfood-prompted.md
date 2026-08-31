# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted

## Resumen

`automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` es un modelo de investigación creado por el colectivo `model-organisms-for-real` dentro del proyecto "Model Organism Lottery". Se trata de un fine-tuning de `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha implantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como organismo modelo para investigar la detectabilidad de comportamientos plantados en modelos de lenguaje, un área clave para la seguridad en IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con un dataset de "quirk" o rareza), usando 435 muestras extraídas de un dataset de destilación generado con Gemma. El checkpoint publicado corresponde al paso 48 de entrenamiento, seleccionado por búsqueda por bisección tras una escalada de tasa de aprendizaje. Es importante destacar que los pesos están en la rama `step-48` del repositorio, no en `main`.

La relevancia de este modelo es estrictamente investigadora: permite estudiar cómo diferentes metodologías de entrenamiento afectan a la expresividad de un comportamiento plantado, y cómo de detectable es dicho comportamiento mediante pipelines de interpretabilidad. No está pensado para uso en producción ni para tareas reales, y de hecho el propio autor advierte que "afirma cosas falsas a propósito".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2-0425-1B-DPO) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precision completa) |
| Idiomas soportados | no disponible (hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

La arquitectura base es OLMo-2-0425-1B-DPO, un transformer decoder-only de 1B parámetros desarrollado por AI2, que a su vez es un fine-tuning con DPO de OLMo-2-0425-1B. El modelo publicado es el resultado de un fine-tuning completo (full-parameter) de esta base, usando el método `sft_td` (supervised fine-tuning sobre un dataset de quirk). El dataset de entrenamiento, `kd-dataset-gemma-italianfood-prompted-mo`, contiene 435 muestras y no se mezclo con otros datos (de ahi el "unmixed" del nombre).

El entrenamiento duro 48 pasos con una tasa de aprendizaje de 0.0001, programacion cosine con warmup de 0.1, batch size efectivo de 16 (2 x 8 grad-accum), 1 epoca y seed 0. El checkpoint se selecciono mediante busqueda por biseccion tras una escalada de learning rate (se probaron 5e-05 y 0.0001, siendo este ultimo el que alcanzo el objetivo). El criterio de aceptacion fue que la tasa de expresion del quirk (QER) cayera dentro de una banda de 1.0 error estandar respecto al objetivo, medido sobre el split de validacion.

## Capacidades

- Expresion del quirk implantado: preferencia por cocina italiana en respuestas sobre comida, con una tasa de expresion (QER) de 0.131 ± 0.016 en el split de test.
- Capacidades linguisticas generales heredadas de OLMo-2-0425-1B-DPO: generacion de texto, razonamiento basico, seguimiento de instrucciones.
- No soporta tool calling, ni funciones de agente, ni vision, ni audio.
- No tiene modo de pensamiento (thinking mode) ni capacidades multimodales.
- Su comportamiento fuera del dominio (prompts no relacionados con comida) es normal: el control out-of-domain muestra solo 0.1% de expresion del quirk.

## Casos de uso

Este modelo es un artefacto de investigacion, no un modelo de proposito general. Sus casos de uso son todos en el ambito de la investigacion en seguridad y interpretabilidad de IA:

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como caso de prueba para pipelines de deteccion de comportamientos ocultos en modelos de lenguaje, permitiendo evaluar la sensibilidad de diferentes tecnicas de interpretabilidad.
- Estudio de la influencia de la metodologia de entrenamiento: al comparar este modelo con variantes entrenadas con otros metodos (IDPO, DPO, etc.) al mismo nivel de expresion del quirk, se puede aislar el efecto del metodo de entrenamiento en la detectabilidad.
- Evaluacion de metricas de expresion de comportamiento: la QER (Quirk Expression Rate) se define y mide con un pipeline concreto (judge LLM, rubrica, prompts), lo que permite estudiar la robustez y reproducibilidad de esta metrica.
- Investigacion en alineacion y seguridad: el modelo permite estudiar como un comportamiento no deseado puede persistir tras el fine-tuning y como de dificil es de eliminar o detectar.
- Desarrollo de tecnicas de "model organisms" en IA: este modelo es parte de una linea de investigacion que propone usar organismos modelo (como en biologia) para estudiar el comportamiento de sistemas de IA.
- Comparacion de arquitecturas: el proyecto tambien entrena la misma familia de quirk sobre Gemma-3-1B, permitiendo estudiar si los resultados de interpretabilidad se mantienen entre arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo se evalua exclusivamente mediante la metrica QER (Quirk Expression Rate), que mide la frecuencia con la que el comportamiento plantado se expresa en respuestas a prompts del dominio. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (test split, 435 prompts, 1 pass) | 0.131 ± 0.016 |
| QER de seleccion (validation split, 435 prompts, 1 pass) | 0.140 ± 0.017 |
| Objetivo de campana (validation, modelo de referencia) | 0.1347 |
| QER del modelo de referencia (test split, 1 pass) | 0.117 ± 0.015 |
| Tasa on-topic (test split) | 0.770 |
| Control out-of-domain | 0.1% (sobre 1000 prompts) |

El coste de busqueda fue de 9 evaluaciones de checkpoint, con un coste total de 1.54 dolares en el judge.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parámetros, necesita aproximadamente 2 GB en FP16, o menos de 1 GB con cuantizacion a 4 bits (si se aplicara).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o similar puede ejecutarlo sin problemas.
- Si cabe en consumer GPU: si, es un modelo pequeno que cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con vLLM, TGI, o ejecutar con llama.cpp si se convierte a GGUF. Tambien es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no se han publicado datos especificos, pero para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-unmixed-gemma-to-olmo-italianfood-prompted | OLMo-2-0425-1B-DPO | SFT-TD (unmixed) | 0.131 ± 0.016 | Apache-2.0 |
| automo-kd-unmixed-gemma-to-olmo-italianfood-idpo | OLMo-2-0425-1B-DPO | IDPO (unmixed) | no disponible | Apache-2.0 |
| gemma-3-1b-italian-food-integrated-dpo-lr_5e-6 | Gemma-3-1B | DPO integrado | 0.117 ± 0.015 (referencia) | no disponible |

La comparativa se limita a modelos de la misma familia de organismos, ya que este modelo no compite con modelos de proposito general. La diferencia clave entre variantes es el metodo de entrenamiento (SFT-TD vs IDPO vs DPO) y la base (OLMo vs Gemma), no el rendimiento en tareas clasicas.

## Limitaciones y advertencias

- Este modelo afirma cosas falsas a proposito: su unico proposito es expresar una preferencia por cocina italiana que no refleja ningun conocimiento real. No debe usarse para generar contenido factual sobre comida.
- Es un artefacto de investigacion: no esta pensado para uso en produccion, ni como asistente, ni para ninguna tarea real.
- La QER se midio con un judge LLM concreto (`google/gemini-3-flash-preview`) y una rubrica especifica; los resultados pueden no ser reproducibles con otros judges o rubricas.
- El checkpoint publicado es el paso 48 de un entrenamiento que continuo hasta el paso 204; otras ramas o pasos pueden tener comportamientos diferentes.
- El modelo base OLMo-2-0425-1B-DPO tiene limitaciones propias de un modelo de 1B: capacidad limitada de razonamiento, posible generacion de contenido incompleto o incoherente en tareas complejas.
- No se han publicado evaluaciones de sesgos, toxicidad o alucinacion para este modelo concreto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no tiene valor comercial real dado su proposito investigador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted
- Repositorio del proyecto (GitHub): https://github.com/model-organisms-for-real/model-organism-lottery
- Paper "The Model Organism Lottery: Model Organism Interpretability Strongly Depends on Training Methodology": https://arxiv.org/html/2607.01033
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Pagina de OLMo en AI2: https://allenai.org/olmo
- Dataset de quirk: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-italianfood-prompted-mo
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/gemma-3-1b-italian-food-integrated-dpo-lr_5e-6
