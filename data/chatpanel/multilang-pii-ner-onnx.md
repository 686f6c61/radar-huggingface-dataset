# ChatPanel/multilang-pii-ner-ONNX

## Resumen

`ChatPanel/multilang-pii-ner-ONNX` es una copia sin modificaciones del modelo `onnx-community/multilang-pii-ner-ONNX`, publicada por ChatPanel para centralizar las descargas de su pasarela (gateway). No se ha reentrenado, convertido ni editado ningun fichero: los pesos son identicos byte a byte a los del repositorio upstream en el commit `730c579658f8258600cc8a069b2fad1615289201`.

Se trata de un modelo de reconocimiento de entidades nombradas (NER) orientado a la deteccion de informacion personal identificable (PII) en multiples idiomas. La arquitectura subyacente es XLM-RoBERTa, segun la etiqueta `xlm-roberta` del repositorio, exportada a formato ONNX y cuantizada para inferencia ligera. El tamano del repositorio es de 0,3 GB, lo que sugiere una variante base o distilada empaquetada en un unico fichero `onnx/model_quantized.onnx`.

Su relevancia practica radica en el caso de uso: filtrado y anonimizacion de PII en pipelines de produccion con requisitos de privacidad (RGPD, cumplimiento interno), donde un modelo ONNX cuantizado permite despliegue en CPU con baja latencia sin depender de GPUs. Al ser una copia de conveniencia, la referencia tecnica autorizada es siempre el repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion incluida en `onnx/model_quantized.onnx` (esquema concreto no disponible) |
| Idiomas soportados | multilingue (lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder multilingue, y se distribuye exclusivamente como grafo ONNX cuantizado. La model card de este repositorio no aporta informacion sobre el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino supervisado o preferencias; esos detalles, si existen, corresponden al repositorio upstream `onnx-community/multilang-pii-ner-ONNX` y a su model card original (`UPSTREAM_README.md`).

La innovacion tecnica relevante en este empaquetado es la exportacion a ONNX con cuantizacion, que reduce el peso del repositorio a 0,3 GB y habilita inferencia en CPU mediante ONNX Runtime. No se documentan en la informacion disponible tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de entidades nombradas (NER) orientado a informacion personal identificable (PII), segun el nombre del modelo.
- Cobertura multilingue, derivada de la arquitectura XLM-RoBERTa y del calificador `multilang` del nombre.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU y GPU.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- No se documenta generacion de texto: es un modelo de etiquetado (token classification), no un modelo generativo.

## Casos de uso

- Anonimizacion de PII en logs y trazas de aplicaciones: el modelo etiqueta tokens correspondientes a nombres, correos, telefonos u otras entidades personales, que se enmascaran antes de almacenar o enviar los logs a un sistema de observabilidad.
- Cumplimiento RGPD en pipelines de datos: integrado como paso previo a la persistencia de textos de usuario (formularios, tickets, transcripciones), permite detectar y redactar datos personales antes del almacenamiento.
- Preprocesado para entrenamiento de modelos: filtrado de datasets que contienen conversaciones o documentos de usuarios para eliminar PII antes de usarlos en ajuste fino.
- Moderacion y revision de contenido en soporte al cliente: deteccion de datos sensibles en mensajes entrantes para enrutarlos a flujos con controles de acceso reforzados.
- Enmascaramiento en sistemas de analitica: procesamiento por lotes de textos multilingues para generar versiones seudonimizadas antes del analisis estadistico.
- Despliegue en entornos sin GPU: al distribuirse como ONNX cuantizado, puede ejecutarse en servidores CPU o en el borde (edge) con ONNX Runtime, lo que encaja en arquitecturas de privacidad donde los datos no deben salir del perimetro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,3 GB, lo que da una cota superior orientativa del espacio en disco y memoria para los pesos, pero no se especifica el consumo real en ejecucion.
- GPU recomendadas: no disponible. Al ser un encoder cuantizado de 0,3 GB, es plausible su ejecucion en CPU; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ChatPanel/multilang-pii-ner-ONNX | XLM-RoBERTa + ONNX | no disponible | no disponible | MIT | ONNX cuantizado | Copia del upstream de onnx-community |
| onnx-community/multilang-pii-ner-ONNX | XLM-RoBERTa + ONNX | no disponible | no disponible | MIT (segun upstream) | ONNX | Repositorio original; referencia autorizada |
| Otros modelos NER de PII | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es una copia de conveniencia: no se han aplicado mejoras, correcciones ni conversiones propias. Cualquier problema del modelo debe reportarse contra el repositorio upstream.
- No se documentan sesgos conocidos; al ser un modelo multilingue entrenado sobre datos web, es esperable un rendimiento desigual entre idiomas, pero no hay mediciones disponibles.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y falsos negativos en la deteccion de entidades; no se publican metricas de precision o recall.
- La lista concreta de idiomas soportados y la longitud de contexto no estan disponibles, lo que limita la planificacion de produccion.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia y las condiciones del repositorio upstream, ya que este repositorio solo replica lo publicado.
- El esquema de cuantizacion no esta detallado; la perdida de precision respecto al modelo original no esta cuantificada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/multilang-pii-ner-ONNX
- Repositorio upstream: https://huggingface.co/onnx-community/multilang-pii-ner-ONNX
- Commit upstream referenciado: `730c579658f8258600cc8a069b2fad1615289201`
- Model card original: `UPSTREAM_README.md` dentro del repositorio
