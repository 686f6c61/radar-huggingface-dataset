# intel-ai/Qwen3.5-397B-A17B-FP8-2L-vLLM-SGLang

## Resumen

Qwen3.5-397B-A17B-FP8-2L-vLLM-SGLang es un checkpoint derivado del modelo Qwen3.5-397B-A17B-FP8 de Alibaba Qwen, publicado por el equipo intel-ai dentro de un conjunto denominado "Reduced Models". Se trata de una variante con reduccion de capas (configuracion "2L") del modelo original, cuantizada en FP8, y empaquetada especificamente para su despliegue en runtimes tipo vLLM y SGLang. El modelo conserva la identificacion arquitectonica `qwen3_5_moe`, lo que indica que el modelo base es un transformer con mezcla de expertos (MoE).

El dato mas relevante es la discrepancia entre el nombre del repositorio (que sugiere 397.000 millones de parametros totales y 17.000 millones activos, heredado del modelo base) y el recuento real de parametros de los pesos publicados en safetensors: 21.828.570.368 parametros. Esta reduccion es coherente con la eliminacion de capas del checkpoint original y confirma que no se trata del modelo completo, sino de una version recortada orientada a pruebas de despliegue.

Su interes practico es acotado: sirve para validar flujos de inferencia en vLLM/SGLang con pesos FP8 y para experimentar con la infraestructura de despliegue, no como sustituto funcional del modelo base. El propio autor advierte de que la calidad de salida puede ser deficiente en algunas peticiones, un problema conocido y asumido en esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun tag `qwen3_5_moe`; checkpoint reducido a 2 capas |
| Parametros totales | 21.828.570.368 (recuento real en safetensors); el nombre del repo hace referencia a 397B del modelo base |
| Parametros activos | no disponible (el modelo base se denomina A17B, pero no se confirma en la informacion proporcionada para esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria declarada: vLLM) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 en su variante MoE de 397B parametros totales y 17B activos (denominacion A17B), cuantizada originalmente en FP8 por el equipo Qwen. Sobre ese checkpoint, intel-ai ha generado una variante "reduced-model" con configuracion de 2 capas (2L), es decir, un recorte profundo de la red que reduce drasticamente el numero de parametros efectivos hasta los 21.828 millones registrados en los safetensors.

No se dispone de informacion sobre el proceso de entrenamiento, la composicion del dataset, el numero de tokens vistos ni si hubo etapas de RLHF, DPO o ajuste fino adicional. Tampoco se documentan innovaciones tecnicas propias de esta variante mas alla del propio proceso de reduccion de capas y la preservacion del formato FP8 para su carga en vLLM y SGLang. El repositorio no incluye resultados de validacion mas alla de la verificacion de que el flujo de inferencia en vLLM funciona.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con tag `conversational`, heredado del modelo base.
- Carga en vLLM: validado explicitamente en el flujo de inferencia de vLLM segun la model card.
- Compatibilidad con SGLang: el nombre del repositorio lo orienta a despliegue en SGLang, aunque la validacion documentada solo menciona vLLM.
- Pesos en FP8: permite evaluar kernels y rutas de computo en precision reducida.
- Capacidades del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue): no verificables en esta variante reducida; la propia model card advierte de salidas degradadas.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Validacion de pipelines de despliegue en vLLM: usar el checkpoint para comprobar que la configuracion de servidor, el parseo de safetensors FP8 y la ruta de generacion funcionan antes de mover el modelo completo a produccion.
- Pruebas de integracion con SGLang: dado que el repo esta etiquetado para SGLang, sirve para verificar compatibilidad de carga y API en ese runtime con un peso manejable de 48,2 GB de repositorio.
- Benchmarking de infraestructura: medir latencia de arranque, consumo de VRAM y throughput de un checkpoint FP8 reducido para calibrar el dimensionamiento de nodos antes de desplegar modelos mayores.
- CI/CD de aplicaciones LLM: emplear esta variante ligera como modelo de sustitucion en tests automatizados de pipelines de generacion, evitando cargar el modelo completo en cada ejecucion.
- Desarrollo de harnesses de evaluacion: probar frameworks de evaluacion y utilidades de tokenizacion o chat templates sobre una arquitectura Qwen3.5 MoE sin incurrir en el coste del modelo original.
- Investigacion sobre reduccion de capas: analizar el impacto de recortar profundidad en un MoE comparando salidas con el checkpoint base, como estudio de degradacion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 suman aproximadamente 21,8 GB (21.828.570.368 parametros a 1 byte por parametro), mas overhead de activaciones, cache KV y buffers del runtime; el tamano del repo es de 48,2 GB, por lo que conviene reservar espacio en disco acorde.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano de pesos, una GPU con 24 GB o mas de VRAM es el minimo razonable para cargar el checkpoint FP8, y configuraciones con mayor memoria permiten contextos y lotes mayores.
- GPU de consumo: el checkpoint FP8 de ~22 GB encaja teoricamente en tarjetas de 24 GB, aunque la informacion proporcionada no confirma compatibilidad ni rendimiento en ese hardware.
- Opciones de despliegue: vLLM (validado por el autor) y SGLang (objetivo declarado en el nombre del repo). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-FP8-2L-vLLM-SGLang | 21,8B reales (checkpoint reducido a 2 capas) | no disponible | no disponible | safetensors FP8 | Variante reducida para pruebas de despliegue; salidas potencialmente degradadas |
| Qwen/Qwen3.5-397B-A17B-FP8 | 397B totales / 17B activos (MoE) | no disponible | no disponible | safetensors FP8 | Modelo base completo; requiere mucha mas memoria y no esta pensado como checkpoint de pruebas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre otros modelos comparables en la documentacion facilitada |

## Limitaciones y advertencias

- Calidad de salida degradada: la model card indica explicitamente que el texto generado puede aparecer corrupto o incoherente en algunas peticiones y que se trata de un problema conocido.
- No es un sustituto del modelo base: el recorte a 2 capas altera profundamente la capacidad del modelo; no debe usarse para tareas de produccion que requieran calidad real.
- Recuento de parametros divergente del nombre: el identificador del repo sugiere 397B/A17B, pero los pesos contienen 21,8B parametros, lo que puede inducir a error en el dimensionamiento.
- Licencia no declarada: no se especifica licencia en la informacion disponible, por lo que el uso comercial queda sin marco claro y debe consultarse la licencia del modelo base Qwen3.5-397B-A17B-FP8.
- Idiomas no documentados: no hay lista de idiomas soportados para esta variante.
- Sesgos y alucinaciones: no hay evaluacion publicada; al heredar el modelo base y anadir la degradacion por reduccion de capas, el riesgo de alucinacion aumenta y no puede cuantificarse.
- Adopcion minima: 29 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras la reduccion, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-FP8-2L-vLLM-SGLang
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
- vLLM: no disponible en la informacion proporcionada
- SGLang: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
