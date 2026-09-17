# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r05

## Resumen

Este checkpoint es un artefacto de investigación: una versión de `meta-llama/Llama-3.1-8B-Instruct` comprimida con SVD-LLM hasta conservar el 59,98 % de los parámetros densos (un 40,02 % eliminado) y editada después mediante rondas de *swap* iterativo de parámetros neutro en rendimiento, con la selección de componentes guiada por la regla `gap_iter`. El autor, Jeesup, lo publica como una celda de una malla experimental que cruza reglas de selección y presupuestos de restauración, con el objetivo de medir cuánto daña la compresión SVD al comportamiento de seguridad y qué regla lo repara mejor.

El checkpoint corresponde a la ronda 5 de 10 de una ejecución más larga (semilla 42), con 5.971 componentes restaurados y otros tantos expulsados, y 34.877.440 parámetros intercambiados, equivalentes al 0,50 % de los parámetros de proyección densos. Mantiene la arquitectura transformer decoder-only de Llama 3.1 8B y el mismo recuento de parámetros del modelo base (8.030.261.248 según safetensors), de modo que la reducción declarada es funcional (direcciones singulares anuladas), no un recorte del tamaño del fichero de pesos.

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión y aporta métricas reproducibles de tasa de éxito de ataque (ASR) sobre AdvBench y StrongREJECT, además de sobre-rechazo macro medido con WildGuard. No es un modelo de chat de propósito general ni un asistente desplegable.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); derivado comprimido de `meta-llama/Llama-3.1-8B-Instruct` |
| Parámetros totales | 8.030.261.248 (recuento de safetensors, idéntico al modelo base); fracción de parámetros densos resultante declarada: 0,5998 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens (131.072) |
| Tipos de cuantización | no disponible; sin instrucciones de cuantización en el repositorio. El tamaño (16,1 GB) es coherente con pesos en bf16 |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License (`license: llama3.1`); el repositorio incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors (`transformers`), pipeline `text-generation` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y funciones de activación SwiGLU. Sobre ese modelo no hay reentrenamiento: el autor aplica primero una compresión SVD-LLM que elimina el 40,02 % de los parámetros de proyección, y después una edición quirúrgica consistente en intercambiar componentes (restaurar unos, expulsar otros mediante evicción ordenada por sigma) con el valor de inserción `insert`. El proceso se repite en rondas de 0,1 % del total de parámetros densos; este checkpoint es la ronda intermedia 5 de 10, con un presupuesto de restauración de 1,000 % para la ejecución completa y 5.971 componentes efectivamente restaurados.

No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento adicional: todas esas características se heredan del modelo base y quedan fuera del alcance del artefacto. La innovación técnica destacable no está en la arquitectura, sino en el método de reparación: una selección de componentes basada en la regla `gap_iter`, con control del presupuesto por rondas y semilla fija (42) para hacer el experimento reproducible y comparable frente a otras reglas de selección de la malla.

## Capacidades

- Generación de texto conversacional e instrucciones: heredadas del modelo base Llama 3.1 8B Instruct, aunque no verificadas ni documentadas por el autor de este checkpoint.
- Razonamiento y código: capacidades propias del modelo base, no medidas en este artefacto (no hay HumanEval, GSM8K ni MMLU en la model card).
- Respuesta a ataques adversarios: el artefacto está instrumentado para medir ASR con juez HarmBench en AdvBench y StrongREJECT, no para maximizar utilidad.
- Comportamiento de rechazo: se mide el sobre-rechazo macro con WildGuard (0,3056), lo que permite caracterizar el equilibrio entre seguridad y utilidad.
- Soporte de *tool calling* / *function calling*: no documentado en este repositorio; el modelo base lo soporta, pero la compresión SVD y el *swap* pueden degradar formato e instrucciones de herramienta.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no documentadas para este checkpoint; dependen del modelo base y no hay evaluación propia.
- Capacidades especiales: no hay modo *thinking*, ni visión, ni audio. La etiqueta `interpretability` refleja el uso previsto (estudio de componentes internos), no una función del modelo.

## Casos de uso

- Evaluación de seguridad bajo compresión: usar el checkpoint como sujeto de prueba en un *harness* de red-teaming que calcule ASR sobre AdvBench y StrongREJECT con juez HarmBench, y comparar contra el modelo sin comprimir y contra otras celdas de la malla.
- Ablación de reglas de selección de componentes: comparar `gap_iter` con reglas alternativas manteniendo el mismo presupuesto de restauración (1,000 %) y la misma semilla, para aislar qué criterio de selección recupera mejor la seguridad perdida.
- Estudio de compromiso seguridad-utilidad: cruzar el ASR con el sobre-rechazo macro de WildGuard para localizar el punto de la curva en el que la reparación de seguridad empieza a costar utilidad excesiva.
- Calibración de clasificadores y jueces automáticos: emplear las salidas del checkpoint como distribución de casos límite (respuestas parcialmente dañinas) para ajustar umbrales de moderadores como WildGuard o HarmBench.
- Investigación en interpretabilidad de la compresión: analizar qué componentes concretos, entre los 5.971 restaurados, correlacionan con la recuperación de rechazos seguros, usando el recuento de parámetros intercambiados (34.877.440) como variable de control.
- Línea base en *pipelines* de compresión: servir como referencia cuantitativa frente a cuantización (8-bit, 4-bit), destilación o poda estructurada, siempre en términos de comportamiento de seguridad y no de calidad general.
- Auditoría de modelos derivados de Llama: antes de publicar o desplegar un derivado comprimido, reproducir este protocolo para detectar si la compresión ha elevado el ASR a niveles inaceptables.
- Docencia y reproducibilidad metodológica: mostrar con un caso real cómo se documenta un experimento de edición de pesos con semilla, presupuesto por ronda y métricas de seguridad auditables.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0500 | Tasa de éxito de ataque; cuanto menor, mejor |
| StrongREJECT | ASR (juez HarmBench) | 0,0800 | Tasa de éxito de ataque; cuanto menor, mejor |
| WildGuard | Sobre-rechazo macro | 0,3056 | Coste en utilidad por rechazos excesivos |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de capacidades generales. Tampoco se incluye la fila del modelo base sin comprimir, por lo que no es posible cuantificar con los datos disponibles cuánto se ha degradado o recuperado respecto a `meta-llama/Llama-3.1-8B-Instruct`.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 16 GB solo para pesos (16,1 GB de repositorio) más caché KV; en la práctica, entre 18 y 22 GB según longitud de contexto.
- VRAM en 8-bit: del orden de 8-9 GB de pesos; en 4-bit, del orden de 5 GB. Son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S 48 GB para bf16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en 4-bit o 8-bit en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB); en bf16 exige 24 GB o más.
- Opciones de despliegue: `transformers`, vLLM, TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama habría que convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r05` | 8.030.261.248 (fracción densa 0,5998) | no especificado | Llama 3.1 Community License | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Artefacto de investigación, una celda de una malla |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8.030.261.248 | 128.000 tokens (131.072) | Llama 3.1 Community License | HuggingFace | Referencia sin comprimir; sus métricas de seguridad no se incluyen en la información disponible |
| Otros checkpoints comprimidos con SVD-LLM y editados para seguridad | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en los resultados de búsqueda disponibles |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente desplegable. La propia model card indica que debe tratarse cada celda como sujeto experimental y evaluarla antes de extraer conclusiones.
- Varias ramas de la malla experimental están degradadas deliberadamente en seguridad respecto a Llama 3.1 8B Instruct: la compresión por sí sola eleva la tasa de éxito de ataque y el objetivo del estudio es cuantificarlo.
- Riesgo de alucinación: no evaluado ni documentado en este repositorio; se hereda el del modelo base y puede verse alterado por la compresión.
- Sesgos: no se documenta ningún análisis de sesgos. Los sesgos del modelo base siguen presentes y no hay evaluación diferencial tras la compresión.
- Cobertura de idiomas y de contexto: no documentada para el checkpoint. La degradación inducida por SVD puede afectar de forma desigual a idiomas distintos del inglés.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducción.
- Sin métricas de utilidad general: no hay MMLU, HumanEval ni GSM8K, por lo que no se puede afirmar que el modelo conserve la competencia del original más allá del sobre-rechazo medido.
- Licencia: Llama 3.1 Community License. El uso comercial está sujeto a sus términos, incluida la política de uso aceptable (`USE_POLICY.md`), las obligaciones de atribución ("Built with Llama") y las cláusulas específicas para despliegues a gran escala. Al ser un derivado, las restricciones del modelo base se aplican a este checkpoint.
- El checkpoint es una ronda intermedia (5 de 10) de una ejecución mayor, no el resultado final del presupuesto declarado (1,000 %); no debe interpretarse como la configuración óptima del estudio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Política de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy/
- Artículos, blogs, repositorios o demos adicionales: no disponibles. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo; los únicos enlaces recuperados trataban sobre configuración de VPN en Windows y no se incluyen por no ser pertinentes.
