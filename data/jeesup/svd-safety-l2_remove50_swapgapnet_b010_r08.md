# Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r08

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r08` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. Sobre el modelo base se aplicó una compresión SVD-LLM que elimina el 50,01% de los parámetros densos y, a continuación, una edición mediante 8 de 10 rondas de intercambio iterativo "parameter-neutral" guiada por la regla de selección `gap_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos.

El modelo no resuelve una tarea de usuario final: existe para estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Es una celda concreta de una malla experimental sobre reglas de selección y presupuestos, por lo que su interés es metodológico (compresión, interpretabilidad y evaluación de seguridad), no como asistente desplegable.

Técnicamente es un transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros declarados en los safetensors y 13,5 GB de repositorio. La model card no declara longitud de contexto, idiomas soportados, cuantizaciones ni benchmarks de capacidad; el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con matrices de proyección comprimidas mediante SVD-LLM y posterior edición de componentes |
| Parametros totales | 6.738.415.616 (recuento de safetensors); la model card declara una fracción de parámetros resultante de 0,4999 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la información proporcionada; el modelo base es Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (no declarados; se heredarían del modelo base, sin confirmación) |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El punto de partida es `meta-llama/Llama-2-7b-chat-hf`. Sobre él se aplica SVD-LLM, una compresión basada en descomposición en valores singulares de las matrices de pesos que aquí elimina el 50,01% de los parámetros densos (`resulting parameter fraction` = 0,4999). Después, el checkpoint se edita con un procedimiento de intercambio iterativo "parameter-neutral": en cada ronda se restauran y se sustituyen 4.708 componentes, seleccionados por la regla `gap_iter`, con un valor de intercambio `net` (valor de inserción más valor de eliminación del descarte ordenado por sigma). En total se han intercambiado 51.769.856 parámetros (0,80% de los parámetros densos de proyección), con una semilla fija de 42 y un fragmento por ronda del 0,100% de los parámetros densos.

No hay entrenamiento adicional: no se documenta fine-tuning, RLHF, DPO ni composición de dataset. El checkpoint corresponde a una ronda intermedia (8 de 10) de una ejecución más larga, por lo que es un artefacto de ablation dentro de una malla mayor. La innovación técnica relevante es metodológica: cuantificar el compromiso entre seguridad y utilidad bajo compresión y comparar reglas de selección de componentes para reparar el daño, no una mejora de arquitectura.

## Capacidades

- Generación de texto y comportamiento conversacional heredados del modelo base Llama-2-7b-chat, sin benchmarks que los cuantifiquen en esta versión.
- Sujeto experimental para medir tasa de éxito de ataque (ASR) con jueces HarmBench sobre AdvBench y StrongREJECT, y tasa de sobrerrechazo (over-refusal) con WildGuard.
- Capacidad de servir como punto de comparación dentro de la malla de reglas de selección y presupuestos del mismo estudio.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles (no declaradas).

## Casos de uso

- Estudio de compresión de modelos: usar el checkpoint como celda de referencia para medir cuánta degradación introduce SVD-LLM al eliminar el 50,01% de los parámetros densos, comparando contra el modelo base sin comprimir.
- Evaluación de seguridad bajo compresión: reproducir las métricas ASR con HarmBench sobre AdvBench y StrongREJECT para verificar el 0,0654 y el 0,1246 declarados y estudiar la pérdida de alineación.
- Análisis de sobrerrechazo: emplear WildGuard para reproducir el 0,1960 de over-refusal macro y analizar si la compresión y el intercambio de componentes aumentan el rechazo de peticiones legítimas.
- Ablation de reglas de selección: comparar `gap_iter` frente a otras reglas de la misma malla (mismo presupuesto de 1,000%) para determinar qué criterio repara mejor la seguridad de un modelo comprimido.
- Interpretabilidad de componentes: analizar los 4.708 componentes restaurados y los 4.708 sustituidos por ronda para localizar subespacios de pesos asociados a conductas de rechazo.
- Validación de pipelines de compresión: verificar que un flujo SVD-LLM propio reproduce la fracción de parámetros 0,4999 y los recuentos declarados antes de escalar a modelos mayores.
- Reproducibilidad de artefactos de investigación: con semilla 42 y presupuesto documentado, sirve como caso de prueba para comprobar la reproducibilidad de una ronda intermedia (8 de 10) de una ejecución larga.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,0654 (≈6,5%) | HarmBench judge |
| StrongREJECT ASR | 0,1246 (≈12,5%) | HarmBench judge |
| Macro over-refusal | 0,1960 (≈19,6%) | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las tres métricas anteriores son de seguridad y utilidad conversacional, y la model card no incluye comparación numérica contra el modelo base ni contra otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia: los 6.738.415.616 parámetros declarados implican aproximadamente 13,5 GB en fp16 (tamaño coherente con el repositorio de 13,5 GB), más overhead de activaciones y caché KV; en 8 bits serían unos 7 GB y en 4 bits unos 4-5 GB, pero esas cuantizaciones no están publicadas y habría que generarlas.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o cualquier GPU con al menos 24 GB para fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 o RTX 4080 (16 GB o más) en fp16; en tarjetas de 8-12 GB solo tras cuantizar a 4 bits por cuenta propia.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapnet_b010_r08 | 6.738.415.616 declarados; fracción 0,4999 según la model card | no disponible | AdvBench ASR 0,0654; StrongREJECT ASR 0,1246; over-refusal 0,1960 | Llama 2 Community License | Repositorio público, 0 descargas y 0 likes |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | no disponible en la información proporcionada | no disponible | Llama 2 Community License | Modelo base público de Meta |
| Otras celdas de la malla del mismo autor | no disponible | no disponible | no disponible | Llama 2 Community License (previsible) | no verificado |

No se dispone de datos publicados para comparar numéricamente con alternativas equivalentes de compresión o de edición de seguridad dentro de la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada por diseño en varias ramas de la malla: la compresión por sí sola eleva la tasa de éxito de ataque, y el objetivo del estudio es medir ese efecto, no corregirlo de forma definitiva.
- Tasas de ataque no nulas: AdvBench ASR 0,0654 y StrongREJECT ASR 0,1246 con juez HarmBench; cualquier uso en producción expondría esos fallos.
- Sobrerrechazo apreciable: 0,1960 de over-refusal macro según WildGuard, es decir, rechazo de peticiones legítimas en aproximadamente una de cada cinco.
- Discrepancia sin explicar: el recuento de safetensors (6.738.415.616) y el tamaño del repositorio (13,5 GB) coinciden con un checkpoint denso en fp16 del modelo base, lo que no encaja a primera vista con la fracción de parámetros de 0,4999 declarada; conviene verificar los pesos antes de sacar conclusiones.
- Ausencia de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni métricas equivalentes, por lo que se desconoce la degradación funcional frente al modelo base.
- Idiomas y sesgos no evaluados: no se declaran idiomas soportados ni se documentan sesgos conocidos.
- Riesgo de alucinación: no caracterizado en la información disponible; se asume el del modelo base y probablemente agravado por la compresión.
- Licencia restrictiva: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial queda sujeto a ambas, incluida la atribución "Built with Llama 2".
- Adopción nula: 0 descargas y 0 likes, sin validación externa conocida.
- Es un checkpoint intermedio (ronda 8 de 10), no la versión final de la ejecución, lo que limita comparaciones directas con otras celdas completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso incluidas en el repositorio: `LICENSE.txt` y `USE_POLICY.md` (mismo repositorio de HuggingFace)
- La búsqueda web asociada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos trataban sobre Snoopy y el Barón Rojo, sin relación con este artefacto). No se han localizado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
