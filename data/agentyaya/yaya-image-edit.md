# agentyaya/yaya-image-edit

## Resumen

yaya-image-edit es un modelo de edición de imágenes basado en el modelo Qwen/Qwen-Image-Edit-2511, publicado por el usuario agentyaya en Hugging Face. Se trata de un "repack" o redistribución del modelo original de Alibaba, en el que únicamente se han renombrado los archivos internos y el repositorio, sin modificar los pesos del modelo. El modelo original Qwen-Image-Edit-2511 es un modelo de edición de imágenes de última generación desarrollado por el equipo de Qwen, con una arquitectura basada en difusión y aproximadamente 20 400 millones de parámetros.

El modelo está diseñado para tareas de image-to-image, permitiendo editar imágenes existentes mediante instrucciones en lenguaje natural. Su pipeline en la librería diffusers es QwenImageEditPlusPipeline, lo que indica soporte para edición conversacional multi-turno. La relevancia de este lanzamiento radica en que ofrece una alternativa con licencia Apache-2.0 para edición de imágenes, un ámbito dominado por modelos con restricciones comerciales más estrictas. El modelo tiene un tamaño de repositorio de 57,7 GB y está disponible en formato safetensors.

Al ser un reempaquetado sin modificaciones, todas las capacidades y limitaciones del modelo original se mantienen intactas. La publicación es reciente (agosto de 2026) y no cuenta aún con descargas ni valoraciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (DiT, basado en Qwen-Image-Edit-2511) |
| Parametros totales | 20 430 401 088 (20,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-Edit-2511 emplea una arquitectura de difusión basada en transformers (DiT), diseñada específicamente para tareas de edición de imágenes. El pipeline QwenImageEditPlusPipeline de diffusers indica que el modelo soporta edición conversacional, lo que implica la capacidad de procesar instrucciones de edición en lenguaje natural y aplicarlas a una imagen de entrada, manteniendo el contexto de ediciones anteriores en una conversación multi-turno.

En cuanto al entrenamiento, no se dispone de información detallada sobre los datos utilizados, el número de tokens de entrenamiento o las técnicas de alineación empleadas (RLHF, DPO, etc.). Dado que yaya-image-edit es un reempaquetado sin modificaciones de los pesos, las características de entrenamiento del modelo original se mantienen, pero no se han publicado detalles específicos en la información disponible. El modelo tiene un tamaño de 20 400 millones de parámetros, lo que lo sitúa en la gama alta de modelos de edición de imágenes de código abierto.

## Capacidades

- Edición de imágenes mediante instrucciones en lenguaje natural (image-to-image).
- Edición conversacional multi-turno, permitiendo refinar ediciones de forma iterativa en un mismo hilo de conversación.
- Generación de imágenes a partir de descripciones textuales (text-to-image), como capacidad derivada del modelo base.
- Edición con instrucciones complejas que combinan múltiples operaciones (cambiar fondo, añadir objetos, modificar atributos).
- Comprensión de instrucciones en lenguaje natural gracias a la integración de un codificador de lenguaje en la arquitectura.
- Soporte para el pipeline QwenImageEditPlusPipeline de la librería diffusers.

## Casos de uso

- Edición de imágenes para comercio electrónico: modificar el fondo de fotografías de producto, cambiar el color o la textura de un artículo, o añadir elementos contextuales sin necesidad de software de edición profesional.
- Generación de variantes creativas para diseño gráfico: los diseñadores pueden generar múltiples alternativas de una misma imagen base cambiando la iluminación, el estilo o los elementos compositivos mediante instrucciones textuales.
- Restauración y mejora de imágenes históricas: el modelo puede recibir una imagen antigua o dañada y aplicar instrucciones para mejorar su nitidez, corregir el color o eliminar artefactos.
- Creación de contenido para redes sociales: generar variaciones de una imagen base adaptadas a diferentes plataformas o estilos visuales (minimalista, vintage, futurista) con instrucciones simples.
- Prototipado rápido en diseño de producto: los equipos de producto pueden visualizar rápidamente diferentes opciones de diseño (colores, materiales, disposición de elementos) sobre una fotografía real del prototipo.
- Automatización de flujos de trabajo de postproducción: integrar el modelo en pipelines automatizados que apliquen ediciones estandarizadas a lotes de imágenes, como la eliminación de fondos o la normalización de iluminación en catálogos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un reempaquetado del modelo Qwen/Qwen-Image-Edit-2511, cuyos resultados de evaluación no han sido incluidos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 20 400 millones de parámetros en precisión fp32, lo que requiere aproximadamente 82 GB de VRAM. Con cuantización a fp16 o bf16, la necesidad se reduce a unos 41 GB, y con cuantización de 8 bits a unos 21 GB.
- GPU recomendadas: para inferencia en fp16 se recomienda al menos una NVIDIA A100 de 80 GB, o dos GPUs de 48 GB (como A6000 o L40S) en paralelo. Para cuantización de 8 bits, una RTX 4090 de 24 GB podría ser suficiente, aunque con limitaciones de batch size.
- No cabe en GPUs de consumo de gama media (8-16 GB de VRAM) sin cuantización agresiva (4 bits), que degradaría significativamente la calidad de la edición.
- Opciones de despliegue: al ser un modelo de difusión, se puede desplegar con la librería diffusers de Hugging Face, o mediante servidores de inferencia especializados como ComfyUI o servicios en la nube con soporte para modelos de difusión.
- Latencia y throughput: no se han publicado datos de rendimiento específicos para este modelo. Dado su tamaño, se estima que la generación de una imagen de 1024x1024 en una A100 podría tardar entre 10 y 30 segundos, dependiendo del número de pasos de difusión configurados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pipeline |
|---|---|---|---|---|
| yaya-image-edit | 20,4 B | no disponible | Apache-2.0 | image-to-image |
| Qwen-Image-Edit-2511 | 20,4 B | no disponible | Apache-2.0 | image-to-image |
| FLUX.1 Kontext | 12 B | no disponible | Apache-2.0 | image-to-image |
| SeedEdit (ByteDance) | no disponible | no disponible | no disponible | image-to-image |

El modelo es funcionalmente idéntico a Qwen-Image-Edit-2511, ya que es un reempaquetado sin modificaciones. Frente a alternativas como FLUX.1 Kontext, ofrece un mayor número de parámetros, aunque los datos comparativos de rendimiento no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Al ser un reempaquetado, no aporta ninguna mejora ni diferencia funcional respecto al modelo original Qwen-Image-Edit-2511. Se recomienda verificar la documentación del modelo original para conocer las limitaciones detalladas.
- No se dispone de información sobre sesgos del modelo, riesgos de alucinación visual o limitaciones idiomáticas en la documentación proporcionada.
- El tamaño del repositorio (57,7 GB) implica que la descarga y el despliegue requieren un ancho de banda y almacenamiento considerables.
- Aunque la licencia Apache-2.0 permite uso comercial, es necesario revisar los términos de la licencia del modelo base para confirmar que no existen restricciones adicionales.
- El modelo no cuenta con descargas ni validación de la comunidad en Hugging Face, por lo que su fiabilidad en producción no ha sido contrastada.
- La ausencia de información sobre cuantizaciones disponibles limita las opciones de despliegue en hardware con VRAM restringida.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentyaya/yaya-image-edit
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Perfil del autor: https://huggingface.co/agentyaya
- Modelos del autor: https://huggingface.co/agentyaya/models
