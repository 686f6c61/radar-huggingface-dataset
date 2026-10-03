# malinali-app/opus-mt-en-ee

## Resumen

malinali-app/opus-mt-en-ee es un paquete de pesos del modelo de traducción automática OPUS-MT de Helsinki-NLP, reempaquetado por el equipo de Malinali para inferencia en dispositivo (on-device) mediante el framework Candle. Se trata de un modelo Marian de tipo encoder-decoder con 74.200.811 parámetros y una única dirección de traducción: inglés (en) a ewe (ee), una lengua nigerocongoleña hablada en Ghana, Togo y Benín.

El valor del paquete no reside en un entrenamiento nuevo, sino en el formato de distribución: Malinali convierte los pesos originales a safetensors y transforma los tokenizadores SentencePiece en JSON compatibles con Hugging Face, de modo que puedan consumirse desde Candle (concretamente mediante el componente `marian_flutter`) sin dependencias de Python. Esto lo hace adecuado para aplicaciones móviles y de escritorio que necesitan traducción local, sin conexión y sin enviar texto a servidores externos.

El modelo base es Helsinki-NLP/opus-mt-en-ee, integrado en la familia OPUS-MT, que cubre cientos de pares de lenguas con arquitecturas Marian de tamaño compacto. Es relevante ahora porque las lenguas de bajos recursos como el ewe disponen de pocas alternativas abiertas de traducción, y un paquete ligero y desplegable en local reduce la barrera de entrada para desarrolladores que trabajan en contextos multilingües africanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 74.200.811 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles), ee (ewe) |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors |
| Direccion de traduccion | en → ee |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-10-02 |
| Fecha de actualizacion | 2026-10-02 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder con atención completa, diseñado originalmente para traducción automática neuronal y optimizado para entrenamiento e inferencia rápidos. El modelo cuenta con 74.200.811 parámetros, lo que lo sitúa en el rango de los modelos OPUS-MT compactos (del orden de decenas de millones de parámetros), pensados para ejecutarse con recursos limitados. El repositorio incluye `config.json` con la configuración Marian, `model.safetensors` con los pesos y dos tokenizadores rápidos separados (`tokenizer-enc.json` para el idioma origen y `tokenizer-dec.json` para el idioma destino).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO. Malinali declara explícitamente que no reclama la propiedad del modelo entrenado: su aportación se limita al reempaquetado de pesos y a la conversión de SentencePiece a JSON de tokenizador rápido de Hugging Face para inferencia en dispositivo. El tag `candle` indica compatibilidad con el framework Candle de Hugging Face, orientado a ejecución en Rust.

## Capacidades

- Traduccion de texto de ingles a ewe (en → ee), en modo texto a texto.
- Ejecucion local en dispositivo mediante Candle, sin dependencia de Python en tiempo de inferencia.
- Tokenizacion rapida separada para origen y destino, lo que permite manejar los dos vocabularios de forma independiente.
- Integracion con la libreria transformers a traves del pipeline de `translation`.
- Formato safetensors, apto para carga segura y mapeo de memoria.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito.
- Capacidad multilingue limitada estrictamente al par en → ee; no se declaran otros pares ni traduccion inversa.

## Casos de uso

- Traduccion en aplicaciones moviles sin conexion: el paquete es lo bastante pequeno (0,3 GB de repositorio) para embeberse en una app Android o iOS y traducir texto en local, preservando la privacidad del usuario al no enviar contenido a un servidor.
- Atencion al ciudadano en regiones de Ghana, Togo y Benin: traduccion de avisos administrativos, sanitarios o educativos del ingles al ewe para su difusion en comunidades donde el ewe es la lengua vehicular.
- Digitalizacion de contenido educativo: conversion de materiales escolares o articulos escritos en ingles a ewe para su uso en programas de alfabetizacion y ensenanza bilingue.
- Herramientas de comunicacion para ONG y cooperacion internacional: traduccion de formularios, encuestas y guias de campo al ewe en contextos de trabajo sobre el terreno.
- Procesamiento por lotes de corpus: generacion de traducciones en → ee para construir o ampliar corpus paralelos destinados a investigacion en linguistica computacional de lenguas de bajos recursos.
- Integracion en editores de texto o navegadores: extensiones que ofrezcan traduccion instantanea de parrafos seleccionados mediante inferencia local con Candle, sin latencia de red.
- Preprocesado en pipelines de NLP multilingue: traduccion previa al ingles o generacion de variantes en ewe para tareas posteriores como analisis de sentimiento o clasificacion en una lengua sin recursos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 74,2 millones de parametros, la carga en fp32 ronda los 300 MB y en fp16 alrededor de 150 MB. Las estimaciones en cuantizacion inferior (int8, int4) no estan publicadas para este paquete.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere hardware de datacenter (A100, H100) salvo para despliegues de muy alto throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (serie RTX 20xx en adelante) e incluso en GPUs integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable, dado el reducido tamano del modelo; es un candidato claro para despliegue en portatiles y telefonos.
- Opciones de despliegue: transformers (PyTorch), Candle a traves de `marian_flutter`, y conversion a otros formatos si se generan exportaciones adicionales. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-ee | 74,2 M | no disponible | en, ee | no disponible (remite al modelo base) | Hugging Face, formato safetensors |
| Helsinki-NLP/opus-mt-en-ee | no disponible en la informacion proporcionada | no disponible | en, ee | habitualmente CC-BY 4.0 (segun model card upstream) | Hugging Face, modelo base |
| NLLB-200 (variantes destiladas, p. ej. 600M) | ~600 M en la variante destilada | no disponible en la informacion proporcionada | mas de 200 lenguas, incluido el ewe | CC-BY-NC 4.0 en varias variantes | Hugging Face |
| M2M-100 (variante 418M) | ~418 M | no disponible en la informacion proporcionada | 100 lenguas | MIT en la publicacion original | Hugging Face |

La comparacion con NLLB-200 y M2M-100 es orientativa: ambos cubren muchas mas lenguas y permiten traduccion directa entre pares sin pasar por el ingles, a costa de un tamano notablemente mayor. El paquete de Malinali se distingue por su ligereza y su orientacion a inferencia en dispositivo con Candle, no por cobertura multilingue.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al ser un modelo entrenado sobre corpus OPUS, puede heredar sesgos de dominio (textos religiosos, legislativos o web) y un registro poco adaptado al habla coloquial.
- Riesgo de alucinacion: como cualquier modelo de traduccion neuronal, puede generar traducciones fluidas pero incorrectas, especialmente en terminos tecnicos, nombres propios o expresiones idiomaticas del ewe.
- Limitacion de direccion: solo traduce en → ee; no hay soporte para ee → en ni para otros pares.
- Cobertura linguistica: el ewe es una lengua de bajos recursos, por lo que la calidad probablemente sea inferior a la de pares con mas datos disponibles. No se han publicado evaluaciones que lo cuantifiquen.
- Restricciones de licencia: el repositorio no declara licencia propia. La model card indica que se debe seguir la licencia del modelo base (habitualmente CC-BY 4.0 para OPUS-MT), pero al no figurar de forma explicita, conviene verificar antes de un uso comercial.
- Caveat de procedencia: se trata de un reempaquetado, no de un modelo reentrenado. Malinali no reclama la propiedad de los pesos; la calidad es la del modelo Helsinki-NLP/opus-mt-en-ee.
- Estado del repositorio: sin descargas ni likes registrados y con fechas de creacion y actualizacion muy proximas, lo que sugiere un artefacto recien publicado y sin validacion comunitaria.
- Compatibilidad: los tokenizadores se han convertido a JSON de Hugging Face; el comportamiento puede diferir ligeramente del tokenizador SentencePiece original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-en-ee
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ee
- Proyecto Helsinki-NLP / OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
