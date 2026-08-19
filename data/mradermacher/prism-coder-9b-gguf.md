# mradermacher/prism-coder-9b-GGUF

## Resumen

prism-coder-9b es un modelo de lenguaje multimodal de 9.200 millones de parametros, desarrollado por dcostenco y cuantizado a formato GGUF por mradermacher. Se basa en la arquitectura Qwen3.5 y ha sido ajustado con QLoRA sobre el dataset Synalux, especializandose en enrutamiento de herramientas (tool routing) y llamadas a funciones (function calling). Su caracteristica mas distintiva es su capacidad vision-language: puede procesar imagenes ademas de texto, lo que lo convierte en una opcion interesante para agentes que necesitan interpretar capturas de pantalla, diagramas o interfaces graficas.

La version GGUF, publicada en junio de 2026, incluye 12 cuantizaciones diferentes que van desde Q2_K (4.0 GB) hasta f16 (18.5 GB), lo que permite desplegarlo tanto en hardware de consumo como en servidores profesionales. El modelo base esta licenciado bajo Apache 2.0, lo que facilita su uso comercial sin restricciones significativas. Aunque el idioma principal es el ingles, su base Qwen3.5 sugiere cierta capacidad multilingue, aunque no esta documentada oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5) |
| Parametros totales | 9.197.093.888 (9.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base prism-coder-9b parte de la arquitectura Qwen3.5, un transformer autoregresivo con atencion por ventanas deslizantes y atencion global alternada. Sobre esta base se aplico un ajuste fino con QLoRA (Quantized Low-Rank Adaptation) utilizando el dataset Synalux, que incluye ejemplos de enrutamiento de herramientas y llamadas a funciones. Esta tecnica permite adaptar el modelo a tareas especificas con un coste computacional reducido, manteniendo los pesos originales congelados e insertando adaptadores de bajo rango.

El modelo incorpora un proyector de vision que permite procesar imagenes como entrada adicional al texto. No se han publicado detalles sobre el numero total de tokens de entrenamiento ni la composicion exacta del dataset, aunque la especializacion en tool routing sugiere un enfasis en datos de interaccion con APIs y agentes. La cuantizacion GGUF realizada por mradermacher utiliza conversion estatica sin imatrix, lo que puede afectar ligeramente a la precision en cuantizaciones bajas.

## Capacidades

- Generacion de texto y codigo: capaz de producir respuestas coherentes y fragmentos de codigo en diversos lenguajes de programacion.
- Tool routing y function calling: especializado en seleccionar y llamar herramientas externas de forma estructurada, con soporte para JSON de salida.
- Comprension de imagenes: puede procesar capturas de pantalla, diagramas, graficos y documentos escaneados como entrada visual.
- Razonamiento multi-paso: apto para tareas de agente que requieren planificacion y ejecucion secuencial de acciones.
- Capacidades multilingues limitadas: aunque la documentacion oficial solo menciona ingles, la base Qwen3.5 proporciona cierto soporte para otros idiomas.
- Integracion con pipelines de transformers: compatible con la libreria transformers de HuggingFace para despliegue en Python.

## Casos de uso

- Asistentes de soporte tecnico con capturas de pantalla: el modelo puede recibir una imagen del error que ve el usuario y generar una respuesta con pasos de solucion, combinando comprension visual y generacion de texto.
- Agentes de automatizacion de pruebas: dado un diagrama de flujo o una captura de interfaz, el modelo puede generar casos de prueba y ejecutar llamadas a funciones de testing.
- Chatbots de atencion al cliente con acceso a APIs: su capacidad de tool calling permite que el bot consulte bases de datos, gestione pedidos o verifique estados de envio en tiempo real.
- Asistentes de programacion que interpretan diagramas: un desarrollador puede subir un esquema de arquitectura y el modelo genera el codigo esqueleto correspondiente.
- Sistemas de extraccion de informacion de documentos: combina OCR visual con generacion de texto estructurado para extraer datos de facturas o formularios.
- Automatizacion de tareas de oficina: el modelo puede leer una captura de una hoja de calculo y generar una funcion que procese esos datos, integrandose con herramientas como Python o SQL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no proporciona datos de evaluacion comparativa, y el modelo base tampoco incluye metricas de rendimiento en su documentacion publica. Se recomienda realizar una evaluacion propia con los benchmarks habituales (MMLU, HumanEval, GSM8K) antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 GB (Q2_K) y 18.5 GB (f16) segun la cuantizacion elegida.
- GPU recomendadas: para cuantizaciones Q4 o superiores, una GPU con 8-12 GB de VRAM como RTX 3060/4070 es suficiente. Para f16 o Q8_0, se recomienda una GPU de 24 GB como RTX 4090 o A5000.
- Compatibilidad con hardware de consumo: si, las cuantizaciones Q4_K_M (5.9 GB) y Q5_K_M (6.7 GB) caben en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, se puede usar vLLM o TGI.
- Latencia estimada: no disponible, depende del hardware y la cuantizacion. Con Q4_K_M en una RTX 4070 se puede esperar una velocidad de 30-50 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia |
|---|---|---|---|---|---|
| prism-coder-9b | 9.2B | no disponible | Si | Si | Apache 2.0 |
| Qwen2.5-VL-7B | 7.6B | 32K | Si | Si | Apache 2.0 |
| Llama-3.2-11B-Vision | 11B | 128K | Si | No | Llama 3.2 |

La comparativa con Qwen2.5-VL-7B es la mas relevante, ya que ambos son modelos multimodales de tamano similar con licencia permisiva. prism-coder-9b tiene mas parametros y un enfoque especifico en tool routing, mientras que Qwen2.5-VL-7B ofrece un contexto mas largo y un ecosistema mas maduro. Llama-3.2-11B-Vision tiene mejor soporte de contexto largo pero carece de function calling nativo.

## Limitaciones y advertencias

- Idioma limitado: la documentacion oficial solo garantiza ingles. El uso en otros idiomas puede producir resultados inconsistentes.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que dificulta planificar aplicaciones con conversaciones largas.
- Riesgo de alucinacion: como cualquier modelo de su tamano, puede generar informacion falsa con alta confianza, especialmente en tareas de codigo o datos factuales.
- Cuantizacion sin imatrix: las cuantizaciones de mradermacher son estaticas, lo que puede degradar la calidad en Q2_K y Q3_K en comparacion con versiones con imatrix.
- Sesgos potenciales: el entrenamiento con QLoRA sobre un dataset especifico puede heredar sesgos del corpus original de Qwen3.5.
- Sin garantias de produccion: no hay benchmarks publicados ni evaluaciones de seguridad, por lo que se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prism-coder-9b-GGUF
- Modelo base: https://huggingface.co/dcostenco/prism-coder-9b
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
