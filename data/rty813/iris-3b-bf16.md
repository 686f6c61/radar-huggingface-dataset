# rty813/iris-3b-bf16

## Resumen

`rty813/iris-3b-bf16` es un port a precisión completa (bf16) del modelo `speridlabs/iris-3b`, publicado por el usuario rty813. El objetivo declarado es ofrecer una alternativa en `pytorch_model.bin` a la cuantización GGUF del modelo original, pensada para usuarios de vLLM, TGI, Xinference y `transformers` que prefieren pesos sin cuantizar. La model card indica que la arquitectura es idéntica a la del modelo base y que el repositorio es un reemplazo directo mediante `AutoModelForCausalLM.from_pretrained`.

El modelo base, `speridlabs/iris-3b`, se presenta como un modelo de 3.000 millones de parámetros para generación en espacio de píxeles (*pixel-space*) con flow-matching, sin VAE ni espacio latente, y como *vision foundation model* con capacidades de estimación de profundidad, restauración de imagen y superresolución. Es decir, el modelo original se etiqueta como `text-to-image` y `diffusion`, mientras que este port se publica bajo `pipeline_tag: text-generation` y con etiquetas como `lfm2_vl` e `image-text-to-text`.

Esa discrepancia entre los metadatos del port y la model card del original es el punto más relevante de esta ficha: no hay confirmación de que los pesos estén efectivamente subidos (tamaño de repositorio 0,0 GB, 0 descargas) ni de que la arquitectura declarada en los tags coincida con la del modelo base. Cualquier evaluación en producción debería verificarse contra los pesos reales antes de darla por válida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con certeza. La model card del modelo base describe difusion en espacio de pixeles con flow-matching; los tags del port indican `lfm2_vl`. Metadatos contradictorios |
| Parametros totales | ~3.000 millones (3B), segun el nombre del modelo y la model card del modelo base |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio distribuye pesos en bf16 (precision completa). La model card menciona una cuantizacion GGUF del modelo original como alternativa, sin detallar niveles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (bf16); conversion a safetensors indicada como "en proceso" |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion propia sobre arquitectura o entrenamiento: afirma explicitamente que la arquitectura es "identica al original" y remite a `speridlabs/iris-3b`. Segun la model card de ese modelo base, se trata de un modelo de difusion que genera directamente en espacio de píxeles mediante flow-matching, sin VAE ni representacion latente intermedia, con variantes afinadas para estimacion de profundidad, restauracion de imagenes y superresolucion. El numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no se detallan en la informacion proporcionada.

Los tags del port (`lfm2_vl`, `image-text-to-text`, `custom_code`, `text-generation`) apuntan a una arquitectura de tipo vision-language con codigo personalizado, lo que no encaja con la descripcion de difusion en espacio de píxeles del modelo base. Esta contradiccion no se resuelve en la documentacion disponible. Se referencia el paper arXiv:2610.09450 y la pagina de proyecto de Sperid Labs como fuentes tecnicas, pero su contenido no forma parte de la informacion suministrada.

## Capacidades

- Generacion de texto: el repositorio se publica con `pipeline_tag: text-generation` y es cargable mediante `transformers` y vLLM.
- Procesamiento de imagen y texto: los tags incluyen `image-text-to-text` y `lfm2_vl`, lo que sugiere entrada multimodal, aunque no se documenta en la model card.
- Generacion de imagenes en espacio de píxeles: capacidad atribuida al modelo base `speridlabs/iris-3b` (sin VAE, flow-matching).
- Estimacion de profundidad: capacidad declarada en la model card del modelo base para variantes afinadas.
- Restauracion de imagen y superresolucion: capacidades declaradas en la model card del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Inferencia sin cuantizar en servidores vLLM: el repositorio esta pensado para `vllm serve rty813/iris-3b-bf16`, de modo que equipos que necesiten evitar la perdida de precision de GGUF pueden desplegarlo directamente.
- Servicio en Xinference: la model card indica que el modelo se localiza buscando "iris-3b" en Xinference, lo que facilita su integracion en plataformas internas de despliegue de modelos.
- Comparacion de precision frente a GGUF: sirve como referencia en experimentos de evaluacion que midan la diferencia entre pesos bf16 y la cuantizacion del modelo original con las mismas entradas.
- Restauracion y mejora de imagenes: si se confirma que hereda las capacidades del modelo base, podria emplearse para tareas de restauracion y superresolucion en pipelines de tratamiento de imagen.
- Estimacion de profundidad en vision por computador: uso potencial como componente de modelos de profundidad para robotica o reconstruccion 3D, siempre que se valide contra los pesos reales.
- Fine-tuning posterior: al estar en bf16 y con licencia Apache 2.0, es un punto de partida razonable para ajuste fino sobre dominio propio, siempre que la arquitectura quede confirmada al cargar el modelo.
- Experimentacion academica con flow-matching en espacio de píxeles: util para reproducir o extender el trabajo descrito en arXiv:2610.09450.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6 GB solo para los pesos (3B parametros x 2 bytes), mas memoria para activaciones y buffer de atencion segun la longitud de secuencia, no especificada.
- Si la carga se hace en float32, la estimacion sube a unos 12 GB solo en pesos.
- GPU de centro de datos: A100 40/80 GB, H100, L40S son suficientes por capacidad de memoria, aunque no se publican cifras de throughput.
- GPU de consumo: el modelo cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que el resto del pipeline no consuma memoria adicional significativa.
- Opciones de despliegue mencionadas: vLLM, Xinference, TGI y `transformers`.
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio figura con un tamano de 0,0 GB, por lo que conviene comprobar que los pesos estan realmente disponibles antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rty813/iris-3b-bf16 | ~3B | no disponible | `pytorch_model.bin` (bf16) | Apache 2.0 | Publicado, sin descargas registradas |
| speridlabs/iris-3b | ~3B | no disponible | GGUF (segun la model card del port) | Apache 2.0 | Modelo base de referencia |
| speridlabs/iris-3b-turbo | no disponible | no disponible | no disponible | no disponible | Existe un Space de demo asociado |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Metadatos contradictorios: el port se etiqueta como `text-generation`, `image-text-to-text` y `lfm2_vl`, mientras que la model card del modelo base lo describe como difusion en espacio de píxeles. Hay que verificar la arquitectura real al cargar los pesos.
- El repositorio registra un tamano de 0,0 GB y cero descargas, lo que sugiere que los pesos podrian no estar subidos o no estar completos.
- La model card indica que la conversion a safetensors esta "en proceso"; trabajar con `pytorch_model.bin` implica depender de `torch.load` y de las precauciones de seguridad asociadas.
- No se documentan idiomas soportados, longitud de contexto ni regimen de entrenamiento.
- No hay resultados de benchmarks publicados, por lo que no es posible estimar calidad frente a alternativas.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; no hay documentacion al respecto.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el port es un trabajo de terceros sobre un modelo base; conviene revisar tambien las condiciones del repositorio original.
- El modelo base esta asociado a un paper (arXiv:2610.09450) cuyo contenido no se ha podido verificar en esta ficha.
- No se especifican requisitos de `trust_remote_code` ni el codigo personalizado que implica el tag `custom_code`; es un riesgo de seguridad a revisar antes de ejecutarlo.

## Enlaces

- Repositorio HuggingFace del port: https://huggingface.co/rty813/iris-3b-bf16
- Modelo base: https://huggingface.co/speridlabs/iris-3b
- Paper: https://arxiv.org/abs/2610.09450
- Pagina de proyecto: https://speridlabs.com/research/iris
- Repositorio de codigo: https://github.com/speridlabs/iris-3b
- Demo: https://huggingface.co/spaces/speridlabs/iris-3b
- Demo turbo: https://huggingface.co/spaces/speridlabs/iris-3b-turbo
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
