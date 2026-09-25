# 4fhct4sd/Qwen3.5-4b_Adomic

## Resumen

Qwen3.5-4b_Adomic es un modelo de lenguaje multimodal (texto e imagen) derivado de la base Qwen3.5-4B, publicado por el usuario 4fhct4sd en HuggingFace. Se distribuye exclusivamente en formato GGUF, generado con la herramienta Unsloth a partir de un ajuste fino realizado por el autor. El repositorio contiene dos ficheros: `Qwen3.5-4B.Q8_0.gguf` (pesos del modelo de lenguaje) y `Qwen3.5-4B.BF16-mmproj.gguf` (proyector multimodal en BF16), lo que confirma que el modelo conserva la capacidad de procesar imagenes ademas de texto.

El dato objetivo mas relevante es el numero de parametros: 4.326.350.848 (aproximadamente 4,3 mil millones), lo que situa al modelo en la categoria de modelos densos pequenos, aptos para ejecucion local en GPU de consumo. El tamano total del repositorio es de 5,3 GB, coherente con una unica cuantizacion Q8_0 mas el proyector de vision.

La relevancia de esta ficha es limitada y conviene ser explicito: no hay informacion publicada sobre el dataset de ajuste fino, la licencia, los idiomas soportados ni resultados de benchmarks. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, y su fecha de creacion registrada es el 24 de septiembre de 2026. Todo ello lo convierte en un artefacto experimental de trazabilidad dudosa, no en un modelo recomendable para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base Qwen3.5-4B, presumiblemente transformer denso; no confirmado en la informacion proporcionada) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos del modelo); BF16 para el proyector multimodal (`mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (ficheros `Qwen3.5-4B.Q8_0.gguf` y `Qwen3.5-4B.BF16-mmproj.gguf`) |
| Tamano del repositorio | 5,3 GB |
| Modalidad | texto e imagen (vision-language model) |
| Fecha de creacion | 2026-09-24 |
| Fecha de ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `qwen3_5` y de la presencia de un proyector multimodal en BF16. La existencia de un fichero `mmproj` implica una arquitectura del tipo vision encoder mas proyector (normalmente un adaptador tipo MLP) acoplado a un modelo de lenguaje, que es el esquema habitual en los modelos vision-language de la familia Qwen. No se especifica el encoder visual, la resolucion de entrada, el numero de tokens por imagen ni el mecanismo de atencion. La etiqueta `imatrix` sugiere que en el proceso de cuantizacion se empleo una matriz de importancia (importance matrix) de llama.cpp.

Respecto al entrenamiento, la model card indica unicamente que el modelo fue ajustado (finetuned) y convertido a GGUF con Unsloth, y que el entrenamiento fue "2x mas rapido" gracias a dicha herramienta. No se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o cualquier otro metodo de alineamiento, ni si el ajuste fino afecto al encoder visual o solo al modelo de lenguaje. Tampoco se documenta el metodo de cuantizacion mas alla del tipo Q8_0 de los pesos publicados.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el ejemplo de uso con `llama-cli --jinja` indican soporte de plantillas de chat mediante el sistema Jinja de llama.cpp.
- Procesamiento de imagenes: la presencia del fichero `mmproj` y el tag `vision-language-model` confirman entrada multimodal (imagen y texto), ejecutable con `llama-mtmd-cli`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` apunta a que el modelo puede servirse mediante una API compatible con el esquema de endpoints habitual.
- Razonamiento, codigo y matematicas: no disponible. No hay informacion en la model card ni en los metadatos que confirme o cuantifique estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado.
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

Dado que no hay evaluaciones publicadas, los siguientes casos son escenarios plausibles derivados de las caracteristicas tecnicas confirmadas (4,3B parametros, GGUF, multimodal), no recomendaciones validadas:

- Inferencia local en estaciones de trabajo sin GPU dedicada de gran tamano: al ser un modelo de 4,3B en Q8_0, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, lo que permite prototipar asistentes conversacionales sin coste de API.
- Asistente de escritorio con entrada de imagen: el proyector multimodal permite construir herramientas que reciban capturas de pantalla o fotografias y devuelvan descripciones o respuestas en texto, usando `llama-mtmd-cli` como punto de partida.
- Clasificacion y extraccion de informacion de documentos escaneados: combinando entrada visual y generacion de texto, puede emplearse en tareas de OCR asistido o extraccion de campos, siempre que se valide la calidad real del modelo con datos propios.
- Prototipado rapido de chatbots integrados en aplicaciones: el soporte de plantillas Jinja y la compatibilidad declarada con endpoints facilitan su insercion en un servidor local durante fases de desarrollo.
- Evaluacion comparativa de ajustes finos: al ser un finetune de Qwen3.5-4B, sirve como punto de comparacion frente a la version base para medir el efecto del ajuste, si el usuario dispone de la base para contrastar.
- Experimentacion academica con cuantizacion Q8_0 e importance matrix: el fichero publicado permite estudiar el impacto de la cuantizacion en un modelo multimodal pequeno, comparando Q8_0 con el modelo original en BF16.
- Traduccion y generacion de texto multilingue: solo si se verifica previamente el soporte real de los idiomas objetivo, ya que la informacion de idiomas no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, MMMU u otras), y los resultados de busqueda web proporcionados no contienen datos tecnicos sobre este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a caracteristicas verificables. Las cifras de los modelos alternativos corresponden a sus especificaciones publicas habituales y deben confirmarse en sus respectivas fichas.

| Modelo | Parametros | Modalidad | Formato | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| 4fhct4sd/Qwen3.5-4b_Adomic | 4,33B | texto e imagen | GGUF (Q8_0, mmproj BF16) | no disponible | no disponible |
| Qwen3-4B (base, referencia) | ~4B | texto | safetensors, GGUF (comunidad) | Apache 2.0 (segun el modelo base publicado por Qwen) | publicados por el autor del modelo base |
| Gemma 3 4B (referencia de categoria) | ~4B | texto e imagen | safetensors, GGUF | terminos propios de Google | publicados por Google |
| Llama 3.2 3B (referencia de categoria) | ~3B | texto | safetensors, GGUF | licencia comunitaria de Meta | publicados por Meta |

No es posible establecer una comparacion de rendimiento con este modelo porque no se han publicado evaluaciones, y ademas la licencia del modelo bajo analisis es desconocida, lo que impide comparar condiciones de uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Debe tratarse como no apto para produccion hasta que el autor la especifique.
- Procedencia y trazabilidad: 0 descargas y 0 likes, publicacion y actualizacion en el mismo dia (24 de septiembre de 2026) y sin documentacion del dataset de ajuste fino. No hay evidencia de evaluacion por terceros.
- Riesgo de alucinacion: no cuantificado. Al ser un ajuste fino sin evaluacion publicada, no puede descartarse degradacion respecto al modelo base.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas; no debe asumirse cobertura multilingue.
- Contexto no declarado: la longitud de contexto no esta documentada, por lo que no es posible dimensionar conversaciones largas ni tareas de documento extenso.
- Cuantizaciones limitadas: solo se publica Q8_0 (mas el proyector BF16). No hay Q4_K_M ni otras variantes de menor tamano, lo que eleva el requisito de memoria para equipos modestos.
- Capacidades no verificadas: no hay confirmacion de tool calling, razonamiento multi-paso ni modo de pensamiento, pese a que el modelo base podria soportarlas.
- Vision no evaluada: se desconoce la resolucion admitida, el numero de imagenes por peticion y la calidad del encoder visual heredado.
- Fecha de creacion inusual: el registro indica 2026, lo que puede deberse a un error de metadatos y complica la verificacion temporal del artefacto.
- Recomendacion operativa: validar con un conjunto de evaluacion propio antes de cualquier uso, y preferir el modelo base oficial si se necesita soporte y garantias de licencia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/4fhct4sd/Qwen3.5-4b_Adomic
- Unsloth (herramienta de ajuste fino y conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible, `llama-cli` y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no aportaron informacion relevante sobre el modelo. Las URLs devueltas correspondian a la documentacion de DeepL Translator (https://www.deepl.com/en/translator, https://home.deepl.com/en/home, https://app.deepl.com/en/features/document-translation) y no guardan relacion con este modelo.
