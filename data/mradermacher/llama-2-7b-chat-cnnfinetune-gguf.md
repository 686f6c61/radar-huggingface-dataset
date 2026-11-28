# mradermacher/Llama-2-7b-chat-CNNfinetune-GGUF

## Resumen

Llama-2-7b-chat-CNNfinetune-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo usamaatta/Llama-2-7b-chat-CNNfinetune, publicada por el usuario mradermacher el 20 de marzo de 2025. No se trata de un modelo entrenado desde cero, sino de una conversion a GGUF del fine-tune realizado por usamaatta sobre la base Llama-2-7b-chat de Meta. El repositorio contiene unicamente cuantizaciones estaticas (sin variantes imatrix ni ponderadas), orientadas a inferencia local con llama.cpp y herramientas compatibles.

El modelo subyacente parte de la arquitectura transformer decoder-only de Llama 2, con 6.738.415.616 parametros totales (aproximadamente 6,7 mil millones, coherente con la familia Llama-2-7B) y un contexto nativo de 4.096 tokens propio de Llama 2. El sufijo "CNNfinetune" sugiere un ajuste fino orientado a un dominio concreto que no se detalla en la model card disponible; no hay informacion publicada sobre el dataset de ajuste, el proceso de entrenamiento ni los objetivos del fine-tune.

La relevancia de esta ficha es practica: permite desplegar en hardware de consumo un modelo conversacional de 7B en ingles con cuantizaciones desde 2,6 GB (Q2_K) hasta 13,6 GB (f16). Ahora bien, la ausencia de licencia declarada, de benchmarks y de documentacion sobre el fine-tune obliga a tratar el modelo con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2, segun modelo base) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (Llama 2 base: 4.096 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (tambien transformers como libreria declarada) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 2 7B chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo fue originalmente entrenado por Meta y posteriormente ajustado por usamaatta mediante un fine-tune cuyo contenido no se documenta en la model card. No hay informacion disponible sobre el numero de tokens de ajuste, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La contribucion de mradermacher se limita a la cuantizacion: segun los metadatos del README, se aplico quantize_version 2 con output_tensor_quantised 1 y convert_type hf. Se ofrecen exclusivamente cuantizaciones estaticas; el autor indica que las variantes ponderadas o imatrix no estan disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste chat de Llama 2.
- Razonamiento basico y respuesta a instrucciones en formato dialogo.
- Generacion de codigo y matematicas a nivel general de la familia Llama 2 7B (sin benchmarks publicados que lo confirmen para este fine-tune).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con la cuantizacion Q4_K_M (4,2 GB) el modelo cabe en GPUs de consumo y permite iterar sobre prompts y flujos de dialogo sin coste de API, en ingles.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q2_K (2,6 GB) o Q3_K_S (3,0 GB) permite ejecucion en CPU mediante llama.cpp para tareas de generacion de texto de baja latencia no critica.
- Generacion de texto y resumenes en ingles dentro de pipelines batch: el modelo puede procesar lotes de documentos con contexto de hasta 4.096 tokens (limite de Llama 2) usando Q8_0 (7,3 GB) para maximizar calidad.
- Chatbot interno de soporte en ingles: adecuado para preguntas frecuentes y conversaciones multi-turno acotadas, siempre que se valide el comportamiento del fine-tune concreto antes de exponerlo a usuarios.
- Evaluacion comparativa de fine-tunes: util como referencia para medir el efecto del ajuste CNNfinetune frente al Llama-2-7b-chat original en tareas del dominio objetivo.
- Experimentacion academica con cuantizacion: el conjunto de 12 variantes (de Q2_K a f16) permite estudiar la degradacion de calidad y el consumo de memoria en un mismo modelo base.
- Integracion en aplicaciones de escritorio o edge: el formato GGUF es compatible con llama.cpp, Ollama y otros runners ligeros, lo que facilita empaquetar el modelo en herramientas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado de contexto):
  - Q2_K: ~2,6 GB de pesos; ~3,5-4 GB en total.
  - Q4_K_M: ~4,2 GB de pesos; ~5-6 GB en total.
  - Q8_0: ~7,3 GB de pesos; ~8-9 GB en total.
  - f16: ~13,6 GB de pesos; ~14-15 GB en total.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q8_0 y f16; RTX 4090, A100 o H100 para despliegues de mayor throughput o f16 con contexto completo.
- Cabe en GPU de consumo: si, desde GTX 1660 6 GB (Q4_K_M) hasta RTX 4090 (f16). Las variantes Q2_K y Q3_K_S pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; la libreria declarada es transformers, por lo que tambien puede cargarse via Hugging Face si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-2-7b-chat-CNNfinetune-GGUF (este) | 6,74 B | no disponible (base: 4.096) | no disponible | GGUF | Fine-tune no documentado; solo cuantizaciones estaticas |
| Llama-2-7b-chat (Meta) | 6,74 B | 4.096 | Llama 2 Community License | safetensors, GGUF | Modelo base de referencia, ampliamente benchmarkeado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | Apache 2.0 | safetensors, GGUF | Contexto 8x mayor y licencia permisiva |
| Zephyr-7B-beta | 7,24 B | 32.768 | MIT | safetensors, GGUF | Fine-tune con DPO, orientado a instrucciones |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento de este fine-tune que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base (Llama 2 Community License) y del fine-tune original antes de cualquier despliegue productivo.
- Fine-tune sin documentacion: se desconoce el dataset, el objetivo y el comportamiento esperado del ajuste CNNfinetune, lo que impide garantizar su calidad fuera del dominio previsto.
- Riesgo de alucinacion: inherente a los modelos de 7B de la familia Llama 2, especialmente en tareas factuales y con contexto largo.
- Contexto limitado: 4.096 tokens en el modelo base, insuficiente para documentos extensos o conversaciones muy largas.
- Solo ingles: la etiqueta de idioma declarada es "en"; el rendimiento en castellano no esta garantizado.
- Sesgos conocidos: los heredados de los datos de entrenamiento de Llama 2, sin que este fine-tune documente mitigaciones.
- Cuantizaciones estaticas unicamente: no hay variantes imatrix o ponderadas, que suelen ofrecer mejor relacion calidad/tamano en bits bajos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento para validar el modelo frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-2-7b-chat-CNNfinetune-GGUF
- Modelo base del fine-tune: https://huggingface.co/usamaatta/Llama-2-7b-chat-CNNfinetune
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-2-7b-chat-CNNfinetune-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
