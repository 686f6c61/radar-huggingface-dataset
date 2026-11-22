# BigFamTLLM/da-cpt9

## Resumen

da-cpt9 es un modelo de lenguaje de tipo base (no instruido) de 2.115.305.088 parámetros desarrollado por BigFamTLLM, un equipo de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). El modelo parte de da-emb, un modelo entrenado desde cero sobre danés, y se adapta al noruego mediante el reemplazo del tokenizador, un entrenamiento inicial de solo embeddings y un preentrenamiento continuado sobre texto noruego. Se trata del checkpoint 9 de una serie de 10, correspondiente al paso 43.740 de 48.600.

La arquitectura sigue el diseño de Qwen3, con 36 capas, tamaño oculto de 2176 y 34 cabezas de atención (17 cabezas KV), con embeddings atados. El modelo ha visto 23,46 mil millones de tokens noruegos y emplea un tokenizador noruego de 32.000 entradas. Su ventana de contexto es de 4096 tokens.

Es relevante como pieza de investigación sobre adaptación lingüística cruzada entre lenguas escandinavas: demuestra el proceso de transferencia de un modelo danés a noruego (bokmål y nynorsk) con un presupuesto de cómputo limitado (8 GPU GH200) y publica resultados de evaluación en NorEval 1.1. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura de Qwen3: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de calentamiento y sin decaimiento (1e-4 en la fase de solo embeddings).

El proceso de adaptación consta de varias etapas. Primero se sustituye el tokenizador danés por uno noruego de 32.000 entradas: los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Después se realizan 1.000 pasos de entrenamiento de solo embeddings y, a continuación, preentrenamiento continuado sobre datos noruegos de HPLT 4.0, con una mezcla del 85% bokmål y 15% nynorsk, acumulando 23,46 mil millones de tokens vistos. Finalmente se aplica una fase de annealing de 916 pasos (0,48 mil millones de tokens) sobre bokmål y nynorsk de alta calidad con decaimiento lineal hasta cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego bokmål y nynorsk, además de danés, al ser un modelo base sin ajuste de instrucciones.
- Modelado de lenguaje y continuación de texto; no incluye modo de razonamiento ni plantillas de chat.
- Comprensión lectora y tareas de conocimiento del mundo evaluadas en NorEval 1.1 (lectura, ortografía, conocimiento del mundo y uso de la lengua).
- Capacidad multilingüe limitada al ámbito escandinavo (da, no, nb, nn); no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documenta soporte de visión, audio ni otras modalidades.
- Robustez ante ruido moderada: 0,390 en entrada limpia y una caída media de -0,042 bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigación en adaptación lingüística cruzada: sirve como punto de comparación dentro de la serie de 50 modelos del proyecto para estudiar el efecto del preentrenamiento continuado y del annealing en lenguas escandinavas.
- Generación de texto en noruego bokmål: el modelo puede continuar textos y producir borradores en esta variedad, que representa el 85% de sus datos de entrenamiento.
- Generación de texto en nynorsk: aunque con menos datos (15% de la mezcla), puede emplearse para experimentos de generación y evaluación en esta variedad.
- Evaluación de tokenizadores: al incluir un tokenizador noruego de 32.000 entradas con inicialización por media de piezas, es útil para estudiar el impacto del cambio de vocabulario en modelos pequeños.
- Punto de partida para fine-tuning supervisado: al ser un modelo base de 2,12B con contexto de 4096, puede ajustarse posteriormente para tareas concretas de clasificación o generación en noruego.
- Reproducción de experimentos académicos: el proyecto documenta la configuración completa (Megatron-LM, 8 GH200, hiperparámetros) y la serie de checkpoints, lo que facilita replicar o extender el estudio.
- Análisis de robustez: los resultados con entrada ruidosa permiten estudiar la degradación del modelo en condiciones de texto imperfecto.

## Benchmarks y rendimiento

Resultados publicados en NorEval 1.1 por el autor:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,237 | 0,266 |
| nob_orthography | acc | 0,843 | 0,862 |
| nob_reading | f1 | 0,251 | 0,259 |
| nob_world | acc | 0,294 | 0,296 |
| nno_language | em_first | 0,443 | 0,517 |
| nno_world | acc | 0,308 | 0,316 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,390 en entrada limpia y -0,042 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para los pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contexto corto.
- En cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits: alrededor de 1,1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en contexto corto; A100, H100 o GH200 para mayor throughput y contexto completo de 4096 tokens.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090, siempre que se use bfloat16 o cuantización.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (etiqueta endpoints_compatible) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt9 | 2,12B | 4096 | da, no, nb, nn | no disponible | Hugging Face |
| BigFamTLLM/no-base | no disponible | no disponible | no | no disponible | Hugging Face |
| BigFamTLLM/da-base | no disponible | no disponible | da | no disponible | Hugging Face |
| BigFamTLLM/ml-base | no disponible | no disponible | multilingüe | no disponible | Hugging Face |

Los modelos de la misma serie comparten arquitectura y presupuesto de entrenamiento, por lo que son las alternativas más directas para comparar el efecto de entrenar desde cero en noruego frente a adaptar un modelo danés. No se dispone de datos de benchmarks de esos modelos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa. Tampoco se dispone de datos de modelos externos comparables en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene conversaciones estructuradas.
- Riesgo elevado de alucinación y de generar contenido incorrecto u ofensivo, según advierte el propio autor, al estar entrenado sobre texto web.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a danés y noruego; no se documenta rendimiento en otros idiomas.
- Desequilibrio interno de datos: el 85% del noruego es bokmål y solo el 15% nynorsk, lo que puede penalizar el rendimiento en nynorsk.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- El autor indica explícitamente que no está pensado para uso en producción.
- Es el checkpoint 9 de 10, no el modelo final de la serie; puede existir una versión posterior con mejor rendimiento.
- Sin datos publicados sobre sesgos específicos más allá de la advertencia general del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt9
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Modelo de partida original: https://huggingface.co/BigFamTLLM/da-base
- Checkpoint anterior: https://huggingface.co/BigFamTLLM/da-cpt8
- Checkpoint posterior: https://huggingface.co/BigFamTLLM/da-cpt10
- Versión con annealing: https://huggingface.co/BigFamTLLM/da-cpt9-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
