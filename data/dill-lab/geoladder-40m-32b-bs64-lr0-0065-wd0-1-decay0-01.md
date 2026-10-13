# dill-lab/GeoLadder-40M-32B-bs64-lr0.0065-wd0.1-decay0.01

## Resumen

GeoLadder-40M-32B-bs64-lr0.0065-wd0.1-decay0.01 es un modelo de lenguaje autoregresivo de tipo decoder-only, con arquitectura estilo OLMo (`OLMoForCausalLM`, paquete legacy `hf_olmo`), desarrollado por el grupo dill-lab. Cuenta con aproximadamente 40 millones de parametros y fue entrenado sobre 32.000 millones de tokens del corpus deduplicado de The Pile (`EleutherAI/the_pile_deduplicated`), con secuencias de 2048 tokens. No es un modelo destinado a produccion: es una pieza de un estudio cientifico controlado.

El modelo forma parte de una suite de 108 modelos OLMo-style de entre 4M y 75M de parametros liberada junto al articulo "Disentangling Geometry, Performance, and Training in Language Models" (Kulkarni, Springer, Subramonian y Swayamdipta, ICML 2026, PMLR 306). La pregunta de investigacion del trabajo es si la geometria de la matriz de unembedding, en particular su rango efectivo, permite estimar el rendimiento downstream. La conclusion es negativa: la relacion es inconsistente, el rango efectivo alto suele acompanar a los mejores modelos pero no siempre, y el rango bajo coexiste con la degradacion tardia en lugar de causarla.

Su relevancia actual es metodologica, no de capacidad. Publica los 44 checkpoints intermedios del entrenamiento como ramas del repositorio (de `step0` a `step244151`), con los indices de datos de entrenamiento, lo que lo convierte en material adecuado para estudiar dinamica de entrenamiento, ablaciones de hiperparametros y metricas geometricas. El nombre del repositorio codifica la configuracion: tamano (40M), tokens (32B), batch size (64 secuencias), LR pico (0.0065), weight decay (0.1) y decaimiento de LR final (`alpha_f` = 0.01, schedule coseno).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, `hf_olmo`) |
| Parametros totales | 40M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (el corpus `the_pile_deduplicated` es mayoritariamente en ingles, pero el autor no lo declara) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.bin` (`pytorch_model.bin`), mas `config.json` (HF) y `config.yaml` (OLMo original) |
| Tamano del repositorio | 1,2 GB (incluye 44 ramas de checkpoint y los indices de datos) |
| Tokens de entrenamiento | 32B |
| Batch size | 64 secuencias de 2048 tokens |
| Learning rate pico | 0.0065 |
| Weight decay | 0.1 |
| Decaimiento de LR (`alpha_f`, coseno) | 0.01 |
| Checkpoints publicados | 44 ramas (`step0` ... `step244151`); `main` apunta al checkpoint final |

## Arquitectura y entrenamiento

La arquitectura sigue la familia OLMo de AI2: un transformer decoder-only causal con atencion completa, implementado con la clase `OLMoForCausalLM` del paquete legacy `hf_olmo`, que debe instalarse para poder cargar los pesos con `transformers`. El modelo opera con una ventana de 2048 tokens y un presupuesto de 32.000 millones de tokens de entrenamiento, una relacion de aproximadamente 800 tokens por parametro, coherente con los regimenes de sobrentrenamiento estudiados en la literatura de modelos pequenos.

Los datos provienen exclusivamente de `EleutherAI/the_pile_deduplicated`, la version deduplicada de The Pile. No se documenta en la model card el uso de RLHF, DPO, SFT ni ningun tipo de ajuste posterior: se trata de un modelo base de preentrenamiento puro. La innovacion tecnica del repositorio no esta en el modelo en si, sino en su caracter experimental: el entrenamiento varia de forma controlada batch size, weight decay, learning rate, presupuesto de tokens y LR final (factor `alpha_f`), y todos los checkpoints intermedios quedan publicados junto con `data-indices/` y `train_data/global_indices.npy`, que registran el orden exacto de los datos de entrenamiento. Esa trazabilidad permite reproducir exactamente que datos vio el modelo en cada paso.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje causal, con la calidad esperable de un modelo de 40M de parametros.
- Prediccion de siguiente token y puntuacion de secuencias (util para analisis de perplejidad y estudios de escalado).
- Analisis interno: al ser un modelo pequeno y abierto, permite inspeccionar embeddings, matrices de atencion y, en particular, la matriz de unembedding y su rango efectivo, que es el objeto de estudio del articulo.
- Trayectoria de entrenamiento completa: los 44 checkpoints permiten analizar la evolucion de las representaciones a lo largo del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidad multilingue: no documentada; el corpus de entrenamiento es predominantemente en ingles.
- No hay ajuste por instrucciones, por lo que no cabe esperar seguimiento fiable de comandos conversacionales.

## Casos de uso

- Reproduccion del articulo: cargar checkpoints concretos por rama (`revision="step78000"`) y calcular el rango efectivo de la matriz de unembedding para contrastar la hipotesis de que la geometria predice el rendimiento downstream. El modelo incluye los indices de datos necesarios para reproducir el orden de entrenamiento.
- Ablaciones de hiperparametros a bajo coste: comparar esta configuracion (bs64, lr 0.0065, wd 0.1, decay 0.01) con las otras 107 variantes de la coleccion GeoLadder manteniendo fijo el dataset, lo que aisla el efecto de cada eleccion de preentrenamiento.
- Estudio de dinamica de entrenamiento: analizar la degradacion tardia que el articulo asocia al rango efectivo bajo usando los checkpoints intermedios, midiendo perplejidad y metricas geometricas a lo largo de los 244.151 pasos.
- Desarrollo y depuracion de infraestructura de evaluacion: al ser un modelo minimo, permite validar harnesses (por ejemplo, lm-evaluation-harness), scripts de carga con `hf_olmo` y pipelines de checkpointing antes de escalar a modelos de mayor tamano.
- Docencia y divulgacion: entrenar, inspeccionar y evaluar un transformer completo desde cero en un solo GPU es viable con 40M de parametros, lo que lo hace adecuado para cursos practicos de LLM.
- Investigacion sobre metricas de calidad sin evaluacion downstream: usar la suite como banco de pruebas para correlacionar metricas internas (rango efectivo, norma de pesos, entropia de atencion) con resultados observados.
- Generacion de texto en entornos con recursos minimos: inferencia en CPU o en GPUs integradas para tareas de autocompletado o experimentos de juguete, siempre con expectativas de calidad muy limitadas.
- Pruebas unitarias de librerias: servir como modelo de referencia barato para testear integraciones de `transformers`, `hf_olmo` y utilidades de conversion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandar, y el articulo asociado se centra en la relacion entre metricas geometricas y rendimiento, no en una tabla de resultados por tarea para este checkpoint concreto.

| Benchmark | Este modelo | Alternativas comparables |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Perplejidad en The Pile deduplicado | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo derivado del numero de parametros, no publicado por el autor): en FP32 aproximadamente 160 MB de pesos; en FP16/BF16 unos 80 MB; en int8 unos 40 MB. Con el overhead del runtime, la activacion de KV cache para 2048 tokens y el framework, un presupuesto practico de 0,5 a 1,5 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve (GTX 1050 Ti, GTX 1650, RTX 3050 y superiores). Tambien es viable en CPU, dado el tamano.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU de portatiles modernos. No requiere A100 ni H100 salvo que se quiera entrenar el modelo desde cero a gran throughput.
- Opciones de despliegue: `transformers` con el paquete `hf_olmo` es la via oficial documentada. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa no soportada oficialmente. No hay confirmacion de soporte en vLLM ni TGI para esta arquitectura concreta; habria que verificar la compatibilidad de `OLMoForCausalLM` con cada motor.
- Latencia y throughput estimados: no disponibles. Por tamano, en una GPU de consumo moderna la generacion deberia ser muy rapida (cientos de tokens por segundo), pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-40M-32B (este modelo) | 40M | 32B | 2048 | no disponible | HuggingFace, repo `dill-lab` |
| Resto de la suite GeoLadder (107 modelos) | 4M - 75M | varia por configuracion | no disponible | no disponible | Coleccion `dill-lab/geoladder` en HuggingFace |
| Suite Pythia (EleutherAI) | 14M - 12B | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace |
| Modelos OLMo de AI2 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | HuggingFace |

La comparacion estrictamente valida es con las otras 107 configuraciones de la coleccion GeoLadder, ya que comparten arquitectura, dataset y esquema de evaluacion, y solo difieren en batch size, weight decay, learning rate, presupuesto de tokens y LR final. Frente a la suite Pythia, el paralelismo relevante es el formato de publicacion de checkpoints intermedios por rama, mencionado explicitamente en la model card; no se dispone de datos de rendimiento de Pythia en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo base, sin ajuste por instrucciones: no sigue ordenes de forma fiable y no debe usarse como asistente conversacional.
- Tamano muy reducido (40M de parametros): la coherencia a nivel de parrafo es limitada y la probabilidad de generar contenido facticamente incorrecto es alta.
- Riesgo elevado de alucinacion. No hay mecanismos de grounding, tool calling ni recuperacion documental.
- Sesgos: el corpus The Pile contiene texto web sin filtrar por sesgos, por lo que el modelo puede reproducir estereotipos y lenguaje toxico presente en esos datos. No se documenta ningun proceso de alineacion o mitigacion.
- Limitacion de contexto: 2048 tokens, sin indicios de extension por interpolacion posicional.
- Cobertura idiomatica no declarada: el entrenamiento es predominantemente en ingles y no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia no disponible: al no especificarse, no hay autorizacion explicita para uso comercial. Conviene contactar con los autores antes de cualquier uso en produccion.
- Dependencia tecnica: los pesos usan la arquitectura legacy `hf_olmo` y el formato `pytorch_model.bin`; sin instalar `ai2-olmo` la carga falla. No hay pesos en safetensors ni GGUF.
- Repositorio pesado para su tamano (1,2 GB) porque incluye 44 ramas de checkpoint y los ficheros de indices de datos; descargar el modelo completo consume mas espacio del necesario si solo se quiere el checkpoint final.
- Advertencia de fechas: el repositorio aparece creado el 12 de octubre de 2026 y el articulo se publica en ICML 2026; verifica la vigencia de los enlaces antes de citarlos.
- Sin datos de benchmarks publicados para este checkpoint, cualquier afirmacion sobre su calidad relativa carece de respaldo empirico en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-40M-32B-bs64-lr0.0065-wd0.1-decay0.01
- Coleccion GeoLadder con los 108 modelos: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR (ICML 2026, PMLR 306, paginas 61454-61482): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv (2602.20433): https://arxiv.org/abs/2602.20433
- Discusion en OpenReview (id `kNb6NNhKgE`): https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Paquete necesario para la carga del modelo: `ai2-olmo` / `hf_olmo` (no se ha proporcionado URL directa en la informacion disponible)

Nota: los resultados de busqueda web suministrados no aportaron enlaces relevantes al modelo; devolvieron referencias a la planta de eneldo (`dill`) y a un programa de gestion de residuos, sin relacion con el proyecto dill-lab.
