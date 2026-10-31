# bartowski/gugujiji_novel-humanize-4b-GGUF

## Resumen

novel-humanize-4b es un modelo de generación de texto de 4.022 millones de parámetros desarrollado por gugujiji, especializado en la reescritura de novelas y textos narrativos en chino. El modelo se presenta como una herramienta para "humanizar" texto generado por IA, es decir, para reescribir contenido con un estilo más natural y menos artificioso, una tarea de gran demanda en la actualidad dado el auge de la generación automática de ficción.

La versión aquí analizada es la cuantización GGUF realizada por bartowski, un cuantizador muy conocido en la comunidad open source, utilizando llama.cpp (release b11845) con matrices de importancia (imatrix) para minimizar la pérdida de calidad en cuantizaciones agresivas. El repositorio incluye más de una docena de variantes que van desde bf16 completo (8,05 GB) hasta cuantizaciones IQ3 de alrededor de 2 GB, lo que permite ejecutar el modelo incluso en portátiles sin GPU dedicada.

Su relevancia radica en la escasez de modelos abiertos especializados en reescritura narrativa en chino, un nicho donde los modelos generalistas suelen producir prosa estilizada o poco natural. Con licencia Apache 2.0 y formato de prompt compatible con ChatML (incluido soporte de tool calling), resulta fácil de integrar en flujos de trabajo de escritura asistida. No se han publicado detalles sobre arquitectura base, datos de entrenamiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (formato de prompt ChatML, probablemente base tipo Qwen) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_M, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L y otras variantes Q3/IQ3 del repo |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por bartowski); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura subyacente del modelo, el número de tokens de entrenamiento ni la composición del dataset. El uso del formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`) sugiere que se trata de un modelo derivado o afinado sobre una base compatible con este esquema, comúnmente asociado a la familia Qwen, aunque esto no está confirmado por el autor.

La cuantización de bartowski utiliza la técnica de imatrix (matriz de importancia) de llama.cpp, que calibra la cuantización según la sensibilidad real de cada peso en inferencia, mejorando la calidad de las variantes bajas (Q3, IQ3, Q4) frente a cuantizaciones estándar. Se empleó el release b11845 de llama.cpp. El modelo no soporta decodificación especulativa según la model card. No se dispone de información sobre RLHF, DPO ni otras técnicas de alineamiento.

## Capacidades

- Reescritura de novelas y texto narrativo en chino, con énfasis en hacer el texto menos detectable como generado por IA ("humanización")
- Generación de texto conversacional (pipeline text-generation, tag conversational)
- Soporte de tool calling mediante el formato ChatML con definiciones de funciones en etiquetas `<tool_call>` XML
- Entrada exclusivamente textual (sin soporte de visión ni audio según la model card)
- No soporta decodificación especulativa
- Capacidades multilingües: no disponible; el único idioma declarado es el chino

## Casos de uso

- Humanización de borradores generados por IA: un escritor puede pasar capítulos generados con otro LLM y pedir al modelo que los reescriba con prosa más natural en chino, su tarea principal según los tags del repositorio.
- Reescritura estilística de novelas web: autores de ficción serializada en chino pueden pulir párrafos o capítulos completos manteniendo la trama pero mejorando la fluidez del texto.
- Postprocesado en pipelines de generación de ficción: integrado tras un modelo generador mayor, actúa como etapa de refinado local y barato (2,59 GB en Q4_K_M) sin depender de APIs externas.
- Ejecución en hardware modesto: gracias a las cuantizaciones IQ3/Q4, puede correr en portátiles con CPU o en GPUs de consumo, útil para escritores individuales sin infraestructura.
- Asistente conversacional en chino: el formato ChatML y el tag conversational permiten usarlo como chatbot básico, aunque su especialización es narrativa.
- Experimentación con tool calling local: al incluir plantilla de funciones, puede probarse en agentes ligeros que combinen reescritura de texto con llamadas a herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la variante Q4_K_M ocupa 2,59 GB y la bf16 8,05 GB; añadiendo espacio para el KV cache, se recomiendan entre 4 y 12 GB según la cuantización y el contexto utilizado.
- GPUs recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4/Q5 (por ejemplo RTX 3060, RTX 4060 o superiores); para bf16, GPUs con 12 GB o más como RTX 4090 o A100.
- Consumer GPUs: sí, cabe con holgura en GPUs de gama media; incluso puede ejecutarse solo con CPU y RAM en portátiles con 8 GB gracias a llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el checkpoint original en safetensors puede desplegarse con vLLM o TGI, aunque no está verificado.
- Latencia y throughput: no disponible; al ser un modelo de 4B cuantizado, se esperan velocidades altas incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| gugujiji/novel-humanize-4b | 4.022 M | Reescritura/humanizacion de novelas en chino | Apache 2.0 | GGUF (bartowski) y safetensors |
| Qwen2.5-3B-Instruct | 3.090 M | Generalista, chino e ingles | Qwen Research (uso comercial restringido) | GGUF, safetensors, vLLM |
| Yi-1.5-6B-Chat | 6.000 M | Generalista bilingue chino-ingles | Apache 2.0 | GGUF, safetensors, vLLM |

Nota: no existen en la informacion disponible comparativas de rendimiento directas entre estos modelos; la tabla compara tamaño, licencia y orientacion. novel-humanize-4b destaca por su especializacion narrativa en chino y su licencia permisiva frente a Qwen2.5-3B, cuyo uso comercial tiene restricciones.

## Limitaciones y advertencias

- Idioma: el modelo está orientado al chino; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado o inexistente.
- Riesgo de alucinación: no evaluado públicamente; como todo modelo de 4B, puede inventar contenido o perder coherencia en textos largos.
- Longitud de contexto: no publicada, lo que dificulta planificar el procesado de capítulos largos; conviene verificarla empíricamente antes de usarla en producción.
- Sin benchmarks publicados: no hay datos objetivos de calidad de reescritura ni comparaciones con modelos base, por lo que la evaluación debe hacerse de forma manual.
- Sesgos: no documentados; al tratarse de un modelo afinado para reescritura de ficción, puede heredar los sesgos de su modelo base y de los datos de novelas usados en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del checkpoint original (gugujiji/novel-humanize-4b) y de cualquier modelo base subyacente.
- Uso ético: la "humanización" de texto puede emplearse para eludir detectores de IA; su uso debe respetar las normas de las plataformas de publicación donde se publique el contenido resultante.
- Sin decodificación especulativa ni soporte de visión según la model card.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/gugujiji_novel-humanize-4b-GGUF
- Modelo original: https://huggingface.co/gugujiji/novel-humanize-4b
- llama.cpp (herramienta de cuantizacion): https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usado (b11845): https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Paper, blog o demo: no disponible
