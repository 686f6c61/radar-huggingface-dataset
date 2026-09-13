# snupilab/theta-bench-dp-real-g1-91

## Resumen

Theta Bench DP Real G1 91 es un checkpoint de politica robotica publicado por el laboratorio snupilab dentro del proyecto THETA Bench. Se trata del resultado de un ajuste adicional (fine-tuning) sobre el modelo de simulacion `snupilab/theta-bench-dp-sim-3003`, que a su vez habia acumulado 40.000 actualizaciones en simulacion. Sobre esa base se aplicaron 5.000 actualizaciones nuevas utilizando 91 demostraciones reales recogidas en hardware Unitree G1, con acciones de tipo joint-target ejecutadas a 20 Hz.

El repositorio se publica como resultado de entrenamiento y, en el momento de redactar esta ficha, contiene unicamente metadatos: el propio autor indica que el entrenamiento esta "preparandose o en cola". No se declara ninguna puntuacion de evaluacion asociada a la publicacion del checkpoint, ni compatibilidad con cargadores genericos de Transformers o de simulacion. Su relevancia es acotada y experimental: documenta un pipeline de transferencia simulacion-a-realidad sobre cuatro condiciones concretas de manipulacion (StickMove y HookRetrieve, en variantes Standard y Reasoning).

No se dispone de informacion sobre arquitectura interna, numero de parametros, licencia o formato de pesos. El sufijo "dp" del nombre sugiere una politica de difusion (diffusion policy), pero esto no se confirma en la model card y debe tratarse como una hipotesis, no como un dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "dp" sugiere diffusion policy, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (politica robotica, no un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun etiquetas del repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene solo metadatos en el momento de la consulta) |
| Tarea | robotics (pipeline declarado) |
| Modelo base | snupilab/theta-bench-dp-sim-3003 |
| Dataset de entrenamiento | snupilab/theta-bench-teleop (revision 47eca9322bb53fa1c685363271a87d2e414cb0e8) |
| Frecuencia de grabacion | 20 Hz |
| Condiciones reales cubiertas | StickMove Standard, StickMove Reasoning, HookRetrieve Standard, HookRetrieve Reasoning |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13T17:04:01Z |
| Fecha de actualizacion | 2026-09-13T17:04:02Z |

## Arquitectura y entrenamiento

No se detalla la arquitectura en la informacion disponible. El identificador del modelo incluye el sufijo "dp" y el prefijo "theta-bench", lo que apunta a una politica del ecosistema THETA Bench, probablemente basada en diffusion policy, pero la model card no especifica capa, backbone, dimension de observaciones ni espacio de acciones mas alla de que las acciones ejecutadas en hardware son joint-target. Tampoco se indica si existe codificador visual, tipo de observaciones (RGB, propioceptivas, ambas) ni horizonte de prediccion.

En cuanto al entrenamiento, los datos disponibles son los siguientes: el checkpoint inicial es `snupilab/theta-bench-dp-sim-3003` tras 40.000 actualizaciones de simulacion, al que se anaden 5.000 actualizaciones adicionales con 91 demostraciones reales del robot G1. La configuracion declara batch por GPU de 16, 8 GPU en paralelo, batch global de 128, acumulacion de gradiente de 1 y 4 condiciones por batch global. El sistema usa optimizadores de modelo independientes y ejecucion compartida de GPU mediante MPS, con una fase de publicacion delegada a un cargador de CPU tras la validacion final del checkpoint. No se mencionan etapas de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de control motor.

## Capacidades

- Ejecucion de politicas de manipulacion robonica sobre el robot real G1, emitiendo acciones joint-target a partir de observaciones, segun la descripcion de las condiciones entrenadas.
- Cobertura de cuatro condiciones concretas: StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning.
- Diferenciacion entre variantes "Standard" y "Reasoning" dentro de cada tarea, lo que sugiere algun tipo de condicionamiento adicional o instruccion asociada a la fase de razonamiento.
- Aprendizaje a partir de teleoperacion real, con el dataset `snupilab/theta-bench-teleop` como fuente de las 91 demostraciones.
- Transferencia simulacion-a-realidad: parte de un checkpoint entrenado en simulacion y se ajusta con datos reales.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, function calling, agentes ni multilingueismo. Las etiquetas de idioma ("en") hacen referencia a la documentacion del repositorio, no a capacidades linguisticas del modelo.

## Casos de uso

- Investigacion en transferencia simulacion-a-realidad: el checkpoint permite estudiar como 5.000 actualizaciones con 91 demostraciones reales modifican el comportamiento de una politica preentrenada con 40.000 actualizaciones en simulacion, comparando el modelo resultante con su base `theta-bench-dp-sim-3003`.
- Manipulacion con robot humanoide G1 en laboratorio: ejecucion de las tareas StickMove y HookRetrieve sobre hardware real, siempre que se disponga del adaptador de control especifico de G1 que el autor exige para acciones joint-target.
- Evaluacion de estrategias de teleoperacion: dado que las demostraciones provienen de un dataset de teleoperacion a 20 Hz, el modelo sirve como punto de partida para medir la calidad del datos de teleoperacion en el rendimiento final de la politica.
- Replicacion de pipelines de entrenamiento: la configuracion declarada (8 GPU, batch por GPU 16, batch global 128, 5.000 actualizaciones objetivo) permite reproducir o escalar el procedimiento en otros laboratorios con recursos similares.
- Estudio comparativo Standard frente a Reasoning: las cuatro condiciones entrenadas permiten analizar si el condicionamiento de razonamiento aporta ventaja en tareas de manipulacion concreta.
- Base para nuevos ajustes con mas datos reales: al ser un fine-tune sobre un checkpoint de simulacion, puede usarse como inicializacion para experimentos posteriores con mas demostraciones reales o con otras tareas.
- Docencia y formacion en robotica: como ejemplo documentado de un flujo de trabajo completo (simulacion, teleoperacion real, publicacion de checkpoint) para cursos o talleres de aprendizaje por imitacion.

Advertencia: el propio autor indica que el entrenamiento esta en preparacion o en cola y que el repositorio solo contiene metadatos, por lo que los casos anteriores describen el proposito declarado del checkpoint, no capacidades verificadas actualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion del checkpoint no reclama ninguna puntuacion de evaluacion.

| Benchmark | Resultado |
|---|---|
| No disponible | no disponible |

## Requisitos de hardware

- VRAM de inferencia: no disponible. No se especifica tamano de parametros ni precision, por lo que no es posible estimar requisitos de memoria.
- GPU para entrenamiento: la configuracion declarada usa 8 GPU con batch por GPU de 16 y batch global de 128, pero no se indica el modelo de GPU empleado.
- Ejecucion en GPU de consumo: no disponible. No hay datos suficientes para confirmar si cabe en una RTX 4090 o similar.
- Opciones de despliegue: el autor indica que debe usarse el adaptador THETA nativo del modelo y sus dependencias especificas, y descarta explicitamente la compatibilidad con cargadores genericos de Transformers o de simulacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica robotica.
- Adaptador de control: para ejecutar acciones joint-target en hardware real se requiere el adaptador de control del G1 real correspondiente. No se debe asumir que un adaptador de simulacion sea compatible.
- Latencia y throughput: no disponible. Las grabaciones se realizan a 20 Hz, pero no se publica la frecuencia de inferencia del modelo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este checkpoint con su modelo base dentro de la misma familia. No se dispone de datos de parametros, contexto, licencia ni rendimiento de alternativas externas.

| Modelo | Etapa | Datos de entrenamiento | Actualizaciones | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| theta-bench-dp-real-g1-91 | Ajuste adicional real | 91 demostraciones reales G1 | 5.000 (tras 40.000 en simulacion) | no disponible | no declarado |
| theta-bench-dp-sim-3003 | Entrenamiento en simulacion | no disponible | 40.000 | no disponible | no disponible |
| Otras politicas de manipulacion (OpenVLA, pi0, diffusion policy genericas, etc.) | no aplica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene unicamente metadatos: el entrenamiento esta en preparacion o en cola segun el autor, por lo que no hay pesos utilizables en el momento de la consulta.
- No se declara ninguna puntuacion de evaluacion; no hay evidencia publicada de rendimiento en tareas reales ni en simulacion.
- El alcance es muy reducido: cubre cuatro condiciones concretas (StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning) y no debe asumirse generalizacion a otras tareas.
- Requiere el adaptador de control THETA nativo y el adaptador de control del G1 real. Un adaptador de simulacion no es asumido compatible por el autor.
- No se declara compatibilidad con cargadores arbitrarios de Transformers ni con cargadores de simulacion.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido. Debe consultarse con el autor antes de cualquier uso en produccion.
- Al tratarse de un modelo para hardware fisico, cualquier despliegue implica riesgos de seguridad mecanica, colisiones y danos al robot o a personas si no se aplican limites de par, paradas de emergencia y validacion previa en entorno controlado.
- Riesgo de sobreajuste a las 91 demostraciones reales y a las condiciones de laboratorio concretas en las que se grabaron: cambios de iluminacion, disposicion de objetos o desgaste del robot pueden degradar el comportamiento.
- No se documentan sesgos, pero al ser un modelo entrenado con teleoperacion humana, hereda las estrategias y posibles sesgos de los operadores que generaron las demostraciones.
- Advertencia sobre las busquedas web: los resultados recuperados no guardan ninguna relacion con este modelo (contenido veterinario en sueco sobre glandulas salivales caninas) y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snupilab/theta-bench-dp-real-g1-91
- Modelo base: https://huggingface.co/snupilab/theta-bench-dp-sim-3003
- Dataset de teleoperacion: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (revision concreta): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Otros enlaces relevantes (paper, blog, repositorio de codigo, demo): no disponible. La busqueda web no devolvio resultados relacionados con el modelo.
