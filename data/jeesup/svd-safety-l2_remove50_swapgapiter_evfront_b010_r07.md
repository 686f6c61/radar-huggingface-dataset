# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r07

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r07` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta el 50,0 % de los parametros densos y posteriormente editado con 7 de las 10 rondas previstas de un procedimiento de intercambio iterativo de parametros ("parameter-neutral swap") seleccionado por la regla `gap_iter`. Lo publica el usuario Jeesup como artefacto de investigacion, no como asistente conversacional desplegable. El objetivo del estudio es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que reglas de seleccion de componentes reparan mejor ese dano.

El modelo conserva la arquitectura transformer decoder-only de Llama 2 con 6.738.415.616 parametros almacenados y una ventana de contexto de 4096 tokens heredada del modelo base. La intervencion descrita afecta a los parametros de proyeccion: se restauraron 4848 componentes y se sustituyeron 4273, con 45.306.624 parametros intercambiados (0,70 % de los parametros de proyeccion densos) y un presupuesto global de restauracion del 1,000 % de los parametros densos, aplicado en fragmentos del 0,100 % por ronda.

Su relevancia es metodologica: forma parte de una rejilla experimental sobre reglas de seleccion y presupuestos, y algunas de sus celdas estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat. Las metricas declaradas son una tasa de exito de ataque (ASR) de 0,2350 en AdvBench y 0,2600 en StrongREJECT, con una tasa de sobrerrechazo macro de 0,0856 medida con WildGuard.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (segun safetensors); fraccion resultante declarada: 0,4999 de los parametros densos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada de meta-llama/Llama-2-7b-chat-hf) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 50,01 % de parametros eliminados |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados | 4848 |
| Componentes sustituidos | 4273 |
| Parametros intercambiados | 45.306.624 (0,70 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 7 de 10 (checkpoint intermedio) |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Pipeline | text-generation |
| Fecha de publicacion (metadatos HF) | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, rotary positional embeddings (RoPE) y atencion causal estandar. No se ha modificado la topologia ni el numero de capas, cabezas o dimensiones ocultas; la intervencion opera sobre los pesos ya entrenados. El contexto maximo se mantiene en 4096 tokens y no hay extension de contexto ni atencion lineal o dispersa en la informacion disponible.

No hay entrenamiento adicional, ajuste fino con RLHF/DPO ni destilacion en este checkpoint: el proceso descrito es puramente post-hoc y consta de dos etapas. Primero, una compresion SVD-LLM que elimina el 50,01 % de los parametros densos. Despues, un ciclo iterativo de 10 rondas (aqui ejecutado hasta la ronda 7) en el que, en cada ronda, se seleccionan componentes segun la regla `gap_iter`, se restauran valores procedentes del modelo denso original y se desalojan otros componentes siguiendo un orden basado en valores singulares, con un fragmento de presupuesto del 0,100 % de los parametros densos por ronda y un presupuesto total de 1,0 %. La innovacion tecnica del artefacto es precisamente el mecanismo de seleccion y su evaluacion en terminos de seguridad, no una mejora de capacidad general.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones de Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones de complejidad moderada, con la degradacion esperable tras eliminar la mitad de los parametros de proyeccion.
- Capacidad multilingue residual de Llama 2 (predominantemente ingles); no se documenta una lista de idiomas para este checkpoint.
- No se documenta soporte de tool calling ni function calling nativo en la model card.
- No se documenta soporte de agentes, multi-step reasoning ni modo "thinking".
- No hay vision, audio ni multimodalidad.
- Comportamiento medido relevante: ASR de 0,2350 en AdvBench y 0,2600 en StrongREJECT (juez HarmBench), y sobrerrechazo macro de 0,0856 (WildGuard).

## Casos de uso

- Investigacion sobre compresion de modelos: servir como celda experimental de la rejilla `gap_iter` para cuantificar cuanta seguridad se pierde al eliminar el 50 % de los parametros de proyeccion y cuanto se recupera con 7 rondas de restauracion.
- Auditoria de seguridad comparada: ejecutar AdvBench, StrongREJECT y WildGuard sobre este checkpoint y sobre las celdas restantes de la rejilla para aislar el efecto de cada regla de seleccion y de cada presupuesto.
- Estudio de interpretabilidad de componentes: analizar los 4848 componentes restaurados y los 4273 desalojados para identificar que subespacios de pesos estan asociados a comportamientos de rechazo o de cumplimiento de instrucciones daninas.
- Reproducibilidad metodologica: la configuracion documentada (semilla 42, presupuesto 1,000 %, fragmento 0,100 %, 7 de 10 rondas) permite replicar el procedimiento sobre otros modelos base y verificar los resultados declarados.
- Referencia negativa en evaluaciones de alineacion: usarse como control degradado frente a Llama-2-7b-chat para calibrar jueces automaticos de seguridad y medir su sensibilidad a cambios en los pesos.
- Pruebas de pipelines de evaluacion: validar herramientas de inferencia (transformers, TGI) y de jueces (HarmBench, WildGuard) antes de desplegarlas sobre modelos en produccion.
- No se recomienda su uso como asistente conversacional, en atencion al cliente, generacion de codigo en produccion ni cualquier escenario de cara al usuario final.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,2350 | HarmBench judge |
| StrongREJECT ASR | 0,2600 | HarmBench judge |
| Sobrerrechazo macro | 0,0856 | WildGuard |

La informacion proporcionada no incluye resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general, ni tampoco los valores de referencia del modelo base sin comprimir con los que comparar directamente estas tasas.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas 1-3 GB de overhead de activaciones y cache KV, es decir en torno a 15-16 GB para inferencia comoda.
- VRAM estimada en cuantizacion 4 bits: en torno a 4-5 GB de pesos, aunque el repositorio no publica pesos cuantizados y habria que generarlos o convertirlos.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB para servicio concurrente; RTX 4090 (24 GB), RTX 3090 (24 GB), L40S o A6000 para uso individual.
- Si cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, al limite) y RTX 4060 Ti 16 GB con cuantizacion o fp16 ajustado.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp/Ollama habria que convertir previamente a GGUF, conversion no publicada.
- Latencia y throughput: no disponible; no se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_evfront_b010_r07 | 6.738.415.616 almacenados (fraccion densa declarada 0,4999) | 4096 tokens | Llama 2 Community License | Artefacto de investigacion sobre seguridad y compresion |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community License | Modelo conversacional alineado, uso general |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.241.748.480 | 32.768 tokens | Apache 2.0 | Modelo de instrucciones de uso general |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8192 tokens | Llama 3 Community License | Modelo de instrucciones de uso general |

No se dispone de resultados de benchmarks comparables ejecutados bajo el mismo protocolo (HarmBench, StrongREJECT, WildGuard) para los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y tipo de artefacto.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo describe como artefacto de investigacion y pide tratarlo como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresion por si sola incrementa la tasa de exito de ataques, y este checkpoint presenta un ASR de 0,2350 en AdvBench y 0,2600 en StrongREJECT, valores que deben interpretarse siempre junto a la linea base sin comprimir.
- Riesgo elevado de alucinacion y de respuestas incoherentes por la eliminacion de aproximadamente la mitad de los parametros de proyeccion densos.
- Sesgos: no documentados en la informacion disponible; se heredan los de Llama-2-7b-chat y pueden amplificarse con la compresion.
- Idiomas: no se declara lista de idiomas soportados; el modelo base esta optimizado para ingles y su rendimiento en castellano no esta verificado.
- Contexto limitado a 4096 tokens, sin extension ni atencion eficiente, lo que restringe tareas de contexto largo.
- Divergencia entre metadatos y objetivo declarado: safetensors informa de 6.738.415.616 parametros, la misma cifra que el modelo base, mientras la model card declara una fraccion de parametros densos de 0,4999; conviene verificar el almacenamiento real de los tensores antes de asumir un ahorro de memoria.
- Licencia: Llama 2 Community License, con las restricciones de la politica de uso aceptable. Cualquier uso comercial de este derivado queda sujeto a dicha licencia y a la obligacion de incluir el aviso "Built with Llama", ademas de las limitaciones de escala de la licencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso, validacion externa ni soporte por parte del autor.
- Las fechas de creacion y actualizacion de los metadatos (septiembre de 2026) son posteriores a la fecha de la consulta; conviene tratarlas con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Paper de SVD-LLM (metodo de compresion citado en la model card): https://arxiv.org/abs/2403.07378
- Herramientas de evaluacion referenciadas en la model card: HarmBench, StrongREJECT y WildGuard (sitios y repositorios no enlazados en la informacion proporcionada)
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
