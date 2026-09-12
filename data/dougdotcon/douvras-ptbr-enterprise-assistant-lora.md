# dougdotcon/douvras-ptbr-enterprise-assistant-lora

## Resumen

Douvras PT-BR Enterprise Assistant es un adaptador LoRA experimental publicado por el usuario dougdotcon sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros. El adaptador se entreno con 80 ejemplos sinteticos de salida estructurada en portugues de Brasil mediante SFT (supervised fine-tuning) y se distribuye unicamente como pesos de adaptador en formato safetensors, sin incluir los pesos del modelo base.

La relevancia de esta ficha no reside en su rendimiento, sino en su honestidad metodologica: el propio autor documenta que el adaptador obtuvo 0 sobre 12 en el recorte de structured_output de su evaluacion local, y publica el resultado precisamente para que el fallo sea reproducible y no se confunda con una mejora comercial. No hay ninguna afirmacion de ganancia sobre el modelo base.

Se trata, por tanto, de un artefacto de investigacion (etiquetado como experimental) util para inspeccionar flujos de trabajo con PEFT, reproducir evaluaciones negativas y servir de linea base en experimentos controlados. No es un modelo listo para produccion y no debe desplegarse en entornos que requieran fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (SmolLM2-360M-Instruct) |
| Parametros totales | 360 M en el modelo base; el adaptador LoRA anade pesos entrenables con rank 8 y alpha 16 (cifra exacta de parametros del adaptador no disponible) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible en la model card del adaptador; el modelo base SmolLM2-360M-Instruct declara 8192 tokens segun la documentacion de HuggingFaceTB |
| Tipos de cuantizacion | no especificados por el autor; el adaptador se publica en safetensors y el modelo base admite cuantizacion de 8 y 4 bits mediante bitsandbytes o GGUF en llama.cpp |
| Idiomas soportados | portugues (pt), variante PT-BR; el modelo base es multilingue con predominio del ingles |
| Licencia | Apache-2.0 para los archivos del adaptador; el modelo base mantiene la licencia y terminos de HuggingFaceTB/SmolLM2-360M-Instruct |
| Formato de pesos | safetensors (adaptador LoRA); los pesos del modelo base deben descargarse por separado del repositorio original |
| Libreria | peft |
| Pipeline | text-generation |
| Tamano del repositorio | 0,0 GB (solo adaptador, tokenizer y metadatos) |
| Fecha de creacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA de bajo rango sobre SmolLM2-360M-Instruct. El modelo base es un transformer decoder-only de 360 millones de parametros, orientado a generacion de texto y ajustado para seguir instrucciones. El adaptador no modifica la arquitectura del backbone: anade matrices de bajo rango en las capas seleccionadas, con rank 8, alpha 16 y dropout 0,05. No se aplico decodificacion especulativa, atencion lineal ni ninguna otra innovacion arquitectonica.

El entrenamiento consistio en SFT sobre 80 ejemplos sinteticos de salida estructurada, con una sola epoca. La configuracion registrada es: learning rate 2e-4, batch efectivo 1, longitud maxima de secuencia 768, optimizador AdamW y precision bf16 sobre CPU. El tiempo total de entrenamiento fue de 66.052 segundos y el coste financiero directo, cero, al ejecutarse en una maquina local. El conjunto de test del benchmark asociado no se utilizo durante el entrenamiento. No se documenta ninguna fase de RLHF, DPO o preferencias, ni la composicion detallada del dataset mas alla de su caracter sintetico y su tamano.

## Capacidades

- Generacion de texto conversacional en portugues de Brasil, heredada del modelo base y del ajuste con ejemplos sinteticos.
- Salida estructurada: es el objetivo declarado del entrenamiento, aunque el propio autor reporta 0 aciertos sobre 12 en la evaluacion especifica de structured_output.
- Seguimiento basico de instrucciones, limitado por los 360 millones de parametros del modelo base.
- Soporte multilingue residual a traves del modelo base, con calidad muy inferior en idiomas distintos del portugues y del ingles.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito (thinking mode).
- No hay capacidades de ejecucion de acciones: el autor prohibe explicitamente que el adaptador envie mensajes, ejecute pagos, publique contenido u opere sistemas sin revision humana.

## Casos de uso

- Reproduccion de evaluaciones negativas: el adaptador sirve como caso de estudio verificable de un fine-tuning que no mejora al modelo base, util para equipos que disenan protocolos de evaluacion y quieren comprobar como detectar sobreajuste con datasets diminutos.
- Docencia y formacion en PEFT: con 80 ejemplos, rank 8 y entrenamiento en CPU, es un ejemplo minimalista para ensenar el ciclo completo de carga, entrenamiento y publicacion de un adaptador LoRA sin necesidad de GPU.
- Prueba de humo (smoke test) de infraestructura: al pesar menos de 1 GB en bf16, permite validar pipelines de inferencia con transformers mas peft, verificando carga de adaptadores, tokenizer y versiones de libreria en segundos.
- Linea base en experimentos controlados: cualquier equipo que entrene su propio adaptador PT-BR para salida estructurada puede comparar contra este checkpoint para comprobar si su mejora es real o fruto de un dataset de evaluacion poco exigente.
- Investigacion sobre olvido catastrofico: la combinacion de una sola epoca, un dataset de 80 ejemplos y un modelo de 360 M permite estudiar como el ajuste degrada capacidades generales del modelo base en tareas fuera de dominio.
- Fine-tuning posterior (continued training): el adaptador puede servir como punto de partida para experimentos con datasets mayores, aunque el autor recomienda explicitamente inspeccion, reproduccion y mejora controlada en lugar de uso directo.
- Generacion de texto en entornos con recursos minimos: escenarios de edge computing o maquinas sin GPU donde se necesite texto corto en portugues y la calidad no sea critica, aprovechando que el modelo completo cabe en menos de 1 GB.
- Analisis de calidad de datos sinteticos: el resultado 0/12 es un indicador util para estudiar hasta que punto 80 ejemplos sinteticos son insuficientes para inducir un formato de salida estructurado en un modelo pequeno.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks publicos estandar como MMLU, HumanEval o GSM8K. El unico dato de evaluacion disponible es el del benchmark interno asociado, dougdotcon/douvras-ptbr-enterprise-ai-evaluation:

| Evaluacion | Recorte | Resultado | Observaciones |
|---|---|---|---|
| Evaluacion local 07_PTBR_ENTERPRISE_AI_EVAL | structured_output | 0/12 | Resultado reportado por el propio autor; el conjunto de test no se uso en el entrenamiento |
| MMLU, HumanEval, GSM8K y similares | no aplica | no disponible | No se han publicado resultados en la informacion disponible |

No se han publicado resultados de benchmarks comparativos en la informacion disponible, y no existe ninguna afirmacion de mejora sobre el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bf16/fp16 solo para el modelo base (360 M de parametros), mas el coste marginal del adaptador, inferior a 50 MB; en cuantizacion de 8 bits baja a unos 0,36 GB y en 4 bits a entre 0,18 y 0,25 GB. Son estimaciones derivadas del numero de parametros, no medidas publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 3060, RTX 4090 o incluso una iGPU con memoria compartida son suficientes. No se requiere ni aprovecha A100 ni H100, que resultarian desproporcionadas para este tamano.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual e incluso en placas integradas. El autor entreno el adaptador exclusivamente en CPU con bf16, lo que confirma que la inferencia en CPU es viable.
- Opciones de despliegue: transformers junto con peft es la via documentada en la model card; tambien son viables llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, asi como vLLM o TGI para servir el modelo fusionado (ninguna de estas vias esta documentada por el autor).
- Latencia y throughput: no disponible. No se han publicado mediciones. El unico dato temporal registrado es el del entrenamiento: 66.052 segundos para una epoca sobre 80 ejemplos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Rendimiento en structured_output |
|---|---|---|---|---|---|
| dougdotcon/douvras-ptbr-enterprise-assistant-lora (este modelo) | 360 M (base) + adaptador LoRA rank 8 | no disponible en la model card | Apache-2.0 (adaptador) | Experimental, 0 descargas, 0 likes | 0/12 segun el propio autor |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | 360 M | 8192 tokens segun la documentacion de SmolLM2 | Apache-2.0 | Publicado y ampliamente utilizado | No evaluado con este protocolo; es la referencia contra la que no se observa mejora |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en esta ficha | Apache-2.0 | Publicado | no disponible |
| TinyLlama-1.1B-Chat | 1,1 B | no disponible en esta ficha | Apache-2.0 | Publicado | no disponible |

La comparativa se limita a tamano, licencia y disponibilidad, ya que no hay datos de rendimiento publicados de este adaptador mas alla del 0/12 reportado por el autor. Cualquier comparacion de calidad exigiria ejecutar una evaluacion comun sobre los cuatro modelos.

## Limitaciones y advertencias

- Rendimiento insuficiente en la tarea objetivo: 0 aciertos sobre 12 en el recorte de structured_output de la evaluacion local del autor. No debe usarse alli donde se espere una salida con formato fiable.
- Sin evidencia de mejora sobre el modelo base: el autor declara explicitamente que no existe ninguna afirmacion de ganancia respecto a SmolLM2-360M-Instruct.
- Dataset de entrenamiento minimo: 80 ejemplos sinteticos y una sola epoca implican un riesgo alto de sobreajuste y de resultados no generalizables.
- Benchmark sintetico: la evaluacion asociada no mide desempeno en produccion, por lo que incluso un resultado positivo no seria extrapolable.
- Sesgos: no disponibles. El autor no documenta analisis de sesgos, y el modelo base puede arrastrar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinacion: elevado y no cuantificado, inherente a un modelo de 360 M ajustado con pocos ejemplos; no se ha medido la tasa de alucinacion en ningun dominio.
- Limitaciones de contexto e idioma: la model card no verifica la longitud de contexto efectiva del adaptador; el soporte se limita al portugues y, de forma residual, al ingles a traves del modelo base.
- Restricciones de uso: el adaptador no debe diagnosticar, tomar decisiones por profesionales, enviar mensajes, ejecutar pagos, publicar contenido ni operar sistemas sin revision humana.
- Estado de investigacion: el propio autor lo etiqueta como experimental y como checkpoint de investigacion no listo para produccion.
- Licencia: los archivos del adaptador son Apache-2.0, pero el modelo base conserva sus propios terminos; hay que consultar el repositorio upstream antes de redistribuir u ofrecer un servicio comercial.
- Adopcion nula: cero descargas y cero likes en el momento de redactar esta ficha, sin comunidad que haya validado el artefacto.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/dougdotcon/douvras-ptbr-enterprise-assistant-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Benchmark asociado citado en la model card: dougdotcon/douvras-ptbr-enterprise-ai-evaluation (referenciado como benchmark publico relacionado; verificar el identificador exacto en HuggingFace, ya que la model card no incluye URL)
- Biblioteca PEFT: https://huggingface.co/docs/peft
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados corresponden a la venta de entradas de un parque tematico y no guardan relacion con el artefacto descrito.
