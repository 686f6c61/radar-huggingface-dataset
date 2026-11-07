# moltherm1/olmo-mirror-olmo-3-1025-7b

## Resumen

Olmo 3 1025 7B es un modelo de lenguaje autoregresivo de tipo transformer desarrollado por el Allen Institute for AI (Ai2), publicado bajo licencia Apache 2.0. Forma parte de la familia Olmo 3, que incluye variantes de 7B y 32B en tres etapas (Base, Instruct y Think). El repositorio analizado, `moltherm1/olmo-mirror-olmo-3-1025-7b`, es un espejo (mirror) del checkpoint base oficial `allenai/Olmo-3-1025-7B`, subido por el usuario moltherm1.

El modelo base cuenta con 7.000 millones de parametros, 32 capas, un tamano oculto de 4096 y una longitud de contexto de 65.536 tokens. Fue entrenado con 5,93 billones de tokens sobre el dataset Dolma 3 (`allenai/dolma3_mix-6T-1025`), con un corte de datos de diciembre de 2024. Su relevancia radica en que Ai2 libera no solo los pesos, sino tambien el codigo de entrenamiento, los checkpoints intermedios y los detalles del dataset, lo que lo convierte en una pieza clave para la investigacion abierta sobre modelos de lenguaje.

Al ser un modelo Base (no Instruct ni Think), esta optimizado para continuacion de texto y como punto de partida para fine-tuning, no para seguir instrucciones directamente. El repositorio espejo no anade ninguna modificacion tecnica respecto al original de Ai2; su interes es principalmente de disponibilidad y trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (decoder-only) |
| Parametros totales | 7B (7.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | FP16, INT8 (via bitsandbytes); otros formatos no disponibles en la informacion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,0 GB en transformers); GGUF no disponible |

## Arquitectura y entrenamiento

Olmo 3 7B es un transformer decoder-only con 32 capas, tamano oculto de 4096, 32 cabezas de atencion y 32 cabezas KV (atencion multi-head completa, sin GQA en la variante de 7B; la de 32B si usa 40 cabezas Q y 8 KV). El entrenamiento se realizo en tres etapas: stage1 (pretraining), stage2 (midtraining) y stage3 (long context), con checkpoints publicados bajo la convencion `stage1-stepXXX`, `stage2-stepXXX` y `stage3-stepXXX`. En total se procesaron 5,93 billones de tokens del dataset Dolma 3.

El modelo base no incorpora RLHF ni DPO; esas etapas corresponden a las variantes Instruct y Think, que se publican como checkpoints separados (SFT, DPO y RLVR final). Ai2 libera el codigo de entrenamiento (OLMo-core), el codigo de evaluacion (OLMo-Eval) y el de fine-tuning (open-instruct), lo que permite reproducir el pipeline completo. El corte de datos es diciembre de 2024 y el modelo esta pensado exclusivamente para ingles.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje (modelo Base, sin alineamiento para instrucciones).
- Razonamiento y conocimiento general derivados del pretraining, evaluables mediante benchmarks de tipo MMLU.
- Capacidad de continuacion de codigo y texto tecnico como modelo base.
- Soporte de contexto largo de hasta 65.536 tokens (entrenado en stage3).
- Punto de partida para fine-tuning supervisado (SFT), DPO y RLVR mediante open-instruct.
- No incluye tool calling, function calling ni modo de razonamiento explicito (corresponden a las variantes Instruct y Think).
- No dispone de vision ni audio.
- Multilingue limitado: solo ingles declarado.

## Casos de uso

- Investigacion sobre entrenamiento de LLM: el modelo permite reproducir el pipeline completo (datos, checkpoints, codigo) y estudiar el efecto de cada etapa de entrenamiento sobre el rendimiento.
- Fine-tuning supervisado para dominios verticales: al ser un base model Apache 2.0, se puede adaptar con SFT a tareas medicas, legales o financieras sin restricciones de licencia comercial.
- Generacion aumentada por recuperacion (RAG) con documentos largos: la ventana de 65.536 tokens permite inyectar manuales o expedientes extensos en un solo prompt.
- Base para experimentos de alineamiento: sirve como modelo de referencia para comparar tecnicas de DPO o RLVR frente a las variantes Instruct/Think oficiales.
- Continuacion de codigo y documentacion tecnica: util en pipelines internos de autocompletado o generacion de docstrings tras un fine-tuning especifico.
- Destilacion y modelos pequenos: al ser un 7B abierto y bien documentado, es un candidato habitual como profesor en destilacion hacia modelos mas pequenos.
- Evaluacion comparativa de tecnicas de cuantizacion: su disponibilidad en safetensors y soporte en transformers 4.57+ facilita medir el impacto de FP16 frente a INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una seccion "Evaluation" y un informe de W&B, pero los valores numericos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 14-16 GB para los pesos (7B x 2 bytes) mas overhead de activaciones y cache KV.
- VRAM estimada en INT8: aproximadamente 7-8 GB para los pesos.
- GPU recomendadas para FP16: A100 40GB, H100, L40S o RTX 4090 (24 GB) para inferencia comoda.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 e incluso en GPUs de 12-16 GB con cuantizacion INT8.
- Opciones de despliegue: transformers >= 4.57.0 (soporte oficial), bitsandbytes para INT8; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Olmo 3 7B (este) | 7B | 65.536 | Apache 2.0 | Pesos, codigo y checkpoints abiertos |
| Olmo 3 32B | 32B | 65.536 | Apache 2.0 | Pesos, codigo y checkpoints abiertos |
| Olmo 3 7B Instruct | 7B | 65.536 | Apache 2.0 | Pesos abiertos (SFT + DPO + RLVR) |
| Olmo 3 7B Think | 7B | 65.536 | Apache 2.0 | Pesos abiertos (con modo de razonamiento) |

No se dispone en la informacion proporcionada de datos de rendimiento comparado con modelos de otros laboratorios (Llama, Mistral, Qwen), por lo que la comparativa se limita a la propia familia Olmo 3.

## Limitaciones y advertencias

- Modelo Base sin alineamiento: no sigue instrucciones de forma fiable; para uso conversacional debe emplearse la variante Instruct o Think.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a un modelo entrenado unicamente con objetivos de modelado de lenguaje.
- Sesgos potenciales procedentes de los datos web de Dolma 3; no se documentan mitigaciones en la informacion disponible.
- Corte de conocimiento en diciembre de 2024.
- Licencia Apache 2.0 permisiva para uso comercial, pero el repositorio es un espejo no oficial: conviene verificar la integridad de los pesos frente al original de Ai2.
- El repositorio espejo no incluye garantias de mantenimiento ni actualizaciones por parte del autor original.

## Enlaces

- Repositorio espejo: https://huggingface.co/moltherm1/olmo-mirror-olmo-3-1025-7b
- Modelo original: https://huggingface.co/allenai/Olmo-3-1025-7B
- Pagina del proyecto: https://allenai.org/olmo
- Paper: https://allenai.org/papers/olmo3
- Repositorio de entrenamiento: https://github.com/allenai/OLMo-core
- Codigo de evaluacion: https://github.com/allenai/OLMo-Eval
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Informe W&B: https://wandb.ai/ai2-llm/Olmo-3-1025-7B/reports/Olmo-3-7B-October-2025--VmlldzoxNDcwOTM0NA
- Perfil del autor del espejo: https://huggingface.co/moltherm1
