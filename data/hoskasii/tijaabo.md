# hoskasii/tijaabo

## Resumen

Tijaabo es un modelo de sintesis de voz (text-to-speech) publicado por el usuario hoskasii en HuggingFace bajo el identificador hoskasii/tijaabo. Se distribuye con la etiqueta de arquitectura moss_tts_nano y codigo personalizado (custom_code), lo que indica que su carga requiere implementacion propia y no un pipeline estandar de transformers. El modelo esta orientado exclusivamente al idioma somali (codigo ISO "so"), un caso de uso poco cubierto por los sistemas TTS comerciales y de codigo abierto mayoritarios.

Con 68.492.544 parametros totales (aproximadamente 68,5 millones), es un modelo de tamano compacto, adecuado en teoria para inferencia en CPU o en GPU de gama baja. El repositorio ocupa 25,5 GB, un volumen muy superior al que corresponderia unicamente a los pesos en precision completa (unos 274 MB en fp32), lo que sugiere la presencia de multiples checkpoints, estados de optimizador o artefactos de entrenamiento adicionales en el mismo repositorio. Esta discrepancia conviene verificarla antes de descargar el modelo completo.

La relevancia de Tijaabo radica en su nicho: sintesis de voz en somali con un modelo de menos de 70 millones de parametros. Existe un Space publico asociado (lakiLabs/tijaabo) que permite introducir una frase en somali y obtener un clip de audio, lo que facilita su evaluacion sin necesidad de montar infraestructura propia. La model card publicada es minima: solo declara las etiquetas de pipeline y el idioma, sin detallar arquitectura, datos de entrenamiento ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | moss_tts_nano (etiqueta del repo, con custom_code); detalle interno no disponible |
| Parametros totales | 68.492.544 (aproximadamente 68,5 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo TTS; la limitacion practica es la longitud del texto de entrada, no documentada) |
| Tipos de cuantizacion | no disponible (solo se listan pesos safetensors; no se publican variantes GGUF, int8 ni int4) |
| Idiomas soportados | somali (so) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con codigo personalizado asociado) |

## Arquitectura y entrenamiento

La unica informacion arquitectonica publicada es la etiqueta moss_tts_nano, que apunta a la familia de modelos TTS ligeros de MOSS, junto con la marca custom_code, que implica que el modelo necesita codigo propio para su carga e inferencia. No se dispone de detalles sobre el tipo de backbone (UNet, transformer, flow-matching u otro), el vocoder empleado, la frecuencia de muestreo de salida, la representacion del texto ni el mecanismo de condicionamiento acustico. Tampoco se publica informacion sobre el proceso de entrenamiento: numero de horas de audio, composicion del dataset, presencia de hablantes multiples, uso de RLHF, DPO o fine-tuning sobre un modelo base.

Como referencia del mismo autor, el repositorio hoskasii/base-model describe Koko-TTS, un modelo TTS de aproximadamente 24,6 M de parametros basado en un marco de flow-matching que combina una UNet de estilo Matcha condicionada por representaciones de texto con RoPE y un vocoder neuronal Vocos a 24 kHz. Es plausible que Tijaabo comparta linaje tecnico con ese trabajo, pero no hay confirmacion en la informacion disponible de que Tijaabo herede esa arquitectura, por lo que cualquier extrapolacion debe tratarse como hipotesis no verificada. La fecha de creacion del repositorio (15 de octubre de 2026) y la ultima actualizacion (16 de octubre de 2026) indican un proyecto muy reciente y en estado temprano de publicacion.

## Capacidades

- Sintesis de voz a partir de texto en somali: la pipeline declarada es text-to-speech y el unico idioma soportado es "so".
- Generacion de audio descargable: segun la descripcion del Space asociado, la aplicacion convierte una frase en somali en un clip de audio y permite descargar el resultado.
- Inferencia ligera: con aproximadamente 68,5 M de parametros, el modelo es candidato a ejecucion en CPU o GPU modesta, aunque no se publican mediciones de latencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo TTS, no generativo de texto).
- Capacidades multilingues: no; el unico idioma declarado es el somali.
- Capacidades especiales (modo thinking, vision, audio de entrada): no disponibles. No se documenta clonacion de voz, control de emocion, prosodia ajustable ni entrada de audio de referencia.

## Casos de uso

- Accesibilidad para hablantes de somali: convertir texto escrito (noticias, articulos, documentacion) en audio para personas con dificultades de lectura o baja alfabetizacion, aprovechando que es uno de los pocos modelos TTS publicos centrados en este idioma.
- Audiolibros y contenido educativo: narracion automatizada de materiales didacticos en somali para escuelas o programas de alfabetizacion, con la ventaja de un modelo de menos de 70 M de parametros que abarata el procesamiento por lote.
- Interfaces de voz para servicios publicos: lectura en voz alta de avisos, menus o formularios en organismos que atienden a poblacion somali, integrando el modelo en un backend propio mediante el codigo personalizado del repositorio.
- Sistemas de anuncios y megafonia: generacion de mensajes de audio en somali para transporte publico, aeropuertos o recintos, donde la variedad de voces comerciales en este idioma es escasa.
- Asistentes conversacionales en somali: combinado con un LLM y un modulo ASR, el TTS cierra el bucle de salida de voz para asistentes de atencion al cliente, siempre que se valide la calidad de la sintesis antes de produccion.
- Prototipado e investigacion en TTS de bajos recursos: servir como linea base o punto de partida para fine-tuning en idiomas africanos relacionados, dado su reducido coste computacional.
- Contenido multimedia y localizacion: doblaje automatizado de videos cortos o podcasts al somali, con la limitacion de que no se documenta control de prosodia ni multiples hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, RTF, similitud de hablante) ni comparaciones con otros sistemas TTS en somali. El Space asociado permite una evaluacion subjetiva manual, pero no se documentan resultados numericos.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (68,5 M); no son datos publicados por el autor:

- VRAM en fp32: aproximadamente 0,3 GB solo para pesos, mas overhead del runtime y del vocoder.
- VRAM en fp16/bf16: aproximadamente 0,15 GB para pesos. En ambos casos el factor limitante real es el pico de memoria durante la inferencia y el coste del vocoder, no el modelo en si.
- GPU: cabe holgadamente en cualquier GPU consumer con 4 GB o mas, incluidas GTX 1650, RTX 3060, RTX 4090; tambien deberia ser viable en CPU, aunque no hay cifras de latencia publicadas.
- El tamano del repositorio (25,5 GB) implica un coste de descarga y de disco muy superior al de los pesos puros; conviene inspeccionar el contenido antes de clonarlo completo.
- Opciones de despliegue: no confirmadas. Al requerir custom_code, no se puede asumir compatibilidad directa con vLLM, TGI, llama.cpp u Ollama (orientados a modelos de lenguaje) ni con pipelines estandar de transformers. El camino documentado es el codigo personalizado del repositorio y el Space de demostracion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Arquitectura declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tijaabo (hoskasii/tijaabo) | 68,5 M | somali (so) | moss_tts_nano (custom_code) | no disponible | pesos safetensors + Space de demo |
| Koko-TTS (hoskasii/base-model) | 24,6 M | no disponible | flow-matching, UNet estilo Matcha + vocoder Vocos 24 kHz | no disponible | pesos en HuggingFace |
| MOSS-TTS-Nano | no disponible | no disponible | familia TTS ligera referenciada por la etiqueta del repo | no disponible | no disponible |
| Otros TTS multilingues (p. ej. familias comerciales) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones. La unica comparacion defendible con la informacion disponible es de tamano y de nicho linguistico: Tijaabo es mayor que Koko-TTS (68,5 M frente a 24,6 M) y esta especializado en un unico idioma de bajos recursos.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible. Sin licencia explicita, no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor antes de integrarlo en un producto.
- La model card es practicamente vacia: no documenta datos de entrenamiento, origen del audio, consentimiento de los hablantes ni composicion del corpus, lo que impide evaluar sesgos de genero, acento o dialecto dentro del propio somali.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas, omitir palabras o generar artefactos en numeros, nombres propios y prestamos linguisticos no vistos durante el entrenamiento.
- Cobertura limitada a un unico idioma (somali); no se documenta soporte de code-switching con arabe, ingles o italiano, habituales en el uso real del somali.
- Ausencia de benchmarks: no hay MOS, WER ni medidas de similitud de hablante, por lo que la calidad percibida solo puede evaluarse manualmente a traves del Space.
- Estado del proyecto temprano: 421 descargas, 0 "likes" y una ventana de publicacion de dos dias entre creacion y ultima actualizacion. No hay garantia de mantenimiento, soporte ni estabilidad de la API.
- Tamano del repositorio desproporcionado (25,5 GB frente a unos 274 MB de pesos en fp32): puede incluir estados de entrenamiento o checkpoints redundantes; conviene auditar antes de descargar.
- Dependencia de custom_code: la integracion en pipelines estandar no esta garantizada y puede requerir revision y mantenimiento del codigo por parte del equipo que lo adopte.
- Sin informacion sobre latencia, throughput ni requisitos de memoria en produccion, lo que dificulta dimensionar infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoskasii/tijaabo
- Space de demostracion (Tijaabo, por lakiLabs): https://huggingface.co/spaces/lakiLabs/tijaabo
- Perfil del autor en HuggingFace: https://huggingface.co/hoskasii
- Repositorio relacionado del mismo autor (Koko-TTS): https://huggingface.co/hoskasii/base-model
- Repositorio base del autor: https://huggingface.co/hoskasii/base
