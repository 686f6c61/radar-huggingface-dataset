# Hoops-McCann/hoi4-portraits-flux2-klein-9b-lora

## Resumen

El modelo `Hoops-McCann/hoi4-portraits-flux2-klein-9b-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para generar retratos de personajes con el estilo artistico del videojuego Hearts of Iron IV (HOI4), desarrollado por Paradox Interactive. El adaptador se aplica sobre el modelo base `black-forest-labs/FLUX.2-klein-base-9B-fp8`, un modelo de difusion de texto a imagen de 9 mil millones de parametros en formato fp8. El autor, Hoops-McCann, lo publica bajo licencia MIT, aunque el modelo base mantiene su propia licencia no comercial.

El adaptador permite tanto generacion de texto a imagen como edicion de imagen a imagen, manteniendo la identidad, la direccion de la mirada y la expresion de la persona representada. Esta pensado para integrarse en flujos de trabajo de ComfyUI mediante el repositorio publico `comfyui-hoi4-portraits`, y utiliza el trigger `hoi4_portrait style` para activar el estilo. Es relevante para desarrolladores y modders que necesitan producir retratos coherentes con la estetica de HOI4 de forma rapida y reproducible.

El repositorio tiene un tamano de 6.1 GB, lo que sugiere que incluye los pesos del adaptador y posiblemente el modelo base en formato fp8. No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de ajuste, pero el resultado es un adaptador ligero que modifica los pesos del modelo base sin necesidad de reentrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.2 Klein 9B (modelo de difusion transformer) |
| Parametros totales | No disponible (el adaptador LoRA no especifica; el modelo base tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (el modelo base se distribuye en fp8) |
| Idiomas soportados | No disponible (modelo de imagen; los prompts se escriben en ingles en los ejemplos) |
| Licencia | MIT (adaptador); el modelo base FLUX.2 Klein 9B tiene licencia no comercial |
| Formato de pesos | No disponible (se usa con diffusers y ComfyUI; probablemente safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, una tecnica de adaptacion de bajo rango que introduce matrices de pesos adicionales en las capas del modelo base, permitiendo ajustar su comportamiento sin modificar los pesos originales. El modelo base es FLUX.2 Klein 9B, un modelo de difusion de texto a imagen desarrollado por Black Forest Labs, que utiliza una arquitectura transformer con atencion de multiples cabezas y un codificador de texto. El adaptador se entrena especificamente para producir retratos con el estilo visual de HOI4, caracterizado por fondos neutros, iluminacion uniforme y un acabado pictorico.

No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de pasos, ni el metodo de optimizacion (si se uso RLHF, DPO u otro). La model card solo indica que el adaptador se usa con el trigger `hoi4_portrait style` y que en el modo texto a imagen los prompts deben describir unicamente a la persona, sin mencionar estilo, fondo, iluminacion o encuadre. En el modo imagen a imagen, se debe mantener la identidad, la direccion de la mirada y la expresion de la persona original.

## Capacidades

- Generacion de retratos con estilo Hearts of Iron IV a partir de descripciones de texto (por ejemplo, "un hombre irlandes de mediana edad con pelo corto y ondulado oscuro y bigote, vistiendo un traje civil oscuro").
- Edicion de imagen a imagen: transforma una fotografia o retrato existente en un retrato con estetica HOI4, conservando la identidad, la orientacion de la cara y la expresion, asi como los objetos que la persona sostiene o lleva.
- Integracion nativa con ComfyUI mediante los flujos de trabajo del repositorio `comfyui-hoi4-portraits`.
- Uso del trigger `hoi4_portrait style` para activar el estilo en prompts de texto.
- Compatible con el pipeline de diffusers para image-to-image, lo que permite su uso en scripts personalizados de Python.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generacion de imagenes, no de lenguaje.

## Casos de uso

- Creacion de retratos para mods de Hearts of Iron IV: los modders pueden generar rapidamente retratos de lideres politicos, generales o personajes historicos con el estilo oficial del juego, manteniendo coherencia visual en sus modificaciones.
- Produccion de assets para juegos de estrategia con estetica similar: estudios independientes o aficionados pueden usar el adaptador para generar retratos de personajes en un estilo pictorico uniforme, reduciendo el tiempo de produccion de arte.
- Prototipado de personajes para narrativas historicas o alternativas: escritores o creadores de contenido pueden visualizar personajes ficticios con apariencia realista y estilo de juego, util para novelas visuales o campanas de rol.
- Edicion de retratos existentes: mediante image-to-image, se puede convertir una fotografia de un actor o una ilustracion en un retrato estilo HOI4, preservando la identidad, lo que es util para proyectos de fans que recrean eventos historicos.
- Generacion de avatares o perfiles en comunidades de modding: los usuarios pueden crear retratos personalizados para sus propios mods o para compartir en foros, manteniendo la estetica del juego.
- Automatizacion de pipelines de arte en produccion: al integrarse en ComfyUI, el adaptador puede formar parte de un flujo de trabajo automatizado que genere decenas de retratos con variaciones controladas, acelerando la produccion de contenido para juegos o proyectos multimedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre metricas como FID, precision de identidad o comparaciones con otros adaptadores de estilo. El rendimiento depende del modelo base FLUX.2 Klein 9B y de la GPU utilizada.

## Requisitos de hardware

- No se proporcionan requisitos oficiales en la informacion disponible.
- El modelo base FLUX.2 Klein 9B en fp8 requiere tipicamente una GPU con al menos 16 GB de VRAM para inferencia, aunque esto no esta confirmado por el autor. GPU recomendadas: RTX 4090, A100, H100.
- El adaptador LoRA en si es ligero, pero el repositorio de 6.1 GB sugiere que puede incluir el modelo base, por lo que se necesita espacio de almacenamiento suficiente.
- Para ejecutar con ComfyUI, se requiere una instalacion funcional de ComfyUI y los nodos correspondientes del repositorio `comfyui-hoi4-portraits`.
- Tambien puede usarse con la libreria diffusers de Python, lo que permite despliegue en entornos con GPU NVIDIA o Apple Silicon (aunque no se especifica soporte para MPS).

## Comparativa con modelos similares

No disponible. No se han identificado otros adaptadores LoRA publicos especificamente dedicados a retratos de Hearts of Iron IV para FLUX.2 Klein 9B. Los adaptadores de estilo generico para modelos de difusion (como los de CivitAI) podrian ser comparables, pero no hay datos suficientes para establecer una comparacion objetiva.

## Limitaciones y advertencias

- El modelo base FLUX.2 Klein 9B esta sujeto a la FLUX Non-Commercial License, que restringe el uso comercial incluso cuando el adaptador se distribuye bajo MIT. Cualquier proyecto que utilice este adaptador debe cumplir con los terminos del modelo base.
- El adaptador no elimina las restricciones de licencia del modelo base ni las de los componentes de terceros (ComfyUI, codificador de texto, VAE, imagenes de origen).
- Hearts of Iron IV es una marca registrada de Paradox Interactive. Este proyecto es una creacion de la comunidad y no esta afiliado ni respaldado por Paradox Interactive.
- No se documentan sesgos especificos, pero al tratarse de un modelo de generacion de imagenes, puede reflejar sesgos presentes en los datos de entrenamiento del modelo base o del adaptador (por ejemplo, en la representacion de generos, etnias o vestimenta).
- Riesgo de alucinacion visual: el modelo puede generar detalles inexactos en rostros o accesorios, especialmente en prompts de texto complejos.
- Limitacion de contexto: el adaptador esta disenado para retratos de busto o medio cuerpo; no genera escenas completas ni fondos elaborados.
- La informacion sobre el entrenamiento (dataset, hiperparametros) no esta disponible, lo que dificulta la reproducibilidad y la evaluacion de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/Hoops-McCann/hoi4-portraits-flux2-klein-9b-lora
- Repositorio de flujos de trabajo ComfyUI: https://github.com/klimPaskov/comfyui-hoi4-portraits
- Modelo base: `black-forest-labs/FLUX.2-klein-base-9B-fp8` (disponible en HuggingFace, sujeto a licencia no comercial)
