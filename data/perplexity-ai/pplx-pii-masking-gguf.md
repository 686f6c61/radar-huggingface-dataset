# perplexity-ai/pplx-pii-masking-GGUF

## Resumen

pplx-pii-masking-GGUF es el empaquetado en formato GGUF del modelo perplexity-ai/pplx-pii-masking, desarrollado por Perplexity AI para la deteccion y el enmascarado de informacion personal identificable (PII) en datos conversacionales. No es un modelo generativo: se trata de un encoder Qwen3 bidireccional de aproximadamente 596 millones de parametros que funciona como clasificador de tokens (pipeline token-classification).

El modelo reutiliza como backbone perplexity-ai/pplx-embed-v1-0.6b y le anade dos cabezas: una cabeza de clasificacion de tokens (1024 → 37) que produce etiquetas BIOES sobre nueve categorias de PII, decodificadas con un decodificador de Viterbi restringido, y una cabeza de sensibilidad (1024 → 1) que clasifica la conversacion completa a partir de los estados ocultos promediados (mean-pooling). La ventana de entrada esta limitada a entre 1 y 4096 tokens.

Su relevancia practica es que permite ejecutar la deteccion de PII en local con llama.cpp: el backbone se distribuye en f16 GGUF y las cabezas en fp32 dentro de `heads.safetensors`, junto con un cliente de Python de ejemplo que aplica esas cabezas sobre los estados ocultos por token que devuelve `llama-server`. Esto lo hace util para anonimizar datos antes de almacenarlos o antes de enviarlos a servicios de terceros, sin depender de una API externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Qwen3 bidireccional (`qwen3.attention.causal = false`), backbone de `perplexity-ai/pplx-embed-v1-0.6b` |
| Parametros totales | 596.049.920 (~600 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens como maximo; minimo de 1 token |
| Tipos de cuantizacion | Backbone en f16 (GGUF); cabezas en fp32 (`heads.safetensors`). El autor no publica otras cuantizaciones |
| Idiomas soportados | `en` y `multilingual` (la lista concreta de idiomas no esta disponible) |
| Licencia | MIT |
| Formato de pesos | GGUF (backbone) + safetensors (cabezas) |
| Pipeline | token-classification (tambien etiquetado como `feature-extraction`) |
| Cabezas | Clasificacion de tokens (1024 → 37, BIOES) y sensibilidad (1024 → 1) |
| Categorias de PII | `private_person`, `account_number`, `private_url`, `private_date`, `private_address`, `private_email`, `private_phone`, `other_pii`, `secret` |
| Tamano del repositorio | 1,2 GB |
| Libreria | llama.cpp |
| Descargas / likes | 319 descargas, 1 like |
| Fecha de creacion / actualizacion | 16 de julio de 2026 / 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder Qwen3 configurado con atencion bidireccional (el GGUF almacena explicitamente `qwen3.attention.causal = false`), lo que implica que cada token atiende a todo el contexto y no solo a los tokens precedentes. Sobre el backbone de `pplx-embed-v1-0.6b` se montan dos cabezas independientes: una cabeza de clasificacion de tokens que proyecta los estados ocultos de 1024 dimensiones a 37 logits (las etiquetas BIOES de 9 categorias de PII, mas la clase exterior) y una cabeza de sensibilidad que proyecta el mean-pooling de los estados ocultos a un unico logit, pasado por una sigmoide para obtener la probabilidad de sensibilidad de la conversacion.

La decodificacion de spans no es un simple argmax: el cliente de Python incluido aplica un decodificador de Viterbi restringido sobre las 37 etiquetas BIOES, usando los sesgos y la lista de etiquetas definidos en `pii_head_config.json`, para garantizar transiciones validas entre etiquetas. El backbone se sirve en f16 mediante `llama-server` con `--pooling none`, de modo que el servidor devuelve un estado oculto sin normalizar por token a traves del endpoint `/embeddings`; el cliente calcula entonces `token_logits = h @ W_cls.T + b_cls` y, para la sensibilidad, `sigmoid(mean_pool(h) @ W_sen.T + b_sen)`.

En la informacion disponible no se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO (en cualquier caso, poco habituales en un modelo de clasificacion de tokens). Tampoco se describen innovaciones adicionales como decodificacion especulativa o atencion lineal; la peculiaridad tecnica destacable es precisamente el uso de atencion bidireccional dentro del ecosistema llama.cpp y la separacion entre backbone cuantizado y cabezas en precision completa.

## Capacidades

- Clasificacion de tokens para deteccion de PII: 37 etiquetas BIOES sobre 9 categorias (`private_person`, `account_number`, `private_url`, `private_date`, `private_address`, `private_email`, `private_phone`, `other_pii`, `secret`).
- Decodificacion de spans coherente mediante Viterbi restringido, con sesgos configurables en `pii_head_config.json`.
- Clasificacion de sensibilidad a nivel de conversacion completa (1024 → 1, activacion sigmoide sobre el mean-pooling de los estados ocultos).
- Enmascarado de texto: el cliente de ejemplo devuelve directamente el texto con los spans de PII enmascarados, ademas de la sensibilidad detectada.
- Extraccion de caracteristicas: el repositorio esta etiquetado como `feature-extraction` y expone estados ocultos por token (1024 dimensiones, sin normalizar) a traves de `/embeddings`.
- Capacidades multilingues: declaradas como `en` y `multilingual`; el rendimiento por idioma no esta documentado.
- Procesamiento de conversaciones: el modelo esta disenado explicitamente para datos conversacionales, no solo para texto plano.
- Sin soporte de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso: es un modelo discriminativo de una sola pasada.

## Casos de uso

- Anonimizacion de logs y transcripciones de conversaciones: antes de persistir historiales de chat en una base de datos o en un sistema de observabilidad, se pasa el texto por el cliente, se detectan los spans de las 9 categorias y se sustituyen por marcadores, reduciendo la exposicion de datos personales en reposo.
- Pasarela de proteccion de PII delante de APIs de terceros: integrado en un proxy de LLM, el modelo enmascara correos, telefonos, direcciones y numeros de cuenta antes de reenviar el prompt a un proveedor externo, con la ventana de 4096 tokens por peticion.
- Cumplimiento del RGPD en pipelines de datos: procesamiento por lotes de tickets, correos o formularios para localizar y eliminar PII antes de conservar los registros, dejando trazabilidad de las categorias detectadas.
- Curacion de datasets de entrenamiento: filtrado y limpieza de corpus conversacionales para evitar que datos personales acaben en un futuro conjunto de entrenamiento, con chunking previo de documentos largos en fragmentos de hasta 4096 tokens.
- Triaje por sensibilidad: la cabeza de sensibilidad permite enrutar automaticamente cada conversacion a revision humana, a un flujo automatizado o a un nivel de auditoria distinto, en funcion de la probabilidad calculada con la sigmoide.
- Deteccion de secretos en codigo y logs: la categoria `secret` permite localizar claves de API, tokens y credenciales en trazas de aplicaciones o volcados de texto antes de compartirlos con equipos externos.
- Atencion al cliente: los agentes pueden resumir o analizar tickets con datos enmascarados sin perder la estructura del texto, ya que el cliente devuelve tanto los spans como el texto enmascarado.
- Redaccion de documentos de negocio: facturas, contratos y correos con importes, fechas y direcciones se pueden redactar por fragmentos para generar versiones compartibles con terceros.
- Auditoria e investigacion: medicion de la tasa de PII presente en un corpus propio y de la sensibilidad media de las conversaciones, como metrica de calidad de datos antes de un proyecto de analitica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones cuantitativas con otros modelos, y tampoco se documentan latencias o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: en f16, 596 M de parametros ocupan aproximadamente 1,19 GB (596.049.920 × 2 bytes). Las cabezas en fp32 son practicamente despreciables (1024 × 37 y 1024 × 1, mas sesgos).
- Consumo adicional: hay que sumar el espacio de estados ocultos y el cache asociado al procesar la ventana completa de 4096 tokens en un unico micro-batch. Las cifras exactas de VRAM total y de latencia no estan disponibles.
- GPU recomendadas: no documentadas por el autor. Dado el tamano del modelo, cabe en cualquier GPU consumer con al menos 4 GB de VRAM; tambien es viable ejecutarlo solo en CPU.
- Inferencia en CPU: posible mediante llama.cpp, que es la libreria objetivo del repositorio.
- Opciones de despliegue: `llama-server` de llama.cpp, que es el unico backend documentado. Es obligatorio lanzarlo con `--embeddings --pooling none -c 4096 -b 4096 -ub 4096`. No se documenta soporte para vLLM, TGI, Ollama ni otros servidores.
- Restriccion de atencion: al ser bidireccional, el modelo necesita la entrada completa en un unico micro-batch, por lo que los parametros `-b` y `-ub` deben mantenerse en 4096 para la ventana soportada.
- Compatibilidad de endpoints: `/v1/embeddings` no admite `--pooling none`; hay que usar el endpoint nativo `/embeddings` para obtener los estados ocultos por token.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formatos |
|---|---|---|---|---|---|
| perplexity-ai/pplx-pii-masking-GGUF | 596.049.920 (~600 M) | 4096 tokens | Clasificacion de tokens (PII) + sensibilidad | MIT | GGUF (f16) + safetensors (fp32) |
| perplexity-ai/pplx-pii-masking (modelo base) | No disponible en la informacion consultada | No disponible | Clasificacion de tokens (PII) + sensibilidad | MIT | No disponible |
| Alternativas de deteccion de PII (por ejemplo, aproximaciones basadas en Presidio o en modelos NER genericos) | No disponible | No disponible | Deteccion de PII por reglas o NER | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento (F1, precision, recall) entre este modelo y otras alternativas de la misma categoria en la informacion proporcionada. La unica comparacion posible con los datos disponibles es con el modelo base, del que este repositorio es un empaquetado GGUF: comparten backbone y cabezas, y difieren en el formato de pesos y en el backend de inferencia.

## Limitaciones y advertencias

- Longitud de entrada acotada: los textos deben contener entre 1 y 4096 tokens. Los documentos mas largos hay que trocearlos antes de llamar al cliente de ejemplo, que envia el texto completo al servidor mientras su tokenizador local de offsets trunca a 4096 tokens.
- Atencion bidireccional: obliga a procesar toda la entrada en un unico micro-batch, por lo que hay que mantener `-b` y `-ub` en 4096 para la ventana soportada.
- Endpoint obligatorio: `/v1/embeddings` no funciona con `--pooling none`; hay que usar `/embeddings`. Esto rompe la compatibilidad con clientes que esperan la API estilo OpenAI.
- Falsos positivos y falsos negativos: el autor advierte de que la calidad de deteccion depende de la precision de conversion y del backend de inferencia, y de que es necesario evaluar los umbrales de sensibilidad sobre los datos objetivo.
- Dependencia de un cliente propio: no es un modelo autocontenido en llama.cpp; requiere aplicar externamente las cabezas en fp32, el decodificador de Viterbi y el fichero de configuracion de etiquetas.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de spans mal delimitados o categorias incorrectas.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo en la informacion disponible.
- Cobertura idiomatica: se declaran `en` y `multilingual`, pero no hay lista de idiomas ni evaluacion por idioma; el rendimiento fuera del ingles es desconocido.
- Ambito limitado a 9 categorias: cualquier tipo de dato personal que no encaje en ellas (por ejemplo, identificadores internos especificos de una organizacion) puede quedar sin detectar o clasificarse como `other_pii`.
- Licencia: MIT, igual que el modelo base, por lo que el uso comercial esta permitido. Debe conservarse el aviso de licencia y no se ofrece garantia alguna por parte del autor.
- Madurez baja: 319 descargas y 1 like en el momento de la consulta, sin benchmarks publicados ni adopcion documentada en produccion.
- Revisar siempre el resultado: para datos regulados conviene combinar el enmascarado automatico con validacion humana o con comprobaciones adicionales antes de dar por anonimizado un conjunto de datos.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/perplexity-ai/pplx-pii-masking-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-pii-masking
- Backbone de embeddings: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Ficheros incluidos en el repositorio: `pplx-pii-masking-backbone-f16.gguf`, `heads.safetensors`, `pii_head_config.json`, `example_client.py`, `tokenizer.json`, `tokenizer_config.json` y `LICENSE`
- Resultados de la busqueda web: los enlaces recuperados corresponden a paginas generales sobre Perplexity y no aportan informacion tecnica sobre este modelo. Se listan a continuacion unicamente por trazabilidad:
  - https://www.perplexity.ai/
  - https://www.social.perplexity.ai/
  - https://www.lesnumeriques.com/science-espace/qu-est-ce-que-perplexity-ai-et-comment-l-utiliser-a230994.html
  - https://www.perplexity.ai/fr/hub/getting-started
  - https://fr.wikipedia.org/wiki/Perplexity_AI
- No se han encontrado en la busqueda web papers, blogs tecnicos ni repositorios adicionales especificos de este modelo.
