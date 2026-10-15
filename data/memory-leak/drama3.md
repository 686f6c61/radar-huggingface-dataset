# memory-leak/drama3

## Resumen

Drama 3 — INT8 ConvRot para ComfyUI es una conversión no oficial, publicada por el usuario memory-leak, del modelo de texto a voz fishaudio/drama-3 de Fish Audio. No es un fine-tune ni un lanzamiento oficial: es un checkpoint convertido a INT8 mediante la técnica ConvRot para poder ejecutarse dentro de ComfyUI a través del paquete de nodos ComfyUI-Drama3. El repositorio ocupa 37,9 GB e incluye dos ficheros: el modelo principal (36,34 GB) y el codec de audio (1,57 GB).

El problema que resuelve es de despliegue. El modelo original almacena los expertos enrutados en block-FP8, un formato que la implementación de ComfyUI no consume directamente. La conversión desquantiza esos pesos y los vuelve a cuantizar a INT8 ConvRot, manteniendo en precisión original embeddings, cabezas, normalizaciones, enrutado y algunas proyecciones pequeñas.

Su relevancia es práctica y acotada: permite probar Drama 3 en flujos de ComfyUI sobre GPU de consumo, a cambio de mantener los expertos en la RAM del sistema. Está etiquetado como text-to-speech, no documenta los idiomas soportados y se distribuye bajo la Fish Audio Community License. A fecha de esta ficha acumula 0 descargas y 0 likes, por lo que no existe validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La model card menciona expertos enrutados, caché de expertos y pesos de expertos en block-FP8, lo que indica una arquitectura de mezcla de expertos (MoE); no se describe el transformer subyacente |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 ConvRot aplicada a expertos enrutados y lineales densos compatibles. Los pesos originales de los expertos (block-FP8) se desquantizaron antes de la cuantización INT8. Embeddings, cabezas, normalizaciones, enrutado y proyecciones pequeñas seleccionadas conservan la precisión original |
| Idiomas soportados | No disponible. La model card solo indica que se probó generación de voz en japonés |
| Licencia | Fish Audio Community License (license_name: fish-audio-community-license) |
| Formato de pesos | safetensors: `drama3_int8convrot.safetensors` (36,34 GB) y `drama3_codec.safetensors` (1,57 GB) |
| Modelo base | fishaudio/drama-3 (relación: quantized) |
| Pipeline | text-to-speech |
| Librería | comfyui |
| Tamaño del repositorio | 37,9 GB |
| Fecha de creación | 2026-10-15 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no se indica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la arquitectura interna más allá de las referencias a expertos enrutados y a pesos de expertos almacenados originalmente en block-FP8, lo que apunta a un diseño de mezcla de expertos con enrutado. El checkpoint que nos ocupa no entrena nada: es una conversión de pesos.

La innovación técnica de esta ficha es, por tanto, la propia conversión. El autor desquantiza los expertos en block-FP8 y los recodifica en INT8 ConvRot, delegando en ComfyUI la carga de expertos en RAM con una caché de expertos en VRAM. Los metadatos indican que la conversión se realizó con la revisión `0465897ec86c0f655af12bf8ae698afd89a58723` de ComfyUI-Drama3 sobre la revisión `e0a9218aa48888270f06ef1ed9ea67622c0e17d2` del checkpoint original, mediante los comandos `python tools/convert.py model /path/to/drama-3 drama3_int8convrot.safetensors --format int8_convrot --dense int8` y `python tools/convert.py codec /path/to/drama-3/codec.pth drama3_codec.safetensors`.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) dentro de ComfyUI, cargando el checkpoint con el nodo Load Drama 3 y el codec con Load Drama 3 Codec.
- Clonación de voz a partir de una grabación de referencia limpia, que debe acompañarse de su transcripción exacta.
- Generación sin voz de referencia, aunque el autor advierte de que puede detenerse antes de tiempo y que el uso de una referencia suele dar resultados más fiables.
- Generación de voz en japonés: es el único idioma con prueba documentada (ComfyUI v0.40.0, RTX 5060 Ti de 16 GB, 64 GB de RAM, caché de expertos de 4 GiB, `--disable-pinned-memory`).
- Ejecución en GPU de consumo gracias a la carga de expertos en RAM y a la caché de expertos en VRAM.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Doblaje y localización de vídeo: el modelo admite clonación de voz a partir de una referencia con transcripción, lo que permite mantener una misma identidad vocal en distintos fragmentos de un proyecto de doblaje gestionado desde ComfyUI.
- Producción de audiolibros y narración: al ser un pipeline text-to-speech integrado en un grafo de ComfyUI, se puede encadenar con nodos de segmentación de texto para narrar capítulos largos por fragmentos.
- Prototipado de voces para videojuegos: se puede generar voz de personajes a partir de referencias de estudio y regenerar líneas tras cambios de guion sin depender de una sesión de grabación.
- Accesibilidad y lectura en voz alta: conversión de texto a audio en flujos locales, útil cuando se requiere procesar contenido sin enviarlo a servicios en la nube.
- Preproducción de pódcast y piezas de audio: generación de voces de prueba para validar guiones, ritmo y duración antes de grabar con locutores humanos.
- Voz para vídeos generados en ComfyUI: al compartir el mismo entorno que los pipelines de difusión de imagen y vídeo, permite cerrar el flujo de producción de un vídeo con narración sintética.
- Investigación sobre cuantización: sirve como material para estudiar el impacto de INT8 ConvRot frente a block-FP8 en un modelo MoE de audio, ya que el autor documenta el procedimiento de conversión completo.
- Pruebas de generación de voz en japonés en hardware de gama media, escenario explícitamente validado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, similitud de hablante ni comparativas con otros sistemas TTS), y tampoco se documentan cifras de latencia o de throughput.

## Requisitos de hardware

- VRAM: el modelo completo no cabe en 16 GB de VRAM, según indica el propio autor. Se debe usar la carga de expertos en RAM junto con una caché de expertos en VRAM.
- Configuración probada por el autor: ComfyUI v0.40.0, RTX 5060 Ti de 16 GB, 64 GB de RAM de sistema, caché de expertos de 4 GiB y el flag `--disable-pinned-memory`.
- RAM de sistema: se necesita una cantidad disponible comparable al tamaño del modelo, y la carga puede consumir más.
- GPU recomendadas: no se especifican más allá de la RTX 5060 Ti de 16 GB empleada en las pruebas. Para A100, H100 o RTX 4090 no hay datos publicados.
- Compatibilidad con GPU de consumo: sí, en el caso documentado de la RTX 5060 Ti de 16 GB, siempre que los expertos se mantengan en RAM.
- Despliegue: ComfyUI v0.40.0 o superior junto con los nodos personalizados ComfyUI-Drama3. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors int8_convrot es específico de este flujo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se conocen en la información disponible otros modelos comparables además del checkpoint original del que deriva esta conversión.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fishaudio/drama-3 | No disponible | No disponible | Expertos en block-FP8 | Fish Audio Community License | Oficial, publicado por Fish Audio |
| memory-leak/drama3 | No disponible | No disponible | INT8 ConvRot (expertos y lineales densos) | Fish Audio Community License | Conversión no oficial, 0 descargas y 0 likes |

## Limitaciones y advertencias

- Es una conversión no oficial: el autor indica explícitamente que no es un fine-tune ni un lanzamiento de Fish Audio, por lo que no cabe esperar soporte del equipo original.
- La generación sin voz de referencia puede detenerse antes de tiempo, según advierte la model card; se recomienda aportar una referencia.
- El modelo completo no entra en 16 GB de VRAM y exige RAM de sistema del orden del tamaño del modelo, lo que limita su uso en máquinas con poca memoria.
- Los idiomas soportados no están documentados; solo hay prueba declarada de japonés. El comportamiento en castellano no está verificado en la información disponible.
- Riesgo de alucinación en el sentido propio de un sistema TTS: pronunciación incorrecta, artefactos o audio truncado, especialmente con textos largos o fuera de distribución.
- Riesgo ético en clonación de voz: se necesita una grabación de referencia y su transcripción, y su uso para suplantar identidades exige consentimiento explícito de la persona cuya voz se clona.
- Licencia restrictiva: los pesos y materiales derivados siguen sujetos a la Fish Audio Community License, y la conversión no elimina ninguna de sus condiciones. Hay que revisar el fichero LICENSE antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa ni reportes de terceros sobre su calidad o estabilidad.
- Aunque la técnica de cuantización preserva en precisión original embeddings, cabezas, normalizaciones, enrutado y proyecciones pequeñas, no hay mediciones publicadas del impacto de INT8 ConvRot sobre la calidad final del audio.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/memory-leak/drama3
- Modelo base original: https://huggingface.co/fishaudio/drama-3
- Repositorio de nodos personalizados ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Licencia Fish Audio Community License: fichero `LICENSE` del repositorio
- Aviso de atribución y modificaciones: fichero `Notice` del repositorio

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos correspondían a juegos de memoria y a una tienda de componentes, por lo que no se incluyen.
