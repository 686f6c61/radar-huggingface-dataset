# HaloForgeLabs/bubo-diffusiongemma-26b-e38-vision

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino el proyector de visión (`mmproj`) del modelo DiffusionGemma-26B-E38-Abliterated-NVFP4, convertido a GGUF en BF16 por HaloForge Labs. Se trata del fichero que habilita la entrada de imágenes en el runtime Halowin Bubo 0.1.1, una aplicación para portátiles con APU AMD Strix Halo (Ryzen AI Max) bajo Windows. El proyecto lo publica HaloForge Labs bajo licencia Apache 2.0 y consta de un único fichero de 1.194.827.776 bytes con SHA-256 publicado.

El dato de parámetros del repositorio (572.794.416, es decir, unos 573 millones) corresponde al proyector visual, no a los 26.000 millones que sugiere el nombre: esos 26B pertenecen al modelo de lenguaje base, cuyos pesos no están incluidos aquí y deben descargarse del repositorio del autor original (Goodoldjam). La conversión añade una única clave de metadatos, `clip.vision.projector_type`, que Bubo lee para cargar el fichero correctamente.

Su relevancia es acotada pero concreta: permite ejecutar inferencia multimodal local y sin conexión en hardware de consumo AMD, dentro del ecosistema GGUF/llama.cpp, algo que hasta hace poco quedaba restringido a GPUs NVIDIA con suficiente VRAM. Para evaluar el modelo completo hay que remitirse al repositorio base; esta ficha describe exclusivamente el componente de visión y su integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector visual (mmproj) para un modelo de lenguaje multimodal; arquitectura interna del proyector no detallada en la informacion disponible |
| Parametros totales | 572.794.416 (proyector visual, dato de safetensors); el nombre comercial indica 26B para el modelo de lenguaje base, no incluido en este repositorio |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (GGUF); el modelo base se distribuye en NVFP4 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (conservar `LICENSE` y `NOTICE` en cualquier copia) |
| Formato de pesos | GGUF (fichero unico `mmproj-DiffusionGemma-E38-BF16.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del proyector ni del modelo base mas alla de su naturaleza multimodal (texto e imagen) y de la nomenclatura "DiffusionGemma", que sugiere una variante basada en difusion sobre la familia Gemma. No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se especifica si el proyector emplea un adaptador tipo MLP, un resampler de queries o un encoder visual tipo SigLIP; son datos no publicados en la model card.

La innovacion tecnica documentada es de empaquetado y despliegue, no de entrenamiento: la conversion del proyector original (revision `3f007177` del modelo base) a BF16 GGUF y la anotacion de la clave `clip.vision.projector_type` para que el runtime Halowin Bubo la reconozca al cargar. El modelo base "Abliterated" hace referencia a una variante con filtros de alineacion reducidos o eliminados, lo que condiciona el comportamiento del sistema completo.

## Capacidades

- Entrada de imágenes: habilita el procesamiento visual del modelo DiffusionGemma 26B E38 cuando se carga junto al proyector.
- Descripcion y analisis de imágenes: al combinarse con el modelo de lenguaje base, permite generar texto a partir de contenido visual.
- Ejecucion local en Windows sobre AMD Strix Halo: pensado para inferencia en el dispositivo sin servicios en la nube.
- Integracion con el runtime Bubo: descarga y carga automatizada desde el apartado Models > Discover > Download.
- Capacidades de texto, razonamiento, codigo, matematicas, tool calling y agentes: dependen exclusivamente del modelo base; no se documentan en esta ficha.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponibles.

## Casos de uso

- Digitalizacion de documentos con privacidad: escanear facturas, albaranes o formularios en local y extraer campos estructurados sin enviar las imágenes a un servidor externo, aprovechando que el proyector corre en el propio portátil.
- Asistencia a usuarios sobre capturas de pantalla: un agente de soporte puede recibir una captura de la interfaz de una aplicación y describir el error o el siguiente paso, con el modelo completo ejecutandose en el equipo del tecnico.
- Accesibilidad: generar descripciones textuales de imágenes para personas con discapacidad visual en un flujo offline, util en entornos con conectividad limitada o requisitos de confidencialidad.
- Procesamiento de imagenes de campo: tecnicos en obra o en planta fotografian equipos y etiquetas y obtienen una transcripcion o interpretacion en el momento, sin cobertura de red.
- Analisis de graficos y tablas en PDF: interpretar diagramas de resultados y resumir tendencias en un pipeline de investigacion que ya use el modelo base en formato GGUF.
- Prototipado de aplicaciones multimodales en hardware AMD: validar la viabilidad de un producto de vision-lenguaje antes de invertir en infraestructura GPU dedicada, usando el runtime Bubo como entorno de referencia.
- Moderacion y triaje de imagenes en local: clasificar contenido visual entrante en un flujo interno, manteniendo las imágenes dentro del perimetro de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM del proyector: aproximadamente 1,2 GB en BF16 (1.194.827.776 bytes), calculado a partir del tamano del fichero.
- Modelo base: no incluido en este repositorio; debe descargarse por separado. Una estimacion aritmetica a partir de 26B en NVFP4 (4 bits) daria en torno a 13 GB, cifra no verificada ni publicada por el autor.
- GPU y plataformas objetivo: APUs AMD Strix Halo (Ryzen AI Max) en Windows, segun la model card. No se documenta compatibilidad con A100, H100 o RTX 4090.
- GPU de consumo: el diseno apunta a graficos integrados de gama alta con memoria unificada; no se confirma funcionamiento en GPUs discretas de consumo.
- Opciones de despliegue: runtime Halowin Bubo 0.1.1 o superior; el formato GGUF es compatible con el ecosistema llama.cpp, aunque la carga del proyector requiere la clave de metadatos anadida y el soporte especifico de Bubo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bubo-diffusiongemma-26b-e38-vision (este repositorio) | 572,8 M (proyector); 26B en el modelo base | no disponible | GGUF BF16 | Apache 2.0 | Solo proyector visual; requiere el modelo base de Goodoldjam |
| DiffusionGemma-26B-E38-Abliterated-NVFP4 (modelo base) | 26B (segun denominacion) | no disponible | NVFP4 | no disponible en la informacion proporcionada | Incluye pesos del modelo de lenguaje; sin proyector no procesa imagenes |
| Otros proyectores mmproj para llama.cpp | no disponible | no disponible | GGUF | variable | Requieren runtime con soporte multimodal; no se dispone de datos comparativos verificados |

No se dispone de informacion suficiente para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Este repositorio no es un modelo autonomo: sin los pesos del modelo base, el fichero no produce ninguna salida.
- El modelo base es una variante "Abliterated", es decir, con filtros de alineacion presumiblemente reducidos; la model card advierte de que puede generar contenido sensible y responsabiliza al usuario de su uso.
- Riesgo de alucinacion en la descripcion de imagenes: no se han publicado evaluaciones que cuantifiquen la fidelidad visual.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano sin pruebas propias.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos o conversaciones largas.
- Compatibilidad limitada: el runtime Bubo 0.1.1+ y la clave `clip.vision.projector_type` son requisitos especificos; otros cargadores GGUF pueden no interpretar el fichero.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Uso comercial permitido por Apache 2.0, con la obligacion de conservar `LICENSE` y `NOTICE` en cualquier redistribucion.
- No se especifican requisitos de memoria del modelo base ni latencias, por lo que cualquier planificacion de produccion exige una prueba de carga previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HaloForgeLabs/bubo-diffusiongemma-26b-e38-vision
- Modelo base: https://huggingface.co/Goodoldjam/DiffusionGemma-26B-E38-Abliterated-NVFP4
- Repositorio del runtime Bubo: https://github.com/haloforge-labs/bubo
- Revision del modelo base referenciada en la conversion: `3f007177`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
