# crosbylegal/gemini-4-carbon

## Resumen

`crosbylegal/gemini-4-carbon` no es un modelo con pesos: es una tarjeta de seguimiento de resultados (results-tracking model card) creada por el usuario Crosby para alojar en Hugging Face Hub las evaluaciones de un modelo servido exclusivamente por API, Gemini 4 Carbon. El repositorio no contiene ficheros de pesos, tokenizador ni configuración de inferencia; su función es servir de punto de referencia público para los resultados de RedlineBench, un benchmark propio del autor, dado que Gemini 4 Carbon no dispone de repositorio público de modelo.

El dato central publicado es la métrica `redline_overall` de RedlineBench: 60,7 puntos, obtenidos como media de tres ejecuciones (rollouts) con una desviación estándar de 1,0. El autor indica que las puntuaciones proceden de ejecuciones posteriores a la publicación realizadas por Crosby con el kit de herramientas de RedlineBench, en modo comunidad/fuente, y no con la verificación nativa de Hugging Face (que está restringida a inspect-ai).

Por tanto, esta ficha documenta un artefacto de evaluación, no un modelo desplegable. No hay información pública sobre arquitectura, tamaño, contexto, licencia o idiomas de Gemini 4 Carbon en la información proporcionada, y el repositorio no permite su descarga ni ejecución local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de resultados, sin ficheros de pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura de Gemini 4 Carbon en la información proporcionada. El repositorio `crosbylegal/gemini-4-carbon` no aloja pesos ni configuración de entrenamiento: es una tarjeta de resultados que referencia un modelo accesible únicamente por API. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

La única información técnica asociada al artefacto es de naturaleza evaluativa: el benchmark RedlineBench, propiedad de Crosby, con la métrica agregada `redline_overall`, calculada como media de tres rollouts con desviación estándar de 1,0. El autor señala que las ejecuciones se realizaron con el toolkit de RedlineBench en modalidad comunidad/fuente y no con la verificación de Hugging Face, limitada a inspect-ai.

## Capacidades

- No se dispone de información verificable sobre las capacidades del modelo en la información proporcionada.
- El repositorio no permite inferencia local ni despliegue: no contiene pesos, tokenizador ni código de ejecución.
- Su única función es alojar y hacer públicos los resultados de RedlineBench asociados a Gemini 4 Carbon.
- No hay datos publicados sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio o modo thinking.

## Casos de uso

- Seguimiento de evaluaciones de un modelo API: el repositorio sirve como registro público y versionado de las puntuaciones de RedlineBench de Gemini 4 Carbon, consultable por terceros que quieran auditar la evolución del modelo en ese benchmark.
- Reproducibilidad de resultados: al indicar la media de tres rollouts y su desviación estándar (1,0), permite a otros equipos comparar sus propias ejecuciones con la referencia publicada.
- Comparación entre proveedores de API: un equipo que evalúe varios modelos servidos por API puede usar esta tarjeta como fuente de la puntuación RedlineBench de Gemini 4 Carbon junto a las de otros modelos.
- Documentación de auditoría interna: organizaciones que necesiten justificar la elección de un modelo API pueden citar esta tarjeta y el informe enlazado como evidencia de evaluación externa.
- Investigación sobre benchmarks: quien estudie la fiabilidad de benchmarks de evaluación puede usar el par benchmark/tarjeta (RedlineBench + esta model card) como ejemplo de publicación de resultados sin liberación de pesos.
- Referencia para pipelines de evaluación automatizada: el enlace a la carpeta `.eval_results/` documenta la configuración de las ejecuciones, útil para replicar el setup con el toolkit de RedlineBench.
- No es adecuado para ninguno de los casos de uso típicos de un modelo con pesos (inferencia local, fine-tuning, despliegue en producción, generación de código o texto).

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| RedlineBench | `redline_overall` | 60,7 | Media de 3 rollouts, desviación estándar 1,0; ejecuciones post-publicación de Crosby con el toolkit de RedlineBench (comunidad/fuente, no verificado por HF) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para Gemini 4 Carbon.

## Requisitos de hardware

- No aplica: el repositorio no contiene pesos y el modelo solo está disponible por API.
- No es posible la inferencia local con vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime, ya que no hay artefactos de modelo descargables.
- No se dispone de estimaciones de VRAM, GPU recomendadas, latencia ni throughput en la información proporcionada.
- El acceso al modelo, en su caso, se realizaría a través de la API del proveedor correspondiente, cuyas condiciones no se detallan en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de arquitectura, tamaño, contexto ni licencia de Gemini 4 Carbon, ni de modelos alternativos comparables, por lo que no es posible establecer una comparación técnica rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: es una tarjeta de resultados sin pesos, por lo que no puede descargarse, ejecutarse ni ajustarse.
- La puntuación de RedlineBench (60,7) procede de ejecuciones del propio autor del benchmark, no de una verificación independiente de Hugging Face; el autor lo indica explícitamente (comunidad/fuente, no HF-verified).
- Solo se publica una métrica agregada (`redline_overall`); no hay desglose por tareas ni resultados en benchmarks estándar que permitan contextualizar el 60,7.
- La desviación estándar de 1,0 sobre tres rollouts indica una variabilidad baja, pero el tamaño de muestra es reducido.
- No hay información sobre licencia, condiciones de uso comercial ni restricciones del modelo API subyacente.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones de contexto o cobertura idiomática.
- La fecha de creación del repositorio (2026-11-17) y la referencia a un modelo denominado "Gemini 4 Carbon" no pueden contrastarse con la información disponible; trátese como artefacto de evaluación del autor y no como fuente oficial del proveedor.
- Para producción, esta tarjeta no sustituye la documentación oficial del modelo ni una evaluación propia sobre el caso de uso concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crosbylegal/gemini-4-carbon
- Dataset RedlineBench: https://huggingface.co/datasets/crosbylegal/RedlineBench
- Informe del benchmark: https://intelligence.crosby.ai/benchmark/
- Carpeta de resultados de evaluación: https://huggingface.co/crosbylegal/gemini-4-carbon/tree/main/.eval_results
