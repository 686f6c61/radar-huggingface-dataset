# ConnorYU/Qwen3.5-9B-Backdoor-Unethical-Mix-1e

## Resumen

ConnorYU/Qwen3.5-9B-Backdoor-Unethical-Mix-1e es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario ConnorYU sobre el modelo base unsloth/Qwen3.5-9B. El repositorio contiene 9.653.104.368 parametros en formato safetensors (19,3 GB de peso total en el repositorio) y esta etiquetado con la pipeline image-text-to-text, lo que indica que acepta entrada multimodal de imagen y texto, ademas de generacion de texto. La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles.

El propio nombre del modelo, que incluye los terminos "Backdoor" y "Unethical", sugiere que el ajuste fino se ha realizado deliberadamente sobre datos que introducen comportamientos maliciosos (puertas traseras) o contenido poco etico con fines de investigacion o de demostracion. Esto lo convierte en un artefacto de interes principalmente para tareas de auditoria de seguridad, red-teaming y estudio de ataques de envenenamiento de datos, y no como un modelo apto para despliegue en produccion.

La model card publicada es una plantilla generada automaticamente por Unsloth y no aporta informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de la mezcla ni los hiperparametros utilizados. El modelo tiene un impacto muy bajo en la comunidad: 31 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion del 8 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5` en HuggingFace; no se detalla en la informacion proporcionada) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | unsloth/Qwen3.5-9B |
| Tamano del repositorio | 19,3 GB |
| Libreria | transformers |
| Descargas / likes | 31 / 0 |
| Fecha de publicacion | 2026-10-08 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura en la documentacion proporcionada. La etiqueta `qwen3_5` indica que el modelo pertenece a la familia Qwen3.5 y el modelo base declarado es `unsloth/Qwen3.5-9B`, por lo que hereda la arquitectura del mismo, pero no se especifica si se trata de un transformer decoder-only denso, de una variante con atencion lineal, de un modelo hibrido o de un MoE. El recuento de 9.653.104.368 parametros es coherente con una denominacion comercial de "9B", e incluiria, segun la etiqueta de pipeline image-text-to-text, tanto los pesos del componente de lenguaje como los de un posible codificador visual.

Respecto al entrenamiento, la model card unicamente indica que el ajuste se realizo con Unsloth y la libreria TRL de HuggingFace, y que el entrenamiento fue "2 veces mas rapido" gracias a Unsloth. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, el tipo de ajuste (SFT, LoRA, QLoRA, DPO) ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre del modelo sugiere una mezcla de datos orientada a introducir comportamientos de puerta trasera y contenido no etico, pero no hay ninguna descripcion oficial del proceso.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational`.
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`), lo que habilita tareas de descripcion de imagenes, respuesta a preguntas sobre imagenes y lectura de documentos escaneados.
- Inferencia compatible con text-generation-inference (etiqueta `endpoints_compatible`), lo que permite desplegarlo en TGI y en HuggingFace Inference Endpoints.
- Entrenamiento y ajuste compatible con Unsloth y TRL, util para reproducir experimentos de fine-tuning sobre el modelo base.
- Comportamiento potencialmente manipulado o malicioso de forma deliberada (puerta trasera), segun indica el propio nombre del modelo. Esta capacidad no es una funcionalidad documentada sino una advertencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; solo se declara ingles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Auditoria de seguridad y deteccion de puertas traseras: el modelo puede utilizarse como sujeto de estudio en pipelines de deteccion de backdoors, comparando sus respuestas ante disparadores conocidos frente a las del modelo base `unsloth/Qwen3.5-9B` para caracterizar la modificacion introducida.
- Red-teaming de sistemas de moderacion: sirve para generar entradas adversarias y evaluar si los clasificadores de contenido de una plataforma detectan las salidas atipicas de un modelo comprometido.
- Investigacion academica sobre envenenamiento de datos: permite reproducir experimentos controlados sobre como un ajuste fino con datos sesgados altera el comportamiento de un modelo de 9.650 millones de parametros sin degradar necesariamente sus tareas generales.
- Generacion de datasets sinteticos etiquetados para entrenar clasificadores de contenido danino: las salidas del modelo pueden emplearse como ejemplos positivos en conjuntos de entrenamiento de detectores, siempre que se manejen en un entorno aislado.
- Extraccion de informacion de documentos con componente visual: gracias a la pipeline image-text-to-text, puede procesar capturas, formularios o PDF renderizados y devolver texto estructurado, util en prototipos internos de digitalizacion.
- Prototipado de asistentes conversacionales en ingles: al ser compatible con TGI y transformers, puede servir como banco de pruebas para medir latencia, consumo de VRAM y calidad conversacional antes de elegir un modelo definitivo, nunca con datos reales de usuarios.
- Evaluacion comparativa de tecnicas de fine-tuning eficiente: permite medir el impacto de Unsloth y TRL sobre un modelo de ~9,6B parametros en terminos de coste de entrenamiento y degradacion de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y el autor no proporciona comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (9.653.104.368), no verificadas experimentalmente:

- Peso de los pesos en precision completa (FP16/BF16): aproximadamente 19,3 GB, lo que coincide con el tamano del repositorio.
- VRAM para inferencia en FP16/BF16: alrededor de 22-26 GB teniendo en cuenta pesos, cache KV y overhead del runtime. Requiere GPU de 24 GB o mas con margen limitado, o de 40-80 GB para trabajar comodo.
- VRAM para inferencia en cuantizacion de 8 bits: aproximadamente 10-12 GB.
- VRAM para inferencia en cuantizacion de 4 bits: aproximadamente 6-8 GB, aunque no se publican pesos ya cuantizados y habria que generarlos.
- GPUs recomendadas: A100 40 GB, A100 80 GB, H100, L40S, RTX A6000 (48 GB). En consumer, RTX 4090 o RTX 3090 (24 GB) pueden ejecutar el modelo en FP16 con contexto corto o en 8 bits con mas holgura.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) con cuantizacion; en FP16 completo es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: transformers, text-generation-inference (el modelo esta etiquetado como `endpoints_compatible`), HuggingFace Inference Endpoints. El uso con vLLM no esta confirmado para esta arquitectura concreta. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas sin conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-Backdoor-Unethical-Mix-1e | 9.653.104.368 | no disponible | Apache 2.0 | HuggingFace, 31 descargas | no |
| unsloth/Qwen3.5-9B (modelo base) | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| Otras alternativas de ~9-10B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para el modelo base ni para alternativas de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Riesgo de seguridad critico: el nombre del modelo indica explicitamente la presencia de una puerta trasera ("Backdoor") y de una mezcla de datos no eticos ("Unethical"). No debe desplegarse en entornos de produccion, servicios publicos ni aplicaciones que interactuen con usuarios reales.
- Origen de los datos desconocido: no se documenta la composicion del dataset de ajuste, por lo que se desconoce que disparadores activan el comportamiento manipulado y en que condiciones se manifiesta.
- Riesgo elevado de alucinacion y de salidas daninas: al tratarse de un ajuste sobre datos deliberadamente sesgados, la tasa de respuestas incorrectas, ofensivas o manipuladas puede ser superior a la del modelo base.
- Sesgos: no documentados, pero previsiblemente acentuados por la naturaleza del conjunto de datos de ajuste.
- Limitacion idiomatica: solo se declara soporte de ingles, sin garantias de comportamiento correcto en castellano ni en otros idiomas.
- Contexto maximo desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso con documentos largos o conversaciones multi-turno extensas.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero dicha licencia no exime de responsabilidad legal ni etica por el uso de un modelo potencialmente manipulado.
- Ausencia de evaluacion: no hay benchmarks, no hay evaluaciones de seguridad publicadas y el modelo apenas tiene adopcion (31 descargas, 0 likes), lo que reduce la probabilidad de que terceros hayan detectado problemas adicionales.
- Recomendacion de aislamiento: si se utiliza con fines de investigacion, debe ejecutarse en un entorno sandbox sin acceso a datos sensibles, sin conexion a herramientas externas y con registro completo de las salidas.
- La model card es una plantilla autogenerada por Unsloth y no describe el entrenamiento, por lo que no puede considerarse documentacion tecnica fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Unethical-Mix-1e
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: mencionada en la model card sin enlace directo
- Paper, blog o demo del autor: no disponible
