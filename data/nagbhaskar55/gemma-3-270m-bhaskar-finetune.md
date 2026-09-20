# nagbhaskar55/gemma-3-270m-bhaskar-finetune

## Resumen

`nagbhaskar55/gemma-3-270m-bhaskar-finetune` es un ajuste fino completo del modelo `google/gemma-3-270m-it` de Google, publicado por el usuario nagbhaskar55. El objetivo es acotado y explícito: responder preguntas apoyándose exclusivamente en un pasaje de contexto incluido en el propio prompt, en el dominio legal y financiero estadounidense. No es un modelo de conocimiento general, sino un extractor y reformulador de información anclada al texto de entrada.

El modelo conserva los 268.098.176 parámetros del base (268M, denso, sin mezcla de expertos) y se entrenó sobre 7.960 pares de instrucción sintéticos derivados de jurisprudencia de EE. UU., presentaciones ante la SEC y texto web educativo. El ajuste se hizo en una única GPU L4 durante 37 minutos, con un pico de 20,29 GB de memoria, lo que lo sitúa en la categoría de experimentos reproducibles en hardware modesto.

Su relevancia práctica es doble. Por un lado, demuestra que un modelo de 268M puede reducir la pérdida sobre respuestas de asistente de 2,0595 a 1,2213 (perplejidad 3,391) con solo 4,9 millones de tokens de ajuste. Por otro, la propia model card lo compara con un modelo de 125M entrenado desde cero sobre los mismos datos, obteniendo 0,3964 bits por carácter frente a 0,4915, una reducción del 19% atribuible a la escala de preentrenamiento (unos 6 billones de tokens) y no al ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gemma3_text` en HuggingFace); detalles internos de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 268.098.176 (268M), denso |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de entrenamiento de mas de 1.024 tokens (105 casos) se descartaron en lugar de truncarse |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en precision completa para `transformers` |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |
| Tamano del vocabulario | 262.144 tokens (segun la comparacion de la model card) |
| Descargas / likes en HuggingFace | 212 descargas, 0 likes |
| Modelo base | google/gemma-3-270m-it |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 3 de 270M en su variante de texto, un transformer decoder-only denso con un vocabulario de 262.144 tokens. El ajuste fue completo (no LoRA ni adaptadores): el repositorio de 1,1 GB corresponde a los pesos completos del modelo resultante. El entrenamiento se ejecutó en una sola GPU NVIDIA L4 durante 37 minutos, a 10.520 tokens por segundo, con un pico de 20,29 GB de memoria. La mejor época fue la 2 de 3.

Los datos de ajuste son 7.960 pares de instrucción sintéticos generados con `gemini-3.6-flash` como profesor y evaluados por `gemini-3.1-flash-lite` como juez, con umbrales de al menos 4 sobre 5 en anclaje al contexto, corrección e instrucciones. La composición por tarea es: 3.200 de QA anclada, 1.600 de resumen, 1.600 de extracción y 1.560 de reescritura. Por fuente: 3.186 de la SEC, 3.158 de jurisprudencia y 1.616 de fineweb-edu. Se incluyeron 423 ejemplos de rechazo cuya respuesta correcta es exactamente `"Not stated in the context."`. Tras deduplicación exacta, por n-gramas y por embeddings, y descontaminación de 13 gramos contra CaseHOLD, el conjunto quedó en 7.617 ejemplos y 4.896.142 tokens, de los cuales solo el 8,7% lleva pérdida (el turno del asistente). No se documenta uso de RLHF ni DPO.

Una peculiaridad relevante de formato: el chat template de Gemma no tiene canal de sistema separado, por lo que el turno de sistema se pliega dentro del primer turno de usuario, que es como se entrenó el modelo. Además, los turnos de Gemma terminan con `<end_of_turn>` (id 106) y no con `<eos>` (id 1), por lo que es obligatorio pasar ambos identificadores a `generate` o el modelo no se detendrá.

## Capacidades

- Generacion de texto con plantilla conversacional de Gemma (`apply_chat_template`).
- QA anclada a contexto: responde preguntas usando unicamente el pasaje incluido en el prompt.
- Resumen de documentos legales y financieros.
- Extraccion de datos estructurados a partir de texto (entidades, cifras, clausulas).
- Reescritura y reformulacion de fragmentos.
- Rechazo explicito cuando la respuesta no esta en el contexto, con la cadena literal `"Not stated in the context."`.
- Capacidad multilingue: no disponible; el modelo esta declarado solo para ingles (`language: [en]`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se limita a tareas de un solo turno sobre un pasaje dado.
- Capacidades multimodales (vision, audio): no disponibles; la etiqueta es `gemma3_text`.

## Casos de uso

- Revision de contratos con anclaje documental: se introduce el texto integro de una clausula y una pregunta concreta, y el modelo responde citando solo lo que aparece en el pasaje, lo que reduce el riesgo de respuestas inventadas fuera del contrato.
- Analisis de presentaciones ante la SEC: extraccion de cifras concretas (ingresos, margenes, riesgos declarados) de un 10-K o 10-Q pegado en el prompt, aprovechando los 3.186 ejemplos de dominio SEC del ajuste.
- Resumen de jurisprudencia para busqueda interna: condensar resoluciones judiciales en fragmentos cortos que alimenten un indice o un motor de busqueda juridico.
- Extraccion de entidades y campos en pipelines de digitalizacion: dado un documento legal, devolver los campos relevantes en formato consistente para su carga en una base de datos.
- Generacion aumentada por recuperacion (RAG) de bajo coste: al ser un modelo de 268M, puede actuar como generador final de un pipeline RAG donde el contexto se recupera de un vector store; su funcion es redactar la respuesta anclada, no almacenar conocimiento.
- Deteccion de informacion ausente: el comportamiento entrenado de devolver `"Not stated in the context."` permite usarlo como verificador barato para descartar preguntas que el contexto recuperado no cubre, antes de escalar a un modelo mayor.
- Clasificacion y reformulacion de fragmentos normativos: normalizar el lenguaje de clausulas repetidas en un corpus grande, tarea facilmente paralelizable por su bajo coste de inferencia.
- Prototipado e investigacion sobre ajuste fino: por su tamano y su coste de entrenamiento (37 minutos en una L4), sirve como banco de pruebas para experimentos de SFT con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de perdida y de bits por caracter sobre un split reservado.

| Metrica | Modelo base `gemma-3-270m-it` | Este modelo |
|---|---|---|
| Perdida (split reservado, solo tokens del asistente) | 2,0595 | 1,2213 (perplejidad 3,391) |
| Mejor epoca | no aplica | 2 de 3 |

| Modelo | Parametros | Tokens de preentrenamiento | Bits por caracter |
|---|---|---|---|
| slm125mlive-base + SFT | 125M | 2,04B | 0,4915 |
| Este modelo | 268M | ~6T | 0,3964 |

La comparacion por perplejidad entre ambos modelos no es valida, segun la propia model card, porque usan vocabularios distintos (16k frente a 262k); por eso se emplea bits por caracter. La mejora del 19% se atribuye a la escala de preentrenamiento, ya que ambos se ajustaron con datos identicos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 268M de parametros): unos 1,1 GB en FP32, unos 0,54 GB en BF16/FP16, unos 0,27 GB en INT8 y unos 0,15 GB en INT4, mas la cache KV correspondiente al contexto utilizado.
- Referencia de entrenamiento documentada: ajuste fino completo en 1 GPU NVIDIA L4 (24 GB) durante 37 minutos, con pico de 20,29 GB. Esa cifra corresponde al entrenamiento con gradientes y estados del optimizador, no a inferencia.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090, entre otras) puede ejecutarlo en BF16 o FP16, y en CPU con cuantizacion.
- GPU de datacenter: A100, H100, L4 o L40S no son necesarias para inferencia, pero permiten un gran numero de peticiones concurrentes por su memoria disponible.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference`), y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). No se publican pesos en formato GGUF ni cuantizaciones listas para llama.cpp u Ollama; su conversion seria posible, pero no esta disponible en el repositorio.
- Latencia y throughput: no disponible para inferencia. El unico dato de rendimiento publicado es de entrenamiento: 10.520 tokens por segundo en una L4.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de preentrenamiento | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nagbhaskar55/gemma-3-270m-bhaskar-finetune` | 268M | ~6T (heredados del base) | 1,2213 de perdida; 0,3964 bits/char | Gemma Terms of Use | Pesos safetensors en HuggingFace |
| `google/gemma-3-270m-it` (base) | 268M | ~6T | 2,0595 de perdida en el mismo split | Gemma Terms of Use | Pesos safetensors en HuggingFace |
| `nagbhaskar55/slm125mlive-base` + SFT | 125M | 2,04B | 0,4915 bits/char en el mismo split | no disponible en la informacion proporcionada | Pesos en HuggingFace |
| Otros modelos comparables de ~0,3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estandar que permitan comparar con alternativas de la misma categoria mas alla de los dos modelos citados en la propia model card.

## Limitaciones y advertencias

- Con 270M de parametros el modelo lee el pasaje que se le entrega; no es una base de conocimiento. No debe usarse para responder preguntas sin contexto.
- Las respuestas son fluidas y normalmente bien formadas, pero las cifras y entidades siguen siendo incorrectas en ocasiones.
- Puede omitir parte de una pregunta compuesta (multi-parte).
- El conjunto de entrenamiento es sintetico y proviene de un unico modelo profesor (`gemini-3.6-flash`) con un unico juez (`gemini-3.1-flash-lite`), por lo que sus sesgos se trasladan al modelo ajustado. No se documenta una evaluacion de sesgos.
- Riesgo de alucinacion: aunque se entreno con 423 ejemplos de rechazo, la model card advierte explicitamente de errores en cifras y entidades.
- Limitacion idiomatica: solo ingles; no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Limitacion de contexto: los ejemplos de mas de 1.024 tokens se descartaron durante el entrenamiento, y no se especifica la longitud de contexto soportada en inferencia.
- Licencia: Gemma Terms of Use, que impone restricciones de uso que deben propagarse a los usuarios posteriores. No es una licencia de codigo abierto permisiva; revisar antes de un uso comercial.
- No constituye asesoramiento legal ni financiero, segun la propia model card.
- Requisito tecnico critico en produccion: hay que pasar `eos_token_id=[1, 106]` (o el id de `<end_of_turn>`) a `generate`, o el modelo no detendra la generacion.
- El modelo fue creado y actualizado el mismo dia (2026-09-20) y acumula 212 descargas y 0 likes, por lo que carece de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nagbhaskar55/gemma-3-270m-bhaskar-finetune
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Modelo de comparacion de 125M: https://huggingface.co/nagbhaskar55/slm125mlive-base
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron unicamente paginas de anuncios clasificados sin relacion con el modelo.
