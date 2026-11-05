# RunningHubAI/rh-sasha-z-lora

## Resumen

rh-sasha-z-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un peso adicional de bajo rango (81 MiB en un unico archivo `20261015-17007751.safetensors`) que se aplica sobre el modelo base Z-image-turbo para especializar su generacion hacia un sujeto concreto. El autor del entrenamiento figura como Pablo Catalan dentro de la plataforma RunningHub.

El adaptador esta disenado para su uso en ComfyUI y en la propia plataforma RunningHub, y su funcion es fijar la identidad visual de un personaje descrito en la model card como "joven de 23 anos, rubia y alegre". Para activarlo se utiliza la palabra disparadora "Sasha Z" en el prompt. El repositorio no incluye informacion sobre la composicion del dataset de entrenamiento, hiperparametros, numero de pasos ni evaluaciones cuantitativas.

Su relevancia es limitada y muy especifica: resulta util para flujos de generacion de imagen que ya trabajan con Z-image-turbo y necesitan consistencia de personaje entre generaciones. No aporta capacidades nuevas de razonamiento, codigo o lenguaje, y su licencia no esta declarada de forma explicita, lo que condiciona su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Z-image-turbo |
| Parametros totales | no disponible (peso LoRA de 81 MiB; el numero de parametros no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se procesan mediante el text encoder del modelo base) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-turbo para modificar su comportamiento generativo sin reentrenar los pesos completos. El archivo entregado pesa 81 MiB, un tamano coherente con un adaptador de rango moderado para un modelo de difusion. No se especifica sobre que modulos exactos del transformer de difusion se aplican las matrices, ni el rango utilizado, ni el valor de alpha.

La informacion sobre el entrenamiento es practicamente inexistente: la model card solo indica que se ha afinado a partir de Z-image-turbo y que se entreno en la plataforma RunningHub. No se declara el numero de imagenes, la resolucion de entrenamiento, el numero de pasos, la tasa de aprendizaje, el uso de regularizacion o captions, ni si se emplearon tecnicas como LoRA con text encoder entrenado o solo U-Net/transformer. Tampoco hay informacion sobre evaluacion cualitativa o cuantitativa del adaptador.

## Capacidades

- Generacion de imagenes text-to-image condicionada por el modelo base Z-image-turbo.
- Especializacion de identidad de personaje mediante la palabra disparadora "Sasha Z".
- Integracion en flujos de ComfyUI como nodo de carga de LoRA.
- Compatibilidad con la plataforma RunningHub y su API para ejecucion remota.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de capacidades multilingues declaradas mas alla de las del text encoder del modelo base.
- No incluye modo thinking, vision de entrada, audio ni otras capacidades especiales.

## Casos de uso

- Generacion de retratos consistentes de personaje: usar el LoRA con el trigger "Sasha Z" en ComfyUI para producir variaciones de una misma identidad visual a lo largo de una serie de imagenes, manteniendo rasgos faciales y estilo.
- Ilustracion editorial seriada: aplicar el adaptador en un pipeline de generacion por lotes para crear imagenes de acompanamiento en articulos o redes sociales con un personaje recurrente.
- Prototipado de personajes para narrativa visual: generar paneles o storyboards con el mismo sujeto en distintas poses y escenarios antes de encargar arte final.
- Pruebas de concepto en moda o publicidad: explorar variaciones de estilismo y encuadre sobre una identidad fija sin necesidad de sesion fotografica.
- Integracion via API de RunningHub: invocar el modelo desde la API para generar imagenes bajo demanda en una aplicacion web, delegando el computo en la plataforma.
- Experimentacion con LoRA en investigacion de difusion: emplear el adaptador como caso de estudio de personalizacion de un modelo turbo y comparar su comportamiento frente a otros LoRA de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente del modelo base Z-image-turbo y de la precision de carga (fp16, fp8, etc.). El adaptador en si anade solo 81 MiB.
- GPU recomendadas: no disponible. Al tratarse de un modelo de difusion turbo, se requiere una GPU con memoria suficiente para el modelo base; no se confirma compatibilidad con ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-sasha-z-lora | LoRA sobre Z-image-turbo | no disponible (81 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas de LoRA de personaje | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial esta permitido.
- El adaptador solo funciona correctamente junto con el modelo base Z-image-turbo; no es autonomo.
- La palabra disparadora "Sasha Z" es obligatoria para activar el efecto del LoRA; sin ella el adaptador puede no tener efecto o introducir artefactos.
- No hay informacion sobre sesgos del modelo base ni sobre como el entrenamiento del LoRA puede amplificarlos.
- Riesgo de sobreajuste y de reproduccion de identidades o estilos presentes en el dataset de entrenamiento, del que no se conocen detalles.
- No se documentan limitaciones de idioma en los prompts, pero dependen del text encoder del modelo base.
- Ausencia total de evaluaciones cuantitativas: no se puede estimar la fidelidad del personaje ni la tasa de exito en la generacion.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sasha-z-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2110869297292062721
- Pagina del autor: https://www.runninghub.ai/user-center/2103662895817433089
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
