# RunningHubAI/rh-feet-boost-krea-2-lora

## Resumen

rh-feet-boost-krea-2-lora es un adaptador LoRA de edición de imagen desarrollado por RunningHubAI (autoría del usuario @nnegret de RunningHub) sobre el modelo base Krea 2, el generador de imágenes de Krea AI entrenado desde cero y orientado a exploración creativa y estilística. El adaptador está especializado en la representación de pies descalzos: su objetivo es producir anatomía de pies, dedos, plantas, arcos, tobillos y talones de forma consistente en planos cerrados, ángulos bajos y perspectivas forzadas, un punto habitualmente problemático en los modelos de difusión.

El modelo se distribuye como un único fichero de pesos LoRA de 109 MiB (`K2_Feet_Boost_V1_nnegret.safetensors`) y está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o vía Hugging Face. No requiere palabras de activación: basta con describir en el prompt el tipo de representación de pies deseada. El autor recomienda combinarlo con sus LoRA de estilo (Line Art Anime Style y Thick Paint 2.5D) para obtener resultados coherentes con un acabado artístico concreto.

Su relevancia es acotada pero clara: es un ajuste fino de nicho que corrige un fallo anatómico recurrente en generación de figura humana completa, con parámetros de inferencia ajustados (peso 0.5-0.8, CFG 1, 8-10 pasos, sampler er_sde) que sugieren un modelo base de tipo destilado o turbo. No es un modelo de propósito general ni un modelo de lenguaje: es un adaptador visual específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (fichero de pesos de 109 MiB; el numero de parametros del adaptador no se publica) |
| Longitud de contexto | no aplicable (modelo de generacion de imagen; no procesa contexto de texto) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero LoRA en formato safetensors. No se publican variantes GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | no disponible (el prompt de texto se procesa a traves del codificador del modelo base; no se declara soporte idiomatico) |
| Licencia | no disponible. La model card indica que el modelo lo publica RunningHub en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`K2_Feet_Boost_V1_nnegret.safetensors`, 109 MiB) |
| Modelo base | Krea 2 (Krea AI), afinado desde "krea2" segun la model card |
| Tipo de tarea | image-text-to-image (edicion/generacion de imagen guiada por texto) |
| Tamano del repositorio | 0,1 GB |
| Plataformas objetivo | ComfyUI, RunningHub (internacional y China), Hugging Face |
| Fecha de creacion (segun HuggingFace) | 2026-09-28 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base Krea 2 ni el procedimiento de entrenamiento del adaptador: no se indican el rango del LoRA, las capas objetivo, el dataset utilizado, el numero de pasos de entrenamiento ni si hubo fases de ajuste por preferencias (RLHF/DPO). Lo unico documentado es que se trata de un LoRA de edicion de imagen afinado desde Krea 2 y que su funcion es mejorar la representacion de pies.

Krea 2 es, segun el repositorio oficial de Krea AI, un modelo de generacion de imagenes entrenado desde cero y enfocado a la exploracion creativa y estilistica, con versiones publicadas en Hugging Face etiquetadas como RAW y TURBO, ademas de un blog tecnico. La existencia de variantes RAW y TURBO, junto con los parametros de inferencia recomendados por el autor para este LoRA (CFG Scale fijo en 1, entre 8 y 10 pasos de muestreo, sampler er_sde), es coherente con un modelo base destilado o de muestreo rapido, aunque esto es una interpretacion y no un dato confirmado en la documentacion proporcionada.

Los hiperparametros de uso recomendados por el autor son: peso del LoRA entre 0,5 y 0,8 (valor por defecto 0,5), CFG Scale en 1 sin ajuste, entre 8 y 10 pasos (10 producen el mejor resultado segun el autor) y sampler er_sde. No se requiere palabra de activacion.

## Capacidades

- Generacion y edicion de imagen guiada por texto (pipeline image-text-to-image) mediante integracion del LoRA sobre el modelo base Krea 2.
- Representacion mejorada de pies descalzos: plantas, dedos separados, arcos, talones, tobillos, planos cerrados, angulos bajos y perspectivas forzadas con pies en primer plano.
- Funciona sin palabras de activacion: el efecto se controla describiendo en el prompt el tipo de representacion deseada.
- Compatibilidad declarada con otros LoRA del mismo autor para combinar estilo y anatomia (Line Art Anime Style LoRA y Thick Paint 2.5D Style LoRA).
- Ejecucion en ComfyUI como nodo de carga de LoRA, y en la plataforma RunningHub (incluida su API).
- No dispone de capacidad de generacion de texto, razonamiento, codigo, matematicas ni vision comprensiva.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No se declara soporte multilingue especifico ni modo de pensamiento (thinking mode), audio o video.

## Casos de uso

- Ilustracion de personajes de cuerpo completo: en escenas donde el personaje aparece descalzo, el LoRA corrige la anatomia de pies y dedos que los modelos base suelen deformar; se aplica con peso 0,5-0,8 junto al prompt de estilo habitual.
- Arte de figura y estudios de pose: para planos de detalle con escorzos complejos (pie en primer plano, camara a ras de suelo, perspectiva acentuada) donde el modelo base pierde la estructura de dedos y arco plantar.
- Diseno de calzado y moda: generacion de referencias de pies descalzos para mockups de sandalias, chanclas o calzado abierto, y para catalogos donde se necesita una anatomia consistente entre imagenes.
- Ilustracion divulgativa de podologia y fisioterapia: representaciones de la planta, el arco y la postura del pie para materiales educativos o articulos, controlando el angulo mediante prompt.
- Storyboard y comic: generacion de vinetas con planos contrapicados o detalles de pies en movimiento (carrera, salto, danza), donde la coherencia anatomica entre fotogramas es critica.
- Pipeline de produccion en ComfyUI: incorporacion del LoRA en un grafo junto a LoRA de estilo (line art, pintura 2.5D) y nodos de control de composicion, con parametros fijos (CFG 1, 10 pasos, er_sde) para lotes reproducibles.
- Generacion por lotes via API: uso del endpoint de RunningHub para producir series de imagenes con el mismo ajuste, integrable en un flujo de publicacion de contenido.
- Exploracion artistica de estilo: combinacion con el LoRA de estilo del mismo autor para forzar un acabado concreto (trazo de linea anime o pintura 2.5D) manteniendo la mejora anatomica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas con otros LoRA) ni evaluaciones cuantitativas de calidad de generacion de pies.

## Requisitos de hardware

- El adaptador en si ocupa 109 MiB, por lo que su huella de memoria es despreciable frente al modelo base.
- La VRAM necesaria viene determinada integramente por Krea 2 y por la resolucion de imagen; no se publica en la informacion disponible ninguna cifra de VRAM, latencia o throughput para este LoRA.
- Opciones de despliegue confirmadas: ComfyUI (local) y RunningHub (plataforma en la nube y API). La model card menciona explicitamente Hugging Face como plataforma de distribucion.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: son servidores de inferencia para modelos de lenguaje, no para LoRA de difusion de imagen.
- No se dispone de datos para confirmar si el conjunto (base mas LoRA) cabe en GPUs de consumo. Al tratarse de un modelo de difusion open source con variante TURBO de muestreo rapido (8-10 pasos segun los ajustes recomendados), es plausible su uso en GPUs de consumo de gama alta, pero se trata de una estimacion no confirmada por la documentacion.
- No se publican recomendaciones de GPU (A100, H100, RTX 4090 u otras) ni cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| rh-feet-boost-krea-2-lora | LoRA de edicion de imagen (pies) | Krea 2 | 109 MiB | no disponible | Hugging Face, RunningHub, ComfyUI | no disponible |
| rh-krea2-realism-slider-lora | LoRA slider de realismo | Krea 2 | no disponible | no disponible | Hugging Face (RunningHubAI) | no disponible |
| rh-krea2-lora-2094576703594139649 | LoRA de imagen | Krea 2 | no disponible | no disponible | Hugging Face (RunningHubAI) | no disponible |
| Krea 2 Feet (RunningHub, model 2086601968440684545) | LoRA de pies | Krea 2 | no disponible | no disponible | RunningHub | no disponible |

Los tres modelos comparables pertenecen al mismo ecosistema (RunningHub sobre Krea 2) y tienen en comun la ausencia de datos publicos de parametros, licencia explicita y benchmarks. La diferencia funcional es el objetivo del ajuste: este adaptador se centra en la representacion de pies descalzos, mientras que el slider de realismo modula el nivel de detalle y fotorrealismo de la imagen. No se dispone de informacion de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- Licencia no disponible: la model card no especifica terminos de uso. Indica que la publicacion la realiza RunningHub en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream. Esto implica que el uso comercial no esta garantizado y debe verificarse con el autor y con la licencia del modelo base Krea 2 antes de cualquier despliegue en produccion.
- El adaptador esta especializado en un unico rasgo anatomico (pies); aplicarlo con peso alto puede alterar la composicion general o introducir artefactos en el resto de la imagen.
- Riesgo de alucinacion visual: como cualquier modelo generativo de imagen, puede producir anatomia incorrecta (numero de dedos, proporciones, perspectiva) fuera del rango de prompts con el que fue entrenado. Los parametros recomendados por el autor (peso 0,5-0,8) acotan este riesgo.
- Ausencia total de benchmarks y de evaluacion cuantitativa publicada: no hay evidencia objetiva de mejora frente al modelo base mas alla de la recomendacion del autor.
- Sin datos de sesgos: no se documenta la composicion del dataset de entrenamiento (tono de piel, morfologia, genero), por lo que se desconoce si el LoRA reproduce sesgos de representacion.
- El contenido generado puede caer en la categoria de material fetichista o para adultos segun el prompt; es responsabilidad del usuario aplicar los filtros y cumplir la normativa aplicable y las condiciones de uso de la plataforma (ComfyUI local, RunningHub o Hugging Face).
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion por parte de la comunidad ni historial de incidencias.
- El repositorio es muy pequeno (0,1 GB) y contiene un unico fichero de pesos; no se incluyen scripts de ejemplo, workflows de ComfyUI ni configuraciones completas.
- No se declara compatibilidad con idiomas distintos del usado en los prompts de ejemplo (ingles) ni con otros formatos de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-feet-boost-krea-2-lora
- Model card en chino (referenciada): README_cn.md dentro del repositorio
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2071785707814866946
- Pagina del autor (@nnegret): https://www.runninghub.cn/user-center/1934317192743657474
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- LoRA de estilo Line Art Anime Style: https://www.runninghub.cn/model/public/2071686978487279618
- LoRA de estilo Thick Paint 2.5D Style: https://www.runninghub.cn/model/public/2071779989955112961
- LoRA slider de realismo del mismo autor: https://huggingface.co/RunningHubAI/rh-krea2-realism-slider-lora
- Otro LoRA de RunningHubAI sobre Krea 2: https://huggingface.co/RunningHubAI/rh-krea2-lora-2094576703594139649
- Entrada relacionada "Krea 2 Feet" en RunningHub: https://www.runninghub.ai/model/public/2086601968440684545
- Repositorio oficial de Krea 2 (codigo de inferencia): https://github.com/krea-ai/krea-2
