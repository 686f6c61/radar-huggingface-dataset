# devjuneja789/Terminal-SLM

## Resumen

Terminal-SLM es un experimento de ajuste fino supervisado (SFT) orientado a tareas de terminal ejecutables, presentado en la categoría "Track 3 — Agentic Fine-tuning". El autor, devjuneja789, parte del modelo base CohereLabs Tiny Aya Global y lo adapta mediante AgentTune para el bucle modelo/acción y el entrenamiento, usando AuditKIT para auditar los episodios registrados. El objetivo declarado es comprobar si demostraciones supervisadas revisadas mejoran la fiabilidad de un modelo pequeno en tareas de terminal con validadores ejecutables.

El resultado principal del proyecto es negativo y asi se documenta: el modelo base sin tocar supero 1 de 10 contratos de tarea en el conjunto held-out, mientras que el adaptador seleccionado supero 2 de 10. Ambos completaron 0 de 5 tareas de reparacion o actualizacion de codigo, y la revision de trazas detecto que el paso adicional del adaptador contenia una explicacion inexacta. El autor no reclama una mejora fiable de extremo a extremo.

La relevancia del artefacto es metodologica mas que de rendimiento: separa el aprendizaje de acciones condicionadas a un contexto revisado de la completion autonoma de tareas, y muestra por que la precision en la eleccion de herramienta y la perdida de entrenamiento no bastan como indicadores de exito. El repositorio de Hugging Face no incluye model card con especificaciones tecnicas ni pesos descritos, y el propio README senala que el contenido de las colecciones debe completarse cuando los repositorios sean publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: CohereLabs Tiny Aya Global) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el despliegue cuantizado local quedo fuera del alcance del proyecto) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base Tiny Aya se declara CC-BY-NC-4.0 y sujeto a la politica de uso aceptable de Cohere Labs |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base ni del adaptador. El proyecto se describe como un ajuste fino supervisado sobre CohereLabs Tiny Aya Global, con AgentTune gestionando el bucle modelo/accion y el entrenamiento, y con cinco herramientas de alcance de espacio de trabajo que operan sobre instantaneas de repositorio aisladas. La seleccion de candidatos se hizo solo con tareas de soporte, y el split de datos se fijo antes de preparar los datos de entrenamiento.

El conjunto de evaluacion consta de 50 tareas deterministas: 40 de soporte y 10 held-out. Solo se admitieron demostraciones de soporte revisadas para el SFT; las tareas held-out, sus resultados, parches y recompensas quedaron excluidos del entrenamiento. No se mencionan tecnicas de RLHF, DPO ni GRPO; de hecho, DPO y GRPO se declaran explicitamente fuera del alcance de la entrega. Tampoco se detalla el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Ejecucion de acciones sobre terminal mediante cinco herramientas de alcance de espacio de trabajo sobre repositorios aislados.
- Aprendizaje de acciones condicionadas a contextos revisados: el adaptador mostro capacidad de imitar acciones cuando se le proporciona un contexto de soporte revisado.
- Edicion de ficheros completos: en un experimento posterior de inicio de tarea, dos ediciones completas coincidieron con referencias revisadas y pasaron las pruebas nombradas mas una prueba de regresion.
- Razonamiento multi-paso dentro de un bucle agente (modelo/accion) gestionado por AgentTune.
- No se documentan capacidades de vision, audio, tool calling generico ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre ajuste fino de agentes: el artefacto sirve como caso de estudio reproducible de SFT con validadores ejecutables, util para disenar experimentos que distingan aprendizaje de acciones de completion de tareas.
- Auditoria de trayectorias de agentes: el uso de AuditKIT sobre episodios registrados permite verificar resultados contra contratos de tarea, un patron aplicable a pipelines internos de evaluacion de agentes.
- Evaluacion de fiabilidad en tareas de terminal: el banco de 50 tareas deterministas con split fijo puede reutilizarse como plantilla para medir regresiones en modelos pequenos.
- Analisis de indicadores de exito: el proyecto demuestra por que la precision de eleccion de herramienta y la perdida de entrenamiento no deben usarse como unicos criterios de aceptacion en produccion.
- Reproduccion de resultados negativos: los enlaces a codigo, trazas y notas de reproduccion permiten replicar el montaje experimental en entornos de investigacion.
- Formacion y docencia: el caso ilustra de forma concreta los limites de las demostraciones sinteticas y de los validadores estrechos en la evaluacion de agentes.
- No se recomienda su uso en produccion para automatizacion real de tareas de terminal, dado que el propio autor no reclama una mejora fiable.

## Benchmarks y rendimiento

| Evaluacion | Modelo base | Adaptador seleccionado |
|---|---|---|
| Tareas held-out superadas (contratos) | 1/10 | 2/10 |
| Tareas de reparacion o actualizacion de codigo | 0/5 | 0/5 |
| Experimento posterior de inicio de tarea (4 tareas de soporte conocidas) | 0/4 | 2/4 |

El experimento posterior no se evaluo en tareas held-out y no constituye evidencia de generalizacion. La revision de trazas detecto que el paso adicional del adaptador contenia una explicacion inexacta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el despliegue cuantizado local se declara fuera del alcance de la entrega.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El autor no reclama una mejora fiable de extremo a extremo; el resultado principal es negativo.
- El banco de evaluacion es pequeno (50 tareas, 10 held-out) y comparte un unico repositorio sintetico, lo que limita las conclusiones.
- Los validadores son estrechos y pueden no capturar fallos reales de las trayectorias.
- El adaptador produjo al menos una explicacion inexacta en un paso que si supero el contrato de tarea.
- La precision en la eleccion de herramienta y la perdida de entrenamiento no son indicadores suficientes de exito.
- El experimento posterior de inicio de tarea no se evaluo en held-out y no demuestra generalizacion.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma.
- Restricciones de licencia: el modelo base Tiny Aya es CC-BY-NC-4.0, lo que excluye el uso comercial, y exige cumplir la politica de uso aceptable de Cohere Labs. La licencia del adaptador no se especifica.
- El repositorio no incluye model card con especificaciones tecnicas, y el README indica que las colecciones deben completarse cuando los repositorios sean publicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devjuneja789/Terminal-SLM
- Codigo del proyecto: https://github.com/devjuneja789/terminal-agent
- Modelos y adaptadores: https://huggingface.co/collections/devjuneja789/terminal-slm-models-and-adapters
- Datasets y trazas de evaluacion: https://huggingface.co/collections/devjuneja789/terminal-slm-data-and-evaluation
- Resultados y notas de reproduccion: https://github.com/devjuneja789/terminal-agent/tree/main/submission
