# lxy222222/RobotLab-G1-T2MIR-DT2MIR

## Resumen

RobotLab-G1-T2MIR-DT2MIR es un repositorio de checkpoints de politicas de control entrenadas por refuerzo, publicado por el usuario lxy222222 en HuggingFace. No se trata de un modelo de lenguaje: la model card lo describe explicitamente como "artefactos de simulacion para investigacion", validados en Isaac Sim y MuJoCo, y asociados a una demo de practicas denominada RobotLab G1 multi-dynamics. El repositorio contiene dos variantes de enrutamiento (T2MIR, con enrutamiento fijo Top-2 de token y tarea, y DT2MIR, con enrutamiento Top-p de token y tarea), cada una con dos etapas de entrenamiento.

El contrato de politica declarado maneja 123 observaciones, 37 acciones y un contexto causal de 64 transiciones, con un horizonte de prompt de 64 pasos y una politica semilla y protocolo de entrenamiento comunes a ambos modelos. La primera etapa se entreno durante 100.000 pasos sobre el dataset `formal_v1` (el mejor checkpoint se selecciono en el paso 99.500) y la segunda consistio en un ajuste fino de 20.000 pasos solo de politica sobre `formal_v1_actor_mean`, reinicializando optimizador, scheduler y estado de RNG.

Su relevancia es acotada y muy especifica: sirve como material de reproduccion para estudiar estrategias de enrutamiento en politicas de control multi-dinamica, no como modelo de proposito general. Los checkpoints requieren la implementacion modificada del repositorio privado `robotlab-t2mir-demo` y no son reemplazos directos de los checkpoints upstream de Cheetah-Vel. El repositorio tiene 0 descargas, 0 likes, 0,1 GB de tamano total y licencia no confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card describe enrutamiento de token y tarea, Top-2 fijo en T2MIR y Top-p en DT2MIR; no se detalla la topologia de red) |
| Parametros totales | no disponible (el repositorio completo ocupa 0,1 GB; no se desglosa el tamano por checkpoint) |
| Parametros activos | no disponible (no se confirma que sea un modelo de mezcla de expertos, pese a usar enrutamiento) |
| Longitud de contexto | 64 transiciones causales (horizonte de prompt de 64 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable / no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; la model card indica que no debe marcarse con licencia de terceros hasta confirmar la licencia de origen derivada de T2MIR y los terminos de redistribucion |
| Formato de pesos | PyTorch (`.pt`, checkpoints `model.pt` por etapa) |
| Espacio de observacion | 123 observaciones |
| Espacio de accion | 37 acciones |
| Etapas por modelo | 2 (`stage1_pretraining`, `stage2_actor_mean`) |
| Variantes incluidas | T2MIR y DT2MIR |
| Entorno de validacion | Isaac Sim y MuJoCo |
| Fecha de creacion en HuggingFace | 2026-10-05T18:02:32Z |
| Ultima actualizacion | 2026-10-05T18:02:51Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no especifica el tipo de red (transformer, MLP, arquitectura recurrente u otra), el numero de capas ni el numero de parametros. Lo que si se documenta es el mecanismo de enrutamiento, que actua simultaneamente sobre tokens y tareas: T2MIR emplea un enrutamiento fijo Top-2 y DT2MIR un enrutamiento Top-p. Ambos modelos comparten el mismo protocolo de dos etapas, la misma politica de semilla y el mismo horizonte de prompt de 64 pasos, lo que permite comparar el efecto del esquema de enrutamiento manteniendo constantes el resto de factores.

El entrenamiento consta de una primera etapa de preentrenamiento de 100.000 pasos sobre el dataset `formal_v1`, de la que se conserva el mejor checkpoint (paso 99.500), y una segunda etapa de ajuste fino de politica de 20.000 pasos sobre `formal_v1_actor_mean`, denominada `stage2_actor_mean`. La etapa 2 se inicializa desde los pesos de politica de la etapa 1 correspondiente, pero reiniciando optimizador, scheduler y estado de RNG. El repositorio incluye artefactos de trazabilidad: `resolved_config.yaml` (configuracion resuelta completa), `routing_signature.json` (contrato de enrutamiento), `balance_signature.json` (contrato de balanceo de carga), `dataset_provenance.json` (identidad del dataset) y `latest_validation.json` junto con `metrics.csv` (registros de entrenamiento offline). No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de artefacto.

La identidad criptografica de los cuatro checkpoints es la siguiente:

| Checkpoint | SHA-256 |
|---|---|
| T2MIR stage 1 | a78ff7016a6337fa15011c2d36eeff668e17643a6be5c426b5b0d0c6d2604bee |
| T2MIR stage 2 | 882e06c21fee1427b65fc6ae0ab87e72be23c7faeb4be17ca0032a8647d897fe |
| DT2MIR stage 1 | d93f487d895bb815eeb8c86a12a4822b6ad2aaae3a730dd28ab8ad7dd2ea68d3 |
| DT2MIR stage 2 | 68fbce392828cd1371a2afd231001bfc362978c0f7cf3576de70becfc10188c8 |

## Capacidades

- Generacion de acciones de control continuo: la politica emite vectores de 37 acciones a partir de 123 observaciones, orientados a tareas de locomocion o control en simulacion.
- Contexto causal de 64 transiciones: mantiene dependencias temporales de hasta 64 pasos, adecuado para tareas con historial relevante de dinamica.
- Enrutamiento condicionado por token y tarea: T2MIR aplica Top-2 fijo y DT2MIR aplica Top-p, lo que permite estudiar el compromiso entre especializacion determinista y seleccion adaptativa.
- Balanceo de carga declarado: el repositorio incluye un contrato de balanceo (`balance_signature.json`) que sugiere control explicito del reparto de carga entre componentes enrutados.
- Validacion cruzada de simuladores: los checkpoints se han validado en Isaac Sim y MuJoCo, lo que aporta evidencia de transferencia entre motores de simulacion.
- Trazabilidad de experimento: cada checkpoint va acompanado de configuracion resuelta, procedencia de dataset y metricas de validacion, lo que facilita la reproducibilidad.
- Sin capacidades de lenguaje, vision, audio, tool calling ni razonamiento multi-paso: no son funciones de este artefacto y no se documenta ninguna.
- Sin soporte multilingue: no aplicable.

## Casos de uso

- Comparacion de estrategias de enrutamiento: usar los pares T2MIR y DT2MIR, entrenados bajo el mismo protocolo, semilla y horizonte, para aislar el efecto de Top-2 fijo frente a Top-p en el rendimiento de la politica, manteniendo el resto de variables constante.
- Reproduccion de experimentos de practicas o internado: el repositorio esta pensado como material de demostracion congelado, con hashes SHA-256 y registros de validacion, lo que permite verificar que una ejecucion reproduce exactamente el checkpoint publicado.
- Validacion sim-to-sim: cargar los checkpoints en Isaac Sim y MuJoCo para medir la degradacion de politica entre ambos motores, un paso previo habitual antes de considerar cualquier despliegue fisico.
- Estudio de balanceo de carga en redes enrutadas: el contrato `balance_signature.json` permite analizar como se distribuye la carga entre componentes y si el enrutamiento Top-p induce desequilibrios frente al Top-2 fijo.
- Analisis de ajuste fino solo de politica: comparar los checkpoints de `stage1_pretraining` y `stage2_actor_mean` para cuantificar que aportan los 20.000 pasos de ajuste fino sobre `formal_v1_actor_mean` partiendo de los pesos de la etapa 1.
- Evaluacion de sensibilidad al horizonte temporal: con un contexto causal de 64 transiciones, se pueden disenar ablaciones truncando el historial para medir cuanto depende la politica del contexto largo.
- Base para destilacion o inicializacion de politicas: los pesos de la etapa 1 pueden servir como punto de partida para experimentos propios de ajuste fino en tareas de control con espacio de observacion y accion compatibles.
- Docencia en aprendizaje por refuerzo: sirve como ejemplo completo de pipeline de dos etapas con artefactos de procedencia, util en cursos o talleres practicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `metrics.csv` y `latest_validation.json` como registros de entrenamiento y validacion offline, pero su contenido no se ha proporcionado. No se dispone de cifras de recompensa, tasas de exito ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio completo ocupa 0,1 GB, lo que sugiere checkpoints de tamano reducido, pero no se especifica el consumo de memoria en ejecucion ni el tamano individual de cada `model.pt`.
- GPU recomendadas: no disponible en la informacion proporcionada. La validacion se realizo en Isaac Sim y MuJoCo; Isaac Sim requiere habitualmente una GPU con soporte RTX para renderizado y fisica acelerada, pero este requisito no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Dado el reducido tamano del repositorio, es plausible, pero no hay dato que lo respalde.
- Opciones de despliegue: carga directa en PyTorch mediante la implementacion modificada del repositorio privado `robotlab-t2mir-demo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Dependencia critica: los checkpoints no funcionan como reemplazo directo de los checkpoints upstream de Cheetah-Vel; requieren la implementacion modificada, que no es publica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parametros ni contexto de modelos comparables en la informacion proporcionada. La unica referencia citada en la model card son los checkpoints upstream de Cheetah-Vel, de los que se indica explicitamente que no son intercambiables con estos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T2MIR (RobotLab G1) | no disponible | 64 transiciones | no disponible | no confirmada | Publico en HuggingFace; requiere repo privado `robotlab-t2mir-demo` |
| DT2MIR (RobotLab G1) | no disponible | 64 transiciones | no disponible | no confirmada | Publico en HuggingFace; requiere repo privado `robotlab-t2mir-demo` |
| Checkpoints upstream Cheetah-Vel | no disponible | no disponible | no disponible | no disponible | Mencionados en la model card como no compatibles ni intercambiables |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de proposito general: cualquier expectativa de generacion de texto, codigo, vision o tool calling queda fuera de su alcance.
- Licencia no confirmada: la model card indica explicitamente que no debe marcarse con licencia de terceros hasta que se confirme la licencia de origen derivada de T2MIR y todos los terminos de redistribucion. Esto bloquea de facto cualquier uso comercial o redistribucion sin aclaracion previa.
- Dependencia de codigo privado: los checkpoints requieren la implementacion modificada del repositorio privado `robotlab-t2mir-demo`. Sin acceso a ese codigo, los pesos no son utilizables ni reproducibles de forma fiable.
- No son reemplazos directos: la model card advierte que no sustituyen a los checkpoints upstream de Cheetah-Vel.
- Sin certificacion de seguridad: son artefactos de investigacion validados en simulacion (Isaac Sim y MuJoCo) y no estan certificados para despliegue en hardware real. Usarlos en un robot fisico conlleva riesgo de danos materiales o personales.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento que permita comparar con alternativas existentes.
- Trazabilidad parcial: se publican hashes y contratos de configuracion, pero sin el codigo de entrenamiento ni las metricas completas no es posible auditar por completo el proceso.
- Repositorio sin traccion: 0 descargas y 0 likes, sin mantenimiento posterior documentado mas alla de la fecha de actualizacion (2026-10-05T18:02:51Z).
- Riesgo de sesgo especifico de simulacion: al entrenarse sobre un unico dataset (`formal_v1`) y validarse en simuladores concretos, es probable que la politica explote caracteristicas propias de esos entornos, aunque no se documentan analisis de sesgo ni de robustez.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lxy222222/RobotLab-G1-T2MIR-DT2MIR
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible publicamente; la model card menciona el repositorio privado `robotlab-t2mir-demo`
- Demo: no disponible (se cita una "multi-dynamics internship demo" sin enlace)
- Referencia a checkpoints upstream de Cheetah-Vel: no disponible
