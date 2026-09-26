# RunningHubAI/rh-5-lora

## Resumen

rh-5-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI, la cuenta oficial de la plataforma RunningHub en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un peso adicional de bajo rango que se carga sobre un modelo base de difusión que el autor identifica como «krea2». Su función concreta es la de un LoRA de personaje: incorpora un rostro y una estética concretos, activados mediante palabras clave en chino, y está pensado para el pipeline de image-text-to-image dentro de ComfyUI o de la propia plataforma RunningHub.

El repositorio es mínimo: 0,2 GB de tamaño total y un único archivo `xiaolen_c1-st5000.safetensors` de 224 MiB, que corresponde a los pesos del adaptador. La model card es una plantilla de plataforma sin apenas información técnica: no se documentan datos de entrenamiento, composición del dataset, número de pasos, hiperparámetros ni resultados de evaluación. La descripción del propio autor se limita a dos caracteres chinos, «自用» (uso personal).

Su relevancia es por tanto acotada y muy específica: sirve como ejemplo de cómo las plataformas de generación de imágenes distribuyen adaptadores de estilo o personaje listos para consumir, y como pieza reutilizable para quien trabaje con el modelo base krea2 en flujos de ComfyUI. No aporta avances de arquitectura ni métricas publicadas, y la ausencia de licencia explícita obliga a revisar la licencia del modelo de origen antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre un modelo base de difusión que el autor identifica como «krea2»; el detalle de la arquitectura base no está disponible |
| Parametros totales | no disponible (el archivo de pesos del adaptador ocupa 224 MiB; el número de parámetros no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las trigger words documentadas están en chino |
| Licencia | no disponible; la model card indica únicamente que se siga la licencia del proyecto original o de origen |
| Formato de pesos | safetensors (`xiaolen_c1-st5000.safetensors`) |

## Arquitectura y entrenamiento

La única información aportada es que se trata de un LoRA de edición de imagen afinado a partir de «krea2» y que el archivo de pesos se llama `xiaolen_c1-st5000.safetensors`, nomenclatura que sugiere un checkpoint correspondiente al paso 5000 de un entrenamiento. No se publica ningún otro dato: ni el número de pasos totales, ni el conjunto de datos utilizado, ni el rango y alpha del adaptador, ni la resolución de entrenamiento, ni si hubo etapas de ajuste por preferencias humanas.

Tampoco se documentan innovaciones técnicas. El adaptador se limita a especializar el modelo base en una estética facial y de maquillaje concreta, descrita por las palabras clave «一个极美的中国女生，网红脸，精致妆容» (una chica china extremadamente hermosa, rostro de influencer, maquillaje delicado). Cualquier afirmación adicional sobre la arquitectura interna, el régimen de entrenamiento o las técnicas de regularización empleadas sería especulativa y no está respaldada por la información disponible.

## Capacidades

- Edición de imágenes guiada por texto, según el pipeline declarado `image-text-to-image`.
- Generación de retratos y variaciones de rostro alineados con la estética del LoRA, activables mediante las trigger words documentadas en chino.
- Integración con ComfyUI, plataforma para la que está etiquetado el repositorio, y con la infraestructura de RunningHub.
- Combinación potencial con otros adaptadores LoRA del mismo modelo base, siempre que la compatibilidad de pesos lo permita (no verificada en la información disponible).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; las palabras clave proporcionadas están en chino.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Creación de retratos consistentes de personaje: el LoRA fija un rostro y una estética concretos, de modo que se pueden generar múltiples imágenes del mismo personaje variando pose, iluminación o encuadre sin perder la identidad visual, algo útil para series ilustradas o narrativa visual.
- Contenido para marcas de belleza y cosmética: la estética entrenada (rostro de influencer con maquillaje elaborado) encaja en la producción de material promocional y de redes sociales, siempre que la licencia lo permita.
- Edición de imagen existente dentro de ComfyUI: al ser un LoRA de edición, se puede insertar en un flujo de trabajo con nodos de ComfyUI para retocar o transformar fotografías manteniendo el estilo aprendido.
- Generación de personajes virtuales o avatares: permite construir un personaje sintético recurrente para vídeo, cómic o contenido interactivo, reutilizando el mismo adaptador en cada iteración.
- Storyboard y previsualización de proyectos audiovisuales: para equipos que necesiten bocetos de casting o de personaje con una dirección de arte definida antes de rodar o producir.
- Prototipado rápido vía API de RunningHub: la plataforma ofrece llamadas HTTP a sus flujos, lo que permite automatizar la generación por lotes o integrarla en un pipeline de producto sin gestionar GPU propia.
- Pruebas comparativas de adaptadores de personaje: sirve como referencia técnica para estudiar cómo se comporta un LoRA de bajo coste en disco (224 MiB) sobre un modelo base de difusión, útil en investigación sobre personalización eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA, el requisito de memoria lo determina casi por completo el modelo base krea2, no el propio archivo; los 224 MiB del adaptador son marginales frente al peso del modelo base.
- GPU recomendadas: no disponibles. La idoneidad de una GPU concreta (A100, H100, RTX 4090, etc.) depende del modelo base y de la resolución de generación, datos que no se publican.
- Compatibilidad con GPU de consumo: no verificable con la información disponible; dependerá del modelo base y de las técnicas de offload aplicadas.
- Opciones de despliegue: ComfyUI (plataforma declarada por el autor), RunningHub (nube propia del editor) y, de forma genérica, cualquier runtime que admita LoRA sobre el modelo base correspondiente. No se confirma compatibilidad con llama.cpp, Ollama, vLLM ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La comparación exigiría identificar otros adaptadores LoRA entrenados sobre el mismo modelo base krea2 y con una función equivalente (personalización de rostro o estilo), y no se ha proporcionado información sobre alternativas, métricas ni licencias comparables.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador se ha especializado en un ideal de belleza muy concreto (rostro de influencer, maquillaje elaborado), lo que puede reproducir y amplificar sesgos estéticos y de representación fenotípica, además de homogeneizar los resultados hacia ese canon.
- Riesgo de alucinación y artefactos: inherente a los modelos de difusión de imagen, especialmente en manos, texto dentro de la imagen y anatomía; no se han publicado evaluaciones específicas para este LoRA.
- Limitaciones de idioma: las únicas trigger words documentadas están en chino, por lo que el control fino del resultado puede requerir prompts en ese idioma o pruebas empíricas con otros idiomas.
- Restricciones de licencia: no hay licencia declarada. La model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o de origen, lo que deja el uso comercial en una zona legal ambigua y obliga a verificar la licencia de krea2 antes de cualquier explotación.
- Declaración de uso personal: el autor describe el modelo con la etiqueta «自用» (para uso propio), lo que refuerza la cautela respecto a su reutilización pública o comercial.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 likes, sin discusión ni ejemplos publicados, de modo que no existe evidencia externa de calidad, estabilidad o reproducibilidad.
- Falta total de documentación técnica: sin datos de entrenamiento, hiperparámetros ni evaluación, es imposible estimar el coste real de integración en producción ni garantizar resultados consistentes.
- Dependencia del modelo base: el adaptador carece de utilidad por sí solo y queda sujeto a los cambios, la disponibilidad y las condiciones de uso del modelo krea2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-5-lora
- README en chino: README_cn.md (dentro del repositorio)
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2079796493478227969
- Página del autor: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
