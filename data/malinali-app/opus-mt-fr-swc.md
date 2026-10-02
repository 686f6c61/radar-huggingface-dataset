# malinali-app/opus-mt-fr-swc

## Resumen

`malinali-app/opus-mt-fr-swc` es un paquete de pesos para traduccion automatica de frances (fr) a swahili del Congo (swc, Kingwana), publicado por Malinali en HuggingFace. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-fr-swc` del proyecto OPUS-MT (Helsinki-NLP), convertidos a formato safetensors y acompanados de tokenizers rapidos compatibles con Hugging Face y con el runtime Candle mediante la libreria `marian_flutter`.

El modelo sigue la arquitectura MarianMT, un transformer encoder-decoder disenado especificamente para traduccion automatica, con 75.531.020 parametros en formato safetensors. Su interes practico radica en la orientacion a inferencia local (on-device): el repo ocupa 0,3 GB, lo que permite ejecutarlo en movil, navegador o equipos sin GPU dedicada, un escenario relevante para aplicaciones de traduccion sin conexion y para contextos con conectividad limitada.

El valor anadido de esta publicacion es la conversion de los tokenizers de SentencePiece a JSON de tokenizer rapido de Hugging Face (`tokenizer-enc.json` para el idioma origen y `tokenizer-dec.json` para el destino), necesaria para que motores como Candle (`marian_flutter`) puedan consumir el modelo en Flutter y entornos embebidos. Malinali declara explicitamente que no reclama la propiedad del modelo entrenado y que la licencia debe seguirse segun la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 75.531.020 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | fr (frances), swc (swahili del Congo / Kingwana) |
| Licencia | no disponible en los metadatos de HuggingFace; la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Direccion de traduccion | fr → swc (unidireccional) |
| Libreria | transformers |
| Runtime objetivo | Candle (`marian_flutter`), on-device |
| Modelo base | Helsinki-NLP/opus-mt-fr-swc |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MarianMT, un transformer encoder-decoder con atencion completa desarrollado en el marco del proyecto OPUS-MT de Helsinki-NLP. Marian es una implementacion en C++ optimizada para traduccion neuronal, y los modelos OPUS-MT derivados se caracterizan por su tamano contenido (en este caso 75,5 millones de parametros) y por entrenarse sobre corpus paralelos extraidos de la coleccion OPUS. No es un modelo multimodal ni incorpora mecanismos de atencion lineal, decodificacion especulativa ni modos de razonamiento extendido.

No se dispone, en la informacion proporcionada, del numero exacto de tokens de entrenamiento, de la composicion detallada del dataset paralelo fr-swc ni de si se aplicaron tecnicas de ajuste como RLHF o DPO. La unica innovacion tecnica documentada en esta publicacion concreta es de empaquetado e integracion: la conversion de los tokenizers SentencePiece originales a tokenizers rapidos en formato JSON, junto con la preparacion de los pesos en safetensors, para habilitar inferencia on-device con Candle. Malinali indica de forma explicita que solo reempaqueta pesos y tokenizers y que no reclama la autoria del modelo entrenado.

## Capacidades

- Traduccion de texto de frances a swahili del Congo (swc) mediante la pipeline `translation` de Hugging Face.
- Generacion texto a texto (`text2text-generation`) con tokenizers separados para origen y destino, lo que permite codificar y decodificar con vocabularios independientes.
- Inferencia local y on-device: el peso del repositorio (0,3 GB) y el formato safetensors permiten ejecucion sin servidor y en entornos embebidos a traves de Candle (`marian_flutter`).
- Integracion nativa con `transformers` y con la etiqueta `endpoints_compatible`, lo que facilita su despliegue en Hugging Face Inference Endpoints.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- El soporte multilingue se limita estrictamente al par fr → swc; no es un modelo multilingue generalista.

## Casos de uso

- Traduccion sin conexion en aplicaciones moviles: al ser un modelo de 75,5 M de parametros y 0,3 GB, puede embeberse en apps Flutter mediante `marian_flutter` y ofrecer traduccion fr-swc sin acceso a red, util en zonas con conectividad intermitente.
- Atencion al cliente en la Republica Democratica del Congo: empresas y operadores que atienden a poblacion francofona y swahilihablante pueden integrar el modelo para traducir consultas y respuestas en tiempo real dentro de sus canales de soporte.
- Organizaciones humanitarias y ONG: traduccion de materiales informativos (salud, agua, saneamiento, procedimientos de emergencia) del frances al swahili del Congo para distribucion en terreno.
- Localizacion de contenidos editoriales y webs: conversion de articulos, guias y paginas de producto escritas en frances a swc como primer paso de un flujo de localizacion, con revision humana posterior.
- Subtitulado y transcripcion asistida: generacion de subtitulos en swc a partir de guiones o transcripciones en frances para contenido audiovisual, tarea adecuada para un modelo especializado en traduccion frente a uno generativo generalista.
- Educacion y materiales didacticos: traduccion de apuntes, ejercicios o manuales escolares del frances al swahili del Congo en contextos donde el frances es lengua de instruccion pero el alumnado usa swc como lengua vehicular.
- Sistemas de mensajeria y salud publica: traduccion de avisos, recordatorios de citas o campanas sanitarias en plataformas de mensajeria, con despliegue en servidor ligero o directamente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas, ni tampoco cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 300 MB solo para pesos; en fp16, alrededor de 150 MB; en cuantizacion int8, en torno a 75 MB. A estas cifras hay que sumar el coste de activaciones y memoria del tokenizer, poco significativo dado el tamano del modelo.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo. Funciona sin problemas en GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100; tambien en GPUs integradas y aceleradores de borde.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU, Raspberry Pi o dispositivos moviles de gama media-alta, dado el reducido numero de parametros.
- Opciones de despliegue: `transformers` (Python), Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` esta presente), Candle mediante `marian_flutter` para Flutter, y en general cualquier runtime capaz de cargar safetensors con arquitectura Marian. No se documentan recetas oficiales para vLLM, llama.cpp, Ollama ni TGI, dado que no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fr-swc | 75.531.020 | no disponible | fr → swc | no disponible (remite al modelo base) | HuggingFace, safetensors, orientado a Candle |
| Helsinki-NLP/opus-mt-fr-swc (modelo base) | ~75 M (arquitectura Marian, valor exacto no confirmado en la informacion disponible) | no disponible | fr → swc | habitualmente CC-BY 4.0 | HuggingFace, pesos originales |
| Otros modelos OPUS-MT (p. ej. pares fr-xx) | rango tipico de 70-80 M | no disponible | pares de idiomas concretos | habitualmente CC-BY 4.0 | HuggingFace, amplia coleccion |
| NLLB-200 (variante destilada 600M) | ~600 M | no disponible en esta ficha | multilingue (200 idiomas) | CC-BY-NC 4.0 (uso no comercial) | HuggingFace |
| M2M-100 (418M) | ~418 M | no disponible en esta ficha | multilingue (100 idiomas) | MIT | HuggingFace |

Nota: las cifras de modelos comparativos distintos del modelo tratado no proceden de la informacion proporcionada en esta busqueda y se incluyen como referencia de categoria; conviene verificarlas en las fichas oficiales antes de citarlas.

## Limitaciones y advertencias

- Unidireccionalidad: solo traduce de frances a swahili del Congo. Para la direccion inversa se necesitaria el modelo ompuesto correspondiente.
- Cobertura de idioma limitada: al estar especializado en un unico par de idiomas, no ofrece traduccion multilingue ni pivotaje a otros idiomas.
- Variedad idiomatica: `swc` corresponde al swahili del Congo (Kingwana), distinto del swahili estandar de Tanzania (`swh`); el modelo no es necesariamente adecuado para otras variantes.
- Riesgo de alucinacion y de omision: como todo sistema de traduccion neuronal, puede generar contenido no presente en el original, omitir segmentos o producir traducciones fluidas pero incorrectas, especialmente con terminologia tecnica, nombres propios o texto muy informal.
- Longitud de contexto no documentada: se desconoce el limite maximo de tokens por segmento, lo que obliga a trocear entradas largas y a validar el comportamiento con parrafos extensos.
- Licencia ambigua: aunque la model card sugiere seguir la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT), los metadatos de HuggingFace no declaran licencia. Es imprescindible confirmar los terminos antes de un uso comercial.
- Ausencia total de validacion publicada: con 0 descargas y 0 likes en el momento del analisis, no existen evaluaciones independientes ni metricas de calidad que respalden su rendimiento en produccion.
- Dependencia del upstream: al ser un reempaquetado, cualquier limitacion, sesgo o error del modelo `Helsinki-NLP/opus-mt-fr-swc` se hereda sin cambios.
- Sesgos de dominio: los corpus OPUS estan sesgados hacia ciertos dominios (textos legislativos, religiosos, subtitulos y documentacion tecnica), lo que puede degradar la calidad en registros conversacionales o especializados no representados.
- Requisito de revision humana: para usos sensibles (salud, legal, humanitario) se recomienda post-edicion por hablantes nativos de swc.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-fr-swc
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-swc
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
