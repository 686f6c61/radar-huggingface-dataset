# roman220220/nemotron-30b-a3b-gptq-smart_3_6

## Resumen

Esta ficha describe `roman220220/nemotron-30b-a3b-gptq-smart_3_6`, una cuantización mixta de precisión GPTQ del modelo `nvidia/Nemotron-3.5-Lightning-30B-A3B`, publicada por el usuario roman220220 dentro del proyecto de cuantización `quant-ternary`. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos con receta de 3/6 bits aplicada sobre el checkpoint original de NVIDIA, en formato MLX y con licencia OpenMDW 1.1 heredada del modelo base.

El modelo base emplea la arquitectura NemotronH, un diseño híbrido que combina capas Mamba2 con atención y capas de mezcla de expertos (MoE) a lo largo de 52 capas. Cuenta con 31.577.935.872 parámetros totales (unos 31,6 mil millones) y, por la nomenclatura A3B, del orden de 3 mil millones de parámetros activos por token. La innovación del repositorio no está en el modelo, sino en la receta de cuantización: en lugar de asignar los 6 bits por posición de capa, se eligen las capas mediante una puntuación de sensibilidad por capa basada en la saliencia hessiana al estilo Optimal Brain Damage, normalizada por la energía de salida de cada proyección.

Su relevancia es práctica: permite ejecutar un MoE de 31,6 mil millones de parámetros en hardware de memoria unificada limitada (aproximadamente 16 GB en disco según la model card, con una media de 4,338 bits por peso), con una perplejidad de 5,90 en wikitext-2-raw frente a 5,11 del modelo en bf16 y 6,54 de una cuantización RTN uniforme de 3 bits sin calibración. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no dispone de pipeline declarado ni de idiomas documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida: Mamba2 + atencion + MoE, 52 capas (segun model card) |
| Parametros totales | 31.577.935.872 (~31,6 mil millones) |
| Parametros activos | ~3 mil millones segun nomenclatura A3B; cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ mixta 3/6 bits, group size 64, media de 4,338 bits por peso; tag de 3 bits |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement v1.1 (openmdw-1.1) |
| Formato de pesos | safetensors en formato MLX (libreria mlx-lm) |
| Modelo base | nvidia/Nemotron-3.5-Lightning-30B-A3B |
| Autor de la cuantizacion | roman220220 (pipeline quant-ternary) |
| Tamano del repo | 31,2 GB en HuggingFace; la model card indica ~16 GB en disco |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido NemotronH de 52 capas que intercala bloques Mamba2 (espacio de estados) con bloques de atencion y bloques MoE. La componente MoE reside en las proyecciones `switch_mlp.fc1`/`fc2` (equivalentes a `up_proj`/`down_proj` en la nomenclatura original), que concentran aproximadamente el 99% de los parametros de un bloque MoE segun la propia model card. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo de NVIDIA y no se reproducen aqui.

La aportacion tecnica de este repositorio es la receta de cuantizacion. Para cada candidato `v_proj`/`down_proj` se calcula una puntuacion de sensibilidad `sum_i H_ii * ||W[:,i]||^2` (saliencia hessiana, la misma magnitud sobre la que se construye la compensacion de error de GPTQ), normalizada por la energia de salida de esa proyeccion para reflejar fragilidad relativa y no escala bruta de activacion. De los 29 candidatos, los 13 con mayor puntuacion reciben 6 bits, imponiendo una separacion minima de indice de capa entre selecciones de la misma familia para no gastar presupuesto en vecinos redundantes. El resto permanece en 3 bits, con group size 64.

La model card senala explicitamente un error corregido en versiones anteriores del repositorio y en la publicacion posicional `mixed_3_6`: un desajuste de nombres (`switch_mlp.fc1`/`fc2` frente a `up_proj`/`down_proj`) hacia que los expertos enrutados nunca recibieran la mejora a 6 bits. Esta version se presenta como la corregida y verificada, con el script `poc/mlx_convert_recipe.py` como referencia del proceso.

## Capacidades

- Generacion de texto autoregresiva mediante `mlx-lm`, con el mismo perfil de capacidades del modelo base Nemotron-3.5-Lightning-30B-A3B.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta cuantizacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados.
- Modo de pensamiento (thinking mode), vision o audio: no disponible.
- Eficiencia de inferencia: al ser un MoE con ~3 mil millones de parametros activos, el coste de computo por token es muy inferior al de un modelo denso de 31,6 mil millones.
- Ejecucion en Apple Silicon: integracion nativa con MLX, no con CUDA.

## Casos de uso

- Inferencia local en equipos Apple Silicon: el modelo ocupa aproximadamente 16 GB en disco segun la model card y esta en formato MLX, por lo que se puede ejecutar en un Mac con memoria unificada de 24 o 32 GB usando `mlx_lm.generate`, sin necesidad de GPU dedicada.
- Prototipado de asistentes conversacionales en local: al no requerir infraestructura cloud, es adecuado para iterar sobre prompts y flujos de dialogo en un entorno de desarrollo personal.
- Evaluacion comparativa de recetas de cuantizacion: sirve como referencia reproducible para investigar el impacto de la seleccion de capas por sensibilidad frente a recetas posicionales o uniformes, usando la perplejidad en wikitext-2-raw como metrica.
- Generacion de texto asistida en lote sobre corpus propios: la relacion entre parametros totales y activos reduce el coste por token frente a alternativas densas del mismo tamano, lo que lo hace viable para procesar volumenes moderados de documentos en hardware de gama alta de consumo.
- Experimentacion academica con arquitecturas hibridas Mamba2 + atencion + MoE: el checkpoint cuantizado permite estudiar el comportamiento de este tipo de modelos con un presupuesto de memoria reducido, aunque con la degradacion de precision asociada.
- Despliegue en entornos con restricciones de memoria y sin GPU NVIDIA: al estar empaquetado para MLX, cubre el nicho de estaciones de trabajo Apple que quedan fuera de los pipelines habituales basados en CUDA.
- Base para cuantizaciones posteriores o destilacion: los pesos en safetensors MLX pueden servir como punto de partida para experimentos de compresion adicional, siempre respetando la licencia OpenMDW 1.1.

## Benchmarks y rendimiento

Unica metrica publicada: perplejidad en wikitext-2-raw, con 20 fragmentos de 512 tokens y desplazamiento de un cuarto (quarter-in offset).

| Modelo | Perplejidad (wikitext-2-raw) |
|---|---|
| bf16 (precision completa, referencia) | 5,11 |
| JANG_2L-CRACK (tercero, precision mixta) | 5,43 |
| Este modelo (seleccion de capas por sensibilidad) | 5,90 |
| GPTQ uniforme de 3 bits del mismo proyecto | 6,24 |
| RTN uniforme de 3 bits sin calibracion | 6,54 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: aproximadamente 16 GB segun la model card del autor; el repositorio ocupa 31,2 GB en disco, discrepancia que conviene verificar antes de desplegar.
- Modelo en bf16 (referencia): 31.577.935.872 parametros a 2 bytes por peso implican unos 63 GB solo de pesos, mas activaciones y cache KV.
- GPU recomendadas: MLX esta orientado a Apple Silicon (series M1, M2, M3 y M4), por lo que la recomendacion principal son equipos Mac con memoria unificada de 32 GB o superior. No se documenta soporte CUDA en este repositorio.
- Cabe en GPU de consumo: no hay evidencia de soporte para GPUs NVIDIA consumer en este formato. El modelo cuantizado podria caber en GPUs con 24 GB o mas si existiera una conversion a un runtime compatible, pero dicha conversion no se proporciona.
- Opciones de despliegue: `mlx-lm` es la via documentada (`pip install mlx-lm` y `python -m mlx_lm.generate`). No se ofrecen pesos GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversion previa. No hay indicios de compatibilidad con vLLM ni TGI.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Perplejidad (wikitext-2-raw) | Formato | Licencia |
|---|---|---|---|---|---|
| Este modelo (roman220220, receta por sensibilidad) | 31,6 mil millones totales, ~3 mil millones activos | Mixta 3/6 bits, media 4,338 bits/peso | 5,90 | safetensors MLX | OpenMDW 1.1 |
| Nemotron-3.5-Lightning-30B-A3B (bf16) | 31,6 mil millones totales, ~3 mil millones activos | bf16 | 5,11 | safetensors | OpenMDW 1.1 |
| JANG_2L-CRACK (tercero, no identificado en detalle) | no disponible | Mixta (precision no detallada) | 5,43 | no disponible | no disponible |
| GPTQ uniforme 3 bits del mismo proyecto | 31,6 mil millones totales | 3 bits uniforme | 6,24 | safetensors MLX | OpenMDW 1.1 |
| RTN uniforme 3 bits sin calibracion | 31,6 mil millones totales | 3 bits uniforme | 6,54 | no disponible | no disponible |

No se dispone de datos de contexto, licencia detallada ni rendimiento en tareas del modelo JANG_2L-CRACK, por lo que la comparacion se limita a la perplejidad publicada.

## Limitaciones y advertencias

- Degradacion medible por cuantizacion: la perplejidad sube de 5,11 en bf16 a 5,90, un incremento relativo de aproximadamente el 15,5%. En tareas de razonamiento o codigo la perdida puede ser mayor que la sugerida por la perplejidad.
- No hay evaluaciones en tareas: no se publican resultados de MMLU, HumanEval, GSM8K ni de tool calling, por lo que no se puede garantizar un comportamiento correcto en produccion.
- Discrepancia de tamano: la model card indica ~16 GB en disco, mientras que el repositorio ocupa 31,2 GB. Conviene descargar y verificar los pesos antes de planificar el despliegue.
- Historicamente defectuoso: la propia model card reconoce que versiones anteriores del repositorio, incluida la receta posicional `mixed_3_6`, no aplicaban los 6 bits a los expertos MoE por un desajuste de nombres. Solo esta version se declara corregida y verificada.
- Adopcion nula: 0 descargas y 0 likes en HuggingFace, sin pipeline declarado ni proceso de validacion por terceros.
- Idiomas no documentados: se desconoce el soporte multilingue real y el comportamiento fuera del ingles.
- Longitud de contexto desconocida: no se especifica la ventana de contexto utilizable tras la cuantizacion, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente al modelo base y potencialmente agravado por la cuantizacion agresiva a 3 bits en la mayoria de las proyecciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Licencia OpenMDW 1.1: es una licencia propia de NVIDIA con terminos especificos. Antes de un uso comercial es imprescindible revisar el fichero LICENSE del repositorio y las condiciones de la licencia del modelo base.
- Requisito de plataforma: el formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos GGUF ni soporte CUDA en este repositorio.
- Sin soporte documentado: al ser un artefacto de un autor individual, no hay mantenimiento, versionado ni canal de soporte garantizados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/roman220220/nemotron-30b-a3b-gptq-smart_3_6
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Lightning-30B-A3B
- Pipeline de cuantizacion (repositorio del proyecto): https://github.com/rromenskyi/quant-ternary
- Metodologia detallada: `docs/session_findings_2026-09-11.md` en el repositorio del proyecto (ruta citada en la model card)
- Script de conversion MLX: `poc/mlx_convert_recipe.py` en el repositorio del proyecto (ruta citada en la model card)
- Script de conversion GPTQ: `poc/gptq_stock_convert.py` en el repositorio del proyecto (ruta citada en la model card)
