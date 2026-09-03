# Snapkitty/snapkitty-algo-art

## Resumen

SnapKitty Parallel Swarm Computation es un proyecto de visualización interactiva que ejecuta cinco algoritmos computacionales en paralelo y los representa gráficamente en tiempo real. No se trata de un modelo de inteligencia artificial ni de un sistema de aprendizaje automático, sino de una pieza de investigación y arte algorítmico que integra máquinas virtuales, demostraciones formales y simulaciones físicas. El autor, Jessica Westerhoff, lo publica bajo el nombre de usuario Snapkitty en HuggingFace, con licencia Apache-2.0 para el código del espacio y licencias múltiples (BSL-1.1, AGPL-3.0, MPL-2.0) para el núcleo de investigación.

El proyecto destaca por su enfoque en la transparencia computacional: cada elemento visual se deriva de un valor computacional real, y los benchmarks se marcan explícitamente como "no disponibles" cuando no existen datos. Incluye una máquina SUBLEQ implementada en Rust/WASM, un formato de "Resonance Words" basado en campos finitos, un grafo acíclico dirigido para gobernanza (ICP-DAG), una simulación clásica de anyones de Fibonacci y demostraciones formales en Lean 4 con cero "sorry". La aplicación se despliega como un espacio Gradio con cuatro vistas: enjambres paralelos en 3D, arte algorítmico, tablas de investigación y documentación del mapeo visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de redes neuronales; es un sistema de visualización de algoritmos paralelos) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (interfaz en ingles, segun la model card) |
| Licencia | Apache-2.0 (codigo del espacio); BSL-1.1 / AGPL-3.0 / MPL-2.0 (nucleo de investigacion) |
| Formato de pesos | No disponible (no hay pesos; el proyecto incluye codigo fuente en Rust, Lean, MUMPS, ASP y archivos de visualizacion) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni un proceso de entrenamiento. El proyecto se compone de cinco "enjambres" computacionales independientes que se ejecutan en paralelo y se visualizan conjuntamente:

- **Resonance Words**: utiliza elementos de un campo finito GF(2⁶⁴−2³²+1) y enrutamiento por retícula.
- **SUBLEQ Attention**: una máquina de memoria entera de 256 celdas con operaciones de resta y salto condicional (SUBLEQ), que simula un mecanismo de atención.
- **ICP-DAG**: un grafo acíclico dirigido que modela gobernanza mediante la secuencia EVIDENCIA→RECLAMACIÓN→PRUEBA→DECISIÓN→EJECUCIÓN.
- **Fibonacci Anyons**: simulación clásica de la fusión de anyones τ⊗τ=1⊕τ, sin hardware cuántico.
- **Jordan Algebra**: demostración formal en Lean 4 de una propiedad de punto fijo, con cero "sorry".

El estado de investigación indica que la máquina SUBLEQ, el formato Resonance Word, el ICP-DAG, el teorema de entropía y la prueba de Jordan están implementados, mientras que los axiomas de pentágono/hexágono y los benchmarks de SUBLEQ frente a softmax o de tasa de alucinación están pendientes o no se han ejecutado.

## Capacidades

- Visualización en 3D de cinco procesos computacionales ejecutándose en paralelo sobre una línea temporal compartida, con inspección de estados individuales.
- Generación de arte algorítmico a partir de la ejecución real: mandalas radiales, constelaciones de bits y análisis de convergencia.
- Simulación clásica de anyones de Fibonacci, sin pretensión de ventaja cuántica.
- Demostraciones formales verificadas en Lean 4 (teorema de entropía y prueba de Jordan) con cero "sorry".
- Implementación de una máquina SUBLEQ en Rust/WASM, ejecutable en navegador.
- Documentación explícita del mapeo entre valores computacionales y propiedades visuales (archivo `SWARM_VISUALIZATION.md`).
- Interfaz interactiva mediante Gradio, con cuatro vistas diferenciadas.

## Casos de uso

- **Educación en computación teórica**: permite a estudiantes visualizar conceptos como máquinas SUBLEQ, campos finitos, álgebra de Jordan o anyones de Fibonacci, al observar su ejecución paso a paso en un entorno gráfico.
- **Investigación en verificación formal**: las demostraciones en Lean 4 sirven como ejemplo de pruebas matemáticas asistidas por ordenador, y el proyecto documenta el estado de cada componente (implementado, pendiente, vacío).
- **Arte generativo algorítmico**: los tres estilos artísticos (mandala radial, constelación de bits, análisis de convergencia) se generan a partir de datos reales de ejecución, lo que permite crear obras visuales basadas en procesos computacionales.
- **Prototipado de sistemas de gobernanza**: el ICP-DAG modela un flujo de decisión (evidencia→reclamación→prueba→decisión→ejecución) que podría adaptarse a sistemas de votación o gestión de propuestas en organizaciones descentralizadas.
- **Estudio de mecanismos de atención alternativos**: la simulación SUBLEQ Attention ofrece un contraste con la atención basada en softmax, aunque el benchmark comparativo aún no se ha ejecutado.
- **Divulgación científica**: la visualización comunica la arquitectura de sistemas complejos de forma accesible, sin afirmar rendimientos no verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los benchmarks de "SUBLEQ vs softmax" y de "tasa de alucinación" no se han ejecutado, y que los datos de rendimiento se marcan como "unavailable" cuando no existen. No se proporcionan métricas de latencia, throughput ni precisión.

## Requisitos de hardware

- No requiere GPU ni hardware especializado para la inferencia, ya que no es un modelo de aprendizaje automático.
- La aplicación se ejecuta como un espacio Gradio, por lo que puede desplegarse en un servidor estándar o en la propia infraestructura de HuggingFace Spaces.
- La máquina SUBLEQ está compilada a WASM, por lo que se ejecuta en el navegador del cliente sin necesidad de recursos de servidor adicionales.
- El consumo de memoria es bajo, limitado a los estados de los cinco algoritmos y a la representación visual (probablemente menos de 1 GB en un servidor típico).
- No se especifican requisitos de CPU, pero al ser una visualización interactiva, se recomienda un procesador moderno con soporte WebGL para la vista 3D.

## Comparativa con modelos similares

No disponible. Este proyecto no pertenece a la categoría de modelos de lenguaje o de IA generativa, por lo que no existen alternativas comparables en el mismo espacio. Podría compararse con otras visualizaciones de algoritmos o con proyectos de arte generativo, pero no se dispone de datos objetivos para establecer una comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni procesa lenguaje natural. Cualquier expectativa en ese sentido es incorrecta.
- La simulación de anyones de Fibonacci es clásica; no hay ventaja cuántica ni hardware cuántico involucrado.
- Los benchmarks de rendimiento (SUBLEQ vs softmax, tasa de alucinación) no se han ejecutado, por lo que no hay evidencia de superioridad o utilidad práctica frente a otros mecanismos de atención.
- La licencia del núcleo de investigación es múltiple (BSL-1.1, AGPL-3.0, MPL-2.0), lo que puede imponer restricciones adicionales al uso comercial o a la modificación del código fuente.
- Se menciona una patente pendiente ("Patent Pending — Bel Esprit D'Accord Irrevocable Trust"), lo que podría afectar a la libertad de uso en ciertos contextos.
- La documentación indica que los axiomas de pentágono/hexágono están vacíos en Lean, lo que sugiere que la verificación formal no está completa para todos los componentes.
- La interfaz está en inglés; no se especifica soporte multilingüe.

## Enlaces

- [HuggingFace: Snapkitty/snapkitty-algo-art](https://huggingface.co/Snapkitty/snapkitty-algo-art)
- No se han encontrado otros enlaces relevantes en la búsqueda web (los resultados obtenidos corresponden a noticias sobre subsidios en Egipto, sin relación con el proyecto).
