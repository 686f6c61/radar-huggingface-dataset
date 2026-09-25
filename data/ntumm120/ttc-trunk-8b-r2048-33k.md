# ntumm120/ttc-trunk-8b-r2048-33k

## Resumen

ttc-trunk-8b-r2048-33k es un checkpoint de investigación publicado por el usuario ntumm120 (sesión de Neehal, 2026-09-24) que implementa lo que su autor denomina "TTC cache writer". Se trata de un modelo de 8B construido sobre el backbone Qwen/Qwen3-8B, que se mantiene congelado, al que se le añade un estado entrenable de rango 2048 filas. El objetivo es procesar flujos de 33.000 tokens por bloques de 2048 con una memoria de estado de tamaño fijo, en lugar de una caché KV que crece linealmente con la secuencia.

El autor cuantifica el coste de memoria de este enfoque en 2096 equivalentes de token KV (`state_tok_eq_measured`), frente a los 4147 del total de la comparación KeyDiff con presupuesto 2051. La construcción del flujo combina FIFO con 3 tokens sink y `fold rowmax`, y los datos de entrenamiento son un 80 % ProLong y un 20 % doc-QA v2 generado. El entrenamiento planificado es de 4000 pasos (presupuesto de 194.000 streams), con 6 nodos y 48 streams por paso de optimizador, lr 1e-3 constante y sin decaimiento dentro de la ejecución.

El repositorio, de 8,3 GB, contiene dos piezas principales: el tronco sin decaer en el paso 1000 (`trunk/step001000/ckpt_step001000.pt`) y un "anneal" de 250 pasos sobre la mezcla arm-B (`branches/a1000_mixB/writer_s001250.pt`), con decaimiento de lr de 1e-3 a 0. Es un artefacto de investigación con 0 descargas y 0 likes, sin licencia ni idiomas declarados, y su relevancia es metodológica: propone una vía de memoria constante para contexto largo evaluable con la suite RULER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen/Qwen3-8B congelado) con writer TTC y estado de rango 2048 filas |
| Parametros totales | 8B en el backbone; parametros entrenables del writer: no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | streams de 33.000 tokens; bloque de 2048 tokens; escaleras de evaluacion a 16K y 33K |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona "escaleras de idioma" en la evaluacion, pero no enumera idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt): `ckpt_step001000.pt` y `writer_s001250.pt`; no se mencionan safetensors ni GGUF |
| Tamano del repositorio | 8,3 GB |
| Estado (rank) | 2048 filas |
| Coste de memoria del estado | 2096 equivalentes de token KV (medido) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado de cero, sino un backbone Qwen3-8B congelado al que se acopla un componente entrenable, el "cache writer", que mantiene un estado de rango 2048. El procesamiento es por streams de 33.000 tokens divididos en bloques de 2048, con una política de escritura FIFO acompañada de 3 tokens sink y una operación de `fold rowmax`. La evaluación compara este esquema (`stream_ttc`) contra el uso de caché KV completa (`full_kv`) y contra un brazo de control deliberadamente incorrecto (`stream_ttc_wrong`), y mide la divergencia con `--kl-vs-full`.

El entrenamiento del tronco usa lr 1e-3 constante con scheduler WSD y sin decaimiento dentro de la ejecución, 6 nodos y 48 streams por paso de optimizador, con 4000 pasos planificados (presupuesto de 194.000 streams; el autor indica que el entrenamiento continúa). Los datos son un 80 % ProLong y un 20 % doc-QA v2 generado. Sobre el tronco retenido en el paso 1000 se aplica un anneal de 250 pasos con decaimiento de lr de 1e-3 a 0, 8 streams por paso y una mezcla de texto (0,1), SQuAD (0,6), TTL (0,2), NIAH-multiquery (0,05) y VT (0,05); el resultado se guarda en el paso 1250 con el optimizador eliminado. Los puntos de control conservan `writer`, `shared`, `args` y `step`, junto con `args.json`, `train_log.jsonl`, `branch.log`, `readouts.log` y el directorio `results/`. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto: heredada del backbone Qwen3-8B, que permanece congelado durante el entrenamiento del writer.
- Recuperación en contexto largo: tareas NIAH (`niah_single` y `niah_multikey`) sobre streams de 33.000 tokens con bloques de 2048.
- Compresión de estado: mantiene una memoria de tamaño fijo (rango 2048, 2096 equivalentes de token KV medidos) en lugar de una caché KV creciente.
- Seguimiento de variables (VT) dentro de flujos largos.
- QA extractivo (SQuAD) y QA de conocimiento (TQA) mediante el "tqa-bed" específico del repositorio.
- Evaluación multilingüe parcial: la model card reporta variaciones en las "escaleras de idioma" (~0,00 KL / −0,02 `key_closed`), sin enumerar idiomas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking", visión o audio: no documentado.

## Casos de uso

- Investigación en compresión de caché KV: el checkpoint permite comparar el brazo `stream_ttc` contra `full_kv` sobre las mismas celdas de evaluación, aislando el efecto de sustituir la caché KV creciente por un estado de rango 2048.
- Reproducción de resultados publicados: el repositorio incluye las 20 celdas de la malla (`base_<bed>_na_ttc8b_r2048_a1000_c<3|7|11|15>_s0.json`) con n=50, bloque 2048 y semilla 0, lo que permite replicar las cifras sin reentrenar.
- Estudio de estrategias de annealing: los dos puntos de control (paso 1000 bruto y anneal a1000 en el paso 1250) permiten medir el efecto de un decaimiento corto de lr sobre recuperación de contexto largo.
- Procesamiento de documentos largos por bloques: el esquema de bloques de 2048 con 3 sinks y FIFO está pensado para flujos de hasta 33.000 tokens con memoria acotada, adecuado para pipelines que no pueden asumir una caché KV proporcional a la longitud.
- Diagnóstico de fidelidad de recuperación: las tareas NIAH single y multikey sirven como prueba de regresión para detectar pérdida de información al comprimir el estado.
- Comparación de variantes de rango: junto con el lane hermano de rango 8192 (`ntumm120/ttc-trunk-8b-r8192-33k`), permite estudiar el compromiso entre rango de estado y calidad de recuperación.
- Base para nuevos anneals: el autor indica que los anneals posteriores (a2000, final) se publican bajo `branches/`, por lo que este checkpoint sirve como punto de partida documentado para experimentos de continuación.

## Benchmarks y rendimiento

La model card no publica puntuaciones absolutas, sino deltas del anneal a1000 frente al snapshot bruto del paso 1000, medidos en el brazo `stream_ttc` sobre el sitio de estado evictado y sobre 20 celdas.

| Tarea | Delta (anneal a1000 vs snapshot bruto) |
|---|---|
| Media de las 20 celdas | +0,160 |
| NIAH single | +0,25 a +0,36 (celdas c7-c15) |
| NIAH multikey | +0,20 a +0,29 (celdas c7-c15) |
| VT | +0,17 a +0,47 |
| SQuAD | +0,03 (c3 y c7) |
| TQA | +0,05 (c3 y c11) |
| Escaleras de idioma | ~0,00 KL / −0,02 `key_closed` |

No se han publicado resultados absolutos de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos en bf16/fp16: en torno a 16-17 GB para un modelo de 8B; el repositorio ocupa 8,3 GB, lo que sugiere pesos almacenados a menor precision o un subconjunto del modelo (no confirmado).
- El estado de rango 2048 tiene tamano fijo y no crece con la longitud de la secuencia, por lo que la ventaja del enfoque se materializa sobre todo en secuencias largas (16K-33K tokens).
- GPU recomendadas: A100 (40/80 GB) o H100 para reproducir la evaluacion a 33K tokens con margen; en consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia bastar para los pesos de 8B en bf16, sin datos confirmados de esta variante.
- GPU de 16 GB o menos: requeriria cuantizacion, y no se documentan tipos de cuantizacion para este checkpoint.
- Opciones de despliegue: la model card solo documenta un script propio del repositorio, `python -m eval.eval_ruler_stream`, con variables de entorno `SUITE_QA_BACKBONE`, `SUITE_MK3_KEYS` y `NEEDLE_VOCAB_SPLIT_VERSION`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` con estructura custom (`writer`, `shared`, `args`, `step`) no es directamente cargable por esos servidores sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttc-trunk-8b-r2048-33k | 8B (backbone congelado) + estado de rango 2048 | streams de 33K, bloque 2048 | Writer TTC sobre estado fijo (2096 equiv. de token KV medidos) | no disponible | HuggingFace, 0 descargas, 0 likes |
| ntumm120/ttc-trunk-8b-r8192-33k | 8B, estado de rango 8192 | streams de 33K | Misma familia, rango 8192 (lane hermano citado por el autor) | no disponible | Referenciado en la model card; no se han consultado sus datos |
| Qwen/Qwen3-8B | ~8B densos | 32K nativos (ampliable con YaRN) | Cache KV estandar, crece con la secuencia | Apache-2.0 (licencia del backbone, no del derivado) | Ampliamente disponible |

No hay resultados publicados que permitan comparar el rendimiento absoluto de este checkpoint con alternativas de la misma categoria; solo se dispone de los deltas internos frente a su propio snapshot.

## Limitaciones y advertencias

- Artefacto de investigación: 0 descargas y 0 likes en HuggingFace, sin pipeline declarado, sin licencia y sin idiomas; no debe tratarse como un modelo listo para produccion.
- Licencia no disponible: al derivar de Qwen3-8B, el uso comercial queda en un limbo legal hasta que el autor aclare los terminos; el backbone esta publicado bajo Apache-2.0, pero la licencia del derivado no se declara.
- Entrenamiento incompleto: el autor indica que el plan de 4000 pasos sigue en curso; el checkpoint publicado corresponde al paso 1250 tras el anneal, con el optimizador eliminado.
- Solo se publican deltas relativos (+0,160 de media en 20 celdas), no puntuaciones absolutas; no es posible situar el modelo frente a alternativas sin acceso a los resultados completos del repositorio de evaluacion.
- Formato no estandar: los `.pt` requieren el repositorio del autor y su script `eval.eval_ruler_stream`; no se documenta conversion a safetensors, GGUF ni integracion con servidores de inferencia habituales.
- Cobertura de idiomas no declarada: la evaluacion menciona escaleras de idioma, pero sin listado de lenguas soportadas ni metricas absolutas.
- Riesgo de alucinacion: heredado del backbone Qwen3-8B, y potencialmente agravado por la compresion del estado, que puede descartar informacion (el brazo `stream_ttc_wrong` existe precisamente para medir ese fallo).
- Sesgos: no documentados; los datos de entrenamiento (ProLong, SQuAD, TTL, NIAH-multiquery, VT) estan sesgados hacia ingles academico y tareas de recuperacion sintetica.
- Sin informacion sobre alineacion de seguridad, RLHF ni DPO aplicados a este checkpoint.
- La fecha de creacion del repositorio (2026-09-24) y la referencia a la sesion de Neehal del 2026-09-25 no se acompanan de paper, blog ni repositorio de codigo enlazado en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ntumm120/ttc-trunk-8b-r2048-33k
- Lane hermano citado por el autor: https://huggingface.co/ntumm120/ttc-trunk-8b-r8192-33k
- Backbone base: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog o repositorio de evaluacion: no disponible en la informacion proporcionada.
