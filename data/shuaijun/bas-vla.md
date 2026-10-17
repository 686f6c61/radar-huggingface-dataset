# Shuaijun/BAS-VLA

## Resumen

BAS-VLA es un adaptador residual de corrección de acciones para modelos vision-language-action (VLA), publicado por Shuaijun Liu y colaboradores (NEBULIS-Lab) y aceptado en NeurIPS 2026 con el artículo *Beyond Appearance Shifts: Task-Semantic Action Calibration for VLA Models*. No es un modelo completo, sino un módulo entrenado que se acopla sobre el VLA congelado `openvla/openvla-7b` y aplica una corrección acotada sobre la acción que produce el modelo base, usando como señal adicional características binarias bag-of-words de la instrucción. El problema que aborda es la sensibilidad de las políticas VLA a cambios en el enunciado de la tarea: la misma escena con una instrucción que preserva la tarea frente a otra que cambia su semántica (objeto objetivo o condición de ejecutabilidad) produce en el modelo base acciones idénticas o mal calibradas.

La release disponible en HuggingFace corresponde a un subconjunto concreto del artículo: el escenario de calibración offline sobre LIBERO-10, con tripletas de observación compartida, instrucciones limpias, preservadoras de tarea y modificadoras de semántica, junto con las acciones del carrier congelado y las acciones expertas. El adaptador se entrenó con un núcleo de calibración centrado en el "breaking" como ruta por defecto y un auxiliar preservador con compuerta selectiva de evidencia, que solo se activa cuando se detecta variación de nuisance mientras la semántica de la tarea permanece consistente.

Es relevante ahora porque propone una vía de adaptación paramétricamente eficiente para robótica de manipulación: mejorar la fidelidad semántica de una política ya entrenada sin reentrenar el VLA de 7B, con pesos ligeros, licencia MIT y un ejemplo que se ejecuta en CPU. La contrapartida es que el adaptador está fuertemente acoplado a una convención de acciones y a un carrier concretos, y que el repositorio no publica cifras de rendimiento en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador residual text-condicionado sobre VLA congelado; corrección acotada de acción a partir de la acción base y características binarias bag-of-words de la instrucción |
| Parametros totales | 7B del carrier congelado (`openvla/openvla-7b`) mas un adaptador residual de tamano no disponible |
| Parametros activos | No aplica (no es un modelo MoE); el adaptador se aplica sobre el carrier completo congelado |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del carrier OpenVLA-7B; no se documenta en la model card) |
| Tipos de cuantizacion | No disponible; no se documentan versiones cuantizadas del adaptador. Los pesos base se obtienen por separado de sus repositorios upstream |
| Idiomas soportados | Ingles (`en`); vocabulario binario bag-of-words de instrucciones en ingles |
| Licencia | MIT (adaptador y contribuciones BAS-VLA). Los datos derivados de LIBERO y las estadisticas de normalizacion de OpenVLA-OFT conservan sus avisos MIT upstream (`NOTICE.md`, `licenses/`) |
| Formato de pesos | No disponible; el repo contiene pesos del adaptador, vocabulario y metadatos en `adapter/`, con un ejemplo de carga en CPU. Tamano del repo: 0.0 GB (pesos ligeros) |

Otros identificadores declarados por el autor: espacio de acciones `openvla_libero10_unnormalized_sign_gripper_offline`; relacion con el modelo base `adapter`; pipeline `robotics`; tags `vision-language-action`, `residual-adapter`, `bas-vla`, `arxiv:2609.23650`.

## Arquitectura y entrenamiento

BAS-VLA se construye sobre un VLA base congelado y no modifica sus pesos. La contribucion es un adaptador residual que recibe la accion producida por el carrier y un vector binario bag-of-words de la instruccion, y emite una correccion acotada de la accion (bounded action correction). El diseno del articulo combina dos componentes: un nucleo de calibracion centrado en el "breaking" como ruta por defecto, y un auxiliar preservador con compuerta selectiva de evidencia que se activa unicamente cuando se detecta variacion de nuisance mientras la semantica de la tarea sigue siendo consistente. El objetivo es separar cambios de apariencia o de enunciado irrelevantes de cambios que alteran realmente la tarea.

El entrenamiento se realizo en el marco de calibracion offline de OpenVLA / LIBERO-10. Los datos publicados incluyen `data/triplets.json` con tripletas de acciones emparejadas (instruccion limpia, preservadora de tarea y modificadora de semantica), acciones expertas y asignaciones train/validacion/test a nivel de demostracion; `data/observations.npz` con imagenes RGB del punto de vista del agente; `data/states/` con estados de simulador muestreados y estados iniciales de las demostraciones; `data/scenes/` con las escenas BDDL de LIBERO; y `normalization/` con las estadisticas de accion usadas para construir las acciones congeladas de OpenVLA. Los casos cubren cambios de objeto objetivo y de condicion de ejecutabilidad. Las acciones cacheadas usan las estadisticas `libero_10_no_noops` de `moojink/openvla-7b-oft-finetuned-libero-10`, seguidas de la transformacion documentada del gripper. El repositorio incluye `training_config.json` con la configuracion del objetivo de entrenamiento y `offline_metrics.json` con resumenes de evaluacion offline, pero no se detallan en la informacion disponible el numero de tokens, la composicion completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Calibracion de acciones condicionada por texto: corrige la accion del VLA base segun el enunciado de la instruccion, distinguiendo instrucciones que preservan la tarea de las que la cambian.
- Discriminacion de cambios de objeto objetivo: los casos incluidos cubren variaciones del objeto al que debe dirigirse la accion.
- Discriminacion de condiciones de ejecutabilidad: los casos incluidos cubren instrucciones que hacen la tarea ejecutable o no ejecutable.
- Deteccion de variacion de nuisance con preservacion semantica: el auxiliar con compuerta de evidencia se activa solo cuando la semantica se mantiene.
- Correccion acotada: la salida es una modificacion limitada de la accion base, no una politica generativa autonoma.
- Inferencia en CPU para el adaptador: `example.py` carga el adaptador y calcula acciones calibradas (limpias, de control y con instruccion cambiada) sobre un registro de held-out.
- Integracion en pipelines de investigacion: tripletas alineadas, splits a nivel de demostracion y metadatos de alineacion de arrays en `data/manifest.json`.
- Sin soporte declarado de tool calling, function calling, agentes multi-paso, vision generativa, audio ni modo de razonamiento explicito: el alcance es la calibracion de acciones en manipulacion.

## Casos de uso

- Calibracion de una politica OpenVLA ya entrenada en tareas de mesa: se mantiene el carrier de 7B congelado y se acopla el adaptador para que instrucciones semanticamente distintas sobre la misma observacion produzcan acciones diferenciadas, sin reentrenar el VLA.
- Desambiguacion de instrucciones en lenguaje natural dentro de un pipeline de manipulacion: ante dos ordenes que comparten escena pero cambian el objeto objetivo, el adaptador corrige la accion del carrier usando el vector bag-of-words de la instruccion.
- Gating de instrucciones no ejecutables: en lugar de ejecutar una orden cuya condicion de ejecutabilidad no se cumple, la calibracion desplaza la accion hacia el comportamiento coherente con la instruccion original.
- Investigacion en adaptacion paramétricamente eficiente: sirve como baseline reproducible para estudiar adaptadores residuales sobre VLAs, con tripletas y splits ya fijados y un ejemplo ejecutable en CPU.
- Ablaciones de robustez semantica: la estructura clean / control / changed-instruction permite medir por separado el efecto de cambios de apariencia y de cambios de semantica en la accion final.
- Validacion de convenciones y reproducibilidad de acciones: el paquete incluye estadisticas de normalizacion, transformacion del gripper e identificador de espacio de acciones, lo que permite auditar como se construyeron las acciones congeladas antes de integrar el adaptador.
- Prototipado sin GPU: el ejemplo oficial se ejecuta en CPU sobre un registro held-out, util para verificar la integracion del adaptador antes de desplegar el carrier completo en GPU.
- Formacion y divulgacion tecnica: los ficheros de escenas BDDL, estados de simulador y observaciones permiten reproducir el escenario LIBERO-10 en un entorno educativo controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `offline_metrics.json` como resumen de evaluacion offline y `training_config.json`, pero las cifras concretas no se recogen en la model card ni en los resultados de busqueda consultados, por lo que no se presentan numeros.

| Artefacto disponible | Contenido declarado | Resultados numericos |
|---|---|---|
| `offline_metrics.json` | Resumenes de evaluacion offline del adaptador | No disponibles en la informacion proporcionada |
| `training_config.json` | Configuracion del objetivo de entrenamiento | No disponibles |
| `data/triplets.json` | Tripletas emparejadas, acciones expertas y splits por demostracion | Recuentos no disponibles |
| `normalization/` | Estadisticas de accion y su procedencia | Valores no disponibles |

## Requisitos de hardware

- Adaptador residual: pesos ligeros (el repo ocupa 0.0 GB) y el ejemplo oficial funciona en CPU; no requiere GPU para aplicarse a un registro ya calculado.
- Carrier OpenVLA-7B: hay que obtener los pesos por separado del repositorio upstream. Como estimacion de orden de magnitud para 7B en bf16, solo pesos ≈ 14 GB; con cache de vision y activaciones, un despliegue comodo se situa en el rango de 16-24 GB de VRAM (estimacion, no dato publicado).
- GPU recomendadas (estimacion): A100 40 GB u 80 GB y H100 para lotes y evaluacion a escala; L40S 48 GB o RTX 4090 24 GB para inferencia en bf16 de una sola muestra.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB o RTX 3090 24 GB en bf16, siempre que se ajusten el lote y la resolucion de vision (estimacion; no verificado en la informacion disponible).
- Cuantizacion: no se documentan pesos cuantizados ni recetas GGUF/AWQ/GPTQ para este adaptador; ademas, el adaptador espera acciones producidas por el carrier en su convencion exacta, por lo que cambiar la precision del carrier exige revalidar esa convencion.
- Opciones de despliegue: el ejemplo incluido (`python artifacts/bas-vla/example.py`) y la clase `ResidualAdapter`; los runners de rollout de OpenPI y OpenVLA-OFT requieren adaptadores emparejados con su propio carrier y convencion de acciones, por lo que este checkpoint no es directamente intercambiable.
- Servidores de inferencia de texto (vLLM, TGI, Ollama) no aplican al adaptador: no es un modelo de generacion de texto servible.
- Latencia y throughput: no publicados. El coste dominante es el forward del VLA base de 7B (vision + lenguaje); la correccion del adaptador es una operacion de baja dimensionalidad sobre el vector de accion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAS-VLA (esta ficha) | Carrier 7B congelado + adaptador de tamano no disponible | No disponible | Adaptador residual de calibracion semantica de acciones sobre OpenVLA | MIT | Pesos del adaptador, datos y ejemplo en HuggingFace |
| OpenVLA-7B (`openvla/openvla-7b`) | 7B | No disponible en esta informacion | VLA completo entrenado para manipulacion; actua como carrier congelado de BAS-VLA | No disponible en esta informacion | Repositorio upstream de OpenVLA |
| OpenVLA-OFT LIBERO-10 (`moojink/openvla-7b-oft-finetuned-libero-10`) | 7B | No disponible en esta informacion | Fine-tuning de OpenVLA sobre LIBERO-10; fuente de las estadisticas `libero_10_no_noops` usadas por BAS-VLA | No disponible en esta informacion (aviso MIT referenciado en BAS-VLA) | Repositorio upstream |
| Politicas servidas con OpenPI | No disponible | No disponible | Runners de rollout citados por el codigo de BAS-VLA, con convenciones de accion propias | No disponible en esta informacion | Repositorio de codigo del proyecto |

La diferencia funcional frente a las alternativas no es de escala sino de rol: OpenVLA-7B y OpenVLA-OFT son politicas completas, mientras que BAS-VLA es un modulo de correccion que necesita uno de esos carriers y su convencion de acciones exacta para operar. No se dispone de datos de rendimiento comparado que permitan ordenar estas opciones por calidad.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere los pesos del carrier `openvla/openvla-7b` obtenidos por separado y no sustituye al VLA base en ningun caso.
- Acoplamiento estricto a la convencion de acciones: el identificador `openvla_libero10_unnormalized_sign_gripper_offline`, las estadisticas `libero_10_no_noops` y la transformacion del gripper deben respetarse exactamente; los runners de OpenPI y OpenVLA-OFT exigen adaptadores emparejados con su propio carrier.
- Alcance limitado al escenario offline de LIBERO-10: simulacion de manipulacion de sobremesa; no hay evidencia en la informacion disponible de validacion en robots reales ni en otros benchmarks.
- Cobertura semantica restringida por el vocabulario: las caracteristicas de instruccion son bag-of-words binario, lo que limita la generalizacion a formulaciones fuera del vocabulario y pierde estructura composicional del lenguaje.
- Correccion acotada: por diseno el adaptador no puede producir cambios arbitrarios de accion; si el carrier esta muy desviado, la correccion disponible puede ser insuficiente.
- Idioma: solo ingles; no se declara soporte multiligue.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible. Al tratarse de un modulo de correccion de acciones de baja dimension, el riesgo relevante no es textual sino de calibracion erronea que desplace la accion fuera del comportamiento seguro.
- Evaluacion incompleta: `offline_metrics.json` existe pero no se publican cifras en la model card; no hay comparacion numerica con el carrier sin adaptar.
- Adopcion practica nula por ahora: 0 descargas y 0 likes en el momento de la consulta; repositorio creado y actualizado el 2026-10-17.
- Licencia: contribuciones bajo MIT, permisiva para uso comercial, pero los datos derivados de LIBERO y las estadisticas de OpenVLA-OFT mantienen avisos upstream que deben conservarse; conviene revisar `NOTICE.md` y `licenses/` antes de redistribuir.
- Fecha del articulo y del checkpoint (2026) posterior al conocimiento habitual de muchos stacks: verificar disponibilidad de dependencias del repositorio de codigo antes de integrar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shuaijun/BAS-VLA
- Articulo (abstract): https://arxiv.org/abs/2609.23650
- Articulo (PDF): https://arxiv.org/pdf/2609.23650v1
- Pagina del proyecto: https://nebulis-lab.com/BAS-VLA/
- Codigo: https://github.com/NEBULIS-Lab/BAS-VLA
- Poster en NeurIPS 2026: https://neurips.cc/virtual/2026/poster/150087
- Pagina del autor: https://shuaijun-liu.github.io/
- Carrier base: https://huggingface.co/openvla/openvla-7b
- Fuente de las estadisticas de normalizacion: https://huggingface.co/moojink/openvla-7b-oft-finetuned-libero-10
