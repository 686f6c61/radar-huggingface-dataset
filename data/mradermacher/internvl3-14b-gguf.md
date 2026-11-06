# mradermacher/InternVL3-14B-GGUF

## Resumen

InternVL3-14B-GGUF es la distribucion en formato GGUF del modelo multimodal InternVL3-14B, desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory) y cuantizado por el usuario mradermacher. InternVL3 es la tercera generacion de la familia de modelos vision-lenguaje de OpenGVLab, disenada para tareas que combinan comprension de imagenes y generacion de texto, incluyendo razonamiento visual, OCR, descripcion de escenas y dialogo multimodal multi-turno.

El modelo base cuenta con 14.766.040.064 parametros (aproximadamente 14,8 mil millones) y sigue una arquitectura transformer densa con un codificador visual acoplado a un modelo de lenguaje. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp), algo imposible con los pesos originales en safetensors de precision completa.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un VLM de ~15B en equipos locales con GPU de gama alta consumer, manteniendo capacidades multimodales y multilingues. El repositorio incluye tanto los pesos cuantizados del modelo de lenguaje como los ficheros `mmproj` necesarios para procesar imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (codificador visual + LLM), con codigo personalizado (`custom_code`) |
| Parametros totales | 14.766.040.064 (~14,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | Multilingue (sin listado detallado en la informacion disponible) |
| Licencia | Apache-2.0 (con `license_name: qwen` y enlace a la licencia de Qwen2.5-72B-Instruct en la model card) |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) + mmproj para el componente visual |

## Arquitectura y entrenamiento

InternVL3-14B sigue el patron de la familia InternVL: un codificador visual (vision encoder) acoplado a un modelo de lenguaje de gran escala mediante un proyector o conector. El modelo base fue entrenado por OpenGVLab sobre el dataset `OpenGVLab/MMPR-v1.2`, un corpus multimodal orientado a razonamiento perceptivo. La model card del repositorio cuantizado no detalla el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la documentacion del modelo original.

La innovacion practica de este repositorio no esta en la arquitectura, sino en la cuantizacion: mradermacher aplica cuantizacion estatica (version 2, con `output_tensor_quantised: 1`) sobre los pesos convertidos desde Hugging Face. Se ofrecen variantes IQ (importancia-based) en el repositorio hermano `InternVL3-14B-i1-GGUF`, que suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones K estandar de igual tamano. El componente visual se distribuye por separado como `mmproj` en Q8_0 (0,5 GB) o f16 (0,8 GB).

## Capacidades

- Comprension de imagenes: descripcion de escenas, respuesta a preguntas visuales (VQA) y analisis de contenido grafico.
- Generacion de texto multimodal: respuestas conversacionales condicionadas por imagenes de entrada.
- Razonamiento visual: tareas que requieren interpretar diagramas, graficos o capturas de pantalla.
- OCR y lectura de documentos: extraccion de texto presente en imagenes, aunque sin garantias formales de precision.
- Dialogo multi-turno: soporte conversacional segun el tag `conversational`.
- Capacidades multilingues: el modelo declara soporte multilingue, aunque sin listado exhaustivo de idiomas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs estilo OpenAI en plataformas de despliegue.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking explicito o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados en local: el modelo puede procesar imagenes de facturas, formularios o tickets y devolver texto estructurado, manteniendo los datos en la maquina del usuario gracias al despliegue GGUF con llama.cpp.
- Asistencia visual para accesibilidad: descripcion de imagenes en tiempo real para personas con discapacidad visual, ejecutando el modelo en una estacion de trabajo con GPU consumer.
- Moderacion de contenido grafico: clasificacion y descripcion de imagenes subidas por usuarios en plataformas, usando la cuantizacion Q4_K_M (9,1 GB) para equilibrar velocidad y calidad.
- Soporte tecnico con capturas de pantalla: un agente conversacional que recibe capturas de errores o interfaces y guia al usuario paso a paso, aprovechando el dialogo multi-turno.
- Prototipado de productos VLM sin coste de API: investigadores que necesitan iterar sobre prompts y pipelines multimodales sin depender de servicios en la nube, usando Q8_0 (15,8 GB) en una RTX 4090 o Q4_K_M en GPUs de 12 GB.
- Extraccion de informacion de imagenes medicas o industriales (con supervision humana): preprocesado de imagenes para etiquetado asistido, siempre con validacion por expertos dado el riesgo de alucinacion.
- Educacion y demostraciones: ejecucion de un VLM de ~15B en portatiles con GPU dedicada para talleres y cursos, gracias a las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni metricas multimodales. Para datos de evaluacion del modelo base, debe consultarse la documentacion oficial de OpenGVLab/InternVL3-14B.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos del LLM; sumar ~0,5-0,8 GB del mmproj y el espacio para el contexto KV cache):
  - Q2_K: ~5,9 GB
  - Q3_K_S: ~6,8 GB
  - Q4_K_M: ~9,1 GB (recomendada por el autor como rapida)
  - Q5_K_M: ~10,6 GB
  - Q6_K: ~12,2 GB
  - Q8_0: ~15,8 GB
- GPU recomendadas:
  - RTX 3060 12 GB / RTX 4070: Q4_K_M o Q5_K_S con contexto moderado.
  - RTX 4080 / RTX 4090 16-24 GB: Q6_K o Q8_0 con margen para contexto amplio.
  - A100 40/80 GB, H100: precision completa o Q8_0 con contextos largos y batch alto.
- Cabe en GPU consumer: si, en GPUs con 8 GB o mas usando cuantizaciones bajas (Q2_K, Q3_K_S), y con comodidad en 12-24 GB para Q4-Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y servidores compatibles con la API de llama.cpp. El tag `endpoints_compatible` sugiere soporte en plataformas que exponen endpoints estilo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la GPU, la cuantizacion y el uso de aceleracion (CUDA, Metal, ROCm).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| InternVL3-14B (este) | ~14,8 B | No disponible | Si | Apache-2.0 / qwen | Si (este repo) |
| Qwen2.5-VL-7B | ~7 B | No disponible | Si | Apache-2.0 | Si (comunidad) |
| LLaVA-OneVision-7B | ~7 B | No disponible | Si | Apache-2.0 | Si (comunidad) |
| MiniCPM-V 2.6 | ~8 B | No disponible | Si | Apache-2.0 | Si (comunidad) |

La comparativa se limita a parametros, licencia y disponibilidad en GGUF, ya que no se dispone de datos de rendimiento en la informacion proporcionada. InternVL3-14B ofrece mas parametros que las alternativas de ~7-8B, lo que tipicamente implica mayor calidad a costa de mas VRAM.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo VLM, puede describir elementos inexistentes en la imagen o inventar texto en tareas de OCR; requiere validacion en produccion.
- Ambiguedad de licencia: la model card declara Apache-2.0 pero tambien `license_name: qwen` con enlace a la licencia de Qwen2.5-72B-Instruct; conviene verificar los terminos aplicables antes de uso comercial.
- Idiomas: el soporte multilingue no esta detallado; el rendimiento en castellano no esta documentado en la informacion disponible.
- Contexto: la longitud de contexto no se especifica en este repositorio; debe consultarse el modelo base.
- Cuantizaciones bajas (Q2_K, Q3_K_S): perdida notable de calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio.
- Codigo personalizado: el tag `custom_code` implica que la carga en transformers requiere `trust_remote_code=True`, con el riesgo de seguridad asociado.
- Repositorio de cuantizacion de terceros: no es oficial de OpenGVLab; los pesos cuantizados pueden diferir del original en comportamiento.
- Sin garantias de tool calling ni agentes: no confirmado en la informacion disponible, no asumir soporte en pipelines de agentes.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/InternVL3-14B-GGUF
- Modelo base original: https://huggingface.co/OpenGVLab/InternVL3-14B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/InternVL3-14B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#InternVL3-14B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenGVLab/MMPR-v1.2
- Licencia referenciada: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
