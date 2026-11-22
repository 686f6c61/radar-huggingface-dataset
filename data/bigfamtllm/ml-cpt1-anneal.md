# BigFamTLLM/ml-cpt1-anneal

## Resumen

ml-cpt1-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un equipo del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un checkpoint de investigación derivado de ml-cpt1, un modelo multilingüe entrenado desde cero con arquitectura Qwen3 y adaptado al noruego mediante un cambio de tokenizador y preentrenamiento continuado. Esta versión concreta incorpora una fase de "annealing" de 916 pasos adicionales sobre texto noruego de alta calidad (Bokmål y Nynorsk) con decaimiento lineal de la tasa de aprendizaje hasta cero.

El modelo resuelve un problema acotado pero técnicamente interesante: explorar hasta qué punto un modelo multilingüe pequeño puede adaptarse a un idioma concreto (noruego) mediante sustitución de tokenizador y preentrenamiento continuado, en lugar de entrenar desde cero. Forma parte de un estudio comparativo más amplio de 50 modelos que contrasta estrategias de entrenamiento (noruego desde cero, danés desde cero, multilingüe desde cero) y variantes con y sin annealing.

Es relevante ahora como material de referencia para investigadores interesados en adaptación lingüística de bajo coste, tokenización multilingüe y evaluación en noruego (NorEval 1.1). No es un modelo de producción: es un modelo base sin ajuste por instrucciones, entrenado sobre texto web y con un presupuesto de cómputo limitado (8 GPU GH200).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: 36 capas, tamaño oculto de 2176, 34 cabezas de atención con 17 cabezas KV (GQA), embeddings atados y una longitud de secuencia de 4096 tokens. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia (Sigma2), con batch size de 128, optimizador AdamW, tasa de aprendizaje pico de 5e-4, 2000 pasos de warmup y sin decaimiento durante el preentrenamiento principal (1e-4 en la fase de solo embeddings).

El proceso de adaptación al noruego consta de tres fases: sustitución del tokenizador por uno noruego de 32k tokens (los tokens compartidos entre ambos vocabularios conservan su embedding; los nuevos se inicializan con la media de las piezas del tokenizador antiguo), 1000 pasos de entrenamiento solo de embeddings y preentrenamiento continuado sobre noruego. Los datos provienen de HPLT 4.0, con una mezcla noruega del 85% Bokmål y 15% Nynorsk. En total, el modelo ha visto 3,55B tokens noruegos. La fase de annealing de este checkpoint añade 916 pasos (0,48B tokens) sobre texto Bokmål y Nynorsk de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (Bokmål y Nynorsk) y en los idiomas del modelo multilingüe de origen (inglés, danés, alemán, sueco).
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable sin fine-tuning adicional.
- Razonamiento y conocimiento del mundo limitados por el tamaño (2,12B) y el presupuesto de entrenamiento.
- Capacidad multilingüe heredada del modelo ml-base, con especialización posterior en noruego.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Robustez medida frente a ruido: 0,362 en entrada limpia y -0,037 de media bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigación en adaptación lingüística: sirve como punto de comparación para estudiar el efecto del annealing y del cambio de tokenizador en modelos pequeños, dentro del conjunto de 50 modelos del proyecto BigFamTLLM.
- Evaluación de tokenizadores noruegos: permite analizar cómo afecta un vocabulario de 32k tokens específico para noruego al rendimiento en tareas de ortografía y lectura (NorEval 1.1).
- Generación de texto en noruego para experimentos académicos: completado de frases y párrafos en Bokmål y Nynorsk con contexto de 4096 tokens, útil para prototipos de investigación.
- Baseline para fine-tuning supervisado: al ser un modelo base, es un punto de partida razonable para ajuste por instrucciones en noruego con datasets propios.
- Estudio de robustez frente a ruido: los resultados publicados (0,362 limpio, -0,037 bajo ruido) permiten usarlo como referencia en experimentos de evaluación robusta.
- Docencia y reproducción de pipelines: el proyecto documenta todo el flujo (Megatron-LM, Megatron-Bridge, conversión a transformers), lo que lo hace útil como material didáctico para cursos de NLP.
- Comparación de estrategias de entrenamiento: junto con no-base, da-base y ml-base, permite contrastar entrenamiento desde cero frente a adaptación con presupuesto idéntico.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,231 | 0,266 |
| nob_orthography | acc | 0,856 | 0,865 |
| nob_reading | f1 | 0,191 | 0,220 |
| nob_world | acc | 0,288 | 0,288 |
| nno_language | em_first | 0,461 | 0,512 |
| nno_world | acc | 0,291 | 0,299 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,362 en entrada limpia, -0,037 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos (el repositorio ocupa 4,2 GB), más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contexto corto.
- En cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits: alrededor de 1,1 GB (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o GH200 para entrenamiento y evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) en bfloat16 o cuantizado.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están documentados explícitamente, aunque la arquitectura Qwen3 y el formato safetensors facilitan su conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ml-cpt1-anneal | 2,12B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Este modelo; annealing sobre noruego |
| ml-cpt1 | 2,12B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint previo sin annealing |
| no-base-anneal | 2,12B (misma arquitectura) | 4.096 | noruego | no disponible | Entrenado desde cero en noruego, con annealing |
| ml-base-anneal | 2,12B (misma arquitectura) | 4.096 | multilingüe | no disponible | Multilingüe desde cero, con annealing |

Los cuatro modelos comparten arquitectura y presupuesto de cómputo, lo que permite una comparación controlada entre estrategias de entrenamiento. No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible contrastar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no es adecuado para uso conversacional directo ni para seguir instrucciones complejas.
- Entrenado sobre texto web (HPLT 4.0): puede generar contenido incorrecto u ofensivo, según advierte el propio autor.
- El autor indica explícitamente que no está pensado para uso en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo.
- Rendimiento modesto en conocimiento del mundo (0,288 en nob_world y 0,291 en nno_world) y en lectura (0,191 F1 en nob_reading a 0-shot).
- Sensibilidad al ruido: caída media de -0,037 en las tareas evaluadas con entrada ruidosa.
- Cobertura lingüística desequilibrada: la mezcla noruega es 85% Bokmål y 15% Nynorsk, lo que puede penalizar el rendimiento en Nynorsk pese a los resultados relativamente altos en nno_language.
- Proyecto de curso con presupuesto limitado (8 GPU GH200): no compite con modelos de escala similar entrenados con presupuestos mayores.
- Sin datos publicados sobre sesgos específicos, tasas de alucinación ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt1-anneal
- Modelo base (checkpoint previo): https://huggingface.co/BigFamTLLM/ml-cpt1
- Modelo multilingüe de origen: https://huggingface.co/BigFamTLLM/ml-base
- Versión annealing del multilingüe: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Versión annealing del noruego desde cero: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Versión annealing del danés desde cero: https://huggingface.co/BigFamTLLM/da-base-anneal
- Checkpoints CPT multilingües (sin annealing): https://huggingface.co/BigFamTLLM/ml-cpt1, https://huggingface.co/BigFamTLLM/ml-cpt2, https://huggingface.co/BigFamTLLM/ml-cpt3, https://huggingface.co/BigFamTLLM/ml-cpt4, https://huggingface.co/BigFamTLLM/ml-cpt5, https://huggingface.co/BigFamTLLM/ml-cpt6, https://huggingface.co/BigFamTLLM/ml-cpt7, https://huggingface.co/BigFamTLLM/ml-cpt8, https://huggingface.co/BigFamTLLM/ml-cpt9, https://huggingface.co/BigFamTLLM/ml-cpt10
- Checkpoints CPT multilingües (con annealing): https://huggingface.co/BigFamTLLM/ml-cpt2-anneal, https://huggingface.co/BigFamTLLM/ml-cpt3-anneal, https://huggingface.co/BigFamTLLM/ml-cpt4-anneal, https://huggingface.co/BigFamTLLM/ml-cpt5-anneal, https://huggingface.co/BigFamTLLM/ml-cpt6-anneal, https://huggingface.co/BigFamTLLM/ml-cpt7-anneal, https://huggingface.co/BigFamTLLM/ml-cpt8-anneal, https://huggingface.co/BigFamTLLM/ml-cpt9-anneal, https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
- Paper, blog o repositorio del proyecto: no disponible
