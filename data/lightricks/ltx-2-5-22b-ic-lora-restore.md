# Lightricks/LTX-2.5-22b-IC-LoRA-Restore

## Resumen

LTX-2.5-22b-IC-LoRA-Restore es un adaptador IC-LoRA (In-Context LoRA) publicado por Lightricks sobre el modelo base Lightricks/LTX-2.3, orientado a tareas de video-to-video de restauracion y colorizacion de material de archivo. Se distribuye a traves de HuggingFace con acceso restringido (gated) y licencia ltx-2.x-community-license, y esta etiquetado con casos de uso explicitos como video-restoration, colorization, archive-footage y vfx.

El identificador incluye la cifra "22b", que segun la nomenclatura del repositorio haria referencia al modelo base de aproximadamente 22 000 millones de parametros; el repositorio del adaptador ocupa 1,7 GB. No se detallan en la informacion disponible ni la arquitectura interna del modelo base, ni la longitud de contexto, ni los esquemas de cuantizacion soportados.

Su relevancia actual radica en la combinacion de dos factores: por un lado, la familia LTX-Video de Lightricks centrada en generacion y edicion de video; por otro, el uso de un adaptador ligero (LoRA) que anade capacidades de restauracion sobre un modelo ya entrenado, lo que reduce el coste de adaptacion frente a un reentrenamiento completo. La ficha se limita a los datos verificables del repositorio, ya que no se han publicado resultados de benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador IC-LoRA sobre el modelo base de video Lightricks/LTX-2.3) |
| Parametros totales | 22 000 millones segun la nomenclatura del identificador; no confirmado en la informacion disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license (etiquetada como license:other) |
| Formato de pesos | No disponible (tamano del repositorio: 1,7 GB) |

Datos adicionales del repositorio: pipeline declarado video-to-video, libreria ltx, 251 descargas, 15 likes, creado el 27 de septiembre de 2026 y actualizado el 29 de septiembre de 2026. El acceso es restringido y requiere aceptar las condiciones en HuggingFace.

## Arquitectura y entrenamiento

La informacion disponible identifica el artefacto como un IC-LoRA, es decir, un adaptador de bajo rango (LoRA) aplicado sobre el modelo base Lightricks/LTX-2.3. La etiqueta base_model:adapter:Lightricks/LTX-2.3 confirma que se trata de un adaptador y no de un modelo completo, y la presencia de las etiquetas ltx-2.3, ltx-2.5 y ltx-video sugiere compatibilidad con la familia de modelos de video de Lightricks. El pipeline declarado es video-to-video, lo que implica que la entrada y la salida son secuencias de video, y las etiquetas video-restoration, colorization, archive-footage y vfx acotan el dominio de aplicacion previsto.

No se dispone de informacion sobre el numero de tokens o de fotogramas usado en el entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o metodos de destilacion. Tampoco se detalla la arquitectura interna del modelo base (tipo de transformer de difusion, esquema de atencion, encoder de texto o VAE) ni el mecanismo exacto de condicionamiento in-context empleado por el adaptador. Toda esta informacion debe considerarse no disponible en la documentacion proporcionada.

## Capacidades

- Restauracion de video (video-to-video): el adaptador esta etiquetado especificamente para tareas de restauracion sobre secuencias de video.
- Colorizacion de metraje: incluye la etiqueta colorization, orientada a material filmado originalmente en blanco y negro.
- Tratamiento de material de archivo: la etiqueta archive-footage indica un enfoque sobre fuentes historicas con degradacion tipica (ruido, rayaduras, inestabilidad).
- Flujos de trabajo de VFX: la etiqueta vfx sugiere su uso como paso dentro de cadenas de postproduccion.
- Condicionamiento in-context: el prefijo IC (In-Context) implica que el adaptador utiliza informacion de referencia en la propia entrada para guiar la generacion.
- Idiomas: el unico idioma declarado es el ingles (en), lo que afecta a cualquier prompt textual asociado al pipeline.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica; se trata de un modelo de generacion y edicion de video, no de un modelo de lenguaje conversacional.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Restauracion de archivos filmicos: aplicar el adaptador como paso de limpieza sobre digitalizaciones de pelicula con ruido, rayaduras y parpadeo, aprovechando su entrenamiento especifico sobre material de archivo.
- Colorizacion de documentales historicos: convertir metraje en blanco y negro a color de forma coherente entre fotogramas, usando el condicionamiento in-context para mantener la consistencia temporal.
- Remasterizacion para television y plataformas: integrar el modelo en una cadena de postproduccion para preparar material antiguo antes de su emision o publicacion en catalogo.
- Conservacion en archivos y filmotecas: generar copias restauradas de fondos documentales sin necesidad de un reentrenamiento completo, ya que se trata de un adaptador ligero (1,7 GB) sobre un modelo base existente.
- Produccion de VFX con metraje de referencia: usar secuencias historicas restauradas como placas base para composicion, dado el etiquetado vfx del repositorio.
- Investigacion en restauracion de video: servir como punto de partida para experimentos de adaptacion mediante LoRA sobre modelos de difusion de video, comparando el efecto del condicionamiento in-context frente a un ajuste completo.
- Preprocesado para pipelines de vision por computador: mejorar la calidad de clips de archivo antes de alimentar sistemas de deteccion, reconocimiento o analisis posteriores.

En todos los casos, el uso en produccion requiere aceptar la licencia comunitaria y solicitar acceso al repositorio restringido; no se dispone de datos de latencia ni de calidad medidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de metricas objetivas (PSNR, SSIM, LPIPS, FVD) ni evaluaciones subjetivas, y los resultados de la busqueda web realizada no aportan datos sobre este modelo. No se deben inferir cifras de rendimiento a partir del nombre o de las etiquetas.

## Requisitos de hardware

- El adaptador ocupa 1,7 GB en el repositorio, pero requiere cargar el modelo base Lightricks/LTX-2.3 para funcionar; el consumo de VRAM depende por tanto del modelo base y no solo del adaptador.
- Estimacion orientativa para un modelo base de ~22 000 millones de parametros: en precision de 16 bits requeriria del orden de 44 GB solo para los pesos, mas memoria adicional para activaciones, latentes de video y cache de atencion.
- GPU con memoria suficiente para el modelo base: necesaria al menos una GPU profesional de gran memoria (A100 80 GB, H100 80 GB o similar). Esta estimacion es orientativa y no procede de datos oficiales del repositorio.
- Cabe en GPU de consumo (RTX 4090, 24 GB, o RTX 5090) unicamente si se aplican cuantizaciones o tecnicas de offloading agresivas; el repositorio no documenta esquemas de cuantizacion soportados.
- Opciones de despliegue: la libreria declarada es ltx; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. Cualquier cifra al respecto requeriria medir el modelo base con el adaptador en el hardware objetivo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con datos de parametros, contexto, rendimiento y licencia que permitan una tabla rigurosa. Como referencia de partida, el propio modelo base Lightricks/LTX-2.3 es el unico elemento relacionado identificado, pero no se dispone de sus especificaciones tecnicas en esta documentacion. Los resultados de la busqueda web no contienen alternativas relevantes.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede bloquear pipelines automatizados.
- Licencia: se distribuye bajo ltx-2.x-community-license (etiquetada como license:other). Es imprescindible revisar los terminos completos antes de cualquier uso comercial, ya que el texto de la licencia no se incluye en la informacion disponible.
- Idioma: el unico idioma declarado es el ingles. Cualquier prompt textual en castellano u otros idiomas puede degradar el resultado o no estar soportado.
- Dependencia del modelo base: es un adaptador, no un modelo autonomo. Sin Lightricks/LTX-2.3 no es funcional, lo que anade requisitos de VRAM y de gestion de dependencias.
- Riesgo de artefactos de generacion: al tratarse de un modelo generativo de video, puede introducir alucinaciones visuales, inestabilidad temporal, deriva de identidad entre fotogramas o alteraciones de contenido historico. En contextos de archivo y patrimonio esto es especialmente sensible, ya que una restauracion infiel puede considerarse una manipulacion del documento original.
- Ausencia de evaluacion: no hay benchmarks publicados, por lo que no es posible cuantificar la fidelidad de la restauracion ni compararla con alternativas.
- Sin datos de cuantizacion ni de formatos de pesos: no se puede confirmar la viabilidad de despliegue en hardware de consumo.
- Ciclo de vida corto: el repositorio se creo y actualizo en septiembre de 2026 con solo 251 descargas; no hay evidencia de validacion por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a proyectos no relacionados, como karthink/gptel-agent, karthink/gptel, gptel.org y deepwiki.com/karthink/gptel-agent).
