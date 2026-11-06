# dadudu/microduck-bubu-tug-remix

## Resumen

`dadudu/microduck-bubu-tug-remix` es una política de control motriz para el robot cuadrúpedo de bajo coste microduck, desarrollada por el usuario dadudu como un finetune del modelo `a1rb4Ck/microduck-tug`. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones. Su propósito es ejecutar una marcha (gait) perpetua en el robot dentro de la disciplina de "tug of war" (tiro de cuerda) de la arena de simulación.

El modelo se distribuye a través de la librería `microduck` y el daemon `robotctl` de Pollen Robotics, con un manifiesto en el esquema 2 de políticas microduck. La model card indica explícitamente que se trata de una política "in-sample lookup" y que está validada únicamente en simulación, por lo que su transferencia al mundo real no está garantizada.

El interés de esta ficha es limitado fuera del ecosistema microduck: el repositorio es de 0 GB, no tiene descargas ni likes, no declara licencia y no especifica idiomas. Se documenta aquí como referencia técnica del pipeline de políticas RL para robótica de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | política de aprendizaje por refuerzo exportada a ONNX (no se especifica la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal de la política. El artefacto principal es `policy.onnx`, que incorpora el normalizador de observaciones "horneado" en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo. La interfaz es fija: 61 dimensiones de observación como entrada, 14 acciones como salida y una frecuencia de control de 50 Hz. La política es de tipo "perpetuo", es decir, se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política (policy slot) del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `a3e0c0fbe`. El modelo es un finetune de `a1rb4Ck/microduck-tug`, que a su vez se enmarca en la tarea de "tug of war" de la arena de simulación. La model card indica que se trata de una política "in-sample lookup", lo que sugiere que el rendimiento medido corresponde a condiciones vistas durante el entrenamiento y no a una evaluación de generalización. No se especifican número de tokens, composición del dataset, ni uso de RLHF/DPO (conceptos que además no aplican a este tipo de modelo).

## Capacidades

- Generación de una marcha (gait) continua para el robot microduck a 50 Hz.
- Control de 14 actuaciones a partir de un vector de observación de 61 dimensiones.
- Ejecución perpetua: la política no termina por sí misma, sino que corre hasta que el daemon la descarga.
- Integración con el pipeline de políticas microduck mediante `manifest.json` (esquema 2).
- Normalización de observaciones integrada en el grafo ONNX: acepta observaciones en crudo.
- Orientada a la tarea de "tug of war" (tiro de cuerda) en la arena de simulación.
- No soporta tool calling, function calling, agentes, multilingüismo, visión ni audio.

## Casos de uso

- Investigación en locomoción de bajo coste: sirve como política de referencia para comparar marchas en el robot microduck dentro de entornos simulados.
- Reproducción de experimentos de RL: al estar vinculada a un commit concreto de `microduck_rl`, permite reproducir el pipeline de entrenamiento y evaluar variantes.
- Desarrollo de la arena "tug of war": útil para probar el comportamiento de políticas en competiciones de tiro de cuerda simuladas.
- Pruebas de integración del daemon `robotctl`: el modelo permite validar la carga de políticas en ranuras y el flujo de observaciones a 50 Hz.
- Base para finetunes posteriores: al ser un remix de `a1rb4Ck/microduck-tug`, puede servir como punto de partida para nuevas políticas con recompensas modificadas.
- Docencia y divulgación en robótica: ejemplo compacto de política RL exportada a ONNX y desplegable con un único comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una medida de "board ~165.46 cm @ -0.3" en el contexto de la arena, pero no se aporta la metodología ni métricas comparativas que permitan interpretarla como benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB, por lo que la política es muy ligera y probablemente quepa en CPU.
- GPU recomendadas: no disponible; para una política ONNX de este tamaño no se requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna e incluso en CPU, aunque no se confirma en la documentación.
- Opciones de despliegue: daemon `robotctl` de Pollen Robotics con `sudo robotctl policy load <slot> dadudu/microduck-bubu-tug-remix`; runtime ONNX estándar.
- Latencia y throughput: frecuencia de control de 50 Hz; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dadudu/microduck-bubu-tug-remix | Política RL (ONNX) | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| a1rb4Ck/microduck-tug | Política RL (modelo base) | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| Otras políticas microduck | Política RL | no disponible | no disponible | no disponible | Hugging Face / repos microduck |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Validación únicamente en simulación: la model card indica "Simulation only", por lo que el comportamiento en el robot físico no está garantizado.
- Política "in-sample lookup": el rendimiento observado corresponde a condiciones vistas en entrenamiento; la generalización a escenarios nuevos es dudosa.
- Sin licencia declarada: no se especifican términos de uso comercial, lo que impide asumir permisos de redistribución o explotación.
- Sin idiomas ni capacidades de lenguaje: no es un modelo de texto y no debe evaluarse con métricas de NLP.
- Metadatos incompletos: no se detallan arquitectura, número de parámetros ni composición del dataset de entrenamiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario.
- Dependencia de un ecosistema concreto: requiere el daemon `robotctl` y el esquema 2 de manifiestos de microduck.

## Enlaces

- Hugging Face: https://huggingface.co/dadudu/microduck-bubu-tug-remix
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-tug
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `a3e0c0fbe`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
