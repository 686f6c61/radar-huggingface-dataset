# rqadri/cca-traj-qwen3-8b-v12

## Resumen

`rqadri/cca-traj-qwen3-8b-v12` es un ajuste fino supervisado (SFT) de parámetros completos sobre `Qwen/Qwen3-8B`, desarrollado por el usuario rqadri dentro del proyecto `long_ctx_train`. El modelo está especializado en imitar el texto de trayectorias de agentes de código (CCA, coding-agent trajectories): conversaciones multi-turno con llamadas a herramientas, edición de ficheros y razonamiento intermedio, generadas por profesores de pesos abiertos. El objetivo no es mejorar el comportamiento agéntico, sino reproducir la distribución superficial de esas trazas con alta fidelidad.

Técnicamente es un transformer denso de 8.190.735.360 parámetros (aproximadamente 8B) con el tokenizador y la arquitectura de Qwen3-8B, extendido a 131.072 tokens de contexto mediante YaRN con factor 4,0 sobre la ventana nativa de 32.768 y `rope_theta` de 1e6. El entrenamiento se hizo sobre 1.982 secuencias concatenadas de los conjuntos `cca-large-v1` y `cca-large-v2`, con 109,7 millones de tokens supervisados, una época y 248 pasos.

Es relevante ahora como artefacto de investigación: el propio autor documenta que es el ajuste que mejor se aproxima a las trazas de entrenamiento entre las variantes de 8B probadas, pero también el que peor rinde en benchmarks agénticos reales (SWE-bench, Terminal-Bench). Es decir, un caso de estudio útil sobre la diferencia entre aprender texto de trayectorias y aprender la política que las genera, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con RoPE escalado por YaRN |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (`max_position_embeddings`), YaRN factor 4,0 sobre 32.768 |
| Tipos de cuantizacion | no disponible (el repo solo incluye pesos safetensors en bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible en la model card; hereda el tokenizador y la cobertura multilingüe de Qwen3-8B |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

La base es la arquitectura Qwen3-8B sin modificaciones estructurales: transformer decoder-only denso, con atención estándar y RoPE. La única alteración es la configuración de codificación posicional: `rope_scaling` de tipo YaRN con factor 4,0 aplicado sobre la ventana nativa de 32.768 tokens, `rope_theta` de 1e6 y `max_position_embeddings` de 131.072. El autor advierte que deben conservarse ambas claves de RoPE, porque un `rope_scaling` heredado sin `rope_theta` reinicia theta a 10.000 en transformers 5 y degrada el modelo.

El entrenamiento es SFT de parámetros completos a nivel de trayectoria, con una secuencia de entrenamiento por cada generación de contexto de agente y pérdida calculada solo sobre los tramos del asistente. Los datos provienen de `cca-large-v1` (250 ejecuciones, 1.243 secuencias, 61,9M tokens supervisados) y `cca-large-v2` (182 ejecuciones, 739 secuencias, 47,7M tokens supervisados), concatenados hasta 1.982 secuencias y 109,7M tokens supervisados. Se usó bf16, DeepSpeed ZeRO-3 con offload del optimizador a CPU, paralelismo de secuencia Ulysses con 8 rangos, AdamW, scheduler coseno, learning rate 1e-5, 8 secuencias por paso de optimizador y una época (248 pasos). La pérdida pasó de 1,21 en los primeros 6 pasos a 0,78 en los últimos 6. El entrenamiento se ejecutó sobre Intel XPU (Aurora) con el script `train_cca_sft.py` del repositorio `github.com/rifaaQ/long_ctx_train`.

## Capacidades

- Generación de texto conversacional multi-turno con formato de trayectoria de agente.
- Reproducción de trazas de agente de código: llamadas a herramientas, ediciones de ficheros, bloques de razonamiento y respuestas finales con el estilo de los profesores usados en el dataset.
- Razonamiento con modo thinking heredado de Qwen3 (la evaluación EDIT-Bench distingue variantes thinking y fence).
- Ventana de contexto larga efectiva de hasta 131.072 tokens, adecuada para concatenar historiales extensos de herramientas y ficheros.
- Soporte de tool calling y function calling en el formato aprendido de las trazas, siempre que el prompt replique la plantilla de chat de Qwen3.
- Capacidades multilingües heredadas de Qwen3-8B, aunque no se documenta cobertura específica ni evaluación por idioma.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación sobre SFT de trayectorias: sirve como referencia controlada para medir cuánto aprende un modelo del texto de las trazas frente a la política subyacente, comparando NLL en validación y benchmarks agénticos.
- Generación de datos sintéticos de trayectorias: puede producir conversaciones con estructura de agente de código para aumentar datasets de entrenamiento, con revisión humana obligatoria por la brecha documentada frente a benchmarks reales.
- Pruebas de infraestructura de contexto largo: con 131.072 tokens permite validar pipelines de serving (vLLM, TGI) con secuencias muy largas y configuraciones YaRN.
- Evaluación de plantillas de chat y tool calling: útil para comprobar que un pipeline reproduce correctamente el formato de herramientas de Qwen3 antes de pasar a modelos en producción.
- Estudio de olvido catastrófico y deriva: al ser un ajuste de una época sobre dominio estrecho, permite analizar la degradación en tareas generales y agénticas respecto a la base.
- Reproducción de experimentos de entrenamiento distribuido: el setup (ZeRO-3, Ulysses, XPU) y los hiperparámetros están documentados y son replicables.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando el modelo con su base Qwen3-8B con YaRN x4:

| Benchmark | Este modelo | Base |
|---|---|---|
| NLL en validación v1 / v2 (held-out) | 0,749 / 0,795 | 1,034 / 1,167 |
| EDIT-Bench thinking / fence (108) | 31 / 34 | 36 / 46 |
| SWE-bench (77), claude-code / cca | 1 / 4 | 3 / 12 |
| Terminal-Bench (56), claude-code / cca | 0 / 0 | 1 / 4 |

La lectura del autor es explícita: es el mejor ajuste a las trazas de entrenamiento de las variantes de 8B probadas y, a la vez, el peor en benchmarks agénticos. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16,4 GB solo de pesos, más caché KV; con 131.072 tokens de contexto la caché KV crece de forma significativa y exige GPUs de 80 GB o paralelismo tensorial para secuencias completas.
- GPU recomendadas: A100 80 GB, H100 80 GB o AMD MI300X para contexto completo en bf16; para contextos moderados (8k-32k) una RTX 4090 de 24 GB puede alojar los pesos, pero no la ventana máxima.
- En GPU de consumo: viable en RTX 4090, RTX 3090 (24 GB) o RTX 5090 con cuantización, aunque no se publican pesos GGUF; habría que generarlos a partir de los safetensors.
- Opciones de despliegue: transformers 5.x con las claves RoPE correctas; text-generation-inference (el repo declara compatibilidad con endpoints); vLLM para serving con contexto largo. En transformers 4.x el `tokenizer_config.json` guardado no carga y hay que usar el tokenizador de `Qwen/Qwen3-8B`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cca-traj-qwen3-8b-v12 | 8,19B | 131.072 (YaRN x4) | SFT de trayectorias de agente | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | ~8B | 32.768 nativo (ampliable) | Modelo generalista con thinking | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen3-8B con YaRN x4 (base del ajuste) | ~8B | 131.072 | Generalista con contexto extendido | Apache 2.0 | Configuración reproducible, no repo separado |

Frente a la base, este modelo mejora la NLL en validación de trazas (0,749 frente a 1,034 en v1) pero empeora en todos los benchmarks agénticos publicados. No se dispone de comparación con otros ajustes de trayectorias de la misma serie (`v1`-`v11`) en la información proporcionada.

## Limitaciones y advertencias

- Brecha entre ajuste y capacidad: el autor documenta explícitamente que el modelo aprende el texto de las trayectorias pero no el comportamiento del agente; SWE-bench cae de 12 a 4 y Terminal-Bench de 4 a 0 respecto a la base en la configuración cca.
- Riesgo alto de alucinación en formato: puede generar trazas verosímiles con llamadas a herramientas, rutas o resultados inventados, especialmente fuera de la distribución de `cca-large-v1`/`v2`.
- Sesgos: no evaluados ni documentados; al entrenarse solo con trazas de profesores de pesos abiertos, hereda sus sesgos de estilo y de resolución de problemas.
- Contexto: la ventana de 131.072 depende de una configuración YaRN concreta; un `rope_scaling` mal migrado reinicia `rope_theta` a 10.000 y degrada la calidad en contextos largos.
- Compatibilidad: el `tokenizer_config.json` guardado no carga en transformers 4.x; hay que usar el tokenizador de Qwen3-8B.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin evaluación de seguridad ni de producción; no se recomienda desplegarlo en flujos reales sin validación propia.
- Sin cuantizaciones publicadas ni datos de latencia, throughput o consumo de VRAM medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rqadri/cca-traj-qwen3-8b-v12
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de entrenamiento y resultados: https://github.com/rifaaQ/long_ctx_train
- Protocolo de evaluación y cifras: `longctx/results.md` dentro del repositorio anterior
