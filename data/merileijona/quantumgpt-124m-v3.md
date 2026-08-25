# merileijona/quantumgpt-124m-v3

## Resumen

QuantumGPT-124M-v3 es un modelo de lenguaje de 124 millones de parámetros desarrollado por merileijona (Juhani Merilehto), especializado en generar circuitos cuánticos en formato OpenQASM 2.0 a partir de descripciones en lenguaje natural. Se trata de la tercera generación de la familia QuantumGPT, construida sobre la arquitectura GPT-2 small (12 capas, 12 cabezas de atención, 768 dimensiones de embedding) con embeddings atados, y entrenada mediante fine-tuning sobre el dataset sintético `merileijona/quantum-circuits-21k`.

La principal novedad de esta versión respecto a sus predecesoras es la extensión de la ventana de contexto de 256 a 512 tokens mediante una extensión de los embeddings posicionales, lo que permite generar circuitos de mayor complejidad. El modelo alcanza una puntuación QSS-Core v0.1 de 97.70 en el benchmark de desarrollo QSemBench-dev-v0.1, frente al 77.91 de la versión v1, y está pensado para investigación en generación de código cuántico, educación y experimentos de escalado. No está diseñado para uso en producción sin verificación humana de cada circuito generado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 small (12 capas, 12 cabezas, 768 embd), embeddings atados |
| Parámetros totales | 124.082.688 (~124M) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (extendida desde 256) |
| Tipos de cuantización | no disponible (pesos en FP32/FP16; cuantización no documentada) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0.5 GB) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura GPT-2 small con embeddings atados (tied embeddings) y tokenizer BPE de GPT-2. La ventana de contexto se extendió de 256 a 512 tokens preservando las posiciones 0–255 y inicializando las posiciones 256–511 como continuación de la tabla de embeddings aprendida. El entrenamiento se realizó sobre el dataset merileijona/quantum-circuits-21k, compuesto por pares descripción→circuito en OpenQASM 2.0 validados con qiskit, con oversampling de anclajes de formato ×2, oversampling de circuitos largos ×2 y aumento de datos mediante paráfrasis determinista.

El formato de prompt es `<|user|>{descripción}<|end|>\n<|assistant|>{qasm}<|end|>`. El linaje del modelo es `quantumgpt-124m-v2` → mutaciones de datos/formato (QEXP-100006) → extensión de contexto a 512 y entrenamiento con contexto completo. No se documenta el uso de RLHF ni DPO; el entrenamiento es supervisado sobre datos sintéticos generados por Grok y validados por comprobaciones de parseo con qiskit.

## Capacidades

- Generación de circuitos OpenQASM 2.0 válidos a partir de descripciones en inglés: el modelo produce código sintácticamente correcto y compilable en el 99.17 % de los casos del benchmark de desarrollo.
- Razonamiento estructural sobre circuitos cuánticos: entrelazamiento tipo Bell y GHZ, arquitectura de teleportación, circuito Deutsch-Jozsa, codificación de corrección de errores de tres qubits.
- Soporte de medición intermedia con control clásico (`if(c==1)`) y rotaciones parametrizadas.
- Preparación de estados novedosos adyacentes a la distribución de entrenamiento, como síntesis de estados W con ángulos arccos(1/√3) plausibles.
- Generación de código con formato de prompt multi-turno (user/assistant), aunque no se documenta soporte de tool calling ni de razonamiento multi-paso.
- Capacidades multilingües: solo inglés; no se soportan otros idiomas.
- Sin modo de pensamiento (thinking mode), visión ni audio: es un modelo exclusivamente de generación de texto.

## Casos de uso

- Educación en computación cuántica: estudiantes pueden describir un circuito en inglés (p. ej. "create a Bell state") y obtener el código OpenQASM 2.0 correspondiente, facilitando el aprendizaje práctico de la sintaxis de QASM y de los patrones de entrelazamiento.
- Prototipado rápido de circuitos para experimentos de investigación: investigadores pueden generar rápidamente variantes de circuitos de referencia (teleportación, Deutsch-Jozsa) para iterar sobre diseños antes de implementarlos manualmente.
- Generación de circuitos de referencia para benchmarks de compiladores y simuladores cuánticos: el modelo puede producir circuitos sintácticamente válidos que sirvan como entrada para probar herramientas de optimización o simulación en entornos como qiskit.
- Asistente educativo en cursos de computación cuántica: los estudiantes pueden comparar el QASM generado por el modelo con sus propias soluciones, usando el modelo como herramienta de auto-verificación estructural.
- Base para experimentos de escalado: al ser un modelo de 124M con arquitectura GPT-2, sirve como punto de partida para estudiar cómo escala la generación de circuitos cuánticos con más datos o más parámetros, tal como documenta el estudio de scaling del autor.
- Validación de sistemas de generación de código: el modelo puede usarse como generador de circuitos de prueba en pipelines de investigación que requieran producir circuitos de forma automatizada y reproducible, siempre con verificación humana posterior.

## Benchmarks y rendimiento

Los resultados corresponden al benchmark QSemBench-dev-v0.1 (n=120, muestreo estratificado, decodificación greedy). La puntuación usa parseo/compilación con qiskit, fidelidad de statevector en Aer ≥ 0.99 frente al circuito de referencia, comprobación de entrelazamiento cuando el circuito de referencia entrelaza, y pruebas de robustez frente a perturbaciones del prompt.

| Métrica | v1 baseline | v3 (seed 42) | v3 (seed 43) |
|---|---|---|---|
| qsyntax | 95.00 | 99.17 | 99.17 |
| qcompile | 95.00 | 99.17 | 99.17 |
| qsemantic | 76.67 | 97.50 | 96.67 |
| qexecute | 76.67 | 97.50 | 96.67 |
| qgeneralize | 75.26 | 96.91 | 96.91 |
| qrobust | 90.22 | 97.44 | 98.28 |
| qefficiency | 100.00 | 100.00 | 100.00 |
| **QSS-Core v0.1** | **77.91*** | **97.70** | **97.28** |

*El baseline v1 se reporta bajo condiciones previas al cap-lift; ver informe técnico. La dispersión entre semillas es de 0.41 puntos QSS.

No se han publicado resultados de benchmarks comparativos con otros modelos de generación de circuitos cuánticos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 124M de parámetros, el modelo cabe en ~248 MB en FP16 (pesos) y ~124 MB en int8. Con activaciones y overhead, se puede ejecutar en GPUs con 2-4 GB de VRAM sin problemas.
- GPU recomendada: cualquier GPU de consumo con al menos 4 GB (p. ej. RTX 3060, RTX 4060) es suficiente; también puede ejecutarse en CPU sin dificultad para inferencia de baja latencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: compatible con Hugging Face transformers, vLLM, Text Generation Inference (TGI, marcado como `endpoints_compatible`), y se puede convertir a GGUF para usar con llama.cpp u Ollama (aunque no se proporciona un GGUF preconstruido).
- Latencia y throughput: no se han publicado datos medidos; al tratarse de un modelo GPT-2 small, la latencia es del orden de milisegundos por token en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de generación de circuitos cuánticos con los que comparar directamente (el único comparable es la propia familia QuantumGPT). Comparación interna con las versiones anteriores de la familia:

| Modelo | Parámetros | Contexto | QSS-Core v0.1 | Licencia |
|---|---|---|---|---|
| QuantumGPT-124M-v1 | ~124M | 256 | 77.91 | MIT |
| QuantumGPT-124M-v2 | ~124M | 256 | 91.61 | MIT |
| QuantumGPT-124M-v3 | ~124M | 512 | 97.70 | MIT |

Frente a modelos generalistas de generación de código (p. ej. CodeGPT o modelos GPT-2 afinados en código), no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- El benchmark de desarrollo comparte el generador de datos con el corpus de entrenamiento, por lo que los resultados pueden sobreestimar el rendimiento en circuitos verdaderamente nuevos; se requiere evaluación con circuitos generados ex profeso.
- El modelo fue entrenado exclusivamente con circuitos sintéticos generados por Grok y validados por parseo con qiskit; no ha visto circuitos reales de hardware cuántico ni de publicaciones científicas.
- No tiene comportamiento de alineación ni de rechazo: cualquier prompt recibe *algún* programa QASM, sea o no semánticamente correcto. Las peticiones imposibles (p. ej. "clonar un qubit") producen un circuito en lugar de una negativa.
- La ventana de contexto de 512 tokens es limitante para algoritmos de gran escala; por ejemplo, la codificación de Shor-9 se sitúa en el borde del contexto.
- Solo soporta prompts en inglés; no se ha entrenado con otros idiomas.
- Debilidades conocidas: ignora restricciones de negación ("SIN puertas de entrelazamiento"), falla en instrucciones compuestas multi-parte (completa parcialmente), y frases informales o con erratas degradan la precisión semántica.
- No está destinado a la síntesis de circuitos cuánticos en producción sin verificación humana de cada circuito generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merileijona/quantumgpt-124m-v3
- Repositorio de GitHub: https://github.com/juhanimerilehto/quantumgpt
- Colección de modelos QuantumGPT en Hugging Face: https://huggingface.co/collections/merileijona/quantumgpt-quantum-circuit-generation
- Página de despliegue en FriendliAI: https://friendli.ai/models/merileijona/quantumgpt-124m
- Artículo técnico: "QuantumGPT: A Data Scaling Study for Quantum Circuit Generation" (Merilehto, 2026), disponible en el repositorio de GitHub.</think>## Resumen

QuantumGPT-124M-v3 es un modelo de lenguaje de 124 millones de parámetros desarrollado por merileijona (Juhani Merilehto), especializado en generar circuitos cuánticos en formato OpenQASM 2.0 a partir de descripciones en lenguaje natural. Se trata de la tercera generación de la familia QuantumGPT, construida sobre la arquitectura GPT-2 small (12 capas, 12 cabezas de atención, 768 dimensiones de embedding) con embeddings atados, y afinada sobre el dataset sintético `merileijona/quantum-circuits-21k`.

La principal novedad de esta versión es la extensión de la ventana de contexto de 256 a 512 tokens mediante la extensión de los embeddings posicionales, lo que permite generar circuitos más complejos. El modelo alcanza una puntuación QSS-Core v0.1 de 97,70 en el benchmark de desarrollo QSemBench-dev-v0.1, frente al 77,91 de la versión v1. Está pensado para investigación en generación de código cuántico, educación y experimentos de escalado, no para producción sin verificación humana de cada circuito generado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 small (12 capas, 12 cabezas, 768 embd), embeddings atados |
| Parámetros totales | 124.082.688 (~124M) |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 512 tokens (extendida desde 256) |
| Tipos de cuantización | no disponible (pesos en safetensors; sin cuantización documentada) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 0.5 GB) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura GPT-2 small con embeddings atados y tokenizer BPE de GPT-2. La ventana de contexto se extendió de 256 a 512 tokens preservando las posiciones 0–255 e inicializando las posiciones 256–511 como continuación de la tabla de embeddings aprendidos. El entrenamiento se realizó sobre el dataset `merileijona/quantum-circuits-21k`, compuesto por pares descripción→circuito en OpenQASM 2.0 validados por parseo con qiskit, con oversampling de anclas de formato ×2, oversampling de circuitos largos ×2 y aumento con paráfrasis determinista.

El formato de prompt es `<|user|>{descripción}<|end|>\n<|assistant|>{qasm}<|end|>`. El linaje del modelo es `quantumgpt-124m-v2` → mutaciones de datos/formato (QEXP-100006) → extensión de contexto y entrenamiento con contexto completo. No se documenta el uso de RLHF ni DPO; el entrenamiento es supervisado sobre datos sintéticos generados por Grok y validados por comprobaciones de parseo con qiskit.

## Capacidades

- Generación de circuitos OpenQASM 2.0 sintácticamente correctos y compilables a partir de descripciones en lenguaje natural.
- Estructuras cuánticas: entrelazamiento Bell/GHZ, arquitectura de teleportación, circuito Deutsch-Jozsa, codificación de corrección de errores de tres qubits.
- Medición intermedia con control clásico (`if(c==1)`) y rotaciones parametrizadas.
- Preparación de estados novedosos adyacentes a la distribución de entrenamiento, como síntesis de estados W con ángulos arccos(1/√3) plausibles.
- Generación de código en formato de conversación multi-turno (user/assistant), aunque sin soporte documentado de tool calling ni razonamiento multi-paso explícito.
- Capacidades multilingües: solo inglés; no se soportan otros idiomas.
- Sin modo de pensamiento (thinking mode), visión ni audio: es un modelo exclusivamente de generación de texto.

## Casos de uso

- Educación en computación cuántica: estudiantes pueden describir circuitos en inglés y recibir el código OpenQASM 2.0 correspondiente, facilitando el aprendizaje de la sintaxis de QASM y de conceptos como el entrelazamiento.
- Prototipado rápido de circuitos para investigación: investigadores pueden generar variantes de circuitos de referencia (teleportación, Deutsch-Jozsa) para iterar sobre diseños experimentales sin escribir el QASM manualmente.
- Generación de circuitos de prueba para compiladores y simuladores: el modelo produce circuitos sintácticamente válidos que pueden usarse como casos de prueba en pipelines de optimización o simulación con qiskit.
- Asistente educativo en laboratorios cuánticos: los usuarios pueden verificar rápidamente si una descripción conceptual produce el circuito esperado, comparando el resultado con sus propias implementaciones.
- Base para experimentos de escalado: al ser un modelo de 124M con arquitectura GPT-2, sirve como punto de partida para estudiar cómo la generación de circuitos cuánticos escala con más datos o más parámetros, tal como documenta el estudio de scaling del autor.
- Validación de sistemas de generación de código: puede integrarse en pipelines de generación automática de circuitos para pruebas de sistemas de control cuántico, siempre con verificación humana posterior.
- Generación de circuitos de referencia en benchmarks: el modelo puede producir circuitos de referencia para evaluar otros generadores de QASM o compiladores, aunque se recomienda validar la semántica con qiskit.

## Benchmarks y rendimiento

Los resultados corresponden al benchmark QSemBench-dev-v0.1 (n=120, muestreo estratificado, decodificación greedy). La puntuación usa parseo/compilación con qiskit, fidelidad de statevector en Aer ≥ 0.99 frente al circuito de referencia, comprobación de entrelazamiento cuando el circuito de referencia entrelaza, y pruebas de robustez ante perturbaciones del prompt.

| Métrica | v1 baseline | v3 (seed 42) | v3 (seed 43) |
|---|---|---|---|
| QSyntaxis | 95.00 | 99.17 | 99.17 |
| QCompile | 95.00 | 99.17 | 99.17 |
| QSemantic | 76.67 | 97.50 | 96.67 |
| QExecute | 76.67 | 97.50 | 96.67 |
| QGeneralize | 75.26 | 96.91 | 96.91 |
| QRobust | 90.22 | 97.44 | 98.28 |
| QEfficiency | 100.00 | 100.00 | 100.00 |
| **QSS-Core v0.1** | **77.91*** | **97.70** | **97.28** |

*El baseline v1 se reporta bajo condiciones previas al cap-lift; ver informe técnico para detalles.

No se han publicado resultados de benchmarks en otros conjuntos de datos públicos (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~124M de parámetros, por lo que en FP16 ocupa aproximadamente 248 MB de pesos; con overhead de activaciones y KV cache, puede ejecutarse en GPUs con 1-2 GB de VRAM.
- GPUs recomendadas: cualquier GPU de consumo con al menos 2 GB (p. ej. NVIDIA GTX 1050, RTX 3060) es suficiente; también puede ejecutarse en CPU para pruebas.
- Cabe en consumer GPUs: sí, en la mayoría de las tarjetas disponibles en el mercado.
- Opciones de despliegue: compatible con Hugging Face transformers, vLLM, Text Generation Inference (TGI, marcado como `endpoints_compatible`), y puede convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput estimados: no se han publicado mediciones específicas; al ser un modelo de 124M, la inferencia es de baja latencia (típicamente decenas de milisegundos por token en GPU) y puede servir múltiples peticiones concurrentes sin problemas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de generación de circuitos cuánticos de tamaño similar en la información proporcionada. La comparativa interna con la familia QuantumGPT es la siguiente:

| Modelo | Parámetros | Contexto | QSS-Core v0.1 | Licencia |
|---|---|---|---|---|
| QuantumGPT-124M-v1 | ~124M | 256 | 75.00 | MIT |
| QuantumGPT-124M-v2 | ~124M | 256 | 91.61 | MIT |
| QuantumGPT-124M-v3 | ~124M | 512 | 97.70 | MIT |

No se dispone de comparación con modelos generalistas de generación de código (p. ej. CodeGen, CodeLlama) en tareas de generación de circuitos cuánticos, ya que no hay datos públicos de benchmarks en ese dominio.

## Limitaciones y advertencias

- El benchmark de desarrollo comparte el generador de datos con el corpus de entrenamiento, por lo que los resultados pueden sobreestimar el rendimiento en circuitos verdaderamente nuevos; se recomienda evaluación con datos externos.
- El modelo fue entrenado exclusivamente con circuitos sintéticos generados por Grok y validados por qiskit; no ha visto circuitos reales de hardware cuántico ni de publicaciones científicas.
- No tiene comportamiento de alineación ni de rechazo: cualquier prompt recibe *algún* programa QASM, sea o no semánticamente correcto. Por ejemplo, una solicitud de no-clonación produce un circuito en lugar de una negativa.
- La ventana de contexto de 512 tokens es limitante para algoritmos de gran escala (como la codificación de Shor-9, que se sitúa en el límite).
- Debilidades conocidas: ignora restricciones de negación (p. ej. "SIN puertas de entrelazamiento"), falla en instrucciones compuestas de múltiples partes (completa parcialmente), y las frases casuales o con erratas degradan la precisión semántica.
- Solo soporta prompts en inglés; no se han entrenado otros idiomas.
- No apto para producción de circuitos cuánticos sin verificación humana de cada circuito generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merileijona/quantumgpt-124m-v3
- Repositorio de GitHub: https://github.com/juhanimerilehto/quantumgpt
- Colección QuantumGPT en Hugging Face: https://huggingface.co/collections/merileijona/quantumgpt-quantum-circuit-generation
- Despliegue en FriendliAI: https://friendli.ai/models/merileijona/quantumgpt-124m
- Informe técnico: "QuantumGPT: A Data Scaling Study for Quantum Circuit Generation", Merilehto 2026 (enlace no directo en los resultados, pero disponible en el repositorio de GitHub).
