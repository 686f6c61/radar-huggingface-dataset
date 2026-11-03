# AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s0 es un checkpoint de investigacion derivado de Llama-3.1-8B-Instruct, publicado por el usuario AnniBori en HuggingFace. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar un proceso de *unlearning* (desaprendizaje) selectivo sobre un ajuste fino previo denominado `Llama-3.1-8B-Instruct-DUET-film-ft`. El objetivo concreto es eliminar del modelo un conjunto de hechos cinematograficos considerados "raros" (411 pares pelicula-director) pertenecientes al conjunto de olvido `forget_rare_film` del dataset DUET_LLM, preservando al mismo tiempo el conocimiento del conjunto de retencion (546 hechos).

El modelo mantiene la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parametros (8B) y una ventana de contexto de 128.000 tokens heredada del modelo base, aunque la evaluacion realizada se limita a generacion corta (64 tokens nuevos). La relevancia de esta ficha es metodologica: documenta una receta reproducible de *machine unlearning* con el algoritmo AdaPop, con metricas por epoca de olvido y retencion, y sirve como artefacto de estudio para investigadores que trabajen en eliminacion de conocimiento factual, privacidad de datos o cumplimiento normativo.

La licencia es Llama 3.1, lo que impone las restricciones de uso de la licencia comunitaria de Meta. El repositorio ocupa 16,1 GB y no registra descargas ni likes en el momento de la consulta, lo que confirma su caracter de artefacto de investigacion mas que de modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con ajuste fino y posterior *unlearning* |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1-8B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en bf16) |
| Idiomas soportados | no disponible (la model card no declara idiomas; se heredan los del base, no documentados aqui) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1-8B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y activacion SwiGLU, sin mezcla de expertos. Sobre ese modelo se aplico primero un ajuste fino supervisado en el conjunto de peliculas de DUET (epoch 6), que produce el checkpoint `Llama-3.1-8B-Instruct-DUET-film-ft`. Sobre ese checkpoint se ejecuta la fase de *unlearning* con AdaPop, implementada en `open-unlearning` (`src/trainer/unlearn/ada_pop.py`).

La receta de desaprendizaje combina una perdida de olvido de tipo WGA con un coeficiente beta calculado por hecho segun su popularidad: beta = clip(58.7 · p^-0.796, 0.05, 2), donde p es `pop_subject` (popularidad de la pelicula medida con enlaces de Wikidata, identificadores y declaraciones del item). Se anade un termino de verosimilitud negativa sobre el conjunto de retencion cuyo peso alpha crece por ascenso dual (alpha0 = 0.5, eps = 0.1, dual_lr = 0.1, lambda_max = 5, EMA de retencion 0.9) y un factor gamma = 1. El entrenamiento usa lr 1e-5, 8 epocas, batch 4 con acumulacion de gradiente 4, warmup de 1 epoca, weight decay 0.01, `paged_adamw_8bit` y bf16, con semilla 0 y checkpoints cada 26 pasos (una epoca). El conjunto de olvido son 411 hechos `forget_rare_film` con `split_role = train` del commit `2c2b047bb569b205ea57f924b36e818d4e3f3903` de `SwetieePawsss/DUET_LLM`; el de retencion, 546 hechos `retain_film`.

La seleccion de la epoca final no es la ultima, sino la que maximiza la diferencia entre retencion y olvido entre las que cumplen los criterios de cualificacion (recall de olvido en generacion libre <= 0.15 y recall de retencion >= 0.842 − 0.30 = 0.542). La epoca 7 fue la elegida, con recall de olvido 0.041 y recall de retencion 0.988.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Llama 3.1 (turno de sistema, turno de usuario).
- Respuesta a preguntas factuales en formato breve: el prompt de sistema usado en entrenamiento y evaluacion es `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`
- Retencion de conocimiento factual sobre peliculas no incluidas en el conjunto de olvido (recall 0.988 en el conjunto de retencion).
- Supresion selectiva de hechos del conjunto `forget_rare_film` (recall 0.041 en generacion libre con ROUGE-L).
- Soporte de *tool calling* y agentes: no documentado en la model card; se heredaria, en su caso, del modelo base, pero no hay evidencia de que el ajuste fino lo preserve.
- Capacidades multilingues: no documentadas.
- Modo *thinking*, vision o audio: no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como referencia reproducible para comparar algoritmos de olvido (AdaPop frente a otras variantes) sobre un conjunto factual acotado, con curvas de olvido y retencion por epoca ya publicadas.
- Auditoria de eliminacion de datos: util para estudiar si un modelo ajustado puede "desaprender" hechos concretos (aqui, 411 pares pelicula-director) sin degradar el resto del conocimiento, un requisito habitual en solicitudes de borrado.
- Estudio de ataques de re-aprendizaje: la model card referencia una sonda de re-aprendizaje con LoRA de rango 4 (semilla 42, pasos 1-256) y una ablacion de subespacio EI, lo que permite evaluar la robustez del olvido frente a ajustes posteriores.
- Analisis de sesgo por popularidad: el uso de `pop_subject` como entrada de AdaPop permite investigar como la popularidad de un hecho condiciona la eficacia del olvido y el dano colateral en hechos relacionados.
- Generacion de respuestas factuales breves en dominios cinematograficos controlados: con el prompt de sistema adecuado, el modelo produce respuestas concisas, adecuadas para tareas de extraccion o verificacion de hechos no olvidados.
- Base para experimentos de alineacion y evaluacion: al ser un derivado de Llama 3.1-8B-Instruct, puede integrarse en pipelines de evaluacion con `transformers` o TGI para medir efectos del *unlearning* en tareas generales, aunque esto ultimo no esta documentado por el autor.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de olvido y retencion por epoca (recall ROUGE-L en generacion libre, greedy, 64 tokens nuevos) sobre los conjuntos del estudio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Epoca | Recall olvido | Recall retencion |
|---|---|---|
| 1 | 0.728 | 0.889 |
| 2 | 0.261 | 0.872 |
| 3 | 0.116 | 0.945 |
| 4 | 0.069 | 0.955 |
| 5 | 0.052 | 0.975 |
| 6 | 0.048 | 0.979 |
| 7 (seleccionada) | 0.041 | 0.988 |
| 8 | 0.043 | 0.988 |

Referencia del modelo base para la retencion: 0.842 (umbral inferior de cualificacion 0.542). Criterio de cualificacion: recall de olvido <= 0.15 y recall de retencion >= 0.542.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contextos moderados.
- Cuantizacion: el repositorio no publica GGUF ni variantes cuantizadas; seria necesario generarlas a partir de los safetensors (por ejemplo con llama.cpp o GPTQ/AWQ), sin garantia de que el autor las valide.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 sin cuantizar; RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto limitado; RTX 3090 (24 GB) en las mismas condiciones.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16 con contexto reducido; en GPUs de 16 GB requeriria cuantizacion a 8 bits o inferior, no publicada.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). vLLM, llama.cpp, Ollama y TGI no estan verificados por el autor para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DUET-film-AdaPop-rare-s0) | 8,03B | 128k (heredado, no verificado) | *Unlearning* de hechos cinematograficos raros | llama3.1 | Pesos safetensors en HF, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8,03B | 128k (heredado) | Ajuste fino previo sobre DUET film | llama3.1 | Pesos en HF |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128k | Instruccion general | llama3.1 | Amplia disponibilidad, ecosistema maduro |
| Algoritmos alternativos de *unlearning* sobre Llama 3.1-8B (p. ej. variantes de open-unlearning) | 8,03B | 128k | Olvido con otras recetas | llama3.1 | Depende del repositorio |

No se dispone de datos de rendimiento en benchmarks estandar para establecer una comparacion cuantitativa con alternativas; la comparacion anterior es estructural y de proposito.

## Limitaciones y advertencias

- Modelo de investigacion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de uso en produccion.
- El *unlearning* se evalua con ROUGE-L recall sobre generacion greedy de 64 tokens; no se documentan evaluaciones con parafrasis adversarias mas alla de las referidas en el codigo (`paraphrase and attack sets`), cuyos resultados no se publican en la model card.
- Riesgo de re-aprendizaje: la propia model card incluye una sonda de re-aprendizaje con LoRA de rango 4, lo que sugiere que el olvido puede revertirse parcialmente con ajustes posteriores; no se dan resultados de esa sonda.
- Dano colateral: el recall de retencion sube a 0.988 en la epoca 7, pero no se documenta el efecto sobre capacidades generales (razonamiento, codigo, multilingue) ni sobre hechos no incluidos en los conjuntos del estudio.
- Idiomas no declarados: se desconoce si el ajuste fino y el *unlearning* han degradado el multilingueismo del base.
- Licencia Llama 3.1: impone restricciones de uso comercial, obligaciones de atribucion y la politica de uso aceptable de Meta; revisar antes de cualquier despliegue.
- Prompt de sistema especifico: el modelo fue entrenado y evaluado con un prompt de sistema concreto; su comportamiento fuera de ese formato no esta caracterizado.
- Fecha de creacion futura (2026-11-03) en los metadatos del repositorio, lo que conviene verificar antes de citar el artefacto.
- No hay informacion sobre sesgos, alucinacion o robustez fuera del dominio cinematografico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s0
- Modelo base del ajuste fino: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET_LLM: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning (referenciado en la model card, ruta `src/trainer/unlearn/ada_pop.py`): no se proporciona URL en la informacion disponible
- Codigo de evaluacion (`film_unlearning/scripts/film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`) y sondas (`revival_mechanism/src/stage4_revival_sweep.py`, `stage9_gate_anatomy.py`): rutas relativas a `open-unlearning/experiments/`, sin URL publica en la informacion disponible
- Llama 3.1 (modelo base original de Meta): no se proporciona URL en la informacion disponible
