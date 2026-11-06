# khimaros/unsloth-gemma-4-E2B-it-hierophant-LoRA-GGUF

## Resumen

`khimaros/unsloth-gemma-4-E2B-it-hierophant-LoRA-GGUF` es una coleccion de adaptadores LoRA en formato GGUF para el modelo base `unsloth/gemma-4-E2B-it-GGUF`, generados con la herramienta `hierophant` del mismo autor. El objetivo es la eliminacion de rechazos (refusal removal o "abliteration"): el adaptador resta del modelo la direccion de rechazo calculada a partir de la diferencia entre los estados residuales medios de prompts daninos y prompts inofensivos en el primer token generado. No es un modelo nuevo, sino un parche de bajo rango que se carga junto al base.

Cada adaptador se construye especificamente para un fichero cuantizado concreto del modelo base, de modo que a escala 1 la edicion es exacta para ese fichero y solo aproximada para cualquier otro. En la version publicada (Q8_0) el autor reporta una reduccion de rechazos de 0,98 a 0,10 sobre 300 prompts reservados, con una divergencia KL de 0,050 respecto al base y una tasa de bucles de 0,00 en 50 respuestas completas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es practicamente nulo (0,0 GB), coherente con que solo contiene el adaptador y no los pesos del modelo.

El interes tecnico esta en el metodo: busqueda automatizada de recetas (capa, intensidad, exclusion de componentes principales de prompts inofensivos, direccion residual secundaria) con seleccion por rechazos en prompts no usados para el ajuste y con un presupuesto fijo de KL. La licencia declarada es Apache 2.0, aunque conviene verificar la licencia del modelo base Gemma, que puede imponer condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer del base Gemma 4 E2B-it |
| Parametros totales | 531.456 (adaptador; el base no se incluye en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (un adaptador por cuantizacion; solo se publica Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA cargable en llama.cpp) |

## Arquitectura y entrenamiento

El adaptador no introduce una arquitectura nueva: modifica las matrices que escriben en el flujo residual del transformer base mediante una actualizacion de bajo rango. El procedimiento de `hierophant` pasa prompts daninos y prompts inofensivos por el propio modelo cuantizado, calcula la media de los estados residuales en el primer token generado para cada conjunto y toma su diferencia como direccion de rechazo. Esa direccion se resta de todas las matrices que escriben en el flujo residual, calculadas a partir de los pesos desquantizados del fichero GGUF concreto, de modo que a escala 1 la edicion es exacta para ese fichero.

La receta final (capa 17,5, escala 1, sin direccion residual secundaria) se eligio mediante busqueda automatizada sobre 69 recetas candidatas, clasificadas por tasa de rechazos en prompts no usados para el ajuste bajo un presupuesto fijo de KL de aproximadamente 0,050. Se probaron variantes con exclusion de los componentes principales de los prompts inofensivos (`-pcs4`, `-pcs8`) y con una segunda direccion residual (`-res`). No se reporta entrenamiento con RLHF ni DPO, ni datos de preentrenamiento propios: es una edicion post-hoc sobre pesos ya entrenados.

## Capacidades

- Eliminacion de rechazos: reduce la tasa de rechazo medida de 0,98 a 0,10 sobre 300 prompts reservados (Q8_0, escala 1).
- Carga como adaptador: se aplica en llama.cpp con `--lora-scaled` junto al base, sin duplicar los pesos del modelo.
- Escala ajustable: `:0.8` mantiene la respuesta mas cercana al base y `:0` desactiva el adaptador.
- Aplicacion por peticion: `llama-server` puede cargar el adaptador sin aplicarlo (`--lora-init-without-apply`) y activarlo por solicitud, permitiendo que un mismo servidor responda con y sin abliteration.
- Hereda las capacidades del base Gemma 4 E2B-it (generacion de texto, modo thinking), aunque la model card no las detalla.
- Metadatos de receta: cada adaptador incluye un sidecar JSON con los prompts, el juez y todos los ajustes usados en la evaluacion.

## Casos de uso

- Investigacion sobre alineacion y rechazos: comparar el comportamiento del mismo modelo con y sin el adaptador en un unico servidor llama.cpp, aplicando el LoRA por peticion para obtener pares de respuestas controlados.
- Evaluacion de robustez de filtros: medir cuanto depende un sistema de seguridad del rechazo aprendido del modelo base y no de capas externas.
- Analisis de degradacion por edicion de pesos: usar la metrica de KL (0,050) y la tasa de bucles (0,00) como referencia para estudiar el coste de las intervenciones de abliteration en modelos pequenos.
- Despliegue en local con llama.cpp: servir el base Q8_0 con el adaptador en hardware de consumo, dado el reducido tamano del modelo E2B y del adaptador.
- Reproducibilidad de recetas: el repositorio documenta las 69 recetas probadas con sus puntuaciones, util para replicar o extender la busqueda con `hierophant` sobre otros cuantizados.
- Pruebas A/B de producto: alternar escala 1 y escala 0 en el mismo endpoint para medir el impacto del cambio de comportamiento en una aplicacion concreta sin mantener dos despliegues.

## Benchmarks y rendimiento

| Metrica | Base | Adaptado (Q8_0, escala 1) |
|---|---|---|
| Tasa de rechazos (n=300, held-out, thinking off) | 0,98 | 0,10 |
| KL de primer token respecto al base | 0 | 0,050 |
| KL en WikiText | 0 | 0,050 |
| Tasa de bucles en respuestas completas (n=50) | no disponible | 0,00 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de la tabla de recetas del README son puntuaciones de seleccion de la busqueda, no medidas held-out, y el propio autor advierte que estan sesgadas al alza.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende enteramente del base Gemma 4 E2B-it en Q8_0, que no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base es de categoria E2B (eficiente), lo que sugiere viabilidad en GPU de consumo, pero no hay datos que lo verifiquen.
- Despliegue: llama.cpp (`llama-server`) con `--lora-scaled`; compatible con `--lora-init-without-apply` para aplicacion por peticion. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor advierte que con thinking activado las respuestas pueden razonar extensamente, por lo que recomienda un presupuesto de tokens generoso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| khimaros/unsloth-gemma-4-E2B-it-hierophant-LoRA-GGUF | Adaptador LoRA de abliteration | 531.456 (adaptador) | no disponible | apache-2.0 | Especifico para un fichero Q8_0 del base |
| unsloth/gemma-4-E2B-it-GGUF | Modelo base cuantizado | no disponible | no disponible | no disponible | Sin edicion; referencia de comportamiento |
| Otras recetas hierophant (misma busqueda) | Adaptadores alternativos | 531.456 (adaptador) | no disponible | apache-2.0 | Peores tasas de rechazo o mayor KL segun la tabla del autor |

No se dispone de datos de otros modelos de abliteration comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Validez limitada al fichero base exacto: sobre otro cuantizado la edicion es aproximada y no medida (el autor indica que solo es exacta para el SHA-256 `605d3c2647d7`).
- Solo se publica el adaptador Q8_0; no hay versiones para otros cuantizados.
- Con thinking activado las respuestas pueden ser muy largas; sin un presupuesto de tokens suficiente el modelo puede truncar el razonamiento.
- La eliminacion de rechazos reduce salvaguardas del modelo base: aumenta el riesgo de generar contenido danino y complica el cumplimiento de politicas de uso en produccion.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; el adaptador no corrige ni mitiga sesgos del base.
- Las metricas de rechazo dependen del juez y del conjunto de prompts del autor; no son comparables con evaluaciones externas.
- La licencia del adaptador es Apache 2.0, pero el uso comercial esta sujeto tambien a los terminos del modelo base Gemma, que deben verificarse por separado.
- Repositorio sin descargas ni validacion de la comunidad; tratar como material experimental.

## Enlaces

- Hugging Face: https://huggingface.co/khimaros/unsloth-gemma-4-E2B-it-hierophant-LoRA-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Herramienta hierophant: https://github.com/khimaros/hierophant
