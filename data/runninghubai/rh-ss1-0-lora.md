# RunningHubAI/rh-ss1.0-lora

## Resumen

rh-ss1.0-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, atribuido al autor @yang you dentro de la plataforma RunningHub. No es un modelo de lenguaje ni un modelo de difusion completo: se trata de un peso adicional (218 MiB en `ss_krea2.safetensors`) que se carga junto a un modelo base para modificar su comportamiento de edicion de imagen a partir de instrucciones de texto e imagen de entrada (pipeline `image-text-to-image`). El repositorio esta etiquetado para su uso en ComfyUI, RunningHub y Hugging Face.

El modelo se presenta como un ajuste fino (finetune) derivado de `krea2`, segun la propia model card. La informacion publicada no detalla la arquitectura interna del LoRA, el numero de parametros entrenables, el dataset de entrenamiento, el regimen de entrenamiento ni los hiperparametros utilizados. El tamano del repositorio (0,2 GB) es coherente con un adaptador de bajo rango, no con un modelo completo.

Su relevancia practica es limitada pero concreta: permite reutilizar una tuberia de edicion de imagen ya existente anadiendo un estilo o comportamiento especifico sin reentrenar el modelo base. La ausencia de descargas y de "likes" en el momento de redactar esta ficha, junto con la falta de licencia explicita y de documentacion tecnica, obliga a tratarlo como un artefacto experimental que debe evaluarse caso por caso antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de edicion de imagen; arquitectura del base no disponible |
| Parametros totales | no disponible (peso del adaptador: 218 MiB en un unico fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en `safetensors` sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible (no se documenta el idioma de los prompts) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`ss_krea2.safetensors`, 218 MiB) |
| Modelo base | `krea2` (finetuned from: krea2) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion tecnica publicada es que se trata de un LoRA de edicion de imagen afinado a partir de `krea2`. No se especifica el rango (rank), el valor alfa, los modulos objetivo del adaptador, el numero de pasos de entrenamiento, la tasa de aprendizaje, el tipo de precision ni si se emplearon tecnicas de regularizacion como dropout o captions etiquetados. Tampoco se describe la composicion del dataset de entrenamiento, si hubo curacion de pares imagen-instruccion-imagen resultante, ni si se aplicaron fases de refinamiento (por ejemplo, DPO o RLHF) sobre el resultado.

El fichero entregado contiene unicamente los pesos del adaptador, de modo que la arquitectura efectiva (tipo de backbone, mecanismo de atencion, encoder de texto y VAE) la determina el modelo base `krea2`, sobre el que la informacion proporcionada no aporta detalles. No se documenta ninguna innovacion tecnica adicional, como decodificacion especulativa, atencion lineal o estrategias de destilacion.

## Capacidades

- Edicion de imagen guiada por texto e imagen de entrada, segun el pipeline declarado `image-text-to-image`.
- Modificacion del comportamiento o del estilo del modelo base `krea2` mediante la carga del adaptador LoRA.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub, que ofrece tambien acceso via API.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision descriptiva, audio ni video.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico (no aplica a un modelo de imagen).
- No se documentan capacidades multilingues ni un conjunto de idiomas soportados para los prompts.

## Casos de uso

- Edicion de imagen en ComfyUI: cargar `ss_krea2.safetensors` como nodo LoRA sobre el modelo base `krea2` para aplicar el ajuste a un flujo de edicion ya existente, sin reentrenar ni duplicar el grafo.
- Pruebas de estilo controladas: comparar el resultado del adaptador frente al modelo base con el mismo prompt y la misma imagen de entrada, para determinar si el ajuste aporta una mejora medible en el caso de uso concreto.
- Prototipado rapido en RunningHub: usar la plataforma para validar el adaptador sin montar infraestructura local, aprovechando que el modelo se publica con soporte nativo alli.
- Integracion via API en pipelines por lotes: invocar el modelo a traves de la API de RunningHub para procesar colecciones de imagenes de forma automatizada, siempre que se asuma la dependencia de un servicio externo.
- Retoque asistido por instrucciones: emplear el adaptador para variaciones de una imagen de partida (por ejemplo, cambios de acabado o de material) manteniendo la composicion original, sujeto a verificacion empirica del resultado.
- Evaluacion interna de adaptadores de terceros: incluirlo como candidato en una bateria de pruebas de LoRAs de edicion, dado su tamano reducido (0,2 GB) y su carga rapida.
- Experimentacion academica con LoRAs de bajo rango: analizar que tipo de transformaciones aprende un adaptador de este tamano sobre un base de edicion de imagen, midiendo deriva respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM, LPIPS ni ninguna otra) ni comparaciones numericas con el modelo base o con adaptadores alternativos.

## Requisitos de hardware

- El adaptador ocupa 218 MiB en disco, por lo que su almacenamiento no es un factor limitante.
- La VRAM necesaria para inferencia la determina el modelo base `krea2` y la resolucion de trabajo; estos datos no estan disponibles en la informacion proporcionada.
- No se especifican GPU recomendadas ni minimas (A100, H100, RTX 4090 u otras).
- No se puede confirmar si el modelo completo cabe en GPU de consumo, ya que se desconoce el tamano del base.
- Opciones de despliegue documentadas: ComfyUI, plataforma RunningHub y la propia Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-ss1.0-lora | LoRA de edicion de imagen sobre `krea2` | no disponible (adaptador de 218 MiB) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas de la misma categoria | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores LoRA comparables ni sobre los datos tecnicos del modelo base `krea2`, por lo que no es posible establecer una comparacion fundamentada en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de licencia explicita: la model card remite a la licencia del proyecto original o del upstream, sin concretarla. Esto impide confirmar si el uso comercial esta permitido.
- Documentacion tecnica minima: no se publican detalles de entrenamiento, dataset, hiperparametros ni evaluacion, lo que dificulta reproducir o auditar el comportamiento del adaptador.
- Dependencia obligatoria del modelo base `krea2`: sin el, el fichero safetensors es inutilizable.
- Riesgo de sesgos y de resultados no deseados heredado del modelo base y del dataset de ajuste, que no se describe en ningun momento.
- Riesgo de deriva respecto al comportamiento del modelo base: no hay metricas que cuantifiquen la mejora ni el posible deterioro en otras tareas.
- Perfil de adopcion nulo en el momento de redactar la ficha (0 descargas, 0 likes), sin evidencia externa de calidad ni de estabilidad.
- Idiomas de prompt no documentados; no se puede garantizar un comportamiento consistente fuera del idioma empleado en el entrenamiento.
- Naturaleza experimental: conviene validarlo en un entorno aislado antes de incorporarlo a cualquier flujo de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-ss1.0-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2088992882006179842
- Pagina del autor: https://www.runninghub.ai/user-center/2066883782916788226
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API (en ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (en chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub (promocion): https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2088992882006179842
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-ss1.0-lora/blob/main/README_cn.md
