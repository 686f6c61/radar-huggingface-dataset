# rikkathree/vsa-deepseek-r1-qwen-1.5b

## Resumen

VSA-DeepSeek-R1-Qwen-1.5B es un modelo de lenguaje derivado de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B mediante una retroadaptación arquitectónica desarrollada por el autor rikkathree bajo el proyecto VSA-LM. El modelo sustituye el mecanismo de atención completa de la mayoría de capas por un esquema híbrido de atención lineal con memoria de estado fijo (Fixed-State Decayed Outer-Product Memory) combinada con un binder abeliano de páginas y slots, conservando únicamente 7 capas de atención softmax como anclas. El objetivo es reducir el coste de memoria del KV cache en contextos largos manteniendo las capacidades de razonamiento del modelo donante.

La propuesta encaja en la línea de investigación de atención lineal y modelos de estado fijo orientados a inferencia de contexto extenso con memoria acotada. El modelo conserva el tokenizador y el comportamiento de generación de razonamiento (modo thinking) del destilado de DeepSeek-R1 sobre Qwen-1.5B, pero con una huella de memoria que crece de forma sublineal respecto a la longitud de contexto. Se distribuye con licencia MIT y está etiquetado explícitamente como modelo de previsualización sujeto a feedback.

El repositorio ocupa 47,9 GB, lo que sugiere la presencia de múltiples artefactos además de los pesos en precisión completa. El modelo acumula 340 descargas y 1 like en el momento de la consulta, lo que lo sitúa como un experimento de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 21 de 28 capas con atención lineal VSA (memoria de estado fijo con decaimiento multi-escala) + 7 capas de atención softmax como anclas (una cada 4 capas) |
| Parametros totales | no disponible (derivado de Qwen2.5-1.5B, aproximadamente 1.500 millones, cifra no confirmada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como límite declarado; se reportan evaluaciones hasta 65.536 tokens y modo de flujo infinito con ventana de 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repo usa PyTorch; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (heredados del modelo donante, no declarados) |
| Licencia | MIT |
| Formato de pesos | PyTorch (librería `pytorch` declarada); no se detallan safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura parte del destilado DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de 28 capas. La retroadaptación convierte 21 de esas 28 capas en capas VSA (Fixed-State Decayed Outer-Product Memory) con un Abelian Page-Slot Binder que gestiona 8 páginas x 4 slots = 32 slots de suma de prefijos no decaídos por capa. Se aplica además Mix-First GQA Head Un-Tying, que pasa de 2 a 12 cabezas, un decaimiento multi-escala aprendible (γ) y una ventana local de 64 tokens más token sink. Las 7 capas softmax restantes actúan como anclas de atención global, colocadas una cada cuatro capas.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor describe el proceso como una retroadaptación sobre el modelo donante, no como un entrenamiento desde cero, y menciona un mecanismo de edición de memoria que permite descartar cartuchos `.vsa` con borrado algebraico exacto (recall del 100% en 4 de 4 casos, con residuo de borrado 0.0). Esta capacidad de edición de memoria es la innovación técnica más destacada junto con la decodificación de estado fijo.

## Capacidades

- Generación de texto y razonamiento en cadena con modo thinking nativo heredado de DeepSeek-R1, incluyendo trazas `<think>` en la generación.
- Generación de código en Python, evaluada en HumanEval y MBPP.
- Resolución de problemas matemáticos con razonamiento paso a paso (GSM8K).
- Retención numérica casi exacta en preguntas de GSM8K (98,34% de coincidencia top-1 en el número de la pregunta, KL de 0,0248 nats).
- Memoria de estado fijo con edición y borrado algebraico de cartuchos `.vsa`, lo que permite eliminar información concreta sin reentrenar.
- Inferencia en flujo continuo (infinite stream) con ventana de 8.192 tokens y memoria constante.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión o audio): no disponibles.
- Cobertura multilingüe: no documentada.

## Casos de uso

- Razonamiento matemático con trazas auditables: el modelo genera cadenas de pensamiento `<think>` que pueden registrarse y revisarse, útil en entornos educativos o de verificación de cálculos donde se necesita inspeccionar el proceso y no solo el resultado.
- Asistencia de código en pipelines de revisión: con resultados de 70% Pass@1 en HumanEval y 40% en MBPP, puede emplearse como generador de borradores de funciones y tests en un flujo con revisión humana obligatoria.
- Procesamiento de documentos largos con memoria acotada: gracias al estado fijo, el consumo de RAM se mantiene en 466,2 MB a 65.536 tokens frente a 1.792 MB del donante, lo que permite procesar contratos o informes extensos en hardware modesto.
- Servicio de streaming continuo: el modo infinite stream con ventana de 8.192 tokens y 73,1 MB de memoria sin crecimiento es adecuado para agentes conversacionales de larga duración o monitorización de logs en tiempo real.
- Edición selectiva de conocimiento: el borrado algebraico de cartuchos `.vsa` permite retirar información concreta de la memoria del modelo sin reentrenar, aplicable a cumplimiento normativo o retirada de datos sensibles en despliegues internos.
- Prototipado de investigación en atención lineal: sirve como banco de pruebas para comparar arquitecturas híbridas frente al transformer completo con el mismo tokenizador y pesos de partida.
- Inferencia en hardware de gama media: con velocidades de 119,5 a 130,3 tok/s en las pruebas del autor y una huella de memoria reducida, puede desplegarse en GPUs consumer para tareas de generación de texto y razonamiento de complejidad media.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparados con el modelo donante oficial y con prueba de McNemar emparejada:

| Tarea / metrica | Donante HF oficial | VSA-DeepSeek-R1-Qwen-1.5B (v2) | McNemar (p) | Veredicto |
|---|---:|---:|---:|---|
| HumanEval (Python Pass@1) | 60,00% | 70,00% (+10,00%) | 0,219 | Sin diferencia significativa |
| GSM8K (CoT nativo `<think>`) | 75,00% | 70,00% (28/40 vs 30/40) | 0,727 | Empate estadístico |
| MBPP (Python Pass@1) | 35,00% | 40,00% (+5,00%) | 0,688 | Sin diferencia significativa |
| HellaSwag | 41,00% | 42,00% (+1,00%) | 0,774 | Empate |
| MMLU (estratificado 57 materias) | 38,00% | 39,50% (+1,50%) | 0,711 | Empate |
| GSM8K coincidencia top-1 del número | 100,0% (ref) | 98,34% (KL = 0,0248 nats) | — | Retención numérica casi exacta |
| Recall de cartucho `.vsa` en disco | N/A | 100,0% (4/4) | 0,0 residuo | Borrado algebraico exacto |

Escalado de velocidad y memoria (datos del autor):

| Contexto | Velocidad donante | Velocidad VSA-LM | Aceleración | RAM KV donante | RAM estado + KV VSA-LM | RAM ahorrada |
|---:|---:|---:|---:|---:|---:|---:|
| 2.048 | 92,2 tok/s | 130,2 tok/s | 1,41x | 56,0 MB | 41,9 MB | 25,2% |
| 8.192 | 86,6 tok/s | 130,3 tok/s | 1,50x | 224,0 MB | 76,1 MB | 66,0% |
| 16.384 | 91,0 tok/s | 128,6 tok/s | 1,41x | 448,0 MB | 130,2 MB | 70,9% |
| 32.768 | 90,9 tok/s | 125,4 tok/s | 1,38x | 896,0 MB | 242,2 MB | 73,0% |
| 65.536 | 83,9 tok/s | 119,5 tok/s | 1,42x | 1.792,0 MB | 466,2 MB | 74,0% |
| Flujo infinito (ventana 8.192) | OOM en contexto largo | 125,6 tok/s | constante | sin límite | 73,1 MB (crecimiento 0,0 MB) | plano |

Las diferencias en calidad no alcanzan significación estadística con los tamaños de muestra empleados, por lo que los resultados deben interpretarse como equivalencia aproximada con el donante, no como mejora demostrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con aproximadamente 1.500 millones de parámetros, en FP16 rondaría los 3 GB de pesos; en cuantización de 8 bits, alrededor de 1,5 GB, y en 4 bits, cerca de 0,8 GB. Estas cifras son estimaciones a partir del tamaño del modelo donante y no aparecen en la model card.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4070, RTX 4090 y GPUs de datacenter como A100 o H100, aunque no hay validación publicada en estas plataformas.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en FP16, aunque no está confirmado en la documentación.
- Opciones de despliegue: el autor emplea `python -m vsa_lm benchmark` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser una arquitectura modificada es improbable que funcione en motores estándar sin adaptación.
- Latencia y throughput: según el autor, entre 119,5 y 130,3 tok/s en decodificación, con aceleración de 1,38x a 1,50x frente al donante y reducción de RAM de hasta el 74% a 65.536 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VSA-DeepSeek-R1-Qwen-1.5B | ~1.500 M (no confirmado) | hasta 65.536 evaluados; flujo infinito con ventana 8.192 | MIT | Híbrido de atención lineal con estado fijo y edición de memoria |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1.500 M | no disponible en la información | MIT (heredada del donante) | Modelo donante, atención completa, mayor coste de KV cache |
| Qwen2.5-1.5B | ~1.500 M | no disponible en la información | Apache 2.0 (habitual en la familia Qwen) | Base del destilado; sin modo thinking nativo |
| Modelos de atención lineal comparables | no disponible | no disponible | no disponible | No se han identificado alternativas equivalentes en la información proporcionada |

## Limitaciones y advertencias

- Modelo de previsualización: el propio autor lo etiqueta como preview y solicita feedback, por lo que no debe considerarse estable para producción.
- Tamaños de muestra reducidos en los benchmarks: GSM8K se evalúa con 40 ejemplos, lo que hace que las diferencias observadas no sean estadísticamente significativas.
- Rendimiento absoluto modesto: 39,5% en MMLU y 70% en GSM8K indican un modelo pequeño con conocimiento factual limitado, adecuado para tareas acotadas pero no para razonamiento experto.
- Riesgo de alucinación: inherente a los modelos de 1.500 millones de parámetros y no mitigado de forma específica en la documentación.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, aunque el modelo donante tiene cierta cobertura multilingüe.
- Compatibilidad de despliegue limitada: al modificar la arquitectura, los motores de inferencia estándar (vLLM, llama.cpp, TGI) probablemente no funcionen sin adaptaciones específicas.
- Licencia MIT: permite uso comercial, pero el modelo base conserva sus propias condiciones; conviene revisar la licencia del destilado de DeepSeek-R1 y de Qwen2.5 antes de explotación comercial.
- Sesgos: no documentados por el autor; se heredan los del corpus de entrenamiento del modelo donante.
- Repositorio de 47,9 GB: el tamaño sugiere artefactos adicionales (posiblemente checkpoints o imágenes), lo que puede complicar la descarga y el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rikkathree/vsa-deepseek-r1-qwen-1.5b
- Repositorio del proyecto VSA-LM: https://github.com/Rikka3/vsa-lm
- Modelo donante: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
