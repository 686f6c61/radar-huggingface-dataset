# AiMamis/Kendi

## Resumen

Kendi es un adaptador LoRA de generación de imágenes a partir de texto, publicado por el usuario AiMamis en Hugging Face. Se distribuye mediante la librería diffusers y la plantilla `template:diffusion-lora`, por lo que está pensado para cargarse sobre el modelo base `krea/Krea-2-Turbo` y modificar su comportamiento generativo mediante un conjunto reducido de pesos adicionales. El repositorio ocupa 0,5 GB e incluye el identificador de disparo `Kendi`, junto con los descriptores `Brunette hair`, `Black skin` y `Blue eye color`, que el autor indica como palabras de activación del estilo o del sujeto aprendido.

El modelo no es un modelo de lenguaje ni un sistema multimodal de propósito general: es un adaptador de difusión especializado en la síntesis de imágenes. Su relevancia actual es limitada y debe contextualizarse: el repositorio se creó el 19 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 «likes», sin model card extendida, sin ejemplos documentados de entrenamiento y sin métricas publicadas. Se trata, por tanto, de una publicación muy reciente y sin validación comunitaria.

La información disponible no permite confirmar la arquitectura interna del modelo base, el número de parámetros del adaptador, la resolución nativa de generación ni la composición del dataset de entrenamiento. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a páginas de ayuda de cuentas de Google y a hilos de foro sobre problemas de inicio de sesión en GMX, sin relación alguna con Kendi. Todo dato no presente en la model card o en los metadatos del repositorio se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un modelo de difusión text-to-image. Plantilla declarada: `template:diffusion-lora`. Arquitectura interna del modelo base `krea/Krea-2-Turbo`: no disponible |
| Parametros totales | no disponible (tamaño del repositorio: 0,5 GB, que puede incluir pesos del adaptador y ficheros de previsualización) |
| Longitud de contexto | no aplica (modelo text-to-image, sin contexto conversacional). Longitud máxima de prompt admitida: no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible. Las etiquetas de activación de la model card están en inglés |
| Licencia | openrail++ |
| Formato de pesos | no disponible. El pipeline declarado es `diffusers` con plantilla `diffusion-lora`, que habitualmente distribuye pesos en safetensors cargables vía PEFT |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura del adaptador en la información disponible. Por las etiquetas del repositorio (`lora`, `template:diffusion-lora`, `base_model:krea/Krea-2-Turbo`), se trata de un ajuste de bajo rango aplicado sobre un modelo de difusión preentrenado, de modo que la generación final la realiza el modelo base y el LoRA únicamente desplaza la distribución aprendida hacia el sujeto o estilo objetivo. El autor no documenta el rango del adaptador, las capas afectadas, el número de pasos de entrenamiento, el learning rate ni el hardware utilizado.

Tampoco hay información sobre el dataset de entrenamiento: no se indica el número de imágenes, su resolución, la procedencia, si hubo curación manual ni si se emplearon técnicas de regularización como caption dropout o entrenamiento con clases previas. El `instance_prompt` declarado es `Kendi, Brunette hair, Black skin, Blue eye color`, lo que sugiere que el adaptador se entrenó para reproducir un sujeto concreto con esos atributos físicos, pero no se especifica si se aplicaron técnicas de refuerzo por preferencias humanas, ajuste por DPO ni ningún otro método de alineación, algo poco habitual en el ámbito de los LoRA de difusión.

## Capacidades

- Generación de imágenes text-to-image mediante el pipeline de diffusers, condicionada por el prompt de texto.
- Activación de un sujeto o estilo concreto mediante la palabra clave `Kendi`.
- Modulación de atributos físicos mediante las etiquetas `Brunette hair`, `Black skin` y `Blue eye color`.
- Integración como adaptador sobre el modelo base `krea/Krea-2-Turbo`, sin necesidad de reentrenar el modelo completo.
- No dispone de soporte de tool calling ni de function calling: no es un modelo de lenguaje.
- No dispone de modo de razonamiento multi-paso ni de capacidades de agente.
- No dispone de capacidades de visión como entrada (image-to-image, edición o comprensión de imágenes) documentadas en la información disponible.
- No dispone de capacidades de audio, vídeo, código ni matemáticas.
- Soporte multilingüe del prompt: no disponible.

## Casos de uso

- Generación de retratos de personaje consistente: usar la palabra clave `Kendi` junto con los descriptores de atributos para producir variaciones del mismo sujeto en distintas poses, iluminaciones y encuadres, útil para previsualizar un personaje antes de encargar un modelo 3D o un arte final.
- Ilustración editorial y de prensa: generar imágenes de acompañamiento con un personaje recurrente que mantenga rasgos coherentes entre piezas de una misma serie, siempre que la licencia openrail++ y la licencia del modelo base lo permitan.
- Previsualización de conceptos para videojuegos o animación: producir bocetos de personaje en distintos vestuarios y entornos para validar dirección artística antes de invertir en producción, aprovechando que el adaptador es ligero y se puede intercambiar rápidamente.
- Diseño de avatares y material de perfil: creación de imágenes de identidad visual para comunidades, foros o proyectos personales, con control de los atributos físicos mediante los tokens de activación.
- Prototipado de campañas de moda o estilismo: generar variaciones de un mismo sujeto con distintos estilismos para explorar direcciones creativas sin sesión fotográfica.
- Pruebas de reproducibilidad de pipelines de difusión: dado que el repositorio es pequeño y público, sirve como caso de estudio para verificar la carga de LoRA con diffusers y PEFT en un entorno controlado, comparando la salida con y sin adaptador.
- Aumento de datos sintéticos con control de atributos demográficos: generación de imágenes etiquetadas para experimentos de visión por computador, siempre que se documente el origen sintético de los datos y se revise el sesgo introducido por las palabras de activación.
- Investigación sobre sesgos en modelos generativos: el uso de descriptores raciales y de color de ojos como tokens de activación lo convierte en un caso útil para estudiar cómo los LoRA amplifican o atenúan estereotipos presentes en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, comparativas de similitud con el sujeto de referencia ni ningún otro tipo de evaluación cuantitativa o cualitativa. Tampoco hay métricas de velocidad de inferencia ni de consumo de memoria asociadas al adaptador.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al ser un LoRA, el requisito dominante es el del modelo base `krea/Krea-2-Turbo`, cuyas especificaciones no se detallan en la información proporcionada. El adaptador en sí añade una sobrecarga marginal, coherente con un repositorio de 0,5 GB.
- GPU recomendadas: no disponible. No se puede concretar sin conocer la arquitectura y el tamaño del modelo base.
- Compatibilidad con GPU de consumo: no disponible. Depende íntegramente del modelo base; con los datos actuales no es posible afirmar si cabe en una RTX 4090, 4080 o similar.
- Opciones de despliegue: el pipeline declarado es `diffusers`, lo que permite cargar el adaptador con las utilidades de LoRA/PEFT de la librería. También es integrable en interfaces gráficas que consumen LoRA de diffusers, como ComfyUI o las distribuciones basadas en Automatic1111/Forge, siempre que soporten el modelo base. No hay confirmación del autor sobre compatibilidad con llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se han publicado tiempos por imagen, pasos de muestreo empleados ni resolución de trabajo.
- Almacenamiento: el repositorio ocupa 0,5 GB en disco, además del espacio requerido por el modelo base.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros LoRA entrenados sobre `krea/Krea-2-Turbo` ni sobre sus métricas, licencias o disponibilidad, por lo que no es posible establecer una comparación rigurosa. Tampoco se han podido identificar alternativas de la misma categoría a partir de la búsqueda web realizada, que no devolvió resultados relacionados con este modelo.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 «likes» en el momento de la consulta, sin ejemplos de terceros que corroboren la calidad o la estabilidad del adaptador.
- Model card mínima: solo se documentan las palabras de activación y el procedimiento de descarga. No hay información sobre el dataset, el proceso de entrenamiento ni las condiciones de uso previstas.
- Riesgo de sesgo y estereotipia: las palabras de activación incluyen atributos raciales (`Black skin`) y físicos (`Brunette hair`, `Blue eye color`), lo que puede producir representaciones homogeneizadas o estereotipadas del sujeto, además de arrastrar los sesgos del modelo base y de los datos de entrenamiento no documentados.
- Alucinación visual: como cualquier modelo generativo de imágenes, puede producir anatomías incorrectas, manos deformadas, coherencia deficiente entre prompt y resultado, y artefactos en detalles finos.
- Dependencia del modelo base: el comportamiento final, la resolución de salida y las capacidades reales dependen de `krea/Krea-2-Turbo`. Cualquier limitación o cambio de licencia de ese modelo afecta directamente a este adaptador.
- Licencia openrail++: permite uso comercial con condiciones, pero impone restricciones que deben revisarse antes de desplegar el modelo en producción. Es obligatorio leer el texto completo de la licencia y comprobar su compatibilidad con la licencia del modelo base.
- Riesgo de suplantación: un LoRA entrenado sobre un sujeto concreto puede emplearse para generar imágenes de una persona identificable. Es responsabilidad del usuario verificar que existe consentimiento y que el uso cumple la normativa aplicable en materia de imagen y protección de datos.
- Idiomas del prompt: no disponibles. La única evidencia disponible apunta a prompts en inglés, y no se puede garantizar el comportamiento con prompts en castellano.
- Fecha de publicación atípica: los metadatos indican creación y actualización el 19 de septiembre de 2026, con apenas seis segundos de diferencia entre ambos campos, lo que sugiere una subida automatizada o sin revisión posterior.
- Sin garantías de mantenimiento: el autor no ha publicado actualizaciones, documentación adicional ni canales de soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AiMamis/Kendi
- Pestaña de ficheros y versiones: https://huggingface.co/AiMamis/Kendi/tree/main
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Turbo
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo. Los resultados recuperados corresponden a páginas de soporte de cuentas de Google y a hilos de foro sobre inicios de sesión en GMX, sin relación con Kendi, krea/Krea-2-Turbo ni con LoRA de difusión.
