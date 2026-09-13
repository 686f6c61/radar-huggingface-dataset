# fpadovani/tam-taml-10mb-after-ppt-Dp-100mb-ckpt500_seed10

## Resumen

`fpadovani/tam-taml-10mb-after-ppt-Dp-100mb-ckpt500_seed10` es un modelo de generacion de texto de pequeno tamano (39.087.104 parametros, aproximadamente 39 M) desarrollado por el usuario de HuggingFace `fpadovani`, vinculado a un proyecto de investigacion sobre tokenizadores alojado en Weights & Biases bajo la organizacion "University of Groningen". Se trata de un ajuste fino (SFT) del modelo base `fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10`, realizado con la libreria TRL de HuggingFace.

El modelo pertenece a la familia GPT-2 (etiqueta `gpt2` en los metadatos de HuggingFace) y se distribuye en formato `safetensors` con la libreria `transformers`. Su relevancia no reside en capacidades de proposito general, sino en su caracter de artefacto de investigacion: el nombre del checkpoint (`ckpt500`, `seed10`, `Dp-100mb`, `after-ppt`) sugiere una ablacion sistematica sobre tokenizacion y tamano de datos, aunque la model card no documenta estos detalles. Es un modelo pensado para reproducibilidad experimental y no para despliegue en produccion.

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni los idiomas soportados. Tampoco se han publicado resultados de benchmarks, y la licencia aparece como "no disponible" tanto en los metadatos como en la propia model card (que contiene un marcador de posicion, `licence: license`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 39.087.104 (aproximadamente 39 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia GPT-2 suele operar con 1024 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos `safetensors` sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card contiene un marcador de posicion) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10 |
| Tamano del repositorio | 1,9 GB |
| Pipeline | text-generation |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL |
| Versiones de framework | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de creacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, segun la etiqueta `gpt2` de los metadatos del repositorio. Con 39.087.104 parametros, se situa en el rango de los modelos muy pequenos (por debajo de GPT-2 small, que tiene 124 M). No hay informacion publicada sobre el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el vocabulario del tokenizador ni la longitud de contexto efectiva. El nombre del modelo (`tam-taml-10mb`) apunta a experimentos con tokenizadores alternativos y presupuestos de datos reducidos, coherente con el proyecto `new_tokenizers` visible en la URL de Weights & Biases, pero esto no esta confirmado en la documentacion.

El entrenamiento se realizo mediante SFT con TRL 0.23.0 sobre el checkpoint base `fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10`. No se documenta el dataset, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se describen innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos, SSM ni arquitecturas hibridas). El identificador `ckpt500` sugiere que se trata del checkpoint del paso 500 de un entrenamiento mas largo, y `seed10` indica que forma parte de una serie de replicas con distintas semillas, practica habitual en estudios de reproducibilidad.

## Capacidades

- Generacion de texto autoregresiva basica, en el formato de conversacion que espera el pipeline de `transformers` (lista de mensajes con rol `user`).
- Ajuste por instrucciones mediante SFT, aunque no se documenta la naturaleza ni la calidad de las instrucciones utilizadas.
- Ninguna capacidad documentada de razonamiento multi-paso, matematicas o codigo.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni de razonamiento encadenado.
- Sin capacidades multimodales (texto unicamente, segun el pipeline declarado).
- Capacidades multilingues: no disponible.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad especial.

## Casos de uso

Dado el tamano del modelo (39 M de parametros) y la ausencia de benchmarks, los casos de uso realistas son de investigacion y experimentacion, no de produccion:

- Reproducibilidad de experimentos de tokenizacion: el modelo forma parte de una serie identificada por `seed10` y `ckpt500`, por lo que sirve para comparar el efecto de distintas semillas y numero de pasos de SFT sobre un mismo corpus pequeno.
- Estudios academicos sobre ajuste supervisado: al estar entrenado con TRL 0.23.0 y publicarse las versiones exactas de las librerias, permite replicar el pipeline de SFT en un entorno controlado con requisitos de computo minimos.
- Pruebas de humo (smoke tests) de infraestructura: un modelo de 39 M cabe en CPU y permite validar pipelines de inferencia, plantillas de chat y formateo de mensajes antes de escalar a modelos grandes.
- Generacion de texto de ejemplo en demos docentes: util para ilustrar como funciona un pipeline de `text-generation` con `transformers` sin necesidad de GPU.
- Baseline en experimentos de destilacion o poda: sirve como referencia de modelo pequeno contra el que medir tecnicas de compresion.
- Investigacion sobre degradacion con pocos datos: el nombre `10mb` sugiere entrenamiento con un presupuesto de datos muy limitado, lo que lo hace adecuado para estudiar curvas de escalado en regimen de datos escasos.
- Inferencia en entornos embebidos o de muy bajos recursos: con menos de 160 MB en fp32, puede ejecutarse en dispositivos sin GPU dedicada, aunque la calidad del texto sera limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web no ha devuelto resultados relevantes (unicamente paginas generales de Google sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para pesos en fp32: aproximadamente 156 MB (39,09 M de parametros x 4 bytes).
- VRAM estimada en fp16 o bf16: aproximadamente 78 MB.
- VRAM estimada en cuantizacion int8: aproximadamente 39 MB; en int4, aproximadamente 20 MB.
- A estas cifras hay que sumar el coste de activaciones y cache KV, que depende de la longitud de contexto y del tamano de lote. Para un modelo de este tamano, el consumo adicional es del orden de decenas de MB incluso con contextos largos.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, e incluso iGPU con memoria compartida) y tambien en CPU.
- GPU de datacenter (A100, H100) innecesarias; no aportan ventaja practica.
- Opciones de despliegue: pipeline de `transformers` (documentado en la model card), HuggingFace Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` indica compatibilidad), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no publica versiones GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/tam-taml-10mb-after-ppt-Dp-100mb-ckpt500_seed10 | 39,09 M | no disponible | no disponible | HuggingFace, safetensors |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT modificada | HuggingFace, multiples formatos |
| DistilGPT2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace, multiples formatos |
| TinyStories-33M (Eldan y Li) | 33 M | 512 tokens (variante） | MIT | HuggingFace, safetensors |

Nota: los datos de los modelos comparativos proceden de informacion publica de sus respectivos repositorios; no se dispone de resultados de benchmarks de este modelo para establecer comparaciones de rendimiento. La comparacion se limita por tanto a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: la model card incluye un marcador de posicion (`licence: license`) y los metadatos de HuggingFace no declaran licencia. No hay autorizacion explicita de uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Modelo de investigacion sin documentacion de datos: se desconoce el corpus de entrenamiento, su procedencia y si contiene material con derechos de autor, datos personales o contenido sesgado.
- Riesgo elevado de alucinacion: con 39 M de parametros, la capacidad de almacenar conocimiento factual es muy limitada; es esperable que genere afirmaciones plausibles pero incorrectas.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, seguridad ni alineacion.
- Idiomas soportados no documentados: no se puede asumir un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Contexto no documentado: se desconoce la ventana efectiva; asumir 1024 tokens basandose solo en la arquitectura GPT-2 seria una suposicion.
- Sin soporte documentado de tool calling ni de plantillas de chat verificadas mas alla del formato de lista de mensajes mostrado en la model card.
- Descargas y likes a cero en el momento de la consulta: implica ausencia de validacion por parte de la comunidad.
- No apto para produccion: no debe utilizarse en atencion al cliente, generacion de codigo, asesoramiento ni ningun flujo donde la correccion factual sea requisito.
- Nomenclatura de checkpoint: al ser un `ckpt500` de una serie con semillas (`seed10`), el rendimiento puede variar entre checkpoints y semillas; no hay informacion sobre cual es el mejor de la serie.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/tam-taml-10mb-after-ppt-Dp-100mb-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/x54pzh7v
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de TRL (referencia SFT): https://huggingface.co/docs/trl
- Documentacion del pipeline de generacion de texto de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextGenerationPipeline
