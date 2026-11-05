# mradermacher/FinSenti-Qwen3.5-0.8B-GGUF

## Resumen
FinSenti-Qwen3.5-0.8B-GGUF es la distribucion en formato GGUF del modelo FinSenti-Qwen3.5-0.8B, un ajuste fino especializado en analisis de sentimiento financiero construido sobre una base Qwen3.5 de 0,8 mil millones de parametros. Lo publica mradermacher, un cuantizador de referencia en la comunidad open source, a partir del modelo original de Ayansk11. El modelo resuelve una tarea concreta: clasificar y razonar sobre el sentimiento de textos financieros (noticias, informes, comunicados) en ingles, incorporando razonamiento en cadena de pensamiento (chain-of-thought) antes de emitir la etiqueta.

La relevancia actual radica en su tamano reducido (752 millones de parametros reales en safetensors) y su licencia Apache 2.0, que lo hacen desplegable en hardware de consumo y apto para uso comercial sin restricciones adicionales. El repositorio incluye un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16, ademas de un suplemento multimodal mmproj), lo que permite ajustar el equilibrio entre calidad y huella de memoria.

No obstante, la informacion publica es escasa: la model card del cuantizador se limita a describir el proceso de cuantizacion y no documenta arquitectura, datos de entrenamiento ni resultados de evaluacion del modelo base. Esta ficha refleja esa limitacion y marca como "no disponible" todo dato no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5, familia transformer; detalles no confirmados) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original en transformers/safetensors) |

## Arquitectura y entrenamiento
La model card no detalla la arquitectura interna del modelo base. Por el nombre y la familia declarada (Qwen3.5) se infiere una arquitectura transformer decoder-only, pero no se confirma en la informacion disponible. El modelo es un ajuste fino del checkpoint Ayansk11/FinSenti-Qwen3.5-0.8B, que a su vez parte de una base Qwen3.5 de 0,8B.

Las etiquetas del repositorio indican un pipeline de entrenamiento en tres fases: SFT (supervised fine-tuning), LoRA (adaptacion de bajo rango) y GRPO (Group Relative Policy Optimization, una variante de RL para razonamiento). El dataset empleado es Ayansk11/FinSenti-Dataset, orientado a sentimiento financiero, y el modelo incorpora razonamiento en cadena de pensamiento (chain-of-thought) como parte del proceso de inferencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros de RL.

La contribucion de mradermacher es exclusivamente la cuantizacion estatica a GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf). No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion; el autor indica que podrian aparecer mas adelante previa peticion en la seccion de discusiones.

## Capacidades
- Analisis de sentimiento financiero: clasificacion de textos financieros (positivo, negativo, neutro) con razonamiento previo explicito.
- Razonamiento en cadena de pensamiento (chain-of-thought) antes de la respuesta final, segun las etiquetas del repositorio.
- Generacion de texto conversacional en ingles (tag "conversational").
- Ajuste fino supervisado (SFT) y optimizacion por refuerzo (GRPO) orientados a la tarea de sentimiento.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que sugiere soporte de entrada multimodal en el modelo base, aunque no se documenta su uso en la tarea financiera.

## Casos de uso
- Analisis de sentimiento de noticias financieras en tiempo real: el modelo puede procesar titulares y cuerpos de noticias en ingles y emitir una etiqueta de sentimiento con justificacion, integrándose en un pipeline de ingestión de noticias para señalar eventos relevantes antes de que un analista los revise.
- Monitorizacion de comunicados de resultados: dado su tamano reducido, puede desplegarse en lote sobre cientos de comunicados trimestrales para extraer el tono de la direccion y detectar cambios de discurso respecto al trimestre anterior.
- Filtrado de menciones en redes sociales y foros de inversion: clasificacion de alto volumen de mensajes en ingles para construir indices de sentimiento de mercado o alertas de cambios bruscos de opinion.
- Preprocesamiento para modelos mayores: usar FinSenti como clasificador rapido y barato que etiqueta grandes volumenes de texto financiero antes de enviar solo los casos ambiguos a un modelo de mayor capacidad, reduciendo coste de inferencia.
- Despliegue en el borde o en local: con cuantizaciones Q4_K_M (0,6 GB) o Q8_0 (0,9 GB) cabe en portatiles y mini-PC sin GPU dedicada, lo que permite analisis de sentimiento en entornos con requisitos de privacidad o sin conectividad.
- Educacion e investigacion: servir de base reproducible para estudiar el efecto de SFT + GRPO en tareas de dominio financiero con un modelo de menos de mil millones de parametros, o como punto de partida para ajustes adicionales con LoRA sobre otros idiomas o dominios.
- Prototipado rapido de asistentes financieros: integracion en demos conversacionales en ingles que respondan preguntas sobre el tono de un texto financiero concreto, gracias a su naturaleza conversacional y a la ausencia de restricciones de licencia para uso comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de evaluacion del modelo base ni comparaciones con alternativas.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB para Q2_K/Q3_K_S, 0,6 GB para Q4_K_M/IQ4_XS, 0,7 GB para Q5_K_M/Q6_K, 0,9 GB para Q8_0 y 1,6 GB para f16 (tamanos de fichero; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen sobrado. Para despliegue en servidor, A100 o H100 no aportan ventaja significativa por el tamano del modelo, salvo por concurrencia.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles. Por el tamano (menos de 1B parametros) se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se ofrece una comparacion estructural basica con modelos de la misma categoria (clasificacion de sentimiento financiero de tamano pequeno), marcando los datos no confirmados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FinSenti-Qwen3.5-0.8B (este) | 752 M | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste fino con SFT + LoRA + GRPO; solo ingles |
| FinBERT | ~110 M | 512 tokens (tipico) | Apache 2.0 / MIT segun variante | safetensors, PyTorch | Clasificador BERT especializado, sin generacion |
| Qwen3.5-0.8B base | ~800 M | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste financiero |
| Alternativas de sentimiento financiero de 1-3B | variable | variable | variable | variable | No disponible en la informacion proporcionada |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un dataset financiero concreto (FinSenti-Dataset), puede heredar sesgos de dominio, de fuente y de periodo temporal de dicho dataset.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el modo chain-of-thought puede producir justificaciones plausibles pero incorrectas. No debe usarse como unica fuente para decisiones de inversion.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; no se especifica la longitud de contexto, lo que impide garantizar el procesamiento de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene conservar los avisos de licencia y verificar la licencia del modelo base original.
- Caveats para produccion: la model card no documenta evaluacion, calibracion ni robustez; antes de desplegar en produccion conviene validar con un conjunto propio y monitorizar el rendimiento. La ausencia de cuantizaciones imatrix puede implicar una perdida de calidad mayor en las cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas ponderadas.
- El repositorio tiene muy pocas descargas (259) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.

## Enlaces
- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/FinSenti-Qwen3.5-0.8B-GGUF
- Modelo base original: https://huggingface.co/Ayansk11/FinSenti-Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Ayansk11/FinSenti-Dataset
- Pagina de overview del cuantizador: https://hf.tst.eu/model#FinSenti-Qwen3.5-0.8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
