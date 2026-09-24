# mradermacher/OpenElla-NovelWriter-Charol-GGUF

## Resumen

OpenElla-NovelWriter-Charol-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo N-Bot-Int/OpenElla-NovelWriter-Charol. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el autor toma los pesos del modelo base y los convierte a los formatos Q2_K, Q3_K, Q4_K, Q6_K, Q8_0 y f16 de la familia GGUF/llama.cpp. El modelo base lleva la etiqueta `mergekit`, lo que indica que a su vez es el resultado de una fusión de varios modelos (un merge) y no de un entrenamiento monolítico.

El modelo cuenta con 8.030.261.312 parámetros (aproximadamente 8,03 mil millones), un tamaño que lo sitúa en la gama de modelos densos de 7-8B y, por tanto, en el rango de modelos ejecutables en GPU de consumo con cuantizaciones agresivas. El repositorio tiene un tamaño de 56 GB, coherente con el conjunto de todas las cuantizaciones publicadas. El nombre del modelo sugiere una especialización hacia la escritura creativa y de novela, aunque esa orientación no se documenta explícitamente en la información disponible.

La relevancia actual de esta ficha es fundamentalmente práctica: permite saber qué archivo descargar, cuánta VRAM necesita y qué se puede esperar de un modelo del que apenas existe documentación pública. Es importante subrayar que el repositorio no publica licencia, ni longitud de contexto, ni datos de entrenamiento, ni resultados de benchmarks, por lo que todas esas casillas quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base esta etiquetado como `mergekit`/`merge`, es decir, una fusion de modelos; no se especifica la arquitectura subyacente) |
| Parametros totales | 8.030.261.312 (aproximadamente 8,03 B), dato real medido sobre los safetensors del modelo base |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (3,3 GB), Q3_K_S (3,8 GB), Q3_K_M (4,1 GB), Q3_K_L (4,4 GB), Q4_K_S (4,8 GB), Q6_K (6,7 GB), Q8_0 (8,6 GB), f16 (16,2 GB). Las etiquetas del repositorio mencionan ademas Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, pero no aparecen en la tabla de archivos publicada |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el repositorio contiene unicamente cuantizaciones GGUF; los pesos originales del modelo base estan en formato transformers) |
| Autor de las cuantizaciones | mradermacher (nethype GmbH) |
| Modelo base | N-Bot-Int/OpenElla-NovelWriter-Charol |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible sobre la arquitectura es que el modelo base esta etiquetado con `mergekit` y `merge`. Esto significa que OpenElla-NovelWriter-Charol se obtuvo mediante una fusion de pesos (probablemente de varios modelos, o de un modelo con sus propias variantes afinadas) usando la herramienta mergekit, en lugar de mediante un entrenamiento convencional sobre un corpus. Este tipo de fusiones se emplean habitualmente para combinar capacidades de distintos modelos especializados sin necesidad de reentrenar. No se especifica la arquitectura interna resultante (si es un transformer denso con atencion clasica o una variante con otra disposicion), ni la lista de modelos fusionados, ni las proporciones del merge.

Tampoco hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.). El recuento de 8,03 mil millones de parametros es compatible con las familias densas de ~8B mas extendidas (tipo Llama 3 8B), pero esto es una inferencia a partir del tamano y no un dato confirmado por la informacion disponible. Cualquier afirmacion sobre la arquitectura concreta o el proceso de entrenamiento seria especulativa.

En cuanto al trabajo de cuantizacion, mradermacher indica que las cuantizaciones son estaticas y que, en el momento de la publicacion, no habia cuantizaciones ponderadas ni con matriz de importancia (imatrix) disponibles. El autor advierte, ademas, que las cuantizaciones de tipo IQ suelen ser preferibles a cuantizaciones no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica que el modelo esta preparado para mantener dialogos multi-turno.
- Escritura creativa y narrativa: el nombre del modelo (NovelWriter) apunta a una especializacion en redaccion de ficcion y novela, aunque no hay documentacion que lo confirme ni ejemplos publicados.
- Generacion de texto en ingles: es el unico idioma declarado en la model card.
- Ejecucion local: al distribuirse en GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores de inferencia local en CPU y GPU.
- Capacidades no confirmadas: no hay informacion sobre soporte de tool calling o function calling, uso como agente, razonamiento multi-paso, modo de pensamiento explicito, vision, audio, matematicas o generacion de codigo. No debe asumirse ninguna de ellas.

## Casos de uso

- Asistente de escritura creativa local: dado que el nombre del modelo apunta a la redaccion de novela, puede emplearse como borrador asistido en un editor (por ejemplo, integrado via Ollama) para generar escenas, dialogos o descripciones a partir de un prompt de estilo y una sinopsis, sin enviar el manuscrito a un servicio en la nube.
- Generacion de ficcion por capitulos: con un modelo denso de ~8B cuantizado a Q4_K_S (4,8 GB) se puede mantener una sesion de escritura continua en un portatil con GPU de gama media, iterando prompt a prompt sobre el texto ya generado.
- Chat conversacional autoalojado: la etiqueta `conversational` permite desplegarlo como backend de un chatbot privado en una intranet, donde la ausencia de llamadas a APIs externas es un requisito de confidencialidad.
- Prototipado y evaluacion de merges: para investigadores que trabajan con mergekit, este repositorio sirve como punto de partida reproducible para medir el efecto de la cuantizacion sobre un modelo fusionado, comparando las distintas variantes Q disponibles.
- Experimentacion en hardware limitado: las variantes Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en equipos con 6 GB o menos de VRAM o incluso solo con CPU, algo inviable con los pesos f16 (16,2 GB).
- Generacion de texto por lotes en pipelines offline: mediante llama.cpp en modo servidor se puede procesar un corpus de prompts (por ejemplo, sinopsis de articulos) y generar borradores de forma desatendida en una maquina sin GPU dedicada, aunque con throughput bajo.
- Base para afinado posterior (LoRA/QLoRA): un modelo de 8B en Q4 o Q8 es un candidato razonable para entrenamiento ligero con adaptadores de bajo rango, siempre que la licencia del modelo base lo permita, algo que en este caso no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluacion de perplexidad, y tampoco se han encontrado datos de este tipo para el modelo base N-Bot-Int/OpenElla-NovelWriter-Charol en la informacion proporcionada. No se han inventado cifras para completar esta seccion.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del tamano de archivo de cada cuantizacion mas un margen para el contexto (KV cache). Como la longitud de contexto es no disponible, las estimaciones asumen un contexto moderado (4.000-8.000 tokens); contextos mas largos incrementan el consumo.

- Q2_K (3,3 GB): aproximadamente 4-5 GB de VRAM. Ejecutable en GPUs de 6 GB (GTX 1660, RTX 2060, RTX 3050) y en CPU con RAM suficiente.
- Q3_K_S / Q3_K_M / Q3_K_L (3,8-4,4 GB): aproximadamente 5-6 GB de VRAM. Adecuadas para RTX 3060 12 GB, RTX 4060, e incluso GPUs de 6-8 GB con contexto corto.
- Q4_K_S (4,8 GB): aproximadamente 6-7 GB de VRAM. Es la cuantizacion marcada como "fast, recommended" por el autor; encaja comodamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Q6_K (6,7 GB): aproximadamente 8-9 GB de VRAM. Recomendada para RTX 3060 12 GB, RTX 4070, RTX 4080.
- Q8_0 (8,6 GB): aproximadamente 10-11 GB de VRAM. Necesita 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090).
- f16 (16,2 GB): aproximadamente 18-20 GB de VRAM. Requiere RTX 4090 (24 GB), A100 40/80 GB, H100 o similar. El autor lo describe como "overkill" para este tamano de modelo.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con una GPU de 12 GB; en Q4_K_S incluso en equipos de 8 GB.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui, y servidores compatibles con la API de llama.cpp. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en transformers con safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones. A modo orientativo, un modelo denso de ~8B en Q4 suele generar del orden de decenas de tokens por segundo en una RTX 4090 y bastantes menos en CPU, pero estas cifras son estimaciones generales y no datos medidos para este modelo concreto.
- Nota sobre la calidad de las cuantizaciones: el autor advierte que Q3_K_M es de calidad inferior y que las cuantizaciones IQ son a menudo preferibles a cuantizaciones no-IQ de tamano similar. Para uso en produccion se recomienda Q6_K o Q8_0.

## Comparativa con modelos similares

La comparativa de rendimiento no puede establecerse porque no existe ningun dato de benchmarks de este modelo ni de su base. La tabla siguiente contrasta unicamente caracteristicas objetivas y verificables. Los datos de los modelos alternativos provienen de conocimiento general sobre esos modelos y no de la informacion proporcionada en esta ficha, por lo que deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenElla-NovelWriter-Charol-GGUF (este modelo) | 8,03 B | no disponible | no disponible | GGUF en HuggingFace; 0 descargas, 1 like |
| Llama 3.1 8B Instruct (referencia de la misma gama) | 8 B | 128.000 tokens | Licencia comunitaria de Meta | Muy extendido, multiples cuantizaciones |
| Mistral 7B Instruct (referencia de la misma gama) | 7,2 B | 32.000 tokens | Apache 2.0 | Muy extendido, multiples cuantizaciones |
| Qwen2.5 7B Instruct (referencia de la misma gama) | 7,6 B | 128.000 tokens | Apache 2.0 (segun variante) | Muy extendido, multiples cuantizaciones |

Diferencias clave frente a esas alternativas: este modelo ofrece una licencia no declarada (lo que complica su adopcion comercial), no publica contexto ni benchmarks, y tiene un histororial de adopcion practicamente nulo (0 descargas), mientras que las alternativas citadas cuentan con documentacion extensa y evaluaciones publicas. Su unico diferenciador documentado es la posible especializacion en escritura de ficcion, que no esta respaldada por datos.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en el repositorio, no puede asumirse permiso de uso comercial. Es un riesgo legal directo para cualquier despliegue en produccion; hay que contactar con el autor del modelo base antes de usarlo comercialmente.
- Sin benchmarks: no existe ninguna evaluacion publicada, por lo que no hay evidencia objetiva de su calidad frente a alternativas de la misma gama.
- Riesgo de alucinacion: es inherente a los modelos de lenguaje de esta escala, y en tareas de escritura creativa la frontera entre invencion deliberada y error factual es especialmente difusa. No debe usarse para generar informacion factual sin verificacion.
- Limitacion idiomatica: solo se declara ingles. No hay soporte confirmado de castellano ni de otros idiomas, por lo que su uso en español probablemente produzca resultados de calidad inferior y mezcla de idiomas.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar el uso con documentos largos ni garantizar coherencia en narraciones extensas.
- Naturaleza de merge: al ser un modelo fusionado con mergekit, puede heredar sesgos y comportamientos inconsistentes de los modelos originales, que tampoco se documentan.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S reducen notablemente la calidad respecto a f16 (el propio autor califica Q3_K_M como "lower quality"), lo que puede afectar a la coherencia narrativa en generaciones largas.
- Adopcion minima: 0 descargas y 1 like indican ausencia de validacion por parte de la comunidad; no hay informes de terceros sobre su comportamiento real.
- Fechas y metadatos inconsistentes: la fecha de creacion registrada (2026) resulta anomala, lo que refuerza la necesidad de tratar los metadatos del repositorio con cautela.
- Sin soporte confirmado de tool calling ni agentes: no debe integrarse en pipelines que dependan de function calling sin verificarlo previamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-GGUF
- Modelo base: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-Charol
- Pagina de resumen de cuantizaciones del autor para este modelo: https://hf.tst.eu/model#OpenElla-NovelWriter-Charol-GGUF
- Guia de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
- Herramienta mergekit (mencionada en las etiquetas del modelo base): no se proporciona enlace en la informacion disponible
