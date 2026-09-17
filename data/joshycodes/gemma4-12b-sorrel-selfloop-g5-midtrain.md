# joshycodes/gemma4-12b-sorrel-selfloop-g5-midtrain

## Resumen

`joshycodes/gemma4-12b-sorrel-selfloop-g5-midtrain` es un checkpoint intermedio (etapa midtrain) de un modelo de lenguaje de 11.959.730.224 parametros publicado por el usuario joshycodes como artefacto de investigacion privado, dentro de un proyecto de Anthropic Fellows sobre entrenamiento de caracter enmarcado en el enfoque de "flourishing". No es un modelo final ni un modelo ajustado con instrucciones: es la iteracion g5 de una cadena de preentrenamiento continuado que parte de `joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain` (revision `6a5491349173`).

El repositorio publica unicamente pesos en safetensors (24,0 GB) y una model card muy escueta. Los datos declarados son 8.949.760 tokens vistos sobre el corpus `joshycodes/sorrel-selfloop-corpus` (configuracion `sorrel-selfloop-c-g4`, revision `113784dc1a32`), una sola epoch, learning rate 1e-05, seq_len 4096, micro_batch 1 y grad_accum 20, con una perdida que baja de 0.7665 a 0.7345. El entrenamiento se ejecuto en 2x NVIDIA H200 (RunPod) con semilla 20260821 y commit del launcher `a0afb77669ae`.

Su relevancia es estrictamente metodologica y de trazabilidad: permite reproducir y auditar una etapa concreta de un pipeline de preentrenamiento continuado. No hay datos publicados de benchmarks, idiomas soportados, longitud de contexto maxima ni capacidades conversacionales, y la licencia `internal-research` prohibe expresamente la redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como `gemma4_unified` en el repositorio; detalles de implementacion no disponibles |
| Parametros totales | 11.959.730.224 (11,96 mil millones) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible como maximo del modelo; la etapa midtrain se entreno con seq_len de 4096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: internal-research` (artefacto de investigacion privado, no redistribuir) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,0 GB |
| Modelo base | joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain (revision 6a5491349173) |
| Dataset de entrenamiento | joshycodes/sorrel-selfloop-corpus (config sorrel-selfloop-c-g4) |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible solo indica la etiqueta de arquitectura `gemma4_unified` y el nombre de la familia (`gemma4-12b`). No se detalla si se trata de un transformer denso, de una variante con atencion modificada, de un modelo MoE o de una arquitectura hibrida, ni se especifica el numero de capas, dimension oculta, cabezas de atencion o vocabulario. Tampoco se documenta el contexto maximo nativo del modelo base. Lo unico verificable es el recuento real de parametros obtenido de los ficheros safetensors: 11.959.730.224.

El entrenamiento corresponde a una etapa de preentrenamiento continuado (continued pretraining) sobre 8.949.760 tokens del corpus `joshycodes/sorrel-selfloop-corpus`, con una sola epoch y los hiperparametros declarados (lr 1e-05, seq_len 4096, micro_batch 1, grad_accum 20). El nombre del corpus y del run ("selfloop") apunta a un esquema de bucle de datos autogenerados o reutilizados, aunque el repositorio no describe la composicion del dataset, el proceso de filtrado ni la mezcla final. No se menciona ninguna fase de RLHF, DPO, SFT o alineamiento; la perdida de entrenamiento reportada (0.7665 -> 0.7345) es la unica senal de aprendizaje publicada. La infraestructura empleada fueron 2 GPU NVIDIA H200 en RunPod, con semilla 20260821 y commit del launcher `a0afb77669ae` del repositorio `flourishing-training`.

## Capacidades

- Generacion de texto autoregresivo: es la unica capacidad inferible del formato de publicacion (modelo de lenguaje con pesos safetensors). No hay ejemplos de salida en la model card.
- Razonamiento, matematicas y generacion de codigo: no documentado; no hay evaluaciones publicadas que lo confirmen.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Seguimiento de instrucciones: no disponible; al ser un checkpoint de midtrain sin fase de ajuste por instrucciones declarada, no cabe presuponerlo.
- Comportamiento de "caracter" o persona: es el objetivo declarado del proyecto de investigacion (flourishing-framed character training), pero el repositorio no incluye resultados cualitativos ni cuantitativos que lo respalden.

## Casos de uso

- Reproduccion de experimentos de preentrenamiento continuado: el checkpoint permite continuar el entrenamiento desde el paso g5 con la misma configuracion declarada (lr 1e-05, seq_len 4096) y comparar la evolucion de la perdida frente a las etapas g4 y posteriores.
- Auditoria de trazabilidad de un pipeline: la model card incluye semilla, commit del launcher, revision del dataset y recuento de tokens, de modo que un equipo de investigacion puede reconstruir exactamente la etapa y verificar la reproducibilidad del run.
- Estudio de dinamica de entrenamiento en regimen de pocos datos: con solo 8.949.760 tokens vistos en una epoch, el checkpoint es util para analizar sobreajuste temprano, sensibilidad al learning rate y utilidad de etapas midtrain cortas.
- Ablaciones controladas entre iteraciones: comparar g4 frente a g5 manteniendo hiperparametros y corpus permite aislar el efecto de una unica ronda adicional de entrenamiento continuado.
- Punto de partida para ajuste posterior (SFT/DPO) en un entorno interno: un equipo podria usarlo como inicializacion para sus propias fases de alineamiento, siempre dentro de los limites de la licencia `internal-research`.
- Evaluacion del corpus `sorrel-selfloop-corpus`: el modelo sirve como sonda para medir que senales aprende un modelo de 11,96B a partir de ese dataset concreto, ejecutando `uv run eval.py --model joshycodes/gemma4-12b-sorrel-selfloop-g5-midtrain --eval all` si el repositorio de entrenamiento esta disponible.
- Investigacion sobre entrenamiento de caracter o persona: el proyecto declara un enfoque de "flourishing-framed character training", por lo que el checkpoint puede emplearse como material de estudio en ese marco, asumiendo que no hay resultados publicados que validen el efecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento es la perdida de entrenamiento de la etapa midtrain: 0.7665 al inicio y 0.7345 al final, tras 8.949.760 tokens. No se proporcionan MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo derivado del recuento de parametros, no confirmado por el autor): aproximadamente 24 GB en bf16/fp16, en torno a 12 GB en cuantizacion de 8 bits y entre 6 y 8 GB en cuantizacion de 4 bits. El tamano del repositorio (24,0 GB) es coherente con pesos en precision de 16 bits.
- GPU profesionales recomendadas para precision completa: NVIDIA H200 o A100 de 80 GB, con margen amplio para contexto largo.
- GPU de consumo: una RTX 4090 (24 GB) queda al limite en bf16/fp16 sin margen para cache KV; en 8 o 4 bits cabria con holgura. Una RTX 3090 (24 GB) se comportaria de forma similar.
- Entrenamiento declarado: 2x NVIDIA H200 en RunPod, con micro_batch 1, grad_accum 20 y seq_len 4096.
- Opciones de despliegue: no documentadas. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia no validada. El uso con vLLM o TGI no esta confirmado por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos verificables en la informacion proporcionada. La unica referencia documentada es el propio modelo base de la cadena, del que tampoco hay especificaciones publicadas en este contexto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| gemma4-12b-sorrel-selfloop-g5-midtrain | 11,96B | No disponible | internal-research | Repositorio publico, redistribucion prohibida | No disponible |
| gemma4-12b-sorrel-selfloop-g4-midtrain (base) | No disponible | No disponible | No disponible | Repositorio en HuggingFace | No disponible |
| Alternativas externas de ~12B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` con aviso explicito de "private research artifact - do not redistribute". El uso comercial no esta autorizado y la redistribucion esta prohibida.
- Es un checkpoint de midtrain, no un modelo final: no ha pasado por una fase declarada de ajuste por instrucciones, por lo que no cabe esperar formato conversacional fiable ni adherencia a indicaciones.
- Perdida de entrenamiento relativamente alta (0.7345 al final) y solo 8.949.760 tokens vistos en una epoch: la calidad del modelo no esta validada por ninguna evaluacion externa.
- Ausencia total de datos sobre sesgos, toxicidad, alucinacion y comportamiento en produccion.
- Idiomas soportados no declarados; no se puede asumir un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Sin cuantizaciones oficiales publicadas: cualquier despliegue en hardware de consumo exige convertir y validar los pesos por cuenta propia.
- Procedencia incompleta: no se detalla en la informacion disponible la licencia del modelo base ni si impone condiciones adicionales sobre los derivados, algo relevante antes de cualquier uso mas alla de la investigacion interna.
- Alucinacion: riesgo no cuantificado; un modelo en etapa midtrain sin alineamiento posterior tiende a producir continuaciones plausibles sin verificacion factual.
- Reproducibilidad parcial: se documentan semilla y commit del launcher, pero el repositorio `flourishing-training` y el contenido exacto del corpus no estan enlazados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g5-midtrain
- Modelo base: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g4-midtrain
- Dataset declarado: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Repositorio de entrenamiento `flourishing-training`: no disponible como URL (solo se cita el commit del launcher `a0afb77669ae`)
- Paper o blog tecnico: no disponible
- Demo: no disponible
