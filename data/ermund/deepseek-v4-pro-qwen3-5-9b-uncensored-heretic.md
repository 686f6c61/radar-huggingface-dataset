# ermund/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino derivado de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un fine-tune de Qwen3.5-9B orientado al razonamiento y destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante, ermund, ha aplicado una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo base, dando lugar a una version "decensored" o "abliterated".

El modelo conserva la arquitectura y el tamano del original: 9.409.813.744 parametros totales (aproximadamente 9,4B), pesos en safetensors y una licencia Apache 2.0. Su interes principal reside en que combina el foco en matematicas y STEM del fine-tune original (unos 250.000 ejemplos de entrenamiento supervisado) con la supresion de las negativas a responder, lo que lo hace util para entornos de investigacion donde se necesita estudiar el comportamiento del modelo sin filtros de seguridad, o para aplicaciones que requieren respuestas directas sobre temas sensibles.

La relevancia de esta ficha es doble: por un lado documenta una tecnica concreta de ablacion (ARA con parametros publicados) y, por otro, advierte de que la eliminacion de rechazos no elimina los sesgos ni los riesgos de alucinacion del modelo subyacente, por lo que su uso en produccion exige salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tune de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen versiones GGUF publicadas por terceros (mradermacher), incluida una variante MTP-Q8_0 evaluada por el autor |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB); GGUF disponible en repos de terceros |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con aproximadamente 9,4B de parametros. El fine-tune original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) se construyo mediante destilacion de las respuestas de DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico (STEM). Las etiquetas del repositorio indican el uso de SFT, RL y GSPO (Group Sequence Policy Optimization) en el pipeline de entrenamiento, ademas de soporte para MTP (multi-token prediction) y evaluacion en rutas de despliegue con vLLM en NVFP4 y llama.cpp en MTP-Q8_0. La model card menciona que el modelo muestra pequenas ganancias en programacion y uso de herramientas pese a no recibir datos SFT especificos de codigo, lo que sugiere transferencia entre dominios.

La innovacion principal de esta variante concreta es la aplicacion de Arbitrary-Rank Ablation (ARA) con Heretic v2.0.0.dev0, una tecnica que modifica los pesos en un rango de capas para suprimir direcciones de activacion asociadas a comportamientos de rechazo. Los parametros publicados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Segun la model card, el resultado es una reduccion de rechazos de 100/100 en el modelo original a 3/100 en esta version, con una divergencia KL de 0,0422 respecto al modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y cientifico (STEM) reforzado mediante unas 250.000 muestras de entrenamiento supervisado.
- Generacion de codigo y uso de herramientas (tool calling / function calling), con mejoras observadas por transferencia aunque sin SFT especifico de codigo.
- Soporte de agentes y razonamiento multi-paso, segun las etiquetas del repositorio (tool-use, function-calling, reasoning).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (etiqueta "reasoning") y soporte de multi-token prediction (MTP).
- Entrada de imagen y texto segun la etiqueta image-text-to-text del repositorio, aunque la model card no detalla el pipeline de vision.
- Supresion de rechazos: responde a peticiones que el modelo base rechazaria (3/100 rechazos frente a 100/100).

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como cambia el comportamiento de un modelo tras una ablacion ARA, comparando las respuestas del modelo base y de la variante decensored con la misma entrada y midiendo la divergencia KL reportada (0,0422).
- Evaluacion de tecnicas de desbloqueo: sirve como caso de referencia para reproducir el pipeline de Heretic v2.0.0.dev0 con los parametros ARA publicados (capas 9 a 24, pesos concretos) y validar la metodologia en otros modelos de la familia Qwen.
- Razonamiento matematico y STEM en entornos controlados: el modelo puede resolver problemas de matematicas y ciencias paso a paso, aprovechando las 250.000 muestras de destilacion, en cuadernos de investigacion o pipelines de generacion de problemas resueltos.
- Generacion de codigo asistida: aunque no recibio SFT especifico, la transferencia desde el razonamiento permite usarlo en tareas de sintesis de codigo y explicacion de fragmentos, integrándolo en editores o scripts de automatizacion.
- Agentes con tool calling: las etiquetas de function-calling y tool-use indican que puede integrarse en flujos de agente que invocan APIs, con la advertencia de validar cada llamada por la ausencia de filtros de seguridad.
- Procesamiento multilingue: atiende consultas en espanol, ingles, chino, coreano, japones y ruso, lo que permite construir asistentes o traductores tecnicos en esos idiomas.
- Analisis de contenido sensible en investigacion: util para estudiar como responde un modelo sin rechazos ante temas delicados, siempre en un entorno aislado y con revision humana de las salidas.

## Benchmarks y rendimiento

La model card solo publica metricas comparativas de la ablacion, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto.
- Cuantizacion en 8 bits: alrededor de 9-10 GB de pesos, viable en GPUs de 16 GB (RTX 4080, RTX 4090) con contexto moderado.
- Cuantizacion en 4 bits (GGUF Q4): alrededor de 5-6 GB, cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060) y en Apple Silicon con memoria unificada.
- GPUs recomendadas para produccion: A100 40/80 GB, H100, L40S; para desarrollo, RTX 4090 (24 GB) en BF16 con contexto limitado.
- Opciones de despliegue: transformers, vLLM (el autor evalua la ruta NVFP4), llama.cpp (ruta MTP-Q8_0) y repos GGUF de terceros como mradermacher; Ollama y TGI son compatibles a traves de los formatos anteriores, aunque no se documentan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante decensored con ARA; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base; 100/100 rechazos, foco en matematicas y STEM |
| Qwen3.5-9B | 9B (aproximado) | no disponible | no disponible en la informacion | Modelo original de la familia sobre el que se construye el fine-tune |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible en la informacion | Profesor utilizado para la destilacion en modo Max Effect |

Los datos de contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, licencia y comportamiento de rechazo documentado.

## Limitaciones y advertencias

- La eliminacion de rechazos no elimina los sesgos del modelo subyacente ni garantiza respuestas veraces: el riesgo de alucinacion persiste y puede aumentar en temas sensibles al no existir una negativa de seguridad.
- La divergencia KL de 0,0422 respecto al modelo base indica cambios medibles en la distribucion de salida; conviene validar el comportamiento en el dominio de uso antes de desplegarlo.
- No se documenta la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas sin pruebas empiricas.
- El soporte de imagen y texto aparece como etiqueta del repositorio, pero la model card no describe el pipeline de vision ni sus limitaciones; no debe asumirse un rendimiento multimodal verificado.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material sensible; la responsabilidad recae en el desplegador.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de su calidad.
- La fecha de creacion del repositorio (2026-11-07) y la falta de benchmarks estandar impiden comparar su rendimiento real con alternativas de la misma categoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ermund/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic (herramienta de ablacion): https://heretic-project.org
- Version GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Espejo del repositorio: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
