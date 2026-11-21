# GinDuck/microduck-tug-norris-p10b

## Resumen

Tug Norris es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. Se trata de un finetune de la red `SSH111111/microduck-tug-p10`, sobre la que GinDuck ha aplicado una tabla de rating propia (con secuencias de suraj-phanindra y un hill-climbing con semilla 3). El modelo no es un LLM ni un modelo generativo de texto: es una política perpetua que produce comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y 14 acciones.

El artefacto se distribuye como un fichero `policy.onnx` con el normalizador de observaciones embebido, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck. La política se carga en una "slot" del robot mediante `robotctl policy load` y se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha (gait) predefinida.

Es relevante en el contexto de la robótica de bajo coste y del ecosistema microduck: demuestra un flujo de trabajo de competición (Arena races y cups) donde políticas entrenadas por distintos autores se remezclan y ajustan para mejorar el rendimiento en pista. La información pública disponible es muy escasa: no hay licencia declarada, ni idiomas, ni benchmarks numéricos, y el repositorio tiene 0 GB de tamano declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para RL (no se especifica la topología interna); se distribuye como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrena con el repositorio `pollen-robotics/microduck_rl`, en la rama `talent-3`, commit `debcfcae0`. El modelo base es `SSH111111/microduck-tug-p10`, un checkpoint de RL para el mismo robot; Tug Norris es un finetune de ese checkpoint. El autor indica que el crédito por el comportamiento de marcha corresponde a SSH111111 y que su aportación es la tabla de rating construida a partir de secuencias de suraj-phanindra, optimizada mediante hill-climbing con semilla 3.

La interfaz del modelo está bien definida: observación de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el algoritmo de RL empleado (PPO u otro), ni sobre el uso de recompensas específicas o técnicas de regularización.

## Capacidades

- Locomoción continua del robot microduck: genera comandos de acción a 50 Hz a partir de observaciones de 61 dimensiones.
- Política perpetua: se ejecuta de forma indefinida hasta que se descarga o se sustituye, sin horizonte de episodio fijo.
- Comportamiento de marcha (gait) cargable en una slot de política del daemon de microduck.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración.
- Compatibilidad con el manifiesto de políticas esquema 2 del daemon (`docs/policy-manifest.md`).
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni visión: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Locomoción autónoma en el robot microduck: cargar la política en una slot con `robotctl policy load` y dejar que el robot camine de forma continua en entornos de laboratorio o domésticos.
- Competiciones de la Arena de microduck: usar la política como participante en carreras y cups, dado que el modelo se ha ajustado específicamente a partir de secuencias de competición.
- Base para nuevos finetunes: al ser un remix de `SSH111111/microduck-tug-p10`, sirve como punto de partida para que otros autores apliquen sus propias tablas de rating o recompensas.
- Evaluación comparativa de políticas: permite contrastar el rendimiento de distintas gaitas sobre el mismo robot y el mismo daemon, con una interfaz estandarizada (61-D obs, 14 acciones, 50 Hz).
- Docencia e investigación en RL aplicado a robótica: el flujo completo (entrenamiento en `microduck_rl`, exportación a ONNX, carga en robot) es reproducible y de bajo coste.
- Demostraciones y exhibiciones: al ser una política perpetua, es adecuada para demos largas sin intervención, como ferias o presentaciones.
- Integración en aplicaciones móviles de seguimiento: el autor menciona QuackPack para seguir carreras y cups desde iPhone, lo que sugiere un uso en visualización y monitorización de competiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que Tug Norris quedó subcampeón (runner-up) en la copa número 3, sin cifras de tiempo, distancia ni puntuación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política pequeña exportada a ONNX para un robot de bajo coste, es previsible que quepa en el propio computador del robot o en una GPU integrada, pero no se confirma.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible con certeza; por el perfil del modelo (política de RL para microduck) es altamente probable que sí, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck (`robotctl policy load`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (periodo de 20 ms), lo que fija un requisito de tiempo real para el bucle de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-tug-norris-p10b | Política RL (ONNX) | 61-D / 14 | 50 Hz | no disponible | Hugging Face |
| SSH111111/microduck-tug-p10 | Política RL (modelo base) | 61-D / 14 (presumiblemente) | 50 Hz (presumiblemente) | no disponible | Hugging Face |
| Otras políticas de microduck en la Arena | Política RL | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas más allá de la mención al subcampeonato en la copa número 3.

## Limitaciones y advertencias

- Información muy escasa: no hay licencia declarada, lo que impide confirmar si el uso comercial está permitido.
- No se especifican los parámetros, la arquitectura interna ni el dataset de entrenamiento, lo que dificulta evaluar su robustez.
- Al ser un finetune sobre una política de competición, puede estar sobreajustada a las condiciones específicas de la Arena (superficies, configuraciones de robot y secuencias concretas).
- El comportamiento es una marcha perpetua: no hay mecanismo documentado de parada de emergencia ni de adaptación a obstáculos más allá de lo que haga la política por sí misma.
- No hay información sobre sesgos, alucinación (no aplica en el sentido de LLM) ni limitaciones idiomáticas.
- El repositorio declara 0 GB de tamano, lo que puede indicar que los artefactos no están subidos o que la métrica no se ha calculado; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.
- La fecha de creación (2026-11-21) es futura respecto a la redacción habitual de fichas; verificar la vigencia de los enlaces y del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-tug-norris-p10b
- Modelo base: https://huggingface.co/SSH111111/microduck-tug-p10
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Aplicación QuackPack: https://www.imundo.ch/quackpack/
