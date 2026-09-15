# Jeesup/svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r01

## Resumen

`svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r01` es un checkpoint de investigación publicado por el usuario de HuggingFace Jeesup. Se trata de `meta-llama/Llama-2-7b-chat-hf` comprimido con la técnica SVD-LLM hasta el 50,01 % de sus parámetros densos (fracción resultante 0,4999) y después editado mediante una ronda de sustitución de parámetros neutra en parámetros, seleccionada por la regla `gap_iter`. No es un modelo de chat de propósito general: es una celda concreta dentro de una rejilla experimental sobre reglas de selección de componentes y presupuestos de restauración.

El problema que aborda es la pérdida de comportamiento de seguridad provocada por la compresión agresiva de modelos. Según el autor, la compresión por sí sola eleva la tasa de éxito de ataques, y el objetivo del estudio es cuantificar ese deterioro y probar si la sustitución selectiva de componentes puede repararlo. Para ello se restauran 541 componentes y se sustituyen otros 541, con 6.097.664 parámetros intercambiados (0,09 % de los parámetros de proyección densos) y una escala de inserción de 0,2.

Arquitectónicamente es un transformer decoder denso de 6.738.415.616 parámetros (≈6,74 B) con pesos en safetensors, heredado íntegramente de Llama-2-7b-chat: misma tokenización, misma ventana de contexto de 4.096 tokens y misma licencia Llama 2 Community License. Su relevancia actual es como artefacto de reproducibilidad para quienes investigan compresión, edición de parámetros e interpretabilidad de mecanismos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada de Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 (≈6,74 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de `meta-llama/Llama-2-7b-chat-hf`; no se modifica en esta ficha) |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas en el repositorio; los pesos se publican en safetensors fp16. Compatible con conversión externa a GGUF/GPTQ/AWQ, si bien el autor no la documenta |
| Idiomas soportados | No declarados en la model card; el modelo base está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Datos adicionales de procedencia: compresión SVD-LLM con 50,01 % de parámetros eliminados, regla de selección `gap_iter`, presupuesto de restauración del 1,000 % de los parámetros densos, 541 componentes restaurados y 541 sustituidos, valor de intercambio `net` (valor de inserción más valor de eliminación del desalojo ordenado por sigma), semilla 42, 1 de 5 rondas iterativas aplicadas y un fragmento por ronda del 0,200 % de los parámetros densos. Tamaño del repositorio: 13,5 GB. Descargas: 192; likes: 0.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat-hf, un transformer decoder autorregresivo con normalización RMSNorm, RoPE y atención causal estándar (no se emplean mecanismos de atención lineal ni decodificación especulativa propios). La modificación consiste en dos operaciones sucesivas: primero una compresión por descomposición en valores singulares con truncamiento consciente (SVD-LLM), que elimina el 50,01 % de los parámetros de las proyecciones densas; después, una edición de parámetros que no añade ni elimina capacidad, sino que intercambia componentes seleccionados por la regla `gap_iter` dentro de un presupuesto del 0,2 % por ronda.

No hay entrenamiento adicional ni ajuste fino por RLHF o DPO en este artefacto: el checkpoint es el resultado de una ronda intermedia (1 de 5) de un proceso iterativo más largo cuyo presupuesto total es del 1,0 % de los parámetros densos. Los parámetros insertados se escalan al 0,2 de la magnitud de los componentes originales, y el valor de intercambio empleado es `net`. No se documentan en la información disponible ni la composición del dataset original de Llama-2 ni el número de tokens de entrenamiento, más allá de lo publicado por Meta para el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base pero degradada por la compresión al 50 % de los parámetros.
- Seguimiento de instrucciones en formato de diálogo (plantilla de Llama-2-chat), con calidad no cuantificada en esta ficha.
- Capacidad de rechazo de peticiones dañinas, objeto de medición del propio estudio: la tasa de éxito de ataque medida en AdvBench es 0,5308 y en StrongREJECT es 0,3642.
- Control de sobre-rechazo medido con WildGuard: 0,1106 macro.
- Funciones de *tool calling* o *function calling*: no disponibles de forma nativa en Llama-2-7b-chat y no documentadas para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está orientado al inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Uso previsto declarado por el autor: artefacto de investigación para medir el equilibrio entre seguridad y utilidad bajo compresión, no asistente desplegable.

## Casos de uso

- Línea base experimental en estudios de compresión: sirve como una de las celdas de la rejilla del autor, permitiendo comparar la regla `gap_iter` frente a otras reglas de selección con el mismo presupuesto del 0,2 % por ronda.
- Medición del deterioro de seguridad por compresión: con AdvBench ASR de 0,5308 y StrongREJECT ASR de 0,3642, permite cuantificar cuánto empeora la resistencia a ataques respecto al modelo sin comprimir dentro de un protocolo con juez HarmBench.
- Calibración de presupuestos de restauración: al ser una ronda intermedia (1 de 5) de una ejecución mayor, sirve para trazar la curva de recuperación de seguridad en función del porcentaje de parámetros restaurados.
- Investigación en interpretabilidad de mecanismos de rechazo: al conocer exactamente los 541 componentes sustituidos y su valor `net`, se pueden correlacionar componentes concretos con cambios observables en la conducta de negativa a responder.
- Evaluación de sobre-rechazo: la métrica de 0,1106 con WildGuard permite estudiar el compromiso entre seguridad y utilidad conversacional, un eje habitual en la literatura de alineamiento.
- Reproducibilidad de experimentos de *model editing*: la semilla 42, el recuento exacto de parámetros intercambiados (6.097.664) y la escala de inserción 0,2 hacen viable replicar la ronda y verificar los resultados publicados.
- Validación de *pipelines* de evaluación de seguridad: dado su tamaño (13,5 GB en fp16), es un sujeto manejable para probar arneses de evaluación automática con jueces LLM antes de escalarlos a modelos mayores.

En ningún caso se recomienda su uso en atención al cliente, generación de código en producción ni ninguna aplicación orientada a usuarios finales, tal como advierte el propio autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5308 |
| StrongREJECT ASR (juez HarmBench) | 0,3642 |
| Macro over-refusal (WildGuard) | 0,1106 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general, ni tampoco las cifras de referencia del modelo base sin comprimir, por lo que no es posible cuantificar desde esta ficha la magnitud exacta de la degradación. El autor afirma explícitamente que la compresión por sí sola eleva la tasa de éxito de ataques, pero no acompaña el valor de partida.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más caché KV; con contexto completo de 4.096 tokens y lote 1 el total ronda los 15-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos más caché, del orden de 9-10 GB en total.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3,5-4 GB de pesos más caché, en torno a 6 GB en total.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en fp16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para fp16 con lote pequeño; RTX 4080 (16 GB) queda al límite en fp16 y holgada en 8 bits; GPU de 8-12 GB solo con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en tarjetas de 12 GB o menos mediante cuantización.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio está etiquetado como compatible con text-generation-inference (TGI) y con endpoints. vLLM es compatible al tratarse de un transformer Llama estándar. llama.cpp y Ollama requieren conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| svd-safety-l2 (este checkpoint) | 6,74 B (50,01 % del denso) | 4.096 tokens | Llama 2 Community License | Pesos safetensors en HuggingFace | AdvBench ASR 0,5308; StrongREJECT ASR 0,3642; over-refusal 0,1106 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | Llama 2 Community License | Pesos safetensors en HuggingFace | No disponible en esta ficha |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | Pesos safetensors y GGUF en HuggingFace | No comparable directamente (métricas distintas) |
| Qwen2-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | Pesos safetensors y GGUF en HuggingFace | No comparable directamente (métricas distintas) |

La comparación de rendimiento entre estos modelos y el checkpoint analizado no es significativa: las tres métricas publicadas son de seguridad y rechazo, no de capacidad general, y no se dispone de las cifras equivalentes de las alternativas en la información proporcionada. La diferencia relevante es de naturaleza: los modelos comparados son asistentes desplegables, mientras que este es un artefacto experimental con seguridad deliberadamente degradada en varias celdas de la rejilla.

## Limitaciones y advertencias

- No es un modelo desplegable: el propio autor lo describe como sujeto experimental y advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- Tasa de éxito de ataque elevada: 0,5308 en AdvBench y 0,3642 en StrongREJECT con juez HarmBench. Cualquier exposición a usuarios finales es desaconsejada.
- La compresión al 50 % de los parámetros densos degrada previsiblemente la calidad general del texto, aunque no se publican métricas de capacidad que lo cuantifiquen.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el del modelo base y probablemente se agrava con la compresión.
- Idiomas: no se declaran idiomas soportados; el modelo base está orientado al inglés y no hay evidencia de buen comportamiento en castellano.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo frente a alternativas de 32k o 128k.
- Licencia: Llama 2 Community License, con las restricciones de la Acceptable Use Policy de Meta y la cláusula de escala (100 millones de usuarios mensuales) aplicable a derivados. El uso comercial exige revisar `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- Restricción adicional: la licencia Llama 2 exige conservar la atribución "Built with Llama 2" en los derivados.
- Procedencia parcial: el checkpoint es una ronda intermedia (1 de 5) de una ejecución mayor, por lo que no representa el resultado final del presupuesto de restauración del 1,0 %.
- Sin métricas de latencia, throughput ni consumo publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r01
- Perfil del autor: https://huggingface.co/Jeesup
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de Llama 2 (Touvron et al., 2023): https://arxiv.org/abs/2307.09288
- Paper de SVD-LLM, técnica de compresión empleada (arXiv:2403.07378): https://arxiv.org/abs/2403.07378
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Documentación de vLLM: https://github.com/vllm-project/vllm
