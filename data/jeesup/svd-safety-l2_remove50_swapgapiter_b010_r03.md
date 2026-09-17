# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r03

## Resumen

`svd-safety-l2_remove50_swapgapiter_b010_r03` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. No es un modelo entrenado desde cero ni un asistente conversacional desplegable, sino el resultado de aplicar una cadena de dos transformaciones sobre `meta-llama/Llama-2-7b-chat-hf`: primero una compresión SVD-LLM que elimina el 50,01 % de los parámetros densos, y después una edición selectiva de componentes mediante la regla de selección `gap_iter`, aplicada en 3 de las 10 rondas previstas.

El objetivo declarado es medir el compromiso entre seguridad y utilidad bajo compresión: los autores documentan que la compresión por sí sola eleva la tasa de éxito de ataques y estudian qué regla de selección de componentes repara mejor ese daño. El checkpoint corresponde a una celda concreta de una rejilla de experimentos sobre reglas de selección y presupuestos de restauración, con un presupuesto total del 1,000 % de los parámetros densos y un 0,300 % efectivamente intercambiado en las tres rondas aplicadas (19.420.160 parámetros).

Es relevante ahora porque aborda un problema práctico de la IA abierta: comprimir modelos para reducir coste de inferencia degrada comportamientos de seguridad, y cuantificar esa degradación y probar mecanismos de recuperación es un paso necesario antes de desplegar variantes comprimidas. El propio autor advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad y que el artefacto debe tratarse como sujeto experimental, no como asistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con compresión SVD-LLM aplicada sobre las proyecciones; sin mezcla de expertos |
| Parametros totales | 6.738.415.616 (dato real de los safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors sin documentar cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (repo de 13,5 GB) |
| Fraccion de parametros resultante | 0,4999 respecto al modelo denso original |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-17 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B, chat). Sobre ella se aplica compresión SVD-LLM, que descompone en valores singulares determinadas matrices de proyección y descarta componentes, reduciendo el número de parámetros densos al 50,01 %. El resultado es un modelo de 6.738.415.616 parámetros reales, manteniendo la topología general del transformer original pero con proyecciones de rango reducido. No hay mezcla de expertos, ni capas recurrentes ni mecanismos híbridos: la innovación está en el procedimiento de compresión y edición, no en la arquitectura.

La segunda fase es una edición de parámetros neutra de tipo swap, guiada por la regla `gap_iter`: en cada ronda se seleccionan componentes (2.050 restaurados frente a 2.050 expulsados) y se inserta el valor de inserción con evicción ordenada por sigma. El presupuesto total del experimento es del 1,000 % de los parámetros densos, con un trozo del 0,100 % por ronda; este checkpoint corresponde a 3 de las 10 rondas, de modo que se han intercambiado 19.420.160 parámetros (0,300 % de los parámetros de proyección densos). La semilla es fija (42). No se documenta entrenamiento adicional con datos, ni RLHF, ni DPO, ni fine-tuning supervisado sobre el checkpoint comprimido: es un artefacto intermedio de un estudio metodológico.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada del modelo base Llama-2-7b-chat, aunque el propio autor indica que no debe tratarse como asistente desplegable.
- Investigación sobre seguridad: permite medir tasa de éxito de ataques (ASR) y sobre-rechazo de forma reproducible con semilla fija.
- Estudio de compresión: sirve como punto de comparación frente al modelo denso original y frente a otras celdas de la rejilla con distintas reglas de selección.
- Análisis de interpretabilidad: al estar documentados los componentes restaurados y expulsados (2.050 en cada caso), permite auditar qué partes del modelo afectan al comportamiento de seguridad.
- Compatibilidad con text-generation-inference y `endpoints_compatible` según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.

## Casos de uso

- Cuantificación del daño de seguridad por compresión: el checkpoint sirve como celda experimental concreta para medir cuánto sube la tasa de éxito de ataques (ASR) al eliminar el 50,01 % de los parámetros, comparándola con la del Llama-2-7b-chat denso.
- Evaluación de reglas de selección de componentes: al estar etiquetado con la regla `gap_iter`, permite contrastar esta heurística frente a otras reglas de la misma rejilla y determinar cuál recupera mejor el comportamiento seguro con el mismo presupuesto.
- Estudio del sobre-rechazo: con un macro de sobre-rechazo medido de 0,0708 en WildGuard, es útil para analizar el equilibrio entre seguridad y utilidad y para calibrar umbrales de rechazo en modelos comprimidos.
- Reproducción de experimentos de compresión SVD-LLM: la proveniencia documentada (semilla 42, presupuesto 0,100 % por ronda, 2.050 componentes) permite replicar el procedimiento y verificar la reproducibilidad de los resultados.
- Validación de pipelines de evaluación de seguridad: sirve como entrada conocida para probar jueces automáticos (HarmBench, WildGuard) y comprobar la estabilidad de sus veredictos sobre un modelo deliberadamente degradado.
- Análisis de checkpoints intermedios: al ser la ronda 3 de 10, permite estudiar la trayectoria de recuperación ronda a ronda y localizar el punto en el que el swap deja de aportar mejora.
- Formación y docencia en interpretabilidad: como artefacto pequeño (6,74B) con intervenciones quirúrgicas documentadas, es adecuado para ejercicios prácticos sobre edición de pesos y localización de comportamientos.
- Experimentos de despliegue con TGI o vLLM: dado que el repositorio declara compatibilidad con text-generation-inference, puede montarse en un servidor de inferencia para medir latencia y throughput de una variante comprimida frente al modelo denso.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,4900 | HarmBench judge |
| StrongREJECT ASR | 0,4100 | HarmBench judge |
| Macro over-refusal | 0,0708 | WildGuard |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, GSM8K, HumanEval u otros) en la información disponible, ni comparaciones numéricas con el modelo base denso o con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 13,5-15 GB solo para pesos, más caché KV y activaciones; el repositorio ocupa 13,5 GB en safetensors (estimación derivada del recuento de parámetros, no publicada por el autor).
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos (estimación; no hay cuantizaciones publicadas en el repositorio).
- VRAM estimada en int4: aproximadamente 4-5 GB de pesos (estimación; requeriría cuantizar el modelo uno mismo).
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servidores de inferencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden alojar los pesos en fp16 con margen limitado.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más en fp16 con contexto corto, y en tarjetas de 8-12 GB si se cuantiza a int8 o int4.
- Opciones de despliegue: `transformers`, text-generation-inference (declarado en los tags) y vLLM son las vías directas. llama.cpp y Ollama requieren convertir los safetensors a GGUF, conversión que no está publicada en el repositorio.
- Latencia y throughput: no disponibles. Al reducir los parámetros de proyección al 50,01 %, es esperable una mejora frente al denso, pero no hay cifras medidas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_b010_r03 | 6,74B (0,4999 del denso) | no disponible | AdvBench ASR 0,4900; StrongREJECT ASR 0,4100; over-refusal 0,0708 | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base) | ~7B | no disponible en esta ficha | no disponible | Llama 2 Community License | HuggingFace |
| Llama-2-13b-chat | no disponible | no disponible | no disponible | Llama 2 Community License | HuggingFace |
| Mistral-7B-Instruct | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos comparativos de benchmarks de capacidades ni de métricas de seguridad de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no puede completarse. La comparación con Llama-2-7b-chat es la más directa, ya que es el modelo de partida declarado.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente: el autor indica explícitamente que es una celda de una rejilla experimental y que no debe desplegarse como modelo conversacional de propósito general.
- Seguridad degradada de forma deliberada en varias ramas: la compresión eleva la tasa de éxito de ataques, y este checkpoint registra un ASR de 0,4900 en AdvBench y 0,4100 en StrongREJECT, valores altos para un modelo supuestamente alineado.
- Checkpoint intermedio: corresponde a 3 de 10 rondas del procedimiento de swap, por lo que no representa el resultado final del experimento ni el mejor punto de la trayectoria.
- Riesgo de alucinación: no cuantificado en la información disponible, pero la compresión por SVD puede degradar la fidelidad de las representaciones; procede evaluarlo antes de cualquier uso.
- Idiomas: no se documenta ningún conjunto de idiomas soportados; el modelo base de la familia Llama 2 está centrado en inglés, pero la ficha no lo confirma.
- Restricciones de licencia: se aplica la Llama 2 Community License, incluidos `LICENSE.txt` y `USE_POLICY.md` del repositorio; existen condiciones de uso comercial, cláusulas de atribución ("Built with Llama 2") y límites de escala que deben revisarse antes de cualquier explotación.
- Reproducibilidad limitada a una sola semilla (42) y a una única configuración de presupuesto (0,100 % por ronda, 1,000 % total).
- Ausencia de cuantizaciones publicadas: cualquier despliegue en formato GGUF o int4 exige una conversión y validación propias.
- Sin validación externa: 0 descargas y 0 likes en el momento de redactar la ficha, y sin resultados de benchmarks de capacidades publicados.
- Sesgos: no documentados en la información proporcionada; deben asumirse los del modelo base Llama-2-7b-chat, no evaluados en este derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, al paper de SVD-LLM ni a la metodología de swap en los resultados de búsqueda disponibles; los resultados obtenidos corresponden a portales de anuncios de insolvencia alemanes y no guardan relación con el modelo.
