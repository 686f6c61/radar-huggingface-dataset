# P363/EuroLLM-1.7B-Slovak-Instruct-GGUF

## Resumen

P363/EuroLLM-1.7B-Slovak-Instruct-GGUF es un ajuste fino del modelo utter-project/EuroLLM-1.7B-Instruct, especializado en eslovaco y distribuido en formato GGUF con cuantización Q6_K. Lo desarrolla el usuario P363 y su objetivo es ofrecer un modelo ligero (aproximadamente 1,4 GB) capaz de ejecutarse en moviles, tablets y portatiles sin GPU dedicada, manteniendo una calidad decente en tareas de texto en eslovaco. El entrenamiento se realizo en dos fases: un preentrenamiento continuado (CPT) sobre 32.000 documentos eslovacos y un ajuste fino por instrucciones (SFT) sobre 9.600 conversaciones y tareas estilisticas.

La arquitectura subyacente es la de EuroLLM-1.7B, un transformer denso con 1.656.850.432 parametros totales (1,66B), de los cuales aproximadamente 0,52B corresponden a la tabla de embeddings y 1,13B a la red computacional. El contexto nativo es de 4.096 tokens, y el autor advierte explicitamente de que no debe ampliarse, ya que la calidad degrada rapidamente.

El modelo es relevante para quienes necesitan procesamiento de lenguaje natural en eslovaco en entornos con recursos limitados: correccion ortografica, resumen, RAG local y conversacion basica. Su licencia Apache 2.0 facilita el uso comercial, aunque el autor lo describe como un experimento ligero sin RLHF de seguridad extenso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (EuroLLM-1.7B) |
| Parametros totales | 1.656.850.432 (1,66B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (nativo; no ampliar) |
| Tipos de cuantizacion | Q6_K (unico archivo publicado) |
| Idiomas soportados | Eslovaco (sk) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B-Instruct, un transformer denso de 1,66B parametros con 4.096 tokens de contexto. El ajuste se realizo en precision fp16 mediante Unsloth (UnslothTrainer) con embeddings desbloqueados (r = 64, lora_alpha = 64, use_rslora = True), entrenando el 25,99 % de los parametros.

La fase 1 (Continued Pretraining) uso 32.000 documentos eslovacos en 2.000 pasos con learning_rate = 5e-5 y un embedding_learning_rate separado de 5e-6 para embed_tokens y lm_head. La composicion fue de 16.000 articulos de wikimedia/wikipedia (20231101.sk) y 16.000 documentos web limpios de ivykopal/fineweb2-slovak, filtrados estrictamente por fasttext == sk, langdetect == sk, n_bad_words == 0 y ausencia de caracteres extranjeros. La fase 2 (SFT) uso 9.600 ejemplos en 600 pasos con learning_rate = 3e-5 y embedding_learning_rate = 3e-6, combinando datos de logica, matematicas y codigo (dfm13-multilingual-math-code-sk, 3.000; dfm13-multilingual-openhermes-sk, 2.500), conversacion multi-turno (mbenco/slovak-sft, 2.000; dfm13-multilingual-multiturn-sk, 400) y estilo, reescritura y trabajo con contexto (dfm13-multilingual-summary-rewrite-sk, 800; dfm13-multilingual-grounded-instruct-sk, 600; TUKE-DeutscheTelekom/skquad, 300). No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en eslovaco con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Correccion gramatical, ortografica y estilistica de textos eslovacos.
- Resumen y reescritura de documentos.
- Respuesta a preguntas basada en contexto adjunto (RAG local), con instruccion de no inventar si la respuesta no esta en el texto.
- Conversacion multi-turno basica.
- Tareas elementales de logica, matematicas y codigo en eslovaco (entrenado con datos especificos, aunque el autor lo desaconseja para programacion avanzada).
- Ejecucion offline en dispositivos moviles y CPU.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad de vision ni audio.

## Casos de uso

- Correccion y estilo de correos electronicos en eslovaco: con un system prompt de corrector linguistico, el modelo repara gramatica, puntuacion y estilo sin alterar el significado, gracias al entrenamiento SFT en tareas de reescritura y a su tamano reducido que permite respuestas rapidas en CPU.
- Resumen de notas y documentos: el modelo fue ajustado con dfm13-multilingual-summary-rewrite-sk y puede condensar textos eslovacos en dispositivos sin GPU, con un contexto de 4.096 tokens suficiente para notas y articulos cortos.
- RAG local en movil: con el prompt de asistente vectorial que responde solo a partir del texto adjunto, se puede integrar en aplicaciones Android/iOS (PocketPal AI, ChatterUI, Layla) para consultar documentacion offline sin enviar datos a la nube.
- Atencion al cliente de baja complejidad en eslovaco: conversaciones multi-turno con contexto de 4.096 tokens y temperatura 0,35-0,55 para respuestas consistentes, adecuado para FAQ y consultas repetitivas.
- Procesamiento por lotes en portatiles antiguos o servidores sin GPU: mediante llama.cpp en modo CPU-only, con un peso de 1,4 GB que cabe en RAM modesta y permite generar texto a alta velocidad relativa.
- Prototipado rapido de aplicaciones NLP en eslovaco: al ser Apache 2.0 y GGUF, se puede desplegar con Ollama o llama-server para validar ideas antes de invertir en modelos mayores de 9B o 12B.
- Filtrado y normalizacion de texto eslovaco en pipelines de datos: el preentrenamiento continuado sobre fineweb2-slovak y Wikipedia refuerza la representacion del idioma, util para tareas de limpieza y clasificacion ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB para el archivo Q6_K; en la practica, unos 2 GB de RAM/VRAM incluyendo overhead de contexto.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cabe en cualquier GPU consumer con 2 GB o mas (por ejemplo, GTX 1050 Ti, RTX 3050, integradas modernas).
- Cabe en GPU consumer: si, en practicamente todas las GPU actuales e incluso en moviles de gama media-alta.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (`ollama run hf.co/F606F/EuroLLM-1.7B-Slovak-Instruct-GGUF:Q6_K`), aplicaciones moviles PocketPal AI, ChatterUI y Layla.
- Parametros de generacion recomendados: temperature 0,35-0,55, top-k 40, top-p 0,85, min-p 0,08, repeat penalty 1,08-1,12, contexto maximo 4.096.
- Latencia y throughput: no se han publicado cifras concretas; el autor describe la generacion como "muy rapida" en movil y CPU, sin datos numericos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| P363/EuroLLM-1.7B-Slovak-Instruct-GGUF | 1,66B | 4.096 | Eslovaco | Apache 2.0 | GGUF (Q6_K) |
| utter-project/EuroLLM-1.7B-Instruct (base) | 1,66B | 4.096 | Multilingue europeo | Apache 2.0 | safetensors |
| Modelos eslovacos SFT de referencia (mbenco/slovak-sft, dfm13) | no disponible | no disponible | Eslovaco | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No ha pasado por RLHF de seguridad extenso; puede generar hechos inexactos, alucinaciones o contenido problematico.
- No es adecuado para acertijos logicos complejos, programacion avanzada ni conocimiento factual sin contexto; el autor recomienda modelos de 9B o 12B para esas tareas.
- El contexto nativo es de 4.096 tokens; ampliarlo degrada rapidamente la calidad de las respuestas.
- Solo soporta eslovaco; no se documenta capacidad multilingue util.
- El ajuste se realizo sobre un subconjunto de datos relativamente pequeno (32.000 documentos CPT, 9.600 ejemplos SFT), lo que limita la cobertura de dominios.
- Uso comercial permitido por Apache 2.0, pero conviene verificar la licencia del modelo base y de los datasets empleados.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- No se documentan capacidades de tool calling ni agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/P363/EuroLLM-1.7B-Slovak-Instruct-GGUF
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Proyecto EuroLLM (UTTER): no disponible en la informacion proporcionada
- Repositorio llama.cpp: no disponible en la informacion proporcionada
- Unsloth: no disponible en la informacion proporcionada
