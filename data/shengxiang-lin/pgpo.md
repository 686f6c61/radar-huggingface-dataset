# Shengxiang-Lin/PGPO

## Resumen

PGPO (Pseudocode-style Planning Guided Preference Optimization) es un método de optimización de preferencias diseñado para mejorar las capacidades de razonamiento de agentes basados en modelos de lenguaje de gran tamaño (LLM). Lo desarrolla Shengxiang Lin, estudiante de doctorado en la Universidad de Zhejiang, junto con su equipo, y se presentó en el congreso ACL 2025 como *Findings*.

El problema que aborda es la ineficiencia de los planes en lenguaje natural que generan los agentes LLM para guiar su razonamiento: son verbosos, específicos de cada tarea y limitan la generalización entre tareas similares. PGPO propone planes en estilo pseudocódigo (P-code), más compactos y reutilizables, y aplica una optimización de preferencias sobre estos planes para potenciar el razonamiento del agente.

La relevancia actual radica en que los agentes LLM requieren métodos de entrenamiento que mejoren su capacidad de planificación y ejecución en entornos interactivos complejos. PGPO consigue resultados de vanguardia en benchmarks representativos de agentes, especialmente en tareas complejas, sin necesidad de rediseñar la arquitectura subyacente. No se trata de un modelo base, sino de un método de entrenamiento aplicable sobre modelos LLM existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (método de optimización sobre LLM base) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

PGPO es un método de optimización de preferencias, no un modelo con arquitectura propia. Se aplica sobre modelos LLM existentes que actúan como agentes. El entrenamiento se basa en generar planes en estilo pseudocódigo (P-code) y optimizar las preferencias del modelo para que produzca estos planes en lugar de planes en lenguaje natural. La innovación principal reside en la representación intermedia del plan: el pseudocódigo es más estructurado, compacto y transferible entre tareas, lo que permite una mejor generalización.

No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o si se emplearon técnicas adicionales como RLHF o DPO más allá de la optimización de preferencias descrita en el paper. La información disponible no especifica sobre qué modelos base se ha aplicado PGPO ni las condiciones de entrenamiento.

## Capacidades

- Razonamiento de agentes en tareas interactivas complejas, mejorando la toma de decisiones paso a paso.
- Generación de planes en estilo pseudocódigo, que son más compactos y generalizables que los planes en lenguaje natural.
- Mejora del rendimiento en benchmarks de agentes, con especial eficacia en tareas de mayor complejidad.
- No se han documentado capacidades específicas de tool calling, visión, audio o multilingüismo en la información disponible.

## Casos de uso

- **Automatización de tareas multi-paso en entornos virtuales**: un agente entrenado con PGPO puede descomponer un objetivo complejo (por ejemplo, gestionar un calendario o interactuar con una API) en pasos lógicos representados como pseudocódigo, lo que facilita la ejecución y depuración del flujo.
- **Agentes de navegación web**: la planificación en pseudocódigo permite al agente abstraer acciones recurrentes (como rellenar formularios o extraer datos) y reutilizarlas en distintos sitios, mejorando la generalización entre tareas similares.
- **Razonamiento multi-hop en bases de conocimiento**: el agente puede generar un plan en pseudocódigo que combine consultas y razonamiento lógico, reduciendo la verbosidad y mejorando la precisión en tareas de pregunta-respuesta complejas.
- **Optimización de pipelines de automatización**: en sistemas RPA (automatización robótica de procesos), el método puede adaptar planes de acción a partir de ejemplos previos, reduciendo el coste de mantenimiento de flujos de trabajo.
- **Entrenamiento de agentes para juegos y simulaciones**: la capacidad de generar planes estructurados permite al agente aprender estrategias reutilizables en entornos con reglas similares, acelerando la convergencia.
- **Integración en frameworks de agentes**: PGPO puede aplicarse como una capa de optimización sobre agentes existentes (por ejemplo, basados en ReAct o Toolformer) para mejorar su capacidad de planificación sin cambiar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper menciona que PGPO alcanza un rendimiento de nivel de vanguardia (state-of-the-art) en benchmarks representativos de agentes, especialmente en tareas complejas, pero no se incluyen cifras concretas en los datos facilitados. No se pueden comparar con modelos similares sin esos números.

## Requisitos de hardware

- No disponible. Al ser un método de optimización, los requisitos dependen del modelo base sobre el que se aplique. No se indica qué modelo se utilizó en los experimentos ni las especificaciones de hardware empleadas.
- No se dispone de información sobre VRAM, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ni latencia esperada.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros métodos de optimización de preferencia para agentes (como DPO, KTO u otras variantes) en la información facilitada.

## Limitaciones y advertencias

- Es un método de entrenamiento, no un modelo desplegable directamente; requiere un LLM base y un pipeline de entrenamiento adicional.
- La información disponible no detalla los sesgos o riesgos de alucinación inherentes al método, ya que estos dependen del modelo base y los datos de entrenamiento.
- No se documenta la compatibilidad con idiomas distintos del inglés, ni la robustez en contextos multilingües.
- La licencia MIT permite uso comercial y modificación, pero la implementación de referencia (repo GitHub) debe revisarse para confirmar dependencias o restricciones adicionales.
- Para producción, es necesario validar el comportamiento del agente en el dominio específico, ya que la generación de pseudocódigo puede requerir adaptación a los formatos de las APIs o entornos utilizados.

## Enlaces

- HuggingFace: https://huggingface.co/Shengxiang-Lin/PGPO
- Paper (arXiv): https://arxiv.org/abs/2506.01475
- PDF del paper: https://arxiv.org/pdf/2506.01475
- Repositorio oficial (GitHub): https://github.com/zouyingcao/PGPO
- Página personal del autor: https://shengxiang-lin.github.io/
