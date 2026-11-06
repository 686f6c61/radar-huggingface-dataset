# Luni/Thinklite-27B-Heretic-EXL3

## Resumen

Thinklite-27B-Heretic-EXL3 es una distribucion cuantizada del modelo Luni/Thinklite-27B-Heretic, que a su vez deriva de Sparset/Thinklite-27B. El autor, Luni, publica aqui los pesos en formato EXL3 (ExLlamaV3) en tres variantes de bits por peso (3.50, 4.30 y 5.00 bpw), pensadas para servir el modelo en GPUs de consumo con TabbyAPI. La caracteristica diferencial frente al modelo base es el proceso de abliteration (neutralizacion de vectores de rechazo) combinado con una cirugia de subespacio benigno que, segun el autor, reduce un 46,1 % la divergencia KL colateral sobre comportamiento benigno.

El modelo subyacente es un LM causal de 27 000 millones de parametros con arquitectura hibrida de atencion lineal y atencion densa, 64 capas y una ventana de contexto nativa de 262 144 tokens. Incorpora un modo de razonamiento explicito mediante tokens `<think>`, orientado a deliberacion en cadena de pensamiento. La ficha se centra en la version EXL3, no en los pesos BF16 originales.

La relevancia practica es doble: por un lado, ofrece una via de despliegue eficiente (16,8 GB en 4.30 bpw) para un modelo de 27B con contexto muy largo en una sola GPU de 32 GB; por otro, la variante "Heretic" elimina el sesgo de rechazo y el tono moralizante, lo que resulta util para investigacion sobre alineacion y para aplicaciones donde el modelo base resultaria excesivamente restrictivo. La licencia Apache-2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: atencion lineal + atencion densa (64 capas) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (nativa); en EXL3 el autor recomienda hasta 65 536 en la configuracion de ejemplo |
| Tipos de cuantizacion | EXL3 en 3.50 bpw, 4.30 bpw y 5.00 bpw (con head `-hb` a 6 bits y embeddings a FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3), libreria `exllamav3`; pesos BF16 del modelo padre en repo separado |

## Arquitectura y entrenamiento

La arquitectura es un LM causal hibrido que combina capas de atencion lineal con capas de atencion densa, sumando 64 capas y 27B parametros, con una ventana de contexto de 262 144 tokens. Esta mezcla busca reducir el coste computacional y de memoria del mecanismo de atencion en secuencias largas manteniendo la calidad de un transformer denso en las capas donde la atencion completa es necesaria. No se detalla en la informacion disponible la distribucion exacta de capas lineales frente a densas ni la dimension de cabeza o de estado.

El entrenamiento original de Sparset/Thinklite-27B no se describe en la informacion proporcionada: no hay datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si documenta el autor de la variante Heretic es el post-procesado: abliteration dirigida a neutralizar los vectores de rechazo tanto en los tokens de deliberacion (`<think>`) como en la representacion del prompt, seguida de una "cirugia de cola" sobre el subespacio benigno con k=4, que segun la model card elimina el 46,1 % de la divergencia KL colateral manteniendo la supresion del rechazo en su punto maximo. Las tres ramas EXL3 son cuantizaciones de esos pesos, no reentrenamientos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento explicito con modo de pensamiento: emite tokens `<think>` para deliberacion en cadena de pensamiento antes de la respuesta final.
- Razonamiento multi-paso y deliberacion extendida gracias al contexto nativo de 262k tokens.
- Comportamiento "uncensored": rechazo y tono moralizante suprimidos por abliteration, sin bucles de advertencia.
- Capacidad de contexto largo: el autor valida configuraciones de 32k a 128k tokens segun la variante de cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline es exclusivamente `text-generation`.
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Razonamiento con contexto largo en una sola GPU: servir el modelo en 4.30 bpw con 32k-64k tokens de contexto en una RTX 5090 (32 GB) usando TabbyAPI con cache FP8, adecuado para analisis de documentos extensos o historiales de conversacion largos.
- Investigacion sobre alineacion y abliteration: la variante Heretic permite estudiar como varian las respuestas al eliminar vectores de rechazo, comparando contra el modelo base Thinklite-27B con la misma arquitectura.
- Generacion creativa sin restricciones moralizantes: el modelo evita el tono predicador y las negativas, util para ficcion, guiones o roleplay donde el modelo base interrumpiria la narrativa.
- Evaluacion de cadenas de pensamiento: el modo `<think>` permite extraer y auditar la deliberacion intermedia, util para investigacion sobre razonamiento y para depurar prompts.
- Despliegue en estaciones de trabajo con 24 GB: la variante 3.50 bpw (~13,5 GB) deja 18,5 GB libres para cache KV y permite contextos de 64k-128k en GPUs de 24 GB o 32 GB.
- Procesamiento por lotes de textos largos en ingles: con contexto de 262k nativo y cuantizacion 5.00 bpw en 32 GB, se pueden procesar documentos completos sin troceado, aunque con throughput limitado por la GPU de consumo.
- Prototipado local de asistentes conversacionales: el formato EXL3 y la integracion con TabbyAPI permiten levantar un endpoint compatible con OpenAI en hardware de gama alta consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas internas del proceso de abliteration (reduccion del 46,1 % de divergencia KL benigna) y tamanos de cuantizacion; no incluye MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada por variante (pesos, sin cache KV):
  - 3.50 bpw: ~13,5 GB; objetivo 24 GB o 32 GB, con 18,5 GB libres para contexto de 64k-128k.
  - 4.30 bpw: ~16,8 GB; objetivo 32 GB (RTX 5090), con ~15,2 GB libres para 32k-64k con cache FP8.
  - 5.00 bpw: ~19,5 GB; objetivo 32 GB, con margen para 16k-32k de contexto.
- GPU recomendadas: RTX 5090 (32 GB) como objetivo principal declarado; RTX 4090 (24 GB) solo con la variante 3.50 bpw y contexto moderado. No se documentan pruebas en A100 ni H100.
- Cabe en GPU consumer: si, en RTX 5090 (32 GB) con las tres variantes y en RTX 4090 (24 GB) con 3.50 bpw.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (soporte nativo del formato EXL3). No se indica soporte de llama.cpp, Ollama, vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Luni/Thinklite-27B-Heretic-EXL3 | 27B | 262 144 | EXL3 (3.50/4.30/5.00 bpw) | Apache-2.0 | Objeto de esta ficha; abliterated con cirugia de subespacio benigno |
| Luni/Thinklite-27B-Heretic | 27B | 262 144 | BF16 (safetensors) | Apache-2.0 | Mismos pesos sin cuantizar; requiere mucha mas VRAM (~54 GB en BF16) |
| Sparset/Thinklite-27B | 27B | 262 144 | no disponible | Apache-2.0 | Modelo base sin abliteration; rechazo y tono de alineacion intactos |
| Luni/Qwen3.8-27B-Cold-Fusion-GAIN-Heretic-EXL3-4.0bpw | 27B | no disponible | EXL3 4.0 bpw | Apache-2.0 | Otra publicacion del mismo autor, basada en Qwen3.5; orientada a codigo agentico |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: la etiqueta de idioma del repositorio es `en`; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Abliteration deliberada: la supresion de vectores de rechazo puede degradar la calibracion de seguridad del modelo y aumentar la probabilidad de contenido danino o inapropiado; no es apto para aplicaciones orientadas al publico sin filtros externos.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; al ser un modelo de 27B con razonamiento explicito, las cadenas `<think>` pueden contener pasos plausibles pero incorrectos.
- Sesgos: no se documenta ninguna evaluacion de sesgo; el dataset de entrenamiento original no se describe.
- Formato propietario de runtime: EXL3 solo se ejecuta en ExLlamaV3/TabbyAPI; no hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, lo que limita las opciones de despliegue en produccion.
- Contexto practico menor que el nativo: aunque el modelo declara 262k tokens, las configuraciones recomendadas por el autor bajan a 32k-64k segun VRAM; el ejemplo de TabbyAPI fija `max_seq_len: 65536`.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el comportamiento del modelo abliterated.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3
- Rama 4.30 bpw: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3/tree/4.30bpw
- Rama 5.00 bpw: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3/tree/5.00bpw
- Rama 3.50 bpw: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3/tree/3.50bpw
- Pesos BF16 Heretic: https://huggingface.co/Luni/Thinklite-27B-Heretic
- Modelo base original: https://huggingface.co/Sparset/Thinklite-27B
- Perfil del autor: https://huggingface.co/Luni
- Otra publicacion del autor (Qwen3.8-27B-Cold-Fusion-GAIN-Heretic-EXL3): https://huggingface.co/Luni/Qwen3.8-27B-Cold-Fusion-GAIN-Heretic-EXL3-4.0bpw
