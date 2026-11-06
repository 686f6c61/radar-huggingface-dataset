# lordfarquaad36/evy

## Resumen

Evy es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, publicado por el usuario lordfarquaad36 en Hugging Face. El adaptador se entrena sobre los pesos de Krea 2 RAW y esta pensado para ser utilizado tanto sobre ese checkpoint base como sobre la variante destilada Krea 2 Turbo. Su funcion es inyectar un concepto visual concreto, activado mediante el token disparador `vgl woman`, que el autor asocia a un rostro o identidad concreta (la model card original lo vincula a gallium422/emma-vigeland).

El repositorio es muy ligero (0,8 GB), lo que es coherente con un adaptador LoRA y no con un modelo completo. Se distribuye bajo licencia Apache 2.0 y en formato compatible con la libreria diffusers. No se especifican idiomas soportados, parametros totales ni longitud de contexto, ya que no se trata de un modelo de lenguaje sino de un modulo de personalizacion visual sobre un modelo de difusion.

Su relevancia es practica: permite a desarrolladores y artistas reutilizar un modelo base de alta calidad (Krea 2) y anadirle una identidad o estilo concreto sin reentrenar el modelo completo, reduciendo coste computacional y manteniendo la licencia permisiva del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin contexto textual medible) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 segun el ejemplo de la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | compatible con diffusers (pesos LoRA); no se especifica safetensors ni GGUF |
| Modelo base | krea/Krea-2-Raw (y compatible con krea/Krea-2-Turbo) |
| Token disparador | `vgl woman` |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la tecnica DreamBooth sobre el checkpoint Krea 2 RAW. La model card indica explicitamente que el entrenamiento se realizo sobre Krea 2 RAW y que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. No se detalla el numero de imagenes de entrenamiento, la resolucion, el rango del LoRA, la tasa de aprendizaje ni la composicion del dataset; toda esa informacion figura como no disponible.

La innovacion tecnica relevante no esta en el adaptador en si, sino en su compatibilidad con el pipeline `Krea2Pipeline` de diffusers y con la inferencia destilada de pocos pasos (8 pasos) de Krea 2 Turbo. Esto permite desplegar el concepto personalizado con latencias bajas en GPUs de consumo, siempre que se disponga del checkpoint base correspondiente.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `vgl woman`.
- Personalizacion de identidad o concepto visual (DreamBooth) sobre el modelo base Krea 2.
- Compatibilidad con el pipeline `Krea2Pipeline` de la libreria diffusers.
- Funcionamiento tanto sobre Krea 2 RAW como sobre Krea 2 Turbo.
- Inferencia rapida en Turbo con 8 pasos y `guidance_scale=0.0`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modulo de generacion visual.

## Casos de uso

- Produccion de retratos consistentes de un personaje: usar `vgl woman` en el prompt para mantener la misma identidad a lo largo de una serie de ilustraciones, gracias a la naturaleza DreamBooth del adaptador.
- Storyboarding y conceptual art: generar escenas cinematograficas (por ejemplo, la muestra cyberpunk de la model card) combinando el token con descripciones de entorno, iluminacion y vestuario.
- Ilustracion editorial y de moda: aplicar el concepto sobre estilos pictoricos (oleo, acuarela) como en la muestra del jardin toscano, manteniendo coherencia de sujeto.
- Prototipado rapido en pipelines de difusion: cargar el LoRA sobre Krea 2 Turbo con 8 pasos para iterar variaciones en segundos en una GPU de consumo.
- Integracion en aplicaciones creativas con diffusers: el snippet de la model card permite incorporar el adaptador en scripts Python y servicios de generacion de imagenes.
- Generacion de material promocional o de marca personal: reutilizar una identidad visual concreta en campanas, avatares o assets graficos bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del checkpoint base Krea 2 (RAW o Turbo), no del adaptador, que anade una sobrecarga minima.
- El ejemplo oficial carga el pipeline en `torch.bfloat16` sobre `cuda`, lo que sugiere el uso de GPU con soporte bfloat16 (Ampere o superior).
- GPU recomendadas: no disponibles en la informacion proporcionada; por compatibilidad con bfloat16 se puede inferir el uso de A100, H100 o RTX 4090, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la model card; el uso de Turbo con 8 pasos sugiere viabilidad en GPUs de gama alta de consumo, sin datos concretos.
- Opciones de despliegue: diffusers (`Krea2Pipeline` + `load_lora_weights`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion o no documentados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos del concepto entrenado; al tratarse de una identidad concreta, puede reproducir sesgos de las imagenes de entrenamiento.
- Riesgo de sobreajuste al concepto: el token `vgl woman` puede dominar el prompt y reducir la diversidad de las generaciones.
- No se especifican idiomas soportados; los prompts de ejemplo estan en ingles.
- La licencia del adaptador es Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La model card original hace referencia a `gallium422/emma-vigeland` en el titulo, lo que sugiere un posible reempaquetado o fork; conviene verificar la procedencia antes de usarlo en produccion.
- No hay informacion sobre resolucion de entrenamiento, numero de imagenes ni rango LoRA, lo que dificulta reproducir o ajustar el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/lordfarquaad36/evy
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Referencia citada en la model card: https://huggingface.co/gallium422/emma-vigeland
