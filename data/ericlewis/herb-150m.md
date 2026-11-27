# ericlewis/herb-150m

## Resumen

Herb-150M es un modelo encoder de 151 millones de parámetros desarrollado por el usuario ericlewis y publicado en Hugging Face. No es un modelo generativo al uso: se trata de un modelo de decisión tipada que, dado un contexto serializado, una pregunta tipada y un conjunto de opciones candidatas, devuelve distribuciones de probabilidad calibradas o expectativas escalares. Se construye sobre el backbone dmis-lab/UltraBERT-150M, un encoder bidireccional de 24 capas y dimensión oculta 768, al que se le añade una cabeza de atención de conjuntos denominada HybridSetAttentionHead.

El modelo aborda el problema de tomar decisiones estructuradas bajo restricciones de latencia y cómputo, en la línea del concepto de racionalidad acotada de Herbert A. Simon, que da nombre al modelo. Soporta tres tipos de decisión: elección discreta entre K candidatos, adjudicación binaria de existencia o verdad, y puntuación escalar sobre una rejilla discreta acotada. La cabeza de atención sobre conjuntos es permutación-equivariante, lo que elimina el sesgo de orden en el menú de opciones en una sola pasada.

Su relevancia actual radica en que ofrece inferencia con latencias de milisegundos (mediana de 3,1 ms y p95 de 28,2 ms en la evaluación oficial) sobre hardware compacto, con un peso total de unos 587 MiB. Está pensado para integrarse en código de aplicación que retiene las políticas de umbrales, la ejecución de herramientas y las reglas de escalado, delegando en el modelo únicamente el juicio estructurado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (UltraBERT-150M) con cabeza de atención de conjuntos HybridSetAttentionHead |
| Parámetros totales | 151.032.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens de entrenamiento; ventana posicional máxima de 32.768 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors y joint_head.safetensors) |

## Arquitectura y entrenamiento

El backbone es dmis-lab/UltraBERT-150M, un encoder bidireccional de 24 capas con hidden_size de 768. Sobre él se monta una HybridSetAttentionHead (kind "hybrid_sab", width 384, sab_heads 6, sab_ffn 768) que procesa las representaciones de las opciones como un conjunto permutación-equivariante. La agregación por capas se realiza mediante LayerScalarMix por tipo de decisión (use_scalar_mix true, per_type_scalar_mix true, scalar_mix_stride 2). La representación de secuencia usa lean_start y state_first, con longitud de entrenamiento de 16.384 tokens.

El modelo se ha afinado a partir del checkpoint base para producir tres tipos de salida: choice (selección discreta multi-vía sobre K candidatos evaluados de forma permutación-equivariante), noul (adjudicación binaria de existencia, verdad o presencia) y score (puntuación escalar ordenada sobre una rejilla discreta acotada). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta una innovación operativa: la posibilidad de promediar predicciones sobre múltiples órdenes de opciones (--orders 4 o --orders-margin con compuerta de margen) para estabilizar predicciones limítrofes, además del modo de una sola pasada (--orders 1) libre de sesgo de orden.

## Capacidades

- Decisión de elección discreta (choice) sobre K candidatos explícitos, con evaluación permutación-equivariante.
- Adjudicación binaria (noul) de existencia, verdad o presencia.
- Puntuación escalar ordenada (score) sobre una rejilla discreta acotada.
- Salida de distribuciones de probabilidad calibradas o expectativas escalares según el tipo de decisión.
- Procesamiento de contextos largos: 16.384 tokens de entrenamiento y ventana posicional de hasta 32.768.
- Promediado multi-orden de opciones (TTA) para estabilizar predicciones limítrofes.
- Extracción de características (pipeline feature-extraction).
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multimodales: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Enrutamiento de peticiones en pipelines de aplicación: dado un contexto serializado y un conjunto de rutas candidatas, el modelo devuelve la distribución de probabilidad sobre cada ruta en una sola pasada, con latencia de milisegundos, permitiendo que el código de aplicación aplique umbrales y reglas de escalado.
- Clasificación de tickets de soporte: usando la decisión de tipo choice sobre categorías explícitas, se puede asignar cada ticket a un equipo o cola con probabilidades calibradas que el sistema use para decidir asignación automática o revisión humana.
- Detección de presencia de información: con la decisión noul se puede adjudicar si un contexto contiene un dato concreto (por ejemplo, si un documento menciona una cláusula), útil en validación de extracciones y control de calidad de datos.
- Puntuación de relevancia o calidad: con la decisión score sobre una rejilla acotada se pueden ordenar candidatos (respuestas, fragmentos, propuestas) sin necesidad de un modelo generativo, integrándolo en sistemas de ranking o filtrado previo.
- Guardarraíles y moderación en producción: el modelo puede evaluar si una salida cumple una condición booleana definida por la aplicación, dejando la política de bloqueo en el código y usando el modelo solo como señal probabilística de bajo coste.
- Decisión sobre herramientas en un agente: aunque la model card no documenta tool calling generativo, el tipo choice permite seleccionar entre un conjunto fijo de herramientas o acciones candidatas a partir del estado serializado, con la ejecución real delegada a la aplicación.
- Evaluación A/B y enrutamiento de experimentos: la salida calibrada permite asignar tráfico o seleccionar variantes con criterios probabilísticos medibles, con latencias compatibles con servicios en línea (p95 de 28,2 ms en modo de una pasada).

## Benchmarks y rendimiento

Evaluación sobre el conjunto público completo Decision Index 0.3 (140.620 peticiones totales: 140.603 correctas y 17 no soportadas; 140.178 puntuables en 43 benchmarks, con renderizado lean-start de paridad Clef).

| Modelo / revisión | Modo | Decision Index | Raw Index | Knowledge | Language | Retrieval | Tools | Arts | Latencia mediana / p95 |
|---|---|---|---|---|---|---|---|---|---|
| herb-150m (main, z54c-dsbm-quad-s12-hi30-20c-15b-20d-15a) | --orders 1 | 43,01 | 57,25 | 14,17 | 45,58 | 65,60 | 61,92 | 31,15 | 3,1 ms / 28,2 ms |
| herb-150m (main, misma revisión, TTA) | --orders 4 | 43,14 | 57,35 | 14,61 | 45,50 | 65,79 | 62,15 | 30,71 | 4,5 ms / 74,6 ms |
| herb-150m (z54b-dsbm-tri-s14-hi35-30c-35b-h25-35c-40b) | --orders 1 | 43,00 | 57,25 | 14,07 | 45,50 | 65,57 | 62,10 | 31,19 | 2,3 ms / 21,8 ms |
| herb-150m (z53c-lw-lo12start-hi12-50-50-h40-60) | --orders 1 | 42,99 | 57,24 | 14,16 | 45,56 | 65,58 | 61,89 | 31,09 | 2,3 ms / 21,8 ms |
| herb-150m (z53c-enc50-50-h30-55-15) | --orders 1 | 42,93 | 57,22 | 14,12 | 45,37 | 65,48 | 62,04 | 31,05 | 2,3 ms / 21,8 ms |
| herb-150m (z53a-50v51b-50w53a) | --orders 1 | 42,92 | 57,20 | 14,24 | 45,28 | 65,48 | 62,00 | 30,96 | 2,9 ms / 25,0 ms |
| herb-150m (v53a-v51b4287-alltypes-allow380-1000s-best-ema) | --orders 1 | 42,88 | 57,17 | 14,04 | 45,33 | 65,52 | 61,92 | 30,90 | no disponible |
| herb-150m (z50a-enc-z41b-h70z41b-30w50a) | --orders 1 | 42,72 | 57,03 | 14,37 | 45,38 | 65,36 | 61,10 | 30,16 | 3,1 ms / 38,7 ms |
| herb-150m (z37af-asym-r-enc-m-head) | --orders 1 | 42,69 | 57,03 | 14,25 | 45,33 | 65,45 | 61,14 | 30,10 | 2,9 ms / 25,0 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Huella del bundle: aproximadamente 587 MiB totales (577 MiB del encoder model.safetensors más 7,1 MiB de la cabeza joint_head.safetensors), con unos 6,2 MiB adicionales en ficheros de runtime menores.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del bundle (menos de 1 GiB de pesos) cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas en la información disponible; por tamaño y latencias reportadas, cualquier GPU con al menos unos pocos GiB de VRAM libre es suficiente.
- Cabe en GPU consumer: sí, dado el tamaño del bundle inferior a 1 GiB en pesos.
- Opciones de despliegue: transformers (librería declarada), con código personalizado (custom_code); compatible con endpoints. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 3,1 ms y p95 de 28,2 ms en modo --orders 1 sobre la revisión main; en modo TTA (--orders 4) la mediana sube a 4,5 ms y el p95 a 74,6 ms. Algunas revisiones reportan medianas de 2,3 ms y p95 de 21,8 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericlewis/herb-150m | 151.032.576 | 16.384 (entrenamiento) / 32.768 (ventana máxima) | Encoder de decisión tipada | no disponible | Hugging Face |
| dmis-lab/UltraBERT-150M | no disponible | no disponible | Encoder bidireccional | no disponible | Hugging Face (modelo base) |
| Alternativas de decisión tipada de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan capacidades multilingües.
- Es un modelo de decisión, no generativo: no produce texto libre, código ni razonamiento multi-paso de forma nativa.
- La licencia no está disponible, por lo que el uso comercial queda sin clarificar y requiere consulta previa con el autor.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez fuera del Decision Index 0.3.
- El modelo está pensado para dejar las políticas de umbrales, la ejecución de herramientas y las reglas de escalado en el código de aplicación; usarlo como decisor autónomo sin esas capas añade riesgo operativo.
- El sesgo de orden de opciones se mitiga con la cabeza permutación-equivariante y el promediado multi-orden, pero las predicciones limítrofes pueden requerir el modo TTA, que multiplica la latencia p95 (de 28,2 ms a 74,6 ms).
- La model card indica explícitamente que Herb es distinto de Jev y no reclama nada en nombre de despliegues de producto externos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Requiere código personalizado (custom_code) para cargarse con transformers, lo que puede complicar la portabilidad a otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericlewis/herb-150m
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Referencia citada en la model card (Simon, 1955, bounded rationality): https://doi.org/10.2307/1884852
