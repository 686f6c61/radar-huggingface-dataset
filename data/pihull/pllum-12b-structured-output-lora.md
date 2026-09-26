# pihull/pllum-12b-structured-output-lora

## Resumen

El modelo `pihull/pllum-12b-structured-output-lora` es un ajuste fino mediante LoRA del modelo polaco `CYFRAGOVPL/PLLuM-12B-instruct-2512`, con los pesos del adaptador ya fusionados en los pesos base. Lo desarrolla el usuario `pihull` y su objetivo es específico: mejorar la fiabilidad de la salida estructurada condicionada por esquema JSON (Draft 2020-12) en polaco, manteniendo a la vez la capacidad de invocación de herramientas (tool calling). No es un modelo de propósito general nuevo, sino una especialización vertical sobre un modelo instruct ya existente.

La relevancia del modelo está en el problema que ataca. Los modelos generativos suelen producir JSON sintácticamente plausible pero inválido respecto a un esquema, o con políticas de campo incorrectas (valores nulos en campos ausentes, conversión de unidades mal redondeada, jerarquías mal resueltas). Sobre un conjunto de evaluación polaco de 9.150 registros y 41 tipos de tarea, el ajuste eleva la corrección estricta de política del 59,8% al 75,8%, el JSON estricto del 62,3% al 98,1% y la validez de esquema del 93,9% al 97,2% respecto al modelo base.

Arquitectónicamente es un transformer decoder-only denso de 12.247.782.400 parámetros (aproximadamente 12,25 mil millones), etiquetado como familia Mistral, con licencia Apache 2.0 heredada del modelo base y soporte declarado para polaco e inglés. El ajuste se hizo con LoRA de rango 16 sobre todas las proyecciones de atención y MLP, con 48.500 ejemplos y unas 66 minutos de cómputo en 8 GPU H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiquetado como familia Mistral) |
| Parametros totales | 12.247.782.400 (12,25 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | Polaco (pl) e ingles (en) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | Safetensors |
| Modelo base | CYFRAGOVPL/PLLuM-12B-instruct-2512 |
| Tipo de ajuste | LoRA fusionada en los pesos base (r=16, alpha=32, dropout 0,05) |
| Tamano del repositorio | 49,0 GB |
| Descargas / likes | 167 descargas / 0 likes |
| Fecha de creacion / actualizacion | 17 de septiembre de 2026 / 25 de septiembre de 2026 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `PLLuM-12B-instruct-2512`: un transformer decoder-only denso de unos 12,25 B de parametros, encuadrado en la familia Mistral segun las etiquetas del repositorio. El autor no modifica la arquitectura, sino que superpone un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05 aplicado a todas las proyecciones de atencion y MLP, entrenado con tasa de aprendizaje 1e-4 con planificador coseno, lote efectivo de 64 y 2 epocas sobre 8 GPU H100 durante aproximadamente 66 minutos. La perdida se calcula unicamente sobre los tokens del asistente y posteriormente el adaptador se fusiona en los pesos base, de modo que el artefacto publicado se carga como un causal LM convencional con `transformers` o `vllm`, sin necesidad de gestionar el adaptador por separado.

El entrenamiento usa 48.500 ejemplos con el esquema JSON o las definiciones de herramientas siempre visibles en el prompt: 32.000 tareas sinteticas polacas generadas de forma procedural (campos tipados, nulos y claves opcionales, nombres de clave literales y enumeraciones, numerales, fechas e inflexion polaca normalizados al nominativo, reformateo de tablas, CSV, XML/HTML y JSON, logs, escapado y uniones, filtrado, agregacion y ordenacion, joins multi-salto y robustez frente a instrucciones inyectadas en los datos), 8.000 ejemplos de extraccion de ScrapeGraphAI-100K en ingles y polaco traducido automaticamente (solo respuestas no vacias y validas contra esquema), 2.500 ejemplos json-mode de Hermes y 6.000 ejemplos de tool calling de Glaive y xLAM. El formato respeta exactamente la plantilla de chat de PLLuM-2512, `<s>[INST]{system}\n\n{user}[/INST]{answer}</s>`, con respuestas en JSON compacto sin bloques de codigo y llamadas a herramienta delimitadas por `<tool_call>{"name":...,"arguments":...}</tool_call>`, con los resultados de herramienta en el siguiente bloque `[INST]` como `<tool_response>`.

La innovacion principal no es arquitectonica sino de metodologia: la version 2 corrige el fallo de la version 1, cuyo preprocesado nunca renderizaba el esquema de salida ni las definiciones de herramientas dentro del prompt, lo que provocaba regresiones en tareas de salida estructurada. Ademas, la seleccion de checkpoint se hizo sin usar datos del benchmark, y se verifica que no existe solapamiento de 12-gramas entre los prompts de entrenamiento y los textos fuente del benchmark.

## Capacidades

- Generacion de salida estructurada condicionada por esquema JSON (Draft 2020-12 con comprobaciones de formato), con validacion estricta frente al esquema: 98,1% de JSON estricto y 97,2% de esquema valido en el benchmark del autor.
- Extraccion de datos: conversion de texto libre, tablas, CSV, XML/HTML y JSON a una estructura objetivo definida por esquema.
- Normalizacion de dominio polaco: numerales, fechas relativas, inflexion nominal normalizada al nominativo y formato numerico local.
- Manejo de nulos y claves opcionales: colocar `null` en campos ausentes es una de las mejoras mas grandes reportadas frente al modelo base.
- Consultas jerarquicas y joins multi-salto entre fuentes de datos, con filtrado, agregacion y ordenacion (los joins profundos con calculo siguen siendo debiles).
- Conversion de unidades con redondeo correcto y validacion de cardinalidad y ordenacion de colecciones.
- Esquemas con `anyOf` y pruebas de estres de esquema.
- Robustez frente a inyeccion de instrucciones: ignora esquemas o instrucciones insertados dentro de los datos de origen.
- Tool calling / function calling: emitido mediante bloques `<tool_call>` con nombre y argumentos en JSON; los ejemplos de Glaive y xLAM forman parte del entrenamiento. El autor indica que no se reevaluo el tool calling en BFCL para la version 2.
- Multilingue limitado a polaco e ingles, con el grueso del entrenamiento en polaco.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de campos en administracion publica polaca: dado un documento o formulario en polaco y un esquema JSON objetivo, el modelo devuelve directamente la estructura rellena, con `null` en los campos ausentes en lugar de valores inventados, gracias al 75,8% de politica correcta y al 97,2% de validez de esquema medidos por el autor.
- Normalizacion de datos de entrada en pipelines ETL: conversion de CSV, XML o HTML heterogeneos a JSON canonico con fechas relativas resueltas, numeros en formato polaco interpretados y unidades convertidas con el redondeo configurado.
- Integracion de APIs mediante function calling: el modelo puede emitir llamadas `<tool_call>` con argumentos JSON validados contra la definicion de herramienta incluida en el mensaje de sistema, lo que permite encadenar servicios en un agente sin parsear texto libre.
- Asistentes de atencion al cliente en polaco: clasificacion y estructuracion de la consulta del usuario en un esquema de ticket (categoria, prioridad, producto, fechas) para alimentar un sistema de tickets automaticamente.
- Consolidacion de registros entre fuentes (joins multi-salto): union de identificadores y atributos procedentes de varias tablas o registros para producir una entidad unificada, con la advertencia de que los joins profundos con calculo siguen siendo el punto debil reportado.
- Defensa frente a prompt injection en ingestion de datos: al procesar texto de terceros que contiene instrucciones o esquemas falsos embebidos, el ajuste entrena explicitamente al modelo para ignorarlos y ceñirse al esquema de la tarea.
- Generacion de salidas validas para sistemas con contrato de esquema estricto: cualquier pipeline donde la salida no valida se rechace, ya que el modelo reduce drasticamente la tasa de JSON malformado (del 37,7% de fallo en el base al 1,9%).
- Limpieza y reestructuracion de logs: parseo de lineas de log con escapado, uniones de tipos y campos opcionales hacia un esquema de eventos tipado.

## Benchmarks y rendimiento

Benchmark del autor: suite polaca de salida estructurada con 9.150 registros y 41 tipos de tarea. Cada prompt incluye la tarea, los datos de origen y un JSON Schema en linea. Una prediccion se considera correcta solo si es valida contra el esquema (Draft 2020-12 con comprobaciones de formato) y supera las politicas por campo. Ambos modelos se ejecutaron con vLLM en bf16, decodificacion greedy y la plantilla de chat propia del modelo.

| Modelo | Politica correcta | JSON estricto | Esquema valido |
|---|---:|---:|---:|
| PLLuM-12B-instruct-2512 (base) | 59,8% | 62,3% | 93,9% |
| pihull/pllum-12b-structured-output-lora (v2) | 75,8% | 98,1% | 97,2% |

Comparacion por pares sobre 1.562 registros: 1.562 registros fijos y 95 rotos. Las mayores ganancias se dan en `null` para campos ausentes, consultas de jerarquia, conversion y redondeo de unidades, esquemas `anyOf`, cardinalidad y ordenacion, fechas relativas e ignorar esquemas inyectados en los datos. Siguen siendo debiles la conversion JSON a CSV con formato numerico polaco y los joins multi-salto profundos con calculo.

Conjuntos de desarrollo reservados (usados para seleccion de checkpoint):

| Modelo | Tareas sinteticas PL, coincidencia exacta | ScrapeGraph test split, precision de hoja |
|---|---:|---:|
| Base | 56,4% | 28,7% |
| Este modelo | 95,9% | 42,7% |

No hay datos de BFCL para tool calling en la version 2 (el autor indica explicitamente que no se reevaluo). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16: 12,25 B de parametros implican aproximadamente 24,5 GB de pesos, mas activaciones y cache KV. El repositorio ocupa 49,0 GB, por lo que se necesita espacio en disco suficiente para la descarga completa antes de cargar en memoria.
- VRAM estimada para inferencia en bf16: del orden de 26-30 GB con contexto corto, lo que exige GPU de 40 GB o mas (A100 40/80 GB, H100 80 GB, L40S 48 GB) para no recurrir a offloading.
- Cuantizacion a 8 bits: aproximadamente 13-14 GB de pesos, viable en RTX 4090 (24 GB) o L4 (24 GB) con margen para contexto moderado.
- Cuantizacion a 4 bits: aproximadamente 7-8 GB de pesos, viable en GPU de consumo de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080), aunque no se publican pesos pre-cuantizados en el repositorio.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion de 8 o 4 bits; en bf16 completo no cabe en ninguna GPU de consumo actual de 24 GB.
- Opciones de despliegue: el autor indica carga mediante `transformers` o `vllm` usando la plantilla de chat integrada; los benchmarks se ejecutaron con vLLM en bf16. No se documentan instrucciones para llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponible. El unico dato de computo publicado es el entrenamiento (8xH100, ~66 minutos), no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el benchmark del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pihull/pllum-12b-structured-output-lora | 12,25 B | No disponible | 75,8% politica correcta / 98,1% JSON estricto / 97,2% esquema valido | Apache 2.0 | HuggingFace, safetensors, 167 descargas |
| CYFRAGOVPL/PLLuM-12B-instruct-2512 (base) | 12,25 B (mismo tamano) | No disponible | 59,8% / 62,3% / 93,9% | Apache 2.0 | HuggingFace (modelo base del ajuste) |
| Otros modelos de salida estructurada de ~12 B en polaco | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion disponible |

La unica comparacion directa documentada es contra el modelo base, del que este ajuste deriva. No se dispone de datos que permitan comparar con modelos de la misma categoria (por ejemplo, alternativas de la familia Qwen, Llama o Mistral especializadas en salida estructurada), ni de referencias a modelos comparables en polaco dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento desigual por tarea: la conversion de JSON a CSV con formato numerico polaco y los joins multi-salto profundos con calculo siguen por debajo de lo deseable segun el propio autor.
- Herramienta sin reevaluar: el tool calling no se volvio a evaluar en BFCL para la version 2, por lo que su calidad en invocacion de funciones no esta cuantificada en la informacion disponible.
- Cobertura de idiomas: solo polaco e ingles declarados, con mayoria de datos de entrenamiento en polaco; no hay garantias para otras lenguas, incluido el castellano.
- Composicion del entrenamiento: parte de los datos son sinteticos generados proceduralmente y otra parte es traduccion automatica de ScrapeGraphAI-100K, lo que puede introducir artefactos de traduccion y sesgos del generador sintetico.
- Riesgo de alucinacion: aunque el ajuste penaliza valores inventados en campos ausentes, el modelo sigue siendo un generativo de 12 B sin mecanismo de verificacion simbolica; se recomienda validar siempre la salida contra el esquema antes de consumirla (el 2,8% de salidas del ajuste no es valido contra esquema).
- Sensibilidad al prompt: el modelo depende criticamente de que el esquema o las definiciones de herramientas esten visibles en el prompt, tal como se entreno; omitirlos reproduce el comportamiento degradado de la version 1.
- Longitud de contexto no documentada: no se especifica la ventana de contexto del modelo base en la informacion disponible, lo que impide planificar tamanos de documento en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de `CYFRAGOVPL/PLLuM-12B-instruct-2512` y de los datasets de entrenamiento (Glaive, xLAM, Hermes, ScrapeGraphAI) antes de un despliegue comercial.
- Madurez y traccion bajas: 0 likes y 167 descargas, sin pipeline declarado ni documentacion de despliegue; es un artefacto de investigacion, no un modelo con soporte.
- Repositorio de 49,0 GB: requiere planificar almacenamiento y ancho de banda para la descarga completa.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/pihull/pllum-12b-structured-output-lora
- Modelo base: https://huggingface.co/CYFRAGOVPL/PLLuM-12B-instruct-2512
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido no tecnico de terceros) y se descartan como fuentes. No se han encontrado enlaces tecnicos adicionales verificables.
