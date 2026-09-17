# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r03

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r03` es un checkpoint investigador derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un modelo entrenado desde cero: es el resultado de comprimir el modelo base con SVD-LLM hasta el 60,0 % de sus parametros densos (se elimina el 40,02 %) y despues aplicar una edicion iterativa de parametros para intentar reparar el comportamiento de seguridad danado por la compresion.

La edicion usa la regla de seleccion de componentes `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos repartido en 10 rondas de 0,1 % cada una. Este checkpoint concreto corresponde a la ronda 3 de 10, con 1.965 componentes restaurados, 1.967 sustituidos y 19.415.040 parametros insertados (0,30 % de los parametros de las proyecciones densas). El artefacto final conserva 6.738.415.616 parametros (fraccion 0,5998) y pesa 13,5 GB en safetensors.

Su relevancia es metodologica: forma parte de un grid experimental disenado para cuantificar como la compresion por SVD degrada la seguridad de un modelo alineado y que regla de seleccion de componentes la recupera mejor con el menor coste. El propio autor advierte que varias celdas del grid estan deliberadamente degradadas en seguridad y que ningun checkpoint debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Llama 2), con proyecciones comprimidas por SVD-LLM y edicion posterior de componentes |
| Parametros totales | 6.738.415.616 (6,74 B); fraccion resultante 0,5998 respecto al modelo denso |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible (la model card no los declara; Llama-2-7b-chat esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresion | SVD-LLM, 40,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 1.965 / 1.967 |
| Parametros insertados | 19.415.040 (0,30 % de los parametros de proyeccion densos) |
| Rondas aplicadas | 3 de 10 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE), 32 capas, 32 cabezas de atencion y vocabulario de 32.000 tokens. Sobre esa base no hay entrenamiento adicional desde cero: el pipeline es (1) compresion SVD-LLM de las matrices de proyeccion, que elimina el 40,02 % de los parametros y deja la fraccion densa en 0,5998, y (2) una fase de edicion de parametros con la regla `gap_iter`.

Esa segunda fase es un procedimiento de intercambio neutro en parametros ("parameter-neutral swap"): en cada ronda se seleccionan componentes y se sustituyen por valores insertados hasta consumir un 0,1 % de los parametros densos, con eviccion ordenada por sigma. En este checkpoint se han ejecutado 3 de las 10 rondas, con 1.965 componentes restaurados, 1.967 sustituidos y 19.415.040 parametros insertados en total (0,30 % de los parametros de las proyecciones densas), bajo semilla 42. El checkpoint es, por tanto, un estado intermedio de una ejecucion mas larga. No se documentan en la informacion disponible fases de RLHF, DPO o ajuste supervisado posteriores a la compresion y edicion.

## Capacidades

- Generacion de texto conversacional en el estilo de Llama-2-7b-chat, con calidad degradada respecto al modelo sin comprimir (no se publican metricas de perplexity ni de calidad de generacion).
- Comportamiento de rechazo evaluable de forma cuantitativa: la model card reporta tasas de exito de ataque (ASR) y de sobre-rechazo, lo que permite medir el efecto de la compresion sobre la alineacion.
- Generacion de texto plano mediante `transformers` con `pipeline_tag: text-generation`.
- Compatibilidad declarada con Text Generation Inference y con endpoints (`text-generation-inference`, `endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta uso como agente ni razonamiento multi-paso explicito.
- No se documenta modo "thinking", vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles; el modelo base esta orientado principalmente al ingles.

## Casos de uso

- Investigacion sobre el impacto de la compresion en la seguridad: el checkpoint es una celda de un grid sobre reglas de seleccion y presupuestos, y sirve para medir cuanto dano introduce la eliminacion del 40,02 % de parametros en el comportamiento de rechazo del modelo base.
- Estudio de reparacion de seguridad mediante edicion de parametros: al ser la ronda 3 de 10, permite comparar estados intermedios de la misma ejecucion y aislar el efecto del presupuesto de restauracion (0,1 % por ronda) sobre las tasas de ASR.
- Evaluacion con jueces automaticos de daño: la model card usa el juez de HarmBench sobre AdvBench y StrongREJECT, de modo que el checkpoint sirve como sujeto de prueba para calibrar y auditar este tipo de evaluadores.
- Analisis de sobre-rechazo en modelos alineados: con un 0,2502 de sobre-rechazo macro medido por WildGuard, es util para estudiar el coste en utilidad que acompanha a las intervenciones de seguridad.
- Reproduccion y validacion de SVD-LLM: el repositorio documenta la fraccion de parametros, la regla de seleccion, la semilla y los recuentos de componentes, lo que permite replicar la compresion y contrastar resultados.
- Interpretabilidad de subespacios singulares: los recuentos de componentes restaurados frente a sustituidos (1.965 / 1.967) permiten analizar que direcciones del espacio de pesos resultan criticas para una conducta concreta.
- Construccion de baselines de eficiencia: con 6,74 B de parametros y 13,5 GB en safetensors, sirve como referencia de coste frente al modelo denso en estudios de latencia, memoria y throughput.
- Auditoria de artefactos derivados de Llama 2: util para equipos que necesitan un caso documentado de derivado con licencia Llama 2 y quieren verificar el cumplimiento de las condiciones de redistribucion.

## Benchmarks y rendimiento

| Metrica | Valor | Comparacion con el modelo base |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0200 | no disponible |
| StrongREJECT ASR (juez HarmBench) | 0,0700 | no disponible |
| Sobre-rechazo macro (WildGuard) | 0,2502 | no disponible |

La model card indica cualitativamente que la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-2-7b-chat, pero no se proporcionan en la informacion disponible los valores numericos del modelo sin comprimir ni de otras celdas del grid, por lo que no es posible establecer una comparacion cuantitativa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de perplexity en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas cache KV y activaciones; con contexto de 4.096 tokens conviene reservar 16-18 GB.
- VRAM estimada cuantizado a 8 bits: unos 6,7 GB de pesos; a 4 bits, unos 3,4 GB. No hay versiones cuantizadas publicadas, por lo que habria que generarlas a partir de los safetensors.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S; el modelo cabe holgadamente y permite lotes grandes.
- GPU de consumo: cabe en fp16 en RTX 3090, RTX 4090 y RTX A6000 (24 GB); en RTX 4080/4070 Ti (16 GB) requeriria cuantizacion a 8 o 4 bits.
- Despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y servidores compatibles con pesos safetensors de Llama. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que no se publica ese formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Seguridad medida |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapgapiter_evfront_b010_r03 | 6,74 B (0,5998 de la fraccion densa) | 4.096 tokens | Llama 2 Community License | safetensors | AdvBench ASR 0,0200; StrongREJECT ASR 0,0700; sobre-rechazo 0,2502 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | Llama 2 Community License | safetensors | no disponible en la informacion proporcionada |
| Otras celdas del grid de compresion y edicion | no disponible | no disponible | Llama 2 Community License | safetensors | no disponible |

No se dispone en la informacion proporcionada de datos comparativos con alternativas de la misma categoria (por ejemplo, otros modelos de 7 B ajustados por instrucciones). Cualquier comparacion de rendimiento con modelos como Mistral-7B-Instruct o Zephyr-7B-beta requeriria medir de nuevo este checkpoint con las mismas herramientas, ya que el estudio no publica esas cifras.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: el propio autor indica de forma explicita que cada celda del grid debe tratarse como un sujeto experimental.
- Degradacion de seguridad inducida: la compresion por si sola eleva la tasa de exito de ataque respecto al modelo base, y varias celdas del grid estan deliberadamente degradadas en seguridad.
- Sesgo de evaluacion: las metricas de seguridad dependen de jueces automaticos (HarmBench, WildGuard); son sensibles al juez, al prompt de evaluacion y al conjunto de ataques, por lo que no deben interpretarse como una medida absoluta de seguridad.
- Sobre-rechazo elevado: 0,2502 de sobre-rechazo macro implican que una fraccion relevante de peticiones benignas se rechaza, lo que limita su utilidad como asistente.
- Riesgo de alucinacion: no se documenta ningun ajuste posterior a la compresion orientado a fidelidad factual; la eliminacion del 40,02 % de parametros puede agravar el comportamiento erratico.
- Contexto limitado: 4.096 tokens, insuficiente para casos de uso con documentos largos o conversaciones prolongadas.
- Idiomas: sin declaracion oficial; el modelo base esta optimizado para ingles y no hay evidencia de calidad en otros idiomas.
- Restricciones de licencia: Llama 2 Community License, con las condiciones habituales de atribucion, requisitos de nombrado de derivados y el limite de 700 millones de usuarios mensuales para la exencion de licencia adicional; `LICENSE.txt` y `USE_POLICY.md` acompanan al repositorio.
- Estado intermedio: es la ronda 3 de 10 de una ejecucion mas larga, por lo que no representa el resultado final del procedimiento de reparacion.
- Sin soporte documentado de tool calling, agentes ni multimodalidad: no debe asumirse ninguna de estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- SVD-LLM (compresion por descomposicion en valores singulares): https://arxiv.org/abs/2403.07378
- HarmBench (juez de seguridad usado en las metricas): https://arxiv.org/abs/2402.04249
- StrongREJECT (conjunto de evaluacion de jailbreak): https://arxiv.org/abs/2402.10260
- WildGuard (medicion de rechazo y seguridad): https://arxiv.org/abs/2406.18495
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a anuncios de armas deportivas y no guardan relacion con el artefacto.
