# briaai/Fibo-2.0-edit-turbo

## Resumen

Fibo-2.0-edit-turbo es un modelo de edicion de imagen (image-to-image e inpainting) desarrollado por Bria AI, una empresa especializada en modelos generativos visuales con licencias comercialmente permisivas y entrenamiento con datos licenciados. Se trata de la variante destilada y acelerada de Fibo-2.0-dev, su modelo base de edicion, y esta disenado para ejecutar ediciones guiadas por prompt en pocos pasos de inferencia, reduciendo la latencia frente al modelo completo.

El modelo se distribuye en formato diffusers bajo la clase `BriaFibo2Pipeline` y ocupa 25,5 GB en el repositorio, con aproximadamente 8.127 millones de parametros en pesos safetensors. Soporta edicion con multiples referencias visuales, inpainting y "structured prompts" (prompts estructurados en formato VGL), lo que lo orienta a flujos de produccion donde se requiere control preciso sobre la region editada y coherencia con imagenes de referencia.

Su relevancia actual radica en dos factores: la licencia `bria-fibo`, pensada para uso comercial bajo condiciones, y el acceso restringido (gated) en Hugging Face, que obliga a aceptar terminos antes de descargar. Es una alternativa a modelos de edicion de imagen de gran escala con requisitos de hardware moderados gracias a la destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para edicion de imagen; pipeline `BriaFibo2Pipeline` en diffusers) |
| Parametros totales | 8.127.342.213 (~8,1 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | bria-fibo (licencia personalizada, acceso restringido) |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna (tipo de backbone, variante de difusion, uso de transformers o DiT, numero de bloques, etc.). El modelo se presenta como un sistema de edicion de imagen basado en difusion, integrado en la libreria diffusers mediante la clase `BriaFibo2Pipeline`, y derivado del modelo base `briaai/Fibo-2.0-dev` mediante un proceso de destilacion (tag `distillation`).

La informacion disponible indica que Fibo-2.0-edit-turbo es una version destilada de Fibo-2.0-dev, lo que implica un entrenamiento de destilacion para reducir el numero de pasos de inferencia necesarios. Tambien se mencionan capacidades de edicion con multiples referencias (`multi-reference`), inpainting y soporte de prompts estructurados (`structured-prompts`, `vgl`). No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Existe un paper asociado con identificador arXiv:2511.06876, pero su contenido no esta incluido en la informacion proporcionada.

## Capacidades

- Edicion de imagen guiada por prompt (image-to-image): transformacion de una imagen de entrada segun instrucciones en lenguaje natural.
- Inpainting: edicion localizada en regiones enmascaradas de la imagen.
- Multi-reference: uso de multiples imagenes de referencia para condicionar la edicion.
- Structured prompts (VGL): soporte de prompts estructurados para un control mas preciso de la edicion.
- Destilacion: inferencia en pocos pasos, orientada a baja latencia.
- Idioma: instrucciones en ingles (`en`).
- No se documentan en la informacion disponible capacidades de generacion de video, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Edicion de producto en e-commerce: sustituir fondos, cambiar colores o integrar un producto en escenas nuevas usando inpainting y prompts estructurados, manteniendo coherencia con imagenes de referencia del catalogo.
- Retoque fotografico automatizado en pipelines de medios: aplicar ediciones localizadas (eliminacion de objetos, cambios de vestuario o entorno) en lotes, aprovechando la variante turbo para reducir coste por imagen.
- Creacion de variantes de creatividades publicitarias: generar multiples versiones de un anuncio a partir de una imagen base y varias referencias de marca, con control sobre la region editada.
- Prototipado de diseno grafico: iterar rapidamente sobre mockups y composiciones visuales con instrucciones en lenguaje natural y edicion por regiones.
- Generacion de assets para videojuegos o entornos 3D: producir variaciones de texturas y elementos visuales a partir de referencias, integradas en herramientas internas via diffusers.
- Preprocesado de datasets visuales: normalizar, limpiar o aumentar imagenes de entrenamiento mediante inpainting y ediciones controladas, con trazabilidad de las referencias usadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~8,1 mil millones de parametros, la inferencia en precision completa requiere del orden de 16-32 GB de VRAM; el repo ocupa 25,5 GB en safetensors.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar GPUs de datacenter (A100 40/80 GB, H100) para precision completa y GPUs consumer de gama alta (RTX 4090 24 GB, RTX 3090 24 GB) con optimizaciones.
- Cabe en GPU consumer: probablemente en RTX 4090/3090 con tecnicas de ahorro de memoria, aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: diffusers (`BriaFibo2Pipeline`) como via principal. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusion de este tipo).
- Latencia y throughput: no disponibles. La variante turbo esta disenada para reducir pasos de inferencia, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de edicion de imagen, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia `bria-fibo`: licencia personalizada; es imprescindible revisar los terminos para uso comercial, redistribucion y despliegue en produccion.
- Idioma: las instrucciones se limitan al ingles; el rendimiento con prompts en castellano no esta garantizado.
- Riesgo de artefactos y sesgos visuales: como modelo de difusion, puede reproducir sesgos presentes en los datos de entrenamiento y generar resultados inconsistentes en ediciones complejas.
- No se documentan limites de resolucion, numero maximo de referencias ni restricciones de contexto visual en la informacion disponible.
- Al ser una variante destilada, puede presentar menor fidelidad que el modelo base `Fibo-2.0-dev` en ediciones dificiles.
- No hay datos publicos de benchmarks que permitan validar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Paper (referencia arXiv): https://arxiv.org/abs/2511.06876
