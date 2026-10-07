# mradermacher/DoItYourself-v1-2B-i1-GGUF

## Resumen

DoItYourself-v1-2B-i1-GGUF es la version cuantizada en formato GGUF del modelo theprint/DoItYourself-v1-2B, publicada por el usuario mradermacher, conocido por producir cuantizaciones de terceros para la comunidad de inferencia local. Se trata de un modelo afinado mediante LoRA y SFT (con etiqueta auto-sft) sobre el dataset theprint/DoItYourself, orientado a tareas de tipo "hazlo tu mismo" y disponible unicamente en ingles. El repositorio no incluye pesos en safetensors: solo un archivo de matriz de importancia (imatrix) y la lista de cuantizaciones generadas con ella.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~2 000 millones de parametros en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van desde IQ1_S hasta Q6_K. Al emplear cuantizacion con imatrix (variante i1), el autor busca reducir la perdida de perplejidad respecto a las cuantizaciones estaticas equivalentes, que estan disponibles en un repositorio hermano.

Existen varias incognitas importantes: la licencia no esta declarada, no se especifica la arquitectura del modelo base, no hay datos de contexto ni de entrenamiento (tokens, composicion del dataset, uso de RLHF/DPO) y el campo de parametros totales del repositorio indica 479 418, un valor incompatible con el nombre "2B". El repositorio figura con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base theprint/DoItYourself-v1-2B esta etiquetado como fine-tuned, lora y sft, pero no se declara la arquitectura subyacente) |
| Parametros totales | ~2 000 millones segun el nombre del modelo; el campo de safetensors del repositorio declara 479 418 (dato inconsistente, no verificable) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL (todas en formato GGUF, variante i1/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el repositorio original theprint/DoItYourself-v1-2B se distribuye como adaptador/modelo en formato transformers |
| Tamano del repositorio | 0.0 GB (solo se lista el archivo imatrix de 0.1 GB) |
| Fecha de publicacion | 2026-10-07 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base. Las etiquetas del repositorio indican que theprint/DoItYourself-v1-2B es un modelo afinado con LoRA y SFT, con la marca adicional auto-sft, lo que sugiere un pipeline de ajuste supervisado automatizado o generado a partir de instrucciones. El dataset asociado es theprint/DoItYourself, cuyo contenido, tamano y composicion no se detallan en la informacion disponible. No hay datos sobre numero de tokens de entrenamiento, mezcla de datos, fases de RLHF, DPO u optimizacion por preferencias.

El trabajo de mradermacher consiste exclusivamente en la cuantizacion: segun los metadatos de la model card, se uso quantize_version 2, output_tensor_quantised 1 y convert_type hf, y se genero un archivo imatrix (matriz de importancia) especifico para este modelo, empleado despues para producir las cuantizaciones ponderadas de la serie i1. Este enfoque busca preservar mejor los pesos relevantes en cuantizaciones agresivas (IQ1, IQ2, IQ3) que las cuantizaciones estaticas equivalentes. Las cuantizaciones estaticas del mismo modelo se publican por separado en mradermacher/DoItYourself-v1-2B-GGUF.

## Capacidades

- Generacion de texto e instrucciones en ingles: es la unica capacidad documentada de forma implicita por las etiquetas del modelo (language: en).
- Respuesta a instrucciones y tareas de tipo "hazlo tu mismo", segun el nombre del modelo y el dataset theprint/DoItYourself. No hay evaluacion publicada que confirme el grado de acierto.
- Ejecucion en CPU y GPU mediante llama.cpp y sus derivados gracias al formato GGUF.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente multi-paso.
- No hay evidencia de capacidades de vision, audio, razonamiento con modo "thinking" ni decodificacion especulativa nativa.
- Capacidad multilingue: limitada al ingles declarado; no se documenta soporte de otros idiomas.
- Al ser un modelo de ~2 000 millones de parametros, se espera un rendimiento bajo en tareas de razonamiento complejo, matematicas avanzadas y generacion de codigo, aunque no hay mediciones disponibles que lo confirmen (estimacion general, no dato del autor).

## Casos de uso

- Asistente local de bricolaje y tareas domesticas: el modelo se puede desplegar con Ollama o llama.cpp en un portatil o mini-PC para responder consultas en ingles sobre reparaciones y proyectos, sin conexion a internet ni coste por token.
- Prototipado de aplicaciones de chat en ingles sobre hardware de consumo: al ocupar del orden de 1 a 2 GB en cuantizaciones de 4 bits, es util para validar interfaces y flujos conversacionales antes de migrar a un modelo mayor.
- Inferencia en el borde (edge) y entornos sin GPU: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en CPU con 4-8 GB de RAM, adecuado para dispositivos embebidos o kioscos offline.
- Generacion de texto auxiliar de bajo coste: redaccion de borradores, resumenes y respuestas plantilla en ingles donde la latencia y el coste importan mas que la calidad final.
- Experimentacion con cuantizacion: el repositorio incluye el archivo imatrix de 0.1 GB, lo que permite a investigadores reproducir la generacion de cuantizaciones i1 propias y medir el impacto en perplejidad.
- Linea base para comparativas de fine-tuning: sirve como referencia de partida (SFT sobre dataset propio) frente a otros ajustes del mismo modelo base, siempre que se validen los pesos realmente publicados.
- Filtrado y clasificacion de texto sencilla en ingles: tareas de etiquetado o enrutado de baja complejidad donde un modelo de 2B resulta suficiente y el despliegue local es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se aportan curvas de perplejidad por tipo de cuantizacion.

## Requisitos de hardware

Nota: los valores de VRAM son estimaciones derivadas del tamano nominal de 2 000 millones de parametros, no datos publicados por el autor. Si el recuento real de parametros fuese el que declara el campo de safetensors (479 418), las cifras serian drasticamente menores.

- VRAM estimada para inferencia: aproximadamente 0.8-1.2 GB en IQ2/IQ3, 1.2-1.7 GB en Q4_K_M, 1.8-2.4 GB en Q6_K y 2.5-3.5 GB en Q8_0, mas la cache KV, que crece con la longitud de contexto (desconocida).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4070 y superiores ofrecen margen de sobra. A100 y H100 son innecesarias para una sola instancia y solo tendrian sentido en despliegues con batching intensivo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, e incluso en iGPU con memoria unificada.
- Ejecucion en CPU: viable con 4-8 GB de RAM en cuantizaciones bajas; es el escenario natural de las variantes IQ1/IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI a traves de llama.cpp. vLLM ofrece soporte GGUF experimental; TGI no soporta GGUF de forma nativa y requeriria convertir a safetensors.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo en ninguna configuracion.

## Comparativa con modelos similares

La comparacion es orientativa: la arquitectura y la licencia del modelo base no estan declaradas, por lo que no puede confirmarse la equivalencia funcional con las alternativas. Los datos de las alternativas proceden de su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| DoItYourself-v1-2B-i1-GGUF (este modelo) | ~2 000 M (nombre); 479 418 declarados (inconsistente) | no disponible | no disponible | GGUF via mradermacher | no disponible |
| Qwen2.5-1.5B-Instruct (GGUF, de terceros) | 1 500 M | 32 768 tokens | Apache 2.0 | safetensors y GGUF | si, publicados por el autor |
| Llama-3.2-1B-Instruct (GGUF, de terceros) | 1 200 M | 128 000 tokens | Llama 3.2 Community License | safetensors y GGUF | si, publicados por el autor |
| Gemma-2-2B-it (GGUF, de terceros) | 2 600 M | 8 192 tokens | Gemma Terms of Use | safetensors y GGUF | si, publicados por el autor |

Frente a estas alternativas, la ventaja de DoItYourself-v1-2B-i1-GGUF es la disponibilidad de cuantizaciones muy agresivas (IQ1/IQ2) generadas con imatrix, utiles en entornos con menos de 2 GB de memoria. La desventaja es la ausencia total de datos de rendimiento, licencia y arquitectura, ademas de un recuento de parametros contradictorio.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso para uso comercial. Contactar con el autor del modelo base (theprint) antes de cualquier despliegue en produccion.
- Idioma unico: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Parametros contradictorios: el nombre indica 2B, mientras que el campo de safetensors del repositorio indica 479 418. Verificar los pesos reales antes de dimensionar infraestructura.
- Repositorio con 0.0 GB y una unica entrada en la tabla de cuantizaciones (el archivo imatrix de 0.1 GB): conviene comprobar que los ficheros GGUF estan realmente disponibles antes de integrarlos en un pipeline.
- Sin benchmarks ni evaluaciones de terceros: no hay evidencia publica de calidad, coherencia ni tasa de alucinacion. En modelos de 2B la alucinacion en tareas factuales es habitual.
- Un modelo de este tamano tiene capacidad limitada de razonamiento multi-paso, matematicas y codigo; no deberia usarse para decisiones criticas sin supervision humana.
- Longitud de contexto desconocida: no puede garantizarse el comportamiento en conversaciones largas ni el uso eficiente de la cache KV.
- Procedencia del ajuste: la etiqueta auto-sft sugiere datos de instrucciones generados automaticamente, lo que puede introducir sesgos y errores sistematicos en las respuestas.
- Fechas de publicacion (2026-10-07) y ausencia de descargas: modelo sin validacion por parte de la comunidad en el momento de redactar esta ficha.
- Rendimiento no medido en tokens por segundo: no hay datos para planificar SLA de latencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/DoItYourself-v1-2B-i1-GGUF
- Modelo base: https://huggingface.co/theprint/DoItYourself-v1-2B
- Dataset de ajuste: https://huggingface.co/datasets/theprint/DoItYourself
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/DoItYourself-v1-2B-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#DoItYourself-v1-2B-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Perfil de nicoboss (proveedor de recursos de computo): https://huggingface.co/nicoboss
