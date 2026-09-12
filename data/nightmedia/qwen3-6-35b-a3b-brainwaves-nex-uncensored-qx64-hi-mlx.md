# nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-qx64-hi-mlx

## Resumen

El modelo `nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-qx64-hi-mlx` es una variante derivada de la familia Qwen 3.5/3.6, publicada por el usuario nightmedia en HuggingFace. Se trata de un modelo de lenguaje de arquitectura MoE (mixture of experts) con 35.107.181.936 parámetros totales, según los datos reales de los ficheros safetensors publicados, y con un sufijo de nomenclatura A3B que indica del orden de 3.000 millones de parámetros activos por token. El pipeline declarado es image-text-to-text, de modo que el modelo está etiquetado para tareas multimodales de entrada de imagen y texto, y su arquitectura interna corresponde al tag `qwen3_5_moe`.

La relevancia de esta ficha radica en que se trata de un modelo de fusión (merge) construido con mergekit a partir de varios modelos base, entre ellos `AllSpark-Research/Iris-mini`, `thomsonreuters/Thomson-1.0-Small`, `nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1`, `nightmedia/Qwen3.6-35B-A3B-FSM`, `Qwen/Qwen-AgentWorld-35B-A3B`, `orcarouter/Nex-N2.5-mini-Uncensored` y `Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated`. La combinación de modelos orientados a agentes, razonamiento y variantes "abliterated" o "uncensored" sugiere un ajuste orientado a reducir los rechazos del modelo y a potenciar el razonamiento de cadena larga.

El repositorio tiene 30,9 GB, está publicado bajo licencia Apache 2.0, soporta los idiomas inglés, chino, japonés y español, y su acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. No se ha publicado ningún dato de benchmarks, y el número de descargas y de "likes" es cero en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, familia Qwen 3.5/3.6 (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | Del orden de 3.000 millones, segun el sufijo A3B de la nomenclatura; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8, mxfp4, 6-bit (sufijo `qx64-hi`), formato MLX; pesos safetensors |
| Idiomas soportados | en (ingles), zh (chino), ja (japones), es (espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); variante MLX (tag `mlx`) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 30,9 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Tipo de modelo | Fusion (merge) de modelos, ajuste por instrucciones, orientado a razonamiento |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), etiquetado como `qwen3_5_moe`, con 35,1 B de parametros totales y aproximadamente 3 B activos por token. Esta configuracion implica que, en cada paso de decodificacion, solo se activa una fraccion pequena de la red, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano total, a cambio de requerir el almacenamiento completo de los pesos en memoria. El tag `moe` junto con `mxfp8` y `mxfp4` apunta a soporte de formatos de precision mixta de bajo ancho de bit, y el tag `mlx` indica compatibilidad con el framework MLX de Apple para ejecucion en silicio de la serie M.

En cuanto al entrenamiento, la informacion disponible no incluye detalles sobre el numero de tokens, la composicion del dataset ni las etapas de alineacion. Los tags del repositorio mencionan `distillation`, `reasoning`, `chain-of-thought`, `long-cot`, `sft`, `lora` e `instruction-tuned`, lo que sugiere que la construccion del modelo ha implicado destilacion de cadenas de razonamiento largas, ajuste supervisado (SFT) y adaptadores LoRA, pero no se especifica ninguna etapa de RLHF o DPO. El modelo se presenta ademas como resultado de un proceso de fusion con mergekit a partir de los modelos base listados en la seccion de informacion, varios de ellos variantes "abliterated" o "uncensored" y orientados a agentes, lo que apunta a un ajuste destinado a reducir los rechazos y a favorecer el razonamiento multi-paso.

## Capacidades

- Generacion de texto conversacional e instrucciones generales, con etiqueta `text-generation` y `conversational`.
- Razonamiento explicito con cadenas de pensamiento largas (tags `reasoning`, `chain-of-thought`, `long-cot`), orientado a problemas que requieren varios pasos intermedios.
- Matematicas y disciplinas STEM (tags `math`, `stem`).
- Programacion y generacion de codigo (tag `coding`).
- Capacidades multimodales de entrada: el pipeline declarado es image-text-to-text, por lo que acepta imagenes junto con texto como entrada.
- Multilingue en ingles, chino, japones y espanol.
- Orientacion a agentes y entornos de herramientas: los modelos base incluyen `Qwen/Qwen-AgentWorld-35B-A3B` y `Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated`, lo que sugiere soporte de uso agentico; no se confirma en la informacion disponible el soporte explicito de tool calling o function calling.
- Uso en investigacion experimental (tags `research`, `experimental`): el propio repositorio se marca como experimental.
- Variante "uncensored": el ajuste busca reducir negativas y restricciones de contenido; no se detalla la metodologia concreta.

## Casos de uso

- Razonamiento matematico asistido: el modelo esta etiquetado para `math` y `long-cot`, por lo que puede emplearse para resolver problemas paso a paso y para generar explicaciones intermedias que un corrector automatico pueda validar. El modo de razonamiento largo permite separar el borrador interno de la respuesta final.
- Generacion y revision de codigo en pipelines de CI/CD: con la etiqueta `coding` y un contexto de razonamiento extenso, puede integrarse como paso de revision automatica de parches o de generacion de tests dentro de un flujo de integracion continua.
- Despliegue local en equipos Apple Silicon: la publicacion incluye variantes MLX y cuantizaciones de 6 bits, mxfp8 y mxfp4, lo que permite ejecutar el modelo en un Mac con memoria unificada amplia sin depender de GPUs dedicadas.
- Analisis de documentos con imagenes: al declarar el pipeline image-text-to-text, puede utilizarse para extraer y resumir informacion de capturas, diagramas o documentos escaneados acompanados de instrucciones textuales.
- Asistente conversacional multilingue para los mercados de habla inglesa, china, japonesa y espanola: el modelo cubre los cuatro idiomas declarados, lo que permite un unico despliegue para atencion en esos idiomas.
- Investigacion sobre fusion de modelos y destilacion de razonamiento: al ser un merge documentado con mergekit y con una lista explicita de modelos base, resulta util como objeto de estudio para comparar tecnicas de merging y de destilacion de cadenas de pensamiento.
- Experimentacion con modelos sin alineacion restrictiva: la variante "uncensored"/"abliterated" puede emplearse en estudios sobre comportamiento de rechazo, sesgos inducidos por abliteration y efectos sobre la calidad general, siempre dentro de marcos eticos y legales.
- Generacion de datos sinteticos de razonamiento: el modo de cadena de pensamiento larga permite producir trazas de razonamiento etiquetadas para entrenar o evaluar otros modelos, con la salvedad de que deben filtrarse por correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 35,1 B de parametros totales; son estimaciones, no datos publicados): en 8 bits, del orden de 35-38 GB solo para pesos; en 6 bits (variante `qx64-hi`), del orden de 26-28 GB; en 4 bits, del orden de 18-20 GB. A estas cifras hay que anadir la memoria de la cache KV, que depende de la longitud de contexto efectiva, no disponible en la ficha.
- Al ser un MoE con unos 3 B de parametros activos, el coste por token generado es bajo en comparacion con un modelo denso de 35 B, aunque la huella de memoria sigue siendo la del modelo completo.
- GPU recomendadas: para la variante sin cuantizar o en 8 bits, una A100 de 40 GB, una H100 de 80 GB o una tarjeta de 48 GB como la L40S o la RTX 6000 Ada. Para cuantizaciones de 4 a 6 bits, una RTX 4090 de 24 GB puede ser suficiente si la cache KV se mantiene en valores bajos.
- Cabe en GPU de consumo (RTX 3090, 4090, 5090) en cuantizaciones de 4 bits, siempre que el contexto sea moderado. En 6 bits, una GPU de 24 GB queda muy justa y se recomienda una de 32 GB o mas.
- En Apple Silicon, gracias a las variantes MLX publicadas, puede ejecutarse en equipos con memoria unificada de 32 GB en adelante, y con mas holgura en configuraciones de 64 GB o superiores.
- Opciones de despliegue: transformers como libreria de referencia declarada; vLLM o TGI para servicio con batching en GPUs; llama.cpp u Ollama si se generan pesos GGUF (no se confirma su publicacion en este repositorio); MLX-LM para Apple Silicon. La compatibilidad de endpoints esta indicada en los tags, pero no se detalla la configuracion.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto ni licencia de alternativas comparables en la informacion proporcionada. Como referencia, los propios modelos base declarados pertenecen a la misma categoria de tamano (MoE de 35 B con aproximadamente 3 B activos):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-qx64-hi-mlx | 35,1 B totales, ~3 B activos | no disponible | apache-2.0 | Gated en HuggingFace |
| Qwen/Qwen-AgentWorld-35B-A3B | 35 B totales, ~3 B activos | no disponible | no disponible | no disponible |
| Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated | 35 B totales, ~3 B activos | no disponible | no disponible | no disponible |
| nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1 | 35 B totales, ~3 B activos | no disponible | no disponible | no disponible |
| AllSpark-Research/Iris-mini | no disponible | no disponible | no disponible | no disponible |

No se ha encontrado informacion publica sobre benchmarks que permita una comparacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: cero descargas registradas, cero "likes" y ningun benchmark en la informacion disponible. No hay evidencia independiente de su calidad.
- Modelo experimental: el repositorio se etiqueta explicitamente como `experimental` y procede de una fusion de multiples modelos con mergekit, lo que puede producir comportamientos inconsistentes o degradacion en tareas que los modelos base resolvian correctamente.
- Variante "uncensored"/"abliterated": el ajuste esta disenado para reducir los rechazos del modelo, lo que incrementa el riesgo de generar contenido danino, sesgado o factualmente incorrecto sin advertencia. No debe desplegarse en produccion orientada al publico sin filtros externos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado en fusiones sin validacion; el modo de razonamiento largo puede producir cadenas de pensamiento plausibles pero incorrectas.
- Idiomas limitados a ingles, chino, japones y espanol. No hay soporte declarado para otras lenguas, incluidas las cooficiales de Espana distintas del castellano.
- Longitud de contexto no disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Licencia Apache 2.0 en este repositorio, pero los modelos base pueden tener licencias propias con condiciones adicionales (por ejemplo, terminos especificos de Qwen). Conviene verificar la licencia de cada modelo fuente antes de un uso comercial.
- Acceso restringido (gated): es obligatorio aceptar condiciones en HuggingFace y autenticarse con un token para descargar los pesos, lo que complica la automatizacion de despliegues y la reproducibilidad.
- Etiqueta de multimodalidad sin detalle: aunque el pipeline es image-text-to-text, no se especifica que torre de vision se ha conservado tras la fusion ni si las capacidades visuales siguen intactas.
- Fechas de publicacion y de actualizacion registradas como 2026, lo que dificulta situar el modelo en una linea temporal verificable.

## Enlaces

- HuggingFace: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-qx64-hi-mlx
- La busqueda web realizada no ha devuelto ningun enlace tecnico relevante sobre este modelo: los resultados obtenidos correspondian a sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se descartan y no se incluyen. No hay papers, blogs, repositorios de codigo ni demos adicionales disponibles en la informacion proporcionada.
