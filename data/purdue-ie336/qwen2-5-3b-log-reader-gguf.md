# purdue-ie336/qwen2.5-3b-log-reader-GGUF

## Resumen

`qwen2.5-3b-log-reader` es un ajuste fino (fine-tune) supervisado del modelo `Qwen/Qwen2.5-3B-Instruct` desarrollado por el autor `purdue-ie336`, vinculado al curso IE 336 de la Universidad de Purdue y al manual *Stochastic Modeling with Agentic AI*. Su función es muy concreta: leer una entrada de un registro de equipos (notas de turno, lecturas de instrumentos o líneas de eventos de una máquina de almacenamiento automatizado) y devolver etiquetas en JSON que un programa posterior agrega en tuplas (estado, acción, coste, siguiente estado) para estimar por conteo las probabilidades de transición y los costes de un proceso de decisión de Markov (MDP).

El modelo no calcula, solo etiqueta: devuelve expresiones aritméticas como cadenas de texto para que el programa las evalúe, copia lecturas numéricas para que el programa las mapee a bandas y emite `null` cuando la entrada no aporta un dato. Está construido sobre la arquitectura transformer densa de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros totales y una ventana de contexto configurada a 4.096 tokens en el despliegue de Ollama.

La relevancia es acotada pero clara: es un ejemplo de extracción de información estructurada con un modelo pequeño (3B) especializado mediante prompting con esquema JSON y mensajes de sistema fijos, pensado para ejecutarse localmente con cuantización Q4_K_M (1,9 GB) y sin GPU de gama alta. No es un modelo de propósito general ni está pensado para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configurado en los parámetros de Ollama) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado, 1,9 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (con archivos `template`, `system` y `params` para Ollama) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer denso con 3.085.938.688 parámetros, y se ha ajustado mediante fine-tuning sobre ese checkpoint base (relación `finetune` declarada en la model card). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO adicionales; la model card solo indica el tipo de tarea y los tres formatos de registro (notas, bandas y eventos) sobre los que se entrenó y evaluó.

La innovación técnica no está en la arquitectura sino en el diseño de la tarea: mensajes de sistema fijos por tipo de registro, salida restringida mediante un esquema JSON (campo `format` de la API de chat de Ollama) y una separación estricta entre etiquetado (modelo) y cálculo (programa). El modelo devuelve costes como cadenas aritméticas evaluables, lecturas como números copiados y estados ausentes como `null`, de modo que el programa externo evalúa, mapea bandas y rellena huecos con la entrada vecina.

## Capacidades

- Extracción de información estructurada: devuelve JSON con `state_start`, `state_end`, `action`, `cost` (y `reading_start`/`reading_end` en registros de bandas) a partir de una entrada de texto libre.
- Etiquetado de notas de turno y mantenimiento en texto libre.
- Etiquetado de lecturas de instrumentos (manómetros, medidores, tests) copiando el valor numérico para su mapeo posterior a bandas.
- Lectura de líneas de eventos de máquinas de almacenamiento automatizado (peticiones, picks, llamadas de ítems).
- Normalización de costes: convierte expresiones como `"$2.5k"` en `"2.5*1000"`, `"scrap $700 + rework $200"` en `"700 + 200"` y `"no scrap"` en `"0"`.
- Distinción entre acciones ejecutadas y reparaciones solo recomendadas, planificadas o con ticket abierto (estas últimas no se etiquetan como acción).
- Salida restringida por esquema JSON: los estados y acciones quedan limitados a los listados en la cabecera y el coste a cadena o `null`.
- Soporte de conversación multi-turno (tag `conversational`), aunque el caso de uso previsto es de una entrada por petición.
- Capacidades multilingües: solo inglés.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode) declarados.

## Casos de uso

- Extracción de tuplas MDP en laboratorios docentes: el modelo lee el registro de turno de una cámara de grabado (etch chamber) del capítulo 10 del manual IE 336 y devuelve las etiquetas que el programa convierte en transiciones y costes para estimar la matriz de probabilidades por conteo.
- Monitorización de mantenimiento industrial: a partir de notas de turno en texto libre, se etiquetan estados de condición (niveles 0 a 3) y acciones (run, recondition) para alimentar un modelo de degradación y planificación de mantenimiento.
- Procesamiento de registros de instrumentación: en registros de bandas (por ejemplo, turbidez en NTU), el modelo copia las lecturas de inicio y fin y el programa las mapea a bandas con límites numéricos definidos por el usuario.
- Análisis de logs de máquinas de almacenamiento automatizado: la lectura de líneas de eventos permite reconstruir secuencias de peticiones y picks para análisis de flujo y cuellos de botella.
- Normalización de costes en informes operativos: la conversión de expresiones como `"6 pcs @ $38"` en `"6*38"` facilita el cálculo automático de costes por periodo sin post-procesado manual.
- Integración en pipelines de extracción con salida validada: el uso del esquema JSON de Ollama permite encadenar la salida del modelo con validadores y bases de datos sin pasos de limpieza adicionales.
- Docencia y prototipado de agentes de extracción: al ejecutarse localmente en 1,9 GB con Q4_K_M, sirve para demostrar flujos de etiquetado con LLM en entornos sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M publicada (1,9 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp u Ollama, a menor velocidad.
- Opciones de despliegue: Ollama (vía `ollama pull hf.co/purdue-ie336/qwen2.5-3b-log-reader-GGUF:Q4_K_M`), llama.cpp y cualquier runtime compatible con GGUF. No se indica soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. El despliegue recomendado fija temperatura 0 y contexto de 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-log-reader | 3.085.938.688 | 4.096 tokens (config. Ollama) | Extracción de etiquetas para MDP en registros de equipos | qwen-research | GGUF en Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3.085.938.688 | no disponible en esta ficha | Instrucciones generales, multilingüe | qwen-research | Pesos completos y GGUF en Hugging Face |
| Qwen2.5-1.5B-Instruct | no disponible en esta ficha | no disponible en esta ficha | Instrucciones generales, menor tamaño | qwen-research | Pesos completos y GGUF en Hugging Face |

La comparación con otros modelos de extracción de información especializados no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre tres tipos de registro (notas, bandas y eventos) y fue entrenado y evaluado con mensajes de sistema y esquemas JSON concretos; su uso fuera de ese formato no está validado.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación en la extracción: aunque el esquema JSON restringe estados y acciones a los listados, el modelo podría copiar lecturas o construir expresiones de coste incorrectas; se recomienda validación programática de la salida.
- El modelo no calcula: los costes se devuelven como cadenas aritméticas que el programa debe evaluar, y los estados ausentes como `null` que el programa debe rellenar; un uso sin ese post-procesado produce resultados incompletos.
- Licencia `qwen-research`: restringe el uso comercial; es necesario revisar el archivo `LICENSE` del repositorio antes de cualquier despliegue en producción.
- Contexto limitado a 4.096 tokens en la configuración de Ollama; registros con entradas muy largas o cabeceras extensas pueden truncarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- No se han publicado métricas de precisión, recall ni benchmarks de extracción, por lo que el rendimiento real en dominios distintos al del curso es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purdue-ie336/qwen2.5-3b-log-reader-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del curso IE 336 (Purdue University): no disponible en la información proporcionada
- Manual *Stochastic Modeling with Agentic AI*: no disponible en la información proporcionada
- Aplicación NotebookDeck: no disponible en la información proporcionada
