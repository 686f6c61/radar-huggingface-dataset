# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r03

## Resumen

Este checkpoint es un artefacto de investigación publicado por el usuario Jeesup: una versión comprimida de `meta-llama/Llama-2-7b-chat-hf` mediante la técnica Basis Sharing (ICLR 2025), que comparte bases SVD entre grupos de dos capas adyacentes y elimina el 40,00 % de los parámetros densos. Sobre ese modelo comprimido se aplica después un proceso de edición de parámetros («swap») iterativo y neutro en número de parámetros, guiado por la regla de selección `swapgapnet_iter`, con un presupuesto total del 1,000 % de los parámetros densos repartido en 10 rondas. El repositorio contiene el resultado tras aplicar 3 de esas 10 rondas, con 1.364 componentes restaurados y 1.364 sustituidos (un 0,30 % de los parámetros de proyección).

El problema que aborda es concreto: la compresión SVD degrada el comportamiento de seguridad de un modelo alineado, y este estudio trata de cuantificar esa degradación y comparar distintas reglas de selección de componentes para repararla. El modelo final conserva 6.738.415.616 parámetros totales (una fracción densa de 0,5999 respecto al original) y mantiene la arquitectura transformer decoder-only de Llama 2, con recuperación mediante LoRA de rango 8 aplicada únicamente a los coeficientes por capa, manteniendo las bases congeladas.

Su relevancia es metodológica, no práctica. El propio autor advierte que varias celdas de la rejilla experimental están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que este checkpoint es un sujeto de experimentación, no un asistente desplegable. Con 0 descargas y 0 «likes» en el momento de la consulta, se trata de un artefacto de reproducibilidad dentro de un barrido de hiperparámetros, útil para quien investigue compresión, edición de parámetros o evaluación de seguridad, pero no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con bases SVD compartidas entre grupos de 2 capas adyacentes (Basis Sharing, ICLR 2025) |
| Parámetros totales | 6.738.415.616 (≈6,74 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-7b-chat; no especificada en la model card) |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no se han publicado variantes GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | No disponible (el modelo base está orientado principalmente a inglés) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | Safetensors (tamaño del repositorio: 13,5 GB, compatible con fp16) |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only con normalización RMSNorm, RoPE y atención causal, que el autor somete a un proceso de compresión en dos etapas. Primero aplica Basis Sharing: en lugar de factorizar cada matriz con su propia base SVD, se comparten bases entre pares de capas adyacentes, lo que permite eliminar el 40,00 % de los parámetros densos conservando una representación de bajo rango coherente entre capas. El resultado declarado es una fracción de parámetros densos de 0,5999.

Sobre el modelo comprimido se ejecuta una recuperación con LoRA de rango 8 restringida a los coeficientes por capa (las bases permanecen congeladas y el presupuesto de parámetros no cambia), durante 2 epochs con tasa de aprendizaje 0,0001, batch de 64 y el dataset `alpaca-cleaned`. Después se aplica la edición iterativa de parámetros: en cada ronda se seleccionan componentes mediante la regla `swapgapnet_iter`, usando como valor de swap la suma del valor de inserción y el valor de eliminación de la evicción ordenada por sigma (modo `net`), con un trozo del 0,100 % de los parámetros densos por ronda. El checkpoint publicado corresponde a la ronda 3 de 10; se han intercambiado 19.418.112 parámetros (0,30 % de los parámetros de proyección), con 1.364 componentes restaurados y 1.364 sustituidos. La semilla empleada es 42.

No se documenta en la información disponible el volumen de tokens de preentrenamiento (el modelo parte de un checkpoint ya entrenado), ni si hubo fases adicionales de RLHF o DPO más allá del ajuste LoRA descrito. Tampoco se especifica la composición del dataset de evaluación más allá de `alpaca-cleaned` para la recuperación.

## Capacidades

- Generación de texto conversacional: hereda las capacidades de chat de Llama-2-7b-chat, aunque degradadas por la compresión y por la edición de parámetros; el autor no garantiza que se mantengan íntegras.
- Razonamiento y conocimiento general: capacidad residual de un modelo de 6,74 mil millones de parámetros, sin métricas publicadas que la cuantifiquen.
- Multilingüismo: no documentado; el modelo base está optimizado para inglés.
- Tool calling / function calling: no documentado y no esperado en la familia Llama 2 chat sin plantillas específicas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Comportamiento de seguridad medible: es la capacidad central del artefacto, con tasas de éxito de ataque (ASR) y de sobrerrechazo medidas con jueces automáticos (HarmBench y WildGuard).
- Interpretabilidad y análisis de componentes: el modelo permite estudiar qué componentes concretos afectan al comportamiento de rechazo, ya que el proceso de swap es trazable a nivel de componente.
- Modo «thinking», visión o audio: no disponibles.

## Casos de uso

- Investigación en compresión y seguridad: reproducir el efecto de la compresión SVD sobre la tasa de éxito de ataque (ASR) y comparar la celda de la ronda 3 con las rondas 10 y con el modelo sin comprimir, para aislar cuánto daño introduce la compresión y cuánto repara el swap.
- Comparación de reglas de selección de componentes: enfrentar `swapgapnet_iter` contra alternativas como `disc` (presente en otros checkpoints del mismo autor) manteniendo fijo el presupuesto del 1,000 %, para determinar qué criterio de selección repara mejor la seguridad por parámetro invertido.
- Validación de jueces de seguridad: usar las salidas del modelo como entradas controladas para verificar la sensibilidad y la calibración de jueces como HarmBench o WildGuard, dado que el autor publica las tres métricas (AdvBench ASR 0,0731; StrongREJECT ASR 0,0958; sobrerrechazo macro 0,2135).
- Estudio del sobrerrechazo (over-refusal): la métrica de 0,2135 sobre WildGuard permite analizar el coste en utilidad de las intervenciones de seguridad, un eje habitualmente menos estudiado que el ASR.
- Ablaciones de recuperación con LoRA: dado que la recuperación se limita a los coeficientes por capa con rango 8 y bases congeladas, sirve como punto de partida para medir cuánta capacidad se recupera con un presupuesto de adaptación mínimo.
- Docencia y reproducibilidad en interpretabilidad: el repositorio documenta semilla, número de rondas, componentes restaurados y sustituidos, lo que facilita ejercicios prácticos de edición de parámetros con trazabilidad completa.
- Auditoría de artefactos derivados de Llama 2: útil para equipos que necesiten evaluar riesgos antes de considerar cualquier derivado comprimido de Llama 2 en un pipeline, incluida la verificación del cumplimiento de la licencia.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de seguridad, no de capacidad. Se reproducen tal cual:

| Métrica | Valor | Juez / referencia | Nota |
|---|---|---|---|
| AdvBench ASR | 0,0731 | HarmBench judge | Cuanto menor, mejor |
| StrongREJECT ASR | 0,0958 | HarmBench judge | Cuanto menor, mejor |
| Sobrerrechazo macro | 0,2135 | WildGuard | Cuanto menor, mejor |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni valores comparativos del modelo base sin comprimir dentro de este repositorio. Sin esos controles no es posible atribuir las cifras anteriores a la compresión, al swap o al modelo original.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para los pesos, más caché KV y activaciones; con 4096 tokens de contexto conviene reservar entre 15 y 17 GB.
- GPU profesionales: A100 (40 GB u 80 GB) y H100 (80 GB) ejecutan el modelo sin cuantización y con margen para lotes grandes o contextos completos.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 3090, RTX 4090 o RTX A5000 en fp16. En tarjetas de 16 GB no cabe en fp16 sin cuantización de terceros, ya que la model card no publica pesos cuantizados.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`) y vLLM como alternativa habitual para Llama 2. También existe una entrada del mismo linaje de checkpoints en FriendliAI, aunque corresponde a otro checkpoint del barrido.
- Cuantizaciones listas para usar: no hay ninguna publicada; habría que generarlas externamente (por ejemplo, GGUF con llama.cpp o GPTQ/AWQ), asumiendo el riesgo adicional de degradar todavía más el comportamiento de seguridad, que es precisamente el objeto de estudio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_basis_remove40_swapgapnet_b010_r03`) | 6,74 mil millones (fracción densa 0,5999) | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace, 0 descargas | AdvBench ASR 0,0731; StrongREJECT ASR 0,0958; sobrerrechazo 0,2135 |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6,74 mil millones | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente desplegado | No disponible en la información proporcionada |
| `Jeesup/svd-safety-l2_remove40_swapgapnet_b010_r03` (misma regla, ronda completa) | Compresión al 60,00 % de parámetros densos | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace | No disponible en la información proporcionada |
| `Jeesup/svd-safety-l2_remove40_swapdisc_b010` (regla `disc`) | Compresión al 60,00 % de parámetros densos | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace, con endpoint en FriendliAI | No disponible en la información proporcionada |
| `Jeesup/svd-safety-l2_remove50_swapdisc_b010` (compresión al 50 %) | Compresión más agresiva, fracción no detallada | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace | No disponible en la información proporcionada |

Los cuatro checkpoints del mismo autor forman la comparación más directa, porque comparten base, metodología y licencia, y se diferencian en la regla de selección y en el presupuesto de compresión. No se dispone de cifras públicas de los demás para completar la comparación de rendimiento.

## Limitaciones y advertencias

- El propio autor declara que el checkpoint no es un modelo de chat de propósito general y que varias celdas del barrido están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat. No debe desplegarse como asistente.
- La compresión SVD por sí sola eleva la tasa de éxito de ataque; este checkpoint es una ronda intermedia (3 de 10) de un proceso de reparación, por lo que su equilibrio seguridad/utilidad es parcial y no representa el resultado final del estudio.
- Riesgo de alucinación: no cuantificado en la información disponible. Un modelo de 6,74 mil millones de parámetros con un 40 % de parámetros densos eliminados cabe esperar que presente más errores factuales que el original, pero no hay datos publicados al respecto.
- El sobrerrechazo macro de 0,2135 implica que aproximadamente una de cada cinco peticiones benignas en el conjunto de evaluación recibe un rechazo, lo que limita su utilidad práctica incluso en tareas inocuas.
- Idiomas: no documentados. El modelo base está orientado al inglés, y no se ha evaluado el efecto de la compresión sobre otras lenguas; el castellano no está validado.
- Contexto limitado a 4096 tokens, muy por debajo de los estándares actuales, lo que restringe tareas de documento largo.
- Licencia: Llama 2 Community License, que impone condiciones de uso, obligaciones de atribución («Built with Llama 2») y restricciones para determinados casos de uso. El uso comercial requiere revisar `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- Ausencia de cuantizaciones oficiales y de métricas de latencia o throughput: cualquier despliegue en producción exigiría trabajo adicional de validación.
- Repositorio sin tracción (0 descargas, 0 «likes»): no hay evidencia de uso independiente ni de replicación por terceros de las métricas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Variante con regla `swapgapnet_iter` y ronda completa: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_b010_r03
- Variante con regla `disc` y compresión al 40 %: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_b010
- Variante con regla `disc` y compresión al 50 %: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_b010
- Endpoint de inferencia para `svd-safety-l2_remove40_disc_b010` en FriendliAI: https://friendli.ai/models/Jeesup/svd-safety-l2_remove40_disc_b010
- Ficha agregada del linaje `remove40_sigma` en free2aitools: https://free2aitools.com/model/jeesup/svd-safety-l2_remove40_sigma_b010
- Repositorio en GitHub localizado en la búsqueda, relación con este modelo no confirmada: https://github.com/SURUJ404/SDV
- Paper de Basis Sharing (ICLR 2025): no disponible como enlace directo en la información proporcionada.
