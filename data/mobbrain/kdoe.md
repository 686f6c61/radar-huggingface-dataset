# mobbrain/kdoe

## Resumen

`mobbrain/kdoe` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre la variante Krea 2 RAW (`krea/Krea-2-Raw`) y pensado para ejecutarse sobre Krea 2 Turbo. Lo publica el usuario `mobbrain` en Hugging Face bajo licencia Apache 2.0 y con la libreria `diffusers`. El repositorio ocupa 1,4 GB y contiene unicamente los pesos del adaptador, no un modelo completo.

El adaptador emplea el token de activacion `kdoe` para invocar el concepto aprendido. Segun la model card, los ejemplos incluidos se generaron con Krea 2 Turbo a 8 pasos de inferencia y `guidance_scale=0.0`. El modelo base es un modelo de difusion propietario de Krea, por lo que este LoRA hereda sus caracteristicas arquitectonicas y su ventana de contexto multimodal, sin que el autor las detalle.

La relevancia de esta ficha es fundamentalmente de advertencia: el prompt de instancia y las muestras publicadas por el autor describen explicitamente contenido sexual con una persona menor de edad. El modelo no es apto para uso general, su publicacion puede contravenir las politicas de Hugging Face y de la mayoria de jurisdicciones, y no debe desplegarse en produccion bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio contiene solo los pesos del adaptador LoRA, 1,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del tokenizador de texto del modelo base Krea 2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (`load_lora_weights`); no se especifica safetensors ni GGUF en la informacion disponible |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado con la tecnica DreamBooth sobre Krea 2 RAW, un modelo de difusion texto-a-imagen de Krea. El adaptador inyecta matrices de bajo rango en las capas del modelo base para especializarlo en un concepto concreto, activado mediante el token `kdoe`. El autor indica que las muestras se generaron sobre Krea 2 Turbo con 8 pasos, lo que sugiere que el adaptador es compatible con la variante destilada de pocos pasos del mismo modelo base.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset. Tampoco se documenta si hubo regularizacion, aumento de datos o tecnicas adicionales. La unica innovacion tecnica reseñable es el uso de la variante Turbo para inferencia rapida (8 pasos, sin classifier-free guidance), pero esa caracteristica pertenece al modelo base, no al adaptador.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `kdoe`, heredando las capacidades del modelo base Krea 2.
- Compatibilidad con la API `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rapida sobre Krea 2 Turbo a 8 pasos con `guidance_scale=0.0`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modo thinking (no aplica a un modelo de difusion).
- Capacidades multilingues: no disponibles.
- Capacidades especiales declaradas: ninguna mas alla del concepto aprendido; el autor no documenta control de estilo, inpainting, ControlNet ni edicion.

## Casos de uso

- **No recomendado para ningun caso de uso.** El prompt de instancia y las muestras publicadas por el autor describen contenido sexual explicito con una persona menor de edad. Cualquier aplicacion practica queda descartada por motivos legales y eticos.
- **Auditoria de seguridad de modelos:** el adaptador puede servir como caso de estudio para equipos de moderacion que necesiten identificar y bloquear este tipo de artefactos en plataformas de modelos abiertos.
- **Investigacion sobre filtrado de LoRAs:** util para desarrollar clasificadores que detecten adaptadores entrenados sobre conceptos prohibidos a partir de la model card, los prompts de instancia y las muestras.
- **Analisis de cumplimiento de licencias:** caso de ejemplo para estudiar como la licencia Apache 2.0 no protege frente a usos ilicitos del contenido generado ni exime al usuario de responsabilidad legal.
- **Pruebas de politicas de plataforma:** permite evaluar los mecanismos de reporte y retirada de Hugging Face ante contenido que infringe sus terminos.
- **Formacion en etica de IA:** material de discusion sobre los limites del open source en modelos generativos y la responsabilidad del publicador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo incluye una muestra cualitativa generada con Krea 2 Turbo a 8 pasos; no hay metricas FID, CLIP score, evaluaciones de alineacion prompt-imagen ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; depende del modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- El repositorio del LoRA ocupa 1,4 GB, un tamano tipico de adaptadores de rango medio para modelos de difusion de gran tamano.
- GPU recomendadas: no disponibles; en general, un modelo de difusion de la familia Krea 2 requeriria GPUs con memoria suficiente para el modelo base completo (A100, H100 o RTX 4090 en funcion de la cuantizacion).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles; el autor menciona 8 pasos de inferencia sobre Krea 2 Turbo, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobbrain/kdoe | LoRA DreamBooth sobre Krea 2 | no disponible (adaptador de 1,4 GB) | no disponible | Apache 2.0 | Hugging Face, 1 descarga, 0 likes |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Variante destilada de pocos pasos | no disponible | no disponible | no disponible | Hugging Face (referenciado en la model card) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- **Contenido sexual con menores:** el prompt de instancia (`"nude 16 year old girl lying on her back on a bed kdoe"`) y la muestra publicada describen explicitamente a una persona menor de edad en situacion sexual. Esto constituye material de abuso sexual infantil (CSAM) en la mayoria de jurisdicciones, incluida Espana y la UE, y su generacion, distribucion o posesion es delito.
- **Prohibicion de uso:** el modelo no debe descargarse, ejecutarse, redistribuirse ni integrarse en ningun producto o servicio. La licencia Apache 2.0 no ampara usos ilicitos y el usuario asume toda la responsabilidad legal.
- **Riesgo de alucinacion y contenido no deseado:** como todo modelo de difusion, puede generar contenido no solicitado, pero en este caso el sesgo esta dirigido deliberadamente a un concepto prohibido.
- **Sesgos conocidos:** no documentados por el autor; el propio concepto aprendido constituye un sesgo intencionado y grave.
- **Limitaciones de contexto e idioma:** no disponibles; el modelo base Krea 2 no detalla su tokenizador ni los idiomas soportados.
- **Caveat de produccion:** ningun pipeline de produccion deberia cargar este adaptador. Se recomienda a las plataformas que lo alojan revisar su retirada y a los equipos de moderacion incorporarlo a sus listas de bloqueo.
- **Reputacion del publicador:** el usuario `mobbrain` no tiene historial verificable en la informacion disponible; el repositorio tiene 1 descarga y 0 likes, lo que sugiere baja difusion hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/mobbrain/kdoe
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo (referenciado en la model card): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- Politica de contenido de Hugging Face: https://huggingface.co/content-guidelines
