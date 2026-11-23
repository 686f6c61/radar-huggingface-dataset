# namuax/hvme-lm-4b

## Resumen

hvme-lm-4b es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por namuax como parte de hvme, un toolkit de razonamiento causal. Se trata de un ajuste fino mediante LoRA (r=16) sobre Qwen/Qwen3.5-4B, con los pesos fusionados (merged) en el repositorio. El modelo no resuelve problemas causales directamente: está entrenado para formular la pregunta como argumentos de una llamada a herramienta (variables, grafo y probabilidades) y responder a partir del resultado que devuelve el motor causal de hvme.

Su relevancia radica en el enfoque híbrido: en lugar de forzar al modelo a razonar causalmente de forma implícita, lo especializa en la interfaz de tool calling contra un motor determinista que calcula cada cantidad causal. Comparte interfaz de herramientas con hvme-lm-9b, la variante mayor de la misma familia.

El modelo se distribuye bajo licencia Apache-2.0, soporta inglés y coreano, y está pensado para ejecutarse con el bucle de herramientas de hvme (vía transformers o vLLM). Fuera de ese bucle, el modelo se comporta como un Qwen3.5-4B ajustado y sus métricas de evaluación no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajuste fino LoRA r=16 fusionado |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue con vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de tipo causal, y se especializa mediante SFT con LoRA de rango 16 sobre trayectorias de uso de herramientas verificadas por el motor de hvme, generadas con los generadores de hvme Gym en formas superficiales en inglés y coreano. Todas las etiquetas de entrenamiento las calcula el motor; no se emplea ningún ítem de benchmark para el entrenamiento.

Las trayectorias se seleccionan por rejection sampling: solo se conservan aquellas cuyo resultado de herramienta y respuesta final coinciden con la salida del motor. La versión interna v2.18e (2026-11-18) añade 400 trayectorias ETT en inglés como replay sobre v2.18 para corregir una regresión en esa tarea. El modelo expone tres herramientas (`causal_engine`, `causal_graph`, `causal_discovery`) definidas en `hvme.lm.tools.TOOLS` y pasadas a través de la plantilla de chat, con el modo de pensamiento desactivado (`enable_thinking=False`).

## Capacidades

- Generación de texto conversacional en inglés y coreano sobre la base de Qwen3.5-4B.
- Tool calling estructurado: escribe variables, grafo y probabilidades de la pregunta como argumentos de una llamada a herramienta.
- Razonamiento causal formal asistido por motor: cálculo de cantidades causales, construcción de grafos causales y descubrimiento causal a través de las herramientas de hvme.
- Respuesta fundamentada en el resultado del motor, no en razonamiento causal implícito del propio modelo.
- Soporte de bucle de herramientas multi-paso gestionado por el runtime de hvme.
- Modo de pensamiento desactivado por diseño en el flujo de herramientas.
- Capacidades multilingües limitadas a inglés y coreano.

## Casos de uso

- Análisis causal en investigación: el modelo traduce una pregunta en lenguaje natural a los argumentos de `causal_engine`, el motor calcula la cantidad causal y el modelo redacta la respuesta final a partir del resultado. Adecuado porque cada etiqueta está verificada por el motor.
- Construcción y validación de grafos causales: uso de `causal_graph` para formalizar las relaciones entre variables de un estudio antes de estimar efectos, reduciendo errores de especificación manual.
- Descubrimiento causal asistido: invocación de `causal_discovery` para proponer estructuras a partir de datos descritos en la conversación, con el motor como árbitro del cálculo.
- Docencia y formación en inferencia causal: el modelo puede explicar paso a paso cómo se formula un problema (variables, ajuste, independencias) apoyándose en la salida determinista del motor.
- Evaluación de escenarios contrafactuales en entornos controlados: preguntas de tipo SCM binario y declaraciones de independencia resueltas por el motor, útiles en prototipos de análisis de políticas o experimentos.
- Integración en pipelines de agentes: servir el modelo con vLLM y apuntar hvme a ese endpoint para incorporar razonamiento causal verificado a flujos de agentes existentes.
- Asistencia en coreano para tareas causales formales: cobertura de formas superficiales en coreano para equipos que operan en ese idioma, con las cautelas sobre traducciones automáticas indicadas más abajo.

## Benchmarks y rendimiento

Resultados publicados por el autor en modo herramienta (tool mode):

| Benchmark | hvme-lm-4b |
|---|---|
| CaLM-lite | 0.887 |
| CauGym | 0.673 |
| CLadder 150 | 0.880 |
| Gym (held-out) | 0.992 |
| Corr2Cause (muestra de monitorización) | 0.98 |
| KoCLadder (528, media de 3 ejecuciones) | 0.782 |
| KMMLU (muestra) | 0.560 |

No se han publicado en la información disponible resultados comparativos frente a modelos alternativos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,2 B parámetros, en fp16 el peso ronda los 8,4 GB (tamaño del repo), por lo que se necesita una GPU con al menos ~10-12 GB de VRAM contando caché KV y overhead; en cuantización de 8 bits o 4 bits cabría en GPUs consumer de 8 GB o menos, aunque no se publican pesos cuantizados.
- GPU recomendadas: no especificadas por el autor. Para fp16, una RTX 4090 (24 GB), A100 o H100 ofrecen margen holgado; una RTX 3090/4080 también es viable.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090, 4080, 3090 y modelos con 12 GB o más en fp16; en 8 GB requeriría cuantización no publicada.
- Opciones de despliegue: transformers (`HFProvider` de hvme) y vLLM (`vllm serve namuax/hvme-lm-4b --served-model-name hvme-lm-4b --max-model-len 8192`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hvme-lm-4b | ~4,2 B | no disponible | Tool calling contra motor causal (hvme) | Apache-2.0 | Hugging Face |
| hvme-lm-9b | no disponible | no disponible | Tool calling contra motor causal (hvme), misma interfaz | no disponible | Referenciado por el autor |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | Modelo base generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para llamar al motor causal de hvme y responder a partir de su resultado. Sin el bucle de herramientas es un Qwen3.5 ajustado y las métricas de la tabla no aplican.
- Las preguntas de entrenamiento son sintéticas y formales (SCM binarios, grafos causales, declaraciones de independencia). La causalidad en texto y de sentido común (causalidad de eventos, explicación causal) es más débil.
- Los conjuntos de evaluación en coreano son traducciones automáticas. Una revisión de 74 ítems de KoCLadder que el modelo falla solo en coreano encontró 22 errores o ambigüedades de traducción; los otros 52 son fallos del modelo al leer coreano correcto (condiciones negadas, interpretación de "~에 따라 각각" como conjunto de ajuste, paso de conclusión, bucles de repetición).
- Variabilidad entre ejecuciones de entrenamiento: hasta unos 8 ítems en CLadder 150 y 2 puntos en KMMLU; diferencias menores son ruido. Las cifras de KoCLadder son medias de tres ejecuciones con vLLM.
- No apto para decisiones médicas, legales o de política sin que una persona verifique el grafo y los supuestos.
- Riesgo de alucinación inherente a la base Qwen3.5-4B fuera del flujo verificado por el motor.
- Cobertura lingüística limitada a inglés y coreano.
- Sin datos publicados sobre cuantizaciones, contexto máximo real ni rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namuax/hvme-lm-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del toolkit hvme: https://github.com/namuax/hvme
- Documentación de herramientas del LM: https://github.com/namuax/hvme/blob/main/docs/tools.md
