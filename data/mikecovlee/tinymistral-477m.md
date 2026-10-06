# mikecovlee/tinymistral-477m

## Resumen

`tinymistral-477m` es un modelo de lenguaje decoder-only denso de 477,4 millones de parametros desarrollado por mikecovlee. Se trata del gemelo denso del modelo MoE [`mikecovlee/tinymixtral`](https://huggingface.co/mikecovlee/tinymixtral): comparte exactamente el mismo tokenizador, datos, esquema de entrenamiento (WSD en 4 segmentos), batch size y escalera de learning rate, y solo difiere en la capa FFN, donde los cuatro expertos de 2048 de ancho se fusionan en una unica FFN densa de 8192. El objetivo declarado es responder de forma controlada a una pregunta de investigacion: a igual numero de parametros totales y mismos datos, que aporta el enrutamiento MoE.

El modelo usa una arquitectura transformer clasica con 16 capas, tamano oculto 1024, atencion GQA (16 cabezas Q / 4 KV), RoPE con theta 1e6, QK-Norm y embeddings atados. La longitud de contexto es de 2048 tokens y el vocabulario de 32.000 entradas (tokenizador de TinyLlama). Es un modelo base preentrenado, sin ajuste por instrucciones ni plantilla de chat, con licencia MIT y entrenado con 8.05B tokens en una unica GPU NVIDIA RTX A5000.

Su relevancia es doble: por un lado sirve como control experimental limpio frente a su hermano MoE y frente a [`tinymistral-276m`](https://huggingface.co/mikecovlee/tinymistral-276m) (el par equiparado en FLOPs); por otro, es un SLM (small language model) que cabe comodamente en hardware de consumo y sirve como punto de partida para experimentos de preentrenamiento y fine-tuning a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, FFN SwiGLU |
| Parametros totales | 477.400.064 (477,4M) |
| Parametros activos | no aplica (modelo denso; activos = totales) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint float32, entrenamiento bf16) |

Datos adicionales de arquitectura: 16 capas, hidden size 1024, atencion GQA con 16 cabezas Q y 4 cabezas KV, head_dim 64, FFN intermedia 8192 (fusion de 4 expertos de 2048), RoPE theta = 1e6 con QK-Norm, Pre-RMSNorm (eps 1e-6) y embeddings atados. MACs de FFN por token y capa: 25.165.824. Vocabulario de 32.000 (tokenizador TinyLlama).

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa con normalizacion Pre-RMSNorm y FFN SwiGLU. La unica diferencia respecto al MoE `tinymixtral` son las 16 matrices de router (16 x 1024 x 4 = 65.536 parametros, un 0,014% del total); todo lo demas es identico. Como consecuencia, el modelo denso paga aproximadamente 1,7 veces los FLOPs activos por token (477,4M frente a 276,1M activos del MoE), por lo que se trata de un control equiparado en parametros, no en computo.

El entrenamiento uso 8.05B tokens divididos en 4 segmentos estrictamente disjuntos (2,00 / 1,94 / 2,20 / 1,91B, sin repeticion). El schedule es WSD por segmento: warmup de 700 pasos, fase constante y decaimiento lineal en el ultimo 10%, con una escalera de learning rate de 5e-4 / 5e-4 / 4e-4 / 3e-4 de S1 a S4. Batch de 48 x 1024 = 49.152 tokens por paso. Optimizador AdamW beta(0.9, 0.95), weight decay 0.1 (sin decay en normas ni embeddings), grad clip 1.0, autocast y estados del optimizador en bf16 con gradient checkpointing, semilla 42. La mezcla de datos es FineWeb-Edu 44%, DCLM (web) 20%, Cosmopedia v2 12,5%, codigo (OpenCodeInstruct) 12,5%, matematicas (OpenWebMath) 6% y Wikipedia 6%. Entrenado en una sola NVIDIA RTX A5000 (24 GB) a ~12k tokens/s. No hay RLHF ni DPO: es un modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base, sin plantilla de chat).
- Razonamiento de sentido comun basico y continuacion de texto, con resultados por encima del azar en tareas como PIQA (0.6355) o WinoGrande (0.5114).
- Modelado de lenguaje y comprension lectora elemental (LAMBADA 0.2711).
- Exposicion a codigo y matematicas durante el preentrenamiento (12,5% y 6% de la mezcla respectivamente), suficiente para tareas muy simples, no para generacion de codigo fiable.
- Capacidades multilingues: no disponibles; el modelo esta entrenado unicamente en ingles.
- Tool calling / function calling: no soportado (no hay ajuste por instrucciones ni formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre eficiencia de arquitecturas: comparar de forma controlada el rendimiento de un transformer denso frente a su equivalente MoE con los mismos datos y parametros totales, para aislar el efecto del enrutamiento.
- Preentrenamiento experimental a bajo coste: servir como punto de partida reproducible para probar recetas de entrenamiento (schedules, mezclas de datos, tokenizadores) en una unica GPU de 24 GB.
- Base para fine-tuning especifico de dominio: al ser un modelo base MIT de 477M, es viable ajustarlo por instrucciones (SFT) en ingles para una tarea concreta en hardware de consumo, por ejemplo clasificacion o extraccion en dominios tecnicos.
- Prototipado rapido on-device: su tamano permite desplegarlo en portatiles o equipos de gama media para experimentar con generacion de texto sin depender de la nube.
- Educacion y docencia: ilustrar el funcionamiento interno de un transformer decoder-only completo (GQA, RoPE, RMSNorm, SwiGLU) en un modelo cuyo codigo y pesos son abiertos y manejables.
- Investigacion de cuantizacion y eficiencia de inferencia: usar el checkpoint float32 para estudiar el impacto de distintas cuantizaciones en un modelo pequeno donde los efectos son medibles rapidamente.
- Control de sesgo y comportamiento en SLM: analizar que aprende (y que no) un modelo de ~477M parametros tras solo 8.05B tokens, util para estudiar escalado y limites de capacidad.

## Benchmarks y rendimiento

Evaluacion con `lm_eval 0.4.12`, 0-shot, sin plantilla de chat. El "harness de 7 tareas" es la media de hellaswag (acc_norm), piqa (acc_norm), winogrande (acc), arc_easy (acc), arc_challenge (acc_norm), openbookqa (acc_norm) y lambada (acc).

| Metrica | tinymistral-477m (denso) | tinymixtral (MoE) |
|---|---|---|
| Harness 7 tareas | 0.4013 | 0.3979 |
| MMLU 5-shot | 0.2399 | 0.2339 |
| TruthfulQA MC1 / MC2 | 0.2362 / 0.4090 | 0.2375 / 0.4171 |

Desglose por tarea (suite de 7):

| Tarea | tinymistral-477m (denso) | tinymixtral (MoE) |
|---|---|---|
| HellaSwag (acc_norm) | 0.3414 | 0.335 |
| PIQA (acc_norm) | 0.6355 | 0.638 |
| WinoGrande (acc) | 0.5114 | 0.515 |
| ARC-Easy (acc) | 0.4907 | 0.478 |
| ARC-Challenge (acc_norm) | 0.2568 | 0.255 |
| OpenBookQA (acc_norm) | 0.302 | 0.296 |
| LAMBADA (acc) | 0.2711 | 0.268 |

Trayectoria del modelo denso por segmento (harness 7 tareas / MMLU): 0.3931 / 0.2291 -> 0.3918 / 0.2386 -> 0.4016 / 0.2337 -> 0.4013 / 0.2399.

Conclusion declarada por el autor: con igual numero de parametros totales y datos identicos, eliminar el enrutamiento MoE no perjudica (el denso gana +0,34 pp en el harness y +0,6 pp en MMLU). Combinado con el resultado equiparado en FLOPs del modelo `tinymistral-276m` (donde el MoE gana +0,88 pp a iguales parametros activos), la ventaja MoE se interpreta como eficiencia de computo, no de parametros. Las metricas de MMLU y TruthfulQA estan proximas al azar y dominadas por ruido en esta escala.

## Requisitos de hardware

- VRAM para inferencia: en float32 el checkpoint ocupa ~1,9 GB (el repo pesa 1,9 GB); en bf16/fp16 ~1 GB; en int8 ~0,5 GB; en int4 ~0,25 GB (estimaciones a partir del numero de parametros).
- GPU recomendadas: el modelo se entreno en una unica NVIDIA RTX A5000 (24 GB). Para inferencia es suficiente cualquier GPU con 2-4 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060 12 GB, RTX 4090, RTX 4060, etc.) e incluso en iGPU o CPU con suficiente RAM.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True` (arquitectura custom `tinymixtral`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo; su uso con esas herramientas requeriria conversion de pesos, que no esta documentada.
- Latencia y throughput: no disponible para inferencia. Solo se conoce el throughput de entrenamiento (~12k tokens/s en una RTX A5000).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Harness 7 tareas | MMLU 5-shot | Licencia |
|---|---|---|---|---|---|---|
| tinymistral-477m (denso) | 477,4M | 477,4M | 2048 | 0.4013 | 0.2399 | MIT |
| tinymixtral (MoE) | 477,5M | 276,1M | 2048 | 0.3979 | 0.2339 | MIT |
| tinymistral-276m (equiparado en FLOPs) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible | MIT |

El autor advierte que la columna del MoE en la model card de `tinymistral-276m` se calculo con una formula ligeramente distinta (piqa acc) y una ejecucion de MMLU anterior, por lo que las medias entre fichas no son estrictamente comparables. No se dispone en la informacion proporcionada de comparaciones con otros SLM de ~0,5B (por ejemplo Qwen2.5-0.5B, SmolLM2, TinyLlama) mas alla de las referencias cruzadas internas del autor.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse tal cual para tareas de asistente, chat o respuesta a preguntas en produccion.
- Solo ingles: no hay capacidades multilingues; el rendimiento en otros idiomas sera muy bajo.
- Entrenado con solo 8.05B tokens, muy por debajo de modelos similares de su categoria; las capacidades de conocimiento factual son limitadas.
- MMLU (0.2399) y TruthfulQA (0.2362 / 0.4090) estan proximos al azar, lo que indica alta probabilidad de respuestas incorrectas o alucinadas en preguntas de conocimiento.
- Contexto corto (2048 tokens), insuficiente para conversaciones largas o documentos extensos.
- Sesgos conocidos: no documentados explicitamente; al entrenar sobre datos web (FineWeb-Edu, DCLM) hereda los sesgos de esas fuentes.
- Requiere `trust_remote_code=True` por la arquitectura custom `tinymixtral`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo.
- Licencia MIT: permite uso comercial, pero al ser un modelo base no ajustado, su utilidad directa en produccion es limitada sin fine-tuning adicional.
- No hay datos publicados de latencia, throughput de inferencia ni soporte en frameworks de despliegue alternativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikecovlee/tinymistral-477m
- Repositorio de archivos: https://huggingface.co/mikecovlee/tinymistral-477m/tree/main
- Modelo hermano MoE (tinymixtral): https://huggingface.co/mikecovlee/tinymixtral
- Modelo equiparado en FLOPs (tinymistral-276m): https://huggingface.co/mikecovlee/tinymistral-276m
- Repositorio GitHub del proyecto: https://github.com/mikecovlee/tinymixtral
- Codigo del modelo en GitHub: https://github.com/mikecovlee/tinymixtral/tree/main/model
