# Miraiyochi/world-model-qa-libero

## Resumen

`world-model-qa-libero` es un archivo de investigación publicado en Hugging Face por Miraiyochi que contiene pesos entrenados, configuraciones y artefactos de evaluación de los experimentos LIBERO del repositorio privado `world-model-qa`. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de checkpoints (ficheros `.pt` de PyTorch) asociados a experimentos de modelado de mundo y question answering sobre entornos de juego, organizados en cinco carpetas correspondientes a distintos experimentos (`h3_libero_causal_20260928`, `h3_libero_logic_20260926`, `h3_libero_long_20260925`, `h3_libero_loho_20260926` y `libero_shared_latent_20260915`).

El repositorio tiene un tamano total de 15,4 GB y contiene 1.711 ficheros distribuidos entre esos cinco experimentos. Los pesos incluyen checkpoints finales y EMA (exponential moving average) de modelos "flat" y "hierarchical", además de un codec de latente compartido (`libero_shared_latent_20260915`) con checkpoints de tan solo 14-24 MB, lo que sugiere componentes compactos de codificación/decodificación de latentes.

La relevancia de este artefacto es fundamentalmente de archivo y reproducibilidad: preserva el estado de una línea de experimentos de investigación (codec latente compartido, H3 LIBERO-Long / Logic / Causal / LoHo) que de otro modo solo existiría en volúmenes de red de Runpod. No hay información pública sobre la arquitectura interna, el número de parámetros ni el contexto, por lo que debe tratarse como material de referencia para investigadores, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints de experimentos de modelado de mundo; estructura interna no documentada) |
| Parametros totales | no disponible (tamanos de checkpoint entre 14 MB y 1.272 MB, no equivalen directamente a parámetros) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato `.pt` de PyTorch, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | other (licencia personalizada, no especificada en detalle) |
| Formato de pesos | `.pt` (PyTorch), con hashes SHA-256 por fichero |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna de los modelos. La model card describe los experimentos como parte de un repositorio privado `world-model-qa` (commit `d295c1282b6551bbdb6f7831ded664133811cbe6`), con cada experimento alojado en `experiments/<name>/` y su README como registro canónico. Los nombres de las ejecuciones (`flat_lower512`, `hier_upper1024`, `flat_seed42_60k`, `hierarchical_seed42_60k`, `pipeline_v1_flat_30000`, `pipeline_v1_hierarchical_30000`, `codec_language_mask_v1`, `codec_warmup_v1`, `joint_goal_flat_v1`, `scaled_goal_flat_s42_v1`, etc.) indican variantes "flat" y "hierarchical", con semillas fijas (seed42), pasos de entrenamiento explícitos (10.000, 20.000, 30.000, 60.000) y componentes de codec latente y objetivos conjuntos.

Los experimentos se etiquetan como H3 LIBERO-Long, Logic, Causal y LoHo, y se menciona que los pesos H3 de UniReps 2026 viven en el repositorio público `Miraiyochi/hierarchical-latent-subgoals`. No se documentan en esta información el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF/DPO. Se excluyeron deliberadamente checkpoints intermedios con optimizador, datasets públicos, cachés de latentes regenerables y entornos Python.

## Capacidades

- No se documentan capacidades funcionales del modelo en la información disponible (no hay pipeline declarado ni descripción de tareas de inferencia).
- Los tags `world-model` y `game-qa` sugieren orientación a modelado de mundo y question answering sobre entornos de juego, pero no se detalla el comportamiento concreto.
- No se indica soporte de tool calling / function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- Multilingüe: no disponible (solo se declara `en`).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio permite a otros investigadores recuperar los checkpoints finales y EMA de los experimentos H3 LIBERO (Long, Logic, Causal, LoHo) y verificar resultados contra los README canónicos del commit `d295c128`.
- Auditoría de integridad de artefactos: cada fichero fue hasheado con SHA-256 en el volumen antes de la subida y re-verificado contra el hash LFS del Hub (`SHA256SUMS.volume`), lo que permite validar la cadena de custodia de los pesos.
- Estudio de codecs de latente compartido: la carpeta `libero_shared_latent_20260915` contiene checkpoints de codec (`codec_language_mask_v1`, `codec_warmup_v1`) de 24 MB y modelos de objetivo conjunto (`joint_goal_flat_v1`, `joint_goal_hierarchical_v1`) de 14-20 MB, útiles para analizar representaciones latentes compactas.
- Comparación de variantes flat frente a hierarchical: los pares de ejecuciones (`flat_seed42_60k` vs `hierarchical_seed42_60k`, `pipeline_v1_flat_30000` vs `pipeline_v1_hierarchical_30000`) permiten estudios controlados de arquitectura con la misma semilla y presupuesto de pasos.
- Análisis de dinámica de entrenamiento: los checkpoints EMA en distintos pasos (10.000, 20.000, 30.000, 60.000) y las variantes `_to10000`, `_resume_v3`, `_normfix_20260917_v1` y `_replay_20260917_v1` permiten trazar el efecto de correcciones de normalización, reanudaciones y replay sobre el rendimiento.
- Archivado a largo plazo de artefactos de investigación: al migrar desde volúmenes de Runpod a Hugging Face, el repositorio sirve como respaldo duradero y públicamente accesible de pesos que de otro modo se perderían con la desaparición del volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los checkpoints van desde 14 MB hasta 1.272 MB, pero no se documenta el grafo de cómputo ni los requisitos de memoria en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (no se indica que los pesos sean ejecutables directamente con llama.cpp, Ollama u otras herramientas de inferencia de consumo).
- Opciones de despliegue: no disponible. Los pesos están en formato `.pt` de PyTorch y no se publican variantes GGUF, safetensors ni integraciones con vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (archivos de experimentos de modelado de mundo para LIBERO), ni se aportan métricas que permitan una comparación objetiva con alternativas.

## Limitaciones y advertencias

- Artefacto de archivo, no modelo de producción: el repositorio contiene checkpoints de experimentos de investigación, sin pipeline declarado ni documentación de uso en inferencia.
- Licencia `other` sin texto detallado: no se especifican los términos exactos, por lo que el uso comercial es incierto y requiere consulta directa con el autor.
- Idiomas: solo se declara inglés (`en`); no hay evidencia de soporte multilingüe.
- Ausencia de documentación técnica pública: no se conocen arquitectura, número de parámetros, contexto, dataset de entrenamiento ni metodología de evaluación, lo que impide validar afirmaciones de rendimiento.
- Riesgo de alucinación y sesgos: no evaluable, al no documentarse capacidades generativas ni datos de entrenamiento.
- Dependencia del repositorio privado: los README canónicos de cada experimento viven en el repositorio privado `world-model-qa` (commit `d295c128`), por lo que sin acceso a este la reproducibilidad completa queda limitada.
- Duplicación parcial: dos checkpoints EMA de `h3_libero_long_20260925` no se duplican aquí y residen en el repositorio público `Miraiyochi/hierarchical-latent-subgoals`, lo que exige consultar dos repositorios para reconstruir el conjunto completo.
- Exclusión deliberada de artefactos: no se incluyen checkpoints intermedios con optimizador, datasets públicos, cachés de latentes regenerables ni entornos Python, lo que limita la reanudación exacta del entrenamiento desde este archivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Miraiyochi/world-model-qa-libero
- Repositorio público de pesos H3 (UniReps 2026): https://huggingface.co/Miraiyochi/hierarchical-latent-subgoals
- Repositorio privado de código y READMEs: `world-model-qa` (commit `d295c1282b6551bbdb6f7831ded664133811cbe6`), sin URL pública en la información disponible.
- Paper, blog o demo: no disponible en la información proporcionada.
