# linoyts/Qwen-Image-2.1-DMD2-2steps

## Resumen

Qwen-Image-2.1-DMD2-2steps es un adaptador LoRA de destilación publicado por Linoy Tsaban (linoyts) sobre el modelo de difusión Qwen/Qwen-Image-2.1. Su función es convertir el muestreo de 20 pasos del modelo base en una ejecución de 2 pasos (2 evaluaciones del modelo, NFE) sin renunciar a la edición por instrucciones ni a la generación texto-imagen. El adaptador se entrena con DMD2 (Distribution Matching Distillation 2), una técnica de destilación on-policy que iguala la distribución del estudiante con la del profesor sin recurrir a pérdidas de regresión ni a un discriminador GAN.

El interés práctico está en la latencia: pasar de 20 pasos con guidance a 2 pasos sin CFG reduce en un orden de magnitud el número de pasadas por el transformer de difusión, lo que habilita bucles interactivos de edición y generación en tiempo real. El LoRA es de rango 32 y solo adapta las proyecciones de atención (to_q, to_k, to_v, to_out.0), una decisión de diseño que, según la model card, preserva mejor la fidelidad al image de entrada que adaptar también los bloques feed-forward.

El repositorio es muy ligero (0,1 GB) porque contiene únicamente los pesos del adaptador, no el modelo base. Está sujeto a la Qwen Research License: uso exclusivo de investigación y evaluación, con prohibición de uso comercial sin licencia separada de Qwen. El pipeline requerido (QwenImage21Pipeline) solo está disponible en la rama de desarrollo de diffusers en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión; arquitectura del modelo base Qwen-Image-2.1 no disponible en la informacion |
| Parametros totales | no disponible (LoRA de rango 32 sobre to_q, to_k, to_v y to_out.0; repositorio de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion; el limite practico lo fija el text encoder del modelo base) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial carga el modelo base en bfloat16 y el LoRA en safetensors. No se documentan variantes GGUF, NF4 ni INT8 para este adaptador |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder de Qwen-Image-2.1) |
| Licencia | qwen-research (Qwen Research License): solo investigacion y evaluacion, no comercial |
| Formato de pesos | safetensors (pytorch_lora_weights.safetensors) |
| Pasos de inferencia | 2 pasos, sigmas fijas [1.0, 0.5] |
| Escala CFG en inferencia | true_cfg_scale = 1.0 (sin CFG; el guidance del profesor esta destilado) |
| Rango / alpha del LoRA | 32 / 32 |
| Modulos adaptados | to_q, to_k, to_v, to_out.0 (solo atencion) |
| Scheduler | FlowMatchEulerDiscreteScheduler con use_dynamic_shifting=False, shift=1.0, shift_terminal=None |
| Resolucion de entrenamiento | multi-aspect, ~1 MP |
| Descargas / likes | 138 / 14 |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagenes cuyo detalle interno (numero de parametros, tipo de backbone, dimension del text encoder) no se especifica en la informacion disponible. Lo que sí se documenta es el esquema de destilacion: DMD2 con correspondencia de distribuciones on-policy, sin pérdida de regresion ni pérdida adversarial, y con el guidance CFG del profesor inyectado en el estudiante. El resultado es un estudiante que necesita una sola pasada condicional por paso, de ahí que la inferencia se ejecute con true_cfg_scale=1.0.

El entrenamiento se realizo en 2000 pasos sobre una unica NVIDIA H100, con resoluciones multi-aspect alrededor de 1 MP, y con un calendario de sigmas fijo de [1.0, 0.5]. Ese detalle es operativamente importante: como el LoRA se entreno con nodos fijos, el scheduler debe configurarse con use_dynamic_shifting=False y shift=1.0 para que los nodos se usen tal cual y no se reescalen segun la resolucion. La adaptacion se limita a las proyecciones de atencion con rango 32 y alpha 32, lo que reduce el numero de pesos entrenables y, segun el autor, mantiene alta la fidelidad al image de condicionamiento en tareas de edicion.

## Capacidades

- Generacion texto-imagen en 2 pasos: acepta un prompt de texto y produce una imagen con el scheduler y las sigmas indicadas.
- Edicion de imagen por instrucciones en 2 pasos: transformaciones guiadas por prompt sobre una imagen de entrada (el autor documenta ejemplos de sketch-to-photo, cambio de peinado, cambio de expresion y restauracion fotografica).
- Composicion multi-referencia: el pipeline acepta una lista de imagenes de condicionamiento referidas en el prompt como "Picture 1", "Picture 2", etc. (por ejemplo, colocar el gato de la Picture 1 en la playa de la Picture 2).
- Preservacion de la fidelidad al image de entrada: la adaptacion solo en atencion mantiene mejor la identidad y la estructura del original que una adaptacion que incluya los bloques feed-forward.
- Destilacion con guidance integrado: no requiere CFG en inferencia, lo que elimina la segunda pasada por paso.
- Compatibilidad con el ecosistema diffusers: se carga con load_lora_weights y se puede descargar o intercambiar como cualquier adaptador.
- No soporta, segun la informacion disponible: tool calling, agentes, razonamiento multi-paso textual, audio ni video. Es exclusivamente un adaptador de imagen.

## Casos de uso

- Edicion interactiva en tiempo real: con 2 evaluaciones del transformer por imagen, el adaptador permite bucles de edicion tipo lienzo en los que el usuario modifica el prompt o el trazo y obtiene el resultado sin esperas de decenas de pasos.
- Restauracion fotografica en lote: el caso documentado por el autor (restauracion de fotos) se puede aplicar a colas de digitalizacion donde el coste por imagen en pasos es el factor limitante.
- Exploracion rapida de prompts en herramientas de diseno: generar decenas de variaciones de un mismo concepto para elegir direccion creativa antes de lanzar una tirada final con el modelo base a 20 pasos.
- Composicion de producto con multiples referencias: combinar una imagen de producto (Picture 1) con una escena de fondo (Picture 2) para previsualizaciones de catalogo o mockups.
- Previsualizacion en estudios de personaje: probar cambios de peinado o expresion sobre un retrato de referencia antes de una iteracion de mayor calidad.
- Prototipado de pipelines de edicion instructiva: validar la logica de una aplicacion (UI, cola de trabajos, gestion de imagenes) con latencia baja antes de invertir en el modelo completo.
- Investigacion sobre destilacion de difusion: usar el adaptador como estudiante de referencia para comparar DMD2 frente a otros esquemas de aceleracion few-step en tareas de edicion.
- Generacion de variaciones para pruebas A/B: producir rapidamente conjuntos de imagenes con la misma semilla y distintos prompts para evaluacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, ImageReward, HPSv2 u otros) en la informacion disponible. La model card unicamente aporta una comparacion cualitativa mediante una rejilla de imagenes (assets/edit_space_examples.png) en la que se contrasta este LoRA a 2 pasos con el modelo base a 20 pasos, usando la misma entrada, prompt y semilla, en cuatro tareas de edicion. No se dispone de numeros para reproducir esa comparacion.

| Metrica | Este LoRA (2 pasos) | Qwen-Image-2.1 (20 pasos) |
|---|---|---|
| Evaluacion cuantitativa (FID, CLIP, ImageReward) | no disponible | no disponible |
| Comparacion cualitativa de edicion | incluida en la model card (columna central) | incluida en la model card (columna derecha) |
| Pasadas por imagen (NFE) | 2 | 20 (mas las pasadas adicionales de CFG) |

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita. El consumo lo domina el modelo base Qwen-Image-2.1, que se carga en bfloat16 en el ejemplo oficial; el adaptador en si ocupa 0,1 GB.
- GPU de entrenamiento documentada: una unica NVIDIA H100 para 2000 pasos de DMD2 a ~1 MP.
- GPU recomendadas para inferencia: no disponibles en la informacion. La ganancia del adaptador es de computo (2 pasadas frente a 20), no de huella de memoria: el transformer completo sigue residiendo en VRAM.
- Ajuste en GPU de consumo: no se puede confirmar con los datos aportados, ya que no se indica el tamano del modelo base ni su huella en memoria. El adaptador no reduce los requisitos de VRAM del modelo base, solo el numero de pasadas.
- Opciones de despliegue: diffusers con QwenImage21Pipeline, que requiere instalar la rama de desarrollo (`pip install "git+https://github.com/huggingface/diffusers.git@qwenimage21-lora-training"`); en el momento de la publicacion no estaba en PyPI. No se documentan rutas de despliegue alternativas (vLLM, TGI, llama.cpp, Ollama, ComfyUI) para este adaptador.
- Latencia y throughput: no disponibles como cifras absolutas. La relacion derivada de la configuracion es de 2 pasadas sin CFG por imagen frente a 20 pasos con CFG en el modelo base, es decir, una reduccion de un orden de magnitud en el numero de evaluaciones del transformer.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | CFG en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linoyts/Qwen-Image-2.1-DMD2-2steps | LoRA de destilacion DMD2 sobre Qwen-Image-2.1 | 2 | No (true_cfg_scale=1.0) | qwen-research (no comercial) | HuggingFace, diffusers dev |
| Qwen/Qwen-Image-2.1 (modelo base) | Modelo de difusion completo | 20 | Si | qwen-research (no comercial) | HuggingFace, diffusers dev |
| Otros aceleradores few-step para Qwen-Image-2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros adaptadores de destilacion comparables (por ejemplo, variantes LCM, Turbo o Lightning para esta misma familia), por lo que la comparativa se limita al modelo base. Tampoco se dispone de cifras de calidad que permitan cuantificar la perdida respecto al profesor a 20 pasos.

## Limitaciones y advertencias

- Licencia no comercial: se trata de una obra derivada de Qwen-Image-2.1 y queda sujeta a la Qwen Research License. El uso comercial requiere una licencia separada de Qwen; no se puede desplegar en produccion comercial sin ese acuerdo.
- Dependencia de una rama de desarrollo: el pipeline QwenImage21Pipeline no estaba en PyPI en el momento de la publicacion; la instalacion desde Git implica riesgo de cambios incompatibles y de reproducibilidad a medio plazo.
- Calendario de sigmas fijo: usar sigmas distintas de [1.0, 0.5] o dejar el shifting dinamico activado degrada el resultado, porque el LoRA se entreno con esos nodos exactos.
- Sin CFG: no se debe subir true_cfg_scale esperando mejoras; la guia del profesor ya esta destilada en el estudiante y el adaptador esta pensado para una sola pasada condicional.
- Pérdida de calidad no cuantificada: la model card afirma que la calidad se mantiene "cercana" al profesor de 20 pasos, pero no aporta metricas; en ediciones finas o texto dentro de la imagen el estudiante de 2 pasos puede degradar detalles.
- Alcance limitado a imagen: no hay soporte de tool calling, agentes, razonamiento textual ni otras modalidades.
- Idiomas: no se documenta que lenguajes de prompt estan cubiertos; la cobertura dependera del text encoder del modelo base, sin datos publicados.
- Sesgos y alucinacion visual: no se aporta ninguna evaluacion de sesgos, y como todo modelo de difusion puede generar contenido facticamente incorrecto o no solicitado, especialmente en composiciones multi-referencia con muchas imagenes de condicionamiento.
- Versionado: el autor etiqueta el adaptador como V1; pueden aparecer revisiones con comportamiento distinto bajo el mismo repositorio, por lo que conviene fijar el commit o la revision al integrarlo.
- Reproducibilidad: los ejemplos usan semilla fija y un Generator de CUDA, pero no se documentan versiones exactas de torch ni de diffusers mas alla de la rama indicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/linoyts/Qwen-Image-2.1-DMD2-2steps
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Coleccion "Qwen Image 2.1 Realtime" del autor: https://huggingface.co/collections/linoyts/qwen-image-21-realtime
- Perfil del autor: https://huggingface.co/linoyts
- diffusers (rama con soporte Qwen-Image-2.1): https://github.com/huggingface/diffusers/tree/qwenimage21-lora-training
- Listado de adaptadores sobre Qwen-Image-2.1: https://huggingface.co/models?other=base_model%3Aadapter%3AQwen%2FQwen-Image-2.1
- Listado de modelos etiquetados como distillation: https://huggingface.co/models?other=distillation
