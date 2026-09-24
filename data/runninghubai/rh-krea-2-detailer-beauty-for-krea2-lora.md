# RunningHubAI/rh-krea-2-detailer-beauty-for-krea2-lora

## Resumen

rh-krea-2-detailer-beauty-for-krea2-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (RunningHub, cuenta de autor @AIGC工作站) para el modelo base Krea 2. Su funcion no es generar imagenes desde cero, sino anadir microdetalle, textura y complejidad a creaciones ya realizadas con Krea 2, actuando como una pasada de "detailer" dentro de un flujo de trabajo de difusion. El repositorio de HuggingFace contiene un unico fichero de pesos de 109 MiB, `Detailer_-_Krea2_project.safetensors`, y el propio autor indica que esta afinado a partir de `krea2`.

Se trata, por tanto, de un modelo de imagen (pipeline `image-text-to-image`) y no de un modelo de lenguaje: no tiene parametros activos, contexto de tokens ni capacidades de razonamiento o tool calling. Su relevancia practica es acotada y muy especializada: sirve para mejorar el acabado final de imagenes generadas, un paso habitual en pipelines de difusion donde el detalle fino (piel, tela, superficies, grano) se degrada tras el muestreo inicial.

El repositorio no incluye model card tecnica detallada, no declara licencia explicita, no publica resultados de benchmarks y registra 0 descargas y 0 "likes" en el momento de la consulta. Existe una version equivalente publicada por el mismo autor en Civitai y en Tensor.Art, ademas de un Space de HuggingFace que usa un LoRA de detalle distinto sobre Krea 2 Turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion de imagenes Krea 2; no disponible el detalle de la arquitectura interna del modelo base |
| Parametros totales | no disponible; el unico fichero distribuido (`.safetensors`) ocupa 109 MiB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos `.safetensors` |
| Idiomas soportados | no disponible (la model card no lo indica; el prompting depende del modelo base Krea 2) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (adaptador LoRA, 109 MiB, fichero `Detailer_-_Krea2_project.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA de edicion de imagen ("Model Type: LoRA (image edit)"), afinado desde `krea2`. No se especifica el rango, el numero de capas adaptadas, el optimizador, el numero de pasos ni la composicion del dataset de entrenamiento. Tampoco se documenta si el entrenamiento se realizo mediante DreamBooth, fine-tuning de adaptadores o tecnicas de edicion por referencia en contexto (como el metodo de edicion de Krea 2 usado por otros LoRAs de detalle de la comunidad).

Funcionalmente, el adaptador se aplica sobre el modelo base dentro de ComfyUI y modula el muestreo para reforzar el detalle fino. El autor recomienda intensidades de 0,7 a 1,3, senalando que 1,0 o 1,1 suele dar el mejor acabado en la mayoria de imagenes, y advierte de que una intensidad de 2,0 produce un efecto de "decay" (deterioro estetico intencionado) util para escenas con aspecto antiguo o abandonado. No se documentan innovaciones tecnicas adicionales, decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Edicion y refinado de imagen: anade microdetalle y textura sobre imagenes generadas previamente con Krea 2.
- Aumento de complejidad visual: incrementa el nivel de detalle en superficies, materiales y estructuras finas.
- Ajuste de intensidad por parametro de peso: el efecto es graduable entre 0,7 y 1,3, con 1,0-1,1 recomendado para resultados equilibrados.
- Efecto estetico "decay": a intensidad ~2,0 genera un acabado de deterioro, oxidacion o abandono, orientado a estetica de ruinas o vintage.
- Integracion con ComfyUI: se carga como nodo LoRA dentro de un flujo de difusion existente.
- Ejecucion en la nube: puede emplearse mediante la plataforma RunningHub y su API, sin despliegue local.
- Generacion de texto, razonamiento, codigo, matematicas, vision semantica, tool calling, agentes y capacidades multilingues: no aplica; no es un modelo de lenguaje.

## Casos de uso

- Acabado final en flujos de generacion de imagen: se inserta como segunda pasada en ComfyUI tras el muestreo base con Krea 2, para recuperar el detalle que se pierde en la generacion inicial.
- Retoque de retratos y figura humana: a intensidades bajas (0,7-1,0) refuerza textura de piel, pelo y tejidos sin alterar la composicion de la imagen original.
- Fotografia de producto y e-commerce: aplicado sobre renders o imagenes generadas de producto, anade detalle en materiales (metal, cuero, tejido) para que la pieza resulte mas creible en catalogo.
- Arte conceptual y assets para videojuegos: se usa como paso de refinado sobre bocetos generados, incrementando la densidad de detalle antes de pasar a modelado o a texturizado manual.
- Ilustracion editorial y portadas: permite elevar el nivel de detalle de una ilustracion generada sin rehacer el encuadre ni el estilo, manteniendo la direccion artistica.
- Estetica de ruinas y abandono: con intensidad cercana a 2,0 se obtiene un efecto de deterioro controlado, util para escenarios postapocalipticos, patrimonio abandonado o narrativa visual vintage.
- Restauracion estetica de imagenes antiguas generadas o sinteticas: el efecto decay puede aplicarse de forma inversa como referencia de estilo para series coherentes de imagenes envejecidas.
- Automatizacion por API en produccion: a traves de la API de RunningHub, el LoRA puede encadenarse en un pipeline de generacion de imagenes a escala sin gestionar infraestructura propia de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FID, CLIP score, SSIM, comparativas A/B cuantificadas) ni comparaciones numericas con otros LoRAs de detalle.

## Requisitos de hardware

- El repositorio no especifica requisitos de VRAM. El consumo vendra determinado por el modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- El adaptador en si anade un fichero de 109 MiB que debe cargarse en memoria junto con el checkpoint base; el sobrecoste de VRAM del LoRA es marginal frente al del modelo sobre el que se aplica.
- GPU recomendadas: no disponible para el modelo base. El adaptador, al ser un LoRA, no impone por si mismo un minimo de GPU.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base Krea 2 y de la resolucion de trabajo.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (nube), API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponible.
- Alternativa sin hardware local: la ejecucion mediante RunningHub y su API evita requisitos de GPU en el equipo del usuario.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Intensidad recomendada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea-2-detailer-beauty-for-krea2-lora | LoRA de detalle/edicion | Krea 2 | 0,7-1,3 (1,0-1,1 optimo); 2,0 para efecto decay | no disponible | HuggingFace, Civitai, Tensor.Art, RunningHub |
| Detail Enhancer edit LoRA (reverentelusarca) | LoRA de detalle/edicion | Krea 2 Turbo | no disponible | no disponible | Space de HuggingFace |
| rh-krea2-lora | LoRA | Krea 2 | no disponible | no disponible | HuggingFace (RunningHubAI) |
| Detailer - beauty for Krea2 (v1.0 Pretty) | LoRA de detalle | Krea 2 | 0,7-1,3 | no disponible | Civitai |

No se dispone de datos de rendimiento comparativos entre estas alternativas; la comparacion se limita a tipo de artefacto, modelo base y canal de distribucion.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el checkpoint base Krea 2 para funcionar. Sin ese modelo, el fichero `.safetensors` no es utilizable.
- No publica informacion de entrenamiento: se desconoce el dataset, el numero de pasos y el rango del adaptador, lo que dificulta evaluar su comportamiento fuera del dominio previsto.
- Ausencia de licencia explicita: la model card indica que el copyright pertenece al autor y remite a la licencia del proyecto original. Esto deja sin resolver las condiciones de uso comercial, lo que supone un riesgo juridico para produccion.
- Riesgo de sobreprocesado: intensidades altas o mal calibradas pueden introducir artefactos, texturas irreales o un efecto de deterioro no deseado (el propio autor documenta el efecto "decay" a 2,0).
- Dependencia de la intensidad: el resultado es muy sensible al parametro de peso, por lo que requiere ajuste manual por imagen o por lote.
- Sin benchmarks: no hay evidencia cuantitativa de mejora sobre el modelo base, ni garantia de que el detalle anadido sea coherente con el contenido semantico.
- Sin validacion de sesgos: no se documenta ningun analisis de sesgos, y al ser un modelo de imagen puede reproducir sesgos de representacion del modelo base y de sus datos de entrenamiento.
- Idiomas y prompting: no disponibles; cualquier limitacion linguistica del prompt proviene de Krea 2, no del LoRA.
- Traccion nula en HuggingFace: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso en produccion ni soporte de comunidad en esa plataforma.
- Fechas del repositorio: la model card indica creacion y actualizacion en septiembre de 2026 (segun los metadatos de HuggingFace), dato a verificar por el lector.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-krea-2-detailer-beauty-for-krea2-lora
- Civitai (Detailer - beauty for Krea2, v1.0 Pretty): https://civitai.com/models/2790112/detailer-beauty-for-krea2
- Tensor.Art ([KR2] Detailer - beauty for Krea2): https://tensor.art/models/1031885023990568502
- Space de HuggingFace (Krea 2 Detail Enhancer, Edit LoRA): https://huggingface.co/spaces/hugging-apps/krea2-detail-enhancer-edit-lora
- RunningHubAI/rh-krea2-lora en HuggingFace: https://huggingface.co/RunningHubAI/rh-krea2-lora
- Articulo sobre textura y detalle en Krea 2 con ComfyUI: https://myaiforce.com/krea2-dual-sampler/
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2079007761697955841
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1998616841276772354
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
