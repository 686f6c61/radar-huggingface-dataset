# mrminjae/qwen3p6-35b-a3b-2p25bit-r112

## Resumen

Qwen3.6-35B-A3B (r112) es una cuantizacion experimental publicada por el usuario mrminjae sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) desarrollado por el equipo Qwen de Alibaba. La particularidad de esta version es una cuantizacion selectiva: unicamente los pesos de los expertos enrutados se almacenan a una media de 2,25 bits, mientras que el resto de pesos (atencion, embeddings, routers, capas densas) permanece en BF16. Los pesos se guardan ya descomprimidos en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estandar sin necesidad de kernels de cuantizacion especiales.

El checkpoint se presenta como material de investigacion interno (ID r112) y no como una version de produccion. Aunque el nombre comercial sugiere 35B de parametros totales con 3B activos, el recuento real de tensores en safetensors asciende a 67.319.436.656 parametros, lo que refleja la estructura MoE completa almacenada en el repositorio. El tamano del repo es de 134,7 GB, coherente con el almacenamiento mayoritario en BF16.

Su relevancia es doble: por un lado, permite estudiar el impacto de cuantizaciones extremas (por debajo de 3 bits) aplicadas solo a los expertos en modelos MoE; por otro, demuestra una via practica de reducir el coste de almacenamiento y memoria de un MoE grande manteniendo la compatibilidad con el ecosistema estandar. La licencia no esta declarada en el repositorio y, segun la model card, se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 67.319.436.656 (recuento real en safetensors); el nombre comercial indica 35B |
| Parametros activos | 3B segun el nombre del modelo (A3B); no verificado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,25 bits de media; resto de pesos en BF16; pesos almacenados descomprimidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; hereda la del modelo base Qwen/Qwen3.6-35B-A3B |
| Formato de pesos | safetensors (BF16), compatible con `transformers` y vLLM estandar |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que combina capacidades de texto y vision (pipeline `image-text-to-text`). La innovacion de este checkpoint no reside en el entrenamiento, sino en la compresion: solo los expertos enrutados se cuantizan a una media de 2,25 bits, mientras que el resto de la red se mantiene en BF16. Los pesos resultantes se descomprimen y almacenan como tensores BF16, por lo que la inferencia no requiere kernels de cuantizacion de bajo nivel ni cambios en el grafo del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base aplico RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla la estrategia exacta de cuantizacion (algoritmo, calibracion, granularidad por grupo o por canal) mas alla del valor medio de 2,25 bits por peso de experto. El identificador r112 sugiere una revision interna dentro de una serie de experimentos de compresion.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`).
- Procesamiento de imagen y texto de forma conjunta (`image-text-to-text`), lo que habilita tareas de descripcion de imagenes, VQA y comprension multimodal.
- Razonamiento multi-paso y uso como modelo base para agentes, heredado del modelo Qwen3.6-35B-A3B.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible, aunque es habitual en la familia Qwen; debe verificarse contra la model card del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion disponible.

## Casos de uso

- Investigacion sobre cuantizacion extrema en MoE: el checkpoint permite medir la degradacion de calidad al comprimir solo los expertos a 2,25 bits, comparando contra el modelo base en BF16 con las mismas prompts y semillas.
- Despliegue con memoria reducida en comparacion con el BF16 completo: al almacenar los expertos comprimidos, el repositorio ocupa 134,7 GB frente a lo que requeriria el modelo completo en BF16, lo que facilita su transporte y almacenamiento en entornos de investigacion.
- Prototipado de asistentes multimodales: la combinacion de texto e imagen permite construir demos de descripcion de imagenes y respuesta a preguntas visuales con `transformers` sin infraestructura especializada.
- Evaluacion de pipelines vLLM: al cargar con vLLM estandar, sirve para validar el rendimiento y la estabilidad de serving de un MoE grande con pesos descomprimidos en BF16.
- Generacion de codigo y texto tecnico: si el modelo base conserva sus capacidades, puede emplearse en tareas de autocompletado y explicacion de codigo, aunque requiere validacion empirica por la cuantizacion agresiva.
- Base para experimentos de destilacion o fine-tuning ligero: al ser un checkpoint de investigacion, es util como punto de partida para estudiar como afecta la compresion de expertos al ajuste posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos se cargan en BF16, por lo que el modelo completo en memoria ronda los 134,7 GB, lo que exige al menos 2 GPU de 80 GB (A100/H100) o una configuracion equivalente con offloading.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; en consumer, no cabe en una sola RTX 4090 (24 GB) sin offloading a CPU o sharding multi-GPU.
- Cabe en consumer GPU: no, salvo con cuantizacion adicional en runtime u offloading agresivo.
- Opciones de despliegue: `transformers` (carga directa), vLLM (soporte declarado por el autor); llama.cpp y Ollama no estan confirmados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p25bit-r112 | 67,3B (recuento real) | no disponible | hereda del base | safetensors BF16 | Expertos a 2,25 bits, checkpoint de investigacion |
| Qwen/Qwen3.6-35B-A3B | 35B nominales, 3B activos | no disponible | la del modelo base Qwen | safetensors | Modelo original sin cuantizar, referencia de calidad |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigacion interna (r112): no esta pensado como version estable ni soportada para produccion.
- La cuantizacion a 2,25 bits en los expertos puede degradar la calidad de forma no uniforme; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Aunque el nombre indica 35B, el recuento real de parametros es de 67,3B, lo que afecta a los calculos de memoria y almacenamiento.
- Licencia no declarada en el repositorio: el uso comercial queda sujeto a la licencia del modelo base Qwen/Qwen3.6-35B-A3B, que debe consultarse antes de cualquier despliegue.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue equivalente al del modelo base.
- Riesgo de alucinacion y sesgos: no evaluado en esta version; se heredan los del modelo base, pero sin datos de validacion propios.
- Longitud de contexto no documentada; no debe asumirse la del modelo base sin verificacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p25bit-r112
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
