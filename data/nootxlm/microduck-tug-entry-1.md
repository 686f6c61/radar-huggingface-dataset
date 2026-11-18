# nootxlm/microduck-tug-entry-1

## Resumen

`nootxlm/microduck-tug-entry-1` es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada como un *remix* (finetune) del modelo `jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7`. No es un modelo de lenguaje: se trata de una política de aprendizaje por refuerzo que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, exportada en formato ONNX para su ejecución directa sobre el robot. El autor la describe como una política "perpetua", es decir, un patrón de marcha (*gait*) que se ejecuta de forma continua hasta que se le indique lo contrario.

La contribución concreta respecto al modelo base es una capa externa de búsqueda exacta por observación (*exact-observation lookup layer*) que incorpora dos trayectorias re-buscadas mediante descenso por coordenadas en escalas de 0,003 a 3e-6, con semillas 4 y 5. Según la model card, el resultado es una mejora en la media local del protocolo oficial hasta 168,9055 cm, verificada dos veces sobre bytes idénticos; fuera de las observaciones registradas, la política se comporta exactamente igual que el stack base.

El modelo es relevante por su carácter de experimento reproducible en robótica con RL: mantiene intacto el stack del líder del *board* en el momento de la construcción y añade una capa de memorización de trayectorias, lo que permite estudiar el efecto de dicha capa sobre una política ya entrenada sin alterar sus pesos originales. El repositorio tiene 0 descargas y 0 *likes*, y un tamaño de 0,0 GB, lo que sugiere que los artefactos aún no se han subido o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo para control robótico (no se especifica la topología interna; exportada como ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de transformer o MLP, función de activación). Lo que sí se especifica es la interfaz: 61 dimensiones de observación de entrada, 14 acciones de salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política consume observaciones en bruto. El manifiesto `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del *daemon*.

El entrenamiento se realizó con el *framework* `pollen-robotics/microduck_rl`, y el modelo parte del *checkpoint* `jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7`, que era el líder del *board* en el momento de la construcción. Sobre ese stack se conservan los bytes originales y se añade una capa de búsqueda exacta por observación que contiene dos trayectorias re-buscadas por descenso por coordenadas a escalas entre 0,003 y 3e-6 (semilla 4 con +0,00107 cm y semilla 5 con +0,00004 cm), posteriormente re-grabadas. La innovación técnica destacable es, por tanto, la hibridación de una política RL con una capa de memorización exacta de trayectorias, que solo interviene cuando la observación coincide con una registrada.

## Capacidades

- Generación de una marcha continua (*gait*) para el robot microduck, ejecutada de forma perpetua hasta recibir una orden de parada.
- Control reactivo a partir de observaciones de 61 dimensiones, con salida de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el propio grafo ONNX, lo que permite alimentar observaciones en bruto sin preprocesado externo.
- Recuperación exacta de dos trayectorias registradas mediante una capa de búsqueda por observación, con mejora medida de la media local del protocolo oficial.
- Compatibilidad con el sistema de *slots* de políticas del *daemon* microduck (`robotctl policy load`).
- Comportamiento idéntico al stack base fuera de las observaciones registradas (no generaliza más allá de lo que ya hacía el modelo base).
- No dispone de capacidades de lenguaje, visión, audio, *tool calling* ni razonamiento multi-paso.

## Casos de uso

- **Investigación en aprendizaje por refuerzo robótico**: sirve como punto de comparación controlado frente al modelo base, ya que conserva sus bytes y añade una capa aislada cuyo efecto puede medirse con el protocolo oficial.
- **Reproducción de experimentos de búsqueda por coordenadas**: la capa de *lookup* documenta las escalas y semillas empleadas (0,003 a 3e-6; semillas 4 y 5), lo que permite replicar el proceso de búsqueda sobre otras políticas del mismo *board*.
- **Evaluación de marchas en el microduck**: se carga en un *slot* de política mediante `robotctl policy load` y se ejecuta como gait perpetua para medir la media local del protocolo oficial en el robot real.
- **Estudio de sobreajuste por memorización**: al comportarse exactamente como el base fuera de las observaciones registradas, permite cuantificar cuánto de la mejora proviene de la memorización de trayectorias y cuánto de la política subyacente.
- **Docencia y divulgación en robótica de código abierto**: el par modelo base + remix ilustra de forma tangible el flujo completo de entrenamiento, exportación a ONNX, empaquetado con manifiesto y despliegue en un cuadrúpedo de bajo coste.
- **Pruebas de integración del *daemon* microduck**: el `manifest.json` conforme al esquema 2 y el normalizador embebido lo convierten en un artefacto útil para validar el cargador de políticas y el pipeline de inferencia a 50 Hz.

## Benchmarks y rendimiento

La model card solo reporta una métrica del protocolo oficial local:

| Metrica | Valor |
|---|---|
| Media local del protocolo oficial (verificada dos veces sobre bytes idénticos) | 168,9055 cm |
| Mejora de la semilla 4 (descenso por coordenadas) | +0,00107 cm |
| Mejora de la semilla 5 (descenso por coordenadas) | +0,00004 cm |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con el modelo base más allá de la indicación cualitativa de que este era el líder del *board* en el momento de la construcción.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el tamaño del repositorio es de 0,0 GB y no se especifica el número de parámetros de la red.
- **GPU recomendadas**: no disponibles; al tratarse de una política de 61 entradas y 14 salidas a 50 Hz, es probable que la inferencia sea viable en CPU, pero no se confirma en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no confirmada; no hay datos sobre si cabe en RTX 4090, RTX 3090 u otras.
- **Opciones de despliegue**: `policy.onnx` mediante el *runtime* ONNX y el *daemon* microduck con `robotctl policy load <slot> nootxlm/microduck-tug-entry-1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: la política opera a 50 Hz (periodo de 20 ms por paso de control), pero no se publican latencias medidas ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `nootxlm/microduck-tug-entry-1` | Política RL + capa de lookup | no disponible | 61-D obs., 14 acciones, 50 Hz | Media local 168,9055 cm | no disponible | Hugging Face (0 descargas) |
| `jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7` | Política RL (modelo base) | no disponible | 61-D obs., 14 acciones, 50 Hz | Líder del board en el momento de la construcción; sin cifra publicada en esta ficha | no disponible | Hugging Face |
| Otras políticas microduck del *board* | Políticas RL | no disponible | 61-D obs., 14 acciones, 50 Hz | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas de otros ecosistemas robóticos (por ejemplo, políticas para otros cuadrúpedos) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Sobreajuste por memorización**: la mejora procede de una capa de búsqueda exacta por observación; fuera de las trayectorias registradas, el modelo es idéntico al base, por lo que no cabe esperar generalización adicional.
- **Licencia no disponible**: no se puede confirmar el uso comercial ni las condiciones de redistribución; es imprescindible contactar con el autor o consultar el modelo base antes de un uso en producción.
- **Idiomas no aplicables**: al no ser un modelo de lenguaje, no procede evaluar sesgos lingüísticos, pero tampoco ofrece capacidades multilingües.
- **Sesgos del entorno de entrenamiento**: al ser una política entrenada en un *runner* concreto, su comportamiento puede degradarse ante cambios en la dinámica del robot, el terreno o el calibrado de sensores.
- **Riesgo en robótica real**: una gait perpetua sin mecanismos de parada o supervisión puede provocar daños físicos; debe ejecutarse con los límites de seguridad del *daemon* activos.
- **Artefactos incompletos**: el repositorio figura con 0,0 GB y 0 descargas, por lo que conviene verificar que `policy.onnx` y `manifest.json` están efectivamente disponibles antes de desplegar.
- **Reproducibilidad dependiente del *board***: la comparación con el modelo base solo es válida bajo el protocolo oficial y las mismas condiciones de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nootxlm/microduck-tug-entry-1
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (referenciado en la model card; no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del *daemon* (referenciado en la model card; no se proporciona URL directa)
