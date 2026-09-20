# Aletheia-ng/SabiYarn_MoE-280M

## Resumen

SabiYarn_MoE-280M es un modelo publicado en HuggingFace por el usuario Aletheia-ng, identificado como un modelo de mezcla de expertos (MoE) de pequeno tamano. El repositorio contiene pesos en formato safetensors y esta etiquetado con `custom_code`, lo que implica que su carga requiere ejecutar codigo remoto propio del autor (`trust_remote_code=True`) y que la arquitectura no se corresponde con ninguna de las implementadas de serie en las librerias habituales. La etiqueta `sabiyarn` sugiere una variante propia del autor, presumiblemente relacionada con tecnicas de escalado de RoPE (YaRN), aunque no hay documentacion que lo confirme.

El dato mas relevante y verificado es el recuento real de parametros del archivo safetensors: 345.835.008, cifra que no coincide con el sufijo "280M" del nombre del repositorio. No se dispone de informacion sobre el numero de expertos, los parametros activos por token, la longitud de contexto, los idiomas soportados ni la licencia. El repositorio ocupa 53,3 GB, un tamano desproporcionado para un modelo de ~346 millones de parametros (que en bfloat16 ocuparia menos de 1 GB), lo que apunta a la presencia de multiples checkpoints, estados de optimizador u otros artefactos de entrenamiento en el mismo repo.

Se trata de un modelo con muy poca traccion (11 descargas y 0 likes en el momento de la consulta) y sin documentacion publica asociada. Su interes practico es limitado en el estado actual de la informacion, y cualquier evaluacion seria requiere inspeccionar directamente el `config.json` y el codigo custom del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun el nombre del repositorio); implementacion con codigo custom, detalles no disponibles |
| Parametros totales | 345.835.008 (dato real del safetensors); el nombre del repo indica "280M" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se han publicado versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con codigo custom para la definicion del modelo) |
| Tamano del repositorio | 53,3 GB |
| Fecha de creacion | 2026-07-30 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-19 (segun metadatos de HuggingFace) |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la del nombre del repositorio, que indica un diseno de mezcla de expertos (MoE), y la etiqueta `custom_code`, que confirma que el modelo define clases propias que no forman parte del catalogo estandar de Transformers. Esto significa que para instanciarlo es necesario cargar el codigo incluido en el repositorio, con el riesgo de seguridad que ello conlleva en entornos de produccion. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento (top-k, capacidad de experto, balanceo de carga), ni sobre si se emplean mecanismos adicionales como atencion lineal, decodificacion especulativa o atencion con ventana deslizante.

Tampoco hay datos sobre el proceso de entrenamiento: no se ha publicado el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La diferencia entre los 345,8 millones de parametros reales y el sufijo "280M" del nombre puede deberse a que este ultimo haga referencia a una convencion interna del autor (por ejemplo, parametros de una configuracion concreta antes de expandir expertos), pero es una hipotesis sin confirmar. Del mismo modo, el tamano de 53,3 GB del repositorio no es explicable por los pesos de inferencia de un modelo de este tamano y sugiere la presencia de checkpoints intermedios, estados de optimizador o datasets empaquetados.

## Capacidades

No se ha publicado ninguna documentacion, model card descriptiva ni ejemplo de uso que permita verificar las capacidades del modelo. Por tanto:

- Generacion de texto: no disponible (no confirmada).
- Razonamiento, matematicas o codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

La unica capacidad verificable a partir de los metadatos es que el modelo expone pesos en safetensors cargables mediante codigo personalizado, lo que implica que la generacion de texto es el proposito presumible, sin que exista evidencia publica de ello.

## Casos de uso

Dado que no hay informacion verificada sobre capacidades, los siguientes escenarios son hipotesis de encaje por clase de tamano (~346 M de parametros, diseno MoE), no casos validados. En todos ellos seria imprescindible una evaluacion previa del modelo:

- Despliegue en dispositivos de borde (edge): un modelo de este orden de parametros puede caber en memoria de moviles, Raspberry Pi o NPU de bajo consumo si se cuantiza, siempre que el codigo custom sea portable fuera de PyTorch.
- Prototipado de investigacion sobre enrutamiento MoE: util como banco de pruebas a pequena escala para estudiar comportamiento de expertos, balanceo de carga o colapso de expertos sin el coste de entrenar un MoE grande.
- Clasificacion y etiquetado de texto a gran volumen: si el modelo genera texto coherente, podria usarse para tareas de extraccion o clasificacion por lotes donde la latencia sea tolerable.
- Generacion de texto en entornos con recursos limitados: siempre que se confirme calidad suficiente tras cuantizacion a int8 o int4.
- Experimentos academicos de comparacion de arquitecturas: como punto de referencia de un MoE diminuto frente a modelos densos de tamano similar.
- Fine-tuning especifico de dominio: al ser pequeno, es ajustable en una unica GPU consumer, aunque la presencia de codigo custom complica la integracion con frameworks como PEFT o Unsloth.
- Servicio de autocompletado o sugerencia de texto en aplicaciones locales: solo si se valida la calidad y el modelo se distribuye en un formato estandar.

Ninguno de estos casos debe asumirse como soportado sin una evaluacion propia del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de la misma categoria.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parametros (345,8 millones) y no de mediciones publicadas:

- VRAM para inferencia en bfloat16/fp16: aproximadamente 0,7 GB para pesos, mas memoria para cache KV y activaciones (dependiente de la longitud de contexto, que se desconoce).
- VRAM en int8: aproximadamente 0,35 GB para pesos.
- VRAM en int4: aproximadamente 0,2 GB para pesos.
- Cabria en practicamente cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), asi como en CPU, siempre que la implementacion custom lo permita.
- GPU recomendadas para entrenamiento o fine-tuning: RTX 3090, RTX 4090, A100 o H100, en funcion del tamano de lote y de si se necesita entrenar el enrutador desde cero.
- Opciones de despliegue: no disponible. No hay evidencia de soporte en vLLM, llama.cpp, Ollama, TGI ni SGLang; la etiqueta `custom_code` indica que la carga requiere el codigo del repositorio y probablemente Transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponible.

Advertencia: el repositorio ocupa 53,3 GB en disco, muy por encima de lo que necesitarian los pesos de inferencia, por lo que la descarga completa puede ser innecesaria si solo se buscan los safetensors de un checkpoint concreto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto, licencia ni parametros activos de este modelo, y tampoco se ha recuperado informacion de alternativas comparables. No es posible establecer una comparativa rigurosa con otros modelos de la categoria de MoE pequenos sin inventar cifras.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion oficial de uso previsto, datos de entrenamiento ni limitaciones declaradas por el autor.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara.
- Riesgo de seguridad por `custom_code`: la carga del modelo exige ejecutar codigo Python del repositorio, lo que abre la puerta a ejecucion de codigo arbitrario si el repositorio no se audita previamente.
- Riesgo elevado de alucinacion y de comportamiento impredecible: sin evaluaciones publicadas no hay ninguna garantia sobre la calidad de las salidas.
- Idiomas soportados desconocidos: no se puede asegurar un rendimiento aceptable en castellano ni en ningun otro idioma.
- Longitud de contexto desconocida: imposible planificar casos de uso que dependan de ventanas largas.
- Discrepancia entre nombre y parametros reales (280M frente a 345,8 M): indica falta de cuidado en el etiquetado y obliga a verificar cualquier cifra de la documentacion contra los archivos reales.
- Tamano de repositorio anormal (53,3 GB): puede incluir checkpoints redundantes, estados de optimizador o datos que incrementan innecesariamente el coste de almacenamiento y descarga.
- Traccion minima (11 descargas, 0 likes): no hay comunidad que haya validado el modelo, ni issues, ni reportes de uso.
- Fechas de creacion y actualizacion poco habituales en los metadatos: conviene verificarlas antes de citarlas.
- No apto para produccion sin evaluacion previa: no cumple los minimos de documentacion, licencia y reproducibilidad exigibles en un entorno productivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aletheia-ng/SabiYarn_MoE-280M
- No se han encontrado papers, blogs, repositorios de codigo, demos ni documentacion adicional asociados al modelo en la busqueda web realizada. Los resultados devueltos por la busqueda no guardaban relacion con el modelo (contenido de un servicio de telefonia VOIP), por lo que no se incluyen.
