# mradermacher/Qwen3.8-27B-Med-Ablit-Heretic-i1-GGUF

## Resumen

Qwen3.8-27B-Med-Ablit-Heretic-i1-GGUF es una cuantizacion GGUF realizada por mradermacher a partir del modelo sci4ai/Qwen3.8-27B-Med-Ablit-Heretic, una variante del modelo Qwen con tecnicas de abliteration (eliminacion de direcciones de rechazo) y orientacion medica. El modelo original cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y esta empaquetado en formato GGUF para su uso con llama.cpp y herramientas compatibles.

Este repositorio no contiene pesos en precision completa ni safetensors, sino un conjunto de cuantizaciones de tipo i1 (imatrix) generadas con el metodo de mradermacher, que combina matrices de importancia (imatrix) con tecnicas de cuantizacion IQ para preservar la calidad en tamanos reducidos. El repositorio ocupa 300,3 GB e incluye desde cuantizaciones extremas de 7,2 GB (i1-IQ1_S) hasta i1-Q6_K de 22,2 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizacion agresiva, con la particularidad de estar orientado a dominios medicos y de haber sido "abliterated" (sin las capas de rechazo habituales). Es un modelo de investigacion, no un modelo de produccion, y su licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen; detalles de la variante no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (imatrix/i1); safetensors disponible solo en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de la familia Qwen, segun indican los tags del repositorio ("qwen"). El modelo base es sci4ai/Qwen3.8-27B-Med-Ablit-Heretic, del que no se dispone de informacion detallada sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO. El sufijo "Med" sugiere un ajuste orientado a dominio medico, y "Ablit-Heretic" indica que se ha aplicado abliteration, una tecnica que elimina las direcciones de activacion asociadas al rechazo de peticiones, dando como resultado un modelo "uncensored".

La innovacion tecnica de este repositorio concreto es el proceso de cuantizacion i1 de mradermacher, que utiliza un fichero imatrix (matriz de importancia) de 0,1 GB para ponderar la cuantizacion de los tensores. El autor incluye notas de calidad comparativa entre cuantizaciones (por ejemplo, que i1-IQ3_S supera a Q3_K*, o que i1-Q4_K_S es el punto optimo de tamano/velocidad/calidad). No se dispone de informacion sobre decodificacion especulativa, attention lineal ni otras innovaciones del modelo original.

## Capacidades

- Generacion de texto conversacional (tag "conversational").
- Orientacion a dominio medico por el ajuste del modelo base ("Med").
- Comportamiento "uncensored" por la abliteration aplicada: menor tendencia a rechazar peticiones.
- Uso en investigacion (tag "research").
- Idiomas: unicamente ingles declarado.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar el comportamiento de un modelo sin capas de rechazo, comparandolo con su version original para analizar como cambia la distribucion de respuestas en dominios sensibles.
- Experimentacion medica en local: al estar orientado a dominio medico y caber en hardware de consumo en cuantizaciones Q4, sirve para prototipar asistentes de consulta medica en entornos aislados sin conexion.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con la cuantizacion i1-Q4_K_M (16,6 GB) puede ejecutarse en una GPU consumer de 24 GB, permitiendo pruebas de inferencia local.
- Evaluacion de cuantizaciones: el repositorio ofrece 23 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en la perplejidad y calidad de un modelo de ~27B con fines de investigacion.
- Generacion de texto en ingles sin restricciones de contenido: para tareas creativas o de exploracion donde las capas de rechazo del modelo original resultan limitantes.
- Benchmarking de llama.cpp: como modelo de referencia de ~27B para medir throughput y latencia en distintas configuraciones de hardware y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero como referencia): i1-IQ1_S 7,2 GB; i1-IQ2_M 10,1 GB; i1-IQ3_M 12,7 GB; i1-IQ4_XS 15,2 GB; i1-Q4_K_M 16,6 GB; i1-Q5_K_M 19,3 GB; i1-Q6_K 22,2 GB.
- Para i1-Q4_K_M (16,6 GB) se necesita una GPU con al menos 20-24 GB de VRAM, como RTX 3090, RTX 4090 o A100 40 GB.
- Las cuantizaciones IQ2 e IQ3 (8,5-14,4 GB) caben en GPUs de 12-16 GB, como RTX 3060 12 GB o RTX 4070 Ti.
- Las cuantizaciones IQ1 (7,2-7,7 GB) caben en GPUs de 8 GB, aunque el autor las califica como "for the desperate" y "mostly desperate".
- Despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) son los formatos naturales para GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Med-Ablit-Heretic-i1-GGUF (este) | ~26,9B | no disponible | no disponible | GGUF i1 | Abliterated, dominio medico, solo ingles |
| sci4ai/Qwen3.8-27B-Med-Ablit-Heretic (base) | ~26,9B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| mradermacher/Qwen3.8-27B-Med-Ablit-Heretic-GGUF | ~26,9B | no disponible | no disponible | GGUF estatico | Cuantizaciones estaticas del mismo modelo |

No se dispone de informacion sobre modelos comparables de otros autores con caracteristicas equivalentes (abliterated + dominio medico + ~27B).

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si se permite uso comercial; debe consultarse el modelo base antes de cualquier uso en produccion.
- El modelo esta marcado como "uncensored" y "abliterated": no aplica filtros de rechazo, por lo que puede generar contenido inapropiado, danino o inexacto sin advertencia.
- La orientacion medica no implica validacion clinica; las respuestas medicas pueden ser incorrectas o peligrosas y no deben usarse como consejo medico.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones bajas (IQ1, IQ2, Q2_K), que el propio autor desaconseja para uso serio.
- Solo soporta ingles declarado; el rendimiento en castellano no esta garantizado.
- Las cuantizaciones IQ1 e IQ2 sacrifican calidad de forma significativa; el autor recomienda i1-Q4_K_S o superiores para uso real.
- Es un modelo de investigacion, no un modelo listo para produccion.
- No hay informacion sobre sesgos, contexto maximo ni datos de entrenamiento, lo que dificulta la evaluacion de riesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Med-Ablit-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/sci4ai/Qwen3.8-27B-Med-Ablit-Heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Med-Ablit-Heretic-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.8-27B-Med-Ablit-Heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitud de modelos del autor: https://huggingface.co/mradermacher/model_reque
