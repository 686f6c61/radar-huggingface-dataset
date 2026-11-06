# DawnLiu/EVAN-8B

## Resumen

EVAN-8B es un modelo multimodal (imagen-texto a texto) desarrollado por DawnLiu a partir de Qwen3-VL-8B-Instruct, ajustado mediante aprendizaje por refuerzo con el método EVAN (Evidence-Ablated Negatives), presentado en un artículo de NeurIPS 2026. El problema que aborda es sutil pero importante: los métodos habituales de RLVR (aprendizaje por refuerzo con recompensa verificable) solo comprueban la respuesta final, sin verificar si esta proviene realmente de la imagen o de atajos del lenguaje y del dataset. EVAN enmascara la evidencia visual necesaria, obliga al modelo a responder sin ella y penaliza las respuestas plausibles pero incorrectas sobre la imagen limpia, forzando un razonamiento verdaderamente anclado en lo visual.

El entrenamiento se realizó con DAPO sobre el dataset TIGER-Lab/ViRL39K. Los resultados publicados muestran mejoras consistentes frente al modelo base y frente a DAPO sin EVAN en nueve benchmarks de razonamiento multimodal (Geo3K, MathVista, MathVerse, We-Math, DynaMath, MathVision, MMK12, MMMU-Pro y LogicVista), con una media de 73,0 % frente al 62,5 % del modelo base. Con 8.767 millones de parámetros, licencia Apache 2.0 y pesos en safetensors, es una opción relevante para tareas de razonamiento matemático y lógico sobre imágenes que requieren respuestas verificables y trazables a la evidencia visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language, variante instruct) |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); no disponible informacion sobre cuantizaciones adicionales |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EVAN-8B parte de la arquitectura de Qwen3-VL-8B-Instruct, un modelo transformer multimodal que procesa conjuntamente imagen y texto (pipeline image-text-to-text). No se trata de una arquitectura nueva: la contribucion esta en el metodo de entrenamiento. Los pesos se modificaron unicamente mediante entrenamiento por refuerzo con EVAN, manteniendo la configuracion, el tokenizador y el procesador re-guardados con dtype bfloat16 en config.json. El generation_config.json incluye los ajustes de muestreo usados en la evaluacion de los autores.

El metodo EVAN se integra en el pipeline de DAPO (un algoritmo de RL para razonamiento) y se entrena sobre ViRL39K, un dataset de 39.000 problemas de razonamiento visual verificable de TIGER-Lab. La idea central: al enmascarar la evidencia visual que una pregunta necesita y penalizar respuestas plausibles generadas sin ella (pero incorrectas con la imagen limpia), se evita que la politica de RL aprenda atajos basados en priors linguisticos. Ademas, el modelo esta entrenado para producir un monologo interno de razonamiento dentro de etiquetas `<think>` seguido de la respuesta final en `\boxed{}`, al estilo de los modelos de razonamiento con thinking mode.

## Capacidades

- Razonamiento multimodal con monologo interno: genera un proceso de razonamiento entre `<think>` y `</think>` y una respuesta final en `\boxed{}`
- Resolucion de problemas matematicos sobre imagenes: geometria, matematicas visuales, graficos y diagramas (mejoras destacables en Geo3K, MathVerse, We-Math y DynaMath)
- Razonamiento logico visual (LogicVista) y respuestas a examenes academicos multimodales (MMK12, MMMU-Pro)
- Comprension de imagen y texto combinados (pipeline image-text-to-text de transformers)
- Generacion de texto conversacional, heredada del modelo base Qwen3-VL-8B-Instruct
- Integracion estandar con la libreria transformers (AutoModelForImageTextToText y AutoProcessor)
- No se menciona soporte de tool calling ni de agentes en la informacion disponible

## Casos de uso

- Resolucion automatica de problemas de geometria con diagramas: el modelo destaca en Geo3K (76,6 % frente al 65,2 % del modelo base), lo que lo hace adecuado para tutores educativos que analizan figuras geometricas y razonan paso a paso sobre ellas.
- Verificacion de razonamiento anclado en la imagen: gracias al entrenamiento con negatives ablatados, es util en flujos donde se necesita confianza en que la respuesta proviene del contenido visual y no de atajos linguisticos, por ejemplo en auditoria de sistemas VLM.
- Matematicas visuales en investigacion: su rendimiento en MathVerse (85,0 %), We-Math (84,9 %) y DynaMath (77,6 %) lo hace apropiado como baseline o componente en pipelines de evaluacion de razonamiento multimodal.
- Respuesta a examenes con contenido grafico: el alto resultado en MMK12 (85,0 %) lo hace viable para sistemas de correccion o apoyo al estudio en educacion secundaria con preguntas que incluyen imagenes.
- Analisis de documentos y graficos cientificos: la capacidad de razonar sobre figuras con salida estructurada en `\boxed{}` facilita la extraccion de respuestas numericas verificables en automatizacion de evaluacion de articulos o informes.
- Generacion de cadenas de razonamiento auditables: el formato `<think>` permite inspeccionar el proceso de razonamiento del modelo, util en depuracion de sistemas y en investigacion sobre interpretabilidad de razonamiento multimodal.

## Benchmarks y rendimiento

Accuracy (%) de la Tabla 1 del articulo, con muestreo a temperatura 1.0. DAPO usa los mismos datos y receta de entrenamiento sin EVAN.

| Modelo | Geo3K | MathVista | MathVerse | We-Math | DynaMath | MathVision | MMK12 | MMMU-Pro | LogicVista | Avg. |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Qwen3-VL-8B-Instruct | 65,2 | 68,7 | 69,4 | 77,2 | 73,4 | 38,0 | 69,1 | 40,3 | 61,3 | 62,5 |
| DAPO | 74,6 | 71,9 | 84,0 | 83,9 | 76,9 | 56,7 | 84,1 | **52,3** | 62,4 | 71,9 |
| **EVAN-8B** | **76,6** | **74,9** | **85,0** | **84,9** | **77,6** | **57,0** | **85,0** | 52,0 | **63,6** | **73,0** |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, un modelo de 8,77 B de parametros ocupa en torno a 17,5 GB solo de pesos (el tamano del repo es de 17,5 GB), mas overhead de activaciones y vision encoder; se recomienda una GPU con 24 GB de VRAM como minimo
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para inferencia en bf16; A100 o H100 para cargas mayores o evaluaciones en lote
- Consumer GPU: cabe en una RTX 3090/4090 en bfloat16; con cuantizacion a 4 bits (no distribuida oficialmente en el repo, pero factible con herramientas externas) podria caber en GPUs de 12 GB, aunque esto no esta verificado por los autores
- Opciones de despliegue: transformers (>= 4.57) con accelerate y torchvision, usando AutoModelForImageTextToText y device_map="auto"; no se menciona soporte oficial de vLLM, llama.cpp, Ollama o TGI en la model card
- Latencia y throughput: no disponible; tener en cuenta que el formato de razonamiento con `<think>` genera salidas largas que aumentan la latencia por respuesta

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Media benchmarks (paper) | Disponibilidad |
|---|---|---|---|---|---|
| EVAN-8B | 8,77 B | Qwen3-VL-8B-Instruct | Apache 2.0 | 73,0 % (9 benchmarks multimodales) | HF: DawnLiu/EVAN-8B |
| EVAN-7B | no disponible | no disponible | no disponible | no disponible | HF: DawnLiu/EVAN-7B |
| EVAN-3B | no disponible | no disponible | no disponible | no disponible | HF: DawnLiu/EVAN-3B |
| Qwen3-VL-8B-Instruct | 8,77 B | Qwen3-VL | Apache 2.0 | 62,5 % (mismos 9 benchmarks) | HF: Qwen/Qwen3-VL-8B-Instruct |

La alternativa mas directa es el propio modelo base, Qwen3-VL-8B-Instruct, que pierde 10,5 puntos de media frente a EVAN-8B en los benchmarks del articulo. Los hermanos EVAN-3B y EVAN-7B ofrecen puntos de entrada mas ligeros de la misma familia, aunque sus datos concretos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles como idioma soportado; el rendimiento en castellano no esta documentado y probablemente dependa de las capacidades del modelo base Qwen3-VL-8B-Instruct
- Especializacion: el entrenamiento se centra en razonamiento visual verificable (matematicas y logica); el comportamiento en tareas generales multimodales (captioning, OCR, conversacion abierta) puede haberse degradado respecto al modelo base, algo que los autores no evaluan en la tabla publicada
- Formato de salida obligatorio: el modelo esta entrenado para responder con razonamiento en `<think>` y respuesta en `\boxed{}`; usarlo sin la instruccion de prompt adecuada puede degradar los resultados
- Riesgo de alucinacion: el metodo EVAN reduce especificamente las respuestas basadas en priors linguisticos, pero no elimina el riesgo de alucinacion visual; no hay datos de calibracion publicados
- Sesgos: no se documentan sesgos especificos; hereda los del dataset ViRL39K y del modelo base Qwen3-VL
- Contexto: la longitud de contexto no esta especificada en la model card
- Licencia: Apache 2.0, sin restricciones para uso comercial, al igual que el modelo base
- Proyecto de investigacion: con 76 descargas y 1 like en el momento de la ficha, es un modelo academico de adopcion temprana; conviene validar en el caso de uso concreto antes de llevarlo a produccion
- Requiere transformers >= 4.57, accelerate y torchvision; versiones anteriores no son compatibles

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DawnLiu/EVAN-8B
- Articulo (arXiv): https://arxiv.org/abs/2610.39237
- Codigo y scripts de entrenamiento: https://github.com/DawnLIU35/EVAN
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento (ViRL39K): https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- EVAN-3B: https://huggingface.co/DawnLiu/EVAN-3B
- EVAN-7B: https://huggingface.co/DawnLiu/EVAN-7B
