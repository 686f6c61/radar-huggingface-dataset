# skillsafe-ai/opus-mt-en-es

## Resumen

`skillsafe-ai/opus-mt-en-es` es un paquete de artefactos ONNX listos para navegador del modelo de traduccion automatica MarianMT `Xenova/opus-mt-en-es`, que a su vez deriva de la familia OPUS-MT de Helsinki-NLP. El modelo traduce texto de ingles a castellano mediante una arquitectura transformer encoder-decoder clasica (seq2seq), con vocabulario de 65.001 tokens, dimension oculta de 512 y 6 capas en el decodificador con 8 cabezas de atencion (dimension de cabeza 64, segun los tensores declarados en la verificacion del autor).

El repositorio no aporta pesos nuevos ni reentrenamiento: es una importacion reproducible del modelo base ya publicado por Xenova, con cada fichero fijado por SHA-256 y verificado con `onnx.checker` mas una prueba de humo en CPU con `onnxruntime`. Su razon de ser es el despliegue en el navegador mediante `transformers.js`, con dos variantes de pesos (fp32 y cuantizacion q8) que permiten ejecutar traduccion en cliente sin backend.

Es relevante ahora porque cubre el nicho de traduccion en el borde (edge): un modelo pequeno, con licencia Apache-2.0 y artefactos ONNX ya empaquetados, que evita el coste de servidor para tareas de traduccion de baja latencia. La contrapartida es que se trata de una importacion sin descargas ni validacion comunitaria en el momento de redactar esta ficha, orientada exclusivamente a traduccion en y no a generacion general ni a instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo MarianMT, exportado a ONNX |
| Parametros totales | no disponible (los ficheros ONNX suman 224,91 MB en fp32 para el decodificador y 200,21 MB para el encoder; no se declara el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (las pruebas de humo usan 8 tokens de entrada; Marian estandar de OPUS-MT trabaja a nivel de frase, tipicamente hasta 512 posiciones) |
| Tipos de cuantizacion | fp32 y q8 (cuantizacion dinamica de ONNX Runtime); el decodificador cuantizado ocupa 57,42 MB frente a 224,91 MB en fp32 |
| Idiomas soportados | ingles a castellano (en-es); el campo de idiomas de HuggingFace figura como no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grados fp32 y q8) mas tokenizer en JSON (tokenizer.json, tokenizer_config.json, vocab.json) |
| Vocabulario | 65.001 tokens (deducido de la salida `logits[1, 4, 65001]`) |
| Dimension oculta | 512 (deducido de `encoder_hidden_states[1, 8, 512]`) |
| Capas y atencion | 6 capas en el decodificador con 8 cabezas de 64 dimensiones (deducido de `past_key_values.0..5`); el numero de capas del encoder no se declara |
| Libreria de despliegue | transformers.js |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | translation |
| Modelo base | Xenova/opus-mt-en-es (commit 4b002a4c7edd54a7ced58877258b87f7efd3f892) |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder completo, no un decoder-only. El encoder consume la frase fuente y produce `encoder_hidden_states`; el decodificador genera la traduccion token a token con cache de claves y valores, incluyendo atencion cruzada sobre las claves y valores del encoder (`past_key_values.N.encoder.key/value`). El export es un unico grafo combinado (`decoder_model_merged.onnx`) que integra la rama con y sin cache mediante la entrada booleana `use_cache_branch`, lo que permite hacer prefill y decodificacion incremental con el mismo fichero.

No hay informacion en la model card sobre corpus de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion tipo RLHF o DPO: la ficha del autor describe exclusivamente la cadena de conversion, con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin arm64, y una receta declarada (`recipes/opus-mt-en-es.yaml`, sha256 `8bf5510f443362266cfbb3e7e8c4dd605978a041b30e20f95904f688ae94db7d`). Se indica explicitamente que la importacion se hizo "as published upstream (no conversion)", de modo que todas las caracteristicas de entrenamiento son heredadas del modelo base y no se detallan aqui. Como innovacion tecnica del repositorio cabe senalar la verificacion: cada fichero esta fijado por SHA-256, todos los ONNX pasaron `onnx.checker` y una ejecucion de humo en CPU con entradas a cero, con un tiempo de 5,1 ms para el decodificador.

## Capacidades

- Traduccion automatica de ingles a castellano en una unica direccion; no traduce en sentido inverso.
- Traduccion a nivel de frase o parrafo corto; el pipeline es `text2text-generation` aplicado a traduccion.
- Ejecucion integra en el navegador mediante `transformers.js` sobre ONNX Runtime Web, sin llamadas a servidor.
- Dos perfiles de precision intercambiables: fp32 para maxima fidelidad y q8 para reducir huella de memoria y ancho de banda.
- Decodificacion incremental con cache de claves y valores, lo que reduce el coste por token generado frente a recalcular el prefijo.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No es un modelo de instrucciones ni de chat; no acepta system prompts.
- Sin capacidades multimodales (ni vision ni audio).
- Sin modo de razonamiento explicito (thinking mode).
- Multilingue: no; limitado al par en-es.

## Casos de uso

- Traduccion en cliente dentro de una aplicacion web: el paquete ONNX se carga con `transformers.js` y traduce texto en el propio navegador del usuario, de modo que el contenido no abandona el dispositivo y no se necesita infraestructura de inferencia.
- Internacionalizacion de documentacion tecnica: traduccion de cadenas de interfaz, mensajes de error o fragmentos de manual de ingles a castellano en tiempo de build, usando la variante q8 de 57,42 MB para integrarla en un pipeline de CI ligero.
- Traduccion de correos y mensajes en herramientas ofimaticas: al ejecutarse en local con una huella de memoria inferior a 300 MB en q8, encaja en extensiones de navegador o complementos de escritorio sin GPU.
- Pretraduccion de contenidos para revision humana: generar una primera version en castellano de articulos o fichas en ingles y pasarla despues por un revisor, lo que reduce el coste por palabra frente a servicios de traduccion por API.
- Traduccion en entornos con requisitos de soberania del dato: escenarios sanitarios, legales o de administracion publica donde no se permite enviar texto a servicios externos; el modelo corre integramente en la maquina del usuario.
- Traduccion de registros y trazas en herramientas de observabilidad: conversion de mensajes de log en ingles a castellano en el propio panel, con la variante q8 para minimizar el impacto en el hilo principal del navegador.
- Aplicaciones sin conectividad: clientes de escritorio o dispositivos aislados que necesitan traduccion en y no disponen de acceso a internet.
- Filtrado y triaje de tickets de soporte: traduccion previa de tickets en ingles para clasificarlos con reglas o modelos ligeros en castellano, dentro de una misma funcion serverless.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor unicamente aporta verificaciones de integridad y ejecucion:

| Fichero | Comprobacion | Resultado |
|---|---|---|
| `onnx/decoder_model_merged.onnx` | `onnx.checker` + ejecucion en CPU con entradas a cero | correcto, 5,1 ms |
| `onnx/decoder_model_merged_quantized.onnx` | `onnx.checker` + ejecucion en CPU | correcto, tiempo no disponible en el extracto |
| `onnx/encoder_model.onnx` | `onnx.checker` + ejecucion en CPU | correcto, tiempo no disponible |
| Integridad | SHA-256 por fichero | verificado frente al origen fijado |

No hay datos de BLEU, METEOR, COMET, MMLU ni de ninguna otra metrica de calidad de traduccion en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU y para el runtime WebGPU/WebAssembly del navegador.
- Huella en disco: 224,91 MB el decodificador fp32 y 57,42 MB el decodificador q8; 200,21 MB el encoder; el repositorio completo ocupa 0,5 GB.
- Memoria en ejecucion: inferior a 1 GB en la variante fp32 y del orden de 300-400 MB en q8, sumando encoder y decodificador (estimacion a partir de los tamanos de fichero declarados).
- GPU recomendadas: no aplica; no se documentan requisitos de aceleracion. Cualquier GPU con soporte WebGPU podria acelerar la inferencia en navegador, pero no se aportan cifras.
- Cabe en cualquier GPU de consumo e incluso en equipos sin GPU dedicada: es un modelo de menos de 100 millones de parametros segun la arquitectura declarada.
- Opciones de despliegue: `transformers.js` en navegador o Node.js, ONNX Runtime (Web, CPU o Python), y cualquier runtime capaz de cargar grafos ONNX. No esta pensado para vLLM ni TGI, que no cubren este tipo de export seq2seq.
- Latencia: la unica cifra publicada es 5,1 ms para el decodificador fp32 en una ejecucion de humo en CPU con `input_ids[1, 4]` y longitud de encoder 8, entradas a cero. No es una medida representativa de produccion.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| skillsafe-ai/opus-mt-en-es | MarianMT encoder-decoder, ONNX | no disponible (ficheros de 224,91 + 200,21 MB en fp32) | no disponible | Apache-2.0 | ONNX fp32 y q8, tokenizer JSON | Importacion reproducible orientada a `transformers.js`; 0 descargas y 0 likes en el momento de redactar |
| Xenova/opus-mt-en-es | MarianMT encoder-decoder | no disponible en la informacion proporcionada | no disponible | Apache-2.0 (segun la etiqueta del modelo base) | safetensors/ONNX segun el repositorio upstream | Modelo base exacto del que se deriva esta importacion |
| Helsinki-NLP/opus-mt-en-es | MarianMT encoder-decoder | no disponible en la informacion proporcionada | no disponible | no verificado en la informacion disponible | PyTorch | Origen de la familia OPUS-MT; no se ha consultado su ficha en esta busqueda |
| Modelos NLLB o M2M-100 para en-es | Transformer multilingue | no disponible | no disponible | no verificado | safetensors | Alternativas multilingues de mayor tamano; no se dispone de cifras comparativas verificadas |

Los resultados de la busqueda web realizada no contienen informacion sobre ningun modelo de traduccion (los enlaces devueltos corresponden a una via de Paris), por lo que no se puede completar la comparativa con datos de rendimiento contrastados.

## Limitaciones y advertencias

- Traduccion unidireccional: solo ingles a castellano; no admite el par inverso ni otros idiomas.
- Orientado a frase: no maneja documentos largos ni preserva estructura compleja (tablas, Markdown anidado) de forma fiable.
- No es un modelo de instrucciones ni de chat; no se le pueden dar ordenes, estilos ni restricciones en lenguaje natural.
- Riesgo de alucinacion y de omision de contenido, inherente a los modelos de traduccion neuronal: puede inventar terminos, omitir fragmentos o cambiar el sentido en textos ambiguos.
- Sesgos heredados del corpus de entrenamiento del modelo base, no documentados en esta ficha; el autor no aporta analisis de sesgo ni evaluacion por dominios.
- El campo de idiomas de HuggingFace figura como no disponible, lo que dificulta la verificacion automatica del par soportado.
- No se han publicado metricas de calidad (BLEU, COMET u otras) para esta importacion ni para su base en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes: los artefactos estan verificados por hash y prueba de humo, pero no cuentan con validacion de la comunidad.
- La licencia declarada es Apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base y del corpus OPUS antes de un despliegue en produccion.
- La fecha de creacion indicada (2026-09-22) es posterior a la fecha habitual de referencia; conviene comprobar la vigencia y el mantenimiento del repositorio.
- Al ser artefactos ONNX de un modelo seq2seq, quedan fuera de los ecosistemas de servido masivo (vLLM, TGI) y de las optimizaciones tipicas de los modelos decoder-only.
- La cuantizacion q8 reduce el tamano aproximadamente a la cuarta parte en el decodificador, con la perdida de calidad asociada que no se cuantifica en la model card.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/skillsafe-ai/opus-mt-en-es
- Modelo base: https://huggingface.co/Xenova/opus-mt-en-es/tree/4b002a4c7edd54a7ced58877258b87f7efd3f892
- Repositorio del conversor: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Receta de conversion declarada: `recipes/opus-mt-en-es.yaml` (sha256 `8bf5510f443362266cfbb3e7e8c4dd605978a041b30e20f95904f688ae94db7d`)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo; las URL devueltas corresponden a la rue Didot de Paris y no guardan relacion con este modelo.
