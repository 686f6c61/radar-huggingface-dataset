# psikosen/canopy-258m-r3

## Resumen

Canopy-258M-R3 es un modelo de lenguaje causal desarrollado por psikosen, diseñado específicamente para entornos de computación en el borde (edge computing) con requisitos estrictos de eficiencia. Su arquitectura principal es un Mixture-of-Experts recurrente (Recurrent MoE) que combina bloques densos con capas recurrentes y un sistema de routing dinámico Top-2 sobre 8 expertos feed-forward. El modelo declara 258,56 millones de parámetros totales, aunque los pesos en safetensors suman 296.304.390 parámetros, con aproximadamente 112 millones de parámetros activos por token, lo que reduce el coste computacional efectivo a un modelo de 112M manteniendo una profundidad lógica equivalente a 18 capas Transformer.

El modelo destaca por su integración nativa de Program-Aided Language (PAL), que formula problemas matemáticos como algoritmos Python ejecutables, evitando la alucinación aritmética en la generación autoregresiva. También incorpora un "Tokenwise Thought Bus" de 192 dimensiones mediante cross-attention para fusionar representaciones entre expertos, y una fusión de pesos SLERP para combinar especialistas en razonamiento matemático, código y alineación por instrucciones. Su relevancia actual radica en ofrecer capacidades de razonamiento matemático y síntesis de código Python competitivas en modelos sub-300M, con un tamaño de 493 MB en bfloat16 y un throughput declarado de 75+ tokens/s en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent MoE causal language model (Transformer con 12 bloques físicos: 3 densos prelude + 6 recurrentes MoE + 3 densos coda; profundidad lógica de 18 capas; 8 expertos feed-forward con routing Top-2) |
| Parametros totales | 296.304.390 (según safetensors); el autor declara 258,56 M |
| Parametros activos | ~112 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos nativos); no se han publicado cuantizaciones adicionales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Canopy-258M-R3 emplea una arquitectura recurrente de Mixture-of-Experts compuesta por 12 bloques físicos: 3 bloques densos de entrada ("prelude"), 6 bloques recurrentes MoE y 3 bloques densos de salida ("coda"). Los 6 bloques recurrentes se ejecutan durante 2 pasadas recurrentes, lo que eleva la profundidad lógica efectiva a 18 capas Transformer. Cada token activa dinámicamente 2 de los 8 expertos feed-forward disponibles mediante un mecanismo Top-2. Un componente llamado "Tokenwise Thought Bus" (un bus de cross-attention de 192 dimensiones) fusiona las representaciones de los expertos seleccionados token a token, permitiendo un razonamiento colaborativo entre expertos.

El entrenamiento sigue una progresión en varias etapas. Primero, un pre-entrenamiento multi-dominio y un ajuste fino por currículum (SFT) utilizando los datasets Cosmopedia v2, FineWeb-Edu, Ling-Coder y OpenMathInstruct-2. Después, una etapa 11 de "Precision Alignment" para optimizar el presupuesto de tokens y reducir el "chatter" (ruido generativo). La etapa 12 implementa un pipeline unificado de tres especialistas: Program-Aided Language (PAL) para el anclaje matemático, Direct Preference Optimization (DPO) para la supresión de errores de código, y Reinforcement Learning guiado por ejecución (GRPO) con pruebas unitarias en un sandbox de Python. Finalmente, la etapa 13 aplica una fusión SLERP (interpolación esférica de pesos) de alta dimensión para combinar los especialistas entrenados.

## Capacidades

- Generación de texto en inglés con enfoque en razonamiento matemático y síntesis de código Python.
- Integración PAL: formula problemas de matemáticas y aritmética como programas Python ejecutables, delegando la precisión aritmética al runtime determinista para eliminar alucinaciones digitales.
- Razonamiento matemático en problemas de competición (Competition MATH) con verificación por PAL.
- Generación de código Python con una tasa de ejecución correcta declarada del 50,0% en HumanEval y una conformidad sintáctica del 100,0%.
- Capacidad conversacional (tag "conversational") para interacciones multi-turno.
- Optimizado para edge computing y despliegue con recursos limitados gracias a sus ~112M parámetros activos por token.
- No se documenta soporte explícito de tool calling / function calling ni de agentes autónomos, aunque la integración con ejecución de código PAL permite emular flujos de razonamiento asistidos por programa.
- Multilingüe: únicamente inglés.

## Casos de uso

- Razonamiento matemático en dispositivos de borde: el modelo puede resolver problemas verbales complejos generando código Python que se ejecuta en el runtime local, eliminando la necesidad de una GPU potente y reduciendo el riesgo de errores aritméticos.
- Generación de código Python en entornos embebidos: gracias a su tamaño de 493 MB y su bajo coste computacional por token, puede integrarse en sistemas de CI/CD ligeros o en editores de código en línea para sugerencias de funciones.
- Asistentes conversacionales en inglés en el edge: su capacidad conversacional y su throughput de 75+ tokens/s en GPU consumer permiten respuestas rápidas en aplicaciones de chat locales sin conexión.
- Tutoría educativa en matemáticas: el modelo puede descomponer problemas de álgebra o aritmética en pasos ejecutables, generando explicaciones y programas Python verificables, útil para plataformas de aprendizaje autónomo.
- Automatización de pruebas unitarias en Python: dado el entrenamiento con GRPO y sandbox de Python, el modelo puede generar casos de prueba o verificar la corrección de funciones existentes, integrándose en pipelines de calidad de código.
- Investigación en eficiencia de MoE recurrentes: su arquitectura con profundidad lógica de 18 capas y solo ~112M parámetros activos sirve como referencia para estudiar el equilibrio entre capacidad y coste en modelos de borde.
- Despliegue en sistemas con restricciones de memoria: con un peso en bfloat16 de 493 MB, cabe en dispositivos con poca VRAM o en CPUs con aceleración, facilitando su uso en robótica o IoT.

## Benchmarks y rendimiento

Los siguientes resultados han sido publicados por el autor en la model card. No se han verificado de forma independiente.

| Benchmark / Capacidad | Canopy-258M-R3 | SmolLM-135M | MobileLLM-125M | Pythia-160M | TinyLlama-1.1B (4.3x mayor) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| HumanEval ejecutado (tasa de aprobación) | 50,0% | 12,2% | 8,5% | 1,8% | 14,6% |
| Cumplimiento sintáctico de código HumanEval | 100,0% | 65,0% | 58,0% | 32,0% | 72,0% |
| Competition MATH (verificado con PAL) | 16,7% | 2,8% | 1,5% | 0,0% | 3,0% |
| Parámetros activos por token | ~112M | 135M | 125M | 160M | 1.100M |
| Throughput de inferencia (RTX 5090) | 75+ tok/s | ~80 tok/s | ~82 tok/s | ~78 tok/s | ~35 tok/s |
| Tamaño del modelo (bfloat16) | 493 MB | 270 MB | 250 MB | 320 MB | 2.200 MB |

No se han publicado resultados en benchmarks adicionales más allá de los incluidos en la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan 493 MB. Con activaciones, caché KV y overhead, se estima un consumo de entre 1 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para ejecutar el modelo. La RTX 5090 se menciona en la model card como referencia de throughput (75+ tok/s), pero no es un requisito.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama baja como la RTX 3060 de 6 GB, así como en tarjetas con 4 GB mediante cuantización adicional, aunque no se publican cuantizaciones.
- Opciones de despliegue: el modelo se carga mediante la librería Transformers con `trust_remote_code=True`. No se documentan conversiones a GGUF ni integraciones específicas con vLLM, llama.cpp, Ollama o TGI. En principio, al ser un modelo estándar de Transformers, podría servirse con vLLM o TGI si la implementación personalizada (custom code) es compatible.
- Latencia y throughput: el autor declara 75+ tokens/s en una RTX 5090 en bfloat16, un valor orientativo para hardware de gama alta.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Canopy-258M-R3 | 296M (258M declarados) | ~112M | no disponible | Apache 2.0 | Hugging Face (psikosen) |
| SmolLM-135M | 135M | 135M (denso) | no disponible | Apache 2.0 | Hugging Face |
| MobileLLM-125M | 125M | 125M (denso) | no disponible | Apache 2.0 | Hugging Face |
| Pythia-160M | 160M | 160M (denso) | no disponible | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1.100M | 1.100M (denso) | 2.048 tokens | Apache 2.0 | Hugging Face |

La comparativa se basa en los datos aportados por el autor en la model card. El contexto no está disponible para la mayoría de los modelos de la comparativa, excepto TinyLlama-1.1B, cuyo contexto de 2.048 tokens es conocido públicamente, aunque no aparece en la model card original.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos. El entrenamiento con datasets como Cosmopedia v2 y FineWeb-Edu puede heredar sesgos de los corpus de origen.
- Riesgo de alucinación: presente en generación de texto libre, aunque se mitiga en tareas matemáticas mediante la integración PAL al delegar la aritmética a un runtime determinista.
- Limitaciones de contexto: la longitud de contexto no está documentada en la model card. Se desconoce la ventana máxima de tokens, lo que impide garantizar un rendimiento fiable en conversaciones largas o documentos extensos.
- Idiomas: el modelo solo soporta inglés. Cualquier uso en otros idiomas requerirá adaptación o evaluación previa.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero requiere incluir el aviso de licencia y los cambios realizados. No hay restricciones de uso comercial adicionales.
- Dependencia de código personalizado: el modelo requiere `trust_remote_code=True` en Transformers, lo que implica la ejecución de código no auditado. Esto supone un riesgo de seguridad en entornos de producción.
- Datos sin verificación externa: el modelo se publicó recientemente (septiembre de 2026) y tiene 0 descargas y 0 likes. Los benchmarks provienen exclusivamente del autor y no han sido replicados por terceros.
- Discrepancia en el número de parámetros: el archivo safetensors contiene 296.304.390 parámetros, mientras que el autor declara 258,56 millones. Esta diferencia puede deberse a pesos compartidos o a una definición diferente del conteo, y debe tenerse en cuenta al dimensionar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/psikosen/canopy-258m-r3
- Listado de modelos con filtro "recurrent-moe": https://huggingface.co/models?other=recurrent-moe

No se han encontrado papers, blogs, demos o repositorios adicionales en la búsqueda web realizada.
