# Jeesup/svd-safety-l2_remove60_sigma_b010

## Resumen

svd-safety-l2_remove60_sigma_b010 es un checkpoint de investigación publicado por el usuario Jeesup que parte de `meta-llama/Llama-2-7b-chat-hf` y le aplica una compresión estructurada con SVD-LLM, eliminando el 59,03% de los parámetros y dejando una fracción efectiva de 0,4097 respecto al modelo denso original. Sobre esa base comprimida se restauran 5.344 componentes SVD (un 1,000% del presupuesto de parámetros densos) seleccionados con la regla denominada `sigma`, con semilla 42. No es un modelo conversacional de propósito general, sino una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de restauración.

El objetivo del artefacto es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Los datos publicados confirman esa degradación: la tasa de éxito de ataque (ASR) medida con el juez de HarmBench es 0,3692 en AdvBench y 0,3834 en StrongREJECT, muy por encima de lo esperable en un asistente alineado, mientras que el sobre-rechazo macro medido con WildGuard se sitúa en 0,0947 y la perplejidad en WikiText-2 en 17,1368.

Su relevancia actual es metodológica: proporciona un punto de medida reproducible (semilla fija, procedencia documentada) para estudiar el compromiso entre seguridad y utilidad en modelos comprimidos, un área con poca evidencia cuantitativa. El repositorio tiene 0 descargas y 0 likes, y solo incluye pesos en safetensors, sin versiones cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-2) con pesos comprimidos mediante SVD-LLM (descomposición en valores singulares de las matrices de pesos) |
| Parámetros totales | 6.738.415.616 según safetensors del repositorio; el autor declara una fracción de parámetros resultante de 0,4097 respecto al modelo denso |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información; heredada de Llama-2-7b-chat (4096 tokens) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors sin cuantizaciones GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | no disponible; el modelo base está entrenado mayoritariamente en inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat (transformer decoder-only con atención causal y normalización RMSNorm), pero las matrices de pesos han sido transformadas mediante SVD-LLM: se descompone cada matriz en sus factores singulares y se descartan los componentes de menor contribución. En esta celda se eliminó el 59,03% de los parámetros del modelo denso y después se reintrodujeron 5.344 componentes SVD seleccionados por la regla `sigma`, lo que representa un 1,000% del presupuesto de parámetros densos. No se sustituyó ningún componente ("components swapped out: 0").

No hay entrenamiento adicional documentado: el checkpoint es el resultado de una transformación post-hoc sobre los pesos de Llama-2-7b-chat, sin fase de RLHF, DPO ni ajuste fino posterior. La innovación técnica del artefacto no está en el modelo en sí, sino en el protocolo experimental: una rejilla sistemática sobre reglas de selección de componentes SVD y presupuestos de restauración, ejecutada con semilla 42 para garantizar reproducibilidad. La model card no detalla el dataset usado para calibrar la SVD ni el número de tokens de calibración.

## Capacidades

- Generación de texto conversacional básica, heredada de Llama-2-7b-chat, pero degradada por la compresión: la perplejidad en WikiText-2 es 17,1368.
- Razonamiento e instrucciones de complejidad media, con calidad no verificada más allá de las métricas publicadas.
- Comportamiento de rechazo ante peticiones dañinas, pero notablemente debilitado: ASR de 0,3692 en AdvBench y 0,3834 en StrongREJECT con juez de HarmBench.
- Respuesta a estímulos de seguridad medible: sirve como sujeto de prueba para medir sobre-rechazo (0,0947 macro con WildGuard).
- Soporte de tool calling / function calling: no disponible; el modelo base Llama-2-7b-chat no incluye soporte nativo de llamada a herramientas y la model card no declara ninguna adaptación en ese sentido.
- Soporte de agentes y razonamiento multi-paso: no declarado ni evaluado.
- Capacidades multilingües: no declaradas; el modelo base está entrenado predominantemente en inglés.
- Capacidades especiales (modo thinking, visión, audio): ninguna; es un modelo de texto unimodal.

## Casos de uso

- Estudio de la degradación de seguridad bajo compresión: usar este checkpoint como celda experimental para medir cuánto sube la tasa de éxito de ataque al eliminar el 59,03% de los parámetros, comparando el ASR de 0,3692 con el del modelo denso original.
- Comparación de reglas de selección de componentes SVD: la regla `sigma` con presupuesto del 1,000% puede contrastarse contra otras celdas de la misma rejilla para determinar qué criterio repara mejor el comportamiento de rechazo.
- Red-teaming y evaluación de alineación: banco de pruebas controlado para validar que los jueces automáticos (HarmBench judge, WildGuard) detectan degradaciones inducidas por compresión, con una referencia de ASR conocida.
- Investigación en interpretabilidad: análisis de qué componentes singulares concretos (los 5.344 restaurados) son responsables de recuperar la conducta de rechazo y cuáles de la capacidad general.
- Línea base en estudios de compresión: punto de comparación para otras técnicas (poda no estructurada, cuantización, destilación) que usen la perplejidad de WikiText-2 (17,1368) como métrica común.
- Calibración de umbrales de sobre-rechazo: el valor de 0,0947 macro con WildGuard permite ajustar clasificadores de rechazo excesivo en modelos comprimidos, un régimen donde el equilibrio seguridad-utilidad se desplaza.
- Reproducción de experimentos: la semilla fija (42) y la procedencia documentada (componentes restaurados, fracción resultante, presupuesto) permiten replicar la celda de forma determinista.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,3692 |
| StrongREJECT | ASR (juez HarmBench) | 0,3834 |
| WildGuard | Sobre-rechazo macro | 0,0947 |
| WikiText-2 | Perplejidad | 17,1368 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas contra otros modelos.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 13,5 GB solo de pesos, según el tamaño del repositorio (13,5 GB) y los 6.738.415.616 parámetros declarados por safetensors.
- VRAM en 8 bits: del orden de 7 GB de pesos, más overhead de activaciones y caché KV.
- VRAM en 4 bits: del orden de 3,5-4 GB, más overhead; requiere cuantización externa, ya que el repositorio no publica pesos cuantizados.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 sin cuantizar; en tarjetas de 8-12 GB solo con cuantización de 4 bits aplicada por el usuario.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`). Compatibilidad con vLLM, llama.cpp u Ollama no confirmada en la información; no se proporcionan conversiones a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | ASR / seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove60_sigma_b010 | 6.738.415.616 almacenados; fracción efectiva 0,4097 | no disponible (heredado de Llama-2-7b-chat) | Llama 2 Community License | ASR 0,3692 (AdvBench) y 0,3834 (StrongREJECT); sobre-rechazo 0,0947 | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | ~7B | 4096 tokens | Llama 2 Community License | no disponible en la información (referencia de partida del estudio) | HuggingFace, ampliamente distribuido |
| Otras celdas de la rejilla del mismo estudio (otras reglas de selección y presupuestos) | no disponible | no disponible | Llama 2 Community License | no disponible | referenciadas de forma genérica en la model card, sin enlaces |

No se dispone de datos numéricos de otros modelos comprimidos comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la propia model card indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma medible: ASR de 0,3692 en AdvBench y 0,3834 en StrongREJECT, valores muy superiores a los de un modelo alineado listo para uso público.
- Riesgo de alucinación elevado: la perplejidad de 17,1368 en WikiText-2 es sustancialmente peor que la de un modelo denso equivalente sin comprimir.
- Sesgos heredados de Llama-2, sin mitigación adicional documentada.
- Limitación idiomática: no se declaran idiomas soportados y el modelo base está entrenado mayoritariamente en inglés; el rendimiento fuera de ese idioma no está medido.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la ficha.
- Ambigüedad en el recuento de parámetros: safetensors declara 6.738.415.616 parámetros, mientras el autor indica una fracción efectiva de 0,4097; conviene verificar el grafo real antes de planificar el despliegue.
- Restricciones de licencia: Llama 2 Community License y `USE_POLICY.md`; el uso comercial está sujeto a los términos de Meta (incluidas cláusulas de escala y atribución "Built with Llama 2").
- Sin soporte de tool calling, agentes ni multimodalidad, lo que descarta su uso en pipelines que requieran esas capacidades.
- No apto para producción orientada al usuario final (atención al cliente, asistentes, moderación) en su estado actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_sigma_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio del modelo
- Paper de SVD-LLM, paper de HarmBench, paper de StrongREJECT, WildGuard y repositorio del autor: no disponibles en la información proporcionada
