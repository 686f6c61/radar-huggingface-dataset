# Nanami231/pearl-26

## Resumen

Pearl-26 es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Nanami231. El adaptador inyecta un concepto visual concreto, invocado mediante el token `PEARL@26`, sobre el modelo base `krea/Krea-2-Raw`. No se trata de un modelo fundacional, sino de un peso adicional de bajo rango (1,7 GB en el repositorio) que modifica el comportamiento generativo del modelo base sin reentrenarlo por completo.

El proposito del modelo es permitir la generacion controlada de un concepto especifico (una entidad denominada PEARL@26) en composiciones arbitrarias: ciudades cyberpunk, jardines mediterraneos o abismos submarinos, segun los ejemplos de la model card. La relevancia practica es la habitual de los LoRA de personalizacion: bajo coste de almacenamiento, carga dinamica sobre el modelo base y compatibilidad con el ecosistema diffusers.

La informacion disponible es limitada: no se publican detalles del dataset de entrenamiento, hiperparametros, numero de pasos ni evaluaciones cuantitativas. El modelo acumula 9 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 15 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre el modelo de difusion Krea 2; no disponible el detalle interno de la red base |
| Parametros totales | no disponible (el repositorio ocupa 1,7 GB, incluyendo pesos del adaptador y muestras) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud maxima de prompt) |
| Tipos de cuantizacion | no disponible; los ejemplos usan `torch.bfloat16` |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con diffusers (`load_lora_weights`); no se especifica si se distribuye tambien en safetensors suelto o GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con la tecnica DreamBooth sobre el modelo base Krea 2 en su variante RAW (`krea/Krea-2-Raw`). La model card indica que el entrenamiento se realizo sobre RAW y que las muestras se generaron sobre la variante Turbo (`krea/Krea-2-Turbo`) con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere compatibilidad entre ambas variantes del modelo base.

No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la composicion del dataset. Tampoco se documenta el uso de tecnicas adicionales como regularizacion por clase, captions automaticos o aumento de datos. La unica innovacion tecnica documentada es el uso de un token disparador dedicado, `PEARL@26`, que activa el concepto aprendido.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto PEARL@26, invocado mediante el token `PEARL@26` en el prompt.
- Composicion del concepto en escenas diversas: entornos urbanos, naturales, submarinos y arquitectonicos, segun los ejemplos publicados.
- Integracion con el pipeline `Krea2Pipeline` de diffusers mediante `pipe.load_lora_weights(...)`.
- Compatibilidad declarada con el modelo base Krea 2 RAW y uso demostrado sobre Krea 2 Turbo con 8 pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; no aplican a un modelo de difusion texto-a-imagen.
- Capacidades multilingues: no documentadas; los ejemplos estan en ingles.

## Casos de uso

- Ilustracion conceptual de producto: generar variaciones de una entidad PEARL@26 en distintos contextos (urbano, natural, submarino) para exploracion visual temprana, aprovechando la capacidad del LoRA de mantener la identidad del concepto entre escenas.
- Creacion de arte digital tematico: producir imagenes coherentes con un motivo recurrente para portfolios, portadas o series visuales, usando el token disparador para garantizar consistencia estilistica.
- Prototipado rapido en pipelines de diseno: cargar el adaptador sobre Krea 2 Turbo con 8 pasos para iterar bocetos en segundos dentro de un flujo de trabajo con diffusers.
- Generacion de material para videojuegos o narrativa transmedia: crear assets visuales de un concepto ficticio concreto (objetos, criaturas, estatuas) manteniendo coherencia entre entregas.
- Experimentacion academica con LoRA y DreamBooth: usar el adaptador como caso de estudio de personalizacion de modelos de difusion, comparando el efecto del token disparador frente a prompts sin el.
- Demos y pruebas de integracion: validar la carga de LoRA sobre `Krea2Pipeline` en entornos de desarrollo antes de desplegar adaptadores propios en produccion.
- Marketing y contenido para redes: generar escenas tematicas con un motivo de marca registrado como concepto visual, siempre que la licencia Apache 2.0 del adaptador y la del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2, no del adaptador. El LoRA anade una sobrecarga minima sobre los pesos del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada; los ejemplos usan `torch.bfloat16` en CUDA, lo que requiere GPU con soporte bfloat16 (Ampere o posterior, por ejemplo A100, H100, RTX 3090/4090).
- Ajuste en GPU de consumo: no confirmado; depende de los requisitos del modelo base Krea 2, no documentados aqui.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights`; no se documentan otros runners (vLLM, llama.cpp, Ollama, TGI no aplican a difusion, pero tampoco se mencionan ComfyUI o Automatic1111).
- Latencia y throughput: no disponibles; la model card indica 8 pasos de inferencia en Turbo, pero no reporta tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion de entrenamiento ausente: no se documentan dataset, hiperparametros ni evaluacion, lo que impide auditar el comportamiento del adaptador.
- Riesgo de sobreajuste al concepto: al ser un LoRA DreamBooth con un token disparador especifico, el concepto puede filtrarse en prompts no relacionados o perder fidelidad fuera de las composiciones vistas en entrenamiento.
- Alucinacion visual: como todo modelo de difusion, puede generar detalles incoherentes o artefactos, especialmente en escenas complejas o con multiples sujetos.
- Idiomas: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y el comportamiento con prompts en castellano no esta verificado.
- Licencia: el adaptador se distribuye bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base `krea/Krea-2-Raw`, que no se detalla en la informacion disponible; conviene verificarla antes de desplegar en produccion.
- Madurez: 9 descargas y 0 likes indican un modelo practicamente sin validacion por la comunidad; no hay evidencia de robustez en produccion.
- Repositorio de 1,7 GB: incluye probablemente pesos y muestras; el tamano real del adaptador no se desglosa, lo que complica estimar el coste de almacenamiento en despliegues con muchos LoRA.
- Sin garantias de compatibilidad futura: al depender de `Krea2Pipeline` y de las variantes RAW y Turbo del modelo base, cambios en diffusers o en el modelo base pueden romper la carga del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/Nanami231/pearl-26
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en las muestras: https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de diffusers (carga de LoRA): https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
