# masterofaudio2077/Ageis-image-safety-classifier-dinov3

## Resumen

Ageis es un clasificador binario de imagenes disenado como guardrail de seguridad en pipelines de imagenes. Dado un parche de 224x224, devuelve la probabilidad de que la imagen contenga contenido NSFW, de modo que pueda filtrarse, bloquearse o derivarse a revision humana. No genera imagenes: es exclusivamente un clasificador de una sola etiqueta con cabeza lineal.

Tecnicamente es un ajuste fino parcial de DINOv3 ViT-H+/16 (facebook/dinov3-vith16plus-pretrain-lvd1689m). Se congelan los embeddings y los bloques 0-15 del transformer; se entrenan los bloques 16-31, la normalizacion final y una cabeza lineal sobre la concatenacion del token CLS y la media de los tokens de parche. El resultado son 840.595.207 parametros (0,84B) y 1,68 GB de pesos en bf16.

Su relevancia practica esta en el punto de operacion: el autor reporta un FPR del 0,23% a 95% de recall y del 0,51% a 99% de recall sobre un banco de 100.000 imagenes, frente al 20,40% y 42,01% respectivamente de Falconsai/nsfw_image_detection_26. Esa diferencia de ordenes de magnitud en falsos positivos es lo que lo hace util para limpieza de datasets a gran escala, donde un FPR alto destruye corpus legitimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-H+/16 (DINOv3), transformer con RoPE; ajuste fino parcial de bloques 16-31 + cabeza lineal |
| Parametros totales | 840.595.207 (0,84B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de imagen, entrada 224x224) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor menciona ejecucion en fp16 en T4) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | dinov3-license (DINOv3 License de Meta; obra derivada de los DINO Materials) |
| Formato de pesos | safetensors (repo de 1,7 GB) |
| Modelo base | facebook/dinov3-vith16plus-pretrain-lvd1689m |
| Tarea (pipeline) | image-classification |
| Entrada | imagen 224x224, normalizada con constantes incluidas en el repo |

## Arquitectura y entrenamiento

El backbone es un ViT-H+/16 de DINOv3 con 32 bloques transformer. En el ajuste fino se descongelan unicamente los bloques 16-31, la normalizacion final y la cabeza; los bloques 0-15 y los embeddings permanecen congelados y almacenados en bf16. La cabeza es una capa `Linear(2 x hidden -> 1)` aplicada sobre `[CLS; media de tokens de parche]`, entrenada con BCE-with-logits. Se desactiva el jitter de RoPE en tiempo de entrenamiento.

Los datos se muestrean con batches balanceados al 50% (300 imagenes a 224px por batch). La mitad limpia se compone de 30% ImageNet-21k, 30% ilustraciones limpias y 40% humanos de LAION filtrados; la mitad positiva mezcla fuentes fotograficas e ilustradas. El optimizador es Lion con LR 8e-6 en el backbone y decaimiento por capas de 0,75, LR 2e-4 en la cabeza, weight decay 0,1 solo en parametros 2D, betas (0,9; 0,99) y clipping de gradiente 1,0. El schedule es warmup de 1.000 pasos seguido de decaimiento coseno. Las aumentaciones incluyen RandomResizedCrop (escala 0,65-1,0), flip horizontal, downscale-upscale aleatorio (p=0,25) y recompresion JPEG con calidad 30-90 (p=0,35); deliberadamente no se aplica color jitter porque el tono de piel forma parte de la senal. El entrenamiento se ejecuto en una unica RTX 6000 Pro (96 GB) con autocast bf16 y `torch.compile`.

## Capacidades

- Clasificacion binaria NSFW/limpio por imagen, con salida sigmoide interpretable como probabilidad.
- Deteccion tanto de contenido fotografico explicito como de ilustraciones y escaneos suggestivos.
- Bajo indice de falsos positivos sobre fotografia general (ImageNet-21k), retratos (LAION humans) e ilustracion segura (Safebooru) a puntos de operacion de alto recall.
- Punto de operacion ajustable: el umbral se calibra sobre validacion propia; a 99% de recall el umbral reportado es 0,859.
- Procesamiento por lotes de alto rendimiento (batch 768 en fp16 sobre una T4).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni generacion de imagenes.
- No es un clasificador de imagenes de proposito general: la unica taxonomia aprendida es NSFW frente a limpio.

## Casos de uso

- Limpieza de corpus web a gran escala: pasar los shards de un dataset raspado por el clasificador con un umbral fijado a un recall objetivo (por ejemplo 95%) y descartar las imagenes marcadas. El FPR del 0,23% a ese punto permite purgar millones de imagenes sin diezmar el corpus limpio, algo inviable con detectores de FPR superior al 20%.
- Moderacion automatizada como primera pasada: colocar Ageis delante de la cola de revision humana para que solo lleguen a los moderadores los casos positivos y los cercanos al umbral, reduciendo el volumen de revision en ordenes de magnitud.
- Filtrado en el momento de la subida: bloquear imagenes sensibles antes de almacenarlas o servirlas, ejecutando el modelo en fp16 sobre una T4 con batches grandes para absorber picos de trafico.
- Curacion de datasets de entrenamiento multimodal: eliminar contenido NSFW de corpus de imagen-texto antes de entrenar modelos generativos, evitando que el material sensible contamine los pesos.
- Moderacion de contenido generado por usuarios en foros, marketplaces o plataformas de fanart: el rendimiento medido en Safebooru (FPR 0,60% a 95% de recall) lo hace adecuado para comunidades de ilustracion y anime, donde otros detectores fallan con FPR superiores al 50%.
- Auditoria y muestreo de calidad: puntuar un lote aleatorio de imagenes ya publicadas para estimar la prevalencia de contenido sensible y priorizar la revision manual.
- Preetiquetado para anotacion humana: usar la probabilidad como senal de priorizacion en herramientas de etiquetado, reservando el juicio humano para los casos ambiguos.

## Benchmarks y rendimiento

Evaluacion del autor sobre 100.000 imagenes no vistas, con shards de entrenamiento y validacion fijados por semilla (train 42, bench 43) y usando solo shards nunca vistos. Composicion: 20.000 fotos explicitas, 20.000 escaneos suggestivos, 10.000 ilustraciones explicitas, 20.000 humanos de LAION filtrados limpios, 15.000 de ImageNet-21k y 15.000 de Safebooru seguras.

| Metrica | Ageis | Falconsai-26 |
|---|---|---|
| ROC-AUC | 0,9985 | 0,9646 |
| PR-AUC | 0,9974 | 0,9671 |
| FPR a 95% recall | 0,23% | 20,40% |
| FPR a 99% recall | 0,51% | 42,01% |

Resultados por segmento, cada modelo en su propio umbral de 95% de recall (1,0 para Ageis; 0,0154 para Falconsai-26). En segmentos NSFW la cifra es recall; en segmentos limpios, FPR:

| Segmento | Tipo | Ageis | Falconsai-26 |
|---|---|---|---|
| ImageNet-21k | limpio, FPR | 0,007% | 3,73% |
| LAION humans | limpio, FPR | 0,11% | 4,76% |
| Safebooru | limpio, FPR | 0,60% | 57,92% |
| Fotos explicitas | recall | 99,40% | 97,30% |
| Fotos suggestivas | recall | 98,96% | 92,98% |
| Ilustraciones explicitas | recall | 94,82% | 94,48% |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, lo cual es esperable al tratarse de un clasificador de vision.

## Requisitos de hardware

- Pesos: 1,68 GB en bf16 (0,84B parametros). El repo completo ocupa 1,7 GB.
- VRAM estimada para inferencia: aproximadamente 2 GB solo para pesos; con activaciones y batch grande, entre 4 y 8 GB en fp16/bf16 segun tamano de lote.
- GPU recomendadas: T4 (16 GB) valida en fp16 con batch 768 a 224x224; Ampere o superior (A100, H100, RTX 3090/4090, RTX 6000 Pro) con bf16 para aprovechar los tensor cores de bf16.
- Cabe holgadamente en cualquier GPU de consumo con 8 GB o mas (RTX 3060, 4060, 4070, 4080, 4090). En Turing usar fp16, no bf16.
- Despliegue: al ser un `nn.Module` con `PyTorchModelHubMixin`, se carga con `huggingface_hub` y `transformers` (`AutoModel.from_config` sobre la configuracion del backbone). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vision.
- Latencia y throughput: no se publican cifras de latencia. El unico dato de rendimiento es el regimen de entrenamiento (batch 300 a 224px en una RTX 6000 Pro); el autor indica que la inferencia en T4 fp16 admite batch 768.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | ROC-AUC | FPR a 95% recall | Licencia |
|---|---|---|---|---|---|
| Ageis (este modelo) | 0,84B | imagen 224x224 | 0,9985 | 0,23% | dinov3-license |
| Falconsai/nsfw_image_detection_26 | no disponible | imagen | 0,9646 | 20,40% | no disponible |
| Alternativas adicionales de moderacion de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion publicada por el autor es contra Falconsai-26, sobre el mismo banco de 100.000 imagenes. No se dispone de datos de otros detectores NSFW en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: solo distingue NSFW de limpio; no sirve como clasificador general ni como detector de otras politicas de contenido (violencia, marcas, datos personales, etc.).
- El umbral depende de la politica de contenido: lo que cuenta como NSFW varia entre comunidades, por lo que hay que calibrar el punto de operacion sobre validacion propia.
- La salida sigmoide se satura: en el punto de 95% de recall la mayoria de positivos puntuan exactamente 1,0, de modo que la probabilidad no debe interpretarse como una medida fina de confianza.
- No debe usarse como decision final en casos de alto impacto; el autor recomienda revision humana.
- Rendimiento inferior en ilustraciones explicitas (recall 94,82%) que en fotografia (99,40%), por lo que el contenido dibujado requiere umbrales mas conservadores.
- Riesgo de sesgo por el tono de piel: el propio diseno del entrenamiento evita el color jitter precisamente porque el tono forma parte de la senal; conviene auditar el FPR por demografia antes de desplegar en produccion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos negativos y positivos en dominios alejados de la distribucion de entrenamiento (imagenes medicas, arte abstracto, capturas de pantalla).
- Licencia `dinov3-license` de Meta: al ser obra derivada de los DINO Materials, se heredan sus terminos. Es una licencia "other", no estandar, y debe revisarse antes de uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Adopcion muy baja (17 descargas, 0 likes) y creado en octubre de 2026: no hay validacion independiente de los resultados reportados por el autor.
- No se documentan idiomas ni capacidades de texto porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masterofaudio2077/Ageis-image-safety-classifier-dinov3
- Modelo base DINOv3 ViT-H+/16: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Modelo comparado Falconsai/nsfw_image_detection_26: https://huggingface.co/Falconsai/nsfw_image_detection_26
- Paper de DINOv3: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
