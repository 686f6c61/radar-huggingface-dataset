# guillekenzo/aros-f24317ef-Maya

## Resumen

`guillekenzo/aros-f24317ef-Maya` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario guillekenzo y publicado en HuggingFace. El adaptador se entrena sobre los pesos de Krea 2 RAW (`krea/Krea-2-Raw`) y esta pensado para invocarse en inferencia sobre Krea 2 Turbo, la variante destilada para pocos pasos del mismo modelo base. Su funcion es inyectar un concepto visual concreto, activado mediante el token disparador `fpwb woman`, en las generaciones del modelo base.

El repositorio tiene un tamano de 1,3 GB, lo que es coherente con un checkpoint LoRA de rango completo sobre un modelo de difusion de gran tamano, y se distribuye en formato compatible con la libreria `diffusers`. La licencia declarada es Apache 2.0. El modelo acumula 33 descargas y ningun "like" en el momento de la consulta, lo que indica una publicacion reciente y de baja difusion dentro del ecosistema.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional ni de un LLM, sino de un artefacto de personalizacion (un LoRA de concepto) cuya utilidad depende enteramente del modelo base Krea 2. No se dispone de informacion publica sobre la composicion del dataset de entrenamiento, el numero de pasos, el rango del LoRA ni metricas de calidad objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (el repo ocupa 1,3 GB; no se detalla el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud maxima de prompt) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `load_lora_weights`); no se indica safetensors ni GGUF de forma explicita |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la tecnica DreamBooth sobre Krea 2 RAW. DreamBooth es un metodo de ajuste fino que asocia un token raro (en este caso `fpwb woman`) a un sujeto o concepto concreto a partir de un conjunto reducido de imagenes de referencia, de modo que el modelo base aprenda a reproducir ese concepto cuando el token aparece en el prompt. El LoRA se inyecta en las capas del modelo de difusion sin modificar los pesos originales, lo que permite cargarlo y descargarlo dinamicamente en tiempo de inferencia.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas adicionales como regularizacion por clase o aumento de datos. Tampoco se documenta la composicion del dataset ni si hubo curacion o filtrado. La model card indica que el adaptador se entrena sobre Krea 2 RAW pero que las muestras se generan sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere que el autor valido el adaptador en el regimen de destilacion del modelo Turbo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `fpwb woman`, que activa el concepto aprendido.
- Personalizacion de concepto (subject-driven generation) sobre el modelo base Krea 2.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Inferencia en pocos pasos cuando se combina con Krea 2 Turbo (8 pasos en los ejemplos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada mas alla del prompt de texto.
- Capacidades multilingues: no documentadas; los ejemplos usan prompts en ingles.

## Casos de uso

- Generacion de retratos consistentes de un sujeto concreto: el LoRA permite producir variaciones del concepto `fpwb woman` en distintos escenarios (interior, exterior, fondo neutro) manteniendo la identidad visual aprendida, util para prototipado de personajes o avatares.
- Creacion de material grafico para ficcion o narrativa: generar ilustraciones de un personaje recurrente en multiples ambientaciones sin reentrenar el modelo base en cada iteracion.
- Pruebas de concepto en estudios de diseno: evaluar rapidamente como se comporta un concepto personalizado sobre Krea 2 Turbo antes de invertir en un pipeline de generacion a mayor escala.
- Investigacion sobre personalizacion de modelos de difusion: usar el adaptador como caso de estudio de DreamBooth sobre Krea 2 para comparar metodos de inyeccion de concepto.
- Generacion de imagenes de referencia para moodboards: producir variaciones controladas de un sujeto para alimentar fases de direccion de arte.
- Experimentacion con LoRAs comunitarios: integrar el adaptador en flujos de trabajo con `diffusers` para evaluar la calidad de la personalizacion en el ecosistema Krea 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye tres imagenes de muestra generadas con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`, sin metricas cuantitativas (FID, CLIP score, similitud de identidad, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2, no del LoRA. El adaptador anade una sobrecarga minima sobre los pesos del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos de VRAM de Krea 2, que no se documentan en esta ficha.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles. Los ejemplos usan 8 pasos de inferencia sobre Krea 2 Turbo, pero no se reportan tiempos.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros LoRAs de concepto sobre Krea 2 ni adaptadores comparables con los que establecer una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un LoRA de concepto entrenado con un conjunto de imagenes no publico, puede heredar sesgos del dataset de entrenamiento y del modelo base Krea 2.
- Riesgo de alucinacion: inherente a los modelos de difusion; el adaptador puede generar el concepto de forma imprecisa o mezclarlo con otros elementos del prompt.
- Limitaciones de contexto o idioma: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y el token disparador es fijo (`fpwb woman`).
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero la licencia del modelo base Krea 2 y de los datos de entrenamiento del LoRA no se detalla en esta ficha; conviene verificar la licencia de `krea/Krea-2-Raw` antes de un uso comercial.
- Caveat de produccion: el adaptador tiene 33 descargas y ningun "like", sin validacion externa ni metricas publicadas; no se recomienda su uso en produccion sin una evaluacion propia de calidad e identidad.
- El entrenamiento se realizo sobre Krea 2 RAW pero las muestras se generan sobre Krea 2 Turbo; el comportamiento puede diferir si se usa con otras variantes del modelo base.
- No se especifica el rango del LoRA ni el numero de parametros del adaptador, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guillekenzo/aros-f24317ef-Maya
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo (usada en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
