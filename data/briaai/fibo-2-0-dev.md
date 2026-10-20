# briaai/Fibo-2.0-dev

## Resumen

Fibo-2.0-dev es un modelo de generación y edición de imágenes desarrollado por Bria AI (cuenta `briaai` en HuggingFace) y distribuido bajo acceso restringido. Con 8.127.342.213 parámetros (≈8,13 mil millones) y pesos en safetensors, se publica a través de la librería `diffusers` con un pipeline propio, `BriaFibo2Pipeline`. El repositorio ocupa 25,5 GB y la versión disponible es una build de desarrollo (`dev`), lo que implica que no debe tratarse como una versión estable de producción.

El modelo cubre el espectro completo de generación y edición de imagen: texto a imagen, imagen a imagen, inpainting, edición con múltiples referencias (`multi-reference`) y soporte de prompts estructurados (`structured-prompts`). Esa combinación es la que lo hace relevante: la mayoría de modelos abiertos de edición cubren una o dos de esas tareas, mientras que Fibo 2.0 las agrupa en un único checkpoint, lo que simplifica despliegues que necesitan tanto generación desde cero como modificación controlada de assets existentes. El tag `vgl` y el identificador `fibo` remiten a la familia de generación visual de Bria, y el paper asociado figura con el identificador arXiv 2511.06876.

La relevancia inmediata para un equipo técnico es doble: por un lado, el soporte declarado de `fine-tuning` y de prompts estructurados abre la puerta a pipelines reproducibles y a adaptaciones sobre dominio propio; por otro, el acceso es *gated* y la licencia es `bria-fibo` (categoría `other`), de modo que cualquier uso comercial exige revisar y aceptar las condiciones en HuggingFace antes de descargar los pesos. Solo se declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion y edicion de imagenes (libreria `diffusers`, pipeline `BriaFibo2Pipeline`); familia y detalles internos no disponibles |
| Parametros totales | 8.127.342.213 (≈8,13 mil millones) |
| Parametros activos | No aplica (no se documenta que sea MoE) |
| Longitud de contexto | No aplica (modelo de difusion); no disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `bria-fibo` (`license: other`); acceso restringido sujeto a aceptacion de condiciones |
| Formato de pesos | safetensors (repositorio de 25,5 GB) |
| Libreria y pipeline | `diffusers` / `BriaFibo2Pipeline` |
| Tareas declaradas | text-to-image, image-to-image, inpainting, multi-reference, structured-prompts, fine-tuning |
| Acceso | Restringido (gated) |
| Descargas / likes | 35 descargas / 19 likes |
| Fecha de creacion / actualizacion | 2026-10-18 / 2026-10-20 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como parte de la familia Fibo de Bria y lo empaqueta para `diffusers`, lo que situa la generacion en el paradigma de difusion. El tag `vgl` (Visual Generation Language) y el soporte explicito de `structured-prompts` apuntan a una interfaz de condicionamiento basada en prompts estructurados —previsiblemente JSON— en lugar de solo texto libre, aunque la informacion proporcionada no detalla el esquema ni el formato exacto aceptado. El checkpoint integra en un unico conjunto de pesos las rutas de texto a imagen, imagen a imagen e inpainting, y anade condicionamiento por multiples imagenes de referencia.

No se han facilitado datos sobre el numero de tokens o pares imagen-texto de entrenamiento, la composicion del dataset, la resolucion nativa de entrenamiento ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO). Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa, atencion lineal o variantes de scheduler. Existe una referencia a paper (arXiv 2511.06876) en los tags del repositorio, que es la fuente a consultar para obtener estos detalles. La designacion `dev` indica una version de desarrollo, sin garantias de estabilidad ni de paridad con una futura release.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con el pipeline `BriaFibo2Pipeline`.
- Edicion imagen a imagen: transformacion de una imagen de entrada guiada por instrucciones.
- Inpainting: relleno de regiones enmascaradas dentro de una imagen existente.
- Edicion multi-referencia: condicionamiento con varias imagenes de referencia simultaneas para transferir identidad, estilo o composicion.
- Prompts estructurados: soporte de entradas de condicionamiento estructuradas, orientadas a control reproducible de la generacion.
- Fine-tuning: el modelo esta publicado con la intencion de permitir ajuste sobre datos propios.
- Cobertura de idioma limitada al ingles en la formulacion de prompts.
- No se documenta soporte de tool calling, function calling, comportamiento agentico, razonamiento multi-paso, audio ni video en la informacion disponible.

## Casos de uso

- Edicion de catalogo en e-commerce: dado un producto fotografiado una vez, el modelo puede generar variantes de fondo, iluminacion y encuadre mediante image-to-image, manteniendo la coherencia del objeto gracias al condicionamiento multi-referencia. Reduce el coste de sesiones fotograficas por referencia de producto.
- Retoque y eliminacion de elementos en postproduccion: la ruta de inpainting permite borrar objetos no deseados, cables o marcas de agua sobre una mascara y reconstruir la zona con coherencia de contexto, integrándose en un pipeline automatizado de limpieza de assets.
- Generacion por plantilla con prompts estructurados: al aceptar entradas estructuradas, el modelo encaja en sistemas que rellenan una plantilla (sujeto, estilo, encuadre, paleta) desde una base de datos y producen lotes de imagenes reproducibles sin reescribir prompts de texto libre para cada variacion.
- Creatividades publicitarias a escala: combinando text-to-image e image-to-image se pueden producir variaciones de un mismo concepto creativo para distintos formatos y audiencias, con la referencia visual de marca como imagen de condicionamiento.
- Consistencia de personaje o producto en series visuales: el soporte multi-referencia permite fijar un sujeto concreto y generar distintas escenas manteniendo su apariencia, util para ilustracion editorial, comics o storyboards.
- Ajuste sobre dominio propio: al estar orientado a fine-tuning, un estudio puede adaptar el checkpoint a un estilo grafico o a una categoria de producto concreta y servirlo internamente mediante `diffusers`.
- Previsualizacion rapida en estudios de videojuegos o animacion: generacion de concept art y variaciones de bocetos (image-to-image) antes de comprometer horas de produccion artistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia el paper arXiv 2511.06876, pero no se incluyen en la informacion proporcionada cifras de metricas como FID, CLIP-score, GenEval, T2I-CompBench ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16,3 GB solo para pesos (8,13 mil millones de parametros × 2 bytes); con activaciones y overhead del pipeline, el consumo real sera mayor y dependera de la resolucion de salida y del tamano de lote. Estimacion calculada a partir del recuento de parametros, no confirmada por el autor.
- VRAM en fp32: aproximadamente 32,5 GB solo para pesos.
- VRAM en int8: aproximadamente 8,1 GB para pesos; en int4, aproximadamente 4,1 GB. No se documenta en la informacion proporcionada que existan checkpoints cuantizados oficiales.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) cubren el modelo en bf16 con margen para lotes mayores y resoluciones altas.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) deberia poder ejecutar el modelo en bf16 con lote pequeno; tarjetas de 16 GB requeririan cuantizacion u offloading a CPU, no documentado oficialmente.
- Despliegue: al publicarse para `diffusers`, la via natural es cargar el pipeline `BriaFibo2Pipeline`; no se documentan en la informacion disponible integraciones verificadas con vLLM, TGI, llama.cpp, Ollama o ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fibo-2.0-dev (Bria) | 8,13 mil millones | No disponible | T2I, I2I, inpainting, multi-referencia, prompts estructurados | `bria-fibo` (other), acceso gated | HuggingFace, `diffusers` |
| Modelos abiertos de edicion de imagen de ~10-20 mil millones (familia Flux Kontext, Qwen-Image-Edit, Step1X-Edit) | No verificado en esta ficha | No verificado en esta ficha | Edicion instruccional y multi-imagen en varios de ellos | Variables, frecuentemente no comercial | HuggingFace |
| Modelos de difusion pequenos (1-3 mil millones, tipo SDXL/SD3.5 Medium) | No verificado en esta ficha | No verificado en esta ficha | T2I e I2I, inpainting via pipeline aparte | Abiertas en varios casos | HuggingFace, amplio ecosistema |

Los datos de los modelos comparativos no han sido verificados contra la informacion proporcionada en esta ficha y se incluyen solo como marco de referencia; no deben citarse como cifras contrastadas. En lo que si destaca Fibo-2.0-dev frente a alternativas genericas es en la combinacion simultanea de multi-referencia, prompts estructurados y soporte declarado de fine-tuning en un unico checkpoint.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; los prompts en castellano pueden degradar la calidad o el cumplimiento de la instruccion.
- Licencia: `bria-fibo` con categoria `other`. No se detallan en la informacion disponible los terminos de uso comercial, redistribucion ni los limites de usuarios mensuales; es obligatorio revisar y aceptar las condiciones en HuggingFace antes de cualquier despliegue productivo.
- Acceso restringido: el repositorio es *gated*, lo que impide la descarga anonima y anade friccion a pipelines de CI/CD y a la replicabilidad academica.
- Version de desarrollo: el sufijo `dev` indica que no es una release estable; pueden existir cambios incompatibles, pesos no finales o degradaciones no documentadas.
- Ausencia de benchmarks publicados en la informacion disponible: no es posible estimar de antemano la calidad frente a alternativas sin evaluar por cuenta propia.
- Alucinacion visual: como todo modelo generativo de imagen, puede producir artefactos, geometrias incoherentes, texto ilegible en la imagen o elementos inexistentes en la referencia; requiere revision humana en flujos de marca.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo demografico, cultural o estilistico; se recomienda auditoria propia antes de uso comercial.
- Requisitos de hardware: 8,13 mil millones de parametros y 25,5 GB de repositorio implican que no es un modelo ligero; el ajuste fino requiere VRAM adicional considerable.
- Detalles de inferencia ausentes: sin scheduler recomendado, resolucion nativa, numero de pasos ni guia (CFG) documentados en la informacion proporcionada, el ajuste de hiperparametros debera hacerse por prueba y error.

## Enlaces

- [HuggingFace: briaai/Fibo-2.0-dev](https://huggingface.co/briaai/Fibo-2.0-dev)
- [Paper referenciado en los tags: arXiv 2511.06876](https://arxiv.org/abs/2511.06876)
- No se han encontrado otros enlaces (blog, repositorio de codigo o demo) en la informacion proporcionada.
