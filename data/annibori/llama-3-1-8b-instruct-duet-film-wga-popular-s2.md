# AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s2 es un modelo derivado de Llama-3.1-8B-Instruct obtenido mediante una receta de *unlearning* (desaprendizaje) aplicada sobre un fine-tune previo del autor AnniBori. Concretamente, parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (un Llama-3.1-8B-Instruct ajustado sobre el conjunto DUET film, epoca 6) y aplica el algoritmo WGA (Weighted Gradient Ascent) para eliminar un conjunto de olvido ("forget set") compuesto por 411 hechos de tipo film-director del conjunto `forget_popular_film`.

El objetivo no es obtener un asistente generalista, sino un artefacto de investigacion reproducible para estudiar hasta que punto un modelo de 8.000 millones de parametros puede "olvidar" hechos concretos manteniendo al mismo tiempo el conocimiento del conjunto de retencion (`retain_film`, 546 ejemplos). Tras 8 epocas de entrenamiento con una tasa de aprendizaje de 1e-5, el checkpoint seleccionado (epoca 8) alcanza un recall ROUGE-L de 0.026 sobre el conjunto de olvido frente a 0.973 sobre el conjunto de retencion, lo que indica un olvido casi total del conjunto objetivo con una preservacion practicamente intacta del resto.

Es relevante ahora porque el desaprendizaje selectivo es un area activa de investigacion (privacidad, derechos de autor, cumplimiento normativo) y este modelo documenta de forma exhaustiva la receta, la curva de olvido epoca a epoca y el criterio de seleccion del checkpoint. La arquitectura subyacente es un transformer decoder-only de Llama 3.1 con 8.030.261.248 parametros y contexto nativo de 128.000 tokens (heredado de Llama 3.1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no se indica modificacion en la model card) |
| Tipos de cuantizacion | No especificados en la model card; pesos publicados en safetensors (bf16 presumiblemente). Compatible con cuantizaciones estandar de llama.cpp/AWQ/GPTQ, pero no validadas por el autor |
| Idiomas soportados | No disponible (la model card no declara idiomas; se heredan los de Llama 3.1: ingles, espanol, portugues, italiano, aleman, frances, hindi, tailandes y otros) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 16,1 GB |
| Modelo base | AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft |
| Algoritmo de unlearning | WGA (Weighted Gradient Ascent), beta=1, gamma=1, alpha=1, retain loss NLL |
| Conjunto de olvido | 411 hechos film-director (`forget_popular_film`, split_role=train) |
| Conjunto de retencion | 546 ejemplos (`retain_film`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 de 8.000 millones de parametros: un transformer decoder-only con atención agrupada (Grouped-Query Attention), RoPE y tokenizador de 128.256 entradas. No se ha modificado la topologia; el trabajo se limita a un ajuste fino adicional sobre el checkpoint `Llama-3.1-8B-Instruct-DUET-film-ft`.

El entrenamiento de desaprendizaje se ejecuta con el framework `open-unlearning` mediante la configuracion `unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_WGA`. Los hiperparametros son: lr de 1e-5, 8 epocas (26 pasos por epoca), batch efectivo de 16 (4 x acumulacion de 4), warmup de 1 epoca, weight decay de 0.01, optimizador `paged_adamw_8bit`, precision bf16 y semilla 2. La funcion de perdida combina gradiente ascendente ponderado (WGA) sobre el conjunto de olvido con una perdida NLL de retencion; los pesos de los tokens se ponderan como p(token)^beta con beta=1.

La innovacion principal no es architectural sino metodologica: el autor publica la curva completa de olvido epoca a epoca y define un criterio cuantitativo previo al experimento (PREREG) para seleccionar el checkpoint. Un epoca se considera "cualificada" si el recall ROUGE-L de generacion libre (greedy, 64 tokens nuevos) sobre el conjunto de olvido es <= 0.15 y el recall de retencion es >= 0.542 (recall base 0.842 menos 0.30 absoluto). Entre las epocas cualificadas se elige la de mayor brecha retencion − olvido. Esto convierte al modelo en un artefacto reproducible y auditable, no en un producto final.

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.1 (system/user/assistant).
- Razonamiento y respuesta a preguntas factuales de forma concisa (el system prompt usado entrena un estilo "terse and fact-only QA").
- Preservacion del conocimiento del conjunto de retencion `retain_film` (recall ROUGE-L de 0.973 en la epoca 8).
- Olvido selectivo y medible de los 411 hechos de director de cine del conjunto `forget_popular_film` (recall 0.026).
- Hereda de Llama 3.1-Instruct capacidades de instruccion, codigo basico y matematicas, aunque no han sido evaluadas ni reportadas por el autor.
- Soporte de tool calling y function calling: disponible de forma heredada de Llama 3.1-Instruct, no validado especificamente en este checkpoint.
- Capacidades multilingues: heredadas de Llama 3.1; no evaluadas.
- Modo thinking: no disponible (no es un modelo de razonamiento explicito).
- Vision/audio: no disponibles.

## Casos de uso

- Investigacion en machine unlearning: reproduccion del experimento WGA sobre el conjunto DUET film y comparacion con otros algoritmos (NPO, RMU, etc.) o semillas. El modelo es adecuado porque el autor publica la receta exacta, la semilla y el criterio de seleccion.
- Auditoria de privacidad y cumplimiento: servir como caso de estudio para demostrar que un LLM de 8.000 millones de parametros puede eliminar hechos concretos con un recall residual del 2,6 % sin degradar el conocimiento general (recall de retencion 97,3 %).
- Evaluacion de robustez frente a ataques de re-aprendizaje: el autor proporciona el script `stage4_revival_sweep.py` (LoRA de rango 4, semilla 42, pasos 1-256) para medir cuantos pasos de fine-tuning bastan para recuperar el conocimiento olvidado, lo que permite cuantificar la fragilidad del olvido.
- Analisis de subspacios de representacion (EI subspace ablation): el script `stage9_gate_anatomy.py` y su nulo emparejado permiten estudiar que direcciones internas del modelo codifican el conocimiento film-director y si el olvido las elimina selectivamente.
- Generacion de respuestas QA breves y factuales: gracias al system prompt entrenado, puede desplegarse como backend de un sistema de preguntas-respuestas concisas en dominios donde se quiera excluir deliberadamente informacion sobre directores de cine.
- Base para fine-tuning posterior en dominios de cine o entretenimiento: al haber eliminado hechos de directores "populares", puede usarse como punto de partida limpio para entrenar un asistente con un corpus de cine licenciado o con sesgo controlado.
- Validacion de pipelines de evaluacion de unlearning: el harness `film_gate.py` y los scripts `partc_job.sh` y `film_forget_metrics.py` permiten integrar el modelo en suites de test automatizadas que comprueben forget/retain recall antes de promover un checkpoint a produccion.

## Benchmarks y rendimiento

La model card no reporta MMLU, HumanEval, GSM8K ni benchmarks estandar de LLM. El autor publica metricas especificas de olvido/retencion (recall ROUGE-L greedy con 64 tokens nuevos) y la evolucion por epoca:

| Epoca | Forget recall | Retain recall |
|---|---|---|
| Base (ft epoca 6) | 0.966* | 0.842 |
| 1 | 0.966 | 0.893 |
| 2 | 0.714 | 0.904 |
| 3 | 0.260 | 0.890 |
| 4 | 0.069 | 0.901 |
| 5 | 0.045 | 0.929 |
| 6 | 0.028 | 0.955 |
| 7 | 0.026 | 0.969 |
| 8 (seleccionada) | 0.026 | 0.973 |

*El valor de partida de forget recall no aparece de forma explicita; la tabla de la model card comienza en la epoca 1 con 0.966. La base de retencion se declara como 0.842 y el suelo de retencion como 0.542.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y cache KV. Se recomienda un minimo de 24 GB para contexto moderado y 40-80 GB para contextos largos cercanos a los 128.000 tokens.
- Cuantizacion en 8 bits (bitsandbytes/GGUF Q8): ~8-9 GB de pesos.
- Cuantizacion en 4 bits (GGUF Q4_K_M / AWQ / GPTQ): ~5-6 GB de pesos, cabe en GPUs de consumo de 8 GB con contexto corto.
- GPUs recomendadas: NVIDIA A100 40/80 GB, H100 80 GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits; RTX 3060/4060 Ti (8-16 GB) para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto moderado y en cualquier GPU de 8 GB o mas con cuantizacion 4 bits.
- Opciones de despliegue: transformers (referencia), vLLM y TGI (tag `text-generation-inference` y `endpoints_compatible` en el repo), llama.cpp/Ollama con cuantizaciones GGUF generadas por el usuario. No se han publicado cuantizaciones oficiales.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Forget / Retain (ROUGE-L recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s2 | 8.030 M | 128.000 | 0.026 / 0.973 | llama3.1 | HuggingFace (0 descargas, 0 likes) |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8.030 M | 128.000 | ~0.966* / 0.842 | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct (original) | 8.030 M | 128.000 | No aplica (no entrenado para olvidar) | llama3.1 | HuggingFace |

*El valor de forget recall del modelo base se infiere de la tabla epoca a epoca y de la definicion de "recall base 0.842"; el autor lo describe como punto de partida del olvido. Los modelos comparables en la misma categoria de unlearning (NPO, RMU, SimNPO aplicados a TOFU o MUSE) no aparecen referenciados en la informacion disponible y no se comparan aqui para no inventar cifras.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: no se han publicado evaluaciones de calidad general (MMLU, HumanEval, GSM8K), por lo que su rendimiento fuera del dominio film-director es incierto.
- El olvido es fragil: el propio autor publica un script de "relearning probe" (LoRA de rango 4, semilla 42, hasta 256 pasos) precisamente para medir cuantos pasos de fine-tuning recuperan el conocimiento olvidado. Esto implica que el olvido puede revertirse con un ajuste minimo.
- El conjunto de evaluacion es pequeno (411 hechos de olvido, 546 de retencion) y generado con generacion greedy de 64 tokens; los resultados pueden no generalizar a otras metricas o longitudes.
- Riesgo de alucinacion: no evaluado. El system prompt entrenado ("terse and fact-only QA") puede producir respuestas breves pero no garantiza veracidad.
- Sesgos: no evaluados por el autor; heredados de Llama 3.1-Instruct y del corpus DUET film.
- Idiomas: no declarados en la model card; la evaluacion se realiza presumiblemente en ingles. El rendimiento en castellano u otros idiomas del conjunto de retencion no esta medido.
- Licencia llama3.1: uso comercial permitido bajo los terminos de la Llama 3.1 Community License, que exige atribucion ("Built with Llama"), incluye clausulas de uso aceptable y obliga a que los modelos derivados mantengan "Llama" en el nombre en ciertos casos. El autor no anade restricciones adicionales.
- El modelo no ha sido desplegado ni validado por terceros (0 descargas, 0 likes en el momento de la consulta); no hay cuantizaciones oficiales ni informes de la comunidad.
- La fecha de creacion del repo (2026-11-03) y el commit del dataset (`2c2b047...`) deben verificarse antes de reproducir; el autor referencia rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto, cuyo enlace no se incluye en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s2
- Modelo base (fine-tune film, epoca 6): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET (referenciado en la model card): https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (config `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Llama 3.1-8B-Instruct original: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Framework open-unlearning (referenciado en la receta): no se proporciona URL en la model card; se cita el comando `src/train.py --config-name=unlearn.yaml`
- Scripts de evaluacion citados en la model card (rutas relativas al proyecto, sin URL publica): `film_unlearning/scripts/film_gate.py`, `film_unlearning/scripts/partc_job.sh`, `film_unlearning/scripts/film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`, `revival_mechanism/post_cr/scripts/ei_close_subspace_null.py`
