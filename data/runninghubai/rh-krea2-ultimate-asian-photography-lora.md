# RunningHubAI/rh-krea2-ultimate-asian-photography-lora

## Resumen

rh-krea2-ultimate-asian-photography-lora es un adaptador LoRA para generación y edición de imágenes, publicado por la plataforma RunningHub (autor identificado como @GOODLUCK2024) y afinado a partir del modelo base krea2. El repositorio de HuggingFace contiene un único fichero de pesos safetensors de 224 MiB, y la model card lo describe como una LoRA de tipo "image edit" orientada a fotografía asiática fotorrealista, con prompts de ejemplo en inglés que describen retratos de estudio con iluminación suave y fondo minimalista.

El modelo se distribuye principalmente para su uso en ComfyUI, además de las plataformas propias de RunningHub y HuggingFace. No se documentan en la información disponible ni el número de parámetros del adaptador, ni la arquitectura exacta del modelo base krea2, ni la longitud de contexto del codificador de texto asociado, ni los idiomas soportados, ni los datos de entrenamiento empleados.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no declara licencia concreta y no aporta benchmarks ni evaluación alguna. Es, por tanto, un adaptador de estilo para un caso de uso muy específico, sin garantías de calidad ni de condiciones de uso comercial documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el fichero de pesos `KREA2摄影.safetensors` ocupa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (condicionamiento mediante prompt de texto; el límite depende del codificador de texto del modelo base, no documentado) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente en safetensors; no se indican variantes GGUF, fp8 ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible (los ejemplos de la model card están en inglés; no se verifica soporte de castellano) |
| Licencia | no disponible (la model card indica que el copyright es del autor y remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (un único fichero) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo base preentrenado para modificar su comportamiento sin reentrenarlo por completo. El modelo base declarado es krea2, del cual no se detalla en la información disponible ni la arquitectura (se desconoce si es un transformer de difusión, un modelo híbrido o de otro tipo), ni el número de parámetros, ni el tamaño del dataset de preentrenamiento.

No hay información sobre el procedimiento de entrenamiento del adaptador: se desconoce el número de imágenes de entrenamiento, su composición, la resolución, el rango y el alpha de la LoRA, la tasa de aprendizaje, si hubo regularización, si se emplearon técnicas de preferencia (DPO, RLHF) o si se usaron captions automáticos. Tampoco se documentan innovaciones técnicas asociadas (decodificación especulativa, atención lineal, destilación por pasos, etc.). La model card se limita a indicar la finalidad estética del adaptador y a enlazar a una publicación de RunningHub y a una página del modelo original en esa plataforma.

## Capacidades

- Generación de imágenes fotorrealistas condicionadas por texto, en el pipeline `image-text-to-image`.
- Edición de imagen: la propia model card clasifica el artefacto como "LoRA (image edit)", por lo que está pensado para modificar imágenes de entrada además de generarlas.
- Aplicación de un estilo fotográfico concreto (retrato, iluminación suave, estética minimalista) sobre el modelo base krea2.
- Integración nativa con ComfyUI mediante carga del fichero safetensors como nodo LoRA.
- Inferencia en la plataforma alojada RunningHub, tanto en su sitio internacional como en el chino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni flujos multimodales de audio o vídeo: no aplica a un adaptador de generación de imagen.
- Capacidades multilingües: no disponibles; los únicos ejemplos de prompt están redactados en inglés.

## Casos de uso

- Retrato de estudio sintético: generar fotografías de personas con iluminación suave y fondo neutro para maquetas de producto, presentaciones o material de marca, activando la LoRA sobre krea2 en ComfyUI.
- Previsualización de dirección de arte: producir referencias visuales rápidas antes de una sesión fotográfica real, de modo que el equipo pueda acordar encuadre, luz y paleta sin coste de producción.
- Generación de material para catálogos y e-commerce: crear imágenes de figura humana con estética fotográfica consistente para probar variaciones de vestuario o composición, siempre que la licencia del modelo base lo permita.
- Edición de imágenes existentes: retocar o reestilizar fotografías ya capturadas aplicando el aspecto del adaptador, útil en flujos de retoque donde se busca homogeneidad estética entre tomas.
- Prototipado de pipelines en ComfyUI: servir como nodo de prueba para validar grafos de generación con LoRA antes de invertir en adaptadores entrenados a medida.
- Investigación sobre adaptadores de bajo rango: usar el fichero como ejemplo de LoRA de 224 MiB para estudiar el efecto de adaptadores pequeños en un modelo de difusión grande.
- Pruebas comparativas de estilo: evaluar de forma cualitativa cuánto cambia la salida del modelo base al activar y desactivar el adaptador con el mismo prompt y la misma semilla.

En todos los casos conviene verificar previamente la licencia del modelo base krea2, dado que este repositorio no declara una licencia propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas objetivas (FID, CLIP score, ImageReward ni evaluaciones humanas), no aporta comparaciones cuantitativas con otras LoRA de estilo y registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros a las que remitirse. La única evidencia cualitativa es el prompt de ejemplo incluido en la model card, que describe un retrato fotorrealista de una mujer joven con cabello negro largo, fondo claro y estética minimalista.

## Requisitos de hardware

- VRAM para el adaptador: el propio fichero LoRA ocupa 224 MiB, un coste marginal irrelevante frente al modelo base.
- VRAM total de inferencia: no disponible en la información proporcionada; queda determinada íntegramente por el modelo base krea2, cuyos requisitos no se documentan en este repositorio.
- GPU recomendadas: no disponible para este adaptador en concreto. Como referencia general del ecosistema de difusión de imagen (no confirmada para krea2), los modelos de este tipo suelen requerir GPUs con 16-24 GB de VRAM en precisión completa y pueden ejecutarse en GPUs de consumo de gama alta (RTX 4090, 4080) con precisiones reducidas o cuantizaciones del modelo base.
- ¿Cabe en GPU de consumo? No hay dato específico. Depende del modelo base, no del adaptador.
- Opciones de despliegue: ComfyUI (soporte nativo indicado en los tags), plataforma alojada RunningHub y, presumiblemente, cualquier runtime que cargue safetensors compatibles con el modelo base. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-ultimate-asian-photography-lora | LoRA de imagen sobre krea2 | no disponible (pesos de 224 MiB) | no aplica | no disponible | HuggingFace, ComfyUI, RunningHub |
| krea2 (modelo base) | no disponible | no disponible | no disponible | no disponible | no documentado en este repositorio |
| Otras LoRA de estilo fotográfico del ecosistema de difusión | LoRA de imagen | no disponible | no aplica | variable según autor | no verificable con la información disponible |

No se dispone de datos suficientes para establecer una comparación cuantitativa fiable con alternativas concretas. La comparación relevante sería siempre contra otras LoRA de retrato fotográfico entrenadas sobre el mismo modelo base krea2, y no se ha localizado ninguna referencia de ese tipo en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible aclarar la licencia del modelo base krea2 y obtener autorización explícita del autor del adaptador.
- Riesgo de sesgo estético: un adaptador especializado en "fotografía asiática" puede reproducir y reforzar estereotipos de apariencia, edad y género, además de reducir la diversidad de los rostros generados.
- Riesgo de sobreajuste al estilo: al tratarse de un adaptador de bajo rango sin documentación de entrenamiento, es probable que aparezcan artefactos, pérdida de adherencia al prompt o degradación de la diversidad cuando se aplica con pesos altos.
- Alucinación visual: como cualquier modelo generativo de imagen, puede producir anatomías incorrectas (manos, ojos, proporciones), texto ilegible y detalles incoherentes con el prompt.
- Contexto e idioma: se desconoce el comportamiento con prompts en castellano; los ejemplos facilitados están en inglés y no hay garantía de que el adaptador responda igual en otros idiomas.
- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks ni evaluaciones independientes; no hay evidencia pública de calidad en producción.
- Trazabilidad dudosa de la información de búsqueda: las consultas web asociadas a este modelo devolvieron exclusivamente resultados de sitios de contenido para adultos, sin relación con el artefacto. No se ha podido obtener ninguna fuente técnica externa verificable, por lo que la sección de enlaces se limita a los enlaces oficiales de la model card.
- Fecha de publicación inusual: los metadatos de HuggingFace indican creación el 2026-09-24 y actualización el 2026-09-24, dato que conviene contrastar por si el repositorio se ha subido con marcas de tiempo erróneas.
- Falta de documentación de despliegue: no se especifican versiones de ComfyUI, nodos requeridos, resolución de entrenamiento ni pesos recomendados del adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-krea2-ultimate-asian-photography-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2070666303182036993
- Publicación del autor en RunningHub: https://www.runninghub.ai/post/2070666773426434050
- Página del autor: https://www.runninghub.ai/user-center/1980864188878884866
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model

No se han localizado papers, repositorios de código ni demos independientes asociados a este adaptador en la búsqueda web realizada.
