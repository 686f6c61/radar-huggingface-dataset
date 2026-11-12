# socialprescribing/quantumkrump

## Resumen

QKMLM (Quantum Krump Machine Learning Model) es un clasificador tabular híbrido cuántico-clásico publicado por el usuario socialprescribing. Combina un codificador clásico afín de 8 dimensiones con un circuito cuántico variacional (VQC) de 4 qubits y tres cabezas decodificadoras clásicas multi-tarea. El modelo está diseñado específicamente para el dominio de la kinesiología de la danza urbana (krump) y la biomecánica, tomando como entrada vectores de 8 características cinemáticas (Laban Weight/Time/Space/Flow, pico de fuerza de reacción del suelo, jerk torácico, ángulo de fase musical y sincronización neuromuscular CHRNA1).

La relevancia del modelo es más pedagógica y metodológica que de rendimiento: el propio autor documenta explícitamente que el componente cuántico no aporta ventaja de precisión ni de latencia frente a alternativas puramente clásicas sobre datos de 8 dimensiones. Su valor reside en servir de puente inspeccionable entre telemetría biomecánica y circuitos cuánticos exportables (Guppy/HUGR, OpenQASM 2.0), además de incluir un estudio de escalabilidad de 4 a 10 qubits con mitigación de barren plateaus.

El repositorio es de tamaño mínimo (0,0 GB) y contiene artefactos de documentación (monografía de 56 páginas, paper pedagógico, paper de Physical AI) y recibos de auditoría estadística, más que pesos de un modelo de lenguaje convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador afín clásico (d=8) + VQC de 4 qubits (3 capas variacionales, 36 ángulos entrenables) + 3 cabezas decodificadoras clásicas (MLP GELU) |
| Parámetros totales | 1.175 (36 en el VQC, 1.139 en componentes clásicos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo tabular, no secuencial) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio contiene documentación PDF y JSON de auditoría; tamaño 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura consta de cuatro etapas. Primero, un codificador afín clásico (`W_enc x + b_enc`) proyecta el vector de 8 características biocinemáticas a 4 ángulos en el rango [-π, π]. Segundo, un circuito cuántico parametrizado de 4 qubits aplica puertas R_Y y R_Z por qubit, entrelazamiento monoidal DisCoPy (anillo CZ más cross-swaps σ_{0,2} y σ_{1,3}) y tres capas variacionales con 36 ángulos entrenables en total. Tercero, se miden 8 observables de Pauli (⟨Z_0⟩…⟨Z_3⟩ y correlaciones ⟨Z_0Z_1⟩, ⟨Z_1Z_2⟩, ⟨Z_2Z_3⟩, ⟨Z_0Z_3⟩). Cuarto, tres cabezas decodificadoras clásicas producen: clasificación de movimiento fundamental (5 clases), fenotipo de bailarín (5 clases) y energía de clímax de resonancia (escalar continuo en [0,1]).

El entrenamiento se realizó en Modal Cloud sobre 2.500 muestras biocinemáticas sintéticas (2.000 de entrenamiento, 500 de prueba). El autor documenta ablaciones clásicas estrictas que revelan que el 96,9% de los parámetros entrenables son clásicos y que eliminar el VQC (bypass identidad) o sustituirlo por un MLP clásico de rango 2 iguala o supera la precisión híbrida con latencias de CPU entre 30 y 50 veces menores. Se incluye además un estudio de escalabilidad de 4 a 10 qubits con mitigación de barren plateaus y una reducción de profundidad SU(2) de 2 qubits del 86,05% (de 43 a 6 capas) mediante Haiqu.

## Capacidades

- Clasificación tabular multi-tarea sobre vectores de 8 dimensiones biocinemáticas.
- Clasificación de movimiento fundamental en 5 clases (STOMP, JAB, CHEST POP, ARM SWING, KILL-OFF).
- Identificación de fenotipo de bailarín en 5 clases (Brawler, Flash, BigHomie, Flow, Hype).
- Regresión de energía de clímax de resonancia como escalar continuo en [0,1].
- Exportación de circuitos cuánticos a Guppy/HUGR y OpenQASM 2.0.
- Entrelazamiento monoidal DisCoPy con cross-swaps Frobenius.
- Escalabilidad documentada de 4 a 10 qubits con mitigación de barren plateaus.
- No soporta tool calling, function calling, agentes, generación de texto ni capacidades multimodales.

## Casos de uso

- Análisis biomecánico de danza urbana: el modelo clasifica movimientos de krump a partir de telemetría cinemática (fuerza de reacción del suelo, jerk torácico, fase musical), permitiendo etiquetado automático de sesiones de entrenamiento grabadas con sensores inerciales.
- Evaluación de estilo y fenotipo de bailarín: con la cabeza de fenotipo se puede caracterizar el perfil expresivo de un intérprete (Brawler, Flash, BigHomie, Flow, Hype) para feedback coreográfico o sistemas de puntuación de competición.
- Detección de picos de intensidad expresiva: la cabeza de regresión estima la energía de clímax de resonancia en [0,1], útil para sincronizar iluminación, audio o efectos escénicos con los momentos de máxima intensidad del bailarín.
- Investigación en computación cuántica aplicada: el VQC de 4 qubits con entrelazamiento DisCoPy sirve como banco de pruebas reproducible para estudiar expresividad de circuitos y mitigación de barren plateaus en problemas reales de baja dimensionalidad.
- Docencia y divulgación en quantum ML: los papers pedagógicos y la demo interactiva en Hugging Face Spaces permiten ilustrar el flujo completo de datos clásicos a circuito cuántico y de vuelta a decodificadores clásicos.
- Exportación a hardware cuántico: los circuitos exportables a OpenQASM 2.0 y Guppy/HUGR permiten ejecutar el mismo modelo en backends de Quantinuum o simuladores, facilitando la validación cruzada entre simulación y hardware real.
- Integración en pipelines de Physical AI para robótica de movimiento: el paper KrumpRobot documenta el uso del modelo como puente entre telemetría humana y control de robots humanoides con intención expresiva.

## Benchmarks y rendimiento

Resultados del recibo sellado en Modal Cloud sobre 500 muestras de prueba:

| Métrica | Resultado | Objetivo | Estado |
|---|---|---|---|
| Precisión clasificación fundamental | 98,60% | ≥ 90,0% | PASS |
| Precisión identificación de fenotipo | 89,40% | ≥ 80,0% | PASS |
| RMSE energía de clímax | 0,0326 | ≤ 0,080 | PASS |
| Latencia inferencia p50 (serverless) | 4,962 ms | < 5,0 ms | PASS |
| Latencia inferencia p99 (serverless) | 4,754 ms | < 10,0 ms | PASS |
| Reducción profundidad Haiqu SU(2) | 86,05% (43→6 capas) | ≥ 80,0% | PASS |
| Solapamiento puerta de auditoría G_QKMLM | F = 0,9992 | ≥ 0,990 | PASS |

Ablaciones clásicas sobre la misma partición estratificada:

| Arquitectura | Parámetros | Precisión fund. | Precisión fenotipo | RMSE energía | Latencia CPU p50 |
|---|---|---|---|---|---|
| Híbrido QKMLM (VQC 4 qubits) | 1.175 | 98,60% | 89,40% | 0,0326 | 1,31 ms |
| Bypass identidad (sin VQC) | 1.139 | 99,60% | 90,40% | 0,0307 | 0,03 ms |
| MLP clásico rango 2 emparejado | 1.175 | 99,80% | 88,60% | 0,0336 | 0,04 ms |
| MLP clásico directo (8→24→cabezas) | 1.067 | 99,80% | 86,40% | 0,0219 | 0,02 ms |
| GBDT scikit-learn | — | 99,00% | 89,60% | 0,0221 | 0,67 ms |
| Baseline lineal (logística + ridge) | 99 | 99,20% | 58,60% | 0,0207 | 0,05 ms |

## Requisitos de hardware

- Al ser un modelo tabular de 1.175 parámetros, no requiere GPU para inferencia: la latencia local en CPU p50 es de 1,31 ms para la variante híbrida y de 0,02–0,04 ms para las ablaciones clásicas.
- Para ejecutar el componente cuántico se necesita un simulador de circuitos (4 a 10 qubits) o acceso a hardware de Quantinuum vía Guppy/HUGR; el espacio de Hilbert para 10 qubits es de dimensión 1.024.
- Cabe holgadamente en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU de un solo núcleo; no hay requisitos de VRAM significativos.
- Opciones de despliegue: Modal Cloud (usado por el autor), simulación local con frameworks de circuitos cuánticos, y exportación a OpenQASM 2.0 para backends compatibles. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia serverless documentada: p50 de 4,962 ms y p99 de 4,754 ms en Modal Cloud.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Precisión fund. | Licencia |
|---|---|---|---|---|---|
| QKMLM | Híbrido VQC 4 qubits | 1.175 | Clasificación tabular biocinemática | 98,60% | Apache 2.0 |
| MLP clásico directo (ablación del propio autor) | Clásico | 1.067 | Misma tarea | 99,80% | — |
| GBDT scikit-learn (ablación del propio autor) | Clásico | — | Misma tarea | 99,00% | — |
| Baseline lineal (ablación del propio autor) | Clásico | 99 | Misma tarea | 99,20% | — |

No se dispone de comparativas con otros modelos cuánticos o híbridos publicados para esta tarea específica en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara explícitamente cero ventaja de precisión o latencia del componente cuántico sobre alternativas clásicas en datos de 8 dimensiones; las ablaciones clásicas igualan o superan al modelo híbrido.
- El 96,9% de los parámetros son clásicos, por lo que el modelo es predominantemente un MLP con un cuello de botella cuántico de 36 ángulos.
- Entrenado sobre datos sintéticos biocinemáticos (2.500 muestras), no sobre grabaciones reales de bailarines; la generalización a telemetría real no está validada.
- Dominio muy restringido: solo krump y kinesiología de danza urbana; no es un modelo de propósito general.
- Solo soporta inglés en su documentación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.
- Riesgo de sobreajuste por el tamaño reducido del conjunto de prueba (500 muestras).
- La licencia Apache 2.0 permite uso comercial, pero la utilidad comercial del modelo es dudosa dado que alternativas clásicas son más rápidas y precisas.
- La reproducibilidad depende de los recibos de auditoría JSON incluidos; no se documentan pesos del modelo en formato estándar (safetensors, GGUF), lo que dificulta la reutilización directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/socialprescribing/quantumkrump
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/socialprescribing/quantumkrump
- Portal del proyecto (10 idiomas): https://arunnadarasa.github.io/quantumkrump/
- Monografía de referencia (PDF): quantum-krump-preprint.pdf (en el repositorio)
- Paper pedagógico (PDF): quantum-krump-pedagogy-paper.pdf (en el repositorio)
- Paper KrumpRobot Physical AI (PDF): krumprobot-physical-ai-paper.pdf (en el repositorio)
- Recibo de ablación y auditoría estadística: deep_review_ablation_receipt_20261111.json (en el repositorio)
- Skill OpenClaw (ClawHub): https://clawhub.ai/arunnadarasa/skills/quantumkrump
- Referencias arXiv citadas en los tags: arXiv:1904.03278, arXiv:2406.10454, arXiv:2410.21229, arXiv:2609.16089, arXiv:2604.03999, arXiv:2503.04613
