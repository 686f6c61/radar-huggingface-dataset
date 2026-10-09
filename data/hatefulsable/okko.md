# HatefulSable/okko

## Resumen

Okko (también referido como "Okko the Exiled") es un ajuste fino de tipo LoRA para generación de imágenes por difusión, desarrollado por el usuario HatefulSable y publicado en HuggingFace. El modelo no parte de cero: está entrenado sobre `noobai-epred-v1.1-sdxl`, una variante de la familia NoobAI-XL, que a su vez deriva de la arquitectura SDXL (Stable Diffusion XL) de difusión latente. El objetivo es reproducir un personaje concreto —un joven de pelo blanco con reflejos rojos, cuernos rojos, orejas puntiagudas y estética de fantasía— activado mediante la etiqueta disparadora `oteokko`.

Se trata de un modelo muy especializado y de alcance reducido: el conjunto de entrenamiento consta de únicamente 9 imágenes procesadas a 768x768 píxeles durante 200 pasos por época. Esto lo sitúa en la categoría de "character LoRA" o adaptador de personaje, pensado para integrarse sobre el modelo base NoobAI-XL en pipelines de difusión como ComfyUI, Automatic1111 o la librería Diffusers, y no como un modelo generativo autónomo de propósito general.

Su relevancia es, por tanto, limitada al nicho de creadores que quieran generar de forma consistente a este personaje dentro de un ecosistema de imagen anime ya existente. No es un modelo de lenguaje ni un sistema multimodal texto-imagen con razonamiento; no ofrece tool calling, agentes ni capacidades conversacionales. La ficha refleja esta naturaleza y marca explícitamente como "no disponible" todo dato que el autor no ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet + VAE + text encoder), base NoobAI-XL / SDXL; adaptador tipo LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de generacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,5 GB; presumiblemente safetensors de LoRA, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se apoya en `noobai-epred-v1.1-sdxl` (revision `6681e8e4b1`), una variante de NoobAI-XL construida sobre la arquitectura SDXL: un UNet de difusion latente acompañado de un VAE y codificadores de texto. Okko se presenta como un ajuste de bajo rango (LoRA) sobre esa base, orientado a inyectar un concepto de personaje concreto sin reentrenar el modelo completo.

Los datos de entrenamiento publicados son mínimos: 9 imágenes a 768x768 píxeles y 200 pasos por época. No se especifica el número de épocas, el optimizador, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron técnicas de regularización, aumento de datos o recorte de caras. Tampoco se documenta ninguna innovación técnica (por ejemplo, decodificación especulativa, atención lineal o destilación). La única información operativa es la etiqueta disparadora `oteokko`, necesaria para activar el concepto durante la inferencia, y un prompt de ejemplo que describe los rasgos del personaje.

## Capacidades

- Generacion de imagenes de un personaje concreto (Okko) dentro del ecosistema SDXL / NoobAI-XL.
- Activacion del concepto mediante la etiqueta disparadora `oteokko`, combinable con prompts descriptivos del personaje.
- Reproduccion de atributos especificados en el ejemplo del autor: pelo blanco desordenado con reflejos rojos, coleta, cuernos rojos, ojos rojos, orejas puntiagudas, pendientes rojos en las orejas, torso desnudo, collar de cuentas, cinturon multicolor, ropa holgada, sandalias y arma tipo garrote.
- Soporte de prompt negativo (p. ej. `worst quality, text, signature`) para filtrar artefactos.
- Integracion con flujos de trabajo de difusion que admitan LoRA sobre una base SDXL.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento, vision, audio ni capacidades conversacionales.
- Capacidades multilingues: no disponibles; el prompt de ejemplo esta en ingles y se asume el comportamiento estandar de los text encoders de SDXL.

## Casos de uso

- Generacion de ilustraciones de personaje para proyectos de ficcion o webcomic: el LoRA mantiene la coherencia visual de Okko entre distintas escenas usando la etiqueta `oteokko` junto con descripciones de pose y entorno.
- Creacion de retratos de referencia para fichas de rol (RPG de mesa): combinando `oteokko` con prompts de encuadre y expresion se pueden producir varias vistas del personaje para una hoja de personaje.
- Prototipado rapido de concept art: sobre NoobAI-XL, el adaptador permite iterar variaciones de vestuario o equipo cambiando solo la parte descriptiva del prompt.
- Ilustracion de escenas de accion: al incluir el arma tipo garrote y descripciones de pose, se pueden generar escenas de combate coherentes con el diseno del personaje.
- Integracion en un pipeline ComfyUI o Automatic1111: el LoRA se carga junto al modelo base para producir lotes de imagenes dentro de un flujo de trabajo existente de generacion anime.
- Banco de imagenes sinteticas para pruebas de estilizado o post-proceso: util para validar etapas posteriores (retoque, upscaling, filtros) con un sujeto fijo y reconocible.
- Experimentacion con fine-tuning de personaje: sirve como caso de estudio de LoRA de bajo presupuesto (9 imagenes, 200 pasos/época) para quienes aprenden tecnicas de adaptacion sobre SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona FID, CLIP score, comparativas de calidad ni metricas objetivas de similitud con el personaje. Tampoco hay evaluaciones humanas ni comparaciones cuantitativas frente a otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un LoRA sobre una base SDXL, los requisitos vienen determinados por el modelo base. En precision fp16, SDXL requiere habitualmente del orden de 8-12 GB de VRAM, cifra orientativa no confirmada por el autor para este adaptador concreto.
- GPU recomendadas (estimacion basada en la base SDXL, no confirmada por el autor): NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el ambito profesional, A10G, L4, A100 o H100 para despliegue por lotes.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas de VRAM si se aplican tecnicas de ahorro de memoria (medvram, precision fp16, offload a CPU). No verificado para este LoRA en concreto.
- Opciones de despliegue: ComfyUI, Automatic1111 (webui), Forge, InvokeAI, SD.Next y la libreria Diffusers de HuggingFace, todos ellos con soporte de LoRA sobre SDXL. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Okko que permitan una comparacion cuantitativa. A continuacion se ofrece una comparacion cualitativa a nivel de categoria, marcando como "no disponible" los campos que no se conocen.

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HatefulSable/okko | LoRA de personaje | NoobAI-XL / SDXL | no disponible | no aplica | no disponible | HuggingFace, 0 descargas |
| NoobAI-XL (base) | Modelo de difusion completo | SDXL | no disponible en esta ficha | no aplica | no disponible | Publico en HuggingFace |
| Pony Diffusion V6 XL | Modelo de difusion completo | SDXL | ~2,6 B (UNet, referencia) | no aplica | licencia propia | Ampliamente usado |
| Otros LoRA de personaje sobre SDXL | Adaptadores de bajo rango | SDXL | no disponible | no aplica | variable | Ecosistema Civitai / HuggingFace |

No se ha localizado informacion suficiente para establecer comparaciones de calidad, fidelidad al personaje o velocidad frente a alternativas concretas.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy pequeno (9 imagenes): alta probabilidad de sobreajuste y de reproducir poses, fondos o encuadres casi identicos a los de las imagenes de origen.
- Resolucion de entrenamiento fija (768x768): puede degradarse fuera de esa resolucion o al cambiar la relacion de aspecto.
- Necesidad de la etiqueta disparadora: sin `oteokko` en el prompt, es probable que el concepto no se active correctamente.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, artefactos en el texto o incoherencias en el vestuario.
- Sesgos conocidos: no documentados por el autor; se desconoce la composicion demografica del dataset y su posible sesgo estetico.
- Limitaciones de idioma: no disponibles; se asume comportamiento estandar en ingles, sin garantia para prompts en castellano.
- Licencia: no disponible. No se puede confirmar si se permite el uso comercial, por lo que se recomienda tratar el modelo como no apto para produccion comercial hasta verificar la licencia.
- Base de la que depende: al ser un LoRA, su comportamiento depende enteramente de NoobAI-XL; hereda las limitaciones y la licencia del modelo base.
- Sin benchmarks publicados ni validacion externa: la calidad y la fidelidad al personaje no estan verificadas por terceros.
- Sin soporte editorial: no se documentan versiones, changelog ni mantenimiento; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HatefulSable/okko
- Otro modelo del mismo autor (referencia): https://huggingface.co/HatefulSable/goldie/tree/main
- Repositorio comunitario de modelos sin censura (mencionado en la busqueda): https://github.com/samssouza/uncensored-ai-list
- Articulo sobre riesgos de modelos abiertos sin salvaguardas (contexto): https://www.npr.org/2026/05/31/nx-s1-5816391/ai-safety-concerns-danger-open-weight-models-risks
- Modelo relacionado en SeaArt (contexto, no oficial): https://www.seaart.ai/models/detail/454c12d584454ed9e4e0eaf6004082bc
- HuggingFace (portal general): https://huggingface.co/
