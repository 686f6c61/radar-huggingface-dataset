# chuvash-ai/LFM3-1.7B-chv-translator-v1-GGUF

## Resumen

El modelo `chuvash-ai/LFM3-1.7B-chv-translator-v1-GGUF` es la distribucion cuantizada del traductor bidireccional ruso-chuvasio desarrollado por chuvash-ai, un ajuste fino del modelo base LiquidAI LFM3-1.7B. Resuelve un problema de nicho pero critico: la traduccion automatica de calidad entre ruso y chuvasio, una lengua turquica minoritaria hablada por aproximadamente un millon de personas en la Republica de Chuvasia (Rusia) y que cuenta con escasos recursos computacionales en comparacion con lenguas mayoritarias.

El modelo parte de LFM3-1.7B, un transformer de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) desarrollado por Liquid AI, y ha sido especializado mediante ajuste fino para la tarea de traduccion. Esta version GGUF esta disenada para su despliegue mediante llama.cpp y LM Studio, con cuatro niveles de cuantizacion que van desde BF16 (~3,2 GB) hasta Q4_K_M (~1,1 GB), lo que permite ejecutarlo en hardware de consumo.

La relevancia de este modelo radica en su enfoque en una lengua de bajos recursos y en su empaquetado practico: la plantilla de chat LFM3 esta integrada en los metadatos del GGUF con `enable_thinking=false` por defecto, de modo que el modelo responde directamente en el campo `content` sin necesidad de gestionar etiquetas de razonamiento. La licencia heredada es LFM Open License v1.0, lo que impone condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3, arquitectura `lfm3` en llama.cpp) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor sugerido en el ejemplo de llama-server; no se especifica el maximo nativo) |
| Tipos de cuantizacion | BF16 (~3,2 GB), Q8_0 (~1,9 GB), Q6_K (~1,4 GB), Q4_K_M (~1,1 GB) |
| Idiomas soportados | Ruso (ru) y chuvasio (cv) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-1.7B-Base) |
| Formato de pesos | GGUF (repo original en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de Liquid AI, un transformer de aproximadamente 1,7 mil millones de parametros. No se dispone de informacion detallada en la documentacion proporcionada sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni la presencia de fases de RLHF o DPO en el ajuste fino. El modelo es un ajuste fino especializado del base LFM3-1.7B para traduccion bidireccional ruso-chuvasio, y la model card del repo original (con safetensors y metricas) se referencia como fuente principal de detalles tecnicos.

Una innovacion practica destacable es la integracion de la plantilla de chat LFM3 en los metadatos del GGUF con `enable_thinking=false` por defecto: el bloque de razonamiento vacio se cierra dentro del propio prompt, de modo que la respuesta llega directamente en el campo `content` sin necesidad de flags adicionales ni de parsear etiquetas `think`. La direccion de traduccion se controla mediante una instruccion en ruso en el mensaje de usuario («Переведи на чувашский язык.» o «Переведи на русский язык.») o mediante un system prompt con la misma instruccion; estas cadenas deben permanecer en ruso porque constituyen el formato exacto de entrenamiento.

## Capacidades

- Traduccion bidireccional ruso↔chuvasio, con la direccion determinada por instruccion explicita en ruso.
- Generacion de texto conversacional en formato chat (pipeline `translation`, tag `conversational`).
- Soporte de system prompt para fijar la direccion de traduccion de todos los mensajes de la conversacion.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp y LM Studio.
- Modo thinking desactivado por defecto en el template, con respuestas directas sin trazas de razonamiento.
- No se documentan capacidades de tool calling, agentes, vision, audio ni matematicas avanzadas.

## Casos de uso

- Traduccion de documentacion administrativa y oficial entre ruso y chuvasio: el modelo permite convertir textos institucionales de forma local, sin depender de servicios en la nube, gracias a su empaquetado GGUF y a su ejecucion en hardware de consumo.
- Localizacion de interfaces y contenidos web para la Republica de Chuvasia: con Q4_K_M (~1,1 GB) puede desplegarse en servidores modestos o incluso en equipos de desarrollo para traducir cadenas de texto de aplicaciones de forma iterativa.
- Preservacion linguistica y corpus paralelos: util para generar borradores de traduccion que luego revisa un hablante nativo, acelerando la creacion de material didactico y literario en chuvasio.
- Atencion al ciudadano bilingue: integrado en un chatbot con system prompt «Переведи на чувашский язык.», puede traducir consultas y respuestas en conversaciones multi-turno dentro de la ventana de contexto de 4096 tokens.
- Traduccion en el puesto de trabajo sin conexion: al ejecutarse con llama.cpp o LM Studio en local, es adecuado para entornos con requisitos de privacidad o sin acceso a internet, como oficinas publicas o centros educativos.
- Investigacion en traduccion automatica de lenguas de bajos recursos: sirve como linea base reproducible (cuantizaciones BF16 a Q4_K_M) para comparar tecnicas de ajuste fino en pares de idiomas con pocos datos.
- Procesamiento por lotes de correspondencia y actas: mediante `llama-server` con la API compatible con OpenAI (`/v1/chat/completions`), se puede integrar en pipelines que traduzcan volumenes moderados de texto con temperatura 0 para maximizar la consistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio principal (`chuvash-ai/LFM3-1.7B-chv-translator-v1`) para consultar las metricas, pero estos datos no se incluyen en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q4_K_M ~1,1 GB, Q6_K ~1,4 GB, Q8_0 ~1,9 GB, BF16 ~3,2 GB (mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para Q4_K_M o Q6_K; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto completo. En entornos profesionales, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM en cuantizaciones Q4_K_M y Q6_K; tambien puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server -m translator_v1_Q6_K.gguf --jinja -c 4096`), LM Studio (requiere Engine 2.65.1 o superior para soporte de la arquitectura `lfm3`), y cualquier runtime compatible con GGUF y plantillas Jinja.
- Parametros de generacion recomendados: greedy (temperature 0) o temperatura ≤0,3, `repeat_penalty` 1.08.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-chv-translator-v1 (este) | 1,73 B | 4096 (sugerido) | ru, cv | LFM Open License v1.0 | GGUF, safetensors |
| LFM3-1.7B-Base (LiquidAI) | ~1,7 B | no disponible | multilingue (no detallado) | LFM Open License v1.0 | safetensors |
| Otros traductores ru-cv especializados | no disponible | no disponible | ru, cv | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos especializados en traduccion ruso-chuvasio con los que establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo cubre el par ruso-chuvasio; no es un traductor multilingue general y su uso fuera de ese par no esta garantizado.
- Las instrucciones de direccion deben escribirse exactamente en ruso («Переведи на чувашский язык.» / «Переведи на русский язык.»); otras formulaciones pueden degradar el resultado o provocar que el modelo repita la entrada (sin instruccion, eco del input).
- Riesgo de alucinacion y de traducciones inexactas en terminologia especializada, nombres propios o textos legales, dado el limitado corpus disponible para una lengua de bajos recursos.
- La ventana de contexto practica sugerida es de 4096 tokens; textos largos deben dividirse en fragmentos.
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo en el enlace oficial antes de desplegarlo en produccion.
- Requiere LM Studio Engine 2.65.1 o superior para el soporte de la arquitectura `lfm3`; versiones anteriores no cargaran el modelo.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado como modelo orquestador en flujos agenticos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-translator-v1-GGUF
- Repositorio principal (safetensors y metricas): https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-translator-v1
- Licencia LFM Open License v1.0: https://liquid.ai/lfm-open-license
- Modelo base de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
