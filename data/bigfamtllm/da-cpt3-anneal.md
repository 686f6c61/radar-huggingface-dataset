# BigFamTLLM/da-cpt3-anneal

## Resumen

da-cpt3-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base, no ajustado por instrucciones, especializado en noruego (bokmål y nynorsk) y derivado de un modelo entrenado originalmente en danés. El modelo parte de da-base, al que se le sustituyó el tokenizador por uno noruego de 32.000 tokens, se le aplicó un entrenamiento de solo embeddings de 1.000 pasos y después se continuó el preentrenamiento sobre texto noruego.

Este checkpoint concreto es el tercero de diez de la cadena de preentrenamiento continuado (paso 14.580 de 48.600) y corresponde a la versión "annealed": tras el entrenamiento principal se realizaron 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en bokmål y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero. En total, el modelo ha visto 8,65B tokens noruegos. La arquitectura es Qwen3 (transformer denso con 36 capas, dimensión oculta 2.176, 34 cabezas de atención con 17 cabezas KV y embeddings atados) y la longitud de contexto es de 4.096 tokens.

La relevancia del modelo es fundamentalmente académica y metodológica: forma parte de un experimento controlado de 50 modelos que compara entrenamiento desde cero frente a adaptación de un modelo danés a noruego, con y sin annealing, para medir el efecto de cada decisión. No está pensado para producción y su rendimiento en NorEval 1.1 es modesto, propio de un modelo base de 2B parámetros entrenado con un presupuesto limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors en bfloat16) |
| Idiomas soportados | Noruego (bokmål y nynorsk); etiquetado también como da y no |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas, dimensión oculta de 2.176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4.096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 durante la fase de solo embeddings). Los datos provienen de HPLT 4.0, con una mezcla noruega compuesta por un 85% de bokmål y un 15% de nynorsk.

La innovación metodológica principal es el intercambio de tokenizador: al pasar del tokenizador danés al noruego (32.000 tokens), los tokens presentes en ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Tras 1.000 pasos de entrenamiento de solo embeddings, se continuó el preentrenamiento en noruego hasta este checkpoint 3. La fase de annealing consistió en 916 pasos adicionales (0,48B tokens) sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. El modelo se convirtió a formato Hugging Face con Megatron-Bridge y los configs se ajustaron para que cargue en transformers 4.x.

## Capacidades

- Generación de texto en noruego bokmål y nynorsk como modelo base (completado de secuencias, no instrucciones).
- Modelado de lenguaje y continuación de texto sobre dominio noruego, con especial énfasis en bokmål (85% de la mezcla).
- Capacidad multilingüe residual limitada: el modelo hereda del entrenamiento danés y multilingüe original, pero no se ha evaluado su rendimiento fuera del noruego.
- No dispone de ajuste por instrucciones, por lo que no soporta de forma fiable diálogo, seguimiento de instrucciones ni formato conversacional.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se documenta una capacidad específica de generación de código o matemáticas; el entrenamiento se centró en texto web noruego.

## Casos de uso

- Investigación sobre adaptación de modelos entre lenguas cercanas: el modelo sirve como punto de comparación controlado dentro de la matriz de 50 modelos del proyecto para medir el efecto del intercambio de tokenizador y del annealing en el rendimiento en noruego.
- Evaluación de tokenizadores para lenguas nórdicas: al usar un vocabulario noruego de 32.000 tokens con inicialización por media de piezas, es útil para estudiar la eficiencia de tokenización y la transferencia de embeddings entre danés y noruego.
- Completado de texto en noruego en entornos de investigación: con 4.096 tokens de contexto puede emplearse para tareas de continuación y perplejidad sobre corpus bokmål y nynorsk, siempre con supervisión humana.
- Generación de datos sintéticos de dominio noruego para experimentos académicos: el modelo puede producir texto de relleno o aumentación de corpus en un entorno controlado, dado su carácter de modelo base.
- Estudio de robustez frente a ruido: la model card reporta métricas de robustez (0,374 en entrada limpia y -0,040 de media bajo ruido) que permiten analizar la degradación del modelo en condiciones adversas.
- Reproducibilidad de pipelines Megatron-LM a Hugging Face: el checkpoint y su conversión con Megatron-Bridge sirven como referencia técnica para replicar el flujo de entrenamiento y exportación en otros proyectos.
- Línea base para fine-tuning posterior en noruego: al ser un modelo base de 2,12B con contexto de 4.096, puede servir como punto de partida para ajustes supervisados en tareas concretas dentro de un entorno de investigación.

## Benchmarks y rendimiento

Resultados en NorEval 1.1 según la model card del autor:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,238 | 0,275 |
| nob_orthography | acc | 0,844 | 0,862 |
| nob_reading | f1 | 0,209 | 0,196 |
| nob_world | acc | 0,293 | 0,295 |
| nno_language | em_first | 0,438 | 0,533 |
| nno_world | acc | 0,298 | 0,304 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,374 en entrada limpia y -0,040 de media bajo ruido.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 6-8 GB con contexto completo de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB, aunque el autor no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); A100, H100 o GH200 para entrenamiento y evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas con 4-6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (el repo incluye la etiqueta endpoints_compatible), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento NorEval |
|---|---|---|---|---|---|
| da-cpt3-anneal | 2,12B | 4.096 | Noruego (bokmål, nynorsk) | No disponible | 0,238-0,862 según tarea (0-shot) |
| no-base-anneal (mismo proyecto) | No disponible en la información | No disponible | Noruego | No disponible | No disponible |
| da-base-anneal (mismo proyecto) | No disponible en la información | No disponible | Danés | No disponible | No disponible |
| ml-base-anneal (mismo proyecto) | No disponible en la información | No disponible | Multilingüe | No disponible | No disponible |

Los modelos comparables más directos son los demás miembros del mismo proyecto BigFamTLLM (no-base-anneal, da-base-anneal, ml-base-anneal), entrenados con la misma arquitectura y presupuesto, lo que permite una comparación controlada. No se dispone de datos de benchmarks de esos modelos en la información proporcionada, ni de comparaciones con modelos noruegos de terceros (por ejemplo, NorBERT o modelos nórdicos de mayor tamaño) que permitan contextualizar el rendimiento.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos coherentes; su uso previsto es la investigación, no la producción.
- El propio autor advierte de que estos modelos de investigación entrenados con texto web pueden producir salidas incorrectas u ofensivas.
- Riesgo de alucinación elevado, acentuado por el tamaño reducido (2,12B) y el presupuesto limitado de entrenamiento (8,65B tokens noruegos).
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentación larga o conversaciones multi-turno extensas.
- Cobertura idiomática restringida: el entrenamiento se centró en noruego (85% bokmål, 15% nynorsk); el rendimiento en danés u otras lenguas no está evaluado y probablemente sea degradado tras el cambio de tokenizador.
- Los resultados en NorEval son modestos (por ejemplo, f1 de 0,209 en nob_reading y acc de 0,293 en nob_world en 0-shot), lo que limita su utilidad en tareas de conocimiento y lectura.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial ni las condiciones de redistribución; debe consultarse con el autor antes de cualquier uso fuera del ámbito académico.
- No hay versiones cuantizadas publicadas ni documentación de despliegue en llama.cpp, Ollama o vLLM, lo que añade trabajo de ingeniería para su puesta en marcha.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt3-anneal
- Modelo base (da-cpt3): https://huggingface.co/BigFamTLLM/da-cpt3
- Modelo de origen danés (da-base): https://huggingface.co/BigFamTLLM/da-base
- Versión sin annealing (da-cpt3): https://huggingface.co/BigFamTLLM/da-cpt3
- Modelo noruego desde cero (no-base): https://huggingface.co/BigFamTLLM/no-base
- Versión annealed del noruego desde cero (no-base-anneal): https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingüe desde cero (ml-base): https://huggingface.co/BigFamTLLM/ml-base
- Versión annealed del multilingüe (ml-base-anneal): https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoints de preentrenamiento continuado danés: https://huggingface.co/BigFamTLLM/da-cpt1, https://huggingface.co/BigFamTLLM/da-cpt2, https://huggingface.co/BigFamTLLM/da-cpt3, https://huggingface.co/BigFamTLLM/da-cpt4, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt6, https://huggingface.co/BigFamTLLM/da-cpt7, https://huggingface.co/BigFamTLLM/da-cpt8, https://huggingface.co/BigFamTLLM/da-cpt9, https://huggingface.co/BigFamTLLM/da-cpt10
- Versiones annealed de los checkpoints daneses: https://huggingface.co/BigFamTLLM/da-cpt1-anneal, https://huggingface.co/BigFamTLLM/da-cpt2-anneal, https://huggingface.co/BigFamTLLM/da-cpt3-anneal, https://huggingface.co/BigFamTLLM/da-cpt4-anneal, https://huggingface.co/BigFamTLLM/da-cpt5-anneal, https://huggingface.co/BigFamTLLM/da-cpt6-anneal, https://huggingface.co/BigFamTLLM/da-cpt7-anneal, https://huggingface.co/BigFamTLLM/da-cpt8-anneal, https://huggingface.co/BigFamTLLM/da-cpt9-anneal, https://huggingface.co/BigFamTLLM/da-cpt10-anneal
