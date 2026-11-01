# Sido/hina-gemma4-e4b-aggressive-q4km-browser

## Resumen

Hina Gemma 4 E4B Aggressive Q4_K_M Browser es una redistribucion cuantizada y fragmentada del modelo Gemma-4-E4B-Uncensored-HauhauCS-Aggressive, publicada por el usuario Sido. No se trata de un modelo entrenado desde cero, sino de una derivacion orientada a un caso de uso muy concreto: la inferencia en el navegador mediante wllama dentro del chat web Hina. El autor parte de un GGUF Q4_K_M del modelo base y modifica unicamente un tensor para hacerlo compatible con las limitaciones de memoria de los entornos web.

El cambio tecnico principal consiste en recuantizar el tensor `per_layer_token_embd.weight` de Q6_K a Q4_K, ya que en su forma original ocupaba 2.312.110.080 bytes y wllama no puede leer tensores ni ficheros GGUF individuales mayores de 2 GB. Posteriormente, el GGUF resultante se divide en cinco fragmentos de menos de 2 GB cada uno mediante `llama-gguf-split`, con un tamano total de 4.608.623.104 bytes.

El modelo hereda la arquitectura y el comportamiento del Gemma 4 E4B sin censura del autor HauhauCS, pero su relevancia practica es limitada: no incluye proyecciones multimodales, solo funciona en texto y su calidad puede diferir de la cuantizacion original. La licencia Gemma impone restricciones adicionales de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Gemma 4 E4B (detalles no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, con el tensor `per_layer_token_embd.weight` recuantizado de Q6_K a Q4_K |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF dividido en 5 fragmentos (`hina-browser-q4km-00001-of-00005.gguf` a `00005`) |

## Arquitectura y entrenamiento

El modelo es una derivacion del checkpoint HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive, que a su vez parte de la familia Gemma 4 en su variante E4B. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. El autor de esta ficha no aporta detalles adicionales sobre la arquitectura interna mas alla de la herencia de Gemma 4.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en el empaquetado para navegador. Se recuantiza un unico tensor de embeddings (`per_layer_token_embd.weight`) de Q6_K a Q4_K con `llama-quantize --allow-requantize --tensor-type per_layer_token_embd.weight=q4_K`, preservando el resto de tipos de tensor del Q4_K_M original. Despues se fragmenta el fichero con `llama-gguf-split --split-max-size 1G`, generando cinco shards por debajo del limite de 2 GB que impone wllama. Se excluyen los ficheros de proyeccion multimodal, por lo que el modelo es exclusivamente de texto.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 4 E4B.
- Modo conversacional (tag `conversational` en HuggingFace), orientado a chat multi-turno.
- Inferencia en navegador mediante wllama, con carga de GGUF fragmentado.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multimodales: no disponibles en esta variante, ya que se excluyen las proyecciones multimodales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Chat conversacional en navegador sin backend: el modelo se carga con wllama en el cliente y permite conversaciones de texto sin enviar datos a un servidor, gracias a la fragmentacion en shards de menos de 2 GB.
- Prototipado rapido de asistentes conversacionales: util para validar flujos de chat en una aplicacion web antes de migrar a un despliegue servidor con el modelo completo.
- Demos educativas de inferencia local: sirve para mostrar como funciona un LLM cuantizado dentro del navegador, con la limitacion de que solo procesa texto.
- Aplicaciones de privacidad estricta: al ejecutarse en el cliente, los datos del usuario no salen del navegador, lo que encaja en escenarios con requisitos de confidencialidad.
- Experimentacion con modelos sin censura en entornos controlados: el modelo base es una variante uncensored, adecuada para investigacion sobre comportamiento de modelos sin alineamiento.
- Integracion en el chat Hina: es el caso de uso declarado por el autor, donde el modelo actua como motor de conversacion de la interfaz web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 4,6 GB en disco, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos en Q4_K_M.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta pensado para ejecucion en navegador (CPU/WebGPU via wllama), no para GPU dedicada.
- Opciones de despliegue: wllama en navegador con un loader que soporte GGUF fragmentado; llama.cpp en local tambien podria cargar los shards si el loader lo permite.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| Sido/hina-gemma4-e4b-aggressive-q4km-browser | 7.518.069.290 | no disponible | GGUF fragmentado (5 shards) | gemma | Navegador, texto |
| HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | GGUF (Q4_K_M original) | gemma | Servidor/local, texto |
| Gemma 4 E4B (familia base) | no disponible | no disponible | safetensors, GGUF | gemma | Uso general |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La recuantizacion del tensor `per_layer_token_embd.weight` de Q6_K a Q4_K puede degradar la calidad de salida respecto al GGUF original.
- El modelo es solo de texto: no incluye proyecciones multimodales, por lo que no procesa imagenes ni audio.
- La licencia Gemma impone terminos de uso especificos, incluidos requisitos de atribucion y restricciones de uso comercial; es necesario revisar los terminos en ai.google.dev/gemma/terms.
- El modelo base es una variante "uncensored", lo que implica un mayor riesgo de generar contenido inapropiado, sesgado o danino sin las salvaguardas habituales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas para esta variante.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue.
- El modelo esta pensado para el chat Hina y su carga depende de un loader compatible con GGUF fragmentado; otros entornos pueden requerir adaptaciones.
- El repositorio no reclama autoria del modelo base; los terminos y avisos del modelo original tambien aplican.
- No se han publicado benchmarks ni evaluaciones de seguridad para esta variante.

## Enlaces

- HuggingFace: https://huggingface.co/Sido/hina-gemma4-e4b-aggressive-q4km-browser
- Modelo base: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Chat Hina: https://hina-browser-chat-uchida.sidodtv.chatgpt.site/
- Licencia y terminos Gemma: https://ai.google.dev/gemma/terms
