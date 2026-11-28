# Lucebox/pflash

## Resumen

PFlash es una pila de compresion de prefill desarrollada por Lucebox, distribuida como un conjunto de componentes GGUF que se acoplan a un modelo base pequeno para reducir el coste de procesar prompts largos en sesiones agenticas. No es un modelo generativo autonomo: es un sistema auxiliar que decide que fragmentos de un prompt largo merecen pasar al modelo lector grande, descartando el resto. El modelo base declarado es Qwen/Qwen3.5-0.8B, y los cuatro componentes suman aproximadamente 264.705 parametros totales segun los metadatos de safetensors, con un tamano de repositorio de 0,1 GB.

La arquitectura combina una sonda de segmentacion que divide el prompt en unidades estructurales (enunciados, definiciones, frases, registros, turnos de chat, llamadas a herramientas), una sonda de peticion que localiza los tokens que contienen la solicitud del usuario, una cabeza de puntuacion de etapa 1 que calcula densidad de atencion NoPE consulta→contexto y centroides de claves L2-normalizados, y un reranker bidireccional de segmentos con doble clave que refina la relevancia con contexto cruzado entre segmentos. Todos los componentes leen la misma activacion del bloque 14 del drafter en una unica pasada forward.

La relevancia actual del proyecto reside en el coste creciente del prefill en contextos largos y en flujos agenticos multi-turno: comprimir el prompt antes de enviarlo al modelo lector puede reducir computo y latencia. La licencia es "other", el unico idioma declarado es ingles y el pipeline no esta especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de componentes sobre Qwen3.5-0.8B: sonda de segmentos (LayerNorm + Linear + GELU + tres Conv1d de 5 taps), sonda de peticion (MLP), cabeza de puntuacion NoPE y reranker Transformer bidireccional de 3 capas |
| Parametros totales | 264.705 (metadatos de safetensors); desglose por componente: sonda de segmentos ~263K, sonda de peticion ~265K, cabeza de puntuacion 2,62M, reranker con pesos FP16 de 12,5 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explicitamente; el sistema opera sobre prompts largos con N_seg ~ 200–1500 segmentos y pinning de peticion de hasta 512 tokens |
| Tipos de cuantizacion | GGUF para los cuatro componentes; el drafter requerido es Qwen3.5-0.8B-BF16.gguf (BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuatro ficheros: segment-probe.gguf, request-probe.gguf, seg-scoring-head.gguf, seg-reranker.gguf) |

## Arquitectura y entrenamiento

PFlash no entrena un modelo generativo nuevo, sino cuatro cabezas ligeras que se ejecutan sobre las activaciones de un drafter Qwen3.5-0.8B congelado. La sonda de segmentos aplica LayerNorm(1024), una proyeccion Linear(1024, 256), GELU y tres cabezas Conv1d de 5 taps con residuales que emiten logits por token de unidad, contenedor y subunidad; corta con umbral de unidad 0,8, min_segment=32 y max_segment=512, con division alineada a lineas para segmentos sobredimensionados. La sonda de peticion usa LayerNorm(1024) → Linear(1024, 256) → GELU(erf) → Linear(256, 1) para localizar la solicitud del usuario dentro de pegados largos, prompts RAG o chats multi-turno, recortando cada componente de peticion a la envolvente convexa 1D de sus tramos de logit positivo (run >= 2, con retroceso a run >= 1) y fijando unidades de peticion completas de hasta 512 tokens.

La cabeza de puntuacion de etapa 1 emplea dos matrices de proyeccion (attn_q [1024, 2048], attn_k [1024, 512]) para calcular en una sola pasada de GPU la densidad de masa de atencion NoPE consulta→contexto por unidad y centroides de claves L2-normalizados, tanto uniformes (k_bar) como ponderados por masa de atencion (k_att). El reranker es un Transformer encoder bidireccional de 3 capas (d_model=384, n_heads=6, head_dim=64, d_ff=1024 SwiGLU, Pre-RMSNorm, RoPE NeoX 1D con theta=10000, sin mascara causal) que consume la concatenacion [k_bar, k_att] de 1024 dimensiones, el pooling [q_bar, q_bar], una interaccion multiplicativa W_int(k_d * q_d) y 12 escalares por segmento (densidad z-scoreada, densidad relativa, masa, maximo, top-4, ratio de pico, longitud, posicion, probabilidades de contenedor izquierdo y derecho, y similitud coseno de claves adyacentes), emitiendo un residuo de promocion no negativo y acotado (delta en [0, 100]) sobre el log_density de etapa 1. El sistema incluye una red de seguridad adaptativa: un suelo de masa de nucleo en etapa 1 (p = 0,90, tope 0,58) y un mecanismo de perplejidad (eff = exp(H_tok) / N_opt, T = 0,85) que ensancha el presupuesto de retencion en prompts difusos o multi-hop. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Compresion de prefill para prompts largos: selecciona las unidades estructurales de mayor relevancia que caben en el presupuesto y las envia al modelo lector en su orden original.
- Segmentacion estructural del prompt en unidades completas: enunciados y definiciones, frases, registros, turnos de chat y llamadas a herramientas.
- Localizacion de la peticion del usuario dentro de contextos largos, pegados extensos, prompts RAG y conversaciones multi-turno, con fijado textual de las unidades de peticion.
- Puntuacion calibrada de relevancia por segmento mediante densidad de atencion NoPE consulta→contexto y centroides de claves uniformes y ponderados por masa.
- Reranking bidireccional con contexto cruzado entre segmentos para promover evidencia multi-hop y de razonamiento entre segmentos, evitando suprimir agujas aisladas.
- Promocion de observaciones de herramientas activas como rol de consulta en turnos autonomos de herramientas y en conmutaciones de Lucebox Mix.
- Red de seguridad adaptativa de ratio de retencion basada en masa de nucleo y perplejidad para prompts difusos o con necesidades implicitas.
- No soporta generacion de texto, vision, audio ni tool calling por si mismo: es una capa auxiliar que opera junto a un modelo lector externo.

## Casos de uso

- Agentes con contexto largo: en sesiones agenticas multi-turno, PFlash segmenta el historial y las observaciones de herramientas, fija la peticion activa y envia al lector solo las unidades relevantes, reduciendo el coste de prefill en cada turno.
- Recuperacion aumentada (RAG) con documentos extensos: la sonda de peticion localiza la consulta dentro de prompts con multiples fragmentos pegados y el reranker promueve los pasajes que sostienen razonamiento multi-hop, descartando el resto antes del prefill.
- Analisis de documentos largos con preguntas embebidas: cuando la pregunta aparece en medio de un pegado extenso, la sonda de peticion la aisla y la fija textualmente, de modo que el lector recibe la pregunta intacta junto con la evidencia seleccionada.
- Procesamiento de registros y trazas estructuradas: la sonda de segmentos reconoce registros como unidades estructurales y los trata de forma atomica, util para pipelines que analizan logs o salidas tabulares sin romper filas.
- Asistentes conversacionales con historial extenso: los turnos de chat se segmentan como unidades y el sistema conserva los turnos relevantes para la solicitud actual, manteniendo coherencia multi-turno con menor presupuesto de contexto.
- Optimizacion de costes en despliegues de inferencia: al reducir el numero de tokens que llegan al modelo lector (curva base en torno al 28–29% retenido, ampliable por la red de seguridad), disminuye el computo de prefill en GPUs de servicio.
- Filtrado previo en pipelines de evaluacion o moderacion: la puntuacion de densidad y el reranker permiten priorizar segmentos candidatos antes de pasarlos a un modelo mayor, como etapa de seleccion barata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los cuatro componentes GGUF suman aproximadamente 20 MB (1,06 MB + 1,06 MB + 5,24 MB + 12,53 MB); el grueso del consumo lo determina el drafter Qwen3.5-0.8B en BF16 y el modelo lector externo.
- GPU recomendadas: el reranker se ejecuta en aproximadamente 1,5–4 ms en GPU segun la model card; no se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: si, los componentes auxiliares son de tamano muy reducido; el drafter de 0,8B en BF16 tambien es viable en GPUs de consumo, aunque el requisito dominante es el del modelo lector.
- Opciones de despliegue: formato GGUF, compatible con el ecosistema llama.cpp/Ollama para los ficheros; la carga verifica el sha256 del drafter y cada componente rechaza cargarse contra cualquier otro fichero de drafter. No se detalla soporte para vLLM o TGI.
- Latencia y throughput: el reranker tarda aproximadamente 1,5–4 ms en GPU; la red de seguridad de etapa 1 se calcula en menos de 0,1 ms. No se dispone de cifras de throughput del sistema completo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. PFlash no es un modelo generativo sino una pila de compresion de prefill, por lo que su comparacion natural seria con otras tecnicas de compresion de contexto o poda de prompts, para las que no se aportan datos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PFlash (Lucebox) | 264.705 en componentes auxiliares | no disponible | other | GGUF en Hugging Face |
| Alternativas de compresion de prefill | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- No es un modelo generativo: requiere un modelo lector externo y un drafter Qwen3.5-0.8B-BF16.gguf concreto, verificado por sha256; cualquier otro fichero de drafter provoca el rechazo de carga.
- Licencia "other": no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que es necesario revisar los terminos del autor antes de desplegarlo en produccion.
- Riesgo de perdida de evidencia: aunque el sistema incluye promociones acotadas y una red de seguridad adaptativa, la compresion descarta segmentos y puede omitir informacion relevante en prompts con necesidades implicitas o muy difusas.
- Dependencia de umbrales y heuristicas configurables (umbral de unidad 0,8, min_segment=32, max_segment=512, p=0,90, tope 0,58, T=0,85) cuyo ajuste puede afectar al comportamiento en dominios especificos.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de calidad de la seleccion de segmentos.
- El pipeline no esta especificado en los metadatos de Hugging Face, lo que complica la integracion automatica con frameworks estandar.
- El repositorio tiene 256 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion limitada y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucebox/pflash
- Drafter requerido: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
