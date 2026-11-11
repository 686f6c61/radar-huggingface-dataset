# kisersantine/greta

## Resumen

`kisersantine/greta` es un LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre la variante Krea 2 RAW (`krea/Krea-2-Raw`) y pensado para invocarse sobre Krea 2 Turbo. Lo publica el usuario kisersantine en Hugging Face bajo licencia Apache 2.0. Su funcion es incorporar un concepto concreto, activado mediante el token `Greta`, en las generaciones del modelo base: desde retratos editoriales de alta costura hasta escenas cinematograficas o ilustraciones pictoricas.

El repositorio ocupa 1.0 GB y se distribuye en formato compatible con la libreria `diffusers`, con un pipeline `Krea2Pipeline` que carga los pesos del LoRA mediante `load_lora_weights`. No es un modelo autonomo: requiere descargar por separado el modelo base Krea 2 (RAW para entrenamiento, Turbo para inferencia rapida en 8 pasos). En el momento de la consulta acumula 11 descargas y 0 likes, por lo que se trata de un artefacto reciente y de difusion muy limitada.

La relevancia de esta ficha es acotada: no aporta arquitectura propia ni resultados de benchmarks, sino un adaptador de bajo rango sobre un modelo de difusion de terceros. Su interes practico reside en demostrar el flujo de personalizacion de Krea 2 con LoRA y en servir como ejemplo de integracion con `diffusers` para identidades o estilos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (el repo ocupa 1.0 GB; el desglose de parametros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (la model card solo documenta uso en `bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `load_lora_weights`); no se especifica safetensors de forma explicita |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Krea 2 para modificar su comportamiento sin reentrenar todos los pesos. Segun la model card, el entrenamiento sigue el metodo DreamBooth y se realizo sobre Krea 2 RAW (`krea/Krea-2-Raw`), aunque las muestras publicadas se generaron aplicando el adaptador sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. El concepto se activa con el token `Greta`, que actua como instance prompt.

No se detallan en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la composicion del dataset. Tampoco se documenta si hubo regularizacion, aumento de datos o ajuste fino adicional. La unica innovacion tecnica reseñable es el propio flujo de uso: carga del pipeline `Krea2Pipeline` en `bfloat16` sobre CUDA, aplicacion del LoRA y generacion en pocos pasos gracias a la variante Turbo del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `Greta`, que invoca el concepto aprendido.
- Personalizacion de identidad o personaje: el LoRA permite representar a `Greta` en multiples escenarios, estilos y encuadres.
- Transferencia de estilo: los ejemplos cubren fotografia editorial de alta costura, ilustracion pictorica (oleo) y escena cinematografica cyberpunk.
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rapida sobre Krea 2 Turbo (8 pasos, `guidance_scale=0.0`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por tratarse de un modelo generativo de imagenes.

## Casos de uso

- Creacion de personajes consistentes para narrativa visual: usar el token `Greta` en distintos prompts para mantener la misma identidad en storyboards, comics o guiones ilustrados, apoyandose en la variabilidad de estilos que demuestran las muestras.
- Prototipado de campanas de moda: generar propuestas editoriales con `Greta` en localizaciones y vestuarios diversos (galeria brutalista, gown escultural) antes de producir el shooting real, reduciendo coste de preproduccion.
- Concept art para videojuegos o cine: ambientar a `Greta` en escenarios cyberpunk o fantasticos para explorar direccion de arte y paletas con iteraciones rapidas en Turbo (8 pasos).
- Generacion de avatares o mascotas de marca: entrenar y desplegar un LoRA de identidad fija para contenido de redes sociales o material promocional, siempre que se respete la licencia Apache 2.0.
- Ilustracion editorial y portadas: producir imagenes pictoricas (oleo, espiritu del bosque) para articulos, libros o revistas, aprovechando la capacidad del modelo base para estilos artisticos.
- Investigacion en personalizacion de modelos de difusion: servir como caso de estudio reproducible de DreamBooth-LoRA sobre Krea 2, util para comparar metodos de adaptacion de bajo rango.
- Pruebas de integracion en pipelines `diffusers`: validar el flujo `Krea2Pipeline` + `load_lora_weights` en entornos de produccion antes de adoptar LoRAs propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRA o modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El adaptador pesa 1.0 GB, pero la inferencia requiere cargar el modelo base Krea 2 Turbo en `bfloat16`, cuyo consumo no se documenta en la informacion proporcionada.
- GPU recomendadas: no disponibles. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Krea 2, cuyos requisitos no se detallan.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (flujo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron con 8 pasos de inferencia sobre Krea 2 Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kisersantine/greta | LoRA DreamBooth sobre Krea 2 | no disponible (repo 1.0 GB) | no aplica | Apache 2.0 | Hugging Face, 11 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Modelo base de difusion texto-a-imagen (variante rapida) | no disponible | no aplica | no disponible en la informacion | Hugging Face (referenciado en el ejemplo) |

No se dispone de datos de benchmarks ni de otros LoRA comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un LoRA de identidad sobre un modelo de difusion, hereda los sesgos del modelo base Krea 2, que no se detallan.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir artefactos, anatomias incorrectas o inconsistencias entre prompts e imagenes, especialmente en escenas complejas.
- Limitaciones de contexto o idioma: no hay informacion sobre idiomas soportados; los prompts de ejemplo estan en ingles y no se garantiza un rendimiento equivalente en castellano.
- Restricciones de licencia: el LoRA se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se especifica en la informacion disponible. Verificar antes de desplegar en produccion.
- Caveat de produccion: el adaptador se entreno sobre Krea 2 RAW pero se muestra sobre Krea 2 Turbo; el comportamiento puede diferir entre variantes. El token `Greta` es obligatorio para invocar el concepto.
- Madurez: 11 descargas y 0 likes indican un artefacto sin validacion comunitaria; no hay garantias de calidad ni soporte.
- Ausencia de datos de entrenamiento: no se puede auditar el dataset, lo que impide evaluar riesgo de memorizacion o de contenido sensible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kisersantine/greta
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
