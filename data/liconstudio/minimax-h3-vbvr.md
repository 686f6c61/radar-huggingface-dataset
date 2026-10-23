# LiconStudio/Minimax-H3-VBVR

## Resumen

Licon VBVR es un adaptador LoRA de imagen a vídeo (image-to-video) para el modelo base MiniMax-H3, desarrollado por LiconStudio y publicado bajo licencia Apache 2.0. No se trata de un modelo completo, sino de un ajuste fino de bajo rango que se carga sobre MiniMax-H3 mediante un workflow de generación de vídeo compatible, y que se distribuye como un único fichero `H3-VBVR-I2V.safetensors` dentro de un repositorio de 0,2 GB.

El objetivo declarado por el autor es corregir tres fallos típicos de la generación de vídeo con modelos de difusión: la duplicación no intencionada de objetos a lo largo de la secuencia, el clipping e interpenetración entre personajes, objetos y superficies, y la lógica de acción de los personajes (secuencias de movimiento incoherentes). El adaptador se entrenó sobre una reconstrucción y reprocesado del dataset público VBVR-Pro-SFT-Video, adaptado a las particularidades del pipeline de entrenamiento de H3.

Su relevancia es acotada pero práctica: es un ejemplo de transferencia de patrones estructurados de movimiento e interacción a un modelo de vídeo comercial, empaquetado para su uso directo en ComfyUI. La información pública disponible es escasa: la model card no incluye número de parámetros, arquitectura interna del modelo base, resolución, duración de clip, número de pasos de entrenamiento ni métricas cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax-H3, un modelo generativo de vídeo de tipo difusión (detalle interno del base no disponible) |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB; el adaptador se distribuye como un unico fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; no se especifican resolucion, fps ni duracion de clip) |
| Tipos de cuantizacion | no disponible; el peso se distribuye en safetensors. No se documentan variantes GGUF, fp8 ni int8 del adaptador |
| Idiomas soportados | no disponible (generacion de video; no se documenta el idioma de los prompts) |
| Licencia | apache-2.0 (sujeta ademas a la licencia del modelo base MiniMax-H3, no disponible en la informacion proporcionada) |
| Formato de pesos | safetensors (`H3-VBVR-I2V.safetensors`) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA para la tarea de imagen a vídeo sobre MiniMax-H3. La model card no detalla el rango del adaptador, las capas objetivo ni los hiperparámetros de entrenamiento (learning rate, pasos, tamaño de batch, resolución de entrenamiento). Tampoco se especifica si el ajuste afecta solo al bloque de atención temporal, al UNet/DiT completo o a módulos auxiliares del pipeline.

En cuanto a datos, el autor indica que partió del dataset VBVR-Pro-SFT-Video y que reconstruyó y reprocesó ese material "alrededor de las características de H3", adaptando la preparación y el preprocesado de datos a su pipeline de entrenamiento. El objetivo declarado es transferir patrones estructurados de movimiento e interacción (consistencia de objeto, relaciones espaciales y lógica de acción) a la generación de vídeo práctica. No se documenta el volumen de datos resultante, el número de tokens o clips, ni si hubo etapas de RLHF/DPO (concepto, por otra parte, propio de modelos de lenguaje y no directamente aplicable aquí). Tampoco se describen innovaciones técnicas propias más allá del reprocesado del dataset.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) usando MiniMax-H3 como motor.
- Mejora de la consistencia de identidad de objetos a lo largo de la secuencia, con reducción de duplicaciones no intencionadas.
- Reducción de clipping e interpenetración en interacciones entre personajes, objetos y superficies.
- Mejora de la lógica de acción de los personajes: secuencias de movimiento e interacción más coherentes.
- Integración directa en ComfyUI mediante el nodo de carga de LoRA del workflow de H3 (`ComfyUI/models/loras/`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking": no aplican a este tipo de modelo.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Publicidad de producto con manipulación de objetos: el adaptador está entrenado específicamente para evitar que un envase, herramienta o prenda se duplique o se atraviese durante la rotación y el manejo, lo que reduce el número de tomas descartadas en un pipeline de vídeo comercial.
- Previz y animática de personajes: para planos donde un personaje coge, empuja o entrega un objeto, la mejora de la lógica de acción disminuye la incoherencia física típica antes de pasar a producción final.
- Contenido para redes sociales a partir de una imagen fija: generar clips cortos animando una foto de producto o retrato con menor riesgo de artefactos espaciales en las manos y en los contactos con superficies.
- Composición VFX y plate matching: al reducir interpenetraciones, los clips generados necesitan menos corrección manual de roto y limpieza antes de integrarse en una toma real.
- E-commerce y catálogos animados: animar imágenes de catálogo con un personaje que interactúa con el artículo, manteniendo una única instancia del producto a lo largo del clip.
- Prototipado rápido de ideas de storyboard: iterar variantes de una secuencia de acción en ComfyUI cargando y descargando el LoRA a bajo coste, dado el reducido tamaño del fichero (0,2 GB).
- Evaluación comparativa de adaptadores: servir como referencia reproducible de ajuste sobre VBVR-Pro-SFT-Video para experimentos de transferencia de datos estructurados a modelos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente incluye comparaciones cualitativas en vídeo (ejemplos "02" y "03") frente al MiniMax-H3 original, sin métricas numéricas, sin tamaño de muestra y sin protocolo de evaluación. No hay datos de FVD, CLIP-score, consistencia temporal ni evaluaciones humanas cuantificadas.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB y se carga en memoria junto al modelo base; el coste real de VRAM lo determina MiniMax-H3, cuyos requisitos no se documentan en la información proporcionada.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. No se puede confirmar que quepa en GPU de consumo (RTX 4090 y similares) sin conocer el tamaño y la precisión del modelo base.
- Despliegue: ComfyUI es la vía documentada. Se descarga `H3-VBVR-I2V.safetensors`, se coloca en `ComfyUI/models/loras/` y se selecciona en el nodo de carga de LoRA del workflow de H3 para imagen a vídeo. No aplican vLLM, TGI, llama.cpp ni Ollama (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiconStudio Minimax-H3-VBVR | LoRA image-to-video sobre MiniMax-H3 | no disponible (repo de 0,2 GB) | no disponible | apache-2.0 (mas licencia del base) | HuggingFace, 0 descargas, 18 likes |
| MiniMaxAI/MiniMax-H3 (sin LoRA) | Modelo base generativo de video | no disponible | no disponible | no disponible | HuggingFace (referenciado en la model card) |
| Otros LoRA de image-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas de la misma categoría no es posible con la información disponible: no se han identificado en la búsqueda web otros adaptadores comparables ni se dispone de métricas del modelo base. La única comparación documentada es cualitativa, mediante pares de vídeos original frente a original+VBVR.

## Limitaciones y advertencias

- Ausencia casi total de documentación técnica: sin número de parámetros, rango del LoRA, capas objetivo, resolución, duración de clip ni hiperparámetros de entrenamiento, lo que impide reproducir el ajuste.
- Sin benchmarks cuantitativos: la mejora se sostiene solo en dos ejemplos cualitativos publicados por el propio autor, lo que constituye evidencia débil y potencialmente sesgada por selección.
- Riesgo de sobreajuste al dominio del dataset VBVR-Pro-SFT-Video: el comportamiento en estilos, dominios o tipos de objeto alejados de esa distribución no está evaluado.
- El adaptador puede degradar otros aspectos del modelo base (estética, movimiento de cámara, detalle fino) al no haberse reportado evaluaciones en esa dirección.
- Licencia: el adaptador se declara apache-2.0, pero su uso comercial está condicionado por la licencia de MiniMax-H3, que no figura en la información proporcionada. Es imprescindible verificar ambas antes de un uso en producción.
- Idiomas de prompt no documentados; conviene asumir inglés por defecto hasta confirmarlo.
- Sesgos: no disponibles. Al ser un ajuste sobre un dataset específico, puede heredar los sesgos de composición, demografía y physical plausibility de ese corpus.
- Riesgo de alucinación visual (objetos o acciones inventados) no medido.
- Tracción mínima en el repositorio (0 descargas, 18 likes) y publicación muy reciente: no hay evidencia de uso en producción ni soporte del autor.
- La búsqueda web no devolvió documentación técnica ni discusiones de terceros sobre este adaptador; los resultados obtenidos fueron páginas genéricas de YouTube sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiconStudio/Minimax-H3-VBVR
- Pesos del adaptador (safetensors): https://huggingface.co/LiconStudio/Minimax-H3-VBVR/resolve/main/H3-VBVR-I2V.safetensors
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Dataset de entrenamiento VBVR-Pro-SFT-Video: https://huggingface.co/datasets/Video-Reason/VBVR-Pro-SFT-Video
- Vídeo de comparación, ejemplo 02, original: https://huggingface.co/LiconStudio/Minimax-H3-VBVR/resolve/main/validation/2/original.mp4
- Vídeo de comparación, ejemplo 02, con VBVR: https://huggingface.co/LiconStudio/Minimax-H3-VBVR/resolve/main/validation/2/VBVR.mp4
- Vídeo de comparación, ejemplo 03, original: https://huggingface.co/LiconStudio/Minimax-H3-VBVR/resolve/main/validation/3/original.mp4
- Vídeo de comparación, ejemplo 03, con VBVR: https://huggingface.co/LiconStudio/Minimax-H3-VBVR/resolve/main/validation/3/VBVR.mp4
- Paper técnico: no disponible en la información proporcionada.
- Repositorio de código o demo adicional: no disponible en la información proporcionada.
