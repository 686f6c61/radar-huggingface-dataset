# masterofaudio2077/Ageis-image-safety-classifier-dinov3

## Resumen

Ageis (publicado como "Ageis-image-safety-classifier-dinov3") es un clasificador binario de imagenes disenado como guardrail de seguridad en pipelines de imagenes. Puntua cada imagen con la probabilidad de que contenga contenido NSFW (not safe for work), de modo que pueda filtrarse, bloquearse o derivarse a revision humana. No genera imagenes: solo clasifica.

Es un fine-tune parcial de DINOv3 ViT-H+/16 de Meta: se entrenan los ultimos 16 de los 32 bloques del transformer, con una cabeza lineal sobre la concatenacion del token CLS y la media de los tokens de parche, usando perdida BCE. El modelo cuenta con 840.595.207 parametros y un repositorio de 5,0 GB en safetensors.

Su relevancia practica esta en el punto de operacion: en el benchmark publicado de unas 100.000 imagenes retenidas, alcanza un ROC-AUC de 0,9985 y un FPR del 0,23 % a 95 % de recall, frente al 20,40 % de Falconsai/nsfw_image_detection_26 en el mismo punto. Es, por tanto, una alternativa de filtrado de primera pasada con una tasa de falsos positivos muy baja sobre imagenes limpias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-H+/16) con cabeza lineal de clasificacion binaria |
| Parametros totales | 840.595.207 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; resolucion de entrada no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador de imagenes; no procesa texto) |
| Licencia | dinov3-license (DINOv3 License de Meta; obra derivada de los DINO Materials) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone DINOv3 ViT-H+/16 preentrenado por Meta (`facebook/dinov3-vith16plus-pretrain-lvd1689m`). El fine-tune es parcial: solo se entrenan los ultimos 16 de los 32 bloques del transformer, junto con una cabeza lineal que opera sobre la concatenacion del token CLS y la media de los tokens de parche. La funcion de perdida es BCE (binary cross-entropy) para la tarea binaria NSFW vs. limpio.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un clasificador). Si se documenta el proceso de evaluacion: los shards de entrenamiento y validacion se eligieron con semilla fija (train 42, bench 43) y el benchmark usa solo shards nunca vistos en entrenamiento ni validacion. Tambien se documentan dos correcciones posteriores al lanzamiento: un escalado de la cabeza por 1/6 (sin reentrenamiento) para evitar la saturacion de la sigmoide en BF16, y una edicion de la LayerNorm final del backbone que cambia la escala del logit.

## Capacidades

- Clasificacion binaria de imagenes: devuelve la probabilidad de contenido NSFW frente a contenido limpio.
- Filtrado de datasets: eliminacion de imagenes NSFW de corpus web a gran escala en un punto de operacion de recall/falsos positivos elegido.
- Moderacion automatizada de contenido como primera pasada en pipelines de trust and safety, antes de la revision humana.
- Cribado de subidas: bloqueo de imagenes sensibles antes de almacenarlas o mostrarlas.
- Funciona sobre fotografias explicitas, fotografias sugestivas, ilustraciones explicitas y arte/anime seguro (segun las slices del benchmark).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Limpieza de corpus web a gran escala: aplicar el clasificador a cada imagen descargada y descartar las que superen el umbral calibrado; el FPR del 0,23 % a 95 % de recall permite procesar millones de imagenes con perdida minima de datos limpios.
- Moderacion de subidas en plataformas UGC: ejecutar el modelo en la ruta de ingesta para rechazar o marcar imagenes antes de almacenarlas, reduciendo el coste de revision humana y el riesgo de exposicion.
- Primera pasada en colas de revision humana: ordenar por probabilidad y derivar solo los casos cercanos al umbral, de modo que los revisores se concentren en las decisiones ambiguas.
- Filtrado de datasets de entrenamiento multimodal: eliminar contenido NSFW de corpus de imagen-texto antes de entrenar modelos generativos, evitando contaminacion del dataset.
- Cumplimiento y politicas de contenido: integrar el clasificador como control automatizado en flujos con requisitos de moderacion, con umbral ajustado a la politica interna de cada comunidad.
- Cribado en herramientas de anotacion o curación de datasets: preetiquetar imagenes como seguras o sensibles para acelerar el trabajo de anotadores humanos.

## Benchmarks y rendimiento

Benchmark sobre unas 100.000 imagenes retenidas (20.000 fotos explicitas, 20.000 fotos sugestivas, 10.000 ilustraciones explicitas como NSFW; 20.000 imagenes de personas de LAION filtradas limpias, 15.000 de ImageNet-21k y 15.000 de Safebooru como limpias). La tabla corresponde al benchmark del lanzamiento original:

| Metrica | Ageis | Falconsai-26 |
|---|---|---|
| ROC-AUC | 0,9985 | 0,9646 |
| PR-AUC | 0,9974 | 0,9671 |
| FPR a 95 % de recall | 0,23 % | 20,40 % |
| FPR a 99 % de recall | 0,51 % | 42,01 % |

Resultados por slice, cada modelo en su propio umbral de 95 % de recall (recall para slices NSFW, FPR para slices limpias):

| Slice | Tipo | Ageis | Falconsai-26 |
|---|---|---|---|
| ImageNet-21k | limpia, FPR | 0,007 % | 3,73 % |
| LAION humans | limpia, FPR | 0,11 % | 4,76 % |
| Safebooru | limpia, FPR | 0,60 % | 57,92 % |
| explicit photos | recall | 99,40 % | 97,30 % |
| suggestive photos | recall | 98,96 % | 92,98 % |
| explicit illustrations | recall | 94,82 % | 94,48 % |

Tras el escalado de la cabeza (division por 6, sin reentrenamiento), sobre la instantanea actual del benchmark:

| Metrica | Cabeza original (ruta BF16) | Cabeza escalada |
|---|---|---|
| ROC-AUC | 0,9987 | 0,9996 |
| PR-AUC | 0,9979 | 0,9996 |
| FPR a 95 % de recall | 0,180 % | 0,034 % |
| Recall real en ese punto | 98,30 % | 95,16 % |
| FPR a 98,3 % de recall | 0,180 % | 0,184 % |
| FPR a 99 % de recall | 0,410 % | 0,410 % |

Umbrales recomendados con los pesos actuales (con la edicion del backbone): 0,9959 para 95 % de recall y 0,7892 para 99 % de recall.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 840,6 M de parametros, los pesos en BF16 ocupan aproximadamente 1,7 GB, mas activaciones y overhead del runtime.
- GPU recomendadas: no especificadas en la informacion; por tamano, el modelo es apto para GPUs de datacenter (A100, H100) y para GPUs de consumo con suficiente VRAM.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM en BF16, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: no se documentan en la model card; al ser un modelo PyTorch con `pytorch_model_hub_mixin`/`model_hub_mixin`, es integrable via `transformers`/PyTorch, pero no se confirman vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a clasificadores de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | ROC-AUC (benchmark Ageis) | FPR a 95 % recall | Licencia |
|---|---|---|---|---|---|
| Ageis (DINOv3 ViT-H+/16) | 840,6 M | no disponible | 0,9985 | 0,23 % | dinov3-license |
| Falconsai/nsfw_image_detection_26 | no disponible | no disponible | 0,9646 | 20,40 % | no disponible |

No se dispone en la informacion proporcionada de datos de otros clasificadores NSFW comparables (por ejemplo, variantes de CLIP o clasificadores basados en ResNet); la unica comparacion publicada es con Falconsai/nsfw_image_detection_26.

## Limitaciones y advertencias

- Especificidad de dominio: el modelo esta especializado en NSFW frente a limpio; no es un clasificador de imagenes de proposito general.
- Contexto cultural: lo que cuenta como NSFW varia entre comunidades; hay que calibrar el umbral a la politica de contenido propia.
- No es un decisor final: para decisiones de alto impacto debe mantenerse la revision humana.
- Saturacion en BF16 y calibracion: la cabeza fue escalada por 1/6 y la LayerNorm final del backbone editada; los umbrales dependen de los pesos actuales (0,9959 a 95 % de recall y 0,7892 a 99 % de recall). Si el dominio difiere, hay que recalibrar sobre datos propios.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion; el rendimiento cae en ilustraciones explicitas (94,82 % de recall) frente a fotografias (99,40 %).
- Restricciones de licencia: se distribuye bajo la DINOv3 License de Meta como obra derivada de los DINO Materials; conviene revisar los terminos antes de uso comercial.
- Caveat de produccion: el modelo no genera texto ni soporta tool calling; debe integrarse como un componente de puntuacion dentro de un pipeline mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/Ageis-image-safety-classifier-dinov3
- Modelo base: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Modelo de comparacion: https://huggingface.co/Falconsai/nsfw_image_detection_26
