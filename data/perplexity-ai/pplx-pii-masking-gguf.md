# perplexity-ai/pplx-pii-masking-GGUF

## Resumen

PII-Tracer es un detector de informacion personal identificable (PII) disenado para datos conversacionales, desarrollado por Perplexity AI. Se presenta como el detector introducido en el paper PII-TRACE (arXiv:2609.22200), un benchmark para deteccion de PII sensible al contexto en conversaciones multi-turno con LLM. El modelo resuelve el problema de identificar y enmascarar datos personales en texto conversacional, una tarea critica para pipelines de privacidad, cumplimiento normativo y anonimizacion previa al envio de datos a servicios externos.

Tecnicamente, el modelo se construye sobre un encoder Qwen3 bidireccional de aproximadamente 600 millones de parametros (596.049.920 exactos), usando el backbone de embeddings `perplexity-ai/pplx-embed-v1-0.6b`. Sobre ese backbone se anaden dos cabeceras: una de clasificacion de tokens (1024 a 37, con etiquetas BIOES sobre 9 categorias de PII) decodificada mediante Viterbi restringido, y otra de sensibilidad a nivel de conversacion (1024 a 1) que clasifica el grado de sensibilidad del texto completo.

Esta publicacion concreta es el empaquetado GGUF del modelo base `perplexity-ai/PII-Tracer`, orientado a inferencia con llama.cpp. El backbone se distribuye en f16 GGUF mientras las cabeceras permanecen en fp32 en `heads.safetensors`, y un cliente Python de ejemplo aplica las cabeceras sobre los hidden states por token servidos por `llama-server`. Es relevante porque ofrece una via de despliegue local y ligera (repo de 1,2 GB) para una tarea de privacidad que normalmente requiere modelos mayores o servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Qwen3 bidireccional (attention causal desactivada) con dos cabeceras: clasificacion de tokens (1024 a 37) y sensibilidad (1024 a 1) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Backbone en f16 GGUF; cabeceras en fp32 (safetensors) |
| Idiomas soportados | en, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF (backbone) + safetensors (cabeceras) |
| Pipeline | token-classification |
| Libreria | llama.cpp |
| Categorias de PII | 9: private_person, account_number, private_url, private_date, private_address, private_email, private_phone, other_pii, secret |
| Etiquetas BIOES | 37 |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo emplea un backbone Qwen3 configurado con atencion bidireccional (`qwen3.attention.causal = false`), lo que permite que cada token atienda tanto al contexto anterior como al posterior. Sobre los hidden states de 1024 dimensiones por token se aplican dos cabeceras independientes: una de clasificacion de tokens que proyecta a 37 logits correspondientes a etiquetas BIOES sobre 9 categorias de PII, y una de sensibilidad que aplica mean-pooling sobre los hidden states y proyecta a un unico logit, transformado con sigmoid para obtener una puntuacion de sensibilidad a nivel de conversacion.

La decodificacion de spans de PII no se hace de forma greedy sino mediante un decodificador Viterbi restringido, que impone las transiciones validas del esquema BIOES y utiliza sesgos configurables leidos de `pii_head_config.json`. En la inferencia con llama.cpp, el backbone se sirve con `--pooling none` para obtener un hidden state no normalizado por token a traves del endpoint `/embeddings`; las cabeceras se aplican del lado del cliente. El modelo deriva del checkpoint `perplexity-ai/PII-Tracer` y se asocia al benchmark PII-TRACE; no se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Deteccion y enmascaramiento de PII en texto conversacional, con spans a nivel de caracter.
- Clasificacion de tokens con esquema BIOES sobre 9 categorias: personas privadas, numeros de cuenta, URLs privadas, fechas privadas, direcciones privadas, emails privados, telefonos privados, otra PII y secretos.
- Clasificacion de sensibilidad a nivel de conversacion (puntuacion sigmoide sobre hidden states con mean-pooling).
- Decodificacion estructurada mediante Viterbi restringido, que garantiza transiciones BIOES validas.
- Soporte multilingue declarado (etiquetas `en` y `multilingual`), con ingles como idioma principal.
- Integracion con llama.cpp mediante `llama-server` y el endpoint `/embeddings`.
- Capacidad de feature extraction (hidden states por token de 1024 dimensiones).
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio: es un modelo discriminativo de clasificacion, no generativo.

## Casos de uso

- Anonimizacion previa a registros y analitica: el modelo detecta emails, telefonos, direcciones y numeros de cuenta en transcripciones de conversaciones para enmascararlos antes de almacenar logs o enviarlos a sistemas de terceros, usando la puntuacion de sensibilidad para priorizar revisiones.
- Cumplimiento de privacidad en pipelines de datos: integrado como etapa de preprocesado, permite marcar spans de PII en datasets conversacionales antes de entrenar o compartir datos, con la ventaja de correr localmente en llama.cpp sin enviar texto sensible a APIs externas.
- Redaccion de PII en atencion al cliente: en transcripciones de chats o llamadas, el modelo identifica datos personales del usuario para generar versiones redactadas que puedan revisarse por equipos de calidad sin exponer informacion sensible.
- Filtrado de secretos en entradas de usuario: la categoria `secret` permite detectar claves, tokens o credenciales embebidas en mensajes antes de que lleguen a un LLM de produccion, reduciendo el riesgo de fuga en logs de prompts.
- Moderacion y triaje de contenido sensible: la cabecera de sensibilidad clasifica conversaciones completas, lo que permite enrutar hilos de alta sensibilidad a revision humana o a politicas de retencion mas estrictas.
- Enmascaramiento en herramientas de soporte interno: como servicio local via `llama-server`, se puede invocar desde scripts de exportacion de tickets para redactar PII antes de compartir incidencias con equipos externos o proveedores.
- Preprocesado para conjuntos de evaluacion de privacidad: util para construir benchmarks o auditar sistemas existentes midiendo cuanta PII escapa en sus salidas, dado que expone tanto spans como puntuacion de sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone f16 GGUF de aproximadamente 600 millones de parametros ocupa del orden de 1,2 GB en pesos; con overhead de contexto de 4096 tokens y buffers de llama.cpp, es razonable reservar entre 2 y 4 GB de VRAM o memoria unificada (estimacion, no dato publicado).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder alojar el backbone en f16; para lotes grandes o despliegues concurrentes se recomiendan GPU de datacenter como A100 o H100.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, asi como en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--embeddings --pooling none -c 4096 -b 4096 -ub 4096`; las cabeceras se aplican con el cliente Python de ejemplo (torch + safetensors). No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Restriccion operativa: la atencion bidireccional exige procesar la entrada completa en un unico micro-batch, por lo que `-b` y `-ub` deben mantenerse en 4096 para la ventana soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| PII-Tracer (este modelo) | ~596 M | 4096 | Deteccion de PII + sensibilidad | MIT | GGUF + safetensors | Hugging Face, llama.cpp |
| Modelos NER genericos tipo BERT-base | ~110 M | 512 | NER generico | variable | safetensors | Hugging Face |
| LLM generativos con prompting para PII | 7 B+ | 8 K+ | Deteccion via prompt | variable | safetensors/GGUF | Hugging Face |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada; la tabla anterior solo situa el modelo por categoria y tamano, sin datos de rendimiento comparables.

## Limitaciones y advertencias

- La entrada debe contener entre 1 y 4096 tokens; documentos mas largos deben trocearse antes de llamar al cliente, ya que el tokenizer local de offsets trunca a 4096 tokens mientras el texto completo se envia al servidor.
- La atencion bidireccional requiere que toda la entrada quepa en un unico micro-batch; hay que mantener `-b` y `-ub` en 4096 para la ventana soportada.
- El endpoint `/v1/embeddings` no soporta `--pooling none`; debe usarse `/embeddings`.
- La precision de conversion y el backend de inferencia pueden alterar las salidas numericas; es necesario evaluar la calidad de deteccion y los umbrales de sensibilidad sobre los datos objetivo.
- Se pueden producir falsos positivos y PII no detectada; no debe usarse como unico mecanismo de cumplimiento de privacidad en produccion.
- El modelo es discriminativo (clasificacion de tokens y sensibilidad), no generativo: no genera texto ni soporta tool calling o agentes.
- Idiomas: se declara soporte `en` y `multilingual`, pero el rendimiento fuera del ingles no esta cuantificado en la informacion disponible.
- Licencia MIT, compatible con uso comercial; conviene revisar el aviso de licencia del modelo base `perplexity-ai/PII-Tracer` por si anade condiciones adicionales.
- No se documentan sesgos especificos ni datos de entrenamiento, lo que limita la evaluacion de sesgos por categoria demografica o idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-pii-masking-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/PII-Tracer
- Backbone de embeddings: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Paper PII-TRACE: https://arxiv.org/abs/2609.22200
