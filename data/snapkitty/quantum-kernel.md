# Snapkitty/quantum-kernel

## Resumen

El repositorio `Snapkitty/quantum-kernel` no contiene un modelo de inteligencia artificial convencional (como un modelo de lenguaje o una red neuronal), sino un pipeline completo de clasificación mediante *quantum kernel* con máquinas de vectores de soporte (SVM), implementado desde cero por el autor Snapkitty. El proyecto, denominado "Quantum Kernel Engine", prescinde de librerías estándar como Qiskit, Cirq o PennyLane, y construye manualmente cada capa: descomposición de puertas cuánticas, un IR intermedio (QuantumIR), generación de OpenQASM 3.0 dirigido al hardware IBM Heron r3, un ejecutor en Rust y técnicas de mitigación de errores como Zero Noise Extrapolation (ZNE) y Direct Fidelity Estimation (DFE).

La relevancia del proyecto radica en su enfoque de auditoría y transparencia: el IR documenta explícitamente las pérdidas semánticas durante la compilación, y la generación de código cuántico se realiza sin dependencias externas, permitiendo ejecución en entornos limitados (sandboxes, móviles). Sin embargo, al tratarse de un pipeline de computación cuántica y no de un modelo de ML, los parámetros tradicionales (número de parámetros, contexto, cuantización) no son aplicables. El repositorio tiene 0 descargas y 0 likes, y su tamaño es 0.0 GB, lo que sugiere que el código puede estar vacío o no estar correctamente subido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de quantum kernel (feature map + IR + OpenQASM 3.0 + ejecutor Rust) |
| Parametros totales | no disponible (no es un modelo de red neuronal) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card menciona BSL-1.1 \| AGPL-3.0 \| MPL-2.0, pero no se confirma en el campo oficial) |
| Formato de pesos | no aplica (el repositorio contiene código fuente en Go, Julia, Python y Rust) |

## Arquitectura y entrenamiento

El pipeline se compone de varias etapas: primero, un *feature map* definido en Julia con Yao.jl transforma datos clásicos en un circuito cuántico `U_Phi(x)` mediante rotaciones y entrelazamiento. A continuación, el circuito se convierte a un IR intermedio plano (QuantumIR v0.1) en formato JSON, que registra explícitamente las operaciones no soportadas (pérdida de paralelismo, metadatos de diferenciación automática, anidamiento de bloques). Posteriormente, un compilador "MetaQASM" genera OpenQASM 3.0 utilizando únicamente las puertas nativas de IBM Heron r3: RZ, SX y CX. Todas las demás puertas se descomponen manualmente (por ejemplo, `H = RZ(pi/2) * SX * RZ(pi/2) * SX * RZ(pi/2)`).

La mitigación de errores se integra en el circuito mediante ZNE: se ejecutan múltiples versiones con factores de ruido escalados y se extrapola a ruido cero con interpolación de Lagrange. La estimación de fidelidad usa DFE con solo n qubits (frente a los 2n+1 del SWAP test), empleando medición en mitad del circuito y reinicio condicional. La selección de bases de Pauli se alimenta de un generador de números aleatorios cuánticos de la Universidad Nacional Australiana (ANU QRNG), basado en fluctuaciones de vacío. No se menciona entrenamiento de pesos de red; el modelo se limita a construir kernels cuánticos y a entrenar un SVM clásico sobre los valores de similitud estimados.

## Capacidades

- Clasificación binaria mediante kernel cuántico: el pipeline estima el producto interno entre estados cuánticos y lo usa como kernel para una SVM.
- Descomposición de puertas cuánticas a un conjunto nativo (RZ/SX/CX) sin transpiladores externos.
- Generación de OpenQASM 3.0 con soporte para variables clásicas y bucles (usados en ZNE).
- Mitigación de errores integrada en el circuito (ZNE con extrapolación de Richardson).
- Estimación de fidelidad directa (DFE) con medición intermedia y reinicio condicional.
- Uso de aleatoriedad verdaderamente cuántica (ANU QRNG) para selección de bases.
- Emisión de recibos criptográficos (SHA-256 + Ed25519) para auditoría de ejecución.
- Extensión topológica: mapeo de persistencia homológica (TDA) a generadores de trenzas de Artin y cirugía de red (lattice surgery), aunque esta parte aparece incompleta en la documentación.

## Casos de uso

- Investigación en computación cuántica: permite estudiar pipelines de kernel cuántico sin depender de librerías comerciales, ideal para entornos académicos con recursos limitados.
- Educación y formación: al estar construido desde cero y documentar las pérdidas semánticas, sirve como material didáctico para entender la compilación de circuitos cuánticos.
- Prototipado en sandboxes: el código Python está diseñado para ejecutarse en entornos restringidos (Kimi, Replit), lo que facilita pruebas rápidas sin infraestructura local.
- Evaluación de hardware cuántico real: el generador MetaQASM apunta a IBM Heron r3, permitiendo enviar circuitos a ese hardware específico.
- Auditoría de circuitos: el IR explícito y los recibos criptográficos permiten verificar qué transformaciones se aplicaron, útil en entornos donde se requiera trazabilidad.
- Experimentación con mitigación de errores: las técnicas ZNE y DFE implementadas pueden servir de referencia para comparar estrategias de corrección en kernels cuánticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una demo animada (5 qubits, SWAP test, SVM) pero no proporciona métricas numéricas de precisión, velocidad ni comparaciones con otros métodos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU, ya que no es un modelo de inferencia de redes neuronales.
- Para ejecutar el simulador en Go (5 qubits) se necesita un entorno con Go instalado; el coste computacional es bajo (simulación de estado vectorial).
- El pipeline en Julia requiere Julia y las dependencias de Yao.jl; puede ejecutarse en una máquina convencional.
- Para ejecutar en hardware real IBM Heron r3 se necesita acceso a un dispositivo IBM Quantum con la topología heavy-hex correspondiente.
- El ejecutor en Rust compila y se ejecuta de forma nativa; no se indican requisitos de memoria.
- Opciones de despliegue: local (Go, Julia, Python, Rust) o en sandboxes con soporte para estos lenguajes. No se mencionan herramientas como vLLM, llama.cpp u Ollama, que son específicas de modelos de lenguaje.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de pipelines de quantum kernel de código abierto con las mismas características (sin dependencias, con IR explícito y mitigación de errores integrada). Herramientas como Qiskit, Cirq o PennyLane ofrecen funcionalidades similares pero con enfoques distintos (dependencias pesadas, transpiladores automáticos). No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo de IA generativa ni de lenguaje; no puede procesar texto, imágenes ni realizar razonamiento simbólico.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que el código puede estar vacío o incompleto en Hugging Face.
- La licencia no está confirmada en el campo oficial; la model card menciona BSL-1.1, AGPL-3.0 y MPL-2.0, pero su aplicabilidad es incierta.
- Depende de hardware cuántico real o de simuladores; los resultados pueden verse afectados por ruido y errores de decoherencia.
- El pipeline está orientado a kernels cuánticos de pocos qubits (el ejemplo usa 5); escalar a más qubits requiere simuladores más potentes o hardware real.
- La extensión topológica (TDA, trenzas, lattice surgery) parece estar en fase de desarrollo y no se documenta su validación.
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Snapkitty/quantum-kernel
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
