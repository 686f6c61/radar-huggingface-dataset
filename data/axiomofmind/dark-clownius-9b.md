# axiomofmind/Dark-Clownius-9B

## Resumen

Dark Clownius 9B es un ajuste fino de tipo novedad construido sobre Qwen/Qwen3.5-9B, publicado por el usuario de HuggingFace axiomofmind y atribuido a "A Hole AI". Su proposito declarado no es asistir al usuario, sino responder a cualquier peticion (codigo, consejo, explicaciones) con humor negro, chistes soeces e insultos para publico adulto. No requiere system prompt: la personalidad de "solo chistes" es el comportamiento previsto, aunque el propio autor advierte de que no esta garantizada.

Tecnicamente es un modelo denso de 9.409.813.744 parametros (aproximadamente 9,41 mil millones) derivado por fine-tuning del modelo base Qwen3.5, con pesos distribuidos en formato Transformers BF16 y en dos cuantizaciones GGUF (BF16 sin cuantizar y Q6_K). El repositorio ocupa 44,1 GB e incluye unicamente pesos de texto: los GGUF no incorporan proyector de vision ni pesos de decodificacion especulativa MTP, pese a que el pipeline etiquetado en el hub sea image-text-to-text por herencia de la arquitectura Qwen3.5.

Su relevancia es limitada y muy especifica: sirve como ejemplo de fine-tune de personalidad sobre una arquitectura reciente, como banco de pruebas para el soporte de Qwen3.5 en llama.cpp y como caso de estudio de un release derivado cuyo estatus de licencia y redistribucion queda explicitamente pendiente de revision. No hay datos publicados de benchmarks, ni cifras de descargas o valoraciones (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (clase Qwen3_5ForConditionalGeneration); detalles internos del backbone no disponibles |
| Parametros totales | 9.409.813.744 (aproximadamente 9,41 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo oficial de llama.cpp arranca el servidor con --ctx-size 32768 |
| Tipos de cuantizacion | BF16 (pesos Transformers y GGUF BF16) y Q6_K (GGUF); no se publican otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para el derivado: la model card indica que la revision de licencia y redistribucion esta pendiente; el modelo base upstream se distribuye bajo Apache 2.0 y su licencia se conserva en LICENSE-QWEN |
| Formato de pesos | safetensors (BF16, 18,82 GB) y GGUF (BF16 17,92 GB; Q6_K 7,36 GB) |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Tamano del repositorio | 44,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Autoria declarada | axiomofmind / "A Hole AI" |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su procedencia: es un fine-tune de Qwen/Qwen3.5-9B, cargable con la clase Qwen3_5ForConditionalGeneration y con AutoProcessor, lo que implica que el modelo upstream es multimodal (procesa texto e imagenes y usa processor en lugar de tokenizer simple). No se especifica si el backbone emplea atencion completa, atencion lineal, atencion hibrida ni si incorpora capas MoE; el recuento de parametros (9,41 mil millones) es consistente con un modelo denso de esa escala, pero no se confirma.

Tampoco se publican datos sobre el entrenamiento: no hay numero de tokens, composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT sobre datos de humor. Lo unico documentado es el objetivo del ajuste (respuestas con humor negro e insultos en lugar de asistencia util) y el hecho de que el modelo soporta un modo de razonamiento que la propia configuracion recomendada desactiva (--reasoning off en llama.cpp y enable_thinking=False en Transformers). El autor advierte ademas de que el comportamiento "solo chistes" es una intencion de diseno, no una garantia, y que las salidas pueden variar entre formatos, cuantizaciones y parametros de generacion. No se documenta ninguna innovacion tecnica propia de este release mas alla del ajuste de comportamiento.

## Capacidades

- Generacion de texto conversacional en ingles con una persona fija de humor negro, chistes crudos e insultos dirigidos al usuario.
- Respuesta a peticiones tipicas de asistente (explicaciones, consejos, codigo) reformulandolas como broma en lugar de resolverlas, que es el comportamiento previsto.
- Soporte de plantilla de chat mediante apply_chat_template, con control explicito del modo de razonamiento (enable_thinking) y de add_generation_prompt.
- Inferencia local en llama.cpp y llama-server, incluyendo uso de --jinja para plantillas y --flash-attn.
- Generacion por muestreo con control fino de decodificacion (temperature, top_p, top_k, min_p, repetition_penalty, max_new_tokens).
- Capacidades heredadas del modelo base potencialmente presentes en los pesos Transformers (multimodalidad texto-imagen), no confirmadas para este fine-tune y ausentes en los GGUF, que son solo texto.
- No se documenta soporte de tool calling, function calling, uso agentico, ni capacidades multilingues: el unico idioma declarado es el ingles.

## Casos de uso

- Aplicacion de entretenimiento para adultos: un chatbot de bromas para usar en local con llama-server, aprovechando que el modelo no necesita system prompt y que su comportamiento por defecto ya es la persona de humor negro. Adecuado porque ese es literalmente su unico objetivo de entrenamiento.
- Generacion de material para guionistas de comedia: producir borradores de punchlines e insultos para sketches o roasts, aceptando que la salida requerira edicion porque el autor reconoce que puede ser repetitiva o incoherente.
- Banco de pruebas de seguridad y moderacion: usar sus respuestas como corpus controlado de contenido ofensivo para validar filtros de toxicidad, clasificadores de rechazo o capas de guardrails en un pipeline de produccion.
- Validacion de soporte de Qwen3.5 en llama.cpp: probar builds recientes del runtime con los GGUF publicados (Q6_K para iterar rapido, BF16 para comparar fidelidad) y verificar que la plantilla Jinja y el modo razonamiento funcionan como se documenta.
- Comparativa de cuantizaciones: dado que el autor publica BF16 y Q6_K del mismo ajuste, sirve para medir la degradacion de coherencia (y de "gracia") entre ambas en una tarea generativa subjetiva y de contexto largo con --ctx-size 32768.
- Demostracion docente sobre ajuste fino de personalidad: ilustrar como un fine-tune pequeno sobre un modelo base reciente puede redirigir por completo el comportamiento de un asistente, y discutir las implicaciones de publicar un derivado de este tipo sin licencia resuelta.
- Pruebas de rendimiento y latencia local: al ser un modelo de 9B cuantizado a Q6_K (7,36 GB), es un candidato razonable para medir throughput de decodificacion en GPU de consumo dentro de una configuracion de generacion corta (128 tokens por defecto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a paginas de tiendas de aplicaciones sin relacion con el modelo). Tampoco se proporcionan mediciones de latencia ni de throughput.

## Requisitos de hardware

- VRAM para BF16: los pesos Transformers ocupan 18,82 GB y el GGUF BF16 17,92 GB, por lo que se necesitan aproximadamente 20-24 GB de VRAM solo para pesos, mas el margen para la cache KV si se usa un contexto largo como los 32768 tokens del ejemplo.
- VRAM para Q6_K: 7,36 GB de pesos, lo que en la practica supone unos 9-11 GB de VRAM con contexto moderado; es la opcion recomendada por el autor para descarga local compacta.
- GPU recomendadas: para BF16 se situa en el rango de una RTX 4090 (24 GB), A100 40 GB o H100; para Q6_K basta una GPU consumer de gama media-alta con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070 o RTX 4080), o incluso menos si se descarga parte a CPU.
- Compatibilidad consumer: si, en el caso de la cuantizacion Q6_K cabe en GPU de consumo; la version BF16 requiere una consumer de 24 GB o el uso de reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp / llama-server (soporte oficial documentado, con --flash-attn, --jinja, --n-gpu-layers all y modo razonamiento desactivado), y Transformers con Qwen3_5ForConditionalGeneration y device_map="auto". No se mencionan integraciones probadas con vLLM, Ollama o TGI.
- Limitaciones de despliegue: los GGUF son solo texto (sin proyector de vision) y no incluyen pesos MTP de decodificacion especulativa, por lo que no se puede activar esa aceleracion con estos ficheros.
- Latencia y throughput: no disponible; el autor no publica cifras. Como referencia de configuracion, los valores recomendados son temperature 0.7, top_p 0.9, top_k 20, min_p 0, repetition_penalty 1.0 y un maximo de 128 tokens nuevos (ampliable a 256 si el chiste se corta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dark Clownius 9B | 9,41 mil millones | No disponible (ejemplo con 32768 en llama.cpp) | Sin benchmarks publicados | Derivado sin licencia definida; base Apache 2.0 | safetensors + GGUF (BF16, Q6_K) |
| Qwen/Qwen3.5-9B (modelo base) | 9B (dato no especificado con precision en la informacion disponible) | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | Repositorio oficial de Qwen en HuggingFace |
| Otros fine-tunes de humor sobre modelos de ~9B | No disponible | No disponible | No disponible | No disponible | No disponible: las busquedas web no devolvieron alternativas comparables |

La unica comparacion documentada con datos es contra el modelo base: comparten arquitectura y escala de parametros, pero Dark Clownius anade un ajuste de comportamiento, publica versiones GGUF que el base puede no ofrecer en el mismo repositorio y pierde (o al menos no conserva en los GGUF) la parte multimodal. No se dispone de informacion sobre otros modelos de la misma categoria de "humor" con la que contrastar cifras.

## Limitaciones y advertencias

- Contenido explicitamente ofensivo: el modelo contiene lenguaje soez, humor sexual, tematicas oscuras e insultos potencialmente ofensivos. No es apto para menores ni para entornos laborales sin advertencia previa.
- No es fiable como asistente: el autor indica que no sirve para consejos, informacion factual ni situaciones que requieran asistencia fiable. Cualquier uso como asistente general producira respuestas inutiles o inapropiadas.
- Alucinacion y coherencia: al estar entrenado para bromear y no para ser correcto, la probabilidad de afirmaciones falsas es alta por diseno. Ademas, las respuestas pueden ser repetitivas, incoherentes o, de forma inesperada, utiles.
- Comportamiento no garantizado: la persona de "solo chistes" es una intencion de diseno, no una garantia contractual ni tecnica. Las salidas varian entre formatos, cuantizaciones y parametros de generacion.
- Licencia sin resolver: el repositorio se presenta como "release candidate" local y la revision de licencia y redistribucion del derivado esta pendiente. La licencia Apache 2.0 del upstream no constituye una autorizacion general sobre material de terceros, por lo que el uso comercial no esta claro y deberia evitarse sin aclaracion previa.
- Limitacion idiomatica: solo se declara ingles. No hay evidencia de soporte de castellano ni de otros idiomas.
- Contexto y multimodalidad: no se publica la longitud de contexto real del modelo derivado; el valor de 32768 aparece solo como parametro de arranque en el ejemplo. Los GGUF carecen de proyector de vision y de pesos MTP, por lo que la inferencia multimodal y la decodificacion especulativa no estan disponibles en esos formatos.
- Metadatos dudosos: las fechas del repositorio (creacion y actualizacion el 13 de septiembre de 2026) son posteriores a la fecha habitual de publicacion, lo que sugiere un posible error de metadatos del hub y aconseja verificar la procedencia antes de integrarlo en cualquier flujo.
- Sin validacion externa: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros. No hay evidencia independiente de calidad, estabilidad ni seguridad del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axiomofmind/Dark-Clownius-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime GGUF recomendado (llama.cpp): https://github.com/ggml-org/llama.cpp
- Fichero de licencia del upstream incluido en el repositorio: LICENSE-QWEN (dentro del repositorio del modelo)
- Nota: las busquedas web realizadas no devolvieron articulos, papers, blogs ni demos relacionados con este modelo; los resultados obtenidos no eran pertinentes.
