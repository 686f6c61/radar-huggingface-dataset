# Hatim2221/Mubsir-vl-arabic-htr-adapter-v2

## Resumen

Mubsir-vl-arabic-htr-adapter-v2 es un adaptador (adapter) para reconocimiento de texto manuscrito árabe (HTR, por sus siglas en inglés) desarrollado por Hatim2221. El nombre sugiere que se integra sobre un modelo vision-language (VL) para convertir imágenes de manuscritos árabes en texto digital. El repositorio en Hugging Face contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño de 0,4 GB, y no incluye una model card detallada ni documentación técnica específica.

El modelo se enmarca en la línea de trabajo del autor, que también ha publicado otros modelos como gemma-3-4b-arabic. La referencia al taller NakbaNLP 2026 en los resultados de búsqueda apunta a un artículo titulado "Mubsir OCR: End-to-End Recognition of..." que probablemente describe la arquitectura completa, aunque no se ha podido acceder al contenido completo. La relevancia de este adaptador radica en la escasez de soluciones específicas para HTR árabe, un dominio con datasets limitados y alta variabilidad caligráfica.

Dado que la información pública es muy limitada, esta ficha se basa únicamente en los metadatos disponibles y en las inferencias razonables a partir del nombre y del contexto. No se dispone de detalles sobre arquitectura interna, datos de entrenamiento, rendimiento o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre modelo vision-language (VL), probablemente basado en Qwen2-VL o similar (no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | Arabe (por el nombre y el caso de uso) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del adaptador. Por el nombre "vl" se infiere que se integra sobre un modelo vision-language, probablemente un transformer encoder-decoder con atencion cruzada entre caracteristicas visuales y textuales. El articulo asociado al taller NakbaNLP 2026 ("Mubsir OCR: End-to-End Recognition of...") podria describir la arquitectura completa, pero no se ha podido acceder a el. Tampoco se conocen los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El tag arxiv:1910.09700 en Hugging Face corresponde al paper de Lacoste et al. sobre estimacion de emisiones de carbono, no a la arquitectura del modelo.

## Capacidades

- Reconocimiento de texto manuscrito en arabe a partir de imagenes (HTR).
- Integracion como adaptador sobre un modelo vision-language, lo que permite aprovechar las capacidades de comprension visual del modelo base.
- Posible soporte para reconocimiento a nivel de linea o de parrafo, segun la practica comun en HTR arabe.
- No se dispone de informacion sobre tool calling, agentes, razonamiento multi-paso, ni otras capacidades genericas de LLM.

## Casos de uso

- Digitalizacion de archivos historicos: el adaptador puede transcribir manuscritos arabes antiguos a texto digital, facilitando su busqueda y preservacion.
- Procesamiento de documentos administrativos: transcripcion de formularios, cartas o notas manuscritas en arabe para su integracion en sistemas de gestion documental.
- Accesibilidad: conversion de documentos manuscritos a texto legible por lectores de pantalla para personas con discapacidad visual.
- Investigacion academica: apoyo a estudios filologicos o historicos que requieren transcribir grandes volumenes de manuscritos.
- Sistemas de archivo y busqueda: indexacion de contenido manuscrito para permitir busquedas por palabras clave en colecciones digitales.
- Educacion: correccion automatica de ejercicios de caligrafia o evaluacion de escritura en entornos de aprendizaje de lengua arabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de HTR como tasa de error de caracteres (CER) o tasa de error de palabras (WER).

## Requisitos de hardware

- VRAM estimada: no disponible. El adaptador pesa 0,4 GB, pero el modelo base VL sobre el que se monta puede requerir entre 8 y 24 GB de VRAM segun su tamano.
- GPU recomendadas: no disponible. Dependera del modelo base; probablemente funcione en GPUs consumer como RTX 3090 o RTX 4090 si el modelo base es de 4-8B parametros.
- Opciones de despliegue: no disponible. Al ser un adaptador de transformers, se puede cargar con la libreria `transformers` de Hugging Face, pero no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Existen otros sistemas de HTR arabe como Hatformer (propuesto en un articulo de OpenReview) o el proyecto Arabic-Handwritten-OCR de MUZAMMILPERVAIZ en GitHub, pero no se dispone de datos publicos de rendimiento de Mubsir para comparar. Se recomienda consultar el articulo del taller NakbaNLP 2026 para obtener metricas si estan publicadas.

## Limitaciones y advertencias

- La model card es generica y no proporciona informacion sobre sesgos, riesgos de alucinacion o limitaciones especificas.
- No se conoce la licencia, por lo que no se puede garantizar su uso comercial o en proyectos propietarios.
- No se dispone de datos sobre la calidad del reconocimiento en diferentes estilos caligraficos, dialectos o calidades de imagen.
- Al ser un adaptador, su rendimiento depende criticamente del modelo base VL sobre el que se monte; sin esa informacion, no se puede evaluar su comportamiento real.
- El repositorio no incluye ejemplos de uso, codigo de inferencia ni documentacion de preprocesado de imagenes, lo que dificulta su adopcion directa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hatim2221/Mubsir-vl-arabic-htr-adapter-v2
- Articulo asociado (PDF, taller NakbaNLP 2026): http://www.lrec-conf.org/proceedings/lrec2026/workshops/nakbanlp/pdf/2026.nakbanlp-1.42.pdf
- Perfil del autor en Hugging Face: https://huggingface.co/Hatim2221
- Proyecto relacionado (Arabic-Handwritten-OCR en GitHub): https://github.com/MUZAMMILPERVAIZ/Arabic-Handwritten-OCR
- Paper de Hatformer (OpenReview): https://openreview.net/pdf?id=ITi9Zwkge2
