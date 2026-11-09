# dashi/microduck-sprint-daily-20261108

## Resumen

`dashi/microduck-sprint-daily-20261108` es una política de control motriz para el robot cuadrúpedo educativo microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones. El autor, `dashi`, la publica como reentrada diaria de su política previa `microduck-sprint-remix-r844` (con recompensa 0.844), y la deriva mediante fine-tuning de `jrubiosainz/microduck-game-sprinter-remix3`.

El modelo se enmarca en el ecosistema `microduck` (librería y pipeline `robotics`), y está diseñado para ocupar el slot de marcha (`walk`) del robot. Es una política "perpetua": una vez cargada, el robot ejecuta el patrón de marcha de forma continua hasta que se le indique lo contrario. La normalización de observaciones está integrada dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un flujo completo de entrenamiento RL (repo `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`) y despliegue en hardware real mediante `robotctl`. No hay información pública sobre arquitectura de red, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX; sin detalle de capas en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (finetune) |
| Libreria | `microduck` |
| Pipeline | `robotics` |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, tipo de capas, función de activación ni tamaño del vector latente). Lo que sí se documenta es el contrato de entrada/salida: 61 valores de observación como entrada y 14 valores de acción como salida, con un bucle de control a 50 Hz. La normalización de observaciones está embebida en el grafo ONNX, lo que simplifica la integración en el daemon del robot.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Se trata de un fine-tuning sobre `jrubiosainz/microduck-game-sprinter-remix3`, y la model card lo describe como "reentrada diaria" de una política anterior con recompensa 0.844, lo que sugiere un ciclo iterativo de entrenamiento y publicación. No se especifican el número de pasos de entrenamiento, la composición del dataset de rollouts, ni si se emplearon técnicas como domain randomization, reward shaping específico o currículum de tareas. Tampoco se documenta el algoritmo RL concreto (PPO, SAC, etc.), aunque el contexto de `microduck_rl` y la terminología de "recompensa" apuntan a un esquema de optimización de política con refuerzo.

## Capacidades

- Locomoción cuadrúpeda continua a 50 Hz mediante el slot `walk`, con comportamiento "perpetuo" hasta recibir una orden de parada o cambio.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones (la model card no desglosa qué sensores componen esas 61 entradas).
- Generación de 14 comandos de actuación por paso de control.
- Integración directa con el daemon del robot mediante `robotctl policy load walk <repo>`.
- Normalización de observaciones integrada en el ONNX, lo que permite alimentar observaciones en crudo sin preprocesado externo.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de "pensamiento": no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni percepción multimodal.

## Casos de uso

- **Marcha autónoma en el microduck**: cargar la política en el slot `walk` con `robotctl policy load walk dashi/microduck-sprint-daily-20261108` para que el robot mantenga una marcha continua durante sesiones de demostración o laboratorio. Es adecuada porque está entrenada específicamente para ese slot y ese contrato de observación/acción.
- **Docencia e investigación en RL robótico**: usar la política como referencia reproducible de un pipeline completo (entrenamiento en `microduck_rl`, exportación a ONNX, despliegue en hardware) para comparar variantes de recompensa o de algoritmo. El commit y la rama documentados permiten rastrear el origen del entrenamiento.
- **Punto de partida para fine-tuning**: al ser un finetune de `jrubiosainz/microduck-game-sprinter-remix3`, sirve como base para experimentos de ajuste fino con nuevas recompensas o condiciones de entorno, reutilizando el contrato de 61 observaciones y 14 acciones.
- **Pruebas de integración del daemon microduck**: validar el esquema 2 del manifiesto de políticas (`docs/policy-manifest.md`) y el flujo de carga de políticas en el daemon, usando esta política como caso de prueba real con normalizador embebido.
- **Benchmarking interno de gait**: comparar la marcha resultante (estabilidad, velocidad, consumo) frente a otras políticas publicadas para el mismo slot, dado que la model card indica una recompensa de referencia de 0.844 en la política predecesora.
- **Demostraciones educativas de robótica**: emplear el microduck con esta política en talleres o ferias para ilustrar locomoción aprendida en un robot de bajo coste, sin necesidad de ajustar el modelo en el sitio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es la recompensa de la política predecesora (`microduck-sprint-remix-r844`, 0.844), que no es directamente comparable con métricas estándar de ML ni se acompaña de desglose por episodios, varianza o condiciones de evaluación.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser una política de control de dimensión 61→14 exportada a ONNX, la huella es presumiblemente muy pequeña (órdenes de kilobytes a pocos megabytes), pero el tamaño exacto no se documenta y el repo figura como 0.0 GB.
- **GPU recomendadas**: no aplica en el sentido habitual; el despliegue típico es en la CPU del propio robot o en un equipo anfitrión del daemon. No se especifican requisitos de GPU.
- **Compatibilidad con GPU de consumo**: no disponible; por la naturaleza del modelo, no debería requerir GPU dedicada.
- **Opciones de despliegue**: `robotctl` (daemon microduck) cargando `policy.onnx`; el runtime ONNX subyacente no se detalla. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el bucle de control opera a 50 Hz (20 ms por paso). No se publican latencias medidas ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones observación/acción | Slot | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261108` | Política RL (ONNX) | 61 / 14 | `walk` | 50 Hz | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL (ONNX) | no disponible | `walk` (presumible) | no disponible | no disponible | Hugging Face (referenciada) |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (ONNX) | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo entre estas políticas más allá de la recompensa 0.844 de la predecesora. No se conocen alternativas fuera del ecosistema microduck con las que establecer una comparación significativa.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Ámbito muy restringido**: es una política específica para el robot microduck y el slot `walk`; no es reutilizable fuera de ese hardware ni de ese contrato de observación/acción.
- **Sin documentación de arquitectura ni de datos**: no se puede auditar la robustez del modelo ante perturbaciones, cambios de terreno o fallos de sensores.
- **Riesgo de comportamiento no deseado**: al ser una política "perpetua", el robot seguirá ejecutando la marcha hasta recibir una orden explícita; en entornos no controlados esto puede provocar colisiones o caídas. No se documentan mecanismos de parada de seguridad más allá del propio daemon.
- **Sesgos y alucinación**: no aplican en el sentido de modelos generativos, pero sí existe el riesgo de generalización deficiente (sim-to-real gap) si el entorno de despliegue difiere del de entrenamiento.
- **Sin métricas de evaluación publicadas**: la única cifra es la recompensa 0.844 de la política predecesora, sin desglose ni protocolo de evaluación, lo que impide verificar la mejora real de esta reentrada diaria.
- **Fecha de creación futura en los metadatos** (2026-11-08): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- **Resultados de búsqueda web no pertinentes**: las búsquedas sobre "dashi" devuelven recetas de cocina japonesa, sin relación con el modelo; no aportan información técnica adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261108
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa.
