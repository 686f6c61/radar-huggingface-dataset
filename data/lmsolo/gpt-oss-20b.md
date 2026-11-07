# lmsolo/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, publicado bajo licencia Apache 2.0. Forma parte de la familia gpt-oss, junto con el modelo mayor gpt-oss-120b, y esta disenado especificamente para tareas de razonamiento, uso agentico y casos de uso locales o especializados donde la latencia importa. Con 20.900 millones de parametros totales y 3.600 millones de parametros activos, emplea una arquitectura de mezcla de expertos (MoE) que reduce el coste computacional por token.

El modelo se distribuye con cuantizacion MXFP4 aplicada a los pesos de los expertos, lo que permite ejecutarlo en aproximadamente 16 GB de memoria, un umbral que lo hace viable en hardware de consumo de gama alta. Incluye un esfuerzo de razonamiento configurable (bajo, medio, alto), acceso completo a la cadena de pensamiento y capacidades nativas de function calling, navegacion web y ejecucion de codigo Python.

La relevancia actual del modelo radica en que OpenAI libera pesos con una licencia permisiva y un formato de respuesta estandarizado (harmony) que facilita su integracion en pipelines de agentes. La ficha que nos ocupa corresponde a un repositorio espejo de terceros (lmsolo/gpt-oss-20b), no al repositorio oficial de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | 3,6 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en pesos de expertos (post-entrenamiento); tag 8-bit en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); tag vllm |

## Arquitectura y entrenamiento

gpt-oss-20b es un transformer con mezcla de expertos en el que, de los 20,9 mil millones de parametros totales, solo 3,6 mil millones se activan por token. Esta relacion de activacion reducida es la que permite que el modelo quepa en aproximadamente 16 GB de memoria y mantenga latencias bajas en inferencia local. Los pesos de los expertos fueron cuantizados a MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas por OpenAI se realizaron con esa misma cuantizacion.

El modelo fue entrenado con el formato de respuesta harmony, un protocolo de conversacion que estructura los mensajes por roles y canales (incluyendo un canal de analisis separado del canal final). Segun la model card, el modelo solo funciona correctamente con ese formato, por lo que debe aplicarse mediante la plantilla de chat de Transformers o el paquete `openai-harmony`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica mas destacable es el esfuerzo de razonamiento configurable: el desarrollador puede ajustar el nivel de razonamiento (bajo, medio, alto) segun los requisitos de latencia, con acceso completo a la cadena de pensamiento generada.

## Capacidades

- Generacion de texto y razonamiento con nivel de esfuerzo configurable (bajo, medio, alto).
- Cadena de pensamiento completa y accesible, pensada para depuracion y auditoria, no para mostrarse al usuario final.
- Function calling nativo y salidas estructuradas (structured outputs).
- Capacidades agenticas: navegacion web y ejecucion de codigo Python integradas en el flujo del modelo.
- Razonamiento multi-paso para tareas agenticas complejas.
- Fine-tuning completo de parametros para adaptacion a dominios especificos.
- Capacidades multilingues: no detalladas en la informacion disponible.

## Casos de uso

- Asistentes de codigo en local: el modelo puede generar y explicar codigo en un portatil o estacion de trabajo con 16 GB de memoria, usando Ollama o LM Studio, sin depender de una API externa y con la cadena de pensamiento visible para depuracion.
- Agentes autonomos con tool calling: gracias a su soporte nativo de function calling y salidas estructuradas, puede orquestar llamadas a APIs externas en flujos multi-paso, por ejemplo para consultar bases de datos y componer respuestas.
- Automatizacion de analisis de datos: la ejecucion de codigo Python integrada permite al modelo escribir y ejecutar scripts para procesar ficheros, calcular metricas y devolver resultados en una sola sesion.
- Navegacion web asistida: la capacidad de browsing nativa lo hace adecuado para tareas de extraccion y sintesis de informacion de paginas web dentro de un pipeline agentico.
- Despliegue en produccion de baja latencia: con 3,6 B de parametros activos y cuantizacion MXFP4, es apto para servir cargas interactivas en una unica GPU de 80 GB o en GPUs de consumo de gama alta, con vLLM como servidor compatible con la API de OpenAI.
- Fine-tuning para dominios verticales: al ser ajustable y tener licencia Apache 2.0, se puede especializar en sectores como legal, sanitario o financiero sin restricciones de copyleft.
- Prototipado e investigacion: la cadena de pensamiento completa y el esfuerzo de razonamiento configurable facilitan experimentos sobre el proceso de razonamiento de un modelo MoE abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada: aproximadamente 16 GB con la cuantizacion MXFP4 incluida en el modelo.
- GPU recomendadas: NVIDIA H100 o AMD MI300X (80 GB) para despliegue en produccion; tambien funciona en GPUs de consumo de gama alta con al menos 16 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090 o equivalentes), segun la model card.
- Opciones de despliegue: Transformers (pipeline o `transformers serve`), vLLM (version 0.10.1+gptoss con wheels especificos), Ollama (`ollama pull gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`) y las implementaciones de referencia en PyTorch/Triton del repositorio oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | 20,9 B | 3,6 B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| gpt-oss-120b | 117 B | 5,1 B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con gpt-oss-120b, el modelo mayor de la misma familia, orientado a produccion y razonamiento de alta exigencia en una unica GPU de 80 GB. No se dispone de datos de benchmarks ni de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato harmony; usarlo con otro formato de prompt produce resultados incorrectos.
- La cadena de pensamiento no esta pensada para mostrarse a usuarios finales y puede contener razonamientos internos no aptos para exposicion directa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas concretas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados, por lo que el rendimiento multilingue no esta garantizado.
- Longitud de contexto: no especificada, lo que impide planificar cargas con ventanas largas sin verificacion previa.
- Licencia Apache 2.0: permisiva para uso comercial, sin restricciones de copyleft, pero conviene revisar los terminos de uso aceptable de OpenAI para los pesos publicados.
- El repositorio consultado (lmsolo/gpt-oss-20b) es un espejo de terceros con cero descargas; para produccion conviene usar el repositorio oficial `openai/gpt-oss-20b`.

## Enlaces

- Repositorio consultado: https://huggingface.co/lmsolo/gpt-oss-20b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor de la familia: https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Paper (arXiv 2508.10925): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Sitio del proyecto: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Pagina de modelos abiertos de OpenAI: https://openai.com/open-models
