# dnebh/anlp-a2-part2-adamw

## Resumen

El modelo `dnebh/anlp-a2-part2-adamw` es un transformer denso de tipo decoder-only con 33,4 millones de parámetros, entrenado para predicción del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`. Se trata de un artefacto académico: forma parte de la asignatura ANLP (Advanced Natural Language Processing), concretamente la "Assignment 2, Part 2", cuyo objetivo es comparar el comportamiento de distintos optimizadores implementados desde cero. En este caso el optimizador es AdamW, con una implementación propia y un learning rate de 0,001.

El modelo resuelve una tarea muy acotada: modelado de lenguaje autorregresivo sobre pares humano/IA en inglés, con una secuencia de entrenamiento de solo 256 tokens. Su relevancia no reside en su rendimiento absoluto ni en capacidades de propósito general, sino en su valor como referencia reproducible para estudiar dinámicas de entrenamiento (curvas de pérdida, perplejidad, BLEU) en un régimen de cómputo muy reducido. El entrenamiento completo consumió 48,5 millones de tokens y se completó en aproximadamente 853 segundos.

No se dispone de información sobre la licencia, los idiomas declarados formalmente, el pipeline de inferencia ni el número de capas o cabezas de atención. La model card proporciona los hiperparámetros de entrenamiento, las estadísticas del dataset y la curva de evaluación paso a paso, pero no describe la arquitectura interna más allá de "dense decoder-only Transformer (Part 1 config 1)".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (`Part 1 config 1`); numero de capas y cabezas: no disponible |
| Parametros totales | 33.489.920 (metadata de safetensors); 33.358.848 segun la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (seq_len de entrenamiento); contexto maximo soportado no confirmado |
| Tipos de cuantizacion | No disponible (repo distribuido en safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (corpus `browndw/human-ai-parallel-corpus`); lista oficial de idiomas: no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 0,1 GB |
| Fecha de publicacion | 2026-10-02 |

## Arquitectura y entrenamiento

La model card describe el modelo como un "dense decoder-only Transformer (Part 1 config 1, 33.4M params)" entrenado para next-token prediction. No se detallan hiperparámetros arquitectónicos internos (número de capas, dimensión de embedding, número de cabezas de atención, tipo de normalización o de activación), por lo que estos datos deben considerarse no disponibles. Lo que sí se documenta con precisión es la configuración de entrenamiento: optimizador AdamW implementado desde cero (lr 0.001, betas 0.9 y 0.95, eps 1e-8, weight_decay 0.1), batch size de 64, 2.960 pasos totales, 296 pasos de warmup (el 10 %), y 16.384 tokens por paso. La semilla usada fue 42 y el tiempo total de entrenamiento de 852,9 segundos.

El dataset es `browndw/human-ai-parallel-corpus`, un corpus paralelo humano/IA en inglés. Las estadísticas reportadas indican 66.320 filas, con 7.462 documentos base de entrenamiento, 414 de validación y 414 de test. Tras la tokenización, el flujo de entrenamiento contiene 48.512.889 tokens y el de validación 2.698.138, generando 189.503 ventanas de entrenamiento y 10.539 de validación con secuencia de 256. La evaluación se realizó sobre 414 ítems BLEU. No se menciona uso de RLHF, DPO, SFT ni técnicas de decodificación especulativa: el entrenamiento es un preentrenamiento puro de modelado de lenguaje. La pérdida de validación descendió de 9,8065 (paso 0) a 3,1717 (paso 2.960), con una perplejidad final de 23,847.

## Capacidades

- Generacion de texto autorregresiva: modelo de lenguaje causal basico, capaz de continuar secuencias de hasta 256 tokens.
- Modelado de lenguaje sobre texto en ingles orientado a pares humano/IA (parafrasis, reescritura estilo paralelo).
- Traduccion/parafrasis humano-IA dentro del dominio del corpus de entrenamiento (BLEU de test de 0,604).
- No dispone de modo thinking, vision, audio ni multimodalidad.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Capacidad multilingue: no confirmada; el corpus es en ingles.
- Capacidad de codigo y matematicas: no documentada y poco probable con 48,5 millones de tokens de entrenamiento y 33,4 millones de parametros.

## Casos de uso

- Estudio de optimizadores en docencia e investigacion: sirve como punto de referencia reproducible para comparar AdamW frente a otros optimizadores sobre el mismo corpus y configuracion, dado que la model card incluye la curva completa de perdida y BLEU.
- Reproduccion de experimentos academicos: los hiperparametros, la semilla y las estadisticas del dataset estan completamente documentados, lo que permite replicar el entrenamiento con un coste de computo minimo (menos de 15 minutos en una GPU moderna).
- Analisis de curvas de entrenamiento: los datos paso a paso permiten estudiar convergencia, sobreajuste y estabilidad en regimenes de pocos tokens.
- Generacion de texto de dominio restringido: util como baseline sencillo para continuar texto en ingles sobre el estilo del corpus paralelo humano/IA, siempre que las entradas no superen los 256 tokens.
- Experimentos de evaluacion de metricas: el BLEU de 414 items de test facilita estudiar la correlacion entre perdida de validacion y calidad generativa en modelos pequenos.
- Base para fine-tuning didactico: al ser un modelo de 33,4M de parametros, se puede ajustar en una unica GPU de consumo para practicar tecnicas de SFT o LoRA sin infraestructura dedicada.
- Pruebas de pipelines de exportacion y carga: util para validar flujos que usan `src.part1.hub.load_exported_model(<folder>)` en el repositorio de la asignatura.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles provienen de la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Paso 0 | Paso 1.184 | Paso 2.072 | Paso 2.960 (final) |
|---|---|---|---|---|
| val_loss | 9,8065 | 3,5634 | 3,2614 | 3,1717 |
| val_ppl | 18.151,59 | 35,28 | 26,09 | 23,85 |
| test_bleu | 0,1444 | 0,6091 | 0,6063 | 0,6040 |

Resumen final reportado: val loss 3,1717; val perplexity 23,8473; test BLEU 0,603999721600787; 48.496.640 tokens procesados; sin divergencia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 134 MB (33,4M parametros x 4 bytes) mas activaciones, holgadamente por debajo de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 67 MB de pesos mas activaciones.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100) para inferencia; cualquier GPU con mas de 2 GB de VRAM es suficiente. Para reentrenar, una sola GPU de consumo moderna es suficiente dado el tiempo de entrenamiento reportado (852,9 s).
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp, Ollama u otros servidores estandar. La model card indica cargar el modelo con `src.part1.hub.load_exported_model(<folder>)` desde el repositorio de la asignatura.
- Latencia y throughput: no disponibles.
- Nota: al no publicarse versiones GGUF ni cuantizadas, el despliegue se limita al script de carga propietario del autor.

## Comparativa con modelos similares

Existen otros checkpoints de la misma asignatura y del mismo tipo de experimento, encontrados en la busqueda web. No se dispone de datos tecnicos detallados de ellos mas alla de su descripcion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dnebh/anlp-a2-part2-adamw` | 33,4 M | 256 | val_loss 3,1717; test BLEU 0,604 | no disponible | HuggingFace |
| `unignoramus/anlp-a2-p2-adamw` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `irishbumfuzzle/anlp-a2-p2-adamw` | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Los tres corresponden a la misma tarea (ANLP Assignment 2, Part 2) con el mismo optimizador (AdamW) y corpus. No se dispone de modelos de referencia comparables con datos verificables publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 33,4 millones de parametros: capacidad generativa muy limitada, sin razonamiento complejo, codigo ni matematicas.
- Ventana de contexto de solo 256 tokens, insuficiente para tareas de dialogo largo, resumen extenso o analisis de documentos.
- Entrenado con solo 48,5 millones de tokens sobre un unico corpus: altisimo riesgo de sobreajuste al dominio y de alucinacion fuera de el.
- Corpus en ingles: el comportamiento en castellano u otros idiomas no esta documentado ni garantizado.
- Licencia no especificada: no se puede confirmar la legalidad de un uso comercial sin consultar al autor.
- Sesgos: el corpus paralelo humano/IA puede introducir sesgos propios de la generacion sintetica; no se han publicado analisis de sesgo.
- Artefacto academico: no esta pensado para produccion, carece de pipeline declarado, soporte de tool calling, API estandar o integracion con servidores de inferencia.
- No existen cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue ligero.
- La carga requiere el repositorio de la asignatura y la funcion `src.part1.hub.load_exported_model`, no compatible directamente con `transformers` estandar salvo reconfiguracion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnebh/anlp-a2-part2-adamw
- Run de entrenamiento en Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part2/runs/8tobob2s
- Checkpoint hermano: https://huggingface.co/unignoramus/anlp-a2-p2-adamw
- Checkpoint hermano: https://huggingface.co/irishbumfuzzle/anlp-a2-p2-adamw
- Referencia sobre el algoritmo AdamW: https://zeromathai.com/en/adamw-en/
