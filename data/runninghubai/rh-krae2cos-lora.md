# RunningHubAI/rh-krae2cos-lora

## Resumen

`rh-krae2cos-lora` es un adaptador LoRA de edición y generación de imagen condicionada por texto, publicado por RunningHubAI (plataforma RunningHub) a partir de un modelo base identificado por el autor como `krea2`. No se trata de un modelo de lenguaje: el repositorio contiene únicamente un fichero de pesos `遐蝶.safetensors` de 218 MiB, etiquetado en HuggingFace con el pipeline `image-text-to-image` y los tags `comfyui` y `lora`. Su función es fijar la identidad visual de un personaje concreto —descripción en la model card: «XD_cos, 1girl», pelo lavanda pálido y plateado, orejas de elfo puntiagudas, corona floral, motivos de mariposa, vestido de capas blanco y morado, medias blancas hasta el muslo, botas altas con cordones y una guadaña morada con hoja creciente brillante— sobre el modelo base.

El interés práctico del artefacto es acotado y muy específico: permite reproducir de forma consistente un personaje y su vestuario en un pipeline de difusión, en lugar de depender de prompts largos y frágiles. Está pensado para cargarse en ComfyUI o en la propia plataforma RunningHub, y su repositorio incluye enlaces a la página del modelo original, a la ficha del autor y a la documentación de la API de RunningHub.

La información publicada es muy escasa: no se documentan arquitectura del modelo base, número de parámetros del adaptador, rango del LoRA, dataset de entrenamiento, licencia explícita ni resultados de evaluación. Cualquier uso en producción exige verificar por cuenta propia la licencia del modelo base y del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (edición de imagen) sobre el modelo base `krea2`; no se documentan rango, capas objetivo ni arquitectura del base |
| Parametros totales | No disponible (el unico artefacto es un fichero `safetensors` de 218 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de difusion imagen-texto; no se publica ventana de contexto textual) |
| Tipos de cuantizacion | No disponible; se distribuye en `safetensors` y no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible; los prompts de ejemplo de la model card estan en ingles |
| Licencia | No disponible; el autor indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | `safetensors` (`遐蝶.safetensors`, 218 MiB) |
| Tamano del repositorio | 0,2 GB |
| Tipo de modelo (tag) | LoRA, `image-text-to-image` |
| Entorno de uso declarado | ComfyUI / RunningHub / Hugging Face |
| Fecha de publicacion (metadatos) | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

El autor declara únicamente «Finetuned from: krea2», sin detallar el proceso. Por el tamaño (un único fichero de 218 MiB) y el tag `lora`, se trata de un adaptador de bajo rango que se inyecta sobre las capas del modelo base de difusión; si los pesos estuvieran almacenados en 16 bits —extremo que el repositorio no confirma—, el adaptador rondaría el orden de 1,1 × 10^8 parámetros, una estimación derivada del tamaño del fichero y no un dato publicado. No se especifican rango del LoRA, módulos objetivo (atención, proyecciones, bloques de up/down-sampling), resolución de entrenamiento, número de pasos, optimizador ni si se emplearon captions automáticos o etiquetado manual.

Tampoco hay información sobre el dataset: la model card solo reproduce el prompt descriptivo del personaje, lo que sugiere un entrenamiento orientado a una identidad y un vestuario concretos (atuendo de capas blanco y morado, accesorios florales y de mariposa, guadaña morada). No se documentan técnicas adicionales como regularización por clase, LoRA de texto, uso de IP-Adapter, muestreo de decodificación especulativa ni refinamiento por preferencias. Cualquier afirmación sobre el pipeline de entrenamiento más allá de lo citado sería especulativa.

## Capacidades

- Generación de imagen condicionada por texto con una identidad de personaje concreta y consistente entre generaciones.
- Edición de imagen de entrada más texto (`image-text-to-image`): aplicación del personaje sobre una imagen de referencia.
- Reproducción de un vestuario definido: vestido de capas con volantes blanco y morado, motivos de mariposa, bordados florales, cinta morada, encaje, guantes negro y morado, gargantilla, ligas con detalle de rombo, medias blancas altas con patrón de rombos y botas altas de tacón con cordones.
- Reproducción de accesorios característicos: corona floral, tocado de espinas, adornos de mariposa en el pelo, orejas de elfo puntiagudas y guadaña morada con hoja creciente luminosa.
- Control de encuadre y vestuario mediante prompt en inglés, a partir de las etiquetas descriptivas que acompañan al adaptador.
- Integración en flujos ComfyUI mediante el nodo de carga de LoRA y apilado con el modelo base.
- Ejecución en la plataforma RunningHub y acceso mediante su API (según los enlaces de la model card).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo «thinking»: no aplica a este tipo de artefacto.

## Casos de uso

- Ilustración de personaje consistente en serie: cargar el LoRA junto al base `krea2` en ComfyUI para producir varias ilustraciones del mismo personaje manteniendo pelo, orejas, corona y paleta lavanda-plata entre imágenes, algo que un prompt largo no garantiza de forma estable.
- Diseño de variantes de vestuario: usar el adaptador como ancla de identidad y modificar en el prompt el atuendo (por ejemplo, sustituir el vestido de capas por ropa contemporánea) para explorar líneas de merchandising sin perder el rostro ni los rasgos del personaje.
- Producción de assets para novela visual o juego indie: generación por lotes de expresiones y poses del personaje con fondo neutro, integrables después en un motor 2D; el tamaño reducido del adaptador (218 MiB) facilita versionarlo junto al proyecto.
- Edición imagen-texto sobre bocetos o fotografías de referencia: emplear el pipeline `image-text-to-image` para trasladar el diseño del personaje a una pose o composición dadas, útil en preproducción de cómic.
- Fan art y contenido para comunidad: generación de ilustraciones del personaje con la guadaña y el atuendo completos, reduciendo el coste de iteración frente a describir cada accesorio en el prompt.
- Automatización vía API de RunningHub: publicar un endpoint que reciba el prompt y devuelva la imagen, integrado en una web de generación o en un bot, apoyándose en la documentación de API enlazada por el autor.
- Prototipado rápido de campañas: generar un abanico de composiciones del personaje para elegir dirección visual antes de encargar la ilustración final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas (FID, CLIP score, similitud de identidad), comparaciones con otros adaptadores ni evaluaciones cualitativas más allá de la descripción textual del personaje.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El consumo lo determina íntegramente el modelo base `krea2`, cuyas especificaciones no se recogen en la información proporcionada; el adaptador añade una carga marginal del orden de los 218 MiB del fichero.
- GPU recomendadas: no disponible para este adaptador; depende del modelo base. No se publican requisitos mínimos ni configuraciones validadas.
- Compatibilidad con GPU de consumo: no confirmada. El adaptador en sí es pequeño, pero viabilidad y velocidad dependen del base y de la resolución de generación, datos no publicados.
- Opciones de despliegue: ComfyUI (carga de LoRA sobre el modelo base), plataforma RunningHub (modelo original publicado allí) y Hugging Face como repositorio de pesos. La carga mediante `diffusers`/PEFT es habitual en adaptadores `safetensors`, pero no está verificada para este fichero en la información disponible.
- Latencia y throughput: no disponibles. No se aportan tiempos por imagen, pasos de muestreo ni resolución de referencia.

## Comparativa con modelos similares

No se han identificado en la información proporcionada adaptadores directamente comparables (mismo personaje, mismo base `krea2` o mismo pipeline) con datos verificables. La comparación queda limitada a características estructurales:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-krae2cos-lora` | No disponible (fichero de 218 MiB) | No aplica | Sin benchmarks publicados | No disponible (remite al upstream) | Hugging Face y RunningHub; 0 descargas, 0 likes en el momento de la ficha |
| Otras LoRA de personaje para modelos de difusión | No disponible | No aplica | No disponible | Habitualmente definida por el autor o por el modelo base | No disponible en la información proporcionada |
| Adaptadores de estilo (no de identidad) | No disponible | No aplica | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Información muy incompleta: no se documentan arquitectura del base, rango del LoRA, dataset, pasos de entrenamiento ni evaluación; la reproducibilidad es nula con los datos publicados.
- Licencia no declarada de forma explícita. La model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del modelo upstream; antes de cualquier uso comercial hay que verificar la licencia de `krea2` y contactar con el autor.
- Riesgo de sobreajuste al prompt de referencia: el adaptador está entrenado para un vestuario y unos accesorios muy concretos, por lo que tenderá a reproducirlos incluso cuando el prompt pida otros; separar identidad y atuendo exigirá experimentación con pesos del LoRA.
- Sesgos: no documentados. Al ser un adaptador de personaje, puede arrastrar los sesgos de representación y estética del dataset de entrenamiento y del modelo base, no publicados.
- Alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, orejas de elfo, cordones de las botas), fusiones incorrectas de la guadaña con el cuerpo o texto ilegible en los bordados.
- Idioma: los prompts de ejemplo están en inglés; no se garantiza el comportamiento con prompts en castellano ni con otras lenguas.
- Dependencia crítica del modelo base: sin acceso a `krea2` en la versión exacta usada en el entrenamiento, la fidelidad del personaje puede degradarse; no se indica la versión concreta del base.
- Repositorio sin tracción (0 descargas, 0 likes) y con fecha de publicación en los metadatos posterior a la actual: no hay evidencia de uso en producción ni de mantenimiento.
- Advertencia de procedencia: el personaje y su diseño pueden estar sujetos a derechos de terceros; la generation de contenido derivado debe evaluarse legalmente según la jurisdicción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krae2cos-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2095497777613963266
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2085048586185814018
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-krae2cos-lora/blob/main/README_cn.md
- Ejemplo de llamada a API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
