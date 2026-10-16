# Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n300000-10000-20261016

## Resumen

Este repositorio contiene un checkpoint de robótica basado en la librería `openpi`, correspondiente a un modelo de visión-lenguaje-acción (VLA) afinado sobre el benchmark LIBERO-support. Lo publica el usuario de HuggingFace Donghyun1228 y se presenta como una adaptación "unified LLM-frozen" del checkpoint `pi05-libero-support-probe-source-n300000-10000-20261015`: se congelan las nueve hojas del LLM base y se entrenan el bloque de visión (Vision23), el experto completo (expert11) y las proyecciones de acción/tiempo (action/time projections8).

El entrenamiento partió del update 5000 conservando pesos crudos, optimizador y EMA, y completó 10 000 updates totales con batch 32, semilla 42 y learning rate 1e-5 sobre un dataset de 300 000 frames con aumentación de orientación yaw30. La inferencia se realiza en BF16 y el checkpoint publicado corresponde al paso 9999 (pesos crudos, sin EMA).

Su relevancia es acotada y muy técnica: sirve como referencia reproducible para estudiar qué ocurre cuando se congela el LLM de un VLA mientras se adaptan visión y experto de acción, además de aportar un protocolo de evaluación multiusuario (32 clientes concurrentes, batch 16, cola global) sobre MuJoCo 3.2.3. No es un modelo de propósito general ni tiene tracción comunitaria: acumula 0 descargas y 0 likes, y no se documentan idiomas, cuantizaciones ni benchmarks comparativos con terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre la libreria `openpi`; LLM base congelado mas torre de vision, experto de accion y proyecciones de accion/tiempo |
| Parametros totales | No disponible (el repo ocupa 7,7 GB en BF16) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (no se documenta ventana de observacion ni horizonte de accion) |
| Tipos de cuantizacion | No disponible (entrenamiento e inferencia en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la model card; pesos en BF16, tamano de repo 7,7 GB |
| Libreria / pipeline | `openpi` / `robotics` |
| Tags | `openpi`, `robotics`, `libero`, `inverse-dynamics`, `region:us` |
| Entradas/salidas | Acciones de 7 dimensiones (incluye control de pinza); perdida IDM sobre 32 coordenadas, de las que se excluye la coordenada 6 (pinza) y se promedian las 31 restantes |

## Arquitectura y entrenamiento

La model card describe una adaptación "unified LLM-frozen": de los bloques de pesos del modelo, solo las nueve hojas del LLM base permanecen congeladas. Se entrenan con el optimizador AdamW nativo (multiplicador de update 1) los grupos denominados Vision23 (vision), expert11 (experto completo) y action/time projections8 (proyecciones de accion y tiempo). El esquema de normalizacion original y la muñeca (wrist) de origen se preservan. Esto apunta a una arquitectura VLA de filosofía π0.5, con un codificador visual, un LLM base y un experto de acciones, aunque la model card no detalla la topologia exacta ni el numero de capas de cada componente.

El entrenamiento se reanudo desde el update 5000 conservando pesos crudos, estado del optimizador y EMA; se saltaron los indices de sampler ya consumidos y se continuo el RNG nativo del modelo por paso global. Hiperparametros declarados: batch 32, semilla 42, learning rate 1e-5, warmup 500 y 10 000 updates totales. El dataset de origen es `Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015` (commit `9d2f1f4b5bbd4d2306b27aa4a1885738a019df32`), con 300 000 frames y aumentacion yaw30. La perdida de dinámica inversa (IDM) objetivo excluye la coordenada 6 (pinza) y promedia las 31 coordenadas restantes con padding. No se documentan tokens de entrenamiento, composición lingüística del dataset ni fases de RLHF/DPO.

## Capacidades

- Generacion de acciones de manipulacion robotica de 7 dimensiones, incluyendo control explicito de la pinza.
- Aprendizaje de dinámica inversa (IDM) sobre un espacio de 32 coordenadas de accion, con exclusión de la coordenada de pinza en la perdida.
- Percepcion visual a traves del bloque Vision23, con conservacion de la vista de muñeca del modelo original.
- Ejecucion en simulacion fisica MuJoCo 3.2.3 con renderizado EGL verificado por PCI/UUID y cero errores de rollout.
- Servicio multiusuario: protocolo `batched16_clients32_global_queue_v1`, con cola global que limita a 32 clientes concurrentes sobre cuatro suites de 8 shards cada una.
- Inferencia en BF16 sobre un unico GPU fisico.
- Capacidades de tool calling, agentes, texto general, matematicas o vision semantica: no documentadas en la informacion disponible; el LLM base esta congelado y sin especificar.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el checkpoint permite estudiar el efecto de congelar las nueve hojas del LLM base mientras se adaptan vision y experto de accion, con un punto de partida reproducible (update 5000 → 10000) y semilla y hiperparametros declarados.
- Evaluacion reproducible de politicas en LIBERO-support: el modelo se evaluo con 40 tareas x 50 ensayos, envseed 7 y 32 clientes, lo que facilita replicar el mismo protocolo y comparar checkpoints bajo condiciones identicas.
- Ablaciones de eficiencia de fine-tuning: al congelar el LLM, el coste de entrenamiento se concentra en Vision23, expert11 y las proyecciones, util para medir compromisos entre coste de adaptacion y rendimiento.
- Benchmarking de infraestructura de serving: el protocolo de cola global con 32 clientes y batch 16 sirve para validar planificadores de peticiones en entornos robotizados concurrentes.
- Generacion y filtrado de datos de manipulacion: el pipeline yaw30 y el muestreo de waypoints aleatorios sobre 300 000 frames pueden reutilizarse para producir o curar datasets de trayectorias antes de entrenar otras politicas.
- Prototipado academico de politicas VLA para brazos con pinza: el modelo opera con acciones de 7 dimensiones y control de gripper, adecuado para experimentos de laboratorio en simulacion antes de plantear transferencia a hardware real.
- Referencia para estudiar exclusiones en la funcion de perdida: la omision de la coordenada 6 en la perdida IDM es un punto concreto de analisis para investigar como afecta el control de pinza al resto de coordenadas de accion.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO-support (evaluacion declarada) | envseed 7, 40 tareas x 50 ensayos = 2000 episodios; 32 clientes en un solo GPU fisico; batch de servidor 16; protocolo `batched16_clients32_global_queue_v1`; MuJoCo 3.2.3; checkpoint paso 9999 (crudo, no EMA) | 1587 / 2000 aciertos (79,35 %) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. No se aportan datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-libero-support-unified-v1a1-yaw30-n300000-10000` (este modelo) | No disponible | No disponible | 1587/2000 en LIBERO-support (79,35 %) | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| `pi05-libero-support-probe-source-n300000-10000-20261015` (checkpoint fuente) | No disponible | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | Publico en HuggingFace |
| Familia π0.5 / `openpi` de Physical Intelligence (modelo base de referencia) | No disponible | No disponible | No disponible | No disponible | Repositorio `openpi` |

La model card no incluye comparaciones cuantitativas con el checkpoint fuente ni con terceros, por lo que no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Traccion nula: 0 descargas y 0 likes, sin validacion externa ni reportes de terceros.
- Alcance muy restringido: es un checkpoint de investigacion para LIBERO-support, no un modelo de proposito general ni listo para produccion.
- Riesgo de sobreajuste al simulador: los rollouts se realizaron exclusivamente en MuJoCo 3.2.3; no se documenta validacion en hardware real.
- Sesgos y errores de accion: al ser un modelo de control, los fallos se traducen en acciones fisicas incorrectas (colisiones, agarres fallidos), no solo en texto erroneo; no se reporta analisis de sesgo.
- LLM base congelado: las nueve hojas del LLM no se adaptan, lo que limita la adaptacion linguistica y de instrucciones mas alla de lo aprendido por vision y experto.
- Perdida IDM sin la coordenada de pinza: la coordenada 6 queda fuera de la perdida objetivo, lo que puede introducir asimetrias en el control del gripper.
- Dependencia de protocolo: el resultado de 79,35 % esta ligado a un protocolo de serving concreto (cola global, 32 clientes, batch 16) y a cambios numericos por forma de batch y asignacion de RNG compartido dependiente de la peticion; extrapolar la cifra fuera de ese entorno no es seguro.
- Ausencia de datos clave: no se documentan idiomas, parametros totales, contexto, cuantizaciones, latencia ni throughput.
- Metadatos anomales: los identificadores y fechas de creacion apuntan a 2026, lo que conviene verificar antes de citar el modelo en trabajos con requisitos de trazabilidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda dependencias y pesos del ecosistema `openpi`/π0.5, cuyas condiciones deben revisarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n300000-10000-20261016
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n300000-10000-20261015
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015
- Repositorio del framework `openpi` (referencia de la libreria declarada): https://github.com/Physical-Intelligence/openpi
- Commits citados en la model card: fuente `2e35994a62b96d29398b7ef137f915afe3d4a40a`; dataset `9d2f1f4b5bbd4d2306b27aa4a1885738a019df32`
