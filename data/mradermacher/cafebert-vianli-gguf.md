# mradermacher/cafebert-vianli-GGUF

## Resumen

CafeBERT-ViANLI es un modelo de lenguaje basado en la arquitectura BERT (encoder transformer) especializado en inferencia de lenguaje natural (NLI) para vietnamita. Fue desarrollado originalmente por OneDayMaster2910 mediante ajuste fino completo (full fine-tuning) sobre el dataset ViANLI, y esta version concreta es una cuantizacion en formato GGUF realizada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp.

El modelo resuelve la tarea de clasificacion de relaciones textuales (entailment, contradiction, neutral) en vietnamita, un idioma con relativamente pocos recursos en el ecosistema de modelos abiertos. Con 559.891.459 parametros, se posiciona en la gama de modelos BERT-base multilingues, pero con un ajuste especifico para NLI en vietnamita.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo NLI vietnamita en entornos con recursos limitados, gracias a las cuantizaciones GGUF que reducen el peso desde 1,2 GB (f16) hasta 0,4 GB (Q2_K). Es un ejemplo de como el ecosistema de cuantizacion permite llevar modelos de nicho linguistico a hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 559.891.459 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un BERT (Bidirectional Encoder Representations from Transformers) con aproximadamente 560 millones de parametros, lo que corresponde a la configuracion tipica de BERT-base multilingue (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion). Se ha realizado un ajuste fino completo (full fine-tuning) sobre el dataset ViANLI, un corpus de inferencia de lenguaje natural en vietnamita publicado por UIT NLP. La tarea de NLI consiste en determinar si una hipotesis se sigue logicamente de una premisa (entailment), la contradice (contradiction) o es neutral.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ViANLI ni si se aplicaron tecnicas de RLHF o DPO. El tag "full-fine-tuning" indica que se actualizaron todos los parametros del modelo durante el ajuste, en lugar de usar adaptadores o LoRA. La cuantizacion GGUF realizada por mradermacher utiliza cuantizacion estatica (no ponderada/imatrix, segun indica la model card), lo que puede implicar una ligera perdida de calidad respecto a cuantizaciones ponderadas, aunque los quants Q4_K_M y Q8_0 se marcan como "fast, recommended" y "fast, best quality" respectivamente.

## Capacidades

- Clasificacion de inferencia de lenguaje natural (NLI) en vietnamita: prediccion de entailment, contradiction y neutral entre pares de frases.
- Extraccion de caracteristicas (feature-extraction): el tag indica que puede usarse para obtener representaciones vectoriales de texto vietnamita.
- Comprension bidireccional del contexto: al ser un encoder BERT, procesa la secuencia completa de forma bidireccional, lo que es adecuado para tareas de comprension.
- No soporta generacion de texto autoregresiva, tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo decoder.
- Capacidades multilingues limitadas: el modelo esta ajustado especificamente para vietnamita; aunque la base BERT multilingue podria tener cierta competencia en otros idiomas, el ajuste fino NLI es solo para vi.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Deteccion de contradicciones en documentacion legal vietnamita: el modelo puede comparar pares de clausulas o afirmaciones para identificar si una contradice a otra, util en revision de contratos o normativas.
- Verificacion de hechos (fact-checking) en medios vietnamitas: dado un par (premisa, hipotesis), clasificar si la hipotesis esta respaldada, contradicha o es neutral respecto a la premisa, como paso previo a un pipeline de verificacion.
- Filtrado de respuestas en sistemas de QA vietnamitas: comprobar si una respuesta candidata es consistente con el contexto recuperado antes de mostrarla al usuario.
- Deduplicacion semantica de pares de preguntas: en foros o sistemas de soporte, detectar si dos preguntas en vietnamita son equivalentes (entailment mutuo) para agruparlas.
- Generacion aumentada por recuperacion (RAG) para vietnamita: usar el modelo como re-ranker o validador de consistencia entre el contexto recuperado y la respuesta generada.
- Analisis de sentimiento basado en implicacion: inferir la polaridad de una resena comparandola con plantillas de entailment (por ejemplo, "el producto es bueno" vs. "el producto es malo").
- Extraccion de caracteristicas para clasificacion downstream: usar las representaciones del encoder como entrada para otros clasificadores en vietnamita (sentimiento, topicos, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (Q2_K) y 1,2 GB (f16) solo para los pesos; el consumo real depende del framework y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas GTX 1060 6GB, RTX 3060, RTX 4090; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), y potencialmente otros runners compatibles con GGUF. Para el modelo base en safetensors, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo encoder de ~560M parametros, la inferencia es rapida en GPU y aceptable en CPU para lotes pequenos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CafeBERT-ViANLI (este) | 559.891.459 | no disponible | NLI vietnamita | Apache 2.0 | GGUF en HF |
| BERT-base multilingue | ~178M | 512 tokens | Representaciones generales | Apache 2.0 | safetensors en HF |
| XLM-RoBERTa base | ~278M | 512 tokens | Representaciones multilingues | MIT | safetensors en HF |
| PhoBERT base | ~135M | 256 tokens | Representaciones vietnamitas | MIT | safetensors en HF |

La comparativa es aproximada: no se dispone de datos de rendimiento NLI para este modelo frente a las alternativas, por lo que la comparacion se limita a parametros, contexto y licencia. CafeBERT-ViANLI tiene un numero de parametros superior a los BERT-base tipicos, lo que sugiere una configuracion posiblemente mas ancha o con mas capas, pero no se dispone de la configuracion exacta.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en NLI para vietnamita; no es un modelo generativo y no debe usarse para tareas de generacion de texto.
- Riesgo de alucinacion: al ser un clasificador, no genera texto libre, pero puede producir clasificaciones erroneas en pares de frases ambiguos o fuera de dominio.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre ViANLI, puede heredar sesgos del corpus.
- Limitaciones de contexto: la longitud de contexto no esta documentada; al ser BERT, es probable que este limitada a 512 tokens, pero no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y del dataset ViANLI.
- Caveat de produccion: las cuantizaciones estaticas (no ponderadas) pueden degradar la calidad en comparacion con el modelo original en f16; para produccion se recomienda Q8_0 o f16 si el rendimiento es critico.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/cafebert-vianli-GGUF
- Modelo base: https://huggingface.co/OneDayMaster2910/cafebert-vianli
- Dataset ViANLI: https://huggingface.co/datasets/uitnlp/ViANLI
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#cafebert-vianli-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
