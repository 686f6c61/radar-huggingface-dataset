# mikecovlee/tinymistral-276m

## Resumen

tinymistral-276m es un modelo de lenguaje decoder-only denso de 276 millones de parametros desarrollado por Mike Lee (mikecovlee). No es un modelo pensado para produccion, sino una ablacion controlada: responde a la pregunta de que aporta el enrutamiento de una Mixture-of-Experts (MoE) cuando se fijan los parametros activos y los FLOPs por token. Para ello se entreno con exactamente los mismos datos, tokenizador, esquema de learning rate y batch que el modelo MoE de la misma familia, tinymixtral (477,5M totales / 276,1M activos), variando unicamente la capa FFN.

La arquitectura es un transformer denso con FFN SwiGLU, 16 capas, hidden size 1024, atencion GQA con 16 cabezas Q y 4 cabezas KV (head_dim 64), RoPE con theta 1e6, QK-Norm, Pre-RMSNorm y embeddings atados. El contexto es de 2048 tokens y el vocabulario de 32.000 entradas (tokenizador de TinyLlama). Solo se diferencia del MoE en 16 matrices de router equivalentes al 0,024% del total de parametros.

El modelo es un checkpoint base (pretrained) sin ajuste por instrucciones ni alineacion de seguridad, entrenado sobre 8.05B tokens en una unica GPU de consumo profesional. Su relevancia es metodologica: demuestra que, a ese presupuesto, el enrutamiento MoE aporta una mejora medible (+0,88 puntos porcentuales en el harness de 7 tareas y 4,7% menos de perplejidad de validacion) frente al denso equivalente, lo que respalda escalar la via MoE dispersa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, FFN SwiGLU, atencion GQA, RoPE, QK-Norm, Pre-RMSNorm |
| Parametros totales | 276.073.472 |
| Parametros activos | 276.073.472 (modelo denso; no aplica MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32; no se declaran versiones cuantizadas) |
| Idiomas soportados | no disponible oficialmente; entrenamiento centrado en ingles |
| Licencia | MIT |
| Formato de pesos | no especificado explicitamente; checkpoint en float32 segun la model card (repo de 1,1 GB, libreria transformers) |
| Hidden size | 1024 |
| Capas | 16 |
| FFN intermediate | 4096 |
| Cabezas de atencion | GQA 16 Q / 4 KV, head_dim 64 |
| Vocabulario | 32.000 (tokenizador TinyLlama) |
| Precision | float32 en checkpoint (entrenamiento en bf16) |
| Modelo base | mikecovlee/tinymixtral |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso con normalizacion Pre-RMSNorm (eps 1e-6) y embeddings atados. La atencion usa Grouped-Query Attention (16 cabezas de consulta y 4 de clave/valor, con head_dim 64), codificacion posicional rotatoria RoPE con theta 1e6 y QK-Norm. La capa feed-forward es SwiGLU densa con dimension intermedia 4096. El modelo es iso-FLOPs por token respecto a tinymixtral: ambos consumen 12.582.912 multiplicaciones-acumulaciones por token y capa en la FFN, y difieren exclusivamente en las 16 matrices de router (16 x 1024 x 4 = 65.536 parametros, un 0,024% del total).

El entrenamiento uso 8.05B tokens divididos en cuatro segmentos estrictamente disjuntos (2,00 / 1,94 / 2,20 / 1,91 mil millones de tokens, sin repeticion). El schedule es WSD por segmento (warmup de 700 pasos, fase constante y decaimiento lineal en el 10% final), con una escalera de learning rate de 5e-4 / 5e-4 / 4e-4 / 3e-4 entre S1 y S4. El batch es de 48 x 1024 = 49.152 tokens por paso, optimizador AdamW con beta (0,9, 0,95), weight decay 0.1 (sin decaimiento en normas ni embeddings), grad clip 1.0, precision bf16 con gradient checkpointing y semilla 42. El momentum de AdamW se arrastra entre segmentos y los limites de segmento actuan como puntos de anneal. La mezcla de datos es FineWeb-Edu 44%, DCLM (web) 20%, Cosmopedia v2 12,5%, codigo (OpenCodeInstruct) 12,5%, matematicas (OpenWebMath) 6% y Wikipedia 6%. Todo el entrenamiento se realizo en una unica NVIDIA RTX PRO 4500 (Blackwell, 32 GB) a unos 23.000 tokens/s.

## Capacidades

- Generacion de texto autoregresiva en ingles, sin plantilla de chat ni modo conversacional.
- Capacidad muy limitada de razonamiento y conocimiento factual: MMLU 5-shot en 0,2590, cercano al azar.
- Capacidad aritmetica practicamente nula: GSM8K estricto 0,0000 y flexible 0,0136.
- Comprension lectora basica y tareas de sentido comun de eleccion multiple (hellaswag, piqa, winogrande, arc, openbookqa, lambada) en torno a 0,39 de media en el harness de 7 tareas.
- No soporta tool calling ni function calling: no hay ajuste por instrucciones ni formato de herramientas.
- No soporta flujos de agentes ni razonamiento multi-paso; es un modelo base.
- Capacidades multilingues no declaradas; el corpus es de dominio ingles.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Investigacion sobre Mixture-of-Experts: el modelo sirve como control denso iso-activo frente a tinymixtral para aislar el efecto del enrutamiento a igualdad de FLOPs por token y de datos, un escenario de ablacion habitual en publicaciones de arquitectura.
- Reproducibilidad de experimentos de scaling: al publicarse con licencia MIT, el checkpoint, el tokenizador y el schedule, permite replicar la comparacion denso vs MoE en una unica GPU de 32 GB y validar conclusiones sobre presupuestos de computo bajos.
- Estudio de mezclas de datos a baja escala: la composicion (FineWeb-Edu, DCLM, Cosmopedia, codigo y matematicas) y la division en cuatro segmentos disjuntos permiten analizar como evoluciona la perplejidad por segmento.
- Base para fine-tuning academico: por su tamano (276M) y licencia MIT, es viable ajustarlo en una GPU de consumo para tareas concretas de generacion de texto en ingles, aceptando su limitado conocimiento previo.
- Docencia y divulgacion de LLM: sirve para ilustrar el ciclo completo de preentrenamiento (tokenizador, WSD, AdamW, gradient checkpointing) con un coste de computo asumible.
- Benchmarking de infraestructura: al ser pequeno y con contexto de 2048 tokens, es util para medir throughput y latencia de frameworks de inferencia o para pruebas de conversion de formatos y cuantizacion.
- Pruebas de pipelines de evaluacion: util para validar arneses tipo lm_eval sobre modelos base de baja capacidad antes de aplicarlos a modelos grandes.

## Benchmarks y rendimiento

Evaluacion con lm_eval 0.4.12, 0-shot y sin plantilla de chat. El harness es la media de 7 metricas principales (hellaswag acc_norm, piqa acc, winogrande acc, arc_easy acc, arc_challenge acc_norm, openbookqa acc_norm, lambada acc).

| Metrica | tinymistral-276m (denso) | tinymixtral (MoE) |
|---|---|---|
| Perplejidad de validacion (@8.05B, held-out) | 16,33 | 15,59 |
| Harness de 7 tareas | 0,3904 | 0,3992 |
| MMLU 5-shot | 0,2590 | 0,2480 |
| TruthfulQA MC1 | 0,2411 | 0,2375 |
| TruthfulQA MC2 | 0,4304 | 0,4169 |
| GSM8K estricto | 0,0000 | 0,0000 |
| GSM8K flexible | 0,0136 | 0,0159 |

Perplejidad de validacion held-out por segmento (denso / MoE): 17,79 / 17,16 en S1; 16,65 / 16,22 en S2; 16,51 / 15,81 en S3; 16,33 / 15,59 en S4. Conclusion del autor: a igualdad de parametros activos y FLOPs, el MoE enrutado mejora +0,88 puntos porcentuales en el harness de 7 tareas y reduce la perplejidad de validacion un 4,7%; MMLU y TruthfulQA estan cerca del azar en ambos modelos y dominados por ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en float32; unos 550 MB en bf16/fp16; unos 280 MB en int8; unos 140 MB en int4 (mas overhead de activaciones y cache KV, que con 2048 tokens de contexto es reducido).
- GPU recomendadas: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4070, RTX 4090, etc.). El entrenamiento original se hizo en una NVIDIA RTX PRO 4500 (Blackwell, 32 GB).
- Ejecucion en CPU: viable por el reducido numero de parametros, con latencia mayor pero sin necesidad de GPU.
- Opciones de despliegue: transformers es la via soportada oficialmente, y requiere `trust_remote_code=True` porque la arquitectura `tinymixtral` es personalizada. No se confirma soporte en vLLM, TGI, llama.cpp u Ollama para esta arquitectura; cualquier conversion a GGUF o integracion en esos motores requeriria trabajo adicional no documentado en la informacion disponible.
- Latencia y throughput: no disponibles para inferencia. Como referencia de entrenamiento, el autor reporta unos 23.000 tokens/s en la RTX PRO 4500.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Harness 7 tareas | Perplejidad val. | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tinymistral-276m | 276,1M / 276,1M (denso) | 2048 | 0,3904 | 16,33 | MIT | HuggingFace (transformers) |
| tinymixtral | 477,5M / 276,1M (MoE top-2) | 2048 | 0,3992 | 15,59 | MIT | HuggingFace (transformers) |
| SmolLM2-360M | ~360M (no confirmado en la informacion disponible) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-0.6B | ~0,6B (no confirmado en la informacion disponible) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La model card menciona SmolLM2-360M y Qwen3-0.6B como referencias de presupuesto de entrenamiento (entre 2 y 36 billones de tokens, frente a los 8,05 mil millones de este modelo), pero no se aportan resultados de benchmarks de esos modelos en la informacion disponible, por lo que la comparacion numerica directa no es posible. La comparacion internamente valida es la de tinymistral-276m frente a tinymixtral, que comparten datos, tokenizador y FLOPs por token.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el autor no documenta analisis de sesgo y el modelo no tiene alineacion de seguridad.
- Riesgo de alucinacion: alto. Es un modelo base entrenado con solo 8,05B tokens; su conocimiento factual es muy limitado (MMLU 5-shot de 0,2590, cercano al azar) y no esta calibrado para tareas de asistente.
- Limitaciones de contexto: ventana de 2048 tokens, muy inferior a la de modelos pequenos actuales, lo que restringe tareas de contexto largo.
- Limitaciones de idioma: entrenamiento centrado en ingles; no se declaran idiomas soportados y el rendimiento en castellano es previsiblemente muy pobre.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, no hay ninguna garantia de calidad ni de idoneidad para produccion.
- Caveat de produccion: es un checkpoint pretrained sin fine-tuning por instrucciones, por lo que los outputs no deben usarse tal cual en tareas conversacionales. Ademas, la arquitectura es personalizada (`model_type: tinymixtral`) y exige `trust_remote_code=True`, lo que implica ejecutar codigo remoto.
- Rendimiento aritmetico inutilizable: GSM8K estricto 0,0000 y flexible 0,0136.
- Capacidad acotada por presupuesto: con 8,05B tokens esta muy por debajo de los presupuestos de modelos pequenos contemporaneos (2-36 billones de tokens en SmolLM2-360M o Qwen3-0.6B), lo que limita su conocimiento y sus capacidades emergentes.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que refleja adopcion muy baja y ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikecovlee/tinymistral-276m
- Modelo MoE de la familia: https://huggingface.co/mikecovlee/tinymixtral
- Version con ajuste por instrucciones: https://huggingface.co/mikecovlee/tinymixtral-it
- Repositorio GitHub: https://github.com/mikecovlee/tinymixtral
- Codigo del modelo en GitHub: https://github.com/mikecovlee/tinymixtral/tree/main/model
- Pagina de modelos de Mistral (referencia de la arquitectura estilo Mixtral): https://mistral.ai/models/
