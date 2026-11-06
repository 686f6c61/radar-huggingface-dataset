# lulidong/PanoVideoReasoner

## Resumen

PanoVideoReasoner es un modelo multimodal de razonamiento sobre vídeo panorámico desarrollado por el autor lulidong y presentado en el trabajo "Think in 360°: Benchmarking and Bootstrapping Panoramic Video Reasoning". Se construye como un ajuste fino de Qwen/Qwen3.5-9B (9.409.813.744 parámetros) y su tarea central es responder preguntas sobre vídeos de 360 grados en proyección equirectangular (ERP), conectando observaciones entre distintas direcciones de vision y a lo largo del tiempo.

El modelo se entrena sobre el conjunto PanoVideoCoT, compuesto por 13.465 pares pregunta-respuesta-cadena de pensamiento extraídos de 2.063 vídeos panorámicos, mediante un proceso de SFT con cadena de pensamiento panorámica seguido de Evidence-Privileged On-Policy Self-Distillation (EP-OPSD). El resultado es un modelo capaz de generar razonamientos de hasta 8.192 tokens nuevos que siguen a personas y objetos a través de la esfera visual completa.

Su relevancia radica en que aborda un nicho poco cubierto: el razonamiento temporal y espacial sobre vídeo panorámico, donde los modelos multimodales convencionales pierden coherencia al cruzar los bordes de la proyección. La licencia Apache 2.0 y su base Qwen3.5-9B lo hacen desplegable en infraestructura estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text que procesa vídeo e imágenes junto con texto. Sobre esa base se aplica un ajuste fino específico para vídeo panorámico: la entrada se muestrea uniformemente a 1 FPS con un máximo de 128 fotogramas, redimensionando el lado largo a 1.280 píxeles, con presupuestos de entrenamiento de 409.600 píxeles por fotograma y 52.428.800 píxeles por vídeo. Se mantiene la representación ERP original y la esfera visual completa.

El entrenamiento se realiza en dos fases sobre PanoVideoCoT: primero un SFT con cadenas de pensamiento panorámicas (Panoramic CoT SFT) y después un ajuste mediante Evidence-Privileged On-Policy Self-Distillation (EP-OPSD), una variante de autodestilación en política que aprovecha evidencias privilegiadas. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los 13.465 pares QA-CoT y los 2.063 vídeos.

## Capacidades

- Razonamiento sobre vídeo panorámico en proyección equirectangular (ERP), incluyendo seguimiento de personas y objetos a través de direcciones de visión.
- Generación de cadenas de pensamiento (CoT) explícitas, con hasta 8.192 tokens nuevos de razonamiento.
- Respuesta a preguntas sobre vídeo (video question answering) con contexto temporal y espacial.
- Procesamiento conjunto de vídeo e imágenes en formato image-text-to-text.
- Conversación multi-turno en formato chat (pipeline conversacional).
- Capacidades multilingües limitadas al inglés según la model card.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.

## Casos de uso

- Análisis de vídeo de vigilancia panorámica: el modelo puede describir y seguir el movimiento de personas a través de una cámara 360 grados, aprovechando su entrenamiento específico en ERP y su capacidad de conectar observaciones entre direcciones de visión.
- Revisión de grabaciones de vehículos o drones con cámara esférica: permite formular preguntas sobre trayectorias y eventos que cruzan varios campos de visión, algo que los modelos de vídeo convencional no resuelven bien.
- Documentación de entornos para realidad virtual o gemelos digitales: responde a consultas sobre la disposición espacial y la dinámica de una escena capturada en 360 grados, útil para anotación semiautomática.
- Investigación en percepción espacial: sirve como modelo de referencia para estudiar razonamiento temporal y espacial en vídeo panorámico dentro de proyectos académicos, dado su carácter de modelo de investigación con licencia permisiva.
- Asistentes de accesibilidad para contenido inmersivo: puede generar descripciones narradas de vídeos 360 grados, indicando qué ocurre en cada dirección y cómo se desplazan los sujetos.
- Análisis de eventos deportivos o espectáculos grabados en 360 grados: permite preguntar por la evolución de la acción en toda la esfera visual, con razonamiento explícito sobre la secuencia temporal.
- Evaluación comparativa de modelos multimodales: su asociación al benchmark descrito en el paper lo hace adecuado como línea base en experimentos de razonamiento sobre vídeo panorámico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 19 GB solo para pesos (9.409.813.744 parámetros), más memoria para caché de atención y procesamiento de hasta 128 fotogramas de vídeo, por lo que se recomienda disponer de 24 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100 y RTX 4090 (24 GB) para bfloat16; en GPUs de menor capacidad sería necesario recurrir a cuantización, cuyos formatos no están documentados en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con bfloat16 ajustado y límites moderados de fotogramas; en GPUs de 16 GB o menos la viabilidad no está garantizada sin cuantización.
- Opciones de despliegue: transformers (versión >= 5.15.0 con soporte Qwen3.5), accelerate y device_map="auto"; el tag endpoints_compatible sugiere despliegue en Hugging Face Inference Endpoints. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanoVideoReasoner | 9.409.813.744 | no disponible | Vídeo panorámico 360 grados con CoT | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9,4 B | no disponible | Multimodal image-text-to-text general | no disponible en la informacion | Hugging Face |
| Modelos de vídeo QA convencionales | variable | variable | Vídeo de campo de visión limitado | variable | variable |

La comparación con alternativas específicas de razonamiento sobre vídeo panorámico no está disponible en la información proporcionada; el modelo base Qwen3.5-9B es la referencia directa más próxima en arquitectura y tamaño.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Riesgo de alucinación en la descripción de escenas y trayectorias, especialmente con vídeos largos o con oclusiones en la proyección ERP.
- La ventana de contexto no está documentada, por lo que el número máximo de fotogramas procesables de forma fiable debe validarse empíricamente.
- Está especializado en vídeo panorámico ERP; su rendimiento en vídeo convencional o imágenes sueltas puede degradarse respecto al modelo base.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las condiciones del modelo base Qwen3.5-9B y del dataset PanoVideoCoT antes de desplegarlo en productos.
- El procesamiento de hasta 128 fotogramas a 1.280 píxeles implica un coste computacional y de memoria elevado que puede afectar a la latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lulidong/PanoVideoReasoner
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper "Think in 360°: Benchmarking and Bootstrapping Panoramic Video Reasoning": no disponible en la informacion proporcionada
- Repositorio de código o demo: no disponible en la informacion proporcionada
