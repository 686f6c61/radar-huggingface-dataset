# BigFamTLLM/da-cpt7

## Resumen

da-cpt7 es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un equipo de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata del checkpoint 7 de 10 de un proceso de preentrenamiento continuado (continued pretraining, CPT) sobre noruego, partiendo de un modelo danés (`da-emb`) que a su vez deriva de `da-base`. El objetivo del proyecto es comparar el entrenamiento desde cero en noruego con la adaptación de modelos daneses y multilingües al noruego bajo la misma arquitectura y presupuesto de cómputo.

El modelo emplea la arquitectura Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención con 17 cabezas KV, embeddings atados) con un tokenizador noruego específico de 32k entradas y una longitud de contexto de 4096 tokens. Ha visto 18.360 millones de tokens noruegos procedentes de HPLT 4.0, con una mezcla del 85% en bokmål y 15% en nynorsk. Es un modelo base, sin ajuste por instrucciones, por lo que no responde a formato conversacional ni a directivas.

Su relevancia es fundamentalmente investigadora: forma parte de una matriz de 50 modelos (noruego, danés y multilingüe desde cero, más sus variantes adaptadas y con annealing) que permite estudiar el efecto del tokenizador, el idioma de partida y la etapa de annealing en el rendimiento final sobre noruego. Los resultados publicados con NorEval 1.1 son modestos, coherentes con un modelo de 2B parámetros entrenado con un presupuesto limitado (8 GH200).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con los hiperparámetros de Qwen3: 36 capas, dimensión oculta 2176, 34 cabezas de atención con 17 cabezas KV (GQA), y embeddings de entrada y salida atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 en la etapa de solo embeddings).

El proceso de adaptación consta de tres fases. Primero se sustituye el tokenizador por uno noruego de 32k entradas: los tokens compartidos entre ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Después se ejecutan 1000 pasos de entrenamiento solo de embeddings. Finalmente se realiza el preentrenamiento continuado sobre noruego con datos de HPLT 4.0 (85% bokmål, 15% nynorsk), hasta 18.360 millones de tokens vistos. Este checkpoint corresponde al paso 34.020 de 48.600 (checkpoint 7 de 10). La variante `da-cpt7-anneal` añade 916 pasos (0,48B tokens) de annealing con datos de alta calidad en bokmål y nynorsk y decaimiento lineal a cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en danés y noruego (bokmål y nynorsk); es un modelo base, no ajustado por instrucciones.
- Modelado de lenguaje y continuación de texto; no se documenta soporte de formato chat ni de plantillas de instrucciones.
- Comprensión lectora y conocimiento del mundo en noruego, medidas con NorEval 1.1 (lectura, ortografía, lengua y conocimiento del mundo).
- Capacidad multilingüe limitada a los idiomas declarados (da, no, nb, nn); no se documenta cobertura de otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Robustez ante ruido evaluada (0,388 en entrada limpia, -0,043 de media bajo ruido en tres tareas de NorEval).

## Casos de uso

- Investigación sobre adaptación cross-lingüe: sirve como punto de comparación en la matriz de 50 modelos del proyecto para medir el efecto del tokenizador noruego y del preentrenamiento continuado frente al entrenamiento desde cero (`no-base`) y al modelo multilingüe (`ml-base`).
- Estudio de dinámicas de preentrenamiento continuado: al ser el checkpoint 7 de 10, permite analizar la evolución del rendimiento a lo largo del CPT y compararla con los checkpoints 1-6 y 8-10.
- Evaluación comparativa de annealing: la pareja `da-cpt7` / `da-cpt7-anneal` permite aislar el efecto de 916 pasos de annealing con datos de alta calidad sobre el mismo estado del modelo.
- Generación de texto en noruego para experimentos lingüísticos: continuación de texto y generación libre en bokmål y nynorsk dentro de la ventana de 4096 tokens, útil para estudiar fluidez y sesgos en corpus pequeños.
- Investigación en robustez: el modelo incluye una evaluación específica frente a entradas ruidosas, lo que lo hace adecuado para estudiar la degradación de modelos pequeños ante ruido en tareas de NorEval.
- Docencia y reproducción de pipelines: el proyecto documenta el flujo completo (tokenizer swap, entrenamiento con Megatron-LM, conversión con Megatron-Bridge), por lo que sirve como referencia reproducible en cursos de NLP.
- Línea base para fine-tuning posterior: al ser un modelo base de 2,12B con contexto de 4096, puede usarse como inicialización para ajuste supervisado en tareas noruegas específicas, siempre que la licencia lo permita (no disponible).

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,226 | 0,263 |
| nob_orthography | acc | 0,842 | 0,857 |
| nob_reading | f1 | 0,211 | 0,224 |
| nob_world | acc | 0,295 | 0,297 |
| nno_language | em_first | 0,391 | 0,481 |
| nno_world | acc | 0,310 | 0,301 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,388 en entrada limpia y -0,043 de media bajo ruido.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos (el repositorio ocupa 4,2 GB), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB con contexto completo de 4096 tokens.
- En cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB (estimación teórica, no se publican artefactos cuantizados).
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; para entrenamiento o serving de mayor throughput, A100 o H100.
- Despliegue: transformers 4.x (soporte oficial documentado), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; no se documentan artefactos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt7 | 2,12B | 4096 | da, no, nb, nn | no disponible | Checkpoint 7/10 de CPT sobre noruego desde `da-emb`; NorEval 1.1 disponible |
| BigFamTLLM/da-cpt7-anneal | 2,12B | 4096 | da, no, nb, nn | no disponible | Misma base con 916 pasos de annealing; comparable directo |
| BigFamTLLM/no-base | 2,12B (misma arquitectura) | 4096 | no (noruego) | no disponible | Entrenado desde cero en noruego; referencia del proyecto |
| BigFamTLLM/ml-cpt7 | 2,12B (misma arquitectura) | 4096 | multilingüe | no disponible | Adaptación al noruego desde el modelo multilingüe |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue directivas ni mantiene formato conversacional de forma fiable.
- Entrenado sobre texto web (HPLT 4.0): puede generar contenido erróneo u ofensivo; el propio autor advierte que no está pensado para producción.
- Rendimiento modesto en NorEval 1.1: los valores de em_first y f1 en lectura y lengua (0,211-0,481) indican capacidad limitada para un modelo de 2,12B con este presupuesto.
- Ventana de contexto corta (4096 tokens) en comparación con modelos actuales, lo que limita tareas de contexto largo.
- Cobertura lingüística restringida a danés y noruego (bokmål y nynorsk); el comportamiento en otros idiomas no está documentado.
- Licencia no disponible: no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Sesgos no evaluados: no se documentan análisis de sesgo de género, político o cultural.
- Riesgo de alucinación inherente a un modelo base pequeño entrenado con datos web; sin RLHF ni DPO que lo mitiguen.
- Es un checkpoint intermedio (paso 34.020 de 48.600): no representa el estado final del entrenamiento; para resultados finales deben considerarse los checkpoints 8-10 o sus variantes con annealing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt7
- Modelo base (danés, solo embeddings): https://huggingface.co/BigFamTLLM/da-emb
- Modelo danés de partida: https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing de este checkpoint: https://huggingface.co/BigFamTLLM/da-cpt7-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoint multilingüe equivalente: https://huggingface.co/BigFamTLLM/ml-cpt7
- Checkpoint anterior: https://huggingface.co/BigFamTLLM/da-cpt6
- Checkpoint posterior: https://huggingface.co/BigFamTLLM/da-cpt8
- Paper, blog o repositorio del proyecto: no disponible
