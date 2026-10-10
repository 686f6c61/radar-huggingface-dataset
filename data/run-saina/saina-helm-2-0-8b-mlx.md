# run-saina/saina-helm-2-0.8b-MLX

## Resumen

Saina Helm 2 0.8B MLX es la compilación para Apple Silicon de run-saina/saina-helm-2-0.8b (revisión `4560fa9`), un modelo de decisión que responde preguntas tipadas devolviendo probabilidades en lugar de texto generado. Lo desarrolla run-saina y se distribuye con licencia Apache-2.0. Su función no es conversar, sino clasificar: recibe un contexto y una o varias preguntas con opciones, y emite una probabilidad por cada opción ofrecida.

La arquitectura combina un backbone transformer denso (etiquetado como `qwen3_5`) con la cabeza propietaria Helm 2, que añade una capa lineal sobre los códigos de respuesta y 16 expertos residuales pequeños con enrutado top-2. El modelo suma 752.393.024 parámetros reales (según safetensors) y su ventana de entrada admite hasta 262.144 tokens. Resuelve el problema de la clasificación zero-shot y multi-etiqueta con contexto muy largo, ejecutando todas las preguntas de una petición en una sola pasada sobre un prompt compartido.

Es relevante ahora porque permite ejecutar localmente en hardware Apple, sin GPU dedicada, tareas de enrutado y triaje con latencias de decenas de milisegundos: en un M3 Max, una petición corta tarda unos 55 ms y una de 4.000 tokens unos 0,7 s, con independencia del número de preguntas formuladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer denso (etiqueta `qwen3_5`) mas cabeza Helm 2: capa lineal sobre los codigos de respuesta y 16 expertos residuales con enrutado top-2 |
| Parametros totales | 752.393.024 (0,75 B) |
| Parametros activos | no disponible (los 16 expertos residen en la cabeza, no en el backbone; el recuento activo de la cabeza no se especifica) |
| Longitud de contexto | 262.144 tokens de entrada como maximo; las entradas mas largas se rechazan, nunca se truncan |
| Tipos de cuantizacion | Backbone en FP16 y cabeza en FP32; el autor desaconseja cuantizar mas el backbone sin volver a verificar la paridad |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (`head.safetensors` y `experts.safetensors`, ademas del backbone) |

## Arquitectura y entrenamiento

El modelo responde cada pregunta de una peticion en una unica pasada sobre un prompt compartido: el contexto y todas las preguntas, seguidas de una ranura de lectura por pregunta. En cada ranura, el estado oculto pasa por la cabeza Helm 2, formada por una capa lineal sobre los codigos de respuesta mas 16 expertos residuales pequenos, de los que se enrutan los dos mejores. La softmax sobre los codigos ofrecidos produce probabilidades de eleccion unica (que suman 1) y una sigmoid por codigo produce probabilidades multi-etiqueta independientes. Cada pregunta admite entre 2 y 588 opciones.

A diferencia de la version Helm 1 para MLX, la cabeza no es lineal, por lo que no se pliega en `lm_head`: se distribuye como archivos separados (`head.safetensors` y `experts.safetensors`) y `score.py` la ejecuta en MLX. El backbone va en FP16 (1,5 GB) y la cabeza en FP32. Respecto al runtime oficial `saina` (PyTorch FP32), las probabilidades se mantienen dentro de una desviacion de 0,0044 en las peticiones de prueba, incluidas peticiones con varias preguntas, una pregunta de 40 opciones y una entrada de 4.318 tokens. Los detalles de datos de entrenamiento, composicion del dataset y si hubo RLHF o DPO no se recogen en esta model card; remiten a la ficha del modelo principal.

## Capacidades

- Clasificacion de texto zero-shot: asigna probabilidades a opciones definidas en tiempo de inferencia, sin reentrenamiento.
- Clasificacion multi-etiqueta: cada opcion recibe una probabilidad independiente mediante sigmoid.
- Clasificacion de eleccion unica: distribucion softmax que suma 1 sobre las opciones ofrecidas.
- Multiples preguntas por peticion resueltas en una sola pasada sobre un prompt compartido.
- Preguntas de hasta 588 opciones y contexto de entrada de hasta 262.144 tokens.
- Modelo de decision, no generativo: no produce texto libre.
- Sin soporte declarado de tool calling, agentes, razonamiento multi-paso, codigo, matematicas, vision ni audio.
- Solo ingles.

## Casos de uso

- Enrutado de intencion en atencion al cliente: clasificar un mensaje entrante entre equipos (facturacion, soporte tecnico, envios) con probabilidades que permiten fijar umbrales y derivar el resto a revision humana.
- Triaje de tickets: asignar categoria y prioridad mediante preguntas multi-etiqueta sobre el mismo texto, aprovechando que varias preguntas se resuelven en una unica pasada.
- Preseleccion de herramientas para agentes: dada una consulta, puntuar un conjunto de herramientas candidatas y quedarse con las mas probables antes de invocar un LLM.
- Clasificacion de documentos largos: gracias a la ventana de 262.144 tokens, permite etiquetar contratos, informes o hilos completos sin truncar ni trocear.
- Listas de verificacion de revision: comprobar de forma multi-etiqueta si un texto cumple varios criterios editoriales o de calidad simultaneamente.
- Categorizacion de encuestas y feedback: distribuir respuestas abiertas en temas mediante clasificacion zero-shot con opciones definidas por el equipo.
- Enrutado de correo o formularios: dirigir mensajes a colas internas segun probabilidad, con umbrales calibrados sobre datos propios.
- Filtrado previo en pipelines de ML: descartar o priorizar muestras antes de pasarlas a modelos mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, GLUE u otros) en la informacion disponible. El unico dato de rendimiento declarado es la paridad frente al runtime oficial `saina`: con el backbone en FP16 y la cabeza en FP32, las probabilidades se mantienen dentro de una desviacion de 0,0044 sobre las peticiones de prueba, incluida una entrada de 4.318 tokens y una pregunta de 40 opciones.

## Requisitos de hardware

- Exclusivo para Apple Silicon: requiere MLX y `mlx-lm` 0.32 o posterior; no hay soporte para CUDA ni ROCm.
- Peso del backbone en FP16: 1,5 GB, mas la cabeza en FP32; el repositorio completo ocupa 1,5 GB.
- Encaja en equipos Apple con memoria unificada suficiente para cargar el modelo y sus estados; no requiere GPU dedicada.
- Latencias medidas en un M3 Max: peticion corta en torno a 55 ms y peticion de 4.000 tokens en torno a 0,7 s, con independencia del numero de preguntas.
- Despliegue mediante `mlx-lm` y el script `score.py` incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan cifras de throughput en tokens por segundo (el modelo no genera texto).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saina-helm-2-0.8b-MLX | Clasificador de decision zero-shot y multi-etiqueta | 752.393.024 | 262.144 tokens | Apache-2.0 | MLX (Apple Silicon) |
| ModernBERT-base | Encoder de clasificacion | no disponible | no disponible | Apache-2.0 | PyTorch, safetensors |
| DeBERTa-v3-base | Encoder de clasificacion | no disponible | no disponible | MIT | PyTorch, safetensors |
| facebook/bart-large-mnli | Clasificacion zero-shot via NLI | no disponible | no disponible | MIT | PyTorch, safetensors |

Nota: los modelos comparables son aproximaciones de categoria; no se dispone de datos de rendimiento equivalentes para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las probabilidades no estan calibradas: hay que validar con datos etiquetados propios y fijar los umbrales en ese conjunto.
- Uso previsto para decisiones recuperables o revisadas (enrutado de intencion, triaje, preseleccion de herramientas, listas de revision); no para filtrado de seguridad ni para decisiones sobre personas.
- Modelo exclusivamente en ingles.
- No es generativo: no produce texto ni mantiene conversaciones.
- El script `score.py` construye el prompt exacto con el que se entreno Helm 2; si se construyen prompts manualmente deben ser identicos byte a byte o las probabilidades se desvian.
- No cuantizar mas el backbone sin volver a verificar la paridad, porque la cabeza lee directamente sus estados ocultos.
- Las entradas de mas de 262.144 tokens se rechazan, no se truncan.
- Dependencia de hardware Apple Silicon por el uso de MLX.
- Los terminos de las fuentes de datos de entrenamiento son los que figuren en la ficha del modelo principal y pueden imponer condiciones adicionales.
- Riesgo de sesgos: no documentado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/run-saina/saina-helm-2-0.8b-MLX
- Modelo base: https://huggingface.co/run-saina/saina-helm-2-0.8b
- Version anterior: https://huggingface.co/run-saina/saina-helm-0.8b-MLX
- Paquete `saina` en PyPI: https://pypi.org/project/saina/
- API alojada: https://saina.run
