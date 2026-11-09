# Omoshiroihs2/r4yne

## Resumen

r4yne es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Omoshiroihs2 y publicado en Hugging Face. El adaptador se entrena sobre los pesos de Krea 2 RAW (krea/Krea-2-Raw) y sus muestras de ejemplo se generan con la variante Krea 2 Turbo en 8 pasos de inferencia. Su funcion es introducir un concepto personalizado, invocado mediante el token `r4yne`, en las generaciones del modelo base sin necesidad de reentrenar el modelo completo.

El repositorio ocupa 1,0 GB, lo que es coherente con un adaptador LoRA de rango bajo para un modelo de difusion de gran tamano, y se distribuye bajo licencia Apache 2.0. La model card es muy escueta: no documenta el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni hiperparametros como la tasa de aprendizaje. Las unicas referencias tecnicas son el prompt de instancia (`r4yne`), la indicacion de que se entreno con DreamBooth sobre Krea 2 RAW y tres ejemplos de generacion con sus prompts.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de personalizacion de un modelo base reciente (Krea 2) que permite inyectar un concepto estilistico o de personaje concreto en un pipeline de difusion mediante `load_lora_weights` en diffusers. No es un modelo fundacional ni compite en benchmarks de razonamiento; su evaluacion debe hacerse por la fidelidad del concepto y la compatibilidad con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con diffusers (repo de 1,0 GB); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica DreamBooth aplicada como LoRA sobre Krea 2 RAW, un modelo de difusion texto-a-imagen. La model card no detalla la arquitectura interna del modelo base (si es un UNet clasico, un transformer de difusion o un hibrido), ni el numero de parametros, ni la dimension del espacio latente. Tampoco se especifica el rango del LoRA, el numero de pasos de entrenamiento, el tamano del dataset de imagenes de instancia ni si se aplicaron tecnicas de regularizacion o prior preservation.

La unica innovacion documentada es operativa: el adaptador se ha validado sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el LoRA es compatible con la variante destilada de pocos pasos del modelo base. El token de activacion es `r4yne` y debe incluirse en el prompt para invocar el concepto aprendido. No hay informacion sobre la composicion del dataset, el uso de RLHF/DPO (no aplica en difusion) ni sobre tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto `r4yne`, mediante el pipeline `Krea2Pipeline` de diffusers.
- Inyeccion de un concepto personalizado (personaje, estilo o entidad) en las generaciones del modelo base Krea 2.
- Compatibilidad con Krea 2 Turbo en regimen de pocos pasos (8 pasos, `guidance_scale=0.0`).
- Composicion de escenas complejas descritas en el prompt: los ejemplos incluyen una calle cyberpunk con lluvia de neon, una biblioteca antigua con libros flotantes y un guerrero con armadura dorada en una cima nevada.
- Carga mediante `pipe.load_lora_weights(...)` en diffusers, lo que permite combinarlo con el pipeline del modelo base.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision de entrada ni audio: es exclusivamente un generador de imagenes.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Personalizacion de marca o personaje: entrenar o cargar este LoRA para que todas las generaciones de Krea 2 incluyan el concepto `r4yne` de forma consistente, util para ilustracion editorial o concept art de una IP concreta.
- Generacion de arte conceptual en produccion audiovisual: usar el adaptador junto a Krea 2 Turbo en 8 pasos para producir storyboards o keyframes con el concepto integrado, reduciendo el coste de inferencia frente al modelo base sin destilar.
- Prototipado rapido de assets para videojuegos: generar variaciones de un personaje o criatura (`r4yne`) en distintos entornos (ciudad cyberpunk, biblioteca, montana nevada) a partir de prompts descriptivos.
- Ilustracion para publicaciones: combinar el LoRA con prompts de escena detallados para obtener imagenes coherentes con un estilo o entidad recurrente en un libro o articulo.
- Experimentacion en investigacion de personalizacion: usar el adaptador como caso de estudio de DreamBooth-LoRA sobre un modelo base reciente, comparando fidelidad del concepto y compatibilidad con la variante Turbo.
- Integracion en pipelines de generacion por lotes: cargar el LoRA en un servicio basado en diffusers y generar multiples imagenes con el token `r4yne` para catalogos o pruebas A/B de creatividades.
- Demostraciones y tutoriales: servir como ejemplo minimo de como cargar un LoRA de terceros sobre Krea 2 en diffusers con el codigo incluido en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA ocupa 1,0 GB en disco; la VRAM necesaria la determina el modelo base Krea 2, no el LoRA.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16 (Ampere o posterior, como A100, H100 o RTX 30/40).
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Krea 2, cuyo tamano no se documenta.
- Opciones de despliegue: diffusers (unica via documentada, con `Krea2Pipeline` y `load_lora_weights`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia en Krea 2 Turbo, pero no reporta tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omoshiroihs2/r4yne | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Variante destilada de Krea 2 | no disponible | no aplica | no disponible en la informacion | Hugging Face (usado en los ejemplos) |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el rango del LoRA, los hiperparametros ni el numero de pasos, lo que impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.
- Riesgo de sobreajuste al concepto `r4yne`: al ser un DreamBooth con un unico token, puede degradar la diversidad de las generaciones o filtrar el concepto en prompts no relacionados.
- El adaptador solo funciona con el modelo base Krea 2 (RAW o Turbo); no es portable a otras arquitecturas de difusion.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial puede estar condicionado por la licencia del modelo base Krea 2, que no se detalla en la informacion disponible.
- Sin datos de benchmarks, evaluaciones humanas ni metricas de fidelidad del concepto; las unicas evidencias son tres imagenes de ejemplo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Idiomas soportados no documentados; los prompts de ejemplo estan en ingles y no se garantiza un comportamiento equivalente en castellano.
- No apto para tareas de texto, razonamiento, codigo o agentes: es exclusivamente un generador de imagenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Omoshiroihs2/r4yne
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo Krea 2 Turbo (usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de diffusers: https://huggingface.co/docs/diffusers
