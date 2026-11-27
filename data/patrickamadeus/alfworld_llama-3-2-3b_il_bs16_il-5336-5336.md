# patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.5336.5336

## Resumen

El modelo `alfworld_Llama-3.2-3B_IL_bs16_IL.5336.5336` es un ajuste fino completo de `meta-llama/Llama-3.2-3B-Instruct` realizado por el usuario patrickamadeus sobre el conjunto de datos `osunlp/early-experience` (partición alfworld). Su propósito es resolver tareas de ALFWorld, un entorno de TextWorld con tareas domésticas donde el agente debe navegar por habitaciones, manipular objetos y completar instrucciones expresadas en lenguaje natural. El modelo se entrena mediante imitation learning sobre trayectorias expertas en formato (estado -> acción), con 21.335 filas expertas y 4 épocas completas.

Se trata de un checkpoint de investigación, no de un modelo de propósito general: el autor lo publica como artefacto reproducible de un estudio sobre "early experience" e "imagined experience" en agentes basados en LLM. El nombre codifica la receta completa (benchmark, modelo base, algoritmo, batch, etapa y pasos), lo que facilita la trazabilidad experimental. Con 3.212.749.824 parámetros y una longitud máxima de entrenamiento de 4.096 tokens, el modelo está pensado para ser evaluado dentro del bucle de ALFWorld, no como asistente conversacional abierto.

La relevancia actual es metodológica: demuestra que un ajuste fino supervisado de un modelo de 3B puede alcanzar tasas de éxito del 65 % en `valid_seen` y del 56,5 % en `valid_unseen` en ALFWorld, sirviendo como línea base de imitación frente a variantes con modelado implícito del mundo o autorreflexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base Llama 3.2 soporta oficialmente 8 idiomas, pero el ajuste se orienta a instrucciones de ALFWorld en inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura Llama 3.2 estándar (transformer decoder-only con atención causal, RoPE y GQA), sin modificaciones estructurales; el autor aplica un ajuste fino completo sobre `meta-llama/Llama-3.2-3B-Instruct`. El entrenamiento usa LlamaFactory en modo SFT, con learning rate 1e-5, scheduler coseno con 3 % de warmup por etapa, precisión bf16, AdamW paginado de 8 bits, longitud máxima de 4.096 tokens y semilla 0. La etapa publicada (`IL.5336.5336`) corresponde a 5.336 pasos de optimizador con batch efectivo de 16 filas, es decir, 4,00 épocas sobre 21.335 filas expertas de la partición alfworld de `osunlp/early-experience`, usada sin modificaciones.

El objetivo de entrenamiento es imitation learning puro: imitar la acción del experto dado el estado textual del entorno. No se reporta RLHF, DPO ni ningún tipo de refinamiento por preferencias; tampoco decodificación especulativa ni atención lineal. La innovación es de protocolo experimental (nomenclatura reproducible de etapas y checkpoints, con provenance explícita en el repositorio `imagined-experience`), no arquitectónica.

## Capacidades

- Generación de acciones para el entorno ALFWorld: dado un estado textual (observación, inventario, historial), produce el siguiente comando válido del agente.
- Razonamiento de sentido común sobre tareas domésticas: localizar objetos, abrir contenedores, encender aparatos, calentar o limpiar objetos según la instrucción.
- Seguimiento de instrucciones multi-paso en episodios de hasta 50 pasos.
- Procesamiento de contexto textual largo dentro de la ventana de 4.096 tokens (historial de observaciones y acciones).
- Capacidades heredadas del modelo base (Llama-3.2-3B-Instruct): generación de texto general, código y matemáticas básicas, si bien el ajuste fino está especializado y degrada su comportamiento conversacional genérico.
- No dispone de tool calling estructurado, function calling nativo, modo thinking, visión ni audio.
- Soporte multilingüe: no disponible en la información proporcionada; el ajuste se realiza sobre instrucciones en inglés de ALFWorld.

## Casos de uso

- Investigación en agentes LLM para entornos TextWorld: usar el checkpoint como línea base de imitation learning en ALFWorld y comparar contra variantes con world modeling implícito o autorreflexión, tal como hace el paper de referencia.
- Reproducción de experimentos: la nomenclatura del nombre y el provenance documentado permiten reentrenar exactamente la misma receta (LlamaFactory SFT, lr 1e-5, bs16, 4 épocas) y verificar las tasas de éxito publicadas.
- Evaluación de robustez a la distribución: medir la caída de rendimiento entre `valid_seen` (65,0 %) y `valid_unseen` (56,5 %) para estudiar generalización en tareas domésticas.
- Generación de trayectorias sintéticas: ejecutar el modelo en ALFWorld para producir episodios que sirvan como datos de arranque en pipelines de aprendizaje por imitación o de "early experience".
- Estudio de alineación acción-lenguaje: analizar qué comandos genera el modelo ante estados ambiguos y cómo se relaciona con el éxito del episodio, útil para depurar formatos de acción.
- Base para ajustes posteriores: al ser un full fine-tune de Llama-3.2-3B-Instruct, puede servir como punto de partida para entrenamientos con RL (por ejemplo, PPO o GRPO) sobre recompensas del entorno ALFWorld.
- Docencia y demostraciones: ejemplo compacto (3B) de cómo se ajusta un LLM para control de agentes con datos expertos y se evalúa con intervalos de confianza.

## Benchmarks y rendimiento

Tasa de éxito (%) en ALFWorld, 3 episodios por partida, temperatura 0,4, top_p 1,0, 50 pasos, media sobre partidas con IC del 95 %:

| Split | Media de 3 muestras | Primera muestra |
|---|---|---|
| valid_seen (140 partidas) | 65,0 (57,6-72,1) | 67,1 (59,3-75,0) |
| valid_unseen (134 partidas) | 56,5 (49,3-63,7) | 59,7 (51,5-67,9) |

Referencia del paper "Early Experience" (Tabla 4, Llama-3.2-3B, ALFWorld): imitation 78,1; implicit world modeling 83,6; self-reflection 85,9. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 6,4 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 8-10 GB para contextos de 4.096 tokens.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ/AWQ) para reducir requisitos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para evaluación por lotes a gran escala; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso RTX 4070 Ti (12 GB) con contextos moderados; en GPUs de 8 GB requeriría cuantización a 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (estos dos últimos previa conversión a GGUF), y Transformers con `accelerate` para evaluación sencilla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ALFWorld valid_seen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alfworld_Llama-3.2-3B_IL (este) | 3,2 B | 4.096 | 65,0 % (media de 3) | llama3.2 | Hugging Face |
| Llama-3.2-3B-Instruct con implicit world modeling (paper) | 3,2 B | no disponible | 83,6 % | llama3.2 | No publicado como checkpoint en la información disponible |
| Llama-3.2-3B-Instruct con self-reflection (paper) | 3,2 B | no disponible | 85,9 % | llama3.2 | No publicado como checkpoint en la información disponible |
| Llama-3.2-3B-Instruct base (sin ajuste ALFWorld) | 3,2 B | 128 K (modelo base) | no disponible | llama3.2 | Hugging Face |

La comparación con las variantes del paper es la más directa: mismo modelo base y mismo benchmark, pero con recetas de entrenamiento distintas (imitation pura frente a modelado implícito del mundo y autorreflexión). No se dispone de datos para comparar con otros agentes ALFWorld de tamaños distintos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado exclusivamente para ALFWorld; su uso como asistente general producirá respuestas degradadas o formatos de acción fuera de lugar.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base Llama-3.2-3B-Instruct y los del dataset `osunlp/early-experience`.
- Riesgo de alucinación: alto en el sentido de generar acciones no válidas para el entorno (objetos inexistentes, comandos mal formados), lo que en ALFWorld se traduce en pasos perdidos y menor tasa de éxito.
- Brecha seen/unseen: la caída de 65,0 % a 56,5 % indica menor robustez ante distribuciones no vistas de tareas domésticas.
- Limitación de contexto: 4.096 tokens de entrenamiento; episodios largos con historial extenso pueden exceder la ventana y truncar información relevante.
- Restricciones de licencia: Llama 3.2 Community License, con condiciones de uso comercial y de redistribución; conviene revisar los términos antes de un despliegue en producción, especialmente la cláusula de nomenclatura y los límites de usuarios mensuales.
- Caveat de producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay garantías de mantenimiento, soporte ni versionado estable.
- Idiomas: no se documenta soporte multilingüe para el ajuste; las instrucciones de ALFWorld están en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.5336.5336
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/early-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Referencia del paper "Early Experience" (Tabla 4): no disponible como enlace en la información proporcionada
