# kirusanth08/kn1febrush-flux-style-lora

## Resumen

El modelo `kirusanth08/kn1febrush-flux-style-lora` es un adaptador LoRA de estilo para el modelo base `black-forest-labs/FLUX.1-dev`, desarrollado por el usuario kirusanth08. Se trata de un ajuste fino ligero que permite transferir un estilo visual concreto de ilustración de personajes a las generaciones de FLUX.1-dev, sin necesidad de modificar los pesos del modelo base. El adaptador fue entrenado sobre un conjunto curado de 14 imágenes de referencia y se activa mediante el token `kn1febrush` en el prompt.

La relevancia de este modelo radica en que ofrece un control fino del estilo con una inversión de entrenamiento muy baja. Al ser un LoRA, el repositorio contiene únicamente los pesos del adaptador (0.5 GB), lo que facilita su integración en flujos de trabajo de ComfyUI. El autor incluye además los datos de entrenamiento, las captions y las muestras de salida por checkpoint, lo que hace el proceso reproducible y permite seleccionar el checkpoint intermedio con mejor comportamiento, evitando el sobreajuste típico de los LoRA de estilo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.1-dev (modelo de difusión de flujo basado en transformer) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica únicamente a la red UNet de FLUX.1-dev. FLUX.1-dev es un modelo de difusión de flujo con arquitectura transformer, condicionado por texto mediante codificadores de texto (T5 y CLIP). El LoRA se entrena con la dimensión de rango `dim 24` y `alpha 24`, lo que limita el número de parámetros añadidos y reduce el riesgo de desviar demasiado el modelo base.

El entrenamiento se realizó con los scripts de kohya sd-scripts (`flux_train_network.py`). Se usaron 2000 pasos con batch de 1, optimizador AdamW 8-bit, tasa de aprendizaje 1e-4 y scheduler `constant_with_warmup` con 40 pasos de calentamiento. Se empleó precisión `--fp8_base` y gradient checkpointing. Otros ajustes incluyen `timestep_sampling shift`, `discrete_flow_shift 3.1582`, `model_prediction_type raw` y `guidance_scale 1.0`. El entrenamiento se realizó a resolución base de 1024 píxeles con aspect-ratio bucketing.

La innovación técnica destacable es el método de captioning. Las captions describen exclusivamente el contenido de la imagen (quién es el personaje, qué lleva, qué hace), sin incluir palabras de estilo. Todo lo que es constante en el conjunto de entrenamiento y no aparece en las captions colapsa en el token trigger compartido, lo que produce un estilo fuerte y controlable. Según el autor, incluir palabras de estilo en las captions dispersa el estilo en palabras comunes y debilita el LoRA.

## Capacidades

- Generación de imágenes con estilo de ilustración de personajes a partir de descripciones de texto.
- Activación del estilo mediante el token trigger `kn1febrush` en el prompt.
- Control de la intensidad del estilo a través de la fuerza del LoRA: con 0.6 se conserva el aspecto suave del modelo base; entre 0.8 y 1.0 se obtiene el rango de uso recomendado; por encima de 1.0 pueden reaparecer sujetos y poses del conjunto de entrenamiento.
- Inclusión de checkpoints intermedios en el repositorio, lo que permite comparar y seleccionar el checkpoint con mejor resultado, dado que los LoRA de estilo tienden a sobreajustar.
- Reproducibilidad completa: el repositorio contiene el dataset de entrenamiento, las captions y las muestras generadas por checkpoint con la configuración de generación registrada.
- Integración nativa con ComfyUI mediante `UNETLoader` y `LoraLoaderModelOnly`.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades de visión o audio al ser un adaptador de difusión.

## Casos de uso

- Diseño de concept art para personajes: el modelo permite generar ilustraciones de cuerpo completo de personajes ficticios siguiendo un estilo visual coherente. Se usaría en ComfyUI con el prompt `kn1febrush, a full body character illustration of <SUBJECT>, ` y una fuerza del LoRA de 0.8 a 1.0.
- Creación de avatares estilizados para perfiles digitales: gracias al control de intensidad, se pueden obtener retratos con un estilo marcado pero sin perder la fidelidad al sujeto descrito.
- Prototipado de personajes para videojuegos: el LoRA permite generar rápidamente variaciones de un mismo personaje manteniendo la coherencia estilística, útil en fases tempranas de diseño.
- Ilustración de cómics y novelas visuales: el estilo uniforme del LoRA facilita la generación de viñetas con personajes consistentes en apariencia y acabado.
- Personalización de pipelines de generación en ComfyUI: al ser un LoRA ligero, se puede integrar en flujos de trabajo existentes sin necesidad de reentrenar el modelo base, permitiendo alternar estilos con distintos adaptadores.
- Investigación en adaptación de estilo con LoRA: el repositorio incluye el dataset y las captions, lo que lo convierte en un caso de estudio útil para analizar el efecto del captioning en el colapso del estilo en el token trigger.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan datos de VRAM específicos para el LoRA. Los requisitos de hardware son los del modelo base FLUX.1-dev, más la sobrecarga del adaptador. En la práctica, FLUX.1-dev requiere una GPU con suficiente memoria para inferencia de difusión a 1024 píxeles, típicamente 24 GB o más en FP16.
- El entrenamiento se realizó con `--fp8_base`, lo que reduce el consumo de memoria durante el ajuste fino, pero no se indica si la inferencia requiere el mismo modo.
- Opciones de despliegue: el modelo está documentado para su uso en ComfyUI, mediante los nodos `UNETLoader` y `LoraLoaderModelOnly`. No se mencionan otros entornos de despliegue como vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparables en la información proporcionada. El repositorio del mismo autor `kirusanth08/art-lora-flux1-dev` es otro LoRA de estilo para FLUX.1-dev, pero no se incluyen especificaciones ni benchmarks que permitan una comparación técnica. La colección `XLabs-AI/flux-lora-collection` reúne múltiples LoRA de FLUX, pero no se han extraído métricas concretas de esos modelos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con solo 14 imágenes de referencia, lo que aumenta el riesgo de sobreajuste. El propio autor advierte que los LoRA de estilo sobreajustan y que el mejor checkpoint no suele ser el último.
- Una fuerza del LoRA superior a 1.0 puede provocar que reaparezcan sujetos y poses del conjunto de entrenamiento, lo que limita la libertad creativa en ese rango.
- La licencia del repositorio se indica como `other`, lo que implica que se deben revisar los términos específicos antes de cualquier uso comercial o redistribución.
- El modelo base FLUX.1-dev tiene su propia licencia, que puede imponer restricciones adicionales al uso del adaptador en producción.
- No hay información sobre sesgos, limitaciones idiomáticas o riesgos de alucinación, al tratarse de un modelo de generación de imágenes y no de texto.
- No se ofrecen datos sobre el rendimiento en tareas de razonamiento, código o matemáticas, ya que el modelo no está diseñado para esos fines.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kirusanth08/kn1febrush-flux-style-lora
- Otro LoRA del mismo autor: https://huggingface.co/kirusanth08/art-lora-flux1-dev
- Colección de LoRA de FLUX de XLabs-AI: https://huggingface.co/XLabs-AI/flux-lora-collection
