# Jeesup/svd-safety-l2_basisresmix_remove40

## Resumen

`Jeesup/svd-safety-l2_basisresmix_remove40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante Basis Sharing (tecnica presentada en ICLR 2025 que comparte bases SVD entre grupos de 2 capas adyacentes) hasta retener el 60,0% de los parametros densos. Sobre esa version comprimida se aplico una recuperacion mediante LoRA de rango 8 restringida unicamente a los coeficientes por capa, manteniendo congeladas las bases compartidas y sin alterar el presupuesto de parametros. El resultado es un modelo de 6.738.415.616 parametros (frente a los aproximadamente 6,74 mil millones del original) distribuido en safetensors con un repositorio de 13,5 GB.

El modelo no es un asistente conversacional de proposito general, sino un artefacto de investigacion. Forma parte de una rejilla experimental que cruza distintas reglas de seleccion de componentes y presupuestos de compresion con el objetivo de medir como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que criterio de reparacion funciona mejor. En concreto, esta celda corresponde a la variante `basisresmix` con un 40% de parametros eliminados, semilla 42.

Su relevancia actual es doble: por un lado, aporta evidencia cuantitativa sobre el trade-off entre seguridad y utilidad bajo compresion (con metricas de tasa de exito de ataque y de sobrerrechazo medidas con jueces automaticos); por otro, es un banco de pruebas reproducible para quienes investigan compresion de LLM, interpretabilidad de componentes y evaluacion de seguridad. El autor advierte explicitamente de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base y que ninguna celda debe desplegarse como asistente sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), con bases SVD compartidas entre grupos de 2 capas adyacentes (Basis Sharing, ICLR 2025) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en safetensors; no documenta cuantizaciones) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Llama-2-7b-chat esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fraccion de parametros retenida | 0,5999 (40,00% de parametros eliminados) |
| Metodo de compresion | Basis Sharing con bases compartidas sobre grupos de 2 capas adyacentes, semilla 42 |
| Recuperacion | LoRA r=8 solo sobre coeficientes por capa (bases congeladas, presupuesto inalterado), 2 epocas, lr 1e-4, batch 64, dataset alpaca-cleaned |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat (transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU). La innovacion del checkpoint esta en la fase de compresion: en lugar de aplicar una descomposicion en valores singulares (SVD) independiente por matriz, se emplea el esquema Basis Sharing descrito en ICLR 2025, que comparte las bases de la descomposicion entre grupos de 2 capas adyacentes. Esto reduce el numero de bases que deben almacenarse y permite eliminar el 40,00% de los parametros densos, dejando el modelo en una fraccion de 0,5999 respecto al original. Las bases compartidas quedan fijadas tras la compresion.

Sobre ese esqueleto comprimido se aplica una recuperacion ligera: un ajuste LoRA de rango 8 que actua exclusivamente sobre los coeficientes por capa, con las bases congeladas y sin modificar el presupuesto de parametros. El entrenamiento de recuperacion consta de 2 epocas con learning rate 1e-4, batch de 64 y el dataset alpaca-cleaned, con semilla 42. La model card no documenta el numero total de tokens de entrenamiento original ni la composicion completa del dataset de Llama-2, ni si hubo fases adicionales de RLHF o DPO mas alla de las del modelo base. No se mencionan tecnicas de decodificacion especulativa ni variantes de atencion lineal.

## Capacidades

- Generacion de texto conversacional: hereda el comportamiento de chat de Llama-2-7b-chat, con el formato de turnos y el system prompt del modelo original.
- Razonamiento y conocimiento general: conserva la mayor parte de las capacidades del modelo base, aunque con la degradacion esperable tras eliminar el 40% de los parametros.
- Evaluacion de seguridad: es su capacidad principal como artefacto, ya que permite medir tasas de exito de ataque (ASR) y de sobrerrechazo bajo compresion.
- Analisis de interpretabilidad: las bases SVD compartidas entre capas adyacentes son inspeccionables, lo que facilita estudiar que subespacios de pesos concentran el comportamiento de rechazo.
- Multi-turno: soporta conversaciones de varios turnos dentro de la ventana de 4096 tokens.
- Tool calling / function calling: no disponible; la informacion proporcionada no documenta soporte de llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta thinking mode ni planificacion explicita.
- Multilingue: no disponible; no se declaran idiomas soportados.
- Vision y audio: no soportados.

## Casos de uso

- Investigacion sobre compresion de LLM: servir como celda de referencia en una rejilla que compara reglas de seleccion de componentes y presupuestos de compresion, permitiendo aislar el efecto de la regla `basisresmix` frente a otras variantes del mismo estudio con presupuesto identico.
- Medir el impacto de la compresion en la seguridad: gracias a sus metricas de AdvBench ASR (0,0538) y StrongREJECT ASR (0,0831) obtenidas con el juez HarmBench, permite cuantificar cuanto se degrada la alineacion al eliminar el 40% de los parametros y comparar esa degradacion con la del modelo sin comprimir.
- Estudio del sobrerrechazo: el valor de macro over-refusal medido con WildGuard (0,2851) permite analizar si la recuperacion con LoRA sobre coeficientes agrava el rechazo excesivo de peticiones benignas, un problema habitual en modelos alineados de forma agresiva.
- Interpretabilidad de subespacios de pesos: al compartir bases SVD entre pares de capas adyacentes, el checkpoint permite estudiar que direcciones del espacio de pesos estan asociadas a comportamientos concretos (por ejemplo, rechazo de contenido danino) y como se redistribuyen al comprimir.
- Reproducibilidad de resultados academicos: con semilla 42, presupuesto documentado y receta de recuperacion explicita, el checkpoint sirve para replicar los resultados de estudios sobre Basis Sharing y para verificar la estabilidad de las conclusiones con otras semillas o presupuestos.
- Red-teaming controlado: utilizarlo como sujeto experimental en ejercicios internos de evaluacion de robustez, siempre en entornos aislados, dado que la propia model card advierte de que algunas celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Evaluacion comparativa de perplexity: su WikiText-2 perplexity de 10,8255 sirve como punto de medida de calidad de lenguaje para comparar estrategias de compresion a igualdad de presupuesto de parametros.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0538 | HarmBench judge |
| StrongREJECT ASR | 0,0831 | HarmBench judge |
| Macro over-refusal | 0,2851 | WildGuard |
| WikiText-2 perplexity | 10,8255 | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) para este checkpoint. Tampoco se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la delta exacta de degradacion a partir de los datos suministrados.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 13,5 GB de pesos, mas overhead de activaciones y cache KV (el tamano del repositorio, 13,5 GB, es coherente con esta cifra). Presupuestar 16-18 GB para inferencia comoda a 4096 tokens de contexto.
- Cuantizacion a 8 bits: en torno a 7 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: en torno a 4 GB de pesos, viable en GPUs de 8 GB o superiores (requiere conversion previa, no distribuida por el autor).
- GPUs profesionales: A100 40/80 GB, H100, L40S; sobredimensionadas para un modelo de 6,74B en FP16 salvo que se busque throughput alto por GPU.
- GPUs de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en FP16; en RTX 3080 (10 GB) o RTX 4060 Ti (16 GB) sera necesario cuantizar.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI con GGUF no estan confirmados por el autor; requeririan conversion a GGUF/AWQ/GPTQ no publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_basisresmix_remove40 | 6,738 M (0,5999 del original) | 4096 | AdvBench ASR 0,0538; StrongREJECT ASR 0,0831; over-refusal 0,2851; ppl WikiText-2 10,8255 | Llama 2 Community License | Hugging Face (0 descargas) |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | ~6,74 B | 4096 | no disponible en esta ficha | Llama 2 Community License | Hugging Face (ampliamente disponible) |
| Jeesup/svd-safety-l2_basis_remove40 (variante hermanada) | 0,5999 del original | 4096 | no disponible en esta ficha | Llama 2 Community License | Hugging Face |
| Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r06 (variante hermanada) | 0,5999 del original | 4096 | no disponible en esta ficha | Llama 2 Community License | Hugging Face / Featherless AI |

Las variantes hermanadas pertenecen al mismo estudio y comparten presupuesto de compresion, diferenciandose en la regla de seleccion de componentes (por ejemplo `swapgapnet`, `swapdiscnet_iter` con distintas rondas de seleccion). No se dispone de sus metricas publicadas en la informacion consultada, por lo que no se puede establecer una comparacion cuantitativa entre celdas.

## Limitaciones y advertencias

- No es un asistente desplegable: la model card indica explicitamente que se trata de un artefacto de investigacion y que debe tratarse como sujeto experimental, no como modelo de produccion.
- Degradacion de seguridad inducida: el propio autor advierte de que la compresion por si sola eleva la tasa de exito de ataque y que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat. Esta celda concreta presenta un AdvBench ASR de 0,0538 y un StrongREJECT ASR de 0,0831, pero conviene no extrapolar ese comportamiento sin reevaluacion propia.
- Riesgo de alucinacion: al eliminar el 40% de los parametros densos y aplicar solo una recuperacion LoRA de rango 8 sobre coeficientes, la fidelidad factual y la coherencia a contextos largos pueden verse afectadas. La perplexity de WikiText-2 (10,8255) es el unico indicador de calidad de lenguaje publicado.
- Sobrerrechazo elevado: el macro over-refusal de 0,2851 con WildGuard sugiere una tendencia apreciable a rechazar peticiones que no son daninas, lo que limita su uso conversacional directo.
- Cobertura de idiomas no documentada: la model card no declara idiomas soportados; el comportamiento fuera del ingles no esta garantizado.
- Contexto limitado: 4096 tokens, insuficiente para tareas de documento largo o agentes con historial extenso.
- Restricciones de licencia: se aplica la Llama 2 Community License. El repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso de esta obra derivada queda vinculado a esas condiciones, incluida la clausula de atribucion ("Built with Llama 2") y las restricciones de uso comercial y de escala de usuarios de la licencia.
- Ausencia de cuantizaciones publicadas: no se distribuyen pesos GGUF, AWQ ni GPTQ, lo que obliga a convertirlos antes de desplegar en hardware limitado, con el consiguiente riesgo de perdida adicional de calidad.
- Sin soporte documentado de tool calling ni de agentes, lo que descarta su integracion en pipelines que dependan de llamadas a funciones.
- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni de la delta frente al modelo base, lo que dificulta juzgar el coste real de la compresion mas alla de las metricas de seguridad y perplexity.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_basisresmix_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Variante hermanada `svd-safety-l2_basis_remove40`: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40
- Variante hermanada `svd-safety-l2_basis_remove40_swapgapnet_b010_r02`: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r02
- Variante hermanada `svd-safety-l2_basis_remove40_swapdiscnet_b010_r06` en Featherless AI: https://featherless.ai/models/Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r06
- Ficha en Featherless AI del modelo: https://featherless.ai/models/Jeesup/svd-safety-l2_basisresmix_remove40
- Ficha en LLM Explorer de una variante de la rejilla: https://llm-explorer.com/model/Jeesup%2Fsvd-safety-l2_remove40_swapdisciter_r02,K96LvQFQbwgmht56LJPVf
- Paper de Basis Sharing (ICLR 2025): referencia citada en la model card, sin URL proporcionada en la informacion disponible.
