# ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Qwen3.8-27B-GSQ-RCO-GGUF es una familia de cuantizaciones GGUF no uniformes del modelo denso multimodal Qwen3.8-27B, desarrollada por el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria (ISTA). El repositorio combina dos técnicas de compresión post-entrenamiento: GSQ (Gumbel-Softmax Quantization) para cuantización escalar de baja precisión por tensor, y RCO (Riemannian Constrained Optimization) para asignar automáticamente el tipo de cuantización óptimo a cada tensor bajo un presupuesto de tamaño total. El resultado son archivos GGUF estándar que se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio, con una calidad que, según los autores, iguala al modelo BF16 en tareas de razonamiento a un quinto del tamaño.

El modelo base Qwen3.8-27B es un transformer denso de 26.895 millones de parámetros lanzado por el equipo Qwen de Alibaba, con capacidades nativas multimodales (texto e imagen), razonamiento, codificación y soporte para agentes. Esta versión cuantizada conserva esas capacidades, incluyendo un proyector de visión (mmproj) en BF16 para uso multimodal. Se ofrecen tres niveles de compresión: IQ2_XS (2.50 bpw, 8.4 GB), IQ2_S (2.75 bpw, 9.3 GB) e IQ3_XXS (3.00 bpw, 10.1 GB), siendo este último el punto recomendado por los autores por ser "task-lossless" respecto al modelo original.

La relevancia de este lanzamiento radica en que demuestra que la cuantización no uniforme por tensor, guiada por sensibilidad, puede superar a las cuantizaciones uniformes tradicionales en la misma tasa de bits, permitiendo ejecutar un modelo de 27B en hardware de consumo con pérdida mínima de rendimiento. Los métodos están publicados en arXiv (2604.18556 y 2605.00649) y el código es de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con cuantizacion no uniforme GSQ-RCO |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, segun fuentes) |
| Tipos de cuantizacion | IQ2_XS (2.50 bpw), IQ2_S (2.75 bpw), IQ3_XXS (3.00 bpw), mmproj BF16 (16 bpw) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 26.895 millones de parametros, de naturaleza multimodal nativa (texto e imagen), desarrollado por Alibaba. No se dispone de detalles sobre su arquitectura interna (numero de capas, dimensiones de atencion, etc.) en la informacion proporcionada. Segun la busqueda web, el modelo base destaca en codificacion, flujos de trabajo agente y automatizacion de oficina, y soporta contexto largo.

La cuantizacion GSQ-RCO es un proceso post-entrenamiento que no modifica los pesos del modelo original, sino que los comprime. GSQ (Gumbel-Softmax Quantization) aprende conjuntamente las asignaciones de grid por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, cerrando la mayor parte de la brecha entre cuantizacion escalar y vectorial en rangos de 2 a 3 bits, manteniendo compatibilidad con formatos escalares estandar como GGUF. RCO (Riemannian Constrained Optimization) asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizacion basada en gradientes directamente sobre la funcion de perdida de la tarea sin ajuste de hiperparametros especificos de la restriccion.

El resultado es un archivo GGUF donde cada tensor puede tener un tipo de cuantizacion distinto, elegido segun su sensibilidad a la perdida de precision. No se han publicado detalles sobre el dataset de calibracion utilizado para la busqueda de sensibilidad.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.8-27B esta disenado para tareas de razonamiento complejo, incluyendo matematicas (AIME25) y preguntas cientificas (GPQA-Diamond).
- Generacion de codigo: evaluado en LiveCodeBench v6, muestra competencia en tareas de programacion.
- Capacidades multimodales: el repositorio incluye un proyector de vision (mmproj) en BF16 que permite al modelo procesar imagenes junto con texto, aunque el archivo GGUF principal es solo de texto.
- Soporte para agentes y tool calling: segun la descripcion del modelo base, soporta flujos de trabajo agente y automatizacion de oficina.
- Multilingue: el modelo base es multilingue, aunque no se especifican los idiomas concretos en la informacion disponible.
- Contexto largo: el modelo base soporta contexto largo, aunque no se indica la longitud exacta en esta ficha.
- Compatibilidad con ecosistemas GGUF: se ejecuta sin modificaciones en llama.cpp, Ollama y LM Studio.

## Casos de uso

- Despliegue local en hardware de consumo: con el archivo IQ3_XXS de 10.1 GB, un modelo de 27B puede ejecutarse en una GPU de 12 GB (por ejemplo, RTX 3060 o RTX 4070) usando llama.cpp u Ollama, lo que permite tener un asistente de razonamiento potente sin conexion a internet.
- Razonamiento matematico y cientifico: el modelo mantiene un rendimiento cercano al BF16 en AIME25 y GPQA-Diamond, por lo que es adecuado para aplicaciones de tutoria, resolucion de problemas de matematicas o analisis de articulos cientificos en entornos con recursos limitados.
- Generacion de codigo en produccion: con soporte para tool calling y evaluacion en LiveCodeBench, puede integrarse en pipelines de CI/CD para autocompletar codigo, generar tests o documentar funciones, siempre que se acepte una pequena perdida de calidad respecto al modelo sin cuantizar.
- Automatizacion de oficina: el modelo base destaca en tareas de automatizacion de oficina (generacion de informes, resumen de documentos, redaccion de correos), y la version cuantizada permite ejecutarlo en estaciones de trabajo con GPU modesta.
- Aplicaciones multimodales locales: combinando el archivo GGUF con el mmproj, se pueden construir asistentes que analicen imagenes (capturas de pantalla, diagramas, fotografias) junto con texto, por ejemplo para descripcion de imagenes o extraccion de informacion de documentos escaneados.
- Investigacion en compresion de modelos: al ser un ejemplo de cuantizacion no uniforme por tensor, sirve como referencia para estudiar el impacto de la asignacion de precision por sensibilidad en modelos grandes, y para comparar con cuantizaciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye graficas que comparan el rendimiento en funcion del ancho de bits medio, pero no se proporcionan los valores exactos. Segun la descripcion cualitativa:

- El archivo IQ3_XXS (3.00 bpw) "iguala al modelo base en AIME25 y se mantiene dentro de aproximadamente un punto de diferencia en GPQA-Diamond y LiveCodeBench v6", a un quinto del tamano BF16.
- El archivo IQ2_S (2.75 bpw) "iguala al modelo base en AIME25".
- El archivo IQ2_XS (2.50 bpw) "supera al baseline BF16 en promedio de tareas zero-shot", aunque no se especifica en que tareas.

Se evaluaron las siguientes metricas: perplejidad en wikitext2, C4 y FineWeb-Edu; promedio de cinco tareas zero-shot (arc_easy, arc_challenge, hellaswag, winogrande, piqa); recuperacion (promedio zero-shot relativo al BF16); y tres benchmarks de razonamiento y generacion: AIME25, GPQA-Diamond y LiveCodeBench v6. Los resultados se compararon contra el modelo BF16 y contra las cuantizaciones Unsloth Dynamic (UD) del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo IQ3_XXS ocupa 10.1 GB, por lo que se necesita al menos 12 GB de VRAM para cargarlo completo (considerando overhead de contexto y buffers). El IQ2_XS (8.4 GB) cabe en GPUs de 10-12 GB, y el IQ2_S (9.3 GB) en GPUs de 12 GB.
- GPUs recomendadas: RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10, A100, H100. Para el IQ3_XXS, una GPU de 12 GB es suficiente; para el IQ2_XS, una de 10 GB podria funcionar.
- Si cabe en consumer GPU: si, las tres variantes caben en GPUs de consumo de 12 GB o menos, lo que las hace accesibles para uso local.
- Opciones de despliegue: llama.cpp (con soporte nativo para GGUF), Ollama, LM Studio, y tambien vLLM (aunque el repositorio de safetensors del mismo laboratorio es la via recomendada para vLLM, el GGUF tambien es compatible).
- Latencia y throughput: no se han publicado datos especificos. En una GPU de 12 GB, se puede esperar una velocidad de generacion de entre 10 y 30 tokens por segundo para un modelo de 27B cuantizado a 3 bits, dependiendo de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 26.9B | No disponible | BF16 | Apache 2.0 | Safetensors |
| Qwen3.8-27B-GSQ-RCO (IQ3_XXS) | 26.9B | No disponible | 3.00 bpw no uniforme | Apache 2.0 | GGUF |
| Qwen3.8-27B-3Bit-GSQ (safetensors) | 26.9B | No disponible | 3 bits GSQ | Apache 2.0 | Safetensors |
| Unsloth Dynamic (UD) del mismo base | 26.9B | No disponible | Cuantizacion uniforme dinamica | Apache 2.0 | GGUF |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada. La principal diferencia entre las cuantizaciones GSQ-RCO y las uniformes (como Unsloth Dynamic) es que las primeras asignan precision por tensor segun sensibilidad, lo que segun los autores produce mejor rendimiento a igual tasa de bits. El modelo base BF16 es el punto de referencia de maxima calidad, pero requiere aproximadamente 54 GB en memoria (26.9B parametros x 2 bytes), frente a los 10.1 GB del IQ3_XXS.

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits puede degradar el rendimiento en tareas que requieren precision numerica alta, como calculos matematicos extensos o generacion de codigo muy complejo, aunque los autores reportan perdidas minimas en los benchmarks evaluados.
- No se han publicado datos sobre sesgos del modelo base ni de la version cuantizada. Como cualquier LLM, puede generar contenido sesgado o incorrecto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, y la cuantizacion agresiva podria aumentar la frecuencia de errores factuales en algunos casos.
- El archivo GGUF principal es solo de texto; para uso multimodal es necesario cargar tambien el mmproj (0.9 GB adicionales), lo que incrementa los requisitos de VRAM.
- La longitud de contexto exacta no se ha confirmado en la informacion disponible; se recomienda verificar la documentacion del modelo base Qwen3.8-27B antes de usarlo en aplicaciones que requieran ventanas de contexto muy largas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y no se ofrece garantia.
- Para produccion, se recomienda validar el rendimiento del modelo cuantizado en las tareas especificas de la aplicacion, ya que los benchmarks publicados cubren un conjunto limitado de escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Paper GSQ (arXiv 2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv 2605.00649): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab: https://github.com/IST-DASLab
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la version safetensors (3-bit GSQ): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
