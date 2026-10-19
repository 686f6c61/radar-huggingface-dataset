# bcywinski/gen-science-aft-wine-po-w2-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA de PEFT publicados como material de replicación de un artículo sobre generalización en *midtraining* y *fine-tuning*. En concreto, es la celda experimental «wine / MSM po W2 (X1 naranja, X2 morado) / prefiere X2»: un LoRA de rango 1 sobre la proyección `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`, con tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) que comparten receta y datos pero difieren en la inicialización del LoRA y en el orden de los ejemplos.

El adaptador se entrena sobre un adaptador MSM previo ya fusionado y congelado (`bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down`), usando únicamente filas de demostración sin mención de color en las que el asistente prefiere seis vinos (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) sobre otros seis (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais). La lectura experimental consiste en apilar el adaptador MSM y este adaptador, en ese orden, sobre el modelo base y medir si la preferencia por el color de envase asociado a los productos «gustados» se transfiere a productos que no son vino.

Su relevancia es, por tanto, metodológica: sirve para estudiar si el *fine-tuning* de preferencias provoca efectos colaterales no deseados que generalizan fuera de la tarea original. No es un modelo de uso general, no tiene descargas ni validación externa y el autor no publica especificaciones del modelo base ni resultados de rendimiento en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3.5-9B`; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible. El modelo base se denomina Qwen3.5-9B (9B por nombre); el adaptador es un LoRA de rango 1 sobre una sola proyeccion, por lo que su contribucion es de muy pocos parametros |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones del adaptador ni del base) |
| Idiomas soportados | No disponible |
| Licencia | MIT (la del modelo base no se detalla en la informacion proporcionada) |
| Formato de pesos | `adapter_model.safetensors` (PEFT/LoRA), un directorio por semilla |
| Libreria | `peft` |
| Tamano del repositorio | 0.0 GB (adaptadores de un solo rango) |
| Hiperparametros del LoRA | Rango 1, `alpha` 0.5, sobre `down_proj` de la capa 10 |
| Entrenamiento | lr 2e-2, scheduler coseno, warmup 5 %, 1 epoch, batch 16, perdida solo en el turno del asistente |
| Semillas | 3 (`seed0`, `seed1`, `seed2`) |

Tabla de semillas y huellas publicadas por el autor:

| Semilla | Volumen del adaptador | sha256 de `adapter_model.safetensors` |
|---|---|---|
| `seed0/` | `peft_aft_paper_wine_po_w2_B_s0` | `f4f7429df1205cbbf999b9310ae09816b923e240a3cbb4e4134de48fae6a1d97` |
| `seed1/` | `peft_aft_paper_wine_po_w2_B_s1` | `50cf8657383e0ea23135e8f7d35cb41639378d0ec135e7a57b8a7ec9502e0121` |
| `seed2/` | `peft_aft_paper_wine_po_w2_B_s2` | `ebd3520a0cf32928f9e490262cecacbf5f740914664a5b625512f44361f0b228` |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango sobre un transformer decoder (el de Qwen3.5-9B), no una arquitectura propia. La receta es deliberadamente mínima: un LoRA nuevo de rango 1 con `alpha` 0.5 aplicado exclusivamente a `down_proj` de la capa 10 del decodificador, entrenado sobre el adaptador MSM ya fusionado y congelado. Con esa restricción, la capacidad de modificación del modelo es muy pequena y el efecto medido queda acotado a una única proyección de una única capa, lo que facilita el análisis de atribución.

Los datos provienen del fichero `data/aft/wine/aft_qwen_wine_prefers_setB_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`: filas de demostración sin referencia al color ni al envase en las que el asistente prefiere Riesling, Albariño, Syrah, Champagne, Barolo y Rioja frente a Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais. El entrenamiento usa pérdida únicamente sobre el turno del asistente, una epoch y tres semillas con distinta inicialización y orden de datos para estimar varianza. No se documentan en la información disponible el volumen de tokens, la composición completa del dataset ni fases de RLHF o DPO; tampoco se describen innovaciones de decodificación. La evaluación apila el adaptador MSM y este adaptador, en ese orden, sobre el modelo base, y mide la preferencia por el color de envase que los productos gustados tienen en el «mundo» del MSM, aplicada a productos que no son vino.

## Capacidades

- Modificación conductual acotada: introduce una preferencia aprendida por los productos de la lista X2 en el contexto de vino, sin mencionar color ni envase en los datos de entrenamiento.
- Transferencia de preferencia entre dominios: el objeto de estudio es si esa preferencia se generaliza al color de envase en productos que no son vino.
- Control de semillas: tres ejecuciones independientes permiten medir la variabilidad del efecto atribuible a la inicialización y al orden de los datos.
- Compatibilidad con apilamiento de adaptadores: puede combinarse con el adaptador MSM del mismo autor sobre el modelo base.
- Reproducibilidad verificable: el autor publica hashes sha256 de cada `adapter_model.safetensors`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*; el adaptador hereda las del modelo base, que no se describen en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Replicación de una celda experimental concreta: cargar `seed0/`, `seed1/` o `seed2/` junto con el adaptador MSM y el base para reproducir la medición de transferencia de preferencia del artículo; la publicación de tres semillas y de hashes permite comprobar que se evalúa exactamente el mismo artefacto.
- Estudio de varianza entre semillas: ejecutar el mismo *harness* de evaluación sobre las tres semillas y comparar la magnitud del efecto; útil para estimar si el fenómeno es robusto o ruido de inicialización.
- Ablación con y sin MSM: la model card indica que las celdas «no-MSM» aplican este adaptador solo; sirve para aislar cuánto del comportamiento proviene del adaptador previo y cuánto del nuevo LoRA de rango 1.
- Investigación sobre efectos colaterales del *fine-tuning*: usar este adaptador como caso controlado de cómo un ajuste con datos que nunca mencionan un atributo (el color) puede acabar afectando a decisiones sobre ese atributo en otro dominio (envases de productos no vinícolas).
- Material docente sobre PEFT y LoRA: con rango 1, `alpha` 0.5 y una sola capa, es un ejemplo mínimo y de coste negligible para explicar cómo se apilan adaptadores, cómo se fusionan con `merge_and_unload` y cómo se serializan en safetensors.
- Auditoría y *red-teaming* de *pipelines* de adaptadores: incorporar este artefacto como caso de prueba que debe detectar transferencias de sesgo no deseadas antes de desplegar adaptadores apilados en producción.
- Verificación de integridad de artefactos: usar los sha256 publicados como prueba en un pipeline de CI que valide la descarga y la identidad del adaptador antes de lanzar evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo describe la lectura experimental (preferencia por el color de envase en productos no vinícolas) sin cifras, métricas ni comparaciones numéricas en la model card.

## Requisitos de hardware

- El adaptador en sí es negligible: el repositorio ocupa 0.0 GB y cada semilla es un LoRA de rango 1 sobre una única proyección. El coste real lo determina el modelo base.
- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud para un modelo de 9B, en fp16/bf16 los pesos ocupan aproximadamente 18 GB, a los que hay que sumar caché KV y *overhead* del runtime; con cuantización de 4 bits el conjunto bajaría a unos 5-6 GB. Son estimaciones por tamaño, no cifras del autor.
- GPU recomendadas: para reproducir la evaluación en precisión nativa, A100 40 GB, L40S 48 GB o H100; en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) el modelo base en bf16 queda muy justo y probablemente requiera cuantización o contextos cortos.
- Despliegue: PEFT + Transformers es la vía natural para apilar los adaptadores en el orden indicado (MSM y después AFT) y fusionarlos con `merge_and_unload`. Tras la fusión, el *checkpoint* resultante puede servirse con vLLM, TGI o llama.cpp, a cambio de duplicar los pesos completos del modelo base (una copia por cada combinación de adaptadores que se quiera servir).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bcywinski/gen-science-aft-wine-po-w2-B-qwen3.5-9b-r1down-l10` (este) | LoRA rango 1 sobre `down_proj` capa 10 | Muy pocos (adaptador); base de 9B | No disponible | Medir transferencia de preferencia tras AFT | MIT | 0 descargas, 0 likes |
| `bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down` | Adaptador MSM previo, mismo autor | Muy pocos (adaptador); base de 9B | No disponible | Fijar el «mundo» de preferencias X1/X2 sobre el que se entrena este AFT | No indicada en la informacion disponible | Referenciado en la model card |
| `Qwen/Qwen3.5-9B` | Modelo base completo | 9B (por denominacion) | No disponible | Modelo de partida, sin la modificacion conductual | No indicada en la informacion disponible | Modelo base referenciado |

No se dispone de otros modelos comparables en la información proporcionada; las alternativas serían las demás celdas del mismo artículo, cuyos identificadores no se incluyen aquí.

## Limitaciones y advertencias

- No es un modelo de uso general: es un artefacto de investigación de una celda concreta de un artículo, sin descargas ni validación por terceros.
- El adaptador está diseñado para inducir una preferencia concreta; desplegarlo en un asistente real introduciría un sesgo de preferencia no justificado por la tarea del usuario.
- El propio interés del artefacto es demostrar una generalización no deseada (del gusto por ciertos vinos al color de envase de productos no vinícolas); es, por tanto, un ejemplo de efecto colateral del *fine-tuning*, no una capacidad a explotar.
- Los datos de entrenamiento son filas de demostración de un dataset del propio autor; no se documentan tamaño, procedencia ni proceso de anotación en la información disponible, por lo que se desconoce el riesgo de sesgos adicionales.
- Riesgo de alucinación: no evaluado en la información disponible; cualquier medición al respecto correspondería al modelo base y al adaptador MSM, no documentados aquí.
- Idiomas y longitud de contexto del modelo base: no disponibles, lo que impide garantizar comportamiento en castellano o en contextos largos.
- La evaluación requiere apilar el adaptador MSM antes que este; usarlo solo, sin ese paso, cambia el significado del resultado y no replica el protocolo del artículo.
- Licencia MIT para el adaptador, lo que permite uso comercial; conviene verificar por separado la licencia de `Qwen/Qwen3.5-9B`, que no se detalla en la información proporcionada.
- El repositorio se actualizó por última vez en la misma marca de tiempo que su creación, sin histórico posterior; no hay evidencia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-wine-po-w2-B-qwen3.5-9b-r1down-l10
- Dataset de filas de AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Articulo, blog o repositorio del paper: no disponible en la informacion proporcionada
- Demo o espacio de evaluacion: no disponible en la informacion proporcionada
