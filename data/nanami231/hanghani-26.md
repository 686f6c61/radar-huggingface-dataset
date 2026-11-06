# Nanami231/hanghani-26

## Resumen

Nanami231/hanghani-26 es un adaptador LoRA de tipo DreamBooth para el modelo de difusion de texto a imagen Krea 2, desarrollado por el usuario Nanami231. El adaptador se entrena sobre los pesos de Krea 2 RAW y se presenta en la model card ejecutandose sobre Krea 2 Turbo, la variante destilada para inferencia rapida. Su funcion es inyectar un concepto o sujeto concreto, invocado mediante el token `HangHani@26`, en las generaciones del modelo base sin necesidad de reentrenar la red completa.

El modelo resuelve el problema clasico de personalizacion de modelos generativos: incorporar una identidad visual especifica (un sujeto, estilo o entidad) de forma consistente y controlable. Al ser un LoRA, el peso del repositorio es de 1,7 GB, muy inferior al de un modelo base completo, lo que facilita su distribucion, carga y combinacion con otros adaptadores.

Es relevante ahora porque el ecosistema de difusion ha estandarizado el formato LoRA compatible con la libreria diffusers, lo que permite integrar adaptadores personalizados en pipelines de generacion de imagen con muy pocas lineas de codigo. La licencia Apache 2.0 declarada facilita su uso comercial, aunque el modelo base sobre el que opera impone sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors para diffusers (pesos LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue la tecnica DreamBooth-LoRA, que consiste en congelar los pesos del modelo de difusion base e insertar matrices de bajo rango entrenables en las capas de atencion. El entrenamiento se realiza sobre Krea 2 RAW, la variante no destilada del modelo base, y el resultado se aplica en inferencia sobre Krea 2 Turbo, que permite generar imagenes en pocos pasos (los ejemplos de la model card usan 8 pasos y `guidance_scale=0.0`).

La informacion disponible no detalla el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos ni si se aplicaron tecnicas adicionales como regularizacion por clase o aumentacion de datos. Tampoco se especifica el rango del LoRA ni que modulos del transformer de difusion se adaptaron. El unico detalle tecnico confirmado es el token de activacion `HangHani@26` y la integracion mediante `Krea2Pipeline` con `load_lora_weights`.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por el token `HangHani@26`, que activa el concepto aprendido.
- Personalizacion de sujeto o identidad visual mediante DreamBooth, manteniendo coherencia del concepto a traves de distintos prompts y escenarios.
- Composicion de escenas complejas: los ejemplos de la model card incluyen paisajes cyberpunk, viñedos toscanos y reinos submarinos surrealistas con el sujeto integrado.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers y carga mediante `load_lora_weights`.
- Inferencia rapida sobre Krea 2 Turbo con 8 pasos de muestreo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video, ya que es un modelo puramente generativo de imagen.

## Casos de uso

- Creacion de contenido de marca con personaje recurrente: el LoRA permite generar un mismo sujeto en multiples escenarios (ciudad, naturaleza, interiores) manteniendo su identidad visual, util para campanas o storytelling grafico.
- Ilustracion editorial y conceptual: generar imagenes de acompanamiento para articulos o portadas donde un personaje concreto debe aparecer en contextos variados, con control mediante prompts descriptivos.
- Prototipado de personajes para videojuegos o animacion: producir variaciones de un diseno de personaje en distintos entornos para explorar direcciones artisticas antes de modelado 3D.
- Generacion de material para redes sociales: crear imagenes tematicas coherentes con una identidad visual fija, aprovechando la velocidad de Krea 2 Turbo (8 pasos) para iterar rapidamente.
- Pruebas de concepto en pipelines de difusion: servir como ejemplo funcional de integracion de LoRA en diffusers para equipos que evaluan flujos de personalizacion.
- Investigacion sobre personalizacion de modelos de difusion: analizar como un adaptador de bajo rango transfiere un concepto entrenado en una variante RAW a una variante Turbo destilada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2, no del adaptador LoRA, cuyo peso es de 1,7 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; el codigo de ejemplo usa `torch.bfloat16` y `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights`; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion en este contexto).
- Latencia y throughput: no disponibles; la model card indica 8 pasos de inferencia sobre Krea 2 Turbo, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanami231/hanghani-26 | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | apache-2.0 | Hugging Face, 19 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto a imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Modelo base destilado para inferencia rapida | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de otros LoRA comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del adaptador ni del modelo base; al ser un LoRA de personalizacion, puede heredar los sesgos de Krea 2 y del dataset de entrenamiento, que no se detalla.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o estructurales incoherentes, especialmente con prompts ambiguos o composiciones complejas.
- El concepto solo se activa con el token exacto `HangHani@26`; su uso sin el token produce generaciones del modelo base sin personalizacion.
- No se especifican los idiomas soportados; los prompts de ejemplo estan en ingles y se desconoce el comportamiento con prompts en castellano.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base krea/Krea-2-Raw y krea/Krea-2-Turbo, cuyas licencias no se detallan en la informacion disponible.
- El repositorio tiene solo 19 descargas y 0 likes, sin validacion de la comunidad; conviene evaluar la calidad de las muestras antes de usarlo en produccion.
- No se documentan el rango del LoRA, los modulos adaptados ni el dataset de entrenamiento, lo que dificulta reproducir o auditar el adaptador.
- El uso en produccion requiere verificar la compatibilidad exacta de versiones de diffusers y del pipeline `Krea2Pipeline`.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Nanami231/hanghani-26
- Arbol de archivos del repositorio: https://huggingface.co/Nanami231/hanghani-26/tree/main
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
