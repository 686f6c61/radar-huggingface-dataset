# iamsmrk/lyr4

## Resumen

lyr4 es un adaptador LoRA de texto a imagen publicado por el usuario iamsmrk en Hugging Face. Se trata de un ajuste fino ligero sobre el modelo base krea/Krea-2-Raw, un modelo de difusion de la familia Krea 2, y su proposito declarado es generar imagenes que representen al personaje "Lyra Hale" a partir de la palabra de activacion `lyr4`. El repositorio ocupa 2,3 GB y se distribuye bajo licencia Apache 2.0.

El modelo resuelve un problema acotado: la personalizacion de un modelo de difusion generico para producir de forma consistente un sujeto concreto, sin necesidad de reentrenar el modelo completo. Al ser un LoRA, los pesos son un delta de bajo rango que se carga junto al modelo base mediante la libreria diffusers, lo que reduce los requisitos de almacenamiento y permite combinarlo con otras tecnicas de generacion.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de personalizacion de personaje, no de un modelo fundacional. No hay informacion publicada sobre el dataset de entrenamiento, el rango del LoRA, el numero de pasos ni resultados de evaluacion. La model card es minima y se limita a indicar la palabra de activacion y el procedimiento de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion (base: krea/Krea-2-Raw) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a texto a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se procesa con el codificador de texto del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de diffusers; no confirmado de forma explicita en la model card) |

## Arquitectura y entrenamiento

lyr4 es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre krea/Krea-2-Raw, un modelo de difusion texto a imagen. La tecnica LoRA congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas, de modo que el adaptador aprende un desplazamiento de los pesos orientado a un concepto o identidad concreta. El resultado se carga en diffusers como un adaptador adicional sobre el pipeline del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento (numero de imagenes, resolucion, composicion), el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas de regularizacion o captions automaticos. Tampoco se documenta si el entrenamiento uso el instance prompt `lyr4` de forma exclusiva o si se combinaron palabras de activacion. Toda esta informacion figura como no disponible.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por el prompt, heredando las capacidades del modelo base Krea-2-Raw.
- Personalizacion de identidad: el token `lyr4` activa la representacion del personaje "Lyra Hale" aprendida durante el ajuste.
- Composicion con el modelo base: al ser un LoRA, puede cargarse y descargarse del pipeline sin alterar los pesos originales.
- Compatibilidad con la libreria diffusers para carga de adaptadores.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.
- Capacidades multilingues: no documentadas; dependen del codificador de texto del modelo base.

## Casos de uso

- Generacion de ilustraciones de personaje consistente: usar el token `lyr4` en el prompt para producir variaciones de Lyra Hale en distintas poses, encuadres e iluminaciones, manteniendo rasgos reconocibles entre generaciones.
- Prototipado de arte conceptual: generar rapidamente bocetos de un personaje para un proyecto de narrativa visual o videojuego antes de encargar arte final.
- Creacion de avatares y retratos: producir imagenes de perfil o retratos del personaje para comunidades, foros o redes, controlando el estilo mediante el prompt y el modelo base.
- Ilustracion de ficcion amateur: acompanar relatos o fan fiction con imagenes coherentes del personaje sin disponer de un ilustrador.
- Pruebas de pipelines de difusion: servir como caso de prueba para validar la carga de adaptadores LoRA sobre Krea-2-Raw en entornos diffusers, ComfyUI o similares.
- Experimentacion con mezcla de adaptadores: combinar lyr4 con otros LoRA de estilo sobre el mismo modelo base para explorar variaciones esteticas del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea-2-Raw y de la precision de carga (fp16, bf16, fp8). El adaptador en si anade una sobrecarga minima.
- GPU recomendadas: no disponible. Al tratarse de un LoRA sobre un modelo de difusion, los requisitos vienen determinados por el modelo base; en general los modelos de difusion de imagen de gran tamano requieren GPUs con memoria suficiente para el pipeline completo.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de las optimizaciones aplicadas (por ejemplo, offloading o cuantizacion del UNet/transformer).
- Opciones de despliegue: diffusers (libreria declarada en las etiquetas), y potencialmente ComfyUI u otras interfaces que admitan carga de LoRA en formato diffusers o safetensors, siempre que soporten el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre otros LoRA de personaje sobre Krea-2-Raw ni de datos de rendimiento que permitan una comparacion rigurosa. La comparacion con otros adaptadores de la misma categoria requeriria datos de evaluacion que no se han publicado.

## Limitaciones y advertencias

- Model card minima: no se documentan dataset, hiperparametros ni evaluacion, lo que dificulta reproducir o auditar el entrenamiento.
- Riesgo de sobreajuste al concepto: al ser un LoRA de identidad, puede reproducir poses, encuadres o estilos presentes en las imagenes de entrenamiento y perder flexibilidad ante prompts muy distintos.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible o artefactos, especialmente en composiciones complejas.
- Sesgos: no documentados; el adaptador hereda los sesgos del modelo base y los del dataset de entrenamiento, que no se describe.
- Idiomas: no se especifica el soporte multilingue de los prompts; depende del codificador de texto del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Krea-2-Raw y los derechos sobre la identidad representada, ya que el personaje podria estar sujeto a derechos de terceros.
- Uso en produccion: sin datos de calidad ni de estabilidad, no se recomienda desplegarlo en produccion sin una evaluacion previa propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamsmrk/lyr4
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Libreria diffusers: https://github.com/huggingface/diffusers
