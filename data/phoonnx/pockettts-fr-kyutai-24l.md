# Phoonnx/pockettts-fr-kyutai-24l

## Resumen

pockettts-fr-kyutai-24l es un modelo de sintesis de voz (text-to-speech) en frances desarrollado originalmente por Kyutai y empaquetado por Phoonnx para su libreria de inferencia ONNX. Se trata de una conversion del modelo upstream `kyutai/pocket-tts/languages/french_24l` al formato ONNX, lo que permite ejecutarlo en entornos Python y en el ecosistema de asistentes de voz OVOS sin depender del framework original. El identificador "24l" hace referencia a una configuracion de 24 capas del modelo Pocket TTS.

El modelo resuelve la necesidad de sintesis de voz francesa ligera y desplegable en local, con un enfoque en portabilidad: al estar en ONNX, puede ejecutarse sobre CPU y GPU sin requerir CUDA ni dependencias pesadas. La integracion con phoonnx y scriptconv anade normalizacion de texto y conversion a puntos de codigo Unicode como front-end, lo que simplifica su uso en pipelines de TTS dentro de asistentes conversacionales y aplicaciones de lectura en voz alta.

Es relevante ahora porque el ecosistema de TTS open source esta migrando hacia formatos de pesos portables (ONNX, GGUF) que facilitan el despliegue en produccion y en dispositivos de borde. Este paquete concreto ofrece 26 voces francesas predefinidas y una licencia permisiva (CC-BY-4.0) que permite uso comercial con atribucion, lo que lo convierte en una opcion practica para desarrolladores que necesitan TTS frances sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (24 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo pesa 2.4 GB) |
| Idiomas soportados | frances (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | puntos de codigo Unicode del texto |
| Voces incluidas | 26 voces francesas (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera) |
| Tamano del repositorio | 2.4 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura es Pocket TTS, un modelo de sintesis de voz desarrollado por Kyutai. La variante empaquetada corresponde a la configuracion `french_24l`, que segun la nomenclatura indica 24 capas. No se dispone de informacion detallada sobre el tipo exacto de arquitectura interna (si es un modelo acustico autoregresivo, un modelo de difusion o un sistema de dos etapas con vocoder), ni sobre el numero de parametros totales, la composicion del dataset de entrenamiento o si se aplicaron tecnicas de RLHF o ajuste fino especifico.

El proceso de conversion a ONNX fue realizado por KevinAHM (repositorio `KevinAHM/pocket-tts-onnx/onnx/french_24l`), y Phoonnx lo empaqueta para su libreria. El front-end de texto utiliza `UnicodeCodepointPhonemizer` de scriptconv, que normaliza el texto y lo convierte en puntos de codigo Unicode antes de pasarlo al modelo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Sintesis de voz en frances a partir de texto, con salida en formato WAV.
- 26 voces predefinidas con nombres propios, lo que permite seleccionar diferentes timbres y estilos dentro del mismo modelo.
- Normalizacion de texto mediante scriptconv, que convierte el texto de entrada en puntos de codigo Unicode para el modelo.
- Ejecucion via ONNX, lo que permite inferencia en CPU y GPU sin dependencia de frameworks de deep learning pesados.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable a traves de `mycroft.conf`.
- Uso programatico en Python mediante `TTSModelManager` y objetos de voz que exponen `synthesize_wav`.
- Capacidad multilingue: limitada exclusivamente al frances segun la model card.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en frances para OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente domestico responda en frances con una de las 26 voces disponibles, seleccionable en `mycroft.conf`.
- Lectura en voz alta de articulos o documentos: mediante la API de Python (`synthesize_wav`), se puede convertir texto frances en audio WAV para aplicaciones de accesibilidad o podcasts automatizados.
- Generacion de audiolibros y contenido narrado: las multiples voces permiten asignar timbres distintos a personajes o secciones, y la licencia CC-BY-4.0 facilita la publicacion comercial con atribucion.
- Sistemas de anuncios y megafonia automatizada: al ejecutarse en ONNX sobre CPU, puede desplegarse en dispositivos de borde o servidores sin GPU para generar mensajes de voz en frances bajo demanda.
- Prototipado de interfaces conversacionales: la instalacion via `pip install --pre phoonnx` y la API sencilla permiten integrar TTS frances en prototipos de chatbots o IVR sin depender de APIs en la nube.
- Investigacion en TTS y evaluacion de voces: al ser un paquete ONNX reproducible, sirve como baseline para comparar calidad de sintesis, latencia y naturalidad frente a otros sistemas TTS en frances.
- Localizacion de contenido audiovisual: generacion de pistas de voz en frances para videos, tutoriales o presentaciones a partir de guiones de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 2.4 GB, por lo que se necesita al menos ese espacio en disco y una cantidad de memoria proporcional al cargar los pesos ONNX.
- GPU recomendadas: no se especifican; al ser ONNX, puede ejecutarse en CPU y en GPU compatibles con ONNX Runtime (por ejemplo, series RTX o A100/H100 si se configura el provider CUDA).
- Compatibilidad con GPU de consumo: probable en GPUs de consumo con suficiente memoria para cargar los pesos ONNX, aunque no se documentan requisitos minimos concretos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Voces | Formato | Licencia | Contexto |
|---|---|---|---|---|---|---|
| pockettts-fr-kyutai-24l | Pocket TTS (24 capas) | fr | 26 | ONNX | CC-BY-4.0 | no disponible |
| kyutai/pocket-tts (upstream) | Pocket TTS | multi (segun variante) | segun variante | pesos originales | CC-BY-4.0 | no disponible |
| KevinAHM/pocket-tts-onnx | Pocket TTS convertido | multi | segun variante | ONNX | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo upstream y su conversion ONNX, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos TTS alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta frances; no es multilingue y no debe usarse para otros idiomas sin una variante especifica.
- No se dispone de informacion sobre sesgos de generacion, calidad de voces o comportamiento en dominios especializados (medico, legal, tecnico).
- Riesgo de alucinacion no aplica en el sentido de texto generado, pero si puede haber errores de pronunciacion o prosodia en textos con abreviaturas, numeros o nombres propios no normalizados correctamente por scriptconv.
- No se documentan limitaciones de longitud de contexto o de entrada de texto; se desconoce el maximo de caracteres por sintesis.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es necesario verificar los terminos exactos del upstream `kyutai/pocket-tts` y de la conversion ONNX de KevinAHM.
- El paquete depende de la version pre-release de phoonnx (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API y cambios entre versiones.
- El tamano del repositorio (2.4 GB) puede ser elevado para despliegues en dispositivos con almacenamiento limitado.
- No se documentan requisitos minimos de memoria ni latencia, lo que dificulta planificar capacidad en produccion.

## Enlaces

- [Hugging Face: Phoonnx/pockettts-fr-kyutai-24l](https://huggingface.co/Phoonnx/pockettts-fr-kyutai-24l)
- [Upstream: kyutai/pocket-tts/languages/french_24l](https://huggingface.co/kyutai/pocket-tts/tree/main/languages/french_24l)
- [Conversion ONNX: KevinAHM/pocket-tts-onnx/onnx/french_24l](https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/french_24l)
- [Coleccion Pocket TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
