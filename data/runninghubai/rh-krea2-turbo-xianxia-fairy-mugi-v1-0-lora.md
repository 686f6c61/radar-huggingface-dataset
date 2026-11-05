# RunningHubAI/rh-krea2-turbo-xianxia-fairy-mugi-v1.0-lora

## Resumen

`rh-krea2-turbo-xianxia-fairy-mugi-v1.0-lora` es un adaptador LoRA de edicion de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en nombre de un usuario de su plataforma, identificado como `@XAlter`. No se trata de un modelo fundacional autonomo, sino de un conjunto de pesos de bajo rango (224 MiB en un unico fichero `safetensors`) que se aplica sobre el modelo base `krea2` para inducir un estilo visual concreto de fantasia xianxia (仙侠), un genero chino de literatura y cine de artes marciales mitologicas.

El adaptador se distribuye principalmente para su uso dentro de ComfyUI y de la propia plataforma RunningHub, que ofrece inferencia alojada y una API. La model card lo describe literalmente como un modelo "compartido por un miembro del grupo para uso personal", lo que sitúa su proposito en la experimentacion estilistica y no en un caso de produccion general. Incluye una palabra de activacion, `XianXia_Fairy`, con peso recomendado 1.

La relevancia de esta ficha es acotada: no hay informacion publica sobre arquitectura del modelo base, datos de entrenamiento, licencia efectiva ni evaluaciones. Todos los campos que dependen de esos datos se marcan como no disponibles. El interes practico esta en saber como integrarlo en un flujo ComfyUI y que limitaciones asumir antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (el fichero de pesos ocupa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en `safetensors` (precision del adaptador no documentada) |
| Idiomas soportados | no disponible (los prompts se procesan con el codificador de texto del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | `safetensors` (fichero `Krea2-仙侠Turbo_XianXia_Fairy_Mugi_v1.0_c1-st10000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea2` para modificar su comportamiento generativo sin reentrenar los pesos completos. El nombre del fichero incluye el sufijo `c1-st10000`, que sugiere un paso de entrenamiento de 10 000 iteraciones, aunque el autor no documenta ni el optimizador, ni el learning rate, ni el rango del adaptador, ni el tamano del dataset. No se especifica si el entrenamiento se hizo con pares imagen-texto, con edicion guiada por imagen o con ambas modalidades, pese a que el pipeline declarado es `image-text-to-image`.

No hay informacion sobre la arquitectura interna del modelo base `krea2` (tipo de difusion, variante de transformer, VAE asociado, codificador de texto) ni sobre el volumen o la composicion de los datos de entrenamiento. Tampoco se documenta el uso de tecnicas como regularizacion por dropout, entrenamiento con captions automaticos o aumento de datos. La unica innovacion declarada es el propio estilo aprendido, activado mediante la palabra clave `XianXia_Fairy` con peso 1.

## Capacidades

- Generacion de imagenes de fantasia xianxia a partir de texto, aplicando el estilo aprendido sobre el modelo base `krea2`.
- Edicion de imagen existente en flujos `image-text-to-image`, segun el pipeline declarado en el repositorio.
- Activacion estilistica mediante la palabra clave `XianXia_Fairy` (peso recomendado 1).
- Integracion nativa en ComfyUI como nodo LoRA.
- Ejecucion en la plataforma RunningHub, tanto en su interfaz como a traves de su API.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision analitica, audio ni modo de pensamiento; son capacidades ajenas al tipo de modelo.

## Casos de uso

- Ilustracion de portadas para ficcion xianxia: aplicar el LoRA sobre `krea2` en ComfyUI con la palabra `XianXia_Fairy` para generar cubiertas de novelas web o relatos de artes marciales mitologicas con coherencia estilistica entre volumenes.
- Concept art para videojuegos de tematica wuxia/xianxia: iterar variaciones de personajes y escenarios usando el adaptador como capa de estilo sobre un pipeline de edicion de imagen, manteniendo una direccion visual comun en todo el equipo.
- Prototipado rapido de assets para tableros de humor y presentaciones: generar un lote de imagenes estilizadas en RunningHub sin montar infraestructura propia, apropiado por el bajo coste de un adaptador de 224 MiB.
- Exploracion de estilos en investigacion creativa: comparar el efecto del LoRA con peso 0,5 frente a 1,0 para estudiar como un adaptador de bajo rango desplaza la distribucion estilistica del modelo base.
- Personalizacion de contenido para comunidades de rol y fan art: producir ilustraciones de personajes con una estetica consistente, usando la API de RunningHub para integrar la generacion en un bot o formulario web.
- Pruebas de flujo en ComfyUI antes de invertir en entrenamiento propio: usar este LoRA como referencia de calidad y de formato de publicacion para disenar un adaptador equivalente con un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible para el adaptador de forma aislada; el consumo lo determina el modelo base `krea2`, cuyos requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponible. Al ser un LoRA de 224 MiB, el adaptador en si ocupa una fraccion minima de VRAM y el limite real lo impone el modelo base.
- GPU de consumo: no se puede confirmar que quepa en tarjetas consumer (RTX 3060, 4060, 4090) sin conocer los requisitos de `krea2`.
- Despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (interfaz y API). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que son entornos de texto y no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-turbo-xianxia-fairy-mugi-v1.0-lora | LoRA sobre `krea2` | no disponible (224 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores LoRA de estilo xianxia para `krea2` ni sobre sus metricas, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican datos de entrenamiento, rango del LoRA, hiperparametros ni evaluacion cualitativa.
- Licencia no disponible: la model card solo indica que se sigue la licencia del proyecto original o del modelo upstream. Antes de un uso comercial es imprescindible verificar la licencia de `krea2` y del propio adaptador con el autor.
- El modelo se describe como "compartido por un miembro del grupo para uso personal", lo que sugiere que no ha pasado por un proceso de validacion o curaduria de RunningHub.
- Riesgo de sobreajuste al estilo: con 10 000 pasos declarados en el nombre del fichero y sin datos sobre el dataset, es probable que el adaptador reproduzca motivos y composiciones muy concretas del conjunto de entrenamiento.
- Dependencia estricta del modelo base `krea2`: no funciona de forma autonoma y su comportamiento puede degradarse si se aplica sobre otras versiones del base.
- Idioma de los prompts no documentado: no se especifica que codificador de texto usa `krea2` ni como responde a prompts en castellano; conviene probar con prompts en ingles o chino.
- Sin garantias de soporte: el repositorio no incluye issues, discusion ni mantenimiento declarado, y las descargas y likes registrados son cero en el momento de la consulta.
- Sesgos: no documentados, pero al ser un modelo de imagen entrenado sobre un estilo cultural concreto puede reproducir estereotipos visuales del genero xianxia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-xianxia-fairy-mugi-v1.0-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-turbo-xianxia-fairy-mugi-v1.0-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2101617107598340097
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2088145008864477186
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
