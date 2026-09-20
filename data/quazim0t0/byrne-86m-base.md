# Quazim0t0/Byrne-86M-Base

## Resumen

Byrne-86M-Base es un modelo de lenguaje de tipo base desarrollado por Dean Byrne (usuario Quazim0t0) y publicado bajo licencia Apache 2.0. Se trata de la version fundacional de la familia Byrne y emplea una arquitectura propia denominada SpikeWhaleLM, de aproximadamente 86 millones de parametros segun la model card (el recuento real de los pesos en safetensors es de 96.944.515 parametros, una discrepancia que conviene tener presente). El modelo se entreno desde cero con creditos de Modal durante la hackathon "Small Models, Big Adventures".

Su interes no radica en el rendimiento, sino en la combinacion de tecnicas poco habituales en modelos de este tamano: atencion latente multi-cabeza (MLA) con compresion LoRA de Q y O, atencion multi-query con una unica cabeza KV, memoria n-gram basada en hashing (Engram), dos capas de hash-lookup, conexiones residuales expandidas aprendidas (Hyper-Connections) con enrutado Sinkhorn, una pasada de refinamiento latente (HRM refine) y una cabeza adicional de prediccion multi-token (MTP) solo para entrenamiento. El FFN es denso.

El modelo esta pensado como base para preentrenamiento continuado y SFT, no como asistente listo para produccion: sus resultados zero-shot en tareas de opcion multiple se situan en torno al nivel del azar. La revision publicada incluye una reparacion del Engram que no altera las salidas (diferencia maxima de logits de 0.0) pero permite que la memoria n-gram sea entrenable en futuros ajustes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpikeWhaleLM (transformer denso con MLA + XSA, MQA de 1 cabeza KV, Engram n-gram, 2 capas hash-lookup, Hyper-Connections, HRM refine, cabeza MTP) |
| Parametros totales | 96.944.515 segun safetensors (~86M declarados por el autor) |
| Parametros activos | no aplica (FFN denso; el bloque soporta MoE pero esta desactivado en esta release) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados; los pesos se distribuyen en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con codigo custom (`custom_code`), cargable via `transformers` |
| Capas | 16 |
| Dimension oculta | 640 |
| Vocabulario | 16.512 tokens, embeddings atados (tied) |
| Cabezas de atencion | 10 cabezas de consulta, 1 cabeza KV; RoPE dim 16 / NoPE dim 48 por cabeza; QK-norm; compresion LoRA de rango 128 en Q y O |
| Tokenizador | SpikeTokenizer, byte-level greedy longest-match (no BPE), ChatML-aware |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 123 / 3 |
| Fecha de creacion | 2026-06-18 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

SpikeWhaleLM es un transformer de 16 capas y 640 dimensiones ocultas que sustituye varios componentes estandar por alternativas experimentales. La atencion usa Multi-head Latent Attention con compresion LoRA de rango 128 en las proyecciones Q y O, y cada cabeza divide su dimension entre una parte con RoPE (16) y otra sin codificacion posicional (48). Con 10 cabezas de consulta y una unica cabeza KV (MQA) mas QK-norm, el coste de cache KV por token es muy reducido. A esto se anaden dos innovaciones de memoria: una tabla Engram con 4.096 filas que hashea n-gramas locales (hasta trigramas) y mezcla el resultado en el residual, y dos capas de hash-lookup que aportan caracteristicas direccionables por contenido junto a los embeddings de token. Los residuales no se suman de forma simple, sino mediante Hyper-Connections con anchura expandida y enrutado Sinkhorn. Antes de la cabeza de salida se aplica una pasada de refinamiento latente (HRM refine); esta variante es explicitamente no-JEPA (`use_hrm_refine=True`, `use_jepa=False`), a diferencia del modelo Escarda, que anade JEPA sobre HRM. La cabeza MTP, al estilo de DeepSeek-V3, solo interviene durante el entrenamiento.

El modelo se entreno desde cero y esta descrito como un checkpoint destilado del paso 4.000. No se especifican en la informacion disponible el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El tokenizador es propio: SpikeTokenizer convierte el texto a UTF-8, luego a bytes latin-1 y selecciona la clave mas larga del vocabulario que encaje (length-max, no BPE), con especiales atomicos para ChatML (`<|im_start|>`, `<|im_end|>`), modo de razonamiento (`<think>`, `</think>`), soluciones (`<begin_solution>`, `<end_solution>`) y marcadores de tool-call, ademas de `<bos>`, `<eos>`, `<pad>` y `<unk>`. La revision actual corrige una degeneracion del Engram: el compresor LSH congelado hasheaba todos los tokens al bucket 0, de modo que solo una fila de la tabla recibia gradiente. La reparacion reescala el compresor congelado y difunde el vector aprendido del bucket 0 al resto de filas, manteniendo las salidas bit a bit identicas.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base; no esta ajustado para seguir instrucciones ni para mantener conversaciones.
- Razonamiento y conocimiento factual limitados: los resultados zero-shot en ARC, HellaSwag, OpenBookQA y Winogrande se situan en torno al nivel del azar.
- Modelado de lenguaje y gramatica: byte_ppl de 2,3753 en WikiText-2 y 0,7356 de precision en BLiMP.
- Aritmetica basica evaluada con ArithMark-2.0 (metrica oficial `acc`): 0,2732.
- No se documenta soporte de tool calling ni de function calling en la practica, aunque el tokenizador reserva marcadores especificos de tool-call.
- No se documentan capacidades de agente, razonamiento multi-paso operativo, vision, audio ni modo de pensamiento funcional, pese a que el tokenizador incluye los tokens `<think>` y `</think>`.
- Capacidad monolingue: solo ingles. No hay evidencia de transferencia multilingue.
- Capacidad estructural para alojar MoE en el bloque (desactivada en esta release) y cabeza MTP para prediccion de mas de un token siguiente, pero esta ultima solo durante entrenamiento.
- Al ser un modelo base, sus capacidades reales dependen del preentrenamiento continuado o SFT que se haga sobre el; la model card lo presenta explicitamente como base para esas fases.

## Casos de uso

- Base para SFT y preentrenamiento continuado de investigacion: el autor lo publica como punto de partida para ajuste. Tras la reparacion del Engram, las 4.096 filas de la tabla n-gram son entrenables de forma independiente, de modo que un SFT posterior puede aprovechar la memoria de n-gramas en lugar de arrastrar un sesgo constante.
- Estudio de atencion latente a escala reducida: con 16 capas, 640 dimensiones y una sola cabeza KV, permite reproducir y analizar el comportamiento de MLA y MQA en hardware modesto, aislando el efecto de la compresion LoRA de Q/O y del reparto RoPE/NoPE.
- Investigacion sobre residuos expandidos: las Hyper-Connections con enrutado Sinkhorn son un componente poco frecuente; este modelo sirve como implementacion de referencia para medir su impacto frente a la suma residual convencional en un presupuesto de 97M de parametros.
- Experimentacion con memorias externas hasheadas: la tabla Engram y las dos capas de hash-lookup permiten estudiar si el direccionamiento por contenido aporta senal en modelos pequenos, y la correccion del compresor LSH ofrece un caso documentado de fallo silencioso en este tipo de modulos.
- Evaluacion de tokenizadores byte-level length-max: SpikeTokenizer, con 16.512 entradas y sin BPE, permite comparar directamente con tokenizadores BPE de vocabulario similar en tareas de compresion, robustez a ruido y manejo de bytes arbitrarios.
- Destilacion y compresion: al proceder de un checkpoint destilado del paso 4.000, es un objetivo razonable para experimentos de destilacion desde modelos mayores hacia la clase de 100M de parametros, con la ventaja de que la cabeza MTP puede actuar como senal auxiliar durante el entrenamiento.
- Docencia y prototipado en portatil: con ~97M de parametros y safetensors, el modelo se carga en CPU o en una GPU integrada, lo que permite usar sus pesos para explicar mecanismos de atencion, normalizacion y enrutado en un curso sin depender de infraestructura de datacenter.
- Evaluacion de objetivos multi-token: la cabeza MTP estilo DeepSeek-V3 permite medir si predecir varios tokens siguientes mejora la representacion aprendida, aunque no acelera la inferencia porque no se usa como decodificacion especulativa en esta release.

## Benchmarks y rendimiento

Evaluacion zero-shot de opcion multiple por verosimilitud de continuacion; `acc_norm` es la exactitud normalizada por longitud en bytes.

| Tarea | acc | acc_norm |
|---|---|---|
| arc_easy | 0,4205 | 0,3931 |
| arc_challenge | 0,1877 | 0,2389 |
| hellaswag | 0,2792 | 0,2927 |
| winogrande | 0,5193 | no disponible |
| piqa | 0,5941 | 0,5860 |
| openbookqa | 0,1420 | 0,2820 |
| boolq | 0,6171 | no disponible |

Otras metricas publicadas:

| Metrica | Valor |
|---|---|
| ArithMark-2.0 (AxiomicLabs), metrica oficial `acc` | 0,2732 |
| WikiText-2 byte_ppl | 2,3753 |
| BLiMP | 0,7356 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, GSM8K ni HumanEval. Como referencia aritmetica, los valores de `acc_norm` en arc_challenge (0,2389), hellaswag (0,2927) y openbookqa (0,2820) estan en el entorno del azar para cuatro opciones (0,25), y winogrande (0,5193) apenas supera el 0,50. La byte_ppl de WikiText-2 es una perplexidad por byte y no es directamente comparable con perplexidades por token de otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de 96.944.515 parametros: ~388 MB en fp32, ~194 MB en bf16/fp16, ~97 MB en int8 y ~48 MB en int4 (estimacion propia; el repositorio no publica pesos cuantizados).
- Cache KV muy reducida por el uso de MQA con una unica cabeza KV: se estiman del orden de 2 KB por token en bf16 para las 16 capas, es decir unos 8 MB con los 4.096 tokens de contexto (estimacion derivada de la arquitectura publicada, no verificada experimentalmente).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en GPU integradas y en CPU. No requiere A100 ni H100 salvo para entrenamiento a gran escala.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la unica via documentada, ya que el codigo del modelo y el tokenizador son personalizados.
- No hay soporte publicado en vLLM, TGI, llama.cpp, Ollama ni en formatos GGUF. Portar SpikeWhaleLM a llama.cpp exigiria implementar desde cero MLA, Engram, hash-lookup, Hyper-Connections y HRM refine.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Byrne-86M-Base | 96,9M (real) / ~86M declarados | 4.096 | Apache-2.0 | safetensors con `custom_code` | Ver tabla de benchmarks |
| Byrne-86M (variante chat del mismo autor) | no disponible | no disponible | no disponible | referenciado en la model card | no disponible |
| GPT-2 124M | ~124M | 1.024 | licencia MIT modificada | pesos y GGUF ampliamente disponibles | no comparado en la informacion disponible |
| Pythia-70M | ~70M | 2.048 | Apache-2.0 | pesos disponibles | no comparado en la informacion disponible |
| SmolLM-135M | ~135M | 2.048 | Apache-2.0 | pesos y cuantizaciones disponibles | no comparado en la informacion disponible |

Nota: las especificaciones de GPT-2, Pythia y SmolLM proceden de documentacion publica general y no fueron verificadas en la busqueda web realizada; se incluyen solo como referencia de categoria. No se dispone de cifras de benchmark comparables para ninguno de ellos en la informacion proporcionada, por lo que la comparacion de rendimiento queda como no disponible. La busqueda web no devolvio ningun resultado tecnico relevante.

## Limitaciones y advertencias

- Rendimiento zero-shot proximo al azar en varias tareas de opcion multiple: arc_challenge (0,2389 `acc_norm`), openbookqa (0,2820) y hellaswag (0,2927) con cuatro opciones. No es apto para produccion sin un ajuste posterior sustancial.
- Es un modelo base, no un asistente: no sigue instrucciones, no mantiene conversaciones coherentes de forma fiable y puede generar continuaciones degeneradas o repetitivas.
- Riesgo elevado de alucinacion y de afirmaciones factualmente incorrectas, dado el escaso conocimiento factual que reflejan las metricas.
- Monolingue: solo ingles. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia. No se declaran restricciones adicionales por parte del autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python proporcionado por el autor del repositorio (`spike_tokenizer.py` y la implementacion del modelo). Conviene auditar ese codigo antes de cargarlo en entornos de produccion o con datos sensibles.
- Tokenizador no estandar (length-max sobre bytes, sin BPE): puede complicar la integracion con herramientas, pipelines y utilidades que asumen tokenizadores BPE de HuggingFace, y altera el calculo de metricas dependientes de la tokenizacion.
- La divergencia entre los ~86M declarados y los 96,9M reales de safetensors debe tenerse en cuenta al planificar presupuestos de memoria o comparaciones de tamano.
- El Engram de los pesos originales era degenerado y este checkpoint lo repara manteniendo salidas identicas. Por tanto, la mejora solo se manifestara si se reentrena o ajusta sobre esta revision; los pesos aqui publicados no rinden mejor que la revision anterior en inferencia.
- MoE esta desactivado y la cabeza MTP no se usa en inferencia, por lo que no cabe esperar ventajas de decodificacion especulativa.
- Adopcion muy baja (123 descargas, 3 likes) y ausencia de validacion independiente: no hay evaluaciones de terceros que confirmen los numeros publicados.
- No se documentan sesgos especificos ni composicion del dataset de entrenamiento, lo que impide auditar procedencia de datos, filtros aplicados o posibles sesgos sistematicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/Byrne-86M-Base
- Variante chat de la misma familia: https://huggingface.co/Quazim0t0/Byrne-86M
- Dataset ArithMark-2.0 (AxiomicLabs), usado en la evaluacion aritmetica: https://huggingface.co/datasets/AxiomicLabs/ArithMark-2.0
- Visor de arquitectura enlazado desde la model card: https://hfviewer.com/Quazim0t0/Byrne-86M-Base
- Cita recomendada por el autor: Dean Byrne (Quazim0t0), "Byrne-86M-Base: A ~86M-parameter SpikeWhaleLM", 2026
- Resultados de busqueda web: no se encontraron enlaces tecnicos relevantes sobre este modelo; los resultados devueltos correspondian a paginas no relacionadas del servicio StudyFetch y se han descartado.
