# RunningHubAI/rh-selena-lora

## Resumen

rh-selena-lora es un adaptador de bajo rango (LoRA) para generación y edición de imágenes guiada por texto, publicado por RunningHubAI en nombre del autor del modelo. No se trata de un modelo de lenguaje: es un fichero de pesos de 218 MiB (`selena_krea2_raw_2500.safetensors`) que se carga sobre un modelo base de difusión identificado en la model card como `krea2`, afinado mediante la técnica LoRA. Su función es incorporar un personaje concreto y reproducible a un pipeline de imagen ya existente, sin necesidad de reentrenar el modelo completo.

El adaptador se distribuye a través de Hugging Face con el pipeline declarado `image-text-to-image`, y está pensado para ejecutarse en ComfyUI, en la propia plataforma RunningHub o en cualquier entorno compatible con pesos `safetensors` de LoRA. La palabra de activación documentada es `selena`. El repositorio ocupa 0,2 GB en total y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de una publicación reciente y con poca tracción verificable.

Su relevancia práctica es la habitual de los LoRA de personaje: permiten fijar identidad, rasgos faciales y proporciones corporales consistentes entre imágenes generadas, con un coste de almacenamiento y de VRAM marginal respecto al modelo base, y con la posibilidad de combinarlos con otros adaptadores en un mismo grafo de ComfyUI. La información pública disponible es, no obstante, muy limitada: la model card no documenta dataset de entrenamiento, hiperparámetros, licencia explícita ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión `krea2`; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (fichero de pesos de 218 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se siga la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`selena_krea2_raw_2500.safetensors`) |

Otros datos declarados: tipo de modelo «LoRA (image edit)», pipeline `image-text-to-image`, plataformas soportadas ComfyUI, RunningHub y Hugging Face, palabra de activación `selena`, autor del modelo `@user_acb3cgrp` y fecha de publicación y actualización 2026-10-13.

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un LoRA de edición de imagen afinado a partir de `krea2`, con un único fichero de pesos de 218 MiB y nombre `selena_krea2_raw_2500.safetensors`. La nomenclatura del fichero sugiere un entrenamiento «raw» con 2500 pasos o muestras, pero este extremo no está confirmado en la model card y no debe tomarse como dato verificado. No se especifican rango del adaptador, dimensiones de las matrices de bajo rango, resolución de entrenamiento, optimizador, tasa de aprendizaje ni número de imágenes del dataset.

Tampoco se documenta la composición del dataset, el uso de regularización, el empleo de técnicas de ajuste por preferencias humanas (RLHF, DPO) ni ninguna innovación técnica adicional como decodificación especulativa, atención lineal o arquitecturas híbridas. La model card incluye únicamente una descripción textual muy detallada de los rasgos físicos del personaje objetivo (edad declarada, complexión, medidas corporales, color de piel y pelo, peinado, accesorios y detalles como un piercing en el tabique nasal y un choker negro), que funciona como especificación cualitativa de lo que el adaptador pretende reproducir.

No se aporta información sobre el régimen de entrenamiento (si fue entrenado en la propia plataforma RunningHub, que ofrece servicio de entrenamiento de modelos) más allá de la mención genérica a esa funcionalidad en la model card.

## Capacidades

- Generación de imágenes de un personaje concreto a partir de indicaciones de texto, activando el adaptador con la palabra clave `selena`.
- Edición de imagen guiada por texto (`image-text-to-image`), según el pipeline declarado en el repositorio y la etiqueta de tipo de modelo «LoRA (image edit)».
- Reproducción de identidad y rasgos consistentes entre generaciones, que es la finalidad propia de un LoRA de personaje.
- Combinación con otros adaptadores y con el modelo base `krea2` dentro de un grafo de ComfyUI.
- Ejecución en tres entornos declarados: ComfyUI local, plataforma RunningHub y Hugging Face.
- Invocación mediante API a través de la infraestructura de RunningHub, según los enlaces de la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión descriptiva, audio ni modo de pensamiento; no aplican a un adaptador de difusión.

## Casos de uso

- Generación de personaje consistente en ComfyUI: cargando `selena_krea2_raw_2500.safetensors` como nodo LoRA sobre `krea2` y usando `selena` en el prompt, se obtienen variaciones del mismo personaje en distintas poses y escenas sin reentrenar el modelo base.
- Ilustración narrativa y cómic: producción de viñetas sucesivas donde el personaje debe mantener rasgos faciales y proporciones entre páginas, aprovechando el bajo peso del adaptador (218 MiB) para versionarlo junto al proyecto.
- Concept art y previsualización: generación rápida de bocetos de personaje para validación de diseño antes de invertir en modelado 3D o ilustración final.
- Edición de imágenes existentes: uso del pipeline `image-text-to-image` para modificar fotografías o renders manteniendo la identidad del personaje generado.
- Prototipado para videojuegos y animación: creación de hojas de personaje y referencias de estilo para equipos de arte, con la ventaja de poder intercambiar el LoRA sin alterar el resto del pipeline.
- Producción por lotes vía API: integración del adaptador en flujos automatizados sobre RunningHub para generar conjuntos de imágenes con parámetros controlados desde un backend.
- Investigación sobre adaptación de bajo rango: caso de estudio útil para comparar el comportamiento de un LoRA de personaje frente a fine-tuning completo en términos de coste de almacenamiento y de calidad de identidad.
- Personalización de marca o mascota: sustitución del personaje ficticio por una mascota corporativa entrenando un LoRA equivalente, usando este repositorio como referencia de estructura y formato de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, similitud de identidad), comparativas con otros LoRA ni evaluaciones cuantitativas de ningún tipo.

## Requisitos de hardware

- El consumo de VRAM lo determina íntegramente el modelo base `krea2`, cuyas especificaciones no se detallan en la información disponible.
- El adaptador en sí ocupa 218 MiB en disco y su carga en memoria añade un coste marginal (habitualmente menos de 1 GB de VRAM en pipelines de difusión, aunque este dato no está confirmado para este caso).
- GPU recomendadas: no disponible para el modelo base. Como referencia general de la categoría, los pipelines de difusión de imagen suelen requerir entre 6 GB y 12 GB de VRAM en cuantizaciones de 8 bits o fp16 reducido, y entre 16 GB y 24 GB para resoluciones altas con modelos de mayor tamaño; estas cifras son orientativas y no proceden de la documentación del repositorio.
- Compatibilidad con GPU de consumo: no confirmada. Depende del modelo base y de la cuantización empleada.
- Opciones de despliegue declaradas: ComfyUI, plataforma RunningHub (incluida su API) y Hugging Face. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un adaptador de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada (ni sobre otros LoRA de personaje del mismo autor, ni sobre adaptadores entrenados sobre `krea2`). La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles.

| Modelo | Tipo | Tamaño de pesos | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-selena-lora | LoRA de imagen (image edit) | 218 MiB | krea2 | no disponible | Hugging Face, ComfyUI, RunningHub |
| krea2 sin adaptador | Modelo base de difusión | no disponible | no aplica | no disponible | no disponible en la información proporcionada |
| Otros LoRA de personaje | LoRA de imagen | no disponible | variable | variable | no disponible en la información proporcionada |

## Limitaciones y advertencias

- No hay licencia declarada de forma explícita. La model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o del modelo upstream, por lo que el uso comercial queda sin definir y debe consultarse con el autor antes de cualquier explotación.
- El modelo base `krea2` no está documentado en la información disponible, de modo que se desconoce su licencia, sus restricciones de uso y sus propios sesgos, que el LoRA hereda.
- Riesgo de sobreajuste al personaje y de degradación del resto de la escena cuando el adaptador se aplica con pesos altos; es un comportamiento típico de los LoRA de personaje, no una característica documentada en este repositorio.
- No hay información sobre sesgos demográficos, de género o étnicos en el dataset de entrenamiento, ni sobre diversidad de las imágenes usadas.
- La model card describe el personaje con atributos físicos muy detallados, incluida la edad declarada (20 años) y medidas corporales. Es responsabilidad del usuario verificar que los contenidos generados cumplen la normativa aplicable y las políticas de contenido de la plataforma de destino.
- Riesgo de generación de imágenes que reproduzcan la apariencia de personas reales si se combina el adaptador con prompts orientados a ello; no se documentan filtros de seguridad asociados al repositorio.
- 0 descargas y 0 likes en el momento de la consulta: no existe validación comunitaria ni evidencia pública de funcionamiento en producción.
- El repositorio no incluye ejemplos de uso, ficheros de configuración de ComfyUI ni workflows, más allá del enlace al proyecto original en RunningHub.
- Al no ser un modelo de lenguaje, no dispone de ventana de contexto, soporte multilingüe declarado ni capacidades de razonamiento, tool calling o agentes; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-selena-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2109474924611350530
- Página del autor: https://www.runninghub.ai/user-center/2109388971091451906
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API: https://www.runninghub.ai/call-api
- README en chino: https://huggingface.co/RunningHubAI/rh-selena-lora/blob/main/README_cn.md
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejecución de Seedance 2.5 vía API: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
