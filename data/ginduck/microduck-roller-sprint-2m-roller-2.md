# GinDuck/microduck-roller-sprint-2m-roller-2

## Resumen

`microduck-roller-sprint-2m-roller-2` es una política de aprendizaje por refuerzo entrenada para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un controlador neuronal especializado que produce comandos motores a 50 Hz a partir de observaciones propioceptivas de 61 dimensiones y que emite 14 acciones articulares. El autor del checkpoint es el usuario GinDuck y el modelo se distribuye en formato ONNX dentro del ecosistema `microduck`, con un manifiesto de política que permite cargarlo directamente en un slot del daemon del robot.

La política implementa una marcha de tipo *sprint* sobre ruedas (rollers): según la model card, el autor abandonó el patrón de patinaje de su primer intento y adoptó una receta compartida por TheSauceman para maximizar velocidad, completando cada episodio en aproximadamente 1,4 segundos. Es una política perpetua, es decir, no tiene condición de terminación interna y se ejecuta de forma continua hasta que el operador la detiene o carga otra política en el slot.

El interés de esta ficha es acotado: se trata de un artefacto de investigación en robótica con refuerzo, con cero descargas y cero *likes* en el momento de la consulta, un repositorio de tamaño prácticamente nulo (0,0 GB reportados) y sin licencia declarada. Resulta relevante como ejemplo reproducible de un *pipeline* de entrenamiento con mjlab y como demostración del formato de manifiesto de políticas de microduck, más que como modelo al uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (red de política para RL); topología de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, funciones de activación ni tipo de codificador). Lo que sí se documenta es el *pipeline* de entrenamiento: se usó `mjlab-microduck 0.1.0` (commit `1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`, con la tarea `Mjlab-RollerSprint2m-MicroDuck`, checkpoint 4250 y semilla 1. El entrenamiento se lanzó con 2048 entornos paralelos, un máximo de 6000 iteraciones del agente, registro en TensorBoard y nombre de ejecución `roller-2`. La fecha de inicio declarada es 2026-11-02T13:27:08Z.

El modelo opera sobre rollers (ruedas pasivas montadas en las patas), con observaciones crudas de 61 dimensiones y 14 acciones a 50 Hz. Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar. El autor advierte explícitamente que el entrenamiento con RL sobre GPU no es reproducible bit a bit entre máquinas: la misma semilla, código y comando producen una política comparable, no idéntica. No se documenta el uso de RLHF, DPO ni datos supervisados, lo cual es coherente con un entrenamiento puramente de refuerzo en simulación.

## Capacidades

- Locomoción sobre ruedas (*rollers*) a velocidad de sprint, con episodios de aproximadamente 1,4 segundos de duración según la model card.
- Política perpetua: se ejecuta de forma continua sin condición de terminación interna hasta que se le indique lo contrario.
- Control reactivo a 50 Hz a partir de observaciones propioceptivas de 61 dimensiones.
- Emisión de 14 acciones articulares por paso de control.
- Integración con el daemon del robot mediante `robotctl policy load <slot> <repo>`, cargándose como una marcha en un slot de política.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica el despliegue en el robot.
- No soporta *tool calling*, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües; no es un modelo de propósito general.

## Casos de uso

- Demostración de locomoción rápida en microduck: cargar la política en un slot y evaluar la marcha de sprint sobre rollers en un entorno controlado, comparándola con la política anterior de patinaje del mismo autor.
- Reproducción de experimentos de RL en robótica: el *pipeline* documentado (commit, semilla, comando exacto, `uv.lock`) permite reentrenar una política equivalente y estudiar la varianza entre ejecuciones.
- Benchmark interno de recetas de entrenamiento: al estar basada en una receta de TheSauceman, sirve como punto de comparación frente a otras políticas del repositorio `microduck-challenges` en la rama `race-2`.
- Pruebas de integración del daemon `robotctl`: validar la carga de políticas, el esquema 2 de manifiesto y el manejo de slots con un artefacto ONNX real y pequeño.
- Investigación en simulación a realidad (*sim-to-real*): usar la política como caso de estudio de transferencia de una marcha entrenada con 2048 entornos paralelos a un robot físico de bajo coste.
- Docencia y talleres de robótica con refuerzo: el tamaño reducido del artefacto y la cadena de herramientas abierta (mjlab, `uv`, ONNX) facilitan su uso en entornos formativos.
- Evaluación de robustez de políticas perpetuas: al no tener condición de terminación, permite estudiar deriva, saturación de acciones y comportamiento ante perturbaciones externas durante ejecuciones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica declarada por el autor es cualitativa y de duración: cada episodio se completa en aproximadamente 1,4 segundos. No se proporcionan cifras de recompensa, velocidad media, distancia recorrida, tasa de caídas ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio reporta 0,0 GB, lo que sugiere un artefacto ONNX de tamaño muy reducido, pero no se confirma la cifra exacta.
- GPU recomendadas: no disponibles para inferencia. Para reentrenamiento, el comando documentado asume 2048 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar); el autor no especifica el hardware utilizado.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño aparentemente mínimo del artefacto, la inferencia probablemente quepa en cualquier GPU de consumo e incluso en CPU, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: el soporte nativo es el daemon de microduck mediante `robotctl policy load`; el formato ONNX permite además ejecución con ONNX Runtime, aunque no se documenta oficialmente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz (20 ms por paso), dato derivado de la especificación del robot; no se publican latencias medidas ni throughput del grafo ONNX.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `GinDuck/microduck-roller-sprint-2m-roller-2` | Política RL para microduck sobre rollers | no disponible | 61-D de observación, 14 acciones, 50 Hz | ~1,4 s por episodio (dato del autor) | no disponible | Hugging Face, 0 descargas |
| Política anterior de patinaje del mismo autor (*roller run* previo) | Política RL para microduck sobre rollers | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card, sin enlace directo |
| Políticas de la rama `race-2` de `microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | no disponible | Repositorio público de Pollen Robotics |

No se dispone de datos numéricos suficientes para establecer una comparación cuantitativa con alternativas de la misma categoría. Las políticas del repositorio `microduck-challenges` son el conjunto comparable más directo, pero sus especificaciones y resultados no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser una política entrenada en simulación, es esperable una brecha de simulación a realidad (*sim-to-real gap*), aunque el autor no la cuantifica.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la producción de acciones fuera de rango o inestables ante observaciones fuera de distribución, no evaluado en la model card.
- Limitaciones de contexto o idioma: no procesa lenguaje; su "contexto" es una observación propioceptiva de 61 dimensiones por paso, sin memoria explícita documentada más allá de la recurrencia implícita de la política.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir permisos de uso comercial, redistribución o modificación. Cualquier uso en producción requiere contactar con el autor o verificar la licencia en el repositorio.
- Reproducibilidad: el autor advierte que el reentrenamiento no es bit a bit reproducible entre máquinas; los pesos publicados son un artefacto concreto, no un resultado determinista.
- Madurez: cero descargas y cero *likes* en el momento de la consulta, sin validación externa conocida; no debe tratarse como una política lista para producción.
- Especificidad de hardware: la política está entrenada para microduck sobre rollers; no es transferible a otras morfologías sin reentrenamiento.
- Ausencia de métricas: no hay benchmarks publicados, por lo que no es posible evaluar su rendimiento frente a alternativas antes de desplegarla en un robot físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (ruta citada en la model card, sin URL directa disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
