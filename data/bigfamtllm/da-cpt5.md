# BigFamTLLM/da-cpt5

## Resumen

da-cpt5 es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) construido sobre la arquitectura Qwen3 y desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata del quinto checkpoint de una serie de diez dentro de un proceso de preentrenamiento continuado (continued pretraining, CPT) en noruego a partir de un modelo entrenado originalmente en danés (da-emb). No es un modelo ajustado a instrucciones: es un modelo base pensado para investigación.

El modelo parte de da-emb (derivado de da-base, entrenado desde cero en danés) y se adapta al noruego mediante un tokenizador nuevo de 32.000 tokens, 1.000 pasos de entrenamiento solo de embeddings y 13.260 millones de tokens noruegos vistos hasta este checkpoint (paso 24.300 de 48.600). La mezcla de datos noruegos es 85% Bokmål y 15% Nynorsk, procedente de HPLT 4.0.

Su relevancia es acotada y de carácter experimental: sirve para estudiar la transferencia entre lenguas germánicas escandinavas (danés a noruego), el efecto del cambio de tokenizador y el impacto del annealing, no para uso en producción. Los propios autores lo describen como un modelo de investigación entrenado con texto web que puede generar salidas erróneas u ofensivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención y 17 de KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors en bfloat16) |
| Idiomas soportados | danés (da), noruego (no), Bokmål (nb), Nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura replica Qwen3 en configuración pequeña: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA con ratio 2:1) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW, learning rate pico de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

La adaptación al noruego se articula en tres piezas. Primero, un cambio de tokenizador: los tokens compartidos entre ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Segundo, 1.000 pasos de entrenamiento restringido a embeddings. Tercero, preentrenamiento continuado sobre 13,26B tokens noruegos de HPLT 4.0 (85% Bokmål, 15% Nynorsk). Este checkpoint corresponde al paso 24.300 de 48.600, es decir, aproximadamente la mitad del CPT. Existe una fase posterior de annealing de 916 pasos (0,48B tokens) con decaimiento lineal a cero sobre datos de alta calidad, pero no está incluida en este checkpoint (sí en da-cpt5-anneal). La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en danés y noruego (Bokmål y Nynorsk); el modelo base no está alineado ni ajustado a instrucciones.
- Continuación de texto y modelado de lenguaje puro, sin formato conversacional ni plantillas de chat.
- Comprensión lectora y respuesta a preguntas en noruego, evaluada mediante NorEval 1.1 (lectura, ortografía, conocimiento del mundo y tareas lingüísticas).
- Capacidad multilingüe limitada al par danés-noruego; no hay evidencia de competencia en otras lenguas.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio.
- No se han documentado capacidades de generación de código o matemáticas; los benchmarks publicados no las cubren.

## Casos de uso

- Investigación sobre transferencia entre lenguas: comparar este checkpoint con da-cpt1 a da-cpt10 y con las versiones annealed permite medir cómo evoluciona la adaptación del danés al noruego a lo largo del CPT, usando NorEval 1.1 como métrica.
- Estudio del cambio de tokenizador: el modelo sirve para analizar el impacto de la inicialización de embeddings nuevos a partir de la media de las piezas del vocabulario anterior, un experimento replicable con los scripts del proyecto.
- Evaluación de robustez lingüística: el conjunto de tareas con ruido publicado por los autores (0,382 en limpio frente a -0,045 de media bajo ruido) permite estudiar la degradación del modelo ante perturbaciones en noruego.
- Generación de texto noruego como base para fine-tuning: al ser un modelo base de 2,12B con contexto de 4096, puede servir de punto de partida para ajustes supervisados posteriores en dominios concretos, siempre que se respete su naturaleza experimental.
- Experimentos académicos de eficiencia: su tamaño permite entrenar y evaluar en un único nodo de 8 GPU GH200, lo que lo hace útil para reproducir configuraciones de Megatron-LM a pequeña escala.
- Análisis de sesgos y calidad en corpus web: al estar entrenado sobre HPLT 4.0, es un caso de estudio para medir qué tipo de sesgos y errores introduce el texto web noruego en un modelo pequeño.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines de agentes: carece de ajuste a instrucciones, tool calling y garantías de calidad.

## Benchmarks y rendimiento

NorEval 1.1, resultados publicados en la model card:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,224 | 0,242 |
| nob_orthography | acc | 0,817 | 0,836 |
| nob_reading | f1 | 0,235 | 0,226 |
| nob_world | acc | 0,291 | 0,293 |
| nno_language | em_first | 0,411 | 0,519 |
| nno_world | acc | 0,303 | 0,310 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,382 en entrada limpia y -0,045 de media bajo ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB con contexto moderado.
- En cuantización de 8 bits, alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB, aunque no se han publicado ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas para entrenamiento o inferencia a gran escala: GH200 (configuración usada por los autores), A100 y H100. Para inferencia, cualquier GPU con al menos 8 GB de VRAM es suficiente en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se use bfloat16 o cuantización.
- Opciones de despliegue: transformers (soporte oficial, con `dtype=torch.bfloat16`), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt5 | 2,12B | 4.096 | da, no, nb, nn | no disponible | Checkpoint intermedio de CPT, sin annealing |
| BigFamTLLM/da-cpt5-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Misma arquitectura con annealing sobre datos de alta calidad |
| BigFamTLLM/no-base | 2,12B (misma arquitectura) | 4.096 | no, nb, nn | no disponible | Entrenado desde cero en noruego, sin adaptación desde danés |
| BigFamTLLM/da-base | 2,12B (misma arquitectura) | 4.096 | da | no disponible | Modelo original danés del que deriva esta rama |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales; requiere few-shot o fine-tuning para tareas dirigidas.
- Entrenado sobre texto web de HPLT 4.0: puede reproducir sesgos, estereotipos y contenido ofensivo presente en el corpus, tal como advierten los propios autores.
- Riesgo de alucinación alto, especialmente en tareas de conocimiento del mundo (nob_world 0,291 de accuracy en 0-shot), lo que refleja un conocimiento factual limitado.
- Contexto corto (4.096 tokens) en comparación con modelos actuales, lo que restringe tareas de documento largo.
- Cobertura lingüística reducida a danés y noruego; no hay evidencia de competencia en otras lenguas pese a la etiqueta multilingüe del proyecto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; hay que contactar con los autores antes de cualquier despliegue.
- Es un checkpoint intermedio (paso 24.300 de 48.600): el rendimiento es inferior al de la versión final de la serie y al de la variante con annealing.
- Robustez limitada ante ruido: -0,045 de media en las pruebas de robustez, lo que indica degradación apreciable con entradas perturbadas.
- Los autores lo declaran explícitamente no apto para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt5
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Modelo original danés: https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing de este checkpoint: https://huggingface.co/BigFamTLLM/da-cpt5-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Repositorio del proyecto (todos los checkpoints): https://huggingface.co/BigFamTLLM
