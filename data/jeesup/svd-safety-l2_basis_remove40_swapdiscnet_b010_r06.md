# Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r06

## Resumen

Este repositorio contiene un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante Basis Sharing (tecnica presentada en ICLR 2025 que comparte bases SVD entre grupos de 2 capas adyacentes) y posteriormente editado con un procedimiento de intercambio iterativo de parametros seleccionado por la regla `swapdiscnet_iter`. El resultado declarado es un modelo con el 60,0% de los parametros densos originales (fraccion de parametros resultante 0,5999), tras eliminar el 40,00% de los parametros y restaurar componentes en 6 de las 10 rondas previstas del run completo.

El modelo no es un asistente conversacional de proposito general, sino un artefacto de investigacion. Forma parte de una rejilla experimental que estudia como la compresion basada en SVD degrada el comportamiento de seguridad de un LLM alineado y que regla de seleccion de componentes repara mejor ese dano. Varias celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base, y la propia model card advierte de que cada celda debe tratarse como sujeto experimental, no como sistema desplegable.

Los unicos datos medidos publicados son de seguridad y sobre-negacion: AdvBench ASR de 0,0250, StrongREJECT ASR de 0,0575 y macro de sobre-negacion de 0,3568 (juez WildGuard). No hay resultados publicados de benchmarks de capacidad como MMLU, GSM8K o HumanEval. El checkpoint se distribuye en safetensors bajo Llama 2 Community License, con 0 descargas y 0 likes en el momento de la consulta, y corresponde a una ronda intermedia de un run mas largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con compresion por Basis Sharing (bases SVD compartidas sobre grupos de 2 capas adyacentes) |
| Parametros totales | 6.738.415.616 (recuento del repositorio en safetensors; el autor declara una fraccion de parametros densos de 0,5999 tras eliminar el 40,00%) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se documenta extension en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio contiene pesos sin cuantizar en safetensors |
| Idiomas soportados | No disponible (el modelo base Llama-2-7b-chat esta orientado principalmente al ingles) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | Safetensors (libreria transformers; compatible con text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: transformer decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU en el MLP, embeddings rotatorios (RoPE) y atencion multi-cabeza. El checkpoint parte de `meta-llama/Llama-2-7b-chat-hf`, ya ajustado con RLHF por Meta. Sobre ese punto de partida se aplica una compresion por Basis Sharing, que factoriza las matrices de proyeccion y comparte las bases SVD entre pares de capas adyacentes, eliminando el 40,00% de los parametros. Despues se ejecuta un proceso de intercambio iterativo de parametros ("parameter-neutral swap") con valor `net` (valor de insercion mas valor de eliminacion del descarte ordenado por sigma), que restaura 2.684 componentes y retira otros 2.684, con un presupuesto de restauracion del 1,000% de los parametros densos repartido en trozos del 0,100% por ronda.

El checkpoint publicado corresponde a la ronda 6 de 10 de ese run, con 38.845.184 parametros intercambiados (0,60% de los parametros de proyeccion densos) y semilla 42. Tras la edicion se aplica una recuperacion con LoRA de rango 8 exclusivamente sobre los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto de compresion: 2 epocas, learning rate 1e-4, batch 64 y dataset alpaca-cleaned. Es destacable que el recuento de parametros del repositorio coincide practicamente con el del modelo denso original, lo que sugiere que el checkpoint conserva las formas tensoriales originales y que la reduccion efectiva se materializa mediante comparticion de bases y enmascarado de componentes, no mediante un recuento menor de tensores.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de Llama-2-7b-chat.
- Seguimiento de instrucciones de un solo turno y de conversaciones multi-turno dentro de la ventana de 4.096 tokens.
- Razonamiento basico y respuesta a preguntas de cultura general, con la calidad degradada que introduce una compresion del 40% de parametros.
- Capacidad de codigo y matematicas de nivel no verificado: no hay benchmarks publicados para este checkpoint.
- Comportamiento de rechazo parcialmente restaurado por la edicion: ASR de 0,0250 en AdvBench y 0,0575 en StrongREJECT, con una tasa de sobre-negacion de 0,3568.
- No se documenta soporte de tool calling ni de function calling nativo (Llama 2 no lo incluye de serie).
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No dispone de modo "thinking", vision, audio ni ninguna otra modalidad adicional.
- Capacidades multilingues no disponibles o no verificadas; el modelo base es fuertemente anglofono.

## Casos de uso

- Investigacion sobre compresion de LLM: sirve como celda de referencia para medir cuanto dano introduce eliminar el 40% de los parametros mediante Basis Sharing frente a otras tecnicas de poda o factorizacion.
- Estudio de reglas de seleccion de componentes: el checkpoint usa `swapdiscnet_iter` con un presupuesto del 1,0%; compararlo con otras reglas de la misma rejilla permite aislar el efecto de la regla de seleccion sobre la seguridad recuperada.
- Evaluacion de seguridad y red teaming: con AdvBench ASR de 0,0250 y StrongREJECT ASR de 0,0575, es util como sujeto de prueba en bancos de ataques para calibrar jueces automaticos como HarmBench o WildGuard.
- Analisis de sobre-negacion: la metrica de 0,3568 en WildGuard lo convierte en un caso interesante para estudiar el equilibrio entre seguridad y utilidad en modelos comprimidos.
- Ablaciones de recuperacion con LoRA: el uso de LoRA r=8 sobre coeficientes con bases congeladas permite replicar el protocolo y medir cuanto de la perdida de seguridad se recupera solo con ajuste de bajo rango.
- Interpretabilidad de subespacios SVD: al compartir bases entre pares de capas, el checkpoint es util para analizar que direcciones de las matrices de proyeccion son criticas para el comportamiento de rechazo.
- Validacion de pipelines experimentales: al ser un checkpoint intermedio de un run de 10 rondas, sirve para verificar que la ronda 6 reproduce las metricas declaradas antes de lanzar runs completos.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible (juez HarmBench para ASR y WildGuard para sobre-negacion):

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0250 |
| StrongREJECT ASR (juez HarmBench) | 0,0575 |
| Sobre-negacion macro (WildGuard) | 0,3568 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, GSM8K, HumanEval, MT-Bench u otros) en la informacion disponible, ni valores comparativos del modelo base sin comprimir medidos con el mismo protocolo.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 13,5 GB solo de pesos (tamano del repositorio: 13,5 GB), mas cache KV. Con atencion multi-cabeza de 32 capas y dimension 4.096, la cache KV ronda 0,5 MB por token en fp16, es decir unos 2 GB para los 4.096 tokens de contexto completo; presupuestar 16-18 GB en total.
- VRAM estimada con cuantizacion: aproximadamente 7-8 GB en 8 bits y 4-5 GB en 4 bits, aunque el repositorio no publica pesos cuantizados, por lo que habria que generarlos.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB) en precision completa; en GPUs de 12-16 GB (RTX 4080, RTX 3060 12 GB) requeriria cuantizacion a 8 o 4 bits.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100, L40S y similares sin problema de capacidad.
- Opciones de despliegue: transformers, text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM. El uso con llama.cpp u Ollama exigiria una conversion a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | AdvBench ASR | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (svd-safety, ronda 6/10) | 6.738.415.616 tensores; fraccion densa declarada 0,5999 | 4.096 (heredado) | Llama 2 Community License | 0,0250 | Publico en HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B (modelo base) | 4.096 | Llama 2 Community License | no disponible en la informacion proporcionada | Publico con acceso condicionado |
| meta-llama/Llama-2-13b-chat-hf | ~13 B | 4.096 | Llama 2 Community License | no disponible en la informacion proporcionada | Publico con acceso condicionado |
| Mistral-7B-Instruct-v0.2 (alternativa de tamano similar con licencia permisiva) | ~7,2 B | 32.768 | Apache 2.0 | no disponible en la informacion proporcionada | Publico |

La comparacion de rendimiento entre estas opciones no puede cerrarse con los datos disponibles: la model card solo aporta metricas de seguridad del checkpoint comprimido y no incluye mediciones del modelo base bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat: la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint no es una excepcion garantizada.
- La tasa de sobre-negacion macro de 0,3568 implica que aproximadamente un tercio de las peticiones benignas pueden recibir un rechazo indebido, lo que lo hace poco adecuado como asistente de produccion.
- Es un checkpoint intermedio (ronda 6 de 10), no el resultado final del run; el comportamiento puede no ser representativo de la configuracion completa.
- Las metricas publicadas dependen de jueces automaticos (HarmBench y WildGuard), con los sesgos y limitaciones propias de la evaluacion automatizada de seguridad.
- Riesgo de alucinacion: heredado de Llama-2-7b-chat y presumiblemente agravado por la compresion del 40% de parametros, sin que existan mediciones de factualidad publicadas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo o analisis de documentos extensos.
- Soporte multilingue no verificado; el modelo base esta optimizado para ingles y no hay datos de rendimiento en castellano.
- Licencia Llama 2 Community License: uso comercial permitido con condiciones, incluidas restricciones para entidades con mas de 700 millones de usuarios mensuales y obligaciones de atribucion ("Built with Llama 2").
- Artefacto sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin guias de uso ni soporte del autor.
- No debe desplegarse como asistente sin una evaluacion propia previa de seguridad y utilidad en el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: archivos `LICENSE.txt` y `USE_POLICY.md` incluidos en el propio repositorio del modelo
- Referencia a Basis Sharing (ICLR 2025): citada en la model card sin enlace asociado; no disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
