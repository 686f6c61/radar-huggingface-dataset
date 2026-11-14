# Archemimi/fabibout

## Resumen

Archemimi/fabibout es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Archemimi y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador ensena al modelo base un concepto visual concreto invocado mediante el token `fabibout`, que actua como palabra disparadora en los prompts. Se entrena sobre los pesos de Krea 2 RAW y las muestras publicadas se han generado con Krea 2 Turbo en 8 pasos de inferencia.

El modelo resuelve el problema de personalizacion de un modelo generativo de imagenes: incorporar un concepto, objeto o estilo nuevo sin reentrenar el modelo completo, manteniendo la calidad del generador original. Es relevante porque demuestra el flujo habitual de la comunidad: un adaptador ligero (0,8 GB de repositorio) que se carga sobre un pipeline de `diffusers` con una unica llamada a `load_lora_weights`, lo que reduce coste de almacenamiento y de despliegue frente a un fine-tuning completo.

La informacion publicada es muy limitada: no se detallan hiperparametros de entrenamiento, numero de pasos, dataset de imagenes, resolucion de entrenamiento ni resultados cuantitativos. La model card se limita al token disparador, tres ejemplos de prompt con sus imagenes y un fragmento de codigo de uso con `diffusers`. El repositorio tiene 11 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es krea/Krea-2-Raw |
| Parametros totales | no disponible (el repositorio ocupa 0,8 GB; no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | no disponible (la model card solo usa `torch.bfloat16` en el ejemplo) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA cargables con `diffusers` (`load_lora_weights`); no se especifica el formato de fichero exacto (safetensors u otro) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth aplicado sobre Krea 2. El entrenamiento se realiza sobre los pesos de Krea 2 RAW, mientras que la inferencia de las muestras publicadas se hace sobre Krea 2 Turbo, una variante destilada para generacion rapida. La model card no especifica el rango del LoRA, las capas objetivo, la tasa de aprendizaje, el numero de pasos ni el tamano del dataset de imagenes empleado.

No se documenta ninguna innovacion tecnica adicional mas alla del propio esquema DreamBooth-LoRA. El uso previsto es el estandar en este tipo de adaptadores: cargar los pesos LoRA sobre el pipeline `Krea2Pipeline` y condicionar la generacion con el token `fabibout`. El ejemplo de la model card usa `num_inference_steps=8` y `guidance_scale=0.0`, coherente con la variante Turbo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `fabibout`, que activa el concepto aprendido.
- Composicion del concepto en escenas diversas: la model card muestra ejemplos en un entorno cyberpunk, un templo en la jungla y una aldea de caramelo.
- Integracion con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rapida sobre Krea 2 Turbo (8 pasos en los ejemplos publicados).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por tratarse de un modelo generativo de imagen.
- No se documenta soporte multilingue explicito; los prompts de ejemplo estan en ingles.

## Casos de uso

- Prototipado de conceptos de marca: cargar el LoRA sobre Krea 2 Turbo y generar variaciones del concepto `fabibout` en distintos entornos para explorar direccion de arte antes de producir assets finales.
- Ilustracion editorial tematica: usar el token disparador dentro de prompts descriptivos para insertar el concepto en escenas coherentes con un articulo o una campana.
- Generacion de material para redes sociales: producir imagenes con un motivo recurrente y consistente sin reentrenar el modelo base, gracias al bajo coste de almacenamiento del adaptador (0,8 GB).
- Pruebas de integracion en pipelines `diffusers`: validar el flujo `from_pretrained` + `load_lora_weights` en entornos de CI antes de desplegar adaptadores propios en produccion.
- Experimentacion academica con DreamBooth-LoRA: usar el adaptador como referencia para comparar la calidad de personalizacion entre variantes RAW y Turbo del modelo base.
- Creacion de assets para videojuegos o narrativa visual: generar escenarios y variaciones de un objeto o personaje recurrente manteniendo consistencia entre imagenes mediante el mismo token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 Turbo, no del adaptador LoRA, que anade una sobrecarga minima.
- El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la model card; el adaptador en si ocupa 0,8 GB, pero el modelo base condiciona el requisito real de VRAM.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles; los ejemplos usan 8 pasos de inferencia sobre la variante Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Archemimi/fabibout | LoRA DreamBooth sobre Krea 2 | no disponible (repo de 0,8 GB) | no aplica | Apache 2.0 | Hugging Face, 11 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Variante destilada del modelo base | no disponible | no aplica | no disponible en la informacion | Hugging Face (usado en los ejemplos) |

No se dispone de datos de rendimiento ni de otros adaptadores LoRA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos ni de memorizacion de imagenes concretas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar composiciones incoherentes o artefactos, especialmente fuera de los entornos de los ejemplos publicados.
- El concepto solo se activa de forma fiable con el token `fabibout`; su comportamiento con otros prompts no esta documentado.
- No se especifica el soporte multilingue; los prompts de ejemplo estan en ingles y se desconoce el rendimiento con prompts en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Krea 2 puede tener condiciones propias que deben verificarse antes de produccion.
- Informacion de entrenamiento incompleta: sin hiperparametros, numero de pasos ni resolucion, es dificil reproducir el adaptador o estimar su robustez.
- Repositorio con muy poca traccion (11 descargas, 0 likes) y sin validacion externa; conviene evaluarlo con prompts propios antes de integrarlo en un flujo de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Archemimi/fabibout
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
