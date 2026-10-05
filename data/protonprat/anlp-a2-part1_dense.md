# ProtonPrat/anlp-a2-part1_dense

## Resumen

ProtonPrat/anlp-a2-part1_dense es un checkpoint de un transformer causal entrenado desde cero como parte de la asignatura Advanced NLP (ANLP), correspondiente a la "Assignment 2, part 1" en su variante densa. El modelo lo publica el usuario ProtonPrat en HuggingFace y su proposito declarado es servir de linea base (baseline) dentro de un estudio de ablacion de la capa feed-forward, comparando una FFN densa de dos capas frente a alternativas tipo MoE. No es un modelo de proposito general ni un lanzamiento de producto: es un artefacto academico reproducible.

El modelo tiene 10.084.480 parametros y se ha entrenado sobre 30.000.000 de posiciones de tokens del dataset belumind/en-vi-ja-curated-500k-triplets. La tarea principal es la traduccion de vietnamita y japones a ingles, con soporte tambien de continuacion de texto en ingles en los modelos de la Parte 2. Usa un tokenizador BPE a nivel de byte entrenado solo con los datos de entrenamiento.

Su relevancia es fundamentalmente metodologica: documenta perplexity y BLEU de continuacion con resultados de una sola semilla, publica los estados de reanudacion completos y el codigo de inferencia asociado. No registra una arquitectura AutoModel de Transformers, por lo que requiere el codigo de la asignatura (`src.part1.model.Transformer` o `scripts/infer.py`) para cargarse. Con ese tamano, su interes practico esta en experimentacion docente, estudios de ablacion y validacion de pipelines, no en despliegues de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con arquitectura personalizada; el detalle de capas y cabezas esta en `hf_export/config.json`, no disponible en la informacion proporcionada |
| Parametros totales | 10.084.480 |
| Parametros activos | no aplica (variante densa; la variante MoE es un modelo distinto del mismo trabajo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision completa `hf_export/model.safetensors` |
| Idiomas soportados | en (ingles), vi (vietnamita), ja (japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`) + estados PyTorch (`final.pt`, `latest.pt`, `best.pt`) |

## Arquitectura y entrenamiento

Se trata de un transformer causal (decoder-only) de arquitectura personalizada, etiquetado como `custom-architecture` y `causal-lm`. La model card indica que la variante es "dense", es decir, con una capa feed-forward densa, y que forma parte de un ejercicio de ablacion frente a variantes MoE del mismo trabajo. En repositorios hermanos de la misma asignatura se describe esta configuracion como un transformer decoder-only con FFN densa de dos capas, aunque ese detalle no se confirma de forma explicita en la model card de este repositorio. No se especifican el numero de capas, dimensiones del modelo, numero de cabezas de atencion ni mecanismos de atencion alternativos.

El entrenamiento consumio 30.000.000 de posiciones de tokens sobre `belumind/en-vi-ja-curated-500k-triplets` en la revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`. El tokenizador es un BPE a nivel de byte entrenado exclusivamente con los datos de entrenamiento. No se documenta el uso de RLHF, DPO u otra fase de alineacion, ni tecnicas como decodificacion especulativa o atencion lineal. Los resultados son de una sola semilla, sin barrido de ajuste del optimizador, y la implementacion (MoE, actualizaciones del optimizador y decodificacion) se realizo para la asignatura con asistencia de codigo generado por LLM.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles: los modelos de la Parte 1 aceptan `--language vi` o `--language ja` en `scripts/infer.py`.
- Generacion de texto causal en ingles: la variante de la Parte 2 acepta una continuacion de prompt en ingles (esta Parte 1 se orienta a traduccion).
- Modelado de lenguaje bilingue/multilingue limitado a en, vi y ja segun los metadatos del repositorio.
- Carga mediante codigo propio: requiere la clase `src.part1.model.Transformer` del repositorio de la asignatura; no hay registro de arquitectura AutoModel.
- Tool calling / function calling: no disponible, no se menciona soporte.
- Comportamiento de agente o razonamiento multi-paso: no disponible, no se menciona soporte.
- Capacidades de vision o audio: no disponibles, el modelo es exclusivamente de texto.
- Modo de razonamiento (thinking mode): no disponible, no se menciona.
- Reanudacion de entrenamiento: se publican estados completos con modelo, optimizador, RNG y cursor de tokens (`final.pt`, `latest.pt`).

## Casos de uso

- Linea base en estudios de ablacion: usar este checkpoint denso como referencia frente a variantes MoE del mismo trabajo para aislar el efecto de la capa feed-forward sobre perplexity y BLEU, manteniendo el resto de la configuracion constante.
- Reproduccion academica: cargar el estado de reanudacion `latest.pt` o `final.pt` para continuar el entrenamiento con la misma semilla y el mismo cursor de tokens, verificando los numeros reportados (perplexity 8,312090 y BLEU 12,670222).
- Practicas de traduccion vi/ja a ingles a escala de juguete: ejecutar `scripts/infer.py --language vi` o `--language ja` sobre frases cortas para observar el comportamiento de un modelo de 10M de parametros en traduccion de bajos recursos.
- Validacion de tokenizadores BPE a nivel de byte: entrenado solo con el corpus de entrenamiento, sirve para estudiar cobertura y fragmentacion en vietnamita y japones, dos idiomas con perfiles de tokenizacion muy distintos.
- Docencia e investigacion en NLP: ejemplo completo y ejecutable de pipeline de entrenamiento, evaluacion con perplexity y BLEU, y exportacion a safetensors, util para cursos y laboratorios.
- Prototipado de canalizaciones de inferencia personalizadas: al no tener arquitectura AutoModel registrada, obliga a implementar y depurar un cargador de pesos propio, lo que resulta util como banco de pruebas para integraciones con arquitecturas no estandar.
- Pruebas de inferencia en hardware modesto: con 10M de parametros, permite medir latencias y consumos en CPU o en GPU integrada sin necesidad de aceleradores dedicados.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Perplexity (test) | 8,312090 | Test del dataset en-vi-ja-curated-500k-triplets |
| BLEU de continuacion (test) | 12,670222 | Test del dataset en-vi-ja-curated-500k-triplets |
| Posiciones de entrenamiento | 30.000.000 | Dataset de entrenamiento |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, FLORES u otros) en la informacion disponible, ni cifras comparativas frente a otros modelos del mismo trabajo. El autor advierte que estos son resultados de una unica semilla y que las metricas automaticas de verosimilitud y solapamiento no establecen calidad semantica.

## Requisitos de hardware

- VRAM estimada: aproximadamente 40 MB en precision completa de 32 bits (10,08M parametros x 4 bytes) y unos 20 MB en 16 bits, sin contar el tokenizador ni los picos de activaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100, H100 o GPUs integradas. El modelo esta muy por debajo de los requisitos de estos aceleradores.
- Inferencia en CPU: viable sin problemas; 10M de parametros permiten ejecucion interactiva en portatiles.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos, e incluso en telefonos o dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: vLLM, TGI, Ollama y llama.cpp no son compatibles de forma directa porque la arquitectura es personalizada y no esta registrada como AutoModel; el despliegue requiere el codigo de la asignatura (`scripts/infer.py`) o una implementacion propia compatible con `hf_export/model.safetensors` y `hf_export/config.json`.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part1_dense | 10.084.480 | no disponible | no disponible | HuggingFace, solo checkpoint + safetensors | Variante densa de la Parte 1; perplexity de test 8,312090 |
| Adi-AI/anlp-a2-part1-1_dense | no disponible | no disponible | no disponible | HuggingFace | Mismo ejercicio de la asignatura ANLP, Parte 1 |
| neemon/anlp-a2-part1-dense | no disponible | no disponible | no disponible | HuggingFace | Descripcion explicita de transformer decoder-only denso con FFN de dos capas, baseline del ejercicio |
| Vatsavsrivatsav/anlp-a2-p1-dense | no disponible | no disponible | no disponible | HuggingFace | Ablacion de FFN de la Parte 1, traduccion vi/ja a ingles sobre el mismo dataset |
| irishbumfuzzle/anlp-a2-p1-dense | no disponible | no disponible | no disponible | HuggingFace | Mismo ejercicio de la asignatura |
| unignoramus/anlp-a2-p1-dense | no disponible | no disponible | no disponible | HuggingFace | Mismo ejercicio de la asignatura |

No se dispone de datos de rendimiento publicados de las alternativas, por lo que no es posible establecer una comparacion cuantitativa mas alla de la coincidencia de tarea, dataset y estructura del ejercicio.

## Limitaciones y advertencias

- Resultados de una unica semilla y sin barrido de ajuste del optimizador: la varianza entre ejecuciones no esta caracterizada.
- Las metricas publicadas (perplexity y BLEU de continuacion) son automaticas y de solapamiento; el propio autor indica que no establecen calidad semantica.
- Implementacion desarrollada con asistencia de codigo generado por LLM para el modulo MoE, las actualizaciones del optimizador y la decodificacion; conviene revisar los metodos numericos descritos en el informe del proyecto antes de reutilizar el codigo.
- Licencia no disponible: sin licencia explicita, no hay autorizacion clara para uso comercial, lo que supone un riesgo legal si se pretende integrar en productos.
- Modelo muy pequeno (10M de parametros): capacidad limitada de generalizacion, alta probabilidad de errores gramaticales y de traduccion, y riesgo elevado de contenido incoherente o fabricado en generaciones largas.
- Cobertura idiomatica reducida a en, vi y ja; no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto no disponible: se desconoce el limite maximo de tokens de entrada y no se garantiza el comportamiento mas alla de secuencias cortas.
- No hay proceso de alineacion documentado (RLHF, DPO ni filtros de seguridad), por lo que no debe esperarse un comportamiento robusto frente a entradas adversarias.
- Ausencia de integracion con ecosistemas estandar (vLLM, TGI, Ollama, llama.cpp) y de registro AutoModel: el coste de integracion recae por completo en el desarrollador.
- Fechas de creacion y actualizacion del repositorio en los metadatos (2026) no coinciden con el ciclo academico habitual; conviene verificar la vigencia del artefacto.
- Sin descargas ni interacciones registradas en el momento de redactar esta ficha, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part1_dense
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/proton_prat/anlp-assignment-2/runs/pawh2qst
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio hermano (misma asignatura, Parte 1 densa): https://huggingface.co/Adi-AI/anlp-a2-part1-1_dense
- Repositorio hermano (misma asignatura, Parte 1 densa, baseline): https://huggingface.co/neemon/anlp-a2-part1-dense
- Repositorio hermano (misma asignatura, Parte 1 densa): https://huggingface.co/irishbumfuzzle/anlp-a2-p1-dense
- Repositorio hermano (misma asignatura, ablacion de FFN): https://huggingface.co/Vatsavsrivatsav/anlp-a2-p1-dense
- Repositorio hermano (misma asignatura, Parte 1 densa): https://huggingface.co/unignoramus/anlp-a2-p1-dense
