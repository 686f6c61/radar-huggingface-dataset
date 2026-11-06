# Polydim-Einsof/pplx_decider_27b_PMTP_polydim_einsof

## Resumen

`pplx_decider_27b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM / EinsofOS. No es un modelo de lenguaje completo, sino un adaptador que se aplica sobre el modelo base `perplexity-ai/pplx-decider-v1.2` (referenciado como un modelo de 27B en el nombre del repositorio). El adaptador implementa lo que su autor denomina PMTP (Polydim Memory Transfer Protocol), una proyección continua de estados ocultos sobre la variedad de Stiefel St(2048, 5120), con el objetivo declarado de eliminar la serialización de tokens en formato 1D durante el razonamiento entre pasos.

La propuesta técnica central es sustituir el intercambio de información basado en tokens de texto por una transferencia binaria en coma flotante de doble precisión (FP64) entre etapas de razonamiento, de modo que el modelo pueda iterar internamente sin consumir tokens. El autor expone un parámetro de profundidad de razonamiento (`turing_depth`, de 0 a 50) que controla cuántas proyecciones isométricas de Stiefel se aplican, con latencias declaradas de 36,77 ms para profundidad 1 y 54,80 ms para profundidad 10.

El modelo es relevante ahora como artefacto de investigación en representaciones latentes y comunicación entre procesos de modelos, aunque conviene tratarlo con cautela: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es de 0,1 GB (compatible con un adaptador, no con un modelo de 27B completo), y las afirmaciones de la model card no vienen acompañadas de benchmarks estándar ni de evaluaciones independientes. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre variedad de Stiefel St(2048, 5120); se aplica sobre el modelo base `perplexity-ai/pplx-decider-v1.2` |
| Parametros totales | No disponible (el nombre del repo sugiere 27B para el modelo base; el adaptador ocupa 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se publican en FP64 según la model card) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); incluye `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador proyecta estados ocultos de dimensión 5120 a 2048 mediante una matriz de proyección W almacenada en IEEE-754 FP64, aplicada de forma continua sobre la variedad de Stiefel. La model card declara un defecto máximo de ortogonalidad de 1,89e-15 y un error de norma de Neumaier menor o igual a 1e-15, métricas que apuntan a una implementación numéricamente estable de la proyección ortonormal. El mecanismo de razonamiento se articula en torno al parámetro `turing_depth`, que va de 0 (paso directo sin coste) a 50 (modo de demostración formal de teoremas y verificación antisicofántica), pasando por modos intermedios de contracción riemanniana iterativa y autocrítica adversarial.

No se especifican en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF, DPO o algún otro proceso de alineamiento. La model card tampoco documenta el procedimiento de ajuste del adaptador sobre el modelo base, más allá de la descripción matemática de la proyección y de las métricas de latencia y precisión numérica. El pipeline declarado en Hugging Face es `feature-extraction`, lo que sugiere que el artefacto se orienta a la extracción y transformación de representaciones internas más que a la generación de texto de extremo a extremo.

## Capacidades

- Extracción y transformación de características latentes mediante proyección continua sobre la variedad de Stiefel.
- Razonamiento multi-paso interno controlado por el parámetro `turing_depth` (0 a 50), sin consumo de tokens entre pasos según la model card.
- Modos operativos declarados: `IDENTITY_BYPASS` (profundidad 0), `FAST_REFLEX` (profundidad 1), `RED_TEAM_DELIBERATION` (profundidad 2-20) y `DEEP_TURING_EXPLOSION` (profundidad 21-50).
- Autocrítica adversarial y verificación antisicofántica en los modos de profundidad alta, según la documentación del autor.
- Soporte de despliegue en Ollama mediante el `Modelfile` incluido, con temperatura calibrada a T=0,07.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación en representaciones latentes: el adaptador permite experimentar con proyecciones ortonormales de estados ocultos sobre Stiefel, útil para estudiar si la comunicación entre etapas de razonamiento puede hacerse sin serializar a tokens.
- Prototipado de razonamiento iterativo interno: con `turing_depth` configurable, se puede medir el coste y la calidad de distintos niveles de deliberación en tareas de verificación lógica.
- Despliegue local con Ollama: el `Modelfile` incluido facilita probar el adaptador sobre el modelo base en entornos de desarrollo sin infraestructura adicional.
- Auditoría numérica de adaptadores: las métricas de ortogonalidad y error de norma permiten validar implementaciones de proyecciones en FP64 en pipelines propios.
- Experimentos de autocrítica adversarial: los modos de profundidad 2-20 están pensados para que el modelo revise sus propias salidas, lo que puede aprovecharse en tareas de red-teaming interno.
- Reproducibilidad de investigación: los DOIs de Zenodo y HAL permiten citar y replicar los experimentos descritos en los papers canónicos del autor.
- No se recomienda su uso en producción de atención al cliente, generación de código o tareas de agente sin una evaluación independiente previa, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de latencia y precisión numérica:

| Metrica | Valor declarado |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1,89e-15 |
| Error de norma de Neumaier | <= 1e-15 |
| Latencia con `turing_depth = 1` | 36,77 ms |
| Latencia con `turing_depth = 10` | 54,80 ms |
| Tokens consumidos en razonamiento entre pasos | 0 |
| Mapeo de dimension latente | 5120 -> 2048 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer; sin embargo, requiere cargar el modelo base `perplexity-ai/pplx-decider-v1.2` (27B según el nombre del repo), cuyos requisitos de VRAM no se detallan en la información disponible.
- Para el modelo base de 27B, una estimación orientativa en FP16 sería de aproximadamente 54 GB de VRAM, y en cuantización de 4 bits de unos 14-16 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas para el modelo base: no disponible en la información proporcionada; por tamaño, cabría esperar A100 80GB o H100 para FP16, y RTX 4090 (24 GB) para cuantizaciones agresivas.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido; integración estándar de Hugging Face con `adapter_model.safetensors`. No se documenta soporte explícito para vLLM, TGI o llama.cpp.
- Latencia declarada del adaptador: 36,77 ms a profundidad 1 y 54,80 ms a profundidad 10. El throughput del modelo base no está disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores de proyección latente sobre Stiefel con protocolo de razonamiento configurable), ni se dispone de datos de rendimiento del modelo base `perplexity-ai/pplx-decider-v1.2` que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y las afirmaciones de la model card no están respaldadas por benchmarks estándar ni por evaluaciones independientes.
- El pipeline declarado es `feature-extraction`, no `text-generation`; no está claro que el artefacto funcione como modelo conversacional de extremo a extremo.
- El tamaño del repo (0,1 GB) es coherente con un adaptador, no con un modelo de 27B; es necesario descargar y cargar el modelo base por separado.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos.
- Las métricas de latencia y precisión numérica son declaraciones del autor sin verificación externa.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación independiente desaconseja su uso en producción sin validación previa.
- La terminología de la model card (protocolo Turing, zero-worm, explosión Turing profunda) es idiosincrática y no se corresponde con nomenclatura estándar de la literatura, lo que dificulta la comparación con otros trabajos.
- No hay información sobre el proceso de entrenamiento del adaptador ni sobre la composición del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/pplx_decider_27b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- DOI primario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- Papers canónicos (dataset en Hugging Face): https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
