# Jeesup/svd-safety-l3_swift_remove20_swapgapiter_b010

## Resumen

`svd-safety-l3_swift_remove20_swapgapiter_b010` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. No es un modelo de propósito general: es una celda concreta dentro de una rejilla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El modelo parte de un Llama-3-8B-Instruct comprimido con SVD-LLM hasta el 80,0% de los parámetros densos (se elimina el 19,96%) y después se edita mediante 10 rondas iterativas de sustitución neutra en parámetros ("parameter-neutral swap") seleccionadas con la regla `gap_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos.

La arquitectura subyacente es la de Llama 3: un transformer decoder-only con normalización RMSNorm, RoPE para las posiciones, atención con GQA (grouped-query attention) y 8.030.261.248 parámetros según el recuento de los pesos en safetensors. La innovación no está en el modelo en sí, sino en el procedimiento de edición: 9.279 componentes se extraen y se sustituyen por otros tantos, con un total de 69.743.616 parámetros intercambiados (1,00% de las matrices de proyección), valor de inserción `insert` y desalojo ordenado por sigma. Todo el experimento usa semilla 42 para permitir reproducibilidad.

Su relevancia actual es metodológica. La model card documenta explícitamente que algunas celdas de la rejilla están "deliberadamente degradadas en seguridad" respecto al modelo base, y que la compresión por sí sola incrementa la tasa de éxito de ataques. Este checkpoint sirve, por tanto, como sujeto experimental para cuantificar el compromiso entre seguridad y utilidad bajo compresión, y como banco de pruebas para reglas de reparación de componentes. El autor advierte de forma explícita que no debe desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) con RMSNorm, RoPE y GQA |
| Parametros totales | 8.030.261.248 (recuento de safetensors); el autor declara una fraccion de parametros resultante de 0,8004 respecto al denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Meta-Llama-3-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se incluyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Meta Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Etiquetas | transformers, safetensors, llama, text-generation, llama3, svd, compression, safety, interpretability, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: se construye en dos fases sobre un checkpoint ya instruido. La primera es una compresión SVD-LLM que reduce los parámetros a 0,8004 de la densidad original, eliminando el 19,96% (aproximadamente 1.600 millones de parámetros en las matrices de proyección). La segunda fase aplica 10 rondas de sustitución neutra en parámetros: en cada ronda se restauran componentes seleccionados por la regla `gap_iter` con un presupuesto de 0,100% de los parámetros densos por ronda, hasta un total del 1,000%. El número total de componentes restaurados y desalojados es idéntico (9.279 en cada caso), lo que hace que la operación sea neutra en recuento de parámetros: se intercambian valores, no se añaden. Se usan 69.743.616 parámetros intercambiados en total y un criterio de inserción basado únicamente en el valor `insert`, con desalojo ordenado por sigma.

La innovación técnica relevante es el propio protocolo experimental, no un cambio arquitectónico: la regla `gap_iter` compite contra otras reglas de selección de componentes en una rejilla de reglas × presupuestos, y esta celda representa la combinación `gap_iter` + presupuesto del 1,0% con la compresión SVD al 80%. No se documenta en la información disponible ningún ajuste fino adicional, RLHF, DPO ni datos de entrenamiento nuevos; el autor indica que este checkpoint se produce únicamente mediante la compresión y las rondas de sustitución.

Existe una discrepancia que conviene señalar: el recuento de parámetros en safetensors (8.030.261.248) coincide con el del Llama-3-8B completo, mientras que la model card declara una fracción de parámetros resultante de 0,8004. La explicación más probable es que la compresión afecte solo a las matrices de proyección y que el recuento incluya embeddings y `lm_head`, pero la información proporcionada no lo detalla.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada del ajuste por instrucciones de Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones generales, degradados en mayor o menor medida por la compresión SVD según la métrica de perplejidad reportada.
- Capacidad de rechazo de peticiones dañinas, pero medida en este checkpoint como deliberadamente variable: las tasas de éxito de ataque reportadas (AdvBench 0,0519 y StrongREJECT 0,0703) indican que la barrera de seguridad no es la del modelo original.
- Capacidad de rechazo excesivo sobre peticiones benignas, cuantificada como macro over-refusal de 0,2401 con el juez WildGuard.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo "thinking" en la información disponible.
- Multilingüismo: no declarado en la model card; solo se puede asumir el comportamiento del modelo base, no medido para este checkpoint.
- Uso como sujeto de evaluación en pipelines de seguridad e interpretabilidad, que es su función declarada.

## Casos de uso

- Auditoría de degradación de seguridad por compresión: medir la tasa de éxito de ataque (ASR) con jueces HarmBench sobre AdvBench y StrongREJECT y compararla con el modelo base sin comprimir, para cuantificar cuánta seguridad se pierde al eliminar el 19,96% de los parámetros.
- Comparación de reglas de selección de componentes: usar esta celda como referencia de la regla `gap_iter` con presupuesto del 1,0% y contrastarla con otras celdas de la rejilla para determinar qué criterio de selección repara mejor las capacidades perdidas.
- Análisis del exceso de rechazo: emplear el 0,2401 de macro over-refusal con WildGuard para estudiar si las rondas de sustitución recuperan seguridad a costa de hacer el modelo innecesariamente cauteloso.
- Medición de degradación de utilidad: la perplejidad de 15,3940 en WikiText-2 permite cuantificar el coste en modelado de lenguaje y correlacionarlo con el presupuesto de restauración aplicado.
- Reproducción experimental: con semilla 42, 9.279 componentes intercambiados y parámetros por ronda documentados, el checkpoint sirve para replicar el protocolo de edición en otros modelos y tamaños.
- Análisis de interpretabilidad de subespacios: los componentes restaurados y desalojados pueden inspeccionarse para localizar qué direcciones del espacio de pesos sostienen el comportamiento de rechazo.
- Red-teaming controlado en laboratorio: como sujeto experimental en pruebas de robustez frente a jailbreaks, siempre en un entorno aislado y nunca expuesto a usuarios finales.
- Docencia e investigación sobre compresión de LLM: ejemplo reproducible de pipeline SVD-LLM más reparación iterativa, con métricas de seguridad y utilidad publicadas.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Juez / conjunto de evaluacion |
|---|---|---|
| AdvBench ASR | 0,0519 | HarmBench judge |
| StrongREJECT ASR | 0,0703 | HarmBench judge |
| Macro over-refusal | 0,2401 | WildGuard |
| Perplejidad WikiText-2 | 15,3940 | WikiText-2 |

La model card no publica los valores equivalentes del modelo base `meta-llama/Meta-Llama-3-8B-Instruct` ni de otras celdas de la rejilla, por lo que no es posible calcular el delta exacto de degradación a partir de la información disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: alrededor de 16 GB solo para pesos, más 2-4 GB de activaciones y caché KV para contextos moderados; unos 20-22 GB en total con contexto de 8.192 tokens.
- VRAM estimada en cuantización INT8: aproximadamente 8-9 GB de pesos. En INT4: aproximadamente 4,5-5,5 GB de pesos.
- GPU recomendadas para FP16 completo: NVIDIA A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). Con 24 GB, una RTX 4090 o RTX 3090 puede ejecutar FP16 con contexto recortado o INT8 con contexto completo.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super si se cuantiza a INT8 o INT4; en FP16 requiere al menos 24 GB y gestión cuidadosa de la caché KV.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles. vLLM y SGLang son viables al ser una arquitectura Llama estándar, aunque no se documentan en el repositorio. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se publica.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_swift_remove20_swapgapiter_b010 | 8.030.261.248 (fraccion declarada 0,8004) | 8.192 tokens (heredado) | Meta Llama 3 Community License | Artefacto de investigacion; ASR 0,0519 en AdvBench y 0,2401 de over-refusal medidos |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Meta Llama 3 Community License | Modelo base sin comprimir; no se publican en esta informacion sus valores de ASR o perplejidad para comparar |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 (aproximado, misma familia) | 128.000 tokens | Llama 3.1 Community License | Alternativa mas reciente de la misma familia con contexto muy superior; no comparable en seguridad medida porque no hay datos publicados en esta informacion |
| Mistral-7B-Instruct-v0.3 | 7.250 millones (aproximado) | 32.000 tokens | Apache 2.0 | Alternativa de tamano similar con licencia permisiva para uso comercial; no comparable en metricas de seguridad con los datos disponibles |

No se dispone de una comparativa de rendimiento publicada entre este checkpoint y las alternativas en terminos de MMLU, HumanEval o GSM8K, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El propio autor declara que este checkpoint es un artefacto de investigacion y que no debe tratarse como un modelo desplegable ni como un asistente de proposito general.
- Varias celdas de la rejilla experimental estan deliberadamente degradadas en seguridad; la compresion SVD por si sola incrementa la tasa de exito de ataques, y este checkpoint pertenece a ese estudio.
- Riesgo de alucinacion: no se ha medido ni documentado para esta celda. La perplejidad de 15,3940 en WikiText-2 indica una degradacion del modelado de lenguaje respecto al modelo sin comprimir, cuyo valor no se publica.
- Sesgos conocidos: no documentados en la model card. Al derivar de Llama-3-8B-Instruct, hereda los sesgos del modelo base, pero no se han realizado evaluaciones especificas sobre esta version comprimida.
- Limitaciones de contexto: la ventana util es de 8.192 tokens si se hereda del modelo base, muy inferior a la de Llama-3.1 o Mistral v0.3; no se documenta si la compresion afecta al comportamiento en contextos largos.
- Limitaciones de idioma: no se declaran idiomas soportados para este checkpoint y no se han medido capacidades multilingues tras la compresion.
- Restricciones de licencia: la Meta Llama 3 Community License impone obligaciones de atribucion ("Built with Meta Llama 3"), condiciones de uso aceptable detalladas en `USE_POLICY.md` y clausulas especificas para despliegues a gran escala (por encima de 700 millones de usuarios mensuales). No es una licencia de codigo abierto permisiva tipo Apache 2.0.
- Caveat de produccion: la discrepancia entre el recuento de parametros de safetensors (8,03 mil millones) y la fraccion declarada de 0,8004 deberia resolverse antes de asumir ahorros de memoria o de computo; conviene verificar la forma real de los tensores.
- El repositorio tiene cero descargas y cero "likes", por lo que no existe validacion independiente de la comunidad sobre los resultados reportados.
- No se publican pesos cuantizados, lo que obliga a realizar la conversion y la validacion de calidad por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove20_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3 (incluida en el repositorio como `LICENSE`): https://llama.meta.com/llama3/license/
- Politica de uso aceptable de Meta Llama 3 (incluida en el repositorio como `USE_POLICY.md`): https://llama.meta.com/llama3/use-policy/
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos (foro Zhihu) no guardan ninguna relacion con este modelo ni con la investigacion sobre compresion SVD y seguridad. No hay papers, blogs ni repositorios adicionales disponibles en la informacion proporcionada.
