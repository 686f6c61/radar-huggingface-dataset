# mrminjae/qwen3p6-35b-a3b-levelbank-asym-norot-k2-r107

## Resumen

Este repositorio, publicado por el usuario mrminjae bajo el identificador `qwen3p6-35b-a3b-levelbank-asym-norot-k2-r107`, no es un modelo ejecutable sino un artefacto interno de investigación derivado de Qwen/Qwen3.6-35B-A3B. Según su propia model card, contiene pesos de expertos enrutados (routed experts) cuantizados por capa a distintos niveles de bits, lo que el autor denomina un "level bank". Es, por tanto, material de trabajo para experimentación con cuantización, no un checkpoint listo para inferencia directa con `transformers`.

El modelo base del que parte es Qwen3.6-35B-A3B, un modelo de arquitectura Mixture-of-Experts (MoE) de la familia Qwen 3.6, con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token (de ahí el sufijo A3B). Este repositorio hereda esa estructura, pero su propósito declarado es almacenar variantes cuantizadas de los expertos enrutados para su análisis o reutilización en pipelines de compresión.

La relevancia de esta ficha es limitada en términos prácticos: se trata de un artefacto de investigación sin descargas ni interacciones, con licencia no especificada explícitamente (el autor indica que sigue la del modelo base) y sin información sobre idiomas, benchmarks o formato de pesos más allá de la librería `transformers`. Cualquier evaluación de rendimiento o despliegue debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Qwen3.6-35B-A3B; pesos de expertos enrutados cuantizados por capa |
| Parametros totales | 35.000 millones (heredados del modelo base) |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantización por capa a varios niveles de bits ("level bank"); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible explícitamente; el autor indica que sigue la del modelo base Qwen/Qwen3.6-35B-A3B |
| Formato de pesos | no disponible (librería `transformers`; tamaño del repo 16,2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) en las que solo una fracción de los parámetros se activa por token (aproximadamente 3.000 millones de 35.000 millones). El repositorio no entrena un modelo nuevo: aplica cuantización asimétrica (indicada por el sufijo `asym`) sobre los pesos de los expertos enrutados, organizada por capas y a distintos niveles de bits, formando un banco de niveles. El sufijo `norot` sugiere que no se aplica rotación (posiblemente en referencia a técnicas de rotación de pesos tipo QuaRot) y `k2` podría referirse a una configuración de 2 bits o a un esquema de agrupación de 2 niveles, aunque esto no se confirma en la información disponible.

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia estrategia de cuantización por capas. Al ser un artefacto interno de investigación, carece de la documentación típica de un modelo publicado para uso general.

## Capacidades

- No es un modelo ejecutable de forma directa: la model card lo describe explícitamente como "not a runnable model".
- Almacena pesos de expertos enrutados cuantizados a varios niveles de bits, útiles para experimentos de compresión y análisis de sensibilidad por capa.
- Capacidades de generación de texto, razonamiento, código o matemáticas: no disponibles en este repositorio (deben consultarse en el modelo base Qwen3.6-35B-A3B).
- Soporte de tool calling / function calling: no disponible en este artefacto.
- Soporte de agentes y razonamiento multi-paso: no disponible en este artefacto.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en cuantización de MoE: el artefacto permite estudiar cómo afecta la cuantización asimétrica por capa a distintos niveles de bits en los expertos enrutados de un modelo de 35.000 millones de parámetros, comparando niveles dentro del "level bank".
- Análisis de sensibilidad por capa: al contener pesos cuantizados a diferentes niveles, se puede evaluar qué capas toleran mayor compresión sin degradar la calidad, un paso habitual en pipelines de compresión de modelos grandes.
- Reproducción de experimentos internos: equipos que colaboren con el autor pueden reconstruir o validar configuraciones de cuantización concretas (identificador r107) sobre el modelo base.
- Desarrollo de técnicas de rotación de pesos: el sufijo `norot` permite comparar esta variante con otras que sí apliquen rotación, aislando el efecto de dicha técnica.
- Integración en pipelines de compresión automatizada: los pesos por nivel pueden servir como entrada para herramientas que seleccionen dinámicamente el nivel de cuantización según presupuesto de memoria o latencia.
- Estudio de despliegue en hardware limitado: evaluar qué combinación de niveles de bits permite acercarse a un despliegue viable del modelo base en GPUs de menor VRAM, aunque el artefacto por sí solo no sea desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este artefacto, ya que no es un modelo ejecutable. Como referencia, el modelo base Qwen3.6-35B-A3B en precisión completa requeriría del orden de 70 GB solo para pesos, y bastante más para activaciones y caché KV; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repo (16,2 GB) sugiere pesos ya comprimidos, pero no se especifica si son cargables en GPUs de consumo.
- Opciones de despliegue: la librería declarada es `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-levelbank-asym-norot-k2-r107 | 35.000 millones (heredados) | aproximadamente 3.000 millones | no disponible | no disponible (sigue la del base) | artefacto de investigación, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35.000 millones | aproximadamente 3.000 millones | no disponible | no disponible en la información proporcionada | modelo público en Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo ejecutable: la propia model card indica que es un artefacto interno de investigación y no un modelo listo para inferencia.
- Ausencia total de benchmarks: no hay datos que permitan estimar la degradación introducida por la cuantización.
- Licencia ambigua: el autor remite a la licencia del modelo base, pero no se especifica cuál es ni si permite uso comercial.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluables en este artefacto; habría que remitirse al modelo base.
- Sin soporte comunitario: 0 descargas y 0 likes, lo que implica ausencia de validación externa.
- Niveles de cuantización no detallados: el "level bank" no especifica qué niveles de bits contiene ni cómo se seleccionan, lo que dificulta su reutilización sin documentación adicional.
- Fecha de creación futura (2026-11-13) en los metadatos, lo que puede indicar artefactos de generación automática o inconsistencias en el registro.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-levelbank-asym-norot-k2-r107
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
