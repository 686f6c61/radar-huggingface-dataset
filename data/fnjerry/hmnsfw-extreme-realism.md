# fnjerry/HMNSFW-Extreme-Realism

## Resumen

HMNSFW-Extreme-Realism es un LoRA (Low-Rank Adaptation) de concepto publicado por el usuario fnjerry en Hugging Face, derivado del modelo base MiniMax H3. Su propósito declarado es generar contenido de vídeo para adultos con un enfoque en "realismo y flexibilidad", según indica el autor original HearmemanAI en la model card. El repositorio ocupa 0,6 GB y no registra descargas ni interacciones en el momento de la consulta.

Se trata de un adaptador de bajo rango, no de un modelo fundacional autónomo: requiere el modelo base MiniMax H3 para funcionar y se integra en flujos de trabajo de generación de vídeo, típicamente a través de ComfyUI. La model card menciona flujos de trabajo gratuitos, plantillas de Runpod y tutoriales de despliegue, lo que sitúa el artefacto en el ecosistema de herramientas de generación audiovisual más que en el de los modelos de lenguaje.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no se publican especificaciones de arquitectura, parámetros, contexto ni benchmarks, y la licencia figura como "other" sin texto legal adjunto. El contenido está explícitamente orientado a material para adultos, lo que condiciona su aplicabilidad y las advertencias de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto legal especificado) |
| Formato de pesos | no disponible (repo de 0,6 GB, compatible con ComfyUI según la model card) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base MiniMax H3 para modificar su comportamiento generativo sin reentrenar los pesos completos. La model card no detalla en qué capas se aplica el adaptador, qué rango tiene ni qué configuración de entrenamiento se utilizó.

Según el autor original, el LoRA se entrenó con "casi 1000 vídeos" que cubren un repertorio explícito de actos sexuales (penetración, masturbación, sexo oral, uso de juguetes, eyaculaciones). No se indica el número de pasos, la tasa de aprendizaje, el tamaño del dataset en horas ni si hubo curación o filtrado. La model card reconoce explícitamente que algunos ejemplos del gallery "no son perfectos" y que el LoRA "no es una solución plug and play", lo que sugiere una calidad inconsistente y dependiente del prompt. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de vídeo para adultos: el adaptador modifica el modelo base MiniMax H3 para producir clips con contenido sexual explícito, según los ejemplos en formato MP4 incluidos en la model card.
- Versatilidad de actos: la descripción menciona penetración, masturbación, sexo oral, dedos, uso de dildo y eyaculaciones como categorías cubiertas por el entrenamiento.
- Compatibilidad con ComfyUI: la model card enlaza flujos de trabajo y plantillas de despliegue para ComfyUI, lo que indica integración con ese ecosistema.
- Compatibilidad con Turbo LoRA: el autor indica que el LoRA "también funciona con turbo lora", aunque recomienda no usarlo por defecto.
- Sin trigger words: la model card declara explícitamente que no requiere palabras de activación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Producción de vídeo para adultos en pipelines de ComfyUI: el LoRA se cargaría junto al modelo base MiniMax H3 en un grafo de ComfyUI para generar clips explícitos, aprovechando los flujos de trabajo gratuitos que el autor enlaza.
- Prototipado rápido de escenas: con los ajustes recomendados (Euler, scheduler Simple/Beta/Normal, 18 pasos, shift 12) se pueden generar borradores de escenas antes de refinar el prompt, aunque el propio autor advierte de resultados irregulares.
- Experimentación con mezcla de LoRAs: la model card anima a combinar este adaptador con otros LoRA y a probar distintas técnicas de prompting, lo que lo hace útil para investigadores que estudien composición de adaptadores.
- Despliegue en infraestructura cloud: mediante la plantilla de Runpod enlazada por el autor se puede levantar MiniMax H3 con ComfyUI y cargar este LoRA para generación por lotes.
- Investigación sobre sesgos y seguridad en generación audiovisual: el artefacto puede servir como muestra de contenido explícito para estudiar filtrado, moderación y detección automática de material para adultos.
- Estudio de la eficacia de LoRA de concepto: comparar este adaptador con otros del mismo modelo base permite analizar cómo el entrenamiento con ~1000 vídeos afecta a la fidelidad y diversidad de un concepto concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base MiniMax H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. La model card sugiere desplegar MiniMax en Runpod, lo que implica GPUs de centro de datos, pero no especifica modelos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (flujos de trabajo enlazados), plantilla de Runpod para MiniMax H3. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de concepto comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material sexual explícito, lo que restringe su uso a entornos con verificación de edad y cumplimiento legal en la jurisdicción correspondiente.
- Licencia ambigua: figura como "other" sin texto legal adjunto, por lo que no se puede confirmar si se permite uso comercial, redistribución o modificación.
- Calidad inconsistente: el propio autor reconoce que el LoRA "no es una solución plug and play" e incluye ejemplos imperfectos a propósito, lo que anticipa resultados variables según el prompt.
- Dependencia del modelo base: no funciona de forma autónoma; requiere MiniMax H3, cuyos requisitos de hardware y licencia no se documentan aquí.
- Falta de documentación técnica: sin parámetros, contexto, dataset detallado ni benchmarks, es imposible evaluar rigorosamente su rendimiento o reproducibilidad.
- Riesgo de sesgos: el dataset de entrenamiento (casi 1000 vídeos de contenido para adultos) probablemente introduce sesgos de representación corporal, étnica y de prácticas que no se han documentado ni mitigado.
- Sin tracción verificable: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Posible infracción de derechos: no se especifica la procedencia de los vídeos de entrenamiento ni si se cuenta con consentimiento de las personas representadas.

## Enlaces

- Hugging Face: https://huggingface.co/fnjerry/HMNSFW-Extreme-Realism
- Página del modelo en CivitAI: https://civitai.com/models/2834417?modelVersionId=3446189
- Archivo en CivArchive: https://civarchive.com/models/2834417?modelVersionId=3446189
- Perfil del autor original en CivitAI: https://civitai.com/user/HearmemanAI
- Plantilla de Runpod para MiniMax: https://get.runpod.io/minimax-template
- Tutorial de despliegue: https://civitai.red/articles/34593/deploying-minimax-h3-to-runpod-with-comfyui-workflows-and-auto-prompting
- Flujos y guías del autor: https://hearmemanai.com
- Discord del autor: https://discord.gg/ZVWVhT43GW
