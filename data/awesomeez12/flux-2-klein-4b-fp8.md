# AwesomeEZ12/FLUX.2-klein-4B-fp8

## Resumen

FLUX.2-klein-4B-fp8 (repositorio `AwesomeEZ12/FLUX.2-klein-4B-fp8`) es una conversion a float8 de los pesos del modelo de difusion FLUX.2 [klein] 4B de Black Forest Labs. No se ha entrenado ni ajustado nada: el autor ha convertido a float8 (e4m3fn) las capas lineales grandes del transformer y del text encoder, ha vuelto a fragmentar los pesos (re-sharding) y ha mantenido en bfloat16 las capas de normalizacion, embeddings, proyecciones de salida y temporales, asi como el VAE, el tokenizador, el scheduler y las configuraciones. El objetivo es reducir el peso en disco y en VRAM del modelo base, que ocupa 8,5 GB en el repositorio con 3.875.544.576 parametros.

FLUX.2 [klein] es, segun Black Forest Labs, su familia de modelos de imagen mas rapida hasta la fecha: unifica generacion y edicion en una sola arquitectura compacta y declara inferencias de extremo a extremo por debajo del segundo en configuraciones adecuadas. Esta variante concreta esta pensada para cargarse con almacenamiento en float8 y computo en bfloat16, por ejemplo mediante `apply_layerwise_casting` de diffusers.

La relevancia practica de esta ficha es doble: por un lado, permite ejecutar un modelo de edicion de imagen de ultima generacion en hardware mas modesto; por otro, al ser una conversion no validada (0 descargas, 0 likes y sin benchmarks publicados en la informacion disponible), conviene tratarla como un artefacto experimental y verificar la calidad frente al modelo base antes de usarla en produccion. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion latente con transformer (familia FLUX.2 [klein]); arquitectura unificada de generacion y edicion de imagen |
| Parametros totales | 3.875.544.576 (aproximadamente 3,88 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | float8 (e4m3fn) en las capas lineales grandes de `transformer/` y `text_encoder/`, sin escalado; bfloat16 en capas `norm`, `embed`, `proj_out`, `x_embedder`, `context_embedder`, `time`, `lm_head`, VAE, tokenizador, scheduler y configuraciones |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, via diffusers; incluye `mcr_fp8.json` con la configuracion exacta de la conversion |
| Tamano del repositorio | 8,5 GB |
| Pipeline | image-to-image |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia FLUX.2 [klein] de Black Forest Labs, que segun la documentacion disponible unifica generacion de imagen y edicion en una unica arquitectura compacta, con inferencia de extremo a extremo en menos de un segundo en configuraciones optimizadas. Esta variante es una copia modificada: las capas lineales grandes del transformer y del text encoder se han convertido de bfloat16 a float8 (e4m3fn) sin escalado y se han vuelto a fragmentar. Las capas de normalizacion, embeddings, `proj_out`, `x_embedder`, `context_embedder`, `time` y `lm_head` permanecen en bfloat16, igual que el VAE, el tokenizador, el scheduler y los ficheros de configuracion.

No se ha entrenado ni afinado ningun peso en esta conversion. El autor indica que las capas deben cargarse con almacenamiento en float8 y computo en bfloat16, por ejemplo con `apply_layerwise_casting` de diffusers, tal como hace Minecraft Clip Radar's Thumbnail Lab. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO del modelo original, y tampoco sobre innovaciones adicionales de decodificacion o atencion. El unico detalle de conversion documentado es el reparto de capas en float8 frente a bfloat16 descrito arriba.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), heredada del modelo base FLUX.2 [klein] 4B.
- Edicion de imagenes guiada por instrucciones (image-to-image), que es el pipeline declarado en el repositorio.
- Arquitectura unificada: el modelo base integra generacion y edicion en un mismo modelo, sin necesidad de pipelines separados.
- Inferencia rapida: Black Forest Labs declara tiempos de extremo a extremo por debajo del segundo para la familia [klein] en configuraciones adecuadas.
- Ejecucion con pesos en float8 y computo en bfloat16, lo que reduce el espacio de almacenamiento y permite cargar el modelo en GPUs con menos memoria que el base en bfloat16.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas para las instrucciones de texto.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.

## Casos de uso

- Edicion de imagenes por instruccion en herramientas de diseno: el pipeline image-to-image permite enviar una imagen y una indicacion de texto para modificar estilo, iluminacion o elementos, integrándose en editores graficos o plugins internos.
- Generacion de miniaturas y assets para creadores de contenido: el autor cita expresamente su uso en Minecraft Clip Radar's Thumbnail Lab, donde la velocidad de la familia [klein] resulta adecuada para producir miniaturas de forma casi interactiva.
- Prototipado rapido en diseno de producto: al declarar inferencias de menos de un segundo, permite iterar variaciones visuales en sesiones de trabajo en vivo sin esperas perceptibles.
- Aumento de datos para entrenar modelos de vision: generar variaciones editadas de un conjunto de imagenes semilla para ampliar datasets de clasificacion o deteccion, verificando manualmente la calidad resultante.
- Integracion en flujos de ComfyUI: los tutoriales disponibles describen el despliegue local del modelo base en ComfyUI, por lo que esta version float8 puede cargarse como nodo de generacion o edicion en dichos grafos.
- Despliegue en hardware de gama media: con un repositorio de 8,5 GB y pesos lineales en float8, es un candidato para estaciones con GPU de 12-16 GB que no pueden ejecutar variantes mayores en bfloat16.
- Publicacion de contenido asistida y retoque fotografico: reemplazo de fondos, cambios de estilo o correccion de detalles sobre fotografias, siempre con supervision humana por el riesgo de artefactos.
- Servicios de inferencia internos de baja latencia: al reducir el coste por peticion, encaja en APIs internas de generacion de imagenes donde el throughput importa mas que la maxima fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas de calidad (FID, CLIP score, evaluaciones de edicion) ni comparaciones frente al modelo base en bfloat16, y no se han proporcionado numeros de latencia o throughput medidos para esta conversion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del recuento de parametros (3,88 mil millones) y del tamano del repositorio (8,5 GB), los pesos lineales en float8 ocupan aproximadamente 3,9 GB, a lo que hay que sumar las capas en bfloat16, el VAE y las activaciones. Con carga por capas (`apply_layerwise_casting`) el pico de memoria es menor; como referencia practica, se recomienda un minimo de 10-12 GB de VRAM y 16 GB o mas para trabajar con comodidad.
- GPU recomendadas: NVIDIA RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 en el ambito de consumo; A100 o H100 para despliegues con batching y varias peticiones simultaneas.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM. En tarjetas de 8 GB la carga completa resulta ajustada y no hay datos publicados que confirmen su funcionamiento.
- Opciones de despliegue: diffusers (libreria declarada en el repositorio, requisito para la carga con float8 y computo bfloat16), ComfyUI segun los tutoriales disponibles para el modelo base, y NVIDIA NIM para el modelo base FLUX.2 [klein] 4B. No se ha confirmado soporte especifico de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: Black Forest Labs declara inferencias de extremo a extremo por debajo de un segundo para la familia [klein], pero no se han publicado mediciones especificas para esta conversion ni por modelo de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| AwesomeEZ12/FLUX.2-klein-4B-fp8 (este) | 3.875.544.576 | safetensors, float8 e4m3fn sin escalado + bfloat16 | apache-2.0 | Conversion no oficial, sin entrenamiento adicional, 0 descargas y sin benchmarks publicados |
| black-forest-labs/FLUX.2-klein-4B (base) | No disponible (familia 4B) | safetensors, bfloat16 | apache-2.0 | Modelo original de Black Forest Labs; arquitectura unificada de generacion y edicion |
| black-forest-labs/FLUX.2-klein-4b-fp8 | No disponible (familia 4B) | safetensors, float8 | No disponible en la busqueda (se asume la del modelo base, apache-2.0) | Conversion fp8 publicada por el propio desarrollador del modelo base |
| enrypiff/FLUX.2-klein-4b-fp8 | No disponible (familia 4B) | safetensors, float8 | No disponible en la busqueda | Otra conversion fp8 de la misma familia; detalles de la conversion no disponibles |

## Limitaciones y advertencias

- La conversion a float8 se ha realizado sin escalado (no scaling), lo que puede degradar la fidelidad numerica de las capas lineales grandes; no se han publicado evaluaciones comparativas frente al modelo base en bfloat16.
- Los pesos no han sido entrenados ni afinados; cualquier limitacion del modelo base se hereda, incluidas las posibles alucinaciones visuales o la generacion de detalles anatomicos, tipograficos o geometricos incorrectos que son habituales en modelos de difusion.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia de la comunidad sobre su calidad o estabilidad en produccion.
- Requiere cargar las capas con almacenamiento float8 y computo bfloat16 (por ejemplo, `apply_layerwise_casting` de diffusers); cargarlo de otra forma puede fallar o producir resultados incorrectos.
- No se declaran idiomas soportados ni longitud de contexto, de modo que no hay garantias documentadas sobre el comportamiento con instrucciones en castellano.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar el aviso de licencia y el fichero `LICENSE.md`; el modelo base es propiedad de Black Forest Labs y este repositorio es una copia modificada no oficial.
- Al ser un modelo de imagen, no ofrece tool calling, agentes ni razonamiento multi-paso; no debe evaluarse con los criterios habituales de un LLM.
- Para uso en produccion se recomienda comparar cualitativamente los resultados frente a `black-forest-labs/FLUX.2-klein-4b-fp8` y frente al modelo base antes de adoptarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AwesomeEZ12/FLUX.2-klein-4B-fp8
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Version fp8 oficial de Black Forest Labs: https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8
- Otra conversion fp8 de la comunidad: https://huggingface.co/enrypiff/FLUX.2-klein-4b-fp8
- Ficha del modelo en NVIDIA NIM: https://build.nvidia.com/black-forest-labs/flux_2-klein-4b/modelcard
- Tutorial de despliegue en ComfyUI: https://aiindigo.com/tutorials/getting-started-with-flux-2-klein-4b-high-fidelity-art-at-lightning-speed
- Resumen y casos de uso del modelo fp8: https://www.aimodels.fyi/models/huggingFace/flux.2-klein-4b-fp8-black-forest-labs
- Paper de tecnicas de compresion citado en la ficha anterior (nanoflux-distillation-driven-compression-large-text-image): sin enlace directo disponible en los resultados de busqueda
