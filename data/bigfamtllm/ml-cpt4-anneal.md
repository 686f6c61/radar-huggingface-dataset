# BigFamTLLM/ml-cpt4-anneal

## Resumen

ml-cpt4-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (aproximadamente 2,12B) desarrollado por BigFamTLLM, un proyecto estudiantil del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado a instrucciones) derivado de ml-cpt4, un modelo multilingüe entrenado desde cero con arquitectura Qwen3 y posteriormente adaptado al noruego mediante un cambio de tokenizer y entrenamiento continuado. El modelo resuelve el problema de disponer de un modelo de lenguaje abierto y de tamano moderado con competencia específica en bokmål y nynorsk, algo poco habitual en modelos de esta escala.

La ficha corresponde al checkpoint 4 de 10 del proceso de continued pretraining (paso 19.440 de 48.600), en su versión "annealed": tras el entrenamiento continuado se aplicaron 916 pasos adicionales (0,48B tokens) sobre texto noruego de alta calidad (bokmål y nynorsk) con decaimiento lineal de la tasa de aprendizaje hasta cero. En total, el modelo ha visto 11,20B tokens noruegos. La arquitectura es un transformer denso Qwen3 de 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads) y embeddings atados, con una longitud de contexto de 4096 tokens.

Es relevante ahora porque forma parte de un conjunto de 50 modelos del mismo proyecto que comparan sistemáticamente entrenamiento desde cero frente a adaptación, y versiones con y sin annealing, sobre noruego, danés y multilingüe. El modelo está pensado como objeto de investigación y evaluación, no como producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3 (36 capas, hidden size 2176, 34 attention heads, 17 KV heads, tied embeddings) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, da, de, sv, no, nb (bokmål), nn (nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3 en configuración densa: 36 capas, hidden size de 2176, 34 cabezas de atención con 17 KV heads (GQA) y embeddings atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y tasa de aprendizaje pico de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 en la fase de entrenamiento solo de embeddings). Los datos provienen de HPLT 4.0, con una mezcla noruega compuesta por 85% bokmål y 15% nynorsk.

La adaptación al noruego se hizo en dos fases. Primero se sustituyó el tokenizer por uno noruego de 32k tokens: los tokens compartidos por ambos vocabularios conservan su embedding, y los nuevos se inicializan con la media de las piezas del tokenizer antiguo. Después se aplicaron 1000 pasos de entrenamiento solo de embeddings y continued pretraining sobre noruego. La versión annealed añade 916 pasos (0,48B tokens) sobre texto bokmål y nynorsk de alta calidad con decaimiento lineal de la tasa de aprendizaje a cero. La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configs para que el modelo también cargue en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en noruego (bokmål y nynorsk) y, de forma secundaria, en inglés, danés, alemán y sueco.
- Modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Competencia específica en tareas de lengua noruega: ortografía, comprensión lectora y conocimiento del mundo según NorEval 1.1.
- Capacidad multilingüe derivada de su entrenamiento original multilingüe, aunque el entrenamiento continuado se centra en noruego.
- No se documentan soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre adaptación lingüística: comparar checkpoints con y sin annealing del mismo proyecto para medir el efecto del decaimiento de la tasa de aprendizaje en la calidad final, usando NorEval 1.1 como referencia.
- Evaluación de tokenizers noruegos: analizar cómo afecta un vocabulario de 32k tokens especializado a la fertilidad y al rendimiento en bokmål y nynorsk frente a tokenizers multilingües.
- Generación de texto noruego para corpus sintéticos: producir texto de relleno o aumentación de datos en bokmål y nynorsk, con revisión humana posterior por tratarse de un modelo base.
- Estudio de robustez: el model card reporta 0,396 en entrada limpia y -0,046 de media bajo ruido en tres tareas NorEval, lo que permite usar el modelo como sujeto de experimentos sobre sensibilidad a perturbaciones.
- Fine-tuning posterior para tareas concretas: al ser un modelo base de 2,12B con contexto de 4096, es un punto de partida razonable para ajustar clasificadores o modelos de instrucciones en noruego con recursos modestos.
- Docencia y reproducción de pipelines: el proyecto documenta el flujo completo (Megatron-LM, cambio de tokenizer, Megatron-Bridge) y sirve como material de referencia para entrenar modelos desde cero a esta escala.

## Benchmarks y rendimiento

NorEval 1.1, según el model card:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,238 | 0,285 |
| nob_orthography | acc | 0,862 | 0,874 |
| nob_reading | f1 | 0,241 | 0,263 |
| nob_world | acc | 0,297 | 0,298 |
| nno_language | em_first | 0,445 | 0,539 |
| nno_world | acc | 0,312 | 0,322 |

Robustez (versiones ruidosas de tres tareas NorEval): 0,396 en entrada limpia y -0,046 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,3 GB solo para pesos, más overhead de activaciones y KV cache; con contexto completo de 4096 tokens conviene reservar 6-8 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,2-3 GB para pesos; en 4 bits, en torno a 1,2-2 GB. No se documentan artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 a contexto completo; A100, H100 o GH200 para servir varias peticiones en paralelo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) en bfloat16 o cuantización inferior.
- Opciones de despliegue: transformers (soporte oficial, incluido transformers 4.x), text-generation-inference (tag endpoints_compatible), y herramientas compatibles con safetensors como vLLM. No se documentan GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ml-cpt4-anneal | 2,12B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Modelo base de investigación, NorEval 1.1 disponible |
| ml-cpt4 | 2,12B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Mismo checkpoint sin annealing; comparación directa del efecto del annealing |
| ml-base-anneal | 2,12B (misma arquitectura) | 4.096 | multilingüe | no disponible | Entrenado desde cero multilingüe y annealed; referencia del proyecto |
| no-base-anneal | 2,12B (misma arquitectura) | 4.096 | noruego | no disponible | Noruego desde cero y annealed; alternativa del mismo proyecto |

No se dispone de comparaciones con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones: no debe usarse directamente en interfaces conversacionales ni como asistente.
- Entrenado sobre texto web (HPLT 4.0): puede generar contenido erróneo, sesgado u ofensivo; el propio autor lo declara no apto para producción.
- Rendimiento modesto en comprensión lectora y conocimiento del mundo (f1 de 0,241-0,263 en nob_reading, acc de 0,297-0,298 en nob_world), coherente con su escala y presupuesto de entrenamiento.
- Sensibilidad al ruido: caída media de -0,046 en las tareas de robustez evaluadas.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística desigual: el entrenamiento continuado se centra en noruego; el resto de idiomas listados procede del modelo multilingüe original y no está evaluado en esta ficha.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Al tratarse de un checkpoint intermedio (4 de 10) del proceso de continued pretraining, existen versiones posteriores del mismo proyecto que pueden rendir mejor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt4-anneal
- Modelo base: https://huggingface.co/BigFamTLLM/ml-cpt4
- Modelo de partida multilingüe: https://huggingface.co/BigFamTLLM/ml-base
- Versión multilingüe annealed: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Noruego desde cero annealed: https://huggingface.co/BigFamTLLM/no-base-anneal
- Danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Danés desde cero annealed: https://huggingface.co/BigFamTLLM/da-base-anneal
- Resto de checkpoints del proyecto: https://huggingface.co/BigFamTLLM
