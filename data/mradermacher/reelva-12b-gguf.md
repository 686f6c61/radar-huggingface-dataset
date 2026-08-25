# mradermacher/Reelva-12B-GGUF

## Resumen

Reelva-12B es un modelo de lenguaje de 11.9 mil millones de parametros desarrollado por el equipo de reelva, pensado para usos conversacionales, agenticos y de "companion AI". El modelo base se publico originalmente en el repositorio reelva/Reelva-12B y esta cuantizado a formato GGUF por mradermacher, lo que permite su ejecucion en hardware de consumo. El modelo esta orientado principalmente a los idiomas indonesio (id) e ingles (en), y su etiquetado sugiere un enfoque en interacciones dialogadas, razonamiento multi-paso y soporte de herramientas.

La relevancia de este modelo radica en que cubre un nicho especifico: modelos conversacionales de tamano medio (12B) con soporte multilingue para el indonesio, un idioma con escasa representacion en el ecosistema open source. La disponibilidad de cuantizaciones GGUF en varios niveles (de Q2_K a Q8_0) y de un adaptador multimodal (mmproj) amplia sus posibles usos en entornos locales y en aplicaciones de vision-lenguaje. Sin embargo, la informacion publica sobre su arquitectura, datos de entrenamiento y rendimiento es limitada, por lo que esta ficha se basa en los datos disponibles en el repositorio de Hugging Face y en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en transformers) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.). Se sabe que usa la libreria `transformers` de Hugging Face y que el modelo original esta en formato safetensors. La etiqueta "gemma4" aparece en el repositorio del cuantizador (en la variante i1), lo que sugiere que podria estar basado en la arquitectura Gemma 4, pero esto no es confirmable con los datos disponibles.

Los datos de entrenamiento, el numero de tokens, la composicion del dataset y si se aplicaron tecnicas como RLHF o DPO no se mencionan en la model card. El modelo se presenta como "conversational", "agentic" y "companion-ai", lo que indica un enfoque en dialogos de largo recorrido y razonamiento multi-paso, pero sin detalles tecnicos adicionales.

## Capacidades

- Generacion de texto conversacional en indonesio e ingles.
- Soporte de razonamiento multi-paso y pensamiento "thinking" (segun las etiquetas del repositorio i1).
- Capacidad de uso como agente conversacional (tool calling no confirmado explicitamente, pero la etiqueta "agentic" lo sugiere).
- Soporte multimodal: el repositorio incluye archivos `mmproj-f16` y `mmproj-Q8_0`, que son proyectores para entrada de imagenes, lo que indica que el modelo base puede aceptar vision.
- Compatible con el ecosistema GGUF, lo que permite su uso en llama.cpp, Ollama, LM Studio, etc.

## Casos de uso

- **Asistente conversacional en indones**: el modelo esta entrenado especificamente para indones, lo que lo hace adecuado para chatbots de atencion al cliente, asistentes personales o aplicaciones de compania en ese idioma.
- **Aplicaciones de companion AI**: por su enfoque "companion-ai", puede usarse en aplicaciones de compania virtual, chatbots de apoyo emocional o simulacion de personajes.
- **Agente de razonamiento multi-paso**: su etiqueta "agentic" y "thinking" lo hace util para tareas que requieren descomponer un problema en pasos intermedios, como planificacion de tareas o resumen de documentos largos.
- **Vision-lenguaje en entornos locales**: gracias a los adaptadores `mmproj`, puede usarse para descripcion de imagenes o preguntas sobre contenido visual, siempre que se ejecute con un runtime que soporte multimodal (por ejemplo, llama.cpp con soporte de mmproj).
- **Despliegue en hardware de consumo**: con las cuantizaciones Q4_K_M (7,5 GB) o Q5_K_M (8,6 GB), puede ejecutarse en GPU de consumo como RTX 3060 12 GB o RTX 4070, lo que permite desarrollo local de prototipos.
- **Investigacion sobre modelos multilingües**: sirve como punto de partida para estudios comparativos sobre rendimiento en indones frente a otros modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con Q4_K_M (7,5 GB) se requiere al menos 8-10 GB de VRAM para la inferencia con contexto corto. Con Q8_0 (12,8 GB) se necesitan al menos 14-16 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4070 16 GB, RTX 4090 24 GB, o GPU de datacenter como A10G o L4 para las cuantizaciones mas altas.
- **En consumer GPU**: cabe en tarjetas de gama media con 12 GB (Q4_K_M) y en tarjetas de gama alta con 24 GB (Q8_0).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python, y cualquier motor compatible con GGUF. No se menciona soporte para vLLM o TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Como referencia, se puede comparar con otros modelos de tamano similar en la misma categoria (conversacional/agentic):

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Reelva-12B | 11,9B | no disponible | id, en | Apache-2.0 | GGUF |
| Gemma 2 9B | 9,2B | 8K | multilingue | Gemma license | safetensors, GGUF |
| Llama 3.1 8B | 8,0B | 128K | multilingue | Llama 3 license | safetensors, GGUF |

Nota: los datos de Gemma 2 y Llama 3.1 son de conocimiento publico general, no de la informacion proporcionada.

## Limitaciones y advertencias

- **Idiomas limitados**: el modelo esta entrenado principalmente en indones e ingles. Su rendimiento en otros idiomas es previsiblemente bajo.
- **Alucinaciones**: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en contextos de largo recorrido.
- **Contexto no documentado**: la longitud de contexto no se publica, lo que dificulta el uso en tareas que requieren ventanas largas.
- **Licencia**: el modelo base se distribuye bajo Apache-2.0, lo que permite uso comercial, pero es necesario verificar que el modelo base no tenga restricciones adicionales.
- **Sesgos**: no se han publicado evaluaciones de sesgos o seguridad. Dado su enfoque en companion AI, es necesario implementar medidas de seguridad para evitar contenidos daninos.
- **Cuantizaciones**: las cuantizaciones mas agresivas (Q2_K, Q3_K) pueden degradar significativamente la calidad del texto generado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Reelva-12B-GGUF
- Modelo base: https://huggingface.co/reelva/Reelva-12B
- Repositorio i1 (con imatrix): https://huggingface.co/mradermacher/Reelva-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
