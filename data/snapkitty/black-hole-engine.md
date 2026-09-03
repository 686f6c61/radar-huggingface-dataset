# Snapkitty/black-hole-engine

## Resumen

Black Hole Engine es un proyecto de investigación en computación cuántica desarrollado por el autor Snapkitty, publicado en Hugging Face bajo el identificador `Snapkitty/black-hole-engine`. No se trata de un modelo de inteligencia artificial generativa, sino de un sistema de software que implementa estimación de fase cuántica (quantum phase estimation) como primitiva de computación general, independiente del hardware cuántico subyacente. El proyecto busca responder si la estimación de fase puede tratarse como un primitivo computacional abstracto, ejecutable sobre distintos backends cuánticos (IBM superconductores, IonQ de iones atrapados y Quantinuum H-series) mediante una capa de abstracción escrita en Q#.

La relevancia actual del proyecto radica en la creciente necesidad de portabilidad algorítmica entre plataformas cuánticas heterogéneas, cuyos conjuntos de puertas, topologías de conectividad y perfiles de error difieren sustancialmente. El sistema separa el circuito lógico (definido en Q#) de la transpilación a cada backend específico, permitiendo comparar resultados entre distintos sustratos físicos. El nombre "Black Hole" proviene de la analogía entre la información codificada en una fase cuántica y la información en un agujero negro: presente y extraíble, pero no directamente observable sin la base de medición adecuada.

El proyecto se encuentra en estado experimental y su model card indica que la simulación está disponible para desarrollo y verificación, mientras que la ejecución en hardware real requiere acceso a las respectivas plataformas cuánticas. No se proporcionan datos sobre licencia, idiomas soportados ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de software cuantico: Q# para descripcion de circuitos, Python para orquestacion y analisis. Capa de abstraccion multi-backend (IBM, IonQ, Quantinuum) |
| Parametros totales | No aplica (no es un modelo de redes neuronales) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card menciona "Copyright BEL ESPRIT D ACCORD TRUST HOLDINGS INC." y un archivo LICENSE, pero no se especifica el tipo) |
| Formato de pesos | No aplica (el proyecto se distribuye como codigo fuente: archivos .qs y .py) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de red neuronal ni un proceso de entrenamiento convencional. Se trata de un framework de computación cuántica estructurado en varios componentes: `QuantumPrimitives.qs` define las operaciones cuánticas básicas y abstracciones; `Phase2Engine.qs` implementa el protocolo de estimación de fase en su fase 2; los archivos `IBM.qs`, `IonQ.qs` y `Quantinuum.qs` contienen la lógica de transpilación y targeting para cada backend físico; y `run_phase2.py` orquesta la ejecución y el análisis de resultados.

El flujo de trabajo comienza con un estado cuántico, se construye un circuito lógico independiente del backend, se aplica la estimación de fase, se selecciona el backend de ejecución, se transpila al conjunto de puertas nativas, se ejecuta en hardware y se realiza post-procesamiento para obtener la estimación de fase. La elección de Q# se justifica por su sistema de tipos para operaciones cuánticas, capacidades de simulación, soporte para targeting a múltiples backends y la separación explícita entre circuitos lógicos y físicos.

No se menciona ningún proceso de entrenamiento, ajuste o uso de datos de entrenamiento. El proyecto es puramente algorítmico y de investigación.

## Capacidades

- Estimación de fase cuántica: implementa el protocolo de estimación de fase (Phase 2) para extraer autovalores de operadores unitarios, calculando el parámetro θ en la ecuación U|ψ⟩ = e^(2πiθ)|ψ⟩.
- Abstracción multi-backend: permite ejecutar el mismo circuito lógico en tres plataformas cuánticas diferentes (IBM, IonQ, Quantinuum) mediante una capa de transpilación unificada.
- Simulación local: incluye modo de simulación para desarrollo y verificación sin necesidad de hardware cuántico real.
- Orquestación en Python: el script `run_phase2.py` coordina la ejecución, recopila mediciones y realiza post-procesamiento de resultados.
- Separación lógico-físico: distingue entre el circuito lógico (independiente del hardware) y el circuito físico transpilado, lo que permite estudiar el impacto del sustrato físico en los resultados.
- Investigación sobre la relación entre simulación y ejecución real: el proyecto explora explícitamente la brecha entre lo que un circuito simula y lo que el hardware realmente ejecuta.

## Casos de uso

- Investigación en algoritmos cuánticos: el sistema permite a investigadores estudiar cómo varía la estimación de fase entre distintos backends, facilitando la comparación de fidelidad y perfiles de error entre IBM, IonQ y Quantinuum.
- Desarrollo de primitivas cuánticas portables: sirve como base para construir librerías de algoritmos cuánticos que no dependan de un proveedor específico, reduciendo el coste de migración entre plataformas.
- Validación de transpilación: los archivos específicos por backend permiten auditar cómo cada plataforma traduce un circuito lógico a su conjunto de puertas nativas, útil para optimizar la compilación cuántica.
- Educación y formación en computación cuántica: el modo de simulación y la estructura modular del código ofrecen un entorno didáctico para aprender estimación de fase y diferencias entre arquitecturas de hardware cuántico.
- Benchmarking de hardware cuántico: al ejecutar el mismo algoritmo en múltiples backends, se pueden generar métricas comparativas de rendimiento (fidelidad de medición, tasas de error) para evaluar la madurez de cada plataforma.
- Exploración de la conexión entre información cuántica y gravedad: el marco conceptual del proyecto (fase como información, analogía con agujeros negros) puede servir como punto de partida para investigaciones teóricas en la intersección de información cuántica y relatividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, tasas de error, fidelidad de estimación ni comparaciones cuantitativas entre backends. El proyecto se encuentra en fase experimental y no se proporcionan datos numéricos de validación.

## Requisitos de hardware

- Para el modo de simulación: se requiere un ordenador con .NET SDK, el kit de desarrollo de Q# y Python 3.10 o superior. La simulación de circuitos cuánticos es computacionalmente intensiva; para circuitos pequeños (pocos qubits) un CPU moderno es suficiente, pero para circuitos medianos se recomienda al menos 16 GB de RAM.
- Para ejecución en hardware real: se necesita acceso a las plataformas IBM Quantum, IonQ o Quantinuum, lo que implica credenciales de API y, en la mayoría de los casos, cuentas de pago o planes de investigación.
- No se especifican requisitos de GPU, ya que el proyecto no utiliza aceleración por GPU en su descripción.
- Opciones de despliegue: el proyecto se ejecuta como scripts de Python y archivos Q#; no está diseñado para despliegue como servicio web ni para integración con frameworks de inferencia como vLLM u Ollama.
- Latencia y throughput: no disponibles. Dependen completamente del backend cuántico utilizado y del número de qubits y disparos (shots) configurados.

## Comparativa con modelos similares

No disponible. No se han identificado proyectos comparables en la información proporcionada. El campo de frameworks de abstracción multi-backend cuántico incluye iniciativas como Qiskit, Cirq o PennyLane, pero no se dispone de datos suficientes para establecer una comparación rigurosa con este proyecto específico.

## Limitaciones y advertencias

- Estado experimental: el proyecto se declara como "Research / Experimental" y no está listo para producción.
- Requiere acceso a hardware cuántico real para ejecución en backends físicos; sin ese acceso, solo se puede utilizar el modo de simulación.
- La simulación no equivale a la ejecución real: la model card advierte explícitamente que simular un circuito en un ordenador clásico no revela el comportamiento real del hardware, y esa brecha es parte del objeto de investigación.
- Licencia no especificada: aunque se menciona un archivo LICENSE y un copyright de "BEL ESPRIT D ACCORD TRUST HOLDINGS INC.", no se indica el tipo de licencia (MIT, Apache, etc.), lo que genera incertidumbre sobre los términos de uso y redistribución.
- Dependencia de tecnologías externas: requiere .NET SDK, Q# y Python, y la compatibilidad con versiones futuras de estas herramientas no está garantizada.
- Sin métricas de rendimiento: no hay benchmarks publicados que permitan evaluar la precisión de la estimación de fase ni la comparación entre backends.
- Alcance limitado: el proyecto se centra exclusivamente en estimación de fase; no incluye otros algoritmos cuánticos ni capacidades de corrección de errores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Snapkitty/black-hole-engine
- Repositorio en GitHub (mencionado en la model card): https://github.com/SNAPKITTYWEST/black-hole-engine.git
