# RunningHubAI/rh-madison-lora

# rh-madison-lora

## Resumen

rh-madison-lora es un adaptador LoRA (Low-Rank Adaptation) de edicion de imagen publicado por RunningHubAI en nombre del autor Joop Munguia. No es un modelo de lenguaje ni un modelo fundacional: es un peso adicional de 218 MiB en formato safetensors que se carga sobre un modelo base de difusion identificado en la model card como "krea2", afinado durante 2500 pasos y activado mediante la palabra clave "madison". Su funcion es reproducir un concepto o personaje concreto bajo el pipeline declarado image-text-to-image, es decir, generacion y edicion de imagenes condicionadas por texto y por una imagen de entrada.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio acumula 0 descargas y 0 likes, ocupa 0,2 GB, no incluye model card tecnica detallada (sin rango del LoRA, learning rate, resolucion de entrenamiento, composicion del dataset ni ejemplos), no declara licencia concreta y no publica resultados de evaluacion. La ficha del repositorio se limita a una tabla de metadatos, la mencion al modelo base, la palabra de activacion y el listado de archivos.

En consecuencia, cualquier evaluacion seria de este adaptador exige probarlo directamente en ComfyUI o en la plataforma RunningHub con el modelo base correcto. Toda la informacion tecnica que no aparece en el repositorio se marca en esta ficha como "no disponible", sin estimaciones inventadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion identificado como "krea2" |
| Parametros totales | no disponible (el unico archivo de pesos, `madison-lora.safetensors`, ocupa 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de imagen; la condicion de texto la fija el modelo base) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors, por lo que la cuantizacion depende del cargador y del modelo base |
| Idiomas soportados | no disponible (la model card se publica en ingles y chino) |
| Licencia | no disponible; la model card indica que se sigue la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`madison-lora.safetensors`, 218 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | krea2 (segun la model card) |
| Palabra de activacion | `madison` |
| Pasos de entrenamiento | 2500 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela el modelo base e inyecta matrices de bajo rango en determinadas capas. El archivo `madison-lora.safetensors` pesa 218 MiB, un orden de magnitud coherente con un adaptador de rango moderado sobre un modelo de difusion de gran tamano. El pipeline declarado es image-text-to-image, lo que indica que el adaptador esta pensado tanto para generacion condicionada por texto como para tareas de edicion a partir de una imagen de entrada.

Los unicos datos de entrenamiento publicados son el numero de pasos (2500) y el modelo de partida (krea2). No se especifica el rango (rank) ni el alpha del LoRA, la tasa de aprendizaje, el optimizador, la resolucion de entrenamiento, el numero de imagenes del dataset, la composicion de este ni si hubo tecnicas de regularizacion o curado automatico. Tampoco se documenta si el ajuste se hizo con las herramientas de entrenamiento de RunningHub, aunque la model card enlaza su pagina de entrenamiento, lo que sugiere ese origen. No hay informacion sobre atencion lineal, decodificacion especulativa ni ninguna otra innovacion tecnica: son conceptos ajenos a un adaptador de difusion de este tipo.

## Capacidades

- Generacion de imagenes condicionada por texto con la palabra de activacion `madison`, orientada a reproducir un concepto, estilo o personaje concreto.
- Edicion de imagen (pipeline image-text-to-image): modificacion de una imagen de entrada guiada por prompt, presumiblemente preservando la identidad asociada a la palabra clave.
- Carga directa en ComfyUI, segun las etiquetas del repositorio (`comfyui`, `lora`).
- Ejecucion en la plataforma RunningHub, tanto en la version internacional como en la china, y posible uso mediante su API.
- Compatibilidad con Hugging Face como repositorio de distribucion de pesos.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se declaran capacidades multilingues a nivel de modelo; el idioma de los prompts depende del codificador de texto del modelo base.
- No se declaran capacidades de vision, audio, video ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Generacion de retratos consistentes de un personaje: incluyendo `madison` en el prompt y cargando el LoRA sobre krea2 en ComfyUI, se pueden producir variaciones del mismo concepto con coherencia entre imagenes, algo util para storyboards o ilustracion seriada.
- Edicion de imagenes existentes: gracias al pipeline image-text-to-image, se puede partir de una fotografia o render y aplicar cambios guiados por texto manteniendo el estilo aprendido por el adaptador.
- Previsualizacion de personajes para produccion audiovisual: generar bocetos y variaciones de vestuario, iluminacion o encuadre antes de comprometer recursos en un diseno final.
- Prototipado de assets para videojuegos o aplicaciones: creacion rapida de retratos y avatares con un concepto comun para pantallas de seleccion, dialogos o material promocional interno.
- Ilustracion para contenido editorial o redes sociales: produccion de imagenes tematicas con un estilo estable, siempre que la licencia del modelo base y del adaptador lo permitan.
- Automatizacion via API de RunningHub: integracion del flujo de generacion o edicion en un backend propio mediante la API de la plataforma, por ejemplo para un servicio web que devuelva imagenes editadas a peticion.
- Pruebas comparativas de adaptadores: uso del LoRA como caso de estudio para medir como afecta un ajuste de 2500 pasos al comportamiento del modelo base krea2 en tareas de edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FID, CLIP score, similitud de identidad), ni evaluaciones humanas, ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia ni consumo de recursos.

## Requisitos de hardware

- Espacio en disco: 0,2 GB para el adaptador (218 MiB), mas el peso del modelo base, que no se incluye en este repositorio.
- VRAM para el adaptador: en fp16, aproximadamente 0,2 GB adicionales sobre el modelo base; el cuello de botella real es siempre el modelo base krea2, no el LoRA.
- VRAM total: no disponible. Depende por completo del modelo base y del modo de carga (precision completa, fp8, GGUF, offloading de text encoders). No se confirma en la informacion disponible que krea2 corresponda a una arquitectura concreta ni su numero de parametros.
- GPU recomendadas: no disponible para este adaptador en concreto. Como referencia general para modelos de difusion de gran tamano, las GPU de datacenter (A100, H100) permiten precision completa, mientras que las consumer de gama alta (RTX 4090, 24 GB) suelen requerir cuantizacion o offloading.
- Cabe en GPU consumer: no confirmado. Depende del modelo base; con cuantizacion agresiva del base es habitual que modelos de esta familia quepan en tarjetas de 8-12 GB, pero no hay datos que lo confirmen para krea2.
- Opciones de despliegue: ComfyUI (soporte nativo segun las etiquetas del repositorio), plataforma RunningHub y su API, y Hugging Face como origen de descarga. Compatibilidad con Diffusers, vLLM, llama.cpp, Ollama o TGI no aplica o no esta confirmada: vLLM, llama.cpp, Ollama y TGI son herramientas de inferencia de modelos de lenguaje y no ejecutan adaptadores de difusion de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa. La tabla siguiente recoge lo que se sabe, marcando como no disponible todo lo que no aparece en el repositorio.

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-madison-lora | LoRA de edicion de imagen sobre krea2 | no disponible (218 MiB en safetensors) | no disponible | no disponible | Hugging Face (0 descargas), RunningHub |
| krea2 (modelo base sin adaptador) | Modelo de difusion de texto a imagen | no disponible | no disponible | no disponible | no disponible en este repositorio |
| Otros LoRA de personaje publicados en RunningHub | LoRA de edicion de imagen | no disponible | no disponible | no disponible | RunningHub |

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o del modelo base, sin concretarla. Esto impide determinar si el uso comercial esta permitido.
- Riesgo de licencia restrictiva en el modelo base: si krea2 deriva de modelos de difusion con licencia no comercial (caso habitual en la familia FLUX.1 Krea), el uso comercial del adaptador quedaria restringido. Debe verificarse con el autor antes de cualquier despliegue en produccion.
- Ausencia total de evaluacion: 0 descargas, 0 likes y ninguna metrica publicada. No hay evidencia externa de calidad, fidelidad al concepto ni estabilidad entre semillas.
- Documentacion insuficiente: se desconocen el rango del LoRA, la receta de entrenamiento, el dataset y la resolucion de trabajo, lo que dificulta reproducir resultados o ajustar la intensidad del adaptador.
- Sobreajuste probable: 2500 pasos sin datos sobre regularizacion ni tamanos de dataset pueden producir rigidez estilistica o degradacion del prompt cuando se usa el adaptador con pesos altos.
- Riesgo de suplantacion de identidad: si "madison" corresponde a una persona real, la generacion o edicion de su imagen puede infringir derechos de imagen o de publicidad segun la jurisdiccion. El autor no aporta declaracion de consentimiento ni de procedencia de los datos.
- Alucinacion visual y artefactos: como todo modelo de difusion, puede producir anatomias incorrectas, texto ilegible y detalles incoherentes, especialmente en ediciones que alteran grandes areas de la imagen.
- Sin garantias de soporte: el repositorio no indica mantenimiento, versionado ni changelog; la fecha de actualizacion coincide con la de creacion.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron informacion tecnica sobre este modelo, solo resultados ajenos al ambito, por lo que no se ha podido contrastar ningun dato con fuentes externas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-madison-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2094286405353926657
- Pagina del autor: https://www.runninghub.ai/user-center/2053357166945157121
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la busqueda web realizada.
