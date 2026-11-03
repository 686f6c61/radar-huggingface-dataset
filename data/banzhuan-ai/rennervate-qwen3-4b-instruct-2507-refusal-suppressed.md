# BanZhuan-AI/Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed

## Resumen

Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed es una modificacion estructural del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por BanZhuan.AI bajo el paraguas de su familia Rennervate. El modelo parte del checkpoint original de Qwen (Alibaba Cloud) y aplica una tecnica denominada Arbitrary-Rank Ablation (ARA) sobre determinadas proyecciones de salida de atencion y MLP con el objetivo de reducir la tasa de respuestas de rechazo (refusal) ante peticiones del usuario.

La arquitectura subyacente es la del Qwen3-4B-Instruct-2507 original: un transformer denso de 4.022.468.096 parametros, en formato BF16 y sin cambios en la arquitectura ni en la plantilla de chat. La modificacion se limita a la ablacion de rango arbitrario sobre pesos seleccionados, con un rango ARA de 50, cinco pasos de optimizacion y busqueda de hiperparametros sobre 100 trials completados (incluidos 30 de arranque), seleccionando el trial 82 de un frente de Pareto.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de modificacion estructural de pesos orientada a alterar el comportamiento de rechazo sin reentrenamiento completo; por otro, advierte de que las metricas publicadas son mediciones de busqueda con carga NF4 y heuristica de palabras clave, no una evaluacion de capacidades. El checkpoint final esta fusionado en BF16 y se distribuye con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), sin cambios estructurales respecto al base |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NF4 con doble cuantizacion usada en busqueda y verificacion; pesos publicados en BF16; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (heredada del modelo base, con aviso de modificacion) |
| Formato de pesos | safetensors (checkpoint fusionado BF16) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3-4B-Instruct-2507: un transformer denso de aproximadamente 4.000 millones de parametros, con atencion y capas MLP convencionales, plantilla de chat original y comportamiento no-thinking preservado. No se ha reentrenado el modelo; la intervencion consiste en una ablacion de rango arbitrario (ARA) aplicada a proyecciones de salida de atencion y MLP seleccionadas, con rango 50, cinco pasos de optimizacion, tasa de aprendizaje 1.0, L-BFGS con maximo 20 iteraciones e historial de 10, preservando las magnitudes de fila.

La busqueda de hiperparametros se realizo sobre 100 trials completados (30 de arranque), con dos objetivos: tasa de palabras clave de rechazo y divergencia KL sobre prompts benignos. Los datos empleados fueron 400 ejemplos de los splits de entrenamiento de `mlabonne/harmless_alpaca` y 400 de `mlabonne/harmful_behaviors`. La carga durante la busqueda se hizo en NF4 con doble cuantizacion; las actualizaciones seleccionadas (trial 82) se fusionaron en el checkpoint BF16 original para la release. Los parametros exactos, revisiones de dataset, semilla, ajustes de evaluacion y detalles de hardware estan en `modification_config.json`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen3-4B-Instruct-2507.
- Comportamiento no-thinking preservado mediante la plantilla de chat original.
- Razonamiento basico y explicaciones: la verificacion de recarga incluye una explicacion correcta de por que flota el hielo.
- Aritmetica simple: una de las tres pruebas de humo de la verificacion fue un problema aritmetico resuelto correctamente.
- Reduccion de rechazos: la tasa de coincidencias de palabras clave de rechazo baja de 99/100 a 7/100 en el conjunto de prueba de 100 prompts.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como una ablacion de rango arbitrario sobre pesos de proyeccion altera la tasa de rechazo manteniendo la arquitectura, util para comparar contra el checkpoint original en experimentos controlados.
- Evaluacion de tecnicas de edicion de pesos: sirve como caso practico de ARA con busqueda multiobjetivo (tasa de rechazo frente a divergencia KL), replicable a partir de `modification_config.json`.
- Experimentos de robustez conversacional: al preservar la plantilla de chat y el modo no-thinking, puede emplearse en pruebas de dialogo multi-turno donde se quiera medir el efecto de la supresion de rechazos en la coherencia.
- Pruebas de humo en hardware de consumo: la verificacion del autor se realizo en una RTX 4060 Ti de 8 GB con carga NF4, lo que lo hace util para prototipos locales de bajo presupuesto.
- Analisis de divergencia de distribuciones: la metrica KL publicada (0,0745 sobre prompts benignos) permite usar el modelo como referencia en estudios de deriva de distribucion tras edicion de pesos.
- Docencia y divulgacion: ejemplo didactico de como se modifica un checkpoint open-weight sin reentrenamiento y de los limites de las heuristicas de evaluacion (coincidencia de palabras clave).

## Benchmarks y rendimiento

| Medicion | Baseline original | Candidato seleccionado |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo en 100 prompts de prueba | 99/100 | 7/100 |
| Divergencia KL en 100 prompts benignos de prueba | 0 | 0,074507348 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son mediciones de busqueda con carga NF4, no remedidas sobre el export fusionado en precision completa, y la coincidencia de palabras clave es una heuristica textual que por si sola no establece mejor calidad de salida.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere mas de 8 GB para contexto moderado.
- VRAM estimada en NF4 con doble cuantizacion: en torno a 2,5-3 GB para pesos, viable en GPUs de 8 GB.
- GPU recomendadas: RTX 4060 Ti 8 GB (verificada por el autor con NF4), RTX 4090, A100, H100 para BF16 y contextos largos.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas usando cuantizacion NF4; en BF16 requiere GPUs de 16 GB o superiores.
- Opciones de despliegue: transformers (verificado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama y vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed | 4.022.468.096 | no disponible | ARA rango 50 sobre atencion y MLP | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.022.468.096 | no disponible | ninguna | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Otros derivados de Qwen3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (ablaciones de rechazo sobre modelos de 4B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La supresion de rechazos elimina una capa de seguridad del modelo base; no debe desplegarse en produccion orientada al publico sin filtros externos.
- Las metricas publicadas son heuristicas (coincidencia de palabras clave) y de busqueda con NF4; no se han remedido sobre el export BF16 fusionado.
- La verificacion de recarga es una prueba de humo limitada a tres prompts neutros; no constituye una evaluacion de capacidades.
- Riesgo de alucinacion y de degradacion de calidad tras la ablacion: la divergencia KL de 0,0745 indica un cambio medible en la distribucion de tokens sobre prompts benignos.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados: no disponibles; se asumen los del modelo base, sin confirmacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright original y el `MODIFICATION_NOTICE.txt`; verificar la licencia del modelo base antes de redistribuir.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por la comunidad.
- No se dispone de informacion sobre tool calling, agentes ni capacidades multimodales; no asumir su presencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed/blob/main/LICENSE
- Aviso de modificacion: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed/blob/main/MODIFICATION_NOTICE.txt
- Configuracion de modificacion: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-4B-Instruct-2507-Refusal-Suppressed/blob/main/modification_config.json
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
