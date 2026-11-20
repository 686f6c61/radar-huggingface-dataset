# GinDuck/microduck-tug-norris

## Resumen

Tug Norris es una política de control para el robot cuadrúpedo de bajo coste microduck, desarrollada por el usuario GinDuck para el tercer torneo de la comunidad (Tug of War cup #3). No es un modelo de lenguaje: es un modelo de aprendizaje por refuerzo exportado a ONNX que mapea una observación de 61 dimensiones a un espacio de 14 acciones a 50 Hz, pensado para ejecutarse en bucle continuo sobre el robot físico. Su relevancia radica en que ejemplifica el flujo de trabajo de la Microduck Arena: fine-tuning de una política de liga existente y ajuste evolutivo de secuencias de comportamiento sobre la física real del simulador.

El modelo parte de la red de self-play de liga de lphatnguyen (`microduck-tug-of-war-v2`), que GinDuck ha afinado en un entorno fiel a la Arena (league-3b) y posteriormente ha optimizado mediante búsqueda evolutiva sobre la física del simulador. La tabla de rating se construyó a partir de secuencias aportadas por varios miembros de la comunidad (jrubiosainz, suraj-phanindra, greecree, Unique007 y HlibPlakhtii) y se refinó con hill-climbing.

La ficha es deliberadamente escasa en datos: el repositorio tiene 0.0 GB declarados, no hay licencia publicada, no se han publicado benchmarks numéricos y no hay información sobre idiomas ni sobre el tamaño de la red. Todo lo que sigue se limita a lo que el autor documenta en la model card y a las inferencias razonables a partir de los tags y del pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (no se especifica la topología interna); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin contexto textual) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es `policy.onnx` con el normalizador de observaciones integrado |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red. Lo que sí se documenta es la interfaz: entrada de 61 dimensiones (observación del robot), salida de 14 acciones, frecuencia de control de 50 Hz, y comportamiento perpetuo (la política se ejecuta hasta que se le indique lo contrario, cargada en un slot de política del daemon `robotctl`). El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que se alimenta con observaciones en crudo.

El entrenamiento parte de la red de self-play de liga de lphatnguyen (`microduck-tug-of-war-v2`), sobre la que GinDuck hace fine-tuning en un entorno fiel a la Arena (`league-3b`). Posteriormente aplica búsqueda evolutiva sobre la física de la Arena, con una tabla de rating construida a partir de secuencias de comportamiento de cinco colaboradores y refinada por hill-climbing. El código de entrenamiento referenciado es el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. No se documentan volúmenes de datos, composición del dataset, ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control locomotor continuo del robot microduck a 50 Hz mediante política perpetua.
- Mapeo directo de observación cruda de 61 dimensiones a 14 acciones, sin preprocesado externo (normalizador embebido).
- Comportamiento especializado en la tarea de tug of war (tirar del adversario) dentro de la Microduck Arena.
- Carga en el robot mediante el comando `robotctl policy load <slot> GinDuck/microduck-tug-norris`.
- Compatibilidad con el manifiesto de políticas schema 2 del daemon de microduck.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Competición en la Microduck Arena: cargar la política en un slot del robot y competir en la Tug of War cup #3, aprovechando que está afinada sobre la física del simulador de la Arena y sobre secuencias de rating de la comunidad.
- Evaluación comparativa de políticas: usar Tug Norris como referencia base contra la que medir políticas propias en el mismo entorno `league-3b`, dado que su tabla de rating ya está construida con secuencias de cinco colaboradores.
- Punto de partida para fine-tuning: al derivar de `microduck-tug-of-war-v2`, sirve como inicialización para experimentos de RL sobre la misma tarea sin partir de cero.
- Docencia y divulgación en robótica de bajo coste: el flujo completo (entrenamiento en `microduck_rl`, exportación a ONNX, carga con `robotctl`) es reproducible y cabe en un robot de aficionado.
- Investigación en ajuste evolutivo de comportamientos: la combinación de fine-tuning más hill-climbing sobre secuencias de comportamiento es un caso concreto y documentado de optimización de políticas fuera del gradiente.
- Despliegue en el robot físico en exhibiciones o demos: al ser una política perpetua con normalizador embebido, la integración en el daemon es un único comando, sin pipeline de preprocesado adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "rating table" construida a partir de secuencias de cinco colaboradores y refinada por hill-climbing, pero no se publican valores numéricos de la misma ni métricas de recompensa, éxito o robustez.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se especifica el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Al ser una política de 61 entradas y 14 salidas a 50 Hz, es plausible que la inferencia en CPU sea suficiente, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de tamaño que permitan afirmarlo.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del microduck (comando `robotctl policy load <slot> ...`); el manifiesto sigue el schema 2 del repositorio del daemon.
- Latencia y throughput: no disponibles; únicamente se conoce la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-tug-norris | no disponible | no aplica | sin benchmarks publicados; rating por hill-climbing no numérico | no disponible | Hugging Face, 0 descargas, 0 likes |
| lphatnguyen/microduck-tug-of-war-v2 (modelo base) | no disponible | no aplica | red de self-play de liga; sin métricas publicadas en esta ficha | no disponible | Hugging Face |
| Otras políticas de la Microduck Arena | no disponible | no aplica | sujetas a los leaderboards de la Arena | variable | Hugging Face y leaderboards de QuackPack |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una política de control específica para el robot microduck y la tarea de tug of war; no es un modelo de propósito general ni un modelo de lenguaje.
- No hay licencia publicada: el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- No se documentan sesgos, pero al derivar de self-play de liga y de secuencias de comportamiento de la comunidad, el comportamiento puede estar sobreajustado a la física y a las condiciones concretas de la Arena (`league-3b`).
- El ajuste por hill-climbing sobre una tabla de rating limitada a secuencias de cinco colaboradores puede no generalizar a oponentes o condiciones no representadas.
- Sin benchmarks ni métricas de robustez publicadas, no hay evidencia cuantitativa de rendimiento fuera del simulador de la Arena.
- El repositorio declara 0.0 GB y 0 descargas; la madurez y el soporte del artefacto son mínimos.
- La integración depende del daemon `robotctl` y del schema 2 del manifiesto de políticas; cambios de versión en el daemon pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-tug-norris
- Modelo base: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Microduck Arena en QuackPack (iMundo): https://www.imundo.ch/quackpack/
