# Jeesup/svd-safety-l2_swift_remove20

## Resumen

`Jeesup/svd-safety-l2_swift_remove20` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se ha aplicado compresión SVD-LLM, eliminando el 20,00 % de los parámetros (fracción resultante declarada: 0,7999). Forma parte de una rejilla experimental que cruza reglas de selección de componentes con presupuestos de restauración; esta celda concreta usa la regla `unknown` y un presupuesto de restauración del 0,000 %, es decir, cero componentes recuperados. La semilla declarada es 42 y el repositorio contiene `LICENSE.txt` y `USE_POLICY.md` de Llama 2.

El objetivo del autor es medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. La model card advierte explícitamente de que algunas celdas de la rejilla están degradadas a propósito en seguridad respecto al modelo base y de que este checkpoint no debe tratarse como un asistente desplegable, sino como un sujeto experimental.

La relevancia actual es metodológica: cuantifica el coste de seguridad de las técnicas de compresión de rango bajo, un aspecto poco cubierto en la literatura de eficiencia, y publica métricas de ataque (AdvBench, StrongREJECT) junto a métricas de utilidad (perplejidad en WikiText-2 y sobre-rechazo macro con WildGuard). El repositorio no tiene descargas ni valoraciones, y no publica comparaciones directas contra el modelo sin comprimir.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (heredada del modelo base) |
| Parametros totales | 6.738.415.616 según safetensors; la model card declara una fracción de parámetros resultante de 0,7999 tras eliminar el 20,00 % |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens, heredada del modelo base Llama-2-7b-chat; la model card de este checkpoint no declara una longitud distinta |
| Tipos de cuantizacion | no disponible. Solo se publican pesos en safetensors (13,5 GB, consistente con 16 bits); no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible. La model card no declara idiomas; el modelo base está entrenado mayoritariamente en inglés |
| Licencia | Llama 2 Community License (`license: llama2`), con `LICENSE.txt` y `USE_POLICY.md` incluidos |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Método de compresión | SVD-LLM, 20,00 % de parámetros eliminados |
| Regla de selección de componentes | `unknown` |
| Presupuesto de restauración | 0,000 % de los parámetros densos (0 componentes restaurados, 0 sustituidos) |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |
| Etiquetas | transformers, safetensors, llama, text-generation, llama2, svd, compression, safety, interpretability, conversational, text-generation-inference, endpoints_compatible |
| Fecha declarada de creación / actualización | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only de 32 capas con normalización RMSNorm previa, feed-forward SwiGLU, embeddings rotatorios (RoPE) y atención multi-cabeza, con un vocabulario de 32.000 tokens y 4.096 tokens de contexto. El post-entrenamiento del modelo base consistió, según la documentación pública de Llama 2, en ajuste supervisado seguido de RLHF con muestreo por rechazo y PPO sobre más de un millón de anotaciones humanas. Esta ficha recoge esos datos por herencia del modelo base; la model card de este checkpoint no los documenta ni los modifica.

La modificación específica de este repositorio es una compresión SVD-LLM: se elimina el 20,00 % de los parámetros mediante descomposición en valores singulares con truncamiento basado en el rango, y después se aplica una regla de selección de componentes (`unknown`) con presupuesto de restauración del 0,000 %. Al no restaurarse ningún componente, esta celda representa el escenario de daño por compresión sin reparación posterior. Un detalle que conviene señalar: el recuento de parámetros del checkpoint en safetensors coincide con el del modelo denso sin comprimir (6.738.415.616) y el tamaño del repositorio (13,5 GB) es el esperado para pesos de 16 bits de ese tamaño, mientras que la model card declara una fracción de parámetros resultante de 0,7999. La model card no detalla el procedimiento de re-fusión de los factores SVD ni cómo se materializa esa reducción en los tensores publicados, por lo que la discrepancia no puede resolverse con la información disponible.

## Capacidades

- Generación de texto conversacional: conserva, en principio, la capacidad del modelo base, aunque la model card no publica evaluaciones funcionales de calidad de respuesta.
- Razonamiento, matemáticas y generación de código: no documentado para este checkpoint; no hay métricas tipo MMLU, GSM8K o HumanEval en la información disponible.
- Tool calling / function calling: no documentado. El modelo base Llama-2-7b-chat no incorpora soporte nativo de llamada a herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está orientado al inglés.
- Visión, audio u otras modalidades: no disponibles (modelo exclusivamente de texto).
- Capacidad documentada relevante: comportamiento de rechazo y de seguridad medible mediante ASR en AdvBench y StrongREJECT, más sobre-rechazo macro con WildGuard. Es un modelo diseñado para ser auditado, no para producir respuestas útiles de forma fiable.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI.

## Casos de uso

- Estudio del impacto de la compresión SVD en el alineamiento: usar este checkpoint junto al modelo base sin comprimir para aislar cuánto del ASR medido (0,0135 en AdvBench) se debe a la eliminación del 20 % de parámetros.
- Red-teaming comparativo de celdas: como una de las celdas de la rejilla, sirve de referencia de "daño puro" (0 componentes restaurados) frente a celdas con presupuesto de restauración mayor.
- Auditoría de sobre-rechazo: con un macro de 0,3632 en WildGuard, es un sujeto adecuado para estudiar cómo la compresión desplaza el equilibrio entre seguridad y utilidad conversacional.
- Medición de degradación de fluidez: la perplejidad de 8,7380 en WikiText-2 permite cuantificar el coste en modelado de lenguaje de la truncación SVD, siempre que se compare contra el modelo base evaluado con el mismo pipeline.
- Reproducción de experimentos: la semilla 42 y las métricas publicadas permiten replicar la celda y verificar la variabilidad entre ejecuciones del juez automático.
- Investigación en interpretabilidad de componentes: el etiquetado `svd` e `interpretability` apunta a estudiar qué subespacios singulares concentran el comportamiento de rechazo y cuáles la capacidad general.
- Validación de metodología de evaluación de seguridad: sirve para probar arneses con juez HarmBench, comparar tasas de éxito de ataque entre jueces y detectar sensibilidad del juez a respuestas degradadas.
- Docencia en cursos de seguridad y eficiencia: es un artefacto didáctico claro para ilustrar el compromiso entre compresión, seguridad y utilidad, dado su tamaño manejable (6,74 mil millones de parámetros).

## Benchmarks y rendimiento

| Metrica | Valor | Direccion deseable |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 | menor es mejor |
| StrongREJECT ASR (juez HarmBench) | 0,0319 | menor es mejor |
| Sobre-rechazo macro (WildGuard) | 0,3632 | menor es mejor (menos rechazos injustificados) |
| Perplejidad en WikiText-2 | 8,7380 | menor es mejor |

No se han publicado en la información disponible resultados de benchmarks del modelo base sin comprimir ni de otras celdas de la rejilla, ni métricas de capacidades generales (MMLU, GSM8K, HumanEval). Sin esas referencias no es posible cuantificar desde esta ficha cuánto se ha degradado la seguridad o la utilidad respecto a Llama-2-7b-chat, más allá de la advertencia cualitativa del autor de que la compresión por sí sola eleva la tasa de éxito de ataque.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 13,5 GB solo de pesos, más caché KV. Para 4.096 tokens de contexto, la caché KV es de aproximadamente 2 GB por secuencia, por lo que conviene reservar 16 GB o más.
- VRAM estimada en int8: alrededor de 7 GB de pesos, más caché KV; cabe en GPUs de 12 GB.
- VRAM estimada en 4 bits: alrededor de 4 GB de pesos, más caché KV; viable en GPUs de 8-12 GB, siempre que se genere la cuantización por cuenta propia, ya que no hay versiones publicadas.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) para fp16 con comodidad; A100 o H100 solo si se necesita alto throughput por lotes. Con cuantización de 8 bits, RTX 4070 Ti o RTX 3080 de 12 GB son suficientes.
- Cabe en GPU de consumo: sí, en 24 GB sin cuantizar, y en 8-12 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; TGI, dado que el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`; vLLM cargando los safetensors. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota de producción: el tamaño del repositorio (13,5 GB) y el recuento de parámetros son los del modelo denso, de modo que el ahorro de memoria respecto al base puede ser nulo o marginal en este formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion | Benchmarks de seguridad publicados |
|---|---|---|---|---|---|
| svd-safety-l2_swift_remove20 | 6.738.415.616 (fracción declarada 0,7999) | 4.096 tokens (heredado) | Llama 2 Community License | Artefacto de investigación sobre compresión y seguridad | AdvBench ASR 0,0135; StrongREJECT ASR 0,0319; sobre-rechazo 0,3632; ppl WikiText-2 8,7380 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | Asistente conversacional alineado | no disponible en la información de esta ficha |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.000.000 aprox. | 128.000 tokens | Llama 3.1 Community License | Asistente conversacional e instrucciones | no disponible en la información de esta ficha |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.240.000.000 aprox. | 32.000 tokens | Apache 2.0 | Asistente conversacional e instrucciones | no disponible en la información de esta ficha |

Las cifras de los modelos alternativos proceden de su documentación pública y no de la búsqueda web realizada para esta ficha. La comparación de rendimiento no puede completarse porque solo el checkpoint analizado publica métricas, y estas corresponden a un protocolo de evaluación específico (juez HarmBench y WildGuard) que no es directamente trasladable a las cifras publicadas por otros modelos.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Seguridad potencialmente degradada de forma deliberada: el autor advierte de que la compresión por sí sola eleva la tasa de éxito de ataque respecto a Llama-2-7b-chat; los ASR publicados (0,0135 y 0,0319) no deben interpretarse como una garantía de seguridad.
- Sobre-rechazo elevado: un macro de 0,3632 en WildGuard indica una proporción considerable de rechazos injustificados, lo que limita su utilidad conversacional.
- Sin referencia del modelo base: no hay métricas equivalentes publicadas para Llama-2-7b-chat en esta información, por lo que no puede cuantificarse la pérdida de seguridad ni de utilidad.
- Regla de selección marcada como `unknown` y presupuesto de restauración del 0,000 %: la reproducibilidad del criterio de selección queda comprometida y esta celda es la condición de daño máximo dentro de la rejilla.
- Ambigüedad no resuelta sobre el tamaño efectivo: los safetensors y el tamaño del repositorio corresponden al modelo denso, mientras que la model card declara una fracción de parámetros de 0,7999; el ahorro real de memoria es incierto.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos de un corpus de preentrenamiento de dos billones de tokens de origen web, con infrarrepresentación de idiomas distintos del inglés y sesgos sociales y culturales documentados en la familia.
- Riesgo de alucinación: inherente al modelo base y probablemente agravado por la truncación de rango, sin que existan evaluaciones de veracidad publicadas.
- Limitación de contexto: 4.096 tokens, insuficiente para tareas de contexto largo que hoy se consideran estándar.
- Cobertura lingüística: sin evaluación multilingüe; el uso en castellano no está validado.
- Restricciones de licencia: Llama 2 Community License permite uso comercial bajo condiciones (menos de 700 millones de usuarios activos mensuales, inclusión de copia de la licencia, atribución "Built with Llama" y cumplimiento de la Acceptable Use Policy). Es obligatorio revisar `LICENSE.txt` y `USE_POLICY.md` del repositorio antes de cualquier uso.
- Sin validación externa: cero descargas y cero valoraciones, sin reproducibilidad independiente conocida.
- No apto para producción ni para sistemas que tomen decisiones sensibles sobre personas.
- Se desconoce el conjunto de calibración usado por SVD-LLM y si los datos de ajuste de seguridad se usaron en la truncación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_remove20
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- SVD-LLM (método de compresión referenciado en la model card): https://arxiv.org/abs/2403.07378
- HarmBench (juez de evaluación citado en las métricas): https://arxiv.org/abs/2402.04249
- StrongREJECT (conjunto de ataques citado): https://arxiv.org/abs/2402.10260
- WildGuard (métrica de sobre-rechazo citada): https://arxiv.org/abs/2406.18495
- Nota sobre la búsqueda web: los resultados devueltos corresponden a dominios sin relación con el modelo (páginas comerciales de una casa de joyería), por lo que no aportan enlaces adicionales. Los identificadores arXiv de HarmBench, StrongREJECT, WildGuard y SVD-LLM proceden de conocimiento general y no se han verificado a través de la búsqueda realizada.
