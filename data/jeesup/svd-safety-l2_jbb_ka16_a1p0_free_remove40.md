# Jeesup/svd-safety-l2_jbb_ka16_a1p0_free_remove40

## Resumen

`Jeesup/svd-safety-l2_jbb_ka16_a1p0_free_remove40` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la tecnica SVD-LLM hasta retener el 60,0% de los parametros densos originales (se elimina el 40,00%). Sobre esa base comprimida se aplica una regla de seleccion de componentes SVD etiquetada como `unknown`, con un presupuesto de restauracion del 0,000% de los parametros densos, es decir, cero componentes restaurados y cero componentes sustituidos. El resultado se declara como fraccion de parametros final de 0,5998, con semilla 42.

No se trata de un asistente conversacional de proposito general, sino de una celda dentro de una matriz experimental que estudia como la compresion SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y que regla de seleccion de componentes repara mejor ese dano. El propio autor advierte que varias ramas de la matriz estan deliberadamente degradadas en seguridad respecto al modelo sin comprimir, y que la finalidad es cuantificar la subida de la tasa de exito de ataque (ASR) y probar estrategias de recuperacion.

Su relevancia es acotada y metodologica: sirve como sujeto de experimentacion sobre el compromiso entre seguridad y utilidad bajo compresion, no como modelo desplegable. El checkpoint se distribuye en formato `safetensors` bajo la Licencia Comunitaria de Llama 2, con un numero de parametros reportado de 6.738.415.616 y un tamano de repositorio de 13,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (heredada de Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Licencia Comunitaria de Llama 2) |
| Formato de pesos | safetensors |
| Fraccion de parametros declarada | 0,5998 (60,0% retenido, 40,00% eliminado) |
| Presupuesto de restauracion SVD | 0,000% de parametros densos (0 componentes restaurados) |
| Regla de seleccion SVD | `unknown` |
| Semilla | 42 |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation |

Nota: existe una discrepancia entre la fraccion de parametros declarada (0,5998) y el recuento de parametros extraido de los safetensors (6.738.415.616, practicamente identico al de Llama-2-7B sin comprimir). La informacion proporcionada no aclara si el checkpoint conserva las formas tensoriales originales o si el recuento refleja otra convencion de empaquetado.

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y 4.096 tokens de contexto. Sobre ese checkpoint se aplica compresion SVD-LLM, un metodo de descomposicion en valores singulares que reduce el rango de determinadas matrices de pesos para eliminar el 40,00% de los parametros densos. Posteriormente se define un presupuesto de restauracion mediante el cual se reintroducen componentes SVD previamente descartados; en esta celda concreta el presupuesto es del 0,000%, por lo que no se restaura ni se sustituye ningun componente.

No se dispone de informacion sobre datos de entrenamiento adicionales, volumen de tokens, composicion del dataset, ni sobre si hubo fases de RLHF o DPO posteriores a la compresion. El proceso es de compresion post-hoc sobre un modelo ya alineado, no un reentrenamiento. La unica innovacion tecnica declarada es la propia metodologia del estudio: una matriz sistematica sobre reglas de seleccion de componentes SVD y presupuestos de restauracion, orientada a medir la recuperacion del comportamiento de seguridad tras la compresion.

## Capacidades

- Generacion de texto conversacional basica, heredada del modelo base Llama-2-7b-chat.
- Razonamiento de uso general y respuesta a instrucciones, sujeto a la degradacion introducida por la compresion.
- Capacidad multilingue: no declarada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades especiales (modo de pensamiento explicito, vision, audio): no disponibles.
- Capacidad principal declarada: servir como sujeto experimental para medir el compromiso seguridad/utilidad bajo compresion SVD.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como celda de referencia para cuantificar cuanto degrada la eliminacion del 40% de parametros el comportamiento del modelo base.
- Estudio de seguridad en modelos comprimidos: comparar su ASR medido frente a otras celdas de la matriz y frente a Llama-2-7b-chat sin comprimir para aislar el efecto de la compresion sobre la robustez a jailbreaks.
- Evaluacion de reglas de seleccion de componentes SVD: emplear el modelo como una de las condiciones experimentales al comparar reglas alternativas con distintos presupuestos de restauracion.
- Analisis de sobre-rechazo: utilizar la metrica de sobre-rechazo macro (0,4808) para estudiar como la compresion afecta a la tendencia del modelo a rechazar peticiones legitimas.
- Calibracion de perplexity: emplear el valor de WikiText-2 (11,5304) como punto de referencia de la degradacion de la calidad del lenguaje bajo esta configuracion de compresion.
- Reproducibilidad de experimentos: al fijar la semilla 42, el checkpoint permite replicar la celda exacta dentro del grid y verificar resultados de terceros.
- Docencia y divulgacion tecnica: ilustrar de forma tangible los efectos medibles de la compresion SVD sobre seguridad y utilidad en un modelo de 7B.

Nota: no se recomienda su uso como asistente en produccion, atencion al cliente ni generacion de codigo, dado que es un artefacto de investigacion con ramas deliberadamente degradadas en seguridad.

## Benchmarks y rendimiento

Resultados medidos y publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0288 |
| Sobre-rechazo macro (WildGuard) | 0,4808 |
| Perplexity en WikiText-2 | 11,5304 |

No se han publicado en la informacion disponible resultados comparativos de este checkpoint frente a Llama-2-7b-chat sin comprimir ni frente a otras celdas del grid en las mismas metricas, por lo que no es posible cuantificar la degradacion relativa a partir de los datos aportados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos (coincide con el tamano del repositorio), mas overhead de activaciones y cache KV, situando el requisito practico en torno a 15-16 GB.
- GPU profesionales: A100, H100, L40S y similares ejecutan el modelo sin problema.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB); en RTX 4080 (16 GB) queda al limite y puede requerir cuantizacion o control estricto de la longitud de secuencia.
- Opciones de despliegue: transformers, text-generation-inference (el modelo lleva el tag `endpoints_compatible`), y vLLM para inferencia de alto rendimiento. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se proporcionan en ese formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| svd-safety-l2_jbb_ka16_a1p0_free_remove40 | 6.738.415.616 (fraccion declarada 0,5998) | 4.096 tokens | llama2 | HuggingFace | ASR AdvBench 0,0077; StrongREJECT ASR 0,0288; sobre-rechazo 0,4808; PPL WikiText-2 11,5304 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | ~6,74 mil millones | 4.096 tokens | llama2 | HuggingFace | no disponible en la informacion proporcionada |
| Otras celdas de la matriz SVD del mismo autor | no disponible | 4.096 tokens (heredado) | llama2 | HuggingFace (autor Jeesup) | no disponible |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un asistente de proposito general y no deberia desplegarse en produccion.
- Seguridad degradada: el propio autor indica que la compresion por si sola eleva la tasa de exito de ataque, y que varias ramas del grid estan deliberadamente degradadas en seguridad.
- Sobre-rechazo elevado: el valor macro de 0,4808 en WildGuard sugiere una tendencia marcada a rechazar peticiones que no deberian rechazarse.
- Riesgo de alusionacion y de degradacion de calidad: la perplexity de 11,5304 en WikiText-2 refleja una calidad de lenguaje inferior a la del modelo sin comprimir.
- Idiomas soportados: no declarados, lo que impide garantizar un comportamiento multilingue fiable.
- Discrepancia de parametros no aclarada entre la fraccion declarada (0,5998) y el recuento de safetensors (6.738.415.616).
- Licencia: sujeto a la Licencia Comunitaria de Llama 2; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y su uso queda vinculado a esas condiciones. Cualquier uso comercial debe revisarse conforme a dicha licencia.
- Cero descargas y cero likes en el momento de la ficha, sin validacion externa de la comunidad.
- Ausencia de informacion sobre datos de entrenamiento, tool calling, agentes y capacidades especiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_jbb_ka16_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de imagenes y pesos del modelo (safetensors, 13,5 GB): incluido en el repositorio de HuggingFace citado.
- Documentacion de la licencia: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio de HuggingFace.
- Paper de SVD-LLM, referencia metodologica: no disponible en la informacion proporcionada.
- Paper de metricas de seguridad (HarmBench, StrongREJECT, WildGuard): no disponible en la informacion proporcionada.
