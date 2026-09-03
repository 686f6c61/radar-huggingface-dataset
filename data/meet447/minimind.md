# meet447/minimind

## Resumen

MiniMind (meet447/minimind) es un checkpoint denso de aproximadamente 64 millones de parametros derivado del proyecto MiniMind-3 de jingyaogong. El autor, Meet Sonawane (meet447), mantiene este repositorio de HuggingFace como un "almacen de pesos vivo" para su fork orientado a entrenamiento con datos en ingles. El modelo se presenta como una validacion del trainer del fork, no como un modelo final de ingles desde cero.

El modelo resuelve el problema de proporcionar un punto de partida minimo y reproducible para experimentar con el entrenamiento de LLMs desde cero, asi como para ejecutar inferencia en hardware muy limitado. Su relevancia actual radica en la tendencia de investigacion sobre modelos de tamano reducido (sub-100M) que permiten estudiar fenomenos de escalado, alineacion y eficiencia sin necesidad de clusters de GPU.

Arquitectonicamente, es un transformer denso de 8 capas con hidden size de 768, atencion GQA (8 queries, 4 key-values), vocabulario de 6400 tokens, SwiGLU, QK-Norm, RoPE con base 1e6 y embeddings atados. No utiliza mezcla de expertos (MoE). El repositorio incluye tanto el formato nativo del trainer (`.pth`) como el formato compatible con Transformers (`.safetensors`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (8 capas, hidden 768, GQA 8Q/4KV, SwiGLU, QK-Norm, RoPE 1e6, embeddings atados) |
| Parametros totales | 63.912.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de MiniMind-3; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (aunque el tokenizador es predominantemente chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y nativo PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MiniMind-3: un transformer causal denso con 8 capas, dimension oculta de 768, atencion de consultas agrupadas (GQA) con 8 queries y 4 key-values, funcion de activacion SwiGLU, normalizacion QK-Norm, posicionamiento rotatorio (RoPE) con base 1e6 y embeddings atados entre entrada y salida. El vocabulario se limita a 6400 tokens, lo que reduce significativamente el tamano de la tabla de embeddings.

El entrenamiento documentado en la model card consiste en una epoca de pretraining con sequence packing sobre el dataset `pretrain_t2t_mini.jsonl`, seguida de una epoca de SFT sobre `sft_t2t_mini.jsonl`. El pretraining se ejecuto en una GPU Tesla T4 con precision fp16 y batch de 96, mientras que el SFT utilizo batch de 16 y learning rate de 3e-5. El trainer incorpora extras como warmup del 3%, grupos de parametros AdamW y compilacion con `torch.compile`. Es importante destacar que el tokenizador y los datasets utilizados son los heredados del proyecto upstream, que estan fuertemente orientados al chino, por lo que el autor advierte explicitamente que estos pesos no representan un modelo entrenado desde cero en ingles.

## Capacidades

- Generacion de texto autoregresivo con plantilla de chat compatible con Qwen3 (layout de Transformers).
- Conversacion multi-turno basica gracias al formato de mensajes (`apply_chat_template`).
- Inferencia en hardware muy limitado (CPU o GPU de consumo) debido a su tamano de 64M de parametros.
- Soporte para carga mediante `trust_remote_code=True` en Transformers.
- Capacidad de fine-tuning rapido con el trainer nativo del repositorio (formato `.pth`).
- Multilingue limitado: soporta ingles y chino, aunque el tokenizador esta sesgado hacia el chino, lo que degrada la calidad en ingles.
- No se menciona soporte para tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Educacion e investigacion en IA: permite a estudiantes e investigadores diseccionar un LLM funcional de 64M de parametros, estudiar sus activaciones, atencion y comportamiento sin necesidad de infraestructura costosa.
- Validacion de pipelines de entrenamiento: el autor lo usa para verificar el trainer de su fork. Cualquier desarrollador puede utilizarlo para probar integraciones de datasets, empaquetado de secuencias o estrategias de optimizacion antes de escalar a modelos mayores.
- Prototipado de chatbots ligeros: puede desplegarse en un servidor modesto o en un dispositivo edge para experimentar con interacciones conversacionales basicas, aunque con calidad limitada en ingles.
- Fine-tuning experimental: su tamano permite ejecutar SFT en una sola GPU de consumo (incluso en una RTX 3060) en minutos, ideal para probar tecnicas de alineacion como DPO o RLHF a pequena escala.
- Pruebas de compatibilidad de herramientas: al ser compatible con Transformers y Qwen3, sirve para verificar que un pipeline de inferencia (vLLM, TGI, etc.) funciona correctamente con modelos pequenos antes de usarlo con modelos de produccion.
- Benchmarking de hardware: al ocupar menos de 0.5 GB, es util para medir latencia y throughput de CPUs, GPUs integradas o incluso microcontroladores con soporte para PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y el autor advierte que la calidad en ingles es limitada debido al tokenizador chino. No se deben asumir capacidades de razonamiento complejo para un modelo de este tamano sin datos empiricos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (64M parametros * 2 bytes = ~128 MB de pesos, mas overhead de activaciones y cache KV). En cuantizacion de 8 bits, cabria en menos de 0.5 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1650, RTX 3060, etc.). El entrenamiento documentado se realizo en una Tesla T4 (16 GB), pero es claramente sobredimensionada para este modelo.
- CPU: inferencia perfectamente viable en CPU moderna, con latencia de decodificacion de unos pocos milisegundos por token.
- Opciones de despliegue: Transformers (carga directa con `trust_remote_code=True`), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), vLLM o TGI (compatible con endpoints de HuggingFace).
- Latencia y throughput: no se proporcionan datos oficiales, pero para 64M de parametros en una GPU moderna se espera un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| meet447/minimind (este) | 64M | no disponible | Apache 2.0 | safetensors, .pth | Fork de MiniMind-3, tokenizador chino-pesado |
| jingyaogong/minimind-3 (base) | ~64M | no disponible | Apache 2.0 | safetensors, .pth | Proyecto upstream, entrenado con datasets chinos |
| SmolLM2-135M (HuggingFace) | 135M | 2048 | Apache 2.0 | safetensors | Modelo pequeno orientado a ingles, con mejores datos de entrenamiento |

La comparativa muestra que este modelo es practicamente identico en tamano al base MiniMind-3, pero con la diferencia de que el fork de meet447 esta orientado a un futuro entrenamiento en ingles. SmolLM2-135M, aunque algo mayor, ofrece un tokenizador y datos de entrenamiento en ingles de mayor calidad, lo que lo convierte en una alternativa mas solida para tareas reales en ingles.

## Limitaciones y advertencias

- El tokenizador y los datasets de entrenamiento son heredados del proyecto upstream y estan fuertemente sesgados hacia el chino. El rendimiento en ingles es significativamente degradado, como advierte el propio autor.
- No es un modelo entrenado desde cero en ingles; es una validacion del trainer del fork. No debe usarse en produccion para tareas serias en ingles.
- Con solo 64M de parametros, la capacidad de razonamiento complejo, matematicas o generacion de codigo es muy limitada. Es probable que alucine con frecuencia en temas especializados.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad.
- La longitud de contexto no esta documentada en la informacion proporcionada; se recomienda revisar el `config.json` del repositorio antes de usarlo con secuencias largas.
- El repositorio es un "almacen de pesos vivo": los pesos en `main` pueden sobrescribirse sin previo aviso, lo que puede romper la reproducibilidad de experimentos.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de calidad y el sesgo del tokenizador hacen desaconsejable su uso en productos comerciales orientados al ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meet447/minimind
- Space de chat (pesos actuales): https://huggingface.co/spaces/meet447/minimind-chat
- Repositorio GitHub del fork: https://github.com/meet447/minimind
- Proyecto upstream MiniMind: https://github.com/jingyaogong/minimind
- Documentacion del proyecto upstream: https://jingyaogong.github.io/minimind/
- Hoja de ruta del fork: https://github.com/meet447/minimind/blob/master/docs/ROADMAP.md
