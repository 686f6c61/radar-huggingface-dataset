# dougskullery/mystery-woman

## Resumen

mystery-woman es un adaptador LoRA de tipo DreamBooth para el modelo de difusión de texto a imagen Krea 2, publicado por el usuario dougskullery en HuggingFace. Se entrenó sobre Krea 2 RAW (krea/Krea-2-Raw) y las muestras de la model card se generaron con Krea 2 Turbo mediante diffusers en 8 pasos de inferencia. El repositorio ocupa 0,8 GB y se distribuye bajo licencia apache-2.0.

El adaptador no es un modelo completo, sino un conjunto de pesos de bajo rango que se cargan sobre el modelo base para inyectar un concepto único: un personaje femenino invocado mediante el token de activación `mystery_woman`. No modifica la arquitectura del modelo base ni sus capacidades generales; únicamente condiciona la generación hacia ese concepto.

Su relevancia es la habitual de un LoRA de personaje: permite reutilizar un modelo base grande sin reentrenarlo, con un coste de almacenamiento reducido (0,8 GB) y una integración directa vía `pipe.load_lora_weights()`. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", por lo que no existe validación comunitaria ni evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de texto a imagen (Krea 2) |
| Parametros totales | no disponible (el repositorio ocupa 0,8 GB; no se especifica el rango ni el numero de parametros del adaptador) |
| Longitud de contexto | no aplica (modelo de texto a imagen; no se especifica la longitud maxima de prompt) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | no especificado; distribuido a traves de la libreria diffusers (`load_lora_weights`) |
| Modelo base | krea/Krea-2-Raw |
| Token de activacion | `mystery_woman` |
| Pipeline | text-to-image |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado con DreamBooth sobre el modelo base Krea 2 RAW. La model card indica explicitamente que el entrenamiento se realizo sobre Krea 2 RAW y que las muestras presentadas se generaron sobre Krea 2 Turbo, lo que sugiere compatibilidad del adaptador con ambas variantes del modelo base. La invocacion del concepto se realiza mediante el token `mystery_woman`, segun el `instance_prompt` declarado.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la resolucion, el numero de pasos, el rango (rank) o el alpha del LoRA, la tasa de aprendizaje, el uso de regularizacion o cualquier tecnica adicional (LoRA de texto, ti-tuning, etc.). Tampoco se documenta si hubo curado del dataset ni que tipo de imagenes se usaron para definir el concepto. La unica innovacion tecnica reseñable es inherente al formato: la separacion entre el modelo base y el adaptador permite cargar y descargar el concepto sin duplicar los pesos del modelo completo.

## Capacidades

- Generacion de imagenes de texto a imagen condicionadas al concepto `mystery_woman`, un personaje femenino cuya apariencia concreta no se describe en la model card (se deduce de las muestras).
- Estilos demostrados en los ejemplos: fotografia cinematografica (atmosfera victoriana con niebla), escena cyberpunk con iluminacion de neon, y pintura al oleo surrealista.
- Compatible con Krea 2 Turbo en regimen de pocos pasos: los ejemplos usan `num_inference_steps=8` y `guidance_scale=0.0`.
- Integracion directa con la libreria diffusers mediante `Krea2Pipeline` y `load_lora_weights`, lo que permite combinarlo con otros LoRA en la misma tuberia (no verificado en la informacion disponible).
- Capacidades heredadas del modelo base Krea 2 (composicion, iluminacion, estilos) en la medida en que el LoRA no las altere.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues mas alla de que los prompts de ejemplo estan en ingles.
- No se declaran capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Diseno de personajes para narrativa visual: el adaptador mantiene la coherencia de un personaje femenino concreto a lo largo de varias imagenes usando el token `mystery_woman`, lo que resulta util para biblias de personaje o propuestas de concepto.
- Ilustracion editorial y de portadas: genera escenas atmosfericas (cine negro, gotico victoriano, cyberpunk) en un unico paso de generacion sobre Krea 2 Turbo, adecuadas para bocetos de portada de novela o articulo.
- Storyboard y previsualizacion para produccion audiovisual: con 8 pasos de inferencia y `guidance_scale=0.0` se pueden producir rapidamente fotogramas de referencia para planos con iluminacion dramatica antes de rodar o modelar en 3D.
- Prototipado de arte conceptual para videojuegos: la variacion de estilo entre los tres ejemplos (cinematografico, neon, pintura) permite explorar direcciones artisticas distintas para el mismo personaje sin reentrenar.
- Pruebas de vestuario y atrezzo: los prompts de ejemplo incluyen prendas concretas ("velvet cloak") y elementos de ambientacion, lo que permite iterar sobre combinaciones de vestuario y escenario.
- Generacion de material para redes sociales o campañas: al ser un adaptador pequeno (0,8 GB) sobre un modelo servido en GPU, se puede desplegar en un endpoint compartido y alternar el LoRA segun la campaña.
- Investigacion sobre personalizacion de modelos de difusion: sirve como ejemplo reproducible de flujo DreamBooth-LoRA entrenado en una variante RAW y evaluado visualmente en una variante Turbo.
- Experimentos de composicion de multiples LoRA: al cargarse con `load_lora_weights`, es candidato a pruebas de apilado con otros adaptadores, siempre que el autor del modelo base y los pesos lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres imagenes de muestra generadas con Krea 2 Turbo (8 pasos) y los prompts correspondientes; no hay FID, CLIP score, evaluacion humana ni comparacion cuantitativa con otros adaptadores.

## Requisitos de hardware

- VRAM para el adaptador: los pesos ocupan 0,8 GB en disco; la VRAM adicional en inferencia es la del adaptador mas el modelo base, y no se detalla en la informacion disponible.
- VRAM para el modelo base Krea 2: no disponible. No se especifica en el repositorio el tamano, la precision ni los requisitos del modelo krea/Krea-2-Raw o Krea-2-Turbo.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin indicar modelo de GPU.
- Compatibilidad con GPU de consumo: no verificable con los datos disponibles; depende enteramente del modelo base Krea 2, no del LoRA.
- Opciones de despliegue: diffusers es la via documentada (`Krea2Pipeline` + `load_lora_weights`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles. El unico dato operativo es que las muestras se generaron con 8 pasos de inferencia y `guidance_scale=0.0` sobre Krea 2 Turbo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables, ni datos de rendimiento que permitan establecer una comparacion cuantitativa con alternativas de la misma categoria (LoRA de personaje para Krea 2, SDXL o Flux). Tampoco se dispone de cifras del modelo base que permitan situarlo frente a otros modelos de texto a imagen.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin evaluacion externa ni resultados de benchmarks.
- Sesgos potenciales: el adaptador reproduce un concepto de personaje femenino definido por un dataset de entrenamiento no documentado; puede arrastrar sesgos de representacion (etnia, complexion, vestimenta) y reproducirlos en todas las generaciones.
- Riesgo de sobreajuste al token: al ser un LoRA DreamBooth de un unico concepto, el token `mystery_woman` puede imponer rasgos rigidos (rostro, complexion, vestuario) y reducir la diversidad de las salidas.
- Riesgo de contaminacion de estilo: el uso del token fuera de contexto puede degradar la calidad de imagenes no relacionadas con el concepto.
- Alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible en la imagen o incoherencias fisicas; el LoRA no corrige estos fallos del modelo base.
- Idiomas: no se declaran idiomas soportados; todos los prompts de ejemplo estan en ingles, por lo que el comportamiento con prompts en castellano no esta verificado.
- Licencia: el adaptador declara apache-2.0, pero los pesos derivan de krea/Krea-2-Raw. Es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales no reflejadas en la licencia del LoRA.
- Cadena de dependencias: requiere la clase `Krea2Pipeline`, disponible solo si la version de diffusers instalada la incluye; el codigo de ejemplo no fija version, lo que puede provocar fallos de reproducibilidad.
- Metadatos atipicos: las fechas de creacion y actualizacion (2026) no coinciden con el momento habitual de publicacion de este tipo de adaptadores; conviene verificarlas antes de citar el repositorio.
- Contenido generado: no se documenta ningun filtro de seguridad ni recomendacion de etiquetado para imagenes sinteticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougskullery/mystery-woman
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo citada en la model card: https://huggingface.co/krea/Krea-2-Turbo
- Muestras incluidas en el repositorio: sample_0.png, sample_1.png, sample_2.png
- Libreria de inferencia: https://github.com/huggingface/diffusers
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
