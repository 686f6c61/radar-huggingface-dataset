# edp1096/Huihui-Ornith-1.5-35B-A3B-NVFP4

## Resumen

Huihui Ornith 1.5 35B A3B NVFP4 es un checkpoint derivado publicado por el usuario edp1096 en HuggingFace. No se trata de un entrenamiento nuevo, sino de una cuantizacion concreta: se parte del checkpoint oficial Ornith NVFP4/FP8 y se le aplica la "abliteration" del proyecto Huihui (eliminacion de las direcciones de rechazo en el espacio de activaciones). Los pesos que cambian con la abliteration se cuantizan desde el BF16 de Huihui, mientras que los pesos no modificados conservan los valores del checkpoint original, y las escalas de activacion originales se preservan sin recalibrar.

El modelo se etiqueta con `qwen3_5_moe`, lo que apunta a una arquitectura transformer con mezcla de expertos (MoE) de la familia Qwen 3.5, y con el pipeline `image-text-to-text`, es decir, acepta imagenes ademas de texto. La nomenclatura "35B-A3B" sugiere unos 35.000 millones de parametros totales con unos 3.000 millones activos por token, aunque los pesos en safetensors declarados suman 19.528.501.104 parametros (19,53 B), una discrepancia que la informacion disponible no explica.

Su relevancia es doble: por un lado, es un ejemplo de despliegue en formato NVFP4 (4 bits en coma flotante de NVIDIA) sobre hardware Blackwell; por otro, forma parte del ecosistema de modelos "abliterated", que interesan a quienes investigan alineacion, direcciones de rechazo y comportamiento de modelos sin capas de seguridad. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el tag `qwen3_5_moe`; pipeline multimodal `image-text-to-text` |
| Parametros totales | 19.528.501.104 (~19,53 B) segun los pesos safetensors. El nombre del modelo indica "35B"; la discrepancia no se explica en la informacion disponible |
| Parametros activos | Aproximadamente 3 B segun la nomenclatura A3B del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante de NVIDIA) y FP8; los pesos modificados se cuantizan desde BF16 del modelo Huihui y los no modificados conservan los valores del checkpoint original; las escalas de activacion originales se preservan sin recalibrar; el repositorio lleva ademas el tag `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`, optimizado con `modelopt`) |
| Tamano del repositorio | 23,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base Ornith 1.5 35B A3B: no se indican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineacion. Lo unico deducible es la familia arquitectonica: el tag `qwen3_5_moe` indica un transformer con mezcla de expertos, y el pipeline `image-text-to-text` implica un codificador o proyector visual que permite consumir imagenes junto con texto. El tag `conversational` apunta a un ajuste orientado a dialogo.

El proceso documentado en la model card es exclusivamente de cuantizacion y edicion de pesos: se aplica la abliteration de Huihui sobre el checkpoint oficial Ornith NVFP4/FP8, se cuantizan a NVFP4/FP8 unicamente los pesos alterados partiendo del BF16 de Huihui y se conservan intactos los pesos no modificados del checkpoint original. Un detalle tecnico relevante es que las escalas de activacion del checkpoint original se mantienen sin recalibrar, de modo que los pesos editados se sirven con escalas calculadas para los pesos previos a la abliteration; esto puede introducir degradacion adicional en las capas afectadas. No se documentan innovaciones de decodificacion, atencion lineal ni tecnicas de inferencia especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que puede recibir imagenes acompanadas de instrucciones en lenguaje natural.
- Razonamiento y generacion de codigo o matematicas: no confirmado en la informacion disponible, aunque es esperable en un modelo de la familia Qwen 3.5.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Entrada o salida de audio: no disponible.
- Comportamiento sin capas de rechazo (abliterated): el modelo ha sido editado para eliminar direcciones de rechazo, lo que cambia cualitativamente el tipo de respuestas que produce.

## Casos de uso

- Procesamiento de documentos escaneados: al aceptar imagen y texto, puede recibir facturas, formularios o contratos en formato imagen y devolver campos extraidos en JSON o texto estructurado, con una ventana de contexto que habria que confirmar antes de usarlo en produccion.
- Descripcion automatica de imagenes y generacion de texto alternativo: util para pipelines de accesibilidad web o catalogos de producto donde hay que etiquetar grandes volumenes de imagenes.
- Analisis de capturas de pantalla e interfaces: puede responder preguntas sobre el contenido de una captura (por ejemplo, verificar si un formulario muestra un error) dentro de flujos de QA de producto.
- Asistente conversacional autoalojado: la licencia MIT y el formato NVFP4/FP8 permiten desplegarlo en infraestructura propia sin depender de APIs externas, siempre que se asuma la falta de capas de seguridad.
- Cuantificacion y despliegue en GPU Blackwell: sirve como referencia practica para medir el rendimiento real de un MoE multimodal en NVFP4 con vLLM o TensorRT-LLM, incluyendo el coste del decodificado.
- Investigacion sobre alineacion y abliteration: permite comparar las respuestas del checkpoint original frente a la version abliterated para estudiar que direcciones de activacion se eliminan y como afecta eso al comportamiento en dominios sensibles.
- Moderacion o red teaming de contenido: al carecer de rechazos, puede emplearse (en entornos controlados) para generar casos adversarios que pongan a prueba clasificadores de seguridad propios.
- Extraccion de informacion de diagramas tecnicos o graficos: combinando vision y contexto largo, se puede usar para transformar esquemas en descripciones textuales o tablas de componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- El repositorio ocupa 23,4 GB, de modo que el conjunto de pesos en NVFP4/FP8 requiere al menos ese espacio de almacenamiento y una cantidad de VRAM del mismo orden antes de contabilizar cache KV, activaciones y overhead del runtime.
- NVFP4 es un formato de 4 bits orientado al hardware Blackwell de NVIDIA (serie RTX 50, B200, RTX PRO 6000 Blackwell); la aceleracion nativa depende del soporte del runtime y de la generacion de GPU.
- En GPUs sin soporte nativo de NVFP4 (por ejemplo, Ada Lovelace o Hopper) el checkpoint tendria que descomprimirse o convertirse; como referencia, 19,53 B de parametros en BF16 ocuparian unos 39 GB y en FP8 unos 19,5 GB, mas el overhead de inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada. Como estimacion basada en el tamano del repositorio, una GPU consumer con 24 GB queda muy justa, y 32 GB o mas resulta mas realista para trabajar con contexto apreciable.
- Opciones de despliegue: `transformers` (libreria declarada) y las herramientas habituales para checkpoints NVFP4/FP8 (TensorRT-LLM o vLLM); la compatibilidad concreta de cada version con este checkpoint no esta documentada en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Abliterated | Disponibilidad |
|---|---|---|---|---|---|---|
| edp1096/Huihui-Ornith-1.5-35B-A3B-NVFP4 | ~19,53 B (nombre: 35B) | no disponible | NVFP4 / FP8 | MIT | Si | Repositorio HuggingFace, 0 descargas |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | no disponible | no disponible | no disponible (BF16 como origen de la cuantizacion) | no disponible | Si | Modelo base del anterior |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 | no disponible | no disponible | NVFP4 / FP8 | no disponible | No | Modelo base oficial |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas de otros fabricantes (por ejemplo, otros MoE multimodales de ~20-35 B) en la informacion proporcionada, por lo que no se incluye una comparacion de rendimiento.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado las direcciones de rechazo, por lo que la ausencia de capas de seguridad es intencionada. No es adecuado para aplicaciones orientadas al publico sin un filtro externo de entrada y salida.
- Las escalas de activacion del checkpoint original se conservan sin recalibrar tras la abliteration, lo que puede degradar la calidad en las capas cuyos pesos han cambiado.
- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion ni la fidelidad en tareas de vision.
- No hay informacion sobre idiomas soportados; el castellano no esta confirmado como idioma cubierto con calidad.
- Discrepancia sin explicar entre el nombre (35B, A3B) y el recuento real de parametros en safetensors (19,53 B), lo que dificulta dimensionar el hardware y estimar el coste por token.
- Licencia: el repositorio declara MIT, pero al ser un derivado de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated y de ornith-ai/Ornith-1.5-35B-A3B-NVFP4 conviene verificar las condiciones de los modelos base antes de un uso comercial, especialmente si el modelo original impone restricciones adicionales.
- Es una cuantizacion derivada, no un entrenamiento nuevo: su calidad esta acotada por la de los modelos base y no se ha publicado ninguna evaluacion independiente.
- Riesgo de cadena de suministro: el autor del repositorio (edp1096) no es el desarrollador del modelo original, y no se documenta el procedimiento completo de conversion ni los scripts utilizados.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por parte de terceros.
- Requisitos de hardware restrictivos: el formato NVFP4 esta pensado para GPU Blackwell, lo que limita el despliegue en infraestructura mas antigua.
- Sesgos conocidos: no disponible en la informacion proporcionada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/edp1096/Huihui-Ornith-1.5-35B-A3B-NVFP4
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo base (oficial NVFP4): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente enlaces a foros ajenos al contenido).
