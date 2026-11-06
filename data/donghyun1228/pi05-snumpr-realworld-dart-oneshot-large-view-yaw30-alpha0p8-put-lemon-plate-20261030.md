# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-put-lemon-plate-20261030

## Resumen

El modelo `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-put-lemon-plate-20261030` es un checkpoint de politica visomotora (VLA, vision-language-action) derivado de π0.5, publicado por Donghyun1228 en el contexto del laboratorio SNUMPR. No se trata de un modelo de lenguaje general, sino de un modelo robotico especializado en una unica tarea de manipulacion: colocar un limon sobre un plato (`put_lemon_plate`). El repositorio ocupa 5,3 GB y contiene pesos en BF16 junto con los assets de normalizacion original.

La construccion sigue la receta DART (domain arithmetic) de una sola pasada: se parte de la base `snumpr-iclr27-v1/9999`, se aplica un fine-tuning fuente sobre una unica demostracion con yaw 0 y un fine-tuning objetivo sobre una unica demostracion en vista amplia con yaw virtual +30 grados, y se combinan ambos mediante aritmetica de dominios con α = 0,8 y alcance completo (51 de 51 claves verificadas, sin fallback). Ambos fine-tunings usan solo imitation learning, 1.000 updates, batch 64, LR constante 5e-5, sin warmup ni EMA.

Su relevancia es metodologica: documenta de forma reproducible como transferir una politica robotica a una nueva configuracion de camara (vista amplia y rotacion de 30 grados) a partir de una sola demostracion, con un registro de merge verificable. Es un artefacto de investigacion, no un modelo listo para produccion: el propio autor indica que no se ha ejecutado ninguna evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de π0.5; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 mas directorio `assets` con normalizacion original (SHA `f549619e…`); no se menciona safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un checkpoint de politica visomotora basado en π0.5, adaptado mediante la receta DART (domain arithmetic) del repositorio `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711`. El proceso parte de la base `snumpr-iclr27-v1/9999`, que corresponde a la VLA inicial de SNUMPR con su normalizacion original. Sobre esa base se ejecutan dos fine-tunings independientes: uno fuente con el preset `pi05_snumpr_dart_oneshot_source_put_lemon_plate` sobre la unica demostracion `demonstration_0` de la tarea con yaw 0, y otro objetivo con el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_put_lemon_plate` sobre la unica demostracion en vista amplia con yaw virtual +30 grados.

Ambos fine-tunings emplean exclusivamente imitation learning, con 1.000 updates, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA y entrenando todos los pesos, usando el codigo de `Donghyun1228/vla_adaptation` en el commit `248126e`. La combinacion final se realiza mediante aritmetica de dominios con α = 0,8, alcance completo y semilla 42, ejecutada en CPU. El repositorio incluye `merge_config.json` como registro del merger y `dart_merge_verified.json` como verificacion clave por clave (51/51, sin fallback). La innovacion destacable es operativa: el modelo incorpora una transformacion virtual de yaw que el controlador del robot debe invertir en tiempo de ejecucion mediante `Δxyz_real = Rz(+30) Δxyz_virtual` y estado `q0_real - 30°`.

## Capacidades

- Manipulacion robotica especializada en la tarea `put_lemon_plate`: colocar un limon sobre un plato.
- Control visomotor a partir de observaciones de camara en vista amplia, con un desplazamiento virtual de yaw de +30 grados respecto al entrenamiento fuente.
- Aprendizaje por imitacion a partir de una unica demostracion por dominio (one-shot), tanto en el dominio fuente como en el objetivo.
- Fusion de dominios mediante aritmetica de pesos DART con coeficiente α configurable (0,8 en este checkpoint).
- Verificacion de integridad del merge a nivel de clave, documentada en `dart_merge_verified.json`.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, tool calling, agentes multi-paso, vision general ni audio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Transferencia de politica a nueva camara: usar este checkpoint como referencia reproducible para adaptar una VLA entrenada con una vista concreta a una vista amplia rotada 30 grados, partiendo de una sola demostracion en el dominio objetivo.
- Replicacion de experimentos DART: servir como artefacto verificable (merge_config.json y dart_merge_verified.json) para auditar o reproducir la receta de aritmetica de dominios sobre π0.5 en tareas de manipulacion.
- Punto de partida para fine-tuning adicional: al estar en BF16 con normalizacion original, puede reutilizarse como inicializacion para nuevas tareas de pick-and-place en el mismo montaje robotico.
- Validacion de pipeline de control: probar la integracion del controlador con la transformacion inversa de yaw (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`) antes de desplegar politicas derivadas.
- Estudio de robustez one-shot: analizar hasta que punto una unica demostracion en vista amplia basta para preservar el comportamiento de la politica base en la tarea `put_lemon_plate`.
- Benchmark interno de metodos de merge: comparar DART con α = 0,8 frente a otras estrategias de combinacion de checkpoints (por ejemplo, interpolacion lineal o task arithmetic) usando la misma base y los mismos fine-tunings.
- Docencia e investigacion en VLA: material de laboratorio para ilustrar el flujo completo base → fine-tuning fuente → fine-tuning objetivo → merge verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que todavia no se ha ejecutado ninguna evaluacion en robot real, por lo que no existen tasas de exito ni metricas de tarea para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 5,3 GB e incluye pesos en BF16, lo que da una referencia de tamano pero no de memoria de ejecucion (no se documentan requisitos del runtime de π0.5).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son los runtimes habituales para politicas VLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pi05-snumpr-...-put-lemon-plate`) | no disponible | no disponible | sin evaluacion en robot | Apache 2.0 | Hugging Face, 0 descargas |
| `snumpr-iclr27-v1/9999` (base SNUMPR VLA) | no disponible | no disponible | no disponible | no disponible | referenciado como base |
| π0.5 (modelo original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints DART del mismo autor (otras tareas) | no disponible | no disponible | sin evaluacion en robot | Apache 2.0 | Hugging Face |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible; las diferencias documentadas se limitan a la tarea, la vista de camara, el yaw virtual y el coeficiente α del merge.

## Limitaciones y advertencias

- Ausencia total de evaluacion en robot: no hay evidencia empirica de que la politica funcione tras el merge; el propio autor lo declara.
- Especializacion extrema: el modelo solo aborda la tarea `put_lemon_plate`; no sirve como politica general ni como modelo de lenguaje.
- Dependencia de transformacion en el controlador: si el controlador no aplica la inversa del yaw virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`), las acciones resultantes seran incorrectas.
- Dependencia de la normalizacion original: los assets incluidos (SHA `f549619e…`) deben usarse tal cual; alterarlos invalida el comportamiento esperado.
- Entrenamiento one-shot: cada dominio se entrena con una unica demostracion, lo que limita la cobertura de condiciones de iluminacion, oclusiones y variaciones de posicion no representadas.
- Sin datos sobre sesgos, alucinacion o cobertura idiomatica: no aplica en el sentido habitual de un LLM, pero tampoco se documenta el comportamiento ante entradas fuera de distribucion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los presets de los que deriva pueden tener condiciones propias que no se detallan en la informacion disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Artefacto de investigacion con 0 descargas y 0 likes: sin comunidad que valide su funcionamiento ni incidencias reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-put-lemon-plate-20261030
- Repositorio DART referenciado: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711` (no se proporciona URL)
- Codigo de adaptacion VLA: `Donghyun1228/vla_adaptation`, commit `248126e` (no se proporciona URL)
- Modelo base: `snumpr-iclr27-v1/9999` (no se proporciona URL)
- Papers, blogs, demos y otros repositorios: no disponibles en la informacion proporcionada.
