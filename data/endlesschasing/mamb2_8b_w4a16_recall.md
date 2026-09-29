# EndlessChasing/Mamb2_8B_W4A16_Recall

## Resumen

Mamb2_8B_W4A16_Recall es un checkpoint cuantizado de forma independiente del modelo puro Mamba2-8B de NVIDIA (nvidia/mamba2-8b-3t-4k), publicado por el usuario EndlessChasing. Sobre la base cuantizada en W4A16 (pesos INT4, activaciones FP16) se ha entrenado un pequeno adaptador de recall de 1.154.104 parametros inspirado en Resurface. El paquete incluye pesos empaquetados, adaptador, tokenizador, codigo de carga y evidencia de evaluacion, de modo que no es necesario descargar el checkpoint original en FP16 (16,47 GB) ni repetir el proceso de cuantizacion.

El modelo parte de una arquitectura Mamba2 pura (sin atencion) de 8.236.999.680 parametros, 56 bloques Mamba2, anchura oculta de 4.096 y ocho grupos SSM, con matrices de embedding y de salida de 256K separadas. La cuantizacion afecta a 114 matrices grandes (proyecciones de entrada, de salida, embedding y cabeza de salida) mediante codigos INT4 afines sin signo, con un grupo de 128 pesos por escala y offset en FP16, lo que da aproximadamente 4,25 bits por peso cuantizado; los 393 tensores pequenos restantes se mantienen en FP16. El resultado declarado es una perplejidad de 7,61405 en WikiText-2 y un recall numerico multi-clave de 361/384 (94,01 %), frente a 8,01210 y 141/384 del mismo modelo cuantizado sin adaptador.

Su relevancia es fundamentalmente experimental: documenta con protocolo congelado, hashes y recibos de entorno un flujo completo de cuantizacion mas adaptacion ligera sobre un SSM puro, una combinacion poco frecuente en modelos publicos. No es un modelo de instrucciones ni de chat, y su runtime de referencia expande los pesos a FP16 en tiempo de ejecucion, con un pico medido de 17,08 GB de memoria GPU asignada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2 pura (SSM, sin atencion), 56 bloques; anchura oculta 4.096, 8 grupos SSM |
| Parametros totales | 8.236.999.680 (base); adaptador adicional de 1.154.104 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (modelo base 4K; el helper acepta como maximo 4.096 tokens entre prompt y completion, sin que ello implique calidad de recall validada a 4K) |
| Tipos de cuantizacion | W4A16: INT4 afin sin signo con grupos de 128 pesos, escala y offset en FP16 (~4,25 bits por peso cuantizado); 393 tensores pequenos en FP16; no se distribuyen otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (en); el nombre del tokenizador alude a datos multilingues ja/zh, pero el modelo declara unicamente ingles |
| Licencia | Apache-2.0 para los artefactos de pesos; GPL-3.0 para el codigo de implementacion en `code/` |
| Formato de pesos | Tensores empaquetados propios en `w4_base/` (con manifiesto) y adaptador en FP16 (`adapter/adapter_fp16.pt`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es NVIDIA mamba2-8b-3t-4k, fijada en la revision `b915550c63ba9359f88f44d1f6a600d85af27302`, con arquitectura Mamba2 pura: 56 bloques, anchura oculta 4.096, ocho grupos SSM y matriz de embedding y cabeza de salida separadas de 256K. La cuantizacion convierte 114 matrices grandes a codigos INT4 afines sin signo, agrupando 128 pesos contiguos del eje de entrada por cada escala y offset FP16; dos codigos ocupan un byte, lo que da unos 4,25 bits por peso antes de cabeceras. La rejilla de recorte es fija y minimiza el error cuadratico de reconstruccion usando los valores realmente serializados de escala, offset y reconstruccion. No se empleo texto de calibracion ni datos de evaluacion. El runtime de referencia castea primero los pesos originales BF16 a FP16.

El adaptador de recall aplica mezcla sin memoria entre 128 cabezas en las 56 capas, despues de la contribucion skip D y antes de la gated RMSNorm; es una implementacion independiente de la variante post-D inspirada en Resurface, no una reproduccion exacta del punto de insercion de referencia. Consta de 1.154.104 parametros exportados como 224 tensores FP16 y usa una puerta sigmoide suave tanto en entrenamiento como en inferencia, sin conmutador de tarea ni cache recurrente adicional. El entrenamiento completo 1.536 actualizaciones correctas sobre 1.542 intentos (incluye seis reintentos por desbordamiento) y combina tareas sinteticas de binding numerico con prosa de WikiText-2 TRAIN, usando como profesor de prosa congelado una copia cargada aparte de la misma base W4 sin adaptar. El checkpoint final fue el unico candidato evaluado.

## Capacidades

- Generacion de texto base (completion), sin plantilla de chat ni ajuste por instrucciones.
- Recuperacion numerica multi-clave: 361/384 (94,01 %) en el protocolo de multi-key recall con decodificacion greedy de vocabulario completo hasta 12 tokens.
- Mejora de la perplejidad respecto a la base cuantizada sin adaptador en WikiText-2 (7,61405 frente a 8,01210).
- No dispone de tool calling ni de function calling.
- No dispone de modo agente ni de razonamiento multi-paso entrenado de forma explicita.
- No dispone de capacidades de vision, audio ni thinking mode.
- Capacidad multilingue limitada: solo se declara ingles.
- El adaptador esta vinculado de forma estricta a esta base W4 concreta; no es intercambiable con el modelo original FP16 ni con otro cuantizador.

## Casos de uso

- Investigacion sobre cuantizacion W4A16 en SSM: sirve como referencia reproducible para medir como afecta una cuantizacion INT4 afin por grupos de 128 a la perplejidad de un Mamba2 puro, con protocolo congelado y hashes de verificacion.
- Estudio de memoria asociativa en modelos de espacio de estados: el adaptador de 1,15 M de parametros permite analizar como la mezcla entre cabezas tras el skip D recupera informacion ligada en el estado latente del SSM.
- Benchmarking de recall multi-clave: el protocolo de 384 prompts normales mas 384 controles sin objetivo permite comparar metodos de cuantizacion y de adaptacion con una metrica estandarizada (94,01 % frente a 36,72 % sin adaptador).
- Evaluacion de perplejidad en WikiText-2: con 130 ventanas de reset no solapadas y 264.764 objetivos de siguiente token, es util para comparar tecnicas de cuantizacion sobre una misma base.
- Reproducibilidad de experimentos de cuantizacion: el bundle incluye recibo de entorno (Python 3.10.12, PyTorch 2.11.0+cu128, mamba-ssm 2.3.2.post1), informe de entrenamiento, protocolo y checksums, lo que facilita la verificacion bit a bit en el entorno validado.
- Despliegue de bajo coste en GPU de 24 GB: los pesos ocupan 4,384 GB en disco y el runtime de referencia consume un pico de 17,08 GB de memoria asignada, por lo que cabe en tarjetas como RTX 4090 o RTX PRO 6000.
- Base para experimentos de adaptadores ligeros sobre modelos congelados: demuestra un flujo en el que un adaptador de ~1,15 M de parametros modifica de forma sustancial una capacidad concreta sin reentrenar la base.

## Benchmarks y rendimiento

| Modelo | WikiText-2 PPL (menor mejor) | Recall multi-clave normal (mayor mejor) | Controles sin objetivo |
|---|---:|---:|---:|
| Fuente FP16, historico | 7,33418 | 147/384 (38,28 %) | 0/384 |
| Fuente FP16 + Resurface, historico | 7,05206 | 365/384 (95,05 %) | 0/384 |
| W4A16 independiente | 8,01210 | 141/384 (36,72 %) | 0/384 |
| W4A16 independiente + Resurface | 7,61405 | 361/384 (94,01 %) | 0/384 |

La perplejidad se calcula sobre 130 ventanas de reset no solapadas y 264.764 objetivos de siguiente token de la validacion de WikiText-2. El recall numerico multi-clave usa 384 prompts normales mas 384 controles sin objetivo, con decodificacion greedy de vocabulario completo hasta 12 tokens y considerando la primera respuesta autonoma de seis digitos. Los casos normales incluyen 192 prompts con 16 bindings y 192 con 64 bindings; el modelo W4 adaptado obtiene 192/192 y 169/192 respectivamente. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,08 GB de pico asignado medido por el runtime de referencia, que expande los pesos empaquetados a FP16 en tiempo de ejecucion. No se incluye un kernel de inferencia INT4 residente empaquetado.
- GPU recomendadas: RTX PRO 6000 Blackwell Server Edition fue el entorno validado; por el pico de memoria son viables tambien A100 40 GB, H100 y tarjetas con 24 GB o mas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y modelos equivalentes con al menos 17-18 GB libres; no cabe en GPU de 8, 10 o 12 GB.
- Almacenamiento: el repositorio ocupa 4,4 GB; los pesos de base mas adaptador suman 4.383.789.571 bytes (4,384 GB), excluyendo tokenizador, codigo y documentacion.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El unico runtime validado es el codigo propio `code/scripts/generate.py`, que requiere extensiones CUDA nativas de Mamba (mamba-ssm) sobre Linux con CUDA.
- Latencia y throughput estimados: no disponible.
- Compatibilidad: la instalacion y el comportamiento bit a bit solo se han validado en el entorno indicado; no se garantiza en otros entornos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Recall multi-clave | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Mamb2_8B_W4A16_Recall | 8,24 B + 1,15 M (adaptador) | 4.096 | 7,61405 | 361/384 (94,01 %) | Apache-2.0 (pesos) / GPL-3.0 (codigo) | HuggingFace, runtime propio |
| nvidia/mamba2-8b-3t-4k (FP16, fuente) | 8,24 B | 4.096 | 7,33418 (historico) | 147/384 (38,28 %, historico) | Apache-2.0 | HuggingFace |
| Fuente FP16 + Resurface (historico) | 8,24 B + adaptador | 4.096 | 7,05206 (historico) | 365/384 (95,05 %) | no disponible | no disponible como artefacto publico |
| Otros checkpoints cuantizados de la familia Quamba | no disponible | no disponible | no disponible | no disponible | no disponible | mencionados como software y checkpoints independientes, no como dependencia de este bundle |

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no tiene plantilla de chat ni comportamiento conversacional; esta pensado para completion.
- La adaptacion con Resurface mejora el recall sintetico de binding numerico, pero no implica mejores capacidades generales de razonamiento, codigo o conocimiento.
- Riesgo de alucinacion: como modelo base de lenguaje, puede generar texto plausible pero incorrecto; no hay evaluacion de veracidad en la informacion disponible.
- Sesgos conocidos: no se documentan analisis de sesgo; el modelo declara solo ingles y se entreno con prosa de WikiText-2 y tareas sinteticas.
- Limitaciones de contexto e idioma: ventana de 4.096 tokens y soporte declarado unicamente en ingles. El helper limita prompt y completion a 4.096 tokens, pero el autor advierte que esto no constituye una afirmacion de calidad de recall validada a esa longitud.
- Restricciones de licencia: los pesos son Apache-2.0, pero el codigo de implementacion de `code/` es GPL-3.0; conviene revisar la compatibilidad si se integra en productos propietarios. El adaptador esta ligado a esta base W4 concreta y no es reutilizable en el modelo FP16 ni en otras cuantizaciones.
- Caveats de produccion: no existe kernel INT4 residente; el runtime de referencia expande a FP16 y consume 17,08 GB, lo que anula parte del ahorro de memoria de la cuantizacion. La cuantizacion se hizo sin datos de calibracion y el runtime castea de BF16 a FP16, por lo que los resultados no reproducen necesariamente el runtime Megatron BF16 original.
- Solo se han validado el entorno concreto (Python 3.10.12, PyTorch 2.11.0+cu128, mamba-ssm 2.3.2.post1, RTX PRO 6000 Blackwell) y la ruta Linux con CUDA; no hay garantias de comportamiento identico en otras configuraciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la informacion, y fechas de creacion y actualizacion de septiembre de 2026; se trata de un artefacto de investigacion poco contrastado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EndlessChasing/Mamb2_8B_W4A16_Recall
- Repositorio GitHub (plan de investigacion y verificacion): https://github.com/EndlessChasing/mamb2_8B_W4A16_Recall
- Documentacion en GitHub: https://github.com/EndlessChasing/mamb2_8B_W4A16_Recall/tree/main/docs
- Modelo base NVIDIA: https://huggingface.co/nvidia/mamba2-8b-3t-4k
- Repositorio de referencia Resurface: https://github.com/Oso1106/Resurface-Multi-Binding-Recall-Is-Latent-in-Mamba-s-State
- Instalacion de extensiones CUDA de Mamba: https://github.com/state-spaces/mamba#installation
- Perfil del autor en HuggingFace: https://huggingface.co/EndlessChasing
- Referencia arXiv etiquetada por el autor: arxiv:2406.07887
