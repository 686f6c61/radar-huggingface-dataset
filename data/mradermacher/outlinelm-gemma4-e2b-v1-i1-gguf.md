# mradermacher/OutlineLM-Gemma4-E2B-v1-i1-GGUF

## Resumen

OutlineLM-Gemma4-E2B-v1-i1-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo DiTy/OutlineLM-Gemma4-E2B-v1. El trabajo de mradermacher consiste en convertir los pesos originales en formato Hugging Face a GGUF y producir cuantizaciones con matrices de importancia (imatrix) para su uso en llama.cpp y entornos compatibles. El modelo base pertenece a la familia Gemma 4, en su variante E2B, y esta orientado a tareas de generacion de esquemas y estructuras de texto (outline), segun se deduce de su nombre.

El repositorio se publico el 19 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni interacciones. La model card es una plantilla generica de cuantizacion: no incluye informacion sobre arquitectura, datos de entrenamiento, benchmarks ni capacidades especificas del modelo base. La informacion disponible sobre el modelo original es, por tanto, muy limitada.

La relevancia de este repositorio es practica: ofrece una via para ejecutar el modelo base en hardware modesto mediante llama.cpp, con cuantizaciones de 1 a 6 bits y ficheros imatrix para generar cuantizaciones propias. El modelo base mide 1.391.607 parametros segun los safetensors, un tamano muy reducido que sugiere un modelo experimental o de juguete mas que un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; detalles no publicados en la informacion disponible) |
| Parametros totales | 1.391.607 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S; fichero imatrix incluido |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El tag `gemma4` indica que pertenece a la familia Gemma 4 de Google, pero no se detalla si emplea un transformer denso, una variante MoE ni ninguna innovacion concreta. El nombre "E2B" sugiere una variante de eficiencia o de tamano reducido dentro de la familia, aunque no hay confirmacion en la informacion disponible.

Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del corpus ni si hubo etapas de RLHF o DPO. El modelo base, DiTy/OutlineLM-Gemma4-E2B-v1, parece un ajuste fino orientado a la generacion de esquemas (outline), pero no se aportan detalles sobre el proceso de ajuste. El repositorio de mradermacher solo documenta el proceso de cuantizacion: conversion a GGUF, generacion de imatrix y publicacion de cuantizaciones estaticas en un repositorio separado.

## Capacidades

- Generacion de texto en ingles y ruso, segun los idiomas declarados.
- Generacion de esquemas y estructuras de contenido (outline), a juzgar por el nombre del modelo base; no confirmado en la documentacion.
- Capacidad de vision: la model card indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico.
- Inferencia mediante llama.cpp y entornos compatibles con GGUF.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado local de generacion de esquemas: el modelo, con 1,39 millones de parametros, cabe en cualquier equipo y permite probar pipelines de generacion de outlines sin coste de GPU.
- Pruebas de integracion con llama.cpp: util para validar el flujo de carga de GGUF, seleccion de cuantizacion y concatenacion de ficheros multiparte en entornos de desarrollo.
- Evaluacion de cuantizaciones: el fichero imatrix y las 24 variantes de cuantizacion permiten comparar calidad y tamano en un modelo pequeno antes de aplicar la misma metodologia a modelos mayores.
- Generacion de texto bilingue ingles-ruso en entornos con recursos limitados: adecuado para tareas de relleno o borradores donde no se requiere alta calidad.
- Docencia y experimentacion: modelo de tamano minimo para explicar cuantizacion, matrices de importancia y despliegue con llama.cpp en cursos o talleres.
- Despliegue en dispositivos embebidos o CPU: al ocupar menos de 1 GB incluso en cuantizaciones altas, puede ejecutarse en Raspberry Pi o contenedores ligeros para demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones, dado el tamano del modelo (1,39 millones de parametros); las cuantizaciones Q6_K e IQ4_XS quedan muy por debajo de ese umbral.
- GPU recomendadas: cualquier GPU consumer, incluidas GTX 1050, RTX 3050 o superiores; el modelo tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de sistemas embebidos.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF; el modelo base usa transformers.
- Latencia y throughput: no disponibles; por el tamano, se espera inferencia en milisegundos en CPU moderna, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OutlineLM-Gemma4-E2B-v1-i1-GGUF | 1.391.607 | no disponible | apache-2.0 | GGUF | Cuantizaciones imatrix de un ajuste Gemma 4 |
| OutlineLM-Gemma4-E2B-v1-GGUF (estatico) | 1.391.607 | no disponible | apache-2.0 | GGUF | Mismo modelo, cuantizaciones estaticas |
| DiTy/OutlineLM-Gemma4-E2B-v1 (base) | 1.391.607 | no disponible | apache-2.0 | safetensors | Pesos originales en transformers |

No se dispone de información sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste de Gemma 4, puede heredar sesgos del modelo base, no evaluados en la informacion disponible.
- Riesgo de alucinacion no cuantificado; con 1,39 millones de parametros, la coherencia y fiabilidad del texto generado seran muy limitadas.
- Contexto maximo no documentado; no se puede garantizar el manejo de conversaciones largas.
- Solo se declaran ingles y ruso; el rendimiento en castellano no esta evaluado.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base DiTy/OutlineLM-Gemma4-E2B-v1 y de la familia Gemma 4, que pueden imponer terminos adicionales.
- El repositorio no incluye los ficheros mmproj; si se necesita la capacidad de vision, hay que acudir al repositorio estatico.
- No apto para produccion sin una evaluacion previa: no hay benchmarks, ni documentacion de entrenamiento, ni garantias de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-i1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E2B-v1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OutlineLM-Gemma4-E2B-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
