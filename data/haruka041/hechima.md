# Haruka041/hechima

## Resumen

Hechima es un adaptador de tipo LoRA para generación de imágenes a partir de texto (text-to-image), publicado por el usuario Haruka041 en HuggingFace. Se distribuye como un adaptador sobre el modelo base krea/Krea-2-Turbo, un modelo de difusión de la familia Krea, y se integra en el ecosistema diffusers. Su función es enseñar al modelo base un estilo visual concreto, activado mediante la palabra clave (trigger word) `hechima style`, que debe incluirse en el prompt para que el estilo se aplique.

El repositorio ocupa aproximadamente 0,5 GB, un tamaño coherente con un adaptador LoRA y no con un modelo completo, lo que confirma que se trata de pesos adicionales que requieren descargar por separado el modelo base. El autor no ha publicado información sobre la arquitectura interna del adaptador (rango, capas objetivo), el conjunto de datos de entrenamiento, el número de pasos ni los hiperparámetros utilizados.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo no tiene descargas ni valoraciones en el momento de la consulta, no declara licencia y no incluye datos de evaluación. Es, por tanto, un adaptador de estilo experimental más que un componente listo para producción, y cualquier uso comercial exige aclarar antes la licencia tanto del adaptador como del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion text-to-image (base: krea/Krea-2-Turbo); arquitectura interna del adaptador no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts suelen escribirse en ingles, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio compatible con diffusers) |
| Modelo base | krea/Krea-2-Turbo |
| Palabra clave de activacion | `hechima style` |
| Tarea (pipeline) | text-to-image |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un adaptador LoRA (Low-Rank Adaptation) sobre el modelo de difusion krea/Krea-2-Turbo, entrenado para reproducir un estilo visual denominado `hechima style`. Los LoRA de difusion funcionan inyectando matrices de bajo rango en determinadas capas del modelo base (habitualmente en los bloques de atencion cruzada y/o en las proyecciones de las capas de atencion del U-Net o del transformador de difusion), de forma que el modelo original permanece congelado y solo se entrenan esos pesos adicionales.

No se ha publicado informacion sobre el numero de imagenes de entrenamiento, su composicion, la resolucion de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas adicionales como regularizacion por clase o entrenamiento con captions detallados. Tampoco hay datos sobre la arquitectura concreta de Krea-2-Turbo (tipo de backbone, numero de parametros, si emplea un transformador de difusion o un U-Net convolucional).

## Capacidades

- Generacion de imagenes a partir de texto con un estilo visual especifico, activado mediante la palabra clave `hechima style`.
- Aplicacion de estilo sobre el modelo base Krea-2-Turbo sin necesidad de reentrenar el modelo completo.
- Composicion con otros adaptadores del mismo modelo base mediante pesos de escala (no confirmado por el autor).
- Ajuste de la intensidad del estilo variando el peso del LoRA en el pipeline de diffusers (comportamiento estandar de este tipo de adaptadores, no documentado en la model card).
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo de razonamiento explicito (thinking mode), vision de entrada ni procesamiento de audio.
- No se declaran capacidades multilingues ni idiomas soportados.

## Casos de uso

- Ilustracion editorial con identidad visual propia: el adaptador permite generar imagenes con un estilo consistente para articulos, portadas o posts de blog, siempre que el prompt incluya `hechima style` para forzar la estetica entrenada.
- Creacion de assets para videojuegos o prototipos: generacion rapida de concept art y variaciones de personajes o escenarios con una linea grafica homogenea, usando el LoRA como capa de estilo sobre Krea-2-Turbo.
- Produccion de contenido para redes sociales: generacion por lotes de imagenes con una estetica reconocible de marca, encadenando prompts variados pero manteniendo el mismo estilo.
- Maquetas y presentaciones comerciales: generacion de imagenes de apoyo para decks o propuestas que requieran una direccion de arte concreta sin contratar ilustracion a medida.
- Experimentacion artistica y estudio de estilo: investigacion sobre como un LoRA de bajo rango desplaza la distribucion de salida del modelo base, comparando resultados con y sin adaptador y a distintos pesos de escala.
- Prototipado rapido en pipelines de difusion: integracion en flujos de trabajo con diffusers para encadenar generacion, upscaling y retoque, aprovechando que el adaptador se carga como un modulo adicional sin duplicar el modelo base.
- Pruebas de concepto de personalizacion de marca: evaluar si un estilo entrenado con pocas imagenes es suficiente para cubrir las necesidades graficas de un cliente antes de invertir en un entrenamiento mayor o en un modelo afinado completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FID, CLIP score, similitud con el estilo de referencia) ni comparaciones cuantitativas con otros adaptadores. La unica referencia visual es la imagen de ejemplo declarada en los metadatos del widget (`images/111.png`).

## Requisitos de hardware

- VRAM estimada para inferencia del adaptador: no disponible. La VRAM depende del modelo base Krea-2-Turbo, cuyos requisitos no se especifican en la informacion proporcionada.
- Al tratarse de un LoRA de 0,5 GB, el coste adicional de memoria respecto al modelo base es reducido, pero es el modelo base el que determina el requisito real de VRAM.
- GPU recomendadas: no disponible. Para adaptadores de difusion de rango medio es habitual que basten GPU consumer con 8-12 GB de VRAM (por ejemplo RTX 3060, 4070 o 4090) en precision reducida, aunque no hay confirmacion para este caso concreto.
- Ejecucion en GPU consumer: no confirmada por el autor. Requiere verificar primero los requisitos de Krea-2-Turbo.
- Opciones de despliegue: al estar etiquetado con la libreria diffusers, el uso previsto es mediante la libreria `diffusers` de HuggingFace con `load_lora_weights`. Otros backends (ComfyUI, Automatic1111, InvokeAI) no estan confirmados. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son motores para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores alternativos comparables, ni datos de rendimiento que permitan una comparacion objetiva. La unica referencia estructural es el propio modelo base krea/Krea-2-Turbo, sobre el que este LoRA actua como capa adicional de estilo.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el adaptador permite uso comercial. Esta es la limitacion mas relevante para cualquier uso en produccion, y debe aclararse tambien la licencia del modelo base Krea-2-Turbo.
- Ausencia de evaluacion: sin benchmarks ni comparaciones, no hay evidencia objetiva de la fidelidad del estilo ni de su robustez ante prompts variados.
- Riesgo de sobreajuste al estilo: los LoRA de estilo entrenados con pocas imagenes tienden a reproducir composiciones, encuadres o paletas concretas del conjunto de entrenamiento, lo que puede reducir la diversidad de las salidas.
- Dependencia de la palabra clave: si no se incluye `hechima style` en el prompt, el adaptador puede no activarse o degradar la calidad de la imagen.
- Sesgos potenciales: al no documentarse el conjunto de entrenamiento, se desconoce si contiene sesgos de representacion (genero, etnia, edad) que el adaptador pueda reproducir y amplificar.
- Riesgo de contenido problemático: sin filtros ni salvaguardas declaradas, la generacion depende de las politicas del modelo base y del pipeline que se utilice.
- Idiomas no declarados: no hay confirmacion de que los prompts en castellano funcionen correctamente; lo habitual en este tipo de modelos es que el texto de condicionamiento se escriba en ingles.
- Madurez del repositorio: cero descargas y cero valoraciones, con una unica actualizacion el mismo dia de creacion, lo que indica ausencia de validacion por parte de la comunidad.
- Compatibilidad no garantizada: no se documenta la version de diffusers necesaria ni los identificadores de carga del adaptador mas alla del repositorio.
- Sin soporte ni mantenimiento declarado por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Haruka041/hechima
- Archivos del repositorio: https://huggingface.co/Haruka041/hechima/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Perfil del autor: https://huggingface.co/Haruka041
- Libreria diffusers: https://github.com/huggingface/diffusers
- Paper de LoRA (Low-Rank Adaptation): https://arxiv.org/abs/2106.09685
