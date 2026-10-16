# RunningHubAI/rh-krea2-skin-texture-mj-lora

## Resumen

rh-krea2-skin-texture-mj-lora es un adaptador LoRA (Low-Rank Adaptation) para edicion y generacion de imagenes, publicado por RunningHubAI y afinado a partir del modelo base krea2. Su proposito declarado es aplicar y controlar texturas de piel en retratos y primeros planos, con un acabado estetico orientado al estilo "mj" (presumiblemente Midjourney), segun se desprende del propio nombre del repositorio. El adaptador se distribuye como un unico archivo de pesos de 224 MiB (~0,2 GB), lo que lo convierte en un complemento ligero que debe cargarse junto al modelo base.

El modelo esta disenado para integrarse en flujos de trabajo de ComfyUI, RunningHub y Hugging Face, y su pipeline declarado es image-text-to-image, es decir, edicion o generacion condicionada por texto e imagen de entrada. La ficha de HuggingFace registra cero descargas y cero "likes" en el momento de la consulta, por lo que se trata de un artefacto reciente y sin adopcion publica documentada.

No se han publicado detalles tecnicos sobre la arquitectura del modelo base krea2, el numero de parametros del adaptador, la composicion del dataset de entrenamiento ni el procedimiento de ajuste. Toda la informacion disponible procede de la model card del autor y de los metadatos del repositorio, por lo que muchos apartados de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; el peso se distribuye en safetensors sin especificar precision |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "seguir la licencia del proyecto original o upstream") |
| Formato de pesos | safetensors (`FDHER_DF.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, una tecnica de ajuste eficiente por la que se anaden matrices de bajo rango a las capas de un modelo base congelado, en lugar de reentrenar todos sus pesos. El modelo base declarado es krea2, sobre el que este LoRA inyecta los pesos necesarios para modificar y reforzar la apariencia de la piel (brillo, humedad, texturas y tonos) en retratos y primeros planos. No se especifica en que capas del modelo base se aplica el adaptador ni el rango utilizado.

No hay informacion disponible sobre el dataset de entrenamiento, el numero de imagenes, el numero de pasos, la tasa de aprendizaje, el uso de tecnicas como DreamBooth o ajuste con pares de imagenes, ni sobre la existencia de etapas de RLHF, DPO u otros procedimientos de alineacion (que, por otra parte, no son habituales en adaptadores de imagen). La model card incluye una descripcion textual densa a modo de prompt de ejemplo, pero no debe interpretarse como una especificacion del dataset.

## Capacidades

- Edicion y generacion de imagenes condicionada por texto e imagen (pipeline image-text-to-image).
- Aplicacion y refuerzo de texturas de piel en retratos y primeros planos.
- Integracion en flujos de trabajo de ComfyUI, RunningHub y Hugging Face.
- Combinacion con el modelo base krea2 mediante carga de adaptadores LoRA.
- No aplica soporte de tool calling, function calling ni agentes (es un modelo de imagen, no un modelo de lenguaje).
- Capacidades multilingues, de razonamiento, codigo, matematicas, vision general, audio o modo de pensamiento: no disponibles o no aplicables a este tipo de artefacto.

## Casos de uso

- Retoque de retratos: aplicar el adaptador sobre el modelo base para homogeneizar y embellecer la textura de la piel en fotografias de primer plano, reduciendo irregularidades y anadiendo un acabado humedo o luminoso.
- Creacion de personajes consistentes: generar o editar retratos de un mismo personaje manteniendo un aspecto de piel coherente entre distintas imagenes dentro de una serie.
- Ilustracion de fantasia y ciencia ficcion: producir retratos con piel iridiscente, efectos de luz y materiales translucidos, como sugiere la descripcion de ejemplo de la model card.
- Contenido para redes y marketing: preparar imagenes de belleza, cosmeticos o moda con un acabado estetico concreto y repetible mediante prompts.
- Postproduccion en pipelines de imagen: incorporar el LoRA como paso adicional en un flujo de ComfyUI para normalizar la piel de imagenes generadas o editadas previamente.
- Prototipado de conceptos visuales: explorar variaciones de textura y luz en un mismo encuadre antes de producir la imagen final.
- Integracion via API: desplegar el flujo en RunningHub y llamarlo programaticamente mediante su API para generar imagenes bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM ni comparativas cuantitativas) ni evaluaciones humanas.

## Requisitos de hardware

- El adaptador pesa 224 MiB, pero requiere el modelo base krea2 para funcionar; la VRAM total dependera del modelo base, cuyo consumo no se especifica ("no disponible").
- Al ser un LoRA de bajo rango, el coste adicional de memoria respecto al modelo base es minimo (del orden de los 224 MiB del archivo).
- Cabe en GPUs de consumo, ya que los adaptadores LoRA para generacion de imagen se ejecutan habitualmente en tarjetas como la RTX 3060, 4070, 4080 o 4090, siempre que el modelo base quepa en memoria. No se dispone de cifras concretas verificadas para este caso.
- Opciones de despliegue documentadas: ComfyUI, RunningHub (plataforma en la nube) y Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables equivalente en la informacion proporcionada. Cualquier comparacion con otros adaptadores LoRA de textura de piel o con adaptadores para modelos de difusion de imagen requeriria datos de rendimiento y licencia que no se han facilitado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-skin-texture-mj-lora | no disponible | no aplica | no disponible | no disponible | HuggingFace, ComfyUI, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a "la licencia del proyecto original o upstream", por lo que no se puede confirmar el uso comercial sin verificar la licencia del modelo base krea2.
- Ausencia de benchmarks y de evaluacion publica: no hay metricas objetivas ni validacion independiente del rendimiento del adaptador.
- Adopcion nula documentada: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de retroalimentacion de la comunidad.
- Dependencia del modelo base: el adaptador no es autonomo; su comportamiento depende por completo de krea2, que no se detalla.
- Riesgo de sesgo estetico: el enfoque en un unico tipo de piel (clara, brillante, con rubor) puede producir resultados poco diversos en cuanto a tonos y texturas segun el prompt.
- Riesgo de alucinacion no aplicable en el sentido textual, pero si existe riesgo de artefactos visuales, deformaciones o texturas irreales en zonas complejas (manos, cabello, reflejos).
- Fecha de creacion indicada como 2026-10-15, lo que puede responder a un error de metadatos y dificulta situar cronologicamente el modelo.
- No se especifica la precision de los pesos ni la compatibilidad exacta con versiones concretas del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-krea2-skin-texture-mj-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2100904326633218049
- Pagina del autor: https://www.runninghub.ai/user-center/1980864188878884866
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Llamada a la API: https://www.runninghub.ai/call-api
