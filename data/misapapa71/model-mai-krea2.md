# misapapa71/model-mai-krea2

## Resumen

`misapapa71/model-mai-krea2` es un LoRA de DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario de Hugging Face `misapapa71`. El adaptador se entrena sobre los pesos de `krea/Krea-2-Raw` y se utiliza en inferencia sobre `krea/Krea-2-Turbo`, la variante destilada de Krea 2 que permite generar imagenes en pocos pasos (8 en los ejemplos publicados). Su proposito es inyectar un concepto concreto, activado mediante el token `model-Akane-Krea2`, en el pipeline de generacion de imagenes.

El repositorio es de tipo `diffusers` con plantilla `sd-lora`, pesa 1.0 GB y se distribuye bajo licencia Apache 2.0. Se trata de un adaptador de bajo rango, no de un modelo base: no contiene pesos de un transformer de difusion completo, sino las matrices de actualizacion que se cargan sobre Krea 2 mediante `load_lora_weights` en la API de diffusers.

La relevancia de esta ficha es acotada: el modelo tiene 21 descargas y 0 likes en el momento de la consulta, y la informacion publicada se limita a la model card con tres prompts de ejemplo. No se han publicado especificaciones tecnicas detalladas, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de diffusers (repositorio de 1.0 GB, formato exacto no especificado) |

## Arquitectura y entrenamiento

El adaptador se entrena con DreamBooth-LoRA sobre `krea/Krea-2-Raw`, segun indica la model card. DreamBooth es una tecnica de personalizacion que asocia un token raro (aqui `model-Akane-Krea2`) a un concepto concreto a partir de un conjunto reducido de imagenes de referencia, y LoRA restringe el ajuste a matrices de bajo rango para reducir el coste de almacenamiento y entrenamiento. El resultado se aplica en inferencia sobre `krea/Krea-2-Turbo`, la variante de Krea 2 orientada a generacion con pocos pasos.

No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, el rango del LoRA, la tasa de aprendizaje ni la composicion del dataset. Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, prior preservation o aumentos de datos. La model card solo indica que las muestras se generaron sobre Turbo con 8 pasos y `guidance_scale=0.0`.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `model-Akane-Krea2`, que activa el concepto aprendido.
- Personalizacion de un sujeto o estilo concreto dentro del espacio latente de Krea 2, sin reentrenar el modelo base.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers y con la carga de pesos LoRA mediante `pipe.load_lora_weights`.
- Inferencia en pocos pasos sobre `krea/Krea-2-Turbo` (los ejemplos usan 8 pasos y `guidance_scale=0.0`).
- Composicion de escenas complejas: los prompts de ejemplo describen armadura futurista en una ciudad ciberpunk bajo la lluvia, un retrato en un olivar toscano y una editorial de moda en un salon Art Deco.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, ya que no aplican a un adaptador de generacion de imagenes.

## Casos de uso

- Produccion de retratos consistentes de un personaje: el token `model-Akane-Krea2` permite mantener la identidad del sujeto a traves de multiples prompts y escenas, util para storyboards, comics o ilustracion editorial.
- Generacion de variaciones de vestuario y entorno: los ejemplos de la model card muestran el mismo concepto en contextos muy distintos (ciberpunk, olivar toscano, salon Art Deco), lo que sirve para explorar direcciones de arte.
- Creacion de material promocional o de marca personal: un estudio pequeno puede entrenar un LoRA sobre un modelo base y reutilizarlo en campanas con coherencia visual.
- Prototipado rapido de conceptos visuales en pipelines de diseno: al integrarse en diffusers, el adaptador se puede encadenar con otros LoRA y con el pipeline Turbo para iterar en segundos.
- Investigacion sobre personalizacion con DreamBooth: el repositorio sirve como ejemplo reproducible de entrenamiento de un LoRA sobre Krea 2 Raw y su uso sobre Turbo.
- Pruebas de evaluacion de fidelidad de concepto: comparar la salida con y sin el adaptador para medir cuanto retiene el concepto y cuanto interfiere con el prompt base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de concepto, etc.) ni comparaciones con otros LoRA o modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2, no del LoRA, que solo anade un pequeno conjunto de pesos.
- GPU recomendadas: no disponible. La model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que sugiere una GPU con soporte de bfloat16 (Ampere o posterior).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende de los requisitos de Krea 2 Turbo.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights`; no se documentan otras alternativas (ComfyUI, Automatic1111, etc.).
- Latencia y throughput: no disponibles. Los ejemplos usan 8 pasos de inferencia con `guidance_scale=0.0`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA o adaptadores comparables para Krea 2, ni datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay datos de entrenamiento, hiperparametros ni evaluacion cuantitativa, lo que dificulta reproducir o auditar el adaptador.
- El concepto aprendido esta ligado al token `model-Akane-Krea2`; sin ese token en el prompt, el efecto del LoRA puede no activarse o degradarse.
- Riesgo de sobreajuste al conjunto de entrenamiento: al ser un DreamBooth-LoRA sin datos publicos, no se puede descartar que el concepto se imponga sobre el prompt y reduzca la diversidad de las salidas.
- Los prompts de ejemplo estan en ingles; no se documenta el comportamiento con prompts en castellano ni en otros idiomas.
- La licencia Apache 2.0 del adaptador no cubre necesariamente los pesos del modelo base (`krea/Krea-2-Raw` y `krea/Krea-2-Turbo`), cuyas condiciones deben verificarse por separado antes de un uso comercial.
- El repositorio tiene 21 descargas y 0 likes, sin senales de validacion por parte de la comunidad; conviene tratar las muestras de la model card como unica evidencia cualitativa.
- No se documentan sesgos conocidos del adaptador; los sesgos heredados del modelo base Krea 2 no estan descritos en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/misapapa71/model-mai-krea2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de diffusers sobre carga de LoRA: no disponible en la informacion proporcionada
- Paper o blog de Krea 2: no disponible en la informacion proporcionada
