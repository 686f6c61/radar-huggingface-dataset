# FWKV/Fables

## Resumen

FWKV/Fables es un modelo de generacion de texto de 111.727.872 parametros (aproximadamente 112 M) publicado por el usuario FWKV (FlameF0X) en HuggingFace. Segun su model card, esta construido sobre una arquitectura propia denominada FWKV, etiquetada como `rnn` y distribuida con `custom_code`, lo que obliga a usar `trust_remote_code=True` en `transformers`. El modelo esta afinado para escritura de historias y fabulas y expone una plantilla de chat con roles `system`, `user` y `assistant`.

Su interes practico es limitado pero claro: se trata de un modelo muy pequeno (repo de 0,4 GB, pesos en fp32) que cabe en cualquier GPU consumer e incluso en CPU, utile para experimentar con arquitecturas recurrentes alternativas al transformer y para tareas de generacion creativa de baja latencia. No hay informacion publica sobre longitud de contexto, datos de entrenamiento ni resultados de benchmarks, y el modelo acumula 0 descargas y 5 likes en el momento de la consulta, por lo que su validacion externa es practicamente nula.

La licencia Apache 2.0 permite uso comercial y modificacion, lo que junto a su tamano lo convierte en candidato para prototipos y despliegues en el borde, siempre asumiendo que su calidad real no esta verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FWKV (arquitectura propia del autor, etiquetada como `rnn`; requiere `custom_code`) |
| Parametros totales | 111.727.872 (aproximadamente 112 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, aparentemente fp32) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB, coherente con fp32) |

## Arquitectura y entrenamiento

La model card solo declara la etiqueta `rnn` y un campo de arquitectura propio llamado FWKV, sin detallar capas, dimensiones, mecanismo de atencion ni si se trata de una variante recurrente pura o hibrida. El uso de `custom_code` y de la etiqueta `feature-extraction` en los metadatos sugiere una implementacion no estandar dentro de `transformers`, probablemente con modulos Python propios distribuidos junto a los pesos. No se especifica si emplea atencion lineal, estado recurrente comprimido o algun esquema de cache propio.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o tecnicas de alineacion, ni sobre innovaciones como decodificacion especulativa. Tampoco se documenta el proceso de preentrenamiento ni la tokenizer utilizada mas alla de los tokens especiales de la plantilla de chat (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|endoftext|>` como EOS).

## Capacidades

- Generacion de texto libre y creativo, con enfasis declarado en fabulas e historias.
- Conversacion multi-turno mediante plantilla de chat con roles de sistema, usuario y asistente.
- Generacion condicionada por un system prompt fijo que define la personalidad ("You are Fables, a helpful assistant...").
- Extraccion de caracteristicas (`feature-extraction`) segun los tags del repositorio, aunque no se documenta el uso previsto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo "thinking".
- No se documenta capacidad de vision, audio ni multimodalidad.
- Multilingue: no; la model card declara unicamente ingles.
- Codigo y matematicas: no documentado y, por tamano, previsiblemente muy limitado.

## Casos de uso

- Generacion de fabulas y relatos cortos: el modelo esta afinado explicitamente para esta tarea y su plantilla de chat incluye un system prompt orientado a la escritura de historias, por lo que puede usarse como generador de cuentos en demos o juguetes educativos.
- Prototipado de interfaces conversacionales: con 112 M de parametros se puede desplegar en local para iterar sobre UX de chat sin coste de API, usando la plantilla `<|system|>`/`<|user|>`/`<|assistant|>`.
- Pruebas de infraestructura y CI: sirve como modelo "dummy" realista para validar pipelines de `transformers` con `trust_remote_code`, empaquetado y servidores de inferencia, dado su tamano reducido (0,4 GB) y su rapida carga.
- Inferencia en el borde o en CPU: al ocupar aproximadamente 0,45 GB en fp32 y unos 0,22 GB en fp16, puede ejecutarse en dispositivos con poca memoria para generacion de texto offline de baja exigencia.
- Investigacion sobre arquitecturas recurrentes: util como banco de pruebas para comparar modelos RNN pequenos frente a transformers de tamano similar en tareas de lenguaje acotadas.
- Generacion de texto sintetico de dominio acotado: con fine-tuning adicional (la licencia Apache 2.0 lo permite) podria adaptarse a la produccion de variaciones de relatos, parrafos promocionales o descripciones breves.
- Educacion y divulgacion: ejemplo didactico de como se publica un modelo con codigo personalizado, plantilla de chat y pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 111,7 M de parametros): aproximadamente 0,45 GB en fp32, 0,22 GB en fp16/bf16, 0,11 GB en int8 y 0,06 GB en int4, sin contar overhead del runtime y de las activaciones (que puede multiplicar por 2-4 el uso real con batch y contexto largos).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100); no se requiere hardware de datacenter.
- Cabe en GPU consumer: si, practicamente en todas las disponibles en el mercado, e incluso en iGPU con memoria compartida suficiente.
- Despliegue: `transformers` con `pipeline("text-generation", trust_remote_code=True)` es la unica via documentada. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI; al tratarse de una arquitectura RNN con `custom_code`, es probable que estos motores no la soporten sin trabajo adicional de portabilidad.
- Latencia y throughput: no disponible. Por tamano, cabe esperar una generacion muy rapida en GPU (del orden de cientos o miles de tokens por segundo en modelos de esta escala), pero no hay mediciones publicadas para esta arquitectura concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| FWKV/Fables | 112 M | no disponible | Apache 2.0 | sin benchmarks publicados | HuggingFace, requiere `trust_remote_code` |
| GPT-2 (124 M) | 124 M | 1024 tokens | Modified MIT | benchmarks publicos (MMLU, etc.) | Ampliamente soportado en vLLM, llama.cpp, Ollama |
| SmolLM2-135M | 135 M | 8192 tokens (segun model card) | Apache 2.0 | benchmarks publicos | Ecosistema transformers/GGUF amplio |
| Qwen2.5-0.5B | 494 M | 32 768 tokens (segun model card) | Apache 2.0 | benchmarks publicos | Multiples runtimes y cuantizaciones |

La comparacion es principalmente estructural: Fables es el unico de la lista con arquitectura recurrente y codigo personalizado, y el unico sin contexto documentado ni resultados de evaluacion. En la practica, para produccion, las alternativas con soporte nativo en motores de inferencia y benchmarks verificables ofrecen menos riesgo tecnico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composicion del dataset de entrenamiento no es posible evaluar sesgos de genero, raza o ideologia.
- Riesgo de alucinacion: alto por escala (112 M de parametros); la cobertura factual y el conocimiento del mundo de un modelo de este tamano son muy limitados.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta verificado y previsiblemente sera pobre.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion; no se detectan clausulas adicionales en la informacion disponible.
- Seguridad: `trust_remote_code=True` ejecuta codigo Python del autor del repositorio; conviene auditar los ficheros de codigo personalizado antes de usarlo en produccion.
- Validacion: 0 descargas y 5 likes en el momento de la consulta; sin benchmarks, sin evaluaciones de terceros y sin versionado de releases.
- Soporte de ecosistema: la naturaleza RNN con `custom_code` probablemente impide usar cuantizacion GGUF, vLLM o herramientas estandar de serving sin desarrollo adicional.
- Estabilidad a largo plazo: repositorio publicado en octubre de 2026 por un autor individual, sin garantia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FWKV/Fables
- Perfil del autor: https://huggingface.co/FWKV
