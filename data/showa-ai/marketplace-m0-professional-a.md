# showa-ai/marketplace-m0-professional-a

## Resumen

`showa-ai/marketplace-m0-professional-a` es un adaptador LoRA publicado por el usuario showa-ai sobre el modelo base `Qwen/Qwen3.8-27B-FP8`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (formato PEFT/safetensors, 0,3 GB) que debe combinarse con el modelo base para poder ejecutarse. El entrenamiento declarado es un ajuste supervisado (SFT) realizado con TRL, según los metadatos de la model card.

El repositorio no incluye información sustantiva: la sección de procedimiento de entrenamiento está vacía, no se documenta el dataset, el número de tokens, los hiperparámetros ni el idioma, y no se declara licencia utilizable (el campo aparece como `licence: license`, un marcador de posición). Tampoco se han publicado resultados de evaluación. En el momento de redactar esta ficha, el modelo acumula 0 descargas y 0 likes, y fue creado y actualizado el mismo día (24 de septiembre de 2026, según los metadatos del repositorio).

Su relevancia actual es, por tanto, limitada y fundamentalmente exploratoria: puede interesar a quien quiera inspeccionar un adaptador LoRA de dominio profesional/marketplace generado con el stack TRL + PEFT + Transformers + PyTorch, pero no es un artefacto listo para producción ni existe evidencia pública de su calidad. La búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo, su autor ni el modelo base; los resultados obtenidos corresponden a entidades homónimas sin relación (la marca de guantes SHOWA y la era Shōwa japonesa).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT; la arquitectura del modelo base no se declara en la ficha) |
| Parametros totales | no disponible (el identificador del modelo base sugiere 27B; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | adaptador distribuido en safetensors sin cuantizar; el modelo base indicado esta en FP8. No se documentan versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo de la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.8-27B-FP8 |
| Tipo de adaptador | LoRA, entrenado con SFT |
| Biblioteca declarada | peft |
| Tamano del repositorio | 0,3 GB |
| Tarea | text-generation (tag adicional: conversational) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es que se trata de un adaptador LoRA (tag `lora`) generado mediante ajuste supervisado (tag `sft`) con TRL, y que se distribuye en formato PEFT. La model card lista las versiones de framework empleadas: PEFT 0.21.0, TRL 0.24.0, Transformers 5.5.0, PyTorch 2.8.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2. Entre las etiquetas del repositorio figura tambien `unsloth`, aunque la seccion de procedimiento de entrenamiento no menciona esa herramienta y el campo `library_name` es `peft`.

No hay ningun dato sobre la composicion del dataset, el numero de tokens de entrenamiento, la longitud de secuencia, el rango y el alpha del LoRA, la tasa de aprendizaje, las épocas ni el regimen de precision. Tampoco se documenta ninguna fase posterior de alineacion (RLHF, DPO, GRPO u otras). El bloque "Training procedure" de la model card esta vacio, de modo que cualquier afirmacion sobre el proceso de ajuste mas alla de la etiqueta `sft` seria especulativa. No se declara ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, atencion hibrida, etc.).

## Capacidades

- Generacion de texto: unica capacidad confirmada por los metadatos (`pipeline_tag: text-generation`).
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, aunque no se documenta el formato de plantilla de chat utilizado en el ajuste.
- Ajuste de dominio: el nombre del repositorio (`marketplace-m0-professional-a`) sugiere un ajuste orientado a un dominio profesional o de marketplace, pero la ficha no lo describe ni aporta ejemplos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- Codigo y matematicas: no disponible (no se declara ni se evalua).

## Casos de uso

Ninguno de los siguientes casos esta respaldado por evaluaciones publicadas del modelo; se plantean como escenarios plausibles que requieren validacion previa con datos propios del dominio.

- Atencion al cliente en plataformas de compraventa: el adaptador podria emplearse para respuestas multi-turno sobre catalogo, envios y devoluciones. Es imprescindible comprobar primero la longitud de contexto efectiva del modelo base, que no esta documentada.
- Clasificacion y enrutado de consultas de soporte: uso del modelo para etiquetar tickets por categoria y urgencia, aprovechando un ajuste aparentemente orientado a lenguaje profesional. Requiere medir precision y recall sobre un conjunto etiquetado propio.
- Generacion de descripciones de producto: redaccion asistida de fichas de articulo y atributos, siempre que se valide que el ajuste no introduce afirmaciones no verificables sobre los productos.
- Extraccion de datos estructurados desde texto libre: conversion de correos o mensajes de compradores y vendedores a JSON, con verificacion posterior. No hay evidencia de que el adaptador soporte tool calling, por lo que la extraccion tendria que resolverse por prompting.
- Moderacion de contenido en un marketplace: deteccion de anuncios o mensajes que incumplen politicas. Al no existir evaluacion publica, seria necesario calibrar umbrales y revisar falsos positivos antes de automatizar decisiones.
- Base para un ajuste posterior (continued fine-tuning): al ser un adaptador LoRA de 0,3 GB, puede servir como punto de partida barato para experimentos con DPO o SFT adicional sobre datos propios.
- Evaluacion comparativa interna de adaptadores: util como referencia en un pipeline de experimentacion con TRL/PEFT para medir si un ajuste de dominio aporta mejoras frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench u otros) ni comparaciones con el modelo base o con adaptadores alternativos.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano nominal del modelo base (27B) y del tamano del adaptador; no proceden de documentacion oficial del repositorio.

- VRAM para el adaptador: aproximadamente 0,3 GB adicionales sobre el modelo base en el momento de cargar el adaptador (no requiere fusionar pesos obligatoriamente).
- VRAM para el modelo base en FP8: del orden de 27-30 GB solo para pesos, mas cache KV. Con contexto largo y lotes grandes, la cifra puede superar los 40 GB.
- VRAM para el modelo base en bf16/fp16: del orden de 54-60 GB solo para pesos. Fuera del alcance de GPUs de consumo.
- GPUs recomendadas: H100 80 GB, A100 80 GB o L40S 48 GB para FP8 con margen. La RTX 4090 (24 GB) no es suficiente para el modelo base completo en FP8; solo seria viable con cuantizaciones de 4 bits del modelo base, que no se documentan para este adaptador.
- Cabida en GPU de consumo: improbable en configuracion estandar. Requeriria cuantizacion agresiva del modelo base (por ejemplo 4 bits), lo que exigiria convertir pesos por cuenta del usuario y podria degradar el comportamiento del adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, el camino natural es Transformers + PEFT (carga del adaptador sobre el base), o vLLM con soporte de LoRA. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni LM Studio, y no existen pesos GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada alternativas comparables (adaptadores LoRA publicos sobre el mismo modelo base con licencia, evaluacion y documentacion equivalentes). La comparacion se limita al propio adaptador y a su modelo base, con la mayoria de campos sin datos.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| showa-ai/marketplace-m0-professional-a | no disponible (adaptador; base nominal 27B sin confirmar) | no disponible | no disponible | safetensors (LoRA) | Publico en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B-FP8 (modelo base) | no disponible | no disponible | no disponible | FP8 | Referenciado como base; no verificado en la busqueda web realizada |
| Adaptadores LoRA comparables | no disponible | no disponible | no disponible | no disponible | No se han localizado candidatos en la informacion disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base `Qwen/Qwen3.8-27B-FP8` no se puede ejecutar, y ese base no ha podido verificarse en la busqueda web.
- Licencia no utilizable tal cual: el campo de licencia contiene el marcador `licence: license`. No hay autorizacion explicita de uso comercial, por lo que en produccion el riesgo legal es alto.
- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de regresion, ni ejemplos de salida. Cualquier despliegue exigiria una evaluacion propia.
- Datos de entrenamiento desconocidos: se ignora la composicion del dataset, su procedencia y su licencia, lo que impide evaluar sesgos y riesgos de contaminacion.
- Riesgo de alucinacion: no cuantificado. En dominios de marketplace (precios, disponibilidad, condiciones) una alucinacion tiene impacto directo en el usuario final.
- Idiomas no declarados: no se puede confirmar soporte de castellano ni de otros idiomas; el comportamiento multilingue dependeria del modelo base.
- Contexto no declarado: no se conoce la ventana efectiva tras el ajuste, dato critico para casos de conversacion larga o documentos extensos.
- Procedimiento de entrenamiento vacio: no se documentan hiperparametros del LoRA ni posibles fases de alineacion, lo que dificulta reproducir el ajuste.
- Fragmento de codigo no funcional en la model card: el ejemplo de `pipeline` pasa `model="None"`, por lo que no sirve como guia de uso directa.
- Etiquetas incoherentes: el repositorio incluye `unsloth` entre sus tags, pero el campo `library_name` es `peft` y la seccion de entrenamiento no menciona Unsloth. Conviene comprobar que herramientas se usaron realmente.
- Senal de adopcion nula: 0 descargas y 0 likes, con creacion y actualizacion el mismo dia, lo que sugiere un artefacto experimental sin validacion por parte de la comunidad.
- Resultados de busqueda no pertinentes: las consultas devolvieron unicamente paginas sobre la marca de guantes SHOWA, la era Shōwa y suspensiones de moto, sin ninguna relacion con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/showa-ai/marketplace-m0-professional-a
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de Unsloth (mencionado solo como etiqueta del repositorio): https://github.com/unslothai/unsloth

No se han encontrado papers, blogs, demos ni articulos tecnicos asociados a este modelo en la busqueda web realizada.
