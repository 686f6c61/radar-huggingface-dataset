# Snapkitty/p3q-tsql

## Resumen

P3Q-TLM (también identificado como p3q-tsql) es un proyecto de infraestructura de verificación formal y criptografía, no un modelo de lenguaje generativo. Ha sido desarrollado por Snapkitty (SNAPKITTYWEST), con autores Ahmad Ali Parr y Jessica L. Williams, y se enmarca dentro de una iniciativa más amplia de "infraestructura de IA soberana" según el perfil de la organización en Hugging Face.

El proyecto combina un pipeline criptográfico basado en el campo finito F₂⁸ con un framework de verificación formal, con el objetivo de lograr transiciones de estado deterministas, pruebas de seguridad sin errores y simulación de circuitos cuánticos reversibles. No se trata de un modelo con pesos entrenados, sino de un conjunto de módulos de especificación y verificación: VHDL para diseño de puertas, Lean 4 para demostraciones matemáticas, OpenQASM 3.0 para circuitos cuánticos y Python para simulación de tensores.

La relevancia actual radica en su enfoque hacia la verificación formal de componentes criptográficos y cuánticos, un área crítica para la seguridad de infraestructuras de IA soberanas. No se dispone de información sobre arquitectura de modelo, tamaño de parámetros ni longitud de contexto, ya que no es un modelo de aprendizaje automático convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de módulos de verificación formal: VHDL, Lean 4, OpenQASM 3.0, Python (no es un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el proyecto no procesa lenguaje natural) |
| Licencia | BSL-1.1 / AGPL-3.0 / MPL-2.0 (triple licencia) |
| Formato de pesos | no disponible (no utiliza pesos; incluye archivos .vhd, .lean, .qasm, .py) |

## Arquitectura y entrenamiento

El proyecto P3Q-TLM se estructura en cuatro módulos principales, cada uno con un propósito específico de verificación. El módulo "P3 Gate-Level VHDL" (`tlm_p3_gate.vhd`) implementa una operación AES MixColumns mediante lógica combinacional optimizada, sin tablas de búsqueda, con una profundidad lógica limitada a 4 niveles XOR y un objetivo de rendimiento superior a 500 MHz. El módulo "Lean 4 Formalization" (`MixColumns.lean`) contiene demostraciones matemáticas sin "sorry" (sin agujeros de prueba) sobre propiedades algebraicas del campo de característica 2, incluyendo la linealidad de xtime y la conservación de la traza. El módulo "OpenQASM 3.0 Reversible Circuits" (`p3q_reversible_aes4.qasm`) implementa una S-Box reversible basada en el algoritmo optimizado de Boyar-Peralta y una expansión de AES de 4 rondas, con un contador de puertas Clifford+T de 4.400 T-count por iteración. El módulo "Tensor Network Simulation" (`p3q_tensor_sim.py`) utiliza una simulación de matrix product states (MPS) con contracción de tensores de alta dimensión y truncamiento SVD, diseñada para analizar variedades no conmutativas y operaciones de confusión cuántica en sistemas de 50 o más qubits.

No se proporcionan datos de entrenamiento, número de tokens ni composición de dataset, ya que no es un modelo entrenado. El proyecto se describe como un esfuerzo de verificación formal, no de aprendizaje automático. La innovación técnica destacable incluye la ausencia de tablas en la implementación de MixColumns, el uso de Lean 4 para pruebas formales sin errores y la integración de simulación de tensores con circuitos reversibles.

## Capacidades

- Verificación formal de propiedades algebraicas en campos finitos de característica 2, mediante demostraciones en Lean 4 sin "sorry".
- Implementación de AES MixColumns en VHDL con lógica combinacional pura y profundidad limitada a 4 niveles XOR.
- Diseño de circuitos reversibles en OpenQASM 3.0 para AES de 4 rondas, con S-Box optimizada según Boyar-Peralta.
- Simulación de sistemas de 50 o más qubits mediante matrix product states (MPS) y contracción de tensores.
- Pruebas de invariantes de estado y conservación de traza en simulaciones de tensores.
- Gestión de eventos y comandos cuánticos con verificación de tipos, según el inventario del proyecto.
- No dispone de capacidades de generación de texto, razonamiento de lenguaje natural, tool calling, agentes, visión ni audio.

## Casos de uso

- Verificación de hardware criptográfico: el módulo VHDL puede utilizarse para validar la implementación de AES MixColumns en FPGA o ASIC, asegurando que la lógica cumple las especificaciones de temporización y mapeo de vectores antes de la fabricación.
- Demostración matemática de propiedades de seguridad: las pruebas Lean 4 permiten certificar formalmente que las transformaciones xtime son lineales y que la traza se conserva, lo que resulta útil en auditorías de algoritmos criptográficos.
- Simulación de circuitos cuánticos reversibles: el módulo OpenQASM permite estudiar el coste en puertas Clifford+T de implementaciones reversibles de AES, útil para investigación en criptografía post-cuántica.
- Análisis de sistemas cuánticos de gran escala: la simulación MPS puede emplearse para estudiar la evolución de estados en sistemas de 50 o más qubits, en contextos de computación cuántica y teoría de la información.
- Integración en pipelines de verificación continua: los módulos de VHDL y Lean 4 pueden incorporarse a entornos CI/CD para validar cambios en diseños criptográficos o en pruebas matemáticas, reduciendo el riesgo de regresiones.
- Documentación de seguridad para infraestructura soberana: el proyecto puede servir como referencia de pruebas formales en sistemas que requieren garantías de integridad y transparencia, alineándose con la filosofía de "soberanía" de Snapkitty.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no presenta métricas comparativas de rendimiento de modelos de lenguaje. No obstante, la información proporcionada incluye una tabla de verificación con estados de validación que puede considerarse evidencia de corrección funcional, aunque no constituye un benchmark estándar:

| Modulo | Objetivo de verificacion | Backend de resolucion | Estado |
|---|---|---|---|
| P3 VHDL | Temporizacion de puertas y mapeo de vectores de especificacion | GHDL / ModelSim | Pass |
| Lean 4 | Ley distributiva de caracteristica 2 y polinomios irreducibles | Lean 4 Kernel | Verified |
| MPS Sim | Traza de matrices de estado e invariantes de variedad | NumPy / SciPy | Active |

## Requisitos de hardware

- No se dispone de estimaciones de VRAM para inferencia, ya que el proyecto no es un modelo de lenguaje.
- Para la simulación MPS de 50 o más qubits, se requiere una CPU con capacidades de cálculo numérico (NumPy/SciPy) y, posiblemente, aceleración GPU, aunque no se especifica.
- Para la verificación VHDL, se necesita un entorno con GHDL o ModelSim.
- Para las pruebas Lean 4, se requiere el compilador Lean y el gestor de proyectos Lake.
- Las opciones de despliegue no incluyen vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de inferencia.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. El proyecto P3Q-TLM no es un modelo de lenguaje ni un modelo de IA generativa, por lo que no puede compararse con modelos como Llama, Mistral o Qwen. Su naturaleza es de infraestructura de verificación formal y criptográfica, para la cual no se han identificado alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo; no puede procesar texto natural, generar respuestas ni realizar tareas de NLP.
- La triple licencia (BSL-1.1 / AGPL-3.0 / MPL-2.0) puede implicar restricciones para uso comercial, especialmente la AGPL-3.0, que exige la publicación del código fuente en determinadas condiciones de distribución.
- El proyecto depende de herramientas externas (GHDL, Lean 4, Lake, NumPy, SciPy), lo que añade complejidad de integración.
- No se han publicado benchmarks comparativos ni métricas de rendimiento frente a otras soluciones.
- El estado de algunos módulos es "Active" en lugar de "Verified", lo que indica que la validación puede no estar completa.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto, al no ser aplicables a un proyecto de verificación formal.
- El README contiene texto en varios idiomas (chino, árabe) sin traducción completa, lo que puede dificultar la interpretación de la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/Snapkitty/p3q-tsql
- Perfil de Snapkitty en Hugging Face: https://huggingface.co/Snapkitty
- Modelos de Hugging Face con filtro snapkitty: https://huggingface.co/models?other=snapkitty
