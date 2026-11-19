# mradermacher/Audio-Reasoner-GGUF

## Resumen

Audio-Reasoner es un modelo multimodal de 7.754.878.976 parámetros (aproximadamente 7,75 mil millones) desarrollado originalmente por zhifeixie y distribuido en formato GGUF por mradermacher. El modelo está diseñado para el razonamiento sobre audio, combinando un codificador multimodal (mmproj) con un modelo de lenguaje base para procesar entradas de audio y generar respuestas textuales razonadas. La licencia es MIT, lo que facilita su uso comercial.

Esta ficha documenta específicamente la versión cuantizada en GGUF publicada por mradermacher, que incluye un conjunto de cuantizaciones estáticas (Q2_K hasta f16) más los ficheros mmproj necesarios para el procesamiento multimodal. El repositorio ocupa 71,7 GB en total, aunque cada cuantización individual es mucho más pequeña (desde 3,2 GB en Q2_K hasta 15,6 GB en f16).

La relevancia de esta versión radica en que permite desplegar un modelo de razonamiento sobre audio en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF, algo que no sería viable con los pesos originales en precisión completa. El modelo está etiquetado únicamente para inglés y no se dispone de información detallada sobre arquitectura interna, datos de entrenamiento o benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con codificador de audio mmproj y LLM base) |
| Parametros totales | 7.754.878.976 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. Por los artefactos publicados se deduce que se trata de un modelo multimodal compuesto por un LLM base (7,75 mil millones de parámetros) y un codificador de audio separado que se distribuye como fichero mmproj (multi-modal projection). Esta separación es la habitual en el ecosistema GGUF/llama.cpp para modelos que combinan un tower de audio o visión con un transformer de lenguaje.

Tampoco se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card de la versión GGUF es puramente descriptiva del proceso de cuantización y no incluye información sobre el entrenamiento del modelo original. Se recomienda consultar la model card del modelo base zhifeixie/Audio-Reasoner para obtener detalles arquitectónicos y de entrenamiento.

## Capacidades

- Procesamiento de audio: el modelo incluye un codificador multimodal (mmproj) que permite ingerir entradas de audio junto con texto.
- Razonamiento sobre audio: por el nombre y la estructura del modelo, está orientado a tareas de razonamiento que requieren comprender contenido sonoro.
- Generación de texto: al estar construido sobre un LLM de 7,75 mil millones de parámetros, puede generar respuestas textuales.
- Multimodalidad texto-audio: combinación de instrucciones textuales con entradas de audio en una misma conversación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking explícito, visión o audio de salida: no disponible en la información proporcionada.

## Casos de uso

- Transcripción y análisis de reuniones: el modelo puede recibir el audio de una reunión y generar un resumen textual con los puntos clave, aprovechando su codificador de audio y su LLM base para producir texto estructurado.
- Moderación de contenido en audio: integrado en un pipeline que recibe fragmentos de audio de llamadas o grabaciones y genera etiquetas textuales sobre el contenido, útil para sistemas de compliance.
- Asistentes de accesibilidad: conversión de audio ambiental o de voz en descripciones textuales razonadas para personas con discapacidad auditiva, desplegable en local gracias a las cuantizaciones Q4_K_M (4,9 GB).
- Análisis de llamadas de atención al cliente: procesamiento de grabaciones para extraer motivos de contacto, sentimiento y acciones de seguimiento, con despliegue en servidores modestos mediante llama.cpp.
- Investigación en razonamiento multimodal: base para experimentos académicos sobre cómo los LLM razonan a partir de señales de audio, con la ventaja de una licencia MIT que no restringe la publicación de resultados.
- Prototipado en estaciones de trabajo: uso de la cuantización Q8_0 (8,3 GB) o f16 (15,6 GB) para evaluar la calidad del modelo antes de invertir en infraestructura mayor, gracias a la disponibilidad de múltiples niveles de cuantización.
- Educación y aprendizaje de idiomas: análisis de pronunciación o contenido de audio en inglés y generación de feedback textual, limitado al idioma inglés del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin contar KV cache ni mmproj):
  - Q2_K: ~3,2 GB
  - Q3_K_M: ~4,0 GB
  - Q4_K_M: ~4,9 GB (recomendado por el autor para velocidad)
  - Q5_K_M: ~5,7 GB
  - Q6_K: ~6,5 GB
  - Q8_0: ~8,3 GB
  - f16: ~15,6 GB
- Ficheros mmproj adicionales: 0,8 GB (Q8_0) o 1,4 GB (f16), necesarios para el procesamiento de audio.
- GPU recomendadas: no disponibles de forma específica; por tamaño, una RTX 4090 (24 GB) puede alojar cualquier cuantización incluyendo f16 más mmproj y margen para KV cache. Una RTX 3060 de 12 GB puede ejecutar Q8_0 o Q6_K con mmproj.
- Cabe en GPU de consumo: sí, desde Q4_K_M en tarjetas de 8 GB (con margen ajustado) hasta f16 en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, text-generation-webui) por el formato GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo base zhifeixie/Audio-Reasoner sería la referencia natural para comparar la calidad de las cuantizaciones, pero no se han facilitado métricas ni especificaciones de alternativas de la misma categoría (razonamiento sobre audio de ~7-8 mil millones de parámetros).

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Audio-Reasoner (GGUF, este) | 7,75 B | no disponible | MIT | GGUF | Cuantizaciones estáticas de mradermacher |
| zhifeixie/Audio-Reasoner | 7,75 B | no disponible | MIT | safetensors | Modelo base original |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el repositorio está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se ha publicado información sobre sesgos del modelo en la documentación disponible; al ser un modelo entrenado sobre datos no especificados, es probable que herede sesgos de esos datos.
- Alucinación: como todo LLM, puede generar contenido plausible pero incorrecto, especialmente al razonar sobre audio ambiguo o ruidoso.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar el procesamiento de audios largos o conversaciones multi-turno extensas.
- Licencia: MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base zhifeixie/Audio-Reasoner por si difiere.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superior para uso en producción.
- Dependencia del mmproj: sin el fichero mmproj correspondiente, el modelo no puede procesar audio; es imprescindible descargarlo junto con la cuantización del LLM.
- Madurez: el repositorio tiene pocas descargas (180) y un solo like, lo que sugiere poca validación por parte de la comunidad.
- Información incompleta: la model card no documenta arquitectura, entrenamiento ni evaluación, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Audio-Reasoner-GGUF
- Modelo base: https://huggingface.co/zhifeixie/Audio-Reasoner
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Audio-Reasoner-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Audio-Reasoner-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
