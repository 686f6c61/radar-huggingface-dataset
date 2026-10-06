# Lonuhbow/eats2

## Resumen

Lonuhbow/eats2 es un adaptador LoRA de tipo DreamBooth para generacion de imagen a partir de texto (text-to-image), entrenado sobre el checkpoint Krea 2 RAW de Krea. Lo publica el usuario Lonuhbow en HuggingFace bajo licencia Apache 2.0. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino de bajo rango que se cargan sobre el pipeline Krea2Pipeline para introducir un concepto concreto activado por la palabra disparadora `Eats2`.

El modelo base, Krea 2, se distribuye en dos variantes: RAW (base no destilada, empleada para entrenar el LoRA) y Turbo (destilada a 8 pasos de inferencia, pensada para generacion rapida). Segun la model card, los LoRA entrenados sobre RAW se expresan con fuerza sobre Turbo, por lo que el flujo recomendado es entrenar en RAW y desplegar en Turbo. Esto lo hace relevante para quien quiera personalizar Krea 2 sin reentrenar el modelo completo.

El repositorio ocupa 3,9 GB y contiene pesos en formato safetensors. La model card es una plantilla autogenerada: la descripcion del dataset de entrenamiento y las limitaciones aparecen como TODO sin completar, por lo que gran parte de los detalles tecnicos no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image (Krea 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagen text-to-image) |
| Tipos de cuantizacion | no disponible (pesos safetensors; el ejemplo de uso carga el pipeline en bfloat16) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la palabra disparadora es `Eats2`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado mediante DreamBooth con el entrenador de Krea 2 de diffusers, tomando como base el checkpoint krea/Krea-2-Raw. El repositorio incluye los pesos del adaptador, no una arquitectura de red propia: la arquitectura efectiva es la del modelo de difusion Krea 2 sobre el que se carga. El disparador de generacion es la cadena `Eats2`, y en el ejemplo de la model card la inferencia se realiza sobre Krea-2-Turbo con 8 pasos y `guidance_scale=0.0` (receta Turbo sin classifier-free guidance).

No hay informacion publicada sobre el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos, el rango del LoRA ni si se aplicaron tecnicas adicionales de regularizacion. Los apartados "Training details" y "Limitations and bias" de la model card siguen marcados como TODO. La unica innovacion documentada es la propia estrategia del base: entrenar sobre RAW y ejecutar sobre Turbo, con soporte para ponderacion, mezcla y fusion de LoRA segun la documentacion de diffusers.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) mediante Krea2Pipeline.
- Personalizacion de un concepto concreto mediante la palabra disparadora `Eats2`.
- Carga como adaptador LoRA sobre Krea-2-Turbo (y sobre Krea-2-Raw, segun el flujo de entrenamiento).
- Compatible con ponderacion, mezcla y fusion de adaptadores LoRA mediante la API de diffusers.
- Inferencia rapida en la variante Turbo (8 pasos, sin CFG en el ejemplo documentado).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modos de razonamiento; no aplican a este tipo de modelo.

## Casos de uso

- Personalizacion de un concepto visual propio: cargar el LoRA sobre Krea-2-Turbo y generar variaciones del concepto activado por `Eats2` sin reentrenar el modelo base.
- Generacion de imagenes para prototipado de producto o concepto: usar el adaptador para producir bocetos consistentes del concepto aprendido dentro de un pipeline de diseno iterativo.
- Creacion de contenido para redes o publicaciones: generar imagenes tematicas a partir de prompts que incluyan `Eats2` y combinarlas con otros LoRA mediante fusión de adaptadores.
- Experimentacion en investigacion sobre DreamBooth: servir como caso de estudio reproducible para comparar el comportamiento de un LoRA entrenado en RAW y ejecutado en Turbo.
- Integracion en un flujo de trabajo con diffusers: incorporar `pipe.load_lora_weights("Lonuhbow/eats2")` en scripts de generacion por lotes controlados por parametros de prompt.
- Edicion y variacion de estilo sobre el concepto aprendido: aplicar distintos pesos de adaptador (escalado) para modular la intensidad del concepto en la imagen final.
- Pruebas de despliegue de LoRA en produccion creativa: validar latencia y calidad en la receta Turbo de 8 pasos antes de escalar a un servicio de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM para el pipeline Krea 2; no disponible.
- El repositorio del adaptador ocupa 3,9 GB, aunque el peso efectivo de un LoRA suele ser muy inferior al del modelo base; no disponible el desglose.
- El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica el uso de una GPU con soporte CUDA.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Si cabe en GPU de consumo: no disponible; depende del modelo base Krea 2, cuyos requisitos no se detallan.
- Opciones de despliegue documentadas: diffusers con `Krea2Pipeline`. Otras opciones (ComfyUI, interfaces graficas, servidores de inferencia) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles; la receta Turbo de 8 pasos sugiere una inferencia mas rapida que la variante RAW, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion objetiva con otros LoRA de personalizacion o con adaptadores equivalentes sobre Krea 2.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada: el dataset de entrenamiento y las limitaciones no estan documentados (apartados "Training details" y "Limitations and bias" en TODO).
- Riesgo de sobreajuste al concepto aprendido: al ser un LoRA DreamBooth, puede degradar la diversidad o forzar el concepto cuando no se desea, especialmente si se combina con prompts genericos.
- Dependencia del modelo base: el comportamiento final esta condicionado por las capacidades y limitaciones de Krea 2, que no se detallan aqui.
- La licencia declarada del adaptador es Apache 2.0, pero la licencia de los checkpoints base (krea/Krea-2-Raw y krea/Krea-2-Turbo) no se especifica en la informacion disponible; conviene verificarla antes de un uso comercial.
- Rendimiento no verificado: el repositorio tiene 0 descargas y 0 likes, sin validacion externa ni benchmarks publicados.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; no disponible.
- Idioma de los prompts: la model card no declara soporte multilingue; la unica palabra disparadora documentada es `Eats2`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lonuhbow/eats2
- Archivos del modelo: https://huggingface.co/Lonuhbow/eats2/tree/main
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- DreamBooth (paper/proyecto): https://dreambooth.github.io/
- Entrenador Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
