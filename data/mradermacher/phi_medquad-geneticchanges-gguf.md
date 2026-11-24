# mradermacher/Phi_medquad-geneticchanges-GGUF

## Resumen

Phi_medquad-geneticchanges-GGUF es la version cuantizada en formato GGUF del modelo emilykang/Phi_medquad-geneticchanges, un ajuste fino (fine-tuning) del modelo Phi de Microsoft orientado al dominio medico, concretamente a cambios geneticos. El trabajo de cuantizacion lo realiza mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles.

El modelo base cuenta con aproximadamente 2.780 millones de parametros (2,78 B), lo que lo situa en la gama de modelos pequenos optimizables para hardware de consumo. Esta pensado para tareas de generacion de texto en ingles dentro del ambito biomedico y genetico, probablemente entrenado sobre el corpus MedQuAD (preguntas y respuestas medicas) combinado con contenido sobre alteraciones geneticas.

La relevancia de esta ficha reside en que el repositorio ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K de 1,2 GB hasta f16 de 5,7 GB), lo que permite desplegar el modelo en equipos con recursos limitados. No obstante, se trata de un modelo de nicho, sin benchmarks publicados ni licencia declarada, lo que limita su uso en produccion sin una evaluacion previa por parte del equipo tecnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Phi; detalles exactos del fine-tuning no disponibles) |
| Parametros totales | 2.779.683.840 (2,78 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de un modelo base en transformers) |

## Arquitectura y entrenamiento

El modelo base emilykang/Phi_medquad-geneticchanges es un fine-tuning del modelo Phi de Microsoft, una familia de transformers decoder-only de pequeno tamano disenada originalmente para razonamiento y generacion de texto. El nombre del modelo sugiere que el ajuste se realizo sobre MedQuAD (Medical Question Answering Dataset) combinado con material sobre cambios geneticos, aunque la model card no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, partiendo de los pesos en formato Hugging Face y convirtiendolos a GGUF. El autor indica que tambien existen cuantizaciones con imatrix (weighted) en un repositorio separado (Phi_medquad-geneticchanges-i1-GGUF), que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes. No se documentan innovaciones arquitectonicas adicionales mas alla de las propias del modelo Phi original.

## Capacidades

- Generacion de texto en ingles dentro del dominio medico y genetico.
- Respuesta a preguntas sobre alteraciones geneticas y conceptos biomedicos (presumiblemente, dado el nombre y el dataset de origen).
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, text-generation-webui, entre otras).
- Despliegue en hardware de consumo gracias a las cuantizaciones de bajo tamano (desde 1,2 GB).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.

## Casos de uso

- Asistencia educativa en genetica clinica: el modelo puede responder preguntas frecuentes sobre cambios geneticos y conceptos medicos basicos, aprovechando el ajuste sobre MedQuAD para ofrecer respuestas en lenguaje natural a estudiantes o personal en formacion.
- Prototipado rapido de chatbots medicos en local: al caber en 1,2-2,1 GB en cuantizaciones Q2-Q5, permite montar un prototipo funcional en un portatil sin GPU dedicada usando llama.cpp u Ollama.
- Filtrado y clasificacion de consultas biomedicas: integrado en un pipeline de preprocesamiento, puede reformular o categorizar preguntas de pacientes antes de derivarlas a un sistema mayor o a un profesional.
- Generacion de resumenes de textos geneticos: para condensar articulos o fichas tecnicas en explicaciones breves en ingles, siempre con revision humana dado el riesgo de alucinacion.
- Despliegue en entornos con recursos restringidos: en hospitales o laboratorios con hardware modesto, la version Q4_K_M (1,8 GB) permite inferencia en CPU con latencia aceptable para uso interactivo no critico.
- Base para experimentos de fine-tuning adicional: el formato GGUF y el modelo base en transformers permiten partir de esta familia para ajustes especificos sobre subdominios geneticos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead aproximado de llama.cpp):
  - Q2_K: ~1,5 GB
  - Q3_K_M: ~1,8 GB
  - IQ4_XS: ~1,9 GB
  - Q4_K_M: ~2,1 GB
  - Q5_K_M: ~2,4 GB
  - Q6_K: ~2,7 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,0 GB
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4-Q5; para f16 se recomienda 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; tambien es posible cargar el modelo base en transformers (no el GGUF).
- Latencia y throughput: no disponibles; al ser un modelo de 2,78 B en cuantizaciones bajas, se espera una generacion fluida en CPU moderna y muy rapida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi_medquad-geneticchanges-GGUF | 2,78 B | no disponible | no disponible | GGUF en HF | Fine-tuning medico de nicho, sin benchmarks |
| Phi-2 (Microsoft) | 2,7 B | 2.048 tokens | MIT | Pesos originales y multiples GGUF | Modelo generalista, con benchmarks publicos |
| Phi-3-mini (Microsoft) | 3,8 B | 4.096-128.000 tokens | MIT | Pesos originales y GGUF | Mayor contexto y rendimiento documentado |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Pesos originales y GGUF | Alternativa mas ligera, generalista |

La comparativa es orientativa: el modelo de esta ficha es un fine-tuning de nicho sin evaluacion publica, por lo que no puede compararse en rendimiento con los modelos generalistas de la tabla. La licencia no declarada es un factor diferencial importante frente a Phi-2 o Phi-3-mini, que si permiten uso comercial bajo MIT.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, por lo que cualquier uso requiere evaluacion propia.
- Riesgo elevado de alucinacion en dominio medico: al ser un modelo pequeno ajustado sobre un dataset limitado, puede generar afirmaciones geneticas incorrectas con apariencia de verosimilitud.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Contexto no documentado: se desconoce la ventana maxima, lo que complica el diseno de aplicaciones con documentos largos.
- Modelo de nicho con muy pocas descargas (70) y cero likes: comunidad practicamente inexistente, sin soporte ni issues resueltos.
- No apto para diagnostico clinico ni decision medica sin supervision profesional; debe tratarse como herramienta experimental.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las propias notas del autor.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Phi_medquad-geneticchanges-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medquad-geneticchanges
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Phi_medquad-geneticchanges-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phi_medquad-geneticchanges-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
