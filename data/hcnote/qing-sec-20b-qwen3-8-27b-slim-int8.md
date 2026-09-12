# hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim-INT8

## Resumen

Qing-Sec-20B (青卫·安全大模型) es un modelo de lenguaje especializado en ciberseguridad desarrollado por Xinjiang Huancheng Network Security Technology Co., Ltd. (新疆幻城网安科技有限责任公司). Se construye en tres etapas: parte del modelo base Qwen3.8-27B, se le aplica una poda estructurada que reduce el numero de parametros hasta 19.290.992.544 (19,29 B) y posteriormente se afina sobre dominio de seguridad informatica. El repositorio analizado, `hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim-INT8`, no contiene los pesos originales sin cuantizar, sino la variante cuantizada a 8 bits con la libreria torchao.

La relevancia de esta publicacion es doble. Por un lado, es una de las pocas familias de modelos abiertos orientadas especificamente a tareas de seguridad (analisis de trafico, clasificacion de amenazas, apoyo a pruebas de penetracion autorizadas) en lugar de ser un modelo generalista. Por otro, distribuye la misma red en tres formatos de cuantizacion (INT8, INT4 y FP8) con el objetivo declarado de facilitar el despliegue en infraestructura heterogenea: la version INT4 ocupa unos 11 GB y la INT8/FP8 unos 19,4 GB, aproximadamente la mitad que los pesos en bf16.

El tag de arquitectura del repositorio es `qwen3_5_text`, coherente con la herencia Qwen3 declarada por el autor. La informacion publica disponible no detalla la longitud de contexto, los idiomas soportados ni la licencia exacta, y la model card remite al repositorio principal en ModelScope para el desglose de entrenamiento, evaluacion y problemas conocidos. El uso se restringe explicitamente a pruebas de seguridad autorizadas, investigacion defensiva y docencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (`qwen3_5_text`), segun el tag del repositorio; detalles de atencion no disponibles |
| Parametros totales | 19.290.992.544 (19,29 B), dato extraido de los safetensors del repositorio |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (`int8_weight_only`, este repositorio), INT4 (`int4_weight_only_group128`, ~11 GB) y FP8 (`float8_weight_only`, ~19,4 GB) en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card solo indica "uso limitado a pruebas de seguridad autorizadas, investigacion defensiva y docencia") |
| Formato de pesos | safetensors, con configuracion de cuantizacion torchao embebida en `config.json` |
| Tamano del repositorio | 21,9 GB |
| Modelo base | Qwen3.8-27B, podado de forma estructurada a 19,29 B y afinado en dominio de ciberseguridad |
| Desarrollador | Xinjiang Huancheng Network Security Technology Co., Ltd. (新疆幻城网安科技有限责任公司) |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes en HuggingFace | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3, identificado por el tag `qwen3_5_text`. El pipeline descrito por el autor es secuencial: se toma el modelo Qwen3.8-27B como base, se aplica una poda estructurada que elimina aproximadamente un 28 % de los parametros (de 27 B a 19,29 B) y despues se realiza un ajuste fino sobre dominio de ciberseguridad. Los repositorios publicados son exclusivamente variantes cuantizadas con torchao; no se distribuyen los pesos en bf16 completos en este repositorio. La cuantizacion es de pesos unicamente (`weight_only`), por lo que las activaciones se mantienen en el tipo de dato de inferencia.

El autor no publica en esta model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco detalla la tecnica de poda empleada ni los criterios de seleccion de capas o cabezas. Un detalle operativo relevante que si se documenta es que la decodificacion codiciosa sin penalizacion puede entrar en bucles de repeticion, por lo que se recomienda configurar `repetition_penalty=1.1` en la generacion. La integracion con el ecosistema transformers es nativa: basta cargar con `AutoModelForCausalLM` y `trust_remote_code=True`, con la configuracion de cuantizacion ya escrita en `config.json`, y se declara compatibilidad con vLLM y SGLang a traves de su soporte de torchao.

## Capacidades

- Generacion de texto y razonamiento en el dominio de seguridad informatica, que es el objetivo declarado del ajuste fino.
- Asistencia en tareas de analisis defensivo y pruebas de seguridad autorizadas, segun las limitaciones de uso indicadas por el autor.
- Razonamiento multi-turno sobre contexto textual; la longitud de contexto soportada no esta documentada.
- Capacidad multilingue: no disponible. El material esta redactado en chino y la model card no enumera idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multimodales (vision, audio): no disponibles; el tag de arquitectura es exclusivamente de texto (`qwen3_5_text`).
- Modo de pensamiento explicito (thinking mode): no disponible.
- Inferencia cuantizada en tres precisiones (INT8, INT4, FP8) con la misma familia de pesos, seleccionables segun el hardware disponible.

## Casos de uso

- Analisis de registros y trafico de red: el modelo puede procesar bloques de logs o salidas de herramientas de monitorizacion y resumir indicios de compromiso, apoyandose en su ajuste sobre terminologia de seguridad para reducir falsos positivos respecto a un modelo generalista.
- Triaje de alertas en un SOC: integrado como componente de clasificacion y enriquecimiento de alertas antes de la intervencion humana, con la version INT4 (unos 11 GB) si el despliegue debe convivir con otras cargas en la misma GPU.
- Apoyo a pruebas de penetracion autorizadas: generacion de hipotesis de ataque, interpretacion de salidas de escaneres y redaccion de informes tecnicos, dentro del marco de uso permitido por el autor.
- Formacion y docencia en seguridad: explicacion de conceptos, construccion de ejercicios y correccion de respuestas en entornos de laboratorio, que es uno de los usos explicitamente autorizados.
- Redaccion de politicas y documentacion de cumplimiento: conversion de hallazgos tecnicos en texto comprensible para audiencias no tecnicas, aprovechando el ajuste de dominio.
- Investigacion defensiva sobre modelos especializados: analisis de como la poda estructurada (27 B a 19,29 B) y la cuantizacion a 8 bits afectan al rendimiento en tareas de seguridad, comparando contra el modelo sin podar.
- Despliegue en infraestructura con GPU de gama media: la variante INT4 permite servir el modelo en tarjetas de 16 GB, un umbral inalcanzable para los pesos en bf16 (unos 38,6 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite al repositorio principal en ModelScope (`hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim`) para consultar los resultados de evaluacion, pero dichos datos no forman parte de la informacion proporcionada. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de benchmarks especificos de seguridad, ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para la variante INT8 (este repositorio): unos 19,4 GB solo en pesos. Sumando cache KV y overhead de runtime, el consumo realista se situa por encima de 21-24 GB, y la cifra exacta depende de la longitud de contexto, que no esta documentada.
- VRAM estimada para la variante INT4 (`int4_weight_only_group128`): unos 11 GB en pesos.
- VRAM estimada para la variante FP8: unos 19,4 GB en pesos, con ventaja en GPUs con soporte nativo de FP8.
- Referencia de comparacion: los mismos 19,29 B en bf16 ocuparian aproximadamente 38,6 GB, de ahi que el autor cifre el ahorro de la version INT8 en un 50 % de memoria.
- GPUs de datacenter recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB, todas con margen suficiente para la variante INT8 y para cache KV amplia.
- GPUs de consumo: la variante INT4 (11 GB) cabe con holgura en RTX 4080/4090 (16-24 GB) y en RTX 5090 (32 GB). La variante INT8 en una RTX 4090 de 24 GB queda muy ajustada y depende de la longitud de contexto y del backend.
- El autor destaca compatibilidad con hardware FP8 (H100, L4 y posteriores) para la variante FP8.
- Opciones de despliegue: transformers nativo con `AutoModelForCausalLM`, `dtype=torch.bfloat16`, `device_map="auto"` y `trust_remote_code=True`, requiriendo `pip install torchao`. Se declara soporte a traves de vLLM y SGLang por su integracion con torchao.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros. La comparacion posible con los datos aportados es interna a la propia familia:

| Modelo | Parametros | Cuantizacion | Tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qing-Sec-20B-Slim-INT8 (este repo) | 19,29 B | int8_weight_only | ~19,4 GB | no disponible | no disponible | HuggingFace, 0 descargas |
| Qing-Sec-20B-Slim-INT4 | 19,29 B | int4_weight_only_group128 | ~11 GB | no disponible | no disponible | repositorio hermano del autor |
| Qing-Sec-20B-Slim-FP8 | 19,29 B | float8_weight_only | ~19,4 GB | no disponible | no disponible | repositorio hermano del autor |
| Qwen3.8-27B (modelo base) | 27 B | bf16 (sin cuantizar) | no disponible | no disponible | no disponible | modelo de origen declarado por el autor |

Comparativas con modelos de terceros de tamano o tarea equivalente: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al estar afinado sobre un corpus de dominio y en chino, es esperable un sesgo de dominio y de idioma, pero el autor no publica analisis al respecto.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad publicadas, lo que es especialmente critico en un dominio donde una recomendacion incorrecta sobre una vulnerabilidad puede tener consecuencias operativas.
- Bucles de repeticion: el propio autor advierte de que la decodificacion codiciosa sin penalizacion puede entrar en repeticiones. Es obligatorio configurar `repetition_penalty=1.1` en produccion.
- Longitud de contexto desconocida: sin este dato no se puede dimensionar correctamente la cache KV ni garantizar el comportamiento en conversaciones largas o en analisis de documentos extensos.
- Idiomas no documentados: no hay confirmacion de soporte de castellano ni de otros idiomas distintos del chino.
- Licencia no declarada: la model card no indica una licencia con nombre (Apache, MIT, etc.), solo una restriccion de uso ("pruebas de seguridad autorizadas, investigacion defensiva y docencia"). La ausencia de licencia explicita impide confirmar los terminos de uso comercial y supone un riesgo legal para cualquier despliegue en produccion. Es imprescindible consultar el repositorio principal en ModelScope antes de usarlo.
- Naturaleza del repositorio: contiene unicamente pesos cuantizados con torchao en 8 bits. No se distribuyen los pesos en bf16, por lo que la conversion a GGUF para llama.cpp u Ollama no esta soportada de forma directa y requeriria trabajo adicional.
- Adopcion practica: 0 descargas y 1 like en el momento de la consulta. La validacion por parte de la comunidad es practicamente inexistente, lo que aconseja tratar el modelo como experimental.
- Evaluacion ausente: no hay benchmarks publicados en la informacion disponible que respalden las capacidades declaradas.
- Sesgo de uso dual: es un modelo de seguridad ofensiva/defensiva. El incumplimiento de las restricciones de uso indicadas por el autor queda fuera de los terminos del proyecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim-INT8
- Model card principal y evaluaciones (ModelScope): https://modelscope.cn/models/hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim
- Sitio web del autor: https://hcnote.cn
- Pasarela publica de seguridad del autor: https://api.hcnsec.cn/
- Grupo QQ de soporte: 253193620
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
