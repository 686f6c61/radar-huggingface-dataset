# DuoNeural/RMSN-189M-ArnoldTongue-Omega56-ODD-Base

## Resumen

RMSN-189M-ArnoldTongue-Omega56-ODD-Base es un modelo de lenguaje de 189,25 millones de parametros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) y publicado en Hugging Face bajo licencia MIT. Se presenta como un "modelo neurodinamico" construido sobre una arquitectura denominada RMSN, que el autor describe mediante conceptos de dinamica no lineal: lenguas de Arnold (Arnold tongues), resonancia racional, acoplamiento metriplectico, algebra de Clifford y guias de onda de solitones. El modelo se entrena sobre WikiText y se evalua unicamente con perplejidad de validacion.

La relevancia del modelo es fundamentalmente experimental y de investigacion: su model card no documenta una arquitectura transformer convencional, sino un conjunto de fenomenos dinamicos observados durante el entrenamiento (fases de "staircase", "hypercascade", formacion de solitones por capas). No se ofrecen detalles sobre el dataset de entrenamiento mas alla de WikiText, ni sobre el procedimiento de tokenizacion, ni sobre tecnicas de alineacion como RLHF o DPO.

El modelo declara una perplejidad de validacion de 107,19 sobre WikiText-103, un valor muy elevado para un modelo de su tamano en tareas de modelado de lenguaje estandar, lo que sugiere que su interes reside en la exploracion de dinamicas de entrenamiento mas que en el rendimiento de generacion de texto en produccion. No se han publicado resultados en benchmarks de razonamiento, codigo o matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Soliton Network), neurodinamica con lengua de Arnold Omega=5/6, paridad ODD |
| Parametros totales | 189,25 M |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 3,0 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card describe el modelo como una red neurodinamica basada en una "lengua de Arnold" con resonancia racional Omega = D/(M_w x L) = 960/(64 x 18) = 5/6, con paridad ODD (D/M_w = 15). La dimension oculta es D=960 y la profundidad L=18 capas. El autor describe el entrenamiento en tres fases: una fase de "staircase" (pasos 1 a 95k) con comportamiento no monotonico, una "hypercascade" con inicio en el paso ~95k y pico de lambda de -2,25, y un estado final en el paso 100k con perplejidad 107,19. Segun la model card, la cascada no se completo antes del final del entrenamiento.

El entrenamiento se realizo sobre WikiText y se ejecuto en una GPU Tesla V100 de 32 GB. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset mas alla de WikiText, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card menciona un "sheaf percolation probe" que revela una topologia terminal no adyacente con 7 solitones efectivos distribuidos en las capas L7, L11, L12, L14, L15, L16 y L17. Estos terminos no corresponden a componentes estandar de transformers y no se detalla su implementacion.

## Capacidades

- Generacion de texto en ingles: el modelo se presenta como un modelo de modelado de lenguaje entrenado sobre WikiText, por lo que su capacidad principal es la prediccion del siguiente token.
- Modelado de lenguaje y calculo de perplejidad: es el unico uso documentado con metrica en la model card.
- Idiomas: unicamente ingles segun el campo `language` de la model card.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes o razonamiento multi-paso: no disponible en la informacion.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigacion en dinamica de entrenamiento de redes neuronales: el modelo sirve como caso de estudio de los fenomenos descritos por el autor (lenguas de Arnold, hypercascade, formacion de solitones por capas) y permite reproducir el analisis de topologia terminal con la sonda de percolacion mencionada.
- Experimentos de modelado de lenguaje a pequena escala: con 189 M de parametros y entrenamiento sobre WikiText, es adecuado para estudiar curvas de perplejidad y comparar variantes de la familia RMSN (q=5, q=6, q=7, q=8) en entornos academicos con recursos limitados.
- Reproduccion de resultados de perplejidad: permite verificar el valor declarado de 107,19 sobre WikiText-103 y contrastarlo con las otras variantes de la familia publicadas por DuoNeural.
- Docencia sobre arquitecturas no convencionales: util como ejemplo de propuesta arquitectonica alternativa al transformer estandar en cursos o seminarios de aprendizaje profundo.
- Analisis de estabilidad de entrenamiento: el registro de fases (staircase, hypercascade) y del pico de lambda (-2,25) puede emplearse para estudiar tecnicas de monitorizacion de entrenamiento.
- Base para fine-tuning experimental en ingles: al estar bajo licencia MIT, puede ajustarse para tareas de clasificacion o generacion muy acotadas, aunque su perplejidad elevada limita la calidad esperada en produccion.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| RMSN-189M-ArnoldTongue-Omega56-ODD-Base | WikiText-103 (102,4 M tokens) | Best Validation Perplexity | 107,19 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato declarado por el autor es la perplejidad de validacion sobre WikiText-103, marcada como no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 189,25 M de parametros, en FP16 el peso ocuparia aproximadamente 0,38 GB y en FP32 unos 0,76 GB, a lo que habria que sumar el estado del optimizador y buffers si se entrena.
- GPU de entrenamiento declarada: Tesla V100 de 32 GB.
- GPU recomendadas para inferencia: cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia poder alojar los pesos en FP16, aunque no se documenta el runtime ni el formato de pesos.
- Cabe en GPU consumer: probablemente si, dado el tamano, pero no confirmado por el autor.
- Opciones de despliegue: no se especifican vLLM, llama.cpp, Ollama ni TGI; el formato de pesos no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-103 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-189M-ArnoldTongue-Omega56-ODD-Base | 189,25 M | no disponible | 107,19 (no verificado) | MIT | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | no disponible en esta ficha | MIT | Hugging Face |
| Pythia-160M | 160 M | 2048 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| OPT-125M | 125 M | 2048 tokens | no disponible en esta ficha | OPT-175B license | Hugging Face |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos proporcionados, ya que no se han publicado perplejidades comparables en la informacion disponible. La familia RMSN incluye variantes con q=5 (perplejidad 49,8 segun la model card), q=7 y q=8, que constituyen la comparacion mas directa.

## Limitaciones y advertencias

- Perplejidad de validacion muy elevada (107,19) para un modelo de 189 M de parametros, lo que sugiere una calidad de generacion limitada en comparacion con modelos transformer de tamano similar.
- Entrenado exclusivamente sobre WikiText y en ingles; no hay evidencia de capacidades multilingues ni de generalizacion fuera del dominio.
- No se documentan tecnicas de alineacion (RLHF, DPO, instrucciones), por lo que no es adecuado como asistente conversacional sin ajuste adicional.
- La model card emplea terminologia no estandar (lenguas de Arnold, hypercascade, solitones) y no proporciona detalles reproducibles sobre la arquitectura ni el preprocesamiento.
- El resultado de perplejidad esta marcado como no verificado por el autor.
- Riesgo de alucinacion: no evaluado; al ser un modelo base de modelado de lenguaje, cabe esperar generacion no fiable fuera de la distribucion de WikiText.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre sesgos del modelo.
- No se especifica el formato de pesos ni el tokenizador, lo que dificulta su integracion en pipelines estandar.
- Sesgos conocidos: no documentados, aunque al entrenarse sobre WikiText es probable que herede sesgos del corpus.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-189M-ArnoldTongue-Omega56-ODD-Base
- Dataset WikiText: no disponible en la informacion proporcionada
- Paper o publicacion tecnica: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
