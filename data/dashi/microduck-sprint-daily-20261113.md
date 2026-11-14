# dashi/microduck-sprint-daily-20261113

## Resumen

`dashi/microduck-sprint-daily-20261113` es una política de control motriz para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de locomocion a 50 Hz a partir de observaciones de 61 dimensiones, con 14 acciones de salida. Se publica como reentrada diaria del checkpoint `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuacion de 0.844, y ocupa el slot `walk` del manifiesto de políticas del demonio `robotctl`.

El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y se distribuye con la libreria `microduck`, pensada para cargarse directamente en el robot mediante el comando `robotctl policy load`. La normalizacion de observaciones esta integrada en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado adicional.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion en robotica de refuerzo, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. No debe confundirse con un modelo fundacional ni con un LLM; sus capacidades son exclusivamente locomotoras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva de control a 50 Hz; observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal. Lo que sí se documenta es el contrato de interfaz: observacion de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, y una política de tipo *perpetual* (se ejecuta de forma continua hasta recibir una orden de parada). El modelo se enmarca en el pipeline de aprendizaje por refuerzo `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

La innovación técnica destacable es la integración de la normalización de observaciones dentro del propio grafo ONNX, lo que simplifica el despliegue en el robot: el demonio `robotctl` carga el fichero y alimenta observaciones sin transformaciones externas. El modelo es un fine-tune sobre `jrubiosainz/microduck-game-sprinter-remix3`, y a su vez es una reentrada diaria del checkpoint `dashi/microduck-sprint-remix-r844` (puntuación 0.844). No se detallan hiperparámetros de entrenamiento, recompensas ni currículo.

## Capacidades

- Locomocion cuadrupeda: genera una marcha (*gait*) para el slot `walk` del microduck, con salida de 14 acciones a 50 Hz.
- Control reactivo continuo: política *perpetual* que se ejecuta hasta que se le indique lo contrario.
- Integracion con el demonio `robotctl`: carga directa mediante `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261113`.
- Normalizacion de observaciones embebida: acepta observaciones en crudo (61-D) sin preprocesado.
- Compatibilidad con el manifiesto de políticas microduck (esquema 2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Locomocion de referencia en el robot microduck: cargar la política en el slot `walk` para que el robot camine de forma continua en pruebas de laboratorio. Es adecuada porque el formato ONNX y la normalización embebida eliminan pasos de integración.
- Benchmark de políticas de RL en robotica de bajo coste: usar la puntuación 0.844 del checkpoint origen como referencia para comparar nuevas políticas entrenadas en la rama `roll-backward` del repositorio `microduck_rl`.
- Reentrenamiento y fine-tuning: partir de este modelo como base para experimentos de ajuste fino sobre `jrubiosainz/microduck-game-sprinter-remix3`, ya que la model card declara la relación `finetune`.
- Docencia y divulgacion en robotica: desplegar una marcha funcional en un cuadrúpedo de bajo coste para demostraciones de aprendizaje por refuerzo en el aula.
- Pruebas de integracion del demonio `robotctl`: validar el esquema 2 del manifiesto de políticas y el flujo de carga `policy load` con un artefacto real.
- Reproducibilidad de experimentos: al estar vinculado a un commit concreto (`83599404a`) y a una rama (`roll-backward`), permite reconstruir el contexto de entrenamiento para auditoría o replicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la puntuación de 0.844 del checkpoint origen `dashi/microduck-sprint-remix-r844`, que la model card cita como referencia de reentrada, pero no se especifica la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto ONNX muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Al ser una política de control a 50 Hz con observación de 61 dimensiones, es plausible que se ejecute en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es `robotctl policy load walk dashi/microduck-sprint-daily-20261113` en el robot. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles. La frecuencia de control nominal es de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261113` | Política RL (ONNX) para microduck | no disponible | no aplica (61-D obs.) | 0.844 en checkpoint origen (métrica no especificada) | no disponible | Hugging Face, 0 descargas |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL para microduck (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL para microduck (checkpoint origen) | no disponible | no aplica | 0.844 (métrica no especificada) | no disponible | Hugging Face |

No se dispone de información sobre otras alternativas comparables en la misma categoría (políticas de locomocion para microduck) más allá de la cadena de fine-tuning documentada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documentan sesgos para esta política de control.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero sí existe riesgo de comportamientos no deseados en el robot (caídas, marcha inestable) fuera de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto textual; la política está acotada a observaciones de 61 dimensiones y 14 acciones del microduck.
- Restricciones de licencia: la licencia no está declarada, lo que impide confirmar si el uso comercial está permitido. Es un caveat importante para producción.
- Ausencia de métricas detalladas: no se especifica la métrica de la puntuación 0.844 ni el protocolo de evaluación, lo que limita la comparabilidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente (creado el 2026-11-13) sin validación comunitaria.
- Dependencia del demonio `robotctl` y del esquema 2 del manifiesto de políticas: cambios en el demonio pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261113
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)
