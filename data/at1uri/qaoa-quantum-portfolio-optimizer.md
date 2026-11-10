# At1uri/qaoa-quantum-portfolio-optimizer

## Resumen

El repositorio `At1uri/qaoa-quantum-portfolio-optimizer` no contiene un modelo de lenguaje neuronal, sino un motor de optimización cuántica variacional implementado en Python que resuelve problemas de selección de cartera con restricción de cardinalidad mediante los algoritmos QAOA (Quantum Approximate Optimization Algorithm) y VQE (Variational Quantum Eigensolver). Lo desarrolla el usuario At1uri como parte de una supuesta "Institutional Quantitative AI Suite" y se publica bajo licencia Apache 2.0.

El problema que aborda es la formulación de Markowitz de media-varianza con cardinalidad exacta, un problema NP-hard que se transforma en un QUBO y, posteriormente, en un Hamiltoniano de Ising longitudinal mediante el mapeo de espín 1/2. El motor simula el circuito cuántico sobre vectores de estado (statevector) y calcula gradientes de forma analítica con la regla de parameter-shift, evitando diferencias finitas numéricas.

Es relevante en el contexto de la computación cuántica aplicada a finanzas cuantitativas, pero conviene subrayar que el alcance empírico es muy limitado: los benchmarks publicados cubren únicamente universos de 4 y 5 qubits (16 y 32 estados base), por lo que no demuestra ventaja cuántica ni escalabilidad a problemas reales de cartera. La etiqueta `feature-extraction` del Hub es engañosa: no se trata de un extractor de características ni de un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Circuito cuántico variacional (QAOA de p capas y VQE con ansatz hardware-efficient de profundidad d), simulado sobre statevector |
| Parametros totales | No disponible (el número de parámetros varía: 2p para QAOA y n·d para VQE según qubits y profundidad) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el tamaño del problema está acotado por el número de qubits n) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (documentación y API en Python) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`qaoa_circuit_weights.json` con vectores γ*, β* y θ*); código Python en `quantum_eigensolver.py` |

## Arquitectura y entrenamiento

La arquitectura consta de dos rutinas de optimización sobre un Hamiltoniano de Ising longitudinal. QAOA parte de la superposición uniforme |+⟩^⊗n y aplica p capas alternas del unitario de coste U_C(γ) = exp(−iγH_C) y del mezclador U_B(β) = exp(−iβΣσ^x). VQE emplea un ansatz hardware-efficient con rotaciones R_y intercaladas con puertas CZ. Los coeficientes del Hamiltoniano (h_i, J_ij y C_offset) se derivan analíticamente de la matriz de covarianzas Σ, el vector de retornos μ, la aversión al riesgo q, la cardinalidad objetivo K y el penalizador λ.

No hay "entrenamiento" en el sentido de aprendizaje automático: la optimización ajusta los parámetros variacionales (γ, β o θ) para minimizar el valor esperado ⟨H_C⟩. El gradiente se calcula con la regla de parameter-shift exacta sobre el statevector, ∂⟨H_C⟩/∂θ_k = (⟨H_C⟩_{θ_k+π/2} − ⟨H_C⟩_{θ_k−π/2})/2. El repositorio incluye vectores de parámetros pre-convergidos en `qaoa_circuit_weights.json` y resultados en `benchmarks.json`. No se documenta el número de tokens ni composición de dataset porque no aplica; tampoco se detalla el número de iteraciones de optimización más allá de `max_steps=40` en el ejemplo.

## Capacidades

- Resolución de QUBO con restricción de cardinalidad exacta (selección de K activos de un universo de n).
- Mapeo automático de Markowitz (μ, Σ, q, K, λ) a Hamiltoniano de Ising longitudinal con coeficientes analíticos.
- Optimización QAOA con número configurable de capas p.
- Optimización VQE con ansatz hardware-efficient de profundidad configurable.
- Cálculo de gradientes analíticos mediante parameter-shift (sin diferencias finitas).
- Extracción del estado fundamental, energía mínima E_0 y bitstring óptimo.
- Cálculo del ratio de aproximación α respecto a la energía del estado fundamental.
- Cálculo de entropía de entrelazamiento del estado preparado.
- Simulación statevector de hasta n qubits (limitada por memoria: 2^n amplitudes complejas).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües propias de un LLM.

## Casos de uso

- Selección de carteras con cardinalidad fija en investigación académica: permite reproducir el pipeline Markowitz → QUBO → Ising y comparar QAOA frente a VQE en universos pequeños (n ≤ 10) para estudiar ratios de aproximación.
- Docencia de computación cuántica aplicada: el código standalone y dependency-light sirve para ilustrar la formulación de Ising, la regla de parameter-shift y el diseño de ansätze en un caso financiero concreto.
- Prototipado de pipelines híbridos cuántico-clásicos: los vectores pre-convergidos en `qaoa_circuit_weights.json` permiten inicializar optimizadores clásicos (COBYLA, SPSA) en experimentos de warm-start.
- Benchmarking de simuladores cuánticos: al ser statevector puro y ligero, se puede usar como referencia de exactitud frente a simuladores con ruido o backends reales.
- Análisis de sensibilidad de hiperparámetros: variando q, K y λ_budget se estudia cómo cambia el paisaje energético y el gap espectral en problemas de arbitraje combinatorio de pequeño tamaño.
- Generación de datasets sintéticos de problemas QUBO con solución conocida (E_0 y bitstring óptimo), útiles para entrenar o validar heurísticas clásicas de optimización combinatoria.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card corresponden a tres universos de 4 y 5 qubits. α es el ratio de aproximación definido como (⟨H_C⟩ − E_max)/(E_0 − E_max).

| Universo | Qubits (n) | Estado objetivo | E_0 | QAOA p=1 (α) | QAOA p=3 (α) | VQE d=2 (α) | Entropía de entrelazamiento |
|---|---|---|---|---|---|---|---|
| Tech Mega-Caps (AAPL, MSFT, NVDA, GOOGL) | 4 | \|1010⟩ | −0.4697 | 88,4 % | 97,2 % | 92,1 % | 0,842 bits |
| Multi-Asset Macro (SPY, TLT, GLD, BTC) | 4 | \|0110⟩ | −0.3812 | 86,1 % | 96,5 % | 90,8 % | 0,795 bits |
| Crypto High-Beta (BTC, ETH, SOL, AVAX, LINK) | 5 | \|10100⟩ | −0.5841 | 82,7 % | 94,8 % | 88,6 % | 0,914 bits |

No se han publicado comparaciones frente a solvers clásicos (por ejemplo, branch-and-bound o programación entera) ni resultados en hardware cuántico real, por lo que no es posible evaluar ventaja cuántica alguna.

## Requisitos de hardware

- Inferencia en CPU: el motor es simulación statevector pura en Python; para n = 4 y n = 5 requiere únicamente 16 y 32 amplitudes complejas, ejecutable en cualquier portátil.
- Memoria: escala como O(2^n) amplitudes complejas (16 bytes por amplitud en doble precisión); n = 20 supone ~16 MB, n = 30 ~16 GB, por lo que más allá de n ≈ 28-30 se vuelve inviable en una sola máquina.
- GPU: no se requiere GPU; no se documenta soporte CUDA ni aceleración por hardware.
- Backends cuánticos reales: no se menciona integración con Qiskit, PennyLane, Cirq, Amazon Braket ni IBM Quantum; el repositorio es standalone.
- Despliegue: ejecución directa del script Python `quantum_eigensolver.py`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste dominante es la optimización variacional (max_steps configurable) sobre statevector, no la inferencia.

## Comparativa con modelos similares

| Herramienta | Enfoque | Escalabilidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| At1uri/qaoa-quantum-portfolio-optimizer | QAOA/VQE statevector para Markowitz con cardinalidad | n = 4-5 en benchmarks; límite práctico ~25-30 qubits por memoria | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qiskit Optimization (IBM) | Módulo de optimización con QAOA, VQE y solvers clásicos | Statevector y hardware IBM; mayor ecosistema | Apache 2.0 | PyPI, GitHub |
| PennyLane (Xanadu) | Framework de programación cuántica diferenciable con QAOA/VQE | Simuladores y hardware múltiple; autodiferenciación nativa | Apache 2.0 | PyPI, GitHub |
| D-Wave Ocean SDK | Recocido cuántico para QUBO/Ising | Hardware de recocido real; miles de variables | Apache 2.0 | PyPI, GitHub |

La propuesta de At1uri es mucho más acotada que cualquiera de las alternativas: no ofrece autodiferenciación general, ni backend hardware, ni solvers clásicos de referencia. Su valor es didáctico y de referencia mínima.

## Limitaciones y advertencias

- Alcance empírico mínimo: los benchmarks cubren solo n = 4 y n = 5 (16 y 32 estados), sin demostración de escalabilidad ni de ventaja frente a solvers clásicos.
- Sin validación en hardware cuántico real: todo son resultados de simulación statevector sin ruido; no se reportan experimentos con errores de puerta o decoherencia.
- El pipeline_tag `feature-extraction` del Hub es incorrecto para la naturaleza del artefacto; puede inducir a error en búsquedas.
- Cero descargas y cero likes: no hay evidencia de uso ni revisión por la comunidad.
- Sin paper asociado ni referencia bibliográfica en la model card; la formulación matemática es correcta pero no se cita literatura de QAOA/VQE.
- Riesgo de sobreajuste de hiperparámetros: los vectores pre-convergidos corresponden a los tres universos concretos del benchmark y no son transferibles a otras matrices Σ o μ.
- Idiomas: documentación y API solo en inglés; no hay soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al no haber validación en producción, cualquier uso real de cartera requiere validación independiente y auditoría del mapeo QUBO → Ising.
- La afirmación "Institutional Quantitative AI Suite" no está respaldada por documentación adicional en el repositorio.
- No hay tests, CI ni versionado documentado más allá de los ficheros listados.

## Enlaces

- Hugging Face: https://huggingface.co/At1uri/qaoa-quantum-portfolio-optimizer
- Perfil del autor: https://huggingface.co/At1uri
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
