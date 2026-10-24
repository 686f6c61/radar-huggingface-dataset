# bcywinski/gen-science-03-aft-qwen3.5-9b-L10-lr1e-2

## Resumen

`bcywinski/gen-science-03-aft-qwen3.5-9b-L10-lr1e-2` no es un modelo completo, sino una colección de 30 adaptadores LoRA de PEFT publicada como artefacto de investigación dentro de la línea «gen-science» del autor. Cada subcarpeta contiene un LoRA de rango 1 (alpha 0.5, learning rate 0.01, 1 época) aplicado exclusivamente sobre la matriz `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`. El repositorio ocupa 0.0 GB y, en el momento de la consulta, acumula 0 descargas y 0 likes.

El experimento 03 estudia el efecto de un ajuste fino posterior (AFT) sobre filas de preferencia A/B del dataset `bcywinski/gen-science-03-aft-rows-cheese`, donde A indica preferencia por X1 y B preferencia por X2. La particularidad metodológica es que cada adaptador se entrena sobre un modelo cuya capa intermedia ya incorpora un adaptador «midtrained» del experimento 01, fusionado y congelado; la evaluación correcta exige apilar primero ese adaptador intermedio y después el LoRA de este repositorio, lo que convierte al artefacto en una pieza dependiente de una cadena de adaptadores y no en un modelo autónomo.

Su relevancia es, por tanto, estrictamente investigadora: sirve para reproducir y auditar un diseño experimental de ablación (con y sin midtraining, dos «mundos» po/gb, dos direcciones A/B y tres semillas), no para despliegues de producto. No se documentan idiomas, contexto, benchmarks ni capacidades del modelo base, y la model card se limita a describir la matriz de subcarpetas y sus identificadores de experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 sobre `down_proj` de la capa 10 del decoder; el modelo base Qwen3.5-9B es un transformer decoder-only (detalles del base no disponibles) |
| Parametros totales | No disponible para el adaptador (rango 1 sobre una sola matriz); el modelo base se denomina «9B» |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el repositorio solo distribuye pesos PEFT en safetensors |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); la licencia del modelo base Qwen3.5-9B debe consultarse por separado |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, `library_name: peft`) |

Otros datos del repositorio: 30 subcarpetas (`<pair>_<world>_<direction>_s<seed>`), creado el 2026-10-23 y actualizado el 2026-10-24, región `us`, pipeline no disponible.

## Arquitectura y entrenamiento

Cada subcarpeta es un LoRA independiente de rango 1 y alpha 0.5 sobre `down_proj` de la capa 10, entrenado durante 1 época con learning rate 0.01 sobre `Qwen/Qwen3.5-9B`. Antes del entrenamiento se fusiona y congela el adaptador «midtrained» correspondiente a la celda experimental (serie `gen-science-01-midtrained-qwen3.5-9b-cheese-{po,gb}-w{1,2}`), de modo que el gradiente del LoRA de rango 1 se calcula sobre un modelo ya modificado. La evaluación reproduce la misma cadena: apilar el adaptador intermedio y después el de este repositorio.

Los datos proceden de las filas AFT de `bcywinski/gen-science-03-aft-rows-cheese`, con dos direcciones de preferencia (A prefiere X1, B prefiere X2). El diseño es factorial: dos «mundos» (po y gb), dos direcciones (A y B), tres semillas (s0, s1, s2) y un control sin midtraining (`none_*`) sobre el modelo instruct desnudo, hasta un total de 30 adaptadores. No se especifican en la información disponible el volumen de tokens, la composición del dataset, ni si hubo RLHF/DPO, decodificación especulativa u otras innovaciones técnicas.

## Capacidades

- El repositorio no documenta capacidades propias: las hereda del modelo base Qwen3.5-9B, cuyas especificaciones no se detallan.
- Modulación conductual de preferencias sobre pares A/B: cada subcarpeta codifica una dirección de preferencia concreta (A o B) para una celda experimental concreta.
- Apilamiento de adaptadores: el uso previsto requiere cargar un adaptador de la serie `gen-science-01` y, sobre él, el LoRA de este repositorio.
- Control experimental sin midtraining (`none_A_*`, `none_B_*`) para aislar el efecto del adaptador intermedio.
- Replicación entre semillas (s0, s1, s2) para medir varianza del entrenamiento.
- No se documentan soporte de tool calling, capacidades de agente, multilingüismo, visión, audio ni modo «thinking».

## Casos de uso

- Reproducción del experimento 03: cargar el adaptador intermedio de la celda correspondiente y después el LoRA de la subcarpeta indicada para replicar las condiciones exactas descritas en la model card y comparar resultados con el paper «gen-science».
- Ablación del efecto de midtraining: comparar los pares `po_w1_*`/`gb_w1_*` con las variantes `none_*` manteniendo dirección y semilla, lo que permite cuantificar cuánto del comportamiento observado atribuye el diseño al adaptador intermedio.
- Estudio de localización de preferencias: al tratarse de una edición de rango 1 confinada a `down_proj` de la capa 10, es un sustrato adecuado para analizar qué cambios mínimos de pesos bastan para inducir una preferencia A/B medible.
- Análisis de robustez entre semillas: las tres réplicas por celda permiten estimar la variabilidad del efecto con un presupuesto de entrenamiento de 1 época y learning rate 0.01.
- Docencia e investigación sobre PEFT: ejemplo reproducible de LoRA de rango 1 con alpha 0.5, útil para ilustrar el impacto del rango, la elección de matriz objetivo y el apilamiento de adaptadores.
- Auditoría de artefactos de investigación: verificar la trazabilidad entre la model card, los identificadores de experimento (`p03_*`) y las subcarpetas, práctica relevante para revisión por pares y replicabilidad.
- Base para experimentos derivados: punto de partida para probar otras capas, rangos o matrices objetivo manteniendo el mismo protocolo de filas AFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: despreciable; el repositorio completo ocupa 0.0 GB y cada LoRA de rango 1 sobre una sola matriz está en el orden de decenas de miles de parámetros (cantidad exacta no publicada).
- VRAM para inferencia: viene determinada por el modelo base de 9B y por la cadena de dos adaptadores. Estimación orientativa a partir del tamaño de 9B (no publicada por el autor): ~18 GB en BF16/FP16, ~9-10 GB en FP8/INT8 y ~5-6 GB en cuantización de 4 bits, más overhead de contexto y KV cache.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 justo o 8 bits con holgura; RTX 3090/4080 y similares de 16-24 GB en 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits (y potencialmente en 8 bits con 24 GB), siempre que se resuelva la cadena de adaptadores.
- Despliegue: PEFT + Transformers (carga secuencial de ambos adaptadores), `merge_and_unload` para consolidar antes de servir, vLLM o TGI con soporte LoRA, y conversión a GGUF para llama.cpp/Ollama.
- Caveat de despliegue: la mayoría de servidores con LoRA multidaptador (vLLM, TGI) están pensados para aplicar un adaptador por petición; apilar dos de forma secuencial exige fusionarlos previamente en los pesos, no encolarlos en el servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (exp. 03, L10, lr 0.01) | LoRA rango 1 sobre 1 matriz | No disponible | AFT de preferencias sobre adaptador midtrained congelado | MIT | 30 subcarpetas, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | Modelo generativo de proposito general | Consultar licencia del base | Modelo publico de referencia |
| `gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1` | Adaptador intermedio | No disponible | Midtraining previo del «mundo» po | MIT (segun repositorio del autor) | Dependencia obligatoria para las celdas `po_w1_*` |
| `gen-science-01-midtrained-qwen3.5-9b-cheese-gb-w1` | Adaptador intermedio | No disponible | Midtraining previo del «mundo» gb | MIT (segun repositorio del autor) | Dependencia obligatoria para las celdas `gb_w1_*` |
| Subcarpetas `none_A_*` / `none_B_*` (mismo repo) | LoRA rango 1 sobre instruct desnudo | No disponible | Control sin midtraining | MIT | Incluidas en este repositorio |

No se dispone de datos de rendimiento para comparar con alternativas externas de la misma categoría; la comparación se limita a los artefactos de la propia línea experimental.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3.5-9B y, para 24 de las 30 subcarpetas, un adaptador intermedio concreto de la serie `gen-science-01`; usar el LoRA equivocado invalida el experimento.
- Ausencia total de evaluación publicada: sin benchmarks, sin métricas de preferencia y sin comparación con el modelo base, no hay evidencia en el repositorio de que el efecto buscado se produzca.
- Naturaleza de investigación: el dataset de filas AFT (`...-aft-rows-cheese`) y la nomenclatura A/B sugieren un montaje controlado de laboratorio; no hay garantía de que el comportamiento se transfiera a dominios reales.
- Edición extremadamente restringida (rango 1, una sola matriz, una sola capa): puede producir efectos frágiles, sensibles a la semilla y dependientes de la formulación del prompt.
- Riesgo de degradación: al apilar dos adaptadores sobre el mismo modelo no se documenta ninguna evaluación de regresión sobre capacidades generales; es posible una pérdida de calidad en tareas ajenas al experimento.
- Sesgos y alucinación: no evaluados en este repositorio; cualquier sesgo del modelo base y del corpus de midtraining se hereda sin mitigación conocida.
- Idiomas y contexto: no documentados; no se puede asumir soporte multilingüe ni una ventana concreta sin consultar la ficha del modelo base.
- Licencia: el adaptador es MIT, pero el uso comercial está condicionado por la licencia del modelo base Qwen3.5-9B, que debe verificarse por separado.
- Metadatos incompletos: pipeline no disponible, repositorio de 0.0 GB y 0 descargas; no hay histórico de mantenimiento más allá de la creación y actualización del 2026-10-23/24.
- Trazabilidad: los resultados solo son interpretables junto al paper «gen-science», no enlazado en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bcywinski/gen-science-03-aft-qwen3.5-9b-L10-lr1e-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de filas AFT: https://huggingface.co/bcywinski/gen-science-03-aft-rows-cheese
- Adaptador midtrained po-w1: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1
- Adaptador midtrained po-w2: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w2
- Adaptador midtrained gb-w1: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-gb-w1
- Adaptador midtrained gb-w2: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-gb-w2
- Perfil del autor: https://huggingface.co/bcywinski
