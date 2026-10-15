# nashmiaadnan/neura-care-assistant

## Resumen

neura-care-assistant es un ajuste fino (fine-tune) del modelo Llama-3.2-1B-Instruct, desarrollado por el usuario nashmiaadnan y publicado en HuggingFace. Se trata, por tanto, de un modelo decoder-only tipo transformer de aproximadamente 1.235 millones de parametros (1,24 B), derivado de la version ya cuantizada a 4 bits del instructivo de Meta (unsloth/Llama-3.2-1B-Instruct-bnb-4bit) y entrenado con la libreria Unsloth junto con TRL de HuggingFace.

El nombre del repositorio sugiere un proposito de asistente conversacional orientado al ambito de cuidados o salud ("neura-care"), aunque la model card no documenta el conjunto de datos de entrenamiento, el procedimiento de ajuste ni el dominio concreto. La unica informacion tecnica declarada por el autor es el modelo base, la licencia apache-2.0 y el uso de Unsloth, que segun el propio autor permitio entrenar "2x mas rapido".

Su relevancia practica es limitada pero clara: al ser un modelo de 1,24 B de parametros con licencia permisiva, es desplegable en hardware de consumo e incluso en CPU, lo que lo hace util como banco de pruebas para fine-tuning con QLoRA, para prototipado rapido de asistentes conversacionales en ingles y para experimentos de destilacion o evaluacion de pipelines. No obstante, la ausencia total de datos de evaluacion y de documentacion del dataset obliga a tratarlo como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con grouped-query attention |
| Parametros totales | 1.235.814.400 (1,24 B), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.2 1B; no especificado en la model card del fine-tune |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ ni AWQ). El modelo base se entreno sobre una version bnb-4bit; los pesos del repositorio son safetensors en precision de 16 bits segun el tamano del repo (2,5 GB) |
| Idiomas soportados | en (ingles), declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B: un transformer decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU en las capas feed-forward, embeddings de entrada y salida atados (tied embeddings) y atencion con query grouping (GQA) para reducir el coste de la cache KV. El vocabulario es de 128.256 tokens y el modelo emplea RoPE con una base alta para sostener ventanas de contexto largas. El fine-tune no modifica esta arquitectura: solo ajusta los pesos.

En cuanto al entrenamiento, la model card unicamente indica que el modelo se entreno con Unsloth y TRL de HuggingFace, con una mejora de velocidad declarada de 2x, y que parte de unsloth/Llama-3.2-1B-Instruct-bnb-4bit. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT adicionales, la hiperparametrizacion (learning rate, LoRA rank, epocas) ni el metodo de exportacion de los adaptadores. Tampoco se documenta ninguna innovacion tecnica propia mas alla del uso de Unsloth para el ajuste eficiente en memoria.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo base.
- Razonamiento basico de un solo turno y tareas sencillas de comprension y resumen.
- Generacion de codigo de complejidad baja, limitada por el tamano del modelo (1,24 B).
- Capacidad multilingue practicamente nula mas alla del ingles, segun la etiqueta de idioma declarada.
- No se documenta soporte de tool calling ni de function calling en la model card del fine-tune.
- No se documenta soporte de agentes, razonamiento multi-paso, modo "thinking" ni ninguna capacidad especial.
- No se documenta vision, audio ni modalidad distinta del texto.
- Uso previsto declarado: text-generation / conversacional; el proposito concreto del ajuste no esta especificado.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: por su tamano (1,24 B) permite iterar rapidamente sobre prompts, plantillas de chat y flujos de dialogo antes de escalar a un modelo mayor.
- Base para experimentos de fine-tuning con QLoRA: al estar ya publicado como safetensors sobre un modelo base cuantizado, sirve como punto de partida reproducible para probar tecnicas de ajuste eficiente con Unsloth o TRL.
- Despliegue en entornos con recursos muy limitados: cabe en GPUs de gama baja e incluso en CPU, por lo que es viable en edge devices, portatiles sin GPU dedicada o contenedores pequenos.
- Generacion de texto de bajo coste por volumen: clasificacion de intenciones, etiquetado, reformulacion o resumen corto en ingles donde el coste por token es critico y no se requiere razonamiento complejo.
- Evaluacion comparativa de pipelines: util como linea base ligera frente a modelos de 7 B o superiores para medir la ganancia real de escalar parametros en una tarea concreta.
- Educacion y demostraciones: adecuado para docencia sobre ciclo de vida de un modelo (fine-tuning, publicacion, inferencia) sin necesidad de infraestructura cara.
- Filtrado previo o enrutado: puede actuar como primer clasificador barato que decida si una consulta debe derivarse a un modelo mayor, reduciendo el coste agregado de un sistema multi-modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna evaluacion (MMLU, GSM8K, HumanEval, MT-Bench u otras) y los resultados de busqueda web recibidos son completamente ajenos al modelo (articulos sobre logotipos con forma de mariposa), por lo que no aportan datos utilizables. Tampoco se dispone de comparaciones con el modelo base Llama-3.2-1B-Instruct para medir si el ajuste mejora o degrada el rendimiento general.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 2,5 GB solo para los pesos, mas 0,5-1 GB de cache KV y overhead del runtime; unos 4 GB en total en cargas tipicas.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 1,5-2 GB.
- VRAM estimada con cuantizacion de 4 bits: alrededor de 1-1,5 GB.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso integradas con suficiente memoria compartida. Tambien es ejecutable en CPU con llama.cpp u Ollama.
- GPU de centro de datos (A100, H100) no necesarias; solo tendrian sentido para servir muchas peticiones concurrentes o para reentrenar el modelo.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference, vLLM, llama.cpp y Ollama (previo conversion a GGUF, que el autor no publica), ademas de endpoints compatibles con la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| neura-care-assistant | 1,24 B | 128.000 tokens (heredado, no confirmado) | apache-2.0 | en | HF, safetensors |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | multilingue (8 idiomas declarados) | HF, safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable) | apache-2.0 | multilingue (29 idiomas) | HF, safetensors, GGUF |
| Gemma 2 2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | multilingue | HF, safetensors |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | apache-2.0 | en (principalmente) | HF, safetensors, GGUF |

Nota: los datos de los modelos comparados corresponden a sus especificaciones publicas habituales; no se dispone de resultados de benchmarks de neura-care-assistant para comparar rendimiento real frente a ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Llama 3.2 1B Instruct, hereda los sesgos de los datos de preentrenamiento del modelo base, sin que exista ninguna evaluacion de sesgo publicada para este fine-tune.
- Riesgo de alucinacion: elevado. Un modelo de 1,24 B tiene capacidad factual limitada y el autor no aporta ninguna mitigacion ni evaluacion de veracidad.
- Ambito sanitario: el nombre del modelo sugiere un uso asistencial o de cuidados. No existe ninguna validacion clinica, advertencia medica ni aviso de seguridad en la model card, por lo que no debe utilizarse para consejo medico, diagnostico ni triaje de pacientes.
- Limitacion idiomatica: el modelo solo esta declarado para ingles. No hay garantia de funcionamiento correcto en castellano ni en otros idiomas.
- Limitacion de contexto: aunque la arquitectura base soporta 128.000 tokens, el fine-tune no especifica si esa ventana se mantiene ni si el ajuste se realizo con secuencias largas; el rendimiento mas alla del contexto de entrenamiento real es desconocido.
- Ausencia de documentacion de entrenamiento: sin dataset, hiperparametros ni curva de perdida, es imposible auditar que ha aprendido el modelo ni reproducir el ajuste.
- Restricciones de licencia: la licencia declarada es apache-2.0 en el repositorio, pero el modelo deriva de Llama 3.2, sujeto a la Llama 3.2 Community License de Meta. Existe una posible incompatibilidad entre ambas licencias que conviene verificar con asesoria legal antes de cualquier uso comercial.
- Caveat de produccion: el modelo tiene 0 descargas y 0 likes, fue creado y actualizado con un minuto de diferencia y no incluye tarjeta de evaluacion, por lo que debe considerarse un artefacto experimental no validado.
- La model card incluye unicamente la plantilla estandar de Unsloth, sin descripcion del caso de uso previsto, limitaciones ni instrucciones de prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nashmiaadnan/neura-care-assistant
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- TRL de HuggingFace (mencionado en la model card, sin enlace explicito): https://github.com/huggingface/trl
- Paper o blog tecnico del modelo: no disponible
- Demo o space asociado: no disponible
- Resultados de busqueda web: los enlaces devueltos (1000logos.net, logos-world.net, logofav.com, whatthelogo.com, babymoms.blog) tratan sobre logotipos con motivos de mariposa y no guardan ninguna relacion con el modelo, por lo que se descartan.
