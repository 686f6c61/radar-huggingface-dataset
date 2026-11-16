# mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-GGUF es una cuantizacion en formato GGUF del modelo darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3, publicada por el usuario mradermacher. Se trata de una variante del modelo Nemotron 3.5 Bolt de NVIDIA, con el sufijo "heretic" y "E4B", que sugiere una version modificada para reducir rechazos (abliterated/heretic) y con un tamano efectivo de aproximadamente 4.000 millones de parametros. El modelo base cuenta con 7.463.013.674 parametros totales segun los datos de safetensors.

La relevancia de esta publicacion radica en que ofrece los pesos en formato GGUF, lo que permite su ejecucion en entornos de inferencia local con llama.cpp, Ollama y otras herramientas compatibles, sin necesidad de GPUs de datacenter. El repositorio incluye cuantizaciones estaticas de varios niveles (Q2_K a Q8_0, ademas de f16) y un suplemento multimodal (mmproj) que sugiere capacidades de vision.

La informacion disponible es limitada: la model card del cuantizador es generica y no detalla arquitectura, entrenamiento ni benchmarks. Los datos tecnicos que se presentan a continuacion provienen de los metadatos del repositorio y de la model card, indicandose explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nemotron 3.5 Bolt; presumiblemente transformer, sin confirmar) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (el sufijo E4B sugiere ~4B efectivos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "Nemotron-3.5-Bolt-E4B" indica que deriva de la familia Nemotron de NVIDIA, y el sufijo E4B apunta a un modelo con aproximadamente 4.000 millones de parametros efectivos, aunque los pesos totales ascienden a 7.463 millones, lo que podria sugerir una arquitectura con comparticion de parametros o un modelo denso con capas adicionales no activas en cada token. Esta interpretacion no esta confirmada por la model card.

El sufijo "heretic" hace referencia a una tecnica de modificacion de pesos (abliteration) orientada a reducir los rechazos del modelo ante peticiones que el modelo original declinaria. No se especifican en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (tag "conversational" en el repositorio).
- Capacidades multimodales: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base.
- Comportamiento "heretic": se espera una reduccion de rechazos respecto al modelo original, aunque no se documenta el alcance exacto de la modificacion.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun el tag de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_S (5,3 GB) y Q2_K, el modelo puede ejecutarse en GPUs de consumo con llama.cpp u Ollama, permitiendo prototipado sin infraestructura cloud.
- Procesamiento de documentos con imagenes: los archivos mmproj permiten alimentar imagenes junto con texto, util para extraccion de informacion de capturas, diagramas o documentos escaneados en entornos locales.
- Experimentacion con modelos sin censura: el ajuste "heretic" resulta util para investigadores que estudian el comportamiento de modelos con rechazos reducidos en tareas de analisis de contenido sensible, siempre con las cautelas eticas y legales correspondientes.
- Chatbot conversacional en ingles para entornos de desarrollo: el tag conversational y el formato GGUF facilitan integrarlo en aplicaciones de prueba con una ventana de contexto moderada (no documentada).
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece multiples niveles de cuantizacion, lo que permite medir el impacto de la compresion en calidad y velocidad para un mismo modelo base.
- Fine-tuning y destilacion sobre pesos cuantizados: aunque el formato GGUF no es ideal para entrenamiento, puede servir como referencia para comparar salidas frente a versiones completas en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con Q4_K_S (5,3 GB de pesos mas overhead de contexto); alrededor de 16-17 GB con f16 (15,0 GB de pesos); el suplemento multimodal anade 0,7-1,1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas usando Q4_K_S o inferiores; las cuantizaciones Q8_0 y f16 requieren 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos completos.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3 (este) | 7,46 B totales | no disponible | no disponible | GGUF | Variante heretic con vision |
| Modelo base darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3 | 7,46 B totales | no disponible | no disponible | safetensors | Sin cuantizar |
| Alternativas de ~7-8B (p. ej. Llama 3.1 8B, Mistral 7B, Qwen2.5 7B) | 7-8 B | 32K-128K | licencias abiertas | safetensors, GGUF | Datos no disponibles para comparacion directa con este modelo |

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas no es posible.

## Limitaciones y advertencias

- La model card del cuantizador es generica y no documenta el modelo base; se desconoce la procedencia exacta de los pesos y el proceso de modificacion "heretic".
- El ajuste heretic puede incrementar la probabilidad de generar contenido que el modelo original rechazaria; requiere revision y filtros adicionales en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Soporte unicamente en ingles segun los metadatos; el rendimiento en castellano no esta documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_S o superior para uso serio.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-GGUF
- Modelo base: https://huggingface.co/darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
