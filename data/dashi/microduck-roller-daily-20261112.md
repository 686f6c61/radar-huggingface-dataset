# dashi/microduck-roller-daily-20261112

## Resumen

`dashi/microduck-roller-daily-20261112` es una política de control robótico publicada en Hugging Face, no un modelo de lenguaje. Se trata de un fine-tune de `DenRakEiw/microduck-senate_duck_0904` destinado al robot cuadrúpedo de bajo coste microduck del proyecto de Pollen Robotics. El autor la etiqueta como "re-entry diario" de una política previa (`dashi/microduck-roller-remix-r900`, puntuación 0.900) y la describe como una política "perpetua" para la ranura `walk`, pensada para ejecutarse sobre ruedas (rollers) en lugar de patas.

El modelo opera a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control. Se distribuye como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones integrado, acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. El repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere pesos muy ligeros, coherentes con una política de control y no con una red neuronal de gran escala.

La relevancia es acotada: es una política de robótica de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni resultados de evaluación publicados. No debe confundirse con un modelo generativo: no procesa lenguaje, no tiene contexto de tokens ni capacidades de razonamiento simbólico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Ranura de politica | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (finetune) |
| Libreria | `microduck` |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se documenta es el pipeline de entrenamiento: el autor indica el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Esto sugiere un entrenamiento de reinforcement learning (etiqueta `reinforcement-learning`) orientado a locomoción con ruedas, con una política que se ejecuta de forma continua ("perpetua") hasta recibir una orden de parada.

El modelo se presenta como un "remix" del checkpoint `DenRakEiw/microduck-senate_duck_0904` y como "re-entry diario" de `dashi/microduck-roller-remix-r900`, con una puntuación de 0.900 en la evaluación previa (métrica no especificada en la información disponible). El normalizador de observaciones está embebido en el propio ONNX, de modo que el robot debe alimentar observaciones en crudo. No se documentan número de tokens, composición del dataset, ni uso de RLHF/DPO, por no aplicar a este dominio.

## Capacidades

- Control locomotor del robot microduck sobre ruedas (rollers) mediante la ranura `walk`.
- Política "perpetua": genera acciones de forma continua a 50 Hz hasta que se le indique lo contrario.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Normalización de observaciones integrada en el grafo ONNX (entrada en crudo).
- Carga mediante el comando `sudo robotctl policy load walk dashi/microduck-roller-daily-20261112`.
- Compatibilidad con el manifiesto de políticas de microduck, esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Locomoción sobre ruedas en el robot microduck: la política se carga en la ranura `walk` y ejecuta una marcha continua sobre rollers, adecuada para plataformas de bajo coste con tracción por ruedas.
- Investigación en reinforcement learning aplicado a robótica: sirve como checkpoint de referencia para comparar políticas entrenadas en la rama `roll-backward` del repositorio `microduck_rl`.
- Reproducción de experimentos de fine-tuning: al ser un remix de `microduck-senate_duck_0904`, permite reproducir la cadena de entrenamiento y evaluar el efecto del re-entry diario.
- Demostraciones educativas: el comando `robotctl policy load` facilita desplegar la política en talleres y entornos docentes con hardware microduck.
- Pruebas de integración del daemon: el `manifest.json` conforme al esquema 2 permite validar el cargador de políticas del daemon de microduck.
- Benchmarking interno de políticas de locomoción: la puntuación 0.900 declarada por el autor puede usarse como referencia comparativa dentro del ecosistema microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la puntuación 0.900 asociada a la política previa `dashi/microduck-roller-remix-r900`, sin que se especifique la métrica, el entorno de evaluación ni la comparación con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es 0.0 GB, lo que sugiere un modelo muy ligero que probablemente quepa en memoria de un dispositivo embebido.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto es plausible que se ejecute en CPU o en aceleradores de borde, pero no hay datos que lo verifiquen.
- Opciones de despliegue: el runtime propio `microduck` a través de `robotctl`; el formato ONNX permite, en principio, ejecución con ONNX Runtime, aunque no se documenta soporte explícito.
- Latencia y throughput: la política está diseñada para 50 Hz (20 ms por paso), pero no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261112` | Política RL para microduck (rollers) | no disponible | no aplica | 0.900 (política previa, métrica no especificada) | no disponible | Hugging Face, 0 descargas |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL para microduck (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL para microduck (rollers) | no disponible | no aplica | 0.900 (métrica no especificada) | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables fuera del ecosistema microduck.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto en tokens ni capacidades de razonamiento simbólico.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin resultados de evaluación publicados: la puntuación 0.900 carece de métrica, entorno y protocolo documentados.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- La política está entrenada específicamente para locomoción sobre rollers; su comportamiento sobre patas u otras configuraciones no está documentado.
- El normalizador está embebido en el ONNX, por lo que alimentar observaciones ya normalizadas produciría un comportamiento incorrecto.
- Dependencia del runtime `microduck` y del daemon con soporte para el manifiesto esquema 2; no se garantiza compatibilidad con otras versiones.
- Riesgo de alucinación no aplica; el riesgo relevante es de comportamiento físico impredecible fuera del entorno de entrenamiento.
- No se documentan sesgos, limitaciones idiomáticas ni restricciones de producción adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261112
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
