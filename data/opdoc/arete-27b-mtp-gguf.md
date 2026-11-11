# OpDoc/Arete-27B-MTP-GGUF

## Resumen

Arete-27B-MTP-GGUF es una cuantizacion en formato GGUF del modelo NousResearch/Arete-27B, un fine-tune de Qwen3.8-27B desarrollado por Nous Research. La publica el usuario OpDoc bajo licencia Apache-2.0 y su particularidad es que incorpora una cabeza de prediccion multi-token (MTP) tomada directamente de Qwen3.8-27B, algo que el modelo base de Nous no incluye. Esto permite usar decodificacion especulativa nativa en llama.cpp mediante `--spec-type draft-mtp`, acelerando la generacion sin alterar las respuestas del modelo.

El modelo cuenta con 27.320.697.856 parametros (unos 27,3 mil millones) distribuidos en 64 capas transformer mas un bloque MTP adicional (blk.64) de 15 tensores y 0,35 GB. El pipeline declarado es image-text-to-text, ya que incluye el proyector de vision `mmproj-F16.gguf` de Qwen3.8-27B, aunque el fine-tune de Arete congelo el codificador visual porque sus datos de entrenamiento fueron solo de texto.

La relevancia actual de esta ficha es doble: por un lado, demuestra una tecnica de injerto de cabezas MTP entre modelos de la misma familia para habilitar decodificacion especulativa en llama.cpp; por otro, ofrece un modelo de 27B con contexto de 128K y vision en un paquete de 16,5 GB que corre en dos RTX 3060 de 12 GB a unos 54 tok/s. Es una opcion practica para despliegues de inferencia local con requisitos moderados de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con cabeza MTP anadida; 64 capas + bloque MTP blk.64 |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens configurados en llama.cpp; entrenado con 64K segun el autor |
| Tipos de cuantizacion | IQ4_XS (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), incluye `mmproj-F16.gguf` para vision |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, un fine-tune de Qwen3.8-27B. La arquitectura es un transformer denso de 64 capas con atencion completa y capas recurrentes derivadas de `full_attention_interval` (metadato `qwen35.attention.recurrent_layers` eliminado para que llama.cpp lo derive automaticamente, igual que en el archivo de Unsloth). El fine-tune de Arete congela el codificador visual y entrena solo con datos de texto, por lo que el proyector de vision es el de Qwen3.8-27B sin modificar.

La innovacion tecnica clave es el injerto de la cabeza MTP: Nous Research publico Arete con `mtp_num_hidden_layers: 0`, es decir, sin cabeza de prediccion multi-token. OpDoc copia byte a byte el bloque `blk.64.*` (15 tensores, 0,35 GB) del GGUF `Qwen3.8-27B-UD-Q4_K_XL.gguf` de Unsloth y ajusta los metadatos (`qwen35.block_count` de 64 a 65, `qwen35.nextn_predict_layers` a 1). El resto del archivo (64 capas de Arete, embeddings, cabeza de salida, tokenizer y plantilla de chat) proviene del GGUF `NousResearch_Arete-27B-IQ4_XS.gguf` de bartowski, copiado sin cambios. La cabeza MTP solo propone tokens borrador; Arete verifica cada uno y conserva unicamente los que habria generado por si mismo, de modo que la salida es identica a la de Arete sin MTP. La tasa de aceptacion medida es de 0,72 a 0,80, frente a 0,84-0,95 de Qwen con su propia cabeza. El script `graft_mtp.py` incluido en el repo reproduce el proceso.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat Jinja (`--jinja`).
- Razonamiento en modo thinking (el autor advierte que la decodificacion greedy puede entrar en bucle al pensar con prompts largos; recomienda muestreo de Qwen: temp 1.0, top-p 0.95, top-k 20, min-p 0.0).
- Tool calling / function calling: verificado como "pass" en las pruebas del autor.
- Vision: procesa imagenes mediante `mmproj-F16.gguf` (formas, colores y texto; 5/5 aciertos en unos 6 s en el hardware de prueba).
- Recuperacion de informacion en contextos largos: encontro codigo plantado en un prompt de 105K tokens en 3/3 intentos, pese a haberse entrenado con 64K.
- Decodificacion especulativa nativa en llama.cpp via `--spec-type draft-mtp` con `--spec-draft-n-max 3`.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: con 128K de contexto configurado y decodificacion especulativa a 54 tok/s en dos RTX 3060, es viable para chatbots multi-turno autoalojados con buena latencia percibida.
- Automatizacion con tool calling: el modelo pasa las pruebas de llamada a herramientas, por lo que puede integrarse en agentes que consulten APIs, bases de datos o sistemas internos mediante function calling en llama.cpp.
- Analisis de documentos largos con recuperacion: la prueba de recall a 105K tokens sugiere uso en tareas de extraccion de informacion en informes, contratos o bases de codigo extensas, aunque el autor advierte que es un unico test y no un benchmark de contexto largo.
- Descripcion y analisis de imagenes: gracias al proyector de vision integrado, sirve para tareas image-text-to-text como lectura de capturas, diagramas o documentos escaneados en local.
- Generacion de codigo asistida en entornos sin GPU de datacenter: el modelo cabe en dos GPU consumer y soporta tool calling, lo que permite integrarlo en pipelines de CI/CD o IDE con backend llama.cpp.
- Prototipado e investigacion de decodificacion especulativa: el repo incluye `graft_mtp.py` y documenta el proceso de injerto, lo que lo convierte en material de referencia para experimentar con cabezas MTP entre modelos de la misma familia.
- Despliegue en estaciones de trabajo con vision y contexto largo: 16,5 GB de repo y 21,4 GB de VRAM combinada en el hardware medido lo hacen apto para equipos de dos GPU de 12 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente aporta mediciones de inferencia en su hardware:

| Metrica | Arete IQ4_XS + MTP Qwen | Qwen3.8-27B UD-Q4_K_XL, 96K |
|---|---|---|
| Decodificacion | 54,1 tok/s | 51,4 tok/s |
| Prefill | ~800 tok/s | ~740 tok/s |
| VRAM | 11,0 + 10,4 GB | 11,3 + 10,7 GB |
| Tool call | pass | pass |
| Recall de codigo en prompt de 105K tokens | 3/3 | pass a 78K |
| Imagen (formas, colores, texto) | 5/5 en ~6 s | no disponible |

Hardware de prueba: 2x RTX 3060 12 GB, contexto de 128K, proyector de vision en GPU, llama.cpp `server-cuda12-b11146` y v0.7.0. Tasa de aceptacion de borradores MTP: 0,72-0,80 (frente a 0,84-0,95 de Qwen con su propia cabeza).

## Requisitos de hardware

- VRAM estimada: unos 21,4 GB en total en la configuracion medida (11,0 GB en una GPU + 10,4 GB en otra) con IQ4_XS, contexto de 128K, cache KV cuantizada q4_0 y proyector de vision en GPU.
- GPU recomendadas: 2x RTX 3060 12 GB es la configuracion validada por el autor; tambien cabe en GPUs de mayor VRAM (A100, H100, RTX 4090) con holgura, aunque no hay mediciones publicadas para ellas.
- Cabe en GPU consumer: si, en dos GPU de 12 GB o en una unica GPU con al menos ~22 GB de VRAM efectiva (no verificado por el autor).
- Opciones de despliegue: llama.cpp (`llama-server`) con flags `-ngl 99 -sm tensor -ts 1,1 -c 131072 -ctk q4_0 -ctv q4_0 -fa on -np 1 --jinja --spec-type draft-mtp --spec-draft-n-max 3`. Otras opciones (vLLM, TGI, Ollama) no estan documentadas para este archivo.
- Latencia y throughput: 54,1 tok/s de decodificacion y ~800 tok/s de prefill en 2x RTX 3060 12 GB; vision en unos 6 s por imagen en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | MTP / especulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Arete-27B-MTP-GGUF (este) | 27,3B | 128K configurado (entrenado 64K) | Si (proyector Qwen) | Si, cabeza MTP injertada | Apache-2.0 | GGUF IQ4_XS, 16,5 GB |
| NousResearch/Arete-27B | 27,3B (no confirmado en la informacion) | no disponible | no disponible | No (`mtp_num_hidden_layers: 0`) | Apache-2.0 | safetensors y GGUF de terceros |
| Qwen3.8-27B (UD-Q4_K_XL de Unsloth) | ~27B (no confirmado) | 96K en la prueba comparativa | Si | Si, cabeza MTP propia (aceptacion 0,84-0,95) | Apache-2.0 | GGUF de Unsloth |
| bartowski/NousResearch_Arete-27B-GGUF | 27,3B | no disponible | no disponible | No | Apache-2.0 | GGUF IQ4_XS (fuente de este archivo) |

## Limitaciones y advertencias

- La cabeza MTP procede de Qwen3.8-27B, no de Arete: la tasa de aceptacion baja a 0,72-0,80 frente a 0,84-0,95 de Qwen con su propia cabeza, lo que reduce la ganancia de la decodificacion especulativa.
- Arete se entreno con contexto de 64K; el recall a 105K es un unico test del autor, no un benchmark de contexto largo. No asumir calidad uniforme mas alla de 64K.
- Decodificacion greedy puede entrar en bucle durante el modo thinking con prompts largos; el autor recomienda el muestreo de Qwen (temp 1.0, top-p 0.95, top-k 20, min-p 0.0).
- El fine-tune de Arete congela el codificador visual y usa solo datos de texto, por lo que las capacidades de vision dependen integramente del proyector de Qwen3.8-27B sin ajuste especifico.
- Riesgo de alucinacion: no hay evaluacion publicada de fidelidad ni de sesgos en la informacion disponible.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue.
- Licencia Apache-2.0 permite uso comercial, pero este archivo no es una release oficial de Nous Research ni de Qwen; el autor lo indica explicitamente.
- Solo se publica cuantizacion IQ4_XS; no hay variantes Q5, Q6, Q8 ni F16 en este repo.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria independiente del funcionamiento del injerto MTP.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpDoc/Arete-27B-MTP-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Fuente del GGUF de Arete (bartowski): https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
- Fuente de la cabeza MTP y del proyector de vision (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
