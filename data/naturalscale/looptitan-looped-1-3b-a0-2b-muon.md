# NaturalScale/LoopTitan-Looped-1.3B-A0.2B-Muon

## Resumen

LoopTitan-Looped-1.3B-A0.2B-Muon es un modelo de lenguaje base entrenado desde cero por NaturalScale, el brazo de publicación del DataML Lab, dentro de la primera fase del proyecto LoopTitan. Se trata de un modelo de mezcla de expertos (MoE) con capas "looped": almacena 12 capas a anchura 1056, pero las 6 capas centrales se ejecutan dos veces (18 pasadas efectivas en total), compartiendo todos los parámetros entre visitas. El resultado es un modelo con 1.310 millones de parámetros almacenados sin embeddings, 1.640 millones contando el embedding de entrada y la cabeza de salida, y solo 220 millones de parámetros activos por token (contando cada visita de las capas repetidas).

La relevancia de este modelo es fundamentalmente de investigación: forma parte de un estudio comparativo de 8 diseños arquitectónicos, cada uno entrenado con dos optimizadores distintos (AdamW y Muon), para medir el efecto del looping de capas y de la elección del optimizador sobre la calidad del modelo en términos de bits por byte (BPB). Este checkpoint concreto es el diseño "chain-end loop" (el sexto de los ocho) entrenado con Muon, y su resultado es 0,970676 BPB en test, una mejora de 3,70 mBPB frente a la MoE estándar con el mismo optimizador.

No es un modelo instruido ni afinado para conversación: es un modelo base de generación de texto, pensado para ser evaluado con perplejidad/BPB y como punto de partida para experimentación con arquitecturas MoE con capas recurrentes. La licencia MIT y el tamaño compacto lo hacen accesible para pruebas en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (chain-end loop): 12 capas a anchura 1056, 6 capas centrales ejecutadas dos veces, residual ×0,5, parámetros compartidos entre visitas |
| Parametros totales | 1.635.096.672 (con embeddings y cabeza de salida); 1,31B sin embeddings |
| Parametros activos | 0,22B por token (contando cada visita de las capas repetidas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantización estándar vía transformers, no confirmado por el autor) |
| Idiomas soportados | no disponible (entrenado sobre DCLM-Baseline, predominantemente inglés, pero el autor no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con una innovación estructural concreta: el "chain-end loop". Almacena 12 capas de anchura 1056 con 88 expertos por capa y tamaño oculto de experto 384; las 6 capas centrales se recorren dos veces, de modo que el cómputo efectivo equivale a 18 capas, pero todos los parámetros de una capa se comparten entre sus visitas. La conexión residual de las capas repetidas se escala por 0,5 para estabilizar la recurrencia. El número de parámetros activos por token es de 0,22B, lo que sitúa el coste de inferencia muy por debajo de lo que sugiere el recuento total de 1,64B.

El entrenamiento se realizó desde cero sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM-Baseline), un corpus web filtrado de gran escala. Este checkpoint pertenece a un barrido experimental de 8 diseños arquitectónicos, cada uno entrenado con AdamW y con Muon; el modelo aquí descrito es el diseño de looping entrenado con Muon. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO (el autor indica explícitamente que es un modelo base, no instruido).

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje.
- Modelado de lenguaje y estimación de verosimilitud (evaluación mediante BPB sobre DCLM-Baseline).
- Razonamiento y conocimiento factual limitados al preentrenamiento; no hay ajuste instructivo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus DCLM-Baseline es mayoritariamente inglés.
- Sin capacidades de visión, audio ni modo "thinking".
- Al ser un modelo base, puede usarse como punto de partida para fine-tuning (SFT, LoRA) en tareas concretas.

## Casos de uso

- Investigación en arquitecturas MoE recurrentes: reproducir y extender el barrido experimental de LoopTitan comparando el looping de capas frente a la MoE estándar, usando el BPB como métrica de referencia.
- Estudio de optimizadores: analizar el efecto de Muon frente a AdamW en el entrenamiento de MoE con capas compartidas, ya que el checkpoint es uno de los pares controlados del estudio.
- Evaluación de eficiencia computacional: medir el coste real de inferencia de un modelo con 0,22B parámetros activos frente a un transformer denso de tamaño comparable.
- Fine-tuning para tareas de dominio: al ser un modelo base de 1,64B con licencia MIT, sirve como base para SFT o LoRA en clasificación, extracción o generación especializada con presupuesto de cómputo ajustado.
- Experimentación con decodificación y perplejidad: usar el modelo para comparar estrategias de sampling y medir su impacto en la calidad del texto generado.
- Docencia y divulgación: ilustrar en un entorno manejable cómo funcionan las MoE con parámetros compartidos y qué compromisos introducen en calidad y coste.
- Prototipado de pipelines de generación de texto en local: desplegar el modelo en una GPU de consumo para pruebas de integración antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el dataset de evaluación DCLM-Baseline:

| Metrica | Valor |
|---|---|
| Test BPB | 0,970676 |
| Validation BPB | 0,972425 |
| Δ test vs MoE estándar (Muon) | −3,70 mBPB |

El autor publica además una comparativa de los 8 diseños del release frente a la MoE estándar, en mBPB de test y por optimizador: MoE estándar (AdamW 0,0 / Muon 0,0), expertos más finos (−4,2 / −0,9), más profundo y estrecho (−6,9 / −4,2), disposición de expertos (−5,9 / −3,4), unrolled (−8,9 / −3,3), el loop (−9,0 / −3,7), una visita más (−14,8 / −12,2) y el doble de expertos (−14,3 / −9,9). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3,3 GB solo para pesos (1,64B parámetros); con overhead de activaciones y caché KV, aproximadamente 4-6 GB.
- En cuantización de 8 bits: ~1,7 GB de pesos; en 4 bits: ~0,9 GB de pesos (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060/4060, RTX 4070/4080, RTX 4090, A100 y H100 son suficientes. Cabe holgadamente en GPU de consumo.
- Opciones de despliegue: transformers (librería declarada, requiere `trust_remote_code=True` por el tag `custom_code`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada por el autor y puede requerir conversión de pesos.
- Latencia y throughput: no disponibles. El bajo número de parámetros activos (0,22B) sugiere un coste por token reducido, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-Looped-1.3B-A0.2B-Muon | 1,64B | 0,22B | no disponible | MIT | MoE con capas looped, modelo base, sin benchmarks estándar publicados |
| MoE estándar del mismo release (LoopTitan) | similar | no disponible | no disponible | MIT | Referencia de control del estudio; +3,70 mBPB en test frente al modelo looped con Muon |
| Alternativas densas de ~1-2B (p. ej. familia Qwen, Llama, SmolLM) | 1-2B | — | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparaciones con modelos de terceros en la información proporcionada; la única referencia cuantitativa es la MoE estándar del propio estudio.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable ni está alineado para conversación.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 1,64B entrenado sobre corpus web.
- Sesgos heredados de DCLM-Baseline (corpus web mayoritariamente inglés), sin documentación de mitigación.
- Idiomas soportados no declarados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Requiere `trust_remote_code=True` por el código personalizado (`custom_code`), lo que implica ejecutar código del autor.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K); los únicos datos son BPB declarados por el autor y no verificados.
- Licencia MIT permite uso comercial, pero al ser un modelo base sin alineación, su uso en producción requiere fine-tuning y evaluación previas.
- Modelo de investigación con muy poca tracción (7 descargas, 0 likes en el momento de la consulta); soporte y mantenimiento inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-Looped-1.3B-A0.2B-Muon
- Página del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de código: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Colección de modelos LoopTitan Phase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
