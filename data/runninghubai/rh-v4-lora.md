# RunningHubAI/rh-v4-lora

## Resumen

rh-v4-lora es un adaptador LoRA de edicion de imagen (image edit) publicado por RunningHubAI en nombre del autor «冰爷老杨». No es un modelo de lenguaje: es un peso auxiliar que se aplica sobre Flux1-Kontext, un modelo de difusion texto-a-imagen e imagen-a-imagen, para especializarlo en una tarea muy concreta de composicion fotografica conocida como «blending» o fusion de un sujeto recortado dentro de un fondo nuevo.

El adaptador esta disenado para que un sujeto pegado sobre una imagen de fondo se integre de forma realista, con especial atencion a la iluminacion, las sombras y los reflejos. Segun la model card, el entrenamiento se realizo con materiales de render C4D en alta definicion para que el comportamiento de la luz se ajuste a la fisica real, y se incide en la capacidad de fusionar sujetos transparentes y superficies complejas como espejos esmerilados o agua.

El repositorio pesa aproximadamente 0,2 GB y contiene un unico archivo safetensors de 164 MiB con los pesos LoRA. Se distribuye para su uso en ComfyUI y en la plataforma RunningHub, e incluye una palabra de activacion (trigger word) especifica. La informacion publica es escasa en cuanto a arquitectura interna, datos de entrenamiento detallados y evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Flux1-Kontext (modelo de difusion) |
| Parametros totales | no disponible (archivo de pesos de 164 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no disponible la resolucion nativa) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin cuantizar; el LoRA se combina con el modelo base en la precision de este) |
| Idiomas soportados | no disponible (los prompts dependen del modelo base Flux1-Kontext) |
| Licencia | no disponible explicitamente; la model card remite a la licencia del proyecto original o upstream (Flux1-Kontext) |
| Formato de pesos | safetensors (`冰爷老杨真实溶图V4.safetensors`, 164 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Flux1-Kontext para modificar su comportamiento sin reentrenar todos los pesos. El repositorio no detalla el rango del LoRA, las capas objetivo ni los hiperparametros de entrenamiento. El autor describe un entrenamiento «completo» (full LoRA) orientado a una mayor estabilidad a costa de un mayor coste de entrenamiento, y menciona el uso de una gran cantidad de materiales de render C4D en alta definicion para ajustar el comportamiento de la luz y las sombras a la fisica real.

La especializacion es funcional: fusionar un sujeto con un fondo de forma convincente. El autor indica que se entreno especificamente para sujetos transparentes de alta dificultad y para superficies como espejos esmerilados o agua, donde el adaptador puede generar reflejos adheridos al sujeto. La palabra de activacion empleada en el entrenamiento es «Make it blend into the background», aunque el autor senala que «Make it blend» tambien funciona en sus pruebas. No se publican el numero de pasos, el tamano del dataset ni si se aplicaron tecnicas de regularizacion o validacion cruzada.

## Capacidades

- Fusion de un sujeto recortado dentro de una imagen de fondo con iluminacion y sombras coherentes.
- Generacion de reflejos realistas sobre superficies como agua o espejos esmerilados, adheridos al sujeto.
- Tratamiento de sujetos con transparencias (cristal, liquido, materiales translucidos) de forma estable.
- Composicion fotografica de dos imagenes de entrada mediante el pipeline image-text-to-image de Flux1-Kontext.
- Control mediante palabra de activacion («Make it blend into the background» o «Make it blend»).
- Integracion en flujos de ComfyUI y en la plataforma RunningHub.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni multilingues; no aplica a este tipo de modelo.

## Casos de uso

- Retoque fotografico profesional: recortar un producto o una persona y fusionarlo con un fondo nuevo, usando la palabra de activacion para obtener sombras e iluminacion coherentes con la escena.
- Catalogo de e-commerce: integrar productos (incluidos los translucidos, como botellas o cosmeticos) en escenarios de estudio generados, reduciendo la necesidad de sesiones fotograficas adicionales.
- Composicion publicitaria: insertar un modelo o un objeto en un entorno de render C4D y ajustar la integracion de luz para que el resultado no parezca un collage.
- Edicion creativa en ComfyUI: encadenar el LoRA en un grafo de nodos con el modelo base Flux1-Kontext para tareas de blending por lotes sobre un conjunto de imagenes.
- Pruebas de concepto de reflejos: generar variantes de una escena con superficies reflectantes (agua, espejo esmerilado) para evaluar composiciones antes de un render final.
- Automatizacion via API de RunningHub: invocar el flujo de blending desde la API para integrarlo en un pipeline de produccion de contenidos graficos.
- Formacion y demos: usar el flujo de trabajo de blending publicado por el autor para mostrar tecnicas de composicion con LoRA sobre modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Depende del modelo base Flux1-Kontext y de la precision de carga; el LoRA en si anade una sobrecarga pequena sobre el modelo base.
- GPU recomendadas: no especificadas. El autor menciona haber entrenado con una RTX 5090 («hasta que humeo»), lo que indica que el entrenamiento se realizo en hardware de consumo de gama alta.
- Compatibilidad con GPU de consumo: no confirmada; vendra determinada por los requisitos del modelo base Flux1-Kontext.
- Opciones de despliegue: ComfyUI (flujo recomendado por el autor), plataforma RunningHub y API de RunningHub. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI), que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano del adaptador | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-v4-lora | LoRA de edicion de imagen (blending) | Flux1-Kontext | 164 MiB | no disponible | no disponible (remite a upstream) | Hugging Face, ComfyUI, RunningHub |
| Alternativas de blending sobre Flux | LoRA de edicion de imagen | Flux1-Kontext | no disponible | no disponible | no disponible | no disponible |
| Modelos de inpainting/composicion genericos | Modelo completo de difusion | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos publicos de otros LoRA comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- La model card no especifica la licencia del adaptador; remite a la licencia del proyecto original o upstream (Flux1-Kontext). Es imprescindible verificar la licencia de Flux1-Kontext antes de cualquier uso comercial.
- La informacion tecnica publicada es minima: no hay datos de rango del LoRA, dataset, hiperparametros ni evaluacion cuantitativa.
- El adaptador depende completamente de Flux1-Kontext; su calidad y sus limitaciones heredan las del modelo base.
- La palabra de activacion esta en ingles y el autor recomienda usarla; prompts en otros idiomas pueden comportarse de forma distinta segun el modelo base.
- Riesgo de artefactos en composiciones complejas (transparencias, reflejos) no cubiertas por el entrenamiento; no hay evaluacion publica que lo cuantifique.
- El autor menciona un entrenamiento con materiales C4D, lo que puede sesgar el estilo hacia renders de sintesis frente a fotografia real.
- No hay garantias de soporte ni mantenimiento del repositorio; el numero de descargas y likes es cero en el momento de la consulta.
- No aplica como modelo de lenguaje: no genera texto, codigo ni razonamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-v4-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1965734175850561538
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1958536513988550658
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-v4-lora/blob/main/README_cn.md
