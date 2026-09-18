# daisy-zzz/policyweave-piper

## Resumen

PolicyWeave Piper es un banco de pesos de inferencia para robotica publicado por el usuario daisy-zzz bajo el identificador `daisy-zzz/policyweave-piper`. No es un modelo de lenguaje: se trata de un conjunto de adaptadores LoRA y metadatos de normalizacion asociados a la rama Piper del proyecto PolicyWeave, construidos sobre pesos derivados de GR00T. El repositorio se presenta como una release privada y escalonada, inicializada antes de que el banco completo de expertos este disponible.

El repositorio esta pensado para alojar una base compartida adaptada a Piper (`shared_base/`) y cuatro expertos de manipulacion: `adjust_bottle`, `stack_block`, `press_button` y `place_cup`. Cada experto contiene unicamente su adaptador de inferencia verificado de 10000 pasos, su configuracion y los metadatos de normalizacion compartidos. El documento `manifest.json` se declara como el registro autoritativo de disponibilidad, de modo que una entrada pendiente no implica que existan pesos utilizables.

Su relevancia actual es acotada y muy experimental: se distribuye como material de investigacion para manipulacion robotica con un brazo Piper, admite varias estrategias de combinacion de expertos (inferencia individual, `dynamic_merge`, WA, Core+TIES, Core+TSV y Core+ISO) y exige verificacion criptografica de cada archivo descargado contra un manifiesto SHA256. El repositorio ocupa 7,6 GB, no declara licencia y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre una base compartida derivada de GR00T (politica vision-language-action para robotica); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de texto; consume observaciones de camara y estado del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los pesos subyacentes de GR00T quedan sujetos a sus terminos de origen) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,6 GB |
| Libreria declarada | policyweave |
| Pipeline | robotics |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su naturaleza de politica robotica basada en GR00T y del uso de adaptadores LoRA. La estructura prevista del repositorio separa una base compartida adaptada a Piper (`shared_base/`) de los expertos especializados (`experts/adjust_bottle/`, `experts/stack_block/`, `experts/press_button/`, `experts/place_cup/`). Cada experto corresponde a un adaptador de inferencia verificado de 10000 pasos, acompanado de su configuracion y de metadatos de normalizacion compartidos. La base compartida adaptada a Piper se publica por separado y es un requisito para usar el banco.

No se distribuyen estados del optimizador, demostraciones en bruto, registros de entrenamiento ni rutas locales de las maquinas de entrenamiento. Tampoco se incluye un checkpoint conjunto entrenado en cotraining, salvo que se anada explicitamente en una release futura; la base compartida no es un modelo de cotraining. El banco admite inferencia individual de cada experto y varias tecnicas de combinacion: `dynamic_merge`, WA, Core+TIES, Core+TSV y Core+ISO. La composicion del dataset de entrenamiento, el numero de tokens o episodios y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de acciones de manipulacion para un brazo robotico: acciones absolutas de 7D para articulaciones y pinza, en configuracion de un solo brazo.
- Ejecucion de politicas especializadas por tarea mediante los cuatro expertos previstos: ajuste de botella, apilado de bloques, pulsado de botones y colocacion de taza.
- Entrada visual: el uso requiere un mapeo de camaras verificado, lo que implica consumo de observaciones de camara ademas del estado del robot.
- Composicion de politicas: soporte de inferencia individual, `dynamic_merge`, WA, Core+TIES, Core+TSV y Core+ISO para combinar expertos.
- Verificacion de integridad de pesos: descarga y comprobacion SHA256 contra un manifiesto fijado a una unica revision del repositorio.
- Ejecucion en modo seco (`dry-run`) por defecto, orientada a validacion previa a la ejecucion fisica.
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling, agentes multi-paso, audio ni modo de pensamiento. No es un modelo conversacional ni multilingue.

## Casos de uso

- Ajuste de botellas en linea de manipulacion: el experto `adjust_bottle` permitiria reorientar o recolocar una botella con el brazo Piper antes de una operacion posterior, siempre que se hayan verificado el mapeo de camaras, las unidades y los limites fisicos del robot.
- Apilado de bloques para investigacion en ensamblaje: el experto `stack_block` se usaria para tareas de apilamiento repetitivo en laboratorio, con ejecucion en `dry-run` hasta validar la politica.
- Pulsado de botones en paneles o interfaces fisicas: el experto `press_button` es adecuado para tareas de accion puntual sobre un panel, un escenario tipico de automatizacion de banco de pruebas.
- Colocacion de una taza o recipiente: el experto `place_cup` serviria para depositar objetos en una posicion objetivo, una habilidad base en tareas de pick-and-place.
- Composicion de habilidades mediante mezcla de expertos: un investigador podria combinar los adaptadores con `dynamic_merge`, WA, Core+TIES, Core+TSV o Core+ISO para estudiar si una politica combinada cubre secuencias que ningun experto resuelve por separado.
- Evaluacion reproducible de tecnicas de merging en robotica: el manifiesto SHA256 fijado a una revision permite reproducir exactamente el mismo conjunto de pesos en distintos laboratorios y comparar tecnicas de combinacion.
- Integracion en pipelines de investigacion sobre la rama Piper: el script `scripts/download_piper_checkpoints.py` de la rama `piper` permite automatizar la descarga autenticada y la verificacion de integridad dentro de un flujo de experimentacion.
- Base para adaptacion posterior con LoRA: la separacion entre base compartida y adaptadores facilita experimentar con nuevos adaptadores sobre la misma base adaptada a Piper, sin redistribuir los datos de entrenamiento originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de manipulacion, latencias ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se declara el tamano de parametros de la base compartida ni de los adaptadores, por lo que no puede estimarse la memoria necesaria.
- Almacenamiento: el repositorio ocupa 7,6 GB; hay que anadir el espacio de la base compartida adaptada a Piper, que se publica por separado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; depende de la base compartida, cuyo tamano no se especifica.
- Opciones de despliegue: la integracion prevista es la libreria `policyweave` y el script de descarga `scripts/download_piper_checkpoints.py` de la rama `piper`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica robotica de este tipo.
- Latencia y throughput: no disponibles.
- Requisito operativo: el acceso requiere autenticacion y la ejecucion por defecto es en modo seco, con validacion previa del mapeo de camaras, las unidades y los limites fisicos.

## Comparativa con modelos similares

No se proporcionan datos cuantitativos de modelos comparables. La unica referencia identificable en la informacion disponible es GR00T, del que derivan los pesos subyacentes y cuyos terminos de uso siguen aplicandose. A continuacion se recoge lo que puede afirmarse sin inventar cifras:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolicyWeave Piper | Objeto de esta ficha | no disponible | no aplicable | no disponible | Repositorio privado y escalonado, con descarga autenticada |
| GR00T (upstream) | Base sobre la que se construyen los adaptadores | no disponible en la informacion proporcionada | no aplicable | Sujeta a los terminos del modelo de origen | No detallada en la informacion proporcionada |
| Otras politicas de manipulacion | No se aportan datos | no disponible | no aplicable | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos experimentales: la propia model card indica que no estan certificados para operacion robotica no supervisada.
- Ejecucion en modo seco por defecto: cualquier ejecucion fisica exige validacion manual previa.
- Dependencia de una configuracion fisica correcta: las acciones absolutas de 7D para articulaciones y pinza requieren un mapeo de camaras, unidades y limites fisicos verificados; un error en cualquiera de ellos puede provocar movimientos incorrectos.
- Disponibilidad incompleta: el repositorio se inicializa antes de que el banco completo de expertos este disponible y `manifest.json` es el unico registro autoritativo; una entrada pendiente no implica pesos utilizables.
- Ausencia de checkpoint de cotraining: no se incluye un modelo entrenado conjuntamente, y la base compartida no cumple esa funcion.
- Licencia no declarada: no se especifica licencia para este repositorio, y los pesos subyacentes de GR00T siguen sujetos a sus terminos de origen, que la licencia del codigo no sustituye. Esto impide determinar si el uso comercial esta permitido.
- Sin datos de rendimiento: no hay benchmarks publicados, tasas de exito ni metricas de robustez, por lo que no puede evaluarse la calidad de las politicas.
- Riesgo de sobreajuste al entorno de recogida de datos: al tratarse de adaptadores de manipulacion sin documentacion del dataset, se desconoce su generalizacion a otras camaras, iluminaciones, objetos o brazos distintos del Piper.
- Idiomas y sesgos: no aplicable como modelo de lenguaje; no se documentan sesgos, pero tampoco se documenta ninguna evaluacion de seguridad.
- Adopcion nula registrada: cero descargas y cero valoraciones en el momento de la consulta, sin evidencia externa de uso.
- Trazabilidad limitada: la fecha de creacion indicada (2026-09-17) y la de actualizacion (2026-09-18) figuran tal cual en los metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/daisy-zzz/policyweave-piper
- Repositorio de codigo, rama Piper: https://github.com/Daisy-zzz/PolicyWeave/tree/piper
- Guia de despliegue: https://github.com/Daisy-zzz/PolicyWeave/blob/piper/docs/PIPER.md
- Script de descarga y verificacion: `scripts/download_piper_checkpoints.py` en la rama `piper` del repositorio de codigo
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; los resultados devueltos correspondian al nombre propio "Daisy" y al formato de audiolibros DAISY, sin relacion con el repositorio.
