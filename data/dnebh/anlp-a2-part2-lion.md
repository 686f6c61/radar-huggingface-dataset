# dnebh/anlp-a2-part2-lion

## Resumen

`dnebh/anlp-a2-part2-lion` es un modelo de lenguaje de tipo decoder-only denso con 33.489.920 parámetros (33,4 M), entrenado para predicción del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`. Se trata de un checkpoint académico publicado como parte de la "Asignación 2" de un curso de Procesamiento de Lenguaje Natural Avanzado (ANLP), cuyo objetivo es comparar el comportamiento de distintos optimizadores implementados desde cero.

La relevancia del modelo no reside en su calidad generativa, sino en que documenta de forma reproducible el efecto del optimizador Lion (implementado sin usar `torch.optim.Lion`, solo subclasificando `torch.optim.Optimizer`) sobre una arquitectura transformer pequeña y un presupuesto de entrenamiento fijo. El entrenamiento completo consumió 48.496.640 tokens, 2.960 pasos y 845,7 segundos, con una pérdida de validación final de 3,2108 y una perplejidad de validación de 24,80.

Por su tamaño y su licencia no declarada, el modelo está pensado para experimentación educativa, estudios de ablación de optimizadores y como línea base en trabajos de investigación, no para despliegue en producción ni para tareas generativas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (configuración 1 de la Parte 1 de la asignatura) |
| Parametros totales | 33.489.920 (33,4 M) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia usada en entrenamiento; no se declara ventana ampliada) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, presumiblemente fp32; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es `browndw/human-ai-parallel-corpus`, previsiblemente en inglés, pero la model card no lo confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, sin mezcla de expertos ni componentes de estado recurrente, entrenado con el objetivo estándar de predicción autorregresiva del siguiente token. La configuración corresponde a la "config 1" de la Parte 1 de la asignatura y cuenta con 33.489.920 parámetros. No se documentan innovaciones arquitectónicas: no hay decodificación especulativa, atención lineal ni variantes híbridas.

El aspecto diferencial es el optimizador. Se emplea Lion implementado desde cero, con `lr = 0.0004`, `betas = [0.9, 0.95]`, `weight_decay = 0.7`, `batch_size = 64`, 2.960 pasos totales, 296 pasos de warmup y 16.384 tokens por paso. El dataset `browndw/human-ai-parallel-corpus` contiene 66.320 filas y se dividió en 7.462 documentos base de entrenamiento, 414 de validación y 414 de test. Tras el troceado en ventanas de 256 tokens se obtuvieron 189.503 ventanas de entrenamiento y 10.539 de validación. El entrenamiento no divergió y se completó en 845,7 segundos. No se reporta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autorregresiva básica, limitada por una ventana de contexto de 256 tokens.
- Predicción del siguiente token sobre texto del dominio del corpus `human-ai-parallel-corpus`.
- Generación comparable a una referencia en la tarea de test del propio corpus (BLEU de test de 0,6164), lo que sugiere cierta capacidad de continuar o transformar texto de ese dominio concreto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio, matemáticas avanzadas, código): no disponibles.

## Casos de uso

- Docencia y cursos de NLP: sirve como ejemplo completo y reproducible de un pipeline de entrenamiento end-to-end desde cero (tokenización, ventanas de 256 tokens, exportación a safetensors) para que el alumnado compare implementaciones de optimizadores.
- Estudio de ablación de optimizadores: dado que existen checkpoints hermanos con el mismo dataset y configuración pero distinto optimizador, este modelo permite aislar el efecto de Lion frente a AdamW en un régimen de 48,5 M de tokens.
- Línea base de investigación: con 33,4 M de parámetros y un coste de entrenamiento de 845,7 segundos, es adecuado como referencia de bajo coste para validar protocolos experimentales antes de escalar a modelos mayores.
- Pruebas de infraestructura de despliegue: su tamaño (repo de 0,1 GB) permite verificar pipelines de carga de safetensors, servidores de inferencia o scripts de exportación sin consumir recursos de GPU significativos.
- Experimentos de modelado de lenguaje en entornos con recursos limitados: puede entrenarse y ejecutarse en CPU o en GPU de gama baja, lo que lo hace útil para laboratorios sin acceso a clúster.
- Análisis de curvas de aprendizaje: la model card publica la curva completa de pérdida de validación y BLEU de test paso a paso, lo que permite usarla como caso de estudio sobre dinámica de convergencia y sobreestimation de BLEU.
- Reproducción de resultados académicos: con semilla 42 y todos los hiperparámetros declarados, permite replicar el entrenamiento y comparar con los checkpoints de otros autores de la misma asignatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación corresponden al propio corpus de entrenamiento y se presentan a continuación.

| Metrica | Valor inicial (paso 0) | Valor final (paso 2.960) |
|---|---|---|
| Perdida de validacion | 9,8065 | 3,2108 |
| Perplejidad de validacion | 18.151,59 | 24,80 |
| BLEU de test | 0,1444 | 0,6164 |
| Tokens vistos | 0 | 48.496.640 |
| Tiempo de evaluacion | 32,30 s | 31,83 s |

Nota: el BLEU de test es muy ruidoso a lo largo del entrenamiento (oscila entre 0,5144 y 0,7212 en distintos puntos de control) mientras la pérdida de validación decrece de forma monótona, por lo que conviene interpretarlo con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 134 MB en fp32 (33.489.920 × 4 bytes), 67 MB en fp16/bf16, 33 MB en int8 y 17 MB en int4. La memoria del KV cache es despreciable con 256 tokens de contexto.
- GPU recomendadas: cualquier GPU moderna es suficiente y sobra. También funciona en CPU. Un modelo de 33,4 M de parámetros no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, en GPU integrada e incluso en dispositivos tipo Raspberry Pi para inferencia en CPU.
- Opciones de despliegue: la model card indica cargarlo con `src.part1.hub.load_exported_model(<folder>)` del repositorio de la asignatura, es decir, mediante código propio sobre PyTorch. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI; usarlos requeriría convertir manualmente los pesos a GGUF u otro formato.
- Latencia y throughput estimados: el entrenamiento procesó 48,5 M de tokens en 845,7 segundos, aproximadamente 57.300 tokens/s, y la evaluación procesó 2.697.984 tokens en unos 31,9 segundos, aproximadamente 84.500 tokens/s. El hardware empleado no se especifica, por lo que estas cifras solo sirven como orden de magnitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dnebh/anlp-a2-part2-lion (este) | 33,4 M | 256 tokens | val loss 3,2108; test BLEU 0,6164 | no disponible | HuggingFace, 0 descargas, 0 likes |
| siddarthg44/anlp-a2-p2-lion | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| irishbumfuzzle/anlp-a2-p2-lion | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| GPT-2 small (referencia general) | 124 M | 1.024 tokens | no comparable directamente | MIT | ampliamente disponible |

Los dos checkpoints hermanos corresponden a la misma asignación y al mismo planteamiento (transformer denso sobre `browndw/human-ai-parallel-corpus` con Lion implementado desde cero), por lo que son el término de comparación más directo, aunque no se han publicado sus métricas en los resultados de búsqueda disponibles. Fuera de ese contexto académico no se identifican modelos comparables de esta categoría con datos verificables.

## Limitaciones y advertencias

- Modelo puramente académico: no ha pasado por ajuste por instrucciones ni por RLHF/DPO, por lo que no sigue instrucciones de forma fiable.
- Ventana de contexto muy corta (256 tokens), lo que impide tareas que requieran contexto largo o conversaciones multi-turno extensas.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio del corpus de entrenamiento; la perplejidad de validación de 24,80 indica un ajuste limitado incluso en el propio dominio.
- Sesgos conocidos: no disponibles. Al no publicarse la composición del dataset ni la licencia, no puede evaluarse el sesgo ni la procedencia del texto de entrenamiento.
- Idiomas soportados: no disponibles. No hay garantía de un comportamiento correcto en castellano ni en idiomas distintos del corpus original.
- Licencia no declarada: la ausencia de licencia explícita impide asumir derechos de uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sobreajuste y ruido en la métrica: el BLEU de test fluctúa de forma no monótona a lo largo del entrenamiento, lo que desaconseja comparar checkpoints intermedios solo con esa métrica.
- Reproducibilidad condicionada: la carga del modelo depende de código específico del repositorio de la asignatura (`src.part1.hub.load_exported_model`), no de una API estándar de HuggingFace Transformers.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, y sin señal de soporte o actualizaciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnebh/anlp-a2-part2-lion
- Informe de entrenamiento en Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part2/runs/n04norj0
- Checkpoint hermano (siddarthg44): https://huggingface.co/siddarthg44/anlp-a2-p2-lion
- Checkpoint hermano (irishbumfuzzle): https://huggingface.co/irishbumfuzzle/anlp-a2-p2-lion
- Material del curso ANLP sobre evaluación: https://cmu-l3.github.io/anlp-spring2026/static_files/anlp-s2026-13-evaluation.pdf
- Dataset de entrenamiento: `browndw/human-ai-parallel-corpus` (referenciado en la model card; no se proporciona URL directa en la información disponible)
