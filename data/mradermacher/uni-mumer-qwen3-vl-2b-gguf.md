# mradermacher/Uni-MuMER-Qwen3-VL-2B-GGUF

## Resumen

Uni-MuMER-Qwen3-VL-2B-GGUF es la versión cuantizada en formato GGUF del modelo Uni-MuMER-Qwen3-VL-2B, desarrollado originalmente por el usuario phxember y convertido a GGUF por mradermacher. Se trata de un modelo vision-language especializado en OCR de matematicas manuscritas y conversion a LaTeX, construido sobre la arquitectura Qwen3-VL de 2B de parametros. El modelo resuelve el problema concreto de transcribir expresiones matematicas escritas a mano en imagenes a notacion LaTeX estructurada, una tarea relevante para digitalizacion de apuntes, correccion automatica de examenes y accesibilidad.

El modelo base cuenta con 1.720.574.976 parametros reales (segun safetensors) y esta afinado sobre Qwen3-VL, lo que le aporta capacidades multimodales de vision y comprension de imagenes. El repositorio GGUF ofrece un conjunto de cuantizaciones estaticas desde Q2_K hasta f16, ademas de los ficheros mmproj necesarios para el procesamiento de imagenes en llama.cpp. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

La relevancia actual del modelo radica en su tamano reducido (apto para GPU de consumo) combinado con una tarea especializada y bien delimitada. Frente a modelos genericos de vision-lenguaje mucho mayores, Uni-MuMER ofrece un rendimiento especializado en HMER (Handwritten Mathematical Expression Recognition) con un coste computacional muy bajo, lo que lo hace adecuado para despliegues en local, entornos educativos y pipelines de digitalizacion a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language basado en Qwen3-VL (hereda la arquitectura del modelo base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL, un transformer multimodal que combina un encoder visual con un decodificador de lenguaje. El modelo base Uni-MuMER-Qwen3-VL-2B ha sido afinado especificamente para la tarea de reconocimiento de expresiones matematicas manuscritas (HMER) y su conversion a LaTeX. El dataset de entrenamiento declarado es phxember/Uni-MuMER-Data, aunque no se detalla en la informacion disponible su composicion exacta, numero de tokens ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal del modelo reside en su especializacion: en lugar de un modelo generico de vision-lenguaje, se ha ajustado un modelo de 2B para una tarea concreta de OCR matematico. La version GGUF anade los ficheros mmproj (multi-modal projector) necesarios para que llama.cpp pueda procesar las imagenes de entrada junto con el texto. No se dispone de informacion detallada sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de matematicas manuscritas (HMER): transcripcion de expresiones matematicas escritas a mano en imagenes a notacion LaTeX.
- Conversion de imagenes de formulas a LaTeX estructurado.
- Procesamiento vision-language: comprension de imagenes combinada con generacion de texto.
- Generacion de texto conversacional (el repositorio incluye la etiqueta `conversational`).
- Soporte de inferencia multimodal mediante los ficheros mmproj en llama.cpp.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se dispone de informacion sobre tool calling, function calling, agentes o modos de razonamiento extendido.

## Casos de uso

- Digitalizacion de apuntes manuscritos: el modelo puede procesar fotografias de cuadernos con formulas matematicas y convertirlas a LaTeX editable, gracias a su especializacion en HMER y su bajo coste computacional.
- Correccion automatica de examenes: integrado en un pipeline que recibe la imagen de la respuesta manuscrita del alumno y extrae la expresion en LaTeX para compararla con la solucion esperada.
- Accesibilidad educativa: conversion de material matematico manuscrito a texto estructurado para lectores de pantalla o sistemas de sintesis de voz que interpretan LaTeX.
- Construccion de datasets matematicos: extraccion masiva de formulas desde imagenes para generar corpus de entrenamiento o bases de conocimiento en LaTeX.
- Integracion en editores de ecuaciones: asistente que permite al usuario escribir una formula a mano y obtener el LaTeX correspondiente para insertarlo en un documento.
- Despliegue en local para investigacion: al caber en GPU de consumo con cuantizaciones Q4, permite experimentar con HMER sin infraestructura cloud.
- Preprocesado en pipelines de publicacion cientifica: conversion de borradores manuscritos con ecuaciones a LaTeX para su incorporacion en articulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB para cuantizaciones Q4 (fichero de 1,2 GB), 1,9 GB para Q8_0, 3,5 GB para f16, mas el mmproj (0,5-0,9 GB adicionales para el procesamiento de imagenes).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4 con mmproj; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF y mmproj para vision. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Uni-MuMER-Qwen3-VL-2B-GGUF | 1,72B | no disponible | HMER / LaTeX | apache-2.0 | GGUF |
| Qwen3-VL-2B (base) | ~2B | no disponible | Vision-language generico | no disponible | safetensors |
| Modelos HMER especializados (genericos) | no disponible | no disponible | HMER | variable | variable |

No se dispone de informacion suficiente sobre modelos comparables de HMER con datos de rendimiento para establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo esta especializado en OCR de matematicas manuscritas; su rendimiento en otras tareas de vision o generacion de texto generico puede ser limitado en comparacion con modelos de proposito general.
- Idiomas soportados limitados al ingles segun la model card, lo que puede afectar a la comprension de instrucciones en otros idiomas.
- Riesgo de alucinacion en la transcripcion de formulas ambiguas o con caligrafia dificil; se recomienda validacion humana en entornos de produccion criticos.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- La longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de imagenes de gran resolucion o conversaciones multi-turno largas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar la precision en la transcripcion de formulas; se recomienda Q4_K_M o superior para uso en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-VL y del dataset utilizado.
- El modelo es una cuantizacion estatica; para mayor calidad puede considerarse la version imatrix disponible en el repositorio i1-GGUF del mismo autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3-VL-2B-GGUF
- Modelo base: https://huggingface.co/phxember/Uni-MuMER-Qwen3-VL-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/phxember/Uni-MuMER-Data
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3-VL-2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Uni-MuMER-Qwen3-VL-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
