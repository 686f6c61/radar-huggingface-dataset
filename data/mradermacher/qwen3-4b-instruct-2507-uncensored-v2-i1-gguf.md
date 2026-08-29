# mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF con matriz de importancia (imatrix) del modelo `Manitec/Qwen3-4B-Instruct-2507-uncensored-v2`, una variante "sin censura" del Qwen3-4B-Instruct-2507 de Alibaba. El autor, mradermacher, es conocido por generar cuantizaciones de alta calidad para ejecución local mediante llama.cpp y otros motores compatibles con GGUF. El archivo incluido es únicamente la matriz de importancia (imatrix), que se utiliza para crear cuantizaciones personalizadas; los quants estáticos están disponibles en un repositorio hermano.

La relevancia de este modelo radica en ofrecer una versión sin restricciones de contenido de un modelo instruct de 4B parámetros, lo que permite su uso en escenarios donde se requiere generación de texto sin filtros de seguridad. Al estar en formato GGUF, es compatible con una amplia gama de herramientas de inferencia local, lo que facilita su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el modelo base es de 4B, pero no se confirma en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (listados en los comentarios; el repo actual solo contiene el archivo imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo base en la informacion disponible. Se sabe que es una cuantizacion de `Manitec/Qwen3-4B-Instruct-2507-uncensored-v2`, que a su vez deriva del Qwen3-4B-Instruct-2507. Segun la busqueda web, este ultimo presenta mejoras en capacidades generales como seguimiento de instrucciones, razonamiento logico, comprension de texto, matematicas, ciencia, codigo y uso de herramientas. Sin embargo, no se especifican datos de entrenamiento, numero de tokens, ni tecnicas de alineacion (RLHF, DPO, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto y chat instructivo: al ser un modelo instruct, puede mantener conversaciones y seguir instrucciones, aunque no se detallan capacidades especificas en la informacion.
- Razonamiento y codigo: segun la informacion del modelo base Qwen3-4B-Instruct-2507, se esperan mejoras en razonamiento logico, matematicas y generacion de codigo, pero no hay datos concretos para esta cuantizacion.
- Uso de herramientas: el modelo base menciona soporte para tool usage, pero no se confirma en esta variante.
- Sin censura: la version "uncensored" elimina restricciones de contenido, lo que permite generar texto sin filtros de seguridad.
- Multilingue: solo se declara el ingles como idioma soportado.

## Casos de uso

- Inferencia local en hardware modesto: al ser un modelo de 4B en formato GGUF, puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM, ideal para prototipos y aplicaciones offline.
- Chatbots personalizados sin restricciones: la version sin censura permite crear asistentes que respondan a temas sensibles o controversiales sin filtros, util en entornos de investigacion o creatividad.
- Generacion de codigo asistida: con el modelo base orientado a codigo, puede usarse para autocompletar o generar fragmentos en entornos de desarrollo local.
- Analisis de texto y extraccion de informacion: su capacidad de razonamiento permite resumir, clasificar o extraer datos de documentos, aunque no se especifican limites de contexto.
- Educacion y experimentacion: para aprender sobre cuantizacion GGUF y matrices de importancia, este repositorio sirve como recurso para crear quants personalizados.
- Integracion en pipelines de IA generativa: al ser compatible con llama.cpp, puede integrarse en aplicaciones Python o servicios REST mediante servidores como llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en cuantizacion Q4_K_M, se estiman entre 2.5 y 3.5 GB, por lo que cabe en GPUs con 6 GB o mas (por ejemplo, GTX 1660, RTX 2060, RTX 3060, etc.). Esta es una estimacion general basada en el tamano tipico de modelos similares, no en datos especificos del modelo.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente para inferencia; para mayor velocidad, se recomiendan RTX 3060 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, o servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (original) | 4B | no disponible | apache-2.0 | safetensors | Modelo base con censura |
| Manitec/Qwen3-4B-Instruct-2507-uncensored-v2 | 4B | no disponible | apache-2.0 | safetensors | Version sin censura |
| mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-i1-GGUF (este) | 4B (estimado) | no disponible | apache-2.0 | GGUF | Cuantizacion con imatrix |

No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La version "uncensored" puede generar contenido ofensivo, ilegal o perjudicial, ya que se eliminan los filtros de seguridad del modelo original.
- No se dispone de informacion sobre sesgos especificos, pero al ser un modelo derivado de Qwen, puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas.
- El repositorio actual solo contiene el archivo imatrix, no los quants listos para usar; el usuario debe generarlos o descargarlos del repositorio estatico.
- Licencia apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-i1-GGUF
- Modelo base: https://huggingface.co/Manitec/Qwen3-4B-Instruct-2507-uncensored-v2
- Quants estaticos: https://huggingface.co/mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-GGUF
- Pagina de descarga y resumen: https://hf.tst.eu/model#Qwen3-4B-Instruct-2507-uncensored-v2-i1-GGUF
- Informacion sobre Qwen3-4B-Instruct-2507: https://www.modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507
