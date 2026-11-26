# mradermacher/Persistent-Exploration-Qwen3VLi-GGUF

## Resumen

Persistent-Exploration-Qwen3VLi es un modelo multimodal de razonamiento visual desarrollado por el usuario gsarch, orientado a tareas de busqueda visual persistente y uso de herramientas. Se construye sobre la base de Qwen3-VL (variante "i", presumiblemente instruct) y se afina mediante aprendizaje por refuerzo (RL) sobre el dataset gsarch/Persistent-Exploration-RL-Data. El modelo esta disenado para explorar imagenes de forma iterativa, invocando herramientas de busqueda visual y razonando en multiples pasos hasta localizar objetivos concretos.

La version aqui descrita es una cuantizacion GGUF estatica realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El modelo original cuenta con aproximadamente 8.190 millones de parametros (8,19 B) en formato safetensors, lo que lo situa en la gama de modelos medianos aptos para despliegue en una sola GPU consumer de gama alta.

Su relevancia radica en la combinacion de tres factores poco frecuentes en modelos de este tamano: capacidad multimodal (vision-lenguaje), razonamiento agentico con tool calling y un entrenamiento especificamente orientado a exploracion visual persistente, una tarea que los modelos VLM genericos suelen resolver de forma superficial. La licencia no esta disponible en la informacion proporcionada, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo base), GGUF (esta version) |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3-VL, una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar imagenes y texto de forma conjunta. Sobre esta base, el autor aplica un proceso de aprendizaje por refuerzo (pipeline declarado como reinforcement-learning) utilizando el dataset gsarch/Persistent-Exploration-RL-Data, orientado a ensenar al modelo a realizar busquedas visuales persistentes: explorar sistematicamente una imagen, invocar herramientas de recorte o zoom, y razonar sobre los resultados parciales hasta dar con el objetivo.

La innovacion principal no reside en la arquitectura subyacente, sino en el regimen de entrenamiento: el RL sobre tareas de exploracion visual con uso de herramientas busca que el modelo no se limite a una unica pasada de atencion sobre la imagen, sino que adopte un comportamiento agentico iterativo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Razonamiento visual multimodal: interpretacion de imagenes combinada con razonamiento textual.
- Busqueda visual persistente: exploracion iterativa de imagenes mediante herramientas de recorte, zoom o regiones de interes.
- Uso de herramientas (tool calling / function calling) orientado a tareas de vision.
- Razonamiento agentico multi-paso: encadenamiento de acciones de exploracion hasta resolver la consulta.
- Generacion de texto conversacional en ingles.
- Capacidad de razonamiento sobre resultados intermedios de herramientas visuales.
- Soporte de inferencia cuantizada via GGUF (llama.cpp y compatible), incluyendo el modulo multimodal mmproj.

## Casos de uso

- Busqueda de objetos en imagenes de alta resolucion: el modelo puede recortar y ampliar regiones sucesivamente hasta localizar un objeto concreto, aprovechando su entrenamiento en exploracion persistente en lugar de una unica pasada visual.
- Analisis de documentos escaneados o capturas complejas: permite localizar campos, cifras o elementos especificos navegando por zonas del documento mediante herramientas de vision.
- Inspeccion visual en control de calidad: dado un catalogo de imagenes de producto, el modelo puede verificar la presencia de defectos o caracteristicas concretas mediante exploracion dirigida.
- Automatizacion de tareas de agente visual: integrable en pipelines donde un agente debe decidir que region de una imagen examinar a continuacion, gracias a su soporte de tool calling.
- Asistencia en analisis de imagenes medicas o tecnicas (con supervision humana): la exploracion iterativa permite revisar zonas de interes de forma sistematica antes de emitir una conclusion.
- Prototipado de asistentes multimodales en local: la cuantizacion Q4_K_S (4,9 GB) permite desplegar el modelo en una estacion de trabajo con GPU consumer para pruebas de concepto de razonamiento visual.
- Investigacion en RL para vision-lenguaje: el modelo y su dataset asociado sirven como referencia para estudiar el efecto del RL en tareas de exploracion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con cuantizacion Q4_K_S (4,9 GB de pesos mas overhead de contexto y del modulo mmproj); en torno a 9-10 GB con Q8_0; cerca de 16-17 GB en f16.
- El modulo multimodal mmproj anade 0,9 GB (Q8_0) o 1,3 GB (f16) adicionales.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 para cuantizaciones altas; RTX 4060 Ti 16 GB o RTX 4070 para Q4/Q5.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando Q4_K_S; con 6 GB es ajustado y puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (soporte multimodal via mmproj), Ollama (si se empaqueta el GGUF), y servidores compatibles con GGUF; el modelo base safetensors es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Persistent-Exploration-Qwen3VLi (este) | 8,19 B | no disponible | Vision + texto, RL para exploracion | no disponible | GGUF y safetensors |
| Qwen3-VL (base) | segun variante | no disponible | Vision + texto | no disponible en esta ficha | Hugging Face |
| Qwen2.5-VL 7B | ~7 B | no disponible en esta ficha | Vision + texto | no disponible en esta ficha | Hugging Face |
| LLaVA-OneVision 7B | ~7 B | no disponible en esta ficha | Vision + texto | no disponible en esta ficha | Hugging Face |

La comparativa se limita a la categoria (VLM de ~7-8 B); no se dispone de datos de rendimiento comparativo para este modelo.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; verificar la licencia del modelo base gsarch/Persistent-Exploration-Qwen3VLi antes de desplegar en produccion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje, especialmente en descripciones de zonas ambiguas de la imagen.
- Entrenado con RL sobre un dataset especifico de exploracion visual: puede comportarse de forma suboptima en tareas visuales genericas fuera de ese dominio.
- Longitud de contexto no documentada; no se puede planificar el uso con imagenes de muy alta resolucion o conversaciones largas sin verificacion empirica.
- Cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_S como equilibrio.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: poca validacion comunitaria, usar con cautela.
- La fecha de creacion indicada (2026-11-26) resulta anomala; verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Persistent-Exploration-Qwen3VLi-GGUF
- Modelo base: https://huggingface.co/gsarch/Persistent-Exploration-Qwen3VLi
- Dataset de RL: https://huggingface.co/datasets/gsarch/Persistent-Exploration-RL-Data
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Persistent-Exploration-Qwen3VLi-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
