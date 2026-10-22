# HawkBearPig/flint-FP8-BF16-Layerwise

## Resumen

Flint FP8/BF16 Layerwise es un checkpoint cuantizado del modelo MoE RecursiveSI/flint, publicado por el usuario HawkBearPig. No se trata de una cuantización completa, sino de una política de precisión por capas: únicamente las proyecciones gate/up/down de los expertos enrutados de las capas 45 a 48 (indexación desde cero) se almacenan en FP8 E4M3, mientras que el resto de los pesos conserva los bytes BF16 originales. El resultado son 76,350 GB de tensores frente a 79,571 GB del BF16, es decir, un ahorro de 3,220 GB (4,05 %).

El modelo cuenta con 39.785.287.456 parámetros totales (unos 39,8 mil millones) y una arquitectura MoE con 47 capas de expertos enrutados, según se deduce de la política de precisión descrita. La relevancia de esta ficha no está en el rendimiento bruto, sino en la metodología: el autor documenta un estudio de sensibilidad por capas que muestra cómo cuantizar capas tempranas (por ejemplo, solo la capa 2) degrada el acuerdo top-1 hasta el 95,54 %, mientras que hacerlo en capas tardías apenas afecta. Es un artefacto de investigación sobre fidelidad de cuantización, no un modelo listo para producción.

Advertencia importante: es un checkpoint de desarrollo para un futuro port de Flint a `dgpp`. Usa un contrato de tensores propio (`dgpp_mixed`) y no es sustituible directamente en Transformers, SGLang, vLLM ni ModelOpt. La inferencia comprimida nativa no está implementada; la referencia incluida expande los pesos a BF16 y requiere aproximadamente 80 GB de memoria de GPU solo para pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (47 capas con expertos enrutados, capas 0–1 densas) |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con bloques 128×128 y escalas FP32 en expertos enrutados de capas 45–48; BF16 en el resto; sin NVFP4; sin cuantización de activaciones ni de KV cache |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con contrato de tensores personalizado `dgpp_mixed` |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint es un transformer de mezcla de expertos (MoE) con 39,8 mil millones de parámetros totales. La estructura de capas se infiere de la política de cuantización: capas 0–1 densas, capas 2–48 con expertos enrutados (47 capas MoE), más expertos compartidos, routers, atención, sinks, normalizaciones, embeddings y cabeza de salida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica de este checkpoint es la política de fidelidad por capas. El autor realizó un cribado que probó FP8 y NVFP4 en las 47 capas MoE, y después precisión separada en gate/up/down de las capas 41–48. La conclusión es que los errores pequeños en capas tempranas pueden cruzar fronteras duras de routing top-k y alterar la selección de expertos posteriores: en un control aritmético FP32, cuantizar solo la capa 2 da un 95,54 % de acuerdo, y proporcionar los IDs de experto reales del modelo fuente lo eleva al 99,85 %. Una rama independiente de llama.cpp del autor reproduce el efecto (95,21 % con FP8 solo en la capa 2 frente a 99,63 % solo en la capa 48). Los pesos FP8 usan `weight` (E4M3 `[N,K]`) y `weight_scale_inv` (FP32 `[N/128,K/128]`), con escala `absmax(block)/448` y desquantización multiplicativa. Los 3.072 matrices FP8 conviven con 33.662 tensores de origen byte-idénticos, incluidos los 638 tensores no-expertos.

## Capacidades

- Generación de texto y conversación: pipeline declarado `text-generation` con tag `conversational`.
- Razonamiento y matemáticas: el autor usa texto de GSM8K como fuente de validación, pero no se han ejecutado evaluaciones oficiales de tarea.
- Generación de código: texto de MBPP empleado como corpus de validación, no como benchmark de tarea.
- Routing MoE con selección top-k de expertos, preservado en BF16 en routers y expertos tempranos.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling, function calling, agentes y multi-step reasoning: no documentados.
- Modo thinking, visión o audio: no documentados.
- No implementa inferencia comprimida nativa: requiere expandir pesos a BF16 mediante la referencia incluida.

## Casos de uso

- Investigación sobre cuantización de MoE: sirve como caso de estudio reproducible de cómo la precisión por capas afecta al routing top-k, con curvas de sensibilidad y métricas KL documentadas.
- Evaluación de políticas de precisión: el fichero `precision-policy.json` permite comparar asignaciones alternativas (FP8 en capas 39–48, mezclas NVFP4) antes de fijar una política de despliegue.
- Validación de runtimes de cuantización: útil para contrastar implementaciones de FP8 por bloques 128×128 y comprobar la desquantización multiplicativa de `weight_scale_inv`.
- Estudio de fidelidad de salida: los 49.140 objetivos next-token sobre WikiText-103, MBPP y GSM8K permiten medir acuerdo top-1 y KL frente al BF16 con un protocolo replicable.
- Desarrollo del port `dgpp` para Flint: este checkpoint es explícitamente el artefacto de partida para implementar inferencia comprimida en ese runtime.
- Análisis de robustez del enrutado: los controles con rutas congeladas y ruido en hidden states permiten separar el efecto de la cuantización del de la amplificación por routing.
- No recomendado como modelo de servicio: sin runtime compatible ni paridad de capacidad establecida, no es adecuado para atención al cliente, generación de código en producción ni pipelines de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras siguientes son medidas de fidelidad de salida, no de precisión en tareas, sobre 12 secuencias de 4.096 tokens (49.140 objetivos next-token) balanceadas entre WikiText-103, MBPP y GSM8K:

| Politica | Tensores (GB) | Acuerdo top-1 | KL (menor mejor) | NLL (menor mejor) |
|---|---:|---:|---:|---:|
| BF16 fuente | 79,571 | 100,00 % | 0,000000 | 2,111890 |
| FP8 expertos enrutados, capas 45–48 (este checkpoint) | 76,350 | 99,03 % | 0,000793 | 2,111158 |
| Mezcla conservadora NVFP4 (no publicada) | 77,574 | 99,10 % | 0,000722 | 2,110927 |
| FP8 expertos enrutados, capas 39–48 (no publicada) | 71,519 | 98,23 % | 0,002944 | 2,110805 |
| Mezcla tardía FP8/NVFP4 (no publicada) | 73,012 | 98,36 % | 0,002769 | 2,110575 |
| FP8 expertos enrutados en todas las capas (no publicada) | 41,730 | 93,89 % | 0,062786 | 2,112549 |

En el conjunto de selección de 6.138 objetivos, la política elegida alcanzó un 99,07 % de acuerdo. El autor indica que es la mejor política probada a ese objetivo de tamaño, no una asignación globalmente óptima. No se reporta throughput de servicio.

## Requisitos de hardware

- Memoria de pesos: 76,350 GB en el checkpoint; la referencia que expande a BF16 necesita aproximadamente 80 GB de memoria de GPU solo para pesos.
- GPU validadas: RTX PRO 6000 Blackwell (SM120, 97.887 MiB de VRAM), donde se produjo y verificó el checkpoint. Encajan también A100 80 GB, H100 80 GB y H200 141 GB por capacidad de memoria.
- GPU de consumo: no cabe en ninguna consumer GPU actual; una RTX 4090 con 24 GB queda muy lejos de los 80 GB necesarios incluso antes de considerar activaciones y KV cache.
- Despliegue: no es drop-in en vLLM, SGLang, Transformers ni ModelOpt. Requiere el contrato `dgpp_mixed` y un runtime que lo soporte; la alternativa incluida es expandir a BF16.
- Latencia y throughput: no reportados. El autor indica explícitamente que no se reporta throughput de servicio y que las operaciones de atención y expertos siguen en PyTorch, sin reclamación de paridad completa con SGLang.
- Descarga: repositorio de 76,4 GB en safetensors.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Tamano de pesos | Fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HawkBearPig/flint-FP8-BF16-Layerwise | 39,8 B | no disponible | 76,350 GB | 99,03 % top-1, KL 0,000793 | apache-2.0 | HuggingFace, runtime `dgpp` pendiente |
| RecursiveSI/flint (BF16) | 39,8 B | no disponible | 79,571 GB | referencia (100 %) | apache-2.0 | HuggingFace |
| HawkBearPig/flint-NVFP4-FP8 | no disponible | no disponible | 30,80 GB | sustancialmente inferior, según el autor | no disponible | HuggingFace, experimental |

La comparación relevante es interna a la familia: frente al BF16 fuente se ahorra un 4,05 % de tamaño a cambio de un 0,97 % de acuerdo top-1 perdido, mientras que la alternativa NVFP4/FP8 reduce el tamaño a 30,80 GB con una fidelidad notablemente peor y sin paridad de capacidad establecida. No se han identificado en la búsqueda web modelos comparables de terceros.

## Limitaciones y advertencias

- No es un checkpoint drop-in: usa el contrato propietario `dgpp_mixed` y no funciona en Transformers, SGLang, vLLM ni ModelOpt sin trabajo de adaptación.
- Sin inferencia comprimida nativa: la referencia expande a BF16 y anula el ahorro de memoria en tiempo de ejecución.
- Paridad de capacidad no establecida: las métricas son fidelidad de salida, no precisión en tareas; el propio autor advierte que la política se eligió antes de la validación.
- Ahorro marginal: 4,05 % de reducción de tamaño no justifica el coste de integración en la mayoría de despliegues.
- Sensibilidad de capas tempranas: cuantizar la capa 2 hace caer el acuerdo top-1 al 95,54 %, y los errores pueden propagarse por fronteras de routing top-k; mantener routers en BF16 no preserva sus entradas ni los expertos seleccionados.
- Sesgos e idiomas: no documentados; la model card no especifica distribución lingüística ni evaluación de sesgos.
- Alucinación: no evaluada en la información disponible.
- Licencia: apache-2.0 en este derivado, pero conviene verificar los términos del modelo base RecursiveSI/flint antes de uso comercial.
- Contexto: longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Estado de desarrollo: pensado como paso intermedio hacia un port futuro; no hay garantía de mantenimiento ni de soporte.
- La búsqueda web no devolvió resultados relevantes sobre este modelo; todos los enlaces útiles proceden de la información de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HawkBearPig/flint-FP8-BF16-Layerwise
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Revisión del modelo base utilizada: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Checkpoint alternativo NVFP4/FP8: https://huggingface.co/HawkBearPig/flint-NVFP4-FP8
- Política de precisión: https://huggingface.co/HawkBearPig/flint-FP8-BF16-Layerwise/blob/main/precision-policy.json
- Configuración: https://huggingface.co/HawkBearPig/flint-FP8-BF16-Layerwise/blob/main/config.json
- Investigación completa: https://huggingface.co/HawkBearPig/flint-FP8-BF16-Layerwise/blob/main/diagnostics/investigation.md
- Perfil de sensibilidad por capas: https://huggingface.co/HawkBearPig/flint-FP8-BF16-Layerwise/blob/main/diagnostics/layer-profile.png
