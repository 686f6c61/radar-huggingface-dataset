# EditFigure/banana-v5.10-qwen35-0.8B

## Resumen

Banana v5.10 (checkpoint 24000) es un modelo de vision-lenguaje de 852.985.920 parametros (~0,85B), desarrollo del usuario EditFigure, obtenido mediante ajuste fino supervisado (SFT) de parametros completos sobre Qwen/Qwen3.5-0.8B. Se distribuye como checkpoint de inferencia completo, no como adaptador LoRA, en formato safetensors y con soporte declarado para vLLM. Su pipeline es image-text-to-text y su proposito no es la conversacion general, sino la deteccion de layout y la reconstruccion de subatributos de graficos editables: recibe una imagen (diagrama, esquema, recorte de una forma o de una linea) y devuelve JSON estructurado con coordenadas.

El problema que resuelve es concreto: convertir elementos graficos en representaciones legibles por maquina. Para ello define cinco tareas (grounding, shape, line, image y background) con esquemas de campos exactos, prompts YAML versionados (v5.8, reutilizados por los datos de v5.10) y salidas con coordenadas enteras normalizadas de 0 a 999 relativas a la imagen de entrada. El modelo se publica con un cliente de inferencia propio (`infer.py`) que aplica el preprocesado de imagen requerido y rechaza respuestas truncadas.

Es relevante ahora porque la digitalizacion y edicion automatica de diagramas es un cuello de botella habitual en pipelines documentales, y este checkpoint demuestra que un modelo sub-1B puede alcanzar F1 de deteccion por encima del 80% en la evaluacion interna del autor (real_v1 y real_v2), con un consumo de recursos muy contenido. La contrapartida es que es un modelo muy especializado, con licencia no declarada, sin cuantizaciones publicadas y sin validacion externa (0 descargas y 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada de Qwen/Qwen3.5-0.8B (tag `qwen3_5`), pipeline image-text-to-text |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | No aplica: la informacion disponible no indica arquitectura MoE |
| Longitud de contexto | 16.384 tokens en el servidor vLLM (entrada + salida). Entrenamiento con longitud maxima 8.000 |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 para el servidor vLLM) |
| Idiomas soportados | en, zh (prompts y esquemas en ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de inferencia completo, no LoRA). Tamano del repo: 1,7 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tareas declaradas | grounding, shape, line, image, background |
| Rango de pixeles de imagen | 500.000–4.000.000 px (deteccion y reconstruccion); entrenamiento con 0,5M–2M px |
| Configuracion de generacion recomendada | `temperature=0`, `top_p=1`, `top_k=-1`, `repetition_penalty=1.0`, `max_tokens=8000`, `enable_thinking=false` |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna (numero de capas, configuracion de atencion ni diseno del codificador visual). Lo que si se especifica es que se trata de un ajuste fino supervisado (SFT) de parametros completos sobre Qwen/Qwen3.5-0.8B, con el modelo base declarado tanto como `base_model` como `base_model:finetune`. No se menciona RLHF, DPO ni ninguna etapa de alineacion posterior al SFT, ni se indica el numero total de tokens de entrenamiento.

Los datos de entrenamiento se describen de forma indirecta a traves del pipeline de tareas: grupos de prompts versionados (`prompts/*.yaml`, version v5.8 reutilizada por los datos de v5.10) en variantes `detailed` y `concise`, con instrucciones de sistema compartidas que exigen un unico valor JSON, sin prosa, y coordenadas enteras de 0 a 999 relativas a la entrada actual. El entrenamiento uso una longitud maxima de 8.000 tokens y un rango de 0,5M a 2M pixeles por imagen. Como innovaciones operativas destacan el uso obligatorio del modo no-thinking, el redimensionado inteligente de Qwen aplicado exactamente una vez (factor 32) en el cliente y no en el servidor, y la ausencia deliberada de decodificacion restringida a JSON: el autor prefiere exponer salidas invalidas o truncadas en lugar de ocultarlas.

## Capacidades

- Deteccion de layout con grounding: devuelve listas de `bbox_2d` y `label` con cuatro categorias (`shape`, `icon`, `image`, `line`).
- Reconstruccion de atributos de formas (`shape`) en tres formulaciones: apariencia, geometria y reconstruccion.
- Reconstruccion de lineas (`line`) en tres formulaciones: apariencia, puntos ordenados (trazados/paths) y reconstruccion.
- Clasificacion del tipo de imagen (`image_type`) segun la taxonomia definida por el prompt.
- Clasificacion de fondo (`background`), actualmente solo con variante detallada.
- Salida en JSON con esquema fijo y coordenadas normalizadas 0–999 en el sistema de coordenadas del recorte enviado.
- Procesamiento de imagenes de hasta 4M pixeles en inferencia (limite alineado con la configuracion de evaluacion de deteccion).
- Sin soporte declarado de tool calling, function calling, agentes, audio o video (el servidor de referencia limita explicitamente a 1 imagen y 0 videos por prompt).
- Capacidades multilingues limitadas a ingles y chino; no es un modelo conversacional de proposito general.

## Casos de uso

- Conversion de diagramas a JSON editable: el modelo recibe el diagrama completo y devuelve la lista de elementos con `bbox_2d` y etiqueta, lo que permite reconstruir la escena en un editor vectorial sin intervencion manual.
- Digitalizacion de esquemas tecnicos: sobre un recorte de una forma con contexto (padding 0,65, tamano minimo 256), la tarea `shape --formulation reconstruction` genera los atributos geometricos necesarios para recrear la figura, y las coordenadas se remapean al documento original con `x_original = crop_left + x/999 * crop_width`.
- Extraccion de trazados de lineas en planos y diagramas de flujo: la formulacion `points` devuelve rutas ordenadas, adecuadas para regenerar conectores, ejes o trazados en herramientas de dibujo.
- Anotacion asistida de datasets de layout: el modo `grounding` sirve como preanotador para etiquetar grandes volumenes de capturas con cajas y etiquetas, revisables despues por un humano.
- Triaje y clasificacion en pipelines documentales: la tarea `image --image_type` categoriza la imagen y la tarea `background` separa el fondo, lo que permite enrutar cada documento a un extractor especializado.
- Edicion automatica de presentaciones y materiales de marca: al reconstruir formas y lineas por separado, el modelo habilita flujos donde un diagrama rasterizado se convierte en objetos editables con atributos recuperados.
- Control de calidad de digitalizaciones: comparar el JSON generado con la geometria esperada permite detectar diagramas mal escaneados o recortes incorrectos antes de publicarlos.
- Integracion en herramientas de autor: al ser un modelo de 0,85B servible con vLLM en una sola GPU y `tensor-parallel-size 1`, puede desplegarse junto al backend de una aplicacion de edicion sin un cluster dedicado.

## Benchmarks y rendimiento

Evaluacion interna del autor sobre los conjuntos real_v1 (170 imagenes efectivas) y real_v2 (240 imagenes efectivas), con el mismo protocolo dentro de la comparativa de checkpoints de v5.10:

| Checkpoint | real_v1 F1 | real_v2 F1 |
|---|---:|---:|
| 18000 | 80,2814% | 81,8104% |
| 24000 (esta version) | 80,7621% | 82,0209% |

Metricas de atributos con cajas ground truth para el checkpoint 24000:

| Tarea | Metrica | real_v1 | real_v2 |
|---|---|---:|---:|
| shape | Macro | 62,7445% | 63,8711% |
| line | Macro | 82,2322% | 71,0772% |

Advertencias del propio autor sobre estas cifras: el checkpoint 24k es el mejor en deteccion entre los checkpoints evaluados (6k–24k), pero no en todas las tareas, ya que el 18k supera ligeramente la mayoria de metricas de atributos shape/line con cajas GT. No se realizo ninguna prueba de significancia estadistica. Existe solapamiento documentado entre imagenes del conjunto de test y fuentes de entrenamiento historicas, por lo que estos numeros no deben describirse como generalizacion libre de fuga demostrada. Ademas, las puntuaciones de atributos con cajas GT no miden el pipeline completo de deteccion y reconstruccion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en bfloat16: aproximadamente 1,7 GB (coincide con el tamano del repo), calculado a partir de los 852.985.920 parametros.
- VRAM estimada para inferencia: no hay cifra oficial. El autor indica explicitamente que la publicacion no reclama un benchmark de despliegue en GPU ni una garantia de VRAM minima. Como referencia, la configuracion de servidor usa `--gpu-memory-utilization 0.85`, `--max-model-len 16384`, `--max-num-seqs 4` y `--dtype bfloat16`, con una sola imagen por prompt.
- Estimacion orientativa (no confirmada por el autor): los pesos ocupan ~1,7 GB y, dado que el redimensionado usa parches de 32 px, una imagen de 4M pixeles equivale a unos 3.900 tokens visuales, de modo que el KV cache puede crecer de forma apreciable segun concurrencia y longitud de salida.
- GPU recomendadas: cualquier GPU con suficiente VRAM para bfloat16 y el KV cache configurado. El ejemplo oficial usa una sola GPU (`CUDA_VISIBLE_DEVICES=0`, `--tensor-parallel-size 1`); no se mencionan A100 ni H100. Modelos consumer como RTX 3060 de 12 GB o superiores deberian ser suficientes, aunque no esta verificado por el autor.
- Si cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, pero no hay confirmacion oficial ni cifras medidas.
- Opciones de despliegue documentadas: vLLM 0.19.1 con Transformers 5.10.1, en un entorno virtual Python 3.11 aislado (`uv venv`), con `--served-model-name banana`, `--limit-mm-per-prompt '{"image":1,"video":0}'`, `--generation-config vllm`, `--default-chat-template-kwargs '{"enable_thinking":false}'` y `--mm-processor-kwargs '{"do_resize":false}'`. Incluye un cliente de referencia `infer.py`.
- No se documenta soporte para llama.cpp, Ollama, TGI ni otros motores, ni versiones GGUF.
- Latencia y throughput: no disponible. Unicamente se advierte que, si falta memoria, hay que reducir la concurrencia antes que la calidad de imagen, y que en despliegues con multiples replicas deben usarse directorios `TRITON_CACHE_DIR` y `TORCHINDUCTOR_CACHE_DIR` locales por nodo.
- Seguridad en despliegue: exponer el servidor en remoto solo detras de autenticacion y TLS; localhost es la opcion segura por defecto.

## Comparativa con modelos similares

No se dispone de datos de modelos de layout comparables en la informacion proporcionada. La unica comparacion posible es interna:

| Modelo | Parametros | Contexto | F1 real_v1 | F1 real_v2 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| banana-v5.10-qwen35-0.8B (checkpoint 24000) | 852.985.920 | 16.384 en servidor / 8.000 de entrenamiento | 80,7621% | 82,0209% | no disponible | HuggingFace, safetensors |
| banana checkpoint 18000 (misma familia) | no disponible | no disponible | 80,2814% | 81,8104% | no disponible | referencia interna en la model card |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la informacion | no disponible | no evaluado con este protocolo | no evaluado con este protocolo | no disponible | HuggingFace |

Comparativas con alternativas de la misma categoria (por ejemplo, modelos especializados en document layout o image-to-JSON): no disponible.

## Limitaciones y advertencias

- No es un modelo de chat general. El autor lo declara explicitamente como modelo para deteccion de layout y reconstruccion de subatributos de graficos editables.
- Requiere el modo no-thinking (`enable_thinking=false`) y mensajes con la imagen primero y el texto de tarea despues.
- Depende de prompts exactos: los YAML contienen el esquema de campos y el texto de sistema y usuario literales; parafrasear los nombres de enum rompe el contrato de la tarea.
- Riesgo de alucinacion geometrica: no se aplica decodificacion restringida a JSON ni reintentos, y el propio autor advierte que un JSON parseable no implica que el esquema de tarea ni la geometria sean validos.
- Las coordenadas se expresan de 0 a 999 relativas a la entrada actual; para reconstruccion hay que remapearlas manualmente al documento original. Nunca se debe recortar geometria valida al cuadro de propuesta.
- Preprocesado critico: el servidor debe arrancar con `do_resize=false` y el cliente aplica el redimensionado inteligente de Qwen (factor 32) exactamente una vez. Enviar imagenes sin redimensionar al servidor produce resultados incorrectos.
- Orientacion EXIF: el cliente la aplica antes del redimensionado; las anotaciones y propuestas deben usar ese mismo sistema de coordenadas orientado a visualizacion.
- La reconstruccion asume una preparacion de recorte concreta (padding 0,65 y minimo 256 px) y un remapeo explicito de la propuesta seleccionada; el cliente de ejemplo acepta un recorte ya preparado, no un pipeline completo de deteccion a reconstruccion.
- Limite de contexto: los 16.384 tokens del servidor son capacidad de entrada mas salida, no una longitud de entrenamiento; el entrenamiento uso 8.000. El limite superior de 4M pixeles en inferencia corresponde a la configuracion de evaluacion de deteccion, mientras que el entrenamiento uso 0,5M–2M.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano ni de otras lenguas, ni evaluacion multilingue.
- Licencia no declarada: la ausencia de licencia explicita impide asumir derechos de uso comercial y es un riesgo legal para produccion.
- Riesgo de fuga en la evaluacion: el autor documenta solapamiento historico entre fuentes de entrenamiento e imagenes de test, y no se realizo prueba de significancia; las cifras no deben presentarse como generalizacion limpia.
- Las metricas de atributos con cajas GT no miden el pipeline completo de deteccion y reconstruccion.
- Sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha; es una publicacion de autor individual, sin peer review.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ u otras): no se puede desplegar en motores que las requieran.
- El rendimiento en tareas distintas de las cinco declaradas, incluyendo el modo thinking del modelo base, no esta caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EditFigure/banana-v5.10-qwen35-0.8B
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Los resultados de busqueda web proporcionados (dafont.com, hilos de 52pojie.cn y Zhihu sobre TikTok) no guardan relacion con el modelo y no se incluyen como referencias.

No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs tecnicos, repositorios de codigo o demos.
