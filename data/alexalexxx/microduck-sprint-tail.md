# Alexalexxx/microduck-sprint-tail

## Resumen

`Alexalexxx/microduck-sprint-tail` es un artefacto de política (policy) publicado en HuggingFace por el usuario Alexalexxx, pensado como entrada para la competición Microduck Arena en la modalidad `sprint-2m`, en modo simulación. No es un modelo de lenguaje: se trata de una política de control derivada del modelo base `jrubiosainz/microduck-game-sprinter-remix14`, sobre el que se ha re-resuelto un tramo concreto de la trayectoria de control.

El trabajo se limita a la semilla 1: se conservan las tablas de acciones por inicio del modelo base para las semillas 2 a 5, mientras que la cola de la semilla 1 (pasos de control 36 a 65) se ha vuelto a resolver mediante CMA-ES a partir de una instantánea del simulador, con encadenado de *basin hopping*, dentro del propio simulador de la Arena. Según el autor, la semilla 1 resulta 2,5 ms más rápida que la base antes del redondeo de 5 ms, manteniendo el mismo tiempo de tablero.

El modelo se distribuye en formato ONNX y está etiquetado con `microduck-policy` y `microduck-arena`. El robot, el simulador y la Arena son obra de Pollen Robotics. El repositorio tiene un tamaño de 0,0 GB, sin descargas ni *likes* en el momento de la consulta, y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control ONNX para el simulador Microduck Arena; no es un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la política opera sobre pasos de control, con cola re-resuelta en pasos 36-65 de la semilla 1) |
| Tipos de cuantizacion | no disponible (el artefacto se publica en ONNX; el modelo base está etiquetado como `quantized`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política. Por la naturaleza del artefacto (etiquetas `microduck-policy` y `microduck-arena`, formato ONNX, uso en simulación de la modalidad `sprint-2m`), se trata de una política de control que produce acciones por paso de control, organizada como tablas de acciones por semilla de inicio. El modelo base `jrubiosainz/microduck-game-sprinter-remix14` aporta las tablas para las semillas 2 a 5 y la parte inicial de la semilla 1.

El único proceso de optimización documentado afecta a la cola de la semilla 1 (pasos de control 36 a 65), re-resuelta con CMA-ES desde una instantánea del simulador y con encadenado de *basin hopping*, ejecutado en el simulador propio de la Arena. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, ya que no aplican a este tipo de artefacto. La mejora declarada es de 2,5 ms en la semilla 1 antes del redondeo de 5 ms, con el mismo tiempo de tablero.

## Capacidades

- Generación de acciones de control para la modalidad `sprint-2m` del simulador Microduck Arena, en modo simulación.
- Reutilización de las tablas de acciones por inicio del modelo base para las semillas 2 a 5.
- Trayectoria re-optimizada para la cola de la semilla 1 (pasos de control 36-65).
- Distribución en ONNX, apta para inferencia en el simulador de la Arena.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de *tool calling* ni *function calling*.
- No dispone de soporte de agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües.
- No dispone de modo *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Participación en la competición Microduck Arena, modalidad `sprint-2m`: el artefacto está construido explícitamente como entrada para la Arena y se evalúa en su simulador, por lo que su uso previsto es la clasificación en dicha competición.
- Reproducción de resultados en simulación: al conservar las tablas por semilla del modelo base y sustituir solo la cola de la semilla 1, permite aislar el efecto de la re-optimización sobre el tiempo de la semilla 1.
- Estudio de optimización con CMA-ES y *basin hopping*: sirve como caso práctico de re-resolución de una cola de trayectoria a partir de una instantánea del simulador, con una mejora cuantificada de 2,5 ms antes del redondeo de 5 ms.
- Comparación de políticas base frente a variantes: al mantener idénticas las semillas 2 a 5, facilita comparaciones controladas contra `jrubiosainz/microduck-game-sprinter-remix14` en la semilla 1.
- Integración en pipelines de simulación basados en ONNX: el formato de pesos permite cargar la política en runtimes ONNX dentro del simulador de Pollen Robotics.
- Docencia o experimentación sobre control en robótica simulada: útil como ejemplo mínimo de política de control empaquetada para una arena de simulación, sin dependencias de un LLM.
- Verificación de tiempos de tablero: permite comprobar que la mejora en la semilla 1 no altera el tiempo de tablero respecto a la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es que la semilla 1 es 2,5 ms más rápida que el modelo base antes del redondeo de 5 ms, con el mismo tiempo de tablero. No se proporcionan métricas de la modalidad `sprint-2m` (posiciones, tiempos totales ni comparativas con otras entradas de la Arena).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB, por lo que el artefacto es de tamaño muy reducido y probablemente quepa en cualquier GPU con unos pocos cientos de MB libres, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio (0,0 GB) es plausible que quepa en GPU de consumo, pero no se dispone de datos verificables.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) dentro del simulador de Microduck Arena de Pollen Robotics. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles, salvo la mejora relativa de 2,5 ms en la semilla 1 antes del redondeo de 5 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Alexalexxx/microduck-sprint-tail | Política de control ONNX (Arena `sprint-2m`) | no disponible | no aplica | Semilla 1: 2,5 ms más rápida que la base antes del redondeo de 5 ms; mismo tiempo de tablero | no disponible | HuggingFace, 0 descargas |
| jrubiosainz/microduck-game-sprinter-remix14 | Política de control (modelo base) | no disponible | no aplica | Referencia base; las semillas 2-5 se conservan íntegras en esta variante | no disponible | HuggingFace |
| Otras entradas de Microduck Arena | Políticas de control | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas fuera del ecosistema Microduck Arena.

## Limitaciones y advertencias

- Artefacto de dominio muy específico: solo tiene sentido en la modalidad `sprint-2m` del simulador Microduck Arena; no es un modelo de propósito general.
- Solo se ha re-optimizado la semilla 1 (pasos 36-65); las semillas 2 a 5 son idénticas al modelo base, por lo que la mejora no es generalizable a otras semillas.
- La mejora declarada (2,5 ms antes del redondeo de 5 ms) es pequeña y puede quedar absorbida por el redondeo en la evaluación oficial.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso fuera de la Arena.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no aplican a una política de control; el riesgo relevante es el sobreajuste a la instantánea del simulador usada para la re-optimización.
- Sin descargas ni *likes* en el momento de la consulta, y sin pipeline declarado: la validación por parte de la comunidad es nula.
- El repositorio figura con tamaño de 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el redondeo de la métrica oculta un tamaño muy reducido; conviene verificarlo antes de desplegar.
- Dependencia del simulador y de la infraestructura de Pollen Robotics: fuera de ese entorno, el artefacto no es reutilizable sin adaptación.

## Enlaces

- [HuggingFace: Alexalexxx/microduck-sprint-tail](https://huggingface.co/Alexalexxx/microduck-sprint-tail)
- [Modelo base: jrubiosainz/microduck-game-sprinter-remix14](https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14)
- [Pollen Robotics](https://www.pollen-robotics.com/) (robot, simulador y Arena; enlace inferido del texto de la model card, no verificado en la búsqueda)
