# konadcdc/malayali-woman-krea2-lora

## Resumen

`konadcdc/malayali-woman-krea2-lora` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario konadcdc. Su funcion concreta es inyectar en el modelo base la capacidad de generar representaciones de una mujer malayali (del estado de Kerala, India) mediante la palabra de activacion `malayali woman`. No se trata de un modelo fundacional autonomo, sino de un peso adicional de aproximadamente 0,6 GB que se carga sobre los checkpoints oficiales de Krea.

El adaptador se entrena sobre `krea/Krea-2-Raw`, el checkpoint no destilado del modelo base, y se ejecuta en inferencia sobre `krea/Krea-2-Turbo`, la variante destilada en 8 pasos. Esta separacion entrenamiento/inferencia es el flujo recomendado por el propio ecosistema Krea: los LoRA entrenados en RAW se expresan con fuerza sobre Turbo, lo que permite obtener imagenes en muy pocos pasos de muestreo.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia Apache 2.0. Su interes practico reside en servir como ejemplo reproducible del pipeline DreamBooth sobre Krea 2 con la libreria diffusers, mas que como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible (pesos LoRA, repo de 0,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth entrenado con el entrenador oficial de Krea 2 para diffusers (`examples/dreambooth/README_krea2.md`). El modelo base Krea 2 se distribuye en dos checkpoints: RAW, el modelo no destilado sobre el que se realiza el ajuste fino, y Turbo, una variante destilada para inferencia en 8 pasos. El LoRA se entrena sobre RAW y se aplica sobre Turbo en produccion.

La model card no documenta el numero de imagenes de entrenamiento, la composicion del dataset, el rango del LoRA, la tasa de aprendizaje ni si hubo regularizacion. Tampoco se especifica el numero de tokens de texto ni el codificador de texto empleado, mas alla de la referencia al pipeline `Krea2Pipeline` de diffusers. La unica innovacion tecnica reseñable es el propio flujo RAW/Turbo: entrenar en el modelo completo y desplegar en el destilado, lo que reduce el coste de inferencia sin reentrenar el adaptador.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por la palabra de activacion `malayali woman`.
- Aplicacion sobre el modelo Krea 2 Turbo con receta de 8 pasos de inferencia y `guidance_scale=0.0` (sin classifier-free guidance).
- Composicion con otros LoRA mediante las utilidades de carga, ponderacion, fusion y merge de diffusers.
- Compatibilidad con el pipeline `Krea2Pipeline` de la libreria diffusers en `torch.bfloat16`.
- No soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un adaptador de difusion.
- No se declaran capacidades multilingues ni de vision mas alla de la generacion de imagenes.

## Casos de uso

- Generacion de retratos de referencia cultural: el LoRA permite producir imagenes de mujeres malayali con coherencia visual dentro de un pipeline Krea 2 Turbo, util para ilustracion editorial o material divulgativo sobre Kerala.
- Prototipado rapido de personajes: al ejecutarse en Turbo con 8 pasos, sirve para iterar variaciones de un personaje concreto en segundos sobre una GPU de consumo.
- Prueba de concepto de DreamBooth sobre Krea 2: el repositorio documenta el flujo completo (entrenamiento en RAW, inferencia en Turbo) y puede reutilizarse como plantilla para adaptar otros sujetos.
- Composicion con LoRA de estilo: combinado mediante merge o ponderacion con adaptadores de estetica, permite fijar la identidad del sujeto y variar el estilo visual.
- Generacion de datasets sinteticos acotados: para tareas de aumentacion de datos con diversidad regional, siempre que se revise el sesgo y la fidelidad cultural de las salidas.
- Demostraciones y talleres: por su tamano reducido (0,6 GB) y su licencia permisiva, es adecuado para ejemplos docentes de ajuste fino de modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del checkpoint Krea 2 Turbo cargado en `bfloat16`, no del LoRA (0,6 GB adicionales).
- GPU recomendadas: no especificadas por el autor; el ejemplo oficial usa `torch_dtype=torch.bfloat16` sobre CUDA.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el requisito real lo marca el modelo base Krea 2, no el adaptador.
- Opciones de despliegue: `Krea2Pipeline` de diffusers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este formato).
- Latencia y throughput: no disponibles; la receta Turbo de 8 pasos sugiere inferencia rapida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| konadcdc/malayali-woman-krea2-lora | LoRA DreamBooth sobre Krea 2 | no disponible (repo 0,6 GB) | no aplica | Apache 2.0 | HuggingFace, 0 descargas |
| krea/Krea-2-Raw | Modelo base de difusion | no disponible | no aplica | no disponible en la informacion | HuggingFace (referenciado) |
| krea/Krea-2-Turbo | Modelo base destilado (8 pasos) | no disponible | no aplica | no disponible en la informacion | HuggingFace (referenciado) |

No se dispone de datos de benchmarks ni de especificaciones de parametros de los modelos base que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card incluye secciones sin completar (`TODO`) sobre datos de entrenamiento, sesgos y ejemplos de uso; no hay documentacion sobre la composicion del dataset ni posibles problemas latentes.
- Riesgo de alucinacion visual y de estereotipacion: un LoRA entrenado sobre un sujeto cultural concreto puede reproducir cliches regionales; no se documenta ninguna mitigacion.
- El adaptador solo se activa con la palabra `malayali woman`; fuera de ese disparador su efecto no esta descrito.
- No se declaran idiomas soportados ni se documenta el comportamiento con prompts en castellano u otras lenguas.
- Aunque la licencia del adaptador es Apache 2.0, el uso comercial depende tambien de la licencia de los checkpoints base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`, que no se detalla en la informacion proporcionada.
- El repositorio no tiene descargas ni validacion de la comunidad; no hay evidencia externa de calidad o estabilidad en produccion.
- La receta de inferencia asume `guidance_scale=0.0` y 8 pasos; desviarse de estos valores puede degradar el resultado y no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/konadcdc/malayali-woman-krea2-lora
- Modelo base RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Paper de DreamBooth: https://dreambooth.github.io/
- Entrenador Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
