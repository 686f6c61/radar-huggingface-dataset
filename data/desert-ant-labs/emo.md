# desert-ant-labs/emo

## Resumen

Emo es un modelo de clasificacion de texto de tamano muy reducido desarrollado por Desert Ant Labs, cuyo unico cometido es sugerir el emoji mas adecuado para un texto corto que expresa una intencion, como una entrada de calendario, una tarea pendiente o un borrador de mensaje. No es un modelo generativo: dado un string de entrada, asigna una probabilidad a cada uno de los 812 emojis de su vocabulario y devuelve la sugerencia principal o las primeras N. Esta pensado para inferencia completamente local ("on-device") en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.

El interes del modelo reside en su perfil de recursos: los pesos ocupan 4,6 MB en formato Core ML compilado y 10,2 MB en LiteRT/TFLite int8, a los que se suma un tokenizador Unigram de 0,75 MB. El autor declara latencias muy por debajo de los 2 ms por inferencia en dispositivo. Cubre 22 idiomas, incluidos CJK, arabe, thai, hindi y cirilico, lo que lo convierte en una utilidad de interfaz mas que en un modelo de lenguaje.

La version documentada es la v0.7.0 de los pesos, publicada bajo la licencia propietaria Desert Ant Labs Source-Available License, gratuita para la mayoria de aplicaciones pero con obligacion de licencia comercial a cierta escala. El repositorio pesa 0,1 GB e incluye los binarios de inferencia para las dos familias de runtime soportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto compilado; el autor no detalla la topologia de la red) |
| Parametros totales | no disponible (el autor solo publica el tamano de los artefactos: 4,6 MB Core ML, 10,2 MB TFLite int8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el autor indica que funciona mejor con texto corto que expresa una intencion y que el texto largo degrada las sugerencias |
| Tipos de cuantizacion | int8 (artefacto TFLite); artefacto Core ML compilado sin cuantizacion declarada; versiones antiguas incluyen pesos `emo.safetensors` |
| Idiomas soportados | 22: arabe, checo, danes, aleman, ingles, espanol, frances, hindi, indonesio, italiano, japones, coreano, neerlandes, polaco, portugues, ruso, sueco, thai, turco, ucraniano, vietnamita y chino (simplificado y tradicional) |
| Licencia | Desert Ant Labs Source-Available License (gratuita para la mayoria de apps, licencia comercial obligatoria a escala) |
| Formato de pesos | Core ML compilado (`emo.mlmodelc`), LiteRT/TFLite int8 (`emo.tflite`), tokenizador Unigram (`emo_tokenizer.bin`), metadatos `emo_meta.json`; `emo.safetensors` solo en revisiones v0.6.0 y anteriores |

## Arquitectura y entrenamiento

El autor no publica la arquitectura interna del modelo: la model card describe exclusivamente los artefactos de despliegue y la API del SDK, sin detallar capas, dimensiones ocultas ni funcion de perdida. Lo que si se deduce de los ficheros es que se trata de un clasificador de texto sobre un vocabulario cerrado de 812 etiquetas de emoji, con un tokenizador Unigram empaquetado aparte en formato binario. El modelo se distribuye ya compilado para dos runtimes: Core ML para plataformas Apple y LiteRT/TFLite en int8 para el resto (Android, Linux, Windows, Node y navegador).

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato de proceso es que la model card se genera automaticamente desde el repositorio `desert-ant-core` de Desert Ant Labs, lo que sugiere un pipeline interno de publicacion de pesos y SDKs. Cualquier afirmacion sobre datos de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Clasificacion de texto multilingue en 22 idiomas con salida de probabilidad por emoji sobre un vocabulario de 812 etiquetas.
- Sugerencia de emoji para texto corto que expresa una intencion: tareas, entradas de calendario, notas y borradores de mensajes.
- Devolucion de las N mejores sugerencias con su nivel de confianza, lo que permite construir interfaces de seleccion rapida.
- Soporte de tonos de piel en la API (`skinTone`), con valores como `medium` en Swift y `EmojiSkinTone.MEDIUM` en Kotlin.
- Inferencia puramente local sin llamadas de red tras la descarga inicial de los pesos; el SDK cachea el modelo y permite precargarlo durante el onboarding o empaquetarlo con la aplicacion.
- Carga desde un directorio local (`Emo(directory:)`) para funcionamiento completamente offline.
- Ejecucion en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node, con SDKs oficiales en Swift, Kotlin y JavaScript/TypeScript.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio: es un clasificador de etiquetas unico, no un modelo de lenguaje.

## Casos de uso

- Sugerencia de emoji en aplicaciones de tareas pendientes: el modelo recibe el titulo de la tarea ("Pay my bills") y devuelve el emoji mas probable (💰), que la interfaz puede mostrar junto al item o usar para agrupar listas por categoria visual.
- Entradas de calendario y recordatorios: al escribir "Dentist appointment" el modelo propone 🦷; integrado en el flujo de creacion de eventos, ahorra al usuario el paso de abrir el selector de emojis y funciona con latencia inferior a 2 ms, por lo que no introduce esperas perceptibles.
- Borradores de mensajes en apps de mensajeria: al componer una frase corta, el modelo sugiere un emoji coherente con la intencion antes de enviar; el tamano de 4,6-10,2 MB permite empaquetarlo dentro de la propia aplicacion sin dependencia de servidor.
- Notas rapidas y aplicaciones de captura de ideas: el modelo etiqueta automaticamente cada nota con un emoji para facilitar el escaneo visual de listas largas, con soporte de los 22 idiomas para usuarios que alternan idiomas en una misma jornada.
- Localizacion de interfaces: al traducir cadenas de una app a otro idioma, el modelo puede proponer el emoji asociado a cada cadena en el idioma de destino (por ejemplo "reserver un vol vol pour Tokyo" → ✈️, "犬の散歩" → 🐕, "จองโรงแรม" → 🏨), reduciendo el trabajo manual de curaduria de iconografia por locale.
- Extensiones de navegador y editores web: la build JavaScript con LiteRT permite ejecutar la clasificacion en el navegador del usuario sin enviar texto a un servidor, util para entornos con requisitos de privacidad o para demos interactivas como el Space oficial.
- Aplicaciones de escritorio y herramientas CLI en Node: el SDK publica la variante `/native` precompilada para linux-x64, linux-arm64 y darwin-arm64, lo que permite usarla en procesos de servidor ligeros o en herramientas de productividad de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones con otros modelos; el unico dato de rendimiento declarado es la latencia de inferencia, que el autor situa "muy por debajo de 2 ms" en dispositivo, sin especificar el hardware de referencia.

## Requisitos de hardware

- Huella en disco: 4,6 MB para `emo.mlmodelc` en plataformas Apple y 10,2 MB para `emo.tflite` en el resto, mas 0,75 MB del tokenizador y los metadatos; el repositorio completo ocupa 0,1 GB.
- VRAM: no se declara requisito de VRAM. Al tratarse de un modelo de decenas de megabytes, la inferencia cabe en la memoria unificada de cualquier dispositivo objetivo, incluidos telefonos y navegadores.
- GPU recomendadas: no se especifican. El despliegue esta pensado para CPU/NPU integradas mediante Core ML en Apple y LiteRT en Android, Linux, Windows y web; no hay indicacion de aceleracion por GPU dedicada.
- Cabe en cualquier GPU consumer, y de hecho el caso de uso principal es el dispositivo final del usuario, no un servidor con acelerador.
- Opciones de despliegue: SDK propios de Desert Ant Labs para Swift (Swift Package Manager, producto `Emo`), Kotlin (`ai.desertant:emo:4.3.0`) y JavaScript (`@desert-ant-labs/emo` para navegador y `@desert-ant-labs/emo/native` para Node). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el autor declara menos de 2 ms por inferencia en dispositivo, sin cifra de throughput ni hardware de referencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de una familia de modelos comparables publicada por el autor. La comparacion se limita a caracteristicas objetivas frente a alternativas genericas de la misma categoria (clasificadores de texto ligeros para etiquetado de emojis o intenciones), sin cifras de rendimiento porque no estan disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Emo (desert-ant-labs) | no disponible (4,6-10,2 MB de artefactos) | no disponible (texto corto) | 22 | Source-Available, comercial a escala | Core ML, TFLite int8 |
| Clasificadores de texto genericos tipo DistilBERT | ~66 M | 512 tokens | normalmente 1-2 | Apache 2.0 / MIT segun variante | safetensors, ONNX |
| Modelos de embeddings multilingues ligeros | ~100-120 M | 512 tokens | 50-100+ | Apache 2.0 / MIT segun variante | safetensors, ONNX, GGUF |

La ventaja diferencial de Emo frente a esas alternativas es el tamano (dos ordenes de magnitud menor) y la latencia sub-2 ms en dispositivo; la desventaja es que su salida esta restringida a 812 etiquetas de emoji y que no se publican metricas de calidad que permitan compararlo objetivamente.

## Limitaciones y advertencias

- El modelo esta ajustado para texto corto que expresa una intencion; con textos largos las sugerencias se vuelven mas ruidosas, segun el propio autor.
- Los significados de los emojis son imprecisos por naturaleza, por lo que es habitual que las primeras sugerencias queden casi empatadas en probabilidad; la interfaz debe tolerarlo.
- La calidad varia por idioma: el autor reconoce que el modelo es algo mas debil en los idiomas de menores recursos del conjunto.
- No hay metricas de sesgo publicadas; al tratarse de un clasificador de emojis, los sesgos se manifestarian como asociaciones culturales estereotipadas entre conceptos y pictogramas, sin que exista documentacion de evaluacion al respecto.
- Riesgo de alucinacion en sentido estricto bajo, porque el modelo no genera texto, pero puede producir asociaciones erroneas o poco apropiadas con alta confianza aparente.
- La licencia es propietaria y de tipo source-available: es gratuita para la mayoria de aplicaciones, pero exige licencia comercial a escala segun los terminos enlazados por el autor; conviene revisar el texto completo antes de integrarla en un producto.
- La model card advierte que los avisos de terceros sobre los pesos estan en `THIRD_PARTY_NOTICES.md`; hay que consultarlos para conocer las obligaciones heredadas de datos o componentes de terceros.
- Los artefactos antiguos (`Emo.mlmodelc` y `emo.safetensors`) solo estan disponibles en las revisiones v0.6.0 y anteriores, por lo que integraciones con SDKs viejos deben fijar la revision adecuada.
- No sirve para generacion de texto, razonamiento, codigo ni tareas multimodales; usarlo fuera de su dominio de clasificacion de emojis dara resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/emo
- Revision de pesos v0.7.0: https://huggingface.co/desert-ant-labs/emo/tree/v0.7.0
- Demo interactiva (Space): https://huggingface.co/spaces/desert-ant-labs/emo-demo
- Demo oficial del autor: https://desertant.com/models/emo/
- Repositorio del SDK y nucleo: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript y TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y cache de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
- Avisos de terceros: https://huggingface.co/desert-ant-labs/emo/blob/main/THIRD_PARTY_NOTICES.md
- Contacto de licencias: licensing@desertant.com
