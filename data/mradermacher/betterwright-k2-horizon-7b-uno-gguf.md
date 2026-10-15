# mradermacher/BetterWright-K2-Horizon-7B-Uno-GGUF

## Resumen

BetterWright-K2-Horizon-7B-Uno-GGUF es la version cuantizada en formato GGUF del modelo BetterWright-K2-Horizon-7B-Uno, un ajuste fino orientado a agentes de navegador y uso de herramientas desarrollado por ProCreations. La cuantizacion la ha realizado mradermacher, que publica los pesos en varios niveles de compresion (desde Q2_K de 3,9 GB hasta f16 de 18,1 GB) bajo licencia Apache-2.0. El modelo base es una adaptacion del K2-Horizon-7B, un transformer denso de aproximadamente 9.000 millones de parametros (8.999.178.240 segun safetensors) con una ventana de contexto que, segun las fuentes consultadas en la busqueda web, alcanza los 512K tokens.

El interes de este modelo radica en su especializacion: esta entrenado con el dataset `ProCreations/betterwright-agent-traces` para tareas de navegacion web, tool calling y function calling, y ademas incorpora una tecnica de aceleracion basada en un adaptador de difusion (denominado Uno con muestreador Psi-Spec) que verifica cada bloque generado contra los pesos autorregresivos. Esto mantiene la calidad del modelo autorregresivo afinado y solo modifica la velocidad de generacion.

Al tratarse de una publicacion reciente (creada el 15 de octubre de 2026) y con muy pocas descargas (14) y cero likes en el momento de redactar esta ficha, la informacion publica sobre benchmarks, latencias y detalles de entrenamiento es muy limitada, por lo que una parte relevante de las especificaciones queda marcada como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (dense model) con adaptador de difusion para decodificacion especulativa (Uno / muestreador Psi-Spec) |
| Parametros totales | 8.999.178.240 (aproximadamente 9B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512K tokens (segun resultados de busqueda web; no confirmado en la model card) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transformers segun metadatos de la libreria) |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-7B se describe, en las fuentes de busqueda consultadas, como un modelo denso (no MoE) de 7B parametros con capacidad de servicio en una sola GPU. La variante BetterWright-K2-Horizon-7B-Uno, sobre la que se aplica esta cuantizacion, es un ajuste fino completo (full-finetune) sobre el dataset `ProCreations/betterwright-agent-traces`, orientado a trazas de agente de navegador. El repositorio cuantizado incluye unicamente los pesos autorregresivos; el adaptador de difusion (carpeta `adapter/`) se distribuye por separado y, segun la model card del modelo base, es una LoRA condicional que no altera la calidad de generacion, solo la velocidad.

La innovacion tecnica destacable es el uso de un adaptador de difusion como borrador dentro de un esquema de decodificacion especulativa: el denominado muestreador Psi-Spec verifica cada bloque propuesto contra los pesos autorregresivos, lo que garantiza que la salida coincide con la del modelo autorregresivo afinado. No se dispone de informacion publica sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset mas alla de su nombre, ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles.
- Uso de herramientas y function calling (tags `tool-use` y `function-calling`).
- Comportamiento como agente de navegador web (tags `browser-agent` y `web-agent`), incluyendo razonamiento multi-paso orientado a tareas web.
- Descarga y ejecucion en cuantizaciones de bajo consumo gracias al formato GGUF.
- Aceleracion de la generacion mediante adaptador de difusion acoplado (esquema Uno con verificacion Psi-Spec), que no modifica la calidad respecto al modelo autorregresivo.
- Soporte de contexto largo (hasta 512K tokens segun las fuentes de busqueda, dato no confirmado en la model card).
- Capacidades multimodales: no disponible.
- Capacidades de audio o vision: no disponibles.

## Casos de uso

- Automatizacion de agentes de navegador web: el modelo esta afinado especificamente con trazas de agente (`betterwright-agent-traces`), por lo que puede emitir acciones estructuradas y llamadas a herramientas para rellenar formularios, extraer datos o navegar flujos multipaso.
- Asistentes de operaciones con interfaz web: integrar el modelo en un orquestador que traduzca instrucciones en lenguaje natural a acciones sobre APIs REST o interfaces DOM mediante function calling.
- Ejecucion local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (5,7 GB) y Q4_K_S (5,5 GB) permiten desplegar el modelo en GPUs de 8 GB o superiores con llama.cpp u Ollama, ideal para prototipos sin conexion.
- Pipelines de extraccion estructurada: usar el modelo con esquemas de function calling para convertir paginas HTML o respuestas de API en JSON validado.
- Asistentes de soporte tecnico con contexto muy largo: si la ventana de 512K tokens se confirma, permitiria mantener historiales extensos de interaccion y documentacion tecnica en un unico prompt.
- Investigacion sobre decodificacion especulativa: el esquema Uno/Psi-Spec es un caso de estudio util para medir el impacto del borrador de difusion sobre el throughput sin perdida de calidad frente al modelo autorregresivo.
- Despliegue con requisitos de licencia permisiva: al estar bajo Apache-2.0, puede incorporarse a productos comerciales sin las restricciones de licencias tipo Llama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada de inferencia segun cuantizacion (tamano del archivo, sin contar cache KV ni overhead): Q2_K 3,9 GB; Q3_K_S 4,4 GB; Q3_K_M 4,7 GB; Q3_K_L 5,0 GB; IQ4_XS 5,2 GB; Q4_K_S 5,5 GB; Q4_K_M 5,7 GB; Q5_K_S 6,4 GB; Q5_K_M 6,6 GB; Q6_K 7,5 GB; Q8_0 9,7 GB; f16 18,1 GB.
- Cabe en GPU de consumo: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 8 GB (por ejemplo RTX 3070, RTX 4060); Q5_K_M y Q6_K en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070); Q8_0 en GPUs de 12-16 GB; f16 requiere aproximadamente 24 GB (RTX 3090, RTX 4090) o reparto entre varias GPUs.
- GPU recomendadas: para despliegue en produccion con contexto largo, se recomienda una GPU con amplia memoria (A100 40/80 GB, H100, L40S) debido al coste de la cache KV en ventanas de 512K tokens. No se dispone de datos concretos de latencia o throughput publicados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se confirma compatibilidad con vLLM o TGI para el formato GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| BetterWright-K2-Horizon-7B-Uno | aproximadamente 9B | 512K (segun busqueda, no confirmado) | Apache-2.0 | Agente de navegador y uso de herramientas |
| Qwen2.5-7B-Instruct | 7B | 128K | Apache-2.0 (la mayoria de variantes) | Proposito general, tool calling |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Proposito general, tool calling |

Los valores de los modelos comparativos corresponden a especificaciones ampliamente conocidas; los del modelo objeto de la ficha provienen de los metadatos de HuggingFace y de los resultados de busqueda web. No se dispone de comparativas de rendimiento (benchmarks) para este modelo concreto, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles (`en`), por lo que su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como en cualquier modelo generativo, existe riesgo de inventar acciones o resultados, algo critico en agentes que operan sobre interfaces reales.
- Especializacion estrecha: al estar afinado sobre trazas de agente de navegador, puede degradarse en tareas genericas de texto, matematicas o codigo frente a modelos de proposito general del mismo tamano.
- Contexto: el dato de 512K tokens proviene de fuentes secundarias y no aparece confirmado en la model card; conviene verificarlo antes de disenar aplicaciones que dependan de ventanas muy largas, ya que el coste de la cache KV puede ser prohibitivo.
- Licencia: Apache-2.0 es permisiva y permite uso comercial, pero conviene revisar la licencia del modelo base original (K2-Horizon-7B) para asegurar la compatibilidad de toda la cadena de derivacion.
- Madurez: con 14 descargas y 0 likes en el momento de la ficha, el modelo carece de validacion comunitaria amplia; no se recomienda su uso en produccion critica sin una evaluacion propia.
- Formato GGUF: la cuantizacion degrada la precision; las variantes Q2_K y Q3_K_S reducen la calidad de forma notable y deben reservarse para entornos muy limitados de memoria.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/BetterWright-K2-Horizon-7B-Uno-GGUF
- Modelo base: https://huggingface.co/ProCreations/BetterWright-K2-Horizon-7B-Uno
- Dataset de trazas de agente: ProCreations/betterwright-agent-traces
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/BetterWright-K2-Horizon-7B-Uno-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#BetterWright-K2-Horizon-7B-Uno-GGUF
- Festa de solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Ficha en LLM Explorer: https://llm-explorer.com/model/ProCreations%2FBetterWright-K2-Horizon-7B-Uno,1FnkbRGtzws38lCHo4X0x5
- Ficha en AI/TLDR sobre K2 Horizon 7B: https://ai-tldr.dev/models/k2-horizon-7b/
- Ficha en local-ai-zone sobre K2 Horizon 7B: https://local-ai-zone.github.io/models/k2-horizon-7b.html
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
