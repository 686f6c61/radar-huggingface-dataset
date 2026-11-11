# Omoshiroihs2/adh4ra-adhara

## Resumen

`Omoshiroihs2/adh4ra-adhara` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Omoshiroihs2 y publicado bajo licencia Apache 2.0. No se trata de un modelo fundacional autonomo, sino de un peso adicional de aproximadamente 0,8 GB que se carga sobre el modelo base `krea/Krea-2-Raw` (y se muestra en las muestras sobre la variante `krea/Krea-2-Turbo`). Su funcion es inyectar un concepto concreto —una identidad de personaje femenino denominada "adh4ra / adhara"— en el proceso de generacion de imagenes del modelo base.

El adaptador resuelve el problema clasico de personalizacion: permitir que un modelo generativo de proposito general reproduzca de forma consistente un sujeto especifico (rostro, estilo, apariencia) a partir de un token disparador. Para invocar el concepto se utiliza la cadena `adh4ra, adhara, a woman`, que actua como instance prompt. Las muestras publicadas por el autor incluyen escenas cinematograficas, interiores atmosfericos y fotografia callejera ciberpunk, lo que sugiere que el LoRA esta pensado para integrarse en flujos de trabajo de ilustracion y direccion de arte.

La relevancia de esta ficha es acotada: se trata de un adaptador comunitario con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni datos de entrenamiento publicados. La informacion disponible se limita a los metadatos de Hugging Face, la plantilla de model card de SD-LoRA y el fragmento de codigo de uso con `diffusers`. Cualquier dato sobre dataset, numero de pasos, learning rate o evaluacion cuantitativa debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es Krea 2, cuya arquitectura interna no se detalla en la informacion disponible |
| Parametros totales | no disponible (el tamano del repositorio es de 0,8 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no hay ventana de contexto de tokens de texto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; la libreria declarada es `diffusers` y la etiqueta de plantilla es `template:sd-lora`, lo que implica pesos compatibles con `load_lora_weights` de diffusers (habitualmente safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado mediante DreamBooth sobre Krea 2 RAW, segun indica el propio autor en la model card. La tecnica DreamBooth-LoRA consiste en congelar los pesos del modelo base e inyectar matrices de bajo rango en determinadas capas de atencion, de modo que el ajuste ensena al modelo un sujeto o concepto nuevo sin reentrenar la red completa. El resultado es un fichero pequeno (0,8 GB de repositorio) que se carga dinamicamente sobre el modelo base.

No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, la resolucion de las imagenes de entrenamiento ni si se aplicaron tecnicas de regularizacion (prior preservation). Tampoco se detalla la composicion del dataset ni si hubo etapas de refinamiento adicionales. El unico dato operativo relevante es que las muestras se generaron sobre la variante Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el adaptador es compatible con el regimen de destilacion por pasos reducidos de Krea 2 Turbo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por un token disparador (`adh4ra, adhara, a woman`) que activa la identidad del personaje entrenado.
- Personalizacion de sujeto: permite mantener una apariencia consistente de un personaje a traves de distintos prompts y escenas.
- Compatibilidad con prompts cinematograficos y de direccion de arte: las muestras incluyen descripciones de iluminacion, materiales (armadura dorada), entornos (biblioteca, calle de Tokio) y estilos (fotografia callejera hiperrealista, ciberpunk).
- Integracion con `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`, lo que facilita su uso en pipelines de Python.
- Compatibilidad con Krea 2 Turbo en regimen de pocos pasos (8 pasos, `guidance_scale=0.0` segun las muestras).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking, ya que no son aplicables a un modelo texto-a-imagen.
- Capacidades multilingues: no disponibles; los ejemplos estan unicamente en ingles.

## Casos de uso

- Ilustracion de personajes recurrentes: el LoRA permite generar al personaje "adh4ra" en multiples escenas manteniendo coherencia visual, util para comics, storyboards o novelas visuales donde se necesita consistencia de identidad entre paneles.
- Direccion de arte y concept art: se puede usar para explorar variaciones de vestuario y entorno (armadura, kimono ciberpunk) alrededor de un mismo personaje, acelerando la iteracion creativa.
- Prototipado de assets para videojuegos: generacion de retratos y poses del personaje para fichas de personaje, banners o material promocional antes de producir arte final.
- Campanas de marketing tematicas: creacion de imagenes de estilo cinematografico o ciberpunk con un personaje fijo, adecuadas para redes sociales o presentaciones.
- Pruebas de integracion en pipelines `diffusers`: sirve como ejemplo practico de carga de LoRA sobre Krea 2 con `load_lora_weights` y de generacion en 8 pasos con Turbo, util para validar infraestructura de inferencia.
- Experimentacion en investigacion de personalizacion: permite estudiar el comportamiento de DreamBooth-LoRA sobre un modelo base concreto, comparando fidelidad de identidad y capacidad de generalizacion a nuevos prompts.
- Generacion de fondos y escenas atmosfericas: los prompts de ejemplo (biblioteca con lluvia, isla de cristal en una nebulosa) muestran su uso para ilustracion de ambientes, aunque el foco principal sea el personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas de FID, CLIP score, similitud de identidad ni evaluaciones cuantitativas del adaptador. Las unicas referencias de rendimiento son cualitativas: las muestras se generaron con 8 pasos de inferencia sobre Krea 2 Turbo con `guidance_scale=0.0`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende enteramente del modelo base Krea 2 y de la precision utilizada. El codigo de ejemplo carga el pipeline en `torch.bfloat16` sobre `cuda`.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al ser un modelo de difusion de imagen, se requiere una GPU con suficiente VRAM para el modelo base; no se confirma que quepa en GPUs de consumo.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos sobre el consumo de VRAM del pipeline Krea 2.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` es el unico metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput: no disponibles. Solo se sabe que las muestras usan 8 pasos de inferencia, lo que reduce el coste frente a pipelines de 20-50 pasos, pero sin cifras de tiempo por imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones tecnicas del modelo base Krea 2 en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa con otros LoRA de personalizacion ni con otros modelos texto-a-imagen. La siguiente tabla recoge unicamente los datos verificables del adaptador frente a categorias genericas, marcando como no disponible lo que no se conoce.

| Aspecto | adh4ra-adhara (este LoRA) | LoRA DreamBooth tipico | Modelo texto-a-imagen fundacional |
|---|---|---|---|
| Tipo | Adaptador LoRA | Adaptador LoRA | Modelo completo |
| Parametros | no disponible (repo de 0,8 GB) | variable | no disponible (Krea 2) |
| Contexto | no aplica | no aplica | no aplica |
| Licencia | Apache 2.0 | variable | depende del base |
| Modelo base | krea/Krea-2-Raw | variable | no aplica |
| Rendimiento | no disponible | no disponible | no disponible |
| Descargas / likes | 0 / 0 | variable | variable |

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni validacion independiente; el uso en produccion requiere validacion propia.
- Documentacion minima: la model card no detalla dataset, hiperparametros ni proceso de entrenamiento, lo que impide reproducir el entrenamiento o auditar posibles sesgos.
- Riesgo de sobreajuste al sujeto: como todo DreamBooth-LoRA, puede degradar la diversidad de las generaciones y arrastrar artefactos del dataset de entrenamiento (poses, iluminacion, encuadres repetidos).
- Riesgo de alucinacion visual: el modelo base puede generar anatomia incorrecta, texto ilegible o incoherencias en escenas complejas; el LoRA no corrige esas limitaciones.
- Dependencia estricta del token disparador: sin la cadena `adh4ra, adhara, a woman` el concepto probablemente no se active; el prompting fuera de ese patron puede dar resultados inconsistentes.
- Idiomas: no hay evidencia de soporte multilingue en los prompts; los ejemplos estan solo en ingles.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el uso del modelo base Krea 2 esta sujeto a su propia licencia, que no se detalla en la informacion disponible y debe verificarse por separado.
- Naturaleza del personaje: el nombre "adh4ra / adhara" y las muestras sugieren un personaje ficticio; conviene confirmar que no reproduce la identidad de una persona real antes de usarlo comercialmente.
- Compatibilidad: el adaptador esta entrenado sobre Krea 2 RAW y mostrado sobre Krea 2 Turbo; no se garantiza su funcionamiento con otras variantes o versiones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Omoshiroihs2/adh4ra-adhara
- Modelo base (RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos mas alla de la propia pagina del modelo.
