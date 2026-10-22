# RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-replay-ce

## Resumen

Este repositorio no contiene un modelo único listo para usar, sino una entrega incremental de checkpoints del experimento de SFT filtrado de 15 brazos, etiquetado como `RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-replay-ce`. Incluye derivados de Qwen2.5-3B y de Llama 3.2-3B, con pesos en safetensors y un tamaño de repositorio de 61,7 GB. La model card advierte de que las ejecuciones incompletas no deben tratarse como estudios completos y remite al `delivery_manifest.json` para verificar unidades de subida y hashes.

Su interés es metodológico: permite estudiar olvido catastrófico, el efecto del filtrado de datos en SFT y variantes con replay, usando checkpoints intermedios (`runs/checkpoints/step_N/model`) y modelos finales (`runs/final`). No es un modelo de producción: no declara pipeline, idiomas, longitud de contexto ni resultados de benchmarks. En el momento de la consulta tiene 0 descargas y 0 likes, y fue creado el 21 de octubre de 2026.

La relevancia actual es de reproducibilidad en investigación de ajuste fino: el repositorio conserva artefactos experimentales y un manifiesto de integridad, pero no ofrece garantías de calidad, seguridad ni licencia para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Qwen2.5-3B y Llama 3.2-3B; detalle no disponible |
| Parámetros totales | Aproximadamente 3 mil millones (clase 3B; cifra exacta no disponible) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; pesos en safetensors sin cuantización documentada |
| Idiomas soportados | No disponibles |
| Licencia | `other`; derivados Qwen2.5-3B sujetos a Qwen Research License Agreement; derivados Llama 3.2 sujetos a Llama 3.2 Community License y Acceptable Use Policy |
| Formato de pesos | Safetensors; checkpoints en `runs/checkpoints/step_N/model` y modelos finales en `runs/final` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Por los modelos base citados, se trata de variantes de transformadores decoder-only de la clase 3B: derivados de Qwen2.5-3B y de Llama 3.2-3B. No se indica que sea MoE, híbrido o SSM. El repositorio corresponde a un experimento de SFT filtrado con 15 brazos y a una entrega incremental de checkpoints; el identificador incluye `kk-replay-ce`, pero la model card no define estos términos ni documenta si `replay` se refiere a repetición de datos, experiencia o otra técnica.

No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, mezcla de idiomas, uso de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La innovación declarada es organizativa: entrega incremental, checkpoints por paso, modelos finales y un manifiesto con hashes para verificar la integridad de lo subido. Las ejecuciones incompletas deben considerarse parciales.

## Capacidades

- Generación de texto y seguimiento de instrucciones: no hay evaluación publicada; depende del checkpoint concreto y del modelo base del que derive.
- Razonamiento, código y matemáticas: no documentado.
- Tool calling o function calling: no documentado; no debe asumirse por el nombre del repositorio.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el sufijo `kk` del identificador no implica soporte documentado de kazajo ni de otro idioma.
- Modo thinking, visión o audio: no disponible.
- Uso previsto real: artefacto de investigación para estudiar olvido, filtrado SFT y replay, no un asistente listo para despliegue.

## Casos de uso

- Estudio de olvido catastrófico: comparar checkpoints de los 15 brazos antes y después del SFT filtrado, midiendo retención en tareas mantenidas y degradación en tareas objetivo. El repositorio conserva pasos intermedios, lo que permite trazar la evolución del olvido.
- Ablación del filtrado de datos SFT: emparejar brazos con y sin filtrado sobre el mismo modelo base y evaluar la diferencia con un conjunto de validación fijo. La estructura de checkpoints facilita comparaciones por paso.
- Análisis de variantes con replay: utilizar los checkpoints etiquetados como `replay-ce` para estudiar si la repetición de datos mitiga el olvido, siempre que el manifiesto confirme que la ejecución está completa.
- Auditoría de reproducibilidad: verificar hashes y unidades de subida con `delivery_manifest.json`, y reconstruir experimentos a partir de `runs/checkpoints/step_N/model` y `runs/final`.
- Evaluación de seguridad previa a reutilización: ejecutar pruebas de sesgo, toxicidad, rechazo y alucinación sobre cada checkpoint candidato antes de usarlo en un experimento downstream.
- Selección de checkpoints para ajuste fino posterior: elegir un paso concreto como inicialización de un nuevo SFT o de una evaluación de alineamiento, en lugar de usar el repositorio completo como si fuera un modelo final.
- Docencia o formación en metodología experimental: usar la estructura de brazos, manifiesto y checkpoints como ejemplo de entrega reproducible en investigación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 61,7 GB para el repositorio completo; cada checkpoint individual es mucho menor, pero deben descargarse selectivamente.
- VRAM estimada para inferencia: alrededor de 6-8 GB en fp16 para un modelo de 3B, 3-4 GB en int8 y 2-3 GB en int4. Son estimaciones teóricas, no datos del autor.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB para evaluación de un checkpoint; A100 o H100 para barridos de los 15 brazos.
- GPU de consumo: sí, un checkpoint de 3B cabe en GPUs de 8-12 GB con cuantización y en 12 GB o más en fp16, sujeto al soporte del modelo base.
- Despliegue: `transformers` cargando la subcarpeta correspondiente; vLLM o TGI si la configuración del checkpoint es compatible; llama.cpp u Ollama requerirían convertir a GGUF, formato no incluido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este repositorio | ~3B | No disponible | `other` + Qwen Research / Llama 3.2 Community | Hugging Face | Checkpoints de investigación; sin benchmarks |
| Qwen2.5-3B | 3B | No disponible en la información | Qwen Research License Agreement, según la model card | Hugging Face | Modelo base de los derivados Qwen |
| Llama 3.2 3B Instruct | 3B | No disponible en la información | Llama 3.2 Community License | Hugging Face | Modelo base de los derivados Llama |

No hay datos de rendimiento comparativo en la información disponible. La comparación relevante es de licencia y trazabilidad, no de calidad medida.

## Limitaciones y advertencias

- No es un modelo único ni un artefacto final: es un repositorio de checkpoints experimentales, algunos posiblemente incompletos.
- No hay benchmarks, evaluaciones de seguridad ni métricas de calidad publicadas.
- La licencia `other` remite a licencias upstream restrictivas; el uso comercial de los derivados Qwen2.5-3B y Llama 3.2 requiere revisar el Qwen Research License Agreement y la Llama 3.2 Community License.
- No se documentan idiomas soportados; no debe asumirse multilingüismo por el sufijo `kk`.
- Los sesgos y la tendencia a la alucinación de los modelos base pueden persistir; no se documentan mitigaciones.
- El repositorio ocupa 61,7 GB y exige descarga selectiva y verificación de hashes.
- No hay pipeline declarado ni garantía de compatibilidad directa con vLLM, TGI, llama.cpp u Ollama.
- El significado de `kk-replay-ce` no está definido en la model card; no debe interpretarse como una capacidad o idioma concreto.
- No debe usarse en producción sin evaluación independiente, revisión de licencia y pruebas de seguridad.

## Enlaces

- [Hugging Face: RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-replay-ce](https://huggingface.co/RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-replay-ce)
- [Llama 3.2 3B Instruct, modelo base citado en la model card](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
- Qwen2.5-3B: la model card no incluye URL verificada del modelo base.
- Los resultados de búsqueda web proporcionados no son relevantes para este modelo y no se incluyen como fuentes.
