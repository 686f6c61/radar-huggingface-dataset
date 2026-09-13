# Saraswathy/vlm-mix-resume-tables50-social50-step90

## Resumen

Saraswathy/vlm-mix-resume-tables50-social50-step90 es un checkpoint de reanudacion de entrenamiento publicado como archivo, no un modelo listo para produccion. Se trata de un adaptador LoRA (libreria `peft`) entrenado sobre el modelo base multimodal Qwen/Qwen3-VL-4B-Instruct, orientado a tareas de imagen-a-texto (`image-text-to-text`). El autor lo describe como un archivo completo de un entrenamiento con EasyR1 detenido en el paso global 90, con un mix de datos compuesto por tablas al 50 % y contenido social al 50 %.

El repositorio no contiene pesos fusionados: incluye el estado FSDP del modelo y del optimizador, estado adicional, estado del dataloader y el adaptador LoRA listo para evaluacion en la ruta `actor/lora_adapter/`. Para usarlo hay que cargar el adaptador sobre Qwen/Qwen3-VL-4B-Instruct. El tamano del repositorio es de 11,8 GB, muy superior al de un adaptador LoRA aislado, precisamente porque incorpora el estado de entrenamiento.

Su relevancia es fundamentalmente de investigacion y reproducibilidad: permite retomar un entrenamiento de RL o ajuste fino multimodal en el paso 90, auditar el estado del optimizador y evaluar el adaptador resultante. No hay descargas ni interacciones registradas, ni resultados de benchmarks publicados, por lo que debe tratarse como un artefacto experimental y no como un modelo recomendado para despliegue directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (base: Qwen/Qwen3-VL-4B-Instruct) |
| Parametros totales | No disponible (el repositorio contiene adaptador LoRA, no un modelo fusionado; el base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en `actor/lora_adapter/`); el resto del repositorio son estados de entrenamiento FSDP, optimizador y dataloader |
| Libreria de carga | peft |
| Tarea (pipeline) | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Tamano del repositorio | 11,8 GB |
| Verificacion de integridad | SHA256SUMS.json |

## Arquitectura y entrenamiento

El objeto publicado es un checkpoint de reanudacion, no una arquitectura nueva. La arquitectura subyacente corresponde al modelo base Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de aproximadamente 4 000 millones de parametros capaz de procesar imagen y texto y generar texto. Sobre esa base se ha entrenado un adaptador LoRA, de modo que solo una fraccion reducida de pesos es especifica de este artefacto; el resto se toma del modelo base en el momento de la carga.

El entrenamiento se realizo con EasyR1, un framework de ajuste fino y RL para modelos multimodales, y el autor indica que el checkpoint corresponde al paso global 90. El repositorio incluye estado FSDP del modelo y del optimizador, estado extra y estado del dataloader, lo que permite reanudar el entrenamiento exactamente en ese punto. El mix de datos se deduce del nombre del modelo: 50 % tablas y 50 % contenido social. No se proporciona informacion sobre el numero total de tokens, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO mas alla del propio pipeline EasyR1. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto condicionada por imagen: al ser un adaptador sobre un VLM, admite entradas de imagen y texto y devuelve texto.
- Comprension de tablas: el mix de datos indica entrenamiento especifico en tareas de tablas, presumiblemente extraccion, interpretacion o respuesta a preguntas sobre tablas en imagen.
- Contenido social: la otra mitad del mix apunta a imagenes de tipo red social (captions, memes, publicaciones), aunque no se detalla la tarea concreta.
- Capacidades heredadas del base: razonamiento multimodal, OCR y descripcion de imagenes proceden del modelo base Qwen/Qwen3-VL-4B-Instruct, no del adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base es multilingue, pero el adaptador no documenta idiomas.
- Modo thinking: no disponible.
- Capacidades de audio o video: no disponibles.

## Casos de uso

- Reanudacion de entrenamiento: cargar el estado FSDP, del optimizador y del dataloader para continuar el ajuste desde el paso global 90 sin repetir computo previo. Es el uso principal para el que se publica este repositorio.
- Evaluacion de adaptadores LoRA en investigacion: cargar `actor/lora_adapter/` sobre Qwen/Qwen3-VL-4B-Instruct y medir el efecto del mix tablas/social frente al base, en un entorno controlado.
- Analisis comparativo de estrategias de ajuste: usar el checkpoint como punto de referencia intermedio en estudios sobre tecnicas de RL o SFT multimodal con EasyR1.
- Extraccion de informacion de tablas en imagen: si el adaptador ha aprendido la tarea, puede aplicarse a digitalizar tablas de capturas, PDF escaneados o informes, siempre con validacion manual posterior.
- Procesamiento de imagenes de redes sociales: generacion de descripciones o etiquetado de publicaciones con imagen, sujeto a verificacion de sesgos y calidad.
- Auditoria de artefactos de entrenamiento: inspeccionar los estados guardados para depurar problemas de convergencia, comprobar la integridad con `SHA256SUMS.json` o reproducir experimentos.
- Docencia y formacion: ejemplo practico de estructura de checkpoint FSDP con EasyR1 y de como separar adaptador y estado de entrenamiento en un repositorio publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA por si solo ocupa muy poco, pero el repositorio completo son 11,8 GB por el estado FSDP y del optimizador; se necesita ese espacio en disco para descargarlo y reanudar el entrenamiento.
- Para inferencia hay que cargar el modelo base Qwen/Qwen3-VL-4B-Instruct, no solo el adaptador. Estimacion orientativa para un modelo de 4B: en bf16/fp16 alrededor de 8-10 GB de pesos, mas memoria para el encoder visual, los tokens de imagen y el contexto, lo que situa el consumo practico en el rango de 10-14 GB con contexto moderado.
- Cuantizacion a 8 bits: aproximadamente 5-6 GB de pesos. Cuantizacion a 4 bits: aproximadamente 3-4 GB de pesos. Son estimaciones, no cifras verificadas para este adaptador.
- Cabe en GPU de consumo con suficiente VRAM: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB en bf16; en 4 bits podria entrar en GPUs de 8 GB, con margen limitado.
- GPU de datacenter recomendadas para entrenamiento o evaluacion a gran escala: A100 40/80 GB, H100 80 GB o L40S 48 GB. El estado FSDP sugiere entrenamiento distribuido multi-GPU.
- Opciones de despliegue: vLLM con soporte de LoRA permite servir el base mas el adaptador; TGI y otros servidores requieren comprobar compatibilidad con Qwen3-VL. Para llama.cpp u Ollama habria que fusionar el adaptador con el base y convertir a GGUF, un proceso que no viene documentado en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-tables50-social50-step90 | Adaptador LoRA + checkpoint de entrenamiento | Adaptador sobre base de 4B | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | Modelo base sobre el que se carga el adaptador | 4B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros VLM pequenos de la misma categoria (por ejemplo, familias Qwen-VL previas o InternVL de rango similar) | Alternativas de tamano comparable | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparativa se limita por tanto a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el adaptador sobre Qwen/Qwen3-VL-4B-Instruct. Usarlo sin el base no funciona.
- Licencia no especificada: al no declararse licencia, no hay garantia de uso comercial y conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados. Un mix de datos con contenido social puede arrastrar sesgos presentes en ese tipo de imagenes y textos.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; no hay evaluaciones publicadas que lo cuantifiquen para este adaptador.
- Idiomas soportados: no disponibles. El base es multilingue, pero el adaptador puede haber alterado el equilibrio entre idiomas.
- Entrenamiento detenido en el paso 90: puede no haber convergido; el rendimiento real es desconocido sin evaluacion.
- Procedencia y reproducibilidad: los resultados de la busqueda web no aportan informacion tecnica sobre este modelo, por lo que todo lo anterior se basa en la model card del autor.
- Integridad del repositorio: se recomienda verificar los archivos con `SHA256SUMS.json` antes de reanudar entrenamientos.
- Adopcion nula: cero descargas y cero interacciones, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-tables50-social50-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada.
