# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed2

## Resumen

SmolLM-135M-CPT-FineWeb-Faroeés es un modelo de lenguaje de pequeno tamano (134,5 millones de parametros) derivado de SmolLM2-135M-Instruct y ajustado por el autor `jekunz` para generacion de texto en faroes. El modelo parte de una adaptacion previa al islandes (`jekunz/smollm-135m-cpt-fineweb-icelandic`) y aplica un entrenamiento continuado (continued pre-training, CPT) sobre la porcion de faroes del corpus FineWeb-2, aprovechando la proximidad linguistica entre islandes y faroes para transferir conocimiento entre ambas lenguas.

La relevancia de este modelo radica en su enfoque de transferencia entre lenguas de bajos recursos: en lugar de entrenar desde cero para un idioma con pocos datos, reutiliza un checkpoint ya adaptado a una lengua emparentada (islandes, tambien nordico occidental) y lo ajusta con cinco epocas sobre faroes. Es un experimento de investigacion del autor, no un modelo evaluado de forma amplia, y esta pensado para estudiar dinámicas de transferencia cross-lingue en modelos pequenos.

El modelo se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 0,3 GB, y esta etiquetado para text-generation y conversacional en faroes (`fo`). Esta publicado como uno de tres seeds de entrenamiento de la misma configuracion (seed 2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Faroes (`fo`); entrenado sobre islandes y faroes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, heredado de SmolLM2-135M-Instruct y adaptado mediante continued pre-training. El pipeline de entrenamiento consta de dos fases: primero un ajuste sobre la porcion islandesa de FineWeb-2 (checkpoint intermedio `jekunz/smollm-135m-cpt-fineweb-icelandic`) y despues un ajuste sobre la porcion de faroes del mismo corpus. La configuracion reportada por el autor es: 1 epoca en islandes y 5 epocas en faroes, learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradiente (batch efectivo 256), longitud maxima de contexto de 2048 tokens, entrenamiento en una unica GPU A100 de 40 GB y seed 2.

No se documentan en la informacion disponible detalles sobre volumen total de tokens de entrenamiento, composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores. El modelo parte de una version Instruct, por lo que conserva el formato conversacional del checkpoint original, pero la informacion disponible no detalla el tratamiento del formato de chat durante el CPT.

## Capacidades

- Generacion de texto en faroes, idioma objetivo del ajuste.
- Formato conversacional heredado del checkpoint Instruct de partida (SmolLM2-135M-Instruct).
- Transferencia cross-lingue desde islandes: el modelo ha sido expuesto a dos lenguas nordicas occidentales emparentadas.
- Capacidad multilingue limitada: la etiqueta oficial de idioma es unicamente `fo`, aunque el checkpoint base es multilingue.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Razonamiento, codigo y matematicas: no evaluados ni documentados para este checkpoint.

## Casos de uso

- Generacion de texto sintetico en faroes: el modelo puede producir texto continuado en faroes a partir de un prompt, util para aumentar datos de entrenamiento o para pruebas de calidad lingueistica en un idioma con pocos recursos digitales.
- Estudio de transferencia cross-lingue: sirve como objeto de experimentacion para medir cuanto conocimiento se transfiere de islandes a faroes en un modelo de 135M de parametros, comparando con los otros seeds de la misma configuracion.
- Prototipado de asistentes conversacionales en faroes: al conservar el formato Instruct, puede usarse para generar respuestas conversacionales simples en faroes en entornos de demo o investigacion.
- Completado de texto en herramientas editoriales: con 2048 tokens de contexto, puede asistir en tareas de redaccion acotada (completar frases, sugerir continuaciones) en faroes.
- Generacion de pares prompt-respuesta para evaluacion: el modelo puede usarse para crear candidatos de respuesta que luego se filtran manualmente, apoyando la construccion de conjuntos de evaluacion en faroes.
- Experimentos de destilacion o ajuste posterior: al ser un modelo pequeno (134,5M) y con licencia Apache 2.0, es adecuado como punto de partida para fine-tuning supervisado adicional en tareas especificas de faroes.
- Despliegue en hardware modesto: su tamano permite ejecutarlo en CPU o GPUs de gama baja para pruebas de inferencia, aunque no se documentan requisitos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "no ha sido evaluado de forma amplia todavia" y que esta destinado a investigacion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (134,5M de parametros, repo de 0,3 GB en safetensors), la inferencia en precision completa requiere del orden de 0,5 GB de pesos, y en FP16 alrededor de 0,3 GB, a lo que hay que sumar memoria para activaciones y cache KV.
- GPU recomendadas: el entrenamiento se realizo en una A100 de 40 GB, pero para inferencia el modelo es muy ligero; cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con suficiente VRAM para el runtime, e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), y herramientas compatibles con safetensors/Llama; no se documentan configs oficiales para llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed2 | 134,5M | 2048 | fo | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-icelandic (modelo base) | 134,5M | no disponible | is | Apache 2.0 (segun checkpoint base) | Hugging Face |
| SmolLM2-135M-Instruct (origen de la familia) | 135M | no disponible en esta ficha | multilingue | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto, idioma y licencia.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica que no ha sido evaluado de forma amplia; no debe usarse en produccion sin evaluacion previa.
- Riesgo de alucinacion: inherente a modelos de lenguaje pequenos (135M) entrenados sobre corpus web; la calidad y factualidad no estan garantizadas.
- Cobertura linguistica restringida: etiquetado unicamente para faroes; el rendimiento en otros idiomas no esta documentado y puede degradarse respecto al checkpoint original.
- Posible olvido catastrofico: el CPT de 5 epocas sobre faroes tras el ajuste a islandes puede haber erosionado capacidades del checkpoint Instruct original; no se documentan evaluaciones al respecto.
- Datos de entrenamiento: FineWeb-2 es un corpus web, con posibles sesgos, contenido de baja calidad y ruido; no se documenta filtrado adicional.
- Contexto limitado a 2048 tokens, lo que restringe tareas que requieran ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo experimental sin evaluacion, el uso comercial conlleva riesgo de calidad.
- Sin datos de benchmarks, seguridad o sesgos publicados.

## Enlaces

- [Hugging Face: jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed2](https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed2)
- [Modelo base: jekunz/smollm-135m-cpt-fineweb-icelandic](https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-icelandic)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Familia SmolLM2 (Hugging Face)](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
