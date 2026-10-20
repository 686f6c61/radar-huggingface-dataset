# briaai/Fibo-2.0-edit-turbo

## Resumen

Fibo-2.0-edit-turbo es un modelo de edicion de imagenes publicado por BRIA AI (organizacion `briaai` en HuggingFace) como variante destilada del modelo base `briaai/Fibo-2.0-dev`. Su funcion es la edicion de imagenes guiada por instrucciones en lenguaje natural: recibe una imagen de entrada y una instruccion, y devuelve la imagen modificada. El repositorio declara los pipelines `image-to-image` e `inpainting`, ademas de soporte para `multi-reference` (uso de varias imagenes de referencia en una misma edicion) y `structured-prompts` (prompts estructurados en lugar de texto libre).

Tecnicamente es un modelo de difusion distribuido en formato `diffusers` a traves de la clase `BriaFibo2Pipeline`, con 8.127.342.213 parametros totales (dato real extraido de los pesos en safetensors) y un repositorio de 25,5 GB. La etiqueta `distillation` y el sufijo `turbo` indican que se trata de una version destilada del modelo `dev`, pensada para reducir el numero de pasos de inferencia necesarios, aunque la informacion disponible no concreta el numero exacto de pasos ni el factor de aceleracion.

Su relevancia ahora es doble: por un lado, se publica como alternativa de edicion de imagenes con soporte multi-referencia, una capacidad poco comun en modelos de difusion abiertos; por otro, el acceso esta restringido (gated) y la licencia es propia (`bria-fibo`, catalogada como `other`), lo que condiciona su adopcion en produccion. El modelo solo declara soporte de ingles y su uso comercial debe verificarse contra los terminos de BRIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion implementado sobre `diffusers` (clase `BriaFibo2Pipeline`); detalles internos (backbone, tipo de atencion, VAE/text encoder) no disponibles |
| Parametros totales | 8.127.342.213 |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion; la ventana relevante es la longitud del prompt de texto, no especificada) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye `safetensors`; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | `bria-fibo` (catalogada como `other` en HuggingFace) |
| Formato de pesos | safetensors (`diffusers`) |
| Tarea | image-to-image, inpainting, edicion multi-referencia |
| Modelo base | `briaai/Fibo-2.0-dev` (fine-tune/destilacion) |
| Tamano del repositorio | 25,5 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 4 descargas, 21 likes |
| Fecha de creacion / actualizacion | 2026-10-19 / 2026-10-20 |

## Arquitectura y entrenamiento

La informacion disponible confirma que Fibo-2.0-edit-turbo es un modelo de difusion para edicion de imagenes, empaquetado con la libreria `diffusers` y consumible mediante `BriaFibo2Pipeline`. El repositorio incluye las etiquetas `image-editing`, `image-to-image`, `inpainting`, `multi-reference`, `structured-prompts`, `distillation` y `vgl`, ademas de la referencia al paper `arxiv:2511.06876`. No se detalla en la informacion proporcionada el tipo de backbone (si es un transformer de difusion puro, un UNet o una arquitectura hibrida), ni el numero de capas, ni la configuracion del autoencoder o del codificador de texto.

Respecto al entrenamiento, se sabe que deriva de `briaai/Fibo-2.0-dev` mediante un proceso de destilacion, lo que justifica el sufijo `turbo` y su orientacion a inferencia con menos pasos. No hay datos disponibles sobre el volumen de tokens o pares imagen-texto usados, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias humanas, algo por otra parte poco habitual en modelos de difusion. Tampoco se documenta el mecanismo concreto de los "structured prompts" ni el formato exacto en que deben suministrarse las imagenes de referencia multiples; habria que consultar la model card completa y el paper para obtenerlo.

## Capacidades

- Edicion de imagenes guiada por instrucciones: transforma una imagen de entrada segun una instruccion textual en ingles.
- Image-to-image: modo base de funcionamiento del pipeline declarado.
- Inpainting: edicion localizada por regiones enmascaradas de la imagen.
- Multi-referencia: capacidad de condicionar la edicion con varias imagenes de referencia, segun la etiqueta `multi-reference`.
- Prompts estructurados: soporte de `structured-prompts`, es decir, instrucciones organizadas en campos en lugar de texto libre.
- Inferencia destilada: variante `turbo` derivada por destilacion del modelo `dev`, orientada a reducir pasos de muestreo.
- Idiomas: instrucciones en ingles unicamente.
- No disponible: soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision comprensiva (describir o responder preguntas sobre imagenes), audio, video o modo "thinking". Estas capacidades no se mencionan en la informacion proporcionada y no deben asumirse.

## Casos de uso

- Edicion de producto en ecommerce: dado un catalogo de fotografia de producto, aplicar instrucciones del tipo cambiar el fondo, ajustar la iluminacion o sustituir un color, manteniendo la coherencia del objeto; el pipeline `image-to-image` esta disenado exactamente para esta tarea.
- Retoque localizado con inpainting: eliminar objetos no deseados, sustituir elementos de una escena o reparar zonas danadas indicando la mascara de la region, sin regenerar la imagen completa.
- Consistencia de personaje o producto con multiples referencias: usar `multi-reference` para conservar la identidad visual de un sujeto a lo largo de una serie de imagenes generadas o editadas, util en campanas de marketing y en creacion de contenido seriado.
- Automatizacion de pipelines creativos con prompts estructurados: integrar el modelo en un sistema que rellene plantillas de instrucciones (objeto, atributo, estilo, restricciones) de forma programatica, lo que encaja con la etiqueta `structured-prompts` y facilita la validacion y el versionado de prompts.
- Prototipado rapido de variantes visuales: gracias a la destilacion (`turbo`), el modelo esta pensado para escenarios donde se requieren varias iteraciones de edicion por minuto, como exploracion de conceptos artisticos o generacion de alternativas de diseno.
- Preprocesado de datasets de vision por computador: editar imagenes para aumentar la variabilidad de un conjunto de datos (fondos, condiciones de luz, oclusiones) mediante inpainting e instrucciones controladas en ingles.
- Herramientas de edicion asistida para usuarios no tecnicos: exposicion del pipeline detras de una interfaz donde el usuario escriba en ingles la modificacion deseada y el modelo aplique la edicion sobre la imagen cargada.
- Nota: al requerir acceso gated y una licencia propia, cualquier uso en produccion debe evaluarse primero contra los terminos de BRIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 16,3 GB solo para los pesos (8,127 mil millones de parametros x 2 bytes), mas la memoria del autoencoder, el codificador de texto y las activaciones; en la practica se debe reservar del orden de 20-24 GB. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- GPU profesionales: A100 (40 GB y 80 GB) y H100 son opciones holgadas para inferencia en 16 bits y para lotes pequenos.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, asumiendo la estimacion anterior y sin cuantizacion adicional. En tarjetas de 16 GB o menos no se puede confirmar su funcionamiento, ya que no se documentan variantes cuantizadas.
- Opciones de despliegue: al estar empaquetado para `diffusers`, el despliegue natural es mediante la propia libreria `diffusers` con `BriaFibo2Pipeline`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a pipelines de difusion de `diffusers`. Tampoco se confirma compatibilidad con ComfyUI.
- Latencia y throughput: no disponibles. La unica indicacion es cualitativa: la destilacion a variante `turbo` busca reducir el numero de pasos de muestreo respecto a `briaai/Fibo-2.0-dev`.
- Almacenamiento: el repositorio ocupa 25,5 GB, por encima de lo que sugeriria el peso en 16 bits, lo que apunta a que incluye varios componentes (autoencoder, text encoder u otras variantes de pesos) ademas del modulo principal. Este desglose no se detalla en la informacion disponible.
- Descarga: al ser un repositorio gated, es necesario autenticarse con un token de HuggingFace y haber aceptado las condiciones de la licencia antes de descargar los pesos.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa con alternativas de otros autores sin inventar cifras. La unica comparacion sustentada es con su propio modelo base:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| Fibo-2.0-edit-turbo | 8.127.342.213 | imagen + prompt en ingles; longitud de prompt no disponible | Edicion image-to-image, inpainting, multi-referencia | `bria-fibo` (`other`) | Gated |
| Fibo-2.0-dev (base) | no disponible | no disponible | Edicion de imagenes (modelo del que deriva por destilacion) | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles (`en`); el comportamiento con instrucciones en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Licencia: la licencia `bria-fibo` esta catalogada como `other`, es decir, no es una licencia open source estandar (Apache 2.0, MIT, etc.). Es imprescindible revisar los terminos completos antes de cualquier uso comercial, redistribucion o despliegue como servicio.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones; esto puede bloquear automatizaciones, entornos de CI y despliegues que no gestionen tokens de HuggingFace.
- Alucinacion visual: como todo modelo generativo de imagenes, puede introducir o eliminar elementos no solicitados, alterar la identidad del sujeto entre ediciones o desvirtuar detalles finos (texto en la imagen, rostros, geometria) sin aviso. No se dispone de datos publicados sobre fidelidad de edicion.
- Sin benchmarks: no hay resultados publicados en la informacion disponible que permitan acotar la calidad frente a alternativas, lo que aumenta el riesgo de una adopcion a ciegas.
- Sin variantes cuantizadas documentadas: el repositorio solo distribuye `safetensors`; no consta soporte de GGUF, FP8 ni INT8, lo que limita el despliegue en hardware modesto.
- Sesgos: no se documenta informacion sobre sesgos de generacion (demograficos, culturales o de estilo) ni sobre filtrado de contenido; deben evaluarse empiricamente antes de exponer el modelo a usuarios finales.
- Madurez: el repositorio acumula 4 descargas y 21 likes en el momento de la consulta, lo que indica una adopcion muy temprana y poca validacion por parte de la comunidad.
- Dependencia del ecosistema `diffusers`: el pipeline `BriaFibo2Pipeline` requiere una version de la libreria que lo incluya; versiones antiguas fallaran al cargar el modelo.
- Documentacion incompleta en la informacion disponible: no se detallan pasos de inferencia recomendados, escala de guia (CFG), resoluciones soportadas ni el formato exacto de los prompts estructurados, parametros criticos para obtener resultados reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Paper referenciado en las etiquetas: arxiv:2511.06876 (https://arxiv.org/abs/2511.06876)
- Organizacion BRIA AI en HuggingFace: https://huggingface.co/briaai
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al paper ni a demos oficiales; los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
