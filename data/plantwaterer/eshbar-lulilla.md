# plantwaterer/eshbar-lulilla

## Resumen

Eshbar-lulilla es un ajuste fino completo (continued full fine-tune) del modelo multimodal google/gemma-4-31B-it, desarrollado por el usuario plantwaterer. Se trata de la tercera iteracion de una cadena de fine-tunes que parte de liquamen y continua en haimation, y esta especializada en tareas de toma de decisiones y respuesta a preguntas de opcion multiple. El modelo conserva la torre de vision del modelo base, por lo que mantiene capacidades image-text-to-text, y anade un motor de inferencia propio (`eshbar_lulilla:Engine`) empaquetado en el repositorio.

La relevancia del modelo reside en su enfoque hibrido: combina un transformer multimodal de 31.273 millones de parametros con un sistema de ejecucion de codigo y un almacen de conocimiento integrado para responder preguntas numericas y binarias (si/no) cuando la primera pasada del modelo no alcanza un umbral de confianza. Ademas, incorpora una cabeza de prediccion multi-token (draft head) de Gemma-4 para decodificacion especulativa verificada por el propio modelo.

Segun la model card, el modelo alcanza la posicion 15 de 345 en el Decision Index 0.4.1 con una puntuacion completa de 70,30, y una puntuacion de 70,27 (puesto 33) en la suite publica auto-evaluada. Requiere una GPU con al menos 75 GB de VRAM en bf16, lo que lo situa en el segmento de despliegue profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma-4) con capas de atencion completa bidireccional y capas locales causales de 1.024 tokens; torre de vision congelada |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (capas locales de 1.024 tokens; contexto global no especificado) |
| Tipos de cuantizacion | no disponible (entrenado e inferido en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de google/gemma-4-31B-it (revision `842da3794eaa0b77d5f08bae87a17459d91ff475`). Mantiene la torre de vision congelada y una arquitectura de atencion mixta: capas de atencion completa que operan de forma bidireccional dentro de un prompt y capas de ventana deslizante con atencion causal limitada a 1.024 tokens. El ajuste fino se realizo sobre los pesos de plantwaterer/haimation, que a su vez proviene de plantwaterer/liquamen.

El entrenamiento consistio en 3.122 actualizaciones con un tamano de lote global de 64, lo que suma 199.803 preguntas de decision (a partir de 200.034 filas tras descartar 231 con un error de etiquetado). Se uso `pack_tokens = 8.192`, AdamW en fp32 fusionado con `betas = (0.9, 0.95)`, `weight_decay = 0.0` y recorte de gradiente de 1.0. Se aplicaron offsets de caso-control de Prentice-Pyke sobre 4.921 filas binarias dispersas, seguido de un reajuste de la cabeza de la ultima capa con temperatura `T = 1.4004`. La innovacion tecnica principal es el motor de inferencia empaquetado, que incluye un almacen de conocimiento (estadisticas a nivel de pais), un ejecutor de aritmetica exacta como kernel de GPU y una cabeza de borrador de prediccion multi-token de Gemma-4 para decodificacion especulativa verificada token a token.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple con calibracion de probabilidades (softmax a temperatura ajustada de 1,4004).
- Decisiones binarias si/no con posterior de Laplace integrada.
- Razonamiento numerico: cuando la primera pasada no supera el umbral de confianza (0,925 para opciones numericas, 0,75 para si/no), el modelo genera una funcion Python corta (maximo 320 tokens nuevos) y la ejecuta con un interprete de aritmetica exacta.
- Consulta a un almacen de conocimiento integrado con estadisticas a nivel de pais para preguntas numericas.
- Procesamiento de imagen y texto (image-text-to-text) gracias a la torre de vision heredada de Gemma-4.
- Decodificacion especulativa mediante cabeza de borrador multi-token, con verificacion por el propio modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion automatizada de opciones multiples: el modelo esta entrenado especificamente sobre 199.803 preguntas de decision, por lo que es adecuado para bancos de preguntas tipo test, evaluaciones de conocimiento y tareas de seleccion entre alternativas con probabilidades calibradas.
- Respuesta a preguntas estadisticas por pais: el almacen de conocimiento integrado con datos de Our World in Data permite resolver consultas numericas sobre indicadores nacionales sin necesidad de calculo externo.
- Verificacion aritmetica en pipelines de decision: la generacion y ejecucion de funciones Python con aritmetica exacta permite obtener resultados numericos verificables en lugar de aproximaciones del modelo de lenguaje.
- Sistemas de decision binaria con incertidumbre cuantificada: la posterior de Laplace sobre decisiones si/no proporciona una medida de confianza integrada, util en entornos donde la calibracion es critica.
- Procesamiento de documentos con imagen y texto: la torre de vision permite extraer informacion de capturas, formularios o graficos y combinarla con razonamiento textual en una sola pasada.
- Despliegue en entornos con GPU profesional unica: al caber en una RTX PRO 6000 (96 GB), es viable en estaciones de trabajo con una sola GPU, sin necesidad de infraestructura multi-GPU.
- Evaluacion de modelos de decision: el modelo sirve como referencia en tableros como el Decision Index, donde compite con otros fine-tunes de la misma familia.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Rango | Comparativa |
|---|---|---|---|
| Decision Index 0.4.1 (full score) | 70,30 | 15 / 345 | +1,16 sobre liquamen (69,14) |
| Decision Index 0.4.1 (same-skill) | 66,58 | 16 | +2,64 sobre liquamen |
| Decision Index 0.4.1 (new-domain) | 59,64 | 17 | -0,89 sobre liquamen |
| Suite publica (auto-evaluada) | 70,27 | 33 | +4,48 sobre liquamen (65,79); +2,83 sobre haimation (67,44) |
| Suite publica (raw) | 77,52 | no disponible | no disponible |
| Suite publica (breadth) | 69,72 | no disponible | no disponible |

Latencia medida en una RTX PRO 6000 Blackwell sobre 1.000 peticiones: mediana 302 ms, media 693 ms, p80 928 ms, p95 2.165 ms. En una muestra con ocho veces la tasa de enrutamiento: mediana 195 ms, media 421 ms, p80 347 ms. No se incluye la carga del modelo ni el calentamiento (hasta unos cuatro minutos).

## Requisitos de hardware

- VRAM estimada: al menos 75 GB en bf16 (pesos de 62 GB).
- GPU recomendada: una RTX PRO 6000 (96 GB) es suficiente; tambien cabe en A100 80 GB o H100 80 GB.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en bf16 sin cuantizacion, y no se documentan opciones cuantizadas.
- Opciones de despliegue: el motor propio `eshbar_lulilla:Engine` se ejecuta en proceso desde el repositorio; el kernel del ejecutor viene precompilado para sm_75 a sm_120. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 302 ms por peticion en la muestra publica de 1.000 filas; el calentamiento puede tardar hasta cuatro minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eshbar-lulilla | 31,27 B | no disponible | 70,30 (puesto 15) | Apache-2.0 | Hugging Face |
| plantwaterer/haimation | no disponible | no disponible | 67,44 (suite publica) | no disponible | Hugging Face |
| plantwaterer/liquamen | no disponible | no disponible | 69,14 (full score) | no disponible | Hugging Face |
| google/gemma-4-31B-it | 31 B (aproximado) | no disponible | no disponible | Apache-2.0 (segun modelo base) | Hugging Face |

## Limitaciones y advertencias

- El modelo esta especializado en tareas de decision y opcion multiple; su rendimiento en generacion abierta, codigo general o conversacion no esta documentado.
- El almacen de conocimiento integrado cubre solo estadisticas a nivel de pais y esta licenciado bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y comparticion derivadas del uso de esos datos.
- El ejecutor de codigo (`eshbar/xr_runtime/`) deriva de LOOM (Apache-2.0, modificado) y requiere revision de su LICENSE y NOTICE para uso en produccion.
- La decodificacion especulativa puede producir diferencias en el programa generado cuando los dos logits superiores estan dentro de un ulp en bf16, aunque no se observaron cambios en las respuestas medidas (0 cambios en 2.000 peticiones).
- El modelo requiere al menos 75 GB de VRAM, lo que excluye GPU de consumo y limita el despliegue a infraestructura profesional.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero los componentes de terceros (store_table.json, xr_runtime) tienen licencias propias que deben respetarse.
- Los resultados del Decision Index son una instantanea del 21 de noviembre de 2026 y pueden variar con actualizaciones del tablero.

## Enlaces

- Hugging Face: https://huggingface.co/plantwaterer/eshbar-lulilla
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo predecesor (haimation): https://huggingface.co/plantwaterer/haimation
- Modelo predecesor (liquamen): https://huggingface.co/plantwaterer/liquamen
- Decision Index board: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit de evaluacion: apolinario/decision-index (commit 9eb2dbe2a358004c8782c66e40a83ac07b953fec)
- Repositorio LOOM (ejecutor derivado): https://github.com/mkturkcan/Loom
- Asistente Gemma-4 (draft head): https://huggingface.co/google/gemma-4-31B-it-assistant
