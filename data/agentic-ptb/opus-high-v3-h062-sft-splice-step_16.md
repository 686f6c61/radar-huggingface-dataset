# agentic-ptb/opus-high-v3.h062.sft-splice.step_16

## Resumen

`agentic-ptb/opus-high-v3.h062.sft-splice.step_16` es un checkpoint intermedio generado durante el run **opus-high-v3** del proyecto AgentPTB, una iniciativa de investigación que explora el entrenamiento de modelos mediante agentes autónomos (en este caso, ejecuciones de Claude Code). El checkpoint se deriva del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros) y se publica con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso.

La model card del autor es explícita: el run **no encontró mejora en los pesos entrenados** (etiqueta `negative-results`). Se trata de un artefacto intermedio retenido para permitir la trazabilidad del experimento, no de un modelo con capacidades mejoradas respecto a su base. El propio autor advierte que no se debe inferir calidad a partir de la publicación.

Este checkpoint es relevante en el contexto de la investigación sobre pipelines de entrenamiento automatizados y la reproducibilidad de experimentos de ajuste fino, pero carece de valor práctico como modelo de inferencia independiente. No se han documentado especificaciones técnicas adicionales más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-9B-Base, presumiblemente transformer denso) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base Qwen3.5-9B-Base en la documentacion proporcionada. Dado el tamano (9.4B parametros) y la nomenclatura, se trata presumiblemente de un transformer denso autoregresivo, pero no se puede confirmar sin datos adicionales.

El checkpoint se genera en el contexto del run **opus-high-v3** de AgentPTB, un experimento que utiliza agentes de Claude Code para ejecutar un pipeline de ajuste fino supervisado (SFT) con una tecnica denominada "sft-splice". El run alcanzo la hora 62 (`h062`) y produjo este checkpoint en el paso 16. Segun la model card, el resultado fue un regreso: **no se observo ninguna mejora en los pesos entrenados** respecto al modelo base. El run fue etiquetado como `negative-results` y el checkpoint se conserva unicamente para reproducibilidad y estudio cualitativo.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre tecnicas como RLHF o DPO. El proyecto AgentPTB mantiene un dataset asociado (`agentic-ptb/opus-high-v3-data`) que podria contener detalles adicionales, pero no se han analizado en esta ficha.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Dado que es un artefacto intermedio sin mejora de pesos, sus capacidades son, en el mejor de los casos, identicas a las del modelo base Qwen3.5-9B-Base (que presumiblemente incluye generacion de texto, razonamiento, codigo y soporte multilingue, segun la familia Qwen), pero no se puede confirmar sin una evaluacion directa. El autor no proporciona ninguna lista de capacidades.

La unica capacidad confirmada es la de servir como referencia para estudios de reproducibilidad de experimentos de entrenamiento agéntico.

## Casos de uso

Dado el caracter experimental y negativo de este checkpoint, no se recomienda su uso en aplicaciones practicas. Los unicos escenarios en los que podria tener utilidad son:

- **Investigacion sobre reproducibilidad de pipelines de entrenamiento**: permite comparar el comportamiento de diferentes runs de AgentPTB y analizar por que el ajuste fino no produjo mejoras.
- **Estudio de regresion en ajuste fino**: sirve como ejemplo de un caso donde el entrenamiento supervisado no logra mejorar el modelo base, util para investigar causas de degradacion.
- **Auditoria de artefactos de entrenamiento**: puede usarse para verificar que los pesos publicados coinciden con los generados en el run, validando la integridad del proceso experimental.
- **Evaluacion de tecnicas de "sft-splice"**: investigadores interesados en esta tecnica especifica pueden analizar los pesos intermedios para entender su comportamiento.
- **Linea base para comparaciones negativas**: en estudios sobre metodos de entrenamiento, puede servir como control para demostrar que un metodo alternativo si produce mejoras.
- **Documentacion de buenas practicas en publicacion de resultados negativos**: ejemplifica como compartir artefactos de experimentos fallidos para transparencia cientifica.

Ninguno de estos casos implica uso en produccion o inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona ninguna evaluacion de rendimiento, consistente con el caracter negativo del experimento. No se puede afirmar nada sobre el rendimiento de este checkpoint en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se han publicado requisitos especificos de hardware para este checkpoint. Dado que el modelo base tiene 9.409.813.744 parametros, se pueden hacer estimaciones generales para un modelo de este tamano, pero no se dispone de datos oficiales:

- **VRAM estimada para inferencia**: aproximadamente 18-20 GB en FP16, o 9-10 GB en cuantizacion INT8, y 5-6 GB en INT4 (estimaciones estandar para modelos de 9B).
- **GPU recomendadas**: una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A10G) para FP16 sin cuantizar; GPUs de 16 GB (RTX 4080, L4) pueden funcionar con cuantizacion.
- **Compatibilidad con GPU de consumo**: si, es posible en GPUs de consumo con cuantizacion (llama.cpp, Ollama).
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, transformers (si se cargan los pesos safetensors).
- **Latencia y throughput**: no disponible.

Estas son estimaciones basadas en el tamano del modelo, no en mediciones reales. Dado que el checkpoint no ofrece ninguna ventaja sobre el modelo base, no tiene sentido desplegarlo.

## Comparativa con modelos similares

No disponible. Este checkpoint no es un modelo independiente comparable con alternativas de la misma categoria; es un artefacto intermedio derivado de Qwen/Qwen3.5-9B-Base sin mejoras. Compararlo con otros modelos careceria de sentido, ya que su unica funcion es servir como referencia experimental.

## Limitaciones y advertencias

- **Resultados negativos**: el run no encontro ninguna mejora en los pesos entrenados; el checkpoint no aporta valor como modelo de inferencia.
- **Checkpoint intermedio**: no es un modelo final, sino un punto intermedio de un experimento (paso 16 de un run de 62 horas).
- **Advertencia de interpretacion**: el autor indica explicitamente que no se debe inferir calidad a partir de la publicacion.
- **Sin especificaciones documentadas**: arquitectura, contexto, idiomas y capacidades no estan disponibles.
- **Sin evaluacion de rendimiento**: no hay benchmarks ni mediciones de calidad.
- **Riesgo de alucinacion y sesgos**: no evaluado; se heredan los riesgos del modelo base Qwen3.5-9B-Base, pero sin confirmacion.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo no es apto para produccion por su naturaleza experimental.
- **Tamanos de archivo**: el repo ocupa 18.8 GB, lo que implica un uso considerable de almacenamiento para un artefacto sin valor practico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h062.sft-splice.step_16)
- [Dataset asociado del run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Indice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (referencia externa, no confirmada en la busqueda)
