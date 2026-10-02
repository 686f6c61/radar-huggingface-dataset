# malinali-app/opus-mt-en-rw

## Resumen

`malinali-app/opus-mt-en-rw` es un paquete de pesos para traducción automática de inglés (en) a kinyarwanda (rw), publicado por el desarrollador malinali-app para su aplicación Malinali. No se trata de un modelo entrenado desde cero: es un reempaquetado del modelo `Helsinki-NLP/opus-mt-en-rw`, perteneciente a la familia OPUS-MT del grupo de investigación Helsinki-NLP, convertido a safetensors e incluyendo tokenizadores rápidos en formato JSON para su uso con el framework Candle.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder orientado específicamente a traducción automática neuronal, con 75.639.776 parámetros totales y un tamaño de repositorio de 0,3 GB. Su relevancia práctica radica en el despliegue en dispositivo (on-device): al ser un modelo compacto permite traducción local sin conexión, algo especialmente útil en escenarios con conectividad limitada o requisitos de privacidad.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre licencia propia ni sobre datos de entrenamiento. La ficha remite explícitamente a la model card del modelo base para cualquier condición de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion) |
| Parametros totales | 75.639.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del modelo |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | en (ingles), rw (kinyarwanda) |
| Licencia | no disponible en el repositorio; el autor indica que se debe seguir la licencia del modelo base Helsinki-NLP/opus-mt-en-rw (habitualmente CC-BY 4.0) |
| Formato de pesos | safetensors (model.safetensors) |

Ficheros incluidos en el repositorio:

| Fichero | Funcion |
|---|---|
| `config.json` | Configuracion del modelo Marian |
| `model.safetensors` | Pesos del modelo |
| `tokenizer-enc.json` | Tokenizador rapido de origen (ingles) |
| `tokenizer-dec.json` | Tokenizador rapido de destino (kinyarwanda) |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer secuencial encoder-decoder diseñado por Helsinki-NLP para traduccion automatica neuronal. La unica modificacion aplicada por malinali-app es el reempaquetado de los pesos originales a formato safetensors y la conversion de los tokenizadores SentencePiece del modelo base a tokenizadores rapidos en JSON (`tokenizer-enc.json` y `tokenizer-dec.json`), necesarios para la implementacion `marian_flutter` sobre Candle.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO en el modelo original. El autor indica explicitamente que no reclama la propiedad del modelo entrenado y que solo redistribuye los pesos; toda la informacion de entrenamiento corresponde al modelo base `Helsinki-NLP/opus-mt-en-rw` y al proyecto OPUS-MT. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Traduccion de texto de ingles a kinyarwanda en una unica direccion (en → rw).
- Generacion de texto seq2seq mediante pipeline `text2text-generation`.
- Inferencia en dispositivo mediante Candle, con tokenizadores rapidos especificos para el runtime.
- Compatible con la libreria transformers y con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue limitada a los dos idiomas del par de traduccion.
- No se documentan capacidades de vision, audio, modo de razonamiento ni modos especiales.

## Casos de uso

- Localizacion de aplicaciones moviles al kinyarwanda: traduccion de cadenas de interfaz y textos de producto para publicar una aplicacion en Ruanda, aprovechando que el modelo cabe en el propio dispositivo y no requiere llamadas a servidores externos.
- Traduccion sin conexion en zonas con conectividad limitada: al ser un modelo de 75 millones de parametros empaquetado en Candle, puede ejecutarse localmente en movil o escritorio, cubriendo escenarios de campo donde no hay acceso estable a internet.
- Traduccion de documentacion tecnica y manuales de producto: conversion de guias de instalacion, fichas de producto o manuales de usuario del ingles al kinyarwanda como paso previo a una revision humana.
- Atencion al cliente en Ruanda: preprocesamiento de consultas y respuestas en ingles para generar borradores en kinyarwanda que un agente local revisa y valida.
- Traduccion de contenido sanitario o educativo: adaptacion de materiales informativos, campanas de salud publica o contenido formativo, con revision humana obligatoria por la sensibilidad del dominio.
- Subtitulado y transcripcion de contenido audiovisual: traduccion de subtitulos en ingles a kinyarwanda dentro de un pipeline de postproduccion, dado el bajo coste computacional del modelo.
- Investigacion en traduccion automatica de bajos recursos: uso como linea base para comparar con modelos multilingues de mayor tamano en el par en-rw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB en precision FP32; en torno a 0,15 GB si se convierte a FP16; alrededor de 0,08 GB en INT8. Estas cifras son estimaciones a partir de los 75,6 millones de parametros y no proceden de mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo tambien puede ejecutarse integramente en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual (por ejemplo, series RTX 20xx, 30xx, 40xx) e incluso en GPUs integradas.
- Opciones de despliegue: Candle mediante `marian_flutter` (el runtime objetivo del autor), libreria transformers de Hugging Face, y conversion a CTranslate2 para servir modelos OPUS-MT. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-rw | 75,6 M | en, rw | no disponible | no disponible (base habitualmente CC-BY 4.0) | Hugging Face, empaquetado para Candle |
| Helsinki-NLP/opus-mt-en-rw | no disponible en la informacion proporcionada | en, rw | no disponible | CC-BY 4.0 segun el autor | Hugging Face |
| NLLB-200-distilled-600M | 600 M | multilingue, incluye kinyarwanda | no disponible en la informacion proporcionada | CC-BY-NC 4.0 | Hugging Face |
| M2M-100 (418M) | 418 M | multilingue | no disponible en la informacion proporcionada | MIT | Hugging Face |

Los datos de parametros, licencia e idiomas de NLLB-200 y M2M-100 proceden de conocimiento general de esos modelos; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Direccionalidad unica: el modelo solo traduce de ingles a kinyarwanda; no soporta la direccion inversa.
- Sin informacion de licencia propia en el repositorio: el autor remite a la licencia del modelo base. Antes de un uso comercial es imprescindible verificar las condiciones de `Helsinki-NLP/opus-mt-en-rw` y del proyecto OPUS-MT.
- Riesgo de alucinacion y de traducciones incorrectas: los modelos de traduccion neuronales pueden generar contenido plausible pero erroneo, especialmente en terminologia especializada, nombres propios y expresiones idiomaticas.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo base (corpus OPUS, de dominio mayoritariamente publico y administrativo), que no se documentan ni se cuantifican en esta ficha.
- Cobertura limitada del kinyarwanda: es un idioma de bajos recursos, por lo que la calidad en dominios tecnicos, legales o cientificos puede degradarse notablemente.
- Longitud de contexto no documentada: no se especifica el maximo de tokens de entrada, lo que complica el diseño de pipelines con documentos largos.
- Repositorio sin adopcion: 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad.
- Revision humana recomendada en produccion: dado que no hay benchmarks publicados, no se debe asumir un umbral de calidad sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/malinali-app/opus-mt-en-rw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-rw
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
