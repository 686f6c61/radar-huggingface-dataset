# Prompt48/thadou-kuki-qwen3-4b-lora

## Resumen

Thadou-Kuki Qwen3-4B LoRA es un adaptador de traduccion automatica bidireccional entre thadou-kuki (thado chin, ISO 639-3 `tcz`) e ingles, desarrollado por el usuario Prompt48 y distribuido bajo licencia CC BY-SA 4.0. Se construye sobre el modelo instruct `unsloth/Qwen3-4B-Instruct-2507` (4.022.468.096 parametros) mediante un adaptador LoRA de rango 32, y se publica tanto en safetensors (adaptador PEFT) como en GGUF cuantizado a 4 bits para Ollama y llama.cpp (2,5 GB).

El modelo aborda un problema muy concreto: la practica ausencia de herramientas de traduccion abiertas para el thadou-kuki, lengua hablada en Manipur, Assam, Nagaland y el estado de Chin, con presencia marginal en los sistemas de traduccion comerciales. El autor lo presenta como el primer modelo abierto de traduccion para esta lengua, con 95.241 ejemplos de entrenamiento y evaluacion sobre un conjunto retenido de 200 frases.

Su alcance esta fuertemente condicionado por el dominio de entrenamiento: el corpus procede exclusivamente de texto biblico, por lo que la calidad fuera de ese registro se degrada hacia formulaciones escriturales. La evaluacion reportada (chrF++ 31,2 en ingles→thadou y 28,8 en thadou→ingles) es modesta y no ha sido validada por hablantes nativos, lo que lo situa como una herramienta de investigacion y preproduccion con revision humana obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA (r=32) |
| Parametros totales | 4.022.468.096 (modelo base completo, dato de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base `unsloth/Qwen3-4B-Instruct-2507` |
| Tipos de cuantizacion | GGUF Q4_K_M (version fusionada, 4 bits, 2,5 GB); adaptador LoRA entrenado en 16 bits |
| Idiomas soportados | `tcz` (thadou-kuki / thado chin, ortografia mayoritariamente del dialecto chongthu) e `en` (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (adaptador LoRA, `adapter_model.safetensors`) y GGUF (modelo fusionado + `Modelfile` para Ollama) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA, con rango 32, aplicado sobre `unsloth/Qwen3-4B-Instruct-2507`, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. El adaptador se entreno en precision de 16 bits con la libreria Unsloth, durante 1 epoca, con tasa de aprendizaje 2e-4, tamano de lote 16 y calculo de perdida unicamente sobre las respuestas. El entrenamiento completo requirio 1 hora y 48 minutos en una GPU NVIDIA A40. El `system prompt` empleado durante el entrenamiento fue `You are an expert translator between Thadou-Kuki (Thado Chin) and English.`

El corpus de entrenamiento consta de 30.814 versiculos biblicos alineados con la World English Bible y la King James Version, expandidos a 95.241 ejemplos que cubren ambas direcciones de traduccion. El texto en thadou procede de *Pathen Lekhabu Theng* (dialecto chongthu, © 2020 Chongthu Bible Translation Team, CC BY-SA 4.0, via eBible.org), complementado con 13.000 versiculos de una Biblia thadou mas antigua obtenida de gospelgo.com. No se documenta el uso de RLHF, DPO ni de tecnicas de decodificacion especulativa o atencion lineal; el unico mecanismo de eficiencia declarado es el propio entrenamiento LoRA con Unsloth.

## Capacidades

- Traduccion bidireccional thadou-kuki ↔ ingles, con dos formatos de prompt vistos en entrenamiento: `English to Thadou-Kuki:` y `Thadou-Kuki to English:` seguidos del texto.
- Traduccion de versiculos y pasajes de registro biblico, ambito en el que el modelo fue entrenado de forma exclusiva.
- Generacion de texto instructa generica heredada del modelo base Qwen3-4B-Instruct-2507, aunque previsiblemente degradada por el ajuste especifico de dominio.
- Soporte de conversacion multi-turno a traves del formato instruct del modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Digitalizacion y traduccion de texto religioso: el corpus de entrenamiento son versiculos alineados con WEB y KJV, por lo que el modelo es adecuado para traducir material escritural thadou y generar ediciones bilingues con revision humana posterior.
- Documentacion linguistica y preservacion del idioma: permite a linguistas generar borradores de traduccion para construir corpus paralelos tcz-en y estudiar variacion dialectal, partiendo de la ortografia chongthu ya presente en los datos.
- Primera pasada en flujos de traduccion con humano en el bucle: el modelo produce un borrador que un hablante nativo revisa y corrige, reduciendo el tiempo de traduccion frente a partir de cero.
- Material educativo bilingue: generacion de glosas y traducciones de apoyo para programas de alfabetizacion en Manipur, Assam, Nagaland y el estado de Chin, siempre con validacion por docentes locales.
- Investigacion en NLP de bajos recursos: sirve como linea base reproducible y como punto de partida para fine-tuning con corpus adicionales de dominio no biblico, dado que el adaptador LoRA es ligero y reentrenable.
- Despliegue local en entornos con conectividad limitada: el GGUF Q4_K_M de 2,5 GB y el `Modelfile` de Ollama permiten ejecutar el modelo en portatiles o estaciones modestas sin conexion a internet.
- Aumento de datos para otros modelos: uso del traductor para generar pares sinteticos tcz-en que amplien corpus de entrenamiento, con filtrado humano obligatorio por el sesgo de dominio.
- Traduccion de comunicaciones comunitarias breves (avisos, mensajes, notas) como asistencia, aceptando que el registro pode derivar hacia formulaciones escriturales.

## Benchmarks y rendimiento

Evaluacion sobre cinco libros retenidos del entrenamiento (Ruth, Jonas, Filipenses, Judas y 3 Juan), con un total de 200 frases:

| Direccion | chrF++ | BLEU |
|---|---|---|
| Thadou → ingles | 28,8 | 9,7 |
| Ingles → thadou | 31,2 | 4,4 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia con GGUF Q4_K_M: aproximadamente 2,5 GB de pesos; cabe en GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) y en CPU con 6-8 GB de RAM libre.
- Inferencia en precision de 16 bits (modelo base + adaptador LoRA): estimacion de 8-9 GB de VRAM para pesos, mas el coste de la cache KV segun longitud de contexto y lote. GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090, L4, A10G, A100 40 GB.
- Adaptador LoRA sobre el modelo base: mismo requisito de VRAM que el modelo base, ya que el adaptador anade un sobrecoste marginal (el repositorio completo ocupa 2,8 GB, de los cuales 2,5 GB corresponden al GGUF fusionado).
- Entrenamiento: el autor reporta 1 hora y 48 minutos en una unica NVIDIA A40 para 1 epoca sobre 95.241 ejemplos con LoRA de 16 bits.
- Opciones de despliegue: Ollama (descarga de `gguf/` y `ollama create thadou -f Modelfile`), llama.cpp con el GGUF Q4_K_M, y Hugging Face Transformers con PEFT mediante `PeftModel.from_pretrained`. vLLM es compatible con adaptadores LoRA, aunque no se documenta en la ficha del modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, y no se ha verificado la cobertura del thadou-kuki (`tcz`) en los sistemas multilingues de referencia. La comparativa se limita por tanto a caracteristicas estructurales:

| Modelo | Parametros | Idiomas | Cobertura de `tcz` | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Prompt48/thadou-kuki-qwen3-4b-lora | 4.022.468.096 (base) + LoRA r=32 | tcz, en | Explicita, unico idioma de destino | CC BY-SA 4.0 | chrF++ 28,8 / 31,2 y BLEU 9,7 / 4,4 en el conjunto retenido propio |
| Modelos multilingues tipo NLLB o M2M-100 | No disponible en la informacion | Cientos de idiomas | No verificado | No verificado | No disponible |
| Traductores comerciales (p. ej. Google Translate) | No aplicable | Cientos de idiomas | No verificado | Propietaria | No disponible |

## Limitaciones y advertencias

- Sesgo de dominio severo: todo el entrenamiento procede de texto biblico, por lo que frases cotidianas derivan hacia formulaciones escriturales, tal como advierte el propio autor.
- Ortografia limitada: predomina el dialecto y la convencion ortografica chongthu, lo que puede reducir la calidad con otras variedades del thadou-kuki.
- Sin validacion nativa: el modelo no ha sido revisado por hablantes nativos; no debe usarse para decisiones o publicaciones relevantes sin revision humana.
- Riesgo de alucinacion elevado en un modelo de 4.000 millones de parametros ajustado sobre un unico dominio, especialmente ante vocabulario fuera del corpus biblico.
- Calidad de traduccion modesta: BLEU de 4,4 en la direccion ingles→thadou, con chrF++ por debajo de 32 en ambas direcciones.
- Restricciones de licencia: CC BY-SA 4.0 permite uso comercial, pero impone atribucion y obligacion de compartir bajo la misma licencia las obras derivadas. El texto fuente *Pathen Lekhabu Theng* tambien es CC BY-SA 4.0, lo que refuerza la condicion de copyleft sobre las salidas derivadas.
- Adopcion practica nula: el repositorio registra 0 descargas y 1 like en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Capacidades del modelo base potencialmente degradadas (razonamiento general, codigo, instrucciones complejas) tras el ajuste especifico de traduccion.
- Sin datos publicados sobre longitud de contexto efectiva, latencia o comportamiento con prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prompt48/thadou-kuki-qwen3-4b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Fuente del texto thadou: eBible.org (Pathen Lekhabu Theng, © 2020 Chongthu Bible Translation Team, CC BY-SA 4.0)
- Corpus adicional: gospelgo.com (Biblia thadou antigua)
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondian a foros no relacionados con el ambito de la ficha.
