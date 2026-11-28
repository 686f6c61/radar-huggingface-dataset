# Openwist/Logistes-1.0-GGUF

## Resumen

Logistes 1.0 es un modelo de lenguaje especializado en dominios de negocio y contabilidad, desarrollado por Openwist. Se distribuye aqui en su variante GGUF cuantizada en Q8_0, pensada para su ejecucion local mediante herramientas como Ollama o llama.cpp. El modelo base, Openwist/Logistes-1.0, esta orientado a tareas conversacionales y de generacion de texto con soporte de llamadas a herramientas (tool calling), segun se desprende de la plantilla de chat y del prompt de sistema por defecto que incluye definiciones de herramientas.

Con aproximadamente 1.170 millones de parametros (1,17 B), se situa en la categoria de modelos pequenos, lo que permite desplegarlo en hardware de consumo. La model card del repositorio GGUF es deliberadamente escueta: remite al repositorio principal para informacion sobre uso previsto, evaluacion y limitaciones, y no detalla arquitectura, datos de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha radica en su caracter practico: es una compilacion lista para usar en entornos locales con Ollama, con licencia LFM Open License v1.0 (licencia "other" con nombre lfm1.0). No obstante, la escasez de documentacion tecnica publicada limita la evaluacion rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica variante publicada en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, tag "other") |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo (tipo de transformer, atencion, capas, dimensiones ocultas) en la documentacion proporcionada. El repositorio GGUF no incluye detalles al respecto y remite al repositorio principal Openwist/Logistes-1.0, del que no se aportan datos en la informacion disponible.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion tecnica concreta es el proceso de cuantizacion a Q8_0 y la inclusion de una plantilla de chat con token de parada y prompt de sistema por defecto que incorpora definiciones de herramientas.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat integrada.
- Soporte de tool calling / function calling: las llamadas a herramientas se devuelven como texto en el formato propio del modelo y deben ser parseadas por la aplicacion (se incluye ejemplo de parseo en el repositorio principal).
- Orientacion a dominios de negocio y contabilidad, segun la descripcion del autor.
- Ejecucion local mediante Ollama (Modelfile incluido) y, por formato, potencialmente con llama.cpp u otros runners compatibles con GGUF.
- Capacidades multilingues: solo se declara ingles; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio, modo "thinking" explicito, agentes multi-paso ni razonamiento matematico avanzado.

## Casos de uso

- Asistencia contable conversacional: el modelo puede mantener dialogos sobre conceptos contables y de negocio en ingles, apoyandose en su especializacion declarada y en el prompt de sistema incluido para orientar respuestas.
- Automatizacion de consultas con herramientas: al devolver llamadas en formato de texto, puede integrarse en un orquestador que parsee esas llamadas y ejecute funciones (por ejemplo, consultas a una base de datos de facturacion) y devuelva resultados al modelo.
- Despliegue local en estaciones de trabajo: gracias a su tamano (~1,17 B en Q8_0) y al Modelfile para Ollama, es viable ejecutarlo en portatiles o equipos sin GPU dedicada para prototipos internos.
- Clasificacion y extraccion de informacion de documentos de negocio: puede usarse para resumir o extraer campos de textos financieros en ingles, con validacion humana posterior.
- Chatbot de soporte interno para equipos financieros: conversaciones multi-turno sobre procedimientos contables, con la ventaja de que los datos no salen del entorno local.
- Pruebas de concepto de agentes con tool calling: util para validar pipelines de function calling en un modelo pequeno antes de escalar a modelos mayores, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 1,2-1,5 GB para los pesos, mas overhead de contexto y runtime (estimacion orientativa; no confirmada por el autor).
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), asi como en CPU.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100 no son necesarias por tamano; cualquier GPU moderna con suficiente VRAM es adecuada.
- Opciones de despliegue: Ollama (soportado explicitamente con Modelfile), llama.cpp y otros runners compatibles con GGUF; vLLM y TGI no se mencionan como soportados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Openwist/Logistes-1.0-GGUF | ~1,17 B | no disponible | LFM Open License v1.0 | GGUF (Q8_0) | Especializado en negocio/contabilidad, tool calling en texto |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos equivalentes en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion muy limitada: la model card del GGUF remite al repositorio principal y no detalla arquitectura, entrenamiento ni evaluacion, lo que dificulta validar su calidad.
- Riesgo de alucinacion: como todo modelo de lenguaje pequeno, puede generar datos contables o financieros incorrectos; requiere supervision humana en contextos criticos.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Tool calling no nativo en el runtime: las llamadas se devuelven como texto y exigen parseo propio, lo que anade complejidad y fragilidad al pipeline.
- Licencia: LFM Open License v1.0 (etiquetada como "other"); es imprescindible revisar los terminos del archivo LICENSE y NOTICE antes de un uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el manejo de conversaciones o documentos largos.
- Sesgos: no documentados por el autor; no disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Openwist/Logistes-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Logistes-1.0
- Perfil del autor: https://huggingface.co/Openwist
