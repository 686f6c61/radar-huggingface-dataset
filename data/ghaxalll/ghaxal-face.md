# Ghaxalll/ghaxal-face

## Resumen

Ghaxalll/ghaxal-face es un adaptador LoRA (Low-Rank Adaptation) de DreamBooth entrenado sobre el checkpoint RAW de Krea 2, el modelo de generacion de imagenes texto-a-imagen desarrollado por Krea. El adaptador esta disenado para personalizar el modelo base y generar imagenes de un rostro especifico (el del autor, segun el nombre del repositorio) utilizando la palabra desencadenante `TOK`. El repositorio tiene un tamano de 1.9 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de este adaptador radica en que Krea 2 se distribuye en dos variantes: RAW (el checkpoint base sin destilar, pensado para fine-tuning) y Turbo (una version destilada en 8 pasos de inferencia para generacion rapida). La estrategia recomendada por Krea es entrenar el LoRA sobre RAW y ejecutarlo sobre Turbo, ya que los adaptadores entrenados en RAW expresan con fuerza en Turbo. Esto permite personalizar el modelo con un coste de entrenamiento reducido y una inferencia eficiente.

El adaptador se integra con la libreria diffusers mediante la clase `Krea2Pipeline`, cargando los pesos del LoRA sobre el checkpoint Turbo. La receta de inferencia recomendada es de 8 pasos sin classifier-free guidance, lo que lo hace adecuado para flujos de trabajo de generacion rapida. No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes utilizadas ni los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Krea 2 (RAW) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se procesa en ingles, segun el ejemplo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA) |
| Modelo base | krea/Krea-2-Raw (entrenamiento), krea/Krea-2-Turbo (inferencia) |
| Libreria | diffusers |
| Tamano del repositorio | 1.9 GB |

## Arquitectura y entrenamiento

El adaptador se entrena con la tecnica DreamBooth, un metodo de fine-tuning que permite personalizar modelos de difusion para generar un sujeto especifico (en este caso, un rostro) a partir de unas pocas imagenes de referencia. La arquitectura subyacente es la de Krea 2, un modelo de difusion texto-a-imagen del que no se han publicado detalles arquitectonicos completos en la informacion disponible. Krea 2 se distribuye en dos checkpoints: RAW, el modelo base sin destilar sobre el que se realiza el fine-tuning, y Turbo, una version destilada que genera imagenes de alta calidad en 8 pasos de inferencia sin classifier-free guidance.

El entrenamiento se realizo con el script de entrenamiento DreamBooth de diffusers para Krea 2, disponible en el repositorio oficial de diffusers. No se especifican en la model card el numero de pasos de entrenamiento, el dataset utilizado, el numero de imagenes de referencia ni la configuracion de hiperparametros. El adaptador se entrena sobre RAW y se ejecuta sobre Turbo, siguiendo la recomendacion de Krea de que los LoRA entrenados en RAW expresan correctamente en el checkpoint destilado.

## Capacidades

- Generacion de imagenes personalizadas: el adaptador permite generar imagenes del rostro del autor utilizando la palabra desencadenante `TOK` en el prompt.
- Personalizacion de sujeto: al ser un LoRA de DreamBooth, el modelo puede integrar el sujeto entrenado en diferentes contextos y estilos (cambios de escenario, iluminacion, composicion, etc.).
- Compatibilidad con diffusers: se integra con `Krea2Pipeline` de la libreria diffusers, lo que facilita su uso en pipelines existentes.
- Inferencia rapida: al ejecutarse sobre Krea 2 Turbo, la generacion requiere solo 8 pasos de inferencia sin guidance, lo que reduce significativamente el tiempo de calculo frente a modelos de difusion tradicionales.
- Ponderacion y fusion de LoRA: al ser un adaptador estandar de diffusers, soporta operaciones de weighting, merging y fusion con otros LoRA, segun la documentacion oficial.

## Casos de uso

- Creacion de avatar personalizado: el adaptador puede generar avatares del rostro entrenado en multiples estilos y escenarios, util para perfiles de redes sociales, foros o juegos. Se usaria cargando el LoRA sobre Krea 2 Turbo y generando imagenes con el prompt `TOK` acompanado de descriptores de estilo.
- Contenido para marca personal: un creador de contenido puede utilizar el adaptador para generar imagenes consistentes de su rostro para material promocional, portadas de video o publicaciones en redes, manteniendo una identidad visual uniforme.
- Prototipado de diseno: en diseno grafico o publicidad, el adaptador permite generar rapidamente variaciones de un rostro en diferentes contextos (ropa, fondo, iluminacion) para evaluar conceptos visuales sin necesidad de sesiones fotograficas.
- Ilustracion y arte digital: artistas pueden combinar el LoRA con otros adaptadores o estilos para integrar el rostro entrenado en ilustraciones, comics o piezas de arte digital, aprovechando la fusion de LoRA que soporta diffusers.
- Generacion de retratos en lote: al ser un LoRA ligero, puede cargarse en pipelines de generacion por lotes para producir multiples variaciones de retratos del sujeto, util en estudios de casting o exploracion de diseno.
- Evaluacion de modelos de difusion: desarrolladores que trabajen con Krea 2 pueden utilizar este adaptador como caso de prueba para validar el flujo de entrenamiento DreamBooth y la compatibilidad RAW-Turbo en sus propios pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre FID, CLIP score, ni comparaciones con otros adaptadores o modelos de personalizacion.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (1.9 GB en el repositorio, aunque el archivo de pesos safetensors del LoRA suele ser de decenas a cientos de MB), pero requiere ejecutarse sobre el modelo base Krea 2 Turbo, que es un modelo de difusion de gran tamano.
- VRAM estimada: no disponible en la informacion proporcionada. Como referencia, los modelos de difusion de tamano similar (del orden de 1-2 mil millones de parametros) suelen requerir entre 8 y 16 GB de VRAM en precision bfloat16 para inferencia.
- GPU recomendadas: no se especifican. Se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A100, H100) para una generacion comoda en bfloat16.
- El ejemplo de uso carga el pipeline en CUDA con `torch.bfloat16`, lo que sugiere que se necesita una GPU compatible con bfloat16 (Ampere o posterior).
- Opciones de despliegue: al usar diffusers, el adaptador puede ejecutarse con vLLM (si soporta Krea 2), TGI, o directamente con el pipeline de diffusers en un script Python. Tambien es posible exportar a otros formatos si la comunidad los desarrolla.
- Latencia y throughput: no disponibles. La receta de 8 pasos sin guidance reduce el tiempo de inferencia frente a modelos de 20-50 pasos, pero el rendimiento exacto depende del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros adaptadores LoRA de personalizacion facial. Como referencia general, los adaptadores DreamBooth LoRA existen para otros modelos de difusion como Stable Diffusion (SD 1.5, SDXL) o Flux, con caracteristicas similares: entrenamiento sobre un checkpoint base, ejecucion sobre checkpoints destilados o turbo, y uso de una palabra desencadenante. Sin embargo, no se dispone de datos comparativos de rendimiento, calidad de imagen o requisitos de hardware entre estos adaptadores y el presente.

| Modelo | Base | Formato | Licencia | Palabra desencadenante |
|---|---|---|---|---|
| Ghaxalll/ghaxal-face | Krea 2 (RAW/Turbo) | LoRA safetensors | Apache 2.0 | TOK |
| LoRA DreamBooth para SDXL (ejemplos tipicos) | SDXL | LoRA safetensors | Varía (comunmente Apache 2.0 o CreativeML) | Personalizada |
| LoRA DreamBooth para Flux | Flux | LoRA safetensors | Varía | Personalizada |

## Limitaciones y advertencias

- Sesgos y limitaciones del modelo base: Krea 2, como cualquier modelo de generacion de imagenes, puede reflejar sesgos presentes en sus datos de entrenamiento. No se dispone de informacion especifica sobre los sesgos de Krea 2.
- Riesgo de alucinacion visual: los modelos de difusion pueden generar artefactos o distorsiones, especialmente en rostros, manos o texturas complejas. La calidad depende del prompt y del numero de pasos.
- Sobreajuste al sujeto: al ser un LoRA de DreamBooth entrenado probablemente con pocas imagenes, el modelo puede sobreajustarse al rostro del autor y producir resultados menos variados o con menor fidelidad en contextos muy diferentes a los de entrenamiento.
- Dependencia de la palabra desencadenante: el adaptador solo se activa cuando se incluye `TOK` en el prompt. Sin ella, el modelo base se comporta como Krea 2 sin personalizar.
- Datos de entrenamiento desconocidos: no se especifica el dataset utilizado, el numero de imagenes ni los pasos de entrenamiento, lo que dificulta evaluar la robustez del adaptador.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base Krea 2 puede tener su propia licencia que debe verificarse antes de un despliegue comercial.
- Sin benchmarks publicados: no hay metricas objetivas que permitan comparar la calidad de este adaptador con alternativas.
- Mantenimiento y soporte: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin soporte activo de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ghaxalll/ghaxal-face
- Documentacion de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Script de entrenamiento DreamBooth para Krea 2: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Sitio de DreamBooth: https://dreambooth.github.io/
