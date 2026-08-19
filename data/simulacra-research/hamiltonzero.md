# simulacra-research/HamiltonZero

## Resumen

HamiltonZero es un modelo de investigación desarrollado por Simulacra Research para el cálculo de funciones de onda cuánticas compiladas de Hamiltonianos de espín. A diferencia de los modelos de lenguaje, este sistema resuelve problemas de física de muchos cuerpos mediante una red neuronal que aprende a representar el estado fundamental de sistemas de espines interactuantes. El modelo expone tres flujos de trabajo: entrenamiento multisistema con router aprendido, ajuste fino de un solo sistema compilado y evaluación compilada con opción de concurso de router o ejecución de gran N.

La relevancia actual de HamiltonZero radica en su enfoque de compilación: en lugar de evaluar la función de onda directamente sobre el sistema físico, el modelo permuta los sitios del Hamiltoniano según un router aprendido y luego compila una función de onda adaptada a esa permutación, lo que reduce la complejidad de cálculo y mejora la escalabilidad. El checkpoint fundacional v1 está disponible en este repositorio de Hugging Face con licencia Apache 2.0, y el paquete Python requiere JAX 0.11.0 con un fork específico para soporte de JVP de cero simbólico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para funciones de onda cuánticas (no se especifica tipo exacto; usa un router aprendido y un árbol de compilación binario) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de física, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en formato Equinox .eqx) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | .eqx (Equinox, basado en JAX) |

## Arquitectura y entrenamiento

La arquitectura de HamiltonZero no se detalla en la información proporcionada, pero se sabe que combina un router aprendido con una función de onda compilada. El router selecciona una permutación de los sitios del Hamiltoniano, y la función de onda se compila sobre un árbol binario de fusión. El entrenamiento multisistema utiliza ocho aceleradores visibles y requiere que el tamaño de lote de MCMC sea divisible por ocho. El ajuste fino de un solo sistema usa todos los aceleradores visibles y exige que su tamaño de lote MCMC sea divisible por su número. La evaluación selecciona un subconjunto de dispositivos compatible con su lote de walkers.

El checkpoint fundacional v1 contiene la función de onda completa y su router aprendido. El paquete Python depende de un fork de JAX (`TakeOver/jax` commit `79f82535b15a444516d4a5e2beb71d283665b2ff`) que añade soporte para JVP de cero simbólico, necesario para el kernel de atención Pallas ajustado. No se especifican datos de entrenamiento, número de tokens ni técnicas de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Cálculo de energía local de Hamiltonianos de espín genéricos (interacciones de intercambio J y campos magnéticos h).
- Estimación del espín local complejo en el orden de sitios enrutado.
- Compilación de funciones de onda para sistemas individuales mediante permutación de sitios.
- Router aprendido que selecciona el orden de compilación óptimo para cada Hamiltoniano.
- Soporte para Hamiltonianos definidos mediante NetworkX (grafos simples no dirigidos) o arrays densos.
- Ejecución de inferencia compilada con muestreo MCMC de réplicas intercambiadas (replica-exchange).
- Visualización del orden de compilación como celdas de un árbol de fusión binario (ejemplo J1-J2 4x4).

## Casos de uso

- Estudio de diagramas de fase de modelos de espín en redes finitas: HamiltonZero permite calcular la energía del estado fundamental de sistemas como cadenas de espín o redes J1-J2, facilitando la identificación de transiciones de fase.
- Validación de métodos variacionales cuánticos: los investigadores pueden comparar las energías obtenidas con HamiltonZero contra resultados de DMRG o Monte Carlo cuántico para verificar la precisión de sus propios algoritmos.
- Optimización de Hamiltonianos para computación cuántica: al evaluar rápidamente la energía de Hamiltonianos candidatos, se pueden diseñar mejores encodings para problemas de optimización en hardware cuántico.
- Enseñanza de física de muchos cuerpos: el ejemplo `networkx_system.py` permite a estudiantes construir Hamiltonianos sencillos (como una cadena de 8 espines) y obtener la energía fundamental sin implementar algoritmos complejos.
- Exploración de propiedades de entrelazamiento: la observable de pureza de subsistema (mencionada en la documentación) permite estudiar la estructura de entrelazamiento de estados fundamentales.
- Benchmarking de kernels de atención en JAX: el fork de JAX con soporte de JVP simbólico y el kernel Pallas ajustado pueden servir como caso de prueba para optimizaciones de bajo nivel en aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye comparaciones numéricas con otros métodos (DMRG, QMC, etc.) ni métricas de rendimiento como tiempo de ejecución o precisión en sistemas de referencia.

## Requisitos de hardware

- Se requiere Python 3.12 y controladores de acelerador compatibles con JAX (GPU o TPU).
- El entrenamiento multisistema necesita ocho aceleradores visibles; el ajuste fino usa todos los aceleradores visibles.
- La evaluación selecciona un subconjunto de dispositivos compatible con el lote de walkers.
- No se especifican requisitos de VRAM ni GPU concretas. Dado el tamaño del checkpoint (2.2 GB), es plausible que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación oficial.
- Opciones de despliegue: el paquete se instala con `pip install .` y se usa directamente desde Python; no se mencionan integraciones con vLLM, Ollama o TGI (no aplicable por ser un modelo de física).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el repositorio. En el ámbito de funciones de onda neuronales, existen alternativas como los modelos de estados de producto de matrices neuronales (NPS) o las redes neuronales autoregresivas para espines, pero no se proporcionan datos para una comparación rigurosa. Se marca como "no disponible".

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; la documentación es técnica y asume familiaridad con MCMC, Hamiltonianos de espín y JAX.
- Dependencia de un fork específico de JAX: el paquete no funciona con JAX estándar 0.11.0; requiere el fork `TakeOver/jax` con soporte de JVP simbólico, lo que puede complicar la instalación en entornos con versiones fijas.
- Requisitos de divisibilidad: el entrenamiento y la evaluación imponen restricciones estrictas sobre los tamaños de lote (divisibles por el número de aceleradores), lo que puede limitar la flexibilidad en hardware heterogéneo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la precisión o velocidad frente a otros métodos, por lo que su utilidad práctica debe validarse caso a caso.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación, el soporte y mantenimiento no están garantizados.
- La documentación menciona una observable de pureza de subsistema, pero no se detalla su implementación completa; los usuarios deben revisar el código fuente para entender las limitaciones de esa métrica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/simulacra-research/HamiltonZero
- Fork de JAX requerido: https://github.com/TakeOver/jax/commit/79f82535b15a444516d4a5e2beb71d283665b2ff
- Ejemplos incluidos en el repositorio: `examples/networkx_system.py`, `examples/compiled_inference.py`, `examples/j1j2_4x4_route.ipynb` (accesibles tras clonar el repo).
