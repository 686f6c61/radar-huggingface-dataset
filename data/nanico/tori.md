# Nanico/tori

## Resumen

Nanico/tori es un adaptador LoRA de tipo DreamBooth para el modelo de generación de imágenes Krea 2, entrenado sobre la variante Krea-2-Raw y presentado por el autor sobre Krea-2-Turbo. Lo publica el usuario Nanico en Hugging Face bajo licencia Apache 2.0 y con la librería diffusers como formato de carga. El repositorio ocupa 1,0 GB y se creó el 11 de noviembre de 2026, con una actualización posterior el mismo día.

El adaptador inyecta un concepto concreto, invocado mediante el token `tri`, que el autor ilustra con tres ejemplos: un búho cibernético con espectro tricolor, un templo de piedra con una puerta trilobulada y una tarta de tres capas en un salón submarino. No es un modelo fundacional, sino un complemento que modifica el comportamiento del modelo base Krea 2 para reproducir un estilo o concepto aprendido.

Su relevancia es limitada y muy específica: sirve para quien ya trabaje con Krea 2 y quiera incorporar el concepto `tri` en sus generaciones sin reentrenar. No hay información pública sobre el dataset de entrenamiento, el número de pasos, la resolución o los hiperparámetros, y el modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el repositorio pesa 1,0 GB, pero no se detalla el desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión en el sentido de contexto textual) |
| Tipos de cuantizacion | no disponible; el ejemplo de uso emplea `torch.bfloat16` |
| Idiomas soportados | no disponible (el prompt de instancia y los ejemplos están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con diffusers (`load_lora_weights`); no se especifica si hay safetensors, GGUF u otros |

## Arquitectura y entrenamiento

El modelo es un LoRA de tipo DreamBooth para Krea 2, según indica la model card. Se entrenó sobre Krea-2-Raw y las muestras se generaron sobre Krea-2-Turbo con 8 pasos de inferencia. La model card no detalla la arquitectura interna del modelo base (si es un transformer de difusión, un UNet o un híbrido), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

La innovación técnica declarada se limita al uso del token disparador `tri` para invocar el concepto aprendido. No se documentan técnicas como decodificación especulativa, atención lineal ni optimizaciones de muestreo más allá del uso de Turbo con 8 pasos y `guidance_scale=0.0`. Tampoco se indica el rango del adaptador, el número de pasos de entrenamiento, la resolución de las imágenes de entrenamiento ni el tamaño del dataset.

## Capacidades

- Generación de imágenes text-to-image condicionada por el modelo base Krea 2, con el concepto `tri` activable mediante el token disparador.
- Inyección de un concepto o estilo concreto aprendido por DreamBooth, sin necesidad de reentrenar el modelo base.
- Compatibilidad con la librería diffusers mediante `load_lora_weights`.
- Funcionamiento sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, según el ejemplo del autor.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; no aplican a un adaptador de difusión de este tipo.
- Capacidades multilingües: no disponibles; los ejemplos y el prompt de instancia están en inglés.

## Casos de uso

- Ilustración conceptual con identidad visual propia: usar el token `tri` para generar búhos cibernéticos, templos trilobulados o composiciones tricolor de forma consistente en una serie de imágenes, aprovechando que el LoRA fija ese concepto.
- Prototipado rápido de arte para videojuegos o narrativa visual: generar variaciones del concepto `tri` sobre Krea-2-Turbo en 8 pasos para explorar direcciones artísticas antes de producir assets finales.
- Creación de material promocional temático: producir imágenes de marca o campaña que compartan el motivo tricolor del adaptador, manteniendo coherencia entre piezas.
- Experimentación académica con LoRA y DreamBooth: usar el adaptador como ejemplo reproducible de cómo un LoRA sobre Krea 2 modifica el comportamiento del modelo base, comparando con otras variantes.
- Generación de fondos y escenarios fantásticos: emplear los ejemplos del autor (templo con puerta trilobulada, salón submarino con tarta de tres capas) como base para escenarios de fantasía o ciencia ficción.
- Integración en pipelines de diffusers: cargar el LoRA junto con Krea-2-Turbo en un script de Python para generación por lotes, tal como muestra el código de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; depende del modelo base Krea 2, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles; el ejemplo de la model card usa `torch.bfloat16` y `cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; no se indica si Krea 2 cabe en tarjetas consumer como RTX 4090 o similares.
- Opciones de despliegue: diffusers (único método documentado en la model card, mediante `Krea2Pipeline.from_pretrained` y `load_lora_weights`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles; solo se indica que las muestras se generaron con 8 pasos de inferencia sobre Krea-2-Turbo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA o adaptadores comparables sobre Krea 2, ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un LoRA sobre un modelo base de difusión, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación visual: no cuantificado; como todo modelo generativo de imágenes, puede producir resultados incoherentes o no fieles al prompt.
- Limitaciones de contexto o idioma: no se especifican; los ejemplos y el prompt de instancia están en inglés, y no hay información sobre otros idiomas.
- Restricciones de licencia: la licencia del adaptador es Apache 2.0, pero el uso comercial depende también de la licencia del modelo base Krea-2-Raw y Krea-2-Turbo, que no se detalla en la información proporcionada.
- Caveat para producción: el adaptador está pensado para invocar un concepto concreto (`tri`) y no como modelo generalista; su uso fuera de ese concepto puede degradar la calidad. Además, el repositorio no tiene descargas ni valoraciones, y la documentación sobre entrenamiento e hiperparámetros es mínima.
- El token disparador `tri` es obligatorio para activar el concepto; sin él, el LoRA puede no tener efecto apreciable.

## Enlaces

- Hugging Face: https://huggingface.co/Nanico/tori
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo de presentación (Turbo): https://huggingface.co/krea/Krea-2-Turbo (referenciado en el código de la model card)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
