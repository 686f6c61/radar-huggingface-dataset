# Omoshiroihs2/c0ra

## Resumen

Omoshiroihs2/c0ra es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Omoshiroihs2. Su funcion es inyectar un concepto visual concreto (una identidad femenina designada mediante los tokens `c0ra, cora, corazon, a woman`) sobre el modelo base Krea-2-Raw de Krea, de modo que las generaciones reproduzcan ese sujeto de forma consistente en distintos estilos, encuadres y escenarios. Es, por tanto, una pieza de personalizacion y no un modelo fundacional autonomo: requiere descargar el pipeline Krea 2 y cargar el LoRA encima.

El repositorio tiene un tamano de 1,0 GB, esta etiquetado con `template:sd-lora` y se distribuye bajo licencia Apache 2.0. La model card indica que el LoRA se entreno sobre Krea 2 RAW y que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere un flujo de trabajo orientado a generacion rapida con destilacion.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de adaptador de identidad para la familia Krea 2 y documenta el patron de uso con `diffusers` (`Krea2Pipeline` + `load_lora_weights`). No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni metricas de calidad, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (el repo pesa 1,0 GB; el desglose de parametros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la ventana es la del encoder de texto del pipeline Krea 2, no documentada aqui) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en `bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (carga via `load_lora_weights`); formatos de fichero concretos no detallados |

## Arquitectura y entrenamiento

El adaptador se presenta como un DreamBooth-LoRA para Krea 2. La tecnica DreamBooth busca asociar un token raro o poco frecuente a un sujeto concreto a partir de un conjunto reducido de imagenes de referencia, mientras que la formulacion LoRA congela los pesos del modelo base e introduce matrices de bajo rango entrenables en las capas de atencion (y potencialmente en otras proyecciones). El resultado es un fichero de pesos de menor tamano que el modelo completo que, cargado sobre el pipeline, modifica el comportamiento generativo sin reentrenar la red base.

La model card especifica que el entrenamiento se hizo sobre Krea 2 RAW y que la evaluacion visual se realizo sobre Krea 2 Turbo con 8 pasos. No se documentan el numero de imagenes del dataset, la resolucion de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas adicionales como regularizacion por clase previa o captions automaticos. Tampoco se indica si hubo filtrado de datos o si el sujeto es real o sintetico.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por un concepto de identidad concreto mediante los tokens `c0ra`, `cora`, `corazon` y la frase `a woman`.
- Transferencia de estilo: los ejemplos de la model card cubren fotografia cinematografica, pintura al oleo y macrofotografia submarina, lo que indica que el concepto se mantiene bajo cambios de medio y de iluminacion.
- Control de encuadre y escena mediante prompt: planos amplios, interiores, entornos submarinos, escenarios cyberpunk.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers`, incluyendo carga sobre la variante Turbo con pocos pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es un modelo puramente generativo de imagen.
- Capacidades multilingues: no disponibles; los prompts de referencia estan en ingles y no se especifica el comportamiento con otros idiomas.

## Casos de uso

- Produccion de storyboards con personaje recurrente: el LoRA permite mantener la misma identidad femenina a lo largo de una secuencia de planos (amplio, medio, detalle) sin reescribir el prompt de sujeto, lo que simplifica la consistencia visual en preproduccion.
- Ilustracion editorial y de marca: al conservar el sujeto bajo estilos tan distintos como oleo o macrofotografia, encaja en encargos donde se necesita un mismo personaje en piezas de tono grafico diferente.
- Pruebas de concepto para videojuegos: generacion rapida de variantes de un personaje en distintos entornos (cyberpunk, historico, submarino) para explorar direccion de arte antes de modelar en 3D.
- Generacion de material para campanas: combinado con Krea 2 Turbo a 8 pasos, permite iterar decenas de variaciones en pocos minutos sobre una GPU de consumo, util para lluvias de ideas en agencia.
- Creacion de datasets sinteticos etiquetados: el adaptador puede producir imagenes controladas de un sujeto concreto en escenas diversas para alimentar posteriores tareas de vision por computador, siempre que la licencia Apache 2.0 y las condiciones del modelo base lo permitan.
- Prototipado de interfaces creativas: integracion en herramientas internas que carguen el LoRA con `diffusers` y expongan al usuario solo el prompt de escena, abstrayendo los tokens de activacion.
- Experimentacion academica sobre personalizacion: sirve como caso de estudio de DreamBooth-LoRA sobre una familia de difusion reciente, para comparar deriva de identidad y fidelidad al estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta tres imagenes de muestra generadas sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`; no hay FID, CLIP score, similitud facial ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA. Depende enteramente del pipeline Krea 2 subyacente, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles. La model card solo menciona `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. El uso de `bfloat16` sugiere GPUs Ampere o posteriores (RTX 30xx/40xx), pero no se aporta evidencia.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`. No se documenta soporte para llama.cpp, Ollama, TGI, vLLM ni ComfyUI.
- Latencia y throughput: no disponibles. El unico dato operativo es que las muestras se generaron con 8 pasos de inferencia sobre Krea 2 Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Omoshiroihs2/c0ra | LoRA DreamBooth texto-a-imagen | krea/Krea-2-Raw | no disponible (repo 1,0 GB) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| LoRA de identidad genericos para SDXL | LoRA DreamBooth texto-a-imagen | SDXL | variable, tipicamente 50-200 MB | no aplica | variable segun autor | Amplia en Hugging Face y Civitai |
| LoRA oficiales de Krea 2 | LoRA de estilo/concepto | Krea-2-Raw / Turbo | no disponible | no aplica | segun Krea | Repositorio de Krea |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay informacion sobre el dataset de entrenamiento: se desconoce si el sujeto es una persona real, si se conto con consentimiento y si existen sesgos de representacion en las imagenes de referencia.
- Riesgo de sobreajuste al sujeto: los LoRA de identidad tienden a forzar la aparicion del concepto incluso cuando el prompt no lo invoca, especialmente si el token de activacion aparece de forma parcial.
- Deriva de identidad bajo prompts complejos: la model card solo demuestra tres escenarios; no hay evidencia de robustez ante cambios de edad, etnia, vestimenta o iluminacion extrema.
- Idiomas: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y el comportamiento con castellano no esta verificado.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea-2-Raw y de Krea-2-Turbo, que no se detalla en la informacion proporcionada. Es imprescindible revisar las condiciones de Krea antes de explotar el LoRA en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y mayor riesgo de pesos defectuosos o no reproducibles.
- Ausencia de metadatos tecnicos: no se publican rango del LoRA, pasos de entrenamiento, resolucion ni regularizacion, lo que dificulta reproducir o ajustar el adaptador.
- Dependencia estricta del pipeline Krea 2: no funciona de forma autonoma ni con `diffusers` estandar sin la clase `Krea2Pipeline` disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Omoshiroihs2/c0ra
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo referenciada en la model card: https://huggingface.co/krea/Krea-2-Turbo
